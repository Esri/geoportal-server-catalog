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
  './_BasicServiceBrowser',
  'dojo/_base/lang',
  'dojo/_base/array',
  'jimu/serviceBrowserRuleUtils'
],
function(declare, _BasicServiceBrowser, lang, array, serviceBrowserRuleUtils) {
  return declare([_BasicServiceBrowser], {
    declaredClass: 'jimu.dijit.QueryableServiceBrowser',
    baseClass: 'jimu-queryable-service-browser',

    //This dijit will filter MapService,FeatureService and ImageService

    //options:
    url: '',
    multiple: false,

    //public methods:
    //setUrl
    //getSelectedItems return [{name,url,definition}]

    //test url:
    //base url: http://sampleserver6.arcgisonline.com/ArcGIS/rest/services
    //folder url1:  http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics
    //folder url2:  http://sampleserver6.arcgisonline.com/arcgis/rest/services/OsoLandslide
    //service url1: http://tryitlive.arcgis.com/arcgis/rest/services/GeneralPurpose/MapServer
    //service url2: http://sampleserver6.arcgisonline.com/arcgis/rest/services/Toronto/ImageServer
    //group layer url1: http://tryitlive.arcgis.com/arcgis/rest/services/GeneralPurpose/MapServer/0
    //group layer url2: http://tryitlive.arcgis.com/arcgis/rest/services/GeneralPurpose/MapServer/1
    //layer url: http://tryitlive.arcgis.com/arcgis/rest/services/GeneralPurpose/MapServer/2

    postMixInProperties:function(){
      this.inherited(arguments);
      this.rule = serviceBrowserRuleUtils.getQueryableServiceBrowserRule();
    },

    getSelectedItems: function(){
      var items = this.inherited(arguments);
      items = array.map(items, lang.hitch(this, function(item){
        return {
          name: item.name,
          url: item.url,
          definition: item.definition
        };
      }));
      return items;
    }

  });
});