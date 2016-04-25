///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define([
  'dojo/_base/declare',
  'dojo/_base/html',
  'dijit/_WidgetBase',
  'jimu/dijit/Message',
  "dgrid/OnDemandGrid",
  "dgrid/Selection",
  "dgrid/extensions/ColumnHider",
  "dgrid/extensions/ColumnResizer",
  "dgrid/extensions/ColumnReorder",
  "dojo/Deferred",
  'dojo/Evented',
  "dojo/store/Memory",
  "esri/config",
  "esri/lang",
  "esri/tasks/RelationParameters",
  "esri/layers/GraphicsLayer",
  "esri/layers/FeatureLayer",
  "esri/tasks/QueryTask",
  "esri/tasks/query",
  "esri/tasks/ProjectParameters",
  "esri/graphic",
  "esri/geometry/Point",
  "esri/geometry/Multipoint",
  "esri/geometry/Polyline",
  "esri/geometry/Polygon",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/Color",
  "esri/geometry/normalizeUtils",
  'dojo/_base/lang',
  "dojo/on",
  "dojo/_base/array",
  'jimu/dijit/LoadingIndicator',
  'jimu/CSVUtils',
  './utils',
  'dojo/query'
], function(
  declare,
  html,
  _WidgetBase,
  Message,
  OnDemandGrid,
  Selection,
  ColumnHider,
  ColumnResizer,
  ColumnReorder,
  Deferred,
  Evented,
  Memory,
  esriConfig,
  esriLang,
  RelationParameters,
  GraphicsLayer,
  FeatureLayer,
  QueryTask,
  Query,
  ProjectParameters,
  Graphic,
  Point,
  Multipoint,
  Polyline,
  Polygon,
  SimpleLineSymbol,
  SimpleFillSymbol,
  Color,
  normalizeUtils,
  lang,
  on,
  array,
  LoadingIndicator,
  CSVUtils,
  tableUtils
) {
  return declare([_WidgetBase, Evented], {
    baseClass: 'jimu-widget-attributetable-feature-table',
    _defaultFeatureCount: 2000,
    _defaultBatchCount: 25,
    _batchCount: 0,

    _filterObj: null,
    _currentDef: null,
    _requestStatus: 'initial', // initial, processing, canceled, fulfilled

    map: null,
    matchingMap: false,
    layerInfo: null,
    configedInfo: null,
    // tableDisplayer: null,
    parentWidget: null,
    noGridHeight: 0,
    footerHeight: 25,

    layer: null,
    loading: null,
    grid: null,
    footer: null,
    selectedRowsLabel: null,
    selectionRows: null,
    griaphicLayer: null,
    nls: null,

    //_layerDefinition: null,
    // _filterObj: null,

    actived: false,

    _onlyShowSelected: false,

    //events:
    //data-loaded
    //row-click
    //clear-selection

    constructor: function(options) {
      options = options || {};
      this.set('map', options.map || null);
      this.set('matchingMap', !!options.matchingMap);
      this.set('layerInfo', options.layerInfo || null);
      this.set('layer', options.layer || null);
      this.set('configedInfo', options.configedInfo || null);
      this.parentWidget = options.parentWidget || null;
      this.noGridHeight = options.noGridHeight || 0;
      //layerInfo has getted layerObject before pass to Table
      // this.layer = options && options.layerInfo && options.layerInfo.layerObject;
    },

    postCreate: function() {
      this.selectionRows = [];

      this.loading = new LoadingIndicator();
      this.loading.placeAt(this.domNode);

      if (this.get('map')) {
        this.own(on(this.map, 'extent-change', lang.hitch(this, '_onExtentChange')));
      }
    },

    startup: function() {
      if (this.map) {
        this.graphicsLayer = new GraphicsLayer();
        this.map.addLayer(this.graphicsLayer);
      }
    },

    setLayerDefinition: function(definition) {
      this._layerDefinition = definition;
    },

    getLayerDefinition: function() {
      return lang.clone(this._layerDefinition);
    },

    getFilterObj: function() {
      return this._filterObj;
    },

    setFilterObj: function(fObj) {
      this._filterObj = fObj;
    },

    cancelThread: function() {
      if (this._requestStatus !== 'fulfilled' && this._currentDef) {
        this._currentDef.cancel({canceledBySelf: true});
        this._requestStatus = 'canceled';
      }
    },

    isCanceled: function() {
      return this._requestStatus === 'canceled';
    },

    startQuery: function() {
      this.cancelThread();

      this._requestStatus = 'processing';
      this.loading.show();
      this._getLayerObject().then(lang.hitch(this, function(layerObject) {
        if (!this.domNode) {
          return;
        }

        this.layer = layerObject;
        var extent = (!this.layerInfo.isTable && this.matchingMap && this.map.extent) || null;
        if (extent && extent.spatialReference && extent.spatialReference.isWebMercator()) {
          var normalizeDef = this._currentDef = normalizeUtils.normalizeCentralMeridian(
            [extent], null, lang.hitch(this, function(normalizedGeo) {
              return normalizedGeo[0];
            }));
          normalizeDef.then(lang.hitch(this, function(_extent) {
            this._doQuery(_extent);
          }), lang.hitch(this, function(err) {
            console.error(err);
            this.loading.hide();
          }));
        } else {
          this._doQuery(extent);
        }
      }));
    },

    getSelectedRows: function() {
      return this.selectionRows;
    },

    zoomTo: function() {
      this._zoomToSelected();
    },

    toggleSelectedRecords: function() {
      if (this._onlyShowSelected) {
        this.showAllSelectedRecords();
      } else {
        this.showSelectedRecords();
      }
      this._onlyShowSelected = !this._onlyShowSelected;
    },

    showSelectedRecords: function() {
      var oid = this.layer.objectIdField;
      this.grid._clickShowSelectedRecords = true;
      var ids = this._getSelectedIds();

      if (ids.length > 0 && this.grid) {
        // when refresh completed select these rows..
        if (this.grid.store instanceof Memory) {
          this.grid.set('query', lang.hitch(this, function(item) {
            if (typeof item === 'number' && ids.indexOf(item) > -1) {
              return true;
            } else if (ids.indexOf(item[oid]) > -1) {
              return true;
            }
            return false;
          }));
        } else {
          this.grid.set('query', function() {
            return ids;
          });
        }
      }
    },

    showAllSelectedRecords: function() {
      this.grid.set('query', {});
      var selectedIds = this.selectionRows;
      array.forEach(selectedIds, lang.hitch(this, function(id) {
        this.grid.select(id);
      }));
      this.setSelectedNumber();
    },

    clearSelection: function() {
      this.grid.clearSelection();
      this.selectionRows = [];
      this.grid.set('query', {});
      this.graphicsLayer.clear();

      this.setSelectedNumber();
      this._onlyShowSelected = false;

      this.emit('clear-selection');
    },

    exportToCSV: function(fileName) {
      if (!this.layerInfo || !this.layer) {
        return;
      }
      var _outFields = null;
      var pk = this.layer.objectIdField;
      // var types = this.layer.types;
      var data = this.getSelectedRowsData();

      _outFields = this._getOutFieldsFromLayerInfos(pk);
      _outFields = this._processExecuteFields(this.layer.fields, _outFields);

      var options = {};
      if (data && data.length > 0) {
        options.datas = data;
      } else if (this.grid.store instanceof Memory) {
        data = this.grid.store.data;
        options.datas = data;
      }
      options.fromClient = false;
      options.outFields = _outFields;
      options.formatNumber = false;
      options.formatDate = true;
      options.formatCodedValue = true;
      return CSVUtils.exportCSVFromFeatureLayer(fileName, this.layer, options);
      // return this._getExportData()
      //   .then(lang.hitch(this, function(result) {
      //     if (!this.domNode) {
      //       return;
      //     }
      //     return tableUtils.createCSVStr(result.data, result.outFields, result.pk, result.types);
      //   }));
    },

    toggleColumns: function() {
      if (this.grid) {
        this.grid._toggleColumnHiderMenu();
      }
    },

    changeHeight: function(h) {
      if (this.grid && (h - this.noGridHeight - this.footerHeight >= 0)) {
        html.setStyle(
          this.grid.domNode,
          "height", (h - this.noGridHeight - this.footerHeight) + "px"
        );
      }
    },

    showGraphic: function() {
      if (this.graphicsLayer) {
        this.graphicsLayer.show();
      }
    },

    hideGraphic: function() {
      if (this.graphicsLayer) {
        this.graphicsLayer.hide();
      }
    },

    isSupportQueryToServer: function() {
      var hasLayerUrl = this.layer && this.layer.url && this.configedInfo.layer.url;
      var isCSVLayer = this.layer && this.layer.declaredClass === "esri.layers.CSVLayer";
      var isStreamLayer = this.layer && this.layer.declaredClass === "esri.layers.StreamLayer";

      return hasLayerUrl && !isCSVLayer && !isStreamLayer;
    },

    isSupportQueryOnClient: function() {
      var hasLayerUrl = this.layer && this.layer.url && this.configedInfo.layer.url;
      var isCSVLayer = this.layer && this.layer.declaredClass === "esri.layers.CSVLayer";
      var isStreamLayer = this.layer && this.layer.declaredClass === "esri.layers.StreamLayer";

      return !hasLayerUrl || isCSVLayer || isStreamLayer;
    },

    destroy: function() {
      this.layerInfo = null;
      this.configedInfo = null;
      this.parentWidget = null;
      this.layer = null;
      if (this.graphicsLayer && this.graphicsLayer.clear) {
        this.graphicsLayer.clear();
        this.map.removeLayer(this.graphicsLayer);
      }
      if (this.grid) {
        this.grid.destroy();
      }
      this.map = null;
      this.nls = null;
      if (this._currentDef && !this._currentDef.isCanceled()) {
        this._currentDef.cancel({
          canceledBySelf: true
        });
      }

      this.inherited(arguments);
    },

    _getLayerObject: function() {
      var objectDef = this._currentDef = this.layerInfo.getLayerObject();
      return objectDef.then(lang.hitch(this, function(layerObject) {
        var def = new Deferred();
        if (layerObject.declaredClass === "esri.layers.ArcGISImageServiceLayer" ||
          layerObject.declaredClass === "esri.layers.ArcGISImageServiceVectorLayer") {
          var flayer = new FeatureLayer(layerObject.url);
          this.own(on(flayer, "load", lang.hitch(this, function(params) {
            def.resolve(params.layer);
          })));
        } else {
          def.resolve(layerObject);
        }

        return def;
      }));
    },

    _doQuery: function(normalizedExtent) {
      if (!this.layer) {
        return;
      }
      var selectionRows = this.getSelectedRows();
      var pk = this.layer.objectIdField; // primary key always be display

      // Does not support queries that need to be performed on the server
      if (this.isSupportQueryToServer()) {
        this._queryToServer(normalizedExtent, pk, selectionRows);
      } else if (this.isSupportQueryOnClient()) {
        this._queryOnClient(normalizedExtent, pk, selectionRows);
      }
    },

    _queryOnClient: function(normalizedExtent, pk, selectionRows) {
      var json = {};
      if (this.layer.declaredClass === "esri.layers.StreamLayer") {
        json.features = this.layer.getLatestObservations();
      } else {
        json.features = this.layer.graphics;
      }
      var lFields = this.layer.fields;
      var liFields = this.configedInfo.layer.fields;

      if (liFields) {
        json.fields = array.filter(liFields, lang.hitch(this, function(field) {
          if (!esriLang.isDefined(field.show)) { // first open
            field.show = true;
          }
          if (field.name === pk && field.type === 'esriFieldTypeOID') {
            field._pk = true;
          }
          for (var i = 0, len = lFields.length; i < len; i++) {
            if (lFields[i].name === field.name && !field.type) {
              field.type = lFields[i].type;
            }
          }
          return field.show || field._pk;
        }));
      } else {
        json.fields = array.filter(lFields, lang.hitch(this, function(field) {
          if (!esriLang.isDefined(field.show)) { // first open
            field.show = true;
          }
          if (field.name === pk && field.type === 'esriFieldTypeOID') {
            field._pk = true;
          }
          return field.show || field._pk;
        }));
      }

      var geometries = [];
      var len = json.features.length;
      for (var i = 0; i < len; i++) {
        if (json && json.features && json.features[i] && json.features[i].geometry) {
          geometries.push(json.features[i].geometry);
        }
      }
      json.selectionRows = selectionRows;
      if (normalizedExtent && esriConfig.defaults.geometryService && geometries.length > 0) {
        var params = new RelationParameters();
        params.geometries1 = geometries;
        params.geometries2 = [normalizedExtent];
        params.relation = RelationParameters.SPATIAL_REL_INTERSECTION;

        var relationDef = this._currentDef = esriConfig.defaults.geometryService.relation(
          params, lang.hitch(this, function(pairs) {
            return pairs;
          }));
        relationDef.then(lang.hitch(this, function(json, pairs) {
          var n = pairs.length;
          var gs = [];
          for (var m = 0; m < n; m++) {
            gs.push(json.features[pairs[m].geometry1Index]);
          }
          json.features = gs;
          this.queryExecute(
            selectionRows,
            json.fields, json.features.length, false, json
          );
        }, json), lang.hitch(this, function(err) {
          console.error(err);
          this.loading.hide();
        }));
      } else {
        this.queryExecute(
          selectionRows,
          json.fields, json.features.length, false, json
        );
      }
    },

    _queryToServer: function(normalizedExtent, pk, selectionRows) {
      this._getFeatureCount(normalizedExtent)
        .then(lang.hitch(this, function(recordCounts) {
          if (!this.domNode) {
            return;
          }
          var currentLayer = this.layer;
          var maxCount = esriLang.isDefined(currentLayer.maxRecordCount) ?
            currentLayer.maxRecordCount : 1000;
          this._batchCount = Math.min(maxCount, this._defaultBatchCount);
          if (recordCounts < maxCount) {
            this._queryFeatureLayer(
              normalizedExtent, pk,
              selectionRows, recordCounts, false
            );
          } else {
            var oFields = this._getOutFieldsFromLayerInfos(pk);
            var results = {
              fields: this.layer.fields
            };
            this.layer._recordCounts = recordCounts;
            var supportsPagination = currentLayer.advancedQueryCapabilities &&
              currentLayer.advancedQueryCapabilities.supportsPagination;
            if (supportsPagination) {
              this.queryExecute(
                selectionRows, oFields, recordCounts, true, results, normalizedExtent
              );
            } else {
              this._getFeatureIds(pk, normalizedExtent)
                .then(lang.hitch(this, function(objectIds) {
                  if (!this.domNode) {
                    return;
                  }
                  this.layer._objectIds = objectIds;

                  this.queryExecute(selectionRows, oFields, recordCounts, true, results);
                }));
            }
          }
        }));
    },

    _getFeatureCount: function(normalizedExtent) {
      var def = new Deferred();
      var query = new Query();
      query.returnGeometry = false;
      query.where = this._getLayerFilterExpression();

      if (normalizedExtent) {
        query.geometry = normalizedExtent;
      }

      var countDef = this._currentDef = this.layer.queryCount(query);
      countDef.then(lang.hitch(this, function(count) {
          def.resolve(count);
        }), lang.hitch(this, function(err) {
          console.error(err);
          console.log("Could not get feature count.");
          this.loading.hide();
          def.reject(err);
        }));

      return def;
    },

    _queryFeatureLayer: function(normalizedExtent, pk, selectionRows,
      recordCounts, exceededLimit) {
      // function body
      var qt = new QueryTask(this.configedInfo.layer.url);
      var query = new Query();
      query.where = this._getLayerFilterExpression();
      var oFields = this._getOutFieldsFromLayerInfos(pk);
      if (oFields.length > 0) {
        var oNames = array.map(oFields, function(field) {
          return field.name;
        });
        query.outFields = oNames;
      } else {
        query.outFields = ["*"];
      }
      if (normalizedExtent) {
        query.geometry = normalizedExtent;
        query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
        // this.configedInfo.opened = false;
      }
      query.outSpatialReference = lang.clone(this.map.spatialReference);
      // this.config.layerInfos[index].extent = normalizedExtent;

      query.returnGeometry = false;
      var taskDef = this._currentDef = qt.execute(
        query,
        lang.hitch(this, function(results) {
          return results;
        })
      );

      taskDef.then(lang.hitch(this, function(results) {
        this.queryExecute(selectionRows, oFields, recordCounts, exceededLimit, results);
      }), lang.hitch(this, function(err) {
        console.error(err);
        this.loading.hide();
      }));
    },

    _getFeatureIds: function(pk, normalizedExtent) {
      var def = new Deferred();
      var query = new Query();
      query.returnGeometry = false;
      query.returnIdsOnly = true;
      query.where = this._getLayerFilterExpression();
      query.orderByFields = this.layer._orderByFields || [pk + " ASC"];

      if (normalizedExtent) {
        query.geometry = normalizedExtent;
      }

      var idsDef = this._currentDef = this.layer.queryIds(query);
      idsDef.then(lang.hitch(this, function(objectIds) {
        def.resolve(objectIds);
      }), lang.hitch(this, function(err) {
        console.error(err);
        console.log("Could not get feature Ids");
        def.resolve([]);
      }));

      return def;
    },

    queryExecute: function(selectionRows, oFields, recordCounts, exceededLimit, results, nExtent) {
      var data = [];
      var store = null;
      var columns = {};
      if (!this.domNode) {
        return;
      }
      // mixin porperty of field to result.fields
      results.fields = this._processExecuteFields(this.layer.fields, oFields);
      if (exceededLimit) {
        store = tableUtils.generateCacheStore(
          this.layer,
          recordCounts,
          this._batchCount,
          this._getLayerFilterExpression(),
          nExtent
        );
      } else {
        data = array.map(results.features, lang.hitch(this, function(feature) {
          return lang.clone(feature.attributes);
        }));

        store = tableUtils.generateMemoryStore(data, this.layer.objectIdField);
      }

      var currentLayer = this.layer;
      var _typeIdFild = currentLayer.typeIdField;
      var _types = currentLayer.types;
      var supportOrder = currentLayer.advancedQueryCapabilities &&
        currentLayer.advancedQueryCapabilities.supportsOrderBy;
      var supportPage = currentLayer.advancedQueryCapabilities &&
        currentLayer.advancedQueryCapabilities.supportsPagination;
      // AttributeTable does not work
      //when column name contains special character such as "." and "()"
      columns = tableUtils.generateColumnsFromFields(
        results.fields, _typeIdFild, _types, (supportOrder && supportPage) || !exceededLimit
      );
      this.createTable(columns, store, recordCounts);
      if (selectionRows && selectionRows.length) {
        for (var id in selectionRows) {
          this.grid.select(selectionRows[id]);
        }
        // it seems that grid.select(id) is not always emitting dgrid-select,
        // so persist the selection ids.
        // this.selections[index] = selectionRows;
        this.selectionRows = selectionRows;
        this.setSelectedNumber();
      }

      this.emit('data-loaded');
    },

    createTable: function(columns, store, recordCounts) {
      if (this.grid) {
        this.grid.set("store", store);
        this.grid.refresh();
      } else {
        var json = {};
        json.columns = columns;
        json.store = store;
        json.keepScrollPosition = true;
        json.pagingDelay = 1000;

        this.grid = new(declare(
          [OnDemandGrid, Selection, ColumnHider, ColumnResizer, ColumnReorder]
        ))(json, html.create("div"));
        html.place(this.grid.domNode, this.domNode);
        this.grid.startup();
        // private preperty in grid
        // _clickShowSelectedRecords
        // when these value is true selected rows after refresh complete.
        this.grid._clickShowSelectedRecords = false;
        this.own(on(
          this.grid,
          ".dgrid-row:click",
          lang.hitch(this, this._onRowClick)
        ));
        this.own(on(
          this.grid,
          ".dgrid-row:dblclick",
          lang.hitch(this, function() {
            if (this.layerInfo &&
              this.layerInfo.isShowInMap()) {
              this._zoomToSelected();
            }
          })));
        this.own(on(this.grid, 'dgrid-refresh-complete', lang.hitch(
          this, this._onRefreshComplete
        )));
      }

      if (this.footer) {
        html.empty(this.footer);
      } else {
        this.footer = html.create('div', null, this.domNode);
      }
      var _footer = this.footer;
      var countLabel = html.create('div', {
        'class': 'dgrid-status self-footer',
        'innerHTML': recordCounts + '&nbsp;' + this.nls.features + '&nbsp;'
      }, _footer);
      this.selectedRowsLabel = html.create('div', {
        'class': 'dgrid-status self-footer',
        'innerHTML': 0 + '&nbsp;' + this.nls.selected + '&nbsp;'
      }, countLabel, 'after');

      var height = html.getStyle(this.parentWidget.domNode, "height");
      this.changeHeight(height);

      this._requestStatus = 'fulfilled';
      this.configedInfo.opened = true;
      this.loading.hide();
    },

    getSelectedRowsData: function() {
      if (!this.grid) {
        return null;
      }

      var oid = this.layer.objectIdField;
      var store = this.grid.store;
      var data = store._entityData || store.data;
      var selectedIds = this.getSelectedRows();

      var rows = array.map(selectedIds, lang.hitch(this, function(id) {
        for (var i = 0, len = data.length; i < len; i++) {
          if (data[i] && data[i][oid] === id) {
            return data[i];
          }
        }
        return {};
      }));

      return rows || [];
    },

    setSelectedNumber: function() {
      if (this.selectedRowsLabel && this.grid) {
        var _ids = this.getSelectedRows();
        this.selectedRowsLabel.innerHTML = "&nbsp;&nbsp;" +
          _ids.length + " " + this.nls.selected + "&nbsp;&nbsp;";
      }
    },

    selectFeatures: function(method, result) {
      if (result && result.length > 0) {
        // if (method === "mapclick") {
        //   this.addGraphics(result, true);
        //   if (this.config.layerInfos[this.layersIndex].isDynamicLayer) {
        //     var id = result[0].attributes[this.grids[this.layersIndex].store.idProperty] + "";
        //     this.highlightRow(id);
        //   }
        // } else
        if (method === "rowclick" || method === "selectall") {
          this.addGraphics(result, true);
        } else if (method === "zoom") {
          this.getExtent(result).then(lang.hitch(this, function(gExtent) {
            if (gExtent) {
              if (gExtent.type === "point") {
                var levelOrFactor = 15;
                levelOrFactor = this.map.getMaxZoom() > -1 ? this.map.getMaxZoom() : 0.1;
                this.map.centerAndZoom(gExtent, levelOrFactor);
              } else {
                this.map.setExtent(gExtent.expand(1.1));
              }
            }
          }), lang.hitch(this, function(err) {
            console.error(err);
          }));
        }
        this.setSelectedNumber();
      } else {
        this._popupMessage(this.nls.dataNotAvailable);
      }
    },

    getGraphicsFromLocalFeatureLayer: function(ids) {
      var gs = [],
        id,
        idsi;
      var len = ids.length;
      var n = this.layer.graphics.length;
      var objectid = this.layer.objectIdField;
      for (var i = 0; i < len; i++) {
        for (var m = 0; m < n; m++) {
          id = this.layer.graphics[m].attributes[objectid] + "";
          idsi = ids[i] + "";
          if (id === idsi) {
            gs.push(this.layer.graphics[m]);
            break;
          }
        }
      }
      return gs;
    },

    addGraphics: function(result) {
      var symbol, graphic;
      var len = result.length;
      this.graphicsLayer.clear();
      var outlineSymbol = new SimpleLineSymbol(
        SimpleLineSymbol.STYLE_SOLID,
        new Color([0, 255, 255]),
        2
      );

      for (var i = 0; i < len; i++) {
        var geometry = null;
        if (!result[i].geometry) {
          console.error('unable to get geometry of the reocord: ', result[i]);
          continue;
        } else if (!result[i].geometry.spatialReference.equals(this.map.spatialReference)) {
          console.warn('unable to draw graphic result in different wkid from map');
        }
        if (result[i].geometry.type === "point") {
          geometry = new Point(result[i].geometry.toJson());
          symbol = lang.clone(this.map.infoWindow.markerSymbol);
        } else if (result[i].geometry.type === "multipoint") {
          geometry = new Multipoint(result[i].geometry.toJson());
          symbol = lang.clone(this.map.infoWindow.markerSymbol);
        } else if (result[i].geometry.type === "polyline") {
          geometry = new Polyline(result[i].geometry.toJson());
          symbol = outlineSymbol;
        } else if (result[i].geometry.type === "polygon") {
          geometry = new Polygon(result[i].geometry.toJson());
          symbol = new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_SOLID,
            outlineSymbol,
            new Color([255, 255, 255, 0.25])
          );
        }
        graphic = new Graphic(geometry, symbol, result[i].attributes, result[i].infoTemplate);
        this.graphicsLayer.add(graphic);
      }
    },

    getExtent: function(result) {
      var def = new Deferred();

      var extent, points;
      var len = result.length;
      if (len === 1 && result[0].geometry && result[0].geometry.type === "point") {
        extent = result[0].geometry;
      } else if (len === 1 && !result[0].geometry) {
        def.reject(new Error('AttributeTable.getExtent:: extent was not projected.'));
        return def;
      } else {
        for (var i = 0; i < len; i++) {
          if (!result[i].geometry) {
            console.error('unable to get geometry of the reocord: ', result[i]);
            continue;
          }
          if (result[i].geometry.type === "point") {
            if (!points) {
              points = new Multipoint(result[i].geometry.spatialReference);
              points.addPoint(result[i].geometry);
            } else {
              points.addPoint(result[i].geometry);
            }
            if (i === (len - 1)) {
              extent = points.getExtent();
            }
          } else {
            if (!extent) {
              extent = result[i].geometry.getExtent();
            } else {
              extent = extent.union(result[i].geometry.getExtent());
            }
          }
        }
      }

      if (!extent || !extent.spatialReference) {
        def.reject(new Error("AttributeTable.getExtent:: extent was not projected."));
        return def;
      }

      // convert to map sr
      var sr = this.map.spatialReference;
      if (extent.spatialReference.equals(sr)) {
        def.resolve(extent);
      } else {
        var parameter = new ProjectParameters();
        parameter.geometries = [extent];
        parameter.outSR = sr;

        esriConfig.defaults.geometryService.project(
          parameter,
          lang.hitch(this, function(geometries) {
            if (!this.domNode) {
              return;
            }
            if (geometries && geometries.length) {
              def.resolve(geometries[0]);
            } else {
              def.reject(new Error("AttributeTable.getExtent:: extent was not projected."));
            }
          }), lang.hitch(this, function(err) {
            // projection error
            if (!err) {
              err = new Error("AttributeTable.getExtent:: extent was not projected.");
            }
            def.reject(err);
          }));
      }
      return def;
    },

    _onRefreshComplete: function(evt) {
      if (evt.grid._clickShowSelectedRecords) {
        var selectedIds = this.selectionRows;
        array.forEach(selectedIds, lang.hitch(this, function(id) {
          evt.grid.select(id);
        }));

        evt.grid._clickShowSelectedRecords = false;

        if (this.isSupportQueryToServer()) {
          this._queryFeaturesByIds(selectedIds, 'selectall');
        } else if (this.isSupportQueryOnClient()) {
          this.selectFeatures(
            "selectall",
            this.getGraphicsFromLocalFeatureLayer(selectedIds)
          );
        }
      }
    },

    _zoomToSelected: function() {
      if (!this.configedInfo) {
        return;
      }
      var ids = this._getSelectedIds();
      if (ids.length === 0) {
        return;
      } else {
        if (this.isSupportQueryToServer()) {
          this._queryFeaturesByIds(ids, 'zoom');
        } else if (this.isSupportQueryOnClient()) {
          // this.onLayerGridRowClick(ids);
          this.selectFeatures(
            "zoom",
            this.getGraphicsFromLocalFeatureLayer(ids)
          );
        }
      }
    },

    _queryFeaturesByIds: function(ids, mode) {
      var query = new Query();
      query.objectIds = ids;
      query.returnGeometry = true;
      query.outSpatialReference = lang.clone(this.map.spatialReference);
      query.outFields = ['*'];
      var _layer = this.layer;
      var isCSVLayer = _layer.declaredClass === "esri.layers.CSVLayer";
      if (_layer.url && !isCSVLayer) {
        //we always select feature from server if layer has url
        var queryTask = new QueryTask(_layer.url);
        queryTask.execute(
          query,
          lang.hitch(this, function(fset) {
            this.selectFeatures(mode, fset.features);
          }),
          lang.hitch(this, this._errorSelectFeatures)
        );
      } else { // FeatureCollection do query on client
        _layer.selectFeatures(
          query,
          FeatureLayer.SELECTION_NEW,
          lang.hitch(this, this.selectFeatures, mode),
          lang.hitch(this, this._errorSelectFeatures)
        );
      }
    },

    _onRowClick: function() {
      var ids = this._getSelectedIds();
      this.selectionRows = ids;
      if (ids.length) {
        if (this.isSupportQueryToServer()) {
          this._queryFeaturesByIds(ids, 'rowclick');
        } else if (this.isSupportQueryOnClient()) {
          this.selectFeatures(
            "rowclick",
            this.getGraphicsFromLocalFeatureLayer(ids)
          );
        }
      } else {
        this.graphicsLayer.clear();
      }

      this.setSelectedNumber();

      this.emit('row-click', {
        table: this,
        selectedIds: ids
      });
    },

    _onExtentChange: function(params) {
      if (this.matchingMap && this.actived) {
        this.startQuery(params.extent);
      }
    },

    _getLayerFilterExpression: function() {
      var expr = (this._filterObj && this._filterObj.expr) || "";

      var mapFilter = this.layerInfo.getFilterOfWebmap();

      if (expr) {
        if (mapFilter) {
          return expr + " AND " + mapFilter;
        } else {
          return expr;
        }
      } else if (mapFilter) {
        return mapFilter;
      }

      return "1=1";
    },

    _getOutFieldsFromLayerInfos: function(pk) {
      var fields = this.configedInfo.layer.fields;
      var oFields = [];
      if (fields) {
        array.forEach(fields, lang.hitch(this, function(field) {
          if (!esriLang.isDefined(field.show)) { // first open
            field.show = true;
          }
          if (field.name === pk &&
            (field.type === 'esriFieldTypeOID' || // Fields come from layer.fields
              !field.type) // Fields come from config.layer.fileds
          ) {
            field._pk = true;
          }
          if (field.show || field._pk) {
            oFields.push(field);
          }
        }));
      }
      return oFields;
    },

    _processExecuteFields: function(rFields, oFields) {
      if (rFields && rFields.length > 0) {
        var outFields = [];
        if (!oFields.length) {
          return rFields;
        }
        for (var i = 0, len = oFields.length; i < len; i++) {
          for (var j = 0; j < rFields.length; j++) {
            if (oFields[i].name === rFields[j].name &&
              (oFields[i].type === rFields[j].type || // oFields come from layer.fields
                !oFields[i].type) // oFields come from config.layer.fileds
            ) {
              rFields[j] = lang.mixin(rFields[j], oFields[i]);
              outFields.push(rFields[j]);
            }
          }
        }
        return outFields;
      } else {
        return oFields;
      }

      return rFields;
    },

    _getSelectedIds: function() {
      var ids = [];
      var selection = this.grid.selection;
      for (var id in selection) {
        if (selection[id]) {
          if (isFinite(id)) {
            ids.push(parseInt(id, 10));
          } else {
            ids.push(id);
          }
        }
      }

      return ids;
    },

    _errorQueryTask: function(params) {
      this._popupMessage(params.message);
    },

    _errorGeometryServices: function(params) {
      this._popupMessage(params.message);
    },

    _errorSelectFeatures: function(params) {
      this._popupMessage(params.message);
    },

    _popupMessage: function(message) {
      var popup = new Message({
        message: message,
        buttons: [{
          label: this.nls.ok,
          onClick: lang.hitch(this, function() {
            popup.close();
          })
        }]
      });

      // this.showRefreshing(false);
      this.loading.hide();
    }
  });
});