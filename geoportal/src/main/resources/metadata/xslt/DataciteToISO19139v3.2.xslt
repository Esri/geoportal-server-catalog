<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco"
    xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:datetime="http://exslt.org/dates-and-times"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="datetime">

    <xsl:output method="xml" encoding="utf-8" omit-xml-declaration="no" indent="yes"/>
    <!-- 
	Damian Ulbricht original xslt 
	Revised by Stephen Richard to generalize handling of more options and update for 
	DataCite v4 xml.  For use by IEDA
	This transform takes a datacite v2,3, or 4 xml document and transforms to ISO19139 xml.
	uses local-names for elements, so for those elements that are the same in DataCite v3 and v4
	will work. 
	
	2017-04-04 update to handle related identifiers, pre v4. 
	spatial location encoding.
	Handle relatedIdentifiers (gmd:aggregationInfo)
	Put funder information in gmd:identificationInfo/gmd:credit
	Add gmd:metadataMaintainence note describing how the ISO record was generated

	2017-04-12 translations for MD_Scopecode and the codelists
	moved metadata contact to a template since this is always static information
        changed fileidentifier to be retrieved from the DOI value
	changes for XSLT 1.0 - replaced "exists(x)" with "count(x) > 0"	for lists of nodes and replaced "exists(x)" with 
	" x!='' " for strings 
	
	SMR 2017-10-14 update to group keywords by subjectScheme and identifies IEDA facet group keywords and puts them in
	properly labeled groups. The standard codeListValues are used, and the IEDA facet nameis the element value
	in the MD_KeywordTypeCode element.  Also add data center keyword.

	SMR 2018-01-25 update to use for any IEDA DataCite. 
	Have to insert logic to determine partner system source if new partners are added 
	SMR 2018-03-18 update header comments, change name so datacite is lower case, for consistency
	add license and copyright statement.
	SMR 2018 ? update to use Available date as date released if it is available, otherwise publication year
	SMR 2018-06-19  add input parameter for gmd:dateStamp named 'updateDate'. This should be the most recent update
	   date for the source record being transformed. Since DataCiteXML doesn't have an element for the 
	   metadata update date, this should be populated from the file-system update date
	-->
    
    
    <!--  * @copyright    2007-2017 Interdisciplinary Earth Data Alliance, Columbia University. 
	        All Rights Reserved.
 *          Licensed under the Apache License, Version 2.0 (the "License"); 
            you may not use this file except in compliance with the License. 
			You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is 
    distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
    See the License for the specific language governing permissions and limitations under the License -->

<!-- parameter to pass in the gmd:dateStamp for metadata update date -->
    <xsl:param name="updateDate"></xsl:param>

