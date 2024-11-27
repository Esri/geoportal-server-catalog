define(["doh/runner",
		'jimu/utils',
		'jimu/WidgetManager',
		'dojo/_base/lang',
		'./test-data'
	],
	function(doh, jimuUtils, WidgetManager, lang, testData) {
		/*jshint unused: false*/
		doh.register("agoltemplte tests", [{
			name: 'normal fields test',
			runTest: function() {
				var expectValue;
				var appConfig = getAppConfig();
				// expectValue = "";
				expectValue = "new_keyTitle";
				jimuUtils.setConfigByTemplateWithId(appConfig, testData.keyTitle, expectValue);
				doh.assertEqual(expectValue, appConfig.title);

				expectValue = "new_keySubTitle";
				jimuUtils.setConfigByTemplateWithId(appConfig, testData.keySubtitle, expectValue);
				doh.assertEqual(expectValue, appConfig.subtitle);

				expectValue = "new_keyLinksLabel";
				jimuUtils.setConfigByTemplateWithId(appConfig, testData.keyLinksLabel, expectValue);
				doh.assertEqual(expectValue, appConfig.links[0].label);
			},
			timeout: 1000
		},{
			name: 'widget fields test',
			runTest: function() {
				/********************************
				 *Test Purpose:
				 *  To set field in widget(does not belong widgetConfig).
				 *Expect Result:
				 *	The field take effect.
				 ********************************/
				var expectValue;
				var appConfig = getAppConfig();
				////////////////////////////////////
				// Condition1:
				//   Widget is theme widget.
				// Expect Result:
				//   Widget field take effect.
				////////////////////////////////////
				expectValue = "new_keyWidgetOnScreen3";
				jimuUtils.setConfigByTemplateWithId(appConfig, testData.keyWidgetOnScreen3, expectValue);
				doh.assertEqual(expectValue, appConfig.widgetOnScreen.widgets[0].uri);

				////////////////////////////////////
				// Condition2:
				//   Widget in WidgetOnScreen.
				// Expect Result:
				//   Widget field take effect.
				////////////////////////////////////
				expectValue = "new_keyWidgetOnScreen5";
				jimuUtils.setConfigByTemplateWithId(appConfig, testData.keyWidgetOnScreen5, expectValue);
				doh.assertEqual(expectValue, appConfig.widgetOnScreen.widgets[3].position.bottom);

				////////////////////////////////////
				// Condition3:
				//   Widget in WidgetPool.
				// Expect Result:
				//   Widget field take effect.
				////////////////////////////////////
				expectValue = "new_keyWidgetPollLayerList5";
				jimuUtils.setConfigByTemplateWithId(appConfig, testData.keyWidgetPollLayerList5, expectValue);
				doh.assertEqual(expectValue, appConfig.widgetPool.widgets[1].label);

			},
			timeout: 1000
		},{
			name: 'widgetConfig has not been loaded test',
			runTest: function() {
				/********************************
				 *Test Purpose:
				 *  To set field of widgetCofing when config has not been loaded.
				 *Expect Result:
				 *	The widget.config field does not take effect.
				 ********************************/
				var oldValue, newValue;
				var appConfig = getAppConfig();
				oldValue = appConfig.widgetPool.widgets[1].config;
				newValue = "new_keyWidgetPollLayerListConfig";

				////////////////////////////////////
				// Condition1:
				//   Because of setConfigByTemplateWithId() method does not merge field of widgetConfig.
				// Expect Result:
				//   Widget.config field does not take effect.
				////////////////////////////////////
				jimuUtils.setConfigByTemplateWithId(appConfig, testData.keyWidgetPollLayerListConfig, newValue);
				doh.assertEqual(oldValue, appConfig.widgetPool.widgets[1].config);

				////////////////////////////////////
				// Condition2:
				//   Use WidgetMamager._mergeAgolConfig() method to set field of widgetConig.
				//   However, the widgetConfig has not been loaded at this time.
				// Expect Result:
				//   Widget.config field does not take effect.
				////////////////////////////////////
				var values = {
					'app_widgetPool_widgets[widgets/LayerList/Widget_14]_config_showLegend': newValue
				};
				var widgetManger = getWidgetManger(values);
				widgetManger._mergeAgolConfig(appConfig.widgetPool.widgets[1]);
				doh.assertEqual(oldValue, appConfig.widgetPool.widgets[1].config);

			},
			timeout: 1000
		},{
			name: 'widgetConfig field test',
			runTest: function() {
				/********************************
				 *Test Purpose:
				 *  To set field of widgetCofing after config has been loaded.
				 *Expect Result:
				 *	The widget.config field take effect.
				 ********************************/
				var oldValue, newValue;
				var appConfig = getAppConfig();

				newValue = "new_keyWidgetPollLayerListConfig";
				// Set widget config object to simulate config loading.
				appConfig.widgetPool.widgets[1].config = loadWidgetConfig("_layerListConfig");
				oldValue = appConfig.widgetPool.widgets[1].config.showLegend;
				////////////////////////////////////
				// Condition1:
				//   Because of setConfigByTemplateWithId() method does not merge field of widgetConfig.
				// Expect Result:
				//   Widget.config field does not take effect.
				////////////////////////////////////
				jimuUtils.setConfigByTemplateWithId(appConfig, testData.keyWidgetPollLayerListConfig, newValue);
				doh.assertEqual(oldValue, appConfig.widgetPool.widgets[1].config.showLegend);

				////////////////////////////////////
				// Condition2:
				//   Use WidgetMamager._mergeAgolConfig() method to set field of widgetConig.
				//   the widget.config object has been loaded.
				// Expect Result:
				//   Widget.config field take effect.
				////////////////////////////////////
				var values = {
					'app_widgetPool_widgets[widgets/LayerList/Widget_14]_config_showLegend': newValue
				};
				var widgetManger = getWidgetManger(values);
				widgetManger._mergeAgolConfig(appConfig.widgetPool.widgets[1]);
				doh.assertEqual(newValue, appConfig.widgetPool.widgets[1].config.showLegend);

			},
			timeout: 1000
		},{
			name: 'group fields test',
			runTest: function() {
				/********************************
				 *Test Purpose:
				 *  To set field in group.
				 *Expect Result:
				 *	The field take effect.
				 ********************************/
				var oldValue, newValue;
				var appConfig = getAppConfig();
				////////////////////////////////////
				// Condition1:
				//   Field in group(does not belong widget of groups).
				// Expect Result:
				//   Group field take effect.
				////////////////////////////////////
				newValue = "new_keyGroup2";
				jimuUtils.setConfigByTemplateWithId(appConfig, testData.keyGroup2, newValue);
				doh.assertEqual(newValue, appConfig.widgetPool.groups[0].label);

				////////////////////////////////////
				// Condition2:
				//   Field in group's widget(does not belong widget.config of groups).
				// Expect Result:
				//   Field take effect.
				////////////////////////////////////
				newValue = "new_keyGroupWidget2";
				jimuUtils.setConfigByTemplateWithId(appConfig, testData.keyGroupWidget2, newValue);
				doh.assertEqual(newValue, appConfig.widgetPool.groups[1].widgets[2].name);

				////////////////////////////////////
				// Condition3:
				//   Set field of widget.conig of group. Use WidgetMamager._mergeAgolConfig() method.
				//   However, the widget.config has not been loaded at this time.
				// Expect Result:
				//   Widget.config field does not take effect.
				////////////////////////////////////
				newValue = "new_keyGroupWidget6";
				oldValue = appConfig.widgetPool.groups[1].widgets[2].config;
				var values = {
					'app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]_config_basemapGallery_basemaps[0]_thumbnailUrl': newValue
				};
				var widgetManger = getWidgetManger(values);
				widgetManger._mergeAgolConfig(appConfig.widgetPool.groups[1].widgets[2]);
				doh.assertEqual(oldValue, appConfig.widgetPool.groups[1].widgets[2].config);

				////////////////////////////////////
				// Condition3:
				//   Set field of widget.conig of group. Use WidgetMamager._mergeAgolConfig() method.
				//   However, the widget.config has been loaded at this time.
				// Expect Result:
				//   Field of widget.config in group take effect.
				////////////////////////////////////
				newValue = "new_keyGroupWidgetConfig7";
				appConfig.widgetPool.groups[1].widgets[2].config = loadWidgetConfig("_basemapGalleryConfigId30");
				var values = {
					"app_widgetPool_groups[_29]_widgets[widgets/BasemapGallery/Widget_30]_config_basemapGallery_basemaps[0]_thumbnailUrl": newValue
				};

				widgetManger = getWidgetManger(values);
				widgetManger._mergeAgolConfig(appConfig.widgetPool.groups[1].widgets[2]);
				doh.assertEqual(newValue, appConfig.widgetPool.groups[1].widgets[2].config.basemapGallery.basemaps[0].thumbnailUrl);
			},
			timeout: 1000
		}]);

		doh.runOnLoad();

		/******************************
		 * Public Methods
		 ******************************/
		// get clone of appConfig
		function getAppConfig() {
			var appConfigClone = lang.clone(testData._appConfig);
			appConfigClone.getConfigElementById = function(id) {
				return function(config, id) {
					var c;
					if (id === 'map') {
						return config.map;
					}
					visitElement(config, function(e) {
						if (e.id === id) {
							c = e;
							return true;
						}
					});
					return c;
				}(appConfigClone, id);
			};
			return appConfigClone;
		}

		//Prepare WidgetManger object.
		function getWidgetManger(values) {
			var widgetManger = new WidgetManager();
			widgetManger.appConfig = getAppConfig();
			widgetManger.appConfig.agolConfig = {
				'values': values
			};
			return widgetManger;
		}

		// Simulate to load widgetConfig
		function loadWidgetConfig(name) {
			switch(name) {
			case '_layerListConfig':
				return testData._layerListConfig;
			case '_basemapGalleryConfigId19':
				return testData._basemapGalleryConfigId19;
			case '_basemapGalleryConfigId30':
				return testData._basemapGalleryConfigId30;
			}
		}

		function visitElement(config, cb) {
			//the cb signature: cb(element, index, groupId, isOnScreen), the groupId can be:
			//groupId, widgetOnScreen, widgetPool
			visitBigSection('widgetOnScreen', cb);
			visitBigSection('widgetPool', cb);

			function visitBigSection(section, cb) {
				var i, j, sectionConfig = config[section],
					isOnScreen = (section === 'widgetOnScreen');
				if (!sectionConfig) {
					return;
				}
				if (sectionConfig.groups) {
					for (i = 0; i < sectionConfig.groups.length; i++) {
						if (cb(sectionConfig.groups[i], i, sectionConfig.groups[i].id, isOnScreen)) {
							break;
						}
						for (j = 0; j < sectionConfig.groups[i].widgets.length; j++) {
							if (cb(sectionConfig.groups[i].widgets[j], j, sectionConfig.groups[i].id, isOnScreen)) {
								break;
							}
						}
					}
				}

				if (sectionConfig.widgets) {
					for (i = 0; i < sectionConfig.widgets.length; i++) {
						if (cb(sectionConfig.widgets[i], i, section, isOnScreen)) {
							break;
						}
					}
				}
			}
		}

	});