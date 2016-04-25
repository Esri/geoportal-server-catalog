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

define(['./basePortalUrlUtils'], function(basePortalUrlUtils) {
  var mo = {};

  var widgetProperties = ['inPanel', 'hasLocale', 'hasStyle', 'hasConfig', 'hasUIFile',
  'hasSettingPage', 'hasSettingUIFile', 'hasSettingLocale', 'hasSettingStyle',
  'keepConfigAfterMapSwithched', 'isController', 'hasVersionManager', 'isThemeWidget',
  'supportMultiInstance'];

  mo.visitElement = visitElement;

  mo.getConfigElementById = getConfigElementById;

  mo.getConfigElementByLabel = getConfigElementByLabel;

  mo.getConfigElementsByName = getConfigElementsByName;

  mo.getWidgetNameFromUri = getWidgetNameFromUri;

  mo.getAmdFolderFromUri = getAmdFolderFromUri;

  mo.widgetProperties = widgetProperties;

  mo.processWidgetProperties = processWidgetManifestProperties;

  mo.isHostedService = function (url) {
    //http://services.arcgis.com/XXX/arcgis/rest/services/s/FeatureServer
    var server = basePortalUrlUtils.getServerByUrl(url);
    var r = server + "/[^/]+/[^/]+/rest/services";
    var regExp = new RegExp(r, "gi");
    var isHosted = regExp.test(url);
    return isHosted;
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
  return mo;
});