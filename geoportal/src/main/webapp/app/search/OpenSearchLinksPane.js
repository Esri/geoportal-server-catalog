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
        "dojo/dom-construct",
        "dojo/io-query",
        "dojo/text!./templates/OpenSearchLinksPane.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent"],
    function (declare, lang, array, domConstruct, ioQuery, template, i18n, SearchComponent) {

        var oThisClass = declare([SearchComponent], {

            i18n: i18n,
            templateString: template,
            params: {},
            opensearchContext: "./opensearch?",

            postCreate: function () {
              this.inherited(arguments);
              if (!AppContext.appConfig.searchResults.showOpenSearchLinks) {
                this.destroy();
              }
            },
            
            _appendLink: function(name, alt, url) {
              domConstruct.create("a", {
                innerHTML: name, 
                href: url, 
                "class": "g-open-search-result-link", 
                target: "_blank", 
                title: alt, 
                "aria-label": alt
              }, this.linksNode );
            },
            
            _createWebLink: function(name, alt, type, urlParams, postData) {
              var q = lang.mixin(
                        urlParams, 
                        { esdsl: JSON.stringify({ query: postData.query }) }
                      );
              var sq = ioQuery.objectToQuery(q);
              var url = "?" + sq + "#searchPanel";
              this._appendLink(name, alt, url);
            },
            
            _createLink: function(name, alt, type, urlParams, postData) {
              var q = lang.mixin(
                        { f: type},
                        urlParams, 
                        { esdsl: JSON.stringify({ query: postData.query }) }
                      );
              var sq = ioQuery.objectToQuery(q);
              var url = this.opensearchContext + sq;
              this._appendLink(name, alt, url);
            },

            _createDcat3Link: function(name, alt, urlParams, postData, rawSort) {
              var queryNode = postData && postData.query ? postData.query : postData;
              var q = lang.mixin({}, urlParams, {
                esdsl: JSON.stringify({ query: queryNode })
              });
              q.sort = this._toDcat3SortParam(rawSort, q.sort);
              if (urlParams && typeof urlParams.profile === "string" && urlParams.profile.length > 0) {
                q.profile = urlParams.profile;
              }
              var sq = ioQuery.objectToQuery(q);
              var url = "./dcat3/dataset" + (sq ? "?" + sq : "");
              this._appendLink(name, alt, url);
            },

            _toDcat3SortParam: function(rawSort, fallbackSort) {
              var toOrder = function(v) {
                var order = "asc";
                if (typeof v === "string") {
                  order = v.toLowerCase();
                } else if (v && typeof v === "object" && typeof v.order === "string") {
                  order = v.order.toLowerCase();
                }
                return order === "desc" ? "desc" : "asc";
              };

              if (typeof rawSort === "string" && rawSort.length > 0) {
                return rawSort;
              }

              var parts = [];
              var pushPair = function(field, value) {
                if (!field || typeof field !== "string") return;
                var clean = field.trim();
                if (clean.length === 0) return;
                parts.push(clean + ":" + toOrder(value));
              };

              if (Array.isArray(rawSort)) {
                rawSort.forEach(function(spec) {
                  if (!spec || typeof spec !== "object") return;
                  Object.keys(spec).forEach(function(field) {
                    pushPair(field, spec[field]);
                  });
                });
              } else if (rawSort && typeof rawSort === "object") {
                Object.keys(rawSort).forEach(function(field) {
                  pushPair(field, rawSort[field]);
                });
              }

              if (parts.length > 0) {
                return parts.join(",");
              }
              return fallbackSort || "";
            },

            /* SearchComponent API ============================================= */

            appendQueryParams: function (params) {
              domConstruct.empty(this.linksNode);
            },

            processError: function (searchError) {
              domConstruct.empty(this.linksNode);
            },

            processResults: function (searchResponse) {
              var postData = JSON.parse(this.searchPane.lastQuery);
              postData = postData? postData: {};
              var rawSort = searchResponse.urlParams ? searchResponse.urlParams.sort : null;
              
              if (!searchResponse.hasScorable && typeof searchResponse.urlParams.sort === "undefined") {
                  var sortObj = AppContext.appConfig.searchResults.defaultSort;
              }
              if (searchResponse.urlParams && searchResponse.urlParams.sort !== "undefined" && typeof searchResponse.urlParams.sort === "object") {
            	  sortObj = searchResponse.urlParams.sort;
              }
              //672 nashorn search expects sort as string param like "_id:asc" i.e. "field:order" so convert object to
              var sortParam = this.convertSortObjectToString(sortObj);
              
              searchResponse.urlParams.sort = sortParam;
              var openSearchUrlParams = lang.mixin({}, searchResponse.urlParams)
              openSearchUrlParams.from = searchResponse.urlParams.from? searchResponse.urlParams.from+1: 1
              
              // 1-base index
              this._createLink("ATOM", i18n.search.links.atom, "atom", openSearchUrlParams, postData);
              this._createLink("CSW", i18n.search.links.csw, "csw", openSearchUrlParams, postData);
              this._createLink("JSON", i18n.search.links.json, "json", openSearchUrlParams, postData);
              this._createLink("CSV", i18n.search.links.csv, "csv", openSearchUrlParams, postData);
              this._createLink("KML", i18n.search.links.kml, "kml", openSearchUrlParams, postData);
              this._createLink("RSS", i18n.search.links.rss, "rss", openSearchUrlParams, postData);
              this._createLink("DCAT", i18n.search.links.dcat, "dcat", openSearchUrlParams, postData);
              this._createDcat3Link("DCAT3", i18n.search.links.dcat3, openSearchUrlParams, postData, rawSort);
              
              // 0-base index
              this._createWebLink("WEB", i18n.search.links.web, "web", searchResponse.urlParams, postData);
            },
            

            convertSortObjectToString:function(sortObj) {
            	if (!sortObj || typeof sortObj !== "object") return "";

            	  return Object.keys(sortObj)
            	    .map(key => {
            	      const cleanKey = key.replace(".keyword", "");
            	      const value = sortObj[key];

            	      // If value is an object with 'order', use that; otherwise assume it's a string
            	      const order = typeof value === "object" && value.order ? value.order : value;
            	      return `${cleanKey}: ${order}`;
            	    })
            	    .join(", ");
            }
        });

        return oThisClass;
    });