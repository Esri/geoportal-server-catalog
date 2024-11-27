define(function() {
  //we don't use dojo's declare to define class
  //because this function will be used in node.js

  function BaseVersionManager(){
    /******************************************************
      element signature:
      {
        //the version you want to upgrade to. version format: 1.0.0
        version: '',

        //the version discription
        description: '',

        //the upgrade logic to upgrade from the latest old verion to this version
        //the first upgrader will upgrade unknow version to the first version
        upgrader: function(oldConfig){
          //your logic here
          return newConfig;
        }
      }
    ******************************************************/
    this.versions = [];

    this.upgrade = function(config, _oldVersion, _newVersion){
      //the config is the old version
      //method should return new upgraded config
      var oldVersionIndex = this.getVersionIndex(_oldVersion);
      var newVersionIndex = this.getVersionIndex(_newVersion);

      if(oldVersionIndex > newVersionIndex){
        throw Error('New version should higher than old version.');
      }
      var newConfig = config, i;
      for(i = oldVersionIndex + 1; i <= newVersionIndex; i++){
        if(!this.versions[i].upgrader){
          //if no upgrader, we consider the version is compatible
          continue;
        }
        newConfig = this.versions[i].upgrader(newConfig);
      }
      return newConfig;
    };

    this.getVersionIndex = function(_version){
      var version = this.fixVersion(_version);
      var versionIndex, i;

      for(i = 0; i < this.versions.length; i++){
        if(this.versions[i].version === version){
          versionIndex = i;
        }
      }
      //if there is no version, we assume it's very old and will upgrade from the first version
      if(version === null){
        versionIndex = -1;
      }

      if(versionIndex === undefined){
        //for unknown version, we assume it's the latest version but it's not in versions array.
        versionIndex = this.versions.length - 1;
      }

      return versionIndex;
    };

    this.fixVersion = function(version){
      if(!version){
        return null;
      }
      return version;
      //TODO
    };
  }

  return BaseVersionManager;
});