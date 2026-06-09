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
	   var dfd = new Deferred(), client = new AppClient();
      //arcgisUtils.arcgisUrl = portalUrl;  // PortalImplementation
      esriId.getCredential(portalUrl,{oAuthPopupConfirmation:false})
      .then((Credential) => {
          var portal = new Portal({
              authMode: "immediate"
          });
          portal.url = oauth.portalUrl;
          portal.load().then(() => {
              self.arcgisPortalUser = portal.user;
              //var u = portal.user.username;
              var arcgisToken =  portal.credential.token;
              self.getJWTToken(arcgisToken).then(function(jwtToken) {
                  if (jwtToken && jwtToken.access_token) {
						var oauthToken = jwtToken;
                      // Validate token by pinging Geoportal
                      client.pingGeoportal(oauthToken.access_token).then(function(info) {
                          if (info && info.user) {
                              self.appToken = oauthToken;
                              self.geoportalUser = info.user;

                              var cValue = {
                                  token: oauthToken,
                                  user: info.user
                              };
                              self.preserveTokenInfo(cValue, new Date(Date.now() + oauthToken.expires_in * 1000));

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
                  } else {
                      dfd.reject(i18n.login.invalidCredentials);
                  }
              }).catch(function(error) {
                  // TODO handle 
                  console.warn("Error occurred while signing in ArcGIS:", error);
              });
          });
      })
        .catch(function(error) {          
        	console.warn("Error occurred while signing in:",error);
        });     
    },
    
	getJWTToken:function(arcGisToken) {
        var dfd = new Deferred(), client = new AppClient();
        client.generateArcGISJwtToken(arcGisToken).then(function(oauthToken){
          if (oauthToken && oauthToken.access_token) {			
              dfd.resolve(oauthToken);			  
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
    },
	
	
    showSignIn: function() {
      var ctx = window.AppContext;
      if (ctx.geoportal && ctx.geoportal.arcgisOAuth && ctx.geoportal.arcgisOAuth.appId) {
        this._showAgsOAuthSignIn(ctx.geoportal.arcgisOAuth);
      } else {       	
        // Open OAuth popup
        this.openOAuthPopup();
     }
    },

    openOAuthPopup: function() {
      // Get current app context URL
      var currentUrl = window.location.origin + window.location.pathname;
      
      const redirectUri = currentUrl.replace(/\/[^\/]*$/, '/callback.html');
      const clientId = 'geoportal-simple-client';    
      const authServer = currentUrl.replace(/\/[^\/]*$/, '/oauth2'); // Spring Auth Server base
      const authorizeEndpoint = `${authServer}/authorize`;
	  
      const codeVerifierSeed = generateCodeVerifier();
      const oauthState = generateOAuthState();
	  const w = 520, h = 320;
      const y = window.top.outerHeight / 2 + window.top.screenY - (h / 1.5);
      const x = window.top.outerWidth  / 2 + window.top.screenX - (w / 2);
      hashValue(codeVerifierSeed).then(function(hashedCodeVerifier) {
        // Persist only hashed verifier so raw seed is never written to Web Storage.
        sessionStorage.setItem('pkce_code_verifier', hashedCodeVerifier);
        // Persist state so callback can validate request/response binding.
        sessionStorage.setItem('pkce_oauth_state', oauthState);

        generateCodeChallenge(hashedCodeVerifier).then(function(codeChallenge) {
          var params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: 'openid',
            state: oauthState,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
          });
          const authUrl = `${authorizeEndpoint}?${params.toString()}`;
          window.oauthPopup = window.open(authUrl, '_blank', `width=${w},height=${h},left=${x},top=${y},resizable,scrollbars`);
        });
      });

      function generateCodeVerifier() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return toBase64Url(array);
      }

      async function generateCodeChallenge(verifier) {
        const data = new TextEncoder().encode(verifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return toBase64Url(new Uint8Array(digest));
      }

      async function hashValue(value) {
        const data = new TextEncoder().encode(value);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return toBase64Url(new Uint8Array(digest));
      }

      function generateOAuthState() {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        return toBase64Url(bytes);
      }

      function toBase64Url(bytes) {
        return btoa(String.fromCharCode(...bytes))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
      }
    },

    // Listen for messages from the popup
	  initOAuthListener: function() {
		  window.addEventListener('message', function(event) {
			 
			  // Ensure the message is from the expected origin
			  if (event.origin !== window.location.origin) return;
        if (event.data && event.data.oauthResponse) {
        var payload = event.data.oauthResponse;
        var code = payload.code;
        var state = payload.state;
        if (!code || !state) return;

        var expectedState = sessionStorage.getItem('pkce_oauth_state') || '';
        if (!expectedState || state !== expectedState) {
          console.warn('OAuth state validation failed. Rejecting callback.');
          sessionStorage.removeItem('pkce_oauth_state');
          sessionStorage.removeItem('pkce_code_verifier');
          return;
        }

        // Single-use state and verifier.
        sessionStorage.removeItem('pkce_oauth_state');
        var codeVerifier = sessionStorage.getItem('pkce_code_verifier') || '';
        sessionStorage.removeItem('pkce_code_verifier');
        if (!codeVerifier) {
          console.warn('Missing PKCE code verifier. Rejecting callback.');
          return;
        }

        var appUser = AppContext.appUser;
        var baseUrl = appUser._getContextBaseUrl();
        var tokenEndpoint = baseUrl + '/oauth2/token';
        var redirectUri = baseUrl + '/callback.html';
        var body = new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          client_id: 'geoportal-simple-client',
          code_verifier: codeVerifier
        });

        fetch(tokenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body
        })
        .then(function(response) { return response.json(); })
        .then(function(oauthToken) {
          if (oauthToken && oauthToken.access_token) {
          appUser._finalizeOAuthSignIn(oauthToken);
          } else {
          console.warn('OAuth token exchange failed.');
          }
        })
        .catch(function(error) {
          console.warn('OAuth token exchange error:', error);
        });
        } else if (event.data && event.data.token) {
        const oauthToken = event.data.token;
        AppContext.appUser._finalizeOAuthSignIn(oauthToken);
        }
      });
    },

  _finalizeOAuthSignIn: function(oauthToken) {
    const accessToken = oauthToken && oauthToken.access_token ? oauthToken.access_token : null;
    if (!accessToken) return;

    var self = AppContext.appUser, client = new AppClient();
    var k = true; // Always keep signed in when using OAuth

    client.pingGeoportal(accessToken).then(function(info) {
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
    } else {
      console.warn(i18n.general.error);
    }
    }).catch(function(error) {
    console.warn(error);
    });
  },

    // In the popup window, after redirect, send code/state back to opener
    handleOAuthCallback: async function(code, state) {      
      if (!state) state = (new URLSearchParams(window.location.search)).get('state');

      if (code && state && window.opener) {
		window.opener.postMessage({ oauthResponse: { code: code, state: state } }, window.location.origin);
		window.close();
      } else {
		console.warn('OAuth callback is missing required parameters.');
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

    _getContextBaseUrl: function() {
      var parts = window.location.pathname.split('/').filter(Boolean);
      var contextPath = '';
      if (parts.length > 0) {
        // If first segment is not a file name, treat it as the webapp context path.
        var first = parts[0];
        if (first.indexOf('.') === -1) {
          contextPath = '/' + first;
        }
      }
      return window.location.origin + contextPath;
    },

    _readCookie: function(name) {
      var key = name + '=';
      var cookies = document.cookie ? document.cookie.split(';') : [];
      for (var i = 0; i < cookies.length; i++) {
        var c = cookies[i].trim();
        if (c.indexOf(key) === 0) {
          return decodeURIComponent(c.substring(key.length));
        }
      }
      return null;
    },

    _logoutFromSpringAuthServer: function() {
      var logoutUrl = this._getContextBaseUrl() + '/logout';
      var csrfToken = this._readCookie('XSRF-TOKEN');
      var headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
      };
      var body = '';

      if (csrfToken && csrfToken.length > 0) {
        headers['X-XSRF-TOKEN'] = csrfToken;
        body = '_csrf=' + encodeURIComponent(csrfToken);
      }

      return fetch(logoutUrl, {
        method: 'POST',
        credentials: 'same-origin',
        headers: headers,
        body: body
      });
    },
    
    signOut: function() {
      var self = this;
      var finalizeSignOut = function() {
        self.deleteTokenInfo();
        esriId.destroyCredentials();
        window.location.reload();
      };

      this._logoutFromSpringAuthServer()
      .then(function() {
        finalizeSignOut();
      })
      .catch(function(error) {
        // Keep local sign-out resilient even if server logout fails.
        console.warn('Server logout failed:', error);
        finalizeSignOut();
      });
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