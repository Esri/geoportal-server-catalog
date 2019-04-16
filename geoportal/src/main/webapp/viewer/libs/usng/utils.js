///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2017 Esri. All Rights Reserved.
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

/**
 * usng/utils.js is for USNG and MGRS functions that were not part of the original usng.js
 * open source library that is in usng/usng.js. In other words, USNG and MGRS functions written
 * specifically for this application belong in usng/utils.js, not usng/usng.js.
 */

define(["libs/usng/usng"], function(usng) {

  var theClass = {
  
    /**
     * Looks up an MGRS or USNG string and returns a result object with text,
     * latitude, and longitude properties, or null if the string is not a valid
     * MGRS or USNG string.
     */
    lookupMgrs: function(mgrs) {
      var result = null;
      try {
        var latLon = [];
        usng.USNGtoLL(mgrs, latLon);
        if (2 <= latLon.length && !isNaN(latLon[0]) && !isNaN(latLon[1])) {
          result = {
            text: mgrs.toUpperCase(),
            latitude: latLon[0],
            longitude: latLon[1]
          };
        } else {
          result = null;
        }
      } catch (err) {
        //Not an MGRS/USNG string; that's fine; swallow
        result = null;
      }
      return result;
    }
  };
  return theClass;
});