<!-- this is used for the Data Centre keyword type for faceting in the search interface (Geoportal) -->
    <xsl:variable name="datacentre">
        <xsl:choose>
            <!-- USAP -->
            <xsl:when test="//*[local-name()='alternateIdentifier' and contains(text(),'www.usap-dc.org')]">
                <xsl:value-of select="string('US Antarctic Program Data Center (USAP-DC)')"/>
            </xsl:when>
            
            <!-- ECL -->
            <xsl:when test="//*[local-name()='alternateIdentifier' and contains(text(),'www.earthchem.org')]">
                <xsl:value-of select="string('EarthChem Library (ECL)')"/>
            </xsl:when>
			<!-- Academic Seismic Portal at Lamont -->
            <xsl:when test="//*[local-name()='alternateIdentifier' and contains(@alternateIdentifierType,'UTIG')]">
                <xsl:value-of select="string('ASP@LDEO')"/>
            </xsl:when>
            
            <xsl:when test="string-length(normalize-space(//*[local-name() = 'publisher'][1]))>0 and
                normalize-space(//*[local-name() = 'publisher'][1]) != 'missing'">
            <xsl:value-of select="normalize-space(//*[local-name() = 'publisher'][1])"/>
        </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="string('Interdisciplinary Earth Data Alliance')"/>
            </xsl:otherwise>
 
        </xsl:choose>
    </xsl:variable>
    
    <!-- The contact for the metadata - static value; customize for your
		application.  -->   
    <xsl:template name="metadatacontact">
        <gmd:contact>
            <gmd:CI_ResponsibleParty>
                <gmd:organisationName>
                    <gco:CharacterString>Interdisciplinary Earth Data Alliance</gco:CharacterString>
                </gmd:organisationName>
                <gmd:contactInfo>
                    <gmd:CI_Contact>
                        <gmd:address>
                            <gmd:CI_Address>
                                <gmd:electronicMailAddress>
                                    <!--<gco:CharacterString>info@EarthChem.org</gco:CharacterString>-->
                                    <gco:CharacterString>
                                        <xsl:choose>
                                            <xsl:when test="$datacentre='US Antarctic Program Data Center (USAP-DC)'"> 
                                                <xsl:value-of select="string('web@usap-dc.org')"/>
                                            </xsl:when>
                                            <xsl:when test="$datacentre='EarthChem Library (ECL)'"> 
                                                <xsl:value-of select="string('info@EarthChem.org')"/>
                                            </xsl:when>
                                            <xsl:when test="$datacentre='ASP@LDEO'">
                                                <xsl:value-of select="string('info@marine-geo.org')"/>
                                            </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:value-of select="string('info@iedadata.org')"/>
                                        </xsl:otherwise>
                                        </xsl:choose>
                                    </gco:CharacterString>
                                </gmd:electronicMailAddress>
                            </gmd:CI_Address>
                        </gmd:address>
                        <!--  only allow one online resource; choose the logo...
						<gmd:onlineResource>
							<gmd:CI_OnlineResource>
								<gmd:linkage>
									<gmd:URL>http://www.earthchem.org/library</gmd:URL>
								</gmd:linkage>
								<gmd:function>
									<gmd:CI_OnLineFunctionCode
										codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_OnLineFunctionCode"
										codeListValue="information"
										>information</gmd:CI_OnLineFunctionCode>
								</gmd:function>
							</gmd:CI_OnlineResource>
						</gmd:onlineResource>-->
                        <gmd:onlineResource>
                            <gmd:CI_OnlineResource>
                                <gmd:linkage>
                                    <gmd:URL>
                                    <xsl:choose>
                                        <xsl:when test="$datacentre='US Antarctic Program Data Center (USAP-DC)'"> 
                                            <xsl:value-of select="string('http://www.usap-dc.org/static/imgs/header/usaplogo.png')"/>
                                        </xsl:when>
                                        <xsl:when test="$datacentre='EarthChem Library (ECL)'"> 
                                            <xsl:value-of select="string('http://www.earthchem.org/sites/earthchem.org/files/arthemia_logo.jpg')"/>
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:value-of select="string('https://www.iedadata.org/wp-content/themes/IEDA/assets/img/logo.png')"/>
                                        </xsl:otherwise>
                                    </xsl:choose>
                                    </gmd:URL>
                                </gmd:linkage>
                                <gmd:function>
                                    <gmd:CI_OnLineFunctionCode
                                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_OnLineFunctionCode"
                                        codeListValue="browseGraphic">logo graphic</gmd:CI_OnLineFunctionCode>
                                </gmd:function>
                            </gmd:CI_OnlineResource>
                        </gmd:onlineResource>
                    </gmd:CI_Contact>
                </gmd:contactInfo>
                <gmd:role>
                    <gmd:CI_RoleCode
                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_RoleCode"
                        codeListValue="pointOfContact">pointOfContact</gmd:CI_RoleCode>
                </gmd:role>
            </gmd:CI_ResponsibleParty>
        </gmd:contact>
    </xsl:template>
<!-- SMR20171014 set up key for grouping dataCite Subject element with the same subject scheme -->
    <xsl:key name="topic" match="//*[local-name()='subject']" use="@subjectScheme"/> 

    <!-- define variables for top level elements in DataCite xml to simplify xpaths... -->
    <xsl:variable name="datacite-identifier" select="//*[local-name() = 'identifier']"/>
    <xsl:variable name="datacite-titles" select="//*[local-name() = 'titles']"/>
    <xsl:variable name="datacite-alternateIDs" select="//*[local-name() = 'alternateIdentifiers']"/>
    <xsl:variable name="datacite-contributors" select="//*[local-name() = 'contributors']"/>
    <xsl:variable name="datacite-creators" select="//*[local-name() = 'creators']"/>
    <xsl:variable name="datacite-dates" select="//*[local-name() = 'dates']"/>
    <xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz'" />
    <xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" />

    <!-- these variables set content for gmd:metadataMaintenance element at the end of the record
		recommend using these to report on how this record was created and by who. -->
    <xsl:variable name="metaMaintenanceNote"
        select="
            string('This metadata record was generated by an xslt transformation from a DataCite metadata record; The transform was created by Damian Ulbricht and Stephen M. Richard. 2017-11-15 these records include new IEDA keywords for geoportal facets')"/>
    <xsl:variable name="maintenanceContactID"
        select="string('http://orcid.org/0000-0001-6041-5302')"/>
    <xsl:variable name="maintenanceContactName" select="string('metadata curator')"/>
    <xsl:variable name="maintenanceContactEmail" select="string('info@iedadata.org')"/>

    <xsl:variable name="currentDateTime">
        <xsl:value-of select="datetime:date-time()"/>
    </xsl:variable>
    <!-- end of configuration variables -->

    <!-- here we go..... -->
    <xsl:template match="/">
        <gmd:MD_Metadata xmlns:gmd="http://www.isotc211.org/2005/gmd"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gml="http://www.opengis.net/gml/3.2"
            xsi:schemaLocation="http://www.isotc211.org/2005/gmd http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/gmd/gmd.xsd">

            <!--  The fileIdentifier identifies the 
				metadata record, not the described resource which is identified by a DOI.
			-->

            <xsl:variable name="fileIdentifierPrefix" select="string('urn:ieda:')"/>
            <gmd:fileIdentifier>
                <gco:CharacterString>
                    <xsl:choose>
                        <xsl:when
                            test="string-length($datacite-identifier) &gt; 0 and count($datacite-identifier[@identifierType = 'DOI']) &gt; 0">
                            <xsl:value-of
                                select="concat($fileIdentifierPrefix, string('metadataabout:'), normalize-space(translate($datacite-identifier, '/:', '--')))"
                            />
                        </xsl:when>
                        <xsl:when
                            test="count($datacite-alternateIDs/*[local-name() = 'alternateIdentifier'][@alternateIdentifierType = 'IEDA submission_ID']) &gt; 0">
                            <xsl:value-of
                                select="
                                    concat($fileIdentifierPrefix, string('metadataabout:'),
                                    normalize-space(substring-after($datacite-alternateIDs/*[local-name() = 'alternateIdentifier'][@alternateIdentifierType = 'IEDA submission_ID']/text(), 'urn:')))"
                            />
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of
                                select="concat($fileIdentifierPrefix, string('metadata:'), normalize-space(translate($datacite-titles/*[local-name() = 'title'][1], '/: ,', '----')))"
                            />
                        </xsl:otherwise>
                    </xsl:choose>
                </gco:CharacterString>
            </gmd:fileIdentifier>

            <gmd:language>
                <gmd:LanguageCode codeList="http://www.loc.gov/standards/iso639-2/"
                    codeListValue="eng">eng</gmd:LanguageCode>
            </gmd:language>
            <gmd:characterSet>
                <gmd:MD_CharacterSetCode
                    codeList="http://www.isotc211.org/2005/resources/codeList.xml#MD_CharacterSetCode"
                    codeListValue="utf8"/>
            </gmd:characterSet>

            <!-- dataset is downcase -->
            <xsl:variable name="resourcetype">
                <xsl:value-of select="//*[local-name() = 'resourceType']/@resourceTypeGeneral"/>
            </xsl:variable>

            <xsl:variable name="MDScopecode">
                <xsl:choose>
                    <xsl:when test="$resourcetype = 'Dataset'">dataset</xsl:when>
                    <xsl:when test="$resourcetype = 'Software'">software</xsl:when>
                    <xsl:when test="$resourcetype = 'Service'">service</xsl:when>
                    <xsl:when test="$resourcetype = 'Model'">model</xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$resourcetype"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>

            <xsl:variable name="MDScopelist">
                <xsl:choose>
                    <xsl:when
                        test="$resourcetype = 'Dataset' or $resourcetype = 'Software' or $resourcetype = 'Service' or $resourcetype = 'Model'"
                        >http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ScopeCode</xsl:when>
                    <xsl:otherwise>http://datacite.org/schema/kernel-4</xsl:otherwise>
                </xsl:choose>
            </xsl:variable>

            <gmd:hierarchyLevel>
                <gmd:MD_ScopeCode>
                    <xsl:attribute name="codeList">
                        <xsl:value-of select="$MDScopelist"/>
                    </xsl:attribute>
                    <xsl:attribute name="codeListValue">
                        <xsl:value-of select="$MDScopecode"/>
                    </xsl:attribute>
                    <xsl:value-of select="$MDScopecode"/>
                </gmd:MD_ScopeCode>
            </gmd:hierarchyLevel>
            <gmd:hierarchyLevelName>
                <gco:CharacterString>
                    <xsl:value-of select="//*[local-name() = 'resourceType']"/>
                </gco:CharacterString>
            </gmd:hierarchyLevelName>

            <!-- The contact for the metadata - static value assigned in template at the top of this file; -->
            <xsl:call-template name="metadatacontact"/>

            <gmd:dateStamp>
                <xsl:variable name="theDate">
                    <xsl:choose>
                        <xsl:when test="$updateDate">
                            <xsl:value-of select="$updateDate"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="$currentDateTime"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:choose>
                    <xsl:when test="$theDate != ''">
                        <xsl:choose>
                            <xsl:when test="contains($theDate, 'T')">
                                <gco:DateTime>
                                    <xsl:value-of select="$theDate"/>
                                </gco:DateTime>
                            </xsl:when>
                            <xsl:when test="contains($theDate, ' ')">
                                <gco:DateTime>
                                    <xsl:value-of select="translate($theDate, ' ', 'T')"/>
                                </gco:DateTime>
                            </xsl:when>
                            <xsl:otherwise>
                                <gco:Date>
                                    <xsl:value-of select="$theDate"/>
                                </gco:Date>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:when>
                    <xsl:otherwise>
                        <!-- put something in, but flag as bogus -->
                        <gco:DateTime>
                            <xsl:value-of select="$currentDateTime"/>
                            <xsl:attribute name="gco:nilReason">
                                <xsl:value-of select="string('missing')"/>
                            </xsl:attribute>
                        </gco:DateTime>
                    </xsl:otherwise>
                </xsl:choose>
            </gmd:dateStamp>

            <gmd:metadataStandardName>
                <gco:CharacterString>ISO 19139 Geographic Information - Metadata - Implementation Specification</gco:CharacterString>
            </gmd:metadataStandardName>
            <gmd:metadataStandardVersion>
                <gco:CharacterString>2007</gco:CharacterString>
            </gmd:metadataStandardVersion>

            <!-- DataCite is WGS84; need to verify for IEDA usage-->
            <!--			<gmd:referenceSystemInfo>
				<gmd:MD_ReferenceSystem>
					<gmd:referenceSystemIdentifier>
						<gmd:RS_Identifier>
							<gmd:code>
								<gco:CharacterString>urn:ogc:def:crs:EPSG:4326</gco:CharacterString>
							</gmd:code>
						</gmd:RS_Identifier>
					</gmd:referenceSystemIdentifier>
				</gmd:MD_ReferenceSystem>
			</gmd:referenceSystemInfo>-->

            <gmd:identificationInfo>
                <gmd:MD_DataIdentification>
                    <gmd:citation>
                        <gmd:CI_Citation>
                            <gmd:title>
                                <gco:CharacterString>
                                    <xsl:for-each
                                        select="$datacite-titles/*[local-name() = 'title']">
                                        <xsl:choose>
                                            <xsl:when test="not(count(@titleType) &gt; 0)">
                                                <xsl:value-of select="."/>
                                            </xsl:when>
                                            <xsl:when
                                                test="string(@titleType) = 'Subtitle' and . != ''">
                                                <xsl:value-of select="concat('; Subtitle: ', .)"/>
                                            </xsl:when>
                                            <xsl:when
                                                test="string(@titleType) = 'TranslatedTitle' and . != ''">
                                                <xsl:value-of
                                                  select="concat('; Translated title: ', .)"/>
                                            </xsl:when>
                                            <xsl:when
                                                test="string(@titleType) = 'Other' and . != ''">
                                                <xsl:value-of select="concat('; Other title: ', .)"
                                                />
                                            </xsl:when>
                                        </xsl:choose>
                                    </xsl:for-each>
                                </gco:CharacterString>
                            </gmd:title>
                            <xsl:for-each select="$datacite-titles/*[local-name() = 'title']">
                                <xsl:if test="string(@titleType) = 'AlternativeTitle' and . != ''">
                                    <gmd:alternateTitle>
                                        <gco:CharacterString>
                                            <xsl:value-of select="string(.)"/>
                                        </gco:CharacterString>
                                    </gmd:alternateTitle>
                                </xsl:if>
                            </xsl:for-each>
                            <xsl:call-template name="resourcedates"/>
                            <gmd:identifier>
                                <gmd:MD_Identifier>
                                    <gmd:code>
                                        <gco:CharacterString>
                                            <xsl:choose>
                                                <xsl:when
                                                  test="starts-with($datacite-identifier, 'doi:') or contains($datacite-identifier, 'doi.org')">
                                                  <xsl:value-of select="$datacite-identifier"/>
                                                </xsl:when>
                                                <xsl:when
                                                  test="count($datacite-identifier[@identifierType = 'DOI']) &gt; 0"
                                                  > doi:<xsl:value-of select="$datacite-identifier"
                                                  />
                                                </xsl:when>
                                                <xsl:otherwise>
                                                  <xsl:value-of select="$datacite-identifier"/>
                                                </xsl:otherwise>
                                            </xsl:choose>
                                        </gco:CharacterString>
                                    </gmd:code>
                                </gmd:MD_Identifier>
                            </gmd:identifier>
                            <xsl:call-template name="creators"/>
                            <xsl:call-template name="contributors"/>
                            <gmd:citedResponsibleParty>
                                <xsl:call-template name="ci_responsibleparty">
                                    <xsl:with-param name="organisation">
                                        <xsl:value-of select=".//*[local-name() = 'publisher']"/>
                                    </xsl:with-param>
                                    <xsl:with-param name="role">publisher</xsl:with-param>
                                </xsl:call-template>
                            </gmd:citedResponsibleParty>
<!-- some ECL records have long lists of related publications; ideally these would be links thru related resources, but ...
                            Don't want these to be indexed with abstract, so put them here and check that they show up in the full record display-->
                            <xsl:if
                                test="//*[local-name() = 'description'][@descriptionType = 'Other'][contains(., 'Related publications:')]">
                                <gmd:otherCitationDetails>
                                    <gco:CharacterString>
                                        <xsl:for-each
                                            select="//*[local-name() = 'description'][@descriptionType = 'Other'][contains(., 'Related publications:')]">
                                            <xsl:value-of select="concat('  ', string(.))"/>
                                        </xsl:for-each>
                                    </gco:CharacterString>
                                </gmd:otherCitationDetails>
                            </xsl:if>
                        </gmd:CI_Citation>
                    </gmd:citation>
                    <gmd:abstract>
                        <gco:CharacterString>
                            <xsl:for-each select="//*[local-name() = 'description']">
                                <xsl:choose>
                                    <xsl:when test="@descriptionType = 'Abstract'">
                                        <xsl:value-of select="concat('Abstract: ', string(.))"/>
                                    </xsl:when>
                                    <xsl:when test="@descriptionType = 'SeriesInformation'">
                                        <xsl:text>
											
										</xsl:text>
                                        <xsl:value-of
                                            select="concat('Series Information: ', string(.))"/>
                                    </xsl:when>
                                    <xsl:when test="@descriptionType = 'TableOfContents'">
                                        <xsl:text>
											
										</xsl:text>
                                        <xsl:value-of
                                            select="concat('Table of Contents: ', string(.))"/>
                                    </xsl:when>
                                    <xsl:when test="@descriptionType = 'TechnicalInfo'">
                                        <xsl:text>
											
										</xsl:text>
                                        <xsl:value-of
                                            select="concat('Techical Information: ', string(.))"/>
                                    </xsl:when>
                                    <xsl:when test="@descriptionType = 'Other'">
                                        <xsl:if
                                            test="not(contains(string(.), 'Related publications:'))">
                                            <xsl:text>
											
										</xsl:text>
                                            <xsl:value-of
                                                select="concat('Other Description: ', string(.))"/>
                                        </xsl:if>
                                    </xsl:when>

                                </xsl:choose>
                            </xsl:for-each>
                        </gco:CharacterString>
                    </gmd:abstract>

                    <xsl:if test="count(//*[local-name() = 'fundingReferences']) &gt; 0">

                        <xsl:for-each
                            select="//*[local-name() = 'fundingReferences']/*[local-name() = 'fundingReference']">

                            <gmd:credit>
                                <gco:CharacterString>
                                    <xsl:value-of
                                        select="normalize-space(concat(string('funderName:'), string(*[local-name() = 'funderName'])))"/>
                                    <xsl:if
                                        test="count(*[local-name() = 'funderIdentifier']) &gt; 0">
                                        <xsl:text>
								</xsl:text>
                                        <xsl:value-of
                                            select="normalize-space(concat(string('funderIdentifier:'), string(*[local-name() = 'funderIdentifier'])))"/>
                                        <xsl:value-of
                                            select="normalize-space(concat(string('; IDType:'), string(*[local-name() = 'funderIdentifier']/@funderIdentifierType)))"
                                        />
                                    </xsl:if>
                                    <xsl:if test="count(*[local-name() = 'awardNumber']) &gt; 0">
                                        <xsl:text>
								</xsl:text>
                                        <xsl:value-of
                                            select="normalize-space(concat(string('awardNumber:'), string(*[local-name() = 'awardNumber'])))"
                                        />
                                    </xsl:if>
                                    <xsl:if test="count(*[local-name() = 'awardTitle']) &gt; 0">
                                        <xsl:text>
								</xsl:text>
                                        <xsl:value-of
                                            select="normalize-space(concat(string('awardTitle:'), string(*[local-name() = 'awardTitle'])))"
                                        />
                                    </xsl:if>
                                </gco:CharacterString>
                            </gmd:credit>
                        </xsl:for-each>

                    </xsl:if>
                    <gmd:status>
                        <gmd:MD_ProgressCode
                            codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ProgressCode"
                            codeListValue="Complete">Complete</gmd:MD_ProgressCode>
                    </gmd:status>

                    <xsl:call-template name="datasetcontact"/>
                    <xsl:call-template name="versionandformat"/>
                    <xsl:call-template name="freekeywords"/>
                    <xsl:call-template name="thesauruskeywords"/>
                    <xsl:call-template name="geolocationplace"/>
 <!-- insert data center keyword; this is configured at the beginning of this xslt -->                   
                    <gmd:descriptiveKeywords>
                        <gmd:MD_Keywords>
                            <gmd:keyword>
                                <gco:CharacterString>
                                    <xsl:value-of select="$datacentre"/>
                                </gco:CharacterString>
                            </gmd:keyword>
                            <gmd:type>
                                <gmd:MD_KeywordTypeCode
                                    codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode"
                                    codeListValue="dataCentre">Data Center</gmd:MD_KeywordTypeCode>
                            </gmd:type>
                        </gmd:MD_Keywords>
                    </gmd:descriptiveKeywords>
                    
                    
                    <xsl:call-template name="license"/>

                    <xsl:call-template name="relatedResources">
                        <xsl:with-param name="relres"
                            select="//*[local-name() = 'relatedIdentifiers']"/>
                        <!-- pass a set of related identifier nodes -->
                    </xsl:call-template>

                    <!-- assume english for now -->
                    <gmd:language>
                        <gco:CharacterString>eng</gco:CharacterString>
                    </gmd:language>

                    <!-- check namespace to determine what DataCite version we are in;
						the spatial coverage encoding is complete different for v.4 -->

                    <xsl:choose>
                        <xsl:when
                            test="string(namespace-uri(//*[local-name() = 'identifier'])) = 'http://datacite.org/schema/kernel-4'">
                            <xsl:call-template name="spatialcoverage"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:call-template name="spatialcoverage3"/>
                        </xsl:otherwise>
                    </xsl:choose>

                    <xsl:call-template name="temporalcoverage"/>

                </gmd:MD_DataIdentification>
            </gmd:identificationInfo>
            <gmd:distributionInfo>
                <gmd:MD_Distribution>
                    <gmd:transferOptions>
                        <gmd:MD_DigitalTransferOptions>
                            <xsl:call-template name="size"/>

                            <xsl:if
                                test="
                                    starts-with($datacite-identifier, 'doi:') or
                                    $datacite-identifier/@identifierType = 'DOI' or
                                    starts-with($datacite-identifier, 'http://')">
                                <gmd:onLine>
                                    <gmd:CI_OnlineResource>
                                        <gmd:linkage>
                                            <gmd:URL>
                                                <xsl:choose>
                                                  <xsl:when
                                                  test="starts-with($datacite-identifier, 'doi:')">
                                                  <xsl:value-of
                                                  select="concat('http://dx.doi.org/', substring-after($datacite-identifier, 'doi:'))"
                                                  />
                                                  </xsl:when>
                                                  <xsl:when
                                                  test="$datacite-identifier/@identifierType = 'DOI'">
                                                  <xsl:value-of
                                                  select="concat('http://dx.doi.org/', normalize-space($datacite-identifier))"
                                                  />
                                                  </xsl:when>
                                                  <xsl:when
                                                  test="starts-with($datacite-identifier, 'http://')">
                                                  <xsl:value-of select="$datacite-identifier"/>
                                                  </xsl:when>

                                                </xsl:choose>
                                            </gmd:URL>
                                        </gmd:linkage>
                                        <gmd:protocol>
                                            <gco:CharacterString>WWW:LINK-1.0-http--link</gco:CharacterString>
                                        </gmd:protocol>
                                        <gmd:name>
                                            <gco:CharacterString>Landing Page</gco:CharacterString>
                                        </gmd:name>
                                        <gmd:description>
                                            <gco:CharacterString>
                                                <xsl:value-of select="normalize-space(string('Link to DOI landing page or 
                                                    data facility landing page if no DOI is
                                                assigned.'))" />
                                            </gco:CharacterString>
                                        </gmd:description>
                                        <gmd:function>
                                            <gmd:CI_OnLineFunctionCode
                                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_OnLineFunctionCode"
                                                codeListValue="information"
                                                >information</gmd:CI_OnLineFunctionCode>
                                        </gmd:function>
                                    </gmd:CI_OnlineResource>
                                </gmd:onLine>
                            </xsl:if>
                            <xsl:for-each
                                select="//*[local-name() = 'alternateIdentifier'] ">
                                <xsl:if test=". != '' and starts-with(normalize-space(string(.)), 'http')">
                                    <gmd:onLine>
                                        <gmd:CI_OnlineResource>
                                            <gmd:linkage>
                                                <gmd:URL>
                                                  <xsl:value-of select="string(.)"/>
                                                </gmd:URL>
                                            </gmd:linkage>
                                            <gmd:protocol>
                                                <gco:CharacterString>WWW:LINK-1.0-http--link</gco:CharacterString>
                                            </gmd:protocol>
                                            <gmd:name>
                                                <gco:CharacterString>
                                                    <xsl:value-of select="normalize-space(string(@alternateIdentifierType))"/>
                                                </gco:CharacterString>
                                            </gmd:name>
                                            <gmd:description>
                                                <gco:CharacterString>Link to a web page related to the resource.</gco:CharacterString>
                                            </gmd:description>
                                            <gmd:function>
                                                <gmd:CI_OnLineFunctionCode
                                                  codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_OnLineFunctionCode"
                                                  codeListValue="information"
                                                  >information</gmd:CI_OnLineFunctionCode>
                                            </gmd:function>
                                        </gmd:CI_OnlineResource>
                                    </gmd:onLine>
                                </xsl:if>
                            </xsl:for-each>
                        </gmd:MD_DigitalTransferOptions>
                    </gmd:transferOptions>
                </gmd:MD_Distribution>
            </gmd:distributionInfo>


            <!-- put method descripiton in the lineage statement -->
            <xsl:if
                test="//*[local-name() = 'description' and @descriptionType = 'Methods' and normalize-space() != '']">
                <gmd:dataQualityInfo>
                    <gmd:DQ_DataQuality>
                        <gmd:scope gco:nilReason="missing"/>
                        <gmd:lineage>
                            <gmd:LI_Lineage>
                                <gmd:statement>
                                    <gco:CharacterString>
                                        <xsl:value-of
                                            select="//*[local-name() = 'description' and @descriptionType = 'Methods']"
                                        />
                                    </gco:CharacterString>
                                </gmd:statement>
                            </gmd:LI_Lineage>
                        </gmd:lineage>
                    </gmd:DQ_DataQuality>
                </gmd:dataQualityInfo>
            </xsl:if>
            <gmd:metadataMaintenance>
                <gmd:MD_MaintenanceInformation>
                    <gmd:maintenanceAndUpdateFrequency gco:nilReason="unknown"/>
                    <gmd:maintenanceNote>
                        <gco:CharacterString>
                            <xsl:value-of
                                select="concat(string($metaMaintenanceNote), string('  Run on '), string($currentDateTime))"
                            />
                        </gco:CharacterString>
                    </gmd:maintenanceNote>
                    <gmd:contact>
                        <xsl:if test="$maintenanceContactID != ''">
                            <xsl:attribute name="xlink:href">
                                <xsl:value-of select="$maintenanceContactID"/>
                            </xsl:attribute>
                        </xsl:if>
                        <gmd:CI_ResponsibleParty>
                            <gmd:individualName>
                                <gco:CharacterString>
                                    <xsl:value-of select="$maintenanceContactName"/>
                                </gco:CharacterString>
                            </gmd:individualName>
                            <gmd:contactInfo>
                                <gmd:CI_Contact>
                                    <gmd:address>
                                        <gmd:CI_Address>
                                            <gmd:electronicMailAddress>
                                                <gco:CharacterString>
                                                  <xsl:value-of select="$maintenanceContactEmail"/>
                                                </gco:CharacterString>
                                            </gmd:electronicMailAddress>
                                        </gmd:CI_Address>
                                    </gmd:address>
                                </gmd:CI_Contact>
                            </gmd:contactInfo>
                            <gmd:role>
                                <gmd:CI_RoleCode
                                    codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_RoleCode"
                                    codeListValue="processor">processor</gmd:CI_RoleCode>
                            </gmd:role>
                        </gmd:CI_ResponsibleParty>
                    </gmd:contact>

                </gmd:MD_MaintenanceInformation>
            </gmd:metadataMaintenance>
        </gmd:MD_Metadata>
    </xsl:template>

    <!-- retrieves basic reference dates of the resource
    Handles created date, publication (Available) date, and revision date-->
    <xsl:template name="resourcedates">
        <xsl:if test="$datacite-dates/*[local-name() = 'date' and @dateType = 'Created'] != ''">
            <gmd:date>
                <gmd:CI_Date>
                    <gmd:date>
                        <xsl:variable name="theDate"
                            select="normalize-space($datacite-dates/*[local-name() = 'date' and @dateType = 'Created'][1])"/>
                        <!-- ieda dataCite labels metadata update date in the date string to avoid ambiguity -->
                        <xsl:choose>
                            <xsl:when test="$theDate != ''">
                                <xsl:choose>
                                    <xsl:when test="contains($theDate, 'T')">
                                        <gco:DateTime>
                                            <xsl:value-of select="$theDate"/>
                                        </gco:DateTime>
                                    </xsl:when>
                                    <xsl:when test="contains($theDate, ' ')">
                                        <gco:DateTime>
                                            <xsl:value-of select="translate($theDate, ' ', 'T')"/>
                                        </gco:DateTime>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <gco:Date>
                                            <xsl:value-of select="$theDate"/>
                                        </gco:Date>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:attribute name="gco:nilReason">
                                    <xsl:value-of select="string('missing')"/>
                                </xsl:attribute>
                            </xsl:otherwise>
                        </xsl:choose>
                    </gmd:date>
                    <gmd:dateType>
                        <gmd:CI_DateTypeCode
                            codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_DateTypeCode"
                            codeListValue="creation">creation</gmd:CI_DateTypeCode>
                    </gmd:dateType>
                </gmd:CI_Date>
            </gmd:date>
        </xsl:if>
        
        <xsl:choose>
            <!-- Take 'Available' date first because that is YYYY-MM-DD -->
            <xsl:when test="$datacite-dates/*[local-name() = 'date' and @dateType = 'Available'] != ''">
                <gmd:date>
                    <gmd:CI_Date>
                        <gmd:date>
                            <gco:Date>
                                <xsl:value-of select="$datacite-dates/*[local-name() = 'date' and @dateType = 'Available'] "/>
                            </gco:Date>
                        </gmd:date>
                        <gmd:dateType>
                            <gmd:CI_DateTypeCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_DateTypeCode"
                                codeListValue="publication">publication</gmd:CI_DateTypeCode>
                        </gmd:dateType>
                    </gmd:CI_Date>
                </gmd:date>
            </xsl:when>
            <xsl:when test="string-length(//*[local-name() = 'publicationYear'])>0">
            <gmd:date>
            <gmd:CI_Date>
                <gmd:date>
                    <gco:Date>
                        <xsl:value-of select="string(//*[local-name() = 'publicationYear'])"/>
                    </gco:Date>
                </gmd:date>
                <gmd:dateType>
                    <gmd:CI_DateTypeCode
                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_DateTypeCode"
                        codeListValue="publication">publication</gmd:CI_DateTypeCode>
                </gmd:dateType>
            </gmd:CI_Date>
        </gmd:date>
        </xsl:when>
           <xsl:otherwise>
                <gmd:date gco:nilReason="missing"/>
            </xsl:otherwise>
        </xsl:choose>
        <!-- the following test is designed to filter out update-metadata dates if these follow the convention
        that metadata update date strings are prefixed with 'metadata'-->
        <xsl:if
            test="
                ($datacite-dates/*[local-name() = 'date' and @dateType = 'Updated'][1] != '')
                and not(starts-with($datacite-dates/*[local-name() = 'date' and @dateType = 'Updated'][1], 'metadata'))">
            <gmd:date>
                <gmd:CI_Date>
                    <gmd:date>
                        <xsl:variable name="theDate"
                            select="normalize-space($datacite-dates/*[local-name() = 'date' and @dateType = 'Updated'][1])"/>
                        <!-- ieda dataCite labels metadata update date in the date string to avoid ambiguity -->
                        <xsl:choose>
                            <xsl:when test="$theDate != ''">
                                <xsl:choose>
                                    <xsl:when test="contains($theDate, 'T')">
                                        <gco:DateTime>
                                            <xsl:value-of select="$theDate"/>
                                        </gco:DateTime>
                                    </xsl:when>
                                    <xsl:when test="contains($theDate, ' ')">
                                        <gco:DateTime>
                                            <xsl:value-of select="translate($theDate, ' ', 'T')"/>
                                        </gco:DateTime>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <gco:Date>
                                            <xsl:value-of select="$theDate"/>
                                        </gco:Date>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:attribute name="gco:nilReason">
                                    <xsl:value-of select="string('missing')"/>
                                </xsl:attribute>
                            </xsl:otherwise>
                        </xsl:choose>
                    </gmd:date>
                    <gmd:dateType>
                        <gmd:CI_DateTypeCode
                            codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_DateTypeCode"
                            codeListValue="revision">revision</gmd:CI_DateTypeCode>
                    </gmd:dateType>
                </gmd:CI_Date>
            </gmd:date>
        </xsl:if>
    </xsl:template>

    <!-- convert datacite authors -->
    <xsl:template name="creators">
        <xsl:variable name="datacite-creators" select="//*[local-name() = 'creators']"/>
        <xsl:for-each select="$datacite-creators/*[local-name() = 'creator']">
            <gmd:citedResponsibleParty>
                <xsl:variable name="httpuri">
                    <xsl:call-template name="gethttpuri">
                        <xsl:with-param name="theids" select="*[local-name() = 'nameIdentifier']"/>
                    </xsl:call-template>
                </xsl:variable>

                <xsl:variable name="nameidscheme">
                    <xsl:call-template name="getidscheme">
                        <xsl:with-param name="httpuri" select="$httpuri"/>
                    </xsl:call-template>
                </xsl:variable>

                <xsl:if test="$httpuri != ''">
                    <xsl:attribute name="xlink:href">
                        <xsl:value-of select="$httpuri"/>
                    </xsl:attribute>
                </xsl:if>

                <xsl:variable name="email">
                    <xsl:choose>
                        <xsl:when
                            test="*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')] != ''">
                            <xsl:choose>
                                <xsl:when
                                    test="starts-with(*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')], 'mailto')">
                                    <xsl:value-of
                                        select="substring-after(*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')], 'mailto:')"
                                    />
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of
                                        select="string(*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')])"
                                    />
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="string('')"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable name="namestring">
                    <xsl:choose>
                        <xsl:when test="normalize-space(*[local-name() = 'familyName']) != ''">
                            <xsl:value-of
                                select="
                                    concat(normalize-space(*[local-name() = 'familyName']),
                                    ', ', normalize-space(*[local-name() = 'givenName']))"
                            />
                        </xsl:when>
                        <xsl:when test="normalize-space(*[local-name() = 'creatorName']) != ''">
                            <xsl:value-of select="normalize-space(*[local-name() = 'creatorName'])"
                            />
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="string('missing')"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>

                <xsl:call-template name="ci_responsibleparty">
                    <xsl:with-param name="individual">
                        <xsl:value-of select="$namestring"/>
                    </xsl:with-param>
                    <xsl:with-param name="httpuri">
                        <xsl:value-of select="$httpuri"/>
                    </xsl:with-param>
                    <xsl:with-param name="personidtype">
                        <xsl:value-of select="$nameidscheme"/>
                    </xsl:with-param>
                    <xsl:with-param name="organisation">
                        <xsl:value-of select=".//*[local-name() = 'affiliation']"/>
                    </xsl:with-param>
                    <xsl:with-param name="position"/>
                    <xsl:with-param name="role">author</xsl:with-param>
                    <xsl:with-param name="email">
                        <xsl:value-of select="$email"/>
                    </xsl:with-param>
                </xsl:call-template>
            </gmd:citedResponsibleParty>
        </xsl:for-each>
    </xsl:template>

    <!-- convert DataCite contributors and try to translate the roles-->
    <xsl:template name="contributors">
        <xsl:for-each select="//*[local-name() = 'contributor']">
            <xsl:variable name="dcrole" select="normalize-space(./@contributorType)"/>
            <xsl:variable name="role">
                <xsl:choose>
                    <xsl:when test="$dcrole = 'ContactPerson'">pointOfContact</xsl:when>
                    <xsl:when test="$dcrole = 'DataCollector'">collaborator</xsl:when>
                    <xsl:when test="$dcrole = 'DataCurator'">custodian</xsl:when>
                    <xsl:when test="$dcrole = 'DataManager'">custodian</xsl:when>
                    <xsl:when test="$dcrole = 'Distributor'">originator</xsl:when>
                    <xsl:when test="$dcrole = 'Editor'">editor</xsl:when>
                    <xsl:when test="$dcrole = 'Funder'">funder</xsl:when>
                    <xsl:when test="$dcrole = 'HostingInstitution'">distributor</xsl:when>
                    <xsl:when test="$dcrole = 'ProjectLeader'">collaborator</xsl:when>
                    <xsl:when test="$dcrole = 'ProjectManager'">collaborator</xsl:when>
                    <xsl:when test="$dcrole = 'ProjectMember'">collaborator</xsl:when>
                    <xsl:when test="$dcrole = 'ResearchGroup'">collaborator</xsl:when>
                    <xsl:when test="$dcrole = 'Researcher'">collaborator</xsl:when>
                    <xsl:when test="$dcrole = 'RightsHolder'">rightsHolder</xsl:when>
                    <xsl:when test="$dcrole = 'Sponsor'">funder</xsl:when>
                    <xsl:when test="$dcrole = 'WorkPackageLeader'">collaborator</xsl:when>
                    <xsl:otherwise>contributor</xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <gmd:citedResponsibleParty>
                <xsl:variable name="httpuri">
                    <xsl:call-template name="gethttpuri">
                        <xsl:with-param name="theids" select="*[local-name() = 'nameIdentifier']"/>
                    </xsl:call-template>
                </xsl:variable>

                <xsl:variable name="nameidscheme">
                    <xsl:call-template name="getidscheme">
                        <xsl:with-param name="httpuri" select="$httpuri"/>
                    </xsl:call-template>
                 </xsl:variable>

                <xsl:if test="$httpuri != ''">
                    <xsl:attribute name="xlink:href">
                        <xsl:value-of select="$httpuri"/>
                    </xsl:attribute>
                </xsl:if>

                <xsl:variable name="email">
                    <xsl:choose>
                        <xsl:when
                            test="*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')][1] != ''">
                            <xsl:choose>
                                <xsl:when
                                    test="starts-with(*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')][1], 'mailto')">
                                    <xsl:value-of
                                        select="substring-after(*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')][1], 'mailto:')"
                                    />
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of
                                        select="string(*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')][1])"
                                    />
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="string('')"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>

                <xsl:variable name="contrnamestring">
                    <xsl:choose>
                        <xsl:when test="normalize-space(*[local-name() = 'familyName']) != ''">
                            <xsl:value-of
                                select="
                                    concat(normalize-space(*[local-name() = 'familyName']),
                                    ', ', normalize-space(*[local-name() = 'givenName']))"
                            />
                        </xsl:when>
                        <xsl:when test="normalize-space(*[local-name() = 'contributorName']) != ''">
                            <xsl:value-of
                                select="normalize-space(*[local-name() = 'contributorName'])"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="string('missing')"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>

                <xsl:call-template name="ci_responsibleparty">
                    <xsl:with-param name="individual">
                        <xsl:value-of select="$contrnamestring"/>
                    </xsl:with-param>
                    <xsl:with-param name="httpuri">
                        <xsl:value-of select="$httpuri"/>
                    </xsl:with-param>
                    <xsl:with-param name="personidtype">
                        <xsl:value-of select="$nameidscheme"/>
                    </xsl:with-param>
                    <xsl:with-param name="organisation">
                        <xsl:value-of select=".//*[local-name() = 'affiliation']"/>
                    </xsl:with-param>
                    <xsl:with-param name="position">
                        <xsl:value-of select="$dcrole"/>
                    </xsl:with-param>
                    <xsl:with-param name="email">
                        <xsl:value-of select="$email"/>
                    </xsl:with-param>
                    <xsl:with-param name="role" select="$role"/>
                </xsl:call-template>
            </gmd:citedResponsibleParty>
        </xsl:for-each>
    </xsl:template>


    <!-- retrieves a dataset contact and uses either the contributors with a 
		matching role "ContactPerson" or "DataCurator" or the first creator in the 'creators' sequence-->
    <xsl:template name="datasetcontact">
        <xsl:choose>
            <xsl:when
                test="
                    count($datacite-contributors) &gt; 0 and
                    $datacite-contributors/*[local-name() = 'contributor' and
                    (@contributorType = 'ContactPerson' or @contributorType = 'DataCurator') and normalize-space() != '']">
                <xsl:for-each
                    select="$datacite-contributors/*[local-name() = 'contributor' and (@contributorType = 'ContactPerson' or @contributorType = 'DataCurator')]">
                    <gmd:pointOfContact>
                        <xsl:variable name="httpuri">
                            <xsl:call-template name="gethttpuri">
                                <xsl:with-param name="theids"
                                    select="*[local-name() = 'nameIdentifier']"/>

                            </xsl:call-template>
                        </xsl:variable>

                        <xsl:variable name="nameidscheme">
                            <xsl:call-template name="getidscheme">
                                <xsl:with-param name="httpuri" select="$httpuri"/>
                            </xsl:call-template>
                        </xsl:variable>

                        <xsl:if test="$httpuri != ''">
                            <xsl:attribute name="xlink:href">
                                <xsl:value-of select="$httpuri"/>
                            </xsl:attribute>
                        </xsl:if>

                        <xsl:variable name="email">
                            <xsl:choose>
                                <xsl:when
                                    test="*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')][1] != ''">
                                    <xsl:choose>
                                        <xsl:when
                                            test="starts-with(*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')][1], 'mailto')">
                                            <xsl:value-of
                                                select="substring-after(*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')][1], 'mailto:')"
                                            />
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:value-of
                                                select="string(*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')][1])"
                                            />
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="string('')"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:variable>

                        <xsl:variable name="contrnamestring">
                            <xsl:choose>
                                <xsl:when
                                    test="normalize-space(*[local-name() = 'familyName']) != ''">
                                    <xsl:value-of
                                        select="
                                            concat(normalize-space(*[local-name() = 'familyName']),
                                            ', ', normalize-space(*[local-name() = 'givenName']))"
                                    />
                                </xsl:when>
                                <xsl:when
                                    test="normalize-space(*[local-name() = 'contributorName']) != ''">
                                    <xsl:value-of
                                        select="normalize-space(*[local-name() = 'contributorName'])"
                                    />
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="string('missing')"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:variable>


                        <xsl:call-template name="ci_responsibleparty">
                            <xsl:with-param name="individual">
                                <xsl:value-of select="$contrnamestring"/>
                            </xsl:with-param>
                            <xsl:with-param name="httpuri">
                                <xsl:value-of select="$httpuri"/>
                            </xsl:with-param>
                            <xsl:with-param name="personidtype">
                                <xsl:value-of select="$nameidscheme"/>
                            </xsl:with-param>
                            <xsl:with-param name="organisation">
                                <xsl:value-of select=".//*[local-name() = 'affiliation']"/>
                            </xsl:with-param>
                            <xsl:with-param name="position">
                                <xsl:value-of select="./@contributorType"/>
                            </xsl:with-param>
                            <xsl:with-param name="email">
                                <xsl:value-of select="$email"/>
                            </xsl:with-param>
                            <xsl:with-param name="role">pointOfContact</xsl:with-param>

                        </xsl:call-template>
                    </gmd:pointOfContact>
                </xsl:for-each>
            </xsl:when>
            <xsl:otherwise>
                <!-- the first creator -->
                <xsl:for-each select="$datacite-creators/child::*">
                    <xsl:if test="position() = 1">
                        <gmd:pointOfContact>
                            <xsl:variable name="httpuri">
                                <xsl:call-template name="gethttpuri">
                                    <xsl:with-param name="theids"
                                        select="*[local-name() = 'nameIdentifier']"/>

                                </xsl:call-template>
                            </xsl:variable>

                            <xsl:variable name="nameidscheme">
                                <xsl:call-template name="getidscheme">
                                    <xsl:with-param name="httpuri" select="$httpuri"/>
                                </xsl:call-template>
                            </xsl:variable>

                            <xsl:if test="$httpuri != ''">
                                <xsl:attribute name="xlink:href">
                                    <xsl:value-of select="$httpuri"/>
                                </xsl:attribute>
                            </xsl:if>

                            <xsl:variable name="email">
                                <xsl:choose>
                                    <xsl:when
                                        test="*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')][1] != ''">
                                        <xsl:choose>
                                            <xsl:when
                                                test="starts-with(*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')][1], 'mailto')">
                                                <xsl:value-of
                                                  select="substring-after(*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')][1], 'mailto:')"
                                                />
                                            </xsl:when>
                                            <xsl:otherwise>
                                                <xsl:value-of
                                                  select="string(*[local-name() = 'nameIdentifier' and (@nameIdentifierScheme = 'e-mail address')][1])"
                                                />
                                            </xsl:otherwise>
                                        </xsl:choose>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <xsl:value-of select="string('')"/>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </xsl:variable>

                            <xsl:variable name="namestring">
                                <xsl:choose>
                                    <xsl:when
                                        test="normalize-space(*[local-name() = 'familyName']) != ''">
                                        <xsl:value-of
                                            select="
                                                concat(normalize-space(*[local-name() = 'familyName']),
                                                ', ', normalize-space(*[local-name() = 'givenName']))"
                                        />
                                    </xsl:when>
                                    <xsl:when
                                        test="normalize-space(*[local-name() = 'contributorName']) != ''">
                                        <xsl:value-of
                                            select="normalize-space(*[local-name() = 'contributorName'])"
                                        />
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <xsl:value-of select="string('missing')"/>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </xsl:variable>


                            <xsl:call-template name="ci_responsibleparty">
                                <xsl:with-param name="individual">
                                    <xsl:value-of select="$namestring"/>
                                </xsl:with-param>
                                <xsl:with-param name="httpuri">
                                    <xsl:value-of select="$httpuri"/>
                                </xsl:with-param>
                                <xsl:with-param name="personidtype">
                                    <xsl:value-of select="$nameidscheme"/>
                                </xsl:with-param>
                                <xsl:with-param name="organisation">
                                    <xsl:value-of select=".//*[local-name() = 'affiliation']"/>
                                </xsl:with-param>
                                <xsl:with-param name="position"/>
                                <xsl:with-param name="role">pointOfContact</xsl:with-param>
                            </xsl:call-template>
                        </gmd:pointOfContact>
                    </xsl:if>
                </xsl:for-each>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- A helper function to serialize basic person/affiliation information.

There are several ways to model a person ID (https://geo-ide.noaa.gov/wiki/index.php?title=ISO_Researcher_ID).
All approaches are based on URLs - currently only ORCID seems to support URLs.

The ID of persons should also be put as "xlink:href" attribute into the parent element.

 -->
    <xsl:template name="ci_responsibleparty">
        <xsl:param name="individual"/>
        <xsl:param name="httpuri"/>
        <xsl:param name="personidtype"/>

        <xsl:param name="organisation"/>
        <xsl:param name="position"/>
        <xsl:param name="role"/>
        <xsl:param name="email"/>
        <gmd:CI_ResponsibleParty>
            <xsl:if test="$individual != ''">
                <gmd:individualName>
                    <gco:CharacterString>
                        <xsl:value-of select="$individual"/>
                    </gco:CharacterString>
                </gmd:individualName>
            </xsl:if>
            <xsl:if test="$organisation != ''">
                <gmd:organisationName>
                    <gco:CharacterString>
                        <xsl:value-of select="$organisation"/>
                    </gco:CharacterString>
                </gmd:organisationName>
            </xsl:if>
            <xsl:if test="$position != ''">
                <gmd:positionName>
                    <gco:CharacterString>
                        <xsl:value-of select="$position"/>
                    </gco:CharacterString>
                </gmd:positionName>
            </xsl:if>
            <gmd:contactInfo>
                <gmd:CI_Contact>
                    <!-- In the INSPIRE profile of the European Union the email is mandatory for contacts. 
							put in bogus null email-->
                    <gmd:address>
                        <gmd:CI_Address>
                            <gmd:electronicMailAddress>
                                <xsl:choose>
                                        <xsl:when test="$email != ''">
                                            <gco:CharacterString>
                                            <xsl:value-of select="$email"/>
                                            </gco:CharacterString>
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:attribute name="gco:nilReason">
                                                <xsl:value-of select="string('missing')"/>
                                            </xsl:attribute>
                                        </xsl:otherwise>
                                    </xsl:choose>
                            </gmd:electronicMailAddress>
                        </gmd:CI_Address>
                    </gmd:address>

                    <xsl:if test="$httpuri != ''">
                        <gmd:onlineResource>
                            <gmd:CI_OnlineResource>
                                <gmd:linkage>
                                    <gmd:URL>
                                        <xsl:value-of select="$httpuri"/>
                                    </gmd:URL>
                                </gmd:linkage>
                                <gmd:protocol>
                                    <gco:CharacterString>
                                        <xsl:value-of select="$personidtype"/>
                                    </gco:CharacterString>
                                </gmd:protocol>

                            </gmd:CI_OnlineResource>
                        </gmd:onlineResource>
                    </xsl:if>
                </gmd:CI_Contact>
            </gmd:contactInfo>
            <gmd:role>
                <gmd:CI_RoleCode>
                    <xsl:attribute name="codeList"
                        >http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_RoleCode</xsl:attribute>
                    <xsl:attribute name="codeListValue">
                        <xsl:value-of select="$role"/>
                    </xsl:attribute>
                    <xsl:value-of select="$role"/>
                </gmd:CI_RoleCode>
            </gmd:role>
        </gmd:CI_ResponsibleParty>
    </xsl:template>



    <!-- SMR version for v4: retrieves spatial coverage - currently only boxes/points/descriptions -->
    <xsl:template name="spatialcoverage">

            <gmd:extent>
                <gmd:EX_Extent>
                    
                    <xsl:if test="count(//*[local-name() = 'geoLocationPlace']) &gt; 0">
                        <gmd:description>
                            <gco:CharacterString>
                    <xsl:for-each select="//*[local-name() = 'geoLocationPlace']">
                        <xsl:if test="normalize-space(text()) != ''">
                             <xsl:value-of select="normalize-space(text())"/>
                            
                            <xsl:if test="following::*[local-name() = 'geoLocationPlace']">
                                <xsl:text>; </xsl:text>
                            </xsl:if>
                        </xsl:if>
                    </xsl:for-each>
                            </gco:CharacterString>
                        </gmd:description>
                    </xsl:if>
        <xsl:for-each select="//*[local-name() = 'geoLocations']/*[local-name() = 'geoLocation']">
                    
                    <xsl:if test="count(*[local-name() = 'geoLocationPoint']) &gt; 0">
                        <xsl:variable name="thepoint" select="*[local-name() = 'geoLocationPoint']"/>

                        <xsl:variable name="pointLat">
                            <xsl:choose>
                                <xsl:when
                                    test="
                                        count($thepoint/*[local-name() = 'pointLatitude']) &gt; 0 and
                                        string($thepoint/*[local-name() = 'pointLatitude']) != ''">
                                    <xsl:value-of
                                        select="number($thepoint/*[local-name() = 'pointLatitude'])"
                                    />
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="''"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:variable>
                        <xsl:variable name="pointLong">
                            <xsl:choose>
                                <xsl:when
                                    test="
                                        count($thepoint/*[local-name() = 'pointLongitude']) &gt; 0 and
                                        string($thepoint/*[local-name() = 'pointLongitude']) != ''">
                                    <xsl:value-of
                                        select="number($thepoint/*[local-name() = 'pointLongitude'])"
                                    />
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="''"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:variable>
                        <xsl:if test="$pointLat != '' and $pointLong != ''">
                            <gmd:geographicElement>
                                <gmd:EX_BoundingPolygon>
                                    <gmd:polygon>
                                        <gml:Point>
                                            <!-- generate a unique id of the source xml node -->
                                            <xsl:attribute name="gml:id">
                                                <xsl:value-of select="generate-id(.)"/>
                                            </xsl:attribute>
                                            <gml:pos>
                                                <xsl:value-of select="$pointLat"/>
                                                <xsl:text> </xsl:text>
                                                <xsl:value-of select="$pointLong"/>
                                            </gml:pos>
                                        </gml:Point>
                                    </gmd:polygon>
                                </gmd:EX_BoundingPolygon>
                            </gmd:geographicElement>
                        </xsl:if>
                    </xsl:if>

                    <xsl:if test="count(*[local-name() = 'geoLocationBox']) &gt; 0">
                        <xsl:variable name="thebox" select="*[local-name() = 'geoLocationBox']"/>

                        <xsl:variable name="sLat">
                            <xsl:choose>
                                <xsl:when
                                    test="
                                        count($thebox/*[local-name() = 'southBoundLatitude']) &gt; 0 and
                                        string($thebox/*[local-name() = 'southBoundLatitude']) != ''">
                                    <xsl:value-of
                                        select="number($thebox/*[local-name() = 'southBoundLatitude'])"
                                    />
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="''"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:variable>
                        <xsl:variable name="wLong">
                            <xsl:choose>
                                <xsl:when
                                    test="
                                        count($thebox/*[local-name() = 'westBoundLongitude']) &gt; 0 and
                                        string($thebox/*[local-name() = 'westBoundLongitude']) != ''">
                                    <xsl:choose>
                                        <xsl:when test="(number($thebox/*[local-name() = 'westBoundLongitude']) &lt; -180)">
                                            <xsl:value-of
                                                select="number($thebox/*[local-name() = 'westBoundLongitude'])+360"
                                            />
                                        </xsl:when>
                                        <xsl:when test="(number($thebox/*[local-name() = 'westBoundLongitude']) &gt; 180)">
                                            <xsl:value-of
                                                select="number($thebox/*[local-name() = 'westBoundLongitude'])-360"
                                            />
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:value-of
                                                select="number($thebox/*[local-name() = 'westBoundLongitude'])"
                                            />
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="''"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:variable>
                        <xsl:variable name="nLat">
                            <xsl:choose>
                                <xsl:when
                                    test="
                                        count($thebox/*[local-name() = 'northBoundLatitude']) &gt; 0 and
                                        string($thebox/*[local-name() = 'northBoundLatitude']) != ''">
                                    <xsl:value-of
                                        select="number($thebox/*[local-name() = 'northBoundLatitude'])"
                                    />
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="''"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:variable>
                        <xsl:variable name="eLong">
                            <xsl:choose>
                                <xsl:when
                                    test="
                                        count($thebox/*[local-name() = 'eastBoundLongitude']) &gt; 0 and
                                        string($thebox/*[local-name() = 'eastBoundLongitude']) != ''">
                                    <xsl:choose>
                                        <xsl:when test="(number($thebox/*[local-name() = 'eastBoundLongitude']) &lt; -180)">
                                            <xsl:value-of
                                                select="number($thebox/*[local-name() = 'eastBoundLongitude'])+360"
                                            />
                                        </xsl:when>
                                        <xsl:when test="(number($thebox/*[local-name() = 'eastBoundLongitude']) &gt; 180)">
                                            <xsl:value-of
                                                select="number($thebox/*[local-name() = 'eastBoundLongitude'])-360"
                                            />
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:value-of
                                                select="number($thebox/*[local-name() = 'eastBoundLongitude'])"
                                            />
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="''"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:variable>
                        <xsl:if
                            test="
                                string(number($nLat)) != 'NaN' and string(number($wLong)) != 'NaN' and
                                string(number($sLat)) != 'NaN' and string(number($eLong)) != 'NaN'">
                            <xsl:choose>
                                <!-- check for degenerate bbox -->
                                <xsl:when test="$nLat = $sLat and $eLong = $wLong">
                                    <gmd:geographicElement>
                                        <gmd:EX_BoundingPolygon>
                                            <gmd:polygon>
                                                <gml:Point>
                                                  <!-- generate a unique id of the source xml node -->
                                                  <xsl:attribute name="gml:id">
                                                  <xsl:value-of select="generate-id(.)"/>
                                                  </xsl:attribute>
                                                  <gml:pos>
                                                  <xsl:value-of select="$sLat"/>
                                                  <xsl:text> </xsl:text>
                                                  <xsl:value-of select="$wLong"/>
                                                  </gml:pos>
                                                </gml:Point>
                                            </gmd:polygon>
                                        </gmd:EX_BoundingPolygon>
                                    </gmd:geographicElement>
                                </xsl:when>
<!-- check to see if box crosses 180 with west side either in east long (positive) or <-180, or east side  
                            >180. If so, create two bounding box geographicElements-->
                                <xsl:when test="($wLong &gt;0 and $eLong &lt;0)">
                              <!-- use east longitude coordinates -->
                                    <gmd:geographicElement>
                                        <gmd:EX_GeographicBoundingBox>
                                            <gmd:westBoundLongitude>
                                                <gco:Decimal>
                                                    <xsl:value-of select="$wLong"/>
                                                </gco:Decimal>
                                            </gmd:westBoundLongitude>
                                            <gmd:eastBoundLongitude>
                                                <gco:Decimal>
                                                     <xsl:value-of select="180"/>
                                                </gco:Decimal>
                                            </gmd:eastBoundLongitude>
                                            <gmd:southBoundLatitude>
                                                <gco:Decimal>
                                                    <xsl:choose>
                                                        <xsl:when test="number($sLat) &lt; number($nLat)">
                                                            <xsl:value-of select="$sLat"/>
                                                        </xsl:when>
                                                        <xsl:otherwise>
                                                            <xsl:value-of select="$nLat"/>
                                                        </xsl:otherwise>
                                                    </xsl:choose>
                                                </gco:Decimal>
                                            </gmd:southBoundLatitude>
                                            <gmd:northBoundLatitude>
                                                <gco:Decimal>
                                                    <xsl:choose>
                                                        <xsl:when test="number($sLat) &lt; number($nLat)">
                                                            <xsl:value-of select="$nLat"/>
                                                        </xsl:when>
                                                        <xsl:otherwise>
                                                            <xsl:value-of select="$sLat"/>
                                                        </xsl:otherwise>
                                                    </xsl:choose>
                                                </gco:Decimal>
                                            </gmd:northBoundLatitude>
                                        </gmd:EX_GeographicBoundingBox>
                                    </gmd:geographicElement>
                                    <gmd:geographicElement>
                                        <gmd:EX_GeographicBoundingBox>
                                            <gmd:westBoundLongitude>
                                                <gco:Decimal>
                                                    <xsl:value-of select="-180"/>
                                                </gco:Decimal>
                                            </gmd:westBoundLongitude>
                                            <gmd:eastBoundLongitude>
                                                <gco:Decimal>
                                                    <xsl:value-of select="$eLong"/>
                                                </gco:Decimal>
                                            </gmd:eastBoundLongitude>
                                            <gmd:southBoundLatitude>
                                                <gco:Decimal>
                                                    <xsl:choose>
                                                        <xsl:when test="number($sLat) &lt; number($nLat)">
                                                            <xsl:value-of select="$sLat"/>
                                                        </xsl:when>
                                                        <xsl:otherwise>
                                                            <xsl:value-of select="$nLat"/>
                                                        </xsl:otherwise>
                                                    </xsl:choose>
                                                </gco:Decimal>
                                            </gmd:southBoundLatitude>
                                            <gmd:northBoundLatitude>
                                                <gco:Decimal>
                                                    <xsl:choose>
                                                        <xsl:when test="number($sLat) &lt; number($nLat)">
                                                            <xsl:value-of select="$nLat"/>
                                                        </xsl:when>
                                                        <xsl:otherwise>
                                                            <xsl:value-of select="$sLat"/>
                                                        </xsl:otherwise>
                                                    </xsl:choose>
                                                </gco:Decimal>
                                            </gmd:northBoundLatitude>
                                        </gmd:EX_GeographicBoundingBox>
                                    </gmd:geographicElement>
                               </xsl:when>
                                <xsl:otherwise>
                                    <gmd:geographicElement>
                                        <gmd:EX_GeographicBoundingBox>
                                            <gmd:westBoundLongitude>
                                                <gco:Decimal>
                                                  <!--<xsl:choose>
                                                  <xsl:when
                                                  test="number($wLong) &lt; number($eLong)">-->
                                                  <xsl:value-of select="$wLong"/>
                                                  <!--</xsl:when>
                                                  <xsl:otherwise>
                                                  <xsl:value-of select="$eLong"/>
                                                  </xsl:otherwise>
                                                  </xsl:choose>-->
                                                </gco:Decimal>
                                            </gmd:westBoundLongitude>
                                            <gmd:eastBoundLongitude>
                                                <gco:Decimal>
                                                  <!--<xsl:choose>
                                                  <xsl:when
                                                  test="number($wLong) &lt; number($eLong)">-->
                                                  <xsl:value-of select="$eLong"/>
                                                  <!--</xsl:when>
                                                  <xsl:otherwise>
                                                  <xsl:value-of select="$wLong"/>
                                                  </xsl:otherwise>
                                                  </xsl:choose>-->
                                                </gco:Decimal>
                                            </gmd:eastBoundLongitude>
                                            <gmd:southBoundLatitude>
                                                <gco:Decimal>
                                                  <xsl:choose>
                                                  <xsl:when test="number($sLat) &lt; number($nLat)">
                                                  <xsl:value-of select="$sLat"/>
                                                  </xsl:when>
                                                  <xsl:otherwise>
                                                  <xsl:value-of select="$nLat"/>
                                                  </xsl:otherwise>
                                                  </xsl:choose>
                                                </gco:Decimal>
                                            </gmd:southBoundLatitude>
                                            <gmd:northBoundLatitude>
                                                <gco:Decimal>
                                                  <xsl:choose>
                                                  <xsl:when test="number($sLat) &lt; number($nLat)">
                                                  <xsl:value-of select="$nLat"/>
                                                  </xsl:when>
                                                  <xsl:otherwise>
                                                  <xsl:value-of select="$sLat"/>
                                                  </xsl:otherwise>
                                                  </xsl:choose>
                                                </gco:Decimal>
                                            </gmd:northBoundLatitude>
                                        </gmd:EX_GeographicBoundingBox>
                                    </gmd:geographicElement>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:if>
                    </xsl:if>
        </xsl:for-each>
                </gmd:EX_Extent>
            </gmd:extent>

    </xsl:template>

    <!-- Damian Ulbricht for DataCite pre v4: retrieves spatial coverage - 
		 only boxes/points/descriptions  -->
    <xsl:template name="spatialcoverage3">
        <xsl:for-each select="//*[local-name() = 'geoLocations']/*[local-name() = 'geoLocation']">
            <xsl:variable name="description"
                select=".//*[local-name() = 'geoLocationPlace' and normalize-space(.) != '']"/>
            <xsl:variable name="minlat">
                <xsl:choose>
                    <xsl:when
                        test=".//*[local-name() = 'geoLocationPoint' and normalize-space(.) != '']">
                        <xsl:value-of
                            select="substring-before(.//*[local-name() = 'geoLocationPoint' and normalize-space(.) != ''], ' ')"
                        />
                    </xsl:when>
                    <xsl:when
                        test=".//*[local-name() = 'geoLocationBox' and normalize-space(.) != '']">
                        <xsl:value-of
                            select="substring-before(.//*[local-name() = 'geoLocationBox' and normalize-space(.) != ''], ' ')"
                        />
                    </xsl:when>
                </xsl:choose>
            </xsl:variable>
            <xsl:variable name="maxlat">
                <xsl:choose>
                    <xsl:when
                        test=".//*[local-name() = 'geoLocationPoint' and normalize-space(.) != '']">
                        <xsl:value-of
                            select="substring-before(.//*[local-name() = 'geoLocationPoint' and normalize-space(.) != ''], ' ')"
                        />
                    </xsl:when>
                    <xsl:when
                        test=".//*[local-name() = 'geoLocationBox' and normalize-space(.) != '']">
                        <xsl:value-of
                            select="substring-before(substring-after(substring-after(.//*[local-name() = 'geoLocationBox' and normalize-space(.) != ''], ' '), ' '), ' ')"
                        />
                    </xsl:when>
                </xsl:choose>
            </xsl:variable>
            <xsl:variable name="minlon">
                <xsl:choose>
                    <xsl:when
                        test=".//*[local-name() = 'geoLocationPoint' and normalize-space(.) != '']">
                        <xsl:value-of
                            select="substring-after(.//*[local-name() = 'geoLocationPoint' and normalize-space(.) != ''], ' ')"
                        />
                    </xsl:when>
                    <xsl:when
                        test=".//*[local-name() = 'geoLocationBox' and normalize-space(.) != '']">
                        <xsl:value-of
                            select="substring-before(substring-after(.//*[local-name() = 'geoLocationBox' and normalize-space(.) != ''], ' '), ' ')"
                        />
                    </xsl:when>
                </xsl:choose>
            </xsl:variable>
            <xsl:variable name="maxlon">
                <xsl:choose>
                    <xsl:when
                        test=".//*[local-name() = 'geoLocationPoint' and normalize-space(.) != '']">
                        <xsl:value-of
                            select="substring-after(.//*[local-name() = 'geoLocationPoint' and normalize-space(.) != ''], ' ')"
                        />
                    </xsl:when>
                    <xsl:when
                        test=".//*[local-name() = 'geoLocationBox' and normalize-space(.) != '']">
                        <xsl:value-of
                            select="substring-after(substring-after(substring-after(.//*[local-name() = 'geoLocationBox' and normalize-space(.) != ''], ' '), ' '), ' ')"
                        />
                    </xsl:when>
                </xsl:choose>
            </xsl:variable>
            <gmd:extent>
                <gmd:EX_Extent>
                    <xsl:if test="normalize-space($description)">
                        <gmd:description>
                            <gco:CharacterString>
                                <xsl:value-of select="normalize-space($description)"/>
                            </gco:CharacterString>
                        </gmd:description>
                    </xsl:if>
                    <xsl:choose>
                        <xsl:when test="$minlat = $maxlat and $minlon = $maxlon">
                            <gmd:geographicElement>
                                <gmd:EX_BoundingPolygon>
                                    <gmd:polygon>
                                        <gml:Point>
                                            <!-- generate a unique id of the source xml node -->
                                            <xsl:attribute name="gml:id">
                                                <xsl:value-of select="generate-id(.)"/>
                                            </xsl:attribute>
                                            <gml:pos>
                                                <xsl:value-of select="$minlat"/>
                                                <xsl:text> </xsl:text>
                                                <xsl:value-of select="$minlon"/>
                                            </gml:pos>
                                        </gml:Point>
                                    </gmd:polygon>
                                </gmd:EX_BoundingPolygon>
                            </gmd:geographicElement>
                        </xsl:when>
                        <xsl:otherwise>
                            <gmd:geographicElement>
                                <gmd:EX_GeographicBoundingBox>
                                    <gmd:westBoundLongitude>
                                        <gco:Decimal>
                                            <xsl:value-of select="$minlon"/>
                                        </gco:Decimal>
                                    </gmd:westBoundLongitude>
                                    <gmd:eastBoundLongitude>
                                        <gco:Decimal>
                                            <xsl:value-of select="$maxlon"/>
                                        </gco:Decimal>
                                    </gmd:eastBoundLongitude>
                                    <gmd:southBoundLatitude>
                                        <gco:Decimal>
                                            <xsl:value-of select="$minlat"/>
                                        </gco:Decimal>
                                    </gmd:southBoundLatitude>
                                    <gmd:northBoundLatitude>
                                        <gco:Decimal>
                                            <xsl:value-of select="$maxlat"/>
                                        </gco:Decimal>
                                    </gmd:northBoundLatitude>
                                </gmd:EX_GeographicBoundingBox>
                            </gmd:geographicElement>
                        </xsl:otherwise>
                    </xsl:choose>
                </gmd:EX_Extent>
            </gmd:extent>
        </xsl:for-each>
    </xsl:template>


    <!-- retrieves the temporal coverage from the data@Collected element-->
    <xsl:template name="temporalcoverage">
        <xsl:for-each
            select="//*[local-name() = 'date' and @dateType = 'Collected' and normalize-space(.) != '']">
            <gmd:extent>
                <gmd:EX_Extent>
                    <xsl:variable name="mindate" select="normalize-space(substring-before(., '/'))"/>
                    <xsl:variable name="maxdate" select="normalize-space(substring-after(., '/'))"/>
                    <gmd:temporalElement>
                        <gmd:EX_TemporalExtent>
                            <gmd:extent>
                                <xsl:choose>
                                    <xsl:when
                                        test="contains(., '/') and $mindate != '' and $maxdate != ''">
                                        <gml:TimePeriod>
                                            <xsl:attribute name="gml:id">
                                                <xsl:value-of select="generate-id(.)"/>
                                            </xsl:attribute>
                                            <gml:beginPosition>
                                                <xsl:value-of select="$mindate"/>
                                            </gml:beginPosition>
                                            <gml:endPosition>
                                                <xsl:value-of select="$maxdate"/>
                                            </gml:endPosition>
                                        </gml:TimePeriod>
                                    </xsl:when>
                                    <xsl:when
                                        test="contains(., '/') and $mindate != '' and $maxdate = ''">
                                        <gml:TimePeriod>
                                            <xsl:attribute name="gml:id">
                                                <xsl:value-of select="generate-id(.)"/>
                                            </xsl:attribute>
                                            <gml:beginPosition>
                                                <xsl:value-of select="$mindate"/>
                                            </gml:beginPosition>
                                            <gml:endPosition indeterminatePosition="unknown"/>
                                        </gml:TimePeriod>
                                    </xsl:when>
                                    <xsl:when
                                        test="contains(., '/') and $mindate = '' and $maxdate != ''">
                                        <gml:TimePeriod>
                                            <xsl:attribute name="gml:id">
                                                <xsl:value-of select="generate-id(.)"/>
                                            </xsl:attribute>
                                            <gml:beginPosition indeterminatePosition="unknown"/>
                                            <gml:endPosition>
                                                <xsl:value-of select="$mindate"/>
                                            </gml:endPosition>
                                        </gml:TimePeriod>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <gml:TimeInstant>
                                            <!-- generate a unique id of the source xml node -->
                                            <xsl:attribute name="gml:id">
                                                <xsl:value-of select="generate-id(.)"/>
                                            </xsl:attribute>
                                            <gml:timePosition>
                                                <xsl:value-of select="normalize-space(.)"/>
                                            </gml:timePosition>
                                        </gml:TimeInstant>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </gmd:extent>
                        </gmd:EX_TemporalExtent>
                    </gmd:temporalElement>
                </gmd:EX_Extent>
            </gmd:extent>
        </xsl:for-each>
    </xsl:template>

    <!-- retrieves non-thesaurus keywords -->
    <xsl:template name="freekeywords">
        <xsl:if test="//*[local-name() = 'subject' and normalize-space(@subjectScheme) = '']">
            <gmd:descriptiveKeywords>
                <gmd:MD_Keywords>
                    <xsl:for-each
                        select="//*[local-name() = 'subject' and normalize-space(@subjectScheme) = '']">
                        <gmd:keyword>
                            <gco:CharacterString>
                                <xsl:value-of select="normalize-space(.)"/>
                            </gco:CharacterString>
                        </gmd:keyword>
                    </xsl:for-each>
                </gmd:MD_Keywords>
            </gmd:descriptiveKeywords>
        </xsl:if>

    </xsl:template>

    <!-- retrieves keywords that have a subject scheme - group by subjectScheme -->
    <xsl:template name="thesauruskeywords">
        <xsl:variable name="IEDAthesaurus" select="string('IEDA integrated catalog keyword vocabulary')"/>
        <xsl:for-each select="//*[local-name()='subject']">       
            <xsl:if test="generate-id(.) = generate-id(key('topic',string(@subjectScheme))[1])">
                <xsl:variable name="theScheme" select="string(@subjectScheme)"/>
                <gmd:descriptiveKeywords>
                    <gmd:MD_Keywords>
                        <!--<xsl:variable name="keywordGroup" select="key('topic',$theScheme)"/>-->
                        <xsl:for-each select="//*[local-name() = 'subject'][@subjectScheme=$theScheme]">
                            <gmd:keyword>
                                <gco:CharacterString>
                                    <xsl:value-of select="normalize-space(.)"/>
                                </gco:CharacterString>
                            </gmd:keyword>
                        </xsl:for-each>
                        <xsl:choose>
                            <xsl:when
                                test="translate($theScheme, $uppercase, $smallcase) = 'place' 
                                or contains(translate($theScheme, $uppercase, $smallcase), 'geograph') 
                                or contains(translate($theScheme, $uppercase, $smallcase), 'location')">
                                <gmd:type>
                                    <gmd:MD_KeywordTypeCode
                                        codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode"
                                        codeListValue="place">place</gmd:MD_KeywordTypeCode>
                                </gmd:type>
                            </xsl:when>
                            <xsl:when
                                test="translate($theScheme, $uppercase, $smallcase) = 'ieda topic' ">
                                <gmd:type>
                                    <gmd:MD_KeywordTypeCode
                                        codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode"
                                        codeListValue="theme">IEDA topic</gmd:MD_KeywordTypeCode>
                                </gmd:type>
                                <gmd:thesaurusName>
                                    <gmd:CI_Citation>
                                        <gmd:title>
                                            <gco:CharacterString>
                                                <xsl:value-of select="$IEDAthesaurus"/>
                                            </gco:CharacterString>
                                        </gmd:title>
                                        <gmd:date>
                                            <gmd:CI_Date>
                                                <gmd:date>
                                                    <gco:Date>2017-10-11</gco:Date>
                                                </gmd:date>
                                                <gmd:dateType>
                                                    <gmd:CI_DateTypeCode codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_DateTypeCode" codeListValue="creation">creation</gmd:CI_DateTypeCode>
                                                </gmd:dateType>
                                            </gmd:CI_Date>
                                        </gmd:date>
                                    </gmd:CI_Citation>
                                </gmd:thesaurusName>
                            </xsl:when>
                            <xsl:when
                                test="translate($theScheme, $uppercase, $smallcase) = 'ieda feature of interest' ">
                                <gmd:type>
                                    <gmd:MD_KeywordTypeCode
                                        codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode"
                                        codeListValue="theme">IEDA feature of interest</gmd:MD_KeywordTypeCode>
                                </gmd:type>
                                <gmd:thesaurusName>
                                    <gmd:CI_Citation>
                                        <gmd:title>
                                            <gco:CharacterString>
                                                <xsl:value-of select="$IEDAthesaurus"/>
                                            </gco:CharacterString>
                                        </gmd:title>
                                        <gmd:date>
                                            <gmd:CI_Date>
                                                <gmd:date>
                                                    <gco:Date>2017-10-11</gco:Date>
                                                </gmd:date>
                                                <gmd:dateType>
                                                    <gmd:CI_DateTypeCode codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_DateTypeCode" codeListValue="creation">creation</gmd:CI_DateTypeCode>
                                                </gmd:dateType>
                                            </gmd:CI_Date>
                                        </gmd:date>
                                    </gmd:CI_Citation>
                                </gmd:thesaurusName>
                            </xsl:when>
                            <xsl:when
                                test="contains(translate($theScheme, $uppercase, $smallcase),'ieda data type')">
                                <gmd:type>
                                    <gmd:MD_KeywordTypeCode
                                        codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode"
                                        codeListValue="theme">IEDA data type categories</gmd:MD_KeywordTypeCode>
                                </gmd:type>
                                <gmd:thesaurusName>
                                    <gmd:CI_Citation>
                                        <gmd:title>
                                            <gco:CharacterString>
                                                <xsl:value-of select="$IEDAthesaurus"/>
                                            </gco:CharacterString>
                                        </gmd:title>
                                        <gmd:date>
                                            <gmd:CI_Date>
                                                <gmd:date>
                                                    <gco:Date>2017-10-11</gco:Date>
                                                </gmd:date>
                                                <gmd:dateType>
                                                    <gmd:CI_DateTypeCode codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_DateTypeCode" codeListValue="creation">creation</gmd:CI_DateTypeCode>
                                                </gmd:dateType>
                                            </gmd:CI_Date>
                                        </gmd:date>
                                    </gmd:CI_Citation>
                                </gmd:thesaurusName>
                            </xsl:when>
                            <xsl:when
                                test="translate($theScheme, $uppercase, $smallcase) = 'instrument' 
                                or translate($theScheme, $uppercase, $smallcase)= 'sensor'">
                                <gmd:type>
                                    <gmd:MD_KeywordTypeCode
                                        codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode"
                                        codeListValue="instrument"><xsl:value-of select="$theScheme"/></gmd:MD_KeywordTypeCode>
                                </gmd:type>
                            </xsl:when>
                            <xsl:when
                                test="translate($theScheme, $uppercase, $smallcase) = 'initiative' 
                                or translate($theScheme, $uppercase, $smallcase)= 'project'
                                or translate($theScheme, $uppercase, $smallcase)= 'program'
                                or translate($theScheme, $uppercase, $smallcase)= 'cruise'">
                                <gmd:type>
                                    <gmd:MD_KeywordTypeCode
                                        codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode"
                                        codeListValue="project"><xsl:value-of select="$theScheme"/></gmd:MD_KeywordTypeCode>
                                </gmd:type>
                            </xsl:when>
                            <xsl:when
                                test="translate($theScheme, $uppercase, $smallcase) = 'platform' 
                                or translate($theScheme, $uppercase, $smallcase)= 'facility'">
                                <gmd:type>
                                    <gmd:MD_KeywordTypeCode
                                        codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode"
                                        codeListValue="platform"><xsl:value-of select="$theScheme"/></gmd:MD_KeywordTypeCode>
                                </gmd:type>
                            </xsl:when>
                            <xsl:otherwise>
                                <gmd:type>
                                    <gmd:MD_KeywordTypeCode
                                        codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode"
                                        codeListValue="theme"><xsl:value-of select="$theScheme"/></gmd:MD_KeywordTypeCode>
                                </gmd:type>
                            </xsl:otherwise>
                        </xsl:choose>
                        
                    </gmd:MD_Keywords>
                </gmd:descriptiveKeywords>
            </xsl:if>
        </xsl:for-each>

    </xsl:template>

    <xsl:template name="geolocationplace">
        <xsl:if test="//*[local-name() = 'geoLocations']//*[local-name() = 'geoLocationPlace']">   
            <gmd:descriptiveKeywords>
                <gmd:MD_Keywords>
                    <xsl:for-each select="//*[local-name() = 'geoLocations']//*[local-name() = 'geoLocationPlace']">
                        <xsl:if test="normalize-space(./text()) != ''">
                        <gmd:keyword>
                            <gco:CharacterString>
                                <xsl:value-of select="normalize-space(.)"/>
                            </gco:CharacterString>
                        </gmd:keyword>
                        </xsl:if>
                    </xsl:for-each>
                    
                    <gmd:type>
                        <gmd:MD_KeywordTypeCode
                            codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode"
                            codeListValue="place">place</gmd:MD_KeywordTypeCode>
                    </gmd:type>
                </gmd:MD_Keywords>
                
            </gmd:descriptiveKeywords>
        </xsl:if>
        
    </xsl:template>

    <!-- retrieves the license - currently only the first license -->
    <xsl:template name="license">
        <gmd:resourceConstraints>
            <xsl:choose>
                <xsl:when test="//*[local-name() = 'rights' and normalize-space(@rightsURI) != '']">
                    <xsl:attribute name="xlink:href">
                        <xsl:value-of select="//*[local-name() = 'rights'][1]/@rightsURI"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="xlink:href">
                        <xsl:value-of
                            select="string('https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode')"
                        />
                    </xsl:attribute>
                </xsl:otherwise>
            </xsl:choose>
            <gmd:MD_Constraints>
                <gmd:useLimitation>
                    <gco:CharacterString>
                        <xsl:choose>
                            <xsl:when test="//*[local-name() = 'rights']">
                                <xsl:value-of select="//*[local-name() = 'rights']"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of
                                    select="string('Creative Commons Attribution-NonCommercial-Share Alike 3.0 United States [CC BY-NC-SA 3.0]')"
                                />
                            </xsl:otherwise>
                        </xsl:choose>
                    </gco:CharacterString>
                </gmd:useLimitation>
            </gmd:MD_Constraints>
        </gmd:resourceConstraints>
        <gmd:resourceConstraints>
            <gmd:MD_LegalConstraints>
                <gmd:accessConstraints>
                    <gmd:MD_RestrictionCode
                        codeList="http://www.isotc211.org/2005/resources/codeList.xml#MD_RestrictionCode"
                        codeListValue="license"/>
                </gmd:accessConstraints>
                <gmd:otherConstraints>
                    <gco:CharacterString>
                        <xsl:value-of select="//*[local-name() = 'rights']"/>
                    </gco:CharacterString>
                </gmd:otherConstraints>
            </gmd:MD_LegalConstraints>
        </gmd:resourceConstraints>
        <gmd:resourceConstraints>
            <gmd:MD_SecurityConstraints>
                <gmd:classification>
                    <gmd:MD_ClassificationCode
                        codeList="http://www.isotc211.org/2005/resources/codeList.xml#MD_ClassificationCode"
                        codeListValue="unclassified"/>
                </gmd:classification>
            </gmd:MD_SecurityConstraints>
        </gmd:resourceConstraints>
    </xsl:template>

    <!-- retrieves version and format - only the first occurents of these elements-->
    <xsl:template name="versionandformat">
        <xsl:if
            test="//*[local-name() = 'format' and normalize-space() != ''] or //*[local-name() = 'version' and normalize-space() != '']">
            <gmd:resourceFormat>
                <gmd:MD_Format>
                    <gmd:name>
                        <gco:CharacterString>
                            <xsl:value-of select="//*[local-name() = 'format']"/>
                        </gco:CharacterString>
                    </gmd:name>
                    <gmd:version>
                        <gco:CharacterString>
                            <xsl:value-of select="//*[local-name() = 'version']"/>
                        </gco:CharacterString>
                    </gmd:version>
                </gmd:MD_Format>
            </gmd:resourceFormat>
        </xsl:if>
    </xsl:template>

    <xsl:template name="getidscheme">
        <xsl:param name="httpuri"/>
        <xsl:choose>
            <!-- add tests for other identifier schemes here... -->
            <xsl:when test="starts-with($httpuri, 'http://orcid.org/')">
                <xsl:value-of select="string('ORCID')"/>
            </xsl:when>
            <xsl:when test="starts-with($httpuri, 'http://isni.org/isni')">
                <xsl:value-of select="string('ISNI')"/>
            </xsl:when>
            <xsl:when test="starts-with($httpuri, 'https://www.scopus.com/authid')">
                <xsl:value-of select="string('SCOPUS')"/>
            </xsl:when>
            <xsl:when test="starts-with($httpuri, 'http://')">
                <xsl:value-of select="string('HTTP')"/>
            </xsl:when>
            <!-- context for template call is the local context, so * is OK -->
            <xsl:when
                test="
                    count(*[local-name() = 'nameIdentifier']/@nameIdentifierScheme) &gt; 0 and
                    *[local-name() = 'nameIdentifier']/@nameIdentifierScheme != ''">
                <xsl:value-of
                    select="normalize-space(*[local-name() = 'nameIdentifier'][1]/@nameIdentifierScheme)"
                />
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="string('')"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="gethttpuri">
        <xsl:param name="theids"/>
        <xsl:choose>
            <!-- add tests for other identifier schemes here... -->
            <xsl:when test="count($theids[@nameIdentifierScheme = 'ORCID']) &gt; 0"
                    >http://orcid.org/<xsl:value-of
                    select="$theids[@nameIdentifierScheme = 'ORCID'][1]"/>
            </xsl:when>
            <xsl:when test="count($theids[@nameIdentifierScheme = 'ISNI']) &gt; 0"
                    >http://isni.org/isni/<xsl:value-of
                    select="$theids[@nameIdentifierScheme = 'ISNI'][1]"/>
            </xsl:when>
            <xsl:when test="count($theids[@nameIdentifierScheme = 'SCOPUS']) &gt; 0"
                    >https://www.scopus.com/authid/detail.uri?authorId=<xsl:value-of
                    select="$theids[@nameIdentifierScheme = 'SCOPUS'][1]"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:variable name="test1">
                    <xsl:for-each select="$theids">
                        <xsl:if test="starts-with(., 'http://')">
                            <xsl:value-of select="."/>
                            <!-- if there is more than one http id, will 
									take the last one it checks... -->
                        </xsl:if>
                    </xsl:for-each>
                </xsl:variable>
                <xsl:choose>
                    <xsl:when test="$test1 = ''">
                        <xsl:value-of select="string('')"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$test1"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>

    </xsl:template>

    <xsl:template name="relatedResources">
        <!-- relres is a set of relatedIdentifier nodes -->
        <xsl:param name="relres"/>
        <xsl:for-each select="$relres/*">
            <xsl:choose>
                <xsl:when
                    test="
                        not(contains(normalize-space(string(.)), 'missing')) and
                        not(contains(normalize-space(string(.)), 'unknown'))">
                    <gmd:aggregationInfo>
                        <gmd:MD_AggregateInformation>
                            <gmd:aggregateDataSetIdentifier>
                                <gmd:RS_Identifier>
                                    <gmd:code>
                                        <gco:CharacterString>
                                            <xsl:value-of select="normalize-space(string(.))"/>
                                        </gco:CharacterString>
                                    </gmd:code>
                                    <gmd:codeSpace>
                                        <gco:CharacterString>
                                            <xsl:value-of
                                                select="normalize-space(string(@relatedIdentifierType))"
                                            />
                                        </gco:CharacterString>
                                    </gmd:codeSpace>
                                </gmd:RS_Identifier>
                            </gmd:aggregateDataSetIdentifier>
                            <gmd:associationType>
                                <xsl:element name="gmd:DS_AssociationTypeCode">
                                    <xsl:attribute name="codeList">
                                        <xsl:value-of
                                            select="string('http://datacite.org/schema/kernel-4')"/>
                                    </xsl:attribute>
                                    <xsl:attribute name="codeListValue">
                                        <xsl:value-of
                                            select="normalize-space(string(@relationType))"/>
                                    </xsl:attribute>
                                    <xsl:value-of select="normalize-space(string(@relationType))"/>
                                </xsl:element>
                            </gmd:associationType>

                        </gmd:MD_AggregateInformation>
                    </gmd:aggregationInfo>
                </xsl:when>
            </xsl:choose>
        </xsl:for-each>
    </xsl:template>

    <!-- tries to retrieve the size of the data and does a conversion to bytes -->
    <xsl:template name="size">
        <xsl:variable name="alpha">abcdefghijklmnopqrstuvwxyz</xsl:variable>
        <xsl:variable name="ALPHA">ABCDEFGHIJKLMNOPQRSTUVWXYZ</xsl:variable>
        <xsl:variable name="numeric">1234567890.-</xsl:variable>
        <xsl:variable name="sizes"
            select="//*[local-name() = 'size' and (contains(translate(., $ALPHA, $alpha), 'byte') or contains(translate(., $ALPHA, $alpha), 'kb') or contains(translate(., $ALPHA, $alpha), 'kilobyte') or contains(translate(., $ALPHA, $alpha), 'mb') or contains(translate(., $ALPHA, $alpha), 'megabyte') or contains(translate(., $ALPHA, $alpha), 'gb') or contains(translate(., $ALPHA, $alpha), 'gigabyte') or contains(translate(., $ALPHA, $alpha), 'tb') or contains(translate(., $ALPHA, $alpha), 'terabyte') or contains(translate(., $ALPHA, $alpha), 'pb') or contains(translate(., $ALPHA, $alpha), 'petabyte'))]"/>
        <xsl:variable name="sizevalue"
            select="normalize-space(translate($sizes, translate($sizes, $numeric, ''), ''))"/>

        <xsl:variable name="size">
            <xsl:choose>
                <xsl:when
                    test="contains(translate($sizes, $ALPHA, $alpha), 'pb') or contains(translate($sizes, $ALPHA, $alpha), 'petabyte')">
                    <xsl:value-of select="$sizevalue"/>000000000000000 </xsl:when>
                <xsl:when
                    test="contains(translate($sizes, $ALPHA, $alpha), 'tb') or contains(translate($sizes, $ALPHA, $alpha), 'terabyte')">
                    <xsl:value-of select="$sizevalue"/>000000000000 </xsl:when>
                <xsl:when
                    test="contains(translate($sizes, $ALPHA, $alpha), 'gb') or contains(translate($sizes, $ALPHA, $alpha), 'gigabyte')">
                    <xsl:value-of select="$sizevalue"/>000000000 </xsl:when>
                <xsl:when
                    test="contains(translate($sizes, $ALPHA, $alpha), 'mb') or contains(translate($sizes, $ALPHA, $alpha), 'megabyte')">
                    <xsl:value-of select="$sizevalue"/>000000 </xsl:when>
                <xsl:when
                    test="contains(translate($sizes, $ALPHA, $alpha), 'kb') or contains(translate($sizes, $ALPHA, $alpha), 'kilobyte')">
                    <xsl:value-of select="$sizevalue"/>000 </xsl:when>
                <xsl:when test="contains(translate($sizes, $ALPHA, $alpha), 'byte')">
                    <xsl:value-of select="$sizevalue"/>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:if test="normalize-space($size) != ''">
            <gmd:transferSize>
                <gco:Real>
                    <xsl:value-of select="$size"/>
                </gco:Real>
            </gmd:transferSize>
        </xsl:if>
    </xsl:template>


</xsl:stylesheet>
