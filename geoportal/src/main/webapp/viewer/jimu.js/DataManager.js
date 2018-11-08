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
  'dojo/topic'],
  function (declare, lang, topic) {
  var instance = null, clazz;

  clazz =  declare(null, {
    constructor: function (widgetManager) {
      topic.subscribe('publishData', lang.hitch(this, this.onDataPublished));
      topic.subscribe('fetchData', lang.hitch(this, this.onFetchData));
      topic.subscribe('clearAllData', lang.hitch(this, this.onClearAllData));
      topic.subscribe('removeData', lang.hitch(this, this.onRemoveData));
      topic.subscribe('clearDataHistory', lang.hitch(this, this.onClearDataHistory));

      this.widgetManager = widgetManager;
    },

    //key=widgetid, value={current: data, history: [data]}
    _dataStore: {},

    onDataPublished: function (name, id, data, keepHistory) {
      // jshint unused:false

      if(typeof keepHistory === 'undefined') {
        keepHistory = false;
      }

      if(!this._dataStore[id]) {
        this._dataStore[id] = {current: data};
        if(keepHistory){
          this._dataStore[id].history = [data];
        }
      }else{
        this._dataStore[id].current = data;
        if(keepHistory){
          if(this._dataStore[id].history){
            this._dataStore[id].history.push(data);
          }else{
            this._dataStore[id].history = [data];
          }

        }
      }
    },

    onFetchData: function (id) {
      var w;
      if(id){
        if(id === 'framework'){
          if(this._dataStore[id]) {
            topic.publish('dataFetched', 'framework', 'framework',
              this._dataStore[id].current, this._dataStore[id].history);
          } else {
            topic.publish('noData', 'framework', 'framework');
          }
        }else{
          w = this.widgetManager.getWidgetById(id);
          if(w){
            if(this._dataStore[id]) {
              topic.publish('dataFetched', w.name, id,
                this._dataStore[id].current, this._dataStore[id].history);
            } else {
              topic.publish('noData', w.name, id);
            }
          }else{
            topic.publish('noData', undefined, id);
          }
        }
      }else{
        for(var p in this._dataStore){
          w = this.widgetManager.getWidgetById(p);
          if(w){
            topic.publish('dataFetched', w.name, p,
              this._dataStore[p].current, this._dataStore[p].history);
          }
        }
        if(!w) {
          topic.publish('noData', undefined, undefined);
        }
      }
    },

    onClearAllData: function(){
      this._dataStore = {};
      topic.publish('allDataCleared');
    },

    onRemoveData: function(id){
      delete this._dataStore[id];
      topic.publish('dataRemoved', id);
    },

    onClearDataHistory: function(id){
      if(this._dataStore[id]){
        this._dataStore[id].history = [];
      }
      topic.publish('dataHistoryCleared', id);
    }
  });

  clazz.getInstance = function(widgetManager) {
    if(instance === null) {
      instance = new clazz(widgetManager);
    }
    return instance;
  };
  return clazz;
});