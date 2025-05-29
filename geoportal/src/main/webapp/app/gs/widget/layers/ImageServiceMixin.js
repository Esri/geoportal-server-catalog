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
  "dojo/Deferred",
  "./layerUtil",
  "../util",
  "esri4/core/lang",
  "esri4/layers/ImageryLayer", 
  "esri4/layers/support/MosaicRule",
  "esri4/layers/support/RasterFunction"],
function(declare, Deferred, layerUtil, util, esriLang, ImageryLayer,
   MosaicRule, RasterFunction) {

  var _def = declare(null, {

    addImageService: function(serviceUrl,item,itemData) {
      var self = this, dfd = new Deferred();
      var mapLayerId = util.generateId();
      var layerUrl = serviceUrl;
      var layerObject = {
        mapLayerId: mapLayerId,
        bandIds: null,
        format: null,
        compressionQuality: null,
        opacity: 1.0,
        visibility: true
      };
      itemData = itemData || {};

      if (itemData.visible && itemData.visible === false) {
        layerObject.visible = false; // TODO?
      }
      if (itemData.opacity) {
        layerObject.opacity = itemData.opacity;
      }
      if (itemData.minScale && !layerObject.minScale) {
        layerObject.minScale = itemData.minScale;
      }
      if (itemData.maxScale && !layerObject.maxScale) {
        layerObject.maxScale = itemData.maxScale;
      }
      if (itemData.refreshInterval &&
         !layerObject.refreshInterval) {
        layerObject.refreshInterval = itemData.refreshInterval;
      }
      if (itemData.popupTemplate && !layerObject.popupTemplate && layerObject.popupEnabled) {
        layerObject.popupTemplate = itemData.popupTemplate;
      }
      if (itemData.renderingRule && !layerObject.renderingRule) {
        layerObject.renderingRule = itemData.renderingRule;
        if (itemData.renderingRule.functionName) {
          layerObject.renderingRule.rasterFunction = itemData.renderingRule.functionName;
        }
      }
      if (itemData.bandIds && !layerObject.bandIds) {
        layerObject.bandIds = itemData.bandIds;
      }
      if (itemData.mosaicRule && !layerObject.mosaicRule) {
        layerObject.mosaicRule = itemData.mosaicRule;
      }
      if (itemData.format && !layerObject.format) {
        layerObject.format = itemData.format;
      }
      if (itemData.compressionQuality &&
         !layerObject.compressionQuality) {
        layerObject.compressionQuality = itemData.compressionQuality;
      }
      if (itemData.layerDefinition && itemData.layerDefinition.definitionExpression &&
         (!layerObject.layerDefinition ||
          !layerObject.layerDefinition.definitionExpression)) {
        layerObject.layerDefinition = layerObject.layerDefinition || {};
        layerObject.layerDefinition.definitionExpression =
          itemData.layerDefinition.definitionExpression;
      }

      var lyr = new ImageryLayer(layerUrl);
      lyr.load();
      layerUtil.waitForLayer(this.i18n,lyr).then(function(layer){
        if (layerObject.layerDefinition && layerObject.layerDefinition.definitionExpression) {
          layer.setDefinitionExpression(layerObject.layerDefinition.definitionExpression,true);
        }
       
        if (layerObject.popupTempplate) {
          layer.setPopupTemplate(popupTempplate);
        }
       
        layerUtil.addMapLayer(self.view,layer,item,self.referenceId);
        dfd.resolve(layer);
      }).catch(function(error){
        dfd.reject(error);
      });
      return dfd;
    }

  });

  return _def;
});
