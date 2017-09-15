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
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/html',
    'dojo/_base/query',
    'dojo/_base/Color',
    'dojo/on',
    'dojo/Evented',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./templates/_StatisticsChartSettings.html',
    'dijit/ColorPalette',
    'jimu/utils'
  ],
  function(declare, lang, array, html, query, Color, on, Evented, _WidgetBase, _TemplatedMixin,
    _WidgetsInTemplateMixin, template, ColorPalette, jimuUtils) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'jimu-dijit-statistics-chart-settings',
      templateString: template,
      colors:{
        c1:['#5d9cd3', '#eb7b3a', '#a5a5a5', '#febf29', '#4673c2', '#72ad4c'],
        c2:['#5d9cd3', '#a5a5a5', '#4673c2', '#285f8f', '#636363', '#274577'],
        c3:['#eb7b3a', '#febf29', '#72ad4c', '#9c4618', '#987214', '44682e'],
        c4:['#72ad4c', '#4673c2', '#febf29', '#44682e', '#274577', '#987214'],
        g1:['#43729b', '#c4d5ea'],
        g2:['#ac5928', '#f5ccbf'],
        g3:['#787878', '#d8d8d8'],
        g4:['#bb8b1b', '#fee1be'],
        g5:['#30538d', '#c0c9e3'],
        g6:['#517e36', '#c9dbc2'],
        g7:['#c4d5ea', '#43729b'],
        g8:['#f5ccbf', '#ac5928'],
        g9:['#d8d8d8', '#787878'],
        g10:['#fee1be', '#bb8b1b'],
        g11:['#c0c9e3', '#30538d'],
        g12:['#c9dbc2', '#517e36']
      },
      palette: null,
      defaultSingleColor: '#5d9cd3',
      multiColorValue: 'c1',
      imagesUrl: window.require.toUrl("jimu/css/images/chart/"),

      //options:
      isInWidget: false,
      type: '',//'bar','column','line','pie'
      singleColor: false,
      //{colors,showHorizontalAxis,showVerticalAxis,showDataLabel}
      config: null,//Object in Widget, null in setting page

      postMixInProperties:function(){
        this.nls = window.jimuNls.statisticsChart;
      },

      postCreate: function(){
        this.inherited(arguments);
        this._initSelf();
        //only bind events in Widget and bind events at last of postCreate
        if(this.isInWidget){
          this._bindEvents();
        }

        this.own(on(this.multiColorSection, 'click', lang.hitch(this, function(event) {
          var target = event.target || event.srcElement;
          if (html.hasClass(target, 'multi-color') && !html.hasClass(target, 'selected')) {
            var originalMultiColor = this.multiColorValue;
            this._selectMultiColorDiv(target);
            var newMultiColor = target.colorValue;
            if(originalMultiColor !== newMultiColor){
              if(this.isInWidget){
                this._configChange();
              }
            }
          }
        })));
      },

      _initSelf: function(){
        this.config = lang.clone(this.config);
        jimuUtils.combineRadioCheckBoxWithLabel(this.cbxAxisX, this.labelAxisX);
        jimuUtils.combineRadioCheckBoxWithLabel(this.cbxAxisY, this.labelAxisY);
        jimuUtils.combineRadioCheckBoxWithLabel(this.cbxPieLabel, this.labelPie);

        //init single color section
        this._setSingleColorForColorDiv(this.defaultSingleColor);
        this.palette = new ColorPalette({
          palette: "7x10",
          cellClass: "cursor:pointer",
          style: {width: '220px'},
          onChange: lang.hitch(this, function(newValue){
            var oldValue = this._getSingleColorFromColorDiv();
            this._setSingleColorForColorDiv(newValue);
            if(this.isInWidget){
              if(oldValue !== newValue){
                this._configChange();
              }
            }
          })
        });
        this.palette.placeAt(this.paletteContainer);
        this.palette.startup();

        //init multi color section
        var colorfulValues = ['c1', 'c2', 'c3', 'c4'];
        array.forEach(colorfulValues, lang.hitch(this, function(colorValue){
          var dom = html.create('div', {
            'class': 'multi-color colorful ' + colorValue
          }, this.colorfulContainer);
          dom.colorValue = colorValue;
        }));
        var monochromaticValues = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12'];
        array.forEach(monochromaticValues, lang.hitch(this, function(colorValue){
          var dom = html.create('div', {
            'class': 'multi-color monochromatic ' + colorValue
          }, this.monochromaticContainer);
          dom.colorValue = colorValue;
        }));
        this._setMultiColorValue('c1');

        if(this.type === 'pie'){
          this.singleColor = false;
          html.setStyle(this.divAxisX, 'display', 'none');
          html.setStyle(this.divAxisY, 'display', 'none');
        }else{
          html.setStyle(this.divPieLabel, 'display', 'none');
        }

        this.reset();

        if(this.config){
          //Setting page does not pass config parameter. Widget does.
          this.setConfig(this.config);
        }
      },

      _bindEvents: function(){
        if(this.type === 'pie'){
          this.own(on(this.cbxPieLabel, 'change', lang.hitch(this, this._configChange)));
        }
        else{
          this.own(on(this.cbxAxisX, 'change', lang.hitch(this, this._configChange)));
          this.own(on(this.cbxAxisY, 'change', lang.hitch(this, this._configChange)));
        }
      },

      setConfig: function(config){
        //reset singleColor by config
        this.reset();
        this.cbxAxisX.checked = config.showHorizontalAxis === false ? false : true;
        this.cbxAxisY.checked = config.showVerticalAxis === false ? false : true;
        this.cbxPieLabel.checked = config.showDataLabel === false ? false : true;
        var colors = lang.clone(config.colors || []);
        this.singleColor = colors.length === 1 && this.type !== 'pie';

        if(this.singleColor){
          this.showSingleColor(colors[0]);
        } else{
          this.showMultiColor(colors);
        }
      },

      getConfig: function(){
        var config = {
          colors: []
        };

        if(this.type === 'pie'){
          config.colors = this.colors[this._getMultiColorValue()];
          if(config.colors.length === 2){
            config.colors = this._createHexColors(config.colors[0], config.colors[1], 6);
          }
          config.showDataLabel = this.cbxPieLabel.checked;
        }else{
          config.showHorizontalAxis = this.cbxAxisX.checked;
          config.showVerticalAxis = this.cbxAxisY.checked;
          if(this.singleColor){
            config.colors = [this._getSingleColorFromColorDiv()];
          }else{
            config.colors = this.colors[this._getMultiColorValue()];
          }
        }

        return config;
      },

      _setSingleColorForColorDiv: function(hex){
        html.setStyle(this.colorDiv, 'backgroundColor', hex);
        this.colorDiv.bgHex = hex;
      },

      _getSingleColorFromColorDiv: function(){
        return this.colorDiv.bgHex;
      },

      _setMultiColorValue: function(colorValue){
        var selector = '.' + colorValue;
        var divs = query(selector, this.multiColorSection);
        if(divs && divs.length > 0){
          var multiColorDiv = divs[0];
          this._selectMultiColorDiv(multiColorDiv);
        }
      },

      _selectMultiColorDiv: function(multiColorDiv){
        query('.multi-color', this.multiColorSection).removeClass('selected');
        html.addClass(multiColorDiv, 'selected');
        this.multiColorValue = multiColorDiv.colorValue;
      },

      _getMultiColorValue: function(){
        return this.multiColorValue;
      },

      reset: function(){
        if(this.type === 'pie'){
          this.cbxPieLabel.checked = true;
        }
        else{
          this.cbxAxisX.checked = true;
          this.cbxAxisY.checked = true;
        }

        if(this.singleColor){
          this.showSingleColor();
        }
        else{
          this.showMultiColor();
        }
      },

      showSingleColor: function(/*optional*/ strColor){
        if(this.type === 'pie'){
          this.singleColor = false;
          return;
        }
        this.singleColor = true;
        html.setStyle(this.singleColorSection, 'display', 'block');
        html.setStyle(this.multiColorSection, 'display', 'none');
        if(strColor){
          this._setSingleColorForColorDiv(strColor);
        }
      },

      showMultiColor: function(/*optional*/ colors){
        /*jshint -W083 */
        this.singleColor = false;
        html.setStyle(this.singleColorSection, 'display', 'none');
        html.setStyle(this.multiColorSection, 'display', 'block');

        if(colors && colors.length > 0){
          var colorValues = null;
          var isSame = false;
          for(var colorName in this.colors){
            colorValues = this.colors[colorName];
            isSame = false;
            if(colorValues.length === colors.length){
              isSame = array.every(colorValues, lang.hitch(this, function(colorValue, i){
                var c1 = new Color(colorValue);
                var c2 = new Color(colors[i]);
                return c1.toHex().toLowerCase() === c2.toHex().toLowerCase();
              }));
              if(isSame){
                this._setMultiColorValue(colorName);
                break;
              }
            }
          }
        }
      },

      showShelter: function(){
        html.setStyle(this.shelter, 'display', 'block');
      },

      hideShelter: function(){
        html.setStyle(this.shelter, 'display', 'none');
      },

      _configChange: function(){
        var newConfig = this.getConfig();
        this.emit('change', newConfig);
      },

      _createHexColors: function(fromHex, toHex, count){
        var hexColors = [];
        var color1 = Color.fromHex(fromHex);
        var color2 = Color.fromHex(toHex);
        var deltaRed = (color2.r - color1.r) / (count - 1);
        var deltaGreen = (color2.g - color1.g) / (count - 1);
        var deltaBlue = (color2.b - color1.b) / (count - 1);
        var c = null;
        for(var i = 0; i < count; i++){
          c = new Color();
          c.r = Math.floor(color1.r + deltaRed * i);
          c.g = Math.floor(color1.g + deltaGreen * i);
          c.b = Math.floor(color1.b + deltaBlue * i);
          hexColors.push(c.toHex());
        }
        return hexColors;
      }
    });
  });