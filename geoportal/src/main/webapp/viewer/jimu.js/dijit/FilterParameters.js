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
  'dojo/promise/all',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/query',
  'dijit/registry',
  'jimu/filterUtils',
  'jimu/utils',
  './_SingleFilterParameter',
  './_filter/ValueProviderFactory'
],
  function(on, Evented, Deferred, all, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, lang,
  html, array, query, registry, filterUtils, jimuUtils, _SingleFilterParameter, ValueProviderFactory) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'jimu-filter-parameters',
      templateString: '<div>' +
                        '<table style="width:100%;border-collapse:collapse;">' +
                          '<tbody data-dojo-attach-point="tbody"></tbody>' +
                        '</table>' +
                      '</div>',
      _filterUtils: null,
      _spObj: null,//{spId:sp}

      nls: null,
      partsObj: null,
      layerInfo: null,
      OPERATORS: null,
      url: null,
      featureLayerId: null,//optional

      //events:
      //change

      postMixInProperties:function(){
        this.nls = window.jimuNls.filterBuilder;
        this._filterUtils = new filterUtils();
        this.OPERATORS = lang.clone(this._filterUtils.OPERATORS);
        this._spObj = {};
      },

      destroy: function(){
        this.clear();
        this._filterUtils = null;
        this.inherited(arguments);
      },

      //the default value of showErrorTip is true
      getFilterExpr: function(){
        var newPartsObj = this._getNewValidPartsObj(this.partsObj, true);
        var expr = newPartsObj ? this._getFilterExprByPartsObj(newPartsObj) : null;
        return expr;
      },

      getValueProviders: function(){
        var valueProviders = [];
        var spArray = this._getAllInteractiveSinglePartArray(this.partsObj);
        for(var i = 0; i < spArray.length; i++){
          var singlePart = spArray[i];
          var id = singlePart.spId;
          if(id){
            var sp = this._getSingleFilterParameterBySpId(id);
            valueProviders.push(sp);
          }
        }
        return valueProviders;
      },

      //remove invalid partObj
      _getNewValidPartsObj: function(_partsObj, returnNullIfInvalidPart){
        _partsObj = lang.clone(_partsObj);

        var newPartsObj = {
          logicalOperator: _partsObj.logicalOperator,
          parts: []
        };

        var validateSinglePart = lang.hitch(this, function(singlePart){
          if(singlePart.spId){
            var sp = this._getSingleFilterParameterBySpId(singlePart.spId);
            singlePart.valueObj = sp.getValueObject();
            return sp.getStatus();
          }else{
            return singlePart.valueObj ? 1 : -1;
          }
        });

        //return -1 means input a wrong value
        //return 0 means empty value
        //return 1 means valid value
        var tryPushSinglePart = lang.hitch(this, function(singlePart){
          var status = validateSinglePart(singlePart);
          if(status > 0){
            newPartsObj.parts.push(singlePart);
          }
          return status;
        });

        //return -1 means input a wrong value
        //return 0 means empty value
        //return 1 means valid value
        var tryPushParts = lang.hitch(this, function(p){
          var statusArr = [];
          p.parts = array.filter(p.parts, lang.hitch(this, function(singlePart){
            var status = validateSinglePart(singlePart);
            statusArr.push(status);
            return status > 0;
          }));
          if(p.parts.length === 1){
            newPartsObj.parts.push(p.parts[0]);
          }else if(p.parts.length >= 2){
            newPartsObj.parts.push(p);
          }
          return Math.min.apply(statusArr, statusArr);
        });

        for(var i = 0; i < _partsObj.parts.length; i++){
          var p = _partsObj.parts[i];
          if (p.parts) {
            if(tryPushParts(p) < 0 && returnNullIfInvalidPart){
              return null;
            }
          } else {
            if(tryPushSinglePart(p) < 0 && returnNullIfInvalidPart){
              return null;
            }
          }
        }

        return newPartsObj;
      },

      _getFilterExprByPartsObj: function(partsObj){
        this._filterUtils.isHosted = jimuUtils.isHostedService(this.url);
        var expr = this._filterUtils.getExprByFilterObj(partsObj);
        return expr;
      },

      _getSingleFilterParameterBySpId: function(id){
        return this._spObj[id];
      },

      _getCascadeFilterExpr: function(desPart){
        /*jshint loopfunc: true */
        var expr = "1=1";
        //get cascadePartsObj
        var cascadePartsObj = {
          logicalOperator: this.partsObj.logicalOperator,
          parts: []
        };
        var partsObj = lang.clone(this.partsObj);
        var i,p,p2;
        var cascade = "none";
        if(desPart.interactiveObj && desPart.interactiveObj.cascade){
          cascade = desPart.interactiveObj.cascade;
        }

        if(cascade === "previous"){
          for(i = 0; i < partsObj.parts.length; i++){
            p = partsObj.parts[i];
            if(p.majorCascadeIndex < desPart.majorCascadeIndex){
              cascadePartsObj.parts.push(p);
            }else if(p.parts && p.majorCascadeIndex === desPart.majorCascadeIndex){
              p2 = lang.clone(p);
              p2.parts = array.filter(p2.parts, lang.hitch(this, function(singlePart){
                return singlePart.minorCascadeIndex < desPart.minorCascadeIndex;
              }));
              cascadePartsObj.parts.push(p2);
            }
          }
        }else if(cascade === "all"){
          for(i = 0; i < partsObj.parts.length; i++){
            p = partsObj.parts[i];
            if(p.majorCascadeIndex !== desPart.majorCascadeIndex){
              cascadePartsObj.parts.push(p);
            }else if(p.majorCascadeIndex === desPart.majorCascadeIndex){
              if(p.parts){
                p2 = lang.clone(p);
                var isP2ContainsDesPart = array.some(p.parts, lang.hitch(this, function(singlePart){
                  return singlePart.spId === desPart.spId;
                }));
                if(isP2ContainsDesPart){
                  p2.parts = array.filter(p2.parts, lang.hitch(this, function(singlePart){
                    return singlePart.minorCascadeIndex !== desPart.minorCascadeIndex;
                  }));
                  cascadePartsObj.parts.push(p2);
                }
              }
            }
          }
        }

        cascadePartsObj = this._getNewValidPartsObj(cascadePartsObj, false);

        if(cascadePartsObj){
          expr = this._getFilterExprByPartsObj(cascadePartsObj);
        }

        if(!expr){
          expr = "1=1";
        }

        return expr;
      },

      clear: function(){
        this.url = null;
        this.featureLayerId = null;
        var spDoms = query('.jimu-widget-query-single-parameter', this.tbody);
        array.forEach(spDoms, lang.hitch(this, function(spDom){
          var sp = registry.byNode(spDom);
          sp.destroy();
        }));
        html.empty(this.tbody);
        this.partsObj = null;
        this.layerInfo = null;
      },

      //return a deferred object
      //if resolved, means it build successfully
      //if rejected, means it fail to build
      build: function(url, layerDefinition, partsObj, /*optional*/ featureLayerId){
        var resultDef = new Deferred();
        this.clear();
        this.url = url;
        this.layerInfo = layerDefinition;
        this.partsObj = lang.clone(partsObj);
        this.partsObj = this._updatePartsObj(this.partsObj);
        this.featureLayerId = featureLayerId;
        this._setCascadeIndexForPartsObj(this.partsObj);
        var interactiveSPA = this._getAllInteractiveSinglePartArray(this.partsObj);

        if(interactiveSPA.length > 0){
          var valueProviderFactory = new ValueProviderFactory({
            url: this.url,
            layerDefinition: layerDefinition,
            featureLayerId: this.featureLayerId
          });
          var sps = array.map(interactiveSPA, lang.hitch(this, function(singlePart){
            var tr = html.create('tr', {innerHTML:'<td></td>'}, this.tbody);
            var td = query('td', tr)[0];
            var fieldName = singlePart.fieldObj.name;
            var fieldInfo = this._getFieldInfo(fieldName, this.layerInfo);
            var args = {
              nls: this.nls,
              url: this.url,
              layerDefinition: layerDefinition,
              fieldInfo: fieldInfo,
              part: singlePart,
              valueProviderFactory: valueProviderFactory
            };
            var sp = new _SingleFilterParameter(args);
            this.own(on(sp, 'change', lang.hitch(this, this._onSingleFilterParameterChanged)));
            sp.placeAt(td);
            sp.startup();
            singlePart.spId = sp.id;
            this._spObj[sp.id] = sp;
            return sp;
          }));
          //override method sp.valueProvider.getCascadeFilterExpr after create all sps and also before build
          array.forEach(sps, lang.hitch(this, function(sp){
            sp.valueProvider.getCascadeFilterExpr = lang.hitch(this, this._getCascadeFilterExpr, sp.part);
          }));
          var defs = array.map(sps, lang.hitch(this, function(sp){
            return sp.init();
          }));
          all(defs).then(lang.hitch(this, function(){
            resultDef.resolve();
          }), lang.hitch(this, function(){
            resultDef.reject();
          }));
        }else{
          resultDef.resolve();
        }

        return resultDef;
      },

      _updatePartsObj: function(partsObj){
        //update interactiveObj.cascade: all previous none
        array.forEach(partsObj, lang.hitch(this, function(item){
          if(item.parts){
            array.forEach(item.parts, lang.hitch(this, function(item2){
              if(item2.interactiveObj && item2.interactiveObj.cascade === true){
                item2.interactiveObj.cascade = "previous";
              }else if(item2.interactiveObj.cascade === false){
                item2.interactiveObj.cascade = "none";
              }
            }));
          }else{
            if(item.interactiveObj && item.interactiveObj.cascade === true){
              item.interactiveObj.cascade = "previous";
            }else if(item.interactiveObj.cascade === false){
              item.interactiveObj.cascade = "none";
            }
          }
        }));

        return partsObj;
      },

      _setCascadeIndexForPartsObj: function(partsObj){
        for(var i = 0; i < partsObj.parts.length; i++){
          var p = partsObj.parts[i];
          if(partsObj.logicalOperator === 'AND'){
            //AND
            p.majorCascadeIndex = i;
          }else{
            //OR
            p.majorCascadeIndex = 0;
          }
          p.minorCascadeIndex = 0;
          p.cascadeIndex = p.majorCascadeIndex;
          if(p.parts){
            for(var j = 0; j < p.parts.length; j++){
              var p2 = p.parts[j];
              p2.majorCascadeIndex = p.majorCascadeIndex;
              if(p.logicalOperator === 'AND'){
                p2.minorCascadeIndex = j;
              }else{
                p2.minorCascadeIndex = 0;
              }
              p2.cascadeIndex = parseFloat(p2.majorCascadeIndex + "." + p2.minorCascadeIndex);
            }
          }
        }
      },

      _getFieldInfo: function(fieldName, lyrDef){
        var fieldInfos = lyrDef.fields;
        for(var i = 0;i < fieldInfos.length; i++){
          var fieldInfo = fieldInfos[i];
          if(fieldName === fieldInfo.name){
            return fieldInfo;
          }
        }
        return null;
      },

      _getAllInteractiveSinglePartArray: function(partsObj){
        var result = [];
        for(var i = 0; i < partsObj.parts.length; i++){
          var p = partsObj.parts[i];
          if(p.parts){
            for(var j = 0; j < p.parts.length; j++){
              var p2 = p.parts[j];
              if(p2.interactiveObj){
                result.push(p2);
              }
            }
          }else{
            if(p.interactiveObj){
              result.push(p);
            }
          }
        }
        return result;
      },

      _onSingleFilterParameterChanged: function(){
        //when changed, we should get the filter silently and don't show error tip
        this.emit('change', this.getFilterExpr(false));
      }

    });
  });