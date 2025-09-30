define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/topic",
        "app/context/app-topics",
        "dojo/i18n!app/nls/resources",
        "app/context/AppClient",
        "app/common/SignIn",
        "esri4/identity/IdentityManager",
        "esri4/identity/OAuthInfo",
        "esri4/portal/Portal"
        ], 
function(declare, lang, Deferred, topic, appTopics, i18n, AppClient, SignIn, 
    esriId, OAuthInfo, Portal) {
  var KEEP_SIGNED_IN_COOKIE_NAME = "GPT_keep_signed_in";
	
  var oThisClass = declare(null, {

    appToken: null,
    arcgisPortalUser: null,
    geoportalUser: null,
    
    constructor: function(args) {
      lang.mixin(this,args);
    },
    
    getArcGISPortalUrlForLink: function() {
      var p = null, url = null;
      try {
        if (this.arcgisPortalUser !== null) p = this.arcgisPortalUser.portal;
        if (p && p.customBaseUrl && (p.customBaseUrl.length > 0) && p.urlKey && (p.urlKey.length > 0)) {
          url = window.location.protocol+"//"+p.urlKey+"."+p.customBaseUrl;
          return url;
        } else if (p && p.url) {
          return p.url;
        }
      } catch(ex) {
        console.warn(ex);
      }
    },
    
    getGroups: function() {
      if (this.geoportalUser) {
        return this.geoportalUser.groups;
      }
      return null;
    },
    
    getMyProfileUrl: function() {
      if (AppContext.geoportal && AppContext.geoportal.arcgisOAuth && 
          AppContext.geoportal.arcgisOAuth.showMyProfileLink) {
        if (this.arcgisPortalUser) {
          var v = this.getArcGISPortalUrlForLink();
          if (v) {
            return v+"/home/user.html?user="+encodeURIComponent(this.arcgisPortalUser.username);
          } 
        }
      }
      return null;
    },
    
    getUsername: function() {
      if (this.geoportalUser) {
        var v = this.geoportalUser.username;
        if (typeof v === "string" && v.length > 0) return v;
      }
      return null;
    },
    
    isAdmin: function() {
      if (this.geoportalUser) {
        return this.geoportalUser.isAdmin;
      }
      return false;
    },
    
    isSignedIn: function() {
      return (this.getUsername() !== null);
    },
    
    isPublisher: function() {
      if (this.geoportalUser) {
        return this.geoportalUser.isPublisher;
      }
      return false;
    },
        
    _showAgsOAuthSignIn: function(oauth) {
      var self = this, portalUrl = oauth.portalUrl+"/sharing";
      //arcgisUtils.arcgisUrl = portalUrl;  // PortalImplementation
      esriId.getCredential(portalUrl,{oAuthPopupConfirmation:false})
      .then(function(Credential){
        var portal = new Portal({
            authMode: "immediate"
        });      
        portal.url = oauth.portalUrl;
        
        portal.load().then(() => {        	
        	 self.arcgisPortalUser = portal.user;
             var u = portal.user.username;
             var p = "__rtkn__:"+portal.credential.token;
             self.signIn(u,p).then(function(){
             }).catch(function(error){
               // TODO handle 
               console.warn("Error occurred while signing in:",error);
             });
          });
        })
        .catch(function(error) {          
        	console.warn("Error occurred while signing in:",error);
        });     
    },
    
    showSignIn: function() {
      var ctx = window.AppContext;
      if (ctx.geoportal && ctx.geoportal.arcgisOAuth && ctx.geoportal.arcgisOAuth.appId) {
        this._showAgsOAuthSignIn(ctx.geoportal.arcgisOAuth);
      } else {
        // (new SignIn()).show();
		//TODO above remove old sign in method
		
        // Open OAuth popup
        this.openOAuthPopup();
      }
    },

    openOAuthPopup: function() {
      // Get current app context URL
      var currentUrl = window.location.origin + window.location.pathname;
      
      const redirectUri = currentUrl.replace(/\/[^\/]*$/, '/callback.html');
      const clientId = 'geoportal-client';    
      const authServer = currentUrl.replace(/\/[^\/]*$/, '/oauth2'); // Spring Auth Server base
      const authorizeEndpoint = `${authServer}/authorize`;
	  
      const codeVerifier = generateCodeVerifier();
      // Persist codeVerifier for popup
      localStorage.setItem('pkce_code_verifier', codeVerifier);
      generateCodeChallenge(codeVerifier).then(function(codeChallenge) {
        const authUrl = `${authorizeEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid&code_challenge=${codeChallenge}&code_challenge_method=S256`;
        window.oauthPopup = window.open(authUrl, '_blank', 'width=600,height=500');
      });

      function generateCodeVerifier() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }

      async function generateCodeChallenge(verifier) {
        const data = new TextEncoder().encode(verifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
    },

    // Listen for messages from the popup
	  initOAuthListener: function() {
		  window.addEventListener('message', function(event) {
			  alert("message received " + JSON.stringify(event.data));
			  // Ensure the message is from the expected origin
			  if (event.origin !== window.location.origin) return;
			  if (event.data && event.data.token) {
				  const oauthToken = event.data.token.access_token ? event.data.token : null;
				  if (!oauthToken) return;

				  // Process the received token
				  var self = AppContext.appUser, dfd = new Deferred(), client = new AppClient();
				  var k = true; // Always keep signed in when using OAuth

				  // Validate token by pinging Geoportal
				  client.pingGeoportal(oauthToken).then(function(info) {
					  if (info && info.user) {
						  self.appToken = oauthToken;
						  self.geoportalUser = info.user;

						  if (k) {
							  var cValue = {
								  token: oauthToken,
								  user: info.user
							  };
							  self.preserveTokenInfo(cValue, new Date(Date.now() + oauthToken.expires_in * 1000));
						  }
						  AppContext.geoportal = info;
						  topic.publish(appTopics.SignedIn, { geoportalUser: info.user });
						  dfd.resolve();
					  } else {
						  dfd.reject(i18n.general.error);
					  }
				  }).catch(function(error) {
					  console.warn(error);
					  dfd.reject(i18n.general.error);
				  });
			  }
		  });
	  },

    // In the popup window, after redirect, send tokens back to opener
    handleOAuthCallback: async function(code) {      
   
      if (code && window.opener) {
        
        // Exchange authorization code for tokens
        const clientId = 'geoportal-client';
        const redirectUri = 'http://localhost:8080/geoportal/callback.html'; // Updated to match registered URI
        const tokenEndpoint = 'http://localhost:8080/geoportal/oauth2/token';
        // Retrieve codeVerifier from localStorage
        const codeVerifier = localStorage.getItem('pkce_code_verifier') || '';
        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          code_verifier: codeVerifier
        });
        const response = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        });
        const oauthToken = await response.json();
        alert("tokens: " + JSON.stringify(oauthToken));
		if(oauthToken && oauthToken.access_token) {
			window.opener.postMessage({ token: oauthToken }, window.location.origin);
			        window.close();
			}
        
      }
      console.log("handleOAuthCallback finished");
    },
	
	
    
    checkStoredToken: function() {
      var info = this.retrieveTokenInfo();
      if (info) {
        this.appToken = info.oauthToken;
        this.geoportalUser = info.user;
        topic.publish(appTopics.SignedIn,{geoportalUser:info.user});
      }
    },

	//TODO remove Old sign in method
    /*signIn: function(u,p,k) {
      var self = this, dfd = new Deferred(), client = new AppClient();
      client.generateToken(u,p).then(function(oauthToken){
        if (oauthToken && oauthToken.access_token) {
          client.pingGeoportal(oauthToken.access_token).then(function(info){
            if (info && info.user) {
              self.appToken = oauthToken;
              self.geoportalUser = info.user;
              
              if (k) {
                var cValue = {
                  token: oauthToken,
                  user: info.user
                };
                self.preserveTokenInfo(cValue, new Date(Date.now() + oauthToken.expires_in * 1000));
              }
              AppContext.geoportal = info;
              topic.publish(appTopics.SignedIn,{geoportalUser:info.user});
              dfd.resolve();
            } else {
              dfd.reject(i18n.general.error);
            } 
          }).catch(function(error){
            console.warn(error);
            dfd.reject(i18n.general.error);
          });
        } else {
          dfd.reject(i18n.login.invalidCredentials);
        }
      }).catch(function(error){
        var msg = i18n.general.error;
        if (error) {
          if (error.status === 400) msg = i18n.login.invalidCredentials;
          else console.warn(error);
        }
        dfd.reject(msg);
      });
      return dfd;
    },*/
    
    signOut: function() {
      this.deleteTokenInfo();
      esriId.destroyCredentials();
      window.location.reload();
    },
    
    whenAppStarted: function() {
      var self = this, dfd = new Deferred(), ctx = window.AppContext, oauth;
      if (ctx.geoportal) oauth = ctx.geoportal.arcgisOAuth; 
      
      if (oauth && oauth.appId) {
        var portalUrl = oauth.portalUrl;
       // arcgisUtils.arcgisUrl = portalUrl;  // PortalImplementation
        var info = new OAuthInfo({
          appId: oauth.appId,
          // Uncomment this line to prevent the user's signed in state from being shared
          // with other apps on the same domain with the same authNamespace value.
          //authNamespace: "portal_oauth_inline",
          portalUrl: portalUrl,
          expiration: oauth.expirationMinutes,
          popup: true
        });
        esriId.registerOAuthInfos([info]);
        
        esriId
        .checkSignInStatus(info.portalUrl + "/sharing")
        .then(function(result) {
            const portal = new Portal({
            authMode: "immediate"
          });
          // Check if using a portal other than ArcGIS Online.
          if (info.portalUrl !== "https://www.arcgis.com") {
            portal.url = info.portalUrl;
          }
          // Load the portal, display the name and username, then call the query items function.
          portal.load().then(() => {
        	  self.arcgisPortalUser = portal.user;
              var u = portal.user.username;
              var p = "__rtkn__:"+portal.credential.token;
              self.signIn(u,p).then(function(){
            	  dfd.resolve();
              }).catch(function(error){
                // TODO handle 
                console.warn("Error occurred while signing in:",error);
                dfd.resolve();
              });
        })
        .catch(function(error){
          // If not signed in, then show the sign in button.
        	dfd.resolve();
        	});
        })
        .catch(function(error){
        	// If not signed in, then show the sign in button.
        	dfd.resolve();        	
        });
      } else {
        AppContext.appUser.checkStoredToken();
        dfd.resolve();
      }
      return dfd;
    },
    
    preserveTokenInfo: function(cValue, cexpires) {
      var expires = "expires=" + cexpires.toUTCString();
      var domain = "domain=" + location.hostname;
      var path = "path=/" + location.pathname.replaceAll(/^\/+|\/+$/gi,"");
      var value = btoa(typeof cValue === "object"? JSON.stringify(cValue): cValue);
      document.cookie = KEEP_SIGNED_IN_COOKIE_NAME + "=" + value + "; " + expires + "; " + domain + "; " + path;
    },
    
    deleteTokenInfo: function() {
      var domain = "domain=" + location.hostname;
      var path = "path=/" + location.pathname.replaceAll(/^\/+|\/+$/gi,"");
      document.cookie = KEEP_SIGNED_IN_COOKIE_NAME + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; " + domain + "; " + path;
    },

    retrieveTokenInfo: function() {
      var name = KEEP_SIGNED_IN_COOKIE_NAME + "=";
      var ca = document.cookie.split(';');
      
      for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return JSON.parse(atob(c.substring(name.length, c.length)));
        }
      }
    }    

  });

  return oThisClass;
});