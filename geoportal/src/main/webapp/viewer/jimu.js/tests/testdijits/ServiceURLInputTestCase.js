require(['doh/main', 'dojo/parser',
  'dojo/dom', 'dojo/on', 'dojo/Deferred', 'dojo/_base/html',
  'dojo/domReady!', 'dijit/registry', 'jimu/dijit/ServiceURLInput'
], function(doh, parser, dom, on, Deferred, html, domReady, registry, ServiceURLInput) {
  parser.parse().then(function() {
    if (window.currentDijit) {
      window.currentDijit.destroy();
    }
    window.currentDijit = null;
    html.empty('jimuDijitContainer');

    var handle = null,
      errhandle = null;
    var serviceURLInput = new ServiceURLInput();
    serviceURLInput.placeAt('jimuDijitContainer');
    serviceURLInput.startup();
    window.parent.currentDijit = window.currentDijit = serviceURLInput;

    function removeHandle() {
      if (handle && handle.remove) {
        handle.remove();
      }
      if (errhandle && errhandle.remove) {
        errhandle.remove();
      }
    }

    doh.register("request url", [{
      name: 'fetch',
      runTest: function(t) {
        removeHandle();
        var d = new doh.Deferred();

        serviceURLInput.setProcessFunction(function(evt) {
          d.getTestCallback(function() {
            t.t(evt.url === serviceURLInput.get('value'));
            t.t(evt.data.singleLineAddressField.name === "SingleLineCityName");
            // evt.deferred.resolve('succuess');
          })();
          if (evt.data.singleLineAddressField.name === "SingleLineCityName"){
            return true;
          }else {
            return false;
          }
        }, function() {
          d.errback();
        });
        serviceURLInput.set('value', 'https://gis.lmi.is/arcgis/rest/services/GP_service/geocode_thjonusta_single/GeocodeServer');

        return d;
      },
      timeout: 90000
    }, {
      name: 'fetchError',
      runTest: function() {
        removeHandle();
        var d = new doh.Deferred();

        serviceURLInput.setProcessFunction(function() {
          d.errback(true);
        }, function() {
          d.callback(true);
        });
        serviceURLInput.set('value', 'https://gis.lmi.is/arcgis/rest/services/GP_service/geocode_thjonusta_single/GeocodeaServer');

        return d;
      },
      timeout: 90000
    }]);

    doh.run();
  });
});