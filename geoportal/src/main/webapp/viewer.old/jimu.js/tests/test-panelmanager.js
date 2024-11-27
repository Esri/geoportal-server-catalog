require(["doh/runner", 'jimu/PanelManager', 'jimu/WidgetManager', 'dojo/on',
  'dojo/dom-construct', 'dojo/query'],
function(doh, PanelManager, WidgetManager, on, domConstruct, query) {
  window.appInfo = {appPath: '/portal/apps/webappbuilder/stemapp/jimu.js/tests/'};

  jimuConfig = {
    layoutId: 'app-layout'
  };
  function removeAllWidgets(wm) {
    wm.loaded.forEach(function(w) {
      w.destroy();
    });
    wm.loaded = [];
  }

  var pm = PanelManager.getInstance();
  var wm = WidgetManager.getInstance();
  wm.appConfig = {theme: {name: 'a'}};
  domConstruct.create('style', {
    id: 'theme_a_style_common',
    type: "text/css"
  }, document.getElementsByTagName('head')[0]);

  doh.register("panel manager tests", [{
    name: 'test1',
    runTest: function() {

      var dohDeferred = new doh.Deferred();
      var widgetConfig = {
        "id": "testwidget1",
        "label": "label1",
        "uri": "jimu/tests/testwidgets/Widget1/Widget",
        "hasUIFile": false,
        "panel": {
          "uri": "jimu/BaseWidgetPanel",
          "positionRelativeTo": 'browser'
        }
      };

      removeAllWidgets(wm);

      pm.showPanel(widgetConfig).then(function(panel) {
        on(wm, 'widget-created', function(widget){
          if(widget.id === 'testwidget1'){
            dohDeferred.getTestCallback(function(widget) {
              //on open should triggered before resize
              doh.assertEqual('onOpen', widget.testState);

              panel.resize();
              doh.assertEqual('resize', widget.testState);
            })(widget);
          }
        });
      }, function(err) {
        dohDeferred.reject(err);
      });
      return dohDeferred;
    },
    timeout: 3000
  }, {
    name: 'invisible widget in panel',
    runTest: function() {
      var dohDeferred = new doh.Deferred();
      var widgetConfig = {
        widgets: [{
          "id": "testwidget1",
          "label": "label1",
          "uri": "jimu/tests/testwidgets/Widget1/Widget",
          "hasUIFile": false,
          "visible": false
        }, {
          "id": "testwidget2",
          "label": "label2",
          "uri": "jimu/tests/testwidgets/Widget2/Widget"
        }],
        "panel": {
          "uri": "jimu/BaseWidgetPanel",
          "positionRelativeTo": 'browser'
        }
      };

      removeAllWidgets(wm);
      pm.showPanel(widgetConfig).then(function(panel) {
        dohDeferred.getTestCallback(function() {
          doh.assertEqual(1, query('.jimu-widget-frame', panel.domNode).length);
        })();
      });
      return dohDeferred;
    },
    timeout: 3000
  }]);
  doh.runOnLoad();
});