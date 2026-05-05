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
		"dojo/i18n!../nls/resources",
        "dojo/sniff",
        "dojo/dom-style",
        "dojo/dom-geometry",
        "dojo/dom-construct",
        "dojo/_base/array",
        "dojo/Deferred",
        "esri4/Map",
        "esri4/views/MapView",
		"esri4/views/SceneView",
        "esri4/layers/TileLayer",
        "esri4/layers/MapImageLayer",
        "esri4/layers/FeatureLayer",
        "esri4/layers/WFSLayer",
        "esri4/widgets/Search",
        "esri4/widgets/LayerList",
        "esri4/widgets/FeatureTable",
        "esri4/widgets/Legend",
        "esri4/widgets/Locate",
        "esri4/widgets/Home",  
        "esri4/form/elements/inputs/SwitchInput",
        "esri4/Graphic",
        "esri4/widgets/Expand",
        "esri4/widgets/BasemapGallery",
        "esri4/core/reactiveUtils",
        "esri4/widgets/FeatureTable/Grid/support/ButtonMenuItem",
        "esri4/widgets/FeatureTable/Grid/support/ButtonMenu",
        "../gs/widget/SearchPane",
        "../gs/widget/WidgetContext",
        "../gs/base/LayerProcessor",
        "app/context/AppClient"], 
