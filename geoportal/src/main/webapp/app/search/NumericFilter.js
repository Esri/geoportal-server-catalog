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
        "dojo/number",
        "dojo/dom-construct",
        "dojo/dom-geometry",
        "dojo/text!./templates/NumericFilter.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent",
        "app/search/DropPane",
        "app/search/QClause",
        "app/search/NumericFilterSettings",
        "app/search/NumericFilterRange"], 
function(declare, lang, array, djNumber, domConstruct, domGeometry,
    template, i18n, SearchComponent, DropPane, QClause, Settings, NumericFilterRange) {
  
  var oThisClass = declare([SearchComponent], {
    
    i18n: i18n,
    templateString: template,
    
    allowSettings: null,
    field: null,
    fieldsOperator: "must",
    nestedPath: null,
    interval: 1,
    ticks: 4,
    places: 2,
    
    label: i18n.search.numericFilter.label,
    open: false,
        
    _aggValues: null,
    _aggInterval: null,
    _brushExtent: null,
    _searchDisabled: false,
    
    _fromValue: null,
    _toValue: null,
    
    _initialSettings: null,
    
    postCreate: function() {
      this.inherited(arguments);
      
      this._initialSettings = {
        label: this.label,
        field: this.field,
        nestedPath: this.nestedPath,
        interval: this.interval,
        ticks: this.ticks,
        places: this.places
      };
      
      // TODO $(this.intervalSelect).val(this.interval);
      this.plot();
      
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
    },
    
    applyBrushExtent: function() {
      var ext = this._brushExtent;
      if (ext && ext.length === 2) {
        this._fromValue = ext[0];
        this._toValue = ext[1];
        // TODO ES2to5 can't pass decimals to an integer field
        if (this.places === 0) {
          if (typeof this._fromValue === "number") {
            this._fromValue = Math.round(this._fromValue);
          }
          if (typeof this._toValue === "number") {
            this._toValue = Math.round(this._toValue);
          }
        }
        this.search();
      }
    },
    
    formatRange: function(fromValue,toValue,forSearchLink) {
      var v = "", rangePattern;
      if (fromValue || toValue) {
        rangePattern = i18n.search.numericFilter.rangePattern;
        v = rangePattern.replace("{from}",this.formatValue(fromValue));
        v = v.replace("{to}",this.formatValue(toValue));
      }
      return v;
    },
    
    formatValue: function(value) {
      if (typeof value === "undefined" || value === null) return "";
      return djNumber.format(value,{places:this.places});
    },
    
    hasNestedPath: function() {
      return (typeof this.nestedPath === "string" && this.nestedPath.length > 0);
    },
    
    plot: function(customRange) {
      var self = this, svgNode = this.svgNode;
      domConstruct.empty(svgNode);
      this._brushExtent = null;
      this.setNodeText(this.brushExtentNode,"");
      
      var countPattern = i18n.search.numericFilter.countPattern;
      var fmtTip = function(d) {
        var s1 = self.formatValue(d.value);
        var s2 = countPattern.replace("{count}",d.count);
        return s1+"<br>"+s2;
      };
      
      var data = [];
      if (this._aggValues && this._aggValues.buckets) {
        array.forEach(this._aggValues.buckets,function(bucket){
          data.push({value:bucket.key,count:bucket.doc_count});
        });
      }
      
      var w = 150; // 350
      var pos = domGeometry.position(this.dropPane.domNode);
      if (pos.w > 150) {
        w = (pos.w - 25);
      }
      var margin = {top: 10, right: 20, bottom: 80, left: 40};
      var width = w - margin.left - margin.right;
      var height = 70;
      var x = d3.scale.linear().range([0, width]); // ***
      var y = d3.scale.linear().range([height, 0]);
      var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(this.ticks);
      var yAxis = d3.svg.axis().scale(y).orient("left").ticks(this.ticks);
      var xMap = function(d) {return x(d.value);};
      var yMap = function(d) {return y(d.count);};
      x.domain(d3.extent(data.map(function(d){return d.value;})));
      y.domain([0, d3.max(data.map(function(d){return d.count;}))]);
      
      var margin2 = {top: margin.top+height+25, right: 20, bottom: 20, left: 40};
      var height2 = 35;
      var x2 = d3.scale.linear().range([0, width]); // ***
      var y2 = d3.scale.linear().range([height2, 0]);
      var xAxis2 = d3.svg.axis().scale(x2).orient("bottom").ticks(this.ticks);
      x2.domain(x.domain());
      y2.domain(y.domain());
      var area2 = d3.svg.area()
        .interpolate("monotone")
        .x(function(d){return x2(d.value);})
        .y0(height2)
        .y1(function(d){ return y2(d.count);});
      
      var svg = d3.select(svgNode).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
      
      var tooltip = d3.select(svgNode).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
      focus.append("g")
        .attr("class", "y axis")
        .call(yAxis);
      /*
      var clipId = this.id+"_clip";
      var clipUrl = "url("+clipId+")";
      focus.append("defs").append("clipPath")
          .attr("id",clipId)
        .append("rect")
          .attr("width", width)
          .attr("height", height);
      focus.append("g").attr("clip-path",clipUrl);
      */
      focus.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) {return x(d.value);})
        .attr("cy", function(d) {return y(d.count);})
        .on("mouseover", function(d) {
          tooltip.transition()
           .duration(200)
           .style("opacity", 1);
          tooltip.html(fmtTip(d))
           .style("left", (d3.event.pageX + 16) + "px")
           .style("top", (d3.event.pageY - 38) + "px");
        })
        .on("mouseout", function(d) {
          tooltip.transition()
           .duration(500)
           .style("opacity", 0);
        });
      
      var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
      context.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area2);
      context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);
      if (data.length > 0) {
        var arc = d3.svg.arc()
        .outerRadius(height2 / 2)
        .startAngle(0)
        .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });
        var brush = d3.svg.brush()
          .x(x2)
          .extent(customRange? customRange: x2.domain())
          .on("brush",function(){brushmove();});
        var brushg = context.append("g")
          .attr("class", "brush")
          .call(brush);
        brushg.selectAll(".resize").append("path")
          .attr("transform", "translate(0," +  height2 / 2 + ")")
          .attr("d", arc);
        brushg.selectAll("rect")
          .attr("height", height2);
        var brushmove = function() { 
          x.domain(brush.empty() ? x2.domain() : brush.extent());
          focus.selectAll(".dot").attr("cx",xMap).attr("cy",yMap);
          focus.select(".x.axis").call(xAxis);
          var ext = self._brushExtent = brush.extent();
          if (ext && ext.length === 2 && !isNaN(ext[0])) {
            ext = [ext[0],ext[1]];
            self._brushExtent = ext;
            var txt = self.formatRange(ext[0],ext[1],true);
            self.setNodeText(self.brushExtentNode,txt);
          } else {
            self._brushExtent = null;
            self.setNodeText(self.brushExtentNode,"");
          }
        };
        brushmove();        
      }
    },
    
    /* SearchComponent API ============================================= */
    
    appendQueryParams: function(params) {
      var query = null, qNested = null, condition = null;
      var lbl = this.label;
      this._aggInterval = this.interval; // TODO use params and searchResponse.params
      var from = this._fromValue, to = this._toValue;
      var tip = this.formatRange(from,to,false);
      if (from || to) {
        if (from && to) {
          condition = {"gte":from,"lte":to};
        } else if (from) {
          condition = {"gte":from};
        } else if (to) {
          condition = {"lte":to};
        }
        if (condition !== null) {
          query = {"range": {}};
          query.range[this.field] = condition;
          if (this.hasNestedPath()) {
            /*
            qNested = {"query":{"nested":{
              "path": this.nestedPath,
              "query": {"bool": {"must":[query]}}
            }}};
            */
            qNested = {"nested":{
              "path": this.nestedPath,
              "query": {"bool": {"must":[query]}}
            }};
            query = qNested;
          }
        }       
      }
      
      if (!query) {
        this.activeQClauses = null;
      } else {
        var qClause = new QClause({
          label: lbl,
          tip: tip,
          parentQComponent: this,
          removable: true,
          query: query
        });
        this.activeQClauses = [qClause];
        this.appendQClauses(params);
      } 
      
      var key = this.getAggregationKey();
      if (!params.aggregations) params.aggregations = {};
      var aggregationField = this.field;
      var interval = this.interval;
      var minDocCount = 1;
      var histogram = {
        "histogram":{
          "field": aggregationField,
          "interval": interval,
          "min_doc_count": minDocCount
        }
      };
      if (this.hasNestedPath()) {
        params.aggregations[key] = {
          "nested" : {"path": this.nestedPath},
          "aggregations": {
            "values": histogram
          }
        };
      } else {
        params.aggregations[key] = histogram;
      }
      
    },
 
    processResults: function(searchResponse) {
      this._aggValues = null;
      var key = this.getAggregationKey();
      if (searchResponse.aggregations) {
        var agg = searchResponse.aggregations[key];
        if (this.hasNestedPath()) {
          if (agg.values) {
            this._aggValues = agg.values;
          }
        } else {
          this._aggValues = agg;
        }
      }
      this.plot();    
    },
    
    whenQClauseRemoved: function(qClause) {
      var self = this;
      if (this === qClause.parentQComponent) {
        this._searchDisabled = true;
        this._fromValue = this._toValue = this._brushExtent = null;
        this.setNodeText(this.brushExtentNode,"");
        setTimeout(function(){self._searchDisabled = false;},100);
      }
    },
    
    onRangeClick: function(event) {
      var d = new NumericFilterRange({
        targetWidget: this,
        fromValue: this._brushExtent && this._brushExtent.length>0? this._brushExtent[0]: 0,
        toValue:   this._brushExtent && this._brushExtent.length>1? this._brushExtent[1]: 0
      });
      d.showDialog();
    },
    
    updateRange: function(fromValue, toValue) {
      this.plot([fromValue, toValue]);
    }
    
  });
  
  return oThisClass;
});