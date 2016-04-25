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
        "dojo/on",
        "dojo/keys",
        "app/common/Templated",
        "dojo/text!./templates/SignIn.html",
        "dojo/i18n!app/nls/resources",
        "app/common/ModalDialog"],
function(declare, lang, on, keys, Templated, template, i18n, ModalDialog) {

  var oThisClass = declare([Templated], {
    
    i18n: i18n,
    templateString: template,
    
    dialog: null,
    title: i18n.login.caption,
    okLabel: i18n.login.label,

    postCreate: function() {
      this.inherited(arguments);
    },
    
    execute: function() {
      var self = this;
      var u = this.und.value;
      var p = this.pnd.value;
      if (u !== null && u.length > 0 && p !== null && p.length > 0) {
        this.dialog.okCancelBar.showWorking(i18n.general.working,true);
        AppContext.appUser.signIn(u,p).then(function(){
          self.dialog.hide();
        }).otherwise(function(error){
          if (typeof error === "string") self.handleError(error);
          else self.handleError(i18n.general.error,error);
        });
      } else {
        self.handleError(i18n.login.incomplete);
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
      this.own(on(this.pnd,"keyup",function(evt) {
        if (evt.keyCode === keys.ENTER) self.execute();
      }));
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
          self.execute();
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