package com.esri.geoportal.service.stac.filter;

import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.tree.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Converts CQL2 queries (per your new grammar) into OpenSearch DSL.
 *
 * Supports:
 *  - Operator precedence: NOT > AND > OR
 *  - Comparison operators: =, >, <, >=, <=, !=
 *  - IN ( ... )
 *  - BETWEEN a AND b
 *  - LIKE 'pattern'     (% -> *, _ -> ?)
 *  - IS NULL / IS NOT NULL
 *  - Arrays: [1,2,3]
 *  - Spatial: T_INTERSECTS(field, 'WKT'), S_INTERSECTS(field, 'WKT') -> geo_shape (relation: intersects)
 */
public class CqlToOpenSearchConverter {

    private static final ObjectMapper mapper = new ObjectMapper();

    public String convertCqlToDsl(String cqlQuery) throws Exception {
        // --- Lex & Parse ---
        
    // Normalize TIMESTAMP('...') to plain ISO string literal before lexing
    String normalized = normalizeTimestampFunctions(cqlQuery);
    CharStream input = CharStreams.fromString(normalized);

        CQL2Lexer lexer = new CQL2Lexer(input);
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        CQL2Parser parser = new CQL2Parser(tokens);

        // entry rule
        ParseTree tree = parser.query();

        // --- Visit & build DSL ---
        ExpressionVisitor visitor = new ExpressionVisitor();
        Map<String, Object> dslQuery = visitor.visit(tree);

        // ensure minimum_should_match = 1 when top-level is only should
        ensureMinimumShouldMatch(dslQuery);

        return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(dslQuery);
    }

    private String normalizeTimestampFunctions(String q) {
  if (q == null) return null;
  java.util.regex.Pattern pTs =
      java.util.regex.Pattern.compile("(?i)\\bTIMESTAMP\\s*\\(\\s*'([^']+)'\\s*\\)");
  java.util.regex.Matcher mTs = pTs.matcher(q);
  String out = mTs.replaceAll("'$1'");

  // Optional: DATE('YYYY-MM-DD') -> 'YYYY-MM-DD'
  java.util.regex.Pattern pDate =
      java.util.regex.Pattern.compile("(?i)\\bDATE\\s*\\(\\s*'([^']+)'\\s*\\)");
  java.util.regex.Matcher mDate = pDate.matcher(out);
  out = mDate.replaceAll("'$1'");
  return out;
}

private void ensureMinimumShouldMatch(Map<String, Object> q) {
        if (q == null) return;
        Object boolObj = q.get("bool");
        if (!(boolObj instanceof Map)) return;
        Map<String, Object> bool = (Map<String, Object>) boolObj;
        boolean hasShould = bool.containsKey("should") && (bool.get("should") instanceof List) && !((List<?>) bool.get("should")).isEmpty();
        boolean hasMust = bool.containsKey("must") && (bool.get("must") instanceof List) && !((List<?>) bool.get("must")).isEmpty();
        boolean hasMustNot = bool.containsKey("must_not") && (bool.get("must_not") instanceof List) && !((List<?>) bool.get("must_not")).isEmpty();
        if (hasShould && !hasMust && !hasMustNot && !bool.containsKey("minimum_should_match")) {
            bool.put("minimum_should_match", 1);
        }
    }

    // ----------------------------
    // Helper builders (Java 8)
    // ----------------------------

    private static Map<String, Object> boolQuery(List<Map<String, Object>> must,
                                          List<Map<String, Object>> should,
                                          List<Map<String, Object>> mustNot) {
        Map<String, Object> bool = new LinkedHashMap<>();
        if (must != null && !must.isEmpty()) bool.put("must", must);
        if (should != null && !should.isEmpty()) {
            bool.put("should", should);
            bool.put("minimum_should_match", 1);
        }
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

    // Use ES "match" query for EQ comparisons (full-text / analyzed-friendly)
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
        // OpenSearch supports WKT; many deployments accept a string WKT or {"wkt": "..."}
        // We'll send the string WKT for simplicity.
        shapeSpec.put("shape", wkt);
        shapeSpec.put("relation", "intersects");

        Map<String, Object> fieldMap = new LinkedHashMap<>();
        fieldMap.put(field, shapeSpec);

        Map<String, Object> wrapper = new LinkedHashMap<>();
        wrapper.put("geo_shape", fieldMap);
        return wrapper;
    }

