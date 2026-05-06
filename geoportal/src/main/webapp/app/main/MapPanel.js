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
    
    /**
     * Main entry point to load the map panel.
     * Creates maps and views, then initializes all widgets once the map is ready.
     */
    loadMapPanel: function() {
      var mapProps = this._getMapProperties();
      var views = this._createMapsAndViews(mapProps);
      var mapView = views.mapView;
      var sceneView = views.sceneView;
      
      // Add custom basemap layer if specified
      this._addCustomBasemapLayer(views.map, mapProps);
      
      // Initialize widgets and setup when map view is ready
      mapView.when(lang.hitch(this, function() {
        this._initializeLocalCatalogUrl();
        this._setupAllWidgets(mapView, sceneView);
        this._setupPopupWatchers(mapView, sceneView);
        this._finalizeMapSetup(mapView, sceneView);
      }));
    },
    
    /**
     * Gets and clones map properties from app configuration.
     */
    _getMapProperties: function() {
      var mapProps = AppContext.appConfig.searchMap || {};
      if (mapProps) mapProps = lang.clone(mapProps);
      return mapProps;
    },
    
    /**
     * Creates Map and SceneView objects with the given properties.
     */
    _createMapsAndViews: function(mapProps) {
      var basemapUrl = mapProps.basemapUrl;
      delete mapProps.basemapUrl;
      if (typeof mapProps.basemap === "string" && mapProps.basemap.length > 0) {
        basemapUrl = null;
      }
      
      var map = new Map({basemap: mapProps.basemap});
      var map3D = new Map({basemap: mapProps.threeDBasemap, ground: "world-elevation"});
      
      var mapView = new MapView({
        container: this.mapNode,
        map: map,
        center: mapProps.center,
        zoom: mapProps.zoom
      });
      
      var sceneView = new SceneView({
        container: null,
        map: map3D,
        center: mapProps.center,
        zoom: mapProps.zoom
      });
      
      return {
        map: map,
        map3D: map3D,
        mapView: mapView,
        sceneView: sceneView,
        basemapUrl: basemapUrl,
        isTiled: mapProps.isTiled
      };
    },
    
    /**
     * Adds custom basemap layer if a URL is specified.
     */
    _addCustomBasemapLayer: function(map, mapProps) {
      var v = mapProps.basemapUrl;
      if (typeof v === "string" && v.length > 0) {
        v = util.checkMixedContent(v);
        var basemap;
        if (!mapProps.isTiled) {
          basemap = new MapImageLayer(v);
        } else {
          basemap = new TileLayer(v);
        }
        map.add(basemap);
      }
    },
    
    /**
     * Initializes the local catalog URL in the config targets.
     */
    _initializeLocalCatalogUrl: function() {
      var localGeoportalUrl = this._createLocalCatalogUrl();
      if (localGeoportalUrl) {
        for (var i = 0; i < this.config.targets.length; i++) {
          var target = this.config.targets[i];
          if (target.type === "geoportal" && !target.url) {
            this.config.targets[i].url = localGeoportalUrl;
            break;
          }
        }
      }
    },
    
    /**
     * Sets up all map widgets for both map and scene views.
     */
    _setupAllWidgets: function(mapView, sceneView) {
      this._setupGeoportalSearchWidget(mapView, sceneView);
      this._setupSearchWidget(mapView, sceneView);
      this._setupLayerList(mapView, sceneView);
      this._setupHomeWidget(mapView, sceneView);
      this._setupBasemapGallery(mapView, sceneView);
      this._setupLegend(mapView, sceneView);
      this._setupViewSwitcher(mapView, sceneView);
    },
    
    /**
     * Sets up the Geoportal search widget for both views.
     */
    _setupGeoportalSearchWidget: function(mapView, sceneView) {
      var widgetContext = new WidgetContext({
        i18n: i18n,
        view: mapView,
        proxyUrl: esriConfig.defaults.io.proxyUrl,
        wabWidget: this,
        widgetConfig: this.config
      });
      
      var node = domConstruct.create("div", {
        width: "500px",
        height: "500px"
      });
      
      // MapView geoportal search
      var gpSearchWidget = new SearchPane({
        i18n: widgetContext.i18n,
        widgetContext: widgetContext
      }, node);
      gpSearchWidget.startup();
      
      var gpSearchExpand = new Expand({
        expandIcon: "query",
        expandTooltip: "Geoportal Search",
        view: mapView,
        content: gpSearchWidget
      });
      mapView.ui.add(gpSearchExpand, {position: "top-left", index: 0});
      
      // SceneView geoportal search
      var gpSearchWidgetScene = new SearchPane({
        i18n: widgetContext.i18n,
        widgetContext: widgetContext
      }, node.cloneNode());
      gpSearchWidgetScene.startup();
      
      var gpSearchExpandScene = new Expand({
        expandIcon: "query",
        expandTooltip: "Geoportal Search",
        view: sceneView,
        content: gpSearchWidgetScene
      });
      sceneView.ui.add(gpSearchExpandScene, {position: "top-left", index: 0});
    },
    
    /**
     * Sets up the address/place search widget for both views.
     */
    _setupSearchWidget: function(mapView, sceneView) {
      // MapView search
      var searchWidget = new SearchWidget({view: mapView});
      var searchWidgetExpand = new Expand({
        expandIcon: "search",
        expandTooltip: "Find Address or Place",
        view: mapView,
        content: searchWidget
      });
      mapView.ui.add(searchWidgetExpand, {position: "top-left", index: 1});
      
      // SceneView search
      var searchWidgetScene = new SearchWidget({view: sceneView});
      var searchWidgetSceneExpand = new Expand({
        expandIcon: "search",
        expandTooltip: "Find Address or Place",
        view: sceneView,
        content: searchWidgetScene
      });
      sceneView.ui.add(searchWidgetSceneExpand, {position: "top-left", index: 0});
    },
    
    /**
     * Sets up the layer list widget for both views.
     */
    _setupLayerList: function(mapView, sceneView) {
      var self = this;
      
      // Define actions for layer list items
      async function defineActions(event) {
        var item = event.item;
        await item.layer.when();
        item.actionsSections = [
          [{
            title: i18resources.mapViewer.layerListFullExtent,
            icon: "zoom-out-fixed",
            id: "full-extent"
          }],
          [{
            title: i18resources.mapViewer.layerListRemove,
            icon: "minus-circle",
            id: "remove-layer"
          }]
        ];
      }
      
      // MapView layer list
      var layerList = new LayerList({
        view: mapView,
        listItemCreatedFunction: defineActions
      });
      var layerListExpand = new Expand({
        expandIcon: "layers",
        expandTooltip: "Map Layers",
        view: mapView,
        content: layerList
      });
      mapView.ui.add(layerListExpand, {position: "top-left", index: 2});
      
      // SceneView layer list
      var layerListScene = new LayerList({
        view: sceneView,
        listItemCreatedFunction: defineActions
      });
      var layerListSceneExpand = new Expand({
        expandIcon: "layers",
        expandTooltip: "Map Layers",
        view: sceneView,
        content: layerListScene
      });
      sceneView.ui.add(layerListSceneExpand, {position: "top-left", index: 2});
      
      // Store references and setup action handlers
      this.layerList = layerList;
      this.layerListScene = layerListScene;
      
      layerList.on("trigger-action", lang.hitch(this, function(event) {
        this.executeLayerlistActions(event);
      }));
      layerListScene.on("trigger-action", lang.hitch(this, function(event) {
        this.executeLayerlistActions(event);
      }));
    },
    
    /**
     * Sets up the home widget for both views.
     */
    _setupHomeWidget: function(mapView, sceneView) {
      // MapView home
      var homeWidget = new Home({view: mapView});
      mapView.ui.add(homeWidget, {position: "top-left", index: 4});
      
      // SceneView home
      var homeWidgetScene = new Home({view: sceneView});
      sceneView.ui.add(homeWidgetScene, {position: "top-left", index: 4});
    },
    
    /**
     * Sets up the basemap gallery widget for both views.
     */
    _setupBasemapGallery: function(mapView, sceneView) {
      // MapView basemap gallery
      var basemapWidget = new BasemapGallery({view: mapView});
      var basemapExpand = new Expand({
        expandIcon: "basemap",
        expandTooltip: "Basemap",
        view: mapView,
        content: basemapWidget
      });
      mapView.ui.add(basemapExpand, {position: "top-right", index: 1});
      
      // SceneView basemap gallery
      var basemapWidgetScene = new BasemapGallery({view: sceneView});
      var basemapExpandScene = new Expand({
        expandIcon: "basemap",
        expandTooltip: "Basemap",
        view: sceneView,
        content: basemapWidgetScene
      });
      sceneView.ui.add(basemapExpandScene, {position: "top-right", index: 1});
    },
    
    /**
     * Sets up the legend widget for both views.
     */
    _setupLegend: function(mapView, sceneView) {
      // MapView legend
      var legend = new Legend({view: mapView});
      var legendExpand = new Expand({
        expandIcon: "legend",
        expandTooltip: "Legend",
        view: mapView,
        content: legend
      });
      mapView.ui.add(legendExpand, {position: "top-left", index: 3});
      
      // SceneView legend
      var legendScene = new Legend({view: sceneView});
      var legendSceneExpand = new Expand({
        expandIcon: "legend",
        expandTooltip: "Legend",
        view: sceneView,
        content: legendScene
      });
      sceneView.ui.add(legendSceneExpand, {position: "top-left", index: 3});
    },
    
    /**
     * Sets up the 2D/3D view switcher button.
     */
    _setupViewSwitcher: function(mapView, sceneView) {
      var self = this;
      
      // Create switch button container
      var switchBtnContainer = document.createElement("div");
      switchBtnContainer.className = "esri-widget esri-component";
      switchBtnContainer.style.boxShadow = "0 1px 2px rgba(0,0,0,0.15)";
      
      var switchBtn = document.createElement("button");
      switchBtn.id = "switch-btn";
      switchBtn.innerHTML = i18resources.mapViewer.toggleView3d;
      switchBtn.className = "esri-button";
      switchBtn.title = "Switch between 2D and 3D views";
      switchBtnContainer.appendChild(switchBtn);
      
      // Add to mapView UI initially
      mapView.ui.add(switchBtnContainer, {position: "top-right", index: 0});
      
      // Switch logic
      switchBtn.addEventListener("click", function() {
        if (self.activeView === mapView) {
          self._switchToSceneView(mapView, sceneView, switchBtnContainer, switchBtn);
        } else {
          self._switchToMapView(mapView, sceneView, switchBtnContainer, switchBtn);
        }
      });
    },
    
    /**
     * Switches from 2D MapView to 3D SceneView.
     */
    _switchToSceneView: function(mapView, sceneView, switchBtnContainer, switchBtn) {
      var self = this;
      
      // Save current 2D view state before switching
      var viewpoint = mapView.viewpoint.clone();
      
      this.activeView = sceneView;
      sceneView.container = this.mapNode;
      mapView.container = null;
      mapView.ui.remove(switchBtnContainer);
      sceneView.ui.add(switchBtnContainer, {position: "top-right", index: 0});
      switchBtn.innerHTML = i18resources.mapViewer.toggleView2d;
      
      // Apply the saved viewpoint to the 3D view
      sceneView.goTo(viewpoint).catch(function(error) {
        console.warn("Could not sync viewpoint to 3D view:", error);
      });
    },
    
    /**
     * Switches from 3D SceneView to 2D MapView.
     */
    _switchToMapView: function(mapView, sceneView, switchBtnContainer, switchBtn) {
      var self = this;
      
      // Save current 3D view state before switching
      var viewpoint = sceneView.viewpoint.clone();
      
      this.activeView = mapView;
      mapView.container = this.mapNode;
      sceneView.container = null;
      sceneView.ui.remove(switchBtnContainer);
      mapView.ui.add(switchBtnContainer, {position: "top-right", index: 0});
      switchBtn.innerHTML = i18resources.mapViewer.toggleView3d;
      
      // Apply the saved viewpoint to the 2D view
      mapView.goTo(viewpoint).then(function() {
        // Force MapView to refresh layers after re-attachment and viewpoint sync
        mapView.map.layers.forEach(function(layer) {
          if (layer.visible !== undefined) {
            var wasVisible = layer.visible;
            layer.visible = false;
            layer.visible = wasVisible;
          }
        });
      }).catch(function(error) {
        console.warn("Could not sync viewpoint to 2D view:", error);
      });
    },
    
    /**
     * Sets up popup watchers for feature table integration.
     */
    _setupPopupWatchers: function(mapView, sceneView) {
      var self = this;
      
      // MapView popup action handler
      reactiveUtils.on(function() { return mapView.popup; }, "trigger-action", function(event) {
        if (event.action.id === "view-attribute-table") {
          self.openAttrTable(mapView.popup.selectedFeature);
        }
      });
      
      // SceneView popup action handler
      reactiveUtils.on(function() { return sceneView.popup; }, "trigger-action", function(event) {
        if (event.action.id === "view-attribute-table") {
          self.openAttrTable(sceneView.popup.selectedFeature);
        }
      });
      
      // MapView popup selection watcher
      reactiveUtils.watch(
        function() { return mapView.popup.viewModel?.active; },
        function() {
          var selectedFeature = mapView.popup.selectedFeature;
          if (selectedFeature !== null && mapView.popup.visible !== false) {
            if (self.featureTable) {
              self.featureTable.highlightIds.removeAll();
              self.featureTable.highlightIds.add(mapView.popup.selectedFeature.attributes.OBJECTID);
            }
          }
        }
      );
      
      // SceneView popup selection watcher
      reactiveUtils.watch(
        function() { return sceneView.popup.viewModel?.active; },
        function() {
          var selectedFeature = sceneView.popup.selectedFeature;
          if (selectedFeature !== null && sceneView.popup.visible !== false) {
            if (self.featureTable) {
              self.featureTable.highlightIds.removeAll();
              self.featureTable.highlightIds.add(sceneView.popup.selectedFeature.attributes.OBJECTID);
            }
          }
        }
      );
    },
    
    /**
     * Finalizes map setup by storing references and adding initial layer.
     */
    _finalizeMapSetup: function(mapView, sceneView) {
      this.mapView = mapView;
      this.sceneView = sceneView;
      this.activeView = mapView;
      
      // Add initial layer after both views are ready and assigned
      if (!this.mapWasInitialized) {
        this.mapWasInitialized = true;
        if (this.urlParams) {
          this.addLayer(this.urlParams, this.mapView, this.sceneView);
        }
      }
    },
    
    executeLayerlistActions:function(event)
    {
    	if(event.action && event.action.id === 'full-extent' &&
    			event.item && event.item.layer) 
		{
			if(this.activeView.type === "2d")
             {
                 // For 2D MapView, use the fullExtent directly from the layer
                 this.activeView.goTo(event.item.layer.fullExtent);
             }
            else if(this.activeView.type === "3d")
            {
				this.activeView.goTo({
				      target: event.item.layer.fullExtent,
				      tilt: 65
				    });
            }           
			
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
