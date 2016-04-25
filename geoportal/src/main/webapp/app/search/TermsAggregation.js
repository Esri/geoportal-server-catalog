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
        "app/search/QClause"], 
function(declare, lang, array, domConstruct, template, i18n, SearchComponent, DropPane, QClause) {
  
  var oThisClass = declare([SearchComponent], {
    
    i18n: i18n,
    templateString: template,
    
    field: null,
    label: null,
    open: false,
    props: null,
    
    postCreate: function() {
      this.inherited(arguments);
      
      if (this.allowSettings) {
        var link = this.dropPane.addSettingsLink();
        link.onclick = lang.hitch(this,function(e) {
          //console.warn("TermsAggregation.settings clicked.");
        });
      }
    },
    
    postMixInProperties: function() {
      this.inherited(arguments);
      if (typeof this.label === "undefined" || this.label === null || this.label.length === 0) {
        this.label = this.field;
      }
    },
    
    addEntry: function(term,count) {
      var v = term+" ("+count+")";
      var tipPattern = i18n.search.appliedFilters.tipPattern;
      var tip = tipPattern.replace("{type}",this.label).replace("{value}",term);
      var query = {"term": {}};
      query.term[this.field] = term;
      var qClause = new QClause({
        label: term,
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
          array.forEach(data.buckets,function(entry){
            this.addEntry(entry.key,entry.doc_count);
          },this);
        }
      }
    }
    
  });
  
  return oThisClass;
});