    /** Convert SQL LIKE to ES wildcard: % -> *, _ -> ?, with basic escaping */
    private static String sqlLikeToWildcard(String s) {
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
                // escape regex-ish special chars that wildcard treats specially except * and ?
                case '.': case '+': case '|': case '{': case '}':
                case '[': case ']': case '(': case ')': case '^':
                    out.append('\\').append(c);
                    break;
                default: out.append(c);
            }
        }
        return out.toString();
    }

    // ----------------------------
    // Visitor
    // ----------------------------
    static class ExpressionVisitor extends CQL2BaseVisitor<Map<String, Object>> {

        // Entry
        @Override
        public Map<String, Object> visitQuery(CQL2Parser.QueryContext ctx) {
            return visit(ctx.expression());
        }

        // OR-level
        @Override
        public Map<String, Object> visitOrExpr(CQL2Parser.OrExprContext ctx) {
            List<CQL2Parser.AndExprContext> parts = ctx.andExpr();
            if (parts.size() == 1) return visit(parts.get(0));

            List<Map<String, Object>> shouldClauses = new ArrayList<>();
            for (CQL2Parser.AndExprContext a : parts) {
                shouldClauses.add(visit(a));
            }
            return boolQuery(null, shouldClauses, null);
        }

        // AND-level
        @Override
        public Map<String, Object> visitAndExpr(CQL2Parser.AndExprContext ctx) {
            List<CQL2Parser.NotExprContext> parts = ctx.notExpr();
            if (parts.size() == 1) return visit(parts.get(0));

            List<Map<String, Object>> mustClauses = new ArrayList<>();
            for (CQL2Parser.NotExprContext n : parts) {
                mustClauses.add(visit(n));
            }
            return boolQuery(mustClauses, null, null);
        }

        // NOT-level
        @Override
        public Map<String, Object> visitNotExpr(CQL2Parser.NotExprContext ctx) {
            if (ctx.NOT() != null) {
                Map<String, Object> inner = visit(ctx.notExpr());
                return boolQuery(null, null, Collections.singletonList(inner));
            }
            return visit(ctx.primaryExpr());
        }

        // Parentheses or predicate
        @Override
        public Map<String, Object> visitPrimaryExpr(CQL2Parser.PrimaryExprContext ctx) {
            if (ctx.predicate() != null) return visit(ctx.predicate());
            return visit(ctx.expression()); // parentheses
        }

        // Predicate dispatch
        @Override
        public Map<String, Object> visitPredicate(CQL2Parser.PredicateContext ctx) {
            if (ctx.comparison() != null) return visit(ctx.comparison());
            if (ctx.inPredicate() != null) return visit(ctx.inPredicate());
            if (ctx.betweenPredicate() != null) return visit(ctx.betweenPredicate());
            if (ctx.likePredicate() != null) return visit(ctx.likePredicate());
            if (ctx.nullPredicate() != null) return visit(ctx.nullPredicate());
            if (ctx.spatialPredicate() != null) return visit(ctx.spatialPredicate());
            throw new IllegalStateException("Unknown predicate: " + ctx.getText());
        }

        // Comparisons
        @Override
        public Map<String, Object> visitComparison(CQL2Parser.ComparisonContext ctx) {
            Map<String, Object> left = evalValueExpr(ctx.valueExpr(0));
            String field = asField(left);

            Map<String, Object> right = evalValueExpr(ctx.valueExpr(1));
            Object value = extractLiteralOrIdentifierValue(right);

            String op = ctx.operator().getText();
            if ("=".equals(op)) {
                return matchQuery(field, value);
            } else if (">".equals(op)) {
                return rangeQuery(field, "gt", isIsoInstant(value) ? String.valueOf(value) : toNumber(value));
            } else if ("<".equals(op)) {
                return rangeQuery(field, "lt", isIsoInstant(value) ? String.valueOf(value) : toNumber(value));
            } else if (">=".equals(op)) {
                return rangeQuery(field, "gte", isIsoInstant(value) ? String.valueOf(value) : toNumber(value));
            } else if ("<=".equals(op)) {
                return rangeQuery(field, "lte", isIsoInstant(value) ? String.valueOf(value) : toNumber(value));
            } else if ("!=".equals(op)) {
                // represent as must_not term
                Map<String, Object> neq = termQuery(field, value);
                return boolQuery(null, null, Collections.singletonList(neq));
            }
            throw new UnsupportedOperationException("Operator not supported: " + op);
        }

        // IN (...)
        @Override
        public Map<String, Object> visitInPredicate(CQL2Parser.InPredicateContext ctx) {
            String field = asField(evalValueExpr(ctx.valueExpr()));
            List<Object> values = ctx.literalList().literal().stream()
                    .map(this::literalToJava)
                    .collect(Collectors.toList());
            return termsQuery(field, values);
        }

        // BETWEEN a AND b
        @Override
        public Map<String, Object> visitBetweenPredicate(CQL2Parser.BetweenPredicateContext ctx) {
            String field = asField(evalValueExpr(ctx.valueExpr(0)));
            Object lower = extractLiteralOrIdentifierValue(evalValueExpr(ctx.valueExpr(1)));
            Object upper = extractLiteralOrIdentifierValue(evalValueExpr(ctx.valueExpr(2)));
            Map<String, Object> rangeComp = new LinkedHashMap<>();
            rangeComp.put("gte", isIsoInstant(lower) ? String.valueOf(lower) : toNumber(lower));
            rangeComp.put("lte", isIsoInstant(upper) ? String.valueOf(upper) : toNumber(upper));
            Map<String, Object> inner = new LinkedHashMap<>();
            inner.put(field, rangeComp);
            Map<String, Object> wrapper = new LinkedHashMap<>();
            wrapper.put("range", inner);
            return wrapper;
        }

        // LIKE 'pattern'
        @Override
        public Map<String, Object> visitLikePredicate(CQL2Parser.LikePredicateContext ctx) {
            String field = asField(evalValueExpr(ctx.valueExpr()));
            String s = stripQuotes(ctx.STRING().getText());
            String pattern = sqlLikeToWildcard(s);
            return wildcardQuery(field, pattern);
        }

        // IS NULL / IS NOT NULL
        @Override
        public Map<String, Object> visitNullPredicate(CQL2Parser.NullPredicateContext ctx) {
            String field = asField(evalValueExpr(ctx.valueExpr()));
            boolean isNot = ctx.NOT() != null;
            Map<String, Object> exists = existsQuery(field);
            if (isNot) {
                // IS NOT NULL -> exists
                return exists;
            } else {
                // IS NULL -> must_not exists
                return boolQuery(null, null, Collections.singletonList(exists));
            }
        }

        // Spatial
        @Override
        public Map<String, Object> visitSpatialPredicate(CQL2Parser.SpatialPredicateContext ctx) {
            String field = asField(evalValueExpr(ctx.valueExpr()));
            String wkt = stripQuotes(ctx.STRING().getText());
            return geoShapeIntersectsQuery(field, wkt);
        }

        // ----------------------------
        // Value / arithmetic / arrays
        // ----------------------------
        private Map<String, Object> evalValueExpr(CQL2Parser.ValueExprContext ctx) {
            return evalArithmetic(ctx.arithmeticExpr());
        }

        private Map<String, Object> evalArithmetic(CQL2Parser.ArithmeticExprContext ctx) {
    // NEW: handle TIMESTAMP('...') function by reading raw text
    {
      String raw = ctx.getText();
      String ts = parseTimestampFunction(raw);
      if (ts != null) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("literal", ts);
        return m;
      }
    }

            // Array literal
            if (ctx.arrayExpr() != null) {
                List<Object> elements = new ArrayList<>();
                // Correct: arrayExpr directly contains 0..n literals (no literalList subrule)
                for (CQL2Parser.LiteralContext lit : ctx.arrayExpr().literal()) {
                    elements.add(literalToJava(lit));
                }
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("array", elements);
                return m;
            }
            // Identifier
            if (ctx.IDENTIFIER() != null) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("identifier", ctx.IDENTIFIER().getText());
                return m;
            }
            // Literal
            if (ctx.literal() != null) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("literal", literalToJava(ctx.literal()));
                return m;
            }
            // Parenthesized
            if (ctx.LPAREN() != null) {
                return evalArithmetic(ctx.arithmeticExpr(0));
            }
            // Binary arithmetic (+ - * /): return raw text (extend if you need evaluation)
            if (ctx.PLUS() != null || ctx.MINUS() != null || ctx.MUL() != null || ctx.DIV() != null) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("expr", ctx.getText());
                return m;
            }
            throw new IllegalStateException("Unknown arithmeticExpr: " + ctx.getText());
        }

        private String asField(Map<String, Object> v) {
            Object id = v.get("identifier");
            if (id == null) {
                throw new IllegalArgumentException("Expected identifier as field, got: " + v);
            }
            return id.toString();
        }

        private Object extractLiteralOrIdentifierValue(Map<String, Object> v) {
            if (v.containsKey("literal")) return v.get("literal");
            if (v.containsKey("identifier")) return v.get("identifier"); // allow identifier as value
            if (v.containsKey("array")) return v.get("array");
            if (v.containsKey("expr")) return v.get("expr");
            throw new IllegalArgumentException("Unsupported value expression: " + v);
        }

        private Object literalToJava(CQL2Parser.LiteralContext lit) {
            if (lit.STRING() != null) { String raw = lit.getText(); String ts = parseTimestampFunction(raw); if (ts != null) return ts; return stripQuotes(lit.STRING().getText()); }
            if (lit.NUMBER() != null) {
                String t = lit.NUMBER().getText();
                if (t.contains(".")) return Double.parseDouble(t);
                return Long.parseLong(t);
            }
            if (lit.TRUE() != null) return Boolean.TRUE;
            if (lit.FALSE() != null) return Boolean.FALSE;
            throw new IllegalStateException("Unknown literal: " + lit.getText());
        }

        private String stripQuotes(String s) {
            if (s == null || s.length() < 2) return s;
            if (s.charAt(0) == '\'' && s.charAt(s.length() - 1) == '\'') {
                String inner = s.substring(1, s.length() - 1);
                // basic unescape of \' and \\ 
                inner = inner.replace("\\'", "'").replace("\\\\", "\\");
                return inner;
            }
            return s;
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

     // NEW: datetime detection (ISO-8601). Accepts 'Z' and offset timestamps.
     private boolean isIsoInstant(Object v) {
       if (v == null) return false;
       String s = String.valueOf(v);
       try {
         java.time.OffsetDateTime.parse(s);
         return true;
       } catch (Exception e) {
         try {
           java.time.Instant.parse(s);
           return true;
         } catch (Exception ex) {
           return false;
         }
       }
     }

     // NEW: parse TIMESTAMP('...') literal text to ISO string
     private String parseTimestampFunction(String t) {
       if (t == null) return null;
       java.util.regex.Pattern p = java.util.regex.Pattern.compile(
           "^\\s*TIMESTAMP\\s*\\(\\s*'([^']+)'\\s*\\)\\s*$",
           java.util.regex.Pattern.CASE_INSENSITIVE);
       java.util.regex.Matcher m = p.matcher(t);
       if (m.find()) return m.group(1);
       return null;
     }

    }

    // ----------------------------
    // Quick manual tests
    // ----------------------------
    public static void main(String[] args) throws Exception {
        CqlToOpenSearchConverter converter = new CqlToOpenSearchConverter();

        List<String> tests = Arrays.asList(
            "xom:source_system = 'Marten' AND gsdb:status='active'",            
            "name LIKE 'Ankita%'",
            "tags IN ('infra','subcontract','india')",
            "age BETWEEN 18 AND 30 AND status IS NOT NULL",
            "T_INTERSECTS(location, 'POLYGON((77 28, 78 28, 78 29, 77 29, 77 28))')",
            "S_INTERSECTS(geom, 'LINESTRING(0 0, 1 1)')",
            "temperature >= 10 AND temperature <= 20",
            "datetime >=TIMESTAMP('2021-04-08T04:39:23Z')");

        for (String cql : tests) {
            System.out.println("CQL: " + cql);
            System.out.println(converter.convertCqlToDsl(cql));
            System.out.println("----");
        }
    }
}