define([
  'intern/chai!assert',
  'intern!bdd',
  'dojo/_base/html',
  'dojo/promise/all',
  'dojo/query',
  'dojo/on',
  "esri/map",
  "esri/geometry/Extent",
  'testjimu/WidgetManager',
  'jimu/utils',
  'testjimu/globals'
], function(assert, bdd, html, all, query, on, Map, Extent, TestWidgetManager) {

  var widgetJson = {
    id: 'HomeButton1',
    uri: 'widgets/HomeButton/Widget'
  };

  bdd.describe('HomeButton clcikTest', function() {
    var wm, map,
      startExtent;
    bdd.before(function() {
      wm = TestWidgetManager.getInstance();
      //map = TestWidgetManager.getDefaultMap();
      map = new Map(document.getElementsByTagName('body')[0], {
        center: [-56.049, 38.485], zoom: 3
      });
      startExtent = new Extent({
        "xmin": -122.68, "ymin": 45.53, "xmax": -122.45, "ymax": 45.6, "spatialReference": {"wkid": 4326}
      });
      map.setExtent(startExtent);

      wm.prepare('theme1', map);
    });

    bdd.beforeEach(function() {
      wm.destroyWidget('HomeButton1');
    });

    //add home class
    bdd.it('add inHome', function() {
      widgetJson.config = {};
      return wm.loadWidget(widgetJson).then(function(widget) {
        wm.openWidget(widget);
        return widget.homeDijit.home().then(function() {
          assert.strictEqual(html.hasClass(widget.domNode, 'inHome'), true);
        });
      });
    });

    //extent
    bdd.it('restore extent to initExtent', function() {
      widgetJson.config = {};
      //1.init extent for homeBtn
      console.log("init extent for homeBtn", map.extent);

      return wm.loadWidget(widgetJson).then(function(widget) {
        wm.openWidget(widget);

        //2.set a extent to map
        map.setExtent(new Extent({
          "xmin": -100, "ymin": 100, "xmax": -100, "ymax": 100, "spatialReference": {"wkid": 4326}
        })).then(function() {
          console.log("set a extent to map==>", map.extent);

          //3.restore extent to initExtent
          return widget.homeDijit.home().then(function() {
            console.log("restore extent to initExtent==>", map.extent);
            assert.strictEqual(startExtent.extent.xmin === map.extent.xmin, true);
            assert.strictEqual(startExtent.extent.ymin === map.extent.ymin, true);
            assert.strictEqual(startExtent.extent.xmax === map.extent.xmax, true);
            assert.strictEqual(startExtent.extent.ymax === map.extent.ymax, true);
            assert.strictEqual(startExtent.extent.spatialReference === map.extent.spatialReference, true);
          });
        });
      });
    });
  });
});