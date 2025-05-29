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

G.evaluators.iso19115_3 = {

  version: "iso19115_3.v1",

  evaluate: function(task) {
    this.evalBase(task);
    this.evalService(task);
    this.evalSpatial(task);
    this.evalTemporal(task);
    this.evalLinks(task);
    this.evalTheme(task);
  },

  evalBase: function(task) {
    var item = task.item, root = task.root;
    var iden = G.getNode(task,root,"//mdb:identificationInfo/mri:MD_DataIdentification");

    /* general */
    G.evalProp(task,item,root,"fileid","/mdb:MD_Metadata/mdb:metadataIdentifier/mcc:MD_Identifier/mcc:code/gco3:CharacterString");
    G.evalProp(task,item,root,"title","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:citation/cit:CI_Citation/cit:title/*/text()");
    G.evalProp(task,item,root,"description","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:abstract/gco3:CharacterString");
    G.evalProps(task,item,root,"keywords_s","//mri:MD_TopicCategoryCode | //mri:descriptiveKeywords/mri:MD_Keywords/mri:keyword/gco3:CharacterString");
    G.evalProp(task,item,root,"thumbnail_s","//mcc:MD_BrowseGraphic/mcc:fileName/gco3:CharacterString");
    G.evalProps(task,item,root,"contact_organizations_s","//cit:CI_Responsibility/cit:party/cit:name/*/text()");
    G.evalProps(task,item,root,"contact_people_s","//cit:CI_Responsibility/cit:party/cit:name/*/text()");
    G.evalProps(task,item,root,"metadata_language_s","/mdb:MD_Metadata/mdb:defaultLocale/lan:PT_Locale/lan:language/lan:LanguageCode/@codeListValue");
    
    
    /* links */
    //G.evalProps(task,item,root,"links_s","//gmd:CI_OnlineResource/gmd:linkage/gmd:URL");
    //G.evalProps(task,item,root,"links_s","//gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource/gmd:linkage/gmd:URL | //srv:connectPoint/gmd:CI_OnlineResource/gmd:linkage/gmd:URL"); 
    G.evalProps(task,item,root,"links_s","//mrd:MD_DigitalTransferOptions/mrd:onLine/cit:CI_OnlineResource/cit:linkage/gco3:CharacterString");    

    /* identification */
    G.evalProp(task,item,root,"apiso_Identifier_s","/mdb:MD_Metadata/mdb:metadataIdentifier/mcc:MD_Identifier/mcc:code/gco3:CharacterString");
    //G.evalProp(task,item,root,"apiso_ParentIdentifier_s","gmd:parentIdentifier/*/text()");
    G.evalProp(task,item,root,"apiso_Title_txt","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:citation/cit:CI_Citation/cit:title/gco3:CharacterString");
    //G.evalProps(task,item,iden,"apiso_AlternateTitle_txt","gmd:citation/gmd:CI_Citation/gmd:alternateTitle/*/text()");
    G.evalProp(task,item,root,"apiso_Abstract_txt","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:abstract/gco3:CharacterString");
    G.evalProp(task,item,root,"apiso_BrowseGraphic_s","//mcc:MD_BrowseGraphic/mcc:fileName/gco3:CharacterString");
    G.evalProp(task,item,root,"apiso_OrganizationName_txt","//cit:CI_Responsibility/cit:party/cit:name/*/text()");

    /* subject */
    G.evalProps(task,item,root,"apiso_Subject_txt","//mri:MD_TopicCategoryCode | //mri:descriptiveKeywords/mri:MD_Keywords/mri:keyword/gco3:CharacterString");
    G.evalProps(task,item,root,"apiso_Format_s","/mdb:MD_Metadata/mdb:distributionInfo/mrd:MD_Distribution/mrd:distributionFormat/mrd:MD_Format/mrd:formatSpecificationCitation/cit:CI_Citation/cit:title/gco3:CharacterString");
    G.evalProps(task,item,root,"apiso_TopicCategory_s","//mri:MD_TopicCategoryCode");
    G.evalProps(task,item,root,"apiso_KeywordType_s","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:descriptiveKeywords/mri:MD_Keywords/mri:type/mri:MD_KeywordTypeCode");
    G.evalCode(task,item,root,"apiso_Type_s","/mdb:MD_Metadata/mdb:metadataScope/mdb:MD_MetadataScope/mdb:resourceScope/mcc:MD_ScopeCode/@codeListValue");

    /* dates */
    //  G.evalDate(task, item, root, "apiso_Modified_dt", "gmd:dateStamp/gco3:Date | gmd:dateStamp/gco3:DateTime");
    G.evalDate(task, item, iden, "apiso_CreationDate_dt", "/mdb:MD_Metadata/mdb:dateInfo/cit:CI_Date/cit:date/gco:DateTime[../../cit:dateType/cit:CI_DateTypeCode/@codeListValue='creation'] | gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco3:DateTime[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='creation']");
    G.evalDate(task, item, iden, "apiso_RevisionDate_dt", "/mdb:MD_Metadata/mdb:dateInfo/cit:CI_Date/cit:date/gco:DateTime[../../cit:dateType/cit:CI_DateTypeCode/@codeListValue='revision'] | gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco3:DateTime[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='revision']");
    G.evalDate(task, item, iden, "apiso_PublicationDate_dt", "/mdb:MD_Metadata/mdb:dateInfo/cit:CI_Date/cit:date/gco:DateTime[../../cit:dateType/cit:CI_DateTypeCode/@codeListValue='publication'] | gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco3:DateTime[../../gmd:dateType/gmd:CI_DateTypeCode/@codeListValue='publication']");

    /* language */
    G.evalCode(task,item,root,"apiso_Language_s","/mdb:MD_Metadata/mdb:defaultLocale/lan:PT_Locale/lan:language/lan:LanguageCode/@codeListValue");
    G.evalCode(task,item,iden,"apiso_ResourceLanguage_s","/mdb:MD_Metadata/mdb:defaultLocale/lan:PT_Locale/lan:language/lan:LanguageCode/@codeListValue");

    /* constraints */
    G.evalProps(task,item,root,"apiso_AccessConstraints_s","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:resourceConstraints/mco:MD_Constraints/mco:useLimitation/gco3:CharacterString");
    G.evalProps(task,item,root,"apiso_OtherConstraints_s","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mdb:resourceConstraints/mco:MD_LegalConstraints/mco:otherConstraints/gco3:CharacterString");
    G.evalProps(task,item,root,"apiso_Classification_s","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mdb:resourceConstraints/mco:MD_SecurityConstraints/mco:classification/mco:MD_ClassificationCode/@codeListValue");
    G.writeProp(item,"apiso_HasSecurityConstraints_b",G.hasNode(task,root,"//mco:MD_SecurityConstraints"));
    
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
     * If the source is metadata or, more accurately: a field from within metadata
     * use G.evalProps to read that information and put into 'src_category_cat
     * property (Example 1)
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
  
  evalTheme: function(task) {	
    var item = task.item, root = task.root;    
    G.evalProps(task,item,root,"src_category_cat","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:descriptiveKeywords/mri:MD_Keywords[./mri:thesaurusName/cit:CI_Citation/cit:title/gco3:CharacterString='UN GGIM']/mri:keyword/gco3:CharacterString");
  },

  evalService: function(task) {
    var item = task.item, root = task.root;

    //G.evalProps(task,item,root,"apiso_ServiceType_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:serviceType/gco3:LocalName");
    //G.evalProps(task,item,root,"apiso_ServiceTypeVersion_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:serviceTypeVersion/*/text()");
    //G.evalProps(task,item,root,"apiso_Operation_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:containsOperations/srv:SV_OperationMetadata/srv:operationName/*/text()");
    //G.evalProps(task,item,root,"apiso_OperatesOn_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:operatesOn/@uuidref | //gmd:identificationInfo/srv:SV_ServiceIdentification/srv:operatesOn/@xlink:href");
    //G.evalProps(task,item,root,"apiso_OperatesOnIdentifier_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:coupledResource/srv:SV_CoupledResource/srv:identifier");
    //G.evalProps(task,item,root,"apiso_OperatesOnName_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:coupledResource/srv:SV_CoupledResource/srv:operationName");
    //G.evalProps(task,item,root,"apiso_CouplingType_s","//gmd:identificationInfo/srv:SV_ServiceIdentification/srv:couplingType/srv:SV_CouplingType/@codeListValue");

    G.evalResourceLinks(task,item,root,"//mrd:MD_DigitalTransferOptions/mrd:onLine/cit:CI_OnlineResource/cit:linkage/gco3:CharacterString");
  },

  evalSpatial: function(task) {
    var item = task.item, root = task.root;
    var hasEnvelope = false;
    G.forEachNode(task,root,"/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:extent/gex:EX_Extent/gex:geographicElement/gex:EX_GeographicBoundingBox",function(node){
      var xmin = G.Val.chkDbl(G.getString(task,node,"gex:westBoundLongitude/gco3:Decimal"),null);
      var ymin = G.Val.chkDbl(G.getString(task,node,"gex:southBoundLatitude/gco3:Decimal"),null);
      var xmax = G.Val.chkDbl(G.getString(task,node,"gex:eastBoundLongitude/gco3:Decimal"),null);
      var ymax = G.Val.chkDbl(G.getString(task,node,"gex:northBoundLatitude/gco3:Decimal"),null);
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
    G.forEachNode(task,root,"/mdb:MD_Metadata/mdb:referenceSystemInfo/mrs:MD_ReferenceSystem/mrs:referenceSystemIdentifier/mcc:MD_Identifier",function(node){
      var crsId = G.getString(task,node,"mcc:code/*/text()");
      var crsAuth = G.getString(task,node,"mcc:codeSpace/*/text()");
      var crsVer = G.getString(task,node,"mcc:version/*/text()");
      if (crsId !== null && crsId.length > 0) {
        var crs = {"id_s": crsId};
        if (crsAuth !== null && crsAuth.length > 0) crs["authority_s"] = crsAuth;
        if (crsVer !== null && crsVer.length > 0) crs["version_s"] = crsVer;
        item["apiso_CRS"] = crs;
      }
    });
    G.evalProps(task,item,root,"apiso_GeographicDescriptionCode_s","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:extent/gex:EX_Extent/gex:geographicElement/gex:EX_GeographicBoundingBox/gex:extentTypeCode/gco3:Boolean");
    G.evalProp(task,item,root,"apiso_Denominator_i","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:spatialResolution/mri:MD_Resolution/mri:equivalentScale/mri:MD_RepresentativeFraction/mri:denominator/gco3:Integer");
    G.evalProp(task,item,root,"apiso_DistanceValue_d","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:spatialResolution/mri:MD_Resolution/mri:distance/gco3:Distance");
    G.evalProp(task,item,root,"apiso_DistanceUOM_s","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:spatialResolution/mri:MD_Resolution/mri:distance/gco3:Distance/@uom");
    
    if (task.parseGml) {
      var geojsons = {};
      G.forEachNode(task,root,"/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:extent/gex:EX_Extent/gex:geographicElement/gex:EX_BoundingPolygon",function(gmdPolygonNode) {
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
    G.forEachNode(task,root,"//gex:EX_Extent/gex:temporalElement/gex:EX_TemporalExtent/gex:extent",function(node){
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
    G.evalProp(task,item,root,"url_thumbnail_s","//mcc:MD_BrowseGraphic/mcc:fileName/gco3:CharacterString");
    G.evalProp(task,item,root,"url_website_s","/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:citation/cit:CI_Citation/cit:CI_OnlineResource/cit:linkage/gco3:CharacterString");
  }

};
