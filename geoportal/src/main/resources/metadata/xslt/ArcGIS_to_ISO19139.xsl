<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" exclude-result-prefixes="esri res t msxsl" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:t="http://www.esri.com/xslt/translator" xmlns:msxsl="urn:schemas-microsoft-com:xslt" xmlns:esri="http://www.esri.com/metadata/" xmlns:res="http://www.esri.com/metadata/res/">
	<xsl:output method="xml" version="1.0" encoding="UTF-8" indent="yes" omit-xml-declaration="no"/>
	<xsl:variable name="LCASE" select="'abcdefghijklmnopqrstuvwxyz'" />
	<xsl:variable name="UCASE" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" />	
	<xsl:template match="/">
		<gmd:MD_Metadata xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
			<xsl:call-template name="metadata"/>
		</gmd:MD_Metadata>
	</xsl:template>
	<xsl:template name="metadata">
		<xsl:choose>
			<xsl:when test="(/metadata/mdFileID != '')">
				<xsl:for-each select="(/metadata/mdFileID[. != ''])[1]">
					<gmd:fileIdentifier xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						<gco:CharacterString>
							<xsl:value-of select="."/>
						</gco:CharacterString>
					</gmd:fileIdentifier>
				</xsl:for-each>
			</xsl:when>
			<xsl:when test="(not(/metadata/mdFileID) or (/metadata/mdFileID = '')) and (/metadata/Esri/PublishedDocID != '')">
				<xsl:for-each select="(/metadata/Esri/PublishedDocID[. != ''])[1]">
					<gmd:fileIdentifier xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						<gco:CharacterString>
							<xsl:value-of select="."/>
						</gco:CharacterString>
					</gmd:fileIdentifier>
				</xsl:for-each>
			</xsl:when>
			<xsl:when test="(/metadata/Esri/ArcGISProfile = 'NAP') and (not(/metadata/mdFileID) or (/metadata/mdFileID = '')) and (not(/metadata/Esri/PublishedDocID) or (/metadata/Esri/PublishedDocID != ''))">
				<gmd:fileIdentifier gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:when>
		</xsl:choose>
		<xsl:for-each select="(/metadata/mdLang/languageCode/@value[. != ''])[1]">
			<xsl:variable name="code">
				<xsl:call-template name="lang639_code"/>
			</xsl:variable>
			<xsl:choose>
				<xsl:when test="(/metadata/Esri/ArcGISProfile = 'INSPIRE')">
					<xsl:if test="($code != 'unknown') and ($code != '')">
						<xsl:variable name="codelistID">http://www.loc.gov/standards/iso639-2/php/code_list.php</xsl:variable>
						<xsl:variable name="codespace">ISO639-2</xsl:variable>
						<gmd:language xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gmd:LanguageCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
								<xsl:value-of select="$code"/>
							</gmd:LanguageCode>
						</gmd:language>
					</xsl:if>
				</xsl:when>
				<xsl:when test="($code = 'unknown')">
					<gmd:language xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						<gco:CharacterString>
							<xsl:value-of select="."/>
						</gco:CharacterString>
					</gmd:language>
				</xsl:when>
				<xsl:when test="($code != 'unknown') and ($code != '')">
					<xsl:variable name="codelistID">http://www.loc.gov/standards/iso639-2/php/code_list.php</xsl:variable>
					<xsl:variable name="codespace">ISO639-2</xsl:variable>
					<gmd:language xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						<gmd:LanguageCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
							<xsl:value-of select="$code"/>
						</gmd:LanguageCode>
					</gmd:language>
				</xsl:when>
			</xsl:choose>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and (not(/metadata/mdLang/languageCode/@value) or (/metadata/mdLang/languageCode/@value = ''))">
			<gmd:language gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		</xsl:if>
		<xsl:choose>
			<xsl:when test="(/metadata/mdChar/CharSetCd/@value != '')">
				<xsl:for-each select="(/metadata/mdChar/CharSetCd/@value[. != ''])[1]">
					<xsl:variable name="code">
						<xsl:call-template name="charSetCode"/>
					</xsl:variable>
					<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_CharacterSetCode</xsl:variable>
					<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
					<xsl:if test="($code != '')">
						<gmd:characterSet xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gmd:MD_CharacterSetCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
								<xsl:value-of select="$code"/>
							</gmd:MD_CharacterSetCode>
						</gmd:characterSet>
					</xsl:if>
				</xsl:for-each>
			</xsl:when>
			<xsl:when test="(not(/metadata/mdChar/CharSetCd/@value) or (/metadata/mdChar/CharSetCd/@value = ''))">
				<gmd:characterSet xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:variable name="code">utf8</xsl:variable>
					<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_CharacterSetCode</xsl:variable>
					<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
					<gmd:MD_CharacterSetCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_CharacterSetCode>
				</gmd:characterSet>
			</xsl:when>
		</xsl:choose>
		<xsl:for-each select="(/metadata/mdParentID[. != ''])[1]">
			<gmd:parentIdentifier xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:parentIdentifier>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(/metadata/mdHrLv/ScopeCd/@value != '')">
				<xsl:for-each select="/metadata/mdHrLv/ScopeCd/@value[. != '']">
					<xsl:variable name="code">
						<xsl:call-template name="scopeCode"/>
					</xsl:variable>
					<xsl:variable name="codelistID">
						<xsl:call-template name="scopeCodeList"/>
					</xsl:variable>
					<xsl:variable name="codespace">
						<xsl:call-template name="scopeCodeSpace"/>
					</xsl:variable>
					<xsl:if test="($code != '')">
						<gmd:hierarchyLevel xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gmd:MD_ScopeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
								<xsl:value-of select="$code"/>
							</gmd:MD_ScopeCode>
						</gmd:hierarchyLevel>
					</xsl:if>
				</xsl:for-each>
			</xsl:when>
			<xsl:when test="(not(/metadata/mdHrLv/ScopeCd/@value) or (/metadata/mdHrLv/ScopeCd/@value = '')) and (/metadata/dataIdInfo[svType/genericName or svTypeVer or svAccProps or svExt or svCouplRes or svCouplType or svOper or svOperOn])">
				<gmd:hierarchyLevel xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:variable name="code">service</xsl:variable>
					<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ScopeCode</xsl:variable>
					<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
					<gmd:MD_ScopeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_ScopeCode>
				</gmd:hierarchyLevel>
			</xsl:when>
			<xsl:when test="not(/metadata/mdHrLv/ScopeCd/@value) or (/metadata/mdHrLv/ScopeCd/@value = '')">
				<gmd:hierarchyLevel xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:variable name="code">dataset</xsl:variable>
					<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ScopeCode</xsl:variable>
					<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
					<gmd:MD_ScopeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_ScopeCode>
				</gmd:hierarchyLevel>
			</xsl:when>
		</xsl:choose>
		<xsl:if test="not(/metadata/Esri/ArcGISProfile = 'NAP')">
			<xsl:choose>
				<xsl:when test="(/metadata/mdHrLvName != '')">
					<xsl:for-each select="/metadata/mdHrLvName[. != '']">
						<gmd:hierarchyLevelName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:CharacterString>
								<xsl:value-of select="."/>
							</gco:CharacterString>
						</gmd:hierarchyLevelName>
					</xsl:for-each>
				</xsl:when>
				<xsl:when test="(not(/metadata/mdHrLvName) or (/metadata/mdHrLvName = '')) and (/metadata/dataIdInfo[svType/genericName or svTypeVer or svAccProps or svExt or svCouplRes or svCouplType or svOper or svOperOn])">
					<gmd:hierarchyLevelName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						<xsl:variable name="value">service</xsl:variable>
						<gco:CharacterString>
							<xsl:value-of select="$value"/>
						</gco:CharacterString>
					</gmd:hierarchyLevelName>
				</xsl:when>
				<xsl:when test="not(/metadata/mdHrLvName) or (/metadata/mdHrLvName = '')">
					<gmd:hierarchyLevelName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						<xsl:variable name="value">dataset</xsl:variable>
						<gco:CharacterString>
							<xsl:value-of select="$value"/>
						</gco:CharacterString>
					</gmd:hierarchyLevelName>
				</xsl:when>
			</xsl:choose>
		</xsl:if>
		<xsl:choose>
			<xsl:when test="(count(/metadata/mdContact[(.//* != '') or (.//@* != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (/metadata/mdContact[(.//* != '') or (.//@* != '')]) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="/metadata/mdContact[(.//* != '') or (.//@* != '')]">
							<gmd:contact xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:CI_ResponsibleParty>
									<xsl:call-template name="CI_ResponsibleParty"/>
								</gmd:CI_ResponsibleParty>
							</gmd:contact>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:contact gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(/metadata/mdDateSt[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (/metadata/mdDateSt[. != '']) = 0"/>
					<xsl:when test="count (/metadata/mdDateSt[. != '']) &gt; 1">
						<xsl:for-each select="(/metadata/mdDateSt[. != ''])[1]">
							<xsl:call-template name="dateOrDateTimeElements">
								<xsl:with-param name="eleName" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">dateStamp</xsl:with-param>
							</xsl:call-template>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="/metadata/mdDateSt[. != '']">
							<xsl:call-template name="dateOrDateTimeElements">
								<xsl:with-param name="eleName" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">dateStamp</xsl:with-param>
							</xsl:call-template>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:dateStamp gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(/metadata/Esri/ArcGISProfile = 'NAP')">
				<gmd:metadataStandardName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gco:CharacterString>NAP - Metadata</gco:CharacterString>
				</gmd:metadataStandardName>
				<gmd:metadataStandardVersion xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gco:CharacterString>1.2</gco:CharacterString>
				</gmd:metadataStandardVersion>
			</xsl:when>
			<xsl:when test="(/metadata/Esri/ArcGISProfile = 'INSPIRE')">
				<gmd:metadataStandardName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gco:CharacterString>INSPIRE Metadata Implementing Rules: Technical Guidelines based on EN ISO 19115 and EN ISO 19119</gco:CharacterString>
				</gmd:metadataStandardName>
				<gmd:metadataStandardVersion xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gco:CharacterString>V. 1.2</gco:CharacterString>
				</gmd:metadataStandardVersion>
			</xsl:when>
			<xsl:otherwise>
				<gmd:metadataStandardName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gco:CharacterString>ISO 19139 Geographic Information - Metadata - Implementation Specification</gco:CharacterString>
				</gmd:metadataStandardName>
				<gmd:metadataStandardVersion xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gco:CharacterString>2007</gco:CharacterString>
				</gmd:metadataStandardVersion>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(/metadata/dataSetURI[. != ''])[1]">
			<gmd:dataSetURI xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:dataSetURI>
		</xsl:for-each>
		<xsl:for-each select="/metadata/Esri/locales/locale[@language != '']">
			<gmd:locale xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:PT_Locale>
					<xsl:call-template name="PT_Locale"/>
				</gmd:PT_Locale>
			</gmd:locale>
		</xsl:for-each>
		<xsl:for-each select="/metadata/spatRepInfo/*[not(name() = 'Indref') and (.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:spatialRepresentationInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:choose>
					<xsl:when test="(name() = 'GridSpatRep')">
						<gmd:MD_GridSpatialRepresentation>
							<xsl:call-template name="MD_GridSpatialRepresentation"/>
						</gmd:MD_GridSpatialRepresentation>
					</xsl:when>
					<xsl:when test="(name() = 'Georect')">
						<gmd:MD_Georectified>
							<xsl:call-template name="MD_Georectified"/>
						</gmd:MD_Georectified>
					</xsl:when>
					<xsl:when test="(name() = 'Georef')">
						<gmd:MD_Georeferenceable>
							<xsl:call-template name="MD_Georeferenceable"/>
						</gmd:MD_Georeferenceable>
					</xsl:when>
					<xsl:when test="(name() = 'VectSpatRep')">
						<gmd:MD_VectorSpatialRepresentation>
							<xsl:call-template name="MD_VectorSpatialRepresentation"/>
						</gmd:MD_VectorSpatialRepresentation>
					</xsl:when>
					<xsl:when test="(/metadata/Esri/ArcGISProfile = 'NAP') and (name() != 'GridSpatRep') and (name() != 'Georect') and (name() != 'Georef') and (/metadata/dataIdInfo[1]/spatRpType/SpatRepTypCd/@value = '002')">
						<gmd:MD_GridSpatialRepresentation gco:nilReason="missing"/>
					</xsl:when>
					<xsl:when test="(/metadata/Esri/ArcGISProfile = 'NAP') and (name() != 'VectSpatRep') and (/metadata/dataIdInfo[1]/spatRpType/SpatRepTypCd/@value = '001')">
						<gmd:MD_VectorSpatialRepresentation gco:nilReason="missing"/>
					</xsl:when>
				</xsl:choose>
			</gmd:spatialRepresentationInfo>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and (/metadata/dataIdInfo[1]/spatRpType/SpatRepTypCd/@value = '002') and (not(/metadata/spatRepInfo) or (/metadata/spatRepInfo = ''))">
			<gmd:spatialRepresentationInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_GridSpatialRepresentation gco:nilReason="missing"/>
			</gmd:spatialRepresentationInfo>
		</xsl:if>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and (/metadata/dataIdInfo[1]/spatRpType/SpatRepTypCd/@value = '001') and (not(/metadata/spatRepInfo) or (/metadata/spatRepInfo = ''))">
			<gmd:spatialRepresentationInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_VectorSpatialRepresentation gco:nilReason="missing"/>
			</gmd:spatialRepresentationInfo>
		</xsl:if>
		<xsl:for-each select="/metadata/refSysInfo/RefSystem/refSysID[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:referenceSystemInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_ReferenceSystem>
					<gmd:referenceSystemIdentifier>
						<gmd:RS_Identifier>
							<xsl:call-template name="RS_Identifier"/>
						</gmd:RS_Identifier>
					</gmd:referenceSystemIdentifier>
				</gmd:MD_ReferenceSystem>
			</gmd:referenceSystemInfo>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and (not(/metadata/refSysInfo/RefSystem/refSysID) or (/metadata/refSysInfo/RefSystem/refSysID = '')) and ((/metadata/dataIdInfo[1]/spatRpType/SpatRepTypCd/@value = '001') or (/metadata/dataIdInfo[1]/spatRpType/SpatRepTypCd/@value = '002') or (/metadata/dataIdInfo[1]/spatRpType/SpatRepTypCd/@value = '004'))">
			<gmd:referenceSystemInfo gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		</xsl:if>
		<xsl:if test="not(/metadata/Esri/ArcGISProfile = 'NAP')">
			<xsl:for-each select="/metadata/mdExtInfo[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
				<gmd:metadataExtensionInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_MetadataExtensionInformation>
						<xsl:call-template name="MD_MetadataExtensionInformation"/>
					</gmd:MD_MetadataExtensionInformation>
				</gmd:metadataExtensionInfo>
			</xsl:for-each>
		</xsl:if>
		<xsl:choose>
			<xsl:when test="(count(/metadata/dataIdInfo[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (/metadata/dataIdInfo[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="/metadata/dataIdInfo[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
							<gmd:identificationInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<xsl:choose>
									<xsl:when test="((svType/genericName != '') or (svTypeVer != '') or (svAccProps != '') or (svExt != '') or (svCouplRes != '') or (svCouplType != '') or (svOper != '') or (svOperOn != ''))">
										<srv:SV_ServiceIdentification>
											<xsl:call-template name="SV_ServiceIdentification"/>
										</srv:SV_ServiceIdentification>
									</xsl:when>
									<xsl:otherwise>
										<gmd:MD_DataIdentification>
											<xsl:call-template name="MD_DataIdentification"/>
										</gmd:MD_DataIdentification>
									</xsl:otherwise>
								</xsl:choose>
							</gmd:identificationInfo>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:identificationInfo gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="/metadata/contInfo[(CovDesc//* != '') or (ImgDesc//* != '') or (FetCatDesc//* != '')]">
			<gmd:contentInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:choose>
					<xsl:when test="*[name() = 'CovDesc']">
						<gmd:MD_CoverageDescription>
							<xsl:choose>
								<xsl:when test="count (CovDesc) = 0"/>
								<xsl:when test="count (CovDesc) &gt; 1">
									<xsl:for-each select="(CovDesc)[1]">
										<xsl:call-template name="MD_CoverageDescription"/>
									</xsl:for-each>
								</xsl:when>
								<xsl:otherwise>
									<xsl:for-each select="CovDesc">
										<xsl:call-template name="MD_CoverageDescription"/>
									</xsl:for-each>
								</xsl:otherwise>
							</xsl:choose>
						</gmd:MD_CoverageDescription>
					</xsl:when>
					<xsl:when test="(name(*) = 'ImgDesc')">
						<gmd:MD_ImageDescription>
							<xsl:choose>
								<xsl:when test="count (ImgDesc) = 0"/>
								<xsl:when test="count (ImgDesc) &gt; 1">
									<xsl:for-each select="(ImgDesc)[1]">
										<xsl:call-template name="MD_ImageDescription"/>
									</xsl:for-each>
								</xsl:when>
								<xsl:otherwise>
									<xsl:for-each select="ImgDesc">
										<xsl:call-template name="MD_ImageDescription"/>
									</xsl:for-each>
								</xsl:otherwise>
							</xsl:choose>
						</gmd:MD_ImageDescription>
					</xsl:when>
					<xsl:when test="(name(*) = 'FetCatDesc')">
						<gmd:MD_FeatureCatalogueDescription>
							<xsl:choose>
								<xsl:when test="count (FetCatDesc) = 0"/>
								<xsl:when test="count (FetCatDesc) &gt; 1">
									<xsl:for-each select="(FetCatDesc)[1]">
										<xsl:call-template name="MD_FeatureCatalogueDescription"/>
									</xsl:for-each>
								</xsl:when>
								<xsl:otherwise>
									<xsl:for-each select="FetCatDesc">
										<xsl:call-template name="MD_FeatureCatalogueDescription"/>
									</xsl:for-each>
								</xsl:otherwise>
							</xsl:choose>
						</gmd:MD_FeatureCatalogueDescription>
					</xsl:when>
				</xsl:choose>
			</gmd:contentInfo>
		</xsl:for-each>
		<xsl:for-each select="(/metadata/distInfo[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:distributionInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Distribution>
					<xsl:call-template name="MD_Distribution"/>
				</gmd:MD_Distribution>
			</gmd:distributionInfo>
		</xsl:for-each>
		<xsl:for-each select="/metadata/dqInfo[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:dataQualityInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:DQ_DataQuality>
					<xsl:call-template name="DQ_DataQuality"/>
				</gmd:DQ_DataQuality>
			</gmd:dataQualityInfo>
		</xsl:for-each>
		<xsl:if test="/metadata/porCatInfo/portCatCit[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:portrayalCatalogueInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_PortrayalCatalogueReference>
					<xsl:for-each select="/metadata/porCatInfo/portCatCit[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
						<gmd:portrayalCatalogueCitation>
							<gmd:CI_Citation>
								<xsl:call-template name="CI_Citation"/>
							</gmd:CI_Citation>
						</gmd:portrayalCatalogueCitation>
					</xsl:for-each>
				</gmd:MD_PortrayalCatalogueReference>
			</gmd:portrayalCatalogueInfo>
		</xsl:if>
		<xsl:for-each select="/metadata/mdConst/Consts[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:metadataConstraints xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Constraints>
					<xsl:call-template name="MD_Constraints"/>
				</gmd:MD_Constraints>
			</gmd:metadataConstraints>
		</xsl:for-each>
		<xsl:for-each select="/metadata/mdConst/LegConsts[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:metadataConstraints xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_LegalConstraints>
					<xsl:call-template name="MD_LegalConstraints"/>
				</gmd:MD_LegalConstraints>
			</gmd:metadataConstraints>
		</xsl:for-each>
		<xsl:for-each select="/metadata/mdConst/SecConsts[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:metadataConstraints xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_SecurityConstraints>
					<xsl:call-template name="MD_SecurityConstraints"/>
				</gmd:MD_SecurityConstraints>
			</gmd:metadataConstraints>
		</xsl:for-each>
		<xsl:for-each select="/metadata/appSchInfo[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:applicationSchemaInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_ApplicationSchemaInformation>
					<xsl:call-template name="MD_ApplicationSchemaInformation"/>
				</gmd:MD_ApplicationSchemaInformation>
			</gmd:applicationSchemaInfo>
		</xsl:for-each>
		<xsl:for-each select="(/metadata/mdMaint[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:metadataMaintenance xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_MaintenanceInformation>
					<xsl:call-template name="MD_MaintenanceInformation"/>
				</gmd:MD_MaintenanceInformation>
			</gmd:metadataMaintenance>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="PT_Locale">
		<xsl:choose>
			<xsl:when test="(count(@language[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (@language[. != '']) = 0"/>
					<xsl:when test="count (@language[. != '']) &gt; 1">
						<xsl:for-each select="(@language[. != ''])[1]">
							<xsl:variable name="code">
								<xsl:call-template name="lang639_code"/>
							</xsl:variable>
							<xsl:choose>
								<xsl:when test="($code = 'unknown')">
									<gmd:languageCode xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
										<gmd:LanguageCode gco:nilReason="unknown"/>
									</gmd:languageCode>
								</xsl:when>
								<xsl:when test="($code != 'unknown') and ($code != '')">
									<xsl:variable name="codelistID">http://www.loc.gov/standards/iso639-2/php/code_list.php</xsl:variable>
									<xsl:variable name="codespace">ISO639-2</xsl:variable>
									<gmd:languageCode xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
										<gmd:LanguageCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
											<xsl:value-of select="$code"/>
										</gmd:LanguageCode>
									</gmd:languageCode>
								</xsl:when>
							</xsl:choose>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="@language[. != '']">
							<xsl:variable name="code">
								<xsl:call-template name="lang639_code"/>
							</xsl:variable>
							<xsl:choose>
								<xsl:when test="($code = 'unknown')">
									<gmd:languageCode xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
										<gmd:LanguageCode gco:nilReason="unknown"/>
									</gmd:languageCode>
								</xsl:when>
								<xsl:when test="($code != 'unknown') and ($code != '')">
									<xsl:variable name="codelistID">http://www.loc.gov/standards/iso639-2/php/code_list.php</xsl:variable>
									<xsl:variable name="codespace">ISO639-2</xsl:variable>
									<gmd:languageCode xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
										<gmd:LanguageCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
											<xsl:value-of select="$code"/>
										</gmd:LanguageCode>
									</gmd:languageCode>
								</xsl:when>
							</xsl:choose>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:languageCode gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(@country[. != ''])[1]">
			<xsl:variable name="code">
				<xsl:call-template name="cntry3166_code"/>
			</xsl:variable>
			<xsl:choose>
				<xsl:when test="($code = 'unknown')">
					<gmd:country xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						<gmd:Country gco:nilReason="unknown"/>
					</gmd:country>
				</xsl:when>
				<xsl:when test="($code != 'unknown') and ($code != '')">
					<xsl:variable name="codelistID">http://www.iso.org/iso/country_codes/iso_3166_code_lists.htm</xsl:variable>
					<xsl:variable name="codespace">ISO3166-1</xsl:variable>
					<gmd:country xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						<gmd:Country codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
							<xsl:value-of select="$code"/>
						</gmd:Country>
					</gmd:country>
				</xsl:when>
			</xsl:choose>
		</xsl:for-each>
		<gmd:characterEncoding xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
			<xsl:variable name="code">utf8</xsl:variable>
			<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_CharacterSetCode</xsl:variable>
			<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
			<gmd:MD_CharacterSetCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
				<xsl:value-of select="$code"/>
			</gmd:MD_CharacterSetCode>
		</gmd:characterEncoding>
	</xsl:template>
	<xsl:template name="MD_Constraints">
		<xsl:for-each select="useLimit[. != '']">
			<gmd:useLimitation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:call-template name="fixHTML">
						<xsl:with-param name="text">
							<xsl:value-of select="."/>
						</xsl:with-param>
					</xsl:call-template>
				</gco:CharacterString>
			</gmd:useLimitation>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_LegalConstraints">
		<xsl:for-each select="useLimit[. != '']">
			<gmd:useLimitation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:useLimitation>
		</xsl:for-each>
		<xsl:for-each select="accessConsts/RestrictCd/@value[. != '']">
			<xsl:variable name="code">
				<xsl:call-template name="restrictCode"/>
			</xsl:variable>
			<xsl:variable name="codelistID">
				<xsl:call-template name="restrictCodeList"/>
			</xsl:variable>
			<xsl:variable name="codespace">
				<xsl:call-template name="restrictCodeSpace"/>
			</xsl:variable>
			<xsl:if test="($code != '')">
				<gmd:accessConstraints xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_RestrictionCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_RestrictionCode>
				</gmd:accessConstraints>
			</xsl:if>
		</xsl:for-each>
		<xsl:for-each select="useConsts/RestrictCd/@value[. != '']">
			<xsl:variable name="code">
				<xsl:call-template name="restrictCode"/>
			</xsl:variable>
			<xsl:variable name="codelistID">
				<xsl:call-template name="restrictCodeList"/>
			</xsl:variable>
			<xsl:variable name="codespace">
				<xsl:call-template name="restrictCodeSpace"/>
			</xsl:variable>
			<xsl:if test="($code != '')">
				<gmd:useConstraints xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_RestrictionCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_RestrictionCode>
				</gmd:useConstraints>
			</xsl:if>
		</xsl:for-each>
		<xsl:for-each select="othConsts[. != '']">
			<gmd:otherConstraints xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:otherConstraints>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_SecurityConstraints">
		<xsl:for-each select="useLimit[. != '']">
			<gmd:useLimitation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:useLimitation>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(class/ClasscationCd/@value[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (class/ClasscationCd/@value[. != '']) = 0"/>
					<xsl:when test="count (class/ClasscationCd/@value[. != '']) &gt; 1">
						<xsl:for-each select="(class/ClasscationCd/@value[. != ''])[1]">
							<xsl:variable name="code">
								<xsl:call-template name="classCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">
								<xsl:call-template name="classCodeList"/>
							</xsl:variable>
							<xsl:variable name="codespace">
								<xsl:call-template name="classCodeSpace"/>
							</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:classification xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_ClassificationCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_ClassificationCode>
								</gmd:classification>
							</xsl:if>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="class/ClasscationCd/@value[. != '']">
							<xsl:variable name="code">
								<xsl:call-template name="classCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">
								<xsl:call-template name="classCodeList"/>
							</xsl:variable>
							<xsl:variable name="codespace">
								<xsl:call-template name="classCodeSpace"/>
							</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:classification xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_ClassificationCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_ClassificationCode>
								</gmd:classification>
							</xsl:if>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:classification gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(userNote[. != ''])[1]">
			<gmd:userNote xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:userNote>
		</xsl:for-each>
		<xsl:for-each select="(classSys[. != ''])[1]">
			<gmd:classificationSystem xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:classificationSystem>
		</xsl:for-each>
		<xsl:for-each select="(handDesc[. != ''])[1]">
			<gmd:handlingDescription xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:handlingDescription>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_MaintenanceInformation">
		<xsl:choose>
			<xsl:when test="(/metadata/Esri/ArcGISProfile = 'NAP') and (usrDefFreq/duration != '')">
				<gmd:maintenanceAndUpdateFrequency xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:variable name="code">asNeeded</xsl:variable>
					<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode</xsl:variable>
					<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
					<gmd:MD_MaintenanceFrequencyCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_MaintenanceFrequencyCode>
				</gmd:maintenanceAndUpdateFrequency>
			</xsl:when>
			<xsl:when test="(count(maintFreq/MaintFreqCd/@value[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (maintFreq/MaintFreqCd/@value[. != '']) = 0"/>
					<xsl:when test="count (maintFreq/MaintFreqCd/@value[. != '']) &gt; 1">
						<xsl:for-each select="(maintFreq/MaintFreqCd/@value[. != ''])[1]">
							<xsl:variable name="code">
								<xsl:call-template name="maintFreqCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">
								<xsl:call-template name="maintFreqCodeList"/>
							</xsl:variable>
							<xsl:variable name="codespace">
								<xsl:call-template name="maintFreqCodeSpace"/>
							</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:maintenanceAndUpdateFrequency xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_MaintenanceFrequencyCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_MaintenanceFrequencyCode>
								</gmd:maintenanceAndUpdateFrequency>
							</xsl:if>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="maintFreq/MaintFreqCd/@value[. != '']">
							<xsl:variable name="code">
								<xsl:call-template name="maintFreqCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">
								<xsl:call-template name="maintFreqCodeList"/>
							</xsl:variable>
							<xsl:variable name="codespace">
								<xsl:call-template name="maintFreqCodeSpace"/>
							</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:maintenanceAndUpdateFrequency xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_MaintenanceFrequencyCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_MaintenanceFrequencyCode>
								</gmd:maintenanceAndUpdateFrequency>
							</xsl:if>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:maintenanceAndUpdateFrequency gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(dateNext[. != ''])[1]">
			<xsl:call-template name="dateOrDateTimeElements">
				<xsl:with-param name="eleName" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">dateOfNextUpdate</xsl:with-param>
			</xsl:call-template>
		</xsl:for-each>
		<xsl:for-each select="(usrDefFreq/duration[. != ''])[1]">
			<gmd:userDefinedMaintenanceFrequency xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gts:TM_PeriodDuration>
					<xsl:value-of select="."/>
				</gts:TM_PeriodDuration>
			</gmd:userDefinedMaintenanceFrequency>
		</xsl:for-each>
		<xsl:for-each select="maintScp/ScopeCd/@value[. != '']">
			<xsl:variable name="code">
				<xsl:call-template name="scopeCode"/>
			</xsl:variable>
			<xsl:variable name="codelistID">
				<xsl:call-template name="scopeCodeList"/>
			</xsl:variable>
			<xsl:variable name="codespace">
				<xsl:call-template name="scopeCodeSpace"/>
			</xsl:variable>
			<xsl:if test="($code != '')">
				<gmd:updateScope xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_ScopeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_ScopeCode>
				</gmd:updateScope>
			</xsl:if>
		</xsl:for-each>
		<xsl:for-each select="upScpDesc/*[. != '']">
			<gmd:updateScopeDescription xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_ScopeDescription>
					<xsl:call-template name="MD_ScopeDescription"/>
				</gmd:MD_ScopeDescription>
			</gmd:updateScopeDescription>
		</xsl:for-each>
		<xsl:for-each select="maintNote[. != '']">
			<gmd:maintenanceNote xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:maintenanceNote>
		</xsl:for-each>
		<xsl:for-each select="maintCont[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:contact xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_ResponsibleParty>
					<xsl:call-template name="CI_ResponsibleParty"/>
				</gmd:CI_ResponsibleParty>
			</gmd:contact>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_ScopeDescription">
		<xsl:if test="(name() = 'attribSet')">
			<gmd:attributes xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:attribute name="uuidref"><xsl:value-of select="."/></xsl:attribute>
			</gmd:attributes>
		</xsl:if>
		<xsl:if test="(name() = 'featSet')">
			<gmd:features xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:attribute name="uuidref"><xsl:value-of select="."/></xsl:attribute>
			</gmd:features>
		</xsl:if>
		<xsl:if test="(name() = 'featIntSet')">
			<gmd:featureInstances xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:attribute name="uuidref"><xsl:value-of select="."/></xsl:attribute>
			</gmd:featureInstances>
		</xsl:if>
		<xsl:if test="(name() = 'attribIntSet')">
			<gmd:attributeInstances xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:attribute name="uuidref"><xsl:value-of select="."/></xsl:attribute>
			</gmd:attributeInstances>
		</xsl:if>
		<xsl:if test="(name() = 'datasetSet')">
			<gmd:dataset xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:dataset>
		</xsl:if>
		<xsl:if test="(name() = 'other')">
			<gmd:other xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:other>
		</xsl:if>
	</xsl:template>
	<xsl:template name="MD_GridSpatialRepresentation">
		<xsl:choose>
			<xsl:when test="(count(numDims[(. &gt; 0) or (. &lt; 1)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (numDims[(. &gt; 0) or (. &lt; 1)]) = 0"/>
					<xsl:when test="count (numDims[(. &gt; 0) or (. &lt; 1)]) &gt; 1">
						<xsl:for-each select="(numDims[(. &gt; 0) or (. &lt; 1)])[1]">
							<gmd:numberOfDimensions xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Integer>
									<xsl:value-of select="round(.)"/>
								</gco:Integer>
							</gmd:numberOfDimensions>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="numDims[(. &gt; 0) or (. &lt; 1)]">
							<gmd:numberOfDimensions xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Integer>
									<xsl:value-of select="round(.)"/>
								</gco:Integer>
							</gmd:numberOfDimensions>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:numberOfDimensions gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="axisDimension[(. != '') or (@type != '')]">
			<gmd:axisDimensionProperties xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Dimension>
					<xsl:call-template name="MD_Dimension"/>
				</gmd:MD_Dimension>
			</gmd:axisDimensionProperties>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(cellGeo/CellGeoCd/@value[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (cellGeo/CellGeoCd/@value[. != '']) = 0"/>
					<xsl:when test="count (cellGeo/CellGeoCd/@value[. != '']) &gt; 1">
						<xsl:for-each select="(cellGeo/CellGeoCd/@value[. != ''])[1]">
							<xsl:variable name="code">
								<xsl:call-template name="cellGeoCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">
								<xsl:call-template name="cellGeoCodeList"/>
							</xsl:variable>
							<xsl:variable name="codespace">
								<xsl:call-template name="cellGeoCodeSpace"/>
							</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:cellGeometry xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_CellGeometryCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_CellGeometryCode>
								</gmd:cellGeometry>
							</xsl:if>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="cellGeo/CellGeoCd/@value[. != '']">
							<xsl:variable name="code">
								<xsl:call-template name="cellGeoCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">
								<xsl:call-template name="cellGeoCodeList"/>
							</xsl:variable>
							<xsl:variable name="codespace">
								<xsl:call-template name="cellGeoCodeSpace"/>
							</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:cellGeometry xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_CellGeometryCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_CellGeometryCode>
								</gmd:cellGeometry>
							</xsl:if>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:cellGeometry gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(tranParaAv[boolean(.)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (tranParaAv[boolean(.)]) = 0"/>
					<xsl:when test="count (tranParaAv[boolean(.)]) &gt; 1">
						<xsl:for-each select="(tranParaAv[boolean(.)])[1]">
							<gmd:transformationParameterAvailability xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</gmd:transformationParameterAvailability>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="tranParaAv[boolean(.)]">
							<gmd:transformationParameterAvailability xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</gmd:transformationParameterAvailability>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:transformationParameterAvailability gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="MD_Dimension">
		<xsl:choose>
			<xsl:when test="(count(@type[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (@type[. != '']) = 0"/>
					<xsl:when test="count (@type[. != '']) &gt; 1">
						<xsl:for-each select="(@type[. != ''])[1]">
							<xsl:variable name="code">
								<xsl:call-template name="dimensionCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_DimensionNameTypeCode</xsl:variable>
							<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:dimensionName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_DimensionNameTypeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_DimensionNameTypeCode>
								</gmd:dimensionName>
							</xsl:if>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="@type[. != '']">
							<xsl:variable name="code">
								<xsl:call-template name="dimensionCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_DimensionNameTypeCode</xsl:variable>
							<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:dimensionName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_DimensionNameTypeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_DimensionNameTypeCode>
								</gmd:dimensionName>
							</xsl:if>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:dimensionName gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(dimSize[(. &gt; 0) or (. &lt; 1)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (dimSize[(. &gt; 0) or (. &lt; 1)]) = 0"/>
					<xsl:when test="count (dimSize[(. &gt; 0) or (. &lt; 1)]) &gt; 1">
						<xsl:for-each select="(dimSize[(. &gt; 0) or (. &lt; 1)])[1]">
							<gmd:dimensionSize xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Integer>
									<xsl:value-of select="round(.)"/>
								</gco:Integer>
							</gmd:dimensionSize>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="dimSize[(. &gt; 0) or (. &lt; 1)]">
							<gmd:dimensionSize xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Integer>
									<xsl:value-of select="round(.)"/>
								</gco:Integer>
							</gmd:dimensionSize>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:dimensionSize gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(dimResol/value[(. != '') or (@uom != '')])[1]">
			<gmd:resolution xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Measure>
					<xsl:if test="(@uom != '')">
						<xsl:attribute name="uom"><xsl:value-of select="@uom"/></xsl:attribute>
					</xsl:if>
					<xsl:value-of select="."/>
				</gco:Measure>
			</gmd:resolution>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_Georectified">
		<xsl:call-template name="MD_GridSpatialRepresentation"/>
		<xsl:choose>
			<xsl:when test="(count(chkPtAv[boolean(.)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (chkPtAv[boolean(.)]) = 0"/>
					<xsl:when test="count (chkPtAv[boolean(.)]) &gt; 1">
						<xsl:for-each select="(chkPtAv[boolean(.)])[1]">
							<gmd:checkPointAvailability xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</gmd:checkPointAvailability>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="chkPtAv[boolean(.)]">
							<gmd:checkPointAvailability xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</gmd:checkPointAvailability>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:checkPointAvailability gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(chkPtDesc[. != ''])[1]">
			<gmd:checkPointDescription xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:checkPointDescription>
		</xsl:for-each>
		<xsl:for-each select="cornerPts[pos != '']">
			<gmd:cornerPoints xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gml:Point>
					<xsl:call-template name="GML_StandardProperties"/>
					<xsl:for-each select="pos[. != '']">
						<gml:pos>
							<xsl:value-of select="."/>
						</gml:pos>
					</xsl:for-each>
				</gml:Point>
			</gmd:cornerPoints>
		</xsl:for-each>
		<xsl:for-each select="(centerPt[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:centerPoint xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gml:Point>
					<xsl:call-template name="GML_StandardProperties"/>
					<xsl:for-each select="pos[. != '']">
						<gml:pos>
							<xsl:value-of select="."/>
						</gml:pos>
					</xsl:for-each>
				</gml:Point>
			</gmd:centerPoint>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(ptInPixel/PixOrientCd/@value[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (ptInPixel/PixOrientCd/@value[. != '']) = 0"/>
					<xsl:when test="count (ptInPixel/PixOrientCd/@value[. != '']) &gt; 1">
						<xsl:for-each select="(ptInPixel/PixOrientCd/@value[. != ''])[1]">
							<gmd:pointInPixel xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<xsl:variable name="code">
									<xsl:call-template name="pixOrientCode"/>
								</xsl:variable>
								<gmd:MD_PixelOrientationCode>
									<xsl:value-of select="$code"/>
								</gmd:MD_PixelOrientationCode>
							</gmd:pointInPixel>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="ptInPixel/PixOrientCd/@value[. != '']">
							<gmd:pointInPixel xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<xsl:variable name="code">
									<xsl:call-template name="pixOrientCode"/>
								</xsl:variable>
								<gmd:MD_PixelOrientationCode>
									<xsl:value-of select="$code"/>
								</gmd:MD_PixelOrientationCode>
							</gmd:pointInPixel>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:pointInPixel gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(transDimDesc[. != ''])[1]">
			<gmd:transformationDimensionDescription xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:transformationDimensionDescription>
		</xsl:for-each>
		<xsl:for-each select="transDimMap[. != '']">
			<gmd:transformationDimensionMapping xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:transformationDimensionMapping>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_Georeferenceable">
		<xsl:call-template name="MD_GridSpatialRepresentation"/>
		<xsl:choose>
			<xsl:when test="(count(ctrlPtAv[boolean(.)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (ctrlPtAv[boolean(.)]) = 0"/>
					<xsl:when test="count (ctrlPtAv[boolean(.)]) &gt; 1">
						<xsl:for-each select="(ctrlPtAv[boolean(.)])[1]">
							<gmd:controlPointAvailability xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</gmd:controlPointAvailability>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="ctrlPtAv[boolean(.)]">
							<gmd:controlPointAvailability xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</gmd:controlPointAvailability>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:controlPointAvailability gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(orieParaAv[boolean(.)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (orieParaAv[boolean(.)]) = 0"/>
					<xsl:when test="count (orieParaAv[boolean(.)]) &gt; 1">
						<xsl:for-each select="(orieParaAv[boolean(.)])[1]">
							<gmd:orientationParameterAvailability xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</gmd:orientationParameterAvailability>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="orieParaAv[boolean(.)]">
							<gmd:orientationParameterAvailability xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</gmd:orientationParameterAvailability>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:orientationParameterAvailability gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(orieParaDs[. != ''])[1]">
			<gmd:orientationParameterDescription xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:orientationParameterDescription>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(georefPars[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (georefPars[. != '']) = 0"/>
					<xsl:when test="count (georefPars[. != '']) &gt; 1">
						<xsl:for-each select="(georefPars[. != ''])[1]">
							<gmd:georeferencedParameters xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Record>
									<xsl:value-of select="."/>
								</gco:Record>
							</gmd:georeferencedParameters>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="georefPars[. != '']">
							<gmd:georeferencedParameters xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Record>
									<xsl:value-of select="."/>
								</gco:Record>
							</gmd:georeferencedParameters>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:georeferencedParameters gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="paraCit[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:parameterCitation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Citation>
					<xsl:call-template name="CI_Citation"/>
				</gmd:CI_Citation>
			</gmd:parameterCitation>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_VectorSpatialRepresentation">
		<xsl:for-each select="(topLvl/TopoLevCd/@value[. != ''])[1]">
			<xsl:variable name="code">
				<xsl:call-template name="topologyCode"/>
			</xsl:variable>
			<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_TopologyLevelCode</xsl:variable>
			<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
			<xsl:if test="($code != '')">
				<gmd:topologyLevel xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_TopologyLevelCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_TopologyLevelCode>
				</gmd:topologyLevel>
			</xsl:if>
		</xsl:for-each>
		<xsl:for-each select="geometObjs[(geoObjCnt &gt; 0) or (geoObjTyp/GeoObjTypCd/@value != '')]">
			<gmd:geometricObjects xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_GeometricObjects>
					<xsl:call-template name="MD_GeometricObjects"/>
				</gmd:MD_GeometricObjects>
			</gmd:geometricObjects>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_GeometricObjects">
		<xsl:choose>
			<xsl:when test="(count(geoObjTyp/GeoObjTypCd/@value[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (geoObjTyp/GeoObjTypCd/@value[. != '']) = 0"/>
					<xsl:when test="count (geoObjTyp/GeoObjTypCd/@value[. != '']) &gt; 1">
						<xsl:for-each select="(geoObjTyp/GeoObjTypCd/@value[. != ''])[1]">
							<xsl:variable name="code">
								<xsl:call-template name="geomObjCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_GeometricObjectTypeCode</xsl:variable>
							<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:geometricObjectType xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_GeometricObjectTypeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_GeometricObjectTypeCode>
								</gmd:geometricObjectType>
							</xsl:if>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="geoObjTyp/GeoObjTypCd/@value[. != '']">
							<xsl:variable name="code">
								<xsl:call-template name="geomObjCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_GeometricObjectTypeCode</xsl:variable>
							<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:geometricObjectType xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_GeometricObjectTypeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_GeometricObjectTypeCode>
								</gmd:geometricObjectType>
							</xsl:if>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:geometricObjectType gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(geoObjCnt[(. &gt; 0)])[1]">
			<gmd:geometricObjectCount xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Integer>
					<xsl:value-of select="round(.)"/>
				</gco:Integer>
			</gmd:geometricObjectCount>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_MetadataExtensionInformation">
		<xsl:for-each select="(extOnRes[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:extensionOnLineResource xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_OnlineResource>
					<xsl:call-template name="CI_OnlineResource"/>
				</gmd:CI_OnlineResource>
			</gmd:extensionOnLineResource>
		</xsl:for-each>
		<xsl:for-each select="extEleInfo[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:extendedElementInformation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_ExtendedElementInformation>
					<xsl:call-template name="MD_ExtendedElementInformation"/>
				</gmd:MD_ExtendedElementInformation>
			</gmd:extendedElementInformation>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_ExtendedElementInformation">
		<xsl:choose>
			<xsl:when test="(count(extEleName[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (extEleName[. != '']) = 0"/>
					<xsl:when test="count (extEleName[. != '']) &gt; 1">
						<xsl:for-each select="(extEleName[. != ''])[1]">
							<gmd:name xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:name>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="extEleName[. != '']">
							<gmd:name xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:name>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:name gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(extShortName[. != ''])[1]">
			<gmd:shortName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:shortName>
		</xsl:for-each>
		<xsl:for-each select="(extDomCode[(. &gt; 0) or (. &lt; 1)])[1]">
			<gmd:domainCode xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Integer>
					<xsl:value-of select="round(.)"/>
				</gco:Integer>
			</gmd:domainCode>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(extEleDef[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (extEleDef[. != '']) = 0"/>
					<xsl:when test="count (extEleDef[. != '']) &gt; 1">
						<xsl:for-each select="(extEleDef[. != ''])[1]">
							<gmd:definition xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:definition>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="extEleDef[. != '']">
							<gmd:definition xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:definition>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:definition gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(extEleOb/ObCd/@value[. != ''])[1]">
			<gmd:obligation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:variable name="code">
					<xsl:call-template name="obligationCode"/>
				</xsl:variable>
				<gmd:MD_ObligationCode>
					<xsl:value-of select="$code"/>
				</gmd:MD_ObligationCode>
			</gmd:obligation>
		</xsl:for-each>
		<xsl:for-each select="(extEleCond[. != ''])[1]">
			<gmd:condition xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:condition>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(eleDataType/DatatypeCd/@value[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (eleDataType/DatatypeCd/@value[. != '']) = 0"/>
					<xsl:when test="count (eleDataType/DatatypeCd/@value[. != '']) &gt; 1">
						<xsl:for-each select="(eleDataType/DatatypeCd/@value[. != ''])[1]">
							<xsl:variable name="code">
								<xsl:call-template name="datatypeCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_DatatypeCode</xsl:variable>
							<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:dataType xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_DatatypeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_DatatypeCode>
								</gmd:dataType>
							</xsl:if>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="eleDataType/DatatypeCd/@value[. != '']">
							<xsl:variable name="code">
								<xsl:call-template name="datatypeCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_DatatypeCode</xsl:variable>
							<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:dataType xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_DatatypeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_DatatypeCode>
								</gmd:dataType>
							</xsl:if>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:dataType gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(extEleMxOc[. != ''])[1]">
			<gmd:maximumOccurrence xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:maximumOccurrence>
		</xsl:for-each>
		<xsl:for-each select="(extEleDomVal[. != ''])[1]">
			<gmd:domainValue xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:domainValue>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(extEleParEnt[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (extEleParEnt[. != '']) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="extEleParEnt[. != '']">
							<gmd:parentEntity xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:parentEntity>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:parentEntity gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(extEleRule[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (extEleRule[. != '']) = 0"/>
					<xsl:when test="count (extEleRule[. != '']) &gt; 1">
						<xsl:for-each select="(extEleRule[. != ''])[1]">
							<gmd:rule xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:rule>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="extEleRule[. != '']">
							<gmd:rule xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:rule>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:rule gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="extEleRat[. != '']">
			<gmd:rationale xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:rationale>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(extEleSrc[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (extEleSrc[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="extEleSrc[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
							<gmd:source xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:CI_ResponsibleParty>
									<xsl:call-template name="CI_ResponsibleParty"/>
								</gmd:CI_ResponsibleParty>
							</gmd:source>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:source gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="identificationInfo">
		<xsl:choose>
			<xsl:when test="(count(idCitation[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (idCitation[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) = 0"/>
					<xsl:when test="count (idCitation[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 1">
						<xsl:for-each select="(idCitation[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
							<gmd:citation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:CI_Citation>
									<xsl:call-template name="CI_Citation"/>
								</gmd:CI_Citation>
							</gmd:citation>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="idCitation[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
							<gmd:citation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:CI_Citation>
									<xsl:call-template name="CI_Citation"/>
								</gmd:CI_Citation>
							</gmd:citation>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:citation gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(idAbs[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (idAbs[. != '']) = 0"/>
					<xsl:when test="count (idAbs[. != '']) &gt; 1">
						<xsl:for-each select="(idAbs[. != ''])[1]">
							<xsl:choose>
								<xsl:when test="not(/metadata/Esri/locales/locale/idAbs) or (/metadata/Esri/locales/locale/idAbs = '')">
									<gmd:abstract xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
										<gco:CharacterString>
											<xsl:call-template name="fixHTML">
												<xsl:with-param name="text">
													<xsl:value-of select="."/>
												</xsl:with-param>
											</xsl:call-template>
										</gco:CharacterString>
									</gmd:abstract>
								</xsl:when>
								<xsl:otherwise>
									<xsl:choose>
										<xsl:when test="(name(..) = 'dataIdInfo')">
											<gmd:abstract xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
												<xsl:attribute name="xsi:type">PT_FreeText_PropertyType</xsl:attribute>
												<gco:CharacterString>
													<xsl:call-template name="fixHTML">
														<xsl:with-param name="text">
															<xsl:value-of select="."/>
														</xsl:with-param>
													</xsl:call-template>
												</gco:CharacterString>
												<gmd:PT_FreeText>
													<xsl:for-each select="/metadata/Esri/locales/locale[idAbs != '']">
														<gmd:textGroup>
															<gmd:LocalisedCharacterString>
																<xsl:variable name="locale">
																	<xsl:choose>
																		<xsl:when test="(@country != '')">
																			<xsl:value-of select="concat(@language, '-', @country)"/>
																		</xsl:when>
																		<xsl:otherwise>
																			<xsl:value-of select="@language"/>
																		</xsl:otherwise>
																	</xsl:choose>
																</xsl:variable>
																<xsl:attribute name="locale"><xsl:value-of select="$locale"/></xsl:attribute>
																<xsl:for-each select="(idAbs[. != ''])[1]">
																	<xsl:call-template name="fixHTML">
																		<xsl:with-param name="text">
																			<xsl:value-of select="."/>
																		</xsl:with-param>
																	</xsl:call-template>
																</xsl:for-each>
															</gmd:LocalisedCharacterString>
														</gmd:textGroup>
													</xsl:for-each>
												</gmd:PT_FreeText>
											</gmd:abstract>
										</xsl:when>
										<xsl:otherwise>
											<gmd:abstract xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
												<gco:CharacterString>
													<xsl:call-template name="fixHTML">
														<xsl:with-param name="text">
															<xsl:value-of select="."/>
														</xsl:with-param>
													</xsl:call-template>
												</gco:CharacterString>
											</gmd:abstract>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="idAbs[. != '']">
							<xsl:choose>
								<xsl:when test="not(/metadata/Esri/locales/locale/idAbs) or (/metadata/Esri/locales/locale/idAbs = '')">
									<gmd:abstract xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
										<gco:CharacterString>
											<xsl:call-template name="fixHTML">
												<xsl:with-param name="text">
													<xsl:value-of select="."/>
												</xsl:with-param>
											</xsl:call-template>
										</gco:CharacterString>
									</gmd:abstract>
								</xsl:when>
								<xsl:otherwise>
									<xsl:choose>
										<xsl:when test="(name(..) = 'dataIdInfo')">
											<gmd:abstract xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
												<xsl:attribute name="xsi:type">PT_FreeText_PropertyType</xsl:attribute>
												<gco:CharacterString>
													<xsl:call-template name="fixHTML">
														<xsl:with-param name="text">
															<xsl:value-of select="."/>
														</xsl:with-param>
													</xsl:call-template>
												</gco:CharacterString>
												<gmd:PT_FreeText>
													<xsl:for-each select="/metadata/Esri/locales/locale[idAbs != '']">
														<gmd:textGroup>
															<gmd:LocalisedCharacterString>
																<xsl:variable name="locale">
																	<xsl:choose>
																		<xsl:when test="(@country != '')">
																			<xsl:value-of select="concat(@language, '-', @country)"/>
																		</xsl:when>
																		<xsl:otherwise>
																			<xsl:value-of select="@language"/>
																		</xsl:otherwise>
																	</xsl:choose>
																</xsl:variable>
																<xsl:attribute name="locale"><xsl:value-of select="$locale"/></xsl:attribute>
																<xsl:for-each select="(idAbs[. != ''])[1]">
																	<xsl:call-template name="fixHTML">
																		<xsl:with-param name="text">
																			<xsl:value-of select="."/>
																		</xsl:with-param>
																	</xsl:call-template>
																</xsl:for-each>
															</gmd:LocalisedCharacterString>
														</gmd:textGroup>
													</xsl:for-each>
												</gmd:PT_FreeText>
											</gmd:abstract>
										</xsl:when>
										<xsl:otherwise>
											<gmd:abstract xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
												<gco:CharacterString>
													<xsl:call-template name="fixHTML">
														<xsl:with-param name="text">
															<xsl:value-of select="."/>
														</xsl:with-param>
													</xsl:call-template>
												</gco:CharacterString>
											</gmd:abstract>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:abstract gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(idPurp[. != ''])[1]">
			<gmd:purpose xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:call-template name="fixHTML">
						<xsl:with-param name="text">
							<xsl:value-of select="."/>
						</xsl:with-param>
					</xsl:call-template>
				</gco:CharacterString>
			</gmd:purpose>
		</xsl:for-each>
		<xsl:for-each select="idCredit[. != '']">
			<gmd:credit xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:call-template name="fixHTML">
						<xsl:with-param name="text">
							<xsl:value-of select="."/>
						</xsl:with-param>
					</xsl:call-template>
				</gco:CharacterString>
			</gmd:credit>
		</xsl:for-each>
		<xsl:for-each select="idStatus/ProgCd/@value[. != '']">
			<xsl:variable name="code">
				<xsl:call-template name="progressCode"/>
			</xsl:variable>
			<xsl:variable name="codelistID">
				<xsl:call-template name="progressCodeList"/>
			</xsl:variable>
			<xsl:variable name="codespace">
				<xsl:call-template name="progressCodeSpace"/>
			</xsl:variable>
			<xsl:if test="($code != '')">
				<gmd:status xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_ProgressCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_ProgressCode>
				</gmd:status>
			</xsl:if>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and (not(idStatus/ProgCd/@value) or (idStatus/ProgCd/@value = ''))">
			<gmd:status gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		</xsl:if>
		<xsl:for-each select="idPoC[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:pointOfContact xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_ResponsibleParty>
					<xsl:call-template name="CI_ResponsibleParty"/>
				</gmd:CI_ResponsibleParty>
			</gmd:pointOfContact>
		</xsl:for-each>
		<xsl:for-each select="resMaint[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:resourceMaintenance xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_MaintenanceInformation>
					<xsl:call-template name="MD_MaintenanceInformation"/>
				</gmd:MD_MaintenanceInformation>
			</gmd:resourceMaintenance>
		</xsl:for-each>
		<xsl:for-each select="graphOver[(bgFileName != '') and (bgFileName != 'withheld') and not(contains(bgFileName, '\\')) and not(contains(bgFileName, ':\')) and not(contains(bgFileName, 'Server='))]">
			<gmd:graphicOverview xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_BrowseGraphic>
					<xsl:choose>
						<xsl:when test="(count(bgFileName[. != '']) &gt; 0)">
							<xsl:choose>
								<xsl:when test="count (bgFileName[. != '']) = 0"/>
								<xsl:when test="count (bgFileName[. != '']) &gt; 1">
									<xsl:for-each select="(bgFileName[. != ''])[1]">
										<gmd:fileName>
											<gco:CharacterString>
												<xsl:value-of select="."/>
											</gco:CharacterString>
										</gmd:fileName>
									</xsl:for-each>
								</xsl:when>
								<xsl:otherwise>
									<xsl:for-each select="bgFileName[. != '']">
										<gmd:fileName>
											<gco:CharacterString>
												<xsl:value-of select="."/>
											</gco:CharacterString>
										</gmd:fileName>
									</xsl:for-each>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:when>
						<xsl:otherwise>
							<gmd:fileName gco:nilReason="missing"/>
						</xsl:otherwise>
					</xsl:choose>
					<xsl:for-each select="(bgFileDesc[. != ''])[1]">
						<gmd:fileDescription>
							<gco:CharacterString>
								<xsl:value-of select="."/>
							</gco:CharacterString>
						</gmd:fileDescription>
					</xsl:for-each>
					<xsl:for-each select="(bgFileType[. != ''])[1]">
						<gmd:fileType>
							<gco:CharacterString>
								<xsl:value-of select="."/>
							</gco:CharacterString>
						</gmd:fileType>
					</xsl:for-each>
				</gmd:MD_BrowseGraphic>
			</gmd:graphicOverview>
		</xsl:for-each>
		<xsl:if test="not(/metadata/Esri/ArcGISProfile = 'NAP')">
			<xsl:for-each select="dsFormat[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
				<gmd:resourceFormat xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_Format>
						<xsl:call-template name="MD_Format"/>
					</gmd:MD_Format>
				</gmd:resourceFormat>
			</xsl:for-each>
		</xsl:if>
		<xsl:for-each select="discKeys[keyword != '']">
			<gmd:descriptiveKeywords xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Keywords>
					<xsl:call-template name="MD_Keywords">
						<xsl:with-param name="type">discipline</xsl:with-param>
					</xsl:call-template>
				</gmd:MD_Keywords>
			</gmd:descriptiveKeywords>
		</xsl:for-each>
		<xsl:for-each select="placeKeys[keyword != '']">
			<gmd:descriptiveKeywords xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Keywords>
					<xsl:call-template name="MD_Keywords">
						<xsl:with-param name="type">place</xsl:with-param>
					</xsl:call-template>
				</gmd:MD_Keywords>
			</gmd:descriptiveKeywords>
		</xsl:for-each>
		<xsl:for-each select="stratKeys[keyword != '']">
			<gmd:descriptiveKeywords xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Keywords>
					<xsl:call-template name="MD_Keywords">
						<xsl:with-param name="type">stratum</xsl:with-param>
					</xsl:call-template>
				</gmd:MD_Keywords>
			</gmd:descriptiveKeywords>
		</xsl:for-each>
		<xsl:for-each select="tempKeys[keyword != '']">
			<gmd:descriptiveKeywords xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Keywords>
					<xsl:call-template name="MD_Keywords">
						<xsl:with-param name="type">temporal</xsl:with-param>
					</xsl:call-template>
				</gmd:MD_Keywords>
			</gmd:descriptiveKeywords>
		</xsl:for-each>
		<xsl:for-each select="themeKeys[keyword != '']">
			<gmd:descriptiveKeywords xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Keywords>
					<xsl:call-template name="MD_Keywords">
						<xsl:with-param name="type">theme</xsl:with-param>
					</xsl:call-template>
				</gmd:MD_Keywords>
			</gmd:descriptiveKeywords>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP')">
			<xsl:for-each select="productKeys[keyword != '']">
				<gmd:descriptiveKeywords xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_Keywords>
						<xsl:call-template name="MD_Keywords">
							<xsl:with-param name="type">product</xsl:with-param>
						</xsl:call-template>
					</gmd:MD_Keywords>
				</gmd:descriptiveKeywords>
			</xsl:for-each>
			<xsl:for-each select="subTopicCatKeys[keyword != '']">
				<gmd:descriptiveKeywords xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_Keywords>
						<xsl:call-template name="MD_Keywords">
							<xsl:with-param name="type">subTopicCategory</xsl:with-param>
						</xsl:call-template>
					</gmd:MD_Keywords>
				</gmd:descriptiveKeywords>
			</xsl:for-each>
		</xsl:if>
		<xsl:for-each select="otherKeys[keyword != '']">
			<gmd:descriptiveKeywords xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Keywords>
					<xsl:call-template name="MD_Keywords">
						<xsl:with-param name="type">other</xsl:with-param>
					</xsl:call-template>
				</gmd:MD_Keywords>
			</gmd:descriptiveKeywords>
		</xsl:for-each>
		<xsl:for-each select="/metadata/Esri/DataProperties/itemProps/imsContentType[. != '']">
			<gmd:descriptiveKeywords xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Keywords>
					<gmd:keyword>
						<xsl:variable name="code">
							<xsl:call-template name="contentTypeCode"/>
						</xsl:variable>
						<gco:CharacterString>
							<xsl:value-of select="$code"/>
						</gco:CharacterString>
					</gmd:keyword>
					<gmd:thesaurusName uuidref="723f6998-058e-11dc-8314-0800200c9a66"/>
				</gmd:MD_Keywords>
			</gmd:descriptiveKeywords>
		</xsl:for-each>
		<xsl:if test="not(themeKeys or placeKeys or stratKeys or tempKeys or discKeys or otherKeys) and (searchKeys[keyword != ''])">
			<xsl:for-each select="searchKeys[keyword != '']">
				<gmd:descriptiveKeywords xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_Keywords>
						<xsl:choose>
							<xsl:when test="count (keyword) = 0"/>
							<xsl:otherwise>
								<xsl:for-each select="keyword">
									<gmd:keyword>
										<gco:CharacterString>
											<xsl:value-of select="."/>
										</gco:CharacterString>
									</gmd:keyword>
								</xsl:for-each>
							</xsl:otherwise>
						</xsl:choose>
					</gmd:MD_Keywords>
				</gmd:descriptiveKeywords>
			</xsl:for-each>
		</xsl:if>
		<xsl:if test="not(/metadata/Esri/ArcGISProfile = 'NAP')">
			<xsl:for-each select="idSpecUse[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
				<gmd:resourceSpecificUsage xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_Usage>
						<xsl:call-template name="MD_Usage"/>
					</gmd:MD_Usage>
				</gmd:resourceSpecificUsage>
			</xsl:for-each>
		</xsl:if>
		<xsl:for-each select="resConst/Consts[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:resourceConstraints xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Constraints>
					<xsl:call-template name="MD_Constraints"/>
				</gmd:MD_Constraints>
			</gmd:resourceConstraints>
		</xsl:for-each>
		<xsl:for-each select="resConst/LegConsts[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:resourceConstraints xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_LegalConstraints>
					<xsl:call-template name="MD_LegalConstraints"/>
				</gmd:MD_LegalConstraints>
			</gmd:resourceConstraints>
		</xsl:for-each>
		<xsl:for-each select="resConst/SecConsts[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:resourceConstraints xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_SecurityConstraints>
					<xsl:call-template name="MD_SecurityConstraints"/>
				</gmd:MD_SecurityConstraints>
			</gmd:resourceConstraints>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'INSPIRE')">
			<xsl:if test="(count(resConst/*/useLimit[. != '']) = 0)">
				<gmd:resourceConstraints xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_Constraints>
						<gmd:useLimitation>
							<gco:CharacterString>no conditions apply to access and use</gco:CharacterString>
						</gmd:useLimitation>
					</gmd:MD_Constraints>
				</gmd:resourceConstraints>
			</xsl:if>
			<xsl:if test="((count(resConst/LegConsts/accessConsts/RestrictCd/@value[. != '']) + count(resConst/LegConsts/othConsts[. != ''])&#xD;&#xA;&#x9;&#x9;&#x9;&#x9;&#x9;&#x9;&#x9;+ count(resConst/SecConsts/class/ClasscationCd/@value[. != ''])) = 0)">
				<gmd:resourceConstraints xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_LegalConstraints>
						<gmd:otherConstraints>
							<gco:CharacterString>no limitations on public access</gco:CharacterString>
						</gmd:otherConstraints>
					</gmd:MD_LegalConstraints>
				</gmd:resourceConstraints>
			</xsl:if>
		</xsl:if>
		<xsl:for-each select="aggrInfo[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:aggregationInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_AggregateInformation>
					<xsl:call-template name="MD_AggregateInformation"/>
				</gmd:MD_AggregateInformation>
			</gmd:aggregationInfo>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_DataIdentification">
		<xsl:call-template name="identificationInfo"/>
		<xsl:for-each select="spatRpType/SpatRepTypCd/@value[. != '']">
			<xsl:variable name="code">
				<xsl:call-template name="spatRepCode"/>
			</xsl:variable>
			<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_SpatialRepresentationTypeCode</xsl:variable>
			<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
			<xsl:if test="($code != '')">
				<gmd:spatialRepresentationType xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_SpatialRepresentationTypeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_SpatialRepresentationTypeCode>
				</gmd:spatialRepresentationType>
			</xsl:if>
		</xsl:for-each>
		<xsl:for-each select="dataScale/equScale/rfDenom[(. &gt; 0)]">
			<gmd:spatialResolution xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Resolution>
					<gmd:equivalentScale>
						<gmd:MD_RepresentativeFraction>
							<gmd:denominator>
								<gco:Integer>
									<xsl:value-of select="round(.)"/>
								</gco:Integer>
							</gmd:denominator>
						</gmd:MD_RepresentativeFraction>
					</gmd:equivalentScale>
				</gmd:MD_Resolution>
			</gmd:spatialResolution>
		</xsl:for-each>
		<xsl:for-each select="dataScale/scaleDist/value[(. != '') or (@uom != '')]">
			<gmd:spatialResolution xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Resolution>
					<gmd:distance>
						<gco:Distance>
							<xsl:if test="(@uom != '')">
								<xsl:attribute name="uom"><xsl:value-of select="@uom"/></xsl:attribute>
							</xsl:if>
							<xsl:value-of select="."/>
						</gco:Distance>
					</gmd:distance>
				</gmd:MD_Resolution>
			</gmd:spatialResolution>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(dataLang/languageCode/@value[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (dataLang/languageCode/@value[. != '']) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="dataLang/languageCode/@value[. != '']">
							<xsl:variable name="code">
								<xsl:call-template name="lang639_code"/>
							</xsl:variable>
							<xsl:choose>
								<xsl:when test="($code = 'unknown')">
									<gmd:language xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
										<gco:CharacterString>
											<xsl:value-of select="."/>
										</gco:CharacterString>
									</gmd:language>
								</xsl:when>
								<xsl:when test="($code != 'unknown') and ($code != '')">
									<xsl:variable name="codelistID">http://www.loc.gov/standards/iso639-2/php/code_list.php</xsl:variable>
									<xsl:variable name="codespace">ISO639-2</xsl:variable>
									<gmd:language xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
										<gmd:LanguageCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
											<xsl:value-of select="$code"/>
										</gmd:LanguageCode>
									</gmd:language>
								</xsl:when>
							</xsl:choose>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="((/metadata/Esri/ArcGISProfile = 'INSPIRE') and (/metadata/mdLang/languageCode/@value != ''))">
				<xsl:for-each select="(/metadata/mdLang/languageCode/@value[. != ''])[1]">
					<xsl:variable name="code">
						<xsl:call-template name="lang639_code"/>
					</xsl:variable>
					<xsl:if test="($code != 'unknown') and ($code != '')">
						<xsl:variable name="codelistID">http://www.loc.gov/standards/iso639-2/php/code_list.php</xsl:variable>
						<xsl:variable name="codespace">ISO639-2</xsl:variable>
						<gmd:language xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gmd:LanguageCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
								<xsl:value-of select="$code"/>
							</gmd:LanguageCode>
						</gmd:language>
					</xsl:if>
				</xsl:for-each>
			</xsl:when>
			<xsl:otherwise>
				<gmd:language gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(dataChar/CharSetCd/@value != '')">
				<xsl:for-each select="dataChar/CharSetCd/@value[. != '']">
					<xsl:variable name="code">
						<xsl:call-template name="charSetCode"/>
					</xsl:variable>
					<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_CharacterSetCode</xsl:variable>
					<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
					<xsl:if test="($code != '')">
						<gmd:characterSet xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gmd:MD_CharacterSetCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
								<xsl:value-of select="$code"/>
							</gmd:MD_CharacterSetCode>
						</gmd:characterSet>
					</xsl:if>
				</xsl:for-each>
			</xsl:when>
			<xsl:when test="(not(dataChar/CharSetCd/@value) or (dataChar/CharSetCd/@value = ''))">
				<gmd:characterSet xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:variable name="code">utf8</xsl:variable>
					<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_CharacterSetCode</xsl:variable>
					<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
					<gmd:MD_CharacterSetCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_CharacterSetCode>
				</gmd:characterSet>
			</xsl:when>
		</xsl:choose>
		<xsl:for-each select="tpCat/TopicCatCd/@value[. != '']">
			<gmd:topicCategory xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:variable name="code">
					<xsl:call-template name="topicCode"/>
				</xsl:variable>
				<gmd:MD_TopicCategoryCode>
					<xsl:value-of select="$code"/>
				</gmd:MD_TopicCategoryCode>
			</gmd:topicCategory>
		</xsl:for-each>
		<xsl:for-each select="(envirDesc[. != ''])[1]">
			<gmd:environmentDescription xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:environmentDescription>
		</xsl:for-each>
		<xsl:for-each select="dataExt[(count(*) - count(geoEle/GeoBndBox/@esriExtentType[. = 'native'])) &gt; 0]">
			<gmd:extent xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:EX_Extent>
					<xsl:call-template name="EX_Extent"/>
				</gmd:EX_Extent>
			</gmd:extent>
		</xsl:for-each>
		<xsl:for-each select="(suppInfo[. != ''])[1]">
			<gmd:supplementalInformation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:supplementalInformation>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="SV_ServiceIdentification">
		<xsl:call-template name="identificationInfo"/>
		<xsl:choose>
			<xsl:when test="(count(svType/genericName[(. != '') or (@codeSpace != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (svType/genericName[(. != '') or (@codeSpace != '')]) = 0"/>
					<xsl:when test="count (svType/genericName[(. != '') or (@codeSpace != '')]) &gt; 1">
						<xsl:for-each select="(svType/genericName[(. != '') or (@codeSpace != '')])[1]">
							<srv:serviceType xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:LocalName>
									<xsl:for-each select="(@codeSpace[. != ''])[1]">
										<xsl:attribute name="codeSpace"><xsl:value-of select="."/></xsl:attribute>
									</xsl:for-each>
									<xsl:value-of select="."/>
								</gco:LocalName>
							</srv:serviceType>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="svType/genericName[(. != '') or (@codeSpace != '')]">
							<srv:serviceType xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:LocalName>
									<xsl:for-each select="(@codeSpace[. != ''])[1]">
										<xsl:attribute name="codeSpace"><xsl:value-of select="."/></xsl:attribute>
									</xsl:for-each>
									<xsl:value-of select="."/>
								</gco:LocalName>
							</srv:serviceType>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<srv:serviceType gco:nilReason="missing" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="svTypeVer[. != '']">
			<srv:serviceTypeVersion xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</srv:serviceTypeVersion>
		</xsl:for-each>
		<xsl:for-each select="(svAccProps[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<srv:accessProperties xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<MD_StandardOrderProcess>
					<xsl:call-template name="MD_StandardOrderProcess"/>
				</MD_StandardOrderProcess>
			</srv:accessProperties>
		</xsl:for-each>
		<xsl:for-each select="dataExt[(count(*) - count(geoEle/GeoBndBox/@esriExtentType[. = 'native'])) &gt; 0]">
			<srv:extent xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<EX_Extent>
					<xsl:call-template name="EX_Extent"/>
				</EX_Extent>
			</srv:extent>
		</xsl:for-each>
		<xsl:for-each select="svCouplRes[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<srv:coupledResource xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<srv:SV_CoupledResource>
					<xsl:choose>
						<xsl:when test="(count(svOpName[. != '']) &gt; 0)">
							<xsl:choose>
								<xsl:when test="count (svOpName[. != '']) = 0"/>
								<xsl:when test="count (svOpName[. != '']) &gt; 1">
									<xsl:for-each select="(svOpName[. != ''])[1]">
										<srv:operationName>
											<gco:CharacterString>
												<xsl:value-of select="."/>
											</gco:CharacterString>
										</srv:operationName>
									</xsl:for-each>
								</xsl:when>
								<xsl:otherwise>
									<xsl:for-each select="svOpName[. != '']">
										<srv:operationName>
											<gco:CharacterString>
												<xsl:value-of select="."/>
											</gco:CharacterString>
										</srv:operationName>
									</xsl:for-each>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:when>
						<xsl:otherwise>
							<srv:operationName gco:nilReason="missing"/>
						</xsl:otherwise>
					</xsl:choose>
					<xsl:choose>
						<xsl:when test="(count(svResCitId/identCode[. != '']) &gt; 0)">
							<xsl:choose>
								<xsl:when test="count (svResCitId/identCode[. != '']) = 0"/>
								<xsl:when test="count (svResCitId/identCode[. != '']) &gt; 1">
									<xsl:for-each select="(svResCitId/identCode[. != ''])[1]">
										<srv:identifier>
											<gco:CharacterString>
												<xsl:value-of select="."/>
											</gco:CharacterString>
										</srv:identifier>
									</xsl:for-each>
								</xsl:when>
								<xsl:otherwise>
									<xsl:for-each select="svResCitId/identCode[. != '']">
										<srv:identifier>
											<gco:CharacterString>
												<xsl:value-of select="."/>
											</gco:CharacterString>
										</srv:identifier>
									</xsl:for-each>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:when>
						<xsl:otherwise>
							<srv:identifier gco:nilReason="missing"/>
						</xsl:otherwise>
					</xsl:choose>
				</srv:SV_CoupledResource>
			</srv:coupledResource>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(svCouplType/CouplTypCd/@value[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (svCouplType/CouplTypCd/@value[. != '']) = 0"/>
					<xsl:when test="count (svCouplType/CouplTypCd/@value[. != '']) &gt; 1">
						<xsl:for-each select="(svCouplType/CouplTypCd/@value[. != ''])[1]">
							<xsl:variable name="code">
								<xsl:call-template name="couplTypCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#SV_CouplingType</xsl:variable>
							<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
							<xsl:if test="($code != '')">
								<srv:couplingType xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<srv:SV_CouplingType codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</srv:SV_CouplingType>
								</srv:couplingType>
							</xsl:if>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="svCouplType/CouplTypCd/@value[. != '']">
							<xsl:variable name="code">
								<xsl:call-template name="couplTypCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#SV_CouplingType</xsl:variable>
							<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
							<xsl:if test="($code != '')">
								<srv:couplingType xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<srv:SV_CouplingType codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</srv:SV_CouplingType>
								</srv:couplingType>
							</xsl:if>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<srv:couplingType gco:nilReason="missing" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(svOper[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (svOper[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="svOper[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
							<srv:containsOperations xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<srv:SV_OperationMetadata>
									<xsl:call-template name="SV_OperationMetadata"/>
								</srv:SV_OperationMetadata>
							</srv:containsOperations>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<srv:containsOperations gco:nilReason="missing" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="svOperOn[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<srv:operatesOn xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<MD_DataIdentification>
					<xsl:call-template name="MD_DataIdentification"/>
				</MD_DataIdentification>
			</srv:operatesOn>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="SV_OperationMetadata">
		<xsl:choose>
			<xsl:when test="(count(svOpName[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (svOpName[. != '']) = 0"/>
					<xsl:when test="count (svOpName[. != '']) &gt; 1">
						<xsl:for-each select="(svOpName[. != ''])[1]">
							<srv:operationName xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</srv:operationName>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="svOpName[. != '']">
							<srv:operationName xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</srv:operationName>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<srv:operationName gco:nilReason="missing" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(svDCP/DCPListCd/@value[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (svDCP/DCPListCd/@value[. != '']) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="svDCP/DCPListCd/@value[. != '']">
							<xsl:variable name="code">
								<xsl:call-template name="dcpCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#DCPList</xsl:variable>
							<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
							<xsl:if test="($code != '')">
								<srv:DCP xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<srv:DCPList codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</srv:DCPList>
								</srv:DCP>
							</xsl:if>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<srv:DCPList gco:nilReason="missing" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(svDesc[. != ''])[1]">
			<srv:operationDescription xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</srv:operationDescription>
		</xsl:for-each>
		<xsl:for-each select="(svInvocName[. != ''])[1]">
			<srv:invocationName xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</srv:invocationName>
		</xsl:for-each>
		<xsl:for-each select="svParams[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<srv:parameters xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<srv:SV_Parameter>
					<xsl:call-template name="SV_Parameter"/>
				</srv:SV_Parameter>
			</srv:parameters>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(svConPt[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (svConPt[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="svConPt[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
							<srv:connectPoint xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<CI_OnlineResource>
									<xsl:call-template name="CI_OnlineResource"/>
								</CI_OnlineResource>
							</srv:connectPoint>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<srv:connectPoint gco:nilReason="missing" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="svOper[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<srv:dependsOn xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<srv:SV_OperationMetadata>
					<xsl:call-template name="SV_OperationMetadata"/>
				</srv:SV_OperationMetadata>
			</srv:dependsOn>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="SV_Parameter">
		<xsl:choose>
			<xsl:when test="(count(svParName[(aName != '') or (attributeType/aName != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (svParName[(aName != '') or (attributeType/aName != '')]) = 0"/>
					<xsl:when test="count (svParName[(aName != '') or (attributeType/aName != '')]) &gt; 1">
						<xsl:for-each select="(svParName[(aName != '') or (attributeType/aName != '')])[1]">
							<srv:name xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:MemberName>
									<xsl:call-template name="MemberName"/>
								</gco:MemberName>
							</srv:name>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="svParName[(aName != '') or (attributeType/aName != '')]">
							<srv:name xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:MemberName>
									<xsl:call-template name="MemberName"/>
								</gco:MemberName>
							</srv:name>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<srv:name gco:nilReason="missing" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(svParDir/ParamDirCd/@value[. != ''])[1]">
			<srv:direction xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:variable name="code">
					<xsl:call-template name="paramDirCode"/>
				</xsl:variable>
				<srv:SV_ParameterDirection>
					<xsl:value-of select="$code"/>
				</srv:SV_ParameterDirection>
			</srv:direction>
		</xsl:for-each>
		<xsl:for-each select="(svDesc[. != ''])[1]">
			<srv:description xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</srv:description>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(svParOpt[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (svParOpt[. != '']) = 0"/>
					<xsl:when test="count (svParOpt[. != '']) &gt; 1">
						<xsl:for-each select="(svParOpt[. != ''])[1]">
							<srv:optionality xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</srv:optionality>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="svParOpt[. != '']">
							<srv:optionality xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</srv:optionality>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<srv:optionality gco:nilReason="missing" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(svRepeat[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (svRepeat[. != '']) = 0"/>
					<xsl:when test="count (svRepeat[. != '']) &gt; 1">
						<xsl:for-each select="(svRepeat[. != ''])[1]">
							<srv:repeatability xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</srv:repeatability>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="svRepeat[. != '']">
							<srv:repeatability xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</srv:repeatability>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<srv:repeatability gco:nilReason="missing" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(svValType/aName[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (svValType/aName[. != '']) = 0"/>
					<xsl:when test="count (svValType/aName[. != '']) &gt; 1">
						<xsl:for-each select="(svValType/aName[. != ''])[1]">
							<srv:valueType xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:TypeName>
									<gco:aName>
										<gco:CharacterString>
											<xsl:value-of select="."/>
										</gco:CharacterString>
									</gco:aName>
								</gco:TypeName>
							</srv:valueType>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="svValType/aName[. != '']">
							<srv:valueType xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:TypeName>
									<gco:aName>
										<gco:CharacterString>
											<xsl:value-of select="."/>
										</gco:CharacterString>
									</gco:aName>
								</gco:TypeName>
							</srv:valueType>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<srv:valueType gco:nilReason="missing" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="MD_Keywords">
		<xsl:param name="type"/>
		<xsl:choose>
			<xsl:when test="(count(keyword[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (keyword[. != '']) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="keyword[. != '']">
							<gmd:keyword xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:keyword>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:keyword gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:if test="($type != 'other')">
			<gmd:type xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:choose>
					<xsl:when test="($type = 'discipline') or ($type = 'place') or ($type = 'stratum') or ($type = 'temporal') or ($type = 'theme')">
						<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode</xsl:variable>
						<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
						<gmd:MD_KeywordTypeCode codeList="{$codelistID}" codeListValue="{$type}" codeSpace="{$codespace}">
							<xsl:value-of select="$type"/>
						</gmd:MD_KeywordTypeCode>
					</xsl:when>
					<xsl:when test="($type = 'product') or ($type = 'subTopicCategory')">
						<xsl:variable name="codelistID">http://www.fgdc.gov/nap/metadata/register/codelists.html#napMD_KeywordTypeCode</xsl:variable>
						<xsl:variable name="codespace">ISOTC211/19139/NAP</xsl:variable>
						<gmd:MD_KeywordTypeCode codeList="{$codelistID}" codeListValue="{$type}" codeSpace="{$codespace}">
							<xsl:value-of select="$type"/>
						</gmd:MD_KeywordTypeCode>
					</xsl:when>
				</xsl:choose>
			</gmd:type>
		</xsl:if>
		<xsl:for-each select="(thesaName[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:thesaurusName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Citation>
					<xsl:call-template name="CI_Citation"/>
				</gmd:CI_Citation>
			</gmd:thesaurusName>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_Usage">
		<xsl:choose>
			<xsl:when test="(count(specUsage[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (specUsage[. != '']) = 0"/>
					<xsl:when test="count (specUsage[. != '']) &gt; 1">
						<xsl:for-each select="(specUsage[. != ''])[1]">
							<gmd:specificUsage xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:specificUsage>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="specUsage[. != '']">
							<gmd:specificUsage xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:specificUsage>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:specificUsage gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(usageDate[. != ''])[1]">
			<xsl:call-template name="dateTimeElements">
				<xsl:with-param name="eleName" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">usageDateTime</xsl:with-param>
			</xsl:call-template>
		</xsl:for-each>
		<xsl:for-each select="(usrDetLim[. != ''])[1]">
			<gmd:userDeterminedLimitations xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:userDeterminedLimitations>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(usrCntInfo[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (usrCntInfo[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="usrCntInfo[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
							<gmd:userContactInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:CI_ResponsibleParty>
									<xsl:call-template name="CI_ResponsibleParty"/>
								</gmd:CI_ResponsibleParty>
							</gmd:userContactInfo>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:userContactInfo gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="MD_AggregateInformation">
		<xsl:for-each select="(aggrDSName[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:aggregateDataSetName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Citation>
					<xsl:call-template name="CI_Citation"/>
				</gmd:CI_Citation>
			</gmd:aggregateDataSetName>
		</xsl:for-each>
		<xsl:for-each select="(aggrDSIdent[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:aggregateDataSetIdentifier xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Identifier>
					<xsl:call-template name="MD_Identifier"/>
				</gmd:MD_Identifier>
			</gmd:aggregateDataSetIdentifier>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(assocType/AscTypeCd/@value[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (assocType/AscTypeCd/@value[. != '']) = 0"/>
					<xsl:when test="count (assocType/AscTypeCd/@value[. != '']) &gt; 1">
						<xsl:for-each select="(assocType/AscTypeCd/@value[. != ''])[1]">
							<xsl:variable name="code">
								<xsl:call-template name="assocTypeCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">
								<xsl:call-template name="assocTypeCodeList"/>
							</xsl:variable>
							<xsl:variable name="codespace">
								<xsl:call-template name="assocTypeCodeSpace"/>
							</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:associationType xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:DS_AssociationTypeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:DS_AssociationTypeCode>
								</gmd:associationType>
							</xsl:if>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="assocType/AscTypeCd/@value[. != '']">
							<xsl:variable name="code">
								<xsl:call-template name="assocTypeCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">
								<xsl:call-template name="assocTypeCodeList"/>
							</xsl:variable>
							<xsl:variable name="codespace">
								<xsl:call-template name="assocTypeCodeSpace"/>
							</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:associationType xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:DS_AssociationTypeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:DS_AssociationTypeCode>
								</gmd:associationType>
							</xsl:if>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:associationType gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(initType/InitTypCd/@value[. != ''])[1]">
			<xsl:variable name="code">
				<xsl:call-template name="initTypeCode"/>
			</xsl:variable>
			<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#DS_InitiativeTypeCode</xsl:variable>
			<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
			<xsl:if test="($code != '')">
				<gmd:initiativeType xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:DS_InitiativeTypeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:DS_InitiativeTypeCode>
				</gmd:initiativeType>
			</xsl:if>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_CoverageDescription">
		<xsl:choose>
			<xsl:when test="(count(attDesc[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (attDesc[. != '']) = 0"/>
					<xsl:when test="count (attDesc[. != '']) &gt; 1">
						<xsl:for-each select="(attDesc[. != ''])[1]">
							<gmd:attributeDescription xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:RecordType>
									<xsl:value-of select="."/>
								</gco:RecordType>
							</gmd:attributeDescription>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="attDesc[. != '']">
							<gmd:attributeDescription xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:RecordType>
									<xsl:value-of select="."/>
								</gco:RecordType>
							</gmd:attributeDescription>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:attributeDescription gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(contentTyp/ContentTypCd/@value[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (contentTyp/ContentTypCd/@value[. != '']) = 0"/>
					<xsl:when test="count (contentTyp/ContentTypCd/@value[. != '']) &gt; 1">
						<xsl:for-each select="(contentTyp/ContentTypCd/@value[. != ''])[1]">
							<xsl:variable name="code">
								<xsl:call-template name="contentTypCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_CoverageContentTypeCode</xsl:variable>
							<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:contentType xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_CoverageContentTypeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_CoverageContentTypeCode>
								</gmd:contentType>
							</xsl:if>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="contentTyp/ContentTypCd/@value[. != '']">
							<xsl:variable name="code">
								<xsl:call-template name="contentTypCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_CoverageContentTypeCode</xsl:variable>
							<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:contentType xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_CoverageContentTypeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_CoverageContentTypeCode>
								</gmd:contentType>
							</xsl:if>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:contentType gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="covDim[(RangeDim//* != '') or (Band//* != '')]">
			<gmd:dimension xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:choose>
					<xsl:when test="*[name() = 'RangeDim']">
						<gmd:MD_RangeDimension>
							<xsl:choose>
								<xsl:when test="count (RangeDim) = 0"/>
								<xsl:when test="count (RangeDim) &gt; 1">
									<xsl:for-each select="(RangeDim)[1]">
										<xsl:call-template name="MD_RangeDimension"/>
									</xsl:for-each>
								</xsl:when>
								<xsl:otherwise>
									<xsl:for-each select="RangeDim">
										<xsl:call-template name="MD_RangeDimension"/>
									</xsl:for-each>
								</xsl:otherwise>
							</xsl:choose>
						</gmd:MD_RangeDimension>
					</xsl:when>
					<xsl:when test="(name(*) = 'Band')">
						<gmd:MD_Band>
							<xsl:choose>
								<xsl:when test="count (Band) = 0"/>
								<xsl:when test="count (Band) &gt; 1">
									<xsl:for-each select="(Band)[1]">
										<xsl:call-template name="MD_Band"/>
									</xsl:for-each>
								</xsl:when>
								<xsl:otherwise>
									<xsl:for-each select="Band">
										<xsl:call-template name="MD_Band"/>
									</xsl:for-each>
								</xsl:otherwise>
							</xsl:choose>
						</gmd:MD_Band>
					</xsl:when>
				</xsl:choose>
			</gmd:dimension>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_RangeDimension">
		<xsl:for-each select="(seqID[(aName != '') or (attributeType/aName != '')])[1]">
			<gmd:sequenceIdentifier xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:MemberName>
					<xsl:call-template name="MemberName"/>
				</gco:MemberName>
			</gmd:sequenceIdentifier>
		</xsl:for-each>
		<xsl:for-each select="(dimDescrp[. != ''])[1]">
			<gmd:descriptor xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:descriptor>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and (not(seqID) or (seqID = '')) and (not(dimDescrp) or (dimDescrp = ''))">
			<gmd:descriptor gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		</xsl:if>
	</xsl:template>
	<xsl:template name="MemberName">
		<xsl:choose>
			<xsl:when test="(count(aName[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (aName[. != '']) = 0"/>
					<xsl:when test="count (aName[. != '']) &gt; 1">
						<xsl:for-each select="(aName[. != ''])[1]">
							<gco:aName xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gco:aName>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="aName[. != '']">
							<gco:aName xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gco:aName>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gco:aName gco:nilReason="missing" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(attributeType/aName[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (attributeType/aName[. != '']) = 0"/>
					<xsl:when test="count (attributeType/aName[. != '']) &gt; 1">
						<xsl:for-each select="(attributeType/aName[. != ''])[1]">
							<gco:attributeType xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:TypeName>
									<gco:aName>
										<gco:CharacterString>
											<xsl:value-of select="."/>
										</gco:CharacterString>
									</gco:aName>
								</gco:TypeName>
							</gco:attributeType>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="attributeType/aName[. != '']">
							<gco:attributeType xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:TypeName>
									<gco:aName>
										<gco:CharacterString>
											<xsl:value-of select="."/>
										</gco:CharacterString>
									</gco:aName>
								</gco:TypeName>
							</gco:attributeType>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gco:attributeType gco:nilReason="missing" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="MD_Band">
		<xsl:call-template name="MD_RangeDimension"/>
		<xsl:for-each select="(maxVal[(. &gt; 0) or (. &lt; 1)])[1]">
			<gmd:maxValue xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Real>
					<xsl:value-of select="number(.)"/>
				</gco:Real>
			</gmd:maxValue>
		</xsl:for-each>
		<xsl:for-each select="(minVal[(. &gt; 0) or (. &lt; 1)])[1]">
			<gmd:minValue xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Real>
					<xsl:value-of select="number(.)"/>
				</gco:Real>
			</gmd:minValue>
		</xsl:for-each>
		<xsl:for-each select="(valUnit/UOM[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:units xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gml:UnitDefinition>
					<xsl:call-template name="UnitDefinition"/>
				</gml:UnitDefinition>
			</gmd:units>
		</xsl:for-each>
		<xsl:for-each select="(pkResp[(. &gt; 0) or (. &lt; 1)])[1]">
			<gmd:peakResponse xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Real>
					<xsl:value-of select="number(.)"/>
				</gco:Real>
			</gmd:peakResponse>
		</xsl:for-each>
		<xsl:for-each select="(bitsPerVal[(. &gt; 0) or (. &lt; 1)])[1]">
			<gmd:bitsPerValue xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Integer>
					<xsl:value-of select="round(.)"/>
				</gco:Integer>
			</gmd:bitsPerValue>
		</xsl:for-each>
		<xsl:for-each select="(toneGrad[(. &gt; 0) or (. &lt; 1)])[1]">
			<gmd:toneGradation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Integer>
					<xsl:value-of select="round(.)"/>
				</gco:Integer>
			</gmd:toneGradation>
		</xsl:for-each>
		<xsl:for-each select="(sclFac[(. &gt; 0) or (. &lt; 1)])[1]">
			<gmd:scaleFactor xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Real>
					<xsl:value-of select="number(.)"/>
				</gco:Real>
			</gmd:scaleFactor>
		</xsl:for-each>
		<xsl:for-each select="(offset[(. &gt; 0) or (. &lt; 1)])[1]">
			<gmd:offset xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Real>
					<xsl:value-of select="number(.)"/>
				</gco:Real>
			</gmd:offset>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_ImageDescription">
		<xsl:call-template name="MD_CoverageDescription"/>
		<xsl:for-each select="(illElevAng[(. &gt; 0) or (. &lt; 1)])[1]">
			<gmd:illuminationElevationAngle xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Real>
					<xsl:value-of select="number(.)"/>
				</gco:Real>
			</gmd:illuminationElevationAngle>
		</xsl:for-each>
		<xsl:for-each select="(illAziAng[(. &gt; 0) or (. &lt; 1)])[1]">
			<gmd:illuminationAzimuthAngle xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Real>
					<xsl:value-of select="number(.)"/>
				</gco:Real>
			</gmd:illuminationAzimuthAngle>
		</xsl:for-each>
		<xsl:for-each select="(imagCond/ImgCondCd/@value[. != ''])[1]">
			<xsl:variable name="code">
				<xsl:call-template name="imagCondCode"/>
			</xsl:variable>
			<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ImagingConditionCode</xsl:variable>
			<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
			<xsl:if test="($code != '')">
				<gmd:imagingCondition xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_ImagingConditionCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_ImagingConditionCode>
				</gmd:imagingCondition>
			</xsl:if>
		</xsl:for-each>
		<xsl:for-each select="(imagQuCode[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:imageQualityCode xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Identifier>
					<xsl:call-template name="MD_Identifier"/>
				</gmd:MD_Identifier>
			</gmd:imageQualityCode>
		</xsl:for-each>
		<xsl:for-each select="(cloudCovPer[(. &gt; 0) or (. &lt; 1)])[1]">
			<gmd:cloudCoverPercentage xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Real>
					<xsl:value-of select="number(.)"/>
				</gco:Real>
			</gmd:cloudCoverPercentage>
		</xsl:for-each>
		<xsl:for-each select="(prcTypCde[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:processingLevelCode xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Identifier>
					<xsl:call-template name="MD_Identifier"/>
				</gmd:MD_Identifier>
			</gmd:processingLevelCode>
		</xsl:for-each>
		<xsl:for-each select="(cmpGenQuan[(. &gt; 0) or (. &lt; 1)])[1]">
			<gmd:compressionGenerationQuantity xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Integer>
					<xsl:value-of select="round(.)"/>
				</gco:Integer>
			</gmd:compressionGenerationQuantity>
		</xsl:for-each>
		<xsl:for-each select="(trianInd[boolean(.)])[1]">
			<gmd:triangulationIndicator xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Boolean>
					<xsl:call-template name="boolean"/>
				</gco:Boolean>
			</gmd:triangulationIndicator>
		</xsl:for-each>
		<xsl:for-each select="(radCalDatAv[boolean(.)])[1]">
			<gmd:radiometricCalibrationDataAvailability xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Boolean>
					<xsl:call-template name="boolean"/>
				</gco:Boolean>
			</gmd:radiometricCalibrationDataAvailability>
		</xsl:for-each>
		<xsl:for-each select="(camCalInAv[boolean(.)])[1]">
			<gmd:cameraCalibrationInformationAvailability xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Boolean>
					<xsl:call-template name="boolean"/>
				</gco:Boolean>
			</gmd:cameraCalibrationInformationAvailability>
		</xsl:for-each>
		<xsl:for-each select="(filmDistInAv[boolean(.)])[1]">
			<gmd:filmDistortionInformationAvailability xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Boolean>
					<xsl:call-template name="boolean"/>
				</gco:Boolean>
			</gmd:filmDistortionInformationAvailability>
		</xsl:for-each>
		<xsl:for-each select="(lensDistInAv[boolean(.)])[1]">
			<gmd:lensDistortionInformationAvailability xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Boolean>
					<xsl:call-template name="boolean"/>
				</gco:Boolean>
			</gmd:lensDistortionInformationAvailability>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_FeatureCatalogueDescription">
		<xsl:for-each select="(compCode[boolean(.)])[1]">
			<gmd:complianceCode xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Boolean>
					<xsl:call-template name="boolean"/>
				</gco:Boolean>
			</gmd:complianceCode>
		</xsl:for-each>
		<xsl:for-each select="catLang/languageCode/@value[. != '']">
			<xsl:variable name="code">
				<xsl:call-template name="lang639_code"/>
			</xsl:variable>
			<xsl:choose>
				<xsl:when test="($code = 'unknown')">
					<gmd:language xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						<gco:CharacterString>
							<xsl:value-of select="."/>
						</gco:CharacterString>
					</gmd:language>
				</xsl:when>
				<xsl:when test="($code != 'unknown') and ($code != '')">
					<xsl:variable name="codelistID">http://www.loc.gov/standards/iso639-2/php/code_list.php</xsl:variable>
					<xsl:variable name="codespace">ISO639-2</xsl:variable>
					<gmd:language xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						<gmd:LanguageCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
							<xsl:value-of select="$code"/>
						</gmd:LanguageCode>
					</gmd:language>
				</xsl:when>
			</xsl:choose>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(incWithDS[boolean(.)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (incWithDS[boolean(.)]) = 0"/>
					<xsl:when test="count (incWithDS[boolean(.)]) &gt; 1">
						<xsl:for-each select="(incWithDS[boolean(.)])[1]">
							<gmd:includedWithDataset xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</gmd:includedWithDataset>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="incWithDS[boolean(.)]">
							<gmd:includedWithDataset xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</gmd:includedWithDataset>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:includedWithDataset gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="catFetTyps/genericName[(. != '') or (@codeSpace != '')]">
			<gmd:featureTypes xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:LocalName>
					<xsl:for-each select="(@codeSpace[. != ''])[1]">
						<xsl:attribute name="codeSpace"><xsl:value-of select="."/></xsl:attribute>
					</xsl:for-each>
					<xsl:value-of select="."/>
				</gco:LocalName>
			</gmd:featureTypes>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and (not(catFetTyps/genericName) or (catFetTyps/genericName = ''))">
			<gmd:featureTypes gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		</xsl:if>
		<xsl:choose>
			<xsl:when test="(count(catCitation[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (catCitation[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="catCitation[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
							<gmd:featureCatalogueCitation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:CI_Citation>
									<xsl:call-template name="CI_Citation"/>
								</gmd:CI_Citation>
							</gmd:featureCatalogueCitation>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:featureCatalogueCitation gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="MD_Distribution">
		<xsl:for-each select="distFormat[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:distributionFormat xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Format>
					<xsl:call-template name="MD_Format"/>
				</gmd:MD_Format>
			</gmd:distributionFormat>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and (distributor/distorFormat[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])">
			<xsl:for-each select="distributor/distorFormat[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
				<gmd:distributionFormat xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_Format>
						<xsl:call-template name="MD_Format"/>
					</gmd:MD_Format>
				</gmd:distributionFormat>
			</xsl:for-each>
		</xsl:if>
		<xsl:for-each select="distributor[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:distributor xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Distributor>
					<xsl:call-template name="MD_Distributor"/>
				</gmd:MD_Distributor>
			</gmd:distributor>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and ((distTranOps != '') or (distributor/distorTran != '')) and (not(distFormat) or (distFormat = '')) and (not(distributor/distorCont) or not(distributor/distorFormat) or not(distributor/distorOrdPrc) or (distributor/distorCont = '') or (distributor/distorFormat = '') or (distributor/distorOrdPrc = ''))">
			<gmd:distributionFormat gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		</xsl:if>
		<xsl:for-each select="distTranOps[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:transferOptions xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_DigitalTransferOptions>
					<xsl:call-template name="MD_DigitalTransferOptions"/>
				</gmd:MD_DigitalTransferOptions>
			</gmd:transferOptions>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and (distributor/distorTran[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])">
			<xsl:for-each select="distributor/distorTran[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
				<gmd:transferOptions xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_DigitalTransferOptions>
						<xsl:call-template name="MD_DigitalTransferOptions"/>
					</gmd:MD_DigitalTransferOptions>
				</gmd:transferOptions>
			</xsl:for-each>
		</xsl:if>
	</xsl:template>
	<xsl:template name="MD_Distributor">
		<xsl:choose>
			<xsl:when test="(count(distorCont[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (distorCont[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) = 0"/>
					<xsl:when test="count (distorCont[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 1">
						<xsl:for-each select="(distorCont[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
							<gmd:distributorContact xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:CI_ResponsibleParty>
									<xsl:call-template name="CI_ResponsibleParty"/>
								</gmd:CI_ResponsibleParty>
							</gmd:distributorContact>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="distorCont[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
							<gmd:distributorContact xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:CI_ResponsibleParty>
									<xsl:call-template name="CI_ResponsibleParty"/>
								</gmd:CI_ResponsibleParty>
							</gmd:distributorContact>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:distributorContact gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="distorOrdPrc[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:distributionOrderProcess xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_StandardOrderProcess>
					<xsl:call-template name="MD_StandardOrderProcess"/>
				</gmd:MD_StandardOrderProcess>
			</gmd:distributionOrderProcess>
		</xsl:for-each>
		<xsl:if test="not(/metadata/Esri/ArcGISProfile = 'NAP')">
			<xsl:for-each select="distorFormat[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
				<gmd:distributorFormat xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_Format>
						<xsl:call-template name="MD_Format"/>
					</gmd:MD_Format>
				</gmd:distributorFormat>
			</xsl:for-each>
		</xsl:if>
		<xsl:if test="not(/metadata/Esri/ArcGISProfile = 'NAP')">
			<xsl:for-each select="distorTran[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
				<gmd:distributorTransferOptions xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_DigitalTransferOptions>
						<xsl:call-template name="MD_DigitalTransferOptions"/>
					</gmd:MD_DigitalTransferOptions>
				</gmd:distributorTransferOptions>
			</xsl:for-each>
		</xsl:if>
	</xsl:template>
	<xsl:template name="MD_StandardOrderProcess">
		<xsl:for-each select="(resFees[. != ''])[1]">
			<gmd:fees xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:fees>
		</xsl:for-each>
		<xsl:choose xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
			<xsl:when test="(planAvDtTm != '')">
				<xsl:for-each select="(planAvDtTm[. != ''])[1]">
					<xsl:call-template name="dateTimeElements">
						<xsl:with-param name="eleName">plannedAvailableDateTime</xsl:with-param>
					</xsl:call-template>
				</xsl:for-each>
			</xsl:when>
			<xsl:when test="(planAvTmPd/tmBegin != '')">
				<xsl:for-each select="(planAvTmPd/tmBegin[. != ''])[1]">
					<xsl:call-template name="dateTimeElements">
						<xsl:with-param name="eleName">plannedAvailableDateTime</xsl:with-param>
					</xsl:call-template>
				</xsl:for-each>
			</xsl:when>
		</xsl:choose>
		<xsl:for-each select="(ordInstr[. != ''])[1]">
			<gmd:orderingInstructions xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:orderingInstructions>
		</xsl:for-each>
		<xsl:for-each select="(ordTurn[. != ''])[1]">
			<gmd:turnaround xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:turnaround>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_DigitalTransferOptions">
		<xsl:for-each select="(unitsODist[. != ''])[1]">
			<gmd:unitsOfDistribution xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:unitsOfDistribution>
		</xsl:for-each>
		<xsl:for-each select="(transSize[(. &gt; 0)])[1]">
			<gmd:transferSize xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Real>
					<xsl:value-of select="number(.)"/>
				</gco:Real>
			</gmd:transferSize>
		</xsl:for-each>
		<xsl:for-each select="onLineSrc[(starts-with(linkage,'http://') or starts-with(linkage,'ftp://')) and ((count(.//*[text()]) - count(./orDesc[starts-with(.,'0')])) &gt; 0)]">
			<gmd:onLine xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_OnlineResource>
					<xsl:call-template name="CI_OnlineResource"/>
				</gmd:CI_OnlineResource>
			</gmd:onLine>
		</xsl:for-each>
		<xsl:for-each select="(offLineMed[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:offLine xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Medium>
					<xsl:call-template name="MD_Medium"/>
				</gmd:MD_Medium>
			</gmd:offLine>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_Medium">
		<xsl:for-each select="(medName/MedNameCd/@value[. != ''])[1]">
			<xsl:variable name="code">
				<xsl:call-template name="medNameCode"/>
			</xsl:variable>
			<xsl:variable name="codelistID">
				<xsl:call-template name="medNameCodeList"/>
			</xsl:variable>
			<xsl:variable name="codespace">
				<xsl:call-template name="medNameCodeSpace"/>
			</xsl:variable>
			<xsl:if test="($code != '')">
				<gmd:name xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_MediumNameCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_MediumNameCode>
				</gmd:name>
			</xsl:if>
		</xsl:for-each>
		<xsl:for-each select="medDensity[(. &gt; 0)]">
			<gmd:density xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Real>
					<xsl:value-of select="number(.)"/>
				</gco:Real>
			</gmd:density>
		</xsl:for-each>
		<xsl:for-each select="(medDenUnits[. != ''])[1]">
			<gmd:densityUnits xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:densityUnits>
		</xsl:for-each>
		<xsl:for-each select="(medVol[(. &gt; 0)])[1]">
			<gmd:volumes xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Integer>
					<xsl:value-of select="round(.)"/>
				</gco:Integer>
			</gmd:volumes>
		</xsl:for-each>
		<xsl:for-each select="medFormat/MedFormCd/@value[. != '']">
			<xsl:variable name="code">
				<xsl:call-template name="medFormatCode"/>
			</xsl:variable>
			<xsl:variable name="codelistID">
				<xsl:call-template name="medFormatCodeList"/>
			</xsl:variable>
			<xsl:variable name="codespace">
				<xsl:call-template name="medFormatCodeSpace"/>
			</xsl:variable>
			<xsl:if test="($code != '')">
				<gmd:mediumFormat xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:MD_MediumFormatCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:MD_MediumFormatCode>
				</gmd:mediumFormat>
			</xsl:if>
		</xsl:for-each>
		<xsl:for-each select="(medNote[. != ''])[1]">
			<gmd:mediumNote xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:mediumNote>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="MD_Format">
		<xsl:choose>
			<xsl:when test="(count(formatName[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (formatName[. != '']) = 0"/>
					<xsl:when test="count (formatName[. != '']) &gt; 1">
						<xsl:for-each select="(formatName[. != ''])[1]">
							<gmd:name xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:name>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="formatName[. != '']">
							<gmd:name xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:name>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:name gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(formatVer[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (formatVer[. != '']) = 0"/>
					<xsl:when test="count (formatVer[. != '']) &gt; 1">
						<xsl:for-each select="(formatVer[. != ''])[1]">
							<gmd:version xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:version>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="formatVer[. != '']">
							<gmd:version xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:version>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:version gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(formatAmdNum[. != ''])[1]">
			<gmd:amendmentNumber xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:amendmentNumber>
		</xsl:for-each>
		<xsl:for-each select="(formatSpec[. != ''])[1]">
			<gmd:specification xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:specification>
		</xsl:for-each>
		<xsl:for-each select="(fileDecmTech[. != ''])[1]">
			<gmd:fileDecompressionTechnique xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:fileDecompressionTechnique>
		</xsl:for-each>
		<xsl:for-each select="formatDist[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:formatDistributor xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Distributor>
					<xsl:call-template name="MD_Distributor"/>
				</gmd:MD_Distributor>
			</gmd:formatDistributor>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="DQ_DataQuality">
		<xsl:choose>
			<xsl:when test="(count(dqScope[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (dqScope[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) = 0"/>
					<xsl:when test="count (dqScope[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 1">
						<xsl:for-each select="(dqScope[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
							<gmd:scope xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:DQ_Scope>
									<xsl:call-template name="DQ_Scope"/>
								</gmd:DQ_Scope>
							</gmd:scope>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="dqScope[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
							<gmd:scope xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:DQ_Scope>
									<xsl:call-template name="DQ_Scope"/>
								</gmd:DQ_Scope>
							</gmd:scope>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:scope gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="report[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:report xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:choose>
					<xsl:when test="(@type = 'DQCompOm')">
						<gmd:DQ_CompletenessOmission>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_CompletenessOmission>
					</xsl:when>
					<xsl:when test="(@type = 'DQCompComm')">
						<gmd:DQ_CompletenessCommission>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_CompletenessCommission>
					</xsl:when>
					<xsl:when test="(@type = 'DQTopConsis')">
						<gmd:DQ_TopologicalConsistency>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_TopologicalConsistency>
					</xsl:when>
					<xsl:when test="(@type = 'DQFormConsis')">
						<gmd:DQ_FormatConsistency>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_FormatConsistency>
					</xsl:when>
					<xsl:when test="(@type = 'DQDomConsis')">
						<gmd:DQ_DomainConsistency>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_DomainConsistency>
					</xsl:when>
					<xsl:when test="(@type = 'DQConcConsis')">
						<gmd:DQ_ConceptualConsistency>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_ConceptualConsistency>
					</xsl:when>
					<xsl:when test="(@type = 'DQRelIntPosAcc')">
						<gmd:DQ_RelativeInternalPositionalAccuracy>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_RelativeInternalPositionalAccuracy>
					</xsl:when>
					<xsl:when test="(@type = 'DQGridDataPosAcc')">
						<gmd:DQ_GriddedDataPositionalAccuracy>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_GriddedDataPositionalAccuracy>
					</xsl:when>
					<xsl:when test="(@type = 'DQAbsExtPosAcc')">
						<gmd:DQ_AbsoluteExternalPositionalAccuracy>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_AbsoluteExternalPositionalAccuracy>
					</xsl:when>
					<xsl:when test="(@type = 'DQQuanAttAcc')">
						<gmd:DQ_QuantitativeAttributeAccuracy>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_QuantitativeAttributeAccuracy>
					</xsl:when>
					<xsl:when test="(@type = 'DQNonQuanAttAcc')">
						<gmd:DQ_NonQuantitativeAttributeAccuracy>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_NonQuantitativeAttributeAccuracy>
					</xsl:when>
					<xsl:when test="(@type = 'DQThemClassCor')">
						<gmd:DQ_ThematicClassificationCorrectness>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_ThematicClassificationCorrectness>
					</xsl:when>
					<xsl:when test="(@type = 'DQTempValid') and not(/metadata/Esri/ArcGISProfile = 'NAP')">
						<gmd:DQ_TemporalValidity>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_TemporalValidity>
					</xsl:when>
					<xsl:when test="(@type = 'DQTempConsis')">
						<gmd:DQ_TemporalConsistency>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_TemporalConsistency>
					</xsl:when>
					<xsl:when test="(@type = 'DQAccTimeMeas')">
						<gmd:DQ_AccuracyOfATimeMeasurement>
							<xsl:call-template name="DQ_Element"/>
						</gmd:DQ_AccuracyOfATimeMeasurement>
					</xsl:when>
				</xsl:choose>
			</gmd:report>
		</xsl:for-each>
		<xsl:for-each select="(dataLineage[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:lineage xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:LI_Lineage>
					<xsl:call-template name="LI_Lineage"/>
				</gmd:LI_Lineage>
			</gmd:lineage>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="DQ_Scope">
		<xsl:choose>
			<xsl:when test="(count(scpLvl/ScopeCd/@value[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (scpLvl/ScopeCd/@value[. != '']) = 0"/>
					<xsl:when test="count (scpLvl/ScopeCd/@value[. != '']) &gt; 1">
						<xsl:for-each select="(scpLvl/ScopeCd/@value[. != ''])[1]">
							<xsl:variable name="code">
								<xsl:call-template name="scopeCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">
								<xsl:call-template name="scopeCodeList"/>
							</xsl:variable>
							<xsl:variable name="codespace">
								<xsl:call-template name="scopeCodeSpace"/>
							</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:level xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_ScopeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_ScopeCode>
								</gmd:level>
							</xsl:if>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="scpLvl/ScopeCd/@value[. != '']">
							<xsl:variable name="code">
								<xsl:call-template name="scopeCode"/>
							</xsl:variable>
							<xsl:variable name="codelistID">
								<xsl:call-template name="scopeCodeList"/>
							</xsl:variable>
							<xsl:variable name="codespace">
								<xsl:call-template name="scopeCodeSpace"/>
							</xsl:variable>
							<xsl:if test="($code != '')">
								<gmd:level xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gmd:MD_ScopeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
										<xsl:value-of select="$code"/>
									</gmd:MD_ScopeCode>
								</gmd:level>
							</xsl:if>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:level gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(scpExt[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:extent xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:EX_Extent>
					<xsl:call-template name="EX_Extent"/>
				</gmd:EX_Extent>
			</gmd:extent>
		</xsl:for-each>
		<xsl:for-each select="scpLvlDesc/*[. != '']">
			<gmd:levelDescription xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_ScopeDescription>
					<xsl:call-template name="MD_ScopeDescription"/>
				</gmd:MD_ScopeDescription>
			</gmd:levelDescription>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="DQ_Element">
		<xsl:for-each select="measName">
			<gmd:nameOfMeasure xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:nameOfMeasure>
		</xsl:for-each>
		<xsl:for-each select="(measId)[1]">
			<gmd:measureIdentification xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Identifier>
					<xsl:call-template name="MD_Identifier"/>
				</gmd:MD_Identifier>
			</gmd:measureIdentification>
		</xsl:for-each>
		<xsl:for-each select="(measDesc)[1]">
			<gmd:measureDescription xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:measureDescription>
		</xsl:for-each>
		<xsl:for-each select="(evalMethType/EvalMethTypeCd/@value)[1]">
			<xsl:variable name="code">
				<xsl:call-template name="evalMethTypeCode"/>
			</xsl:variable>
			<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#DQ_EvaluationMethodTypeCode</xsl:variable>
			<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
			<xsl:if test="($code != '')">
				<gmd:evaluationMethodType xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:DQ_EvaluationMethodTypeCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:DQ_EvaluationMethodTypeCode>
				</gmd:evaluationMethodType>
			</xsl:if>
		</xsl:for-each>
		<xsl:for-each select="(evalMethDesc)[1]">
			<gmd:evaluationMethodDescription xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:evaluationMethodDescription>
		</xsl:for-each>
		<xsl:for-each select="(evalProc)[1]">
			<gmd:evaluationProcedure xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Citation>
					<xsl:call-template name="CI_Citation"/>
				</gmd:CI_Citation>
			</gmd:evaluationProcedure>
		</xsl:for-each>
		<xsl:for-each select="measDateTm">
			<xsl:call-template name="dateTimeElements">
				<xsl:with-param name="eleName" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">dateTime</xsl:with-param>
			</xsl:call-template>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(measResult[(.//* != '') or (.//@* != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (measResult/ConResult[(.//* != '') or (.//@* != '')]) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="(measResult/ConResult[(.//* != '') or (.//@* != '')])[1]">
							<gmd:result xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:DQ_ConformanceResult>
									<xsl:call-template name="DQ_ConformanceResult"/>
								</gmd:DQ_ConformanceResult>
							</gmd:result>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
				<xsl:choose>
					<xsl:when test="count (measResult/QuanResult[(.//* != '') or (.//@* != '')]) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="(measResult/QuanResult[(.//* != '') or (.//@* != '')])[1]">
							<gmd:result xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:DQ_QuantitativeResult>
									<xsl:call-template name="DQ_QuantitativeResult"/>
								</gmd:DQ_QuantitativeResult>
							</gmd:result>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:result gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="DQ_ConformanceResult">
		<xsl:choose>
			<xsl:when test="(count(conSpec[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (conSpec[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) = 0"/>
					<xsl:when test="count (conSpec[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 1">
						<xsl:for-each select="(conSpec[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
							<gmd:specification xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:CI_Citation>
									<xsl:call-template name="CI_Citation"/>
								</gmd:CI_Citation>
							</gmd:specification>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="conSpec[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
							<gmd:specification xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:CI_Citation>
									<xsl:call-template name="CI_Citation"/>
								</gmd:CI_Citation>
							</gmd:specification>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:specification gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(conExpl[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (conExpl[. != '']) = 0"/>
					<xsl:when test="count (conExpl[. != '']) &gt; 1">
						<xsl:for-each select="(conExpl[. != ''])[1]">
							<gmd:explanation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:explanation>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="conExpl[. != '']">
							<gmd:explanation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:explanation>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:explanation gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(conPass[boolean(.)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (conPass[boolean(.)]) = 0"/>
					<xsl:when test="count (conPass[boolean(.)]) &gt; 1">
						<xsl:for-each select="(conPass[boolean(.)])[1]">
							<gmd:pass xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</gmd:pass>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="conPass[boolean(.)]">
							<gmd:pass xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Boolean>
									<xsl:call-template name="boolean"/>
								</gco:Boolean>
							</gmd:pass>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:pass gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="DQ_QuantitativeResult">
		<xsl:for-each select="(quanValType[. != ''])[1]">
			<gmd:valueType xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:RecordType>
					<xsl:value-of select="."/>
				</gco:RecordType>
			</gmd:valueType>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(quanValUnit/UOM[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (quanValUnit/UOM[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) = 0"/>
					<xsl:when test="count (quanValUnit/UOM[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 1">
						<xsl:for-each select="(quanValUnit/UOM[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
							<gmd:valueUnit xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gml:UnitDefinition>
									<xsl:call-template name="UnitDefinition"/>
								</gml:UnitDefinition>
							</gmd:valueUnit>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="quanValUnit/UOM[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
							<gmd:valueUnit xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gml:UnitDefinition>
									<xsl:call-template name="UnitDefinition"/>
								</gml:UnitDefinition>
							</gmd:valueUnit>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:valueUnit gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(errStat[. != ''])[1]">
			<gmd:errorStatistic xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:errorStatistic>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(quanVal[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (quanVal[. != '']) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="quanVal[. != '']">
							<gmd:value xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Record>
									<xsl:value-of select="."/>
								</gco:Record>
							</gmd:value>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:value gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="LI_Lineage">
		<xsl:for-each select="(statement[. != ''])[1]">
			<gmd:statement xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:statement>
		</xsl:for-each>
		<xsl:for-each select="prcStep[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<xsl:sort select="substring(stepDateTm, 1, 4)" data-type="number" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			<xsl:sort select="substring(stepDateTm, 6, 2)" data-type="number" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			<xsl:sort select="substring(stepDateTm, 9, 2)" data-type="number" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			<gmd:processStep xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:LI_ProcessStep>
					<xsl:call-template name="LI_ProcessStep"/>
				</gmd:LI_ProcessStep>
			</gmd:processStep>
		</xsl:for-each>
		<xsl:for-each select="dataSource[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:source xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:LI_Source>
					<xsl:call-template name="LI_Source"/>
				</gmd:LI_Source>
			</gmd:source>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="LI_Source">
		<xsl:for-each select="(srcDesc[. != ''])[1]">
			<gmd:description xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:description>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and ((not(srcDesc) or (srcDesc = '')) and (not(srcExt) or (srcExt = '')) and (not(srcCitatn) or (srcCitatn = '')))">
			<gmd:description gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		</xsl:if>
		<xsl:for-each select="(srcScale/rfDenom[(. &gt; 0)])[1]">
			<gmd:scaleDenominator xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_RepresentativeFraction>
					<gmd:denominator>
						<gco:Integer>
							<xsl:value-of select="round(.)"/>
						</gco:Integer>
					</gmd:denominator>
				</gmd:MD_RepresentativeFraction>
			</gmd:scaleDenominator>
		</xsl:for-each>
		<xsl:for-each select="(srcRefSys[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:sourceReferenceSystem xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_ReferenceSystem>
					<gmd:referenceSystemIdentifier>
						<gmd:RS_Identifier>
							<xsl:call-template name="RS_Identifier"/>
						</gmd:RS_Identifier>
					</gmd:referenceSystemIdentifier>
				</gmd:MD_ReferenceSystem>
			</gmd:sourceReferenceSystem>
		</xsl:for-each>
		<xsl:for-each select="(srcCitatn[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:sourceCitation xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Citation>
					<xsl:call-template name="CI_Citation"/>
				</gmd:CI_Citation>
			</gmd:sourceCitation>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and ((not(srcDesc) or (srcDesc = '')) and (srcExt != '') and (not(srcCitatn) or (srcCitatn = '')))">
			<gmd:sourceCitation gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		</xsl:if>
		<xsl:for-each select="srcExt[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:sourceExtent xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:EX_Extent>
					<xsl:call-template name="EX_Extent"/>
				</gmd:EX_Extent>
			</gmd:sourceExtent>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and ((not(srcDesc) or (srcDesc = '')) and (srcCitatn != '') and (not(srcExt) or (srcExt = '')))">
			<gmd:sourceExtent gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		</xsl:if>
		<xsl:if test="not(/metadata/Esri/ArcGISProfile = 'NAP')">
			<xsl:for-each select="srcStep[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
				<gmd:sourceStep xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:LI_ProcessStep>
						<xsl:call-template name="LI_ProcessStep"/>
					</gmd:LI_ProcessStep>
				</gmd:sourceStep>
			</xsl:for-each>
		</xsl:if>
	</xsl:template>
	<xsl:template name="LI_ProcessStep">
		<xsl:choose>
			<xsl:when test="(count(stepDesc[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (stepDesc[. != '']) = 0"/>
					<xsl:when test="count (stepDesc[. != '']) &gt; 1">
						<xsl:for-each select="(stepDesc[. != ''])[1]">
							<gmd:description xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:description>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="stepDesc[. != '']">
							<gmd:description xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:description>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:description gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(stepRat[. != ''])[1]">
			<gmd:rationale xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:rationale>
		</xsl:for-each>
		<xsl:for-each select="(stepDateTm[. != ''])[1]">
			<xsl:call-template name="dateTimeElements">
				<xsl:with-param name="eleName" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">dateTime</xsl:with-param>
			</xsl:call-template>
		</xsl:for-each>
		<xsl:for-each select="stepProc[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:processor xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_ResponsibleParty>
					<xsl:call-template name="CI_ResponsibleParty"/>
				</gmd:CI_ResponsibleParty>
			</gmd:processor>
		</xsl:for-each>
		<xsl:if test="not(/metadata/Esri/ArcGISProfile = 'NAP')">
			<xsl:for-each select="stepSrc[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
				<gmd:source xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:LI_Source>
						<xsl:call-template name="LI_Source"/>
					</gmd:LI_Source>
				</gmd:source>
			</xsl:for-each>
		</xsl:if>
	</xsl:template>
	<xsl:template name="MD_ApplicationSchemaInformation">
		<xsl:choose>
			<xsl:when test="(count(asName[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (asName[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) = 0"/>
					<xsl:when test="count (asName[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 1">
						<xsl:for-each select="(asName[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
							<gmd:name xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:CI_Citation>
									<xsl:call-template name="CI_Citation"/>
								</gmd:CI_Citation>
							</gmd:name>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="asName[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
							<gmd:name xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:CI_Citation>
									<xsl:call-template name="CI_Citation"/>
								</gmd:CI_Citation>
							</gmd:name>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:name gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(asSchLang[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (asSchLang[. != '']) = 0"/>
					<xsl:when test="count (asSchLang[. != '']) &gt; 1">
						<xsl:for-each select="(asSchLang[. != ''])[1]">
							<gmd:schemaLanguage xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:schemaLanguage>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="asSchLang[. != '']">
							<gmd:schemaLanguage xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:schemaLanguage>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:schemaLanguage gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(asCstLang[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (asCstLang[. != '']) = 0"/>
					<xsl:when test="count (asCstLang[. != '']) &gt; 1">
						<xsl:for-each select="(asCstLang[. != ''])[1]">
							<gmd:constraintLanguage xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:constraintLanguage>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="asCstLang[. != '']">
							<gmd:constraintLanguage xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:CharacterString>
									<xsl:value-of select="."/>
								</gco:CharacterString>
							</gmd:constraintLanguage>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:constraintLanguage gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(asAscii[. != ''])[1]">
			<gmd:schemaAscii xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:schemaAscii>
		</xsl:for-each>
		<xsl:for-each select="(asGraFile[(. != '') or (@src != '')])[1]">
			<gmd:graphicsFile xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Binary>
					<xsl:for-each select="(@src[. != ''])[1]">
						<xsl:attribute name="src"><xsl:value-of select="."/></xsl:attribute>
					</xsl:for-each>
					<xsl:value-of select="."/>
				</gco:Binary>
			</gmd:graphicsFile>
		</xsl:for-each>
		<xsl:for-each select="(asSwDevFile[(. != '') or (@src != '')])[1]">
			<gmd:softwareDevelopmentFile xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Binary>
					<xsl:for-each select="(@src[. != ''])[1]">
						<xsl:attribute name="src"><xsl:value-of select="."/></xsl:attribute>
					</xsl:for-each>
					<xsl:value-of select="."/>
				</gco:Binary>
			</gmd:softwareDevelopmentFile>
		</xsl:for-each>
		<xsl:for-each select="(asSwDevFiFt[. != ''])[1]">
			<gmd:softwareDevelopmentFileFormat xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:softwareDevelopmentFileFormat>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="EX_Extent">
		<xsl:for-each select="(exDesc[. != ''])[1]">
			<gmd:description xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:description>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="count (geoEle/GeoBndBox[(@esriExtentType='search') and (*/@Sync = 'TRUE') and ((westBL &gt; -181) and (westBL &lt; 181) and (eastBL &gt; -181) and (eastBL &lt; 181) and (northBL &gt; -91) and (northBL &lt; 91) and (southBL &gt; -91) and (southBL &lt; 91))]) = 0"/>
			<xsl:otherwise>
				<xsl:for-each select="(geoEle/GeoBndBox[(@esriExtentType='search') and (*/@Sync = 'TRUE') and ((westBL &gt; -181) and (westBL &lt; 181) and (eastBL &gt; -181) and (eastBL &lt; 181) and (northBL &gt; -91) and (northBL &lt; 91) and (southBL &gt; -91) and (southBL &lt; 91))])[1]">
					<gmd:geographicElement xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						<gmd:EX_GeographicBoundingBox>
							<xsl:call-template name="EX_GeographicBoundingBox"/>
						</gmd:EX_GeographicBoundingBox>
					</gmd:geographicElement>
				</xsl:for-each>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="geoEle/GeoBndBox[not(@esriExtentType='native') and not(*/@Sync = 'TRUE') and ((westBL &gt; -181) and (westBL &lt; 181) and (eastBL &gt; -181) and (eastBL &lt; 181) and (northBL &gt; -91) and (northBL &lt; 91) and (southBL &gt; -91) and (southBL &lt; 91))]">
			<gmd:geographicElement xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:EX_GeographicBoundingBox>
					<xsl:call-template name="EX_GeographicBoundingBox"/>
				</gmd:EX_GeographicBoundingBox>
			</gmd:geographicElement>
		</xsl:for-each>
		<xsl:for-each select="geoEle/GeoDesc[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:geographicElement xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:EX_GeographicDescription>
					<xsl:call-template name="EX_GeographicDescription"/>
				</gmd:EX_GeographicDescription>
			</gmd:geographicElement>
		</xsl:for-each>
		<xsl:for-each select="geoEle/BoundPoly[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:geographicElement xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:EX_BoundingPolygon>
					<xsl:call-template name="EX_BoundingPolygon"/>
				</gmd:EX_BoundingPolygon>
			</gmd:geographicElement>
		</xsl:for-each>
		<xsl:for-each select="tempEle/TempExtent/exTemp/TM_Instant[(tmPosition != '') or (tmPosition/@date != '')]">
			<gmd:temporalElement xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:EX_TemporalExtent>
					<gmd:extent>
						<xsl:call-template name="GML_TimePrimitive"/>
					</gmd:extent>
				</gmd:EX_TemporalExtent>
			</gmd:temporalElement>
		</xsl:for-each>
		<xsl:for-each select="tempEle/TempExtent/exTemp/TM_Period[(tmBegin != '') or (tmBegin/@date != '') or (tmEnd != '') or (tmEnd/@date != '')]">
			<gmd:temporalElement xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:EX_TemporalExtent>
					<gmd:extent>
						<xsl:call-template name="GML_TimePrimitive"/>
					</gmd:extent>
				</gmd:EX_TemporalExtent>
			</gmd:temporalElement>
		</xsl:for-each>
		<xsl:for-each select="tempEle/SpatTempEx[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:temporalElement xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:EX_SpatialTemporalExtent>
					<xsl:call-template name="EX_SpatialTemporalExtent"/>
				</gmd:EX_SpatialTemporalExtent>
			</gmd:temporalElement>
		</xsl:for-each>
		<xsl:for-each select="vertEle[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:verticalElement xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:EX_VerticalExtent>
					<xsl:call-template name="EX_VerticalExtent"/>
				</gmd:EX_VerticalExtent>
			</gmd:verticalElement>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="EX_GeographicBoundingBox">
		<xsl:for-each select="(exTypeCode[boolean(.)])[1]">
			<gmd:extentTypeCode xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Boolean>
					<xsl:call-template name="boolean"/>
				</gco:Boolean>
			</gmd:extentTypeCode>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(westBL[(. &gt; -181) or (. &lt; 181)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (westBL[(. &gt; -181) or (. &lt; 181)]) = 0"/>
					<xsl:when test="count (westBL[(. &gt; -181) or (. &lt; 181)]) &gt; 1">
						<xsl:for-each select="(westBL[(. &gt; -181) or (. &lt; 181)])[1]">
							<gmd:westBoundLongitude xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Decimal>
									<xsl:value-of select="number(.)"/>
								</gco:Decimal>
							</gmd:westBoundLongitude>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="westBL[(. &gt; -181) or (. &lt; 181)]">
							<gmd:westBoundLongitude xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Decimal>
									<xsl:value-of select="number(.)"/>
								</gco:Decimal>
							</gmd:westBoundLongitude>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:westBoundLongitude gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(eastBL[(. &gt; -181) or (. &lt; 181)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (eastBL[(. &gt; -181) or (. &lt; 181)]) = 0"/>
					<xsl:when test="count (eastBL[(. &gt; -181) or (. &lt; 181)]) &gt; 1">
						<xsl:for-each select="(eastBL[(. &gt; -181) or (. &lt; 181)])[1]">
							<gmd:eastBoundLongitude xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Decimal>
									<xsl:value-of select="number(.)"/>
								</gco:Decimal>
							</gmd:eastBoundLongitude>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="eastBL[(. &gt; -181) or (. &lt; 181)]">
							<gmd:eastBoundLongitude xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Decimal>
									<xsl:value-of select="number(.)"/>
								</gco:Decimal>
							</gmd:eastBoundLongitude>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:eastBoundLongitude gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(southBL[(. &gt; -91) or (. &lt; 91)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (southBL[(. &gt; -91) or (. &lt; 91)]) = 0"/>
					<xsl:when test="count (southBL[(. &gt; -91) or (. &lt; 91)]) &gt; 1">
						<xsl:for-each select="(southBL[(. &gt; -91) or (. &lt; 91)])[1]">
							<gmd:southBoundLatitude xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Decimal>
									<xsl:value-of select="number(.)"/>
								</gco:Decimal>
							</gmd:southBoundLatitude>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="southBL[(. &gt; -91) or (. &lt; 91)]">
							<gmd:southBoundLatitude xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Decimal>
									<xsl:value-of select="number(.)"/>
								</gco:Decimal>
							</gmd:southBoundLatitude>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:southBoundLatitude gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(northBL[(. &gt; -91) or (. &lt; 91)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (northBL[(. &gt; -91) or (. &lt; 91)]) = 0"/>
					<xsl:when test="count (northBL[(. &gt; -91) or (. &lt; 91)]) &gt; 1">
						<xsl:for-each select="(northBL[(. &gt; -91) or (. &lt; 91)])[1]">
							<gmd:northBoundLatitude xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Decimal>
									<xsl:value-of select="number(.)"/>
								</gco:Decimal>
							</gmd:northBoundLatitude>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="northBL[(. &gt; -91) or (. &lt; 91)]">
							<gmd:northBoundLatitude xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Decimal>
									<xsl:value-of select="number(.)"/>
								</gco:Decimal>
							</gmd:northBoundLatitude>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:northBoundLatitude gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="EX_GeographicDescription">
		<xsl:for-each select="(exTypeCode[boolean(.)])[1]">
			<gmd:extentTypeCode xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Boolean>
					<xsl:call-template name="boolean"/>
				</gco:Boolean>
			</gmd:extentTypeCode>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(geoId[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (geoId[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) = 0"/>
					<xsl:when test="count (geoId[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]) &gt; 1">
						<xsl:for-each select="(geoId[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
							<gmd:geographicIdentifier xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:MD_Identifier>
									<xsl:call-template name="MD_Identifier"/>
								</gmd:MD_Identifier>
							</gmd:geographicIdentifier>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="geoId[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
							<gmd:geographicIdentifier xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:MD_Identifier>
									<xsl:call-template name="MD_Identifier"/>
								</gmd:MD_Identifier>
							</gmd:geographicIdentifier>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:geographicIdentifier gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="EX_BoundingPolygon">
		<xsl:for-each select="(exTypeCode[boolean(.)])[1]">
			<gmd:extentTypeCode xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:Boolean>
					<xsl:call-template name="boolean"/>
				</gco:Boolean>
			</gmd:extentTypeCode>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="(count(polygon[(.//pos != '') or (.//posList != '')]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (polygon[(.//pos != '') or (.//posList != '')]) = 0"/>
					<xsl:otherwise>
						<xsl:for-each select="polygon[(.//pos != '') or (.//posList != '')]">
							<gmd:polygon xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gml:Polygon>
									<xsl:call-template name="GML_StandardProperties"/>
									<xsl:for-each select="(exterior[(pos != '') or (posList != '')])[1]">
										<gml:exterior>
											<gml:LinearRing>
												<xsl:choose>
													<xsl:when test="(pos != '')">
														<xsl:for-each select="pos[. != '']">
															<gml:pos>
																<xsl:value-of select="."/>
															</gml:pos>
														</xsl:for-each>
													</xsl:when>
													<xsl:when test="(posList != '')">
														<xsl:for-each select="(posList[. != ''])[1]">
															<gml:posList>
																<xsl:value-of select="."/>
															</gml:posList>
														</xsl:for-each>
													</xsl:when>
												</xsl:choose>
											</gml:LinearRing>
										</gml:exterior>
									</xsl:for-each>
									<xsl:for-each select="interior[(pos != '') or (posList != '')]">
										<gml:interior>
											<gml:LinearRing>
												<xsl:choose>
													<xsl:when test="(pos != '')">
														<xsl:for-each select="pos[. != '']">
															<gml:pos>
																<xsl:value-of select="."/>
															</gml:pos>
														</xsl:for-each>
													</xsl:when>
													<xsl:when test="(posList != '')">
														<xsl:for-each select="(posList[. != ''])[1]">
															<gml:posList>
																<xsl:value-of select="."/>
															</gml:posList>
														</xsl:for-each>
													</xsl:when>
												</xsl:choose>
											</gml:LinearRing>
										</gml:interior>
									</xsl:for-each>
								</gml:Polygon>
							</gmd:polygon>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:polygon gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="GML_TimePrimitive">
		<xsl:if test="tmPosition[(. != '') or (@date != '')]">
			<gml:TimeInstant xmlns:gml="http://www.opengis.net/gml" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:call-template name="GML_StandardProperties"/>
				<xsl:for-each select="(tmPosition[(. != '') or (@date != '')])[1]">
					<xsl:call-template name="temporalExtentValues">
						<xsl:with-param name="eleName">gml:timePosition</xsl:with-param>
					</xsl:call-template>
				</xsl:for-each>
			</gml:TimeInstant>
		</xsl:if>
		<xsl:if test="tmBegin[(. != '') or (@date != '')] or tmEnd[(. != '') or (@date != '')]">
			<gml:TimePeriod xmlns:gml="http://www.opengis.net/gml" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:call-template name="GML_StandardProperties"/>
				<xsl:for-each select="(tmBegin[(. != '') or (@date != '')])[1]">
					<xsl:call-template name="temporalExtentValues">
						<xsl:with-param name="eleName">gml:beginPosition</xsl:with-param>
					</xsl:call-template>
				</xsl:for-each>
				<xsl:if test="not(tmBegin) or ((tmBegin = '') and (not(tmBegin/@date) or (tmBegin/@date = '')))">
					<gml:beginPosition indeterminatePosition="unknown"/>
				</xsl:if>
				<xsl:for-each select="(tmEnd[(. != '') or (@date != '')])[1]">
					<xsl:call-template name="temporalExtentValues">
						<xsl:with-param name="eleName">gml:endPosition</xsl:with-param>
					</xsl:call-template>
				</xsl:for-each>
				<xsl:if test="not(tmEnd) or ((tmEnd = '') and (not(tmEnd/@date) or (tmEnd/@date = '')))">
					<gml:endPosition indeterminatePosition="unknown"/>
				</xsl:if>
			</gml:TimePeriod>
		</xsl:if>
	</xsl:template>
	<xsl:template name="EX_SpatialTemporalExtent">
		<xsl:for-each select="exTemp/TM_Instant[(tmPosition != '') or (tmPosition/@date != '')]">
			<gmd:extent xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:call-template name="GML_TimePrimitive"/>
			</gmd:extent>
		</xsl:for-each>
		<xsl:for-each select="exTemp/TM_Period[(tmBegin != '') or (tmBegin/@date != '') or (tmEnd != '') or (tmEnd/@date != '')]">
			<gmd:extent xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:call-template name="GML_TimePrimitive"/>
			</gmd:extent>
		</xsl:for-each>
		<xsl:for-each select="exSpat/GeoBndBox[(.//* != '') and not(@esriExtentType='native')]">
			<gmd:spatialExtent xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:EX_GeographicBoundingBox>
					<xsl:call-template name="EX_GeographicBoundingBox"/>
				</gmd:EX_GeographicBoundingBox>
			</gmd:spatialExtent>
		</xsl:for-each>
		<xsl:for-each select="exSpat/GeoDesc[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:spatialExtent xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:EX_GeographicDescription>
					<xsl:call-template name="EX_GeographicDescription"/>
				</gmd:EX_GeographicDescription>
			</gmd:spatialExtent>
		</xsl:for-each>
		<xsl:for-each select="exSpat/BoundPoly[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:spatialExtent xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:EX_BoundingPolygon>
					<xsl:call-template name="EX_BoundingPolygon"/>
				</gmd:EX_BoundingPolygon>
			</gmd:spatialExtent>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="EX_VerticalExtent">
		<xsl:choose>
			<xsl:when test="(count(vertMinVal[(. &gt; 0) or (. &lt; 1)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (vertMinVal[(. &gt; 0) or (. &lt; 1)]) = 0"/>
					<xsl:when test="count (vertMinVal[(. &gt; 0) or (. &lt; 1)]) &gt; 1">
						<xsl:for-each select="(vertMinVal[(. &gt; 0) or (. &lt; 1)])[1]">
							<gmd:minimumValue xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Real>
									<xsl:value-of select="number(.)"/>
								</gco:Real>
							</gmd:minimumValue>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="vertMinVal[(. &gt; 0) or (. &lt; 1)]">
							<gmd:minimumValue xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Real>
									<xsl:value-of select="number(.)"/>
								</gco:Real>
							</gmd:minimumValue>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:minimumValue gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:choose>
			<xsl:when test="(count(vertMaxVal[(. &gt; 0) or (. &lt; 1)]) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (vertMaxVal[(. &gt; 0) or (. &lt; 1)]) = 0"/>
					<xsl:when test="count (vertMaxVal[(. &gt; 0) or (. &lt; 1)]) &gt; 1">
						<xsl:for-each select="(vertMaxVal[(. &gt; 0) or (. &lt; 1)])[1]">
							<gmd:maximumValue xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Real>
									<xsl:value-of select="number(.)"/>
								</gco:Real>
							</gmd:maximumValue>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="vertMaxVal[(. &gt; 0) or (. &lt; 1)]">
							<gmd:maximumValue xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gco:Real>
									<xsl:value-of select="number(.)"/>
								</gco:Real>
							</gmd:maximumValue>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:maximumValue gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<gmd:verticalCRS gco:nilReason="other:see_referenceSystemInfo" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
	</xsl:template>
	<xsl:template name="GML_StandardProperties">
		<xsl:choose>
			<xsl:when test="(@gmlID != '')">
				<xsl:for-each select="@gmlID[. != '']">
					<xsl:attribute name="gml:id" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><xsl:value-of select="."/></xsl:attribute>
				</xsl:for-each>
			</xsl:when>
			<xsl:when test="not(@gmlID) or (@gmlID = '')">
				<xsl:attribute name="gml:id" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><xsl:value-of select="generate-id()"/></xsl:attribute>
			</xsl:when>
		</xsl:choose>
		<xsl:for-each select="(gmlDesc[. != ''])[1]">
			<gml:description xmlns:gml="http://www.opengis.net/gml" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:value-of select="."/>
			</gml:description>
		</xsl:for-each>
		<xsl:for-each select="(gmlDescRef[(. != '') or (@href != '')])[1]">
			<gml:descriptionReference xmlns:gml="http://www.opengis.net/gml" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:choose>
					<xsl:when test="(@href != '')">
						<xsl:for-each select="(@href[. != ''])[1]">
							<xsl:attribute name="xlink:href"><xsl:value-of select="."/></xsl:attribute>
						</xsl:for-each>
					</xsl:when>
					<xsl:when test="(. != '')">
						<xsl:attribute name="xlink:href"><xsl:value-of select="."/></xsl:attribute>
					</xsl:when>
				</xsl:choose>
			</gml:descriptionReference>
		</xsl:for-each>
		<xsl:for-each select="(gmlIdent[(. != '') or (@codeSpace != '')])[1]">
			<gml:identifier xmlns:gml="http://www.opengis.net/gml" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:for-each select="(@codeSpace[. != ''])[1]">
					<xsl:attribute name="codeSpace"><xsl:value-of select="."/></xsl:attribute>
				</xsl:for-each>
				<xsl:if test="(not(@codeSpace) or (@codeSpace = '')) and (name(..) = 'UOM')">
					<xsl:attribute name="codeSpace">GML_UomSymbol</xsl:attribute>
				</xsl:if>
				<xsl:value-of select="."/>
			</gml:identifier>
		</xsl:for-each>
		<xsl:if test="(not(gmlIdent) or ((gmlIdent = '') and (gmlIdent/@codeSpace = ''))) and (name() = 'UOM')">
			<gml:identifier xmlns:gml="http://www.opengis.net/gml" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:attribute name="codeSpace">GML_UomSymbol</xsl:attribute>
				<xsl:text>Unified Code of Units of Measure</xsl:text>
			</gml:identifier>
		</xsl:if>
		<xsl:for-each select="(gmlName[. != ''])[1]">
			<gml:name xmlns:gml="http://www.opengis.net/gml" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:for-each select="(@codeSpace[. != ''])[1]">
					<xsl:attribute name="codeSpace"><xsl:value-of select="."/></xsl:attribute>
				</xsl:for-each>
				<xsl:value-of select="."/>
			</gml:name>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="UnitDefinition">
		<xsl:call-template name="GML_StandardProperties"/>
		<xsl:for-each select="(gmlRemarks[. != ''])[1]">
			<gml:remarks xmlns:gml="http://www.opengis.net/gml" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:value-of select="."/>
			</gml:remarks>
		</xsl:for-each>
		<xsl:for-each select="(unitQuanType[. != ''])[1]">
			<gml:quantityType xmlns:gml="http://www.opengis.net/gml" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:value-of select="."/>
			</gml:quantityType>
		</xsl:for-each>
		<xsl:for-each select="(unitQuanRef[(. != '') or (@href != '')])[1]">
			<gml:quantityTypeReference xmlns:gml="http://www.opengis.net/gml" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:choose>
					<xsl:when test="(@href != '')">
						<xsl:for-each select="(@href[. != ''])[1]">
							<xsl:attribute name="xlink:href"><xsl:value-of select="."/></xsl:attribute>
						</xsl:for-each>
					</xsl:when>
					<xsl:when test="(. != '')">
						<xsl:attribute name="xlink:href"><xsl:value-of select="."/></xsl:attribute>
					</xsl:when>
				</xsl:choose>
			</gml:quantityTypeReference>
		</xsl:for-each>
		<xsl:for-each select="(unitSymbol[. != ''])[1]">
			<gml:catalogSymbol xmlns:gml="http://www.opengis.net/gml" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<xsl:choose>
					<xsl:when test="(@codeSpace != '')">
						<xsl:for-each select="(@codeSpace[. != ''])[1]">
							<xsl:attribute name="codeSpace"><xsl:value-of select="."/></xsl:attribute>
						</xsl:for-each>
					</xsl:when>
					<xsl:when test="(not(@codeSpace) or (@codeSpace = ''))">
						<xsl:attribute name="codeSpace">http://aurora.regenstrief.org/UCUM</xsl:attribute>
					</xsl:when>
				</xsl:choose>
				<xsl:value-of select="."/>
			</gml:catalogSymbol>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="CI_ResponsibleParty">
		<xsl:for-each select="(rpIndName[. != ''])[1]">
			<gmd:individualName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:individualName>
		</xsl:for-each>
		<xsl:for-each select="(rpOrgName[. != ''])[1]">
			<gmd:organisationName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:organisationName>
		</xsl:for-each>
		<xsl:for-each select="(rpPosName[. != ''])[1]">
			<gmd:positionName xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:positionName>
		</xsl:for-each>
		<xsl:for-each select="(rpCntInfo[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:contactInfo xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Contact>
					<xsl:call-template name="CI_Contact"/>
				</gmd:CI_Contact>
			</gmd:contactInfo>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and (not(rpCntInfo) or (rpCntInfo = ''))">
			<gmd:contactInfo gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		</xsl:if>
		<xsl:choose>
			<xsl:when test="(role/RoleCd/@value != '')">
				<xsl:for-each select="(role/RoleCd/@value[. != ''])[1]">
					<xsl:variable name="code">
						<xsl:call-template name="roleCode"/>
					</xsl:variable>
					<xsl:variable name="codelistID">
						<xsl:call-template name="roleCodeList"/>
					</xsl:variable>
					<xsl:variable name="codespace">
						<xsl:call-template name="roleCodeSpace"/>
					</xsl:variable>
					<xsl:if test="($code != '')">
						<gmd:role xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gmd:CI_RoleCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
								<xsl:value-of select="$code"/>
							</gmd:CI_RoleCode>
						</gmd:role>
					</xsl:if>
				</xsl:for-each>
			</xsl:when>
			<xsl:when test="(not(role) or (role/RoleCd/@value = ''))">
				<gmd:role xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:variable name="code">pointOfContact</xsl:variable>
					<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_RoleCode</xsl:variable>
					<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
					<gmd:CI_RoleCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:CI_RoleCode>
				</gmd:role>
			</xsl:when>
			<!-- BEGIN: Esri modification -->
			<xsl:when test="(role/RoleCD/@value != '')">
				<xsl:for-each select="(role/RoleCD/@value[. != ''])[1]">
					<xsl:variable name="code">
						<xsl:call-template name="roleCode"/>
					</xsl:variable>
					<xsl:variable name="codelistID">
						<xsl:call-template name="roleCodeList"/>
					</xsl:variable>
					<xsl:variable name="codespace">
						<xsl:call-template name="roleCodeSpace"/>
					</xsl:variable>
					<xsl:if test="($code != '')">
						<gmd:role xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gmd:CI_RoleCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
								<xsl:value-of select="$code"/>
							</gmd:CI_RoleCode>
						</gmd:role>
					</xsl:if>
				</xsl:for-each>
			</xsl:when>
			<xsl:when test="(not(role) or (role/RoleCD/@value = ''))">
				<gmd:role xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:variable name="code">pointOfContact</xsl:variable>
					<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_RoleCode</xsl:variable>
					<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
					<gmd:CI_RoleCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:CI_RoleCode>
				</gmd:role>
			</xsl:when>
			<!-- END: Esri modification -->
		</xsl:choose>
	</xsl:template>
	<xsl:template name="CI_Contact">
		<xsl:if test="((count(cntPhone/*[. != '']) - count(cntPhone/voiceNum[(@phoneType = 'cnttdd') and (. != '')])) &gt; 0)">
			<gmd:phone xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Telephone>
					<xsl:for-each select="cntPhone/voiceNum[not(@phoneType = 'cnttdd') and (. != '')]">
						<gmd:voice>
							<gco:CharacterString>
								<xsl:value-of select="."/>
							</gco:CharacterString>
						</gmd:voice>
					</xsl:for-each>
					<xsl:for-each select="cntPhone/faxNum[(. != '')]">
						<gmd:facsimile>
							<gco:CharacterString>
								<xsl:value-of select="."/>
							</gco:CharacterString>
						</gmd:facsimile>
					</xsl:for-each>
				</gmd:CI_Telephone>
			</gmd:phone>
		</xsl:if>
		<xsl:for-each select="(cntAddress[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:address xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Address>
					<xsl:call-template name="CI_Address"/>
				</gmd:CI_Address>
			</gmd:address>
		</xsl:for-each>
		<xsl:for-each select="(cntOnlineRes[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:onlineResource xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_OnlineResource>
					<xsl:call-template name="CI_OnlineResource"/>
				</gmd:CI_OnlineResource>
			</gmd:onlineResource>
		</xsl:for-each>
		<xsl:for-each select="(cntHours[. != ''])[1]">
			<gmd:hoursOfService xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:hoursOfService>
		</xsl:for-each>
		<xsl:for-each select="(cntInstr[. != ''])[1]">
			<gmd:contactInstructions xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:contactInstructions>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="CI_Address">
		<xsl:for-each select="delPoint[. != '']">
			<gmd:deliveryPoint xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:deliveryPoint>
		</xsl:for-each>
		<xsl:for-each select="(city[. != ''])[1]">
			<gmd:city xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:city>
		</xsl:for-each>
		<xsl:for-each select="(adminArea[. != ''])[1]">
			<gmd:administrativeArea xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:administrativeArea>
		</xsl:for-each>
		<xsl:for-each select="(postCode[. != ''])[1]">
			<gmd:postalCode xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:postalCode>
		</xsl:for-each>
		<xsl:for-each select="(country[. != ''])[1]">
			<xsl:variable name="code">
				<xsl:call-template name="cntry3166_code"/>
			</xsl:variable>
			<xsl:choose>
				<xsl:when test="($code = 'unknown')">
					<gmd:country xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						<gco:CharacterString>
							<xsl:value-of select="."/>
						</gco:CharacterString>
					</gmd:country>
				</xsl:when>
				<xsl:when test="($code != 'unknown') and ($code != '')">
					<xsl:variable name="codelistID">http://www.iso.org/iso/country_codes/iso_3166_code_lists.htm</xsl:variable>
					<xsl:variable name="codespace">ISO3166-1</xsl:variable>
					<gmd:country xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						<gmd:Country codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
							<xsl:value-of select="$code"/>
						</gmd:Country>
					</gmd:country>
				</xsl:when>
			</xsl:choose>
		</xsl:for-each>
		<xsl:for-each select="eMailAdd[. != '']">
			<gmd:electronicMailAddress xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:electronicMailAddress>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="CI_OnlineResource">
		<xsl:choose>
			<xsl:when test="(count(linkage[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (linkage[. != '']) = 0"/>
					<xsl:when test="count (linkage[. != '']) &gt; 1">
						<xsl:for-each select="(linkage[. != ''])[1]">
							<gmd:linkage xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:URL>
									<xsl:value-of select="."/>
								</gmd:URL>
							</gmd:linkage>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="linkage[. != '']">
							<gmd:linkage xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<gmd:URL>
									<xsl:value-of select="."/>
								</gmd:URL>
							</gmd:linkage>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:linkage gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="(protocol[. != ''])[1]">
			<gmd:protocol xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:protocol>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and (not(protocol) or (protocol = ''))">
			<gmd:protocol gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		</xsl:if>
		<xsl:for-each select="(appProfile[. != ''])[1]">
			<gmd:applicationProfile xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:applicationProfile>
		</xsl:for-each>
		<xsl:for-each select="(orName[. != ''])[1]">
			<gmd:name xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:name>
		</xsl:for-each>
		<xsl:for-each select="(orDesc[. != ''])[1]">
			<gmd:description xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:description>
		</xsl:for-each>
		<xsl:for-each select="(orFunct/OnFunctCd/@value[. != ''])[1]">
			<xsl:variable name="code">
				<xsl:call-template name="onlineFnCode"/>
			</xsl:variable>
			<xsl:variable name="codelistID">
				<xsl:call-template name="onlineFnCodeList"/>
			</xsl:variable>
			<xsl:variable name="codespace">
				<xsl:call-template name="onlineFnCodeSpace"/>
			</xsl:variable>
			<xsl:if test="($code != '')">
				<gmd:function xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:CI_OnLineFunctionCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:CI_OnLineFunctionCode>
				</gmd:function>
			</xsl:if>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="CI_Citation">
		<xsl:choose>
			<xsl:when test="(count(resTitle[. != '']) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (resTitle[. != '']) = 0"/>
					<xsl:when test="count (resTitle[. != '']) &gt; 1">
						<xsl:for-each select="(resTitle[. != ''])[1]">
							<xsl:choose>
								<xsl:when test="not(/metadata/Esri/locales/locale/resTitle) or (/metadata/Esri/locales/locale/resTitle = '')">
									<gmd:title xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
										<gco:CharacterString>
											<xsl:value-of select="."/>
										</gco:CharacterString>
									</gmd:title>
								</xsl:when>
								<xsl:otherwise>
									<xsl:choose>
										<xsl:when test="(name(../..) = 'dataIdInfo')">
											<gmd:title xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
												<xsl:attribute name="xsi:type">PT_FreeText_PropertyType</xsl:attribute>
												<gco:CharacterString>
													<xsl:value-of select="."/>
												</gco:CharacterString>
												<gmd:PT_FreeText>
													<xsl:for-each select="/metadata/Esri/locales/locale[resTitle != '']">
														<gmd:textGroup>
															<gmd:LocalisedCharacterString>
																<xsl:variable name="locale">
																	<xsl:choose>
																		<xsl:when test="(@country != '')">
																			<xsl:value-of select="concat(@language, '-', @country)"/>
																		</xsl:when>
																		<xsl:otherwise>
																			<xsl:value-of select="@language"/>
																		</xsl:otherwise>
																	</xsl:choose>
																</xsl:variable>
																<xsl:attribute name="locale"><xsl:value-of select="$locale"/></xsl:attribute>
																<xsl:for-each select="(resTitle[. != ''])[1]">
																	<xsl:value-of select="."/>
																</xsl:for-each>
															</gmd:LocalisedCharacterString>
														</gmd:textGroup>
													</xsl:for-each>
												</gmd:PT_FreeText>
											</gmd:title>
										</xsl:when>
										<xsl:otherwise>
											<gmd:title xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
												<gco:CharacterString>
													<xsl:value-of select="."/>
												</gco:CharacterString>
											</gmd:title>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="resTitle[. != '']">
							<xsl:choose>
								<xsl:when test="not(/metadata/Esri/locales/locale/resTitle) or (/metadata/Esri/locales/locale/resTitle = '')">
									<gmd:title xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
										<gco:CharacterString>
											<xsl:value-of select="."/>
										</gco:CharacterString>
									</gmd:title>
								</xsl:when>
								<xsl:otherwise>
									<xsl:choose>
										<xsl:when test="(name(../..) = 'dataIdInfo')">
											<gmd:title xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
												<xsl:attribute name="xsi:type">PT_FreeText_PropertyType</xsl:attribute>
												<gco:CharacterString>
													<xsl:value-of select="."/>
												</gco:CharacterString>
												<gmd:PT_FreeText>
													<xsl:for-each select="/metadata/Esri/locales/locale[resTitle != '']">
														<gmd:textGroup>
															<gmd:LocalisedCharacterString>
																<xsl:variable name="locale">
																	<xsl:choose>
																		<xsl:when test="(@country != '')">
																			<xsl:value-of select="concat(@language, '-', @country)"/>
																		</xsl:when>
																		<xsl:otherwise>
																			<xsl:value-of select="@language"/>
																		</xsl:otherwise>
																	</xsl:choose>
																</xsl:variable>
																<xsl:attribute name="locale"><xsl:value-of select="$locale"/></xsl:attribute>
																<xsl:for-each select="(resTitle[. != ''])[1]">
																	<xsl:value-of select="."/>
																</xsl:for-each>
															</gmd:LocalisedCharacterString>
														</gmd:textGroup>
													</xsl:for-each>
												</gmd:PT_FreeText>
											</gmd:title>
										</xsl:when>
										<xsl:otherwise>
											<gmd:title xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
												<gco:CharacterString>
													<xsl:value-of select="."/>
												</gco:CharacterString>
											</gmd:title>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:title gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:for-each select="resAltTitle[. != '']">
			<gmd:alternateTitle xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:alternateTitle>
		</xsl:for-each>
		<xsl:for-each select="date/createDate[. != '']">
			<gmd:date xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Date>
					<xsl:call-template name="CI_Date">
						<xsl:with-param name="type">creation</xsl:with-param>
					</xsl:call-template>
				</gmd:CI_Date>
			</gmd:date>
		</xsl:for-each>
		<!-- BEGIN: Esri modification -->
		<xsl:for-each select="date/acquiredDate[. != '']">
			<gmd:date xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Date>
					<xsl:call-template name="CI_Date">
						<xsl:with-param name="type">acquired</xsl:with-param>
					</xsl:call-template>
				</gmd:CI_Date>
			</gmd:date>
		</xsl:for-each>
		<!-- END: Esri modification -->
		<xsl:for-each select="date/pubDate[. != '']">
			<gmd:date xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Date>
					<xsl:call-template name="CI_Date">
						<xsl:with-param name="type">publication</xsl:with-param>
					</xsl:call-template>
				</gmd:CI_Date>
			</gmd:date>
		</xsl:for-each>
		<xsl:for-each select="date/reviseDate[. != '']">
			<gmd:date xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Date>
					<xsl:call-template name="CI_Date">
						<xsl:with-param name="type">revision</xsl:with-param>
					</xsl:call-template>
				</gmd:CI_Date>
			</gmd:date>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP')">
			<xsl:for-each select="date/notavailDate[. != '']">
				<gmd:date xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:CI_Date>
						<xsl:call-template name="CI_Date">
							<xsl:with-param name="type">notAvailable</xsl:with-param>
						</xsl:call-template>
					</gmd:CI_Date>
				</gmd:date>
			</xsl:for-each>
			<xsl:for-each select="date/inforceDate[. != '']">
				<gmd:date xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:CI_Date>
						<xsl:call-template name="CI_Date">
							<xsl:with-param name="type">inForce</xsl:with-param>
						</xsl:call-template>
					</gmd:CI_Date>
				</gmd:date>
			</xsl:for-each>
			<xsl:for-each select="date/adoptDate[. != '']">
				<gmd:date xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:CI_Date>
						<xsl:call-template name="CI_Date">
							<xsl:with-param name="type">adopted</xsl:with-param>
						</xsl:call-template>
					</gmd:CI_Date>
				</gmd:date>
			</xsl:for-each>
			<xsl:for-each select="date/deprecDate[. != '']">
				<gmd:date xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:CI_Date>
						<xsl:call-template name="CI_Date">
							<xsl:with-param name="type">deprecated</xsl:with-param>
						</xsl:call-template>
					</gmd:CI_Date>
				</gmd:date>
			</xsl:for-each>
			<xsl:for-each select="date/supersDate[. != '']">
				<gmd:date xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:CI_Date>
						<xsl:call-template name="CI_Date">
							<xsl:with-param name="type">superseded</xsl:with-param>
						</xsl:call-template>
					</gmd:CI_Date>
				</gmd:date>
			</xsl:for-each>
		</xsl:if>
		<xsl:if test="not(date) or not(date/* != '')">
			<gmd:date gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		</xsl:if>
		<xsl:for-each select="(resEd[. != ''])[1]">
			<gmd:edition xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:edition>
		</xsl:for-each>
		<xsl:for-each select="(resEdDate[. != ''])[1]">
			<xsl:call-template name="dateOrDateTimeElements">
				<xsl:with-param name="eleName" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">editionDate</xsl:with-param>
			</xsl:call-template>
		</xsl:for-each>
		<xsl:for-each select="citId[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:identifier xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:MD_Identifier>
					<xsl:call-template name="MD_Identifier"/>
				</gmd:MD_Identifier>
			</gmd:identifier>
		</xsl:for-each>
		<xsl:for-each select="citRespParty[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')]">
			<gmd:citedResponsibleParty xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_ResponsibleParty>
					<xsl:call-template name="CI_ResponsibleParty"/>
				</gmd:CI_ResponsibleParty>
			</gmd:citedResponsibleParty>
		</xsl:for-each>
		<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and (not(citRespParty) or (citRespParty = ''))">
			<gmd:citedResponsibleParty gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		</xsl:if>
		<xsl:for-each select="presForm/PresFormCd/@value[. != '']">
			<xsl:variable name="code">
				<xsl:call-template name="presFormCode"/>
			</xsl:variable>
			<xsl:variable name="codelistID">
				<xsl:call-template name="presFormCodeList"/>
			</xsl:variable>
			<xsl:variable name="codespace">
				<xsl:call-template name="presFormCodeSpace"/>
			</xsl:variable>
			<xsl:if test="($code != '')">
				<gmd:presentationForm xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<gmd:CI_PresentationFormCode codeList="{$codelistID}" codeListValue="{$code}" codeSpace="{$codespace}">
						<xsl:value-of select="$code"/>
					</gmd:CI_PresentationFormCode>
				</gmd:presentationForm>
			</xsl:if>
		</xsl:for-each>
		<xsl:for-each select="(datasetSeries[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:series xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Series>
					<xsl:for-each select="(seriesName[. != ''])[1]">
						<gmd:name>
							<gco:CharacterString>
								<xsl:value-of select="."/>
							</gco:CharacterString>
						</gmd:name>
					</xsl:for-each>
					<xsl:for-each select="(issId[. != ''])[1]">
						<gmd:issueIdentification>
							<gco:CharacterString>
								<xsl:value-of select="."/>
							</gco:CharacterString>
						</gmd:issueIdentification>
					</xsl:for-each>
					<xsl:if test="(/metadata/Esri/ArcGISProfile = 'NAP') and (not(seriesName) or (seriesName = '')) and (not(issId) or (issId = ''))">
						<gmd:name gco:nilReason="missing"/>
					</xsl:if>
					<xsl:for-each select="(artPage[. != ''])[1]">
						<gmd:page>
							<gco:CharacterString>
								<xsl:value-of select="."/>
							</gco:CharacterString>
						</gmd:page>
					</xsl:for-each>
				</gmd:CI_Series>
			</gmd:series>
		</xsl:for-each>
		<xsl:for-each select="(otherCitDet[. != ''])[1]">
			<gmd:otherCitationDetails xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:otherCitationDetails>
		</xsl:for-each>
		<xsl:for-each select="(collTitle[. != ''])[1]">
			<gmd:collectiveTitle xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:collectiveTitle>
		</xsl:for-each>
		<xsl:for-each select="(isbn[. != ''])[1]">
			<gmd:ISBN xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:ISBN>
		</xsl:for-each>
		<xsl:for-each select="(issn[. != ''])[1]">
			<gmd:ISSN xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:ISSN>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="CI_Date">
		<xsl:param name="type"/>
		<xsl:call-template name="dateOrDateTimeElements">
			<!-- BEGIN: Esri modification -->
			<xsl:with-param name="eleName" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">gmd:date</xsl:with-param>
			<!-- END: Esri modification -->
		</xsl:call-template>
		<gmd:dateType xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
			<xsl:choose>
				<!-- BEGIN: Esri modification -->
				<xsl:when test="($type = 'surveyend') or ($type = 'surveystart') or  ($type = 'authorised') or ($type = 'acquired') or ($type = 'creation') or ($type = 'publication') or ($type = 'revision')">
				<!-- END: Esri modification -->
					<xsl:variable name="codelistID">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_DateTypeCode</xsl:variable>
					<xsl:variable name="codespace">ISOTC211/19115</xsl:variable>
					<gmd:CI_DateTypeCode codeList="{$codelistID}" codeListValue="{$type}" codeSpace="{$codespace}">
						<xsl:value-of select="$type"/>
					</gmd:CI_DateTypeCode>
				</xsl:when>
				<xsl:when test="($type = 'notAvailable') or ($type = 'inForce') or ($type = 'adopted') or ($type = 'deprecated') or ($type = 'superseded')">
					<xsl:variable name="codelistID">http://www.fgdc.gov/nap/metadata/register/codelists.html#napCI_DateTypeCode</xsl:variable>
					<xsl:variable name="codespace">ISOTC211/19139/NAP</xsl:variable>
					<gmd:CI_DateTypeCode codeList="{$codelistID}" codeListValue="{$type}" codeSpace="{$codespace}">
						<xsl:value-of select="$type"/>
					</gmd:CI_DateTypeCode>
				</xsl:when>
			</xsl:choose>
		</gmd:dateType>
	</xsl:template>
	<xsl:template name="MD_Identifier">
		<xsl:for-each select="(identAuth[(.//* != '') or (.//@*[not(name() = 'Sync')] != '')])[1]">
			<gmd:authority xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gmd:CI_Citation>
					<xsl:call-template name="CI_Citation"/>
				</gmd:CI_Citation>
			</gmd:authority>
		</xsl:for-each>
		<xsl:choose>
			<xsl:when test="((count(identCode[. != '']) + count(identCode[@code != ''])) &gt; 0)">
				<xsl:choose>
					<xsl:when test="count (identCode) = 0"/>
					<xsl:when test="count (identCode) &gt; 1">
						<xsl:for-each select="(identCode)[1]">
							<gmd:code xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<xsl:choose>
									<xsl:when test="(@code != '')">
										<xsl:for-each select="(@code)[1]">
											<gco:CharacterString>
												<xsl:value-of select="."/>
											</gco:CharacterString>
										</xsl:for-each>
									</xsl:when>
									<xsl:otherwise>
										<gco:CharacterString>
											<xsl:value-of select="."/>
										</gco:CharacterString>
									</xsl:otherwise>
								</xsl:choose>
							</gmd:code>
						</xsl:for-each>
					</xsl:when>
					<xsl:otherwise>
						<xsl:for-each select="identCode">
							<gmd:code xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
								<xsl:choose>
									<xsl:when test="(@code != '')">
										<xsl:for-each select="(@code)[1]">
											<gco:CharacterString>
												<xsl:value-of select="."/>
											</gco:CharacterString>
										</xsl:for-each>
									</xsl:when>
									<xsl:otherwise>
										<gco:CharacterString>
											<xsl:value-of select="."/>
										</gco:CharacterString>
									</xsl:otherwise>
								</xsl:choose>
							</gmd:code>
						</xsl:for-each>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<gmd:code gco:nilReason="missing" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="RS_Identifier">
		<xsl:call-template name="MD_Identifier"/>
		<xsl:for-each select="(idCodeSpace[. != ''])[1]">
			<gmd:codeSpace xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:codeSpace>
		</xsl:for-each>
		<xsl:for-each select="(idVersion[. != ''])[1]">
			<gmd:version xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
				<gco:CharacterString>
					<xsl:value-of select="."/>
				</gco:CharacterString>
			</gmd:version>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="boolean">
		<xsl:choose>
			<xsl:when test="(. = 0) or (. = 'FALSE') or (. = 'False') or (. = 'false')">
				<xsl:value-of select="false()" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:when>
			<xsl:when test="(. = 1) or (. = 'TRUE') or (. = 'True') or (. = 'true')">
				<xsl:value-of select="true()" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="temporalExtentValues">
		<xsl:param name="eleName" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		<xsl:choose>
			<xsl:when test="(contains(., 'T') and contains(., '-') and contains(., ':'))">
				<xsl:variable name="date" select="translate(substring-before(.,'T'),'-','')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="time" select="translate(substring-after(.,'T'),':','')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:choose>
					<xsl:when test="(function-available('msxsl:utc'))">
						<xsl:choose>
							<xsl:when test="(msxsl:utc(.) != '')">
								<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<xsl:value-of select="."/>
								</xsl:element>
							</xsl:when>
							<xsl:when test="(@date = 'now') or (@date = 'after') or (@date = 'before') or (@date = 'unknown')">
								<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<xsl:attribute name="indeterminatePosition"><xsl:value-of select="@date"/></xsl:attribute>
								</xsl:element>
							</xsl:when>
							<xsl:otherwise>
								<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<xsl:attribute name="indeterminatePosition">unknown</xsl:attribute>
								</xsl:element>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:when>
					<xsl:when test="(number($date) &gt; 0) or (number($time) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:value-of select="."/>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(@date = 'now') or (@date = 'after') or (@date = 'before') or (@date = 'unknown')">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="indeterminatePosition"><xsl:value-of select="@date"/></xsl:attribute>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="indeterminatePosition">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="(contains(., '-') and not(contains(., 'T')) and not(contains(., ':')))">
				<xsl:variable name="date" select="translate(.,'-','')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:choose>
					<xsl:when test="(function-available('msxsl:utc'))">
						<xsl:choose>
							<xsl:when test="(msxsl:utc(.) != '')">
								<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<xsl:value-of select="."/>
								</xsl:element>
							</xsl:when>
							<xsl:when test="(@date = 'now') or (@date = 'after') or (@date = 'before') or (@date = 'unknown')">
								<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<xsl:attribute name="indeterminatePosition"><xsl:value-of select="@date"/></xsl:attribute>
								</xsl:element>
							</xsl:when>
							<xsl:otherwise>
								<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<xsl:attribute name="indeterminatePosition">unknown</xsl:attribute>
								</xsl:element>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:when>
					<xsl:when test="(number($date) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:value-of select="."/>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(@date = 'now') or (@date = 'after') or (@date = 'before') or (@date = 'unknown')">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="indeterminatePosition"><xsl:value-of select="@date"/></xsl:attribute>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="indeterminatePosition">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="number(.)">
				<xsl:variable name="date" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:choose>
						<xsl:when test="(string-length(.) &gt; 8)">
							<xsl:value-of select="substring(.,1,8)"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="."/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:choose>
					<xsl:when test="($date &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:value-of select="substring($date,1,4)"/>
							<xsl:if test="string-length($date) &gt; 4">-<xsl:value-of select="substring($date,5,2)"/>
							</xsl:if>
							<xsl:if test="string-length($date) &gt; 6">-<xsl:value-of select="substring($date,7,2)"/>
							</xsl:if>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(@date = 'now') or (@date = 'after') or (@date = 'before') or (@date = 'unknown')">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="indeterminatePosition"><xsl:value-of select="@date"/></xsl:attribute>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="indeterminatePosition">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="contains(., 'T') and contains(., '/') and not(contains(., '-')) and not(contains(., ':') and (number(substring-before(.,'T')) &gt; 0) and (number(substring-after(substring-before(.,'/'),'T')) &gt; 0))">
				<xsl:variable name="dateTime" select="substring-before(.,'/')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="year" select="substring($dateTime,1,4)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="month" select="substring($dateTime,5,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="day" select="substring($dateTime,7,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="hour" select="substring($dateTime,10,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="minute" select="substring($dateTime,12,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="second" select="substring($dateTime,14,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:choose>
					<xsl:when test="(number(concat($year,$month,$day,$hour,$minute,$second)) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:value-of select="concat($year,'-',$month,'-',$day,'T',$hour,':',$minute,':',$second)"/>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(@date = 'now') or (@date = 'after') or (@date = 'before') or (@date = 'unknown')">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="indeterminatePosition"><xsl:value-of select="@date"/></xsl:attribute>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="indeterminatePosition">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="contains(., 'T') and not(contains(., '-')) and not(contains(., ':') and (number(substring-before(.,'T')) &gt; 0) and (number(substring-after(.,'T')) &gt; 0))">
				<xsl:variable name="year" select="substring(.,1,4)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="month" select="substring(.,5,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="day" select="substring(.,7,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="hour" select="substring(.,10,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="minute" select="substring(.,12,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="second" select="substring(.,14,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:choose>
					<xsl:when test="(number(concat($year,$month,$day,$hour,$minute,$second)) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:value-of select="concat($year,'-',$month,'-',$day,'T',$hour,':',$minute,':',$second)"/>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(@date = 'now') or (@date = 'after') or (@date = 'before') or (@date = 'unknown')">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="indeterminatePosition"><xsl:value-of select="@date"/></xsl:attribute>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="indeterminatePosition">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="(@date = 'now') or (@date = 'after') or (@date = 'before') or (@date = 'unknown')">
				<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:attribute name="indeterminatePosition"><xsl:value-of select="@date"/></xsl:attribute>
				</xsl:element>
			</xsl:when>
			<xsl:when test="(. != '') or (@date != '')">
				<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:attribute name="indeterminatePosition">unknown</xsl:attribute>
				</xsl:element>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="dateTimeElements">
		<xsl:param name="eleName" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		<xsl:choose>
			<xsl:when test="(contains(., 'T') and contains(., '-') and contains(., ':'))">
				<xsl:variable name="date" select="translate(substring-before(.,'T'),'-','')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="time" select="translate(substring-after(.,'T'),':','')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:choose>
					<xsl:when test="(function-available('msxsl:utc'))">
						<xsl:choose>
							<xsl:when test="(msxsl:utc(.) != '')">
								<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gco:DateTime>
										<xsl:value-of select="."/>
									</gco:DateTime>
								</xsl:element>
							</xsl:when>
							<xsl:otherwise>
								<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
								</xsl:element>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:when>
					<xsl:when test="(number($date) &gt; 0) or (number($time) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:DateTime>
								<xsl:value-of select="."/>
							</gco:DateTime>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="(contains(., '-') and not(contains(., 'T')) and not(contains(., ':')))">
				<xsl:variable name="date" select="translate(.,'-','')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:choose>
					<xsl:when test="(function-available('msxsl:utc'))">
						<xsl:choose>
							<xsl:when test="(msxsl:utc(.) != '')">
								<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gco:DateTime>
										<xsl:value-of select="."/>T00:00:00</gco:DateTime>
								</xsl:element>
							</xsl:when>
							<xsl:otherwise>
								<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
								</xsl:element>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:when>
					<xsl:when test="(number($date) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:DateTime>
								<xsl:value-of select="."/>T00:00:00</gco:DateTime>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="number(.)">
				<xsl:variable name="date" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:choose>
						<xsl:when test="(string-length(.) &gt; 8)">
							<xsl:value-of select="substring(.,1,8)"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="."/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:choose>
					<xsl:when test="($date &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:DateTime>
								<xsl:value-of select="substring($date,1,4)"/>
								<xsl:if test="string-length($date) &gt; 4">-<xsl:value-of select="substring($date,5,2)"/>
								</xsl:if>
								<xsl:if test="string-length($date) &gt; 6">-<xsl:value-of select="substring($date,7,2)"/>
								</xsl:if>T00:00:00</gco:DateTime>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(@date != '')">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason"><xsl:value-of select="@date"/></xsl:attribute>
						</xsl:element>
					</xsl:when>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="contains(., ' ') and contains(., '/')">
				<xsl:variable name="date" select="substring-before(.,' ')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="t1" select="substring-before(substring-after(.,' '), ' ')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="ampm" select="substring-after(substring-after(.,' '), ' ')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="y1" select="substring-after(substring-after($date,'/'),'/')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="m1" select="substring-before($date,'/')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="d1" select="substring-before(substring-after($date,'/'),'/')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="month" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:choose>
						<xsl:when test="($m1 &lt; 10)">
							<xsl:value-of select="concat('0',$m1)"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$m1"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:variable name="day" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:choose>
						<xsl:when test="($d1 &lt; 10)">
							<xsl:value-of select="concat('0',$d1)"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$d1"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:variable name="time" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:choose>
						<xsl:when test="($ampm = 'AM') and ($t1 = '12:00:00')">00:00:00</xsl:when>
						<xsl:when test="($ampm = 'PM') or ($ampm = 'pm')">
							<xsl:variable name="hours" select="substring-before($t1,':')"/>
							<xsl:variable name="rest" select="substring-after($t1,':')"/>
							<xsl:value-of select="concat($hours + 12,':',$rest)"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$t1"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:choose>
					<xsl:when test="(number(concat($y1,$month,$day,$time)) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:DateTime>
								<xsl:value-of select="concat($y1,'-',$month,'-',$day,'T',$time)"/>
							</gco:DateTime>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(@date != '')">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason"><xsl:value-of select="@date"/></xsl:attribute>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="contains(., 'T') and contains(., '/') and not(contains(., '-')) and not(contains(., ':') and (number(substring-before(.,'T')) &gt; 0) and (number(substring-after(substring-before(.,'/'),'T')) &gt; 0))">
				<xsl:variable name="dateTime" select="substring-before(.,'/')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="year" select="substring($dateTime,1,4)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="month" select="substring($dateTime,5,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="day" select="substring($dateTime,7,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="hour" select="substring($dateTime,10,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="minute" select="substring($dateTime,12,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="second" select="substring($dateTime,14,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:choose>
					<xsl:when test="(number(concat($year,$month,$day,$hour,$minute,$second)) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:DateTime>
								<xsl:value-of select="concat($year,'-',$month,'-',$day,'T',$hour,':',$minute,':',$second)"/>
							</gco:DateTime>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(@date != '')">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason"><xsl:value-of select="@date"/></xsl:attribute>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="contains(., 'T') and not(contains(., '-')) and not(contains(., ':') and (number(substring-before(.,'T')) &gt; 0) and (number(substring-after(.,'T')) &gt; 0))">
				<xsl:variable name="year" select="substring(.,1,4)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="month" select="substring(.,5,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="day" select="substring(.,7,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="hour" select="substring(.,10,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="minute" select="substring(.,12,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="second" select="substring(.,14,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:choose>
					<xsl:when test="(number(concat($year,$month,$day,$hour,$minute,$second)) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:DateTime>
								<xsl:value-of select="concat($year,'-',$month,'-',$day,'T',$hour,':',$minute,':',$second)"/>
							</gco:DateTime>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(@date != '')">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason"><xsl:value-of select="@date"/></xsl:attribute>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="(@date != '')">
				<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:attribute name="gco:nilReason"><xsl:value-of select="@date"/></xsl:attribute>
				</xsl:element>
			</xsl:when>
			<xsl:when test="(. != '')">
				<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
				</xsl:element>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="dateOrDateTimeElements">
		<xsl:param name="eleName" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
		<xsl:choose>
			<xsl:when test="(contains(., 'T') and contains(., '-') and contains(., ':'))">
				<xsl:variable name="date" select="translate(substring-before(.,'T'),'-','')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="time" select="translate(substring-after(.,'T'),':','')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:choose>
					<xsl:when test="(function-available('msxsl:utc'))">
						<xsl:choose>
							<xsl:when test="(msxsl:utc(.) != '')">
								<xsl:choose>
									<xsl:when test="(number($date) &gt; 0) and (number($time) &gt; 0)">
										<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
											<gco:DateTime>
												<xsl:value-of select="."/>
											</gco:DateTime>
										</xsl:element>
									</xsl:when>
									<xsl:when test="(number($date) &gt; 0)">
										<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
											<gco:Date>
												<xsl:value-of select="substring-before(.,'T')"/>
											</gco:Date>
										</xsl:element>
									</xsl:when>
									<xsl:otherwise>
										<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
											<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
										</xsl:element>
									</xsl:otherwise>
								</xsl:choose>
							</xsl:when>
							<xsl:otherwise>
								<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
								</xsl:element>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:when>
					<xsl:when test="(number($date) &gt; 0) and (number($time) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:DateTime>
								<xsl:value-of select="."/>
							</gco:DateTime>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(number($date) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:Date>
								<xsl:value-of select="substring-before(.,'T')"/>
							</gco:Date>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="(contains(., '-') and not(contains(., 'T')) and not(contains(., ':')))">
				<xsl:variable name="date" select="translate(.,'-','')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:choose>
					<xsl:when test="(function-available('msxsl:utc'))">
						<xsl:choose>
							<xsl:when test="(msxsl:utc(.) != '')">
								<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<gco:Date>
										<xsl:value-of select="."/>
									</gco:Date>
								</xsl:element>
							</xsl:when>
							<xsl:otherwise>
								<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
									<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
								</xsl:element>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:when>
					<xsl:when test="(number($date) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:Date>
								<xsl:value-of select="."/>
							</gco:Date>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="number(.)">
				<xsl:variable name="date" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:choose>
						<xsl:when test="(string-length(.) &gt; 8)">
							<xsl:value-of select="substring(.,1,8)"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="."/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:choose>
					<xsl:when test="($date &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:Date>
								<xsl:value-of select="substring($date,1,4)"/>
								<xsl:if test="string-length($date) &gt; 4">-<xsl:value-of select="substring($date,5,2)"/>
								</xsl:if>
								<xsl:if test="string-length($date) &gt; 6">-<xsl:value-of select="substring($date,7,2)"/>
								</xsl:if>
							</gco:Date>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(@date != '')">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason"><xsl:value-of select="@date"/></xsl:attribute>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="contains(., ' ') and contains(., '/')">
				<xsl:variable name="date" select="substring-before(.,' ')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="t1" select="substring-before(substring-after(.,' '), ' ')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="ampm" select="substring-after(substring-after(.,' '), ' ')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="y1" select="substring-after(substring-after($date,'/'),'/')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="m1" select="substring-before($date,'/')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="d1" select="substring-before(substring-after($date,'/'),'/')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="month" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:choose>
						<xsl:when test="($m1 &lt; 10)">
							<xsl:value-of select="concat('0',$m1)"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$m1"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:variable name="day" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:choose>
						<xsl:when test="($d1 &lt; 10)">
							<xsl:value-of select="concat('0',$d1)"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$d1"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:variable name="time" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:choose>
						<xsl:when test="($ampm = 'AM') and ($t1 = '12:00:00')">00:00:00</xsl:when>
						<xsl:when test="($ampm = 'PM') or ($ampm = 'pm')">
							<xsl:variable name="hours" select="substring-before($t1,':')"/>
							<xsl:variable name="rest" select="substring-after($t1,':')"/>
							<xsl:value-of select="concat($hours + 12,':',$rest)"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$t1"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:choose>
					<xsl:when test="(number(concat($y1,$month,$day)) &gt; 0) and (number(translate($time,':','')) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:DateTime>
								<xsl:value-of select="concat($y1,'-',$month,'-',$day,'T',$time)"/>
							</gco:DateTime>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(number(concat($y1,$month,$day)) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:Date>
								<xsl:value-of select="concat($y1,'-',$month,'-',$day)"/>
							</gco:Date>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(@date != '')">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason"><xsl:value-of select="@date"/></xsl:attribute>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="contains(., 'T') and contains(., '/') and not(contains(., '-')) and not(contains(., ':') and (number(substring-before(.,'T')) &gt; 0) and (number(substring-after(substring-before(.,'/'),'T')) &gt; 0))">
				<xsl:variable name="dateTime" select="substring-before(.,'/')" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="year" select="substring($dateTime,1,4)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="month" select="substring($dateTime,5,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="day" select="substring($dateTime,7,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="hour" select="substring($dateTime,10,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="minute" select="substring($dateTime,12,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="second" select="substring($dateTime,14,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:choose>
					<xsl:when test="(number(concat($year,$month,$day,$hour,$minute,$second)) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:DateTime>
								<xsl:value-of select="concat($year,'-',$month,'-',$day,'T',$hour,':',$minute,':',$second)"/>
							</gco:DateTime>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(number(concat($year,$month,$day)) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:Date>
								<xsl:value-of select="concat($year,'-',$month,'-',$day)"/>
							</gco:Date>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(@date != '')">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason"><xsl:value-of select="@date"/></xsl:attribute>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="contains(., 'T') and not(contains(., '-')) and not(contains(., ':') and (number(substring-before(.,'T')) &gt; 0) and (number(substring-after(.,'T')) &gt; 0))">
				<xsl:variable name="year" select="substring(.,1,4)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="month" select="substring(.,5,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="day" select="substring(.,7,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="hour" select="substring(.,10,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="minute" select="substring(.,12,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:variable name="second" select="substring(.,14,2)" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
				<xsl:choose>
					<xsl:when test="(number(concat($year,$month,$day,$hour,$minute,$second)) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:DateTime>
								<xsl:value-of select="concat($year,'-',$month,'-',$day,'T',$hour,':',$minute,':',$second)"/>
							</gco:DateTime>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(number(concat($year,$month,$day)) &gt; 0)">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<gco:Date>
								<xsl:value-of select="concat($year,'-',$month,'-',$day)"/>
							</gco:Date>
						</xsl:element>
					</xsl:when>
					<xsl:when test="(@date != '')">
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason"><xsl:value-of select="@date"/></xsl:attribute>
						</xsl:element>
					</xsl:when>
					<xsl:otherwise>
						<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
							<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
						</xsl:element>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="(@date != '')">
				<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:attribute name="gco:nilReason"><xsl:value-of select="@date"/></xsl:attribute>
				</xsl:element>
			</xsl:when>
			<xsl:when test="(. != '')">
				<xsl:element name="{$eleName}" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
					<xsl:attribute name="gco:nilReason">unknown</xsl:attribute>
				</xsl:element>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="onlineFnCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>download</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>information</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>offlineAccess</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>order</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>search</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>upload</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>webService</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>emailService</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>browsing</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>fileAccess</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>webMapService</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="onlineFnCodeList">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005')">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_OnLineFunctionCode</xsl:when>
			<xsl:when test="(. = '006') or (. = '007') or (. = '008') or (. = '009') or (. = '010') or (. = '011')">http://www.fgdc.gov/nap/metadata/register/codelists.html#napCI_OnLineFunctionCode</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="onlineFnCodeSpace">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005')">ISOTC211/19115</xsl:when>
			<xsl:when test="(. = '006') or (. = '007') or (. = '008') or (. = '009') or (. = '010') or (. = '011')">ISOTC211/19139/NAP</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="presFormCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>documentDigital</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>documentHardcopy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>imageDigital</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>imageHardcopy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>mapDigital</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>mapHardcopy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>modelDigital</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>modelHardcopy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>profileDigital</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>profileHardcopy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>tableDigital</xsl:text>
			</xsl:when>
			<xsl:when test=". = '012'">
				<xsl:text>tableHardcopy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '013'">
				<xsl:text>videoDigital</xsl:text>
			</xsl:when>
			<xsl:when test=". = '014'">
				<xsl:text>videoHardcopy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '015'">
				<xsl:text>audioDigital</xsl:text>
			</xsl:when>
			<xsl:when test=". = '016'">
				<xsl:text>audioHardcopy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '017'">
				<xsl:text>multimediaDigital</xsl:text>
			</xsl:when>
			<xsl:when test=". = '018'">
				<xsl:text>multimediaHardcopy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '019'">
				<xsl:text>diagramDigital</xsl:text>
			</xsl:when>
			<xsl:when test=". = '020'">
				<xsl:text>diagramHardcopy</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="presFormCodeList">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007') or (. = '008') or (. = '009') or (. = '010') or (. = '011') or (. = '012') or (. = '013') or (. = '014')">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_PresentationFormCode</xsl:when>
			<xsl:when test="(. = '015') or (. = '016') or (. = '017') or (. = '018') or (. = '019') or (. = '020')">http://www.fgdc.gov/nap/metadata/register/codelists.html#napCI_PresentationFormCode</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="presFormCodeSpace">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007') or (. = '008') or (. = '009') or (. = '010') or (. = '011') or (. = '012') or (. = '013') or (. = '014')">ISOTC211/19115</xsl:when>
			<xsl:when test="(. = '015') or (. = '016') or (. = '017') or (. = '018') or (. = '019') or (. = '020')">ISOTC211/19139/NAP</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="roleCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>resourceProvider</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>custodian</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>owner</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>user</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>distributor</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>originator</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>pointOfContact</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>principalInvestigator</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>processor</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>publisher</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>author</xsl:text>
			</xsl:when>
			<xsl:when test=". = '012'">
				<xsl:text>collaborator</xsl:text>
			</xsl:when>
			<xsl:when test=". = '013'">
				<xsl:text>editor</xsl:text>
			</xsl:when>
			<xsl:when test=". = '014'">
				<xsl:text>mediator</xsl:text>
			</xsl:when>
			<xsl:when test=". = '015'">
				<xsl:text>rightsHolder</xsl:text>
			</xsl:when>
			<xsl:when test="translate(.,$UCASE,$LCASE) = 'author'">
				<xsl:text>author</xsl:text>
			</xsl:when>
			<xsl:when test="translate(.,$UCASE,$LCASE) = 'providor'">
				<xsl:text>providor</xsl:text>
			</xsl:when>
			<xsl:when test="translate(.,$UCASE,$LCASE) = 'publisher'">
				<xsl:text>publisher</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="roleCodeList">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007') or (. = '008') or (. = '009') or (. = '010') or (. = '011')">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_RoleCode</xsl:when>
			<xsl:when test="(. = '012') or (. = '013') or (. = '014') or (. = '015')">http://www.fgdc.gov/nap/metadata/register/codelists.html#napCI_RoleCode</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="roleCodeSpace">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007') or (. = '008') or (. = '009') or (. = '010') or (. = '011')">ISOTC211/19115</xsl:when>
			<xsl:when test="(. = '012') or (. = '013') or (. = '014') or (. = '015')">ISOTC211/19139/NAP</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="evalMethTypeCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>directInternal</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>directExternal</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>indirect</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="assocTypeCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>crossReference</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>largerWorkCitation</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>partOfSeamlessDatabase</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>source</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>stereoMate</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>isComposedOf</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="assocTypeCodeList">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005')">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#DS_AssociationTypeCode</xsl:when>
			<xsl:when test="(. = '006')">http://www.fgdc.gov/nap/metadata/register/codelists.html#napDS_AssociationTypeCode</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="assocTypeCodeSpace">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005')">ISOTC211/19115</xsl:when>
			<xsl:when test="(. = '006')">ISOTC211/19139/NAP</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="initTypeCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>campaign</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>collection</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>exercise</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>experiment</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>investigation</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>mission</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>sensor</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>operation</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>platform</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>process</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>program</xsl:text>
			</xsl:when>
			<xsl:when test=". = '012'">
				<xsl:text>project</xsl:text>
			</xsl:when>
			<xsl:when test=". = '013'">
				<xsl:text>study</xsl:text>
			</xsl:when>
			<xsl:when test=". = '014'">
				<xsl:text>task</xsl:text>
			</xsl:when>
			<xsl:when test=". = '015'">
				<xsl:text>trial</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="cellGeoCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>point</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>area</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>voxel</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="cellGeoCodeList">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002')">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_CellGeometryCode</xsl:when>
			<xsl:when test="(. = '003')">http://www.fgdc.gov/nap/metadata/register/codelists.html#napMD_CellGeometryCode</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="cellGeoCodeSpace">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002')">ISOTC211/19115</xsl:when>
			<xsl:when test="(. = '003')">ISOTC211/19139/NAP</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="charSetCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>ucs2</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>ucs4</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>utf7</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>utf8</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>utf16</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>8859part1</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>8859part2</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>8859part3</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>8859part4</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>8859part5</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>8859part6</xsl:text>
			</xsl:when>
			<xsl:when test=". = '012'">
				<xsl:text>8859part7</xsl:text>
			</xsl:when>
			<xsl:when test=". = '013'">
				<xsl:text>8859part8</xsl:text>
			</xsl:when>
			<xsl:when test=". = '014'">
				<xsl:text>8859part9</xsl:text>
			</xsl:when>
			<xsl:when test=". = '015'">
				<xsl:text>8859part10</xsl:text>
			</xsl:when>
			<xsl:when test=". = '016'">
				<xsl:text>8859part11</xsl:text>
			</xsl:when>
			<xsl:when test=". = '018'">
				<xsl:text>8859part13</xsl:text>
			</xsl:when>
			<xsl:when test=". = '019'">
				<xsl:text>8859part14</xsl:text>
			</xsl:when>
			<xsl:when test=". = '020'">
				<xsl:text>8859part15</xsl:text>
			</xsl:when>
			<xsl:when test=". = '021'">
				<xsl:text>8859part16</xsl:text>
			</xsl:when>
			<xsl:when test=". = '022'">
				<xsl:text>jis</xsl:text>
			</xsl:when>
			<xsl:when test=". = '023'">
				<xsl:text>shiftJIS</xsl:text>
			</xsl:when>
			<xsl:when test=". = '024'">
				<xsl:text>eucJP</xsl:text>
			</xsl:when>
			<xsl:when test=". = '025'">
				<xsl:text>usAscii</xsl:text>
			</xsl:when>
			<xsl:when test=". = '026'">
				<xsl:text>ebcdic</xsl:text>
			</xsl:when>
			<xsl:when test=". = '027'">
				<xsl:text>eucKR</xsl:text>
			</xsl:when>
			<xsl:when test=". = '028'">
				<xsl:text>big5</xsl:text>
			</xsl:when>
			<xsl:when test=". = '029'">
				<xsl:text>GB2312</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="classCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>unclassified</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>restricted</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>confidential</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>secret</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>topSecret</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>sensitive</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>forOfficialUseOnly</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="classCodeList">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005')">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ClassificationCode</xsl:when>
			<xsl:when test="(. = '006') or (. = '007')">http://www.fgdc.gov/nap/metadata/register/codelists.html#napMD_ClassificationCode</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="classCodeSpace">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005')">ISOTC211/19115</xsl:when>
			<xsl:when test="(. = '006') or (. = '007')">ISOTC211/19139/NAP</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="contentTypCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>image</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>thematicClassification</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>physicalMeasurement</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="datatypeCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>class</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>codelist</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>enumeration</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>codelistElement</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>abstractClass</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>aggregateClass</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>specifiedClass</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>datatypeClass</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>interfaceClass</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>unionClass</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>metaClass</xsl:text>
			</xsl:when>
			<xsl:when test=". = '012'">
				<xsl:text>typeClass</xsl:text>
			</xsl:when>
			<xsl:when test=". = '013'">
				<xsl:text>characterString</xsl:text>
			</xsl:when>
			<xsl:when test=". = '014'">
				<xsl:text>integer</xsl:text>
			</xsl:when>
			<xsl:when test=". = '015'">
				<xsl:text>association</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="dimensionCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>row</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>column</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>vertical</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>track</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>crossTrack</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>line</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>sample</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>time</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="geomObjCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>complex</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>composite</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>curve</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>point</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>solid</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>surface</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="imagCondCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>blurredImage</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>cloud</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>degradingobliquity</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>fog</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>heavySmokeOrDust</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>night</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>rain</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>semiDarkness</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>shadow</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>snow</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>terrainMasking</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="maintFreqCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>continual</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>daily</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>weekly</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>fortnightly</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>monthly</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>quarterly</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>biannually</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>annually</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>asNeeded</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>irregular</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>notPlanned</xsl:text>
			</xsl:when>
			<xsl:when test=". = '012'">
				<xsl:text>unknown</xsl:text>
			</xsl:when>
			<xsl:when test=". = '013'">
				<xsl:text>semimonthly</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="maintFreqCodeList">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007') or (. = '008') or (. = '009') or (. = '010') or (. = '011') or (. = '012')">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode</xsl:when>
			<xsl:when test="(. = '013')">http://www.fgdc.gov/nap/metadata/register/codelists.html#napMD_MaintenanceFrequencyCode</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="maintFreqCodeSpace">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007') or (. = '008') or (. = '009') or (. = '010') or (. = '011') or (. = '012')">ISOTC211/19115</xsl:when>
			<xsl:when test="(. = '013')">ISOTC211/19139/NAP</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="medFormatCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>cpio</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>tar</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>highSierra</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>iso9660</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>iso9660RockRidge</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>iso9660AppleHFS</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>UDF</xsl:text>
			</xsl:when>
			<!-- BEGIN: Esri modification -->
			<xsl:when test=". = '008'">
				<xsl:text>CE</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>DAP</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>Documentum</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>EFA</xsl:text>
			</xsl:when>
			<xsl:when test=". = '012'">
				<xsl:text>Flexicadastre</xsl:text>
			</xsl:when>
			<xsl:when test=". = '013'">
				<xsl:text>Lease Control</xsl:text>
			</xsl:when>
			<xsl:when test=". = '014'">
				<xsl:text>Unearth</xsl:text>
			</xsl:when>
			<!-- END: Esri modification -->
		</xsl:choose>
	</xsl:template>
	<xsl:template name="medFormatCodeList">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006')">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MediumFormatCode</xsl:when>
			<xsl:when test="(. = '007')">http://www.fgdc.gov/nap/metadata/register/codelists.html#napMD_MediumFormatCode</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="medFormatCodeSpace">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006')">ISOTC211/19115</xsl:when>
			<xsl:when test="(. = '007')">ISOTC211/19139/NAP</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="medNameCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>cdRom</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>dvd</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>dvdRom</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>3halfInchFloppy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>5quarterInchFloppy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>7trackTape</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>9trackTape</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>3480Cartridge</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>3490Cartridge</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>3580Cartridge</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>4mmCartridgeTape</xsl:text>
			</xsl:when>
			<xsl:when test=". = '012'">
				<xsl:text>8mmCartridgeTape</xsl:text>
			</xsl:when>
			<xsl:when test=". = '013'">
				<xsl:text>1quarterInchCartridgeTape</xsl:text>
			</xsl:when>
			<xsl:when test=". = '014'">
				<xsl:text>digitalLinearTape</xsl:text>
			</xsl:when>
			<xsl:when test=". = '015'">
				<xsl:text>onLine</xsl:text>
			</xsl:when>
			<xsl:when test=". = '016'">
				<xsl:text>satellite</xsl:text>
			</xsl:when>
			<xsl:when test=". = '017'">
				<xsl:text>telephoneLink</xsl:text>
			</xsl:when>
			<xsl:when test=". = '018'">
				<xsl:text>hardcopy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '019'">
				<xsl:text>hardcopyDiazoPolyester08</xsl:text>
			</xsl:when>
			<xsl:when test=". = '020'">
				<xsl:text>hardcopyCardMicrofilm</xsl:text>
			</xsl:when>
			<xsl:when test=". = '021'">
				<xsl:text>hardcopyMicrofilm240</xsl:text>
			</xsl:when>
			<xsl:when test=". = '022'">
				<xsl:text>hardcopyMicrofilm35</xsl:text>
			</xsl:when>
			<xsl:when test=". = '023'">
				<xsl:text>hardcopyMicrofilm70</xsl:text>
			</xsl:when>
			<xsl:when test=". = '024'">
				<xsl:text>hardcopyMicrofilmGeneral</xsl:text>
			</xsl:when>
			<xsl:when test=". = '025'">
				<xsl:text>hardcopyMicrofilmMicrofiche</xsl:text>
			</xsl:when>
			<xsl:when test=". = '026'">
				<xsl:text>hardcopyNegativePhoto</xsl:text>
			</xsl:when>
			<xsl:when test=". = '027'">
				<xsl:text>hardcopyPaper</xsl:text>
			</xsl:when>
			<xsl:when test=". = '028'">
				<xsl:text>hardcopyDiazo</xsl:text>
			</xsl:when>
			<xsl:when test=". = '029'">
				<xsl:text>hardcopyPhoto</xsl:text>
			</xsl:when>
			<xsl:when test=". = '030'">
				<xsl:text>hardcopyTracedPaper</xsl:text>
			</xsl:when>
			<xsl:when test=". = '031'">
				<xsl:text>hardDisk</xsl:text>
			</xsl:when>
			<xsl:when test=". = '032'">
				<xsl:text>USBFlashDrive</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="medNameCodeList">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007') or (. = '008') or (. = '009') or (. = '010') or (. = '011') or (. = '012') or (. = '013') or (. = '014') or (. = '015') or (. = '016') or (. = '017') or (. = '018')">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MediumNameCode</xsl:when>
			<xsl:when test="(. = '019') or (. = '020') or (. = '021') or (. = '022') or (. = '023') or (. = '024') or (. = '025') or (. = '026') or (. = '027') or (. = '028') or (. = '029') or (. = '030') or (. = '031') or (. = '032')">http://www.fgdc.gov/nap/metadata/register/codelists.html#napMD_MediumNameCode</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="medNameCodeSpace">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007') or (. = '008') or (. = '009') or (. = '010') or (. = '011') or (. = '012') or (. = '013') or (. = '014') or (. = '015') or (. = '016') or (. = '017') or (. = '018')">ISOTC211/19115</xsl:when>
			<xsl:when test="(. = '019') or (. = '020') or (. = '021') or (. = '022') or (. = '023') or (. = '024') or (. = '025') or (. = '026') or (. = '027') or (. = '028') or (. = '029') or (. = '030') or (. = '031') or (. = '032')">ISOTC211/19139/NAP</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="obligationCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>mandatory</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>optional</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>conditional</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="pixOrientCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>center</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>lowerLeft</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>lowerRight</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>upperRight</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>upperLeft</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="progressCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>completed</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>historicalArchive</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>obsolete</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>onGoing</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>planned</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>required</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>underDevelopment</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>proposed</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="progressCodeList">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007')">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ProgressCode</xsl:when>
			<xsl:when test="(. = '008')">http://www.fgdc.gov/nap/metadata/register/codelists.html#napMD_ProgressCode</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="progressCodeSpace">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007')">ISOTC211/19115</xsl:when>
			<xsl:when test="(. = '008')">ISOTC211/19139/NAP</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="restrictCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>copyright</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>patent</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>patentPending</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>trademark</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>license</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>intellectualPropertyRights</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>restricted</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>otherRestrictions</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>licenseUnrestricted</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>licenseEndUser</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>licenseDistributor</xsl:text>
			</xsl:when>
			<xsl:when test=". = '012'">
				<xsl:text>privacy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '013'">
				<xsl:text>statutory</xsl:text>
			</xsl:when>
			<xsl:when test=". = '014'">
				<xsl:text>confidential</xsl:text>
			</xsl:when>
			<xsl:when test=". = '015'">
				<xsl:text>sensitivity</xsl:text>
			</xsl:when>
			<!-- BEGIN: Esri modification -->
			<xsl:when test=". = '016'">
				<xsl:text>Highly confidential</xsl:text>
			</xsl:when>
			<xsl:when test=". = '017'">
				<xsl:text>Confidential</xsl:text>
			</xsl:when>
			<xsl:when test=". = '018'">
				<xsl:text>Confidential personal</xsl:text>
			</xsl:when>
			<xsl:when test=". = '019'">
				<xsl:text>RTX only</xsl:text>
			</xsl:when>
			<xsl:when test=". = '020'">
				<xsl:text>Rio Tinto only</xsl:text>
			</xsl:when>
			<xsl:when test=". = '021'">
				<xsl:text>RTIO only</xsl:text>
			</xsl:when>
			<xsl:when test=". = '022'">
				<xsl:text>Public</xsl:text>
			</xsl:when>
			<xsl:when test=". = '023'">
				<xsl:text>Copyright</xsl:text>
			</xsl:when>
			<xsl:when test=". = '024'">
				<xsl:text>License</xsl:text>
			</xsl:when>
			<xsl:when test=". = '025'">
				<xsl:text>PGG only</xsl:text>
			</xsl:when>
			<!-- END: Esri modification -->
		</xsl:choose>
	</xsl:template>
	<xsl:template name="restrictCodeList">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007') or (. = '008')">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_RestrictionCode</xsl:when>
			<xsl:when test="(. = '009') or (. = '010') or (. = '011') or (. = '012') or (. = '013') or (. = '014') or (. = '015')">http://www.fgdc.gov/nap/metadata/register/codelists.html#napMD_RestrictionCode</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="restrictCodeSpace">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007') or (. = '008')">ISOTC211/19115</xsl:when>
			<xsl:when test="(. = '009') or (. = '010') or (. = '011') or (. = '012') or (. = '013') or (. = '014') or (. = '015')">ISOTC211/19139/NAP</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="scopeCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>attribute</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>attributeType</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>collectionHardware</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>collectionSession</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>dataset</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>series</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>nonGeographicDataset</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>dimensionGroup</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>feature</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>featureType</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>propertyType</xsl:text>
			</xsl:when>
			<xsl:when test=". = '012'">
				<xsl:text>fieldSession</xsl:text>
			</xsl:when>
			<xsl:when test=". = '013'">
				<xsl:text>software</xsl:text>
			</xsl:when>
			<xsl:when test=". = '014'">
				<xsl:text>service</xsl:text>
			</xsl:when>
			<xsl:when test=". = '015'">
				<xsl:text>model</xsl:text>
			</xsl:when>
			<xsl:when test=". = '016'">
				<xsl:text>tile</xsl:text>
			</xsl:when>
			<xsl:when test=". = '017'">
				<xsl:text>initiative</xsl:text>
			</xsl:when>
			<xsl:when test=". = '018'">
				<xsl:text>stereomate</xsl:text>
			</xsl:when>
			<xsl:when test=". = '019'">
				<xsl:text>sensor</xsl:text>
			</xsl:when>
			<xsl:when test=". = '020'">
				<xsl:text>platformSeries</xsl:text>
			</xsl:when>
			<xsl:when test=". = '021'">
				<xsl:text>sensorSeries</xsl:text>
			</xsl:when>
			<xsl:when test=". = '022'">
				<xsl:text>productionSeries</xsl:text>
			</xsl:when>
			<xsl:when test=". = '023'">
				<xsl:text>transferAggregate</xsl:text>
			</xsl:when>
			<xsl:when test=". = '024'">
				<xsl:text>otherAggregate</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="scopeCodeList">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007') or (. = '008') or (. = '009') or (. = '010') or (. = '011') or (. = '012') or (. = '013') or (. = '014') or (. = '015') or (. = '016')">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ScopeCode</xsl:when>
			<xsl:when test="(. = '017') or (. = '018') or (. = '019') or (. = '020') or (. = '021') or (. = '022') or (. = '023') or (. = '024')">http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MX_ScopeCode</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="scopeCodeSpace">
		<xsl:choose>
			<xsl:when test="(. = '001') or (. = '002') or (. = '003') or (. = '004') or (. = '005') or (. = '006') or (. = '007') or (. = '008') or (. = '009') or (. = '010') or (. = '011') or (. = '012') or (. = '013') or (. = '014') or (. = '015') or (. = '016')">ISOTC211/19115</xsl:when>
			<xsl:when test="(. = '017') or (. = '018') or (. = '019') or (. = '020') or (. = '021') or (. = '022') or (. = '023') or (. = '024')">ISOTC211/19139</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="spatRepCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>vector</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>grid</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>textTable</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>tin</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>stereoModel</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>video</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="topicCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>farming</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>biota</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>boundaries</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>climatologyMeteorologyAtmosphere</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>economy</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>elevation</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>environment</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>geoscientificInformation</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>health</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>imageryBaseMapsEarthCover</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>intelligenceMilitary</xsl:text>
			</xsl:when>
			<xsl:when test=". = '012'">
				<xsl:text>inlandWaters</xsl:text>
			</xsl:when>
			<xsl:when test=". = '013'">
				<xsl:text>location</xsl:text>
			</xsl:when>
			<xsl:when test=". = '014'">
				<xsl:text>oceans</xsl:text>
			</xsl:when>
			<xsl:when test=". = '015'">
				<xsl:text>planningCadastre</xsl:text>
			</xsl:when>
			<xsl:when test=". = '016'">
				<xsl:text>society</xsl:text>
			</xsl:when>
			<xsl:when test=". = '017'">
				<xsl:text>structure</xsl:text>
			</xsl:when>
			<xsl:when test=". = '018'">
				<xsl:text>transportation</xsl:text>
			</xsl:when>
			<xsl:when test=". = '019'">
				<xsl:text>utilitiesCommunication</xsl:text>
			</xsl:when>
			<!-- BEGIN: Esri customization -->
			<xsl:when test=". = '020'">
				<xsl:text>Administration</xsl:text>
			</xsl:when>
			<xsl:when test=". = '021'">
				<xsl:text>Commercial</xsl:text>
			</xsl:when>
			<xsl:when test=". = '022'">
				<xsl:text>Data and information management</xsl:text>
			</xsl:when>
			<xsl:when test=". = '023'">
				<xsl:text>Cartography</xsl:text>
			</xsl:when>
			<xsl:when test=". = '024'">
				<xsl:text>Health, safety and environment</xsl:text>
			</xsl:when>
			<xsl:when test=". = '025'">
				<xsl:text>Finance</xsl:text>
			</xsl:when>
			<xsl:when test=". = '026'">
				<xsl:text>Geochemistry</xsl:text>
			</xsl:when>
			<xsl:when test=". = '027'">
				<xsl:text>GIS</xsl:text>
			</xsl:when>
			<xsl:when test=". = '028'">
				<xsl:text>Geology</xsl:text>
			</xsl:when>
			<xsl:when test=". = '029'">
				<xsl:text>Geophysics</xsl:text>
			</xsl:when>
			<xsl:when test=". = '030'">
				<xsl:text>Human resources</xsl:text>
			</xsl:when>
			<xsl:when test=". = '031'">
				<xsl:text>Photography</xsl:text>
			</xsl:when>
			<xsl:when test=". = '032'">
				<xsl:text>Information systems and technology</xsl:text>
			</xsl:when>
			<xsl:when test=". = '033'">
				<xsl:text>Laboratory</xsl:text>
			</xsl:when>
			<xsl:when test=". = '034'">
				<xsl:text>Land administration</xsl:text>
			</xsl:when>
			<xsl:when test=". = '035'">
				<xsl:text>Mineral occurrences</xsl:text>
			</xsl:when>
			<xsl:when test=". = '036'">
				<xsl:text>Mineral processing</xsl:text>
			</xsl:when>
			<xsl:when test=". = '037'">
				<xsl:text>Mining</xsl:text>
			</xsl:when>
			<xsl:when test=". = '038'">
				<xsl:text>Business record</xsl:text>
			</xsl:when>
			<xsl:when test=". = '039'">
				<xsl:text>Unknown</xsl:text>
			</xsl:when>
			<!-- END: Esri customization -->
		</xsl:choose>
	</xsl:template>
	<xsl:template name="topologyCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>geometryOnly</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>topology1D</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>planarGraph</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>fullPlanarGraph</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>surfaceGraph</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>fullSurfaceGraph</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>topology3D</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>fullTopology3D</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>abstract</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="couplTypCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>loose</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>mixed</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>tight</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="dcpCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>XML</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>CORBA</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>JAVA</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>COM</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>SQL</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>WebServices</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="paramDirCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>in</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>out</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>in/out</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="fileFormatCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>bil</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>bmp</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>bsq</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>bzip2</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>cdr</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>cgm</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>cover</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>csv</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>dbf</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>dgn</xsl:text>
			</xsl:when>
			<xsl:when test=". = '011'">
				<xsl:text>doc</xsl:text>
			</xsl:when>
			<xsl:when test=". = '012'">
				<xsl:text>dwg</xsl:text>
			</xsl:when>
			<xsl:when test=". = '013'">
				<xsl:text>dxf</xsl:text>
			</xsl:when>
			<xsl:when test=". = '014'">
				<xsl:text>e00</xsl:text>
			</xsl:when>
			<xsl:when test=". = '015'">
				<xsl:text>ecw</xsl:text>
			</xsl:when>
			<xsl:when test=". = '016'">
				<xsl:text>eps</xsl:text>
			</xsl:when>
			<xsl:when test=". = '017'">
				<xsl:text>ers</xsl:text>
			</xsl:when>
			<xsl:when test=". = '018'">
				<xsl:text>gdb</xsl:text>
			</xsl:when>
			<xsl:when test=". = '019'">
				<xsl:text>geotiff</xsl:text>
			</xsl:when>
			<xsl:when test=". = '020'">
				<xsl:text>gif</xsl:text>
			</xsl:when>
			<xsl:when test=". = '021'">
				<xsl:text>gml</xsl:text>
			</xsl:when>
			<xsl:when test=". = '022'">
				<xsl:text>grid</xsl:text>
			</xsl:when>
			<xsl:when test=". = '023'">
				<xsl:text>gzip</xsl:text>
			</xsl:when>
			<xsl:when test=". = '024'">
				<xsl:text>html</xsl:text>
			</xsl:when>
			<xsl:when test=". = '025'">
				<xsl:text>jpg</xsl:text>
			</xsl:when>
			<xsl:when test=". = '026'">
				<xsl:text>mdb</xsl:text>
			</xsl:when>
			<xsl:when test=". = '027'">
				<xsl:text>mif</xsl:text>
			</xsl:when>
			<xsl:when test=". = '028'">
				<xsl:text>pbm</xsl:text>
			</xsl:when>
			<xsl:when test=". = '029'">
				<xsl:text>pdf</xsl:text>
			</xsl:when>
			<xsl:when test=". = '030'">
				<xsl:text>png</xsl:text>
			</xsl:when>
			<xsl:when test=". = '031'">
				<xsl:text>ps</xsl:text>
			</xsl:when>
			<xsl:when test=". = '032'">
				<xsl:text>rtf</xsl:text>
			</xsl:when>
			<xsl:when test=". = '033'">
				<xsl:text>sdc</xsl:text>
			</xsl:when>
			<xsl:when test=". = '034'">
				<xsl:text>shp</xsl:text>
			</xsl:when>
			<xsl:when test=". = '035'">
				<xsl:text>sid</xsl:text>
			</xsl:when>
			<xsl:when test=". = '036'">
				<xsl:text>svg</xsl:text>
			</xsl:when>
			<xsl:when test=". = '037'">
				<xsl:text>tab</xsl:text>
			</xsl:when>
			<xsl:when test=". = '038'">
				<xsl:text>tar</xsl:text>
			</xsl:when>
			<xsl:when test=". = '039'">
				<xsl:text>tiff</xsl:text>
			</xsl:when>
			<xsl:when test=". = '040'">
				<xsl:text>txt</xsl:text>
			</xsl:when>
			<xsl:when test=". = '041'">
				<xsl:text>xhtml</xsl:text>
			</xsl:when>
			<xsl:when test=". = '042'">
				<xsl:text>xls</xsl:text>
			</xsl:when>
			<xsl:when test=". = '043'">
				<xsl:text>xml</xsl:text>
			</xsl:when>
			<xsl:when test=". = '044'">
				<xsl:text>xwd</xsl:text>
			</xsl:when>
			<xsl:when test=". = '045'">
				<xsl:text>zip</xsl:text>
			</xsl:when>
			<xsl:when test=". = '046'">
				<xsl:text>wpd</xsl:text>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="lang639_code" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
		<xsl:variable name="lang">
			<xsl:choose>
				<xsl:when test="function-available('esri:strtolower')">
					<xsl:value-of select="esri:strtolower(.)"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="."/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:choose>
			<xsl:when test="($lang = 'aa') or ($lang = 'aar') or ($lang = 'afar')">aar</xsl:when>
			<xsl:when test="($lang = 'ab') or ($lang = 'abk') or ($lang = 'abkhazian') or ($lang = 'abkhaze')">abk</xsl:when>
			<xsl:when test="($lang = 'ace') or ($lang = 'achinese') or ($lang = 'aceh')">ace</xsl:when>
			<xsl:when test="($lang = 'ach') or ($lang = 'acoli')">ach</xsl:when>
			<xsl:when test="($lang = 'ada') or ($lang = 'adangme')">ada</xsl:when>
			<xsl:when test="($lang = 'ady') or ($lang = 'adyghe') or ($lang = 'adygei') or ($lang = 'adygh&amp;#233;')">ady</xsl:when>
			<xsl:when test="($lang = 'afa') or ($lang = 'afro-asiatic languages') or ($lang = 'afro-asiatique langues')">afa</xsl:when>
			<xsl:when test="($lang = 'afh') or ($lang = 'afrihili')">afh</xsl:when>
			<xsl:when test="($lang = 'af') or ($lang = 'afr') or ($lang = 'afrikaans')">afr</xsl:when>
			<xsl:when test="($lang = 'ain') or ($lang = 'ainu') or ($lang = 'a&amp;#239;nou')">ain</xsl:when>
			<xsl:when test="($lang = 'ak') or ($lang = 'aka') or ($lang = 'akan')">aka</xsl:when>
			<xsl:when test="($lang = 'akk') or ($lang = 'akkadian') or ($lang = 'akkadien')">akk</xsl:when>
			<xsl:when test="($lang = 'sq') or ($lang = 'sqi') or ($lang = 'alb') or ($lang = 'albanian') or ($lang = 'albanais')">alb</xsl:when>
			<xsl:when test="($lang = 'ale') or ($lang = 'aleut') or ($lang = 'al&amp;#233;oute')">ale</xsl:when>
			<xsl:when test="($lang = 'alg') or ($lang = 'algonquian languages') or ($lang = 'algonquines, langues')">alg</xsl:when>
			<xsl:when test="($lang = 'alt') or ($lang = 'southern altai') or ($lang = 'altai du Sud')">alt</xsl:when>
			<xsl:when test="($lang = 'am') or ($lang = 'amh') or ($lang = 'amharic') or ($lang = 'amharique')">amh</xsl:when>
			<xsl:when test="($lang = 'ang') or ($lang = 'English, Old (ca.450-1100)') or ($lang = 'anglo-saxon (ca.450-1100)')">ang</xsl:when>
			<xsl:when test="($lang = 'anp') or ($lang = 'angika')">anp</xsl:when>
			<xsl:when test="($lang = 'apa') or ($lang = 'apache languages') or ($lang = 'apaches, langues')">apa</xsl:when>
			<xsl:when test="($lang = 'ar') or ($lang = 'ara') or ($lang = 'arabic') or ($lang = 'arabe')">ara</xsl:when>
			<xsl:when test="($lang = 'arc') or ($lang = 'Official Aramaic (700-300 BCE); Imperial Aramaic (700-300 BCE)') or ($lang = 'aram&amp;#233;en d&amp;apos;empire (700-300 BCE)')">arc</xsl:when>
			<xsl:when test="($lang = 'an') or ($lang = 'arg') or ($lang = 'aragonese') or ($lang = 'aragonais')">arg</xsl:when>
			<xsl:when test="($lang = 'hy') or ($lang = 'hye') or ($lang = 'arm') or ($lang = 'armenian') or ($lang = 'arm&amp;#233;nien')">arm</xsl:when>
			<xsl:when test="($lang = 'arn') or ($lang = 'mapudungun; mapuche') or ($lang = 'mapudungun; mapuche; mapuce')">arn</xsl:when>
			<xsl:when test="($lang = 'arp') or ($lang = 'arapaho')">arp</xsl:when>
			<xsl:when test="($lang = 'art') or ($lang = 'artificial, languages') or ($lang = 'artificielles, langues')">art</xsl:when>
			<xsl:when test="($lang = 'arw') or ($lang = 'arawak')">arw</xsl:when>
			<xsl:when test="($lang = 'as') or ($lang = 'asm') or ($lang = 'assamese') or ($lang = 'assamais')">asm</xsl:when>
			<xsl:when test="($lang = 'ast') or ($lang = 'asturian; bable; leonese; asturoleonese') or ($lang = 'asturien; bable; l&amp;#233;onais; asturol&amp;#233;onais')">ast</xsl:when>
			<xsl:when test="($lang = 'ath') or ($lang = 'athapascan languages') or ($lang = 'athapascanes, langues')">ath</xsl:when>
			<xsl:when test="($lang = 'aus') or ($lang = 'australian languages') or ($lang = 'australiennes, langues')">aus</xsl:when>
			<xsl:when test="($lang = 'av') or ($lang = 'ava') or ($lang = 'avaric') or ($lang = 'avar')">ava</xsl:when>
			<xsl:when test="($lang = 'ae') or ($lang = 'ave') or ($lang = 'avestan') or ($lang = 'avestique')">ave</xsl:when>
			<xsl:when test="($lang = 'ay') or ($lang = 'aym') or ($lang = 'aymara')">aym</xsl:when>
			<xsl:when test="($lang = 'awa') or ($lang = 'awadhi')">awa</xsl:when>
			<xsl:when test="($lang = 'az') or ($lang = 'aze') or ($lang = 'azerbaijani') or ($lang = 'az&amp;#233;ri')">aze</xsl:when>
			<xsl:when test="($lang = 'bad') or ($lang = 'banda languages') or ($lang = 'banda, langues')">bad</xsl:when>
			<xsl:when test="($lang = 'bai') or ($lang = 'bamileke languages') or ($lang = 'bamil&amp;#233;k&amp;#233;, langues')">bai</xsl:when>
			<xsl:when test="($lang = 'ba') or ($lang = 'bak') or ($lang = 'bashkir') or ($lang = 'bachkir')">bak</xsl:when>
			<xsl:when test="($lang = 'bal') or ($lang = 'baluchi') or ($lang = 'baloutchi')">bal</xsl:when>
			<xsl:when test="($lang = 'bm') or ($lang = 'bam') or ($lang = 'bambara')">bam</xsl:when>
			<xsl:when test="($lang = 'ban') or ($lang = 'balinese') or ($lang = 'balinais')">ban</xsl:when>
			<xsl:when test="($lang = 'eu') or ($lang = 'eus') or ($lang = 'baq') or ($lang = 'basque')">baq</xsl:when>
			<xsl:when test="($lang = 'bas') or ($lang = 'basa')">bas</xsl:when>
			<xsl:when test="($lang = 'bat') or ($lang = 'baltic languages') or ($lang = 'baltes, langues')">bat</xsl:when>
			<xsl:when test="($lang = 'bej') or ($lang = 'beja; bedawiyet') or ($lang = 'bedja')">bej</xsl:when>
			<xsl:when test="($lang = 'be') or ($lang = 'bel') or ($lang = 'belarusian') or ($lang = 'bi&amp;#233;lorusse')">bel</xsl:when>
			<xsl:when test="($lang = 'bem') or ($lang = 'bemba')">bem</xsl:when>
			<xsl:when test="($lang = 'bn') or ($lang = 'ben') or ($lang = 'bengali')">ben</xsl:when>
			<xsl:when test="($lang = 'ber') or ($lang = 'berber languages') or ($lang = 'berb&amp;#232;res, langues')">ber</xsl:when>
			<xsl:when test="($lang = 'bho') or ($lang = 'bhojpuri')">bho</xsl:when>
			<xsl:when test="($lang = 'bh') or ($lang = 'bih') or ($lang = 'bihari') or ($lang = 'bihari languages') or ($lang = 'langues biharis')">bih</xsl:when>
			<xsl:when test="($lang = 'bik') or ($lang = 'bikol')">bik</xsl:when>
			<xsl:when test="($lang = 'bin') or ($lang = 'bini; edo')">bin</xsl:when>
			<xsl:when test="($lang = 'bi') or ($lang = 'bis') or ($lang = 'bislama') or ($lang = 'bichlamar')">bis</xsl:when>
			<xsl:when test="($lang = 'bla') or ($lang = 'siksika') or ($lang = 'blackfoot')">bla</xsl:when>
			<xsl:when test="($lang = 'bnt') or ($lang = 'bantu (other)') or ($lang = 'bantoues, autres langues')">bnt</xsl:when>
			<xsl:when test="($lang = 'bs') or ($lang = 'bos') or ($lang = 'bosnian') or ($lang = 'bosniaque')">bos</xsl:when>
			<xsl:when test="($lang = 'bra') or ($lang = 'braj')">bra</xsl:when>
			<xsl:when test="($lang = 'br') or ($lang = 'bre') or ($lang = 'breton')">bre</xsl:when>
			<xsl:when test="($lang = 'btk') or ($lang = 'batak languages') or ($lang = 'batak, langues')">btk</xsl:when>
			<xsl:when test="($lang = 'bua') or ($lang = 'buriat') or ($lang = 'bouriate')">bua</xsl:when>
			<xsl:when test="($lang = 'bug') or ($lang = 'buginese') or ($lang = 'bugi')">bug</xsl:when>
			<xsl:when test="($lang = 'bg') or ($lang = 'bul') or ($lang = 'bulgarian') or ($lang = 'bulgare')">bul</xsl:when>
			<xsl:when test="($lang = 'my') or ($lang = 'mya') or ($lang = 'bur') or ($lang = 'burmese') or ($lang = 'birman')">bur</xsl:when>
			<xsl:when test="($lang = 'byn') or ($lang = 'blin; bilin') or ($lang = 'blin; bilen')">byn</xsl:when>
			<xsl:when test="($lang = 'cad') or ($lang = 'caddo')">cad</xsl:when>
			<xsl:when test="($lang = 'cai') or ($lang = 'central american indian languages') or ($lang = 'am&amp;#233;rindiennes de l&amp;apos;Am&amp;#233;rique centrale, langues')">cai</xsl:when>
			<xsl:when test="($lang = 'car') or ($lang = 'galibi; carib') or ($lang = 'karib; galibi; carib')">car</xsl:when>
			<xsl:when test="($lang = 'ca') or ($lang = 'cat') or ($lang = 'catalan; valencian') or ($lang = 'catalan; valencien')">cat</xsl:when>
			<xsl:when test="($lang = 'cau') or ($lang = 'caucasian languages') or ($lang = 'caucasiennes, langues')">cau</xsl:when>
			<xsl:when test="($lang = 'ceb') or ($lang = 'cebuano')">ceb</xsl:when>
			<xsl:when test="($lang = 'cel') or ($lang = 'celtic languages') or ($lang = 'celtiques, langues; celtes, langues')">cel</xsl:when>
			<xsl:when test="($lang = 'ch') or ($lang = 'cha') or ($lang = 'chamorro')">cha</xsl:when>
			<xsl:when test="($lang = 'chb') or ($lang = 'chibcha')">chb</xsl:when>
			<xsl:when test="($lang = 'ce') or ($lang = 'che') or ($lang = 'chechen') or ($lang = 'tch&amp;#233;tch&amp;#232;ne')">che</xsl:when>
			<xsl:when test="($lang = 'chg') or ($lang = 'chagatai') or ($lang = 'djaghata&amp;#239;')">chg</xsl:when>
			<xsl:when test="($lang = 'zh') or ($lang = 'zho') or ($lang = 'chi') or ($lang = 'chinese') or ($lang = 'chinois')">chi</xsl:when>
			<xsl:when test="($lang = 'chk') or ($lang = 'chuukese') or ($lang = 'chuuk')">chk</xsl:when>
			<xsl:when test="($lang = 'chm') or ($lang = 'mari')">chm</xsl:when>
			<xsl:when test="($lang = 'chn') or ($lang = 'chinook jargon') or ($lang = 'chinook, jargon')">chn</xsl:when>
			<xsl:when test="($lang = 'cho') or ($lang = 'choctaw')">cho</xsl:when>
			<xsl:when test="($lang = 'chp') or ($lang = 'chipewyan; dene suline') or ($lang = 'chipewyan')">chp</xsl:when>
			<xsl:when test="($lang = 'chr') or ($lang = 'cherokee')">chr</xsl:when>
			<xsl:when test="($lang = 'cu') or ($lang = 'chu') or ($lang = 'Church Slavic; Old Slavonic; Church Slavonic; Old Bulgarian; Old Church Slavonic') or ($lang = 'slavon d&amp;apos;&amp;#233;glise; vieux slave; slavon liturgique; vieux bulgare')">chu</xsl:when>
			<xsl:when test="($lang = 'cv') or ($lang = 'chv') or ($lang = 'chuvash') or ($lang = 'tchouvache')">chv</xsl:when>
			<xsl:when test="($lang = 'chy') or ($lang = 'cheyenne')">chy</xsl:when>
			<xsl:when test="($lang = 'cmc') or ($lang = 'chamic languages') or ($lang = 'chames, langues')">cmc</xsl:when>
			<xsl:when test="($lang = 'cop') or ($lang = 'coptic') or ($lang = 'copte')">cop</xsl:when>
			<xsl:when test="($lang = 'kw') or ($lang = 'cor') or ($lang = 'cornish') or ($lang = 'cornique')">cor</xsl:when>
			<xsl:when test="($lang = 'co') or ($lang = 'cos') or ($lang = 'corsican') or ($lang = 'corse')">cos</xsl:when>
			<xsl:when test="($lang = 'cpe') or ($lang = 'Creoles and pidgins, English based') or ($lang = 'cr&amp;#233;oles et pidgins bas&amp;#233;s sur l&amp;apos;anglais')">cpe</xsl:when>
			<xsl:when test="($lang = 'cpf') or ($lang = 'Creoles and pidgins, French based') or ($lang = 'cr&amp;#233;oles et pidgins bas&amp;#233;s sur le fran&amp;#231;ais')">cpf</xsl:when>
			<xsl:when test="($lang = 'cpp') or ($lang = 'Creoles and pidgins, Portugese based') or ($lang = 'cr&amp;#233;oles et pidgins bas&amp;#233;s sur le portugais')">cpp</xsl:when>
			<xsl:when test="($lang = 'cr') or ($lang = 'cre') or ($lang = 'cree')">cre</xsl:when>
			<xsl:when test="($lang = 'crh') or ($lang = 'crimean tatar, crimean turkish') or ($lang = 'tatar de crim&amp;#233;')">crh</xsl:when>
			<xsl:when test="($lang = 'crp') or ($lang = 'creoles et pidgins') or ($lang = 'cr&amp;#233;oles et pidgins')">crp</xsl:when>
			<xsl:when test="($lang = 'csb') or ($lang = 'kashubian') or ($lang = 'kachoube')">csb</xsl:when>
			<xsl:when test="($lang = 'cus') or ($lang = 'cushitic languages') or ($lang = 'couchitiques, langues')">cus</xsl:when>
			<xsl:when test="($lang = 'cs') or ($lang = 'ces') or ($lang = 'cze') or ($lang = 'czech') or ($lang = 'tch&amp;#232;que')">cze</xsl:when>
			<xsl:when test="($lang = 'dak') or ($lang = 'dakota')">dak</xsl:when>
			<xsl:when test="($lang = 'da') or ($lang = 'dan') or ($lang = 'danish') or ($lang = 'danois')">dan</xsl:when>
			<xsl:when test="($lang = 'dar') or ($lang = 'dargwa')">dar</xsl:when>
			<xsl:when test="($lang = 'day') or ($lang = 'land dayak languages') or ($lang = 'dayak, langues')">day</xsl:when>
			<xsl:when test="($lang = 'del') or ($lang = 'delaware')">del</xsl:when>
			<xsl:when test="($lang = 'den') or ($lang = 'slave (athapascan)') or ($lang = 'esclave (athapascan)')">den</xsl:when>
			<xsl:when test="($lang = 'dgr') or ($lang = 'dogrib')">dgr</xsl:when>
			<xsl:when test="($lang = 'din') or ($lang = 'dinka')">din</xsl:when>
			<xsl:when test="($lang = 'dv') or ($lang = 'div') or ($lang = 'divehi; dhivehi; maldivian') or ($lang = 'maldivien')">div</xsl:when>
			<xsl:when test="($lang = 'doi') or ($lang = 'dogri')">doi</xsl:when>
			<xsl:when test="($lang = 'dra') or ($lang = 'dravidian languages') or ($lang = 'dravidiennes, langues')">dra</xsl:when>
			<xsl:when test="($lang = 'dsb') or ($lang = 'lower sorbian') or ($lang = 'bas-sorabe')">dsb</xsl:when>
			<xsl:when test="($lang = 'dua') or ($lang = 'duala') or ($lang = 'douala')">dua</xsl:when>
			<xsl:when test="($lang = 'dum') or ($lang = 'dutch, middle (ca. 1050-1350)') or ($lang = 'n&amp;#233;erlandais moyen (ca. 1050-1350)')">dum</xsl:when>
			<xsl:when test="($lang = 'nl') or ($lang = 'nld') or ($lang = 'dut') or ($lang = 'dutch; flemish') or ($lang = 'n&amp;#233;erlandais; flamand')">dut</xsl:when>
			<xsl:when test="($lang = 'dyu') or ($lang = 'dyula') or ($lang = 'dioula')">dyu</xsl:when>
			<xsl:when test="($lang = 'dz') or ($lang = 'dzo') or ($lang = 'dzongkha')">dzo</xsl:when>
			<xsl:when test="($lang = 'efi') or ($lang = 'efik')">efi</xsl:when>
			<xsl:when test="($lang = 'egy') or ($lang = 'egyptian') or ($lang = '&amp;#233;gyptien')">egy</xsl:when>
			<xsl:when test="($lang = 'eka') or ($lang = 'ekajuk')">eka</xsl:when>
			<xsl:when test="($lang = 'elx') or ($lang = 'elamite') or ($lang = '&amp;#233;lamite')">elx</xsl:when>
			<xsl:when test="($lang = 'en') or ($lang = 'eng') or ($lang = 'english') or ($lang = 'anglais')">eng</xsl:when>
			<xsl:when test="($lang = 'enm') or ($lang = 'english, middle (1100-1500)') or ($lang = 'anglais moyen (1100-1500)')">enm</xsl:when>
			<xsl:when test="($lang = 'eo') or ($lang = 'epo') or ($lang = 'esperanto') or ($lang = 'esp&amp;#233;ranto')">epo</xsl:when>
			<xsl:when test="($lang = 'et') or ($lang = 'est') or ($lang = 'estonian') or ($lang = 'estonien')">est</xsl:when>
			<xsl:when test="($lang = 'ee') or ($lang = 'ewe') or ($lang = 'ewe') or ($lang = '&amp;#233;w&amp;#233;')">ewe</xsl:when>
			<xsl:when test="($lang = 'ewo') or ($lang = 'ewondo') or ($lang = '&amp;#233;wondo')">ewo</xsl:when>
			<xsl:when test="($lang = 'fan') or ($lang = 'fang')">fan</xsl:when>
			<xsl:when test="($lang = 'fo') or ($lang = 'fao') or ($lang = 'faroese') or ($lang = 'f&amp;#233;ro&amp;#239;en')">fao</xsl:when>
			<xsl:when test="($lang = 'fat') or ($lang = 'fanti')">fat</xsl:when>
			<xsl:when test="($lang = 'fj') or ($lang = 'fij') or ($lang = 'fijian') or ($lang = 'fidjien')">fij</xsl:when>
			<xsl:when test="($lang = 'fil') or ($lang = 'filipino; pilipino')">fil</xsl:when>
			<xsl:when test="($lang = 'fi') or ($lang = 'fin') or ($lang = 'finnish') or ($lang = 'finnois')">fin</xsl:when>
			<xsl:when test="($lang = 'fiu') or ($lang = 'finno-ugrian languages') or ($lang = 'finno-ougriennes, langues')">fiu</xsl:when>
			<xsl:when test="($lang = 'fon') or ($lang = 'fon')">fon</xsl:when>
			<xsl:when test="($lang = 'fr') or ($lang = 'fra') or ($lang = 'fre') or ($lang = 'french') or ($lang = 'fran&amp;#231;ais')">fre</xsl:when>
			<xsl:when test="($lang = 'frm') or ($lang = 'french, middle (1400-1600)') or ($lang = 'fran&amp;#231;ais moyen (1400-1600)')">frm</xsl:when>
			<xsl:when test="($lang = 'fro') or ($lang = 'french, ancient (842-ca.1400)') or ($lang = 'fran&amp;#231;ais ancien (842-ca.1400)')">fro</xsl:when>
			<xsl:when test="($lang = 'frr') or ($lang = 'northern frisian') or ($lang = 'frison septentrional')">frr</xsl:when>
			<xsl:when test="($lang = 'frs') or ($lang = 'eastern frisian') or ($lang = 'frison oriental')">frs</xsl:when>
			<xsl:when test="($lang = 'fy') or ($lang = 'fry') or ($lang = 'western frisian') or ($lang = 'frison occidental')">fry</xsl:when>
			<xsl:when test="($lang = 'ff') or ($lang = 'ful') or ($lang = 'fulah') or ($lang = 'peul')">ful</xsl:when>
			<xsl:when test="($lang = 'fur') or ($lang = 'friulian') or ($lang = 'frioulan')">fur</xsl:when>
			<xsl:when test="($lang = 'gaa') or ($lang = 'ga')">gaa</xsl:when>
			<xsl:when test="($lang = 'gay') or ($lang = 'gayo')">gay</xsl:when>
			<xsl:when test="($lang = 'gba') or ($lang = 'gbaya')">gba</xsl:when>
			<xsl:when test="($lang = 'gem') or ($lang = 'germanic languages') or ($lang = 'germaniques, langues')">gem</xsl:when>
			<xsl:when test="($lang = 'ka') or ($lang = 'kat') or ($lang = 'geo') or ($lang = 'georgian') or ($lang = 'g&amp;#233;orgien')">geo</xsl:when>
			<xsl:when test="($lang = 'de') or ($lang = 'deu') or ($lang = 'ger') or ($lang = 'german') or ($lang = 'allemand')">ger</xsl:when>
			<xsl:when test="($lang = 'gez') or ($lang = 'geez') or ($lang = 'gu&amp;#232;ze')">gez</xsl:when>
			<xsl:when test="($lang = 'gil') or ($lang = 'gilbertese') or ($lang = 'kiribati')">gil</xsl:when>
			<xsl:when test="($lang = 'gd') or ($lang = 'gla') or ($lang = 'gaelic; scottish gaelic') or ($lang = 'ga&amp;#233;lique; ga&amp;#233;lique &amp;#233;cossais')">gla</xsl:when>
			<xsl:when test="($lang = 'ga') or ($lang = 'gle') or ($lang = 'irish') or ($lang = 'irlandais')">gle</xsl:when>
			<xsl:when test="($lang = 'gl') or ($lang = 'glg') or ($lang = 'galician') or ($lang = 'galicien')">glg</xsl:when>
			<xsl:when test="($lang = 'gv') or ($lang = 'glv') or ($lang = 'manx') or ($lang = 'manx; mannois')">glv</xsl:when>
			<xsl:when test="($lang = 'gmh') or ($lang = 'german, middle high (ca. 1050-1500)') or ($lang = 'allemand, moyen haut (ca. 1050-1500)')">gmh</xsl:when>
			<xsl:when test="($lang = 'goh') or ($lang = 'german, old high (ca. 750-1050)') or ($lang = 'allemand, vieux haut (ca. 750-1050)')">goh</xsl:when>
			<xsl:when test="($lang = 'gon') or ($lang = 'gondi') or ($lang = 'gond')">gon</xsl:when>
			<xsl:when test="($lang = 'gor') or ($lang = 'gorontalo')">gor</xsl:when>
			<xsl:when test="($lang = 'got') or ($lang = 'gothic') or ($lang = 'gothique')">got</xsl:when>
			<xsl:when test="($lang = 'grb') or ($lang = 'grebo')">grb</xsl:when>
			<xsl:when test="($lang = 'grc') or ($lang = 'greek, ancient (to 1453)') or ($lang = 'grec ancien (jusqu&amp;apos;&amp;#224; 1453)')">grc</xsl:when>
			<xsl:when test="($lang = 'el') or ($lang = 'ell') or ($lang = 'gre') or ($lang = 'greek, modern (1453-)') or ($lang = 'grec moderne (apr&amp;#232;s 1453)')">gre</xsl:when>
			<xsl:when test="($lang = 'gn') or ($lang = 'grn') or ($lang = 'guarani')">grn</xsl:when>
			<xsl:when test="($lang = 'gsw') or ($lang = 'swiss german; alemannic; alsatian') or ($lang = 'suisse al&amp;#233;manique; al&amp;#233;manique; alsacien')">gsw</xsl:when>
			<xsl:when test="($lang = 'gu') or ($lang = 'guj') or ($lang = 'gujarati') or ($lang = 'goudjrati')">guj</xsl:when>
			<xsl:when test="($lang = 'gwi') or ($lang = 'gwich&amp;apos;in')">gwi</xsl:when>
			<xsl:when test="($lang = 'hai') or ($lang = 'haida')">hai</xsl:when>
			<xsl:when test="($lang = 'ht') or ($lang = 'hat') or ($lang = 'haitian; haitian creole') or ($lang = 'ha&amp;#239;tien; cr&amp;#233;ole ha&amp;#239;tien')">hat</xsl:when>
			<xsl:when test="($lang = 'ha') or ($lang = 'hau') or ($lang = 'hausa') or ($lang = 'haoussa')">hau</xsl:when>
			<xsl:when test="($lang = 'haw') or ($lang = 'hawaiian') or ($lang = 'hawa&amp;#239;en')">haw</xsl:when>
			<xsl:when test="($lang = 'he') or ($lang = 'heb') or ($lang = 'hebrew') or ($lang = 'h&amp;#233;breu')">heb</xsl:when>
			<xsl:when test="($lang = 'hz') or ($lang = 'her') or ($lang = 'herero')">her</xsl:when>
			<xsl:when test="($lang = 'hil') or ($lang = 'hiligaynon')">hil</xsl:when>
			<xsl:when test="($lang = 'him') or ($lang = 'himachali') or ($lang = 'himachali languages; western pahari languages') or ($lang = 'langues himachali; langues paharis occidentales')">him</xsl:when>
			<xsl:when test="($lang = 'hi') or ($lang = 'hin') or ($lang = 'hindi')">hin</xsl:when>
			<xsl:when test="($lang = 'hit') or ($lang = 'hittite')">hit</xsl:when>
			<xsl:when test="($lang = 'hmn') or ($lang = 'hmong') or ($lang = 'hmong; mong')">hmn</xsl:when>
			<xsl:when test="($lang = 'ho') or ($lang = 'hmo') or ($lang = 'hiri motu')">hmo</xsl:when>
			<xsl:when test="($lang = 'hr') or ($lang = 'hrv') or ($lang = 'croatian') or ($lang = 'croate')">hrv</xsl:when>
			<xsl:when test="($lang = 'hsb') or ($lang = 'upper sorbian') or ($lang = 'haut-sorabe')">hsb</xsl:when>
			<xsl:when test="($lang = 'hu') or ($lang = 'hun') or ($lang = 'hungarian') or ($lang = 'hongrois')">hun</xsl:when>
			<xsl:when test="($lang = 'hup') or ($lang = 'hupa')">hup</xsl:when>
			<xsl:when test="($lang = 'iba') or ($lang = 'iban')">iba</xsl:when>
			<xsl:when test="($lang = 'ig') or ($lang = 'ibo') or ($lang = 'igbo')">ibo</xsl:when>
			<xsl:when test="($lang = 'is') or ($lang = 'isl') or ($lang = 'ice') or ($lang = 'icelandic') or ($lang = 'islandais')">ice</xsl:when>
			<xsl:when test="($lang = 'io') or ($lang = 'ido')">ido</xsl:when>
			<xsl:when test="($lang = 'ii') or ($lang = 'iii') or ($lang = 'sichuan yi; nuosu') or ($lang = 'yi de sichuan')">iii</xsl:when>
			<xsl:when test="($lang = 'ijo') or ($lang = 'ijo languages') or ($lang = 'ijo, langues')">ijo</xsl:when>
			<xsl:when test="($lang = 'iu') or ($lang = 'iku') or ($lang = 'inuktitut')">iku</xsl:when>
			<xsl:when test="($lang = 'ie') or ($lang = 'ile') or ($lang = 'interlingue; occidental') or ($lang = 'interlingue')">ile</xsl:when>
			<xsl:when test="($lang = 'ilo') or ($lang = 'iloko') or ($lang = 'ilocano')">ilo</xsl:when>
			<xsl:when test="($lang = 'ia') or ($lang = 'ina') or ($lang = 'interlingua (international auxiliary language association)') or ($lang = 'interlingua (langue auxiliaire internationale)')">ina</xsl:when>
			<xsl:when test="($lang = 'inc') or ($lang = 'indic languages') or ($lang = 'indo-aryennes, langues')">inc</xsl:when>
			<xsl:when test="($lang = 'id') or ($lang = 'ind') or ($lang = 'indonesian') or ($lang = 'indon&amp;#233;sien')">ind</xsl:when>
			<xsl:when test="($lang = 'ine') or ($lang = 'indo-european languages') or ($lang = 'indo-europ&amp;#233;ennes, langues')">ine</xsl:when>
			<xsl:when test="($lang = 'inh') or ($lang = 'ingush') or ($lang = 'ingouche')">inh</xsl:when>
			<xsl:when test="($lang = 'ik') or ($lang = 'ipk') or ($lang = 'inupiaq')">ipk</xsl:when>
			<xsl:when test="($lang = 'ira') or ($lang = 'iranian languages') or ($lang = 'iraniennes, langues')">ira</xsl:when>
			<xsl:when test="($lang = 'iro') or ($lang = 'iroquoian languages') or ($lang = 'iroquoises, langues')">iro</xsl:when>
			<xsl:when test="($lang = 'it') or ($lang = 'ita') or ($lang = 'italian') or ($lang = 'italien')">ita</xsl:when>
			<xsl:when test="($lang = 'jv') or ($lang = 'jav') or ($lang = 'javanese') or ($lang = 'javanais')">jav</xsl:when>
			<xsl:when test="($lang = 'jbo') or ($lang = 'lojban')">jbo</xsl:when>
			<xsl:when test="($lang = 'ja') or ($lang = 'jpn') or ($lang = 'japanese') or ($lang = 'japonais')">jpn</xsl:when>
			<xsl:when test="($lang = 'jpr') or ($lang = 'judeo-persian') or ($lang = 'jud&amp;#233;o-persan')">jpr</xsl:when>
			<xsl:when test="($lang = 'jrb') or ($lang = 'judeo-arabic') or ($lang = 'jud&amp;#233;o-arabe')">jrb</xsl:when>
			<xsl:when test="($lang = 'kaa') or ($lang = 'kara-kalpak') or ($lang = 'karakalpak')">kaa</xsl:when>
			<xsl:when test="($lang = 'kab') or ($lang = 'kabyle')">kab</xsl:when>
			<xsl:when test="($lang = 'kac') or ($lang = 'kachin; jingpho')">kac</xsl:when>
			<xsl:when test="($lang = 'kl') or ($lang = 'kal') or ($lang = 'kalaalisut; greenlandic') or ($lang = 'groenlandais')">kal</xsl:when>
			<xsl:when test="($lang = 'kam') or ($lang = 'kamba')">kam</xsl:when>
			<xsl:when test="($lang = 'kn') or ($lang = 'kan') or ($lang = 'kannada')">kan</xsl:when>
			<xsl:when test="($lang = 'kar') or ($lang = 'karen languages') or ($lang = 'karen, langues')">kar</xsl:when>
			<xsl:when test="($lang = 'ks') or ($lang = 'kas') or ($lang = 'kashmiri')">kas</xsl:when>
			<xsl:when test="($lang = 'kr') or ($lang = 'kau') or ($lang = 'kanuri') or ($lang = 'kanouri')">kau</xsl:when>
			<xsl:when test="($lang = 'kaw') or ($lang = 'kawi')">kaw</xsl:when>
			<xsl:when test="($lang = 'kk') or ($lang = 'kaz') or ($lang = 'kazakh')">kaz</xsl:when>
			<xsl:when test="($lang = 'kbd') or ($lang = 'kabardian') or ($lang = 'kabardien')">kbd</xsl:when>
			<xsl:when test="($lang = 'kha') or ($lang = 'khasi')">kha</xsl:when>
			<xsl:when test="($lang = 'khi') or ($lang = 'khoisan languages') or ($lang = 'kho&amp;#239;san, langues')">khi</xsl:when>
			<xsl:when test="($lang = 'km') or ($lang = 'khm') or ($lang = 'central khmer') or ($lang = 'khmer central')">khm</xsl:when>
			<xsl:when test="($lang = 'kho') or ($lang = 'khotanese; sakan') or ($lang = 'khotanais; sakan')">kho</xsl:when>
			<xsl:when test="($lang = 'ki') or ($lang = 'kik') or ($lang = 'kikuyu; gikuyu') or ($lang = 'kKikuyu')">kik</xsl:when>
			<xsl:when test="($lang = 'rw') or ($lang = 'kin') or ($lang = 'kinyarwanda') or ($lang = 'rwanda')">kin</xsl:when>
			<xsl:when test="($lang = 'ky') or ($lang = 'kir') or ($lang = 'kirghiz; kyrgyz') or ($lang = 'kirghiz')">kir</xsl:when>
			<xsl:when test="($lang = 'kmb') or ($lang = 'kimbundu')">kmb</xsl:when>
			<xsl:when test="($lang = 'kok') or ($lang = 'konkani')">kok</xsl:when>
			<xsl:when test="($lang = 'kv') or ($lang = 'kom') or ($lang = 'komi') or ($lang = 'kom')">kom</xsl:when>
			<xsl:when test="($lang = 'kg') or ($lang = 'kon') or ($lang = 'kongo')">kon</xsl:when>
			<xsl:when test="($lang = 'ko') or ($lang = 'kor') or ($lang = 'korean') or ($lang = 'cor&amp;#233;en')">kor</xsl:when>
			<xsl:when test="($lang = 'kos') or ($lang = 'kosraean') or ($lang = 'kosrae')">kos</xsl:when>
			<xsl:when test="($lang = 'kpe') or ($lang = 'kpelle') or ($lang = 'kpell&amp;#233;')">kpe</xsl:when>
			<xsl:when test="($lang = 'krc') or ($lang = 'karachay-balkar') or ($lang = 'karatchai balkar')">krc</xsl:when>
			<xsl:when test="($lang = 'krl') or ($lang = 'karelian') or ($lang = 'car&amp;#233;lien')">krl</xsl:when>
			<xsl:when test="($lang = 'kro') or ($lang = 'kru languages') or ($lang = 'krou, langues')">kro</xsl:when>
			<xsl:when test="($lang = 'kru') or ($lang = 'kurukh')">kru</xsl:when>
			<xsl:when test="($lang = 'kj') or ($lang = 'kua') or ($lang = 'kuanyama; kwanyama')">kua</xsl:when>
			<xsl:when test="($lang = 'kum') or ($lang = 'kumyk') or ($lang = 'koumyk')">kum</xsl:when>
			<xsl:when test="($lang = 'ku') or ($lang = 'kur') or ($lang = 'kurdish') or ($lang = 'kurde')">kur</xsl:when>
			<xsl:when test="($lang = 'kut') or ($lang = 'kutenai')">kut</xsl:when>
			<xsl:when test="($lang = 'lad') or ($lang = 'ladino') or ($lang = 'jud&amp;#233;o-espagnol')">lad</xsl:when>
			<xsl:when test="($lang = 'lah') or ($lang = 'lahnda')">lah</xsl:when>
			<xsl:when test="($lang = 'lam') or ($lang = 'lamba')">lam</xsl:when>
			<xsl:when test="($lang = 'lo') or ($lang = 'lao')">lao</xsl:when>
			<xsl:when test="($lang = 'la') or ($lang = 'lat') or ($lang = 'latin')">lat</xsl:when>
			<xsl:when test="($lang = 'lv') or ($lang = 'lav') or ($lang = 'latvian') or ($lang = 'letton')">lav</xsl:when>
			<xsl:when test="($lang = 'lez') or ($lang = 'lezghian') or ($lang = 'lezghien')">lez</xsl:when>
			<xsl:when test="($lang = 'li') or ($lang = 'lim') or ($lang = 'limburgan; limburger; limburgish') or ($lang = 'limbourgeois')">lim</xsl:when>
			<xsl:when test="($lang = 'ln') or ($lang = 'lin') or ($lang = 'lingala')">lin</xsl:when>
			<xsl:when test="($lang = 'lt') or ($lang = 'lit') or ($lang = 'lithuanian') or ($lang = 'lituanien')">lit</xsl:when>
			<xsl:when test="($lang = 'lol') or ($lang = 'mongo')">lol</xsl:when>
			<xsl:when test="($lang = 'loz') or ($lang = 'lozi')">loz</xsl:when>
			<xsl:when test="($lang = 'lb') or ($lang = 'ltz') or ($lang = 'luxembourgish; letzeburgesch') or ($lang = 'luxembourgeois')">ltz</xsl:when>
			<xsl:when test="($lang = 'lua') or ($lang = 'luba-lulua')">lua</xsl:when>
			<xsl:when test="($lang = 'lu') or ($lang = 'lub') or ($lang = 'luba-katanga')">lub</xsl:when>
			<xsl:when test="($lang = 'lg') or ($lang = 'lug') or ($lang = 'ganda')">lug</xsl:when>
			<xsl:when test="($lang = 'lui') or ($lang = 'luiseno')">lui</xsl:when>
			<xsl:when test="($lang = 'lun') or ($lang = 'lunda')">lun</xsl:when>
			<xsl:when test="($lang = 'luo') or ($lang = 'luo (kenya and tanzania)') or ($lang = 'luo (kenya et tanzanie)')">luo</xsl:when>
			<xsl:when test="($lang = 'lus') or ($lang = 'lushai')">lus</xsl:when>
			<xsl:when test="($lang = 'mk') or ($lang = 'mkd') or ($lang = 'mac') or ($lang = 'macedonian') or ($lang = 'mac&amp;#233;donien')">mac</xsl:when>
			<xsl:when test="($lang = 'mad') or ($lang = 'madurese') or ($lang = 'madourais')">mad</xsl:when>
			<xsl:when test="($lang = 'mag') or ($lang = 'magahi')">mag</xsl:when>
			<xsl:when test="($lang = 'mh') or ($lang = 'mah') or ($lang = 'marshallese') or ($lang = 'marshall')">mah</xsl:when>
			<xsl:when test="($lang = 'mai') or ($lang = 'maithili')">mai</xsl:when>
			<xsl:when test="($lang = 'mak') or ($lang = 'makasar') or ($lang = 'makassar')">mak</xsl:when>
			<xsl:when test="($lang = 'ml') or ($lang = 'mal') or ($lang = 'malayalam')">mal</xsl:when>
			<xsl:when test="($lang = 'man') or ($lang = 'mandingo') or ($lang = 'mandingue')">man</xsl:when>
			<xsl:when test="($lang = 'mi') or ($lang = 'mri') or ($lang = 'mao') or ($lang = 'maori')">mao</xsl:when>
			<xsl:when test="($lang = 'map') or ($lang = 'austronesian languages') or ($lang = 'austron&amp;#233;siennes, langues')">map</xsl:when>
			<xsl:when test="($lang = 'mr') or ($lang = 'mar') or ($lang = 'marathi') or ($lang = 'marathe')">mar</xsl:when>
			<xsl:when test="($lang = 'mas') or ($lang = 'masai') or ($lang = 'massa&amp;#239;')">mas</xsl:when>
			<xsl:when test="($lang = 'ms') or ($lang = 'msa') or ($lang = 'may') or ($lang = 'malay') or ($lang = 'malais')">may</xsl:when>
			<xsl:when test="($lang = 'mdf') or ($lang = 'moksha') or ($lang = 'moksa')">mdf</xsl:when>
			<xsl:when test="($lang = 'mdr') or ($lang = 'mandar')">mdr</xsl:when>
			<xsl:when test="($lang = 'men') or ($lang = 'mende') or ($lang = 'mend&amp;#233;')">men</xsl:when>
			<xsl:when test="($lang = 'mga') or ($lang = 'irish, middle (900-1200)') or ($lang = 'irlandais moyen (900-1200)')">mga</xsl:when>
			<xsl:when test="($lang = 'mic') or ($lang = 'mi&amp;apos;kmaq; micmac')">mic</xsl:when>
			<xsl:when test="($lang = 'min') or ($lang = 'minangkabau')">min</xsl:when>
			<xsl:when test="($lang = 'mis') or ($lang = 'uncoded languages') or ($lang = 'langues non cod&amp;#233;es')">mis</xsl:when>
			<xsl:when test="($lang = 'mkh') or ($lang = 'mon-khmer languages') or ($lang = 'm&amp;#244;n-khmer, langues')">mkh</xsl:when>
			<xsl:when test="($lang = 'mg') or ($lang = 'mlg') or ($lang = 'malagasy') or ($lang = 'malgache')">mlg</xsl:when>
			<xsl:when test="($lang = 'mt') or ($lang = 'mlt') or ($lang = 'maltese') or ($lang = 'maltais')">mlt</xsl:when>
			<xsl:when test="($lang = 'mnc') or ($lang = 'manchu') or ($lang = 'mandchou')">mnc</xsl:when>
			<xsl:when test="($lang = 'mni') or ($lang = 'manipuri')">mni</xsl:when>
			<xsl:when test="($lang = 'mno') or ($lang = 'manobo languages') or ($lang = 'manobo, langues')">mno</xsl:when>
			<xsl:when test="($lang = 'moh') or ($lang = 'mohawk')">moh</xsl:when>
			<xsl:when test="($lang = 'mn') or ($lang = 'mon') or ($lang = 'mongolian') or ($lang = 'mongol')">mon</xsl:when>
			<xsl:when test="($lang = 'mos') or ($lang = 'mossi') or ($lang = 'mor&amp;#233;')">mos</xsl:when>
			<xsl:when test="($lang = 'mul') or ($lang = 'multiple languages') or ($lang = 'multilingue')">mul</xsl:when>
			<xsl:when test="($lang = 'mun') or ($lang = 'munda languages') or ($lang = 'mounda, langues')">mun</xsl:when>
			<xsl:when test="($lang = 'mus') or ($lang = 'creek') or ($lang = 'muskogee')">mus</xsl:when>
			<xsl:when test="($lang = 'mwl') or ($lang = 'mirandese') or ($lang = 'mirandais')">mwl</xsl:when>
			<xsl:when test="($lang = 'mwr') or ($lang = 'marwari') or ($lang = 'marvari')">mwr</xsl:when>
			<xsl:when test="($lang = 'myn') or ($lang = 'mayan languages') or ($lang = 'maya, langues')">myn</xsl:when>
			<xsl:when test="($lang = 'myv') or ($lang = 'erzya') or ($lang = 'erza')">myv</xsl:when>
			<xsl:when test="($lang = 'nah') or ($lang = 'nahuatl languages') or ($lang = 'nahuatl, langues')">nah</xsl:when>
			<xsl:when test="($lang = 'nai') or ($lang = 'north american indian languages') or ($lang = 'nord-am&amp;#233;rindiennes, langues')">nai</xsl:when>
			<xsl:when test="($lang = 'nap') or ($lang = 'neapolitan') or ($lang = 'napolitain')">nap</xsl:when>
			<xsl:when test="($lang = 'na') or ($lang = 'nau') or ($lang = 'nauru') or ($lang = 'nauruan')">nau</xsl:when>
			<xsl:when test="($lang = 'nv') or ($lang = 'nav') or ($lang = 'navajo; navaho') or ($lang = 'navaho')">nav</xsl:when>
			<xsl:when test="($lang = 'nr') or ($lang = 'nbl') or ($lang = 'ndebele, south; south ndebele') or ($lang = 'nd&amp;#233;b&amp;#233;l&amp;#233; du sud')">nbl</xsl:when>
			<xsl:when test="($lang = 'nd') or ($lang = 'nde') or ($lang = 'ndebele, north; north ndebele') or ($lang = 'nd&amp;#233;b&amp;#233;l&amp;#233; du nord')">nde</xsl:when>
			<xsl:when test="($lang = 'ng') or ($lang = 'ndo') or ($lang = 'ndonga')">ndo</xsl:when>
			<xsl:when test="($lang = 'nds') or ($lang = 'low german; low saxon; german, low; saxon, low') or ($lang = 'bas allemand; bas saxon; allemand, bas; saxon, bas')">nds</xsl:when>
			<xsl:when test="($lang = 'ne') or ($lang = 'nep') or ($lang = 'nepali') or ($lang = 'n&amp;#233;palais')">nep</xsl:when>
			<xsl:when test="($lang = 'new') or ($lang = 'nepal bhasa; newari')">new</xsl:when>
			<xsl:when test="($lang = 'nia') or ($lang = 'nias')">nia</xsl:when>
			<xsl:when test="($lang = 'nic') or ($lang = 'niger-kordofanian languages') or ($lang = 'nig&amp;#233;ro-kordofaniennes, langues')">nic</xsl:when>
			<xsl:when test="($lang = 'niu') or ($lang = 'niuean') or ($lang = 'niu&amp;#233;')">niu</xsl:when>
			<xsl:when test="($lang = 'nn') or ($lang = 'nno') or ($lang = 'norwegian nynorsk; nynorsk, norwegian') or ($lang = 'norv&amp;#233;gien nynorsk; nynorsk, norv&amp;#233;gien')">nno</xsl:when>
			<xsl:when test="($lang = 'nb') or ($lang = 'nob') or ($lang = 'bokm&amp;#229;l, norwegian; norwegian bokm&amp;#229;l') or ($lang = 'norv&amp;#233;gien bokm&amp;#229;l')">nob</xsl:when>
			<xsl:when test="($lang = 'nog') or ($lang = 'nogai') or ($lang = 'noga&amp;#239;; nogay')">nog</xsl:when>
			<xsl:when test="($lang = 'non') or ($lang = 'norse, old') or ($lang = 'norrois, vieux')">non</xsl:when>
			<xsl:when test="($lang = 'no') or ($lang = 'nor') or ($lang = 'norwegian') or ($lang = 'norv&amp;#233;gien')">nor</xsl:when>
			<xsl:when test="($lang = 'nqo') or ($lang = 'n&amp;apos;ko')">nqo</xsl:when>
			<xsl:when test="($lang = 'nso') or ($lang = 'pedi; sepedi; northern sotho') or ($lang = 'pedi; sepedi; sotho du Nord')">nso</xsl:when>
			<xsl:when test="($lang = 'nub') or ($lang = 'nubian languages') or ($lang = 'nubiennes, langues')">nub</xsl:when>
			<xsl:when test="($lang = 'nwc') or ($lang = 'classical newari; old newari; classical nepal bhasa') or ($lang = 'newari classique')">nwc</xsl:when>
			<xsl:when test="($lang = 'ny') or ($lang = 'nya') or ($lang = 'chichewa; chewa; nyanja')">nya</xsl:when>
			<xsl:when test="($lang = 'nym') or ($lang = 'nyamwezi')">nym</xsl:when>
			<xsl:when test="($lang = 'nyn') or ($lang = 'nyankole') or ($lang = 'nyankol&amp;#233;')">nyn</xsl:when>
			<xsl:when test="($lang = 'nyo') or ($lang = 'nyoro')">nyo</xsl:when>
			<xsl:when test="($lang = 'nzi') or ($lang = 'nzima') or ($lang = 'nzema')">nzi</xsl:when>
			<xsl:when test="($lang = 'oc') or ($lang = 'oci') or ($lang = 'occitan (post 1500); proven&amp;#231;al') or ($lang = 'occitan (apr&amp;#232;s 1500); proven&amp;#231;al')">oci</xsl:when>
			<xsl:when test="($lang = 'oj') or ($lang = 'oji') or ($lang = 'ojibwa')">oji</xsl:when>
			<xsl:when test="($lang = 'or') or ($lang = 'ori') or ($lang = 'oriya')">ori</xsl:when>
			<xsl:when test="($lang = 'om') or ($lang = 'orm') or ($lang = 'oromo') or ($lang = 'galla')">orm</xsl:when>
			<xsl:when test="($lang = 'osa') or ($lang = 'osage')">osa</xsl:when>
			<xsl:when test="($lang = 'os') or ($lang = 'oss') or ($lang = 'ossetian; ossetic') or ($lang = 'oss&amp;#232;te')">oss</xsl:when>
			<xsl:when test="($lang = 'ota') or ($lang = 'turkish, ottoman (1500-1928)') or ($lang = 'turc ottoman (1500-1928)')">ota</xsl:when>
			<xsl:when test="($lang = 'oto') or ($lang = 'otomian languages') or ($lang = 'otomi, langues')">oto</xsl:when>
			<xsl:when test="($lang = 'paa') or ($lang = 'papuan languages') or ($lang = 'papoues, langues')">paa</xsl:when>
			<xsl:when test="($lang = 'pag') or ($lang = 'pangasinan')">pag</xsl:when>
			<xsl:when test="($lang = 'pal') or ($lang = 'pahlavi')">pal</xsl:when>
			<xsl:when test="($lang = 'pam') or ($lang = 'pampanga; kapampangan') or ($lang = 'pampangan')">pam</xsl:when>
			<xsl:when test="($lang = 'pa') or ($lang = 'pan') or ($lang = 'panjabi; punjabi') or ($lang = 'pendjabi')">pan</xsl:when>
			<xsl:when test="($lang = 'pap') or ($lang = 'papiamento')">pap</xsl:when>
			<xsl:when test="($lang = 'pau') or ($lang = 'palauan') or ($lang = 'palau')">pau</xsl:when>
			<xsl:when test="($lang = 'peo') or ($lang = 'persian, old (ca. 600-400 B.C.)') or ($lang = 'perse, vieux (ca. 600-400 av. J.-C.)')">peo</xsl:when>
			<xsl:when test="($lang = 'fa') or ($lang = 'fas') or ($lang = 'per') or ($lang = 'persian') or ($lang = 'persan')">per</xsl:when>
			<xsl:when test="($lang = 'phi') or ($lang = 'philippine languages') or ($lang = 'philippines, langues')">phi</xsl:when>
			<xsl:when test="($lang = 'phn') or ($lang = 'phoenician') or ($lang = 'ph&amp;#233;nicien')">phn</xsl:when>
			<xsl:when test="($lang = 'pi') or ($lang = 'pli') or ($lang = 'pali')">pli</xsl:when>
			<xsl:when test="($lang = 'pl') or ($lang = 'pol') or ($lang = 'polish') or ($lang = 'polonais')">pol</xsl:when>
			<xsl:when test="($lang = 'pon') or ($lang = 'phonpeian') or ($lang = 'phonpei')">pon</xsl:when>
			<xsl:when test="($lang = 'pt') or ($lang = 'por') or ($lang = 'portugese') or ($lang = 'portugais')">por</xsl:when>
			<xsl:when test="($lang = 'pra') or ($lang = 'prakrit languages') or ($lang = 'pr&amp;#226;krit, langues')">pra</xsl:when>
			<xsl:when test="($lang = 'pro') or ($lang = 'proven&amp;#231;al, old (to 1500)') or ($lang = 'proven&amp;#231;al ancien (jusqu&amp;apos;&amp;#224; 1500)')">pro</xsl:when>
			<xsl:when test="($lang = 'ps') or ($lang = 'pus') or ($lang = 'pushto; pashto') or ($lang = 'pachto')">pus</xsl:when>
			<xsl:when test="($lang = 'qu') or ($lang = 'que') or ($lang = 'quechua')">que</xsl:when>
			<xsl:when test="($lang = 'raj') or ($lang = 'rajasthani')">raj</xsl:when>
			<xsl:when test="($lang = 'rap') or ($lang = 'rapanui')">rap</xsl:when>
			<xsl:when test="($lang = 'rar') or ($lang = 'rarotongan; cook islands maori') or ($lang = 'rarotonga; maori des &amp;#238;les Cook')">rar</xsl:when>
			<xsl:when test="($lang = 'roa') or ($lang = 'romance, languages') or ($lang = 'romanes, langues')">roa</xsl:when>
			<xsl:when test="($lang = 'rm') or ($lang = 'roh') or ($lang = 'romansh') or ($lang = 'romanche')">roh</xsl:when>
			<xsl:when test="($lang = 'rom') or ($lang = 'romany') or ($lang = 'tsigane')">rom</xsl:when>
			<xsl:when test="($lang = 'ro') or ($lang = 'ron') or ($lang = 'rum') or ($lang = 'romanian; moldavian; moldovan') or ($lang = 'roumain; moldave')">rum</xsl:when>
			<xsl:when test="($lang = 'rn') or ($lang = 'run') or ($lang = 'rundi')">run</xsl:when>
			<xsl:when test="($lang = 'rup') or ($lang = 'aromanian; arumanian; macedo-roumanian') or ($lang = 'aroumain; mac&amp;#233;do-roumain')">rup</xsl:when>
			<xsl:when test="($lang = 'ru') or ($lang = 'rus') or ($lang = 'russian') or ($lang = 'russe')">rus</xsl:when>
			<xsl:when test="($lang = 'sad') or ($lang = 'sandawe')">sad</xsl:when>
			<xsl:when test="($lang = 'sg') or ($lang = 'sag') or ($lang = 'sango')">sag</xsl:when>
			<xsl:when test="($lang = 'sah') or ($lang = 'yakut') or ($lang = 'iakoute')">sah</xsl:when>
			<xsl:when test="($lang = 'sai') or ($lang = 'south american indian (other)') or ($lang = 'indiennes d&amp;apos;Am&amp;#233;rique du Sud, autres langues')">sai</xsl:when>
			<xsl:when test="($lang = 'sal') or ($lang = 'salishan languages') or ($lang = 'salishennes, langues')">sal</xsl:when>
			<xsl:when test="($lang = 'sam') or ($lang = 'samaritan aramaic') or ($lang = 'samaritain')">sam</xsl:when>
			<xsl:when test="($lang = 'sa') or ($lang = 'san') or ($lang = 'sanskrit')">san</xsl:when>
			<xsl:when test="($lang = 'sas') or ($lang = 'sasak')">sas</xsl:when>
			<xsl:when test="($lang = 'sat') or ($lang = 'santali') or ($lang = 'santal')">sat</xsl:when>
			<xsl:when test="($lang = 'scn') or ($lang = 'sicilian') or ($lang = 'sicilien')">scn</xsl:when>
			<xsl:when test="($lang = 'sco') or ($lang = 'scots') or ($lang = '&amp;#233;cossais')">sco</xsl:when>
			<xsl:when test="($lang = 'sel') or ($lang = 'selkup') or ($lang = 'selkoupe')">sel</xsl:when>
			<xsl:when test="($lang = 'sem') or ($lang = 'semitic languages') or ($lang = 's&amp;#233;mitiques, langues')">sem</xsl:when>
			<xsl:when test="($lang = 'sga') or ($lang = 'irish, old (to 900)') or ($lang = 'irlandais ancien (jusqu&amp;apos;&amp;#224; 900)')">sga</xsl:when>
			<xsl:when test="($lang = 'sgn') or ($lang = 'sign languages') or ($lang = 'langues des signes')">sgn</xsl:when>
			<xsl:when test="($lang = 'shn') or ($lang = 'shan') or ($lang = 'chan')">shn</xsl:when>
			<xsl:when test="($lang = 'sid') or ($lang = 'sidamo')">sid</xsl:when>
			<xsl:when test="($lang = 'si') or ($lang = 'sin') or ($lang = 'sinhala; sinhalese') or ($lang = 'singhalais')">sin</xsl:when>
			<xsl:when test="($lang = 'sio') or ($lang = 'siouan languages') or ($lang = 'sioux, langues')">sio</xsl:when>
			<xsl:when test="($lang = 'sit') or ($lang = 'sino-tibetan languages') or ($lang = 'sino-tib&amp;#233;taines, langues')">sit</xsl:when>
			<xsl:when test="($lang = 'sla') or ($lang = 'slavic languages')">sla</xsl:when>
			<xsl:when test="($lang = 'sk') or ($lang = 'slk') or ($lang = 'slo') or ($lang = 'slovak') or ($lang = 'slovaque')">slo</xsl:when>
			<xsl:when test="($lang = 'sl') or ($lang = 'slv') or ($lang = 'slovenian') or ($lang = 'slov&amp;#232;ne')">slv</xsl:when>
			<xsl:when test="($lang = 'sma') or ($lang = 'southern sami') or ($lang = 'sami du sud')">sma</xsl:when>
			<xsl:when test="($lang = 'se') or ($lang = 'sme') or ($lang = 'northern sami') or ($lang = 'sami du nord')">sme</xsl:when>
			<xsl:when test="($lang = 'smi') or ($lang = 'sami languages') or ($lang = 'sames, langues')">smi</xsl:when>
			<xsl:when test="($lang = 'smj') or ($lang = 'lule sami') or ($lang = 'sami de lule')">smj</xsl:when>
			<xsl:when test="($lang = 'smn') or ($lang = 'inari sami') or ($lang = 'sami d&amp;apos;inari')">smn</xsl:when>
			<xsl:when test="($lang = 'sm') or ($lang = 'smo') or ($lang = 'samoan')">smo</xsl:when>
			<xsl:when test="($lang = 'sms') or ($lang = 'skolt sami') or ($lang = 'sami skolt')">sms</xsl:when>
			<xsl:when test="($lang = 'sn') or ($lang = 'sna') or ($lang = 'shona')">sna</xsl:when>
			<xsl:when test="($lang = 'sd') or ($lang = 'snd') or ($lang = 'sindhi')">snd</xsl:when>
			<xsl:when test="($lang = 'snk') or ($lang = 'soninke') or ($lang = 'sonink&amp;#233;')">snk</xsl:when>
			<xsl:when test="($lang = 'sog') or ($lang = 'sogdian') or ($lang = 'sogdien')">sog</xsl:when>
			<xsl:when test="($lang = 'so') or ($lang = 'som') or ($lang = 'somali')">som</xsl:when>
			<xsl:when test="($lang = 'son') or ($lang = 'songhai languages') or ($lang = 'songhai, langues')">son</xsl:when>
			<xsl:when test="($lang = 'st') or ($lang = 'sot') or ($lang = 'sotho, southern') or ($lang = 'sotho du sud')">sot</xsl:when>
			<xsl:when test="($lang = 'es') or ($lang = 'spa') or ($lang = 'spanish; castilian') or ($lang = 'espagnol; castillan')">spa</xsl:when>
			<xsl:when test="($lang = 'sc') or ($lang = 'srd') or ($lang = 'sardinian') or ($lang = 'sarde')">srd</xsl:when>
			<xsl:when test="($lang = 'srn') or ($lang = 'sranan tongo')">srn</xsl:when>
			<xsl:when test="($lang = 'sr') or ($lang = 'srp') or ($lang = 'serbian') or ($lang = 'serbe')">srp</xsl:when>
			<xsl:when test="($lang = 'srr') or ($lang = 'serer') or ($lang = 's&amp;#233;r&amp;#232;re')">srr</xsl:when>
			<xsl:when test="($lang = 'ssa') or ($lang = 'nilo-saharan languages') or ($lang = 'nilo-sahariennes, langues')">ssa</xsl:when>
			<xsl:when test="($lang = 'ss') or ($lang = 'ssw') or ($lang = 'swati')">ssw</xsl:when>
			<xsl:when test="($lang = 'suk') or ($lang = 'sukuma')">suk</xsl:when>
			<xsl:when test="($lang = 'su') or ($lang = 'sun') or ($lang = 'sundanese') or ($lang = 'soundanais')">sun</xsl:when>
			<xsl:when test="($lang = 'sus') or ($lang = 'susu') or ($lang = 'soussou')">sus</xsl:when>
			<xsl:when test="($lang = 'sux') or ($lang = 'sumerian') or ($lang = 'sum&amp;#233;rien')">sux</xsl:when>
			<xsl:when test="($lang = 'sw') or ($lang = 'swa') or ($lang = 'swahili')">swa</xsl:when>
			<xsl:when test="($lang = 'sv') or ($lang = 'swe') or ($lang = 'swedish') or ($lang = 'su&amp;#233;dois')">swe</xsl:when>
			<xsl:when test="($lang = 'syc') or ($lang = 'classical syriac') or ($lang = 'syriaque classique')">syc</xsl:when>
			<xsl:when test="($lang = 'syr') or ($lang = 'syriac') or ($lang = 'syriaque')">syr</xsl:when>
			<xsl:when test="($lang = 'ty') or ($lang = 'tah') or ($lang = 'tahitian') or ($lang = 'tahitien')">tah</xsl:when>
			<xsl:when test="($lang = 'tai') or ($lang = 'tai languages') or ($lang = 'tai, langues')">tai</xsl:when>
			<xsl:when test="($lang = 'ta') or ($lang = 'tam') or ($lang = 'tamil') or ($lang = 'tamoul')">tam</xsl:when>
			<xsl:when test="($lang = 'tt') or ($lang = 'tat') or ($lang = 'tatar')">tat</xsl:when>
			<xsl:when test="($lang = 'te') or ($lang = 'tel') or ($lang = 'telugu') or ($lang = 't&amp;#233;lougou')">tel</xsl:when>
			<xsl:when test="($lang = 'tem') or ($lang = 'timne') or ($lang = 'temne')">tem</xsl:when>
			<xsl:when test="($lang = 'ter') or ($lang = 'tereno')">ter</xsl:when>
			<xsl:when test="($lang = 'tet') or ($lang = 'tetum')">tet</xsl:when>
			<xsl:when test="($lang = 'tg') or ($lang = 'tgk') or ($lang = 'tajik') or ($lang = 'tadjik')">tgk</xsl:when>
			<xsl:when test="($lang = 'tl') or ($lang = 'tgl') or ($lang = 'tagalog')">tgl</xsl:when>
			<xsl:when test="($lang = 'th') or ($lang = 'tha') or ($lang = 'thai') or ($lang = 'tha&amp;#239;')">tha</xsl:when>
			<xsl:when test="($lang = 'bo') or ($lang = 'bod') or ($lang = 'tib') or ($lang = 'tibetan') or ($lang = 'tib&amp;#233;tain')">tib</xsl:when>
			<xsl:when test="($lang = 'tig') or ($lang = 'tigre') or ($lang = 'tigr&amp;#233;')">tig</xsl:when>
			<xsl:when test="($lang = 'ti') or ($lang = 'tir') or ($lang = 'tigrinya') or ($lang = 'tigrigna')">tir</xsl:when>
			<xsl:when test="($lang = 'tiv')">tiv</xsl:when>
			<xsl:when test="($lang = 'tkl') or ($lang = 'tokelau')">tkl</xsl:when>
			<xsl:when test="($lang = 'tlh') or ($lang = 'klingon; tlhingan-hol') or ($lang = 'klingon')">tlh</xsl:when>
			<xsl:when test="($lang = 'tli') or ($lang = 'tlingit')">tli</xsl:when>
			<xsl:when test="($lang = 'tmh') or ($lang = 'tamashek') or ($lang = 'tamacheq')">tmh</xsl:when>
			<xsl:when test="($lang = 'tog') or ($lang = 'tonga (nyasa)')">tog</xsl:when>
			<xsl:when test="($lang = 'to') or ($lang = 'ton') or ($lang = 'tonga (tonga islands)') or ($lang = 'tongan (&amp;#238;les tonga)')">ton</xsl:when>
			<xsl:when test="($lang = 'tpi') or ($lang = 'tok pisin')">tpi</xsl:when>
			<xsl:when test="($lang = 'tsi') or ($lang = 'tsimshian')">tsi</xsl:when>
			<xsl:when test="($lang = 'tn') or ($lang = 'tsn') or ($lang = 'tswana')">tsn</xsl:when>
			<xsl:when test="($lang = 'ts') or ($lang = 'tso') or ($lang = 'tsonga')">tso</xsl:when>
			<xsl:when test="($lang = 'tk') or ($lang = 'tuk') or ($lang = 'turkmen') or ($lang = 'turkm&amp;#232;ne')">tuk</xsl:when>
			<xsl:when test="($lang = 'tum') or ($lang = 'tumbuka')">tum</xsl:when>
			<xsl:when test="($lang = 'tup') or ($lang = 'tupi languages') or ($lang = 'tupi, langues')">tup</xsl:when>
			<xsl:when test="($lang = 'tr') or ($lang = 'tur') or ($lang = 'turkish') or ($lang = 'turc')">tur</xsl:when>
			<xsl:when test="($lang = 'tut') or ($lang = 'altaic languages') or ($lang = 'alta&amp;#239;ques, langues')">tut</xsl:when>
			<xsl:when test="($lang = 'tvl') or ($lang = 'tuvalu')">tvl</xsl:when>
			<xsl:when test="($lang = 'tw') or ($lang = 'twi')">twi</xsl:when>
			<xsl:when test="($lang = 'tyv') or ($lang = 'tuvinian') or ($lang = 'touva')">tyv</xsl:when>
			<xsl:when test="($lang = 'udm') or ($lang = 'udmurt') or ($lang = 'oudmourte')">udm</xsl:when>
			<xsl:when test="($lang = 'uga') or ($lang = 'ugaritic') or ($lang = 'ougaritique')">uga</xsl:when>
			<xsl:when test="($lang = 'ug') or ($lang = 'uig') or ($lang = 'uighur; uyghur') or ($lang = 'ou&amp;#239;gour')">uig</xsl:when>
			<xsl:when test="($lang = 'uk') or ($lang = 'ukr') or ($lang = 'ukrainian') or ($lang = 'ukrainien')">ukr</xsl:when>
			<xsl:when test="($lang = 'umb') or ($lang = 'umbundu')">umb</xsl:when>
			<xsl:when test="($lang = 'und') or ($lang = 'undetermined') or ($lang = 'ind&amp;#233;termin&amp;#233;e')">und</xsl:when>
			<xsl:when test="($lang = 'ur') or ($lang = 'urd') or ($lang = 'urdu') or ($lang = 'ourdou')">urd</xsl:when>
			<xsl:when test="($lang = 'uz') or ($lang = 'uzb') or ($lang = 'uzbek') or ($lang = 'ouszbek')">uzb</xsl:when>
			<xsl:when test="($lang = 'vai') or ($lang = 'va&amp;#239;')">vai</xsl:when>
			<xsl:when test="($lang = 've') or ($lang = 'ven') or ($lang = 'venda')">ven</xsl:when>
			<xsl:when test="($lang = 'vi') or ($lang = 'vie') or ($lang = 'vietnamese') or ($lang = 'vietnamien')">vie</xsl:when>
			<xsl:when test="($lang = 'vo') or ($lang = 'vol') or ($lang = 'volap&amp;#252;k')">vol</xsl:when>
			<xsl:when test="($lang = 'vot') or ($lang = 'votic') or ($lang = 'vote')">vot</xsl:when>
			<xsl:when test="($lang = 'wak') or ($lang = 'wakashan languages') or ($lang = 'wakashanes, langues')">wak</xsl:when>
			<xsl:when test="($lang = 'wal') or ($lang = 'walamo')">wal</xsl:when>
			<xsl:when test="($lang = 'war') or ($lang = 'waray')">war</xsl:when>
			<xsl:when test="($lang = 'was') or ($lang = 'washo')">was</xsl:when>
			<xsl:when test="($lang = 'cy') or ($lang = 'cym') or ($lang = 'wel') or ($lang = 'welsh') or ($lang = 'gallois')">wel</xsl:when>
			<xsl:when test="($lang = 'wen') or ($lang = 'sorbian languages') or ($lang = 'sorabes, langues')">wen</xsl:when>
			<xsl:when test="($lang = 'wa') or ($lang = 'wln') or ($lang = 'walloon') or ($lang = 'wallon')">wln</xsl:when>
			<xsl:when test="($lang = 'wo') or ($lang = 'wol') or ($lang = 'wolof')">wol</xsl:when>
			<xsl:when test="($lang = 'xal') or ($lang = 'kalmyk; oirat') or ($lang = 'kalmouk; o&amp;#239;rat')">xal</xsl:when>
			<xsl:when test="($lang = 'xh') or ($lang = 'xho') or ($lang = 'xhosa')">xho</xsl:when>
			<xsl:when test="($lang = 'yao')">yao</xsl:when>
			<xsl:when test="($lang = 'yap') or ($lang = 'yapese') or ($lang = 'yapois')">yap</xsl:when>
			<xsl:when test="($lang = 'yi') or ($lang = 'yid') or ($lang = 'yiddish')">yid</xsl:when>
			<xsl:when test="($lang = 'yo') or ($lang = 'yor') or ($lang = 'yoruba')">yor</xsl:when>
			<xsl:when test="($lang = 'ypk') or ($lang = 'yupik languages') or ($lang = 'yupik, langues')">ypk</xsl:when>
			<xsl:when test="($lang = 'zap') or ($lang = 'zapotec') or ($lang = 'zapot&amp;#232;que')">zap</xsl:when>
			<xsl:when test="($lang = 'zbl') or ($lang = 'blissymbols; blissymbolics; bliss') or ($lang = 'symboles bliss; bliss')">zbl</xsl:when>
			<xsl:when test="($lang = 'zen') or ($lang = 'zenaga')">zen</xsl:when>
			<xsl:when test="($lang = 'za') or ($lang = 'zha') or ($lang = 'zhuang; chuang')">zha</xsl:when>
			<xsl:when test="($lang = 'znd') or ($lang = 'zande languages') or ($lang = 'zand&amp;#233;, langues')">znd</xsl:when>
			<xsl:when test="($lang = 'zu') or ($lang = 'zul') or ($lang = 'zulu') or ($lang = 'zoulou')">zul</xsl:when>
			<xsl:when test="($lang = 'zun') or ($lang = 'zuni')">zun</xsl:when>
			<xsl:when test="($lang = 'zxx') or ($lang = 'no linguistic content; not applicable') or ($lang = 'pas de contenu linguistique; non applicable')">zxx</xsl:when>
			<xsl:when test="($lang = 'zza') or ($lang = 'zaza; dimili; dimli; kirdki; kirmanjki; zazaki')">zza</xsl:when>
			<xsl:otherwise>unknown</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="cntry3166_code" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
		<xsl:variable name="cntry">
			<xsl:choose>
				<xsl:when test="function-available('esri:strtolower')">
					<xsl:value-of select="esri:strtolower(.)"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="."/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:choose>
			<xsl:when test="($cntry = 'af') or ($cntry = 'afg') or ($cntry = 'afghanistan')">AF</xsl:when>
			<xsl:when test="($cntry = 'ax') or ($cntry = 'ala') or ($cntry = 'aland islands') or ($cntry = '&amp;#229;land islands') or ($cntry = '&amp;#229;land, &amp;#238;les')">AX</xsl:when>
			<xsl:when test="($cntry = 'al') or ($cntry = 'alb') or ($cntry = 'albania') or ($cntry = 'albanie')">AL</xsl:when>
			<xsl:when test="($cntry = 'dz') or ($cntry = 'dza') or ($cntry = 'algeria') or ($cntry = 'alg&amp;#233;rie')">DZ</xsl:when>
			<xsl:when test="($cntry = 'as') or ($cntry = 'asm') or ($cntry = 'american samoa') or ($cntry = 'samoa am&amp;#233;ricanines')">AS</xsl:when>
			<xsl:when test="($cntry = 'ad') or ($cntry = 'and') or ($cntry = 'andorra') or ($cntry = 'andorre')">AD</xsl:when>
			<xsl:when test="($cntry = 'ao') or ($cntry = 'ago') or ($cntry = 'angola')">AO</xsl:when>
			<xsl:when test="($cntry = 'ai') or ($cntry = 'aia') or ($cntry = 'anguilla')">AI</xsl:when>
			<xsl:when test="($cntry = 'aq') or ($cntry = 'ata') or ($cntry = 'antarctica') or ($cntry = 'antarctique')">AQ</xsl:when>
			<xsl:when test="($cntry = 'ag') or ($cntry = 'atg') or ($cntry = 'antigua and barbuda') or ($cntry = 'antigua-et-barbuda')">AG</xsl:when>
			<xsl:when test="($cntry = 'ar') or ($cntry = 'arg') or ($cntry = 'argentina') or ($cntry = 'argentine')">AR</xsl:when>
			<xsl:when test="($cntry = 'am') or ($cntry = 'arm') or ($cntry = 'armenia') or ($cntry = 'arm&amp;#233;nie')">AM</xsl:when>
			<xsl:when test="($cntry = 'aw') or ($cntry = 'abw') or ($cntry = 'aruba')">AW</xsl:when>
			<xsl:when test="($cntry = 'au') or ($cntry = 'aus') or ($cntry = 'australia') or ($cntry = 'australie')">AU</xsl:when>
			<xsl:when test="($cntry = 'at') or ($cntry = 'aut') or ($cntry = 'austria') or ($cntry = 'autriche')">AT</xsl:when>
			<xsl:when test="($cntry = 'az') or ($cntry = 'aze') or ($cntry = 'azerbaijan') or ($cntry = 'azerba&amp;#239;djan')">AZ</xsl:when>
			<xsl:when test="($cntry = 'bs') or ($cntry = 'bhs') or ($cntry = 'bahamas')">BS</xsl:when>
			<xsl:when test="($cntry = 'bh') or ($cntry = 'bhr') or ($cntry = 'bahrain') or ($cntry = 'bahre&amp;#239;n')">BH</xsl:when>
			<xsl:when test="($cntry = 'bd') or ($cntry = 'bgd') or ($cntry = 'bangladesh')">BD</xsl:when>
			<xsl:when test="($cntry = 'bb') or ($cntry = 'brb') or ($cntry = 'barbados') or ($cntry = 'barbade')">BB</xsl:when>
			<xsl:when test="($cntry = 'by') or ($cntry = 'blr') or ($cntry = 'belarus') or ($cntry = 'b&amp;#233;larus')">BY</xsl:when>
			<xsl:when test="($cntry = 'be') or ($cntry = 'bel') or ($cntry = 'belgium') or ($cntry = 'belgique')">BE</xsl:when>
			<xsl:when test="($cntry = 'bz') or ($cntry = 'blz') or ($cntry = 'belize')">BZ</xsl:when>
			<xsl:when test="($cntry = 'bj') or ($cntry = 'ben') or ($cntry = 'benin') or ($cntry = 'b&amp;#233;nin')">BJ</xsl:when>
			<xsl:when test="($cntry = 'bm') or ($cntry = 'bmu') or ($cntry = 'bermuda') or ($cntry = 'bermudes')">BM</xsl:when>
			<xsl:when test="($cntry = 'bt') or ($cntry = 'btn') or ($cntry = 'bhutan') or ($cntry = 'bhoutan')">BT</xsl:when>
			<xsl:when test="($cntry = 'bo') or ($cntry = 'bol') or ($cntry = 'bolivia, plurinational state of') or ($cntry = 'bolivie, l&amp;apos;&amp;#233;tat plurinational de') or ($cntry = 'bolivia')">BO</xsl:when>
			<xsl:when test="($cntry = 'bq') or ($cntry = 'bes') or ($cntry = 'bonaire, saint eustatius and saba') or ($cntry = 'bonaire, saint-eustache et saba') or ($cntry = 'bolivia')">BO</xsl:when>
			<xsl:when test="($cntry = 'ba') or ($cntry = 'bih') or ($cntry = 'bosnia and herzegovina') or ($cntry = 'bosnie-herz&amp;#233;govine')">BA</xsl:when>
			<xsl:when test="($cntry = 'bw') or ($cntry = 'bwa') or ($cntry = 'botswana')">BW</xsl:when>
			<xsl:when test="($cntry = 'bv') or ($cntry = 'bvt') or ($cntry = 'bouvet island') or ($cntry = 'bouvet, &amp;#238;le')">BV</xsl:when>
			<xsl:when test="($cntry = 'br') or ($cntry = 'bra') or ($cntry = 'brazil') or ($cntry = 'br&amp;#233;sil')">BR</xsl:when>
			<xsl:when test="($cntry = 'io') or ($cntry = 'iot') or ($cntry = 'british indian ocean territory') or ($cntry = 'oc&amp;#233;an indien, territoire britannique del&amp;pos;')">IO</xsl:when>
			<xsl:when test="($cntry = 'bn') or ($cntry = 'brn') or ($cntry = 'brunei darussalam') or ($cntry = 'brun&amp;#233;i darussalam')">BN</xsl:when>
			<xsl:when test="($cntry = 'bg') or ($cntry = 'bgr') or ($cntry = 'bulgaria') or ($cntry = 'bulgarie')">BG</xsl:when>
			<xsl:when test="($cntry = 'bf') or ($cntry = 'bfa') or ($cntry = 'burkina faso')">BF</xsl:when>
			<xsl:when test="($cntry = 'bi') or ($cntry = 'bdi') or ($cntry = 'burundi')">BI</xsl:when>
			<xsl:when test="($cntry = 'kh') or ($cntry = 'khm') or ($cntry = 'cambodia') or ($cntry = 'cambodge')">KH</xsl:when>
			<xsl:when test="($cntry = 'cm') or ($cntry = 'cmr') or ($cntry = 'cameroon') or ($cntry = 'cameroun')">CM</xsl:when>
			<xsl:when test="($cntry = 'ca') or ($cntry = 'can') or ($cntry = 'canada')">CA</xsl:when>
			<xsl:when test="($cntry = 'cv') or ($cntry = 'cpv') or ($cntry = 'cape verde') or ($cntry = 'cap-vert')">CV</xsl:when>
			<xsl:when test="($cntry = 'ky') or ($cntry = 'cym') or ($cntry = 'cayman islands') or ($cntry = 'ca&amp;#239;manes, &amp;#238;les')">KY</xsl:when>
			<xsl:when test="($cntry = 'cf') or ($cntry = 'caf') or ($cntry = 'central african republic') or ($cntry = 'centrafricaine, r&amp;#233;publique')">CF</xsl:when>
			<xsl:when test="($cntry = 'td') or ($cntry = 'tcd') or ($cntry = 'chad') or ($cntry = 'tchad')">TD</xsl:when>
			<xsl:when test="($cntry = 'cl') or ($cntry = 'chl') or ($cntry = 'chile') or ($cntry = 'chili')">CL</xsl:when>
			<xsl:when test="($cntry = 'cn') or ($cntry = 'chn') or ($cntry = 'china') or ($cntry = 'chine')">CN</xsl:when>
			<xsl:when test="($cntry = 'cx') or ($cntry = 'cxr') or ($cntry = 'christmas island') or ($cntry = 'christmas, &amp;#238;les')">CX</xsl:when>
			<xsl:when test="($cntry = 'cc') or ($cntry = 'cck') or ($cntry = 'cocos (keeling) islands') or ($cntry = 'cocos (keeling), &amp;#238;les')">CC</xsl:when>
			<xsl:when test="($cntry = 'co') or ($cntry = 'col') or ($cntry = 'colombia') or ($cntry = 'colombie')">CO</xsl:when>
			<xsl:when test="($cntry = 'km') or ($cntry = 'com') or ($cntry = 'comoros') or ($cntry = 'comores')">KM</xsl:when>
			<xsl:when test="($cntry = 'cg') or ($cntry = 'cog') or ($cntry = 'congo')">CG</xsl:when>
			<xsl:when test="($cntry = 'cd') or ($cntry = 'cod') or ($cntry = 'congo, the democratic republic of the') or ($cntry = 'congo, la r&amp;#233;publique d&amp;#233;mocratique du')">CD</xsl:when>
			<xsl:when test="($cntry = 'ck') or ($cntry = 'cok') or ($cntry = 'cook islands') or ($cntry = 'cook, &amp;#238;les')">CK</xsl:when>
			<xsl:when test="($cntry = 'cr') or ($cntry = 'cri') or ($cntry = 'costa rica')">CR</xsl:when>
			<xsl:when test="($cntry = 'ci') or ($cntry = 'civ') or ($cntry = 'c&amp;#244;te d&amp;apos;ivoire') or ($cntry = 'ivory coast')">CI</xsl:when>
			<xsl:when test="($cntry = 'hr') or ($cntry = 'hrv') or ($cntry = 'croatia') or ($cntry = 'croatie')">HR</xsl:when>
			<xsl:when test="($cntry = 'cu') or ($cntry = 'cub') or ($cntry = 'cuba')">CU</xsl:when>
			<xsl:when test="($cntry = 'cw') or ($cntry = 'cuw') or ($cntry = 'cura&amp;#231;ao')">CW</xsl:when>
			<xsl:when test="($cntry = 'cy') or ($cntry = 'cyp') or ($cntry = 'cyprus') or ($cntry = 'chypre')">CY</xsl:when>
			<xsl:when test="($cntry = 'cz') or ($cntry = 'cze') or ($cntry = 'czech republic') or ($cntry = 'tch&amp;#232;que, r&amp;#233;publique')">CZ</xsl:when>
			<xsl:when test="($cntry = 'dk') or ($cntry = 'dnk') or ($cntry = 'denmark') or ($cntry = 'danemark')">DK</xsl:when>
			<xsl:when test="($cntry = 'dj') or ($cntry = 'dji') or ($cntry = 'djibouti')">DJ</xsl:when>
			<xsl:when test="($cntry = 'dm') or ($cntry = 'dma') or ($cntry = 'dominica') or ($cntry = 'dominique')">DM</xsl:when>
			<xsl:when test="($cntry = 'do') or ($cntry = 'dom') or ($cntry = 'dominican republic') or ($cntry = 'dominicaine, r&amp;#233;publique')">DO</xsl:when>
			<xsl:when test="($cntry = 'ec') or ($cntry = 'ecu') or ($cntry = 'ecuador') or ($cntry = '&amp;#233;quateur')">EC</xsl:when>
			<xsl:when test="($cntry = 'eg') or ($cntry = 'egy') or ($cntry = 'egypt') or ($cntry = '&amp;#233;gypte')">EG</xsl:when>
			<xsl:when test="($cntry = 'sv') or ($cntry = 'slv') or ($cntry = 'el salvador')">SV</xsl:when>
			<xsl:when test="($cntry = 'gq') or ($cntry = 'gnq') or ($cntry = 'equatorial guinea') or ($cntry = 'guin&amp;#233;e &amp;#233;quatoriale')">GQ</xsl:when>
			<xsl:when test="($cntry = 'er') or ($cntry = 'eri') or ($cntry = 'eritrea') or ($cntry = '&amp;#233;rythr&amp;#233;e')">ER</xsl:when>
			<xsl:when test="($cntry = 'ee') or ($cntry = 'est') or ($cntry = 'estonia') or ($cntry = 'estonie')">EE</xsl:when>
			<xsl:when test="($cntry = 'et') or ($cntry = 'eth') or ($cntry = 'ethiopia') or ($cntry = '&amp;#233;thiopie')">ET</xsl:when>
			<xsl:when test="($cntry = 'fk') or ($cntry = 'flk') or ($cntry = 'falkland islands (malvinas)') or ($cntry = 'falkland, &amp;#238;les (malvinas)')">FK</xsl:when>
			<xsl:when test="($cntry = 'fo') or ($cntry = 'fro') or ($cntry = 'faroe islands') or ($cntry = 'f&amp;#233;ro&amp;#233;, &amp;#238;les')">FO</xsl:when>
			<xsl:when test="($cntry = 'fj') or ($cntry = 'fji') or ($cntry = 'fiji') or ($cntry = 'fidji')">FJ</xsl:when>
			<xsl:when test="($cntry = 'fi') or ($cntry = 'fin') or ($cntry = 'finland') or ($cntry = 'finlande')">FI</xsl:when>
			<xsl:when test="($cntry = 'fr') or ($cntry = 'fra') or ($cntry = 'france')">FR</xsl:when>
			<xsl:when test="($cntry = 'gf') or ($cntry = 'guf') or ($cntry = 'french guiana') or ($cntry = 'guyane fran&amp;#231;aise')">GF</xsl:when>
			<xsl:when test="($cntry = 'pf') or ($cntry = 'pyf') or ($cntry = 'french polynesia') or ($cntry = 'polyn&amp;#233;sie fran&amp;#231;aise')">PF</xsl:when>
			<xsl:when test="($cntry = 'tf') or ($cntry = 'atf') or ($cntry = 'french southern territories') or ($cntry = 'terres australes fran&amp;#231;aises')">TF</xsl:when>
			<xsl:when test="($cntry = 'ga') or ($cntry = 'gab') or ($cntry = 'gabon')">GA</xsl:when>
			<xsl:when test="($cntry = 'gm') or ($cntry = 'gmb') or ($cntry = 'gambia') or ($cntry = 'gambie')">GM</xsl:when>
			<xsl:when test="($cntry = 'ge') or ($cntry = 'geo') or ($cntry = 'georgia') or ($cntry = 'g&amp;#233;orgie')">GE</xsl:when>
			<xsl:when test="($cntry = 'de') or ($cntry = 'deu') or ($cntry = 'germany') or ($cntry = 'allemagne')">DE</xsl:when>
			<xsl:when test="($cntry = 'gh') or ($cntry = 'gha') or ($cntry = 'ghana')">GH</xsl:when>
			<xsl:when test="($cntry = 'gi') or ($cntry = 'gib') or ($cntry = 'gibraltar')">GI</xsl:when>
			<xsl:when test="($cntry = 'gr') or ($cntry = 'grc') or ($cntry = 'greece') or ($cntry = 'gr&amp;#232;ce')">GR</xsl:when>
			<xsl:when test="($cntry = 'gl') or ($cntry = 'grl') or ($cntry = 'greenland') or ($cntry = 'groenland')">GL</xsl:when>
			<xsl:when test="($cntry = 'gd') or ($cntry = 'grd') or ($cntry = 'grenada') or ($cntry = 'grenade')">GD</xsl:when>
			<xsl:when test="($cntry = 'gp') or ($cntry = 'glp') or ($cntry = 'guadeloupe')">GP</xsl:when>
			<xsl:when test="($cntry = 'gu') or ($cntry = 'gum') or ($cntry = 'guam')">GU</xsl:when>
			<xsl:when test="($cntry = 'gt') or ($cntry = 'gtm') or ($cntry = 'guatemala')">GT</xsl:when>
			<xsl:when test="($cntry = 'gg') or ($cntry = 'ggy') or ($cntry = 'guernsey') or ($cntry = 'guernesey')">GG</xsl:when>
			<xsl:when test="($cntry = 'gn') or ($cntry = 'gin') or ($cntry = 'guinea') or ($cntry = 'guin&amp;#233;e')">GN</xsl:when>
			<xsl:when test="($cntry = 'gw') or ($cntry = 'gnb') or ($cntry = 'guinea-bissau') or ($cntry = 'guin&amp;#233;e-bissau')">GW</xsl:when>
			<xsl:when test="($cntry = 'gy') or ($cntry = 'guy') or ($cntry = 'guyana')">GW</xsl:when>
			<xsl:when test="($cntry = 'ht') or ($cntry = 'hti') or ($cntry = 'haiti') or ($cntry = 'ha&amp;#239;ti')">HT</xsl:when>
			<xsl:when test="($cntry = 'hm') or ($cntry = 'hmd') or ($cntry = 'heard island and mcdonald islands') or ($cntry = 'heard, &amp;#238;le et mcdonald, &amp;#238;les')">HM</xsl:when>
			<xsl:when test="($cntry = 'va') or ($cntry = 'vat') or ($cntry = 'holy see (vatican city state)') or ($cntry = 'saint-si&amp;#232;ge (&amp;#233;tat de la cit&amp;#233; du vatican') or ($cntry = 'holy see') or ($cntry = 'vatican')">VA</xsl:when>
			<xsl:when test="($cntry = 'hn') or ($cntry = 'hnd') or ($cntry = 'honduras')">HN</xsl:when>
			<xsl:when test="($cntry = 'hk') or ($cntry = 'hkg') or ($cntry = 'hong kong') or ($cntry = 'hong-kong')">HK</xsl:when>
			<xsl:when test="($cntry = 'hu') or ($cntry = 'hun') or ($cntry = 'hungary') or ($cntry = 'hongrie')">HU</xsl:when>
			<xsl:when test="($cntry = 'is') or ($cntry = 'isl') or ($cntry = 'iceland') or ($cntry = 'islande')">IS</xsl:when>
			<xsl:when test="($cntry = 'in') or ($cntry = 'ind') or ($cntry = 'india') or ($cntry = 'inde')">IN</xsl:when>
			<xsl:when test="($cntry = 'id') or ($cntry = 'idn') or ($cntry = 'indonesia') or ($cntry = 'indon&amp;#233;sie')">ID</xsl:when>
			<xsl:when test="($cntry = 'ir') or ($cntry = 'irn') or ($cntry = 'iran, islamic republic of') or ($cntry = 'iran, r&amp;#233;publique islamique d&amp;apos;') or ($cntry = 'iran')">IR</xsl:when>
			<xsl:when test="($cntry = 'iq') or ($cntry = 'irq') or ($cntry = 'iraq')">IQ</xsl:when>
			<xsl:when test="($cntry = 'ie') or ($cntry = 'irl') or ($cntry = 'ireland') or ($cntry = 'irlande')">IE</xsl:when>
			<xsl:when test="($cntry = 'im') or ($cntry = 'imn') or ($cntry = 'isle of man') or ($cntry = '&amp;#238;le de man')">IM</xsl:when>
			<xsl:when test="($cntry = 'il') or ($cntry = 'isr') or ($cntry = 'israel') or ($cntry = 'isra&amp;#235;l')">IL</xsl:when>
			<xsl:when test="($cntry = 'it') or ($cntry = 'ita') or ($cntry = 'italy') or ($cntry = 'italie')">IT</xsl:when>
			<xsl:when test="($cntry = 'jm') or ($cntry = 'jam') or ($cntry = 'jamaica') or ($cntry = 'jama&amp;#239;que')">JM</xsl:when>
			<xsl:when test="($cntry = 'jp') or ($cntry = 'jpn') or ($cntry = 'japan') or ($cntry = 'japon')">JP</xsl:when>
			<xsl:when test="($cntry = 'je') or ($cntry = 'jey') or ($cntry = 'jersey')">JE</xsl:when>
			<xsl:when test="($cntry = 'jo') or ($cntry = 'jor') or ($cntry = 'jordan') or ($cntry = 'jordanie')">JO</xsl:when>
			<xsl:when test="($cntry = 'kz') or ($cntry = 'kaz') or ($cntry = 'kazakhstan')">KZ</xsl:when>
			<xsl:when test="($cntry = 'ke') or ($cntry = 'ken') or ($cntry = 'kenya')">KE</xsl:when>
			<xsl:when test="($cntry = 'ki') or ($cntry = 'kir') or ($cntry = 'kiribati')">KI</xsl:when>
			<xsl:when test="($cntry = 'kp') or ($cntry = 'prk') or ($cntry = 'korea, democratic people&amp;apos;s republic of') or ($cntry = 'cor&amp;#233;e, r&amp;#233;publique populaire d&amp;#233;mocratique de')">KP</xsl:when>
			<xsl:when test="($cntry = 'kr') or ($cntry = 'kor') or ($cntry = 'korea, republic of') or ($cntry = 'cor&amp;#233;e, r&amp;#233;publique de')">KR</xsl:when>
			<xsl:when test="($cntry = 'kw') or ($cntry = 'kwt') or ($cntry = 'kuwait') or ($cntry = 'kowe&amp;#239;t')">KW</xsl:when>
			<xsl:when test="($cntry = 'kg') or ($cntry = 'kgz') or ($cntry = 'kyrgyzstan') or ($cntry = 'kirghizistan')">KG</xsl:when>
			<xsl:when test="($cntry = 'la') or ($cntry = 'lao') or ($cntry = 'lao people&amp;apos;s democratic republic') or ($cntry = 'lao, r&amp;#233;publique d&amp;#233;mocratique populaire') or ($cntry = 'laos')">LA</xsl:when>
			<xsl:when test="($cntry = 'lv') or ($cntry = 'lva') or ($cntry = 'latvia') or ($cntry = 'lettonie')">LV</xsl:when>
			<xsl:when test="($cntry = 'lb') or ($cntry = 'lbn') or ($cntry = 'lebanon') or ($cntry = 'liban')">LB</xsl:when>
			<xsl:when test="($cntry = 'ls') or ($cntry = 'lso') or ($cntry = 'lesotho')">LS</xsl:when>
			<xsl:when test="($cntry = 'lr') or ($cntry = 'lbr') or ($cntry = 'liberia') or ($cntry = 'lib&amp;#233;ria')">LR</xsl:when>
			<xsl:when test="($cntry = 'ly') or ($cntry = 'lby') or ($cntry = 'libyan arab jamahiriya') or ($cntry = 'libyenne, jamahiriya arabe') or ($cntry = 'libya')">LY</xsl:when>
			<xsl:when test="($cntry = 'li') or ($cntry = 'lie') or ($cntry = 'liechtenstein')">LI</xsl:when>
			<xsl:when test="($cntry = 'lt') or ($cntry = 'ltu') or ($cntry = 'lithuania') or ($cntry = 'lituanie')">LT</xsl:when>
			<xsl:when test="($cntry = 'lu') or ($cntry = 'lux') or ($cntry = 'luxembourg')">LU</xsl:when>
			<xsl:when test="($cntry = 'mo') or ($cntry = 'mac') or ($cntry = 'macao')">MO</xsl:when>
			<xsl:when test="($cntry = 'mk') or ($cntry = 'mkd') or ($cntry = 'macedonia, the former yugoslav republic of') or ($cntry = 'mac&amp;#233;doine, l&amp;apos;ex-r&amp;#233;publique yougoslave de') or ($cntry = 'macedonia')">MK</xsl:when>
			<xsl:when test="($cntry = 'mg') or ($cntry = 'mdg') or ($cntry = 'madagascar')">MG</xsl:when>
			<xsl:when test="($cntry = 'mw') or ($cntry = 'mwi') or ($cntry = 'malawi')">MW</xsl:when>
			<xsl:when test="($cntry = 'my') or ($cntry = 'mys') or ($cntry = 'malaysia') or ($cntry = 'malaisie')">MY</xsl:when>
			<xsl:when test="($cntry = 'mv') or ($cntry = 'mdv') or ($cntry = 'maldives')">MV</xsl:when>
			<xsl:when test="($cntry = 'ml') or ($cntry = 'mli') or ($cntry = 'mali')">ML</xsl:when>
			<xsl:when test="($cntry = 'mt') or ($cntry = 'mlt') or ($cntry = 'malta') or ($cntry = 'malte')">MT</xsl:when>
			<xsl:when test="($cntry = 'mh') or ($cntry = 'mhl') or ($cntry = 'marshall islands') or ($cntry = 'marshall, &amp;#238;les')">MH</xsl:when>
			<xsl:when test="($cntry = 'mq') or ($cntry = 'mtq') or ($cntry = 'martinique')">MQ</xsl:when>
			<xsl:when test="($cntry = 'mr') or ($cntry = 'mrt') or ($cntry = 'mauritania') or ($cntry = 'mauritanie')">MR</xsl:when>
			<xsl:when test="($cntry = 'mu') or ($cntry = 'mus') or ($cntry = 'mauritius') or ($cntry = 'maurice')">MU</xsl:when>
			<xsl:when test="($cntry = 'yt') or ($cntry = 'myt') or ($cntry = 'mayotte')">YT</xsl:when>
			<xsl:when test="($cntry = 'mx') or ($cntry = 'mex') or ($cntry = 'mexico') or ($cntry = 'mexique')">MX</xsl:when>
			<xsl:when test="($cntry = 'fm') or ($cntry = 'fsm') or ($cntry = 'micronesia, federated states of') or ($cntry = 'micron&amp;#233;sie, &amp;#233;tats f&amp;#233;d&amp;#233;r&amp;#233;s de') or ($cntry = 'micronesia')">FM</xsl:when>
			<xsl:when test="($cntry = 'md') or ($cntry = 'mda') or ($cntry = 'moldova, republic of') or ($cntry = 'moldova, r&amp;#233;publique de') or ($cntry = 'moldova')">MD</xsl:when>
			<xsl:when test="($cntry = 'mc') or ($cntry = 'mco') or ($cntry = 'monaco')">MC</xsl:when>
			<xsl:when test="($cntry = 'mn') or ($cntry = 'mng') or ($cntry = 'mongolia') or ($cntry = 'mongolie')">MN</xsl:when>
			<xsl:when test="($cntry = 'me') or ($cntry = 'mne') or ($cntry = 'montenegro') or ($cntry = 'mont&amp;#233;n&amp;#233;gro')">ME</xsl:when>
			<xsl:when test="($cntry = 'ms') or ($cntry = 'msr') or ($cntry = 'montserrat')">MS</xsl:when>
			<xsl:when test="($cntry = 'ma') or ($cntry = 'mar') or ($cntry = 'morocco') or ($cntry = 'maroc')">MA</xsl:when>
			<xsl:when test="($cntry = 'mz') or ($cntry = 'moz') or ($cntry = 'mozambique')">MZ</xsl:when>
			<xsl:when test="($cntry = 'mm') or ($cntry = 'mmr') or ($cntry = 'myanmar') or ($cntry = 'burma')">MM</xsl:when>
			<xsl:when test="($cntry = 'na') or ($cntry = 'nam') or ($cntry = 'namibia') or ($cntry = 'namibie')">NA</xsl:when>
			<xsl:when test="($cntry = 'nr') or ($cntry = 'nru') or ($cntry = 'nauru')">NR</xsl:when>
			<xsl:when test="($cntry = 'np') or ($cntry = 'npl') or ($cntry = 'nepal') or ($cntry = 'n&amp;#233;pal')">NP</xsl:when>
			<xsl:when test="($cntry = 'nl') or ($cntry = 'nld') or ($cntry = 'netherlands') or ($cntry = 'pays-bas')">NL</xsl:when>
			<xsl:when test="($cntry = 'nc') or ($cntry = 'ncl') or ($cntry = 'new caledonia') or ($cntry = 'nouvelle-cal&amp;#233;donie')">NC</xsl:when>
			<xsl:when test="($cntry = 'nz') or ($cntry = 'nzl') or ($cntry = 'new zealand') or ($cntry = 'nouvelle-z&amp;#233;lande')">NZ</xsl:when>
			<xsl:when test="($cntry = 'ni') or ($cntry = 'nic') or ($cntry = 'nicaragua')">NI</xsl:when>
			<xsl:when test="($cntry = 'ne') or ($cntry = 'ner') or ($cntry = 'niger')">NE</xsl:when>
			<xsl:when test="($cntry = 'ng') or ($cntry = 'nga') or ($cntry = 'nigeria') or ($cntry = 'nig&amp;#233;ria')">NG</xsl:when>
			<xsl:when test="($cntry = 'nu') or ($cntry = 'niu') or ($cntry = 'niue') or ($cntry = 'niu&amp;#233;')">NU</xsl:when>
			<xsl:when test="($cntry = 'nf') or ($cntry = 'nfk') or ($cntry = 'norfolk island') or ($cntry = 'norfolk, &amp;#238;le')">NF</xsl:when>
			<xsl:when test="($cntry = 'mp') or ($cntry = 'mnp') or ($cntry = 'northern mariana islands') or ($cntry = 'mariannes du nord, &amp;#238;les')">MP</xsl:when>
			<xsl:when test="($cntry = 'no') or ($cntry = 'nor') or ($cntry = 'norway') or ($cntry = 'norv&amp;#232;ge')">NO</xsl:when>
			<xsl:when test="($cntry = 'om') or ($cntry = 'omn') or ($cntry = 'oman')">OM</xsl:when>
			<xsl:when test="($cntry = 'pk') or ($cntry = 'pak') or ($cntry = 'pakistan')">PK</xsl:when>
			<xsl:when test="($cntry = 'pw') or ($cntry = 'plw') or ($cntry = 'palau') or ($cntry = 'palaos')">PW</xsl:when>
			<xsl:when test="($cntry = 'ps') or ($cntry = 'pse') or ($cntry = 'palestinian territory, occupied') or ($cntry = 'palestinien occup&amp;#233;, territoire')">PS</xsl:when>
			<xsl:when test="($cntry = 'pa') or ($cntry = 'pan') or ($cntry = 'panama')">PA</xsl:when>
			<xsl:when test="($cntry = 'pg') or ($cntry = 'png') or ($cntry = 'papua new guinea') or ($cntry = 'papouasie-nouvelle-guin&amp;#233;e')">PG</xsl:when>
			<xsl:when test="($cntry = 'py') or ($cntry = 'pry') or ($cntry = 'paraguay')">PY</xsl:when>
			<xsl:when test="($cntry = 'pe') or ($cntry = 'per') or ($cntry = 'peru') or ($cntry = 'p&amp;#233;rou')">PE</xsl:when>
			<xsl:when test="($cntry = 'ph') or ($cntry = 'phl') or ($cntry = 'philippines')">PH</xsl:when>
			<xsl:when test="($cntry = 'pn') or ($cntry = 'pcn') or ($cntry = 'pitcairn')">PN</xsl:when>
			<xsl:when test="($cntry = 'pl') or ($cntry = 'pol') or ($cntry = 'poland') or ($cntry = 'pologne')">PL</xsl:when>
			<xsl:when test="($cntry = 'pt') or ($cntry = 'prt') or ($cntry = 'portugal')">PT</xsl:when>
			<xsl:when test="($cntry = 'pr') or ($cntry = 'pri') or ($cntry = 'puerto rico') or ($cntry = 'porto rico')">PR</xsl:when>
			<xsl:when test="($cntry = 'qa') or ($cntry = 'qat') or ($cntry = 'qatar')">QA</xsl:when>
			<xsl:when test="($cntry = 're') or ($cntry = 'reu') or ($cntry = 'reunion') or ($cntry = 'r&amp;#233;union')">RE</xsl:when>
			<xsl:when test="($cntry = 'ro') or ($cntry = 'rou') or ($cntry = 'romania') or ($cntry = 'roumanie')">RO</xsl:when>
			<xsl:when test="($cntry = 'ru') or ($cntry = 'rus') or ($cntry = 'russian federation') or ($cntry = 'russie, f&amp;#233;d&amp;#233;ration de') or ($cntry = 'russia')">RU</xsl:when>
			<xsl:when test="($cntry = 'rw') or ($cntry = 'rwa') or ($cntry = 'rwanda')">RW</xsl:when>
			<xsl:when test="($cntry = 'bl') or ($cntry = 'blm') or ($cntry = 'saint barth&amp;#233;lemy') or ($cntry = 'saint-barth&amp;#233;lemy')">BL</xsl:when>
			<xsl:when test="($cntry = 'sh') or ($cntry = 'shn') or ($cntry = 'saint helena, ascension and tristan da cunha') or ($cntry = 'sainte-h&amp;#233;l&amp;#232;ne, ascension et tristan da cunha') or ($cntry = 'saint helena') or ($cntry = 'sainte-h&amp;#233;l&amp;#232;ne')">SH</xsl:when>
			<xsl:when test="($cntry = 'kn') or ($cntry = 'kna') or ($cntry = 'saint kitts and nevis') or ($cntry = 'saint-kitts-et-nevis')">KN</xsl:when>
			<xsl:when test="($cntry = 'lc') or ($cntry = 'lca') or ($cntry = 'saint lucia') or ($cntry = 'sainte-lucie')">LC</xsl:when>
			<xsl:when test="($cntry = 'mf') or ($cntry = 'maf') or ($cntry = 'saint martin') or ($cntry = 'saint-martin')">MF</xsl:when>
			<xsl:when test="($cntry = 'pm') or ($cntry = 'spm') or ($cntry = 'saint pierre and miquelon') or ($cntry = 'saint-pierre-et-miquelon')">PM</xsl:when>
			<xsl:when test="($cntry = 'vc') or ($cntry = 'vct') or ($cntry = 'saint vincent and the grenadines') or ($cntry = 'saint-vincent-et-les grenadines')">VC</xsl:when>
			<xsl:when test="($cntry = 'ws') or ($cntry = 'wsm') or ($cntry = 'samoa')">WS</xsl:when>
			<xsl:when test="($cntry = 'sm') or ($cntry = 'smr') or ($cntry = 'san marino') or ($cntry = 'saint-marin')">SM</xsl:when>
			<xsl:when test="($cntry = 'st') or ($cntry = 'stp') or ($cntry = 'sao tome and principe') or ($cntry = 'sao tom&amp;#233;-et-principe')">ST</xsl:when>
			<xsl:when test="($cntry = 'sa') or ($cntry = 'sau') or ($cntry = 'saudi arabia') or ($cntry = 'arabie saoudite')">SA</xsl:when>
			<xsl:when test="($cntry = 'sn') or ($cntry = 'sen') or ($cntry = 'senegal') or ($cntry = 's&amp;#233;n&amp;#233;gal')">SN</xsl:when>
			<xsl:when test="($cntry = 'rs') or ($cntry = 'srb') or ($cntry = 'serbia') or ($cntry = 'serbie')">RS</xsl:when>
			<xsl:when test="($cntry = 'sc') or ($cntry = 'syc') or ($cntry = 'seychelles')">SC</xsl:when>
			<xsl:when test="($cntry = 'sl') or ($cntry = 'sle') or ($cntry = 'sierra leone')">SL</xsl:when>
			<xsl:when test="($cntry = 'sg') or ($cntry = 'sgp') or ($cntry = 'singapore') or ($cntry = 'singapour')">SG</xsl:when>
			<xsl:when test="($cntry = 'sx') or ($cntry = 'sxm') or ($cntry = 'sint maarten (dutch part)') or ($cntry = 'saint-martin (partie n&amp;#233;erlandaise)')">SG</xsl:when>
			<xsl:when test="($cntry = 'sk') or ($cntry = 'svk') or ($cntry = 'slovakia') or ($cntry = 'slovaquie')">SK</xsl:when>
			<xsl:when test="($cntry = 'si') or ($cntry = 'svn') or ($cntry = 'slovenia') or ($cntry = 'slov&amp;#233;nie')">SI</xsl:when>
			<xsl:when test="($cntry = 'sb') or ($cntry = 'slb') or ($cntry = 'solomon islands') or ($cntry = 'salomon, &amp;#238;les')">SB</xsl:when>
			<xsl:when test="($cntry = 'so') or ($cntry = 'som') or ($cntry = 'somalia') or ($cntry = 'somalie')">SO</xsl:when>
			<xsl:when test="($cntry = 'za') or ($cntry = 'zaf') or ($cntry = 'south africa') or ($cntry = 'afrique du sud')">ZA</xsl:when>
			<xsl:when test="($cntry = 'gs') or ($cntry = 'sgs') or ($cntry = 'south georgia and the south sandwich islands') or ($cntry = 'g&amp;#233;orgie du sud et les &amp;#238;les sandwich du sud')">GS</xsl:when>
			<xsl:when test="($cntry = 'es') or ($cntry = 'esp') or ($cntry = 'spain') or ($cntry = 'espagne')">ES</xsl:when>
			<xsl:when test="($cntry = 'lk') or ($cntry = 'lka') or ($cntry = 'sri lanka')">LK</xsl:when>
			<xsl:when test="($cntry = 'sd') or ($cntry = 'sdn') or ($cntry = 'sudan') or ($cntry = 'soudan')">SD</xsl:when>
			<xsl:when test="($cntry = 'sr') or ($cntry = 'dur') or ($cntry = 'suriname')">SR</xsl:when>
			<xsl:when test="($cntry = 'sj') or ($cntry = 'sjm') or ($cntry = 'svalbard and jan mayen') or ($cntry = 'svalbard et &amp;#238;le jan mayen')">SJ</xsl:when>
			<xsl:when test="($cntry = 'sz') or ($cntry = 'swz') or ($cntry = 'swaziland')">SZ</xsl:when>
			<xsl:when test="($cntry = 'se') or ($cntry = 'swe') or ($cntry = 'sweden') or ($cntry = 'su&amp;#232;de')">SE</xsl:when>
			<xsl:when test="($cntry = 'ch') or ($cntry = 'che') or ($cntry = 'switzerland') or ($cntry = 'suisse')">CH</xsl:when>
			<xsl:when test="($cntry = 'sy') or ($cntry = 'syr') or ($cntry = 'syrian arab republic') or ($cntry = 'syrienne, r&amp;#233;publique arabe')">SY</xsl:when>
			<xsl:when test="($cntry = 'tw') or ($cntry = 'twn') or ($cntry = 'taiwan, province of china') or ($cntry = 'ta&amp;#239;wan, province de chine')">TW</xsl:when>
			<xsl:when test="($cntry = 'tj') or ($cntry = 'tjk') or ($cntry = 'tajikistan') or ($cntry = 'tadjikistan')">TJ</xsl:when>
			<xsl:when test="($cntry = 'tz') or ($cntry = 'tza') or ($cntry = 'tanzania, united republic of') or ($cntry = 'tanzanie, r&amp;#233;publique-unie de')">TZ</xsl:when>
			<xsl:when test="($cntry = 'th') or ($cntry = 'tha') or ($cntry = 'thailand') or ($cntry = 'tha&amp;#239;lande')">TH</xsl:when>
			<xsl:when test="($cntry = 'tl') or ($cntry = 'tls') or ($cntry = 'timor-leste')">TL</xsl:when>
			<xsl:when test="($cntry = 'tg') or ($cntry = 'tgo') or ($cntry = 'togo')">TG</xsl:when>
			<xsl:when test="($cntry = 'tk') or ($cntry = 'tkl') or ($cntry = 'tokelau')">TK</xsl:when>
			<xsl:when test="($cntry = 'to') or ($cntry = 'ton') or ($cntry = 'tonga')">TO</xsl:when>
			<xsl:when test="($cntry = 'tt') or ($cntry = 'tto') or ($cntry = 'trinidad and tobago') or ($cntry = 'trinit&amp;#233;-et-tobago')">TT</xsl:when>
			<xsl:when test="($cntry = 'tn') or ($cntry = 'tun') or ($cntry = 'tunisia') or ($cntry = 'tunisie')">TN</xsl:when>
			<xsl:when test="($cntry = 'tr') or ($cntry = 'tur') or ($cntry = 'turkey') or ($cntry = 'turquie')">TR</xsl:when>
			<xsl:when test="($cntry = 'tm') or ($cntry = 'tkm') or ($cntry = 'turkmenistan') or ($cntry = 'turkm&amp;#233;nistan')">TM</xsl:when>
			<xsl:when test="($cntry = 'tc') or ($cntry = 'tca') or ($cntry = 'turks and caicos islands') or ($cntry = 'turks et ca&amp;#239;ques, &amp;#238;les')">TC</xsl:when>
			<xsl:when test="($cntry = 'tv') or ($cntry = 'tuv') or ($cntry = 'tuvalu')">TV</xsl:when>
			<xsl:when test="($cntry = 'ug') or ($cntry = 'uga') or ($cntry = 'uganda') or ($cntry = 'ouganda')">UG</xsl:when>
			<xsl:when test="($cntry = 'ua') or ($cntry = 'ukr') or ($cntry = 'ukraine')">UA</xsl:when>
			<xsl:when test="($cntry = 'ae') or ($cntry = 'are') or ($cntry = 'united arab emirates') or ($cntry = '&amp;#233;mirats arabes unis')">AE</xsl:when>
			<xsl:when test="($cntry = 'gb') or ($cntry = 'gbr') or ($cntry = 'united kingdom') or ($cntry = 'royaume-uni')">GB</xsl:when>
			<xsl:when test="($cntry = 'us') or ($cntry = 'usa') or ($cntry = 'united states') or ($cntry = '&amp;#233;tats-unis') or ($cntry = 'u.s.') or ($cntry = 'u.s.a.') or ($cntry = 'united states of america')">US</xsl:when>
			<xsl:when test="($cntry = 'um') or ($cntry = 'umi') or ($cntry = 'united states minor outlying islands') or ($cntry = '&amp;#238;les mineures &amp;#233;loign&amp;#233;es des &amp;#233;tats-unis')">UM</xsl:when>
			<xsl:when test="($cntry = 'uy') or ($cntry = 'ury') or ($cntry = 'uruguay')">UY</xsl:when>
			<xsl:when test="($cntry = 'uz') or ($cntry = 'uzb') or ($cntry = 'uzbekistan') or ($cntry = 'ouzb&amp;#233;kistan')">UZ</xsl:when>
			<xsl:when test="($cntry = 'vu') or ($cntry = 'vut') or ($cntry = 'vanuatu')">VU</xsl:when>
			<xsl:when test="($cntry = 've') or ($cntry = 'ven') or ($cntry = 'venezuela, bolivarian republic of') or ($cntry = 'venezuela, r&amp;#233;publique bolivarienne du') or ($cntry = 'venezuela')">VE</xsl:when>
			<xsl:when test="($cntry = 'vn') or ($cntry = 'vnm') or ($cntry = 'viet nam') or ($cntry = 'vietnam')">VN</xsl:when>
			<xsl:when test="($cntry = 'vg') or ($cntry = 'vgb') or ($cntry = 'virgin islands, british') or ($cntry = '&amp;#238;les vierges britanniques')">VG</xsl:when>
			<xsl:when test="($cntry = 'vi') or ($cntry = 'vir') or ($cntry = 'virgin islands, u.s.') or ($cntry = '&amp;#238;les vierges des &amp;#233;tats-unis')">VI</xsl:when>
			<xsl:when test="($cntry = 'wf') or ($cntry = 'wlf') or ($cntry = 'wallis and futuna') or ($cntry = 'wallis et futuna')">WF</xsl:when>
			<xsl:when test="($cntry = 'eh') or ($cntry = 'esh') or ($cntry = 'western sahara') or ($cntry = 'sahara occidental')">EH</xsl:when>
			<xsl:when test="($cntry = 'ye') or ($cntry = 'yem') or ($cntry = 'yemen') or ($cntry = 'y&amp;#233;men')">YE</xsl:when>
			<xsl:when test="($cntry = 'zm') or ($cntry = 'zmb') or ($cntry = 'zambia') or ($cntry = 'zambie')">ZM</xsl:when>
			<xsl:when test="($cntry = 'zw') or ($cntry = 'zwe') or ($cntry = 'zimbabwe')">ZW</xsl:when>
			<xsl:otherwise>unknown</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="contentTypeCode">
		<xsl:choose>
			<xsl:when test=". = '001'">
				<xsl:text>Live Data and Maps</xsl:text>
			</xsl:when>
			<xsl:when test=". = '002'">
				<xsl:text>Downloadable Data</xsl:text>
			</xsl:when>
			<xsl:when test=". = '003'">
				<xsl:text>Offline Data</xsl:text>
			</xsl:when>
			<xsl:when test=". = '004'">
				<xsl:text>Static Map Images</xsl:text>
			</xsl:when>
			<xsl:when test=". = '005'">
				<xsl:text>Other Documents</xsl:text>
			</xsl:when>
			<xsl:when test=". = '006'">
				<xsl:text>Applications</xsl:text>
			</xsl:when>
			<xsl:when test=". = '007'">
				<xsl:text>Geographic Services</xsl:text>
			</xsl:when>
			<xsl:when test=". = '008'">
				<xsl:text>Clearinghouses</xsl:text>
			</xsl:when>
			<xsl:when test=". = '009'">
				<xsl:text>Map Files</xsl:text>
			</xsl:when>
			<xsl:when test=". = '010'">
				<xsl:text>Geographic Activities</xsl:text>
			</xsl:when>
			<!-- BEGIN: Esri modifiaction -->
			<xsl:when test=". = '011'">
				<xsl:text>3D models</xsl:text>
			</xsl:when>
			<xsl:when test=". = '012'">
				<xsl:text>Archived or compressed</xsl:text>
			</xsl:when>
			<xsl:when test=". = '013'">
				<xsl:text>Audio</xsl:text>
			</xsl:when>
			<xsl:when test=". = '014'">
				<xsl:text>CAD</xsl:text>
			</xsl:when>
			<xsl:when test=". = '015'">
				<xsl:text>Code, script and executable</xsl:text>
			</xsl:when>
			<xsl:when test=". = '016'">
				<xsl:text>Database</xsl:text>
			</xsl:when>
			<xsl:when test=". = '017'">
				<xsl:text>Document</xsl:text>
			</xsl:when>
			<xsl:when test=". = '018'">
				<xsl:text>Font or vector graphics</xsl:text>
			</xsl:when>
			<xsl:when test=". = '019'">
				<xsl:text>Georaster or grid</xsl:text>
			</xsl:when>
			<xsl:when test=". = '020'">
				<xsl:text>GIS(vector)</xsl:text>
			</xsl:when>
			<xsl:when test=". = '021'">
				<xsl:text>Image(media)</xsl:text>
			</xsl:when>
			<xsl:when test=". = '022'">
				<xsl:text>Metafile or data service</xsl:text>
			</xsl:when>
			<xsl:when test=". = '023'">
				<xsl:text>Physical media</xsl:text>
			</xsl:when>
			<xsl:when test=". = '024'">
				<xsl:text>Personal or project management</xsl:text>
			</xsl:when>
			<xsl:when test=". = '025'">
				<xsl:text>Spreadsheet or tabulated data</xsl:text>
			</xsl:when>
			<xsl:when test=". = '026'">
				<xsl:text>Video and animation</xsl:text>
			</xsl:when>
			<!-- END: Esri modification -->
		</xsl:choose>
	</xsl:template>
	<xsl:template name="fixHTML">
		<xsl:param name="text"/>
		<xsl:variable name="lessThan">&lt;</xsl:variable>
		<xsl:variable name="greaterThan">&gt;</xsl:variable>
		<xsl:choose>
			<xsl:when test="contains($text, $lessThan)">
				<xsl:variable name="before" select="substring-before($text, $lessThan)"/>
				<xsl:variable name="middle" select="substring-after($text, $lessThan)"/>
				<xsl:variable name="after" select="substring-after($middle, $greaterThan)"/>
				<xsl:choose>
					<xsl:when test="$middle">
						<xsl:value-of select="$before"/>
						<xsl:text/>
						<xsl:call-template name="fixHTML">
							<xsl:with-param name="text" select="$after"/>
						</xsl:call-template>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="$text"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$text"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>
