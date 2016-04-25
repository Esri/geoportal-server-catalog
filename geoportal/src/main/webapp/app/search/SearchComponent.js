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
        "dijit/registry",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "app/etc/util"], 
function(declare, lang, array, query, domClass, registry,
         _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, util) {
  
  var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
  
    activeQClauses: null,
    isSearchComponent: true,
    searchOptions: null,
    searchPane: null,
    
    postCreate: function() {
      this.inherited(arguments);
    },
    
    /* SearchComponent API ============================================= */
    
    appendQClauses: function(params) {
      array.forEach(this.activeQClauses,function(qClause){
        if (typeof qClause.query === "object" && typeof qClause.query !== null) {
          if (!params.queries) params.queries = [];
          params.queries.push(qClause.query);
          if (qClause.scorable) params.hasScorable = true;
        }
      });
    },
    
    appendQueryParams: function(params) {},
    
    applyUIOptions: function(searchOptions) {},
    
    disableOrEnableAll: function(bDisabled) {},
    
    getAggregationKey: function() {
      return "id_"+this.id;
    },
    
    processResults: function(searchResponse) {},
    
    pushQClause: function(qClause,bSearch) {
      if (!this.activeQClauses) this.activeQClauses = [];
      this.activeQClauses.push(qClause);
      if (bSearch) this.search();
    },
    
    search: function() {
      if (this.searchPane) this.searchPane.search();
    },
    
    setNodeText: function(nd,text) {
      util.setNodeText(nd,text);
    },
    
    whenQClauseRemoved: function(qClause) {},
    
    /* utilities ======================================================= */
    
    /*
    _disableOrEnableNamedOptionWidgets: function(bDisabled) {
      var widgets = this._getNamedOptionWidgets();

      array.forEach(widgets,function(widget){
        if(bDisabled) {
          widget.setAttribute("disabled", "disabled");
        } else {
          widget.removeAttribute("disabled");
        }
      });
    },
    
    _getNamedOptionWidgets: function() {
      var widgets = [];
      array.forEach(query("[data-option-name]", this.domNode),function(widget){
        if (widget.getAttribute("data-option-name")) {
          widgets.push(widget);
        }
      });
      // Try using "data-props" attribute to query if no results returned
      // by querying using "data-option-name"
      if(widgets.length === 0) {
        array.forEach(query("[data-props]", this.domNode),function(widget){
          if (widget.getAttribute("data-props")) {
            widgets.push(widget);
          }
        });
      }

      return widgets;
    },
    
    _initNamedOptionWidgets: function(allow,selected,cssVisible,cssHidden) {
      var widgets = this._getNamedOptionWidgets();
      array.forEach(widgets,lang.hitch(this,function(widget){
        var optionName = this._toLowerCase(widget.getAttribute("data-option-name"));
        if (!optionName) {
          var propsStr = widget.getAttribute("data-props");
          var propsObj = JSON.parse(propsStr);
          optionName = propsObj.optionName;
        } 
        var ndSection = widget;
        var bAllow = array.some(allow,lang.hitch(this,function(s){
          if (optionName === this._toLowerCase(s)) {
            ndSection = widget;
            return true;
          }
        }));
        if (ndSection) {
          this._setVisibility(ndSection,bAllow,cssVisible,cssHidden);
        }
        var bSelected = array.some(selected,lang.hitch(this,function(s){
          if (optionName === this._toLowerCase(s)) {
            if (ndSection) {
              if(!domClass.contains(ndSection, "btn")&&this._toLowerCase(ndSection.parentNode.tagName) === "li") {
                domClass.add(ndSection.parentNode, "active");
              }else{
                domClass.add(ndSection, "active");
              }
            }
            return true;
          }
        }));
        
        try {
          var wgt = registry.byId(widget.id);
          if (wgt && wgt.set && typeof wgt.set === "function") {
            wgt.set("checked",bSelected);
          }
        } catch(e) {}
      }));
    },
    
    _setVisibility: function(node,visible,cssClassVisible,cssClassHidden) {
      if (visible) {
        domClass.remove(node,cssClassHidden);
        domClass.add(node,cssClassVisible);
      } else {
        domClass.remove(node,cssClassVisible);
        domClass.add(node,cssClassHidden);
      }
    },
    
    _toLowerCase: function(s) {
      if (s) s = s.toLowerCase();
      else s = null;
      return s;
    },
    
    _whenOptionChanged: function(optionsType) {
      this.searchPane.whenOptionChanged(optionsType);
    }
    */
  
  });
  
  return oThisClass;
});