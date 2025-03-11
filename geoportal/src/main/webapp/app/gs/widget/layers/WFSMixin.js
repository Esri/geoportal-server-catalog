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
  "esri4/layers/WFSLayer"
 ],
function(declare, array, all, Deferred, layerUtil, util, WFSLayer) {

  var _def = declare(null, {

    addWFS: function(serviceUrl,item,itemData) {
      var dfd = new Deferred();
      var referenceId = util.generateId();
	  var options = {id:referenceId,url:serviceUrl};
      var layer = new WFSLayer(options);
      layer.load();
      //TODO handle portal item 
      var self = this;
      layerUtil.waitForLayer(self.i18n,layer).then(function(lyr){        
    	  var popupInfo = layerUtil.newPopupInfo(lyr,(lyr.title? lyr.title: lyr.name));
          var popupTemplate = layerUtil.newPopupTemplate(popupInfo);
          lyr.popupTemplate = popupTemplate;
          layerUtil.addMapLayer(self.view,lyr,item,self.referenceId);
          dfd.resolve(lyr);
      }).catch(function(error){        
        dfd.reject(error);
      });
      
      return dfd;
    }
  });

  return _def;

});
