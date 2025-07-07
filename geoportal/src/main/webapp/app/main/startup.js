require(["app","dojo/i18n!app/nls/resources"],function(app,i18n) {
  var isIE = navigator.userAgent.indexOf("MSIE ")!=-1 || navigator.userAgent.indexOf("Trident/")!=-1;
  if (!isIE) {
    document.getElementById("app-loading-node").style.display = "block";
    require(["dojo/ready","esri4/config","app/context/AppContext","app/context/AppStarter"],
    function(ready,esriConfig,AppContext,AppStarter) {
      window.AppContext = new AppContext();
      ready(function() {       
        esriConfig.request.proxyUrl = "viewer/proxy.jsp";
        (new AppStarter()).startupApp();
      });
    });
  } else {
    console.log("Your browser is no longer supported.");
    document.getElementById("app-browser-incompatible-node").style.display = "block";
    document.getElementById("app-browser-incompatible-node").innerHTML = i18n.general.incompatible;
  }
});