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

define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/Evented',
    'dojo/when',
    './utils',
    'jimu/LayerInfos/LayerInfos',
    'esri/tasks/query',
    'esri/tasks/QueryTask',
    'esri/tasks/StatisticDefinition',
    './Query'
  ],
  function(declare, lang, array, topic, Evented, when, jimuUtils, LayerInfos,
  Query, QueryTask, StatisticDefinition, JimuQuery) {
    var dataSourceTypes = {
      Features: 'Features',
      FeatureStatistics: 'FeatureStatistics'
    };

    var resultRecordType = {
      all: 'all',
      serviceLimitation: 'serviceLimitation',
      custom: 'custom'
    };

    var instance = null,
      clazz = declare(Evented, {

        constructor: function() {
          this._listeners = [];
          this._refreshTimers = [];

          //key=data source id,
          //value=data
          //    {
          //      data: [] //feature array
          //    }.
          //  if it's feature layer, the feature.attributes are the same with fields:
          //  if it's statistics, the feature.attributes are from statistics
          this._dataStore = {};

          //key=data source id,
          //value=jimuQuery
          //cache jumuQuery here because there maybe pagenation
          this._jimuQueryObject = {};


          //key=data source id
          //value=widget id array
          this._dataSourceUsage = {};

          if(window.isBuilder){
            topic.subscribe("app/mapLoaded", lang.hitch(this, this._onMapLoaded));
            topic.subscribe("app/mapChanged", lang.hitch(this, this._onMapChanged));
          }else{
            topic.subscribe("mapLoaded", lang.hitch(this, this._onMapLoaded));
            topic.subscribe("mapChanged", lang.hitch(this, this._onMapChanged));
          }

          if(window.isBuilder){
            topic.subscribe("app/appConfigLoaded", lang.hitch(this, this._onAppConfigLoaded));
            topic.subscribe("app/appConfigChanged", lang.hitch(this, this._onAppConfigChanged));
          }else{
            topic.subscribe("appConfigLoaded", lang.hitch(this, this._onAppConfigLoaded));
            topic.subscribe("appConfigChanged", lang.hitch(this, this._onAppConfigChanged));
          }

          topic.subscribe("updateDataSourceData", lang.hitch(this, this._onUpdataDataSourceData));

          if(window.isBuilder){
            //in builder, we need listen data source data change in map, so widget setting can read data
            topic.subscribe("app/dataSourceDataUpdated", lang.hitch(this, this._onDataSourceDataUpdatedInApp));
          }
        },

        getData: function(dsId){
          return this._dataStore[dsId];
        },

        getDataSourceConfig: function(dsId){
          return this.appConfig.dataSource.dataSources[dsId];
        },

        parseDataSourceId: function(id){
          var segs = id.split('~');
          var ret = {};
          if(segs.length < 2){
            console.error('Bad data source id:', id);
            return ret;
          }

          switch(segs[0]){
            case 'map': //map~<layerId>~<filterId>
              ret = {
                from: 'map',
                layerId: segs[1]
              };
              return ret;
            case 'widget': //widget~<widgetId>~<dataSourceId>
              ret = {
                from: 'widget',
                widgetId: segs[1]
              };
              return ret;
            case 'external': //external~<id>
              ret = {
                from: 'external'
              };
              return ret;
            default:
              console.error('Bad data source id:', id);
          }
        },

        addDataSourceUsage: function(dsId, widgetId){
          if(!this._dataSourceUsage[dsId]){
            this._dataSourceUsage[dsId] = [widgetId];
            this._startOneDataSource(this.appConfig.dataSource.dataSources[dsId]);
          }else{
            if(this._dataSourceUsage[dsId].indexOf(widgetId) < 0){
              this._dataSourceUsage[dsId].push(widgetId);
            }
            if(this._dataSourceUsage[dsId].length === 1){
              this._startOneDataSource(this.appConfig.dataSource.dataSources[dsId]);
            }
          }
        },

        removeDataSourceUsage: function(dsId, widgetId){
          if(!this._dataSourceUsage[dsId]){
            return;
          }

          if(this._dataSourceUsage[dsId].indexOf(widgetId) >= 0){
            this._dataSourceUsage[dsId] = array.filter(this._dataSourceUsage[dsId], function(wid){
              return wid !== widgetId;
            });
          }

          // if(this._dataSourceUsage[dsId].length === 0){
          //   this._stopAndCleanOneDataSource(this.appConfig.dataSource.dataSources[dsId]);
          // }
        },

        _onUpdataDataSourceData: function(dsId, data){
          var ds = this.appConfig.dataSource.dataSources[dsId];
          if(!ds){
            console.error('Not found data source id:', dsId);
            return;
          }

          var idObj = this.parseDataSourceId(dsId);
          if(idObj.from !== 'widget'){
            console.error('Please update data source from widget only.', dsId);
            return;
          }

          this._updateDataSourceData(dsId, data);
        },

        _updateDataSourceData: function(dsId, data){
          this._dataStore[dsId] = data;
          topic.publish('dataSourceDataUpdated', dsId, data);
          this.emit('update', dsId, data);
        },

        _onDataSourceDataUpdatedInApp: function(dsId, data){
          this._updateDataSourceData(dsId, data);
        },

        _onMapLoaded: function(map) {
          this.map = map;
          if(window.isBuilder){
            return;
          }
          this._handleDataSourceConfigChange(this.appConfig, this.appConfig, 'mapLoaded');
        },

        _onMapChanged: function(map) {
          this.map = map;
          if(window.isBuilder){
            return;
          }
          this._handleDataSourceConfigChange(this.appConfig, this.appConfig, 'mapChanged');
        },

        _onAppConfigLoaded: function(_appConfig) {
          var appConfig = lang.clone(_appConfig);
          this.appConfig = appConfig;
        },

        _onAppConfigChanged: function(_appConfig, reason) {
          var appConfig = lang.clone(_appConfig);
          if(window.isBuilder){
            this.appConfig = appConfig;
            return;
          }
          if(reason === 'dataSourceChange'){
            this._handleDataSourceConfigChange(this.appConfig, appConfig, reason);

          }else if(reason === 'mapChange'){
            this._cleanForConfigChangedDataSource(this.appConfig, appConfig);
          }
          this.appConfig = appConfig;
        },

        _handleDataSourceConfigChange: function(oldAppConfig, newAppConfig, reason){
          if(oldAppConfig){
            this._removeListeners();
            this._removeTimers();
            this._cleanForConfigChangedDataSource(oldAppConfig, newAppConfig);
          }


          array.forEach(Object.keys(newAppConfig.dataSource.dataSources), function(dsId){
            newAppConfig.dataSource.dataSources[dsId].idObj = this.parseDataSourceId(dsId);
          }, this);

          this._listenDataSourceChange(newAppConfig.dataSource.dataSources);
          this._startRefreshTimer(newAppConfig.dataSource, reason);
          this._initStaticDataSource(newAppConfig.dataSource);
        },

        _cleanForConfigChangedDataSource: function(oldAppConfig, newAppConfig){
          var oldDss = oldAppConfig.dataSource.dataSources;
          var newDss = newAppConfig.dataSource.dataSources;
          array.forEach(Object.keys(oldDss), function(dsId){
            if(!newDss[dsId] ||
              (newDss[dsId] && !jimuUtils.isEqual(newDss[dsId], oldDss[dsId]))){
              delete this._jimuQueryObject[dsId];

              this._updateDataSourceData(dsId, {features: []});
              delete this._dataStore[dsId];
            }
          }, this);
        },

        _isGlobalRefresh: function(settings){
          return settings.unifiedRefreshInterval && settings.unifiedRefreshInterval > 0;
        },

        _startOneDataSource: function(ds){
          var interval;
          if(this._isGlobalRefresh(this.appConfig.dataSource.settings)){
            interval = this.appConfig.dataSource.settings.unifiedRefreshInterval;
          }else{
            interval = ds.refreshInterval;
          }

          if(ds.idObj.from === 'map'){
            this._listenMapDataSourceChange(ds);
          }else if(ds.idObj.from === 'external'){
            if(ds.filterByExtent){
              var listener = {};
              listener.handle = this.map.on('extent-change', lang.hitch(this, this._onLayerDataChange, ds));
              listener.dsId = ds.id;
              this._listeners.push(listener);
            }
          }

          if(ds.idObj.from === 'map' || ds.idObj.from === 'external'){
            this._refeshDataSource(ds);

            if(ds.isDynamic){
              var timer = {};
              timer.handle = setInterval(lang.hitch(this, this._refeshDataSource, ds), interval * 1000 * 60);
              timer.dsId = ds.id;
              this._refreshTimers.push(timer);
            }
          }
        },

        _stopAndCleanOneDataSource: function(ds){
          this._listeners =  array.filter(this._listeners, function(listener){
            if(listener.dsId === ds.id){
              listener.handle.remove();
              return false;
            }else{
              return true;
            }
          }, this);

          this._refreshTimers = array.filter(this._refreshTimers, function(timer){
            if(timer.dsId === ds.id){
              clearInterval(timer.handle);
              return false;
            }else{
              return true;
            }
          }, this);

          this._updateDataSourceData(ds.id, {features: []});
        },

        _listenDataSourceChange: function(dataSources){
          array.forEach(Object.keys(dataSources), function(dsId){
            var ds = dataSources[dsId];
            //data source from widget will changed by widget,
            if(ds.idObj.from === 'map'){
              this._listenMapDataSourceChange(ds);
            }else if(ds.idObj.from === 'external'){
              if(ds.filterByExtent){
                var listener = {};
                listener.handle = this.map.on('extent-change', lang.hitch(this, this._onLayerDataChange, ds));
                listener.dsId = ds.id;
                this._listeners.push(listener);
              }
            }
          }, this);
        },

        _listenMapDataSourceChange: function(ds){
          this._getLayerObject(ds.idObj.layerId).then(lang.hitch(this, function(layer){
            if(!layer){
              //means layer is not in map, this means layer is removed, or map is changed.
              console.error('Can not find layer that data source depends on.', ds.id);
              return;
            }
            var listener = {};
            listener.handle = layer.on('edits-complete', lang.hitch(this, this._onLayerDataChange, ds));
            listener.dsId = ds.id;
            this._listeners.push(listener);

            if(ds.filterByExtent){
              listener = {};
              listener.handle = this.map.on('extent-change', lang.hitch(this, this._onLayerDataChange, ds));
              listener.dsId = ds.id;
              this._listeners.push(listener);
            }
          }));
        },

        _onLayerDataChange: function(ds){
          this._doQueryForDataSource(ds);
        },

        _doQueryForDataSource: function(ds){
          if(this.appConfig.mode !== 'config'){
            //in config mode, we don't care whether data source is ued, we always do query because data source may
            //be used by setting page.
            //when launch app, we query data only when data source is used.
            if(!this._dataSourceUsage[ds.id] || this._dataSourceUsage[ds.id].length === 0){
              return;
            }
          }
          this.doQuery(ds).then(lang.hitch(this, function(featureSet){
            this._updateDataSourceData(ds.id, {
              features: featureSet.features
            });
          }));
        },

        _getLayerObject: function(layerId){
          var layerInfo = LayerInfos.getInstanceSync().getLayerOrTableInfoById(layerId);
          if(layerInfo){
            return layerInfo.getLayerObject();
          }else{
            return when(null);
          }
        },

        _startRefreshTimer: function(dataSource, reason){
          var dataSources = dataSource.dataSources;
          var dataSourceSettings = dataSource.settings;
          array.forEach(Object.keys(dataSources), function(dsId){
            var ds = dataSources[dsId];
            if(ds.idObj.from === 'widget' || !ds.isDynamic || !ds.url){
              return;
            }

            var interval;
            if(this._isGlobalRefresh(dataSourceSettings)){
              interval = dataSourceSettings.unifiedRefreshInterval;
            }else{
              interval = ds.refreshInterval;
            }

            if(reason === 'dataSourceChange'){
              if(ds.idObj.from === 'external' || ds.idObj.from === 'map'){
                //data source change will not trigger layer update-end event, so query here
                this._refeshDataSource(ds);
              }
            }else{
              if(ds.idObj.from === 'external'){
                //for ds from map, because we listen layer update-end event, so we don't do query here.
                this._refeshDataSource(ds);
              }
            }

            var timer = {
              handle: setInterval(lang.hitch(this, this._refeshDataSource, ds), interval * 1000 * 60),
              dsId: dataSource.id
            };
            this._refreshTimers.push(timer);
          }, this);
        },

        _initStaticDataSource: function(dataSource){
          array.forEach(Object.keys(dataSource.dataSources), function(dsId){
            var ds = dataSource.dataSources[dsId];
            if(ds.idObj.from === 'widget' || ds.isDynamic || !ds.url){
              return;
            }

            this._doQueryForDataSource(ds);
          }, this);
        },

        _refeshDataSource: function(ds){
          this._doQueryForDataSource(ds);
        },

        _getDataSourceFilter: function(ds){
          if(ds.idObj.from === 'map'){
            var layerInfo = LayerInfos.getInstanceSync().getLayerOrTableInfoById(ds.idObj.layerId);
            var webMapFilter;
            if(layerInfo){
              webMapFilter = layerInfo.getFilterOfWebmap();
            }

            var dsFilter = ds.filter? ds.filter.expr: '1=1';
            var filter;
            if(webMapFilter){
              filter = '(' + webMapFilter + ') and (' + dsFilter + ')';
            }else{
              filter = dsFilter;
            }
            return filter;
          }else{
            return ds.filter? ds.filter.expr: '1=1';
          }
        },

        doQuery: function(ds){
          if(!ds.idObj){
            ds.idObj = this.parseDataSourceId(ds.id);
          }

          var query, queryTask;
          if(ds.type === dataSourceTypes.Features){
            if(ds.resultRecordType === resultRecordType.serviceLimitation){
              query = this._getQueryObjectFromDataSource(ds);
              queryTask = new QueryTask(ds.url);
              return queryTask.execute(query);
            }else{
              //when data source is changed, the cache will be removed.
              var jimuQuery = this._jimuQueryObject[ds.id];
              if(!jimuQuery){
                var queryOptions = {};
                queryOptions.url = ds.url;
                queryOptions.query = this._getQueryObjectFromDataSource(ds);

                if(ds.resultRecordType === resultRecordType.all){
                  jimuQuery = new JimuQuery(queryOptions);
                }else{
                  queryOptions.pageSize = ds.resultRecordCount;
                  jimuQuery = new JimuQuery(queryOptions);
                }
                this._jimuQueryObject[ds.id] = jimuQuery;
              }
              if(ds.resultRecordType === resultRecordType.all){
                return jimuQuery.getAllFeatures();
              }else{
                return jimuQuery.queryByPage(1);
              }
            }
          }else{
            queryTask = new QueryTask(ds.url);
            query = new Query();

            query.where = this._getDataSourceFilter(ds);
            if(ds.dataSchema.groupByFields && ds.dataSchema.groupByFields.length > 0){
              query.groupByFieldsForStatistics = ds.dataSchema.groupByFields;
            }

            if(ds.dataSchema.orderByFields && ds.dataSchema.orderByFields.length > 0){
              query.orderByFields = ds.dataSchema.orderByFields;
            }

            query.outStatistics = ds.dataSchema.statistics.map(function(s){
              var statisticDefinition = new StatisticDefinition();
              statisticDefinition.statisticType = s.statisticType;
              statisticDefinition.onStatisticField = s.onStatisticField;
              statisticDefinition.outStatisticFieldName = s.outStatisticFieldName;
              return statisticDefinition;
            });
            return queryTask.execute(query);
          }
        },

        _getQueryObjectFromDataSource: function(ds){
          var query = new Query();
          query.where = this._getDataSourceFilter(ds);
          if(ds.filterByExtent){
            query.geometry = this.map.extent;
          }
          query.outFields = ds.dataSchema.fields.map(function(f){
            return f.name;
          });
          if(ds.dataSchema.orderByFields && ds.dataSchema.orderByFields.length > 0){
            query.orderByFields = ds.dataSchema.orderByFields;
          }
          query.returnGeometry = true;
          query.outSpatialReference = this.map.spatialReference;
          return query;
        },

        _removeListeners: function(){
          this._listeners.forEach(lang.hitch(this, function(listener){
            listener.handle.remove();
          }));
          this._listeners = [];
        },

        _removeTimers: function(){
          this._refreshTimers.forEach(lang.hitch(this, function(timer){
            clearInterval(timer.handle);
          }));
          this._refreshTimers = [];
        }

      });

    clazz.getInstance = function() {
      if (instance === null) {
        instance = new clazz();
        window._datasourceManager = instance;
      }
      return instance;
    };
    return clazz;
  });