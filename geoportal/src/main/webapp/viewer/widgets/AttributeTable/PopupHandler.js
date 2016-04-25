define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dijit/_WidgetBase',
  'dojo/on',
  'jimu/LayerInfos/LayerInfos',
  'jimu/InfoWindowAction'
], function(
  declare, lang, _WidgetBase, on, LayerInfos, InfoWindowAction
) {
  return declare([_WidgetBase], {
    postCreate: function() {
      this.inherited(arguments);
      LayerInfos.getInstance(this.map, this.map.itemInfo)
        .then(lang.hitch(this, function(layerInfos) {
        this.layerInfos = layerInfos;
      }));

      this.showRelatedTableBtn = new InfoWindowAction({
        buttonInfo: {
          title: this.nls.showRelatedRecords,
          baseClass: "relationship"
        }
      });

      this.own(on(this.showRelatedTableBtn,
                  "buttonClick",
                  lang.hitch(this, this._onRealtionshipClick)));

      this.own(on(this.showRelatedTableBtn,
                  "selectionChange",
                  lang.hitch(this, this._onSelectionChange)));
    },

    _onRealtionshipClick: function(selectedFeature) {
      /*jshint unused: false*/
      var selectedLayerInfo = this.layerInfos.getLayerInfoById(selectedFeature._layer.id);
      var featureKey =
          selectedFeature.attributes[selectedFeature._layer.objectIdField];
      //
      // this.attrWidget.onReceiveData("popup", "", {
      //   target: "AttributeTable",
      //   layer: selectedLayerInfo
      // });
      this.attrWidget.showRelatedRecordsFromPopup(selectedLayerInfo, [featureKey]);
    },

    _onSelectionChange: function(selectedFeature) {
      if(this.layerInfos &&
          selectedFeature._layer &&
          selectedFeature._layer.relationships &&
          (selectedFeature._layer.relationships.length > 0)) {
        var layerInfo = this.layerInfos.getLayerInfoById(selectedFeature._layer.id);
        if(layerInfo) {
          layerInfo.getRelatedTableInfoArray()
          .then(lang.hitch(this, function(relatedTableInfoArray) {
            if(relatedTableInfoArray.length > 0) {
              this.showRelatedTableBtn.enableButtonNode();
            } else {
              this.showRelatedTableBtn.disableButtonNode();
            }
          }));
        } else {
          this.showRelatedTableBtn.disableButtonNode();
        }
      } else {
        this.showRelatedTableBtn.disableButtonNode();
      }
    },

    destroy: function() {
      this.showRelatedTableBtn.destroy();
      this.inherited(arguments);
    }

  });
});