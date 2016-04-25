define(['jimu/shared/BaseVersionManager'],
  function(BaseVersionManager) {

    function VersionManager() {
      this.versions = [{
        version: '1.0',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '1.1',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '1.2',
        upgrader: function(oldConfig) {
          return oldConfig;
        }
      }, {
        version: '1.3',
        upgrader: function(oldConfig) {
          var newConfig = {};
          newConfig.sources = [];
          if (!oldConfig.geocoder) {
            return newConfig;
          }
          var oldGeocoder = oldConfig.geocoder;
          var source = null;
          var defaultMaxResults = 6;
          if (oldGeocoder.arcgisGeocoder) {
            source = {};
            if (Object.prototype.toString.call(oldGeocoder.arcgisGeocoder) === "[object Object]") {
              for (var p in oldGeocoder.arcgisGeocoder) {
                source[p] = oldGeocoder.arcgisGeocoder[p];
              }
              source.url = source.url ||
                "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
              source.singleLineFieldName = source.singleLineFieldName || "SingleLine";
              source.name = source.name || "Esri World Geocoder";
            } else if (typeof oldGeocoder.arcgisGeocoder === "boolean") {
              source.url = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
              source.name = "Esri World Geocoder";
              source.singleLineFieldName = "SingleLine";
              source.placeholder = "Esri World Geocoder";
            }
            source.countryCode = source.sourceCountry || source.countryCode || "";
            source.maxResults = oldGeocoder.maxLocations || defaultMaxResults;
            newConfig.sources.push(source);
          }

          for (var i = 0, len = oldGeocoder.geocoders.length; i < len; i++) {
            source = {};
            var geocoder = oldGeocoder.geocoders[i];
            for (var p2 in geocoder) {
              source[p2] = geocoder[p2];
            }
            source.countryCode = source.sourceCountry || source.countryCode || "";
            source.maxResults = oldGeocoder.maxLocations || defaultMaxResults;
            source.type = source.type || "locator";
            newConfig.sources.push(source);
          }

          newConfig.upgradeFromGeocoder = true;
          return newConfig;
        }
      }, {
        version: "1.4",
        upgrader: function(oldConfig) {
          oldConfig.allPlaceholder = "";
          oldConfig.showInfoWindowOnSelect = true;

          return oldConfig;
        }
      }];
    }

    VersionManager.prototype = new BaseVersionManager();
    VersionManager.prototype.constructor = VersionManager;
    return VersionManager;
  });