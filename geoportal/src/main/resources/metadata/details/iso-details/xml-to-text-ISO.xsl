<?xml version="1.0" encoding="UTF-8"?>
<!-- Top level directives -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gml="http://www.opengis.net/gml" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gmi="http://www.isotc211.org/2005/gmi" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xlink="http://www.w3.org/1999/xlink">
	<xsl:import href="printFormatted.xsl"/>
	<xsl:import href="printTextLines.xsl"/>
	<xsl:output method="html" indent="no"/>
	<!-- Global parameters -->
	<!-- 
  g-tag-translation-URI 
    This parameter specifies the URI of the external document
    containing the lookup table for the tag name translation. The
    default is the name of a file in the same directory as the
    stylesheet. Make sure this is a network accessible URI if
    delivering to a browser for translation.
-->
	<xsl:param name="g-tag-translation-URI" select="'elements-ISO.xml'"/>
	<!--
  g-indent-increment
    This parameter specifies the character string to be added before a
    label for each level of indentation. I.e. if you want each level
    indented by four spaces, then make this a four space character
    string. Set this to the empty string to forego indenting.
-->
	<xsl:param name="g-indent-increment" select="'  '"/>
	<!--
  g-fold-width
    This parameter specifies the maximum length of a line when
    word-wrapping lines. It must match the value specified in
    printTextLines.xsl.
-->
	<xsl:param name="g-fold-width" select="'120'"/>
	<!--
  g-text-field-handler
    This parameter specifies the handler to use for formatting text
    fields. The choices are 'fold' to fold lines at a maximum length
    and 'print-lines' to print lines with line breaks preserved as in
    the source XML document. If unspecified, or if an invalid choice
    is specified, 'print-lines' will be used.
  
  [OBSOLETE: replaced by printFormatted template]
-->
	<xsl:param name="g-text-field-handler" select="'print-lines'"/>
	<!-- Global variables -->
	<xsl:variable name="newline">
		<xsl:text>&#xA;</xsl:text>
	</xsl:variable>
	<!-- Get the g-tag-translation-URI (elements.xml) node-set just once.
    This should improve performance on large XML files.
    This also works around a memory-leak problem using JSTL \<x:transform xsltSystemId
    (the memory-leak may also be present in direct Transformer calls from Java).
    /// We see this in Xalan 2.6.0; is it fixed in 2.7.0 ?
-->
	<xsl:variable name="g-tag-translations" select="document($g-tag-translation-URI)"/>
	<!-- Templates -->
	<xsl:template match="/">
		<html>
			<body>
				<pre>
						<xsl:apply-templates select="*"/>
					</pre>
			</body>
		</html>
	</xsl:template>
	<!--
  Apply to all elements. Determine whether it's a compound or text element
  and call the appropriate template.
-->
	<xsl:template match="*">
		<xsl:param name="indent" select="''"/>
		<xsl:param name="indent-increment" select="$g-indent-increment"/>
		<xsl:variable name="tagname" select="name()"/>
		<xsl:variable name="tag-longname" select="$g-tag-translations/*/name[@tagname=$tagname]"/>
		<xsl:variable name="tag-translation">
			<!-- Display long name if we can translate the tag, else just display the tag name itself -->
			<xsl:choose>
				<xsl:when test="$tag-longname">
					<xsl:value-of select="$tag-longname"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="$tagname"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="output">
			<!-- do not output element names w/ gco namespaces -->
			<xsl:if test="not(contains($tag-translation, 'gco'))">
				<xsl:value-of select="concat($indent, $tag-translation, ': ')"/>
			</xsl:if>
		</xsl:variable>
		<xsl:if test="string-length(normalize-space($tag-translation)) &gt; 0">
			<b>
				<xsl:value-of select="$output"/>
			</b>
		</xsl:if>
		<xsl:choose>
			<xsl:when test="*">
				<!-- This is a compound element (i.e., it has children) -->
				<xsl:choose>
					<xsl:when test="string-length(normalize-space($tag-translation)) &gt; 0">
						<!-- There is a tag translation -->
						<xsl:value-of select="$newline"/>
						<xsl:apply-templates select="*">
							<xsl:with-param name="indent" select="concat($indent, $indent-increment)"/>
						</xsl:apply-templates>
					</xsl:when>
					<xsl:otherwise>
						<!-- No tag translation -->
						<xsl:apply-templates select="*">
							<xsl:with-param name="indent" select="concat($indent, $indent-increment)"/>
						</xsl:apply-templates>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<!-- else a content element: display the text -->
			<xsl:otherwise>
				<!-- if tag name has gco namespace - do not add a new line-->
				<xsl:if test="not(contains($tag-translation,'gco'))">
					<xsl:value-of select="$newline"/>
				</xsl:if>
				<!-- Call the imported printFormatted template to print both
            preformatted text and word-wrapped paragraphs. 
            This will parse each line, and call back to the
            printFormattedLine and printParagraphLine templates
            in this file. -->
				<xsl:call-template name="printFormatted">
					<xsl:with-param name="elementContent">
						<!-- strip leading whitespace only from first line of text -->
						<xsl:call-template name="strip-leading-whitespace">
							<!-- display element attributes OR content (note: not all attributes are included for translation-->
							<xsl:with-param name="content" select="@codeListValue|@gco:nilReason|@indeterminatePosition|@xlink:href|node()"/>
						</xsl:call-template>
					</xsl:with-param>
					<xsl:with-param name="startFormattedSectionString" select="''"/>
					<!-- nothing needed -->
					<xsl:with-param name="endFormattedSectionString" select="''"/>
					<!-- nothing needed -->
					<xsl:with-param name="optional-param-1" select="concat($indent, $indent-increment)"/>
					<xsl:with-param name="optional-param-2" select="number($g-fold-width) - string-length($indent)"/>
				</xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<!--
  Text formatting template. Use existing line breaks. Indent each line
  to the current indent level. Return the next line each time the template
  is called.  
  -->
</xsl:stylesheet>
