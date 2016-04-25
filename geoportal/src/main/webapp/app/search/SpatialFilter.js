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
        "dojo/query",
        "dojo/on",
        "dojo/dom-construct",
        "dojo/text!./templates/SpatialFilter.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent",
        "app/search/DropPane",
        "app/search/QClause",
        "app/etc/GeohashEx",
        "esri/map",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/layers/GraphicsLayer",
        "esri/geometry/webMercatorUtils",
        "esri/geometry/Point",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/PictureMarkerSymbol",
        "esri/renderers/ClassBreaksRenderer",
        "esri/renderers/SimpleRenderer",
        "esri/graphic",
        "esri/Color"], 
function(declare, lang, array, djQuery, on, domConstruct, template, i18n, SearchComponent, 
    DropPane, QClause, GeohashEx, Map, ArcGISTiledMapServiceLayer, GraphicsLayer,
    webMercatorUtils, Point, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol,       
    PictureMarkerSymbol, ClassBreaksRenderer, SimpleRenderer, Graphic, Color) {
  
  var oThisClass = declare([SearchComponent], {
    
    i18n: i18n,
    templateString: template,
    
    basemapUrl: null,
    allowAggregation: true,
    relationsNode: null,
    field: "envelope_geo",
    pointField: "envelope_cen_pt",
    label: i18n.search.spatialFilter.label,
    lodToGeoHashGridPrecision: null,
    open: false,
    
    map: null,
    
    postCreate: function() {
      this.inherited(arguments);
      this.initializeChoices();
      this.initializeMap(); 
      
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
      if (!this.lodToGeoHashGridPrecision) this.lodToGeoHashGridPrecision = _lodToGeoHashGridPrecision;
    },
    
    equalInterval: function(min,max) {
      var newsym = function(size) {
        var olclr = Color.fromHex("#7A7A7A");
        var sym = new SimpleMarkerSymbol().setSize(size);
        sym.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,olclr,1));
        return sym;
      };
      var defaultSym = new SimpleMarkerSymbol().setSize(0);
      var renderer = new ClassBreaksRenderer(defaultSym,"Count");
      // TODO isMaxInclusive ??
      var iv = (max - min) / 4;
      var v0 = 0;
      var v1 = min;
      var v2 = min+iv;
      var v3 = min+(2*iv);
      var v4 = max;
      // 2,5,8,12 - 4,8,12,16
      renderer.addBreak(v0,v1,newsym(4));
      renderer.addBreak(v1,v2,newsym(8));
      renderer.addBreak(v2,v3,newsym(12));
      renderer.addBreak(v3,v4,newsym(16));
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
      if (this.map && lodToGeo) {
        level = this.map.getLevel();
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
      if (typeof r === "string" && r !== "anywhere" && r.length > 0) return r;
      return "anywhere";
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
      },this.dropPane.toolsNode);
      
      var addChoice = function(lbl,op) {
        var spn = domConstruct.create("span",{
          "class": "g-spatial-filter-relation",
          title: op
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
      
      addChoice(i18n.search.spatialFilter.anywhere,"anywhere").checked = true;
      addChoice(i18n.search.spatialFilter.intersects,"intersects");
      addChoice(i18n.search.spatialFilter.within,"within");
    },
    
    initializeMap: function() {
      var mapProps = this.map;
      this.map = null;
      var oMap = new Map(this.mapNode,mapProps);
      var s = this.basemapUrl;
      if (!s) {
        // TODO: lookup from config default?
      }
      if (s) {
        var basemap = new ArcGISTiledMapServiceLayer(s);
        oMap.addLayer(basemap);
      }
      this.own(on(oMap,"Load",lang.hitch(this,function(){
        this.map = oMap;
        window.searchMap = this.map;
        this.own(on(oMap,"ExtentChange",lang.hitch(this,function(){
          if (this.getRelation() !== "anywhere") this.search();
        })));
       // this.onMapLoad();
      })));
    },
    
    /* SearchComponent API ============================================= */
    
    appendQueryParams: function(params) {
      if (!this.hasField()) return;
      var relation = this.getRelation();
      var qClause = null;
      if (this.map && relation !== "anywhere") {
        var env = this.map.geographicExtent;
        if (env) {
          var xmin = env.xmin, ymin = env.ymin;
          var xmax = env.xmax, ymax = env.ymax;
          if (xmin < -180) xmin = -180;
          if (xmax > 180) xmax = 180;
          if (ymin < -90) ymin = -90;
          if (ymax > 90) ymax = 90;
          var sEnv = xmin+" "+ymin+" "+xmax+" "+ymax;
          var lbl = this.label;
          var tip = sEnv;
          var shape = {
            "type": "envelope",
            "coordinates": [[xmin,ymax], [xmax,ymin]]  
          };
          var query = {"geo_shape":{}};
          query.geo_shape[this.field] = {"shape":shape,"relation":relation};
          qClause = new QClause({
            label: lbl,
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
      
      if (this.allowAggregation && this.hasPointField()) {
        // TOD0 does this need a filter
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
      if (!searchResponse.aggregations) return;
      var map = this.map, lyr;
      if (map) {
        lyr = map.getLayer("clusters");
        if (lyr) map.removeLayer(lyr);
      }
      var key = this.getAggregationKey();
      var data = searchResponse.aggregations[key];
      if (map && data && data.buckets && data.buckets.length > 0) {
        var clusterLayer = new GraphicsLayer({
          id: "clusters"
        });
        var min = null, max = null;
        var geohash = new GeohashEx();
        array.forEach(data.buckets,function(entry){
          var key = entry.key;
          var docCount = entry.doc_count;
          try {
            var count = entry.doc_count;
            if (min === null || count < min) min = count;
            if (max === null || count > max) max = count;
            var location = geohash.decode(entry.key);
            //console.warn("location",location);
            var xy = webMercatorUtils.lngLatToXY(location.longitude, location.latitude); // TODO???
            //var xy = [location.longitude, location.latitude];
            var pt = new Point(xy[0],xy[1],map.spatialReference);
            var attributes = {"Count":count};
            clusterLayer.add(new Graphic(pt,null,attributes));
          } catch(ex) {
            //console.warn(ex);
          }
        },this);
        if (min === null) min = 0;
        if (max === null) max = min;
        var renderer = this.equalInterval(min,max);
        clusterLayer.setRenderer(renderer);
        map.addLayer(clusterLayer);
        //console.warn("clusterLayer",clusterLayer);
      }
    },
    
    whenQClauseRemoved: function(qClause) {
      if (this === qClause.parentQComponent) {
        djQuery("input[data-op=anywhere]",this.relationsNode)[0].checked = true;
      }
    }
    
  });
  
  return oThisClass;
});