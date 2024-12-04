define([
  'dojo/_base/declare',
  'jimu/utils',
  'esri/lang',
  'dojo/_base/lang'
], function(declare, jimuUtils, esriLang, lang) {
  var GAUGE_TEMP = {
    curved: {
      name: '',
      type: 'gauge',
      center: ['50%', '60%'],
      startAngle: 200,
      endAngle: -20,
      axisLine: {
        lineStyle: {
          color: [
            [0.31, '#5CB4CA'],
            [1, '#E5E5E5']
          ],
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          shadowBlur: 0
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        distance: -52,
        textStyle: {
          color: '#000'
        }
      },
      pointer: {
        length: '65%',
        width: 5
      },
      itemStyle: {
        opacity: 0.7
      },
      detail: {
        show: true,
        offsetCenter: [0, '60%'],
        textStyle: {
          color: '#24B5CC'
        }
      },
      title: {
        show: false
      },
      data: [{
        value: 0
      }],
      animationEasingUpdate: 'bounceOut',
      animationDurationUpdate: 500
    },
    vertical: {
      yAxis: {
        show: true,
        offset: -10,
        type: 'value',
        interval: 1,
        scale: false,
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          show: false,
          showMinLabel: true,
          showMaxLabel: true,
          textStyle: {
            color: '#949494',
            fontStyle: 'normal',
            fontWeight: 'normal'
          }
        },
        splitLine: {
          show: false
        }
      },
      xAxis: {
        show: false,
        type: 'category',
        data: []
      },
      series: [{
        name: '',
        type: 'bar',
        barWidth: 30,
        silent: true,
        animation: false,
        itemStyle: {
          color: '#E5E5E5'
        },
        barGap: '-100%',
        data: [100],
        z: 1
      }, {
        name: '',
        type: 'bar',
        barWidth: 30,
        label: {
          show: true,
          position: 'insideTopLeft',
          offset: [30, -15],
          textStyle: {}
        },
        data: [{
          value: 40,
          label: {
            textStyle: {
              color: '#24B5CC',
              fontStyle: 'normal',
              fontWeight: 'normal',
              fontFamily: 'Avenir Next',
              fontSize: 12
            }
          },
          itemStyle: {}
        }],
        itemStyle: {
          color: '#24B5CC'
        },
        z: 10
      }]
    },
    horizontal: {
      xAxis: {
        show: true,
        offset: -27,
        type: 'value',
        scale: false,
        interval: 1,
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          show: false,
          showMinLabel: true,
          showMaxLabel: true,
          textStyle: {
            color: '#949494',
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontFamily: 'Avenir Next',
            fontSize: 12
          }
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        show: false,
        type: 'category',
        data: []
      },
      series: [{
        name: '',
        type: 'bar',
        barWidth: 30,
        silent: true,
        animation: false,
        itemStyle: {
          color: '#E5E5E5'
        },
        barGap: '-100%',
        data: [100],
        z: 1
      }, {
        name: '',
        type: 'bar',
        barWidth: 30,
        label: {
          show: true,
          position: 'top',
          offset: [20, 0],
          textStyle: {}
        },
        data: [{
          value: 40,
          label: {
            textStyle: {
              color: '#24B5CC',
              fontStyle: 'normal',
              fontWeight: 'normal',
              fontFamily: 'Avenir Next',
              fontSize: 12
            }
          },
          itemStyle: {}
        }],
        itemStyle: {
          color: '#24B5CC'
        },
        z: 10
      }]
    }
  };

  var ChartUtils = declare([], {

    constructor: function(option) {
      this.chart = option && option.chart;

      /* jscs:disable */
      this.horIconUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjdweCIgaGVpZ2h0PSI1cHgiIHZpZXdCb3g9IjAgMCA3IDUiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0NC4xICg0MTQ1NSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+DQogICAgPHRpdGxlPlRyaWFuZ2xlPC90aXRsZT4NCiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4NCiAgICA8ZGVmcz48L2RlZnM+DQogICAgPGcgaWQ9IkxheW91dC0yTmV3IiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcgaWQ9IkNhcmRXaWRnZXRfTGF5b3V0NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTg3NS4wMDAwMDAsIC0yOTcuMDAwMDAwKSIgZmlsbD0iIzkzOTM5MyI+DQogICAgICAgICAgICA8ZyBpZD0iQ2FyZDJfSG9yaXpvbnRhbEdhdWdlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3OTIuMDAwMDAwLCAxODEuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgPGcgaWQ9Ikhvcml6b250YWxHYXVnZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDY2LjAwMDAwMCkiPg0KICAgICAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMjguNTAwMDAwLCA0Mi41MDAwMDApIHJvdGF0ZSgtMjcwLjAwMDAwMCkgdHJhbnNsYXRlKC0xMjguNTAwMDAwLCAtNDIuNTAwMDAwKSB0cmFuc2xhdGUoODYuMDAwMDAwLCAtODYuMDAwMDAwKSIgaWQ9Ik51bWJlcnMrVHJpYW5nbGVzIj4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwLjAwMDAwMCwgMC4wMDAwMDApIj4NCiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cG9seWdvbiBpZD0iVHJpYW5nbGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIuNTAwMDAwLCAxNzAuNTQzODAzKSByb3RhdGUoLTE4MC4wMDAwMDApIHRyYW5zbGF0ZSgtMi41MDAwMDAsIC0xNzAuNTQzODAzKSAiIHBvaW50cz0iNSAxNzAuNTQzODAzIC0xLjcwNTMwMjU3ZS0xMyAxNzQuMDQzODAzIC0xLjY5NjQyMDc4ZS0xMyAxNjcuMDQzODAzIj48L3BvbHlnb24+DQogICAgICAgICAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4=';
      this.verIconUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjVweCIgaGVpZ2h0PSI4cHgiIHZpZXdCb3g9IjAgMCA1IDgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0NC4xICg0MTQ1NSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+DQogICAgPHRpdGxlPlRyaWFuZ2xlPC90aXRsZT4NCiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4NCiAgICA8ZGVmcz48L2RlZnM+DQogICAgPGcgaWQ9IkxheW91dC0yTmV3IiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcgaWQ9IkNhcmRXaWRnZXRfTGF5b3V0NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTg3Ni4wMDAwMDAsIC0zMjQuMDAwMDAwKSIgZmlsbD0iIzkzOTM5MyI+DQogICAgICAgICAgICA8ZyBpZD0iQ2FyZDJfSG9yaXpvbnRhbEdhdWdlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3OTIuMDAwMDAwLCAxODEuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgPGcgaWQ9Ikhvcml6b250YWxHYXVnZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDY2LjAwMDAwMCkiPg0KICAgICAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMjguNTAwMDAwLCA0Mi41MDAwMDApIHJvdGF0ZSgtMjcwLjAwMDAwMCkgdHJhbnNsYXRlKC0xMjguNTAwMDAwLCAtNDIuNTAwMDAwKSB0cmFuc2xhdGUoODYuMDAwMDAwLCAtODYuMDAwMDAwKSIgaWQ9Ik51bWJlcnMrVHJpYW5nbGVzIj4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwLjAwMDAwMCwgMC4wMDAwMDApIj4NCiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cG9seWdvbiBpZD0iVHJpYW5nbGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDMwLjYyODk1MiwgMTcwLjQ1ODY1NCkgcm90YXRlKC05MC4wMDAwMDApIHRyYW5zbGF0ZSgtMzAuNjI4OTUyLCAtMTcwLjQ1ODY1NCkgIiBwb2ludHM9IjMzLjEyODk1MjMgMTcwLjQ1ODY1NCAyOC4xMjg5NTIzIDE3My45NTg2NTQgMjguMTI4OTUyMyAxNjYuOTU4NjU0Ij48L3BvbHlnb24+DQogICAgICAgICAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4=';
      this.verIconUrlRTL = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjVweCIgaGVpZ2h0PSI3cHgiIHZpZXdCb3g9IjAgMCA1IDciIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0NC4xICg0MTQ1NSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+DQogICAgPHRpdGxlPlRyaWFuZ2xlPC90aXRsZT4NCiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4NCiAgICA8ZGVmcz48L2RlZnM+DQogICAgPGcgaWQ9IkxheW91dC0yTmV3IiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcgaWQ9IkFydGJvYXJkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTIxLjAwMDAwMCwgLTQ0Ny4wMDAwMDApIiBmaWxsPSIjOTM5MzkzIj4NCiAgICAgICAgICAgIDxwb2x5Z29uIGlkPSJUcmlhbmdsZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTIzLjUwMDAwMCwgNDUwLjUwMDAwMCkgcm90YXRlKC0xODAuMDAwMDAwKSB0cmFuc2xhdGUoLTEyMy41MDAwMDAsIC00NTAuNTAwMDAwKSAiIHBvaW50cz0iMTI2IDQ1MC41IDEyMSA0NTQgMTIxIDQ0NyI+PC9wb2x5Z29uPg0KICAgICAgICA8L2c+DQogICAgPC9nPg0KPC9zdmc+';
      /* jscs:disable */
      var gaugeTemp = lang.clone(GAUGE_TEMP);
      this.curved = gaugeTemp.curved;
      this.vertical = gaugeTemp.vertical;
      this.horizontal = gaugeTemp.horizontal;

      this.unitDistance = 23;

      this.defultGrid = {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
        containLabel: true
      };
    },

    getAxisZeroPosition: function() {
      if (!this.chart) {
        return false;
      }
      var pos;
      try {
        pos = this.chart.convertToPixel({
          xAxisIndex: 0,
          yAxisIndex: 0
        }, [0, 0]);
      } catch (error) {}

      if (!pos) {
        return {};
      }
      var left = pos[0];
      var top = pos[1];

      var height = this.chart.getHeight();
      var width = this.chart.getWidth();

      var right = width - left;

      var bottom = height - top;
      return {
        left: left,
        right: right,
        top: top,
        bottom: bottom
      };
    },

    getTextWidth: function(text, font) {
      if (!text && text !== 0) {
        return 0;
      }
      // re-use canvas object for better performance
      var canvas = this.getTextWidth.canvas ||
        (this.getTextWidth.canvas = document.createElement("canvas"));
      var context = canvas.getContext("2d");
      context.font = font;
      var metrics = context.measureText(text);
      return metrics.width;
    },

    getHeightByFontSize: function(fontSize) {
      var minSize = 6,
        maxSize = 40,
        baseHeight = 8; //when font-size is 6, height is 8
      fontSize = Math.round(fontSize);
      if (typeof fontSize !== 'number') {
        return 0;
      }
      if (fontSize < minSize || fontSize > maxSize) {
        return 0;
      }

      var stackHeight = 0;
      var step = fontSize - minSize;

      switch (true) {
        case step <= 7:
          stackHeight = step * 1;
          break;
        case step >= 8 && step <= 11:
          stackHeight = (step - 1) * 1 + 1 * 2;
          break;
        case step >= 12 && step <= 15:
          stackHeight = (step - 2) * 1 + 2 * 2;
          break;
        case step >= 16 && step <= 19:
          stackHeight = (step - 3) * 1 + 3 * 2;
          break;
        case step >= 20 && step <= 21:
          stackHeight = (step - 4) * 1 + 4 * 2;
          break;
        case step >= 22 && step <= 23:
          stackHeight = (step - 5) * 1 + 4 * 2 + 1 * 0;
          break;
        case step >= 24 && step <= 27:
          stackHeight = (step - 6) * 1 + 5 * 2 + 1 * 0;
          break;
        case step >= 28 && step <= 31:
          stackHeight = (step - 7) * 1 + 6 * 2 + 1 * 0;
          break;
        case step >= 32 && step <= 34:
          stackHeight = (step - 8) * 1 + 7 * 2 + 1 * 0;
          break;
      }

      return baseHeight + stackHeight;
    },

    //-----------------common----------------------
    tryLocaleNumber: function(value) {
      var result = value;
      if (esriLang.isDefined(value) && isFinite(value)) {
        try {
          var a = jimuUtils.localizeNumber(value);

          if (typeof a === "string") {
            result = a;
          }
        } catch (e) {
          console.error(e);
        }
      }
      //make sure the retun value is string
      result += "";
      return result;
    },

    isAxisChart: function(config) {
      return config.type === 'column' || config.type === 'bar' || config.type === 'line';
    },

    isBaseChartType: function(config) {
      return this.isAxisChart(config) || config.type === 'pie';
    },

    _getTooltipDisplayValue: function(value, percent) {
      var numberedValue = Number(value);
      if (typeof numberedValue === 'number') {
        if (percent) {
          value = jimuUtils.convertNumberToPercentage(value);
        } else {
          value = this.tryLocaleNumber(value);
        }
      }
      return value;
    },

    generateToolTip: function(toolInfo, value, reverse, percent, indicator) {
      var tootip = '';
      if (reverse) {
        tootip = '<div class="tooltip-tr reverse">';
      } else {
        tootip = '<div class="tooltip-tr">';
      }
      var colorEl = '';

      if (toolInfo.color && toolInfo.color !== 'auto') {
        colorEl = '<div class="colorEl marginRight5" style="background-color:' +
          jimuUtils.encodeHTML(toolInfo.color) + '"></div>';
      }

      tootip += colorEl;

      var leftName = '';
      if (toolInfo.seriesType !== 'radar' && this._isVaildValue(toolInfo.seriesName)) {
        leftName = toolInfo.seriesName;
      } else if (this._isVaildValue(indicator)) {
        leftName = indicator;
      }
      if (leftName === '') {
        tootip += '<div>' + leftName + '</div>';
      } else {
        tootip += '<div>' + leftName + '</div>' + '<div>' + ' : ' + '</div>';
      }
      var callbackValue = 'null';
      if (this._isNotZeroBoolean(value)) {
        callbackValue = value;
      } else if (this._isVaildValue(toolInfo.value)) {
        callbackValue = toolInfo.value;
      }

      tootip += '<div>' + this._getTooltipDisplayValue(callbackValue, percent) + '</div>';

      if (toolInfo.seriesType === 'pie') {
        var percentageValue = toolInfo.percent;
        if (this._isVaildValue(percentageValue)) {
          percentageValue = percentageValue / 100;
        } else {
          percentageValue = 0;
        }
        tootip += '<div class="space-left">' + '(' + jimuUtils.convertNumberToPercentage(percentageValue) +
          ')' + '</div>';
      }
      tootip += '</div>';
      return tootip;
    },

    handleToolTip: function(params, value, reverse, percent, indicator) {
      var tootip = '<div class="tooltip-div">';
      if (!Array.isArray(params)) {
        params = [params];
      }

      if (this._isVaildValue(params[0].name)) {
        tootip += '<div class="tr">' + params[0].name + '</div>';
      }
      params.forEach(function(param) {
        if (param.seriesType !== 'radar') {
          tootip += this.generateToolTip(param, value, reverse, percent, indicator);
        } else {
          tootip += this._handleRadarTooltip(param, reverse, percent, indicator);
        }
      }.bind(this));

      tootip += '</div>';

      return tootip;
    },

    _handleRadarTooltip: function(param, reverse, percent, indicator) {
      var tootip = '';
      var radarValue = param.value || [];
      radarValue.forEach(function(val, i) {
        tootip += this.generateToolTip(param, val, reverse, percent, indicator[i]);
      }.bind(this));
      return tootip;
    },

    _isVaildValue: function(value) {
      if (encodeURI(value) === "%00-") {
        return false;
      } else {
        return this._isNotZeroBoolean(value);
      }

    },

    _isNotZeroBoolean: function(value) {
      if (value === 0) {
        return true;
      }
      return !!value;
    },

    //-----------------chart option factory----------------------
    settingAdvanceOption: function(option, config) {
      if (config.advanceOption) {
        if (typeof config.advanceOption === 'object') {
          lang.mixin(option, config.advanceOption);
        } else if (typeof config.advanceOption === 'function') {
          config.advanceOption(option);
        }
      }
      return option;
    },

    settingColor: function(option, config) {
      if (config.color && config.color[0]) {
        option.color = config.color;
      }
      return option;
    },

    settingToolTip: function(option, config) {
      option.tooltip = {};
      if (config.confine) {
        option.tooltip.confine = true;
      }
      if (config.type === 'radar') {
        option.tooltip.trigger = 'item';
        return option;
      }
      if (config.axisPointer) {
        option.tooltip.trigger = 'axis';
        if (config.type === 'column' || config.type === 'bar') {
          option.tooltip.axisPointer = {
            type: 'shadow',
            snap: true
          };
        }
      } else {
        option.tooltip.axisPointer = {
          type: ''
        };
      }
      return option;
    },

    settingDataZoom: function(option, config, position) {
      if (!this.isAxisChart(config)) {
        return option;
      }

      if (!config.series || !config.series.length) {
        return option;
      }

      if (!config.dataZoom || !config.dataZoom.length) {
        option.dataZoom = [];
        return option;
      }

      option = this._settingDataZoom(config, option, position);
      return option;
    },

    _settingDataZoom: function(config, option, position) {
      if (!this.chart) {
        return option;
      }
      //chart dom node width
      var width = this.chart.getWidth();
      //per serie's dta lenght
      var dataNumber = config.series[0].data.length;
      //series num
      var seriesLength = config.series.length;
      //Number of lateral elements
      var number = config.stack ? dataNumber : dataNumber * seriesLength;
      if (!number || !width) {
        option.dataZoom = dataZoom;
        return option;
      }
      //the width of each column
      var oneColumnWidth = 20;

      if (config.type !== 'bar') {
        if (!window.isRTL) {
          var left = position.left;
          width = width - left - option.grid.right;
        } else {
          width = position.left;
        }
      } else {
        width = position.top;
      }

      var showDataZoom = width / number < oneColumnWidth;

      var ratio = width / (number * oneColumnWidth);
      ratio = parseFloat(ratio * 100, 10).toFixed(3);
      ratio = ratio > 100 ? 100 : ratio;
      ratio = ratio === 0 ? 0.01 : ratio;

      var dataZoom = [];

      var axisIndex = config.type === 'bar' ? 'yAxisIndex' : 'xAxisIndex';

      dataZoom = config.dataZoom.map(lang.hitch(this, function(item) {
        var zoomOption = {
          type: item,
          start: 0,
          show: showDataZoom
        };
        zoomOption[axisIndex] = [0];
        zoomOption.end = ratio;
        zoomOption.showDataShadow = false;
        zoomOption.realtime = false;
        return zoomOption;
      }));
      option.dataZoom = dataZoom;
      return option;
    },

    mockChartDataWhenNoData: function(config) {
      if (config && Array.isArray(config.labels) && config.labels.length === 0) {
        config.labels.push('');
      }
      if (config && Array.isArray(config.series) && config.series.length > 0) {
        config.series.forEach(function(serie) {
          if (serie && Array.isArray(serie.data) && serie.data.length === 0) {
            serie.data.push(0);
          }
        });
      }
      return config;
    },

    settingDefaultGrid: function(option) {
      option.grid = lang.clone(this.defultGrid);
      return option;
    },

    settingGrid: function(option, config) {
      if (!this.isAxisChart(config)) {
        return option;
      }
      var showyAxis = config.yAxis && config.yAxis.show;
      option.grid.containLabel = showyAxis;

      var layout = config.layout;
      if (!layout || !layout.length) {
        return option;
      }
      var tNum = 0;
      var bNum = 0;
      var lNum = 0;
      var rNum = 0;
      //t b l r
      var increase = 1;
      layout.forEach(function(ly) {
        var position = ly.layout && ly.layout.position;
        if (name === 'xAixsName' || name === 'yAixsName') {
          increase = 0.7;
        }
        if (position === 't') {
          tNum = tNum + increase;
        } else if (position === 'b') {
          bNum = bNum + increase;
        } else if (position === 'l') {
          lNum = lNum + increase;
        } else if (position === 'r') {
          rNum = rNum + increase;
        }

      }.bind(this));

      var grid = lang.clone(this.defultGrid);

      var top = grid.top || 0,
        bottom = grid.bottom || 0,
        left = grid.left || 0,
        right = grid.right || 0;

      top += this.unitDistance * tNum;
      bottom += this.unitDistance * bNum;
      left += this.unitDistance * lNum;
      right += this.unitDistance * rNum;

      //hide yAxis
      if (config.yAxis && !config.yAxis.show) {
        bottom += this.unitDistance;
      }

      option.grid.top = top;
      option.grid.bottom = bottom;
      option.grid.left = left;
      option.grid.right = right;

      option = this._settingxAxisNameGap(option, config);
      option = this._settingGridForMarkName(option, config);
      return option;
    },

    _settingGridForMarkName: function(option, config) {
      var markLine = config.markLine;
      var markArea = config.markArea;
      var endNames = [],
        startNames = [];
      if (markLine && markLine.data && markLine.data.length) {
        markLine.data.forEach(function(dataItem) {
          if (this._hasEndPosName(dataItem)) {
            endNames.push(dataItem.name + '');
          }
          if (this._hasStartPosName(dataItem)) {
            startNames.push(dataItem.name + '');
          }
        }.bind(this));
      }
      if (markArea && markArea.data && markArea.data.length) {
        markArea.data.forEach(function(dataGroup) {
          var firstItem = dataGroup[0];
          if (this._hasOutRightAxisName(config.type, firstItem)) {
            endNames.push(firstItem.name + '');
          }
          if (this._hasOutLeftAxisName(config.type, firstItem)) {
            startNames.push(firstItem.name + '');
          }
        }.bind(this));
      }
      if (!endNames.length && !startNames.length) {
        return option;
      }

      if (config.type === 'bar') {
        option.grid.top += 15;
        return option;
      }
      var yAxisLabelWidth = this._getyAxisLabelWidth(config);
      var rightName = this._getMaxLengthString(endNames);
      var rightNameLength = this.getTextWidth(rightName, 'normal 12px sans-serif');
      if (!window.isRTL) {
        option.grid.right += rightNameLength;

      } else {
        option.grid.left += rightNameLength;
      }

      var leftName = this._getMaxLengthString(startNames);
      var leftNameLength = this.getTextWidth(leftName, 'normal 12px sans-serif');
      leftNameLength = leftNameLength - yAxisLabelWidth;

      if (leftNameLength <= 0) {
        return option;
      }

      leftNameLength += 10;
      if (!window.isRTL) {
        option.grid.left = leftNameLength;
      } else {
        option.grid.right = leftNameLength;
      }

      return option;
    },

    _getyAxisLabelWidth: function(config) {
      var yAxis = config && config.yAxis;
      if (!yAxis || !yAxis.show) {
        return 0;
      }
      var maxDataValue = this._getMaxData(config);
      if (!maxDataValue && maxDataValue !== 0) {
        return 0;
      }
      var fontSize = yAxis && yAxis.textStyle && yAxis.textStyle.fontSize;
      fontSize = fontSize || 12;
      return this.getTextWidth(maxDataValue, 'normal ' + fontSize + 'px sans-serif');
    },

    _getMaxData: function(config) {
      var series = config.series;
      if (!series || !series.length) {
        return;
      }
      var dataset = series.map(function(serie) {
        var data = serie.data;
        if (!data || !data.length) {
          return;
        }
        return data.map(function(dataItem) {
          var value;
          if (typeof dataItem === 'number') {
            value = dataItem;
          } else if (dataItem && typeof dataItem.value !== 'undefined') {
            value = dataItem.value;
          }
          value = parseInt(value, 10);
          return value;
        });
      });

      var ret = dataset.map(function(ds) {
        if (ds.length) {
          return Math.max.apply(Math, ds);
        }

      });
      return ret.length && Math.max.apply(Math, ret);
    },

    _getMaxLengthString: function(array) {
      return array.sort(function(a, b) {
        a = this.getTextWidth(a);
        b = this.getTextWidth(b);
        return b - a;
      }.bind(this))[0];
    },

    _hasOutRightAxisName: function(type, dataItem) {
      var hasName = dataItem.name || dataItem.name === 0;
      var label = dataItem.label;
      var lret = window.isRTL ? 'eft' : 'ight';
      var ret = type === 'bar' ? 'op' : lret;
      var isRightPos = label && label.position && label.position.indexOf(ret) > -1;
      var isInsidePos = label && label.position && label.position.indexOf('inside') > -1;
      return hasName && isRightPos && !isInsidePos;
    },

    _hasOutLeftAxisName: function(type, dataItem) {
      var hasName = dataItem.name || dataItem.name === 0;
      var label = dataItem.label;
      var lret = window.isRTL ? 'ight' : 'eft';
      var ret = type === 'bar' ? 'op' : lret;
      var isRightPos = label && label.position && label.position.indexOf(ret) > -1;
      var isInsidePos = label && label.position && label.position.indexOf('inside') > -1;
      return hasName && isRightPos && !isInsidePos;
    },

    _hasEndPosName: function(dataItem) {
      var hasName = dataItem.name || dataItem.name === 0;
      var label = dataItem.label;
      var isEndPos = !label || !label.position || label.position === 'end';
      return hasName && isEndPos;
    },

    _hasStartPosName: function(dataItem) {
      var hasName = dataItem.name || dataItem.name === 0;
      var label = dataItem.label;
      var isEndPos = !label || !label.position || label.position === 'start';
      return hasName && isEndPos;
    },

    _settingxAxisNameGap: function(option, config) {
      if (!this.isAxisChart(config)) {
        return option;
      }
      if (!option.xAxis) {
        return option;
      }

      var fontSize = config.xAxis && config.xAxis.textStyle &&
        config.xAxis.textStyle.fontSize;
      fontSize = fontSize || 12;

      var xAixsNameGap = 10;
      var xAxisLabelHeight = this.getHeightByFontSize(fontSize);
      xAixsNameGap += xAxisLabelHeight;
      option.xAxis.nameGap = xAixsNameGap;
      return option;
    },

    //chart option factory
    calcDefaultLayout: function(config) {
      if (!this.isBaseChartType(config)) {
        return;
      }
      var legend = config.legend;
      var xAxis = config.xAxis;
      var dataZoomLayout = null;
      var type = config.type;
      if (type !== 'pie') {
        if (type !== 'bar') {
          dataZoomLayout = {
            name: 'dataZoom',
            layout: {
              position: 't',
              inner: false
            }
          };
        } else {
          dataZoomLayout = {
            name: 'dataZoom',
            layout: {
              position: window.isRTL ? 'l' : 'r',
              inner: false
            }
          };
        }
      }

      var legendLayout = null;
      if (legend && legend.show) {
        legendLayout = {
          name: 'legend',
          layout: {
            position: 'b',
            inner: false
          }
        };
      }
      //xAxis name layout
      var xAxisLayout = null;
      if (xAxis && xAxis.show && typeof xAxis.name !== 'undefined') {
        xAxisLayout = {
          name: 'xAxisName',
          layout: {
            position: 'b',
            inner: false
          }
        };
        if (legendLayout) {
          xAxisLayout.layout.inner = true;
        }
      }

      var layout = [];
      if (legendLayout) {
        layout.push(legendLayout);
      }

      if (dataZoomLayout) {
        layout.push(dataZoomLayout);
      }

      if (xAxisLayout) {
        layout.push(xAxisLayout);
      }

      return layout.length && layout;
    },

    settingRenderOption: function(option, config) {
      if (config.shape === 'curved') {
        option.animationThreshold = 99999999;
        option.hoverLayerThreshold = 99999;
        option.progressiveThreshold = 99999;
        return option;
      }
      //Chart render option
      option.hoverLayerThreshold = 500;
      option.progressiveThreshold = 500;
      option.progressive = 100;
      option.animationThreshold = 500;
      return option;
    },

    settingBackgroundColor: function(option, config) {
      if (config.backgroundColor) {
        option.backgroundColor = config.backgroundColor;
      }
      return option;
    },

    settingAxisChartAxis: function(option, config) {
      var xAxis = config.xAxis;
      var yAxis = config.yAxis;
      var xAxisOption = {
        nameLocation: 'center'
      };
      var yAxisOption = {
        nameLocation: 'center'
      };
      //setting value labels and category labels
      if (config.type === 'column' || config.type === 'line' && config.labels) {
        xAxisOption.data = config.labels;
        xAxisOption.type = 'category';
        yAxisOption.type = 'value';
      } else if (config.type === 'bar' && config.labels) {
        yAxisOption.data = config.labels;
        yAxisOption.type = 'category';
        xAxisOption.type = 'value';
      }
      //setting axis show, name, textStyle
      if (xAxis) {
        xAxisOption.name = xAxis.name;
        xAxisOption.show = !!xAxis.show;
        if (xAxis.textStyle) {
          xAxisOption.axisLabel = xAxis.textStyle;
        }
        if (xAxis.nameTextStyle) {
          xAxisOption.nameTextStyle = xAxis.nameTextStyle;
        }
      }
      if (yAxis) {
        // yAxisOption.name = yAxis.name;
        yAxisOption.show = !!yAxis.show;
        if (yAxis.textStyle) {
          yAxisOption.axisLabel = yAxis.textStyle;
        }
        // if (yAxis.nameTextStyle) {
        //   yAxisOption.nameTextStyle = yAxis.nameTextStyle;
        // }

      }
      //setting axis RTL
      if (window.isRTL) {
        xAxisOption.inverse = true;
        yAxisOption.position = 'right';
      }

      option.xAxis = xAxisOption;
      option.yAxis = yAxisOption;
      return option;
    },

    settingRadar: function(option, config) {
      if (config.type !== 'radar') {
        return option;
      }
      option.radar = {
        nameGap: 6,
        radius: '70%'
      };
      option.radar.axisLabel = {
        show: true,
        formatter: function() {}
      };
      if (config.radarShape) {
        option.radar.shape = config.radarShape;
      }
      if (config.indicator) {
        this._handleRadarIndicator(config);
        option.radar.indicator = config.indicator;
      } else {
        console.error('No radar indicator');
      }

      return option;
    },

    _handleRadarIndicator: function(config) {
      var indicator = config.indicator;

      var data = config.series[0].data;
      var verticalValues = [];
      indicator.forEach(function(item, i) {
        if (typeof item.max !== 'undefined') {
          return item;
        }
        verticalValues = data.map(function(e) {
          var value = e.value;
          verticalValues.push(value[i]);
        });
        var max = Math.max.apply(Math, verticalValues);
        item.max = max;
      });
    },

    settingArea: function(option, config) {
      if (config.type !== 'line' || !config.area) {
        return option;
      }
      option.series = option.series.map(function(serie) {
        if (!serie.areaStyle) {
          serie.areaStyle = {};
        }
        if (typeof serie.areaStyle.opacity === 'undefined') {
          serie.areaStyle.opacity = 0.4;
        }
        serie.sthisoth = true;
        serie.smoothMonotone = 'x';
        return serie;
      });
      return option;
    },

    _mockNegativeValue: function(series) {
      if (!series || !series[0] || !series[0].data) {
        return series;
      }
      return series.map(function(serie) {
        serie.data = serie.data.map(function(item, index) {
          var value;
          var idOld = index % 2 === 0;

          if (item && typeof item.value !== 'undefined') {
            value = item.value;
            value = Number(value);
            value = idOld ? -value : value;
            item.value = value;
          } else {
            value = item;
            value = Number(value);
            value = idOld ? -value : value;
            item = -value;
          }
          return item;
        });
        return serie;
      });
    },

    hasNegativeValue: function(config) {
      var series = config.series;
      if (!series || !series[0] || !series[0].data) {
        return;
      }

      return series.some(function(serie) {
        return serie.data.some(function(item) {
          var value;
          if (item && typeof item.value !== 'undefined') {
            value = item.value;
          } else {
            value = item;
          }
          value = Number(value);
          return typeof value === 'number' && value < 0;
        });
      });
    },

    allNegativeValue: function(config) {
      var series = config.series;
      if (!series || !series[0] || !series[0].data) {
        return false;
      }
      return series.every(function(serie) {
        return serie.data.every(function(item) {
          var value;
          if (item && item.value) {
            value = item.value;
          } else {
            value = item;
          }
          value = Number(value);
          return typeof value === 'number' && value < 0;
        });
      });
    },

    settingStack: function(option, config) {
      config = this._stackForPercent(config);
      if (config.stack === 'percent') {
        var hasNegativeValue = this.hasNegativeValue(config);
        var allIsNegativeValue = this.allNegativeValue(config);
        var min = 0;
        var max = 1;
        if (hasNegativeValue) {
          min = -1;
          if (allIsNegativeValue) {
            max = 0;
          }
          if (config.type === 'bar') {
            option.xAxis.max = max;
            option.xAxis.min = min;
          } else {
            option.yAxis.max = max;
            option.yAxis.min = min;
          }
        }
      }

      if (config.stack) {
        option.series = option.series.map(function(serie) {
          serie.stack = 'stack';
          return serie;
        });
      }
      return option;
    },

    _stackForPercent: function(config) {
      if (config.stack !== 'percent') {
        return config;
      }
      var datas = [];
      config.series.forEach(function(serie) {
        var data = lang.clone(serie.data);
        data.forEach(function(e, i) {
          if (!datas[i]) {
            datas[i] = [];
          }
          var v;
          if (e && typeof e.value !== 'undefined') {
            v = e.value;
          } else {
            v = e;
          }
          if (!v) {
            v = 0;
          }
          datas[i].push(v);
        });
      });
      var sum = [];
      datas.forEach(function(data, i) {
        if (!sum[i]) {
          sum[i] = 0;
        }
        data.forEach(function(item) {
          sum[i] += Math.abs(item);
        });
      });

      var stackedData = datas.map(function(data, i) {
        return data.map(function(item) {
          if (sum[i] === 0) {
            return null;
          }
          if (item >= 0) {
            return Math.abs(item) / sum[i];
          } else {
            return -Math.abs(item) / sum[i];
          }

        });
      });

      config.series = config.series.map(function(serie, i) {
        var data = lang.clone(serie.data);
        data = data.map(function(d, index) {
          if (!d) {
            return d;
          }
          if (typeof d.value !== 'undefined') {
            d.value = stackedData[index][i];
          } else {
            d = stackedData[index][i];
          }
          return d;
        });
        serie.data = data;
        return serie;
      });
      return config;
    },

    settingLegend: function(option, config) {
      var legend = config.legend;
      if (!legend) {
        option.legend = {
          show: false
        };
        return option;
      }
      var legendOption = {
        show: legend.show,
        type: 'scroll',
        itemHeight: 11,
        orient: 'horizontal',
        pageButtonPosition: 'end',
        pageTextStyle: {
          color: '#939393'
        }
      };
      if (legend.textStyle) {
        legendOption.textStyle = legend.textStyle;
      }
      option.legend = legendOption;

      option = this._handleLegendRTL(option, config);
      return option;
    },

    _handleLegendRTL: function(option, config) {
      if (!config.legend) {
        return option;
      }
      var legend = {};
      if (window.isRTL) {
        legend.x = 'right';
        legend.pageButtonPosition = 'start';
      } else {
        legend.x = 'left';
        legend.pageButtonPosition = 'end';
      }
      option.legend = lang.mixin(option.legend, legend);
      return option;
    },

    settingScale: function(option, config) {
      if (!config.scale) {
        return option;
      }
      if (config.type === 'bar') {
        option.xAxis.scale = true;
      } else if (config.type === 'line' || config.type === 'column') {
        option.yAxis.scale = true;
      }
      //  else if (config.type === 'radar') {
      //   option.radar.scale = true;
      // }
      return option;
    },

    pieChartAvoidLegendLabelOverLap: function(option, config) {
      if (config.type !== 'pie') {
        return option;
      }
      var showDataLabel = config.dataLabel && config.dataLabel.show;
      var radius = showDataLabel ? 0.75 : 0.85;
      if (config.legend && config.legend.show) {
        radius -= 0.12;
      }
      option.series[0].radius[1] = radius * 100 + '%';
      return option;
    },

    settingChartLayout: function(option, config) {
      if (!this.isBaseChartType(config)) {
        return option;
      }
      var layout = config.layout;
      if (layout && layout.length) {
        layout.forEach(function(ly) {
          this._assigneeLayout(option, ly);
        }.bind(this));
      }
      return option;
    },

    avoidAdjoiningColorSameForPie: function(option, config) {
      if (config.type !== 'pie' || !option.color || option.color.length <= 2) {
        return option;
      }
      if (option.series && option.series[0]) {
        option.series.forEach(lang.hitch(this, function(item) {
          var pieCount = item.data.length;
          if ((pieCount - 1) % (option.color.length) === 0) {
            var lastPart = item.data[pieCount - 1];
            if (!lastPart.itemStyle) {
              lastPart.itemStyle = {};
            }
            if (!lastPart.itemStyle.color) {
              lastPart.itemStyle.color = option.color[1];
            }
          }
        }));
      }
      return option;
    },

    //propety: dataZoom, legend
    _assigneeLayout: function(option, layout) {
      var property = layout.name;
      if (property === 'xAxisName' || property === 'yAxisName') {
        return;
      }
      var propertyLayout = layout.layout;

      var operateObj = this._getOperateObjByProperty(option, property);

      if (!operateObj) {
        return option;
      }

      // var top, bottom, left, right;

      var subPosition = propertyLayout && propertyLayout.subPosition;
      var subPositionObj = this._getSubPosition(subPosition);

      var position = propertyLayout && propertyLayout.position;
      var inner = propertyLayout && propertyLayout.inner;
      var positionObj = {};
      if (position === 'l') {
        positionObj.left = inner ? this.unitDistance + this.defultGrid.left - 5 : this.defultGrid.left - 5;
      } else if (position === 'r') {
        positionObj.right = inner ? this.unitDistance + this.defultGrid.right - 5 : this.defultGrid.right - 5;
      } else if (position === 't') {
        positionObj.top = inner ? this.defultGrid.top + this.unitDistance - 5 : this.defultGrid.top - 5;
      } else if (position === 'b') {
        positionObj.bottom = inner ? this.unitDistance + this.defultGrid.bottom - 5 : this.defultGrid.bottom - 5;
      }

      lang.mixin(operateObj, positionObj);
      //sub position
      lang.mixin(operateObj, subPositionObj);

      this._specialLegend(operateObj, property, position);
      this._specialSliderDataZoom(operateObj, property, position);
      return option;
    },

    _getSubPosition: function(subPosition) {
      if (subPosition === 'l') {
        return {
          left: this.defultGrid.left - 5,
          right: 'auto'
        };
      } else if (subPosition === 'r') {
        return {
          right: this.defultGrid.right - 5,
          left: 'auto'
        };
      }
      if (subPosition === 't') {
        return {
          top: this.defultGrid.top - 5,
          bottom: 'auto'
        };
      }
      if (subPosition === 'b') {
        return {
          bottom: this.defultGrid.bottom - 5,
          top: 'auto'
        };
      }

    },

    _specialLegend: function(legendObj, name, position) {
      if (name !== 'legend') {
        return;
      }
      if (position === 'l' || position === 'r') {
        legendObj.orient = 'vertical';
      } else {
        legendObj.orient = 'horizontal';
      }
    },

    _specialSliderDataZoom: function(sliderDataZoomObj, name, position) {
      if (name !== 'dataZoom') {
        return;
      }
      if (position === 'l' || position === 'r') {
        sliderDataZoomObj.orient = 'vertical';
        sliderDataZoomObj.width = 15;
      } else {
        sliderDataZoomObj.orient = 'horizontal';
        sliderDataZoomObj.height = 15;
      }
    },

    _getOperateObjByProperty: function(option, property) {
      if (property === 'dataZoom') {
        return this._getSliderDataZoom(option);
      } else if (property === 'legend') {
        return option.legend;
      }
    },

    _getSliderDataZoom: function(option) {
      var sliderDataZoom = null;
      var dataZoom = option.dataZoom;
      if (dataZoom && dataZoom.length) {
        dataZoom.some(function(dz) {
          if (dz.type === 'slider') {
            sliderDataZoom = dz;
            return true;
          }
          return false;
        });
      }
      return sliderDataZoom;
    },

    settingAxisSeries: function(option, config) {
      option = this._setTypeToSeries(option, config);
      option.series = config.series;
      return option;
    },

    settingMarks: function(option, config) {
      option = this.settingMarkLine(option, config);
      option = this.settingMarkArea(option, config);
      return option;
    },

    settingMarkLine: function(option, config) {
      var markLine = config.markLine;
      if (markLine && markLine.data) {
        markLine.silent = true;
        markLine.data.forEach(function(dataItem) {
          if (!dataItem.label) {
            dataItem.label = {
              show: false,
              position: 'end'
            };
          }
          // if (dataItem.label.position === 'start' || dataItem.label.position === 'end') {
          //   dataItem.label.rotate = 0;
          // }
          if (typeof dataItem.name !== 'undefined') {
            dataItem.label.show = true;
            dataItem.label.formatter = dataItem.name;
          }

        });
        option.series[0].markLine = lang.clone(markLine);
      }
      return option;
    },

    settingMarkArea: function(option, config) {
      if (config.markArea) {
        this._handleMarkAreaRTL(config.markArea);
        config.markArea.silent = true;
        option.series[0].markArea = config.markArea;
      }
      return option;
    },

    _handleMarkAreaRTL: function(markArea) {
      if (!window.isRTL) {
        return;
      }
      if (!markArea || !markArea.data || !markArea.data.length) {
        return;
      }
      markArea.data.forEach(function(item) {
        var label = item && item[0] && item[0].label;
        var position = label && label.position;
        if (!position) {
          return;
        }
        if (position === 'left') {
          position = 'right';
        } else if (position === 'right') {
          position = 'left';
        } else if (position === 'insideLeft') {
          position = 'insideRight';
        } else if (position === 'insideRight') {
          position = 'insideLeft';
        }
        label.position = position;
      });
    },

    _settingSeriesDataLabel: function(option, config) {
      var dataLabel = config.dataLabel;
      if (!dataLabel) {
        return option;
      }
      var label = {};
      label.show = !!dataLabel.show;
      if (typeof dataLabel.textStyle !== 'undefined') {
        label.textStyle = dataLabel.textStyle;
      }
      option.series.forEach(function(serie) {
        serie.label = label;
      });
      return option;
    },

    settingRadarSeries: function(option, config) {
      option = this._setTypeToSeries(option, config);
      var series = config.series;
      option.series = series.map(lang.hitch(this, function(serie) {
        serie.data = this._handleSeriesDataForPieLikeType(serie, config);
        serie = this._settingRaderSerie(serie, config);
        return serie;
      }));
      return option;
    },

    _settingRaderSerie: function(serie, config) {
      if (serie.type !== 'radar') {
        return serie;
      }
      var indicator = config.indicator.map(function(item) {
        return item.name;
      });
      serie.tooltip = {};
      serie.tooltip.formatter = function(params) {
        return this.handleToolTip(params, null, false, false, indicator);
      };
      return serie;
    },

    settingFunnelSeries: function(option, config) {
      option = this._setTypeToSeries(option, config);
      var series = config.series;
      option.series = series.map(lang.hitch(this, function(serie) {
        serie.data = this._handleSeriesDataForPieLikeType(serie, config);
        serie = this._settingFunnelSerie(serie, config);
        return serie;
      }));
      return option;
    },

    _settingFunnelSerie: function(serie, config) {
      if (serie.type !== 'funnel') {
        return serie;
      }
      serie.minSize = '0%';
      serie.maxSize = '100%';
      serie.sort = 'descending'; //ascending
      serie.min = config.min || 0;
      serie.max = config.max || 100;
      serie.max = config.funnelSort || 'descending';
      return serie;
    },

    settingPieSeries: function(option, config) {
      option = this._setTypeToSeries(option, config);
      var series = config.series;
      option.series = series.map(lang.hitch(this, function(serie) {
        serie.data = this._handleSeriesDataForPieLikeType(serie, config);
        serie = this._settingPieSerie(serie, config);
        return serie;
      }));
      return option;
    },

    _settingPieSerie: function(serie, config) {
      if (serie.type !== 'pie') {
        return serie;
      }
      var showDataLabel = config.dataLabel && config.dataLabel.show;
      serie.selectedMode = 'single';
      serie.selectedOffset = 10;
      serie.hoverOffset = 5;

      serie.radius = [0, '70%'];
      serie.labelLine = {
        show: true,
        length: 5,
        length2: 5
      };
      serie.labelLine.show = typeof config.labelLine ===
        'undefined' ? true : config.labelLine;
      if (!showDataLabel) {
        serie.labelLine.show = false;
      }
      if (typeof config.innerRadius === 'number') {
        if (config.innerRadius < 0) {
          config.innerRadius = 0;
        }
        if (config.innerRadius > 60) {
          config.innerRadius = 60;
        }
        serie.radius[0] = config.innerRadius + '%';
      }
      if (config.pieMode === 'rose') {
        serie.roseType = config.roseType || 'radius';
      }
      //absolute value for pie
      serie = this._absoluteValueForPieChart(serie);
      return serie;
    },

    _absoluteValueForPieChart: function(serie) {
      if (!serie || !serie.data || !serie.data[0]) {
        return serie;
      }
      serie.data = serie.data.map(function(item) {
        if (typeof item === 'number') {
          item = Math.abs(item);
        } else if (typeof item === 'object' && typeof item.value === 'number') {
          item.value = Math.abs(item.value);
        }
        return item;
      });
      return serie;
    },

    _handleSeriesDataForPieLikeType: function(serie, config) {
      return serie.data.map(lang.hitch(this, function(item, i) {
        var dataObj = {};
        if (!item && typeof item !== 'number') {
          dataObj.value = item;
        } else {
          if (typeof item.value !== 'undefined') {
            dataObj.value = item.value;
          } else {
            dataObj.value = item;
          }
          //unique color
          if (item.itemStyle) {
            if (!dataObj.itemStyle) {
              dataObj.itemStyle = {};
            }
            dataObj.itemStyle = lang.mixin(dataObj.itemStyle, item.itemStyle);
          }
        }
        dataObj.name = config.labels[i] || '';
        return dataObj;
      }));
    },

    _setTypeToSeries: function(option, config) {
      var series = config.series;
      if (!series) {
        return option;
      }
      series.forEach(function(serie) {
        // if series.type is not defined, set as config.type
        if (!serie.type) {
          serie.type = config.type;
        }
        serie.type = config.type === 'column' ? 'bar' : config.type;
      });
      return option;

    },

    splitAxisStackColumn: function(option, config) {
      var series = option.series;
      if (!series || !series.length) {
        return option;
      }
      var showBarBorderColor;
      series.some(function(serie) {
        var data = serie.data;
        if (!data || !data.length) {
          return true;
        }
        data.some(function(dataItem) {
          if (dataItem && dataItem.itemStyle &&
            typeof dataItem.itemStyle.color !== 'undefined' && config.type !== 'line') {
            if (config.stack) {
              showBarBorderColor = 'stack';
            } else {
              showBarBorderColor = 'single';
            }
            return true;
          } else {
            showBarBorderColor = false;
          }
        });
      });

      //borderWidth
      var borderWidth = 0;
      if (showBarBorderColor === 'single') {
        borderWidth = 0.1;
      } else if (showBarBorderColor === 'stack') {
        borderWidth = 1;
      }
      //border color
      var borderColor = 'transparent';
      var stackBorderColor = '';
      if (showBarBorderColor === 'stack') {
        stackBorderColor = '#fff';
        if (config.backgroundColor && config.backgroundColor !== 'transparent') {
          stackBorderColor = config.backgroundColor;
        }
      }
      option.series = option.series.map(function(serie) {
        if (serie.type === 'bar' || serie.type === 'pie') {
          if (!serie.itemStyle) {
            serie.itemStyle = {};
          }
          if (!serie.emphasis) {
            serie.emphasis = {};
          }
          serie.itemStyle.borderWidth = borderWidth;
          serie.emphasis.borderWidth = borderWidth;
          if (stackBorderColor) {
            serie.itemStyle.borderColor = stackBorderColor;
            serie.emphasis.borderColor = stackBorderColor;
          } else {
            serie.itemStyle.borderColor = borderColor;
            serie.emphasis.borderColor = borderColor;
          }
        }
        return serie;
      });
      return option;
    },

    //---------------------gauge-----------------------
    preProcessConfig: function(option, config) {
      config.min = config.min || 0;
      config.max = config.max || 0;
      return option;
    },

    settingLabelColor: function(option, config) {
      var labelColor = '#000';
      if (config.gaugeOption && config.gaugeOption.labelColor) {
        labelColor = config.gaugeOption.labelColor;
      }
      if (config.shape === 'curved') {
        option.series[0].axisLabel.textStyle.color = labelColor;
      } else if (config.shape === 'horizontal') {
        option.xAxis.axisLabel.textStyle.color = labelColor;
      } else if (config.shape === 'vertical') {
        option.yAxis.axisLabel.textStyle.color = labelColor;
      }
      return option;
    },

    settingValueStyle: function(option, config) {
      var valueStyle = config.gaugeOption && config.gaugeOption.valueStyle;
      var textStyle = valueStyle && valueStyle.textStyle;
      var formatter = valueStyle && valueStyle.formatter;

      if (textStyle) {
        var optionTextStyle = config.shape === 'curved' ? option.series[0].detail.textStyle :
          option.series[1].data[0].label.textStyle;
        lang.mixin(optionTextStyle, textStyle);

      }
      if (formatter) {
        if (config.shape === 'curved') {
          option.series[0].detail.formatter = formatter;
        } else {
          option.series[1].data[0].label.formatter = formatter;
        }

      }

      return option;
    },

    settingGaugeColumnColor: function(option, config) {
      var bgColor = config.gaugeOption && config.gaugeOption.bgColor;
      var columnColor = config.gaugeOption && config.gaugeOption.columnColor;

      if (bgColor) {
        option.series[0].itemStyle.color = bgColor;
      }
      if (columnColor) {
        option.series[1].data[0].itemStyle.color = columnColor;
      }
      return option;
    },
    //-------------------gauge horizontal------------------
    initHorizontalOption: function(option) {
      var tempOption = this.horizontal;
      lang.mixin(option, tempOption);
      return option;
    },

    setHorizontalGrid: function(option) {
      option.grid = {
        top: 'middle',
        height: 90,
        left: '10%',
        right: '10%'
      };
      return option;
    },

    settingHorizontalAxis: function(option, config) {
      option.xAxis.max = config.max;
      option.xAxis.min = config.min;
      option.xAxis.scale = true;
      return option;
    },

    settingHorizontalSeries: function(option, config) {
      var series = option.series;
      if (!series || !series.length) {
        return option;
      }
      var baseSerie = series[0];
      var activeSerie = series[1];

      baseSerie.data[0] = config.max;

      option = this._handleValueDisplayForColumnGauge(option, config);
      var name = config.labels && config.labels[0];
      activeSerie.data[0].name = name || '';
      var serieName = config.series[0].name;
      activeSerie.name = serieName || '';

      return option;
    },

    settingHorizontalGaugeRTL: function(option) {
      if (!window.isRTL) {
        return option;
      }
      //Value RTL
      option.series[1].label.offset = [-20, 0];
      //Axia RTL
      option.xAxis.inverse = true;
      option.yAxis.position = 'right';
      return option;
    },

    //-------------------gauge vertical---------------------
    initVerticalOption: function(option) {
      var tempOption = this.vertical;
      lang.mixin(option, tempOption);
      return option;
    },

    setVerticalGrid: function(option) {
      option.grid = {
        left: 'middle',
        width: 60,
        top: '10%',
        bottom: '10%'
      };
      option.grid.left = this._getGridLeftOfVerticalGauge();
      return option;
    },

    settingVerticalAxis: function(option, config) {
      option.yAxis.max = config.max;
      option.yAxis.min = config.min;
      return option;
    },

    settingVerticalSeries: function(option, config) {
      var series = option.series;
      if (!series || !series.length) {
        return option;
      }
      var baseSerie = series[0];
      var activeSerie = series[1];

      baseSerie.data[0] = config.max;

      option = this._handleValueDisplayForColumnGauge(option, config);
      var name = config.labels && config.labels[0];
      activeSerie.data[0].name = name || '';
      var serieName = config.series[0].name;
      activeSerie.name = serieName || '';

      return option;
    },

    settingVerticalGaugeRTL: function(option, config) {
      if (!window.isRTL) {
        return option;
      }
      //value RTL
      var offsetRight = -17;
      var value = config.series[0].data[0] + '';
      var length = value.length - 1;
      if (config.gaugeOption && config.gaugeOption.valueStyle &&
        typeof config.gaugeOption.valueStyle.decimalPlaces !== 'undefined') {
        length += config.gaugeOption.valueStyle.decimalPlaces;
      }
      offsetRight -= length * 9;
      option.series[1].label.offset = [offsetRight, -15];
      //Axia RTL
      option.xAxis.inverse = true;
      option.yAxis.position = 'right';
      return option;
    },

    //-------------------curver---------------------
    initCurvedOption: function(option) {
      var serie = this.curved;
      option.series = [serie];
      return option;
    },

    settingCurvedTooltip: function(option) {
      option.tooltip.formatter = function(toolInfo) {
        return this.handleToolTip(toolInfo, null, false);
      }.bind(this);
      return option;
    },

    settingCurvedSeries: function(option, config) {
      var serie = option.series && option.series[0];
      if (!serie) {
        return option;
      }
      serie.min = config.min || 0;
      serie.max = config.max || 1000;
      //set value to series
      var value = config.series && config.series[0] &&
        config.series[0].data && config.series[0].data[0];
      serie.data[0].value = value || 0;
      //set display by value
      var rate = value ? parseFloat(value / serie.max).toFixed(2) : 0;
      serie.axisLine.lineStyle.color[0][0] = rate;
      //set data item name
      var name = config.labels && config.labels[0];
      if (name) {
        serie.data[0].name = name;
      }
      //set serie name
      var serieName = config.series[0] && config.series[0].name;
      serie.name = serieName || '';
      //set gauge body width
      var width = 30;
      serie.axisLine.lineStyle.width = width;
      option.series = [serie];
      return option;
    },

    settingCurvedGaugeColor: function(option, config) {
      var serie = option.series && option.series[0];
      if (config.gaugeOption) {
        if (config.gaugeOption.bgColor) {
          serie.axisLine.lineStyle.color[1][1] = config.gaugeOption.bgColor;
        }
        if (config.gaugeOption.columnColor) {
          serie.axisLine.lineStyle.color[0][1] = config.gaugeOption.columnColor;
          serie.itemStyle.color = config.gaugeOption.columnColor;
        }
      }
      return option;
    },

    settingCurvedTargets: function(option, config) {
      if (!option.series) {
        return option;
      }

      option.series[0].splitNumber = 1000;
      option.series[0].axisTick.splitNumber = 1;
      option.series[0].axisTick.show = false;

      this.targets = this._getTargetValues(config);
      option = this._showTargetsForCurved(option, config, this.targets);
      return option;
    },

    //-------------gauge dynamic update graphic-------
    createTargetGraphic: function(config) {
      var shape = config.shape;
      var graphic = [];
      if (shape !== 'vertical' && shape !== 'horizontal') {
        return graphic;
      }
      var labelColor = '#000';
      if (config.gaugeOption && config.gaugeOption.labelColor) {
        labelColor = config.gaugeOption.labelColor;
      }
      var position;

      var min = config.min || 0;
      var max = config.max || 100;

      var targets = this._getTargetValues(config);
      var values = targets.values;
      var range = targets.range;

      values.forEach(function(val) {
        if (val > max || val < min) {
          return;
        }
        position = this._calcGraphicPosition(val, shape);
        var top = position.top;
        var graphicLeft = position.graphicLeft;
        var textLeft = position.textLeft;

        var igc = this._createGraphic(graphicLeft, top, val, labelColor, 'image', shape);
        var tgc = this._createGraphic(textLeft, top, val, labelColor, 'text', shape);
        graphic.push(igc);
        graphic.push(tgc);
      }.bind(this));

      range.forEach(function(val) {
        if (val > max || val < min) {
          return;
        }
        position = this._calcGraphicPosition(val, shape);
        var top = position.top;
        var textLeft = position.textLeft;
        var tgc = this._createGraphic(textLeft, top, val, labelColor, 'text', shape);
        graphic.push(tgc);
      }.bind(this));
      return graphic;
    },

    _calcGraphicPosition: function(value, shape) {
      var left, top;
      var graphicLeft, textLeft;
      if (shape === 'vertical') {
        left = this.chart.convertToPixel({
          xAxisIndex: 0
        }, 0);
        left = parseFloat(left, 10).toFixed(2);
        left = Number(left);
        if (window.isRTL) {
          left += 40;
        }
        graphicLeft = left - 26;
        if (!window.isRTL) {
          textLeft = graphicLeft - 11 - (value.toString().length - 1) * 6;
        } else {
          textLeft = graphicLeft + 11;
        }

        top = this._getyAxisValueTop(value);
        top -= 2;
      } else if (shape === 'horizontal') {
        top = this.chart.convertToPixel({
          yAxisIndex: 0
        }, 0);
        top = parseInt(top, 10);
        top = Number(top) + 16;

        graphicLeft = this._getxAxisValueLeft(value);
        var offset = (value.toString().length - 2) * 6;
        textLeft = graphicLeft;
        if (offset > 0) {
          textLeft = graphicLeft - offset;
        }
      }
      return {
        top: top,
        graphicLeft: graphicLeft,
        textLeft: textLeft
      };
    },

    _createGraphic: function(left, top, value, color, type, shape) {
      var imgUrl = this.horIconUrl;
      if (shape === 'vertical') {
        imgUrl = window.isRTL ? this.verIconUrlRTL : this.verIconUrl;
      }
      var graphic = null;
      if (type === 'image') {
        graphic = {
          z: 10,
          type: 'image',
          $action: 'merge',
          id: 'wab_gid_image-' + jimuUtils.getRandomString(),
          left: left,
          style: {
            image: imgUrl,
            width: 10,
            height: 10
          },
          silent: true,
          top: top
        };
      } else if (type === 'text') {
        graphic = {
          z: 10,
          type: 'text',
          $action: 'merge',
          id: 'wab_gid_text-' + jimuUtils.getRandomString(),
          left: left,
          style: {
            text: value,
            fill: color,
            font: 'normal 11px sans-serif'
          },
          silent: true
        };
      }
      if (type === 'text') {
        graphic.top = shape === 'vertical' ? top - 2 : top + 11;
      }
      return graphic;
    },

    //---------gauge dynamic update grid----------------
    updateGridForVerticalGauge: function(config) {
      if (config.type !== 'gauge' || config.shape !== 'vertical') {
        return;
      }
      var grid = {
        left: this._getGridLeftOfVerticalGauge(),
        width: 60,
        top: '10%',
        bottom: '10%'
      };
      return grid;
    },

    //-------------------gauge tools---------------------
    _getTargetValues: function(config) {
      var showTarget = config.gaugeOption && config.gaugeOption.showTargetValueLabel;
      var showDataRangeLabel = config.gaugeOption && config.gaugeOption.showDataRangeLabel;
      var targetValue = config.gaugeOption && config.gaugeOption.targetValue;
      //min max
      var min = config.min || 0;
      var max = config.max || 1000;

      var targets = {
        values: [],
        range: []
      };

      if (targetValue && showTarget) {
        targetValue.forEach(function(val) {
          targets.values.push(val);
        });
      }
      if (showDataRangeLabel) {
        if (targets.values.indexOf(min) < 0) {
          targets.range[0] = min;
        }
        if (targets.values.indexOf(max) < 0) {
          targets.range[1] = max;
        }
      }
      return targets;
    },

    _showTargetsForCurved: function(option, config, targets) {

      var values = targets.values;
      var range = targets.range;
      var targetLabels = values.concat(range);

      var min = config.min;
      var max = config.max;
      var step = (max - min) / 1000;

      targetLabels.sort(function(a, b) {
        return a - b;
      });

      var func = function(callbackVal) {
        var val;
        targetLabels.forEach(function(criticalValue) {
          if (typeof val !== 'undefined') {
            return;
          }
          if (criticalValue >= callbackVal && criticalValue < callbackVal + step) {
            val = criticalValue;
            return;
          }
        });
        return val;
      };
      option.series[0].axisLabel.formatter = func;
      return option;
    },

    _handleValueDisplayForColumnGauge: function(option, config) {
      var displayValue;
      if (config.series[0].data[0] <= config.max) {
        displayValue = config.series[0].data[0];
      } else {
        displayValue = config.max;
      }
      option.tooltip.formatter = function(toolInfo) {
        return this.handleToolTip(toolInfo, config.series[0].data[0], false);
      }.bind(this);
      option.series[1].data[0].value = displayValue;

      return option;
    },

    _getGridLeftOfVerticalGauge: function() {
      var width = this.chart.getWidth();
      return (width / 2) - 30;
    },

    _getxAxisValueLeft: function(value) {
      var left = this.chart.convertToPixel({
        xAxisIndex: 0
      }, value);
      return parseFloat(left, 10) - 4;
    },

    _getyAxisValueTop: function(value) {
      var top = this.chart.convertToPixel({
        yAxisIndex: 0
      }, value);
      return parseFloat(top, 10);
    }

  });

  return ChartUtils;
});