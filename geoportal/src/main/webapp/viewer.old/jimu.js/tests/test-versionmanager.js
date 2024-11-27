require(["doh/runner",
		'jimu/shared/BaseVersionManager',
		'jimu/shared/AppVersionManager'
	],
	function(doh, BaseVersionManager, AppVersionManager) {
		var manager = new BaseVersionManager();
		var appManager = new AppVersionManager();

		doh.register("version manager tests", [{
			name: 'version has no upgrader',
			runTest: function() {
				var oldConfig, newConfig;
				manager.versions = [{
					version: '1.0'
				}];

				oldConfig = {a: 1};
				//null version and unknow version are the same
				try{
					newConfig = manager.upgrade(oldConfig, null, '111');
				}catch(err){
					doh.assertEqual('New version should higher than old version.', err.message);
				}

				oldConfig = {a: 1};
				newConfig = manager.upgrade(oldConfig, null, '1.0');
				doh.assertEqual(oldConfig, newConfig);
			},
			timeout: 1000
		},{
			name: 'only one version and has upgrader',
			runTest: function() {
				var oldConfig, newConfig;
				manager.versions = [{
					version: '1.0',
					upgrader: function(oldConfig){
						oldConfig.b = 2;
						return oldConfig;
					}
				}];

				oldConfig = {a: 1};
				try{
					newConfig = manager.upgrade(oldConfig, '1.0', '1.0');
				}catch(err){
					doh.assertEqual('New version should higher than old version.', err.message);
				}

				oldConfig = {a: 1};
				newConfig = manager.upgrade(oldConfig, '2.0', '1.0');
				doh.assertEqual({a: 1, b: 2}, newConfig);

				oldConfig = {a: 1};
				newConfig = manager.upgrade(oldConfig, null, '1.0');
				doh.assertEqual({a: 1, b: 2}, newConfig);
			},
			timeout: 1000
		}, {
			name: 'two versions, and they are compatible',
			runTest: function() {
				var oldConfig, newConfig;
				manager.versions = [{
					version: '1.0',
					upgrader: function(oldConfig){
						oldConfig.b = 2;
						return oldConfig;
					}
				}, {
					version: '1.1',
					upgrader: function(oldConfig){
						return oldConfig;
					}
				}];

				oldConfig = {a: 1};
				try{
					newConfig = manager.upgrade(oldConfig, '1.1', '1.0');
				}catch(err){
					doh.assertEqual('New version should higher than old version.', err.message);
				}

				oldConfig = {a: 1};
				newConfig = manager.upgrade(oldConfig, '1.0', '1.1');
				doh.assertEqual(oldConfig, newConfig);
			},
			timeout: 1000
		}, {
			name: 'three versions, upgrade multiple versions',
			runTest: function() {
				var oldConfig, newConfig;
				manager.versions = [{
					version: '1.0',
					upgrader: function(oldConfig){
						oldConfig.b = 2;
						return oldConfig;
					}
				}, {
					version: '1.1',
					upgrader: function(oldConfig){
						return oldConfig;
					}
				}, {
					version: '2.0',
					upgrader: function(oldConfig){
						oldConfig.c = 3;
						return oldConfig;
					}
				}];

				oldConfig = {a: 1};
				newConfig = manager.upgrade(oldConfig, '1.0', '1.1');
				doh.assertEqual(oldConfig, newConfig);

				//upgrade from 1.0 to 1.1, then 2.0
				oldConfig = {a: 1};
				newConfig = manager.upgrade(oldConfig, '1.0', '2.0');
				doh.assertEqual({a: 1, c: 3}, newConfig);

				//upgrade from null to 1.0, then 1.1, then 2.0
				oldConfig = {a: 1};
				newConfig = manager.upgrade(oldConfig, null, '2.0');
				doh.assertEqual({a: 1, b: 2, c: 3}, newConfig);
			},
			timeout: 1000
		}, {
			name: 'framework version compatible',
			runTest: function() {
				var isCompatible;

				appManager.versions = [{
					version: '1.0'
				}, {
					version: '1.1',
					compatible: true
				}, {
					version: '2.0',
					compatible: false
				}];

				isCompatible = appManager.isCompatible('1.0', '1.1');
				doh.assertTrue(isCompatible);

				isCompatible = appManager.isCompatible('1.0', '2.0');
				doh.assertFalse(isCompatible);

				isCompatible = appManager.isCompatible(null, '2.0');
				doh.assertFalse(isCompatible);

				var i = appManager.getVersionIndex('1.1');
				doh.assertEqual(1, i);

				i = appManager.getVersionIndex(null);
				doh.assertEqual(-1, i);

				i = appManager.getVersionIndex('abc');
				doh.assertEqual(-1, i);
			},
			timeout: 1000
		}]);

		doh.runOnLoad();
	});