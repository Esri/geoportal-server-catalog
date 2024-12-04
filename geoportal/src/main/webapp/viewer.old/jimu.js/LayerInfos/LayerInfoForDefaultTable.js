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
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/Deferred',
  'dojo/aspect',
  './LayerInfoForDefault',
  './LayerObjectFacory',
  'esri/dijit/PopupTemplate'
], function(declare, lang, html, Deferred, aspect, LayerInfoForDefault, LayerObjectFacory,
PopupTemplate) {
  return declare(LayerInfoForDefault, {
    _layerObjectFacory: null,
    constructor: function() {
      this.newSubLayers = [];
      this.isTable = true;
      // init _layerObjectFacory
      this._layerObjectFacory = new LayerObjectFacory(this);
    },

    init: function() {
    },

    _getLayerObject: function() {
      var def = new Deferred();
      this._layerObjectFacory.getLayerObject().then(lang.hitch(this, function(layerObject) {
        if(this.layerObject.empty && layerObject) {
          this.layerObject = layerObject;
          this._bindEventAfterLayerObjectLoaded();
        }
        def.resolve(layerObject);
      }));
      return def;
    },

    getLayerObject: function() {
      return this._getLayerObject();
    },

    /*
    getLayerObject: function() {
      var def = new Deferred();
      if(this.layerObject.empty) {
        if(this.layerObject.url) {
          var options = this._getLayerOptionsForCreateLayerObject();
          this.layerObject = new FeatureLayer(this.layerObject.url,
                                        lang.mixin(options, this.originOperLayer.options || {}) || {});
          this.layerObject.on('load', lang.hitch(this, function() {
            // change layer.name, need move to layerObject factory. Todo...
            if(!this.layerObject.empty &&
               this.layerObject.name &&
               !lang.getObject("_wabProperties.originalLayerName", false, this.layerObject)) {
              lang.setObject('_wabProperties.originalLayerName',
                             this.layerObject.name,
                             this.layerObject);
              this.layerObject.name = this.title;
            }
            this._bindEventAfterLayerObjectLoaded();
            def.resolve(this.layerObject);
          }));
          this.layerObject.on('error', lang.hitch(this, function(err) {
            //def.reject(err);
            def.resolve(null);
          }));
        } else if(this.layerObject.featureCollectionData){
          this.layerObject = new FeatureLayer(this.layerObject.featureCollectionData,
                                              this.originOperLayer.options || {});
          // this.layerObject.on('load', lang.hitch(this, function() {
          //   def.resolve(this.layerObject);
          // }));
          // this.layerObject.on('error', lang.hitch(this, function(err) {
          //   //def.reject(err);
          //   def.resolve(null);
          // }));
          def.resolve(this.layerObject);
        } else {
          def.resolve(null);
        }
      } else {
        def.resolve(this.layerObject);
      }
      return def;
    },
    */

    getPopupInfoFromLayerObject: function() {
      // trying get popupInfo from webmap.
      var popupInfo = this.getPopupInfo();
      if(!popupInfo && this.layerObject && !this.layerObject.empty) {
        popupInfo = this._getDefaultPopupInfo(this.layerObject);
      }
      return popupInfo;
    },

    loadPopupInfo: function() {
      var def = new Deferred();
      var popupInfo = this.getPopupInfo();
      if(popupInfo) {
        def.resolve(popupInfo);
      } else {
        this.getLayerObject().then(lang.hitch(this, function() {
          popupInfo = this._getDefaultPopupInfo(this.layerObject);
          def.resolve(popupInfo);
        }));
      }
      return def;
    },

    getLayerType: function() {
      var def = new Deferred();
      def.resolve("Table");
      return def;
    },

    isVisible: function() {
      return false;
    },

    isLeaf: function() {
      return true;
    },

    isRootLayer: function() {
      return false;
    },

    createLegendsNode: function() {
      var legendsNode = html.create("div", {
        "class": "legends-div"
      });
      return legendsNode;
    },

    // because of table's layerObject has not been loaded when init,
    // according to this.originOperLayer.popupInfo to decide the value of controlPopupInfo.
    // and it honor default popup enable setting of webmap.
    _initControlPopup: function() {
      this.inherited(arguments);
      this.controlPopupInfo = {
        enablePopup: this.originOperLayer.popupInfo ? true : false,
        infoTemplate: this.originOperLayer.popupInfo ? new PopupTemplate(this.originOperLayer.popupInfo) : null
      };
    },

    _bindEventAfterLayerObjectLoaded: function() {
      // bind filter change event
      var handle = aspect.after(this.layerObject,
                             'setDefinitionExpression',
                             lang.hitch(this, this._onFilterChanged));
      this._eventHandles.push(handle);
    },

    // Todo ...
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
        if(filter === undefined) {
          filter = this.getFilterOfWebmap();
        }
      } else {
        filter = this.getFilterOfWebmap();
      }
      return filter;
    }

    // setFilter: function() {
    //   // summary:
    //   //   set filter to layerObject, this is a async method.
    //   var fullArguments = arguments;
    //   return this.getLayerObject().then(lang.hitch(this, function() {
    //     this.inherited(fullArguments);
    //     return;
    //   }));
    // }
  });
});
