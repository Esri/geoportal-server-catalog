require([
		'doh/main', 'dojo/parser', 'dojo/_base/html', 'dojo/query', 'dojo/json',
		'dojo/dom', 'dojo/on', 'dojo/Deferred', 'dijit/registry', 'dojo/robotx',
		'jimu/dijit/GeocodeServiceChooser', 
		'dojo/domReady!'
	],
	function(doh, parser, html, query, dojoJSON, dom, on, Deferred, registry, robot, GeocodeServiceChooser) {
		parser.parse().then(function() {
			if (window.currentDijit) {
				window.currentDijit.destroy();
			}
			window.currentDijit = null;
			html.empty('jimuDijitContainer');

			var serviceChooser = new GeocodeServiceChooser();
			serviceChooser.placeAt('jimuDijitContainer');
			serviceChooser.startup();
			window.parent.currentDijit = window.currentDijit = serviceChooser;

			doh.register('feature', [{
				name: 'ok',
				timeout: 40000,
				runTest: function() {
					var d = new doh.Deferred();

					var serviceUrl = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Locators/Composite_HBR_Asset/GeocodeServer';
					var setSource = serviceChooser.btnSetSource;
					robot.mouseMoveAt(setSource, 500, 200);
					robot.mouseClick({
						left: true,
						middle: false,
						right: false
					});
					robot.sequence(function() {
						serviceChooser.scc.setUrl(serviceUrl).then(function() {
							robot.mouseMoveAt(serviceChooser.scc.btnOk, 500, 100);
							robot.mouseClick({
								left: true,
								middle: false,
								right: false
							}, 500);
						}, function(err) {
							console.error(err);
							d.reject();
						});
					}, 200);
					on(serviceChooser, 'ok', function(data) {
						console.log(data);
						d.resolve();
					});

					return d;
				}
			}, {
				name: 'cancel',
				timeout: 40000,
				runTest: function() {
					var d = new doh.Deferred();

					var setSource = serviceChooser.btnSetSource;
					robot.mouseMoveAt(setSource, 500, 200);
					robot.mouseClick({
						left: true,
						middle: false,
						right: false
					});
					robot.sequence(function() {
						// serviceChooser.scc.setUrl(serviceUrl).then(function(){
						var btnCancel = query('.jimu-btn.cancel', serviceChooser.scc.domNode)[0];
						console.log(btnCancel);
						robot.mouseMoveAt(btnCancel, 500, 100);
						robot.mouseClick({
							left: true,
							middle: false,
							right: false
						}, 500);
					}, 200);
					on(serviceChooser, 'cancel', function(data) {
						console.log(data);
						d.resolve();
					});

					return d;
				}
			}]);

			doh.run();
		});
	});