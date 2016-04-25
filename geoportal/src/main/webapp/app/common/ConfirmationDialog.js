define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/on",
        "dojo/i18n!app/nls/resources",
        "app/common/ModalDialog"], 
function(declare, lang, Deferred, on, i18n, ModalDialog) {

  var oThisClass = declare([ModalDialog], {
    
    i18n: i18n,
    
    hideOnOk: false,
    
    _dfd: null,
    _wasOkClicked: false,
    
    postCreate: function() {
      this.inherited(arguments);
      var self = this;
      this.own(on(this,"OkClicked",function() {
        if (self.hideOnOk) {
          self._wasOkClicked = true;
          self.hide();
        } else if (self._dfd && !self._dfd.isFulfilled()) {
          self._wasOkClicked = true;
          self._dfd.resolve(self._wasOkClicked);
        }
      }));
      this.own(on(this,"Hide",function() {
        if (self._dfd && !self._dfd.isFulfilled()) {
          self._dfd.resolve(self._wasOkClicked);
        }
      }));
    },
    
    show: function() {
      this._dfd = new Deferred();
      this.inherited(arguments);
      return this._dfd ;
    }

  });

  return oThisClass;
});