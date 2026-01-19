package com.esri.geoportal.service.stac.filter;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.Iterator;
import java.util.Map;

public class CqlQueryToOpenSearchConverter {

    private final ObjectMapper mapper = new ObjectMapper();

    // Configuration: use keyword subfield for string-based queries
    private final boolean useKeywordSubfield;
    private final String keywordSuffix;

    public CqlQueryToOpenSearchConverter() {
        this(true, ".keyword");
    }

    public CqlQueryToOpenSearchConverter(boolean useKeywordSubfield, String keywordSuffix) {
        this.useKeywordSubfield = useKeywordSubfield;
        this.keywordSuffix = keywordSuffix;
    }

    /**
     * Accepts either:
     *  - the whole object containing {"query": {...}} or
     *  - the inner {...} object directly (your operators).
     *
     * Returns an ES Query DSL JSON string:
     * {
     *   "query": {
     *     "bool": { "must": [ ... ] }
     *   }
     * }
     */
    public String convert(String inputJson) throws JsonProcessingException {
        JsonNode root = mapper.readTree(inputJson);
        JsonNode q = root.has("query") ? root.get("query") : root;

        ObjectNode esQuery = buildBoolMustQuery(q);
        return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(esQuery);
    }

    private ObjectNode buildBoolMustQuery(JsonNode queryNode) {
        ObjectNode root = mapper.createObjectNode();
        ObjectNode query = mapper.createObjectNode();
        ObjectNode bool = mapper.createObjectNode();
        ArrayNode must = mapper.createArrayNode();

        if (queryNode != null && queryNode.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = queryNode.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                String field = entry.getKey();
                JsonNode spec = entry.getValue();

                if (!spec.isObject()) {
                    // If someone gave a direct value, treat as equals/match
                    must.add(buildMatch(field, spec));
                    continue;
                }

                // Collect sub-operators for this field
                boolean hasRange = spec.has("gte") || spec.has("lte") || spec.has("gt") || spec.has("lt");
                boolean hasIn = spec.has("in");
                boolean hasStarts = spec.has("startsWith");
                boolean hasEnds = spec.has("endsWith");
                boolean hasContains = spec.has("contains");
                boolean hasEq = spec.has("eq") || spec.has("equals");

                // Range
                if (hasRange) {
                    must.add(buildRange(field, spec));
                }

                // Terms (in)
                if (hasIn) {
                    must.add(buildTerms(field, spec.get("in")));
                }

                // Equality
                if (hasEq) {
                    JsonNode val = spec.has("eq") ? spec.get("eq") : spec.get("equals");
                    must.add(buildMatch(field, val));
                }

                // String pattern operators: startsWith / endsWith / contains
                if (hasStarts || hasEnds || hasContains) {
                    must.add(buildWildcardFromParts(field,
                            getTextOrNull(spec, "startsWith"),
                            getTextOrNull(spec, "contains"),
                            getTextOrNull(spec, "endsWith")));
                }
            }
        }

