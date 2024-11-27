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
  'dojo/_base/array',
  'dojo/when',
  "esri/tasks/StatisticDefinition",
  "esri/tasks/QueryTask",
  "esri/tasks/query",
  "esri/lang",
  'jimu/utils',
  'jimu/LayerInfos/LayerInfos',
  'exports'
], function(array, when,
  StatisticDefinition, QueryTask, Query, esriLang, jimuUtils, LayerInfos, exports) {
  var supportTypes = ["count", "sum", "min", "max", "avg", "stddev"];
  var typeLabels = {
    "count": "countField",
    "sum": "sumField",
    "min": "minField",
    "max": "maxField",
    "avg": "avgField",
    "stddev": "stddevField"
  };

  /**
   * Get the statistics
   * @param  {Object} params {
   *  layer:
   *  filterExpression: //to filter the layer data
   *  geometry: //to filter the layer data
   *  featureSet:
   *  fieldName:
   *  statisticTypes:
   * }
   * @return {Array}        [description]
   */
  exports.getStatisticsResult = function(params) {
    return getFieldInfos(params).then(function(fieldInfos){
      params.fieldInfos = fieldInfos;

      if(params.featureSet){
        return getStatisticsResultFromClient(params);
      }else if(params.layer){
        if(params.layer.url){
          return getStatisticsResultFromServer(params);
        }else{
          params.featureSet = jimuUtils.toFeatureSet(params.layer.graphics);
          return getStatisticsResultFromClient(params);
        }
      }
    });
  };

  exports.isStatFromServer = function(params){
    return params.layer && params.layer.url;
  };

  exports.getStddevVal = getStddevVal;

  exports.getStatisticsResultFromClientSync = getStatisticsResultFromClientSync;

  function getStatisticsResultFromServer(params){
    var query, queryTask;

    query = new Query();
    query.outFields = [params.fieldName];
    query.outStatistics = [];
    query.geometry = params.geometry;

    var stypes = getTypesFromParam(params);
    array.forEach(stypes, function(t) {
      var def = new StatisticDefinition();
      def.statisticType = t;
      def.displayFeildName = params.fieldName;
      def.onStatisticField = params.fieldName;
      def.outStatisticFieldName = typeLabels[t];
      query.outStatistics.push(def);
    });

    query.where = params.filterExpression?
      params.filterExpression:
      params.layer.getDefinitionExpression()?
        params.layer.getDefinitionExpression(): "1=1";
    if(params.geometry){
      query.geometry = params.geometry;
    }

    queryTask = new QueryTask(params.layer.url);

    return queryTask.execute(query).then(function(result) {
      if (result && result.features && result.features.length > 0) {
        var attributes = result.features[0].attributes;
        formatResults(params, attributes);
        return attributes;
      } else {
        return [];
      }
    });
  }

  function getStatisticsResultFromClientSync(params){
    var attributes = {
      countField: 0,
      sumField: 0
    };
    var stypes = getTypesFromParam(params);
    var c = 0, s = 0;
    params.featureSet.features.forEach(function(feature){
      var val = feature.attributes[params.fieldName];
      if(val === null || typeof val === 'undefined'){
        return;
      }
      stypes.forEach(function(statisticType){
        //"count", "sum", "min", "max", "avg", "stddev"
        switch(statisticType){
          case 'count':
            attributes.countField ++;
            break;
          case 'sum':
            attributes.sumField += val;
            break;
          case 'min':
            if(typeof attributes.minField === 'undefined'){
              attributes.minField = val;
            }else{
              attributes.minField = Math.min(attributes.minField, val);
            }
            break;
          case 'max':
            if(typeof attributes.maxField === 'undefined'){
              attributes.maxField = val;
            }else{
              attributes.maxField = Math.max(attributes.maxField, val);
            }
            break;
          case 'avg':
            c++;
            s += val;
            break;
          case 'stddev':
            break;
        }
      });
    });

    if(c === 0){
      attributes.avgField = 0;
    }else{
      attributes.avgField = (c === 0)? '': s / c;
    }

    var vals = params.featureSet.features.filter(function(feature){
      var val = feature.attributes[params.fieldName];
      if(val === null || typeof val === 'undefined'){
        return false;
      }
      return true;
    }).map(function(feature){
      var val = feature.attributes[params.fieldName];
      return val;
    });

    attributes.stddevField = getStddevVal(vals);

    formatResults(params, attributes);
    return attributes;
  }

  function getStatisticsResultFromClient(params){
    return when(getStatisticsResultFromClientSync(params));
  }

  function getTypesFromParam(params){
    return params.statisticTypes && params.statisticTypes.length > 0 ?
    supportTypes.filter(function(t){
      return params.statisticTypes.indexOf(t) > -1;
    }): supportTypes;
  }

  function getStddevVal(vals){
    var n = vals.length;
    if(n <= 1){
      return 0;
    }

    var sum = 0;
    vals.forEach(function(v){
      sum += v;
    });

    var avg = sum / n;
    var sum2 = 0;
    vals.forEach(function(v){
      sum2 += Math.pow((v - avg), 2);
    });

    return Math.sqrt(1 / (n - 1) * sum2);
  }

  function getFieldInfos(params){
    var layerInfos = LayerInfos.getInstanceSync();
    if(params.layer){
      return layerInfos.getLayerOrTableInfoById(params.layer.id).loadInfoTemplate()
      .then(function(infoTemplate){
        var fieldInfos = {};
        if(infoTemplate.info && infoTemplate.info.fieldInfos){
          infoTemplate.info.fieldInfos.forEach(function(fieldInfo){
            fieldInfos[fieldInfo.fieldName] = fieldInfo;
          });
        }
        return fieldInfos;
      });
    }else{
      return when({});
    }
  }

  function formatResults(params, attributes){
    if(!params.fieldInfos || !params.fieldInfos[params.fieldName]){
      return;
    }
    for(var p in attributes){
      if(p === 'countField' || !esriLang.isDefined(attributes[p])){
        continue;
      }
      if(attributes[p] === null || typeof attributes[p] === 'undefined'){
        attributes[p]  = '';
        continue;
      }
      attributes[p] =
        jimuUtils.localizeNumberByFieldInfo(attributes[p], params.fieldInfos[params.fieldName]);
    }
  }

});