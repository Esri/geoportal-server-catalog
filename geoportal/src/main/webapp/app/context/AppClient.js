define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "esri/request",
        "dojo/request"],
function(declare, lang, Deferred, esriRequest, dojoRequest) {

  var oThisClass = declare(null, {

    constructor: function(args) {
      lang.mixin(this,args);
    },
    
    appendAccessToken: function(url) {
      var accessToken = this.getAccessToken();
      if (accessToken) {
        if (url.indexOf("?") === -1) url += "?";
        else url += "&";
        url += "access_token="+encodeURIComponent(accessToken);
      }
      return url;
    },
    
    checkError: function(error) {
      if (error && error.response && error.response.data && error.response.data.error) {
        return error.response.data.error;
      }
    },
    
    getAccessToken: function() {
      var tkn = AppContext.appUser.appToken;
      if (tkn && tkn.access_token) return tkn.access_token;
      return null;
    },
    
    getBaseUri: function() {
      return ".";
    },
    
    getRestUri: function() {
      return "./rest";
    },
    
    /* ===================================================================== */
    
    changeOwner: function(id,newOwner) {
      var url = this.getRestUri()+"/metadata/item/";
      url += encodeURIComponent(id)+"/owner/"+encodeURIComponent(newOwner);
      url = this.appendAccessToken(url);
      var info = {handleAs:"json"};
      return dojoRequest.put(url,info);
    },

    deleteItem: function(id) {
      var url = this.getRestUri()+"/metadata/item/";
      url += encodeURIComponent(id);
      url = this.appendAccessToken(url);
      var info = {handleAs:"json"};
      return dojoRequest.del(url,info);
    },
    
    generateToken: function(username,password) {
      // TODO needs to be https
      /*
      var url = this.getBaseUri()+"/oauth/token";
      var content = {
        grant_type: "password",
        client_id: "geoportal-client",
        username: username,
        password: password
      };
      var info = {url:url,handleAs:"json",content:content};
      var options = {usePost:true};
      return esriRequest(info,options);
      */
      var url = this.getBaseUri()+"/oauth/token";
      var content = {
        grant_type: "password",
        client_id: "geoportal-client",
        username: username,
        password: password
      };
      var info = {handleAs:"json",data:content};
      return dojoRequest.post(url,info);
    },

    pingGeoportal: function(accessToken) {
      /*
      var url = this.getRestUri()+"/geoportal";
      var info = {url:url,handleAs:"json"};
      var options = {usePost:false};
      if (!accessToken) accessToken = this.getAccessToken();
      if (accessToken) info.content = {access_token:encodeURIComponent(accessToken)};
      return esriRequest(info,options);
      */
      var url = this.getRestUri()+"/geoportal";
      var info = {handleAs:"json"};
      if (!accessToken) accessToken = this.getAccessToken();
      if (accessToken) info.query = {access_token:encodeURIComponent(accessToken)};
      return dojoRequest.get(url,info);
    },
    
    uploadMetadata: function(xml,filename) {
      var url = this.getRestUri()+"/metadata/item";
      url = this.appendAccessToken(url);
      if (typeof filename === "string" && filename.length > 0) {
        if (url.indexOf("?") === -1) url += "?";
        else url += "&";
        url += "filename="+encodeURIComponent(filename);
      }
      var headers = {"Content-Type": "application/xml"};
      var info = {handleAs:"json",headers:headers,data:xml};
      return dojoRequest.put(url,info);
    }

  });

  return oThisClass;
});
