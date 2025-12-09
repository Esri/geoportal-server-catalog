// Generated from src/main/antlr4/CQL2.g4 by ANTLR 4.13.1
package com.esri.geoportal.service.stac.filter;
import org.antlr.v4.runtime.tree.ParseTreeVisitor;

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by {@link CQL2Parser}.
 *
 * @param <T> The return type of the visit operation. Use {@link Void} for
 * operations with no return type.
 */
public interface CQL2Visitor<T> extends ParseTreeVisitor<T> {
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#query}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitQuery(CQL2Parser.QueryContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#expression}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitExpression(CQL2Parser.ExpressionContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#orExpr}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitOrExpr(CQL2Parser.OrExprContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#andExpr}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitAndExpr(CQL2Parser.AndExprContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#notExpr}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitNotExpr(CQL2Parser.NotExprContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#primaryExpr}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitPrimaryExpr(CQL2Parser.PrimaryExprContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#predicate}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitPredicate(CQL2Parser.PredicateContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#comparison}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitComparison(CQL2Parser.ComparisonContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#inPredicate}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitInPredicate(CQL2Parser.InPredicateContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#betweenPredicate}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitBetweenPredicate(CQL2Parser.BetweenPredicateContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#likePredicate}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitLikePredicate(CQL2Parser.LikePredicateContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#nullPredicate}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitNullPredicate(CQL2Parser.NullPredicateContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#spatialPredicate}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitSpatialPredicate(CQL2Parser.SpatialPredicateContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#literalList}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitLiteralList(CQL2Parser.LiteralListContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#literal}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitLiteral(CQL2Parser.LiteralContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#operator}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitOperator(CQL2Parser.OperatorContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#valueExpr}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitValueExpr(CQL2Parser.ValueExprContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#arithmeticExpr}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitArithmeticExpr(CQL2Parser.ArithmeticExprContext ctx);
	/**
	 * Visit a parse tree produced by {@link CQL2Parser#arrayExpr}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitArrayExpr(CQL2Parser.ArrayExprContext ctx);
}