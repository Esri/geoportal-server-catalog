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
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "app/common/Templated",
  "dojo/text!./templates/CollectionsPanel.html",
  "dojo/i18n!../gs/widget/nls/strings",
  "dojo/Deferred",
  "esri4/Map",
  "esri4/views/MapView",
  "esri4/layers/TileLayer",
  "esri4/layers/MapImageLayer",
  "esri4/layers/FeatureLayer",
  "esri4/layers/WFSLayer",
  "esri4/layers/GraphicsLayer",
  "esri4/widgets/Search",
  "esri4/widgets/LayerList",
  "esri4/widgets/FeatureTable",
  "esri4/widgets/Legend",
  "esri4/widgets/Home",
  "esri4/Graphic",
  "esri4/views/draw/Draw",
  "esri4/widgets/Expand",
  "esri4/widgets/BasemapGallery",
  "esri4/core/reactiveUtils",
  "../gs/widget/WidgetContext",
  "../gs/base/LayerProcessor",
  "app/context/AppClient",
], function (
  declare,
  lang,
  Templated,
  template,
  i18n,
  Deferred,
  Map,
  MapView,
  TileLayer,
  MapImageLayer,
  FeatureLayer,
  WFSLayer,
  GraphicsLayer,
  SearchWidget,
  LayerList,
  FeatureTable,
  Legend,
  Home,
  Graphic,
  Draw,
  Expand,
  BasemapGallery,
  reactiveUtils,
  WidgetContext,
  LayerProcessor,
  AppClient
) {
  var oThisClass = declare([Templated], {
    i18n: i18n,
    templateString: template,
    mapWasInitialized: false,

    actions: {
      DELETE_COLLECTION: "DELETE_COLLECTION",
      UPDATE_COLLECTION: "UPDATE_COLLECTION",
      CREATE_COLLECTION: "CREATE_COLLECTION",
      READ_COLLECTION: "READ_COLLECTION",
      NONE: "NONE",
    },

    appActionState: "NONE",
    collections: [],
    selectedCollection: null,
    sampleCollection: [
      {
        id: 1,
        title: "Rotterdam",
        description:
          "A port city in the Netherlands known for modern architecture.",
      },
      {
        id: 2,
        title: "Hamburg",
        description:
          "A major port city in northern Germany, famous for its maritime heritage.",
      },
      {
        id: 3,
        title: "Antwerp",
        description:
          "A city in Belgium known for its diamond district and medieval architecture.",
      },
      {
        id: 4,
        title: "Marseille",
        description:
          "A vibrant port city in southern France, known for its Mediterranean culture.",
      },
      {
        id: 5,
        title: "Gothenburg",
        description:
          "A coastal city in Sweden known for its picturesque canals and cultural scene.",
      },
      {
        id: 6,
        title: "Geona",
        description:
          "A port city in Italy known for its rich maritime history and architecture.",
      },
      {
        id: 7,
        title: "Osaka",
        description:
          "A city in Japan, known for its modern architecture and nightlife.",
      },
      {
        id: 8,
        title: "Busan",
        description:
          "A port city in South Korea, famous for its beaches and seafood.",
      },
      {
        id: 9,
        title: "Manila",
        description:
          "The capital of the Philippines, known for its historic landmarks and vibrant culture.",
      },
      {
        id: 10,
        title: "Valencia",
        description:
          "A city in Spain, known for its futuristic architecture and beaches.",
      },
      {
        id: 11,
        title: "Seattle",
        description:
          "A major city in Washington, USA, known for its tech scene and iconic Space Needle.",
      },
      {
        id: 12,
        title: "Vancouver",
        description:
          "A coastal city in Canada, known for its stunning natural beauty and multicultural vibe.",
      },
      {
        id: 13,
        title: "Collection 1",
        description: "A unique collection showcasing diverse items.",
      },
      {
        id: 14,
        title: "Collection 2",
        description: "A curated set of rare objects for collectors.",
      },
      {
        id: 15,
        title: "Collection 3",
        description: "A set of artistic pieces representing various cultures.",
      },
      {
        id: 16,
        title: "Collection 4",
        description:
          "A collection of historical artifacts with cultural significance.",
      },
      {
        id: 17,
        title: "Collection 5",
        description: "A diverse selection of modern art pieces.",
      },
      {
        id: 18,
        title: "Collection 6",
        description: "A set of vintage items from different eras.",
      },
      {
        id: 19,
        title: "Collection 7",
        description:
          "A collection of iconic memorabilia from the 20th century.",
      },
      {
        id: 20,
        title: "Collection 8",
        description: "A rare collection of limited-edition items.",
      },
      {
        id: 21,
        title: "Collection 9",
        description: "A selection of unusual and quirky artifacts.",
      },
      {
        id: 22,
        title: "Collection 10",
        description:
          "A collection of items with artistic and historical value.",
      },
      {
        id: 23,
        title: "Collection 11",
        description: "A set of collectible items from famous designers.",
      },
      {
        id: 24,
        title: "Collection 12",
        description:
          "A curated collection of items related to a specific theme.",
      },
    ],

    getStacBaseUrl: function () {
      if (window && window.top && window.top.geoportalServiceInfo) {
        var loc = window.top.location;
        var stacBaseUrl = `${loc.protocol}//${loc.host}${loc.pathname}stac`;
        return stacBaseUrl;
      }
      return null;
    },

    postCreate: function () {
      this.inherited(arguments);
      this.readConfig();

      this.initializeListeners();
      const handleGetCollections = async () => {
        this.collections = await this.getAllCollections();
        this.renderCollectionList(this.collections);
      };
      handleGetCollections();
    },

    getAllCollections: async function () {
      let collections = [];
      try {
        let url = `${this.getStacBaseUrl()}/collections`;
        if (AppContext.appConfig.system.secureCatalogApp) {
          var client = new AppClient();
          url = client.appendAccessToken(url);
        }
        const response = await fetch(url);
        const result = await response.json();
        collections = result.collections;
      } catch (e) {
        collections = this.sampleCollection;
      }
      return collections;
    },

    renderCollectionList: function (collections = []) {
      console.log("rendering collection list: ", collections);

      const collectionHTML = collections.map((collection) => {
        return `
          <div class="list-item">
              <span class="list-item-title truncate-text"
                ><input
                  class="list-item-checkbox"
                  type="checkbox"
                  data-id="${collection.id}"
                  data-title="${collection.title}"
                />${collection.title}</span
              >

              <div class="item-info-button" data-id="${collection.id}" id="test">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M17 16h-5.525a5.95 5.95 0 0 0-.172-1H17zm2-7h-9v1h9zm0 3h-9v.544q.193.22.364.456H19zm3 8H11.818l-.913-.913c.014-.028.023-.059.037-.087H21V7h-4V3H8v8.053a5.945 5.945 0 0 0-1-.356V2h11.4L22 5.6zM21 5.69L18.31 3H18v3h3zM8.926 19.23l3.085 3.084a.476.476 0 0 1 0 .674l-.017.017a.476.476 0 0 1-.673 0L8.237 19.92A4.383 4.383 0 1 1 9.9 16.5a4.358 4.358 0 0 1-.974 2.73zM5.5 19.9a3.4 3.4 0 1 0-3.4-3.4 3.404 3.404 0 0 0 3.4 3.4z"
                  />
                  <path fill="none" d="M0 0h24v24H0z" />
                </svg>
              </div>
            </div>
        `;
      });
      this.collectionsList.innerHTML = collectionHTML.join("");

      const infoButtons =
        this.collectionsList.querySelectorAll(".item-info-button");
      if (infoButtons?.length > 0) {
        infoButtons.forEach((button) => {
          const id = button.getAttribute("data-id");
          button.onclick = (e) => {
            this.handleReadCollection(id);
          };
        });
      }
    },

    handleDeleteCollections: function () {
      this.appActionState = this.actions.DELETE_COLLECTION;

      // loop through and delete every collection selected
      const collectionsToBeDeleted = this.getSelectedCollections();
      collectionsToBeDeleted.forEach((collection) => {
        this.deleteCollection(collection.id);
      });

      this.collections = this.collections.filter((c) => {
        const found = collectionsToBeDeleted.find((ctb) => {
          return String(ctb.id) === String(c.id);
        });
        if (found) {
          return false;
        }
        return true;
      });

      this.renderCollectionList(this.collections);
      this.hideModal();
    },

    deleteCollection: function (id) {
      if (!id) {
        return console.error("collection id required to delete");
      }
      console.log("Deleting Collection", id);
    },

    handleCreateCollection: function (properties) {
      this.appActionState = this.actions.CREATE_COLLECTION;
      this.createCollection(this.getCreateFieldValues());
      this.hideEditor();
    },

    createCollection: function (properties = {}) {
      console.log("Creating Collection", properties);
      this.collections.push(properties);
      this.renderCollectionList(this.collections);
    },

    handleUpdateCollection: function (id, properties) {
      this.appActionState = this.actions.UPDATE_COLLECTION;
      this.updateCollection(id, properties);
      this.hideEditor();
    },

    updateCollection: function (id = "0", properties = {}) {
      console.log("Updating Collection", id, properties);
      this.collections = this.collections.map((c) => {
        if (String(c.id) === String(id)) {
          return properties;
        }
        return c;
      });
      this.handleReadCollection(id);
      this.renderCollectionList(this.collections);
    },

    handleReadCollection: function (id) {
      this.appActionState = this.actions.READ_COLLECTION;
      this.selectedCollection = this.readCollection(id);
      if (this.selectedCollection) {
        this.updateCollectionInfoBox(this.selectedCollection);
      }
    },

    readCollection: function (id = 0) {
      console.log("Reading Collection", id);
      const collectionResult = this.collections.find(
        (c) => String(c.id) === String(id)
      );
      return collectionResult ? collectionResult : null;
    },

    getSelectedCollections: function () {
      // Get all checked checkboxes with the class "list-item-checkbox"
      const checkedBoxes = this.collectionsList.querySelectorAll(
        ".list-item-checkbox:checked"
      );

      const selectedCollections = [];
      // Iterate over them
      checkedBoxes.forEach((checkbox) => {
        // Get data from a custom attribute, like data-city
        selectedCollections.push({
          id: checkbox.getAttribute("data-id"),
          title: checkbox.getAttribute("data-title"),
        });
      });

      return selectedCollections;
    },

    hideModal: function () {
      this.appActionState = this.actions.NONE;
      this.modalContainer.style.display = "none";
    },

    showModal: function () {
      this.modalContainer.style.display = "flex";
      const selectedCollections = this.getSelectedCollections();
      this.modalContainerCollectionsListLength.innerHTML =
        selectedCollections.length;
      this.modalContainerCollectionsList.innerHTML = selectedCollections
        .map((c) => c.title)
        .join(", ");
    },

    hideEditor: function () {
      this.appActionState = this.actions.NONE;
      this.leftPanelEditorView.style.display = "none";
      this.leftPanelListView.style.display = "flex";
    },

    renderUpdateCollectionEditor: function (properties) {
      this.collectionEditorTitle.innerHTML = "Update Collection";
      this.editorPrimary.innerHTML = "Update Collection";
      let collectionInputs = `
          <label class="editor-label">description:</label>
          <textArea id="collection-description-input" style="height: 100px" class="editor-input" rows="5" placeholder="value...">${properties.description}</textArea>

          <label class="editor-label">id:</label>
          <input id="collection-id-input" class="editor-input" type="text" placeholder="value..."value="${properties.id}" disabled />

          <label class="editor-label">title:</label>
          <input id="collection-title-input" class="editor-input" type="text" placeholder="value..." value="${properties.title}"/>
      `;
      this.editorInputForm.innerHTML = collectionInputs;
    },

    renderCreateCollectionEditor: function () {
      this.collectionEditorTitle.innerHTML = "Create New Collection";
      this.editorPrimary.innerHTML = "Create Collection";
      let collectionInputs = `
      <label class="editor-label">description:</label>
      <textArea id="collection-description-input" style="height: 100px" class="editor-input" rows="5" placeholder="value..."></textArea>

      <label class="editor-label">id:</label>
      <input id="collection-id-input" class="editor-input" type="text" placeholder="value..."/>

      <label class="editor-label">title:</label>
      <input id="collection-title-input" class="editor-input" type="text" placeholder="value..."/>
  `;
      this.editorInputForm.innerHTML = collectionInputs;
    },

    showEditor: function () {
      if (this.appActionState === this.actions.CREATE_COLLECTION) {
        this.renderCreateCollectionEditor();
      } else if (this.appActionState === this.actions.UPDATE_COLLECTION) {
        this.renderUpdateCollectionEditor(this.selectedCollection);
      }
      this.leftPanelEditorView.style.display = "flex";
      this.leftPanelListView.style.display = "none";
    },

    updateCollectionInfoBox: function (properties) {
      let tableRows = Object.entries(properties).map(([key, value]) => {
        return `    
                <tr>
                  <td>${key}</td>
                  <td>${value}</td>
                </tr>`;
      });
      this.infoTableTitle.innerHTML = properties.title;
      this.infoTableBody.innerHTML = tableRows.join("");
    },

    getUpdateFieldValues: function () {
      return {
        id: document.getElementById("collection-id-input").value,
        description: document.getElementById("collection-description-input")
          .value,
        title: document.getElementById("collection-title-input").value,
      };
    },

    getCreateFieldValues: function () {
      return {
        id: document.getElementById("collection-id-input").value,
        description: document.getElementById("collection-description-input")
          .value,
        title: document.getElementById("collection-title-input").value,
      };
    },

    initializeListeners: function () {
      // Collection Events
      this.deleteCollectionButton.addEventListener("click", () => {
        this.appActionState = this.actions.DELETE_COLLECTION;
        this.showModal();
      });
      this.newCollection.addEventListener("click", () => {
        this.appActionState = this.actions.CREATE_COLLECTION;
        this.showEditor();
      });
      this.editCollection.addEventListener("click", () => {
        this.appActionState = this.actions.UPDATE_COLLECTION;
        this.showEditor();
      });

      // Editor Events
      this.editorPrimary.addEventListener("click", () => {
        if (this.appActionState === this.actions.UPDATE_COLLECTION) {
          const updatedProperties = this.getUpdateFieldValues();
          this.handleUpdateCollection(
            this.selectedCollection.id,
            updatedProperties
          );
        } else if (this.appActionState === this.actions.CREATE_COLLECTION) {
          this.handleCreateCollection();
        }
        this.hideEditor();
      });
      this.editorSecondary.addEventListener("click", () => {
        this.hideEditor();
      });

      // Modal Events
      this.modalSecondaryButton.addEventListener("click", () => {
        this.hideModal();
      });
      this.modalPrimaryButton.addEventListener("click", () => {
        if (this.appActionState === this.actions.DELETE_COLLECTION) {
          this.handleDeleteCollections();
        }
      });
    },

    readConfig: function () {
      dfd = new Deferred();
      fetch("app/gs/config/geoportal-search.json")
        .then((response) => response.json())
        .then((data) => {
          this.config = data;
          dfd.resolve();
        })
        .catch((error) => {
          // Handle errors
          console.error("Error not able to load config:", error);
        });
      return dfd;
    },

    addToMap: function (params) {
      this.addLayer(params, this.view);
    },
    //Opening map panel
    ensureMap: function (urlParams) {
      this.urlParams = urlParams;
      if (!this.config) {
        this.readConfig()
          .then(() => {
            this.loadMapPanel();
          })
          .catch((error) => {
            // Handle errors
            console.error("Map panel could not be loaded.", error);
          });
      } else {
        this.loadMapPanel();
      }
    },
    loadMapPanel: function () {
      var mapProps = AppContext.appConfig.searchMap || {};
      if (mapProps) mapProps = lang.clone(mapProps);
      var v = mapProps.basemapUrl;
      delete mapProps.basemapUrl;
      if (typeof mapProps.basemap === "string" && mapProps.basemap.length > 0) {
        v = null;
      }
      var map = new Map({ basemap: "streets-night-vector" });

      const view = new MapView({
        container: this.mapNode,
        map: map,
        center: mapProps.center,
        zoom: mapProps.zoom,
      });

      if (typeof v === "string" && v.length > 0) {
        v = util.checkMixedContent(v);
        var basemap;
        if (!mapProps.isTiled) {
          basemap = new MapImageLayer(v);
        } else {
          basemap = new TileLayer(v);
        }
        map.add(basemap);
      }
      view.when(
        lang.hitch(this, function () {
          var localGeoportalUrl = this._createLocalCatalogUrl();
          if (localGeoportalUrl) {
            var target;
            for (var i = 0; i < this.config.targets.length; i++) {
              target = this.config.targets[i];
              if (target.type === "geoportal" && !target.url) {
                this.config.targets[i].url = localGeoportalUrl;
                break;
              }
            }
          }

          let searchWidget = new SearchWidget({
            view: view,
          });

          let searchWidgetExpand = new Expand({
            expandIcon: "search",
            expandTooltip: "Find Address or Place",
            view: view,
            content: searchWidget,
          });
          view.ui.add(searchWidgetExpand, {
            position: "top-left",
            index: 1,
          });

          let layerList = new LayerList({
            view: view,
            listItemCreatedFunction: defineActions,
          });
          let layerListExpand = new Expand({
            expandIcon: "layers",
            expandTooltip: "Map Layers",
            view: view,
            content: layerList,
          });
          view.ui.add(layerListExpand, {
            position: "top-left",
            index: 2,
          });

          async function defineActions(event) {
            const item = event.item;

            await item.layer.when();
            // An array of objects defining actions to place in the LayerList.By making this array two-dimensional, you can separate similar
            // actions into separate groups with a breaking line.
            item.actionsSections = [
              [
                {
                  title: "Go to full extent",
                  icon: "zoom-out-fixed",
                  id: "full-extent",
                },
              ],
              [
                {
                  title: "Remove",
                  icon: "minus-circle",
                  id: "remove-layer",
                },
              ],
            ];
          }
          layerList.on("trigger-action", (event) => {
            this.executeLayerlistActions(event);
          });
          let homeWidget = new Home({
            view: view,
          });

          // adds the home widget to the top left corner of the MapView
          view.ui.add(homeWidget, {
            position: "top-left",
            index: 4,
          });

          let basemapWidget = new BasemapGallery({
            view: view,
          });
          let basemapExpand = new Expand({
            expandIcon: "basemap",
            expandTooltip: "Basemap",
            view: view,
            content: basemapWidget,
          });
          // adds the basemap widget to the top right corner of the MapView
          view.ui.add(basemapExpand, {
            position: "top-left",
            index: 1,
          });

          let legend = new Legend({
            view: view,
          });
          let legendExpand = new Expand({
            expandIcon: "legend",
            expandTooltip: "Legend",
            view: view,
            content: legend,
          });
          view.ui.add(legendExpand, {
            position: "top-left",
            index: 3,
          });

          reactiveUtils.on(
            () => view.popup,
            "trigger-action",
            (event) => {
              if (event.action.id === "view-attribute-table") {
                this.openAttrTable(view.popup.selectedFeature);
              }
            }
          );
          reactiveUtils.watch(
            () => view.popup.viewModel?.active,
            () => {
              selectedFeature = view.popup.selectedFeature;
              if (selectedFeature !== null && view.popup.visible !== false) {
                if (this.featureTable) {
                  this.featureTable.highlightIds.removeAll();
                  this.featureTable.highlightIds.add(
                    view.popup.selectedFeature.attributes.OBJECTID
                  );
                }
              }
            }
          );
          this.view = view;
        })
      );

      if (!this.mapWasInitialized) {
        this.mapWasInitialized = true;
        if (this.urlParams) {
          this.addLayer(this.urlParams, view);
        }
      }
    },

    executeLayerlistActions: function (event) {
      if (
        event.action &&
        event.action.id === "full-extent" &&
        event.item &&
        event.item.layer
      ) {
        this.view.goTo(event.item.layer.fullExtent);
      }
      if (event.action && event.action.id === "remove-layer") {
        const layerToRemove = this.view.map.findLayerById(event.item.layer.id);
        this.view.map.layers.remove(layerToRemove);
      }
    },

    openAttrTable: function (selectedFeature) {
      console.log("selected feature " + selectedFeature.attributes.OBJECTID);
      let id = selectedFeature.attributes.OBJECTID;
      //Below can be used to show only selected record
      //    	var featureLayer = new FeatureLayer({url:selectedFeature.sourceLayer.url,
      //    			definitionExpression: "OBJECTID = "+id});
      var serviceUrl = selectedFeature.sourceLayer.url;
      if (
        (this.urlParams && this.urlParams.type == "WFS") ||
        serviceUrl.indexOf("WFSServer") > -1
      ) {
        var layerToAdd = new WFSLayer({ url: serviceUrl });
      } else {
        var layerToAdd = new FeatureLayer(serviceUrl);
      }

      var tableContainer = document.getElementById("tableContainer");

      if (this.featureTable) {
        try {
          this.featureTable.destroy();
        } catch (error) {
          console.error(error);
        }
        tableContainer.innerHTML = "";
      }
      var container = document.createElement("div");

      tableContainer.appendChild(container);

      let table = (this.featureTable = new FeatureTable({
        returnGeometryEnabled: true,
        view: this.view,
        layer: layerToAdd,
        container: container,
        visible: true,
        columnReorderingEnabled: true,
        highlightEnabled: true,
        highlightIds: [id],
        visibleElements: {
          // Autocast to VisibleElements
          menuItems: {
            clearSelection: true,
            refreshData: true,
            toggleColumns: true,
            selectedRecordsShowAllToggle: true,
          },
        },
        menuConfig: {
          items: [
            {
              label: "Close",
              icon: "x-circle",
              clickFunction: () => {
                this.featureTable.visible = false;
              },
            },
          ],
        },
      }));
    },
    _createLocalCatalogUrl: function () {
      if (window && window.top && window.top.geoportalServiceInfo) {
        var loc = window.top.location;
        var gpt = window.top.geoportalServiceInfo;
        var url =
          loc.protocol +
          "//" +
          loc.host +
          loc.pathname +
          "elastic/" +
          gpt.metadataIndexName +
          "/_search";

        if (
          AppContext.appConfig.system.secureCatalogApp ||
          AppContext.geoportal.supportsApprovalStatus ||
          AppContext.geoportal.supportsGroupBasedAccess
        ) {
          var client = new AppClient();
          url = client.appendAccessToken(url);
        }
        return url;
      }
      return null;
    },

    addLayer: function (params, view) {
      // console.warn("AddToMap.addLayer...",type,url);
      var url = params.url;
      var type = params.type;
      var dfd = new Deferred();
      this.urlParams = params;

      var processor = new LayerProcessor();
      processor
        .addLayer(view, type, url)
        .then(function (result) {
          if (result) {
            dfd.resolve(result);
          } else {
            dfd.reject("Failed");
            console.warn("AddToMap failed for", url);
          }
        })
        .catch(function (error) {
          dfd.reject(error);
          if (typeof error === "string" && error === "Unsupported") {
            console.warn("AddToMap: Unsupported type", type, url);
          } else {
            console.warn("AddToMap failed for", url);
            console.warn(error);
          }
          //TODO add popup alert("Add to Map failed");
        });
      return dfd;
    },
  });

  return oThisClass;
});