        if (must.isEmpty()) {
            // Fallback to match_all if nothing was produced
            query.set("match_all", mapper.createObjectNode());
        } else {
            bool.set("must", must);
            query.set("bool", bool);
        }        
        return query;
    }

    private ObjectNode buildRange(String field, JsonNode spec) {
        ObjectNode rangeWrapper = mapper.createObjectNode();
        ObjectNode range = mapper.createObjectNode();
        ObjectNode body = mapper.createObjectNode();

        if (spec.has("gt")) body.set("gt", spec.get("gt"));
        if (spec.has("gte")) body.set("gte", spec.get("gte"));
        if (spec.has("lt")) body.set("lt", spec.get("lt"));
        if (spec.has("lte")) body.set("lte", spec.get("lte"));

        range.set(field, body);
        rangeWrapper.set("range", range);
        return rangeWrapper;
    }

    private ObjectNode buildTerms(String field, JsonNode valuesArray) {
        String targetField = maybeKeyword(field);
        ObjectNode wrapper = mapper.createObjectNode();
        ObjectNode terms = mapper.createObjectNode();

        if (valuesArray != null && valuesArray.isArray()) {
            terms.set(targetField, valuesArray);
        } else {
            // Graceful fallback: wrap single value into array
            ArrayNode arr = mapper.createArrayNode();
            if (valuesArray != null) arr.add(valuesArray.asText());
            terms.set(targetField, arr);
        }
        wrapper.set("terms", terms);
        return wrapper;
    }

    private ObjectNode buildMatch(String field, JsonNode value) {
        String targetField = maybeKeyword(field);
        ObjectNode wrapper = mapper.createObjectNode();
        ObjectNode term = mapper.createObjectNode();

        // If value is non-primitive, try to stringify; else set directly
        if (value != null && (value.isTextual() || value.isNumber() || value.isBoolean())) {
            term.set(targetField, value);
        } else if (value != null) {
            term.put(targetField, value.asText());
        } else {
            term.putNull(targetField);
        }

        wrapper.set("match", term);
        return wrapper;
    }

    /**
     * Compose one wildcard out of optional parts:
     *   startsWith + (contains) + endsWith  -> "starts*contains*ends"
     * If only startsWith -> prefix query
     * If only endsWith   -> wildcard "*ends"
     * If only contains   -> wildcard "*contains*"
     */
    private ObjectNode buildWildcardFromParts(String field, String starts, String contains, String ends) {
        String targetField = maybeKeyword(field);

        if (starts != null && contains == null && ends == null) {
            // Use prefix query for pure startsWith
            ObjectNode wrapper = mapper.createObjectNode();
            ObjectNode prefix = mapper.createObjectNode();
            prefix.put(targetField, escapeForPrefix(starts));
            wrapper.set("prefix", prefix);
            return wrapper;
        }

        // Build a single wildcard pattern concatenating all available parts
        StringBuilder pattern = new StringBuilder();
        if (starts != null) pattern.append(escapeForWildcard(starts)).append('*');
        if (contains != null) pattern.append(escapeForWildcard(contains)).append('*');
        if (ends != null) {
            // remove trailing '*' if already appended, then add endswithout trailing star
            int len = pattern.length();
            if (len > 0 && pattern.charAt(len - 1) == '*') {
                // keep it; we want "*...*ends" if there was a prior piece
            }
            pattern.append(escapeForWildcard(ends));
        } else {
            // if we had any preceding segment and no explicit ends, ensure trailing star
            if (pattern.length() > 0 && pattern.charAt(pattern.length() - 1) != '*') {
                pattern.append('*');
            }
        }

        // If nothing set (shouldn't happen), treat as match_all
        if (pattern.length() == 0) {
            ObjectNode wrapper = mapper.createObjectNode();
            wrapper.set("match_all", mapper.createObjectNode());
            return wrapper;
        }

        ObjectNode wrapper = mapper.createObjectNode();
        ObjectNode wildcard = mapper.createObjectNode();
        wildcard.put(targetField, pattern.toString());
        wrapper.set("wildcard", wildcard);
        return wrapper;
    }

    private String getTextOrNull(JsonNode node, String field) {
        return node.has(field) && !node.get(field).isNull() ? node.get(field).asText() : null;
    }

    private String maybeKeyword(String field) {
        if (!useKeywordSubfield) return field;
        // Heuristic: only append .keyword if not already a multi-field
        if (field.endsWith(keywordSuffix)) return field;
        return field + keywordSuffix;
    }

    private String escapeForWildcard(String s) {
        // Escape reserved wildcard chars for ES wildcard query: *, ?, \
        // and keep others as-is. We do NOT escape '*' we add ourselves as operator.
        StringBuilder out = new StringBuilder(s.length());
        for (char c : s.toCharArray()) {
            if (c == '*' || c == '?' || c == '\\') {
                out.append('\\');
            }
            out.append(c);
        }
        return out.toString();
    }

    private String escapeForPrefix(String s) {
        // Prefix query takes a string; no wildcard operators are needed,
        // but we still escape backslashes to be safe.
        StringBuilder out = new StringBuilder(s.length());
        for (char c : s.toCharArray()) {
            if (c == '\\') {
                out.append('\\');
            }
            out.append(c);
        }
        return out.toString();
    }

    // --- Demo ---
    public static void main(String[] args) throws Exception {
        String input = "{\n" +
                "  \"query\": {\n" +
                "    \"eo:cloud_cover\": { \"gte\": 0, \"lte\": 10 },\n" +
                "    \"stringAttr1\": { \"startsWith\": \"abc\", \"endsWith\": \"xyz\" },\n" +
                "    \"stringAttr1\": { \"eq\": \"abc\"},\n" +
                "    \"stringAttr2\": { \"contains\": \"mnop\" },\n" +
                "    \"stringAttr3\": { \"in\": [\"landsat\", \"modis\", \"naip\"] }\n" +
                "  }\n" +
                "}";

        CqlQueryToOpenSearchConverter converter = new CqlQueryToOpenSearchConverter(false, ".keyword");
        String es = converter.convert(input);
        System.out.println(es);
    }
}
