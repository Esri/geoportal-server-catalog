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
  './jsonConverters'],
  function(declare, lang, array, JSON, Deferred, Query, QueryTask, jsonConverters) {
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
        return this._getFeatureSet().then(lang.hitch(this, function(fs){
          var str = '';
          if(fs){
            var converter = new jsonConverters.esriConverter();
            var jsonObj = converter.toGeoJson(fs);
            if(jsonObj){
              str = JSON.stringify(jsonObj);
            }
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
        var features = featureSet.features;
        var fields = [], datas;
        var item;

        if(featureSet.fieldAliases){
          //Set of name-value pairs for the attribute's field and alias names.
          for(item in featureSet.fieldAliases){
            if(featureSet.fieldAliases.hasOwnProperty(item)){
              fields.push({
                name: item,
                alias: featureSet.fieldAliases[item]
              });
            }
          }
        }else{
          var attributes = features[0].attributes;
          for(item in attributes){
            if(attributes.hasOwnProperty(item)){
              fields.push({
                name: item
              });
            }
          }
        }
        datas = array.map(featureSet.features, function(feature){
          return feature.attributes;
        });

        return createCSVString(fields, datas);
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
      if(fileSaverAvailable()){
        var blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
        saveAs(blob, filename);
      }else{
        saveTextAs(text, filename, 'utf-8');
      }
    }

    function fileSaverAvailable(){
      try {
        return !!new Blob();
      } catch (e) {
        return false;
      }
    }

    return mo;
  });
