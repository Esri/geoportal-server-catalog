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
  "dojo/dom-construct",
  "dojo/topic",
  "app/context/app-topics",
  "app/content/BulkEdit",
  "dojo/text!./templates/GroupAccess.html",
  "dojo/i18n!app/nls/resources",
  "app/content/ApplyTo"],
function(declare, domConstruct, topic, appTopics, BulkEdit, template, i18n, ApplyTo) {

  var oThisClass = declare([BulkEdit], {
    
    i18n: i18n,
    templateString: template,
    
    title: i18n.content.groupAccess.caption,
    okLabel: i18n.content.updateButton,

    postCreate: function() {
      this.inherited(arguments);
    },
    
    addGroup: function(group) {
      return;
      var li = domConstruct.create("li",{
      },this.groupsNode,"last");
      var lbl = domConstruct.create("label",{
        className: "checkbox-inline"
      },li,"last");
      var chk = domConstruct.create("input",{
        type: "checkbox",
        value: group.id
      },lbl,"last");
      var span = domConstruct.create("span",{
        innerHTML: group.name
      },lbl,"last");
    },
    
    init: function() {
      this.setNodeText(this.itemTitleNode,this.item.title);
      
      var v = this.item["sys_access_s"];
      if (v === "private") this.privateNode.checked = true;
      else this.publicNode.checked = true;
      
      var groups = [];
      for (var i=0;i<10;i++) {
        var id = "grp1";
        var name = "Group 1";
        this.addGroup({
          id: id,
          name: name
        })
      }
      
      this.applyTo = new ApplyTo({
        item: this.item,
        itemCard: this.itemCard,
      },this.applyToNode);
    },
    
    makeRequestParams: function() {
      var params = {
        action: "setAccess",
        urlParams: {}
      };
    
      var access = "public";
      if (this.privateNode.checked) access = "private";
      params.urlParams.access = access;
      
      this.applyTo.appendUrlParams(params);
      return params;
    }

  });

  return oThisClass;
});