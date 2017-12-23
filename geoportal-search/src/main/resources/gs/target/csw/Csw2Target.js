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
  
  gs.target.csw.Csw2Target = gs.Object.create(gs.target.Target, {
    
    isCsw2: {writable: true, value: true},
    
    itemBaseUrl: {writable: true, value: null},
      
    requiredFilter: {writable: true, value: null},
    
    searchCriteria: {writable: true, value: null},
    
    getCapabilitiesUrl: {writable: true, value: null},
    
    getRecordByIdUrl: {writable: true, value: null},
    
    getRecordsUrl: {writable: true, value: null},
    
    schema: {writable: true, value: null},
    
    schemaMixin: {writable: true, value: null},
    
    getNamespaceMap: {value:function() {
      var nsmap = {
        "csw": task.uris.CSW2,
        "ows": task.uris.URI_OWS,
        "gml": task.uris.URI_GML,
        "gml32": task.uris.URI_GML32
      };
      return nsmap;
    }},
    
    getSchemaClass: {value:function() {
      return gs.target.csw.Csw2Schema;
    }},
    
    newXmlDoc: {value:function(xmlString) {
      
    }},
    
//    itemToAtomEntry: {value: function(task,item) {
//      return item.atomEntry;
//    }},
//    
//    newSchema: {value:function(task) {
//      var schemaMixin = this.schemaMixin || {};
//      schemaMixin.target = this;
//      return gs.Object.create(gs.target.csw.Csw2Schema).mixin(schemaMixin);
//    }},
    
    parseRequest: {value:function(task) {
      if (!this.schema) {
        this.schema = this.newSchema(task);
      }
    }},

    parseBBox: {value:function(task,searchCriteria) {
    }},
    
    parseId: {value:function(task,searchCriteria) {
    }},
    
    parsePeriod: {value:function(task,searchCriteria) {
    }},
    
    parseSort: {value:function(task,searchCriteria,musts) {
    }},
    
    parseTypes: {value:function(task,searchCriteria,musts) {
    }},
    
    search: {value:function(task) {
      var self = this, data = null;
      var url = this.getRecordsUrl;
      url += "&resultType=RESULTS";
      url += "&elementSetName=summary";
      var dataContentType = "application/xml";
      if (this.searchCriteria) {
        //data = JSON.stringify(this.searchCriteria);
        //if (task.verbose) console.log(data);
      }
      if (task.verbose) console.log("sending url:",url,"data:",data);
      console.log("sending url:",url);
      
      var nsmap = this.getNamespaceMap();
      var promise = task.context.newPromise();
      var p2 = task.context.sendHttpRequest(task,url,data,dataContentType);
      p2.then(function(result){
        //console.log("GetRecordsResponse:\r\n",result);
        try {
          var searchResult = gs.Object.create(gs.base.SearchResult).init(task);
          var msg, xmlInfo;
          try {
            xmlInfo = task.context.newXmlInfo(task,result,nsmap);
          } catch(ex) {
            // TODO how to handle?
            //msg = "Error parsing GetRecords response xml:";
            //if (ex && ex.message) msg += ex.message;
            console.log("Error parsing GetRecords response xml:",ex);
            throw ex;
          }
          self.handleGetRecordsResponse(task,searchResult,xmlInfo);
          if (task.verbose) console.log("totalHits=",searchResult.totalHits);
          promise.resolve(searchResult);
        } catch(ex) {
          promise.reject(ex);
        }
      })["catch"](function(error){
        promise.reject(error);
      });
      return promise;
    }},
    
    handleGetRecordsResponse: {value:function(task,searchResult,xmlInfo) {
      if (!xmlInfo) return; // TODO how to handle?
      if (!xmlInfo.root || !xmlInfo.xpathEvaluator) return; // TODO how to handle?
      var root = xmlInfo.root;
      var xmlDoc = xmlInfo.xpathEvaluator;
      var self = this, item;
      
      // TODO check for OWS exception report
      searchResult.items = [];
      xmlDoc.forEachChild(root,function(result){
        if (result.nodeInfo.localName === "SearchResults") {
          // get attributes nextRecord="11" numberOfRecordsMatched="42596" numberOfRecordsReturned="10" 
          // elementSet="summary" recordSchema="http://www.opengis.net/cat/csw/2.0.2"
          xmlDoc.forEachAttribute(result.node,function(attr){
            if (attr.nodeInfo.localName === "numberOfRecordsMatched") {
              searchResult.totalHits = task.val.strToInt(attr.nodeText,0);
            }
          });
          xmlDoc.forEachChild(result.node,function(record){
            if (record.nodeInfo.localName === "BriefRecord" || 
                record.nodeInfo.localName === "SummaryRecord" ||
                record.nodeInfo.localName === "Record") {
              item = {
                xmlInfo: xmlInfo,
                recordInfo: record.nodeInfo
              }
              searchResult.items.push(item);
            }
          });
        }
      });
    }}
  
  });

}());

