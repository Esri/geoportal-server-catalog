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
  "esri4/layers/GroupLayer",
  "esri4/portal/Portal",
  "esri4/portal/PortalItem"],
        function (declare, array, all, Deferred, layerUtil, util, GroupLayer, Portal, PortalItem) {

          var _def = declare(null, {

            addGroupLayer: function (serviceUrl, item, itemDataObj) {
              var itemData;
              var dfd = new Deferred();
              var self = this;
              var portalBaseUrl;
              if (itemDataObj)
                itemData = itemDataObj.data;

              if (!itemData) {
                let idIndex = serviceUrl.indexOf("?id=");
                let itemId = serviceUrl.substring(idIndex + 4);

                let domain = util.getDomainFromUrl(serviceUrl);
                if (domain.endsWith(".arcgis.com")) {
                  itemInfoUrl = "https://www.arcgis.com/sharing/rest/content/items/" + itemId;
                }//On Premise Portal
                else {
                  let homeIndex = serviceUrl.indexOf("/home");
                  portalBaseUrl = serviceUrl.substring(0, homeIndex);
                  itemInfoUrl = portalBaseUrl + "/sharing/rest/content/items/" + itemId;
                }
                var readItemJson = util.readItemJsonData(itemInfoUrl);
                readItemJson.then(function (itemDataObj) {
                  var itemData = itemDataObj.data;
                  let arcGisPortal;
                  if (portalBaseUrl)
                  {
                    arcGisPortal = new Portal({
                      url: portalBaseUrl
                    });
                  } else
                  {
                    arcGisPortal = new Portal({
                      url: "https://www.arcgis.com"
                    });
                  }
                  let item = new PortalItem({
                    id: itemId,
                    portal: arcGisPortal // This loads the item
                  });

                  var groupLayer = new GroupLayer({
                    title: itemData.title,
                    portalItem: item

                  });
                  groupLayer.load();
                  var lyrDfd = layerUtil.waitForLayer(self.i18n, groupLayer);
                  lyrDfd.then(function (layer) {
                    layerUtil.setGroupLayerPopupTemplate(layer, itemData);
                    layerUtil.addMapLayer(self.view, layer, null, self.referenceId);
                    dfd.resolve(layer);
                  });
                });
              } else if (itemData && itemData.layers) {
                dfd = self.addGroupLayerToMap(item.id, itemData, self.view, self.referenceId);
              }
              return dfd;
            },
            addGroupLayerToMap: function (itemId, itemData, view, referenceId) {
              var self = this;

              var groupLayer = new GroupLayer({
                title: itemData.title,
                portalItem: {// autocasts as new PortalItem()
                  id: itemId
                }
              });
              groupLayer.load();
              var dfd = layerUtil.waitForLayer(self.i18n, groupLayer);
              dfd.then(function (layer) {
                layerUtil.setGroupLayerPopupTemplate(layer, itemData);
                layerUtil.addMapLayer(view, layer, null, referenceId);
                dfd.resolve(layer);
              });
              return dfd;
            }

          });
          return _def;
        });
