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
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/DrawBox.html',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/on',
  'dojo/query',
  'dojo/Evented',
  'esri/graphic',
  'esri/layers/GraphicsLayer',
  'esri/toolbars/draw',
  'esri/symbols/jsonUtils',
  'esri/geometry/Polygon'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, lang, html,
  array, on, query, Evented, Graphic, GraphicsLayer, Draw, jsonUtils, Polygon) {
  var instancesObj = {};

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    templateString:template,
    baseClass: 'jimu-draw-box',
    declaredClass: 'jimu.dijit.DrawBox',
    nls:null,
    drawLayer:null,
    drawLayerId:null,
    drawToolBar:null,
    _isDisabled: false,
    _shiftKey: false,
    _ctrlKey: false,
    _metaKey: false, //used for Mac

    //options:
    //note: 'types' is mutually exclusive with 'geoTypes' and the latter has high priority
    //available types: ['point','polyline','polygon','text']
    types:null,
    /*available geoTypes:
      ["POINT",
       "LINE", "POLYLINE", "FREEHAND_POLYLINE",
       "TRIANGLE", "EXTENT", "CIRCLE", "ELLIPSE", "POLYGON", "FREEHAND_POLYGON",
       "TEXT"]
    */
    geoTypes:null,//if 'geoTypes' is set, 'types' is ignored
    map:null,
    pointSymbol:null,
    polylineSymbol:null,
    polygonSymbol:null,
    textSymbol:null,
    showClear:false,//show Clear button or not
    keepOneGraphic:false,//only keep one graphic or not
    deactivateAfterDrawing: true,//deactivate drawToolbar or not after every drawing

    //public methods:
    //setMap
    //setPointSymbol
    //setLineSymbol
    //setPolygonSymbol
    //setTextSymbol
    //addGraphic
    //removeGraphic
    //reset
    //clear
    //activate
    //deactivate
    //enable
    //disable
    //isEnabled

    //events:
    //icon-selected
    //draw-end
    //clear
    //user-clear
    //draw-activate
    //draw-deactivate

    //css classes:
    //draw-item
    //point-icon
    //line-icon
    //polyline-icon
    //freehand-polyline-icon
    //triangle-icon
    //extent-icon
    //circle-icon
    //ellipse-icon
    //polygon-icon
    //freehand-polygon-icon
    //text-icon
    //drawings-clear

    postMixInProperties:function(){
      this.nls = window.jimuNls.drawBox;
    },

    postCreate:function(){
      this.inherited(arguments);
      var layerArgs = {};
      if(this.drawLayerId){
        layerArgs.id = this.drawLayerId;
      }
      this.drawLayer = new GraphicsLayer(layerArgs);
      this._initDefaultSymbols();
      this._initTypes();
      var items = query('.draw-item', this.domNode);
      this.own(items.on('click', lang.hitch(this, this._onItemClick)));
      this.own(on(this.btnClear, 'click', lang.hitch(this, this._onClickClear)));
      //bind key events before draw-end
      this.own(on(document.body, 'keydown', lang.hitch(this, function(event){
        this._shiftKey = !!event.shiftKey;
        this._ctrlKey = !!event.ctrlKey;
        this._metaKey = !!event.metaKey;
      })));
      this.own(on(document.body, 'keyup', lang.hitch(this, function(event){
        this._shiftKey = !!event.shiftKey;
        this._ctrlKey = !!event.ctrlKey;
        this._metaKey = !!event.metaKey;
      })));

      if(this.map){
        this.setMap(this.map);
      }
      var display = this.showClear === true ? 'block' : 'none';
      html.setStyle(this.btnClear, 'display', display);
      this.enable();

      instancesObj[this.id] = this;
    },

    enable: function(){
      this._isDisabled = false;
      html.addClass(this.domNode, 'enabled');
      html.removeClass(this.domNode, 'disabled');
    },

    disable: function(){
      this._isDisabled = true;
      html.addClass(this.domNode, 'disabled');
      html.removeClass(this.domNode, 'enabled');
      this.deactivate();
    },

    hideLayer: function(){
      if(this.drawLayer){
        this.drawLayer.hide();
      }
    },

    showLayer: function(){
      if(this.drawLayer){
        this.drawLayer.show();
      }
    },

    isEnabled: function(){
      return !this._isDisabled;
    },

    isActive: function(){
      var items = query('.draw-item.jimu-state-active', this.domNode);
      return items && items.length > 0;
    },

    disableWebMapPopup:function(){
      if(this.map){
        this.map.setInfoWindowOnClick(false);
      }
    },

    enableWebMapPopup:function(){
      if(this.map){
        this.map.setInfoWindowOnClick(true);
      }
    },

    destroy:function(){
      this.deactivate();

      if(this.drawLayer){
        if(this.map){
          this.map.removeLayer(this.drawLayer);
        }
      }

      this.drawToolBar = null;
      this.map = null;
      this.drawLayer = null;
      delete instancesObj[this.id];
      this.inherited(arguments);
    },

    setMap:function(map){
      if(map){
        this.map = map;
        this.map.addLayer(this.drawLayer);
        this.drawToolBar = new Draw(this.map);
        this.drawToolBar.setMarkerSymbol(this.pointSymbol);
        this.drawToolBar.setLineSymbol(this.polylineSymbol);
        this.drawToolBar.setFillSymbol(this.polygonSymbol);
        this.own(on(this.drawToolBar, 'draw-end', lang.hitch(this, this._onDrawEnd)));
      }
    },

    setPointSymbol:function(symbol){
      this.pointSymbol = symbol;
      this.drawToolBar.setMarkerSymbol(this.pointSymbol);
    },

    setLineSymbol:function(symbol){
      this.polylineSymbol = symbol;
      this.drawToolBar.setLineSymbol(symbol);
    },

    setPolygonSymbol:function(symbol){
      this.polygonSymbol = symbol;
      this.drawToolBar.setFillSymbol(symbol);
    },

    setTextSymbol:function(symbol){
      this.textSymbol = symbol;
    },

    reset: function(){
      this.deactivate();
      this.clear();
    },

    clear:function(){
      this.drawLayer.clear();
      this.onClear();
    },

    deactivate:function(){
      this.enableWebMapPopup();
      query('.draw-item', this.domNode).removeClass('jimu-state-active');
      if(this.drawToolBar){
        this.drawToolBar.deactivate();
        this.emit('draw-deactivate');
      }
    },

    activate: function(tool){
      //tool available values:
      //POINT
      //LINE,POLYLINE,FREEHAND_POLYLINE
      //TRIANGLE,EXTENT,CIRCLE,ELLIPSE,POLYGON,FREEHAND_POLYGON
      //TEXT
      var itemIcon = null;
      var items = query('.draw-item', this.domNode);
      if(tool === 'TEXT'){
        tool = 'POINT';
        itemIcon = this.textIcon;
      }else{
        var filterItems = items.filter(function(itemNode){
          return itemNode.getAttribute('data-geotype') === tool;
        });
        if(filterItems.length > 0){
          itemIcon = filterItems[0];
        }
      }
      if(itemIcon){
        this._activate(itemIcon);
      }
    },

    onIconSelected:function(target, geotype, commontype){
      this.emit("icon-selected", target, geotype, commontype);
    },

    onDrawEnd:function(graphic, geotype, commontype, shiftKey, ctrlKey, metaKey){
      this.emit('draw-end', graphic, geotype, commontype, shiftKey, ctrlKey, metaKey);
    },

    onClear:function(){
      this.emit("clear");
    },

    addGraphic:function(g){
      if(this.keepOneGraphic){
        this.drawLayer.clear();
      }
      this.drawLayer.add(g);
    },

    removeGraphic:function(g){
      this.drawLayer.remove(g);
    },

    getFirstGraphic: function(){
      var firstGraphic = null;
      if(this.drawLayer && this.drawLayer.graphics.length > 0){
        firstGraphic = this.drawLayer.graphics[0];
      }
      return firstGraphic;
    },

    show: function(){
      html.removeClass(this.domNode, 'hidden');
    },

    hide: function(){
      html.addClass(this.domNode, 'hidden');
    },

    getDrawItemIcons: function(){
      return query('.draw-item', this.domNode);
    },

    _onClickClear: function(){
      if(this._isDisabled){
        return;
      }
      this.clear();
      this.emit("user-clear");
    },

    _initDefaultSymbols:function(){
      var pointSys = {
        "style": "esriSMSCircle",
        "color": [0, 0, 128, 128],
        "name": "Circle",
        "outline": {
          "color": [0, 0, 128, 255],
          "width": 1
        },
        "type": "esriSMS",
        "size": 18
      };
      var lineSys = {
        "style": "esriSLSSolid",
        "color": [79, 129, 189, 255],
        "width": 3,
        "name": "Blue 1",
        "type": "esriSLS"
      };
      var polygonSys = {
        "style": "esriSFSSolid",
        "color": [79, 129, 189, 128],
        "type": "esriSFS",
        "outline": {
          "style": "esriSLSSolid",
          "color": [54, 93, 141, 255],
          "width": 1.5,
          "type": "esriSLS"
        }
      };
      if(!this.pointSymbol){
        this.pointSymbol = jsonUtils.fromJson(pointSys);
      }
      if(!this.polylineSymbol){
        this.polylineSymbol = jsonUtils.fromJson(lineSys);
      }
      if(!this.polygonSymbol){
        this.polygonSymbol = jsonUtils.fromJson(polygonSys);
      }
    },

    _initTypes:function(){
      if(this.geoTypes && this.geoTypes.length > 0){
        //if 'geoTypes' is set, we ignore 'types'
        this.types = null;
      }else{
        this.geoTypes = [];
        if(!(this.types && this.types.length > 0)){
          this.types = ['point', 'polyline', 'polygon'];
        }
        if(this.types.indexOf('point') >= 0){
          this.geoTypes = this.geoTypes.concat(["POINT"]);
        }
        if(this.types.indexOf('polyline') >= 0){
          this.geoTypes = this.geoTypes.concat(["LINE", "POLYLINE", "FREEHAND_POLYLINE"]);
        }
        if(this.types.indexOf('polygon') >= 0){
          var a = ["TRIANGLE", "EXTENT", "CIRCLE", "ELLIPSE", "POLYGON", "FREEHAND_POLYGON"];
          this.geoTypes = this.geoTypes.concat(a);
        }
        if(this.types.indexOf('text') >= 0){
          this.geoTypes = this.geoTypes.concat(["TEXT"]);
        }
      }
      var items = query('.draw-item', this.domNode);
      items.style('display', 'none');
      array.forEach(items, lang.hitch(this, function(item){
        var geoType = item.getAttribute('data-geotype');
        var display = array.indexOf(this.geoTypes, geoType) >= 0;
        html.setStyle(item, 'display', display ? 'block' : 'none');
      }));
    },

    _onItemClick:function(event){
      if(this._isDisabled){
        return;
      }
      var target = event.target || event.srcElement;
      if(!html.hasClass(target, 'draw-item')){
        return;
      }
      var isSelected = html.hasClass(target, 'jimu-state-active');

      //toggle tools on and off
      if(isSelected){
        this.deactivate();
      }else{
        this._activate(target);
      }
    },

    _activate: function(itemIcon){
      this._deactiveAllDrawBoxes();

      var items = query('.draw-item', this.domNode);
      items.removeClass('jimu-state-active');
      html.addClass(itemIcon, 'jimu-state-active');
      var geotype = itemIcon.getAttribute('data-geotype');
      var commontype = itemIcon.getAttribute('data-commontype');
      var tool = Draw[geotype];
      if(geotype === 'TEXT'){
        tool = Draw.POINT;
      }
      this.disableWebMapPopup();
      this.drawToolBar.activate(tool);
      this.emit('draw-activate', tool);
      this.onIconSelected(itemIcon, geotype, commontype);
    },

    _onDrawEnd:function(event){
      var selectedItem = query('.draw-item.jimu-state-active', this.domNode)[0];
      var geotype = selectedItem.getAttribute('data-geotype');
      var commontype = selectedItem.getAttribute('data-commontype');
      var geometry = null;

      if(event.geometry.type === 'extent'){
        //convert extent to polygon because Analysis dijit doesn't support extent
        geometry = Polygon.fromExtent(event.geometry);
      }else{
        geometry = event.geometry;
      }

      geometry.geoType = geotype;
      geometry.commonType = commontype;

      var type = geometry.type;
      var symbol = null;

      if (type === "point" || type === "multipoint") {
        if(html.hasClass(this.textIcon, 'jimu-state-active')){
          symbol = this.textSymbol;
        }
        else{
          symbol = this.pointSymbol;
        }
      } else if (type === "line" || type === "polyline") {
        symbol = this.polylineSymbol;
      } else {
        symbol = this.polygonSymbol;
      }

      var g = new Graphic(geometry, symbol, null, null);

      if(this.keepOneGraphic){
        this.drawLayer.clear();
      }

      this.drawLayer.add(g);

      if(this.deactivateAfterDrawing){
        this.deactivate();
      }

      this.onDrawEnd(g, geotype, commontype, this._shiftKey, this._ctrlKey, this._metaKey);
    },

    _deactiveAllDrawBoxes: function() {
      var widget;
      array.forEach(Object.keys(instancesObj), lang.hitch(this, function(key) {
        widget = instancesObj[key];
        if (widget && widget.drawToolBar && key !== this.id) {
          widget.deactivate();
        }
      }));
    }
  });
});