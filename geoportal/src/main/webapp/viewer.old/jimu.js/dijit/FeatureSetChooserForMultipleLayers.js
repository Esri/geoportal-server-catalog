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
  'dojo/sniff',
  'dojo/mouse',
  'dojo/query',
  'dojo/Evented',
  'dojo/_base/html',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/promise/all',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/FeatureSetChooserForMultipleLayers.html',
  'dijit/popup',
  'dijit/TooltipDialog',
  'jimu/utils',
  'jimu/dijit/DrawBox',
  'jimu/dijit/_FeatureSetChooserCore',
  'jimu/dijit/FeatureActionPopupMenu'
],
function(on, sniff, mouse, query, Evented, html, lang, array, all, declare, _WidgetBase, _TemplatedMixin,
  _WidgetsInTemplateMixin, template, dojoPopup, TooltipDialog, jimuUtils, DrawBox, _FeatureSetChooserCore,
  PopupMenu) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    baseClass: 'jimu-multiple-layers-featureset-chooser',
    declaredClass: 'jimu.dijit.FeatureSetChooserForMultipleLayers',
    templateString: template,
    drawBox: null,
    _instances: null,//[{featureLayer,featureSetChooserCore}]
    _tooltipDialogTimeoutId1: -1,
    _tooltipDialogClientX1: -1,
    _tooltipDialogTimeoutId2: -1,
    _tooltipDialogClientX2: -1,
    _tooltipTimeout: 1000,
    _currentGeoTypeInfo: null,//{geoType,action,dom}
    _geoTypeInfos: null,//[{geoType,action,dom}]

    //constructor options:
    map: null,
    updateSelection: false,
    fullyWithin: false,
    geoTypes: null,//['POINT', EXTENT', 'POLYGON', 'CIRCLE', 'POLYLINE', 'FREEHAND_POLYGON']
    actions: null,

    //public methods:
    //enable
    //disable
    //activate
    //deactivate
    //clear
    //setFeatureLayers
    //addFeatureLayer
    //removeFeatureLayer

    //events:
    //user-clear
    //loading
    //unloading

    postMixInProperties:function(){
      this.inherited(arguments);
      this.nls = window.jimuNls.featureSetChooser;
      var validGeoTypes = ['POINT', 'EXTENT', 'POLYGON', 'CIRCLE', 'POLYLINE', 'FREEHAND_POLYGON'];

      if(this.geoTypes && this.geoTypes.length > 0){
        this.geoTypes = array.filter(this.geoTypes, lang.hitch(this, function(geoType){
          return validGeoTypes.indexOf(geoType) >= 0;
        }));
      }

      if(!this.geoTypes || this.geoTypes.length === 0){
        this.geoTypes = ['EXTENT'];
      }
    },

    postCreate:function(){
      this.inherited(arguments);

      this._instances = [];
      this.popupMenu = PopupMenu.getInstance();

      var selectTextDom = query('.select-text', this.domNode)[0];
      selectTextDom.innerHTML = this.nls.select;

      var clearTextDom = query('.clear-text', this.domNode)[0];
      clearTextDom.innerHTML = window.jimuNls.common.clear;

      this._initTooltipDialogs();

      this._initDrawBox();

      this._geoTypeInfos = [];
      this.actions = [];

      if(this.geoTypes.length === 0){
        this.geoTypes.push("EXTENT");
      }

      if(this.geoTypes.length === 1){
        html.addClass(this.domNode, 'single-geotype');
      }else{
        html.addClass(this.domNode, 'multiple-geotypes');
      }

      var validGeoTypes = ['POINT', 'EXTENT', 'POLYGON', 'CIRCLE', 'POLYLINE', 'FREEHAND_POLYGON'];
      var geoTypeMap = {
        POINT: ['icon-select-by-point', this.nls.selectByPoint, this.drawBox.pointIcon],
        EXTENT: ['icon-select-by-rect', this.nls.selectByRectangle, this.drawBox.extentIcon],
        POLYGON: ['icon-select-by-polygon', this.nls.selectByPolygon, this.drawBox.polygonIcon],
        CIRCLE: ['icon-select-by-circle', this.nls.selectByCircle, this.drawBox.circleIcon],
        POLYLINE: ['icon-select-by-line', this.nls.selectByLine, this.drawBox.polylineIcon],
        FREEHAND_POLYGON: ['icon-select-by-freehand-polygon',
          this.nls.selectByFreehandPolygon,
          this.drawBox.freehandPolygonIcon]
      };
      var extentIndex = -1;
      array.forEach(validGeoTypes, lang.hitch(this, function(geoType) {
        var dataItem = geoTypeMap[geoType];
        //var attachpoint = doms[0];
        if (this.geoTypes.indexOf(geoType) >= 0) {
          var geoTypeInfo = {
            geoType: geoType,
            action: {
              iconClass: dataItem[0],
              label: dataItem[1],
              data: {}
            },
            dom: dataItem[2]
          };
          var action = {
            iconClass: dataItem[0],
            label: dataItem[1],
            data: {},
            onExecute: lang.hitch(this, this._onDrawItemClicked, geoTypeInfo)
          };
          this._geoTypeInfos.push(geoTypeInfo);
          this.actions.push(action);
          if (geoType === 'EXTENT') {
            extentIndex = this._geoTypeInfos.length - 1;
          }
        }
      }));

      this.own(on(this.btnSelect, 'click', lang.hitch(this, function() {
        jimuUtils.simulateClickEvent(this._currentGeoTypeInfo.dom);
        this._hideDrawItems();
      })));

      // default value is selecting by extent
      if (extentIndex >= 0) {
        this._setCurrentGeoInfo(this._geoTypeInfos[extentIndex]);
        html.addClass(this.geoTypeIcon, 'icon-select-by-rect');
      } else {
        this._setCurrentGeoInfo(this._geoTypeInfos[0]);
        html.addClass(this.geoTypeIcon, this._geoTypeInfos[0].action.iconClass);
      }

      this.deactivate();
    },

    _initTooltipDialogs: function(){
      //tooltipDialog1
      var k = sniff('mac') ? "⌘" : 'Ctrl';
      var tip1 = '- ' + this.nls.newSelectionTip + ' (' + this.nls.dragMouse + ')';
      var tip2 = '- ' + this.nls.addSelectionTip + ' (Shift+' + this.nls.dragBox + ')';
      var tip3 = '- ' + this.nls.removeSelectionTip + ' (' + k + '+' + this.nls.dragBox + ')';

      var tip4 = '- ' + this.nls.newSelectionTip + ' (' + this.nls.drawShap + ')';
      var tip5 = '- ' + this.nls.addSelectionTip + ' (Shift+' + this.nls.darw + ')';
      var tip6 = '- ' + this.nls.removeSelectionTip + ' (' + k + '+' + this.nls.darw + ')';

      var selectTipText = '<div class="title"></div>' +
      '<div class="item new-selection-item"></div>' +
      '<div class="item add-selection-item"></div>' +
      '<div class="item remove-selection-item"></div>';
      var tooltipDialogContent1 = html.create("div", {
        'innerHTML': selectTipText,
        'class': 'dialog-content'
      });

      var titleDom = query('.title', tooltipDialogContent1)[0];
      var newSelectionDom = query('.new-selection-item', tooltipDialogContent1)[0];
      var addSelectionDom = query('.add-selection-item', tooltipDialogContent1)[0];
      var removeSelectionDom = query('.remove-selection-item', tooltipDialogContent1)[0];

      this.tooltipDialog1 = new TooltipDialog({
        content: tooltipDialogContent1
      });
      html.addClass(this.tooltipDialog1.domNode, 'jimu-multiple-layers-featureset-chooser-tooltipdialog');
      this.own(on(this.btnSelect, 'mousemove', lang.hitch(this, function(evt){
        this._tooltipDialogClientX1 = evt.clientX;
      })));
      this.own(on(this.btnSelect, mouse.enter, lang.hitch(this, function() {
        clearTimeout(this._tooltipDialogTimeoutId1);
        this._tooltipDialogTimeoutId1 = -1;
        this._tooltipDialogTimeoutId1 = setTimeout(lang.hitch(this, function() {
          if (this.tooltipDialog1) {
            var geoType = this._currentGeoTypeInfo.geoType;
            if(geoType === 'EXTENT'){
              newSelectionDom.innerHTML = tip1;
              addSelectionDom.innerHTML = tip2;
              removeSelectionDom.innerHTML = tip3;
              titleDom.innerHTML = this.nls.selectByRectangle;
            }else{
              newSelectionDom.innerHTML = tip4;
              addSelectionDom.innerHTML = tip5;
              removeSelectionDom.innerHTML = tip6;
              if(geoType === 'POLYGON'){
                titleDom.innerHTML = this.nls.selectByPolygon;
              }else if(geoType === 'CIRCLE'){
                titleDom.innerHTML = this.nls.selectByCircle;
              }else if(geoType === 'POLYLINE'){
                titleDom.innerHTML = this.nls.selectByLine;
              }else if(geoType === 'FREEHAND_POLYGON') {
                titleDom.innerHTML = this.nls.selectByFreehandPolygon;
              }else if(geoType === 'POINT') {
                titleDom.innerHTML = this.nls.selectByPoint;
              }
            }
            dojoPopup.open({
              parent: this.getParent(),
              popup: this.tooltipDialog1,
              around: this.btnSelect,
              position: ["below"]
            });
            if(this._tooltipDialogClientX1 >= 0){
              this.tooltipDialog1.domNode.parentNode.style.left = this._tooltipDialogClientX1 + "px";
            }
          }
        }), this._tooltipTimeout);
      })));
      this.own(on(this.btnSelect, mouse.leave, lang.hitch(this, function(){
        clearTimeout(this._tooltipDialogTimeoutId1);
        this._tooltipDialogTimeoutId1 = -1;
        this._hideTooltipDialog(this.tooltipDialog1);
      })));

      //tooltipDialog2
      var clearTipText = this.nls.unselectAllSelectionTip;
      var tooltipDialogContent2 = html.create("div", {
        'innerHTML': clearTipText,
        'class': 'dialog-content'
      });
      this.tooltipDialog2 = new TooltipDialog({
        content: tooltipDialogContent2
      });
      html.addClass(this.tooltipDialog2.domNode, 'jimu-multiple-layers-featureset-chooser-tooltipdialog');
      this.own(on(this.btnClear, 'mousemove', lang.hitch(this, function(evt){
        this._tooltipDialogClientX2 = evt.clientX;
      })));
      this.own(on(this.btnClear, mouse.enter, lang.hitch(this, function() {
        clearTimeout(this._tooltipDialogTimeoutId2);
        this._tooltipDialogTimeoutId2 = -1;
        this._tooltipDialogTimeoutId2 = setTimeout(lang.hitch(this, function() {
          if (this.tooltipDialog2) {
            dojoPopup.open({
              parent: this.getParent(),
              popup: this.tooltipDialog2,
              around: this.btnClear,
              position: ["below"]
            });
            if(this._tooltipDialogClientX2 >= 0){
              this.tooltipDialog2.domNode.parentNode.style.left = this._tooltipDialogClientX2 + "px";
            }
          }
        }), this._tooltipTimeout);
      })));
      this.own(on(this.btnClear, mouse.leave, lang.hitch(this, function(){
        clearTimeout(this._tooltipDialogTimeoutId2);
        this._tooltipDialogTimeoutId2 = -1;
        this._hideTooltipDialog(this.tooltipDialog2);
      })));
    },

    _onArrowClicked: function(event){
      event.stopPropagation();
      var position = html.position(event.target);
      this._showDrawItems(position);
    },

    _setCurrentGeoInfo: function(geoTypeInfo){
      var oldGeoType = this._currentGeoTypeInfo && this._currentGeoTypeInfo.geoType;
      if(this._currentGeoTypeInfo){
        html.removeClass(this.currentDrawItem, this._currentGeoTypeInfo.geoType);
      }
      this._currentGeoTypeInfo = geoTypeInfo;
      html.addClass(this.currentDrawItem, this._currentGeoTypeInfo.geoType);

      if(this.isActive()){
        if(oldGeoType !== this._currentGeoTypeInfo.geoType){
          jimuUtils.simulateClickEvent(this._currentGeoTypeInfo.dom);
        }
      }else{
        jimuUtils.simulateClickEvent(this._currentGeoTypeInfo.dom);
      }
    },

    _showDrawItems: function(position){
      this.popupMenu.setActions(this.actions);
      this.popupMenu.markAsSelected(this._currentGeoTypeInfo.action);
      this.popupMenu.show(position);
    },

    _hideDrawItems: function(){
      this.popupMenu.hide();
    },

    _onDrawItemClicked: function(geoTypeInfo){
      this._hideDrawItems();
      this._setCurrentGeoInfo(geoTypeInfo);
      // 'EXTENT', 'POLYGON', 'CIRCLE', 'POLYLINE'
      html.removeClass(this.geoTypeIcon, [
        'icon-select-by-point',
        'icon-select-by-circle',
        'icon-select-by-rect',
        'icon-select-by-polygon',
        'icon-select-by-line',
        'icon-select-by-freehand-polygon'
      ]);
      switch(geoTypeInfo.geoType) {
        case 'POLYGON':
          html.addClass(this.geoTypeIcon, 'icon-select-by-polygon');
          break;
        case 'CIRCLE':
          html.addClass(this.geoTypeIcon, 'icon-select-by-circle');
          break;
        case 'POLYLINE':
          html.addClass(this.geoTypeIcon, 'icon-select-by-line');
          break;
        case 'FREEHAND_POLYGON':
          html.addClass(this.geoTypeIcon, 'icon-select-by-freehand-polygon');
          break;
        case 'POINT':
          html.addClass(this.geoTypeIcon, 'icon-select-by-point');
          break;
        default:
          html.addClass(this.geoTypeIcon, 'icon-select-by-rect');
      }
    },

    _initDrawBox: function(){
      this.drawBox = new DrawBox({
        map: this.map,
        showClear: true,
        keepOneGraphic: true,
        deactivateAfterDrawing: false,
        geoTypes: this.geoTypes
      });
      //this.drawBox.placeAt(this.domNode);
      this.own(on(this.drawBox, 'user-clear', lang.hitch(this, this._onDrawBoxUserClear)));
      this.own(on(this.drawBox, 'draw-end', lang.hitch(this, this._onDrawEnd)));

      this.own(on(this.drawBox, 'draw-activate', lang.hitch(this, function(){
        this.map.infoWindow.hide();
        html.addClass(this.currentDrawItem, 'pressed');
        html.addClass(this.btnSelect, 'selected');
      })));

      this.own(on(this.drawBox, 'draw-deactivate', lang.hitch(this, function(){
        html.removeClass(this.currentDrawItem, 'pressed');
        html.removeClass(this.btnSelect, 'selected');
      })));

      this.own(on(this.btnClear, 'click', lang.hitch(this, function(){
        jimuUtils.simulateClickEvent(this.drawBox.btnClear);
      })));
    },

    disable: function(){
      this.drawBox.disable();
      html.addClass(this.domNode, 'disabled');
    },

    enable: function(){
      this.drawBox.enable();
      html.removeClass(this.domNode, 'disabled');
    },

    isActive: function(){
      return this.drawBox.isActive();
    },

    activate: function(){
      if(this.isActive()){
        return;
      }
      var info = this._currentGeoTypeInfo;
      if(!info){
        info = this._geoTypeInfos[0];
      }
      this._setCurrentGeoInfo(info);
    },

    deactivate: function(){
      this.drawBox.deactivate();
    },

    setFeatureLayers: function(featureLayers){
      //remove instances
      var needToRemovedInstances = array.filter(this._instances, lang.hitch(this, function(instance){
        return featureLayers.indexOf(instance.featureLayer) < 0;
      }));
      array.forEach(needToRemovedInstances, lang.hitch(this, function(instance){
        this._removeInstance(instance);
      }));

      //add new instances
      var existLayers = array.map(this._instances, lang.hitch(this, function(instance){
        return instance.featureLayer;
      }));
      array.forEach(featureLayers, lang.hitch(this, function(featureLayer){
        if(existLayers.indexOf(featureLayer) < 0){
          this.addFeatureLayer(featureLayer);
        }
      }));
    },

    addFeatureLayer: function(featureLayer){
      if(featureLayer.declaredClass !== "esri.layers.FeatureLayer"){
        return;
      }

      var instance = this._findInstanceByLayer(featureLayer);
      if(!instance){
        var featureSetChooserCore = new _FeatureSetChooserCore({
          map: this.map,
          featureLayer: featureLayer,
          drawBox: this.drawBox,
          updateSelection: this.updateSelection,
          fullyWithin: this.fullyWithin
        });
        this._instances.push(featureSetChooserCore);
      }
    },

    removeFeatureLayer: function(featureLayer){
      if(featureLayer.declaredClass !== "esri.layers.FeatureLayer"){
        return;
      }
      var instance = this._findInstanceByLayer(featureLayer);
      if(instance){
        this._removeInstance(instance);
      }
    },

    _removeInstance: function(instance){
      if(instance){
        var index = this._instances.indexOf(instance);
        if(index >= 0){
          instance.destroy();
          this._instances.splice(index, 1);
        }
      }
    },

    _findInstanceByLayer: function(featureLayer){
      var featureSetChooserCore = null;
      array.some(this._instances, lang.hitch(this, function(item){
        if(item.featureLayer === featureLayer){
          featureSetChooserCore = item;
          return true;
        }else{
          return false;
        }
      }));
      return featureSetChooserCore;
    },

    clear: function(shouldClearSelection){
      array.forEach(this._instances, lang.hitch(this, function(featureSetChooserCore){
        featureSetChooserCore.clear(shouldClearSelection);
      }));
    },

    destroy: function(){
      this._hideTooltipDialog(this.tooltipDialog1);
      this._hideTooltipDialog(this.tooltipDialog2);
      array.forEach(this._instances, lang.hitch(this, function(featureSetChooserCore){
        featureSetChooserCore.destroy();
      }));
      this._instances = [];
      if(this.drawBox){
        this.drawBox.destroy();
      }
      this.drawBox = null;
      this.inherited(arguments);
    },

    _hideTooltipDialog: function(tooltipDialog){
      if(tooltipDialog){
        dojoPopup.close(tooltipDialog);
      }
    },

    _onDrawBoxUserClear: function(){
      this.clear(true);
      this.emit("user-clear");
    },

    _onDrawEnd: function(){
      this.drawBox.clear();
      if (this._instances.length > 0) {
        setTimeout(lang.hitch(this, function() {
          if (this._instances.length > 0) {
            this.emit('loading');
            this.disable();
            var defs = array.map(this._instances, lang.hitch(this, function(instance) {
              return instance.getFeatures();
            }));
            all(defs).always(lang.hitch(this, function() {
              this.enable();
              if(this._currentGeoTypeInfo){
                jimuUtils.simulateClickEvent(this._currentGeoTypeInfo.dom);
              }
              this.emit('unloading');
            }));
          }
        }), 50);
      }
    }

  });
});