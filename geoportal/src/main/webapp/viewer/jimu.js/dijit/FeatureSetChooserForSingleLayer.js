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
  'dojo/on',
  'dojo/Evented',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/dijit/DrawBox',
  'jimu/dijit/_FeatureSetChooserCore',
  'esri/symbols/jsonUtils'
],
function(on, Evented, lang, array, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, DrawBox,
  _FeatureSetChooserCore, symbolJsonUtils) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    baseClass: 'jimu-single-layer-featureset-chooser',
    templateString: "<div></div>",
    drawBox: null,

    //constructor options:
    map: null,
    featureLayer: null,
    updateSelection: false,

    //public methods:
    //enable
    //disable
    //deactivate
    //clearAllGraphics
    //isLoading
    //getFeatures, return a deferred object which resolves features

    //events:
    //user-clear
    //loading
    //unloading
    //draw-activate
    //draw-deactivate

    postCreate:function(){
      this.inherited(arguments);

      //init DrawBox
      var fillSymbol = symbolJsonUtils.fromJson({
        "style": "esriSFSSolid",
        "color": [79, 129, 189, 77],
        "type": "esriSFS",
        "outline": {
          "style": "esriSLSSolid",
          "color": [54, 93, 141, 255],
          "width": 1.5,
          "type": "esriSLS"
        }
      });
      this.drawBox = new DrawBox({
        map: this.map,
        showClear: true,
        keepOneGraphic: true,
        geoTypes: ['EXTENT']//['POLYGON']
      });
      this.drawBox.setPolygonSymbol(fillSymbol);
      var drawItemIcons = this.drawBox.getDrawItemIcons();
      array.forEach(drawItemIcons, lang.hitch(this, function(drawItemIcon){
        drawItemIcon.title = "";
      }));
      this.drawBox.extentIcon.title = window.jimuNls.spatialFilterByFeatures.drawShapesTip;
      this.drawBox.placeAt(this.domNode);
      this.own(on(this.drawBox, 'user-clear', lang.hitch(this, this._onDrawBoxUserClear)));
      this.own(on(this.drawBox, 'draw-activate', lang.hitch(this, function(){
        this.emit('draw-activate');
      })));
      this.own(on(this.drawBox, 'draw-deactivate', lang.hitch(this, function(){
        this.emit('draw-deactivate');
      })));
      this.own(on(this.drawBox, 'draw-end', lang.hitch(this, this._onDrawEnd)));

      //init featureSetChooserCore
      this.featureSetChooserCore = new _FeatureSetChooserCore({
        map: this.map,
        featureLayer: this.featureLayer,
        drawBox: this.drawBox,
        updateSelection: this.updateSelection
      });

      this.own(on(this.featureSetChooserCore, 'loading', lang.hitch(this, function(){
        this.emit('loading');
      })));

      this.own(on(this.featureSetChooserCore, 'unloading', lang.hitch(this, function(){
        this.emit('unloading');
      })));

      this.own(on(this.featureLayer, 'visibility-change', lang.hitch(this, function(){
        if(this.featureLayer.visible){
          this.drawBox.enable();
        }else{
          this.drawBox.disable();
        }
      })));
    },

    // reset: function(){
    //   this.drawBox.reset();
    //   this.clearAllGraphics();
    // },

    getFeatures: function(){
      return this.featureSetChooserCore.getFeatures();
    },

    syncGetFeatures: function(){
      return this.featureSetChooserCore.syncGetFeatures();
    },

    disable: function(){
      this.drawBox.disable();
    },

    enable: function(){
      this.drawBox.enable();
    },

    deactivate: function(){
      this.drawBox.deactivate();
    },

    clearAllGraphics: function(){
      this.featureSetChooserCore.clear(false);
    },

    isLoading: function(){
      return this.featureSetChooserCore.isLoading();
    },

    getFeatureLayer: function(){
      return this.featureLayer;
    },

    destroy: function(){
      if(this.featureSetChooserCore){
        this.featureSetChooserCore.destroy();
      }
      this.featureSetChooserCore = null;
      this.inherited(arguments);
    },

    _onDrawEnd: function(){
      this.drawBox.clear();
    },

    _onDrawBoxUserClear: function(){
      this.clearAllGraphics();
      this.emit("user-clear");
    },

    //private method
    showMiddleFeatureLayer: function(){
      if(this.featureSetChooserCore){
        this.featureSetChooserCore.showMiddleFeatureLayer();
      }
    },

    //private method
    hideMiddleFeatureLayer: function(){
      if(this.featureSetChooserCore){
        this.featureSetChooserCore.hideMiddleFeatureLayer();
      }
    }

  });
});