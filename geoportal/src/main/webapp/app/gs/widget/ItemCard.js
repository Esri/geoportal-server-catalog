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
  "dojo/_base/lang",
  "dojo/date/locale",
  "dojo/dom-class",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "esri4/geometry/Extent",
  "esri4/geometry/SpatialReference",
  "dojo/text!./templates/ItemCard.html",
  "./layers/layerUtil",
  "./util",
  "app/etc/ServiceType",
  "dijit/popup",
  "dijit/TooltipDialog",
  "dijit/form/DropDownButton"],
function(declare, array, lang,locale, domClass, _WidgetBase, _TemplatedMixin,
  _WidgetsInTemplateMixin, Extent, SpatialReference, template, layerUtil, util,ServiceType, popup) {

  var _def = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    i18n: null,
    templateString: template,

    canRemove: false,
    item: null,
    referenceId: null,
    resultsPane: null,
    searchResponse: null,
    supportsRemove: false,
    typeInfo: null,

    postCreate: function() {
      this.inherited(arguments);
      this.zoomButton.innerHTML = this.i18n.search.item.actions.zoom;
      this.addButton.innerHTML = this.i18n.search.item.actions.add;
      this.detailsButton.innerHTML = this.i18n.search.item.actions.details;
      this.linksCaptionNode.innerHTML = this.i18n.search.item.actions.links;
      this.zoomButton.setAttribute("disabled","disabled");
      this.addButton.setAttribute("disabled","disabled");
      this.detailsButton.setAttribute("disabled","disabled");
      this.linksDropdown.set("disabled",true);
    },

    startup: function() {
      if (this._started) {
        return;
      }
      this.inherited(arguments);
      this.evaluateBBox(this.item);
      this.render(this.searchResponse,this.item);
    },
    
    evaluateBBox: function(item) {
      if (!item.bbox && (item._source && item._source.envelope_geo)) {
        for (var i=0; i<item._source.envelope_geo.length; i++) {
          var geo = item._source.envelope_geo[i]
          if (geo.coordinates && geo.coordinates.length==2) {
            var ul = geo.coordinates[0] // upper-left
            var lr = geo.coordinates[1] // lower-right
            if (ul.length==2 && lr.length==2) {
              item.bbox = {
                xmin: ul[0],
                ymin: lr[1],
                xmax: lr[0],
                ymax: ul[1]
              }
              break
            }
          }
        }
      }
    },

    addClicked: function() {
      var self = this, btn = this.addButton;
      if (domClass.contains(btn,"disabled")) {
        return;
      }
      domClass.add(btn,"disabled");

      var widgetContext = this.resultsPane.getWidgetContext();
      var typeInfo = this.typeInfo;
      var referenceId = this.referenceId;
      var dfd, item = null, itemData = null;
      if (typeInfo && typeInfo.serviceType) {
        if (this.canRemove) {
          var mapView = this.resultsPane.getView();
          var lyrs = layerUtil.findLayersAdded(mapView,referenceId).layers;
          array.forEach(lyrs,function(lyr) {            
        	  mapView.map.layers.remove(lyr);        	  
          });
          this.canRemove = false;
          util.setNodeText(self.messageNode,"");
          util.setNodeText(self.addButton,self.i18n.search.item.actions.add);
          domClass.remove(btn,"disabled");
        } else {
          //util.setNodeText(self.messageNode,self.i18n.search.item.messages.adding);

          if (typeInfo.portalItem && typeInfo.portalItemUrl) {
            dfd = widgetContext.addItem(typeInfo.serviceType,typeInfo.url,
              typeInfo.portalItem,typeInfo.portalItemUrl,referenceId);
          } else {
            dfd = widgetContext.addLayer(typeInfo.serviceType,typeInfo.url,referenceId);
          }
          dfd.then(function(result){
            if (result) {
              if (self.supportsRemove) {
                self.canRemove = true;
                util.setNodeText(self.addButton,self.i18n.search.item.actions.remove);
              }
              util.setNodeText(self.messageNode,"");
              domClass.remove(btn,"disabled");
            } else {
              util.setNodeText(self.messageNode,self.i18n.search.item.messages.addFailed);
              domClass.remove(btn,"disabled");
            }
          }).catch(function(error){
            // TODO popup a message
            console.warn("Add layer failed",typeInfo.url);
            console.error(error);
            util.setNodeText(self.messageNode,self.i18n.search.item.messages.addFailed);
            domClass.remove(btn,"disabled");
            if (error && typeof error.message === "string" && error.message.length > 0) {
              // TODO show this message
              //console.warn("msg",error.message);
              //util.setNodeText(self.messageNode,error.message);
              console.log("");
            }
          });
        }

      }
    },

    addLink: function(typeName,href) {
      //href = util.checkMixedContent(href); // TODO?
      var self = this, v = href;
      if (typeof typeName === "string" && typeName.length > 0) {
        v = typeName + " " + href; // TODO i18n
      }
      var a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.onclick = function(){
        popup.close(self.linksTooltipDialog);
      };
      util.setNodeText(a,v);
      this.linksContent.appendChild(a);
      this.linksDropdown.set("disabled",false);
      //this.linksButton.removeAttribute("disabled");
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
        "wmts":"WMTS",
        "wfs": "WFS",
        "kml": "KML",
        "vectortileserver": "Vector Tile Service",
        "vector tile service": "Vector Tile Service",
        "imagerytilelayer": "Imagery Tile Layer",
        "ogcfeatureserver": "OGC Feature Server",
        "group layer":"Group Layer",
        "grouplayer":"Group Layer"	
        
      };

      this.referenceId = response.sourceKey+"-refid-"+item.id;
      var typeInfo = {
        canAdd: false,
        detailsUrl: null,
        portalItem: null,
        portalItemUrl: null,
        serviceType: null,
        type: null,
        url: null
      };
      var self = this;
      //Determine service type - similar done in Catalog app
      var urlLinks = item._source.links_s;
      if (!typeInfo.type && urlLinks && urlLinks.length >0)
	  {
    	  array.some(urlLinks, lang.hitch(this, function(u){
    	        var serviceType = new ServiceType();
    	        serviceType.checkUrl(u);
    	        serviceType.title = item.title;    	        
    	        if (serviceType.isSet()) {
    	        	typeInfo.type = serviceType.type;
    	        	typeInfo.url = u;
    	        }
    	  }))
	  }
      
      if (!typeInfo.type && Array.isArray(item.links)) {
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
            } else if (link.type === "application/json") {
              if (typeof link.href === "string" &&
                 (link.href.indexOf("http://") === 0 ||
                  link.href.indexOf("https://") === 0)) {
                if (response.sourceType === "ArcGIS") {
                  typeInfo.portalItem = item._source;
                  typeInfo.portalItemUrl = link.href;
                }
              }
            }
          }
        });
      }
      if (!typeInfo.type && item._source && item._source.type) {
        typeInfo.type = item._source.type;
      }
      //For Group Layer
      if (!typeInfo.type && item && item._source && item._source && item._source.type_s)
      {    	 
      	//Geoportal Catalog
    	  typeInfo.type = util.readItemServiceType(item._source.type_s);
    	  if(typeInfo.type &&  typeInfo.type === 'GroupLayer')
		  {
    		  if(urlLinks && urlLinks.length >0)
			  {
    			  typeInfo.url = urlLinks[0];
			  }    		  
		  }  
      }
      
      if (typeInfo.type) {
        typeInfo.serviceType = addable[typeInfo.type.toLowerCase()];
        //In group layer, url is null
        if(typeInfo.serviceType === "Group Layer")
    	{
        	typeInfo.canAdd = true;
            this.addButton.removeAttribute("disabled");
    	}
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
    	//TODO where to store this config or not needed 
//      if (!this.searchPane.widgetContext.widgetConfig.showOwner) {
//        return "";
//      }
      var author = item.author;
      if (author) {
        if (Array.isArray(author)) {
          //if (author.length > 1) console.log("***** multiple authors",author);
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
      /*
      if (this.searchPane) {
        this.searchPane._ddClicked = this.linksContent;
      }
      this.linksContent.classList.toggle("show");
      util.mitigateDropdownClip(this.linksButton,this.linksContent);
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
      if (typeof type === "string" && type.length > 0 &&
          typeof this.i18n.search.item.types[type] === "string") {
        type = this.i18n.search.item.types[type];
      }

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
      if (this.canRemove) {
        util.setNodeText(this.addButton,this.i18n.search.item.actions.remove);
      }
      if (item.bbox) {
        this.zoomButton.removeAttribute("disabled");
      }
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
    },

    setCanRemove: function(canRemove) {
      this.canRemove = !!canRemove;
      if (this.canRemove) {
        util.setNodeText(this.addButton,this.i18n.search.item.actions.remove);
      } else {
        util.setNodeText(this.addButton,this.i18n.search.item.actions.add);
      }
    },
    
    zoomClicked: function() {
      var extent = new Extent(
                this.item.bbox.xmin, this.item.bbox.ymin, this.item.bbox.xmax, this.item.bbox.ymax,
                new SpatialReference({wkid:4326})
              );
      this.resultsPane.getView().extent = extent;
    }

  });

  return _def;
});
