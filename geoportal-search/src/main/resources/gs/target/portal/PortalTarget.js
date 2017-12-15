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

  gs.target.portal.PortalTarget = gs.Object.create(gs.target.Target, {
    
    portalBaseUrl: {writable: true, value: "https://www.arcgis.com"}, // TODO
    
    requiredFilter: {writable: true, value: null},
    
    schema: {writable: true, value: null},
    
    urlParams: {writable: true, value: null},
    
  //  __init__: {value:function() {
  //    gs.base.Target.__init__.call(this);
  //    print("PortalTarget::__init__");
  //  }},
    
    appendIds: {value:function(task,urlParams,field,ids) {
      var q = "";
      if (Array.isArray(ids) && ids.length > 0) {
        ids.forEach(function(id){
          if (typeof id === "string" && id.trim().length > 0) {
            if (q.length > 0) q += " OR ";
            q += field+":\""+id.trim()+"\"";
          }
        });
      } else if (typeof ids === "string" && ids.trim().length > 0) {
        q = field+":\""+ids+"\"";
      }
      this.appendQ(urlParams,q);
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
    
    newSchema: {value:function(task) {
      var schema =  gs.Object.create(gs.target.portal.PortalSchema).mixin({
        target: this
      });
      return schema;
    }},
    
    parseRequest: {value:function(task) {
      if (!this.schema) this.schema = this.newSchema(task);
      var urlParams = {"f": "json"};
      var qAll = "modified:[0000000000000000000 TO 9999999999999999999]";
      
      var q = task.request.getQ();
      if (q === "*" || q === "*:*") q = qAll;
      
      this.appendQ(urlParams,q);
      this.appendQ(urlParams,task.request.getFilter());
      this.appendQ(urlParams,this.requiredFilter);
      this.appendIds(task,urlParams,"id",task.request.getIds());
      this.appendIds(task,urlParams,"orgid",task.request.getOrgIds());
      this.appendIds(task,urlParams,"group",task.request.getGroupIds());
      this.parseTypes(task,urlParams);
      this.parsePeriod(task,urlParams);
      this.parseSort(task,urlParams);
      
      var start = task.request.getStart();
      start = task.val.strToInt(start,null);
      if (typeof start === "number" && task.request.queryIsZeroBased) start = start + 1;
      if (typeof start === "number" && start >= 1) {
        urlParams["start"] = start;
      }
      var num = task.request.getNum();
      num = task.val.strToInt(num,null);
      if (typeof num === "number" && num > 0) {
        urlParams["num"] = num;
      } 
      
      this.parseBBox(task,urlParams,qAll); // must be last
      
      for (var k in urlParams) {
        if (urlParams.hasOwnProperty(k)) {
          this.urlParams = urlParams;
          break;
        }
      }
    }},
    
    parseBBox: {value:function(task,urlParams,qAll) {
      var bbox = task.request.getBBox();
      if (typeof bbox === "string" && bbox.length > 0) {
        urlParams["bbox"] = bbox;
      } else if (typeof urlParams.q !== "string" || urlParams.q.length === 0) {
        urlParams.q = qAll;
      }
    }},
    
    parsePeriod: {value:function(task,urlParams) {
      var wildCards = [0000000000000000000,9999999999999999999];
      
      var makeVal = function(value,isFrom) {
        var v = wildCards[0];
        if (!isFrom) v = wildCards[1];
        if (value !== null && value !== "*") {
          // TODO what about millisecond values in the query?
          if (typeof value === "string" && value.length > 0) {
            v = new Date(value).getTime();
            if (!isNaN(v)) {
              v = ""+v;
              while (v.length < 19) v = "0"+v;
              
            }
          }
        }
        return v;
      }
      
      var period = task.request.getTimePeriod();
      if (period.from === null && period.to === null) {
        period = task.request.getModifiedPeriod();
      }
      var from = period.from, to = period.to;
      if (from !== null || to !== null) {
        from = makeVal(from,true);
        to = makeVal(to,false);
        this.appendQ(urlParams,"modified:["+from+" TO "+to+"]");
      }
    }},
    
    parseSort: {value:function(task,urlParams) {
      // TODO sort is target specific?? sort by title, owner, date??
      var sortField, sortOrder;
      
      var sortField, sortOrder;
      var sortParams = task.request.getSort();
      if (sortParams !== null && sortParams.length === 1) {
        var sortParam = sortParams[0];
        var idx = sortParam.lastIndexOf(":");
        if (idx !== -1) {
          sortField = sortParam.substring(0,idx).trim();
          sortOrder = sortParam.substring(idx + 1).trim();
        } else {
        }
      } else {
        sortField = task.request.getSortField();
        sortOrder = task.request.getSortOrder(); // asc/desc
      }
      if (typeof sortField === "string" && sortField.length > 0) {
        sortField = this.schema.translateFieldName(task,sortField);
      }
      if (typeof sortField === "string" && sortField.length > 0) {
        urlParams["sortField"] = sortField;
        if (typeof sortOrder === "string" && sortOrder.trim().toLowerCase() === "desc") {
          urlParams["sortOrder"] = "desc";
        }
        if (typeof sortOrder === "string" && 
          (sortOrder.trim().toLowerCase() === "asc" || sortOrder.trim().toLowerCase() === "desc")) {
          urlParams["sortOrder"] = sortOrder.trim().toLowerCase();
        }
      }
    }},
    
    parseTypes: {value:function(task,urlParams) {
      var q = "", keys = [];
      var schema = this.schema;
      var types = task.request.getTypes();
      if (!Array.isArray(types) || types.length === 0) return;
      
      var appendType = function(v) {
        if (typeof v === "string" && v.length > 0 && keys.indexOf(v) === -1) {
          keys.push(v);
          if (q.length > 0) q += " OR ";
          q += "type:\""+v+"\"";
        }
      };
     
      types.forEach(function(t){
        var t2 = schema.translateTypeName(task,t);
        if (Array.isArray(t2)) {
          t2.forEach(function(t3){
            appendType(t3);
          })
        } else {
          appendType(t2);
        }
      });
      //console.log("parseTypes",q);
      this.appendQ(urlParams,q);
    }},
    
    search: {value:function(task) {
      var i, k, v, qstr = null;
      var url = this.portalBaseUrl+"/sharing/rest/search";
      var data = null, dataContentType = "application/x-www-form-urlencoded";
      var urlParams = this.urlParams;
      if (urlParams) {
        for (k in urlParams) {
          if (urlParams.hasOwnProperty(k)) {
            v = urlParams[k];
            if (typeof v !== "undefined" && v !== null) {
              if (qstr === null) qstr = "";
              if (qstr.length > 0) qstr += "&";
              qstr += encodeURIComponent(k)+"="+encodeURIComponent(urlParams[k]);            
            }
          }
        }
        if (qstr !== null && qstr.length > 0) url += "?" + qstr;
      }
      if (task.verbose) console.log("sending url:",url);
      //console.log("sending url:",url);
      
      var promise = task.context.newPromise();
      var p2 = task.context.sendHttpRequest(task,url,data,dataContentType);
      p2.then(function(result){
        //console.log("promise.then",result);
        try {
          var searchResult = gs.Object.create(gs.base.SearchResult).init(task);
          var response = JSON.parse(result);
          searchResult.jsonResponse = response;
          if (response) {
            if (task.verbose) console.log("hits",response.total,"start",response.start,"num",response.num,"nextStart",response.nextStart);
            searchResult.startIndex = response.start;
            searchResult.totalHits = response.total;
            if (task.request.queryIsZeroBased) {
              searchResult.startIndex = searchResult.startIndex - 1;
            }
            if (searchResult.itemsPerPage > 0) {
              searchResult.itemsPerPage = response.num;
            }
            if (response.results && response.results.push) {
              searchResult.items = response.results;
              if (task.verbose) {
                i = 1;
                searchResult.items.forEach(function(item){
                  console.log(i,item.title,item.id);
                  i++;
                });
              }
            }
          }
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
