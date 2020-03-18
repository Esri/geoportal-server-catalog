define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/has",
        "./xml/XmlGenerator"],
function(declare, lang, array, domClass, domConstruct, has, XmlGenerator) {

  var oThisClass = declare(null, {

    _hasNamespaces: null,

    datestamp: null,
    documentType: null,
    gxeContext: null,
    isViewOnly: false,
    originalTitle: null,
    rootDescriptor: null,
    rootElement: null,
    
    ArcGISFormat: null,
    ArcGISProfile: null,
    ArcGISStyle: null,
    isAgsItemDescription: false,
    isAgsFGDC: false,
    isAgsISO19139: false,
    isAgsINSPIRE: false,
    isAgsNAP: false,

    constructor: function(args) {
      this.datestamp = new Date();
      lang.mixin(this, args);
    },

    afterInitializeAttribute: function(attribute) {
      if(this.documentType) {
        this.documentType.afterInitializeAttribute(this, attribute);
      }
    },

    afterInitializeElement: function(element) {
      if(this.documentType) {
        this.documentType.afterInitializeElement(this, element);
      }
    },

    beforeInitializeAttribute: function(attribute) {
      if(this.documentType) {
        this.documentType.beforeInitializeAttribute(this, attribute);
      }
    },

    beforeInitializeElement: function(element) {
      if(this.documentType) {
        this.documentType.beforeInitializeElement(this, element);
      }
    },

    generateXml: function(validationTracker, transformer) {
      var generator = new XmlGenerator({});
      return generator.generate(this, this.rootElement, validationTracker, transformer);
    },

    getNamespaces: function() {
      if(this.documentType) {
        return this.documentType.getNamespaces();
      }
      return null;
    },

    hasNamespaces: function() {
      var a, b = false;
      if(this._hasNamespaces === null) {
        a = this.getNamespaces();
        if((a !== null) && (a.length > 0)) {
          b = true;
        }
        this._hasNamespaces = b;
      }
      return this._hasNamespaces;
    },

    initialize: function(documentType, node, xmlDocument) {
      this.documentType = documentType;
      this.rootDescriptor = documentType.newRootDescriptor(this, xmlDocument);
      this.rootDescriptor._isGxeRootDescriptor = true;
      this.rootDescriptor.gxeDocument = this;
      if(node) {
        domConstruct.place(this.rootDescriptor.domNode, node, "replace");
        this.rootDescriptor.startup();
        if(this.rootElement && this.rootElement.elementHeader) {
          domClass.add(this.rootElement.elementHeader.domNode, "gxeRootLabel");
        }
      }
    }

  });

  return oThisClass;
});