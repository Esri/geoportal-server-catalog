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
  "dojo/topic",
  "app/context/app-topics",
  "app/content/BulkEdit",
  "dojo/text!./templates/SetField.html",
  "dojo/i18n!app/nls/resources",
  "app/content/ApplyTo"],
function(declare, topic, appTopics, BulkEdit, template, i18n, ApplyTo) {

  var oThisClass = declare([BulkEdit], {
    
    i18n: i18n,
    templateString: template,
    
    title: i18n.content.setField.caption,
    okLabel: i18n.content.updateButton,

    postCreate: function() {
      this.inherited(arguments);
      this.promptNode.innerHTML = i18n.content.setField.prompt;
    },
    
    init: function() {
      this.setNodeText(this.itemTitleNode,this.item.title);
      this.applyTo = new ApplyTo({
        item: this.item,
        itemCard: this.itemCard,
      },this.applyToNode);
    },
    
    makeRequestParams: function() {
      var params = {
        action: "setField",
        urlParams: {}
      };
      var field = this.fieldInput.value;
      if (typeof field === "string") field = field.trim();
      if (typeof field !== "string" || field.length === 0) {
        this.fieldInput.focus();
        return null;
      }
      if (field.toLowerCase().indexOf("sys_") === 0) {
        this.fieldInput.focus();
        return null;
      }
      params.urlParams.field = field; 
      var value = this.valueInput.value;
      if (typeof value === "string") value = value.trim();
      if (typeof value !== "string" || value.length === 0) {
        // TODO how to set a null or empty value
        this.valueInput.focus();
        return null;
      }
      params.urlParams.value = value; 
      this.applyTo.appendUrlParams(params);
      return params;
    }

  });

  return oThisClass;
});