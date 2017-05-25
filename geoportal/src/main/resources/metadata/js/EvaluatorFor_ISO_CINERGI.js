/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

G.evaluators.cinergi = {

    version: "iso.v1.cinergi",

    evaluate: function (task) {
        this.evalBase(task);
        this.evalService(task);
        this.evalSpatial(task);
        this.evalTemporal(task);
        this.evalInspire(task);
        this.evalOther(task);
        this.evalCinergi(task);
        this.evalCallHierarchy(task);
    },

    evalBase: function (task) {
        var item = task.item, root = task.root;
        var iden = G.getNode(task, root, "gmd:identificationInfo/gmd:MD_DataIdentification | gmd:identificationInfo/srv:SV_ServiceIdentification");

        /* general */
        G.evalProp(task, item, root, "fileid", "gmd:fileIdentifier/gco:CharacterString");
        G.evalProp(task, item, iden, "title", "gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString");
        G.evalProp(task, item, iden, "description", "gmd:abstract/gco:CharacterString");
        G.evalProps(task, item, root, "keywords_s", "//gmd:MD_TopicCategoryCode | //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gco:CharacterString | //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gmx:Anchor");
        G.evalProps(task, item, root, "links_s", "//gmd:CI_OnlineResource/gmd:linkage/gmd:URL");
        G.evalProp(task, item, iden, "thumbnail_s", "gmd:graphicOverview/gmd:MD_BrowseGraphic/gmd:fileName/gco:CharacterString");
        G.evalProps(task, item, root, "contact_organizations_s", "//gmd:CI_ResponsibleParty/gmd:organisationName/gco:CharacterString");
        G.evalProps(task, item, root, "contact_people_s", "//gmd:CI_ResponsibleParty/gmd:individualName/gco:CharacterString");

        /* identification */
        G.evalProp(task, item, root, "apiso_Identifier_s", "gmd:fileIdentifier/gco:CharacterString");
        G.evalProp(task, item, root, "apiso_ParentIdentifier_s", "gmd:parentIdentifier/gco:CharacterString");
        G.evalProp(task, item, iden, "apiso_Title_txt", "gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString");
        G.evalProps(task, item, iden, "apiso_AlternateTitle_txt", "gmd:citation/gmd:CI_Citation/gmd:alternateTitle/gco:CharacterString");
        G.evalProp(task, item, iden, "apiso_Abstract_txt", "gmd:abstract/gco:CharacterString");
        G.evalProp(task, item, iden, "apiso_BrowseGraphic_s", "gmd:graphicOverview/gmd:MD_BrowseGraphic/gmd:fileName/gco:CharacterString");
        G.evalProp(task, item, root, "apiso_OrganizationName_txt", "gmd:contact/gmd:CI_ResponsibleParty/gmd:organisationName/gco:CharacterString");

        /* subject */
        G.evalProps(task, item, root, "apiso_Subject_txt", "//gmd:MD_TopicCategoryCode | //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gco:CharacterString | //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gmx:Anchor");
        G.evalProps(task, item, root, "apiso_Format_s", "gmd:distributionInfo/gmd:MD_Distribution/gmd:distributionFormat/gmd:MD_Format/name/gco:CharacterString");
        G.evalProps(task, item, root, "apiso_TopicCategory_s", "//gmd:MD_TopicCategoryCode");
        G.evalProps(task, item, root, "apiso_KeywordType_s", "//gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:type/gmd:MD_KeywordTypeCode/@codeListValue");
        G.evalCode(task, item, root, "apiso_Type_s", "gmd:hierarchyLevel/gmd:MD_ScopeCode");

        /* dates */
        G.evalDate(task, item, root, "apiso_Modified_dt", "gmd:dateStamp/gco:Date | gmd:dateStamp/gco:DateTime");
        G.evalDate(task, item, iden, "apiso_CreationDate_dt", "gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:Date[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='creation'] | gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:DateTime[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='creation']");
        G.evalDate(task, item, iden, "apiso_RevisionDate_dt", "gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:Date[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='revision'] | gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:DateTime[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='revision']");
        G.evalDate(task, item, iden, "apiso_PublicationDate_dt", "gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:Date[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='publication'] | gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:DateTime[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='publication']");

        /* language */
        G.evalCode(task, item, root, "apiso_Language_s", "gmd:language/gmd:LanguageCode");
        G.evalCode(task, item, iden, "apiso_ResourceLanguage_s", "gmd:language/gmd:LanguageCode");

        /* constraints */
        G.evalProps(task, item, root, "apiso_AccessConstraints_s", "//gmd:resourceConstraints/gmd:MD_Constraints/gmd:useLimitation/gco:CharacterString");
        G.evalProps(task, item, root, "apiso_OtherConstraints_s", "//gmd:resourceConstraints/gmd:MD_LegalConstraints/gmd:otherConstraints/gco:CharacterString");
        G.evalProps(task, item, root, "apiso_Classification_s", "//gmd:resourceConstraints/gmd:MD_SecurityConstraints/gmd:classification/gmd:MD_ClassificationCode/@codeListValue");
        G.writeProp(item, "apiso_HasSecurityConstraints_b", G.hasNode(task, root, "//gmd:resourceConstraints"));
    },

    evalInspire: function (task) {
        var item = task.item, root = task.root;
        G.evalProps(task, item, root, "apiso_InspireSpatialDataThemes_s", "//gmd:title[gco:CharacterString='GEMET - INSPIRE themes, version 1.0']/../../../gmd:keyword/gco:CharacterString");
        G.evalProps(task, item, root, "apiso_Degree_b", "//gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:report/gmd:DQ_DomainConsistency/gmd:result/gmd:DQ_ConformanceResult/gmd:pass/gco:Boolean");
        G.evalProps(task, item, root, "apiso_Lineage_txt", "//gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:lineage/gmd:LI_Lineage/gmd:statement/gco:CharacterString");
        G.evalProps(task, item, root, "apiso_ConditionApplyingToAccessAndUse_txt", "//gmd:resourceConstraints/gmd:MD_LegalConstraints/gmd:otherConstraints/gco:CharacterString");
        G.evalCode(task, item, root, "apiso_ResponsiblePartyRole_txt", "gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:role/gmd:CI_RoleCode");
        G.evalProps(task, item, root, "apiso_SpecificationTitle_txt", "//gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:report/gmd:DQ_DomainConsistency/gmd:result/gmd:DQ_ConformanceResult/gmd:specification/gmd:CI_Citation/gmd:title/gco:CharacterString");
        G.evalDates(task, item, root, "apiso_SpecificationDate_dt", "//gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:report/gmd:DQ_DomainConsistency/gmd:result/gmd:DQ_ConformanceResult/gmd:specification/gmd:CI_Citation/gmd:date/gmd:CI_Date/date/gco:Date");
        G.evalProps(task, item, root, "apiso_SpecificationDateType_txt", "//gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:report/gmd:DQ_DomainConsistency/gmd:result/gmd:DQ_ConformanceResult/gmd:specification/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:dateType/gmd:CI_DateTypeCode/@codeListValue");
    },

    evalOther: function (task) {
        var item = task.item, root = task.root;

        /* band */
        G.evalProps(task, item, root, "apiso_mdband_name_s", "//gmd:MD_Band/gmd:sequenceIdentifier/gco:MemberName/gco:aName/gco:CharacterString");
        G.evalProps(task, item, root, "apiso_mdband_attrtype_s", "//gmd:MD_Band/gmd:sequenceIdentifier/gco:MemberName/gco:attributeType/gco:TypeName/gco:aName/gco:CharacterString");
        G.evalProps(task, item, root, "apiso_mdband_desc_s", "//gmd:MD_Band/gmd:descriptor/gco:CharacterString");
        G.evalProps(task, item, root, "apiso_mdband_units_s", "//gmd:MD_Band/gmd:units/@xlink:href");

        /* grid */
        G.evalProps(task, item, root, "apiso_grid_dimensions_num_i", "//gmd:MD_GridSpatialRepresentation/gmd:numberOfDimensions/gco:Integer");
        G.evalProps(task, item, root, "apiso_grid_dimension_name_s", "//gmd:MD_GridSpatialRepresentation/gmd:axisDimensionProperties/gmd:MD_Dimension/gco:Integer/gmd:dimensionName/gmd:MD_DimensionNameTypeCode");
        G.evalProps(task, item, root, "apiso_grid_dimension_size_i", "//gmd:MD_GridSpatialRepresentation/gmd:axisDimensionProperties/gmd:MD_Dimension/gco:Integer/gmd:dimensionSize/gco:Integer");
        G.evalProps(task, item, root, "apiso_grid_cell_geometry_s", "//gmd:MD_GridSpatialRepresentation/gmd:cellGeometry/gmd:MD_CellGeometryCode/@codeListValue");
    },

    evalService: function (task) {
        var item = task.item, root = task.root;

        G.evalProps(task, item, root, "apiso_ServiceType_s", "//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:serviceType/gco:LocalName");
        G.evalProps(task, item, root, "apiso_ServiceTypeVersion_s", "//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:serviceTypeVersion/gco:CharacterString");
        G.evalProps(task, item, root, "apiso_Operation_s", "//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:containsOperations/srv:SV_OperationMetadata/srv:operationName/gco:CharacterStrin");
        G.evalProps(task, item, root, "apiso_OperatesOn_s", "//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:operatesOn/@uuidref | //gmd:identificationInfo/srv:SV_ServiceIdentification/srv:operatesOn/@xlink:href");
        G.evalProps(task, item, root, "apiso_OperatesOnIdentifier_s", "//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:coupledResource/srv:SV_CoupledResource/srv:identifier");
        G.evalProps(task, item, root, "apiso_OperatesOnName_s", "//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:coupledResource/srv:SV_CoupledResource/srv:operationName");
        G.evalProps(task, item, root, "apiso_CouplingType_s", "//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:couplingType/srv:SV_CouplingType/@codeListValue");

        G.evalResourceLinks(task, item, root, "gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource/gmd:linkage/gmd:URL | gmd:identificationInfo/srv:SV_ServiceIdentification/srv:containsOperations/srv:SV_OperationMetadata/srv:connectPoint/gmd:CI_OnlineResource/gmd:linkage/gmd:URL");
        this.evalResourceLinks(task, item, root, "gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource/gmd:linkage/gmd:URL | gmd:identificationInfo/srv:SV_ServiceIdentification/srv:containsOperations/srv:SV_OperationMetadata/srv:connectPoint/gmd:CI_OnlineResource/gmd:linkage/gmd:URL");
        this.evalWorkbenchLinks(task, item, root, "gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine");
    },

    evalSpatial: function (task) {
        var item = task.item, root = task.root;
        G.forEachNode(task, root, "//gmd:EX_Extent/gmd:geographicElement/gmd:EX_GeographicBoundingBox", function (node) {
            var xmin = G.Val.chkDbl(G.getString(task, node, "gmd:westBoundLongitude/gco:Decimal"), null);
            var ymin = G.Val.chkDbl(G.getString(task, node, "gmd:southBoundLatitude/gco:Decimal"), null);
            var xmax = G.Val.chkDbl(G.getString(task, node, "gmd:eastBoundLongitude/gco:Decimal"), null);
            var ymax = G.Val.chkDbl(G.getString(task, node, "gmd:northBoundLatitude/gco:Decimal"), null);
            //print("xmin="+xmin+ "ymin="+ymin+ "xmax="+xmax+ "ymax="+ymax);
            var result = G.makeEnvelope(xmin, ymin, xmax, ymax);
            if (result && result.envelope) {
                G.writeMultiProp(task.item, "envelope_geo", result.envelope);
                if (result.center) {
                    G.writeMultiProp(task.item, "envelope_cen_pt", result.center);
                }
            }
        });
        G.forEachNode(task, root, "gmd:referenceSystemInfo/gmd:MD_ReferenceSystem/gmd:referenceSystemIdentifier/gmd:RS_Identifier", function (node) {
            var crsId = G.getString(task, node, "gmd:code/gco:CharacterString");
            var crsAuth = G.getString(task, node, "gmd:authority/gmd:CI_Citation/gmd:title/gco:CharacterString");
            var crsVer = G.getString(task, node, "gmd:version/gco:CharacterString");
            if (crsId !== null && crsId.length > 0) {
                var crs = {"id_s": crsId};
                if (crsAuth !== null && crsAuth.length > 0) crs["authority_s"] = crsAuth;
                if (crsVer !== null && crsVer.length > 0) crs["version_s"] = crsVer;
                item["apiso_CRS"] = crs;
            }
        });
        G.evalProps(task, item, root, "apiso_GeographicDescriptionCode_s", "//gmd:EX_Extent/gmd:geographicElement/gmd:EX_GeographicDescription/gmd:geographicIdentifier/gmd:MD_Identifier/gmd:code");
        G.evalProp(task, item, root, "apiso_Denominator_i", "gmd:identificationInfo/gmd:MD_DataIdentification/gmd:spatialResolution/gmd:MD_Resolution/gmd:equivalentScale/gmd:MD_RepresentativeFraction/gmd:denominator/gco:Integer");
        G.evalProp(task, item, root, "apiso_DistanceValue_d", "gmd:identificationInfo/gmd:MD_DataIdentification/gmd:spatialResolution/gmd:MD_Resolution/gmd:distance/gco:Distance");
        G.evalProp(task, item, root, "apiso_DistanceUOM_s", "gmd:identificationInfo/gmd:MD_DataIdentification/gmd:spatialResolution/gmd:MD_Resolution/gmd:distance/gco:Distance/@uom");
    },

    evalTemporal: function (task) {
        var self = this;
        var item = task.item, root = task.root;
        G.forEachNode(task, root, "//gmd:EX_TemporalExtent/gmd:extent", function (node) {
            var params = null;

            if (G.hasNode(task, node, "gml:TimeInstant/gml:timePosition")) {
                params = {
                    instant: {
                        date: G.getString(task, node, "gml:TimeInstant/gml:timePosition"),
                        indeterminate: G.getString(task, node, "gml:TimeInstant/gml:timePosition/@indeterminatePosition")
                    }
                };
            } else if (G.hasNode(task, node, "gml:TimePeriod/gml:beginPosition")) {
                params = {
                    begin: {
                        date: G.getString(task, node, "gml:TimePeriod/gml:beginPosition"),
                        indeterminate: G.getString(task, node, "gml:TimePeriod/gml:beginPosition/@indeterminatePosition")
                    },
                    end: {
                        date: G.getString(task, node, "gml:TimePeriod/gml:endPosition"),
                        indeterminate: G.getString(task, node, "gml:TimePeriod/gml:endPosition/@indeterminatePosition")
                    }
                };
            } else if (G.hasNode(task, node, "gml:TimePeriod/gml:begin")) {
                params = {
                    begin: {
                        date: G.getString(task, node, "gml:TimePeriod/gml:begin/gml:TimeInstant/gml:timePosition"),
                        indeterminate: G.getString(task, node, "gml:TimePeriod/gml:begin/gml:TimeInstant/gml:timePosition/@indeterminatePosition")
                    },
                    end: {
                        date: G.getString(task, node, "gml:TimePeriod/gml:end/gml:TimeInstant/gml:timePosition"),
                        indeterminate: G.getString(task, node, "gml:TimePeriod/gml:end/gml:TimeInstant/gml:timePosition/@indeterminatePosition")
                    }
                };

            } else if (G.hasNode(task, node, "gml32:TimeInstant/gml32:timePosition")) {
                params = {
                    instant: {
                        date: G.getString(task, node, "gml32:TimeInstant/gml32:timePosition"),
                        indeterminate: G.getString(task, node, "gml32:TimeInstant/gml32:timePosition/@indeterminatePosition")
                    }
                };
            } else if (G.hasNode(task, node, "gml32:TimePeriod/gml32:beginPosition")) {
                params = {
                    begin: {
                        date: G.getString(task, node, "gml32:TimePeriod/gml32:beginPosition"),
                        indeterminate: G.getString(task, node, "gml32:TimePeriod/gml32:beginPosition/@indeterminatePosition")
                    },
                    end: {
                        date: G.getString(task, node, "gml32:TimePeriod/gml32:endPosition"),
                        indeterminate: G.getString(task, node, "gml32:TimePeriod/gml32:endPosition/@indeterminatePosition")
                    }
                };
            } else if (G.hasNode(task, node, "gml32:TimePeriod/gml32:begin")) {
                params = {
                    begin: {
                        date: G.getString(task, node, "gml32:TimePeriod/gml32:begin/gml32:TimeInstant/gml32:timePosition"),
                        indeterminate: G.getString(task, node, "gml32:TimePeriod/gml32:begin/gml32:TimeInstant/gml32:timePosition/@indeterminatePosition")
                    },
                    end: {
                        date: G.getString(task, node, "gml32:TimePeriod/gml32:end/gml32:TimeInstant/gml32:timePosition"),
                        indeterminate: G.getString(task, node, "gml32:TimePeriod/gml32:end/gml32:TimeInstant/gml32:timePosition/@indeterminatePosition")
                    }
                };
            }

            //if (params) G.analyzeTimePeriod(task, params);
            if (params) self._analyzeTimePeriod(task, params);
        });
    },

    evalCinergi: function (task) {
        var item = task.item, root = task.root;
        /*
         1) if keyword node ia an anchor, and citation title contains > then treat is as a hierachy
         //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'>')]
         //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'C')]/../../../../gmd:keyword
         //| //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gmx:Anchor
         md_keywords: //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'C')]/../../../..
         2) if the title of a keyword viaf put in oranization
         */


        G.forEachNode(task, root, "//gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'>')]/../../../../gmd:keyword", function (node) {
            var cat = G.getString(task, node, "../gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString") + ' > ';
            var name = G.getString(task, node, "gmx:Anchor");
            cat = cat.concat(name);
            G.writeMultiProp(task.item, "categories_cat", cat);

        });
    },

    evalCallHierarchy: function (task) {
        var item = task.item, root = task.root;
        var fileid = G.getString(task, root, "gmd:fileIdentifier/gco:CharacterString");

        /* calls Cinergi Hierarchy Service with a document ID,
         http://132.249.238.151:8080/foundry/api/cinergi/docs/keyword/hierarchies/?id=%7bad308574-044c-3942-81dc-7d6e155dafac%7d
         {"keywords": [
         {
         "keyword": "Water Chemistry",
         "hierarchy": "Science Domain > Chemistry > Geochemistry > Hydrochemistry"
         },
         {
         "keyword": "Chemistry",
         "hierarchy": "Science Domain > Chemistry"
         },
         }
         Extracts path
         puts paths in document
         */

        try {
            var url = 'http://132.249.238.151:8080/foundry/api/cinergi/docs/keyword/hierarchies?id=';
            url = url + fileid;
            var hier = edu.sdsc.cinergi.service.client.hierarchy.getUrlAsJsonObject(url);
            if (hier == undefined) {
                print("No Hierarchy id:", fileid);
                return;
            }   //var kwds = hier.getJsonArray("keywords");
            var kwds = hier.keywords;

            //print (kwds);
            //print (kwds[0].hierarchy);

            for (i = 0; i < kwds.length; i++) {
                //print (kwds[i]);
                //print (kwds[i].hierarchy);
                if (kwds[i].hierarchy.getString().contains("Unassigned")) {
                    continue;
                }
                G.writeMultiProp(task.item, "hierarchies_cat", "Category > " + kwds[i].hierarchy.getString());
                //print (task.item.hierarchies_cat);
            }

            //kwds.foreach(
            //    function(element, index, array) {
            //      G.writeProp(task.item, "hierarchies_cat", element.hierarchy);
            //    }
            //)
            //var kwds = getJSON(url ,
            //    function(err, data) {
            //      if (err != null) {
            //        alert("Something went wrong: " + err);
            //      } else {
            //        kwds.foreach(
            //         function(element, index, array) {
            //           G.writeProp(task.item, "hierarchies_cat", element.hierarchy);
            //         }
            //        )
            //      }
            //    });

        } catch (e) {
            print("INFO: Cinergi.ISO: No CINEGI hierarchy for:", fileid);
          //  print(e.message);
        }
        //G.forEachNode(task,root,"//gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'>')]/../../../../gmd:keyword",function(node){
        //  var cat = G.getString(task,node,"../gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString") + '>';
        //  var name = G.getString(task,node,"gmd:keyword/gmx:Anchor");
        //  cat.concat( name );
        //  G.writeMultiProp(task.item,"hierarchies_cat",cat);
        //
        //});

    },
    evalResourceLinks: function(task,obj,contextNode,xpathExpression) {
        if (!contextNode) return;
        var self = this, urls = [], name = "resources_nst";
        G.forEachNode(task,contextNode,xpathExpression,function(node){
            var url = G.getNodeText(node);
            var info = self.checkResourceLink(url);
            if (info && info.linkUrl && info.linkType) {
                if (urls.indexOf(info.linkUrl) === -1) {
                    urls.push(info.linkUrl);
                    G.writeMultiProp(obj,name,{
                        "url_s": info.linkUrl,
                        "url_type_s": info.linkType
                    });
                }
            }
        });
    },
    checkResourceLink: function(url) {
        var endsWith = function(v,sfx) {return (v.indexOf(sfx,(v.length-sfx.length)) !== -1);};

        var arcgisTypes = ["MapServer","ImageServer","FeatureServer","GlobeServer","GPServer","GeocodeServer",
            "GeometryServer","NAServer","GeoDataServer ","MobileServer","SceneServer",
            "SchematicsServer","StreamServer","VectorTileServer"];
        var ogcTypes = ["WMS","WFS","WCS","WMTS","WPS","SOS","CSW"];
        var dataTypes = ["zip","shp"];

        var i, v, lc, linkType = null, linkUrl = null;
        var isHttp = (typeof url === "string" && (url.indexOf("http://") === 0 || url.indexOf("https://") === 0));
        var isFtp = (typeof url === "string" && (url.indexOf("ftp://") === 0 || url.indexOf("ftps://") === 0));
        if (isHttp) {
            lc = url.toLowerCase();
            if (lc.indexOf("service=") > 0) {
                //if (lc.indexOf("request=getcapabilities") > 0) {}
                for (i=0;i<ogcTypes.length;i++) {
                    v = "service="+ogcTypes[i].toLowerCase();
                    if (lc.indexOf("?"+v) > 0 || lc.indexOf("&"+v) > 0) {
                        linkType = ogcTypes[i];
                        linkUrl = url;
                        break;
                    }
                }
            } else if (lc.indexOf("/rest/services/") > 0) {
                for (i=0;i<arcgisTypes.length;i++) {
                    v = "/"+arcgisTypes[i].toLowerCase();
                    if (endsWith(lc,v)) {
                        linkType = arcgisTypes[i];
                        linkUrl = url;
                        break;
                    }
                }
            }
            if (linkType === null) {
                if (endsWith(lc,".kml") || endsWith(lc,".kmz") ||
                    lc.indexOf("?f=kml") > 0 || lc.indexOf("&f=kml") > 0 ||
                    lc.indexOf("?f=kmz") > 0 || lc.indexOf("&f=kmz") > 0) {
                    linkType = "kml";
                    linkUrl = url;
                }
            }
            if (linkType === null) {
                if (lc.indexOf("com.esri.wms.esrimap")>= 0) {
                    linkType = "IMS";
                    linkUrl = url;
                }
            }
            if (linkType === null) {
                if (lc.indexOf("cuahsi_1_1.asmx")>= 0) {
                    linkType = "WaterOneFlow";
                    linkUrl = url;
                }
            }
        }
        if (linkType !== null && (isHttp || isFtp)) {
            return {linkType:linkType,linkUrl:linkUrl};
        }
    },
    // //gmd:transferOptions
    evalWorkbenchLinks: function(task,item,root,xpathExpression) {
        if (!root) return;
        var self = this, urls = [], name = "services_nst";
       // print(xpathExpression);
        G.forEachNode(task,root,xpathExpression,function(node){
            //CUAHSI WaterOneFlow SOAP service
            // /gmd:MD_Metadata/gmd:distributionInfo[1]/gmd:MD_Distribution[1]/gmd:distributionFormat[1]/gmd:MD_Format[1]/gmd:name[1]/gco:CharacterString[1]
         //   print (node);
            var linkName = G.getString(task, node,"../../../gmd:distributionFormat/gmd:MD_Format/gmd:name/gco:CharacterString");
           // print(name);
            // /gmd:MD_Metadata/gmd:distributionInfo[1]/gmd:MD_Distribution[1]/gmd:transferOptions[1]/gmd:MD_DigitalTransferOptions[1]/gmd:onLine[1]/gmd:CI_OnlineResource[1]/gmd:linkage[1]/gmd:URL[1]

            var url = G.getString(task, node,"gmd:CI_OnlineResource/gmd:linkage/gmd:URL");
           // print ("url"+ url);
            // /gmd:MD_Metadata/gmd:distributionInfo[1]/gmd:MD_Distribution[1]/gmd:transferOptions[1]/gmd:MD_DigitalTransferOptions[1]/gmd:onLine[1]/gmd:CI_OnlineResource[1]/gmd:name[1]/gco:CharacterString[1]

             var type = G.getString(task, node,"gmd:CI_OnlineResource/gmd:name/gco:CharacterString");
           // print("type" + type);
            //var info = self.checkResourceLink(url);
            // /gmd:MD_Metadata/gmd:distributionInfo[1]/gmd:MD_Distribution[1]/gmd:transferOptions[1]/gmd:MD_DigitalTransferOptions[1]/gmd:onLine[1]/gmd:CI_OnlineResource[1]

            if (linkName && url && type) {
                if (urls.indexOf(url) === -1) {
                    urls.push(url);
                    G.writeMultiProp(item,name,{
                        "url_s": url,
                        "url_type_s": type,
                        "url_name_s": linkName
                    });
                }
            }
        });
    },
    checkWorkbenchLink: function(url) {
        var endsWith = function(v,sfx) {return (v.indexOf(sfx,(v.length-sfx.length)) !== -1);};

        var arcgisTypes = ["MapServer","ImageServer","FeatureServer","GlobeServer","GPServer","GeocodeServer",
            "GeometryServer","NAServer","GeoDataServer ","MobileServer","SceneServer",
            "SchematicsServer","StreamServer","VectorTileServer"];
        var ogcTypes = ["WMS","WFS","WCS","WMTS","WPS","SOS","CSW"];
        var dataTypes = ["zip","shp"];

        var i, v, lc, linkType = null, linkUrl = null;
        var isHttp = (typeof url === "string" && (url.indexOf("http://") === 0 || url.indexOf("https://") === 0));
        var isFtp = (typeof url === "string" && (url.indexOf("ftp://") === 0 || url.indexOf("ftps://") === 0));
        if (isHttp) {
            lc = url.toLowerCase();
            if (lc.indexOf("service=") > 0) {
                //if (lc.indexOf("request=getcapabilities") > 0) {}
                for (i=0;i<ogcTypes.length;i++) {
                    v = "service="+ogcTypes[i].toLowerCase();
                    if (lc.indexOf("?"+v) > 0 || lc.indexOf("&"+v) > 0) {
                        linkType = ogcTypes[i];
                        linkUrl = url;
                        break;
                    }
                }
            } else if (lc.indexOf("/rest/services/") > 0) {
                for (i=0;i<arcgisTypes.length;i++) {
                    v = "/"+arcgisTypes[i].toLowerCase();
                    if (endsWith(lc,v)) {
                        linkType = arcgisTypes[i];
                        linkUrl = url;
                        break;
                    }
                }
            }
            if (linkType === null) {
                if (endsWith(lc,".kml") || endsWith(lc,".kmz") ||
                    lc.indexOf("?f=kml") > 0 || lc.indexOf("&f=kml") > 0 ||
                    lc.indexOf("?f=kmz") > 0 || lc.indexOf("&f=kmz") > 0) {
                    linkType = "kml";
                    linkUrl = url;
                }
            }
            if (linkType === null) {
                if (lc.indexOf("com.esri.wms.esrimap")>= 0) {
                    linkType = "IMS";
                    linkUrl = url;
                }
            }
            if (linkType === null) {
                if (lc.indexOf("cuahsi_1_1.asmx")>= 0) {
                    linkType = "WaterOneFlow";
                    linkUrl = url;
                }
            }
        }
        if (linkType !== null && (isHttp || isFtp)) {
            return {linkType:linkType,linkUrl:linkUrl};
        }
    },
    _analyzeTimePeriod: function(task,params) {
        //print("analyzeTimePeriod");
        if (!params) return;
        //"instant_dt": null, "instant_indeterminate_s": null,
        var data = {
            "begin_dt": null,
            "begin_indeterminate_s": null,
            "end_dt": null,
            "end_indeterminate_s": null,
        };
        if (params.instant) {
            //data["instant_dt"] = this.DateUtil.checkIsoDateTime(params.instant.date,false);
            //data["instant_indeterminate_s"] = this.Val.chkStr(params.instant.indeterminate,null);
            if (!params.begin && !params.end) {
                params.begin = {
                    date: params.instant.date,
                    indeterminate: params.instant.indeterminate
                };
                // TODO should use the instant
                params.end = {
                    date: params.instant.date,
                    indeterminate: params.instant.indeterminate
                };
            }
        }
        if (params.begin) {
            if (typeof params.begin.date === "string" && !params.begin.date.startsWith("9999")
            && this._limitDateRange(params.begin.date )
            ) {
                data["begin_dt"] = G.DateUtil.checkIsoDateTime(params.begin.date,false);
            }
            data["begin_indeterminate_s"] = G.Val.chkStr(params.begin.indeterminate,null);
        }
        if (params.end) {
            if (typeof params.end.date === "string" && !params.end.date.startsWith("9999")
                && this._limitDateRange(params.end.date )
            ) {
                data["end_dt"] = G.DateUtil.checkIsoDateTime(params.end.date,true);
            }
            data["end_indeterminate_s"] = G.Val.chkStr(params.end.indeterminate,null);
        }
        var ok = false;
        for (var k in data) {
            if (data.hasOwnProperty(k)) {
                if (data[k] !== null ) {
                    ok = true;
                    break;
                }
            }
        }
        if (ok) {
            //this.writeMultiProp(task.item,"timeperiod_tp",data);
            G.writeMultiProp(task.item,"timeperiod_nst",data);
        }
    },
    _limitDateRange: function(dateString){
        var validDate = true;
        if (dateString.startsWith("9999")) validDate = false;

        try {
            var dateYear = dateString.substr(0,4);
            var dateInt = parseInt(dateYear);
            if ( (dateInt === undefined) ||  (dateInt < 1000) || (dateInt > 2100) ){
                print ("daterange reject "+ dateString );
                validDate = false;
            }
        } catch (ex) {
            print ("daterange error "+dateString );
            validDate=false;
        }
        return validDate;
    },
};
//var getJSON = function(url, callback) {
//  var xhr = new XMLHttpRequest();
//  xhr.open("get", url, true);
//  xhr.responseType = "json";
//  xhr.onload = function() {
//    var status = xhr.status;
//    if (status == 200) {
//      callback(null, xhr.response);
//    } else {
//      callback(status);
//    }
//  };
//  xhr.send();
//};