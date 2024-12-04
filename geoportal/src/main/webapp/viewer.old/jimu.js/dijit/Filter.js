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

define([
  'dojo/on',
  'dojo/Evented',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/Filter.html',
  'jimu/filterUtils',
  'jimu/utils',
  'jimu/LayerInfos/LayerInfos',
  'jimu/dijit/_filter/ValueProviderFactory',
  'dijit/registry',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/aspect',
  'dojo/Deferred',
  'esri/request',
  './_SingleFilter',
  './_FilterSet',
  './LoadingIndicator'
],
function(on, Evented, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, filterUtils,
  jimuUtils, LayerInfos, ValueProviderFactory, registry, lang, html, array, aspect, Deferred, esriRequest,
  SingleFilter, FilterSet) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, filterUtils, Evented], {
    templateString: template,
    baseClass: 'jimu-filter',
    declaredClass: 'jimu.dijit.Filter',
    nls: null,

    autoSwitchMode: true,

    //test urls:
    //http://discomap.eea.europa.eu/arcgis/rest/services/
    //NoiseWatch/NoiseWatch_Overview_WM/MapServer/3

    //http://discomap.eea.europa.eu/arcgis/rest/services/
    //NoiseWatch/NoiseWatch_Overview_WM/MapServer/8

    //http://ec2-50-16-225-130.compute-1.amazonaws.com/arcgis/rest/services/
    //Agriculture/Inspection_history/MapServer/0

    //http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/
    //Demographics/ESRI_Census_USA/MapServer/5

    //http://sampleserver6.arcgisonline.com/arcgis/rest/services/
    //SampleWorldCities/MapServer/0

    _validOptions: false,
    _layerDefinition: null,
    _popupFieldsInfo:[],
    _def: null,
    valueProviderFactory: null,
    featureLayerId: null,
    layerInfosObj: null,
    mode: 'desktop',//desktop,mobile

    //options:
    noFilterTip: '',//optional
    enableAskForValues: false,//optional
    mobileBreakWidth: 600,
    runtime: false, //optional

    //public methods:
    //build: partsObj or expr -> UI
    //buildByExpr: expr->UI
    //buildByFilterObj: partsObj->UI
    //toJson: UI->partsObj
    //getFilterObjByExpr(inherited): expr->partsObj
    //getExprByFilterObj(inherited): partsObj->expr
    //autoUpdateMode: update UI mode automatically
    //setMode: set fixed UI mode

    //attributes:
    //url: null, //required
    //expr: null,//optional
    //partsObj: null,//optional

    //css classes:
    //jimu-single-filter
    //jimu-filter-set
    //no-filter-tip

    //events:
    //change

    postMixInProperties:function(){
      this.nls = window.jimuNls.filterBuilder;
      this.nls.add = window.jimuNls.common.add;
      this.nls.apply = window.jimuNls.common.apply;
      this.layerInfosObj = LayerInfos.getInstanceSync();
      this.inherited(arguments);
    },

    postCreate: function(){
      this.inherited(arguments);
      this._setDesktopMode();
      if(this.noFilterTip && typeof this.noFilterTip === 'string'){
        this.noFilterTipSection.innerHTML = this.noFilterTip;
      }
    },

    startup: function(){
      this.inherited(arguments);
      this.autoUpdateMode();
    },

    resize: function(){
      this.autoUpdateMode();
    },

    //Update mode automatically. Should call this method when widget resize if Filter hosted in widget
    autoUpdateMode: function(){
      if(!this.autoSwitchMode){
        return;
      }
      this._clearMode();
      var w = this.domNode.clientWidth;
      if(w >= this.mobileBreakWidth){
        this._setDesktopMode();
      }else{
        this._setMobileMode();
      }
    },

    setMode: function(mode){
      if(mode === 'desktop'){
        this._setDesktopMode();
      }else if(mode === 'mobile'){
        this._setMobileMode();
      }
    },

    _setMode: function(mode){
      this.mode = mode;
      this._setModeClass(this.mode);
    },

    _setModeClass: function(mode){
      html.removeClass(this.domNode, 'desktop-mode');
      html.removeClass(this.domNode, 'mobile-mode');
      html.addClass(this.desktopAddSection, 'hidden');
      html.addClass(this.mobileAddSection, 'hidden');
      if(mode){
        html.addClass(this.domNode, mode + '-mode');
      }
    },

    _clearMode: function(){
      this._setModeClass("");
    },

    _setDesktopMode: function(){
      this._setMode('desktop');
      html.removeClass(this.desktopAddSection, 'hidden');
    },

    _setMobileMode: function(){
      this._setMode('mobile');
      html.removeClass(this.mobileAddSection, 'hidden');
    },

    reset: function(){
      if(!this.isBuilding()){
        this.removeAllFilters();
        this.url = null;
        this.isHosted = false;
        this._layerDefinition = null;
        this._popupFieldsInfo = [];
        this.featureLayerId = null;
        this.expr = null;
        this.partsObj = null;
        this.valueProviderFactory = null;
      }
    },

    isBuilding: function(){
      return this._def && !this._def.isFulfilled();
    },

    /*
    options.url: required,
    options.partsObj: {logicalOperator,parts,expr}
    options.expr: sql expression
    options.partsObj or options.expr is required. options.partsObj has priority.
    options.layerDefinition: optional
    options.featureLayerId: optional
    */
    build: function(options){
      var def = new Deferred();

      if(this.isBuilding()){
        def.reject('Filter is already building.');
      } else{
        this._def = null;
        this.reset();
        this.url = options.url;
        this.isHosted = jimuUtils.isHostedService(this.url);
        this._layerDefinition = options.layerDefinition;
        this.featureLayerId = options.featureLayerId;

        if(options.partsObj){
          this.partsObj = this._updatePartsObj(options.partsObj);
          this._def = this._init("partsObj");
        }else{
          this.expr = options.expr || '1=1';
          this._def = this._init("expr");
        }
        def = this._def;
      }

      return def;
    },

    buildByExpr: function(url, expr, /*optional*/ layerDefinition){
      console.warn('Filter#buildByExpr() method is deprecated, please use Filter#build() instead.');
      var options = {
        url: url,
        expr: expr,
        layerDefinition: layerDefinition,
        featureLayerId: this.featureLayerId
      };

      return this.build(options);
    },

    //partsObj:{logicalOperator,parts,expr}
    buildByFilterObj: function(url, partsObj, /*optional*/ layerDefinition){
      console.warn('Filter#buildByFilterObj() method is deprecated, please use Filter#build() instead.');
      var options = {
        url: url,
        partsObj: partsObj,
        layerDefinition: layerDefinition,
        featureLayerId: this.featureLayerId
      };

      return this.build(options);
    },

    _updatePartsObj: function(partsObj) {
      //update interactiveObj.cascade: all previous none
      array.forEach(partsObj, lang.hitch(this, function(item) {
        if (item.parts) {
          array.forEach(item.parts, lang.hitch(this, function(item2) {
            if (item2.interactiveObj && item2.interactiveObj.cascade === true) {
              item2.interactiveObj.cascade = "previous";
            } else if (item2.interactiveObj.cascade === false) {
              item2.interactiveObj.cascade = "none";
            }
          }));
        } else {
          if (item.interactiveObj && item.interactiveObj.cascade === true) {
            item.interactiveObj.cascade = "previous";
          } else if (item.interactiveObj.cascade === false) {
            item.interactiveObj.cascade = "none";
          }
        }
      }));

      return partsObj;
    },

    removeAllFilters: function(){
      this._destroyAllFilters();
    },

    _getLayerDefinitionRaw: function(url, /*optional*/ layerDefinition){
      var def = new Deferred();
      if(layerDefinition){
        def.resolve(layerDefinition);
      } else{
        this.loading.show();
        esriRequest({
          url: url,
          content: {f:'json'},
          handleAs: 'json',
          callbackParamName: 'callback'
        }).then(lang.hitch(this, function(response){
          if(!this.domNode){
            def.reject();
            return;
          }
          this.loading.hide();
          def.resolve(response);
        }), lang.hitch(this, function(err){
          console.error(err);
          def.reject();
          if(!this.domNode){
            return;
          }
          this.loading.hide();
        }));
      }
      return def;
    },

    _validateLayerDefinition: function(_layerDefinition){
      return this._isObject(_layerDefinition);
    },

    //return Deferred
    _init: function(mode){
      var def = new Deferred();

      if(!this._isString(this.url)){
        def.reject();
        return def;
      }

      var resolveDef = lang.hitch(this, function(){
        setTimeout(lang.hitch(this, function() {
          this.emit('change');
          def.resolve();
        }), 1500);
      });

      var callback = lang.hitch(this, function() {
        html.addClass(this.errorSection, 'hidden');
        this.removeAllFilters();

        var _popup;
        if(this.featureLayerId){
          this._tryOverrideFieldAliases(this.featureLayerId, this._layerDefinition);
          var _layerInfo = this.layerInfosObj.getLayerOrTableInfoById(this.featureLayerId);
          _popup = _layerInfo.getPopupInfo();
        }
        var fields = this._layerDefinition.fields;
        if (!(fields && fields.length > 0)) {
          if(_popup){
            this._popupFieldsInfo = _popup.fieldInfos;
          }
          def.reject();
          return;
        }else{
          if(_popup){//complete popupFields with layerFields
            this._popupFieldsInfo = jimuUtils.completePopupFieldFromLayerField(fields, _popup.fieldInfos);
          }else{ //use default setting if no popupInfo
            this._popupFieldsInfo = fields;
          }
        }

        fields = array.filter(fields, lang.hitch(this, function(fieldInfo) {
          return this._supportFieldTypes.indexOf(fieldInfo.type) >= 0;
        }));
        var invalidFields = fields && fields.length > 0;
        if (!invalidFields) {
          this._showErrorOptions(this.nls.error.noFilterFields);
          def.reject();
          return;
        }
        this._validOptions = true;

        html.removeClass(this.btnAddSetDesktop, 'jimu-state-disabled');
        html.removeClass(this.btnAddExpDesktop, 'jimu-state-disabled');
        html.removeClass(this.btnAddSetMobile, 'jimu-state-disabled');
        html.removeClass(this.btnAddExpMobile, 'jimu-state-disabled');

        this.createFieldsStore();
        this.valueProviderFactory = new ValueProviderFactory({
          url: this.url,
          layerDefinition: this._layerDefinition,
          featureLayerId: this.featureLayerId
        });

        if (mode === 'expr') {
          if (this._isString(this.expr)) {
            var expression = this.expr.replace(/\s/gi, '');
            if (expression === '1=1') {
              this.removeAllFilters();
            }
            if(this._parseExpr(this.expr)){
              resolveDef();
            } else{
              def.reject();
            }
          } else{
            def.reject();
          }
        } else if (mode === 'partsObj') {
          if (this._validatePartsObj(this.partsObj)) {
            this._parsePartsObj(this.partsObj);
            resolveDef();
          } else{
            def.reject();
          }
        } else{
          if (this._validatePartsObj(this.partsObj)) {
            this._parsePartsObj(this.partsObj);
            resolveDef();
          } else if (this._isString(this.expr)) {
            if(this._parseExpr(this.expr)){
              resolveDef();
            }else{
              def.reject();
            }
          } else{
            //default is '1=1'
            this.removeAllFilters();
            resolveDef();
          }
        }
      });

      if(this._validateLayerDefinition(this._layerDefinition)){
        callback();
      } else{
        this.loading.show();
        esriRequest({
          url: this.url,
          content: {f:'json'},
          handleAs: 'json',
          callbackParamName: 'callback'
        }).then(lang.hitch(this, function(response){
          if(!this.domNode){
            def.reject();
            return;
          }
          this.loading.hide();
          this._layerDefinition = response;
          callback();
        }), lang.hitch(this, function(err){
          console.error(err);
          def.reject();
          if(!this.domNode){
            return;
          }
          this.loading.hide();
        }));
      }

      return def;
    },

    _tryOverrideFieldAliases: function(layerId, layerDefinition){
      var layerInfo = this.layerInfosObj.getLayerOrTableInfoById(layerId);
      if(layerInfo){
        var popupInfo = layerInfo.getPopupInfo();
        if(popupInfo){
          var popupFieldInfos = popupInfo.fieldInfos;//[{fieldName,label,tooltip,visible,format,stringFieldOption}]
          var serviceFieldInfos = layerDefinition.fields;//[{name,alias}]
          //replace serviceFieldInfo's alias with popupFieldInfo's label
          if(popupFieldInfos && popupFieldInfos.length > 0 && serviceFieldInfos && serviceFieldInfos.length > 0){
            var popupFieldInfosObj = {};
            array.forEach(popupFieldInfos, lang.hitch(this, function(popupFieldInfo){
              if(popupFieldInfo.fieldName){
                popupFieldInfosObj[popupFieldInfo.fieldName] = popupFieldInfo;
              }
            }));
            array.forEach(serviceFieldInfos, lang.hitch(this, function(serviceFieldInfo){
              var popupFieldInfo = popupFieldInfosObj[serviceFieldInfo.name];
              if(popupFieldInfo && popupFieldInfo.label){
                serviceFieldInfo.alias = popupFieldInfo.label;
              }
            }));
          }
        }
      }
    },


    /**************************************************/
    /****  stringify                               ****/
    /**************************************************/
    toJson:function(){
      var json = {
        logicalOperator: this.allAnySelect.value,
        parts: []
      };
      var filters = this._getAllSingleFiltersAndFilterSets();
      if(filters.length === 0){
        json.expr = '1=1';
        return json;
      }
      array.forEach(filters, lang.hitch(this, function(filter){
        var part = filter.toJson();
        json.parts.push(part);
      }));
      var validParts = array.every(json.parts, lang.hitch(this, function(part){
        return !!part;
      }));
      if(validParts && json.parts.length > 0){
        json.expr = this.getExprByFilterObj(json);
        return json;
      } else{
        return null;
      }
    },

    /**************************************************/
    /****  lists                                   ****/
    /**************************************************/

    createFieldsStore: function(){
      if(!this._layerDefinition.fields || this._layerDefinition.fields.length === 0){
        this._showErrorOptions(this.nls.error.noFilterFields);
        return;
      }

      var copyLayerInfo = lang.clone(this._layerDefinition);
      var layerInfoFields = copyLayerInfo.fields;
      // layerInfoFields = layerInfoFields.sort(function(a, b){
      //   a.label = a.alias || a.name;
      //   b.label = b.alias || b.name;
      //   return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
      // });

      var validFieldCount = this.setFieldsStoreByFieldInfos(layerInfoFields);

      if(validFieldCount === 0){
        this._showErrorOptions(this.nls.error.noFilterFields);
      }
    },

    /**************************************************/
    /****  parse                                   ****/
    /**************************************************/
    _parsePartsObj:function(partsObj){
      if(!this._validatePartsObj(partsObj)){
        return;
      }
      this.removeAllFilters();
      this._buildEditUIByPartsObj(partsObj);
    },

    _parseExpr:function(expr){
      this._destroyAllFilters();
      var partsObj = null;
      if(!this._validateLayerDefinition(this._layerDefinition)){
        return partsObj;
      }

      if(!expr || typeof expr !== 'string'){
        this._showErrorOptions(this.nls.error.invalidSQL);
        return partsObj;
      }

      if(this.expr.replace(/\s/gi, '') === "1=1"){
        partsObj = {
          "expr": "1=1",
          "parts": [],
          "logicalOperator": "AND"
        };
        return partsObj;
      }

      try{
        //try parse expr into partsObj
        partsObj = this.getFilterObjByExpr(expr);
      }catch(e){
        partsObj = null;
        console.error(e);
      }

      //if get null, it indicates we can't parse expr to a valid partsObj
      if(partsObj){
        this._buildEditUIByPartsObj(partsObj);
      }else{
        this._showErrorOptions(this.nls.error.cantParseSQL);
      }

      return partsObj;
    },

    _buildEditUIByPartsObj:function(partsObj){
      if(!partsObj){
        return;
      }
      this._destroyAllFilters();
      array.forEach(partsObj.parts, lang.hitch(this, function(item){
        if(item.parts){
          //FilterSet
          this._addFilterSet(item);
        } else if(item.fieldObj && item.operator && item.valueObj){
          //SingleFilter
          this._addSingleFilter(item);
        }
      }));
      //reset all/any operator from config
      this.allAnySelect.value = partsObj.logicalOperator;
      this._setFilterMsgUI(partsObj.parts.length);
    },

    /**************************************************/
    /****  edit                                    ****/
    /**************************************************/

    _addSingleFilter:function(/*optional*/ part){
      var args = {
        url: this.url,
        layerInfo: this._layerDefinition,
        popupFieldsInfo: this._popupFieldsInfo,
        stringFieldType: this._stringFieldType,
        dateFieldType: this._dateFieldType,
        numberFieldTypes: this._numberFieldTypes,
        part: part,
        OPERATORS: lang.mixin({}, this.OPERATORS),
        enableAskForValues: this.enableAskForValues,
        isHosted: this.isHosted,
        valueProviderFactory: this.valueProviderFactory,
        runtime: this.runtime
      };
      var singleFilter = new SingleFilter(args);
      singleFilter.placeAt(this.allExpsBox);
      singleFilter.startup();
      this.own(aspect.after(singleFilter, '_destroySelf', lang.hitch(this, function(){
        this._checkFilterNumbers();
        this.emit('change');
      })));
      this.own(on(singleFilter, 'change', lang.hitch(this, function(){
        this.emit('change');
      })));
      this._checkFilterNumbers();
      return singleFilter;
    },

    _addFilterSet:function(/*optional*/ partsObj){
      var args = {
        url: this.url,
        layerInfo: this._layerDefinition,
        popupFieldsInfo: this._popupFieldsInfo,
        stringFieldType: this._stringFieldType,
        dateFieldType: this._dateFieldType,
        numberFieldTypes: this._numberFieldTypes,
        partsObj: partsObj,
        OPERATORS: lang.mixin({}, this.OPERATORS),
        enableAskForValues: this.enableAskForValues,
        isHosted: this.isHosted,
        valueProviderFactory: this.valueProviderFactory,
        runtime: this.runtime
      };
      var filterSet = new FilterSet(args);
      filterSet.placeAt(this.allExpsBox);
      filterSet.startup();
      this.own(aspect.after(filterSet, '_destroySelf', lang.hitch(this, function(){
        this._checkFilterNumbers();
        this.emit('change');
      })));
      this.own(on(filterSet, 'change', lang.hitch(this, function(){
        this.emit('change');
      })));
      this._checkFilterNumbers();
      return filterSet;
    },

    _destroyAllFilters:function(){
      var filters = this._getAllSingleFiltersAndFilterSets();
      while(filters.length > 0){
        var f = filters[0];
        f.destroy();
        filters.splice(0, 1);
      }
      this._checkFilterNumbers();
    },

    _getAllSingleFiltersAndFilterSetsDoms: function(){
      var doms = [];
      if(this.allExpsBox.childNodes && this.allExpsBox.childNodes.length > 0){
        array.forEach(this.allExpsBox.childNodes, lang.hitch(this, function(childNode){
          if(html.hasClass(childNode, 'jimu-single-filter') || html.hasClass(childNode, 'jimu-filter-set')){
            doms.push(childNode);
          }
        }));
      }
      return doms;
    },

    _getAllSingleFiltersAndFilterSets:function(){
      var nodes = this._getAllSingleFiltersAndFilterSetsDoms();
      var filters = array.map(nodes, lang.hitch(this, function(node){
        return registry.byNode(node);
      }));
      return filters;
    },

    _setFilterMsgUI: function(filterLength){
      if(filterLength < 2){
        //this default value need to set before config's value
        this.allAnySelect.value = 'AND';
        html.setStyle(this.allAnySelect, 'display', 'none');
        html.setStyle(this.oneOrZeroMsg, 'display', 'block');
      }else{
        html.setStyle(this.oneOrZeroMsg, 'display', 'none');
        html.setStyle(this.allAnySelect, 'display', 'block');
      }
    },

    _checkFilterNumbers:function(){
      var filterDoms = this._getAllSingleFiltersAndFilterSetsDoms();
      this._setFilterMsgUI(filterDoms.length);
      if(filterDoms.length > 0){
        html.addClass(this.noFilterTipSection, 'hidden');
      } else{
        html.removeClass(this.noFilterTipSection, 'hidden');
      }

      this.emit("filter-number-change");
    },

    _showErrorOptions:function(strError){
      console.error(strError);
      html.addClass(this.errorSection, 'hidden');
      this.errorTip.innerHTML = strError;
      this.loading.hide();
    },

    _onBtnApplyClicked: function(){
      this.emit('apply');
    },

    _onBtnAddSetClick:function(){
      if(!this._layerDefinition || !this._validOptions){
        return;
      }
      this._addFilterSet();
      this.emit('change');
    },

    _onBtnAddExpClick:function(){
      if(!this._layerDefinition || !this._validOptions){
        return;
      }
      this._addSingleFilter();
      this.emit('change');
    }
  });
});