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
        "dojo/topic",
        "app/context/app-topics",
        "app/common/Templated",
        "app/etc/util"], 
function(declare, lang, array, topic, appTopics, Templated, util) {
  
  var oThisClass = declare([Templated], {
  
    activeQClauses: null,
    conditionallyDisabled: false,
    isSearchComponent: true,
    searchOptions: null,
    searchPane: null,
    allowedCollections: null,
    
    postCreate: function() {
      this.inherited(arguments);
      if (this.conditionallyDisabled) {
        if (this.domNode) this.domNode.style.display = "none";
      }
      if (!this.conditionallyDisabled && AppContext.geoportal.supportsCollections) {
        this.own(topic.subscribe(appTopics.CollectionChanged,lang.hitch(this,this.evaluateCollection)));
        this.evaluateCollection();
      }
    },
    
    /* SearchComponent API ============================================= */
    
    evaluateCollection(publishedCollection) {
      publishedCollection = publishedCollection? publishedCollection: '';
      
      var enabled = true;

      if (this.allowedCollections) {
        if (typeof this.allowedCollections === 'string' && this.allowedCollections.length>0) {

          enabled = this.checkCollection(this.allowedCollections, publishedCollection);

        } else if (Array.isArray(this.allowedCollections) && this.allowedCollections.length>0) {

          enabled = this.allowedCollections.some(lang.hitch(this, function(allowedCollection) {
            return this.checkCollection(allowedCollection, publishedCollection);
          }));

        }
      }

      if (this.domNode) this.domNode.style.display = enabled? "block": "none";
    },
    
    checkCollection: function(allowedCollection, publishedCollection) {
      if (allowedCollection==="*" && publishedCollection.length>0) {
        return true;
      }
      
      
      if (allowedCollection.startsWith("/")) {
        
        var exp = eval(allowedCollection);
        return exp.test(publishedCollection);
        
      } else {
        
        var isNot = false;

        if (allowedCollection.startsWith("!")) {
          isNot = true;
          allowedCollection = allowedCollection.substr(1);
        }
        
        return allowedCollection===publishedCollection? !isNot: isNot;
        
      }

    },
    
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
      history.replaceState(location.pathname, document.title, location.pathname.replace(/\/+$/g, "") + "/#searchPanel");
      if (this.searchPane) this.searchPane.search();
    },
    
    setNodeText: function(nd,text) {
      util.setNodeText(nd,text);
    },
    
    whenQClauseRemoved: function(qClause) {}
  
  });
  
  return oThisClass;
});