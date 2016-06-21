require(['doh/main', 'dojo/_base/html', 'dojo/on', 'dojo/Deferred', 'jimu/dijit/SymbolPicker'],
  function(doh, html, on, Deferred, SymbolPicker) {
    if (window.currentDijit) {
      window.currentDijit.destroy();
    }
    window.currentDijit = null;
    html.empty('jimuDijitContainer');

    var symbolPicker = new SymbolPicker();
    symbolPicker.placeAt('jimuDijitContainer');
    symbolPicker.startup();

    window.parent.currentDijit = window.currentDijit = symbolPicker;

    doh.register("methods", [{
      name: 'showByType marker',

      timeout: 5000,

      setUp: function() {
        symbolPicker.reset();
      },

      runTest: function(t) {
        symbolPicker.showByType('marker');
        var symbol = symbolPicker.getSymbol();
        t.t(symbolPicker.symbolChooser.isSimpleMarkerSymbol(symbol));
      }
    }, {
      name: 'showByType line',

      timeout: 5000,

      setUp: function() {
        symbolPicker.reset();
      },

      runTest: function(t) {
        symbolPicker.showByType('line');
        var symbol = symbolPicker.getSymbol();
        t.t(symbolPicker.symbolChooser.isSimpleLineSymbol(symbol));
      }
    }, {
      name: 'showByType fill',

      timeout: 5000,

      setUp: function() {
        symbolPicker.reset();
      },

      runTest: function(t) {
        symbolPicker.showByType('fill');
        var symbol = symbolPicker.getSymbol();
        t.t(symbolPicker.symbolChooser._isSimpleFillSymbol(symbol));
      }
    }]);

    doh.register("events", [{
      name: 'change',

      timeout: 5000,

      setUp: function() {
        symbolPicker.showByType('marker');
      },

      runTest: function() {
        var d = new doh.Deferred();
        on(symbolPicker, 'change', function(s) {
          if (s) {
            d.resolve();
          } else {
            d.reject();
          }
        });

        var size = symbolPicker.symbolChooser.pointSize.get('value');
        size += 1;
        symbolPicker.symbolChooser.pointSize.set('value', size);

        return d;
      }
    }]);

    doh.run();
  });