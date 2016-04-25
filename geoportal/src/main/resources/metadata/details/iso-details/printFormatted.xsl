<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<!--
Print the text of an XML element as preformatted text or wrapped paragraphs,
as appropriate. Makes the text readable on screen, and preserves the author's
intended formatting.

Created 6/20/06  Richard.Fozzard@noaa.gov

 @version $Id$

The stylesheet that imports this file needs to define two callback templates:
    printFormattedLine  Output a line, preserving all formatting (whitespace)
    printParagraphLine  Output a line as a continuous paragraph (word-wrapped)
both with the param "line", the one line string to print. 

Each callback template then outputs the "line" string as desired (e.g. HTML, 
text, XML). These templates can have some optional params which printFormatted 
will pass through as needed:
    "restOfString"  Useful for doing something different at the end, e.g. no <P>
    "optional-param-1"  Useful for passing indent values
    "optional-param-2"  or word wrap widths...
    "optional-param-3"  or whatever...

Then, whenever a string of one or more lines needs to be output, call the
printFormatted template with the params:
    "elementContent"            a one or more line string to print
    "formattedSectionElement"   Name of element to wrap a sequence of formatted lines
                                    defaults to 'PRE', can be none, i.e. ''
    plus any of the desired optional params for the callbacks
-->
	<!--
  g-fold-width
    This parameter specifies the maximum length of a line when the
    formattedSectionElement (<pre> by default) is used. The browser
    may wrap PRE text at this width.
    [only works in Firefox 1+]
