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
        "app/common/Templated",
        "app/etc/util",
        "dijit/Tooltip"],
function(declare, lang, array, Templated, util, Tooltip) {
  
  var oThisClass = declare([Templated], {
  
    activeQClauses: null,
    isSearchComponent: true,
    searchOptions: null,
    searchPane: null,
    extendedToolTip: null,
    
    postCreate: function() {
        this.intializeToolTip();
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
    
    processError: function(searchError) {},
    
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

      intializeToolTip: function(){
      if (this.ToolTip) {
          var node = this;
          //  var node = dom.byId('someNode');
          this.ToolTip.set("connectId", [node]);
          if (this.extendedToolTip) {
              this.ToolTip.label = this.extendedToolTip + this.ToolTip.label;
          }
      }
      }
  
  });
  
  return oThisClass;
});