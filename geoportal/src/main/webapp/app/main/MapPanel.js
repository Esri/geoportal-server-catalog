/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "app/common/Templated",
        "dojo/text!./templates/MapPanel.html",
        "dojo/i18n!../nls/resources",
        "dojo/sniff",
        "dojo/dom-style",
        "dojo/dom-geometry",
        "esri4/Map",
        "esri4/views/MapView",
        "esri4/layers/TileLayer",
        "esri4/layers/MapImageLayer",
        "esri4/widgets/Search",
        "esri4/widgets/LayerList",
        "esri4/widgets/FeatureTable",
        "esri4/widgets/Legend",
        "esri4/widgets/Locate",
        "esri4/Graphic"/*,
        "../gs/widget/SearchPane",
        "../gs/widget/WidgetContext"*/], 
function(declare, lang, Templated, template, i18n, has, domStyle, domGeometry,
		Map,MapView,TileLayer, MapImageLayer,SearchWidget,LayerList,FeatureTable,Legend,Locate,Graphic /*,SearchPane,WidgetContext*/) {

  var oThisClass = declare([Templated], {

    i18n: i18n,
    templateString: template,
    
    mapWasInitialized: false,
    
    postCreate: function() {
      this.inherited(arguments);
    },
    
    addToMap: function(params) {
      var mapWindow  = this.mapNode.contentWindow;
      if (mapWindow && typeof mapWindow.addToMapListener === "function") {
        mapWindow.addToMapListener(params);
      }
    },
  //Check Widget.js for opening map panel
    ensureMap: function(urlParams) {
		var mapProps = AppContext.appConfig.searchMap || {};
	    if (mapProps) mapProps = lang.clone(mapProps);
	    var v = mapProps.basemapUrl;
	    delete mapProps.basemapUrl;
	    if (typeof mapProps.basemap === "string" && mapProps.basemap.length > 0) {
	      v = null;
	    }
	    
	    var map = new Map({basemap:"streets"});
	    
		const view = new MapView({
	  	  container: this.mapNode,
	  	  map: map, 
	  	  center: mapProps.center,
	  	  zoom: mapProps.zoom      	  
	  	});
		this.view = view;
		
		 if (typeof v === "string" && v.length > 0) {
		        v =  util.checkMixedContent(v);
	        var basemap;
	        if (!mapProps.isTiled) {
	          basemap = new MapImageLayer(v);
	        } else {
	          basemap = new TileLayer(v);
	        }
	        map.add(basemap);
	      }
		      
	
	      this.view.when(lang.hitch(this,function() { 
	    	  const searchWidget = new SearchWidget({
	    		  view: this.view
	    		});
	    	  this.view.ui.add(searchWidget, {
	    		  position: "top-left",
	    		  index: 0
	    		}); 
	    	  const layerList = new LayerList({
	    		  view: view
	    		});
	    		// Adds widget below other elements in the top left corner of the view
	    		view.ui.add(layerList, {
	    		  position: "top-left"
	    		});
	    		
	    		let locateWidget = new Locate({
	    			  view: view,   // Attaches the Locate button to the view
	    			  graphic: new Graphic({
	    			    symbol: { type: "simple-marker" }  // overwrites the default symbol used for the
	    			    // graphic placed at the location of the user when found
	    			  })
	    			});
	    		view.ui.add(locateWidget, "top-left");
	    		
	    		let legend = new Legend({
	    			  view: view
	    		});

	    		view.ui.add(legend, "bottom-right");
	    	
	    	  
	     }))    	
    	
    	//Try this for Geoportal Search in expander (geoportal-search - widget.js
//        var localGeoportalUrl = this._createLocalCatalogUrl();
//        if (localGeoportalUrl) {
//          array.forEach(this.config.targets, function(target){
//            if (target.type === "geoportal" && !target.url) {
//              target.url = localGeoportalUrl;
//            }
//          });
//        }
//        var widgetContext = new WidgetContext({
//          i18n: i18n,
//          map: this.map,
//          proxyUrl: esriConfig.defaults.io.proxyUrl,
//          wabWidget: this,
//          widgetConfig: this.config
//        });
//        var searchPane = new SearchPane({
//          i18n: widgetContext.i18n,
//          widgetContext: widgetContext
//        },this.widgetNode);
//        searchPane.startup();
    	
    	
//    	var url = "./viewer/index.html"; // TODO config this?
//      if (!this.mapWasInitialized) {
//        this.mapWasInitialized = true;
//        if (urlParams) {
//          var sProp = null, oProp = null, props = urlParams;
//          for (sProp in props) {
//            if (props.hasOwnProperty(sProp)) {
//              oProp = props[sProp];
//              if (typeof oProp !== "undefined" && oProp !== null) {
//                if (url.indexOf("?") === -1) url += "?";
//                else url += "&";
//                url += sProp+"="+encodeURIComponent(oProp);
//              }
//            }
//          }
//        }
//        //console.warn("viewerUrl",url);
//        this.mapFrameNode.src = url;
//      }
    }

  });

  return oThisClass;
});