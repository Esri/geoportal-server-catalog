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
    'dojo/_base/lang',
    'jimu/shared/basePortalUrlUtils'
  ],
  function(lang, basePortalUrlUtils) {
    var mo = lang.clone(basePortalUrlUtils);

    mo.declaredClass = 'jimu.portalUrlUtils';

    //////////////////////////////////////////////////
    //these functions are for integrated version only
    //////////////////////////////////////////////////
    mo.getPortalUrlFromLocation = function (){
      var portalUrl = mo.getPortalServerFromLocation() +  mo.getDeployContextFromLocation();
      return portalUrl;
    };

    mo.getPortalSignInUrlFromLocation = function(){
      var portalUrl = mo.getPortalUrlFromLocation();
      var url = portalUrl + 'home/signin.html';
      //make sure the signin url begins with https
      url = mo.setHttpsProtocol(url);
      return url;
    };

    mo.getPortalServerFromLocation = function(){
      var server = window.location.protocol + '//' + window.location.host;
      return server;
    };

    mo.getDeployContextFromLocation = function (){
      var url = window.location.href.split("?")[0];

      var keyIndex = url.indexOf("/home/");
      if(keyIndex < 0){
        keyIndex = url.indexOf("/apps/");
      }
      var context = url.substring(url.indexOf(window.location.host) +
       window.location.host.length + 1, keyIndex);
      if (context !== "/") {
        context = "/" + context + "/";
      }
      return context;
    };

    mo.getRestBaseUrlFromLocation = function (){
      var restBaseUrl = window.location.protocol + '//' + window.location.host +
        mo.getDeployContextFromLocation() + 'sharing/rest/';
      return restBaseUrl;
    };
    //----------------------end--------------------------//
    return mo;
  });
