define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/request",
        "app/context/AppUser",
        "esri4/Basemap"],
function(declare, lang, Deferred, dojoRequest, AppUser, esriBasemaps) {

  /**
   * Recursively Object.freeze() an object graph so that none of its own
   * enumerable properties (nor nested objects/arrays) can be reassigned or
   * mutated afterwards - e.g. from the browser's developer tools console.
   * @param {*} obj the value to freeze (no-op for non-objects)
   * @returns {*} the same value, frozen
   */
  function deepFreeze(obj) {
    if (!obj || typeof obj !== "object" || Object.isFrozen(obj)) return obj;
    Object.getOwnPropertyNames(obj).forEach(function(key) {
      var value = obj[key];
      if (value && typeof value === "object") deepFreeze(value);
    });
    return Object.freeze(obj);
  }

  var oThisClass = declare(null, {

    appConfig: {},
    appUser: null,
    geoportal: null,
    session: null,

    constructor: function (args) {
      lang.mixin(this, args);
      this.appUser = new AppUser();
    },

    /**
     * Fetch the server-managed application configuration (GET /rest/app-config,
     * backed by config/config.properties "appui.*" entries) into this.appConfig.
     * Resolves once this.appConfig is ready to use, so that code such as
     * AppContext.appConfig.searchResults.numPerPage keeps working unchanged.
     * <p>
     * this.appConfig is deep-frozen and locked down (see _lockAppConfig) as soon
     * as it is received, so that neither individual values nor the top-level
     * reference can be edited/replaced from the browser console afterwards.
     * <p>
     * <b>This is NOT, and can never be, a real security boundary.</b> A user
     * with devtools open can set a breakpoint anywhere in this function (or
     * inside dojo/request itself), edit "serverConfig" while execution is
     * paused, then resume - freezing only locks in whatever value was present
     * at freeze time, it cannot stop the value from being altered beforehand.
     * A user can likewise override fetch/XHR, Object.freeze, or
     * Object.defineProperty before this module even runs, or rewrite the raw
     * HTTP response via the browser's network-override tools. None of this
     * can be prevented by any client-side code, in any language, because the
     * browser is fully controlled by the person using it. Freezing here only
     * guards against the laziest tampering method (typing an assignment into
     * the console after the page has loaded) - it is cheap, harmless
     * defense-in-depth and nothing more.
     * <p>
     * Therefore: every server-side feature that mirrors an "appui.*" flag
     * (allow/adminOnly/etc.) MUST independently re-check config.properties
     * itself (see AppConfigUtil.java) and must NEVER trust anything derived
     * from this object, from request parameters, or from client behavior.
     * @returns {dojo/Deferred}
     */
    loadAppConfig: function() {
      var self = this;
      var dfd = new Deferred();
      var url = "./rest/app-config";
      var info = {handleAs:"json"};
      dojoRequest.get(url,info).then(function(serverConfig){
        self._lockAppConfig(self._applyBasemapOverride(serverConfig || {}));
        dfd.resolve(self.appConfig);
      },function(error){
        console.error("Unable to load /rest/app-config.",error);
        dfd.reject(error);
      });
      return dfd;
    },

    /**
     * Deep-freeze the given config object, then (re)define this.appConfig as a
     * non-writable, non-configurable own property pointing at it, so later
     * attempts such as "AppContext.appConfig.edit.setField.allow = true" or
     * "AppContext.appConfig = {...}" typed into the console silently fail
     * (or throw in strict mode) instead of actually changing anything.
     * @param {Object} cfg the loaded app config
     */
    _lockAppConfig: function(cfg) {
      deepFreeze(cfg);
      try {
        Object.defineProperty(this,"appConfig",{
          value: cfg,
          writable: false,
          configurable: false,
          enumerable: true
        });
      } catch (e) {
        // Property already locked from a prior load - nothing more to do.
        console.warn("Unable to lock AppContext.appConfig.",e);
      }
    },

    _applyBasemapOverride: function(cfg) {
      cfg = cfg || this.appConfig;
      if (esriBasemaps && cfg && cfg.searchMap &&
          typeof cfg.searchMap.basemap === "string") {
        var basemap = cfg.searchMap.basemap;
        if (basemap.indexOf("http://") === 0 || basemap.indexOf("https://") === 0) {
          esriBasemaps.geoportalCustom = {
            baseMapLayers: [{url: basemap}]
          };
          cfg.searchMap.basemap = "geoportalCustom";
        }
      }
      return cfg;
    }

  });

  return oThisClass;
});

