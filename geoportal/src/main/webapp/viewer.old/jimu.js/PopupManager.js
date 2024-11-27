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
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/topic',
  'dojo/on',
  'dojo/query',
  './FeatureActionManager',
  './utils',
  './dijit/FeatureActionPopupMenu',
  './RelatedRecordsPopupProjector'
  ], function(declare, lang, html, topic, on, query, FeatureActionManager,
  jimuUtils, PopupMenu, RelatedRecordsPopupProjector) {
    var instance = null;
    var clazz = declare(null, {
      mapManager: null,
      // popupUnion = {
      //   mobile: is mobile popup of map,
      //   bigScreen: is popup of map
      // };
      popupUnion: null,
      _relatedRecordsPopupProjector: null,

      constructor: function(options) {
        lang.mixin(this, options);

        this.popupMenu = PopupMenu.getInstance();
        this.isInited = false;

        this.featureActionManager = FeatureActionManager.getInstance();
        topic.subscribe("mapLoaded", lang.hitch(this, this.onMapLoadedOrChanged));
        topic.subscribe("mapChanged", lang.hitch(this, this.onMapLoadedOrChanged));
        topic.subscribe("appConfigChanged", lang.hitch(this, this._onAppConfigChanged));
        topic.subscribe("widgetsActionsRegistered", lang.hitch(this, this._onWidgetsActionsRegistered));
      },

      init: function() {
        this.popupUnion = this.mapManager.getMapInfoWindow();
        if(!this.popupUnion.bigScreen || !this.popupUnion.mobile ||
          !this.popupUnion.bigScreen.domNode || !this.popupUnion.mobile.domNode){
          return;
        }
        if(!this.isInited){
          this._createPopupMenuButton();
          this._bindSelectionChangeEvent();
          this.isInited = true;
        }
      },

      _createPopupMenuButton: function(){
        if(this.popupMenuButtonDesktop) {
          html.destroy(this.popupMenuButtonDesktop);
        }
        if(this.popupMenuButtonMobile) {
          html.destroy(this.popupMenuButtonMobile);
        }
        this.popupMenuButtonDesktop = html.create('span', {
          'class': 'popup-menu-button'
        }, query(".actionList", this.popupUnion.bigScreen.domNode)[0]);

        var mobileActionListNode =
          query("div.esriMobileInfoView.esriMobilePopupInfoView .esriMobileInfoViewItem").parent()[0];
        var mobileViewItem = html.create('div', {
            'class': 'esriMobileInfoViewItem'
          }, mobileActionListNode);
        this.popupMenuButtonMobile = html.create('span', {
          'class': 'popup-menu-button'
        }, mobileViewItem);

        on(this.popupMenuButtonMobile, 'click', lang.hitch(this, this._onPopupMenuButtonClick));
        on(this.popupMenuButtonDesktop, 'click', lang.hitch(this, this._onPopupMenuButtonClick));
      },

      _onPopupMenuButtonClick: function(evt){
        var position = html.position(evt.target);
        this.popupMenu.show(position);
      },

      _bindSelectionChangeEvent: function(){
        on(this.popupUnion.bigScreen, "selection-change", lang.hitch(this, this._onSelectionChange));
        on(this.popupUnion.mobile, "selection-change", lang.hitch(this, this._onSelectionChange));
      },

      _onSelectionChange: function(evt){
        this.selectedFeature = evt.target.getSelectedFeature();
        if(!this.selectedFeature){
          this._disablePopupMenu();
          return;
        }
        this.initPopupMenu([this.selectedFeature]);

        var selectedFeatureLayer = this.selectedFeature.getLayer();
        var hasInfoTemplate = this.selectedFeature.infoTemplate ||
                              (selectedFeatureLayer && selectedFeatureLayer.infoTemplate);
        if(hasInfoTemplate) {
          this._createRelatedRecordsPopupProjector(this.selectedFeature);
        }
      },

      _disablePopupMenu: function() {
        html.addClass(this.popupMenuButtonDesktop, 'disabled');
        html.addClass(this.popupMenuButtonMobile, 'disabled');
      },

      _enablePopupMenu: function() {
        html.removeClass(this.popupMenuButtonDesktop, 'disabled');
        html.removeClass(this.popupMenuButtonMobile, 'disabled');
      },

      // public method, can be called from outside.
      initPopupMenu: function(features){
        if(!features) {
          this._disablePopupMenu();
          this.popupMenu.setActions([]);
          return;
        }
        var featureSet = jimuUtils.toFeatureSet(features);
        this.featureActionManager.getSupportedActions(featureSet).then(lang.hitch(this, function(actions){
          var excludeActions = ['ZoomTo', 'ShowPopup', 'Flash', 'ExportToCSV',
            'ExportToFeatureCollection', 'ExportToGeoJSON', 'ShowRelatedRecords',
            'SaveToMyContent', 'CreateLayer'];
          var popupActions = actions.filter(lang.hitch(this, function(action){
            return excludeActions.indexOf(action.name) < 0 ;
          }));

          if(popupActions.length === 0){
            this._disablePopupMenu();
          }else{
            this._enablePopupMenu();
          }
          var menuActions = popupActions.map(lang.hitch(this, function(action){
            //action.data = jimuUtils.toFeatureSet(feature);
            action.data = featureSet;
            return action;
          }));
          this.popupMenu.setActions(menuActions);
        }));
      },

      /******************************
       * Events
       ******************************/
      onMapLoadedOrChanged: function() {
        this.isInited = false;
        this.init();
      },

      _onAppConfigChanged: function() {
        if(this.popupUnion) {
          if(this.popupUnion.bigScreen && this.popupUnion.bigScreen.hide) {
            this.popupUnion.bigScreen.hide();
            this.popupMenu.hide();
          }
          if(this.popupUnion.mobile && this.popupUnion.mobile.hide) {
            this.popupUnion.mobile.hide();
            this.popupMenu.hide();
          }
        }
      },

      _onWidgetsActionsRegistered: function(){
        //to init actions
        this.init();
      },

      /**********************************
       * Methods for show related records
       **********************************/

      _createRelatedRecordsPopupProjector: function(selectedFeature) {
        try {
          if(this._relatedRecordsPopupProjector &&
             this._relatedRecordsPopupProjector.domNode) {
            this._relatedRecordsPopupProjector.destroy();
            this._relatedRecordsPopupProjector = null;
          }
          //var refDomNode = query(".esriViewPopup", this.popupUnion.bigScreen.domNode)[0];
          this._relatedRecordsPopupProjector = new RelatedRecordsPopupProjector({
            originalFeature: selectedFeature,
            //refDomNode: refDomNode,
            popup: this.mapManager.map.infoWindow,
            popupManager: this
          });
        } catch(err) {
          console.warn(err.message);
        }
      }


    });

    clazz.getInstance = function(mapManager) {
      if (instance === null) {
        instance = new clazz({
          mapManager: mapManager
        });
      }
      return instance;
    };

    return clazz;
  });
