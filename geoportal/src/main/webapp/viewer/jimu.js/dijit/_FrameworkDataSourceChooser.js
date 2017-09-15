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
    'dojo/Evented',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/store/Memory',
    'dojo/store/Observable',
    'dijit/tree/ObjectStoreModel',
    'jimu/dijit/_Tree',
    'jimu/DataSourceManager'
  ],
  function(Evented, lang, html, array, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Memory,
    Observable, ObjectStoreModel, JimuTree, DataSourceManager) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'jimu-dijit-framework-datasource-chooser',

      templateString: '<div>' +
        '<div class="no-data-section">' +
          '<div class="jimu-widget-note tip1">${nls.noExtraDsAvailable}</div>' +
          '<div class="jimu-widget-note tip2">${nls.addExtraDsTip}</div>' +
        '</div>' +
      '</div>',

      dataSourceManager: null,

      _store: null,

      _id: 0,

      tree: null,//types: root,widgetsOutput,widgetLabel,widgetDataSource,layerDataSource,statisticsDataSource

      //options:
      appConfig: null,

      postMixInProperties:function(){
        this.nls = window.jimuNls.frameworkDatasource;
        this.dataSourceManager = DataSourceManager.getInstance();
      },

      postCreate: function() {
        this.inherited(arguments);
        html.addClass(this.domNode, 'no-data');
        this._createTree();
        var dataSources = this.appConfig.dataSource && this.appConfig.dataSource.dataSources;
        if(!dataSources){
          return;
        }
        var dsKeys = Object.keys(dataSources);
        var widgetDS = {};//{widgetId: {widgetInfo: {}, arr: []}}
        var layerDS = [];
        var statisticsDS = [];
        array.forEach(dsKeys, lang.hitch(this, lang.hitch(this, function(dsId){
          //{from: 'map', layerId}
          //{from: 'widget', widgetId}
          //{from: 'external'}
          var dsTypeInfo = this.dataSourceManager.parseDataSourceId(dsId);
          var ds = dataSources[dsId];
          if(dsTypeInfo){
            var item = {
              dsId: dsId,
              dsTypeInfo: dsTypeInfo,
              ds: ds
            };
            if(dsTypeInfo.from === 'widget'){
              var widgetId = dsTypeInfo.widgetId;
              if(widgetId){
                if(!widgetDS[widgetId]){
                  widgetDS[widgetId] = {
                    widgetInfo: this.appConfig.getConfigElementById(widgetId),
                    arr: []
                  };
                }
                widgetDS[widgetId].arr.push(item);
              }
            }else{
              if(ds.type === 'Features'){
                layerDS.push(item);
              }else if(ds.type === 'FeatureStatistics'){
                statisticsDS.push(item);
              }
            }
          }
        })));

        var widgetIds = Object.keys(widgetDS);

        if(widgetIds.length > 0){
          this._addWidgetsOutpusItem();
          array.forEach(widgetIds, lang.hitch(this, function(widgetId){
            //{widgetInfo: {}, arr: []}
            var item = widgetDS[widgetId];

            var widgetLabel = item.widgetInfo && item.widgetInfo.label;
            if(!widgetLabel){
              widgetLabel = widgetId;
            }

            var widgetLabelItem = this._addWidgetLabelItem(widgetLabel);

            if(item.arr && item.arr.length > 0){
              array.forEach(item.arr, lang.hitch(this, function(info){
                //info: {dsTypeInfo, ds}
                //dsTypeInfo: {from, widgetId}
                //ds: {id, label, dataSchema}
                this._addWidgetDataSourceItem(widgetLabelItem.id, info.ds.label, info.ds.id);
              }));
            }
          }));
        }

        if(layerDS.length > 0){
          array.forEach(layerDS, lang.hitch(this, function(info){
            this._addLayerDataSource(info.ds.label, info.ds.id);
          }));
        }

        if(statisticsDS.length > 0){
          array.forEach(statisticsDS, lang.hitch(this, function(info){
            this._addStatisticsDataSource(info.ds.label, info.ds.id);
          }));
        }

        if(widgetIds.length > 0 || layerDS.length > 0 || statisticsDS.length > 0){
          html.removeClass(this.domNode, 'no-data');
        }
      },

      getSelectedItems: function(){
        var items = this.tree.getSelectedItems();
        items = array.map(items, lang.hitch(this, function(item){
          return {
            dsId: item.dsId,
            name: item.name
          };
        }));
        return items;
      },

      _createTree: function() {
        var rootItem = this._getRootItem();
        var myMemory = new Memory({
          data: [rootItem],
          getChildren: function(object) {
            return this.query({
              parent: object.id
            });
          }
        });

        // Wrap the store in Observable so that updates to the store are reflected to the Tree
        this._store = new Observable(myMemory);

        var myModel = new ObjectStoreModel({
          store: this._store,
          query: {
            id: "root"
          },
          mayHaveChildren: lang.hitch(this, this._mayHaveChildren)
        });

        this.tree = new JimuTree({
          multiple: false,
          model: myModel,
          showRoot: false,
          isLeafItem: lang.hitch(this, this._isLeafItem),

          style: {
            width: "100%"
          },

          onOpen: lang.hitch(this, function(item, node) {
            if (item.id === 'root') {
              return;
            }
            this._onTreeOpen(item, node);
          }),

          onClick: lang.hitch(this, function(item, node, evt) {
            this._onTreeClick(item, node, evt);
            this.emit('tree-click', item, node, evt);
          }),

          getIconStyle: lang.hitch(this, function(item, opened) {
            var icon = null;
            if (!item || item.id === 'root') {
              return null;
            }

            var a = {
              width: "20px",
              height: "20px",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              backgroundImage: ''
            };

            var baseUrl = "//" + window.location.host + require.toUrl("jimu");

            var imageName = this._getIconImageName(item, opened);

            if (imageName) {
              a.backgroundImage = "url(" + baseUrl + "/css/images/" + imageName + ")";
              icon = a;
            }

            return icon;
          })
        });

        this.tree.placeAt(this.domNode);
      },

      _addItem: function(type, parentId, name, isLeaf, hasChildren, dsId){
        this._id++;
        var item = {
          id: this._id.toString(),
          type: type,
          parent: parentId,
          name: name || "",
          isLeaf: isLeaf,
          hasChildren: hasChildren,
          dsId: dsId || ""
        };
        this._store.add(item);
        return item;
      },

      _getRootItem: function() {
        return {
          id: 'root',
          type: 'root',
          name: 'DataSource Root',
          isLeaf: false,
          hasChildren: true
        };
      },

      _addWidgetsOutpusItem: function(){
        var item = {
          id: 'widgetsOutput',
          type: 'widgetsOutput',
          parent: 'root',
          name: 'Widgets output',
          isLeaf: false,
          hasChildren: true
        };
        this._store.add(item);
        return item;
      },

      _addWidgetLabelItem: function(label){
        return this._addItem("widgetLabel", 'widgetsOutput', label, false, true);
      },

      _addWidgetDataSourceItem: function(parentId, label, dsId){
        return this._addItem("widgetDataSource", parentId, label, true, false, dsId);
      },

      _addLayerDataSource: function(label, dsId){
        return this._addItem("layerDataSource", "root", label, true, false, dsId);
      },

      _addStatisticsDataSource: function(label, dsId){
        return this._addItem("statisticsDataSource", "root", label, true, false, dsId);
      },

      _getIconImageName: function() {
        return "";
      },

      _mayHaveChildren: function(item) {
        return item.hasChildren;
      },

      _isLeafItem: function(item) {
        return item.isLeaf;
      },

      _onTreeOpen: function() {},

      _onTreeClick: function() {}
    });
  });