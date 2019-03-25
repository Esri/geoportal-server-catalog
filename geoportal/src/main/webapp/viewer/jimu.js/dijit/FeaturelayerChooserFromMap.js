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
  'dojo/Deferred',
  'dojo/_base/html',
  'dojo/_base/lang',
  './LayerChooserFromMap'
],
function(declare, Deferred, html, lang, LayerChooserFromMap) {
  return declare([LayerChooserFromMap], {
    baseClass: 'jimu-featurelayer-chooser-from-map',
    declaredClass: 'jimu.dijit.FeaturelayerChooserFromMap',

    //options:
    types: null,//available values:['point','polyline','polygon']
    showLayerFromFeatureSet: false,
    showTable: false,//if true, types will be ignored for table layer
    onlyShowVisible: false,//if the layer is a Table, this option is ignored
    ignoredFeaturelayerIds: null,//an array of ignored feature layer ids
    mustSupportStatistics: false,
    ignoreVirtualLayer: false,

    //public methods:
    //getSelectedItems return [{name, url, layerInfo}]

    //methods need to be override:
    //getHandledItem
    //filter

    postMixInProperties:function(){
      this.inherited(arguments);
      if(!this.ignoredFeaturelayerIds){
        this.ignoredFeaturelayerIds = [];
      }
      this.basicFilter = lang.hitch(this, this.basicFilter);
      this.filter = LayerChooserFromMap.createFeaturelayerFilter(this.types,
                                                                 this.showLayerFromFeatureSet,
                                                                 this.showTable,
                                                                 this.mustSupportStatistics);

      if(this.ignoreVirtualLayer){
        this.filter = LayerChooserFromMap.andCombineFilters(
          [this.filter, lang.hitch(this, this._ignoreVirtualLayerFilter)]
        );
      }
    },

    postCreate: function(){
      this.inherited(arguments);
      html.addClass(this.domNode, 'jimu-basic-layer-chooser-from-map');
    },

    _ignoreVirtualLayerFilter: function(layerInfo){
      return layerInfo.getLayerType().then(function(layerType) {
        var virtualLayer = layerType === 'ArcGISDynamicMapServiceLayer' ||
          layerType === 'ArcGISTiledMapServiceLayer' || layerType === 'GroupLayer';
        return !virtualLayer;
      });
    },

    //override basicFilter method of LayerChooserFromMap
    basicFilter: function(layerInfo) {
      var def = new Deferred();
      if(this.ignoredFeaturelayerIds.indexOf(layerInfo.id) >= 0){
        def.resolve(false);
      }else{
        if (this.onlyShowVisible && layerInfo.getLayerType() !== 'Table') {
          def.resolve(layerInfo.isShowInMap());
        } else {
          def.resolve(true);
        }
      }
      return def;
    },

    //both getSelectedItems and getAllItems return [{name, url, layerInfo}]
    //return [{name, url, layerInfo}], if featurecollection, url is empty
    getHandledItem: function(item){
      var result = this.inherited(arguments);
      var layerInfo = item && item.layerInfo;
      var layerObject = layerInfo && layerInfo.layerObject;
      var url = (layerObject && layerObject.url) || '';
      result.url = url;
      return result;
    }

  });
});