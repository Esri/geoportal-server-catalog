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
    'dojo/_base/html',
    'dojo/on',
    './Utils',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidget',
    'jimu/LayerInfos/LayerInfos',
    'esri/dijit/Legend'
], function(declare, array, lang, html, on, legendUtils,
_WidgetsInTemplateMixin, BaseWidget, LayerInfos, Legend) {

  var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {
    name: 'Legend',
    baseClass: 'jimu-widget-legend',
    legend: null,
    _jimuLayerInfos: null,

    startup: function() {
      this.inherited(arguments);
      if(!this.config.layerState || this.config.syncWithWebmap) {
        // compatible before online5.4
        this.config.layerState = {};
      }
      this._jimuLayerInfos = LayerInfos.getInstanceSync();
      this._createLegendForOperationalLayers();
      /*
      if(this.config.showLegendForBasemap) {
        this._createLegendForBasemaplLayers();
      }
      */
      this._bindEvent();
    },

    destroy: function() {
      this.legend.destroy();
      if(this.legendForBasemap) {
        this.legendForBasemap.destroy();
      }
      this.inherited(arguments);
    },

    _createLegendForOperationalLayers: function() {
      var legendParams = {
        arrangement: this.config.legend.arrangement,
        autoUpdate: this.config.legend.autoUpdate,
        respectCurrentMapScale: this.config.legend.respectCurrentMapScale,
        //respectVisibility: false,
        map: this.map,
        layerInfos: this._getLayerInfosParam()
      };
      this.legend = new Legend(legendParams, html.create("div", {}, this.operationalLayersPart));
      this.legend.startup();
    },

    _createLegendForBasemaplLayers: function() {
      html.setStyle(this.basemapLayersTitle, 'display', 'block');
      var legendParams = {
        arrangement: this.config.legend.arrangement,
        autoUpdate: this.config.legend.autoUpdate,
        respectCurrentMapScale: this.config.legend.respectCurrentMapScale,
        //respectVisibility: false,
        map: this.map,
        layerInfos: this._getBasemapLayerInfosParam()
      };
      this.legendForBasemap = new Legend(legendParams, html.create("div", {}, this.basemapLayersDiv));
      this.legendForBasemap.startup();
    },

    _bindEvent: function() {
      if(this.config.legend.autoUpdate) {
        this.own(on(this._jimuLayerInfos,
                    'layerInfosIsShowInMapChanged',
                    lang.hitch(this, 'refreshLegend')));

        this.own(on(this._jimuLayerInfos,
                    'layerInfosChanged',
                    lang.hitch(this, 'refreshLegend')));

        this.own(on(this._jimuLayerInfos,
                    'basemapLayersChanged',
                    lang.hitch(this, 'refreshLegend')));

        this.own(on(this._jimuLayerInfos,
                    'layerInfosRendererChanged',
                    lang.hitch(this, 'refreshLegend')));
      }
    },

    _getBasemapLayerInfosParam: function() {
      var layerInfosParam = [];
      array.forEach(this._jimuLayerInfos.getBasemapLayers(), function(basemapLayerObject) {
        if(legendUtils.isSupportedLayerType(basemapLayerObject)) {
          var layerInfoParam = {
            layer: basemapLayerObject,
            title: basemapLayerObject.name //|| basemapLayerObject.id
          };
          layerInfosParam.push(layerInfoParam);
        }
      });

      return layerInfosParam;
    },

    _getLayerInfosParam: function() {
      var layerInfosParam;
      var basemapLayerInfosParam;

      /*
      if(this.config.legend.layerInfos === undefined) {
        // widget has not been configed.
        layerInfosParam = legendUtils.getLayerInfosParam();
      } else {
        // widget has been configed, respect config.
        layerInfosParam = legendUtils.getLayerInfosParamByConfig(this.config.legend);
      }
      */

      if(this.config.showLegendForBasemap) {
        basemapLayerInfosParam = this._getBasemapLayerInfosParam();
      } else {
        basemapLayerInfosParam = [];
      }


      layerInfosParam = basemapLayerInfosParam.concat(legendUtils.getLayerInfosParam(this.config));

      return layerInfosParam;
    },

    refreshLegend: function() {
      if(this.legend) {
        var layerInfos = this._getLayerInfosParam();
        this.legend.refresh(layerInfos);
      }
    }

  });
  return clazz;
});
