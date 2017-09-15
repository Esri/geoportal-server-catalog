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

/*global saveAs, saveTextAs */
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/json',
  'dojo/Deferred',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'esri/tasks/FeatureSet',
  'esri/graphic',
  'esri/SpatialReference',
  'esri/tasks/ProjectParameters',
  'esri/config',
  'esri/geometry/webMercatorUtils',
  'jimu/LayerInfos/LayerInfos',
  './utils',
  './GeojsonConverters'],
  function(declare, lang, array, JSON, Deferred, Query, QueryTask, FeatureSet, Graphic,
  SpatialReference, ProjectParameters, esriConfig, webMercatorUtils, LayerInfos,
  jimuUtils, GeojsonConverters) {
    /* global dojo */
    var mo = {};

    /**
     * options should contain the following attributes:
     * 1. type: type of the data source, can be mo.TYPE_TABLE or mo.TYPE_FEATURESET
     * 2. filename: output file name
     * 3. url: url of the data source if it is fetched remotely
     * 4. data: data source if it is local.
     * You can choose to use url or data, but not both of them.
     */
    mo.createDataSource = function(options){
      if(options.type === mo.TYPE_TABLE){
        return new TableDS(options);
      }else if(options.type === mo.TYPE_FEATURESET){
        return new FeatureSetDS(options);
      }else{
        return null;
      }
    };

    mo.TYPE_TABLE = 'table';
    mo.TYPE_FEATURESET = 'FeatureSet';
    mo.FORMAT_CSV = 'CSV';
    mo.FORMAT_FEATURESET = 'FeatureSet';
    mo.FORMAT_GEOJSON = 'GeoJSON';

    var DataSource = declare(null, {
      filename: undefined,
      suffix: '.txt',
      format: undefined,
      nls: undefined,

      constructor: function(){
        this.nls = window.jimuNls.exportTo;
      },

      /**
       * Calculate the string content of the exported data.
       * Must be implemented by sub class.
       */
      getExportString: function(){

      },

      /**
       * Return the supported format array. Each item contains two attributes:
       * label: the nls string for this format
       * value: used to invoke the setFormat() method
       */
      getSupportExportFormats: function(){

      },

      setFormat: function(value){
        this.format = value;
      },

      download: function(){
        this.getExportString().then(lang.hitch(this, function(str){
          download(this.filename + this.suffix, str);
        }));
      },

      exportToPortal: function(format, itemName){
        /*jshint unused: false*/
      }
    });

    /**
     * options should include:
     * featureSet or url,
     * filename
     */
    var FeatureSetDS = declare(DataSource, {
      featureSet: null,

      constructor: function(options){
        this.inherited(arguments);

        this.featureSet = options.data;
        this.url = options.url;
        this.filename = options.filename;
      },

      getExportString: function(){
        if(this.format === mo.FORMAT_CSV){
          this.suffix = '.csv';
          return this._getAsCSVString();
        }else if(this.format === mo.FORMAT_FEATURESET){
          this.suffix = '.json';
          return this._getAsFeatureSetString();
        }else if(this.format === mo.FORMAT_GEOJSON){
          this.suffix = '.geojson';
          return this._getAsGeoJsonString();
        }else{
          var ret = new Deferred();
          ret.resolve('');
          return ret;
        }
      },

      getSupportExportFormats: function(){
        return [{
          value: mo.FORMAT_CSV,
          label: this.nls.toCSV
        }, {
          value: mo.FORMAT_FEATURESET,
          label: this.nls.toFeatureCollection
        }, {
          value: mo.FORMAT_GEOJSON,
          label: this.nls.toGeoJSON
        }];
      },

      _getFeatureSet: function(){
        var ret = new Deferred();

        if(this.featureSet){
          ret.resolve(this.featureSet);
        }else if(this.url){
          var query = new Query();
          query.returnGeometry = true;
          query.outFields = ['*'];

          this.queryTask = new QueryTask(this.url);
          this.queryTask.execute(query, lang.hitch(this, function(fs){
            ret.resolve(fs);
          }), lang.hitch(this, function(){
            ret.resolve(null);
          }));
        }else{
          ret.resolve(null);
        }

        return ret;
      },

      _getSpatialReference: function(featureset) {
        if (featureset.spatialReference) {
          return featureset.spatialReference;
        }
        // Get spatial refrence from graphics
        var sf;
        array.some(featureset.features, function(feature) {
          if (feature.geometry && feature.geometry.spatialReference){
            sf = feature.geometry.spatialReference;
            return true;
          }
        });
        return sf;
      },

      _projectToWGS84: function(featureset) {
        var ret = new Deferred();
        var sf = this._getSpatialReference(featureset);
        if (!sf) {
          ret.resolve([]);
        } else {
          var wkid = parseInt(sf.wkid, 10);

          if (wkid === 4326) {
            ret.resolve(featureset);
          } else if (sf.isWebMercator()) {
            var outFeatureset = new FeatureSet();
            var features = [];
            array.forEach(featureset.features, function(feature) {
              var g = new Graphic();
              g.attributes = feature.attributes;
              g.geometry = webMercatorUtils.webMercatorToGeographic(feature.geometry);
              features.push(g);
            });
            outFeatureset.features = features;
            ret.resolve(outFeatureset);
          } else {
            var params = new ProjectParameters();
            params.geometries = array.map(featureset.features, function(feature) {
              return feature.geometry;
            });
            params.outSR = new SpatialReference(4326);

            var gs = esriConfig && esriConfig.defaults && esriConfig.defaults.geometryService;
            var existGS = gs && gs.declaredClass === "esri.tasks.GeometryService";
            if (!existGS) {
              gs = jimuUtils.getArcGISDefaultGeometryService();
            }

            gs.project(params).then(function(geometries) {
              var outFeatureset = new FeatureSet();
              var features = [];
              array.forEach(featureset.features, function(feature, i) {
                var g = new Graphic();
                g.attributes = feature.attributes;
                g.geometry = geometries[i];
                features.push(g);
              });
              outFeatureset.features = features;
              ret.resolve(outFeatureset);
            }, function(err) {
              console.error(err);
              ret.resolve([]);
            });
          }
        }
        return ret;
      },

      _getAsFeatureSetString: function(){
        return this._getFeatureSet().then(lang.hitch(this, function(fs){
          var str = '';
          if(fs){
            var jsonObj = fs.toJson();
            if(jsonObj){
              str = JSON.stringify(jsonObj);
            }
          }
          return str;
        }));
      },

      _getAsGeoJsonString: function(){
        return this._getFeatureSet()
        .then(lang.hitch(this, function(fs) {
          return this._projectToWGS84(fs);
        }))
        .then(lang.hitch(this, function(fs){
          var str = '';
          if(fs && fs.features && fs.features.length > 0){
            var jsonObj = {
              type: 'FeatureCollection',
              features: []
            };
            array.forEach(fs.features, function(feature) {
              jsonObj.features.push(GeojsonConverters.arcgisToGeoJSON(feature));
            });
            str = JSON.stringify(jsonObj);
          }
          return str;
        }));
      },

      _getAsCSVString: function(){
        return this._getFeatureSet().then(lang.hitch(this, function(fs){
          var str = '';
          if(fs){
            str = this._createCSVFromFeatureSet(fs);
          }
          return str;
        }));
      },

      _createCSVFromFeatureSet: function(featureSet){
        var fields = this._generateFields(featureSet);

        var datas = array.map(featureSet.features, function(feature){
          var attributes = feature.attributes;
          if (featureSet.geometryType === 'esriGeometryPoint' ||
          featureSet.geometryType === 'point') {
            if (feature.geometry) {
              attributes.x = feature.geometry.x;
              attributes.y = feature.geometry.y;
              if (feature.geometry.spatialReference &&
                feature.geometry.spatialReference.wkid) {
                attributes.wkid = feature.geometry.spatialReference.wkid;
              }
            }
          }
          return attributes;
        });

        return createCSVString(fields, datas);
      },

      _generateFields: function(featureSet) {
        var feature = featureSet.features[0];
        var fields, item, layerId;

        if(feature._layer) {
          fields = feature._layer.fields;
          layerId = feature._layer.id;
        }

        fields = fields || featureSet.fields;
        var layerInfos = LayerInfos.getInstanceSync();
        var layerInfo = layerInfos.getLayerInfoById(layerId);
        if (layerInfo) {
          var popupInfo = layerInfo.getPopupInfo();
          array.forEach(fields, lang.hitch(this, function(field) {
            field.fieldInfo = this._findFieldInfo(popupInfo, field.name);
          }));
        }

        if(!fields || fields.length === 0){
          fields = [];
          var attributes = feature.attributes;
          for(item in attributes){
            if(attributes.hasOwnProperty(item)){
              fields.push({
                name: item
              });
            }
          }
        }

        if(featureSet.fieldAliases){
          //Set of name-value pairs for the attribute's field and alias names.
          array.forEach(fields, function(field) {
            if (featureSet.fieldAliases[field.name]) {
              field.alias = featureSet.fieldAliases[field.name];
            }
          });
        }
        if (featureSet.geometryType === 'esriGeometryPoint' ||
          featureSet.geometryType === 'point') {
          fields.push({
            name: 'x',
            type: 'esriFieldTypeDouble',
            alias: 'x'
          });
          fields.push({
            name: 'y',
            type: 'esriFieldTypeDouble',
            alias: 'y'
          });
          fields.push({
            name: 'wkid',
            type: 'esriFieldTypeInteger',
            alias: 'wkid'
          });
        }
        return fields;
      },

      _findFieldInfo: function(popupInfo, fieldName) {
        if (!popupInfo) {
          return null;
        }
        var fieldInfo;
        array.some(popupInfo.fieldInfos, function(info) {
          if (info.fieldName === fieldName) {
            fieldInfo = info;
            return true;
          }
        });
        return fieldInfo;
      }
    });

    /**
     * options should include:
     * table or url,
     * filename
     */
    var TableDS = declare(DataSource, {
      table: null,

      constructor: function(options){
        this.inherited(arguments);
        this.table = options.data;
        this.url = options.url;
        this.filename = options.filename;
      },

      getExportString: function(){
        if(this.format === mo.FORMAT_CSV){
          this.suffix = '.csv';
          return this._getAsCSVString();
        }else{
          var ret = new Deferred();
          ret.resolve('');
          return ret;
        }
      },

      getSupportExportFormats: function(){
        return [{
          value: mo.FORMAT_CSV,
          label: this.nls.toCSV
        }];
      },

      _getTableData: function(){
        var ret = new Deferred();

        if(this.table){
          ret.resolve(this.table);
        }else if(this.url){
          var query = new Query();
          query.outFields = ['*'];

          this.queryTask = new QueryTask(this.url);
          this.queryTask.execute(query, lang.hitch(this, function(data){
            var table = {};
            table.fields = data.fields;
            table.datas = array.map(data.features, function(feature){
              return feature.attributes;
            });
            ret.resolve(table);//RecordSet
          }), lang.hitch(this, function(){
            ret.resolve(null);
          }));
        }else{
          ret.resolve(null);
        }

        return ret;
      },

      _getAsCSVString: function(){
        return this._getTableData().then(lang.hitch(this, function(tableData){
          var str = '', BOM = '\uFEFF';
          if(tableData){
            str = BOM + createCSVString(tableData.fields, tableData.datas);
          }
          return str;
        }));
      }
    });

    /*************
    datas: Object[], Object properties depend on fields' name
    fields: String[] | Object[]
      String[]: field name array,
      Object[]: Object is the same with layer definition
        {
          name:
          type:
          alias:
        }
    **************/
    function createCSVString(fields, datas){
      var textField = '"';
      var content = '';
      var len = datas.length,
        n = fields.length,
        comma = '',
        value = '',
        feature;
      try {
        array.forEach(fields, function(_field) {
          if(typeof _field === 'string'){
            content = content + comma + _field;
          }else{
            content = content + comma + (_field.alias || _field.name);
          }

          comma = ',';
        });

        content = content + '\r\n';

        for (var i = 0; i < len; i++) {
          comma = '';
          feature = datas[i];
          for (var m = 0; m < n; m++) {
            var _field = fields[m];
            value = feature[typeof _field === 'string'? _field: _field.name];
            if (!value && typeof value !== 'number') {
              value = '';
            }
            if (value) {
              if(_field.type === 'esriFieldTypeDate'){
                value = jimuUtils.localizeDateByFieldInfo(value, _field.fieldInfo);
              }else if(_field.fieldInfo &&
                (_field.type === 'esriFieldTypeDouble' ||
                _field.type === 'esriFieldTypeSingle' ||
                _field.type === 'esriFieldTypeInteger' ||
                _field.type === 'esriFieldTypeSmallInteger')) {
                value = jimuUtils.localizeNumberByFieldInfo(value, _field.fieldInfo);
              }
            }

            if (value && /[",\r\n]/g.test(value)) {
              value = textField + value.replace(/(")/g, '""') + textField;
            }
            content = content + comma + value;
            comma = ',';
          }
          content = content + '\r\n';
        }
        return content;
      } catch (err) {
        return '';
      }
    }

    function download(filename, text) {
      if (dojo.isIE < 10) {
        saveTextAs(text, filename, 'utf-8');
      }else{
        var blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
        saveAs(blob, filename);
      }
    }

    return mo;
  });
