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
    'dojo/_base/html',
    'dojo/on',
    'dojo/aspect',
    'dojo/query',
    'dojo/keys',
    'dojo/json',
    'esri/request',
    'jimu/BaseWidgetSetting',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/dijit/SimpleTable',
    'jimu/dijit/Message',
    'jimu/dijit/Popup',
    'jimu/dijit/CheckBox',
    'jimu/dijit/LoadingShelter',
    'jimu/portalUtils',
    './Edit',
    "jimu/SpatialReference/srUtils",
    'jimu/dijit/RadioBtn',
    'dojo/NodeList-dom',
    'dijit/form/NumberSpinner',
    'dijit/form/NumberTextBox'
  ],
  function(
    declare,
    lang,
    html,
    on,
    aspect,
    query,
    keys,
    dojoJSON,
    request,
    BaseWidgetSetting,
    _WidgetsInTemplateMixin,
    Table,
    Message,
    Popup,
    CheckBox,
    LoadingShelter,
    portalUtils,
    Edit,
    utils) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      /*global esriConfig*/
      baseClass: 'jimu-widget-coordinate-setting',
      edit: null,
      popup: null,
      popupState: "", // ADD or EDIT
      editTr: null,
      gsVersion: 0,

      postCreate: function() {
        this.inherited(arguments);

        this.separator = new CheckBox({
          label: this.nls.separator,
          checked: false
        }, this.separator);

        this.shelter1 = new LoadingShelter({
          hidden: true
        });
        this.shelter1.placeAt(this.domNode);
        this.shelter1.startup();

        this.shelter2 = new LoadingShelter({
          hidden: true
        });
        this.shelter2.placeAt(this.domNode);
        this.shelter2.startup();
      },

      startup: function() {
        this.inherited(arguments);

        var fields = [{
          name: 'id',
          title: this.nls.id,
          type: 'text',
          unique: true,
          hidden: true,
          editable: false
        }, {
          name: 'wkid',
          title: this.nls.wkid,
          type: 'text',
          'class': "wkid",
          hidden: true,
          editable: false
        }, {
          name: 'label',
          title: this.nls.label,
          type: 'text',
          editable: false
        }, {
          name: 'outputUnit',
          title: this.nls.output,
          type: 'text',
          hidden: true,
          editable: false
        }, {
          name: 'transformationWkid',
          title: this.nls.transformationWkid,
          type: 'text',
          'class': 'transformationWkid',
          editable: false,
          hidden: true
        }, {
          name: 'transformationLabel',
          title: this.nls.transformationLabel,
          type: 'text',
          editable: false,
          hidden: true
        }, {
          name: 'transformForward',
          title: this.nls.transformForward,
          type: 'checkbox',
          editable: false,
          hidden: true
        }, {
          name: 'options',
          title: 'options',
          type: 'text',
          editable: false,
          hidden: true
        }, {
          name: 'actions',
          title: this.nls.actions,
          type: 'actions',
          'class': "actions",
          actions: ['edit', 'up', 'down', 'delete']
        }];
        var args = {
          autoHeight: false,
          fields: fields,
          selectable: false
        };
        this.outputCoordinateTable = new Table(args);
        html.setStyle(this.outputCoordinateTable.domNode, 'height', '100%');
        this.outputCoordinateTable.placeAt(this.tableCoordinate);
        this.outputCoordinateTable.startup();

        this.own(on(this.outputCoordinateTable, 'actions-edit', lang.hitch(this, 'onEditClick')));
        this.setConfig(this.config);

        this._initOrderLonLatRadioBtns();

        this._getGeometryServiceVersion();
      },

      setConfig: function(config) {
        this.config = config;
        this.outputCoordinateTable.clear();

        this.shelter1.show();
        utils.loadResource().then(lang.hitch(this, function() {
          if (config.spatialReferences && config.spatialReferences.length) {
            var json = [];
            var len = config.spatialReferences.length;
            for (var i = 0; i < len; i++) {
              var wkid = parseInt(config.spatialReferences[i].wkid, 10);
              json.push({
                id: i,
                wkid: utils.standardizeWkid(wkid),
                label: config.spatialReferences[i].label,
                outputUnit: config.spatialReferences[i].outputUnit,
                transformationWkid: config.spatialReferences[i].transformationWkid,
                transformationLabel: config.spatialReferences[i].transformationLabel,
                transformForward: config.spatialReferences[i].transformForward,
                options: dojoJSON.stringify(config.spatialReferences[i].options)
              });
            }
            this.outputCoordinateTable.addRows(json);
          } else {
            this._addMapCoordinate();
          }
        }), lang.hitch(this, function(err) {
          console.error(err);
        })).always(lang.hitch(this, function() {
          this.shelter1.hide();
        }));

        if (isFinite(parseInt(config.decimalPlaces, 10))) {
          this.spinner.set('value', parseInt(config.decimalPlaces, 10));
        }
        if (config.addSeparator) {
          this.separator.setValue(config.addSeparator);
        }
      },

      _getGeometryServiceVersion: function() {
        this.shelter2.show();
        if (esriConfig.defaults.geometryService && esriConfig.defaults.geometryService.url) {
          var gsUrl = esriConfig.defaults.geometryService.url;
          var services = gsUrl.slice(0, gsUrl.indexOf('/Geometry/'));
          request({
            url: services,
            handleAs: 'json',
            callbackParamName: "callback",
            content: {
              f: 'json'
            }
          }).then(lang.hitch(this, function(response) {
            console.log(response);
            if (response && response.currentVersion) {
              this.gsVersion = parseFloat(response.currentVersion);
            }
          }), lang.hitch(this, function(err) {
            console.error(err);
          })).always(lang.hitch(this, function() {
            this.shelter2.hide();
          }));
        } else {
          this.shelter2.hide();
          new Message({
            message: this.nls.getVersionError
          });
        }
      },

      _addMapCoordinate: function() {
        var mapWkid = this.map.spatialReference.wkid;
        portalUtils.getUnits(this.appConfig.portalUrl).then(lang.hitch(this, function(units) {
          if (utils.isValidWkid(mapWkid)) {
            var item = {
              wkid: utils.standardizeWkid(mapWkid),
              label: utils.getSRLabel(parseInt(mapWkid, 10))
            };

            if (utils.isProjectedCS(item.wkid)) {
              item.outputUnit = units === "english" ? "FOOT" : "METER";
            } else {
              item.outputUnit = item.outputUnit || utils.getCSUnit(item.wkid);
            }

            var _options = {
              sameSRWithMap: utils.isSameSR(item.wkid, this.map.spatialReference.wkid),
              isGeographicCS: utils.isGeographicCS(item.wkid),
              isGeographicUnit: utils.isGeographicUnit(item.outputUnit),
              isProjectedCS: utils.isProjectedCS(item.wkid),
              isProjectUnit: utils.isProjectUnit(item.outputUnit),
              spheroidCS: utils.isProjectedCS(item.wkid) ?
                utils.getGeoCSByProj(item.wkid) : item.wkid,
              defaultUnit: utils.getCSUnit(item.wkid),
              unitRate: utils.getUnitRate(utils.getCSUnit(item.wkid), item.outputUnit)
            };

            //default show mercator is degrees.
            if (this.map.spatialReference.isWebMercator()){
              _options.isGeographicUnit = true;
              _options.isProjectUnit = false;
              _options.unitRate = 1;
              item.outputUnit = "DECIMAL_DEGREES";
            }

            //for hack DEGREES_DECIMAL_MINUTES
            if(item.outputUnit === "DEGREES_DECIMAL_MINUTES"){
              _options.isGeographicUnit = true;
              _options.unitRate = 1;
            }

            item.options = dojoJSON.stringify(_options);
            this.outputCoordinateTable.addRow(item);
          }
        }));
      },

      _keepDefaultOnlyEdit: function() {
        var pSelector = "." + this.baseClass + " .body-section tr[rowid=row1]",
          row = query(pSelector)[0];

        query('.action-item', row).style('display', 'none');
        query('.row-edit-div', row).style('display', 'block');

        aspect.after(this.outputCoordinateTable, 'onBeforeRowUp', lang.hitch(this, function(tr) {
          if (query(".body-section .simple-table-row")[1] === tr) {
            return false;
          }
        }), true);
      },

      onAddClick: function() {
        this.popupState = "ADD";
        this._openEdit(this.nls.add, {});
      },

      onEditClick: function(tr) {
        var cs = this.outputCoordinateTable.getRowData(tr);
        this.popupState = "EDIT";
        this.editTr = tr;
        this._openEdit(this.nls.edit, cs);
      },

      _openEdit: function(title, config) {
        this.edit = new Edit({
          version: this.gsVersion,
          map: this.map,
          nls: this.nls
        });
        // this.edit.setConfig(config || {});
        this.popup = new Popup({
          titleLabel: title,
          autoHeight: true,
          content: this.edit,
          container: 'main-page',
          width: 640,
          buttons: [{
            label: this.nls.ok,
            key: keys.ENTER,
            disable: true,
            onClick: lang.hitch(this, '_onEditOk')
          }, {
            label: this.nls.cancel,
            classNames: ['jimu-btn-vacation'],
            key: keys.ESCAPE
          }],
          onClose: lang.hitch(this, '_onEditClose')
        });
        this.edit.setConfig(config || {});
        html.addClass(this.popup.domNode, 'widget-setting-popup');
        this.edit.startup();
      },

      _onEditOk: function() {
        var json = this.edit.getConfig(),
          editResult = null;

        json.wkid = utils.standardizeWkid(json.wkid);
        json.options = dojoJSON.stringify(json.options);

        if (this.popupState === "ADD") {
          editResult = this.outputCoordinateTable.addRow(json);
        } else if (this.popupState === "EDIT") {
          editResult = this.outputCoordinateTable.editRow(this.editTr, json);
        }

        if (editResult.success) {
          this.popup.close();
          this.popupState = "";
          this.editTr = null;
        } else {
          // var repeatTitles = array.map(
          //   editResult.repeatFields,
          //   lang.hitch(this, function(field) {
          //     return field && field.title;
          //   }));
          new Message({
            message: json.wkid + this.nls[editResult.errorCode]
          });
        }
      },

      _onEditClose: function() {
        this.edit = null;
        this.popup = null;
      },

      getConfig: function() {
        var data = this.outputCoordinateTable.getData();
        var json = [];
        var len = data.length;
        for (var i = 0; i < len; i++) {
          delete data[i].id;
          data[i].options = dojoJSON.parse(data[i].options);
          json.push(data[i]);
        }
        this.config.spatialReferences = json;

        this.config.decimalPlaces = this.spinner.get('value');
        this.config.addSeparator = this.separator.getValue();

        return this.config;
      },
      _initOrderLonLatRadioBtns: function() {
        this.own(on(this.lonLat, 'click', lang.hitch(this, function() {
          this.config.displayOrderLonLat = true;
        })));
        this.own(on(this.latLon, 'click', lang.hitch(this, function() {
          this.config.displayOrderLonLat = false;
        })));
        if (this.config.displayOrderLonLat) {
          this._selectRadioBtnItem("lonLat");
          this.config.displayOrderLonLat = true;
        } else {
          this._selectRadioBtnItem("latLon");
          this.config.displayOrderLonLat = false;
        }
      },
      _selectRadioBtnItem: function(name) {
        var _radio = this[name];
        if (_radio && _radio.check) {
          _radio.check(true);
        }
      }
    });
  });