define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/has",
        "esri/dijit/metadata/base/Templated",
        "../context/DescriptorMixin"],
function(declare, lang, array, has, Templated, DescriptorMixin) {

  var oThisClass = declare([Templated, DescriptorMixin], {

    _escapeSingleQuotes: true,
    _isGxeDescriptor: true,
    _replicas: null,

    postscript: function() {
      this.inherited(arguments);
    },

    postCreate: function() {
      this.inherited(arguments);
      this._replicas = [];
    },

    destroy: function() {
      try {
        array.forEach(this._replicas, function(r) {
          try {
            r.destroyRecursive(false);
          } catch(ex2) {
            console.error(ex2);
          }
        });
      } catch(ex) {
        console.error(ex);
      }
      this._replicas = [];
      this.inherited(arguments);
    },

    newInstance: function() {
      // TODO validate this approach
      var descriptor = new this.constructor();
      this._replicas.push(descriptor);
      return descriptor;
    }

  });

  return oThisClass;
});