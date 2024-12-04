require(['doh/main', 'dojo/_base/html', 'dojo/on', 'dojo/Deferred', 'dojo/robotx', 'jimu/dijit/GpServiceChooser'],
  function(doh, html, on, Deferred, robot, GpServiceChooser) {
    if (window.currentDijit) {
      window.currentDijit.destroy();
    }
    window.currentDijit = null;
    html.empty('jimuDijitContainer');


    var gpsc = new GpServiceChooser();
    gpsc.placeAt('jimuDijitContainer');
    gpsc.startup();

    window.parent.currentDijit = window.currentDijit = gpsc;

    doh.register('methods & events', [{
      name: 'taskUrl',

      timeout: 30000,

      runTest: function() {
        var def = new doh.Deferred();

        var url = 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/GPServer/PopulationSummary';

        on(gpsc, 'ok', function(item) {
          if (item.url === url) {
            def.resolve();
          } else {
            def.reject();
          }
        });

        robot.mouseMoveAt(gpsc.btnSetSource, 3000);

        robot.mouseClick({
          left: true
        }, 3000);

        robot.sequence(function() {
          gpsc.scc.setUrl(url).then(function() {
            robot.mouseMoveAt(gpsc.scc.btnOk, 3000);
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