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
define(
  ['dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/_base/array',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidgetSetting',
    'jimu/dijit/CheckBox',
    'dojo/text!./Edit.html',
    "jimu/SpatialReference/srUtils",
    'dijit/form/ValidationTextBox',
    'dijit/form/Select'
  ],
  function(
    declare,
    lang,
    html,
    array,
    _WidgetsInTemplateMixin,
    BaseWidgetSetting,
    CheckBox,
    template,
    utils
  ) {
    var options = [{
      "value": "",
      "label": "Default",
      "selected": true,
      "disabled": false
    }, {
      "value": "",
      "label": "",
      "selected": true,
      "disabled": false
    }, {
      "value": "INCHES",
      "label": "Inches",
      "selected": false,
      "disabled": false
    }, {
      "value": "FOOT",
      "label": "Foot",
      "selected": false,
      "disabled": false
    }, {
      "value": "YARDS",
      "label": "Yards",
      "selected": false,
      "disabled": false
    }, {
      "value": "MILES",
      "label": "Miles",
      "selected": false,
      "disabled": false
    }, {
      "value": "NAUTICAL_MILES",
      "label": "Nautical_Miles",
      "selected": false,
      "disabled": false
    }, {
      "value": "MILLIMETERS",
      "label": "Millimeters",
      "selected": false,
      "disabled": false
    }, {
      "value": "CENTIMETERS",
      "label": "Centimeters",
      "selected": false,
      "disabled": false
    }, {
      "value": "METER",
      "label": "Meter",
      "selected": false,
      "disabled": false
    }, {
      "value": "KILOMETERS",
      "label": "Kilometers",
      "selected": false,
      "disabled": false
    }, {
      "value": "DECIMETERS",
      "label": "Decimeters",
      "selected": false,
      "disabled": false
    }, {
      "value": "",
      "label": "",
      "selected": true,
      "disabled": false
    }, {
      "value": "DECIMAL_DEGREES",
      "label": "Decimal_Degrees",
      "selected": false,
      "disabled": false
    }, {
      "value": "DEGREES_DECIMAL_MINUTES",
      "label": "Degrees_Decimal_Minutes",
      "selected": false,
      "disabled": false
    }, {
      "value": "DEGREE_MINUTE_SECONDS",
      "label": "Degree_Minutes_Seconds",
      "selected": false,
      "disabled": false
    }, {
      "value": "",
      "label": "",
      "selected": true,
      "disabled": false
    }, {
      "value": "MGRS",
      "label": "MGRS",
      "selected": false,
      "disabled": false
    }, {
      "value": "USNG",
      "label": "USNG",
      "selected": false,
      "disabled": false
    }];

    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      baseClass: "jimu-coordinate-edit",
      templateString: template,
      currentWkid: null,
      version: null,
      enhanceVersion: 10.1, // support transform wkid
      _config: null,

      postCreate: function() {
        this.inherited(arguments);

        this.transformForward = new CheckBox({
          label: this.nls.forward,
          checked: false
        }, this.transformForward);

        if (this.version < this.enhanceVersion) {
          html.setStyle(this.olderVersionDiv, "display", "block");
          html.setStyle(this.enhanceVersionDiv, "display", "none");
        } else {
          html.setStyle(this.olderVersionDiv, "display", "none");
          html.setStyle(this.enhanceVersionDiv, "display", "block");
        }

        html.setStyle(this.transformDiv, "display", "none");
        html.setStyle(this.transformForward.domNode, "display", "none");

        this.wkid.set('missingMessage', this.nls.warning);
        this.transformationWkid.set('missingMessage', this.nls.tfWarning);
      },

      setConfig: function(config) {
        this._config = lang.clone(config);

        utils.loadResource().then(lang.hitch(this, function() {
          if (config.wkid) {
            this.wkid.set('value', parseInt(config.wkid, 10));
            this.currentWkid = parseInt(config.wkid, 10);

            this._adjustUnitOption();
          }
          if (config.label) {
            this.wkidLabel.innerHTML = config.label;
          }
          if (config.outputUnit) {
            this.outputUnit.set('value', config.outputUnit);
          }
          if (config.transformationWkid) {
            this.transformationWkid.set('value', parseInt(config.transformationWkid, 10));
          }
          if (config.transformationLabel) {
            this.transformationLabel.innerHTML = config.transformationLabel;
          }
          if (config.transformForward) {
            this.transformForward.setValue(config.transformForward);
          }
        }), lang.hitch(this, function(err) {
          console.error(err);
        }));
      },

      getConfig: function() {
        var cs = {
          wkid: utils.standardizeWkid(this.wkid.get('value')),
          label: this.wkidLabel.innerHTML,
          outputUnit: this.outputUnit.get('value'),
          transformationWkid: parseInt(this.transformationWkid.get('value'), 10),
          transformationLabel: this.transformationLabel.innerHTML,
          transformForward: this.transformForward.getValue()
        };
        cs.outputUnit = cs.outputUnit || utils.getCSUnit(cs.wkid);
        var _options = {
          sameSRWithMap: utils.isSameSR(cs.wkid, this.map.spatialReference.wkid),
          isGeographicCS: utils.isGeographicCS(cs.wkid),
          isGeographicUnit: utils.isGeographicUnit(cs.outputUnit),
          isProjectedCS: utils.isProjectedCS(cs.wkid),
          isProjectUnit: utils.isProjectUnit(cs.outputUnit),
          spheroidCS: utils.isProjectedCS(cs.wkid) ? utils.getGeoCSByProj(cs.wkid) : cs.wkid,
          defaultUnit: utils.getCSUnit(cs.wkid),
          unitRate: utils.getUnitRate(utils.getCSUnit(cs.wkid), cs.outputUnit)
        };

        //for hack DEGREES_DECIMAL_MINUTES
        if(cs.outputUnit === "DEGREES_DECIMAL_MINUTES"){
          _options.isGeographicUnit = true;
          _options.unitRate = 1;
        }

        if (_options.isGeographicUnit && _options.isProjectedCS) { // use spheroidCS unit
          _options.unitRate = 1;
        }
        cs.options = _options;
        // console.log(cs);
        return cs;
      },

      _removeGeoUnits: function() {
        array.forEach(utils.getGeographicUnits(), lang.hitch(this, function(unit) {
          this.outputUnit.removeOption(unit);
        }));
        this.outputUnit.removeOption("DEGREES_DECIMAL_MINUTES");//for hack DEGREES_DECIMAL_MINUTES
      },

      _removeProjUnits: function() {
        array.forEach(utils.getProjectUnits(), lang.hitch(this, function(unit) {
          this.outputUnit.removeOption(unit);
        }));
      },

      _removeAllUnits: function() {
        for (var i = 0, len = options.length; i < len; i++) {
          this.outputUnit.removeOption(options[i].value);
        }
      },

      _addAllUnits: function() {
        for (var i = 0, len = options.length; i < len; i++) {
          // options[i].label = this.nls[options[i].label];
          var _option = lang.clone(options[i]);
          _option.label = this.nls[options[i].label];
          this.outputUnit.addOption(_option);
        }
      },

      _adjustUnitOption: function() { // display unit by cs
        if (this.currentWkid === this.map.spatialReference.wkid) { // realtime
          var isSpecialCS = utils.isWebMercator(this.currentWkid);
          if (isSpecialCS) {
            return;
          } else if (this.currentWkid === 4326) {
            this._removeProjUnits();
          } else if (utils.isGeographicCS(this.currentWkid)) {
            this._removeProjUnits();
          } else if (utils.isProjectedCS(this.currentWkid)) {
            this._removeGeoUnits();
            this.outputUnit.removeOption("USNG");
            this.outputUnit.removeOption("MGRS");
          }
        } else if (utils.isGeographicCS(this.currentWkid)) {
          this._removeProjUnits();
        }

        if (this._config.outputUnit) {
          this.outputUnit.set('value', this._config.outputUnit);
        }
      },

      _isDefaultSR: function() {
        var wkid = this.wkid.get('value'),
          defaultWkid = this.map.spatialReference.wkid;
        return utils.isSameSR(wkid, defaultWkid);
      },

      onWkidChange: function(newValue) {
        var label = "",
          newWkid = parseInt(newValue, 10);

        this.popup.disableButton(0);

        if (utils.isValidWkid(newWkid)) {
          label = utils.getSRLabel(newWkid);
          this.wkidLabel.innerHTML = label;

          // same spheroid doesn't need transformation
          if (utils.isSameSpheroid(newWkid, this.map.spatialReference.wkid)) {
            this.transformationWkid.set('value', "");
            html.setStyle(this.transformDiv, 'display', 'none');
          } else {
            html.setStyle(this.transformDiv, 'display', 'block');
          }
          // this.wkid.set('value', newWkid);

          this.popup.enableButton(0);
        } else if (newValue) {
          this.wkid.set('value', "");
          this.wkidLabel.innerHTML = this.nls.cName;
        }
        if (this.currentWkid !== newWkid) {
          this.transformationWkid.set('value', "");
        }
        this.currentWkid = newWkid;

        this._removeAllUnits();
        this._addAllUnits();
        this._adjustUnitOption();
        this.outputUnit.closeDropDown();
      },

      ontfWkidChange: function(newValue) {
        if (newValue) {
          var tfid = "",
            label = "",
            newtfWkid = parseInt(newValue, 10);
          if (utils.isValidTfWkid(newtfWkid)) {
            tfid = newtfWkid;
            label = utils.getTransformationLabel(newtfWkid);
            this.transformationLabel.innerHTML = label;

            html.setStyle(this.transformForward.domNode, "display", "block");
          } else {
            this.transformationLabel.innerHTML = this.nls.tName;
            html.setStyle(this.transformForward.domNode, "display", "none");
          }
          this.transformationWkid.set('value', tfid);
        } else {
          this.transformationLabel.innerHTML = this.nls.tName;
          html.setStyle(this.transformForward.domNode, "display", "none");
        }
      }
    });
  });