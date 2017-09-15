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

define(['dojo/_base/declare',
  'esri/geometry/Extent'
],
  function (declare, Extent) {
  var instance = null, clazz;

  clazz =  declare(null, {
    map: null,

    setMap: function(map){
      this.map = map;
    },

    handleMapChangeEvent: function(evtInfo){
      switch(evtInfo.evtName){
        case 'sync/map/extent-change':
          return this._onExtentChange(evtInfo.evt);
        default:
          console.error('Unknown event name:', evtInfo.evtName);
      }
    },

    _onExtentChange: function(extent){
      this.map.setExtent(new Extent(extent));
    }

  });

  clazz.getInstance = function() {
    if(instance === null) {
      instance = new clazz();
    }
    return instance;
  };
  return clazz;
});