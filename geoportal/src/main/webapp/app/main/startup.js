require(["app","dojo/i18n!app/nls/resources"],function(app,i18n) {
  var isIE = navigator.userAgent.indexOf("MSIE ")!=-1 || navigator.userAgent.indexOf("Trident/")!=-1;
  if (!isIE) {
    document.getElementById("app-loading-node").style.display = "block";
    var loadingTextNode = document.getElementById("app-loading-text");
    if (loadingTextNode) loadingTextNode.innerHTML = i18n.general.loading;
    require(["dojo/ready","esri4/config","app/context/AppContext","app/context/AppStarter"],
    function(ready,esriConfig,AppContext,AppStarter) {
      window.AppContext = new AppContext();
      window.AppContext.appUser.initOAuthListener();
      var startApp = function() {
        ready(function() {
          esriConfig.request.proxyUrl = "viewer/proxy.jsp";
          (new AppStarter()).startupApp();
        });
      };
      // Fatal: the app configuration could not be loaded. 
      // show a dedicated error in place of the loading indicator.
      var showConfigError = function(err) {
        console.error("Unable to load application configuration.",err);
        var node = document.getElementById("app-loading-node");
        if (node) {
          node.innerHTML = "<h3 class=\"text-center g-error\">"+i18n.general.configError+"</h3>";
        }
      };
      var loadAndStartApp = function() {
        window.AppContext.loadAppConfig().then(startApp,showConfigError);
      };
      loadAndStartApp();
    });
  } else {
    console.log("Your browser is no longer supported.");
    document.getElementById("app-browser-incompatible-node").style.display = "block";
    document.getElementById("app-browser-incompatible-node").innerHTML = i18n.general.incompatible;
  }
});