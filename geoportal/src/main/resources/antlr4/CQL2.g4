grammar CQL2;

// ---------------- Parser Rules ----------------

query
    : expression EOF
    ;

// Operator precedence: OR lowest, AND middle, NOT highest
expression
    : orExpr
    ;

orExpr
    : andExpr (OR andExpr)*
    ;

andExpr
    : notExpr (AND notExpr)*
    ;

notExpr
    : NOT notExpr
    | primaryExpr
    ;

primaryExpr
    : LPAREN expression RPAREN
    | predicate
    ;

predicate
    : comparison
    | inPredicate
    | betweenPredicate
    | likePredicate
    | nullPredicate
    | spatialPredicate
    ;

comparison
    : valueExpr operator valueExpr
    ;

inPredicate
    : valueExpr IN LPAREN literalList RPAREN
    ;

betweenPredicate
    : valueExpr BETWEEN valueExpr AND valueExpr
    ;

likePredicate
    : valueExpr LIKE STRING
    ;

nullPredicate
    : valueExpr IS NULL
    | valueExpr IS NOT NULL
    ;

spatialPredicate
    : T_INTERSECTS LPAREN valueExpr COMMA STRING RPAREN
    | S_INTERSECTS LPAREN valueExpr COMMA STRING RPAREN
    ;

literalList
    : literal (COMMA literal)*
    ;

literal
    : STRING
    | NUMBER
    | TRUE
    | FALSE
    ;

operator
    : EQ
    | GT
    | LT
    | GE
    | LE
    | NEQ
    ;

valueExpr
    : arithmeticExpr
    ;

arithmeticExpr
    : arithmeticExpr MUL arithmeticExpr
    | arithmeticExpr DIV arithmeticExpr
    | arithmeticExpr PLUS arithmeticExpr
    | arithmeticExpr MINUS arithmeticExpr
    | arrayExpr
    | IDENTIFIER
    | literal
    | LPAREN arithmeticExpr RPAREN
    ;

arrayExpr
    : LBRACK (literal (COMMA literal)*)? RBRACK
    ;

// ---------------- Lexer Rules ----------------

// Punctuation
LPAREN  : '(' ;
RPAREN  : ')' ;
LBRACK  : '[' ;
RBRACK  : ']' ;
COMMA   : ',' ;
PLUS    : '+' ;
MINUS   : '-' ;
MUL     : '*' ;
DIV     : '/' ;

// Operators
EQ      : '=' ;
GT      : '>' ;
LT      : '<' ;
GE      : '>=' ;
LE      : '<=' ;
NEQ     : '!=' ;

// Keywords (case-insensitive)
AND      : [Aa][Nn][Dd] ;
OR       : [Oo][Rr] ;
NOT      : [Nn][Oo][Tt] ;
IN       : [Ii][Nn] ;
BETWEEN  : [Bb][Ee][Tt][Ww][Ee][Ee][Nn] ;
LIKE     : [Ll][Ii][Kk][Ee] ;
IS       : [Ii][Ss] ;
NULL     : [Nn][Uu][Ll][Ll] ;
TRUE     : [Tt][Rr][Uu][Ee] ;
FALSE    : [Ff][Aa][Ll][Ss][Ee] ;

T_INTERSECTS : [Tt]'_'[Ii][Nn][Tt][Ee][Rr][Ss][Ee][Cc][Tt][Ss] ;
S_INTERSECTS : [Ss]'_'[Ii][Nn][Tt][Ee][Rr][Ss][Ee][Cc][Tt][Ss] ;

// Identifiers
IDENTIFIER
    : [a-zA-Z_][a-zA-Z0-9_:.]*
    ;

WS
    : [ \t\r\n\u00A0\u2007\u202F]+ -> skip
    ;

// String literal: single quotes, supports escaping
STRING
    : '\'' ( '\\' [\\'] | ~['\\] )* '\''
    ;

// Numbers: integer or decimal
NUMBER
    : [0-9]+ ('.' [0-9]+)?
    ;