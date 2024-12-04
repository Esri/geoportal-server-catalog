define([
  'dojo/_base/declare'
], function(declare) {
  return declare([], {

    constructor: function(option) {
      this.chart = option.chart;
      this.gauge = option.gauge;
      this.chartUtils = option.chartUtils;
    },

    produceOption: function(config) {
      if (!config || !config.type) {
        return;
      }
      var type = config.type;
      var option = {};

      option = this.setCommonOption(option, config);

      if (this.chartUtils.isAxisChart(config)) {
        option = this.setAxisChartOption(option, config);
      } else if (type === 'pie') {
        option = this.setPieChartOption(option, config);
      } else if (type === 'funnel') {
        option = this.setFunnelChartOption(option, config);
      } else if (type === 'radar') {
        option = this.setRadarChartOption(option, config);
      } else if (config.shape) {
        option = this.setGaugeChartOption(option, config);
      }
      //advance option
      option = this.chartUtils.settingAdvanceOption(option, config);
      return option;
    },

    setPieChartOption: function(option, config) {
      option = this.chartUtils.settingPieSeries(option, config);
      option = this.chartUtils._settingSeriesDataLabel(option, config);
      //avoid pie overlap legend and label
      option = this.chartUtils.pieChartAvoidLegendLabelOverLap(option, config);
      //avoid adjoining pie part the same color
      option = this.chartUtils.avoidAdjoiningColorSameForPie(option, config);
      return option;
    },

    setGaugeChartOption: function(option, config) {
      option = this.gauge.produceOption(option, config);
      return option;
    },

    setFunnelChartOption: function(option, config) {
      option = this.chartUtils.settingFunnelSeries(option, config);
      return option;
    },

    setRadarChartOption: function(option, config) {
      option = this.chartUtils.settingRadar(option, config);
      option = this.chartUtils.settingRadarSeries(option, config);
      return option;
    },

    setAxisChartOption: function(option, config) {
      option = this.chartUtils.settingDefaultGrid(option, config);
      option = this.chartUtils.settingAxisChartAxis(option, config);

      option = this.chartUtils.settingAxisSeries(option, config);
      option = this.chartUtils.settingMarks(option, config);
      option = this.chartUtils._settingSeriesDataLabel(option, config);

      option = this.chartUtils.splitAxisStackColumn(option, config);
      option = this.chartUtils.settingStack(option, config);
      //line area
      option = this.chartUtils.settingArea(option, config);
      //scale
      option = this.chartUtils.settingScale(option, config);
      return option;
    },

    setCommonOption: function(option, config) {

      if (!this.chart._theme) {
        this.chart._theme = {};
      }
      //render option
      option = this.chartUtils.settingRenderOption(option, config);
      //background color
      option = this.chartUtils.settingBackgroundColor(option, config);
      //display color
      option = this.chartUtils.settingColor(option, config);
      //tooltip
      option = this.chartUtils.settingToolTip(option, config);
      //legend
      option = this.chartUtils.settingLegend(option, config);
      return option;
    }

  });
});