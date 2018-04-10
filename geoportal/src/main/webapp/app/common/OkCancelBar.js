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
        "dojo/query",
        "dojo/dom-class",
        "app/common/Templated",
        "dojo/text!./templates/OkCancelBar.html",
        "dojo/i18n!app/nls/resources"], 
function(declare, lang, on, query, domClass, Templated, template, i18n) {

  var oThisClass = declare([Templated], {
    
    i18n: i18n,
    templateString: template,

    okLabel: i18n.general.ok,
    cancelLabel: i18n.general.cancel,
    okIconClass: null,
    cancelIconClass: null,
    showOk: true,
    showCancel: true,
    
    postCreate: function() {
      this.inherited(arguments);
      if (!this.showOk) this.okButton.style.display = "none";
      if (!this.showCancel) this.cancelButton.style.display = "none";
      if (this.okIconClass) this.setOKIcon(this.okIconClass);
      if (this.cancelIconClass) this.setOKIcon(this.cancelIconClass);
      if (this.domNode.parentNode) this.domNode.parentNode.className += " has-footer";
    },
    
    postMixInProperties: function() {
      this.inherited(arguments);
      if (!this.okLabel) {
        this.okLabel = this.i18n.general.ok;
      }
      if (!this.cancelLabel) {
        this.cancelLabel = this.i18n.general.cancel;
      }
    },
    
    disableOk: function() {
      this.okButton.setAttribute("disabled", "disabled");
    },
    
    enableOk: function() {
      if (this.showOk) this.okButton.removeAttribute("disabled");
    },
    
    hideLoading: function() {
      this.loadingIndicator.style.display = "none";
    },
    
    hideWorking: function(bEnableOk) {
      this.hideLoading();
      this.workingArea.innerHTML= "";
      domClass.remove(this.workingArea,"text-danger");
      if (bEnableOk) this.enableOk();
    },
  
    onOkClicked: function(e) {},
   
    onCancelClicked: function(e) {},
    
    setCancelLabel: function(sLabel) {
    	this.cancelButton.innerHTML = sLabel;
    },

    setOKIcon: function(iconClass) {
      if (iconClass && typeof iconClass === "string") {
        var okIconNode = document.createElement("SPAN");
        okIconNode.className = iconClass;
        this.okButton.insertBefore(okIconNode,this.okButton.firstChild);
      }
    },
    
    setOkLabel: function(sLabel) {
    	this.okButton.innerHTML = sLabel;
    },
    
    showError: function(msg,error,bDisableOk) {
      if (bDisableOk) this.disableOk();
      this.hideLoading();
      this.workingArea.innerHTML = "";
      domClass.add(this.workingArea,"text-danger");
      this.setNodeText(this.workingArea,msg);
    },
    
    showLoading: function() {
      this.loadingIndicator.style.display = "inline-block";
    },
    
    showWorking: function(msg,bDisableOk) {
      if (bDisableOk) this.disableOk();
      this.showLoading();
      this.workingArea.innerHTML = "";
      domClass.remove(this.workingArea,"text-danger");
      this.setNodeText(this.workingArea,msg);
    }
    
  });
  
  return oThisClass;
});