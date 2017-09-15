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
  'dojo/promise/all',
  'jimu/WidgetManager',
  'jimu/portalUrlUtils',
  'esri/lang',
  'esri/graphicsUtils',
  './NlsStrings'
], function(declare, array, lang, Deferred, all, WidgetManager, portalUrlUtils, esriLang,
  graphicsUtils, NlsStrings) {
  var clazz = declare([], {

    _candidateMenuItems: null,
    //_deniedItems: null,
    _displayItems: null,
    _layerInfo: null,
    _layerType: null,
    _appConfig: null,

    constructor: function(layerInfo, displayItemInfos, layerType, layerListWidget) {
      this.nls = NlsStrings.value;
      this._layerInfo = layerInfo;
      this._layerType = layerType;
      this.layerListWidget = layerListWidget;
      this._initCandidateMenuItems();
      this._initDisplayItems(displayItemInfos);
    },

    _getATagLabel: function() {
      var url;
      var label;
      var itemLayerId = this._layerInfo.isItemLayer && this._layerInfo.isItemLayer();
      var layerUrl = this._layerInfo.getUrl();

      if (itemLayerId) {
        url = this._getItemDetailsPageUrl() || layerUrl;
        label = this.nls.itemShowItemDetails;
      } else if (layerUrl &&
        (this._layerType === "CSVLayer" || this._layerType === "KMLLayer")) {
        url = layerUrl;
        label = this.nls.itemDownload;
      } else if (layerUrl && this._layerType === "WMSLayer") {
        url = layerUrl + (layerUrl.indexOf("?") > -1 ? "&" : "?") + "SERVICE=WMS&REQUEST=GetCapabilities";
        label = this.nls.itemDesc;
      } else if (layerUrl && this._layerType === "WFSLayer") {
        url = layerUrl + (layerUrl.indexOf("?") > -1 ? "&" : "?") + "SERVICE=WFS&REQUEST=GetCapabilities";
        label = this.nls.itemDesc;
      } else if (layerUrl) {
        url = layerUrl;
        label = this.nls.itemDesc;
      } else {
        url = '';
        label = this.nls.itemDesc;
      }

      return '<a class="menu-item-description" target="_blank" href="' +
        url + '">' + label + '</a>';
    },

    _getItemDetailsPageUrl: function() {
      var itemUrl = "";
      var portalUrl;
      var appConfig = this.layerListWidget.appConfig;
      var itemLayerInfo = lang.getObject("_wabProperties.itemLayerInfo", false, this._layerInfo.layerObject);
      if(this._layerInfo.originOperLayer.itemId) {
        portalUrl = portalUrlUtils.getStandardPortalUrl(appConfig.map.portalUrl || appConfig.portalUrl);
        itemUrl = portalUrlUtils.getItemDetailsPageUrl(portalUrl, this._layerInfo.originOperLayer.itemId);
      } else if(itemLayerInfo && itemLayerInfo.portalUrl && itemLayerInfo.itemId){
        portalUrl = portalUrlUtils.getStandardPortalUrl(itemLayerInfo.portalUrl);
        itemUrl = portalUrlUtils.getItemDetailsPageUrl(portalUrl, itemLayerInfo.itemId);
      }
      return itemUrl;
    },

    _initCandidateMenuItems: function() {
      //descriptionTitle: NlsStrings.value.itemDesc,
      // var layerObjectUrl = (this._layerInfo.layerObject && this._layerInfo.layerObject.url) ?
      //                       this._layerInfo.layerObject.url :
      //                       '';
      this._candidateMenuItems = [{
        key: 'separator',
        label: ''
      }, {
        key: 'empty',
        label: this.nls.empty
      }, {
        key: 'zoomto',
        label: this.nls.itemZoomTo
      }, {
        key: 'transparency',
        label: this.nls.itemTransparency
      }, {
        key: 'moveup',
        label: this.nls.itemMoveUp
      }, {
        key: 'movedown',
        label: this.nls.itemMoveDown
      }, {
        key: 'table',
        label: this.nls.itemToAttributeTable
      }, {
        key: 'controlPopup',
        label: this.nls.removePopup
      }, {
        key: 'controlLabels',
        label: this.nls.showLabels
      }, {
        key: 'url',
        label: this._getATagLabel()
      }];
    },

    _initDisplayItems: function(displayItemInfos) {
      this._displayItems = [];
      // according to candidate itmes to init displayItems
      array.forEach(displayItemInfos, function(itemInfo) {
        array.forEach(this._candidateMenuItems, function(item) {
          if (itemInfo.key === item.key) {
            this._displayItems.push(lang.clone(item));
            if (itemInfo.onClick) {
              this._displayItem.onClick = itemInfo.onClick;
            }
          }
        }, this);
      }, this);
    },

    _isSupportedByAT: function() {
      return true;
    },

    _isSupportedByAT_bk: function(attributeTableWidget, supportTableInfo) {
      var isSupportedByAT;
      var isLayerHasBeenConfigedInAT;
      var ATConfig = attributeTableWidget.config;

      if(ATConfig.layerInfos.length === 0) {
        isLayerHasBeenConfigedInAT = true;
      } else {
        isLayerHasBeenConfigedInAT = array.some(ATConfig.layerInfos, function(layerInfo) {
          if(layerInfo.id === this._layerInfo.id && layerInfo.show) {
            return true;
          }
        }, this);
      }
      if (!supportTableInfo.isSupportedLayer ||
          !supportTableInfo.isSupportQuery ||
          supportTableInfo.otherReasonCanNotSupport ||
          !isLayerHasBeenConfigedInAT) {
        isSupportedByAT = false;
      } else {
        isSupportedByAT = true;
      }
      return isSupportedByAT;
    },

    getDeniedItems: function() {
      // summary:
      //    the items that will be denied.
      // description:
      //    return Object = [{
      //   key: String, popupMenuInfo key,
      //   denyType: String, "disable" or "hidden"
      // }]
      var defRet = new Deferred();
      var dynamicDeniedItems = [];

      if (this.layerListWidget.layerListView.isFirstDisplayedLayerInfo(this._layerInfo)) {
        dynamicDeniedItems.push({
          'key': 'moveup',
          'denyType': 'disable'
        });
      }
      if (this.layerListWidget.layerListView.isLastDisplayedLayerInfo(this._layerInfo)) {
        dynamicDeniedItems.push({
          'key': 'movedown',
          'denyType': 'disable'
        });
      }

      if (!this._layerInfo.getUrl()) {
        dynamicDeniedItems.push({
          'key': 'url',
          'denyType': 'disable'
        });
      }

      // deny controlLabels
      if (!this._layerInfo.canShowLabel()) {
        dynamicDeniedItems.push({
          'key': 'controlLabels',
          'denyType': 'hidden'
        });
      }

      var loadInfoTemplateDef = this._layerInfo.loadInfoTemplate();
      var getSupportTableInfoDef = this._layerInfo.getSupportTableInfo();

      all({
        infoTemplate: loadInfoTemplateDef,
        supportTableInfo: getSupportTableInfoDef
      }).then(lang.hitch(this, function(result) {

        // deny controlPopup
        if (!result.infoTemplate) {
          dynamicDeniedItems.push({
            'key': 'controlPopup',
            'denyType': 'disable'
          });
        }

        // deny table.
        var supportTableInfo = result.supportTableInfo;
        var attributeTableWidget =
              this.layerListWidget.appConfig.getConfigElementsByName("AttributeTable")[0];

        if (!attributeTableWidget || !attributeTableWidget.visible) {
          dynamicDeniedItems.push({
            'key': 'table',
            'denyType': 'hidden'
          });
        } else if (!this._isSupportedByAT(attributeTableWidget, supportTableInfo)) {
          if(this._layerInfo.parentLayerInfo &&
             this._layerInfo.parentLayerInfo.isMapNotesLayerInfo()) {
            dynamicDeniedItems.push({
              'key': 'table',
              'denyType': 'hidden'
            });
          } else {
            dynamicDeniedItems.push({
              'key': 'table',
              'denyType': 'disable'
            });
          }

        }
        defRet.resolve(dynamicDeniedItems);
      }), function() {
        defRet.resolve(dynamicDeniedItems);
      });

      return defRet;

    },

    getDisplayItems: function() {
      return this._displayItems;
    },

    onPopupMenuClick: function(evt) {
      var result = {
        closeMenu: true
      };
      switch (evt.itemKey) {
        case 'zoomto' /*this.nls.itemZoomTo'Zoom to'*/ :
          this._onItemZoomToClick(evt);
          break;
        case 'moveup' /*this.nls.itemMoveUp'Move up'*/ :
          this._onMoveUpItemClick(evt);
          break;
        case 'movedown' /*this.nls.itemMoveDown'Move down'*/ :
          this._onMoveDownItemClick(evt);
          break;
        case 'table' /*this.nls.itemToAttributeTable'Open attribute table'*/ :
          this._onTableItemClick(evt);
          break;
        case 'transparencyChanged':
          this._onTransparencyChanged(evt);
          result.closeMenu = false;
          break;
        case 'controlPopup':
          this._onControlPopup();
          break;
        case 'controlLabels':
          this._onControlLabels();
          break;

      }
      return result;
    },

    /**********************************
     * Respond events respectively.
     *
     * event format:
      // evt = {
      //   itemKey: item key
      //   extraData: estra data,
      //   layerListWidget: layerListWidget,
      //   layerListView: layerListView
      // }, result;
     **********************************/
    _onItemZoomToClick: function(evt) {
      /*jshint unused: false*/
      //this.map.setExtent(this.getExtent());
      this._layerInfo.getExtent().then(lang.hitch(this, function(geometries) {
        var ext = null;
        var a = geometries && geometries.length > 0 && geometries[0];
        if(this._isValidExtent(a)){
          ext = a;
        }
        if(ext){
          this._layerInfo.map.setExtent(ext);
        }else if(this._layerInfo.map.graphicsLayerIds.indexOf(this._layerInfo.id) >= 0){
          //if fullExtent doesn't exist and the layer is (or sub class of) GraphicsLayer,
          //we can calculate the full extent
          this._layerInfo.getLayerObject().then(lang.hitch(this, function(layerObject){
            if(layerObject.graphics && layerObject.graphics.length > 0){
              try{
                ext = graphicsUtils.graphicsExtent(layerObject.graphics);
              }catch(e){
                console.error(e);
              }
              if(ext){
                this._layerInfo.map.setExtent(ext);
              }
            }
          }));
        }
      }));
    },

    _isValidExtent: function(extent){
      var isValid = false;
      if(esriLang.isDefined(extent)){
        if(esriLang.isDefined(extent.xmin) && isFinite(extent.xmin) &&
           esriLang.isDefined(extent.ymin) && isFinite(extent.ymin) &&
           esriLang.isDefined(extent.xmax) && isFinite(extent.xmax) &&
           esriLang.isDefined(extent.ymax) && isFinite(extent.ymax)){
          isValid = true;
        }
      }
      return isValid;
    },

    _onMoveUpItemClick: function(evt) {
      if (!this._layerInfo.isFirst) {
        evt.layerListView.moveUpLayer(this._layerInfo);
      }
    },

    _onMoveDownItemClick: function(evt) {
      if (!this._layerInfo.isLast) {
        evt.layerListView.moveDownLayer(this._layerInfo);
      }
    },

    _onTableItemClick: function(evt) {
      this._layerInfo.getSupportTableInfo().then(lang.hitch(this, function(supportTableInfo) {
        var widgetManager;
        var attributeTableWidgetEle =
                    this.layerListWidget.appConfig.getConfigElementsByName("AttributeTable")[0];
        if(this._isSupportedByAT(attributeTableWidgetEle, supportTableInfo)) {
          widgetManager = WidgetManager.getInstance();
          widgetManager.triggerWidgetOpen(attributeTableWidgetEle.id)
          .then(lang.hitch(this, function() {
            evt.layerListWidget.publishData({
              'target': 'AttributeTable',
              'layer': this._layerInfo
            });
          }));
        }
      }));
    },

    _onTransparencyChanged: function(evt) {
      this._layerInfo.setOpacity(1 - evt.extraData.newTransValue);
    },

    _onControlPopup: function(evt) {
      /*jshint unused: false*/
      if (this._layerInfo.controlPopupInfo.enablePopup) {
        this._layerInfo.disablePopup();
      } else {
        this._layerInfo.enablePopup();
      }
      this._layerInfo.map.infoWindow.hide();
    },

    _onControlLabels: function(evt) {
      /*jshint unused: false*/
      if(this._layerInfo.canShowLabel()) {
        if(this._layerInfo.isShowLabels()) {
          this._layerInfo.hideLabels();
        } else {
          this._layerInfo.showLabels();
        }
      }
    }
  });

  clazz.create = function(layerInfo, layerListWidget) {
    var retDef = new Deferred();
    var isRootLayer = layerInfo.isRootLayer();
    var defaultItemInfos = [{
      key: 'url',
      onClick: null
    }];

    var itemInfoCategoreList = {
      'RootLayer': [{
        key: 'zoomto'
      }, {
        key: 'transparency'
      }, {
        key: 'separator'
      }, {
        key: 'moveup'
      }, {
        key: 'movedown'
      }, {
        key: 'separator'
      }, {
        key: 'url'
      }],
      'RootLayerAndFeatureLayer': [{
        key: 'zoomto'
      }, {
        key: 'transparency'
      }, {
        key: 'separator'
      }, {
        key: 'controlPopup'
      }, {
        key: 'separator'
      }, {
        key: 'controlLabels'
      }, {
        key: 'separator'
      }, {
        key: 'moveup'
      }, {
        key: 'movedown'
      }, {
        key: 'separator'
      }, {
        key: 'table'
      }, {
        key: 'separator'
      }, {
        key: 'url'
      }],
      'FeatureLayer': [{
        key: 'controlPopup'
      }, {
        key: 'separator'
      }, {
        key: 'table'
      }, {
        key: 'separator'
      }, {
        key: 'url'
      }],
      'GroupLayer': [{
        key: 'url'
      }],
      'Table': [{
        key: 'table'
      }, {
        key: 'separator'
      }, {
        key: 'url'
      }],
      'default': defaultItemInfos
    };

    layerInfo.getLayerType().then(lang.hitch(this, function(layerType) {
      var itemInfoCategory = "";
      if (isRootLayer &&
          (layerType === "FeatureLayer" ||
            layerType === "CSVLayer" ||
            layerType === "ArcGISImageServiceLayer" ||
            layerType === "StreamLayer" ||
            layerType === "ArcGISImageServiceVectorLayer")) {
        itemInfoCategory = "RootLayerAndFeatureLayer";
      } else if (isRootLayer) {
        itemInfoCategory = "RootLayer";
      } else if (layerType === "FeatureLayer" || layerType === "CSVLayer") {
        itemInfoCategory = "FeatureLayer";
      } else if (layerType === "GroupLayer") {
        itemInfoCategory = "GroupLayer";
      } else if (layerType === "Table") {
        itemInfoCategory = "Table";
      } else {
        //default condition
        itemInfoCategory = "default";
      }
      retDef.resolve(new clazz(layerInfo,
        itemInfoCategoreList[itemInfoCategory],
        layerType,
        layerListWidget));
    }), lang.hitch(this, function() {
      //return default popupmenu info.
      retDef.resolve(new clazz(layerInfo, [{
        key: 'empty'
      }]));
    }));
    return retDef;
  };


  return clazz;
});
