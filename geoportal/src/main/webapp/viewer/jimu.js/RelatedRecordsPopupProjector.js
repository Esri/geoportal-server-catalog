///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/on',
  'dojo/query',
  'dojo/Deferred',
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  'esri/undoManager',
  'esri/OperationBase',
  'esri/tasks/RelationshipQuery',
  'esri/dijit/Popup',
  'esri/dijit/PopupMobile',
  'esri/graphicsUtils',
  'esri/dijit/PopupTemplate',
  'jimu/utils',
  'jimu/ConfigManager',
  'jimu/dijit/DropdownMenu',
  'jimu/LayerInfos/LayerInfos'
  ], function(declare, lang, array, html, on, query, Deferred, _WidgetBase, _TemplatedMixin,
  UndoManager, OperationBase, RelationshipQuery, Popup, PopupMobile, graphicsUtils, PopupTemplate,
  jimuUtils, ConfigManager, DropdownMenu, jimuLayerInfos) {
    var clazz = declare([_WidgetBase, _TemplatedMixin], {
      baseClass: "related-records-popup-projector",
      templateString: "<div>" +
                      "<div class='operation-box' data-dojo-attach-point='operationBox' style='display: none'>" +
                        "<div class='previos-btn feature-action' data-dojo-attach-point='previouBtn'" +
                            "data-dojo-attach-event='click:_onPreviouBtnClick'>" +
                        "</div>" +
                        "<div class='operation-title' data-dojo-attach-point='operationTitle'>abc</div>" +
                        "<div class='add-new-btn' data-dojo-attach-point='addNewBtn'></div>" +
                      "</div>" +
                      "<div class='content-box' data-dojo-attach-point='contentBox'></div>" +
                    "</div>",
      popup: null,
      popupManager: null,
      undoManager: null,
      originalFeature: null,
      originalJimuLayerInfo: null,
      _temporaryData: null,

      postCreate: function() {
        this.undoManager = new UndoManager();
        this.layerInfosObj = jimuLayerInfos.getInstanceSync();
        this.originalJimuLayerInfo = this.layerInfosObj.getLayerInfoById(this.originalFeature.getLayer().id);
        this._temporaryData = {
          eventHandles: [],
          dijits: []
        };

        /*
        if(this.popup.declaredClass === "esri.dijit.Popup") {
          this._tempPopup = new Popup({}, html.create('div'));
        } else {
          this._tempPopup = new PopupMobile({}, html.create('div'));
        }
        */

        if(window.isRTL) {
          html.addClass(this.previouBtn, 'icon-arrow-forward');
        } else {
          html.addClass(this.previouBtn, 'icon-arrow-back');
        }

        // create first operation
        var operation = this._createOperation({
          feature: this.originalFeature,
          oriJimuLayerInfo: this.originalJimuLayerInfo
        });

        // show related tables
        this.showRelatedTables(operation);

        if(this.popup.declaredClass === "esri.dijit.Popup") {
          this.popupUIController = new clazz.PopupUIController(this);
        } else {
          this.popupUIController = new clazz.PopupMobileUIController(this);
        }
        // place domNode.
        this.popupUIController.addDomNode(this.domNode);

        /*
        setTimeout(lang.hitch(this, function() {
          html.place(this.domNode, this._getRefDomNode(), "after");
        }), 1);
        */
      },

      destroy: function() {
        this._clearPage();
        this.undoManager.destroy();
        this.popupUIController.destroy();
        //this._tempPopup.destroy();
        this.inherited(arguments);
      },

      /***************************
       * Methods for prepare data
       **************************/
      _getRelatedTableInfoArray: function(operation) {
        var oriJimuLayerInfo = operation.data.oriJimuLayerInfo;
        var def = new Deferred();
        //var relatedTableInfoArray = [];
        oriJimuLayerInfo.getRelatedTableInfoArray()
        .then(lang.hitch(this, function(layerInfoArray) {
          /*
          array.forEach(layerInfoArray, function(layerInfo) {
            if(this._findTableInfoFromTableInfosParam(layerInfo)) {
              relatedTableInfoArray.push(layerInfo);
            }
          }, this);
          def.resolve(relatedTableInfoArray);
          */
          def.resolve(layerInfoArray);
        }));
        return def;
      },

      _getOriRelationshipByDestLayer: function(operationData) {
        var queryRelationship = null;
        // compatible with arcgis service 10.0.
        array.some(operationData.oriJimuLayerInfo.layerObject.relationships, function(relationship) {
          if (relationship.relatedTableId === operationData.destJimuLayerInfo.layerObject.layerId) {//************
            queryRelationship = relationship;
            return true;
          }
        }, this);
        return queryRelationship;
      },

      _getRelatedRecordsByRelatedQuery: function(operationData) {
        var def = new Deferred();
        var relatedQuery = new RelationshipQuery();
        var queryRelationship = this._getOriRelationshipByDestLayer(operationData);
        // todo...
        relatedQuery.outFields = ["*"];
        relatedQuery.returnGeometry = true;
        relatedQuery.outSpatialReference = this.popupManager.mapManager.map.spatialReference;
        relatedQuery.relationshipId = queryRelationship.id;
        var objectId =
          operationData.feature.attributes[operationData.oriJimuLayerInfo.layerObject.objectIdField];
        relatedQuery.objectIds = [objectId];

        operationData.oriJimuLayerInfo.layerObject.queryRelatedFeatures(
          relatedQuery,
          lang.hitch(this, function(relatedRecords) {
            var features = relatedRecords[objectId] && relatedRecords[objectId].features;
            if(features) {
              def.resolve(features);
            } else {
              def.resolve([]);
            }
          }), lang.hitch(this, function() {
            def.resolve([]);
          })
        );

        return def;
      },

      _ignoreCaseToGetFieldObject: function(layerObject, fieldKey) {
        var result = null;
        if(fieldKey && layerObject && layerObject.fields) {
          array.some(layerObject.fields, function(field) {
            if(field.name.toLowerCase() === fieldKey.toLowerCase()) {
              result = field;
              return true;
            }
          });
        }
        return result;
      },

      getLocaleDateTime: function(dateString) {
        var dateObj = new Date(dateString);
        return jimuUtils.localizeDate(dateObj, {
          fullYear: true,
          //selector: 'date',
          formatLength: 'medium'
        });
      },

      // _getDisplayTitleOfRelatedRecord: function(relatedLayerInfo, relatedRecord, displayFieldName) {
      //   var displayTitle;
      //   var displayFieldObject =
      //       this._ignoreCaseToGetFieldObject(relatedLayerInfo.layerObject, displayFieldName);

      //   var popupInfoTemplate = relatedLayerInfo.getInfoTemplate();
      //   if(displayFieldName === "popupTitle" && popupInfoTemplate) {
      //     if(typeof popupInfoTemplate.title === "function") {
      //       displayTitle = popupInfoTemplate.title(relatedRecord);
      //     } else {
      //       displayTitle = popupInfoTemplate.title;
      //     }
      //   } else {
      //     displayTitle = displayFieldObject && relatedRecord.attributes[displayFieldName];
      //   }

      //   if(displayTitle) {
      //     if(displayFieldObject &&
      //        displayFieldObject.type &&
      //        displayFieldObject.type === "esriFieldTypeDate") {
      //       displayTitle = this.getLocaleDateTime(displayTitle);
      //     }
      //   } else {
      //     displayTitle = "";
      //   }

      //   return displayTitle;
      // },

      _getDisplayTitleOfRelatedRecord: function(relatedLayerInfo, relatedRecord, displayFieldName) {
        var displayTitle;

        var popupInfoTemplate = relatedLayerInfo.getInfoTemplate();
        if(displayFieldName === "popupTitle" && popupInfoTemplate) {
          if(typeof popupInfoTemplate.title === "function") {
            displayTitle = popupInfoTemplate.title(relatedRecord);
          } else {
            displayTitle = popupInfoTemplate.title;
          }
        } else {
          displayTitle = this._getDisplayTitleFromPopup(relatedLayerInfo, relatedRecord, displayFieldName);
        }

        return displayTitle ? displayTitle : "";
      },

      _getDisplayTitleFromPopup: function(relatedLayerInfo, relatedRecord, displayFieldName) {
        var displayTitle;
        var popupTemplate = this._getPopupTemplateWithOnlyDisplayField(relatedLayerInfo, displayFieldName);
        if(popupTemplate) {
          //temporary set infoTemplate to relatedRecord.
          relatedRecord.setInfoTemplate(popupTemplate);
          displayTitle = this.popupUIController.getDisplayTitle(relatedRecord);
          // clear infoTemplate for relatedRecord;
          relatedRecord.setInfoTemplate(null);
        } else {
          displayTitle = relatedRecord.attributes[displayFieldName];
        }
        return displayTitle;
      },

      _getPopupTemplateWithOnlyDisplayField: function(relatedLayerInfo, displayFieldName) {
        var popupInfo = relatedLayerInfo._getCustomPopupInfo(relatedLayerInfo.layerObject, [displayFieldName]);
        var popupTemplate = new PopupTemplate(popupInfo);
        return popupTemplate;
      },

      _canShowRelatedData: function(oriJimuLayerInfo) {
        var result = true;
        var popupInfo = oriJimuLayerInfo.getPopupInfo();
        if(popupInfo &&
           popupInfo.relatedRecordsInfo) {
          result = popupInfo.relatedRecordsInfo.showRelatedRecords !== false;
        }
        return result;
      },

      /*************************
       * Methods for operation
       *************************/
      setPopupContent: function(operation) {
        this._clearPage();
        if(!operation.data.destJimuLayerInfo) {
          // show related table;
          this.showFeature(operation);
        } else if (!operation.data.relatedFeature) {
          // show related records;
          this.showRelatedRecords(operation);
        }

        if(this.undoManager.peekUndo()) {
          this.popupUIController.changeRefDomNode();
        } else {
          this.popupUIController.revertRefDomNode();
        }
      },

      showFeature: function(operation) {
        var operationData = operation.data;
        /*
        var relatedLayerName = operationData.oriJimuLayerInfo.layerObject._name ?
                               operationData.oriJimuLayerInfo.layerObject._name :
                               operationData.oriJimuLayerInfo.layerObject.name;
        */
        var destLayerObject = operationData.oriJimuLayerInfo.layerObject;
        var relatedLayerName =
          lang.getObject('_wabProperties.originalLayerName', false, destLayerObject) ||
          operationData.oriJimuLayerInfo.title;


        var relatedsListDisplayFieldName =
          lang.getObject("_wabProperties.popupInfo.displayFieldOfRelatedRecordList", false, destLayerObject);
        var operationTitle = this._getDisplayTitleOfRelatedRecord(operationData.oriJimuLayerInfo,
                                                                  operationData.feature,
                                                                  relatedsListDisplayFieldName);
        if(relatedsListDisplayFieldName !== "popupTitle") {
          operationTitle = relatedLayerName + ": " + operationTitle;
        }

        // set operation title
        this._setOperationTitle(operationTitle);
        // add popupInfo to _wabProperties
        lang.setObject('_wabProperties.popupInfo.operationDataForListRelatedRecords',
                       null,
                       operationData.oriJimuLayerInfo.layerObject);
        // temporary set infoTemplate to feature.
        operationData.oriJimuLayerInfo.loadInfoTemplate()
        .then(lang.hitch(this, function(popupTemplate) {
          if(!operationData.oriJimuLayerInfo.layerObject.infoTemplate) {
            operation.data.feature.setInfoTemplate(popupTemplate);
          }
          this.popupUIController.setFeature(operation.data.feature);
          if(!operationData.oriJimuLayerInfo.layerObject.infoTemplate) {
            operation.data.feature.setInfoTemplate(null);
          }
        }));

        this.showRelatedTables(operation);
        this.popupManager.initPopupMenu([operation.data.feature]);
        this.popupUIController.updateZoomToBtn([operation.data.feature]);
      },

      showRelatedRecords: function(operation) {
        var operationData = operation.data;
        /*
        var relatedLayerName = operationData.destJimuLayerInfo.layerObject._name ?
                               operationData.destJimuLayerInfo.layerObject._name :
                               operationData.destJimuLayerInfo.layerObject.name;
        */
        var destLayerObject = operationData.destJimuLayerInfo.layerObject;
        var relatedLayerName =
          lang.getObject('_wabProperties.originalLayerName', false, destLayerObject) ||
          operationData.destJimuLayerInfo.title;
        // set operation title
        this._setOperationTitle(relatedLayerName);
        this._clearPage();
        //this.loading.show();

        // add popupInfo to _wabProperties
        // opertionData = {
        //   feature: feature,
        //   oriJimuLayerInfo: oriJimuLayerInfo,
        //   destJimuLayerInfo: destJimuLayerInfo
        // }
        lang.setObject('_wabProperties.popupInfo.operationDataForListRelatedRecords',
                       operationData,
                       operationData.destJimuLayerInfo.layerObject);
        lang.setObject('_wabProperties.popupInfo.originalFeature',
                        this.originalFeature,
                        operationData.destJimuLayerInfo.layerObject);
        lang.setObject('_wabProperties.popupInfo.layerForActionWithEmptyFeatures',
                        operationData.destJimuLayerInfo.layerObject,
                        this.popup);


        this._getRelatedRecordsByRelatedQuery(operationData)
        .then(lang.hitch(this, function(relatedRecords) {
          // show title
          if(relatedRecords.length > 0) {
            this._setTitle(window.jimuNls.popup.relatedRecords);
          } else {
            this._setTitle(window.jimuNls.popup.noRelatedRecotds, 'font-normal');
          }

          var displayFieldName = this._showFieldSelector(operationData.destJimuLayerInfo);
          // show related records
          array.forEach(relatedRecords, function(relatedRecord, index) {

            // Working around for bug of queryRelatedFeatures.
            relatedRecord._layer = operationData.destJimuLayerInfo.layerObject;

            // displayTitle
            var displayTitle = this._getDisplayTitleOfRelatedRecord(operationData.destJimuLayerInfo,
                                                                    relatedRecord,
                                                                    displayFieldName);
            var backgroundClass = (index % 2 === 0) ? 'oddLine' : 'evenLine';

            var recordItem = html.create('div', {
              'class': 'item record-item ' + backgroundClass,
              'innerHTML': displayTitle
            }, this.contentBox);
            recordItem.relatedRecord = relatedRecord;

            var handle = on(recordItem, 'click', lang.hitch(this, function() {
              this._addOperation(operation);
              var newOperation = this._createOperation({
                //feature: operation.data.originalFeature,
                //oriJimuLayerInfo: operation.data.originalJimuLayerInfo,
                feature: relatedRecord,
                oriJimuLayerInfo: operationData.destJimuLayerInfo
              });
              this.setPopupContent(newOperation);
            }));
            this._temporaryData.eventHandles.push(handle);
          }, this);
          this.popupManager.initPopupMenu(relatedRecords);
          this.popupUIController.updateZoomToBtn(relatedRecords);
          //this.loading.hide();
        }));
        this.popupUIController.setContent(this.domNode);

      },

      showRelatedTables: function(operation) {
        if(!this._canShowRelatedData(operation.data.oriJimuLayerInfo)) {
          return;
        }

        this._getRelatedTableInfoArray(operation)
        .then(lang.hitch(this, function(layerInfoArray) {
          if(layerInfoArray.length > 0) {
            this._setTitle(window.jimuNls.popup.relatedTables);
          }

          array.forEach(layerInfoArray, function(relatedLayerInfo, index) {
            var backgroundClass = (index % 2 === 0) ? 'oddLine' : 'evenLine';
            var tableItem = html.create('div', {
              'class': 'item table-item ' + backgroundClass,
              innerHTML: relatedLayerInfo.title
            }, this.contentBox);

            var handle = on(tableItem, 'click', lang.hitch(this, function() {
              relatedLayerInfo.getLayerObject().then(lang.hitch(this, function() {
                this._addOperation(operation);
                var newOperation = this._createOperation({
                  feature: operation.data.feature,
                  oriJimuLayerInfo: operation.data.oriJimuLayerInfo,
                  destJimuLayerInfo: relatedLayerInfo
                });
                this.setPopupContent(newOperation);
              }));
            }));
            this._temporaryData.eventHandles.push(handle);

          }, this);
        }));
      },

      _createOperation: function(operationData) {
        var newOperationData = {
          feature: operationData.feature || null,
          oriJimuLayerInfo: operationData.oriJimuLayerInfo || null,
          destJimuLayerInfo: operationData.destJimuLayerInfo || null,
          relatedFeature: operationData.relatedFeature || null
        };
        var operation = new clazz.Operation(
          newOperationData,
          this
        );
        return operation;
      },


      _addOperation: function(operation) {
        this.undoManager.add(operation);
      },


      _onPreviouBtnClick: function() {
        this.undoManager.undo();
      },
      /*************************
       * Methods for control dom
       *************************/

      _clearPage: function() {
        html.empty(this.contentBox);

        array.forEach(this._temporaryData.eventHandles, function(handle) {
          if(handle && handle.remove) {
            handle.remove();
          }
        }, this);
        this._temporaryData.eventHandles = [];

        array.forEach(this._temporaryData.dijits, function(dijit) {
          if(dijit && dijit.destroy) {
            dijit.destroy();
          }
        }, this);
        this._temporaryData.dijits = [];
      },

      _setTitle: function(title, className) {
        if(title) {
          html.create('div', {
            'class': 'title-box ' + (className ? className : ''),
            innerHTML: title
          }, this.contentBox);
          /*
          html.create('div', {
            'class': 'hzLine'
          }, this.contentBox);
          */
        }
      },

      _setOperationTitle: function(title) {
        html.setAttr(this.operationTitle, 'innerHTML', title);
        html.setAttr(this.operationTitle, 'title', title);
      },

      //get field selector
      _showFieldSelector: function(relatedLayerInfo) {
        var defaultDisplayFieldName = "objecid";
        var titleBox = query(".title-box", this.contentBox)[0];
        var relatedLayer = relatedLayerInfo.layerObject;
        var items = [];

        if(!titleBox || !relatedLayerInfo) {
          return defaultDisplayFieldName;
        }

        var popupInfo = relatedLayerInfo.getPopupInfo();
        if(popupInfo && popupInfo.title) {
          items.push({
            label: window.jimuNls.popup.saveAsPopupTitle,
            value: "popupTitle"
          });
        }

        array.forEach(relatedLayer.fields, function(field){
          if(field.name.toLowerCase() !== "globalid" &&
            field.name.toLowerCase() !== "shape"){
            items.push({
              label: field.alias || field.name,
              value: field.name
            });
          }
        });

        var fieldSelector = new DropdownMenu({
          items: items
        }).placeAt(titleBox);
        fieldSelector.domNode.title = window.jimuNls.popup.chooseFieldTip;

        // get default display field name
        var oldDefaultDisplayFieldName =
          lang.getObject("_wabProperties.popupInfo.displayFieldOfRelatedRecordList", false, relatedLayer);
        var displayOrObjectField = this._ignoreCaseToGetFieldObject(relatedLayerInfo.layerObject,
          relatedLayerInfo.layerObject.displayField ||
          relatedLayerInfo.layerObject.objectIdField);
        var appConfig = ConfigManager.getInstance().getAppConfig();
        if(oldDefaultDisplayFieldName) {
          defaultDisplayFieldName = oldDefaultDisplayFieldName;
        } else if(appConfig.configWabVersion === "2.3" && displayOrObjectField && displayOrObjectField.name) {
          // back compatibility for online4.4
          defaultDisplayFieldName = displayOrObjectField.name;
        } else if(popupInfo && popupInfo.title) {
          defaultDisplayFieldName = "popupTitle";
        } else if(displayOrObjectField && displayOrObjectField.name) {
          defaultDisplayFieldName = displayOrObjectField.name;
        } else if(items.length > 0) {
          defaultDisplayFieldName = items[0].value;
        }

        if(defaultDisplayFieldName) {
          // hilight item
          fieldSelector.setHighlightValue(defaultDisplayFieldName);
          lang.setObject("_wabProperties.popupInfo.displayFieldOfRelatedRecordList",
                         defaultDisplayFieldName,
                         relatedLayer);
        }
        this._temporaryData.dijits.push(fieldSelector);

        // listen on selcector change
        var fieldSelectorChangeHandle = on(fieldSelector,
                                           'click-item',
                                           lang.hitch(this,function(relatedLayerInfo, newValue) {
          query(".item.record-item", this.contentBox).forEach(lang.hitch(this, function(node) {
            lang.setObject("_wabProperties.popupInfo.displayFieldOfRelatedRecordList", newValue, relatedLayer);
            var displayTitle = this._getDisplayTitleOfRelatedRecord(relatedLayerInfo,
                                                                    node.relatedRecord,
                                                                    newValue);
            node.innerHTML = displayTitle;
          }));
        }, relatedLayerInfo));
        this._temporaryData.eventHandles.push(fieldSelectorChangeHandle);
        return defaultDisplayFieldName;
      }
    });

    // operation class
    clazz.Operation = declare([OperationBase], {
      constructor: function(operationData, relatedRecordsPopupProjector) {
        this.data = operationData;
        this.relatedRecordsPopupProjector = relatedRecordsPopupProjector;
      },

      performUndo: function() {
        this.relatedRecordsPopupProjector.setPopupContent(this);
      }
    });


    clazz.PopupUIController = declare([], {
      constructor: function(rrPopupProjector) {
        this.rrPopupProjector = rrPopupProjector;
        this.popup = rrPopupProjector.popup;
        this.initTempPopup();
        this._initTempPopupForDisplayTitle();
        this._initZoomToBtn();
      },

      initTempPopup: function() {
        this._tempPopup = new Popup({/*titleInBody: false*/}, html.create('div'));
      },

      _initTempPopupForDisplayTitle: function() {
        this._tempPopupForDisplayTitle = new Popup({/*titleInBody: false*/}, html.create('div'));
        this._tempPopupForDisplayTitle.show();
      },

      destroy: function() {
        this._tempPopup.destroy();
        this._tempPopupForDisplayTitle.destroy();
        if(this._zoomToBtnClickHandle && this._zoomToBtnClickHandle.remove) {
          this._zoomToBtnClickHandle.remove();
        }
        if(this._zoomToBtnANode) {
          html.destroy(this._zoomToBtnANode);
        }
      },

      addDomNode: function(domNode) {
        setTimeout(lang.hitch(this, function() {
          html.place(domNode, this._getRefDomNode(), "after");
        }), 1);
      },

      setFeature: function(feature) {
        this._tempPopup.setFeatures([feature]);
        var esriViewPopupDomNode = query(".esriViewPopup", this._tempPopup.domNode)[0];
        if(esriViewPopupDomNode) {
          /*
          var contentPaneDomNode = query(".contentPane", this.popup.domNode)[0];
          contentPaneDomNode.removeChild(this.rrPopupProjector.domNode);
          */
          // var projectorParentNode = query(".related-records-popup-projector").parent()[0];
          // projectorParentNode.removeChild(this.rrPopupProjector.domNode);
          this.setContent(esriViewPopupDomNode);
          html.place(this.rrPopupProjector.domNode, esriViewPopupDomNode, "after");
        }
      },

      setContent: function(content) {
        var projectorParentNode = query(".related-records-popup-projector").parent()[0];
        if (projectorParentNode) {
          projectorParentNode.removeChild(this.rrPopupProjector.domNode);
        }
        this.popup.setContent(content);
      },

      getDisplayTitle: function(feature) {
        var displayTitle;
        this._tempPopupForDisplayTitle.setFeatures([feature]);
        var attrValueTdDomNode = query("td.attrValue", this._tempPopupForDisplayTitle.domNode)[0];
        displayTitle = attrValueTdDomNode && attrValueTdDomNode.innerHTML;
        return displayTitle;
      },

      _getRefDomNode: function() {
        return this._getViewPopupDomNode();
      },

      _getViewPopupDomNode: function() {
        var refDomNode = query(".esriViewPopup", this.popup.domNode)[0];
        return refDomNode;
      },

      _setPopupTitleInBody: function() {
        if(this.rrPopupProjector.undoManager.peekUndo()) {
          this._tempPopup.set("titleInBody", false);
        } else {
          this._tempPopup.set("titleInBody", true);
        }
      },

      _initZoomToBtn: function() {
        /*jshint scripturl:true*/
        var actionListNode = query(".actionList", this.popup.domNode)[0];
        this._oldZoomToBtnANdoe = query(".action", actionListNode)[0];
        this._zoomToBtnANode = html.create('a', {
          'class': "action",
          'style': "display: none",
          'href': "javascript:void(0)"
        }, actionListNode);

        this._zoomToBtn = html.create('span', {
          'innerHTML': window.jimuNls.common.zoomTo
        }, this._zoomToBtnANode);
        this._showOldZoomToBtn();
      },

      _hideZoomToBtn: function() {
        if(this._zoomToBtnANode) {
          html.setStyle(this._zoomToBtnANode, 'display', 'none');
        }
      },

      _showZoomToBtn: function() {
        if(this._zoomToBtnANode) {
          html.setStyle(this._zoomToBtnANode, 'display', 'inline-block');
        }
      },

      _hideOldZoomToBtn: function() {
        if(this._oldZoomToBtnANdoe) {
          html.setStyle(this._oldZoomToBtnANdoe, 'display', 'none');
        }
      },

      _showOldZoomToBtn: function() {
        if(this._oldZoomToBtnANdoe) {
          html.setStyle(this._oldZoomToBtnANdoe, 'display', 'inline-block');
        }
      },

      updateZoomToBtn: function(features) {
        this._hideOldZoomToBtn();
        if(!features || features.length < 1 || !features[0].geometry) {
          this._hideZoomToBtn();
          return;
        } else {
          this._showZoomToBtn();
        }

        if(this._zoomToBtnClickHandle && this._zoomToBtnClickHandle.remove) {
          this._zoomToBtnClickHandle.remove();
        }
        this._zoomToBtnClickHandle = on(this._zoomToBtn, "click", lang.hitch(this, function() {
          var ext = null;
          try{
            ext = graphicsUtils.graphicsExtent(features);
          }catch(e){
            console.error(e);
          }
          if(ext){
            this.rrPopupProjector.popupManager.mapManager.map.setExtent(ext);
            this.popup.hide();
          }
        }));
      },

      changeRefDomNode: function() {
        html.setStyle(this.rrPopupProjector.operationBox, 'display', 'block');
        html.addClass(this.rrPopupProjector.domNode, 'second-page-mode');
        var refDomNode = this._getViewPopupDomNode();
        if(refDomNode ) {
          html.addClass(refDomNode, 'second-page-mode');
        }
      },

      revertRefDomNode: function() {
        html.setStyle(this.rrPopupProjector.operationBox, 'display', 'none');
        //html.removeClass(this.refDomNode, 'second-page-mode');
        html.removeClass(this.rrPopupProjector.domNode, 'second-page-mode');
        this._hideZoomToBtn();
        this._showOldZoomToBtn();
      }
    });

    clazz.PopupMobileUIController = declare([clazz.PopupUIController], {
      initTempPopup: function() {
        this._tempPopup = new PopupMobile({}, html.create('div'));
      },

      setFeature: function(feature) {
        this._tempPopup.setFeatures([feature]);
        // mobilePopupInfoView is the second page of mobile popup.
        var tempMobilePopupInfoView = query(".esriMobileInfoView.esriMobilePopupInfoView", this._tempPopup.domNode)[0];
        var tempEsriViewPopupDomNode = query(".esriViewPopup", tempMobilePopupInfoView)[0];
        if(tempEsriViewPopupDomNode) {
          // var projectorParentNode = query(".related-records-popup-projector").parent()[0];
          // projectorParentNode.removeChild(this.rrPopupProjector.domNode);
          this.setContent(tempEsriViewPopupDomNode);
          html.place(this.rrPopupProjector.domNode, tempEsriViewPopupDomNode, "after");
        }
      },

      updateZoomToBtn: function() {
      },

      _initZoomToBtn: function() {
      },

      _getRefDomNode: function() {
        var refDomNode;
        var mobileInfoViewItems = query(".esriMobilePopupInfoView .esriMobileInfoViewItem");
        var mobileActionListNode = mobileInfoViewItems[1];
        refDomNode = mobileActionListNode;
        return refDomNode;
      },

      _getViewPopupDomNode: function() {
        var mobilePopupInfoView = query(".esriMobileInfoView.esriMobilePopupInfoView")[0];
        var refDomNode = query(".esriViewPopup", mobilePopupInfoView)[0];
        return refDomNode;
      }
    });
    return clazz;
  });
