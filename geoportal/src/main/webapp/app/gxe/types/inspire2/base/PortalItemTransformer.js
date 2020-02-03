define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojo/query",
        "dijit/registry",
        "esri/dijit/metadata/types/iso/base/PortalItemTransformer"],
function(declare, lang, has, query, registry, PortalItemTransformer) {

  var oThisClass = declare([PortalItemTransformer], {

    postCreate: function() {
      this.inherited(arguments);
    },

    findInputWidget: function(name, path, firstOk) {
      if(name !== "tags") {
        return this.inherited(arguments);
      }

      var el, nl2, nl = query(".gxeOtherKeywords", this.gxeDocument.rootDescriptor.domNode);
      if(nl && (nl.length > 0)) {
        nl2 = query("[data-gxe-path='" + path + "']", nl[0]);
        if(nl2 && (nl2.length === 1)) {
          el = registry.byNode(nl2[0]);
          if(el) {
            return el.inputWidget;
          }
        }
      }

      /*
       var el, nl = query("[data-gxe-path='"+path+"']",this.gxeDocument.rootDescriptor.domNode);
       if (nl && (nl.length === 1)) {
       el = registry.byNode(nl[0]);
       if (el) return el.inputWidget;

       } else if (this.isPull && nl && (nl.length === 3) &&
       (path.indexOf("/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword") !== -1)) {
       el = registry.byNode(nl[2]);
       if (el) return el.inputWidget;

       } else if (!this.isPull && nl && (nl.length > 0) &&
       (path.indexOf("/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword") !== -1)) {
       console.warn("***!!! /gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword");
       return null;

       } else if (nl && (nl.length > 0) && firstOk) {
       el = registry.byNode(nl[0]);
       if (el) return el.inputWidget;
       }
       */
      return null;
    }

  });

  return oThisClass;
});