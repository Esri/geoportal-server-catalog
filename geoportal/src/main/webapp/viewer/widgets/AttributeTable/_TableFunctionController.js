///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Esri. All Rights Reserved.
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
  'dojo/_base/lang',
  'dojo/Evented',
  'dojo/_base/html',
  'dojo/on',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/Toolbar',
  'dijit/form/Button',
  'dijit/DropDownMenu',
  'dijit/MenuItem',
  'dijit/form/ToggleButton',
  'dijit/form/DropDownButton',
  'jimu/dijit/Popup',
  'jimu/dijit/Filter',
  'jimu/dijit/Message',
  './_FeatureTable',
  './_RelationshipTable'
  ], function(declare, lang, Evented, html, on,
    _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    Toolbar, Button, DropDownMenu, MenuItem, ToggleButton, DropDownButton,
    Popup, Filter, Message,
    _FeatureTable, _RelationshipTable) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
      templateString: '<div></div>',
      _handlers: [],
      _resourceManager: null,

      zoomButton: null,
      exportButton: null,
      selectionMenu: null,
      refreshButton: null,
      matchingCheckBox: null,
      matchingMap: true,
      nls: null,

      // public events
      //show-selected-records
      //show-related-records
      //show-filter
      //toggle-columns
      //export-csv
      //filter-by-mapextent
      //zoom-to
      //clear-selection
      //click-refresh
      //click-close

      postCreate: function() {
        var toolbar = new Toolbar({}, html.create("div"));

        var menus = new DropDownMenu();

        this.showSelectedRecords = new MenuItem({
          label: this.nls.showSelectedRecords,
          iconClass: "esriAttributeTableSelectPageImage",
          onClick: lang.hitch(this, this._showSelectedRecords)
        });
        menus.addChild(this.showSelectedRecords);

        this.showRelatedRecords = new MenuItem({
          label: this.nls.showRelatedRecords,
          iconClass: "esriAttributeTableSelectAllImage",
          onClick: lang.hitch(this, this._showRelatedRecords)
        });
        menus.addChild(this.showRelatedRecords);

        this.filter = new MenuItem({
          label: this.nls.filter,
          iconClass: "esriAttributeTableFilterImage",
          onClick: lang.hitch(this, this._showFilter)
        });
        menus.addChild(this.filter);

        this.columns = new MenuItem({
          label: this.nls.columns,
          iconClass: "esriAttributeTableColumnsImage",
          onClick: lang.hitch(this, this._toggleColumns)
        });
        menus.addChild(this.columns);

        if (!this.hideExportButton) {
          // always set exportButton to true
          this.exportButton = new MenuItem({
            label: this.nls.exportFiles,
            showLabel: true,
            iconClass: "esriAttributeTableExportImage",
            onClick: lang.hitch(this, this._onExportFiles)
          });
          menus.addChild(this.exportButton);
        }

        this.selectionMenu = new DropDownButton({
          label: this.nls.options,
          iconClass: "esriAttributeTableOptionsImage",
          dropDown: menus
        });
        toolbar.addChild(this.selectionMenu);

        this.matchingCheckBox = new ToggleButton({
          checked: this.filterByMapExtent ? true : false,
          showLabel: true,
          label: this.nls.filterByExtent,
          onChange: lang.hitch(this, function(status) {
            this.matchingMap = status;
            if (this.activeTable) {
              this.activeTable.cancelThread();
              this.activeTable.set('matchingMap', status);
              this.activeTable.startQuery();
            }
          })
        });
        this.matchingMap = this.filterByMapExtent;
        toolbar.addChild(this.matchingCheckBox);

        this.zoomButton = new Button({
          label: this.nls.zoomto,
          iconClass: "esriAttributeTableZoomImage",
          onClick: lang.hitch(this, this._zoomTo)
        });
        toolbar.addChild(this.zoomButton);

        var clearSelectionButton = new Button({
          label: this.nls.clearSelection,
          iconClass: "esriAttributeTableClearImage",
          onClick: lang.hitch(this, this._clearSelection, false)
        });
        toolbar.addChild(clearSelectionButton);

        this.refreshButton = new Button({
          label: this.nls.refresh,
          showLabel: true,
          iconClass: "esriAttributeTableRefreshImage",
          onClick: lang.hitch(this, this._refresh)
        });
        toolbar.addChild(this.refreshButton);

        this.closeButton = new Button({
          title: this.nls.closeMessage,
          iconClass: "esriAttributeTableCloseImage",
          onClick: lang.hitch(this, this._onCloseBtnClicked)
        });
        html.addClass(this.closeButton.domNode, 'close-button');
        toolbar.addChild(this.closeButton);

        html.place(toolbar.domNode, this.domNode);
        toolbar.startup();

        this.inherited(arguments);
      },

      startup: function() {
        this.resetButtonStatus();
      },

      setResourceManager: function(m) {
        this._resourceManager = m;
      },

      setMap: function(map) {
        this.map = map;
      },

      active: function() {
        if (this.activeTable) {
          this.activeTable.active();
        }
      },

      deactive: function() {
        if (this.activeTable) {
          this.activeTable.deactive();
        }
      },

      setActiveTable: function(table, options) {
        if (this.activeTable) {
          this.activeTable.cancelThread();
          this.activeTable.deactive();
          this._unbindEvent();
        }
        if (table) {
          this.activeTable = table;
          this.activeTable.active();
          this.activeTable.changeHeight(options.h);
          if (this.matchingMap || // matchingMap is enabled
            (!this.matchingMap && this.activeTable.matchingMap) ||
            !this.activeTable.tableCreated ||
            this.activeTable instanceof _RelationshipTable) {
            this.activeTable.set('matchingMap', this.matchingMap);
            this.activeTable.startQuery(options);
          }
          this._bindEvent();
          this.checkMapInteractiveFeature();
        }

        this.resetButtonStatus();
      },

      getActiveTable: function() {
        return this.activeTable;
      },

      changeHeight: function(h) {
        if (this.activeTable) {
          this.activeTable.changeHeight(h);
        }
      },

      checkMapInteractiveFeature: function() {
        if (!this.activeTable) {
          return;
        }
        var currentFeatureTable = this.activeTable;
        var currentLayerInfo = this.activeTable.layerInfo;
        if (!currentLayerInfo) {
          return;
        }

        if (currentLayerInfo.isShowInMap()) {
          if (currentFeatureTable) {
            currentFeatureTable.showGraphic();
          }
          var selectionRows = currentFeatureTable.getSelectedRows();
          if (selectionRows && selectionRows.length > 0) {
            this.zoomButton.set('disabled', false);
          } else {
            this.zoomButton.set('disabled', true);
          }
        } else {
          if (currentFeatureTable) {
            currentFeatureTable.hideGraphic();
          }
          this.zoomButton.set('disabled', true);
        }

      },

      resetButtonStatus: function() {
        var table = this.activeTable;
        if (!table) {
          this.showSelectedRecords.set('disabled', true);
          this.showRelatedRecords.set('disabled', true);
          this.matchingCheckBox.set('disabled', true);
          this.filter.set('disabled', true);
          this.columns.set('disabled', true);
          if (!this.hideExportButton) {
            this.exportButton.set('disabled', true);
          }
          this.zoomButton.set('disabled', true);
          return;
        }

        var selectionRows = table.getSelectedRows();
        if (table.showSelected) {
          this.showSelectedRecords.set('label', this.nls.showAllRecords);
        } else {
          this.showSelectedRecords.set('label', this.nls.showSelectedRecords);
        }
        if (table.tableCreated && selectionRows && selectionRows.length > 0) {
          this.showSelectedRecords.set('disabled', false);
        } else {
          this.showSelectedRecords.set('disabled', true);
        }

        this.showRelatedRecords.set('disabled', true);
        if (lang.getObject('layerInfo', false, table) &&
          table instanceof _FeatureTable && table.isSupportQueryToServer() &&
          selectionRows && selectionRows.length > 0) {
          if (this._relatedDef && !this._relatedDef.isFulfilled()) {
            this._relatedDef.cancel();
          }

          var resDef = table.layerInfo.getRelatedTableInfoArray();
          this._relatedDef = resDef;
          resDef.then(lang.hitch(this, function(tableInfos) {
            if (!this.domNode) {
              return;
            }
            var selectionRows = table.getSelectedRows();
            if (table.tableCreated && tableInfos && tableInfos.length > 0 &&
              selectionRows && selectionRows.length > 0) {
              this.showRelatedRecords.set('disabled', false);
            }
          }));
        }

        if (table.tableCreated &&
          table instanceof _FeatureTable && table.isSupportQueryToServer()) {
          this.filter.set('disabled', false);
        } else {
          this.filter.set('disabled', true);
        }

        if (table instanceof _FeatureTable) {
          this.matchingCheckBox.set('disabled', false);
        } else {
          this.matchingCheckBox.set('disabled', true);
        }

        if (table.tableCreated) {
          this.columns.set('disabled', false);
        } else {
          this.columns.set('disabled', true);
        }

        if (!this.hideExportButton) {
          if (selectionRows && selectionRows.length > 0) {
            this.exportButton.set('label', this.nls.exportSelected);
          } else {
            this.exportButton.set('label', this.nls.exportAll);
          }
          var hasStore = table.tableCreated;
          if (hasStore) {
            this.exportButton.set('disabled', false);
          } else {
            this.exportButton.set('disabled', true);
          }
        }

        if (table.tableCreated && table instanceof _FeatureTable &&
          selectionRows && selectionRows.length > 0) {
          var currentLayerInfo = table.layerInfo;
          if (currentLayerInfo.isShowInMap()) {
            this.zoomButton.set('disabled', false);
          } else {
            this.zoomButton.set('disabled', true);
          }
        } else {
          this.zoomButton.set('disabled', true);
        }
      },

      destroy: function() {
        this._unbindEvent();
        this.activeTable = null;
        this.zoomButton = null;
        this.exportButton = null;
        this.selectionMenu = null;
        this.refreshButton = null;
        this.matchingCheckBox = null;
        this.nls = null;

        if (this._filterPopup && this._filterPopup.domNode) {
          this._filterPopup.close();
          this._filterPopup = null;
        }

        this.inherited(arguments);
      },

      _bindEvent: function() {
        this._handlers.push(on(
          this.activeTable,
          'data-loaded',
          lang.hitch(this, '_onTableDataLoaded')));
        this._handlers.push(on(
          this.activeTable,
          'row-click',
          lang.hitch(this, '_onTableRowClick')));
        this._handlers.push(on(this.activeTable,
          'clear-selection',
          lang.hitch(this, '_onTableClearSelection')));
      },

      _unbindEvent: function() {
        while(this._handlers.length > 0) {
          var h = this._handlers.pop();
          if (h && h.remove) {
            h.remove();
          }
        }
      },

      _onTableDataLoaded: function() {
        this.resetButtonStatus();
      },

      _onTableRowClick: function() {
        this.resetButtonStatus();

        var tables = this._resourceManager.featureTableSet;
        for (var p in tables) {
          var t = tables[p];
          if (t !== this.activeTable) {
            t.clearSelection(false);
          }
        }
      },

      _onTableClearSelection: function() {
        this.resetButtonStatus();
      },

      _showSelectedRecords: function() {
        if (this.activeTable) {
          this.activeTable.toggleSelectedRecords();
          if (this.activeTable.showSelected) {
            this.showSelectedRecords.set('label', this.nls.showAllRecords);
          } else {
            this.showSelectedRecords.set('label', this.nls.showSelectedRecords);
          }
        }

        this.emit('show-selected-records', {
          layerInfoId: lang.getObject('layerInfo.id', false, this.activeTable) ?
            this.activeTable.layerInfo.id : null
        });
      },

      _showRelatedRecords: function() {
        this.emit('show-related-records', {
          layerInfoId: lang.getObject('layerInfo.id', false, this.activeTable) ?
            this.activeTable.layerInfo.id : null,
          objectIds: this.activeTable ? this.activeTable.getSelectedRows() : null
        });
      },

      _showFilter: function() {
        if (this.activeTable) {
          this.activeTable.showRefreshing(true);
          this.activeTable.getLayerDefinition()
          .then(lang.hitch(this, function(definition) {
            if (!this.domNode) {
              return;
            }
            definition = lang.clone(definition);
            var table = this.activeTable;

            var fFields = table.getFilterableFields();
            definition.fields = fFields;

            var filter = new Filter({
              noFilterTip: this.nls.noFilterTip,
              style: "width:100%;margin-top:22px;"
            });
            this._filterPopup = new Popup({
              titleLabel: this.nls.filter,
              width: 720,
              height: 485,
              content: filter,
              buttons: [{
                label: this.nls.ok,
                onClick: lang.hitch(this, function() {
                  var partsObj = filter.toJson();
                  if (partsObj && partsObj.expr) {
                    table.setFilterObj(partsObj);
                    table.clearSelection(false);
                    table.startQuery();
                    this._filterPopup.close();
                    this._filterPopup = null;
                  } else {
                    new Message({
                      message: this.nls.setFilterTip
                    });
                  }
                })
              }, {
                label: this.nls.cancel
              }]
            });
            var filterObj = table.getFilterObj();
            if (filterObj) {
              filter.buildByFilterObj(table.layer.url, filterObj, definition);
            } else {
              filter.buildByExpr(table.layer.url, null, definition);
            }
          }), lang.hitch(this, function(err) {
            if (!this.domNode) {
              return;
            }
            console.error(err);
          })).always(lang.hitch(this, function() {
            this.activeTable.showRefreshing(false);
          }));
        }
        this.emit('show-filter', {
          layerInfoId: lang.getObject('layerInfo.id', false, this.activeTable) ?
            this.activeTable.layerInfo.id : null
        });
      },

      _toggleColumns: function() {
        if (this.activeTable) {
          this.activeTable.toggleColumns();
        }
        this.emit('toggle-columns', {
          layerInfoId: lang.getObject('layerInfo.id', false, this.activeTable) ?
            this.activeTable.layerInfo.id : null
        });
      },

      _onExportFiles: function() {
        if (this.activeTable) {
          var popup = new Message({
            message: this.nls.exportMessage,
            titleLabel: this.nls.exportFiles,
            autoHeight: true,
            buttons: [{
              label: this.nls.ok,
              onClick: lang.hitch(this, function() {
                this._exportToCSV();
                popup.close();
              })
            }, {
              label: this.nls.cancel
            }]
          });
        }
        this.emit('export-csv', {
          layerInfoId: lang.getObject('layerInfo.id', false, this.activeTable) ?
            this.activeTable.layerInfo.id : null
        });
      },

      _exportToCSV: function() {
        this.activeTable.exportToCSV();
      },

      _zoomTo: function() {
        if (this.activeTable) {
          this.activeTable.zoomTo();
        }
      },

      _clearSelection: function() {
        if (this.activeTable) {
          this.activeTable.clearSelection(true);
        }
      },

      _refresh: function() {
        if (this.activeTable) {
          this.activeTable.refresh();
        }
      },

      _onCloseBtnClicked: function() {
        this.emit('click-close');
      }
    });
  });