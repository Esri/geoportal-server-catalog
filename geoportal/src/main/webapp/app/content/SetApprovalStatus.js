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
  "dojo/text!./templates/SetApprovalStatus.html",
  "dojo/i18n!app/nls/resources",
  "app/content/ApplyTo"],
function(declare, topic, appTopics, BulkEdit, template, i18n, ApplyTo) {

  var oThisClass = declare([BulkEdit], {
    
    i18n: i18n,
    templateString: template,
    
    title: i18n.content.setApprovalStatus.caption,
    okLabel: i18n.content.updateButton,
    
    _localValue: null,

    postCreate: function() {
      this.inherited(arguments);
    },
    
    applyLocally: function(item) {
      //item["sys_approval_status_s"] = this._localValue;
      //topic.publish(appTopics.ItemApprovalStatusChanged,{item:item});
      topic.publish(appTopics.RefreshSearchResultPage,{
        searchPane: this.itemCard.searchPane
      });
    },
    
    init: function() {
      this.setNodeText(this.itemTitleNode,this.item.title);
      if (!AppContext.appUser.isAdmin()) {
        $(this.statusSelect).find("option[value='approved']").remove();
        $(this.statusSelect).find("option[value='reviewed']").remove();
        $(this.statusSelect).find("option[value='disapproved']").remove();
      }
      var v = this.item["sys_approval_status_s"];
      if (typeof v === "string" && v.length > 0) {
        $(this.statusSelect).val(v);
      }
      this.applyTo = new ApplyTo({
        item: this.item,
        itemCard: this.itemCard,
      },this.applyToNode);
    },
    
    makeRequestParams: function() {
      var params = {
        action: "setApprovalStatus",
        urlParams: {}
      };
      var status = $(this.statusSelect).val();
      if (typeof status !== "string" || status === "" || status === "none") {
        this.statusSelect.focus();
        return null;
      }
      this._localValue = params.urlParams.approvalStatus = status;
      this.applyTo.appendUrlParams(params);
      return params;
    }

  });

  return oThisClass;
});