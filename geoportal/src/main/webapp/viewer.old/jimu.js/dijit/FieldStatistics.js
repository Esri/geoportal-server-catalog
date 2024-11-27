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

define(['dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/on',
  'dojo/query',
  'dojo/NodeList-manipulate',
  'dojo/when',
  'dijit/form/Select',
  "esri/lang",
  'jimu/dijit/Popup',
  'jimu/dijit/LoadingIndicator',
  'jimu/utils',
  'jimu/statisticsUtils'
], function(declare, _WidgetBase, lang, html, array, on, query, nlm, when, Select,
  esriLang, Popup, LoadingIndicator, jimuUtils, statUtils) {
  /*jshint unused: false*/
  return declare([_WidgetBase], {

    /**
     * the statistics info
     * {
     *  layer:
     *  filterExpression:
     *  geometry:
     *  featureSet:
     *  fieldNames:
     *  statisticTypes:
     * }
     */
    statInfo: null,

    postMixInProperties: function() {
      this.nls = window.jimuNls.fieldStatistics;
      lang.mixin(this.nls, window.jimuNls.common);
    },

    showContent: function(statInfo){
      this.statInfo = statInfo;
      if(this.statInfo.fieldNames.length === 0){
        return;
      }
      var dom = html.create('div', {
        className: 'stat-container'
      }, this.domNode);
      this._createFieldDom(dom);

      if(this.statInfo.fieldNames.length === 1){
        this.statInfo.fieldName = this.statInfo.fieldNames[0];
        this._showOneFieldStatContent(this.statInfo, dom);
      }
    },

    showContentAsPopup: function(statInfo){
      this.statInfo = statInfo;
      if (this._statisticsPopup && this._statisticsPopup.domNode) {
        this._statisticsPopup.close();
      }
      this._statisticsPopup = null;

      this._statisticsPopup = new Popup({
        titleLabel: this.nls.statistics,
        content: this.domNode,
        width: 270,
        height: 265,
        buttons: [{
          label: this.nls.ok
        }]
      });
      this.showContent(statInfo);
      // this class come from api.
      // html.addClass(this._statisticsPopup.domNode, "esri-feature-table-dialog");
    },

    _showOneFieldStatContent: function(statInfo, container){
      var loading;
      if(statUtils.isStatFromServer(this.statInfo)){
        loading = new LoadingIndicator();
        loading.placeAt(container);
        loading.show();
      }
      statUtils.getStatisticsResult(this.statInfo).then(lang.hitch(this, function(attributes) {
        if(loading){
          loading.destroy();
        }
        query('.esriAGOTableStatistics', container).remove();
        var statContent = this._createStatContent(attributes);
        html.place(statContent, container);
      }));
    },

    _getFieldAliaseFromStatInfo: function(fieldName) {
      var featureSet = this.statInfo.featureSet;
      var fieldAliases = featureSet && featureSet.fieldAliases;
      var alias;
      if (fieldAliases && typeof fieldAliases[fieldName] !== 'undefined') {
        alias = fieldAliases[fieldName];
      } else {
        if (this.statInfo.layer) {
          var flabels = array.filter(this.statInfo.layer.fields, function(f) {
            return f.name === fieldName;
          });
          alias = flabels[0] ? flabels[0].alias : '';
        } else {
          alias = fieldName;
        }
      }
      return alias;
    },

    _createFieldDom: function(container){
      var fieldDom;
      if(this.statInfo.fieldNames.length > 1){
        fieldDom = html.create("div", {
          className: "header"
        }, container);
        html.create('span', {
          innerHTML: this.nls.field + ': '
        }, fieldDom);
        var fieldSelect = new Select({
          options: this.statInfo.fieldNames.map(lang.hitch(this, function(fieldName){
            return {
              value: fieldName,
              label: this._getFieldAliaseFromStatInfo(fieldName)
            };
          })),
          style: {
            width: '150px'
          }
        });
        this.own(on(fieldSelect, 'change', lang.hitch(this, function(fieldName){
          this.statInfo.fieldName = fieldName;
          this._showOneFieldStatContent(this.statInfo, container);
        })));
        fieldSelect.placeAt(fieldDom);

        //show the first one
        this.statInfo.fieldName = this.statInfo.fieldNames[0];
        this._showOneFieldStatContent(this.statInfo, container);
      }else{
        fieldDom = html.create("div", {
          className: "header",
          innerHTML: '<span>' + this.nls.field + "</span>: " +
            this._getFieldAliaseFromStatInfo(this.statInfo.fieldNames[0])
        }, container);
      }
      return fieldDom;
    },

    _createStatContent: function(attributes){
      var lowerCase = {},
        definitionTitles = ["count", "sum", "min", "max", "ave", "stddev"],
        wrapper, table, tbody, tr,
        avg, count, max, min, stddev, sum,
        key;
      wrapper = html.create("div", {
        className: "esriAGOTableStatistics",
        innerHTML: ""
      });

      // Create a Horizontal break line
      html.create("div", {
        className: "hzLine",
        innerHTML: ""
      }, wrapper);

      // Create the Table Node
      table = html.create("table", {
        className: "attrTable",
        innerHTML: "",
        style: {
          cellpadding: 0,
          cellspacing: 0
        }
      }, wrapper);

      for (key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          lowerCase[key.toLowerCase()] = attributes[key];
        }
      }

      count = lowerCase.countfield;
      sum = lowerCase.sumfield || '';
      min = lowerCase.minfield || '';
      max = lowerCase.maxfield || '';
      avg = lowerCase.avgfield || '';
      stddev = lowerCase.stddevfield || '';

      tbody = html.create("tbody", {}, table);
      var stats = [count, sum, min, max, avg, stddev];
      var that = this;
      array.forEach(stats, function(s, i) {
        if (s === "") {
          return;
        }
        tr = html.create("tr", {
          valign: "top"
        }, tbody);
        html.create("td", {
          "class": "attrName",
          innerHTML: that.nls[definitionTitles[i]]
        }, tr);
        html.create("td", {
          "class": "attrValue",
          innerHTML: s
        }, tr);
      });

      // Padding for Close Button
      html.create("div", {
        className: "break",
        innerHTML: ""
      }, wrapper);

      return wrapper;
    }
  });
});