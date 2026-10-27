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
  "app/main/ConfirmModal",
  "app/main/StatusModal"
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
  ConfirmModal,
  StatusModal
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

  var LINE_SYM = {
    type: "simple-line",
    color: [255, 140, 0, 1],
    width: 2
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
    originalGeometry: null, // GeoJSON geometry as loaded; saved as-is until the user changes it

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
          layer: this.sketchLayer,
          // orange symbols for newly drawn geometry
          pointSymbol: POINT_SYM,
          polylineSymbol: LINE_SYM,
          polygonSymbol: POLYGON_SYM
        });
        this.sketchVM.on("create", lang.hitch(this, function (e) {
          if (e.state === "complete") {
            this._clearActiveTools();
            this.sketchLayer.graphics.forEach(lang.hitch(this, function (g) {
              if (g !== e.graphic) this.sketchLayer.remove(g);
            }));
            this.activeGeometry = e.graphic.geometry;
            this.originalGeometry = null; // newly drawn geometry replaces the original
          }
        }));
        var updateChanged = false;
        this.sketchVM.on("update", lang.hitch(this, function (e) {
          if (e.state === "active") updateChanged = true;
          if (e.state === "complete") {
            this.selectGeometryButton.classList.remove("item-editor-active-tool");
          }
          if (e.state === "complete" && e.graphics && e.graphics[0] &&
              this.sketchLayer.graphics.includes(e.graphics[0])) {
            this.activeGeometry = e.graphics[0].geometry;
            if (updateChanged && !e.aborted) this.originalGeometry = null;
            updateChanged = false;
          }
        }));
        // Delete key on a selected graphic
        this.sketchVM.on("delete", lang.hitch(this, function () {
          this.activeGeometry = null;
          this.originalGeometry = null;
          this.selectGeometryButton.classList.remove("item-editor-active-tool");
        }));
      }
    },

    // defaultProperties: optional plain object (e.g. the collection's
    // "properties") used to pre-populate the Additional Properties editor.
    showCreate: function (collectionId, defaultProperties) {
      if (!collectionId) return;
      this.mode = "create";
      this.collectionId = collectionId;
      this.editingItem = null;
      this.titleNode.innerText = this.i18n.collectionItems.editor.addTitle;
      this.saveButton.innerText = this.i18n.collectionItems.editor.save;
      this.deleteButton.classList.add("hidden");
      this.addCollectionPropertiesButton.style.display = "";
      this.idInput.disabled = false;
      this.idInput.value = "";
      this.datetimeInput.value = new Date().toISOString();
      this.assets = {};
      this.properties = [];
      var defaults = defaultProperties || {};
      Object.keys(defaults).forEach(lang.hitch(this, function (key) {
        if (RESERVED_PROPERTY_KEYS.indexOf(key) === -1) {
          this.properties.push(this._makePropertyRow(key, defaults[key]));
        }
      }));
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
      this.addCollectionPropertiesButton.style.display = "none";
      this.idInput.disabled = true;
      this.idInput.value = feature.id || "";
      var props = feature.properties || {};
      this.datetimeInput.value = props.datetime || "";

      // assets
      this.assets = {};
      var rawAssets = feature.assets || {};
      Object.keys(rawAssets).forEach(lang.hitch(this, function (key) {
        // keep the full asset so unknown fields survive an edit
        var a = lang.clone(rawAssets[key] || {});
        a.title = a.title || "";
        a.href = a.href || "";
        this.assets[key] = a;
      }));

      // additional properties (anything besides datetime / reserved keys)
      this.properties = [];
      Object.keys(props).forEach(lang.hitch(this, function (key) {
        if (RESERVED_PROPERTY_KEYS.indexOf(key) === -1) {
          this.properties.push(this._makePropertyRow(key, props[key]));
        }
      }));

      this._renderAssets();
      this._renderProperties();
      this._setGeometryFromGeoJSON(feature.geometry);
      this._clearStatus();
      this._show();
      this.onShowEdit(feature);
    },

    // extension hook, called after the dialog is opened for an existing item
    onShowEdit: function (feature) {},

    // changed: true when the dialog closes after a successful save/delete
    hide: function (changed) {
      this.overlayNode.classList.add("hidden");
      this._clearGeometry();
      this.onHide(!!changed);
    },

    // extension hook, called after the dialog is closed
    onHide: function (changed) {},

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

    // status messages are shown in the common status modal dialog
    _showStatus: function (message) {
      StatusModal.error(message);
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
      this.selectGeometryButton.classList.remove("item-editor-active-tool");
      this.drawPointButton.classList.remove("item-editor-active-tool");
      this.drawMultipointButton.classList.remove("item-editor-active-tool");
      this.drawLineButton.classList.remove("item-editor-active-tool");
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

    _onDrawMultipointClick: function () {
      this._startDraw("multipoint", this.drawMultipointButton);
    },

    _onDrawLineClick: function () {
      this._startDraw("polyline", this.drawLineButton);
    },

    _onDrawPolygonClick: function () {
      this._startDraw("polygon", this.drawPolygonButton);
    },

    _onDrawCircleClick: function () {
      this._startDraw("circle", this.drawCircleButton);
    },

    // select the existing geometry so it can be moved/reshaped or deleted
    _onSelectGeometryClick: function () {
      if (!this.sketchVM || !this.sketchLayer) return;
      var graphics = this.sketchLayer.graphics.toArray();
      if (!graphics.length) return;
      this._ensureSketchLayerVisible();
      this._clearActiveTools();
      this.sketchVM.cancel();
      this.selectGeometryButton.classList.add("item-editor-active-tool");
      this.sketchVM.update(graphics);
    },

    _onClearGeometryClick: function () {
      this._clearGeometry();
    },

    _clearGeometry: function () {
      var layer = this.sketchLayer;
      if (this.sketchVM) {
        // a selected (being updated) graphic is held by the sketch view model;
        // use its own delete() so the graphic and its handles are really removed
        try {
          if (this.sketchVM.updateGraphics && this.sketchVM.updateGraphics.length) {
            this.sketchVM.delete();
          }
        } catch (e) {}
        // cancel any in-progress draw/update so its temporary graphic is removed
        try { this.sketchVM.cancel(); } catch (e) {}
      }
      if (layer) {
        layer.removeAll();
        // cancel() can restore the graphic asynchronously, so clean up again
        setTimeout(lang.hitch(this, function () {
          if (this.activeGeometry === null && layer.graphics.length) layer.removeAll();
        }), 0);
      }
      this.activeGeometry = null;
      this.originalGeometry = null;
      if (this.selectGeometryButton) this.selectGeometryButton.classList.remove("item-editor-active-tool");
      if (this.drawPointButton) this._clearActiveTools();
    },

    _setGeometryFromGeoJSON: function (geojsonGeometry) {
      this._clearGeometry();
      if (!geojsonGeometry || !geojsonGeometry.type || !this.sketchLayer) return;
      var esriGeom = null;
      var sr = { wkid: 4326 };
      var c = geojsonGeometry.coordinates;
      switch (geojsonGeometry.type) {
        case "Point":
          esriGeom = { type: "point", x: c[0], y: c[1], spatialReference: sr };
          break;
        case "MultiPoint":
          esriGeom = { type: "multipoint", points: c, spatialReference: sr };
          break;
        case "LineString":
          esriGeom = { type: "polyline", paths: [c], spatialReference: sr };
          break;
        case "MultiLineString":
          esriGeom = { type: "polyline", paths: c, spatialReference: sr };
          break;
        case "Polygon":
          esriGeom = { type: "polygon", rings: c, spatialReference: sr };
          break;
        case "MultiPolygon":
          esriGeom = {
            type: "polygon",
            rings: c.reduce(function (acc, poly) { return acc.concat(poly); }, []),
            spatialReference: sr
          };
          break;
      }
      if (!esriGeom) return;
      var symbol = POLYGON_SYM;
      if (esriGeom.type === "point" || esriGeom.type === "multipoint") symbol = POINT_SYM;
      else if (esriGeom.type === "polyline") symbol = LINE_SYM;
      var graphic = new EsriGraphic({ geometry: esriGeom, symbol: symbol });
      this._ensureSketchLayerVisible();
      this.sketchLayer.add(graphic);
      this.activeGeometry = graphic.geometry;
      // keep the original GeoJSON so it is saved unchanged unless the user edits it
      this.originalGeometry = lang.clone(geojsonGeometry);
      if (this.view) {
        var target = graphic.geometry.extent ? graphic.geometry.extent.expand(2) : graphic;
        this.view.goTo(target).catch(function () {});
      }
    },

    _buildGeoJSONGeometry: function () {
      if (this.originalGeometry) return lang.clone(this.originalGeometry);
      if (!this.activeGeometry) return null;
      var geom = this.activeGeometry;
      if (geom.spatialReference && geom.spatialReference.isWebMercator) {
        geom = webMercatorUtils.webMercatorToGeographic(geom);
      }
      if (geom.type === "point") {
        return { type: "Point", coordinates: [geom.x, geom.y] };
      } else if (geom.type === "multipoint") {
        return { type: "MultiPoint", coordinates: geom.points };
      } else if (geom.type === "polyline") {
        return geom.paths.length === 1
          ? { type: "LineString", coordinates: geom.paths[0] }
          : { type: "MultiLineString", coordinates: geom.paths };
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
        var ed = self.i18n.collectionItems.editor;
        var card = document.createElement("div");
        card.className = "item-editor-asset-card";

        var header = document.createElement("div");
        header.className = "item-editor-asset-header";
        var keyLabel = document.createElement("span");
        keyLabel.className = "item-editor-asset-key";
        keyLabel.innerText = key;
        var removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "item-editor-remove-row";
        removeBtn.innerText = ed.remove;
        removeBtn.onclick = function () {
          delete self.assets[key];
          self._renderAssets();
        };
        header.appendChild(keyLabel);
        header.appendChild(removeBtn);
        card.appendChild(header);

        function addField(placeholder, value, onChange, multiline) {
          var el = document.createElement(multiline ? "textarea" : "input");
          el.className = "item-editor-input item-editor-asset-field";
          if (!multiline) el.type = "text";
          else el.rows = 2;
          el.placeholder = placeholder;
          el.title = placeholder;
          el.value = value || "";
          el.oninput = function () { onChange(el.value); };
          card.appendChild(el);
        }

        addField(ed.assetHrefPlaceholder, asset.href, function (v) { asset.href = v; });
        addField(ed.assetTitlePlaceholder, asset.title, function (v) { asset.title = v; });
        addField(ed.assetTypePlaceholder, asset.type, function (v) { asset.type = v; });
        addField(ed.assetDescriptionPlaceholder, asset.description, function (v) { asset.description = v; }, true);
        addField(ed.assetRolesPlaceholder,
          Array.isArray(asset.roles) ? asset.roles.join(", ") : "",
          function (v) {
            asset.roles = v.split(",").map(function (s) { return s.trim(); })
              .filter(function (s) { return s; });
          });

        self.assetsContainer.appendChild(card);
      });
    },

    // -----------------------------------------------------------------
    // Additional properties (generic key/value pairs)
    // -----------------------------------------------------------------
    _onAddPropertyClick: function () {
      this.properties.push({ key: "", value: "" });
      this._renderProperties();
    },

    // fetches the collection and fills in all of its properties; existing
    // rows with the same key are overwritten, the user can then edit values.
    _onAddCollectionPropertiesClick: function () {
      var baseUrl = this.getStacBaseUrl();
      if (!baseUrl || !this.collectionId) {
        this._showStatus(this.i18n.collectionItems.editor.stacUrlError);
        return;
      }
      var url = baseUrl + "/collections/" + encodeURIComponent(this.collectionId);
      if (AppContext.appConfig.system.secureCatalogApp) {
        var client = new AppClient();
        url = client.appendAccessToken(url);
      }
      this._clearStatus();
      this.addCollectionPropertiesButton.disabled = true;
      fetch(url).then(function (response) {
        if (!response.ok) throw new Error(response.status);
        return response.json();
      }).then(lang.hitch(this, function (collection) {
        this.addCollectionPropertiesButton.disabled = false;
        var props = (collection && collection.properties) || {};
        Object.keys(props).forEach(lang.hitch(this, function (key) {
          if (RESERVED_PROPERTY_KEYS.indexOf(key) !== -1) return;
          var value = this._stringifyPropertyValue(props[key]);
          var row = this._makePropertyRow(key, props[key]);
          var existing = null;
          this.properties.forEach(function (p) {
            if ((p.key || "").trim() === key) existing = p;
          });
          if (existing) {
            existing.value = row.value;
            existing.hasOriginal = true;
            existing.original = row.original;
            existing.originalText = row.originalText;
          } else this.properties.push(row);
        }));
        this._renderProperties();
      })).catch(lang.hitch(this, function (e) {
        this.addCollectionPropertiesButton.disabled = false;
        console.error("Error loading collection properties", e);
        this._showStatus(this.i18n.collectionItems.editor.collectionPropertiesFailed);
      }));
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

    // a row remembers its typed original value so rows the user did not edit
    // are saved exactly as loaded (null, "00123", "false", ...)
    _makePropertyRow: function (key, rawValue) {
      var text = this._stringifyPropertyValue(rawValue);
      return { key: key, value: text, hasOriginal: true, original: rawValue, originalText: text };
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
      if (!isNaN(trimmed) && trimmed !== "" && String(Number(trimmed)) === trimmed) return Number(trimmed);
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
        propertiesObj[key] = (p.hasOriginal && p.value === p.originalText)
          ? lang.clone(p.original)
          : this._parsePropertyValue(p.value);
      }));

      var assetsObj = {};
      Object.keys(this.assets).forEach(lang.hitch(this, function (key) {
        var out = lang.clone(this.assets[key]);
        out.title = out.title || "";
        out.href = out.href || "";
        ["type", "description"].forEach(function (f) {
          if (!out[f] || !String(out[f]).trim()) delete out[f];
        });
        if (!Array.isArray(out.roles) || !out.roles.length) delete out.roles;
        assetsObj[key] = out;
      }));

      var geometry = this._buildGeoJSONGeometry();

      // when editing, start from the original item so fields not exposed in
      // the form (stac_extensions, links, ...) are preserved on PUT
      var feature = this.mode === "edit" && this.editingItem ? lang.clone(this.editingItem) : {};
      feature.type = "Feature";
      feature.stac_version = feature.stac_version || "1.0.0";
      feature.id = id;
      feature.collection = this.collectionId;
      feature.geometry = geometry;
     
      feature.properties = propertiesObj;
      feature.assets = assetsObj;
      feature.links = feature.links || [];
      delete feature._assets;

      return feature;
    },
    
    _validate: function () {
      var id = (this.idInput.value || "").trim();
      var datetime = (this.datetimeInput.value || "").trim();
      if (!id) return this.i18n.collectionItems.editor.idRequired;
      if (!datetime) return this.i18n.collectionItems.editor.datetimeRequired;
      if (!this._buildGeoJSONGeometry()) return this.i18n.collectionItems.editor.geometryRequired;
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
          this.hide(true);
          topic.publish(appTopics.StacItemsChanged, {
            collectionId: collectionId,
            itemId: feature.id,
            action: isCreate ? "create" : "update"
          });
          return null;
        }
        return response.text().then(lang.hitch(this, function (text) {
          var body = {};
          try { body = JSON.parse(text); } catch (e) { body = { message: text }; }
          var msg = (body && (body.message || body.description)) || this.i18n.collectionItems.editor.saveFailed;
          if (body && Array.isArray(body.details) && body.details.length) {
            msg += "\n" + body.details.join("\n");
          }
          this._setBusy(false);
          this._showStatus("(" + response.status + ") " + msg);
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
          this.hide(true);
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