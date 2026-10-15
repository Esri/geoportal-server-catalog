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
/**
 * ItemEditorPanel - fully self-contained modal dialog widget used to
 * create, update, and delete individual STAC items (features) within a
 * collection.
 *
 * This module owns:
 *  - all item form/dialog markup+styles (templates/ItemEditorPanel.html)
 *  - its own geometry drawing (GraphicsLayer + SketchViewModel) against the
 *    shared map view passed in via setView()
 *  - all REST calls needed to create/update/delete a STAC item
 *
 * Usage (as a nested dojo widget, declared via data-dojo-type in a parent
 * template, e.g. ItemListPanel.html):
 *   <div data-dojo-type="app/main/ItemEditorPanel" data-dojo-attach-point="itemEditorPanel"></div>
 *
 * Then from the parent widget:
 *   this.itemEditorPanel.setView(view);
 *   this.itemEditorPanel.showCreate(collectionId);
 *   this.itemEditorPanel.showEdit(collectionId, stacFeature);
 */
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "app/common/Templated",
  "dojo/text!./templates/ItemEditorPanel.html",
  "dojo/topic",
  "app/context/app-topics",
  "app/context/AppClient",
  "esri4/layers/GraphicsLayer",
  "esri4/widgets/Sketch/SketchViewModel",
  "esri4/geometry/support/webMercatorUtils",
  "esri4/Graphic",
  "app/main/ConfirmModal"
], function (
  declare,
  lang,
  Templated,
  template,
  topic,
  appTopics,
  AppClient,
  GraphicsLayer,
  SketchViewModel,
  webMercatorUtils,
  EsriGraphic,
  ConfirmModal
) {
  // fields that are managed by dedicated inputs / are system fields and
  // should never show up in the generic "Additional Properties" editor
  var RESERVED_PROPERTY_KEYS = ["datetime"];
  var RESERVED_FEATURE_KEYS = ["id", "collection", "stac_version", "_assets"];

  var POINT_SYM = {
    type: "simple-marker",
    style: "circle",
    color: [255, 165, 0, 0.9],
    size: 10,
    outline: { color: "white", width: 1 }
  };

  var POLYGON_SYM = {
    type: "simple-fill",
    color: [255, 165, 0, 0.4],
    outline: { color: [255, 140, 0, 1], width: 2 }
  };

  var oThisClass = declare([Templated], {
    templateString: template,

    view: null,
    mode: "create", // "create" | "edit"
    collectionId: null,
    editingItem: null, // raw STAC feature being edited (if mode === "edit")
    assets: {}, // key -> {title, href}
    properties: [], // [{key, value}]
    sketchLayer: null,
    sketchVM: null,
    activeGeometry: null, // esri Geometry (map SR) currently drawn

    postCreate: function () {
      this.inherited(arguments);
      this.idInput.oninput = lang.hitch(this, this._clearStatus);
      this.datetimeInput.oninput = lang.hitch(this, this._clearStatus);
    },

    // -----------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------
    setView: function (view) {
      this.view = view;
      if (!this.sketchLayer) {
        this.sketchLayer = new GraphicsLayer({ title: "item-editor-sketch" });
        view.map.layers.add(this.sketchLayer);
        this.sketchVM = new SketchViewModel({
          view: view,
          layer: this.sketchLayer
        });
        this.sketchVM.on("create", lang.hitch(this, function (e) {
          if (e.state === "complete") {
            this._clearActiveTools();
            this.sketchLayer.graphics.forEach(lang.hitch(this, function (g) {
              if (g !== e.graphic) this.sketchLayer.remove(g);
            }));
            this.activeGeometry = e.graphic.geometry;
          }
        }));
        this.sketchVM.on("update", lang.hitch(this, function (e) {
          if (e.state === "complete" && e.graphics && e.graphics[0]) {
            this.activeGeometry = e.graphics[0].geometry;
          }
        }));
      }
    },

    showCreate: function (collectionId) {
      if (!collectionId) return;
      this.mode = "create";
      this.collectionId = collectionId;
      this.editingItem = null;
      this.titleNode.innerText = this.i18n.collectionItems.editor.addTitle;
      this.saveButton.innerText = this.i18n.collectionItems.editor.save;
      this.deleteButton.classList.add("hidden");
      this.idInput.disabled = false;
      this.idInput.value = "";
      this.datetimeInput.value = new Date().toISOString();
      this.assets = {};
      this.properties = [];
      this._clearGeometry();
      this._renderAssets();
      this._renderProperties();
      this._clearStatus();
      this._show();
    },

    showEdit: function (collectionId, feature) {
      if (!collectionId || !feature) return;
      this.mode = "edit";
      this.collectionId = collectionId;
      this.editingItem = feature;
      this.titleNode.innerText = this.i18n.collectionItems.editor.editTitle;
      this.saveButton.innerText = this.i18n.collectionItems.editor.save;
      this.deleteButton.classList.remove("hidden");
      this.idInput.disabled = true;
      this.idInput.value = feature.id || "";
      var props = feature.properties || {};
      this.datetimeInput.value = props.datetime || "";

      // assets
      this.assets = {};
      var rawAssets = feature.assets || {};
      Object.keys(rawAssets).forEach(lang.hitch(this, function (key) {
        var a = rawAssets[key] || {};
        this.assets[key] = { title: a.title || "", href: a.href || "" };
      }));

      // additional properties (anything besides datetime / reserved keys)
      this.properties = [];
      Object.keys(props).forEach(lang.hitch(this, function (key) {
        if (RESERVED_PROPERTY_KEYS.indexOf(key) === -1) {
          this.properties.push({ key: key, value: this._stringifyPropertyValue(props[key]) });
        }
      }));

      this._renderAssets();
      this._renderProperties();
      this._setGeometryFromGeoJSON(feature.geometry);
      this._clearStatus();
      this._show();
    },

    hide: function () {
      this.overlayNode.classList.add("hidden");
      this._clearGeometry();
    },

    // -----------------------------------------------------------------
    // Internal - show/hide/status
    // -----------------------------------------------------------------
    _show: function () {
      this.overlayNode.classList.remove("hidden");
    },

    _clearStatus: function () {
      this.statusNode.classList.add("hidden");
      this.statusNode.innerText = "";
    },

    _showStatus: function (message) {
      this.statusNode.innerText = message;
      this.statusNode.classList.remove("hidden");
    },

    // Show/hide the progress bar and lock the action buttons while a
    // save/delete request is in flight.
    _setBusy: function (busy) {
      this.progressNode.classList.toggle("hidden", !busy);
      this.saveButton.disabled = busy;
      this.deleteButton.disabled = busy;
      this.cancelButton.disabled = busy;
    },

    // -----------------------------------------------------------------
    // Geometry
    // -----------------------------------------------------------------
    // Make sure the sketch layer is visible and drawn above all other
    // layers (other panels toggle visibility / add layers after it).
    _ensureSketchLayerVisible: function () {
      if (!this.sketchLayer || !this.view) return;
      this.sketchLayer.visible = true;
      var layers = this.view.map.layers;
      if (!layers.includes(this.sketchLayer)) {
        layers.add(this.sketchLayer);
      }
      layers.reorder(this.sketchLayer, layers.length - 1);
    },

    _clearActiveTools: function () {
      this.drawPointButton.classList.remove("item-editor-active-tool");
      this.drawPolygonButton.classList.remove("item-editor-active-tool");
      this.drawCircleButton.classList.remove("item-editor-active-tool");
    },

    _startDraw: function (tool, button) {
      if (!this.sketchVM) {
        this._showStatus(this.i18n.collectionItems.editor.mapNotReady);
        return;
      }
      this._ensureSketchLayerVisible();
      this._clearActiveTools();
      this.sketchVM.cancel();
      button.classList.add("item-editor-active-tool");
      this.sketchVM.create(tool);
    },

    _onDrawPointClick: function () {
      this._startDraw("point", this.drawPointButton);
    },

    _onDrawPolygonClick: function () {
      this._startDraw("polygon", this.drawPolygonButton);
    },

    _onDrawCircleClick: function () {
      this._startDraw("circle", this.drawCircleButton);
    },

    _onClearGeometryClick: function () {
      this._clearGeometry();
    },

    _clearGeometry: function () {
      // cancel any in-progress draw/update so its temporary graphic is removed
      if (this.sketchVM) {
        try { this.sketchVM.cancel(); } catch (e) {}
      }
      if (this.sketchLayer) this.sketchLayer.removeAll();
      this.activeGeometry = null;
      if (this.drawPointButton) this._clearActiveTools();
    },

    _setGeometryFromGeoJSON: function (geojsonGeometry) {
      this._clearGeometry();
      if (!geojsonGeometry || !geojsonGeometry.type || !this.sketchLayer) return;
      var esriGeom = null;
      if (geojsonGeometry.type === "Point") {
        esriGeom = {
          type: "point",
          x: geojsonGeometry.coordinates[0],
          y: geojsonGeometry.coordinates[1],
          spatialReference: { wkid: 4326 }
        };
      } else if (geojsonGeometry.type === "Polygon") {
        esriGeom = {
          type: "polygon",
          rings: geojsonGeometry.coordinates,
          spatialReference: { wkid: 4326 }
        };
      }
      if (!esriGeom) return;
      var graphic = new EsriGraphic({
        geometry: esriGeom,
        symbol: esriGeom.type === "point" ? POINT_SYM : POLYGON_SYM
      });
      this._ensureSketchLayerVisible();
      this.sketchLayer.add(graphic);
      this.activeGeometry = graphic.geometry;
      if (this.view) {
        var target = graphic.geometry.extent ? graphic.geometry.extent.expand(2) : graphic;
        this.view.goTo(target).catch(function () {});
      }
    },

    _buildGeoJSONGeometry: function () {
      if (!this.activeGeometry) return null;
      var geom = this.activeGeometry;
      if (geom.spatialReference && geom.spatialReference.isWebMercator) {
        geom = webMercatorUtils.webMercatorToGeographic(geom);
      }
      if (geom.type === "point") {
        return { type: "Point", coordinates: [geom.x, geom.y] };
      } else if (geom.type === "polygon") {
        return { type: "Polygon", coordinates: geom.rings };
      }
      return null;
    },

    // -----------------------------------------------------------------
    // Assets
    // -----------------------------------------------------------------
    _onAddAssetClick: function () {
      var key = (this.newAssetKeyInput.value || "").trim();
      if (!key) {
        this._showStatus(this.i18n.collectionItems.editor.assetKeyRequired);
        return;
      }
      if (this.assets[key]) {
        this._showStatus(lang.replace(this.i18n.collectionItems.editor.assetKeyDuplicate, { key: key }));
        return;
      }
      this.assets[key] = { title: "", href: "" };
      this.newAssetKeyInput.value = "";
      this._clearStatus();
      this._renderAssets();
    },

    _renderAssets: function () {
      this.assetsContainer.innerHTML = "";
      var self = this;
      Object.keys(this.assets).forEach(function (key) {
        var asset = self.assets[key];
        var row = document.createElement("div");
        row.className = "item-editor-asset-row";

        var keyInput = document.createElement("input");
        keyInput.className = "item-editor-input";
        keyInput.type = "text";
        keyInput.value = key;
        keyInput.disabled = true;
        keyInput.style.flex = "0 0 110px";

        var titleInput = document.createElement("input");
        titleInput.className = "item-editor-input";
        titleInput.type = "text";
        titleInput.placeholder = self.i18n.collectionItems.editor.assetTitlePlaceholder;
        titleInput.value = asset.title || "";
        titleInput.oninput = function () { asset.title = titleInput.value; };

        var hrefInput = document.createElement("input");
        hrefInput.className = "item-editor-input";
        hrefInput.type = "text";
        hrefInput.placeholder = self.i18n.collectionItems.editor.assetHrefPlaceholder;
        hrefInput.value = asset.href || "";
        hrefInput.oninput = function () { asset.href = hrefInput.value; };

        var removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "item-editor-remove-row";
        removeBtn.innerText = self.i18n.collectionItems.editor.remove;
        removeBtn.onclick = function () {
          delete self.assets[key];
          self._renderAssets();
        };

        row.appendChild(keyInput);
        row.appendChild(titleInput);
        row.appendChild(hrefInput);
        row.appendChild(removeBtn);
        self.assetsContainer.appendChild(row);
      });
    },

    // -----------------------------------------------------------------
    // Additional properties (generic key/value pairs)
    // -----------------------------------------------------------------
    _onAddPropertyClick: function () {
      this.properties.push({ key: "", value: "" });
      this._renderProperties();
    },

    _renderProperties: function () {
      this.propertiesContainer.innerHTML = "";
      var self = this;
      this.properties.forEach(function (prop, index) {
        var row = document.createElement("div");
        row.className = "item-editor-property-row";

        var keyInput = document.createElement("input");
        keyInput.className = "item-editor-input";
        keyInput.type = "text";
        keyInput.placeholder = self.i18n.collectionItems.editor.keyPlaceholder;
        keyInput.value = prop.key || "";
        keyInput.oninput = function () { prop.key = keyInput.value; };

        var valueInput = document.createElement("input");
        valueInput.className = "item-editor-input";
        valueInput.type = "text";
        valueInput.placeholder = self.i18n.collectionItems.editor.valuePlaceholder;
        valueInput.value = prop.value || "";
        valueInput.oninput = function () { prop.value = valueInput.value; };

        var removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "item-editor-remove-row";
        removeBtn.innerText = self.i18n.collectionItems.editor.remove;
        removeBtn.onclick = function () {
          self.properties.splice(index, 1);
          self._renderProperties();
        };

        row.appendChild(keyInput);
        row.appendChild(valueInput);
        row.appendChild(removeBtn);
        self.propertiesContainer.appendChild(row);
      });
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
      var trimmed = text.trim();
      if (trimmed === "true") return true;
      if (trimmed === "false") return false;
      if (!isNaN(trimmed) && trimmed !== "") return Number(trimmed);
      if ((trimmed.charAt(0) === "{" || trimmed.charAt(0) === "[")) {
        try { return JSON.parse(trimmed); } catch (e) { /* fall through */ }
      }
      return text;
    },

    // -----------------------------------------------------------------
    // Save / Delete / Cancel
    // -----------------------------------------------------------------
    getStacBaseUrl: function () {
      if (window && window.top && window.top.geoportalServiceInfo) {
        var loc = window.top.location;
        return loc.protocol + "//" + loc.host + loc.pathname + "stac";
      }
      return null;
    },

    _buildFeaturePayload: function () {
      var id = (this.idInput.value || "").trim();
      var datetime = (this.datetimeInput.value || "").trim();

      var propertiesObj = { datetime: datetime };
      this.properties.forEach(lang.hitch(this, function (p) {
        var key = (p.key || "").trim();
        if (!key || RESERVED_PROPERTY_KEYS.indexOf(key) !== -1) return;
        propertiesObj[key] = this._parsePropertyValue(p.value);
      }));

      var assetsObj = {};
      Object.keys(this.assets).forEach(lang.hitch(this, function (key) {
        var a = this.assets[key];
        assetsObj[key] = {
          title: a.title || "",
          href: a.href || ""
        };
      }));

      var geometry = this._buildGeoJSONGeometry();
      var feature = {
        type: "Feature",
        stac_version: "1.0.0",
        id: id,
        collection: this.collectionId,
        geometry: geometry,
        properties: propertiesObj,
        assets: assetsObj,
        links: []
		
      };      
      return feature;
    },
    _validate: function () {
      var id = (this.idInput.value || "").trim();
      var datetime = (this.datetimeInput.value || "").trim();
      if (!id) return this.i18n.collectionItems.editor.idRequired;
      if (!datetime) return this.i18n.collectionItems.editor.datetimeRequired;
      return null;
    },

    _onSaveClick: function () {
      var error = this._validate();
      if (error) {
        this._showStatus(error);
        return;
      }

      var feature = this._buildFeaturePayload();
      var collectionId = this.collectionId;
      var isCreate = this.mode === "create";
      var baseUrl = this.getStacBaseUrl();
      if (!baseUrl) {
        this._showStatus(this.i18n.collectionItems.editor.stacUrlError);
        return;
      }

      var url = baseUrl + "/collections/" + encodeURIComponent(collectionId) + "/items";
      if (!isCreate) {
        url += "/" + encodeURIComponent(feature.id);
      }
      if (AppContext.appConfig.system.secureCatalogApp) {
        var client = new AppClient();
        url = client.appendAccessToken(url);
      }

      this._setBusy(true);
      fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feature)
      }).then(lang.hitch(this, function (response) {
        if (response.ok) {
          this._setBusy(false);
          this.hide();
          topic.publish(appTopics.StacItemsChanged, {
            collectionId: collectionId,
            itemId: feature.id,
            action: isCreate ? "create" : "update"
          });
          return null;
        }
        return response.json().catch(function () { return {}; }).then(lang.hitch(this, function (body) {
          this._setBusy(false);
          this._showStatus((body && (body.message || body.description)) || this.i18n.collectionItems.editor.saveFailed);
        }));
      })).catch(lang.hitch(this, function (e) {
        this._setBusy(false);
        console.error("Error saving STAC item", e);
        this._showStatus(lang.replace(this.i18n.collectionItems.editor.saveFailedWith, { error: e }));
      }));
    },

    _onDeleteClick: function () {
      if (!this.editingItem) return;
      var id = this.editingItem.id;
      var self = this;
      var dm = this.i18n.collectionItems.editor.deleteModal;
      ConfirmModal.confirm({
        title: dm.title,
        message: lang.replace(dm.message, { id: id }),
        confirmLabel: dm.confirm
      }).then(function (ok) {
        if (ok) self._doDelete(id);
      });
    },

    _doDelete: function (id) {
      var collectionId = this.collectionId;
      var baseUrl = this.getStacBaseUrl();
      var url = baseUrl + "/collections/" + encodeURIComponent(collectionId) + "/items/" + encodeURIComponent(id);
      if (AppContext.appConfig.system.secureCatalogApp) {
        var client = new AppClient();
        url = client.appendAccessToken(url);
      }

      this._setBusy(true);
      fetch(url, { method: "DELETE" }).then(lang.hitch(this, function (response) {
        this._setBusy(false);
        if (response.ok) {
          this.hide();
          topic.publish(appTopics.StacItemsChanged, {
            collectionId: collectionId,
            itemId: id,
            action: "delete"
          });
        } else {
          this._showStatus(this.i18n.collectionItems.editor.deleteFailed);
        }
      })).catch(lang.hitch(this, function (e) {
        this._setBusy(false);
        console.error("Error deleting STAC item", e);
        this._showStatus(lang.replace(this.i18n.collectionItems.editor.deleteFailedWith, { error: e }));
      }));
    },

    _onCancelClick: function () {
      this.hide();
    }
  });

  return oThisClass;
});
