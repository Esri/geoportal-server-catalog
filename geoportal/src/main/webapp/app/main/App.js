/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/topic",
        "app/context/app-topics",
        "dojo/router",
        "app/common/Templated",
        "dojo/text!./templates/App.html",
        "dojo/i18n!../nls/resources",
        "app/etc/util",
        "app/main/SearchPanel",
        "app/main/MapPanel",
        "app/main/AboutPanel",
        "app/content/MetadataEditor",
        "app/content/UploadMetadata"],
function(declare, lang, array, topic, appTopics, router, Templated, template, i18n, util, SearchPanel, MapPanel, AboutPanel,
    MetadataEditor, UploadMetadata) {

  var oThisClass = declare([Templated], {

    i18n: i18n,
    templateString: template,

    postCreate: function() {
      this.inherited(arguments);
      var self = this;
      this.updateUI();
      
      var ignoreMapPanelActivated = false;
      
      router.register("searchPanel", lang.hitch(this, function(evt){ 
        $("a[href='#searchPanel']").tab("show");
      }));
      
      router.register("mapPanel", lang.hitch(this, function(evt){ 
        if (!ignoreMapPanelActivated && !this.mapPanel.mapWasInitialized) {
          this.mapPanel.ensureMap();
        }
        $("a[href='#mapPanel']").tab("show");
      }));
      
      router.register("aboutPanel", lang.hitch(this, function(evt){ 
        $("a[href='#aboutPanel']").tab("show");
      }));
      
      router.startup();
      if (!location.hash || location.hash.length==0) {
        this.setHash("searchPanel");
        router.go("searchPanel");
      }
      
      $("a[href='#searchPanel']").on("shown.bs.tab",lang.hitch(this, function(e) {
        this.setHash("searchPanel");
        router.go("searchPanel");
      }));
      $("a[href='#mapPanel']").on("shown.bs.tab",lang.hitch(this, function(e) {
        router.go("mapPanel");
      }));
      $("a[href='#aboutPanel']").on("shown.bs.tab",lang.hitch(this, function(e) {
        router.go("aboutPanel");
      }));

      
      topic.subscribe(appTopics.AddToMapClicked,lang.hitch(this, function(params){
        if (self.mapPanel.mapWasInitialized) {
          router.go("mapPanel");
          self.mapPanel.addToMap(params);
        } else {
          var urlParams = {resource: params.type+":"+this.normalizeUrl(params.url)};
          ignoreMapPanelActivated = true;
          router.go("mapPanel");
          self.mapPanel.ensureMap(urlParams);
          ignoreMapPanelActivated = false;
        }
      }));

      topic.subscribe(appTopics.SignedIn,function(params){
        self.updateUI();
      });

      $("#idAppDropdown").on("show.bs.dropdown",function() {
        self.updateUI();
      });

    },

    /* =================================================================================== */
    
    setHash: function(hash) {
      var el = document.getElementById(hash);
      var id = el.id;
      el.removeAttribute('id');
      location.hash = hash;
      el.setAttribute('id',id);
   },
 
    createMetadataClicked: function() {
      var editor = new MetadataEditor();
      editor.show();
    },

    signInClicked: function() {
      AppContext.appUser.showSignIn();
    },

    signOutClicked: function() {
      AppContext.appUser.signOut();
    },

    uploadClicked: function() {
      if (AppContext.appUser.isPublisher()) (new UploadMetadata()).show();
    },
    
    editFacetClicked: function() {
      console.warn("TODO provide edit facet functionality in App.js")
    },

    /* =================================================================================== */

    getCreateAccountUrl: function() {
      if (AppContext.geoportal && AppContext.geoportal.createAccountUrl) {
        return util.checkMixedContent(AppContext.geoportal.createAccountUrl);
      }
      return null;
    },

    updateUI: function() {
      var updateHref = function(node,link,href) {
        if (typeof href === "string" && href.length > 0) {
          link.href = href;
          node.style.display = "";
        } else {
          link.href = "javascript:void(0)";
          node.style.display = "none";
        }
      };
      var v;
      if (AppContext.appUser.isSignedIn()) {
        v = i18n.nav.welcomePattern.replace("{name}",AppContext.appUser.getUsername());
        util.setNodeText(this.usernameNode,v);
        this.userOptionsNode.style.display = "";
        this.signInNode.style.display = "none";
        this.signOutNode.style.display = "";
        this.adminOptionsBtnNode.style.display = "";
        updateHref(this.createAccountNode,this.createAccountLink,null);
        updateHref(this.myProfileNode,this.myProfileLink,AppContext.appUser.getMyProfileUrl());
      } else {
        this.usernameNode.innerHTML = "";
        this.userOptionsNode.style.display = "none";
        this.createAccountNode.style.display = "none";
        this.signInNode.style.display = "";
        this.signOutNode.style.display = "none";
        this.adminOptionsBtnNode.style.display = "none";
        updateHref(this.createAccountNode,this.createAccountLink,this.getCreateAccountUrl());
        updateHref(this.myProfileNode,this.myProfileLink,null);
      }

      var isAdmin = AppContext.appUser.isAdmin();
      var isPublisher = AppContext.appUser.isPublisher();
      $("li[data-role='admin']").each(function(i,nd) {
        if (isAdmin) nd.style.display = "";
        else nd.style.display = "none";
      });
      $("li[data-role='publisher']").each(function(i,nd) {
        if (isPublisher) nd.style.display = "";
        else nd.style.display = "none";
      });

      if (!FileReader) this.uploadNode.style.display = "none";
    },

    normalizeUrl: function(url) {
      var services = ["mapserver", "imageserver", "featureserver", "streamserver", "vectortileserver"];
      var selSrv = array.filter(services, function(srv) { return url.toLowerCase().indexOf(srv)>=0; });
      if (selSrv && selSrv.length>0) {
        var srv = selSrv[0];
        url = url.substr(0, url.toLowerCase().indexOf(srv) + srv.length);
      }
      return url;
    },
    
    _onHome: function() {
      this.searchPanelLink.click()
      location.hash = "searchPanel"
    }

  });

  return oThisClass;
});
