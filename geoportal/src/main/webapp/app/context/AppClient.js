define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/request"],
function(declare, lang, Deferred, dojoRequest) {

  var oThisClass = declare(null, {

    constructor: function(args) {
      lang.mixin(this,args);
    },
    
    appendAccessToken: function(url) {
      var accessToken = this.getAccessToken();
      if (accessToken) {
        if (typeof url === "string") {
          if (url.indexOf("?") === -1) url += "?";
          else url += "&";
          url += "access_token="+encodeURIComponent(accessToken);
        } else {
          url.access_token = accessToken;
        }
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
    
    bulkChangeOwner: function(owner,newOwner) {
      var url = this.getRestUri()+"/metadata/bulk/changeOwner";
      url += "?owner="+encodeURIComponent(owner);
      url += "&newOwner="+encodeURIComponent(newOwner);
      url = this.appendAccessToken(url);
      var info = {handleAs:"json"};
      return dojoRequest.put(url,info);
    },
    
    bulkEdit: function(action,urlParams,postData,dataContentType) {
      var url = this.getRestUri()+"/metadata/"+action;
      this.appendAccessToken(urlParams);
      var options = {
        handleAs: "json",
        query: urlParams
      };
      if (postData) {
        options.data = postData;
        if (dataContentType) {
          options.headers = {"Content-Type": dataContentType};
        }
      }
      return dojoRequest.put(url,options);
    },
    
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
      var url = this.getBaseUri()+"/oauth/token";
      var content = {
        grant_type: "password",
        client_id: "geoportal-client",
        username: username,
        password: password
      };
      var info = {handleAs:"json",data:content,headers:{Accept:"application/json"}};
      return dojoRequest.post(url,info);
    },

    pingGeoportal: function(accessToken) {
      var url = this.getRestUri()+"/geoportal";
      var info = {handleAs:"json"};
      if (!accessToken) accessToken = this.getAccessToken();
      if (accessToken) info.query = {access_token:encodeURIComponent(accessToken)};
      return dojoRequest.get(url,info);
    },
    
    readMetadata: function(itemId) {
      var url = this.getRestUri()+"/metadata/item";
      url += "/"+encodeURIComponent(itemId)+"/xml";
      url = this.appendAccessToken(url);
      var info = {handleAs:"text"};
      return dojoRequest.get(url,info);
    },
    
    uploadMetadata: function(xml,itemId,filename) {
      var url = this.getRestUri()+"/metadata/item";
      if (typeof itemId === "string" && itemId.length > 0) {
        url += "/"+encodeURIComponent(itemId);
      }
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
