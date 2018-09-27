<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:res="http://www.esri.com/metadata/res/">
	<!-- An XSLT template for displaying metadata that is stored in the ISO 19139 metadata format.

     Copyright (c) 2009-2010, Environmental Systems Research Institute, Inc. All rights reserved.
	
     Revision History: Created 4/21/2009 avienneau -->
	 <!-- smr 2014-01-29
	 fix bug with brows graphic URL; 
	 modify formatting to make more compact
	 fix bad call for template to get metadata section inforamtion displayed -->
	<!-- SMR add imports 2012-09-07 -->
	<xsl:import href = "general.xslt" />
	<xsl:import href = "XML.xslt" />
	<xsl:import href = "codelists.xslt" />
	<xsl:import href = "auxLanguages.xslt" />
	<xsl:import href = "auxCountries.xslt" />
	<xsl:import href = "auxUCUM.xslt" />
	
	<xsl:output method="xml" indent="yes" encoding="UTF-8" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>
	<xsl:template name="iso19139">
	<xsl:apply-templates select="/gmd:MD_Metadata | /node()/gmd:MD_Metadata"  mode="test"/>	
	</xsl:template>


<xsl:template match="gmd:MD_Metadata" mode="test" >
		<h3>Metadata record format is ISO 19139 XML</h3>
		<h1>
			<xsl:value-of select="//gmd:identificationInfo//gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString"/>
		</h1>
		<xsl:variable name="dataIdInfo" select="//gmd:identificationInfo"/>
		<xsl:variable name="spatRepInfo" select="//gmd:spatialRepresentationInfo"/>
		<xsl:variable name="contInfo" select="//gmd:contentInfo"/>
		<xsl:variable name="refSysInfo" select="//gmd:referenceSystemInfo"/>
		<xsl:variable name="dqInfo" select="//gmd:dataQualityInfo"/>
		<xsl:variable name="porCatInfo" select="//gmd:portrayalCatalogueInfo"/>
		<xsl:variable name="distInfo" select="//gmd:distributionInfo"/>
		<xsl:variable name="appSchInfo" select="//gmd:applicationSchemaInfo"/>
		<xsl:variable name="mdExtInfo" select="//gmd:metadataExtensionInfo"/>
		<xsl:variable name="metadata-sections" select="
		/gmd:MD_Metadata/gmd:fileIdentifier |
		/gmd:MD_Metadata/gmd:language |
		/gmd:MD_Metadata/gmd:characterSet |
		/gmd:MD_Metadata/gmd:parentIdentifier |
		/gmd:MD_Metadata/gmd:hierarchyLevel |
		/gmd:MD_Metadata/gmd:hierarchyLevelName |
		/gmd:MD_Metadata/gmd:contact |
		/gmd:MD_Metadata/gmd:dateStamp |
		/gmd:MD_Metadata/gmd:metadataStandardName |
		/gmd:MD_Metadata/gmd:metadataStandardVersion |
		/gmd:MD_Metadata/gmd:dataSetURI |
		/gmd:MD_Metadata/gmd:metadataMaintenance |
		/gmd:MD_Metadata/gmd:metadataConstraints | 
		/gmd:MD_Metadata/gmd:locale"/>
		<ul>
			<li class="iso19139heading">ISO19139 metadata content</li>
			<!-- Resource Identification -->
			<xsl:call-template name="TOC-HEADING">
				<xsl:with-param name="nodes" select="$dataIdInfo"/>
				<xsl:with-param name="label">Resource Identification Information</xsl:with-param>
				<xsl:with-param name="sub-label"> Resource </xsl:with-param>
			</xsl:call-template>
			<!-- Spatial Representation Information  -->
			<xsl:call-template name="TOC-HEADING">
				<xsl:with-param name="nodes" select="$spatRepInfo"/>
				<xsl:with-param name="label"> Spatial representation information </xsl:with-param>
				<xsl:with-param name="sub-label"> Representation </xsl:with-param>
			</xsl:call-template>
			<!-- Content Information  -->
			<xsl:call-template name="TOC-HEADING">
				<xsl:with-param name="nodes" select="$contInfo"/>
				<xsl:with-param name="label">Content information</xsl:with-param>
				<xsl:with-param name="sub-label"> Description </xsl:with-param>
			</xsl:call-template>
			<!-- Reference System Information  -->
			<xsl:call-template name="TOC-HEADING">
				<xsl:with-param name="nodes" select="$refSysInfo"/>
				<xsl:with-param name="label">Reference System Information</xsl:with-param>
				<xsl:with-param name="sub-label">Reference System </xsl:with-param>
			</xsl:call-template>
			<!-- Data Quality Information -->
			<xsl:call-template name="TOC-HEADING">
				<xsl:with-param name="nodes" select="$dqInfo"/>
				<xsl:with-param name="label">Data Quality Information</xsl:with-param>
				<xsl:with-param name="sub-label">Data quality </xsl:with-param>
			</xsl:call-template>
			<!-- Distribution Information  -->
			<xsl:call-template name="TOC-HEADING">
				<xsl:with-param name="nodes" select="$distInfo"/>
				<xsl:with-param name="label">Distribution Information</xsl:with-param>
				<xsl:with-param name="sub-label">Distribution</xsl:with-param>
			</xsl:call-template>
			<!-- Portrayal Catalogue Reference  -->
			<xsl:call-template name="TOC-HEADING">
				<xsl:with-param name="nodes" select="$porCatInfo"/>
				<xsl:with-param name="label">Portrayal Information</xsl:with-param>
				<xsl:with-param name="sub-label"> Catalog </xsl:with-param>
			</xsl:call-template>
			<!-- Application Schema Information  -->
			<xsl:call-template name="TOC-HEADING">
				<xsl:with-param name="nodes" select="$appSchInfo"/>
				<xsl:with-param name="label">Application Schema Information</xsl:with-param>
				<xsl:with-param name="sub-label">Schema</xsl:with-param>
			</xsl:call-template>
			<!-- Metadata Extension Information  -->
			<xsl:call-template name="TOC-HEADING">
				<xsl:with-param name="nodes" select="$mdExtInfo"/>
				<xsl:with-param name="label">Metadata Extension Information</xsl:with-param>
				<xsl:with-param name="sub-label">Extension </xsl:with-param>
			</xsl:call-template>
			<!-- Metadata Identification -->
			<!-- Root node "metadata" will always exist. Only add to TOC if it contains elements
          that describe the metadata. -->
			<xsl:if test="count($metadata-sections) &gt; 0">
				<li>
					<a href="#Metadata_Information">Metadata Information</a>
				</li>
			</xsl:if>
		</ul>
		<!-- PUT METADATA CONTENT ON THE HTML PAGE  -->
		<!-- Resource Identification -->
		<xsl:apply-templates select="$dataIdInfo/*" mode="iso19139"/>
		<!-- Spatial Representation Information -->
		<xsl:apply-templates select="$spatRepInfo/*" mode="iso19139"/>
		<!-- Content Information -->
		<xsl:apply-templates select="$contInfo" mode="iso19139"/>
		<!-- NOTE: special case, see template -->
		<!-- Reference System Information -->
		<xsl:apply-templates select="$refSysInfo/*" mode="iso19139"/>
		<!-- Data Quality Information -->
		<xsl:apply-templates select="$dqInfo/*" mode="iso19139"/>
		<!-- Distribution Information -->
		<xsl:apply-templates select="$distInfo/*" mode="iso19139"/>
		<!-- Portrayal Catalogue Reference -->
		<xsl:apply-templates select="$porCatInfo/*" mode="iso19139"/>
		<!-- Application Schema Information -->
		<xsl:apply-templates select="$appSchInfo/*" mode="iso19139"/>
		<!-- Metadata Extension Information -->
		<xsl:apply-templates select="$mdExtInfo/*" mode="iso19139"/>
		<!-- Metadata Information -->
		<!-- Root node "metadata" will always exist. Only apply template if it contains elements
          that describe the metadata. -->
		<xsl:if test="count($metadata-sections) &gt; 0">
<!--			<xsl:apply-templates select="gmd:MD_Metadata" mode="iso19139"/>
-->		
		<!-- move template content here: call to template isn't working -->
		
	<!--		<xsl:template match="gmd:MD_Metadata" mode="iso19139">-->
				<a name="Metadata_Information" id="Metadata_Information">
					<hr/>
				</a>
				<dt>
					<h2>Metadata Information</h2>
				</dt>
				<dl>
					<dd>
						<xsl:for-each select="gmd:dateStamp">
							<dt>
								<span class="element">Metadata data stamp: </span>&#x2002;<xsl:call-template name="Date_PropertyType"/>
							</dt>
						</xsl:for-each>
						<xsl:apply-templates select="gmd:metadataMaintenance" mode="iso19139"/>
						<xsl:if test="gmd:dateStamp and not(gmd:metadataMaintenance)">
							<!-- <br/> -->
							<!-- <br/> -->
						</xsl:if>
						<xsl:for-each select="gmd:metadataConstraints">
							<dt>
								<span class="element">Metadata Constraints</span>
							</dt>
							<dl>
								<!-- 
						NOTE: will match sub-class templates:
						MD_LegalConstraints, MD_SecurityConstraints
				-->
								<xsl:apply-templates select="*" mode="iso19139"/>
							</dl>
						</xsl:for-each>
						<xsl:apply-templates select="gmd:contact/gmd:CI_ResponsibleParty" mode="iso19139"/>
						<xsl:for-each select="gmd:hierarchyLevel/gmd:MD_ScopeCode">
							<dt>
								<span class="element"> Metadata scope code</span>&#x2002;
								<xsl:call-template name="AnyCode"/>
							</dt>
						</xsl:for-each>
						<xsl:for-each select="gmd:hierarchyLevelName">
							<dt>
								<span class="element">Metadata hierarchy level name: </span>&#x2003;<xsl:call-template name="CharacterString"/>
							</dt>
						</xsl:for-each>
						<xsl:if test="gmd:hierarchyLevel | gmd:hierarchyLevelName">
							<!-- <br/> -->
							<!-- <br/> -->
						</xsl:if>
						<xsl:for-each select="gmd:language">
							<dt>
								<span class="element">Metadata language </span>&#x2002;
								<xsl:call-template name="CharacterString"/>
							</dt>
						</xsl:for-each>
						<xsl:for-each select="gmd:characterSet/gmd:MD_CharacterSetCode">
							<dt>
								<span class="element">Metadata character set encoding: </span>&#x2002;
								<xsl:call-template name="AnyCode"/>
							</dt>
						</xsl:for-each>
						<xsl:for-each select="gmd:locale/gmd:PT_Locale">
							<xsl:if test="position() = 1">
								<dt>
									<span class="element">Localization: </span>
								</dt>
							</xsl:if>
							<dl>
								<dd>
									<xsl:for-each select="gmd:languageCode">
										<dt>
											<span class="element">Localization language: </span>&#x2002;
											<xsl:call-template name="CharacterString">
												<xsl:with-param name="code" select="gmd:LanguageCode/@codeListValue"/>
											</xsl:call-template>
										</dt>
									</xsl:for-each>
									<dl>
										<dd>
											<xsl:for-each select="gmd:country">
												<dt>
													<span class="element">Localization country: </span>&#x2002;<xsl:apply-templates select="." mode="arcgis"/>
												</dt>
											</xsl:for-each>
											<xsl:for-each select="gmd:characterEncoding/gmd:MD_CharacterSetCode">
												<dt>
													<span class="element">Localized character encoding: </span>&#x2002;
													<xsl:call-template name="AnyCode"/>
												</dt>
											</xsl:for-each>
										</dd>
									</dl>
								</dd>
							</dl>
						</xsl:for-each>
						<xsl:if test="gmd:language | gmd:characterSet | gmd:locale">
							<!-- <br/> -->
						</xsl:if>
						<xsl:if test="(gmd:language or gmd:characterSet) and not(gmd:locale)">
							<!-- <br/> -->
						</xsl:if>
						<xsl:for-each select="gmd:metadataStandardName">
							<dt>
								<span class="element">Metadata standard for this record: </span>&#x2003;<xsl:call-template name="CharacterString"/>
							</dt>
						</xsl:for-each>
						<xsl:for-each select="gmd:metadataStandardVersion">
							<dt>
								<span class="element">standard version: </span>&#x2003;<xsl:call-template name="CharacterString"/>
							</dt>
						</xsl:for-each>
						<xsl:if test="gmd:metadataStandardName | gmd:metadataStandardVersion">
							<!-- <br/> -->
							<!-- <br/> -->
						</xsl:if>
						<xsl:for-each select="gmd:fileIdentifier">
							<dt>
								<span class="element">Metadata record identifier: </span>&#x2003;<xsl:call-template name="CharacterString"/>
							</dt>
						</xsl:for-each>
						<xsl:for-each select="gmd:parentIdentifier">
							<dt>
								<span class="element">'Parent' metadata record identifier: </span>&#x2003;<xsl:call-template name="CharacterString"/>
							</dt>
						</xsl:for-each>
						<xsl:for-each select="gmd:dataSetURI">
							<dt>
								<span class="element">URI for dataset described: ></span>&#x2003;<xsl:call-template name="CharacterString"/>
							</dt>
						</xsl:for-each>
						<xsl:if test="gmd:fileIdentifier | gmd:parentIdentifier | gmd:dataSetURI">
							<!-- <br/> -->
							<!-- <br/> -->
						</xsl:if>
					</dd>
				</dl>
				<a class="top" href="#Top">Back to top</a>
	<!--		</xsl:template>-->
		
		</xsl:if>
	</xsl:template>
	<!-- Generic template for displaying the TOC headings and links -->
	<xsl:template name="TOC-HEADING">
		<xsl:param name="nodes"/>
		<xsl:param name="label"/>
		<xsl:param name="sub-label"/>
		<xsl:if test="count($nodes) = 1">
			<xsl:for-each select="$nodes">
				<li>
					<a>
						<xsl:attribute name="href">#<xsl:value-of select="generate-id(./*[1])"/></xsl:attribute>
						<xsl:value-of select="$label"/>
					</a>
				</li>
			</xsl:for-each>
		</xsl:if>
		<xsl:if test="count($nodes) &gt; 1">
			<li>
				<xsl:value-of select="$label"/>
			</li>
			<xsl:for-each select="$nodes">
				<li style="margin-left:0.5in">
					<a>
						<xsl:attribute name="href">#<xsl:value-of select="generate-id(./*[1])"/></xsl:attribute>
						<xsl:value-of select="$sub-label"/>&#x20;<xsl:value-of select="position()"/>
					</a>
				</li>
			</xsl:for-each>
		</xsl:if>
	</xsl:template>
	
	<!-- 2 letter language code list from ISO 639 : 1988, in alphabetic order by code -->
	<xsl:template match="gmd:language | gmd:languageCode" mode="iso19139">
		<xsl:if test="gco:CharacterString">
			<xsl:call-template name="CharacterString"/>
		</xsl:if>
		<xsl:if test="gmd:LanguageCode">
			<xsl:call-template name="CharacterString">
				<xsl:with-param name="code" select="gmd:LanguageCode/@codeListValue"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>
	<!-- Maintenance Information (B.2.5 MD_MaintenanceInformation - line142) -->
	<xsl:template match="gmd:MD_MaintenanceInformation" mode="iso19139">
		<!-- match="(mdMaint | resMaint)"> -->
		<dd>
			<xsl:choose>
				<xsl:when test="../gmd:resourceMaintenance">
					<dt>
						<span class="element">Resource Maintenance Information</span>
					</dt>
				</xsl:when>
				<xsl:otherwise>
					<dt>
						<span class="element">Resource Maintenance Information</span>
					</dt>
				</xsl:otherwise>
			</xsl:choose>
			<dd>
				<dl>
					<xsl:for-each select="gmd:dateOfNextUpdate">
						<dt>
							<span class="element">date of next update: </span>&#x2002;<xsl:call-template name="Date_PropertyType"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:maintenanceAndUpdateFrequency">
						<dt>
							<span class="element">maintenance or update frequency: </span>&#x2002;
        <xsl:for-each select="gmd:MD_MaintenanceFrequencyCode">
								<xsl:call-template name="AnyCode"/>
							</xsl:for-each>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:userDefinedMaintenanceFrequency/gts:TM_PeriodDuration">
						<dt>
							<span class="element"> Time Per Btw Update </span>&#x2002;<xsl:value-of select="."/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:dateOfNextUpdate | gmd:maintenanceAndUpdateFrequency | gmd:userDefinedMaintenanceFrequency">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:updateScope/gmd:MD_ScopeCode">
						<dt>
							<span class="element">update scope: </span>&#x2002;
			<xsl:call-template name="AnyCode"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:updateScopeDescription">
						<xsl:if test="position() = 1">
							<dt>
								<span class="element">Update scope description</span>
							</dt>
						</xsl:if>
						<dl>
							<dd>
								<xsl:apply-templates select="gmd:MD_ScopeDescription" mode="iso19139"/>
							</dd>
						</dl>
						<xsl:if test="count (following-sibling::*) = 0">
							<!-- <br/> -->
						</xsl:if>
					</xsl:for-each>
					<xsl:if test="gmd:updateScope and not(gmd:updateScopeDescription)">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:maintenanceNote">
						<dt>
							<span class="element">notes: </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Time Period Information (from 19103 information in 19115 DTD) -->
	<!-- break time period string up into individual components for display?
