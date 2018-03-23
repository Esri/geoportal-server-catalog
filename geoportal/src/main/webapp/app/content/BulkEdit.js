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
  "dojo/i18n!app/nls/resources",
  "app/common/ConfirmationDialog",
  "app/common/ModalDialog",
  "app/context/AppClient"],
function(declare, topic, appTopics, Templated, i18n, 
  ConfirmationDialog, ModalDialog, AppClient) {

  var oThisClass = declare([Templated], {
    
    i18n: i18n,
    templateString: "<div></div>",
    
    dialog: null,
    title: i18n.content.approvalStatus.caption,
    okLabel: i18n.content.updateButton,
    
    item: null,
    itemCard: null,
    _working: false,

    postCreate: function() {
      this.inherited(arguments);
    },
    
    execute: function(params) {
      if (this._working) return;
      var self = this;
      console.log("execute.params", params);
      var client = new AppClient();
      var dfd = client.bulkEdit(params.action,params.urlParams);
      dfd.then(function(response){
        console.log("execute.response",response);
        // TODO self.item.sys_owner_s = v;
        // wait for real-time update
        setTimeout(function(){
          if (params.isBulkUpdate) {
            topic.publish(appTopics.BulkUpdate,{});
          } else {
            // TODO topic.publish(appTopics.ItemOwnerChanged,{item:self.item});
          }
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
    },
    
    handleError: function(msg,error) {
      if (error) console.warn(error);
      if (!this.dialog) return;
      this.dialog.okCancelBar.enableOk();
      this.dialog.okCancelBar.showError(msg,false);
    },
    
    init: function() {
    },
    
    makeRequestParams: function() {
      return null;
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
          var params = self.makeRequestParams();
          if (params && params.confirmationText) {
            var cd = new ConfirmationDialog({
              title: self.title,
              content: params.confirmationText,
              okLabel: self.okLabel,
              hideOnOk: true,
              status: "danger"
            });
            cd.show().then(function(ok){
              if (ok) self.execute(params);
            });
          } else if (params) {
            self.execute(params);
          }
        }
      });
      this.dialog.show();
    }

  });

  return oThisClass;
});