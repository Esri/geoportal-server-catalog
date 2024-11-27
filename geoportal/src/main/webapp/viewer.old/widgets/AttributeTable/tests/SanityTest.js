/**
 * Created by zezheng on 2016-04-11.
 */
define([
  'intern!bdd',
  'intern/chai!assert',
  'testjimu/WidgetManager',
  'dojo/_base/html',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/promise/all',
  'dojo/on',
  'dojo/Evented',
  'dijit/registry',
  'widgets/AttributeTable/_FeatureTable',
  'widgets/AttributeTable/_ResourceManager',
  'widgets/AttributeTable/utils',
  'intern/order!sinon',
  'testjimu/globals'
], function(bdd, assert, TestWidgetManager,
  html, lang, Deferred, all, on, Evented, registry, _FeatureTable, _ResourceManager,
  attrUtils,
  sinon) {
  'use strict';
  var widgetJson = {
    id: 'attributetable1',
    uri: "widgets/AttributeTable/Widget"
  };
  var nls = {
    _widgetLabel: "Attribute Table",
    ok: "OK",
    cancel: "Cancel",
    unsupportQueryWarning: "The layer needs to support query operation to display in Attribute Table widget. Make sure the query capability in the service is turned on.",
    exportMessage: "Export data to CSV file?",
    exportFiles: "Export to CSV",
    exportSelected: "Export Selected to CSV",
    exportAll: "Export All to CSV",
    options: "Options",
    zoomto: "Zoom to",
    highlight: "Highlight Graphics",
    selectAll: "Select Records in All Pages",
    selectPage: "Select Records in Current Page",
    clearSelection: "Clear Selection",
    filter: "Filter",
    setFilterTip: "Please set filter correctly.",
    noFilterTip: "Without filter expression defined, this query task will list all features in the specified data source.",
    filterByExtent: "Filter by Map Extent",
    showSelectedRecords: "Show Selected Records",
    showAllRecords: "Show All Records",
    showRelatedRecords: "Show Related Records",
    noRelatedRecords: "No related records found",
    refresh: "Refresh",
    features: "features",
    selected: "selected",
    transparent: "Transparent Mode",
    indicate: "Locate Selection",
    columns: "Show/Hide Columns",
    selectionSymbol: "Selection Symbol",
    closeMessage: "Hide Table (expand it again from the bottom)",
    dataNotAvailable: "Data not available!<br>Click [Refresh] button to try again.",
    openTableTip: "Open Attribute Table",
    closeTableTip: "Hide Attribute Table",
    sortAsc: "Sort Ascending",
    sortDes: "Sort Descending",
    statistics: "Statistics"
  };

  bdd.describe('test methods of _FeatureTable', function() {
    bdd.before(function() {
      var div = html.create('div', {
        id: 'tests_featureTable'
      });
      document.body.appendChild(div);
      window.jimuConfig.layoutId = 'tests_featureTable';
    });
    bdd.after(function() {
      window.jimuConfig.layeroutId = 'jimu-layout-manager';
    });

    bdd.beforeEach(function() {
      var d = registry.byId('attributetable1');
      if (d && d.destroy) {
        d.destroyRecursive();
      }
    });

    bdd.it("test _showColumnMenu", function() {
      var column = {
        _cache: {
          sortable: true,
          statistics: true
        },
        field: 'POP2000'
      };
      var cell = html.create('div');
      var target = html.create('div');
      var coords = {
        x: 150,
        y: 220
      };
      var table = new _FeatureTable({
        nls: nls
      });
      // table.nls = nls;
      table._showColumnMenu(column, cell, target, coords);
      var cm = table.get('columnMenu');
      assert.strictEqual(cm.getChildren().length, 3);

      column._cache.statistics = false;
      table._showColumnMenu(column, cell, target, coords);
      cm = table.get('columnMenu');
      assert.strictEqual(cm.getChildren().length, 2);

      column._cache.statistics = true;
      column._cache.sortable = false;
      table._showColumnMenu(column, cell, target, coords);
      cm = table.get('columnMenu');
      assert.strictEqual(cm.getChildren().length, 1);

      column._cache.statistics = false;
      column._cache.sortable = false;
      table._showColumnMenu(column, cell, target, coords);
      cm = table.get('columnMenu');
      assert.strictEqual(cm, null);
    });

    // bdd.it('tests _getColumnStats method', function() {
    //   var fieldName = "POP2000";
    //   var table = new _FeatureTable({
    //     nls: nls
    //   });
    //   table._getLayerFilterExpression = function() {
    //     return "1=1";
    //   };
    //   table.layerInfo = {};
    //   table.layerInfo.getUrl = function() {
    //     return "http://services2.arcgis.com/K1Xet5rYYN1SOWtq/ArcGIS/rest/services/USA_hostingFS/FeatureServer/0";
    //   };

    //   return table._getColumnStats(fieldName).then(function(attributes) {
    //     assert.strictEqual(attributes !== null, true);
    //     assert.strictEqual(isFinite(attributes.avgField), true);
    //     assert.strictEqual(isFinite(attributes.countField), true);
    //     assert.strictEqual(isFinite(attributes.maxField), true);
    //     assert.strictEqual(isFinite(attributes.minField), true);
    //     assert.strictEqual(isFinite(attributes.stddevField), true);
    //     assert.strictEqual(isFinite(attributes.sumField), true);
    //   });
    // });

    // bdd.it('tests _showStatisticsPopup method', function() {
    //   var fieldName = "POP2000";
    //   var table = new _FeatureTable({
    //     nls: nls
    //   });
    //   // table.nls = nls;
    //   table._getLayerFilterExpression = function() {
    //     return "1=1";
    //   };
    //   table.layerInfo = {};
    //   table.layerInfo.getUrl = function() {
    //     return "http://services2.arcgis.com/K1Xet5rYYN1SOWtq/ArcGIS/rest/services/USA_hostingFS/FeatureServer/0";
    //   };

    //   return table._getColumnStats(fieldName).then(function(attributes) {
    //     table._showStatisticsPopup(fieldName, attributes);
    //     var popup = table._statisticsPopup;
    //     var hasClass = html.hasClass(popup.domNode, 'esri-feature-table-dialog');

    //     assert.strictEqual(hasClass, true);
    //   });
    // });

    bdd.it('tests startQuery', function() {
      var table = new _FeatureTable({
        nls: nls
      });
      // table.nls = nls;
      table.layerInfo = {
        isTable: true
      };
      table.tableCreated = true;
      table._getLayerObject = function() {
        var def = new Deferred();
        def.resolve({});
        return def;
      };
      table._relatedQuery = false;
      table.cancelThread = sinon.spy();
      table._doQuery = sinon.spy();
      table.startQuery();

      assert.strictEqual(table.cancelThread.called, true);
      assert.strictEqual(table._doQuery.called, false);

      table._relatedQuery = true;
      table._doQuery = sinon.spy();
      table.startQuery();
      assert.strictEqual(table._doQuery.called, true);
    });

    bdd.it('test queryRecordsByRelationship', function() {
      var table = new _FeatureTable({
        nls: nls
      });
      // table.nls = nls;
      table._getLayerObject = function() {
        var def = new Deferred();
        def.resolve({});
        return def;
      };
      table.queryExecute = sinon.spy();
      table._getOutFieldsFromLayerInfos = function() {};
      table.queryRecordsByRelationship({
        layer: {
          queryRelatedFeatures: function() {
            var def = new Deferred();
            def.resolve({
              '1229': {
                features: [{}]
              }
            });
            return def;
          }
        },
        selectedIds: [1],
        relationship: {},
        relatedOriginalInfo: {
          layerObject: {
            url: "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSPetro/MapServer/1"
          }
        }
      });
      assert.strictEqual(!!table.relationship, true);
      assert.strictEqual(!!table.relatedOriginalInfo, true);
      assert.strictEqual(!!table.queryExecute.called, true);

      table.queryExecute = sinon.spy();
      table._removeTable = sinon.spy();
      table._relatedQueryIds = null;
      table.queryRecordsByRelationship({
        layer: {
          queryRelatedFeatures: function() {
            var def = new Deferred();
            def.reject({
              '1229': {
                features: []
              }
            });
            return def;
          }
        },
        selectedIds: [1],
        relationship: {},
        relatedOriginalInfo: {
          layerObject: {
            url: "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSPetro/MapServer/1"
          }
        }
      });
      assert.strictEqual(!!table.queryExecute.called, false);
      assert.strictEqual(!!table._removeTable.called, true);

      table.queryExecute = sinon.spy();
      table._removeTable = sinon.spy();
      table._relatedQueryIds = null;
      table.queryRecordsByRelationship({
        layer: {
          queryRelatedFeatures: function() {
            var def = new Deferred();
            def.resolve({
              '1229': {
                features: []
              }
            });
            return def;
          }
        },
        selectedIds: [1],
        relationship: {},
        relatedOriginalInfo: {
          layerObject: {
            url: "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSPetro/MapServer/1"
          }
        }
      });
      assert.strictEqual(!!table.queryExecute.called, false);
      assert.strictEqual(!!table._removeTable.called, true);
    });

    bdd.it('test _removeTable', function() {
      var table = new _FeatureTable({
        nls: nls
      });
      // table.nls = nls;
      table.grid = {
        domNode: {},
        destroy: sinon.spy()
      };
      table.footer = html.create('div');

      table._removeTable();
      assert.strictEqual(table.grid, null);
      assert.strictEqual(table.footer, null);
    });

    bdd.it('test _onFeaturelayerClick', function() {
      var table = new _FeatureTable({
        nls: nls
      });
      // table.nls = nls;

      table.actived = false;
      table._getIndexOfIdInGrid = sinon.spy();
      table._onFeaturelayerClick(null);
      assert.strictEqual(table._getIndexOfIdInGrid.called, false);
      table.actived = true;
      table._getIndexOfIdInGrid = sinon.spy();
      table._onFeaturelayerClick(null);
      assert.strictEqual(table._getIndexOfIdInGrid.called, false);


      var evt = {
        graphic: {
          attributes: {
            'OBJECTID': 555
          } //,
        }
      };
      table.actived = true;
      var result = {
        then: sinon.spy()
      };
      table._getIndexOfIdInGrid = function() {
        return result;
      };
      table.layer = {
        objectIdField: 'OBJECTID'
      };
      table._onFeaturelayerClick(evt);
      assert.strictEqual(result.then.called, false);


      table.layer = {
        objectIdField: 'OBJECTID'
      };
      evt = {
        graphic: {
          attributes: {
            'OBJECTID': 555
          },
          _layer: table.layer
        }
      };
      table.actived = true;
      table.syncWithMapInfoWindow = sinon.spy();
      table.grid = {
        select: sinon.spy(),
        scrollTo: sinon.spy()
      };
      table.map = {
        infoWindow: {
          features: [],
          select: sinon.spy(),
          getSelectedFeature: sinon.spy()
        }
      };
      var event = new Evented();
      lang.mixin(table.map.infoWindow, event);

      result = {
        then: sinon.spy()
      };
      table._getIndexOfIdInGrid = function() {
        // return result;
        var def = new Deferred();
        def.resolve(111);
        return def;
      };
      table._onFeaturelayerClick(evt);
      assert.strictEqual(table.grid.select.called, true);
      assert.strictEqual(table.grid.scrollTo.called, true);
      assert.strictEqual(table.map.infoWindow.select.called, true);
      on.emit(table.map.infoWindow, 'selection-change');
      assert.strictEqual(table.map.infoWindow.getSelectedFeature.called, true);
      // assert.strictEqual(table.grid.select.called, true);
    });

    bdd.it('test createToolbar', function() {
      var table = new _FeatureTable({
        nls: nls
      });
      // table.own(on)
      // on(table, 'data-loaded')
      assert.strictEqual(!!table.refreshButton, true);
      table.changeToolbarStatus = sinon.spy();
      on.emit(table, 'data-loaded', {});
      assert.strictEqual(table.changeToolbarStatus.called, true);
      table.changeToolbarStatus = sinon.spy();
      on.emit(table, 'row-click', {});
      assert.strictEqual(table.changeToolbarStatus.called, true);
      table.changeToolbarStatus = sinon.spy();
      on.emit(table, 'clear-selection', {});
      assert.strictEqual(table.changeToolbarStatus.called, true);
    });

    bdd.it('test onShowRelatedRecordsClick', function() {
      var table = new _FeatureTable({
        nls: nls,
        layerInfo: {
          id: 'aaa'
        }
      });

      on(table, 'show-related-records', function(evt) {
        assert.strictEqual(evt.layerInfoId, 'aaa');
      });
      table.onShowRelatedRecordsClick({
        layerInfoId: 'bbb'
      });
    });

    bdd.it('test onToggleColumnsClick', function() {
      var table = new _FeatureTable({
        nls: nls,
        layerInfo: {
          id: 'aaa'
        }
      });
      table.toggleColumns = sinon.spy();

      on(table, 'toggle-columns', function(evt) {
        assert.strictEqual(evt.layerInfoId, 'aaa');
        assert.strictEqual(table.toggleColumns.called, true);
      });
      table.onToggleColumnsClick({
        layerInfoId: 'bbb'
      });
    });

    bdd.it('test onExportCSVClick', function() {
      var table = new _FeatureTable({
        nls: nls,
        layerInfo: {
          id: 'aaa'
        }
      });
      // table.toggleColumns = sinon.spy();

      on(table, 'export-csv', function(evt) {
        assert.strictEqual(evt.layerInfoId, 'aaa');
      });
      table.onExportCSVClick({
        layerInfoId: 'bbb'
      });
    });

    bdd.it('test changeToolbarStatus', function() {
      var table = new _FeatureTable({
        nls: nls
      });

      table.changeToolbarStatus();
      assert.strictEqual(table.showSelectedRecordsMenuItem.get('disabled'), true);

      table.tableCreated = true;
      table.showSelected = true;
      table.getSelectedRows = function() {
        return [112];
      };
      table.layerInfo = {
        isShowInMap: function() {
          return true;
        }
      };
      table.changeToolbarStatus();
      assert.strictEqual(table.showSelectedRecordsMenuItem.get('label'), nls.showAllRecords);
      assert.strictEqual(table.showSelectedRecordsMenuItem.get('disabled'), false);
      assert.strictEqual(table.clearSelectionButton.get('disabled'), false);
      assert.strictEqual(table.zoomButton.get('disabled'), false);
    });

    bdd.it('test toggleSelectedRecords', function() {
      var table = new _FeatureTable({
        nls: nls
      });
      table.tableCreated = true;
      table._relatedQuery = true;
      table.showSelected = false;
      table.layerInfo = {
        isTable: false,
        id: 'id111'
      };
      // debugger;
      table.matchingCheckBox.set('checked', false);
      table._onMatchingCheckBoxChange = sinon.spy();
      table.startQuery = sinon.spy();
      var handle = on(table, 'show-all-records', function(evt) {
        assert.strictEqual(evt.layerInfoId, 'id111');
      });
      table.toggleSelectedRecords();
      assert.strictEqual(table.matchingCheckBox.get('checked'), true);
      assert.strictEqual(table.startQuery.called, false);
      handle.remove();

      table._relatedQuery = false;
      table.showSelected = true;
      table.showAllSelectedRecords = sinon.spy();
      table.showSelectedRecords = sinon.spy();
      handle = on(table, 'show-all-records', function(evt) {
        assert.strictEqual(evt.layerInfoId, 'id111');
      });
      table.toggleSelectedRecords();
      assert.strictEqual(table.showAllSelectedRecords.called, true);
      assert.strictEqual(table.showSelectedRecords.called, false);
      handle.remove();

      // debugger;
      table._relatedQuery = false;
      table.showSelected = false;
      table.showAllSelectedRecords = sinon.spy();
      table.showSelectedRecords = sinon.spy();
      handle = on(table, 'show-selected-records', function(evt) {
        assert.strictEqual(evt.layerInfoId, 'id111');
      });
      table.toggleSelectedRecords();
      assert.strictEqual(table.showAllSelectedRecords.called, false);
      assert.strictEqual(table.showSelectedRecords.called, true);
      handle.remove();
    });

    bdd.it('test _onMatchingCheckBoxChange', function() {
      var table = new _FeatureTable({
        nls: nls
      });

      table.startQuery = sinon.spy();
      table._relatedQuery = false;
      table.tableCreated = true;
      table._onMatchingCheckBoxChange(false);
      assert.strictEqual(table.startQuery.called, true);

      table._relatedQuery = true;
      table._requestStatus = "fulfilled";
      table.tableCreated = true;
      table.startQuery = sinon.spy();
      table.layer = {
        objectIdField: 'OBJECTID'
      };
      table.grid = {
        store: {
          data: [{
            'OBJECTID': 0
          }, {
            'OBJECTID': 1
          }]
        }
      };
      table._onMatchingCheckBoxChange(true);
      assert.strictEqual(table.startQuery.called, true);
      assert.strictEqual(table.queryByStoreObjectIds.length, 2);

      table._relatedQuery = true;
      table._requestStatus = "fulfilled";
      table.tableCreated = true;
      table._relatedQueryIds = [0,1];
      table.queryRecordsByRelationship = sinon.spy();
      table.startQuery = sinon.spy();
      table.relatedOriginalInfo = {
        layerObject: null
      };
      table._onMatchingCheckBoxChange(false);
      assert.strictEqual(table.startQuery.called, false);
      assert.strictEqual(table.queryRecordsByRelationship.called, true);
    });
  });

  bdd.describe('tests methods of _ResourceManager', function() {
    bdd.it('test getQueryTable', function() {
      var table = new _FeatureTable({
        nls: nls
      });
      // table.nls = nls;

      var rm = new _ResourceManager();
      rm.nls = nls;
      var tabId = "t1";
      rm.featureTableSet = {};
      rm._getConfigInfoById = function() {
        return {
          layer: {}
        };
      };
      // rm.addConfigInfo = function(){};
      rm._getQueryTableInfo = function() {
        var def = new Deferred();

        def.resolve({
          layerInfo: {},
          layerObject: {
            feilds: [{}]
          },
          tableInfo: {
            isSupportQuery: true
          }
        });

        return def;
      };
      return rm.getQueryTable(tabId, false).then(function(result) {
        // assert.strictEqual(rm._getConfigInfoById.called, false);
        assert.strictEqual(result.isSupportQuery, true);
        assert.strictEqual(result.table instanceof _FeatureTable, true);
      }).then(function() {
        rm._getConfigInfoById = sinon.spy();
        rm._getQueryTableInfo = sinon.spy();
        return rm.getQueryTable(tabId, false).then(function(result) {
          assert.strictEqual(rm._getConfigInfoById.called, false);
          assert.strictEqual(rm._getQueryTableInfo.called, false);
          assert.strictEqual(result.isSupportQuery, true);
          assert.strictEqual(result.table instanceof _FeatureTable, true);
        });
      }).then(function() {
        rm._getQueryTableInfo = function() {
          var def = new Deferred();

          setTimeout(function() {
            def.resolve({
              layerInfo: {},
              layerObject: {
                feilds: [{}]
              },
              tableInfo: {
                isSupportQuery: true
              }
            });
          }, 10);

          return def;
        };

        var f1 = new _FeatureTable({
          nls: nls
        });
        var d = rm.getQueryTable('t2', false).then(function(result) {
          assert.strictEqual(rm._getConfigInfoById.called, false);
          assert.strictEqual(result.isSupportQuery, true);
          assert.strictEqual(result.table, f1);
        });
        rm.featureTableSet = {
          't2': f1
        };

        return d;
      });
    });
  });

  bdd.describe('tests methods of AttributeTable widget', function() {
    var wm, map;
    bdd.before(function() {
      wm = TestWidgetManager.getInstance();
      map = TestWidgetManager.getDefaultMap();
      map.setExtent = function() {};
      wm.prepare('theme1', map);
    });

    bdd.beforeEach(function() {
      // wm.destroyWidget('attributetable1');
      window.apiUrl = "//js.arcgis.com/3.16/";
      var d = registry.byId('attributetable1');
      if (d && d.destroy) {
        d.destroyRecursive();
      }
      attrUtils.readLayerInfosObj = function() {
        var def = new Deferred();
        def.resolve(null);
        return def;
      };
    });

    bdd.it('test setActiveTable', function() {
      return wm.loadWidget(widgetJson).then(function(widget) {
        var table1 = new _FeatureTable({
          nls: nls
        });
        table1.startQuery = sinon.spy();
        var unbind = widget._unbindActiveTableEvents;
        widget._unbindActiveTableEvents = sinon.spy();
        widget.setActiveTable(table1, {
          h: 300
        });
        assert.strictEqual(widget._unbindActiveTableEvents.called, false);
        assert.strictEqual(widget._activeTableHandles.length, 3);
        assert.strictEqual(table1.startQuery.called, true);

        var table2 = new _FeatureTable({
          nls: nls
        });
        table2.startQuery = sinon.spy();
        widget._unbindActiveTableEvents = unbind;
        widget.setActiveTable(null, {
          h: 300
        });
        assert.strictEqual(widget._activeTableHandles.length, 0);
      });
    });

    bdd.it('test _startQueryOnRelationTab', function() {
      return wm.loadWidget(widgetJson).then(function(widget) {
        var infoId = "BuildingInterior_8130";
        var relationShipKey = "BuildingInterior_3512_EmployeeInfo_0";
        var selectedIds = [202];
        var originalInfoId = "BuildingInterior_3512";

        widget._resourcemanager = {
          getLayerInfoById: function() {
            return null;
          }
        };
        var result = widget._startQueryOnRelationTab(infoId,
          relationShipKey, selectedIds, originalInfoId);
        assert.strictEqual(typeof result, 'undefined');
      });
    });

    bdd.it('test _startQueryOnRelationTab', function() {
      return wm.loadWidget(widgetJson).then(function(widget) {
        var infoId = "BuildingInterior_8130";
        var relationShipKey = "BuildingInterior_3512_EmployeeInfo_0";
        var selectedIds = [202];
        var originalInfoId = "BuildingInterior_3512";

        widget._resourceManager = {
          getLayerInfoById: function() {
            return {
              layerObject: {}
            };
          },
          getRelationTable: function() {
            var def = new Deferred();
            def.resolve({
              isSupportQuery: true,
              table: {
                getParent: function() {
                  return {};
                },
                placeAt: function() {}
              }
            });
            return def;
          },
          empty: function() {}
        };
        widget.getExistLayerTabPage = function() {
          return {};
        };
        widget.setActiveTable = sinon.spy();
        widget._activeTable = {
          changeToolbarStatus: sinon.spy()
        };
        widget._activeLayerInfoId = "";
        widget._startQueryOnRelationTab(infoId,
          relationShipKey, selectedIds, originalInfoId);
        assert.strictEqual(widget.setActiveTable.called, false);
        assert.strictEqual(widget._activeTable.changeToolbarStatus.called, false);

        widget._activeLayerInfoId = infoId;
        widget._startQueryOnRelationTab(infoId,
          relationShipKey, selectedIds, originalInfoId);
        assert.strictEqual(widget.setActiveTable.called, true);
        assert.strictEqual(widget._activeTable.changeToolbarStatus.called, false);

        widget._resourceManager = {
          getLayerInfoById: function() {
            return {
              layerObject: {}
            };
          },
          getRelationTable: function() {
            var def = new Deferred();
            def.resolve({
              isSupportQuery: false,
              table: {
                getParent: function() {
                  return {};
                },
                placeAt: function() {}
              }
            });
            return def;
          },
          empty: function() {}
        };
        widget.getExistLayerTabPage = function() {
          return {
            set: function() {}
          };
        };
        widget.setActiveTable = sinon.spy();
        widget._activeTable = {
          changeToolbarStatus: sinon.spy()
        };
        widget._activeLayerInfoId = infoId;
        widget._startQueryOnRelationTab(infoId,
          relationShipKey, selectedIds, originalInfoId);
        assert.strictEqual(widget.setActiveTable.called, false);
        assert.strictEqual(widget._activeTable.changeToolbarStatus.called, true);
      });
    });

    bdd.it('test tabChanged', function() {
      return wm.loadWidget(widgetJson).then(function(widget) {
        var id = "BuildingInterior_8130";

        widget.tabContainer = {
          selectedChildWidget: {
            params: {
              layerType: "FeatureLayerTable",
              paneId: id
                // relKey: ""
            }
          }
        };
        widget.setActiveTable = function() {};
        widget._startQueryOnLayerTab = sinon.spy();
        widget._startQueryOnRelationTab = sinon.spy();
        widget.tabChanged();
        assert.strictEqual(widget._startQueryOnLayerTab.called, true);
        assert.strictEqual(widget._startQueryOnRelationTab.called, false);

        widget.tabContainer = {
          selectedChildWidget: {
            params: {
              layerType: "RelationshipTable",
              paneId: id
                // relKey: ""
            }
          },
          destroy: function() {}
        };
        widget.setActiveTable = function() {};
        widget._startQueryOnLayerTab = sinon.spy();
        widget._startQueryOnRelationTab = sinon.spy();
        widget.tabChanged();
        assert.strictEqual(widget._startQueryOnLayerTab.called, false);
        assert.strictEqual(widget._startQueryOnRelationTab.called, true);

        widget.tabContainer = {
          selectedChildWidget: {
            params: {
              layerType: "FeatureLayerTable",
              paneId: id,
              // relKey: ""
              oids: []
            }
          },
          destroy: function() {}
        };
        widget.setActiveTable = function() {};
        widget._startQueryOnLayerTab = sinon.spy();
        widget._startQueryOnRelationTab = sinon.spy();
        widget._activeLayerInfoId = id;
        widget.tabChanged();
        assert.strictEqual(widget._startQueryOnLayerTab.called, true);
        assert.strictEqual(widget._startQueryOnRelationTab.called, false);
      });
    });

    bdd.it('test addNewRelationTab', function() {
      return wm.loadWidget(widgetJson).then(function(widget) {
        var oids = [202];
        var relationShip = {
          shipInfo: {
            id: "BuildingInterior_8130",
            "title": 'title'
          },
          _relKey: "BuildingInterior_3512_EmployeeInfo_0"
        };
        var originalInfoId = "BuildingInterior_3512";
        var page = {
          params: {}
        };

        widget.tabContainer = {
          selectChild: sinon.spy(),
          addChild: sinon.spy(),
          destroy: function() {}
        };
        widget.getExistLayerTabPage = function() {
          return page;
        };
        widget.addNewRelationTab(oids, relationShip, originalInfoId);
        assert.strictEqual(page.params.oids, oids);
        assert.strictEqual(widget.tabContainer.selectChild.called, true);


        widget.getExistLayerTabPage = function() {
          // return page;
          return null;
        };
        widget._resourceManager.addConfigInfo = sinon.spy();
        widget._resourceManager.addLayerInfo = sinon.spy();
        widget.addNewRelationTab(oids, relationShip, originalInfoId);
        assert.strictEqual(widget.tabContainer.addChild.called, true);
        assert.strictEqual(widget.tabContainer.selectChild.called, true);
      });
    });

    bdd.it('test setActiveTable', function() {
      return wm.loadWidget(widgetJson).then(function(widget) {
        widget._activeTable = {
          cancelThread: sinon.spy(),
          deactive: sinon.spy()
        };
        var table = new _FeatureTable({
          nls: nls
        });
        table.active = sinon.spy();
        table.changeHeight = sinon.spy();
        table.startQuery = sinon.spy();
        table.queryRecordsByRelationship = sinon.spy();
        table.changeToolbarStatus = sinon.spy();

        widget.setActiveTable(table, {});
        assert.strictEqual(table.active.called, true);
        assert.strictEqual(table.changeHeight.called, true);
        assert.strictEqual(table.startQuery.called, true);
        assert.strictEqual(table.queryRecordsByRelationship.called, false);
        assert.strictEqual(table.changeToolbarStatus.called, true);


        table.active = sinon.spy();
        table.changeHeight = sinon.spy();
        table.startQuery = sinon.spy();
        table.queryRecordsByRelationship = sinon.spy();
        table.changeToolbarStatus = sinon.spy();

        widget.setActiveTable(table, {
          layer: {},
          selectedIds: []
        });
        assert.strictEqual(table.active.called, true);
        assert.strictEqual(table.changeHeight.called, true);
        assert.strictEqual(table.startQuery.called, false);
        assert.strictEqual(table.queryRecordsByRelationship.called, true);
        assert.strictEqual(table.changeToolbarStatus.called, true);
      });
    });
  });
});