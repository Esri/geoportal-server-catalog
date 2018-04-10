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
    title: "?Bulk Edit",
    okLabel: i18n.content.updateButton,
    
    item: null,
    itemCard: null,
    _working: false,

    postCreate: function() {
      this.inherited(arguments);
    },
    
    applyLocally: function(item) {
      topic.publish(appTopics.RefreshSearchResultPage,{
        searchPane: this.itemCard.searchPane
      });
    },
    
    execute: function(params) {
      if (this._working) return;
      var self = this;
      this._working = true;
      this.dialog.okCancelBar.showWorking(i18n.general.working,true);
      //console.log("execute.params", params);
      var client = new AppClient();
      var dfd = client.bulkEdit(params.action,params.urlParams,
        params.postData,params.dataContentType);
      dfd.then(function(response){
        //console.log("execute.response",response);
        // wait for real-time update
        setTimeout(function(){
          if (params.isBulkUpdate) {
            topic.publish(appTopics.BulkUpdate,{});
          } else {
            self.applyLocally(self.item);
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
    
    modalShown: function() {
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
      $(this.dialog.domNode).on('shown.bs.modal',function() {
        self.modalShown();
      });
      this.dialog.show();
    }

  });

  return oThisClass;
});