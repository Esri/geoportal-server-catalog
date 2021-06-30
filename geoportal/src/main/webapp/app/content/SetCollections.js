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
  "dojo/text!./templates/SetCollections.html",
  "dojo/i18n!app/nls/resources",
  "app/content/ApplyTo"],
function(declare, topic, appTopics, BulkEdit, template, i18n, ApplyTo) {

  var oThisClass = declare([BulkEdit], {
    
    i18n: i18n,
    templateString: template,
    
    title: i18n.content.setCollections.caption,
    okLabel: i18n.content.updateButton,
    
    _localValue: null,

    postCreate: function() {
      this.inherited(arguments);
    },
    
    applyLocally: function(item) {
      topic.publish(appTopics.RefreshSearchResultPage,{
        searchPane: this.itemCard.searchPane
      });
    },
    
    init: function() {
      this.setNodeText(this.itemTitleNode,this.item.title);
      var v = this.item["src_collections_s"];
      if (typeof v === "string" && v.length > 0) {
        $(this.collectionsValueInput).val(v);
      } else if (Array.isArray(v)) {
        $(this.collectionsValueInput).val(v.join(","));
      }
      this.applyTo = new ApplyTo({
        item: this.item,
        itemCard: this.itemCard,
      },this.applyToNode);
    },
    
    makeRequestParams: function() {
      var params = {
        action: "setCollections",
        urlParams: {}
      };
      var status = $(this.collectionsValueInput).val();
      if (typeof status !== "string" || status === "" || status === "none") {
        this.collectionsValueInput.focus();
        return null;
      }
      this._localValue = params.urlParams.collections = status;
      this.applyTo.appendUrlParams(params);
      return params;
    }

  });

  return oThisClass;
});