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
    'dojo/_base/lang',
    'esri/request',
    "dojo/promise/all",
    "jimu/shared/basePortalUrlUtils",
    'dojo/Deferred',
    'esri/lang',
    'jimu/portalUtils',
    'jimu/Role',
    "jimu/utils",
    'esri/urlUtils'
  ],
  function(lang, esriRequest, all,basePortalUrlUtils, Deferred,
    esriLang, portalUtils, Role, jimuUtils, esriUrlUtils) {
    var su = {};

    su.getBaseHrefUrl = function(portalUrl) {
      var webappviewer = window.appInfo.appType === "HTML3D" ? "webappviewer3d" : "webappviewer";
      var href = "";
      if (window.isXT) {
        href = window.location.protocol + "//" + window.location.host + window.appInfo.appPath;
      } else {
        var urlParams = jimuUtils.urlToObject(window.location.href).query || {};
        if (urlParams.appid) {
          //appid for apps that be created by templates
          href = portalUrl + 'apps/' + webappviewer + '/index.html?appid=' + urlParams.appid;
        } else if (urlParams.id) {
          //portal or onLine apps
          href = portalUrl + 'apps/' + webappviewer + '/index.html?id=' + urlParams.id;
        } else {
          //published app: without id in url
          href = jimuUtils.getAppHref();
        }
      }
      return href;
    };
    //jimuUtil's method can't encodeURIComponent(or will decodeURIComponent)
    su.addQueryParamToUrl = function(url, paramName, paramValue, isEncode) {
      var urlObject = esriUrlUtils.urlToObject(url);
      if (!urlObject.query) {
        urlObject.query = {};
      }
      urlObject.query[paramName] = paramValue;
      var ret = urlObject.path;
      for (var q in urlObject.query) {
        var val = urlObject.query[q];
        if (true === isEncode) {
          val = encodeURIComponent(val);
        }

        if (ret === urlObject.path) {
          ret = ret + '?' + q + '=' + val;
        } else {
          ret = ret + '&' + q + '=' + val;
        }
      }
      return ret;
    };

    su.removeQueryParamFromUrl = function(url, paramName, isEncode) {
      var urlObject = esriUrlUtils.urlToObject(url);
      if (urlObject.query) {
        delete urlObject.query[paramName];
      }
      var ret = urlObject.path;
      for (var q in urlObject.query) {
        var val = urlObject.query[q];
        if (true === isEncode) {
          val = encodeURIComponent(val);
        }

        if (ret === urlObject.path) {
          ret = ret + '?' + q + '=' + val;
        } else {
          ret = ret + '&' + q + '=' + val;
        }
      }
      return ret;
    };

    su.getShareUrlContent = function (url) {
      var content = "<div class='marker-feature-action-popup'>" +
        "<div class='item'>" +
        "<span class='sub-title jimu-float-leading'>" + window.jimuNls.common.url + "</span>" +
        "<input type='text' class='jimu-float-leading' readonly='readonly' value=" + url + "></input>" +
        "</div>" +
        "</div>";
      return content;
    };

    su.getShareUrl = function (map, geometry, isIncludeShareUrl) {
      var baseUrl = su.getBaseHrefUrl(window.portalUrl);
      var markerUrl = "";

      var longitude, latitude, x, y, wkid;
      if (geometry) {
        if (geometry.longitude && geometry.latitude) {
          longitude = geometry.longitude;
          latitude = geometry.latitude;
          markerUrl = geometry.longitude + "," + geometry.latitude + ",";
        } else if (geometry.x && geometry.y && geometry.spatialReference && geometry.spatialReference.wkid) {
          x = geometry.x;
          y = geometry.y;
          wkid = geometry.spatialReference.wkid;
          markerUrl = geometry.x + "," + geometry.y + "," + geometry.spatialReference.wkid;
        }
      }

      var resultUrl = su.addQueryParamToUrl(baseUrl, "marker", markerUrl, true);
      resultUrl += ",";
      //resultUrl += encodeURIComponent("");//content
      resultUrl += ",";
      //resultUrl += encodeURIComponent(window.location.protocol + "//" + window.location.host+require.toUrl('jimu') + '/images/marker_featureaction.png',10,20);//symbolURL
      resultUrl += ",";
      //resultUrl += encodeURIComponent("");//title
      resultUrl = su.addQueryParamToUrl(resultUrl, "markertemplate", encodeURIComponent(JSON.stringify({
        title: geometry.title,
        x: x,
        y: y,
        wkid: wkid,
        longitude: longitude,
        latitude: latitude,
        isIncludeShareUrl: isIncludeShareUrl
      })));
      var level = map.getLevel();
      if (typeof level === "number" && level !== -1) {
        resultUrl = su.addQueryParamToUrl(resultUrl, "level", map.getLevel(), true);
      } else {
        //use scale if no level
        resultUrl = su.addQueryParamToUrl(resultUrl, "scale", map.getScale(), true);
      }
      return resultUrl;
    };

    su.getXyContent = function (geometry) {
      var decimal = 4;
      var content = "<div class='marker-feature-action-popup'>";
      // if(geometry.fieldName && geometry.title){
      //   content += "<div class='title'>" + geometry.title + "</div><div class='hzLine'></div>";
      // }
      if (geometry.longitude && geometry.latitude) {
        content +=
          "<div class='item clearFix'>" +
          "<span class='sub-title'>" + window.jimuNls.common.longitude + "</span>" +
          "<span class='val'>" + jimuUtils.localizeNumber(parseFloat(geometry.longitude).toFixed(decimal)) + "</span>" +
          "</div>" +
          "<div class='item clearFix'>" +
          "<span class='sub-title'>" + window.jimuNls.common.latitude + "</span>" +
          "<span class='val'>" + jimuUtils.localizeNumber(parseFloat(geometry.latitude).toFixed(decimal)) + "</span>" +
          "</div>";
      } else if (geometry.x && geometry.y) {
        content += "<div class='item clearFix'>" +
          "<span class='sub-title'>x</span>" +
          "<span class='val'>" + jimuUtils.localizeNumber(parseFloat(geometry.x).toFixed(decimal)) + "</span>" +
          "</div>" +
          "<div class='item'>" +
          "<span class='sub-title'>y</span>" +
          "<span class='val'>" + jimuUtils.localizeNumber(parseFloat(geometry.y).toFixed(decimal)) + "</span>" +
          "</div>";
      }
      content += "</div>";
      return content;
    };

    su._isUserOwnTheApp = function(userObj) {
      if (userObj && userObj.username && userObj.username === window.appInfo.appOwner) {
        return true;
      } else {
        return false;
      }
    };

    su.getItemByUserAndItemId = function(item, itemUser, user, portalUrl) {
      var def = new Deferred();
      var url = basePortalUrlUtils.getStandardPortalUrl(portalUrl);
      url += '/sharing/rest/content/users/';
      //basePortalUrlUtils.getUserContentUrl(_portalUrl, _user, _folderId);
      url += (itemUser ?
        (itemUser.username ? itemUser.username : itemUser.email) : user.email);
      if ((esriLang.isDefined(item.folderId) && item.folderId !== '/') ||
        (esriLang.isDefined(item.ownerFolder) && item.ownerFolder !== '/')) {
        url += '/' + (item.folderId || item.ownerFolder);
      }
      url += '/items/' + item.id;
      var content = {
        f: 'json'
      };
      esriRequest({
        url: url,
        handleAs: 'json',
        content: content,
        callbackParamName: 'callback'
      }).then(lang.hitch(this, function(groupsResponse) {
        def.resolve(groupsResponse);
      }), lang.hitch(this, function(err) {
        console.error(err);
        def.reject(err);
      }));
      return def;
    };

    su._getProfile = function(item, portalUrl) {
      var def = new Deferred();
      var url = basePortalUrlUtils.getUserUrl(portalUrl, item.owner);
      var content = {
        f: 'json'
      };
      esriRequest({
        url: url,
        handleAs: 'json',
        content: content,
        callbackParamName: 'callback'
      }).then(lang.hitch(this, function(groupsResponse) {
        def.resolve(groupsResponse);
      }), lang.hitch(this, function(err) {
        console.error(err);
        def.reject(err);
      }));
      return def;
    };
    su._unshareItemById = function(args, itemId, portalUrl/*, itemFolderId*/) {
      var def = new Deferred();
      //var userStr = (this.itemUser ? (this.itemUser.username ? this.itemUser.username : this.itemUser.email) : this.user.email);
      //var contentItems = basePortalUrlUtils.getUserItemsUrl(this.portalUrl, userStr, itemFolderId);
      var url = basePortalUrlUtils.getStandardPortalUrl(portalUrl);
      url += '/sharing/rest/content/items/' + itemId + "/unshare";
      var content = {
        f: 'json'
      };
      content = lang.mixin(content, args);
      esriRequest({
        url: url,
        handleAs: 'json',
        content: content,
        callbackParamName: 'callback'
      }, {
        usePost: true
      }).then(lang.hitch(this, function(res) {
        def.resolve(res);
      }), lang.hitch(this, function(err) {
        console.error(err);
        def.reject(err);
      }));
      return def;
    };
    su.canSharePublic = function(portalObj) {
      // always returns true if called before /self is retrieved or if canSharePublic is not defined in esriGeowConfig.self
      return (portalObj.selfUrl &&
      (portalObj.canSharePublic === true || portalObj.canSharePublic === false)) ? portalObj.canSharePublic : true;
    };
    su.unshareItemsByUser = function(username, request, portalUrl) {
      //var url = esriGeowConfig.restBaseUrl + 'content/users/' + username + '/unshareItems';
      //this.util.postJson(request, url, handler, errorHandler);
      var def = new Deferred();
      //var userStr = (this.itemUser ? (this.itemUser.username ? this.itemUser.username : this.itemUser.email) : this.user.email);
      //var contentItems = basePortalUrlUtils.getUserItemsUrl(this.portalUrl, userStr, itemFolderId);
      var url = basePortalUrlUtils.getStandardPortalUrl(portalUrl);
      url += '/sharing/rest/content/users/' + username + '/unshareItems';
      var content = {
        f: 'json'
      };
      content = lang.mixin(content, request);
      esriRequest({
        url: url,
        handleAs: 'json',
        content: content,
        callbackParamName: 'callback'
      }, {
        usePost: true
      }).then(lang.hitch(this, function(res) {
        def.resolve(res);
      }), lang.hitch(this, function(err) {
        console.error(err);
        def.reject(err);
      }));
      return def;
    };
    su.unshareItems = function(itemUser, request, portalUrl) {
      //var user = this.util.getUser();
      //if (user == null) return;
      var def = new Deferred();
      var url = basePortalUrlUtils.getStandardPortalUrl(portalUrl);
      url += '/sharing/rest/content/users/' + (request.owner || itemUser.email) + '/unshareItems';
      var content = {
        f: 'json'
      };
      content = lang.mixin(content, request);
      esriRequest({
        url: url,
        handleAs: 'json',
        content: content,
        callbackParamName: 'callback'
      }, {
        usePost: true
      }).then(lang.hitch(this, function(res) {
        def.resolve(res);
      }), lang.hitch(this, function(err) {
        console.error(err);
        def.reject(err);
      }));
      return def;
    };
    su.shareItemsByUser = function(username, request, portalUrl) {
      var def = new Deferred();
      var url = basePortalUrlUtils.getStandardPortalUrl(portalUrl);
      url += '/sharing/rest/content/users/' + username + '/shareItems';
      var content = {
        f: 'json'
      };
      content = lang.mixin(content, request);
      esriRequest({
        url: url,
        handleAs: 'json',
        content: content,
        callbackParamName: 'callback'
      }, {
        usePost: true
      }).then(lang.hitch(this, function(res) {
        def.resolve(res);
      }), lang.hitch(this, function(err) {
        console.error(err);
        def.reject(err);
      }));
      return def;
    };
    su.shareItems = function(itemUser, request, portalUrl) {
      //var user = this.util.getUser();
      //if (user == null) return;
      var def = new Deferred();
      var url = basePortalUrlUtils.getStandardPortalUrl(portalUrl);
      url += '/sharing/rest/content/users/' + (request.owner || itemUser.email) + '/shareItems';
      var content = {
        f: 'json'
      };
      content = lang.mixin(content, request);
      esriRequest({
        url: url,
        handleAs: 'json',
        content: content,
        callbackParamName: 'callback'
      }, {
        usePost: true
      }).then(lang.hitch(this, function(res) {
        def.resolve(res);
      }), lang.hitch(this, function(err) {
        console.error(err);
        def.reject(err);
      }));
      return def;
    };

    su.getItemsGroups = function(item, portalUrl) {
      var def = new Deferred();
      var url = basePortalUrlUtils.getStandardPortalUrl(portalUrl);
      url += '/sharing/rest/content/items/' + item.id + '/groups';
      var content = {
        f: 'json'
      };
      //content = lang.mixin(content, request);
      esriRequest({
        url: url,
        handleAs: 'json',
        content: content,
        callbackParamName: 'callback'
      }, {
        usePost: true
      }).then(lang.hitch(this, function(res) {
        def.resolve(res);
      }), lang.hitch(this, function(err) {
        console.error(err);
        def.reject(err);
      }));
      return def;
    };
    /////////////////////////////////////////////////////////
    su.isSharedToPublic = function(shareInfo) {
      if (window.isXT) {
        return false;
      }

      if (shareInfo === null) {
        return true;//deployed
      } else if (typeof shareInfo !== "undefined" && typeof shareInfo.item !== "undefined" &&
        typeof shareInfo.item.access !== "undefined" && shareInfo.item.access === "public") {
        return true;
      } else {
        // default publicFlag is false
        return false;
      }
    };
    su.isShowSocialMediaLinks = function(shareInfo) {
      if (window.isXT) {
        return true;
      }

      if (shareInfo === null) {
        return true;//deployed apps
      } else if (typeof shareInfo !== "undefined" && typeof shareInfo.item !== "undefined" &&
        typeof shareInfo.item.access !== "undefined" && shareInfo.item.access === "private") {
        return false;
      } else {
        return true;
      }
    };

    su.getItemShareInfo = function(portalUrl) {
      var def = new Deferred();

      var appId = "";
      if (window.isXT) {
        return def.resolve(null);
      } else {
        var urlParams = jimuUtils.urlToObject(jimuUtils.getAppHref()).query || {};
        appId = urlParams.id || urlParams.appid;
      }
      if (typeof appId === "undefined" || appId === "") {
        return def.resolve(null);//deployed apps
      }

      var portal = portalUtils.getPortal(portalUrl);
      portal.getItemById(appId).then(lang.hitch(this, function(result) {
        var shareInfo = {};
        shareInfo.item = result;
        if (shareInfo.item && typeof shareInfo.item.sharing === "undefined" && shareInfo.item.access) {
          shareInfo.item.sharing = {
            access: shareInfo.item.access
          };
        }

        def.resolve(shareInfo);
      }), lang.hitch(this, function(err) {
        //can't get shareInfo, maybe credential is null.
        console.log(err);
        def.resolve(null);
      }));
      return def;
    };

    //TODO should be deprecated. _setUserRole:canShareOthersItemsToGroup()
    su.getShareInfo = function(portalUrl) {
      var portal = portalUtils.getPortal(portalUrl);

      var def = new Deferred();
      var appId = "";
      if (window.isXT) {
        return def.resolve(null);
      } else {
        var urlParams = jimuUtils.urlToObject(jimuUtils.getAppHref()).query || {};
        appId = urlParams.id || urlParams.appid;
      }

      if (typeof appId === "undefined" || appId === "") {
        return def.resolve(null);//deployed
      }

      all({
        getUser: portal.getUser(),
        loadSelfInfo: portal.loadSelfInfo(),
        getItem: portal.getItemById(appId)
      }).then(lang.hitch(this, function(results) {
        var shareInfo = {};

        shareInfo.item = results.getItem;
        if (shareInfo.item && shareInfo.item.ownerFolder &&
          shareInfo.item.ownerFolder.length && shareInfo.item.ownerFolder !== '/') {
          shareInfo.item.folderId = shareInfo.item.ownerFolder;
        }
        if (typeof shareInfo.item.sharing === "undefined" && shareInfo.item.access) {
          shareInfo.item.sharing = {
            access: shareInfo.item.access
          };
        }
        //oneItem.sharing = result.sharing;

        shareInfo.user = results.getUser;
        su._setUserRole(results.loadSelfInfo, shareInfo);

        shareInfo.currentUser = shareInfo.user;
        // admin?
        shareInfo.isAdmin = false;
        //if (this.currentUser && this.currentUser.accountId && this.currentUser.role && this.currentUser.role === "account_admin") {
        if (shareInfo.userRole && (shareInfo.userRole.isAdmin() ||
          (shareInfo.userRole.isCustom() && shareInfo.userRole.canUpdateOrgItems()))) {
          // in regards to sharing admin role and custom role with updateOrgItems is the same
          shareInfo.isAdmin = true;
          if (shareInfo.item.owner !== shareInfo.currentUser.name) {
            su._getProfile(shareInfo.item, portalUrl).then(lang.hitch(this, function(result) {
              shareInfo.itemUser = result;
              if (shareInfo.itemUser.orgId !== shareInfo.currentUser.orgId/*accountId*/) {
                // user is not the admin of the web map owner
                shareInfo.isAdmin = false;
              }

              def.resolve(shareInfo);
            }));
          } else {
            shareInfo.itemUser = shareInfo.currentUser;
            def.resolve(shareInfo);
          }

        } else if (shareInfo.currentUser) {
          shareInfo.itemUser = shareInfo.currentUser;
          def.resolve(shareInfo);
        } else {
          // user is not logged in
          def.resolve(shareInfo);
        }
      }), lang.hitch(this, function(err) {
        //can't get shareInfo, maybe credential is null.
        console.log(err);
        def.resolve(null);
      }));
      return def;
    };

    su._setUserRole = function(res, shareInfo) {
      if (res.urlKey) {
        shareInfo.userPortalUrl = res.urlKey + '.' + res.customBaseUrl;
      } else {
        shareInfo.userPortalUrl = this.portalUrl;
      }

      if (res && !res.code && !res.message) {
        shareInfo.organization = res;//"portals/self?" += "&token="
      }

      if (res && res.user) {
        shareInfo.userRole = new Role({
          id: (res.user.roleId) ? res.user.roleId : res.user.role,
          role: res.user.role
        });

        shareInfo._isCustomRole = shareInfo.userRole.isCustom();
        shareInfo._roleCanShareToGroup = shareInfo._isCustomRole && shareInfo.userRole.canShareItemToGroup();
        shareInfo._roleCanShareToOrg = shareInfo._isCustomRole && shareInfo.userRole.canShareItemToOrg();
        shareInfo._roleCanSharePublic = shareInfo._isCustomRole && shareInfo.userRole.canShareItemToPublic();
        shareInfo._roleCanShare = (shareInfo._roleCanShareToGroup ||
        shareInfo._roleCanShareToOrg || shareInfo._roleCanShareToPublic);
        shareInfo._roleCanUpdateItems = shareInfo._isCustomRole && shareInfo.userRole.canUpdateOrgItems();
        //TODO NO canShareOthersItemsToGroup
        shareInfo._roleCanShareOthersItemsToGroup = shareInfo._isCustomRole &&
          shareInfo.userRole.canShareOthersItemsToGroup();
        shareInfo._roleCanShareOthersItemsToOrg = shareInfo._isCustomRole &&
          shareInfo.userRole.canShareOthersItemsToOrg();
        shareInfo._roleCanShareOthersItemsToPublic = shareInfo._isCustomRole &&
          shareInfo.userRole.canShareOthersItemsToPublic();

        shareInfo._roleCanShareOthersItems = shareInfo._isCustomRole && (
            shareInfo.userRole.canShareOthersItemsToGroup() ||
            shareInfo.userRole.canShareOthersItemsToOrg() ||
            shareInfo._roleCanShareOthersItemsToPublic
          );

        //An org user can share public if one set of the
        shareInfo._orgUserCanSharePublicOrOverride = (shareInfo.organization && (
          (shareInfo.organization.canSharePublic === true &&
          (!shareInfo._isCustomRole || shareInfo._roleCanSharePublic || shareInfo._roleCanShareOthersItemsToPublic)) ||
          (shareInfo.userRole.isAdmin())
        ));

      } else {
        return false;
      }
    };
    su.getItemById = function(item, portalUrl) {
      //http://www.arcgis.com/sharing/rest/content/items/
      var def = new Deferred();
      var url = basePortalUrlUtils.getStandardPortalUrl(portalUrl);
      url += '/sharing/rest/content/items/' + item.id;
      //basePortalUrlUtils.getUserContentUrl(_portalUrl, _user, _folderId);
      var content = {
        f: 'json'
      };
      esriRequest({
        url: url,
        handleAs: 'json',
        content: content,
        callbackParamName: 'callback'
      }).then(lang.hitch(this, function(groupsResponse) {
        def.resolve(groupsResponse);
      }), lang.hitch(this, function(err) {
        console.error(err);
        def.reject(err);
      }));
      return def;
    };

    return su;
  });