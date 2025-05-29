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
  "esri4/widgets/Sketch/SketchViewModel",
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
  "esri4/geometry/support/webMercatorUtils",
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
  SketchViewModel,
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
  webMercatorUtils,
  WidgetContext,
  LayerProcessor,
  AppClient
) {
  var oThisClass = declare([Templated], {
    i18n: i18n,
    templateString: template,
    mapWasInitialized: false,
    view: null,
    sketchVM: null,
    isLoading: false,

    actions: {
      DELETE_COLLECTION: "DELETE_COLLECTION",
      UPDATE_COLLECTION: "UPDATE_COLLECTION",
      CREATE_COLLECTION: "CREATE_COLLECTION",
      READ_COLLECTION: "READ_COLLECTION",
      NONE: "NONE",
    },
    POLYGON_SYM: {
      type: "simple-fill",
      color: [255, 165, 0, 0.3],
      outline: {
        color: "red",
        width: 3,
      },
    },
    COLLECTION_SYM: {
      type: "simple-fill",
      color: [255, 165, 0, 0.3],
      outline: {
        color: [255, 165, 0],
        width: 2,
      },
    },

    appActionState: "NONE",
    collections: [],
    selectedCollection: null,
    collectionIdsToBeDeleted: [],
    selectedGraphic: null,
    sketchGraphicsLayer: null,

    sampleCollection: [
      {
        id: 1,
        title: "Sample Collection",
        description:
          "A port city in the Netherlands known for modern architecture.",
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
    },

    handleGetCollections: async function (view) {
      console.log("handleGetCollections");
      this.collections = await this.getAllCollections();
      this.renderCollectionList(this.collections);
      this.renderCollectionGraphics(this.collections, view);
    },

    handleMapReady: function (view) {
      this.initializeListeners();
      this.initializeSketchViewModel(view);

      this.handleGetCollections(view);
    },

    updateIsLoading: function (value) {
      this._setIsLoading(value);
      value === true
        ? this.loaderContainer.classList.remove("hidden")
        : this.loaderContainer.classList.add("hidden");
    },

    _setIsLoading: function (value) {
      this.isLoading = value;
    },

    renderCollectionGraphics: async function (collections, view) {
      const fillSymbol = this.COLLECTION_SYM;

      let lastGraphic = null;
      collections.forEach((collection, index) => {
        if (collection.geometry) {
          const graphic = new Graphic({
            symbol: fillSymbol,
            geometry: {
              rings: collection.geometry.coordinates,
              type: collection.geometry.type.toLowerCase(),
            },
          });
          collection.graphic = graphic;
          lastGraphic = graphic;
          const graphicsLayer = new GraphicsLayer({
            title: collection.properties.id,
          });
          graphicsLayer.add(graphic);
          view.map.layers.add(graphicsLayer);
        }
      });
    },

    getAllCollections: async function () {
      let collections = [];
      try {
        let url = `${this.getStacBaseUrl()}/collections?f=geojson`;
        if (AppContext.appConfig.system.secureCatalogApp) {
          var client = new AppClient();
          url = client.appendAccessToken(url);
        }
        const response = await fetch(url);
        const result = await response.json();
        collections = result.features;
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
                  data-id="${collection.properties.id}"
                  data-title="${collection.properties.title}"
                />${collection.properties.title}</span
              >

              <div class="item-info-button" data-id="${collection.properties.id}">
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

      const checkBoxes = this.collectionsList.querySelectorAll(
        ".list-item-checkbox"
      );
      if (checkBoxes?.length > 0) {
        checkBoxes.forEach((cbox) => {
          const id = cbox.getAttribute("data-id");
          cbox.onclick = (e) => {
            this.handleClickCheckbox(id);
          };
        });
      }
    },

    removeAllCollectionGraphicsLayers: function (view) {
      let layersToRemove = [];
      view.map.layers.items.forEach((layer, index) => {
        if (layer.title !== "sketch") {
          layersToRemove.push(layer);
        }
      });
      layersToRemove.forEach((layer) => {
        view.map.layers.remove(layer);
      });
    },

    resetSketch: function () {
      this.sketchGraphicsLayer.removeAll();
    },

    rerenderCollectionsList: function () {
      this.updateIsLoading(true);
      this.removeAllCollectionGraphicsLayers(this.view);
      setTimeout(async () => {
        await this.handleGetCollections(this.view);
        this.updateIsLoading(false);
      }, 3000);
    },

    handleDeleteCollections: function () {
      this.appActionState = this.actions.DELETE_COLLECTION;
      this.updateIsLoading(true);

      // loop through and delete every collection selected
      const collectionsToBeDeleted = this.getCollectionsToBeDeleted();
      const allDeletePromises = collectionsToBeDeleted.map((collection) =>
        this.deleteCollection(collection.id)
      );

      Promise.all(allDeletePromises)
        .then((results) => {
          // API takes some time to delete
          this.rerenderCollectionsList();
          this.handleDeleteCollectionEnabled();
        })
        .catch((e) => {
          console.error(e);
        });
      this.hideModal();
    },

    deleteCollection: async function (id) {
      if (!id) {
        return console.error("collection id required to delete");
      }
      try {
        console.log("Deleting Collection", id);
        let url = `${this.getStacBaseUrl()}/collections/${this.replaceSpaceWithPlus(
          id
        )}`;
        var client = new AppClient();
        url = client.appendAccessToken(url);
        const response = await fetch(url, {
          method: "DELETE",
        });
        const result = await response.json();
        return {
          response: result,
          id: id,
        };
      } catch (e) {
        console.error(e);
        return null;
      }
    },

    handleCreateCollection: function () {
      this.appActionState = this.actions.CREATE_COLLECTION;
      this.updateIsLoading(true);
      const { id, description, title } = this.getCreateFieldValues();
      const geo = this.selectedGraphic?.geometry
        ? webMercatorUtils.webMercatorToGeographic(
            this.selectedGraphic.geometry
          )
        : null;
      const collection = {
        type: "Collection",
        stac_version: "1.0.0",
        stac_extensions: [],
        id: id,
        title: title,
        description: description,
        keywords: [],
        license: "Apache-2.0",
        providers: [],
        extent: {
          spatial: {
            bbox: [[-95, 30, -94, 30.06]],
            geometry: {
              type: "Polygon",
              coordinates: geo?.rings,
            },
          },
          temporal: {
            interval: [["1900-01-01T00:00:00Z", "2099-12-31T23:59:59Z"]],
          },
        },
        summaries: {
          datetime: {
            min: "1900-01-01T00:00:00Z",
            max: "2099-12-31T23:59:59Z",
          },
        },
        links: [],
        assets: {},
        item_assets: {},
      };

      this.createCollection(collection).then((response) => {
        this.rerenderCollectionsList();
        this.resetSketch();
        this.hideEditor();
      });
    },

    createCollection: async function (collection) {
      if (!collection) {
        return console.error("collection object required to create");
      }
      try {
        console.log("Creating Collection", collection);
        let url = `${this.getStacBaseUrl()}/collections`;
        var client = new AppClient();
        url = client.appendAccessToken(url);
        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify(collection),
        });
        const result = await response.json();
        return {
          response: result,
          id: collection.id,
        };
      } catch (e) {
        console.error(e);
        return null;
      }
    },

    handleUpdateCollection: function (id, properties) {
      this.appActionState = this.actions.UPDATE_COLLECTION;
      this.updateCollection(id, properties);
      this.hideEditor();
    },

    updateCollection: function (id = "0", properties = {}) {
      console.log("Updating Collection", id, properties);
      this.collections = this.collections.map((c) => {
        if (String(c.properties.id) === String(id)) {
          c.properties = properties;
        }
        return c;
      });
      this.handleReadCollection(id);
      this.renderCollectionList(this.collections);
    },

    handleReadCollection: function (id) {
      this.appActionState = this.actions.READ_COLLECTION;
      this.selectedCollection = this.readCollection(id);
      this.handleUpdateButtonEnabled();
      if (this.selectedCollection) {
        this.updateCollectionInfoBox(
          this.selectedCollection.properties,
          this.selectedCollection.graphic
        );
        this.handleZoomTo(this.selectedCollection.graphic);
      }
    },

    handleZoomTo: function (feature) {
      if (feature) {
        this.view.goTo(feature);
      }
    },

    readCollection: function (id = 0) {
      console.log("Reading Collection", id);
      const collectionResult = this.collections.find(
        (c) => String(c.properties.id) === String(id)
      );
      return collectionResult ? collectionResult : null;
    },

    getCollectionsToBeDeleted: function () {
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

    handleClickCheckbox: function (id) {
      const index = this.collectionIdsToBeDeleted.indexOf(id);

      if (index > -1) {
        this.collectionIdsToBeDeleted.splice(index, 1);
      } else {
        this.collectionIdsToBeDeleted.push(id);
      }
      this.handleDeleteCollectionEnabled();
    },

    handleDeleteCollectionEnabled: function () {
      if (this.collectionIdsToBeDeleted.length > 0) {
        this.deleteCollectionButton.disabled = false;
        this.deleteCollectionButton.classList.remove("disabled");
      } else {
        this.deleteCollectionButton.disabled = true;
        this.deleteCollectionButton.classList.add("disabled");
      }
    },

    handleZoomCollectionEnabled: function () {
      if (this.selectedCollection.graphic) {
        this.zoomCollectionButton.disabled = false;
        this.zoomCollectionButton.classList.remove("disabled");
      } else {
        this.zoomCollectionButton.disabled = true;
        this.zoomCollectionButton.classList.add("disabled");
      }
    },

    handleEditorPrimaryButtonEnabled: function (id, title) {
      if (!this.isBlank(id) && !this.isBlank(title)) {
        this.editorPrimaryButton.disabled = false;
        this.editorPrimaryButton.classList.remove("disabled-button");
      } else {
        this.editorPrimaryButton.disabled = true;
        this.editorPrimaryButton.classList.add("disabled-button");
      }
    },

    handleUpdateButtonEnabled: function () {
      if (this.selectedCollection) {
        this.editCollectionButton.disabled = false;
        this.editCollectionButton.classList.remove("disabled");
      } else {
        this.editCollectionButton.disabled = true;
        this.editCollectionButton.classList.add("disabled");
      }
    },

    hideModal: function () {
      this.appActionState = this.actions.NONE;
      this.modalContainer.style.display = "none";
    },

    showModal: function () {
      this.modalContainer.style.display = "flex";
      const selectedCollections = this.getCollectionsToBeDeleted();
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
      this.editorPrimaryButton.innerHTML = "Update Collection";
      let collectionInputs = `
          <label class="editor-label">id <span class="required">*</span>:</label>
          <input id="collection-id-input" class="editor-input" type="text" placeholder="value..."value="${properties.id}" />

          <label class="editor-label">title <span class="required">*</span>:</label>
          <input id="collection-title-input" class="editor-input" type="text" placeholder="value..." value="${properties.title}"/>

          <label class="editor-label">description:</label>
          <textArea id="collection-description-input" style="height: 100px" class="editor-input" rows="5" placeholder="value...">${properties.description}</textArea>
      `;
      this.editorInputForm.innerHTML = collectionInputs;
      this.initializeCollectionFormListeners();
    },

    renderCreateCollectionEditor: function () {
      this.collectionEditorTitle.innerHTML = "Create New Collection";
      this.editorPrimaryButton.innerHTML = "Create Collection";
      let collectionInputs = `
      <label class="editor-label">id <span class="required">*</span>:</label>
      <input id="collection-id-input" class="editor-input" type="text" placeholder="value..."/>

      <label class="editor-label">title <span class="required">*</span>:</label>
      <input id="collection-title-input" class="editor-input" type="text" placeholder="value..."/>

      <label class="editor-label">description:</label>
      <textArea id="collection-description-input" style="height: 100px" class="editor-input" rows="5" placeholder="value..."></textArea>
  `;
      this.editorInputForm.innerHTML = collectionInputs;
      this.initializeCollectionFormListeners();
    },

    showEditor: function () {
      if (this.appActionState === this.actions.CREATE_COLLECTION) {
        this.renderCreateCollectionEditor();
      } else if (this.appActionState === this.actions.UPDATE_COLLECTION) {
        this.initializeUpdateWorkflow(
          this.view,
          this.selectedCollection,
          this.selectedCollection.graphic
        );
        this.renderUpdateCollectionEditor(this.selectedCollection.properties);
      }
      this.leftPanelEditorView.style.display = "flex";
      this.leftPanelListView.style.display = "none";
    },

    initializeUpdateWorkflow: function (view, feature, graphic) {
      if (!feature || !view) {
        console.error("missing arguments");
        return;
      }

      if (graphic) {
        this.hideAllGraphicsLayers(view);
        const tempGraphic = graphic.clone();
        tempGraphic.symbol = this.POLYGON_SYM;
        this.sketchGraphicsLayer.add(tempGraphic);
        this.sketchVM.update(tempGraphic);
      }
    },

    hideAllGraphicsLayers: function (view) {
      view.map.layers.items.forEach((layer) => {
        if (layer.type === "graphics" && layer.title !== "sketch") {
          layer.visible = false;
        }
      });
    },

    showAllGraphicsLayers: function (view) {
      view.map.layers.items.forEach((layer) => {
        view.map.layers.items.forEach((layer) => {
          if (layer.type === "graphics" && layer.title !== "sketch") {
            layer.visible = true;
          }
        });
      });
    },

    handleCancelUpdateCollection: function () {
      if (this.selectedCollection.graphic) {
        this.sketchGraphicsLayer.removeAll();
      }
      this.showAllGraphicsLayers(this.view);
    },

    handleCancelCreateCollection: function () {
      this.sketchGraphicsLayer.removeAll();
    },

    updateCollectionInfoBox: function (properties, isZoomEnabled) {
      let tableRows = Object.entries(properties).map(([key, value]) => {
        return `    
                <tr>
                  <td>${key}</td>
                  <td>${value}</td>
                </tr>`;
      });
      this.infoTableTitle.innerHTML = properties.title;
      this.infoTableBody.innerHTML = tableRows.join("");
      this.handleZoomCollectionEnabled();
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
      const that = this;

      // Collection Events
      this.deleteCollectionButton.addEventListener("click", () => {
        this.appActionState = this.actions.DELETE_COLLECTION;
        this.showModal();
      });
      this.newCollectionButton.addEventListener("click", () => {
        this.appActionState = this.actions.CREATE_COLLECTION;
        this.showEditor();
      });
      this.editCollectionButton.addEventListener("click", () => {
        this.appActionState = this.actions.UPDATE_COLLECTION;
        this.showEditor();
      });
      this.zoomCollectionButton.addEventListener("click", () => {
        this.handleZoomTo(this.selectedCollection.graphic);
      });

      // Editor Events
      this.editorPrimaryButton.addEventListener("click", () => {
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
        if (this.appActionState === this.actions.UPDATE_COLLECTION) {
          this.handleCancelUpdateCollection();
        } else if (this.appActionState === this.actions.CREATE_COLLECTION) {
          this.handleCancelCreateCollection();
        }
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

      // List Filtering
      this.collectionSearchInput.addEventListener("input", function () {
        const collectionElements =
          that.collectionsList.querySelectorAll(".list-item");
        const filterText = this.value.toLowerCase();
        collectionElements.forEach((el) => {
          const itemText = el.textContent.toLowerCase();
          el.classList.toggle("hidden", !itemText.includes(filterText));
        });
      });
    },

    initializeCollectionFormListeners: function () {
      const collectionDescriptionInput = this.editorInputForm.querySelector(
        "#collection-description-input"
      );
      const collectionIdInput = this.editorInputForm.querySelector(
        "#collection-id-input"
      );
      const collectionTitleInput = this.editorInputForm.querySelector(
        "#collection-title-input"
      );

      this.handleEditorPrimaryButtonEnabled(
        collectionIdInput.value,
        collectionTitleInput.value
      );

      collectionDescriptionInput.addEventListener("input", (e) => {
        this.handleEditorPrimaryButtonEnabled(
          collectionIdInput.value,
          collectionTitleInput.value
        );
      });

      collectionIdInput.addEventListener("input", (e) => {
        this.handleEditorPrimaryButtonEnabled(
          collectionIdInput.value,
          collectionTitleInput.value
        );
      });

      collectionTitleInput.addEventListener("input", (e) => {
        this.handleEditorPrimaryButtonEnabled(
          collectionIdInput.value,
          collectionTitleInput.value
        );
      });
    },

    initializeSketchViewModel: function (view) {
      const sketchGraphicsLayer = new GraphicsLayer({
        title: "sketch",
      });
      this.sketchGraphicsLayer = sketchGraphicsLayer;

      view.map.layers.add(sketchGraphicsLayer);

      const sketchVM = new SketchViewModel({
        view: view,
        polygonSymbol: this.POLYGON_SYM,
        layer: sketchGraphicsLayer,
      });

      sketchVM.on("create", (e) => {
        if (e.state === "complete") {
          if (e.tool === "circle") {
            this.drawCircleButton.classList.remove("sketch-active-tool");
          } else if (e.tool === "polygon") {
            this.drawPolygonButton.classList.remove("sketch-active-tool");
          }

          this.selectedGraphic = e.graphic;
          sketchGraphicsLayer.graphics.forEach((g) => {
            if (g !== e.graphic) {
              sketchGraphicsLayer.remove(g);
            }
          });
        }
      });

      this.sketchVM = sketchVM;

      this.drawPolygonButton.onclick = (e) => {
        sketchVM.create("polygon");
        this.drawPolygonButton.classList.add("sketch-active-tool");
      };

      this.drawCircleButton.onclick = (e) => {
        sketchVM.create("circle");
        this.drawCircleButton.classList.add("sketch-active-tool");
      };

      this.undoButton.onclick = (e) => {
        sketchVM.undo();
      };

      this.redoButton.onclick = (e) => {
        sketchVM.redo();
      };

      this.deletePolygonButton.onclick = (e) => {
        sketchGraphicsLayer.removeAll();
        this.selectedGraphic = null;
      };
    },

    isBlank: function (value) {
      return (
        value === null || value === undefined || value.toString().trim() === ""
      );
    },

    replaceSpaceWithPlus: function (str) {
      return str.replace(/ /g, "+");
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

      this.handleMapReady(view);
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
