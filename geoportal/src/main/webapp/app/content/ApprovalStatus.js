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
  "app/common/Templated",
  "dojo/text!./templates/ApprovalStatus.html",
  "dojo/i18n!app/nls/resources",
  "app/common/ConfirmationDialog",
  "app/common/ModalDialog",
  "app/context/AppClient",
  "app/content/ApplyTo"],
function(declare, topic, appTopics, Templated, template, i18n, 
  ConfirmationDialog, ModalDialog, AppClient, ApplyTo) {

  var oThisClass = declare([Templated], {
    
    i18n: i18n,
    templateString: template,
    
    dialog: null,
    title: i18n.content.approvalStatus.caption,
    okLabel: i18n.content.updateButton,
    
    item: null,
    _working: false,

    postCreate: function() {
      this.inherited(arguments);
    },
    
    execute: function(bulk) {
      if (this._working) return;
      var self = this;
      var v = this.newOwnerNode.value;
      if (v !== null) v = lang.trim(v);
      if (v !== null && v.length > 0 ) {
        this._working = true;
        this.dialog.okCancelBar.showWorking(i18n.general.working,true);
        var dfd, client = new AppClient();
        if (bulk) {
          dfd = client.bulkChangeOwner(this.item.sys_owner_s,v);
        } else {
          dfd = client.changeOwner(this.item._id,v);
        }
        dfd.then(function(response){
          self.item.sys_owner_s = v;
          // wait for real-time update
          setTimeout(function(){
            if (bulk) topic.publish(appTopics.BulkUpdate,{});
            else topic.publish(appTopics.ItemOwnerChanged,{item:self.item});  
            self.dialog.hide();
          },1500);
        }).otherwise(function(error){
          self._working = false;
          var msg = i18n.general.error;
          var err = client.checkError(error);
          if (err && err.message) {
            msg = self.checkForErrorTranslation(err.message);
          }
          self.handleError(msg,error);
        });
      } else {
        this.newOwnerNode.focus();
        //self.handleError(?required field?);
      }
    },
    
    handleError: function(msg,error) {
      if (error) console.warn(error);
      if (!this.dialog) return;
      this.dialog.okCancelBar.enableOk();
      this.dialog.okCancelBar.showError(msg,false);
    },
    
    init: function() {
      var self = this;
      this.setNodeText(this.itemTitleNode,this.item.title);
      this.applyTo = new ApplyTo({
        item: this.item
      },this.applyToNode);
    },
 
    show: function() {
      var self = this;
      this.init();
      this.dialog = new ModalDialog({
        content: this.domNode,
        title: this.title,
        okLabel: this.okLabel,
        onHide: function() {
          self.destroyRecursive(false);
        }, 
        onOkClicked: function() {
          if (self._working) return;
          var v = self.newOwnerNode.value;
          if (v === null || lang.trim(v).length === 0) {
            self.newOwnerNode.focus();
            return;
          }
          if (AppContext.appConfig.allowBulkChangeOwner && self.bulkCheckbox.checked) {
            var cd = new ConfirmationDialog({
              title: self.title,
              content: self.bulkLabelNode.innerHTML,
              okLabel: self.okLabel,
              hideOnOk: true,
              status: "danger"
            });
            cd.show().then(function(ok){
              if (ok) self.execute(true);
            });
          } else {
            self.execute(false);
          }
        }
      });
      this.dialog.show();
    }

  });

  return oThisClass;
});