require([
		'doh/main', 'dojo/parser', 'dojo/_base/html', 'dojo/query', 'dojo/json',
		'dojo/dom', 'dojo/on', 'dojo/Deferred', 'dijit/registry',
		'jimu/dijit/LayerFieldChooser', 'jimu/utils',
		'dojo/domReady!'
	],
	function(doh, parser, html, query, dojoJSON, dom, on, Deferred, registry, LayerFieldChooser, utils) {
		parser.parse().then(function() {

			if (window.currentDijit) {
				window.currentDijit.destroy();
			}
			window.currentDijit = null;
			html.empty('jimuDijitContainer');

			

			var fieldsStr = '[{"name":"objectid","type":"esriFieldTypeOID","alias":"OBJECTID","domain":null,"editable":false,"nullable":false},{"name":"symbolid","type":"esriFieldTypeSmallInteger","alias":"symbolID","domain":null,"editable":true,"nullable":true},{"name":"description","type":"esriFieldTypeString","alias":"Description","domain":null,"editable":true,"nullable":true,"length":75},{"name":"created_user","type":"esriFieldTypeString","alias":"created_user","domain":null,"editable":false,"nullable":true,"length":255},{"name":"created_date","type":"esriFieldTypeDate","alias":"created_date","domain":null,"editable":false,"nullable":true,"length":36},{"name":"last_edited_user","type":"esriFieldTypeString","alias":"last_edited_user","domain":null,"editable":false,"nullable":true,"length":255},{"name":"last_edited_date","type":"esriFieldTypeDate","alias":"last_edited_date","domain":null,"editable":false,"nullable":true,"length":36}]';
			// var anchorDiv = document.getElementById('anchorDiv');
			var layerFieldChooser = new LayerFieldChooser({
				fieldType: 'number'
			});
			layerFieldChooser.placeAt('jimuDijitContainer');
			layerFieldChooser.startup();

			window.parent.currentDijit = window.currentDijit = layerFieldChooser;

			doh.register('feature', [{
				name: 'setFieldItems',
				timeout: 4000,
				runTest: function(t) {
					var fields = dojoJSON.parse(fieldsStr);
					layerFieldChooser.setFieldItems(fields);

					var datas = layerFieldChooser.getData();

					// t.t(datas[0].name === 'objectid');
					t.t(datas[0].name === 'symbolid');
				},
				tearDown: function() {
					layerFieldChooser.clear();
				}
			}, {
				name: 'fieldType',
				timeout: 4000,
				setUp: function() {
					layerFieldChooser.fieldType = 'string';
				},
				runTest: function(t) {
					var fields = dojoJSON.parse(fieldsStr);
					layerFieldChooser.setFieldItems(fields);

					var datas = layerFieldChooser.getData();

					t.t(datas[0].name === 'description');
					t.t(datas[1].name === 'created_user');
					t.t(datas[2].name === 'last_edited_user');
				},
				tearDown: function() {
					layerFieldChooser.fieldType = 'number';
					layerFieldChooser.clear();
				}
			}, {
				name: 'refresh',
				timeout: 30000,
				runTest: function(t) {
					var d = new doh.Deferred();

					this.handle = on(layerFieldChooser, 'Refreshed', function(response) {
						var datas = layerFieldChooser.getData();

						d.getTestCallback(function() {
							t.t(utils.isEqual(response, layerFieldChooser.getLayerInfo()));
							t.t(datas[0].name === 'rotation');
							t.t(datas[1].name === 'eventtype');
						})();
					})
					layerFieldChooser.refresh('http://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/FeatureServer/0');

					return d;
				},
				tearDown: function() {
					this.handle.remove();
					layerFieldChooser.clear();
				}
			}]);

			doh.run();
		});
	});