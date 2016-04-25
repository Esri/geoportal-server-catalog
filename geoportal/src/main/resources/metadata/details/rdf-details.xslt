<?xml version="1.0" encoding="utf-8"?>
<!--
 See the NOTICE file distributed with
 this work for additional information regarding copyright ownership.
 Esri Inc. licenses this file to You under the Apache License, Version 2.0
 (the "License"); you may not use this file except in compliance with
 the License.  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dct="http://purl.org/dc/terms/" xmlns:dcmiBox="http://dublincore.org/documents/2000/07/11/dcmi-box/" xmlns:ows="http://www.opengis.net/ows">
	<xsl:output method="html" indent="yes" encoding="UTF-8"/>
	<xsl:strip-space elements="*"/>
	<xsl:template match="/">
		<xsl:variable name="rdf" select="/rdf:RDF/rdf:Description/dc:title"/>
		<style>
		.rdfBody {font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 16pt; color: #333333}
		.rdfBody .toolbarTitle {font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 14pt; color: #333333; margin:0px;}
		.rdfBody .headTitle {  font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 11pt; color: #333333; font-weight: bold}
		.rdfBody dl {margin-left: 20px;}
		.rdfBody em {font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 10pt; font-weight: bold; color: #333333}
		.rdfBody a:link {color: #B66B36; text-decoration: underline}
		.rdfBody a:visited {color: #B66B36; text-decoration: underline}
		.rdfBody a:hover {color: #4E6816; text-decoration: underline}
		.rdfBody li {font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 14pt; color: #333333}
	</style>
		<div class="rdfBody">
			<h1 class="toolbarTitle">
				<xsl:value-of select="$rdf"/>
			</h1>
			<hr/>
			<h3 class="headTitle">
				<xsl:text>RDF Metadata</xsl:text>
			</h3>
			<dl>
				<xsl:apply-templates select="/rdf:RDF/rdf:Description"/>
			</dl>
		</div>
	</xsl:template>
	
	<xsl:template match="*">
		<xsl:choose>
			<xsl:when test="@value">
				<xsl:call-template name="get_text">
					<xsl:with-param name="el">
						<xsl:value-of select="local-name()"/>
					</xsl:with-param>
				</xsl:call-template>
				<xsl:value-of select="@value"/>
			</xsl:when>
			<xsl:when test="./*[@value]">
				<dt>
					<xsl:call-template name="get_text">
						<xsl:with-param name="el">
							<xsl:value-of select="local-name()"/>
						</xsl:with-param>
					</xsl:call-template>
				</dt>
				<xsl:apply-templates select="*"/>
			</xsl:when>
			<xsl:when test="*">
				<dt>
					<xsl:call-template name="get_text">
						<xsl:with-param name="el">
							<xsl:value-of select="local-name()"/>
						</xsl:with-param>
					</xsl:call-template>
				</dt>
				<dl>
					<xsl:apply-templates select="*"/>
				</dl>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="text() != &apos;&apos;">
					<dt>
						<xsl:call-template name="get_text">
							<xsl:with-param name="el">
								<xsl:value-of select="local-name()"/>
							</xsl:with-param>
						</xsl:call-template>
						<xsl:apply-templates select="text()"/>
					</dt>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template mode="other" match="*">
		<xsl:param name="number"/>
		<xsl:if test="$number = 0">
			<hr/>
			<h3 class="headTitle">
				<xsl:text>Other markup</xsl:text>
			</h3>
		</xsl:if>
		<xsl:choose>
			<xsl:when test="*">
				<dl>
					<dt>
						<em>
							<xsl:value-of select="local-name()"/>
							<xsl:text>:</xsl:text>
						</em>
					</dt>
					<xsl:apply-templates mode="other">
						<xsl:with-param select="$number+1" name="number"/>
					</xsl:apply-templates>
				</dl>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="text() != &apos;&apos;">
					<dt>
						<em>
							<xsl:value-of select="local-name()"/>
							<xsl:text>:</xsl:text>
						</em>
						<xsl:value-of select="text()"/>
					</dt>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template name="get_text">
		<xsl:param name="el"/>
		<em>
			<xsl:choose>
				<xsl:when test="$el = &quot;Description&quot;">Description:&#32;</xsl:when>
				<xsl:when test="$el = &quot;title&quot;">title:&#32;</xsl:when>
				<xsl:when test="$el = &quot;description&quot;">Description:&#32;</xsl:when>
				<xsl:when test="$el = &quot;abstract&quot;">Abstract:&#32;</xsl:when>
				<xsl:when test="$el = &quot;identifier&quot;">Identifier:&#32;</xsl:when>
				<xsl:when test="$el = &quot;creator&quot;">Creator:&#32;</xsl:when>
				<xsl:when test="$el = &quot;references&quot;">References:&#32;</xsl:when>
				<xsl:when test="$el = &quot;subject&quot;">Subject:&#32;</xsl:when>
				<xsl:when test="$el = &quot;WGS84BoundingBox&quot;">Bounding Box:&#32;</xsl:when>
				<xsl:when test="$el = &quot;LowerCorner&quot;">Lower Corner:&#32;</xsl:when>
				<xsl:when test="$el = &quot;UpperCorner&quot;">Upper Corner:&#32;</xsl:when>
				<xsl:when test="$el = &quot;attribSet&quot;">Attributes:&#32;</xsl:when>
				<xsl:when test="$el = &quot;VectSpatRep&quot;">Spatial Representation - Vector:&#32;</xsl:when>
				<xsl:when test="$el = &quot;value&quot;">Value:&#32;</xsl:when>
				<!-- All Other Tags -->
				<xsl:otherwise>(<xsl:value-of select="$el"/>
					<xsl:text>):</xsl:text>
				</xsl:otherwise>
			</xsl:choose>
		</em>
	</xsl:template>

	<xsl:template match="text()">
		<xsl:value-of select="."/>
	</xsl:template>

	<xsl:template match="dct:references">
		<xsl:if test="text() != &apos;&apos;">
			<dt>
				<xsl:call-template name="get_text">
					<xsl:with-param name="el">
						<xsl:value-of select="local-name()"/>
					</xsl:with-param>
				</xsl:call-template>
				<xsl:element name="a">
					<xsl:attribute name="href">
						<xsl:value-of select="."/>
					</xsl:attribute>
					<xsl:attribute name="target">_new</xsl:attribute>
					<xsl:value-of select="."/>
				</xsl:element>
			</dt>
		</xsl:if>
	</xsl:template>
</xsl:stylesheet>