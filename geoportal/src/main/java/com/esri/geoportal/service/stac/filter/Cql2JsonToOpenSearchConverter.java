package com.esri.geoportal.service.stac.filter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Converts a CQL2-JSON AST (as produced by a CQL2->JSON emitter) into
 * an OpenSearch DSL query represented as a Map which can be serialized
 * with Jackson. This converter does not rely on the ANTLR JSON parser
 * but instead consumes the JSON AST structure directly using Jackson.
 *
 * The converter recognises a small set of common CQL2-JSON node shapes
 * (Comparison, And, Or, Not, In, Between, Like, IsNull, T_INTERSECTS, S_INTERSECTS,
 * Identifier, Literal, Array) and maps them to appropriate OpenSearch
 * query objects. Extend the node handlers if your CQL2-JSON has other shapes.
 */
public class Cql2JsonToOpenSearchConverter {

    private static final ObjectMapper mapper = new ObjectMapper();

    public String convertJsonAstToDsl(String jsonAst) throws Exception {
        Map<String, Object> root = mapper.readValue(jsonAst, new TypeReference<Map<String, Object>>() {});
        // Support two AST shapes: the CQL2-JSON shape (objects with a "type" field)
        // and a compact shape that uses {"filter":{"op":"and","args":[...]}} where nodes use "op" and "args".
        Object startNode = root;
        if (root.containsKey("filter")) startNode = root.get("filter");
        Map<String, Object> dsl = visitNode(startNode);
        ensureMinimumShouldMatch(dsl);
        return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(dsl);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> visitNode(Object nodeObj) {
        if (nodeObj == null) return null;
        if (nodeObj instanceof Map) {
            Map<String, Object> node = (Map<String, Object>) nodeObj;
            // New: support "op" style nodes (compact AST)
            if (node.containsKey("op")) return visitOpNode(node);

            Object t = node.get("type");
            if (t == null) throw new IllegalArgumentException("Missing 'type' in AST node: " + node);
            String type = String.valueOf(t);
            switch (type) {
                case "And": return visitAnd(node);
                case "Or": return visitOr(node);
                case "Not": return visitNot(node);
                case "Comparison": return visitComparison(node);
                case "In": return visitIn(node);
                case "Between": return visitBetween(node);
                case "Like": return visitLike(node);
                case "IsNull": return visitIsNull(node);
                case "T_INTERSECTS": case "S_INTERSECTS": return visitSpatial(node);
                case "Identifier": {
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("identifier", node.get("name"));
                    return m;
                }
                case "Literal": {
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("literal", node.get("value"));
                    return m;
                }
                case "Array": {
                    Object els = node.get("elements");
                    List<Object> out = new ArrayList<>();
                    if (els instanceof List) {
                        for (Object e : (List<?>) els) {
                            if (e instanceof Map) {
                                Map<String,Object> lit = (Map<String,Object>) e;
                                if ("Literal".equals(lit.get("type"))) out.add(lit.get("value"));
                                else out.add(visitNode(e));
                            } else out.add(e);
                        }
                    }
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("array", out);
                    return m;
                }
                default:
                    throw new IllegalArgumentException("Unsupported AST node type: " + type + " -> " + node);
            }
        }
        throw new IllegalArgumentException("Unsupported AST node shape: " + nodeObj);
    }

    // New: visit nodes shaped as {"op":"and","args":[...]} (compact form)
    @SuppressWarnings("unchecked")
    private Map<String, Object> visitOpNode(Object nodeObj) {
        if (nodeObj == null) return null;
        if (!(nodeObj instanceof Map)) throw new IllegalArgumentException("Expected map-shaped op node, got: " + nodeObj);
        Map<String,Object> node = (Map<String,Object>) nodeObj;
        Object opObj = node.get("op");
        if (opObj == null) throw new IllegalArgumentException("Missing 'op' in op-node: " + node);
        String op = String.valueOf(opObj).toLowerCase(Locale.ROOT);
        Object argsObj = node.get("args");
        List<?> args = argsObj instanceof List ? (List<?>) argsObj : Collections.emptyList();
        switch (op) {
            case "and": {
                List<Map<String,Object>> must = new ArrayList<>();
                for (Object a : args) must.add(visitNode(a));
                return boolQuery(must, null, null);
            }
            case "or": {
                List<Map<String,Object>> should = new ArrayList<>();
                for (Object a : args) should.add(visitNode(a));
                return boolQuery(null, should, null);
            }
            case "not": {
                if (args.isEmpty()) throw new IllegalArgumentException("Not operator requires one arg: " + node);
                Map<String,Object> inner = visitNode(args.get(0));
                return boolQuery(null, null, Collections.singletonList(inner));
            }
            // comparisons
            case "=": case "eq": {
                if (args.size() < 2) throw new IllegalArgumentException("'=' requires two args: " + node);
                String field = asFieldFromArg(args.get(0));
                Object value = extractValueFromArg(args.get(1));
                return matchQuery(field, value);
            }
            case "!=": case "ne": {
                if (args.size() < 2) throw new IllegalArgumentException("'!=' requires two args: " + node);
                String field = asFieldFromArg(args.get(0));
                Object value = extractValueFromArg(args.get(1));
                return boolQuery(null, null, Collections.singletonList(termQuery(field, value)));
            }
            case ">": case "gt": {
                String field = asFieldFromArg(args.get(0));
                Object value = extractValueFromArg(args.get(1));
                return rangeQuery(field, "gt", toNumber(value));
            }
            case "<": case "lt": {
                String field = asFieldFromArg(args.get(0));
                Object value = extractValueFromArg(args.get(1));
                return rangeQuery(field, "lt", toNumber(value));
            }
            case ">=": case "ge": {
                String field = asFieldFromArg(args.get(0));
                Object value = extractValueFromArg(args.get(1));
                return rangeQuery(field, "gte", toNumber(value));
            }
            case "<=": case "le": {
                String field = asFieldFromArg(args.get(0));
                Object value = extractValueFromArg(args.get(1));
                return rangeQuery(field, "lte", toNumber(value));
            }
            case "in": {
                String field = asFieldFromArg(args.get(0));
                Object listArg = args.get(1);
                List<Object> values = new ArrayList<>();
                if (listArg instanceof List) {
                    values.addAll((List<?>) listArg);
                } else if (listArg instanceof Map) {
                    // maybe an array-shaped node
                    Map<String,Object> v = visitNode(listArg);
                    Object arr = v.get("array");
                    if (arr instanceof List) values.addAll((List<?>) arr);
                }
                return termsQuery(field, values);
            }
            case "between": {
                String field = asFieldFromArg(args.get(0));
                Object low = extractValueFromArg(args.get(1));
                Object high = extractValueFromArg(args.get(2));
                Map<String,Object> rangeComp = new LinkedHashMap<>();
                rangeComp.put("gte", toNumber(low));
                rangeComp.put("lte", toNumber(high));
                Map<String,Object> inner = new LinkedHashMap<>();
                inner.put(field, rangeComp);
                Map<String,Object> wrapper = new LinkedHashMap<>();
                wrapper.put("range", inner);
                return wrapper;
            }
            case "like": {
                String field = asFieldFromArg(args.get(0));
                Object p = args.get(1);
                String s = String.valueOf(p);
                String pattern = sqlLikeToWildcard(s);
                return wildcardQuery(field, pattern);
            }
            case "isnull": case "is_null": {
                String field = asFieldFromArg(args.get(0));
                boolean not = false;
                if (args.size() > 1) {
                    Object maybeNot = args.get(1);
                    if (maybeNot instanceof Boolean) not = (Boolean) maybeNot;
                }
                Map<String,Object> exists = existsQuery(field);
                return not ? exists : boolQuery(null, null, Collections.singletonList(exists));
            }
            default:
                throw new IllegalArgumentException("Unsupported op in op-node: " + op + " -> " + node);
        }
    }

    private String asFieldFromArg(Object arg) {
        if (arg == null) throw new IllegalArgumentException("Expected field arg, got null");
        if (arg instanceof Map) {
            Map<?,?> m = (Map<?,?>) arg;
            if (m.containsKey("property")) return String.valueOf(m.get("property"));
            // fall back to CQL2-JSON identifier shape
            if (m.containsKey("type") && "Identifier".equals(m.get("type"))) return String.valueOf(m.get("name"));
            // maybe already converted by visitNode
            if (m.containsKey("identifier")) return String.valueOf(m.get("identifier"));
        }
        // if arg is raw string, assume it's a property name
        if (arg instanceof String) return (String) arg;
        throw new IllegalArgumentException("Unsupported field arg: " + arg);
    }

    @SuppressWarnings("unchecked")
    private Object extractValueFromArg(Object arg) {
        if (arg == null) return null;
        if (arg instanceof Map) {
            Map<String,Object> m = (Map<String,Object>) arg;
            if (m.containsKey("property")) return m.get("property");
            if (m.containsKey("value")) return m.get("value");
            if (m.containsKey("literal")) return m.get("literal");
            if (m.containsKey("array")) return m.get("array");
            // maybe nested op node
            if (m.containsKey("op")) {
                Map<String,Object> nested = visitOpNode(m);
                return nested;
            }
            // maybe identifier shape
            if (m.containsKey("type")) {
                Map<String,Object> res = visitNode(m);
                return extractLiteralOrIdentifierValue(res);
            }
            // fallback to returning the map itself
            return m;
        }
        // primitive (String, Number, Boolean)
        return arg;
    }

    // Node handlers
    private Map<String,Object> visitAnd(Map<String,Object> node) {
        List<?> clauses = (List<?>) node.get("clauses");
        List<Map<String,Object>> must = new ArrayList<>();
        for (Object c : clauses) must.add(visitNode(c));
        return boolQuery(must, null, null);
    }

    private Map<String,Object> visitOr(Map<String,Object> node) {
        List<?> clauses = (List<?>) node.get("clauses");
        List<Map<String,Object>> should = new ArrayList<>();
        for (Object c : clauses) should.add(visitNode(c));
        return boolQuery(null, should, null);
    }

    private Map<String,Object> visitNot(Map<String,Object> node) {
        Object c = node.get("clause");
        Map<String,Object> inner = visitNode(c);
        return boolQuery(null, null, Collections.singletonList(inner));
    }

    private Map<String,Object> visitComparison(Map<String,Object> node) {
        String op = String.valueOf(node.get("operator"));
        Map<String,Object> left = visitNode(node.get("left"));
        Map<String,Object> right = visitNode(node.get("right"));
        String field = asField(left);
        Object value = extractLiteralOrIdentifierValue(right);
        switch (op) {
            case "=": return matchQuery(field, value);
            case "!=": return boolQuery(null, null, Collections.singletonList(termQuery(field, value)));
            case ">": return rangeQuery(field, "gt", toNumber(value));
            case "<": return rangeQuery(field, "lt", toNumber(value));
            case ">=": return rangeQuery(field, "gte", toNumber(value));
            case "<=": return rangeQuery(field, "lte", toNumber(value));
            default: throw new IllegalArgumentException("Unsupported operator: " + op);
        }
    }

    private Map<String,Object> visitIn(Map<String,Object> node) {
        Map<String,Object> value = visitNode(node.get("value"));
        String field = asField(value);
        List<Object> values = new ArrayList<>();
        Object vs = node.get("values");
        if (vs instanceof List) {
            for (Object o : (List<?>) vs) {
                if (o instanceof Map) {
                    @SuppressWarnings("unchecked")
					Map<String,Object> m = (Map<String,Object>) o;
                    if ("Literal".equals(m.get("type"))) values.add(m.get("value"));
                    else values.add(extractLiteralOrIdentifierValue(visitNode(o)));
                } else values.add(o);
            }
        }
        return termsQuery(field, values);
    }

    private Map<String,Object> visitBetween(Map<String,Object> node) {
        Map<String,Object> value = visitNode(node.get("value"));
        String field = asField(value);
        Object low = extractLiteralOrIdentifierValue(visitNode(node.get("low")));
        Object high = extractLiteralOrIdentifierValue(visitNode(node.get("high")));
        Map<String,Object> rangeComp = new LinkedHashMap<>();
        rangeComp.put("gte", toNumber(low));
        rangeComp.put("lte", toNumber(high));
        Map<String,Object> inner = new LinkedHashMap<>();
        inner.put(field, rangeComp);
        Map<String,Object> wrapper = new LinkedHashMap<>();
        wrapper.put("range", inner);
        return wrapper;
    }

    private Map<String,Object> visitLike(Map<String,Object> node) {
        Map<String,Object> value = visitNode(node.get("value"));
        String field = asField(value);
        Object p = node.get("pattern");
        String s = String.valueOf(p);
        String pattern = sqlLikeToWildcard(s);
        return wildcardQuery(field, pattern);
    }

    private Map<String,Object> visitIsNull(Map<String,Object> node) {
        Map<String,Object> value = visitNode(node.get("value"));
        String field = asField(value);
        boolean not = Boolean.TRUE.equals(node.get("not"));
        Map<String,Object> exists = existsQuery(field);
        return not ? exists : boolQuery(null, null, Collections.singletonList(exists));
    }

    private Map<String,Object> visitSpatial(Map<String,Object> node) {
        Map<String,Object> value = visitNode(node.get("value"));
        String field = asField(value);
        Object w = node.get("wkt");
        String wkt = w == null ? null : String.valueOf(w);
        return geoShapeIntersectsQuery(field, wkt);
    }

    // ----------------------------
    // Utility builders (copied minimal set from existing converter)
    // ----------------------------
    private static Map<String, Object> boolQuery(List<Map<String, Object>> must,
                                                 List<Map<String, Object>> should,
                                                 List<Map<String, Object>> mustNot) {
        Map<String, Object> bool = new LinkedHashMap<>();
        if (must != null && !must.isEmpty()) bool.put("must", must);
        if (should != null && !should.isEmpty()) bool.put("should", should);
        if (mustNot != null && !mustNot.isEmpty()) bool.put("must_not", mustNot);
        Map<String, Object> wrapper = new LinkedHashMap<>();
        wrapper.put("bool", bool);
        return wrapper;
    }

    private static Map<String, Object> termQuery(String field, Object value) {
        Map<String, Object> inner = new LinkedHashMap<>();
        inner.put(field, value);
        Map<String, Object> wrapper = new LinkedHashMap<>();
        wrapper.put("term", inner);
        return wrapper;
    }

    private static Map<String, Object> matchQuery(String field, Object value) {
        Map<String, Object> inner = new LinkedHashMap<>();
        inner.put(field, value);
        Map<String, Object> wrapper = new LinkedHashMap<>();
        wrapper.put("match", inner);
        return wrapper;
    }

    private static Map<String, Object> termsQuery(String field, List<Object> values) {
        Map<String, Object> inner = new LinkedHashMap<>();
        inner.put(field, values);
        Map<String, Object> wrapper = new LinkedHashMap<>();
        wrapper.put("terms", inner);
        return wrapper;
    }

    private static Map<String, Object> rangeQuery(String field, String comparator, Object value) {
        Map<String, Object> comp = new LinkedHashMap<>();
        comp.put(comparator, value);
        Map<String, Object> inner = new LinkedHashMap<>();
        inner.put(field, comp);
        Map<String, Object> wrapper = new LinkedHashMap<>();
        wrapper.put("range", inner);
        return wrapper;
    }

    private static Map<String, Object> existsQuery(String field) {
        Map<String, Object> inner = new LinkedHashMap<>();
        inner.put("field", field);
        Map<String, Object> wrapper = new LinkedHashMap<>();
        wrapper.put("exists", inner);
        return wrapper;
    }

    private static Map<String, Object> wildcardQuery(String field, String pattern) {
        Map<String, Object> inner = new LinkedHashMap<>();
        inner.put(field, pattern);
        Map<String, Object> wrapper = new LinkedHashMap<>();
        wrapper.put("wildcard", inner);
        return wrapper;
    }

    private static Map<String, Object> geoShapeIntersectsQuery(String field, String wkt) {
        Map<String, Object> shapeSpec = new LinkedHashMap<>();
        shapeSpec.put("shape", wkt);
        shapeSpec.put("relation", "intersects");
        Map<String, Object> fieldMap = new LinkedHashMap<>();
        fieldMap.put(field, shapeSpec);
        Map<String, Object> wrapper = new LinkedHashMap<>();
        wrapper.put("geo_shape", fieldMap);
        return wrapper;
    }

    private static String sqlLikeToWildcard(String s) {
        if (s == null) return null;
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '%': out.append('*'); break;
                case '_': out.append('?'); break;
                case '\\':
                    if (i + 1 < s.length()) {
                        out.append('\\').append(s.charAt(++i));
                    } else {
                        out.append('\\');
                    }
                    break;
                default: out.append(c);
            }
        }
        return out.toString();
    }

    private String asField(Map<String,Object> v) {
        Object id = v.get("identifier");
        if (id == null) throw new IllegalArgumentException("Expected identifier as field, got: " + v);
        return id.toString();
    }

    private Object extractLiteralOrIdentifierValue(Map<String,Object> v) {
        if (v == null) return null;
        if (v.containsKey("literal")) return v.get("literal");
        if (v.containsKey("identifier")) return v.get("identifier");
        if (v.containsKey("array")) return v.get("array");
        if (v.containsKey("expr")) return v.get("expr");
        throw new IllegalArgumentException("Unsupported value expression: " + v);
    }

    private Number toNumber(Object v) {
        if (v instanceof Number) return (Number) v;
        String s = String.valueOf(v);
        try {
            if (s.contains(".")) return Double.parseDouble(s);
            return Long.parseLong(s);
        } catch (Exception e) {
            throw new IllegalArgumentException("Expected numeric value, got: " + v);
        }
    }

    @SuppressWarnings("unchecked")
    private void ensureMinimumShouldMatch(Map<String,Object> q) {
        if (q == null) return;
        Object boolObj = q.get("bool");
        if (!(boolObj instanceof Map)) return;
        Map<String,Object> bool = (Map<String,Object>) boolObj;
        boolean hasShould = bool.containsKey("should") && (bool.get("should") instanceof List) && !((List<?>) bool.get("should")).isEmpty();
        boolean hasMust = bool.containsKey("must") && (bool.get("must") instanceof List) && !((List<?>) bool.get("must")).isEmpty();
        boolean hasMustNot = bool.containsKey("must_not") && (bool.get("must_not") instanceof List) && !((List<?>) bool.get("must_not")).isEmpty();
        if (hasShould && !hasMust && !hasMustNot && !bool.containsKey("minimum_should_match")) {
            bool.put("minimum_should_match", 1);
        }
    }

    // quick manual test helper
    public static void main(String[] args) throws Exception {
        Cql2JsonToOpenSearchConverter c = new Cql2JsonToOpenSearchConverter();
        String json1 = "{\"filter\":{\"op\":\"and\",\"args\":[{\"op\":\"=\",\"args\":[{\"property\":\"xom_source_system_s\"},\"Marten\"]},{\"op\":\"=\",\"args\":[{\"property\":\"xom_edp_equip_id_s\"},\"test-point1-geom\"]}]}}";
        //String js = "{\"type\":\"And\",\"clauses\":[{\"type\":\"Comparison\",\"operator\":\"=\",\"left\":{\"type\":\"Identifier\",\"name\":\"status\"},\"right\":{\"type\":\"Literal\",\"value\":\"active\"}},{\"type\":\"Between\",\"value\":{\"type\":\"Identifier\",\"name\":\"age\"},\"low\":{\"type\":\"Literal\",\"value\":18},\"high\":{\"type\":\"Literal\",\"value\":30}}]}";
        System.out.println(c.convertJsonAstToDsl(json1));
    }
}
