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
  './_BasicServiceBrowser',
  'dojo/_base/lang',
  'dojo/_base/array',
  'jimu/serviceBrowserRuleUtils'
],
function(declare, _BasicServiceBrowser, lang, array, serviceBrowserRuleUtils) {
  return declare([_BasicServiceBrowser], {
    baseClass: 'jimu-gp-service-browser',
    declaredClass: 'jimu.dijit.GpServiceBrowser',

    //options
    url: '',
    multiple: false,

    //public methods:
    //getSelectedItems return [{name, url}]

    //test urls
    //http://sampleserver1.arcgisonline.com/ArcGIS/rest/services

    postMixInProperties:function(){
      this.inherited(arguments);
      this.rule = serviceBrowserRuleUtils.getGpServiceBrowserRule();
    },

    //override
    getSelectedItems: function(){
      var items = this.inherited(arguments);
      items = array.map(items, lang.hitch(this, function(item){
        return {
          name: item.name,
          url: item.url
        };
      }));
      return items;
    }

  });
});