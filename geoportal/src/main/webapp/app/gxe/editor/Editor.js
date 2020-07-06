define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/on",
        "dojo/keys",
        "dojo/_base/event",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/has",
        "dijit/Viewport",
        "esri/dijit/metadata/context/GxeAdaptor",
        "esri/dijit/metadata/context/GxeContext",
        "esri/dijit/metadata/base/etc/viewOnlyUtil",
        "../base/XDocument",
        "esri/dijit/metadata/base/xml/XmlImporter",
        "esri/dijit/metadata/types/arcgis/base/arcgisStyles",
        "esri/dijit/metadata/editor/EditorResizeMixin",
        "esri/dijit/metadata/base/Templated",
        "dojo/text!esri/dijit/metadata/editor/templates/Editor.html",
        "esri/dijit/metadata/editor/PrimaryToolbar",
        "esri/dijit/metadata/editor/ValidationPane",
        "esri/dijit/metadata/editor/EditDocumentPane",
        "esri/dijit/metadata/editor/ViewDocumentPane",
        "esri/dijit/metadata/editor/XmlPane",
        "esri/dijit/Geocoder",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/ElementChoice",
        "esri/dijit/metadata/form/HiddenAttribute",
        "esri/dijit/metadata/form/HiddenElement",
        "esri/dijit/metadata/form/OpenElement",
        "esri/dijit/metadata/form/InputDate",
        "esri/dijit/metadata/form/InputDelimitedTextArea",
        "esri/dijit/metadata/form/InputNumber",
        "esri/dijit/metadata/form/InputSelectMany",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/InputText",
        "esri/dijit/metadata/form/InputTextArea",
        "esri/dijit/metadata/form/IsoTopicCategoryOptions",
        "esri/dijit/metadata/form/Option",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Section",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/tools/ClickableTool",
        "esri/dijit/metadata/form/tools/ClickableValueTool",
        "esri/dijit/metadata/types/arcgis/form/InputCheckBox",
        "esri/dijit/metadata/types/arcgis/form/InputDate",
        "esri/dijit/metadata/types/arcgis/form/InputHtmlArea",
        "esri/dijit/metadata/types/arcgis/form/InputSelectBoolean",
        "esri/dijit/metadata/types/arcgis/form/InputSelectCode",
        "esri/dijit/metadata/types/arcgis/form/InputSysTime"],
