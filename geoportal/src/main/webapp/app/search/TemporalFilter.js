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
        "dojo/date",
        "dojo/date/locale",
        "dojo/date/stamp",
        "dojo/dom-construct",
        "dojo/dom-geometry",
        "dojo/text!./templates/TemporalFilter.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent",
        "app/search/DropPane",
        "app/search/QClause",
        "app/search/TemporalFilterSettings"], 
function(declare, lang, array, djDate, locale, stamp, domConstruct, domGeometry,
    template, i18n, SearchComponent, DropPane, QClause, TemporalFilterSettings) {
  
  var oThisClass = declare([SearchComponent], {
    
    i18n: i18n,
    templateString: template,
    
    allowSettings: null,
    field: null,
    toField: null,
    fieldsOperator: "must",
    nestedPath: null,
    interval: "year", // year, quarter, month, week, day, hour, minute, second
    useUTC: true,
    
    label: i18n.search.temporalFilter.label,
    open: false,
        
    _aggDates: null,
    _aggEndDates: null,
    _aggInterval: null,
    _brushExtent: null,
    _searchDisabled: false,
    
    _fromDate: null,
    _toDate: null,
    
    _initialSettings: null,
    
    postCreate: function() {
      this.inherited(arguments);
      
      this._initialSettings = {
        label: this.label,
        field: this.field,
        toField: this.toField,
        fieldsOperator: this.fieldsOperator,
        nestedPath: this.nestedPath,
        interval: this.interval,
        useUTC: this.useUTC
      };
      
      $(this.intervalSelect).val(this.interval);
      this.plot();
      
      if (this.allowSettings === null) {
        if (AppContext.appConfig.search && !!AppContext.appConfig.search.allowSettings) {
          this.allowSettings = true;
        }
      }
      if (this.allowSettings) {
        var link = this.dropPane.addSettingsLink();
        link.onclick = lang.hitch(this,function(e) {
          var d = new TemporalFilterSettings({
            targetWidget: this
          });
          d.showDialog();
        });
      }
    },
    
    advanceToUpper: function(toDate) {
      if (!toDate) return null;
      if (!this.hasToField) return toDate;
      var dt = toDate;
      var interval = this._aggInterval;
      var intervals = ["year", "quarter", "month", "week", "day", "hour", "minute", "second"];
      if (intervals.indexOf(interval) !== -1) {
        dt = djDate.add(dt,interval,1);
        dt = djDate.add(dt,"millisecond",-1);
      }
      return dt;
    },
    
    applyBrushExtent: function() {
      var ext = this._brushExtent;
      if (ext && ext.length === 2) {
        this._fromDate = ext[0];
        this._toDate = ext[1];
        this.search();
      }
    },
    
    formatDate: function(date) {
      if (!date) return "";
      var options = {zulu:this.useUTC};
      return stamp.toISOString(date,options);
    },
    
    formatDate2: function(date) {
      if (!date) return "";
      var options = {zulu:this.useUTC};
      var v, interval = this.interval, fmt = null;
      if (interval === "year") {
        return stamp.toISOString(date,options).substring(0,4);
      } else if (interval === "quarter" || interval === "month") {
        return stamp.toISOString(date,options).substring(0,7);
      } else if (interval === "week" || interval === "day") {
        return stamp.toISOString(date,options).substring(0,10);
      }
      return stamp.toISOString(date,options);
    },
    
    formatDateRange: function(fromDate,toDate,forSearchLink) {
      var v = "", rangePattern;
      if (fromDate || toDate) {
        rangePattern = i18n.search.temporalFilter.rangePattern;
        v = rangePattern.replace("{from}",this.formatDate2(fromDate));
        v = v.replace("{to}",this.formatDate2(toDate));
      }
      return v;
    },
    
    hasNestedPath: function() {
      return (typeof this.nestedPath === "string" && this.nestedPath.length > 0);
    },
    
    hasToField: function() {
      return (typeof this.toField === "string" && this.toField.length > 0);
    },
    
    intervalChanged: function() {
      this.interval = $(this.intervalSelect).val();
      this.search();
    },
    
    plot: function() {
      var self = this, svgNode = this.svgNode, hasTo = this.hasToField();
      domConstruct.empty(svgNode);
      this._brushExtent = null;
      this.setNodeText(this.brushExtentNode,"");
      
      var countPattern = i18n.search.temporalFilter.countPattern;
      var fmtTip = function(d) {
        var s1 = self.formatDate2(d.date);
        var s2 = countPattern.replace("{count}",d.count);
        return s1+"<br>"+s2;
      };
      
      var data = [], dtLast = null;
      if (this._aggDates && this._aggDates.buckets) {
        array.forEach(this._aggDates.buckets,function(bucket){
          var dt = stamp.fromISOString(bucket.key_as_string);
          dtLast = dt;
          data.push({date:dt,count:bucket.doc_count});
        });
      }
      if (this._aggEndDates && this._aggEndDates.buckets) {
        array.forEach(this._aggEndDates.buckets,function(bucket){
          var dt = stamp.fromISOString(bucket.key_as_string);
          if (!dtLast || dt > dtLast) {
            data.push({date:dt,count:bucket.doc_count});
          }
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
      var x = d3.time.scale().range([0, width]);
      var y = d3.scale.linear().range([height, 0]);
      var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(3);
      var yAxis = d3.svg.axis().scale(y).orient("left").ticks(3);
      var xMap = function(d) {return x(d.date);};
      var yMap = function(d) {return y(d.count);};
      x.domain(d3.extent(data.map(function(d){return d.date;})));
      y.domain([0, d3.max(data.map(function(d){return d.count;}))]);
      
      var margin2 = {top: margin.top+height+25, right: 20, bottom: 20, left: 40};
      var height2 = 35;
      var x2 = d3.time.scale().range([0, width]);
      var y2 = d3.scale.linear().range([height2, 0]);
      var xAxis2 = d3.svg.axis().scale(x2).orient("bottom").ticks(3);
      x2.domain(x.domain());
      y2.domain(y.domain());
      var area2 = d3.svg.area()
        .interpolate("monotone")
        .x(function(d){return x2(d.date);})
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
        .attr("cx", function(d) {return x(d.date);})
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
          .extent(x2.domain())
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
            var isLast = (ext[1].getTime() === data[data.length-1].date.getTime());
            if (isLast) ext[1] = self.advanceToUpper(ext[1]);
            self._brushExtent = ext;
            var txt = self.formatDateRange(ext[0],ext[1],true);
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
      var query = null, qFrom = null, qTo = null, qNested = null, condition = null;
      var lbl = this.label;
      this._aggInterval = this.interval; // TODO use params and searchResponse.params
      
      var from = null, to = null, dt;
      var dtFrom = this._fromDate, dtTo = this._toDate;
      var options = {zulu:true};
      var tip = this.formatDateRange(dtFrom,dtTo,false);
      if (dtFrom) from = stamp.toISOString(dtFrom,options);
      if (dtTo) to = stamp.toISOString(dtTo,options);
      
      if (from || to) {
        if (this.hasToField()) {
          
          if (from) {
            //condition = {"gte":from};
            if (to) condition = {"gte":from,"lte":to};
            else condition = {"gte":from};
            qFrom = {"range": {}};
            qFrom.range[this.field] = condition;
            query = qFrom;
          }
          if (to) {
            condition = {"lte":to};
            if (from) condition = {"gte":from,"lte":to};
            else condition = {"lte":to};
            qTo = {"range": {}};
            qTo.range[this.toField] = condition;
            query = qTo;
          }
          if (from && to) {
            if (this.fieldsOperator === "must") {
              query = {"bool": {"must":[qFrom,qTo]}};
            } else {
              query = {"bool": {"should":[qFrom,qTo]}};
            }
          }
          
          if (query && this.hasNestedPath()) {
            /*
            qNested = {"query":{"nested":{
              "path": this.nestedPath,
              "query": query
            }}};
            */
            qNested = {"nested":{
              "path": this.nestedPath,
              "query": query
            }};
            query = qNested;
          }
          
        } else {
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
      var dateHistogram = {
        "date_histogram":{
          "field": aggregationField,
          "interval": interval,
          "min_doc_count": minDocCount
        }
      };
      var endDateHistogram = {
        "date_histogram":{
          "field": this.toField,
          "interval": interval,
          "min_doc_count": minDocCount
        }
      };
      if (this.hasNestedPath()) {
        params.aggregations[key] = {
          "nested" : {"path": this.nestedPath},
          "aggregations": {
            "dates": dateHistogram
          }
        };
        if (this.hasToField()) {
          params.aggregations[key].aggregations["endDates"] = endDateHistogram;
        }
      } else {
        params.aggregations[key] = dateHistogram;
        if (this.hasToField()) {
          params.aggregations[key+"_end"] = endDateHistogram;
        }
      }
      
    },
 
    processResults: function(searchResponse) {
      this._aggDates = this._aggEndDates = null;
      var key = this.getAggregationKey();
      if (searchResponse.aggregations) {
        var agg = searchResponse.aggregations[key];
        if (this.hasNestedPath()) {
          if (agg.dates) {
            this._aggDates = agg.dates;
          }
          if (agg.endDates) {
            this._aggEndDates = agg.endDates;
          }
        } else {
          this._aggDates = agg;
          if (this.hasToField()) {
            var agg2 = searchResponse.aggregations[key+"_end"];
            if (agg2) {
              this._aggEndDates = agg2;
            }
          }
        }
      }
      
      this.plot();    
    },
    
    whenQClauseRemoved: function(qClause) {
      var self = this;
      if (this === qClause.parentQComponent) {
        this._searchDisabled = true;
        this._fromDate = this._toDate = this._brushExtent = null;
        this.setNodeText(this.brushExtentNode,"");
        setTimeout(function(){self._searchDisabled = false;},100);
      }
    }
    // ,
    //   intializeToolTip: function(){
    //       var node =  this.dropPane.titleBarNode;
    //       //  var node = dom.byId('someNode');
    //       if (this.ToolTip) {
    //           //  var node = dom.byId('someNode');
    //           this.ToolTip.set("connectId", [node]);
    //           if (this.extendedToolTip) {
    //               this.ToolTip.label =this.extendedToolTip + this.ToolTip.label;
    //           }
    //       }
    //   }
    
  });
  
  return oThisClass;
});