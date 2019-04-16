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

define(['dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/topic',
  './SyncMapState'
],
  function (declare, lang, topic, SyncMapState) {
  var instance = null, clazz;
  /* global JSON */
  clazz =  declare(null, {

    map: null,
    isMainView: true,
    syncEventKey: 'wab_sync_event',

    constructor: function () {
      if(!window.localStorage){
        console.error('Localstorage is not supported by your browser, so the sync between browsers are not supported.');
        return;
      }
      this._windows = [];
      this.isMainView = window.queryObject.ismain === 'false'? false: true;
      this.syncMapState = SyncMapState.getInstance();

      topic.subscribe("mapLoaded", lang.hitch(this, this._onMapLoaded));
      topic.subscribe("mapChanged", lang.hitch(this, this._onMapChanged));

      if(!this.isMainView){
        this._listenSyncEvent();
      }
    },

    _onMapLoaded: function(map) {
      this.map = map;
      this.syncMapState.setMap(map);
      this._bindMapEvents();
    },

    _onMapChanged: function(map) {
      this.map = map;
      this.syncMapState.setMap(map);
      this._bindMapEvents();
    },

    _bindMapEvents: function(){
      this.map.on("extent-change", lang.hitch(this, function(evt) {
        this._broadcastMapEvent('extent-change', evt.extent);
      }));
    },

    _broadcastMapEvent: function(evtName, evt){
      this._broadcastEvent('map/' + evtName, evt);
    },

    _broadcastEvent: function(evtName, evt){
      evtName = 'sync/' + evtName;
      localStorage.setItem(this.syncEventKey, JSON.stringify({
        evtName: evtName,
        evt: evt
      }));
    },

    _listenSyncEvent: function(){
      window.addEventListener('storage', lang.hitch(this, function(e){
        if(e.key !== this.syncEventKey){
          return;
        }

        var evtInfo = JSON.parse(window.localStorage.getItem(e.key));
        if(/^sync\/map/.test(evtInfo.evtName)){
          this.syncMapState.handleMapChangeEvent(evtInfo);
        }
      }));
    }

  });

  clazz.getInstance = function() {
    if(instance === null) {
      instance = new clazz();
    }
    return instance;
  };
  return clazz;
});