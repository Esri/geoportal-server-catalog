///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/Evented',
    'libs/echarts/echarts',
    'jimu/utils',
    './_chartUtils',
    './_Gauge',
    './_ChartOptionFactory',
    'libs/echarts/light',
    'libs/echarts/dark'
  ],
  function(declare, _WidgetBase, lang, html, Evented, echarts,
    jimuUtils, ChartUtils, Gauge, ChartOptionFactory) {

    return declare([_WidgetBase, Evented], {
      'baseClass': 'jimu-dijit-chart',
      templateString: '<div></div>',
      declaredClass: 'jimu.dijit.chart',
      // constructor -> this.config, this.chartDom

      //public methods:
      //setConfig -> update the option of this.chart.
      //updateConfig -> update this.config's value
      //clear -> Removes all components and charts in this.chart.
      //resize -> Resizes chart, which should be called manually when container size changes.

      //config params:
      // "type":"bar", //"column", "line", "pie", "radar", "funnel", "gauge"
      // "title":"string",
      // "legend":{show:true,textStyle:{}},
      // "xAxis":{name:'',show:true,textStyle:{},nameTextStyle:{}},
      // "yAxis":{name:'',show:true,nameTextStyle:{}},
      // "dataLabel":{show:true,textStyle:{}},
      // "confine":boolean,//Whether the tooltip is limited to canvas tag
      // "theme":"",//A registered theme name, light or dark
      // "toolbox": ["saveAsImage", "restore", "dataView", "magicType"],
      // "color":[],//[#fff]
      // "backgroundColor": "#fff",
      // "scale": true, //if stack = true,  force scale = false
      // "dataZoom": ["slider"], //inside
      // "events": [{
      //   "name": "", //"click"、"dblclick"、"mousedown"、"mousemove"、"mouseup"、"mouseover"、"mouseout"
      //   "callback": "function (params) {}"
      // }],
      // "labels": [],
      // "series": [{}], //series:[{name,data:[number or serie obj}]
      // /**pie*/
      // "pieMode": "",//normal,rose
      // "roseType":"",//radius, area
      // "labelLine": "boolean",
      // innerRadius:number,0-50
      // /**bar line colmun*/
      // "stack": 'normal','percent'
      // /* line */
      // area:true
      // "axisPointer": true,
      // /**funnel*/
      // "funnelSort": "descending",
      // /**funnel gauge*/
      // "min": 0,
      // //funnel gauge
      // "max": 100,
      // /**radar*/
      // "radarShape": "circle", //["circle", "polygon"],
      // "indicator": [{}], //{name,max} only for radar
      // /**gauge*/
      // shape:"curved" //horizontal,vertical,curved
      // "gaugeOption": {
      //   "columnColor":"#000",
      //   "bgColor":"",
      //   "valueStyle":{
      //     textStyle:{
      //       color:"#fff",
      //       fontSize:20,
      //       fontWeight:'bold',
      //       fontStyle:'italic',
      //       fontFamily:'Avenir Next'
      //     },
      //     formatter:'function'
      //   },
      //   "labelColor":"#000",
      //   "targetValue:[]",
      //   "showDataRangeLabel":boolean,
      //   "showTargetValueLabel":boolean,
      // },
      // /**advance option*/
      // "advanceOption": {},
      // markLine:{
      //   data: [{
      //     "name": "",
      //     "label": {
      //       "show": "boolean",
      //       "position": "", //start, middle, end
      //       "color": "",
      //       "fontSize": 12
      //     },
      //     "lineStyle": {
      //        "color": "",
      //        "width": 12,
      //        "type": "solid", //dashed, dotted
      //     },
      //     "x/yAxis": 1,
      //  }]
      //}
      // markArea:[{
      //   "data": [{
      //      "name": "",
      //      "x/yAxis": 1,
      //      "label": {
      //        "show": "boolean",
      //        "position": "", //"top", "left","right","bottom",
      //                        "inside","insideLeft","insideRight","insideTop",
      //                        "insideBottom","insideTopLeft","insideBottomLeft",
      //                        "insideTopRight","insideBottomRight",
      //        "color": "",
      //        "fontSize": 12
      //      },
      //      "itemStyle": {
      //         "color": "",
      //         "opacity": 1
      //      },
      //      }, {
      //        "x/yAxis": 1,
      //      }]
      // }]

      config: null,

      postCreate: function() {
        this.inherited(arguments);
        this._initChart();
      },

      updateConfig: function(config) {
        if (!config) {
          return false;
        }
        this.config = config;
        this._specialThemeByConfig(config);
        var option = this._chartFactory(config);
        this.chart.setOption(option, true);

        this._settingByGrid(config, option);

        return true;
      },

      _settingByGrid: function(config, option) {
        if (config.type === 'gauge') {
          return this._resetGaugePosition(config);
        }
        var position = this.chartUtils.getAxisZeroPosition();
        config.layout = this.chartUtils.calcDefaultLayout(config);
        if (this.chartUtils.isAxisChart(config)) {
          option = this.chartUtils.settingGrid(option, config);
          option = this.chartUtils.settingDataZoom(option, config, position);
        }
        option = this.chartUtils.settingChartLayout(option, config);
        this.chart.setOption(option, false);
      },

      _resetGaugePosition: function(config) {
        this._resetGaugeGrid(config);
        this._resetGaugeGraphic(config);
      },

      setConfig: function(config) {
        if (!config) {
          return false;
        }

        this.config = config;

        this._specialThemeByConfig(this.config);
        this.clear();
        var option = this._chartFactory(this.config);
        this.chart.setOption(option, true);

        this._setAixsGrid(config, option);
        this._resetGaugePosition(config, option);

        return true;
      },

      destroy: function() {
        this._offEvents();
        this.clear();
        this.inherited(arguments);
      },

      _chartFactory: function(config) {
        this.option = this.chartOptionFactory.produceOption(config);
        return this.option;
      },

      bindEvents: function(config) {
        if (!this.chart || !config.events || !config.events.length) {
          return;
        }
        this._offEvents();
        config.events.forEach(lang.hitch(this, function(event) {
          this.chart.on(event.name, event.callback);
        }));

      },

      _offEvents: function() {
        if (this.config.events && this.config.events[0]) {
          this.config.events.forEach(lang.hitch(this, function(event) {
            this.chart.off(event.name);
          }));
        }
      },

      getDataURL: function() {
        if (!this.chart) {
          return;
        }
        return this.chart.getDataURL();
      },

      clear: function() {
        if (!this.chart) {
          return;
        }
        this.chart.clear();
      },

      resize: function(width, height) {
        if (!this.chart) {
          return;
        }

        html.setStyle(this.domNode, {
          width: width || '100%',
          height: height || '100%'
        });
        this.chart.resize();
        //data zoom
        this._resizeDataZoom();
        this._resetGaugePosition(this.config);
      },

      _resizeDataZoom: function() {
        var option = this.option;
        var config = this.config;
        if (!option || !config) {
          return;
        }
        var position = this.chartUtils.getAxisZeroPosition();
        option = this.chartUtils.settingDataZoom(option, config, position);
        this.chart.setOption(option);
      },

      _setAixsGrid: function(config, option) {
        if (this.chartUtils.isAxisChart(config)) {
          option = this.chartUtils.settingGrid(option, config);
          this.chart.setOption(option, false);
        }
      },

      _resetGaugeGraphic: function(config) {
        if (config.type === 'gauge') {
          this.gauge.resetGraphic(config);
        }
      },

      _resetGaugeGrid: function(config) {
        if (config.type === 'gauge') {
          this.gauge.resetGrid(config);
        }
      },

      _specialChartTheme: function() {
        if (!this.chart) {
          return;
        }
        //_theme.axisPointer
        this.chart._theme.tooltip.axisPointer = {
          type: 'cross',
          label: {
            show: true,
            precision: 2,
            formatter: function(params) {
              if (typeof params.value === 'number') {
                var value = parseFloat(params.value).toFixed(2);
                return this.chartUtils.tryLocaleNumber(value);
              } else {
                return params.value;
              }
            }.bind(this)
          },
          lineStyle: {
            color: '#27727B',
            type: 'dashed'
          },
          crossStyle: {
            color: '#27727B'
          },
          shadowStyle: {
            color: 'rgba(200,200,200,0.3)'
          }
        };
        //value axis formatter
        if (!this.chart._theme.valueAxis) {
          this.chart._theme.valueAxis = {};
        }
        if (!this.chart._theme.valueAxis.axisLabel) {
          this.chart._theme.valueAxis.axisLabel = {};
        }
        this.chart._theme.valueAxis.axisLabel.formatter = function(value) {
          return jimuUtils.localizeNumber(value);
        };
      },

      _specialThemeByConfig: function(config) {
        this._initChartTheme();
        //mixin color to _theme
        if (config.color && config.color[0]) {
          this.chart._theme.color = config.color;
        }
        if (config.confine) {
          this.chart._theme.tooltip.confine = true;
        }

        var isPercent = config.stack === 'percent';

        this.chart._theme.tooltip.formatter = function(params) {
          return this.chartUtils.handleToolTip(params, null, false, isPercent);
        }.bind(this);
      },

      _initChartTheme: function() {
        if (!this.chart) {
          return;
        }
        if (!this.chart._theme) {
          this.chart._theme = {};
        }
        if (!this.chart._theme.tooltip) {
          this.chart._theme.tooltip = {};
        }
        if (!this.chart._theme.valueAxis) {
          this.chart._theme.valueAxis = {};
        }
        if (!this.chart._theme.valueAxis.axisLabel) {
          this.chart._theme.valueAxis.axisLabel = {};
        }
      },

      _initChart: function() {
        var theme = this.config && this.config.theme;
        theme = theme || 'light';
        this.chart = echarts.init(this.domNode, theme);

        this.chartUtils = new ChartUtils({
          chart: this.chart
        });

        this.gauge = new Gauge({
          chart: this.chart,
          chartUtils: this.chartUtils
        });

        this.chartOptionFactory = new ChartOptionFactory({
          chart: this.chart,
          gauge: this.gauge,
          chartUtils: this.chartUtils
        });
        this._specialChartTheme(this.config);
      }

    });
  });