<xsl:template match="usrDefFreq" mode="iso19139">
  <dd>
  <dt><span class="element"><res:idTimePerBtwUpdate/></span></dt>
  <dd>
  <dl>
    <xsl:for-each select="designator">
      <dt><span class="element"><res:idTimePerDes/></span>&#x2002;<xsl:value-of select="."/></dt>
    </xsl:for-each>
    <xsl:for-each select="years">
      <dt><span class="element"><res:idYrs/></span>&#x2002;<xsl:value-of select="."/></dt>
    </xsl:for-each>
    <xsl:for-each select="months">
      <dt><span class="element"><res:idMths/></span>&#x2002;<xsl:value-of select="."/></dt>
    </xsl:for-each>
    <xsl:for-each select="days">
      <dt><span class="element"><res:idDays/></span>&#x2002;<xsl:value-of select="."/></dt>
    </xsl:for-each>
    <xsl:for-each select="timeIndicator">
      <dt><span class="element"><res:idTimeInd/></span>&#x2002;<xsl:value-of select="."/></dt>
    </xsl:for-each>
    <xsl:for-each select="hours">
      <dt><span class="element"><res:idHrs/></span>&#x2002;<xsl:value-of select="."/></dt>
    </xsl:for-each>
    <xsl:for-each select="minutes">
      <dt><span class="element"><res:idMin/></span>&#x2002;<xsl:value-of select="."/></dt>
    </xsl:for-each>
    <xsl:for-each select="seconds">
      <dt><span class="element"><res:idSec/></span>&#x2002;<xsl:value-of select="."/></dt>
    </xsl:for-each>
  </dl>
  </dd>
  </dd>
  <br />
