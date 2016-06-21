define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dijit/_WidgetBase',
  'dojo/on',
  'dojo/topic',
  'jimu/WidgetManager',
  'jimu/LayerInfos/LayerInfos',
  'jimu/PopupActions/PopupAction'
], function(
  declare, lang, _WidgetBase, on, topic, WidgetManager, LayerInfos, PopupAction
) {
  return declare([_WidgetBase], {
    name: null,
    map: null,
    popupUnion: null,
    attrWidgetState: null,
    //attrWidget: null,
    appConfig: null,

    constructor: function() {
      this.own(topic.subscribe("appConfigChanged", lang.hitch(this, this._onAppConfigChanged)));
    },

    postCreate: function() {
      this.inherited(arguments);
      LayerInfos.getInstance(this.map, this.map.itemInfo)
        .then(lang.hitch(this, function(layerInfos) {
        this.layerInfos = layerInfos;
      }));

      this.showRelatedRecordBtn = new PopupAction({
        popupUnion: this.popupUnion,
        buttonInfo: {
          label: window.jimuNls.popupManager.showRelatedRecords,
          baseClass: "relationship",
          'onClick': lang.hitch(this, this._onRealtionshipClick)
        }
      });
      this.hide();

      this._updateAttrWidgetState();

      this.own(on(this.showRelatedRecordBtn,
                  "selectionChange",
                  lang.hitch(this, this._onSelectionChange)));
    },

    _updateAttrWidgetState: function() {
      this.attrWidgetState =
            this.appConfig.getConfigElementsByName("AttributeTable")[0];
    },

    _onRealtionshipClick: function(selectedFeature) {
      /*jshint unused: false*/
      var selectedLayerInfo = this.layerInfos.getLayerInfoById(selectedFeature._layer.id);
      var featureKey =
          selectedFeature.attributes[selectedFeature._layer.objectIdField];

      if(this.attrWidgetState && this.attrWidgetState.visible) {
        WidgetManager.getInstance().triggerWidgetOpen(this.attrWidgetState.id)
        .then(lang.hitch(this, function(attrWidget) {
          attrWidget.showRelatedRecordsFromPopup(selectedLayerInfo, [featureKey]);
        }));
      }
    },

    _onSelectionChange: function(selectedFeature) {
      if(this.layerInfos &&
          this.attrWidgetState &&
          this.attrWidgetState.visible &&
          selectedFeature._layer &&
          selectedFeature._layer.relationships &&
          (selectedFeature._layer.relationships.length > 0)) {
        var layerInfo = this.layerInfos.getLayerInfoById(selectedFeature._layer.id);
        if(layerInfo) {
          layerInfo.getRelatedTableInfoArray()
          .then(lang.hitch(this, function(relatedTableInfoArray) {
            if(relatedTableInfoArray.length > 0) {
              this.show();
            } else {
              this.hide();
            }
          }));
        } else {
          this.hide();
        }
      } else {
        this.hide();
      }
    },

    _onAppConfigChanged: function(appConfig) {
      this.appConfig = appConfig;
      this._updateAttrWidgetState();
    },

    show: function() {
      this.showRelatedRecordBtn.show();
    },

    hide: function() {
      this.showRelatedRecordBtn.hide();
    },

    destroy: function() {
      this.showRelatedRecordBtn.destroy();
      this.inherited(arguments);
    }
  });
});