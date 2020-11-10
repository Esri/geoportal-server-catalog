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

G.evaluators.iso = {

  version: "iso.v1",

  evaluate: function(task) {
    this.evalBase(task);
    this.evalService(task);
    this.evalSpatial(task);
    this.evalTemporal(task);
    this.evalInspire(task);
    this.evalOther(task);
    this.evalLinks(task);
  },

  evalBase: function(task) {
    var item = task.item, root = task.root;
    var iden = G.getNode(task,root,"gmd:identificationInfo/gmd:MD_DataIdentification | gmd:identificationInfo/srv:SV_ServiceIdentification");

    /* general */
    G.evalProp(task,item,root,"fileid","gmd:fileIdentifier/*/text()");
    G.evalProp(task,item,iden,"title","gmd:citation/gmd:CI_Citation/gmd:title/*/text()");
    G.evalProp(task,item,iden,"description","gmd:abstract/gco:CharacterString");
    G.evalProps(task,item,root,"keywords_s","//gmd:MD_TopicCategoryCode | //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/*/text() ");
    G.evalProp(task,item,iden,"thumbnail_s","gmd:graphicOverview/gmd:MD_BrowseGraphic/gmd:fileName/gco:CharacterString");
    G.evalProps(task,item,root,"contact_organizations_s","//gmd:CI_ResponsibleParty/gmd:organisationName/*/text()");
    G.evalProps(task,item,root,"contact_people_s","//gmd:CI_ResponsibleParty/gmd:individualName/*/text()");
    
    /* links */
    //G.evalProps(task,item,root,"links_s","//gmd:CI_OnlineResource/gmd:linkage/gmd:URL");
    //G.evalProps(task,item,root,"links_s","//gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource/gmd:linkage/gmd:URL | //srv:connectPoint/gmd:CI_OnlineResource/gmd:linkage/gmd:URL"); 
    G.evalProps(task,item,root,"links_s","//gmd:CI_OnlineResource/gmd:linkage/gmd:URL[not(ancestor::gmd:thesaurusName)]");    

    /* identification */
    G.evalProp(task,item,root,"apiso_Identifier_s","gmd:fileIdentifier/*/text()");
    G.evalProp(task,item,root,"apiso_ParentIdentifier_s","gmd:parentIdentifier/*/text()");
    G.evalProp(task,item,iden,"apiso_Title_txt","gmd:citation/gmd:CI_Citation/gmd:title/*/text()");
    G.evalProps(task,item,iden,"apiso_AlternateTitle_txt","gmd:citation/gmd:CI_Citation/gmd:alternateTitle/*/text()");
    G.evalProp(task,item,iden,"apiso_Abstract_txt","gmd:abstract/gco:CharacterString");
    G.evalProp(task,item,iden,"apiso_BrowseGraphic_s","gmd:graphicOverview/gmd:MD_BrowseGraphic/gmd:fileName/gco:CharacterString");
    G.evalProp(task,item,root,"apiso_OrganizationName_txt","gmd:contact/gmd:CI_ResponsibleParty/gmd:organisationName/*/text()");

    /* subject */
    G.evalProps(task,item,root,"apiso_Subject_txt","//gmd:MD_TopicCategoryCode | //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/*/text() ");
    G.evalProps(task,item,root,"apiso_Format_s","gmd:distributionInfo/gmd:MD_Distribution/gmd:distributionFormat/gmd:MD_Format/gmd:name/*/text()");
    G.evalProps(task,item,root,"apiso_TopicCategory_s","//gmd:MD_TopicCategoryCode");
    G.evalProps(task,item,root,"apiso_KeywordType_s","//gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:type/gmd:MD_KeywordTypeCode/@codeListValue");
    G.evalCode(task,item,root,"apiso_Type_s","gmd:hierarchyLevel/gmd:MD_ScopeCode");

    /* dates */
      G.evalDate(task, item, root, "apiso_Modified_dt", "gmd:dateStamp/gco:Date | gmd:dateStamp/gco:DateTime");
      G.evalDate(task, item, iden, "apiso_CreationDate_dt", "gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:Date[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='creation'] | gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:DateTime[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='creation']");
      G.evalDate(task, item, iden, "apiso_RevisionDate_dt", "gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:Date[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='revision'] | gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:DateTime[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='revision']");
      G.evalDate(task, item, iden, "apiso_PublicationDate_dt", "gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:Date[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='publication'] | gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:DateTime[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='publication']");

      /* language */
    G.evalCode(task,item,root,"apiso_Language_s","gmd:language/gmd:LanguageCode");
    G.evalCode(task,item,iden,"apiso_ResourceLanguage_s","gmd:language/gmd:LanguageCode");

    /* constraints */
    G.evalProps(task,item,root,"apiso_AccessConstraints_s","//gmd:resourceConstraints/gmd:MD_Constraints/gmd:useLimitation/*/text()");
    G.evalProps(task,item,root,"apiso_OtherConstraints_s","//gmd:resourceConstraints/gmd:MD_LegalConstraints/gmd:otherConstraints/*/text()");
    G.evalProps(task,item,root,"apiso_Classification_s","//gmd:resourceConstraints/gmd:MD_SecurityConstraints/gmd:classification/gmd:MD_ClassificationCode/@codeListValue");
    G.writeProp(item,"apiso_HasSecurityConstraints_b",G.hasNode(task,root,"//gmd:resourceConstraints"));
    
    /* hierarchical category */
    
    /*
     * There are two distinct cases of the source of the hierarchical category 
     * information: metadata or a legacy system (service). Hierarchical category
     * is always a string with pipe (|) separated category names like: 
     * "Category|Oceanic|Temperature". If other separator is desired, update
     * replace delimiter declaration in hierarchy_tokenizer and 
     * reverse_hierarchy_tokenizer within elastic-mappings.json and
     * elastic-mappings-7.json, then recreate Elastic Search index.
     * 
     * If the source is metadata or, more acuratelly: a field from within metadata
     * use G.evalProps to read that information and put into 'src_category_cat
     * property (Eample 1)
     * 
     * If the source of the metadata is an UNC folder or WAF folder, it is possible
     * to use folder structure as category (Example 2)
     * 
     * If the source is a legacy system, you may consider making an AJAX call to
     * this system and receive mapping information then use it to update
     * 'user_category_cat' property (Example 3). In this example a simple service 
     * is listening on port 3000 and is awaiting for the HTTP GET request in the 
     * form of the following pattern: http://localhost:3000/<fileId> where file 
     * id is information extracted from the metadata itself. External service is 
     * able to map file it into category and provide a JSON response as below:
     * {
     *  "category": <category>
     * }
     * 
     * NOTE! While first example uses 'src_category_cat' the second one uses 
     * 'user_category_cat'. This is not a mistake; prefixes like 'src_' and 
     * 'user_' denotes if particular property should be replaced or preserved
     * during record update (harvesting).
     * 
     * In order to 'user_category_cat' be used instead of 'src_category_cat'
     * update code of the Hierachical Category facet in SearchPanel.html
     */
   
// //Example 1
//    G.evalProps(task,item,root,"src_category_cat","//gmd:MD_TopicCategoryCode");

// //Example 2
//    var json = task.suppliedJson;
//    if (json && (json.src_source_type_s === "UNC" || json.src_source_type_s === "WAF") 
//             && json.src_uri_s && json.src_source_uri_s && json.src_source_uri_s.startsWith(json.src_source_type_s)) {
//      var src_root = json.src_source_uri_s.substr(json.src_source_type_s.length+1);
//      var src_root_index = json.src_uri_s.indexOf(src_root);
//      if (src_root_index >= 0) {
//        var src_base = json.src_uri_s.substr(src_root_index + src_root.length);
//        src_base = src_base.split("/").filter(function(p) { return p.length > 0; }).slice(0, -1);
//        src_base.unshift(src_root);
//        var category = src_base.join("|");
//        item["src_category_cat"] = [ category ];
//      }
//    }

// //Example 3
//    try {
//      var response = JSON.parse(G.httpGet("http://localhost:3000/"+item.fileid));
//      if (response && response.category && response.category.length > 0) {
//        item["user_category_cat"] = [ response.category ];
//      }
//    } catch(exception) {
//      print(exception);
//    }
    
  },

  evalInspire: function(task) {
    var item = task.item, root = task.root;
    G.evalProps(task,item,root,"apiso_InspireSpatialDataThemes_s","//gmd:title[gco:CharacterString='GEMET - INSPIRE themes, version 1.0']/../../../gmd:keyword/*/text()");
    G.evalProps(task,item,root,"apiso_Degree_b","//gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:report/gmd:DQ_DomainConsistency/gmd:result/gmd:DQ_ConformanceResult/gmd:pass/gco:Boolean");
    G.evalProps(task,item,root,"apiso_Lineage_txt","//gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:lineage/gmd:LI_Lineage/gmd:statement/gco:CharacterString");
    G.evalProps(task,item,root,"apiso_ConditionApplyingToAccessAndUse_txt","//gmd:resourceConstraints/gmd:MD_LegalConstraints/gmd:otherConstraints/gco:CharacterString");
    G.evalCode (task,item,root,"apiso_ResponsiblePartyRole_txt","gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:role/gmd:CI_RoleCode");
    G.evalProps(task,item,root,"apiso_SpecificationTitle_txt","//gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:report/gmd:DQ_DomainConsistency/gmd:result/gmd:DQ_ConformanceResult/gmd:specification/gmd:CI_Citation/gmd:title/*/text()");
    G.evalDates(task,item,root,"apiso_SpecificationDate_dt","//gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:report/gmd:DQ_DomainConsistency/gmd:result/gmd:DQ_ConformanceResult/gmd:specification/gmd:CI_Citation/gmd:date/gmd:CI_Date/date/gco:Date");
    G.evalProps(task,item,root,"apiso_SpecificationDateType_txt","//gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:report/gmd:DQ_DomainConsistency/gmd:result/gmd:DQ_ConformanceResult/gmd:specification/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:dateType/gmd:CI_DateTypeCode/@codeListValue");   
  },

  evalOther: function(task) {
    var item = task.item, root = task.root;

    /* band */
    G.evalProps(task,item,root,"apiso_mdband_name_s","//gmd:MD_Band/gmd:sequenceIdentifier/gco:MemberName/gco:aName/*/text()");
    G.evalProps(task,item,root,"apiso_mdband_attrtype_s","//gmd:MD_Band/gmd:sequenceIdentifier/gco:MemberName/gco:attributeType/gco:TypeName/gco:aName/*/text()");
    G.evalProps(task,item,root,"apiso_mdband_desc_s","//gmd:MD_Band/gmd:descriptor/*/text()");
    G.evalProps(task,item,root,"apiso_mdband_units_s","//gmd:MD_Band/gmd:units/@xlink:href");

    /* grid */
    G.evalProps(task,item,root,"apiso_grid_dimensions_num_i","//gmd:MD_GridSpatialRepresentation/gmd:numberOfDimensions/gco:Integer");
    G.evalProps(task,item,root,"apiso_grid_dimension_name_s","//gmd:MD_GridSpatialRepresentation/gmd:axisDimensionProperties/gmd:MD_Dimension/gco:Integer/gmd:dimensionName/gmd:MD_DimensionNameTypeCode");
    G.evalProps(task,item,root,"apiso_grid_dimension_size_i","//gmd:MD_GridSpatialRepresentation/gmd:axisDimensionProperties/gmd:MD_Dimension/gco:Integer/gmd:dimensionSize/gco:Integer");
    G.evalProps(task,item,root,"apiso_grid_cell_geometry_s","//gmd:MD_GridSpatialRepresentation/gmd:cellGeometry/gmd:MD_CellGeometryCode/@codeListValue");    
  },

  evalService: function(task) {
    var item = task.item, root = task.root;

    G.evalProps(task,item,root,"apiso_ServiceType_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:serviceType/gco:LocalName");
    G.evalProps(task,item,root,"apiso_ServiceTypeVersion_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:serviceTypeVersion/*/text()");
    G.evalProps(task,item,root,"apiso_Operation_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:containsOperations/srv:SV_OperationMetadata/srv:operationName/*/text()");
    G.evalProps(task,item,root,"apiso_OperatesOn_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:operatesOn/@uuidref | //gmd:identificationInfo/srv:SV_ServiceIdentification/srv:operatesOn/@xlink:href");
    G.evalProps(task,item,root,"apiso_OperatesOnIdentifier_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:coupledResource/srv:SV_CoupledResource/srv:identifier");
    G.evalProps(task,item,root,"apiso_OperatesOnName_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:coupledResource/srv:SV_CoupledResource/srv:operationName");
    G.evalProps(task,item,root,"apiso_CouplingType_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:couplingType/srv:SV_CouplingType/@codeListValue");

    G.evalResourceLinks(task,item,root,"gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource/gmd:linkage/gmd:URL | gmd:identificationInfo/srv:SV_ServiceIdentification/srv:containsOperations/srv:SV_OperationMetadata/srv:connectPoint/gmd:CI_OnlineResource/gmd:linkage/gmd:URL");
  },

  evalSpatial: function(task) {
    var item = task.item, root = task.root;
    var hasEnvelope = false;
    G.forEachNode(task,root,"//gmd:EX_Extent/gmd:geographicElement/gmd:EX_GeographicBoundingBox",function(node){
      var xmin = G.Val.chkDbl(G.getString(task,node,"gmd:westBoundLongitude/gco:Decimal"),null);
      var ymin = G.Val.chkDbl(G.getString(task,node,"gmd:southBoundLatitude/gco:Decimal"),null);
      var xmax = G.Val.chkDbl(G.getString(task,node,"gmd:eastBoundLongitude/gco:Decimal"),null);
      var ymax = G.Val.chkDbl(G.getString(task,node,"gmd:northBoundLatitude/gco:Decimal"),null);
      //print("xmin="+xmin+ "ymin="+ymin+ "xmax="+xmax+ "ymax="+ymax);
      var result = G.makeEnvelope(xmin,ymin,xmax,ymax);
      if (result && result.envelope) {
        G.writeMultiProp(task.item,"envelope_geo",result.envelope);
        if (result.center) {
          G.writeMultiProp(task.item,"envelope_cen_pt",result.center);
        }
        hasEnvelope = true;
      }
    });
    G.forEachNode(task,root,"gmd:referenceSystemInfo/gmd:MD_ReferenceSystem/gmd:referenceSystemIdentifier/gmd:RS_Identifier",function(node){
      var crsId = G.getString(task,node,"gmd:code/*/text()");
      var crsAuth = G.getString(task,node,"gmd:authority/gmd:CI_Citation/gmd:title/*/text()");
      var crsVer = G.getString(task,node,"gmd:version/*/text()");
      if (crsId !== null && crsId.length > 0) {
        var crs = {"id_s": crsId};
        if (crsAuth !== null && crsAuth.length > 0) crs["authority_s"] = crsAuth;
        if (crsVer !== null && crsVer.length > 0) crs["version_s"] = crsVer;
        item["apiso_CRS"] = crs;
      }
    });
    G.evalProps(task,item,root,"apiso_GeographicDescriptionCode_s","//gmd:EX_Extent/gmd:geographicElement/gmd:EX_GeographicDescription/gmd:geographicIdentifier/gmd:MD_Identifier/gmd:code");
    G.evalProp(task,item,root,"apiso_Denominator_i","gmd:identificationInfo/gmd:MD_DataIdentification/gmd:spatialResolution/gmd:MD_Resolution/gmd:equivalentScale/gmd:MD_RepresentativeFraction/gmd:denominator/gco:Integer");
    G.evalProp(task,item,root,"apiso_DistanceValue_d","gmd:identificationInfo/gmd:MD_DataIdentification/gmd:spatialResolution/gmd:MD_Resolution/gmd:distance/gco:Distance");
    G.evalProp(task,item,root,"apiso_DistanceUOM_s","gmd:identificationInfo/gmd:MD_DataIdentification/gmd:spatialResolution/gmd:MD_Resolution/gmd:distance/gco:Distance/@uom");
    
    if (task.parseGml) {
      var geojsons = {};
      G.forEachNode(task,root,"//gmd:EX_Extent/gmd:geographicElement/gmd:EX_BoundingPolygon",function(gmdPolygonNode) {
        var geojson = GML.toGeoJson(task, gmdPolygonNode);
        if (geojson) {
          if (!geojsons[geojson.type]) {
            geojsons[geojson.type] = [];
          }
          geojsons[geojson.type].push(geojson);
        }
      });
      
      Object.keys(geojsons).forEach(function(key, kidx){
        if (kidx==0) {
          geojsons[key].forEach(function(g, idx) {
            if (idx==0) {
              G.writeProp(task.item, "shape_geo", g );
            }
          });
        }
      });
      
      if (!hasEnvelope && task.bbox) {
        var result = G.makeEnvelope(task.bbox[0][0],task.bbox[0][1],task.bbox[1][0],task.bbox[1][1]);
        java.lang.System.out.println(JSON.stringify(result));
        if (result && result.envelope) {
          G.writeMultiProp(task.item,"envelope_geo",result.envelope);
          if (result.center) {
            G.writeMultiProp(task.item,"envelope_cen_pt",result.center);
          }
          hasEnvelope = true;
        }
      }
    }
  },

  evalTemporal: function(task) {
    var item = task.item, root = task.root;
    G.forEachNode(task,root,"//gmd:EX_TemporalExtent/gmd:extent",function(node){
      var params = null;
      if (G.hasNode(task,node,"gml:TimeInstant/gml:timePosition")) {
        params = {
          instant: {
            date: G.getString(task,node,"gml:TimeInstant/gml:timePosition"),
            indeterminate: G.getString(task,node,"gml:TimeInstant/gml:timePosition/@indeterminatePosition")
          }
        };       
      } else if (G.hasNode(task,node,"gml:TimePeriod/gml:beginPosition")) {
        params = {
          begin: {
            date: G.getString(task,node,"gml:TimePeriod/gml:beginPosition"),
            indeterminate: G.getString(task,node,"gml:TimePeriod/gml:beginPosition/@indeterminatePosition")
          },
          end: {
            date: G.getString(task,node,"gml:TimePeriod/gml:endPosition"),
            indeterminate: G.getString(task,node,"gml:TimePeriod/gml:endPosition/@indeterminatePosition")
          } 
        };       
      } else if (G.hasNode(task,node,"gml:TimePeriod/gml:begin")) {
        params = {
          begin: {
            date: G.getString(task,node,"gml:TimePeriod/gml:begin/gml:TimeInstant/gml:timePosition"),
            indeterminate: G.getString(task,node,"gml:TimePeriod/gml:begin/gml:TimeInstant/gml:timePosition/@indeterminatePosition")
          },
          end: {
            date: G.getString(task,node,"gml:TimePeriod/gml:end/gml:TimeInstant/gml:timePosition"),
            indeterminate: G.getString(task,node,"gml:TimePeriod/gml:end/gml:TimeInstant/gml:timePosition/@indeterminatePosition")
          } 
        };

      } else if (G.hasNode(task,node,"gml32:TimeInstant/gml32:timePosition")) {  
        params = {
          instant: {
            date: G.getString(task,node,"gml32:TimeInstant/gml32:timePosition"),
            indeterminate: G.getString(task,node,"gml32:TimeInstant/gml32:timePosition/@indeterminatePosition")
          }
        };       
      } else if (G.hasNode(task,node,"gml32:TimePeriod/gml32:beginPosition")) {
        params = {
          begin: {
            date: G.getString(task,node,"gml32:TimePeriod/gml32:beginPosition"),
            indeterminate: G.getString(task,node,"gml32:TimePeriod/gml32:beginPosition/@indeterminatePosition")
          },
          end: {
            date: G.getString(task,node,"gml32:TimePeriod/gml32:endPosition"),
            indeterminate: G.getString(task,node,"gml32:TimePeriod/gml32:endPosition/@indeterminatePosition")
          } 
        };      
      } else if (G.hasNode(task,node,"gml32:TimePeriod/gml32:begin")) {
        params = {
          begin: {
            date: G.getString(task,node,"gml32:TimePeriod/gml32:begin/gml32:TimeInstant/gml32:timePosition"),
            indeterminate: G.getString(task,node,"gml32:TimePeriod/gml32:begin/gml32:TimeInstant/gml32:timePosition/@indeterminatePosition")
          },
          end: {
            date: G.getString(task,node,"gml32:TimePeriod/gml32:end/gml32:TimeInstant/gml32:timePosition"),
            indeterminate: G.getString(task,node,"gml32:TimePeriod/gml32:end/gml32:TimeInstant/gml32:timePosition/@indeterminatePosition")
          } 
        };
      }

      if (params) G.analyzeTimePeriod(task,params);
    }); 
  },
  
  evalLinks: function(task) {
    var item = task.item, root = task.root;
    G.evalProp(task,item,root,"url_thumbnail_s","gmd:identificationInfo/gmd:MD_DataIdentification/gmd:graphicOverview/gmd:MD_BrowseGraphic/gmd:fileName/gco:CharacterString");
    G.evalProp(task,item,root,"url_website_s","gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:citedResponsibleParty[1]/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:onlineResource/gmd:CI_OnlineResource/gmd:linkage/gmd:URL");
    G.evalProp(task,item,root,"url_project_metadata_s","gmd:distributionInfo/gmd:MD_Distribution/gmd:distributor/gmd:MD_Distributor/gmd:distributorTransferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource[contains(gmd:name/gco:CharacterString,'Project Metadata')]/gmd:linkage/gmd:URL");
    G.evalProp(task,item,root,"url_granule_s","gmd:distributionInfo/gmd:MD_Distribution/gmd:distributor/gmd:MD_Distributor/gmd:distributorTransferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource[contains(gmd:name/gco:CharacterString,'Granule Search')]/gmd:linkage/gmd:URL");
    G.evalProp(task,item,root,"url_http_download_s","gmd:distributionInfo/gmd:MD_Distribution/gmd:distributor/gmd:MD_Distributor/gmd:distributorTransferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource/gmd:linkage/gmd:URL | gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource[not(contains(gmd:protocol/gco:CharacterString,'FTP'))]/gmd:linkage/gmd:URL");
    G.evalProp(task,item,root,"url_ftp_download_s","gmd:distributionInfo/gmd:MD_Distribution/gmd:distributor/gmd:MD_Distributor/gmd:distributorTransferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource[contains(gmd:protocol/gco:CharacterString,'FTP')]/gmd:linkage/gmd:URL | gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource[contains(gmd:protocol/gco:CharacterString,'FTP')]/gmd:linkage/gmd:URL");
  }

};
