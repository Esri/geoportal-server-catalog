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
        "dojo/number",
        "app/search/SearchComponentSettings",
        "dojo/text!./templates/HierarchyTreeSettings.html",
        "dojo/i18n!app/nls/resources"], 
function(declare, lang, number, SearchComponentSettings, template, i18n) {
  
  var oThisClass = declare([SearchComponentSettings], {
    
    i18n: i18n,
    templateString: template,
    
    maxSize: 10000000,
    maxMinDocCount: Number.POSITIVE_INFINITY,
    
    postCreate: function() {
      this.inherited(arguments);
    },
    
    _applyTextVal: function(props,name,inputNode) {
      delete props[name];
      var v = inputNode.value;
      if (typeof v === "string") {
        v = lang.trim(v);
        if (v.length > 0) props[name] = v;
      }
    },
    
    _setTextVal: function(props,name,inputNode) {
      inputNode.value = "";
      var v = props[name];
      if (typeof v === "string") {
        v = lang.trim(v);
        if (v.length > 0) inputNode.value = v;
      }
    },
    
    /* SearchComponentSettings API ============================================= */
    
    getTitle: function() {
      return i18n.search.termsAggregation.settings.caption;
    },
    
    init: function(settings) {
      this.inherited(arguments);
      if (!settings) settings = this.targetWidget;
      
      var v, v2, props = settings.props || {};
      
      this.componentLabelInput.value = settings.label;
      this.fieldInput.value = settings.field;
      
      this.sizeInput.value = "";
      v = number.parse(props.size,{places:0});
      if (typeof v === "number" && !isNaN(v) && isFinite(v)) {
        if (v > 0 && v <= this.maxSize) {
          this.sizeInput.value = v;
        }
      }
      
      this.minDocCountInput.value = "";
      v = number.parse(props.min_doc_count,{places:0});
      if (typeof v === "number" && !isNaN(v) && isFinite(v)) {
        if (v > 0 && v <= this.maxMinDocCount) {
          this.minDocCountInput.value = v;
        }
      }
      
      $(this.orderSelect).val("");
      v = props.order, v2 = null;
      if (typeof v === "object" && v !== null) {
        if (v._count === "asc") {
          v2 = "countAsc";
        } else if (v._count === "desc") {
          v2 = "countDesc";
        } else if (v._term === "asc") {
          v2 = "termAsc";
        } else if (v._term === "desc") {
          v2 = "termDesc";
        }
        if (v2 !== null) $(this.orderSelect).val(v2);
      }
      
      this._setTextVal(props,"missing",this.missingInput);
      //this._setTextVal(props,"include",this.includeInput);
      //this._setTextVal(props,"exclude",this.excludeInput);
    },
    
    reset: function() {
      this.init(this.targetWidget._initialSettings);
    },
    
    validateAndApply: function() {
      var chkInput = function(inputNode,defaultVal) {
        var v = inputNode.value;
        if (typeof v === "string" && lang.trim(v).length > 0) {
          return lang.trim(v);
        }
        return defaultVal;
      };
      
      if (!this.targetWidget.props) this.targetWidget.props = {};
      var v, v2, props = {}, targetProps = this.targetWidget.props;
      
      this.targetWidget.label = chkInput(this.componentLabelInput,this.targetWidget.label);
      this.targetWidget.dropPane.set("title",this.targetWidget.label);
      this.targetWidget.field = chkInput(this.fieldInput,this.targetWidget.field);
      
      delete targetProps.size;
      v = number.parse(this.sizeInput.value,{places:0});
      if (typeof v === "number" && !isNaN(v) && isFinite(v)) {
        if (v > 0 && v <= this.maxSize) {
          props.size = v;
        }
      } 
      
      delete targetProps.min_doc_count;
      v = number.parse(this.minDocCountInput.value,{places:0});
      if (typeof v === "number" && !isNaN(v) && isFinite(v)) {
        if (v > 0 && v <= this.maxMinDocCount) {
          props.min_doc_count = v;
        }
      } 
      
      delete targetProps.order;
      v = this.orderSelect.options[this.orderSelect.selectedIndex].value;
      if (typeof v === "string" && v.length > 0) {
        if (v === "countAsc") {
          props.order = {"_count":"asc"};
        } else if (v === "countDesc") {
          props.order = {"_count":"desc"};
        } else if (v === "termAsc") {
          props.order = {"_term":"asc"};
        } else if (v === "termDesc") {
          props.order = {"_term":"desc"};
        }
      }
      
      this._applyTextVal(targetProps,"missing",this.missingInput);
      //this._applyTextVal(targetProps,"include",this.includeInput);
      //this._applyTextVal(targetProps,"exclude",this.excludeInput);

      lang.mixin(targetProps,props);
      this.targetWidget.search();
      this.hideDialog();
    }
  
  });
  
  return oThisClass;
});