function(declare, lang, Deferred, on, keys, djEvent, domClass, domConstruct, domStyle, has, 
         Viewport, GxeAdaptor, GxeContext, viewOnlyUtil, XDocument, XmlImporter, arcgisStyles,
         EditorResizeMixin, Templated, template) {

  var oThisClass = declare([Templated, EditorResizeMixin], {

    dialogBroker: null,
    gxeAdaptor: null,
    gxeContext: null,
    templateString: template,

    postCreate: function() {
      this.inherited(arguments);
      if(!this.gxeAdaptor) {
        this.gxeAdaptor = new GxeAdaptor();
      }
      if(!this.gxeContext) {
        this.gxeContext = new GxeContext();
      }
      this.primaryToolbar.editor = this;
      this.primaryToolbar.lastSavedXml = this.gxeAdaptor.getOriginalXml();
      this.validationPane.editor = this;
      this.xmlPane.setXml(this.gxeAdaptor.getOriginalXml(), "metadata");
      this.primaryToolbar.initialize();
      if(!this.dialogBroker) {
        this.own(Viewport.on("resize", lang.hitch(this, "resize")));
      }

      if(!this.isLeftToRight()) {
        domClass.add(this.domNode, "gxeRtl");
      }

      // prevent a backspace page navigation
      this.own(on(document, "keydown, keypress", lang.hitch(this, function(evt) {
        if(evt.keyCode === keys.BACKSPACE) {
          if((evt.target.size === undefined) && (evt.target.rows === undefined)) {
            djEvent.stop(evt);
          }
        }
      })));
    },

    destroy: function() {
      try {
        if(this.viewDocumentPane.gxeDocument && this.viewDocumentPane.gxeDocument.rootDescriptor) {
          this.viewDocumentPane.gxeDocument.rootDescriptor.destroyRecursive(false);
        }
      } catch(ex) {
        console.error(ex);
      }
      try {
        if(this.editDocumentPane.gxeDocument && this.editDocumentPane.gxeDocument.rootDescriptor) {
          this.editDocumentPane.gxeDocument.rootDescriptor.destroyRecursive(false);
        }
      } catch(ex) {
        console.error(ex);
      }
      this.inherited(arguments);
    },

    getEditDocument: function() {
      return this.editDocumentPane.gxeDocument;
    },

    getViewDocument: function() {
      return this.viewDocumentPane.gxeDocument;
    },

    initializeView: function() {
      this.primaryToolbar.initializeView();
    },

    _loadDocumentPane: function(documentPane, documentType, xmlDocument, asTemplate, wasFromOriginalXml) {
      //var t1 = new Date();
      var doc = null, isViewOnly = false, wasConstructed = false;
      var deferred = new Deferred();
      if(documentPane === this.editDocumentPane) {
        this.validationPane.clearMessages();
      } else {
        isViewOnly = true;
      }
      try {
        var importer;
        var curDoc = documentPane.gxeDocument;
        var nd = domConstruct.create("div", {}, documentPane.rootContainer);
        //var nd = domConstruct.create("div", {});
        doc = new XDocument({gxeContext: this.gxeContext, isViewOnly: isViewOnly, _editor: this});
        doc.initialize(documentType, nd, xmlDocument);
        if(xmlDocument) {
          importer = new XmlImporter();
          importer.importDocument(doc, xmlDocument, asTemplate);
        }
        //if (isViewOnly) throw new Error("Exception test");
        if(curDoc) {
          domStyle.set(curDoc.rootDescriptor.domNode, "display", "none");
          if(curDoc.rootDescriptor) {
            curDoc.rootDescriptor.destroyRecursive(false);
          }
        }
        wasConstructed = true;
        documentPane.gxeDocument = doc;
        domStyle.set(nd, "display", "");
        domStyle.set(documentPane.domNode, "display", "");
        if(isViewOnly) {
          viewOnlyUtil.applyViewOnly(doc);
        }

        try {
          if(isViewOnly) {
            this.gxeAdaptor.afterViewDocumentLoad(doc, wasFromOriginalXml);
          } else {
            this.gxeAdaptor.afterEditDocumentLoad(doc, xmlDocument, asTemplate, wasFromOriginalXml);
          }
        } catch(exAfter) {
          console.error(exAfter);
        }

        deferred.resolve(doc);
        this.primaryToolbar.updateUI();
        //var t = ((new Date()).getTime()-t1.getTime())/1000;
        //alert(Math.round(t*100)/100);

      } catch(ex) {
        try {
          if(doc && doc.rootDescriptor && !wasConstructed) {
            domStyle.set(doc.rootDescriptor.domNode, "display", "none");
            doc.rootDescriptor.destroyRecursive(false);
          }
        } catch(ex2) {
        }
        console.error("Error constructing document");
        console.error(ex);
        deferred.reject(ex);
      }
      return deferred;
    },

    loadEditor: function(documentType, xmlDocument, asTemplate, wasFromOriginalXml) {
      this.editDocumentPane.hideMessage();
      if (documentType && xmlDocument && (documentType.key === "arcgis")) {
        arcgisStyles.preLoad(this.gxeContext,xmlDocument);
      }
      return this._loadDocumentPane(
        this.editDocumentPane, documentType, xmlDocument, asTemplate, wasFromOriginalXml);
    },

    loadView: function(documentType, xmlDocument, wasFromOriginalXml) {
      return this._loadDocumentPane(
        this.viewDocumentPane, documentType, xmlDocument, false, wasFromOriginalXml);
    }

  });

  return oThisClass;
});
