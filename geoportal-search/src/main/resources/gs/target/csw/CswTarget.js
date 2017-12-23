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

(function(){
  
  gs.target.csw.CswTarget = gs.Object.create(gs.target.Target, {
    
    // http://docs.opengeospatial.org/is/12-176r7/12-176r7.html
    
    cswVersion: {writable: true, value: "3.0.0"},
    
    elementSetName: {writable: true, value: "summary"},
    
    getCapabilitiesUrl: {writable: true, value: null},
    
    getRecordByIdUrl: {writable: true, value: null},
    
    getRecordsUrl: {writable: true, value: null},
    
    qClauseName: "PropertyIsLike",
    
    qPropertyName: "AnyText",
    
    requiredFilter: {writable: true, value: null},
    
    resultType: {writable: true, value: "RESULTS"},
    
    targetRequest: {writable: true, value: null},
    
    
    /* ............................................................................................ */
    
    appendPropertyClause: {value:function(task,targetRequest,type,property,literal) {
      // TODO use fieldAliases
      if (typeof property === "string" && property.length > 0 &&
          typeof literal === "string" && literal.length > 0) {
        var uris = targetRequest.uris;
        var xmlBuilder = targetRequest.xmlBuilder;
        var propertyTag = "ValueReference";
        if (this.cswVersion === "2.0.2") {
          propertyTag = "PropertyName";
        }
        xmlBuilder.writeStartElement(uris.fes,type);
        if (type === "PropertyIsLike") {
          xmlBuilder.writeAttribute("wildcard","*");
          xmlBuilder.writeAttribute("singleChar","?");
          xmlBuilder.writeAttribute("escapeChar","\\");
        }
        xmlBuilder.writeElement(uris.fes,propertyTag,property);
        xmlBuilder.writeElement(uris.fes,"Literal",literal);
        xmlBuilder.writeEndElement();
      }
    }},
    
    appendQ: {value:function(urlParams,q) {
      if (typeof q === "string" && q.length > 0) {
        if (typeof urlParams.q === "string" && urlParams.q.length > 0) {
          urlParams.q = "("+urlParams.q+") AND ("+q+")";
        } else {
          urlParams.q = q;
        }
      }
    }},
    
    buildGetRecordsUrl: {value:function(task,targetRequest) {
      // CSW3
      var urlParams = targetRequest.urlParams = {};
      urlParams["elementSetName"] = this.elementSetName;
      //urlParams["resultType"] = this.resultType;
      this.preparePaging(task,targetRequest);
      this.prepareRequiredFilter(task,targetRequest);
      this.prepareQ(task,targetRequest);
      this.prepareFilter(task,targetRequest);
      this.prepareIds(task,targetRequest);
      this.prepareTypes(task,targetRequest);
      this.prepareModifiedPeriod(task,targetRequest);
      this.prepareTimePeriod(task,targetRequest);
      this.prepareBBox(task,targetRequest);
      this.prepareOther(task,targetRequest);

      targetRequest.urlParams = null;
      for (var k in urlParams) {
        if (urlParams.hasOwnProperty(k)) {
          targetRequest.urlParams = urlParams;
          break;
        }
      }
    }},
    
    buildGetRecordsXml: {value:function(task,targetRequest) {
      var uris = targetRequest.uris = {};
      if (this.cswVersion === "2.0.2") {
        uris.csw = task.uris.URI_CSW2;
        uris.ows = task.uris.URI_OWS;
        uris.fes = task.uris.URI_OGC;
        uris.gml = task.uris.URI_GML;
      } else {
        uris.csw = task.uris.URI_CSW3;
        uris.ows = task.uris.URI_OWS2;
        uris.fes = task.uris.URI_FES2;
        uris.gml = task.uris.URI_GML32;
      }
      uris.dc = task.uris.URI_DC;
      uris.dct = task.uris.URI_DCT;
 
      var xmlBuilder = targetRequest.xmlBuilder = this.newXmlBuilder(task);
      xmlBuilder.writeStartDocument();
      xmlBuilder.writeStartElementPfx("csw","GetRecords",uris.csw);
      xmlBuilder.writeNamespace("csw",uris.csw);
      xmlBuilder.writeNamespace("fes",uris.fes);
      xmlBuilder.writeNamespace("gml",uris.gml);
      xmlBuilder.writeAttribute("service","CSW");
      xmlBuilder.writeAttribute("version",this.cswVersion); // TODO do we need this?
      xmlBuilder.writeAttribute("resultType",this.resultType);
      if (this.cswVersion === "2.0.2") {
        xmlBuilder.writeAttribute("outputFormat","application/xml");
        xmlBuilder.writeAttribute("outputSchema",uris.csw);
      } else {
        // TODO Switch to Atom for CSW3?
        xmlBuilder.writeAttribute("outputFormat","application/xml");
        xmlBuilder.writeAttribute("outputSchema",uris.csw);
      }
      this.preparePaging(task,targetRequest);
      xmlBuilder.writeStartElement(uris.csw,"Query");
      xmlBuilder.writeElement(uris.csw,"ElementSetName",this.elementSetName);
      xmlBuilder.writeStartElement(uris.csw,"Constraint");
      xmlBuilder.writeAttribute("version","1.1.0");
      xmlBuilder.writeStartElement(uris.fes,"Filter");
      xmlBuilder.writeStartElement(uris.fes,"And");
      
      this.prepareRequiredFilter(task,targetRequest);
      this.prepareQ(task,targetRequest);
      this.prepareFilter(task,targetRequest);
      this.prepareIds(task,targetRequest);
      this.prepareTypes(task,targetRequest);
      this.prepareModifiedPeriod(task,targetRequest);
      this.prepareTimePeriod(task,targetRequest);
      this.prepareBBox(task,targetRequest);
      this.prepareOther(task,targetRequest);
      
      xmlBuilder.writeEndElement(); // And
      xmlBuilder.writeEndElement(); // Filter
      xmlBuilder.writeEndElement(); // Constraint
      this.prepareSort(task,targetRequest);
      xmlBuilder.writeEndElement(); // Query
      xmlBuilder.writeEndElement(); // GetRecords
      xmlBuilder.writeEndDocument();
      targetRequest.getRecordsXml = xmlBuilder.getXml();
    }},
    
    handleGetRecordsResponse: {value:function(task,response,searchResult) {
      var msg, xmlInfo;
      try {
        xmlInfo = this.newXmlInfo(task,response);
      } catch(ex) {
        msg = "CswTarget: GetRecords returned an invalid XML";
        console.log(msg,"\r\n",response); 
        throw ex;
      }
      if (!xmlInfo || !xmlInfo.root) return;
      var rootInfo = xmlInfo.getNodeInfo(xmlInfo.root);
      if (rootInfo.localName === "ExceptionReport") {
        msg = "CswTarget: GetRecords returned an ExceptionReport";
        console.log(msg,"\r\n",response);
        throw new Error(msg);
      }
      searchResult.items = [];
      xmlInfo.forEachChild(xmlInfo.root,function(result){
        if (result.localName === "SearchResults") {
          xmlInfo.forEachAttribute(result.node,function(attr){
            if (attr.localName === "numberOfRecordsMatched") {
              searchResult.totalHits = task.val.strToInt(attr.nodeText,0);
            }
          });
          xmlInfo.forEachChild(result.node,function(recordInfo){
            if (recordInfo.localName === "BriefRecord" || 
                recordInfo.localName === "SummaryRecord" ||
                recordInfo.localName === "Record") {
              searchResult.items.push({
                xmlInfo: xmlInfo,
                recordInfo: recordInfo
              });
            }
          });
        }
      });
    }},
    
    getSchemaClass: {value:function() {
      return gs.target.csw.CswSchema;
    }},
    
    newXmlBuilder: {value:function(task) {
      return task.context.newXmlBuilder(task);
    }},
    
    newXmlInfo: {value:function(task,xmlString) {
      return task.context.newXmlInfo(task,xmlString);
    }},
    
    prepare: {value:function(task) {
      if (!this.schema) {
        this.schema = this.newSchema(task);
      }
      var targetRequest = this.targetRequest = {
        getRecordsXml: null,
        uris: null,
        urlParams: null,
        xmlBuilder: null
      };
      if (this.cswVersion === "2.0.2") {
        this.buildGetRecordsXml(task,targetRequest);
      } else {
        this.buildGetRecordsUrl(task,targetRequest);
      }
    }},
    
    prepareBBox: {value:function(task,targetRequest) {
    }},
    
    prepareFilter: {value:function(task,targetRequest) {
      var urlParams = targetRequest.urlParams;
      var xmlBuilder = targetRequest.xmlBuilder;
      var v = task.request.getFilter();
      if (urlParams) this.appendQ(urlParams,v);
      if (xmlBuilder) {
        var t = this.qClauseName;
        var p = this.qPropertyName;
        this.appendPropertyClause(task,targetRequest,t,p,v);
      }
    }},
    
    prepareIds: {value:function(task,targetRequest) {
    }},
    
    prepareModifiedPeriod: {value:function(task,targetRequest) {
    }},

    prepareOther: {value:function(task,targetRequest) {
    }},
    
    preparePaging: {value:function(task,targetRequest) {
      var urlParams = targetRequest.urlParams;
      var xmlBuilder = targetRequest.xmlBuilder;
      var start = task.request.getStart();
      start = task.val.strToInt(start,null);
      if (typeof start === "number" && task.request.queryIsZeroBased) start = start + 1;
      if (typeof start === "number" && start >= 1) {
        if (urlParams) urlParams["startPosition"] = start;
        if (xmlBuilder) xmlBuilder.writeAttribute("startPosition",""+start);
      }
      var num = task.request.getNum();
      num = task.val.strToInt(num,null);
      if (typeof num === "number" && num > 0) {
        if (urlParams) urlParams["maxRecords"] = num;
        if (xmlBuilder) xmlBuilder.writeAttribute("maxRecords",""+num);
      } 
    }},
    
    prepareQ: {value:function(task,targetRequest) {
      var urlParams = targetRequest.urlParams;
      var xmlBuilder = targetRequest.xmlBuilder;
      var v = task.request.getQ();
      if (urlParams) this.appendQ(urlParams,v);
      if (xmlBuilder) {
        var t = this.qClauseName;
        var p = this.qPropertyName;
        this.appendPropertyClause(task,targetRequest,t,p,v);
      }
    }},
    
    prepareRequiredFilter: {value:function(task,targetRequest) {
    }},
    
    prepareSort: {value:function(task,targetRequest) {
    }},
    
    prepareTimePeriod: {value:function(task,targetRequest) {
    }},
    
    prepareTypes: {value:function(task,targetRequest) {
    }},
    
    search: {value:function(task) {
      var self = this, data = null;
      var url = this.getRecordsUrl;
      
      var dataContentType = "application/xml";
      if (this.targetRequest && this.targetRequest.getRecordsXml) {
        data = this.targetRequest.getRecordsXml;
      } else if (this.targetRequest && this.targetRequest.urlParams) {
        var qstr = this.urlParamsToQueryString(this.targetRequest.urlParams);
        if (qstr !== null && qstr.length > 0) {
          if (url.indexOf("?") === -1) url += "?" + qstr;
          else url += "&" + qstr;
        }
      }
      if (task.verbose) console.log("sending url:",url,"data:",data);
      
      var promise = task.context.newPromise();
      var p2 = task.context.sendHttpRequest(task,url,data,dataContentType);
      p2.then(function(response){
        //if (task.verbose) console.log("GetRecordsResponse:\r\n",response);
        console.log("GetRecordsResponse:\r\n",response);
        try {
          var searchResult = gs.Object.create(gs.base.SearchResult).init(task);
          self.handleGetRecordsResponse(task,response,searchResult);
          if (task.verbose) console.log("totalHits=",searchResult.totalHits);
          promise.resolve(searchResult);
        } catch(ex) {
          promise.reject(ex);
        }
      })["catch"](function(error){
        promise.reject(error);
      });
      return promise;
    }}
  
  });

}());

