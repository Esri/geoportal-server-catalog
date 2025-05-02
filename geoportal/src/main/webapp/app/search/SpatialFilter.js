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
        "dojo/aspect",
        "dojo/query",
        "dojo/on",
        "dojo/dom-construct",
        "dojo/dom-class",
        "dojo/dom-geometry",
        "dojo/dom-style",
        "dojo/number",
        "dojo/topic",
        "app/context/app-topics",
        "dojo/text!./templates/SpatialFilter.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent",
        "app/search/DropPane",
        "app/search/QClause",
        "app/etc/GeohashEx",
        "app/etc/util",
        "app/search/SpatialFilterSettings",
        "esri4/Map",
        "esri4/views/MapView",
        "esri4/layers/TileLayer",
        "esri4/layers/MapImageLayer",
        "esri4/layers/GraphicsLayer",
        "esri4/layers/FeatureLayer",
        "esri4/geometry/support/webMercatorUtils",
        "esri4/geometry/Extent",
        "esri4/geometry/Point",
        "esri4/geometry/SpatialReference",
        "esri4/symbols/SimpleMarkerSymbol",
        "esri4/symbols/SimpleLineSymbol",
        "esri4/symbols/SimpleFillSymbol",
        "esri4/symbols/PictureMarkerSymbol",
        "esri4/renderers/ClassBreaksRenderer",
        "esri4/renderers/SimpleRenderer",
        "esri4/Graphic",
        "esri4/Color",
        "esri4/PopupTemplate",        
        "esri4/widgets/Search",
        "esri4/core/reactiveUtils",
        "dojo/Deferred",
        "esri4/rest/locator",
        "esri4/geometry/support/webMercatorUtils"],
