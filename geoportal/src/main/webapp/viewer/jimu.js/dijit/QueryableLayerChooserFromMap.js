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
  './LayerChooserFromMap',
  'dojo/_base/html'
],
function(declare, LayerChooserFromMap, html) {
  return declare([LayerChooserFromMap], {
    baseClass: 'jimu-queryable-layer-chooser-from-map',
    declaredClass: 'jimu.dijit.QueryableLayerChooserFromMap',

    //public methods:
    //getSelectedItems return [{name, url, layerInfo}]

    //methods need to be override:
    //getHandledItem

    postMixInProperties:function(){
      this.inherited(arguments);
      this.filter = LayerChooserFromMap.createQueryableLayerFilter();
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