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
        "dojo/dom-class",
        "dojo/dom-construct",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/ItemCard.html",
        "dojo/i18n!app/nls/resources",
        "app/context/AppClient",
        "app/etc/util",
        "app/common/ConfirmationDialog",
        "app/content/ChangeOwner"], 
function(declare, lang, array, topic, appTopics, domClass, domConstruct,
    _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n, 
    AppClient, util, ConfirmationDialog, ChangeOwner) {
  
  var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
 
    i18n: i18n,
    templateString: template,
    
    isItemCard: true,
    item: null,
    itemsNode: null,
    searchPane: null,
    
    postCreate: function() {
      this.inherited(arguments);
      var self = this;
      topic.subscribe(appTopics.ItemOwnerChanged,function(params){
        if (self.item && self.item === params.item) {
          self._renderOwnerAndDate(self.item);
        }
      });
    },
    
    render: function(hit) {
      var item = this.item = hit._source;
      item._id = hit._id; 
      var links = this._uniqueLinks(item);
      util.setNodeText(this.titleNode,item.title);
      this._renderOwnerAndDate(item);
      util.setNodeText(this.descriptionNode,item.description);
      this._renderThumbnail(item);
      this._renderItemLinks(hit._id,item);
      this._renderLinksDropdown(item,links);
      this._renderOptionsDropdown(hit._id,item);
      this._renderAddToMap(item,links);
    },
    
    _isOwner: function(item) {
      var username = AppContext.appUser.getUsername();
      if (typeof username === "string" && username.length > 0) {
        return (username === item.sys_owner_s);
      }
      return false;
    },
    
    _mitigateDropdownClip: function(dd,ddul) {
      // Bootstrap dropdown menus clipped by scrollable container
      var reposition = function() {
        var t = $(dd).offset().top + 15 - $(window).scrollTop();
        var l = $(dd).offset().left;
        $(ddul).css('top',t);
        $(ddul).css('left',l);
      };
      $(ddul).css("position","fixed");
      $(dd).on('click', function() {reposition();});
      $(window).scroll(function() {reposition();});
      $(this.itemsNode).scroll(function() {reposition();});
      $(window).resize(function() {reposition();});
      //$(window).resize(function() {$(dd).removeClass('open');});
    },
    
    _renderAddToMap: function(item,links) {
      if (links.length === 0) return;
      var endsWith = function(v,sfx) {return (v.indexOf(sfx,(v.length-sfx.length)) !== -1);};
      var actionsNode = this.actionsNode;
      array.some(links, function(u){
        // "mapserver" "featureserver" "imageserver" "kml" "wms" "agsrest" "ags" "webmap"
        var lc, linkType = null, linkUrl = null;
        if (typeof u === "string" && (u.indexOf("http://") === 0 || u.indexOf("https://") === 0)) {
          lc = u.toLowerCase();
          if (lc.indexOf("service=") > 0) {
            if (lc.indexOf("?service=wms") > 0 || lc.indexOf("&service=wms") > 0) {
              linkType = "wms";
              linkUrl = u;
            }
          } else if (lc.indexOf("/rest/services") > 0) {
            if (endsWith(lc,"/mapserver")) {
              linkType = "MapServer";
              linkUrl = u;
            } else if (endsWith(lc,"/featureserver")) {
              linkType = "FeatureServer";
              linkUrl = u;
            } else if (endsWith(lc,"/imageserver")) {
              linkType = "ImageServer";
              linkUrl = u;
            }
          }
          if (linkType === null) {
            if (endsWith(lc,".kml") || endsWith(lc,".kmz") || 
                lc.indexOf("?f=kml") > 0 || lc.indexOf("&f=kml") > 0 || 
                lc.indexOf("?f=kmz") > 0 || lc.indexOf("&f=kmz") > 0) {
              linkType = "kml";
              linkUrl = u;
            }
          }
        }
        
        //linkType = "MapServer"; linkUrl = "http://server.arcgisonline.com/ArcGIS/rest/services/Specialty/Soil_Survey_Map/MapServer";
        
        if (typeof linkUrl === "string") {
          //console.warn(linkType,linkUrl);
          domConstruct.create("a",{
            href: "javascript:void(0)",
            innerHTML: i18n.item.actions.addToMap,
            onclick: function() {
              topic.publish(appTopics.AddToMapClicked,{
                type: linkType,
                url: linkUrl
              });
            }
          },actionsNode);
          return true;
        }
      });
    },
    
    _renderItemLinks: function(itemId,item) {
      var actionsNode = this.actionsNode;
      var uri = "./rest/metadata/item/"+encodeURIComponent(itemId);
      var htmlNode = domConstruct.create("a",{
        href: uri+"/html",
        target: "_blank",
        innerHTML: i18n.item.actions.html
      },actionsNode);
      var xmlNode = domConstruct.create("a",{
        href: uri+"/xml",
        target: "_blank",
        innerHTML: i18n.item.actions.xml
      },actionsNode);
      domConstruct.create("a",{
        href: uri+"?pretty=true",
        target: "_blank",
        innerHTML: i18n.item.actions.json
      },actionsNode);
      var v = item.sys_metadatatype_s;
      if (typeof v === "string" && v === "json") {
        htmlNode.style.visibility = "hidden";
        xmlNode.style.visibility = "hidden";
      }
    },
    
    _renderLinksDropdown: function(item,links) {
      if (links.length === 0) return;
      var dd = domConstruct.create("div",{
        "class": "dropdown",
        "style": "display:inline-block;"
      },this.actionsNode);
      var ddbtn = domConstruct.create("a",{
        "class": "dropdown-toggle",
        "href": "#",
        "data-toggle": "dropdown",
        "aria-haspopup": true,
        "aria-expanded": true,
        innerHTML: i18n.item.actions.links
      },dd);
      domConstruct.create("span",{
        "class": "caret"
      },ddbtn);
      var ddul = domConstruct.create("ul",{
        "class": "dropdown-menu",
      },dd);
      array.forEach(links, function(u){
        var ddli = domConstruct.create("li",{},ddul);
        domConstruct.create("a",{
          "class": "small",
          href: u,
          target: "_blank",
          innerHTML: u
        },ddli);
      });
      this._mitigateDropdownClip(dd,ddul);
    },
    
    _renderOptionsDropdown: function(itemId,item) {
      var self = this;
      var isOwner = this._isOwner(item), isAdmin = AppContext.appUser.isAdmin();
      var links = [];
      
      if (isOwner || isAdmin) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.item.actions.options.deleteItem,
          onclick: function() {
            var dialog = new ConfirmationDialog({
              title: i18n.item.actions.options.deleteItem,
              content: item.title,
              okLabel: i18n.general.del,
              status: "danger"
            });
            dialog.show().then(function(ok){
              if (ok) {
                dialog.okCancelBar.showWorking(i18n.general.deleting,false);
                var client = new AppClient();
                client.deleteItem(itemId).then(function(response){
                  topic.publish(appTopics.ItemDeleted,{
                    itemId: itemId,
                    searchPane: self.searchPane
                  });
                  self.domNode.style.display = "none";
                  dialog.hide();
                }).otherwise(function(error){
                  var msg = i18n.general.error;
                  console.warn("deleteItem.error",error);
                  dialog.okCancelBar.showError(msg,false);
                });
              }
            });
          }
        }));
      }
      
      if (isAdmin) {
        links.push(domConstruct.create("a",{
          "class": "small",
          href: "javascript:void(0)",
          innerHTML: i18n.item.actions.options.changeOwner,
          onclick: function() {
            var dialog = new ChangeOwner({item:item});
            dialog.show();
          }
        }));
      }
      
      if (links.length === 0) return;
      
      var dd = domConstruct.create("div",{
        "class": "dropdown",
        "style": "display:inline-block;"
      },this.actionsNode);
      var ddbtn = domConstruct.create("a",{
        "class": "dropdown-toggle",
        "href": "#",
        "data-toggle": "dropdown",
        "aria-haspopup": true,
        "aria-expanded": true,
        innerHTML: i18n.item.actions.options.caption
      },dd);
      domConstruct.create("span",{
        "class": "caret"
      },ddbtn);
      var ddul = domConstruct.create("ul",{
        "class": "dropdown-menu",
      },dd);
      array.forEach(links,function(link){
        var ddli = domConstruct.create("li",{},ddul);
        ddli.appendChild(link);
      });
      this._mitigateDropdownClip(dd,ddul);
    },
    
    _renderOwnerAndDate: function(item) {
      var owner = item.sys_owner_s;
      var date = item.sys_modified_dt;
      var idx, text = "";
      if (AppContext.appConfig.searchResults.showDate && typeof date === "string" && date.length > 0) {
        idx = date.indexOf("T");
        if (idx > 0) date =date.substring(0,idx);
        text = date;
      }
      if (AppContext.appConfig.searchResults.showOwner && typeof owner === "string" && owner.length > 0) {
        if (text.length > 0) text += " ";
        text += owner;
      }
      if (text.length > 0) {
        util.setNodeText(this.ownerAndDateNode,text);
      }
    },
    
    _renderThumbnail: function(item) {
      var show = AppContext.appConfig.searchResults.showThumbnails;
      var thumbnailNode = this.thumbnailNode;
      if (show && typeof item.url_thumbnail_s === "string" && item.url_thumbnail_s.indexOf("http") === 0) {
        //console.warn(item.url_thumbnail_s);
        //thumbnailNode.src = item.url_thumbnail_s;
        setTimeout(function(){thumbnailNode.src = item.url_thumbnail_s;},1);
        //thumbnailNode.style.display = "none";
      } else {
        thumbnailNode.style.display = "none";
      }
      //thumbnailNode.src = "http://placehold.it/80x60";
    },
    
    _uniqueLinks: function(item) {
      var links = [];
      if (typeof item.links_s === "string") {
        links = [item.links_s];
      } else if (lang.isArray(item.links_s)) {
        array.forEach(item.links_s, function(u){
          if (links.indexOf(u) === -1) links.push(u);
        });
      }
      return links;
    }
    
  });
  
  return oThisClass;
});