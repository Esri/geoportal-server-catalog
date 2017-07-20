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
      var schema =  gs.Object.create(gs.target.portal.PortalSchema);
      schema.portalBaseUrl = this.portalBaseUrl;
      return schema;
    }},
    
    parseRequest: {value:function(task) {
      if (!this.schema) {
        this.schema = this.newSchema(task);
      }
      var urlParams = {"f": "json"};
      var qAll = "modified:[0000000000000000000 TO 9999999999999999999]";
      
      // TODO filter= time= sorting dates
      
      var sortField = task.request.chkParam("sortField");
      var sortOrder = task.request.chkParam("sortOrder"); // asc/desc
      
      var q = task.request.chkParam("q");
      if (q === "*" || q === "*:*") q = qAll;
      
      var orgid = task.request.chkParam("orgid");
      if (typeof orgid === "string" && orgid.length > 0) {
        if (orgid.indexOf("orgid:") !== 0) {
          orgid = "orgid:"+orgid;
        }
      }  
      
      this.appendQ(urlParams,q);
      this.appendQ(urlParams,orgid);
      this.appendQ(urlParams,task.request.chkParam("filter"));
      this.appendQ(urlParams,this.requiredFilter);
      this.parseRequestId(task,urlParams);
      this.parseRequestTimePeriod(task,urlParams);
      
      // TODO from / size
      var from = task.request.getFrom();
      from = task.val.strToInt(from,null);
      if (typeof from === "number" && task.request.queryIsZeroBased) from = from + 1;
      if (typeof from === "number" && from >= 1) {
        urlParams["start"] = from;
      }
      var size = task.request.getSize();
      size = task.val.strToInt(size,null);
      if (typeof size === "number" && size > 0) {
        urlParams["num"] = size;
      } 
      
      var bbox = task.request.chkParam("bbox");
      if (typeof bbox === "string" && bbox.length > 0) {
        urlParams["bbox"] = bbox;
      } else if (typeof urlParams.q !== "string" || urlParams.q.length === 0) {
        urlParams.q = qAll;
      }
      
      
      // TODO sort is target specific?? sort by title, owner, date??
      if (typeof sortField === "string" && sortField.length > 0) {
        urlParams["sortField"] = sortField;
      }
      if (typeof sortOrder === "string" && sortOrder.length > 0) {
        urlParams["sortOrder"] = sortOrder;
      }
      
      for (var k in urlParams) {
        if (urlParams.hasOwnProperty(k)) {
          this.urlParams = urlParams;
          break;
        }
      }
      
    }},
    
    parseRequestId: {value:function(task,urlParams) {
      var q = "", ids = task.request.getIds();
      if (Array.isArray(ids) && ids.length > 0) {
        ids.forEach(function(id){
          if (q.length > 0) q += " OR ";
          q += "id:"+id;
        });
      }
      this.appendQ(urlParams,q);
    }},
    
    parseRequestTimePeriod: {value:function(task,urlParams) {
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
      
      var timePeriod = task.request.getTimePeriod();
      var from = timePeriod.from, to = timePeriod.to;
      if (from !== null || to !== null) {
        from = makeVal(from,true);
        to = makeVal(to,false);
        this.appendQ(urlParams,"modified:["+from+" TO "+to+"]");
      }
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
        if (task.verbose) console.log("portal search params",qstr);
      }
      
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
