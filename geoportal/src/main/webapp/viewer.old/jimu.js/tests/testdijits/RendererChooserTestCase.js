require(['doh/main', 'dojo/_base/html', 'dojo/on', 'dojo/Deferred', 'jimu/dijit/RendererChooser'],
  function(doh, html, on, Deferred, RendererChooser) {
    if (window.currentDijit) {
      window.currentDijit.destroy();
    }
    window.currentDijit = null;
    html.empty('jimuDijitContainer');

    var rendererChooser = new RendererChooser();

    window.parent.currentDijit = window.currentDijit = rendererChooser;

    doh.register("methods", [{
      name: 'showByType marker',

      timeout: 5000,

      setUp: function() {
        rendererChooser.reset();
      },

      runTest: function(t) {
        rendererChooser.showByType('marker');
        var renderer = rendererChooser.getRenderer();
        var symbol = renderer.defaultSymbol || renderer.symbol;
        t.t(symbol.type === 'simplemarkersymbol');
      }
    }, {
      name: 'showByType line',

      timeout: 5000,

      setUp: function() {
        rendererChooser.reset();
      },

      runTest: function(t) {
        rendererChooser.showByType('line');
        var renderer = rendererChooser.getRenderer();
        var symbol = renderer.defaultSymbol || renderer.symbol;
        t.t(symbol.type === 'simplelinesymbol');
      }
    }, {
      name: 'showByType fill',

      timeout: 5000,

      setUp: function() {
        rendererChooser.reset();
      },

      runTest: function(t) {
        rendererChooser.showByType('fill');
        var renderer = rendererChooser.getRenderer();
        var symbol = renderer.defaultSymbol || renderer.symbol;
        t.t(symbol.type === 'simplefillsymbol');
      }
    }]);

    doh.run();
  });