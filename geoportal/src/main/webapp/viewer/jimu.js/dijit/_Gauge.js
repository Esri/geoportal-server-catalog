define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'jimu/utils'
  ],
  function(declare, lang, jimuUtils) {
    return declare([], {
      curvedGaugeSeries: [{
        type: 'gauge',
        center: ['50%', '60%'],
        startAngle: 200,
        endAngle: -20,
        axisLine: {
          lineStyle: {
            color: [
              [0.31, '#58f7f3'],
              [1, '#E5E5E5']
            ]
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
          normal: {}
        },
        detail: {
          offsetCenter: [0, '60%'],
          textStyle: {
            color: '24B5CC'
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
        // animationDelayUpdate: 100
      }],
      horizontalGauge: {
        grid: {
          top: 'middle',
          height: 90
        },
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
            normal: {
              color: '#E5E5E5'
            }
          },
          barGap: '-100%',
          data: [100],
          z: 1
        }, {
          type: 'bar',
          barWidth: 30,
          label: {
            normal: {
              show: true,
              position: 'top',
              offset: [20, 0],
              textStyle: {}
            }
          },
          data: [{
            value: 40,
            label: {
              normal: {
                textStyle: {
                  color: '#24B5CC',
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  fontFamily: 'Avenir Next',
                  fontSize: 12
                }
              }
            },
            itemStyle: {
              normal: {}
            }
          }],
          itemStyle: {
            normal: {
              color: '#24B5CC'
            }
          },
          z: 10
        }]
      },
      verticalGauge: {
        grid: {
          left: 'middle',
          width: 60
        },
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
            normal: {
              color: '#E5E5E5'
            }
          },
          barGap: '-100%',
          data: [100],
          z: 1
        }, {
          type: 'bar',
          barWidth: 30,
          label: {
            normal: {
              show: true,
              position: 'insideTopLeft',
              offset: [30, -15],
              textStyle: {}
            }
          },
          data: [{
            value: 40,
            label: {
              normal: {
                textStyle: {
                  color: '#24B5CC',
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  fontFamily: 'Avenir Next',
                  fontSize: 12
                }
              }
            },
            itemStyle: {
              normal: {}
            }
          }],
          itemStyle: {
            normal: {
              color: '#24B5CC'
            }
          },
          z: 10
        }]
      },
      // cacheValue: 0;
      setChart: function(chart) {
        this.chart = chart;
      },
      setRTL: function(isRTL) {
        this._isRTL = isRTL;
      },
      _settingValueStyle: function(option, config) {

        if (config.gaugeOption && jimuUtils.isNotEmptyObject(config.gaugeOption.valueStyle)) {
          var valueStyle = config.gaugeOption.valueStyle;
          var textStyle = valueStyle.textStyle;
          var formatter = valueStyle.formatter;
          if (config.shape === 'horizontal' || config.shape === 'vertical') {
            lang.mixin(option.series[1].data[0].label.normal.textStyle, textStyle);
            if (formatter) {
              option.series[1].data[0].label.normal.formatter = formatter;
            }
          } else if (config.shape === 'curved') {
            lang.mixin(option.series[0].detail.textStyle, textStyle);
            if (formatter) {
              option.series[0].detail.formatter = formatter;
            }
          }
        }
        return option;
      },
      _settingLabelColor: function(option, config) {
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
      _settingHorizontalGauge: function(option, config) {
        lang.mixin(option, lang.clone(this.horizontalGauge));
        option.grid = {
          top: 'middle',
          height: 90,
          left: '10%',
          right: '10%'
        };
        config.min = typeof config.min !== 'undefined' && config.min ? config.min : 0;
        config.max = typeof config.max !== 'undefined' && config.max ? config.max : 100;
        option.xAxis.max = config.max;
        option.xAxis.min = config.min;
        option.xAxis.scale = true;
        option.series[0].data[0] = config.max;
        //handle value for value > max
        option = this._handleValue(option, config);
        if (config.labels && config.labels[0]) {
          option.series[1].data[0].name = config.labels[0];
        }
        option.series[1].name = config.series[0].name;
        option = this._settingNoCurvedGaugeColor(option, config);
        option = this._handleHorizontalGaugeValueRTL(option, config);
        return option;
      },
      _handleHorizontalGaugeValueRTL: function(option, config) {
        if (!this._isRTL || config.shape !== 'horizontal') {
          return option;
        }
        option.series[1].label.normal.offset = [-20, 0];
        return option;
      },
      _settingVerticalGauge: function(option, config) {
        lang.mixin(option, lang.clone(this.verticalGauge));
        option.grid = {
          left: 'middle',
          width: 60,
          top: '10%',
          bottom: '10%'
        };
        option.grid.left = this._getGridLeftOfVerticalGauge();
        config.min = typeof config.min !== 'undefined' && config.min ? config.min : 0;
        config.max = typeof config.max !== 'undefined' && config.max ? config.max : 100;
        option.yAxis.max = config.max;
        option.yAxis.min = config.min;
        option.series[0].data[0] = config.max;
        //handle value for value > max
        option = this._handleValue(option, config);
        if (config.labels && config.labels[0]) {
          option.series[1].data[0].name = config.labels[0];
        }
        option.series[1].name = config.series[0].name;
        option = this._settingNoCurvedGaugeColor(option, config);
        option = this._handleVerticalGaugeValueRTL(option, config);
        return option;
      },
      _handleVerticalGaugeValueRTL: function(option, config) {
        if (!this._isRTL || config.shape !== 'vertical') {
          return option;
        }
        var offsetRight = -17;
        var value = config.series[0].data[0] + '';
        var length = value.length - 1;
        if (config.gaugeOption && config.gaugeOption.valueStyle &&
          typeof config.gaugeOption.valueStyle.decimalPlaces !== 'undefined') {
          length += config.gaugeOption.valueStyle.decimalPlaces;
        }
        offsetRight -= length * 9;
        option.series[1].label.normal.offset = [offsetRight, -15];
        return option;
      },
      _handleValue: function(option, config) {
        var handleValue;
        if (config.series[0].data[0] <= config.max) {
          handleValue = config.series[0].data[0];
        } else {
          handleValue = config.max;
          var formatter = function() {
            return config.series[0].data[0];
          };
          option.series[1].data[0].label.normal.formatter = formatter;
          option.tooltip.formatter = function(toolInfo) {
            var colorEl = '<span class="colorEl marginRight5" style="background-color:' +
              jimuUtils.encodeHTML(toolInfo.color) + '"></span>';
            return colorEl + config.series[0].data[0];
          };
        }
        option.series[1].data[0].value = handleValue;
        return option;
      },
      _settingCurvedGauge: function(option, config) {
        option.series = lang.clone(this.curvedGaugeSeries);
        config.min = typeof config.min !== 'undefined' && config.min ? config.min : 0;
        config.max = typeof config.max !== 'undefined' && config.max ? config.max : 100;
        option.series[0].min = config.min;
        option.series[0].max = config.max;

        option.series[0].axisLine.lineStyle.color[0][0] = parseFloat(config.series[0].data[0] / config.max).toFixed(2);

        option.series[0].data[0].value = config.series[0].data[0];
        if (config.labels && config.labels[0]) {
          option.series[0].data[0].name = config.labels[0];
        }

        if (config.series[0].name) {
          option.series[0].name = config.series[0].name;
        }
        // var minChartDistance = this.chart.getWidth() < this.chart.getHeight() ?
        //   this.chart.getWidth() : this.chart.getHeight();

        // var width = minChartDistance * 0.75 / 3;
        // var width = minChartDistance * 0.75 / 3;
        var width = 30;
        option.series[0].axisLine.lineStyle.width = width;
        option = this._settingCurvedGaugeColor(option, config);
        return option;
      },

      _settingGaugeSeries: function(option, config) {
        if (config.type !== 'gauge') {
          return option;
        }
        if (config.shape === 'horizontal') {
          option = this._settingHorizontalGauge(option, config);
        } else if (config.shape === 'vertical') {
          option = this._settingVerticalGauge(option, config);
        } else if (config.shape === 'curved') {
          option = this._settingCurvedGauge(option, config);
        }
        //setting show labels formatter
        option = this._settingGaugeLabel(option, config);
        //setting label color
        option = this._settingLabelColor(option, config);
        option = this._settingValueStyle(option, config);
        return option;
      },
      _resetGraphic: function(config) {
        var graphic = this._settingGraphic(config);
        this._clearGraphic();
        this.chart.setOption({
          graphic: graphic
        });
        this.cacheGraphic = null;
        this.cacheGraphic = graphic;
      },
      _clearGraphic: function() {
        if (this.cacheGraphic) {
          this.cacheGraphic.forEach(function(cacheGraph) {
            cacheGraph.$action = 'remove';
          });
          this.chart.setOption({
            graphic: this.cacheGraphic
          });
        }
      },
      _resetGrid: function(config) {
        var grid = this._settingGridLeftOfVerticalGauge(config);

        if (jimuUtils.isNotEmptyObject(grid)) {
          this.chart.setOption({
            grid: grid
          });
        }
      },
      _settingGridLeftOfVerticalGauge: function(config) {
        if (config.type !== 'gauge' || config.shape !== 'vertical') {
          return {};
        }
        var grid = {
          left: this._getGridLeftOfVerticalGauge(),
          width: 60,
          top: '10%',
          bottom: '10%'
        };
        return grid;
      },
      _settingCurvedGaugeColor: function(option, config) {
        if (config.gaugeOption) {
          if (config.gaugeOption.bgColor) {
            option.series[0].axisLine.lineStyle.color[1][1] = config.gaugeOption.bgColor;
          }
          if (config.gaugeOption.columnColor) {
            option.series[0].axisLine.lineStyle.color[0][1] = config.gaugeOption.columnColor;
          }
        }
        return option;
      },
      _settingNoCurvedGaugeColor: function(option, config) {
        if (config.gaugeOption) {
          if (config.gaugeOption.bgColor) {
            option.series[0].itemStyle.normal.color = config.gaugeOption.bgColor;
          }
          if (config.gaugeOption.columnColor) {
            option.series[1].data[0].itemStyle.normal.color = config.gaugeOption.columnColor;
          }
        }
        return option;
      },
      _settingGraphic: function(config) {
        var graphic = [];
        if (config.type === 'gauge' && config.gaugeOption) {
          if (config.shape === 'horizontal') {
            graphic = this._settingHorizontalGraphic(config);
          } else if (config.shape === 'vertical') {
            graphic = this._settingVerticalGraphic(config);
          }
        }
        return graphic;
      },
      _settingHorizontalGraphic: function(config) {
        var labelColor = '#000';
        if (config.gaugeOption && config.gaugeOption.labelColor) {
          labelColor = config.gaugeOption.labelColor;
        }
        var graphic = [];
        var top = this.chart.convertToPixel({
          yAxisIndex: 0
        }, 0);
        top = parseInt(top, 10);

        top = Number(top) + 16;
        this.cacheCriticalValues = lang.clone(this.criticalValues);
        this.criticalValues.forEach(lang.hitch(this, function(val) {
          var type, value;
          if (typeof val === 'object') {
            if (val.type) {
              type = val.type;
              value = val.value;
            }
          } else {
            value = val;
          }
          var min = config.min || 0;
          var max = config.max || 100;
          if (value > max || value < min) {
            return;
          }
          var left = this._getxAxisValueLeft(value);
          var offset = (value.toString().length - 2) * 6;
          var textLeft = left;
          if (offset > 0) {
            textLeft = left - offset;
          }
          var imgUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjdweCIgaGVpZ2h0PSI1cHgiIHZpZXdCb3g9IjAgMCA3IDUiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0NC4xICg0MTQ1NSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+DQogICAgPHRpdGxlPlRyaWFuZ2xlPC90aXRsZT4NCiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4NCiAgICA8ZGVmcz48L2RlZnM+DQogICAgPGcgaWQ9IkxheW91dC0yTmV3IiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcgaWQ9IkNhcmRXaWRnZXRfTGF5b3V0NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTg3NS4wMDAwMDAsIC0yOTcuMDAwMDAwKSIgZmlsbD0iIzkzOTM5MyI+DQogICAgICAgICAgICA8ZyBpZD0iQ2FyZDJfSG9yaXpvbnRhbEdhdWdlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3OTIuMDAwMDAwLCAxODEuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgPGcgaWQ9Ikhvcml6b250YWxHYXVnZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDY2LjAwMDAwMCkiPg0KICAgICAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMjguNTAwMDAwLCA0Mi41MDAwMDApIHJvdGF0ZSgtMjcwLjAwMDAwMCkgdHJhbnNsYXRlKC0xMjguNTAwMDAwLCAtNDIuNTAwMDAwKSB0cmFuc2xhdGUoODYuMDAwMDAwLCAtODYuMDAwMDAwKSIgaWQ9Ik51bWJlcnMrVHJpYW5nbGVzIj4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwLjAwMDAwMCwgMC4wMDAwMDApIj4NCiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cG9seWdvbiBpZD0iVHJpYW5nbGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIuNTAwMDAwLCAxNzAuNTQzODAzKSByb3RhdGUoLTE4MC4wMDAwMDApIHRyYW5zbGF0ZSgtMi41MDAwMDAsIC0xNzAuNTQzODAzKSAiIHBvaW50cz0iNSAxNzAuNTQzODAzIC0xLjcwNTMwMjU3ZS0xMyAxNzQuMDQzODAzIC0xLjY5NjQyMDc4ZS0xMyAxNjcuMDQzODAzIj48L3BvbHlnb24+DQogICAgICAgICAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4=';
          if (!type) {
            graphic.push({
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
            });
            graphic.push({
              z: 10,
              type: 'text',
              $action: 'merge',
              id: 'wab_gid_text-' + jimuUtils.getRandomString(),
              left: textLeft,
              style: {
                text: value,
                fill: labelColor,
                font: 'normal 11px sans-serif'
              },
              silent: true,
              top: top + 11
            });
          } else {
            graphic.push({
              z: 10,
              type: 'text',
              $action: 'merge',
              id: 'wab_gid_text-' + jimuUtils.getRandomString(),
              left: textLeft,
              style: {
                text: value,
                fill: labelColor,
                font: 'normal 11px sans-serif'
              },
              silent: true,
              top: top + 11
            });
          }

        }));
        return graphic;
      },
      _settingVerticalGraphic: function(config) {
        var labelColor = '#000';
        if (config.gaugeOption && config.gaugeOption.labelColor) {
          labelColor = config.gaugeOption.labelColor;
        }
        var graphic = [];
        var left = this.chart.convertToPixel({
          xAxisIndex: 0
        }, 0);
        left = parseFloat(left, 10).toFixed(2);
        left = Number(left);
        var imgUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjVweCIgaGVpZ2h0PSI4cHgiIHZpZXdCb3g9IjAgMCA1IDgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0NC4xICg0MTQ1NSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+DQogICAgPHRpdGxlPlRyaWFuZ2xlPC90aXRsZT4NCiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4NCiAgICA8ZGVmcz48L2RlZnM+DQogICAgPGcgaWQ9IkxheW91dC0yTmV3IiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcgaWQ9IkNhcmRXaWRnZXRfTGF5b3V0NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTg3Ni4wMDAwMDAsIC0zMjQuMDAwMDAwKSIgZmlsbD0iIzkzOTM5MyI+DQogICAgICAgICAgICA8ZyBpZD0iQ2FyZDJfSG9yaXpvbnRhbEdhdWdlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3OTIuMDAwMDAwLCAxODEuMDAwMDAwKSI+DQogICAgICAgICAgICAgICAgPGcgaWQ9Ikhvcml6b250YWxHYXVnZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsIDY2LjAwMDAwMCkiPg0KICAgICAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMjguNTAwMDAwLCA0Mi41MDAwMDApIHJvdGF0ZSgtMjcwLjAwMDAwMCkgdHJhbnNsYXRlKC0xMjguNTAwMDAwLCAtNDIuNTAwMDAwKSB0cmFuc2xhdGUoODYuMDAwMDAwLCAtODYuMDAwMDAwKSIgaWQ9Ik51bWJlcnMrVHJpYW5nbGVzIj4NCiAgICAgICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwLjAwMDAwMCwgMC4wMDAwMDApIj4NCiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cG9seWdvbiBpZD0iVHJpYW5nbGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDMwLjYyODk1MiwgMTcwLjQ1ODY1NCkgcm90YXRlKC05MC4wMDAwMDApIHRyYW5zbGF0ZSgtMzAuNjI4OTUyLCAtMTcwLjQ1ODY1NCkgIiBwb2ludHM9IjMzLjEyODk1MjMgMTcwLjQ1ODY1NCAyOC4xMjg5NTIzIDE3My45NTg2NTQgMjguMTI4OTUyMyAxNjYuOTU4NjU0Ij48L3BvbHlnb24+DQogICAgICAgICAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICAgICAgICAgIDwvZz4NCiAgICAgICAgICAgICAgICA8L2c+DQogICAgICAgICAgICA8L2c+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4=';
        if (this._isRTL) {
          left += 40;
          imgUrl = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjVweCIgaGVpZ2h0PSI3cHgiIHZpZXdCb3g9IjAgMCA1IDciIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0NC4xICg0MTQ1NSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+DQogICAgPHRpdGxlPlRyaWFuZ2xlPC90aXRsZT4NCiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4NCiAgICA8ZGVmcz48L2RlZnM+DQogICAgPGcgaWQ9IkxheW91dC0yTmV3IiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcgaWQ9IkFydGJvYXJkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTIxLjAwMDAwMCwgLTQ0Ny4wMDAwMDApIiBmaWxsPSIjOTM5MzkzIj4NCiAgICAgICAgICAgIDxwb2x5Z29uIGlkPSJUcmlhbmdsZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTIzLjUwMDAwMCwgNDUwLjUwMDAwMCkgcm90YXRlKC0xODAuMDAwMDAwKSB0cmFuc2xhdGUoLTEyMy41MDAwMDAsIC00NTAuNTAwMDAwKSAiIHBvaW50cz0iMTI2IDQ1MC41IDEyMSA0NTQgMTIxIDQ0NyI+PC9wb2x5Z29uPg0KICAgICAgICA8L2c+DQogICAgPC9nPg0KPC9zdmc+';
        }
        var graphicLeft = left - 26;
        this.cacheCriticalValues = lang.clone(this.criticalValues);
        this.criticalValues.forEach(lang.hitch(this, function(val) {
          var type, value;
          if (typeof val === 'object') {
            if (val.type) {
              type = val.type;
              value = val.value;
            }
          } else {
            value = val;
          }

          var textLeft = graphicLeft;
          if (!this._isRTL) {
            textLeft = graphicLeft - 11 - (value.toString().length - 1) * 6;
          } else {
            textLeft = graphicLeft + 11;
          }
          var min = config.min || 0;
          var max = config.max || 100;
          if (value > max || value < min) {
            return;
          }
          var top = this._getyAxisValueTop(value);
          top -= 2;
          if (!type) {
            graphic.push({
              z: 10,
              type: 'image',
              $action: 'merge',
              id: 'wab_gid_image-' + jimuUtils.getRandomString(),
              left: graphicLeft,
              style: {
                image: imgUrl,
                width: 10,
                height: 10
              },
              silent: true,
              top: top
            });
            graphic.push({
              z: 10,
              type: 'text',
              $action: 'merge',
              id: 'wab_gid_text-' + jimuUtils.getRandomString(),
              left: textLeft,
              style: {
                text: value,
                fill: labelColor,
                font: 'normal 11px sans-serif'
              },
              silent: true,
              top: top - 2
            });
          } else {
            graphic.push({
              z: 10,
              type: 'text',
              $action: 'merge',
              id: 'wab_gid_text-' + jimuUtils.getRandomString(),
              left: textLeft,
              style: {
                text: value,
                fill: labelColor,
                font: 'normal 11px sans-serif'
              },
              silent: true,
              top: top - 2
            });
          }

        }));
        return graphic;
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
      },
      _showSpecialLabel: function(option, config, specialLabels) {
        var func = function(val) {
          var value;
          specialLabels.forEach(function(criticalValue) {
            if (typeof criticalValue === 'number' && criticalValue % 1 === 0) {
              value = criticalValue === val ? criticalValue : value;
            } else {
              if (criticalValue - val < 1 && criticalValue - val >= 0) {
                value = criticalValue;
              }
            }
          });
          return value;
        };
        if (config.shape === 'curved') {
          option.series[0].axisLabel.formatter = func;
        } else if (config.shape === 'horizontal') {
          option.xAxis.axisLabel.formatter = func;
        } else if (config.shape === 'vertical') {
          option.yAxis.axisLabel.formatter = func;
        }
        return option;
      },
      _settingGaugeLabel: function(option, config) {
        //min max
        var min = config.min || 0;
        var max = config.max || 100;
        var criticalValues = [];
        if (config.gaugeOption && config.gaugeOption.showTargetValueLabel) {
          if (config.shape === 'curved') {
            option.series[0].splitNumber = option.series[0].max;
            option.series[0].axisTick.splitNumber = 1;
            option.series[0].axisTick.show = false;
          }

          if (config.gaugeOption.targetValue) {
            config.gaugeOption.targetValue.forEach(function(val) {
              criticalValues.push(val);
            });
          }
        }
        this.criticalValues = lang.clone(criticalValues);
        if (config.gaugeOption && config.gaugeOption.showDataRangeLabel) {

          if (criticalValues.indexOf(min) < 0) {
            criticalValues.push(min);
            this.criticalValues.push({
              type: 'min',
              value: min
            });
          }
          if (criticalValues.indexOf(max) < 0) {
            criticalValues.push(max);
            this.criticalValues.push({
              type: 'max',
              value: max
            });
          }
        }

        if (config.shape === 'curved') {
          return this._showSpecialLabel(option, config, criticalValues);
        } else {
          return option;
        }

      }
    });
  });