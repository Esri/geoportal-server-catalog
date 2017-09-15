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
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/Deferred',
  'jimu/utils',
  'jimu/ServiceBrowserRule'
],
function(lang, array, Deferred, jimuUtils, ServiceBrowserRule) {

  var mo = {};

  //combine multiple rules into one rule
  mo.combineRules = function(rules){
    var allRule = new ServiceBrowserRule();
    //override leafTypes and serviceTypes
    array.forEach(rules, function(rule){
      //iterator for leafTypes
      array.forEach(rule.leafTypes, function(leafType){
        if(allRule.leafTypes.indexOf(leafType) < 0){
          allRule.leafTypes.push(leafType);
        }
      });

      //iterator for serviceTypes
      array.forEach(rule.serviceTypes, function(serviceType){
        if(allRule.serviceTypes.indexOf(serviceType) < 0){
          allRule.serviceTypes.push(serviceType);
        }
      });
    });

    allRule.getMatchedRule = function(url){
      var matchedRule = null;
      array.some(rules, function(rule){
        if(rule.isUrlContainsServiceType(url)){
          matchedRule = rule;
          return true;
        }else{
          return false;
        }
      });
      return matchedRule;
    };

    //override getItem method
    allRule.getItem = function(url){
      var result = null;
      var matchedRule = allRule.getMatchedRule(url);
      if(matchedRule){
        result = matchedRule.getItem(url);
      }else{
        result = allRule.defaultGetItem(url);
      }
      return result;
    };

    //override getSubItemUrls method
    allRule.getSubItemUrls = function(url){
      var result = null;
      var matchedRule = allRule.getMatchedRule(url);
      if(matchedRule){
        result = matchedRule.getSubItemUrls(url);
      }else{
        result = allRule.defaultGetSubItemUrls(url);
      }
      return result;
    };

    allRule.getIconImageName = function(item, opened){
      var imageName = '';
      if(item.url){
        var matchedRule = allRule.getMatchedRule(item.url);
        if(matchedRule && typeof matchedRule.getIconImageName === 'function'){
          imageName = matchedRule.getIconImageName(item, opened);
        }
      }
      return imageName;
    };

    return allRule;
  };

  mo.getFeaturelayerServiceBrowserRule = function(_types, isSupportQuery){
    //init types
    var types = lang.clone(_types);
    var allTypes = ['point', 'polyline', 'polygon'];
    if (lang.isArrayLike(types) && types.length > 0) {
      types = array.filter(types, function(type) {
        return allTypes.indexOf(type) >= 0;
      });
      if (types.length === 0) {
        types = allTypes;
      }
    } else {
      types = allTypes;
    }

    return mo._getFeaturelayerServiceBrowserRule(types, isSupportQuery);
  };

  mo._getFeaturelayerServiceBrowserRule = function(types, shouldSupportQuery){
    var rule = new ServiceBrowserRule({
      types: types,
      leafTypes: ['Feature Layer', 'Table'],
      serviceTypes: ['MapServer', 'FeatureServer'],
      _groupLayerType: 'Group Layer',
      _featureLayerType: 'Feature Layer',
      _tableType: 'Table',

      //override
      getItem: function(url){
        var  def = new Deferred();
        if(this.isUrlEndWithServiceType(url, this.serviceTypes)){
          def = this.defaultGetItem(url);
        }else{
          this.getRestInfo(url).then(lang.hitch(this, function(layerDefinition){
            var item = this._getItemByLayerDefinition(url, layerDefinition);
            def.resolve(item);
          }), lang.hitch(this, function(err){
            def.reject(err);
          }));
        }
        return def;
      },

      //override
      getSubItemUrls: function(url){
        var def = new Deferred();
        if(this.isUrlEndWithServiceType(url)){
          def = this._getSubUrlsByServiceUrl(url);
        }else{
          def = this._getSubUrlsByGroupUrl(url);
        }
        return def;
      },

      //override
      getIconImageName: function(item, opened) {
        var imageName = '';
        if (item.type === 'MapServer' || item.type === 'FeatureServer') {
          if (opened) {
            imageName = 'mapserver_open.png';
          } else {
            imageName = 'mapserver_close.png';
          }
        } else if (item.type === this._groupLayerType) {
          if (opened) {
            imageName = 'group_layer2.png';
          } else {
            imageName = 'group_layer1.png';
          }
        } else if (item.type === this._featureLayerType) {
          var esriType = item.definition && item.definition.geometryType;
          var geoType = jimuUtils.getTypeByGeometryType(esriType);
          if (geoType === 'point') {
            imageName = 'point_layer1.png';
          } else if (geoType === 'polyline') {
            imageName = 'line_layer1.png';
          } else if (geoType === 'polygon') {
            imageName = 'polygon_layer1.png';
          }
        } else if(item.type === this._tableType){
          imageName = "table.png";
        } else if (item.type === 'root') {
          if (this._currentUrl) {
            var isMapFeatureServer = array.some(this.serviceTypes,
              lang.hitch(this, function(serviceType) {
                return jimuUtils.isStringEndWith(this._currentUrl, '/' + serviceType);
              }));

            if (isMapFeatureServer) {
              if (opened) {
                imageName = 'mapserver_open.png';
              } else {
                imageName = 'mapserver_close.png';
              }
            }
          }
        }

        return imageName;
      },

      _getSubUrlsByServiceUrl: function(serviceUrl) {
        var def = new Deferred();
        this.getRestInfo(serviceUrl).then(lang.hitch(this, function(serviceMeta) {
          var urls = [];
          array.forEach(serviceMeta.layers, lang.hitch(this, function(layerInfo) {
            var hasParent = layerInfo.parentLayerId >= 0;
            if (!hasParent) {
              var url = serviceUrl + '/' + layerInfo.id;
              urls.push(url);
            }
          }));
          def.resolve(urls);
        }), lang.hitch(this, function(err) {
          def.reject(err);
        }));
        return def;
      },

      _getSubUrlsByGroupUrl: function(groupLayerUrl) {
        var def = new Deferred();
        this.getRestInfo(groupLayerUrl).then(lang.hitch(this, function(layerDefinition) {
          var urls = [];
          if (layerDefinition.type === this._groupLayerType) {
            var serviceUrl = this._getServiceUrlByLayerUrl(groupLayerUrl);
            var subLayers = layerDefinition.subLayers || [];
            urls = array.map(subLayers, lang.hitch(this, function(subLayer) {
              return serviceUrl + '/' + subLayer.id;
            }));
          }
          def.resolve(urls);
        }), lang.hitch(this, function(err) {
          def.reject(err);
        }));
        return def;
      },

      _getItemByLayerDefinition: function(layerUrl, layerDefinition) {
        //layerUrl maybe a group url or feature layer url
        var item = null;
        var type = layerDefinition.type;
        if (type === this._groupLayerType) {
          item = {
            name: layerDefinition.name,
            type: type,
            url: layerUrl,
            definition: layerDefinition
          };
        } else if (type === this._featureLayerType || type === this._tableType) {
          //check geometry type
          var isPassGeoTypeCheck = false;

          if(type === this._featureLayerType){
            //it is a feature layer
            isPassGeoTypeCheck = this._validateEsriGeometryType(layerDefinition.geometryType);
          }else if(type === this._tableType){
            //it is a table and let the table pass the geometryType check
            isPassGeoTypeCheck = true;
          }

          if(isPassGeoTypeCheck){
            var isPassQueryCheck = false;

            if(shouldSupportQuery){
              //check query/data capability
              var capabilities = layerDefinition.capabilities;
              isPassQueryCheck = jimuUtils.isFeaturelayerUrlSupportQuery(layerUrl, capabilities);
            }else{
              isPassQueryCheck = true;
            }

            if(isPassQueryCheck){
              item = {
                name: layerDefinition.name,
                type: type,
                url: layerUrl,
                definition: layerDefinition
              };
            }
          }
        }
        return item;
      },

      _validateEsriGeometryType: function(esriType){
        var type = jimuUtils.getTypeByGeometryType(esriType);
        return this.types.indexOf(type) >= 0;
      },

      _getServiceUrlByLayerUrl: function(layerUrl) {
        var serviceUrl = '';
        for (var i = 0; i < this.serviceTypes.length; i++) {
          var serviceType = this.serviceTypes[i].toLowerCase();
          var lastIndex = layerUrl.toLowerCase().lastIndexOf('/' + serviceType + '/');
          if (lastIndex >= 0) {
            serviceUrl = layerUrl.slice(0, lastIndex + serviceType.length + 1);
            return serviceUrl;
          }
        }
        return serviceUrl;
      }
    });

    return rule;
  };

  mo.getGeocodeServiceBrowserRule = function(){
    var rule = new ServiceBrowserRule({
      leafTypes: ['GeocodeServer'],
      serviceTypes:['GeocodeServer']
    });
    return rule;
  };

  mo.getGpServiceBrowserRule = function(){
    var rule = new ServiceBrowserRule({
      leafTypes: ['GPTask'],
      serviceTypes: ['GPServer'],

      //override
      getItem: function(url){
        var def = new Deferred();
        if(this.isUrlEndWithServiceType(url)){
          //GPServer service url
          def = this.defaultGetItem(url);
        }else{
          //GP task url
          this.getRestInfo(url).then(lang.hitch(this, function(taskDefinition){
            var item = {
              name: taskDefinition.displayName || taskDefinition.name,
              type: 'GPTask',
              url: url,
              definition: taskDefinition
            };
            def.resolve(item);
          }), lang.hitch(this, function(err){
            def.reject(err);
          }));
        }
        return def;
      },

      //override
      getSubItemUrls: function(url){
        var def = new Deferred();
        if(this.isUrlEndWithServiceType(url)){
          this.getRestInfo(url).then(lang.hitch(this, function(serviceMeta){
            var tasks = serviceMeta.tasks || [];
            var urls = array.map(tasks, lang.hitch(this, function(taskName){
              return url + '/' + taskName;
            }));
            def.resolve(urls);
          }), lang.hitch(this, function(err){
            def.reject(err);
          }));
        }else{
          def.resolve([]);
        }
        return def;
      },

      //override
      getIconImageName: function(item, opened){
        /*jshint unused: false*/
        var imageName = '';
        if (item.type === 'GPServer') {
          imageName = 'toolbox.png';
        } else if (item.type === 'GPTask') {
          imageName = 'tool.png';
        }
        return imageName;
      }
    });

    return rule;
  };

  mo.getImageServiceBrowserRule = function(isSupportQuery){
    var rule = new ServiceBrowserRule({
      leafTypes: ['ImageServer'],
      serviceTypes: ['ImageServer'],

      //override
      getItem: function(url){
        var def = new Deferred();
        if(this.isUrlEndWithServiceType(url)){
          //ImageServer service url
          this.defaultGetItem(url).then(lang.hitch(this, function(item){
            if(isSupportQuery){
              if(jimuUtils.isImageServiceSupportQuery(item.definition.capabilities)){
                def.resolve(item);
              }else{
                def.resolve(null);
              }
            }else{
              def.resolve(item);
            }
          }), lang.hitch(this, function(err){
            def.reject(err);
          }));
        }else{
          def.resolve(null);
        }
        return def;
      },

      //override
      getIconImageName: function(item, opened){
        /*jshint unused: false*/
        var imageName = '';
        if(item.type === 'ImageServer'){
          imageName = 'image_layer.png';
        }
        return imageName;
      }
    });
    return rule;
  };

  mo.getQueryableServiceBrowserRule = function(){
    var featureServiceRule = mo.getFeaturelayerServiceBrowserRule(['point', 'polyline', 'polygon'],
                                                                  true);
    var imageServiceRule = mo.getImageServiceBrowserRule(true);
    var rule = mo.combineRules([featureServiceRule, imageServiceRule]);
    return rule;
  };

  return mo;
});