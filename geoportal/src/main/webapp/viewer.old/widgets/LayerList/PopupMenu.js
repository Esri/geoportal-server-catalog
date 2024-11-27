define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/_base/lang',
  'dojo/query',
  'dojo/Deferred',
  'jimu/dijit/DropMenu',
  'dijit/_TemplatedMixin',
  'dijit/form/HorizontalSlider',
  'dijit/form/HorizontalRuleLabels',
  'dojo/text!./PopupMenu.html',
  'dojo/dom-style',
  './NlsStrings',
  './PopupMenuInfo'
], function(declare, array, html, lang, query, Deferred, DropMenu,
  _TemplatedMixin, HorizSlider, HorzRuleLabels, template, domStyle, NlsStrings, PopupMenuInfo) {
  return declare([DropMenu, _TemplatedMixin], {
    templateString: template,
    popupMenuInfo: null,
    loading: null,
    _deniedItems: null,
    _deniedItemsFromConfig: null,
    _layerInfo: null,
    constructor: function() {
      this.nls = NlsStrings.value;
    },

    postCreate: function() {
      this.inherited(arguments);
      this._initDeniedItems();
      this.loading = html.create('div', {
        'class': 'popup-menu-loading'
      }, this.popupMenuNode);

      // if(!this.hasContentMenu()) {
      //   this.hide();
      //   domStyle.set(this.popupMenuNode, 'display', 'none');
      // }
    },

    _initDeniedItems: function() {
      var deniedItemsFromConfigKeys = [];
      var menuItemDictionary = {
        "ZoomTo": "zoomto",
        "Transparency": "transparency",
        "EnableOrDisablePopup": "controlPopup",
        "MoveupOrMovedown": "moveup movedown",
        "OpenAttributeTable": "table",
        "DescriptionOrShowItemDetailsOrDownload": "url"
      };
      this._deniedItems = [];
      this._deniedItemsFromConfig = [];
      // ignore if this._config.contextMenu has not configured.
      // compatible with old version app.
      for (var menuItem in this._config.contextMenu) {
        if(this._config.contextMenu.hasOwnProperty(menuItem) &&
            (typeof this._config.contextMenu[menuItem] !== 'function') &&
            this._config.contextMenu[menuItem] === false) {
          deniedItemsFromConfigKeys =
            deniedItemsFromConfigKeys.concat(menuItemDictionary[menuItem].split(" "));
        }
      }

      array.forEach(deniedItemsFromConfigKeys,
                    lang.hitch(this, function(deniedItemKey) {
        this._deniedItemsFromConfig.push({
          'key': deniedItemKey,
          'denyType': 'hidden'
        });
      }));
    },

    _getDropMenuPosition: function() {
      return {
        top: "40px",
        right: "0px",
        zIndex: 1
      };
    },

    _getTransNodePosition: function() {
      return {
        top: "28px",
        //left: "-107px"
        //left: -1 * html.getStyle(this.transparencyDiv, 'width') + 'px'
        right: "2px"
      };
    },

    _onBtnClick: function() {},

    // will call after openDropMenu
    _refresh: function() {
      this._denyItems();
      this._changeItemsUI();
    },

    _denyItems: function() {
      var itemNodes = query("[class~='menu-item-identification']", this.dropMenuNode);
      itemNodes.forEach(function(itemNode) {
        html.removeClass(itemNode, "menu-item-dissable");
        html.removeClass(itemNode, "menu-item-hidden");
      }, this);
      html.removeClass(this.dropMenuNode, "no-border");
      array.forEach(this._deniedItems, function(deniedItem) {
        var itemNode = query("div[itemId='" + deniedItem.key + "']", this.dropMenuNode)[0];
        if (itemNode) {
          if (deniedItem.denyType === "disable") {
            html.addClass(itemNode, "menu-item-dissable");
            if (deniedItem.key === 'url') {
              query(".menu-item-description", itemNode).forEach(function(itemA) {
                html.setAttr(itemA, 'href', '#');
                html.removeAttr(itemA, 'target');
              });
            }
          } else {
            html.addClass(itemNode, "menu-item-hidden");
          }
        }
      }, this);

      // handle separator line
      var lastDisplayItemNodeIndex = -1;
      for (var i = 0; i < itemNodes.length; i++) {
        if (html.hasClass(itemNodes[i], 'menu-item-line')) {
          if (lastDisplayItemNodeIndex === -1 ||
            html.hasClass(itemNodes[lastDisplayItemNodeIndex], 'menu-item-line')) {
            html.addClass(itemNodes[i], "menu-item-hidden");
          }
        }

        if (!html.hasClass(itemNodes[i], 'menu-item-hidden')) {
          lastDisplayItemNodeIndex = i;
        }
      }
      // Hide last item if that is a line.
      var displayItemNodes = array.filter(itemNodes, function(itemNode) {
        return !html.hasClass(itemNode, 'menu-item-hidden');
      });
      if (displayItemNodes.length === 0) {
        html.addClass(this.dropMenuNode, "no-border");
      } else {
        html.removeClass(this.dropMenuNode, "no-border");
        if (html.hasClass(displayItemNodes[displayItemNodes.length - 1], 'menu-item-line')) {
          html.addClass(displayItemNodes[displayItemNodes.length - 1], "menu-item-hidden");
        }
      }
    },

    _changeItemsUI: function() {
      //handle controlPopup item.
      var itemNode = query("[itemid=controlPopup]", this.dropMenuNode)[0];
      if (itemNode && this._layerInfo.controlPopupInfo) {
        if (this._layerInfo.controlPopupInfo.enablePopup) {
          html.setAttr(itemNode, 'innerHTML', this.nls.removePopup);
        } else {
          html.setAttr(itemNode, 'innerHTML', this.nls.enablePopup);
        }
      }
      //handle controlLabels item.
      itemNode = query("[itemid=controlLabels]", this.dropMenuNode)[0];
      if (itemNode && this._layerInfo.canShowLabel()) {
        if (this._layerInfo.isShowLabels()) {
          html.setAttr(itemNode, 'innerHTML', this.nls.hideLables);
        } else {
          html.setAttr(itemNode, 'innerHTML', this.nls.showLabels);
        }
      }

    },

    _switchLoadingState: function(isShow) {
      if(isShow) {
        html.setStyle(this.loading, 'display', 'block');
      } else {
        html.setStyle(this.loading, 'display', 'none');
      }
    },

    selectItem: function(item, evt) {
      var found = false;
      for (var i = 0; i < this._deniedItems.length; i++) {
        if (this._deniedItems[i].key === item.key) {
          found = true;
          break;
        }
      }
      if (!found) {
        this.emit('onMenuClick', item);
      }
      evt.stopPropagation(evt);
    },

    openDropMenu: function() {
      var inheritedCallBack = lang.hitch(this, this.inherited, arguments);
      var popupMenuInfoDef = new Deferred();
      this._switchLoadingState(true);
      if (!this.dropMenuNode) {
        // create popupMenuInfo first.
        PopupMenuInfo.create(this._layerInfo, this.layerListWidget)
          .then(lang.hitch(this, function(popupMenuInfo) {
            // set environment and create.
            this.items = popupMenuInfo.getDisplayItems();
            this.popupMenuInfo = popupMenuInfo;
            this._createDropMenuNode();
            popupMenuInfoDef.resolve(this.popupMenuInfo);
          }));
      } else {
        popupMenuInfoDef.resolve(this.popupMenuInfo);
      }

      popupMenuInfoDef.then(lang.hitch(this, function() {
        // get deniedItems
        this.popupMenuInfo.getDeniedItems().then(lang.hitch(this, function(deniedItems) {
          this._deniedItems = this._deniedItemsFromConfig.concat(deniedItems);
          // deny items
          this._refresh();
          // display dropMenuNode.
          inheritedCallBack(arguments);
          this._switchLoadingState(false);
        }), lang.hitch(this, function() {
          this._switchLoadingState(false);
        }));
      }), lang.hitch(this, function() {
        this._switchLoadingState(false);
      }));
    },

    closeDropMenu: function() {
      this.inherited(arguments);
      this.hideTransNode();
    },

    // about transparcency
    _onTransparencyDivClick: function(evt) {
      // summary:
      //    response to click transparency in popummenu.
      evt.stopPropagation();
    },

    showTransNode: function(transValue) {
      /* global isRTL */
      if (!this.transHorizSlider) {
        this._createTransparencyWidget();
        this.transHorizSlider.set("value", 1 - transValue);
      }
      domStyle.set(this.transparencyDiv, "top", this._getTransNodePosition().top);
      if (isRTL) {
        domStyle.set(this.transparencyDiv, "left", this._getTransNodePosition().right);
      } else {
        domStyle.set(this.transparencyDiv, "right", this._getTransNodePosition().right);
      }
      domStyle.set(this.transparencyDiv, "display", "block");
    },

    hideTransNode: function() {
      domStyle.set(this.transparencyDiv, "display", "none");
    },

    _createTransparencyWidget: function() {
      this.transHorizSlider = new HorizSlider({
        minimum: 0,
        maximum: 1,
        intermediateChanges: true
      }, this.transparencyBody);

      this.own(this.transHorizSlider.on("change", lang.hitch(this, function(newTransValue) {
        var data = {
          newTransValue: newTransValue
        };
        this.emit('onMenuClick', {
          key: 'transparencyChanged'
        }, data);
      })));

      new HorzRuleLabels({
        container: "bottomDecoration"
      }, this.transparencyRule);
    },

    hide: function() {
      domStyle.set(this.domNode, 'display', 'none');
    },

    show: function() {
      domStyle.set(this.domNode, 'display', 'block');
    }

    /*
    hasContentMenu: function() {
      var hasContentMenu = false;
      var item;
      if(this._config.contextMenu) {
        for (item in this._config.contextMenu) {
          if(this._config.contextMenu.hasOwnProperty(item) &&
             (typeof this._config.contextMenu[item] !== 'function')) {
            hasContentMenu = hasContentMenu || this._config.contextMenu[item];
          }
        }
      } else {
        hasContentMenu = true;
      }
      return hasContentMenu;
    }
    */
  });
});
