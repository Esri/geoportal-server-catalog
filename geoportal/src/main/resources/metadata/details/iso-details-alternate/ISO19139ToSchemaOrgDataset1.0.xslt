<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:gmi="http://www.isotc211.org/2005/gmi" xmlns:gco="http://www.isotc211.org/2005/gco"
                xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gmx="http://www.isotc211.org/2005/gmx"
                xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:csw="http://www.opengis.net/cat/csw/2.0.2"
                xmlns:gml="http://www.opengis.net/gml"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                exclude-result-prefixes="xs xsi gmi gmd srv gml gco gmx csw"
                version="1.1">

    <!--
  Template to build xsl transform to map content from standard ISO19139 xml metadata format to
  Schema.org JSON-LD for @type=Dataset. The design uses a set of
  xsl variables and templates to do the mapping from the xml document
  to the appropriate JSON-LD content.

ISO The template includes root element xpath for ISO19139 and ISO19139-1 (see line 526).


  Stephen M. Richard
    2018-02-25
    version 1.0

    2018-05-01 version 1.1 update spatialCoverage handling.  Only transforms geographicIdentifier,
    gml:polygon/gml:Point, and gmd:geographicBounding box; other gml geometries are ignored.
    2018-07-17  version 1.1.1  Fix problem with comma insertion in SpatialExtent
    2018-08-30  Fix problem with identifier strings that include reserve characters; if its not an
          http URI, then replace all the special characters with '.'   Also fix problem with quotes in
          legal restriction statements.
 -->
<!-- it is best to enable Saxon XSLT lib
 when used in Geoportal-Server-Catalog
