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
            
            _appendLink: function(name, url) {
              domConstruct.create("a", {innerHTML: name, href: url, "class": "g-open-search-result-link", target: "_blank"}, this.linksNode );
            },
            
            _createLink: function(name, type, urlParams, postData) {
              var q = lang.mixin(
                        { f: type},
                        urlParams, 
                        { esdsl: JSON.stringify({ query: postData.query }) }
                      );
              var sq = ioQuery.objectToQuery(q);
              var url = this.opensearchContext + sq;
              this._appendLink(name, url);
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
              
              this._createLink("ATOM", "atom", searchResponse.urlParams, postData);
              this._createLink("CSW", "csw", searchResponse.urlParams, postData);
              this._createLink("JSON", "json", searchResponse.urlParams, postData);
              this._createLink("CSV", "csv", searchResponse.urlParams, postData);
              this._createLink("KML", "kml", searchResponse.urlParams, postData);
              this._createLink("RSS", "rss", searchResponse.urlParams, postData);
            }

        });

        return oThisClass;
    });