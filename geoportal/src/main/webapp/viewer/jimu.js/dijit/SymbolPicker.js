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
    'dijit/_TemplatedMixin',
    'dojo/Evented',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/_base/array',
    'dojo/on',
    'dojo/query',
    'dijit/TooltipDialog',
    'dijit/popup',
    'dijit/registry',
    'jimu/dijit/SymbolChooser',
    'jimu/symbolUtils'
  ],
  function(declare, _WidgetBase, _TemplatedMixin, Evented, lang, html, array, on, query,
    TooltipDialog, dojoPopup, registry, SymbolChooser, jimuSymUtils) {
    return declare([_WidgetBase, _TemplatedMixin, Evented], {
      baseClass: 'jimu-symbol-picker',
      declaredClass: 'jimu.dijit.SymbolPicker',
      templateString: '<div>' +
                        '<div data-dojo-attach-point="symbolNode" class="symbol-node jimu-float-leading"></div>' +
                        '<div class="separator jimu-float-leading"></div>' +
                        '<div class="jimu-icon jimu-icon-down-arrow-8 jimu-float-leading"></div>' +
                      '</div>',
      tooltipDialog: null,
      _isTooltipDialogOpened: false,

      //options:
      //you must set symbol or type
      symbol: null, //optional
      type: null, //optional, available values:marker,line,fill,text
      cropImage: false, //optional
      customZIndex: null, //optional

      //public methods:
      //reset
      //showBySymbol
      //showByType
      //getSymbol

      //events:
      //change

      postCreate: function() {
        this.inherited(arguments);
        this._createTooltipDialog();
        this._hideTooltipDialog();
        var symbol = this.symbolChooser.getSymbol();
        if(symbol){
          this._drawSymbol(symbol);
        }
      },

      destroy: function(){
        this._hideTooltipDialog();
        if(this.symbolChooser){
          this.symbolChooser.destroy();
        }
        this.symbolChooser = null;
        this.inherited(arguments);
      },

      _createTooltipDialog: function() {
        var ttdContent = html.create("div");
        this.tooltipDialog = new TooltipDialog({
          content: ttdContent
        });

        this.symbolChooser = new SymbolChooser({
          cropImage: this.cropImage,
          customZIndex: this.customZIndex,
          symbol: this.symbol,
          type: this.type
        });

        this.symbolChooser.placeAt(ttdContent);
        this.symbolChooser.startup();

        this.own(on(this.symbolChooser, 'change', lang.hitch(this, function(newSymbol){
          this._drawSymbol(newSymbol);
          this.emit('change', newSymbol);
        })));

        this.own(on(this.domNode, 'click', lang.hitch(this, function(event){
          event.stopPropagation();
          event.preventDefault();
          if(this._isTooltipDialogOpened){
            this._hideTooltipDialog();
          }else{
            this._showTooltipDialog();
          }
        })));

        this.own(on(document.body, 'click', lang.hitch(this, function(event){
          var target = event.target || event.srcElement;
          var colorPickers = this._getColorPickers();
          if(colorPickers.length > 0){
            var isClickColorPicker = array.some(colorPickers, function(colorPicker){
              return colorPicker.isPartOfPopup(target);
            });
            if(isClickColorPicker){
              return;
            }
          }
          var node = this.tooltipDialog.domNode;
          var isInternal = target === node || html.isDescendant(target, node);
          //custom & cropImage=true
          if(this.cropImage){
            var ifCustomOption = this.symbolChooser._isCustomImageOptionSelected();
            if(ifCustomOption){
              var _imageChooser = this.symbolChooser.imageChooser;
              var isCropOpen = _imageChooser.cropPopupOpen;
              var isMsgOpen = _imageChooser.msgPopupOpen;
              if(!isCropOpen && !isMsgOpen){
                if(!isInternal){
                  this._hideTooltipDialog();
                }
              }
              if(!(_imageChooser.cropPopup && _imageChooser.cropPopup.domNode)){
                _imageChooser.cropPopupOpen = false;
              }
              if(!(_imageChooser.msgPopup && _imageChooser.msgPopup.domNode)){
                _imageChooser.msgPopupOpen = false;
              }
              return;
            }
          }
          //custom & cropImage=false
          if(!isInternal){
            this._hideTooltipDialog();
          }
        })));

        this.own(on(this.symbolChooser, 'resize', lang.hitch(this, function(){
          if(this._isTooltipDialogOpened){
            this._hideTooltipDialog();
            this._showTooltipDialog();
          }
        })));
      },

      _getColorPickers: function(){
        var doms = query('.jimu-color-picker', this.symbolChooser.domNode);
        var colorPickers = array.map(doms, lang.hitch(this, function(dom){
          return registry.byNode(dom);
        }));
        return colorPickers;
      },

      reset: function(){
        this.type = null;
        this.symbol = null;
        html.empty(this.symbolNode);
        this.symbolChooser.reset();
      },

      showBySymbol: function(symbol){
        this.reset();
        if(symbol){
          this._drawSymbol(symbol);
          this.symbolChooser.showBySymbol(symbol);
        }
      },

      showByType: function(type){
        this.reset();
        this.symbolChooser.showByType(type);
        var symbol = this.symbolChooser.getSymbol();
        if (symbol) {
          this._drawSymbol(symbol);
        }
      },

      getSymbol: function(){
        return this.symbolChooser.getSymbol();
      },

      _drawSymbol: function(symbol) {
        html.empty(this.symbolNode);
        if (symbol) {
          var symbolDom = jimuSymUtils.createSymbolNode(symbol, {
            width: 16,
            height: 16
          });
          if (symbolDom) {
            html.place(symbolDom, this.symbolNode);
          }
        }
      },

      _showTooltipDialog: function(){
        if(this.tooltipDialog){
          dojoPopup.open({
            parent: this.getParent(),
            popup: this.tooltipDialog,
            around: this.domNode
          });
          this._isTooltipDialogOpened = true;
        }
      },

      _hideTooltipDialog: function(){
        if(this.tooltipDialog){
          dojoPopup.close(this.tooltipDialog);
          this._isTooltipDialogOpened = false;
        }
      }

    });
  });