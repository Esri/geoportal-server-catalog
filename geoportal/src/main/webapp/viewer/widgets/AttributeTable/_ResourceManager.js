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
  'dojo/_base/array',
  'dojo/Deferred',
  'dojo/promise/all',
  'esri/lang',
  'jimu/portalUrlUtils',
  './table/_FeatureTable',
  // './_RelationshipTable',
  './utils'
  ], function(declare, lang, array, Deferred, all,
    esriLang, portalUrlUtils,
    _FeatureTable,/* _RelationshipTable,*/ attrUtils) {
    return declare(null, {
      _activeLayerInfoId: null,
      _activeRelationshipKey: null,
      nls: null,
      config: null,
      map: null,

      //FeatureTable
      _delayedLayerInfos: [],
      _layerInfosFromMap: [],
      featureTableSet: {},

      //RelationshipTable
      // one layer may be have multiple relationships, so we use key-value to store relationships
      relationshipsSet: {},
      relationshipTableSet: {},
      currentRelationshipKey: null,

      constructor: function(params) {
        this.map = params && params.map;
        this.nls = params && params.nls;

        this._delayedLayerInfos = [];
        this._layerInfosFromMap = [];
        this.featureTableSet = {};

        this.relationshipsSet = {};
        this.relationshipTableSet = {};
        this.currentRelationshipKey = null;
      },

      setConfig: function(tableConfig) {
        this.config = lang.clone(tableConfig || {});
      },

      setMap: function(map) {
        this.map = map;
      },

      //updateConfig: boolean.
      updateLayerInfoResources: function(updateConfig) {
        var def = new Deferred();
        attrUtils.readConfigLayerInfosFromMap(this.map, false, true)
        .then(lang.hitch(this, function(layerInfos) {
          this._layerInfosFromMap = layerInfos;
          this._processDelayedLayerInfos();

          if (updateConfig) {
            if (this.config.layerInfos.length === 0) {
              // if no config only display visible layers
              var configLayerInfos = attrUtils.getConfigInfosFromLayerInfos(layerInfos);
              this.config.layerInfos = array.filter(configLayerInfos, function(layer) {
                return layer.show;
              });
            } else {
              // filter layer from current map and show property of layerInfo is true
              this.config.layerInfos = array.filter(
                lang.delegate(this.config.layerInfos),
                lang.hitch(this, function(layerInfo) {
                  var mLayerInfo = this._getLayerInfoById(layerInfo.id);
                  return layerInfo.show && mLayerInfo &&
                  (layerInfo.name = mLayerInfo.name || mLayerInfo.title);
                }));
            }
          }
          def.resolve();
        }), function(err) {
          def.reject(err);
        });

        return def;
      },

      isEmpty: function() {
        return this.config && this.config.layerInfos && this.config.layerInfos.length <= 0;
      },

      getConfigInfos: function() {
        return lang.clone(this.config.layerInfos);
      },

      //e.g. When Query create a new feature layer, AT get the layerInfoChanged event,
      //AT needs to call addLayerInfo method to update this._layerInfosFromMap.
      //But AT doesn't open this Query-created feature layer, so it doesn't call addConfigInfo().
      addLayerInfo: function(newLayerInfo) {
        if (this._layerInfosFromMap.length === 0) {
          this._delayedLayerInfos.push(newLayerInfo);
        } else if (this._layerInfosFromMap.length > 0 &&
          !this._getLayerInfoById(newLayerInfo.id)) {
          this._layerInfosFromMap.push(newLayerInfo); // _layerInfosFromMap read from map
        }
      },

      //When user open AT from Query result page, AT will call addConfigInfo method to
      //update this.config.layerInfos. this.config.layerInfos syncs with ContentPanes of AT.
      addConfigInfo: function(newLayerInfo) {
        if (!this._getConfigInfoById(newLayerInfo.id)) {
          var info = attrUtils.getConfigInfoFromLayerInfo(newLayerInfo);
          this.config.layerInfos.push({
            id: info.id,
            name: info.name,
            layer: {
              url: info.layer.url,
              fields: info.layer.fields
            }
          });
        }
      },

      removeLayerInfo: function(infoId) {
        var _clayerInfo = this._getLayerInfoById(infoId);
        var pos = this._layerInfosFromMap.indexOf(_clayerInfo);
        this._layerInfosFromMap.splice(pos, 1);
      },

      removeConfigInfo: function(infoId) {
        if (lang.getObject('config.layerInfos', false, this)) {
          var len = this.config.layerInfos.length;
          for (var i = 0; i < len; i++) {
            if (this.config.layerInfos[i].id === infoId) {
              if (this.featureTableSet[infoId]) {
                this.featureTableSet[infoId].destroy();
                delete this.featureTableSet[infoId];
              }
              this.config.layerInfos.splice(i, 1);
              break;
            }
          }
        }
      },

      // def.resolve({
      //   isSupportQuery: tableInfo.isSupportQuery,
      //   table: this.featureTableSet[tabId] // instance of _FeatureTable
      // });
      // tabId: id of layerInfo
      getQueryTable: function(tabId, enabledMatchingMap, hideExportButton) {
        var def = new Deferred();
        this._activeLayerInfoId = tabId;

        if (!this.featureTableSet[tabId]) {
          this._getQueryTableInfo(tabId).then(lang.hitch(this, function(queryTableInfo) {
            if (!queryTableInfo) {
              def.resolve(null);
              return;
            }

            var activeLayerInfo = queryTableInfo.layerInfo;
            var layerObject = queryTableInfo.layerObject;
            var tableInfo = queryTableInfo.tableInfo;
            // prevent create duplicate table
            // for asychronous request in both queryTable and queryRelationTable
            if (this.featureTableSet[tabId]) {
              def.resolve({
                isSupportQuery: tableInfo.isSupportQuery,
                table: this.featureTableSet[tabId]
              });
              return;
            }

            if (lang.getObject('isSupportQuery', false, tableInfo)) {
              var configInfo = this._getConfigInfoById(tabId);
              if (!configInfo) {
                this.addConfigInfo(activeLayerInfo);
                configInfo = this._getConfigInfoById(tabId);
              }
              var configFields = lang.getObject('layer.fields', false, configInfo);
              var layerFields = layerObject && layerObject.fields;
              // remove fields not exist in layerObject.fields
              configInfo.layer.fields = this._clipValidFields(
                configFields,
                layerFields
              );

              var table = new _FeatureTable({
                map: this.map,
                matchingMap: enabledMatchingMap,
                hideExportButton: hideExportButton,
                layerInfo: activeLayerInfo,
                configedInfo: configInfo,
                nls: this.nls
              });
              this.featureTableSet[tabId] = table;
              def.resolve({
                isSupportQuery: tableInfo.isSupportQuery,
                table: table
              });
            } else {
              def.resolve({
                isSupportQuery: false
              });
            }
          }), function(err) {
            def.reject(err);
          });
        } else {
          def.resolve({
            isSupportQuery: true,
            table: this.featureTableSet[tabId]
          });
        }

        return def;
      },

      getRelationTable: function(originalInfoId, key, enabledMatchingMap, hideExportButton) {
        var def = new Deferred();
        var currentShip = this.relationshipsSet[key];
        this._activeRelationshipKey = key;

        if (currentShip) {
          var originalInfo = this._getLayerInfoById(originalInfoId);
          var layerInfoId = lang.getObject('shipInfo.id', false, currentShip);

          this.getQueryTable(layerInfoId, enabledMatchingMap, hideExportButton)
          .then(lang.hitch(this, function(tableResult) {
            if (tableResult && tableResult.table) {
              var table = tableResult.table;
              table.set('relatedOriginalInfo', originalInfo);
              table.set('relationship', currentShip);
            }
            def.resolve(tableResult);
          }), lang.hitch(function() {
            def.resolve(null);
          }));
        } else {
          def.resolve(null);
        }

        return def;
      },

      removeRelationTable: function(relationShipKey) {
        if (this.relationshipTableSet[relationShipKey]) {
          this.relationshipTableSet[relationShipKey].destroy();
          this.relationshipTableSet[relationShipKey] = null;
        }
      },

      getCurrentTable: function(key) {
        return this.featureTableSet[key] || this.relationshipTableSet[key];
      },

      collectRelationShips: function(layerInfo, relatedTableInfos) {
        this._collectRelationShips(layerInfo, layerInfo.layerObject, relatedTableInfos);
      },

      getConfigInfoById: function(id) {
        return this._getConfigInfoById(id);
      },

      getLayerInfoById: function(id) {
        return this._getLayerInfoById(id);
      },

      getRelationshipsByInfoId: function(id) {
        var ships = [];
        for (var p in this.relationshipsSet) {
          var ship = this.relationshipsSet[p];
          if (ship._layerInfoId === id) {
            ships.push(ship);
          }
        }

        return ships;
      },

      empty: function() {
        this._delayedLayerInfos = [];
        this._layerInfosFromMap = [];
        this.featureTableSet = {};
        for (var p in this.relationshipsSet) {
          var ship = this.relationshipsSet[p];
          ship.shipInfo = null;
        }
        this.relationshipsSet = {};
        this.relationshipTableSet = {};
        this.currentRelationshipKey = null;
        this.config = null;
        this.map = null;
        this.nls = null;
      },

      _processDelayedLayerInfos: function() { // must be invoke after initialize this._layerInfos
        if (this._delayedLayerInfos.length > 0) {
          array.forEach(this._delayedLayerInfos, lang.hitch(this, function(delayedLayerInfo) {
            if (!this._getLayerInfoById(delayedLayerInfo && delayedLayerInfo.id) &&
              this.map && this.map.getLayer(delayedLayerInfo.id)) {
              this._layerInfosFromMap.push(delayedLayerInfo);
            }
          }));

          this._delayedLayerInfos = [];
        }
      },

      _getLayerInfoById: function(layerId) {
        for (var i = 0, len = this._layerInfosFromMap.length; i < len; i++) {
          if (this._layerInfosFromMap[i] && this._layerInfosFromMap[i].id === layerId) {
            return this._layerInfosFromMap[i];
          }
        }
      },

      _getConfigInfoById: function(id) {
        if (!lang.getObject('layerInfos.length', false, this.config)) {
          return null;
        }

        for (var i = 0, len = this.config.layerInfos.length; i < len; i++) {
          var configInfo = this.config.layerInfos[i];
          if (configInfo && configInfo.id === id) {
            return configInfo;
          }
        }

        return null;
      },


      // def.resolve({
      //         layerInfo: activeLayerInfo,
      //         layerObject: layerObject,
      //         tableInfo: tableInfo
      //       });
      _getQueryTableInfo: function(tabId) {
        var def = new Deferred();
        var activeLayerInfo = this._getLayerInfoById(tabId);

        if (!activeLayerInfo) {
          console.error("no activeLayerInfo!");
          def.reject(new Error());
        } else {
          var defs = [];
          var hasUrl = activeLayerInfo.getUrl();
          defs.push(activeLayerInfo.getLayerObject());
          defs.push(activeLayerInfo.getSupportTableInfo());
          if (hasUrl) {
            defs.push(activeLayerInfo.getRelatedTableInfoArray());
          }

          all(defs).then(lang.hitch(this, function(results) {
            if (this._activeLayerInfoId !== tabId || !results) {
              def.resolve(null);
              return;
            }
            var layerObject = results[0];
            var tableInfo = results[1];
            var relatedTableInfos = hasUrl ? results[2] : [];

            if (esriLang.isDefined(relatedTableInfos) && esriLang.isDefined(layerObject) &&
              relatedTableInfos.length > 0) {
              this._collectRelationShips(activeLayerInfo, layerObject, relatedTableInfos);
            }

            def.resolve({
              layerInfo: activeLayerInfo,
              layerObject: layerObject,
              tableInfo: tableInfo
            });
          }), function(err) {
            def.reject(err);
          });
        }

        return def;
      },

      _collectRelationShips: function(layerInfo, layerObject, relatedTableInfos) {
        var ships = layerObject.relationships;
        if (ships && ships.length > 0 && layerObject && layerObject.url) {
          var layerUrl = layerObject.url;
          var parts = layerUrl.split('/');

          array.forEach(ships, lang.hitch(this, function(ship) {
            parts[parts.length - 1] = ship.relatedTableId;
            var relationUrl = parts.join('/');

            var tableInfos = array.filter(relatedTableInfos, lang.hitch(this, function(tableInfo) {
              var tableInfoUrl = tableInfo.getUrl();

              return esriLang.isDefined(tableInfoUrl) && esriLang.isDefined(relationUrl) &&
                (portalUrlUtils.removeProtocol(tableInfoUrl.toString().toLowerCase()) ===
                portalUrlUtils.removeProtocol(relationUrl.toString().toLowerCase()));
            }));

            if (tableInfos && tableInfos.length > 0) {
              ship.shipInfo = tableInfos[0];
            }

            var relKey = layerInfo.id + '_' + ship.name + '_' + ship.id;
            ship._relKey = relKey;
            ship._layerInfoId = layerInfo.id;

            if (!this.relationshipsSet[relKey]) {
              this.relationshipsSet[relKey] = ship;
              this.relationshipsSet[relKey].objectIdField = layerObject.objectIdField;
            }
          }));
        }
      },

      _getLayerInfoLabel: function(layerInfo) {
        var label = layerInfo.name || layerInfo.title;
        return label;
      },

      _getLayerInfoId: function(layerInfo) {
        return layerInfo && layerInfo.id || "";
      },

      _clipValidFields: function(sFields, rFields) {
        if (!(sFields && sFields.length)) {
          return rFields || [];
        }
        if (!(rFields && rFields.length)) {
          return sFields;
        }
        var validFields = [];
        for (var i = 0, len = sFields.length; i < len; i++) {
          var sf = sFields[i];
          for (var j = 0, len2 = rFields.length; j < len2; j++) {
            var rf = rFields[j];
            if (rf.name === sf.name) {
              validFields.push(sf);
              break;
            }
          }
        }
        if(validFields.length === 0 && sFields.length > 0){
          var fieldInfos = lang.clone(rFields);
          array.forEach(fieldInfos, lang.hitch(this, function(fieldInfo){
            if(fieldInfo.type !== 'esriFieldTypeGeometry'){
              fieldInfo.show = true;
              validFields.push(fieldInfo);
            }
          }));
        }
        return validFields;
      }
    });
  });
