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
    'dojo/_base/html',
    'dojo/_base/lang',
    'dojo/Deferred',
    'dojo/on',
    'jimu/BaseWidgetSetting',
    'jimu/dijit/LayerChooserFromMapLite',
    'jimu/LayerInfos/LayerInfos',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/NumberTextBox',
    'dijit/form/CheckBox'
  ],
  function(
    declare,
    array,
    html,
    lang,
    Deferred,
    on,
    BaseWidgetSetting,
    LayerChooserFromMapLite,
    LayerInfos,
    _WidgetsInTemplateMixin) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {

      baseClass: 'jimu-widget-legend-setting',

      startup: function() {
        this.inherited(arguments);
        if (!this.config.legend) {
          this.config.legend = {};
        }

        /*
        this.syncWithWebmapToggle = new ToggleButton({});
        this.syncWithWebmapToggle.placeAt(this.toggleButtonDiv);
        this.syncWithWebmapToggle.startup();
        */

        this.setConfig(this.config);
      },

      setConfig: function(config) {
        this.config = config;
        if (config.legend.arrangement !== undefined) {
          this.selectArrangement.set('value', config.legend.arrangement);
        }
        this.autoUpdate.setValue(config.legend.autoUpdate);
        this.respectCurrentMapScale.setValue(config.legend.respectCurrentMapScale);
        this.showLegendForBasemap.setValue(config.showLegendForBasemap);

        this._setLayerChooser(this.config.layerState);

        this.syncWithWebmapToggle.setValue(config.syncWithWebmap);
        if(config.syncWithWebmap) {
          this._setLayerChooser(null);
          this.layerChooser.setViewMode(true);
        }
        this.own(on(this.syncWithWebmapToggle, 'change', lang.hitch(this, this._onSyncWithWebmapToggleChange)));
      },

      getConfig: function() {
        this.config.legend.arrangement = parseInt(this.selectArrangement.get('value'), 10);
        this.config.legend.autoUpdate = this.autoUpdate.checked;
        this.config.legend.respectCurrentMapScale = this.respectCurrentMapScale.checked;
        this.config.showLegendForBasemap = this.showLegendForBasemap.checked;

        this.config.syncWithWebmap = this.syncWithWebmapToggle.checked;

        //consider the state of this.syncWithWebmapToggle
        if(!this.config.syncWithWebmap) {
          this.config.layerState = this.layerChooser.getState();
        }
        return this.config;
      },

      _setLayerChooser: function(layerState) {
        // customFilter
        if(this.layerChooser) {
          this.layerChooser.restoreState(layerState);
        } else {
          var customFilter = function(layerInfo) {
            var def = new Deferred();
            var rootLayerInfo = null;

            if(layerInfo.isTable) {
              def.resolve(false);
            } else if(layerInfo.isRootLayer()) {
              def.resolve(true);
            } else {
              rootLayerInfo = layerInfo.getRootLayerInfo();
              if(rootLayerInfo &&
                 rootLayerInfo.layerObject &&
                 (rootLayerInfo.layerObject.declaredClass === "esri.layers.ArcGISDynamicMapServiceLayer" ||
                  rootLayerInfo.layerObject.declaredClass === "esri.layers.ArcGISTiledMapServiceLayer" ||
                  rootLayerInfo.layerObject.declaredClass === "esri.layers.FeatureCollection")) {
                def.resolve(true);
              } else {
                def.resolve(false);
              }
            }
            return def;
          };
          // layerLegendStateController
          this.layerChooser = new LayerChooserFromMapLite({
            customFilter: customFilter,
            layerState: layerState,
            layerStateController: LayerChooserFromMapLite.layerLegendStateController,
            onlyShowWebMapLayers: true,
            onlySelectLeafLayer: true
          });
          this.layerChooser.placeAt(this.layerChooserDiv);
        }
        this._updateLayerChooserUI();
      },

      _updateLayerChooserUI: function() {
        var layerInfos = LayerInfos.getInstanceSync();
        array.forEach(layerInfos.getLayerInfoArray(), function(layerInfo) {
          if(layerInfo &&
             layerInfo.layerObject &&
             layerInfo.layerObject.declaredClass !== "esri.layers.ArcGISDynamicMapServiceLayer" &&
             layerInfo.layerObject.declaredClass !== "esri.layers.ArcGISTiledMapServiceLayer" &&
             layerInfo.layerObject.declaredClass !== "esri.layers.FeatureCollection") {
            var domNodes = this.layerChooser.getLayerAssociateDomNodesById(layerInfo.id);
            if(domNodes && domNodes.collapseIcon) {
              html.setStyle(domNodes.collapseIcon, 'background-image', 'none');
            }
          }
        }, this);
      },

      _onSyncWithWebmapToggleChange: function(checked) {
        if(checked) {
          this._setLayerChooser(null);
          this.layerChooser.setViewMode(true);
        } else {
          this.layerChooser.setViewMode(false);
          this._setLayerChooser(this.config.layerState);
        }
      },

      _onRefreshButtonClick: function() {
        if(!this.syncWithWebmapToggle.checked) {
          this._setLayerChooser();
        }
      }

    });
  });
