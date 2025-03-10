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
        "dojo/i18n!../gs/widget/nls/strings",
        "dojo/sniff",
        "dojo/dom-style",
        "dojo/dom-geometry",
        "dojo/dom-construct",
        "dojo/_base/array",
        "dojo/Deferred",
        "esri4/Map",
        "esri4/views/MapView",
        "esri4/layers/TileLayer",
        "esri4/layers/MapImageLayer",
        "esri4/layers/FeatureLayer",
        "esri4/widgets/Search",
        "esri4/widgets/LayerList",
        "esri4/widgets/FeatureTable",
        "esri4/widgets/Legend",
        "esri4/widgets/Locate",
        "esri4/widgets/Home",  
        "esri4/form/elements/inputs/SwitchInput",
        "esri4/Graphic",
        "esri4/widgets/Expand",
        "esri4/core/reactiveUtils",
        "esri4/widgets/FeatureTable/Grid/support/ButtonMenuItem",
        "esri4/widgets/FeatureTable/Grid/support/ButtonMenu",
        "../gs/widget/SearchPane",
        "../gs/widget/WidgetContext",
        "../gs/base/LayerProcessor"], 
function(declare, lang, Templated, template, i18n, has, domStyle, 
		domGeometry,domConstruct,array,Deferred,
		Map,MapView,TileLayer, MapImageLayer,FeatureLayer,SearchWidget,LayerList,FeatureTable,
		Legend,Locate,Home,SwitchInput,Graphic,Expand,reactiveUtils,ButtonMenuItem,ButtonMenu,
		SearchPane,WidgetContext,LayerProcessor) {

  var oThisClass = declare([Templated], {

    i18n: i18n,
    templateString: template,
    
    mapWasInitialized: false,
    
    postCreate: function() {
      this.inherited(arguments);
      this.readConfig();
    },
    
    readConfig:function()
    {
    	dfd = new Deferred();
        fetch('app/gs/config/geoportal-search.json')
        .then(response => response.json())
        .then(data => {       
          this.config = data;
          dfd.resolve();
        })
        .catch(error => {
          // Handle errors
          console.error('Error not able to load config:', error);
        });
        return dfd;
    },
    
    addToMap: function(params) {
    	//TODO look at AddToMap Widget.js and LayerProcessor.js
    	this.addLayer(params,this.view);
    },
  //Opening map panel
    ensureMap: function(urlParams) {
    	this.urlParams = urlParams;
    	if(!this.config)
    	{
    		this.readConfig().then(()=>{
    			this.loadMapPanel();
    		})
    		.catch(error => {
    	          // Handle errors
    	          console.error('Map panel could not be loaded.', error);
    	    });;
    	}
    	else
    	{
    		this.loadMapPanel();
    	}
    },
    loadMapPanel:function(){
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
      view.when(lang.hitch(this,function() {  
    	  var localGeoportalUrl = this._createLocalCatalogUrl();
	   	   if (localGeoportalUrl) {
			   var target;
			   for(var i=0;i<this.config.targets.length;i++)
			   {
				   target = this.config.targets[i];		   
				   if (target.type === "geoportal" && !target.url) {
				         this.config.targets[i].url = localGeoportalUrl;
				         break;
				   }
			   }
	   	   }
    	//Add geoportal search widget
  		var widgetContext = new WidgetContext({
              i18n: i18n,
              view: view,
              proxyUrl: esriConfig.defaults.io.proxyUrl,
              wabWidget: this,
              widgetConfig: this.config
            });
	  		let node = domConstruct.create("div",{
	  			width: "500px",
	  			height: "500px"
	  		});
            var gpSearchWidget = new SearchPane({
              i18n: widgetContext.i18n,
              widgetContext: widgetContext
            },node);
            gpSearchWidget.startup();
            
            let gpSearchExpand = new Expand({
   	    	 expandIcon: "query",  
   	    	 expandTooltip: "Geoportal Search", 
   	    	 view: view,
   	    	 content: gpSearchWidget
      	     });
      	     view.ui.add(gpSearchExpand, {
    		  position: "top-left",
    		  index: 0
    		});
      	   let searchWidget = new SearchWidget({
    		  view: this.view
    		});

    	  let searchWidgetExpand = new Expand({
    	    	 expandIcon: "search",  
    	    	 expandTooltip: "Find Address or Place", 
    	    	 view: view,
    	    	 content: searchWidget
       	     });
       	     view.ui.add(searchWidgetExpand, {
    		  position: "top-left",
    		  index: 1
    		});
    	  
    	  let layerList = new LayerList({
    		  view: view
    		});
    		let layerListExpand = new Expand({
   	    	 expandIcon: "layers",  
   	    	 expandTooltip: "Map Layers", 
   	    	 view: view,
   	    	 content: layerList
      	     });
      	     view.ui.add(layerListExpand, {
    		  position: "top-left",
    		  index: 2
    		});
    		
//    		let locateWidget = new Locate({
//    			  view: view,   // Attaches the Locate button to the view
//    			  graphic: new Graphic({
//    			    symbol: { type: "simple-marker" }  // overwrites the default symbol used for the
//    			    // graphic placed at the location of the user when found
//    			  })
//    			});
//    		view.ui.add(locateWidget, {
//    		  position: "top-left",
//    		  index: 4
//    		});
    		
    		let homeWidget = new Home({
    			  view: view
    			});

			// adds the home widget to the top left corner of the MapView
			view.ui.add(homeWidget, {
	    		  position: "top-left",
	    		  index: 4
	    		});   	     	
   	     	
    		let legend = new Legend({
    			  view: view
    		}); 
    		let legendExpand = new Expand({
    	    	 expandIcon: "legend",  
    	    	 expandTooltip: "Legend", 
    	    	 view: view,
    	    	 content: legend
       	     });
       	     view.ui.add(legendExpand, {
    		  position: "top-left",
    		  index: 3
    		});
	     
	     reactiveUtils.on(()=>view.popup, "trigger-action", (event)=>{	    	 
	    	  if(event.action.id === "view-attribute-table"){	    	   
	    		  this.openAttrTable(view.popup.selectedFeature);
	    	  }
	    	});
	     reactiveUtils.watch(
             () => view.popup.viewModel?.active,
             () => {
               selectedFeature = view.popup.selectedFeature;
               if (selectedFeature !== null && view.popup.visible !== false) {
            	   if(this.featureTable)
            		   {
            		   this.featureTable.highlightIds.removeAll();
            		   this.featureTable.highlightIds.add(view.popup.selectedFeature.attributes.OBJECTID);
  	                 	
            		   }
                 
               }
             }
	      );
	     this.view = view;
      }));  

   
      if (!this.mapWasInitialized) {
        this.mapWasInitialized = true;
        if (this.urlParams) {
        	this.addLayer(this.urlParams,view);
        }
      }
    },

    openAttrTable:function(selectedFeature)
    {   
    	console.log("selected feature "+selectedFeature.attributes.OBJECTID);
    	let id = selectedFeature.attributes.OBJECTID;
    	//Below can be used to show only selected record
//    	var featureLayer = new FeatureLayer({url:selectedFeature.sourceLayer.url,
//    			definitionExpression: "OBJECTID = "+id});
    	var featureLayer = new FeatureLayer(selectedFeature.sourceLayer.url);
    	var tableContainer = document.getElementById("tableContainer");
    	
    	if(this.featureTable)
    		{
    			try{
    				this.featureTable.destroy();
    			}catch(error)
    			{
    				console.error(error);
    			}
    			tableContainer.innerHTML = "";
    		}
    	var container = document.createElement("div");
    	
    	tableContainer.appendChild(container);    	
    	
		let table = this.featureTable = new FeatureTable({
   		  returnGeometryEnabled: true,
   		  view: this.view,
   		  layer: featureLayer,
   		  container: container,
   		  visible:true,
   		  columnReorderingEnabled:true, 		  
 		  highlightEnabled:true,
 		  highlightIds:[id],
   		  visibleElements: {
            // Autocast to VisibleElements
            menuItems: {
              clearSelection: true,
              refreshData: true,
              toggleColumns: true,
              selectedRecordsShowAllToggle: true
            }},
   		  menuConfig:{
			  items:[
				  { 	
					  label: "Close",   					 
					  icon: "x-circle",
					  clickFunction: ()=> {
						  this.featureTable.visible =false;                     
					  }
				  }
			  ]
   		  }
   		});    	
    },
    _createLocalCatalogUrl: function() {    
        if (window && window.top && window.top.geoportalServiceInfo) {
          var loc = window.top.location;
          var gpt = window.top.geoportalServiceInfo;
          return loc.protocol + "//" + loc.host + loc.pathname + "elastic/" + gpt.metadataIndexName + "/_search";
        }
        return null;
      },
      
      addLayer: function(params,view){
          // console.warn("AddToMap.addLayer...",type,url);     
    	  var url = params.url;
    	  var type = params.type;    	  
          var dfd = new Deferred();
        
          var processor = new LayerProcessor();
          processor.addLayer(view,type,url).then(function(result){
            if (result) {
              dfd.resolve(result);
            } else {
              dfd.reject("Failed");
              console.warn("AddToMap failed for",url);
              popupMsg();
            }
          }).catch(function(error){
            dfd.reject(error);
            if (typeof error === "string" && error === "Unsupported") {
              console.warn("AddToMap: Unsupported type",type,url);
            } else {
              console.warn("AddToMap failed for",url);
              console.warn(error);
            }
           alert("Add to Map failed");
          }); 
          return dfd;
        }
  });

  return oThisClass;
});