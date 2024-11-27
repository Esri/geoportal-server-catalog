define([], function() {
		/*jshint unused: false*/
		var mo = {};
		//appConfig.title
		mo.keyTitle = "app_title";
		//appConfig.subtitle
		mo.keySubtitle = "app_subtitle";
		mo.keyLogo = "app_logo";
		//appConfig.links[0].label;
		mo.keyLinksLabel = "app_links[0]_label";
		mo.keyMapPosition = "app_map_position_top";
		mo.keyMapExtent = "app_map_mapOptions_extent_spatialReference";

		/******************************
		 * Widget OnScreen
		 ******************************/
		mo.keyWidgetOnScreen1 = "app_widgetOnScreen";
		mo.keyWidgetOnScreen2 =
			"app_widgetOnScreen_widgets[themes/FoldableTheme/widgets/HeaderController/Widget_1]";
		//appConfig.widgetOnScreen.widgets[0].uri
		mo.keyWidgetOnScreen3 =
			"app_widgetOnScreen_widgets[themes/FoldableTheme/widgets/HeaderController/Widget_1]_uri";
		mo.keyWidgetOnScreen4 =
			"app_widgetOnScreen_widgets"+
			"[themes/FoldableTheme/widgets/HeaderController/Widget_1]_positionRelativeTo";
		//appConfig.widgetOnScreen.widgets[3].position.bottom
		mo.keyWidgetOnScreen5 =
			"app_widgetOnScreen_widgets[widgets/Coordinate/Widget_4]_position_bottom";
		mo.keyWidgetOnScreen6 = "app_widgetOnScreen_panel_uri";

		/******************************
		 * Widget Pool
		 ******************************/
		mo.keyWidgetPoll1 = "app_widgetPool";
		mo.keyWidgetPoll2 = "app_widgetPool_panel_uri";

		mo.keyWidgetPollLayerList1 = "app_widgetPool_widgets[widgets/LayerList/Widget_14]";
		mo.keyWidgetPollLayerList2 = "app_widgetPool_widgets[widgets/LayerList/Widget_14]_uri";
		mo.keyWidgetPollLayerList3 = "app_widgetPool_widgets[widgets/LayerList/Widget_14]_id";
		mo.keyWidgetPollLayerList4 = "app_widgetPool_widgets[widgets/LayerList/Widget_14]_name";
		//appConfig.widgetPool.widgets[1].label
		mo.keyWidgetPollLayerList5 = "app_widgetPool_widgets[widgets/LayerList/Widget_14]_label";
		//appConfig.widgetPool.widgets[1].config
		mo.keyWidgetPollLayerList6 = "app_widgetPool_widgets[widgets/LayerList/Widget_14]_config";
		//appConfig.widgetPool.widgets[1].config.showLegend
		mo.keyWidgetPollLayerListConfig =
			"app_widgetPool_widgets[widgets/LayerList/Widget_14]_config_showLegend";

		mo.keyWidgetPollBasemapGallery1 = "app_widgetPool_widgets[widgets/BasemapGallery/Widget_19]";
		mo.keyWidgetPollBasemapGallery2 =
			"app_widgetPool_widgets[widgets/BasemapGallery/Widget_19]_name";
		mo.keyWidgetPollBasemapGallery3 =
			"app_widgetPool_widgets[widgets/BasemapGallery/Widget_19]_label";
		mo.keyWidgetPollBasemapGallery4 =
			"app_widgetPool_widgets[widgets/BasemapGallery/Widget_19]_isThemeWidget";
		mo.keyWidgetPollBasemapGallery5 =
			"app_widgetPool_widgets[widgets/BasemapGallery/Widget_19]_config";
		mo.keyWidgetPollBasemapGalleryConfig1 =
			"app_widgetPool_widgets[widgets/BasemapGallery/Widget_19]_config_basemapGallery";
		mo.keyWidgetPollBasemapGalleryConfig2 =
			"app_widgetPool_widgets[widgets/BasemapGallery/Widget_19]_config_basemapGallery_basemaps";
		mo.keyWidgetPollBasemapGalleryConfig3 =
			"app_widgetPool_widgets[widgets/BasemapGallery/Widget_19]_config_basemapGallery_basemaps[0]";
		mo.keyWidgetPollBasemapGalleryConfig4 =
			"app_widgetPool_widgets[widgets/BasemapGallery/Widget_19]"+
			"_config_basemapGallery_basemaps[0]_layers";
		mo.keyWidgetPollBasemapGalleryConfig5 =
			"app_widgetPool_widgets[widgets/BasemapGallery/Widget_19]"+
			"_config_basemapGallery_basemaps[0]_layers[0]";
		mo.keyWidgetPollBasemapGalleryConfig6 =
			"app_widgetPool_widgets[widgets/BasemapGallery/Widget_19]"+
			"_config_basemapGallery_basemaps[0]_layers[0]_id";
		mo.keyWidgetPollBasemapGalleryConfig7 =
			"app_widgetPool_widgets[widgets/BasemapGallery/Widget_19]"+
			"_config_basemapGallery_basemaps[0]_title";
		mo.keyWidgetPollBasemapGalleryConfig8 =
			"app_widgetPool_widgets[widgets/BasemapGallery/Widget_19]"+
			"_config_basemapGallery_basemaps[0]_spatialReference_wkid";

		/******************************
		 * groups
		 ******************************/
		// appConfig.widgetPool.groups[0]
		mo.keyGroup1 = "app_widgetPool_groups[_18]";
		// appConfig.widgetPool.groups[0].label
		mo.keyGroup2 = "app_widgetPool_groups[_18]_label";
		// appConfig.widgetPool.groups[1].widgets
		mo.keyGroup3 = "app_widgetPool_groups[_29]_widgets";
		mo.keyGroupWidget1 = "app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]";
		// appConfig.widgetPool.groups[1].widgets[2].name
		mo.keyGroupWidget2 = "app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]"+
			"_name";
		mo.keyGroupWidget3 = "app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]"+
			"_label";
		mo.keyGroupWidget4 = "app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]"+
			"_isThemeWidget";
		mo.keyGroupWidget5 = "app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]"+
			"_icon";
		// appConfig.widgetPool.groups[1].widgets[2].config
		mo.keyGroupWidget6 = "app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]"+
			"_config";
		mo.keyGroupWidgetConfig1 =
			"app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]"+
			"_config_basemapGallery";
		mo.keyGroupWidgetConfig2 =
			"app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]"+
			"_config_basemapGallery_basemaps";
		mo.keyGroupWidgetConfig3 =
			"app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]"+
			"_config_basemapGallery_basemaps[0]";
		mo.keyGroupWidgetConfig4 =
			"app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]"+
			"_config_basemapGallery_basemaps[0]_layers";
		mo.keyGroupWidgetConfig5 =
			"app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]"+
			"_config_basemapGallery_basemaps[0]_layers[0]";
		mo.keyGroupWidgetConfig6 =
			"app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]"+
			"_config_basemapGallery_basemaps[0]_layers[0]_opacity";
		//appConfig.widgetPool.groups[1].widgets[2].config.basemapGallery.basemaps[0].thumbnailUrl
		mo.keyGroupWidgetConfig7 =
			"app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]"+
			"_config_basemapGallery_basemaps[0]_thumbnailUrl";
		mo.keyGroupWidgetConfig8 =
			"app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]"+
			"_config_basemapGallery_basemaps[0]_spatialReference_wkid";



		/*****************************
		 * appConfig
		 *****************************/
		mo._appConfig = {
			"theme": {
				"name": "FoldableTheme",
				"styles": [
					"default",
					"black",
					"green",
					"cyan"
				]
			},
			"portalUrl": "http://catamaran.chn.esri.com/arcgis/",
			"title": "222",
			"subtitle": "with Web AppBuilder for ArcGIS",
			"logo": "images/app-logo.png",
			"geometryService":
				"https://utilitydev.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer",
			"links": [{
				"label": "a",
				"url": "http://"
			}, {
				"label": "b",
				"url": "http://"
			}],
			"widgetOnScreen": {
				"widgets": [{
					"uri": "themes/FoldableTheme/widgets/HeaderController/Widget",
					"positionRelativeTo": "browser",
					"position": {
						"left": 0,
						"top": 0,
						"right": 0,
						"height": 40
					},
					"id": "themes/FoldableTheme/widgets/HeaderController/Widget_1",
					"name": "HeaderController",
					"isThemeWidget": true,
					"label": "Header Controller"
				}, {
					"uri": "widgets/Scalebar/Widget",
					"position": {
						"left": 25,
						"bottom": 25
					},
					"id": "widgets/Scalebar/Widget_2",
					"positionRelativeTo": "map",
					"name": "Scalebar",
					"label": "Scalebar"
				}, {
					"uri": "widgets/Geocoder/Widget",
					"position": {
						"left": 45,
						"top": 5
					},
					"id": "widgets/Geocoder/Widget_3",
					"positionRelativeTo": "map",
					"name": "Geocoder",
					"label": "Geocoder"
				}, {
					"uri": "widgets/Coordinate/Widget",
					"position": {
						"left": 200,
						"bottom": 20
					},
					"id": "widgets/Coordinate/Widget_4",
					"positionRelativeTo": "map",
					"name": "Coordinate",
					"label": "Coordinate"
				}, {
					"position": {
						"left": 55,
						"top": 45,
						"width": 400,
						"height": 410
					},
					"placeholderIndex": 1,
					"id": "_5",
					"positionRelativeTo": "map",
					"name": "BasemapGallery",
					"label": "Basemap Gallery",
					"isThemeWidget": false,
					"icon": "http://catamaran.chn.esri.com:3344/webappbuilder/apps/11/widgets/BasemapGallery/images/icon.png",
					"uri": "widgets/BasemapGallery/Widget",
					"config": "configs/BasemapGallery/config_Basemap Gallery.json"
				}, {
					"position": {
						"left": 105,
						"top": 45,
						"width": 380,
						"height": 410
					},
					"placeholderIndex": 1,
					"id": "_6",
					"positionRelativeTo": "map"
				}, {
					"position": {
						"left": 155,
						"top": 45,
						"width": 380,
						"height": 410
					},
					"placeholderIndex": 2,
					"id": "_7",
					"positionRelativeTo": "map"
				}, {
					"uri": "widgets/OverviewMap/Widget",
					"position": {
						"top": 0,
						"right": 0
					},
					"id": "widgets/OverviewMap/Widget_8",
					"positionRelativeTo": "map",
					"name": "OverviewMap",
					"label": "Overview Map"
				}, {
					"uri": "widgets/HomeButton/Widget",
					"position": {
						"left": 7,
						"top": 75
					},
					"id": "widgets/HomeButton/Widget_9",
					"positionRelativeTo": "map",
					"name": "HomeButton",
					"label": "Home Button"
				}, {
					"uri": "widgets/MyLocation/Widget",
					"position": {
						"left": 7,
						"top": 110
					},
					"id": "widgets/MyLocation/Widget_10",
					"positionRelativeTo": "map",
					"name": "MyLocation",
					"label": "My Location"
				}, {
					"uri": "widgets/AttributeTable/Widget",
					"positionRelativeTo": "browser",
					"id": "widgets/AttributeTable/Widget_11",
					"position": {
						"left": 0,
						"top": 0
					},
					"name": "AttributeTable",
					"label": "Attribute Table"
				}, {
					"uri": "widgets/Splash/Widget",
					"visible": false,
					"positionRelativeTo": "browser",
					"id": "widgets/Splash/Widget_12",
					"position": {
						"left": 0,
						"top": 0
					},
					"name": "Splash",
					"label": "Splash"
				}],
				"panel": {
					"uri": "jimu/PreloadWidgetIconPanel",
					"positionRelativeTo": "map"
				}
			},
			"map": {
				"3D": false,
				"2D": true,
				"position": {
					"left": 0,
					"top": 40,
					"right": 0,
					"bottom": 0
				},
				"itemId": "9d98f7113f9b469c8c302b210db7b922",
				"mapOptions": {
					"extent": {
						"xmin": -18000000,
						"ymin": -12000000,
						"xmax": 18000000,
						"ymax": 16000000,
						"spatialReference": {
							"wkid": 102100
						}
					}
				},
				"id": "map",
				"portalUrl": "http://catamaran.chn.esri.com/arcgis/"
			},
			"widgetPool": {
				"panel": {
					"uri": "themes/FoldableTheme/panels/FoldablePanel/Panel",
					"positionRelativeTo": "map",
					"position": {
						"top": 5,
						"right": 5,
						"bottom": 5
					}
				},
				"widgets": [{
					"uri": "widgets/Legend/Widget",
					"id": "widgets/Legend/Widget_13",
					"name": "Legend",
					"index": 2,
					"label": "Legend"
				}, {
					"uri": "widgets/LayerList/Widget",
					"id": "widgets/LayerList/Widget_14",
					"name": "LayerList",
					"icon": "http://catamaran.chn.esri.com:3344/webappbuilder/apps/11/widgets/LayerList/images/icon.png",
					"index": 3,
					"label": "Layer List",
					"config": "configs/LayerList/config_Layer List.json"
				}, {
					"name": "BasemapGallery",
					"label": "Basemap Gallery_2",
					"isThemeWidget": false,
					"icon": "http://catamaran.chn.esri.com:3344/webappbuilder/apps/11/widgets/BasemapGallery/images/icon.png",
					"uri": "widgets/BasemapGallery/Widget",
					"config": "configs/BasemapGallery/config_Basemap Gallery_2.json",
					"index": 5,
					"id": "widgets/BasemapGallery/Widget_19"
				}, {
					"name": "Bookmark",
					"label": "Bookmark_2",
					"isThemeWidget": false,
					"icon": "http://catamaran.chn.esri.com:3344/webappbuilder/apps/11/widgets/Bookmark/images/icon.png",
					"uri": "widgets/Bookmark/Widget",
					"index": 6,
					"id": "widgets/Bookmark/Widget_20",
					"config": "configs/Bookmark/config_Bookmark_2.json"
				}, {
					"name": "Chart",
					"label": "Chart_2",
					"isThemeWidget": false,
					"uri": "widgets/Chart/Widget",
					"index": 7,
					"id": "widgets/Chart/Widget_21"
				}, {
					"name": "Directions",
					"label": "Directions_2",
					"isThemeWidget": false,
					"uri": "widgets/Directions/Widget",
					"index": 8,
					"id": "widgets/Directions/Widget_22"
				}, {
					"name": "Draw",
					"label": "Draw",
					"isThemeWidget": false,
					"uri": "widgets/Draw/Widget",
					"index": 9,
					"id": "widgets/Draw/Widget_23"
				}, {
					"name": "Measurement",
					"label": "Measurement",
					"isThemeWidget": false,
					"uri": "widgets/Measurement/Widget",
					"index": 11,
					"id": "widgets/Measurement/Widget_26"
				}, {
					"name": "Print",
					"label": "Print",
					"isThemeWidget": false,
					"uri": "widgets/Print/Widget",
					"index": 12,
					"id": "widgets/Print/Widget_27"
				}, {
					"name": "Query",
					"label": "Query",
					"isThemeWidget": false,
					"uri": "widgets/Query/Widget",
					"index": 13,
					"id": "widgets/Query/Widget_28"
				}],
				"groups": [{
					"label": "New Group",
					"widgets": [{
						"name": "Bookmark",
						"label": "Bookmark",
						"isThemeWidget": false,
						"uri": "widgets/Bookmark/Widget",
						"index": 5,
						"id": "widgets/Bookmark/Widget_15"
					}, {
						"name": "Chart",
						"label": "Chart",
						"isThemeWidget": false,
						"uri": "widgets/Chart/Widget",
						"index": 6,
						"id": "widgets/Chart/Widget_16"
					}, {
						"name": "Directions",
						"label": "Directions",
						"isThemeWidget": false,
						"uri": "widgets/Directions/Widget",
						"index": 5,
						"id": "widgets/Directions/Widget_17"
					}],
					"index": 4,
					"id": "_18",
					"visible": true,
					"panel": {
						"uri": "themes/FoldableTheme/panels/FoldablePanel/Panel",
						"positionRelativeTo": "map",
						"position": {
							"top": 5,
							"right": 5,
							"bottom": 5
						}
					}
				}, {
					"label": "New Group_1",
					"widgets": [{
						"name": "Edit",
						"label": "Edit",
						"isThemeWidget": false,
						"uri": "widgets/Edit/Widget",
						"index": 11,
						"id": "widgets/Edit/Widget_24"
					}, {
						"name": "Geoprocessing",
						"label": "Geoprocessing",
						"isThemeWidget": false,
						"uri": "widgets/Geoprocessing/Widget",
						"index": 12,
						"id": "widgets/Geoprocessing/Widget_25"
					}, {
						"name": "BasemapGallery",
						"label": "Basemap Gallery_3",
						"isThemeWidget": false,
						"icon": "http://catamaran.chn.esri.com:3344/webappbuilder/apps/11/widgets/BasemapGallery/images/icon.png",
						"uri": "widgets/BasemapGallery/Widget",
						"config": "configs/BasemapGallery/config_Basemap Gallery_3.json",
						"index": 15,
						"id": "widgets/BasemapGallery/Widget_30"
					}],
					"index": 10,
					"id": "_29",
					"visible": true,
					"panel": {
						"uri": "themes/FoldableTheme/panels/FoldablePanel/Panel",
						"positionRelativeTo": "map",
						"position": {
							"top": 5,
							"right": 5,
							"bottom": 5
						}
					}
				}]
			},
			"wabVersion": "1.0",
			"isWebTier": false,
			"httpProxy": {
				"useProxy": true,
				"url": "/proxy.js"
			}
		};

		/**************************************
		 * Widget Config
		 **************************************/
		mo._layerListConfig = {
			"showLegend": true
		};


		mo._basemapGalleryConfigId19 = {
			"basemapGallery": {
				"basemaps": [{
					"layers": [{
						"id": "defaultBasemap",
						"opacity": 1,
						"visibility": true,
						"url": "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer"
					}],
					"title": "Topographic",
					"thumbnailUrl": "http://catamaran.chn.esri.com/arcgis/sharing/rest/content/items/9d98f7113f9b469c8c302b210db7b922/info/thumbnail/topo_map_2.jpg",
					"spatialReference": {
						"wkid": "102100"
					}
				}]
			}
		};


		mo._basemapGalleryConfigId30 = {
			"basemapGallery": {
				"basemaps": [{
					"layers": [{
						"id": "NatGeo_World_Map_2536",
						"opacity": 1,
						"visibility": true,
						"url": "http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer"
					}],
					"title": "National Geographic",
					"thumbnailUrl": "http://catamaran.chn.esri.com/arcgis/sharing/rest/content/items/7634c349af5c4ca6ac70078db97d80fd/info/thumbnail/natgeo.jpg",
					"spatialReference": {
						"wkid": "102100"
					}
				}]
			}
		};

		// /******************************
		//  * Public Methods
		//  ******************************/

		// // get clone of appConfig
		// function getAppConfig() {
		// 	var appConfigClone = lang.clone(_appConfig);
		// 	appConfigClone.getConfigElementById = function(id) {
		// 		return function(config, id) {
		// 			var c;
		// 			if (id === 'map') {
		// 				return config.map;
		// 			}
		// 			visitElement(config, function(e) {
		// 				if (e.id === id) {
		// 					c = e;
		// 					return true;
		// 				}
		// 			});
		// 			return c;
		// 		}(appConfigClone, id);
		// 	};
		// 	return appConfigClone;
		// }

		// //Prepare WidgetManger object.
		// function getWidgetManger(values) {
		// 	var widgetManger = new WidgetManager();
		// 	widgetManger.appConfig = getAppConfig();
		// 	widgetManger.appConfig.agolConfig = {
		// 		'values': values
		// 	};
		// 	return widgetManger;
		// }

		// // Simulate to load widgetConfig
		// function loadWidgetConfig(name) {
		// 	switch(name) {
		// 	case '_layerListConfig':
		// 		return _layerListConfig;
		// 	case '_basemapGalleryConfigId19':
		// 		return _basemapGalleryConfigId19;
		// 	case '_basemapGalleryConfigId30':
		// 		return _basemapGalleryConfigId30;
		// 	}
		// }

		// function visitElement(config, cb) {
		// 	//the cb signature: cb(element, index, groupId, isOnScreen), the groupId can be:
		// 	//groupId, widgetOnScreen, widgetPool
		// 	visitBigSection('widgetOnScreen', cb);
		// 	visitBigSection('widgetPool', cb);

		// 	function visitBigSection(section, cb) {
		// 		var i, j, sectionConfig = config[section],
		// 			isOnScreen = (section === 'widgetOnScreen');
		// 		if (!sectionConfig) {
		// 			return;
		// 		}
		// 		if (sectionConfig.groups) {
		// 			for (i = 0; i < sectionConfig.groups.length; i++) {
		// 				if (cb(sectionConfig.groups[i], i, sectionConfig.groups[i].id, isOnScreen)) {
		// 					break;
		// 				}
		// 				for (j = 0; j < sectionConfig.groups[i].widgets.length; j++) {
		// 					if (cb(sectionConfig.groups[i].widgets[j], j, sectionConfig.groups[i].id, isOnScreen)) {
		// 						break;
		// 					}
		// 				}
		// 			}
		// 		}

		// 		if (sectionConfig.widgets) {
		// 			for (i = 0; i < sectionConfig.widgets.length; i++) {
		// 				if (cb(sectionConfig.widgets[i], i, section, isOnScreen)) {
		// 					break;
		// 				}
		// 			}
		// 		}
		// 	}
		// }
		return mo;
	});