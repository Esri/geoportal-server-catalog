jimuConfig = {};

require({
  packages : [{
    name : "dojo",
    location : "/portal/apps/webappbuilder/stemapp/arcgis-js-api/dojo"
  },{
    name : "dijit",
    location : "/portal/apps/webappbuilder/stemapp/arcgis-js-api/dijit"
  },{
    name : "dojox",
    location : "/portal/apps/webappbuilder/stemapp/arcgis-js-api/dojox"
  },{
    name : "widgets",
    location : "/portal/apps/webappbuilder/stemapp/widgets"
  }, {
    name : "jimu",
    location : "/portal/apps/webappbuilder/stemapp/jimu.js"
  }, {
    name : "doh",
    location : "/portal/apps/webappbuilder/stemapp/arcgis-js-api/util/doh"
  }, {
    name : "esri",
    location : "/portal/apps/webappbuilder/stemapp/arcgis-js-api/esri"
  },{
    location: "/portal/apps/webappbuilder/stemapp/arcgis-js-api/dgrid",
    main: "OnDemandGrid",
    name: "dgrid"
  }, {
    location: "/portal/apps/webappbuilder/stemapp/arcgis-js-api/xstyle",
    main: "css",
    name: "xstyle"
  }, {
    location: "/portal/apps/webappbuilder/stemapp/arcgis-js-api/put-selector",
    main: "put",
    name: "put-selector"
  }]
},['dojo/io-query','dojo/i18n!jimu/nls/main'], function (query, jimuNls) {
  window.jimuNls = jimuNls;
  var search = window.location.search,file;
  file = query.queryToObject(search.substring(1, search.length)).file;
  require(['jimu/tests/' + file]);
});