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
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/html",
    "dojo/_base/lang",
    "dojo/query",
    "dojo/on",
    "dojo/when",
    "esri/lang",
    "dijit/_WidgetsInTemplateMixin",
    "jimu/BaseWidgetSetting",
    "jimu/LayerInfos/LayerInfos",
    "../utils",
    "jimu/utils",
    "./QuerySourceSetting",
    "./LocatorSourceSetting",
    "jimu/dijit/CheckBox",
    "jimu/dijit/SimpleTable",
    "jimu/dijit/LoadingIndicator"
  ],
  function(
    declare, array, html, lang, query, on, when, esriLang,
    _WidgetsInTemplateMixin, BaseWidgetSetting, LayerInfos, utils, jimuUtils,
    QuerySourceSetting, LocatorSourceSetting, CheckBox, SimpleTable) {
    /*jshint maxlen: 150*/
    /*jshint smarttabs:true */

    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      baseClass: 'jimu-widget-search-setting',
      _currentSourceSetting: null,

      postCreate: function() {
        this.inherited(arguments);

        this.sourceList = new SimpleTable({
          autoHeight: false,
          selectable: true,
          fields: [{
            name: "name",
            title: this.nls.name,
            width: "auto",
            type: "text",
            editable: false
          }, {
            name: "actions",
            title: "",
            width: "70px",
            type: "actions",
            actions: ["up", "down", "delete"]
          }]
        }, this.sourceList);
        html.setStyle(this.sourceList.domNode, 'height', '100%');
        this.sourceList.startup();
        this.own(on(this.sourceList, 'row-select', lang.hitch(this, this._onSourceItemSelected)));
        this.own(on(this.sourceList, 'row-delete', lang.hitch(this, this._onSourceItemRemoved)));

        this.showInfoWindowOnSelect = new CheckBox({
          checked: true,
          label: this.nls.showInfoWindowOnSelect
        }, this.showInfoWindowOnSelect);
      },

      startup: function() {
        this.inherited(arguments);

        if (!(this.config && this.config.sources)) {
          this.config.sources = [];
        }

        this.shelter.show();

        LayerInfos.getInstance(this.map, this.map.itemInfo)
          .then(lang.hitch(this, function(layerInfosObj) {
            this.layerInfosObj = layerInfosObj;
            utils.setMap(this.map);
            utils.setLayerInfosObj(this.layerInfosObj);
            utils.setAppConfig(this.appConfig);
            when(utils.getConfigInfo(this.config)).then(lang.hitch(this, function(config) {
              if (!this.domNode) {
                return;
              }
              this.setConfig(config);
              this.shelter.hide();
            }));
          }));
      },

      setConfig: function(config) {
        this.config = config;
        var sources = config.sources;
        this.allPlaceholder.set('value', jimuUtils.stripHTML(this.config.allPlaceholder));
        this.showInfoWindowOnSelect.setValue(
          esriLang.isDefined(this.config.showInfoWindowOnSelect) ?
          !!this.config.showInfoWindowOnSelect : true);
        array.forEach(sources, lang.hitch(this, function(source, index) {
          var addResult = this.sourceList.addRow({
            name: source.name || ""
          });

          if (addResult && addResult.success) {
            this._setRelatedConfig(addResult.tr, source);

            if (index === 0) {
              var firstTr = addResult.tr;
              setTimeout(lang.hitch(this, function() {
                this.sourceList.selectRow(addResult.tr);
                firstTr = null;
              }), 100);
            }
          } else {
            console.error("add row failed ", addResult);
          }
        }));
      },

      getConfig: function() {
        if (this._currentSourceSetting) {
          this._closeSourceSetting();
        }
        var config = {
          allPlaceholder: jimuUtils.stripHTML(this.allPlaceholder.get('value')),
          showInfoWindowOnSelect: this.showInfoWindowOnSelect.checked
        };
        var trs = this.sourceList.getRows();
        var sources = [];
        array.forEach(trs, lang.hitch(this, function(tr) {
          var source = this._getRelatedConfig(tr);
          delete source._definition;
          this._removeRelatedConfig(tr);

          sources.push(source);
        }));

        config.sources = sources;
        return config;
      },

      destroy: function() {
        utils.setMap(null);
        utils.setLayerInfosObj(null);
        utils.setAppConfig(null);

        this.inherited(arguments);
      },

      _onAllPlaceholderBlur: function() {
        this.allPlaceholder.set('value', jimuUtils.stripHTML(this.allPlaceholder.get('value')));
      },

      _onMenuItemClick: function(evt) {
        // check fields
        if (this._currentSourceSetting && !this._currentSourceSetting.isValidConfig()) {
          this._currentSourceSetting.showValidationTip();
          return;
        }

        var itemType = evt && evt.target && html.getAttr(evt.target, "type");
        if (itemType === "locator") {
          this._addNewLocator();
        } else if (itemType === "query") {
          this._addNewQuerySource();
        }
      },

      _addNewLocator: function() {
        this._createNewLocatorSourceSettingFromMenuItem({}, {});
      },

      _addNewQuerySource: function() {
        this._createNewQuerySourceSettingFromMenuItem({}, {});
      },

      _setRelatedConfig: function(tr, source) {
        query(tr).data('config', lang.clone(source));
      },

      _getRelatedConfig: function(tr) {
        return query(tr).data('config')[0];
      },

      _removeRelatedConfig: function(tr) {
        return query(tr).removeData('config');
      },

      _createNewLocatorSourceSettingFromMenuItem: function(setting, definition) {
        var locatorSetting = new LocatorSourceSetting({
          nls: this.nls,
          map: this.map
        });
        locatorSetting.setDefinition(definition);
        locatorSetting.setConfig({
          url: setting.url || "",
          name: setting.name || "",
          singleLineFieldName: setting.singleLineFieldName || "",
          placeholder: setting.placeholder || "",
          countryCode: setting.countryCode || "",
          zoomScale: setting.zoomScale || 50000,
          maxSuggestions: setting.maxSuggestions || 6,
          maxResults: setting.maxResults || 6,
          searchInCurrentMapExtent: !!setting.searchInCurrentMapExtent,
          type: "locator"
        });
        locatorSetting._openLocatorChooser();

        locatorSetting.own(
          on(locatorSetting, 'select-locator-url-ok', lang.hitch(this, function(item) {
            var addResult = this.sourceList.addRow({
              name: item.name || "New Geocoder"
            }, this.sourceList.getRows().length);
            if (addResult && addResult.success) {
              if (this._currentSourceSetting) {
                this._closeSourceSetting();
              }
              locatorSetting.setRelatedTr(addResult.tr);
              locatorSetting.placeAt(this.sourceSettingNode);
              this.sourceList.selectRow(addResult.tr);

              this._currentSourceSetting = locatorSetting;
            }
          }))
        );
        locatorSetting.own(
          on(locatorSetting, 'reselect-locator-url-ok', lang.hitch(this, function(item) {
            var tr = this._currentSourceSetting.getRelatedTr();
            this.sourceList.editRow(tr, {
              name: item.name
            });
          }))
        );
        locatorSetting.own(
          on(locatorSetting, 'select-locator-url-cancel', lang.hitch(this, function() {
            if (this._currentSourceSetting !== locatorSetting) {// locator doesn't display in UI
              locatorSetting.destroy();
              locatorSetting = null;
            }
          }))
        );
      },

      _createNewLocatorSourceSettingFromSourceList: function(setting, definition, relatedTr) {
        if (this._currentSourceSetting) {
          this._closeSourceSetting();
        }

        this._currentSourceSetting = new LocatorSourceSetting({
          nls: this.nls,
          map: this.map
        });
        this._currentSourceSetting.setDefinition(definition);
        this._currentSourceSetting.setConfig({
          url: setting.url || "",
          name: setting.name || "",
          singleLineFieldName: setting.singleLineFieldName || "",
          placeholder: setting.placeholder || "",
          countryCode: setting.countryCode || "",
          zoomScale: setting.zoomScale || 50000,
          maxSuggestions: setting.maxSuggestions || 6,
          maxResults: setting.maxResults || 6,
          searchInCurrentMapExtent: !!setting.searchInCurrentMapExtent,
          enableLocalSearch: !!setting.enableLocalSearch,
          localSearchMinScale: setting.localSearchMinScale,
          localSearchDistance: setting.localSearchDistance,
          type: "locator"
        });
        this._currentSourceSetting.setRelatedTr(relatedTr);
        this._currentSourceSetting.placeAt(this.sourceSettingNode);

        this._currentSourceSetting.own(
          on(this._currentSourceSetting,
            'reselect-locator-url-ok',
            lang.hitch(this, function(item) {
              var tr = this._currentSourceSetting.getRelatedTr();
              this.sourceList.editRow(tr, {
                name: item.name
              });
            }))
        );
      },

      _closeSourceSetting: function() {
        var tr = this._currentSourceSetting.getRelatedTr();
        var source = this._currentSourceSetting.getConfig();
        source._definition = this._currentSourceSetting.getDefinition();
        this._setRelatedConfig(tr, source);
        this.sourceList.editRow(tr, {
          name: source.name
        });
        this._currentSourceSetting.destroy();
      },

      _createNewQuerySourceSettingFromMenuItem: function(setting, definition) {
        var querySetting = new QuerySourceSetting({
          nls: this.nls,
          map: this.map,
          appConfig: this.appConfig
        });
        querySetting.setDefinition(definition);
        querySetting.setConfig({
          url: setting.url,
          name: setting.name || "",
          layerId: setting.layerId,
          placeholder: setting.placeholder || "",
          searchFields: setting.searchFields || [],
          displayField: setting.displayField || definition.displayField || "",
          exactMatch: !!setting.exactMatch,
          zoomScale: setting.zoomScale || 50000,
          maxSuggestions: setting.maxSuggestions || 6,
          maxResults: setting.maxResults || 6,
          searchInCurrentMapExtent: !!setting.searchInCurrentMapExtent,
          type: "query"
        });
        querySetting._openQuerySourceChooser();

        querySetting.own(
          on(querySetting, 'select-query-source-ok', lang.hitch(this, function(item) {
            var addResult = this.sourceList.addRow({
              name: item.name
            }, 0);
            if (addResult && addResult.success) {
              if (this._currentSourceSetting) {
                this._closeSourceSetting();
              }
              querySetting.setRelatedTr(addResult.tr);
              querySetting.placeAt(this.sourceSettingNode);
              this.sourceList.selectRow(addResult.tr);

              this._currentSourceSetting = querySetting;
            }
          }))
        );
        querySetting.own(
          on(querySetting, 'reselect-query-source-ok', lang.hitch(this, function(item) {
            var tr = this._currentSourceSetting.getRelatedTr();
            this.sourceList.editRow(tr, {
              name: item.name
            });
          }))
        );
        querySetting.own(
          on(querySetting, 'select-query-source-cancel', lang.hitch(this, function() {
            if (this._currentSourceSetting !== querySetting) {// query source doesn't display in UI
              querySetting.destroy();
              querySetting = null;
            }
          }))
        );
      },

      _createNewQuerySourceSettingFromSourceList: function(setting, definition, relatedTr) {
        if (this._currentSourceSetting) {
          this._closeSourceSetting();
        }

        this._currentSourceSetting = new QuerySourceSetting({
          nls: this.nls,
          map: this.map,
          appConfig: this.appConfig
        });
        this._currentSourceSetting.placeAt(this.sourceSettingNode);
        this._currentSourceSetting.setDefinition(definition);
        this._currentSourceSetting.setConfig({
          url: setting.url,
          name: setting.name || "",
          layerId: setting.layerId,
          placeholder: setting.placeholder || "",
          searchFields: setting.searchFields || [],
          displayField: setting.displayField || definition.displayField || "",
          exactMatch: !!setting.exactMatch,
          zoomScale: setting.zoomScale || 50000,
          maxSuggestions: setting.maxSuggestions || 6,
          maxResults: setting.maxResults || 6,
          searchInCurrentMapExtent: !!setting.searchInCurrentMapExtent,
          type: "query"
        });
        this._currentSourceSetting.setRelatedTr(relatedTr);

        this._currentSourceSetting.own(
          on(this._currentSourceSetting, 'reselect-query-source', lang.hitch(this, function(item) {
            var tr = this._currentSourceSetting.getRelatedTr();
            this.sourceList.editRow(tr, {
              name: item.name
            });
          }))
        );
      },

      _onSourceItemRemoved: function(tr) {
        if (!this._currentSourceSetting) {
          return;
        }

        var currentTr = this._currentSourceSetting.getRelatedTr();
        if (currentTr === tr) {
          this._currentSourceSetting.destroy();
          this._currentSourceSetting = null;
        }
      },

      _onSourceItemSelected: function(tr) {
        var config = this._getRelatedConfig(tr);
        var currentTr = this._currentSourceSetting && this._currentSourceSetting.tr;
        if (!config || tr === currentTr) {
          return;
        }

        // check fields
        if (this._currentSourceSetting && !this._currentSourceSetting.isValidConfig()) {
          this._currentSourceSetting.showValidationTip();
          this.sourceList.selectRow(currentTr);
          return;
        }

        if (config.type === "query") {
          this._createNewQuerySourceSettingFromSourceList(config, config._definition || {}, tr);
        } else if (config.type === "locator") {
          this._createNewLocatorSourceSettingFromSourceList(config, config._definition || {}, tr);
        }
      }
    });
  });