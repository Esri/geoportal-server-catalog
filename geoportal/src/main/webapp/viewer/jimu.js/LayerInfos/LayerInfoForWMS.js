///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
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
  './LayerInfoFactory',
  'esri/layers/FeatureLayer',
  'esri/lang'
], function(declare, array, lang, topic, Deferred, graphicsUtils, aspect,
LayerInfo, LayerInfoForDefaultWMS, LayerInfoFactory, FeatureLayer, esriLang) {
  /*jshint unused: false*/
  return declare(LayerInfo, {

    constructor: function( operLayer, map, options) {
      this._layerOptions = options.layerOptions ? options.layerOptions: null;
      /*jshint unused: false*/
    },


    getExtent: function() {
      var extent = this.originOperLayer.layerObject.extent;
      return this._convertGeometryToMapSpatialRef(extent);
    },

    _resetLayerObjectVisiblityBeforeInit: function() {
      if(this._layerOptions) {
        //reste visibility fo parent layer.
        if(this._layerOption) {
          this.layerObject.setVisibility(this._layerOption.visible);
        }

        //reste visibles of sublayer.
        var visibleLayers = [];
        var haseConfiguredInLayerOptionsflag = false;
        array.forEach(this.layerObject.layerInfos, function(jsapiLayerInfo) {
          var absoluteSublayerId = this.id + '_' + jsapiLayerInfo.name;
          if(esriLang.isDefined(this._layerOptions[absoluteSublayerId])) {
            haseConfiguredInLayerOptionsflag = true;
            if(this._layerOptions[absoluteSublayerId].visible) {
              visibleLayers.push(jsapiLayerInfo.name);
            }
          }
        }, this);

        if(visibleLayers.length > 0 || haseConfiguredInLayerOptionsflag) {
          //recall setVisibleLayers()
          this.layerObject.setVisibleLayers(visibleLayers);
          this.traversal(function(layerInfo) {
            layerInfo.initVisible();
          });
        }
      }
    },

    initVisible: function() {
      this._visible = this.layerObject.visible;
    },

    _setTopLayerVisible: function(visible) {
      this.layerObject.setVisibility(visible);
      this._visible = visible;
    },

    setSubLayerVisible: function(layersVisible) {
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
      this.originOperLayer.layerObject.setVisibleLayers(ary);
    },
    //---------------new section-----------------------------------------

    obtainNewSubLayers: function() {
      var newSubLayerInfos = [];
      array.forEach(this.layerObject.layerInfos, function(layerInfo, index){
        var subLayerInfo;
        subLayerInfo = LayerInfoFactory.getInstance().create({
          layerObject: this.layerObject, //the subLayerObject is WMS layer also.
          title: layerInfo.label || layerInfo.title || layerInfo.name || " ",
          // WMS sub layer does not has id, set id to 'parentId' + name.
          id: this.id + '_' + (layerInfo.name || " "),
          wms: {"layerInfo": this, "subId": layerInfo.name, "wmsLayerInfo": layerInfo},
          selfType: 'wms',
          parentLayerInfo: this
        });

        newSubLayerInfos.push(subLayerInfo);
        subLayerInfo.init();
      }, this);

      return newSubLayerInfos;
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
      this.traversal(function(layerInfo) {
        // init visible for every sublayer.
        layerInfo.initVisible();
        changedLayerInfos.push(layerInfo);
      });
      // send event
      topic.publish('layerInfos/layerInfo/visibleChanged', changedLayerInfos);
      this._isShowInMapChanged2();
    }
  });
});
