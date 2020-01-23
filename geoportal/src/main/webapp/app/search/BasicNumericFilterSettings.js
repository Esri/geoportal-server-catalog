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
        "dojo/text!./templates/BasicNumericFilterSettings.html",
        "dojo/i18n!app/nls/resources"], 
function(declare, lang, number, SearchComponentSettings, template, i18n) {
  
  var oThisClass = declare([SearchComponentSettings], {
    
    i18n: i18n,
    templateString: template,
    
    postCreate: function() {
      this.inherited(arguments);
    },
    
    /* SearchComponentSettings API ============================================= */
    
    getTitle: function() {
      return i18n.search.numericFilter.settings.caption;
    },
    
    init: function(settings) {
      this.inherited(arguments);
      if (!settings) settings = this.targetWidget;
      this.componentLabelInput.value = settings.label;
      this.fieldInput.value = settings.field;
      this.nestedPathInput.value = settings.nestedPath;
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
      
      this.targetWidget.label = chkInput(this.componentLabelInput,this.targetWidget.label);
      this.targetWidget.field = chkInput(this.fieldInput,this.targetWidget.field);
      this.targetWidget.nestedPath = chkInput(this.nestedPathInput,null);
      this.targetWidget.dropPane.set("title",this.targetWidget.label);
      this.targetWidget.search();
      this.hideDialog();
    }
  
  });
  
  return oThisClass;
});