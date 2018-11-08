define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/array",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "./FeatureLayerQueryResult"
], function(
  declare, lang, array, Query, QueryTask, FeatureLayerQueryResult
) {

  //cache store for dgrid, vs memory store
  var FeatureLayerQueryStore = declare(null, {

    queryUrl: "",
    idProperty: "id",//objectIdField
    //data is objectId indexed
    data: null, // [attributes1,...attributes25,undefined.....,attributes51,attributes52,..]
    _entityData: null, // [attributes1,attributes2,...attributes25,attributes51,attributes52....]

    constructor: function(options) {
      declare.safeMixin(this, options);
      this.data = [];
      this._entityData = [];

      this.layer = options.layer;

      // null for server side paging
      this.objectIds = options.objectIds;

      // required for server side paging
      this.where = options.where;
      this.orderByFields = options.orderByFields;

      this.totalCount = options.totalCount;
      this.batchCount = options.batchCount || 25;
      this.idProperty = this.layer.objectIdField;
      this.spatialFilter = options.spatialFilter;

      if (this.layer && this.layer.url) {
        this.queryTask = new QueryTask(this.layer.url);
      }
    }, // End constructor

    //get attributes by objectId
    get: function(id) {
      return this.data[id];
    },

    //get objectId value
    getIdentity: function(object) {
      return object[this.idProperty];
    },

    //query is user defiend
    //query maybe function or {},_FeatureTable.showSelectedRecords()
    //
    //options is passed by dgrid,like
    //{"sort":[{"attribute":"FID","descending":false}],"start":1603,"count":35}
    //options.start means index of new start row, not objectId
    query: function(query, options) {
      var queryObj = new Query();
      var start = (options && options.start) || 0;
      // _export_count for export query
      var count = /*options.count ||*/  options._export_count || this.batchCount;
      var filterIds = null;

      if (typeof query === 'function') {
        //if query is function, means we call _FeatureTable.showSelectedRecords(),
        //so this method is called
        filterIds = query(this._entityData);
      } else if (Object.prototype.toString.call(query) === '[object Array]') {
        filterIds = query;
      }

      if (this.objectIds) {
        //if service support pagination, this.objectIds is null
        //if service doesn't support objectId, this.objectIds is null
        //if service support object but not support pagination, this.objectIds is [objectId]
        filterIds = filterIds ? filterIds : this.objectIds;
        if (filterIds.length >= (start + this.batchCount)) {
          queryObj.objectIds = filterIds.slice(start, start + count);
        } else {
          queryObj.objectIds = filterIds.slice(start);
        }
      } else {
        // server supports paging
        if (filterIds && filterIds.length > 0) {
          if (filterIds.length >= (start + this.batchCount)) {
            queryObj.objectIds = filterIds.slice(start, start + count);
          } else {
            queryObj.objectIds = filterIds.slice(start);
          }
        } else {
          queryObj.start = start;
          queryObj.num = count; // doesn't matter if there are not <num> features left
          queryObj.where = this.where;
          queryObj.geometry = this.spatialFilter;
          queryObj.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
        }

        var sort = options.sort;
        if (sort && sort.length > 0) {
          var orderByFields = array.map(sort, function(s) {
            return s.attribute + " " + (s.descending ? "DESC" : "ASC");
          });
          queryObj.orderByFields = orderByFields; //this.orderByFields;
        }
      }

      // queryObj.returnGeometry = false;
      queryObj.returnGeometry = this.layer.geometryType === 'esriGeometryPoint';
      queryObj.outFields = ["*"];
      var totalCount = this.totalCount;

      var results = null;
      // never request data if objectIds and where clause is invalid
      var invalidIds = !(queryObj.objectIds && queryObj.objectIds.length > 0);
      var invalidWhereStr = !queryObj.where;
      if (invalidIds && invalidWhereStr) {
        return new FeatureLayerQueryResult([]);
      }

      if (this.queryTask) {
        results = this.queryTask.execute(queryObj);
      } else {
        results = this.layer.queryFeatures(queryObj);
      }

      results.total = results.then(lang.hitch(this, function(result) {
        var i = 0;
        // var objectIdFieldName = result.objectIdFieldName;
        var objectIdFieldName = this.layer.objectIdField;

        if (this.objectIds) {
          // sort the resulting features to the order of the objectIds sent in
          if (!objectIdFieldName) {
            for (i = 0; i < result.fields.length; i++) {
              if (result.fields[i].type === "esriFieldTypeOID") {
                objectIdFieldName = result.fields[i].name;
                break;
              }
            }
          }

          var lookup = {};
          for (i = 0; i < result.features.length; i++) {
            lookup[result.features[i].attributes[objectIdFieldName]] = result.features[i];
          }

          result.features = array.map(queryObj.objectIds, function(objectId) {
            return lookup[objectId];
          });
        }

        // modify the JSON response to an array of objects containing the info for grid rows
        for (i = 0; i < result.features.length; i++) {
          if (result.features[i]) {
            var feature = result.features[i];

            //result.features will be attributes array
            result.features[i] = lang.mixin(lang.clone(feature.attributes), {
              geometry: feature.geometry
            });
            this.data[result.features[i][objectIdFieldName]] = result.features[i];//attributes
            this._entityData.push(result.features[i]);
          }
        }

        result = result.features;

        return totalCount;

      }), function() {
        console.log("FeatureLayerQueryStore queryFeatures failed.");
        return 0;
      });

      return new FeatureLayerQueryResult(results);
    }

  });
  return FeatureLayerQueryStore;
});