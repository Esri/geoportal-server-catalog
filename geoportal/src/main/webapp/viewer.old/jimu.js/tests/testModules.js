define([
  'doh/main', 'require', 'dojo/io-query'
], function(doh, require, ioquery) {
  var url = '/portal/apps/webappbuilder/stemapp/jimu.js/tests/my-test-loader.html';

  var search = window.location.search;
  var queryObject = ioquery.queryToObject(search.substring(1, search.length));

  if(queryObject.testfile){
    doh.register(queryObject.testfile,url + "?file=" + queryObject.testfile,900000);
    return;
  }
  doh.register('widget manager tests',url + "?file=test-widgetmanager",30000);
  doh.register('data manager tests',url + "?file=test-datamanager",30000);
  doh.register('version manager tests',url + "?file=test-versionmanager",30000);
  doh.register('utils tests',url + "?file=test-utils",30000);
  doh.register('order loader tests',url + "?file=test-order-loader",30000);
  doh.register('AGOLTemplate tests',url + "?file=testagoltemplate/test-agoltemplate",30000);

  // test dijits
  doh.register('jimu.dijit.Filter', url + "?file=testdijits/FilterTestCase", 900000);
  doh.register('jimu.dijit.SymbolChooser', url + "?file=testdijits/SymbolChooserTestCase", 999000);
  doh.register('jimu.dijit.SymbolPicker', url + "?file=testdijits/SymbolPickerTestCase", 999000);
  doh.register('jimu.dijit.RendererChooser', url + "?file=testdijits/RendererChooserTestCase", 999000);
  doh.register('jimu.dijit.FeaturelayerServiceBrowser', url + "?file=testdijits/FeaturelayerServiceBrowserTestCase", 900000);
  doh.register('jimu.dijit.GpServiceBrowser', url + "?file=testdijits/GpServiceBrowserTestCase", 999000);
  doh.register('jimu.dijit.LayerFieldChooser', url + "?file=testdijits/LayerFieldChooserTestCase", 90000);
  doh.register('jimu.dijit.Popup', url + "?file=testdijits/PopupTestCase", 900000);
  doh.register('jimu.dijit.ServiceURLInput', url + "?file=testdijits/ServiceURLInputTestCase", 900000);
  doh.register('jimu.dijit.GpServiceBrowser', url + "?file=testdijits/GpServiceBrowserTestCase", 999000);


  //robot
  // doh.register('jimu.dijit.GpServiceChooser', url + "?file=testdijits/GpServiceChooserTestCase", 999000);
  // doh.register('jimu.dijit.FeaturelayerServiceChooser', url + "?file=testdijits/FeaturelayerServiceChooserTestCase", 999000);
  // doh.register('jimu.dijit.GeocodeServiceBrowser', url + "?file=testdijits/GeocodeServiceBrowserTestCase", 900000);
  // doh.register('jimu.dijit.GeocodeServiceChooser', url + "?file=testdijits/GeocodeServiceChooserTestCase", 900000);
  // doh.register('jimu.dijit.SimpleTable', url + "?file=testdijits/SimpleTableTestCase", 900000);
});