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
 * ItemListPanel - self-contained middle column widget that lists the STAC
 * items ("features") belonging to a collection: search box, item cards,
 * and pagination. It also keeps a GeoJSONLayer on the shared map view so
 * item geometries are visualized while browsing/paging, and owns the
 * "Add Item" entry point (delegating the actual create/edit/delete UI to
 * the nested, independent ItemEditorPanel widget - see
 * templates/ItemListPanel.html and app/main/ItemEditorPanel.js).
 *
 * Public API (used by app/main/CollectionsPanel.js):
 *   setView(view)                     - must be called once the map view is ready
 *   open({collectionId, collectionTitle, view}) - show + load items for a collection
 *   clear()                           - hide panel, remove map layer/pager state
 *   isFilterByExtentActive()          - whether "filter by extent" is enabled
 */
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "app/common/Templated",
  "dojo/text!./templates/ItemListPanel.html",
  "dojo/topic",
  "app/context/app-topics",
  "app/context/AppClient",
  "esri4/layers/GeoJSONLayer",
  "esri4/geometry/support/webMercatorUtils",
  "esri4/geometry/Extent",
  "esri4/geometry/Point",
  "esri4/Graphic",
  "app/main/ConfirmModal",
  "app/main/ItemEditorPanel"
], function (
  declare,
  lang,
  Templated,
  template,
  topic,
  appTopics,
  AppClient,
  GeoJSONLayer,
  webMercatorUtils,
  Extent,
  Point,
  Graphic,
  ConfirmModal
) {
  var oThisClass = declare([Templated], {
    templateString: template,

    view: null,
    collectionId: null,
    collectionTitle: "",

    pageSize: 10,
    nextUrl: null,
    pageHistory: [],
    currentIndex: -1,
    filterByExtent: false,

    geoJSONLayers: null, // one GeoJSONLayer per geometry type (point / polygon)
    itemsById: {}, // id -> raw STAC feature (current page)

    extentChangeTimeout: null,
    extentWatchHandle: null,
    isLoadingItems: false,

    postCreate: function () {
      this.inherited(arguments);
      var self = this;

      this.addItemButton.onclick = function () {
        if (self.collectionId) {
          self.itemEditorPanel.showCreate(self.collectionId);
        }
      };

      this.closeButton.onclick = function () {
        self.clear();
      };

      this.itemSearchInput.addEventListener("input", function () {
        self._applySearchFilter(this.value);
      });

      this.prevBtn.onclick = function () {
        if (self.currentIndex > 0) {
          self.currentIndex--;
          var url = self.pageHistory[self.currentIndex];
          if (self.currentIndex === 0) {
            self.prevBtn.disabled = true;
            self.prevBtn.classList.add("disabled");
          }
          self._loadPage(url, true);
        }
      };

      this.nextBtn.onclick = function () {
        if (self.nextUrl) {
          if (self.currentIndex > 0) {
            self.prevBtn.disabled = false;
            self.prevBtn.classList.remove("disabled");
          }
          self._loadPage(self.nextUrl);
        }
      };

      this.pageSizeSelect.onchange = function () {
        self.pageSize = parseInt(self.pageSizeSelect.value, 10);
        self._resetPaging();
        self._loadPage(self._buildSearchUrl());
      };

      this.filterExtentCheckbox.onchange = function () {
        self.filterByExtent = self.filterExtentCheckbox.checked;
        self._resetPaging();
        self._loadPage(self._buildSearchUrl());
      };

      topic.subscribe(appTopics.StacItemsChanged, lang.hitch(this, function (params) {
        if (params && params.collectionId === this.collectionId) {
          this._refreshAfterChange(params);
        }
      }));
    },

    // Refresh the current page after a create/update/delete. The search
    // index is only near-real-time, so wait briefly before re-querying and
    // drop a deleted card right away so the UI reacts immediately.
    _refreshAfterChange: function (params) {
      var self = this;
      if (params.action === "delete" && params.itemId) {
        var cards = this.cardsContainer.querySelectorAll(".item-card");
        cards.forEach(function (card) {
          if (card.getAttribute("data-id") === String(params.itemId)) card.remove();
        });
        delete this.itemsById[params.itemId];
      }
      this._setListBusy(true);
      setTimeout(function () {
        var url = self.pageHistory[self.currentIndex] || self._buildSearchUrl();
        self._loadPage(url, true).then(function () {
          // deleted the last item of a later page: step back one page
          if (params.action === "delete" && Object.keys(self.itemsById).length === 0 && self.currentIndex > 0) {
            self.currentIndex--;
            return self._loadPage(self.pageHistory[self.currentIndex], true);
          }
        }).then(function () {
          self._setListBusy(false);
        }, function () {
          self._setListBusy(false);
        });
      }, 1200);
    },

    _setListBusy: function (busy) {
      this.progressNode.classList.toggle("hidden", !busy);
    },

    // -----------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------
    setView: function (view) {
      this.view = view;
      this.itemEditorPanel.setView(view);
    },

    isFilterByExtentActive: function () {
      return !!this.filterByExtent;
    },

    open: function (args) {
      args = args || {};
      if (!args.collectionId) return;
      if (args.view) this.view = args.view;
      this.collectionId = args.collectionId;
      this.collectionTitle = args.collectionTitle || args.collectionId;

      this.collectionTitleNode.innerText = this.collectionTitle;
      this.itemSearchInput.value = "";
      this.pageSizeSelect.value = String(this.pageSize);
      this.filterExtentCheckbox.checked = false;
      this.filterByExtent = false;
      this._resetPaging();

      this.placeholderNode.classList.add("hidden");
      this.panelBody.classList.remove("hidden");

      this._setupExtentChangeWatcher();
      return this._loadPage(this._buildSearchUrl());
    },

    clear: function () {
      this.collectionId = null;
      this.itemsById = {};
      this._resetPaging();

      this.panelBody.classList.add("hidden");
      this.placeholderNode.classList.remove("hidden");

      this._clearHighlight();

      this._removeMapLayers();

      if (this.extentWatchHandle) {
        this.extentWatchHandle.remove();
        this.extentWatchHandle = null;
      }
    },

    // -----------------------------------------------------------------
    // Internal - paging state / STAC base url
    // -----------------------------------------------------------------
    _resetPaging: function () {
      this.nextUrl = null;
      this.pageHistory = [];
      this.currentIndex = -1;
      this.prevBtn.disabled = true;
      this.prevBtn.classList.add("disabled");
      this.nextBtn.disabled = true;
      this.nextBtn.classList.add("disabled");
      this.pageInfoNode.innerText = "Page 1";
    },

    getStacBaseUrl: function () {
      if (window && window.top && window.top.geoportalServiceInfo) {
        var loc = window.top.location;
        return loc.protocol + "//" + loc.host + loc.pathname + "stac";
      }
      return null;
    },

    _buildSearchUrl: function () {
      var url = this.getStacBaseUrl() + "/collections/" + encodeURIComponent(this.collectionId) +
        "/items?limit=" + this.pageSize + "&f=geojson";
      if (this.filterByExtent && this.view && this.view.extent) {
        var extent = this.view.extent;
        if (extent.spatialReference.isWebMercator) {
          extent = webMercatorUtils.webMercatorToGeographic(extent);
        }
        url += "&bbox=" + extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax;
      }
      if (AppContext.appConfig.system.secureCatalogApp) {
        var client = new AppClient();
        url = client.appendAccessToken(url);
      }
      return url;
    },

    _setupExtentChangeWatcher: function () {
      if (this.extentWatchHandle) {
        this.extentWatchHandle.remove();
        this.extentWatchHandle = null;
      }
      if (!this.view) return;
      this.extentWatchHandle = this.view.watch("stationary", lang.hitch(this, function (isStationary) {
        if (isStationary && this.filterByExtent && this.collectionId && !this.isLoadingItems) {
          if (this.extentChangeTimeout) clearTimeout(this.extentChangeTimeout);
          this.extentChangeTimeout = setTimeout(lang.hitch(this, function () {
            this.isLoadingItems = true;
            this._resetPaging();
            this._loadPage(this._buildSearchUrl()).then(lang.hitch(this, function () {
              setTimeout(lang.hitch(this, function () { this.isLoadingItems = false; }), 500);
            }));
          }), 300);
        }
      }));
    },

    // -----------------------------------------------------------------
    // Fetch + render
    // -----------------------------------------------------------------
    _loadPage: function (url, fromHistory) {
      var self = this;
      return fetch(url).then(function (response) {
        return response.json();
      }).then(function (stac) {
        self.itemsById = {};
        var features = (stac && stac.features) || [];

        if (!fromHistory) {
          self.pageHistory = self.pageHistory.slice(0, self.currentIndex + 1);
          self.pageHistory.push(url);
          self.currentIndex++;
        }

        self.nextUrl = (stac.links || []).find(function (l) { return l.rel === "next"; });
        self.nextUrl = self.nextUrl ? self.nextUrl.href : null;

        var prevDisabled = self.currentIndex <= 0;
        self.prevBtn.disabled = prevDisabled;
        self.prevBtn.classList.toggle("disabled", prevDisabled);
        var nextDisabled = !self.nextUrl;
        self.nextBtn.disabled = nextDisabled;
        self.nextBtn.classList.toggle("disabled", nextDisabled);
        self.pageInfoNode.innerText = "Page " + (self.currentIndex + 1);
        self.noOfItemsNode.innerText = (stac.numberMatched != null ? stac.numberMatched : features.length) + " Items";

        self._renderCards(features);
        self._updateMapLayer(features);
      }).catch(function (e) {
        console.error("Error loading STAC items", e);
        self.cardsContainer.innerHTML = '<div class="item-list-empty">Unable to load items.</div>';
      });
    },

    _renderCards: function (features) {
      var self = this;
      this.cardsContainer.innerHTML = "";

      if (!features || features.length === 0) {
        var empty = document.createElement("div");
        empty.className = "item-list-empty";
        empty.innerText = "No items found for this collection.";
        this.cardsContainer.appendChild(empty);
        return;
      }

      features.forEach(function (feature) {
        self.itemsById[feature.id] = feature;

        var props = feature.properties || {};
        var card = document.createElement("div");
        card.className = "item-card";
        card.setAttribute("data-id", feature.id);

        var header = document.createElement("div");
        header.className = "item-card-header";

        var idSpan = document.createElement("span");
        idSpan.className = "item-card-id";
        idSpan.title = feature.id;
        idSpan.innerText = feature.id;
        header.appendChild(idSpan);
        card.appendChild(header);

        var datetimeDiv = document.createElement("div");
        datetimeDiv.className = "item-card-datetime";
        datetimeDiv.innerText = props.datetime || "";
        card.appendChild(datetimeDiv);

        var actions = document.createElement("div");
        actions.className = "item-card-actions";

        var viewBtn = document.createElement("button");
        viewBtn.type = "button";
        viewBtn.className = "item-card-action";
        viewBtn.innerText = "Zoom";
        viewBtn.onclick = function () { self._zoomToFeature(feature); };
        actions.appendChild(viewBtn);

        var editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "item-card-action";
        editBtn.setAttribute("data-role", "admin");
        editBtn.innerText = "Edit";
        editBtn.onclick = function () {
          self.itemEditorPanel.showEdit(self.collectionId, feature);
        };
        actions.appendChild(editBtn);

        var deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "item-card-action item-card-action-delete";
        deleteBtn.setAttribute("data-role", "admin");
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = function () { self._deleteItem(feature); };
        actions.appendChild(deleteBtn);

        card.appendChild(actions);
        self.cardsContainer.appendChild(card);
      });

      this._applySearchFilter(this.itemSearchInput.value);
      this._updateAdminVisibility();
    },

    _updateAdminVisibility: function () {
      var isAdmin = AppContext.appUser && AppContext.appUser.isAdmin && AppContext.appUser.isAdmin();
      var nodes = this.domNode.querySelectorAll("[data-role='admin']");
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.display = isAdmin ? "" : "none";
      }
    },

    _applySearchFilter: function (text) {
      var filter = (text || "").toLowerCase();
      var cards = this.cardsContainer.querySelectorAll(".item-card");
      cards.forEach(function (card) {
        var match = card.textContent.toLowerCase().indexOf(filter) !== -1;
        card.classList.toggle("hidden", !match);
      });
    },

    _deleteItem: function (feature) {
      var self = this;
      ConfirmModal.confirm({
        title: "Delete Item?",
        message: "Are you sure you would like to delete item \"" + feature.id + "\"? This action is irreversible.",
        confirmLabel: "Delete"
      }).then(function (ok) {
        if (ok) self._doDeleteItem(feature);
      });
    },

    _doDeleteItem: function (feature) {
      var self = this;
      var url = this.getStacBaseUrl() + "/collections/" + encodeURIComponent(this.collectionId) +
        "/items/" + encodeURIComponent(feature.id);
      if (AppContext.appConfig.system.secureCatalogApp) {
        var client = new AppClient();
        url = client.appendAccessToken(url);
      }
      this._setListBusy(true);
      fetch(url, { method: "DELETE" }).then(function (response) {
        if (response.ok) {
          topic.publish(appTopics.StacItemsChanged, {
            collectionId: self.collectionId,
            itemId: feature.id,
            action: "delete"
          });
        } else {
          self._setListBusy(false);
          alert("Unable to delete item \"" + feature.id + "\".");
        }
      }).catch(function (e) {
        self._setListBusy(false);
        console.error("Error deleting STAC item", e);
        alert("Unable to delete item \"" + feature.id + "\".");
      });
    },

    // -----------------------------------------------------------------
    // Map visualization
    // -----------------------------------------------------------------
    _clearHighlight: function () {
      if (this.highlightGraphic && this.view) {
        this.view.graphics.remove(this.highlightGraphic);
      }
      this.highlightGraphic = null;
    },

    // Draw a temporary, always-visible orange marker/outline for the
    // selected item (a lone point can be too small to see after zooming).
    _highlightFeature: function (feature) {
      this._clearHighlight();
      var g = feature.geometry;
      if (!this.view || !g) return;
      var geometry = null, symbol = null;
      if (g.type === "Point") {
        geometry = { type: "point", x: g.coordinates[0], y: g.coordinates[1], spatialReference: { wkid: 4326 } };
        symbol = {
          type: "simple-marker", style: "circle", size: 14,
          color: [255, 165, 0, 0.5], outline: { color: [255, 140, 0, 1], width: 2 }
        };
      } else if (g.type === "Polygon") {
        geometry = { type: "polygon", rings: g.coordinates, spatialReference: { wkid: 4326 } };
        symbol = { type: "simple-fill", color: [255, 165, 0, 0.4], outline: { color: [255, 140, 0, 1], width: 2 } };
      }
      if (!geometry) return;
      this.highlightGraphic = new Graphic({ geometry: geometry, symbol: symbol });
      this.view.graphics.add(this.highlightGraphic);
    },

    _zoomToFeature: function (feature) {
      if (!this.view || !feature.geometry) return;
      this._highlightFeature(feature);
      var coords = this._flattenCoordinates(feature.geometry);
      if (coords.length === 0) return;

      var xmin = Math.min.apply(null, coords.map(function (c) { return c[0]; }));
      var xmax = Math.max.apply(null, coords.map(function (c) { return c[0]; }));
      var ymin = Math.min.apply(null, coords.map(function (c) { return c[1]; }));
      var ymax = Math.max.apply(null, coords.map(function (c) { return c[1]; }));

      if (xmin === xmax && ymin === ymax) {
        var point = new Point({
          x: xmin,
          y: ymin,
          spatialReference: { wkid: 4326 }
        });
        this.view.goTo({
          target: point,
          scale: 2000
        }).catch(function (e) { console.error("goTo (point) failed", e); });
      } else {
        // Pad the extent so the geometry isn't flush with the view edge, and
        // enforce a small minimum span (in degrees) so very small geometries
        // (e.g. a ~20m wide polygon) still zoom in to a sensible scale
        // instead of resolving to a near-zero/invalid extent.
        var MIN_SPAN = 0.0015; // roughly ~150m at the equator
        var spanX = Math.max((xmax - xmin) * 1.4, MIN_SPAN);
        var spanY = Math.max((ymax - ymin) * 1.4, MIN_SPAN);
        var centerX = (xmin + xmax) / 2;
        var centerY = (ymin + ymax) / 2;

        var extent = new Extent({
          xmin: centerX - spanX / 2,
          ymin: centerY - spanY / 2,
          xmax: centerX + spanX / 2,
          ymax: centerY + spanY / 2,
          spatialReference: { wkid: 4326 }
        });

        this.view.goTo(extent).catch(function (e) { console.error("goTo (extent) failed", e); });
      }
    },

    _flattenCoordinates: function (geometry) {
      var coords = [];
      function walk(arr) {
        if (!Array.isArray(arr)) return;
        if (typeof arr[0] === "number" && typeof arr[1] === "number") {
          coords.push(arr);
          return;
        }
        arr.forEach(walk);
      }
      if (geometry && geometry.coordinates) walk(geometry.coordinates);
      return coords;
    },

    _escapeHtml: function (value) {
      return String(value === null || value === undefined ? "" : value)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    },

    _buildPopupTemplate: function (fieldNames) {
      var self = this;
      return {
        title: "{id}",
        outFields: ["*"],
        content: [{
          type: "fields",
          fieldInfos: (fieldNames || []).map(function (name) {
            return { fieldName: name, label: name.replace(/_/g, " ").toUpperCase() };
          })
        }, {
          type: "custom",
          creator: function (event) {
            var attrs = (event.graphic && event.graphic.attributes) || {};
            var html = '<div style="font-size:13px">';

            var assets = null;
            var raw = attrs.F_assets || attrs._assets;
            if (raw) {
              try { assets = JSON.parse(raw); } catch (e) { assets = null; }
            }
            if (assets && Object.keys(assets).length) {
              if (assets.thumbnail && assets.thumbnail.href) {
                html += '<div style="margin:8px 0"><img src="' + self._escapeHtml(assets.thumbnail.href) +
                  '" style="max-width:100%; border:1px solid #ccc" /></div>';
              }
              html += "<b>Assets</b><ul style=\"padding-left:16px\">";
              Object.keys(assets).forEach(function (key) {
                var asset = assets[key];
                if (!asset || !asset.href) return;
                html += '<li><a href="' + self._escapeHtml(asset.href) + '" target="_blank" rel="noopener">' +
                  self._escapeHtml(asset.title || key) + "</a></li>";
              });
              html += "</ul>";
            } else {
              html += "<i>No assets available</i>";
            }
            return html + "</div>";
          }
        }]
      };
    },

    _updateMapLayer: function (features) {
      if (!this.view) return;

      var stac = {
        type: "FeatureCollection",
        features: features.map(function (feature) {
          var copy = lang.clone(feature);
          copy.properties = {
            id: feature.id,
            collection: feature.collection,
            stac_version: feature.stac_version,
            ...(feature.properties || {}),
            _assets: JSON.stringify(feature.assets || {})
          };
          return copy;
        })
      };

      this._removeMapLayers();

      if (stac.features.length === 0) return;

      // A GeoJSONLayer holds a single geometry type, so group the features by
      // geometry type and create one layer per group (e.g. points + polygons).
      var groups = {};
      stac.features.forEach(function (f) {
        var t = f.geometry && f.geometry.type;
        if (!t) return;
        var key = (t === "Point" || t === "MultiPoint") ? "point"
          : (t === "Polygon" || t === "MultiPolygon") ? "polygon" : "other";
        (groups[key] = groups[key] || []).push(f);
      });

      var groupKeys = Object.keys(groups);
      var self = this;
      var collectionId = this.collectionId;

      groupKeys.forEach(function (geomType, index) {
        var groupFeatures = groups[geomType];
        // single item: show its id; otherwise collection id + this layer's item count
        var title = groupFeatures.length === 1
          ? String(groupFeatures[0].id)
          : (collectionId + " (" + groupFeatures.length + " items)");
        if (groupKeys.length > 1 && groupFeatures.length !== 1) {
          title = collectionId + " - " + geomType + "s (" + groupFeatures.length + " items)";
        }
        var blob = new Blob([JSON.stringify({ type: "FeatureCollection", features: groupFeatures })],
          { type: "application/json" });
        var layer = new GeoJSONLayer({
          url: URL.createObjectURL(blob),
          title: title,
          popupEnabled: true
        });
        self.geoJSONLayers.push(layer);
        self.view.map.add(layer);
        self._configureLayer(layer, geomType, index === 0);
      });
    },

    _removeMapLayers: function () {
      var self = this;
      (this.geoJSONLayers || []).forEach(function (layer) {
        if (self.view) self.view.map.remove(layer);
        layer.destroy();
      });
      this.geoJSONLayers = [];
    },

    _configureLayer: function (layer, geomType, zoomTo) {
      var self = this;
      layer.load().then(function () {
        var fieldNames = layer.fields.map(function (field) { return field.name; })
          .filter(function (n) { return n !== "_assets" && n !== "F_assets" && n !== "__OBJECTID" && n !== "OBJECTID"; });

        // orange symbology for item geometries
        if (geomType === "point") {
          layer.renderer = {
            type: "simple",
            symbol: {
              type: "simple-marker", style: "circle", size: 9,
              color: [255, 165, 0, 0.9], outline: { color: "white", width: 1 }
            }
          };
        } else if (geomType === "polygon") {
          layer.renderer = {
            type: "simple",
            symbol: {
              type: "simple-fill", color: [255, 165, 0, 0.4],
              outline: { color: [255, 140, 0, 1], width: 2 }
            }
          };
        }

        // popup is configured once, after load (fields are known by then)
        layer.popupTemplate = self._buildPopupTemplate(fieldNames);

        if (zoomTo && !self.filterByExtent && layer.fullExtent) {
          var fe = layer.fullExtent;
          if (fe.width === 0 && fe.height === 0) {
            // single point layer: extent is degenerate, so zoom by scale
            self.view.goTo({ target: fe.center, scale: 2000 }).catch(function () {});
          } else {
            self.view.goTo(fe.expand(1.2)).catch(function () {});
          }
        }
      });
    }
  });

  return oThisClass;
});
