/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(["dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/array",
  "dojo/Deferred",
  "dojo/promise/all",
  "./layerUtil",
  "../util",
  "esri4/layers/MapImageLayer",
  "esri4/layers/TileLayer",  
  "esri4/rest/support/ImageParameters",
  "esri4/core/reactiveUtils"
  ],
function(declare, lang, array, Deferred, all, layerUtil, util,
		MapImageLayer, TileLayer,
  ImageParameters,reactiveUtils) {

  var _def = declare(null, {

    addMapService: function(serviceUrl,item,itemData) {
      var self = this, dfd = new Deferred();
      var isSingleFeatureLayer = false;
      var isTilelayer = false;
      var lyrImageFormat = "PNG24"
      util.readRestInfo(serviceUrl).then(function(result) {
    	var response = result.data; 
        if (response && typeof response.type === "string" &&
           (response.type === "Feature Layer" || response.type === "Table")) {
          isSingleFeatureLayer = true;          
          return self.addFeatureService(serviceUrl,item,itemData);
        } else {
          var lyr;         
          if (response.tileInfo) {
        	isTilelayer = true;  
            lyr = new TileLayer({url:serviceUrl,tileInfo:response.tileInfo,id: util.generateId()});
            lyr.load();
          } else {
            if (response && response.supportedImageFormatTypes &&
                response.supportedImageFormatTypes.indexOf("PNG32") !== -1) {
            	lyrImageFormat = "PNG32";             
            }
            lyr = new MapImageLayer({url:serviceUrl,id:util.generateId(),imageFormat:lyrImageFormat});
           
            lyr.load();
          }
          return self._waitThenAddDynamicLayer(lyr,item,itemData,isTilelayer);
        }
      }).then(function(result) {
        dfd.resolve(result);
      })
      .catch(function(error) {
        dfd.reject(error);
      });
      return dfd;
    },
    
    _waitThenAddDynamicLayer: function(lyr,item,itemData,isTileLayer) {
      var self = this;
      dfd = new Deferred();

      reactiveUtils.watch(() => lyr.loadError,(loadError) => {
    	  if (loadError.message && (loadError.message.indexOf("Unable to complete") !== -1)) {
              console.warn("layerAccessError", loadError);
              dfd.reject(new Error(i18n.search.layerInaccessible));
            } else {
              dfd.reject(loadError);
            }
      });
      reactiveUtils.watch(() => lyr.loaded === true,() => {
    	  //console.log("layer loaded");    
    	  if(!isTileLayer)
    		  layerUtil.setMapServicePopupTemplate(lyr,itemData);
          layerUtil.addMapLayer(self.view,lyr,item,self.referenceId);
          dfd.resolve(lyr);
    	  
      });

      return dfd;
    }

  });

  return _def;
});
