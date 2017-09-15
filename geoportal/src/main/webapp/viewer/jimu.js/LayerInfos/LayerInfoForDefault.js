///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
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
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/Deferred',
  './LayerInfo',
  'dojox/gfx',
  'dojo/dom-construct',
  'dojo/dom-attr',
  'dojo/dom-class',
  'dojo/aspect',
  'jimu/portalUrlUtils',
  'jimu/portalUtils',
  'jimu/utils',
  'esri/symbols/jsonUtils',
  'esri/layers/LabelLayer',
  'esri/layers/LabelClass',
  'esri/dijit/PopupTemplate',
  'esri/dijit/Legend'
], function(declare, array, lang, Deferred, LayerInfo, gfx, domConstruct,
domAttr, domClass, aspect, portalUrlUtils, portalUtils, jimuUtils, jsonUtils, LabelLayer,
LabelClass, PopupTemplate, Legend) {
  var clazz = declare(LayerInfo, {
    _legendsNode: null,
    controlPopupInfo: null,
    // operLayer = {
    //    layerObject: layer,
    //    title: layer.label || layer.title || layer.name || layer.id || " ",
    //    id: layerId || " ",
    //    subLayers: [operLayer, ... ],
    //    mapService: {layerInfo: , subId: },
    //    collection: {layerInfo: }
    // };
    constructor: function() {
      /*
      this.layerLoadedDef = new Deferred();
      if(this.layerObject) {
        this.layerObject.on('load', lang.hitch(this, function(){
          this.layerLoadedDef.resolve();
        }));
      }
      */

      // init control popup
      this._initControlPopup();
      // update layerObject.name if it has.
      this._updateLayerObjectName();
      // show/hide labels
      try {
        this._initToShowLabels();
      } catch (err) {
        console.warn(err.message);
      }
    },

    _updateLayerObjectName: function() {
      if(this.layerObject &&
         !this.layerObject.empty &&
         this.layerObject.name &&
         !lang.getObject("_wabProperties.originalLayerName", false, this.layerObject)) {
        lang.setObject('_wabProperties.originalLayerName',
                       this.layerObject.name,
                       this.layerObject);
        this.layerObject.name = this.title;
      }
    },

    _initToShowLabels: function() {
      var itemLayerInfo = lang.getObject("_wabProperties.itemLayerInfo", false, this.layerObject);
      /*
      //test code
      itemLayerInfo = {
        portalUrl: "http://www.arcgis.com",
        itemId: this.layerObject.xtnItemId
      };
      */

      //ignores layers of webmap. layer of webmap that does not have layerObject.itemLayerInfo property.
      if(!itemLayerInfo ||
         //!LayerInfos.getInstanceSync() ||
         this.layerObject.empty) {
        return;
      }

      var portal = portalUtils.getPortal(itemLayerInfo.portalUrl);
      portal.getItemData(itemLayerInfo.itemId).then(lang.hitch(this, function(itemData) {
        var currentLayerDataOfItemData;
        if(itemData && itemData.layers) {
          array.some(itemData.layers, function(layerData) {
            if(layerData.id === this.layerObject.layerId) {
              currentLayerDataOfItemData = layerData;
              return true;
            } else {
              return false;
            }
          }, this);

          if(currentLayerDataOfItemData && currentLayerDataOfItemData.showLabels) {
            // temporary solvtion for if itemLayer data was not merged to layerObject.
            var labelingInfoOfItemData = lang.getObject("layerDefinition.drawingInfo.labelingInfo",
                                                        false,
                                                        currentLayerDataOfItemData);
            if(labelingInfoOfItemData &&
               !this.layerObject.labelingInfo &&
               this.layerObject.setLabelingInfo) {
              var labelClasses = array.map(labelingInfoOfItemData, function(labelingInfoJson) {
                var labelClass = new LabelClass(labelingInfoJson);
                return labelClass;
              }, this);
              this.layerObject.setLabelingInfo(labelClasses);
            }

            // init to showLabels
            this.showLabels();
          }
        }

      }), lang.hitch(this, function(error) {
        if(error && error.message) {
          console.log(error.message);
        }
      }));
    },

    _initOldFilter: function() {
      // default value of this._oldFilter is null
      if(this.layerObject &&
         !this.layerObject.empty &&
         this.layerObject.getDefinitionExpression) {
        this._oldFilter = this.layerObject.getDefinitionExpression();
      } else {
        this._oldFilter = null;
      }
    },

    _getLayerOptionsForCreateLayerObject: function() {
      var options = {};
      // assign id
      options.id = this.id;
      // prepare outFileds for create feature layer.
      var outFields = [];
      var infoTemplate = this.getInfoTemplate();
      if(infoTemplate && infoTemplate.info && infoTemplate.info.fieldInfos) {
        array.forEach(infoTemplate.info.fieldInfos, function(fieldInfo) {
          if(fieldInfo.visible) {
            outFields.push(fieldInfo.fieldName);
          }
        }, this);
      } else {
        outFields = ["*"];
      }
      options.outFields = outFields;

      // assign capabilities
      //options.resourceInfo = {capabilities: ["Query"]};

      /*
      // prepare popupInfo of webmap for talbe (just for table).
      if(this.originOperLayer.popupInfo && this.isTable) {
        var popupTemplate = new PopupTemplate(this.originOperLayer.popupInfo);
        if(popupTemplate ) {
          options.infoTemplate = popupTemplate;
        }
      }
      */
      return options;
    },

    getExtent: function() {
      var extent = this.originOperLayer.layerObject.fullExtent ||
        this.originOperLayer.layerObject.initialExtent;
      if(extent) {
        return this._convertGeometryToMapSpatialRef(extent);
      } else {
        var def = new Deferred();
        def.resolve(null);
        return def;
      }
    },


    _resetLayerObjectVisiblity: function(layerOptions) {
      var layerOption  = layerOptions ? layerOptions[this.id]: null;
      if(!this.originOperLayer.collection) {
        if(layerOption) {
          this.layerObject.setVisibility(layerOption.visible);
          this._visible = this.layerObject.visible;
        }
      }
    },


    /***************************************************
     * methods for control visiblility
     * **************************************************/
    _initVisible: function() {
      /*jshint unused: false*/
      var visible = false;
      if(this.originOperLayer.collection && this._notFirstInitVisilbeFlag) {
        var FCLayerInfo = this.originOperLayer.collection.layerInfo;
        var parentLayerVisible = FCLayerInfo._visible;
        var subLayerVisible = this.layerObject.visible;

        if(FCLayerInfo._oldIsShowInMap !== FCLayerInfo.isShowInMap()) {
          // control from collection layer
          return;
        }

        if(parentLayerVisible) {
          if(subLayerVisible) {
            this._visible = true;
          } else {
            this._visible = false;
          }
        } else {
          if(subLayerVisible) {
            this._visible = true;
          } else {
            this._visible = false;
          }
        }
        FCLayerInfo._onVisibilityChanged();
      } else {
        visible = this.originOperLayer.layerObject.visible;
        this._visible = visible;
      }
      this._notFirstInitVisilbeFlag = true;
    },

    _setTopLayerVisible: function(visible) {
      if(this.originOperLayer.collection){
        //collection
        //click directly
        if(this.originOperLayer.collection.layerInfo._visible) {
          if(visible) {
            this.layerObject.show();
            this._visible = true;
          } else {
            this.layerObject.hide();
            this._visible = false;
          }
        } else {
          if(visible) {
            this.layerObject.hide();
            this._visible = true;
          } else {
            this.layerObject.hide();
            this._visible = false;
          }
        }
      } else {
        if (visible) {
          this.layerObject.show();
        } else {
          this.layerObject.hide();
        }
        this._visible = visible;
      }
    },

    setLayerVisiblefromTopLayer: function() {
      //click from top collecton
      if(this.originOperLayer.collection.layerInfo._visible) {
        if(this._visible) {
          this.layerObject.show();
        }
      } else {
        this.layerObject.hide();
      }
    },

    _prepareCheckedInfoForShowOrHide: function(showOrHide) {
      var checkedInfo = {};
      var currentLayerInfo = this;
      while(currentLayerInfo.parentLayerInfo) {
        checkedInfo[currentLayerInfo.id] = showOrHide;
        currentLayerInfo = currentLayerInfo.parentLayerInfo;
      }
      return checkedInfo;
    },

    show: function() {
      if(this.isRootLayer()) {
        this._setTopLayerVisible(true);
      } else {
        var rootLayerInfo = this.getRootLayerInfo();
        if(rootLayerInfo._setSubLayerVisibleByCheckedInfo) {
          var checkedInfo = this._prepareCheckedInfoForShowOrHide(true);
          rootLayerInfo._setSubLayerVisibleByCheckedInfo(checkedInfo);
          rootLayerInfo.show();
        }
      }
    },

    _initControlPopup: function() {
      this.controlPopupInfo = {
        //enablePopup: this.originOperLayer.disablePopup ? false : true,
        enablePopup: this.layerObject.infoTemplate ? true: false,
        infoTemplate: this.layerObject.infoTemplate
      };
      // backup infoTemplate to layer.
      this.layerObject._infoTemplate = this.layerObject.infoTemplate;
      aspect.after(this.layerObject, "setInfoTemplate", lang.hitch(this, function(){
        this.layerObject._infoTemplate = this.layerObject.infoTemplate;
        this.controlPopupInfo.infoTemplate = this.layerObject.infoTemplate;
        if(!this.controlPopupInfo.enablePopup) {
          this.layerObject.infoTemplate = null;
        }
      }));
    },

    /***************************************************
     * methods for control service definition
     ***************************************************/

    _getServiceDefinition: function() {
      var def;
      var url = this.getUrl();
      if(url && this.isRootLayer() && this.layerObject.declaredClass === "esri.layers.FeatureLayer") {
        var requestProxy = this._serviceDefinitionBuffer.getRequest(this.subId);
        def = requestProxy.request(url);
      } else {
        def = new Deferred();
        def.resolve(null);
      }
      return def;
    },

    //---------------new section-----------------------------------------

    // obtainLegendsNode: function() {
    //   var layer = this.originOperLayer.layerObject;
    //   var legendsNode = domConstruct.create("div", {
    //     "class": "legends-div"
    //   });

    //   if (layer && layer.renderer) {
    //     this._initLegendsNode(legendsNode);
    //   } else {
    //     this.layerLoadedDef.then(lang.hitch(this, function(){
    //       this._initLegendsNode(legendsNode);
    //     }));
    //   }
    //   return legendsNode;
    // },

    createLegendsNode: function() {
      var legendsNode = domConstruct.create("div", {
        // placeAt 'legendsNode' to document.body first, else can not
        // show legend on IE8.
        "class": "legends-div jimu-legends-div-flag jimu-leading-margin1",
        "legendsDivId": this.id
      }, document.body);
      domConstruct.create("img", {
        "class": "legends-loading-img",
        "src":  require.toUrl('jimu') + '/images/loading.gif'
      }, legendsNode);
      return legendsNode;
    },

    drawLegends: function(legendsNode) {
      var useLegendDijit = true;
      if (useLegendDijit) {
        this._initLegendsNodeByLegendDijit(legendsNode);
      } else {
        this._initLegendsNode(legendsNode);
      }
    },

    _initLegendsNodeByLegendDijit: function(legendsNode) {
      if( this.layerObject &&
      !this.layerObject.empty &&
      (!this.originOperLayer.subLayer || this.originOperLayer.subLayers.length === 0) &&
      this.layerObject.loaded) {
        // delete loading image
        domConstruct.empty(legendsNode);
        // remove 'jimu-legends-div-flag'
        domClass.remove(legendsNode, 'jimu-legends-div-flag');
        var layerInfos = [{
          layer: this.layerObject
        }];
        var legend = new Legend({
          map: this.map,
          layerInfos: layerInfos,
          arrangement: Legend.ALIGN_LEFT,
          respectCurrentMapScale: false,
          respectVisibility: false
        }, domConstruct.create("div", {}, legendsNode));

        legend.startup();
        legendsNode._legendDijit = legend;
      }
    },

    _initLegendsNode: function(legendsNode) {
      var legendInfos = [];
      var layer = this.layerObject;

      if( this.layerObject &&
          !this.layerObject.empty &&
          (!this.originOperLayer.subLayer || this.originOperLayer.subLayers.length === 0)) {
        // delete loading image
        domConstruct.empty(legendsNode);
        // layer has renderer that means layer has been loadded.
        if (layer.renderer) {
          if (layer.renderer.infos) {
            legendInfos = lang.clone(layer.renderer.infos); // todo
          } else {
            legendInfos.push({
              label: layer.renderer.label,
              symbol: layer.renderer.symbol
            });
          }

          if(layer.renderer && layer.renderer.defaultSymbol && legendInfos.length > 0) {
            legendInfos.push({
              label: layer.renderer.defaultLabel || "others",
              symbol: layer.renderer.defaultSymbol
            });
          }

          array.forEach(legendInfos, function(legendInfo) {
            legendInfo.legendDiv = domConstruct.create("div", {
              "class": "legend-div"
            }, legendsNode);

            legendInfo.symbolDiv = domConstruct.create("div", {
              "class": "legend-symbol jimu-float-leading"
            }, legendInfo.legendDiv);
            legendInfo.labelDiv = domConstruct.create("div", {
              "class": "legend-label jimu-float-leading",
              "innerHTML": legendInfo.label || " "
            }, legendInfo.legendDiv);

            if(legendInfo.symbol.type === "textsymbol") {
              domAttr.set(legendInfo.symbolDiv, "innerHTML", legendInfo.symbol.text);
            } else {
              var mySurface = gfx.createSurface(legendInfo.symbolDiv, 50, 50);
              var descriptors = jsonUtils.getShapeDescriptors(legendInfo.symbol);
              var shape = mySurface.createShape(descriptors.defaultShape)
                          .setFill(descriptors.fill).setStroke(descriptors.stroke);
              shape.setTransform(gfx.matrix.translate(25, 25));
            }
          }, this);
        }
      }
    },


    // operLayer = {
    //    layerObject: layer,
    //    title: layer.label || layer.title || layer.name || layer.id || " ",
    //    id: layerId || " ",
    //    subLayers: [operLayer, ... ],
    //    mapService: {layerInfo: , subId: },
    //    collection: {layerInfo: }
    //    selfType: dynamic | tiled | group
    // };

    obtainNewSubLayers: function() {
      var newSubLayers = [];
      array.forEach(this.originOperLayer.subLayers, function(subOperLayer){
        var subLayerInfo;
        // create sub layer
        subOperLayer.parentLayerInfo = this;
        subLayerInfo = this._layerInfoFactory.create(subOperLayer);
        newSubLayers.push(subLayerInfo);
        subLayerInfo.init();
      }, this);
      return newSubLayers;
    },

    _isAllSubLayerVisibleOnPath: function() {
      var isVisbleOrInvisilbe = true;
      var currentLayerInfo = this;
      while(!currentLayerInfo.isRootLayer()) {
        isVisbleOrInvisilbe = isVisbleOrInvisilbe && currentLayerInfo.isVisible();
        currentLayerInfo = currentLayerInfo.parentLayerInfo;
      }
      return isVisbleOrInvisilbe;
    },

    getOpacity: function() {
      if (this.layerObject.opacity) {
        return this.layerObject.opacity;
      } else {
        return 1;
      }
    },

    setOpacity: function(opacity) {
      if (this.layerObject.setOpacity) {
        this.layerObject.setOpacity(opacity);
      }
    },

    _getCustomPopupInfo: function(object, fieldNames) {
      // return popupInfo with all fieldInfos if the fieldName is null;
      var popupInfo = null;
      if(object && object.fields) {
        popupInfo = {
          title: object.name,
          fieldInfos:[],
          description: null,
          showAttachments: true,
          mediaInfos: []
        };
        array.forEach(object.fields, function(field){
          var isValidField = false;
          if(fieldNames) {
            var isValidFieldName = array.some(fieldNames, lang.hitch(this, function(fieldName) {
              return fieldName && (field.name.toLowerCase() === fieldName.toLowerCase());
            }));
            if(isValidFieldName) {
              isValidField = true;
            }
          } else {
            isValidField = true;
          }
          if(isValidField) {
            var fieldInfo = jimuUtils.getDefaultPortalFieldInfo(field);
            fieldInfo.visible = true;
            fieldInfo.isEditable = field.editable;
            popupInfo.fieldInfos.push(fieldInfo);
          }
        }, this);
      }
      return popupInfo;
    },

    // get default popupInfo
    // Todo... improve the getPopupInfo interface.
    _getDefaultPopupInfo: function(object) {
      var defaultPopupInfo = this._getCustomPopupInfo(object);
      if(defaultPopupInfo) {
        defaultPopupInfo.fieldInfos = array.filter(defaultPopupInfo.fieldInfos, lang.hitch(this, function(fieldInfo) {
          var result;
          if(fieldInfo.fieldName.toLowerCase() !== object.objectIdField.toLowerCase() &&
             fieldInfo.fieldName.toLowerCase() !== "globalid" &&
             fieldInfo.fieldName.toLowerCase() !== "shape") {
            result = true;
          } else {
            result = false;
          }
          return result;
        }));
      }
      return defaultPopupInfo;
    },

    // control popup
    // this method depend on layerObject or webmap's popupInfo, otherwise will return null;
    _getDefaultPopupTemplate: function(object) {
      var popupTemplate = null;
      // Todo... improve the getPopupInfo interface.
      var popupInfo = this.getPopupInfo() || this._getDefaultPopupInfo(object);
      if(popupInfo) {
        popupTemplate = new PopupTemplate(popupInfo);
      }
      return popupTemplate;
    },

    enablePopup: function() {
      return this.loadInfoTemplate().then(lang.hitch(this, function() {
        if(this.controlPopupInfo.infoTemplate) {
          this.controlPopupInfo.enablePopup = true;
          this.layerObject.infoTemplate = this.controlPopupInfo.infoTemplate;
          return true;
        } else {
          return false;
        }
      }));
    },

    disablePopup: function() {
      this.controlPopupInfo.enablePopup = false;
      this.layerObject.infoTemplate = null;
    },

    isPopupEnabled: function() {
      var isPopupEnabled;
      if(this.controlPopupInfo &&
         this.controlPopupInfo.enablePopup) {
        isPopupEnabled = true;
      } else {
        isPopupEnabled = false;
      }
      return isPopupEnabled;
    },

    /*
    loadInfoTemplate: function() {
      var def = new Deferred();
      if(!this.controlPopupInfo.infoTemplate) {
        this.controlPopupInfo.infoTemplate = this._getDefaultPopupTemplate(this.layerObject);
      }
      def.resolve(this.controlPopupInfo.infoTemplate);
      return def;
    },
    */

    // getLayerObject first because of some layerObjects has not been loaded, such as tabel.
    loadInfoTemplate: function() {
      var def = new Deferred();
      if(this.controlPopupInfo.infoTemplate) {
        def.resolve(this.controlPopupInfo.infoTemplate);
      } else {
        this.getLayerObject().then(lang.hitch(this, function() {
          this.controlPopupInfo.infoTemplate = this._getDefaultPopupTemplate(this.layerObject);
          def.resolve(this.controlPopupInfo.infoTemplate);
        }), lang.hitch(this, function() {
          def.resolve(null);
        }));
      }
      return def;
    },

    getInfoTemplate: function() {
      return this.controlPopupInfo.infoTemplate;
    },

    _getRelatedUrls: function(layerObject, relationshipRole) {
      var relatedUrls = [];
      if(!layerObject || !layerObject.url || !layerObject.relationships) {
        return relatedUrls;
      }

      var index = layerObject.url.lastIndexOf('/');
      var serverUrl = layerObject.url.slice(0, index);
      array.forEach(layerObject.relationships, function(relationship) {
        if (!relationshipRole ||
        !relationship.role ||
        relationshipRole === relationship.role) {
          var subUrl = serverUrl + '/' + relationship.relatedTableId.toString();
          relatedUrls.push(subUrl);
        }
      }, this);

      return relatedUrls;
    },

    // summary:
    //   get related tableInfo array
    // parameters:
    //   relationshipRole: optional
    //       "esriRelRoleOrigin"
    //       "esriRelRoleDestination"
    getRelatedTableInfoArray: function(relationshipRole) {
      var relatedTableInfoArray = [];
      var def = new Deferred();
      this.getLayerObject().then(lang.hitch(this, function(layerObject) {
        var relatedUrls = this._getRelatedUrls(layerObject, relationshipRole);
        if(relatedUrls.length === 0) {
          def.resolve(relatedTableInfoArray);
        } else {
          this._getLayerInfosObj().traversalAll(lang.hitch(this, function(layerInfo) {
            var relatedUrlIndex = -1;
            if(relatedUrls.length === 0) {
              // all were found
              return true;
            } else {
              array.forEach(relatedUrls, function(relatedUrl, index) {
                if(lang.getObject("layerObject.url", false, layerInfo) &&
                   (portalUrlUtils.removeProtocol(relatedUrl.toString().toLowerCase()).replace(/\/+/g, '/') ===
                   portalUrlUtils.removeProtocol(
                                 layerInfo.layerObject.url.toString().toLowerCase()).replace(/\/+/g, '/'))
                ) {
                  relatedTableInfoArray.push(layerInfo);
                  relatedUrlIndex = index;
                }
              }, this);
              if(relatedUrlIndex >= 0) {
                relatedUrls.splice(relatedUrlIndex, 1);
              }
              return false;
            }
          }));
          def.resolve(relatedTableInfoArray);
        }
      }), lang.hitch(this, function() {
        def.resolve(relatedTableInfoArray);
      }));
      return def;
    },

    getFilter: function() {
      // summary:
      //   get filter from layerObject.
      // description:
      //   return null if does not have or cannot get it.
      var filter;
      if(this.layerObject &&
         !this.layerObject.empty &&
         this.layerObject.getDefinitionExpression) {
        filter = this.layerObject.getDefinitionExpression();
      } else {
        filter = null;
      }
      return filter;
    },

    setFilter: function(layerDefinitionExpression) {
      // summary:
      //   set layer definition expression to layerObject.
      // paramtter
      //   layerDefinitionExpression: layer definition expression
      //   set 'null' to delete layer definition express
      // description:
      //   operation will skip if layer not support filter.
      if(this.layerObject &&
         !this.layerObject.empty &&
         this.layerObject.setDefinitionExpression) {
        this.layerObject.setDefinitionExpression(layerDefinitionExpression);
      }
    },

    // control labels

    _isAlreadyInLabelLayerOfMap: function(labelLayerOfMap) {
      var isAlreadyInLabelLayerOfMap = false;
      if(labelLayerOfMap) {
        isAlreadyInLabelLayerOfMap = array.some(labelLayerOfMap.getFeatureLayers(), function(fl) {
          return this.id === fl.id;
        }, this);
      }
      return isAlreadyInLabelLayerOfMap;
    },

    _addToLabelLayerOfMap: function() {
      var labelLayerOfMap = this.getLabelLayerOfMap();
      if(labelLayerOfMap && !this._isAlreadyInLabelLayerOfMap(labelLayerOfMap)) {
        labelLayerOfMap.addFeatureLayer(this.layerObject);
        // workaround for cannot control labels for layers are added continuously.
        this.map.removeLayer(labelLayerOfMap);
        this.map.addLayer(labelLayerOfMap);
      }
    },

    _removeFromLabelLayerOfMap: function() {
      // remove featureLayer from labelLayerOfMap
      var labelLayerOfMap = this.getLabelLayerOfMap();
      labelLayerOfMap.removeFeatureLayer(this.id);
    },

    _isSupportLabelControl: function() {
      var isSupportLabelControl;
      // TODO... supports WFS layer.
      if(this.isRootLayer() &&
         !this.layerObject.empty &&
         this.layerObject.declaredClass === "esri.layers.FeatureLayer" &&
         this.layerObject.labelingInfo &&
         this.layerObject.labelingInfo.length > 0){
        isSupportLabelControl = true;
      } else {
        isSupportLabelControl = false;
      }
      return isSupportLabelControl;
    },

    getLabelLayerOfMap: function() {
      var labelLayer;
      if(this.map._labels) {
        labelLayer = this.map._labels;
      } else {
        var labelLayerId = 'labels';
        labelLayer = this.map.getLayer(labelLayerId);
        if(!labelLayer) {
          labelLayer = new LabelLayer({"id": labelLayerId});
          this.map.addLayer(labelLayer);
        }
      }
      return labelLayer;
    },

    obtainLabelControl: function() {
      var lableLayerId = this.id + '_labelLayer';
      var labelLayer = this.map.getLayer(lableLayerId);

      // TODO... supports WFS layer.
      if(!labelLayer && this._isSupportLabelControl()){
        var labelLayerOfMap = this.getLabelLayerOfMap();
        if(labelLayerOfMap && this._isAlreadyInLabelLayerOfMap(labelLayerOfMap)) {
          // create a new labelLayer
          labelLayer = new LabelLayer({"id": lableLayerId});
          labelLayer.addFeatureLayer(this.layerObject);
          this.map.addLayer(labelLayer);
          // remove featureLayer from labelLayerOfMap
          this._removeFromLabelLayerOfMap();
        }
      }
      return labelLayer ? labelLayer : null;
    },

    restoreLabelControl: function() {
      if(this._isSupportLabelControl()) {
        // remove labelLayer from map
        this.destroyRealtedLabelLayer();
        // add featureLayer to labelLayerOfMap
        this._addToLabelLayerOfMap();
      }
    },

    destroyRealtedLabelLayer: function() {
      var lableLayerId = this.id + '_labelLayer';
      var labelLayer = this.map.getLayer(lableLayerId);
      if(labelLayer) {
        this.map.removeLayer(labelLayer);
      }
    },

    destroyLabelLayer: function() {
      var currentLayerIsAlreadyInMap = this.map.getLayer(this.id);
      if(!currentLayerIsAlreadyInMap) {
        this._removeFromLabelLayerOfMap();
        this.destroyRealtedLabelLayer();
      }
    },

    canShowLabel: function() {
      return this._isSupportLabelControl();
    },

    isShowLabels: function() {

      var lableLayerId = this.id + '_labelLayer';
      var labelLayer = this.map.getLayer(lableLayerId);
      var labelLayerOfMap = this.getLabelLayerOfMap();
      var precondition = this._isSupportLabelControl() &&
                         (labelLayer || (labelLayerOfMap && this._isAlreadyInLabelLayerOfMap(labelLayerOfMap)));

      return precondition ? this.layerObject.showLabels : false;
    },

    showLabels: function() {
      if(this._isSupportLabelControl() && this.layerObject.setShowLabels) {
        var lableLayerId = this.id + '_labelLayer';
        var labelLayer = this.map.getLayer(lableLayerId);
        if(!labelLayer) {
          this._addToLabelLayerOfMap();
        }
        this.layerObject.setShowLabels(true);
      }
    },

    hideLabels: function() {
      if(this._isSupportLabelControl() && this.layerObject.setShowLabels) {
        this.layerObject.setShowLabels(false);
      }
    }

  });
  return clazz;
});
