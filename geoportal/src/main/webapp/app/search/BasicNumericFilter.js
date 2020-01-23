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
        "dojo/number",
        "dojo/dom-construct",
        "dojo/dom-geometry",
        "dojo/text!./templates/BasicNumericFilter.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent",
        "app/search/DropPane",
        "app/search/QClause",
        "app/search/BasicNumericFilterSettings"],
function(declare, lang, array, djNumber, domConstruct, domGeometry,
    template, i18n, SearchComponent, DropPane, QClause, Settings) {
  
  var oThisClass = declare([SearchComponent], {
    
    i18n: i18n,
    templateString: template,
    
    allowSettings: null,
    field: null,
    fieldsOperator: "must",
    nestedPath: null,
    
    label: i18n.search.numericFilter.label,
    open: false,
        
    _fromValue: null,
    _toValue: null,
    
    _initialSettings: null,
    
    postCreate: function() {
      this.inherited(arguments);
      
      this._initialSettings = {
        label: this.label,
        field: this.field,
        nestedPath: this.nestedPath
      };
      
      if (this.allowSettings === null) {
        if (AppContext.appConfig.search && !!AppContext.appConfig.search.allowSettings) {
          this.allowSettings = true;
        }
      }
      if (this.allowSettings) {
        var link = this.dropPane.addSettingsLink();
        link.onclick = lang.hitch(this,function(e) {
          var d = new Settings({targetWidget:this});
          d.showDialog();
        });
      }
    },
    
    formatRange: function(fromValue,toValue,forSearchLink) {
      var v = "", rangePattern;
      if (fromValue || toValue) {
        rangePattern = i18n.search.numericFilter.rangePattern;
        v = rangePattern.replace("{from}",this.formatValue(fromValue));
        v = v.replace("{to}",this.formatValue(toValue));
      }
      return v;
    },
    
    formatValue: function(value) {
      if (typeof value === "undefined" || value === null) return "";
      return djNumber.format(value,{places:this.places});
    },
    
    hasNestedPath: function() {
      return (typeof this.nestedPath === "string" && this.nestedPath.length > 0);
    },
    
    /* SearchComponent API ============================================= */
    
    appendQueryParams: function(params) {
      var query = null, qNested = null, condition = null;
      var lbl = this.label;
      var from = this._fromValue, to = this._toValue;
      var tip = this.formatRange(from,to,false);
      if (from || to) {
        if (from && to) {
          condition = {"gte":from,"lte":to};
        } else if (from) {
          condition = {"gte":from};
        } else if (to) {
          condition = {"lte":to};
        }
        if (condition !== null) {
          query = {"range": {}};
          query.range[this.field] = condition;
          if (this.hasNestedPath()) {
            qNested = {"nested":{
              "path": this.nestedPath,
              "query": {"bool": {"must":[query]}}
            }};
            query = qNested;
          }
        }       
      }
      
      if (!query) {
        this.activeQClauses = null;
      } else {
        var qClause = new QClause({
          label: lbl,
          tip: tip,
          parentQComponent: this,
          removable: true,
          query: query
        });
        this.activeQClauses = [qClause];
        this.appendQClauses(params);
      } 
      
      var key = this.getAggregationKey();
      if (!params.aggregations) params.aggregations = {};
      var aggregationField = this.field;
      var interval = 1;
      var minDocCount = 1;
      var histogram = {
        "histogram":{
          "field": aggregationField,
          "interval": interval,
          "min_doc_count": minDocCount
        }
      };
      if (this.hasNestedPath()) {
        params.aggregations[key] = {
          "nested" : {"path": this.nestedPath},
          "aggregations": {
            "values": histogram
          }
        };
      } else {
        params.aggregations[key] = histogram;
      }
      
    },
    
    whenQClauseRemoved: function(qClause) {
      var self = this;
      if (this === qClause.parentQComponent) {
        this._searchDisabled = true;
        this._fromValue = this._toValue = null;
        this.fromValueInput.set("value", null);
        this.toValueInput.set("value", null);
        setTimeout(function(){self._searchDisabled = false;},100);
      }
    },
    
    onApplyClicked: function(evt) {
      this._fromValue = this.fromValueInput.get("value");
      this._toValue = this.toValueInput.get("value");
      this.search();
    }
    
  });
  
  return oThisClass;
});