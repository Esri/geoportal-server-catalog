define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "dojo/_base/fx",
        "dojo/topic",
        "app/context/app-topics",
        "app/context/AppClient",
        "app/main/App"],
function(declare, lang, domConstruct, fx, topic, appTopics, AppClient, App) {

  var oThisClass = declare(null, {

    constructor: function(args) {
      lang.mixin(this,args);
    },

    startupApp: function() {
      
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
      
      var showErr = function(err) {
        domConstruct.empty("app-loading-node");
        domConstruct.create("h3",{
          "class": "text-center g-error",
          innerHTML: "Error loading page"
        },"app-loading-node");
      };
      
      var client = new AppClient();
      client.pingGeoportal().then(function(geoportal){
        //console.warn("geoportal",geoportal);
        if (!geoportal) geoportal = {};
        if (window) window.geoportalServiceInfo = geoportal; // to use for child iframes
        AppContext.geoportal = geoportal;      
        AppContext.appUser.whenAppStarted().then(function(){
          showApp();
        }).otherwise(function(err){
          showApp();
        });
      }).otherwise(function(err){
        showErr(err);
        console.error("Unable to connect to server.");
        console.error(err);   
      });
    }

  });

  return oThisClass;
});