</xsl:template>
 -->
	<!-- Scope Description Information (B.2.5.1 MD_ScopeDescription - line149) -->
	<xsl:template match="gmd:MD_ScopeDescription" mode="iso19139">
		<dl>
			<dd>
				<!--<dt><span class="element"><res:idScopeDesc/></span></dt> -->
				<xsl:for-each select="gmd:attributes">
					<dt>
						<span class="element">attributes described </span>&#x2002;<xsl:value-of select="@uuidref"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:features">
					<dt>
						<span class="element">feature types described </span>&#x2002;<xsl:value-of select="@uuidref"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:featureInstances">
					<dt>
						<span class="element">feature instances described </span>&#x2002;<xsl:value-of select="@uuidref"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:attributeInstances">
					<dt>
						<span class="element">attribute instances described </span>&#x2002;<xsl:value-of select="@uuidref"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:dataset">
					<dt>
						<span class="element">dataset described: </span>&#x2002;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:other">
					<dt>
						<span class="element">other component described </span>&#x2002;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
			</dd>
		</dl>
	</xsl:template>
	<!-- General Constraint Information (B.2.3 MD_Constraints - line67) -->
	<xsl:template match="gmd:MD_Constraints" mode="iso19139">
		<dd>
			<dt>
				<span class="element">Constraints</span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:useLimitation">
						<dt>
							<span class="element">Use limitation statement: </span>
						</dt>
						<dl>
							<dd>
								<pre class="wrap">
									<xsl:call-template name="CharacterString"/>
								</pre>
							</dd>
						</dl>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Legal Constraint Information (B.2.3 MD_LegalConstraints - line69) -->
	<xsl:template match="gmd:MD_LegalConstraints" mode="iso19139">
		<dd>
			<dt>
				<span class="element">Legal Constraints</span>
			</dt>
			<dd>
				<dl>
					<xsl:if test="gmd:accessConstraints">
						<dt>
							<span class="element">Access Constraints </span>&#x2002;
        <xsl:for-each select="gmd:accessConstraints/gmd:MD_RestrictionCode">
								<xsl:call-template name="AnyCode"/>
								<xsl:if test="not(position()=last())">, </xsl:if>
							</xsl:for-each>
						</dt>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:if test="gmd:useConstraints">
						<dt>
							<span class="element">use constraint: </span>&#x2002;
        <xsl:for-each select="gmd:useConstraints/gmd:MD_RestrictionCode">
								<xsl:call-template name="AnyCode"/>
								<xsl:if test="not(position()=last())">, </xsl:if>
							</xsl:for-each>
						</dt>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="othConsts">
						<dt>
							<span class="element">Other Constraints</span>
						</dt>
						<dl>
							<dd>
								<pre class="wrap">
									<xsl:value-of select="."/>
								</pre>
							</dd>
						</dl>
					</xsl:for-each>
					<xsl:for-each select="gmd:otherConstraints">
						<dt>
							<span class="element">Other constraints</span>
						</dt>
						<dl>
							<dd>
								<pre class="wrap">
									<xsl:call-template name="CharacterString"/>
								</pre>
							</dd>
						</dl>
					</xsl:for-each>
					<xsl:for-each select="gmd:useLimitation">
						<dt>
							<span class="element">Use Limitation</span>
						</dt>
						<dl>
							<dd>
								<pre class="wrap">
									<xsl:call-template name="CharacterString"/>
								</pre>
							</dd>
						</dl>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Security Constraint Information (B.2.3 MD_SecurityConstraints - line73) -->
	<xsl:template match="gmd:MD_SecurityConstraints" mode="iso19139">
		<dd>
			<dt>
				<span class="element">Security Constraints</span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:classification/gmd:MD_ClassificationCode">
						<dt>
							<span class="element">Classification</span>&#x2002;
        	<xsl:call-template name="AnyCode"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:classificationSystem">
						<dt>
							<span class="element">Classification System</span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:classification | gmd:classificationSystem">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:userNote">
						<dt>
							<span class="element">Note</span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:for-each>
					<xsl:for-each select="gmd:handlingDescription">
						<dt>
							<span class="element">Handling Description</span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:for-each>
					<xsl:for-each select="gmd:useLimitation">
						<dt>
							<span class="element">Use Limitations</span>
						</dt>
						<dl>
							<dd>
								<pre class="wrap">
									<xsl:call-template name="CharacterString"/>
								</pre>
							</dd>
						</dl>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- RESOURCE IDENTIFICATION -->
	<!-- Resource Identification Information (B.2.2 MD_Identification - line23, including MD_DataIdentification - line36) -->
	<!-- DTD doesn't account for data and service subclasses of MD_Identification -->
	<xsl:template match="gmd:MD_DataIdentification | srv:SV_ServiceIdentification" mode="iso19139">
		<a>
			<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:if test="not(name(..) = 'srv:operatesOn')">
				<hr/>
			</xsl:if>
		</a>
		<xsl:choose>
			<xsl:when test="(name(..) = 'srv:operatesOn')">
				<dt>
					<span class="element">Service operates on:</span>
				</dt>
			</xsl:when>
			<xsl:when test="(local-name(.) = 'MD_DataIdentification') and (count (../../*[gmd:MD_DataIdentification]) = 1)">
				<dt>
					<h2>Dataset Identification:</h2>
				</dt>
			</xsl:when>
			<xsl:when test="(local-name(.) = 'MD_DataIdentification') and (count (../../*[gmd:MD_DataIdentification]) &gt; 1)">
				<dt>
					<h2>Dataset identification
				<xsl:for-each select="..">
							<xsl:value-of select="position()"/>
						</xsl:for-each>
					</h2>
				</dt>
			</xsl:when>
			<xsl:when test="(local-name(.) = 'SV_ServiceIdentification') and (count (../../*[srv:SV_ServiceIdentification]) =  1)">
				<dt>
					<h2>Service identification information</h2>
				</dt>
			</xsl:when>
			<xsl:when test="(local-name(.) = 'SV_ServiceIdentification') and (count (../../*[srv:SV_ServiceIdentification]) &gt; 1)">
				<dt>
					<h2>Service Identification information: 
				<xsl:for-each select="..">
							<xsl:value-of select="position()"/>
						</xsl:for-each>
					</h2>
				</dt>
			</xsl:when>
		</xsl:choose>
		<dl>
			<dd>
				<xsl:apply-templates select="gmd:citation/gmd:CI_Citation" mode="iso19139"/>
				<xsl:if test="gmd:topicCategory[gmd:MD_TopicCategoryCode]">
					<dt>
						<span class="element">Topic Category: </span>&#x2002;
      <xsl:for-each select="gmd:topicCategory">
							<xsl:value-of select="gmd:MD_TopicCategoryCode"/>
							<xsl:if test="not(position()=last())">, </xsl:if>
						</xsl:for-each>
					</dt>
					<xsl:if test="count (following-sibling::*) = 0">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
				</xsl:if>
				<xsl:apply-templates select="gmd:descriptiveKeywords/gmd:MD_Keywords" mode="iso19139"/>
				<xsl:for-each select="gmd:abstract">
					<dt>
						<span class="element">Resource Abstract: </span>
					</dt>
					<dl>
						<dd>
							<pre class="wrap">
								<xsl:call-template name="CharacterString"/>
							</pre>
						</dd>
					</dl>
				</xsl:for-each>
				<xsl:for-each select="gmd:purpose">
					<dt>
						<span class="element">purpose: </span>
					</dt>
					<dl>
						<dd>
							<pre class="wrap">
								<xsl:call-template name="CharacterString"/>
							</pre>
						</dd>
					</dl>
				</xsl:for-each>
				<xsl:for-each select="srv:serviceType">
					<!-- NOTE: will match gco:LocalName and gco:ScopedName -->
					<dt>
						<span class="element">Service type: </span>&#x2003;<xsl:value-of select="*"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="srv:serviceType/*/@codeSpace">
					<dl>
						<dd>
							<span class="element">Service type codespace: </span>&#x2003;<xsl:value-of select="."/>
						</dd>
					</dl>
				</xsl:for-each>
				<xsl:for-each select="srv:serviceTypeVersion">
					<dt>
						<span class="element">Service type verstion</span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
				<xsl:apply-templates select="srv:accessProperties/gmd:MD_StandardOrderProcess" mode="iso19139"/>
				<xsl:if test="(srv:serviceType or srv:serviceTypeVersion) and not(srv:accessProperties)">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
				<xsl:apply-templates select="gmd:graphicOverview/gmd:MD_BrowseGraphic" mode="iso19139"/>
				<xsl:for-each select="gmd:language">
					<dt>
						<span class="element">Resource language: </span>&#x2002;
          <xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:characterSet/gmd:MD_CharacterSetCode">
					<dt>
						<span class="element">Character set encoding of resource: </span>&#x2002;<xsl:call-template name="AnyCode"/>
					</dt>
				</xsl:for-each>
				<xsl:if test="gmd:language | gmd:characterSet">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
				<xsl:for-each select="gmd:status/gmd:MD_ProgressCode">
					<dt>
						<span class="element">Resource progress code: </span>&#x2002;
        <xsl:call-template name="AnyCode"/>
					</dt>
				</xsl:for-each>
				<xsl:apply-templates select="gmd:resourceMaintenance" mode="iso19139"/>
				<!--    <xsl:if test="gmd:status | gmd:resourceMaintenance"><br /><br /></xsl:if> -->
				<xsl:for-each select="gmd:resourceConstraints">
					<dt>
						<span class="element">Constraints on resource usage: </span>
					</dt>
					<dl>
						<xsl:apply-templates select="gmd:MD_Constraints" mode="iso19139"/>
						<xsl:apply-templates select="gmd:MD_LegalConstraints" mode="iso19139"/>
						<xsl:apply-templates select="gmd:MD_SecurityConstraints" mode="iso19139"/>
					</dl>
				</xsl:for-each>
				<xsl:apply-templates select="gmd:resourceSpecificUsage/gmd:MD_Usage" mode="iso19139"/>
				<xsl:for-each select="gmd:spatialRepresentationType/gmd:MD_SpatialRepresentationTypeCode">
					<dt>
						<span class="element">Spatial representation type code: </span>&#x2002;
        <xsl:call-template name="AnyCode"/>
					</dt>
				</xsl:for-each>
				<xsl:apply-templates select="gmd:resourceFormat/gmd:MD_Format" mode="iso19139"/>
				<xsl:if test="gmd:spatialRepresentationType and not(gmd:resourceFormat)">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
				<xsl:for-each select="gmd:environmentDescription">
					<dt>
						<span class="element">Processing environment: </span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:for-each>
				<xsl:apply-templates select="gmd:spatialResolution/gmd:MD_Resolution" mode="iso19139"/>
				<xsl:apply-templates select="gmd:extent/gmd:EX_Extent" mode="iso19139"/>
				<xsl:apply-templates select="srv:extent/gmd:EX_Extent" mode="iso19139"/>
				<xsl:for-each select="gmd:supplementalInformation">
					<dt>
						<span class="element">Additional information on resource: </span>
					</dt>
					<dl>
						<dd>
							<pre class="wrap">
								<xsl:call-template name="CharacterString"/>
							</pre>
						</dd>
					</dl>
				</xsl:for-each>
				<xsl:for-each select="gmd:credit">
					<dt>
						<span class="element">Credits: </span>
					</dt>
					<dl>
						<dd>
							<pre class="wrap">
								<xsl:call-template name="CharacterString"/>
							</pre>
						</dd>
					</dl>
				</xsl:for-each>
				<xsl:apply-templates select="gmd:pointOfContact/gmd:CI_ResponsibleParty" mode="iso19139"/>
				<xsl:for-each select="srv:coupledResource/srv:SV_CoupledResource">
					<dt>
						<span class="element">Coupled resources associated with service: </span>
					</dt>
					<dl>
						<dd>
							<xsl:for-each select="srv:operationName">
								<dt>
									<span class="element">Operation name: </span>&#x2003;<xsl:call-template name="CharacterString"/>
								</dt>
							</xsl:for-each>
							<xsl:for-each select="srv:identifier">
								<dt>
									<span class="element">Service identifier: </span>&#x2003;<xsl:call-template name="CharacterString"/>
								</dt>
							</xsl:for-each>
						</dd>
					</dl>
					<!-- <br/> -->
				</xsl:for-each>
				<xsl:for-each select="srv:couplingType/srv:SV_CouplingType">
					<dt>
						<span class="element">Coupling between service and dataset: </span>&#x2003;
        <xsl:call-template name="AnyCode"/>
					</dt>
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:for-each>
				<xsl:apply-templates select="srv:containsOperations/srv:SV_OperationMetadata" mode="iso19139"/>
				<xsl:apply-templates select="srv:operatesOn/gmd:MD_DataIdentification" mode="iso19139"/>
			</dd>
		</dl>
		<xsl:if test="not(name(..) = 'srv:operatesOn')">
			<a class="top" href="#Top">Back to top: </a>
		</xsl:if>
	</xsl:template>
	<!-- Keyword Information (B.2.2.2 MD_Keywords - line52)-->
	<xsl:template match="gmd:MD_Keywords" mode="iso19139">
		<dd>
			<xsl:choose>
				<xsl:when test="gmd:type/gmd:MD_KeywordTypeCode[@codeListValue='001' or @codeListValue='discipline']">
					<dt>
						<span class="element">Discipline keywords: </span>
					</dt>
				</xsl:when>
				<xsl:when test="gmd:type/gmd:MD_KeywordTypeCode[@codeListValue='002' or @codeListValue='place']">
					<dt>
						<span class="element">Location keywords: </span>
					</dt>
				</xsl:when>
				<xsl:when test="gmd:type/gmd:MD_KeywordTypeCode[@codeListValue='003' or @codeListValue='stratum']">
					<dt>
						<span class="element">Stratum keywords: </span>
					</dt>
				</xsl:when>
				<xsl:when test="gmd:type/gmd:MD_KeywordTypeCode[@codeListValue='004' or @codeListValue='temporal']">
					<dt>
						<span class="element">Temporal keywords: </span>
					</dt>
				</xsl:when>
				<xsl:when test="gmd:type/gmd:MD_KeywordTypeCode[@codeListValue='005' or @codeListValue='theme']">
					<dt>
						<span class="element">Theme keywords: </span>
					</dt>
				</xsl:when>
				<xsl:otherwise>
					<dt>
						<span class="element">
							<xsl:value-of select="gmd:type/gmd:MD_KeywordTypeCode/@codeListValue"/> Keywords</span>
					</dt>
				</xsl:otherwise>
			</xsl:choose>
			<dd>
				<dl>
					<xsl:if test="gmd:keyword">
						<dt>
							<xsl:for-each select="gmd:keyword">
								<xsl:if test="position() = 1">
									<span class="element">keyword term: </span>&#x2003;</xsl:if>
								<xsl:call-template name="CharacterString"/>
								<xsl:if test="not(position()=last())">, </xsl:if>
							</xsl:for-each>
						</dt>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:apply-templates select="gmd:thesaurusName/gmd:CI_Citation" mode="iso19139"/>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Browse Graphic Information (B.2.2.1 MD_BrowseGraphic - line48) -->
	<xsl:template match="gmd:MD_BrowseGraphic" mode="iso19139">
		<dd>
			<dt>
				<span class="element">Browse image (thumbnail): </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:fileName">
						<dt>
							<span class="element">thumbnail file name: </span>&#x2003;<xsl:call-template name="urlType">
								<xsl:with-param name="value" select="normalize-space(gco:CharacterString)"/>
								<!-- SMR fix: the fileName string is in a characterSTring element; the template is expecting a string -->
							</xsl:call-template>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:fileType">
						<dt>
							<span class="element">file type: </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:fileDescription">
						<dt>
							<span class="element">thumbnail file description: </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- Usage Information (B.2.2.5 MD_Usage - line62) -->
	<xsl:template match="gmd:MD_Usage" mode="iso19139">
		<dd>
			<dt>
				<span class="element">Resource usage information</span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:usageDateTime">
						<dt>
							<span class="element">Date used: </span>&#x2002;<xsl:call-template name="Date_PropertyType"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:specificUsage">
						<dt>
							<span class="element">Usage description: </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:usageDateTime | gmd:specificUsage">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:userDeterminedLimitations">
						<dt>
							<span class="element">Usage comments: </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:for-each>
					<xsl:apply-templates select="gmd:userContactInfo/gmd:CI_ResponsibleParty" mode="iso19139"/>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Resolution Information (B.2.2.4 MD_Resolution - line59) -->
	<xsl:template match="gmd:MD_Resolution" mode="iso19139">
		<dd>
			<dt>
				<span class="element">Spatial resolution: </span>
			</dt>
			<dd>
				<dl>
					<xsl:apply-templates select="gmd:equivalentScale/gmd:MD_RepresentativeFraction" mode="iso19139"/>
					<xsl:for-each select="gmd:distance/gco:Distance">
						<dt>
							<span class="element">Ground sampling distance: </span>&#x2002;<xsl:apply-templates select="." mode="iso19139"/>
						</dt>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Representative Fraction Information (B.2.2.3 MD_RepresentativeFraction - line56) -->
	<xsl:template match="gmd:MD_RepresentativeFraction" mode="iso19139">
		<dt>
			<span class="element">representative resolution scale: </span>
		</dt>
		<dd>
			<dl>
				<xsl:for-each select="gmd:denominator">
					<dt>
						<span class="element">Scale denominator: </span>&#x2002;<xsl:call-template name="Integer"/>
					</dt>
				</xsl:for-each>
			</dl>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- Service Operation Metadata (SV_OperationMetadata) -->
	<xsl:template match="srv:SV_OperationMetadata" mode="iso19139">
		<dd>
			<dt>
				<span class="element">Service operations: </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="srv:operationName">
						<dt>
							<span class="element">Operation name: </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="srv:operationDescription">
						<dt>
							<span class="element">Operation description: </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="srv:invocationName">
						<dt>
							<span class="element">Name for invoking operation: </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="srv:DCP/srv:DCPList">
						<dt>
							<span class="element">Service distributed computing platform type: </span>&#x2003;
			<xsl:call-template name="AnyCode"/>
						</dt>
					</xsl:for-each>
					<xsl:apply-templates select="srv:connectPoint/gmd:CI_OnlineResource" mode="iso19139"/>
					<xsl:apply-templates select="srv:parameters/srv:SV_Parameter" mode="iso19139"/>
					<xsl:apply-templates select="srv:dependsOn/srv:SV_OperationMetadata" mode="iso19139"/>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Service Operation Parameters (SV_Parameter) -->
	<xsl:template match="srv:SV_Parameter" mode="iso19139">
		<dd>
			<dt>
				<span class="element">Operation parameter: </span>
			</dt>
			<dd>
				<dl>
					<xsl:if test="srv:name/gco:MemberName">
						<dt>
							<span class="element">Parameter name: </span>&#x2003;</dt>
						<xsl:apply-templates select="srv:name/gco:MemberName" mode="iso19139"/>
					</xsl:if>
					<xsl:for-each select="srv:description">
						<dt>
							<span class="element">Parameter description: </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="srv:direction/srv:SV_ParameterDirection">
						<dt>
							<span class="element">Parameter direction: </span>&#x2003;<xsl:value-of select="."/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="srv:optionality">
						<dt>
							<span class="element">Parameter optionality: </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="srv:repeatability">
						<dt>
							<span class="element">Parameter repeatability: </span>&#x2003;<xsl:call-template name="Boolean"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="srv:valueType/gco:TypeName/gco:aName">
						<dt>
							<span class="element">value type: </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- SPATIAL REPRESENTATION -->
	<!-- Spatial Representation Information (B.2.6  MD_SpatialRepresentation - line156) -->
	<!--
<xsl:template match="gmd:spatialRepresentationInfo" mode="iso19139">
  <a>
	<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
	<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
    <hr />
  </a>
  <dl>
    <xsl:choose>
      <xsl:when test="gmd:MD_GridSpatialRepresentation">
        <dt><h2>Grid</h2></dt>
      </xsl:when>
      <xsl:when test="gmd:MD_VectorSpatialRepresentation">
        <dt><h2>Vector</h2></dt>
      </xsl:when>
			<xsl:when test="gmd:MD_Georectified">
        <dt><h2>Georectified Grid</h2></dt>
      </xsl:when>
      <xsl:when test="gmd:MD_Georeferenceable">
        <dt><h2>Georeferenceable Grid</h2></dt>
      </xsl:when>
    -->
	<!-- NOTE: abstract -->
	<!--
      <xsl:otherwise>
        <dt><font color="#0000AA" size="3"><span class="element">Spatial Representation</span></font></dt>
      </xsl:otherwise>
    </xsl:choose>
    -->
	<!--  
  <dl>
    <dd>
      <xsl:apply-templates select="*" mode="iso19139"/>
    </dd>
  </dl>
  </dl> 
  <a class="top" href="#Top">Back to top</a>
