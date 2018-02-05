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
  "dojo/_base/array",
  "dojo/date/locale",
  "dojo/dom-class",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dojo/text!./templates/ItemCard.html",
  "./util"],
function(declare, array, locale, domClass, _WidgetBase, _TemplatedMixin,
  _WidgetsInTemplateMixin, template, util, LayerLoader) {

  var _def = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    i18n: null,
    templateString: template,

    canRemove: false,
    item: null,
    resultsPane: null,
    searchResponse: null,
    typeInfo: null,

    _dfd: null,

    postCreate: function() {
      this.inherited(arguments);
      this.linksButton.xtnDDContent = this.linksContent;
      this.addButton.innerHTML = this.i18n.search.item.actions.add;
      this.detailsButton.innerHTML = this.i18n.search.item.actions.details;
      this.linksButton.innerHTML = this.i18n.search.item.actions.links;
      this.addButton.setAttribute("disabled","disabled");
      this.detailsButton.setAttribute("disabled","disabled");
      this.linksButton.setAttribute("disabled","disabled");
    },

    startup: function() {
      if (this._started) {
        return;
      }
      this.inherited(arguments);
      this.render(this.searchResponse,this.item);
    },

    addClicked: function() {
      console.log("addClicked");
      return;
      /*
      var self = this,
        btn = this.addButton;
      if (domClass.contains(btn, "disabled")) {
        return;
      }
      domClass.add(btn, "disabled");

      if (this.canRemove) {
        var map = this.resultsPane.getMap();
        util.setNodeText(self.messageNode, i18n.search.item.messages.removing);
        var lyrs = util.findLayersAdded(map, this.item.id).layers;
        array.forEach(lyrs, function(lyr) {
          //console.warn("removingLayer",lyr);
          map.removeLayer(lyr);
        });
        this.canRemove = false;
        util.setNodeText(self.messageNode, "");
        util.setNodeText(this.addButton, i18n.search.item.actions.add);
        domClass.remove(btn, "disabled");

      } else {
        util.setNodeText(self.messageNode, i18n.search.item.messages.adding);
        var loader = new LayerLoader();
        loader.addItem(this.item, this.resultsPane.getMap()).then(function(result) {
          //console.warn("addClicked.result",result);
          if (result) {
            self.canRemove = true;
            util.setNodeText(self.messageNode, "");
            util.setNodeText(self.addButton, i18n.search.item.actions.remove);
            domClass.remove(btn, "disabled");
          } else {
            util.setNodeText(self.messageNode, i18n.search.item.messages.addFailed);
            domClass.remove(btn, "disabled");
          }
        }).otherwise(function(error) {
          console.warn("Add layer failed.");
          console.warn(error);
          util.setNodeText(self.messageNode, i18n.search.item.messages.addFailed);
          domClass.remove(btn, "disabled");
          if (error && typeof error.message === "string" && error.message.length > 0) {
            // TODO show this message
            //console.warn("msg",error.message);
            //util.setNodeText(self.messageNode,error.message);
            console.log('');
          }
        });
      }
      */
    },

    addLink: function(typeName,href) {
      //href = util.checkMixedContent(href); // TODO?
      var v = href;
      if (typeof typeName === "string" && typeName.length > 0) {
        v = typeName + " " + href; // TODO i18n
      }
      var a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      util.setNodeText(a,v);
      this.linksContent.appendChild(a);
      this.linksButton.removeAttribute("disabled");
    },

    detailsClicked: function() {
      if (this.typeInfo && this.typeInfo.detailsUrl) {
        var url = util.checkMixedContent(this.typeInfo.detailsUrl);
        window.open(url);
      }
    },

    determineType: function(response,item) {
      /*
      "liveData": ["FeatureServer","Feature Service",
                   "MapServer","Map Service",
                   "ImageServer","Image Service",
                   "SceneServer","Scene Service",
                   "VectorTileServer","Vector Tile Service",
                   "KML","WMS","WFS","WCS","WMTS"]
      */
      var addable = {
        "featureserver": "Feature Service",
        "feature service": "Feature Service",
        "imageserver": "Image Service",
        "image service": "Image Service",
        "mapserver": "Map Service",
        "map service": "Map Service",
        "wms": "WMS",
        "kml": "KML"
      };
      var typeInfo = {
        canAdd: false,
        serviceType: null,
        type: null,
        url: null,
        detailsUrl: null
      };
      var self = this;
      if (Array.isArray(item.links)) {
        item.links.forEach(function(link){
          if (link.rel === "related") {
            if (typeof link.dctype === "string" && link.dctype.length > 0) {
              if (!typeInfo.type) {
                typeInfo.type = link.dctype;
                typeInfo.url = link.href;
              }
            }
          } else if (link.rel === "alternate") {
            if (link.type === "text/html") {
              if (typeof link.href === "string" &&
                 (link.href.indexOf("http://") === 0 ||
                  link.href.indexOf("https://") === 0)) {
                typeInfo.detailsUrl = link.href;
                self.detailsButton.removeAttribute("disabled");
              }
            }
          }
        });
      }
      if (!typeInfo.type && item._source && item._source.type) {
        typeInfo.type = item._source.type;
      }
      if (typeInfo.type) {
        typeInfo.serviceType = addable[typeInfo.type.toLowerCase()];
        if (typeInfo.serviceType && typeof typeInfo.url === "string" &&
           (typeInfo.url.indexOf("http://") === 0 ||
            typeInfo.url.indexOf("https://") === 0)) {
          typeInfo.canAdd = true;
          this.addButton.removeAttribute("disabled");
        }
      }
      this.typeInfo = typeInfo;
    },

    formatDate: function(date) {
      if (typeof(date) === "number") date = new Date(date);
      return locale.format(date,{selector:"date",formatLength:"long"});
    },

    getAuthor: function(response,item) {
      var author = item.author;
      if (author) {
        if (Array.isArray(author)) {
          if (author.length > 1) {
            console.log("***** multiple authors",author);
          }
          if (author.length > 0) {
            // TODO concatenate multiples
            return author[0].name;
          }
        } else if (typeof author.name === "string") {
          return author.name;
        }
      }
      return null;
    },

    getDate: function(response,item) {
      var date, iso;
      if (typeof item.updated === "string" && item.updated.length > 0) {
        iso = item.updated;
      } else if (typeof item.published === "string" && item.published.length > 0) {
        iso = item.published;
      }
      if (typeof iso === "string" && iso.length > 0) {
        date = Date.parse(iso);
        return this.formatDate(date);
      }
      return null;
    },

    getTitle: function(response,item) {
      if (typeof item.title === "string" && item.title.length > 0) {
        return item.title;
      }
      // TODO i18n
      return "Untitled";
    },

    getType: function(response,item) {
      if (this.typeInfo) {
        return this.typeInfo.type;
      }
      return null;
    },

    linksClicked: function() {
      if (this.searchPane) {
        this.searchPane._ddClicked = this.linksContent;
      }
      this.linksContent.classList.toggle("show");
      util.mitigateDropdownClip(this.linksButton,this.linksContent);
      /*
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
      */
    },

    render: function(response,item) {
      this.determineType(response,item);
      //console.log("render.response",response);
      //console.log("render.item",item);
      //console.log("render.typeInfo",this.typeInfo);
      var pattern, v;
      var title = this.getTitle(response,item);
      var type = this.getType(response,item);
      var author = this.getAuthor(response,item);
      var date = this.getDate(response,item);

      util.setNodeText(this.titleNode,title);
      util.setNodeTitle(this.titleNode,title);
      if (typeof type === "string" && type.length > 0 &&
          typeof author === "string" && author.length > 0) {
        pattern = this.i18n.search.item.typeByOwnerPattern;
        v = pattern.replace("{type}",type).replace("{owner}",author);
        util.setNodeText(this.typeNode,v);
        util.setNodeTitle(this.typeNode,v);
      } else {
        util.setNodeText(this.typeNode,type);
        util.setNodeTitle(this.typeNode,type);
        util.setNodeText(this.authorNode,author);
        util.setNodeTitle(this.authorNode,author);
      }
      util.setNodeText(this.dateNode,date);

      this.renderLinks(response,item);
      /*
      if (this.canRemove) {
        util.setNodeText(this.addButton, i18n.search.item.actions.remove);
      }
      */
    },

    renderLinks: function(response,item) {
      var self = this, links = item.links;
      var href, typeName;
      if (Array.isArray(links)) {
        links.forEach(function(link){
          //console.log("link",link);
          href = link.href;
          if (link.rel === "icon") {
            if (typeof href === "string" &&
               (href.indexOf("http://") === 0 ||
                href.indexOf("https://") === 0)) {
              self.thumbnailImage.src = util.checkMixedContent(href);
              self.thumbnailDiv.classList.remove("thumbnail-placeholder");
            }
          //} else if (link.rel === "related") {
          } else {
            // link.rel === "alternate" link.rel === "related"
            if (typeof href === "string" &&
               (href.indexOf("http://") === 0 ||
                href.indexOf("https://") === 0 ||
                href.indexOf("ftp://") === 0 ||
                href.indexOf("ftps://") === 0)) {
              typeName = "";
              if (link.type === "text/html") {
                typeName = "HTML";
              } else if (link.type === "application/json") {
                typeName = "JSON";
              } else if (link.type === "application/xml") {
                typeName = "XML";
              } else if (href.indexOf("http") === 0) {
                typeName = "HTTP";
              } else if (href.indexOf("ftp") === 0) {
                typeName = "FTP";
              }
              self.addLink(typeName,href);
            }
          }
        });
      }
    }

  });

  return _def;
});
