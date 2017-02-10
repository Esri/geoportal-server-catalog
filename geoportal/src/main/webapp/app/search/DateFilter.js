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
    
    interval: "year", // year or day - Elasticsearch supports year, quarter, month, week, day, hour, minute, second
    selector: null,
    
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
      //console.warn(aggData);
      var d = new ModalDialog({
        "class": "g-modal-plot",
        title: title,
        content: content,
        showOk: false,
        cancelLabel: i18n.general.close,
        onShow: function() {
         self.renderPlot(aggData,isBegin,content);
        }
      });
      d.show();
    },
    
    renderPlot: function(aggData,isBegin,bindToNode) {
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
              if (interval === "year") {
                self.fromDate.set("value",value+"-01-01");
              } else {
                self.fromDate.set("value",value);
              }
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
    
    /* SearchComponent API ============================================= */
    
    appendQueryParams: function(params) {
      var query = null, qFrom = null, qTo = null, qNested = null, condition = null;
      var lbl = this.label, tip = "";
      
      var from = null, to = null, dt;
      var options = {zulu:true,selector:this.selector};
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
        this._searchDisabled = true;
        this.fromDate.set("value",null);
        this.toDate.set("value",null);
        setTimeout(function(){self._searchDisabled = false;},100);
      }
    }
    
  });
  
  return oThisClass;
});