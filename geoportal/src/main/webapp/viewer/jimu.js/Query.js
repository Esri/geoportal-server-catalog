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
    'dojo/promise/all',
    'dojo/Deferred',
    'jimu/utils',
    'jimu/ServiceDefinitionManager',
    'esri/tasks/query',
    'esri/tasks/QueryTask'
  ],
  function(declare, lang, array, all, Deferred, jimuUtils, ServiceDefinitionManager, EsriQuery, QueryTask) {

    var clazz = declare(null, {
      //1 means service support orderby and pagination
      //2 means service support query by objectIds
      //3 means service can only do one query
      queryType: 0,
      nextPageIndex: 1,
      pageSizeOption: null,//original pageSize passed into constructor
      layerDefinition: null,
      layerDefinitionDef: null,
      type1CountDef: null,//for type 1
      type2ObjectIdsDef: null,//for type 2
      type3QueryDef: null,//for type3
      sdf: null,

      //options:
      url: null,//required, service url
      query: null,//required, esri/tasks/query
      pageSize: 1000,//optional, feature count per page

      //public methods:
      //getFeatureCount
      //getPageCount
      //getAllFeatures
      //queryNextPage
      //getCurrentPageIndex
      //queryByPage

      /*
      options.url: required, the service url

      options.query: required, esri/tasks/query instance, will honor following properties of query:
      where, geometry, outFields, returnGeometry, outSpatialReference, spatialRelationship
      If the service url supports supportsOrderBy and supportsPagination, options.query will suport orderByFields.

      options.pageSize: optional, the feature count per page, the default value is service's maxRecordCount
      If pageSize > maxRecordCount, pageSize will be reset to maxRecordCount.
      */
      constructor: function(options){
        this.sdf = ServiceDefinitionManager.getInstance();
        this.url = options.url;
        this.query = options.query;
        this.pageSizeOption = options.pageSize;
        if(!this.query.outFields || this.query.outFields.length === 0){
          this.query.outFields = ["*"];
        }
        // this.orderByFields = options.orderByFields;
        if(options.pageSize > 0){
          this.pageSize = options.pageSize;
        }else{
          this.pageSize = 1000;
        }
        this.getFeatureCount();
      },

      //return a deferred which resolves feature count
      getFeatureCount: function(){
        return this._getQueryType().then(lang.hitch(this, function(queryType){
          if(queryType === 1){
            return this._getCountForQueryType1();
          }else if(queryType === 2){
            return this._getCountForQueryType2();
          }else{
            return this._getCountForQueryType3();
          }
        }));
      },

      //return a deferred which resolves page count number
      getPageCount: function(){
        return this.getFeatureCount().then(lang.hitch(this, function(feautreCount){
          if(feautreCount === 0){
            return 0;
          }
          if(this.queryType === 3){
            return 1;
          }else{
            return Math.ceil(feautreCount / this.pageSize);
          }
        }));
      },

      //return a deferred which resolves FeatureSet object
      //if resolves null, it means no features
      getAllFeatures: function(){
        return this.getPageCount().then(lang.hitch(this, function(pageCount){
          if(pageCount > 0){
            var defs = [];
            for(var pageIndex = 1; pageIndex <= pageCount; pageIndex++){
              defs.push(this.queryByPage(pageIndex));
            }
            return all(defs).then(lang.hitch(this, function(results){
              var features = [];
              for(var i = 0; i < results.length; i++){
                if(results[i].features && results[i].features.length > 0){
                  features = features.concat(results[i].features);
                }
              }
              var featureSet = results[0];
              featureSet.features = features;
              return featureSet;
            }));
          }else{
            return null;
          }
        }));
      },

      //return current page index, page index starts from 1, not zero
      getCurrentPageIndex: function(){
        return this.nextPageIndex;
      },

      //return a deferred which resolves FeatureSet
      //if resolves null, means no features
      queryNextPage: function(){
        var pageIndex = this.nextPageIndex;
        this.nextPageIndex++;
        return this.queryByPage(pageIndex);
      },

      //return a deferred which resolves FeatureSet by pageIndex, if resolves null, means no features
      //pageIndex is 1-based, not 0-based
      //use queryByPage(this.getCurrentPageIndex()) to query current page
      //queryByPage doesn't change current page index, queryNextPage does
      queryByPage: function(pageIndex){
        var def = null;
        if(pageIndex <= 0){
          def = new Deferred();
          def.resolve(null);
        }else{
          def = this.getPageCount().then(lang.hitch(this, function(pageCount) {
            if (pageIndex > pageCount) {
              return null;
            }
            if (this.queryType === 1) {
              return this._queryPageForType1(pageIndex);
            } else if (this.queryType === 2) {
              return this._queryPageForType2(pageIndex);
            } else {
              return this._queryPageForType3(pageIndex);
            }
          }));
        }
        return def;
      },

      _getQueryType: function(){
        var def = new Deferred();
        if(this.queryType > 0){
          def.resolve(this.queryType);
        }else{
          return this._getLayerDefinition().then(lang.hitch(this, function(layerDefinition){
            this.queryType = clazz.getQueryType(layerDefinition);
            return this.queryType;
          }));
        }
        return def;
      },

      //-1 means rejected or canceled
      //0 means def is null
      //1 means pending
      //2 means resolved
      _getDefStatus: function(def){
        if(def){
          if(def.isFulfilled()){
            if(def.isResolved()){
              return 2;
            }else{
              return -1;
            }
          }else{
            return 1;
          }
        }else{
          return 0;
        }
      },

      _getLayerDefinition: function(){
        if(this._getDefStatus(this.layerDefinitionDef) <= 0){
          this.layerDefinitionDef = this.sdf.getServiceDefinition(this.url)
          .then(lang.hitch(this, function(layerDefinition){
            this.layerDefinition = layerDefinition;
            var maxRecordCount = layerDefinition.maxRecordCount;
            if(maxRecordCount > 0){
              var a = this.pageSizeOption > 0;
              if(!a || this.pageSize > layerDefinition.maxRecordCount){
                this.pageSize = maxRecordCount;
              }
            }
            return this.layerDefinition;
          }));
        }
        return this.layerDefinitionDef;
      },

      _getCountForQueryType1: function(){
        if(this._getDefStatus(this.type1CountDef) <= 0){
          this.type1CountDef = this._queryCount();
        }
        return this.type1CountDef;
      },

      _getCountForQueryType2: function(){
        return this._getObjectIdsForQueryType2().then(lang.hitch(this, function(objectIds){
          return objectIds.length;
        }));
      },

      _getObjectIdsForQueryType2: function(){
        if(this._getDefStatus(this.type2ObjectIdsDef) <= 0){
          this.type2ObjectIdsDef = this._queryIds();
        }
        return this.type2ObjectIdsDef;
      },

      _getCountForQueryType3: function(){
        return this._doQueryForQueryType3().then(lang.hitch(this, function(response){
          var features = response.features || [];
          return features.length;
        }));
      },

      _doQueryForQueryType3: function(){
        if(this._getDefStatus(this.type3QueryDef) <= 0){
          this.type3QueryDef = this._query();
        }
        return this.type3QueryDef;
      },

      _queryPageForType1: function(pageIndex){
        //pageIndex is 1-based
        var resultOffset = (pageIndex - 1) * this.pageSize;
        return this._queryWithPaginationAndOrder(resultOffset);
      },

      _queryPageForType2: function(pageIndex){
        //pageIndex is 1-based
        return this._getObjectIdsForQueryType2().then(lang.hitch(this, function(allObjectIds){
          var start = (pageIndex - 1) * this.pageSize;
          var end = start + this.pageSize;
          var objectIds = allObjectIds.slice(start, end);
          return this._queryByObjectIds(objectIds);
        }));
      },

      _queryPageForType3: function(pageIndex){
        //pageIndex is 1-based
        return this._doQueryForQueryType3().then(lang.hitch(this, function(response){
          var result = lang.mixin({}, response);
          result.features = [];
          var allFeatures = response.features || [];
          var start = (pageIndex - 1) * this.pageSize;
          var end = start + this.pageSize;
          result.features = allFeatures.slice(start, end);
          return result;
        }));
      },

      _tryLocaleNumber: function(value){
        var result = jimuUtils.localizeNumber(value);
        if(result === null || result === undefined){
          result = value;
        }
        return result;
      },

      _tryLocaleDate: function(date){
        var result = jimuUtils.localizeDate(date);
        if(!result){
          result = date.toLocaleDateString();
        }
        return result;
      },

      _getLayerIndexByLayerUrl: function(layerUrl){
        var lastIndex = layerUrl.lastIndexOf("/");
        var a = layerUrl.slice(lastIndex + 1, layerUrl.length);
        return parseInt(a, 10);
      },

      _getServiceUrlByLayerUrl: function(layerUrl){
        var lastIndex = layerUrl.lastIndexOf("/");
        var serviceUrl = layerUrl.slice(0, lastIndex);
        return serviceUrl;
      },

      _isImageServiceLayer: function(url) {
        return (url.indexOf('/ImageServer') > -1);
      },

      _isTable: function(layerDefinition){
        return layerDefinition.type === "Table";
      },

      _getObjectIdField: function(){
        return this.layerDefinition.objectIdField;
      },

      /*----------------------------query-------------------------------*/

      _query: function(/* optional */ where){
        var queryParams = new EsriQuery();
        queryParams.where = where || this.query.where;
        queryParams.geometry = this.query.geometry;
        queryParams.outSpatialReference = this.map.spatialReference;
        queryParams.returnGeometry = this.query.returnGeometry;
        queryParams.spatialRelationship = this.query.spatialRelationship;
        queryParams.outFields = this.query.outFields;
        var queryTask = new QueryTask(this.url);
        return queryTask.execute(queryParams);
      },

      _queryIds: function(){
        var queryParams = new EsriQuery();
        queryParams.where = this.query.where;
        queryParams.geometry = this.query.geometry;
        queryParams.returnGeometry = false;
        queryParams.spatialRelationship = this.query.spatialRelationship;
        queryParams.outSpatialReference = this.query.outSpatialReference;
        var queryTask = new QueryTask(this.url);
        return queryTask.executeForIds(queryParams).then(lang.hitch(this, function(objectIds){
          //objectIds maybe null
          if(!objectIds){
            objectIds = [];
          }
          return objectIds;
        }));
      },

      _queryByObjectIds: function(objectIds){
        var def = new Deferred();
        var queryParams = new EsriQuery();
        queryParams.returnGeometry = this.query.returnGeometry;
        queryParams.outSpatialReference = this.query.outSpatialReference;
        queryParams.spatialRelationship = this.query.spatialRelationship;
        queryParams.outFields = this.query.outFields;
        queryParams.objectIds = objectIds;

        var queryTask = new QueryTask(this.url);
        queryTask.execute(queryParams).then(lang.hitch(this, function(response){
          def.resolve(response);
        }), lang.hitch(this, function(err){
          if(err.code === 400){
            //the query fails maybe becasuse the layer is a joined layer
            //joined layer:
            //http://csc-wade7d:6080/arcgis/rest/services/Cases/ParcelWithJoin/MapServer/0
            //joined layer doesn't support query by objectIds direcly, so if the layer is joined,
            //it will go into errorCallback of queryTask.
            //the alternative is using where to re-query.
            var objectIdField = this._getObjectIdField();
            var where = "";
            var count = objectIds.length;
            array.forEach(objectIds, lang.hitch(this, function(objectId, i){
              where += objectIdField + " = " + objectId;
              if(i !== count - 1){
                where += " OR ";
              }
            }));
            this._query(where).then(lang.hitch(this, function(response){
              def.resolve(response);
            }), lang.hitch(this, function(err){
              def.reject(err);
            }));
          }else{
            def.reject(err);
          }
        }));
        return def;
      },

      _queryCount: function(){
        var queryParams = new EsriQuery();
        queryParams.where = this.query.where;
        queryParams.geometry = this.query.geometry;
        queryParams.outSpatialReference = this.query.outSpatialReference;
        queryParams.spatialRelationship = this.query.spatialRelationship;
        queryParams.returnGeometry = false;
        var queryTask = new QueryTask(this.url);
        return queryTask.executeForCount(queryParams);
      },

      _queryWithPaginationAndOrder: function(resultOffset){
        var queryParams = new EsriQuery();
        queryParams.where = this.query.where;
        queryParams.geometry = this.query.geometry;
        queryParams.outSpatialReference = this.query.outSpatialReference;
        queryParams.returnGeometry = this.query.returnGeometry;
        queryParams.spatialRelationship = this.query.spatialRelationship;
        queryParams.outFields = this.query.outFields;
        //set pagination info
        queryParams.start = resultOffset;
        queryParams.num = this.pageSize;

        //set sorting info
        var orderByFields = this.query.orderByFields;

        if(orderByFields && orderByFields.length > 0){
          queryParams.orderByFields = orderByFields;

          //make sure orderFieldNames exist in outFields, otherwise the query will fail
          var orderFieldNames = array.map(orderByFields, lang.hitch(this, function(orderByField){
            var splits = orderByField.split(' ');
            return splits[0];
          }));

          array.forEach(orderFieldNames, lang.hitch(this, function(orderFieldName){
            if(queryParams.outFields.indexOf(orderFieldName) < 0){
              queryParams.outFields.push(orderFieldName);
            }
          }));
        }

        var queryTask = new QueryTask(this.url);
        return queryTask.execute(queryParams);
      }

    });

    clazz._isServiceSupportsOrderBy = function(layerInfo) {
      var isSupport = false;
      if (layerInfo.advancedQueryCapabilities) {
        if (layerInfo.advancedQueryCapabilities.supportsOrderBy) {
          isSupport = true;
        }
      }
      return isSupport;
    };

    clazz._isServiceSupportsPagination = function(layerInfo) {
      var isSupport = false;
      if (layerInfo.advancedQueryCapabilities) {
        if (layerInfo.advancedQueryCapabilities.supportsPagination) {
          isSupport = true;
        }
      }
      return isSupport;
    };

    clazz._isSupportObjectIds = function(layerInfo) {
      //http://resources.arcgis.com/en/help/arcgis-rest-api/#/Layer_Table/02r3000000zr000000/
      //currentVersion is added from 10.0 SP1
      //typeIdField is added from 10.0
      var currentVersion = 0;
      if (layerInfo.currentVersion) {
        currentVersion = parseFloat(layerInfo.currentVersion);
      }
      return currentVersion >= 10.0 || layerInfo.hasOwnProperty('typeIdField');
    };

    //1 means service support orderby and pagination
    //2 means service support query by objectIds
    //3 means service can only do one query
    clazz.getQueryType = function(layerDefinition) {
      var queryType = -1;
      if (clazz._isServiceSupportsOrderBy(layerDefinition) && clazz._isServiceSupportsPagination(layerDefinition)) {
        queryType = 1;
      } else if (clazz._isSupportObjectIds(layerDefinition)) {
        queryType = 2;
      } else {
        queryType = 3;
      }
      return queryType;
    };

    return clazz;

  });