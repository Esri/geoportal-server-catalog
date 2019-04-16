///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
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
  'dojo/topic',
  'dojo/Deferred',
  'esri/graphicsUtils',
  'dojo/aspect',
  './LayerInfo',
  './LayerInfoForDefaultWMS',
  'esri/layers/FeatureLayer',
  'esri/lang'
], function(declare, array, lang, topic, Deferred, graphicsUtils, aspect,
LayerInfo, LayerInfoForDefaultWMS, FeatureLayer, esriLang) {
  /*jshint unused: false*/
  return declare(LayerInfo, {

    constructor: function( operLayer, map) {
      /*jshint unused: false*/
    },

    _getExtent: function() {
      var def = new Deferred();
      def.resolve(this.layerObject.extent || this.layerObject.fullExtent);
      return def;
    },


    // _resetLayerObjectVisiblity: function(layerOptions) {
    //   var layerOption  = layerOptions ? layerOptions[this.id]: null;
    //   if(layerOptions) {
    //     //reste visibility for parent layer.
    //     if(layerOption) {
    //       this.layerObject.setVisibility(layerOption.visible);
    //     }

    //     //reste visibles of sublayer.
    //     var subLayersVisible = {};
    //     var haseConfiguredInLayerOptionsflag = false;

    //     // set visilbe for all sublayers
    //     this.traversal(function(layerInfo) {
    //       if(!layerInfo.isRootLayer()) {
    //         if(esriLang.isDefined(layerOptions[layerInfo.id])) {
    //           layerInfo._setVisible(layerOptions[layerInfo.id].visible);
    //         }
    //       }
    //     });

    //     this.traversal(function(layerInfo) {
    //       if (layerInfo.getSubLayers().length === 0) {
    //         subLayersVisible[layerInfo.subId] =
    //           layerInfo._isAllSubLayerVisibleOnPath();
    //       }
    //     });
    //     if(haseConfiguredInLayerOptionsflag) {
    //       this._setSubLayerVisible(subLayersVisible);
    //     }
    //   }
    // },



    _initVisible: function() {
      this._visible = this.layerObject.visible;
    },

    _setTopLayerVisible: function(visible) {
      this._visible = visible;
      this.layerObject.setVisibility(visible);
    },

    _setSubLayerVisible: function(layersVisible) {
      // summary:
      //   set seblayer visible
      // description:
      //   paramerter:
      //   {subLayerId: visble}
      var ary = [], index;
      ary = lang.clone(this.originOperLayer.layerObject.visibleLayers);

      for (var child in layersVisible) {
        if(layersVisible.hasOwnProperty(child) &&
           (typeof layersVisible[child] !== 'function') /*&&child !== 'config'*/) {
          var visible = layersVisible[child];
          var subLayerId = child.toString();
          index = array.indexOf(ary, subLayerId);
          if (visible) {
            if (index < 0) {
              ary.push(subLayerId);
            }
          } else {
            if (index >= 0) {
              ary.splice(index, 1);
            }
          }
        }
      }
      this._setVisibleLayersBySelfFlag = true;
      this.layerObject.setVisibleLayers(ary);
    },

    _resetLayerObjectVisiblity: function(layerOptions) {
      var layerOption  = layerOptions ? layerOptions[this.id]: null;
      var haseConfiguredInLayerOptionsflag = false;
      if(layerOptions) {
        //reste visibility for parent layer.
        if(layerOption) {
          this.layerObject.setVisibility(layerOption.visible);
        }
        //reste visibility for sublayers.
        var subLayersCheckedInfo = {};
        for ( var id in layerOptions) {
          if(layerOptions.hasOwnProperty(id) &&
             (typeof layerOptions[id] !== 'function')) {
            haseConfiguredInLayerOptionsflag = true;
            subLayersCheckedInfo[id] = layerOptions[id].visible;
          }
        }

        if(haseConfiguredInLayerOptionsflag) {
          this._setSubLayerVisibleByCheckedInfo(subLayersCheckedInfo);
        }
      }

    },

    _setSubLayerVisibleByCheckedInfo: function(checkedInfo) {
      var subLayersVisible = {};

      // set visilbe for all sublayers
      this.traversal(function(layerInfo) {
        if(!layerInfo.isRootLayer()) {
          if(esriLang.isDefined(checkedInfo[layerInfo.id])) {
            layerInfo._setVisible(checkedInfo[layerInfo.id]);
          }
        }
      });

      this.traversal(function(layerInfo) {
        if (layerInfo.getSubLayers().length === 0) {
          subLayersVisible[layerInfo.subId] =
            layerInfo._isAllSubLayerVisibleOnPath();
        }
      });
      this._setSubLayerVisible(subLayersVisible);
    },

    /***************************************************
     * methods for control layer definition
     ***************************************************/
    _getServiceDefinition: function() {
      var url = this.getUrl();
      var requestProxy = this._serviceDefinitionBuffer.getRequest(this.subId);
      return requestProxy.request(url);
    },

    _serviceDefinitionRequest: function(url) {
      return this._normalRequest(url, {'SERVICE': 'WMS', 'REQUEST': 'GetCapabilities'}, 'xml');
    },

    //---------------new section-----------------------------------------

    obtainNewSubLayers: function() {
      var newSubLayerInfos = [];
      array.forEach(this.layerObject.layerInfos, function(wmsLayerInfo, index){
        var subLayerInfo;
        var operLayer = this._getOperLayerFromWMSLayerInfo(wmsLayerInfo, this);
        subLayerInfo = this._layerInfoFactory.create(operLayer);

        newSubLayerInfos.push(subLayerInfo);
        subLayerInfo.init();
      }, this);

      return newSubLayerInfos;
    },

    _getOperLayerFromWMSLayerInfo: function(wmsLayerInfo, parentLayerInfo) {
      return {
        layerObject: this.layerObject, //the subLayerObject is WMS layer also.
        title: wmsLayerInfo.label || wmsLayerInfo.title || wmsLayerInfo.name || " ",
        // WMS sub layer does not has id, set id to 'parentId' + name.
        // group layer might does not have wmsLayerInfo.name.
        id: this.id + '_' + (wmsLayerInfo.name || (wmsLayerInfo.title + "-" + Math.random())),
        subId: wmsLayerInfo.name || "-",
        wms: {"layerInfo": this, "subId": wmsLayerInfo.name || "-", "wmsLayerInfo": wmsLayerInfo},
        selfType: 'wms',
        parentLayerInfo: parentLayerInfo
      };
    },

    /****************
     * Event
     ***************/
    _bindEvent: function() {
      this.inherited(arguments);
      if(this.layerObject && !this.layerObject.empty) {
        aspect.after(this.layerObject, "setVisibleLayers",
          lang.hitch(this, this._onVisibleLayersChanged));
      }
    },

    _onVisibleLayersChanged: function() {
      var changedLayerInfos = [];

      // send event
      if(!this._setVisibleLayersBySelfFlag) {
        this.traversal(function(layerInfo) {
          // init visible for every sublayer.
          if(!layerInfo.isRootLayer()) {
            layerInfo._initVisible();
          }
        });
        this._setVisibleLayersBySelfFlag = false;
      }
      this.traversal(function(layerInfo) {
        // init visible for every sublayer.
        //layerInfo._initVisible();
        if(!layerInfo.isRootLayer()) {
          changedLayerInfos.push(layerInfo);
        }
      });
      this._setVisibleLayersBySelfFlag = false;
      topic.publish('layerInfos/layerInfo/visibleChanged', changedLayerInfos);
      this._isShowInMapChanged2();
    }
  });
});
