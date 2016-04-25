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
        "dojo/on",
        "dojo/keys",
        "dojo/dom-class",
        "dojo/text!./templates/SearchBox.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent",
        "app/search/QClause"], 
function(declare, lang, on, keys, domClass,
         template, i18n, SearchComponent, QClause) {
  
  var oThisClass = declare([SearchComponent], {

    i18n: i18n,
    templateString: template,

    postCreate: function() {
      this.inherited(arguments);
      /*
      this.activeQClauses = [];
      this.ensureSolrClient();
      this.solrClient.registerQComponent(this);
      this.own(on(this.__textBox,"keyup",lang.hitch(this,function(evt) {
        if (evt.keyCode === keys.ENTER) this.search();
      })));
      */
      
      this.own(on(this.searchTextBox,"keyup",lang.hitch(this,function(evt) {
        if (evt.keyCode === keys.ENTER) this.search();
      })));
      this.own(on(this.searchTextBox,"keydown",lang.hitch(this,function(evt) {
        //this._showClearButton();
        if ((evt.keyCode === keys.HOME) || (evt.keyCode === keys.END) ||
            (evt.keyCode === keys.LEFT_ARROW) || (evt.keyCode === keys.RIGHT_ARROW)){
          evt.stopPropagation();
          //evt.stopImmediatePropagation();
          //evt.preventDefault();
        }
      })));
      
    },
    
    /*
    clearButtonClicked: function() {
      this.searchTextBox.value = "";
      this._hideClearButton();
      on.emit(this,"ClearClick");
    },
    
    searchButtonClicked: function() {
      this.search();
    },
    
    _showClearButton: function() {
      domClass.remove(this.clearButton, "hidden");
    },

    _hideClearButton: function() {
      domClass.add(this.clearButton, "hidden");
    },
    */
    
    /* SearchComponent API ============================================= */
    
    appendQueryParams: function(params) {
      var v = this.searchTextBox.value;
      if (v !== null && lang.trim(v).length > 0) {
        var tipPattern = i18n.search.appliedFilters.tipPattern;
        var tip = tipPattern.replace("{type}",i18n.search.searchBox.search).replace("{value}",v);
        var query = {"query_string": {
          "analyze_wildcard": true,
          "query": v
        }};
        var qClause = new QClause({
          label: v,
          tip: tip,
          parentQComponent: this,
          removable: true,
          scorable: true,
          query: query
        });
        this.activeQClauses = [qClause];
        this.appendQClauses(params);
      } else {
        this.activeQClauses = null;
      }
    },
    
    whenQClauseRemoved: function(qClause) {
      if (this === qClause.parentQComponent) {
        this.searchTextBox.value = "";
      }
    }

  });

  return oThisClass;
});