require([
    'doh/main', 'dojo/_base/html', 'dojo/_base/array', 'jimu/dijit/FeaturelayerServiceBrowser'
  ],
  function(doh, html, array, FeaturelayerServiceBrowser) {
    if (window.currentDijit) {
      window.currentDijit.destroy();
    }
    window.currentDijit = null;
    html.empty('jimuDijitContainer');

    var flsb = new FeaturelayerServiceBrowser();
    flsb.placeAt('jimuDijitContainer');
    flsb.startup();

    window.parent.currentDijit = window.currentDijit = flsb;

    doh.register('setUrl', [{
      name: 'baseUrl',

      timeout: 30000,

      runTest: function() {
        var def = new doh.Deferred();

        var url = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services';

        flsb.setUrl(url).then(function() {
          var allItems = flsb.tree.getFilteredItems(function(item) {
            return item.type !== 'root';
          });
          var allCount = allItems.length;

          var folderItems = array.filter(allItems, function(item) {
            return item.type === 'folder';
          });
          var folderCount = folderItems.length;

          var mapserverItems = array.filter(allItems, function(item) {
            return item.type === 'MapServer';
          });
          var mapserverCount = mapserverItems.length;

          var featureserverItems = array.filter(allItems, function(item) {
            return item.type === 'FeatureServer';
          });
          var featureserverCount = featureserverItems.length;

          var b1 = folderCount === 5;
          var b2 = mapserverCount === 27;
          var b3 = featureserverCount === 16;
          var b4 = allCount === 48;

          var valid = b1 && b2 && b3 && b4;

          if (valid) {
            def.resolve();
          } else {
            def.reject();
          }
        }, function() {
          def.reject();
        });

        return def;
      }
    }, {
      name: 'folderUrl',

      timeout: 30000,

      runTest: function() {
        var url = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Energy';

        var def = new doh.Deferred();

        flsb.setUrl(url).then(function() {
          var allItems = flsb.tree.getFilteredItems(function(item) {
            return item.type !== 'root';
          });
          var allCount = allItems.length;

          var mapserverItems = array.filter(allItems, function(item) {
            return item.type === 'MapServer';
          });
          var mapserverCount = mapserverItems.length;

          var featureserverItems = array.filter(allItems, function(item) {
            return item.type === 'FeatureServer';
          });
          var featureserverCount = featureserverItems.length;

          var b1 = mapserverCount === 3;
          var b2 = featureserverCount === 3;
          var b3 = allCount === 6;

          var valid = b1 && b2 && b3;

          if (valid) {
            def.resolve();
          } else {
            def.reject();
          }
        }, function() {
          def.reject();
        });

        return def;
      }
    }, {
      name: 'groupUrl',

      timeout: 300000,

      runTest: function() {
        var url = 'http://tryitlive.arcgis.com/arcgis/rest/services/GeneralPurpose/MapServer/0';

        var def = new doh.Deferred();

        flsb.setUrl(url).then(function() {
          var allItems = flsb.tree.getFilteredItems(function(item) {
            return item.type !== 'root';
          });
          var allCount = allItems.length;
          var item = allItems[0];

          if (allCount === 1 && item.name === 'Campus' && item.url === url && item.type === 'group') {
            def.resolve();
          } else {
            def.reject();
          }
        }, function() {
          def.reject();
        });

        return def;

      }
    }, {
      name: 'layerUrl',

      timeout: 30000,

      runTest: function() {
        var def = new doh.Deferred();

        var url = 'http://tryitlive.arcgis.com/arcgis/rest/services/GeneralPurpose/MapServer/2';

        flsb.setUrl(url).then(function() {
          var items = flsb.getSelectedItems();
          var item = items[0];
          var valid = item.name === 'FacilitySitePoint_140' && item.url === url;

          if (valid) {
            def.resolve();
          } else {
            def.reject();
          }
        }, function() {
          def.reject();
        });

        return def;
      }
    }]);
    doh.run();
  });