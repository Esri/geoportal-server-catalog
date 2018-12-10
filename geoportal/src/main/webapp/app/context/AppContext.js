define(["dojo/_base/declare",
        "dojo/_base/lang",
        "app/context/app-config",
        "app/context/AppUser",
        "esri/basemaps"],
function(declare, lang, appConfig, AppUser, esriBasemaps) {

  var oThisClass = declare(null, {

    appConfig: appConfig,
    appUser: null,
    geoportal: null,
    session: null,

    constructor: function (args) {
      lang.mixin(this, args);
      this.appUser = new AppUser();
      
      
      if (esriBasemaps && this.appConfig && this.appConfig.searchMap && 
          typeof this.appConfig.searchMap.basemap === "string") {
        var basemap = this.appConfig.searchMap.basemap;
        if (basemap.indexOf("http://") === 0 || basemap.indexOf("https://") === 0) {
          esriBasemaps.geoportalCustom = {
            baseMapLayers: [{url: basemap}]
          };
          this.appConfig.searchMap.basemap = "geoportalCustom";
        }
      }
      
    }

  });

  return oThisClass;
});