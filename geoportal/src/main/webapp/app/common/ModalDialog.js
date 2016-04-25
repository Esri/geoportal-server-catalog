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
        "dojo/i18n!app/nls/resources",
        "app/common/ModalBase",
        "app/common/OkCancelBar"], 
function(declare, lang, i18n, ModalBase, OkCancelBar) {

  var oThisClass = declare([ModalBase], {
    
    i18n: i18n,
    
    showOkCancelBar: true,
    hideOnOk: false,
    okLabel: null,
    cancelLabel: null,
    showOk: true,
    showCancel: true,
    
    postCreate: function() {
      var self = this;
      if (this.showOkCancelBar) {
        var okCancel = new OkCancelBar({
          okLabel: this.okLabel,
          cancelLabel: this.cancelLabel,
          showOk: this.showOk,
          showCancel: this.showCancel,
          onOkClicked: function() {
            self.onOkClicked();
            if (self.hideOnOk) self.hide();
          },
          onCancelClicked: function() {
            self.onCancelClicked();
            self.hide();
          },
        });
        this.footer = okCancel.domNode;
        this.okCancelBar = okCancel;
      }
      this.inherited(arguments);
    },
    
    onCancelClicked: function() {},
    onOkClicked: function() {},

  });

  return oThisClass;
});