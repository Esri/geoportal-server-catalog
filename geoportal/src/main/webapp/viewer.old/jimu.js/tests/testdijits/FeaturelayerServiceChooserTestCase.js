require(['doh/main', 'dojo/_base/html', 'dojo/_base/array', 'dojo/on', 'dojo/Deferred', 'dojo/robotx',
		'jimu/dijit/FeaturelayerServiceChooser'
	],
	function(doh, html, array, on, Deferred, robot, FeaturelayerServiceChooser) {
		if (window.currentDijit) {
			window.currentDijit.destroy();
		}
		window.currentDijit = null;
		html.empty('jimuDijitContainer');

		var flsc = new FeaturelayerServiceChooser();
		flsc.placeAt('jimuDijitContainer');
		flsc.startup();

		window.parent.currentDijit = window.currentDijit = flsc;



		doh.register('methods & events', [{
			name: 'layerUrl',

			timeout: 30000,

			runTest: function() {
				var def = new doh.Deferred();

				var url = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/SampleWorldCities/MapServer/0';

				on(flsc, 'ok', function(item) {
					if (item.url === url) {
						def.resolve();
					} else {
						def.reject();
					}
				});

				robot.mouseMoveAt(flsc.btnSetSource, 3000);

				robot.mouseClick({
					left: true
				}, 3000);

				robot.sequence(function() {
					flsc.scc.setUrl(url).then(function() {
						robot.mouseMoveAt(flsc.scc.btnOk, 3000);
						robot.mouseClick({
							left: true
						}, 3000);
					}, function() {
						def.reject();
					});
				}, 3000);

				return def;
			}
		}]);
		doh.run();
	});