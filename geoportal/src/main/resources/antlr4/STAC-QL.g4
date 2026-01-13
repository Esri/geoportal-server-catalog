// StacQL.g4
// ANTLR4 grammar for the STAC API Query Extension (aka STAC-QL)
// Source spec: https://github.com/stac-api-extensions/query
// This grammar parses the JSON object used for the `query` field, e.g.:
// {
//   "eo:cloud_cover": { "lte": 10 },
//   "proj:epsg": { "eq": 4326 },
//   "gh:keywords": { "in": ["landsat", "modis"] }
// }
//
// Notes:
//  - The grammar enforces allowed operator keys: eq, neq, lt, lte, gt, gte,
//    startsWith, endsWith, contains, in.
//  - Value constraints:
//      * eq/neq/lt/lte/gt/gte accept JSON scalars (string, number, boolean, null).
//      * startsWith/endsWith/contains accept STRING values.
//      * in accepts an ARRAY of JSON scalars.
//  - Property names are any JSON STRING; no restrictions are imposed here.
//  - Whitespace is skipped.
//
// License: Apache-2.0 (matches the STAC-QL repo license)
// -----------------------------------------------------

grammar StacQL;

// ----------------------
// Parser rules
// ----------------------

// Entry point: a STAC-QL query object
stacql
  : object EOF
  ;

// A JSON object consisting of one or more property filters
object
  : LBRACE propertyFilter (COMMA propertyFilter)* RBRACE
  ;

// A property name mapped to an operator object
propertyFilter
  : STRING COLON operatorObject
  ;

// An object that contains one or more operator entries
operatorObject
  : LBRACE operatorEntry (COMMA operatorEntry)* RBRACE
  ;

// Allowed operators and their value types
operatorEntry
  : IN COLON arrayValue                                   // in: array of scalars
  | (EQ | NEQ | LT | LTE | GT | GTE) COLON jsonValue      // numeric/string/bool/null
  | (STARTS_WITH | ENDS_WITH | CONTAINS) COLON STRING     // string-only operators
  ;

// A JSON scalar value
jsonValue
  : STRING
  | NUMBER
  | TRUE
  | FALSE
  | NULL
  ;

// A JSON array of scalar values (used for `in` operator)
arrayValue
  : LBRACKET (jsonValue (COMMA jsonValue)*)? RBRACKET
  ;

// ----------------------
// Lexer rules
// ----------------------

// Punctuation
LBRACE   : '{';
RBRACE   : '}';
LBRACKET : '[';
RBRACKET : ']';
COLON    : ':';
COMMA    : ',' ;

// Literals
TRUE     : 'true';
FALSE    : 'false';
NULL     : 'null';

// Operator keys must be matched BEFORE generic STRING to avoid token conflicts
EQ          : '"eq"';
NEQ         : '"neq"';
LT          : '"lt"';
LTE         : '"lte"';
GT          : '"gt"';
GTE         : '"gte"';
STARTS_WITH : '"startsWith"';
ENDS_WITH   : '"endsWith"';
CONTAINS    : '"contains"';
IN          : '"in"';

// Generic JSON string
STRING
  : '"' (ESC | ~["\\\r\n])* '"'
  ;

fragment ESC
  : '\\' (["\\/bfnrt] | UNICODE)
  ;
fragment UNICODE
  : 'u' HEX HEX HEX HEX
  ;
fragment HEX
  : [0-9a-fA-F]
  ;

// JSON number (simplified but sufficient for typical STAC values)
NUMBER
  : '-'? INT (FRAC)? (EXP)?
  ;
fragment INT
  : '0' | [1-9] [0-9]*
  ;
fragment FRAC
  : '.' [0-9]+
  ;
fragment EXP
  : [Ee] [+-]? [0-9]+
  ;

// Whitespace
WS : [ \t\r\n]+ -> skip ;
