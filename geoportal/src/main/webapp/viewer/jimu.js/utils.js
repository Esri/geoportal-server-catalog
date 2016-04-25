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
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/html',
    'dojo/_base/sniff',
    'dojo/_base/config',
    'dojo/io-query',
    'dojo/query',
    'dojo/NodeList-traverse',
    'dojo/Deferred',
    'dojo/on',
    'dojo/json',
    'dojo/cookie',
    'dojo/number',
    'dojo/date/locale',
    'dojox/encoding/base64',
    'esri/lang',
    'esri/arcgis/utils',
    'esri/SpatialReference',
    'esri/geometry/Extent',
    'esri/geometry/Multipoint',
    'esri/geometry/Polyline',
    'esri/geometry/Polygon',
    'esri/geometry/webMercatorUtils',
    'esri/tasks/GeometryService',
    'esri/tasks/ProjectParameters',
    'esri/urlUtils',
    'esri/request',
    'esri/graphicsUtils',
    'jimu/portalUrlUtils',
    './shared/utils'
  ],

function(lang, array, html, has, config, ioQuery, query, nlt, Deferred, on, json, cookie,
  dojoNumber, dateLocale, base64, esriLang, arcgisUtils, SpatialReference, Extent, Multipoint,
  Polyline, Polygon, webMercatorUtils, GeometryService, ProjectParameters,
  esriUrlUtils, esriRequest, graphicsUtils, portalUrlUtils, sharedUtils) {
  /* global esriConfig, dojoConfig, ActiveXObject, testLoad */
  var mo = {};

  nlt = null;

  var servicesObj = {
    geometryService: 'http://utility.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer'
  };

  lang.mixin(mo, sharedUtils);

  if (!window.atob) {
    window.atob = function(b64) {
      var bytes = base64.decode(b64);
      var str = "";
      for (var i = 0, len = bytes.length; i < len; i++) {
        str += String.fromCharCode(bytes[i]);
      }
      return str;
    };
  }
  if (!window.btob) {
    window.btob = function(str) {
      var bytes = [];
      for (var i = 0, len = str.length; i < len; i++) {
        bytes.push(String.charCodeAt(str[i]));
      }

      return base64.encode(bytes);
    };
  }

  var fileAPIJsStatus = 'unload'; // unload, loading, loaded
  function _loadFileAPIJs(prePath, cb) {
    prePath = prePath || "";
    var loaded = 0,
      completeCb = function() {
        loaded++;
        if (loaded === tests.length) {
          cb();
        }
      },
      tests = [{
        test: window.File && window.FileReader && window.FileList && window.Blob ||
          !mo.file.isEnabledFlash(),
        failure: [
          prePath + "libs/polyfills/fileAPI/FileAPI.js"
        ],
        callback: function() {
          completeCb();
        }
      }];

    for (var i = 0; i < tests.length; i++) {
      testLoad(tests[i]);
    }
  }

  //if no beforeId, append to head tag, or insert before the id
  function loadStyleLink(id, href, beforeId) {
    var def = new Deferred(), styleNode, styleLinkNode;

    var hrefPath = require(mo.getRequireConfig()).toUrl(href);
    //the cache will use the baseUrl + module as the key
    if(require.cache['url:' + hrefPath]){
      //when load css file into index.html as <style>, we need to fix the
      //relative path used in css file
      var cssStr = require.cache['url:' + hrefPath];
      var fileName = hrefPath.split('/').pop();
      var rpath = hrefPath.substr(0, hrefPath.length - fileName.length);
      cssStr = addRelativePathInCss(cssStr, rpath);
      if (beforeId) {
        styleNode = html.create('style', {
          id: id,
          type: "text/css"
        }, html.byId(beforeId), 'before');
      } else {
        styleNode = html.create('style', {
          id: id,
          type: "text/css"
        }, document.getElementsByTagName('head')[0]);
      }

      if(styleNode.styleSheet && !styleNode.sheet){
        //for IE
        styleNode.styleSheet.cssText = cssStr;
      }else{
        styleNode.appendChild(html.toDom(cssStr));
      }
      def.resolve('load');
      return def;
    }

    if (beforeId) {
      styleLinkNode = html.create('link', {
        id: id,
        rel: "stylesheet",
        type: "text/css",
        href: hrefPath
      }, html.byId(beforeId), 'before');
    } else {
      styleLinkNode = html.create('link', {
        id: id,
        rel: "stylesheet",
        type: "text/css",
        href: hrefPath
      }, document.getElementsByTagName('head')[0]);
    }

    on(styleLinkNode, 'load', function() {
      def.resolve('load');
    });

    //for the browser which doesn't fire load event
    //safari update documents.stylesheets when style is loaded.
    var ti = setInterval(function() {
      var loadedSheet;
      if (array.some(document.styleSheets, function(styleSheet) {
        if (styleSheet.href && styleSheet.href.substr(styleSheet.href.indexOf(href),
          styleSheet.href.length) === href) {
          loadedSheet = styleSheet;
          return true;
        }
      })) {
        try{
          if (!def.isFulfilled() && (loadedSheet.cssRules && loadedSheet.cssRules.length ||
            loadedSheet.rules && loadedSheet.rules.length)) {
            def.resolve('load');
          }
          clearInterval(ti);
        }catch(err){
          //In FF, we can't access .cssRules before style sheet is loaded,
          //but FF will emit load event. So, we catch this error and do nothing,
          //just wait for FF to emit load event and go on.
        }
      }
    }, 50);
    return def;
  }

  function addRelativePathInCss(css, rpath){
    var m = css.match(/url\([^)]+\)/gi), i, m2;

    if (m === null || rpath === '') {
      return css;
    }
    for (i = 0; i < m.length; i++) {
      m2 = m[i].match(/(url\(["|']?)(.*)((?:['|"]?)\))/i);
      if(m2.length >= 4){
        var path = m2[2];
        if(!rpath.endWith('/')){
          rpath = rpath + '/';
        }
        css = css.replace(m2[1] + path + m2[3], m2[1] + rpath + path + m2[3]);
      }
    }
    return css;
  }

  var errorCheckLists = [];
  require.on("error", function(err) {
    array.forEach(errorCheckLists, function(o) {
      if (err.info[0] && err.info[0].indexOf(o.resKey) > -1) {
        o.def.reject(err);
      }
      for (var p in err.info) {
        if (p.indexOf(o.resKey) > -1) {
          o.def.reject(err);
        }
      }
    });
  });

  mo.checkError = function(resKey, def) {
    //when resKey match a error, def will be reject
    errorCheckLists.push({
      resKey: resKey,
      def: def
    });
  };

  /**
   * Repalce the placeholders in the obj Object properties with the props Object values,
   * return the replaced object
   * The placeholder syntax is: ${prop}
   */
  mo.replacePlaceHolder = function(obj, props) {
    var str = json.stringify(obj),
      m = str.match(/\$\{(\w)+\}/g),
      i;

    if (m === null) {
      return obj;
    }
    for (i = 0; i < m.length; i++) {
      var p = m[i].match(/(\w)+/g)[0];
      if (props[p]) {
        str = str.replace(m[i], props[p]);
      }
    }
    return json.parse(str);
  };

  /***
   * change latitude/longitude to degree, minute, second
   **/
  mo.changeUnit = function(val) {
    var abs = Math.abs(val),
      text, d, m, s;
    d = Math.floor(abs);
    m = Math.floor((abs - d) * 60);
    s = (((abs - d) * 60 - m) * 60).toFixed(2);
    //00B0 id degree character
    text = d + '\u00B0' + ((m < 10) ? ('0' + m) : m) + '\'' + ((s < 10) ? ('0' + s) : s) + '"';
    return text;
  };

  /**
   * the formated format is: mm:ss.ms
   **/
  mo.formatTime = function(time) {
    var s = time / 1000,
      m = Math.floor(s / 60),
      s2 = Number(s - m * 60).toFixed(1),
      text = ((m < 10) ? '0' + m : m) + ':' + ((s2 < 10) ? '0' + s2 : s2);
    return text;
  };

  mo.parseTime = function(text) {
    var p = /(\d{2,})\:(\d{2})\.(\d{1})/,
      m, t;
    if (!p.test(text)) {
      console.log('wrong time format.');
      return -1;
    }
    m = text.match(p);
    t = (parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + parseInt(m[3], 10) / 10) * 1000;
    return t;
  };

  mo.preloadImg = function(imgs, rpath) {
    var imgArray = [];
    if (typeof imgs === 'string') {
      imgArray = [imgs];
    } else {
      imgArray = imgs;
    }
    array.forEach(imgArray, function(imgUrl) {
      var img = new Image();
      if (rpath) {
        img.src = rpath + imgUrl;
      } else {
        img.src = imgUrl;
      }
    });
  };

  var testImageDom = null;
  mo.getImagesSize = function(imageUrl){
    var def = new Deferred();

    if (!imageUrl || imageUrl.indexOf("http") !== 0) {
      def.reject();
      return def;
    }

    if(testImageDom === null){
      testImageDom = html.create('img', {
        id: '__test-image-size',
        style: {
          position: 'absolute',
          left: '-9999px',
          top: '-9999px'
        }
      }, document.body);
    }
    var testImageHandler = on(testImageDom, "load", function(){
      clearTimeout(timeoutHandler);
      timeoutHandler = null;
      testImageHandler.remove();

      var box = html.getContentBox(testImageDom);

      if ((box.w === 1 && box.h === 1) || box.w === 0 || box.h === 0) {
        def.reject();
        return;
      }

      def.resolve([box.w, box.h]);
    }, {});

    var timeoutHandler = setTimeout(function(){
      clearTimeout(timeoutHandler);
      timeoutHandler = null;
      // image URL is invalid or takes too long; don't update it
      def.reject();
    }, 5000);

    // IE&, Safari and Chrome cache the image if the user does it more than once and
    //then don't call the onLoad handler
    html.setAttr(testImageDom, 'src', imageUrl);

    return def;
  };

  /**
   * get style object from position
   * the position can contain 6 property: left, top, right, bottom, width, height
   * please refer to AbstractModule
   */
  mo.getPositionStyle = function(_position) {
    var style = {};
    if(!_position){
      return style;
    }
    var position = lang.clone(_position);
    if(window.isRTL){
      var temp;
      if(typeof position.left !== 'undefined' && typeof position.right !== 'undefined'){
        temp = position.left;
        position.left = position.right;
        position.right = temp;
      }else if(typeof position.left !== 'undefined'){
        position.right = position.left;
        delete position.left;
      }else if(typeof position.right !== 'undefined'){
        position.left = position.right;
        delete position.right;
      }

      if(typeof position.paddingLeft !== 'undefined' &&
        typeof position.paddingRight !== 'undefined'){
        temp = position.paddingLeft;
        position.paddingLeft = position.paddingRight;
        position.paddingRight = temp;
      }else if(typeof position.paddingLeft !== 'undefined'){
        position.paddingRight = position.paddingLeft;
        delete position.paddingLeft;
      }else if(typeof position.paddingRight !== 'undefined'){
        position.paddingLeft = position.paddingRight;
        delete position.paddingRight;
      }
    }

    var ps = ['left', 'top', 'right', 'bottom', 'width', 'height',
      'padding', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'];
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if (typeof position[p] === 'number') {
        style[p] = position[p] + 'px';
      } else if (typeof position[p] !== 'undefined') {
        style[p] = position[p];
      }else{
        if(p.substr(0, 7) === 'padding'){
          style[p] = 0;
        }else{
          style[p] = 'auto';
        }
      }
    }

    if(typeof position.zIndex === 'undefined'){
      //set zindex=auto instead of 0, because inner dom of widget may need to overlay other widget
      //that has the same zindex.
      style.zIndex = 'auto';
    }else{
      style.zIndex = position.zIndex;
    }
    return style;
  };

  /**
   * compare two object/array recursively
   * Note: null === null, undefined === undefined
   */
  function isEqual(o1, o2) {
    var leftChain, rightChain;

    function compare2Objects(x, y) {
      var p;
      if(x === null && y === null || typeof x === 'undefined' && typeof y === 'undefined'){
        return true;
      }

      if(x === null && y !== null || y === null && x !== null ||
        typeof x === 'undefined' && typeof y !== 'undefined' ||
        typeof y === 'undefined' && typeof x !== 'undefined'){
        return false;
      }

      // remember that NaN === NaN returns false
      // and isNaN(undefined) returns true
      if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
        return true;
      }
      // Compare primitives and functions.
      // Check if both arguments link to the same object.
      // Especially useful on step when comparing prototypes
      if (x === y) {
        return true;
      }
      // Works in case when functions are created in constructor.
      // Comparing dates is a common scenario. Another built-ins?
      // We can even handle functions passed across iframes
      if ((typeof x === 'function' && typeof y === 'function') ||
        (x instanceof Date && y instanceof Date) ||
        (x instanceof RegExp && y instanceof RegExp) ||
        (x instanceof String && y instanceof String) ||
        (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString();
      }
      // check for infinitive linking loops
      if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
        return false;
      }
      // Quick checking of one object beeing a subset of another.
      // todo: cache the structure of arguments[0] for performance
      if (y !== null) {
        for (p in y) {
          if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
          } else if (typeof y[p] !== typeof x[p]) {
            return false;
          }
        }
        for (p in x) {
          if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
          } else if (typeof y[p] !== typeof x[p]) {
            return false;
          }
          switch (typeof(x[p])) {
          case 'object':
          case 'function':
            leftChain.push(x);
            rightChain.push(y);
            if (!compare2Objects(x[p], y[p])) {
              return false;
            }
            leftChain.pop();
            rightChain.pop();
            break;
          default:
            if (x[p] !== y[p]) {
              return false;
            }
            break;
          }
        }
      }

      return true;
    }

    leftChain = []; //todo: this can be cached
    rightChain = [];
    if (!compare2Objects(o1, o2)) {
      return false;
    }
    return true;
  }

  mo.isEqual = isEqual;

  //merge the target and src object/array, return the merged object/array.
  function merge(target, src) {
    var array = Array.isArray(src);
    var dst = array && [] || {};

    if (array) {
      target = target || [];
      dst = dst.concat(target);
      src.forEach(function(e, i) {
        if (typeof target[i] === 'undefined') {
          dst[i] = e;
        } else if (typeof e === 'object') {
          dst[i] = merge(target[i], e);
        } else {
          if (target.indexOf(e) === -1) {
            dst.push(e);
          }
        }
      });
    } else {
      if (target && typeof target === 'object') {
        Object.keys(target).forEach(function(key) {
          dst[key] = target[key];
        });
      }
      Object.keys(src).forEach(function(key) {
        if (typeof src[key] !== 'object' || !src[key]) {
          dst[key] = src[key];
        } else {
          if (!target[key]) {
            dst[key] = src[key];
          } else {
            dst[key] = merge(target[key], src[key]);
          }
        }
      });
    }

    return dst;
  }

  function setVerticalCenter(contextNode) {
    function doSet() {
      var nodes = query('.jimu-vcenter-text', contextNode),
        h, ph;
      array.forEach(nodes, function(node) {
        h = html.getContentBox(node).h;
        html.setStyle(node, {
          lineHeight: h + 'px'
        });
      }, this);

      nodes = query('.jimu-vcenter', contextNode);
      array.forEach(nodes, function(node) {
        h = html.getContentBox(node).h;
        ph = html.getContentBox(query(node).parent()[0]).h;
        html.setStyle(node, {
          marginTop: (ph - h) / 2 + 'px'
        });
      }, this);
    }

    //delay sometime to let browser update dom
    setTimeout(doSet, 10);
  }

  /**
   * get uri info from the configured uri property,
   * the info contains: folderUrl, name
   */
  function getUriInfo(uri) {
    var pos, firstSeg, info = {},
      amdFolder;

    pos = uri.indexOf('/');
    firstSeg = uri.substring(0, pos);

    //config using package
    amdFolder = uri.substring(0, uri.lastIndexOf('/') + 1);
    info.folderUrl = require(mo.getRequireConfig()).toUrl(amdFolder);
    info.amdFolder = amdFolder;
    return info;
  }

  mo.file = {
    loadFileAPI: function() {
      var def = new Deferred();
      if (fileAPIJsStatus === 'unload') {
        var prePath = !!window.isBuilder ? 'stemapp/' : "";
        window.FileAPI = {
          debug: false,
          flash: true,
          staticPath: prePath + 'libs/polyfills/fileAPI/',
          flashUrl: prePath + 'libs/polyfills/fileAPI/FileAPI.flash.swf',
          flashImageUrl: prePath + 'libs/polyfills/fileAPI/FileAPI.flash.image.swf'
        };

        _loadFileAPIJs(prePath, lang.hitch(this, function() {
          fileAPIJsStatus = 'loaded';
          def.resolve();
        }));
        fileAPIJsStatus = 'loading';
      } else if (fileAPIJsStatus === 'loaded'){
        def.resolve();
      }

      return def;
    },
    supportHTML5: function() {
      if (window.File && window.FileReader && window.FileList && window.Blob) {
        return true;
      } else {
        return false;
      }
    },
    supportFileAPI: function() {
      if (has('safari') && has('safari') < 6) {
        return false;
      }
      if (window.FileAPI && window.FileAPI.readAsDataURL) {
        return true;
      }
      return false;
    },
    isEnabledFlash: function(){
      var swf = null;
      if (document.all) {
        try{
          swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        }catch(e) {
          swf = null;
        }
      } else {
        if (navigator.plugins && navigator.plugins.length > 0) {
          swf = navigator.plugins["Shockwave Flash"];
        }
      }
      return !!swf;
    },
    containSeparator: function(path) {
      if (path.indexOf("/") >= 0) {
        return true;
      } else {
        if (path.indexOf("\\") >= 0) {
          return true;
        } else {
          return false;
        }
      }
    },
    getNameFromPath: function(path) {
      var separator = "";
      if (path.indexOf("/") >= 0) {
        separator = "/";
      } else {
        separator = "\\";
      }
      var segment = path.split(separator);
      if (segment.length > 0) {
        return segment[segment.length - 1];
      } else {
        return null;
      }

    },
    getFolderFromPath: function(path) {
      return path.substr(0, path.length - mo.file.getNameFromPath(path).length);
    },
    /********
     * read file by HTML5 API.
     *
     * parameters:
     * file: the file will be read.
     * filter: file type filter, files which don't match the filter will not be read and
       return false.
     * maxSize: file size which exceeds the size will return false;
     * cb: the callback function when file is read completed, signature: (err, fileName, fileData)
     */
    readFile: function(fileEvt, filter, maxSize, cb) {
      if (this.supportHTML5()) {
        var file = fileEvt.target.files[0];
        if (!file) {
          return;
        }
        // Only process image files.
        if (!file.type.match(filter)) {
          // cb("Invalid file type.");
          cb({
            errCode: "invalidType"
          });
          return;
        }

        if (file.size >= maxSize) {
          // cb("File size cannot exceed  " + Math.floor(maxSize / 1024) + "KB.");
          cb({
            errCode: "exceed"
          });
          return;
        }

        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = function(e) {
          cb(null, file.name, e.target.result);
        };
        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
      } else if (this.supportFileAPI()) {
        var files = window.FileAPI.getFiles(fileEvt);

        // Only process image files.
        if (!files[0].type.match(filter)) {
          // cb("Invalid file type.");
          cb({
            errCode: "invalidType"
          });
          return;
        }

        if (files[0].size >= maxSize) {
          // cb("File size cannot exceed  " + Math.floor(maxSize / 1048576) + "M.");
          cb({
            errCode: "exceed"
          });
          return;
        }

        window.FileAPI.readAsDataURL(files[0], function(evt) {
          if (evt && evt.result) {
            cb(null, files[0].name, evt.result);
          } else {
            cb({
              errCode: "readError"
            });
          }
        });
      }
    }
  };

  mo.processWidgetSetting = function(setting) {
    if (!setting.uri) {
      return setting;
    }
    lang.mixin(setting, getUriInfo(setting.uri));

    if (!setting.icon) {
      setting.icon = setting.amdFolder + 'images/icon.png';
    }
    if (!setting.thumbnail) {
      setting.thumbnail = setting.amdFolder + 'images/thumbnail.png';
    }

    //setting.label has been processed when loading config.
    return setting;
  };

  mo.getRequireConfig = function() {
    /* global jimuConfig */
    if (jimuConfig) {
      var packages = [];
      if (jimuConfig.widgetsPackage) {
        packages = packages.concat(jimuConfig.widgetsPackage);
      }
      if (jimuConfig.themesPackage) {
        packages = packages.concat(jimuConfig.themesPackage);
      }
      if (jimuConfig.configsPackage) {
        packages = packages.concat(jimuConfig.configsPackage);
      }
      return {
        packages: packages
      };
    } else {
      return {};
    }
  };

  mo.getTypeByGeometryType = function(esriType) {
    var type = '';
    var _pointTypes = ['esriGeometryPoint', 'esriGeometryMultipoint'];
    var _lineTypes = ['esriGeometryLine', 'esriGeometryCircularArc', 'esriGeometryEllipticArc',
    'esriGeometryBezier3Curve', 'esriGeometryPath', 'esriGeometryPolyline'];
    var _polygonTypes = ['esriGeometryRing', 'esriGeometryPolygon', 'esriGeometryEnvelope'];
    if (_pointTypes.indexOf(esriType) >= 0) {
      type = 'point';
    } else if (_lineTypes.indexOf(esriType) >= 0) {
      type = 'polyline';
    } else if (_polygonTypes.indexOf(esriType) >= 0) {
      type = 'polygon';
    }
    return type;
  };

  mo.getSymbolTypeByGeometryType = function(esriType){
    var symbolType = null;
    var geoType = mo.getTypeByGeometryType(esriType);
    if(geoType === 'point'){
      symbolType = 'marker';
    }
    else if(geoType === 'polyline'){
      symbolType = 'line';
    }
    else if(geoType === 'polygon'){
      symbolType = 'fill';
    }
    return symbolType;
  };

  mo.getServices = function() {
    return servicesObj;
  };

  mo.getArcGISDefaultGeometryService = function() {
    var url = servicesObj.geometryService;
    var gs = new GeometryService(url);
    return gs;
  };

  mo.restoreToDefaultWebMapExtent = function(map, webMapResponse, geoServiceUrl) {
    var def = new Deferred();
    var isMapValid = map && map.declaredClass === 'esri.Map';
    if (!isMapValid) {
      setTimeout(function() {
        def.reject('Invalid map.');
      }, 0);
      return def;
    }
    var itemInfo = webMapResponse && webMapResponse.itemInfo;
    if (!itemInfo) {
      setTimeout(function() {
        def.reject('Invalid itemInfo');
      }, 0);
      return def;
    }

    var points = itemInfo.item && itemInfo.item.extent;

    if (!points) {
      setTimeout(function() {
        def.reject('Invalid itemInfo.item.extent');
      });
      return def;
    }

    var spatialRef = new SpatialReference({
      wkid: 4326
    });
    var extent = new Extent(points[0][0], points[0][1], points[1][0], points[1][1], spatialRef);

    var mapWkid = parseInt(map.spatialReference.wkid, 10);

    if (mapWkid === 4326) {
      return map.setExtent(extent);
    } else {
      if (map.spatialReference.isWebMercator()) {
        extent = webMercatorUtils.geographicToWebMercator(extent);
        return map.setExtent(extent);
      } else {
        var params = new ProjectParameters();
        params.geometries = [extent];
        params.outSR = map.spatialReference;

        var gs = esriConfig && esriConfig.defaults && esriConfig.defaults.geometryService;
        var existGS = gs && gs.declaredClass === "esri.tasks.GeometryService";
        if (!existGS) {
          var validGeoService = geoServiceUrl && typeof geoServiceUrl === 'string' &&
          lang.trim(geoServiceUrl);
          if (validGeoService) {
            geoServiceUrl = lang.trim(geoServiceUrl);
            gs = new GeometryService(geoServiceUrl);
          } else {
            gs = mo.getArcGISDefaultGeometryService();
          }
        }

        gs.project(params).then(function(geometries) {
          var projectedExt = geometries && geometries[0];
          if (projectedExt) {
            return map.setExtent(projectedExt);
          } else {
            def.reject('Invalid projected geometry.');
            return def;
          }
        }, function(err) {
          console.error(err);
          def.reject(err);
          return def;
        });
      }
    }

    return def;
  };

  mo.getAncestorWindow = function() {
    var w = window;
    while (w && w.parent && w !== w.parent) {
      w = w.parent;
    }
    return w;
  };

  mo.getAncestorDom = function(child, verifyFunc,
    /*HTMLElement|Number optional */ maxLoopSizeOrDom) {
    if (child && child.nodeType === 1) {
      if (verifyFunc && typeof verifyFunc === 'function') {
        var maxLoopSize = 100;
        var maxLoopDom = document.body;

        if (maxLoopSizeOrDom) {
          if (typeof maxLoopSizeOrDom === 'number') {
            //Number
            maxLoopSizeOrDom = parseInt(maxLoopSizeOrDom, 10);
            if (maxLoopSizeOrDom > 0) {
              maxLoopSize = maxLoopSizeOrDom;
            }
          } else if (maxLoopSizeOrDom.nodeType === 1) {
            //HTMLElement
            maxLoopDom = maxLoopSizeOrDom;
          }
        }

        var loop = 0;
        while (child.parentNode && loop < maxLoopSize &&
          html.isDescendant(child.parentNode, maxLoopDom)) {
          if (verifyFunc(child.parentNode)) {
            return child.parentNode;
          }
          child = child.parentNode;
          loop++;
        }
      }
    }
    return null;
  };

  mo.bindClickAndDblclickEvents = function(dom, clickCallback, dblclickCallback,
    /* optional */ _timeout) {
    var handle = null;
    var isValidDom = dom && dom.nodeType === 1;
    var isValidClick = clickCallback && typeof clickCallback === 'function';
    var isValidDblclick = dblclickCallback && typeof dblclickCallback === 'function';
    var isValid = isValidDom && isValidClick && isValidDblclick;
    if (isValid) {
      var timeout = 200;
      if (_timeout && typeof _timeout === 'number') {
        var t = parseInt(_timeout, 10);
        if (t > 0) {
          timeout = t;
        }
      }

      var clickCount = 0;
      handle = on(dom, 'click', function(evt) {
        clickCount++;
        if (clickCount === 1) {
          setTimeout(function() {
            if (clickCount === 1) {
              clickCount = 0;
              clickCallback(evt);
            }
          }, timeout);
        } else if (clickCount === 2) {
          clickCount = 0;
          dblclickCallback(evt);
        }
      });
    }
    return handle;
  };

  mo.isScrollToBottom = function(dom) {
    var box = html.getContentBox(dom);
    var a = dom.scrollTop + box.h;
    var b = dom.scrollHeight - a;
    return b === 0;
  };

  mo.getAllItemTypes = function() {
    var allTypes = [];
    //Web Content
    var maps1 = ['Web Map', 'Web Scene', 'CityEngine Web Scene'];
    var layers1 = ['Feature Service', 'Map Service', 'Image Service', 'KML', 'WMS',
    'Feature Collection', 'Feature Collection Template', 'Geodata Service', 'Globe Service'];
    var tools1 = ['Geometry Service', 'Geocoding Service', 'Network Analysis Service',
    'Geoprocessing Service'];
    var applications1 = ['Web Mapping Application', 'Mobile Application', 'Code Attachment',
    'Operations Dashboard Add In', 'Operation View'];
    var datafiles1 = ['Symbol Set', 'Color Set', 'Shapefile', 'CSV', 'Service Definition',
    'Document Link', 'Microsoft Word', 'Microsoft PowerPoint', 'Microsoft Excel', 'PDF',
    'Image', 'Visio Document'];
    //Desktop Content
    var maps2 = ['Map Document', 'Map Package', 'Tile Package', 'ArcPad Package',
    'Explorer Map', 'Globe Document', 'Scene Document', 'Published Map', 'Map Template',
    'Windows Mobile Package'];
    var layers2 = ['Layer', 'Layer Package', 'Explorer Layer'];
    var tools2 = ['Geoprocessing Package', 'Geoprocessing Sample', 'Locator Package',
    'Rule Package'];
    var applications2 = ['Workflow Manager Package', 'Desktop Application',
    'Desktop Application Template', 'Code Sample', 'Desktop Add In', 'Explorer Add In'];

    allTypes = allTypes.concat(maps1).concat(layers1).concat(tools1)
    .concat(applications1).concat(datafiles1);
    allTypes = allTypes.concat(maps2).concat(layers2).concat(tools2).concat(applications2);
    return allTypes;
  };

  mo.getItemQueryStringByTypes = function(itemTypes) {
    var queryStr = '';
    var allTypes = mo.getAllItemTypes();
    if (itemTypes && itemTypes.length > 0) {
      if (itemTypes.length > 0) {
        var validStr = '';
        array.forEach(itemTypes, function(type, index) {
          var s = ' type:"' + type + '" ';
          validStr += s;
          if (index !== itemTypes.length - 1) {
            validStr += ' OR ';
          }
        });
        queryStr = ' ( ' + validStr + ' ) ';
        var sumAllTypes = itemTypes.concat(allTypes);
        var removedTypes = array.filter(sumAllTypes, function(removedType){
          return array.every(itemTypes, function(itemType){
            return itemType.toLowerCase().indexOf(removedType.toLowerCase()) < 0;
          });
        });

        array.forEach(removedTypes, function(type) {
          var s = ' -type:"' + type + '" ';
          queryStr += s;
        });
      }
    }
    return queryStr;
  };

  mo.getItemQueryStringByTypeKeywords = function(typeKeywords){
    var queryStr = '';
    //must use double quotation marks around typeKeywords
    //typekeywords:"Web AppBuilder" or typekeywords:"Web AppBuilder,Web Map"
    if(typeKeywords && typeKeywords.length > 0){
      queryStr = ' typekeywords:"' + typeKeywords.join(',') + '" ';
    }
    return queryStr;
  };

  mo.isNotEmptyString = function(str, /* optional */ trim) {
    var b = str && typeof str === 'string';
    if (b) {
      if (trim) {
        return b && lang.trim(str);
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  mo.isValidNumber = function(num){
    return typeof num === 'number' && !isNaN(num);
  };

  mo.isObject = function(o) {
    return o && typeof o === 'object';
  };

  mo.createWebMap = function(portalUrl, itemId, mapDiv, /* optional */ options) {
    //var arcgisUrlOld = arcgisUtils.arcgisUrl;
    portalUrl = portalUrlUtils.getStandardPortalUrl(portalUrl);
    var itemUrl = portalUrlUtils.getBaseItemUrl(portalUrl);
    arcgisUtils.arcgisUrl = itemUrl;
    var def = arcgisUtils.createMap(itemId, mapDiv, options);
    return def;
  };

  mo.getRandomString = function() {
    var str = Math.random().toString();
    str = str.slice(2, str.length);
    return str;
  };

  mo._getDomainsByServerName = function(serverName){
    var splits = serverName.split('.');
    var length = splits.length;
    var domains = array.map(splits, lang.hitch(this, function(v, index){
      // jshint unused:false
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
  };

  mo.removeCookie = function(cookieName, path){
    var domains = this._getDomainsByServerName(window.location.hostname);

    array.forEach(domains, lang.hitch(this, function(domainName){
      cookie(cookieName, null, {
        expires: -1,
        path: path
      });

      cookie(cookieName, null, {
        expires: -1,
        path: path,
        domain: domainName
      });

      cookie(cookieName, null, {
        expires: -1,
        path: path,
        domain: '.' + domainName
      });
    }));
  };

  mo.isLocaleChanged = function(oldLocale, newLocale){
    return !oldLocale.startWith(newLocale);
  };

  mo.hashToObject = function(hashStr){
    hashStr = hashStr.replace('#', '');
    var hashObj = ioQuery.queryToObject(hashStr);
    for (var p in hashObj) {
      if (hashObj.hasOwnProperty(p)) {
        try {
          hashObj[p] = json.parse(hashObj[p]);
        } catch (err) {
          continue;
        }
      }
    }
    return hashObj;
  };

  mo.reCreateObject = function(obj) {
    //summary:
    //  because of dojo's lang.isArray issue, we need re-create the array properties
    var ret;

    function copyArray(_array) {
      var retArray = [];
      _array.forEach(function(a) {
        if (Array.isArray(a)) {
          retArray.push(copyArray(a));
        } else if (typeof a === 'object') {
          retArray.push(copyObject(a));
        } else {
          retArray.push(a);
        }
      });
      return retArray;
    }

    function copyObject(_obj) {
      var ret = {};
      for (var p in _obj) {
        if (!_obj.hasOwnProperty(p)) {
          continue;
        }
        if(_obj[p] === null){
          ret[p] = null;
        }else if (Array.isArray(_obj[p])) {
          ret[p] = copyArray(_obj[p]);
        } else if (typeof _obj[p] === 'object') {
          ret[p] = copyObject(_obj[p]);
        } else {
          ret[p] = _obj[p];
        }
      }
      return ret;
    }

    if (Array.isArray(obj)) {
      ret = copyArray(obj);
    } else {
      ret = copyObject(obj);
    }
    return ret;
  };

  mo.setVerticalCenter = setVerticalCenter;
  mo.merge = merge;
  mo.loadStyleLink = loadStyleLink;

  mo.changeLocation = function(newUrl){
    // debugger;
    if (window.history.pushState) {
      window.history.pushState({path:newUrl}, '', newUrl);
    }/*else{
      window.location.href = newUrl;
    }*/
  };

  mo.urlToObject = function(url){
    var ih = url.indexOf('#'),
    obj = null;
    if (ih === -1){
      obj = esriUrlUtils.urlToObject(url);
      obj.hash = null;
    }else {
      var urlParts = url.split('#');
      obj = esriUrlUtils.urlToObject(urlParts[0]);
      obj.hash = urlParts[1] ?
        (urlParts[1].indexOf('=') > -1 ? ioQuery.queryToObject(urlParts[1]) : urlParts[1]): null;
    }
    return obj;
  };


  mo.addManifestProperies = function(manifest) {
    manifest.icon = manifest.url + 'images/icon.png';

    if(manifest.category === "theme") {
      addThemeManifestProperies(manifest);
    } else {
      addWidgetManifestProperties(manifest);
    }
  };

  mo.getUniqueValues = function(url, fieldName){
    var def = new Deferred();
    var reqUrl = url.replace(/\/*$/g, '') + "/generateRenderer";
    var classificationDef = {"type":"uniqueValueDef", "uniqueValueFields":[fieldName]};
    var str = json.stringify(classificationDef);
    esriRequest({
      url: reqUrl,
      content: {
        classificationDef: str,
        f: 'json'
      },
      handleAs: 'json',
      callbackParamName:'callback'
    }).then(lang.hitch(this, function(response){
      var values = [];
      var uniqueValueInfos = response && response.uniqueValueInfos;
      if(uniqueValueInfos && uniqueValueInfos.length > 0){
        values = array.map(uniqueValueInfos, lang.hitch(this, function(info){
          return info.value;
        }));
      }
      def.resolve(values);
    }), lang.hitch(this, function(err){
      def.reject(err);
    }));
    return def;
  };

  mo.combineRadioCheckBoxWithLabel = function(inputDom, labelDom){
    var isValidInput = false;
    if(inputDom && inputDom.nodeType === 1 && inputDom.tagName.toLowerCase() === 'input'){
      var inputType = inputDom.getAttribute('type') || '';
      inputType = inputType.toLowerCase();
      if(inputType === 'radio' || inputType === 'checkbox'){
        isValidInput = true;
      }
    }
    var isValidLabel = false;
    if(labelDom && labelDom.nodeType === 1 && labelDom.tagName.toLowerCase() === 'label'){
      isValidLabel = true;
    }
    if(isValidInput && isValidLabel){
      var inputId = inputDom.getAttribute('id');
      if(!inputId){
        inputId = "input_" + mo.getRandomString();
        inputDom.setAttribute('id', inputId);
      }
      labelDom.setAttribute('for', inputId);
      html.setStyle(labelDom, 'cursor', 'pointer');
    }
  };

  mo.convertExtentToPolygon = function(extent){
    //order: left-top right-top right-bottom left-bottom left-top
    var xLeft = extent.xmin;
    var xRight = extent.xmax;
    var yBottom = extent.ymin;
    var yTop = extent.ymax;

    var polygon = new Polygon({
      "rings": [
        [
          [xLeft, yTop],
          [xRight, yTop],
          [xRight, yBottom],
          [xLeft, yBottom],
          [xLeft, yTop]
        ]
      ],
      "spatialReference": extent.toJson()
    });
    return polygon;
  };

  //combine multiple geometries into one geometry
  mo.combineGeometries = function(geometries){
    //geometries must have same geometryType: point,multipoint,polyline,polygon,extent
    //geometries must have same spatialReference
    function combinePoints(geos){
      //geos is an array of point or multipoint
      var mpJson = {
        "points": [],
        "spatialReference": geos[0].spatialReference.toJson()
      };
      array.forEach(geos, function(geo){
        mpJson.points = mpJson.points.concat(geo.points);
      });
      var multipoint = new Multipoint(mpJson);
      return multipoint;
    }

    function combinePolylines(geos){
      //geos is an array of polyline
      var polylineJson = {
        "paths":[],
        "spatialReference": geos[0].spatialReference.toJson()
      };
      array.forEach(geos, function(geo){
        polylineJson.paths = polylineJson.paths.concat(geo.paths);
      });
      var polyline = new Polyline(polylineJson);
      return polyline;
    }

    function combinePolygons(geos){
      //geos is an array of polygon or extent
      var polygonJson = {
        "rings": [],
        "spatialReference": geos[0].spatialReference.toJson()
      };
      array.forEach(geos, function(geo){
        if(geo.type === 'polygon'){
          polygonJson.rings = polygonJson.rings.concat(geo.rings);
        }else if(geo.type === 'extent'){
          var plg = mo.convertExtentToPolygon(geo);
          polygonJson.rings = polygonJson.rings.concat(plg.rings);
        }
      });
      var polygon = new Polygon(polygonJson);
      return polygon;
    }

    var geometry = null;
    if(geometries && geometries.length > 0){
      if(geometries.length === 1){
        geometry = geometries[0];
      }else{
        var g1 = null;
        var g2 = null;
        var geometryType = null;
        var type = null;
        for(var i = 0; i < geometries.length; i++){
          g1 = geometries[i];
          switch(g1.type){
            case 'point':
            case 'multipoint':
              type = 'point';
              break;
            case 'polyline':
              type = 'polyline';
              break;
            case 'polygon':
            case 'extent':
              type = 'polygon';
              break;
            default:
              //invalid type
              return null;
          }

          if(i === 0){
            geometryType = type;
          }else{
            if(geometryType !== type){
              return null;
            }
          }

          if(i !== geometries.length - 1){
            g2 = geometries[i + 1];
            if(!g1.spatialReference.equals(g2.spatialReference)){
              return null;
            }
          }
        }

        if(type === 'point'){
          geometry = combinePoints(geometries);
        }else if(type === 'polyline'){
          geometry = combinePolylines(geometries);
        }else if(type === 'polygon'){
          geometry = combinePolygons(geometries);
        }
      }
    }
    return geometry;
  };

  mo.isFeaturelayerUrlSupportQuery = function(featureLayerUrl, capabilities){
    var isSupportQuery = false;
    var isFeatureService = (/\/featureserver\//gi).test(featureLayerUrl);
    var isMapService = (/\/mapserver\//gi).test(featureLayerUrl);
    capabilities = capabilities || '';
    capabilities = capabilities.toLowerCase();
    if (isFeatureService) {
      isSupportQuery = capabilities.indexOf('query') >= 0;
    } else if (isMapService) {
      isSupportQuery = capabilities.indexOf('data') >= 0;
    }
    return isSupportQuery;
  };

  mo.isImageServiceSupportQuery = function(capabilities){
    capabilities = capabilities || '';
    return capabilities.toLowerCase().indexOf('catalog') >= 0;
  };

  mo.isStringEndWith = function(s, endS){
    return (s.lastIndexOf(endS) + endS.length === s.length);
  };

  function addThemeManifestProperies(manifest) {
    manifest.panels.forEach(function(panel) {
      panel.uri = 'panels/' + panel.name + '/Panel.js';
    });

    manifest.styles.forEach(function(style) {
      style.uri = 'styles/' + style.name + '/style.css';
    });

    manifest.layouts.forEach(function(layout) {
      layout.uri = 'layouts/' + layout.name + '/config.json';
      layout.icon = 'layouts/' + layout.name + '/icon.png';
      layout.RTLIcon = 'layouts/' + layout.name + '/icon_rtl.png';
    });
  }

  function addWidgetManifestProperties(manifest) {
    //because tingo db engine doesn't support 2D, 3D property, so, change here
    if (typeof manifest['2D'] !== 'undefined') {
      manifest.support2D = manifest['2D'];
    }
    if (typeof manifest['3D'] !== 'undefined') {
      manifest.support3D = manifest['3D'];
    }

    if (typeof manifest['2D'] === 'undefined' && typeof manifest['3D'] === 'undefined') {
      manifest.support2D = true;
    }

    delete manifest['2D'];
    delete manifest['3D'];

    if (typeof manifest.properties === 'undefined') {
      manifest.properties = {};
    }

    sharedUtils.processWidgetProperties(manifest);
  }

  mo.processManifestLabel = function(manifest, locale){
    manifest.label = manifest.i18nLabels && (manifest.i18nLabels[locale] ||
      manifest.i18nLabels.defaultLabel) ||
      manifest.label ||
      manifest.name;
    if(manifest.layouts){
      array.forEach(manifest.layouts, function(layout){
        var key = 'i18nLabels_layout_' + layout.name;
        layout.label = manifest[key] && (manifest[key][locale] ||
          manifest[key].defaultLabel) ||
          layout.label ||
          layout.name;
      });
    }
    if(manifest.styles){
      array.forEach(manifest.styles, function(_style){
        var key = 'i18nLabels_style_' + _style.name;
        _style.label = manifest[key] && (manifest[key][locale] ||
          manifest[key].defaultLabel) ||
          _style.label ||
          _style.name;
      });
    }
  };

  mo.addManifest2WidgetJson = function(widgetJson, manifest){
    lang.mixin(widgetJson, manifest.properties);
    widgetJson.name = manifest.name;
    if(!widgetJson.label){
      widgetJson.label = manifest.label;
    }
    widgetJson.manifest = manifest;
  };

  mo.addI18NLabel = function(manifest){
    var def = new Deferred();
    if(manifest.i18nLabels){
      def.resolve(manifest);
      return def;
    }
    manifest.i18nLabels = {};

    if(manifest.properties && manifest.properties.hasLocale === false){
      def.resolve(manifest);
      return def;
    }

    //theme or widget label
    var key = manifest.category === 'widget'? '_widgetLabel': '_themeLabel';
    require(mo.getRequireConfig(), ['dojo/i18n!' + manifest.amdFolder + 'nls/strings'],
      function(localeStrings){
      manifest.i18nLabels[dojoConfig.locale] = localeStrings[key];

      //theme's layout and style label
      if(manifest.category === 'theme'){
        if(manifest.layouts){
          manifest.layouts.forEach(function(layout){
            manifest['i18nLabels_layout_' + layout.name] = {};
            manifest['i18nLabels_layout_' + layout.name][dojoConfig.locale] =
            localeStrings['_layout_' + layout.name];
          });
        }

        if(manifest.styles){
          manifest.styles.forEach(function(style){
            manifest['i18nLabels_style_' + style.name] = {};
            manifest['i18nLabels_style_' + style.name][dojoConfig.locale] =
            localeStrings['_style_' + style.name];
          });
        }
      }
      def.resolve(manifest);
    });

    return def;
  };

  /*
  *Optional
  *An object with the following properties:
  *pattern (String, optional):
  *override formatting pattern with this string. Default value is based on locale.
   Overriding this property will defeat localization. Literal characters in patterns
   are not supported.
  *type (String, optional):
  *choose a format type based on the locale from the following: decimal, scientific
   (not yet supported), percent, currency. decimal by default.
  *places (Number, optional):
  *fixed number of decimal places to show. This overrides any information in the provided pattern.
  *round (Number, optional):
  *5 rounds to nearest .5; 0 rounds to nearest whole (default). -1 means do not round.
  *locale (String, optional):
  *override the locale used to determine formatting rules
  *fractional (Boolean, optional):
  *If false, show no decimal places, overriding places and pattern settings.
  */
  mo.localizeNumber = function(num, options){
    var decimalStr = num.toString().split('.')[1] || "",
          decimalLen = decimalStr.length;
    var _pattern = "";
    if (decimalLen > 0) {
      var patchStr = Array.prototype.join.call({
        length: decimalLen
      }, '0');
      _pattern = "#,###,###,##0.0" + patchStr;
    }else {
      _pattern = "#,###,###,##0";
    }

    var _options = {
      locale: config.locale,
      pattern: _pattern
    };
    lang.mixin(_options, options || {});

    try {
      var fn = dojoNumber.format(num, _options);
      return fn;
    } catch (err) {
      console.error(err);
      return num.toLocaleString();
    }
  };

  /*
  *Optional
  *An object with the following properties:
  *pattern (String, optional):
  *override formatting pattern with this string. Default value is based on locale.
   Overriding this property will defeat localization. Literal characters in patterns
   are not supported.
  *type (String, optional):
  *choose a format type based on the locale from the following: decimal,
   scientific (not yet supported), percent, currency. decimal by default.
  *locale (String, optional):
  *override the locale used to determine formatting rules
  *strict (Boolean, optional):
  *strict parsing, false by default. Strict parsing requires input as produced by the
   format() method. Non-strict is more permissive, e.g. flexible on white space, omitting
   thousands separators
  *fractional (Boolean|Array, optional):
  *Whether to include the fractional portion, where the number of decimal places are
   implied by pattern or explicit 'places' parameter. The value [true,false] makes the
   fractional portion optional.
  */
  mo.parseNumber = function(numStr, options){
    var _options = {
      locale: config.locale
    };
    lang.mixin(_options, options || {});
    try {
      var dn = dojoNumber.parse(numStr, _options);
      return dn;
    } catch(err) {
      console.error(err);
      return numStr;
    }
  };

  /*
  *Optional
  *An object with the following properties:
  *selector (String):
  *choice of 'time','date' (default: date and time)
  *formatLength (String):
  *choice of long, short, medium or full (plus any custom additions). Defaults to 'short'
  *datePattern (String):
  *override pattern with this string
  *timePattern (String):
  *override pattern with this string
  *am (String):
  *override strings for am in times
  *pm (String):
  *override strings for pm in times
  *locale (String):
  *override the locale used to determine formatting rules
  *fullYear (Boolean):
  *(format only) use 4 digit years whenever 2 digit years are called for
  *strict (Boolean):
  *(parse only) strict parsing, off by default
  */
  mo.localizeDate = function(d, options){
    var _options = {
      locale: config.locale,
      fullYear: true
    };
    lang.mixin(_options, options || {});

    try {
      var ld = dateLocale.format(d, _options);
      return ld;
    } catch(err) {
      console.error(err);
      if (_options.selector === 'date') {
        return d.toLocaleDateString();
      } else if (_options.selector === 'time') {
        return d.toLocaleTimeString();
      } else {
        return d.toLocaleString();
      }
    }
  };

  mo.fieldFormatter = {
    getFormattedUrl: function(str) {
      if (str && typeof str === "string") {
        var s = str.indexOf('http:');
        if (s === -1) {
          s = str.indexOf('https:');
        }
        if (s > -1) {
          if (str.indexOf('href=') === -1) {
            var e = str.indexOf(' ', s);
            if (e === -1) {
              e = str.length;
            }
            var link = str.substring(s, e);
            str = str.substring(0, s) +
              '<A href="' + link + '" target="_blank">' + link + '</A>' +
              str.substring(e, str.length);
          }
        }
      }
      return str || "";
    },

    getFormattedNumber: function(num) {
      if (typeof num === 'number') {
        var decimalStr = num.toString().split('.')[1] || "",
          decimalLen = decimalStr.length;
        num = mo.localizeNumber(num, {
          places: decimalLen
        });
        return '<span class="jimu-numeric-value">' + (num || "") + '</span>';
      }
      return num;
    },

    getFormattedDate: function(str) {
      if (str) {
        var sDateate = new Date(str);
        str = mo.localizeDate(sDateate, {
          fullYear: true
        });
      }
      return str || "";
    },

    getCodedValue: function(domain, v) {
      if (domain && domain.codedValues) {
        for (var i = 0, len = domain.codedValues.length; i < len; i++) {
          var cv = domain.codedValues[i];
          if (esriLang.isDefined(v) && lang.exists('code', cv) &&
            v.toString() === cv.code.toString()) {
            return cv.name;
          }
        }
        return v;
      } else {
        return v || null;
      }
    },

    getTypeName: function(value, types) {
      var len = types.length;
      for (var i = 0; i < len; i++) {
        if (value === types[i].id) {
          return types[i].name;
        }
      }
      return value;
    }
  };

  mo.addRelativePathInCss = addRelativePathInCss;

  mo.url = {
    isAbsolute: function(url){
      if(!url){
        return false;
      }
      return url.startWith('http') || url.startWith('/');
    },

    removeQueryParamFromUrl: function(url, paramName){
      var urlObject = esriUrlUtils.urlToObject(url);
      if(urlObject.query){
        delete urlObject.query[paramName];
      }
      var ret = urlObject.path;
      for(var q in urlObject.query){
        if(ret === urlObject.path){
          ret = ret + '?' + q + '=' + urlObject.query[q];
        }else{
          ret = ret + '&' + q + '=' + urlObject.query[q];
        }
      }
      return ret;
    },

    addQueryParamToUrl: function(url, paramName, paramValue){
      var urlObject = esriUrlUtils.urlToObject(url);
      if(!urlObject.query){
        urlObject.query = {};
      }
      urlObject.query[paramName] = paramValue;
      var ret = urlObject.path;
      for(var q in urlObject.query){
        if(ret === urlObject.path){
          ret = ret + '?' + q + '=' + urlObject.query[q];
        }else{
          ret = ret + '&' + q + '=' + urlObject.query[q];
        }
      }
      return ret;
    }
  };

  mo.processUrlInWidgetConfig = function(url, widgetFolderUrl){
    if(!url){
      return;
    }
    if(url.startWith('data:') || url.startWith('http') || url.startWith('/')){
      return url;
    }else if(url.startWith('${appPath}')){
      return url.replace('${appPath}', window.appInfo.appPath);
    }else{
      return widgetFolderUrl + url;
    }
  };

  mo.processUrlInAppConfig = function(url){
    if(!url){
      return;
    }
    if(url.startWith('data:') || url.startWith('http') || url.startWith('/')){
      return url;
    }else{
      return window.appInfo.appPath + url;
    }
  };

  mo.getLocationUrlWithoutHashAndQueryParams = function(){
    //url:https://gallery.chn.esri.com:3344/webappbuilder/?action=setportalurl
    //result:https://gallery.chn.esri.com:3344/webappbuilder/
    var loc = window.location;
    var retUrl = loc.protocol + "//" + loc.host + loc.pathname;

    var urlObject = esriUrlUtils.urlToObject(loc.href);
    if(urlObject.query && urlObject.query.apiurl){
      retUrl = mo.url.addQueryParamToUrl(retUrl, 'apiurl', urlObject.query.apiurl);
    }

    return retUrl;
  };

  mo.getDefaultWebMapThumbnail = function(){
    return require.toUrl('jimu/images/webmap.png');
  };

  mo.invertColor = function(hexTripletColor) {
    var color = hexTripletColor;
    color = color.substring(1);           // remove #
    if (color.length === 3) {
      color = color.slice(0, 1) +
              color.slice(0, 1) +
              color.slice(1, 1) +
              color.slice(1, 1) +
              color.slice(2, 1) +
              color.slice(2, 1);
    }
    color = parseInt(color, 16);          // convert to integer
    if(color > 7829367) {
      return "#000000";
    } else {
      return "#ffffff";
    }
  };

  /*
  Mixin config2 to config1, return the mixed object, but do not modify config1.
  What to mixin:
    replace widget's position, group's panel position, map's position.
  */
  mo.mixinAppConfigPosition = function(config1, config2){
    var mixinConfig = lang.clone(config1);
    if(!config2){
      return mixinConfig;
    }
    config2 = lang.clone(config2);
    var os1 = mixinConfig.widgetOnScreen;
    var os2 = config2.widgetOnScreen;
    if(os2 && os2.widgets){
      if(Object.prototype.toString.call(os2.widgets) ===
        '[object Object]'){

        array.forEach(os1.widgets, function(widget1, i){
          var k;
          if(widget1.uri){
            k = widget1.uri;
          }else{
            k = 'ph_' + i;
          }

          if(os2.widgets[k] && os2.widgets[k].position){
            if(!os2.widgets[k].position.relativeTo){
              os2.widgets[k].position.relativeTo = 'map';
            }
            widget1.position = os2.widgets[k].position;
          }
        }, this);
      }else{
        array.forEach(os2.widgets, function(widget2, i){
          if(widget2.position && !widget2.position.relativeTo){
            widget2.position.relativeTo = 'map';
          }
          if(os1.widgets[i] && widget2.position){
            os1.widgets[i].position = widget2.position;
          }
        });
      }
    }

    if(os2 && os2.groups){
      if(Object.prototype.toString.call(os2.groups) ===
        '[object Object]'){

        array.forEach(os1.groups, function(group1, i){
          var k;
          if(group1.label){
            k = group1.label;
          }else{
            k = 'g_' + i;
          }

          if(os2.groups[k] && os2.groups[k].panel && os2.groups[k].panel.position){
            if(!os2.groups[k].panel.position.relativeTo){
              os2.groups[k].panel.position.relativeTo = 'map';
            }
            group1.panel.position = os2.groups[k].panel.position;
          }
        }, this);
      }else{
        array.forEach(os2.groups, function(group2, i){
          if(group2.panel && group2.panel.position &&
            !group2.panel.position.relativeTo){
            group2.panel.position.relativeTo = 'map';
          }
          if(os1.groups[i] && group2.panel.position){
            os1.groups[i].panel.position = group2.panel.position;
          }
        });
      }
    }

    if(config2.map && config2.map.position){
      if(mixinConfig.map){
        mixinConfig.map.position = config2.map.position;
      }else{
        mixinConfig.map = {position: config2.map.position};
      }
    }

    if(config2.widgetPool && config2.widgetPool.panel){
      if(config2.widgetPool.panel.position && !config2.widgetPool.panel.position.relativeTo){
        config2.widgetPool.panel.position.relativeTo = 'map';
      }
      mixinConfig.widgetPool.panel.position = config2.widgetPool.panel.position;
    }

    //mobileLayout is used to override it's main config, so replace totally
    if(config2.mobileLayout){
      mixinConfig.mobileLayout = config2.mobileLayout;
    }
    return mixinConfig;
  };
  /**********************************
   * About template
   **********************************/

  // reset some field of config by template config.
  function getOrSetConfigByTemplate(config, key, value) {
    //config: Object
    //  the destination config object
    //key: String
    //  the key value relative to the config object, like this: app_p1_p2[0], app_p1_p2[1]--
    //value: String
    // value is undefined: get the value correspond to the key and save to 'value' param.
    // value is not undefined: set the value of key.
    var keyArray = convertToKeyArray(key);

    var obj = config;
    for (var i = 1; i < keyArray.length - 1; i++) {
      obj = getSubObj(obj, keyArray[i]);
      if (!obj) {
        return;
      }
    }

    if (keyArray[keyArray.length - 1].deleteFlag) {
      if (value === true) {
        if (lang.isArray(obj[keyArray[keyArray.length - 1].key])) {
          delete obj[keyArray[keyArray.length - 1].key][keyArray[keyArray.length - 1].index];
        } else {
          delete obj[keyArray[keyArray.length - 1].key];
        }
      }
    } else {
      if (lang.isArray(obj[keyArray[keyArray.length - 1].key])) {
        if(value === undefined) {
          // get value to valueParam
          return obj[keyArray[keyArray.length - 1].key][keyArray[keyArray.length - 1].index];
        } else {
          // set value to config
          obj[keyArray[keyArray.length - 1].key][keyArray[keyArray.length - 1].index] = value;
        }
      } else {
        if(value === undefined) {
          return obj[keyArray[keyArray.length - 1].key];
        } else {
          obj[keyArray[keyArray.length - 1].key] = value;
        }
      }
    }

    function getSubObj(obj, keyInfo) {
      if (lang.isArray(obj[keyInfo.key])) {
        return obj[keyInfo.key][keyInfo.index];
      } else {
        return obj[keyInfo.key];
      }
    }

    function convertToKeyArray(str) {
      var arrayKey = [];
      str.split('_').forEach(function(str) {
        var deleteFlag = false;
        var pos;
        if (str.slice(str.length - 2) === "--") {//Builder will not export this kind of key.
          deleteFlag = true;
          str = str.slice(0, str.length - 2);
        }
        pos = str.search(/\[[0-9]+\]/);
        if (pos === -1) {
          (pos = str.length);
        }
        arrayKey.push({
          "key": str.slice(0, pos),
          "index": Number(str.slice(pos + 1, -1)),
          "deleteFlag": deleteFlag
        });
      });
      return arrayKey;
    }
  }



  // reset some field of config by template config.
  function getOrSetConfigByTemplateWithId(config, key, value) {
    //config: Object
    //  the destination config object
    //key: String
    //  the key value relative to the config object, like this: app_p1_p2[0], app_p1_p2[1]--;
    //  howover, if the key is a wiget element, the key like this: app_p1_p2[widgetId];
    //  does not set anything if the key is not valid.
    //value: String
    // value is undefined: get the value correspond to the key and return value.
    // value is not undefined: set the value of key.



    // section means widget or group
    var groupSearchStr  = "groups\\[.+\\]";
    var widgetSearchStr = "widgets\\[.+\\]";
    var sectionConfig = config;

    key = key.replace(/\//g, '_');
    var sectionKey    = key;

    // Do not merge fields that in the widget config,
    // beacuse widgetConfig has not been loaded before open
    // widget if the widget has not been edited yet.
    // Merge it when first open widget(In Widgetmanager.js).
    //
    // if(key.search("widgets\\[.+\\]_config") >= 0) {
    //   return;
    // }
    // does not neet to "return null", regarde widget_config_key as invalid key.

    // handle groups
    var groupInfo = getSectionObject(groupSearchStr);
    if (groupInfo.state === "deleted") {
      return;
    } else if (groupInfo.state === "isSection") {
      sectionConfig = groupInfo.object;
      sectionKey = groupInfo.key;
    }

    // handle widgets
    var widgetInfo = getSectionObject(widgetSearchStr);
    if (widgetInfo.state === "delete") {
      return;
    } else if (widgetInfo.state === "isSection") {
      sectionConfig = widgetInfo.object;
      sectionKey = widgetInfo.key;
    }

    return getOrSetConfigByTemplate(sectionConfig, sectionKey, value);

    function getSectionObject(sectionSearchStr) {
      var sectionRange = mo.template.getSearchRange(key, sectionSearchStr, "]");
      var sectionStr   = key.slice(sectionRange.firstPos, sectionRange.lastPos);// section[abcd]
      // It's section node.
      if (sectionRange.firstPos !== -1) {
        var sectionId = key.slice(sectionRange.firstPos + sectionStr.indexOf('[') + 1,
          sectionRange.lastPos - 1);
        var subKey   = key.slice(sectionRange.lastPos + 1);
        var sectionObject = mo.getConfigElementById(config, sectionId);
        if (sectionObject) {
          return {
            object: sectionObject,
            key:  "section_" + subKey,
            state: "isSection"
          };
        } else {
          // means the section had been deleted.
          return {
            state: "deleted"
          };
        }
      } else {
        //It is not a section node.
        return {
          state: "isNotSection"
        };
      }
    }
  }


  mo.template = {
    groupIdentification: "groups\\[.+\\]",

    widgetIdentification: "widgets\\[.+\\]",

    getSearchRange: function(srcStr, searchStr, lastString) {
      // return value:{
      //   firstPos:
      //   lastPos:
      //}
      // if firstPos === -1: does not find searchStr from srcStr
      var posResult = -1, regExp, pos1, pos2, tempStr;
      regExp = new RegExp(searchStr);
      pos1 = srcStr.search(regExp);
      if (pos1 >= 0 ) {
        tempStr = srcStr.slice(pos1, srcStr.length);
        pos2 = tempStr.indexOf(lastString);
        posResult = pos1 + pos2 + lastString.length;
      }
      return {
        firstPos: pos1,
        lastPos: posResult
      };
    },

    setConfigValue: function(config, key, value) {
      //config: Object
      //  the destination config object
      //key: String
      //  the key value relative to the config object, like this: app_p1_p2[0], app_p1_p2[1]--
      getOrSetConfigByTemplate(config, key, value);
    },

    getConfigValue: function(config, key) {
      //config: Object
      //  the destination config object
      //key: String
      //  the key value relative to the config object, like this: app_p1_p2[0], app_p1_p2[1]--
      // return value:
      //  return value of key of config.
      //  return 'undefined' if the key is invalid.
      return getOrSetConfigByTemplate(config, key);
    },

    setConfigValueWithId: function(config, key, value) {
      //config: Object
      //  the destination config object
      //key: String
      //  the key value relative to the config object, like this: app_p1_p2[0], app_p1_p2[1]--
      //  howover, if the key is a wiget element, the key like this: app_p1_p2[widgetId]
      getOrSetConfigByTemplateWithId(config, key, value);
    },

    getConfigValueWithId: function(config, key) {
      //config: Object
      //  the destination config object
      //key: String
      //  the key value relative to the config object, like this: app_p1_p2[0], app_p1_p2[1]--
      //  howover, if the key is a wiget element, the key like this: app_p1_p2[widgetId]
      // return value:
      //  return value of key of config.
      //  return 'undefined' if the key is invalid.
      return getOrSetConfigByTemplateWithId(config, key);
    },

    getKeyInfo: function(key){
      var widgetId = this.getWidgetIdByKey(key);
      if(widgetId !== null){
        return {
          type: 'widget',
          id: widgetId
        };
      }else{
        var groupId = this.getGroupIdByKey(key);
        if(groupId !== null){
          return {
            type: 'group',
            id: groupId
          };
        }else{
          return {
            type: 'unknow', //TODO
            id: null
          };
        }
      }
    },

    getWidgetIdByKey: function(key) {
      //key: String
      //  the key value relative to the config object, like this: app_p1_p2[0], app_p1_p2[1]--
      // id: if its a widget.
      // null: it is not a widget
      var widgetId;
      var widgetRange = mo.template.getSearchRange(key,
                                                   mo.template.widgetIdentification, "]");
      if(widgetRange.firstPos === -1) {
        widgetId = null;
      } else {
        // widget[widget_id]
        var widgetStr  = key.slice(widgetRange.firstPos, widgetRange.lastPos);
        widgetId = key.slice(widgetRange.firstPos + widgetStr.indexOf('[') + 1,
                                       widgetRange.lastPos - 1);
      }
      return widgetId;

    },

    getGroupIdByKey: function(key) {
      //key: String
      //  the key value relative to the config object, like this: app_p1_p2[0], app_p1_p2[1]--
      //return value:
      // id: if its a group.
      // null: it is not a group

      //TODO widget in group should be widget
      var groupId;
      var groupRange = mo.template.getSearchRange(key,
                                                   mo.template.groupIdentification, "]");
      if(groupRange.firstPos === -1) {
        groupId = null;
      } else {
        // group[group_id]
        var groupStr  = key.slice(groupRange.firstPos, groupRange.lastPos);
        groupId = key.slice(groupRange.firstPos + groupStr.indexOf('[') + 1,
                                       groupRange.lastPos - 1);
      }
      return groupId;
    },


    getConfigedWidgetsByTemplateConfig: function(templateConfig) {
      var widgetIds = [];
      var widgetConfigIdentification = mo.template.widgetIdentification + "_config";
      var widgetConfigRange;

      array.forEach(templateConfig.configurationSettings, function(category) {
        array.forEach(category.fields, function(field) {
          if(field.fieldName) {
            widgetConfigRange = mo.template.getSearchRange(field.fieldName,
                                            widgetConfigIdentification, "]");
            if(widgetConfigRange.firstPos >= 0) {
              // the widget has config property.
              pushWithoutRepeat(widgetIds, mo.template.getWidgetIdByKey(field.fieldName));
            }
          }
        }, this);
      }, this);

      return widgetIds;

      function pushWithoutRepeat(desArray, value) {
        if(desArray.indexOf(value) === -1) {
          desArray.push(value);
        }
      }
    },

    // getConfigedWidgetsByTemplateAppConfig: function(templateAppConfig) {
    //   // return value.
    //   //   widget IDs arrary that contain all widgets which have been configed.

    //   var widgetIds = [];
    //   var widgetConfigIdentification = mo.template.widgetIdentification + "_config";
    //   var widgetConfigRange;

    //   for (var key in templateAppConfig.values) {
    //     if(templateAppConfig.values.hasOwnProperty(key) &&
    //        (typeof templateAppConfig.values[key] !== 'function')) {
    //       widgetConfigRange = mo.template.getSearchRange(key,
    //                                       widgetConfigIdentification, "]");
    //       if(widgetConfigRange.firstPos >= 0) {
    //         // the widget has config property.
    //         pushWithoutRepeat(widgetIds, mo.template.getWidgetIdByKey(key));
    //       }
    //     }
    //   }

    //   return widgetIds;

    //   function pushWithoutRepeat(desArray, value) {
    //     if(desArray.indexOf(value) === -1) {
    //       desArray.push(value);
    //     }
    //   }
    // },

    mergeTemplateAppConfigToAppConfig: function(appConfig, templateAppConfig, webmapInfo){
      //webmapInfo != undefined means templateAppConfig is from AGOL,
      //use this webmap info in appConfig
      var i;
      var screenSectionConfig = appConfig.widgetOnScreen;
      var portalUrl = appConfig.portalUrl;

      //Both WAB template app and AGOL template app have webmap value
      if(templateAppConfig.values.webmap){
        //app created from mycontent has no webmap
        appConfig.map.itemId = templateAppConfig.values.webmap;
      }

      if(webmapInfo){
        // use default mapOptions of current webmap.
        if(appConfig.map.mapOptions){
          mo.deleteMapOptions(appConfig.map.mapOptions);
        }
        appConfig.map.portalUrl = portalUrl;

        if (!templateAppConfig.values.app_title) {
          templateAppConfig.values.app_title = webmapInfo.title;
        }
        if (!templateAppConfig.values.app_subtitle) {
          templateAppConfig.values.app_subtitle = webmapInfo.snippet;
        }
      }

      //merge values
      for (var key in templateAppConfig.values) {
        if (key !== "webmap") {
          mo.template.setConfigValueWithId(appConfig, key, templateAppConfig.values[key]);
        }
      }

      reorder();

      function reorder() {
        //reorderWidgets
        appConfig.widgetPool.widgets = reorderWidgets(appConfig.widgetPool.widgets);
        screenSectionConfig.widgets = reorderWidgets(screenSectionConfig.widgets);
        if (appConfig.widgetPool.groups) {
          for (i = 0; i < appConfig.widgetPool.groups.length; i++) {
            appConfig.widgetPool.groups[i].widgets =
            reorderWidgets(appConfig.widgetPool.groups[i].widgets);
          }
        }
        if (screenSectionConfig.groups) {
          for (i = 0; i < screenSectionConfig.groups.length; i++) {
            screenSectionConfig.groups[i].widgets =
            reorderWidgets(screenSectionConfig.groups[i].widgets);
          }
        }
      }

      function reorderWidgets(widgetArray) {
        var tempWidgets = [];
        array.forEach(widgetArray, function(widget) {
          if (widget) {
            tempWidgets.push(widget);
          }
        }, this);
        return tempWidgets;
      }

      return appConfig;
    }
  };

  //remove the options that are relative to map's display
  //this method should be called when map is changed.
  mo.deleteMapOptions = function(mapOptions){
    if(!mapOptions){
      return;
    }
    delete mapOptions.extent;
    delete mapOptions.lods;
    delete mapOptions.center;
    delete mapOptions.scale;
    delete mapOptions.zoom;
    delete mapOptions.maxScale;
    delete mapOptions.maxZoom;
    delete mapOptions.minScale;
    delete mapOptions.minZoom;
  };

  mo.localeIsSame = function(locale1, locale2){
    return locale1.split('-')[0] === locale2.split('-')[0];
  };

  mo.graphicsExtent = function(graphics, /* optional */ factor){
    var ext = null;
    try {
      if(graphics.length > 0){
        //if graphics.length === 1 and the graphic is a point, it will throw an Exception here
        ext = graphicsUtils.graphicsExtent(graphics);
        if (ext) {
          if(typeof factor === "number" && factor > 0){
            ext = ext.expand(factor);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return ext;
  };

  mo.sanitizeHTML = function(snippet){
    /* global html_sanitize */

    //https://code.google.com/p/google-caja/wiki/JsHtmlSanitizer
    return html_sanitize(snippet, function(url){
      return url;
    }, function(v){
      return v;
    });
  };

  mo.stripHTML = function (str){
    if (!str) {
      return str;
    }
    if (str.indexOf("<") > -1 && str.indexOf(">") > -1) {
      // this gets pretty slow if the string is long and has a < and no >
      var matchTag = /<(?:.|\s)*?>/g;
      return str.replace(matchTag, "");
    } else {
      return str;
    }
  };

  mo.removeSuffixSlashes = function(url){
    return url.replace(/\/*$/g, '');
  };

  mo.getBestDisplayAttributes = function(attributes, fieldInfos) {
    var displayAttributes = {};
    var displayValue = null;
    for (var fieldName in attributes) {
      displayValue = mo.getBestDisplayValue(fieldName, attributes, fieldInfos);
      displayAttributes[fieldName] = displayValue;
    }
    return displayAttributes;
  };

  mo.getBestDisplayValue = function(fieldName, attributes, fieldInfoOrFieldInfos) {
    var displayValue = "";
    var fieldInfo = null;
    if (lang.isArrayLike(fieldInfoOrFieldInfos)) {
      var fieldInfos = fieldInfoOrFieldInfos;
      fieldInfo = mo.getFieldInfoByFieldName(fieldInfos, fieldName);
    } else if (typeof fieldInfoOrFieldInfos === 'object') {
      if(fieldInfoOrFieldInfos.name === fieldName){
        fieldInfo = fieldInfoOrFieldInfos;
      }
    }

    if (fieldInfo) {
      displayValue = attributes[fieldName];
      if (fieldInfo.type === 'esriFieldTypeDate') {
        if (displayValue) {
          var date = new Date(parseInt(displayValue, 10));
          displayValue = mo._tryLocaleDate(date);
        }
      } else {
        if (typeof displayValue === 'number') {
          if (fieldInfo.domain && fieldInfo.domain.type === 'codedValue') {
            array.some(fieldInfo.domain.codedValues, function(codedValue) {
              if (codedValue.code === displayValue) {
                displayValue = codedValue.name;
                return true;
              }
            });
          } else {
            displayValue = mo._tryLocaleNumber(displayValue);
          }
        }
      }
    }

    if (displayValue === null || displayValue === undefined) {
      displayValue = "";
    }

    return displayValue;
  };

  mo._tryLocaleNumber = function(value) {
    var result = mo.localizeNumber(value);
    if (result === null || result === undefined) {
      result = value;
    }
    return result;
  };

  mo._tryLocaleDate = function(date) {
    var result = mo.localizeDate(date);
    if (!result) {
      result = date.toLocaleDateString();
    }
    return result;
  };

  mo.getFieldInfoByFieldName = function(fieldInfos, fieldName) {
    var fieldInfo = null;
    if (fieldInfos && fieldInfos.length > 0) {
      array.some(fieldInfos, lang.hitch(this, function(item) {
        if (item.name === fieldName) {
          fieldInfo = item;
          return true;
        } else {
          return false;
        }
      }));
    }
    return fieldInfo;
  };

  mo.containsNonLatinCharacter = function(string) {
    /*
    console.log(string);
    for (var k = 0; k < string.length; k++) {
      console.log(string.charCodeAt(k));
    }
    */
    for (var i = 0; i < string.length; i++) {
      if (string.charCodeAt(i) > 255) {
        return true;
      }
    }
    return false;
  };

  return mo;
});