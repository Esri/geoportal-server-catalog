// Generated from src/main/antlr4/CQL2.g4 by ANTLR 4.13.1
package com.esri.geoportal.service.stac.filter;
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.misc.*;
import org.antlr.v4.runtime.tree.*;
import java.util.List;
import java.util.Iterator;
import java.util.ArrayList;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast", "CheckReturnValue"})
public class CQL2Parser extends Parser {
	static { RuntimeMetaData.checkVersion("4.13.1", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		LPAREN=1, RPAREN=2, LBRACK=3, RBRACK=4, COMMA=5, PLUS=6, MINUS=7, MUL=8, 
		DIV=9, EQ=10, GT=11, LT=12, GE=13, LE=14, NEQ=15, AND=16, OR=17, NOT=18, 
		IN=19, BETWEEN=20, LIKE=21, IS=22, NULL=23, TRUE=24, FALSE=25, T_INTERSECTS=26, 
		S_INTERSECTS=27, IDENTIFIER=28, WS=29, STRING=30, NUMBER=31;
	public static final int
		RULE_query = 0, RULE_expression = 1, RULE_orExpr = 2, RULE_andExpr = 3, 
		RULE_notExpr = 4, RULE_primaryExpr = 5, RULE_predicate = 6, RULE_comparison = 7, 
		RULE_inPredicate = 8, RULE_betweenPredicate = 9, RULE_likePredicate = 10, 
		RULE_nullPredicate = 11, RULE_spatialPredicate = 12, RULE_literalList = 13, 
		RULE_literal = 14, RULE_operator = 15, RULE_valueExpr = 16, RULE_arithmeticExpr = 17, 
		RULE_arrayExpr = 18;
	private static String[] makeRuleNames() {
		return new String[] {
			"query", "expression", "orExpr", "andExpr", "notExpr", "primaryExpr", 
			"predicate", "comparison", "inPredicate", "betweenPredicate", "likePredicate", 
			"nullPredicate", "spatialPredicate", "literalList", "literal", "operator", 
			"valueExpr", "arithmeticExpr", "arrayExpr"
		};
	}
	public static final String[] ruleNames = makeRuleNames();

	private static String[] makeLiteralNames() {
		return new String[] {
			null, "'('", "')'", "'['", "']'", "','", "'+'", "'-'", "'*'", "'/'", 
			"'='", "'>'", "'<'", "'>='", "'<='", "'!='"
		};
	}
	private static final String[] _LITERAL_NAMES = makeLiteralNames();
	private static String[] makeSymbolicNames() {
		return new String[] {
			null, "LPAREN", "RPAREN", "LBRACK", "RBRACK", "COMMA", "PLUS", "MINUS", 
			"MUL", "DIV", "EQ", "GT", "LT", "GE", "LE", "NEQ", "AND", "OR", "NOT", 
			"IN", "BETWEEN", "LIKE", "IS", "NULL", "TRUE", "FALSE", "T_INTERSECTS", 
			"S_INTERSECTS", "IDENTIFIER", "WS", "STRING", "NUMBER"
		};
	}
	private static final String[] _SYMBOLIC_NAMES = makeSymbolicNames();
	public static final Vocabulary VOCABULARY = new VocabularyImpl(_LITERAL_NAMES, _SYMBOLIC_NAMES);

	/**
	 * @deprecated Use {@link #VOCABULARY} instead.
	 */
	@Deprecated
	public static final String[] tokenNames;
	static {
		tokenNames = new String[_SYMBOLIC_NAMES.length];
		for (int i = 0; i < tokenNames.length; i++) {
			tokenNames[i] = VOCABULARY.getLiteralName(i);
			if (tokenNames[i] == null) {
				tokenNames[i] = VOCABULARY.getSymbolicName(i);
			}

			if (tokenNames[i] == null) {
				tokenNames[i] = "<INVALID>";
			}
		}
	}

	@Override
	@Deprecated
	public String[] getTokenNames() {
		return tokenNames;
	}

	@Override

	public Vocabulary getVocabulary() {
		return VOCABULARY;
	}

	@Override
	public String getGrammarFileName() { return "CQL2.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public ATN getATN() { return _ATN; }

	public CQL2Parser(TokenStream input) {
		super(input);
		_interp = new ParserATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	@SuppressWarnings("CheckReturnValue")
	public static class QueryContext extends ParserRuleContext {
		public ExpressionContext expression() {
			return getRuleContext(ExpressionContext.class,0);
		}
		public TerminalNode EOF() { return getToken(CQL2Parser.EOF, 0); }
		public QueryContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_query; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterQuery(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitQuery(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitQuery(this);
			else return visitor.visitChildren(this);
		}
	}

	public final QueryContext query() throws RecognitionException {
		QueryContext _localctx = new QueryContext(_ctx, getState());
		enterRule(_localctx, 0, RULE_query);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(38);
			expression();
			setState(39);
			match(EOF);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ExpressionContext extends ParserRuleContext {
		public OrExprContext orExpr() {
			return getRuleContext(OrExprContext.class,0);
		}
		public ExpressionContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_expression; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterExpression(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitExpression(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitExpression(this);
			else return visitor.visitChildren(this);
		}
	}

	public final ExpressionContext expression() throws RecognitionException {
		ExpressionContext _localctx = new ExpressionContext(_ctx, getState());
		enterRule(_localctx, 2, RULE_expression);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(41);
			orExpr();
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class OrExprContext extends ParserRuleContext {
		public List<AndExprContext> andExpr() {
			return getRuleContexts(AndExprContext.class);
		}
		public AndExprContext andExpr(int i) {
			return getRuleContext(AndExprContext.class,i);
		}
		public List<TerminalNode> OR() { return getTokens(CQL2Parser.OR); }
		public TerminalNode OR(int i) {
			return getToken(CQL2Parser.OR, i);
		}
		public OrExprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_orExpr; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterOrExpr(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitOrExpr(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitOrExpr(this);
			else return visitor.visitChildren(this);
		}
	}

	public final OrExprContext orExpr() throws RecognitionException {
		OrExprContext _localctx = new OrExprContext(_ctx, getState());
		enterRule(_localctx, 4, RULE_orExpr);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(43);
			andExpr();
			setState(48);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==OR) {
				{
				{
				setState(44);
				match(OR);
				setState(45);
				andExpr();
				}
				}
				setState(50);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class AndExprContext extends ParserRuleContext {
		public List<NotExprContext> notExpr() {
			return getRuleContexts(NotExprContext.class);
		}
		public NotExprContext notExpr(int i) {
			return getRuleContext(NotExprContext.class,i);
		}
		public List<TerminalNode> AND() { return getTokens(CQL2Parser.AND); }
		public TerminalNode AND(int i) {
			return getToken(CQL2Parser.AND, i);
		}
		public AndExprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_andExpr; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterAndExpr(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitAndExpr(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitAndExpr(this);
			else return visitor.visitChildren(this);
		}
	}

	public final AndExprContext andExpr() throws RecognitionException {
		AndExprContext _localctx = new AndExprContext(_ctx, getState());
		enterRule(_localctx, 6, RULE_andExpr);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(51);
			notExpr();
			setState(56);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==AND) {
				{
				{
				setState(52);
				match(AND);
				setState(53);
				notExpr();
				}
				}
				setState(58);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class NotExprContext extends ParserRuleContext {
		public TerminalNode NOT() { return getToken(CQL2Parser.NOT, 0); }
		public NotExprContext notExpr() {
			return getRuleContext(NotExprContext.class,0);
		}
		public PrimaryExprContext primaryExpr() {
			return getRuleContext(PrimaryExprContext.class,0);
		}
		public NotExprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_notExpr; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterNotExpr(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitNotExpr(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitNotExpr(this);
			else return visitor.visitChildren(this);
		}
	}

	public final NotExprContext notExpr() throws RecognitionException {
		NotExprContext _localctx = new NotExprContext(_ctx, getState());
		enterRule(_localctx, 8, RULE_notExpr);
		try {
			setState(62);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case NOT:
				enterOuterAlt(_localctx, 1);
				{
				setState(59);
				match(NOT);
				setState(60);
				notExpr();
				}
				break;
			case LPAREN:
			case LBRACK:
			case TRUE:
			case FALSE:
			case T_INTERSECTS:
			case S_INTERSECTS:
			case IDENTIFIER:
			case STRING:
			case NUMBER:
				enterOuterAlt(_localctx, 2);
				{
				setState(61);
				primaryExpr();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class PrimaryExprContext extends ParserRuleContext {
		public TerminalNode LPAREN() { return getToken(CQL2Parser.LPAREN, 0); }
		public ExpressionContext expression() {
			return getRuleContext(ExpressionContext.class,0);
		}
		public TerminalNode RPAREN() { return getToken(CQL2Parser.RPAREN, 0); }
		public PredicateContext predicate() {
			return getRuleContext(PredicateContext.class,0);
		}
		public PrimaryExprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_primaryExpr; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterPrimaryExpr(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitPrimaryExpr(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitPrimaryExpr(this);
			else return visitor.visitChildren(this);
		}
	}

	public final PrimaryExprContext primaryExpr() throws RecognitionException {
		PrimaryExprContext _localctx = new PrimaryExprContext(_ctx, getState());
		enterRule(_localctx, 10, RULE_primaryExpr);
		try {
			setState(69);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,3,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(64);
				match(LPAREN);
				setState(65);
				expression();
				setState(66);
				match(RPAREN);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(68);
				predicate();
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class PredicateContext extends ParserRuleContext {
		public ComparisonContext comparison() {
			return getRuleContext(ComparisonContext.class,0);
		}
		public InPredicateContext inPredicate() {
			return getRuleContext(InPredicateContext.class,0);
		}
		public BetweenPredicateContext betweenPredicate() {
			return getRuleContext(BetweenPredicateContext.class,0);
		}
		public LikePredicateContext likePredicate() {
			return getRuleContext(LikePredicateContext.class,0);
		}
		public NullPredicateContext nullPredicate() {
			return getRuleContext(NullPredicateContext.class,0);
		}
		public SpatialPredicateContext spatialPredicate() {
			return getRuleContext(SpatialPredicateContext.class,0);
		}
		public PredicateContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_predicate; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterPredicate(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitPredicate(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitPredicate(this);
			else return visitor.visitChildren(this);
		}
	}

	public final PredicateContext predicate() throws RecognitionException {
		PredicateContext _localctx = new PredicateContext(_ctx, getState());
		enterRule(_localctx, 12, RULE_predicate);
		try {
			setState(77);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,4,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(71);
				comparison();
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(72);
				inPredicate();
				}
				break;
			case 3:
				enterOuterAlt(_localctx, 3);
				{
				setState(73);
				betweenPredicate();
				}
				break;
			case 4:
				enterOuterAlt(_localctx, 4);
				{
				setState(74);
				likePredicate();
				}
				break;
			case 5:
				enterOuterAlt(_localctx, 5);
				{
				setState(75);
				nullPredicate();
				}
				break;
			case 6:
				enterOuterAlt(_localctx, 6);
				{
				setState(76);
				spatialPredicate();
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ComparisonContext extends ParserRuleContext {
		public List<ValueExprContext> valueExpr() {
			return getRuleContexts(ValueExprContext.class);
		}
		public ValueExprContext valueExpr(int i) {
			return getRuleContext(ValueExprContext.class,i);
		}
		public OperatorContext operator() {
			return getRuleContext(OperatorContext.class,0);
		}
		public ComparisonContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_comparison; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterComparison(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitComparison(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitComparison(this);
			else return visitor.visitChildren(this);
		}
	}

	public final ComparisonContext comparison() throws RecognitionException {
		ComparisonContext _localctx = new ComparisonContext(_ctx, getState());
		enterRule(_localctx, 14, RULE_comparison);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(79);
			valueExpr();
			setState(80);
			operator();
			setState(81);
			valueExpr();
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class InPredicateContext extends ParserRuleContext {
		public ValueExprContext valueExpr() {
			return getRuleContext(ValueExprContext.class,0);
		}
		public TerminalNode IN() { return getToken(CQL2Parser.IN, 0); }
		public TerminalNode LPAREN() { return getToken(CQL2Parser.LPAREN, 0); }
		public LiteralListContext literalList() {
			return getRuleContext(LiteralListContext.class,0);
		}
		public TerminalNode RPAREN() { return getToken(CQL2Parser.RPAREN, 0); }
		public InPredicateContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_inPredicate; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterInPredicate(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitInPredicate(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitInPredicate(this);
			else return visitor.visitChildren(this);
		}
	}

	public final InPredicateContext inPredicate() throws RecognitionException {
		InPredicateContext _localctx = new InPredicateContext(_ctx, getState());
		enterRule(_localctx, 16, RULE_inPredicate);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(83);
			valueExpr();
			setState(84);
			match(IN);
			setState(85);
			match(LPAREN);
			setState(86);
			literalList();
			setState(87);
			match(RPAREN);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class BetweenPredicateContext extends ParserRuleContext {
		public List<ValueExprContext> valueExpr() {
			return getRuleContexts(ValueExprContext.class);
		}
		public ValueExprContext valueExpr(int i) {
			return getRuleContext(ValueExprContext.class,i);
		}
		public TerminalNode BETWEEN() { return getToken(CQL2Parser.BETWEEN, 0); }
		public TerminalNode AND() { return getToken(CQL2Parser.AND, 0); }
		public BetweenPredicateContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_betweenPredicate; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterBetweenPredicate(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitBetweenPredicate(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitBetweenPredicate(this);
			else return visitor.visitChildren(this);
		}
	}

	public final BetweenPredicateContext betweenPredicate() throws RecognitionException {
		BetweenPredicateContext _localctx = new BetweenPredicateContext(_ctx, getState());
		enterRule(_localctx, 18, RULE_betweenPredicate);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(89);
			valueExpr();
			setState(90);
			match(BETWEEN);
			setState(91);
			valueExpr();
			setState(92);
			match(AND);
			setState(93);
			valueExpr();
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class LikePredicateContext extends ParserRuleContext {
		public ValueExprContext valueExpr() {
			return getRuleContext(ValueExprContext.class,0);
		}
		public TerminalNode LIKE() { return getToken(CQL2Parser.LIKE, 0); }
		public TerminalNode STRING() { return getToken(CQL2Parser.STRING, 0); }
		public LikePredicateContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_likePredicate; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterLikePredicate(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitLikePredicate(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitLikePredicate(this);
			else return visitor.visitChildren(this);
		}
	}

	public final LikePredicateContext likePredicate() throws RecognitionException {
		LikePredicateContext _localctx = new LikePredicateContext(_ctx, getState());
		enterRule(_localctx, 20, RULE_likePredicate);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(95);
			valueExpr();
			setState(96);
			match(LIKE);
			setState(97);
			match(STRING);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class NullPredicateContext extends ParserRuleContext {
		public ValueExprContext valueExpr() {
			return getRuleContext(ValueExprContext.class,0);
		}
		public TerminalNode IS() { return getToken(CQL2Parser.IS, 0); }
		public TerminalNode NULL() { return getToken(CQL2Parser.NULL, 0); }
		public TerminalNode NOT() { return getToken(CQL2Parser.NOT, 0); }
		public NullPredicateContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_nullPredicate; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterNullPredicate(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitNullPredicate(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitNullPredicate(this);
			else return visitor.visitChildren(this);
		}
	}

	public final NullPredicateContext nullPredicate() throws RecognitionException {
		NullPredicateContext _localctx = new NullPredicateContext(_ctx, getState());
		enterRule(_localctx, 22, RULE_nullPredicate);
		try {
			setState(108);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,5,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(99);
				valueExpr();
				setState(100);
				match(IS);
				setState(101);
				match(NULL);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(103);
				valueExpr();
				setState(104);
				match(IS);
				setState(105);
				match(NOT);
				setState(106);
				match(NULL);
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class SpatialPredicateContext extends ParserRuleContext {
		public TerminalNode T_INTERSECTS() { return getToken(CQL2Parser.T_INTERSECTS, 0); }
		public TerminalNode LPAREN() { return getToken(CQL2Parser.LPAREN, 0); }
		public ValueExprContext valueExpr() {
			return getRuleContext(ValueExprContext.class,0);
		}
		public TerminalNode COMMA() { return getToken(CQL2Parser.COMMA, 0); }
		public TerminalNode STRING() { return getToken(CQL2Parser.STRING, 0); }
		public TerminalNode RPAREN() { return getToken(CQL2Parser.RPAREN, 0); }
		public TerminalNode S_INTERSECTS() { return getToken(CQL2Parser.S_INTERSECTS, 0); }
		public SpatialPredicateContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_spatialPredicate; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterSpatialPredicate(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitSpatialPredicate(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitSpatialPredicate(this);
			else return visitor.visitChildren(this);
		}
	}

	public final SpatialPredicateContext spatialPredicate() throws RecognitionException {
		SpatialPredicateContext _localctx = new SpatialPredicateContext(_ctx, getState());
		enterRule(_localctx, 24, RULE_spatialPredicate);
		try {
			setState(124);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case T_INTERSECTS:
				enterOuterAlt(_localctx, 1);
				{
				setState(110);
				match(T_INTERSECTS);
				setState(111);
				match(LPAREN);
				setState(112);
				valueExpr();
				setState(113);
				match(COMMA);
				setState(114);
				match(STRING);
				setState(115);
				match(RPAREN);
				}
				break;
			case S_INTERSECTS:
				enterOuterAlt(_localctx, 2);
				{
				setState(117);
				match(S_INTERSECTS);
				setState(118);
				match(LPAREN);
				setState(119);
				valueExpr();
				setState(120);
				match(COMMA);
				setState(121);
				match(STRING);
				setState(122);
				match(RPAREN);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class LiteralListContext extends ParserRuleContext {
		public List<LiteralContext> literal() {
			return getRuleContexts(LiteralContext.class);
		}
		public LiteralContext literal(int i) {
			return getRuleContext(LiteralContext.class,i);
		}
		public List<TerminalNode> COMMA() { return getTokens(CQL2Parser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(CQL2Parser.COMMA, i);
		}
		public LiteralListContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_literalList; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterLiteralList(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitLiteralList(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitLiteralList(this);
			else return visitor.visitChildren(this);
		}
	}

	public final LiteralListContext literalList() throws RecognitionException {
		LiteralListContext _localctx = new LiteralListContext(_ctx, getState());
		enterRule(_localctx, 26, RULE_literalList);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(126);
			literal();
			setState(131);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==COMMA) {
				{
				{
				setState(127);
				match(COMMA);
				setState(128);
				literal();
				}
				}
				setState(133);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class LiteralContext extends ParserRuleContext {
		public TerminalNode STRING() { return getToken(CQL2Parser.STRING, 0); }
		public TerminalNode NUMBER() { return getToken(CQL2Parser.NUMBER, 0); }
		public TerminalNode TRUE() { return getToken(CQL2Parser.TRUE, 0); }
		public TerminalNode FALSE() { return getToken(CQL2Parser.FALSE, 0); }
		public LiteralContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_literal; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterLiteral(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitLiteral(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitLiteral(this);
			else return visitor.visitChildren(this);
		}
	}

	public final LiteralContext literal() throws RecognitionException {
		LiteralContext _localctx = new LiteralContext(_ctx, getState());
		enterRule(_localctx, 28, RULE_literal);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(134);
			_la = _input.LA(1);
			if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 3271557120L) != 0)) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class OperatorContext extends ParserRuleContext {
		public TerminalNode EQ() { return getToken(CQL2Parser.EQ, 0); }
		public TerminalNode GT() { return getToken(CQL2Parser.GT, 0); }
		public TerminalNode LT() { return getToken(CQL2Parser.LT, 0); }
		public TerminalNode GE() { return getToken(CQL2Parser.GE, 0); }
		public TerminalNode LE() { return getToken(CQL2Parser.LE, 0); }
		public TerminalNode NEQ() { return getToken(CQL2Parser.NEQ, 0); }
		public OperatorContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_operator; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterOperator(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitOperator(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitOperator(this);
			else return visitor.visitChildren(this);
		}
	}

	public final OperatorContext operator() throws RecognitionException {
		OperatorContext _localctx = new OperatorContext(_ctx, getState());
		enterRule(_localctx, 30, RULE_operator);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(136);
			_la = _input.LA(1);
			if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 64512L) != 0)) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ValueExprContext extends ParserRuleContext {
		public ArithmeticExprContext arithmeticExpr() {
			return getRuleContext(ArithmeticExprContext.class,0);
		}
		public ValueExprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_valueExpr; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterValueExpr(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitValueExpr(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitValueExpr(this);
			else return visitor.visitChildren(this);
		}
	}

	public final ValueExprContext valueExpr() throws RecognitionException {
		ValueExprContext _localctx = new ValueExprContext(_ctx, getState());
		enterRule(_localctx, 32, RULE_valueExpr);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(138);
			arithmeticExpr(0);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ArithmeticExprContext extends ParserRuleContext {
		public ArrayExprContext arrayExpr() {
			return getRuleContext(ArrayExprContext.class,0);
		}
		public TerminalNode IDENTIFIER() { return getToken(CQL2Parser.IDENTIFIER, 0); }
		public LiteralContext literal() {
			return getRuleContext(LiteralContext.class,0);
		}
		public TerminalNode LPAREN() { return getToken(CQL2Parser.LPAREN, 0); }
		public List<ArithmeticExprContext> arithmeticExpr() {
			return getRuleContexts(ArithmeticExprContext.class);
		}
		public ArithmeticExprContext arithmeticExpr(int i) {
			return getRuleContext(ArithmeticExprContext.class,i);
		}
		public TerminalNode RPAREN() { return getToken(CQL2Parser.RPAREN, 0); }
		public TerminalNode MUL() { return getToken(CQL2Parser.MUL, 0); }
		public TerminalNode DIV() { return getToken(CQL2Parser.DIV, 0); }
		public TerminalNode PLUS() { return getToken(CQL2Parser.PLUS, 0); }
		public TerminalNode MINUS() { return getToken(CQL2Parser.MINUS, 0); }
		public ArithmeticExprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_arithmeticExpr; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterArithmeticExpr(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitArithmeticExpr(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitArithmeticExpr(this);
			else return visitor.visitChildren(this);
		}
	}

	public final ArithmeticExprContext arithmeticExpr() throws RecognitionException {
		return arithmeticExpr(0);
	}

	private ArithmeticExprContext arithmeticExpr(int _p) throws RecognitionException {
		ParserRuleContext _parentctx = _ctx;
		int _parentState = getState();
		ArithmeticExprContext _localctx = new ArithmeticExprContext(_ctx, _parentState);
		ArithmeticExprContext _prevctx = _localctx;
		int _startState = 34;
		enterRecursionRule(_localctx, 34, RULE_arithmeticExpr, _p);
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(148);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case LBRACK:
				{
				setState(141);
				arrayExpr();
				}
				break;
			case IDENTIFIER:
				{
				setState(142);
				match(IDENTIFIER);
				}
				break;
			case TRUE:
			case FALSE:
			case STRING:
			case NUMBER:
				{
				setState(143);
				literal();
				}
				break;
			case LPAREN:
				{
				setState(144);
				match(LPAREN);
				setState(145);
				arithmeticExpr(0);
				setState(146);
				match(RPAREN);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			_ctx.stop = _input.LT(-1);
			setState(164);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,10,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					setState(162);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,9,_ctx) ) {
					case 1:
						{
						_localctx = new ArithmeticExprContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_arithmeticExpr);
						setState(150);
						if (!(precpred(_ctx, 8))) throw new FailedPredicateException(this, "precpred(_ctx, 8)");
						setState(151);
						match(MUL);
						setState(152);
						arithmeticExpr(9);
						}
						break;
					case 2:
						{
						_localctx = new ArithmeticExprContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_arithmeticExpr);
						setState(153);
						if (!(precpred(_ctx, 7))) throw new FailedPredicateException(this, "precpred(_ctx, 7)");
						setState(154);
						match(DIV);
						setState(155);
						arithmeticExpr(8);
						}
						break;
					case 3:
						{
						_localctx = new ArithmeticExprContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_arithmeticExpr);
						setState(156);
						if (!(precpred(_ctx, 6))) throw new FailedPredicateException(this, "precpred(_ctx, 6)");
						setState(157);
						match(PLUS);
						setState(158);
						arithmeticExpr(7);
						}
						break;
					case 4:
						{
						_localctx = new ArithmeticExprContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_arithmeticExpr);
						setState(159);
						if (!(precpred(_ctx, 5))) throw new FailedPredicateException(this, "precpred(_ctx, 5)");
						setState(160);
						match(MINUS);
						setState(161);
						arithmeticExpr(6);
						}
						break;
					}
					} 
				}
				setState(166);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,10,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ArrayExprContext extends ParserRuleContext {
		public TerminalNode LBRACK() { return getToken(CQL2Parser.LBRACK, 0); }
		public TerminalNode RBRACK() { return getToken(CQL2Parser.RBRACK, 0); }
		public List<LiteralContext> literal() {
			return getRuleContexts(LiteralContext.class);
		}
		public LiteralContext literal(int i) {
			return getRuleContext(LiteralContext.class,i);
		}
		public List<TerminalNode> COMMA() { return getTokens(CQL2Parser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(CQL2Parser.COMMA, i);
		}
		public ArrayExprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_arrayExpr; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).enterArrayExpr(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof CQL2Listener ) ((CQL2Listener)listener).exitArrayExpr(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof CQL2Visitor ) return ((CQL2Visitor<? extends T>)visitor).visitArrayExpr(this);
			else return visitor.visitChildren(this);
		}
	}

	public final ArrayExprContext arrayExpr() throws RecognitionException {
		ArrayExprContext _localctx = new ArrayExprContext(_ctx, getState());
		enterRule(_localctx, 36, RULE_arrayExpr);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(167);
			match(LBRACK);
			setState(176);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if ((((_la) & ~0x3f) == 0 && ((1L << _la) & 3271557120L) != 0)) {
				{
				setState(168);
				literal();
				setState(173);
				_errHandler.sync(this);
				_la = _input.LA(1);
				while (_la==COMMA) {
					{
					{
					setState(169);
					match(COMMA);
					setState(170);
					literal();
					}
					}
					setState(175);
					_errHandler.sync(this);
					_la = _input.LA(1);
				}
				}
			}

			setState(178);
			match(RBRACK);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public boolean sempred(RuleContext _localctx, int ruleIndex, int predIndex) {
		switch (ruleIndex) {
		case 17:
			return arithmeticExpr_sempred((ArithmeticExprContext)_localctx, predIndex);
		}
		return true;
	}
	private boolean arithmeticExpr_sempred(ArithmeticExprContext _localctx, int predIndex) {
		switch (predIndex) {
		case 0:
			return precpred(_ctx, 8);
		case 1:
			return precpred(_ctx, 7);
		case 2:
			return precpred(_ctx, 6);
		case 3:
			return precpred(_ctx, 5);
		}
		return true;
	}

	public static final String _serializedATN =
		"\u0004\u0001\u001f\u00b5\u0002\u0000\u0007\u0000\u0002\u0001\u0007\u0001"+
		"\u0002\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0002\u0004\u0007\u0004"+
		"\u0002\u0005\u0007\u0005\u0002\u0006\u0007\u0006\u0002\u0007\u0007\u0007"+
		"\u0002\b\u0007\b\u0002\t\u0007\t\u0002\n\u0007\n\u0002\u000b\u0007\u000b"+
		"\u0002\f\u0007\f\u0002\r\u0007\r\u0002\u000e\u0007\u000e\u0002\u000f\u0007"+
		"\u000f\u0002\u0010\u0007\u0010\u0002\u0011\u0007\u0011\u0002\u0012\u0007"+
		"\u0012\u0001\u0000\u0001\u0000\u0001\u0000\u0001\u0001\u0001\u0001\u0001"+
		"\u0002\u0001\u0002\u0001\u0002\u0005\u0002/\b\u0002\n\u0002\f\u00022\t"+
		"\u0002\u0001\u0003\u0001\u0003\u0001\u0003\u0005\u00037\b\u0003\n\u0003"+
		"\f\u0003:\t\u0003\u0001\u0004\u0001\u0004\u0001\u0004\u0003\u0004?\b\u0004"+
		"\u0001\u0005\u0001\u0005\u0001\u0005\u0001\u0005\u0001\u0005\u0003\u0005"+
		"F\b\u0005\u0001\u0006\u0001\u0006\u0001\u0006\u0001\u0006\u0001\u0006"+
		"\u0001\u0006\u0003\u0006N\b\u0006\u0001\u0007\u0001\u0007\u0001\u0007"+
		"\u0001\u0007\u0001\b\u0001\b\u0001\b\u0001\b\u0001\b\u0001\b\u0001\t\u0001"+
		"\t\u0001\t\u0001\t\u0001\t\u0001\t\u0001\n\u0001\n\u0001\n\u0001\n\u0001"+
		"\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001"+
		"\u000b\u0001\u000b\u0001\u000b\u0003\u000bm\b\u000b\u0001\f\u0001\f\u0001"+
		"\f\u0001\f\u0001\f\u0001\f\u0001\f\u0001\f\u0001\f\u0001\f\u0001\f\u0001"+
		"\f\u0001\f\u0001\f\u0003\f}\b\f\u0001\r\u0001\r\u0001\r\u0005\r\u0082"+
		"\b\r\n\r\f\r\u0085\t\r\u0001\u000e\u0001\u000e\u0001\u000f\u0001\u000f"+
		"\u0001\u0010\u0001\u0010\u0001\u0011\u0001\u0011\u0001\u0011\u0001\u0011"+
		"\u0001\u0011\u0001\u0011\u0001\u0011\u0001\u0011\u0003\u0011\u0095\b\u0011"+
		"\u0001\u0011\u0001\u0011\u0001\u0011\u0001\u0011\u0001\u0011\u0001\u0011"+
		"\u0001\u0011\u0001\u0011\u0001\u0011\u0001\u0011\u0001\u0011\u0001\u0011"+
		"\u0005\u0011\u00a3\b\u0011\n\u0011\f\u0011\u00a6\t\u0011\u0001\u0012\u0001"+
		"\u0012\u0001\u0012\u0001\u0012\u0005\u0012\u00ac\b\u0012\n\u0012\f\u0012"+
		"\u00af\t\u0012\u0003\u0012\u00b1\b\u0012\u0001\u0012\u0001\u0012\u0001"+
		"\u0012\u0000\u0001\"\u0013\u0000\u0002\u0004\u0006\b\n\f\u000e\u0010\u0012"+
		"\u0014\u0016\u0018\u001a\u001c\u001e \"$\u0000\u0002\u0002\u0000\u0018"+
		"\u0019\u001e\u001f\u0001\u0000\n\u000f\u00b6\u0000&\u0001\u0000\u0000"+
		"\u0000\u0002)\u0001\u0000\u0000\u0000\u0004+\u0001\u0000\u0000\u0000\u0006"+
		"3\u0001\u0000\u0000\u0000\b>\u0001\u0000\u0000\u0000\nE\u0001\u0000\u0000"+
		"\u0000\fM\u0001\u0000\u0000\u0000\u000eO\u0001\u0000\u0000\u0000\u0010"+
		"S\u0001\u0000\u0000\u0000\u0012Y\u0001\u0000\u0000\u0000\u0014_\u0001"+
		"\u0000\u0000\u0000\u0016l\u0001\u0000\u0000\u0000\u0018|\u0001\u0000\u0000"+
		"\u0000\u001a~\u0001\u0000\u0000\u0000\u001c\u0086\u0001\u0000\u0000\u0000"+
		"\u001e\u0088\u0001\u0000\u0000\u0000 \u008a\u0001\u0000\u0000\u0000\""+
		"\u0094\u0001\u0000\u0000\u0000$\u00a7\u0001\u0000\u0000\u0000&\'\u0003"+
		"\u0002\u0001\u0000\'(\u0005\u0000\u0000\u0001(\u0001\u0001\u0000\u0000"+
		"\u0000)*\u0003\u0004\u0002\u0000*\u0003\u0001\u0000\u0000\u0000+0\u0003"+
		"\u0006\u0003\u0000,-\u0005\u0011\u0000\u0000-/\u0003\u0006\u0003\u0000"+
		".,\u0001\u0000\u0000\u0000/2\u0001\u0000\u0000\u00000.\u0001\u0000\u0000"+
		"\u000001\u0001\u0000\u0000\u00001\u0005\u0001\u0000\u0000\u000020\u0001"+
		"\u0000\u0000\u000038\u0003\b\u0004\u000045\u0005\u0010\u0000\u000057\u0003"+
		"\b\u0004\u000064\u0001\u0000\u0000\u00007:\u0001\u0000\u0000\u000086\u0001"+
		"\u0000\u0000\u000089\u0001\u0000\u0000\u00009\u0007\u0001\u0000\u0000"+
		"\u0000:8\u0001\u0000\u0000\u0000;<\u0005\u0012\u0000\u0000<?\u0003\b\u0004"+
		"\u0000=?\u0003\n\u0005\u0000>;\u0001\u0000\u0000\u0000>=\u0001\u0000\u0000"+
		"\u0000?\t\u0001\u0000\u0000\u0000@A\u0005\u0001\u0000\u0000AB\u0003\u0002"+
		"\u0001\u0000BC\u0005\u0002\u0000\u0000CF\u0001\u0000\u0000\u0000DF\u0003"+
		"\f\u0006\u0000E@\u0001\u0000\u0000\u0000ED\u0001\u0000\u0000\u0000F\u000b"+
		"\u0001\u0000\u0000\u0000GN\u0003\u000e\u0007\u0000HN\u0003\u0010\b\u0000"+
		"IN\u0003\u0012\t\u0000JN\u0003\u0014\n\u0000KN\u0003\u0016\u000b\u0000"+
		"LN\u0003\u0018\f\u0000MG\u0001\u0000\u0000\u0000MH\u0001\u0000\u0000\u0000"+
		"MI\u0001\u0000\u0000\u0000MJ\u0001\u0000\u0000\u0000MK\u0001\u0000\u0000"+
		"\u0000ML\u0001\u0000\u0000\u0000N\r\u0001\u0000\u0000\u0000OP\u0003 \u0010"+
		"\u0000PQ\u0003\u001e\u000f\u0000QR\u0003 \u0010\u0000R\u000f\u0001\u0000"+
		"\u0000\u0000ST\u0003 \u0010\u0000TU\u0005\u0013\u0000\u0000UV\u0005\u0001"+
		"\u0000\u0000VW\u0003\u001a\r\u0000WX\u0005\u0002\u0000\u0000X\u0011\u0001"+
		"\u0000\u0000\u0000YZ\u0003 \u0010\u0000Z[\u0005\u0014\u0000\u0000[\\\u0003"+
		" \u0010\u0000\\]\u0005\u0010\u0000\u0000]^\u0003 \u0010\u0000^\u0013\u0001"+
		"\u0000\u0000\u0000_`\u0003 \u0010\u0000`a\u0005\u0015\u0000\u0000ab\u0005"+
		"\u001e\u0000\u0000b\u0015\u0001\u0000\u0000\u0000cd\u0003 \u0010\u0000"+
		"de\u0005\u0016\u0000\u0000ef\u0005\u0017\u0000\u0000fm\u0001\u0000\u0000"+
		"\u0000gh\u0003 \u0010\u0000hi\u0005\u0016\u0000\u0000ij\u0005\u0012\u0000"+
		"\u0000jk\u0005\u0017\u0000\u0000km\u0001\u0000\u0000\u0000lc\u0001\u0000"+
		"\u0000\u0000lg\u0001\u0000\u0000\u0000m\u0017\u0001\u0000\u0000\u0000"+
		"no\u0005\u001a\u0000\u0000op\u0005\u0001\u0000\u0000pq\u0003 \u0010\u0000"+
		"qr\u0005\u0005\u0000\u0000rs\u0005\u001e\u0000\u0000st\u0005\u0002\u0000"+
		"\u0000t}\u0001\u0000\u0000\u0000uv\u0005\u001b\u0000\u0000vw\u0005\u0001"+
		"\u0000\u0000wx\u0003 \u0010\u0000xy\u0005\u0005\u0000\u0000yz\u0005\u001e"+
		"\u0000\u0000z{\u0005\u0002\u0000\u0000{}\u0001\u0000\u0000\u0000|n\u0001"+
		"\u0000\u0000\u0000|u\u0001\u0000\u0000\u0000}\u0019\u0001\u0000\u0000"+
		"\u0000~\u0083\u0003\u001c\u000e\u0000\u007f\u0080\u0005\u0005\u0000\u0000"+
		"\u0080\u0082\u0003\u001c\u000e\u0000\u0081\u007f\u0001\u0000\u0000\u0000"+
		"\u0082\u0085\u0001\u0000\u0000\u0000\u0083\u0081\u0001\u0000\u0000\u0000"+
		"\u0083\u0084\u0001\u0000\u0000\u0000\u0084\u001b\u0001\u0000\u0000\u0000"+
		"\u0085\u0083\u0001\u0000\u0000\u0000\u0086\u0087\u0007\u0000\u0000\u0000"+
		"\u0087\u001d\u0001\u0000\u0000\u0000\u0088\u0089\u0007\u0001\u0000\u0000"+
		"\u0089\u001f\u0001\u0000\u0000\u0000\u008a\u008b\u0003\"\u0011\u0000\u008b"+
		"!\u0001\u0000\u0000\u0000\u008c\u008d\u0006\u0011\uffff\uffff\u0000\u008d"+
		"\u0095\u0003$\u0012\u0000\u008e\u0095\u0005\u001c\u0000\u0000\u008f\u0095"+
		"\u0003\u001c\u000e\u0000\u0090\u0091\u0005\u0001\u0000\u0000\u0091\u0092"+
		"\u0003\"\u0011\u0000\u0092\u0093\u0005\u0002\u0000\u0000\u0093\u0095\u0001"+
		"\u0000\u0000\u0000\u0094\u008c\u0001\u0000\u0000\u0000\u0094\u008e\u0001"+
		"\u0000\u0000\u0000\u0094\u008f\u0001\u0000\u0000\u0000\u0094\u0090\u0001"+
		"\u0000\u0000\u0000\u0095\u00a4\u0001\u0000\u0000\u0000\u0096\u0097\n\b"+
		"\u0000\u0000\u0097\u0098\u0005\b\u0000\u0000\u0098\u00a3\u0003\"\u0011"+
		"\t\u0099\u009a\n\u0007\u0000\u0000\u009a\u009b\u0005\t\u0000\u0000\u009b"+
		"\u00a3\u0003\"\u0011\b\u009c\u009d\n\u0006\u0000\u0000\u009d\u009e\u0005"+
		"\u0006\u0000\u0000\u009e\u00a3\u0003\"\u0011\u0007\u009f\u00a0\n\u0005"+
		"\u0000\u0000\u00a0\u00a1\u0005\u0007\u0000\u0000\u00a1\u00a3\u0003\"\u0011"+
		"\u0006\u00a2\u0096\u0001\u0000\u0000\u0000\u00a2\u0099\u0001\u0000\u0000"+
		"\u0000\u00a2\u009c\u0001\u0000\u0000\u0000\u00a2\u009f\u0001\u0000\u0000"+
		"\u0000\u00a3\u00a6\u0001\u0000\u0000\u0000\u00a4\u00a2\u0001\u0000\u0000"+
		"\u0000\u00a4\u00a5\u0001\u0000\u0000\u0000\u00a5#\u0001\u0000\u0000\u0000"+
		"\u00a6\u00a4\u0001\u0000\u0000\u0000\u00a7\u00b0\u0005\u0003\u0000\u0000"+
		"\u00a8\u00ad\u0003\u001c\u000e\u0000\u00a9\u00aa\u0005\u0005\u0000\u0000"+
		"\u00aa\u00ac\u0003\u001c\u000e\u0000\u00ab\u00a9\u0001\u0000\u0000\u0000"+
		"\u00ac\u00af\u0001\u0000\u0000\u0000\u00ad\u00ab\u0001\u0000\u0000\u0000"+
		"\u00ad\u00ae\u0001\u0000\u0000\u0000\u00ae\u00b1\u0001\u0000\u0000\u0000"+
		"\u00af\u00ad\u0001\u0000\u0000\u0000\u00b0\u00a8\u0001\u0000\u0000\u0000"+
		"\u00b0\u00b1\u0001\u0000\u0000\u0000\u00b1\u00b2\u0001\u0000\u0000\u0000"+
		"\u00b2\u00b3\u0005\u0004\u0000\u0000\u00b3%\u0001\u0000\u0000\u0000\r"+
		"08>EMl|\u0083\u0094\u00a2\u00a4\u00ad\u00b0";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}