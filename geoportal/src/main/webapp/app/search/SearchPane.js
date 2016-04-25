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
        "esri/request",
        "app/context/AppClient",
        "app/search/SearchBox",
        "app/search/ResultsPane"], 
function(declare, lang, array, query, domClass, topic, appTopics, registry,
         _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n, 
         esriRequest, AppClient) {

  var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    i18n: i18n,
    templateString: template,
    
    activeRequest: null,
    searchOnStart: true,
    
    postCreate: function() {
      this.inherited(arguments);
      var self = this;
      topic.subscribe(appTopics.SignedIn,function(params){
        if (self._started) self.search();
      });
      topic.subscribe(appTopics.ItemUploaded,function(params){
        if (self._started) self.search();
      });
      
      /*
      array.forEach(this.getChildren(),lang.hitch(this,function(child){
        console.warn(child);
      }));
      */
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
      /*
      var components = [];
      array.forEach(query("[data-option-name]", this.domNode),function(widget){
        if (widget.getAttribute("data-option-name")) {
          widgets.push(widget);
        }
      });
      */
      
      /*
      var nodes = [];
      if (this.searchToolbar) nodes.push(this.searchToolbar);
      if (this.searchScopeBar) nodes.push(this.searchScopeBar);
      if (this.searchDataTypeBar) nodes.push(this.searchDataTypeBar);
      if (this.searchDocumentTypeBar) nodes.push(this.searchDocumentTypeBar);
      if (this.searchSortBar) nodes.push(this.searchSortBar);
      if (this.searchBottomToolbar) nodes.push(this.searchBottomToolbar);
      array.forEach(nodes,function(node){
        array.forEach(registry.findWidgets(node),function(widget){
          if (widget.isSearchComponent) components.push(widget);
        });
      });
      components.push(this.resultsPane);
      return components;
      */
    },
    
    search: function() {
      //if (this.activeSearch) {}; TODO cancel an active search?
      var components = this.getSearchComponents();
      var self = this, params = {urlParams:{}};
      
      //params = {"query":{"query_string" : {"query" : "product"}}};
      
      array.forEach(components,function(component){
        component.appendQueryParams(params);
      });
      // TODO show searching...
      var u = "./elastic/"+AppContext.geoportal.metadataIndexName+"/item/_search";
      var info = {url:u, handleAs:"json"};
      var options = {usePost: false};

      if (params.urlParams) {
        var sProp = null, oProp = null, props = params.urlParams;
        for (sProp in props) {
          if (props.hasOwnProperty(sProp)) {
            oProp = props[sProp];
            if (typeof oProp !== "undefined" && oProp !== null) {
              if (u.indexOf("?") === -1) u += "?";
              else u += "&";
              u += sProp+"="+encodeURIComponent(oProp);
            }
          }
        }
        info.url = u;
      }
      
      var postData = null;
      
      //console.warn("params.queries",params.queries);
      
      if (params.queries && params.queries.length > 0) {
        if (postData === null) postData = {};
        postData.query = {"bool":{"must":params.queries}}; // TODO must or should??
      } else {
        // TODO config default-sort??
        /*
        if (!params.hasScorable && typeof params.urlParams.sort === "undefined") {
          if (info.url.indexOf("?") === -1) info.url += "?";
          else info.url += "&";
          info.url += "sort="+encodeURIComponent("sys_modified_dt:desc");
        }
        */
      }
      
      if (params.aggregations) {
        if (postData === null) postData = {};
        postData.aggregations = params.aggregations;
      }
      
      if (postData !== null) {
        options.usePost = true;
        info.headers = {"Content-Type": "application/json"};
        info.postData = JSON.stringify(postData);
      }
      
      var request = self.activeRequest = esriRequest(info,options);
      request.then(function(response) {
        //console.warn("search-response",response);
        response.urlParams = params.urlParams;
        array.forEach(components,function(component){
          component.processResults(response);
        });
        self.activeRequest = null;
      }).otherwise(function(error){
        console.warn("search-error",error);
        self.activeRequest = null;
      });
      return request;
    }

  });

  return oThisClass;
});