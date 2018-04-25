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
  "dojo/dom-class",
  "dojo/topic",
  "app/context/app-topics",
  "app/content/BulkEdit",
  "dojo/text!./templates/SetField.html",
  "dojo/i18n!app/nls/resources",
  "app/content/ApplyTo"],
function(declare, lang, array, domClass, topic, appTopics, BulkEdit, 
  template, i18n, ApplyTo) {

  var oThisClass = declare([BulkEdit], {
    
    i18n: i18n,
    templateString: template,
    
    title: i18n.content.setField.caption,
    okLabel: i18n.content.updateButton,

    postCreate: function() {
      this.inherited(arguments);
      //this.advancedPromptNode.innerHTML = i18n.content.setField.advanced.prompt;
    },
    
    init: function() {
      this.setNodeText(this.itemTitleNode,this.item.title);
      this.applyTo = new ApplyTo({
        item: this.item,
        itemCard: this.itemCard,
      },this.applyToNode);
      
      var value, tags = this.item["user_tags_s"];
      if (typeof tags === "string") {
        value = tags;
      } else if (lang.isArray(tags)) {
        value = "";
        array.forEach(tags,function(v){
          if (value.length > 0) value += ", ";
          value += v;
        });
      }
      if (typeof value === "string") this.tagsValueInput.value = value;
    },
    
    makeRequestParams: function() {
      var params = {
        action: "setField",
        urlParams: {}
      };
      var field, value, values;
      
      if (domClass.contains(this.tagsPanel,"active")) {
        field = "user_tags_s";
        value = this.tagsValueInput.value;
        if (value.indexOf("[") !== 0) {
          values = [];
          array.forEach(value.split(","),function(v){
            v = v.trim();
            if (v.length > 0) values.push(v);
          });
          value = JSON.stringify(values);
        }
      } else if (domClass.contains(this.advancedPanel,"active")) {
        field = this.advancedFieldInput.value;
        if (typeof field === "string") field = field.trim();
        if (typeof field !== "string" || field.length === 0) {
          this.advancedFieldInput.focus();
          return null;
        }
        if (field.toLowerCase().indexOf("sys_") === 0) {
          this.advancedFieldInput.focus();
          return null;
        }
        value = this.advancedValueInput.value;
        value = value.trim(); // TODO?
      } else {
        return null;
      }
      
      params.urlParams.field = field;
      params.urlParams.value = value;
      this.applyTo.appendUrlParams(params);
      return params;
    }

  });

  return oThisClass;
});