function(declare, lang, array, aspect, djQuery, on, domConstruct, domClass, domGeometry, domStyle, djNumber,
    topic, appTopics, template, i18n, SearchComponent, DropPane, QClause, GeohashEx, util, Settings, Map,MapView,
    TileLayer, MapImageLayer, GraphicsLayer, FeatureLayer,webMercatorUtils, Extent, Point, SpatialReference,
    SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, PictureMarkerSymbol, ClassBreaksRenderer,
    SimpleRenderer, Graphic, Color, PopupTemplate, SearchWidget, reactiveUtils,Deferred, Locator,WebMercatorUtils) {

  var oThisClass = declare([SearchComponent], {

    i18n: i18n,
    templateString: template,

    allowAggregation: true,
    allowSettings: null,
    basemapUrl: null,
    relationsNode: null,
    field: "envelope_geo",
    pointField: "envelope_cen_pt",
    label: i18n.search.spatialFilter.label,
    locatorParams: null,
    lodToGeoHashGridPrecision: null,
    open: false,
    highlightItemOnHover: true,
    showLocator: true,
    map: null,

    _highlighted: null,
    _locator: null,
    _tmpHandles: null,

    postCreate: function() {
      this.inherited(arguments);
      this.initializeChoices();
      this.initializeMap();

      this._initialSettings = {
        label: this.label,
        allowAggregation: this.allowAggregation,
        field: this.field,
        pointField: this.pointField
      };

      if (this.allowSettings === null) {
        if (AppContext.appConfig.search && !!AppContext.appConfig.search.allowSettings) {
          this.allowSettings = true;
        }
      }
      if (this.allowSettings) {
        var link = this.dropPane.addSettingsLink();
        link.onclick = lang.hitch(this,function(e) {
          var d = new Settings({targetWidget:this});
          d.showDialog();
        });
      }

      var _lodToGeoHashGridPrecision = {
        "default": 3,
        "min": 1,
        0: 1,
        1: 1,
        2: 2,
        3: 2,
        4: 3,
        5: 4,
        6: 4,
        7: 5,
        8: 5,
        9: 6,
        10: 6,
        11: 6,
        12: 7,
        13: 7,
        14: 7,
        15: 7,
        16: 7,
        17: 8,
        18: 8,
        19: 8,
        20: 8,
        21: 9,
        22: 9,
        23: 9,
        "max": 9
      };
      /*
      var _lodToGeoHashGridPrecision = {
        "default": 3,
        "min": 1,
        0: 2,
        1: 2,
        2: 3,
        3: 3,
        4: 3,
        5: 4,
        6: 4,
        7: 5,
        8: 5,
        9: 6,
        10: 6,
        11: 6,
        12: 7,
        13: 7,
        14: 7,
        15: 7,
        16: 7,
        17: 8,
        18: 8,
        19: 8,
        20: 8,
        21: 9,
        22: 9,
        23: 9,
        "max": 9
      };
       */
      if (!this.lodToGeoHashGridPrecision) this.lodToGeoHashGridPrecision = _lodToGeoHashGridPrecision;

      var self = this;

      this.own(topic.subscribe(appTopics.OnMouseEnterResultItem,function(params){
        if (!self.highlightItemOnHover) return;
        try {
          var view = self.view, geometry, outSR;
          if (view && params && params.item && params.item.envelope_geo) {
            outSR = view.spatialReference;
            var env = lang.isArray(params.item.envelope_geo) && params.item.envelope_geo.length>0? params.item.envelope_geo[0].coordinates: params.item.envelope_geo.coordinates;
            if (env) {
              geometry = new Extent(env[0][0],env[1][1],env[1][0],env[0][1],new SpatialReference(4326));
            }
          }
          if (geometry && webMercatorUtils.canProject(geometry,outSR)) {
            var projected = webMercatorUtils.project(geometry,outSR);
            if (!self._highlighted) {
              var symbol = new SimpleFillSymbol({style:"solid",color:[255,255,0,0.3],
            	  				outline:{color:[255,0,0],width:2}});
                  
              self._highlighted = new Graphic({geometry:projected,symbol:symbol});
              view.graphics.add(self._highlighted);
            } else {
              self._highlighted.geometry = projected;
              self._highlighted.visible = true;
            }
            self._highlighted.xtnItemId = params.item._id;
          }
        } catch(ex) {
          console.warn("SpatialFilter.OnMouseEnterResultItem");
          console.warn(ex);
        }
      }));

      this.own(topic.subscribe(appTopics.OnMouseLeaveResultItem,function(params){
        if (self._highlighted) self._highlighted.visible = false;
      }));

      var positionLocator = true;
      this.own(aspect.after(this.dropPane,"_setOpenAttr",function() {
        if (positionLocator && self.view && self.view.map._slider && self._locator) {
          var sliderPos = domGeometry.position(self.view.map._slider);
          if (sliderPos.x > 0) {
            var nd = self._locator.domNode;
            domStyle.set(nd,"left",Math.round(sliderPos.x)+"px");
            domStyle.set(nd,"top",Math.round(sliderPos.y+sliderPos.h)+"px");
          }
        }
      }));
    },

    destroy: function() {
      try {
        if (this._locator) {
          this._locator.destroyRecursive(false);
        }
        this._clearTmpHandles();
      } catch(ex) {}
      this.inherited(arguments);
    },

    _clearTmpHandles: function() {
      try {array.forEach(this._tmpHandles,function(h) {h.remove();});}
      catch(ex) {console.warn(ex);}
      this._tmpHandles = [];
    },

    _convertConfig: function(config) {
      var sources = [];
      array.forEach(config.sources, lang.hitch(this, function(source) {
        if (source && source.url && source.type === 'locator') {
          var _source = {
            locator: new Locator(source.url || ""),
            outFields: ["*"],
            singleLineFieldName: source.singleLineFieldName || "",
            name: source.name || "",
            placeholder: source.placeholder || "",
            countryCode: source.countryCode || "",
            maxSuggestions: source.maxSuggestions,
            maxResults: source.maxResults || 6,
            zoomScale: source.zoomScale || 50000,
            useMapExtent: !!source.searchInCurrentMapExtent
          };
          if (source.enableLocalSearch) {
            _source.localSearchOptions = {
              minScale: source.localSearchMinScale,
              distance: source.localSearchDistance
            };
          }
          sources.push(_source);
        } else if (source && source.url && source.type === 'query') {
          // not supported
        }
      }));
      return sources;
    },

    equalInterval: function(min,max) {
      var newsym = function(size) {       
        var sym = new SimpleMarkerSymbol({size:size,
        	outline:new SimpleLineSymbol({style:"solid", color:[122, 122, 122],width:1})}); 
        
        return sym;
      };
      var defaultSym = new SimpleMarkerSymbol();
      defaultSym.size = 0;
      var renderer = new ClassBreaksRenderer({field:"Count"});
      // TODO isMaxInclusive ??
      var iv = (max - min) / 4;
      var v0 = 0;
      var v1 = min;
      var v2 = min+iv;
      var v3 = min+(2*iv);
      var v4 = max;
      // 2,5,8,12 - 4,8,12,16
      renderer.addClassBreakInfo({minValue:v0,maxValue:v1,symbol:newsym(4)});
      renderer.addClassBreakInfo({minValue:v1,maxValue:v2,symbol:newsym(8)});
      renderer.addClassBreakInfo({minValue:v2,maxValue:v3,symbol:newsym(12)});
      renderer.addClassBreakInfo({minValue:v3,maxValue:v4,symbol:newsym(16)});

      return renderer;
    },

    getGeoHashGridPrecision: function(hasSpatialFilter) {
      // precision ranges from 0..12, 12 is than a square meter
      var getInt = function(v) {
        v = parseInt(""+v,10);
        if (!isNaN(v) && v > 0 && v <= 12) return v;
        return null;
      };
      var precision = null, level = null, lodToGeo = this.lodToGeoHashGridPrecision;
      if (this.view && lodToGeo) {
        level = this.view.zoom;
        if (lodToGeo.hasOwnProperty(level)) {
          precision = getInt(lodToGeo[level]);
        } else if (level > 10 && lodToGeo.hasOwnProperty("max")) {
          precision = getInt(lodToGeo["max"]);
        } else if (level < 2 && lodToGeo.hasOwnProperty("min")) {
          precision = getInt(lodToGeo["max"]);
        }
      }
      if (precision === null && lodToGeo && lodToGeo.hasOwnProperty("default")) {
        precision = getInt(lodToGeo["default"]);
      }
      if (precision === null) precision = 3;
      //console.warn("map-lod:",level," geohash-grid-precision:",precision);
      return precision;
    },

    getRelation: function() {
      var r = djQuery("input[type=radio]:checked",this.relationsNode)[0].getAttribute("data-op");
      if (typeof r === "string" && r !== "any" && r.length > 0) return r;
      return "any";
    },

    hasField: function() {
      return (typeof this.field === "string" && this.field.length > 0);
    },

    hasPointField: function() {
      return (typeof this.pointField === "string" && this.pointField.length > 0);
    },

    initializeChoices: function() {
      var self = this;
      this.dropPane.stopEvents = false;
      var nd = this.relationsNode = domConstruct.create("span",{
        "class": "g-spatial-filter-relations"
      },this.choicesNode);

      var addChoice = function(lbl,op) {
        var spn = domConstruct.create("span",{
          "class": "g-spatial-filter-relation"
        },nd);
        var id = self.id+"_op_"+op;
        var radio = domConstruct.create("input",{
          id: id,
          type: "radio",
          name: self.id+"_op",
          "data-op": op,
          onclick: function(e) {
            e.stopPropagation();
            self.search();
          }
        },spn);
        // "class": "radio-inline",
        var label = domConstruct.create("label",{
          "for": id,
          innerHTML: lbl,
          onclick: function(e) {
            e.stopPropagation();
          }
        },spn);
        return radio;
      };

      addChoice(i18n.search.spatialFilter.any,"any").checked = true;
      addChoice(i18n.search.spatialFilter.intersects,"intersects");
      addChoice(i18n.search.spatialFilter.within,"within");
    },

    initializeMap: function() {
      var mapProps = this.map || AppContext.appConfig.searchMap || {};
      if (mapProps) mapProps = lang.clone(mapProps);
      var v = mapProps.basemapUrl;
      delete mapProps.basemapUrl;
      if (typeof mapProps.basemap === "string" && mapProps.basemap.length > 0) {
        v = null;
      }


      this.map = null;
      var map = new Map({basemap:"streets"});
      this.view = new MapView({
      	  container:this.mapNode,
      	  map: map, 
      	  center: mapProps.center,
      	  zoom: mapProps.zoom      	  
      	});
      
      this.view.ui.remove("attribution");   
      if (typeof v === "string" && v.length > 0) {
        v =  util.checkMixedContent(v);
        var basemap;
        if (!mapProps.isTiled) {
          basemap = new MapImageLayer(v);
        } else {
          basemap = new TileLayer(v);
        }
        map.add(basemap);
      }
      

      this.view.when(lang.hitch(this,function() {    	
    	  this.map = map;
    	  window.AppContext.searchMap = this.map
    	  // this.initializeLocator();
    	  const searchWidget = new SearchWidget({
    		  view: this.view
    		});
    	  this.view.ui.add(searchWidget, {
    		  position: "top-left",
    		  index: 0
    		});  
    	}))    	
      
      reactiveUtils.when(() => this.view.stationary === true, () => {    	 
    	  // Get the new extent of the view only when view is stationary.
    	  if (this.view.extent) {
    		  if (this.getRelation() !== "any") 
    			 {    			
    			  var proJExtent = webMercatorUtils.webMercatorToGeographic(this.view.extent, false)
    			  this.map.geographicExtent = proJExtent;
    			  this.search();
    			 }
    	  	}
    	});

    },

    /* SearchComponent API ============================================= */

    appendQueryParams: function(params) {
      if (!this.hasField()) return;
      var field = this.field, pointField = this.pointField;
      var relation = this.getRelation();
      var map = this.map, qClause = null;
      var env1, env2, query, tip;

      var chkBnd = function(env) {
        if (!env) return;
        if (env.xmin < -180) env.xmin = -180;
        if (env.xmax > 180) env.xmax = 180;
        if (env.ymin < -90) env.ymin = -90;
        if (env.ymax > 90) env.ymax = 90;
      };

      var makeQuery = function(env) {
        var shp = {
          "type": "envelope",
          "coordinates": [[env.xmin,env.ymax], [env.xmax,env.ymin]]
        };
        var qry = {"geo_shape":{}};
        qry.geo_shape[field] = {"shape":shp,"relation":relation};

        var queryPoints = field.endsWith("_pt");
        if (queryPoints) {
          qry = {"geo_bounding_box": {}};
          qry.geo_bounding_box[pointField] = {
            "top_left" : {
              "lat" : env.ymax,
              "lon" : env.xmin
            },
            "bottom_right" : {
              "lat" : env.ymin,
              "lon" : env.xmax
            }
          };
        }

        return qry;
      };

      if (map && relation !== "any") {
        //console.warn("map.geographicExtent",map.geographicExtent);
        var env = map.geographicExtent;
        if (env) {
          env1 = {xmin:env.xmin,ymin:env.ymin,xmax:env.xmax,ymax:env.ymax};
          if (map.wrapAround180) {
            //console.warn("xmin",env1.xmin,"xmax",env1.xmax);
            while (env1.xmin <= env1.xmax && env1.xmin < -180 && env1.xmax < -180) {
              env1.xmin = env1.xmin + 360;
              env1.xmax = env1.xmax + 360;
            }
            while (env1.xmin <= env1.xmax && env1.xmin > 180 && env.xmax > 180) {
              env1.xmin = env1.xmin - 360;
              env1.xmax = env1.xmax - 360;
            }
            //console.warn("... xmin",env1.xmin,"xmax",env1.xmax);
            if (env1.xmin < env1.xmax && env1.xmin < -180 && env1.xmax >= -180) {
              if (env1.xmax > -180) {
                env2 = {xmin:-180,ymin:env1.ymin,xmax:env1.xmax,ymax:env1.ymax};
              }
              env1 = {xmin:env1.xmin + 360,ymin:env1.ymin,xmax:180,ymax:env1.ymax};
            } else if (env1.xmin < env1.xmax && env1.xmin < 180 && env1.xmax >= 180) {
              if (env1.xmax > 180) {
                env2 = {xmin:-180,ymin:env1.ymin,xmax:env1.xmax - 360,ymax:env1.ymax};
              }
              env1 = {xmin:env1.xmin,ymin:env1.ymin,xmax:180,ymax:env1.ymax};
            }
            //console.warn("... ... xmin",env1.xmin,"xmax",env1.xmax);
          }

          chkBnd(env1);
          chkBnd(env2);
          if (env2) {
            tip = env1.xmin+" "+env1.ymin+" "+env2.xmax+" "+env1.ymax;
            // TODO relation="within" - what if the indexed shape crosses 180?
            query = {"bool": {"should":[makeQuery(env1),makeQuery(env2)]}};
          } else {
            tip = env1.xmin+" "+env1.ymin+" "+env1.xmax+" "+env1.ymax;
            query = makeQuery(env1);
          }

          qClause = new QClause({
            label: this.label,
            tip: tip,
            parentQComponent: this,
            removable: true,
            query: query
          });
        }
      }
      if (qClause === null) {
        this.activeQClauses = null;
      } else {
        this.activeQClauses = [qClause];
        this.appendQClauses(params);
      }

      //TODO test this
      if (this.allowAggregation && this.hasPointField()) {
        // TODO does this need a filter
        var key = this.getAggregationKey();
        var precision = this.getGeoHashGridPrecision((qClause !== null));
        if (!params.aggregations) params.aggregations = {};
        params.aggregations[key] = {"geohash_grid":{
          "field": this.pointField,
          "precision" : precision
        }};
      }
    },

    processResults: function(searchResponse) {
      const process = async () => {  
    	if(this.view) await this.view.when();
     
      this._clearTmpHandles();
      if (this._highlighted) this._highlighted.visible = false;
      if (!searchResponse.aggregations) return;
      var view = this.view, lyr;
      if (view) {
        lyr = view.map.findLayerById("clusters");
        if (lyr) view.map.remove(lyr);
      }
      var key = this.getAggregationKey();
      var data = searchResponse.aggregations[key];
      if (view && data && data.buckets && data.buckets.length > 0) {
        var graphicArr =[];
        var min = null, max = null, outSR = view.spatialReference;
        var geohash = new GeohashEx();
        if (min === null) min = 0;
        if (max === null) max = min;
        var id =1;
        array.forEach(data.buckets,function(entry){
          var key = entry.key;
          var docCount = entry.doc_count;
          try {
            var count = entry.doc_count;
            if (min === null || count < min) min = count;
            if (max === null || count > max) max = count;
            var loc = geohash.decode(entry.key);
            var pt = new Point({longitude:loc.longitude,latitude:loc.latitude,spatialReference:SpatialReference.WGS84});
            if (webMercatorUtils.canProject(pt,outSR)) {
              var pt2 = webMercatorUtils.project(pt,outSR);
              if (pt2) {
                var attributes = {"Count":count,"OBJECTID": id};
                graphicArr.push(new Graphic({geometry:pt2,attributes:attributes}));
                id++;              
              }
            }
          } catch(ex) {
            //console.warn(ex);
          }
        },this);
        if (min === null) min = 0;
        if (max === null) max = min;
        var renderer = this.equalInterval(min,max);
       
        var clusterLayer = new FeatureLayer({
            source: graphicArr,
            id: "clusters",
            title:"clusters",
            geometryType:"point",
            objectIdField: "OBJECTID",         
            fields: [
            	{
	              name: "OBJECTID",
	              type: "oid"
            	},
	            {
            	  name: "Count",
   	              type: "integer"
	            }
            ],
            renderer: renderer
            });
      
       view.map.add(clusterLayer);  
       
       var countPattern = i18n.search.spatialFilter.countPattern;
       var tooltip = d3.select(this.tooltipNode);
       tooltip.style("opacity", 0);
       var hideTooltip = function() {
         tooltip.transition().duration(500).style("opacity", 0);
       };
      
       view.on("pointer-move", function (evt) {
           const screenPoint = {
             x: evt.x,
             y: evt.y
           };

           view.hitTest(screenPoint)
             .then(function (response) {
            	 let c = null;
            	 response.results.some(result => {            		 
            		 if(result && result.layer && result.layer.id === "clusters"
            			 && result.graphic && result.graphic.attributes)
        			 {
            			 c = result.graphic.attributes.Count;
            			 return true;
        			 }
            	 }); 
            	 if (c!=null){
            		 const txt = countPattern.replace("{count}",c);
                     tooltip.transition().duration(200).style("opacity", 1);
                     tooltip.html(txt)
                       .style("left", (evt.x + 12) + "px")
                       .style("top", (evt.y - 20) + "px"); 
            	 }
            	 else{
            		 hideTooltip();
            	 }	
             });
         });
      	}
      } 
      
      process();
      
    },

    whenQClauseRemoved: function(qClause) {
      if (this === qClause.parentQComponent) {
        djQuery("input[data-op=any]",this.relationsNode)[0].checked = true;
      }
    }

  });

  return oThisClass;
});
