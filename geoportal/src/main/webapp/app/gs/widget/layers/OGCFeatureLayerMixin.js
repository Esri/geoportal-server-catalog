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
	"dojo/_base/array",
	 "dojo/promise/all",
	  "dojo/Deferred",
  "./layerUtil",
  "../util",
  "esri4/layers/OGCFeatureLayer"],
function(declare, array,all, Deferred, layerUtil, util, OGCFeatureLayer) {

  var _def = declare(null, {

    addOGCFeatureLayer: function(serviceUrl,item,itemData) {
      var self = this, layerDfds = [];
      //Read collections 
      var collectionUrl = serviceUrl+"/collections";
      util.readRestInfo(collectionUrl).then(function(result) {
    	  var response = result.data; 
    	  var list = [];
    	  if(response.collections)
    	  {
    		  var collectionList = response.collections;
    		  var collection;
    		  for(var i=0;i<collectionList.length;i++)
			  {
    			  collection = collectionList[i];
    			  if(collection.id)
				  {
    				  list.push(collection.id);
				  }
			  }
    		  
    		  if (list.length > 0) {	
    	            array.forEach(list, function(collectionId)
    	            {	             
		                var layer = new OGCFeatureLayer({
		                  url:serviceUrl,
		                  id: util.generateId(),
		                  collectionId:collectionId
		                });
		                layer.load();
		                layerDfds.push(layerUtil.waitForLayer(self.i18n,layer));
	            });
    		  	}else {    	            
    	            console.warn("No OGC feature layers...");
    	        }
    		  all(layerDfds).then(function(featureLayers){
    			  array.forEach(featureLayers, function(layer) {
    				  if (layer && item) {
        		          layer.title = item.title;
        		        }
        		        layerUtil.addMapLayer(self.view,layer,item,self.referenceId);
    			  });    			
    		  });
    	  }
      }).catch(function(error) {
          console.error(error);
          dfd.reject(error);
        });
      return dfd;
    }

  });

  return _def;
});