-->
	<!-- xsl:param name="g-fold-width" select="'80'"/ -->
	<!-- Whitespace characters -->
	<xsl:variable name="newline">
		<xsl:text>&#10;</xsl:text>
	</xsl:variable>
	<xsl:variable name="tab">
		<xsl:text>&#9;</xsl:text>
	</xsl:variable>
	<xsl:template name="printFormatted">
		<!-- string to print out -->
		<xsl:param name="elementContent"/>
		<!-- Name of element to wrap a sequence of formatted lines. 
            Set to empty string for no element, i.e. plain text output. -->
		<xsl:param name="formattedSectionElement" select="'PRE'"/>
		<!-- used internally to skip 1 or more formatted lines -->
		<xsl:param name="skipFormattedLines" select="false()"/>
		<!-- if needed by callback template: -->
		<xsl:param name="optional-param-1"/>
		<xsl:param name="optional-param-2"/>
		<xsl:param name="optional-param-3"/>
		<xsl:if test="$elementContent">
			<!-- if not at end of string -->
			<xsl:variable name="containsNewline" select="contains($elementContent,$newline)"/>
			<xsl:variable name="firstLine">
				<xsl:call-template name="strip-trailing-whitespace">
					<xsl:with-param name="content">
						<xsl:choose>
							<xsl:when test="$containsNewline">
								<xsl:value-of select="substring-before($elementContent,$newline)"/>
							</xsl:when>
							<xsl:otherwise>
								<xsl:value-of select="$elementContent"/>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:with-param>
				</xsl:call-template>
			</xsl:variable>
			<xsl:variable name="restOfString" select="substring-after($elementContent,$newline)"/>
			<!-- This line is formatted if it has 3 spaces or a tab or empty line -->
			<xsl:variable name="thisLineFormatted" select="$firstLine = '' or contains($firstLine,'   ') or contains($firstLine,$tab)"/>
			<xsl:choose>
				<!-- if a formatted line -->
				<xsl:when test="$thisLineFormatted = true()">
					<!-- if at start of a formatted section, and it's a non-empty line before the end of the element, print it -->
					<xsl:if test="not($skipFormattedLines) and (normalize-space($firstLine) or normalize-space($restOfString))">
						<xsl:choose>
							<!-- if specified, wrap a formatted section (1 or more lines) in an element -->
							<xsl:when test="$formattedSectionElement">
								<xsl:element name="{$formattedSectionElement}">
									<xsl:attribute name="wrap"/>
									<!-- works on Firefox 1.5+, not on IE 6/7, Safari 2 -->
									<!-- xsl:attribute name="width"><xsl:value-of select="$g-fold-width"/></xsl:attribute -->
									<xsl:call-template name="printFormattedSection">
										<xsl:with-param name="elementContent" select="$elementContent"/>
										<xsl:with-param name="optional-param-1" select="$optional-param-1"/>
										<xsl:with-param name="optional-param-2" select="$optional-param-2"/>
										<xsl:with-param name="optional-param-3" select="$optional-param-3"/>
									</xsl:call-template>
								</xsl:element>
							</xsl:when>
							<!-- else if no element specified, 
                            output a formatted section (1 or more lines) directly -->
							<xsl:otherwise>
								<xsl:call-template name="printFormattedSection">
									<xsl:with-param name="elementContent" select="$elementContent"/>
									<xsl:with-param name="optional-param-1" select="$optional-param-1"/>
									<xsl:with-param name="optional-param-2" select="$optional-param-2"/>
									<xsl:with-param name="optional-param-3" select="$optional-param-3"/>
								</xsl:call-template>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:if>
					<!-- go to next line, recursively until next non-formatted line or end of string -->
					<xsl:call-template name="printFormatted">
						<xsl:with-param name="elementContent" select="$restOfString"/>
						<xsl:with-param name="formattedSectionElement" select="$formattedSectionElement"/>
						<xsl:with-param name="skipFormattedLines" select="true()"/>
						<xsl:with-param name="optional-param-1" select="$optional-param-1"/>
						<xsl:with-param name="optional-param-2" select="$optional-param-2"/>
						<xsl:with-param name="optional-param-3" select="$optional-param-3"/>
					</xsl:call-template>
				</xsl:when>
				<!-- else not a formatted line; treat as paragraph -->
				<xsl:otherwise>
					<!-- make callback to importing stylesheet to print the paragraph -->
					<xsl:call-template name="printParagraphLine">
						<xsl:with-param name="line" select="$firstLine"/>
						<xsl:with-param name="restOfString" select="$restOfString"/>
						<xsl:with-param name="optional-param-1" select="$optional-param-1"/>
						<xsl:with-param name="optional-param-2" select="$optional-param-2"/>
						<xsl:with-param name="optional-param-3" select="$optional-param-3"/>
					</xsl:call-template>
					<!-- go to next line, recursively until non-formatted line or end of string -->
					<xsl:call-template name="printFormatted">
						<xsl:with-param name="elementContent" select="$restOfString"/>
						<xsl:with-param name="formattedSectionElement" select="$formattedSectionElement"/>
						<xsl:with-param name="skipFormattedLines" select="false()"/>
						<xsl:with-param name="optional-param-1" select="$optional-param-1"/>
						<xsl:with-param name="optional-param-2" select="$optional-param-2"/>
						<xsl:with-param name="optional-param-3" select="$optional-param-3"/>
					</xsl:call-template>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:if>
	</xsl:template>
	<xsl:template name="printFormattedSection">
		<xsl:param name="elementContent"/>
		<!-- string to print out -->
		<!-- if needed by callback template: -->
		<xsl:param name="optional-param-1"/>
		<xsl:param name="optional-param-2"/>
		<xsl:param name="optional-param-3"/>
		<xsl:if test="$elementContent">
			<!-- if not at end of string -->
			<xsl:variable name="firstLine">
				<xsl:call-template name="strip-trailing-whitespace">
					<xsl:with-param name="content" select="substring-before($elementContent,$newline)"/>
				</xsl:call-template>
			</xsl:variable>
			<xsl:variable name="restOfString" select="substring-after($elementContent,$newline)"/>
			<!-- This line is formatted if it has 3 spaces or a tab or empty line -->
			<xsl:variable name="thisLineFormatted" select="$firstLine = '' or contains($firstLine,'   ') or contains($firstLine,$tab)"/>
			<xsl:if test="$thisLineFormatted = true()">
				<!-- if a formatted line -->
				<!-- make callback to importing stylesheet to print the formatted line -->
				<xsl:call-template name="printFormattedLine">
					<xsl:with-param name="line" select="$firstLine"/>
					<xsl:with-param name="restOfString" select="$restOfString"/>
					<xsl:with-param name="optional-param-1" select="$optional-param-1"/>
					<xsl:with-param name="optional-param-2" select="$optional-param-2"/>
					<xsl:with-param name="optional-param-3" select="$optional-param-3"/>
				</xsl:call-template>
				<!-- recursively call self until all formatted lines written -->
				<xsl:call-template name="printFormattedSection">
					<xsl:with-param name="elementContent" select="$restOfString"/>
					<xsl:with-param name="optional-param-1" select="$optional-param-1"/>
					<xsl:with-param name="optional-param-2" select="$optional-param-2"/>
					<xsl:with-param name="optional-param-3" select="$optional-param-3"/>
				</xsl:call-template>
			</xsl:if>
			<!-- do nothing and end recursion if we find a non-formatted, plain line -->
		</xsl:if>
	</xsl:template>
	<!--
  Strip the leading white space (including newlines or other characters
  that get translated to white space by normalize-space) from a block
  of text.
  
  [Stolen from somewhere on the web using Google.]
-->
	<xsl:template name="strip-leading-whitespace">
		<xsl:param name="content"/>
		<xsl:variable name="normalized-text" select="normalize-space($content)"/>
		<xsl:variable name="first-char" select="substring($normalized-text,1,1)"/>
		<xsl:variable name="leading-spaces" select="substring-before($content,$first-char)"/>
		<xsl:choose>
			<xsl:when test="string-length($leading-spaces) &gt; 0">
				<xsl:value-of select="substring-after($content,$leading-spaces)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$content"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<!--
  Strip the trailing white space (including newlines or other characters
  that get translated to white space by normalize-space) from a block
  of text.
  
  [Stolen from somewhere on the web using Google.]
-->
	<xsl:template name="strip-trailing-whitespace">
		<xsl:param name="content"/>
		<xsl:param name="i" select="string-length($content)"/>
		<xsl:choose>
			<xsl:when test="translate(substring($content, $i, 1), ' &#9;&#10;&#13;', '')">
				<xsl:value-of select="substring($content,1,$i)"/>
			</xsl:when>
			<xsl:when test="$i &lt; 2"/>
			<!-- done! -->
			<xsl:otherwise>
				<xsl:call-template name="strip-trailing-whitespace">
					<xsl:with-param name="content" select="$content"/>
					<xsl:with-param name="i" select="$i - 1"/>
				</xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>
