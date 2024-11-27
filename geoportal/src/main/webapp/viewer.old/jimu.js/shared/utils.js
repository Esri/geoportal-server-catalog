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

// define(['./basePortalUrlUtils'], function(basePortalUrlUtils) {
define([], function() {
  var mo = {};

  var widgetProperties = ['inPanel', 'hasLocale', 'hasStyle', 'hasConfig', 'hasUIFile',
  'hasSettingPage', 'hasSettingUIFile', 'hasSettingLocale', 'hasSettingStyle',
  'keepConfigAfterMapSwitched', 'isController', 'hasVersionManager', 'isThemeWidget',
  'supportMultiInstance', 'mirrorIconForRTL'];

  mo.visitElement = visitElement;

  mo.getConfigElementById = getConfigElementById;

  mo.getConfigElementByLabel = getConfigElementByLabel;

  mo.getConfigElementsByName = getConfigElementsByName;

  mo.getWidgetNameFromUri = getWidgetNameFromUri;

  mo.getAmdFolderFromUri = getAmdFolderFromUri;

  mo.widgetProperties = widgetProperties;

  mo.processWidgetProperties = processWidgetManifestProperties;

  mo.getControllerWidgets = getControllerWidgets;

  mo.addI18NLabelToManifest = addI18NLabelToManifest;

  //only check if layer service is AGOL hosted
  mo.isHostedService = function (url) {
    /*
    //http://services.arcgis.com/XXX/arcgis/rest/services/s/FeatureServer
    var server = basePortalUrlUtils.getServerByUrl(url);
    var r = server + "/[^/]+/[^/]+/rest/services";
    var regExp = new RegExp(r, "gi");
    var isHosted = regExp.test(url);
    return isHosted;
    */
    if (!url) {
      return false;
    }
    // hosted feature service: http://services.arcgis.com/f7ee40282cbc40998572834591021976/arcgis/rest/services/StateCapitals/FeatureServer
    // new amazon hosted feature service: http://features.arcgis.com/e2ea3c31dd80478689ce70c4fb3380c5/arcgis/rest/services/santaclara_fs/FeatureServer
    // hosted tiled service: https://tilesdevext.arcgis.com/tiles/fa019fbbfbb845d08cc9f0acde6dd8af/arcgis/rest/services/States/MapServer
    // uploaded KML service: http://www.arcgis.com/sharing/content/items/ecddddaf6b174d7ca94816ac397d9b48/data
    // secure service: http://www.arcgis.com/sharing/rest/services/aee2a3d9d15f406cb21576d92ea1316e/MapServer
    var arcgis = ".arcgis.com/",
        services = "//services",
        tiles = "//tiles",
        features = "//features";
    // sharing = (new dojo._Url(esriGeowConfig.restBaseUrl)).authority,
    // isSingleTenant = (false === esriGeowConfig.isMultiTenant);

    // only consider locally hosted if the restBaseUrl is on same domain as url
    // and esriGeowConfig.self.supportsHostedServices flag is enabled
    var isAGOL = url.indexOf(arcgis) !== -1,
      isHostedServer = (url.indexOf(services) !== -1 || url.indexOf(tiles) !== -1 || url.indexOf(features) !== -1);
    // isLocallyHosted = ((esri.isDefined(esriGeowConfig.self) && esriGeowConfig.self.supportsHostedServices) && (url.indexOf(sharing) !== -1 && !isSingleTenant));
    // isProxyService = !isHostedServer && arcgis; // if the service requires non-AGOL credentials

    // return ((isAGOL && isHostedServer) || (!isAGOL && isLocallyHosted));
    return (isAGOL && isHostedServer);
  };

  //add default value for widget properties.
  function processWidgetManifestProperties(manifest){
    if (typeof manifest.properties.isController === 'undefined') {
      manifest.properties.isController = false;
    }
    if (typeof manifest.properties.isThemeWidget === 'undefined') {
      manifest.properties.isThemeWidget = false;
    }
    if (typeof manifest.properties.hasVersionManager === 'undefined') {
      manifest.properties.hasVersionManager = false;
    }

    widgetProperties.forEach(function(p) {
      if (typeof manifest.properties[p] === 'undefined') {
        manifest.properties[p] = true;
      }
    });
  }

  function visitElement(appConfig, cb) {
    /*the cb signature: cb(element, info), the info object:
      {
        index:
        isWidget:
        groupId: the groupId can be: groupId, widgetOnScreen, widgetPool
        isThemeWidget:
        isOnScreen:
      }
    */

    visitBigSection('widgetOnScreen', cb);
    visitBigSection('widgetPool', cb);

    function visitBigSection(section, cb){
      var i, j, group, widget, isOnScreen = (section === 'widgetOnScreen');
      if (appConfig[section]) {
        if (appConfig[section].groups) {
          for (i = 0; i < appConfig[section].groups.length; i++) {
            group = appConfig[section].groups[i];
            cb(group, {
              index: i,
              isWidget: false,
              groupId: group.id,
              isThemeWidget: false,
              isOnScreen: isOnScreen
            });
            if(!appConfig[section].groups[i].widgets){
              continue;
            }
            for (j = 0; j < appConfig[section].groups[i].widgets.length; j++) {
              widget = appConfig[section].groups[i].widgets[j];
              cb(widget, {
                index: j,
                isWidget: true,
                groupId: group.id,
                isThemeWidget: widget.uri &&
                               widget.uri.indexOf('themes/' + appConfig.theme.name) > -1,
                isOnScreen: isOnScreen
              });
            }
          }
        }

        if (appConfig[section].widgets) {
          for (i = 0; i < appConfig[section].widgets.length; i++) {
            widget = appConfig[section].widgets[i];
            cb(appConfig[section].widgets[i], {
              index: i,
              isWidget: true,
              groupId: section,
              isThemeWidget: widget.uri &&
                             widget.uri.indexOf('themes/' + appConfig.theme.name) > -1,
              isOnScreen: isOnScreen
            });
          }
        }
      }
    }
  }

  function getConfigElementById(appConfig, id){
    var c;
    if(id === 'map'){
      return appConfig.map;
    }
    visitElement(appConfig, function(e){
      if(e.id === id){
        c = e;
        return true;
      }
    });
    return c;
  }

  function getConfigElementByLabel(appConfig, label){
    var c;
    if(label === 'map'){
      return appConfig.map;
    }
    visitElement(appConfig, function(e){
      if(e.label || e.name === label){
        c = e;
        return true;
      }
    });
    return c;
  }

  function getConfigElementsByName(appConfig, name){
    var elements = [];
    if(name === 'map'){
      return [appConfig.map];
    }
    visitElement(appConfig, function(e){
      if(e.name === name){
        elements.push(e);
      }
    });
    return elements;
  }

  function getControllerWidgets(appConfig){
    var controllerWidgets = [];
    appConfig.visitElement(function(e) {
      if (e.isController) {
        controllerWidgets.push(e);
      }
    });
    return controllerWidgets;
  }

  function getWidgetNameFromUri(uri) {
    var segs = uri.split('/');
    segs.pop();
    return segs.pop();
  }

  function getAmdFolderFromUri(uri){
    var segs = uri.split('/');
    segs.pop();
    return segs.join('/') + '/';
  }

  /**
   * @param {Object} manifest
   * @param {Object} defaultStrings
   * @param {Object} {
   *  locale, localeString
   * }
   */
  function addI18NLabelToManifest(manifest, defaultStrings, localesStrings){
    manifest.i18nLabels = {};
    //theme or widget label
    var key = manifest.category === 'widget'? '_widgetLabel': '_themeLabel';
    //add default labels
    if(defaultStrings && defaultStrings.root && defaultStrings.root[key]){
      manifest.i18nLabels.defaultLabel = defaultStrings.root[key];

      //theme's layout and style label
      if(manifest.category === 'theme'){
        if(manifest.layouts){
          manifest.layouts.forEach(function(layout){
            manifest['i18nLabels_layout_' + layout.name] = {};
            manifest['i18nLabels_layout_' + layout.name].defaultLabel =
              defaultStrings.root['_layout_' + layout.name];
          });
        }

        if(manifest.styles){
          manifest.styles.forEach(function(style){
            manifest['i18nLabels_style_' + style.name] = {};
            manifest['i18nLabels_style_' + style.name].defaultLabel =
              defaultStrings.root['_style_' + style.name];
          });
        }
      }

      if(manifest.category === 'widget'){
        if(manifest.featureActions){
          manifest.featureActions.forEach(function(action){
            manifest['i18nLabels_featureAction_' + action.name] = {};
            manifest['i18nLabels_featureAction_' + action.name].defaultLabel =
              defaultStrings.root['_featureAction_' + action.name];
          });
        }
      }
    }
    //add locale labels
    for(var p in localesStrings){
      var localeStrings = localesStrings[p];
      addOneLocale(p, localeStrings);
    }

    function addOneLocale(p, localeStrings){
      if(localeStrings[key]){
        manifest.i18nLabels[p] = localeStrings[key];
      }

      //theme's layout and style label
      if(manifest.category === 'theme'){
        if(manifest.layouts){
          manifest.layouts.forEach(function(layout){
            if(!manifest['i18nLabels_layout_' + layout.name]){
              manifest['i18nLabels_layout_' + layout.name] = {};
            }
            manifest['i18nLabels_layout_' + layout.name][p] = localeStrings['_layout_' + layout.name];
          });
        }

        if(manifest.styles){
          manifest.styles.forEach(function(style){
            if(!manifest['i18nLabels_style_' + style.name]){
              manifest['i18nLabels_style_' + style.name] = {};
            }
            manifest['i18nLabels_style_' + style.name][p] = localeStrings['_style_' + style.name];
          });
        }
      }

      if(manifest.category === 'widget'){
        if(manifest.featureActions){
          manifest.featureActions.forEach(function(action){
            if(!manifest['i18nLabels_featureAction_' + action.name]){
              manifest['i18nLabels_featureAction_' + action.name] = {};
            }
            manifest['i18nLabels_featureAction_' + action.name][p] =
              localeStrings['_featureAction_' + action.name];
          });
        }
      }
    }
  }
  return mo;
});