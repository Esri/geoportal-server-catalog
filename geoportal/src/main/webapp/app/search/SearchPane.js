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
        "dojo/query",
        "dojo/dom-class",
        "dojo/topic",
        "app/context/app-topics",
        "dijit/registry",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/SearchPane.html",
        "dojo/i18n!app/nls/resources",
        "dojo/request",
        "app/context/AppClient",
        "app/search/SearchBox",
        "app/search/ResultsPane",
        "dojo/io-query"],
function(declare, lang, array, query, domClass, topic, appTopics, registry,
         _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n, 
         dojoRequest, AppClient, ioQuery) {

  var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    i18n: i18n,
    templateString: template,
    
    searchOnStart: true,
    defaultSort: null,
    
    _dfd: null,
    
    postCreate: function() {
      this.inherited(arguments);
      if (this.defaultSort === null) {
        this.defaultSort = AppContext.appConfig.searchResults.defaultSort;
      }
      var self = this;
      topic.subscribe(appTopics.BulkUpdate,function(params){
        if (self._started) self.search();
      });
      topic.subscribe(appTopics.ItemUploaded,function(params){
        if (self._started) self.search();
      });
      topic.subscribe(appTopics.SignedIn,function(params){
        if (self._started) self.search();
      });
    },
    
    startup: function() {
      if (this._started) {return;}
      this.inherited(arguments);
      var self = this;
      if (this.searchOnStart) {
        // wait a bit for the map
        setTimeout(function(){self.search({});},100);
      }
      array.forEach(this.getSearchComponents(),function(component){
        component.searchPane = self;
      });
    },

    getSearchComponents: function() { 
      //var components = [this.searchBox,this.resultsPane];
      var components = [];
      array.forEach(this.getChildren(),function(child){
        if (child.isSearchComponent) components.push(child);
      });
      
      return components;
    },
    
    search: function() {
      var components = this.getSearchComponents();
      var self = this, params = {urlParams:{}};
      var uri = window.location.search;
      var query = uri.substring(uri.indexOf("?") + 1, uri.length);
      if (query != null && query.length >0) {
        // ioQuery.queryToObject(query); // tried no reference error
  //        params.urlParams = dojo.queryToObject(query);
      }
      array.forEach(components,function(component){
        component.appendQueryParams(params);
      });
      var url = "./elastic/"+AppContext.geoportal.metadataIndexName+"/item/_search";
      var v, postData = null;

      //var client = new AppClient();
      //url = client.appendAccessToken(url);
      var sProp = null, oProp = null, props = params.urlParams;
      for (sProp in props) {
        if (props.hasOwnProperty(sProp)) {
          oProp = props[sProp];
          if (typeof oProp !== "undefined" && oProp !== null) {
            if (url.indexOf("?") === -1) url += "?";
            else url += "&";
            url += sProp+"="+encodeURIComponent(oProp);
          }
        }
      }
      if (!params.hasScorable && typeof params.urlParams.sort === "undefined") {
        v = AppContext.appConfig.searchResults.defaultSort;
        if (typeof this.defaultSort === "string" && this.defaultSort.length > 0) {
          if (url.indexOf("?") === -1) url += "?";
          else url += "&";
          url += "sort="+encodeURIComponent(this.defaultSort);
        }
      }

      //console.warn("params.queries",params.queries);
      if (params.queries && params.queries.length > 0) {
        if (postData === null) postData = {};
        postData.query = {"bool":{"must":params.queries}};
      } else {

      }
      if (params.aggregations) {
        if (postData === null) postData = {};
        postData.aggregations = params.aggregations;
      }
      if (this._dfd !== null && !this._dfd.isCanceled()) {
        this._dfd.cancel("Search aborted.",false);
      }
      
      var dfd = null;
      if (postData === null) {
        dfd = this._dfd = dojoRequest.get(url,{handleAs:"json"});
      } else {
        dfd = this._dfd = dojoRequest.post(url,{
          handleAs: "json",
          headers: {"Content-Type": "application/json"},
          data: JSON.stringify(postData)
        });
      }
      
      dfd.then(function(response) {
        if (!dfd.isCanceled()) {
          //console.warn("search-response",response);
          response.urlParams = params.urlParams;
          array.forEach(components,function(component){
            component.processResults(response);
          });
        }
      }).otherwise(function(error){
        if (!dfd.isCanceled()) {
          if (error && error.dojoType && error.dojoType === "cancel") {
          } else {
            console.warn("search-error");
            console.warn(error);
            array.forEach(components,function(component){
              component.processError(error);
            });            
          }
        }
      });
      return dfd;
    }

  });

  return oThisClass;
});