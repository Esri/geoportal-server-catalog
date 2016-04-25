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
        "dojo/on",
        "dojo/keys",
        "dojo/date",
        "dojo/date/stamp",
        "dojo/dom-construct",
        "dojo/text!./templates/DateFilter.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent",
        "app/search/DropPane",
        "app/search/QClause",
        "app/common/ModalDialog",
        "dijit/form/DateTextBox"], 
function(declare, lang, array, on, keys, date, stamp, domConstruct, template, i18n, 
    SearchComponent, DropPane, QClause, ModalDialog, DateTextBox) {
  
  var oThisClass = declare([SearchComponent], {
    
    i18n: i18n,
    templateString: template,
    
    allowHistogram: true,
    field: null,
    toField: null,
    nestedPath: null,
    
    interval: "year",
    
    label: i18n.search.dateFilter.label,
    open: false,
    
    _aggregation: null,
    
    _aggDates: null,
    _aggEndDates: null,
    _searchDisabled: false,
    
    postCreate: function() {
      this.inherited(arguments);
      this.fromDate.scrollOnFocus = false;
      this.toDate.scrollOnFocus = false;
      this.showBeginPlotNode.style.display = "none";
      this.showEndPlotNode.style.display = "none";
      
      this.own(on(this.fromDate,"keyup",lang.hitch(this,function(evt) {
        if (evt.keyCode === keys.ENTER) this.search();
      })));
      this.own(on(this.toDate,"keyup",lang.hitch(this,function(evt) {
        if (evt.keyCode === keys.ENTER) this.search();
      })));
    },
    
    hasNestedPath: function() {
      return (typeof this.nestedPath === "string" && this.nestedPath.length > 0);
    },
    
    hasToField: function() {
      return (typeof this.toField === "string" && this.toField.length > 0);
    },
    
    fromDateChanged: function() {
      //console.warn("fromDateChanged searching="+!this._searchDisabled);
      if (!this._searchDisabled) this.search();
    },
    
    toDateChanged: function() {
      //console.warn("toDateChanged searching="+!this._searchDisabled);
      if (!this._searchDisabled) this.search();
    },
    
    showBeginPlot: function() {
      this.showPlot(true);
    },
    
    showEndPlot: function() {
      this.showPlot(false);
    },
    
    showPlot: function(isBegin) {
      var self = this;
      var content = domConstruct.create("div",{
        "class":"g-temporal-plot"
      });
      var title = i18n.search.dateFilter.plot.beginning;
      var aggData = this._aggDates;
      if (!isBegin) {
        title = i18n.search.dateFilter.plot.ending;
        aggData = this._aggEndDates;
      }
      if (!aggData) return;
      var d = new ModalDialog({
        "class": "g-modal-plot",
        title: title,
        content: content,
        showOk: false,
        cancelLabel: i18n.general.close,
        onShow: function() {
         //$(window).trigger("resize");
         self.renderPlot(aggData,isBegin,content);
        }
      });
      //this.renderPlot(aggData,isBegin,content);
      d.show();
    },
    
    renderPlot: function(aggData,isBegin,bindToNode) {
      //console.warn(isBegin,aggData);
      var self = this, interval = this.interval;
      var tooltipTitle = i18n.search.dateFilter.plot.counts;
      var labelData = [];
      var countData = ["countData"];
      var lineColor = "#1f77b4";
      if (!isBegin) {
        lineColor = "#ff7f0e";
      }

      if (aggData && aggData.buckets) {
        array.forEach(aggData.buckets,function(entry){
          //console.warn("entry",entry);
          var dt = entry.key_as_string;
          var yyyy = dt.substring(0,dt.indexOf("-"));
          var yyyymmdd = dt.substring(0,dt.indexOf("T"));
          if (interval === "year") {
            labelData.push(yyyy);
          } else {
            labelData.push(yyyymmdd);
          }
          countData.push(entry.doc_count);
        });
      }
           
      var xLast = labelData.length - 1;
      var plotName = i18n.search.dateFilter.plot.noData;
      var rangePattern = i18n.search.dateFilter.plot.rangePattern;
      if (labelData.length === 1) {
        plotName = labelData[0];
      } else if (labelData.length > 0) {
        //plotName = labelData[0]+" .. "+ labelData[xLast];
        plotName = rangePattern.replace("{from}",labelData[0]).replace("{to}",labelData[xLast]);
      }
      
      c3.generate({
        bindto: bindToNode,
        color: {pattern: [lineColor]},
        subchart: {
          show: false
        },
        data: {
          type: "bar",
          columns: [countData],
          names: {
            "countData": plotName
          },
          onclick: function(d,element) {
            self._searchDisabled = true;
            var bSearch = false, dtFrom, dtTo;
            var value = labelData[d.index];
            var modalNode = $(bindToNode).parents("[role='dialog']");
            if (isBegin) {
              if (interval === "year") self.fromDate.set("value",value+"-01-01");
              else self.fromDate.set("value",value);
              dtFrom = self.fromDate.get("value");
              dtTo = self.toDate.get("value");
              if (!dtTo) {
                self.toDate.set("value",null);
                bSearch = true;
              } else if (dtTo > dtFrom) {
                bSearch = true; 
              }
            } else {
              if (interval === "year") self.toDate.set("value",value+"-12-31");
              else self.toDate.set("value",value);
              dtFrom = self.fromDate.get("value");
              dtTo = self.toDate.get("value");
              if (!dtFrom) {
                self.fromDate.set("value",null);
                bSearch = true;
              } else if (dtTo > dtFrom) {
                bSearch = true; 
              }
            }
            if (bSearch) self.search();
            setTimeout(function(){self._searchDisabled = false;},100);
            if (modalNode) modalNode.modal("hide");
          }
        },
        axis: {
          x: {
            type: "indexed",
            tick: {
              format: function(x) {
                if (x === 0) return labelData[x];
                else if (x === xLast) return labelData[x];
              }
            }
          }
        },
        tooltip: {
          format: {
            title: function(index) {
              return tooltipTitle; 
            },
            name: function(name,ratio,id,index) { 
              return labelData[index]; 
            }
          }
        }
      });      
    },
    
    /*
    renderPlot: function(searchResponse) {
      if (!searchResponse.aggregations) return;

      var populateData = function(buckets,dateData,countData,labelData,interval) {
        array.forEach(buckets,function(entry){
          console.warn("entry",entry);
          var dt = entry.key_as_string;
          var yyyy = dt.substring(0,dt.indexOf("-"));
          var yyyymmdd = dt.substring(0,dt.indexOf("T"));
          dateData.push(dt);
          countData.push(entry.doc_count);
          if (interval === "year") {
            labelData.push(yyyy);
          } else {
            labelData.push(yyyymmdd);
          }
          
        });
      };
      
      var self = this, interval = this.interval;
      var key = this.getAggregationKey();
      var data = searchResponse.aggregations[key];
      var dateData = [];
      var dateLabelData = [];
      var countData = ["countData"];
     
      var endData = {
        dateData: [],
        countData: ["endDateData"],
        labelData: []
      };
      
      if (data && data.dates && data.dates.buckets) {
        populateData(data.dates.buckets,dateData,countData,dateLabelData,interval);
      }
      
      if (data && data.endDates && data.endDates.buckets) {
        populateData(data.endDates.buckets,endData.dateData,endData.countData,endData.labelData,interval);
      }      
      
      

      if (data && data.dates && data.dates.buckets) {
        array.forEach(data.dates.buckets,function(entry){
          //console.warn("entry",entry);
          var dt = entry.key_as_string;
          var yyyy = dt.substring(0,dt.indexOf("-"));
          var yyyymmdd = dt.substring(0,dt.indexOf("T"));
          dateData.push(dt);
          if (interval === "year") {
            dateLabelData.push(yyyy);
          } else {
            dateLabelData.push(yyyymmdd);
          }
          countData.push(entry.doc_count);
        },this);
      }

      
      
      var xLast = dateData.length - 1;
      var plotName = "No Data";
      if (dateLabelData.length === 1) {
        plotName = dateLabelData[0];
      } else if (dateLabelData.length > 0) {
        plotName = dateLabelData[0]+" .. "+ dateLabelData[xLast];
      }
      
      c3.generate({
        bindto: this.plotNode,
        data: {
          columns: [countData],
          names: {
            "countData": plotName
          },
          onclick: function(d,element) {
            console.warn("onclick",dateData[d.index]);
            if (interval === "year") {
              self._searchDisabled = true;
              var year = dateLabelData[d.index];
              self.fromDate.set("value",year+"-01-01");
              self.toDate.set("value",year+"-12-31");
              self.interval = "day";
              self._searchDisabled = false;
              self.search();
            }
          }
        },
        axis: {
          x: {
            type: "indexed",
            tick: {
              format: function(x) {
                if (x === 0) return dateLabelData[x];
                else if (x === xLast) return dateLabelData[x];
              }
            }
          }
        },
        tooltip: {
          format: {
            title: function(index) {
              //console.warn("tooltip.title",index);
              return dateLabelData[index]; 
            },
            name: function(name,ratio,id,index) { 
              //console.warn("tooltip.name",name,ratio,id,index);
              return dateLabelData[index]; 
            }
          }
        }
      });      
    },
    */
    
    
    
    renderPlot2: function(aggData,isBegin) {
      var bindToNode = this.plotNode;
      var self = this, interval = this.interval;
      var label = "Begin Date";
      var labelData = [];
      var countData = [];
      var lineColor = "#1f77b4";
      if (!isBegin) {
        label = "End Date";
        lineColor = "#ff7f0e";
      }

      var max = 1;
      if (aggData && aggData.buckets) {
        array.forEach(aggData.buckets,function(entry){
          //console.warn("entry",entry);
          var dt = entry.key_as_string;
          var yyyy = dt.substring(0,dt.indexOf("-"));
          var yyyymmdd = dt.substring(0,dt.indexOf("T"));
          if (interval === "year") {
            labelData.push(yyyy);
          } else {
            labelData.push(yyyymmdd);
          }
          countData.push(entry.doc_count);
          if (entry.doc_count > max) max = entry.doc_count;
        });
      }
      
      // Generate a Bates distribution of 10 random variables.
      //var values = d3.range(1000).map(d3.random.bates(10)); max = 1; var xTicks= 20;
      
      
      var values = countData; var xTicks = countData.length;
      console.warn(values);

      // A formatter for counts.
      var formatCount = d3.format(",.0f");

      var margin = {top: 10, right: 30, bottom: 30, left: 30};
      //var width = 960 - margin.left - margin.right;
      //var height = 500 - margin.top - margin.bottom;
      
      var width = 400 - margin.left - margin.right;
      var height = 300 - margin.top - margin.bottom;
      
     // width = bindToNode.clientWidth;

      var x = d3.scale.linear()
          .domain([0, max])
          .range([0, width]);

      // Generate a histogram using twenty uniformly-spaced bins.
      var data = d3.layout.histogram()
          .bins(x.ticks(xTicks))
          (values);

      var y = d3.scale.linear()
          .domain([0, d3.max(data, function(d) { return d.y; })])
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var svg = d3.select(bindToNode).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var bar = svg.selectAll(".bar")
          .data(data)
        .enter().append("g")
          .attr("class", "bar")
          .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      bar.append("rect")
          .attr("x", 1)
          .attr("width", x(data[0].dx) - 1)
          .attr("height", function(d) { return height - y(d.y); });

      /*
      bar.append("text")
          .attr("dy", ".75em")
          .attr("y", 6)
          .attr("x", x(data[0].dx) / 2)
          .attr("text-anchor", "middle")
          .text(function(d) { return formatCount(d.y); });

      
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
      */
      
    },
    
    /* SearchComponent API ============================================= */
    
    appendQueryParams: function(params) {
      var query = null, qFrom = null, qTo = null, qNested = null, condition = null;
      var lbl = this.label, tip = "";
      
      var from = null, to = null, dt, options = {zulu: true};
      var dtFrom = this.fromDate.get("value");
      var dtTo = this.toDate.get("value");
      //console.warn(dtFrom,dtTo);
      if (dtFrom) {
        from = stamp.toISOString(dtFrom,options);
        tip = this.fromDate.textbox.value+" .. ";
      }
      if (dtTo) {
        dt = date.add(dtTo,"day",1);
        dt = date.add(dt,"millisecond",-1);
        to = stamp.toISOString(dt,options);
        if (dtFrom) tip = tip+this.toDate.textbox.value;
        else tip = " .. "+this.toDate.textbox.value;
      }
      
      if (this.hasToField()) {
        if (from) {
          condition = {"gte":from};
          qFrom = {"range": {}};
          qFrom.range[this.field] = condition;
          query = qFrom;
        }
        if (to) {
          condition = {"lte":to};
          qTo = {"range": {}};
          qTo.range[this.toField] = condition;
          query = qTo;
        }
        if (from && to) {
          query = {"bool": {"must":[qFrom,qTo]}};
        }
        
        if (query && this.hasNestedPath()) {
          qNested = {"query":{"nested":{
            "path": this.nestedPath,
            "query": query
          }}};
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
            qNested = {"query":{"nested":{
              "path": this.nestedPath,
              "query": {"bool": {"must":[query]}}
            }}};
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
      //params.aggregations[key] = {"date_histogram":{"field":"sys_modified_dt","interval":"year"}};
      var aggregationField = this.field;
      var interval = this.interval;
      var minDocCount = 1;
      //if (interval === "day") minDocCount = 0;
      /*
        "nested" : {
          "path" : this.nestedPath
        },
       */
      
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
      if (this.allowHistogram && this.hasNestedPath()) {
        params.aggregations[key] = {
          "nested" : {"path": this.nestedPath},
          "aggregations": {
            "dates": dateHistogram
          }
        };
        if (this.hasToField()) {
          params.aggregations[key].aggregations["endDates"] = endDateHistogram;
        }
      } else if (this.allowHistogram) {
        params.aggregations[key] = dateHistogram;
        if (this.hasToField()) {
          params.aggregations[key+"_end"] = endDateHistogram;
        }
      }
      
      /*
      params.aggregations[key] = {
        "aggregations": {
          "dates": {
            "date_histogram":{
              "field": aggregationField,
              "interval": interval,
              "min_doc_count": minDocCount
            }
          }
        }
      };
      if (this.hasNestedPath()) {
        params.aggregations[key].nested = {"path": this.nestedPath};
      }
      if (this.hasToField()) {
        params.aggregations[key].aggregations["endDates"] = {
          "date_histogram":{
            "field": this.toField,
            "interval": interval,
            "min_doc_count": minDocCount
          }
        };
      }
      */
      
    },
 
    processResults: function(searchResponse) {
      this._aggDates = this._aggEndDates = null;
      var hasDates = false, hasEndDates = false;
      var key = this.getAggregationKey();
      if (searchResponse.aggregations && this.allowHistogram) {
        var agg = searchResponse.aggregations[key];
        if (this.hasNestedPath()) {
          if (agg.dates) {
            this._aggDates = agg.dates;
            hasDates = this._aggDates.buckets && this._aggDates.buckets.length > 0;
            if (!this.hasToField()) {
              this._aggEndDates = this._aggDates;
              hasEndDates = hasDates;
            }
          }
          if (agg.endDates) {
            this._aggEndDates = agg.endDates;
            hasEndDates = this._aggEndDates.buckets && this._aggEndDates.buckets.length > 0;
          }
        } else {
          this._aggDates = agg;
          hasDates = this._aggDates.buckets && this._aggDates.buckets.length > 0;
          if (!this.hasToField()) {
            this._aggEndDates = this._aggDates;
            hasEndDates = hasDates;
          } else {
            var agg2 = searchResponse.aggregations[key+"_end"];
            if (agg2) {
              this._aggEndDates = agg2;
              hasEndDates = this._aggEndDates.buckets && this._aggEndDates.buckets.length > 0;
            }
          }
        }
      }
      if (hasDates) this.showBeginPlotNode.style.display = "";
      else this.showBeginPlotNode.style.display = "none";
      if (hasEndDates) this.showEndPlotNode.style.display = "";
      else this.showEndPlotNode.style.display = "none";
    },
    
    whenQClauseRemoved: function(qClause) {
      var self = this;
      if (this === qClause.parentQComponent) {
        //this.interval = "year";
        this._searchDisabled = true;
        this.fromDate.set("value",null);
        this.toDate.set("value",null);
        setTimeout(function(){self._searchDisabled = false;},100);
      }
    }
    
  });
  
  return oThisClass;
});