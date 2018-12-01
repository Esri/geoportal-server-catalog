<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" 
  xmlns:res="http://www.esri.com/metadata/res/" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
  xmlns:gmd="http://www.isotc211.org/2005/gmd" 
   exclude-result-prefixes="xsl gmd res" >

<!-- An XSLT template for displaying metadata that is stored in the ArcGIS metadata format.
Modified from ESRI xslt, for use by ESRI Geoportal 
Copyright (c) 2009-2010, Environmental Systems Research Institute, Inc. All rights reserved.
Revision History: Created 3/19/2009 avienneau
2011-10-17 SMR simplified so just does ISO19139 for USGIN. This is just a shell; actual transformation 
is done ISO19139usgin.xslt. Leave it here so nothing in Geoportal gets broken...

2018-05-03 SMR update to display results on map, use the map widget from IEDA dataset landing pages;
a google maps API, base map is GMRT WMS from IEDA. Updates in this script import updates xslts
generalwMap.xslt brings in the javascript to build the map
iso19139usginwMap.xslt has handler (showMap template) to build the form and div element for the map.
-->

  <xsl:import href = "Imports/generalwMap.xslt" />
  <xsl:import href = "Imports/iso19139usginwMap.xslt" />
  <xsl:import href = "Imports/XML.xslt"/>
  <xsl:import href = "Imports/codelists.xslt" />
  <xsl:import href = "Imports/auxCountries.xslt" />
  <xsl:import href = "Imports/auxUCUM.xslt" />

<!-- this file contains the iso2sdo transform, which is called by name -->
  <xsl:import href = "ISO19139ToSchemaOrgDataset1.0.xslt" />
  <xsl:param name="isopath"></xsl:param>
  <xsl:param name="flowdirection"/>
<!--  <xsl:output method="xml" indent="yes" encoding="UTF-8" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" />-->
  <xsl:output method="html" indent="yes" encoding="UTF-8"/>
  <xsl:variable name="iso19139" select="count(//*[(local-name() = 'MD_Metadata') or (local-name() = 'MI_Metadata')])>0 " />

  <xsl:template match="/">
  <html xmlns="http://www.w3.org/1999/xhtml">
  <xsl:if test="/*/@xml:lang[. != '']">
	  <xsl:attribute name="xml:lang"><xsl:value-of select="/*/@xml:lang"/></xsl:attribute>
	  <xsl:attribute name="lang"><xsl:value-of select="/*/@xml:lang"/></xsl:attribute>
  </xsl:if>
  
  <head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
    <xsl:call-template name="styles" />
    <xsl:call-template name="scripts" />
    
    <script type="application/ld+json">
      <xsl:text>&#10;</xsl:text>
      <xsl:call-template name="iso2sdo">
        <xsl:with-param name="isopath" select="$isopath"/>
      </xsl:call-template>
      <xsl:text>&#10;</xsl:text>
    </script>
    
  </head>

  <body oncontextmenu="return true">
<!--    <xsl:value-of select="string($isopath)"/>-->
   
  <xsl:if test="$flowdirection = 'RTL'">
    <xsl:attribute name="style">direction:rtl;</xsl:attribute>
  </xsl:if>
    
	<xsl:if test="$iso19139">
		<xsl:call-template name="iso19139">
		  <xsl:with-param name="isopath" select="$isopath"/>
		</xsl:call-template> 
	</xsl:if>

	<xsl:if test="not($iso19139)">
		<xsl:call-template name="unknown" /> 
	</xsl:if>

  </body>
  </html>

</xsl:template>

</xsl:stylesheet>