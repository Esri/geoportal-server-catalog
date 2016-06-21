define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dijit/_WidgetBase',
  'dojo/on',
  'dojo/topic',
  'jimu/WidgetManager',
  'jimu/PopupActions/PopupAction'
], function(
  declare, lang, _WidgetBase, on, topic, WidgetManager, PopupAction
) {
  return declare([_WidgetBase], {
    name: null,
    map: null,
    popupUnion: null,
    editWidgetState: null,
    //attrWidget: null,
    appConfig: null,

    constructor: function() {
      this.own(topic.subscribe("appConfigChanged", lang.hitch(this, this._onAppConfigChanged)));
    },

    postCreate: function() {
      this.inherited(arguments);

      this.editBtn = new PopupAction({
        popupUnion: this.popupUnion,
        buttonInfo: {
          label: window.jimuNls.popupManager.edit,
          baseClass: "edit",
          'onClick': lang.hitch(this, this._onEditClick)
        }
      });
      this.hide();

      this._updateEditWidgetState();

      this.own(on(this.editBtn,
                  "selectionChange",
                  lang.hitch(this, this._onSelectionChange)));

    },


    _updateEditWidgetState: function() {
      this.editWidgetState =
            this.appConfig.getConfigElementsByName("Edit")[0];
    },

    _onEditClick: function(selectedFeature, showEvent) {
      /*jshint unused: false*/
      if(this.editWidgetState && this.editWidgetState.visible) {
        WidgetManager.getInstance().triggerWidgetOpen(this.editWidgetState.id)
        .then(lang.hitch(this, function(editWidget) {
          showEvent.mapPoint = showEvent.target.location;
          showEvent.graphic = selectedFeature;
          editWidget.reClickMap(showEvent);
        }));
      }
    },

    _onSelectionChange: function(selectedFeature) {
      if( this.editWidgetState &&
          this.editWidgetState.visible &&
          selectedFeature._layer &&
          selectedFeature._layer.isEditable &&
          selectedFeature._layer.isEditable()) {
        this.show();
      } else {
        this.hide();
      }
    },

    _onAppConfigChanged: function(appConfig) {
      this.appConfig = appConfig;
      this._updateEditWidgetState();
    },

    show: function() {
      this.editBtn.show();
    },

    hide: function() {
      this.editBtn.hide();
    },

    destroy: function() {
      this.editBtn.destroy();
      this.inherited(arguments);
    }
  });
});