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
    'dojo/on',
    'dojo/Evented',
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/store/Memory',
    'dojo/Deferred',
    'dojo/store/Observable',
    'dijit/tree/ObjectStoreModel',
    'dojo/promise/all',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/_base/array',
    'jimu/utils',
    'jimu/dijit/_Tree',
    'jimu/LayerInfos/LayerInfos',
    'jimu/dijit/LoadingIndicator'
  ],
  function(on, Evented, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Memory, Deferred, Observable,
    ObjectStoreModel, all, lang, html, array, jimuUtils, JimuTree, LayerInfos, LoadingIndicator) {

    var LayerChooser = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
      templateString:'<div style="width:100%;">' +
        '<div data-dojo-attach-point="errorTipSection" class="error-tip-section">' +
          '<span class="jimu-icon jimu-icon-error"></span>' +
          '<span class="jimu-state-error-text" data-dojo-attach-point="errTip">' +
          '${nls.noLayersTip}</span>' +
        '</div>' +
      '</div>',
      _store: null,
      _id: 0,
      _treeClass: 'layer-chooser-tree',

      //constructor options:
      createMapResponse: null, //The response of method createMap.
      multiple: false, //Can select multiple layers or a single layer.
      onlyShowVisible: false,
      updateWhenLayerInfosIsShowInMapChanged: false,
      onlyShowWebMapLayers: false,
      displayTooltipForTreeNode: false,

      //public methods:
      //getSelectedItems

      //methods need to override:
      //getSelectedItems
      //filter

      //attributes:
      //tree

      //events:
      //tree-click
      //update

      postMixInProperties:function(){
        this.nls = window.jimuNls.basicLayerChooserFromMap;
      },

      postCreate: function() {
        this.inherited(arguments);
        html.addClass(this.domNode, 'jimu-basic-layer-chooser-from-map');
        this.multiple = !!this.multiple;

        this.shelter = new LoadingIndicator({hidden:true});
        this.shelter.placeAt(this.domNode);
        this.shelter.startup();

        this._createTree();
        this.basicFilter = lang.hitch(this, this.basicFilter);
        this.filter = LayerChooser.andCombineFilters([this.basicFilter, this.filter]);

        if(this.createMapResponse){
          this.setCreateMapResponse(this.createMapResponse);
        }
      },

      basicFilter: function(layerInfo){
        var def = new Deferred();
        if(this.onlyShowVisible){
          def.resolve(layerInfo.isShowInMap());
        }else{
          def.resolve(true);
        }
        return def;
      },

      //to be override, return Deferred object
      //if resolve true, means layerInfo can be displayed in tree
      filter: function(layerInfo){
        /*jshint unused: false*/
        var def = new Deferred();
        def.resolve(true);
        return def;
      },

      //return an array, each element has 'name' and 'layerInfo' attribute
      getSelectedItems: function(){
        var items = this.tree.getSelectedItems();
        var handledItems = array.map(items, lang.hitch(this, function(item){
          return this.getHandledItem(item);
        }));
        return handledItems;
      },

      //return an array, each element has 'name' and 'layerInfo' attribute
      getAllItems: function(){
        var items = this.tree.getAllItems();
        var handledItems = [];
        array.forEach(items, lang.hitch(this, function(item){
          if(item.id !== 'root'){
            var handledItem = this.getHandledItem(item);
            handledItems.push(handledItem);
          }
        }));
        return handledItems;
      },

      //to be override
      getHandledItem: function(item){
        return {
          name: item.name,
          layerInfo: item.layerInfo
        };
      },

      _isLeafItem: function(item) {
        return item.isLeaf;
      },

      setCreateMapResponse: function(createMapResponse){
        this.createMapResponse = createMapResponse;
        var map = this.createMapResponse.map;
        var mapItemInfo = this.createMapResponse.itemInfo;
        LayerInfos.getInstance(map, mapItemInfo).then(lang.hitch(this, function(layerInfosObj) {
          this.layerInfosObj = layerInfosObj;
          this.own(
            on(this.layerInfosObj, 'layerInfosChanged', lang.hitch(this, this._onLayerInfosChanged))
          );
          if(this.updateWhenLayerInfosIsShowInMapChanged){
            this.own(
              on(this.layerInfosObj, 'layerInfosIsShowInMapChanged',
                lang.hitch(this, this._onLayerInfosIsShowInMapChanged))
            );
          }
          this._buildTree(this.layerInfosObj);
        }));
      },

      _onLayerInfosChanged: function(layerInfo, changedType) {
        /*jshint unused: false*/
        this._buildTree(this.layerInfosObj);
        this.emit('update');
      },

      _onLayerInfosIsShowInMapChanged: function(changedLayerInfos){
        /*jshint unused: false*/
        this._buildTree(this.layerInfosObj);
        this.emit('update');
      },

      _buildTree: function(layerInfosObj){
        this._clear();
        html.setStyle(this.errorTipSection, 'display', 'block');
        var layerInfos = [];

        if(this.onlyShowWebMapLayers){
          layerInfos = layerInfosObj.getLayerInfoArrayOfWebmap();
          layerInfos = layerInfos.concat(layerInfosObj.getTableInfoArrayOfWebmap());
        }else{
          layerInfos = layerInfosObj.getLayerInfoArray();
          layerInfos = layerInfos.concat(layerInfosObj.getTableInfoArray());
        }

        if(layerInfos.length === 0){
          return;
        }

        html.setStyle(this.errorTipSection, 'display', 'none');
        array.forEach(layerInfos, lang.hitch(this, function(layerInfo){
          this._addDirectLayerInfo(layerInfo);
        }));
      },

      _addDirectLayerInfo: function(layerInfo){
        if(!layerInfo){
          return;
        }
        layerInfo.getLayerObject().then(lang.hitch(this, function(){
          this._addItem('root', layerInfo);
        }), lang.hitch(this, function(err){
          console.error(err);
        }));
      },

      _clear:function(){
        var items = this._store.query({parent:'root'});
        array.forEach(items, lang.hitch(this, function(item){
          if(item && item.id !== 'root'){
            this._store.remove(item.id);
          }
        }));
      },

      _addItem: function(parentId, layerInfo) {
        var item = null;
        var layerTypeDef = layerInfo.getLayerType();
        var validDef = this.filter(layerInfo);
        all({
          layerType: layerTypeDef,
          valid: validDef
        }).then(lang.hitch(this, function(result) {
          if(result.valid) {
            var callback = lang.hitch(this, function(isLeaf, hasChildren){
              this._id++;
              item = {
                name: layerInfo.title || "",
                parent: parentId,
                layerInfo: layerInfo,
                type: result.layerType,
                layerClass: layerInfo.layerObject.declaredClass,
                id: this._id.toString(),
                isLeaf: isLeaf,
                hasChildren: hasChildren
              };
              this._store.add(item);
            });

            var subLayerInfos = layerInfo.getSubLayers();

            var isLeaf = subLayerInfos.length === 0;

            var hasChildren = true;

            if(isLeaf){
              hasChildren = false;
              callback(isLeaf, hasChildren);
            }else{
              var defs = array.map(subLayerInfos, lang.hitch(this, function(subLayerInfo){
                return this.filter(subLayerInfo);
              }));
              all(defs).then(lang.hitch(this, function(filterResults){
                var hasChildren = array.some(filterResults, function(filterResult){
                  return filterResult;
                });
                if(hasChildren){
                  callback(isLeaf, hasChildren);
                }
              }));
            }
          }
        }));
      },

      _getRootItem:function(){
        return { id: 'root', name:'Map Root', type:'root', isLeaf: false, hasChildren: true};
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
          multiple: this.multiple,
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

            var baseUrl = window.location.protocol + "//" + window.location.host + require.toUrl("jimu");

            var imageName = this._getIconImageName(item, opened);

            if (imageName) {
              a.backgroundImage = "url(" + baseUrl + "/css/images/" + imageName + ")";
              icon = a;
            }

            return icon;
          }),

          getTooltip: lang.hitch(this, function(item){
            return this.displayTooltipForTreeNode ? item.layerInfo.title : "";
          })
        });
        html.addClass(this.tree.domNode, this._treeClass);
        this.tree.placeAt(this.shelter.domNode, 'before');
      },

      _mayHaveChildren: function(item) {
        return item.hasChildren;
      },

      _getIconImageName: function(item, opened) {
        var imageName = '';

        if (item.type === 'ArcGISDynamicMapServiceLayer' ||
          item.type === 'ArcGISTiledMapServiceLayer') {
          if (opened) {
            imageName = 'mapserver_open.png';
          } else {
            imageName = 'mapserver_close.png';
          }
        } else if (item.type === 'GroupLayer') {
          if (opened) {
            imageName = 'group_layer2.png';
          } else {
            imageName = 'group_layer1.png';
          }
        } else if (item.type === 'FeatureLayer') {
          var geoType = jimuUtils.getTypeByGeometryType(item.layerInfo.layerObject.geometryType);
          if (geoType === 'point') {
            imageName = 'point_layer1.png';
          } else if (geoType === 'polyline') {
            imageName = 'line_layer1.png';
          } else if (geoType === 'polygon') {
            imageName = 'polygon_layer1.png';
          }
        } else if(item.type === 'Table'){
          imageName = "table.png";
        } else if(item.type === 'ArcGISImageServiceLayer' ||
         item.type === 'ArcGISImageServiceVectorLayer'){
          imageName = 'image_layer.png';
        } else {
          if (opened) {
            imageName = 'mapserver_open.png';
          } else {
            imageName = 'mapserver_close.png';
          }
        }
        return imageName;
      },

      _onTreeOpen: function(item, node) { /*jshint unused: false*/
        if(item.id === 'root'){
          return;
        }
        var layerInfo = item.layerInfo;
        var subLayerInfos = [];
        var defs = [];
        subLayerInfos = layerInfo.getSubLayers();
        if (item.checked) {
          return;
        }
        this.shelter.show();
        defs = array.map(subLayerInfos, lang.hitch(this, function(subLayerInfo) {
          return subLayerInfo.getLayerObject();
        }));

        all(defs).then(lang.hitch(this, function() {
          if (!this.domNode) {
            return;
          }
          array.forEach(subLayerInfos, lang.hitch(this, function(subLayerInfo) {
            this._addItem(item.id, subLayerInfo);
          }));
          item.checked = true;
          this.shelter.hide();
        }), lang.hitch(this, function(err) {
          console.error(err);
          this.shelter.hide();
          if (!this.domNode) {
            return;
          }
        }));
      },

      //to be override
      _onTreeClick: function(item, node, evt){/*jshint unused: false*/},

      destroy: function(){
        if(this.shelter){
          this.shelter.destroy();
          this.shelter = null;
        }
        if(this.tree){
          this.tree.destroy();
        }
        this.inherited(arguments);
      }
    });

    //layerTypes: array, such as ['FeatureLayer']
    //supports layers:
    //    "FeatureLayer"
    //    "ArcGISDynamicMapServiceLayer"
    //    "ArcGISTiledMapServiceLayer"
    //    "GeoRSSLayer"
    //    "KMLLayer"
    //    "WMSLayer"
    //    "WTMSLayer"
    //    "FeatureCollection"
    //the returned filter will filter layers by layerType
    LayerChooser.createFilterByLayerType = function(layerTypes) {
      if (!lang.isArrayLike(layerTypes)) {
        layerTypes = [];
      }
      return function(layerInfo) {
        var defResult = new Deferred();
        if (layerTypes.length === 0) {
          defResult.resolve(true);
        } else {
          var layerTypeDefs = [];

          layerInfo.traversal(function(layerInfo) {
            layerTypeDefs.push(layerInfo.getLayerType());
          });

          all(layerTypeDefs).then(function(layerTypeDefResults) {
            for (var i = 0; i < layerTypeDefResults.length; i++) {
              for (var j = 0; j < layerTypes.length; j++) {
                if (layerTypeDefResults[i] === layerTypes[j]) {
                  defResult.resolve(true);
                  return;
                }
              }
            }
            defResult.resolve(false);
          }, function(err){
            console.error(err);
            defResult.reject(err);
          });
        }

        return defResult;
      };
    };

    //the returned filter only filters FeatureLayer
    LayerChooser.createFeaturelayerFilter = function(types, showLayerFromFeatureSet, showTable, mustSupportStatistics){
      var allTypes = ['point', 'polyline', 'polygon'];
      if(types && types.length > 0){
        types = array.filter(types, function(type){
          return allTypes.indexOf(type) >= 0;
        });
        if(types.length === 0){
          types = allTypes;
        }
      }
      else{
        types = allTypes;
      }

      return function(layerInfo){
        var defLayerType = layerInfo.getLayerType();
        var defLayerObject = layerInfo.getLayerObject();
        return all({
          layerType: defLayerType,
          layerObject: defLayerObject
        }).then(function(result){
          var layerType = result.layerType;
          var layerObject = result.layerObject;
          if (layerType === 'ArcGISDynamicMapServiceLayer') {
            return true;
          } else if (layerType === 'ArcGISTiledMapServiceLayer') {
            return true;
          } else if (layerType === 'GroupLayer'){
            return true;
          } else if (layerType === 'FeatureCollection'){
            return true;
          }else if (layerType === 'FeatureLayer') {
            var geoType = jimuUtils.getTypeByGeometryType(layerObject.geometryType);
            var isValidGeoType = array.indexOf(types, geoType) >= 0;
            var isLayerValidStatistics = LayerChooser._shouldPassStatisticsCheck(mustSupportStatistics, layerObject);

            if (layerObject.url) {
              //featurelayer by url
              var isLayerSupportQuery = jimuUtils.isFeaturelayerUrlSupportQuery(layerObject.url,
                  layerObject.capabilities);
              return (isValidGeoType && isLayerSupportQuery && isLayerValidStatistics);
            } else {
              //featurelayer by featureset
              return (showLayerFromFeatureSet && isValidGeoType);
            }
          } else if(layerType === 'Table'){
            //if showTable is true, we will ignore types
            var isTableSupportQuery = jimuUtils.isFeaturelayerUrlSupportQuery(layerObject.url,
                  layerObject.capabilities);
            var isTableValidStatistics = LayerChooser._shouldPassStatisticsCheck(mustSupportStatistics, layerObject);
            return (showTable && isTableSupportQuery && isTableValidStatistics);
          }else{
            return false;
          }
        });
      };
    };

    //the returned filter only filters ArcGISImageServiceLayer and ArcGISImageServiceVectorLayer
    LayerChooser.createImageServiceLayerFilter = function(isSupportQuery, mustSupportStatistics){
      return function(layerInfo){
        var defLayerType = layerInfo.getLayerType();
        var defLayerObject = layerInfo.getLayerObject();
        return all({
          layerType: defLayerType,
          layerObject: defLayerObject
        }).then(function(result){
          var layerType = result.layerType;
          var layerObject = result.layerObject;
          if(layerType === 'ArcGISImageServiceLayer' ||
           layerType === 'ArcGISImageServiceVectorLayer'){
            if(isSupportQuery){
              if(jimuUtils.isImageServiceSupportQuery(result.layerObject.capabilities)){
                if(mustSupportStatistics){
                  return LayerChooser._shouldPassStatisticsCheck(mustSupportStatistics, layerObject);
                }else{
                  return true;
                }
              }else{
                return false;
              }
            }else{
              return true;
            }
          }else{
            return false;
          }
        });
      };
    };

    LayerChooser._shouldPassStatisticsCheck = function(mustSupportStatistics, layerObject){
      if(mustSupportStatistics){
        var isSupport = false;
        if (layerObject.advancedQueryCapabilities) {
          isSupport = !!layerObject.advancedQueryCapabilities.supportsStatistics;
        } else {
          isSupport = !!layerObject.supportsStatistics;
        }
        return isSupport;
      }else{
        return true;
      }
    };

    LayerChooser.createQueryableLayerFilter = function(mustSupportStatistics){
      var types = ['point', 'polyline', 'polygon'];
      var featureLayerFilter = LayerChooser.createFeaturelayerFilter(types, false, true, mustSupportStatistics);
      var imageServiceLayerFilter = LayerChooser.createImageServiceLayerFilter(true, mustSupportStatistics);
      var filters = [featureLayerFilter, imageServiceLayerFilter];
      var combinedFilter = LayerChooser.orCombineFilters(filters);
      return combinedFilter;
    };

    //combine multiple filters into one filter
    //if all filters pass, the combined filter will pass
    LayerChooser.andCombineFilters = function(filters){
      return LayerChooser._combineFilters(filters, true);
    };

    //combine multiple filters into one filter
    //if one of the filters passes, the combined filter will pass
    LayerChooser.orCombineFilters = function(filters){
      return LayerChooser._combineFilters(filters, false);
    };

    LayerChooser._combineFilters = function(filters, isAnd){
      return function(layerInfo){
        var defResult = new Deferred();
        var defs = array.map(filters, function(filter){
          return filter(layerInfo);
        });
        all(defs).then(function(filterResults){
          var isPass = false;
          if(isAnd){
            isPass = array.every(filterResults, function(filterResult){
              return filterResult;
            });
          }else{
            isPass = array.some(filterResults, function(filterResult){
              return filterResult;
            });
          }

          defResult.resolve(isPass);
        }, function(err){
          console.error(err);
          defResult.reject(err);
        });
        return defResult;
      };
    };

    return LayerChooser;
  });
