///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
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

define(['dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'esri/lang',
    './LayerInfos/LayerInfos'
  ],
  function(declare, lang, topic, esriLnag,
    LayerInfos) {
    var instance = null;

    var clazz = declare(null, {
      /**
       * {
       *   layerId: {
       *     definitionExpression: //layer's definitionExpression
       *     filterExprs: {
       *        // widgetId: filterExpr
       *      },
       *      mapFilterControls: {
       *        // widgetId: {enable, useAND, priority}
       *      }
       *   }
       * }
       * @type {[type]}
       */
      _filters: null,
      layerInfos: null,

      constructor: function() {
        this._filters = {};

        if (window.isBuilder) {
          topic.subscribe('app/mapLoaded', lang.hitch(this, this._onMapLoaded));
          topic.subscribe('app/mapChanged', lang.hitch(this, this._onMapChanged));
        } else {
          topic.subscribe('mapLoaded', lang.hitch(this, this._onMapLoaded));
          topic.subscribe('mapChanged', lang.hitch(this, this._onMapChanged));
        }

        topic.subscribe('widgetDestroyed', lang.hitch(this, this._onWidgetDestroyed));
      },

      /**
       * deprecated
       */
      getWidgetFilter: function(layerId, widgetId) {
        var prop = layerId + '.filterExprs.' + widgetId;
        return lang.getObject(prop, false, this._filters);
      },

      /**
       * apply Filter expression to a layer
       * @param  {[type]} layerId         [description]
       * @param  {[type]} widgetId        [description]
       * @param  {[type]} expression      [description]
       * @param  {[type]} enableMapFilter [true/false or null or undefined]
       * @param  {[type]} useAND [true/false or null or undefined]
       */
      applyWidgetFilter: function(layerId, widgetId, expression, enableMapFilter, useAND) {
        this._setFilterExp(layerId, widgetId, expression, enableMapFilter, useAND);

        var layerInfo = this.layerInfos.getLayerInfoById(layerId) ||
          this.layerInfos.getTableInfoById(layerId);
        var filterExp = this._getFilterExp(layerId);
        if (filterExp !== null && layerInfo) {
          layerInfo.setFilter(filterExp);
        }
      },

      _onMapLoaded: function() {
        this.layerInfos = LayerInfos.getInstanceSync();

        this._traversalFilter();
      },

      _onMapChanged: function() {
        this.layerInfos = LayerInfos.getInstanceSync();

        this._traversalFilter();
      },

      _onWidgetDestroyed: function(w) {
        for (var layerId in this._filters) {
          if (this._filters[layerId]) {
            var filterObj = this._filters[layerId];
            if (filterObj) {
              var filterExprs = filterObj.filterExprs;
              var mapFilterControls = filterObj.mapFilterControls;
              if (filterExprs) {
                delete filterExprs[w];
              }
              if (mapFilterControls) {
                delete mapFilterControls[w];
              }
            }
          }
        }
      },

      _traversalFilter: function() {
        this.layerInfos.traversalAll(lang.hitch(this, function(layerInfo) {
          if (!this._filters[layerInfo.id]) {
            this._filters[layerInfo.id] = {
              definitionExpression: layerInfo.getFilter(),
              filterExprs: {
                // widgetId: filterExpr
              },
              mapFilterControls: {
                // widgetId: {enable, useAND, priority}
              }
            };
          }
        }));
      },

      _getPriorityOfMapFilter: function(layerId) {
        var mapFilterControls = lang.getObject(layerId + '.mapFilterControls',
          false, this._filters);
        var count = 0;
        for (var p in mapFilterControls) {
          var control = mapFilterControls[p];
          if (control.priority > count) {
            count = control.priority;
          }
        }

        return count;
      },

      _getMapFilterControl: function(layerId) {
        var mapFilterControls = lang.getObject(layerId + '.mapFilterControls',
          false, this._filters);
        var count = 0;
        var priorityControl = null;
        for (var p in mapFilterControls) {
          var control = mapFilterControls[p];
          if (control.priority > count) {
            count = control.priority;
            priorityControl = control;
          }
        }

        return priorityControl;
      },

      _setFilterExp: function(layerId, widgetId, expression, enableMapFilter, useAND) {
        var prop = layerId + '.filterExprs.' + widgetId;
        var mapFilterControl = layerId + '.mapFilterControls.' + widgetId;
        if (!expression) {
          if (lang.getObject(prop, false, this._filters)) {
            delete this._filters[layerId].filterExprs[widgetId];
          }
          if (lang.getObject(mapFilterControl, false, this._filters)) {
            delete this._filters[layerId].mapFilterControls[widgetId];
          }
          return;
        }

        lang.setObject(prop, expression, this._filters);

        if (esriLnag.isDefined(enableMapFilter)) {
          var priority = this._getPriorityOfMapFilter(layerId);
          lang.setObject(mapFilterControl, {
            enable: enableMapFilter,
            useAND: useAND,
            priority: priority + 1
          }, this._filters);
        }
      },

      _getFilterExp: function(layerId) {
        if (!this._filters[layerId]) {
          return null;
        }

        var parts = [];
        var dexp = this._filters[layerId].definitionExpression;
        var filterExprs = this._filters[layerId].filterExprs;
        var mfControl = this._getMapFilterControl(layerId);

        for (var p in filterExprs) {
          var expr = filterExprs[p];
          if (expr) {
            parts.push('(' + expr + ')');
          }
        }

        var widgetFilter = parts.join(' AND ');
        if ((dexp && mfControl && mfControl.enable) || (dexp && mfControl === null)) {
          if (!widgetFilter) {
            return dexp;
          } else if (mfControl && mfControl.useAND === false) {
            return '(' + dexp + ') OR ' + widgetFilter;
          } else {
            return '(' + dexp + ') AND ' + widgetFilter;
          }
        } else {
          return widgetFilter;
        }
      }
    });

    clazz.getInstance = function() {
      if (instance === null) {
        instance = new clazz();
        window._filterManager = instance;
      } else {
        return instance;
      }
    };

    return clazz;
  });