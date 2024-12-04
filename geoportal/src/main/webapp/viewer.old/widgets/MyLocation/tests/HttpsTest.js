define([
  'intern/chai!assert',
  'intern!bdd',
  'dojo/_base/html',
  'dojo/promise/all',
  'dojo/query',
  'dojo/on',
  'testjimu/WidgetManager',
  'jimu/utils',
  'testjimu/globals'
], function(assert, bdd, html, all, query, on, TestWidgetManager, jimuUtils) {

  var widgetJson = {
    id: 'MyLocation1',
    uri: 'widgets/MyLocation/Widget'
  };

  bdd.describe('MyLocation httpsTest', function() {
    var wm, map;
    var _isNeedHttpsButNot = null;
    bdd.before(function() {
      wm = TestWidgetManager.getInstance();
      map = TestWidgetManager.getDefaultMap();
      map.setExtent = function() {};
      wm.prepare('theme1', map);

      //in Chrome>=50 window.isSecureContext = false;
      _isNeedHttpsButNot = jimuUtils.isNeedHttpsButNot();
    });

    bdd.beforeEach(function() {
      wm.destroyWidget('MyLocation1');
    });

    //MyLocation in Chrome 50 only supports HTTPS,#6136
    bdd.it('nohttps', function() {
      widgetJson.config = {};
      return wm.loadWidget(widgetJson).then(function(widget) {
        wm.openWidget(widget);
        assert.strictEqual(html.hasClass(query('.place-holder', widget.domNode)[0], 'nohttps'), _isNeedHttpsButNot);
        var title = html.attr(query('.place-holder', widget.domNode)[0], 'title');
        assert.strictEqual(title === widget.nls.httpNotSupportError, _isNeedHttpsButNot);
      });
    });
  });
});