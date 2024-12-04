require([
    'doh/main', 'dojo/_base/html', 'dojo/_base/array', 'dojo/on', 'dojo/Deferred', 'jimu/dijit/GpServiceBrowser'
  ],
  function(doh, html, array, on, Deferred, GpServiceBrowser) {
    if(window.currentDijit){
      window.currentDijit.destroy();
    }
    window.currentDijit = null;
    html.empty('jimuDijitContainer');

    var gpsb = new GpServiceBrowser();
    gpsb.placeAt('jimuDijitContainer');
    gpsb.startup();

    window.parent.currentDijit = window.currentDijit = gpsb;

    doh.register('setUrl', [{
      name: 'baseUrl',

      timeout: 30000,

      runTest: function() {
        var def = new doh.Deferred();

        var url = 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services';

        gpsb.setUrl(url).then(function() {
          var allItems = gpsb.tree.getFilteredItems(function(item) {
            return item.type !== 'root';
          });
          var allCount = allItems.length;

          var folderItems = array.filter(allItems, function(item) {
            return item.type === 'folder';
          });
          var folderCount = folderItems.length;

          var b1 = allCount === 4;
          var b2 = folderCount === 4;
          var valid = b1 && b2;

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
        var url = 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics';

        var def = new doh.Deferred();

        gpsb.setUrl(url).then(function() {
          var allItems = gpsb.tree.getFilteredItems(function(item) {
            return item.type !== 'root';
          });
          var allCount = allItems.length;

          var gpserverItems = array.filter(allItems, function(item) {
            return item.type === 'GPServer';
          });
          var gapserverCount = gpserverItems.length;

          var b1 = allCount === 1;
          var b2 = gapserverCount === 1;
          var valid = b1 && b2;

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
      name: 'gpserverUrl',

      timeout: 300000,

      runTest: function() {
        var url = 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/GPServer';

        var def = new doh.Deferred();

        gpsb.setUrl(url).then(function() {
          var allItems = gpsb.tree.getFilteredItems(function(item) {
            return item.type !== 'root';
          });

          var allCount = allItems.length;
          var item = allItems[0];
          if (allCount === 1 && item.name === 'ESRI_Population_World' && item.url === url && item.type === 'GPServer') {
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
      name: 'taskUrl',

      timeout: 30000,

      runTest: function() {
        var def = new doh.Deferred();

        var url = 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/GPServer/PopulationSummary';

        gpsb.setUrl(url).then(function() {
          var items = gpsb.getSelectedItems();
          var item = items[0];
          var b1 = items.length === 1;
          var b2 = item.name === 'PopulationSummary' && item.url === url;
          var b = b1 && b2;

          if (b) {
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