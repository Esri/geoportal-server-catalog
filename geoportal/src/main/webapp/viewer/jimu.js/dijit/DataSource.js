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
    'dojo/on',
    'dojo/Evented',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/dijit/TabContainer3',
    'jimu/dijit/_FeaturelayerChooserWithButtons',
    'jimu/dijit/_QueryableLayerChooserWithButtons',
    'jimu/dijit/QueryableServiceChooserFromPortal',
    'jimu/dijit/_QueryableServiceChooserContent',
    'jimu/dijit/_FrameworkDataSourceChooserWithButtons'
  ],
  function(on, Evented, lang, html, array, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    TabContainer3, FeaturelayerChooserWithButtons, QueryableLayerChooserWithButtons,
    QueryableServiceChooserFromPortal, _QueryableServiceChooserContent, _FrameworkDataSourceChooserWithButtons) {

    var NLS = window.jimuNls.queryableLayerSource;

    var clazz = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
      templateString: "<div></div>",
      baseClass: 'jimu-dijit-data-source',
      declaredClass: 'jimu.dijit.DataSource',
      nls: null,
      dijits: null,

      //options:
      types: null, //[{type: "", options: {}},...]

      //public methods:
      //getSelectedItems

      //events:
      //ok
      //cancel

      postMixInProperties: function() {
        this.nls = NLS;
        this.dijits = [];
      },

      postCreate: function() {
        this.inherited(arguments);
        this._initSelf();
      },

      _initSelf: function(){
        var tabs = [];

        array.forEach(this.types, lang.hitch(this, function(item, index){
          var type = item.type;
          var classInfo = clazz[type + '_CLASS_INFO'];

          if(!classInfo){
            console.error("Unsupported data source type:", type);
            return;
          }

          var options = null;

          if(classInfo.defaultOptions){
            var defaultOptions = lang.clone(classInfo.defaultOptions);
            options = lang.mixin(defaultOptions, item.options);
          }else{
            options = item.options;
          }

          if(!options){
            options = {};
          }

          options.style = {
            width: '100%',
            height: '100%'
          };

          var dataSourceId = type + "_" + index;
          var dsType = type;

          var dsDijit = new classInfo.className(options);
          html.addClass(dsDijit.domNode, 'hidden');
          dsDijit._dsType = dsType;
          dsDijit._dataSourceId = dataSourceId;
          dsDijit._classInfo = classInfo;
          this.own(on(dsDijit, 'ok', lang.hitch(this, function() {
            var items = this.getSelectedItems();
            if (items && items.length > 0) {
              this.emit('ok', items);
            }
          })));
          this.own(on(dsDijit, 'cancel', lang.hitch(this, function() {
            this.emit('cancel');
          })));
          this.dijits.push(dsDijit);

          tabs.push({
            title: classInfo.defaultTitle,
            content: dsDijit
          });
        }));

        this.tab = new TabContainer3({
          tabs: tabs
        });
        this.tab.placeAt(this.domNode);
      },

      _getSelectedDijit: function(){
        var index = this.tab.getSelectedIndex();
        return this.dijits[index];
      },

      getSelectedSourceType: function() {
        var dsDijit = this._getSelectedDijit();
        if(dsDijit){
          return dsDijit._classInfo.sourceType;
        }
        return "";
      },

      getSelectedItems: function() {
        var items = [];
        var dsDijit = this._getSelectedDijit();
        if(dsDijit){
          items = dsDijit.getSelectedItems();
          if(items && items.length > 0){
            array.forEach(items, lang.hitch(this, function(item){
              item.dataSourceType = dsDijit._dsType;
            }));
          }
        }
        return items;
      },

      destroy: function(){
        if(this.dijits && this.dijits.length > 0){
          array.forEach(this.dijits, lang.hitch(this, function(dsDijit){
            dsDijit.destroy();
            dsDijit = null;
          }));
        }
        this.dijits = null;
        this.inherited(arguments);
      }
    });

    clazz.DATA_SOURCE_FEATURE_LAYER_FROM_MAP = "DATA_SOURCE_FEATURE_LAYER_FROM_MAP";
    clazz.DATA_SOURCE_QUERYABLE_LAYER_FROM_MAP = "DATA_SOURCE_QUERYABLE_LAYER_FROM_MAP";
    clazz.DATA_SOURCE_QUERYABLE_LAYER_FROM_PORTAL = "DATA_SOURCE_QUERYABLE_LAYER_FROM_PORTAL";
    clazz.DATA_SOURCE_QUERYABLE_LAYER_FROM_URL = "DATA_SOURCE_QUERYABLE_LAYER_FROM_URL";
    clazz.DATA_SOURCE_FROM_FRAMEWORK = "DATA_SOURCE_FROM_FRAMEWORK";

    clazz.DATA_SOURCE_FEATURE_LAYER_FROM_MAP_CLASS_INFO = {
      className: FeaturelayerChooserWithButtons,
      defaultTitle: NLS.selectFromMap,
      defaultOptions: {
        multiple: false
      },
      sourceType: 'map'
    };

    clazz.DATA_SOURCE_QUERYABLE_LAYER_FROM_MAP_CLASS_INFO = {
      className: QueryableLayerChooserWithButtons,
      defaultTitle: NLS.selectFromMap,
      defaultOptions: {
        multiple: false
      },
      sourceType: 'map'
    };

    clazz.DATA_SOURCE_QUERYABLE_LAYER_FROM_PORTAL_CLASS_INFO = {
      className: QueryableServiceChooserFromPortal,
      defaultTitle: NLS.selectFromPortal,
      defaultOptions: {
        multiple: false
      },
      sourceType: 'portal'
    };

    clazz.DATA_SOURCE_QUERYABLE_LAYER_FROM_URL_CLASS_INFO = {
      className: _QueryableServiceChooserContent,
      defaultTitle: NLS.addServiceUrl,
      defaultOptions: {
        multiple: false
      },
      sourceType: 'url'
    };

    clazz.DATA_SOURCE_FROM_FRAMEWORK_CLASS_INFO = {
      className: _FrameworkDataSourceChooserWithButtons,
      defaultTitle: window.jimuNls.frameworkDatasource.customDataSource,
      defaultOptions: null,
      sourceType: 'framework'
    };

    //options: {createMapResponse, portalUrl}
    clazz.createQueryableLayerTypes = function(options) {
      return [{
        type: clazz.DATA_SOURCE_QUERYABLE_LAYER_FROM_MAP,
        options: {
          createMapResponse: options.createMapResponse,
          onlyShowWebMapLayers: true
        }
      }, {
        type: clazz.DATA_SOURCE_QUERYABLE_LAYER_FROM_PORTAL,
        options: {
          portalUrl: options.portalUrl
        }
      }, {
        type: clazz.DATA_SOURCE_QUERYABLE_LAYER_FROM_URL
      }];
    };

    //options: {createMapResponse, appConfig}
    clazz.createInfographicTypes = function(options){
      return [{
        type: clazz.DATA_SOURCE_FEATURE_LAYER_FROM_MAP,
        options: {
          createMapResponse: options.createMapResponse,
          types: ['point','polyline','polygon'],
          showLayerFromFeatureSet: true,
          showTable: false,
          mustSupportStatistics: false,
          ignoreVirtualLayer: true,
          onlyShowWebMapLayers: true
        }
      }, {
        type: clazz.DATA_SOURCE_FROM_FRAMEWORK,
        options: {
          appConfig: options.appConfig
        }
      }];
    };

    return clazz;
  });