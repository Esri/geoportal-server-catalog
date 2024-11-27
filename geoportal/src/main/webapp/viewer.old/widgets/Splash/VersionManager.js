define(['jimu/shared/BaseVersionManager'],
function(BaseVersionManager) {
  function VersionManager(){
    this.versions = [{
      version: '1.0',
      upgrader: function(oldConfig){
        return oldConfig;
      }
    }, {
      version: '1.1',
      upgrader: function(oldConfig){
        return oldConfig;
      }
    }, {
      version: '1.2',
      upgrader: function(oldConfig){
        return oldConfig;
      }
    }, {
      version: '1.3',
      upgrader: function(oldConfig){
        var newConfig = oldConfig;
        if (newConfig && newConfig.splash) {
          newConfig.splash.showOption = true;
        }

        return newConfig;
      }
    }, {
      version: '1.4',
      upgrader: function(oldConfig){
        var newConfig = oldConfig;
        if (newConfig && newConfig.splash) {
          newConfig.splash.backgroundColor = "#485566";
          newConfig.splash.confirmEverytime = false;
        }

        return newConfig;
      }
    }, {
      version: '2.0Beta',
      upgrader: function(oldConfig) {
        return oldConfig;
      }
    }, {
      version: '2.0',
      upgrader: function(oldConfig) {
        return oldConfig;
      }
    }, {
      version: '2.0.1',
      upgrader: function(oldConfig) {
        return oldConfig;
      }
    }, {
      version: '2.1',
      upgrader: function(oldConfig) {
        return oldConfig;
      }
    }, {
      version: '2.2',
      upgrader: function(oldConfig) {
        var newConfig = oldConfig;
        if (newConfig && newConfig.splash) {
          var splash = newConfig.splash;
          if ("undefined" !== typeof splash.backgroundColor) {
            splash.confirm = {
              "text": splash.confirmText || "",
              "color": "#ffffff",
              "transparency": "0"
            };
            splash.size = {
              "mode": "wh",
              "wh": {
                "w": 600,
                "h": null
              }
            };
            splash.background = {
              "mode": "color",
              "color": splash.backgroundColor,
              "transparency": "0"
            };
            splash.button = {
              "color": "#518dca",
              "transparency": "0"
            };

            splash.contentVertical = "top";

            splash.confirmText = null;
            delete splash.confirmText;
            splash.backgroundColor = null;
            delete splash.backgroundColor;
          }
        }

        return newConfig;
      }
    }];
  }

  VersionManager.prototype = new BaseVersionManager();
  VersionManager.prototype.constructor = VersionManager;
  return VersionManager;
});