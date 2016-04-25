<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gmi="http://www.isotc211.org/2005/gmi" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xlink="http://www.w3.org/1999/xlink">
	<!--
	Created: Sept 15, 2009, AMilan -
	Used to display content of tags and test for @nilReason, @indeterminatePosition, replace single quotes and endash
	-->
	<xsl:strip-space elements="*"/>
	<xsl:param name="singleQuote">&#39;</xsl:param>
	<xsl:param name="rightQuote">&#8217;</xsl:param>
	<xsl:param name="enDash">–</xsl:param>
	<xsl:param name="normalDash">-</xsl:param>
	<xsl:template name="displayElement" match="/">
		<xsl:variable name="value">
			<xsl:choose>
				<xsl:when test="contains(normalize-space(.),$singleQuote)">
					<xsl:variable name="value1">
						<xsl:value-of select="translate(normalize-space(.), $singleQuote, $rightQuote)"/>
					</xsl:variable>
					<xsl:choose>
						<xsl:when test="contains($value1,$enDash)">
							<xsl:value-of select="translate($value1, $enDash, $normalDash)"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$value1"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:when>
				<xsl:when test="contains(normalize-space(.),$enDash)">
					<xsl:value-of select="translate(normalize-space(.), $enDash, $normalDash)"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="normalize-space(.)"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:choose>
			<xsl:when test="./@gco:nilReason"> (<xsl:value-of select="local-name(.)"/><xsl:text> is </xsl:text><xsl:value-of select="./@gco:nilReason"/>) </xsl:when>
			<xsl:when test="./@indeterminatePosition">
				<xsl:value-of select="./@indeterminatePosition"/>
				<xsl:text> </xsl:text>
				<xsl:value-of select="$value"/>
			</xsl:when>
			<xsl:when test="./@xlink:href"> &lt;a href=&quot;<xsl:value-of select="normalize-space(./@xlink:href)"/><xsl:value-of select="normalize-space(./@xlink:href)"/></xsl:when>
			<xsl:when test="./gco:Boolean">
				<xsl:if test="./gco:Boolean='false'">No</xsl:if>
				<xsl:if test="./gco:Boolean='true'">Yes</xsl:if>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$value"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>
