// Generated from src/main/antlr4/CQL2.g4 by ANTLR 4.13.1
package com.esri.geoportal.service.stac.filter;
import org.antlr.v4.runtime.tree.ParseTreeListener;

/**
 * This interface defines a complete listener for a parse tree produced by
 * {@link CQL2Parser}.
 */
public interface CQL2Listener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#query}.
	 * @param ctx the parse tree
	 */
	void enterQuery(CQL2Parser.QueryContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#query}.
	 * @param ctx the parse tree
	 */
	void exitQuery(CQL2Parser.QueryContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#expression}.
	 * @param ctx the parse tree
	 */
	void enterExpression(CQL2Parser.ExpressionContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#expression}.
	 * @param ctx the parse tree
	 */
	void exitExpression(CQL2Parser.ExpressionContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#orExpr}.
	 * @param ctx the parse tree
	 */
	void enterOrExpr(CQL2Parser.OrExprContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#orExpr}.
	 * @param ctx the parse tree
	 */
	void exitOrExpr(CQL2Parser.OrExprContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#andExpr}.
	 * @param ctx the parse tree
	 */
	void enterAndExpr(CQL2Parser.AndExprContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#andExpr}.
	 * @param ctx the parse tree
	 */
	void exitAndExpr(CQL2Parser.AndExprContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#notExpr}.
	 * @param ctx the parse tree
	 */
	void enterNotExpr(CQL2Parser.NotExprContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#notExpr}.
	 * @param ctx the parse tree
	 */
	void exitNotExpr(CQL2Parser.NotExprContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#primaryExpr}.
	 * @param ctx the parse tree
	 */
	void enterPrimaryExpr(CQL2Parser.PrimaryExprContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#primaryExpr}.
	 * @param ctx the parse tree
	 */
	void exitPrimaryExpr(CQL2Parser.PrimaryExprContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#predicate}.
	 * @param ctx the parse tree
	 */
	void enterPredicate(CQL2Parser.PredicateContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#predicate}.
	 * @param ctx the parse tree
	 */
	void exitPredicate(CQL2Parser.PredicateContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#comparison}.
	 * @param ctx the parse tree
	 */
	void enterComparison(CQL2Parser.ComparisonContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#comparison}.
	 * @param ctx the parse tree
	 */
	void exitComparison(CQL2Parser.ComparisonContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#inPredicate}.
	 * @param ctx the parse tree
	 */
	void enterInPredicate(CQL2Parser.InPredicateContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#inPredicate}.
	 * @param ctx the parse tree
	 */
	void exitInPredicate(CQL2Parser.InPredicateContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#betweenPredicate}.
	 * @param ctx the parse tree
	 */
	void enterBetweenPredicate(CQL2Parser.BetweenPredicateContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#betweenPredicate}.
	 * @param ctx the parse tree
	 */
	void exitBetweenPredicate(CQL2Parser.BetweenPredicateContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#likePredicate}.
	 * @param ctx the parse tree
	 */
	void enterLikePredicate(CQL2Parser.LikePredicateContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#likePredicate}.
	 * @param ctx the parse tree
	 */
	void exitLikePredicate(CQL2Parser.LikePredicateContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#nullPredicate}.
	 * @param ctx the parse tree
	 */
	void enterNullPredicate(CQL2Parser.NullPredicateContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#nullPredicate}.
	 * @param ctx the parse tree
	 */
	void exitNullPredicate(CQL2Parser.NullPredicateContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#spatialPredicate}.
	 * @param ctx the parse tree
	 */
	void enterSpatialPredicate(CQL2Parser.SpatialPredicateContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#spatialPredicate}.
	 * @param ctx the parse tree
	 */
	void exitSpatialPredicate(CQL2Parser.SpatialPredicateContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#literalList}.
	 * @param ctx the parse tree
	 */
	void enterLiteralList(CQL2Parser.LiteralListContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#literalList}.
	 * @param ctx the parse tree
	 */
	void exitLiteralList(CQL2Parser.LiteralListContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#literal}.
	 * @param ctx the parse tree
	 */
	void enterLiteral(CQL2Parser.LiteralContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#literal}.
	 * @param ctx the parse tree
	 */
	void exitLiteral(CQL2Parser.LiteralContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#operator}.
	 * @param ctx the parse tree
	 */
	void enterOperator(CQL2Parser.OperatorContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#operator}.
	 * @param ctx the parse tree
	 */
	void exitOperator(CQL2Parser.OperatorContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#valueExpr}.
	 * @param ctx the parse tree
	 */
	void enterValueExpr(CQL2Parser.ValueExprContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#valueExpr}.
	 * @param ctx the parse tree
	 */
	void exitValueExpr(CQL2Parser.ValueExprContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#arithmeticExpr}.
	 * @param ctx the parse tree
	 */
	void enterArithmeticExpr(CQL2Parser.ArithmeticExprContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#arithmeticExpr}.
	 * @param ctx the parse tree
	 */
	void exitArithmeticExpr(CQL2Parser.ArithmeticExprContext ctx);
	/**
	 * Enter a parse tree produced by {@link CQL2Parser#arrayExpr}.
	 * @param ctx the parse tree
	 */
	void enterArrayExpr(CQL2Parser.ArrayExprContext ctx);
	/**
	 * Exit a parse tree produced by {@link CQL2Parser#arrayExpr}.
	 * @param ctx the parse tree
	 */
	void exitArrayExpr(CQL2Parser.ArrayExprContext ctx);
}