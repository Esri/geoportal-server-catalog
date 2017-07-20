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
  
  gs.target.elastic.ElasticTarget = gs.Object.create(gs.target.Target, {
      
    requiredFilter: {writable: true, value: null},
    
    searchCriteria: {writable: true, value: null},
    
    searchUrl: {writable: true, value: null},
    
    schema: {writable: true, value: null},
    
    newSchema: {value:function(task) {
      return gs.Object.create(gs.target.elastic.ElasticSchema);
    }},
    
    parseRequest: {value:function(task) {
      if (!this.schema) {
        this.schema = this.newSchema(task);
      }
      
      // q=&id=&from=&size=&bbox=&time=&filter=&pretty=
      
      // TODO pretty bbox time sort
      
      var searchCriteria = {};
      var qAll = "*:*";
      
      var musts = [];
      var useSimpleQueryString = false; // TODO
      
      // TODO all URI search api
      var all = ["q","from","size","sort","df","analyzer","analyze_wildcard","default_operator","lenient",
                 "timeout","terminate_after","search_type","_source","stored_fields","track_scores","explain"];
      
      var from = task.request.getFrom();
      from = task.val.strToInt(from,null);
      if (typeof from === "number" && !this.queryIsZeroBased) from = from - 1;
      if (typeof from === "number" && from >= 0) {
        searchCriteria["from"] = from;
      }    
      var size = task.request.getSize();
      size = task.val.strToInt(size,null);
      if (typeof size === "number" && size >= 0) {
        searchCriteria["size"] = size;
      } 
      
      var q = task.request.chkParam("q");
      if (typeof q === "string" && q.length > 0) {
        var analyze_wildcard = task.request.chkBoolParam("analyze_wildcard",false);
        var lenient = task.request.chkBoolParam("lenient",false);
        if (useSimpleQueryString) {
          musts.push({"simple_query_string": {
            "analyze_wildcard": analyze_wildcard,
            "lenient": lenient,
            "query": q
          }});
        } else {
          musts.push({"query_string": {
            "analyze_wildcard": analyze_wildcard,
            "lenient": lenient,
            "query": q
          }});
        }
      }
      
      var filter = task.request.chkParam("filter");
      if (typeof filter === "string" && filter.length > 0) {
        musts.push({"query_string": {
          "analyze_wildcard": true,
          "query": filter
        }});
      }
      
      var requiredFilter = this.requiredFilter;
      if (typeof requiredFilter === "string" && requiredFilter.length > 0) {
        musts.push({"query_string": {
          "analyze_wildcard": true,
          "query": requiredFilter
        }});
      }
      
      this.parseRequestId(task,searchCriteria,musts);
      this.parseRequestBBox(task,searchCriteria,musts);
      this.parseRequestTimePeriod(task,searchCriteria,musts);
      this.parseRequestSort(task,searchCriteria,musts);
      
      // temporal extent, date queries?
      
      if (musts.length > 0) {
        searchCriteria["query"] = {"bool":{"must":musts}};
      }
      
      for (var k in searchCriteria) {
        if (searchCriteria.hasOwnProperty(k)) {
          this.searchCriteria = searchCriteria;
          break;
        }
      }
      
    }},
    
    parseRequestBBox: {value:function(task,searchCriteria,musts) {
      var spatialInfo = this.schema.spatialInfo;
      if (!spatialInfo) return;
      
      var field = spatialInfo.field;
      var relation = "intersects";  // intersects|within // TODO query parameter?
      var hasField = (typeof field === "string" && field.length > 0);
      
      var coords = null, query = null, field;
      var bbox = task.request.chkParam("bbox");
      if (typeof bbox === "string" && bbox.length > 0) {
        coords = bbox.split(","); 
      }
  
      if (hasField && Array.isArray(coords) && coords.length > 3) {
        if (spatialInfo.type === "geo_shape") {
          query = {"geo_shape":{}};
          query["geo_shape"][field] = {
            "relation": relation,
            "shape": {
              "type": "envelope",
              "coordinates": [[coords[0],coords[3]], [coords[2],coords[1]]]  
            }
          };
        }
        if (spatialInfo.type === "geo_point") {
          query = {"geo_bounding_box": {}};
          query["geo_bounding_box"][field] = {
            "top_left" : {
              "lon" : coords[0],
              "lat" : coords[3]
            },
            "bottom_right" : {
              "lon" : coords[2],
              "lat" : coords[1]
            }
          };
        }
      }
      
      if (query !== null) musts.push(query);
    }},
    
    parseRequestId: {value:function(task,searchCriteria,musts) {
      var ids = task.request.getIds();
      if (Array.isArray(ids) && ids.length > 0) {
        musts.push({"terms":{"_id":ids}});
      }
    }},
    
    parseRequestSort: {value:function(task,searchCriteria,musts) {
      var sortables = this.schema.sortables;
      if (!sortables) return;
      
      var getField = function(v) {
        v = v.toLowerCase();
        for (var k in sortables) {
          if (sortables.hasOwnProperty(k)) {
            if (v === k.toLowerCase()) {
              return sortables[k];
              break;
            }
          }
        }
        return null;
      };
   
      // TODO sort is target specific?? sort by title, owner, date??
      var sort = [], sortField, sortOrder, sortOption;
      var sortParams = task.request.getParameterValues("sort");
      if (sortParams !== null && sortParams.length === 1) {
        sortParams = sortParams[0].split(",");
      }    
      if (sortParams !== null && sortParams.length > 0) {
        sortParams.forEach(function(sortParam){
          var idx = sortParam.lastIndexOf(":");
          if (idx !== -1) {
            sortField = getField(sortParam.substring(0,idx));
            if (typeof sortField === "string" && sortField.length > 0) {
              sortOrder = sortParam.substring(idx + 1);
              sortOption = {};
              if (sortOrder === "desc") sortOption[sortField] = "desc";
              else sortOption[sortField] = "asc";
              sort.push(sortOption);
            }
          } else {
            sortField = getField(sortParam);
            if (typeof sortField === "string" && sortField.length > 0) {
              sort.push(sortField);
            }
          }
        });
      }
      if (sort.length > 0) {
        searchCriteria["sort"] = sort;
      }
    }},
    
    parseRequestTimePeriod: {value:function(task,searchCriteria,musts) {
      var timePeriodInfo = this.schema.timePeriodInfo;
      if (!timePeriodInfo) return;
      
      var isV5Plus = this.schema.isVersion5Plus;
      var fieldsOperator = "must";
      var field = timePeriodInfo.field;
      var toField = timePeriodInfo.toField;
      var nestedPath = timePeriodInfo.nestedPath;
      
      var timePeriod = task.request.getTimePeriod();
      var from = timePeriod.from, to = timePeriod.to;
      if (from === "*") from = null;
      if (to === "*") to = null;
      var hasTime = (from !== null || to !== null);
  
      var hasField = (typeof field === "string" && field.length > 0);
      var hasToField = (typeof toField === "string" && toField.length > 0);
      var isNested = (typeof nestedPath === "string" && nestedPath.length > 0);
      var query = null, condition = null, qFrom, qTo, qNested;
      
      if (hasTime && hasField) {
          
        if (hasToField) {
          if (from !== null) {
            if (to !== null) condition = {"gte":from,"lte":to};
            else condition = {"gte":from};
            qFrom = {"range": {}};
            qFrom.range[field] = condition;
            query = qFrom;
          }
          if (to !== null) {
            condition = {"lte":to};
            if (from != null) condition = {"gte":from,"lte":to};
            else condition = {"lte":to};
            qTo = {"range": {}};
            qTo.range[toField] = condition;
            query = qTo;
          }
          if (from !== null && to !== null) {
            if (fieldsOperator === "must") {
              query = {"bool": {"must":[qFrom,qTo]}};
            } else {
              query = {"bool": {"should":[qFrom,qTo]}};
            }
          }
          if (query && isNested) {
            if (isV5Plus) {
              qNested = {"nested":{
                "path": nestedPath,
                "query": query
              }};
            } else {
              qNested = {"query":{"nested":{
                "path": nestedPath,
                "query": query
              }}};
            }
            query = qNested;
          }  
        }
        
        if (!hasToField) {
          if (from !== null && to !== null) {
            condition = {"gte":from,"lte":to};
          } else if (from !== null) {
            condition = {"gte":from};
          } else if (to !== null) {
            condition = {"lte":to};
          }
          if (condition !== null) {
            query = {"range": {}};
            query.range[field] = condition;
            if (isNested) {
              if (isV5Plus) {
                qNested = {"nested":{
                  "path": this.nestedPath,
                  "query": {"bool": {"must":[query]}}
                }};
              } else {
                qNested = {"query":{"nested":{
                  "path": this.nestedPath,
                  "query": {"bool": {"must":[query]}}
                }}};
              }
              query = qNested;
            }
          } 
        }
  
      }
      
      if (query !== null) musts.push(query);
    }},
      
    search: {value:function(task) {
      var i, data = null;
      var url = this.searchUrl;
      var dataContentType = "application/json";
      if (this.searchCriteria) {
        data = JSON.stringify(this.searchCriteria);
        if (task.verbose) console.log(data);
      }
      
      var promise = task.context.newPromise();
      var p2 = task.context.sendHttpRequest(task,url,data,dataContentType);
      p2.then(function(result){
        //console.log("promise.then",result);
        try {
          var searchResult = gs.Object.create(gs.base.SearchResult).init(task);
          var response = JSON.parse(result);
          searchResult.jsonResponse = response;
          if (response && response.hits) {
            searchResult.totalHits = response.hits.total;
            if (task.verbose) console.log("totalHits=",searchResult.totalHits);
            var hits = response.hits.hits;
            if (Array.isArray(response.hits.hits)) {
              searchResult.items = response.hits.hits;
              if (task.verbose) {
                i = 0;
                response.hits.hits.forEach(function(item){
                  console.log(i,item._source.title,item._id);
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

