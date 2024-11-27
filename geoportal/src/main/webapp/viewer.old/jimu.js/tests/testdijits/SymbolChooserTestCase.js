require(['doh/main', 'dojo/_base/html', 'dojo/on', 'dojo/Deferred', 'jimu/dijit/SymbolChooser'],
  function(doh, html, on, Deferred, SymbolChooser) {
    if(window.currentDijit){
      window.currentDijit.destroy();
    }
    window.currentDijit = null;
    html.empty('jimuDijitContainer');

    var symbolChooser = new SymbolChooser();
    symbolChooser.placeAt('jimuDijitContainer');
    symbolChooser.startup();

    window.parent.currentDijit = window.currentDijit = symbolChooser;

    doh.register("methods", [{
      name: 'showByType marker',

      timeout: 5000,

      setUp: function() {
        symbolChooser.reset();
      },

      runTest: function(t) {
        symbolChooser.showByType('marker');
        var symbol = symbolChooser.getSymbol();
        t.t(symbolChooser.isSimpleMarkerSymbol(symbol));
      }
    }, {
      name: 'showByType line',

      timeout: 5000,

      setUp: function() {
        symbolChooser.reset();
      },

      runTest: function(t) {
        symbolChooser.showByType('line');
        var symbol = symbolChooser.getSymbol();
        t.t(symbolChooser.isSimpleLineSymbol(symbol));
      }
    }, {
      name: 'showByType fill',

      timeout: 5000,

      setUp: function() {
        symbolChooser.reset();
      },

      runTest: function(t) {
        symbolChooser.showByType('fill');
        var symbol = symbolChooser.getSymbol();
        t.t(symbolChooser._isSimpleFillSymbol(symbol));
      }
    }]);

    doh.register("events", [{
      name: 'change',

      timeout: 5000,

      setUp: function() {
        symbolChooser.showByType('marker');
      },

      runTest: function() {
        var d = new doh.Deferred();
        on(symbolChooser, 'change', function(s) {
          if (s) {
            d.resolve();
          } else {
            d.reject();
          }
        });

        var size = symbolChooser.pointSize.get('value');
        size += 1;
        symbolChooser.pointSize.set('value', size);

        return d;
      }
    }]);

    doh.run();
  });