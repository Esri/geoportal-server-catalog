define(["dojo/_base/declare",
        "dojo/_base/lang",
        "app/context/app-config",
        "app/context/AppUser"],
function(declare, lang, appConfig, AppUser) {

  var oThisClass = declare(null, {

    appConfig: appConfig,
    appUser: null,
    geoportal: null,
    session: null,

    constructor: function (args) {
      lang.mixin(this, args);
      this.appUser = new AppUser();
    }

  });

  return oThisClass;
});