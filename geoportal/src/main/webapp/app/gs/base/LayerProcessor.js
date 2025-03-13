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
  "dojo/i18n!../widget/nls/strings",  
  "esri4/request",
  "esri4/layers/MapImageLayer",
  "esri4/layers/ImageryLayer",
  "esri4/layers/TileLayer",
  "esri4/layers/CSVLayer",
  "esri4/layers/FeatureLayer",
  "esri4/layers/GeoRSSLayer",
  "esri4/layers/KMLLayer",
  "esri4/layers/StreamLayer",
  "esri4/layers/VectorTileLayer",
  "esri4/layers/WFSLayer",
  "esri4/layers/WMSLayer",
  "esri4/layers/WMTSLayer",
 // "esri4/layers/WMTSLayerInfo",
  "esri4/PopupTemplate",
  "esri4/core/reactiveUtils",
  "../widget/util",
  "../widget/layers/layerUtil"],
function(declare, lang, array, Deferred, all, i18n, esriRequest,
		MapImageLayer, ImageryLayer, TileLayer, CSVLayer, 
  FeatureLayer, GeoRSSLayer, KMLLayer, StreamLayer, VectorTileLayer, WFSLayer, WMSLayer, WMTSLayer, 
  /*WMTSLayerInfo,*/ PopupTemplate,reactiveUtils,util,layerUtil){
  
  return declare(null, {
    
    constructor: function(args) {
      lang.mixin(this,args);
    },
  
    addLayer: function(view,type,url) {
      //console.warn("esri.version",esri.version);
      //console.warn("view.extent",view.extent);
      var dfd = new Deferred();
      if (typeof type !== "string" || type.length === 0 ||
          typeof url !== "string" || url.length === 0) {
        dfd.reject("Unsupported");
        return dfd;
      }
      
      url = util.checkMixedContent(url);
      var lc = url.toLowerCase();
      var lct = type.toLowerCase();
      var id = util.generateId();
      var self = this, layer = null;
      
      if (lct === "arcgis" || lct === "mapserver" || lct === "featureserver" || lct === "imageserver" || 
        lct === "streamserver" || lct === "vectortileserver") {
        type = "ArcGIS";
      }
      
      if (type === "ArcGIS") {
        if (lc.indexOf("/featureserver") > 0 || lc.indexOf("/mapserver") > 0) {   
          util.readRestInfo(url).then(function(info){
            //console.warn("restInfo",info);
            if (info && typeof info.type === "string" && info.type === "Feature Layer") {
              layer = new FeatureLayer(url,{id:id,outFields:["*"]});
              self.waitThenAdd(dfd,map,type,layer);
            } else {
              
              if (lc.indexOf("/featureserver") > 0) {
                var dfds = [];
                array.forEach(info.data.layers,function(li){
                  var lid = util.generateId();
                  var lyr = new FeatureLayer(url+"/"+li.id,{id:lid,outFields:["*"]});
                  lyr.load();
                  dfds.push(self.waitForLayer(lyr));
                });
                all(dfds).then(function(results){
                  var lyrs = [];
                  array.forEach(results,function(lyr){lyrs.push(lyr);});
                  lyrs.reverse();
                  array.forEach(lyrs,function(lyr){
                    self.setPopupTemplate(lyr);
                    view.map.add(lyr);
                  });
                  dfd.resolve(lyrs);
                }).catch(function(error){
                  dfd.reject(error);
                });
  
              } else if (lc.indexOf("/mapserver") > 0) {
                if (info.tileInfo) {
                  layer = new TileLayer(url,{id:id});
                } else {
                  layer = new MapImageLayer(url,{id:id});
                }
                layer.load();
                self.waitThenAdd(dfd,view,type,layer);
              } 
            }
          }).catch(function(error){
            dfd.reject(error);
          });
          
        } else if (lc.indexOf("/imageserver") > 0) { 
          layer = new ImageryLayer(url,{id:id});
          layer.load();
          this.waitThenAdd(dfd,view,type,layer);
          
        } else if (lc.indexOf("/vectortileserver") > 0 || 
            lc.indexOf("/resources/styles/root.json") > 0) { 
          if (!VectorTileLayer.supported()) {
            dfd.reject("Unsupported");
          } else {
            this.checkVectorTileUrl(url,null,{}).then(function(vturl){
              layer = new VectorTileLayer(vturl,{id:id});
              layer.load();
              self.waitThenAdd(dfd,view,type,layer);
            }).catch(function(error){
              dfd.reject(error);
            });
          }
        } else if (lc.indexOf("/streamserver") > 0) {
          layer = new StreamLayer(url, {
            id: id,
            purgeOptions: {displayCount: 10000}
          });
          layer.load();
          this.waitThenAdd(dfd,view,type,layer);
  
        } else {
          dfd.reject("Unsupported");
        }
      } else if (type === "WMS") {
        layer = new WMSLayer(url,{id:id});
        layer.load();
        this.waitThenAdd(dfd,view,type,layer);
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
        layer.load();
        this.waitThenAdd(dfd,view,type,layer);
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
          "PopupTemplate": new PopupTemplate()
        };
        */
        var options = {id:id,url:url,};
        layer = new WFSLayer(options);
        layer.load();
        this.waitThenAdd(dfd,view,type,layer);
      } else if (type === "KML") {
        layer = new KMLLayer(url,{id:id});
        layer.load();
        this.waitThenAdd(dfd,view,type,layer);
      } else if (type === "GeoRSS") {
        layer = new GeoRSSLayer(url,{id:id});
        layer.load();
        this.waitThenAdd(dfd,view,type,layer);
      } else if (type === "CSV") {
        layer = new CSVLayer(url,{id:id});
        layer.load();
        this.waitThenAdd(dfd,view,type,layer);
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
        }).catch(function(){
          params.url = url+"/resources/styles/root.json";
          esriRequest(params,{}).then(function(){
            operationalLayer.styleUrl = params.url;
            dfd.resolve(params.url);
          }).catch(function(){
            operationalLayer.url = url;
            dfd.resolve(url);
          });
        });
      } else {
        params.url = url+"/resources/styles/root.json";
        esriRequest(params,{}).then(function(){
          operationalLayer.styleUrl = params.url;
          dfd.resolve(params.url);
        }).catch(function(){
          operationalLayer.url = url;
          dfd.resolve(url);
        });
      }
      return dfd;
    },
    
    newPopupTemplate: function(layer) {
      var popupInfo = layerUtil.newPopupInfo(layer,(layer.title? layer.title: layer.name));
      var popupTemplate = layerUtil.newPopupTemplate(popupInfo);
     
      return popupTemplate;
    },
    
    setPopupTemplate: function(layer) {
      var self = this, dcl = "";
      if (layer && typeof layer.declaredClass === "string") {
        dcl = layer.declaredClass;
      }
      if (dcl === "esri.layers.FeatureLayer") {
        layer.popupTemplate = this.newPopupTemplate(layer);
      } else if (dcl === "esri.layers.CSVLayer") {
        layer.popupTemplate = this.newPopupTemplate(layer);
      } else if (dcl === "esri.layers.StreamLayer") {
        layer.popupTemplate = this.newPopupTemplate(layer);
      } else if (dcl === "esri.layers.WFSLayer") {
        layer.popupTemplate = this.newPopupTemplate(layer);
      } else if (dcl === "esri.layers.MapImageLayer" ||
          dcl === "esri.layers.TileLayer") {
    	  layerUtil.setMapServicePopupTemplate(layer);
      }else if (dcl === "esri.layers.WMSLayer") {
    	  layer.popupTemplate = this.newPopupTemplate(layer);
      }
      
    },
    
    setWMSVisibleLayers: function(layer) {
      var maxLayers = 10, wmsSublyrCollection = [];
      if (layer) {
        array.some(layer.allSublayers._items,function(wmsSublayer){          
          if (typeof wmsSublayer.title === "string" && wmsSublayer.title.length > 0) {
            if (wmsSublyrCollection.length < maxLayers) {            	
            	wmsSublayer.visible = true;
            	wmsSublayer.popupEnabled = true;
            	wmsSublyrCollection.push(wmsSublayer);            	
            } else {
              return true;
            }
          }
        });
        layer.sublayers = wmsSublyrCollection;        
      }
    },
    
    waitForLayer: function(layer) {
    	 var dfd = new Deferred();
         var handles = [];
         if (layer.loaded) {
           dfd.resolve(layer);
           return dfd;
         }
         if (layer.loadStatus ==="failed") {
           dfd.reject(layer.loadError);
           return dfd;
         }
         var clearHandles = function() {
           array.forEach(handles, function(h) {
             h.remove();
           });
         };
         
         handles.push(reactiveUtils.when(() => layer.loaded === true, () => {        	
         	clearHandles();
             dfd.resolve(layer);
             }));
           
    
         handles.push(reactiveUtils.when(() => layer.loadStatus ==="failed", () =>{        
           clearHandles();
           var error = layer.loadError;
           try {           
               console.warn("layerAccessError", error);
               dfd.reject(new Error(i18n.search.layerInaccessible));           
           } catch (ex) {
             //console.warn("layerAccessError",ex);
             dfd.reject(error);
           }
         }));
         return dfd;
    },
    
    waitThenAdd: function(dfd,view,type,layer) {      
      var self = this;
      this.waitForLayer(layer).then(function(lyr){
       
        var templates = null;
        if (type === "WMS") {
          self.setWMSVisibleLayers(lyr);
        }
        self.setPopupTemplate(lyr);
        view.map.add(layer);
        dfd.resolve(lyr);
      }).catch(function(error){
        //console.warn("waitThenAdd.error",error);
        dfd.reject(error);
      });
    }
    
  });
  
});