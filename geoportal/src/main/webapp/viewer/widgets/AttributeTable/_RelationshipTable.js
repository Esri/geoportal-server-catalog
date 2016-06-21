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
  "dgrid/OnDemandGrid",
  "dgrid/Selection",
  "dgrid/extensions/ColumnHider",
  "dgrid/extensions/ColumnResizer",
  "dgrid/extensions/ColumnReorder",
  'dojo/Evented',
  "dojo/store/Memory",
  "esri/request",
  "esri/tasks/RelationshipQuery",
  "esri/lang",
  'dojo/_base/lang',
  "dojo/on",
  "dojo/_base/array",
  "dojo/query",
  'jimu/dijit/LoadingIndicator',
  'jimu/CSVUtils',
  'jimu/utils',
  './utils'
], function(
  declare,
  html,
  _WidgetBase,
  OnDemandGrid,
  Selection,
  ColumnHider,
  ColumnResizer,
  ColumnReorder,
  Evented,
  Memory,
  esriRequest,
  RelationshipQuery,
  esriLang,
  lang,
  on,
  array,
  query,
  LoadingIndicator,
  CSVUtils,
  jimuUtils,
  tableUtils
) {
  return declare([_WidgetBase, Evented], {
    baseClass: 'jimu-widget-attributetable-relationship-table',
    _defaultFeatureCount: 2000,
    _defaultBatchCount: 25,
    _batchCount: 0,

    _currentDef: null,
    _requestStatus: 'initial', // initial, processing, canceled, fulfilled

    relationship: null,
    parentWidget: null,
    footerHeight: 25,

    loading: null,
    grid: null,
    footer: null,
    selectedRowsLabel: null,
    selectionRows: null,
    nls: null,

    actived: false,
    showSelected: false,
    tableCreated: false,

    //events:
    //data-loaded
    //row-click
    //clear-selection

    constructor: function(options) {
      options = options || {};
      this.set('relationship', options.relationship || null);
      this.parentWidget = options.parentWidget || null;
      this.configedInfo = options.configInfo || null;
      this.originalInfo = options.originalInfo || null;
    },

    postCreate: function() {
      this.selectionRows = [];

      this.loading = new LoadingIndicator();
      this.loading.placeAt(this.domNode);

      html.setAttr(
        this.domNode, 'data-originalinfoid',
        lang.getObject('originalInfo.id', false, this)
        );
      html.setAttr(
        this.domNode, 'data-configedinfoid',
        lang.getObject('configedInfo.id', false, this)
        );
    },

    showRefreshing: function(isshow) {
      if (isshow) {
        this.loading.show();
      } else {
        this.loading.hide();
      }
    },

    active: function() {
      this.actived = true;
    },

    deactive: function() {
      this.actived = false;
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

    startQuery: function(params) {
      var layer = params && params.layer;
      var selectedIds = params && params.selectedIds;
      var ship = this.relationship;

      if (layer && ship && selectedIds && selectedIds.length > 0 &&
        !jimuUtils.isEqual(this._currentSelectedIds, selectedIds) &&
        lang.getObject('originalInfo.layerObject.url', false, this)) {
        this.loading.show();
        this._requestStatus = 'processing';

        if (!lang.getObject('relatedTableUrl', false, this)) {
          var layerUrl = this.originalInfo.layerObject.url;
          var parts = layerUrl.split('/');
          parts[parts.length - 1] = this.relationship.relatedTableId;
          this.relatedTableUrl = parts.join('/');
        }

        var tableInfoDef = esriRequest({
          url: this.relatedTableUrl,
          content: {
            f: 'json'
          },
          hangleAs: 'json',
          callbackParamName: 'callback'
        });

        this._currentDef = tableInfoDef;

        tableInfoDef.then(lang.hitch(this, function(response) {
          if (!this.domNode) {
            return;
          }

          var relatedTableInfo = this.relationship.shipInfo;
          if (relatedTableInfo) {
            var configedTableInfo = this.configedInfo;
            var tablePopupInfo = tableUtils.getConfigInfoFromLayerInfo(relatedTableInfo);
            var sourceFileds = lang.getObject('layer.fields', false, configedTableInfo) ||
              lang.getObject('layer.fields', false, tablePopupInfo);

            tableUtils.merge(response.fields, sourceFileds,
              'name', function(d, s) {
              lang.mixin(d, s);
            });
            response.fields = tableUtils.syncOrderWith(response.fields, sourceFileds, 'name');
          }
          var ofs = [];
          array.forEach(response.fields, function(f) {
            if (!esriLang.isDefined(f.show) || f.show === true ||
              (f.type === 'esriFieldTypeOID' ||
                (esriLang.isDefined(response.objectIdField) &&
                  f.name === response.objectIdField))) {
              ofs.push(f.name);
            }
          });
          var relatedQuery = new RelationshipQuery();
          relatedQuery.objectIds = selectedIds;
          relatedQuery.outFields = ofs.length ? ofs : ['*'];
          relatedQuery.relationshipId = ship.id;
          relatedQuery.returnGeometry = false;

          var relatedDef = this._currentDef = layer.queryRelatedFeatures(relatedQuery,
            function(relatedFeatures) {
              return relatedFeatures;
            });
          relatedDef.then(lang.hitch(this, function(relatedFeatures) {
            if (!this.domNode) {
              return;
            }
            var results = {
              displayFieldName: ship.objectIdField,
              fields: response.fields,
              features: [],
              fieldAliases: null
            };

            for (var p in relatedFeatures) {
              var _set = relatedFeatures[p];
              if (_set.features && _set.features.length > 0) {
                results.features = results.features.concat(_set.features);
              }
            }

            if (results.features.length > 0) {
              // createRelationTable
              this.tableDefinition = response;
              this.createTable(response, results);
              this._currentSelectedIds = selectedIds;

              this.emit('data-loaded');
            } else {
              var tip = html.toDom('<div>' + this.nls.noRelatedRecords + '</div>');
              this._removeTable();
              html.empty(this.domNode);
              html.place(tip, this.domNode);
              html.place(this.loading.domNode, this.domNode);
            }

            ship.opened = true;
            // this.refreshGridHeight();
            this.loading.hide();
          }), lang.hitch(this, function(err) {
            if (err && err.message !== 'Request canceled') {
              console.error(err);
            }
            var tip = html.toDom('<div>' + this.nls.noRelatedRecords + '</div>');
            this._removeTable();
            html.empty(this.domNode);
            html.place(tip, this.domNode);
            html.place(this.loading.domNode, this.domNode);
            this.loading.hide();
          }));
        }), lang.hitch(this, function(err) {
          if (err && err.message !== 'Request canceled') {
            console.error(err);
          }
          this.loading.hide();
        }));
      } else {
        this.loading.hide();
      }
    },

    getSelectedRows: function() {
      if (!this.tableCreated) {
        return;
      }
      return this.selectionRows;
    },

    zoomTo: function() {
      // this._zoomToSelected();
    },

    toggleSelectedRecords: function() {
      if (!this.tableCreated) {
        return;
      }
      if (this.showSelected) {
        this.showAllSelectedRecords();
      } else {
        this.showSelectedRecords();
      }
      this.showSelected = !this.showSelected;
    },

    showSelectedRecords: function() {
      if (!this.tableCreated) {
        return;
      }
      var oid = this.relationship.objectIdField;
      this.grid._clickShowSelectedRecords = true;
      var ids = this._getSelectedIds();

      if (ids.length > 0 && this.grid) {
        // when refresh completed select these rows.
        this.grid.set('query', lang.hitch(this, function(item) {
          if (typeof item === 'number' && ids.indexOf(item) > -1) {
            return true;
          } else if (ids.indexOf(item[oid]) > -1) {
            return true;
          }
          return false;
        }));
      }
    },

    showAllSelectedRecords: function() {
      if (!this.tableCreated) {
        return;
      }
      this.grid.set('query', {});
      var selectedIds = this.selectionRows;
      array.forEach(selectedIds, lang.hitch(this, function(id) {
        this.grid.select(id);
      }));
      this.setSelectedNumber();
    },

    clearSelection: function(requery) {
      if (!this.tableCreated) {
        return;
      }
      this.grid.clearSelection();
      this.selectionRows = [];
      if (requery) {
        this.grid.set('query', {});
      }

      this.setSelectedNumber();
      this.showSelected = false;

      this.emit('clear-selection');
    },

    refresh: function() {
      if (this.grid) {
        this.grid.clearSelection();
      }

      this.startQuery();
    },

    exportToCSV: function(fileName) {
      if (!this.relationship || !this.tableDefinition || !this.tableCreated) {
        return;
      }

      var _outFields = this.grid.__outFields;
      var data = this.getSelectedRowsData();

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
      var popupInfo = this.relationship.shipInfo && this.relationship.shipInfo.getPopupInfo();
      options.popupInfo = popupInfo;

      return CSVUtils.exportCSVFromFeatureLayer(
        fileName || this.relationship.name,
        this.tableDefinition,
        options);
    },

    toggleColumns: function() {
      if (this.grid) {
        this.grid._toggleColumnHiderMenu();
      }
    },

    changeHeight: function(h) {
      if (this.grid && (h - this.footerHeight >= 0)) {
        html.setStyle(
          this.grid.domNode,
          "height", (h - this.footerHeight) + "px"
        );
      }
    },

    destroy: function() {
      if (!this.destroyed) {
        this.layerInfo = null;
        this.configedInfo = null;
        this.parentWidget = null;

        if (this.grid) {
          this.grid.destroy();
        }

        this.map = null;
        this.nls = null;

        this.relationship.opened = false;
        this.relationship = null;
        this.inherited(arguments);
      }
    },

    createTable: function(tableInfo, featureSet) {
      var data = array.map(featureSet.features, lang.hitch(this, function(feature) {
        return feature.attributes;
      }));
      var store = tableUtils.generateMemoryStore(data, featureSet.displayFieldName);

      var _typeIdField = tableInfo.typeIdField;
      var _types = tableInfo.types;
      var popupInfo = this.relationship.shipInfo && this.relationship.shipInfo.getPopupInfo();
      var columns = tableUtils.generateColumnsFromFields(
        popupInfo, featureSet.fields, _typeIdField, _types);

      if (this.grid) {
        this.grid.set('store', store);
        this.grid.refresh();
      } else {
        var json = {
          'columns': columns,
          'store': store,
          'keepScrollPosition': true,
          'pagingDelay': 1000,
          'allowTextSelection': true
        };

        this.grid = new(declare(
          [OnDemandGrid, Selection, ColumnHider, ColumnResizer, ColumnReorder]
        ))(json, html.create("div"));
        html.empty(this.domNode);
        html.place(this.grid.domNode, this.domNode);
        html.place(this.loading.domNode, this.domNode);
        this.grid.startup();
        this.grid.__pk = featureSet.displayFieldName;
        this.grid.__outFields = featureSet.fields;

        this.own(on(
          this.grid,
          ".dgrid-row:click",
          lang.hitch(this, this._onRowClick)
        ));
      }

      // fix dgrid bug
      // sometimes dgrid-scroller will overload dgrid-header
      if (this.getParent()) {
        var scroller = query('.dgrid-scroller', this.grid.domNode)[0];
        var header = query('.dgrid-header', this.grid.domNode)[0];
        var scrollerStyle = html.getComputedStyle(scroller);
        var headerBox = html.getMarginBox(header);
        var smt = parseInt(scrollerStyle.marginTop, 10);
        if (isFinite(smt) && headerBox && smt < headerBox.h) {
          html.setStyle(scroller, 'marginTop', headerBox.h + 'px');
        }
      }

      if (this.footer) {
        html.empty(this.footer);
      } else {
        this.footer = html.create('div', null, this.domNode);
      }
      var _footer = this.footer;
      var countLabel = html.create('div', {
        'class': 'dgrid-status self-footer',
        'innerHTML': data.length + '&nbsp;' + this.nls.features + '&nbsp;'
      }, _footer);
      this.selectedRowsLabel = html.create('div', {
        'class': 'dgrid-status self-footer',
        'innerHTML': 0 + '&nbsp;' + this.nls.selected + '&nbsp;'
      }, countLabel, 'after');

      var height = html.getStyle(this.domNode, "height");
      this.changeHeight(height);
      this._requestStatus = 'fulfilled';
      this.tableCreated = true;
    },

    _removeTable: function() {
      if (this.grid && this.grid.domNode) {
        this.grid.destroy();
        this.grid = null;
      }
      if (this.footer) {
        html.destroy(this.footer);
        this.footer = null;
        this.selectedRowsLabel = null;
      }
    },

    getSelectedRowsData: function() {
      if (!this.grid) {
        return null;
      }

      var oid = this.relationship.objectIdField;
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

    _onRowClick: function() {
      this.selectionRows = this._getSelectedIds();
      this.setSelectedNumber();
      this.emit('row-click', {
        table: this,
        selectedIds: lang.clone(this.selectionRows)
      });
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
    }
  });
});