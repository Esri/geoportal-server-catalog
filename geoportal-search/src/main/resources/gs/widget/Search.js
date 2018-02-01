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
  "require",
  "dojo/dom-class",
  "dojo/on",
  "dojo/keys",
  "dojo/io-query",
  "dojo/_base/window",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dojo/text!./templates/Search.html",
  "./Paging",
  "./ResultsPane",
  "./SearchBox",
  "../all",
  "dijit/form/TextBox"],
function(declare, lang, array, localRequire, domClass, on, keys, ioQuery, win,
  _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, Paging,
  ResultsPane, SearchBox) {

  var _def = declare([_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {

    templateString: template,

    components: null,
    defaultFilter : null,
    requiredFilter: null,
    widgetContext: null,

    _wasLoaded: false,

    postCreate: function() {
      this.inherited(arguments);
      var self = this;
      gs.reqAll(localRequire,function(){
        self._wasLoaded = true;
      });
      this.toggleLoading(false);
      this.init();

      this.own(on(win.doc,"click",function(e){
        //console.log("win:click",e);
        var dropdowns = document.getElementsByClassName("dropdown-content");
        array.forEach(dropdowns,function(dropdown) {
          //console.log("chk",dropdown === self._ddClicked);
          //console.log("chk.dd",dropdown);
          //console.log("chk._ddClicked",self._ddClicked);
          //console.log("chk",dropdown === e.target.xtnDDContent);
          if (!e || !e.target || dropdown !== e.target.xtnDDContent) {
            if (dropdown.classList.contains("show")) {
              dropdown.classList.remove("show");
            }
          }
        });
      }));

    },

    buildQueryParams: function(task) {
      var qRequired = null;
      if (typeof this.requiredFilter === "string" && this.requiredFilter.length > 0) {
        qRequired = this.requiredFilter;
      }
      var params = {
        q: qRequired,
        canSortByRelevance: false
      };
      array.forEach(this.components,function(component) {
        component.appendQueryParams(params,task);
      });
      delete params.canSortByRelevance;
      if (params.q === null && typeof this.defaultFilter === "string" &&
          this.defaultFilter.length > 0) {
        params.q = this.defaultFilter;
      }
      return params;
    },

    informExternal: function(text) {
      try {
        if (window && window.external && window.external.gsHasListener) {
          window.external.gsListener(text);
        }
      } catch(ex) {
        console.error(ex);
        //alert(ex);
      }
    },

    init: function() {
      //console.log("widgetContext",this.widgetContext);
      this.components = [];
      var mixins = {
        i18n: this.widgetContext.i18n,
        searchPane: this,
        widgetContext: this.widgetContext
      };

      this.searchBox = new SearchBox(mixins,this.searchBoxNode);
      this.components.push(this.searchBox);
      this.resultsPane = new ResultsPane(mixins,this.resultsPaneNode);
      this.components.push(this.resultsPane);
      this.paging = new Paging(mixins,this.pagingNode);
      this.components.push(this.paging);
    },

    processResults: function(searchResponse) {
      array.forEach(this.components,function(component) {
        component.processResults(searchResponse);
      });
    },

    search: function() {
      if (!this._wasLoaded) return; // TODO need a ui error message
      var self = this, task = {};
      this.toggleLoading(true);

      //var q = this.qBox.get("value").trim();
      //var target = this.targetBox.get("value").trim();

      var parameterMap = this.buildQueryParams(task);
      parameterMap.f = "json";
      //parameterMap.target = "gptdb1";

      /*
      var parameterMap = {f: "json"};
      if (q.length > 0) parameterMap.q = q;
      if (target.length > 0) parameterMap.target = target;
      */

      // TODO show working message
      //var textarea = this.textareaNode;
      //textarea.value = "Searching...";

      var requestInfo = {
        "requestUrl": "/request",
        "baseUrl": "/base",
        "headerMap": {},
        "parameterMap": parameterMap
      };
      //console.log("parameterMap",parameterMap);

      var processor = gs.Object.create(gs.context.browser.WebProcessor);
      processor.execute(requestInfo,function(status,mediaType,entity,headers){
        //console.log(status,mediaType,"\r\n",entity);
        //textarea.value = entity;
        // TODO handle errors
        self.informExternal(entity);

        try {
          //console.log("entity",typeof entity,entity);
          // TODO errors?
          var result = JSON.parse(entity);
          //console.log("result",result);
          self.processResults(result);
        } catch(ex) {
          console.error(ex);
        }

        self.toggleLoading(false);
      });

    },

    toggleLoading: function(visible) {
      if (visible) {
        domClass.add(this.loadingNode,"loading");
      } else {
        domClass.remove(this.loadingNode,"loading");
      }
    }

  });

  return _def;
});
