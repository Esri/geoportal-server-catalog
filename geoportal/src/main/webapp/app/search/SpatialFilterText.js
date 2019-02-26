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
        "dojo/text!./templates/SpatialFilterText.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent",
        "app/search/DropPane",
        "app/search/QClause",
        "app/etc/GeohashEx",
        "app/etc/util",
        "app/search/SpatialFilterSettings",
        "esri/map",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/layers/GraphicsLayer",
        "esri/geometry/webMercatorUtils",
        "esri/geometry/Extent",
        "esri/geometry/Point",
        "esri/SpatialReference",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/PictureMarkerSymbol",
        "esri/renderers/ClassBreaksRenderer",
        "esri/renderers/SimpleRenderer",
        "esri/graphic",
        "esri/Color",
        "esri/dijit/PopupTemplate",
        "esri/InfoTemplate",
        "esri/dijit/Search",
        "dojo/Deferred",
        "esri/tasks/locator"],
function(declare, lang, array, aspect, djQuery, on, domConstruct, domClass, domGeometry, domStyle, djNumber, 
    topic, appTopics, template, i18n, SearchComponent, DropPane, QClause, GeohashEx, util, Settings, Map, 
    ArcGISTiledMapServiceLayer, GraphicsLayer, webMercatorUtils, Extent, Point, SpatialReference, 
    SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, PictureMarkerSymbol, ClassBreaksRenderer, 
    SimpleRenderer, Graphic, Color, PopupTemplate, InfoTemplate, SearchWidget, Deferred, Locator) {
    /* This creates as spatial filter that is text only.
@author: david valentine valentin@sdsc.edu
 2019-02-25
       */
  var oThisClass = declare([SearchComponent], {
    
    i18n: i18n,
    templateString: template,
    
    allowAggregation: true,
    allowSettings: null,
    basemapUrl: null,
    relationsNode: null,
    field: "envelope_geo",
    pointField: "envelope_cen_pt",
    label: i18n.search.spatialFilter.labelForboundingBox,
    locatorParams: null,
    lodToGeoHashGridPrecision: null,
    open: false,
    highlightItemOnHover: true,
    showLocator: true,
    bBox: new Object() ,
    
    _highlighted: null,
    _locator: null,
    _tmpHandles: null,
    
    postCreate: function() {
      this.inherited(arguments);
      this.initializeChoices();

      
      this._initialSettings = {
        label: this.label,
        allowAggregation: this.allowAggregation
      };

      if (this.allowSettings) {
        var link = this.dropPane.addSettingsLink();
        link.onclick = lang.hitch(this,function(e) {
          var d = new Settings({targetWidget:this});
          d.showDialog();
        });
      }
      

      var self = this;
      

    },
    
    destroy: function() {
      //try {
      //   if (this._locator) {
      //     this._locator.destroyRecursive(false);
      //   }
      //   this._clearTmpHandles();
      // } catch(ex) {}
      this.inherited(arguments);
    },
    
    // _clearTmpHandles: function() {
    //   try {array.forEach(this._tmpHandles,function(h) {h.remove();});}
    //   catch(ex) {console.warn(ex);}
    //   this._tmpHandles = [];
    // },
    
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
      },this.dropPane.toolsNode);
      
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
    
 updateBBox: function(event){

 },
      _getBbox: function (){

          var ymax= parseInt(this.bboxN.value), ymin= parseInt(this.bboxS.value), xmax= parseInt(this.bboxE.value),xmin= parseInt(this.bboxW.value);
          this.bBox.xmin= xmin;
          this.bBox.xmax=xmax;
          this.bBox.ymin=ymin;
          this.bBox.ymax=ymax;
return this.bBox;
          },
    _bBoxIsValid: function () {
      var box = this._getBox();

            if (!box) return;
            if (box.xmin < -180) box.xmin = -180;
            if (box.xmax > 180) box.xmax = 180;
            if (box.ymin < -90) box.ymin = -90;
            if (box.ymax > 90) box.ymax = 90;
       return true;
    },

    /* SearchComponent API ============================================= */
    
    appendQueryParams: function(params) {
      if (!this.hasField()) return;
      var field = this.field, relation = this.getRelation();
      var  qClause = null;
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
        
        // TODO
//        qry = {"geo_bounding_box": {
//          "envelope_cen_pt" : {
//            "top_left" : {
//              "lat" : env.ymax,
//              "lon" : env.xmin
//            },
//            "bottom_right" : {
//              "lat" : env.ymin,
//              "lon" : env.xmax
//            }
//          }
//        }};
        
        return qry;
      };

      if (relation !== "any") {
        //console.warn("map.geographicExtent",map.geographicExtent);
        var env = this._getBbox();
        if (env) {
          env1 = {xmin:env.xmin,ymin:env.ymin,xmax:env.xmax,ymax:env.ymax};
          if (env.xmax<env.xmin ) { // wraps
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
      
      // if (this.allowAggregation && this.hasPointField()) {
      //   // TOD0 does this need a filter
      //   var key = this.getAggregationKey();
      //   var precision = this.getGeoHashGridPrecision((qClause !== null));
      //   if (!params.aggregations) params.aggregations = {};
      //   params.aggregations[key] = {"geohash_grid":{
      //     "field": this.pointField,
      //     "precision" : precision
      //   }};
      // }
    },
    
    processResults: function(searchResponse) {
    //  this._clearTmpHandles();
   //   if (this._highlighted) this._highlighted.hide();
   //    if (!searchResponse.aggregations) return;
   //    // var map = this.map, lyr;
   //    // if (map) {
   //    //   lyr = map.getLayer("clusters");
   //    //   if (lyr) map.removeLayer(lyr);
   //    // }
   //    var key = this.getAggregationKey();
   //    var data = searchResponse.aggregations[key];
   //    if (map && data && data.buckets && data.buckets.length > 0) {
   //      var clusterLayer = new GraphicsLayer({
   //        id: "clusters"
   //      });
   //      var min = null, max = null, outSR = map.spatialReference;
   //      var geohash = new GeohashEx();
   //      array.forEach(data.buckets,function(entry){
   //        var key = entry.key;
   //        var docCount = entry.doc_count;
   //        try {
   //          var count = entry.doc_count;
   //          if (min === null || count < min) min = count;
   //          if (max === null || count > max) max = count;
   //          var loc = geohash.decode(entry.key);
   //          var pt = new Point(loc.longitude,loc.latitude,new SpatialReference(4326));
   //          if (webMercatorUtils.canProject(pt,outSR)) {
   //            var pt2 = webMercatorUtils.project(pt,outSR);
   //            if (pt2) {
   //              var attributes = {"Count":count};
   //              clusterLayer.add(new Graphic(pt2,null,attributes));
   //            }
   //          }
   //        } catch(ex) {
   //          //console.warn(ex);
   //        }
   //      },this);
   //      if (min === null) min = 0;
   //      if (max === null) max = min;
   //      var renderer = this.equalInterval(min,max);
   //      clusterLayer.setRenderer(renderer);
   //      map.addLayer(clusterLayer);
   //      //console.warn("clusterLayer",clusterLayer);
   //
   //      var countPattern = i18n.search.spatialFilter.countPattern;
   //      var tooltip = d3.select(this.tooltipNode);
   //      tooltip.style("opacity", 0);
   //      var hideTooltip = function() {
   //        tooltip.transition().duration(500).style("opacity", 0);
   //      };
   //      this._tmpHandles.push(clusterLayer.on("mouse-over",function(evt){
   //        if (evt.graphic && evt.graphic.attributes) {
   //          var c = djNumber.format(evt.graphic.attributes["Count"]);
   //          var txt = countPattern.replace("{count}",c);
   //          tooltip.transition().duration(200).style("opacity", 1);
   //          tooltip.html(txt)
   //            .style("left", (evt.pageX + 12) + "px")
   //            .style("top", (evt.pageY - 20) + "px");
   //        } else {
   //          hideTooltip();
   //        }
   //      }));
   //      this._tmpHandles.push(clusterLayer.on("mouse-out",function(evt){
   //        hideTooltip();
   //      }));
   //    }
    },
    
    whenQClauseRemoved: function(qClause) {
      if (this === qClause.parentQComponent) {
        djQuery("input[data-op=any]",this.relationsNode)[0].checked = true;
      }
    }
    
  });
  
  return oThisClass;
});