function(declare, lang, Templated, template, i18n,i18resources, has, domStyle, 
		domGeometry,domConstruct,array,Deferred,
		Map,MapView,SceneView,TileLayer, MapImageLayer,FeatureLayer,WFSLayer,SearchWidget,LayerList,FeatureTable,
		Legend,Locate,Home,SwitchInput,Graphic,Expand,BasemapGallery,reactiveUtils,ButtonMenuItem,ButtonMenu,
		SearchPane,WidgetContext,LayerProcessor,AppClient) {

  var oThisClass = declare([Templated], {

    i18n: i18n,
	i18resources: i18resources,	
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
    	this.addLayer(params,this.mapView,this.sceneView);
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
	    var map = new Map({basemap:mapProps.basemap});
		var map3D = new Map({basemap:mapProps.threeDBasemap, ground:"world-elevation"});
	    
		const mapView = new MapView({
	  	  container: this.mapNode,
	  	  map: map, 
	  	  center: mapProps.center,
	  	  zoom: mapProps.zoom      	  
	  	});
		
		const sceneView = new SceneView({
		        container: null,
		        map: map3D,
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
      mapView.when(lang.hitch(this,function() {  
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
              view: mapView,
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
   	    	 view: mapView,
   	    	 content: gpSearchWidget
      	     });
      	     mapView.ui.add(gpSearchExpand, {
    		  position: "top-left",
    		  index: 0
    		});
			
		    let gpSearchWidgetScene = new SearchPane({
                i18n: widgetContext.i18n,
                widgetContext: widgetContext
                },node.cloneNode());
                gpSearchWidgetScene.startup();
                
                let gpSearchExpandScene = new Expand({
        	    	 expandIcon: "query",  
        	    	 expandTooltip: "Geoportal Search", 
        	    	 view: sceneView,
        	    	 content: gpSearchWidgetScene
            	     });
		sceneView.ui.add(gpSearchExpandScene, {
		    		  position: "top-left",
		    		  index: 0
		    		});
			
      	   let searchWidget = new SearchWidget({
    		  view: mapView
    		});

    	  let searchWidgetExpand = new Expand({
    	    	 expandIcon: "search",  
    	    	 expandTooltip: "Find Address or Place", 
    	    	 view: mapView,
    	    	 content: searchWidget
       	     });
       	     mapView.ui.add(searchWidgetExpand, {
    		  position: "top-left",
    		  index: 1
    		});
			
			let searchWidgetScene = new SearchWidget({
			   		  view: sceneView
			   		});

			   	  let searchWidgetSceneExpand = new Expand({
			   	    	 expandIcon: "search",  
			   	    	 expandTooltip: "Find Address or Place", 
			   	    	 view: sceneView,
			   	    	 content: searchWidgetScene
			      	     });
			
			sceneView.ui.add(searchWidgetSceneExpand, {
						    		  position: "top-left",
						    		  index: 0
						    		});
    	  
    	  let layerList = new LayerList({
    		  view: mapView
    		  ,listItemCreatedFunction: defineActions
    		});
			
    		let layerListExpand = new Expand({
   	    	 expandIcon: "layers",  
   	    	 expandTooltip: "Map Layers", 
   	    	 view: mapView,
   	    	 content: layerList
      	     });
      	     mapView.ui.add(layerListExpand, {
    		  position: "top-left",
    		  index: 2
    		});
			
			
			let layerListScene = new LayerList({
    		  view: sceneView
    		  ,listItemCreatedFunction: defineActions
    		});
			
    		let layerListSceneExpand = new Expand({
   	    	 expandIcon: "layers",  
   	    	 expandTooltip: "Map Layers", 
   	    	 view: sceneView,
   	    	 content: layerListScene
      	     });
      	     sceneView.ui.add(layerListSceneExpand, {
    		  position: "top-left",
    		  index: 2
    		});
    
    		// Store reference to layerList for later use
    		this.layerList = layerList;
			this.layerListScene = layerListScene;
    	    
      	   async function defineActions(event) {
      		  const item = event.item;

      		  await item.layer.when();      		 
      		    // An array of objects defining actions to place in the LayerList.By making this array two-dimensional, you can separate similar
      		    // actions into separate groups with a breaking line.
      		    item.actionsSections = [
      		      [
      		        {
      		          title: i18resources.mapViewer.layerListFullExtent,
      		          icon: "zoom-out-fixed",
      		          id: "full-extent"
      		        }],
      		        [{
      		          title: i18resources.mapViewer.layerListRemove,
      		          icon: "minus-circle",
      		          id: "remove-layer"
      		        }
      		      ]
      		    ];
      		  } 
	      	 layerList.on("trigger-action", lang.hitch(this, function(event) {
	       		this.executeLayerlistActions(event);
	       	 }));
			 layerListScene.on("trigger-action", lang.hitch(this, function(event) {
	       		this.executeLayerlistActions(event);
	       	 }));
    		let homeWidget = new Home({
    			  view: mapView
    			});

			// adds the home widget to the top left corner of the MapView
			mapView.ui.add(homeWidget, {
	    		  position: "top-left",
	    		  index: 4
	    		});   	 
			
			let basemapWidget = new BasemapGallery({
  			  view: mapView
  			});
			let basemapExpand = new Expand({
   	    	 expandIcon: "basemap",  
   	    	 expandTooltip: "Basemap", 
   	    	 view: mapView,
   	    	 content: basemapWidget
      	     });
			// adds the basemap widget to the top right corner of the MapView
			mapView.ui.add(basemapExpand, {
	    		  position: "top-right",
	    		  index: 1
	    		});  
				
			let basemapWidgetscene = new BasemapGallery({
                  view: sceneView
                });
            let basemapExpandScene = new Expand({
        	 expandIcon: "basemap",  
        	 expandTooltip: "Basemap", 
        	 view: sceneView,
        	 content: basemapWidgetscene
         });
            // adds the basemap widget to the top right corner of the SceneView
            sceneView.ui.add(basemapExpandScene, {
        		  position: "top-right",
        		  index: 1
        		});	
   	     	
    		let legend = new Legend({
    			  view: mapView
    		}); 
    		let legendExpand = new Expand({
    	    	 expandIcon: "legend",  
    	    	 expandTooltip: "Legend", 
    	    	 view: mapView,
    	    	 content: legend
       	     });
       	     mapView.ui.add(legendExpand, {
    		  position: "top-left",
    		  index: 3
    		});	
			
			
			let legendScene = new Legend({
    			  view: sceneView
    		}); 
    		let legendSceneExpand = new Expand({
    	    	 expandIcon: "legend",  
    	    	 expandTooltip: "Legend", 
    	    	 view: sceneView,
    	    	 content: legendScene
       	     });
       	     sceneView.ui.add(legendSceneExpand, {
    		  position: "top-left",
    		  index: 3
    		});
			
			// --- Create and add the switch button as a proper Esri widget ---
            const switchBtnContainer = document.createElement("div");
            switchBtnContainer.className = "esri-widget esri-component";
            switchBtnContainer.style.boxShadow = "0 1px 2px rgba(0,0,0,0.15)";
            
            let switchBtn = document.createElement("button");
            switchBtn.id = "switch-btn";
            switchBtn.innerHTML = i18resources.mapViewer.toggleView3d;
            switchBtn.className = "esri-button";
            switchBtn.title = "Switch between 2D and 3D views";
            switchBtnContainer.appendChild(switchBtn);
            
            // Add to mapView UI initially
            mapView.ui.add(switchBtnContainer, {
				position: "top-right",
				    		  index: 0
            });
            
            // --- Switch logic ---
            switchBtn.addEventListener("click", () => {
                if (this.activeView === mapView) {
                    this.activeView = sceneView;
                    sceneView.container = this.mapNode;
                    mapView.container = null;
                    // Remove from mapView UI, add to sceneView UI
                    mapView.ui.remove(switchBtnContainer);
                    sceneView.ui.add(switchBtnContainer, {
                        position: "top-right",
                        index: 0
                    });
                    switchBtn.innerHTML = i18resources.mapViewer.toggleView2d;
                } else {
                    this.activeView = mapView;
                    mapView.container = this.mapNode;
                    sceneView.container = null;
                    // Remove from sceneView UI, add to mapView UI
                    sceneView.ui.remove(switchBtnContainer);
                    mapView.ui.add(switchBtnContainer, {
                        position: "top-right",
                        index: 0
                    });
                    switchBtn.innerHTML = i18resources.mapViewer.toggleView3d;
                    // Force MapView to refresh layers after re-attachment
                    mapView.map.layers.forEach(layer => {
                        if (layer.visible !== undefined) {
                            const wasVisible = layer.visible;
                            layer.visible = false;
                            layer.visible = wasVisible;
                        }
                    });
                }
            });
            
         var selectedFeature;
	     
	     reactiveUtils.on(()=>mapView.popup, "trigger-action", (event)=>{	    	 
	    	  if(event.action.id === "view-attribute-table"){	    	   
	    		  this.openAttrTable(mapView.popup.selectedFeature);
	    	  }
	    	});
		reactiveUtils.on(()=>sceneView.popup, "trigger-action", (event)=>{	    	 
		    	  if(event.action.id === "view-attribute-table"){	    	   
		    		  this.openAttrTable(sceneView.popup.selectedFeature);
		    	  }
		    	});
	     reactiveUtils.watch(
             () => mapView.popup.viewModel?.active,
             () => {
               selectedFeature = mapView.popup.selectedFeature;
               if (selectedFeature !== null && mapView.popup.visible !== false) {
            	   if(this.featureTable)
            		   {
            		   this.featureTable.highlightIds.removeAll();
            		   this.featureTable.highlightIds.add(mapView.popup.selectedFeature.attributes.OBJECTID);
  	                 	
            		   }
                 
               }
             }
	      );
		  
		  reactiveUtils.watch(
		      () => sceneView.popup.viewModel?.active,
		      () => {
		        selectedFeature = sceneView.popup.selectedFeature;
		        if (selectedFeature !== null && sceneView.popup.visible !== false) {
		     	   if(this.featureTable)
		     		   {
		     		   this.featureTable.highlightIds.removeAll();
		     		   this.featureTable.highlightIds.add(sceneView.popup.selectedFeature.attributes.OBJECTID);
		                	
		     		   }
		          
		        }
		      }
		   );
		   this.mapView = mapView;
           this.sceneView = sceneView;
	       this.activeView = mapView;
	       
	       // Add initial layer after both views are ready and assigned
	       if (!this.mapWasInitialized) {
	         this.mapWasInitialized = true;
	         if (this.urlParams) {
	           this.addLayer(this.urlParams,this.mapView,this.sceneView);
	         }
	       }
		 
      }));  
    },
    
    executeLayerlistActions:function(event)
    {
    	if(event.action && event.action.id === 'full-extent' &&
    			event.item && event.item.layer) 
		{
    		this.activeView.goTo(event.item.layer.fullExtent);
		}
    	if(event.action && event.action.id === 'remove-layer' &&
    			event.item && event.item.layer) 
		{
    		// Use the layer directly from the event item - it's already the correct layer
    		// from the LayerList's associated view/map
    		const layerToRemove = event.item.layer;
    		
    		// Find and remove matching layers from both views by URL or title
    		// since layers are cloned with different IDs for each view
    		var layerUrl = layerToRemove.url;
    		var layerTitle = layerToRemove.title;
    		
    		// Remove from mapView
    		var mapLayerToRemove = this.mapView.map.layers.find(function(lyr) {
    			return (layerUrl && lyr.url === layerUrl) || 
    			       (layerTitle && lyr.title === layerTitle);
    		});
    		if (mapLayerToRemove) {
    			this.mapView.map.layers.remove(mapLayerToRemove);
    		}
    		
    		// Remove from sceneView
    		var sceneLayerToRemove = this.sceneView.map.layers.find(function(lyr) {
    			return (layerUrl && lyr.url === layerUrl) || 
    			       (layerTitle && lyr.title === layerTitle);
    		});
    		if (sceneLayerToRemove) {
    			this.sceneView.map.layers.remove(sceneLayerToRemove);
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
    	var serviceUrl = selectedFeature.sourceLayer.url;
    	if(this.urlParams && this.urlParams.type == 'WFS' || serviceUrl.indexOf('WFSServer')>-1)
    		{
    		var layerToAdd = new WFSLayer({url:serviceUrl});
    		}
    	else
    		{
    		var layerToAdd = new FeatureLayer(serviceUrl);
    		}
    	
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
   		  layer: layerToAdd,
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
          var url = loc.protocol + "//" + loc.host + loc.pathname + "elastic/" + gpt.metadataIndexName + "/_search";
          
          if (AppContext.appConfig.system.secureCatalogApp || (AppContext.geoportal.supportsApprovalStatus || 
                  AppContext.geoportal.supportsGroupBasedAccess)) {
          	  var client = new AppClient();         
              url = client.appendAccessToken(url); 
          }
          return url;
        }
        return null;
      },
      
      addLayer: function(params,mapView,sceneView) {
          // console.warn("AddToMap.addLayer...",type,url);     
    	  var url = params.url;
    	  var type = params.type;    	  
          var dfd = new Deferred();
          this.urlParams = params;
        
          var processor = new LayerProcessor();
          processor.addLayer(mapView,type,url,sceneView).then(function(result){
            if (result) {
              dfd.resolve(result);
            } else {
              dfd.reject("Failed");
              console.warn("AddToMap failed for",url);             
            }
          }).catch(function(error){
            dfd.reject(error);
            if (typeof error === "string" && error === "Unsupported") {
              console.warn("AddToMap: Unsupported type",type,url);
            } else {
              console.warn("AddToMap failed for",url);
              console.warn(error);
            }
           //TODO add popup alert("Add to Map failed");
          }); 
          return dfd;
        }
  });

  return oThisClass;
});