///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
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
  'dojo/_base/html',
  'dojo/_base/config',
  'dojo/cookie',
  'dojo/Deferred',
  'dojo/promise/all',
  'dojo/request/xhr',
  './utils',
  './WidgetManager',
  './shared/utils',
  './tokenUtils',
  './portalUtils',
  './portalUrlUtils',
  './AppStateManager',
  'esri/IdentityManager',
  'esri/config',
  'esri/urlUtils',
  'esri/arcgis/utils'
],
function (declare, lang, array, html, dojoConfig, cookie,
  Deferred, all, xhr, jimuUtils, WidgetManager, sharedUtils, tokenUtils,
  portalUtils, portalUrlUtils, AppStateManager, IdentityManager, esriConfig, esriUrlUtils,
  arcgisUtils) {
  var instance = null, clazz;

  clazz = declare(null, {
    urlParams: null,
    appConfig: null,
    rawAppConfig: null,
    configFile: null,
    _configLoaded: false,
    portalSelf: null,

    constructor: function (urlParams, options) {
      this._removeHash(urlParams);
      this.urlParams = urlParams || {};
      this.widgetManager = WidgetManager.getInstance();
      lang.mixin(this, options);
    },

    /****************************************************
    * The app accept the following URL parameters:
    * ?config=<abc-config.json>, this is a config file url
    * ?id=<123>, the id is WAB app id, which is created from portal.
          URL has this parameter means open WAB app from portal.
    * ?appid=<123>, the appid is portal/AGOL app id, which is created from portal/AGOL template.
          The template is created from WAB's app.
          When URL has this parameter, we'll check whether the app is launched
          in portal/AGOL, or not in portal/AGOL.
          > IF in portal, we'll use the appid to get portal/AGOL template id and app data,
          then get WAB app id, then get WAB app config, then merge config;
          > IF NOT in portal, we'll use the appid to get app data, then merge the data
          to WAB app config.
        How to check whether the app is in portal?
          When try to load config file, if URL has no config or id parameter, we'll load
          <app>/config.json file. If the app is in XT, the portalUrl in config.json is not empty.
          If the app is in portal/AGOL, the app is stemapp indeed, which portalUrl is empty.
          So, if portal url is empty, we consider the app is in portal. However, the exception is
          launch stemapp directly. The solution is the XT builder will write "wab_portalurl" cookie
          for stemapp. So, if we find this cookie, we know the app is not in portal.
    * ?itemid=<itemid>, this webmap item will override the itemid in app config
    * ?mode=<config|preview>, this is for internal using purpose
    * ?URL parameters that affect map extent
    ********************************************************/
    loadConfig: function () {
      console.time('Load Config');
      return this._tryLoadConfig().then(lang.hitch(this, function(appConfig) {
        var err = this.checkConfig(appConfig);
        if (err) {
          throw err;
        }
        this.rawAppConfig = lang.clone(appConfig);
        AppStateManager.getInstance().setRawAppConfig(this.rawAppConfig);
        appConfig = this._upgradeAppConfig(appConfig);
        this._processAfterTryLoad(appConfig);
        this.appConfig = appConfig;

        if(this.urlParams.id){
          return this.loadWidgetsManifest(appConfig).then(lang.hitch(this, function() {
            return this._upgradeAllWidgetsConfig(appConfig);
          })).then(lang.hitch(this, function() {
            this._configLoaded = true;
            if(appConfig.title){
              if(window.isBuilder){
                document.title = appConfig.title + ' - Web AppBuilder for ArcGIS';
              }else{
                document.title = appConfig.title;
              }
            }
            return this.getAppConfig();
          }));
        }else{
          tokenUtils.setPortalUrl(appConfig.portalUrl);
          arcgisUtils.arcgisUrl = portalUrlUtils.getBaseItemUrl(appConfig.portalUrl);
          return this._proesssWebTierAndSignin(appConfig).then(lang.hitch(this, function() {
            if(this.urlParams.appid){
              //url has appid parameter means open app as an app created from AGOL template
              if(!window.appInfo.isRunInPortal){
                return this._processNotInPortalAppProtocol(appConfig).
                then(lang.hitch(this, function(appConfig){
                  return this._getAppDataAddTemplateDataFromTemplateAppId
                  (appConfig.portalUrl, this.urlParams.appid).
                  then(lang.hitch(this, function(result){
                    if(result.appData.appConfig){
                      appConfig = result.appData.appConfig;
                    }
                    appConfig._appData = result.appData;
                    appConfig.templateConfig = result.templateData;
                    appConfig.isTemplateApp = true;
                    return appConfig;
                  }));
                }));
              }else{
                return this._getAppConfigFromTemplateAppId(appConfig.portalUrl,
                this.urlParams.appid).then(lang.hitch(this, function(appConfig){
                  this._tryUpdateAppConfigByLocationUrl(appConfig);
                  return this._processInPortalAppProtocol(appConfig);
                }));
              }
            }else{
              return this._processNotInPortalAppProtocol(appConfig);
            }
          })).then(lang.hitch(this, function(appConfig) {
            this._processAfterTryLoad(appConfig);
            this.appConfig = appConfig;
            if(appConfig.map.itemId){
              return appConfig;
            }else{
              return portalUtils.getDefaultWebMap(appConfig.portalUrl).then(function(itemId){
                appConfig.map.itemId = itemId;
                return appConfig;
              });
            }
          })).then(lang.hitch(this, function(appConfig) {
            return this.loadWidgetsManifest(appConfig);
          })).then(lang.hitch(this, function(appConfig) {
            //if it's an AGOL template app, the appConfig will have one property:_appData
            //if it's an WAB template app, the appConfig will have one property:isTemplateApp
            if(appConfig._appData){
              if(appConfig._appData.values && appConfig._appData.values.webmap){
                return portalUtils.getPortal(appConfig.portalUrl)
                .getItemById(appConfig._appData.values.webmap)
                .then(lang.hitch(this, function(webmapInfo){
                  return jimuUtils.template
                    .mergeTemplateAppConfigToAppConfig(appConfig, appConfig._appData, webmapInfo);
                }));
              }else{
                return jimuUtils.template
                    .mergeTemplateAppConfigToAppConfig(appConfig, appConfig._appData);
              }
            }else {
              return appConfig;
            }
          })).then(lang.hitch(this, function() {
            return this._upgradeAllWidgetsConfig(appConfig);
          })).then(lang.hitch(this, function() {
            this._configLoaded = true;
            if(appConfig.title){
              document.title = appConfig.title;
            }
            return this.getAppConfig();
          }));
        }
      }), lang.hitch(this, function(err){
        this.showError(err);
      }));
    },

    getAppConfig: function(){
      var c = lang.clone(this.appConfig);
      c.getConfigElementById = function(id){
        return jimuUtils.getConfigElementById(this, id);
      };

      c.getConfigElementsByName = function(name){
        return jimuUtils.getConfigElementsByName(this, name);
      };

      c.visitElement = function(cb){
        jimuUtils.visitElement(this, cb);
      };

      this._addAuthorizedCrossOriginDomains(this.portalSelf, c);

      return c;
    },

    _addAuthorizedCrossOriginDomains: function(portalSelf, appConfig){
      // we read withCredentials domains(mostly web-tier) and put them into corsEnabledServers
      // tokenUtils.addAuthorizedCrossOriginDomains will ignore duplicated values
      if(portalSelf && portalSelf.authorizedCrossOriginDomains){
        tokenUtils.addAuthorizedCrossOriginDomains(portalSelf.authorizedCrossOriginDomains);
      }
      if(appConfig && appConfig.authorizedCrossOriginDomains){
        tokenUtils.addAuthorizedCrossOriginDomains(appConfig.authorizedCrossOriginDomains);
      }
    },

    checkConfig: function(config){
      var repeatedId = this._getRepeatedId(config);
      if(repeatedId){
        return 'repeated id:' + repeatedId;
      }
      return null;
    },

    processProxy: function(appConfig){
      esriConfig.defaults.io.alwaysUseProxy = appConfig.httpProxy &&
      appConfig.httpProxy.useProxy && appConfig.httpProxy.alwaysUseProxy;
      esriConfig.defaults.io.proxyUrl = "";
      esriConfig.defaults.io.proxyRules = [];

      if (appConfig.httpProxy && appConfig.httpProxy.useProxy && appConfig.httpProxy.url) {
        esriConfig.defaults.io.proxyUrl = appConfig.httpProxy.url;
      }
      if (appConfig.httpProxy && appConfig.httpProxy.useProxy && appConfig.httpProxy.rules) {
        array.forEach(appConfig.httpProxy.rules, function(rule) {
          esriUrlUtils.addProxyRule(rule);
        });
      }
    },

    addNeedValues: function(appConfig){
      this._processNoUriWidgets(appConfig);
      this._addElementId(appConfig);
      this._processWidgetJsons(appConfig);
    },

    showError: function(err){
      if(err && err.message){
        html.create('div', {
          'class': 'app-error',
          innerHTML: err.message
        }, document.body);
      }      
    },

    _tryLoadConfig: function() {
      if(this.urlParams.config) {
        this.configFile = this.urlParams.config;
        return xhr(this.configFile, {
          handleAs: 'json',
          headers: {
            "X-Requested-With": null
          }
        }).then(lang.hitch(this, function(appConfig){
          tokenUtils.setPortalUrl(appConfig.portalUrl);

          if(this.urlParams.token){
            return tokenUtils.registerToken(this.urlParams.token).then(function(){
              return appConfig;
            });
          }else{
            return appConfig;
          }
        }));
      }else if(this.urlParams.id){
        //app is hosted in portal
        window.appInfo.isRunInPortal = true;
        var portalUrl = portalUrlUtils.getPortalUrlFromLocation();
        var def = new Deferred();
        tokenUtils.setPortalUrl(portalUrl);
        arcgisUtils.arcgisUrl = portalUrlUtils.getBaseItemUrl(portalUrl);

        var tokenDef;
        if(this.urlParams.token){
          tokenDef = tokenUtils.registerToken(this.urlParams.token);
        }else{
          tokenDef = new Deferred();
          tokenDef.resolve();
        }

        tokenDef.then(lang.hitch(this, function(){
          //we don't process webtier in portal because portal has processed.
          var portal = portalUtils.getPortal(portalUrl);
          portal.loadSelfInfo().then(lang.hitch(this, function(portalSelf){
            this.portalSelf = portalSelf;
            //if the portal uses web-tier authorization, we can get allSSL info here
            if(portalSelf.allSSL && window.location.protocol === "http:"){
              console.log("redirect from http to https");
              window.location.href = portalUrlUtils.setHttpsProtocol(window.location.href);
              def.reject();
              return;
            }
            this._processSignIn(portalUrl).then(lang.hitch(this, function(){
              //integrated in portal, open as a WAB app
              this._getAppConfigFromAppId(portalUrl, this.urlParams.id)
              .then(lang.hitch(this, function(appConfig){
                this._tryUpdateAppConfigByLocationUrl(appConfig);
                return this._processInPortalAppProtocol(appConfig);
              })).then(function(appConfig){
                def.resolve(appConfig);
              }, function(err){
                def.reject(err);
              });
            }));
          }));
        }), lang.hitch(this, function(err){
          this.showError(err);
        }));
        return def;
      } else{
        this.configFile = "config.json";
        return xhr(this.configFile, {handleAs: 'json'}).then(lang.hitch(this, function(appConfig){
          tokenUtils.setPortalUrl(appConfig.portalUrl);

          if(this.urlParams.token){
            return tokenUtils.registerToken(this.urlParams.token).then(function(){
              return appConfig;
            });
          }else{
            return appConfig;
          }
        }));
      }
    },

    _upgradeAppConfig: function(appConfig){
      var appVersion = window.wabVersion;
      var configVersion = appConfig.wabVersion;
      var newConfig;

      if(appVersion === configVersion){
        return appConfig;
      }
      var configVersionIndex = this.versionManager.getVersionIndex(configVersion);
      var appVersionIndex = this.versionManager.getVersionIndex(appVersion);
      if(configVersionIndex > appVersionIndex){
        throw Error('Bad version number, ' + configVersion);
      }else{
        newConfig = this.versionManager.upgrade(appConfig, configVersion, appVersion);
        newConfig.wabVersion = appVersion;
        newConfig.isUpgraded = true;
        return newConfig;
      }
    },

    _upgradeAllWidgetsConfig: function(appConfig){
      var def = new Deferred(), defs = [];
      if(!appConfig.isUpgraded){
        //app is latest, all widgets are lastest.
        def.resolve(appConfig);
        return def;
      }

      delete appConfig.isUpgraded;
      sharedUtils.visitElement(appConfig, lang.hitch(this, function(e){
        if(!e.uri){
          return;
        }
        if(e.config){
          //if widget is configured, let's upgrade it
          var upgradeDef = this.widgetManager.tryLoadWidgetConfig(e);
          defs.push(upgradeDef);
        }else{
          e.version = e.manifest.version;
        }
      }));
      all(defs).then(lang.hitch(this, function(){
        def.resolve(appConfig);
      }), function(err){
        def.reject(err);
      });
      return def;
    },

    _processAfterTryLoad: function(appConfig){
      this._setPortalUrl(appConfig);
      this._tryUpdateAppConfigByLocationUrl(appConfig);
      this._processUrlParams(appConfig);

      this.addNeedValues(appConfig);
      this.processProxy(appConfig);

      IdentityManager.tokenValidity = 60 * 24 * 7;//token is valid in 7 days
      return appConfig;
    },

    _tryUpdateAppConfigByLocationUrl: function(appConfig){
      if(this.urlParams.config &&
        this.urlParams.config.indexOf('arcgis.com/sharing/rest/content/items/') > -1){

        //for load config from arcgis.com, for back compatibility test.
        return;
      }

      //app is hosted in portal
      //we process protalUrl specially because user in a group owned by two orgs should
      //open the app correctly if the app is shared to this kind of group.
      //so we need to keep main protalUrl consistent with portalUrl browser location.
      var portalUrlFromLocation = portalUrlUtils.getPortalUrlFromLocation();
      var processedPortalUrl = portalUrlUtils.getStandardPortalUrl(portalUrlFromLocation);

      if(portalUrlUtils.isOnline(processedPortalUrl)){
        processedPortalUrl = portalUrlUtils.updateUrlProtocolByOtherUrl(processedPortalUrl,
                                                                        appConfig.portalUrl);
        if(appConfig.map.portalUrl){
          if(portalUrlUtils.isSamePortalUrl(appConfig.portalUrl, appConfig.map.portalUrl)){
            appConfig.map.portalUrl = processedPortalUrl;
          }
        }
        appConfig.portalUrl = processedPortalUrl;

        //update proxy url
        if(appConfig.httpProxy && appConfig.httpProxy.url){
          appConfig.httpProxy.url = portalUrlUtils.getPortalProxyUrl(processedPortalUrl);
        }
      }
    },

    _processWidgetJsons: function(appConfig){
      sharedUtils.visitElement(appConfig, function(e, info){
        if(info.isWidget && e.uri){
          jimuUtils.processWidgetSetting(e);
        }
      });
    },

    _processNoUriWidgets: function(appConfig){
      var i = 0;
      sharedUtils.visitElement(appConfig, function(e, info){
        if(info.isWidget && !e.uri){
          i ++;
          e.placeholderIndex = i;
        }
      });
    },

    _addElementId: function (appConfig){
      var maxId = 0, i;

      sharedUtils.visitElement(appConfig, function(e){
        if(!e.id){
          return;
        }
        //fix element id
        e.id = e.id.replace(/\//g, '_');

        var li = e.id.lastIndexOf('_');
        if(li > -1){
          i = e.id.substr(li + 1);
          maxId = Math.max(maxId, i);
        }
      });

      sharedUtils.visitElement(appConfig, function(e){
        if(!e.id){
          maxId ++;
          e.id = e.uri? (e.uri.replace(/\//g, '_') + '_' + maxId): (''  + '_' + maxId);
        }
      });
    },

    _setPortalUrl: function(appConfig){
      if(appConfig.portalUrl){
        //we can judge the app is running in portal or not now.
        //we should consider this case: the app is running in arcgis.com and the app is shared to
        //an cross-org group and the member of another org of this group is opening this app.
        //In this case, appConfig.portalUrl is different with portalUrlByLocation, but the app is
        //running in portal(arcgis.com).
        var portalUrlByLocation = portalUrlUtils.getPortalUrlFromLocation();
        var isOnline = portalUrlUtils.isOnline(portalUrlByLocation);
        if(!portalUrlUtils.isSamePortalUrl(appConfig.portalUrl, portalUrlByLocation) && !isOnline){
          //app is deployed outside of portal
          window.appInfo.isRunInPortal = false;
        }
        return;
      }
      //if there is no portalUrl in appConfig, try to check whether the app
      //is launched from XT version builder
      if(window.isXT && cookie('wab_portalurl')){
        appConfig.portalUrl = cookie('wab_portalurl');
        return;
      }

      //if not launched from XT builder and has no portalUrl is set,
      //let's assume it's hosted in portal, use the browser location
      window.appInfo.isRunInPortal = true;
      appConfig.portalUrl = portalUrlUtils.getPortalUrlFromLocation();
      return;
    },

    _changePortalUrlProtocol: function(appConfig, protocol){
      //if browser uses https protocol, portalUrl should also use https
      appConfig.portalUrl = portalUrlUtils.setProtocol(appConfig.portalUrl, protocol);

      if(appConfig.map.portalUrl){
        appConfig.map.portalUrl = portalUrlUtils.setProtocol(appConfig.map.portalUrl, protocol);
      }

      if(appConfig.httpProxy){
        var httpProxyUrl = appConfig.httpProxy.url;

        appConfig.httpProxy.url = portalUrlUtils.setProtocol(httpProxyUrl, protocol);

        if(appConfig.httpProxy && appConfig.httpProxy.rules){
          array.forEach(appConfig.httpProxy.rules, lang.hitch(this, function(rule){
            rule.proxyUrl = portalUrlUtils.setProtocol(rule.proxyUrl, protocol);
          }));
        }
      }
    },

    _processInPortalAppProtocol: function(appConfig){
      var def = new Deferred();
      var portalUrl = appConfig.portalUrl;
      var portal = portalUtils.getPortal(portalUrl);

      //for hosted app, we need to check allSSL property
      var handleAllSSL = lang.hitch(this, function(allSSL){
        if(window.location.protocol === 'https:'){
          this._changePortalUrlProtocol(appConfig, 'https');
        }else{
          if(allSSL){
            //keep the protocol of browser honor allSSL property
            console.log("redirect from http to https");
            window.location.href = portalUrlUtils.setHttpsProtocol(window.location.href);
            def.reject();
            return;
          }else{
            this._changePortalUrlProtocol(appConfig, 'http');
          }
        }
        this._checkLocale();
        def.resolve(appConfig);
      });

      //we have called checkSignInStatus in _processSignIn before come here
      portal.loadSelfInfo().then(lang.hitch(this, function(portalSelf){
        //we need to check anonymous property for orgnization first,
        if(portalSelf.access === 'private'){
          //we do not force user to sign in,
          //we just check protocol of portalUrl in appConfig as allSSL
          var isPortalHttps = appConfig.portalUrl.toLowerCase().indexOf('https://') === 0;
          handleAllSSL(isPortalHttps);
        }
        else{
          //Allow anonymous access to portal.
          handleAllSSL(portalSelf.allSSL);
        }
      }), lang.hitch(this, function(err){
        def.reject(err);
      }));
      return def;
    },

    _processNotInPortalAppProtocol: function(appConfig){
      var def = new Deferred();
      if(appConfig.portalUrl){
        var portal = portalUtils.getPortal(appConfig.portalUrl);
        portal.loadSelfInfo().then(lang.hitch(this, function(portalSelf){
          var isBrowserHttps = window.location.protocol === 'https:';
          var allSSL = !!portalSelf.allSSL;
          if(allSSL || isBrowserHttps){
            this._changePortalUrlProtocol(appConfig, 'https');
          }

          var isPortalHttps = appConfig.portalUrl.toLowerCase().indexOf('https://') === 0;
          if(isPortalHttps && !isBrowserHttps){
            //for app in configWindow and previewWindow, we should not refresh url because there is
            //a DOMException if protocol of iframe is not same as protocol of builder window
            //such as:Blocked a frame with origin "https://***" from accessing a cross-origin frame.
            if(!tokenUtils.isInConfigOrPreviewWindow()){
              //if portal uses https protocol, the browser must use https too
              console.log("redirect from http to https");
              window.location.href = portalUrlUtils.setHttpsProtocol(window.location.href);
              def.reject();
              return;
            }
          }
          def.resolve(appConfig);
        }), lang.hitch(this, function(err){
          def.reject(err);
        }));
      }
      else{
        def.resolve(appConfig);
      }
      return def;
    },

    //this function will be not called if app is in portal.
    _proesssWebTierAndSignin: function(appConfig){
      var def = new Deferred();
      var isWebTier = false;
      var portalUrl = appConfig.portalUrl;
      this._processWebTier(appConfig).then(lang.hitch(this, function(webTier){
        isWebTier = webTier;
        var portal = portalUtils.getPortal(portalUrl);
        return portal.loadSelfInfo();
      })).then(lang.hitch(this, function(portalSelf) {
        this.portalSelf = portalSelf;
        return this._processSignIn(portalUrl, isWebTier);
      })).then(lang.hitch(this, function() {
        def.resolve();
      }), function(err){
        def.reject(err);
      });
      return def;
    },

    _processWebTier: function(appConfig){
      var def = new Deferred();
      var portalUrl = appConfig.portalUrl;
      if(appConfig.isWebTier){
        //Although it is recommended to enable ssl for IWA/PKI portal by Esri,
        //there is no force on the client. They still can use http for IWA/PKI.
        //It is not correnct to assume web-tier authorization only works with https.
        tokenUtils.isWebTierPortal(portalUrl).then(lang.hitch(this, function() {
          var credential = tokenUtils.getPortalCredential(portalUrl);
          //if portal uses web-tier but the user doesn't have an account in this portal,
          //credential will be null
          if(credential && credential.ssl){
            //if credential.ssl, it means that the portal is allSSL enabled
            if(window.location.protocol === 'http:' && !tokenUtils.isInConfigOrPreviewWindow()){
              console.log("redirect from http to https");
              window.location.href = portalUrlUtils.setHttpsProtocol(window.location.href);
              return;
            }
          }
          //resolve appConfig.isWebTier, not the resoponse of tokenUtils.isWebTierPortal
          def.resolve(appConfig.isWebTier);
        }), lang.hitch(this, function(err) {
          def.reject(err);
        }));
      }else{
        def.resolve(false);
      }
      return def;
    },

    _processSignIn: function(portalUrl, isWebTier){
      var def = new Deferred();
      var portal = portalUtils.getPortal(portalUrl);
      var sharingUrl = portalUrlUtils.getSharingUrl(portalUrl);
      var defSignIn;

      if(window.appInfo.isRunInPortal){
        //we don't register oauth info for app run in portal.
        defSignIn = IdentityManager.checkSignInStatus(sharingUrl);
        defSignIn.promise.always(lang.hitch(this, function(){
          def.resolve();
        }));
      }else{
        if (!tokenUtils.isInBuilderWindow() && !tokenUtils.isInConfigOrPreviewWindow() &&
          this.portalSelf.supportsOAuth && this.rawAppConfig.appId && !isWebTier) {
          tokenUtils.registerOAuthInfo(portalUrl, this.rawAppConfig.appId);
        }
        //we call checkSignInStatus here because this is the first place where we can get portal url
        defSignIn = IdentityManager.checkSignInStatus(sharingUrl);
        defSignIn.promise.always(lang.hitch(this, function(){
          tokenUtils.xtGetCredentialFromCookie(portalUrl);
          //call portal self again because the first call is not sign in,
          //this call maybe have signed in.
          portal.loadSelfInfo().then(lang.hitch(this, function(portalSelf) {
            this.portalSelf = portalSelf;
            this._checkLocale();
            def.resolve();
          }));
        }));
      }
      return def;
    },

    _checkLocale: function(){
      if(tokenUtils.isInConfigOrPreviewWindow()){
        //in builder, app will use wab_locale
        return;
      }

      var appLocale = this.portalSelf.user && this.portalSelf.user.culture ||
          dojoConfig.locale;

      appLocale = appLocale.toLowerCase();

      if(!this.urlParams.locale && jimuUtils.isLocaleChanged(dojoConfig.locale, appLocale)){
        cookie('wab_app_locale', appLocale);
        window.location.reload();
      }
    },

    _getAppConfigFromTemplateAppId: function(portalUrl, appId){
      var portal = portalUtils.getPortal(portalUrl);
      //the appid means: the app created by AGOL template.
      return this._getWabAppIdAndDataFromTemplateAppId(portalUrl, appId).
      then(lang.hitch(this, function(response){
        var wabAppId = response.appId;
        var appData = response.appData;

        return all([this._getAppConfigFromAppId(portalUrl, wabAppId),
          portal.getItemData(appData.source)]).then(lang.hitch(this, function(results){
          var appConfig;
          if(appData.appConfig){//appConfig is stored in template app
            appConfig = appData.appConfig;
            delete appData.appConfig;
          }else{//appConfig is in template
            appConfig = results[0];
          }

          appConfig = this._upgradeAppConfig(appConfig);

          var templateConfig = results[1];

          appConfig._appData = appData;
          appConfig.templateConfig = templateConfig;
          appConfig.isTemplateApp = true;
          return appConfig;
        }));
      }));
    },

    _getAppDataAddTemplateDataFromTemplateAppId: function(portalUrl, appId){
      //the appid means: the app created by AGOL template.
      var portal = portalUtils.getPortal(portalUrl);
      return portal.getItemData(appId).then(function(appData){
        //appData.source means template id
        return portal.getItemData(appData.source).then(function(templateData){
          return {
            appData: appData,
            templateData: templateData
          };
        });
      });
    },

    _getWabAppIdAndDataFromTemplateAppId: function(portalUrl, appId){
      //the appid means: the app created by AGOL template.
      var def = new Deferred();
      var portal = portalUtils.getPortal(portalUrl);
      portal.getItemData(appId).then(lang.hitch(this, function(appData) {
        //appData.source means template id
        portal.getItemById(appData.source).then(lang.hitch(this, function(item) {
          var urlObject = esriUrlUtils.urlToObject(item.url);
          def.resolve({
            appId: urlObject.query.id,
            appData: appData
          });
        }));
      }), function(err){
        def.reject(err);
      });
      return def;
    },

    _getAppConfigFromAppId: function(portalUrl, appId){
      //the appid means: the app created by app builder.
      return portalUtils.getPortal(portalUrl).getItemData(appId);
    },

    _removeHash: function(urlParams){
      for(var p in urlParams){
        if(urlParams[p]){
          urlParams[p] = urlParams[p].replace('#', '');
        }
      }
    },

    loadWidgetsManifest: function(config){
      var defs = [], def = new Deferred();
      if(config._buildInfo && config._buildInfo.widgetManifestsMerged){
        this._loadMergedWidgetManifests().then(lang.hitch(this, function(manifests){
          sharedUtils.visitElement(config, lang.hitch(this, function(e){
            if(!e.widgets && e.uri){
              if(manifests[e.uri]){
                this._addNeedValuesForManifest(manifests[e.uri]);
                jimuUtils.addManifest2WidgetJson(e, manifests[e.uri]);
              }else{
                defs.push(this.widgetManager.loadWidgetManifest(e));
              }
            }
          }));
          all(defs).then(function(){
            def.resolve(config);
          });
        }));
      }else{
        sharedUtils.visitElement(config, lang.hitch(this, function(e){
          if(!e.widgets && e.uri){
            defs.push(this.widgetManager.loadWidgetManifest(e));
          }
        }));
        all(defs).then(function(){
          def.resolve(config);
        });
      }

      setTimeout(function(){
        if(!def.isResolved()){
          def.resolve(config);
        }
      }, 60 * 1000);
      return def;
    },

    _addNeedValuesForManifest: function(manifest){
      jimuUtils.addManifestProperies(manifest);
      jimuUtils.processManifestLabel(manifest, dojoConfig.locale);
    },

    _loadMergedWidgetManifests: function(){
      var file = window.appInfo.appPath + 'widgets/widgets-manifest.json';
      return xhr(file, {
        handleAs: 'json'
      });
    },

    _getRepeatedId: function(appConfig){
      var id = [], ret;
      sharedUtils.visitElement(appConfig, function(e){
        if(id.indexOf(e.id) > 0){
          ret = e.id;
          return true;
        }
        id.push(e.id);
      });
      return ret;
    },

    //we use URL parameters for the first loading.
    //After loaded, if user changes app config through builder,
    //we'll use the configuration in builder.
    _processUrlParams: function(appConfig){
      var urlWebmap = this.urlParams.itemid || this.urlParams.webmap;
      if(urlWebmap && appConfig.map.itemId !== urlWebmap){
        if(appConfig.map.mapOptions){
          jimuUtils.deleteMapOptions(appConfig.map.mapOptions);
        }
        appConfig.map.itemId = urlWebmap;
      }
      if(this.urlParams.mode){
        appConfig.mode = this.urlParams.mode;
      }
      if(!appConfig.map.mapOptions){
        appConfig.map.mapOptions = {};
      }

      if(this.urlParams.scale){
        appConfig.map.mapOptions.scale = this.urlParams.scale;
      }
      if(this.urlParams.level || this.urlParams.zoom){
        appConfig.map.mapOptions.zoom = this.urlParams.level || this.urlParams.zoom;
      }
    }
  });

  clazz.getInstance = function (urlParams, options) {
    if(instance === null) {
      instance = new clazz(urlParams, options);
    }else{
      instance.urlParams = urlParams;
      instance.options = options;
    }
    return instance;
  };

  return clazz;
});