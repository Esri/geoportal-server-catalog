///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
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
    'dojo/on',
    'dojo/Evented',
    'dojo/Deferred',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/html',
    'dojo/_base/query',
    'dojo/_base/Color',
    'dijit/popup',
    'dijit/_WidgetBase',
    'dijit/TooltipDialog',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./templates/StatisticsChart.html',
    'esri/lang',
    'esri/graphic',
    'esri/graphicsUtils',
    'esri/symbols/jsonUtils',
    'esri/layers/FeatureLayer',
    'jimu/utils',
    'jimu/portalUrlUtils',
    'jimu/clientStatisticsUtils',
    'jimu/dijit/Chart',
    'jimu/dijit/_StatisticsChartSettings',
    'jimu/dijit/LoadingIndicator'
  ],
  function(on, Evented, Deferred, declare, lang, array, html, query, Color, dojoPopup, _WidgetBase, TooltipDialog,
    _TemplatedMixin, _WidgetsInTemplateMixin, template, esriLang, Graphic, graphicsUtils, symbolJsonUtils, FeatureLayer,
    jimuUtils, portalUrlUtils, clientStatisticsUtils, JimuChart, StatisticsChartSettings) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'jimu-dijit-statistics-chart',
      templateString: template,
      theme: "light",
      noMoreThanOneChartClassName: 'no-more-than-one-chart',
      hasTitleClassName: 'has-title',
      charts: null,
      paramsDijits: null,
      tooltipDialogs: null,
      currentChartIndex: -1,
      tempGraphics: null,
      maxPreviewFeaturesCount: 20,
      tooltipColor: "green",
      floatNumberFieldDecimalPlace: null,//{fieldName: decimal place,...}
      popupFieldInfosObj: null,//{fieldName:{fieldName,label,isEditable,tooltip,visible,format...}}
      config: null,
      features: null,
      featureLayer: null,

      //options:
      map: null,// if used in setting page, it is null
      fontColor: "#333333",
      isBigPreview: false,
      showSettingIcon: false,
      showZoomIcon: false,//if isBigPreview is true, showZoomIcon will be ignored
      zoomToFeaturesWhenClick: false,
      initialChartIndex: 0,

      //public methods
      //resize
      //createClientCharts
      //clear

      //public events
      //zoomin

      postMixInProperties:function(){
        this.nls = window.jimuNls.statisticsChart;
        this.charts = [];
        this.paramsDijits = [];
        this.tooltipDialogs = [];
        if(this.isBigPreview){
          this.showZoomIcon = false;
        }
      },

      postCreate: function(){
        this.inherited(arguments);

        if(this.showSettingIcon){
          this.own(on(document.body, 'click', lang.hitch(this, this._onDocumentBodyClick)));
        }else{
          html.destroy(this.settingsIcon);
        }

        if(this.showZoomIcon){
          this.own(on(this.zoominIcon, 'click', lang.hitch(this, function(){
            this.emit("zoomin");
          })));
        }else{
          html.destroy(this.zoominIcon);
        }

        if(this.isBigPreview){
          this.chartContainer.style.maxHeight = "auto";
          html.addClass(this.domNode, 'big-preview');
        }

        this.zoominIcon.title = this.nls.enlarge;
        this.settingsIcon.title = this.nls.setting;

        html.addClass(this.domNode, this.noMoreThanOneChartClassName);
      },

      destroy: function(){
        this.clear();
        this.inherited(arguments);
      },

      resize: function(width, height){
        if(width > 0 || (typeof width === 'string' && width.length > 0)){
          this.domNode.style.width = width;
        }
        if(height > 0 || (typeof height === 'string' && height.length > 0)){
          this.domNode.style.height = height;
        }

        this._resize();
      },

      resizeByParent: function(){
        this.domNode.style.width = "100%";
        this.domNode.style.height = "100%";
        this._resize();
      },

      _resize: function(){
        this._calculateChartBox();

        if(this.currentChartIndex >= 0){
          this._showChart(this.currentChartIndex);
        }
      },

      createServerStatisticsCharts: function(dataSchema, statisticsFeatures, config){
        var originalFieldInfos = dataSchema.fields;
        // var groupByFields = dataSchema.groupByFields;

        var mockDefinition = {
          type: 'Table',
          fields: []//{name,type,alias}
        };

        var mockConfig = lang.clone(config);

        var mode = config.mode;

        if(mode === 'category'){
          /*
          dataSchema: {
            groupByFields: ['POP_CLASS'],
            fields: [{
              name: 'POP',
              type: 'esriFieldTypeInteger',
              alias: 'POP'
            }, {
              name: 'POP_RANK',
              type: 'esriFieldTypeInteger',
              alias: 'POP_RANK'
            }, {
              name: 'POP_CLASS',
              type: 'esriFieldTypeString',
              alias: 'POP_CLASS'
            }]
          }

          config: {
            mode: 'category',
            categoryField: 'POP_CLASS',
            valueFields: ['POP', 'POP_RANK'],
            operation: 'sum'
          }

          mockDefinition: {
            type: 'Table',
            fields: [{
              name: 'POP_CLASS',
              type: 'esriFieldTypeString',
              alias: 'POP_CLASS'
            }, {
              name: 'POP_sum',
              type: 'esriFieldTypeDouble',
              alias: 'POP_sum'
            }, {
              name: 'POP_RANK_sum',
              type: 'esriFieldTypeDouble',
              alias: 'POP_RANK_sum'
            }]
          }

          mockConfig: {
            mode: 'category',
            categoryField: 'POP_CLASS',
            valueFields: ['POP_sum', 'POP_RANK_sum']
          }

          mockFeatures: [{POP_CLASS,POP_sum,POP_RANK_sum},...]
          */
          mockConfig.valueFields = [];

          mockDefinition.fields = array.map(config.valueFields, lang.hitch(this, function(valueField){
            var operation = config.operation;
            if(operation === 'average'){
              operation = 'avg';
            }
            var mockFieldName = valueField + "_" + operation;
            var mockFieldAlias = valueField + "_" + operation;
            mockConfig.valueFields.push(mockFieldName);
            var mockFieldInfo = {
              name: mockFieldName,
              type: "esriFieldTypeDouble",
              alias: mockFieldAlias
            };
            return mockFieldInfo;
          }));
          array.some(originalFieldInfos, lang.hitch(this, function(originalFieldInfo){
            if(originalFieldInfo.name === config.categoryField){
              mockDefinition.fields.push(originalFieldInfo);
              return true;
            }else{
              return false;
            }
          }));
        }else if(mode === 'count'){
          /*
          dataSchema: {
            groupByFields: ['POP_CLASS'],
            fields: [{
              name: 'POP',
              type: 'esriFieldTypeInteger',
              alias: 'POP'
            }, {
              name: 'POP_RANK',
              type: 'esriFieldTypeInteger',
              alias: 'POP_RANK'
            }, {
              name: 'POP_CLASS',
              type: 'esriFieldTypeString',
              alias: 'POP_CLASS'
            }]
          }

          config: {
            mode: 'count',
            categoryField: 'POP_CLASS'
          }

          mockDefinition: {
            type: 'Table',
            fields: [{
              name: 'POP_CLASS',
              type: 'esriFieldTypeString',
              alias: 'POP_CLASS'
            }, {
              name: 'POP_count',
              type: 'esriFieldTypeInteger',
              alias: 'count'
            }]
          }

          mockConfig: {
            mode: 'feature',
            labelField: 'POP_CLASS',
            valueFields: ['POP_count']
          }

          mockFeatures: [{POP_CLASS,POP_count},...]
          */
          mockConfig.mode = 'feature';
          mockConfig.labelField = config.categoryField;
          var countField = dataSchema.fields[0].name + "_count";
          mockConfig.valueFields = [countField];

          //POP_CLASS
          array.some(originalFieldInfos, lang.hitch(this, function(originalFieldInfo){
            if(originalFieldInfo.name === config.categoryField){
              mockDefinition.fields.push(originalFieldInfo);
              return true;
            }else{
              return false;
            }
          }));
          //POP_count
          mockDefinition.fields.push({
            name: countField,
            type: 'esriFieldTypeInteger',
            alias: this.nls.count
          });
        }else if(mode === 'field'){
          /*
          dataSchema: {
            groupByFields: [],
            fields: [{
              name: 'POP_RANK',
              type: 'esriFieldTypeInteger',
              alias: 'POP_RANK'
            }, {
              name: 'LABEL_FLAG',
              type: 'esriFieldTypeInteger',
              alias: 'LABEL_FLAG'
            }]
          }

          config: {
            mode: 'field',
            valueFields: ['POP_RANK', 'LABEL_FLAG'],
            operation: 'sum'
          }

          mockDefinition: {
            type: 'Table',
            fields: [{
              name: 'POP_sum',
              type: 'esriFieldTypeDouble',//same with original
              alias: 'POP_RANK_sum'
            }, {
              name: 'POP_RANK_sum',
              type: 'esriFieldTypeDouble',//same with original
              alias: 'LABEL_FLAG_sum'
            }]
          }

          mockConfig: {
            mode: 'field',
            valueFields: ['POP_sum', 'POP_RANK_sum'],
            operation: 'sum'
          }

          mockFeatures: [{POP_RANK_sum,LABEL_FLAG_sum}]//only one feature
          */

          mockConfig.valueFields = [];

          mockDefinition.fields = array.map(config.valueFields, lang.hitch(this, function(valueField){
            var operation = config.operation;
            if(operation === 'average'){
              operation = 'avg';
            }
            var mockFieldName = valueField + "_" + operation;
            var mockFieldAlias = valueField + "_" + operation;
            mockConfig.valueFields.push(mockFieldName);
            var mockFieldInfo = {
              name: mockFieldName,
              type: "esriFieldTypeDouble",
              alias: mockFieldAlias
            };
            return mockFieldInfo;
          }));
        }

        return this._getLoadedLayer(mockDefinition).then(lang.hitch(this, function(mockFeatureLayer){
          var args = {
            featureLayer: mockFeatureLayer,
            features: statisticsFeatures,
            config: mockConfig
          };
          this._createChartsAsync(args);
        }));
      },

      /*
      featureLayerOrUrl: a FeatureLayer instance or FeatureLayer url
      features: feature array
      config:feature mode {
        mode,
        name,
        labelField,
        valueFields,
        sortOrder,
        highLightColor,
        types: [{
          type: 'bar',
          display: {
            backgroundColor,
            colors,
            showLegend,
            legendTextColor,
            showHorizontalAxis,
            horizontalAxisTextColor,
            showVerticalAxis,
            verticalAxisTextColor
          }
        }, {
          type: 'column',
          display: {
            backgroundColor,
            colors,
            showLegend,
            legendTextColor,
            showHorizontalAxis,
            horizontalAxisTextColor,
            showVerticalAxis,
            verticalAxisTextColor
          }
        }, {
          type: 'line',
          display: {
            backgroundColor,
            colors,
            showLegend,
            legendTextColor,
            showHorizontalAxis,
            horizontalAxisTextColor,
            showVerticalAxis,
            verticalAxisTextColor
          }
        }, {
          type: 'pie',
          display: {
            backgroundColor,
            colors,
            showLegend,
            legendTextColor,
            showDataLabel,
            dataLabelColor
          }
        }]
      }
      config: category mode {
        mode,
        name,
        categoryField,
        operation,
        valueFields,
        sortOrder,
        highLightColor,
        types
      }
      config: count mode {
        mode,
        name,
        categoryField,
        sortOrder,
        highLightColor,
        types
      }
      config: field mode {
        mode,
        name,
        operation,
        valueFields,
        sortOrder,
        highLightColor,
        types
      }
      */
      createClientCharts: function(featureLayerOrUrlOrLayerDefinition, features, config){
        return this._getLoadedLayer(featureLayerOrUrlOrLayerDefinition).then(lang.hitch(this, function(featureLayer){
          var args = {
            featureLayer: featureLayer,
            features: features,
            config: config
          };
          this._createChartsAsync(args);
        }));
      },

      _getLoadedLayer: function(featureLayerOrUrlOrLayerDefinition){
        var def = new Deferred();
        var featureLayer = null;
        if(typeof featureLayerOrUrlOrLayerDefinition === 'string'){
          //url
          featureLayer = new FeatureLayer(featureLayerOrUrlOrLayerDefinition);
        }else{
          if(featureLayerOrUrlOrLayerDefinition.declaredClass === "esri.layers.FeatureLayer"){
            //FeatureLayer
            featureLayer = featureLayerOrUrlOrLayerDefinition;
          }else{
            //layerDefinition
            featureLayer = new FeatureLayer({
              layerDefinition: lang.clone(featureLayerOrUrlOrLayerDefinition),
              featureSet: null
            });
          }
        }

        if (featureLayer.loaded) {
          def.resolve(featureLayer);
        } else {
          this.own(on(featureLayer, 'load', lang.hitch(this, function() {
            def.resolve(featureLayer);
          })));
        }

        return def;
      },

      _createChartsAsync: function(args){
        setTimeout(lang.hitch(this, function(){
          this._createCharts(args);
        }), 0);
      },

      //args: {featureLayer,features,config}
      _createCharts: function(args) {
        try{
          this.loading.hide();

          this.clear();
          if(args.features){
            args.features = array.filter(args.features, lang.hitch(this, function(feature){
              return !!feature.attributes;
            }));
          }
          this.config = args.config;
          this.features = args.features;
          this.featureLayer = args.featureLayer;
          if(!this.config.highLightColor){
            this.config.highLightColor = "#00ffff";
          }
          this._updatePopupFieldInfos();
          this._calculateDecimalPlaceForFloatField();

          this.chartTitle.innerHTML = jimuUtils.stripHTML(this.config.name || "");
          this.chartTitle.title = this.chartTitle.innerHTML;

          if(this.chartTitle.title){
            html.addClass(this.domNode, this.hasTitleClassName);
          }else{
            html.removeClass(this.domNode, this.hasTitleClassName);
          }

          if(args.config.types.length <= 1){
            html.addClass(this.domNode, this.noMoreThanOneChartClassName);
          }else{
            html.removeClass(this.domNode, this.noMoreThanOneChartClassName);
          }

          var box = this._calculateChartBox();
          var w = box.w + 'px';
          var h = box.h + 'px';

          var chartDivs = array.map(args.config.types, lang.hitch(this, function(typeInfo){
            var chartDiv = html.create('div', {
              'class': 'chart-div',
              style: {
                width: w,
                height: h
              }
            }, this.chartContainer);
            // chartDivs.push(chartDiv);
            var strLi = "<li class='paging-li'><a class='paging-a'></a></li>";
            var domLi = html.toDom(strLi);
            html.place(domLi, this.pagingUl);

            var type = typeInfo.type;
            var displayConfig = typeInfo.display;
            if(!displayConfig.backgroundColor){
              displayConfig.backgroundColor = "transparent";//'#ffffff';
            }
            if(!displayConfig.hasOwnProperty("showLegend")){
              displayConfig.showLegend = false;
            }
            if(!displayConfig.legendTextColor){
              displayConfig.legendTextColor = this.fontColor;
            }
            if(type === 'pie'){
              if(!displayConfig.hasOwnProperty("showDataLabel")){
                displayConfig.showDataLabel = true;
              }
              if(!displayConfig.dataLabelColor){
                displayConfig.dataLabelColor = this.fontColor;
              }
            }else{
              if(!displayConfig.hasOwnProperty("showHorizontalAxis")){
                displayConfig.showHorizontalAxis = true;
              }
              if(!displayConfig.horizontalAxisTextColor){
                displayConfig.horizontalAxisTextColor = this.fontColor;
              }
              if(!displayConfig.hasOwnProperty("showVerticalAxis")){
                displayConfig.showVerticalAxis = true;
              }
              if(!displayConfig.verticalAxisTextColor){
                displayConfig.verticalAxisTextColor = this.fontColor;
              }
            }

            return chartDiv;
          }));

          var createResult = null;//{charts:[],paramsDijits:[]}

          if(this.config.mode === 'feature'){
            createResult = this._createFeatureModeCharts(args, chartDivs);
          }else if(this.config.mode === 'category'){
            createResult = this._createCategoryModeCharts(args, chartDivs);
          }else if(this.config.mode === 'count'){
            createResult = this._createCountModeCharts(args, chartDivs);
          }else if(this.config.mode === 'field'){
            createResult = this._createFieldModeCharts(args, chartDivs);
          }

          this.charts = createResult.charts;
          this.paramsDijits = createResult.paramsDijits;
          this.tooltipDialogs = array.map(this.paramsDijits, lang.hitch(this, function(paramsDijit){
            var ttdContent = html.create('div');
            paramsDijit.placeAt(ttdContent);
            var tooltipDialog = new TooltipDialog({
              content: ttdContent
            });
            return tooltipDialog;
          }));
          var chartIndex = 0;
          if(this.initialChartIndex >= 0){
            if(this.charts.length >= (this.initialChartIndex + 1)){
              chartIndex = this.initialChartIndex;
            }
          }
          this._showChart(chartIndex);
        }catch(e){
          console.error(e);
        }
      },

      _calculateChartBox: function(){
        var thisBox = html.getContentBox(this.domNode);
        var itemHeight = thisBox.h;

        if(this.resultsHeader.clientHeight > 0){
          var headerBox = html.getMarginBox(this.resultsHeader);
          itemHeight = thisBox.h - headerBox.h;
        }

        var arrowHeight = 60;
        if(itemHeight < arrowHeight){
          arrowHeight = itemHeight;
        }
        html.setStyle(this.leftArrow, 'height', arrowHeight + 'px');
        html.setStyle(this.rightArrow, 'height', arrowHeight + 'px');
        html.setStyle(this.chartContainer, 'height', itemHeight + 'px');
        var box = html.getContentBox(this.chartContainer);
        return box;
      },

      _updatePopupFieldInfos: function(){
        this.popupFieldInfosObj = {};
        var fieldInfosInMapViewer = null;

        if(this.config.url && this.map && this.map.itemInfo && this.map.itemInfo.itemData){
          var configUrl = jimuUtils.removeSuffixSlashes(this.config.url);
          configUrl = portalUrlUtils.removeProtocol(configUrl);
          var operationalLayers = this.map.itemInfo.itemData.operationalLayers;
          var splits = configUrl.split("/");
          var strLayerId = splits[splits.length - 1];
          var layerId = parseInt(strLayerId, 10);

          if(operationalLayers && operationalLayers.length > 0){
            array.some(operationalLayers, lang.hitch(this, function(operationalLayer){
              var layerUrl = operationalLayer.url;
              if(layerUrl){
                layerUrl = jimuUtils.removeSuffixSlashes(layerUrl);
                layerUrl = portalUrlUtils.removeProtocol(layerUrl);
                if(configUrl.indexOf(layerUrl) >= 0){
                  if(configUrl === layerUrl){
                    //operationalLayer is a feature layer
                    if(operationalLayer.popupInfo && operationalLayer.popupInfo.fieldInfos){
                      fieldInfosInMapViewer = operationalLayer.popupInfo.fieldInfos;
                      return true;
                    }
                  }else if(configUrl.length > layerUrl.length){
                    //operationalLayer is a map server or group layer
                    if(operationalLayer.layers && layerId >= 0){
                      var subOperationLayer = operationalLayer[layerId];
                      if(subOperationLayer && subOperationLayer.popupInfo &&
                        subOperationLayer.popupInfo.fieldInfos){
                        fieldInfosInMapViewer = subOperationLayer.popupInfo.fieldInfos;
                        return true;
                      }
                    }
                  }
                }
              }
              return false;
            }));
          }
        }

        if(fieldInfosInMapViewer && fieldInfosInMapViewer.length > 0){
          array.forEach(fieldInfosInMapViewer, lang.hitch(this, function(fieldInfo){
            var fieldName = fieldInfo.fieldName;
            this.popupFieldInfosObj[fieldName] = fieldInfo;
          }));
        }
      },

      _calculateDecimalPlaceForFloatField: function(){
        this.floatNumberFieldDecimalPlace = {};//{fieldName: decimal place,...}
        var fieldNames = [];
        if(this.config.labelField){
          fieldNames.push(this.config.labelField);
        }
        if(this.config.categoryField){
          fieldNames.push(this.config.categoryField);
        }
        if(this.config.valueFields){
          fieldNames = fieldNames.concat(this.config.valueFields);
        }
        var floatNumberFields = array.filter(fieldNames, lang.hitch(this, function(fieldName){
          return this._isFloatNumberField(fieldName);
        }));
        //{field:values, ...} like {POP: [1,2,3],...}
        var floatNumberFieldValues = {};
        array.forEach(floatNumberFields, lang.hitch(this, function(fieldName){
          floatNumberFieldValues[fieldName] = [];
        }));
        var features = this.features;
        if(features && features.length > 0){
          array.forEach(features, lang.hitch(this, function(feature){
            var attributes = feature.attributes;
            if(attributes){
              array.forEach(floatNumberFields, lang.hitch(this, function(fieldName){
                var value = attributes[fieldName];
                if(typeof value === 'number'){
                  floatNumberFieldValues[fieldName].push(value);
                }
              }));
            }
          }));
        }
        array.forEach(floatNumberFields, lang.hitch(this, function(fieldName){
          this.floatNumberFieldDecimalPlace[fieldName] = 0;
          var values = floatNumberFieldValues[fieldName];
          if(values.length > 0){
            try{
              var decimalPlace = this._getBestDecimalPlace(values);
              this.floatNumberFieldDecimalPlace[fieldName] = decimalPlace;
            }catch(e){
              this.floatNumberFieldDecimalPlace[fieldName] = 0;
              console.error(e);
            }
          }
          //use popup field info to override the calculated places
          if(this.popupFieldInfosObj){
            var popupFieldInfo = this.popupFieldInfosObj[fieldName];
            if(popupFieldInfo){
              if(popupFieldInfo.format && popupFieldInfo.format.places >= 0){
                this.floatNumberFieldDecimalPlace[fieldName] = popupFieldInfo.format.places;
              }
            }
          }
        }));
      },

      _onDocumentBodyClick: function(event){
        if(this.currentChartIndex >= 0 && this.tooltipDialogs){
          var tooltipDialog = this.tooltipDialogs[this.currentChartIndex];
          if(tooltipDialog){
            var originalOpenStatus = !!tooltipDialog.isOpendNow;
            this._hideAllTooltipDialogs();
            var target = event.target || event.srcElement;
            if(target === this.leftArrow || target === this.rightArrow){
              return;
            }
            if(html.hasClass(target, 'paging-a') || html.hasClass(target, 'paging-li')){
              return;
            }
            var isClickSettingIcon = target === this.settingsIcon;
            if(isClickSettingIcon){
              if(originalOpenStatus){
                this._hideTooltipDialog(tooltipDialog);
              }
              else{
                this._showTooltipDialog(tooltipDialog);
              }
            }else{
              var a = target === tooltipDialog.domNode;
              var b = html.isDescendant(target, tooltipDialog.domNode);
              var isClickInternal = a || b;
              if(isClickInternal){
                if(originalOpenStatus){
                  this._showTooltipDialog(tooltipDialog);
                }else{
                  this._hideTooltipDialog(tooltipDialog);
                }
              }else{
                this._hideTooltipDialog(tooltipDialog);
              }
            }
          }else{
            this._hideAllTooltipDialogs();
          }
        }else{
          this._hideAllTooltipDialogs();
        }
      },

      clear: function(){
        this.config = null;
        this.features = null;
        this.featureLayer = null;
        this.chartTitle.innerHTML = "";
        this.chartTitle.title = "";

        this.currentChartIndex = -1;
        this.floatNumberFieldDecimalPlace = null;
        this.popupFieldInfosObj = null;
        query("li", this.pagingUl).removeClass('selected');

        if(!this.charts){
          this.charts = [];
        }

        if(!this.paramsDijits){
          this.paramsDijits = [];
        }

        if(!this.tooltipDialogs){
          this.tooltipDialogs = [];
        }

        for(var i = 0; i < this.charts.length; i++){
          //destroy chart
          if(this.charts[i]){
            this.charts[i].destroy();
          }
          this.charts[i] = null;

          //destroy paramsDijit
          if(this.paramsDijits[i]){
            this.paramsDijits[i].destroy();
          }
          this.paramsDijits[i] = null;

          //destroy tooltipDialog
          if(this.tooltipDialogs[i]){
            this.tooltipDialogs[i].destroy();
          }
          this.tooltipDialogs[i] = null;
        }
        this.charts = [];
        this.paramsDijits = [];
        this.tooltipDialogs = [];
        html.empty(this.pagingUl);
        html.empty(this.chartContainer);
        html.addClass(this.domNode, this.noMoreThanOneChartClassName);
      },

      _showChart: function(index) {
        this.currentChartIndex = -1;
        var chartDivs = query('.chart-div', this.chartContainer);
        chartDivs.style({
          display: 'none'
        });
        var lis = query("li", this.pagingUl);
        lis.removeClass('selected');

        if (index < 0) {
          return;
        }

        var chartDiv = chartDivs[index];
        if (chartDiv) {
          this.currentChartIndex = index;
          html.setStyle(chartDiv, 'display', 'block');
        }

        var li = lis[index];
        if (li) {
          html.addClass(li, 'selected');
        }

        if(this.isBigPreview){
          return;
        }

        var chart = null;
        if(this.charts && this.charts.length > 0){
          chart = this.charts[index];
          if(chart){
            var chartBox = this._calculateChartBox();
            var currentChartBox = html.getContentBox(chartDiv);
            if(chartBox.w !== currentChartBox.w || chartBox.h !== currentChartBox.h){
              this.loading.show();
              //size changes
              var w = chartBox.w + 'px';
              var h = chartBox.h + 'px';
              html.setStyle(chartDiv, 'width', w);
              html.setStyle(chartDiv, 'height', h);
              chart.resize(w, h);
              this.loading.hide();
            }
          }
        }
      },

      _hideAllTooltipDialogs: function(){
        if(this.tooltipDialogs && this.tooltipDialogs.length > 0){
          array.forEach(this.tooltipDialogs, lang.hitch(this, function(tooltipDialog){
            this._hideTooltipDialog(tooltipDialog);
          }));
        }
      },

      _hideTooltipDialog: function(tooltipDialog){
        if(tooltipDialog){
          dojoPopup.close(tooltipDialog);
          tooltipDialog.isOpendNow = false;
        }
      },

      _showTooltipDialog: function(tooltipDialog) {
        if(tooltipDialog){
          dojoPopup.open({
            popup: tooltipDialog,
            around: this.settingsIcon
          });
          tooltipDialog.isOpendNow = true;
        }
      },

      _onPagingUlClicked: function(event){
        event.stopPropagation();
        this._hideAllTooltipDialogs();
        var target = event.target || event.srcElement;
        var tagName = target.tagName.toLowerCase();
        if (tagName === 'a') {
          var as = query('a', this.pagingUl);
          var index = array.indexOf(as, target);
          if (index >= 0) {
            this._showChart(index);
          }
        }
      },

      _onLeftArrowClicked: function(event){
        event.stopPropagation();
        this._hideAllTooltipDialogs();
        var index = (this.currentChartIndex - 1 + this.charts.length) % this.charts.length;
        if (index >= 0) {
          this._showChart(index);
        }
      },

      _onRightArrowClicked: function(event){
        event.stopPropagation();
        this._hideAllTooltipDialogs();
        var index = (this.currentChartIndex + 1 + this.charts.length) % this.charts.length;
        if (index >= 0) {
          this._showChart(index);
        }
      },

      _getHighLightMarkerSymbol:function(){
        // var sym = symbolJsonUtils.fromJson(this.config.symbol);
        // var size = Math.max(sym.size || 0, sym.width || 0, sym.height, 18);
        // size += 1;

        var size = 30;

        var symJson = {
          "color": [255, 255, 255, 0],
          "size": 18,
          "angle": 0,
          "xoffset": 0,
          "yoffset": 0,
          "type": "esriSMS",
          "style": "esriSMSSquare",
          "outline": {
            "color": [0, 0, 128, 255],
            "width": 0.75,
            "type": "esriSLS",
            "style": "esriSLSSolid"
          }
        };
        var symbol = symbolJsonUtils.fromJson(symJson);
        symbol.setSize(size);
        symbol.outline.setColor(new Color(this.config.highLightColor));

        return symbol;
      },

      _getHighLightLineSymbol: function(){
        var selectedSymJson = {
          "color": [0, 255, 255, 255],
          "width": 1.5,
          "type": "esriSLS",
          "style": "esriSLSSolid"
        };
        var symbol = symbolJsonUtils.fromJson(selectedSymJson);
        symbol.setColor(new Color(this.config.highLightColor));
        return symbol;
      },

      _getHighLightFillSymbol:function(){
        // var symbol = symbolJsonUtils.fromJson(this.config.symbol);
        // var outlineSymJson = {
        //   "color": [0, 255, 255, 255],
        //   "width": 1.5,
        //   "type": "esriSLS",
        //   "style": "esriSLSSolid"
        // };
        // var outlineSym = symbolJsonUtils.fromJson(outlineSymJson);
        // outlineSym.setColor(new Color(this.config.highLightColor));
        // symbol.setOutline(outlineSym);
        // return symbol;

        var symbolJson = {
          "color": [255, 255, 255, 128],
          "outline": {
            "color": [0, 255, 255, 255],
            "width": 1.5,
            "type": "esriSLS",
            "style": "esriSLSSolid"
          },
          "type": "esriSFS",
          "style": "esriSFSSolid"
        };
        var symbol = symbolJsonUtils.fromJson(symbolJson);
        symbol.outline.setColor(new Color(this.config.highLightColor));
        return symbol;
      },

      _zoomToGraphics: function(features){
        if(!this.map){
          return;
        }

        var isVisible = this.featureLayer && this.featureLayer.visible;
        if(!isVisible){
          return;
        }

        if(features && features.length > 0){
          var extent = null;
          try{
            //some graphics maybe don't have geometry, so need to filter graphics here by geometry
            var fs = array.filter(features, function(f){
              return !!f.geometry;
            });
            if(fs.length > 0){
              extent = graphicsUtils.graphicsExtent(fs);
            }
          }catch(e){
            console.error(e);
          }

          if(extent){
            this.map.setExtent(extent.expand(1.4));
          }else{
            var firstFeature = features[0];
            var geometry = firstFeature && firstFeature.geometry;

            if(geometry){
              var singlePointFlow = lang.hitch(this, function(centerPoint){
                var maxLevel = this.map.getNumLevels();
                var currentLevel = this.map.getLevel();
                var level2 = Math.floor(maxLevel * 2 / 3);
                var zoomLevel = Math.max(currentLevel, level2);
                this.map.setLevel(zoomLevel).then(lang.hitch(this, function(){
                  this.map.centerAt(centerPoint);
                }));
              });

              if(geometry.type === 'point'){
                singlePointFlow(geometry);
              }else if(geometry.type === 'multipoint'){
                if(geometry.points.length === 1){
                  singlePointFlow(geometry.getPoint(0));
                }
              }
            }
          }
        }
      },

      _removeTempGraphics: function(){
        if(this.featureLayer && this.tempGraphics && this.tempGraphics.length > 0){
          while(this.tempGraphics.length > 0){
            this.featureLayer.remove(this.tempGraphics[0]);
            this.tempGraphics.splice(0, 1);
          }
        }
        this.tempGraphics = null;
      },

      _mouseOverChartItem: function(features){
        this._removeTempGraphics();

        var isVisible = this.featureLayer && this.featureLayer.getMap() && this.featureLayer.visible;
        if(!isVisible){
          return;
        }

        var geoType = jimuUtils.getTypeByGeometryType(this.featureLayer.geometryType);
        var symbol = null;
        if(geoType === 'point'){
          symbol = this._getHighLightMarkerSymbol();
          this.tempGraphics = [];
          array.forEach(features, lang.hitch(this, function(feature){
            var g = new Graphic(feature.geometry, symbol);
            this.tempGraphics.push(g);
            this.featureLayer.add(g);
          }));
        }else if(geoType === 'polyline' || geoType === 'polygon'){
          if(geoType === 'polyline'){
            symbol = this._getHighLightLineSymbol();
          }else{
            symbol = this._getHighLightFillSymbol();
          }

          array.forEach(features, lang.hitch(this, function(feature) {
            feature.setSymbol(symbol);
          }));

          if(this.features.length !== features.length && geoType === 'polygon'){
            array.forEach(features, lang.hitch(this, function(feature){
              this.featureLayer.remove(feature);
            }));
            array.forEach(features, lang.hitch(this, function(feature){
              this.featureLayer.add(feature);
            }));
          }
        }
      },

      _mouseOutChartItem: function(){
        this._removeTempGraphics();

        if(!this.featureLayer){
          return;
        }

        array.forEach(this.featureLayer.graphics, lang.hitch(this, function(feature){
          feature.setSymbol(null);
        }));
      },

      _isNumber: function(value){
        var valueType = Object.prototype.toString.call(value).toLowerCase();
        return valueType === "[object number]";
      },

      _tryLocaleNumber: function(value, /*optional*/ fieldName){
        var result = value;
        if(esriLang.isDefined(value) && isFinite(value)){
          try{
            var a;
            //if pass "abc" into localizeNumber, it will return null
            if(fieldName && this._isNumberField(fieldName)){
              var popupFieldInfo = this.popupFieldInfosObj[fieldName];
              if(popupFieldInfo && lang.exists('format.places', popupFieldInfo)){
                a = jimuUtils.localizeNumberByFieldInfo(value, popupFieldInfo);
              }else{
                a = jimuUtils.localizeNumber(value);
              }
            }else{
              //#6117
              a = value; //jimuUtils.localizeNumber(value);
            }

            if(typeof a === "string"){
              result = a;
            }
          }catch(e){
            console.error(e);
          }
        }
        //make sure the retun value is string
        result += "";
        return result;
      },

      _getBestDisplayValue: function(fieldName, value){
        var displayValue = this._tryLocaleNumber(value, fieldName);

        //check subtype description
        //http://services1.arcgis.com/oC086ufSSQ6Avnw2/arcgis/rest/services/Parcels/FeatureServer/0
        if(this.featureLayer.typeIdField === fieldName){
          var types = this.featureLayer.types;
          if(types && types.length > 0){
            var typeObjs = array.filter(types, lang.hitch(this, function(item){
              return item.id === value;
            }));
            if(typeObjs.length > 0){
              displayValue = typeObjs[0].name;
              return displayValue;
            }
          }
        }

        //check codedValue
        //http://jonq/arcgis/rest/services/BugFolder/BUG_000087622_CodedValue/FeatureServer/0
        //http://services1.arcgis.com/oC086ufSSQ6Avnw2/arcgis/rest/services/Parcels/FeatureServer/0
        var fieldInfo = this._getFieldInfo(fieldName);
        if(fieldInfo){
          if(fieldInfo.domain){
            var codedValues = fieldInfo.domain.codedValues;
            if(codedValues && codedValues.length > 0){
              array.some(codedValues, function(item){
                if(item.code === value){
                  displayValue = item.name;
                  return true;
                }else{
                  return false;
                }
              });
            }
          }
        }
        return displayValue;
      },

      _getFieldAliasArray: function(fieldNames){
        var results = array.map(fieldNames, lang.hitch(this, function(fieldName){
          return this._getFieldAlias(fieldName);
        }));
        return results;
      },

      _getFieldAlias: function(fieldName){
        var fieldAlias = fieldName;
        var fieldInfo = this._getFieldInfo(fieldName);
        if(fieldInfo){
          fieldAlias = fieldInfo.alias || fieldAlias;
        }
        return fieldAlias;
      },

      _getFieldInfo: function(fieldName){
        if(this.featureLayer){
          var fieldInfos = this.featureLayer.fields;
          for(var i = 0; i < fieldInfos.length; i++){
            if(fieldInfos[i].name === fieldName){
              return fieldInfos[i];
            }
          }
        }
        return null;
      },

      _isNumberField: function(fieldName){
        var numberTypes = ['esriFieldTypeSmallInteger',
                        'esriFieldTypeInteger',
                        'esriFieldTypeSingle',
                        'esriFieldTypeDouble'];
        var isNumber = array.some(this.featureLayer.fields, lang.hitch(this, function(fieldInfo){
          return fieldInfo.name === fieldName && numberTypes.indexOf(fieldInfo.type) >= 0;
        }));
        return isNumber;
      },

      _isFloatNumberField: function(fieldName){
        var numberTypes = ['esriFieldTypeSingle', 'esriFieldTypeDouble'];
        var isNumber = array.some(this.featureLayer.fields, lang.hitch(this, function(fieldInfo){
          return fieldInfo.name === fieldName && numberTypes.indexOf(fieldInfo.type) >= 0;
        }));
        return isNumber;
      },

      _isDateField: function(fieldName){
        var fieldInfo = this._getFieldInfo(fieldName);
        if(fieldInfo){
          return fieldInfo.type === 'esriFieldTypeDate';
        }
        return false;
      },

      _getBestDecimalPlace: function(floatValues){
        var decimalPlace = 0;
        //{decimal:count,...} like {2:123, 3:321, ...}
        var statisticsHash = {};
        array.forEach(floatValues, function(value){
          var splits = value.toString().split(".");
          var key = null;
          if(splits.length === 1){
            //value doesn't have fractional part
            key = 0;
          }else if(splits.length === 2){
            //value has fractional part
            key = splits[1].length;
          }
          if(key !== null){
            if(statisticsHash[key] === undefined){
              statisticsHash[key] = 1;
            }else{
              statisticsHash[key] += 1;
            }
          }
        });
        var maxDecimalPlaceItem = null;
        for(var key in statisticsHash){
          key = parseInt(key, 10);
          var value = statisticsHash[key];
          if(maxDecimalPlaceItem){
            if(value > maxDecimalPlaceItem.value){
              maxDecimalPlaceItem = {
                key: key,
                value: value
              };
            }
          }else{
            maxDecimalPlaceItem = {
              key: key,
              value: value
            };
          }
        }
        if(maxDecimalPlaceItem){
          decimalPlace = parseInt(maxDecimalPlaceItem.key, 10);
        }
        return decimalPlace;
      },

      _getFloatNumberFieldDecimalPlace: function(floatNumberField){
        var decimalPlace = 0;
        if(this.floatNumberFieldDecimalPlace){
          var value = this.floatNumberFieldDecimalPlace[floatNumberField];
          if(typeof value === 'number'){
            decimalPlace = value;
          }
        }
        return decimalPlace;
      },

      _getBestValueForFloatNumberField: function(value, floatNumberField){
        var decimalPlace = this._getFloatNumberFieldDecimalPlace(floatNumberField);
        var str = value.toFixed(decimalPlace);
        return parseFloat(str);
      },

      _getColors: function(paramsConfig, count){
        var colors = [];
        var config = lang.clone(paramsConfig);

        if(config.colors.length === 2){
          //gradient colors
          colors = this._createGradientColors(config.colors[0],
                                              config.colors[config.colors.length - 1],
                                              count);
        }else{
          var a = Math.ceil(count / config.colors.length);
          for(var i = 0; i < a; i++){
            colors = colors.concat(config.colors);
          }
          colors = colors.slice(0, count);
        }

        return colors;
      },

      _createGradientColors: function(firstColor, lastColor, count){
        var colors = [];
        var c1 = new Color(firstColor);
        var c2 = new Color(lastColor);
        var deltaR = (c2.r - c1.r) / count;
        var deltaG = (c2.g - c1.g) / count;
        var deltaB = (c2.b - c1.b) / count;
        var c = new Color();
        var r = 0;
        var g = 0;
        var b = 0;
        for(var i = 0; i < count; i++){
          r = parseInt(c1.r + deltaR * i, 10);
          g = parseInt(c1.g + deltaG * i, 10);
          b = parseInt(c1.b + deltaB * i, 10);
          c.setColor([r, g, b]);
          colors.push(c.toHex());
        }
        return colors;
      },

      _createParamsDijit: function(type, chartDisplayConfig){
        var options = {
          isInWidget: this.map ? true : false,
          type: type,
          config: chartDisplayConfig
        };
        var paramsDijit = new StatisticsChartSettings(options);
        return paramsDijit;
      },

      _createJimuChart: function(chartDiv, mode, options, data, chartTypeInfo){
        var type = chartTypeInfo.type;
        var displayConfig = chartTypeInfo.display;
        var paramsDijit = this._createParamsDijit(type, displayConfig);
        var paramsConfig1 = paramsDijit.getConfig();
        if(paramsConfig1){
          lang.mixin(chartTypeInfo.display, paramsConfig1);
        }
        var chartOptions = this._getBasicChartOptionsByStatisticsInfo(mode, options, data, type);
        this._udpateJimuChartDisplayOptions(chartOptions, chartTypeInfo);

        var chart = new JimuChart({
          chartDom: chartDiv,
          config: chartOptions
        });
        chart.placeAt(chartDiv);
        this._bindChartEvent(chart, mode, data);

        if(this.showSettingIcon){
          this.own(on(paramsDijit, 'change', lang.hitch(this, function() {
            paramsDijit.showShelter();
            if (chart) {
              var paramsConfig2 = paramsDijit.getConfig();
              lang.mixin(chartTypeInfo.display, paramsConfig2);
              this._udpateJimuChartDisplayOptions(chartOptions, chartTypeInfo);
              chart.setConfig(chartOptions);
            }
            paramsDijit.hideShelter();
          })));
        }

        return [chart, paramsDijit];
      },

      _udpateJimuChartDisplayOptions: function(chartOptions, chartTypeInfo){
        var type = chartTypeInfo.type;
        var displayConfig = chartTypeInfo.display;

        var mixinOptions = {
          type: type,
          dataZoom: ["inside", "slider"],
          confine: true,
          backgroundColor: displayConfig.backgroundColor,
          color: displayConfig.colors,
          legend: displayConfig.showLegend,
          theme: this.theme || "light",
          advanceOption: function(options){
            //legend
            if (displayConfig.showLegend) {
              if (options.legend) {
                if (!options.legend.textStyle) {
                  options.legend.textStyle = {};
                }
                options.legend.textStyle.color = displayConfig.legendTextColor;
              }
            }

            if(type === 'pie'){
              if(options.series && options.series.length > 0){
                array.forEach(options.series, lang.hitch(this, function(item){
                  if(item.type === 'pie'){
                    if(!item.label){
                      item.label = {};
                    }
                    if(!item.label.normal){
                      item.label.normal = {};
                    }
                    item.label.normal.show = displayConfig.showDataLabel;
                    if(!item.label.normal.textStyle){
                      item.label.normal.textStyle = {};
                    }
                    item.label.normal.textStyle.color = displayConfig.dataLabelColor;
                  }
                }));
              }
            }else{
              //xAxis
              if(!options.xAxis){
                options.xAxis = {};
              }
              // options.xAxis.show = displayConfig.showHorizontalAxis;
              if(!options.xAxis.axisLabel){
                options.xAxis.axisLabel = {};
              }
              if(!options.xAxis.axisLabel.textStyle){
                options.xAxis.axisLabel.textStyle = {};
              }
              options.xAxis.axisLabel.textStyle.color = displayConfig.horizontalAxisTextColor;

              //yAxis
              if(!options.yAxis){
                options.yAxis = {};
              }
              // options.yAxis.show = displayConfig.showVerticalAxis;
              if(!options.yAxis.axisLabel){
                options.yAxis.axisLabel = {};
              }
              if(!options.yAxis.axisLabel.textStyle){
                options.yAxis.axisLabel.textStyle = {};
              }
              options.yAxis.axisLabel.textStyle.color = displayConfig.verticalAxisTextColor;
              // if(!displayConfig.showVerticalAxis){
              //   if(window.isRTL){
              //     options.grid.right = "5%";
              //   }else{
              //     options.grid.left = "5%";
              //   }
              // }
            }
          }
        };

        if(type === 'pie'){
          mixinOptions.labelLine = !!displayConfig.showDataLabel;
        }
        lang.mixin(chartOptions, mixinOptions);

        if(type !== 'pie'){
          chartOptions.axisPointer = false;
          chartOptions.scale = false;
          chartOptions.hidexAxis = !displayConfig.showHorizontalAxis;
          chartOptions.hideyAxis = !displayConfig.showVerticalAxis;
        }

        return chartOptions;
      },

      _getBasicChartOptionsByStatisticsInfo: function(mode, options, data, type){
        if(mode === 'feature' || mode === 'category'){
          return this._getCategoryModeChartOptionsByStatisticsInfo(options, data, type);
        }else if(mode === 'count'){
          return this._getCountModeChartOptionsByStatisticsInfo(options, data, type);
        }else if(mode === 'field'){
          return this._getFieldModeChartOptionByStatisticsInfo(options, data, type);
        }
        return null;
      },

      _bindChartEvent: function(chart, mode, data){
        if(!this.map){
          return;
        }
        var callback = lang.hitch(this, function(evt) {
          if (evt.componentType !== 'series') {
            return;
          }

          var features = null;

          if(mode === 'field'){
            features = this.features;
          }else{
            //category: {category,valueFields,dataFeatures:[f1,f2...]}
            //count {fieldValue:value1,count:count1,dataFeatures:[f1,f2...]}
            var a = data[evt.dataIndex];
            features = a.dataFeatures;
          }

          if(!features){
            return;
          }

          if (evt.type === 'mouseover') {
            this._mouseOverChartItem(features);
          } else if (evt.type === 'mouseout') {
            this._mouseOutChartItem(features);
          } else if (evt.type === 'click') {
            if(this.zoomToFeaturesWhenClick){
              this._zoomToGraphics(features);
            }
          }
        });

        var events = [{
          name: 'mouseover',
          callback: callback
        }, {
          name: 'mouseout',
          callback: callback
        }];
        if(this.zoomToFeaturesWhenClick){
          events.push({
            name: 'click',
            callback: callback
          });
        }
        array.forEach(events, lang.hitch(this, function(event) {
          chart.chart.on(event.name, event.callback);
        }));
      },

      //---------------create feature mode charts---------------
      _createFeatureModeCharts: function(args, chartDivs){
        var charts = [];
        var paramsDijits = [];
        var config = args.config;

        var options = {
          layerDefinition: this.featureLayer,
          features: args.features,
          labelField: config.labelField,
          valueFields: config.valueFields,
          sortOrder: config.sortOrder
        };

        //data: [{category:'a',valueFields:[10,100,2],dataFeatures:[f1]}]
        var data = clientStatisticsUtils.getFeatureModeStatisticsInfo(options);

        array.forEach(config.types, lang.hitch(this, function(typeInfo, i){
          try {
            var chartDiv = chartDivs[i];
            var results = this._createJimuChart(chartDiv, 'feature', options, data, typeInfo);
            charts.push(results[0]);
            paramsDijits.push(results[1]);
          } catch (e) {
            console.error(e);
          }
        }));

        return {
          charts: charts,
          paramsDijits: paramsDijits
        };
      },

      //--------------------create category mode charts-------------------------
      _createCategoryModeCharts: function(args, chartDivs){
        /*jshint -W083 */
        var charts = [];
        var paramsDijits = [];
        var config = args.config;

        var options = {
          layerDefinition: this.featureLayer,
          features: args.features,
          categoryField: config.categoryField,
          valueFields: config.valueFields,
          operation: args.config.operation,
          sortOrder: config.sortOrder
        };

        //data: [{category:'a',valueFields:[10,100,2],dataFeatures:[f1,f2...]}]
        var data = clientStatisticsUtils.getCategoryModeStatisticsInfo(options);

        array.forEach(config.types, lang.hitch(this, function(typeInfo, i){
          try {
            var chartDiv = chartDivs[i];
            var results = this._createJimuChart(chartDiv, 'category', options, data, typeInfo);
            charts.push(results[0]);
            paramsDijits.push(results[1]);
          } catch (e) {
            console.error(e);
          }
        }));

        return {
          charts: charts,
          paramsDijits: paramsDijits
        };
      },

      _getCategoryModeChartOptionsByStatisticsInfo: function(options, data, chartType){
        //data: [{category:'a',valueFields:[10,100,2],dataFeatures:[f1,f2...]}]

        var chartOptions = {
          type: chartType,
          labels: [],
          series: []
        };
        var valueFields = options.valueFields;
        var valueAliases = this._getFieldAliasArray(valueFields);
        var labelOrCategoryField = options.labelField || options.categoryField;
        chartOptions.series = array.map(valueAliases, lang.hitch(this, function(valueFieldAlias){
          var item = {
            name: valueFieldAlias,
            type: chartType,
            data: []
          };
          return item;
        }));

        array.forEach(data, lang.hitch(this, function(item){
          //item: {category:'a',valueFields:[10,100,2]
          var text = this._getBestDisplayValue(labelOrCategoryField, item.category);
          chartOptions.labels.push(text);
          for(var i = 0; i < item.valueFields.length; i++){
            var num = item.valueFields[i];
            // var fieldName = valueFields[i];
            // var aliasName = valueAliases[i];
            // var c = this._getBestDisplayValue(fieldName, num);
            chartOptions.series[i].data.push(num);
          }
        }));
        return chartOptions;
      },

      //------------------------create count mode charts--------------------------
      _createCountModeCharts: function(args, chartDivs){
        var charts = [];
        var paramsDijits = [];
        var config = args.config;

        var options = {
          layerDefinition: this.featureLayer,
          features: args.features,
          categoryField: config.categoryField,
          sortOrder: config.sortOrder
        };

        //data:[{fieldValue:value1,count:count1,dataFeatures:[f1,f2...]}]
        var data = clientStatisticsUtils.getCountModeStatisticsInfo(options);

        array.forEach(config.types, lang.hitch(this, function(typeInfo, i){
          try {
            var chartDiv = chartDivs[i];
            var results = this._createJimuChart(chartDiv, 'count', options, data, typeInfo);
            charts.push(results[0]);
            paramsDijits.push(results[1]);
          } catch (e) {
            console.error(e);
          }
        }));

        return {
          charts: charts,
          paramsDijits: paramsDijits
        };
      },

      //options: {features, categoryField, sortOrder}
      //data: [{fieldValue:value1,count:count1,dataFeatures:[f1,f2...]}]
      _getCountModeChartOptionsByStatisticsInfo: function(options, data, chartType){
        //data: [{fieldValue:value1,count:count1,dataFeatures:[f1,f2...]}]
        var chartOptions = {
          type: chartType,
          labels: [],
          series: [{
            name: this._legendNls || "Legend",
            type: chartType,
            data: []
          }]
        };

        //[{fieldValue:value1,count:count1,dataFeatures:[f1,f2...]}]
        var categoryField = options.categoryField;

        array.forEach(data, lang.hitch(this, function(item/*, index*/) {
          var num = item.count;
          var fieldValue = item.fieldValue;
          var text = this._getBestDisplayValue(categoryField, fieldValue);
          chartOptions.labels.push(text);
          chartOptions.series[0].data.push(num);
        }));

        return chartOptions;
      },

      //-----------------create field mode charts-------------------------
      _createFieldModeCharts: function(args, chartDivs){
        var charts = [];
        var paramsDijits = [];
        var config = args.config;

        var options = {
          layerDefinition: this.featureLayer,
          features: args.features,
          valueFields: config.valueFields,
          operation: config.operation
        };

        //data: {fieldName1:value1,fieldName2:value2}
        var data = clientStatisticsUtils.getFieldModeStatisticsInfo(options);

        array.forEach(config.types, lang.hitch(this, function(typeInfo, i){
          try {
            var chartDiv = chartDivs[i];
            var results = this._createJimuChart(chartDiv, 'field', options, data, typeInfo);
            charts.push(results[0]);
            paramsDijits.push(results[1]);
          } catch (e) {
            console.error(e);
          }
        }));

        return {
          charts: charts,
          paramsDijits: paramsDijits
        };
      },

      _getFieldModeChartOptionByStatisticsInfo: function(options, data, chartType){
        //data: {fieldName1:value1,fieldName2:value2}
        var chartOptions = {
          type: chartType,
          labels: [],
          series: [{
            name: this._legendNls || "Legend",
            type: chartType,
            data: []
          }]
        };

        //data: {fieldName1:value1,fieldName2:value2}
        var valueFields = options.valueFields;
        var valueAliases = this._getFieldAliasArray(valueFields);

        array.forEach(valueFields, lang.hitch(this, function(fieldName, index) {
          var aliasName = valueAliases[index];
          var num = data[fieldName];

          chartOptions.labels.push(aliasName);
          chartOptions.series[0].data.push(num);
        }));

        return chartOptions;
      }

    });
  });