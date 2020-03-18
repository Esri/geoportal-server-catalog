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
        "dojo/Deferred",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/topic",
        "app/context/app-topics",
        "app/common/Templated",
        "dojo/i18n!app/nls/resources",
        "app/context/AppClient",
        "app/context/metadata-editor",
        "app/common/ModalBase",
        "app/etc/util",
        "dojo/request"],
function(declare, lang, array, Deferred, domConstruct, domStyle, topic, appTopics, 
  Templated, i18n, AppClient, gxeConfig, ModalBase, util, dojoRequest) {

  return declare([Templated], {
    
    i18n: i18n,
    
    itemId: null,
    originalXml: null,
    wasSaved: false,
    
    postCreate: function() {
      this.inherited(arguments);
   
      var v = gxeConfig.gxeContext.basemapUrl;
      if (typeof v === "string" && v.length > 0) {
        gxeConfig.gxeContext.basemapUrl =  util.checkMixedContent(v);
      }
    },
    
    show: function() {
      var self = this, loadingDialog = null;
      var hideLoading = function() {
        if (loadingDialog) {
          try {loadingDialog.hide();} 
          catch(ex) {}
        }
      };
      if (!window.AppContext._gxeWasInitialized) {
        loadingDialog = new ModalBase({
          title: i18n.metadataEditor.caption,
          content: i18n.metadataEditor.loading
        });
        loadingDialog.closeIconNode.style.display = "none";
        loadingDialog.show();
      }
      self._polyfill(function(){
        window["require"]([
          "esri/dijit/metadata/context/GxeContext",
          "esri/dijit/metadata/context/GxeAdaptor",
          "app/gxe/editor/EditorDialog"],
        function(GxeContext,GxeAdaptor,EditorDialog) {
          var gxeContext = self._newContext(GxeContext);
          gxeContext.documentTypes.index = {};
          gxeContext.documentTypes.list = [];
          self._loadTypes(gxeContext,function(){
            window.AppContext._gxeWasInitialized = true;
            self._loadXml(gxeContext).then(function(){
              var gxeAdaptor = self._newAdaptor(GxeAdaptor);
              var dialog = new EditorDialog({
                gxeAdaptor: gxeAdaptor,
                gxeContext: gxeContext
              });
              hideLoading();
              dialog.show();
            }).otherwise(function(error){
              // TODO show error
              console.warn("LoadXml.error",error);
              hideLoading();
            });
          });
        });
      });
    },
    
    _loadType: function(gxeContext,typeDefs,callback) {
      var self = this;
      var typeDef = typeDefs.shift();
      window["require"]([typeDef.requiredPath],function(Type){
        var type = new Type({interrogationRules:typeDef.interrogationRules});
        gxeContext.documentTypes.index[type.key] = type;
        gxeContext.documentTypes.list.push(type);
        if (typeDefs.length === 0) {
          callback();
        } else {
          self._loadType(gxeContext,typeDefs,callback);
        }
      });
    },
    
    _loadTypes: function(gxeContext,callback) {      
      var typeDefs = [], allowedTypeKeys = gxeContext.allowedTypeKeys;      
      array.forEach(allowedTypeKeys,function(key) {
        array.some(gxeConfig.typeDefinitions,function(typeDef) {
          if (typeDef.key === key) {
            typeDefs.push(typeDef);
            return true;
          }
        });
      });
      this._loadType(gxeContext,typeDefs,function(){
        gxeContext.setAllowedTypeKeys(allowedTypeKeys);
        callback();
      });
    },
    
    _loadXml: function(gxeContext) {
      var self = this, dfd = new Deferred();
      if (typeof this.itemId === "string" && this.itemId.length > 0) {
        var client = new AppClient();
        client.readMetadata(this.itemId).then(function(response){
          if (typeof response === "string" && response.length > 0) {
            self.originalXml = response;
          }
          dfd.resolve();
        }).otherwise(function(error){
          dfd.reject(error);
        });
      } else {
        dfd.resolve();
      }
      return dfd;
    },
    
    _newAdaptor: function(GxeAdaptor) {
      var self = this;
      var gxeAdaptor = new GxeAdaptor({
        getAllowEditMetadata: function() {
          return true;
        },
        getAllowDeleteMetadata: function() {
          return false;
        },
        getOriginalXml: function() {
          return self.originalXml;
        },
        saveXml: function(gxeDocument, xmlString, bPushToItem) {
          var dfd = new Deferred();
          var client = new AppClient();
          //client.uploadMetadata(xmlString,self.itemId,null).then(function(response){
          self._save(xmlString,self.itemId).then(function(response){
            if (response && response.status) {
              self.itemId = response.id;
              // wait for real-time update
              setTimeout(function(){
                topic.publish(appTopics.ItemUploaded,{response:response});
              },1500);
            } else {
              // TODO is this an error?
            }
            dfd.resolve();
          }).otherwise(function(error){
             // TODO Are there errors to show?
            console.warn("SaveMetadata.error",error);
            dfd.reject(error);
            /*
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
            */
          });
          return dfd;
        }
      });
      return gxeAdaptor;
    },
    
    _newContext: function(GxeContext) {
      var params = {
        allowViewXml: false,
        allowSaveAndClose: false,
        arcgisMode: false,
        startupTypeKey: null,
        showValidateButton: false,
        validateOnSave: true,
        filePromptText: i18n.metadataEditor.filePrompt,
        asTemplateText: i18n.metadataEditor.asTemplatePrompt,
        xmlViewOnlyText: i18n.metadataEditor.xmlViewOnly
      };
      return new GxeContext(lang.mixin(params,gxeConfig.gxeContext));
    },
    
    _save: function(xmlString,itemId) {
      var client = new AppClient();
      var url = client.getRestUri()+"/metadata/item";
      if (typeof itemId === "string" && itemId.length > 0) {
        url += "/"+encodeURIComponent(itemId);
      }
      url = client.appendAccessToken(url);
      var data = {
        app_editor_s: "gxe",
        xml: xmlString
      };
      var headers = {"Content-Type": "application/json"};
      var info = {handleAs:"json",headers:headers,data:JSON.stringify(data)};
      return dojoRequest.put(url,info);
    },
    
    _polyfill: function(callback) {
      window["require"]([
        "esri/dijit/metadata/editor/util/LoadDocumentPane",
        "esri/dijit/metadata/editor/PrimaryToolbar",
        "esri/dijit/metadata/context/DescriptorMixin",
        "esri/dijit/metadata/types/inspire/srv/ServiceCategoryOptions",
        "dojo/i18n!esri/dijit/metadata/nls/i18nBase",
        "dojo/i18n!esri/dijit/metadata/nls/i18nArcGIS",
        "dojo/i18n!esri/dijit/metadata/nls/i18nFgdc",
        "dojo/i18n!esri/dijit/metadata/nls/i18nIso",
        "dojo/i18n!esri/dijit/metadata/nls/i18nInspire",
        "dojo/i18n!esri/dijit/metadata/nls/i18nGemini"],
      function(LoadDocumentPane, PrimaryToolbar, DescriptorMixin, ServiceCategoryOptions,
        i18nBase, i18nArcGIS, i18nFgdc, i18nIso, i18nInspire, i18nGemini){
        
        if (!ServiceCategoryOptions.prototype.xtnWasExtended) {
          lang.extend(ServiceCategoryOptions, {
            xtnWasExtended: true,
            _isGxeOption: false,
            _isGxeOptions: true,
            fetchOptionWidgets: function() {
              var deferred = new Deferred();
              var optionsWidget = null, optionWidgets = [];
              array.forEach(this.getChildren(), function(widget) {
                if(widget._isGxeOptions) {
                  optionsWidget = widget;
                } else if(widget._isGxeOption) {
                  optionWidgets.push(widget);
                }
              });
              if(optionsWidget === null) {
                deferred.resolve(optionWidgets);
                return deferred;
              } else {
                return optionsWidget.fetchOptionWidgets();
              }
            }
          });
        }
        
        if (!DescriptorMixin.prototype.xtnWasExtended) {
          //console.warn("Extending DescriptorMixin...",DescriptorMixin);
          lang.extend(DescriptorMixin, {
            xtnWasExtended: true,
            i18nArcGIS: i18nArcGIS,
            i18nFgdc: i18nFgdc,
            i18nIso: i18nIso,
            i18nInspire: i18nInspire,
            i18nGemini: i18nGemini
          });
          lang.extend(DescriptorMixin, {
            postMixInProperties: function() {
              //this.inherited(arguments);
              if (typeof this.templateString === "string") {
                if (this.templateString.indexOf("sngdate") > 0) {
                  var v = this.templateString;
                  if (v.indexOf("descript") > 0 && v.indexOf("caldate") > 0 && v.indexOf("mdattim") > 0) {
                    this.templateString = this.templateString.replace("target:'descript'","target:'timeinfo'");
                  }
                }
              }
            }
          });
        }
     
        /*
        if (!LoadDocumentPane.prototype.xtnWasExtended) {
          //console.warn("Extending LoadDocumentPane...",LoadDocumentPane);
          lang.extend(LoadDocumentPane, {
            xtnWasExtended: true,
            arcgisMode: false,
            startup: function() {
              //console.warn("LoadDocumentPane.startup",this);
              try {
                if (this.typeTab) this.typeTab.domNode.style.display = "";
                if (this.filePrompt) this.filePrompt.innerHTML = i18n.metadataEditor.filePrompt;
                if (this.labelNode) this.labelNode.innerHTML = i18n.metadataEditor.asTemplatePrompt;
                //if (this.typeTab) this._setMode("type");
              } catch(ex) {}
            },
            _addDocType: function(docType) {
              var nd = domConstruct.create("div", {}, this.typesNode);
              var ndType = domConstruct.create("div", {
                "class": "gxeClickableText gxeLine",
                onclick: lang.hitch(this, function() {
                  if(!this._working) {
                    this._loadDocType(docType);
                  }
                })
              }, nd);
              if (this.arcgisMode) {
                this.setI18nNodeText(ndType, i18nBase.editor.load.templatePrompt);
              } else {
                this.setI18nNodeText(ndType, docType.caption);
              }
            },
            _showUnrecognizedXml: function(message) {
              if (this.arcgisMode) {
                this.setNodeText(this.importWarningNode,i18nBase.editor.load.importWarning);
              } else {
                this.setNodeText(this.importWarningNode,message);
              }
              this.importWarningSection.style.display = "block";
              if(this.dialogBroker && this.dialogBroker.okCancelBar) {
                this.dialogBroker.okCancelBar.hideWorking();
              }
            }
          });
        }
        */

        /*
        if (!PrimaryToolbar.prototype.xtnWasExtended) {
          //console.warn("Extending PrimaryToolbar...",PrimaryToolbar.prototype);
          PrimaryToolbar.prototype.xtnUpdateUI = PrimaryToolbar.prototype.updateUI;
          lang.extend(PrimaryToolbar, {
            xtnWasExtended: true,
            updateUI: function() {
              this.xtnUpdateUI();
              this.saveAndCloseButton.style.display = "none";
            },
            _initializeView: function() {
              
              var allowEdit = this.editor.gxeAdaptor.getAllowEditMetadata();
              var allowView = this.editor.gxeContext.allowView;
              var allowViewXml = this.editor.gxeContext.allowViewXml;
              var startupTypeKey = this.editor.gxeContext.startupTypeKey;
              var startupDocType = null;
              if (typeof startupTypeKey === "string" && startupTypeKey.length > 0) {
                if (this.editor.gxeContext.allowedTypeKeys.indexOf(startupTypeKey) !== -1) {
                  array.some(this.editor.gxeContext.documentTypes.list,function(docType) {
                    if (docType.key === startupTypeKey) {
                      startupDocType = docType;
                      return true;
                    }
                  });
                }
              }
              
              var enableView = lang.hitch(this, function(mode, bNoMetadata) {
                domStyle.set(this.commonToolset, "display", "");
                if(bNoMetadata && allowEdit) {
                  this._setMode("edit");
                  //var startupDocType = this.editor.gxeContext.filterDocumentTypes()[0];
                  if (startupDocType) {
                    //console.warn("startupDocType",startupDocType.key);
                    this._fadeOut(i18nBase.editor.primaryToolbar.loadingDocument, lang.hitch(this, function() {
                      this.editor.loadEditor(startupDocType, null, true, false).then(
                        lang.hitch(this, function() {
                          this._fadeIn();
                        }),
                        lang.hitch(this, function(err) {
                          this._fadeIn();
                          var msg = i18nBase.editor.primaryToolbar.errors.errorLoadingDocument;
                          this._handleError(msg, err, true);
                        })
                      );
                    }));
                  } else {
                    this._fadeIn(lang.hitch(this, function() {
                      setTimeout(lang.hitch(this,function(){
                        this._showLoadDialog(i18nBase.editor.load.noMetadata);
                      }),500);
                    }));
                  }
                } else {
                  if (!allowView && !allowViewXml && allowEdit) {
                    mode = "edit";
                  }
                  this._setMode(mode);
                  this._fadeIn();
                }
              });

              var docPane = this.editor.viewDocumentPane;
              var docType, xmlString = null, xmlDoc;
              var info = this._parseXml(this.editor.gxeAdaptor.getOriginalXml());
              if(info.documentType) {
                docType = info.documentType;
                xmlString = info.xmlString;
                xmlDoc = info.xmlDocument;
                if (allowEdit && !allowView) {
                  domStyle.set(this.commonToolset, "display", "");
                  this._setMode("edit");
                  this._loadEditor();
                  return;
                }
              } else {
                if(info.xmlDocument) {
                  var xmlViewOnlyText = i18nBase.editor.xmlViewOnly;
                  if (typeof this.editor.gxeContext.xmlViewOnlyText === "string") {
                    xmlViewOnlyText = this.editor.gxeContext.xmlViewOnlyText;
                  }
                  if (!allowView && allowEdit) {
                    this.editor.editDocumentPane.showMessage(xmlViewOnlyText);
                  } else {
                    docPane.showMessage(xmlViewOnlyText);
                  }
                  enableView("viewXml");
                } else {
                  docPane.showMessage(i18nBase.editor.noMetadata);
                  enableView("view", true);
                }
                return;
              }

              this._fadeOut(i18nBase.editor.primaryToolbar.initializing, lang.hitch(this, function() {
                this.editor.loadView(docType, xmlDoc, true).then(
                  lang.hitch(this, function(gxedoc) {
                    docPane.xmlString = xmlString;
                    this.editor.xmlPane.setXml(xmlString, gxedoc.originalTitle);
                    enableView("view");
                  }),
                  lang.hitch(this, function(err) {
                    enableView("view");
                    var msg = i18nBase.editor.primaryToolbar.errors.errorGeneratingView;
                    this._handleError(msg, err, true);
                  })
                );
              }));
            }
          });
        }
        */
        
        callback();
      });
    }

  });

});