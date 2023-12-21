<?xml version="1.0" encoding="UTF-8"?>

<!--
    Document   : identity.xsl
    Created on : December 13, 2023
    Author     : Marten
    Description: Perform identity transform on the metadata.
-->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
   <xsl:template match="/ | @* | node()">
         <xsl:copy>
               <xsl:apply-templates select="@* | node()" />
         </xsl:copy>
   </xsl:template>
</xsl:stylesheet>