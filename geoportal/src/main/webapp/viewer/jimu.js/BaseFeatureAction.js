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
  'dojo/_base/declare',
  'dojo/_base/lang'
], function(declare, lang){
  var clazz = declare(null, {
    /**
     * The feature action name, it must be unique for one widget.
     * @type {String}
     */
    name: undefined,

    /**
    * The action label. If widget supports multiple instances, please consider to append to widget label
    **/
    label: undefined,

    /**
     * The image format of the icon, svg, png, jpg
     * @type {String}
     */
    iconFormat: 'svg',

    /**
     * The feature action icon class. If it's empty, the getIcon() will be used to get the action icon.
     * @type {String}
     */
    iconClass: '',

    map: null,
    appConfig: {},
    /*
    * For actions in framework, the id is "framework"
    */
    widgetId: null,

    /**
     * the constructor needs some options: {map, appConfig, nls, widgetid}
     */
    constructor: function(options){
      lang.mixin(this, options);
    },

    /**
     * Derived class should orverride this function to determine whether the action supports the passed in featureSet.
     * This function can return true/false, or return a promise, which resolve true/false
     * @param  {FeatureSet}
     * @param {Layer} optional
     * @return {Boolean/Promise}
     */
    isFeatureSupported: function(featureSet, layer){
      //jshint unused:false
      return true;
    },

    /**
     * What the feature action does
     * @param  {FeatureSet}
     * @param {Layer} optional
     * @return Promise
     */
    onExecute: function(featureSet, layer){
      //jshint unused:false
    },

    setMap: function(map){
      this.map = map;
    },

    setAppConfig: function(appConfig){
      this.appConfig = appConfig;
    },

    /**
     * We use convention to find icon: name_state
     * @param  {string} state: default, disabled, hover
     * @return {string}
     */
    getIcon: function(state){
      if(this.widgetId === 'framework'){
        return require.toUrl('jimu') + '/images/feature_actions/' +
            this.name + '_' + state + '.' + this.iconFormat;
      }else{
        return this.appConfig.getConfigElementById(this.widgetId).folderUrl +
          'images/' + this.name + '_' + state + '.' + this.iconFormat;
      }
    }
  });
  return clazz;
});