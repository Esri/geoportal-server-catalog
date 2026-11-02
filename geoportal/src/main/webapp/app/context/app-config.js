// This module is no longer used.
//
// Client (web app) configuration values have been moved to
// classpath:config/config.properties (server-side, under the "appui." prefix) and
// are served to the browser via GET /rest/app-config
// (see com.esri.geoportal.service.rest.AppConfigService). AppContext.js loads that
// endpoint directly via AppContext.loadAppConfig() into AppContext.appConfig.
define([],function(){return {};});
