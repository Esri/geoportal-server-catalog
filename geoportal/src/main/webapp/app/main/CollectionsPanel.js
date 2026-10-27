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
  "dojo/i18n!app/nls/resources",
  "dojo/Deferred",
  "dojo/topic",
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
  "app/context/app-topics",
  "esri4/layers/GeoJSONLayer",
  "app/main/ItemListPanel",
  "app/main/ConfirmModal",
  "app/main/StatusModal"
], function (
  declare,
  lang,
  Templated,
  template,
  i18n,
  Deferred,
  topic,
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
  AppClient,appTopics,GeoJSONLayer,
  ItemListPanel,
  ConfirmModal,
  StatusModal
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
	  	color: [0, 0, 0, 0], // Transparent fill (RGBA)
	  	outline: {
		    type: "simple-line",
		    color: [255, 165, 0], // outline
		    width: 2 // Outline thickness in points	
		}     
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
    DEFAULT_CONTACT: {
      name: "",
      position: "",
      organization: "",
      description: "",
      emails: [],
    },
    DEFAULT_CONTACT_EMAIL: {
      value: "",
      roles: [],
    },
    DEFAULT_PROVIDER: {
      name: "",
      description: "",
      roles: [],
      url: "",
    },

    appActionState: "NONE",
    collections: [],
    selectedCollection: null,
    collectionIdsToBeDeleted: [],
    selectedGraphic: null,
    sketchGraphicsLayer: null,
    collectionAssets: {},
    collectionContacts: [],
    collectionProviders: [],
    collectionProperties: [], // [{key, value}] - generic additional properties

    sampleCollection: [
      {
        id: 1,
        title: "Sample Collection",
        description:
          "A port city in the Netherlands known for modern architecture.",
      },
    ],
	
	 filterByExtent: false,

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

    // -----------------------------------------------------------------
    // Contacts
    // -----------------------------------------------------------------
    setCollectionContacts: function (value) {
      this.collectionContacts = Array.isArray(value) ? value : [];
    },

    clearCollectionContacts: function () {
      this.setCollectionContacts([]);
      return this.collectionContacts;
    },

    addNewCollectionContact: function (contact) {
      this.collectionContacts.push(contact);
      return this.collectionContacts;
    },

    deleteCollectionContact: function (contact) {
      const index = this.collectionContacts.indexOf(contact);
      if (index > -1) {
        this.collectionContacts.splice(index, 1);
      }
      return this.collectionContacts;
    },

    handleContactFieldInput: function (contact, field, value) {
      contact[field] = value;
      console.log(this.collectionContacts);
      this.revalidateEditorPrimaryButton();
    },

    addNewContactEmail: function (contact) {
      if (!Array.isArray(contact.emails)) {
        contact.emails = [];
      }
      const email = { ...this.DEFAULT_CONTACT_EMAIL, roles: [] };
      contact.emails.push(email);
      return email;
    },

    deleteContactEmail: function (contact, email) {
      if (!Array.isArray(contact.emails)) {
        return;
      }
      const index = contact.emails.indexOf(email);
      if (index > -1) {
        contact.emails.splice(index, 1);
      }
    },

    handleContactEmailFieldInput: function (email, field, value) {
      if (field === "roles") {
        email.roles = value
          .split(",")
          .map((role) => role.trim())
          .filter((role) => role.length > 0);
      } else {
        email[field] = value;
      }
      console.log(this.collectionContacts);
    },

    isCollectionContactsObjValid: function (contacts) {
      if (!Array.isArray(contacts) || contacts.length === 0) {
        return true;
      }
      return contacts.every((contact) => !this.isBlank(contact.name));
    },

    // -----------------------------------------------------------------
    // Providers
    // -----------------------------------------------------------------
    setCollectionProviders: function (value) {
      this.collectionProviders = Array.isArray(value) ? value : [];
    },

    clearCollectionProviders: function () {
      this.setCollectionProviders([]);
      return this.collectionProviders;
    },

    addNewCollectionProvider: function (provider) {
      this.collectionProviders.push(provider);
      return this.collectionProviders;
    },

    deleteCollectionProvider: function (provider) {
      const index = this.collectionProviders.indexOf(provider);
      if (index > -1) {
        this.collectionProviders.splice(index, 1);
      }
      return this.collectionProviders;
    },

    handleProviderFieldInput: function (provider, field, value) {
      if (field === "roles") {
        provider.roles = value
          .split(",")
          .map((role) => role.trim())
          .filter((role) => role.length > 0);
      } else {
        provider[field] = value;
      }
      this.revalidateEditorPrimaryButton();
    },

    isCollectionProvidersObjValid: function (providers) {
      if (!Array.isArray(providers) || providers.length === 0) {
        return true;
      }
      return providers.every((provider) => !this.isBlank(provider.name));
    },

    // Parses the summaries textarea value into a JSON object.
    // Returns { ok: true, value } on success, or
    // { ok: false, value: null } if the text is not valid JSON / not an object.
    _parseSummaries: function (text) {
      const trimmed = (text || "").trim();
      if (!trimmed) {
        return { ok: true, value: {} };
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          return { ok: false, value: null };
        }
        return { ok: true, value: parsed };
      } catch (e) {
        return { ok: false, value: null };
      }
    },

    _parseKeywords: function (text) {
      return (text || "")
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
    },

    // -----------------------------------------------------------------
    // Additional properties (generic key/value pairs, same pattern as
    // ItemEditorPanel's "Additional Properties" editor)
    // -----------------------------------------------------------------
    setCollectionProperties: function (value) {
      this.collectionProperties = Array.isArray(value) ? value : [];
    },

    clearCollectionProperties: function () {
      this.setCollectionProperties([]);
      return this.collectionProperties;
    },

    addNewCollectionProperty: function (property) {
      this.collectionProperties.push(property);
      return this.collectionProperties;
    },

    deleteCollectionProperty: function (property) {
      const index = this.collectionProperties.indexOf(property);
      if (index > -1) {
        this.collectionProperties.splice(index, 1);
      }
      return this.collectionProperties;
    },

    handlePropertyFieldInput: function (property, field, value) {
      property[field] = value;
    },

    _stringifyPropertyValue: function (value) {
      if (value === null || value === undefined) return "";
      if (typeof value === "string") return value;
      try {
        return JSON.stringify(value);
      } catch (e) {
        return String(value);
      }
    },

    // attempts to parse a property's text value back into JSON (number,
    // boolean, array, object); falls back to the raw string on failure.
    _parsePropertyValue: function (text) {
      if (text === "" || text === undefined || text === null) return text;
      const trimmed = text.trim();
      if (trimmed === "true") return true;
      if (trimmed === "false") return false;
      if (!isNaN(trimmed) && trimmed !== "" && String(Number(trimmed)) === trimmed) return Number(trimmed);
      if (trimmed.charAt(0) === "{" || trimmed.charAt(0) === "[") {
        try { return JSON.parse(trimmed); } catch (e) { /* fall through */ }
      }
      return text;
    },

    // builds a plain object from this.collectionProperties, used for the
    // collection payload sent to create/update.
    _buildPropertiesObject: function () {
      const propertiesObj = {};
      (this.collectionProperties || []).forEach((p) => {
        const key = (p.key || "").trim();
        if (!key) return;
        // unchanged row: send the original typed value (null, "00123", "false", ...)
        propertiesObj[key] = (p.hasOriginal && p.value === p.originalText)
          ? p.original
          : this._parsePropertyValue(p.value);
      });
      return propertiesObj;
    },

    postCreate: function () {
      this.inherited(arguments);
      this.readConfig();
      topic.subscribe(appTopics.SignedIn,lang.hitch(this,function(params){
    	 // this.handleGetCollections();  
    	  this.updateUI();
      }));
    },

    handleGetCollections: async function (view) {
      console.log("handleGetCollections");
      this.collections = await this.getAllCollections();
      this.renderCollectionsList(this.collections);
      this.renderCollectionGraphics(this.collections, view? view: this.view);
    },

    handleMapReady: function (view) {
      this.initializeListeners();
      this.initializeSketchViewModel(view);
      if (this.itemListPanel) {
        this.itemListPanel.setView(view);
      }
      this.updateUI();
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
    
   updateUI: function() {
	   var isAdmin = AppContext.appUser.isAdmin();       
       $("button[data-role='admin']").each(function(i,nd) {
         if (isAdmin) nd.style.display = "";
         else nd.style.display = "none";
       });	  
    
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
			visible: ((collection.properties.id === this.selectedCollection?.properties?.id) ? true : false) // only show the layer of selected collection
          });
		  
          graphicsLayer.add(graphic);
          view.map.layers.add(graphicsLayer);
        }
      });
    },

    getCollectionById: async function (id) {
      let collection = null;
      try {
        let url = `${this.getStacBaseUrl()}/allCollections/${this.replaceSpaceWithPlus(
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

    getAllCollections: async function (f = "geojson")
    {
        let collections = [];
        try {
          let url = `${this.getStacBaseUrl()}/collections?limit=10000&f=${f}`;
          if (AppContext.appConfig.system.secureCatalogApp)
          {
          	var client = new AppClient();
            	var accessToken = client.getAccessToken();
            	if(accessToken && accessToken.length >0)
        		{
            		url = client.appendAccessToken(url);
        		}	
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
        if (layer.title !== "sketch" && layer.title !== "item-editor-sketch") {
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
          // Clear selection first, then empty info box to ensure UI state is consistent
          this.selectedCollection = null;
          this.emptyCollectionInfoBox();
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
            this.i18n.collections.alerts.deleteSuccessTitle,
            lang.replace(this.i18n.collections.alerts.deleteSuccessMessage, { deleted: successDeleteIds.join(", ") }) +
              (failedDeleteIds.length > 0
                ? lang.replace(this.i18n.collections.alerts.deleteFailedSuffix, { failed: failedDeleteIds.join(", ") })
                : ""),
            "green"
          );
          this.rerenderCollectionsList();
          this.collectionIdsToBeDeleted = [];
          this.handleDeleteCollectionEnabled();
          this.handleUpdateButtonEnabled();
        })
        .catch((e) => {
          this.showAlert(this.i18n.collections.alerts.deleteErrorTitle, `${e}`, "red");
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
        throw new Error(lang.replace(this.i18n.collections.alerts.deleteError, { id: id }));
      }
    },

    handleCreateCollection: async function () {
      this.appActionState = this.actions.CREATE_COLLECTION;
      this.updateIsLoading(true);
      this.sketchVM.complete();
      
      // Make sketch layer visible so user can see their drawing
      if (this.sketchGraphicsLayer) {
        this.sketchGraphicsLayer.visible = true;
      }

      const { id, description, title, assets, contacts, license, keywordsText, summariesText, providers, properties } =
        this.getCreateFieldValues();
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

      const parsedSummaries = this._parseSummaries(summariesText);

      const stacCheckboxNode = document.getElementById("collection-stac-checkbox");
      const isStacCollection = !!(stacCheckboxNode && stacCheckboxNode.checked);
      const collection = {
        type: "Collection",
        ...(isStacCollection ? { stac_version: "1.0.0" } : {}),
        stac_extensions: [
          "https://stac-extensions.github.io/contacts/v0.1.0/schema.json",
        ],
        id: this.removeAllSpaces(id),
        title: title,
        description: description,
        keywords: this._parseKeywords(keywordsText),
        license: (license || "").trim() || "Apache-2.0",
        providers: providers || [],
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
        summaries: Object.assign(
          {
            datetime: {
              min: "1900-01-01T00:00:00Z",
              max: "2099-12-31T23:59:59Z",
            },
          },
          parsedSummaries.value || {}
        ),
        links: [],
        assets: assets,
        item_assets: {},
        contacts: contacts || [],
        properties: properties || {},
      };

      try {
        const result = await this.createCollection(collection);
        if (result && result.badRequest) {
          // keep the editor open so the user can correct the input
          this.updateIsLoading(false);
          StatusModal.show({
            title: this.i18n.collections.alerts.createErrorTitle,
            message: result.message,
            type: "error",
            color: "red",
          });
          return;
        }
        if (result.response.code !== "201") {
          throw new Error(result.response.description);
        }
        this.showAlert(
          this.i18n.collections.alerts.createSuccessTitle,
          lang.replace(this.i18n.collections.alerts.createSuccessMessage, { id: collection.id }),
          "green"
        );
      } catch (e) {
        this.updateIsLoading(false);
        this.showAlert(this.i18n.collections.alerts.createErrorTitle, `${e}`, "red");
      }

      this.clearCollectionAssets();
      this.clearCollectionContacts();
      this.clearCollectionProviders();
      this.clearCollectionProperties();
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
        const text = await response.text();
        let result = {};
        try { result = text ? JSON.parse(text) : {}; } catch (parseErr) { result = { description: text }; }
        if (response.status === 400) {
          const msg = (result && (result.description || result.message || result.detail || result.error)) ||
            text || "Bad Request";
          return { badRequest: true, message: String(msg), id: collection.id };
        }
        return {
          response: result,
          id: collection.id,
        };
      } catch (e) {
        console.error(e);
        throw new Error(lang.replace(this.i18n.collections.alerts.createError, { id: collection.id }));
      }
    },

    // -----------------------------------------------------------------
    // Export Collection
    // -----------------------------------------------------------------
    handleExportCollection: async function () {
      if (!this.selectedCollection) {
        return;
      }
      const id = this.selectedCollection.properties.id;
      try {
        this.updateIsLoading(true);
        const collection = await this.getCollectionById(id);
        if (!collection || collection === this.sampleCollection) {
          throw new Error(lang.replace(this.i18n.collections.alerts.exportRetrieveError, { id: id }));
        }
        const blob = new Blob([JSON.stringify(collection, null, 2)], {
          type: "application/json",
        });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${id}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
        this.updateIsLoading(false);
        this.showAlert(
          this.i18n.collections.alerts.exportSuccessTitle,
          lang.replace(this.i18n.collections.alerts.exportSuccessMessage, { id: id }),
          "green"
        );
      } catch (e) {
        this.updateIsLoading(false);
        console.error(e);
        this.showAlert(this.i18n.collections.alerts.exportErrorTitle, `${e}`, "red");
      }
    },

    // -----------------------------------------------------------------
    // Import Collection
    // -----------------------------------------------------------------
    handleImportCollectionClick: function () {
      // reset value so selecting the same file again still triggers change
      this.importFileInput.value = "";
      this.importFileInput.click();
    },

    handleImportFileSelected: function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        return;
      }

      // Only allow .json files, discard other extensions
      const fileName = file.name || "";
      const isJson =
        fileName.toLowerCase().endsWith(".json") ||
        file.type === "application/json";
      if (!isJson) {
        this.showAlert(
          this.i18n.collections.alerts.invalidFileTypeTitle,
          lang.replace(this.i18n.collections.alerts.invalidFileTypeMessage, { name: fileName }),
          "red"
        );
        this.importFileInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        this.processImportedCollectionText(event.target.result);
      };
      reader.onerror = () => {
        this.showAlert(
          this.i18n.collections.alerts.readErrorTitle,
          lang.replace(this.i18n.collections.alerts.readErrorMessage, { name: fileName }),
          "red"
        );
      };
      reader.readAsText(file);
    },

    processImportedCollectionText: async function (text) {
      let collection = null;
      try {
        collection = JSON.parse(text);
      } catch (e) {
        this.showAlert(
          this.i18n.collections.alerts.invalidJsonTitle,
          this.i18n.collections.alerts.invalidJsonMessage,
          "red"
        );
        return;
      }

      if (!collection || typeof collection !== "object" || !collection.id) {
        this.showAlert(
          this.i18n.collections.alerts.invalidCollectionTitle,
          this.i18n.collections.alerts.invalidCollectionMessage,
          "red"
        );
        return;
      }

      // client-side duplicate id validation against currently loaded collections
      const existing = (this.collections || []).some(
        (c) => String(c.properties.id) === String(collection.id)
      );
      if (existing) {
        this.showAlert(
          this.i18n.collections.alerts.duplicateTitle,
          lang.replace(this.i18n.collections.alerts.duplicateMessage, { id: collection.id }),
          "red"
        );
        return;
      }

      this.appActionState = this.actions.CREATE_COLLECTION;
      this.updateIsLoading(true);
      try {
        const result = await this.createCollection(collection);
        if (!result || !result.response || result.response.code !== "201") {
          const description =
            (result && result.response && (result.response.message || result.response.description)) ||
            this.i18n.collections.alerts.importUnknownError;
          throw new Error(description);
        } else {
          this.showAlert(
            this.i18n.collections.alerts.importSuccessTitle,
            lang.replace(this.i18n.collections.alerts.importSuccessMessage, { id: collection.id }),
            "green"
          );
          this.rerenderCollectionsList();
        }
      } catch (e) {
        this.updateIsLoading(false);
        console.error(e);
        this.showAlert(this.i18n.collections.alerts.importErrorTitle, `${e.message || e}`, "red");
      }
    },
	
	clearMapView:function() {
      if (this.itemListPanel) {
        this.itemListPanel.clear();
      }
		 let rasterLayer = this.view.map.layers.find(layer => layer.type === "imagery");
         if(rasterLayer) {
             this.view.map.remove(rasterLayer);
             rasterLayer.destroy();
         }
		 if(!this.itemListPanel || !this.itemListPanel.isFilterByExtentActive()) {
			this.view.goTo({
	            zoom:this.mapProps.zoom,
	            center:this.mapProps.center
	        });
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
        contacts: newContacts,
        license: newLicense,
        keywordsText: newKeywordsText,
        summariesText: newSummariesText,
        providers: newProviders,
        properties: newProperties,
      } = properties;
      collection.id = this.removeAllSpaces(collection.id);
      collection.title = newTitle;
      collection.description = newDescription;
      collection.assets = newAssets;
      collection.contacts = newContacts || [];
      collection.providers = newProviders || [];
      collection.properties = newProperties || {};
      collection.license = (newLicense || "").trim() || "Apache-2.0";
      collection.keywords = this._parseKeywords(newKeywordsText);
      const parsedSummaries = this._parseSummaries(newSummariesText);
      collection.summaries = Object.assign({}, collection.summaries, parsedSummaries.value || {});
      if (
        !Array.isArray(collection.stac_extensions)
      ) {
        collection.stac_extensions = [];
      }
      if (
        collection.contacts.length > 0 &&
        !collection.stac_extensions.includes(
          "https://stac-extensions.github.io/contacts/v0.1.0/schema.json"
        )
      ) {
        collection.stac_extensions.push(
          "https://stac-extensions.github.io/contacts/v0.1.0/schema.json"
        );
      }
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

      let updated = false;
      try {
        const result = await this.updateCollection(collection);
        if (result.response.code !== "200") {
          throw new Error(result.response.description);
        }
        updated = true;
        this.showAlert(
          this.i18n.collections.alerts.updateSuccessTitle,
          lang.replace(this.i18n.collections.alerts.updateSuccessMessage, { id: collection.id }),
          "green"
        );
      } catch (e) {
        this.updateIsLoading(false);
        this.showAlert(this.i18n.collections.alerts.updateErrorTitle, `${e}`, "red");
      }

      this.rerenderCollectionsList(this.collections);
      this.showAllGraphicsLayers(this.view);
      this.sketchGraphicsLayer.removeAll();
      // the search index is near-real-time, so re-reading right after the update
      // can return the old values; show the collection we just saved instead
      this.handleReadCollection(id, updated ? collection : null);
      this.clearCollectionAssets();
      this.clearCollectionContacts();
      this.clearCollectionProviders();
      this.clearCollectionProperties();
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
        console.error(e);
        throw new Error(lang.replace(this.i18n.collections.alerts.updateError, { id: collection.id }));
      }
    },

    // prefetchedCollection: optional full collection object to display instead of
    // fetching it again (used right after an update, before the index catches up)
    handleReadCollection: async function (id, prefetchedCollection) {
      this.appActionState = this.actions.READ_COLLECTION;
      this.selectedCollection = this.readCollection(id);
      this.selectedGraphic = this.selectedCollection.graphic;
      this.handleUpdateButtonEnabled();  
	   
      if (this.selectedCollection) {
        const collection = prefetchedCollection || await this.getCollectionById(
          this.selectedCollection.properties.id
        );
        console.log(collection);
        const properties = {
          id: collection.id,
          title: collection.title,
          description: collection.description,
          stac_version: collection.stac_version,
          license: collection.license,
          keywords: Array.isArray(collection.keywords) ? collection.keywords.join(", ") : "",
          providers: JSON.stringify(collection.providers || []),
          summaries: JSON.stringify(collection.summaries || {}),
          properties: JSON.stringify(collection.properties || {}),
          assets: JSON.stringify(collection.assets),
          contacts: JSON.stringify(collection.contacts || []),
        };

        this.selectedCollectionIsStac = !!collection.stac_version;
        this.updateCollectionInfoBox(properties);
		//Turn off all collection layers first
        this.view.map.layers.forEach(layer => {
            if(layer.title && layer.title !== "item-editor-sketch") {
                layer.visible = false;
            }
        });
		//Turn on the layer of the selected collection	
        this.view.map.layers.forEach(layer => {
            if(layer.title === this.selectedCollection.properties.id) {
                layer.visible = true;
            }
        });
		
        this.handleZoomTo(this.selectedCollection.graphic);
		
      }
    },
	
	handleViewItems: async function (collectionId) {
      if (!collectionId) return;
      try {
        this.updateIsLoading(true);
        this.selectedCollectionId = collectionId;
        // Turn off the collection boundary layer while viewing its items
        this.view.map.layers.forEach(layer => {
            if (layer.title === this.selectedCollection.properties.id) {
                layer.visible = false;
            }
        });
        this.clearMapView();
        if (this.itemListPanel) {
          await this.itemListPanel.open({
            collectionId: collectionId,
            collectionTitle: this.selectedCollection.properties.title,
            view: this.view
          });
        }
        this.updateIsLoading(false);
      } catch (e) {
        this.updateIsLoading(false);
        console.error("handleViewItems failed", e);
      }
    },

    handleZoomTo: async function (feature,selectedId) {
      if (feature) {
		this.clearMapView();
		//Turn on the layer of the selected collection
		if(selectedId) {	
	        this.view.map.layers.forEach(layer => {
	            if(layer.title === selectedId) {
	                layer.visible = true;
	            }
	        });
		}
        try {
          await this.view.goTo(feature);
        } catch (e) {
          console.error("goTo failed", e);
        }
      }
    },

    readCollection: function (id = 0) {
      console.log("Reading Collection", id);
	  this.clearMapView();
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
      if (this.selectedCollection && this.selectedCollection.graphic) {
        this.zoomCollectionButton.disabled = false;
        this.zoomCollectionButton.classList.remove("disabled");
      } else {
        this.zoomCollectionButton.disabled = true;
        this.zoomCollectionButton.classList.add("disabled");
      }
    },

    handleExportCollectionEnabled: function () {
      if (this.selectedCollection) {
        this.exportCollectionButton.disabled = false;
        this.exportCollectionButton.classList.remove("disabled");
      } else {
        this.exportCollectionButton.disabled = true;
        this.exportCollectionButton.classList.add("disabled");
      }
    },
	
	handleViewItemsEnabled: function () {
	      // Show View Items only for STAC collections (those with stac_version)
	      this.viewItemsButton.style.display = this.selectedCollectionIsStac ? "" : "none";
	      if (this.selectedCollection && this.selectedCollectionIsStac) {
	        this.viewItemsButton.disabled = false;
	        this.viewItemsButton.classList.remove("disabled");
	      } else {
	        this.viewItemsButton.disabled = true;
	        this.viewItemsButton.classList.add("disabled");
	      }
	},

    handleEditorPrimaryButtonEnabled: function (id, title, description) {
      if (
        !this.isBlank(id) &&
        !this.isBlank(title) &&
        !this.isBlank(description) &&
        this.isCollectionContactsObjValid(this.collectionContacts) &&
        this.isCollectionProvidersObjValid(this.collectionProviders)
      ) {
        this.editorPrimaryButton.disabled = false;
        this.editorPrimaryButton.classList.remove("disabled-button");
      } else {
        this.editorPrimaryButton.disabled = true;
        this.editorPrimaryButton.classList.add("disabled-button");
      }
    },

    /**
     * Re-reads the collection id/title/description currently in the editor
     * form and re-runs handleEditorPrimaryButtonEnabled (which also checks
     * this.collectionContacts via isCollectionContactsObjValid). Must be
     * called whenever a contact is added, removed, or edited so that an
     * empty/invalid contact name immediately disables the primary button,
     * instead of only being caught by the id/title/description fields.
     */
    revalidateEditorPrimaryButton: function () {
      if (!this.editorInputForm) return;
      var idInput = this.editorInputForm.querySelector("#collection-id-input");
      var titleInput = this.editorInputForm.querySelector("#collection-title-input");
      var descriptionInput = this.editorInputForm.querySelector("#collection-description-input");
      this.handleEditorPrimaryButtonEnabled(
        idInput ? idInput.value : "",
        titleInput ? titleInput.value : "",
        descriptionInput ? descriptionInput.value : ""
      );
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
    },

    showModal: function () {
      const selectedCollections = this.getCollectionsToBeDeleted();
      const dm = this.i18n.collections.deleteModal;
      ConfirmModal.confirm({
        title: dm.title,
        message: lang.replace(dm.message, {
          count: selectedCollections.length,
          titles: selectedCollections.map((c) => c.title).join(", "),
        }),
        confirmLabel: dm.confirm,
      }).then((ok) => {
        if (ok) {
          this.handleDeleteCollections();
        } else {
          this.hideModal();
        }
      });
    },

    hideAlert: function () {
      if (this._alertTimer) {
        clearTimeout(this._alertTimer);
        this._alertTimer = null;
      }
      StatusModal.hide();
    },

    showAlert: function (
      title = "",
      message = "",
      color = "green",
      delay = 1500
    ) {
      if (this._alertTimer) clearTimeout(this._alertTimer);
      this._alertTimer = setTimeout(() => {
        this._alertTimer = null;
        StatusModal.show({
          title: title,
          message: message,
          type: color === "red" ? "error" : "success",
          color: color,
        });
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
      const ed = this.i18n.collections.editor;
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
      labelKey.innerHTML = ed.assetKey + ' <span class="required">*</span>:';
      assetNode.appendChild(labelKey);

      // <input id="asset-key-input-${id}" ... disabled />
      const inputKey = document.createElement("input");
      inputKey.id = `asset-key-input-${id}`;
      inputKey.className = "editor-input";
      inputKey.type = "text";
      inputKey.placeholder = ed.valuePlaceholder;
      inputKey.value = key;
      inputKey.disabled = true;
      assetNode.appendChild(inputKey);

      // <label class="editor-label">title <span class="required">*</span>:</label>
      const labelTitle = document.createElement("label");
      labelTitle.className = "editor-label";
      labelTitle.innerHTML = ed.titleLabel + ' <span class="required">*</span>:';
      assetNode.appendChild(labelTitle);

      // <input id="asset-title-input-${id}" ... />
      const inputTitle = document.createElement("input");
      inputTitle.id = `asset-title-input-${id}`;
      inputTitle.className = "editor-input";
      inputTitle.type = "text";
      inputTitle.placeholder = ed.valuePlaceholder;
      inputTitle.value = title;
      assetNode.appendChild(inputTitle);

      // <label class="editor-label">href:</label>
      const labelHref = document.createElement("label");
      labelHref.className = "editor-label";
      labelHref.innerText = ed.href + ":";
      assetNode.appendChild(labelHref);

      // <input id="asset-href-input-${id}" ... />
      const inputHref = document.createElement("input");
      inputHref.id = `asset-href-input-${id}`;
      inputHref.className = "editor-input";
      inputHref.type = "text";
      inputHref.placeholder = ed.valuePlaceholder;
      inputHref.value = href;
      assetNode.appendChild(inputHref);

      // <label class="editor-label">esri:wkt:</label>
      const labelWkt = document.createElement("label");
      labelWkt.className = "editor-label";
      labelWkt.innerText = ed.wkt + ":";
      assetNode.appendChild(labelWkt);

      // <input id="asset-wkt-input-${id}" ... />
      const inputWkt = document.createElement("input");
      inputWkt.id = `asset-wkt-input-${id}`;
      inputWkt.className = "editor-input";
      inputWkt.type = "text";
      inputWkt.placeholder = ed.valuePlaceholder;
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
      removeAssetButton.innerText = ed.removeAsset;
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
      addAssetButton.innerHTML = this.i18n.collections.editor.addAsset;
      addAssetButton.classList.add("disabled-button");
      addAssetButton.disabled = true;

      const initialAssetKeyInput = document.createElement("input");
      initialAssetKeyInput.type = "text";
      initialAssetKeyInput.placeholder = this.i18n.collections.editor.assetKeyPlaceholder;
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

    createContactEmailNode: function (contact, email) {
      const ed = this.i18n.collections.editor;
      const id = Date.now() + Math.random().toString(36).slice(2);
      const emailNode = document.createElement("div");
      emailNode.classList.add("contact-email-container");

      const inputValue = document.createElement("input");
      inputValue.id = `contact-email-value-input-${id}`;
      inputValue.className = "editor-input";
      inputValue.type = "text";
      inputValue.placeholder = ed.emailPlaceholder;
      inputValue.value = email.value || "";
      inputValue.oninput = (e) =>
        this.handleContactEmailFieldInput(email, "value", e.target.value);
      emailNode.appendChild(inputValue);

      const inputRoles = document.createElement("input");
      inputRoles.id = `contact-email-roles-input-${id}`;
      inputRoles.className = "editor-input";
      inputRoles.type = "text";
      inputRoles.placeholder = ed.rolesPlaceholder;
      inputRoles.value = Array.isArray(email.roles) ? email.roles.join(", ") : "";
      inputRoles.oninput = (e) =>
        this.handleContactEmailFieldInput(email, "roles", e.target.value);
      emailNode.appendChild(inputRoles);

      const removeEmailButton = document.createElement("button");
      removeEmailButton.classList.add("remove-email-button");
      removeEmailButton.innerText = ed.removeEmail;
      removeEmailButton.onclick = () => {
        this.deleteContactEmail(contact, email);
        emailNode.remove();
      };
      emailNode.appendChild(removeEmailButton);

      return emailNode;
    },

    createContactNode: function (contact) {
      const ed = this.i18n.collections.editor;
      const id = Date.now() + Math.random().toString(36).slice(2);
      const contactNode = document.createElement("div");
      contactNode.classList.add("contact-container");
      contactNode.id = `contact-${id}`;

      const hr = document.createElement("hr");
      contactNode.appendChild(hr);

      // name
      const labelName = document.createElement("label");
      labelName.className = "editor-label";
      labelName.innerHTML = ed.contactName + ' <span class="required">*</span>:';
      contactNode.appendChild(labelName);

      const inputName = document.createElement("input");
      inputName.id = `contact-name-input-${id}`;
      inputName.className = "editor-input";
      inputName.type = "text";
      inputName.placeholder = ed.valuePlaceholder;
      inputName.value = contact.name || "";
      inputName.oninput = (e) =>
        this.handleContactFieldInput(contact, "name", e.target.value);
      contactNode.appendChild(inputName);

      // position
      const labelPosition = document.createElement("label");
      labelPosition.className = "editor-label";
      labelPosition.innerText = ed.contactPosition + ":";
      contactNode.appendChild(labelPosition);

      const inputPosition = document.createElement("input");
      inputPosition.id = `contact-position-input-${id}`;
      inputPosition.className = "editor-input";
      inputPosition.type = "text";
      inputPosition.placeholder = ed.valuePlaceholder;
      inputPosition.value = contact.position || "";
      inputPosition.oninput = (e) =>
        this.handleContactFieldInput(contact, "position", e.target.value);
      contactNode.appendChild(inputPosition);

      // organization
      const labelOrganization = document.createElement("label");
      labelOrganization.className = "editor-label";
      labelOrganization.innerText = ed.contactOrganization + ":";
      contactNode.appendChild(labelOrganization);

      const inputOrganization = document.createElement("input");
      inputOrganization.id = `contact-organization-input-${id}`;
      inputOrganization.className = "editor-input";
      inputOrganization.type = "text";
      inputOrganization.placeholder = ed.valuePlaceholder;
      inputOrganization.value = contact.organization || "";
      inputOrganization.oninput = (e) =>
        this.handleContactFieldInput(contact, "organization", e.target.value);
      contactNode.appendChild(inputOrganization);

      // description
      const labelDescription = document.createElement("label");
      labelDescription.className = "editor-label";
      labelDescription.innerText = ed.contactDescription + ":";
      contactNode.appendChild(labelDescription);

      const textareaDescription = document.createElement("textarea");
      textareaDescription.id = `contact-description-input-${id}`;
      textareaDescription.className = "editor-input";
      textareaDescription.style.height = "70px";
      textareaDescription.rows = 3;
      textareaDescription.placeholder = ed.valuePlaceholder;
      textareaDescription.value = contact.description || "";
      textareaDescription.oninput = (e) =>
        this.handleContactFieldInput(contact, "description", e.target.value);
      contactNode.appendChild(textareaDescription);

      // emails
      const labelEmails = document.createElement("label");
      labelEmails.className = "editor-label";
      labelEmails.innerText = ed.contactEmails + ":";
      contactNode.appendChild(labelEmails);

      const emailsContainer = document.createElement("div");
      emailsContainer.classList.add("contact-emails-container");
      contactNode.appendChild(emailsContainer);

      if (Array.isArray(contact.emails)) {
        contact.emails.forEach((email) => {
          emailsContainer.appendChild(this.createContactEmailNode(contact, email));
        });
      }

      const addEmailButton = document.createElement("button");
      addEmailButton.classList.add("add-email-button");
      addEmailButton.innerText = ed.addEmail;
      addEmailButton.onclick = () => {
        const email = this.addNewContactEmail(contact);
        emailsContainer.appendChild(this.createContactEmailNode(contact, email));
      };
      contactNode.appendChild(addEmailButton);

      // remove contact
      const removeContactButton = document.createElement("button");
      removeContactButton.classList.add("remove-contact-button");
      removeContactButton.innerText = ed.removeContact;
      removeContactButton.onclick = () => {
        this.deleteCollectionContact(contact);
        contactNode.remove();
        this.revalidateEditorPrimaryButton();
      };
      contactNode.appendChild(removeContactButton);

      return contactNode;
    },

    createContactsEditorNode: function () {
      const contactsEditorNode = document.createElement("div");
      contactsEditorNode.id = "contact-editor-container";

      const labelContacts = document.createElement("label");
      labelContacts.className = "editor-label";
      labelContacts.innerText = this.i18n.collections.editor.contacts + ":";
      contactsEditorNode.appendChild(labelContacts);

      const addContactContainer = document.createElement("div");
      addContactContainer.classList.add("add-contact-container");

      const addContactButton = document.createElement("button");
      addContactButton.classList.add("add-asset-button");
      addContactButton.innerHTML = this.i18n.collections.editor.addContact;

      addContactButton.onclick = () => {
        const contact = { ...this.DEFAULT_CONTACT, emails: [] };
        this.addNewCollectionContact(contact);
        const contactNode = this.createContactNode(contact);
        contactsEditorNode.appendChild(contactNode);
        this.revalidateEditorPrimaryButton();
      };

      addContactContainer.appendChild(addContactButton);
      contactsEditorNode.appendChild(addContactContainer);
      return contactsEditorNode;
    },

    renderUpdateContactsEditor: function (contacts) {
      const contactsEditorNode = this.createContactsEditorNode();
      this.editorInputForm.appendChild(contactsEditorNode);

      (contacts || []).forEach((contact) => {
        const contactNode = this.createContactNode(contact);
        contactsEditorNode.appendChild(contactNode);
      });
    },

    // -----------------------------------------------------------------
    // Providers UI
    // -----------------------------------------------------------------
    createProviderNode: function (provider) {
      const ed = this.i18n.collections.editor;
      const id = Date.now() + Math.random().toString(36).slice(2);
      const providerNode = document.createElement("div");
      providerNode.classList.add("contact-container");
      providerNode.id = `provider-${id}`;

      const hr = document.createElement("hr");
      providerNode.appendChild(hr);

      // name
      const labelName = document.createElement("label");
      labelName.className = "editor-label";
      labelName.innerHTML = ed.providerName + ' <span class="required">*</span>:';
      providerNode.appendChild(labelName);

      const inputName = document.createElement("input");
      inputName.id = `provider-name-input-${id}`;
      inputName.className = "editor-input";
      inputName.type = "text";
      inputName.placeholder = ed.valuePlaceholder;
      inputName.value = provider.name || "";
      inputName.oninput = (e) =>
        this.handleProviderFieldInput(provider, "name", e.target.value);
      providerNode.appendChild(inputName);

      // description
      const labelDescription = document.createElement("label");
      labelDescription.className = "editor-label";
      labelDescription.innerText = ed.providerDescription + ":";
      providerNode.appendChild(labelDescription);

      const textareaDescription = document.createElement("textarea");
      textareaDescription.id = `provider-description-input-${id}`;
      textareaDescription.className = "editor-input";
      textareaDescription.style.height = "70px";
      textareaDescription.rows = 3;
      textareaDescription.placeholder = ed.valuePlaceholder;
      textareaDescription.value = provider.description || "";
      textareaDescription.oninput = (e) =>
        this.handleProviderFieldInput(provider, "description", e.target.value);
      providerNode.appendChild(textareaDescription);

      // roles
      const labelRoles = document.createElement("label");
      labelRoles.className = "editor-label";
      labelRoles.innerText = ed.providerRoles + ":";
      providerNode.appendChild(labelRoles);

      const inputRoles = document.createElement("input");
      inputRoles.id = `provider-roles-input-${id}`;
      inputRoles.className = "editor-input";
      inputRoles.type = "text";
      inputRoles.placeholder = ed.providerRolesPlaceholder;
      inputRoles.value = Array.isArray(provider.roles) ? provider.roles.join(", ") : "";
      inputRoles.oninput = (e) =>
        this.handleProviderFieldInput(provider, "roles", e.target.value);
      providerNode.appendChild(inputRoles);

      // url
      const labelUrl = document.createElement("label");
      labelUrl.className = "editor-label";
      labelUrl.innerText = ed.providerUrl + ":";
      providerNode.appendChild(labelUrl);

      const inputUrl = document.createElement("input");
      inputUrl.id = `provider-url-input-${id}`;
      inputUrl.className = "editor-input";
      inputUrl.type = "text";
      inputUrl.placeholder = ed.valuePlaceholder;
      inputUrl.value = provider.url || "";
      inputUrl.oninput = (e) =>
        this.handleProviderFieldInput(provider, "url", e.target.value);
      providerNode.appendChild(inputUrl);

      // remove provider
      const removeProviderButton = document.createElement("button");
      removeProviderButton.classList.add("remove-contact-button");
      removeProviderButton.innerText = ed.removeProvider;
      removeProviderButton.onclick = () => {
        this.deleteCollectionProvider(provider);
        providerNode.remove();
        this.revalidateEditorPrimaryButton();
      };
      providerNode.appendChild(removeProviderButton);

      return providerNode;
    },

    createProvidersEditorNode: function () {
      const providersEditorNode = document.createElement("div");
      providersEditorNode.id = "provider-editor-container";

      const labelProviders = document.createElement("label");
      labelProviders.className = "editor-label";
      labelProviders.innerText = this.i18n.collections.editor.providers + ":";
      providersEditorNode.appendChild(labelProviders);

      const addProviderContainer = document.createElement("div");
      addProviderContainer.classList.add("add-contact-container");

      const addProviderButton = document.createElement("button");
      addProviderButton.classList.add("add-asset-button");
      addProviderButton.innerHTML = this.i18n.collections.editor.addProvider;

      addProviderButton.onclick = () => {
        const provider = { ...this.DEFAULT_PROVIDER, roles: [] };
        this.addNewCollectionProvider(provider);
        const providerNode = this.createProviderNode(provider);
        providersEditorNode.appendChild(providerNode);
        this.revalidateEditorPrimaryButton();
      };

      addProviderContainer.appendChild(addProviderButton);
      providersEditorNode.appendChild(addProviderContainer);
      return providersEditorNode;
    },

    renderUpdateProvidersEditor: function (providers) {
      const providersEditorNode = this.createProvidersEditorNode();
      this.editorInputForm.appendChild(providersEditorNode);

      (providers || []).forEach((provider) => {
        const providerNode = this.createProviderNode(provider);
        providersEditorNode.appendChild(providerNode);
      });
    },

    // -----------------------------------------------------------------
    // Additional properties UI (key/value rows, mirrors ItemEditorPanel)
    // -----------------------------------------------------------------
    createPropertyNode: function (property) {
      const ed = this.i18n.collections.editor;
      const id = Date.now() + Math.random().toString(36).slice(2);
      const row = document.createElement("div");
      row.classList.add("property-row");
      row.id = `property-${id}`;

      const inputKey = document.createElement("input");
      inputKey.className = "editor-input";
      inputKey.type = "text";
      inputKey.placeholder = ed.propertyKeyPlaceholder;
      inputKey.value = property.key || "";
      inputKey.oninput = (e) =>
        this.handlePropertyFieldInput(property, "key", e.target.value);
      row.appendChild(inputKey);

      const inputValue = document.createElement("input");
      inputValue.className = "editor-input";
      inputValue.type = "text";
      inputValue.placeholder = ed.propertyValuePlaceholder;
      inputValue.value = property.value || "";
      inputValue.oninput = (e) =>
        this.handlePropertyFieldInput(property, "value", e.target.value);
      row.appendChild(inputValue);

      const removeButton = document.createElement("button");
      removeButton.classList.add("remove-property-button");
      removeButton.innerText = ed.removeProperty;
      removeButton.onclick = () => {
        this.deleteCollectionProperty(property);
        row.remove();
      };
      row.appendChild(removeButton);

      return row;
    },

    createPropertiesEditorNode: function () {
      const propertiesEditorNode = document.createElement("div");
      propertiesEditorNode.id = "property-editor-container";

      const labelProperties = document.createElement("label");
      labelProperties.className = "editor-label";
      labelProperties.innerText = this.i18n.collections.editor.properties + ":";
      propertiesEditorNode.appendChild(labelProperties);

      const rowsContainer = document.createElement("div");
      rowsContainer.id = "property-rows-container";
      propertiesEditorNode.appendChild(rowsContainer);

      const addPropertyContainer = document.createElement("div");
      addPropertyContainer.classList.add("add-contact-container");

      const addPropertyButton = document.createElement("button");
      addPropertyButton.classList.add("add-asset-button");
      addPropertyButton.innerHTML = this.i18n.collections.editor.addProperty;

      addPropertyButton.onclick = () => {
        const property = { key: "", value: "" };
        this.addNewCollectionProperty(property);
        const propertyNode = this.createPropertyNode(property);
        rowsContainer.appendChild(propertyNode);
      };

      addPropertyContainer.appendChild(addPropertyButton);
      propertiesEditorNode.appendChild(addPropertyContainer);
      return propertiesEditorNode;
    },

    renderUpdatePropertiesEditor: function (properties) {
      const propertiesEditorNode = this.createPropertiesEditorNode();
      this.editorInputForm.appendChild(propertiesEditorNode);

      const rowsContainer = propertiesEditorNode.querySelector("#property-rows-container");
      (properties || []).forEach((property) => {
        const propertyNode = this.createPropertyNode(property);
        rowsContainer.appendChild(propertyNode);
      });
    },

    renderUpdateCollectionEditor: function (properties) {
      const ed = this.i18n.collections.editor;
      this.collectionEditorTitle.innerHTML = this.i18n.collections.updateTitle;
      this.editorPrimaryButton.innerHTML = this.i18n.collections.updateButton;
      this.editorInputForm.innerHTML = "";

      // <label class="editor-label">id:</label>
      const labelId = document.createElement("label");
      labelId.className = "editor-label";
      labelId.innerText = ed.idLabel + ":";
      this.editorInputForm.appendChild(labelId);

      // <input id="collection-id-input" ... disabled />
      const inputId = document.createElement("input");
      inputId.id = "collection-id-input";
      inputId.className = "editor-input";
      inputId.type = "text";
      inputId.placeholder = ed.valuePlaceholder;
      inputId.value = properties.id;
      inputId.disabled = true;
      this.editorInputForm.appendChild(inputId);

      // <label class="editor-label">title <span class="required">*</span>:</label>
      const labelTitle = document.createElement("label");
      labelTitle.className = "editor-label";
      labelTitle.innerHTML = ed.titleLabel + ' <span class="required">*</span>:';
      this.editorInputForm.appendChild(labelTitle);

      // <input id="collection-title-input" ... />
      const inputTitle = document.createElement("input");
      inputTitle.id = "collection-title-input";
      inputTitle.className = "editor-input";
      inputTitle.type = "text";
      inputTitle.placeholder = ed.valuePlaceholder;
      inputTitle.value = properties.title;
      this.editorInputForm.appendChild(inputTitle);

      // <label class="editor-label">description <span class="required">*</span>:</label>
      const labelDescription = document.createElement("label");
      labelDescription.className = "editor-label";
      labelDescription.innerHTML =
        ed.descriptionLabel + ' <span class="required">*</span>:';
      this.editorInputForm.appendChild(labelDescription);

      // <textarea id="collection-description-input" ...>
      const textareaDescription = document.createElement("textarea");
      textareaDescription.id = "collection-description-input";
      textareaDescription.className = "editor-input";
      textareaDescription.style.height = "100px";
      textareaDescription.rows = 5;
      textareaDescription.placeholder = ed.valuePlaceholder;
      textareaDescription.textContent = properties.description;
      this.editorInputForm.appendChild(textareaDescription);
	  
	  this.renderUpdatePropertiesEditor(this.collectionProperties);
	  this.renderUpdateAssetEditor(this.collectionAssets);
	  this.renderUpdateContactsEditor(this.collectionContacts);
	  this.renderUpdateProvidersEditor(this.collectionProviders);

      // <label class="editor-label">stac_version:</label>
      const labelStacVersion = document.createElement("label");
      labelStacVersion.className = "editor-label";
      labelStacVersion.innerText = ed.stacVersionLabel + ":";
      this.editorInputForm.appendChild(labelStacVersion);

      // <input id="collection-stacversion-input" ... disabled />
      const inputStacVersion = document.createElement("input");
      inputStacVersion.id = "collection-stacversion-input";
      inputStacVersion.className = "editor-input";
      inputStacVersion.type = "text";
      inputStacVersion.value = properties.stac_version || "1.0.0";
      inputStacVersion.disabled = true;
      this.editorInputForm.appendChild(inputStacVersion);

      // <label class="editor-label">license:</label>
      const labelLicense = document.createElement("label");
      labelLicense.className = "editor-label";
      labelLicense.innerText = ed.licenseLabel + ":";
      this.editorInputForm.appendChild(labelLicense);

      // <input id="collection-license-input" ... />
      const inputLicense = document.createElement("input");
      inputLicense.id = "collection-license-input";
      inputLicense.className = "editor-input";
      inputLicense.type = "text";
      inputLicense.placeholder = ed.licensePlaceholder;
      inputLicense.value = properties.license || "";
      this.editorInputForm.appendChild(inputLicense);

      // <label class="editor-label">keywords:</label>
      const labelKeywords = document.createElement("label");
      labelKeywords.className = "editor-label";
      labelKeywords.innerText = ed.keywordsLabel + ":";
      this.editorInputForm.appendChild(labelKeywords);

      // <input id="collection-keywords-input" ... />
      const inputKeywords = document.createElement("input");
      inputKeywords.id = "collection-keywords-input";
      inputKeywords.className = "editor-input";
      inputKeywords.type = "text";
      inputKeywords.placeholder = ed.keywordsPlaceholder;
      inputKeywords.value = properties.keywords || "";
      this.editorInputForm.appendChild(inputKeywords);

      // <label class="editor-label">summaries:</label>
      const labelSummaries = document.createElement("label");
      labelSummaries.className = "editor-label";
      labelSummaries.innerText = ed.summariesLabel + ":";
      this.editorInputForm.appendChild(labelSummaries);

      // <textarea id="collection-summaries-input" ...>
      const textareaSummaries = document.createElement("textarea");
      textareaSummaries.id = "collection-summaries-input";
      textareaSummaries.className = "editor-input";
      textareaSummaries.style.height = "80px";
      textareaSummaries.rows = 4;
      textareaSummaries.placeholder = ed.summariesPlaceholder;
      textareaSummaries.textContent = properties.summaries || "";
      this.editorInputForm.appendChild(textareaSummaries);     
      this.initializeCollectionFormListeners();
    },

    renderCreateCollectionEditor: function () {
      const ed = this.i18n.collections.editor;
      const req = ' <span class="required">*</span>:';
      this.collectionEditorTitle.innerHTML = this.i18n.collections.createNewTitle;
      this.editorPrimaryButton.innerHTML = this.i18n.collections.createButton;
      let collectionInputs = `
      <label class="editor-label">${ed.idLabel}${req}</label>
      <input id="collection-id-input" class="editor-input" type="text" placeholder="${ed.valuePlaceholder}"/>

      <label class="editor-label">${ed.titleLabel}${req}</label>
      <input id="collection-title-input" class="editor-input" type="text" placeholder="${ed.valuePlaceholder}"/>

      <label class="editor-label">${ed.descriptionLabel}${req}</label>
      <textArea id="collection-description-input" style="height: 100px" class="editor-input" rows="5" placeholder="${ed.valuePlaceholder}"></textArea>

      <label class="editor-label" id="collection-stacversion-label" style="display:none">${ed.stacVersionLabel}:</label>
      <input id="collection-stacversion-input" class="editor-input" type="text" value="1.0.0" disabled style="display:none"/>

      <label class="editor-label" style="display:flex; align-items:center; gap:6px;">
        <input id="collection-stac-checkbox" type="checkbox"/> ${ed.stacCollectionLabel}
      </label>

      <label class="editor-label">${ed.licenseLabel}:</label>
      <input id="collection-license-input" class="editor-input" type="text" placeholder="${ed.licensePlaceholder}" value="Apache-2.0"/>

      <label class="editor-label">${ed.keywordsLabel}:</label>
      <input id="collection-keywords-input" class="editor-input" type="text" placeholder="${ed.keywordsPlaceholder}"/>

      <label class="editor-label">${ed.summariesLabel}:</label>
      <textArea id="collection-summaries-input" style="height: 80px" class="editor-input" rows="4" placeholder="${ed.summariesPlaceholder}"></textArea>
  `;
      this.editorInputForm.innerHTML = collectionInputs;
      const assetEditorNode = this.createAssetEditorNode();
      this.editorInputForm.appendChild(assetEditorNode);
      const contactsEditorNode = this.createContactsEditorNode();
      this.editorInputForm.appendChild(contactsEditorNode);
      const providersEditorNode = this.createProvidersEditorNode();
      this.editorInputForm.appendChild(providersEditorNode);
      const propertiesEditorNode = this.createPropertiesEditorNode();
      this.editorInputForm.appendChild(propertiesEditorNode);
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
	  this.clearMapView();	  
      this.selectedGraphic = null;
      this.clearCollectionAssets();
      this.clearCollectionContacts();
      this.clearCollectionProviders();
      this.clearCollectionProperties();
      // Make sketch layer visible so user can see their drawing
      if (this.sketchGraphicsLayer) {
        this.sketchGraphicsLayer.visible = true;
      }
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
      this.setCollectionContacts(collection.contacts ? collection.contacts : []);
      this.setCollectionProviders(collection.providers ? collection.providers : []);
      const rawProperties = collection.properties || {};
      this.setCollectionProperties(
        Object.keys(rawProperties).map((key) => {
          const text = this._stringifyPropertyValue(rawProperties[key]);
          // keep the typed original so unchanged rows are saved untouched
          return { key: key, value: text, hasOriginal: true, original: rawProperties[key], originalText: text };
        })
      );
      const properties = {
        id: this.selectedCollection.properties.id,
        title: collection.title,
        description: collection.description,
        stac_version: collection.stac_version,
        license: collection.license || "",
        keywords: Array.isArray(collection.keywords) ? collection.keywords.join(", ") : "",
        summaries: collection.summaries ? JSON.stringify(collection.summaries, null, 2) : "",
      };
      this.renderUpdateCollectionEditor(properties);

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
      this.clearCollectionContacts();
      this.clearCollectionProviders();
      this.clearCollectionProperties();
    },

    handleCancelCreateCollection: function () {
      this.sketchGraphicsLayer.removeAll();
      this.clearCollectionAssets();
      this.clearCollectionContacts();
      this.clearCollectionProviders();
      this.clearCollectionProperties();
    },

    updateCollectionInfoBox: function (properties) {
      // Values such as "contacts" (user-editable name/description/organization/
      // emails) or "description" may contain HTML-significant characters.
      // Escape both the key and value before interpolating them into the
      // table's innerHTML to prevent HTML/script injection (XSS).
      let tableRows = Object.entries(properties).map(([key, value]) => {
        return `    
                <tr>
                  <td class="info-table-key">${this.escapeHtml(key)}</td>
                  <td class="info-table-value">${this.escapeHtml(value)}</td>
                </tr>`;
      });
      this.infoTableTitle.innerHTML = this.escapeHtml(properties.title);
      this.infoTableBody.innerHTML = tableRows.join("");
      this.handleZoomCollectionEnabled();
	  
	  this.handleViewItemsEnabled();
      this.handleExportCollectionEnabled();
    },

    emptyCollectionInfoBox: function () {
      let tableRows = [];
      this.infoTableTitle.innerHTML = this.i18n.collections.infoTitle;
      this.infoTableBody.innerHTML = tableRows.join("");
      this.selectedCollectionIsStac = false;
      this.handleZoomCollectionEnabled();
      this.handleViewItemsEnabled();
      this.handleExportCollectionEnabled();
    },

    getUpdateFieldValues: function () {
      return {
        id: document.getElementById("collection-id-input").value,
        description: document.getElementById("collection-description-input")
          .value,
        title: document.getElementById("collection-title-input").value,
        assets: this.collectionAssets,
        contacts: this.collectionContacts,
        license: document.getElementById("collection-license-input").value,
        keywordsText: document.getElementById("collection-keywords-input").value,
        summariesText: document.getElementById("collection-summaries-input").value,
        providers: this.collectionProviders,
        properties: this._buildPropertiesObject(),
      };
    },

    getCreateFieldValues: function () {
      return {
        id: document.getElementById("collection-id-input").value,
        description: document.getElementById("collection-description-input")
          .value,
        title: document.getElementById("collection-title-input").value,
        assets: this.collectionAssets,
        contacts: this.collectionContacts,
        license: document.getElementById("collection-license-input").value,
        keywordsText: document.getElementById("collection-keywords-input").value,
        summariesText: document.getElementById("collection-summaries-input").value,
        providers: this.collectionProviders,
        properties: this._buildPropertiesObject(),
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
        this.handleZoomTo(this.selectedCollection.graphic,this.selectedCollection.properties.id);
      });
	  this.viewItemsButton.style.display = "none"; // shown only for STAC collections
	  this.viewItemsButton.addEventListener("click", () => {			
	      this.handleViewItems(this.selectedCollection.properties.id);
	   });
      this.exportCollectionButton.addEventListener("click", () => {
        this.handleExportCollection();
      });
      this.importCollectionButton.addEventListener("click", () => {
        this.handleImportCollectionClick();
      });
      this.importFileInput.addEventListener("change", (e) => {
        this.handleImportFileSelected(e);
      });

      // Editor Events
      this.editorPrimaryButton.addEventListener("click", () => {
        // Defense-in-depth: re-validate contacts on submit in case the
        // primary button's disabled state is stale (e.g. programmatic
        // changes to collectionContacts that did not go through the UI
        // handlers that call revalidateEditorPrimaryButton()).
        if (!this.isCollectionContactsObjValid(this.collectionContacts)) {
          this.showAlert(
            this.i18n.collections.alerts.invalidContactTitle,
            this.i18n.collections.alerts.invalidContactMessage,
            "red"
          );
          return;
        }
        if (!this.isCollectionProvidersObjValid(this.collectionProviders)) {
          this.showAlert(
            this.i18n.collections.alerts.invalidProviderTitle,
            this.i18n.collections.alerts.invalidProviderMessage,
            "red"
          );
          return;
        }
        const summariesInput = this.editorInputForm.querySelector("#collection-summaries-input");
        if (summariesInput && !this._parseSummaries(summariesInput.value).ok) {
          this.showAlert(
            this.i18n.collections.alerts.invalidSummariesTitle,
            this.i18n.collections.alerts.invalidSummariesMessage,
            "red"
          );
          return;
        }
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

    /**
     * Escapes HTML-significant characters so untrusted/user-editable values
     * (e.g. collection contacts: name, description, organization, emails)
     * can be safely interpolated into innerHTML without allowing markup or
     * script injection (XSS).
     * @param {*} value the value to escape; non-strings are stringified first
     * @returns {string} the HTML-escaped string ("" for null/undefined)
     */
    escapeHtml: function (value) {
      if (value === null || value === undefined) return "";
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
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

    // Opens a STAC item directly in the item editor (used by the search
    // results "Edit in STAC Editor" link). params: {collectionId, itemId}
    editStacItem: function (params) {
      var self = this;
      if (!params || !params.collectionId || !params.itemId) return;
      var tries = 0;
      var wait = function () {
        if (!self.view || !self.itemListPanel) {
          if (++tries < 100) setTimeout(wait, 200);
          return;
        }
        var url = self.getStacBaseUrl() + "/collections/" + encodeURIComponent(params.collectionId) +
          "/items/" + encodeURIComponent(params.itemId);
        if (AppContext.appConfig.system.secureCatalogApp) {
          url = (new AppClient()).appendAccessToken(url);
        }
        self.updateIsLoading(true);
        fetch(url).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        }).then(function (feature) {
          self.selectedCollectionId = params.collectionId;
          return Promise.resolve(self.itemListPanel.open({
            collectionId: params.collectionId,
            collectionTitle: params.collectionId,
            view: self.view
          })).then(function () {
            self.itemListPanel.setView(self.view);
            self._returnToCatalog = true;
            if (!self._returnHooked) {
              self._returnHooked = true;
              var editor = self.itemListPanel.itemEditorPanel;
              // hide() runs before StacItemsChanged is published, so clear
              // the flag asynchronously (cancel/close => stay here)
              editor.onHide = function () {
                setTimeout(function () { self._returnToCatalog = false; }, 0);
              };
              topic.subscribe(appTopics.StacItemsChanged, function () {
                if (self._returnToCatalog) {
                  self._returnToCatalog = false;
                  $("a[href='#searchPanel']").tab("show");
                }
              });
            }
            self.itemListPanel.itemEditorPanel.showEdit(params.collectionId, feature);
          });
        }).catch(function (e) {
          console.error("editStacItem failed", e);
        }).then(function () {
          self.updateIsLoading(false);
        });
      };
      wait();
    },

    //Opening map panel
    ensureMap: function () {      
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
	  this.mapProps = mapProps;
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
            expandTooltip: this.i18n.collections.alerts.searchWidgetTooltip,
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
            expandTooltip: this.i18n.collections.alerts.layersTooltip,
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
            expandTooltip: this.i18n.collections.alerts.basemapTooltip,
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

      /*if (!this.mapWasInitialized) {
        this.mapWasInitialized = true;
        if (this.urlParams) {
          this.addLayer(this.urlParams, view);
        }
      }*/

      this.handleMapReady(view);
      this.view = view;
    },
  });

  return oThisClass;
});
