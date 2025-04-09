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
  "esri4/layers/WFSLayer",
  "esri4/layers/ogc/wfsUtils"
 ],
function(declare, array, all, Deferred, layerUtil, util, WFSLayer,wfsUtils) {

  var _def = declare(null, {

    addWFS: function(serviceUrl,item,itemData) {
      var dfd = new Deferred();
      var layerDfds = [],featureLayers = [];
      var referenceId = util.generateId();
      
      var self = this;
      wfsUtils.getCapabilities(serviceUrl).then((wfsCapabilities) => {
    	  featureTypes =  wfsCapabilities.featureTypes;
    	  self.featureLen = featureTypes.length;
    	  //Allow max 10
    	  if(self.featureLen >10)
    		  {
    		  self.featureLen = 10;
    		  }
    	  featureTypes.forEach((feature) => {
    		  wfsUtils.getWFSLayerInfo(wfsCapabilities, feature.title).then((wfsLayerInfo) => {
      		    // create a WFSLayer from the layer info
      		    layer = WFSLayer.fromWFSLayerInfo(wfsLayerInfo);
      		    layer.load();
      		    layerDfds.push(layerUtil.waitForLayer(self.i18n,layer));	
      		     
      		  all(layerDfds).then(function(results)
  			      {
  			    	  if(results.length === self.featureLen)
  			    		  {
  			    		  console.log("all features loaded");
	  			    		array.forEach(results, function(result) {
	    			              featureLayers.push(result);
	    			            });	    			    	  
	    			    	  featureLayers.reverse();
	    			          return featureLayers;
  			    		  }
  			    	  
  			      }).then(function()
  			      {
  					  array.forEach(featureLayers, function(lyr) {		    		 
  		            	  var popupInfo = layerUtil.newPopupInfo(lyr,(lyr.title? lyr.title: lyr.name));
  		                  var popupTemplate = layerUtil.newPopupTemplate(popupInfo);
  		                  lyr.popupTemplate = popupTemplate;
  		                  layerUtil.addMapLayer(self.view,lyr,item,self.referenceId);	
  		                  dfd.resolve();
  		               
  		              });
  			      })
  			      .then(function() {
  			          dfd.resolve(featureLayers);
  			        }).catch(function(error) {
  			          console.error(error);
  			          dfd.reject(error);
  			        });
  		    
    		  });
    	  })
      });
      
      return dfd;
    }
  });

  return _def;

});
