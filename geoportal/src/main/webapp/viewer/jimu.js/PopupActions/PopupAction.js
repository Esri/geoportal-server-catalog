define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dijit/_WidgetBase',
  'dojo/Evented',
  'dojo/on',
  'dojo/query'
], function(
  declare, array, lang, html, _WidgetBase, Evented, on, query
) {

  return declare([_WidgetBase, Evented], {
    popup: null,
    popupMobile: null,
    // popupUnion = {
    //   mobile: is mobile popup of map,
    //   bigScreen: is popup of map
    // };
    popupUnion: null,
    // buttonInfo = {
    //   label:
    //   baseClass:
    //   onClick:
    // }
    buttonInfo: null,
    _buttons: null,

    constructor: function() {
      this.buttonDomNodes = [];
    },

    postCreate: function() {
      // description:
      //   if provides buttonInfo parameter, add button to infoWindow
      this.inherited(arguments);
      // init popup and popupMobile object
      this.popup = this.popupUnion.bigScreen;
      this.popupMobile = this.popupUnion.mobile;
      if (this.buttonInfo) {
        this._addButtonNode();
      }
    },

    _addButtonNode: function() {
      this._addButtonNodeToPopup();
      this._addButtonNodeToPopupMobile();
    },

    _addButtonNodeToPopup: function() {
      //query actionList node of this.popup
      var actionListNode = query(".actionList", this.popup.domNode)[0];

      //add relationship table button in this.popup
      var aNode = html.create('a', {
        "class": "action " + this.buttonInfo.baseClass,
        "href": " javascript:void(0);"
      }, actionListNode);
      this.buttonDomNodes.push(aNode);

      this.popupButtonNode = html.create('span', {
        "innerHTML": this.buttonInfo.label
      }, aNode);

      this.own(on(this.popupButtonNode,
        "click",
        lang.hitch(this, this._onButtonClick)));

      this.own(on(this.popup,
        "selection-change",
        lang.hitch(this, this._onSelectionChange, this.popup)));

      this.own(on(this.popup,
        "show",
        lang.hitch(this, this._onShow)));
    },

    _addButtonNodeToPopupMobile: function() {
      //query actionList node of this.popupMobile
      var mobileInfoViewItem = query(".esriMobilePopupInfoView .esriMobileInfoViewItem");
      var actionListNode = mobileInfoViewItem[mobileInfoViewItem.length - 1];

      //add relationship table button in this.popupMobile
      var aNode = html.create('a', {
        "class": "action " + this.buttonInfo.baseClass,
        "href": " javascript:void(0);"
      }, actionListNode);
      this.buttonDomNodes.push(aNode);
      this.popupMobileButtonNode = html.create('span', {
        "innerHTML": this.buttonInfo.label
      }, aNode);

      this.own(on(this.popupMobileButtonNode,
        "click",
        lang.hitch(this, this._onButtonClick)));

      this.own(on(this.popupMobile,
        "selection-change",
        lang.hitch(this, this._onSelectionChange, this.popupMobile)));

      this.own(on(this.popupMobile,
        "show",
        lang.hitch(this, this._onShow)));
    },

    show: function() {
      html.setStyle(this.popupButtonNode, 'display', 'inline');
      html.setStyle(this.popupMobileButtonNode, 'display', 'inline');
    },

    hide: function() {
      html.setStyle(this.popupButtonNode, 'display', 'none');
      html.setStyle(this.popupMobileButtonNode, 'display', 'none');
    },

    _onButtonClick: function() {
      //this.emit('buttonClick', this._selectedFeature);
      if(this.buttonInfo.onClick && lang.isFunction(this.buttonInfo.onClick)) {
        this.buttonInfo.onClick(this._selectedFeature,
                                this._popupShowEvt,
                                this._popupSelectionChangeEvt);
      }
    },

    _onSelectionChange: function(infoWindow, evt) {
      if (evt.target.selectedIndex > -1) {
        this._selectedFeature = infoWindow.getSelectedFeature();
        this._popupSelectionChangeEvt = evt;
        this.emit('selectionChange', this._selectedFeature, evt);
      }
    },

    _onShow: function(evt) {
      this._popupShowEvt = evt;
    },

    destroy: function() {
      array.forEach(this.buttonDomNodes, function(buttonDomNode) {
        html.destroy(buttonDomNode);
      }, this);
      this.inherited(arguments);
    }

  });
});