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
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/declare',
  './LayerChooserFromMap'
],
function(lang, html, declare, LayerChooserFromMap) {
  return declare([LayerChooserFromMap], {
    baseClass: 'jimu-queryable-layer-chooser-from-map',
    declaredClass: 'jimu.dijit.QueryableLayerChooserFromMap',

    //options:
    showImageLayer: true,
    mustSupportStatistics: false,
    ignoreVirtualLayer: false,

    //public methods:
    //getSelectedItems return [{name, url, layerInfo}]

    //methods need to be override:
    //getHandledItem

    postMixInProperties:function(){
      this.inherited(arguments);

      if(this.showImageLayer){
        this.filter = LayerChooserFromMap.createQueryableLayerFilter(this.mustSupportStatistics);
      }else{
        this.filter = LayerChooserFromMap.createFeaturelayerFilter(
          ['point', 'polyline', 'polygon'], false, true, this.mustSupportStatistics
        );
      }

      if(this.ignoreVirtualLayer){
        this.filter = LayerChooserFromMap.andCombineFilters(
          [this.filter, lang.hitch(this, this._ignoreVirtualLayerFilter)]
        );
      }
    },

    _ignoreVirtualLayerFilter: function(layerInfo){
      return layerInfo.getLayerType().then(function(layerType) {
        var virtualLayer = layerType === 'ArcGISDynamicMapServiceLayer' ||
          layerType === 'ArcGISTiledMapServiceLayer' || layerType === 'GroupLayer';
        return !virtualLayer;
      });
    },

    postCreate: function(){
      this.inherited(arguments);
      html.addClass(this.domNode, 'jimu-basic-layer-chooser-from-map');
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