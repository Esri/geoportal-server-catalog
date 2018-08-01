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
        "dojo/aspect",
        "dojo/dom-construct",
        "dojo/topic",
        "app/context/app-topics",
        "app/common/Templated",
        "dojo/text!./templates/UploadMetadata.html",
        "dojo/i18n!app/nls/resources",
        "app/common/ModalDialog",
        "app/context/AppClient"],
function(declare, lang, array, aspect, domConstruct, topic, appTopics, Templated, 
    template, i18n, ModalDialog, AppClient) {

  var oThisClass = declare([Templated], {
    
    i18n: i18n,
    templateString: template,
    
    itemId: null,
    
    _inputFileNode: null,
    _filename: null,
    _text: null,
    _working: false,

    postCreate: function() {
      this.inherited(arguments);
    },
    
    _executeUpload: function(dialog,text,filename) {
      if (this._working) return;
      this._working = true;
      var self = this;
      dialog.okCancelBar.showWorking(i18n.general.uploading,true);
      domConstruct.empty(this.validationErrorsNode);
      
      var client = new AppClient();
      client.uploadMetadata(text,this.itemId,filename).then(function(response){
        if (response && response.status) {
          // wait for real-time update
          setTimeout(function(){
            topic.publish(appTopics.ItemUploaded,{response:response});
            dialog.hide();
          },1500);
        } else {
          self._working = false;
          dialog.okCancelBar.enableOk();
          dialog.okCancelBar.showWorking(i18n.general.error,false);
        }
      }).otherwise(function(error){
        console.warn("UploadMetadata.error",error);
        var msg = i18n.general.error;
        var err = client.checkError(error);
        if (err && err.message) {
          msg = self.checkForErrorTranslation(err.message);
        }
        if (err && err.validationErrors) {
          self._loadValidationErrors(err.validationErrors);
        }
        self._working = false;
        dialog.okCancelBar.enableOk();
        dialog.okCancelBar.showError(msg,false);
      });
     
    },
    
    _loadValidationErrors: function(validationErrors) {
      var self = this, parentNode = this.validationErrorsNode;
      domConstruct.empty(this.validationErrorsNode);
      array.forEach(validationErrors,function(err){
        var details = "";
        if (err.details) details = lang.trim(err.details);
        if (typeof details === "string" && details.length > 0) {
          details = self.checkForErrorTranslation(details);
          var nd = domConstruct.create("div",{},parentNode);
          self.setNodeText(nd,details);
        }
      });
    },
    
    _loadXmlFile: function(evt,dialog) {
      this._text = null;
      dialog.okCancelBar.disableOk();
      dialog.okCancelBar.showWorking("");
      domConstruct.empty(this.validationErrorsNode);
      if (!evt || !evt.target || !evt.target.files) return;
      var file = null, files = evt.target.files;
      if (files && (files.length === 1)) file = files[0];
      if (!file) return; 
      
      var reader = new FileReader();
      this.own(aspect.after(reader,"onload",lang.hitch(this,function(e) {
        if (e && e.target && e.target.result) {
          var text = e.target.result; 
          this._filename = file.name;
          this._text = text;
          if (!this._working) {
            dialog.okCancelBar.enableOk();
            dialog.okCancelBar.hideWorking(true);
          }
        } else {
          // TODO message here?
        }
      }),true));
      reader.readAsText(file);
    },
 
    show: function() {
      var self = this, dialog = null;
      
      var showErr = function(msg,error) {
        dialog.okCancelBar.enableOk();
        dialog.okCancelBar.showWorking(msg,false);
        if (error) console.warn(error);
      };
      
      if (FileReader) {
        var nd = domConstruct.create("div", {},this.fileContainerNode);
        this._inputFileNode = domConstruct.create("input", {
          "type": "file",
          onchange: function(evt) {self._loadXmlFile(evt,dialog);}
        },nd);
      }
      
      dialog = new ModalDialog({
        content: this.domNode,
        title: i18n.content.uploadMetadata.caption,
        okLabel: i18n.content.uploadMetadata.button,
        onHide: function() {
          self.destroyRecursive(false);
        }, 
        onOkClicked: function() {
          self._executeUpload(dialog,self._text,self._filename);
        }
      });
      dialog.okCancelBar.disableOk();
      dialog.show();
    }

  });

  return oThisClass;
});