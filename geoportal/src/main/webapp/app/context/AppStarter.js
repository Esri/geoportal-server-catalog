define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "dojo/_base/fx",
        "dojo/topic",
        "app/context/app-topics",
        "app/context/AppClient",
        "app/main/App"],
function(declare, lang, domConstruct, fx, topic, appTopics, AppClient, App) {
  const GPT_ACCESS_TOKEN_COOKIE_NAME = "GPT_access_token";

  var oThisClass = declare(null, {

    constructor: function(args) {
      lang.mixin(this,args);
    },

    // retry: falsy unless calling reentrantly after a 401
    startupApp: function(retry) {
      
      const self = this;

      var showApp = function() {
        var app = new App({},"app");
        app.startup();
        fx.fadeOut({
          node: "app-loading-node",
          onEnd: function() {
            domConstruct.destroy("app-loading-node");
            topic.publish(appTopics.AppStarted, {});
          }
        }).play();
      };
      
      var showErr = function(_) {
        domConstruct.empty("app-loading-node");
        domConstruct.create("h3",{
          "class": "text-center g-error",
          innerHTML: "Error loading page"
        },"app-loading-node");
      };

      var client = new AppClient();
      const match = document.cookie.match(new RegExp('(^| )' + GPT_ACCESS_TOKEN_COOKIE_NAME + '=([^;]+)'));
      const tokenData = match ? match[2] : null;
      
      client.pingGeoportal(tokenData).then(function(geoportal){
        //console.warn("geoportal",geoportal);
        if (!geoportal) geoportal = {};
        if (window) window.geoportalServiceInfo = geoportal; // to use for child iframes
        AppContext.geoportal = geoportal;
        AppContext.appUser.geoportalUser = geoportal.user;
        AppContext.appUser.whenAppStarted().then(function(){
          showApp();
        }).otherwise(function(_){
          showApp();
        });
      }).otherwise(function(err){
        if(!retry && err && err.response && err.response.status === 401) {
          console.warn("Token invalid/expired, deleting cookie and retrying");
          document.cookie = GPT_ACCESS_TOKEN_COOKIE_NAME + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
          self.startupApp(true);
        } else {
          showErr(err);
          console.error("Unable to connect to server.");
          console.error(err);
        }
      });
    }

  });

  return oThisClass;
});
