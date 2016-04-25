define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/i18n!app/nls/resources",
        "app/common/ModalDialog"], 
function(declare, lang, i18n, ModalDialog) {

  var oThisClass = declare([ModalDialog], {
    
    i18n: i18n,
    
    showOkCancel: true,
    hideOnOk: true,
    showOk: true,
    showCancel: false,
    
    postCreate: function() {
      this.inherited(arguments);
    }

  });

  return oThisClass;
});