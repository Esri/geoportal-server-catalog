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
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/SearchDistance.html',
  'dojo/Evented',
  'dojo/_base/lang',
  'jimu/utils',
  'jimu/dijit/CheckBox',
  'esri/tasks/GeometryService',
  'dijit/form/Select',
  'dijit/form/NumberTextBox'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, Evented, lang,
  jimuUtils, CheckBox, GeometryService) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    baseClass: 'jimu-dijit-searchdistance',
    templateString: template,
    lastMeters: 0,//meters

    //options:
    tip: '',
    distance: 0,
    unit: '',

    //methods:
    //isEnabled
    //reset
    //setDistance
    //setUnit
    //getData
    //getDistance
    //getUnit
    //getUnitToBuffer
    //getStatus

    //event:
    //change

    postMixInProperties:function(){
      this.inherited(arguments);
      this.nls = lang.clone(window.jimuNls.units);
      if(!this.tip){
        this.tip = window.jimuNls.searchDistance.applySearchDistance;
      }
    },

    postCreate: function(){
      this.inherited(arguments);
      this.cbx = new CheckBox({
        label: this.tip,
        onChange: lang.hitch(this, this._onCbxChanged)
      });
      this.cbx.placeAt(this.cbxDiv);
      this.reset();
      this.setDistance(this.distance);
      this.setUnit(this.unit);
      this.lastMeters = this.getMeters();
    },

    enable: function(){
      this.cbx.check();
    },

    disable: function(){
      this.cbx.uncheck();
    },

    isEnabled: function(){
      return this.cbx.getValue();
    },

    reset: function(){
      // this.cbx.uncheck();
      this.numberTextBox.set('value', 0);
      this.unitSelect.set('value', "MILES");
    },

    getData: function(){
      var data = {
        status: this.getStatus(),
        isEnabled: this.isEnabled(),
        distance: this.getDistance(),
        unit: this.getUnit(),
        bufferUnit: this.getUnitToBuffer(),
        meters: this.getMeters()
      };
      return data;
    },

    //-1 means SearchDistance is enabled with invalid distance number
    //0 means SearchDistance is not enabled or enabled with distance 0
    //1 means SearchDistance is enabled with valid distance number
    getStatus: function(){
      var status;
      if(this.isEnabled()){
        var distance = this.getDistance();
        if (distance > 0) {
          status = 1;
        } else if (distance === 0) {
          status = 0;
        } else {
          status = -1;
        }
      }else{
        status = 0;
      }
      return status;
    },

    //if status < 0, returned value = -1
    //if status == 0, returned value = 0
    //if status > 0, returned value > 0
    getMeters: function(){
      var meters = 0;
      var status = this.getStatus();
      if(status > 0){
        var distance = this.getDistance();
        var unit = this.getUnit();
        if(unit === 'MILES'){
          meters = distance * 1609.344;
        }else if(unit === 'KILOMETERS'){
          meters = distance * 1000;
        }else if(unit === 'FEET'){
          meters = distance * 0.3048;
        }else if(unit === 'METERS'){
          meters = distance;
        }else if(unit === 'YARDS'){
          meters = distance * 0.9144;
        }else if(unit === 'NAUTICAL_MILES'){
          meters = distance * 1852;
        }
        meters = parseFloat(meters.toFixed(3));
      }else if(status === 0){
        meters = 0;
      }else if(status < 0){
        meters = -1;
      }
      return meters;
    },

    setDistance: function(distance){
      if(typeof distance === 'number' && distance >= 0){
        this.numberTextBox.set('value', distance);
      }
    },

    setUnit: function(unit){
      if(unit && typeof unit === 'string'){
        this.unitSelect.set('value', unit);
      }
    },

    tryShowValidationError: function(){
      if(!this.numberTextBox.validate()){
        jimuUtils.showValidationErrorTipForFormDijit(this.numberTextBox);
      }
    },

    //always return a number
    //if return -1, means user input a invalid value
    getDistance: function(){
      if(!this.numberTextBox.validate()){
        jimuUtils.showValidationErrorTipForFormDijit(this.numberTextBox);
        return -1;
      }
      return this.numberTextBox.get('value');
    },

    getUnit: function(){
      return this.unitSelect.get('value');
    },

    getUnitToBuffer: function(){
      var bufferUnit = '';
      var unit = this.unitSelect.get('value');
      switch(unit){
        case 'MILES':
          bufferUnit = GeometryService.UNIT_STATUTE_MILE;
          break;
        case 'KILOMETERS':
          bufferUnit = GeometryService.UNIT_KILOMETER;
          break;
        case 'FEET':
          bufferUnit = GeometryService.UNIT_FOOT;
          break;
        case 'METERS':
          bufferUnit = GeometryService.UNIT_METER;
          break;
        case 'YARDS':
          bufferUnit = GeometryService.UNIT_INTERNATIONAL_YARD;
          break;
        case 'NAUTICAL_MILES':
          bufferUnit = GeometryService.UNIT_NAUTICAL_MILE;
          break;
        default:
          break;
      }
      return bufferUnit;
    },

    _onCbxChanged: function(){
      if(this.cbx.getValue()){
        this.numberTextBox.set('disabled', false);
        this.unitSelect.set('disabled', false);
      }else{
        this.numberTextBox.set('disabled', true);
        this.unitSelect.set('disabled', true);
      }
      this._emitEvent();
    },

    _onNumberTextBoxChanged: function(){
      this._emitEvent();
    },

    _onUnitSelectChanged: function(){
      this._emitEvent();
    },

    _emitEvent: function(){
      var data = this.getData();
      if(data.meters !== this.lastMeters){
        this.lastMeters = data.meters;
        this.emit("change", data);
      }
    }

  });
});