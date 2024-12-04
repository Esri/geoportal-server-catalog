require([
		'doh/main', 'dojo/parser', 'dojo/_base/html', 'dojo/_base/lang', 'dojo/query', 'dojo/json',
		'dojo/dom', 'dojo/on', 'dojo/Deferred', 'dijit/registry', 'dojo/robotx',
		'jimu/dijit/GeocodeServiceBrowser',
		'dojo/domReady!'
	],
	function(doh, parser, html, lang, query, dojoJSON, dom, on, Deferred, registry, robot, GeocodeServiceBrowser) {
		parser.parse().then(function() {
			if (window.currentDijit) {
				window.currentDijit.destroy();
			}
			window.currentDijit = null;
			html.empty('jimuDijitContainer');


			var serviceBrowser = new GeocodeServiceBrowser();
			// var anchorDiv = document.getElementById('anchorDiv');
			serviceBrowser.placeAt('jimuDijitContainer');
			serviceBrowser.startup();
			window.parent.currentDijit = window.currentDijit = serviceBrowser;

			doh.register('feature', [{
				name: 'geocodeServer',
				timeout: 30000,
				runTest: function(t) {
					var d = new doh.Deferred();

					var serviceUrl = 'http://tryitlive.arcgis.com/arcgis/rest/services/GeneralPurpose/MapServer/2';
					serviceBrowser.setUrl(serviceUrl).then(function() {
						var nodes = serviceBrowser.getSelectedItems();
						d.getTestCallback(function() {
							t.t(nodes.length === 0);
						})();
					}, function(err) {
						console.error(err);
						d.callback();
					});

					return d;
				}
			}, {
				name: 'getSelectedItems',
				timeout: 30000,
				runTest: function(t) {
					var d = new doh.Deferred();

					var serviceUrl = 'http://gis.lmi.is/arcgis/rest/services/GP_service/geocode_thjonusta_single/GeocodeServer';
					serviceBrowser.setUrl(serviceUrl).then(function() {
						var nodes = serviceBrowser.getSelectedItems();
						d.getTestCallback(function() {
							t.t(nodes.length === 1);
							t.t(nodes[0].name === "geocode_thjonusta_single");
							t.t(nodes[0].url === serviceUrl);
						})();
					}, function(err) {
						console.error(err);
						d.reject();
					});

					return d;
				}
			}, {
				name: 'single',
				timeout: 30000,
				runTest: function(t) {
					var d = new doh.Deferred();

					var serviceUrl = 'http://gis.lmi.is/arcgis/rest/services/GP_service';
					serviceBrowser.setUrl(serviceUrl).then(function() {
						// var nodes = serviceBrowser.tree.getAllItems();
						var checkNodes = query('.jimu-tree-check-node', serviceBrowser.domNode);
						console.log(checkNodes);
						robot.mouseMoveAt(checkNodes[1], 500, 100);
						robot.mouseClick({
							left: true,
							middle: false,
							right: false
						}, 500);

						robot.mouseMoveAt(checkNodes[2], 500, 100);
						robot.mouseClick({
							left: true,
							middle: false,
							right: false
						}, 500);

						robot.sequence(d.getTestCallback(function() {
							var selectedItems = serviceBrowser.getSelectedItems();
							console.log(selectedItems);
							t.t(selectedItems.length === 1);
						}), 2000);
					}, function(err) {
						console.error(err);
						d.reject();
					});

					return d;
				}
			}, {
				name: 'multiple',
				timeout: 30000,
				setUp: function() {
					if (window.currentDijit) {
						window.currentDijit.destroy();
					}
					window.currentDijit = null;
					html.empty('jimuDijitContainer');


					this.serviceBrowser = new GeocodeServiceBrowser({
						multiple: true
					});
					// var anchorDiv = document.getElementById('anchorDiv');
					this.serviceBrowser.placeAt('jimuDijitContainer');
					this.serviceBrowser.startup();
					window.parent.currentDijit = window.currentDijit = this.serviceBrowser;
				},
				runTest: function(t) {
					var d = new doh.Deferred();

					var serviceUrl = 'http://gis.lmi.is/arcgis/rest/services/GP_service';
					this.serviceBrowser.setUrl(serviceUrl).then(lang.hitch(this, function() {
						// var nodes = serviceBrowser.tree.getAllItems();
						var checkNodes = query('.jimu-tree-check-node', this.serviceBrowser.domNode);
						console.log(checkNodes);
						robot.mouseMoveAt(checkNodes[1], 500, 100);
						robot.mouseClick({
							left: true,
							middle: false,
							right: false
						}, 500);

						robot.mouseMoveAt(checkNodes[3], 500, 100);
						robot.mouseClick({
							left: true,
							middle: false,
							right: false
						}, 500);

						robot.sequence(d.getTestCallback(lang.hitch(this, function() {
							var selectedItems = this.serviceBrowser.getSelectedItems();
							console.log(selectedItems);
							t.t(selectedItems.length === 2);
						})), 2000);
					}), function(err) {
						console.error(err);
						d.reject();
					});

					return d;
				}
			}, {
				name: 'valid Url',
				timeout: 30000,
				setUp: function() {
					if (window.currentDijit) {
						window.currentDijit.destroy();
					}
					window.currentDijit = null;
					html.empty('jimuDijitContainer');

					this.serviceBrowser = new GeocodeServiceBrowser();
					// var anchorDiv = document.getElementById('anchorDiv');
					this.serviceBrowser.placeAt('jimuDijitContainer');
					this.serviceBrowser.startup();
					window.parent.currentDijit = window.currentDijit = this.serviceBrowser;
				},
				runTest: function() {
					var d = new doh.Deferred();

					var serviceUrl = 'http://tryitlive.arcgis.com/arcgis/rest/services/GeneralPurpose/MapServerr/2';
					this.serviceBrowser.setUrl(serviceUrl).then(lang.hitch(this, function() {
						d.errback();
					}), function(err) {
						console.error(err);
						d.callback();
					});

					return d;
				}
			}]);
			doh.run();
		});
	});