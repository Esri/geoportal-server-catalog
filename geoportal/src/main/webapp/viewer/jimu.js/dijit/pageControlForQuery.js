///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
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
    'dojo/Deferred',
    'esri/tasks/query',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/declare',
    '../Query',
    '../LayerStructure',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./templates/pageControlForQuery.html'
  ],
    function(Deferred, EsriQuery, array,
        lang, declare , JimuQuery, LayerStructure, _WidgetBase,
        _TemplatedMixin, _WidgetsInTemplateMixin, template) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,

        layerUrl: null,
        fieldInfo: null,
        // fieldPopupInfo: null,
        spatialReference: null,
        layerDefinition: null,
        isNumberField: false,
        showNullValues: false,

        _isUniqueValueCacheFinish: false,
        _uniqueValueCache: {},
        _uniqueValueCacheForOtherTypes: {}, //cache for searchKey & types = 2 or 3
        _codedvalueCache: [],

        cascadeFilterExprs: '1=1',

        numbericFieldLength: {
          'esriFieldTypeOID': 32,
          'esriFieldTypeSmallInteger': 16,
          'esriFieldTypeInteger': 32,
          'esriFieldTypeSingle': 128,
          'esriFieldTypeDouble': 1024
        },
        pageIndex: 1,  //current page
        pageSize: 1000, //optional, feature count per page
        postCreate: function(){
          this.inherited(arguments);
          this.spatialReference = LayerStructure.getInstance().map.spatialReference;
          this.reset();
          this.queryType = JimuQuery.getQueryType(this.layerDefinition);
          if(this.isNumberField){
            this.fieldLength = this.numbericFieldLength[this.fieldInfo.type];
          }
        },

        reset:function(){
          this.pageIndex = 1;
          this._isUniqueValueCacheFinish = false;
          this._uniqueValueCache = {};
          this._uniqueValueCacheForOtherTypes = {};
          this._codedvalueCache = [];
        },

        _addNextPage: function(ifFristPage){
          var def = new Deferred();
          this.getPageValueDef(ifFristPage).then(lang.hitch(this, function(valueLabels){
            def.resolve(valueLabels);
          }), lang.hitch(this, function(err){
            def.reject(err);
          }));
          return def;
        },

        isKeyQueryLoader: false,
        _searchKey: function(name){
          var def = new Deferred();
          var query = new EsriQuery();
          //"%123%" works for string field and number field
          var keyWhere = '';
          if(this.isNumberField){ // CAST(objectid AS CHAR(32)) LIKE '%1%'
            keyWhere = "CAST(" + this.fieldInfo.name + " AS CHAR(" + this.fieldLength + ")) LIKE '%" + name + "%'";
          }else{
            keyWhere = this.fieldInfo.name + " LIKE '%" + name + "%'";
          }
          query.where = '((' + this.cascadeFilterExprs + ') AND (' + keyWhere + '))';

          query.geometry = null;
          query.outSpatialReference = this.spatialReference;
          query.outFields = [this.fieldInfo.name];
          query.returnDistinctValues = true;
          query.returnGeometry = false;
          query.orderByFields = query.outFields;//for order

          this.layerLoaderForKey = new JimuQuery({
            url: this.layerUrl,
            query: query,
            pageSize: this.pageSize
          });

          this.isKeyQueryLoader = true;
          this._uniqueValueCacheForOtherTypes = {};
          this._addNextPage(true).then(lang.hitch(this, function(valueLabels) {
            def.resolve(valueLabels);
          }), lang.hitch(this, function(err){
            def.reject('reject:' + err);
          }));
          return def;
        },

        _searchKeyLocal: function(name){
          this.isKeyQueryLoader = false;
          var resultData = [];
          var fieldName = this.fieldInfo.name;
          var cacheData = this._codedvalueCache;
          var valueLabels;
          var item, value;
          if(cacheData.length > 0){ //coded value
            for(var key1 in cacheData){
              item = cacheData[key1];
              value = item.label;
              if(value && value.toString().toUpperCase().indexOf(name.toUpperCase()) >= 0){//value could be null or others
                resultData.push(item);
              }
            }
            valueLabels = resultData;
          }else{
            cacheData = this._uniqueValueCache;
            for(var key2 in cacheData){
              var items = cacheData[key2];
              for( var index in items){
                item = items[index];
                value = item.attributes[fieldName];
                if(value && value.toString().toUpperCase().indexOf(name.toUpperCase()) >= 0){//value could be null or others
                  resultData.push(item);
                }
              }
            }
            valueLabels = this._getConvertData(resultData);
          }
          return valueLabels;
        },

        _getConvertData: function(valueLabels){
          var valObjArray = [];
          var fieldName = this.fieldInfo.name;
          array.map(valueLabels, function(item){
            var value = item.attributes[fieldName];
            valObjArray.push({value: value, label: value});
          });
          return valObjArray;
        },

        //get dataList with valueLabel's format include codedvalue
        //for v6.3, could resove #13334 decimal point
        /*
        _getConvertDataNew: function(valueLabels){
          var fieldName = this.fieldInfo.name;
          var fieldPopupInfo = this.fieldPopupInfo;
          var values = array.map(valueLabels, function(item){
            return item.attributes[fieldName].value;
          });
          var valObjArray = jimuUtils._getValues(this.layerDefinition, this.fieldPopupInfo, fieldName, values);
          return valObjArray;
        },
        */

        getPageValueDef: function(ifFristPage){
          var def = new Deferred();
          this.queryByPage(ifFristPage).then(lang.hitch(this, function(geometryList){
            var valueLabels = this._getConvertData(geometryList);
            def.resolve(valueLabels);
          }), lang.hitch(this, function(err){
            def.reject('reject:' + err);
          }));
          return def;
        },

        queryByPage: function(ifFristPage){
          var def = new Deferred();

          //jimuQuery will remember the totalcount after first query,
          //so need new a query to get count for new exprs
          if(this.layerLoader && (this.layerLoader.query.where !== this.cascadeFilterExprs)){
            this.layerLoader = null;
            this.isKeyQueryLoader = false;
            this.reset();//need to test
          }

          if(!this.layerLoader){
            var query = new EsriQuery();
            query.where = this.cascadeFilterExprs;
            query.geometry = null;
            // query.outSpatialReference = this.map.spatialReference;
            query.outSpatialReference = this.spatialReference;
            //outFields&returnDistinctValues can work only when returnGeometry is false
            query.outFields = [this.fieldInfo.name];
            query.returnDistinctValues = true;
            query.returnGeometry = false;
            query.orderByFields = query.outFields;//for order

            this.layerLoader = new JimuQuery({
              url: this.layerUrl,
              query: query,
              pageSize: this.pageSize
            });
          }

          if(ifFristPage){ //init pageindex
            this.pageIndex = 1;
          }

          var cacheFeatures = [], loader;
          if(this.isKeyQueryLoader){
            if(this._uniqueValueCacheForOtherTypes[this.pageIndex]){
              cacheFeatures = this._resolveFeaturesFromCache(this._uniqueValueCacheForOtherTypes);
              def.resolve(cacheFeatures);
              return def;
            }else{
              loader = this.layerLoaderForKey;
            }
          }else{
            if(this._uniqueValueCache[this.pageIndex]){
              cacheFeatures = this._resolveFeaturesFromCache(this._uniqueValueCache);
              def.resolve(cacheFeatures);
              return def;
            }else{
              loader = this.layerLoader;
            }
          }

          if(this.queryType === 1){
            loader.queryByPage(this.pageIndex).then(lang.hitch(this, function(response){
              if(response){
                var features = response.features || [];

                var featuresLength = features.length; //for calc cache
                if(!this.showNullValues){
                  features = this._getNotNullValues(features);
                }

                if(!this.isKeyQueryLoader){//only cache the data list which has no conditions
                  this._uniqueValueCache[this.pageIndex - 1] = features;
                  if(featuresLength < this.pageSize){
                    this._uniqueValueCache[this.pageIndex] = [];
                    this._isUniqueValueCacheFinish = true;
                  }
                }else{
                  this._uniqueValueCacheForOtherTypes[this.pageIndex - 1] = features;
                  if(featuresLength < this.pageSize){
                    this._uniqueValueCacheForOtherTypes[this.pageIndex] = [];
                  }
                }
                if(features.length === 0){
                  this.pageIndex --;
                }
                def.resolve(features);
              }else{
                def.reject("Can't get features from current layer");
              }
            }), lang.hitch(this, function(err){
              def.reject(err);
            }));
          } else{ //get all features
            loader.getAllFeatures().then(lang.hitch(this, function(response){
              if(response){
                var features = response.features || [];
                if(!this.showNullValues){
                  features = this._getNotNullValues(features);
                }
                var isReturnFeatures = features.length > 0 ? true : false;

                features = this._getDistinctValues(features);
                if(this.isKeyQueryLoader){
                  features = this._getAndStoreFeaturesForOtherTypes(features, this._uniqueValueCacheForOtherTypes);
                }else{//only cache the data list which has no conditions
                  features = this._getAndStoreFeaturesForOtherTypes(features, this._uniqueValueCache);
                }
                this._isUniqueValueCacheFinish = true;

                var reFeatures = isReturnFeatures ? features: [];
                def.resolve(reFeatures);
              }else{
                def.reject("Can't get features from current layer");
              }
            }), lang.hitch(this, function(err){
              def.reject(err);
            }));
          }
          this.pageIndex ++;
          return def;
        },

        _resolveFeaturesFromCache: function(cacheFeatures){
          var features = cacheFeatures[this.pageIndex];
          if(features.length !== 0){
            this.pageIndex ++;
          }
          // console.log('from cache');
          return features;
        },

        _getAndStoreFeaturesForOtherTypes: function(features, cacheFeatures){
          for(var key = 0; key < features.length; key = key + this.pageSize){
            cacheFeatures[parseInt(key / this.pageSize, 10) + 1] = features.slice(key, key + this.pageSize);
          }
          for(var k in cacheFeatures){
            var next = parseInt(k, 10) + 1;
            if(!cacheFeatures[next]){
              cacheFeatures[next] = [];
            }
          }
          return cacheFeatures[1];//return the data of first page
        },

        _getDistinctValues: function(features){
          var hash = {};
          var distinctFeatures = [];
          for(var key in features){
            var feature = features[key];
            var featureVal = feature.attributes[this.fieldInfo.name];
            if(!hash[featureVal]){
              hash[featureVal] = featureVal;
              distinctFeatures.push(feature);
            }
          }
          return distinctFeatures;
        },

        //value could be undefined or null or ''
        _getNotNullValues: function(features){
          features = array.filter(features, lang.hitch(this, function(feature){
            var featureVal = feature.attributes[this.fieldInfo.name];
            return featureVal !== '<Null>' && featureVal !== null;
          }));
          return features;
        }

      });
  });