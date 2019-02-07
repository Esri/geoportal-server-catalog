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
        "app/search/QClause",
        "app/etc/util"],
function(declare, lang, array, ioQuery, SearchComponent, QClause, Util) {
  
  var oThisClass = declare([SearchComponent], {
    
    queries: [],

      postCreate: function() {
          this.inherited(arguments);

          var self = this, uri = window.location.href;
          this.queries = [];
          this.activeQClauses = [];
          if (uri.indexOf("?") !== -1) {
              var s = uri.substring(uri.indexOf("?")+1,uri.length);
              var hash = s.substring(s.indexOf("#")+1,s.length);
              s=s.substring(0,s.indexOf("#"));
              var o = ioQuery.queryToObject(s);
              if (o && typeof o.filter === "string") {
                  this._addQuery(o.filter);
              } else if (o && typeof o.fileid === "string")
              {
                  this._addFileIdQuery(o.fileid);
              }else if (o && lang.isArray(o.filter)) {
                  array.forEach(o.filter,function(v){
                      self._addQuery(v);
                  });
              }
          }
      },

      _addQuery: function(v) {
          if (typeof v === "string") {

              v = Util.escapeForLucene(lang.trim(v));
              //v = v.replace(/:/g,"\\:");
              // v = v.replace(/\//g,"\\\/");
              if (v.length > 0) {
                  var query = {"query_string": {
                          "analyze_wildcard": true,
                          "query": v
                      }};
                  this.queries.push(query);
                  var qClause = new QClause({
                      label: "filter from URL",
                      tip: v,
                      parentQComponent: this,
                      removable: false,
                      urlParameterName: "filter",
                      urlParameterValue: v,
                      query: query
                  });
                  this.addQClause(qClause);
              }

          }
      },
      _addFileIdQuery: function(v) {
          if (typeof v === "string") {
              v = Util.escapeForLucene(lang.trim(v));
              //v = v.replace(/:/g,"\\:");
              //v = v.replace(/\//g,"\\\/");
              if (v.length > 0) {
                  var query = {"query_string": {
                          "default_field": "fileid",
                          "query": v
                      }};
                  this.queries.push(query);

                  var qClause = new QClause({
                      label: "fileid from URL",
                      tip: v,
                      parentQComponent: this,
                      removable: false,
                      urlParameterName: "fileid",
                      urlParameterValue: v,
                      query: query
                  });
                  this.addQClause(qClause);

              }
          }
      },
      addQClause: function(qClause){
          if (this.activeQClauses === null ){
              this.activeQClauses = [qClause];
          } else {
              this.activeQClauses.push(qClause);
          }
      },
      /* SearchComponent API ============================================= */

      appendQueryParams: function(params) {

          if (this.activeQClauses && this.activeQClauses.length > 0) {
              this.appendQClauses(params);
          }
      }
  });

  return oThisClass;
});