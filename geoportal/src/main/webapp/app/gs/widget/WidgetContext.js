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
  "dojo/Deferred",
  "dojo/promise/all",
  "./layers/LayerLoader"],
function(declare, lang, Deferred, all, LayerLoader) {

  var _def = declare([], {

    i18n: null,
    view: null,
    secondaryView: null,  // The other view (sceneView if view is mapView, or vice versa)
    proxyUrl: null,
    supportsRemove: true,
    widgetConfig: null,
    widgetFolder: "gs/widget",

    constructor: function(args) {
      lang.mixin(this, args);
    },

    addItem: function(serviceType,serviceUrl,item,itemUrl,referenceId) {
      var self = this;
      var dfd = new Deferred();
      
      // Create layer loader for primary view
      var layerLoader = new LayerLoader({
        i18n: this.i18n,
        view: this.getView(),
        referenceId: referenceId
      });
      
      // Add to primary view first
      layerLoader.addItem(serviceType,serviceUrl,item,itemUrl).then(function(result) {
        // If we have a secondary view, add to it as well
        if (self.secondaryView) {
          var secondaryLoader = new LayerLoader({
            i18n: self.i18n,
            view: self.secondaryView,
            referenceId: referenceId
          });
          secondaryLoader.addItem(serviceType,serviceUrl,item,itemUrl).then(function() {
            dfd.resolve(result);
          }).catch(function(error) {
            console.warn("Failed to add layer to secondary view:", error);
            // Still resolve since primary succeeded
            dfd.resolve(result);
          });
        } else {
          dfd.resolve(result);
        }
      }).catch(function(error) {
        dfd.reject(error);
      });
      
      return dfd;
    },

    addLayer: function(serviceType,serviceUrl,referenceId) {
      var self = this;
      var dfd = new Deferred();
      
      // Create layer loader for primary view
      var layerLoader = new LayerLoader({
        i18n: this.i18n,
        view: this.getView(),
        referenceId: referenceId
      });
      
      // Add to primary view first
      layerLoader.addLayer(serviceType,serviceUrl).then(function(result) {
        // If we have a secondary view, add to it as well
        if (self.secondaryView) {
          var secondaryLoader = new LayerLoader({
            i18n: self.i18n,
            view: self.secondaryView,
            referenceId: referenceId
          });
          secondaryLoader.addLayer(serviceType,serviceUrl).then(function() {
            dfd.resolve(result);
          }).catch(function(error) {
            console.warn("Failed to add layer to secondary view:", error);
            // Still resolve since primary succeeded
            dfd.resolve(result);
          });
        } else {
          dfd.resolve(result);
        }
      }).catch(function(error) {
        dfd.reject(error);
      });
      
      return dfd;
    },

    getGeographicExtent: function() {
      if (this.view) {
        return this.view.extent;
      }
    },

    getView: function() {
      return this.view;
    },
    
    getSecondaryView: function() {
      return this.secondaryView;
    },

    showError: function(title,error) {
      console.warn("wro/Context.showError",title,error);
    },

    showMessage: function(title,message) {
      console.warn("wro/Context.showMessage",title,message);
    },

    showMessages: function(title,subTitle,messages) {
      console.warn("wro/Context.showMessages",title,subTitle,messages);
    }

  });

  return _def;
});