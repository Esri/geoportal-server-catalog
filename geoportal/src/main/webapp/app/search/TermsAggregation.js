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
        "dojo/text!./templates/TermsAggregation.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent",
        "app/search/DropPane",
        "app/search/QClause",
        "app/search/TermsAggregationSettings"], 
function(declare, lang, array, domConstruct, template, i18n, SearchComponent, 
  DropPane, QClause, TermsAggregationSettings) {
  
  var oThisClass = declare([SearchComponent], {
    
    i18n: i18n,
    templateString: template,
    
    allowSettings: null,
    field: null,
    label: null,
    open: false,
    props: null,
    
    _initialSettings: null,
    
    postCreate: function() {
      this.inherited(arguments);
      
      this._initialSettings = {
        label: this.label,
        field: this.field
      };
      if (this.props) {
        this._initialSettings.props = lang.clone(this.props);
      }
      
      if (this.allowSettings === null) {
        if (AppContext.appConfig.search && !!AppContext.appConfig.search.allowSettings) {
          this.allowSettings = true;
        }
      }
      if (this.allowSettings) {
        var link = this.dropPane.addSettingsLink();
        link.onclick = lang.hitch(this,function(e) {
          var d = new TermsAggregationSettings({
            targetWidget: this
          });
          d.showDialog();
        });
      }
    },
    
    postMixInProperties: function() {
      this.inherited(arguments);
      if (typeof this.label === "undefined" || this.label === null || this.label.length === 0) {
        this.label = this.field;
      }
    },
    
    addEntry: function(term,count,missingVal) {
      var name = this.chkName(term);
      var v = name+" ("+count+")";
      var tipPattern = i18n.search.appliedFilters.tipPattern;
      var tip = tipPattern.replace("{type}",this.label).replace("{value}",name);
      var query = {"term": {}};
      query.term[this.field] = term;
      if (typeof missingVal === "string" && missingVal.length > 0 && missingVal === term) {
        query = {"bool": {"must_not": {"exists": {"field": this.field}}}};
      }
      var qClause = new QClause({
        label: name,
        tip: tip,
        parentQComponent: this,
        removable: true,
        scorable: true,
        query: query
      });
      var nd = domConstruct.create("div",{},this.entriesNode);
      var link = domConstruct.create("a",{
        href: "#",
        onclick: lang.hitch(this,function() {
          this.pushQClause(qClause,true);
        })
      },nd);
      this.setNodeText(link,v);
    },
    
    chkName: function(term){
      var name = term;
      if (this.field === "sys_access_groups_s" && typeof name === "string" &&
          AppContext.geoportal.supportsGroupBasedAccess) {
        array.some(AppContext.appUser.getGroups(),function(group){
          if (group.id === name) {
            name = group.name;
            return true;
          }
        });
      }
      return name;
    },
    
    hasField: function() {
      return (typeof this.field !== "undefined" && this.field !== null && this.field.length > 0);
    },
    
    /* SearchComponent API ============================================= */
    
    appendQueryParams: function(params) {
      if (!this.hasField()) return;
      this.appendQClauses(params);
      
      if (!params.aggregations) params.aggregations = {};
      var key = this.getAggregationKey();
      var props = {"field":this.field};
      if (typeof this.props !== "undefined" && this.props !== null) {
        delete this.props.field; // TODO ??
        lang.mixin(props,this.props);
      }
      params.aggregations[key] = {"terms":props};
    },
    
    processResults: function(searchResponse) {
      domConstruct.empty(this.entriesNode);
      var key = this.getAggregationKey();
      if (searchResponse.aggregations) {
        var data = searchResponse.aggregations[key];
        if (data && data.buckets) {
          
          var v, missingVal = null;
          if (this.props && typeof this.props.missing === "string") {
            v = lang.trim(this.props.missing);
            if (v.length > 0) missingVal = v;
          }
          array.forEach(data.buckets,function(entry){
            this.addEntry(entry.key,entry.doc_count,missingVal);
          },this);
        }
      }
    }
    
  });
  
  return oThisClass;
});