</xsl:template>
	-->
	<!-- Grid Information (B.2.6  MD_GridSpatialRepresentation - line157 -->
	<xsl:template name="MD_GridSpatialRepresentation">
		<xsl:for-each select="gmd:numberOfDimensions">
			<dt>
				<span class="element">number of grid dimensions: </span>&#x2002;<xsl:call-template name="Integer"/>
			</dt>
		</xsl:for-each>
		<dd>
			<dt>
				<span class="element">Grid axis property: </span>
			</dt>
			<dd>
				<dl>
					<xsl:apply-templates select="gmd:axisDimensionProperties/gmd:MD_Dimension" mode="iso19139"/>
				</dl>
			</dd>
		</dd>
		<xsl:for-each select="gmd:cellGeometry/gmd:MD_CellGeometryCode">
			<dt>
				<span class="element">cell geometry type: </span>&#x2002;
			<xsl:call-template name="AnyCode"/>
			</dt>
		</xsl:for-each>
		<xsl:for-each select="gmd:transformationParameterAvailability">
			<dt>
				<span class="element">transformation parameter availability: </span>&#x2002;
			<xsl:call-template name="Boolean"/>
			</dt>
		</xsl:for-each>
		<xsl:if test="gmd:numberOfDimensions and not (gmd:axisDimensionProperties)">
			<!-- <br/> -->
		</xsl:if>
	</xsl:template>
	<!-- Grid Information (B.2.6  MD_GridSpatialRepresentation - line157 -->
	<xsl:template match="gmd:MD_GridSpatialRepresentation" mode="iso19139">
		<a>
			<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<hr/>
		</a>
		<dt>
			<h2>Grid spatial representation</h2>
		</dt>
		<dl>
			<dd>
				<xsl:call-template name="MD_GridSpatialRepresentation"/>
			</dd>
		</dl>
		<!-- <br/> -->
		<a class="top" href="#Top">Back to top</a>
	</xsl:template>
	<xsl:template match="gmd:MD_Georectified" mode="iso19139">
		<a>
			<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<hr/>
		</a>
		<dt>
			<h2>Georectified grid</h2>
		</dt>
		<dl>
			<dd>
				<xsl:call-template name="MD_GridSpatialRepresentation"/>
				<xsl:for-each select="gmd:pointInPixel/gmd:MD_PixelOrientationCode">
					<dt>
						<span class="element">point position in pixel: </span>&#x2002;<xsl:call-template name="AnyCode"/>
					</dt>
				</xsl:for-each>
				<xsl:if test="gmd:cellGeometry | gmd:pointInPixel">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
				<xsl:for-each select="gmd:transformationDimensionDescription">
					<dt>
						<span class="element">transformation dimension description: </span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:transformationDimensionMapping">
					<dt>
						<span class="element">transformation Dimension Mapping </span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
				<xsl:if test="gmd:transformationParameterAvailability | gmd:transformationDimensionDescription | gmd:transformationDimensionMapping">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
				<xsl:for-each select="gmd:checkPointAvailability">
					<dt>
						<span class="element"> check Point Availability </span>&#x2002;<xsl:call-template name="Boolean"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:checkPointDescription">
					<dt>
						<span class="element"> check Point Description </span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
				<xsl:if test="gmd:cornerPoints">
					<dt>
						<span class="element"> cornerPoints </span>
					</dt>
					<dd>
						<dl>
							<xsl:for-each select="gmd:cornerPoints/gml:Point">
								<dt>
									<span class="element"> Coordinates </span>&#x2002;<xsl:apply-templates select="." mode="iso19139"/>
								</dt>
								<!-- <br/> -->
								<!-- <br/> -->
							</xsl:for-each>
						</dl>
					</dd>
				</xsl:if>
				<xsl:for-each select="gmd:centerPoint">
					<dt>
						<span class="element"> center Point </span>
					</dt>
					<dd>
						<dl>
							<xsl:for-each select="gml:Point">
								<dt>
									<span class="element"> Coordinates </span>&#x2002;<xsl:apply-templates select="." mode="iso19139"/>
								</dt>
								<!-- <br/> -->
								<!-- <br/> -->
							</xsl:for-each>
						</dl>
					</dd>
				</xsl:for-each>
				<xsl:if test="gmd:checkPointAvailability | gmd:checkPointDescription | gmd:cornerPoints | gmd:centerPoint">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
			</dd>
		</dl>
		<a class="top" href="#Top">Back to top</a>
	</xsl:template>
	<xsl:template match="gmd:MD_Georeferenceable" mode="iso19139">
		<a>
			<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<hr/>
		</a>
		<dt>
			<h2>Georeferenceable grid information</h2>
		</dt>
		<dl>
			<dd>
				<xsl:call-template name="MD_GridSpatialRepresentation"/>
				<xsl:for-each select="gmd:controlPointAvailability">
					<dt>
						<span class="element">Control Point Availability </span>&#x2002;<xsl:call-template name="Boolean"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:orientationParameterAvailability">
					<dt>
						<span class="element"> orientation Parameter Availability </span>&#x2002;<xsl:call-template name="Boolean"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:orientationParameterDescription">
					<dt>
						<span class="element"> orientation Parameter Description </span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
				<xsl:if test="gmd:controlPointAvailability | gmd:orientationParameterAvailability | gmd:orientationParameterDescription">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
				<xsl:for-each select="gmd:georeferencedParameters">
					<dt>
						<span class="element"> georeferenced Parameters </span>&#x2002;<xsl:call-template name="Record"/>
					</dt>
				</xsl:for-each>
				<xsl:apply-templates select="gmd:parameterCitation/gmd:CI_Citation" mode="iso19139"/>
				<xsl:if test="gmd:georeferencedParameters and not (gmd:parameterCitation)">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
			</dd>
		</dl>
		<a class="top" href="#Top">Back to top</a>
	</xsl:template>
	<!-- Dimension Information (B.2.6.1 MD_Dimension - line179) -->
	<!-- DataType -->
	<xsl:template match="gmd:MD_Dimension" mode="iso19139">
		<!--<xsl:for-each select="gmd:MD_Dimension">-->
		<dt>
			<span class="element">Grid Dimension</span>
		</dt>
		<dd>
			<dl>
				<xsl:for-each select="gmd:dimensionName/gmd:MD_DimensionNameTypeCode">
					<dt>
						<span class="element">Dimension Name: </span>&#x2002;
							<xsl:call-template name="AnyCode"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:dimensionSize">
					<dt>
						<span class="element">Dimension Size </span>&#x2002;<xsl:call-template name="Integer"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:resolution/gco:Measure">
					<dt>
						<span class="element"> resolution </span>
					</dt>
					<dl>
						<dt>
							<span class="element"> Distance </span>&#x2002;<xsl:apply-templates select="." mode="iso19139"/>
						</dt>
					</dl>
				</xsl:for-each>
			</dl>
		</dd>
		<!-- <br/> -->
		<!--</xsl:for-each>-->
	</xsl:template>
	<!-- Vector Information (B.2.6  MD_VectorSpatialRepresentation - line176) -->
	<xsl:template match="gmd:MD_VectorSpatialRepresentation" mode="iso19139">
		<a>
			<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<hr/>
		</a>
		<dt>
			<h2>Vector spatial representation information</h2>
		</dt>
		<dl>
			<dd>
				<xsl:for-each select="gmd:topologyLevel/gmd:MD_TopologyLevelCode">
					<dt>
						<span class="element">Topology Level </span>&#x2002;
			<xsl:call-template name="AnyCode"/>
					</dt>
				</xsl:for-each>
				<xsl:apply-templates select="gmd:geometricObjects/gmd:MD_GeometricObjects" mode="iso19139"/>
				<xsl:if test="gmd:topologyLevel and not (gmd:geometricObjects)">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
			</dd>
		</dl>
		<a class="top" href="#Top">Back to top</a>
	</xsl:template>
	<!-- Geometric Object Information (B.2.6.2 MD_GeometricObjects - line183) -->
	<!-- Data Type -->
	<xsl:template match="gmd:MD_GeometricObjects" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> Geometric Objects </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:geometricObjectType/gmd:MD_GeometricObjectTypeCode">
						<dt>
							<span class="element"> geometric Object Type </span>&#x2002;<xsl:call-template name="AnyCode"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:geometricObjectCount">
						<dt>
							<span class="element"> geometric Object Count </span>&#x2002;<xsl:call-template name="Integer"/>
						</dt>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- Identifier Information (B.2.7.2 MD_Identifier - line205) -->
	<xsl:template match="gmd:MD_Identifier" mode="iso19139">
		<xsl:call-template name="MD_Identifier"/>
	</xsl:template>
	<xsl:template match="gmd:RS_Identifier" mode="iso19139">
		<xsl:call-template name="MD_Identifier"/>
		<dl>
			<dd>
				<xsl:for-each select="gmd:codeSpace">
					<dt>
						<span class="element"> Identifier code space: </span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:version">
					<dt>
						<span class="element">Version </span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
			</dd>
		</dl>
		<xsl:if test="gmd:codeSpace or gmd:version">
			<!-- <br/> -->
		</xsl:if>
	</xsl:template>
	<xsl:template name="MD_Identifier">
		<!-- NOTE: was match="geoId | refSysID | projection | ellipsoid | datum | refSysName | 
      MdIdent | RS_Identifier | datumID"> -->
		<xsl:choose>
			<xsl:when test="../gmd:geographicIdentifier">
				<dt>
					<span class="element">Geographic Identifier </span>
				</dt>
			</xsl:when>
			<!-- don't include an xsl:otherwise so the identCode value will appear correctly indented under the heading -->
		</xsl:choose>
		<dl>
			<dd>
				<xsl:for-each select="gmd:code">
					<dt>
						<span class="element">Identifier string: </span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
				<xsl:apply-templates select="gmd:authority/gmd:CI_Citation" mode="iso19139"/>
				<xsl:if test="(gmd:code) and not (gmd:authority)">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
			</dd>
		</dl>
	</xsl:template>
	<!-- CONTENT INFORMATION -->
	<!-- Content Information (B.2.8 MD_ContentInformation - line232) -->
	<xsl:template name="MD_CoverageDescription">
		<xsl:for-each select="gmd:contentType">
			<dt>
				<span class="element">Type of coverage content </span>&#x2002;
			<xsl:for-each select="gmd:MD_CoverageContentTypeCode">
					<xsl:call-template name="AnyCode"/>
				</xsl:for-each>
			</dt>
		</xsl:for-each>
		<xsl:for-each select="gmd:attributeDescription">
			<dt>
				<span class="element">Cell value attribute description: </span>&#x2002;<xsl:call-template name="RecordType"/>
			</dt>
		</xsl:for-each>
		<xsl:if test="gmd:contentType | gmd:attributeDescription">
			<!-- <br/> -->
			<!-- <br/> -->
		</xsl:if>
		<xsl:apply-templates select="gmd:dimension" mode="iso19139"/>
	</xsl:template>
	<!-- Feature Catalogue Description (B.2.8 MD_FeatureCatalogueDescription - line233) -->
	<xsl:template match="gmd:MD_FeatureCatalogueDescription" mode="iso19139">
		<a>
			<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<hr/>
		</a>
		<dt>
			<h2>Content information: feature catalog description</h2>
		</dt>
		<dl>
			<dd>
				<xsl:for-each select="gmd:language">
					<dt>
						<span class="element">catalog language </span>&#x2002;
			<xsl:apply-templates select="." mode="iso19139"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:includedWithDataset">
					<dt>
						<span class="element">Included With Dataset </span>&#x2002;
        	<xsl:call-template name="Boolean"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:complianceCode">
					<dt>
						<span class="element">Compliance Code </span>&#x2002;
        	<xsl:call-template name="Boolean"/>
					</dt>
				</xsl:for-each>
				<xsl:if test="gmd:language | gmd:includedWithDataset | gmd:complianceCode">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
				<xsl:for-each select="gmd:featureTypes">
					<!-- NOTE: will match gco:LocalName and gco:ScopedName -->
					<dt>
						<span class="element"> Feature Types &#x2003;<xsl:value-of select="*"/>
						</span>
					</dt>
					<xsl:for-each select="gmd:featureTypes/*/@codeSpace">
						<dl>
							<dd>
								<span class="element">codespace: </span>&#x2003;<xsl:value-of select="."/>
							</dd>
						</dl>
					</xsl:for-each>
				</xsl:for-each>
				<xsl:apply-templates select="gmd:featureCatalogueCitation/CI_Citation" mode="iso19139"/>
			</dd>
		</dl>
		<a class="top" href="#Top">Back to top</a>
	</xsl:template>
	<!-- Coverage Description (B.2.8 MD_CoverageDescription - line239) -->
	<xsl:template match="gmd:MD_CoverageDescription" mode="iso19139">
		<a>
			<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<hr/>
		</a>
		<dt>
			<h2>Coverage description</h2>
		</dt>
		<dl>
			<dd>
				<xsl:call-template name="MD_CoverageDescription"/>
			</dd>
		</dl>
		<a class="top" href="#Top">Back to top</a>
	</xsl:template>
	<!-- Range dimension Information (B.2.8.1 MD_RangeDimension - line256) -->
	<xsl:template match="gmd:dimension" mode="iso19139">
		<!-- NOTE: not matching class because there is one subclass -->
		<dd>
			<xsl:choose>
				<xsl:when test="gmd:MD_RangeDimension">
					<dt>
						<span class="element"> Range Dimension </span>
					</dt>
				</xsl:when>
				<xsl:when test="gmd:MD_Band">
					<dt>
						<span class="element"> Band </span>
					</dt>
				</xsl:when>
				<!-- don't see any way that this could be anything but the two options above -->
				<!--
      <xsl:otherwise>
        <dt><span class="element">Cell value information</span></dt>
      </xsl:otherwise> -->
			</xsl:choose>
			<dd>
				<dl>
					<xsl:for-each select="*/gmd:descriptor">
						<dt>
							<span class="element"> descriptor </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="*/gmd:sequenceIdentifier/gco:MemberName">
						<dt>
							<span class="element"> sequence Identifier </span>
						</dt>
						<xsl:apply-templates select="." mode="iso19139"/>
					</xsl:for-each>
					<xsl:for-each select="gmd:MD_Band">
						<xsl:for-each select="gmd:maxValue">
							<dt>
								<span class="element"> Long Wavelength </span>&#x2002;<xsl:call-template name="Real"/>
							</dt>
						</xsl:for-each>
						<xsl:for-each select="gmd:minValue">
							<dt>
								<span class="element"> Short Wavelength </span>&#x2002;<xsl:call-template name="Real"/>
							</dt>
						</xsl:for-each>
						<xsl:for-each select="gmd:peakResponse">
							<dt>
								<span class="element">Peak response </span>&#x2002;<xsl:call-template name="Real"/>
							</dt>
						</xsl:for-each>
						<xsl:if test="gmd:units">
							<dt>
								<span class="element"> units </span>
							</dt>
							<xsl:apply-templates select="gmd:units/gml:UnitDefinition" mode="iso19139"/>
						</xsl:if>
						<xsl:if test="(gmd:maxValue | gmd:minValue | gmd:peakResponse) and not (gmd:units)">
							<!-- <br/> -->
							<!-- <br/> -->
						</xsl:if>
						<xsl:for-each select="gmd:bitsPerValue">
							<dt>
								<span class="element"> bits Per Value </span>&#x2002;<xsl:call-template name="Integer"/>
							</dt>
						</xsl:for-each>
						<xsl:for-each select="gmd:toneGradation">
							<dt>
								<span class="element"> tone Gradation </span>&#x2002;<xsl:call-template name="Integer"/>
							</dt>
						</xsl:for-each>
						<xsl:for-each select="gmd:scaleFactor">
							<dt>
								<span class="element"> scale Factor </span>&#x2002;<xsl:call-template name="Real"/>
							</dt>
						</xsl:for-each>
						<xsl:for-each select="gmd:offset">
							<dt>
								<span class="element"> offset </span>&#x2002;<xsl:call-template name="Real"/>
							</dt>
						</xsl:for-each>
						<xsl:if test="gmd:bitsPerValue | gmd:toneGradation | gmd:scaleFactor | gmd:offset">
							<!-- <br/> -->
							<!-- <br/> -->
						</xsl:if>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Type Name -->
	<!-- TODO: is this in 19115? 
<xsl:template match="TypeName" mode="iso19139">
    <dd>
    <dl>
      <xsl:for-each select="scope">
        <dt><span class="element">Scope</span>&#x2002;<xsl:value-of /></dt>
      </xsl:for-each>
      <xsl:for-each select="aName">
        <dt><span class="element">Name</span>&#x2002;<xsl:value-of select = "." /></dt>
      </xsl:for-each>
    </dl>
    </dd>
    <br />
</xsl:template>-->
	<!-- Member Name -->
	<xsl:template match="gco:MemberName" mode="iso19139">
		<dd>
			<dl>
				<!-- TODO: is this in 19115? <xsl:for-each select="scope">
        <dt><span class="element">Scope</span>&#x2002;<xsl:value-of /></dt>
      </xsl:for-each>-->
				<xsl:for-each select="gco:aName">
					<dt>
						<span class="element">name </span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gco:attributeType/gco:TypeName">
					<dt>
						<span class="element"> attribute Type </span>
					</dt>
					<dd>
						<dl>
							<xsl:for-each select="gco:aName">
								<dt>
									<span class="element"> Name </span>&#x2003;<xsl:call-template name="CharacterString"/>
								</dt>
							</xsl:for-each>
						</dl>
					</dd>
				</xsl:for-each>
			</dl>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- Image Description (B.2.8 MD_ImageDescription - line243) -->
	<xsl:template match="gmd:MD_ImageDescription" mode="iso19139">
		<a>
			<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<hr/>
		</a>
		<dt>
			<h2> Content information, image description </h2>
		</dt>
		<dl>
			<dd>
				<xsl:call-template name="MD_CoverageDescription"/>
				<xsl:for-each select="gmd:illuminationElevationAngle">
					<dt>
						<span class="element">Illumination Elevation Angle </span>&#x2002;<xsl:call-template name="Real"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:illuminationAzimuthAngle">
					<dt>
						<span class="element">Illumination Azimuth Angle </span>&#x2002;<xsl:call-template name="Real"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:imagingCondition/gmd:MD_ImagingConditionCode">
					<dt>
						<span class="element">Imaging Condition </span>&#x2002;
       		<xsl:call-template name="AnyCode"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:cloudCoverPercentage">
					<dt>
						<span class="element">Cloud Cover Percentage </span>&#x2002;<xsl:call-template name="Real"/>
					</dt>
				</xsl:for-each>
				<xsl:if test="gmd:illuminationElevationAngle | gmd:illuminationAzimuthAngle | gmd:imagingCondition | gmd:cloudCoverPercentage">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
				<xsl:for-each select="gmd:imageQualityCode/gmd:MD_Identifier">
					<dt>
						<span class="element">Image Quality Code </span>
					</dt>&#x2002;
        <xsl:apply-templates select="." mode="iso19139"/>
				</xsl:for-each>
				<xsl:for-each select="gmd:processingLevelCode/gmd:MD_Identifier">
					<dt>
						<span class="element"> processing Level Code </span>&#x2002;</dt>
					<xsl:apply-templates select="." mode="iso19139"/>
				</xsl:for-each>
				<xsl:for-each select="gmd:compressionGenerationQuantity">
					<dt>
						<span class="element"> compression Generation Quantity </span>&#x2002;<xsl:call-template name="Integer"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:triangulationIndicator">
					<dt>
						<span class="element"> triangulation Indicator </span>&#x2002;
          <xsl:call-template name="Boolean"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:radiometricCalibrationDataAvailability">
					<dt>
						<span class="element"> radiometric Calibration Data Availability </span>&#x2002;
					<xsl:call-template name="Boolean"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:cameraCalibrationInformationAvailability">
					<dt>
						<span class="element"> cameraCalibrationInformationAvailability </span>&#x2002;
					<xsl:call-template name="Boolean"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:filmDistortionInformationAvailability">
					<dt>
						<span class="element"> filmDistortionInformationAvailability </span>&#x2002;
					<xsl:value-of select="."/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:lensDistortionInformationAvailability">
					<dt>
						<span class="element"> lensDistortionInformationAvailability </span>&#x2002;
					<xsl:call-template name="Boolean"/>
					</dt>
				</xsl:for-each>
				<xsl:if test="gmd:compressionGenerationQuantity | gmd:triangulationIndicator | 
				gmd:radiometricCalibrationDataAvailability | gmd:cameraCalibrationInformationAvailability |  
				gmd:filmDistortionInformationAvailability | gmd:lensDistortionInformationAvailability">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
			</dd>
		</dl>
		<a class="top" href="#Top">Back to top</a>
	</xsl:template>
	<!-- REFERENCE SYSTEM -->
	<!-- Reference System Information (B.2.7 MD_ReferenceSystem - line186) -->
	<xsl:template match="gmd:MD_ReferenceSystem" mode="iso19139">
		<xsl:if test="(local-name(./..) = 'referenceSystemInfo')">
			<a>
				<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
				<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
				<hr/>
			</a>
		</xsl:if>
		<xsl:if test="count (../../gmd:referenceSystemInfo) = 1">
			<dt>
				<h2>Reference system information</h2>
			</dt>
		</xsl:if>
		<xsl:if test="count (../../gmd:referenceSystemInfo) &gt; 1">
			<dt>
				<h2>reference system <xsl:value-of select="position()"/>
				</h2>
			</dt>
		</xsl:if>
		<dl>
			<dd>
				<xsl:if test="gmd:referenceSystemIdentifier">
					<dt>
						<span class="element">Reference System Identifier </span>
					</dt>
					<xsl:apply-templates select="gmd:referenceSystemIdentifier/gmd:RS_Identifier" mode="iso19139"/>
				</xsl:if>
				<!-- no support for RS_ReferenceSystem information -->
			</dd>
		</dl>
		<xsl:if test="(local-name(./..) = 'referenceSystemInfo')">
			<a class="top" href="#Top">Back to top</a>
		</xsl:if>
	</xsl:template>
	<!-- DATA QUALITY -->
	<!-- Data Quality Information  (B.2.4 DQ_DataQuality - line78) -->
	<xsl:template match="gmd:DQ_DataQuality" mode="iso19139">
		<a>
			<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<hr/>
		</a>
		<xsl:if test="count (../../gmd:dataQualityInfo) = 1">
			<dt>
				<h2>Data quality information</h2>
			</dt>
		</xsl:if>
		<xsl:if test="count (../../gmd:dataQualityInfo) &gt; 1">
			<dt>
				<h2>quality statement <xsl:value-of select="position()"/>
				</h2>
			</dt>
		</xsl:if>
		<dl>
			<dd>
				<xsl:apply-templates select="gmd:scope/gmd:DQ_Scope" mode="iso19139"/>
				<xsl:apply-templates select="gmd:lineage/gmd:LI_Lineage" mode="iso19139"/>
				<xsl:for-each select="gmd:report/*">
					<!-- NOTE: will select sub-classes -->
					<xsl:apply-templates select="." mode="iso19139"/>
				</xsl:for-each>
			</dd>
		</dl>
		<a class="top" href="#Top">Back to top</a>
	</xsl:template>
	<!-- Scope Information (B.2.4.4 DQ_Scope - line138) -->
	<xsl:template match="gmd:DQ_Scope" mode="iso19139">
		<dd>
			<dt>
				<span class="element">Scope of quality information </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:level/gmd:MD_ScopeCode">
						<dt>
							<span class="element">scope level </span>&#x2002;
			<xsl:call-template name="AnyCode"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:levelDescription">
						<xsl:if test="position() = 1">
							<dt>
								<span class="element"> Level Description </span>
							</dt>
						</xsl:if>
						<dl>
							<dd>
								<xsl:apply-templates select="gmd:MD_ScopeDescription" mode="iso19139"/>
							</dd>
						</dl>
						<xsl:if test="count (following-sibling::*) = 0">
							<!-- <br/> -->
						</xsl:if>
					</xsl:for-each>
					<xsl:if test="(gmd:level) and not (gmd:levelDescription)">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:apply-templates select="gmd:extent/gmd:EX_Extent" mode="iso19139"/>
					<!-- TODO: make sure there's a global template for this -->
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Lineage Information (B.2.4.1 LI_Lineage - line82) -->
	<xsl:template match="gmd:LI_Lineage" mode="iso19139">
		<dd>
			<dt>
				<span class="element">Resource lineage description</span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:statement">
						<dt>
							<span class="element">Lineage statement </span>
						</dt>
						<dl>
							<dd>
								<pre class="wrap">
									<xsl:call-template name="CharacterString"/>
								</pre>
							</dd>
						</dl>
					</xsl:for-each>
					<xsl:apply-templates select="gmd:processStep/gmd:LI_ProcessStep" mode="iso19139"/>
					<xsl:apply-templates select="gmd:source/gmd:LI_Source" mode="iso19139"/>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Process Step Information (B.2.4.1.1 LI_ProcessStep - line86) -->
	<xsl:template match="gmd:LI_ProcessStep" mode="iso19139">
		<!-- NOTE: was match="(prcStep | srcStep)"> -->
		<dd>
			<dt>
				<span class="element"> Processing Step </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:dateTime">
						<dt>
							<span class="element"> date and time </span>&#x2002;<xsl:call-template name="Date_PropertyType"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:description">
						<dt>
							<span class="element"> description </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:rationale">
						<dt>
							<span class="element"> Rationale </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:dateTime | gmd:description |gmd:rationale">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:apply-templates select="gmd:processor/gmd:CI_ResponsibleParty" mode="iso19139"/>
					<!-- TODO: review this -->
					<xsl:if test="not (../gmd:sourceStep)">
						<xsl:apply-templates select="gmd:source/gmd:LI_Source" mode="iso19139"/>
					</xsl:if>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Source Information (B.2.4.1.2 LI_Source - line92) -->
	<xsl:template match="gmd:LI_Source" mode="iso19139">
		<!-- TODO: make sure there are callers of this template -->
		<dd>
			<dt>
				<span class="element">source </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:description">
						<dt>
							<span class="element">source description </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:for-each>
					<xsl:apply-templates select="gmd:scaleDenominator/gmd:MD_RepresentativeFraction" mode="iso19139"/>
					<xsl:apply-templates select="gmd:sourceCitation/gmd:CI_Citation" mode="iso19139"/>
					<xsl:for-each select="gmd:sourceReferenceSystem">
						<dt>
							<span class="element">Source reference system </span>
						</dt>
						<xsl:apply-templates select="gmd:MD_ReferenceSystem" mode="iso19139"/>
					</xsl:for-each>
					<xsl:apply-templates select="gmd:sourceExtent/gmd:EX_Extent" mode="iso19139"/>
					<!-- TODO: review this -->
					<xsl:if test="not (../gmd:source)">
						<xsl:apply-templates select="gmd:sourceStep" mode="iso19139"/>
					</xsl:if>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Data Quality Element Information (B.2.4.2 DQ_Element - line99) -->
	<xsl:template match="gmd:DQ_CompletenessOmission | gmd:DQ_CompletenessCommission | gmd:DQ_TopologicalConsistency | gmd:DQ_FormatConsistency | gmd:DQ_DomainConsistency | gmd:DQ_ConceptualConsistency | gmd:DQ_RelativeInternalPositionalAccuracy | gmd:DQ_GriddedDataPositionalAccuracy | gmd:DQ_AbsoluteExternalPositionalAccuracy | gmd:DQ_QuantitativeAttributeAccuracy | gmd:DQ_NonQuantitativeAttributeAccuracy | gmd:DQ_ThematicClassificationCorrectness | gmd:DQ_TemporalValidity | gmd:DQ_TemporalConsistency | gmd:DQ_AccuracyOfATimeMeasurement" mode="iso19139">
		<dd>
			<xsl:choose>
				<!-- NOTE: this is abstract
    <xsl:when test="../DQComplete">
        <dt><span class="element">Data quality report - Completeness</span></dt>
    </xsl:when>-->
				<xsl:when test="local-name(.) = 'DQ_CompletenessCommission'">
					<dt>
						<span class="element"> Completeness Commission </span>
					</dt>
				</xsl:when>
				<xsl:when test="local-name(.) = 'DQ_CompletenessOmission'">
					<dt>
						<span class="element"> Completeness Omission </span>
					</dt>
				</xsl:when>
				<!-- NOTE: this is abstract
    <xsl:when test="../DQLogConsis">
        <dt><span class="element">Data quality report - Logical consistency</span></dt>
    </xsl:when>-->
				<xsl:when test="local-name(.) = 'DQ_ConceptualConsistency'">
					<dt>
						<span class="element"> ConceptualConsistency </span>
					</dt>
				</xsl:when>
				<xsl:when test="local-name(.) = 'DQ_DomainConsistency'">
					<dt>
						<span class="element"> DomainConsistency </span>
					</dt>
				</xsl:when>
				<xsl:when test="local-name(.) = 'DQ_FormatConsistency'">
					<dt>
						<span class="element"> FormatConsistency </span>
					</dt>
				</xsl:when>
				<xsl:when test="local-name(.) = 'DQ_TopologicalConsistency'">
					<dt>
						<span class="element"> TopologicalConsistency </span>
					</dt>
				</xsl:when>
				<xsl:when test="local-name(.) = 'DQ_AbsoluteExternalPositionalAccuracy'">
					<dt>
						<span class="element"> AbsoluteExternalPositionalAccuracy </span>
					</dt>
				</xsl:when>
				<xsl:when test="local-name(.) = 'DQ_GriddedDataPositionalAccuracy'">
					<dt>
						<span class="element"> GriddedDataPositionalAccuracy </span>
					</dt>
				</xsl:when>
				<xsl:when test="local-name(.) = 'DQ_RelativeInternalPositionalAccuracy'">
					<dt>
						<span class="element"> RelativeInternalPositionalAccuracy </span>
					</dt>
				</xsl:when>
				<xsl:when test="local-name(.) = 'DQ_AccuracyOfATimeMeasurement'">
					<dt>
						<span class="element"> AccuracyOfATimeMeasurement </span>
					</dt>
				</xsl:when>
				<xsl:when test="local-name(.) = 'DQ_TemporalConsistency'">
					<dt>
						<span class="element"> Temporal Consistency </span>
					</dt>
				</xsl:when>
				<xsl:when test="local-name(.) = 'DQ_TemporalValidity'">
					<dt>
						<span class="element">TemporalValidity</span>
					</dt>
				</xsl:when>
				<xsl:when test="local-name(.) = 'DQ_ThematicClassificationCorrectness'">
					<dt>
						<span class="element">ThematicClassificationCorrectness</span>
					</dt>
				</xsl:when>
				<xsl:when test="local-name(.) = 'DQ_NonQuantitativeAttributeAccuracy'">
					<dt>
						<span class="element"> NonQuantitativeAttributeAccuracy </span>
					</dt>
				</xsl:when>
				<xsl:when test="local-name(.) = 'DQ_QuantitativeAttributeAccuracy'">
					<dt>
						<span class="element"> QuantitativeAttributeAccuracy </span>
					</dt>
				</xsl:when>
			</xsl:choose>
			<dd>
				<dl>
					<xsl:for-each select="gmd:nameOfMeasure">
						<dt>
							<span class="element"> name Of Measure </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:evaluationMethodType/gmd:DQ_EvaluationMethodTypeCode">
						<dt>
							<span class="element"> evaluation Method Type </span>&#x2002;
				<xsl:call-template name="AnyCode"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:dateTime">
						<dt>
							<span class="element"> dateTime </span>&#x2002;<xsl:call-template name="Date_PropertyType"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:nameOfMeasure | gmd:evaluationMethodType | gmd:dateTime">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:measureDescription">
						<dt>
							<span class="element"> measure Description </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:for-each>
					<xsl:for-each select="gmd:evaluationMethodDescription">
						<dt>
							<span class="element"> evaluation Method Description </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:for-each>
					<xsl:for-each select="gmd:measureIdentification/gmd:MD_Identifier">
						<dt>
							<span class="element">measure Identification </span>
						</dt>
						<xsl:apply-templates select="." mode="iso19139"/>
					</xsl:for-each>
					<xsl:apply-templates select="gmd:evaluationProcedure/gmd:CI_Citation" mode="iso19139"/>
					<xsl:for-each select="gmd:result">
						<!-- NOTE: this will select the sub-classes: DQ_ConformanceResult, DQ_QuantitativeResult -->
						<xsl:apply-templates select="*" mode="iso19139"/>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Conformance Result Information (B.2.4.3 DQ_ConformanceResult - line129) -->
	<xsl:template match="gmd:DQ_ConformanceResult" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> Conformance Result </span>&#x2002;</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:pass">
						<dt>
							<span class="element"> pass </span>&#x2002;
      	<xsl:call-template name="Boolean"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:explanation">
						<dt>
							<span class="element"> explanation </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:pass | gmd:explanation">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:apply-templates select="gmd:specification/gmd:CI_Citation" mode="iso19139"/>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Quantitative Result Information (B.2.4.3 DQ_QuantitativeResult - line133) -->
	<xsl:template match="gmd:DQ_QuantitativeResult" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> Quantitative Result </span>
			</dt>
			<dd>
				<dl>
					<xsl:if test="gmd:value">
						<xsl:for-each select="gmd:value">
							<dt>
								<span class="element">result value </span>&#x2002;<xsl:call-template name="Record"/>
							</dt>
						</xsl:for-each>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:valueType">
						<dt>
							<span class="element"> value Type </span>&#x2002;<xsl:call-template name="RecordType"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:valueUnit">
						<dt>
							<span class="element"> value Units </span>
						</dt>
						<dd>
							<dl>
								<xsl:apply-templates select="gml:UnitDefinition" mode="iso19139"/>
								<xsl:if test="count (following-sibling::*) = 0">
									<!-- <br/> -->
									<!-- <br/> -->
								</xsl:if>
							</dl>
						</dd>
					</xsl:for-each>
					<xsl:if test="(gmd:valueType) and not (gmd:valueUnit)">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:errorStatistic">
						<dt>
							<span class="element"> error Statistic </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- DISTRIBUTION INFORMATION -->
	<!-- Distribution Information (B.2.10 MD_Distribution - line270) -->
	<xsl:template match="gmd:MD_Distribution" mode="iso19139">
		<a>
			<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<hr/>
		</a>
		<xsl:if test="count (../../gmd:distributionInfo) = 1">
			<dt>
				<h2> Resource distribution information</h2>
			</dt>
		</xsl:if>
		<xsl:if test="count (../../gmd:distributionInfo) &gt; 1">
			<dt>
				<h2>
        Multiple distribution methods: <xsl:value-of select="position()"/>
				</h2>
			</dt>
		</xsl:if>
		<dl>
			<dd>
				<xsl:apply-templates select="gmd:distributor/gmd:MD_Distributor" mode="iso19139"/>
				<xsl:apply-templates select="gmd:distributionFormat/gmd:MD_Format" mode="iso19139"/>
				<xsl:apply-templates select="gmd:transferOptions/gmd:MD_DigitalTransferOptions" mode="iso19139"/>
			</dd>
		</dl>
		<a class="top" href="#Top">Back to top</a>
	</xsl:template>
	<!-- Distributor Information (B.2.10.2 MD_Distributor - line279) -->
	<xsl:template match="gmd:MD_Distributor" mode="iso19139">
		<!-- NOTE: was (distributor | formatDist)"> -->
		<dd>
			<dt>
				<span class="element"> Distributor </span>
			</dt>
			<dd>
				<dl>
					<xsl:apply-templates select="gmd:distributorContact/gmd:CI_ResponsibleParty" mode="iso19139"/>
					<!-- NOTE: removed tests for recursion <xsl:if test="context()[not ((../../dsFormat) or (../../distorFormat) or (../../distFormat))]">
      <xsl:apply-templates select="gmd:distributorFormat/gmd:MD_Format" mode="iso19139"/> 
    </xsl:if>-->
					<xsl:apply-templates select="gmd:distributorFormat/gmd:MD_Format" mode="iso19139"/>
					<xsl:apply-templates select="gmd:distributionOrderProcess/gmd:MD_StandardOrderProcess" mode="iso19139"/>
					<xsl:apply-templates select="gmd:distributorTransferOptions/gmd:MD_DigitalTransferOptions" mode="iso19139"/>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Format Information (B.2.10.3 MD_Format - line284) -->
	<xsl:template match="gmd:MD_Format" mode="iso19139">
		<dd>
			<xsl:choose>
				<xsl:when test="../gmd:resourceFormat">
					<dt>
						<span class="element"> Resource Format </span>
					</dt>
				</xsl:when>
				<!-- TODO: is there an "available format"? -->
				<xsl:when test="../gmd:distributorFormat">
					<dt>
						<span class="element">Distributor Format </span>
					</dt>
				</xsl:when>
				<xsl:otherwise>
					<dt>
						<span class="element"> Format </span>
					</dt>
				</xsl:otherwise>
			</xsl:choose>
			<dd>
				<dl>
					<xsl:for-each select="gmd:name">
						<dt>
							<span class="element"> Format name </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:version">
						<dt>
							<span class="element"> Format version </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:amendmentNumber">
						<dt>
							<span class="element"> amendment Number </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:specification">
						<dt>
							<span class="element"> specification ></span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:fileDecompressionTechnique">
						<dt>
							<span class="element"> file Decompression Technique </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:name | gmd:version | gmd:amendmentNumber | gmd:specification | gmd:fileDecompressionTechnique">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<!-- NOTE: removed <xsl:if test="context()[not ((../../distributor) or (../../formatDist))]">
      <xsl:apply-templates select="formatDist" mode="iso19139"/>
    </xsl:if>-->
					<xsl:apply-templates select="gmd:formatDistributor/gmd:MD_Distributor" mode="iso19139"/>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Standard Order Process Information (B.2.10.5 MD_StandardOrderProcess - line298) -->
	<xsl:template match="gmd:MD_StandardOrderProcess" mode="iso19139">
		<dd>
			<xsl:choose>
				<xsl:when test="(local-name(./..) = 'distributionOrderProcess')">
					<dt>
						<span class="element">Standard ordering process </span>
					</dt>
				</xsl:when>
				<xsl:when test="(local-name(./..) = 'accessProperties')">
					<dt>
						<span class="element">ordering access properties </span>
					</dt>
				</xsl:when>
			</xsl:choose>
			<dd>
				<dl>
					<xsl:for-each select="gmd:fees">
						<dt>
							<span class="element"> fees </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:plannedAvailableDateTime">
						<dt>
							<span class="element"> plannedAvailableDateTime </span>&#x2002;<xsl:call-template name="Date_PropertyType"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:orderingInstructions">
						<dt>
							<span class="element"> Ordering Instructions </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:turnaround">
						<dt>
							<span class="element"> turnaround </span>
						</dt>
						<dl>
							<dd>
								<pre class="wrap">
									<xsl:call-template name="CharacterString"/>
								</pre>
							</dd>
						</dl>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- Digital Transfer Options Information (B.2.10.1 MD_DigitalTransferOptions - line274) -->
	<xsl:template match="gmd:MD_DigitalTransferOptions" mode="iso19139">
		<!-- NOTE: was (distorTran | distTranOps)"> -->
		<dd>
			<dt>
				<span class="element"> Digital Transfer Options </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:transferSize">
						<dt>
							<span class="element"> transfer Size </span>&#x2002;<xsl:call-template name="Real"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:unitsOfDistribution">
						<dt>
							<span class="element">Unit of distribution </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:transferSize | gmd:unitsOfDistribution">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:apply-templates select="gmd:onLine/gmd:CI_OnlineResource" mode="iso19139"/>
					<xsl:apply-templates select="gmd:offLine/gmd:MD_Medium" mode="iso19139"/>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Medium Information (B.2.10.4 MD_Medium - line291) -->
	<xsl:template match="gmd:MD_Medium" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> Medium of distribution </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:name">
						<dt>
							<span class="element"> name </span>&#x2002;
        <xsl:for-each select="gmd:MD_MediumNameCode">
								<xsl:call-template name="AnyCode"/>
							</xsl:for-each>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:volumes">
						<dt>
							<span class="element"> volumes </span>&#x2002;<xsl:call-template name="Integer"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:name | gmd:volumes">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:mediumFormat">
						<dt>
							<span class="element"> medium Format </span>&#x2002;
        <xsl:for-each select="gmd:MD_MediumFormatCode">
								<xsl:call-template name="AnyCode"/>
							</xsl:for-each>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:density">
						<dt>
							<span class="element"> density </span>&#x2002;<xsl:call-template name="Real"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:densityUnits">
						<dt>
							<span class="element"> density Units </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:mediumFormat | gmd:density | gmd:densityUnits">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:mediumNote">
						<dt>
							<span class="element"> medium Note </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
						<xsl:if test="count (following-sibling::*) = 0">
							<!-- <br/> -->
							<!-- <br/> -->
						</xsl:if>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Portrayal Catalogue Reference (B.2.9 MD_PortrayalCatalogueReference - line268) -->
	<xsl:template match="gmd:MD_PortrayalCatalogueReference" mode="iso19139">
		<a>
			<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<hr/>
		</a>
		<!-- removed 
  <xsl:if test="(this.selectNodes('/metadata/porCatInfo').length == 1)">
      <dt><font color="#0000AA" size="3"><span class="element">Portrayal Catalogue Reference</span></font></dt>
  </xsl:if>
  <xsl:if test="(this.selectNodes('/metadata/porCatInfo').length > 1)">
      <dt><font color="#0000AA" size="3"><span class="element">
        Portrayal Catalogue Reference - Catalogue <xsl:value-of select="position()"/>:
      </span></font></dt>
  </xsl:if>-->
		<dt>
			<h2>Portrayal Catalog</h2>
		</dt>
		<dl>
			<dd>
				<xsl:apply-templates select="gmd:portrayalCatalogueCitation/gmd:CI_Citation" mode="iso19139"/>
			</dd>
		</dl>
		<a class="top" href="#Top">Back to top</a>
	</xsl:template>
	<!-- APPLICATION SCHEMA -->
	<!-- Application schema Information (B.2.12 MD_ApplicationSchemaInformation - line320) -->
	<xsl:template match="gmd:MD_ApplicationSchemaInformation" mode="iso19139">
		<a>
			<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<hr/>
		</a>
		<xsl:if test="count (../../*[gmd:MD_ApplicationSchemaInformation]) =  1">
			<dt>
				<h2>Application schema information</h2>
			</dt>
		</xsl:if>
		<xsl:if test="count (../../*[gmd:MD_ApplicationSchemaInformation]) &gt; 1">
			<dt>
				<h2>Schema 
				<xsl:for-each select="..">
						<xsl:value-of select="position()"/>
					</xsl:for-each>
				</h2>
			</dt>
		</xsl:if>
		<dl>
			<dd>
				<xsl:apply-templates select="gmd:name/gmd:CI_Citation" mode="iso19139"/>
				<xsl:for-each select="gmd:schemaLanguage">
					<dt>
						<span class="element"> schema Language </span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gmd:constraintLanguage">
					<dt>
						<span class="element"> constraint Language </span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
				<xsl:if test="gmd:schemaLanguage | gmd:constraintLanguage">
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:if>
				<xsl:for-each select="gmd:schemaAscii">
					<dt>
						<span class="element"> Schema ASCII </span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:for-each>
				<xsl:for-each select="gmd:graphicsFile">
					<dt>
						<span class="element"> graphics File </span>
					</dt>
					<xsl:call-template name="Binary"/>
				</xsl:for-each>
				<xsl:for-each select="gmd:softwareDevelopmentFile">
					<dt>
						<span class="element"> software Development File </span>
					</dt>
					<xsl:call-template name="Binary"/>
				</xsl:for-each>
				<xsl:for-each select="gmd:softwareDevelopmentFileFormat">
					<dt>
						<span class="element"> software Development File Format </span>&#x2003;<xsl:call-template name="CharacterString"/>
					</dt>
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:for-each>
			</dd>
		</dl>
		<a class="top" href="#Top">Back to top</a>
	</xsl:template>
	<!-- Spatial Attribute Supplement Information (B.2.12.2 MD_SpatialAttributeSupplement - line332) -->
	<!-- NOTE: not in ISO 19139 schemas
<xsl:template match="featCatSup" mode="iso19139">
  <dd>
    <dt><span class="element">Feature catalogue supplement</span></dt>
    <dd>
    <dl>
      <xsl:apply-templates select="featTypeList" mode="iso19139"/>
    </dl>
    </dd>
  </dd>
</xsl:template>-->
	<!-- Feature Type List Information (B.2.12.1 MD_FeatureTypeList - line329 -->
	<!-- NOTE: not in ISO 19139 schemas
<xsl:template match="featTypeList" mode="iso19139">
  <dd>
    <dt><span class="element">Feature type list</span></dt>
    <dd>
    <dl>
      <xsl:for-each select="spatObj">
        <dt><span class="element">Spatial object</span>&#x2002;<xsl:value-of select = "." /></dt>
      </xsl:for-each>
      <xsl:for-each select="spatSchName">
        <dt><span class="element">Spatial schema name</span>&#x2002;<xsl:value-of select = "." /></dt>
      </xsl:for-each>
    </dl>
    </dd>
  </dd>
  <br />
</xsl:template>-->
	<!-- METADATA EXTENSIONS -->
	<!-- Metadata Extension Information (B.2.11 MD_MetadataExtensionInformation - line303) -->
	<xsl:template match="gmd:MD_MetadataExtensionInformation" mode="iso19139">
		<a>
			<xsl:attribute name="name"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
			<hr/>
		</a>
		<dt>
			<h2>Description of extensions to base metadata standard</h2>
		</dt>
		<dl>
			<dd>
				<xsl:apply-templates select="gmd:extensionOnLineResource/gmd:CI_OnlineResource" mode="iso19139"/>
				<xsl:apply-templates select="gmd:extendedElementInformation/gmd:MD_ExtendedElementInformation" mode="iso19139"/>
			</dd>
		</dl>
		<a class="top" href="#Top">Back to top</a>
	</xsl:template>
	<!-- Extended Element Information (B.2.11.1 MD_ExtendedElementInformation - line306) -->
	<xsl:template match="gmd:MD_ExtendedElementInformation" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> ExtendedElementInformation </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:name">
						<dt>
							<span class="element"> Elementname </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:shortName">
						<dt>
							<span class="element"> shortName </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:domainCode">
						<dt>
							<span class="element"> domainCode </span>&#x2002;<xsl:call-template name="Integer"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:definition">
						<dt>
							<span class="element"> definition </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:name | gmd:shortName | gmd:domainCode | gmd:definition">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:c/gmd:MD_ObligationCode">
						<dt>
							<span class="element"> Obligation </span>&#x2002;
					<xsl:call-template name="AnyCode"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:condition">
						<dt>
							<span class="element"> condition </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:maximumOccurrence">
						<dt>
							<span class="element"> maximumOccurrence </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:dataType/gmd:MD_DatatypeCode">
						<dt>
							<span class="element"> dataType </span>&#x2002;
			<xsl:call-template name="AnyCode"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:domainValue">
						<dt>
							<span class="element"> domainValue </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:obligation | gmd:condition | gmd:maximumOccurrence | gmd:dataType | gmd:domainValue">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:parentEntity">
						<dt>
							<span class="element"> parentEntity </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:rule">
						<dt>
							<span class="element"> rule </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:rationale">
						<dt>
							<span class="element"> rationale </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:parentEntity | gmd:rule | gmd:rationale">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:apply-templates select="gmd:source/gmd:CI_ResponsibleParty" mode="iso19139"/>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- TEMPLATES FOR DATA TYPE CLASSES -->
	<!-- CITATION AND CONTACT INFORMATION -->
	<!-- Citation Information (B.3.2 CI_Citation - line359) -->
	<xsl:template match="gmd:CI_Citation" mode="iso19139">
		<dd>
			<xsl:choose>
				<xsl:when test="(local-name(./..) = 'citation')">
					<dt>
						<span class="element">Citation </span>
					</dt>
				</xsl:when>
				<xsl:when test="(local-name(./..) = 'thesaurusName')">
					<dt>
						<span class="element"> thesaurus name ></span>
					</dt>
				</xsl:when>
				<xsl:when test="(local-name(./..) = 'authority')">
					<dt>
						<span class="element"> authority </span>
					</dt>
				</xsl:when>
				<xsl:when test="(local-name(./..) = 'sourceCitation')">
					<dt>
						<span class="element"> source citation </span>
					</dt>
				</xsl:when>
				<xsl:when test="(local-name(./..) = 'evaluationProcedure')">
					<dt>
						<span class="element"> evaluation Procedure </span>
					</dt>
				</xsl:when>
				<xsl:when test="(local-name(./..) = 'specification')">
					<dt>
						<span class="element"> specification </span>
					</dt>
				</xsl:when>
				<xsl:when test="(local-name(./..) = 'parameterCitation')">
					<dt>
						<span class="element"> parameterCitation </span>
					</dt>
				</xsl:when>
				<xsl:when test="(local-name(./..) = 'portrayalCatalogueCitation')">
					<dt>
						<span class="element"> portrayal Catalogue Citation </span>
					</dt>
				</xsl:when>
				<xsl:when test="(local-name(./..) = 'featureCatalogueCitation')">
					<dt>
						<span class="element"> feature catalogue Citation </span>
					</dt>
				</xsl:when>
				<xsl:when test="(local-name(./..) = 'name')">
					<dt>
						<span class="element"> application schema name </span>
					</dt>
				</xsl:when>
				<xsl:otherwise>
					<dt>
						<span class="element"> Citation </span>
					</dt>
				</xsl:otherwise>
			</xsl:choose>
			<dd>
				<dl>
					<xsl:for-each select="gmd:title">
						<dt>
							<span class="element"> Title </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:alternateTitle">
						<dt>
							<span class="element"> alternateTitle </span>&#x2002;
	      <xsl:for-each select="gmd:alternateTitle">
								<xsl:call-template name="CharacterString"/>
								<xsl:if test="not(position()=last())">, </xsl:if>
							</xsl:for-each>
						</dt>
					</xsl:if>
					<xsl:if test="gmd:title | gmd:alternateTitle">
						<!-- <br/> -->
					</xsl:if>
					<xsl:if test="gmd:title[not(gmd:PT_FreeText)] | gmd:alternateTitle">
						<!-- <br/> -->
					</xsl:if>
					<xsl:apply-templates select="gmd:date/gmd:CI_Date" mode="iso19139"/>
					<xsl:for-each select="gmd:edition">
						<dt>
							<span class="element"> Edition </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:editionDate">
						<dt>
							<span class="element"> edition Date </span>&#x2002;<xsl:call-template name="Date_PropertyType"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:presentationForm">
						<dt>
							<span class="element"> presentationForm </span>&#x2002;
        <xsl:for-each select="gmd:CI_PresentationFormCode">
								<xsl:call-template name="AnyCode"/>
							</xsl:for-each>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:edition | gmd:editionDate | gmd:presentationForm">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:collectiveTitle">
						<dt>
							<span class="element"> collective Title </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:apply-templates select="gmd:series/gmd:CI_Series" mode="iso19139"/>
					<xsl:if test="gmd:collectiveTitle or gmd:series">
						<!-- <br/> -->
					</xsl:if>
					<xsl:if test="gmd:collectiveTitle and not(gmd:series)">
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:ISBN">
						<dt>
							<span class="element"> ISBN </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:ISSN">
						<dt>
							<span class="element"> ISSN </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:identifier/gmd:code">
						<dt>
							<span class="element">Identifier </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:ISBN | gmd:ISSN | gmd:identifier">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:for-each select="gmd:otherCitationDetails">
						<dt>
							<span class="element"> other Citation Details </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:for-each>
					<xsl:apply-templates select="gmd:citedResponsibleParty/gmd:CI_ResponsibleParty" mode="iso19139"/>
					<!-- NOTE: removed <xsl:if test="context()[not (text()) and not(*)]"><br /></xsl:if>-->
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Date Information (B.3.2.3 CI_Date) -->
	<xsl:template match="gmd:CI_Date" mode="iso19139">
		<dd>
			<dt>
				<span class="element">
					<xsl:for-each select="gmd:dateType/gmd:CI_DateTypeCode">
						<xsl:call-template name="AnyCode"/>&#x2008; Date 
      </xsl:for-each>
				</span>&#x2002;
      <xsl:for-each select="gmd:date">
					<xsl:call-template name="Date_PropertyType"/>
				</xsl:for-each>
			</dt>
		</dd>
		<xsl:if test="position()=last()">
			<!-- <br/> -->
			<!-- <br/> -->
		</xsl:if>
	</xsl:template>
	<!-- Responsible Party Information (B.3.2 CI_ResponsibleParty - line374) -->
	<xsl:template match="gmd:CI_ResponsibleParty" mode="iso19139">
		<!-- TODO: (gmd:contact | gmd:pointOfContact | gmd:userContactInfo | stepProc | distorCont | 
      citRespParty | extEleSrc)"> -->
		<dd>
			<dt>
				<span class="element">
					<xsl:choose>
						<xsl:when test="../../gmd:contact">
      Metadata contact 
    </xsl:when>
						<xsl:when test="../../gmd:pointOfContact"> 
     point of contact 
    </xsl:when>
						<xsl:when test="../../gmd:userContactInfo"> 
      user contact information
    </xsl:when>
						<xsl:when test="../../gmd:processor">
      processing agent contact
    </xsl:when>
						<xsl:when test="../../gmd:distributorContact">
      distributor contact 
    </xsl:when>
						<xsl:when test="../../gmd:citedResponsibleParty">
      cited responsible party 
    </xsl:when>
						<!-- gmd:source?? -->
						<xsl:when test="../gmd:source">
     source 
    </xsl:when>
						<xsl:otherwise>
       Contact 
    </xsl:otherwise>
					</xsl:choose> - 
  <xsl:for-each select="gmd:role/gmd:CI_RoleCode">
						<xsl:call-template name="AnyCode"/>
					</xsl:for-each>
				</span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:individualName">
						<dt>
							<span class="element"> individual Name </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:organisationName">
						<dt>
							<span class="element"> organisation Name </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:positionName">
						<dt>
							<span class="element"> position Name </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:if test="gmd:individualName | gmd:organisationName | gmd:positionName">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
					<xsl:apply-templates select="gmd:contactInfo/gmd:CI_Contact" mode="iso19139"/>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Contact Information (B.3.2.2 CI_Contact - line387) -->
	<xsl:template match="gmd:CI_Contact" mode="iso19139">
		<dd>
			<dt>
				<span class="element">Contact information</span>
			</dt>
			<dd>
				<dl>
					<xsl:apply-templates select="gmd:phone/gmd:CI_Telephone" mode="iso19139"/>
					<xsl:apply-templates select="gmd:address/gmd:CI_Address" mode="iso19139"/>
					<xsl:apply-templates select="gmd:onlineResource/gmd:CI_OnlineResource" mode="iso19139"/>
					<xsl:for-each select="gmd:hoursOfService">
						<dt>
							<span class="element"> hoursOfService </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:contactInstructions">
						<dt>
							<span class="element"> contact Instructions </span>
						</dt>
						<dl>
							<dd>
								<pre class="wrap">
									<xsl:call-template name="CharacterString"/>
								</pre>
							</dd>
						</dl>
					</xsl:for-each>
					<xsl:if test="gmd:hoursOfService and not(gmd:contactInstructions)">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Telephone Information (B.3.2.6 CI_Telephone - line407) -->
	<xsl:template match="gmd:CI_Telephone" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> Telephone </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:voice">
						<dt>
							<span class="element"> Voice </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:facsimile">
						<dt>
							<span class="element"> Fax </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- Address Information (B.3.2.1 CI_Address - line380) -->
	<xsl:template match="gmd:CI_Address" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> Address </span>
			</dt>
			<dd>
				<dl>
					<dt>
					<xsl:for-each select="gmd:deliveryPoint">
<!--							<span class="element"> deliveryPoint </span>&#x2003;--><xsl:call-template name="CharacterString"/>
<!--						</dt>-->
					</xsl:for-each>
					<xsl:for-each select="gmd:city">
<!--						<dt>-->
							<span class="element">, </span>&#x2003;<xsl:call-template name="CharacterString"/>
<!--						</dt>-->
					</xsl:for-each><xsl:for-each select="gmd:administrativeArea"><!--
							--><span class="element">, </span>&#x2003;<xsl:call-template name="CharacterString"/><!--
					--></xsl:for-each><xsl:for-each select="gmd:postalCode">
<!--						<dt>-->
							<span class="element">,&#x2003;</span><xsl:call-template name="CharacterString"/>
						<!--					</dt>-->
					</xsl:for-each>
					<xsl:for-each select="gmd:country"><!--
							--><span class="element"> Country </span>&#x2002;<xsl:call-template name="CharacterString"/>
					</xsl:for-each>
					</dt>
					<xsl:for-each select="gmd:electronicMailAddress">
						<dt>
							<span class="element"> electronic Mail Address </span>&#x2002;<a>
								<!-- xsl:attribute name="href">mailto:<xsl:value-of select="."/>?subject=<xsl:value-of select="//identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString"/></xsl:attribute  -->
								<xsl:attribute name="href">mailto:<xsl:value-of select="gco:CharacterString"/></xsl:attribute>
								<xsl:value-of select="normalize-space(gco:CharacterString)"/>
							</a>
						</dt>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- language code list from ISO 639 -->
	<xsl:template match="gmd:country" mode="arcgis">
		<xsl:if test="gco:CharacterString">
			<xsl:call-template name="ISO3166_CountryCode">
				<xsl:with-param name="code" select="gco:CharacterString"/>
			</xsl:call-template>
		</xsl:if>
		<xsl:if test="gmd:Country">
			<xsl:call-template name="cntry3166_2letter">
				<xsl:with-param name="code" select="gmd:Country/@codeListValue"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>
	<!-- Online Resource Information (B.3.2.4 CI_OnlineResource - line396) -->
	<xsl:template match="gmd:CI_OnlineResource" mode="iso19139">
		<dd>
			<dt>
				<span class="element">Linkage for online resource</span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:name">
						<dt>
							<span class="element">name  </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:linkage/gmd:URL">
						<dt>
							<span class="element">URL: </span>&#x2002;<xsl:call-template name="urlType">
								<xsl:with-param name="value" select="normalize-space(.)"/>
							</xsl:call-template>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:protocol">
						<dt>
							<span class="element"> protocol </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:function/gmd:CI_OnLineFunctionCode">
						<dt>
							<span class="element"> link function </span>&#x2002;<xsl:call-template name="AnyCode"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:description">
						<dt>
							<span class="element"> Description </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:applicationProfile">
						<dt>
							<span class="element"> target application profile </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- Series Information (B.3.2.5 CI_Series - line403) -->
	<xsl:template match="gmd:CI_Series" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> Series </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:name">
						<dt>
							<span class="element"> Name </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:issueIdentification">
						<dt>
							<span class="element"> Issue </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:page">
						<dt>
							<span class="element"> Pages </span>&#x2003;<xsl:call-template name="CharacterString"/>
						</dt>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- EXTENT INFORMATION -->
	<!-- Extent Information (B.3.1 EX_Extent - line334) -->
	<xsl:template match="gmd:EX_Extent" mode="iso19139">
		<!-- NOTE: was (dataExt | scpExt | srcExt)">-->
		<dd>
			<!-- TODO: show more descriptive text
  <xsl:choose>
    <xsl:when test="../dataExt">
      <dt><span class="element">Other extent information</span></dt>
    </xsl:when>
    <xsl:when test="../scpExt">
      <dt><span class="element">Scope extent</span></dt>
    </xsl:when>
    <xsl:when test="../srcExt">
      <dt><span class="element">Extent of the source data</span></dt>
    </xsl:when>
    <xsl:otherwise>
      <dt><span class="element">Extent</span></dt>
    </xsl:otherwise>
  </xsl:choose>-->
			<dt>
				<span class="element">Resource extent</span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:description">
						<dt>
							<span class="element"> Extent description</span>
						</dt>
						<dd>
							<pre class="wrap">
								<xsl:call-template name="CharacterString"/>
							</pre>
						</dd>
					</xsl:for-each>
					<xsl:for-each select="gmd:geographicElement">
						<dt>
							<span class="element"> Geographic Extent </span>
						</dt>
						<dd>
							<dd>
								<dl>
									<xsl:apply-templates select="*" mode="iso19139"/>
								</dl>
							</dd>
						</dd>
						<!--        <xsl:if test="not (following-sibling::*)"><br /></xsl:if> -->
					</xsl:for-each>
					<xsl:for-each select="gmd:temporalElement">
						<xsl:apply-templates select="*" mode="iso19139"/>
					</xsl:for-each>
					<xsl:apply-templates select="gmd:verticalElement/gmd:EX_VerticalExtent" mode="iso19139"/>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Bounding Polygon Information (B.3.1.1 EX_BoundingPolygon - line341) -->
	<xsl:template match="gmd:EX_BoundingPolygon" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> BoundingPolygon </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:extentTypeCode">
						<dt>
							<span class="element"> extent Type Code </span>&#x2002;
				<xsl:call-template name="Boolean"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:polygon/gml:Polygon">
						<dt>
							<span class="element"> polygon </span>
						</dt>
						<dl>
							<dd>
								<xsl:for-each select="gml:exterior/gml:LinearRing">
									<dt>
										<span class="element"> exterior </span>
									</dt>
									<dl>
										<dd>
											<xsl:for-each select="gml:pos">
												<dt>
													<span class="element"> gmlPos </span>&#x2002;<xsl:value-of select="."/>
												</dt>
											</xsl:for-each>
										</dd>
									</dl>
								</xsl:for-each>
								<xsl:for-each select="gml:interior/gml:LinearRing">
									<dt>
										<span class="element"> interior </span>
									</dt>
									<dl>
										<dd>
											<xsl:for-each select="gml:pos">
												<dt>
													<span class="element"> gmlPos </span>&#x2002;<xsl:value-of select="."/>
												</dt>
											</xsl:for-each>
										</dd>
									</dl>
								</xsl:for-each>
							</dd>
						</dl>
					</xsl:for-each>
					<!-- <br/> -->
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Bounding Box Information (B.3.1.1 EX_GeographicBoundingBox - line343) -->
	<xsl:template match="gmd:EX_GeographicBoundingBox" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> Geographic Bounding Box </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:extentTypeCode">
						<dt>
							<span class="element"> extent Type Code </span>&#x2002;
        	<xsl:call-template name="Boolean"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:westBoundLongitude">
						<dt>
							<span class="element"> westBoundLongitude </span>&#x2002;<xsl:call-template name="Decimal"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:eastBoundLongitude">
						<dt>
							<span class="element"> eastBoundLongitude </span>&#x2002;<xsl:call-template name="Decimal"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:northBoundLatitude">
						<dt>
							<span class="element"> northBoundLatitude </span>&#x2002;<xsl:call-template name="Decimal"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:southBoundLatitude">
						<dt>
							<span class="element"> southBoundLatitude </span>&#x2002;<xsl:call-template name="Decimal"/>
						</dt>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- Geographic Description Information (B.3.1.1 EX_GeographicDescription - line348) -->
	<xsl:template match="EX_GeographicDescription" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> GeographicDescription </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:extentTypeCode">
						<dt>
							<span class="element"> extent Type Code </span>&#x2002;
        	<xsl:call-template name="Boolean"/>
						</dt>
					</xsl:for-each>
					<xsl:apply-templates select="gmd:geographicIdentifier/gmd:MD_Identifier" mode="iso19139"/>
					<xsl:if test="(gmd:extentTypeCode) and not (gmd:geographicIdentifier)">
						<!-- <br/> -->
						<!-- <br/> -->
					</xsl:if>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Temporal Extent Information (B.3.1.2 EX_TemporalExtent - line350) -->
	<xsl:template match="gmd:EX_TemporalExtent" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> Temporal Extent </span>
			</dt>
			<xsl:apply-templates select="gmd:extent/*" mode="iso19139"/>
		</dd>
	</xsl:template>
	<!-- temporal extent Information from ISO 19103 as defined is DTD -->
	<xsl:template match="gml:TimePeriod" mode="iso19139">
		<dd>
			<dl>
				<xsl:for-each select="gml:beginPosition">
					<dt>
						<span class="element"> begin </span>&#x2002;<xsl:call-template name="TimeInstant"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gml:begin/gml:TimeInstant">
					<dt>
						<span class="element"> begin</span>&#x2002;<xsl:call-template name="TimeInstant"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gml:endPosition">
					<dt>
						<span class="element"> end </span>&#x2002;<xsl:call-template name="TimeInstant"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gml:end/gml:TimeInstant">
					<dt>
						<span class="element"> end </span>&#x2002;<xsl:call-template name="TimeInstant"/>
					</dt>
				</xsl:for-each>
			</dl>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- temporal extent Information from ISO 19103 as defined is DTD -->
	<xsl:template match="gml:TimeInstant" mode="iso19139">
		<dd>
			<dl>
				<xsl:for-each select="gml:timePosition">
					<dt>
						<span class="element"> time Position</span>&#x2002;
			<xsl:call-template name="TimeInstant"/>
					</dt>
				</xsl:for-each>
			</dl>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- Spatial Temporal Extent Information (B.3.1.2 EX_SpatialTemporalExtent - line352) -->
	<xsl:template match="gmd:EX_SpatialTemporalExtent" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> Spatial Tempora lExtent </span>
			</dt>
			<dd>
				<dl>
					<!-- NOTE: select sub-classes of gml:AbstractTimePrimitive -->
					<xsl:apply-templates select="gmd:extent/*" mode="iso19139"/>
					<xsl:for-each select="gmd:spatialExtent">
						<dt>
							<span class="element"> spatial Extent </span>
						</dt>
						<dd>
							<dd>
								<dl>
									<!-- 
								NOTE: can call sub-classes' templates:
								EX_BoundingPolygon, EX_GeographicBoundingBox, EX_GeographicDescription
						-->
									<xsl:apply-templates select="*" mode="iso19139"/>
								</dl>
							</dd>
						</dd>
					</xsl:for-each>
				</dl>
			</dd>
		</dd>
	</xsl:template>
	<!-- Vertical Extent Information (B.3.1.3 EX_VerticalExtent - line354) -->
	<xsl:template match="gmd:EX_VerticalExtent" mode="iso19139">
		<dd>
			<dt>
				<span class="element"> Vertical Extent </span>
			</dt>
			<dd>
				<dl>
					<xsl:for-each select="gmd:minimumValue">
						<dt>
							<span class="element"> bottom </span>&#x2002;<xsl:call-template name="Real"/>
						</dt>
					</xsl:for-each>
					<xsl:for-each select="gmd:maximumValue">
						<dt>
							<span class="element">top </span>&#x2002;<xsl:call-template name="Real"/>
						</dt>
					</xsl:for-each>
					<!-- 19139 uses GML here instead of ISO 19115's unitOfMeasure (UomLength) -->
					<xsl:if test="gmd:verticalCRS">
						<xsl:for-each select="gmd:verticalCRS/*">
							<!-- TODO: review this -->
							<dt>
								<span class="element"> Vertical Coordinate Reference System /></span>&#x2002;<xsl:call-template name="AbstractCRS"/>
							</dt>
						</xsl:for-each>
					</xsl:if>
				</dl>
			</dd>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- gml:TimeInstant -->
	<xsl:template name="TimeInstant">
		<!-- NOTE: ignoring attributes: frame, calendarEraName, indeterminatePosition -->
		<xsl:value-of select="."/>
	</xsl:template>
	<!-- gco:Boolean -->
	<xsl:template name="Boolean">
		<xsl:for-each select="gco:Boolean">
			<xsl:value-of select="."/>
		</xsl:for-each>
	</xsl:template>
	<!-- gco:CodeListValue_Type -->
	<xsl:template name="AnyCode">
		<xsl:value-of select="(@codeListValue | text())[1]"/>
	</xsl:template>
	<!-- gco:Measure and gco:Distance -->
	<xsl:template match="gco:Measure | gco:Distance" mode="iso19139">
		<!-- NOTE: uom attribute supressed -->
		<xsl:value-of select="."/>
		<xsl:for-each select="./@uom">&#160;<xsl:call-template name="ucum_units">
				<xsl:with-param name="unit" select="."/>
			</xsl:call-template>
		</xsl:for-each>
	</xsl:template>
	<!-- gco:Integer -->
	<xsl:template name="Integer">
		<xsl:for-each select="gco:Integer">
			<xsl:value-of select="."/>
		</xsl:for-each>
	</xsl:template>
	<!-- gco:Real -->
	<xsl:template name="Real">
		<xsl:for-each select="gco:Real">
			<xsl:value-of select="."/>
		</xsl:for-each>
	</xsl:template>
	<!-- gco:Decimal -->
	<xsl:template name="Decimal">
		<xsl:value-of select="gco:Decimal"/>
	</xsl:template>
	<!-- gco:Date_PropertyType -->
	<xsl:template name="Date_PropertyType">
		<xsl:value-of select="(gco:Date | gco:DateTime)[1]"/>
	</xsl:template>
	<!-- gco:CharacterString , gco:FreeText -->
	<xsl:template name="CharacterString">
		<xsl:for-each select="*">
			<xsl:if test="local-name(.) = 'CharacterString'">
				<xsl:value-of select="normalize-space(.)"/>
			</xsl:if>
			<xsl:if test="local-name(.) = 'PT_FreeText'">
				<!-- <b><xsl:value-of select="name(ancestor-or-self::*[2])" /></b> -->
				<dl>
					<dd>
						<b>
							<xsl:value-of select="gmd:textGroup/gmd:LocalisedCharacterString/@locale"/>
						</b>&#x2002;<xsl:value-of select="gmd:textGroup/gmd:LocalisedCharacterString"/>
					</dd>
				</dl>
			</xsl:if>
		</xsl:for-each>
	</xsl:template>
	<!-- gco:Record -->
	<xsl:template name="Record">
		<!-- NOTE: this has no content model in the ISO 19139 schemas -->
		<xsl:for-each select="gco:Record">
			<xsl:value-of select="."/>
		</xsl:for-each>
	</xsl:template>
	<!-- gml:Point -->
	<xsl:template match="gml:Point" mode="iso19139">
		<!-- NOTE: ignoring attribute-group gml:SRSReferenceGroup -->
		<xsl:value-of select="(gml:pos | gml:coordinates)[1]"/>
	</xsl:template>
	<!-- gml:UnitDefinitionType -->
	<xsl:template match="gml:UnitDefinition" mode="iso19139">
		<!-- NOTE: there are lots of elements and attributes not included -->
		<dd>
			<dl>
				<xsl:for-each select="gml:catalogSymbol">
					<dt>
						<span class="element"> gmlCatalogSymbo </span>&#x2002;<xsl:value-of select="."/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gml:catalogSymbol/@codeSpace">
					<dl>
						<dd>
							<dt>
								<span class="element"> gmlCatalogSymbol_codespace </span>&#x2002;<xsl:value-of select="."/>
							</dt>
						</dd>
					</dl>
				</xsl:for-each>
				<xsl:if test="gml:catalogSymbol/text() or gml:catalogSymbol/@codeSpace">
					<!-- <br/> -->
				</xsl:if>
				<xsl:for-each select="gml:quantityType">
					<dt>
						<span class="element"> gmlQuantityType </span>&#x2002;<xsl:call-template name="CharacterString"/>
					</dt>
					<!-- <br/> -->
					<!-- <br/> -->
				</xsl:for-each>
				<xsl:for-each select="gml:name">
					<dt>
						<span class="element"> gmlName </span>&#x2002;<xsl:value-of select="."/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gml:name/@codeSpace">
					<dl>
						<dd>
							<dt>
								<span class="element"> gmlName2_codespace </span>&#x2002;<xsl:value-of select="."/>
							</dt>
						</dd>
					</dl>
				</xsl:for-each>
				<xsl:for-each select="gml:description">
					<dt>
						<span class="element"> gmlDesc </span>&#x2002;<xsl:call-template name="CharacterString"/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gml:identifier">
					<dt>
						<span class="element"> gmlIdent </span>&#x2002;<xsl:value-of select="."/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gml:identifier/@codeSpace">
					<dl>
						<dd>
							<dt>
								<span class="element"> gmlIdent2_codespace </span>&#x2002;<xsl:value-of select="."/>
							</dt>
						</dd>
					</dl>
				</xsl:for-each>
				<xsl:for-each select="@gml:id">
					<dt>
						<span class="element"> gmlID </span>&#x2002;<xsl:value-of select="."/>
					</dt>
				</xsl:for-each>
				<xsl:for-each select="gml:remarks">
					<dt>
						<span class="element"> gmlRemarks </span>&#x2002;<xsl:value-of select="."/>
					</dt>
				</xsl:for-each>
			</dl>
		</dd>
		<!-- <br/> -->
	</xsl:template>
	<!-- gml:AbstractGeometry -->
	<xsl:template name="AbstractGeometry">
		<!-- NOTE: no implementation -->
	</xsl:template>
	<!-- gml:AbstractCRS -->
	<xsl:template name="AbstractCRS">
		<!-- NOTE: no implementation -->
	</xsl:template>
	<!-- gco:RecordType -->
	<xsl:template name="RecordType">
		<!-- NOTE: attribute-group xlink:simpleLink ignored -->
		<xsl:for-each select="gco:RecordType">
			<xsl:value-of select="."/>
		</xsl:for-each>
	</xsl:template>
	<!-- gco:Binary -->
	<xsl:template name="Binary">
		<dl>
			<dd>
				<xsl:value-of select="gco:Binary"/>
				<xsl:if test="gco:Binary/@src">
					<dt>
						<span class="element"> srcAttribute </span>&#x2002;<xsl:call-template name="urlType">
							<xsl:with-param name="value" select="gco:Binary/@src"/>
						</xsl:call-template>
					</dt>
				</xsl:if>
			</dd>
		</dl>
		<!-- <br/> -->
	</xsl:template>

</xsl:stylesheet>
