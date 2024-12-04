define([
    'dojo/_base/declare'
  ],
  function(declare) {
    return declare([], {

      constructor: function(option) {
        this.chart = option.chart;
        this.chartUtils = option.chartUtils;
      },

      produceOption: function(option, config) {
        option = this.chartUtils.preProcessConfig(option, config);

        if (config.shape === 'curved') {
          option = this.setCurvedGaugeOption(option, config);
        } else if (config.shape === 'vertical') {
          option = this.setVerticalGaugeOption(option, config);
        } else if (config.shape === 'horizontal') {
          option = this.setHorizontalGaugeOption(option, config);
        } else {
          console.error('invaild gauge shape');
        }

        option = this.chartUtils.settingLabelColor(option, config);
        option = this.chartUtils.settingValueStyle(option, config);
        return option;
      },

      setCurvedGaugeOption: function(option, config) {
        option = this.chartUtils.initCurvedOption(option);
        option = this.chartUtils.settingCurvedSeries(option, config);
        option = this.chartUtils.settingCurvedTooltip(option, config);
        option = this.chartUtils.settingCurvedGaugeColor(option, config);
        option = this.chartUtils.settingCurvedTargets(option, config);
        return option;
      },

      setVerticalGaugeOption: function(option, config) {
        option = this.chartUtils.initVerticalOption(option, this.vertical);
        option = this.chartUtils.setVerticalGrid(option);
        option = this.chartUtils.settingVerticalAxis(option, config);
        option = this.chartUtils.settingVerticalSeries(option, config);
        option = this.chartUtils.settingGaugeColumnColor(option, config);
        option = this.chartUtils.settingVerticalGaugeRTL(option, config);

        return option;
      },

      setHorizontalGaugeOption: function(option, config) {
        option = this.chartUtils.initHorizontalOption(option, this.horizontal);
        option = this.chartUtils.setHorizontalGrid(option);
        option = this.chartUtils.settingHorizontalAxis(option, config);
        option = this.chartUtils.settingHorizontalSeries(option, config);
        option = this.chartUtils.settingGaugeColumnColor(option, config);
        option = this.chartUtils.settingHorizontalGaugeRTL(option, config);

        return option;
      },

      //-------------dynamic update graphic----------
      resetGraphic: function(config) {
        if (config.shape !== 'horizontal' && config.shape !== 'vertical') {
          return;
        }
        var graphic = this.chartUtils.createTargetGraphic(config);
        this.clearGraphic();
        this.chart.setOption({
          graphic: graphic
        });
        this.cacheGraphic = null;
        this.cacheGraphic = graphic;
      },

      clearGraphic: function() {
        if (this.cacheGraphic) {
          this.cacheGraphic.forEach(function(cacheGraph) {
            cacheGraph.$action = 'remove';
          });
          this.chart.setOption({
            graphic: this.cacheGraphic
          });
        }
      },
      //-------------dynamic update grid----------
      resetGrid: function(config) {
        if (config.shape !== 'horizontal' && config.shape !== 'vertical') {
          return;
        }
        var grid = this.chartUtils.updateGridForVerticalGauge(config);
        if (!grid) {
          return;
        }
        this.chart.setOption({
          grid: grid
        });
      }

    });
  });