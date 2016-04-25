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
    }];
  }

  VersionManager.prototype = new BaseVersionManager();
  VersionManager.prototype.constructor = VersionManager;
  return VersionManager;
});