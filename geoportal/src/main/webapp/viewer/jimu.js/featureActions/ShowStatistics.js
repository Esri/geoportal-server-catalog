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
  '../BaseFeatureAction',
  'jimu/dijit/FieldStatistics'
], function(declare, BaseFeatureAction, FieldStatistics){
  var clazz = declare(BaseFeatureAction, {
    iconClass: 'icon-statistics',

    isFeatureSupported: function(featureSet, layer){
      return featureSet.features.length > 1 && layer && layer.declaredClass !== "esri.layers.GraphicsLayer" &&
        this.getNumbericFields(layer).length > 0;
    },

    onExecute: function(featureSet, layer){
      var stat = new FieldStatistics();
      var statInfo = {
        featureSet: featureSet,
        layer: layer,
        fieldNames: this.getNumbericFields(layer).map(function(f){
          return f.name;
        })
      };

      stat.showContentAsPopup(statInfo);
    },

    getNumbericFields: function(layer){
      return layer.fields.filter(function(f){
        return ['esriFieldTypeSmallInteger',
              'esriFieldTypeInteger',
              'esriFieldTypeSingle',
              'esriFieldTypeDouble'].indexOf(f.type) > -1;
      });
    }

  });
  return clazz;
});