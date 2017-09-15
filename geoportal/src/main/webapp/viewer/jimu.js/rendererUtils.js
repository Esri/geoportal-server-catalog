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
    'esri/renderers/jsonUtils'
  ],
  function(rendererJsonUtils) {
    var mo = {};

    //public methods:
    //cloneRenderer

    mo.cloneRenderer = function(renderer){
      if(!renderer){
        return null;
      }

      var clone = null;

      try{
        var rendererJson = renderer.toJson();
        clone = rendererJsonUtils.fromJson(rendererJson);
      }
      catch(e){
        console.error(e);
      }

      return clone;
    };

    mo.isSimpleRenderer = function(renderer){
      return renderer && renderer.declaredClass === 'esri.renderer.SimpleRenderer';
    };

    mo.isUniqueValueRenderer = function(renderer){
      return renderer && renderer.declaredClass === 'esri.renderer.UniqueValueRenderer';
    };

    mo.isClassBreaksRenderer = function(renderer){
      return renderer && renderer.declaredClass === 'esri.renderer.ClassBreaksRenderer';
    };

    mo.isDotDensityRenderer = function(renderer){
      return renderer && renderer.declaredClass === 'esri.renderer.DotDensityRenderer';
    };

    mo.isScaleDependentRenderer = function(renderer){
      return renderer && renderer.declaredClass === 'esri.renderer.ScaleDependentRenderer';
    };

    mo.isTemporalRenderer = function(renderer){
      return renderer && renderer.declaredClass === 'esri.renderer.TemporalRenderer';
    };

    return mo;
  });