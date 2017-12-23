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
    
    itemBaseUrl: {writable: true, value: null},
    
    searchUrl: {writable: true, value: null},
    
    useSimpleQueryString: {writable: true, value: false}, // TODO?
    
    
    _searchCriteria: {writable: true, value: null},
    
    /* ............................................................................................ */
    
    getSchemaClass: {value:function() {
      return gs.target.elastic.ElasticSchema;
    }},
    
    prepare: {value:function(task) {
      if (!this.schema) {
        this.schema = this.newSchema(task);
      }
      var targetRequest = {
        musts: [],
        qAll: "*:*",
        searchCriteria: {},
        useSimpleQueryString: this.useSimpleQueryString
      };
      
      this.prepareRequiredFilter(task,targetRequest);
      this.prepareQ(task,targetRequest);
      this.prepareFilter(task,targetRequest);
      this.prepareIds(task,targetRequest);
      this.prepareTypes(task,targetRequest);
      this.prepareModifiedPeriod(task,targetRequest);
      this.prepareTimePeriod(task,targetRequest);
      this.prepareBBox(task,targetRequest);
      this.preparePaging(task,targetRequest);
      this.prepareSort(task,targetRequest);
      this.prepareOther(task,targetRequest);
      
      // api 5.1 ["q","from","size","sort","df","analyzer","analyze_wildcard",
      //          "default_operator","lenient", "timeout","terminate_after",
      //          "search_type","_source","stored_fields","track_scores","explain"];
      
      var searchCriteria = targetRequest.searchCriteria;
      if (targetRequest.musts.length > 0) {
        searchCriteria["query"] = {"bool":{"must": targetRequest.musts}};
      }
      for (var k in searchCriteria) {
        if (searchCriteria.hasOwnProperty(k)) {
          this._searchCriteria = searchCriteria;
          break;
        }
      }
    }},
    
    prepareBBox: {value:function(task,targetRequest) {
      var spatialInfo = this.schema.spatialInfo;
      if (!spatialInfo) return;
      
      var field = spatialInfo.field;
      var relation = "intersects";
      var hasField = (typeof field === "string" && field.length > 0);
      
      var coords = null, query = null, field, rel;
      var bbox = task.request.getBBox();
      if (typeof bbox === "string" && bbox.length > 0) {
        coords = bbox.split(","); 
      }
  
      if (hasField && Array.isArray(coords) && coords.length > 3) {
        if (spatialInfo.type === "geo_shape") {
          rel = task.request.getSpatialRel();
          if (typeof rel === "string" && rel.length > 0) {
            rel = rel.toLowerCase();
            if (rel === "intersects" || rel === "within" || 
                rel === "contains" || rel === "disjoint") {
              relation = rel;
            }
          }          
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
      
      if (query !== null) targetRequest.musts.push(query);
    }},
    
    prepareFilter: {value:function(task,targetRequest) {
      // TODO array?
      var filter = task.request.getFilter();
      if (typeof filter === "string" && filter.length > 0) {
        musts.push({"query_string": {
          "analyze_wildcard": true,
          "query": filter
        }});
      }
    }},
    
    prepareIds: {value:function(task,targetRequest) {
      var ids = task.request.getIds();
      if (Array.isArray(ids) && ids.length > 0) {
        targetRequest.musts.push({"terms":{"_id":ids}});
      }
    }},
    
    prepareModifiedPeriod: {value:function(task,targetRequest) {
      var period = task.request.getModifiedPeriod();
      var periodInfo = this.schema.modifiedPeriodInfo;
      this._preparePeriod(task,targetRequest,period,periodInfo);
    }},
    
    prepareOther: {value:function(task,targetRequest) {
    }},
    
    preparePaging: {value:function(task,targetRequest) {
      var start = task.request.getStart();
      start = task.val.strToInt(start,null);
      if (typeof start === "number" && !task.request.queryIsZeroBased) start = start - 1;
      if (typeof start === "number" && start >= 0) {
        targetRequest.searchCriteria["from"] = start;
      }    
      var num = task.request.getNum();
      num = task.val.strToInt(num,null);
      if (typeof num === "number" && num >= 0) {
        targetRequest.searchCriteria["size"] = num;
      }
    }},
    
    prepareQ: {value:function(task,targetRequest) {
      var q = task.request.getQ();
      if (typeof q === "string" && q.length > 0) {
        var analyze_wildcard = task.request.chkBoolParam("analyze_wildcard",false);
        var lenient = task.request.chkBoolParam("lenient",false);
        if (targetRequest.useSimpleQueryString) {
          targetRequest.musts.push({"simple_query_string": {
            "analyze_wildcard": analyze_wildcard,
            "lenient": lenient,
            "query": q
          }});
        } else {
          targetRequest.musts.push({"query_string": {
            "analyze_wildcard": analyze_wildcard,
            "lenient": lenient,
            "query": q
          }});
        }
      }
    }},
    
    prepareRequiredFilter: {value:function(task,targetRequest) {
      // TODO array?
      var requiredFilter = this.requiredFilter;
      if (typeof requiredFilter === "string" && requiredFilter.length > 0) {
        musts.push({"query_string": {
          "analyze_wildcard": true,
          "query": requiredFilter
        }});
      }
    }},
    
    prepareSort: {value:function(task,targetRequest) {
      var sortables = this.schema.sortables;
      if (!sortables) return;
      
      var getField = function(v) {
        v = v.toLowerCase();
        for (var k in sortables) {
          if (sortables.hasOwnProperty(k)) {
            if (v === k.toLowerCase()) {
              return sortables[k];
            }
          }
        }
        return null;
      };
   
      var sort = [], sortField, sortOrder, sortOption;
      var sortParams = task.request.getSort();
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
      } else {
        sortField = task.request.getSortField();
        sortOrder = task.request.getSortOrder(); // asc/desc
        if (typeof sortField === "string" && sortField.length > 0) {
          sortField = getField(sortField);
        }
        if (typeof sortField === "string" && sortField.length > 0) {
          if (typeof sortOrder === "string" && 
            (sortOrder.trim().toLowerCase() === "asc" || sortOrder.trim().toLowerCase() === "desc")){
            sortOption = {};
            sortOption[sortField] = sortOrder.trim().toLowerCase();
            sort.push(sortOption);
          } else {
            sort.push(sortField);
          }
        }
      }
      if (sort.length > 0) {
        targetRequest.searchCriteria["sort"] = sort;
      }
    }},
    
    prepareTimePeriod: {value:function(task,targetRequest) {
      var period = task.request.getTimePeriod();
      var periodInfo = this.schema.timePeriodInfo;
      this._preparePeriod(task,targetRequest,period,periodInfo);
    }},
    
    prepareTypes: {value:function(task,targetRequest) {
      var shoulds = [], keys = [], query, qNested;
      var schema = this.schema;
      var types = task.request.getTypes();
      var typeInfo = schema.typeInfo;
      if (!typeInfo || !Array.isArray(types) || types.length === 0) return;
      var field = typeInfo.field;
      var nestedPath = typeInfo.nestedPath;
      var hasField = (typeof field === "string" && field.length > 0);
      var isNested = (typeof nestedPath === "string" && nestedPath.length > 0);
      if (!hasField) return;
      var isV5Plus = schema.isVersion5Plus;
      
      var appendType = function(v) {
        var q;
        if (typeof v === "string" && v.length > 0 && keys.indexOf(v) === -1) {
          keys.push(v);
          q = {"bool": {"must": {"term": {}}}};
          q.bool.must.term[field] = v; // TODO escape?
          shoulds.push(q);
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
      
      if (shoulds.length > 0) {
        query = {"bool": {"should": shoulds}};
        if (isNested) {
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
        //console.log("types",JSON.stringify(query));
      }
      
      if (query) targetRequest.musts.push(query);
    }},
    
    /* ............................................................................................ */
    
    search: {value:function(task) {
      var i, data = null, options = null;
      var url = this.searchUrl;
      var dataContentType = "application/json";
      if (this._searchCriteria) {
        data = JSON.stringify(this._searchCriteria);
        if (task.verbose) console.log(data);
      }
      if (typeof this.username === "string" && this.username.length > 0 && 
          typeof this.password === "string" && this.password.length > 0) {
        options = {
          basicCredentials: {
            username: this.username,
            password: this.password
          }
        };
      }
      if (task.verbose || true) console.log("sending url:",url,"data:",data);
      
      var promise = task.context.newPromise();
      var p2 = task.context.sendHttpRequest(task,url,data,dataContentType,options);
      p2.then(function(result){
        //console.log("promise.then",result);
        try {
          var searchResult = gs.Object.create(gs.base.SearchResult).init(task);
          var response = JSON.parse(result);
          searchResult.jsonResponse = response;
          if (response && response.hits) {
            searchResult.totalHits = response.hits.total;
            if (task.verbose || true) console.log("totalHits=",searchResult.totalHits);
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
    }},
    
    /* ............................................................................................ */
    
    _preparePeriod: {value:function(task,targetRequest,period,periodInfo) {
      if (!periodInfo) return;
      
      var isV5Plus = this.schema.isVersion5Plus;
      var fieldsOperator = "must";
      var field = periodInfo.field;
      var toField = periodInfo.toField;
      var nestedPath = periodInfo.nestedPath;
      
      var from = period.from, to = period.to;
      if (from === "*") from = null;
      if (to === "*") to = null;
      var hasValue = (from !== null || to !== null);
  
      var hasField = (typeof field === "string" && field.length > 0);
      var hasToField = (typeof toField === "string" && toField.length > 0);
      var isNested = (typeof nestedPath === "string" && nestedPath.length > 0);
      var query = null, condition = null, qFrom, qTo, qNested;
      
      if (hasValue && hasField) {
          
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
                  "path": nestedPath,
                  "query": {"bool": {"must":[query]}}
                }};
              } else {
                qNested = {"query":{"nested":{
                  "path": nestedPath,
                  "query": {"bool": {"must":[query]}}
                }}};
              }
              query = qNested;
            }
          } 
        }
  
      }
      
      if (query !== null) targetRequest.musts.push(query);
    }}
    
  });

}());

