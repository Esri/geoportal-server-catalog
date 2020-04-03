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
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/io-query",
        "app/search/SearchComponent",
        "app/etc/util"],
function(declare, lang, array, ioQuery, SearchComponent, Util) {
  
  var oThisClass = declare([SearchComponent], {
    
    queries: [],

    postCreate: function() {
      this.inherited(arguments);
      
      var self = this, uri = window.location.href;
      if (uri.indexOf("?") !== -1) {
          var s = uri.substring(uri.indexOf("?")+1,uri.length);
          var hash = s.indexOf("#")>=0? s.substring(s.indexOf("#")+1,s.length): "";
          s= s.indexOf("#")>=0? s.substring(0,s.indexOf("#")): s;
        var o = ioQuery.queryToObject(s);
        if (o && typeof o.filter === "string") {
          this._addQuery(o.filter);
        } else if (o && lang.isArray(o.filter)) {
          array.forEach(o.filter,function(v){
            self._addQuery(v);
          });
        }
        if (o && typeof o.fileid === "string")
        {
            this._addFileIdQuery(o.fileid);
        }
      }
    },

      _addQuery: function(v) {
          if (typeof v === "string") {
              v = lang.trim(v);
              v = AppContext.appConfig.search && !!AppContext.appConfig.search.escapeFilter? Util.escapeForLucene(v): v;

              if (v.length > 0) {
                  this.queries.push({"query_string": {
                          "analyze_wildcard": true,
                          "query": v
                      }});
              }
          }
      },
      _addFileIdQuery: function(v) {
          if (typeof v === "string") {
              v = Util.escapeForLucene(lang.trim(v));

              if (v.length > 0) {
                  this.queries.push({"query_string": {
                          "default_field": "fileid",
                          "query": v
                      }});
              }
          }
      },
    
    /* SearchComponent API ============================================= */
    
    appendQueryParams: function(params) {
      var esdslParam = Util.getRequestParam("esdsl");
      if (esdslParam) {
        var esdsl = JSON.parse(esdslParam);
        if (esdsl && esdsl.query) {
          this.queries = [esdsl.query];
        }
      }
      if (this.queries && this.queries.length > 0) {
        if (!params.queries) params.queries = [];
        array.forEach(this.queries,function(query){
          //params.hasScorable = true; TODO??
          params.queries.push(query);
        });
      } 
    }

  });

  return oThisClass;
});