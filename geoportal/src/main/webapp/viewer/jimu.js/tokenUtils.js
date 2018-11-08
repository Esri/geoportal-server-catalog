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
  'dojo/_base/array',
  'dojo/aspect',
  'dojo/Deferred',
  'dojo/cookie',
  'dojo/json',
  'dojo/topic',
  'dojo/request/script',
  'esri/kernel',
  'esri/config',
  'esri/request',
  'esri/urlUtils',
  'esri/IdentityManager',
  'esri/arcgis/OAuthInfo',
  'jimu/portalUrlUtils',
  'jimu/utils',
  'esri/layers/vectorTiles/kernel'
],
function(lang, array, aspect, Deferred, cookie, json, topic, dojoScript, esriNS, esriConfig,
  esriRequest, esriUrlUtils, IdentityManager, OAuthInfo, portalUrlUtils, jimuUtils, vectorTilesKernel) {
  /*jshint -W069 */

  //patch for JS API 3.10
  var hasMethod = typeof cookie.getAll === 'function';
  if(!hasMethod){
    cookie.getAll = function(e){
      var result = [];
      var v = cookie(e);
      if(v){
        result.push(v);
      }
      return result;
    };
  }

  //events:
  //anyUserSignIn: any user sign in, including portal user and arcgis server user
  //userSignIn: current portal user sign in
  //userSignOut: current portal user sign out

  var mo = {
    portalUrl: null,
    cookiePath: '/',
    _started: false,
    webTierPortalUrls: [],

    //public methods:
    //isInBuilderWindow
    //isInConfigOrPreviewWindow
    //signInPortal
    //userHaveSignInPortal
    //isValidCredential
    //isValidPortalCredentialOfPortalUrl
    //isWebTierPortal
    //addAuthorizedCrossOriginDomains
    //addWithCredentialDomain
    //getPortalCredential
    //getUserIdByToken
    //xtGetCredentialFromCookie
    //isStart
    //startup

    isInBuilderWindow: function(){
      return !!(window.isBuilder);
    },

    isInConfigOrPreviewWindow: function(){
      return jimuUtils.isInConfigOrPreviewWindow();
    },

    isStringStartWith: function(str, prefix){
      return str.substr(0, prefix.length) === prefix;
    },

    getCookiePath: function() {
      return this.cookiePath;
    },

    setPortalUrl: function(_portalUrl) {
      var thePortalUrl = portalUrlUtils.getStandardPortalUrl(_portalUrl);
      if (thePortalUrl) {
        thePortalUrl += '/';
      }
      this.portalUrl = thePortalUrl;
    },

    getPortalUrl: function() {
      return this.portalUrl;
    },

    isWebTierPortal: function(_portalUrl){
      var def = new Deferred();
      var thePortalUrl = portalUrlUtils.getStandardPortalUrl(_portalUrl);
      var sharingUrl = thePortalUrl + "/sharing";
      // var tokenUrl = thePortalUrl + "/sharing/rest/generateToken?f=json";
      // The url should not include 'rest' because portal 10.3 doesn't support GET method with 'rest' and
      // get following error
      // {"error":{"code":405,"messageCode":"GWM_0005","message":"Method not supported.","details":[]}}
      var tokenUrl = thePortalUrl + "/sharing/generateToken?f=json";
      var httpsTokenUrl = portalUrlUtils.setHttpsProtocol(tokenUrl);
      var httpsSharingUrl = portalUrlUtils.setHttpsProtocol(sharingUrl);

      dojoScript.get(httpsTokenUrl, {
        jsonp: 'callback'
      }).then(lang.hitch(this, function(response){
        //if web-tier(iwa/pki), the response is {expires,ssl,token}
        //else the response is :
        // {
        //   "error": {
        //     "code": 400,
        //     "message": "Unable to generate token.",
        //     "details": ["'username' must be specified.",
        //                 "'password' must be specified.",
        //                 "'referer' must be specified."]
        //   }
        // }
        if(response.token){
          //web-tier authorization

          this.webTierPortalUrls.push(thePortalUrl);

          //we should not save cookie of web-tier authorization
          this.removeWabAuthCookie();

          //if portal uses LDAP authorization and HTTPS-Only enabled,
          //esriNS.id.getCredential will fail if uses http protocol
          //so we should use https sharing url here
          esriNS.id.getCredential(httpsSharingUrl).then(lang.hitch(this, function(credential){
            if(!credential.token){
              credential.token = response.token;
            }
            if(!credential.expires){
              credential.expires = response.expires;
            }

            //#releated issue 4096
            /*****************************************
             * Workaround to fix API 3.14 bug that doesn't use withCredentials when web-tier.
             *****************************************/
            //var portalInfo = esriNS.id.findServerInfo(credential.server);

            // If the portal uses web-tier authentication, add the server host
            // to cors list and specify that withCredentials flag must be enabled.
            //if (portalInfo.webTierAuth) {//portalInfo.webTierAuth should be true here

            // REMOVE the current entry in CORS list for this portal.
            var corsListIndex = esriUrlUtils.canUseXhr(credential.server, true);
            if (corsListIndex > -1) {
              esriConfig.defaults.io.corsEnabledServers.splice(corsListIndex, 1);
            }

            // ADD a new entry for this portal in CORS list.
            // esriConfig.defaults.io.corsEnabledServers.push({
            //   host: portalUrlUtils.getServerByUrl(thePortalUrl),
            //   withCredentials: true
            // });
            this._pushCorsEnabledServerInfo({
              host: portalUrlUtils.getServerByUrl(thePortalUrl),
              withCredentials: true
            });
            //}
            /*****************************************/

            //should not save credential of iwa to cookie because the cookie is not useful
            def.resolve(true);

            function setRegenerateTokenTimer(cre){
              var creationTime = cre.creationTime || new Date().getTime();
              var expires = cre.expires;
              if(creationTime > 0 && expires > 0 && expires > creationTime){
                var span = expires - creationTime;
                var time = span * 0.8;
                setTimeout(function() {
                  dojoScript.get(httpsTokenUrl, {
                    jsonp: 'callback'
                  }).then(function(res) {
                    if (res.token) {
                      cre.token = res.token;
                      cre.expires = res.expires;
                      cre.creationTime = new Date().getTime();
                      cre.refreshServerTokens();
                      setRegenerateTokenTimer(cre);
                    }
                  }, function(err) {
                    console.error(err);
                  });
                }, time);
              }
            }

            setRegenerateTokenTimer(credential);
          }), lang.hitch(this, function(){
            def.resolve(true);
          }));
        }
        else{
          //normal authorization
          def.resolve(false);
        }
      }), lang.hitch(this, function(err){
        //network error
        console.error(err);
        def.reject(err);
      }));

      return def;
    },

    addAuthorizedCrossOriginDomains: function(domains){
      if(domains && domains.length > 0){
        for(var i = 0; i < domains.length; i++) {
          this.addWithCredentialDomain(domains[i]);
        }
      }
    },

    addWithCredentialDomain: function(domain){
      // add if trusted host is not null, undefined, or empty string
      if(domain && typeof domain === 'string'){
        var corsEnabledServers = esriConfig.defaults.io.corsEnabledServers;

        var server = portalUrlUtils.getServerByUrl(domain);
        var serverWithProtocol = portalUrlUtils.getServerWithProtocol(domain);
        if(!serverWithProtocol){
          serverWithProtocol = "http://" + server;
        }

        // REMOVE the current entry in CORS list
        var corsListIndex = esriUrlUtils.canUseXhr(serverWithProtocol, true);
        if (corsListIndex > -1) {
          corsEnabledServers.splice(corsListIndex, 1);
        }

        // ADD a new entry for this portal in CORS list.
        // corsEnabledServers.push({
        //   host: server,
        //   withCredentials: true
        // });
        this._pushCorsEnabledServerInfo({
          host: server,
          withCredentials: true
        });
      }
    },

    _pushCorsEnabledServerInfo: function(serverInfo){
      /*jshint -W083 */
      if(!serverInfo){
        return;
      }

      var corsEnabledServers = esriConfig.defaults.io.corsEnabledServers;
      var methodNames = ["charAt", "charCodeAt", "concat", "endsWith", "indexOf",
        "lastIndexOf", "localeCompare", "match", "replace", "search", "slice", "split",
        "startsWith", "substr", "substring", "toLocaleLowerCase", "toLocaleUpperCase",
        "toLowerCase", "toString", "toUpperCase", "trim", "trimLeft", "trimRight", "valueOf"];

      if(typeof serverInfo === "object" && typeof serverInfo.host === "string"){
        //object
        for(var key1 in serverInfo.host){
          if(typeof serverInfo.host[key1] === 'function'){
            serverInfo[key1] = function(){
              return serverInfo.host[key1].apply(serverInfo.host, arguments);
            };
          }else{
            serverInfo[key1] = serverInfo.host[key1];
          }
        }

        serverInfo.length = serverInfo.host.length;

        array.forEach(methodNames, function(methodName){
          if(typeof serverInfo.host[methodName] === 'function'){
            serverInfo[methodName] = function(){
              return serverInfo.host[methodName].apply(serverInfo.host, arguments);
            };
          }
        });
      }

      corsEnabledServers.push(serverInfo);
    },

    tryRegisterCredential: function( /* esri.Credential */ credential) {
      if(!this.isValidCredential(credential)){
        return false;
      }

      var isExist = array.some(esriNS.id.credentials, lang.hitch(this, function(c) {
        return credential.token === c.token;
      }));

      if (!isExist) {
        esriNS.id.credentials.push(credential);
        return true;
      }

      return false;
    },

    registerToken: function(token){
      var sharingRest = portalUrlUtils.getSharingUrl(this.portalUrl);
      var cre = esriNS.id.findCredential(sharingRest);
      if(cre){
        //remove the exists credential
        array.some(esriNS.id.credentials, lang.hitch(this, function(c, i) {
          if(this.isValidPortalCredentialOfPortalUrl(this.portalUrl, c)){
            esriNS.id.credentials.splice(i, 1);
            return true;
          }
        }));
      }

      return this._getTokenInfo(token).then(function(tokenInfo){
        if(tokenInfo){
          esriNS.id.registerToken(tokenInfo);
        }
      });
    },

    _getTokenInfo: function(token){
      var portalSelfUrl = portalUrlUtils.getPortalSelfInfoUrl(this.portalUrl);
      portalSelfUrl += '?f=json&token=' + token;
      return dojoScript.get(portalSelfUrl, {
        jsonp: 'callback'
      }).then(lang.hitch(this, function(res){
        if(res.user){
          return {
            server: portalUrlUtils.getSharingUrl(this.portalUrl),
            ssl: res.allSSL,
            token: token,
            userId: res.user.username
          };
        }else{
          // throw Error(window.jimuNls.urlParams.invalidToken);
          return null;
        }
      }), function(err){
        console.error(err);
        throw Error(window.jimuNls.urlParams.validateTokenError);
      });
    },

    _isInvalidPortalUrl: function(s){
      return s && typeof s === 'string' && lang.trim(s);
    },

    signInPortal: function(_portalUrl){
      var def = new Deferred();

      if(!this._isInvalidPortalUrl(_portalUrl)){
        setTimeout(lang.hitch(this, function(){
          def.reject("Invalid portalurl.");
        }), 0);
      }
      else{
        var thePortalUrl = portalUrlUtils.getStandardPortalUrl(_portalUrl);
        var sharingUrl = portalUrlUtils.getSharingUrl(thePortalUrl);
        var credential = this.getPortalCredential(thePortalUrl);
        if(credential){
          setTimeout(lang.hitch(this, function(){
            def.resolve(credential);
          }), 0);
        }
        else{
          def = esriNS.id.getCredential(sharingUrl);
        }
      }

      return def;
    },

    _loadPortalSelfInfo: function(_portalUrl){
      var portalSelfUrl = portalUrlUtils.getPortalSelfInfoUrl(_portalUrl);
      return esriRequest({
        url: portalSelfUrl,
        handleAs: 'json',
        content: {f:'json'},
        callbackParamName: 'callback'
      });
    },

    registerOAuthInfo: function(portalUrl, appId){
      var validParams = portalUrl && typeof portalUrl === 'string' &&
       appId && typeof appId === 'string';
      if(!validParams){
        return null;
      }
      var oAuthInfo = esriNS.id.findOAuthInfo(portalUrl);
      if(!oAuthInfo){
        var oauthReturnUrl = window.location.protocol + "//" + window.location.host +
         require.toUrl("jimu") + "/oauth-callback.html";
        //OAuth will lose 'persist' query parameter if set expiration to two weeks exectly.
        oAuthInfo = new OAuthInfo({
          appId: appId,
          expiration: 14 * 24 * 60 - 1,
          portalUrl: portalUrl,
          authNamespace: '/',
          popup: true,
          popupCallbackUrl: oauthReturnUrl
        });
        esriNS.id.registerOAuthInfos([oAuthInfo]);
      }
      oAuthInfo.appId = appId;
      return oAuthInfo;
    },

    signOutAll: function(){
      var portalUrl = portalUrlUtils.getStandardPortalUrl(this.portalUrl);
      var sharingRest = portalUrl + '/sharing/rest';
      var cre = esriNS.id.findCredential(sharingRest);
      var isPublishEvent = !!cre;
      if(window.appInfo.isRunInPortal){
        this.removeEsriAuthCookieStorage();
      }
      else{
        this.removeWabAuthCookie();
      }
      esriNS.id.destroyCredentials();
      //if sign in portal with oAuth, esriNS.id._oAuthHash will not be null
      esriNS.id._oAuthHash = null;
      if(isPublishEvent){
        this._publishCurrentPortalUserSignOut(portalUrl);
      }
    },

    userHaveSignInPortal: function(_portalUrl) {
      return !!this.getPortalCredential(lang.trim(_portalUrl || ''));
    },

    isValidCredential: function(/* esri.Credential */ credential){
      var isValid = false;

      if(credential){
        var token = credential.token;
        var server = credential.server;
        var theScope = credential['scope'];
        var isValidToken = token && typeof token === "string" && lang.trim(token);
        var isValidServer = server && typeof server === "string" && lang.trim(server);
        var isValidScope = theScope === 'portal' || theScope === "server";
        var isValidExpires = true;
        if (credential.expires) {
          var expireTime = parseInt(credential.expires, 10);
          var nowDate = new Date();
          var nowTime = nowDate.getTime();
          isValidExpires = expireTime > nowTime;
        }
        isValid = isValidToken && isValidServer && isValidScope && isValidExpires;
      }

      return isValid;
    },

    isValidPortalCredentialOfPortalUrl: function(thePortalUrl, credential){
      var isValid = false;

      if(this.isValidCredential(credential)){
        var isPortalScope = credential['scope'] === 'portal';
        var isSameServer = portalUrlUtils.isSameServer(thePortalUrl, credential.server);
        isValid = isPortalScope && isSameServer;
      }

      return isValid;
    },

    getPortalCredential: function(_portalUrl) {
      var credential = null;
      var thePortalUrl = lang.trim(_portalUrl || '');
      if (!thePortalUrl) {
        return null;
      }
      thePortalUrl = portalUrlUtils.getStandardPortalUrl(thePortalUrl);
      //var credentials =[];

      //var sharingUrl = thePortalUrl + '/sharing';
      //c = esriNS.id.findCredential(sharingUrl);

      //find portal credential from esriNS.id.credentials
      credential = this._filterPortalCredential(thePortalUrl, esriNS.id.credentials);

      if(!credential){
        this._tryConvertArcGIScomCrendentialToOrgCredential();
      }

      return credential;
    },

    _tryConvertArcGIScomCrendentialToOrgCredential: function(){
      var portalUrl = this.portalUrl;
      if(!portalUrl){
        return;
      }
      portalUrl = portalUrlUtils.getStandardPortalUrl(portalUrl);
      if(portalUrlUtils.isOrgOnline(portalUrl)){
        var credential = this._filterPortalCredential(portalUrl, esriNS.id.credentials);
        if(!credential){
          var arcgiscomCredential = this._filterPortalCredential("http://www.arcgis.com", esriNS.id.credentials);
          if(arcgiscomCredential){
            //we need to register a new credential which server is this.portalUrl based on arcgiscomCredential
            var sharingUrl = portalUrl + "/sharing/rest";
            var auth = {
              token: arcgiscomCredential.token,
              scope: "portal",
              userId: arcgiscomCredential.userId,
              server: sharingUrl,
              expires: arcgiscomCredential.expires
            };
            esriNS.id.registerToken(auth);
          }
        }
      }
    },

    //save wab_auth cookie, register token, return credential
    saveAndRegisterCookieToCredential: function(cookieValue){
      //server,token,userId,expires
      var wabAuth = lang.clone(cookieValue);
      wabAuth.referer = window.location.host;
      wabAuth.scope = 'portal';
      wabAuth.isAdmin = !!wabAuth.isAdmin;

      this.saveWabCookie(wabAuth);

      var sharingRest = wabAuth.server + "/sharing/rest";
      wabAuth.server = sharingRest;
      esriNS.id.registerToken(wabAuth);
      var cre = esriNS.id.findCredential(sharingRest, wabAuth.userId);
      //cre.resources = ["http://portalUrl/sharing/rest"]
      return cre;
    },

    //save wab_auth cookie, register token, return credential
    registerAuth2Hash: function(_authHash){
      var authHash = lang.clone(_authHash);
      //{access_token,expires_in,persist,username,state}

      //check expires
      var expiresInS = parseInt(authHash.expires_in, 10); //seconds
      var expiresInMS = expiresInS * 1000; //milliseconds
      var dateNow = new Date();
      var expiresTime = dateNow.getTime() + expiresInMS;
      var server = portalUrlUtils.getStandardPortalUrl(authHash.state.portalUrl);

      var wabAuth = {
        referer: window.location.host,
        server: server,
        token: authHash.access_token,
        expires: expiresTime,
        userId: authHash.username,
        scope: 'portal',
        isAdmin: !!authHash.isAdmin
      };

      var cre = this.saveAndRegisterCookieToCredential(wabAuth);
      return cre;
    },

    saveWabCookie: function(wabAuth){
      var cookieName = "wab_auth";
      this.removeCookie(cookieName);
      cookie(cookieName, json.stringify(wabAuth), {
        expires: new Date(wabAuth.expires),
        path: '/'
      });
    },

    removeWabAuthCookie: function(){
      this.removeCookie("wab_auth");
    },

    removeEsriAuthCookieStorage: function() {
      this.removeCookie('esri_auth');

      var itemName = "esriJSAPIOAuth";
      if (window.localStorage) {
        window.localStorage.removeItem(itemName);
      }
      if (window.sessionStorage) {
        window.sessionStorage.removeItem(itemName);
      }
    },

    _filterPortalCredential: function(thePortalUrl, credentials){
      var credential = null;

      thePortalUrl = portalUrlUtils.getStandardPortalUrl(thePortalUrl);

      if(credentials && credentials.length > 0){
        var filterCredentials = array.filter(credentials, lang.hitch(this, function(c){
          return this.isValidPortalCredentialOfPortalUrl(thePortalUrl, c);
        }));

        //return the last valid credential
        if(filterCredentials.length > 0){
          var lastIndex = filterCredentials.length - 1;
          credential = filterCredentials[lastIndex];
        }
      }

      return credential;
    },

    _removePortalCredential: function(_portalUrl) {
      var thePortalUrl = lang.trim(_portalUrl || '');
      if (!thePortalUrl) {
        return;
      }
      thePortalUrl = portalUrlUtils.getStandardPortalUrl(thePortalUrl);

      var filterCredentials = array.filter(esriNS.id.credentials, lang.hitch(this, function(c) {
        return this.isValidPortalCredentialOfPortalUrl(thePortalUrl, c);
      }));

      while (filterCredentials.length > 0) {
        var c = filterCredentials[0];
        //if c has attribute _oAuthCred,
        // c._oAuthCred will also destroy and remove relevant info from storage
        c.destroy();
        filterCredentials.splice(0, 1);
      }

      esriNS.id.credentials = array.filter(esriNS.id.credentials, lang.hitch(this, function(c) {
        return !this.isValidPortalCredentialOfPortalUrl(thePortalUrl, c);
      }));
    },

    getUserIdByToken: function(token, _portalUrl) {
      var def = new Deferred();
      var validToken = token && typeof token === 'string';
      var validPortalUrl = _portalUrl && typeof _portalUrl === 'string';
      if (validToken && validPortalUrl) {
        var thePortalUrl = portalUrlUtils.getStandardPortalUrl(_portalUrl);
        var cs = array.filter(esriNS.id.credentials, lang.hitch(this, function(credential) {
          var b = credential.token === token && credential.userId;
          var isSameServer = portalUrlUtils.isSameServer(thePortalUrl, credential.server);
          return b && isSameServer;
        }));

        if(cs.length > 0){
          var c = cs[0];
          setTimeout(lang.hitch(this, function(){
            def.resolve(c.userId);
          }), 0);
          return def;
        }

        var url = portalUrlUtils.getCommunitySelfUrl(thePortalUrl);
        esriRequest({
          url: url,
          handleAs: 'json',
          content: {
            f: 'json'
          },
          callbackParamName: 'callback'
        }).then(lang.hitch(this, function(response) {
          var username = (response && response.username) || '';
          def.resolve(username);
        }), lang.hitch(this, function(err) {
          console.error(err);
          def.reject('fail to get userId by token');
        }));
        return def;
      } else {
        setTimeout(lang.hitch(this, function(){
          def.reject('invalid parameters');
        }), 0);
        return def;
      }
    },

    xtGetCredentialFromCookie: function(portalUrl){
      //{referer,server,scope,token,expires,userId,isAdmin}
      var strAuth = cookie("wab_auth");
      var wabAuth = null;

      if(strAuth){
        try{
          wabAuth = json.parse(strAuth);
        }
        catch(e){
          console.error(e);
        }
      }

      if(!(wabAuth && typeof wabAuth === 'object')){
        return null;
      }

      //check server
      var server = wabAuth.server;
      var isValidServer = portalUrlUtils.isSameServer(portalUrl, server);
      if(!isValidServer){
        return null;
      }

      //check referer
      var isValidReferer = window.location.host === wabAuth.referer;
      if (!isValidReferer) {
        return null;
      }

      //check expires
      wabAuth.expires = parseInt(wabAuth.expires, 10);
      var dateNow = new Date();
      var timeNow = dateNow.getTime();
      var isValidExpires = wabAuth.expires > timeNow;
      if (!isValidExpires) {
        this.removeCookie("wab_auth");
        return null;
      }

      //var sharingUrl = portalUrlUtils.getSharingUrl(portalUrl);
      //wabAuth.resources = [sharingUrl];

      //expires,isAdmin,server,ssl,token,userId,scope
      //var cre = new Credential(wabAuth);
      //return cre;

      //Note: server must include '/sharing'
      var restUrl = portalUrl + '/sharing/rest';
      wabAuth.server = restUrl;
      var cre = esriNS.id.findCredential(restUrl);
      if(!cre){
        esriNS.id.registerToken(wabAuth);
      }

      cre = esriNS.id.findCredential(restUrl);

      return cre;
    },

    removeCookie: function(cookieName) {
      var path = this.getCookiePath();
      jimuUtils.removeCookie(cookieName, path);
    },

    _getDomainsByServerName: function(serverName){
      var splits = serverName.split('.');
      var length = splits.length;
      var domains = array.map(splits, lang.hitch(this, function(v, index){
        /*jshint unused:false*/
        var arr = splits.slice(index, length);
        var str = "";
        var lastIndex = arr.length - 1;
        array.forEach(arr, lang.hitch(this, function(s, idx){
          str += s;
          if(idx !== lastIndex){
            str += '.';
          }
        }));
        return str;
      }));
      return domains;
    },

    _publishCurrentPortalUserSignIn: function(/* esri.Credential */ credential){
      if(!this.isValidCredential(credential)){
        return;
      }

      try{
        topic.publish('userSignIn', credential);
      }
      catch(e){
        console.error(e);
      }
    },

    _publishAnyUserSignIn: function(/* esri.Credential */ credential){
      if(!this.isValidCredential(credential)){
        return;
      }

      try{
        topic.publish('anyUserSignIn', credential);
      }
      catch(e){
        console.error(e);
      }
    },

    _publishCurrentPortalUserSignOut: function(thePortalUrl){
      try {
        topic.publish('userSignOut', thePortalUrl);
      } catch (e) {
        console.error(e);
      }
    },

    _signInSuccess: function(/* esri.Credential */ credential /*, persist*/) {
      try{
        var isCreOfCurrentPortal = this.isValidPortalCredentialOfPortalUrl(this.portalUrl,
                                                                           credential);

        if(isCreOfCurrentPortal){
          this._publishCurrentPortalUserSignIn(credential);
        }

        this._publishAnyUserSignIn(credential);
      }
      catch(e){
        console.error(e);
      }
    },

    _bindEvents: function(){
      //signIn event
      aspect.after(esriNS.id, 'signIn', lang.hitch(this, function(def , signInInputParams){
        // var url = signInInputParams[0];
        var serverInfo = signInInputParams[1];
        console.log(serverInfo);
        aspect.after(def, 'callback', lang.hitch(this, function(returnValue, callbackInputParams){
          /*jshint unused:false*/
          var credential = callbackInputParams[0];
          //esriNS.id._isRESTService
          this._signInSuccess(credential, false);
        }));
        return def;
      }));
    },

    isStart: function(){
      return this._started;
    },

    startup: function(){
      if(this._started){
        return;
      }

      if(this.isInConfigOrPreviewWindow()){
        var builderWindow = window.parent;
        if(builderWindow){
          var builderIM = builderWindow.esri && builderWindow.esri.id;
          builderIM._wab = 'builder';
          if(builderIM){
            IdentityManager = builderIM;
            //use builder's IdentityManager
            esriNS.id = builderIM;
            var currentIO = window.esriConfig.defaults.io;
            var builderIO = builderWindow.esriConfig.defaults.io;
            //need to sync properties of defaults.io between curent window and builder window
            currentIO.corsEnabledServers = builderIO.corsEnabledServers;
            currentIO.webTierAuthServers = builderIO.webTierAuthServers;
            //for 3.11 and lower api
            currentIO._processedCorsServers = builderIO._processedCorsServers;
            //for 3.12 and higher api
            currentIO.corsStatus = builderIO.corsStatus;

            //because vector tile has it's own identity manager, so replce it here.
            Object.defineProperty(vectorTilesKernel, "id", {
              get: function () {
                return builderIM;
              },
              enumerable: true,
              configurable: true
            });
          }
        }
      }

      this._bindEvents();
      this._started = true;
    }
  };

  mo.startup();

  return mo;
});