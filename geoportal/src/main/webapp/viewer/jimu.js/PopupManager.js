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
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/topic',
  'dijit/_WidgetBase',
  './PopupActions/RelatedRecordAction',
  './PopupActions/EditAction'
  ], function(declare, lang, array, topic, _WidgetBase, RelatedRecordAction, EditAction) {
    var instance = null;
    var clazz = declare([_WidgetBase], {
      map: null,
      mapmanager: null,
      // popupUnion = {
      //   mobile: is mobile popup of map,
      //   bigScreen: is popup of map
      // };
      popupUnion: null,
      actions: null,

      constructor: function() {
        this.actions = [];
        this.own(topic.subscribe("mapLoaded", lang.hitch(this, this.onMapLoadedOrChanged)));
        this.own(topic.subscribe("mapChanged", lang.hitch(this, this.onMapLoadedOrChanged)));
      },

      init: function(map) {
        this.cleanActions();
        this.map = map;
        this.popupUnion = this.mapmanager.getMapInfoWindow();
      },

      _addActionsToPopup: function() {
        this._addRelatedRecordAction();
        this._addEditAction();
      },

      _addRelatedRecordAction: function() {
        var showRelatedRecordAction = new RelatedRecordAction({
          name: "showRelatedRecordAction",
          map: this.map,
          popupUnion: this.popupUnion,
          appConfig: this.mapmanager.appConfig
        });

        this.addAction(showRelatedRecordAction);
      },

      _addEditAction: function() {
        var editAction = new EditAction({
          name: "editAction",
          map: this.map,
          popupUnion: this.popupUnion,
          appConfig: this.mapmanager.appConfig
        });

        this.addAction(editAction);
      },

      addAction: function(action) {
        this.actions.push(action);
      },

      removeAction: function(actionName) {
        for(var i = 0; i < this.actions.length; i++) {
          if(this.actions[i].name === actionName) {
            this.actions[i].destroy();
            break;
          }
        }
        if(i !== this.actions.length) {
          this.actions.splice(i, 1);
        }
      },

      cleanActions: function() {
        array.forEach(this.actions, function(action) {
          action.destroy();
        });
        this.actions = [];
      },

      /******************************
       * Events
       ******************************/
      onMapLoadedOrChanged: function(map) {
        this.init(map);
        this._addActionsToPopup();
      }

    });

    clazz.getInstance = function(mapmanager) {
      if (instance === null) {
        instance = new clazz({
          mapmanager: mapmanager
        });
      }
      return instance;
    };

    return clazz;
  });