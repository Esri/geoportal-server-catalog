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
  "dojo/dom-construct",
  "dojo/topic",
  "app/context/app-topics",
  "app/content/BulkEdit",
  "dojo/text!./templates/SetAccess.html",
  "dojo/i18n!app/nls/resources",
  "app/content/ApplyTo"],
function(declare, lang, array, domConstruct, topic, appTopics, BulkEdit, 
  template, i18n, ApplyTo) {

  var oThisClass = declare([BulkEdit], {
    
    i18n: i18n,
    templateString: template,
    
    title: i18n.content.setAccess.caption,
    okLabel: i18n.content.updateButton,
    
    _checkboxes: null,
    _localAccess: null,
    _localGroups: null,

    postCreate: function() {
      this.inherited(arguments);
      this._checkboxes = [];
    },
    
    applyLocally: function(item) {
      //item["sys_access_s"] = this._localAccess;
      //item["sys_access_groups_s"] = this._localGroups;
      //topic.publish(appTopics.ItemAccessChanged,{item:item});
      topic.publish(appTopics.RefreshSearchResultPage,{
        searchPane: this.itemCard.searchPane
      });
    },
    
    addGroup: function(group,checked) {
      var self = this;
      var li = domConstruct.create("li",{
      },this.groupsNode,"last");
      var lbl = domConstruct.create("label",{
        className: "checkbox-inline"
      },li,"last");
      var chk = domConstruct.create("input",{
        type: "checkbox",
        value: group.id,
        onchange: function() {
          self.updateCount();
        }
      },lbl,"last");
      if (checked) chk.checked = true;
      var span = domConstruct.create("span",{
        innerHTML: group.name
      },lbl,"last");
      this._checkboxes.push(chk);
    },
    
    clear: function() {
      array.forEach(this._checkboxes,function(chk){
        if (chk.checked) chk.checked = false;
      });
      this.updateCount();
    },
    
    init: function() {
      var self = this;
      this.setNodeText(this.itemTitleNode,this.item.title);
      
      var v = this.item["sys_access_s"];
      if (v === "private") this.privateNode.checked = true;
      else this.publicNode.checked = true;
      
      var orgId = null;
      if (AppContext.appUser && AppContext.appUser.arcgisPortalUser && AppContext.appUser.arcgisPortalUser.orgId) {
        orgId = AppContext.appUser.arcgisPortalUser.orgId;
      }
      
      var itemGroups = this.item["sys_access_groups_s"];
      var groups = AppContext.appUser.getGroups();
      if (lang.isArray(groups)) {
        groups = groups.slice(0); // shallow clone
        groups.sort(function(groupA,groupB){ 
          try {
            if (groupA.id===orgId) {
              return -1;
            }
            if (groupB.id===orgId) {
              return 1;
            }
            var a = groupA.name.toLowerCase();
            var b = groupB.name.toLowerCase();
            if (a === b) return 0;
            if (a > b) return 1;
          } catch(ex) {}
          return -1;
        });
      }
      array.forEach(groups,function(group){
        var checked = false;
        if (lang.isArray(itemGroups)) {
          checked = array.some(itemGroups,function(groupId){
            return (group.id === groupId);
          });
        } else if (group.id === itemGroups) {
          checked = true;
        }
        self.addGroup(group,checked);
      });
      
      this.applyTo = new ApplyTo({
        item: this.item,
        itemCard: this.itemCard,
      },this.applyToNode);
      
      this.updateCount();
    },
    
    makeRequestParams: function() {
      var params = {
        action: "setAccess",
        urlParams: {}
      };
    
      var selectedGroups = [];
      array.forEach(this._checkboxes,function(chk){
        if (chk.checked) selectedGroups.push(chk.value);
      });
      if (selectedGroups.length > 0) {
        params.urlParams.group = selectedGroups;
      }
      this._localGroups = selectedGroups;
      
      var access = "public";
      if (this.privateNode.checked) access = "private";
      this._localAccess = params.urlParams.access = access;
      
      this.applyTo.appendUrlParams(params);
      return params;
    },
    
    updateCount: function() {
      var n = 0, hasGroups = false, msg = "";
      array.forEach(this._checkboxes,function(chk){
        hasGroups = true;
        if (chk.checked) n++;
      });
      if (hasGroups) {
        var pattern = i18n.content.setAccess.countPattern;
        msg = pattern.replace("{count}",n);
      }
      this.countNode.innerHTML = msg;
    }

  });

  return oThisClass;
});