-->
    <xsl:output method="text" indent="yes" encoding="UTF-8"/>
    <xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz'"/>
    <xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
    <xsl:variable name="numbers" select="'0123456789'"/>
    <xsl:variable name="otherchar" select="'.;/?@=$-_+!*(),'"/>
    <xsl:variable name="allowedsymbols"
                  select="concat($uppercase, $smallcase, $numbers, $otherchar)"/>


    <xsl:variable name="authorRoles" select="'editor,coAuthor,author,orginator'"/>

    <!--   <xsl:template match="//gmd:MD_Metadata | gmi:MI_Metadata">-->
    <xsl:template name="iso2sdo">
        <xsl:param name="isopath"/>
        <!-- Define variables for content elements -->
        <xsl:variable name="additionalContexts">
            <xsl:text>"datacite": "http://purl.org/spar/datacite/",&#10;
                "earthcollab": "https://library.ucar.edu/earthcollab/schema#",&#10;
                "geolink": "http://schema.geolink.org/1.0/base/main#",&#10;
                "vivo": "http://vivoweb.org/ontology/core#",&#10;
                "dcat":"http://www.w3.org/ns/dcat#"&#10;
                </xsl:text>
        </xsl:variable>
        <xsl:variable name="datasetURI">
            <!-- single unique identifier string for @id property -->
            <xsl:variable name="candidate">
                <xsl:choose>
                    <!-- if there's a datasetURI (apiso only...) use that -->
                    <xsl:when
                            test="string-length(normalize-space(//gmd:dataSetURI/gco:CharacterString)) > 0">
                        <xsl:value-of select="normalize-space(//gmd:dataSetURI/gco:CharacterString)"
                        />
                    </xsl:when>
                    <!-- then look for identifier in citation section -->
                    <xsl:when test="//gmd:citation//gmd:identifier">
                        <xsl:choose>
                            <!-- if an http URI is provided as a citation identifier, use that (take the first if there is > 1) -->
                            <xsl:when
                                    test="
                                    starts-with(//gmd:citation//gmd:identifier//gmd:code/gco:CharacterString, 'http') or
                                    starts-with(//gmd:citation//gmd:identifier//gmd:code/gco:CharacterString, 'HTTP')">
                                <xsl:value-of
                                        select="normalize-space((//gmd:citation//gmd:identifier//gmd:code[starts-with(translate(gco:CharacterString, 'HTTP', 'http'), 'http')]/gco:CharacterString)[1])"
                                />
                            </xsl:when>
                            <xsl:when
                                    test="starts-with(//gmd:citation//gmd:identifier//gmd:code/gco:CharacterString, 'DOI:')">
                                <xsl:variable name="id1">
                                    <xsl:value-of
                                            select="(//gmd:citation//gmd:identifier//gmd:code[starts-with(gco:CharacterString, 'DOI:')]/gco:CharacterString)[1]"
                                    />
                                </xsl:variable>
                                <xsl:value-of
                                        select="concat(string('http://doi.org/'), normalize-space(substring-after($id1, 'DOI:')))"
                                />
                            </xsl:when>
                            <xsl:when
                                    test="starts-with(//gmd:citation//gmd:identifier//gmd:code/gco:CharacterString, 'doi:')">
                                <!-- identifier is a doi (lower-case prefix), not as an HTTP URI -->
                                <xsl:variable name="id2">
                                    <xsl:value-of
                                            select="(//gmd:citation//gmd:identifier//gmd:code[starts-with(gco:CharacterString, 'doi:')]/gco:CharacterString)[1]"
                                    />
                                </xsl:variable>
                                <xsl:value-of
                                        select="concat(string('http://doi.org/'), normalize-space(substring-after($id2, 'doi:')))"
                                />
                            </xsl:when>
                            <xsl:when
                                    test="
                                    contains(//gmd:citation//gmd:identifier//gmd:codespace/gco:CharacterString, 'DOI') or
                                    contains(//gmd:citation//gmd:identifier//gmd:codespace/gco:CharacterString, 'doi')">
                                <!-- get the code that goes with the codespace -->
                                <xsl:variable name="part2">
                                    <xsl:value-of
                                            select="(//gmd:citation//gmd:identifier//gmd:codeSpace[contains(translate(gco:CharacterString, 'DOI', 'doi'), 'doi')])[1]/preceding-sibling::gmd:code/gco:CharacterString"
                                    />
                                </xsl:variable>
                                <!-- if code has doi: prefix strip it off -->
                                <xsl:variable name="part3">
                                    <xsl:choose>
                                        <xsl:when test="starts-with($part2, 'DOI:')">
                                            <xsl:value-of select="substring-after($part2, 'DOI:')"/>
                                        </xsl:when>
                                        <xsl:when test="starts-with($part2, 'doi:')">
                                            <xsl:value-of select="substring-after($part2, 'doi:')"/>
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:value-of select="normalize-space($part2)"/>
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </xsl:variable>
                                <xsl:value-of select="concat(string('http://doi.org/'), $part3)"/>
                            </xsl:when>
                            <xsl:when
                                    test="
                                    starts-with(//gmd:citation//gmd:identifier//gmd:codespace/gco:CharacterString, 'http') or
                                    starts-with(//gmd:citation//gmd:identifier//gmd:codespace/gco:CharacterString, 'HTTP')">
                                <xsl:variable name="part4">
                                    <xsl:value-of
                                            select="(//gmd:citation//gmd:identifier//gmd:codeSpace[starts-with(translate(gco:CharacterString, 'HTTP', 'http'), 'http')])[1]/gco:CharacterString"
                                    />
                                </xsl:variable>
                                <xsl:variable name="part5">
                                    <xsl:value-of
                                            select="(//gmd:citation//gmd:identifier//gmd:codeSpace[starts-with(translate(gco:CharacterString, 'HTTP', 'http'), 'http')])[1]/preceding-sibling::gmd:code/gco:CharacterString"
                                    />
                                </xsl:variable>
                                <!-- construct http uri from codespace and code -->
                                <xsl:choose>
                                    <xsl:when test="substring($part4, string-length($part4)) = '/'">
                                        <!-- tests the last character of the string -->
                                        <xsl:value-of select="concat($part4, $part5)"/>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <xsl:value-of select="concat($part4, '/', $part5)"/>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </xsl:when>
                            <xsl:otherwise>
                                <!-- concatenate the first codespace and code -->
                                <xsl:variable name="part6">
                                    <xsl:value-of
                                            select="(//gmd:citation//gmd:identifier)[1]//gmd:codeSpace/gco:CharacterString"
                                    />
                                </xsl:variable>
                                <xsl:variable name="part7">
                                    <xsl:value-of
                                            select="(//gmd:citation//gmd:identifier[1])//gmd:code/gco:CharacterString"
                                    />
                                </xsl:variable>
                                <xsl:choose>
                                    <xsl:when test="string-length($part6) > 0">
                                        <xsl:value-of select="concat($part6, '::', $part7)"/>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <xsl:value-of select="$part7"/>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:when>
                    <xsl:when test="string-length(//gmd:fileIdentifier/gco:CharacterString) > 0">
                        <!-- take the fileIdentifier; schema only allows 1 value -->
                        <xsl:value-of
                                select="normalize-space(//gmd:fileIdentifier/gco:CharacterString)"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <!-- use the title... -->
                        <xsl:value-of
                                select="normalize-space(translate(//gmd:citation//gmd:title/gco:CharacterString, ' ', ''))"
                        />
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <xsl:choose>
                <xsl:when test="starts-with(translate($candidate, $uppercase, $smallcase), 'http')">
                    <xsl:value-of select="$candidate"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of
                            select="
                            concat('urn:', normalize-space(translate($candidate,
                            translate($candidate, $allowedsymbols, ''), '')))"
                    />
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="datasetIdentifiers">
            <xsl:text> [&#10;</xsl:text>
            <xsl:if test="string-length(normalize-space(//gmd:dataSetURI/gco:CharacterString)) > 0">
                <xsl:text> {&#10;            "@type": "PropertyValue",&#10;            "propertyID": </xsl:text>
                <xsl:text>"gmd:datasetURI",&#10;            "value": "</xsl:text>
                <xsl:variable name="candidate3">
                    <xsl:value-of select="normalize-space(//gmd:dataSetURI/gco:CharacterString)"/>
                </xsl:variable>
                <xsl:value-of
                        select="
                        concat('urn:', normalize-space(translate($candidate3,
                        translate($candidate3, $allowedsymbols, ''), '')))"/>
                <xsl:if test="contains(//gmd:dataSetURI/gco:CharacterString, 'http')">
                    <xsl:text>",&#10;            "url": "</xsl:text>
                    <xsl:value-of select="normalize-space(//gmd:dataSetURI/gco:CharacterString)"/>
                </xsl:if>
                <xsl:text>"&#10;}</xsl:text>
                <xsl:if test="//gmd:citation//gmd:identifier">
                    <xsl:text>,&#10;</xsl:text>
                </xsl:if>
            </xsl:if>
            <xsl:if test="//gmd:citation//gmd:identifier">
                <xsl:for-each select="//gmd:citation//gmd:identifier">
                    <xsl:text> {&#10;            "@type": "PropertyValue",&#10;            "propertyID": </xsl:text>
                    <xsl:text>"</xsl:text>
                    <xsl:choose>
                        <!-- figure out what kind of identifier we have to put in the propertyID -->
                        <xsl:when
                                test="string-length(normalize-space(*//gmd:codespace/gco:CharacterString)) > 0">
                            <xsl:value-of
                                    select="normalize-space(*//gmd:codespace/gco:CharacterString)"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:text>dataset identifier</xsl:text>
                        </xsl:otherwise>
                    </xsl:choose>
                    <!-- close braces if no more identifier -->
                    <xsl:text>",&#10;            "value": "</xsl:text>
                    <xsl:variable name="candidate4">
                        <xsl:value-of select="normalize-space(*//gmd:code/gco:CharacterString)"/>
                    </xsl:variable>
                    <xsl:value-of
                            select="concat('urn:', normalize-space(translate($candidate4,
                                         translate($candidate4, $allowedsymbols, ''), '')))"/>
                    <xsl:if test="contains(*//gmd:code/gco:CharacterString, 'http')">
                        <xsl:text>",&#10;            "url": "</xsl:text>
                        <xsl:value-of select="normalize-space(*//gmd:code/gco:CharacterString)"/>
                    </xsl:if>
                    <xsl:text>"&#10;}</xsl:text>
                    <xsl:if test="following-sibling::gmd:identifier">
                        <xsl:text>,&#10;      </xsl:text>
                    </xsl:if>
                </xsl:for-each>
                <xsl:if test="//gmd:citation//gmd:ISBN or //gmd:citation//gmd:ISSN">
                    <xsl:text>,&#10;      </xsl:text>
                </xsl:if>
            </xsl:if>
            <xsl:if test="string-length(//gmd:citation//gmd:ISBN/gco:CharacterString) > 0">
                <xsl:text> {
                    "@type": "PropertyValue",
                    "propertyID": "ISBN",
                    "value": "</xsl:text>
                <xsl:value-of select="normalize-space(//gmd:citation//gmd:ISBN/gco:CharacterString)"/>
                <xsl:text>"}</xsl:text>
                <xsl:if test="string-length(//gmd:citation//gmd:ISSN/gco:CharacterString) > 0">
                    <xsl:text>,&#10;      </xsl:text>
                </xsl:if>
            </xsl:if>
            <xsl:if test="string-length(//gmd:citation//gmd:ISSN/gco:CharacterString) > 0">
                <xsl:text> {
                    "@type": "PropertyValue",
                    "propertyID": "ISSN",
                    "value": "</xsl:text>
                <xsl:value-of select="normalize-space(//gmd:citation//gmd:ISSN/gco:CharacterString)"/>
                <xsl:text>"}</xsl:text>
            </xsl:if>
            <xsl:text>]</xsl:text>
        </xsl:variable>
        <xsl:variable name="name"
                      select="//gmd:MD_DataIdentification[1]/gmd:citation//gmd:title/gco:CharacterString"/>
        <xsl:variable name="alternateName">
            <xsl:if test="count(//gmd:citation//gmd:alternateTitle) > 1">
                <xsl:text>[&#10;</xsl:text>
            </xsl:if>
            <xsl:for-each select="//gmd:citation//gmd:alternateTitle">
                <xsl:text>"</xsl:text>
                <xsl:value-of select="normalize-space(gco:CharacterString)"/>
                <xsl:text>"</xsl:text>
                <xsl:if test="following-sibling::gmd:alternateTitle">
                    <xsl:text>,&#10;</xsl:text>
                </xsl:if>
            </xsl:for-each>
            <xsl:if test="count(//gmd:citation//gmd:alternateTitle) > 1">
                <xsl:text>]</xsl:text>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="publisher"
                      select="//gmd:MD_DataIdentification/gmd:citation//gmd:citedResponsibleParty[translate(*//@codeListValue, $uppercase, $smallcase) = 'publisher']"/>

        <xsl:variable name="citation">
            <!-- ISO19115 only allows one citation per gmd:MD_DataIdentification;  -->
            <!-- ignore MD_DataIdentification that are not in gmd:identificationInfo property -->
            <xsl:for-each
                    select="(//gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation)[1]">
                <!-- this is just to set the context and make xpaths easier -->
                <xsl:for-each
                        select="gmd:citedResponsibleParty[(*//@codeListValue = 'author') or (*//@codeListValue = 'originator')]/gmd:CI_ResponsibleParty">
                    <xsl:choose>
                        <xsl:when
                                test="string-length(normalize-space(gmd:individualName/gco:CharacterString)) > 0
                            and not(contains(gmd:individualName/gco:CharacterString,'REQUIRED:'))">
                            <xsl:value-of
                                    select="normalize-space(gmd:individualName/gco:CharacterString)"/>
                        </xsl:when>
                        <xsl:when
                                test="string-length(normalize-space(gmd:organisationName/gco:CharacterString)) > 0
                            and not(contains(gmd:organisationName/gco:CharacterString,'REQUIRED:'))">
                            <xsl:value-of
                                    select="normalize-space(gmd:organisationName/gco:CharacterString)"/>
                        </xsl:when>
                        <xsl:when
                                test="string-length(normalize-space(gmd:positionName/gco:CharacterString)) > 0
                            and not(contains(gmd:positionName/gco:CharacterString,'REQUIRED:'))">
                            <xsl:value-of
                                    select="normalize-space(gmd:positionName/gco:CharacterString)"/>
                        </xsl:when>
                        <xsl:otherwise>not provided</xsl:otherwise>
                    </xsl:choose>

                    <!--  <xsl:value-of select="normalize-space(gmd:individualName/gco:CharacterString)"/>-->
                    <xsl:if
                            test="following::gmd:citedResponsibleParty[(*//@codeListValue = 'author') or (*//@codeListValue = 'originator')]">
                        <xsl:text>, </xsl:text>
                    </xsl:if>
                </xsl:for-each>
                <xsl:text> (</xsl:text>
                <xsl:choose>
                    <!-- deal with ISO DateTypeCodes; publication revision-->
                    <xsl:when
                            test="string-length(*//gmd:CI_Date[translate(*//@codeListValue, $uppercase, $smallcase) = 'publication']/gmd:date/child::node()/text()) > 0">
                        <xsl:value-of
                                select="*//gmd:CI_Date[translate(*//@codeListValue, $uppercase, $smallcase) = 'publication']/gmd:date/child::node()/text()"
                        />
                    </xsl:when>
                    <xsl:when
                            test="string-length(*//gmd:CI_Date[translate(*//@codeListValue, $uppercase, $smallcase) = 'revision']/gmd:date/child::node()/text()) > 0">
                        <xsl:value-of
                                select="*//gmd:CI_Date[translate(*//@codeListValue, $uppercase, $smallcase) = 'revision']/gmd:date/child::node()/text()"
                        />
                    </xsl:when>
                    <xsl:when
                            test="string-length(*//gmd:CI_Date[translate(*//@codeListValue, $uppercase, $smallcase) = 'creation']/gmd:date/child::node()/text()) > 0">
                        <xsl:value-of
                                select="*//gmd:CI_Date[translate(*//@codeListValue, $uppercase, $smallcase) = 'creation']/gmd:date/child::node()/text()"
                        />
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of
                                select="
                                concat(*//gmd:CI_Date[1]/gmd:date/child::node()/text(),
                                '-', *//gmd:CI_Date[1]//@codeListValue)"
                        />
                    </xsl:otherwise>
                </xsl:choose>
                <xsl:text>), </xsl:text>
                <!-- will potentially have problems here if there are multiple titles; this just takes the first one -->
                <xsl:value-of disable-output-escaping="yes"
                              select="normalize-space(//gmd:citation//gmd:title/gco:CharacterString)"/>

                <!-- get the publisher -->
                <xsl:if
                        test="string-length($publisher//gmd:organisationName/gco:CharacterString) > 0
                      and not(contains(gmd:organisationName/gco:CharacterString,'REQUIRED:'))">
                    <xsl:text>, </xsl:text>
                    <xsl:value-of
                            select="normalize-space($publisher//gmd:organisationName/gco:CharacterString)"
                    />
                </xsl:if>
                <xsl:if test="string-length($datasetURI) > 0">
                    <xsl:text>, </xsl:text>
                    <xsl:value-of select="normalize-space($datasetURI)"/>
                </xsl:if>
                <xsl:text>.</xsl:text>
            </xsl:for-each>
        </xsl:variable>
        <xsl:variable name="datePublished">
            <xsl:for-each
                    select="(//gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation)[1]">
                <!-- for-each is just to set the context and make xpaths easier -->
                <xsl:choose>
                    <xsl:when
                            test="string-length(*//gmd:CI_Date[translate(*//@codeListValue, $uppercase, $smallcase) = 'publication']/gmd:date/child::node()/text()) > 0">
                        <xsl:value-of
                                select="*//gmd:CI_Date[translate(*//@codeListValue, $uppercase, $smallcase) = 'publication']/gmd:date/child::node()/text()"
                        />
                    </xsl:when>
                    <xsl:when
                            test="string-length(*//gmd:CI_Date[translate(*//@codeListValue, $uppercase, $smallcase) = 'revision']/gmd:date/child::node()/text()) > 0">
                        <xsl:value-of
                                select="*//gmd:CI_Date[translate(*//@codeListValue, $uppercase, $smallcase) = 'revision']/gmd:date/child::node()/text()"
                        />
                    </xsl:when>
                    <xsl:when
                            test="string-length(*//gmd:CI_Date[translate(*//@codeListValue, $uppercase, $smallcase) = 'creation']/gmd:date/child::node()/text()) > 0">
                        <xsl:value-of
                                select="*//gmd:CI_Date[translate(*//@codeListValue, $uppercase, $smallcase) = 'creation']/gmd:date/child::node()/text()"
                        />
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of
                                select="
                                concat(*//gmd:CI_Date[1]/gmd:date/child::node()/text(),
                                '-', *//gmd:CI_Date[1]//@codeListValue)"
                        />
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:for-each>
        </xsl:variable>
        <xsl:variable name="description">
            <xsl:choose>
                <xsl:when test="starts-with(//gmd:abstract[1]/gco:CharacterString,'REQUIRED')">
                    <xsl:value-of select="'no abstract provided'"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of   select="normalize-space(//gmd:abstract[1]/gco:CharacterString)"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <xsl:variable name="DataCatalogName"
                      select="'Name of catalog source for record being transformed'"/>
        <xsl:variable name="DataCatalogURL" select="'not defined'"/>

        <xsl:variable name="contributors">
            <xsl:if
                    test="
                    (count(//gmd:identificationInfo//gmd:credit/gco:CharacterString) +
                    count(//gmd:CI_ResponsibleParty[*//@codeListValue = 'sponsor' or *//@codeListValue = 'funder'])) > 1">
                <xsl:text>[</xsl:text>
            </xsl:if>

            <xsl:for-each select="//gmd:identificationInfo//gmd:credit">
                <xsl:text>{&#10;    "@type":"Role",&#10;</xsl:text>
                <xsl:text>"roleName":"credit",&#10;    "description":"</xsl:text>
                <xsl:value-of select="normalize-space(child::node()/text())"/>
                <!-- allow for Anchor or CharacterString -->
                <xsl:text>"</xsl:text>
                <xsl:if test="string-length(gmx:Anchor/@xlink:href) > 0">
                    <xsl:text>,&#10;    "URL":"</xsl:text>
                    <xsl:value-of select="gmx:Anchor/@xlink:href"/>
                    <xsl:text>"}</xsl:text>
                </xsl:if>
                <xsl:text>}</xsl:text>

                <xsl:if test="following-sibling::gmd:credit">
                    <xsl:text>,&#10;      </xsl:text>
                </xsl:if>
            </xsl:for-each>
            <xsl:if
                    test="(//gmd:identificationInfo//gmd:credit) and (//gmd:CI_ResponsibleParty[*//@codeListValue = 'sponsor' or *//@codeListValue = 'funder'])">
                <xsl:text>,&#10;     </xsl:text>
            </xsl:if>
            <xsl:for-each
                    select="//gmd:CI_ResponsibleParty[*//@codeListValue = 'sponsor' or *//@codeListValue = 'funder']">

                <xsl:apply-templates select=".">
                    <!-- invoke gmd:CI_ResponsibleParty template -->
                    <xsl:with-param name="role" select="'contributor'"/>
                </xsl:apply-templates>

                <xsl:if
                        test="following::gmd:CI_ResponsibleParty[*//@codeListValue = 'sponsor' or *//@codeListValue = 'funder']">
                    <xsl:text>,&#10;</xsl:text>
                </xsl:if>
            </xsl:for-each>
            <xsl:if
                    test="
                    (count(//gmd:identificationInfo//gmd:credit/gco:CharacterString) +
                    count(//gmd:CI_ResponsibleParty[*//@codeListValue = 'sponsor' or *//@codeListValue = 'funder'])) > 1">
                <xsl:text>]</xsl:text>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="awardID" select="''"/>
        <xsl:variable name="awardname" select="''"/>
        <xsl:variable name="awardURL" select="''"/>
        <xsl:variable name="keywords">
            <xsl:for-each select="//gmd:descriptiveKeywords">
                <!-- extract one or more keywords from each keywords group -->
                <!-- use child::node() to catch CharacterString and Anchor -->
                <xsl:for-each select="gmd:MD_Keywords/gmd:keyword">
                    <xsl:text>"</xsl:text>
                    <xsl:value-of select="normalize-space(child::node()/text())"/>
                    <xsl:text>"</xsl:text>
                    <xsl:if test="following-sibling::gmd:keyword">
                        <xsl:text>, </xsl:text>
                    </xsl:if>
                </xsl:for-each>
                <xsl:if test="following::gmd:descriptiveKeywords">
                    <xsl:text>, </xsl:text>
                </xsl:if>
            </xsl:for-each>

            <xsl:variable name="subjectsString">
                <xsl:for-each select="//gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword">
                    <xsl:value-of select="normalize-space(child::node()/text())"/>
                </xsl:for-each>
            </xsl:variable>

            <xsl:for-each
                    select="//gmd:extent//gmd:geographicIdentifier//gmd:code/gco:CharacterString">
                <xsl:if test="not(contains($subjectsString, text()))">
                    <xsl:text>,&#10;"</xsl:text>
                    <xsl:value-of select="normalize-space(text())"/>
                    <xsl:text>"</xsl:text>
                </xsl:if>
            </xsl:for-each>
        </xsl:variable>

        <!-- schema.org license is CreativeWork or URL -->
        <xsl:variable name="license">
            <!-- mine information from gmd:resourceConstraints. Each resource constraint will be a separte licence entry
               so could be an array -->
            <!-- xlink:href on gmd:resourceConstraints would provide a URL -->
            <!-- text from gmd:useLimitation or inside of a restriction coe element -->
            <xsl:if test="count(//gmd:resourceConstraints) > 1">
                <xsl:text>[</xsl:text>
            </xsl:if>
            <xsl:for-each select="//gmd:resourceConstraints">
                <xsl:text>{&#10;     </xsl:text>
                <xsl:text>"@type": "DigitalDocument",</xsl:text>
                <xsl:if test="string-length(normalize-space(@xlink:href)) > 0">
                    <xsl:text>"URL": "</xsl:text>
                    <xsl:value-of select="normalize-space(@xlink:href)"/>
                    <xsl:text>"</xsl:text>
                    <xsl:if test="child::*">
                        <xsl:text>,&#10;       </xsl:text>
                    </xsl:if>
                </xsl:if>
                <xsl:for-each select="child::*">
                    <!-- there should be only one -->
                    <xsl:text>"name": "</xsl:text>
                    <xsl:value-of select="local-name()"/>
                    <xsl:text>"</xsl:text>
                    <xsl:if test="child::*/child::*">
                        <xsl:text>,&#10;        </xsl:text>
                    </xsl:if>
                </xsl:for-each>
                <xsl:text>"description": "</xsl:text>
                <xsl:for-each select="child::*/child::*">
                    <xsl:value-of select="concat(local-name(), ': ')"/>
                    <xsl:choose>
                        <xsl:when test="gmd:MD_RestrictionCode">
                            <xsl:value-of select="gmd:MD_RestrictionCode/@codeListValue"/>
                            <xsl:if
                                    test="
                                    string-length(gmd:MD_RestrictionCode) > 0 and
                                    (normalize-space(gmd:MD_RestrictionCode) != normalize-space(gmd:MD_RestrictionCode/@codeListValue))">
                                <xsl:text>: </xsl:text>
                                <xsl:value-of select="normalize-space(gmd:MD_RestrictionCode)"/>

                            </xsl:if>
                            <xsl:text>.    </xsl:text>
                        </xsl:when>
                        <xsl:when test="string-length(gco:CharacterString) > 0">
                            <xsl:variable name="thetext">
                                <xsl:call-template name="string-replace-all">
                                    <xsl:with-param name="text" select="normalize-space(gco:CharacterString)"/>
                                    <xsl:with-param name="replace" select="string('&#34;')"/>
                                    <xsl:with-param name="by" select="string('\&#34;')"/>
                                </xsl:call-template>
                            </xsl:variable>
                            <xsl:value-of select="concat($thetext, '.   ')"/>
                        </xsl:when>
                    </xsl:choose>
                </xsl:for-each>
                <xsl:text>"}</xsl:text>
                <!-- use following instead of following-sibling in case there are constraints in serviceInformation sections -->
                <xsl:if test="following::gmd:resourceConstraints">
                    <xsl:text>,&#10;       </xsl:text>
                </xsl:if>
            </xsl:for-each>
            <xsl:if test="count(//gmd:resourceConstraints) > 1">
                <xsl:text>]</xsl:text>
            </xsl:if>
        </xsl:variable>

        <!-- default values to use in lieu of extracted provider; customize
      logic in format/profile-specific implementations to decide which to use-->
        <xsl:variable name="providerDefault" select="'default provider'"/>
        <xsl:variable name="publisherDefault" select="'default publisher'"/>
        <xsl:variable name="publishingPrinciplesDefault" select="'not defined yet'"/>
        <xsl:variable name="provider" select="''"/>
        <!-- use distributor contact information for providers -->
        <xsl:variable name="publshingPrinciples" select="''"/>

        <!-- pick up spatial extent that is a point location, a bounding box, or a geographic identifier -->
        <xsl:variable name="hasSpatial"
                      select="
                count(//gmd:extent[count(descendant::*[local-name() = 'polygon']/*[local-name() = 'Point']) > 0 or
                count(descendant::gmd:EX_GeographicBoundingBox) > 0 or
                count(descendant::gmd:code) > 0]) > 0"/>


        <xsl:variable name="hasVariables" select="false()"/>

        <!-- construct the JSON with xsl text elements. &#10; is carriage return -->
        <xsl:text>{&#10;  "@context": {&#10;</xsl:text>
        <xsl:text> "@vocab": "http://schema.org/"</xsl:text>
        <xsl:if test="$additionalContexts and string-length($additionalContexts) > 0">
            <xsl:text>, &#10;</xsl:text>
            <xsl:value-of select="$additionalContexts"/>
        </xsl:if>
        <xsl:text>  },&#10; </xsl:text>

        <xsl:text>"@id": "</xsl:text>
        <xsl:value-of select="$datasetURI"/>
        <xsl:text>",&#10;</xsl:text>
        <xsl:text>  "@type": "Dataset",&#10;</xsl:text>
        <xsl:text>  "additionalType": [&#10;    "geolink:Dataset",&#10;    "vivo:Dataset"&#10;  ],&#10;</xsl:text>

        <xsl:text>  "name": "</xsl:text>
        <!-- escape (with '\') any double quotes (&#34;) that show up in  the name string -->
        <xsl:call-template name="string-replace-all">
            <xsl:with-param name="text" select="normalize-space($name)"/>
            <xsl:with-param name="replace" select="string('&#34;')"/>
            <xsl:with-param name="by" select="string('\&#34;')"/>
        </xsl:call-template>
        <xsl:text>",&#10;</xsl:text>

        <xsl:if test="string-length($alternateName) > 0">
            <xsl:text>  "alternateName": </xsl:text>
            <xsl:value-of select="normalize-space($alternateName)"/>
            <xsl:text>,&#10;</xsl:text>
        </xsl:if>

        <xsl:text>  "citation": "</xsl:text>
        <!-- escape (with '\') any double quotes (&#34;) that show up in  the citation string -->
        <xsl:call-template name="string-replace-all">
            <xsl:with-param name="text" select="normalize-space($citation)"/>
            <xsl:with-param name="replace" select="string('&#34;')"/>
            <xsl:with-param name="by" select="string('\&#34;')"/>
        </xsl:call-template>
        <xsl:text>",&#10;</xsl:text>

        <xsl:text>  "creator":&#10;</xsl:text>
        <xsl:text>[</xsl:text>
        <xsl:for-each
                select="
                //gmd:citation/gmd:CI_Citation/gmd:citedResponsibleParty[contains('editor,coAuthor,author,originator', *//gmd:CI_RoleCode/@codeListValue)
                and *//gmd:CI_RoleCode]">
            <xsl:apply-templates select="gmd:CI_ResponsibleParty">
                <xsl:with-param name="role">
                    <xsl:value-of select="'creator'"/>
                </xsl:with-param>
            </xsl:apply-templates>
            <xsl:if test="position() != last()">
                <xsl:text>,&#10;</xsl:text>
            </xsl:if>
        </xsl:for-each>
        <xsl:text>],&#10;</xsl:text>


        <xsl:text>  "datePublished": "</xsl:text>
        <xsl:value-of select="normalize-space($datePublished)"/>
        <xsl:text>",&#10;</xsl:text>

        <xsl:text>  "description": "</xsl:text>
        <!-- clean up any double quotes in the text -->
        <xsl:call-template name="string-replace-all">
            <xsl:with-param name="text" select="normalize-space($description)"/>
            <xsl:with-param name="replace" select="string('&#34;')"/>
            <xsl:with-param name="by" select="string('\&#34;')"/>
        </xsl:call-template>
        <xsl:text>",&#10;</xsl:text>


        <xsl:text>  "distribution": [&#10;</xsl:text>
        <!-- logic here is very messy because of the convoluted distribution model in ISO19115; there is no explicit binding
        between a transfer option and a format. assume two kinds of distribution tuples binding a distributor, format and transfer options:

        A collection of formats, distributors, and transfer options, all formats and options available from all distributors:
                {MD_distributionFormat (0..*;), MD_distributorContact (1 per distributor), MD_transferOptions (0..*)};
                ignore distributorFormat and distributorTransferOptions

        each set of formats and transfer options is bound to one distributor and to each other
                {MD_distributorFormat (0..*); MD_distributorContact (1 per distributor); MD_distributorTransferOptions};

        In schema.org, distribution is represented using a DataDownload object, which inherits from MediaObject and Creative Work, so there
        are LOTS of possible properties, but not much to describe service distributions. distributorContacts map to provider. Formats to fileFormat,
        CI_onlineResurce.linkage.URL to URL, except if the CI_OnLineFunctionCode is 'download' then it maps to contentURL. The mapping we'll try
        here maps each distribution CI_OnlineResource to a DataDownload object; distributorContact and format information will be repeated as necessary.

        The formatting template will take a single CI_OnlineResource node, a set of MD_Format nodes, and a set of CI_ResponsibleParty nodes
        -->

        <!-- start with link to the full ISO metadata record for the resource; provisional, based on suggestion from
        Dave Vieglais, for DataOne harvest-->
        <xsl:if test="$isopath">
            <xsl:text>{
           "@type": "DataDownload",
           "additionalType": "http://www.w3.org/ns/dcat#DataCatalog",
           "encodingFormat": "text/xml",
           "name": "ISO Metadata Document",
           "url": "</xsl:text>

            <xsl:value-of select="$isopath"/>
            <xsl:text>"}</xsl:text>

            <xsl:if
                    test="
                    //gmd:transferOptions//gmd:onLine/gmd:CI_OnlineResource or
                    //gmd:distributorTransferOptions//gmd:onLine/gmd:CI_OnlineResource">
                <xsl:text>,&#10;  </xsl:text>
            </xsl:if>
        </xsl:if>

        <xsl:for-each select="//gmd:transferOptions//gmd:onLine/gmd:CI_OnlineResource">
            <xsl:variable name="onlineResource" select="."/>
            <xsl:variable name="format"
                          select="*/ancestor::node()/preceding-sibling::gmd:distributionFormat/gmd:MD_Format"/>
            <xsl:variable name="distributorContact"
                          select="*/ancestor::node()/preceding-sibling::gmd:distributor//gmd:CI_ResponsibleParty"/>

            <xsl:call-template name="distributions">
                <xsl:with-param name="por" select="$onlineResource"/>
                <xsl:with-param name="pfor" select="$format"/>
                <xsl:with-param name="prp" select="$distributorContact"/>
            </xsl:call-template>
            <xsl:if test="following::gmd:onLine">
                <xsl:text>,&#10;</xsl:text>
            </xsl:if>
        </xsl:for-each>

        <xsl:if
                test="
                //gmd:transferOptions//gmd:onLine/gmd:CI_OnlineResource and
                //gmd:distributorTransferOptions//gmd:onLine/gmd:CI_OnlineResource">
            <xsl:text>,  </xsl:text>
        </xsl:if>

        <xsl:for-each select="//gmd:distributorTransferOptions//gmd:onLine/gmd:CI_OnlineResource">
            <xsl:variable name="onlineResource" select="."/>
            <xsl:variable name="format"
                          select="*/ancestor::gmd:distributorTransferOptions/preceding-sibling::gmd:distributorFormat/gmd:MD_Format"/>
            <xsl:variable name="distributorContact"
                          select="*/ancestor::gmd:distributorTransferOptions/preceding-sibling::gmd:distributorContact/gmd:CI_ResponsibleParty"/>

            <xsl:call-template name="distributions">
                <xsl:with-param name="por" select="$onlineResource"/>
                <xsl:with-param name="pfor" select="$format"/>
                <xsl:with-param name="prp" select="$distributorContact"/>
            </xsl:call-template>
            <xsl:if
                    test="following::gmd:distributorTransferOptions//gmd:onLine or parent::node()/following-sibling::gmd:onLine">
                <xsl:text>,&#10;</xsl:text>
            </xsl:if>
        </xsl:for-each>
        <xsl:text>  ],&#10;</xsl:text>

        <xsl:if test="string-length(string($datasetIdentifiers)) > 0">
            <xsl:text>  "identifier": &#10;</xsl:text>
            <xsl:value-of select="$datasetIdentifiers"/>
            <xsl:text>,&#10;</xsl:text>
        </xsl:if>

        <xsl:if test="string-length($DataCatalogName) > 0 or string-length($DataCatalogURL) > 0">
            <xsl:text>  "includedInDataCatalog": {&#10;
    "@type":"DataCatalog",&#10;</xsl:text>
            <xsl:if test="$DataCatalogName">
                <xsl:text>  "name":"</xsl:text>
                <xsl:value-of select="$DataCatalogName"/>
                <xsl:text>",&#10;</xsl:text>
            </xsl:if>
            <xsl:if test="$DataCatalogURL">
                <xsl:text>  "url": "</xsl:text>
                <xsl:value-of select="$DataCatalogURL"/>
                <xsl:text>"&#10;</xsl:text>
            </xsl:if>
            <xsl:text>},&#10;</xsl:text>
        </xsl:if>

        <!-- put award information in contributor...  -->
        <xsl:if test="string-length(string($contributors)) > 0">
            <xsl:text>  "contributor": </xsl:text>
            <xsl:value-of select="normalize-space($contributors)"/>
            <xsl:text>,&#10;</xsl:text>
        </xsl:if>

        <xsl:text>  "keywords": [</xsl:text>
        <xsl:value-of select="$keywords"/>
        <xsl:text>],&#10;</xsl:text>

        <xsl:if test="string-length(string($license)) > 0">
            <xsl:text>  "license": </xsl:text>
            <xsl:value-of select="$license"/>
            <xsl:text>,&#10;</xsl:text>
        </xsl:if>

        <xsl:if test="string-length($publisherDefault) > 0 or count($publisher/child::node()) > 0">
            <xsl:text>  "publisher": </xsl:text>
            <xsl:choose>
                <xsl:when test="count($publisher/child::node()) > 0">
                    <xsl:if test="count($publisher/child::node()) > 1">
                        <xsl:text>[&#10;</xsl:text>
                    </xsl:if>
                    <xsl:for-each select="$publisher/gmd:CI_ResponsibleParty">
                        <xsl:apply-templates select="."/>
                        <xsl:if test="position() != last()">
                            <xsl:text>,&#10;</xsl:text>
                        </xsl:if>
                    </xsl:for-each>

                    <xsl:if test="count($publisher/child::node()) > 1">
                        <xsl:text>]</xsl:text>
                    </xsl:if>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:text>"</xsl:text>
                    <xsl:value-of select="$publisherDefault"/>
                    <xsl:text>"</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>

        <xsl:if test="$hasSpatial or $hasVariables">
            <xsl:text>,&#10;</xsl:text>
        </xsl:if>

        <xsl:if test="$hasSpatial">
            <xsl:text>  "spatialCoverage": </xsl:text>
            <xsl:variable name="countSpatial"
                          select="
                    count(//gmd:extent[count(descendant::*[local-name() = 'polygon']/*[local-name() = 'Point']) > 0 or
                    count(descendant::gmd:EX_GeographicBoundingBox) > 0 or
                    count(descendant::gmd:code) > 0])"/>

            <xsl:if test="$countSpatial > 1">
                <!-- make array of Places, one for each extent that has a geospatial location -->
                <xsl:text>[&#10;</xsl:text>
            </xsl:if>

            <xsl:for-each
                    select="
                    //gmd:extent[count(descendant::*[local-name() = 'polygon']/*[local-name() = 'Point']) > 0 or
                    count(descendant::gmd:EX_GeographicBoundingBox) > 0 or
                    count(descendant::gmd:code) > 0]">
                <xsl:text>{&#10;</xsl:text>

                <xsl:text>&#10;    "@type":"Place",&#10;</xsl:text>
                <xsl:if test="string-length(gmd:EX_Extent/gmd:description/gco:CharacterString) > 0">

                    <xsl:text>&#10;    "description":"</xsl:text>
                    <xsl:value-of
                            select="normalize-space(gmd:EX_Extent/gmd:description/gco:CharacterString)"/>
                    <xsl:text>"</xsl:text>
                    <xsl:if
                            test="
                            *//gmd:EX_GeographicDescription//gmd:code/gco:CharacterString or
                            *//gmd:geographicElement/gmd:EX_BoundingPolygon[count(descendant::*[local-name() = 'polygon']/*[local-name() = 'Point']) > 0]
                            or *//gmd:geographicElement/gmd:EX_GeographicBoundingBox">
                        <xsl:text>,&#10;</xsl:text>
                    </xsl:if>
                </xsl:if>


                <!-- geographicIdentifiers in array of alternateNames -->
                <xsl:if
                        test="*//gmd:geographicElement/gmd:EX_GeographicDescription//gmd:code/gco:CharacterString">
                    <xsl:text>       "alternateName": </xsl:text>
                    <xsl:if
                            test="count(*//gmd:geographicElement/gmd:EX_GeographicDescription//gmd:code/gco:CharacterString) > 1">
                        <xsl:text>[&#10;</xsl:text>
                    </xsl:if>
                    <xsl:for-each select="*//gmd:geographicElement/gmd:EX_GeographicDescription">

                        <xsl:if test="string-length(*//gmd:code/gco:CharacterString) > 0">
                            <xsl:text>"</xsl:text>
                            <xsl:value-of
                                    select="normalize-space(string(*//gmd:code/gco:CharacterString))"/>
                            <xsl:text>"</xsl:text>
                        </xsl:if>
                        <xsl:if
                                test="parent::*/following-sibling::gmd:geographicElement[count(descendant::gmd:geographicIdentifier) > 0]">
                            <xsl:text>,&#10;</xsl:text>
                        </xsl:if>
                    </xsl:for-each>
                    <xsl:if
                            test="count(*//gmd:geographicElement/gmd:EX_GeographicDescription//gmd:code/gco:CharacterString) > 1">
                        <xsl:text>]</xsl:text>
                    </xsl:if>
                </xsl:if>

                <xsl:if
                        test="
                        (*//gmd:geographicElement/gmd:EX_BoundingPolygon[count(descendant::*[local-name() = 'polygon']/*[local-name() = 'Point']) > 0]
                        or *//gmd:geographicElement/gmd:EX_GeographicBoundingBox) and
                        *//gmd:geographicElement/gmd:EX_GeographicDescription//gmd:code/gco:CharacterString">
                    <xsl:text>,&#10;</xsl:text>
                </xsl:if>

                <xsl:if
                        test="
                        (*//*[count(descendant::*[local-name() = 'polygon']/*[local-name() = 'Point']) > 0]
                        or *//gmd:EX_GeographicBoundingBox)">
                    <xsl:text>      "geo":&#10;</xsl:text>
                </xsl:if>
                <xsl:if
                        test="
                        count(*//*[count(descendant::*[local-name() = 'polygon']/*[local-name() = 'Point']) > 0]) +
                        count(*//gmd:EX_GeographicBoundingBox) > 1">
                    <xsl:text>        [&#10;</xsl:text>
                </xsl:if>


                <xsl:for-each select="*//gmd:geographicElement/gmd:EX_GeographicBoundingBox">
                    <!-- handle bounding boxes -->
                    <xsl:text>        {&#10;       "@type": "GeoShape",&#10;          "box": "</xsl:text>
                    <xsl:value-of select="gmd:westBoundLongitude/gco:Decimal/text()"/>
                    <xsl:text>, </xsl:text>
                    <xsl:value-of select="gmd:southBoundLatitude/gco:Decimal/text()"/>
                    <xsl:text> </xsl:text>
                    <xsl:value-of select="gmd:eastBoundLongitude/gco:Decimal/text()"/>
                    <xsl:text>, </xsl:text>
                    <xsl:value-of select="gmd:northBoundLatitude/gco:Decimal/text()"/>
                    <xsl:text>"&#10;            }</xsl:text>

                    <xsl:if test="position() != last()">
                        <xsl:text>,&#10;            </xsl:text>
                    </xsl:if>

                </xsl:for-each>

                <xsl:if
                        test="*//gmd:geographicElement/gmd:EX_GeographicBoundingBox and *//*[count(descendant::*[local-name() = 'polygon']/*[local-name() = 'Point']) > 0]">
                    <xsl:text>,</xsl:text>
                </xsl:if>

                <xsl:for-each
                        select="*/descendant::*[local-name() = 'polygon']/*[local-name() = 'Point']">
                    <!--  Handle point locations gml:polygon//gml:Point (point location, which can only be encoded
                    in  as a polygon. Use Local names to avoid problems with gml namespaces. TBD: a gml:point might
                    have an srs attribute that could be inserted here as well.-->
                    <xsl:text>    { "@type": "GeoCoordinates",</xsl:text>
                    <xsl:if test="*[(local-name() = 'description')]">
                        <xsl:text>"description":"</xsl:text>
                        <xsl:value-of
                                select="normalize-space(string(*[local-name() = 'description']))"/>
                        <xsl:text>",&#10;</xsl:text>
                    </xsl:if>
                    <xsl:text>"longitude": "</xsl:text>
                    <xsl:value-of
                            select="substring-after(string(*[(local-name() = 'coordinates') or (local-name() = 'pos')]), ' ')"/>
                    <xsl:text>", "latitude": "</xsl:text>
                    <xsl:value-of
                            select="substring-before(string(*[(local-name() = 'coordinates') or (local-name() = 'pos')]), ' ')"/>
                    <xsl:text>"}</xsl:text>

                    <xsl:if test="position() != last()">
                        <xsl:text>,&#10;            </xsl:text>
                    </xsl:if>

                </xsl:for-each>

                <!-- close the geo: array if necessary -->
                <xsl:if
                        test="
                        count(*//*[count(descendant::*[local-name() = 'polygon']/*[local-name() = 'Point']) > 0]) +
                        count(*//gmd:EX_GeographicBoundingBox) > 1">
                    <xsl:text>]&#10;</xsl:text>
                </xsl:if>
                <!-- close the @Place object -->
                <xsl:text>}</xsl:text>
                <xsl:if test="position() != last()">
                    <xsl:text>,&#10;            </xsl:text>
                </xsl:if>
            </xsl:for-each>

            <!-- close the places array in spatialCoverage -->
            <xsl:if test="$countSpatial > 1">
                <xsl:text>]</xsl:text>
            </xsl:if>
            <xsl:if test="$hasVariables">
                <xsl:text>,&#10;</xsl:text>
            </xsl:if>

        </xsl:if>


        <xsl:if test="$hasVariables">
            <xsl:text>  "variableMeasured": [</xsl:text>
            <xsl:call-template name="variableMeasured">
                <xsl:with-param name="variableList"> </xsl:with-param>
            </xsl:call-template>
            <xsl:text>]</xsl:text>
        </xsl:if>
        <xsl:text>}</xsl:text>

    </xsl:template>

    <xsl:template match="gmd:CI_ResponsibleParty">
        <xsl:param name="role"/>

        <!-- input is a gmd:CI_ResponsibleParty element; should be filtered for role = -->
        <!-- because of way that schema.org is handling roles, have to pass in the name
        of the sdo element that contains this role because it gets repeated inside the content-->
        <!-- returns JSON array of schema.org Role objects -->

        <xsl:variable name="agentID">
            <xsl:if test="@xlink:href">
                <xsl:value-of select="@xlink:href"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="personName">
            <xsl:if test="string-length(gmd:individualName/gco:CharacterString) > 0
                and not(contains(gmd:individualName/gco:CharacterString,'REQUIRED:'))">
                <xsl:value-of
                        select="normalize-space(string(gmd:individualName/gco:CharacterString))"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="organisationName">
            <xsl:if test="string-length(gmd:organisationName/gco:CharacterString) > 0
                and not(contains(gmd:organisationName/gco:CharacterString,'REQUIRED:'))">
                <xsl:value-of
                        select="normalize-space(string(gmd:organisationName/gco:CharacterString))"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="agentRole">
            <xsl:if test="string-length(normalize-space(gmd:positionName/gco:CharacterString)) > 0
                and not(contains(gmd:positionName/gco:CharacterString,'REQUIRED:'))">
                <xsl:value-of select="normalize-space(string(gmd:positionName/gco:CharacterString))"/>
                <xsl:text>; </xsl:text>
            </xsl:if>
            <!-- test for non existant role code and skip if that's it (NGCD records) -->
            <xsl:if test="string-length(gmd:role/gmd:CI_RoleCode/@codeListValue) > 0">
                <xsl:value-of select="string(gmd:role/gmd:CI_RoleCode/@codeListValue)"/>
            </xsl:if>
            <xsl:if
                    test="
                    string-length(gmd:role/gmd:CI_RoleCode/text()) > 0 and
                    not(contains(normalize-space(gmd:role/gmd:CI_RoleCode/@codeListValue), normalize-space(gmd:role/gmd:CI_RoleCode/text())))">
                <xsl:text>; </xsl:text>
                <xsl:value-of select="normalize-space(gmd:role/gmd:CI_RoleCode/text())"/>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="agentemail">
            <xsl:if test="count(gmd:contactInfo//gmd:electronicMailAddress/gco:CharacterString[not(starts-with(.,'REQUIRED:'))]) > 0"
            > [ </xsl:if>
            <xsl:for-each select="gmd:contactInfo//gmd:electronicMailAddress">
                <xsl:if test="string-length(gco:CharacterString) > 0">
                    <xsl:text>"</xsl:text>
                    <xsl:value-of select="normalize-space(string(.))"/>
                    <xsl:text>"</xsl:text>
                    <xsl:if test="following-sibling::gmd:electronicMailAddress">
                        <xsl:text>, </xsl:text>
                    </xsl:if>
                </xsl:if>
            </xsl:for-each>
            <xsl:if test="count(gmd:contactInfo//gmd:electronicMailAddress/gco:CharacterString[not(starts-with(.,'REQUIRED:'))]) > 0"
            > ] </xsl:if>
        </xsl:variable>

        <xsl:text>{&#10;    "@type":"Role",&#10;</xsl:text>
        <xsl:text>      "roleName": "</xsl:text>
        <xsl:value-of select="string($agentRole)"/>
        <xsl:text>",&#10;</xsl:text>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="string($role)"/>
        <xsl:text>": {&#10;</xsl:text>

        <xsl:choose>
            <xsl:when
                    test="string-length(normalize-space($personName)) > 0 and string-length($organisationName) = 0">
                <xsl:text>    "@type":"Person",&#10;      "additionalType": "geolink:Person",&#10;</xsl:text>
                <xsl:if test="string-length($agentID) > 0">
                    <xsl:text>      "@id": "</xsl:text>
                    <xsl:value-of select="string($agentID)"/>
                    <xsl:text>",&#10;</xsl:text>
                </xsl:if>
                <xsl:text>      "name": "</xsl:text>
                <xsl:value-of select="string($personName)"/>
                <xsl:text>"</xsl:text>
                <!-- email address -->
                <xsl:if test="string-length($agentemail) > 0">
                    <xsl:text>,&#10;      "email": </xsl:text>
                    <xsl:value-of select="normalize-space(string($agentemail))"/>
                </xsl:if>
                <xsl:text>&#10;      }</xsl:text>

            </xsl:when>
            <xsl:when test="string-length($organisationName) > 0 and string-length($personName) = 0">
                <xsl:text>&#10;  "@type":"Organization",&#10;</xsl:text>
                <xsl:if test="string-length($agentID) > 0">
                    <xsl:text>      "@id": "</xsl:text>
                    <xsl:value-of select="string($agentID)"/>
                    <xsl:text>",&#10;</xsl:text>
                </xsl:if>
                <xsl:text>      "name": "</xsl:text>
                <xsl:value-of select="string($organisationName)"/>
                <xsl:text>"</xsl:text>
                <!-- email address -->
                <xsl:if test="string-length($agentemail) > 0">
                    <xsl:text>,&#10;      "email": </xsl:text>
                    <xsl:value-of select="normalize-space(string($agentemail))"/>
                </xsl:if>
                <xsl:text>&#10;      }</xsl:text>

            </xsl:when>
            <xsl:when test="string-length($organisationName) > 0 and string-length($personName) > 0">
                <xsl:text>&#10;  "@type":"Person",&#10;</xsl:text>
                <xsl:if test="string-length($agentID) > 0">
                    <xsl:text>      "@id": "</xsl:text>
                    <xsl:value-of select="string($agentID)"/>
                    <xsl:text>",&#10;</xsl:text>
                </xsl:if>
                <xsl:text>      "name": "</xsl:text>
                <xsl:value-of select="string($personName)"/>
                <xsl:text>"</xsl:text>
                <!-- email address -->
                <xsl:if test="string-length($agentemail) > 0">
                    <xsl:text>,&#10;      "email": </xsl:text>
                    <xsl:value-of select="normalize-space(string($agentemail))"/>
                </xsl:if>
                <xsl:text>,&#10;     "affiliation": {&#10;</xsl:text>
                <xsl:text>&#10;  "@type":"Organization",&#10;</xsl:text>
                <xsl:text>      "name": "</xsl:text>
                <xsl:value-of select="string($organisationName)"/>
                <xsl:text>"}&#10;      }</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>&#10;  "@type": "Role",&#10;</xsl:text>
                <xsl:text>      "roleName": "</xsl:text>
                <xsl:value-of select="string($agentRole)"/>
                <xsl:text>"&#10;</xsl:text>
                <xsl:text>}&#10;</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:text>}</xsl:text>

    </xsl:template>

    <xsl:template name="distributions">
        <!-- this template generates content for a DataDownload element -->
        <xsl:param name="por"/>
        <!-- CI_OnlineResource -->
        <xsl:param name="pfor"/>
        <!-- MD_Format -->
        <xsl:param name="prp"/>
        <!-- CI_ResponsibleParty -->
        <!--distributorContacts map to provider.
            Formats to fileFormat,
        CI_onlineResurce.linkage.URL to URL, except if the CI_OnLineFunctionCode is 'download' then it maps to contentURL. -->
        <xsl:variable name="distIdentifier">
            <xsl:variable name="candidate1" select="$por/gmd:linkage/gmd:URL"/>
            <xsl:choose>
                <xsl:when test="starts-with(translate($candidate1, $uppercase, $smallcase), 'http')">
                    <xsl:value-of select="$candidate1"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of
                            select="
                            concat('urn:', normalize-space(translate($candidate1,
                            translate($candidate1, $allowedsymbols, ''), '')))"
                    />
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="distFormat">
            <xsl:if test="count($pfor/gmd:name) > 1">
                <xsl:text>[&#10;</xsl:text>
            </xsl:if>
            <xsl:for-each select="$pfor/gmd:name">
                <xsl:text>"</xsl:text>
                <xsl:if test="string-length(normalize-space(child::node()/text())) > 0">
                    <xsl:value-of select="normalize-space(child::node()/text())"/>
                </xsl:if>
                <xsl:if
                        test="string-length(following-sibling::gmd:version/child::node()/text()) > 0">
                    <xsl:value-of
                            select="concat(' v.', normalize-space(following-sibling::gmd:version/child::node()/text()))"
                    />
                </xsl:if>
                <xsl:if
                        test="string-length(following-sibling::gmd:amendmentNumber/child::node()/text()) > 0">
                    <xsl:value-of
                            select="concat(' amendment:', normalize-space(following-sibling::gmd:amendmentNumber/child::node()/text()))"
                    />
                </xsl:if>
                <xsl:text>"</xsl:text>

                <!-- comma if there are more formats -->
                <!-- in default java transformer, child::gmd:MD_Format/gmd:name produces a comma when it should not... but not always -->
                <!--       <xsl:if
                          test="parent::node()/parent::node()/following-sibling::node()/child::gmd:MD_Format/gmd:name"
                          ><xsl:text>, </xsl:text></xsl:if>
             -->
                <xsl:if
                        test="parent::node()/parent::node()/following-sibling::node()/child::*[local-name()='MD_Format']/gmd:name"
                ><xsl:text>, </xsl:text>
                </xsl:if>
            </xsl:for-each>

            <xsl:if test="count($pfor/gmd:name) > 1">
                <xsl:text>]</xsl:text>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="distPublishDate" select="''"/>
        <xsl:variable name="accessURL">
            <xsl:variable name="candidate1" select="$por/gmd:linkage/gmd:URL"/>
            <xsl:choose>
                <xsl:when test="starts-with(translate($candidate1, $uppercase, $smallcase), 'http')">
                    <xsl:value-of select="$candidate1"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="''"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="distProvider">
            <xsl:if test="count($prp/gmd:role) > 1">
                <xsl:text>[&#10;</xsl:text>
            </xsl:if>
            <xsl:for-each select="$prp/self::node()">
                <xsl:apply-templates select=".">
                    <xsl:with-param name="role" select="'provider'"/>
                </xsl:apply-templates>
                <xsl:if
                        test="not($por/ancestor::gmd:distributorTransferOptions) and ancestor::gmd:distributor/following-sibling::gmd:distributor//gmd:CI_ResponsibleParty">
                    <xsl:text>,&#10;</xsl:text>
                </xsl:if>
            </xsl:for-each>

            <xsl:if test="count($prp/gmd:role) > 1">
                <xsl:text>]</xsl:text>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="distName" select="$por/gmd:name/gco:CharacterString"/>
        <xsl:variable name="distSize"
                      select="
                concat($por/parent::node()/preceding-sibling::gmd:transferSize/gco:Real, ' ',
                normalize-space($por/parent::node()/preceding-sibling::gmd:unitsOfDistribution/gco:CharacterString))"/>
        <xsl:variable name="distDescription">
            <!-- gather other useful content from the CI_OnlineResource element -->
            <xsl:text>"</xsl:text>
            <xsl:if
                    test="string-length(normalize-space($por/gmd:description/gco:CharacterString)) > 0">
                <xsl:value-of select="normalize-space($por/gmd:description/gco:CharacterString)"/>
                <xsl:text>.   </xsl:text>
            </xsl:if>
            <xsl:if test="string-length(normalize-space($por/gmd:protocol/gco:CharacterString)) > 0">
                <xsl:text>Service Protocol: </xsl:text>
                <xsl:value-of select="normalize-space($por/gmd:description/gco:CharacterString)"/>
                <xsl:text>.   </xsl:text>
            </xsl:if>
            <xsl:if
                    test="string-length(normalize-space($por/gmd:applicationProfile/gco:CharacterString)) > 0">
                <xsl:text>Application Profile: </xsl:text>
                <xsl:value-of
                        select="normalize-space($por/gmd:applicationProfile/gco:CharacterString)"/>
                <xsl:text>.   </xsl:text>
            </xsl:if>
            <xsl:if test="string-length(normalize-space($por/gmd:function//@codeListValue)) > 0">
                <xsl:text>Link Function: </xsl:text>
                <xsl:value-of select="normalize-space($por/gmd:function//@codeListValue)"/>
            </xsl:if>
            <xsl:if
                    test="
                    string-length(normalize-space($por/gmd:function/child::node()/text())) > 0
                    and (normalize-space($por/gmd:function/child::node()/text()) != normalize-space($por/gmd:function//@codeListValue))">
                <xsl:text>--   </xsl:text>
                <xsl:value-of select="normalize-space($por/gmd:function/child::node()/text())"/>
                <xsl:text>.   </xsl:text>
            </xsl:if>
            <xsl:text>"</xsl:text>
        </xsl:variable>

        <xsl:text>{&#10;</xsl:text>

        <xsl:if test="$distIdentifier">
            <xsl:text>      "@id": "</xsl:text>
            <xsl:value-of select="$distIdentifier"/>
            <xsl:text>",&#10;</xsl:text>
        </xsl:if>

        <xsl:text>    "@type": "DataDownload",&#10;    "additionalType": "dcat:distribution",&#10;</xsl:text>
        <xsl:if test="$accessURL">
            <xsl:text>      "dcat:accessURL": "</xsl:text>
            <xsl:value-of select="$accessURL"/>
            <xsl:text>",&#10;</xsl:text>

            <xsl:text>      "url": "</xsl:text>
            <xsl:value-of select="$accessURL"/>
            <xsl:text>"</xsl:text>
        </xsl:if>
        <xsl:if test="string-length($distName) > 0">
            <xsl:text>,&#10;      "name": "</xsl:text>
            <xsl:value-of select="normalize-space($distName)"/>
            <xsl:if test="string-length($accessURL) = 0">
                <xsl:value-of
                        select="'. Invalid URL provided in original metadata, see the @id string'"/>
            </xsl:if>
            <xsl:text>"</xsl:text>
        </xsl:if>
        <xsl:if test="string-length($distDescription) > 0">
            <xsl:text>,&#10;      "description": </xsl:text>
            <xsl:value-of select="normalize-space($distDescription)"/>
        </xsl:if>
        <xsl:if test="string-length(string($distProvider)) > 0">
            <xsl:text>,&#10;      "provider": </xsl:text>
            <xsl:value-of select="$distProvider"/>
        </xsl:if>
        <xsl:if test="string-length(normalize-space($distFormat)) > 0">
            <xsl:text>,&#10;      "fileFormat": </xsl:text>
            <xsl:value-of select="$distFormat"/>
        </xsl:if>
        <xsl:if test="string-length(normalize-space($distSize)) > 0">
            <xsl:text>,&#10;      "contentSize": "</xsl:text>
            <xsl:value-of select="$distSize"/>
            <xsl:text>"</xsl:text>
        </xsl:if>

        <xsl:if test="string-length(normalize-space($distPublishDate)) > 0">
            <xsl:text>,&#10;      "datePublished": "</xsl:text>
            <xsl:value-of select="$distPublishDate"/>
            <xsl:text>"</xsl:text>
        </xsl:if>

        <!-- more content might be available; insert here -->

        <xsl:text>}&#10;</xsl:text>

    </xsl:template>

    <!--variableMeasured not implemented here -->
    <xsl:template name="variableMeasured">
        <xsl:param name="variableList"/>
        <!-- returns JSON array of schema.org Person objects -->

        <xsl:text>[</xsl:text>
        <xsl:for-each select="$variableList/child::node()">
            <!-- handle each person in the list -->
            <xsl:variable name="variableID" select="'variableID'"/>
            <xsl:variable name="varDescription" select="'distFormat'"/>
            <xsl:variable name="varUnitsText" select="'distPublishDate'"/>
            <xsl:variable name="varURL" select="'distIdentifier'"/>
            <xsl:variable name="varName" select="'distIdentifier'"/>
            <xsl:variable name="varValue" select="'distIdentifier'"/>

            <xsl:text>{&#10;</xsl:text>

            <xsl:if test="$variableID">
                <xsl:text>      "@id": "</xsl:text>
                <xsl:value-of select="$variableID"/>
                <xsl:text>",&#10;</xsl:text>
            </xsl:if>

            <xsl:text>    "@type": "PropertyValue",&#10;    "additionalType": "earthcollab:Parameter",&#10;</xsl:text>

            <xsl:if test="$varDescription">
                <xsl:text>      "description": "</xsl:text>
                <xsl:value-of select="$varDescription"/>
                <xsl:text>",&#10;</xsl:text>
            </xsl:if>

            <xsl:text>      "unitText": "</xsl:text>
            <xsl:value-of select="$varUnitsText"/>
            <xsl:text>",&#10;</xsl:text>

            <xsl:if test="$varURL">
                <xsl:text>      "url": "</xsl:text>
                <xsl:value-of select="$varURL"/>
                <xsl:text>",&#10;</xsl:text>
            </xsl:if>

            <xsl:if test="$varValue">
                <xsl:text>      "value": "</xsl:text>
                <xsl:value-of select="$varValue"/>
                <xsl:text>"&#10;</xsl:text>
            </xsl:if>

            <!-- more content might be available; insert here -->

            <xsl:text>}&#10;</xsl:text>
        </xsl:for-each>

        <xsl:text>],&#10;</xsl:text>
    </xsl:template>


    <!--############################################################-->
    <!--## Template to replace strings                           ##-->
    <!--############################################################-->
    <!-- template from https://stackoverflow.com/questions/3067113/xslt-string-replace/3067130 -->
    <xsl:template name="string-replace-all">
        <xsl:param name="text"/>
        <xsl:param name="replace"/>
        <xsl:param name="by"/>
        <xsl:choose>
            <xsl:when test="$text = '' or $replace = '' or not($replace)">
                <!-- Prevent this routine from hanging -->
                <xsl:value-of select="$text"/>
            </xsl:when>
            <xsl:when test="contains($text, $replace)">
                <xsl:value-of select="substring-before($text, $replace)"/>
                <xsl:value-of select="$by"/>
                <xsl:call-template name="string-replace-all">
                    <xsl:with-param name="text" select="substring-after($text, $replace)"/>
                    <xsl:with-param name="replace" select="$replace"/>
                    <xsl:with-param name="by" select="$by"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$text"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


</xsl:stylesheet>
