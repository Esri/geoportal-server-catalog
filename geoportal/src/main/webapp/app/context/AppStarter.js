define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "dojo/_base/fx",
        "dojo/topic",
        "dijit/registry",
        "app/context/app-topics",
        "app/context/AppClient",
        "app/main/App"],
function(declare, lang, domConstruct, fx, topic, registry, appTopics, AppClient, App) {

  var oThisClass = declare(null, {

    constructor: function(args) {
      lang.mixin(this,args);
    },

    startupApp: function() {
      
      var showApp = function() {
        // Defensive guard: if, for any reason (e.g. a hot-reload of scripts
        // without a full page navigation, or startupApp() being invoked more
        // than once), a widget is already registered against the "app" node,
        // destroy it first so dijit's registry.add() doesn't throw
        // "Tried to register widget with id==app but that id is already
        // registered" when we create the new App widget below.
        var existing = registry.byId("app");
        if (existing) {
          try {
            // preserveDom=true: only tear down the widget/registry entry,
            // keep the underlying #app DOM node in place so it can be
            // reused as the srcNodeRef for the new App widget below.
            existing.destroyRecursive(true);
          } catch (e) {
            console.warn("Unable to destroy existing 'app' widget before re-initializing.", e);
          }
        }
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
