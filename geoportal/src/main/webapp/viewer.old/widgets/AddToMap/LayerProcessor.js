///////////////////////////////////////////////////////////////////////////
// Copyright © 2016 Esri. All Rights Reserved.
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
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/array",
  "dojo/Deferred",
  "dojo/promise/all",
  "dojo/i18n!./nls/strings",
  "./util",
  "esri/request",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/layers/ArcGISImageServiceLayer",
  "esri/layers/ArcGISTiledMapServiceLayer",
  "esri/layers/CSVLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/GeoRSSLayer",
  "esri/layers/KMLLayer",
  "esri/layers/StreamLayer",
  "esri/layers/VectorTileLayer",
  "esri/layers/WFSLayer",
  "esri/layers/WMSLayer",
  "esri/layers/WMTSLayer",
  "esri/layers/WMTSLayerInfo",
  "esri/InfoTemplate"],
function(declare, lang, array, Deferred, all, i18n, util, esriRequest,
  ArcGISDynamicMapServiceLayer, ArcGISImageServiceLayer, ArcGISTiledMapServiceLayer, CSVLayer, 
  FeatureLayer, GeoRSSLayer, KMLLayer, StreamLayer, VectorTileLayer, WFSLayer, WMSLayer, WMTSLayer, 
  WMTSLayerInfo, InfoTemplate){
  
  return declare(null, {
    
    constructor: function(args) {
      lang.mixin(this,args);
    },
  
    addLayer: function(map,type,url) {
      //console.warn("esri.version",esri.version);
      //console.warn("map.extent",map.extent);
      var dfd = new Deferred();
      if (typeof type !== "string" || type.length === 0 ||
          typeof url !== "string" || url.length === 0) {
        dfd.reject("Unsupported");
        return dfd;
      }
      
      url = util.checkMixedContent(url);
      var lc = url.toLowerCase();
      var lct = type.toLowerCase();
      var id = util.generateRandomId();
      var self = this, layer = null;
      
      if (lct === "arcgis" || lct === "mapserver" || lct === "featureserver" || lct === "imageserver" || 
        lct === "streamserver" || lct === "vectortileserver") {
        type = "ArcGIS";
      }
      
      if (type === "ArcGIS") {
        if (lc.indexOf("/featureserver") > 0 || lc.indexOf("/mapserver") > 0) {   
          this.readRestInfo(url).then(function(info){
            //console.warn("restInfo",info);
            if (info && typeof info.type === "string" && info.type === "Feature Layer") {
              layer = new FeatureLayer(url,{id:id,outFields:["*"]});
              self.waitThenAdd(dfd,map,type,layer);
            } else {
              
              if (lc.indexOf("/featureserver") > 0) {
                var dfds = [];
                array.forEach(info.layers,function(li){
                  var lid = util.generateRandomId();
                  var lyr = new FeatureLayer(url+"/"+li.id,{id:lid,outFields:["*"]});
                  dfds.push(self.waitForLayer(lyr));
                });
                all(dfds).then(function(results){
                  var lyrs = [];
                  array.forEach(results,function(lyr){lyrs.push(lyr);});
                  lyrs.reverse();
                  array.forEach(lyrs,function(lyr){
                    self.setInfoTemplate(lyr);
                    map.addLayer(lyr);
                  });
                  dfd.resolve(lyrs);
                }).otherwise(function(error){
                  dfd.reject(error);
                });
  
              } else if (lc.indexOf("/mapserver") > 0) {
                if (info.tileInfo) {
                  layer = new ArcGISTiledMapServiceLayer(url,{id:id});
                } else {
                  layer = new ArcGISDynamicMapServiceLayer(url,{id:id});
                }
                self.waitThenAdd(dfd,map,type,layer);
              } 
            }
          }).otherwise(function(error){
            dfd.reject(error);
          });
          
        } else if (lc.indexOf("/imageserver") > 0) { 
          layer = new ArcGISImageServiceLayer(url,{id:id});
          this.waitThenAdd(dfd,map,type,layer);
          
        } else if (lc.indexOf("/vectortileserver") > 0 || 
            lc.indexOf("/resources/styles/root.json") > 0) { 
          if (!VectorTileLayer.supported()) {
            dfd.reject("Unsupported");
          } else {
            this.checkVectorTileUrl(url,null,{}).then(function(vturl){
              layer = new VectorTileLayer(vturl,{id:id});
              self.waitThenAdd(dfd,map,type,layer);
            }).otherwise(function(error){
              dfd.reject(error);
            });
          }
        } else if (lc.indexOf("/streamserver") > 0) {
          layer = new StreamLayer(url, {
            id: id,
            purgeOptions: {displayCount: 10000}
          });
          this.waitThenAdd(dfd,map,type,layer);
  
        } else {
          dfd.reject("Unsupported");
        }
      } else if (type === "WMS") {
        layer = new WMSLayer(url,{id:id});
        this.waitThenAdd(dfd,map,type,layer);
      } else if (type === "WMTS") {
        /*
        var layerInfo = new WMTSLayerInfo({
          identifier: "opengeo:countries",
          tileMatrixSet: "EPSG:4326",
          format: "png"
        });
        var options = {
          serviceMode: "KVP",
          layerInfo: layerInfo
        };
        url = url.substring(0,url.indexOf("?"));
        url = "http://v2.suite.opengeo.org/geoserver/gwc/service/wmts";
        */
        layer = new WMTSLayer(url,{id:id});
        this.waitThenAdd(dfd,map,type,layer);
      } else if (type === "WFS") {
        /*
        var options = {
          "id": id,
          "url": "http://suite.opengeo.org/geoserver/wfs",
          "version": "1.1.0",
          "nsLayerName": "http://medford.opengeo.org|citylimits",
          "wkid": 3857,
          "mode": "SNAPSHOT",
          "maxFeatures": 100,
          "showDetails": true,
          "infoTemplate": new InfoTemplate()
        };
        */
        var options = {id:id,url:url,};
        layer = new WFSLayer(options);
        this.waitThenAdd(dfd,map,type,layer);
      } else if (type === "KML") {
        layer = new KMLLayer(url,{id:id});
        this.waitThenAdd(dfd,map,type,layer);
      } else if (type === "GeoRSS") {
        layer = new GeoRSSLayer(url,{id:id});
        this.waitThenAdd(dfd,map,type,layer);
      } else if (type === "CSV") {
        layer = new CSVLayer(url,{id:id});
        this.waitThenAdd(dfd,map,type,layer);
      } else {
        dfd.reject("Unsupported");
      }
      return dfd;
    },
    
    checkVectorTileUrl: function(url,itemUrl,operationalLayer) {
      var dfd = new Deferred();
      var endsWith = function(sv,sfx) {
        return (sv.indexOf(sfx,(sv.length - sfx.length)) !== -1);
      };
      if (endsWith(url,".json")) {
        operationalLayer.styleUrl = url;
        dfd.resolve(url);
        return dfd;
      } 
      var params = {url:null,content:{},handleAs:"json",callbackParamName:"callback"};
      if (itemUrl) {
        params.url = this.itemUrl+"/resources/styles/root.json";
        esriRequest(params,{}).then(function(){
          operationalLayer.styleUrl = params.url;
          dfd.resolve(params.url);
        }).otherwise(function(){
          params.url = url+"/resources/styles/root.json";
          esriRequest(params,{}).then(function(){
            operationalLayer.styleUrl = params.url;
            dfd.resolve(params.url);
          }).otherwise(function(){
            operationalLayer.url = url;
            dfd.resolve(url);
          });
        });
      } else {
        params.url = url+"/resources/styles/root.json";
        esriRequest(params,{}).then(function(){
          operationalLayer.styleUrl = params.url;
          dfd.resolve(params.url);
        }).otherwise(function(){
          operationalLayer.url = url;
          dfd.resolve(url);
        });
      }
      return dfd;
    },
    
    readRestInfo: function(url) {
      return esriRequest({url:url,content:{f:"json"},handleAs:"json",
        callbackParamName:"callback"},{});
    },
    
    newInfoTemplate: function(layer) {
      /*
      var popupInfo = loader._newPopupInfo(lyr);
      if (popupInfo) {
        loader._setFeatureLayerInfoTemplate(lyr,popupInfo,null);
      }
      */
      var infoTemplate = new InfoTemplate();
      if (layer) {
        infoTemplate.title = layer.name;
      }
      return infoTemplate;
    },
    
    setInfoTemplate: function(layer) {
      var self = this, dcl = "";
      if (layer && typeof layer.declaredClass === "string") {
        dcl = layer.declaredClass;
      }
      if (dcl === "esri.layers.FeatureLayer") {
        layer.infoTemplate = this.newInfoTemplate(layer);
      } else if (dcl === "esri.layers.CSVLayer") {
        layer.infoTemplate = this.newInfoTemplate(layer);
      } else if (dcl === "esri.layers.StreamLayer") {
        layer.infoTemplate = this.newInfoTemplate(layer);
      } else if (dcl === "esri.layers.WFSLayer") {
        layer.infoTemplate = this.newInfoTemplate(layer);
      } else if (dcl === "esri.layers.ArcGISDynamicMapServiceLayer" ||
          dcl === "esri.layers.ArcGISTiledMapServiceLayer") {
        var templates = null;
        array.forEach(layer.layerInfos,function(lInfo){
          //console.warn("lInfo",lInfo);
          if (templates === null) templates = {};
          var tmpl = self.newInfoTemplate();
          tmpl.title = lInfo.name;
          templates[lInfo.id] = {infoTemplate: tmpl};
        });
        if (templates) layer.infoTemplates = templates;
      }
    },
    
    setWMSVisibleLayers: function(layer) {
      var maxLayers = 10, lyrNames = [];
      if (layer) {
        array.some(layer.layerInfos,function(lyrInfo){
          //console.warn("lyrInfo",lyrInfo);
          if (typeof lyrInfo.name === "string" && lyrInfo.name.length > 0) {
            if (lyrNames.length < maxLayers) {
              lyrNames.push(lyrInfo.name);
            } else {
              return true;
            }
          }
        });
        //console.warn("lyrNames",lyrNames);
        if (lyrNames.length <= maxLayers) {
          layer.setVisibleLayers(lyrNames);
        }
      }
    },
    
    waitForLayer: function(layer) {
      var dfd = new Deferred(), handles = [];
      if (layer.loaded) {
        dfd.resolve(layer);
        return dfd;
      }
      if (layer.loadError) {
        dfd.reject(layer.loadError);
        return dfd;
      }
      var clearHandles = function() {
        array.forEach(handles,function(h){h.remove();});
      };
      handles.push(layer.on("load",function(layerLoaded){
        clearHandles();
        dfd.resolve(layerLoaded.layer);
      }));
      handles.push(layer.on("error",function(layerError){
        clearHandles();
        var error = layerError.error;
        try {
          if (error.message && (error.message.indexOf("Unable to complete") !== -1)) {
            dfd.reject(new Error(i18n.layerInaccessible));
          } else {
            dfd.reject(error);
          }
        } catch (ex) {
          dfd.reject(error);
        }
      }));
      return dfd;
    },
    
    waitThenAdd: function(dfd,map,type,layer) {
      //console.warn("waitThenAdd",type,layer);
      var self = this;
      this.waitForLayer(layer).then(function(lyr){
        //console.warn("waitThenAdd.ok",type,lyr);
        var templates = null;
        if (type === "WMS") {
          self.setWMSVisibleLayers(lyr);
        }
        self.setInfoTemplate(lyr);
        map.addLayer(lyr);
        dfd.resolve(lyr);
      }).otherwise(function(error){
        //console.warn("waitThenAdd.error",error);
        dfd.reject(error);
      });
    }
    
  });
  
});