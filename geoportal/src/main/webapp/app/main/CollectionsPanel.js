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
  "esri4/layers/GraphicsLayer",
  "esri4/widgets/Sketch/SketchViewModel",
  "esri4/widgets/Search",
  "esri4/widgets/LayerList",
  "esri4/widgets/Home",
  "esri4/Graphic",
  "esri4/widgets/Expand",
  "esri4/widgets/BasemapGallery",
  "esri4/geometry/support/webMercatorUtils",
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
  GraphicsLayer,
  SketchViewModel,
  SearchWidget,
  LayerList,
  Home,
  Graphic,
  Expand,
  BasemapGallery,
  webMercatorUtils,
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
    DEFAULT_ASSET: {
      roles: [
        "Local CRS", // FIXED VALUE
      ],
      href: "",
      title: "",
      type: "text/plain", // FIXED VALUE
      "esri:wkt": "",
    },

    appActionState: "NONE",
    collections: [],
    selectedCollection: null,
    collectionIdsToBeDeleted: [],
    selectedGraphic: null,
    sketchGraphicsLayer: null,
    collectionAssets: {},

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

    setCollectionAssets: function (value) {
      this.collectionAssets = value;
    },

    clearCollectionAssets: function () {
      this.setCollectionAssets({});
      return this.collectionAssets;
    },

    deleteCollectionAsset: function (key) {
      delete this.collectionAssets[key];
      return this.collectionAssets;
    },

    addNewCollectionAsset: function (key, properties) {
      this.collectionAssets[key] = properties;
      return this.collectionAssets;
    },

    postCreate: function () {
      this.inherited(arguments);
      this.readConfig();
    },

    handleGetCollections: async function (view) {
      console.log("handleGetCollections");
      this.collections = await this.getAllCollections();
      this.renderCollectionsList(this.collections);
      this.renderCollectionGraphics(this.collections, view);
    },

    handleMapReady: function (view) {
      this.initializeListeners();
      this.initializeSketchViewModel(view);

      this.handleGetCollections(view);
    },

    updateIsLoading: function (value) {
      this._setIsLoading(value);
      if (value === true) {
        this.hideAlert();
        this.loaderContainer.classList.remove("hidden");
      } else {
        this.loaderContainer.classList.add("hidden");
      }
    },

    _setIsLoading: function (value) {
      this.isLoading = value;
    },

    renderCollectionGraphics: async function (collections, view) {
      const fillSymbol = this.COLLECTION_SYM;

      collections.forEach((collection, index) => {
        if (
          collection?.geometry &&
          collection.geometry.coordinates?.length > 0
        ) {
          const graphic = new Graphic({
            symbol: fillSymbol,
            geometry: {
              rings: collection.geometry.coordinates,
              type: collection.geometry.type.toLowerCase(),
            },
          });
          collection.graphic = graphic;
          const graphicsLayer = new GraphicsLayer({
            title: collection.properties.id,
          });
          graphicsLayer.add(graphic);
          view.map.layers.add(graphicsLayer);
        }
      });
    },

    getCollectionById: async function (id) {
      let collection = null;
      try {
        let url = `${this.getStacBaseUrl()}/collections/${this.replaceSpaceWithPlus(
          id
        )}`;
        if (AppContext.appConfig.system.secureCatalogApp) {
          var client = new AppClient();
          url = client.appendAccessToken(url);
        }
        const response = await fetch(url);
        const result = await response.json();
        collection = result;
      } catch (e) {
        collection = this.sampleCollection;
      }
      return collection;
    },

    getAllCollections: async function (f = "geojson") {
      let collections = [];
      try {
        let url = `${this.getStacBaseUrl()}/collections?limit=10000&f=${f}`;
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

    renderCollectionsList: function (collections = []) {
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
      }, 1500);
    },

    handleDeleteCollections: function () {
      this.appActionState = this.actions.DELETE_COLLECTION;
      this.updateIsLoading(true);
      const that = this;

      // loop through and delete every collection selected
      const collectionsToBeDeleted = this.getCollectionsToBeDeleted();
      const allDeletePromises = collectionsToBeDeleted.map((collection) => {
        if (collection.id === that.selectedCollection?.properties?.id) {
          this.emptyCollectionInfoBox();
          this.selectedCollection = null;
        }
        return this.deleteCollection(collection.id);
      });

      Promise.all(allDeletePromises)
        .then((results) => {
          let successDeleteIds = [];
          let failedDeleteIds = [];

          results.forEach((r) => {
            if (r.response.code === "200") {
              successDeleteIds.push(r.id);
            } else {
              failedDeleteIds.push(r.id);
            }
          });

          if (failedDeleteIds.length === results.length) {
            throw new Error(failedDeleteIds.join(", "));
          }
          this.showAlert(
            "Successfully deleted collections",
            `Deleted: ${successDeleteIds.join(", ")}. ${
              failedDeleteIds.length > 0
                ? `Failed to delete: ${failedDeleteIds.join(", ")}`
                : ""
            }`,
            "green"
          );
          this.rerenderCollectionsList();
          this.collectionIdsToBeDeleted = [];
          this.handleDeleteCollectionEnabled();
          this.handleUpdateButtonEnabled();
        })
        .catch((e) => {
          this.showAlert("Error deleting collections", `${e}`, "red");
          this.updateIsLoading(false);
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
        throw new Error(`Error deleting: ${collection.id}`);
      }
    },

    handleCreateCollection: async function () {
      this.appActionState = this.actions.CREATE_COLLECTION;
      this.updateIsLoading(true);
      this.sketchVM.complete();

      const { id, description, title, assets } = this.getCreateFieldValues();
      let tempGeometry = null;

      if (this.selectedGraphic?.geometry) {
        tempGeometry = this.selectedGraphic?.geometry.spatialReference
          .isWebMercator
          ? webMercatorUtils.webMercatorToGeographic(
              this.selectedGraphic.geometry
            )
          : this.selectedGraphic.geometry;
      }

      let bbox =
        tempGeometry?.extent?.xmin != null &&
        tempGeometry?.extent?.ymin != null &&
        tempGeometry?.extent?.xmax != null &&
        tempGeometry?.extent?.ymax != null
          ? [
              [
                tempGeometry?.extent.xmin,
                tempGeometry?.extent.ymin,
                tempGeometry?.extent.xmax,
                tempGeometry?.extent.ymax,
              ],
            ]
          : [];

      const collection = {
        type: "Collection",
        stac_version: "1.0.0",
        stac_extensions: [],
        id: this.removeAllSpaces(id),
        title: title,
        description: description,
        keywords: [],
        license: "Apache-2.0",
        providers: [],
        extent: {
          spatial: {
            bbox: bbox,
            geometry: {
              type: "Polygon",
              coordinates: tempGeometry?.rings,
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
        assets: assets,
        item_assets: {},
      };

      try {
        const result = await this.createCollection(collection);
        if (result.response.code !== "201") {
          throw new Error(result.response.description);
        }
        this.showAlert(
          "Successfully created collection",
          `Created ${collection.id}`,
          "green"
        );
      } catch (e) {
        this.updateIsLoading(false);
        this.showAlert("Error creating collection", `${e}`, "red");
      }

      this.clearCollectionAssets();
      this.rerenderCollectionsList();
      this.resetSketch();
      this.hideEditor();
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
        throw new Error(`Error creating collection ${collection.id}`);
      }
    },

    handleUpdateCollection: async function (id, properties) {
      this.appActionState = this.actions.UPDATE_COLLECTION;
      this.updateIsLoading(true);
      this.sketchVM.complete();

      // get collection full object
      let collection = await this.getCollectionById(id);

      // replace properties with new properties
      const {
        title: newTitle,
        description: newDescription,
        assets: newAssets,
      } = properties;
      collection.id = this.removeAllSpaces(collection.id);
      collection.title = newTitle;
      collection.description = newDescription;
      collection.assets = newAssets;
      let tempGeometry = null;

      if (this.selectedGraphic?.geometry) {
        tempGeometry = this.selectedGraphic?.geometry.spatialReference
          .isWebMercator
          ? webMercatorUtils.webMercatorToGeographic(
              this.selectedGraphic.geometry
            )
          : this.selectedGraphic.geometry;
      }
      collection.extent.spatial.geometry = {
        type: "Polygon",
        coordinates: tempGeometry?.rings,
      };

      let bbox =
        tempGeometry?.extent?.xmin != null &&
        tempGeometry?.extent?.ymin != null &&
        tempGeometry?.extent?.xmax != null &&
        tempGeometry?.extent?.ymax != null
          ? [
              [
                tempGeometry?.extent.xmin,
                tempGeometry?.extent.ymin,
                tempGeometry?.extent.xmax,
                tempGeometry?.extent.ymax,
              ],
            ]
          : [];

      collection.extent.spatial.bbox = bbox;

      try {
        const result = await this.updateCollection(collection);
        if (result.response.code !== "200") {
          throw new Error(result.response.description);
        }
        this.showAlert(
          "Successfully updated collection",
          `Updating ${collection.id}`,
          "green"
        );
      } catch (e) {
        this.updateIsLoading(false);
        this.showAlert("Error updating collection", `${e}`, "red");
      }

      this.rerenderCollectionsList(this.collections);
      this.showAllGraphicsLayers(this.view);
      this.sketchGraphicsLayer.removeAll();
      this.handleReadCollection(id);
      this.clearCollectionAssets();
      this.hideEditor();
    },

    updateCollection: async function (collection) {
      try {
        console.log("Updating Collection", collection.id);
        let url = `${this.getStacBaseUrl()}/collections`;
        var client = new AppClient();
        url = client.appendAccessToken(url);
        const response = await fetch(url, {
          method: "PUT",
          body: JSON.stringify(collection),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        return {
          response: result,
          id: collection.id,
        };
      } catch (e) {
        throw new Error(`Unable to update collection ${collection.id}`);
        console.error(e);
      }
    },

    handleReadCollection: function (id) {
      this.appActionState = this.actions.READ_COLLECTION;
      this.selectedCollection = this.readCollection(id);
      this.selectedGraphic = this.selectedCollection.graphic;
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

    handleEditorPrimaryButtonEnabled: function (id, title, description) {
      if (
        !this.isBlank(id) &&
        !this.isBlank(title) &&
        !this.isBlank(description)
      ) {
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

    hideAlert: function () {
      this.alertContainer.classList.add("hidden");
    },

    showAlert: function (
      title = "",
      message = "",
      color = "green",
      delay = 1500
    ) {
      this.alertTitle.innerHTML = title;
      this.alertMessage.innerHTML = message;
      this.alertColor.style.backgroundColor = color;
      setTimeout(() => {
        this.alertContainer.classList.remove("hidden");
      }, delay);
    },

    hideEditor: function () {
      this.appActionState = this.actions.NONE;
      this.leftPanelEditorView.style.display = "none";
      this.leftPanelListView.style.display = "flex";
    },

    handleAssetFieldInput: function (key, field, value) {
      this.collectionAssets[key][field] = value;
      console.log(this.collectionAssets);
    },

    hasDuplicateAssetKey: function (key) {
      if (key && this.collectionAssets && this.collectionAssets[key]) {
        return true;
      } else {
        return false;
      }
    },

    isCollectionAssetsObjValid: function (assets) {
      // If main object is empty, return false
      if (Object.keys(assets).length === 0) {
        return false;
      }

      for (const asset of Object.values(assets)) {
        const title = asset.title?.trim();
        const id = asset.id?.trim();

        if (!title || !id) {
          return false;
        }
      }

      return false;
    },

    isBlank: function (value) {
      return !value || /^\s*$/.test(value);
    },

    createAssetNode: function (key, title = "", href = "", wkt = "") {
      const id = Date.now();
      const assetNode = document.createElement("div");
      assetNode.classList.add("asset-container");
      assetNode.id = `asset-${id}`;

      // <hr />
      const hr = document.createElement("hr");
      assetNode.appendChild(hr);

      // <label class="editor-label">Asset key <span class="required">*</span>:</label>
      const labelKey = document.createElement("label");
      labelKey.className = "editor-label";
      labelKey.innerHTML = 'Asset key <span class="required">*</span>:';
      assetNode.appendChild(labelKey);

      // <input id="asset-key-input-${id}" ... disabled />
      const inputKey = document.createElement("input");
      inputKey.id = `asset-key-input-${id}`;
      inputKey.className = "editor-input";
      inputKey.type = "text";
      inputKey.placeholder = "value...";
      inputKey.value = key;
      inputKey.disabled = true;
      assetNode.appendChild(inputKey);

      // <label class="editor-label">title <span class="required">*</span>:</label>
      const labelTitle = document.createElement("label");
      labelTitle.className = "editor-label";
      labelTitle.innerHTML = 'title <span class="required">*</span>:';
      assetNode.appendChild(labelTitle);

      // <input id="asset-title-input-${id}" ... />
      const inputTitle = document.createElement("input");
      inputTitle.id = `asset-title-input-${id}`;
      inputTitle.className = "editor-input";
      inputTitle.type = "text";
      inputTitle.placeholder = "value...";
      inputTitle.value = title;
      assetNode.appendChild(inputTitle);

      // <label class="editor-label">href:</label>
      const labelHref = document.createElement("label");
      labelHref.className = "editor-label";
      labelHref.innerText = "href:";
      assetNode.appendChild(labelHref);

      // <input id="asset-href-input-${id}" ... />
      const inputHref = document.createElement("input");
      inputHref.id = `asset-href-input-${id}`;
      inputHref.className = "editor-input";
      inputHref.type = "text";
      inputHref.placeholder = "value...";
      inputHref.value = href;
      assetNode.appendChild(inputHref);

      // <label class="editor-label">esri:wkt:</label>
      const labelWkt = document.createElement("label");
      labelWkt.className = "editor-label";
      labelWkt.innerText = "esri:wkt:";
      assetNode.appendChild(labelWkt);

      // <input id="asset-wkt-input-${id}" ... />
      const inputWkt = document.createElement("input");
      inputWkt.id = `asset-wkt-input-${id}`;
      inputWkt.className = "editor-input";
      inputWkt.type = "text";
      inputWkt.placeholder = "value...";
      inputWkt.value = wkt;
      assetNode.appendChild(inputWkt);

      const assetTitleInput = assetNode.querySelector(
        `#asset-title-input-${id}`
      );
      const assetHrefInput = assetNode.querySelector(`#asset-href-input-${id}`);
      const assetWktInput = assetNode.querySelector(`#asset-wkt-input-${id}`);

      assetTitleInput.oninput = (e) =>
        this.handleAssetFieldInput(key, "title", e.target.value);
      assetHrefInput.oninput = (e) =>
        this.handleAssetFieldInput(key, "href", e.target.value);
      assetWktInput.oninput = (e) =>
        this.handleAssetFieldInput(key, "esri:wkt", e.target.value);

      const removeAssetButton = document.createElement("button");
      removeAssetButton.classList.add("remove-asset-button");
      removeAssetButton.innerText = "Remove Asset";
      removeAssetButton.onclick = () => {
        this.deleteCollectionAsset(key);
        assetNode.remove();
      };
      assetNode.appendChild(removeAssetButton);
      return assetNode;
    },

    createAssetEditorNode: function () {
      let assetEditorNode = document.createElement("div");
      assetEditorNode.id = "asset-editor-container";

      const addAssetContainer = document.createElement("div");
      addAssetContainer.classList.add("add-asset-container");

      const addAssetButton = document.createElement("button");
      addAssetButton.classList.add("add-asset-button");
      addAssetButton.innerHTML = "Add Asset +";
      addAssetButton.classList.add("disabled-button");
      addAssetButton.disabled = true;

      const initialAssetKeyInput = document.createElement("input");
      initialAssetKeyInput.type = "text";
      initialAssetKeyInput.placeholder = "Unique Asset Key...";
      initialAssetKeyInput.id = "initial-asset-key";
      initialAssetKeyInput.oninput = (e) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
        initialAssetKeyInput.value = value;
        if (!this.isBlank(value) && !this.hasDuplicateAssetKey(value)) {
          addAssetButton.disabled = false;
          addAssetButton.classList.remove("disabled-button");
        } else {
          addAssetButton.disabled = true;
          addAssetButton.classList.add("disabled-button");
        }
      };

      addAssetButton.onclick = () => {
        addAssetButton.disabled = true;
        addAssetButton.classList.add("disabled-button");

        const editorNode = document.querySelector("#asset-editor-container");
        const assetKey = initialAssetKeyInput.value;
        this.addNewCollectionAsset(assetKey, { ...this.DEFAULT_ASSET });
        const assetNode = this.createAssetNode(assetKey);
        initialAssetKeyInput.value = "";
        editorNode.appendChild(assetNode);
      };

      addAssetContainer.appendChild(initialAssetKeyInput);
      addAssetContainer.appendChild(addAssetButton);
      assetEditorNode.appendChild(addAssetContainer);
      return assetEditorNode;
    },

    renderUpdateAssetEditor: function (assets) {
      const assetEditorNode = this.createAssetEditorNode();
      this.editorInputForm.appendChild(assetEditorNode);

      Object.entries(assets).forEach(([key, value]) => {
        const assetNode = this.createAssetNode(
          key,
          value.title,
          value.href,
          value["esri:wkt"]
        );
        this.editorInputForm.appendChild(assetNode);
      });
    },

    renderUpdateCollectionEditor: function (properties) {
      this.collectionEditorTitle.innerHTML = "Update Collection";
      this.editorPrimaryButton.innerHTML = "Update Collection";
      this.editorInputForm.innerHTML = "";

      // <label class="editor-label">id:</label>
      const labelId = document.createElement("label");
      labelId.className = "editor-label";
      labelId.innerText = "id:";
      this.editorInputForm.appendChild(labelId);

      // <input id="collection-id-input" ... disabled />
      const inputId = document.createElement("input");
      inputId.id = "collection-id-input";
      inputId.className = "editor-input";
      inputId.type = "text";
      inputId.placeholder = "value...";
      inputId.value = properties.id;
      inputId.disabled = true;
      this.editorInputForm.appendChild(inputId);

      // <label class="editor-label">title <span class="required">*</span>:</label>
      const labelTitle = document.createElement("label");
      labelTitle.className = "editor-label";
      labelTitle.innerHTML = 'title <span class="required">*</span>:';
      this.editorInputForm.appendChild(labelTitle);

      // <input id="collection-title-input" ... />
      const inputTitle = document.createElement("input");
      inputTitle.id = "collection-title-input";
      inputTitle.className = "editor-input";
      inputTitle.type = "text";
      inputTitle.placeholder = "value...";
      inputTitle.value = properties.title;
      this.editorInputForm.appendChild(inputTitle);

      // <label class="editor-label">description <span class="required">*</span>:</label>
      const labelDescription = document.createElement("label");
      labelDescription.className = "editor-label";
      labelDescription.innerHTML =
        'description <span class="required">*</span>:';
      this.editorInputForm.appendChild(labelDescription);

      // <textarea id="collection-description-input" ...>
      const textareaDescription = document.createElement("textarea");
      textareaDescription.id = "collection-description-input";
      textareaDescription.className = "editor-input";
      textareaDescription.style.height = "100px";
      textareaDescription.rows = 5;
      textareaDescription.placeholder = "value...";
      textareaDescription.textContent = properties.description;
      this.editorInputForm.appendChild(textareaDescription);

      this.renderUpdateAssetEditor(this.collectionAssets);
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

      <label class="editor-label">description <span class="required">*</span>:</label>
      <textArea id="collection-description-input" style="height: 100px" class="editor-input" rows="5" placeholder="value..."></textArea>
  `;
      this.editorInputForm.innerHTML = collectionInputs;
      const assetEditorNode = this.createAssetEditorNode();
      this.editorInputForm.appendChild(assetEditorNode);
      this.initializeCollectionFormListeners();
    },

    showEditor: function () {
      if (this.appActionState === this.actions.CREATE_COLLECTION) {
        this.initializeCreateWorkflow(this.view);
      } else if (this.appActionState === this.actions.UPDATE_COLLECTION) {
        this.initializeUpdateWorkflow(
          this.view,
          this.selectedCollection,
          this.selectedCollection.graphic
        );
      }
      this.leftPanelEditorView.style.display = "flex";
      this.leftPanelListView.style.display = "none";
    },

    initializeCreateWorkflow: async function (view) {
      if (!view) {
        console.error("missing arguments");
        return;
      }
      this.selectedGraphic = null;
      this.renderCreateCollectionEditor();
    },

    initializeUpdateWorkflow: async function (view, feature, graphic) {
      if (!feature || !view) {
        console.error("missing arguments");
        return;
      }

      const collection = await this.getCollectionById(
        this.selectedCollection.properties.id
      );
      this.setCollectionAssets(collection.assets ? collection.assets : {});
      this.renderUpdateCollectionEditor(this.selectedCollection.properties);

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
      this.clearCollectionAssets();
    },

    handleCancelCreateCollection: function () {
      this.sketchGraphicsLayer.removeAll();
      this.clearCollectionAssets();
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

    emptyCollectionInfoBox: function () {
      let tableRows = [];
      this.infoTableTitle.innerHTML = "Collection Info";
      this.infoTableBody.innerHTML = tableRows.join("");
      this.handleZoomCollectionEnabled();
    },

    getUpdateFieldValues: function () {
      return {
        id: document.getElementById("collection-id-input").value,
        description: document.getElementById("collection-description-input")
          .value,
        title: document.getElementById("collection-title-input").value,
        assets: this.collectionAssets,
      };
    },

    getCreateFieldValues: function () {
      return {
        id: document.getElementById("collection-id-input").value,
        description: document.getElementById("collection-description-input")
          .value,
        title: document.getElementById("collection-title-input").value,
        assets: this.collectionAssets,
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
            this.selectedCollection.properties.id,
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

      // Alert Events
      this.alertContainer.addEventListener("click", () => {
        this.alertContainer.classList.add("hidden");
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
        collectionTitleInput.value,
        collectionDescriptionInput.value
      );

      collectionDescriptionInput.addEventListener("input", (e) => {
        this.handleEditorPrimaryButtonEnabled(
          collectionIdInput.value,
          collectionTitleInput.value,
          collectionDescriptionInput.value
        );
      });

      collectionIdInput.addEventListener("input", (e) => {
        collectionIdInput.value = this.removeSpecialCharacters(
          collectionIdInput.value
        );
        this.handleEditorPrimaryButtonEnabled(
          collectionIdInput.value,
          collectionTitleInput.value,
          collectionDescriptionInput.value
        );
      });

      collectionTitleInput.addEventListener("input", (e) => {
        this.handleEditorPrimaryButtonEnabled(
          collectionIdInput.value,
          collectionTitleInput.value,
          collectionDescriptionInput.value
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

      sketchVM.on("update", (e) => {
        if (e.state === "complete") {
          this.selectedGraphic = e.graphics[0];
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

    removeAllSpaces: function (str) {
      return str.replace(/ /g, "");
    },

    removeSpecialCharacters: function (str) {
      return str.replace(/[^a-zA-Z0-9_-]/g, "");
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
            position: "top-right",
            index: 1,
          });

          let layerList = new LayerList({
            view: view,
          });
          let layerListExpand = new Expand({
            expandIcon: "layers",
            expandTooltip: "Map Layers",
            view: view,
            content: layerList,
          });
          view.ui.add(layerListExpand, {
            position: "top-left",
            index: 1,
          });

          let homeWidget = new Home({
            view: view,
          });

          // adds the home widget to the top left corner of the MapView
          view.ui.add(homeWidget, {
            position: "top-right",
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
            position: "top-right",
            index: 1,
          });
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
  });

  return oThisClass;
});
