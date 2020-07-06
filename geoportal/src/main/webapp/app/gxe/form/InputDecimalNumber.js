define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/form/InputNumber",
        "dojo/i18n!esri/dijit/metadata/nls/i18nBase"],
function(declare, lang, has, InputNumber, i18nBase) {

  var oThisClass = declare([InputNumber], {
    DEFAULT_DECIMAL_PLACE: 2,

    postCreate: function() {
      this.inherited(arguments);
    },

    postMixInProperties: function() {
      this.inherited(arguments);
    },
    
    getInputValue: function() {
      var val = this.inherited(arguments)
      var valSplit = val.split(".")
      if (valSplit.length == 1) {
        val = valSplit[0] + "." + "".padEnd(this.decimalPlace || this.DEFAULT_DECIMAL_PLACE, "0")
      } else if (valSplit.length == 2) {
        val = valSplit[0] + "." + valSplit[1].replace(/0+$/, "").padEnd(this.decimalPlace || this.DEFAULT_DECIMAL_PLACE, "0")
      }
      return val
    }

  });

  return oThisClass;
});