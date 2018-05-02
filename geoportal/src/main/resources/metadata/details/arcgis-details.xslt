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
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="html" indent="yes" encoding="UTF-8" />
    <xsl:strip-space elements="*"/>
    <xsl:template match="/">
        <style>
            .arcgisBody {font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 16pt; color: #333333}
            .arcgisBody .toolbarTitle {font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 14pt; color: #333333; margin:0px;}
            .arcgisBody .headTitle {  font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 11pt; color: #333333; font-weight: bold}
            .arcgisBody dl {margin-left: 20px;}
            .arcgisBody em {font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 10pt; font-weight: bold; color: #333333}
            .arcgisBody a:link {color: #B66B36; text-decoration: underline}
            .arcgisBody a:visited {color: #B66B36; text-decoration: underline}
            .arcgisBody a:hover {color: #4E6816; text-decoration: underline}
            .arcgisBody li {font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 14pt; color: #333333}
        </style>

        <div class="arcgisBody">
            <h1 class="toolbarTitle">
                <xsl:value-of select="/metadata/Esri/DataProperties/itemProps/itemName" />
            </h1>
            <hr/>
            <dl>
                <xsl:apply-templates select="*" />
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
				<xsl:text> </xsl:text>
				<xsl:value-of select="@value"/>
				<br/>
			</xsl:when>
			<xsl:when test="./*[@value]">
				<dt>
					<xsl:call-template name="get_text">
						<xsl:with-param name="el">
							<xsl:value-of select="local-name()"/>
						</xsl:with-param>
					</xsl:call-template>
					<dd>
						<xsl:apply-templates select="*"/>
					</dd>
				</dt>
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

    <xsl:template name="get_text">
		<xsl:param name="el"/>
		<em>
			<xsl:value-of select="$el"/><xsl:text>:</xsl:text>
		</em>
	</xsl:template>

	<xsl:template match="text()">
        <dd>
		    <xsl:value-of select="."/>
        </dd>
	</xsl:template>
</xsl:stylesheet>