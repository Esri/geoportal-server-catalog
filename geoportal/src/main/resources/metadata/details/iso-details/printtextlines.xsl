<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<!--
Print an XML element as plain formatted text or wrapped paragraphs,
as appropriate. Makes the text readable on screen, and preserves the author's
intended formatting.

[The 'fold' and 'chop' templates come from original xml-to-text.xsl by Joe 
Shirley.]

Created 6/20/06  Richard.Fozzard@noaa.gov

 @version $Id$

This file defines two callback templates used by printFormatted.xsl:
    printFormattedLine  Output a line, preserving all formatting (whitespace)
    printParagraphLine  Output a line as a continuous paragraph (word-wrapped)

-->
	<!--
  g-fold-width
    This parameter specifies the maximum length of a line when the
    'fold' text formatting option is chosen. This parameter is ignored
    for other text formatting options.
-->
	<xsl:param name="g-fold-width" select="'80'"/>
	<!--
  g-fold-character
    This parameter specifies where a line may be broken when the
    'fold' text formatting option is chosen. This parameter is ignored
    for other text formatting options.
-->
	<xsl:param name="g-fold-character" select="' '"/>
	<xsl:variable name="newline">
		<xsl:text>&#10;</xsl:text>
	</xsl:variable>
	<xsl:variable name="tab">
		<xsl:text>&#9;</xsl:text>
	</xsl:variable>
	<!-- Output a single line formatted with all white space preserved. Indent each line
  to the current indent level.
-->
	<xsl:template name="printFormattedLine">
		<xsl:param name="line"/>
		<xsl:param name="restOfString"/>
		<xsl:param name="optional-param-1"/>
		<xsl:variable name="indent" select="$optional-param-1"/>
		<!-- Print next line, unless it's a blank line after final text line. -->
		<xsl:if test="(string-length($line) &gt; 0) or (string-length(normalize-space($restOfString)) &gt; 0)">
			<xsl:value-of select="$indent"/>
			<xsl:value-of select="$line"/>
			<xsl:value-of select="$newline"/>
		</xsl:if>
	</xsl:template>
	<!-- Output a single line formatted as a word-wrapped paragraph. Indent each line
  to the current indent level. Use 'fold' template to do the word-wrapping.
-->
	<xsl:template name="printParagraphLine">
		<xsl:param name="line"/>
		<xsl:param name="restOfString"/>
		<xsl:param name="optional-param-1"/>
		<xsl:param name="optional-param-2"/>
		<xsl:variable name="indent" select="$optional-param-1"/>
		<xsl:variable name="length" select="$optional-param-2"/>
		<!-- Print line with 'fold', unless it's a blank line after final text line. -->
		<xsl:if test="(string-length($line) &gt; 0) or (string-length(normalize-space($restOfString)) &gt; 0)">
			<xsl:value-of select="$indent"/>
			<!-- fold doesn't indent first line -->
			<xsl:call-template name="fold">
				<xsl:with-param name="original-string" select="normalize-space($line)"/>
				<xsl:with-param name="length" select="$length"/>
				<xsl:with-param name="indent" select="$indent"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>
	<!--
  Text formatting template. Create line breaks. Indent each line to
  the current indent level. Return the next line each time the
  template is called.
-->
	<xsl:template name="fold">
		<xsl:param name="original-string"/>
		<xsl:param name="length"/>
		<xsl:param name="indent"/>
		<xsl:param name="fold-width" select="$g-fold-width"/>
		<xsl:variable name="printstring">
			<xsl:choose>
				<xsl:when test="string-length($original-string) &gt; number($length)">
					<!-- Text is longer than max, chop it down and print next line. -->
					<xsl:call-template name="chop">
						<xsl:with-param name="newstring" select="''"/>
						<xsl:with-param name="original-string" select="$original-string"/>
						<xsl:with-param name="length" select="$length"/>
					</xsl:call-template>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="$original-string"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:value-of select="$printstring"/>
		<xsl:value-of select="$newline"/>
		<xsl:variable name="str" select="substring-after($original-string, $printstring)"/>
		<xsl:if test="string-length($str)">
			<!-- More text, call fold recursively. -->
			<xsl:value-of select="$indent"/>
			<xsl:call-template name="fold">
				<xsl:with-param name="original-string" select="$str"/>
				<xsl:with-param name="length" select="number($fold-width) - string-length($indent)"/>
				<xsl:with-param name="indent" select="$indent"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>
	<!--
  Create line breaks. Break only at specified line break
  character. If possible keep lines less than a specified maximum
  length, otherwise break at first acceptable character after
  maximum length. Return one line each time the template is called.
-->
	<xsl:template name="chop">
		<xsl:param name="newstring"/>
		<xsl:param name="original-string"/>
		<xsl:param name="char" select="$g-fold-character"/>
		<xsl:param name="length"/>
		<xsl:variable name="str1">
			<!-- str1 is the part before the break. -->
			<xsl:choose>
				<xsl:when test="contains($original-string, $char)">
					<!-- The text contains a break character, chop it off. -->
					<xsl:value-of select="concat($newstring, substring-before($original-string, $char), $char)"/>
				</xsl:when>
				<xsl:otherwise>
					<!-- The text contains no break character, use it all. -->
					<xsl:value-of select="concat($newstring, $original-string)"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="str2">
			<!-- str2 is the part after the break. -->
			<xsl:choose>
				<xsl:when test="contains($original-string, $char)">
					<!-- The text contains a break character, take what is after that. -->
					<xsl:value-of select="substring-after($original-string, $char)"/>
				</xsl:when>
				<xsl:otherwise>
					<!-- The text contains no break character, use an empty string. -->
					<xsl:value-of select="''"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:choose>
			<xsl:when test="(string-length($str1) &lt; number($length)) and $str2">
				<xsl:variable name="return-value">
					<xsl:call-template name="chop">
						<xsl:with-param name="newstring" select="$str1"/>
						<xsl:with-param name="original-string" select="$str2"/>
						<xsl:with-param name="char" select="$char"/>
						<xsl:with-param name="length" select="$length"/>
					</xsl:call-template>
				</xsl:variable>
				<xsl:value-of select="$return-value"/>
			</xsl:when>
			<xsl:when test="$newstring">
				<xsl:value-of select="$newstring"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$str1"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>
