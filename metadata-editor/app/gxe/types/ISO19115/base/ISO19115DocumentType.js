define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "esri/dijit/metadata/types/iso/base/IsoDocumentType",
        "./PortalItemTransformer",
        "dojo/i18n!../nls/i18nISO19115",
        "esri/dijit/metadata/form/InputSelectOne"],
function(declare, lang, domConstruct, DocumentType, PortalItemTransformer, i18nISO19115,
  InputSelectOne) {

  var oThisClass = declare(DocumentType, {

    caption: null,
    key: null,
    isService: false,
    metadataStandardName: null,
    metadataStandardVersion: null,
    
    afterInitializeElement: function(gxeDocument, element) {
      var p = element.gxePath;
      //title for file to download
      if (p === "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString"){
        element.isDocumentTitle=true;
      }


     /*  if (p === "/gmd:MD_Metadata/gmd:language/gco:CharacterString" ||
       p === "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:language/gco:CharacterString"||
       p === "/gmi:MI_Metadata/gmd:language/gco:CharacterString" ||
       p === "/gmi:MI_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:language/gco:CharacterString"
       ) {
        // switch from an input textbox to a dropdown list
        this.switchToLanguageList(gxeDocument,element);
      } else {
        this.inherited(arguments);
      }
 */

    },

    beforeInitializeAttribute: function(gxeDocument, attribute) {
      var p = attribute.gxePath;

      if (!this.isService && (p === "/gmd:MD_Metadata/gmd:hierarchyLevel/gmd:MD_ScopeCode/@codeListValue")) {
        // show only a subset of options
        // attribute.optionsFilter = "dataset,series";
      } else if(!this.isService && (p === "/gmd:MD_Metadata/gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:scope/gmd:DQ_Scope/gmd:level/gmd:MD_ScopeCode/@codeListValue")) {
        // show only a subset of options
        // attribute.optionsFilter = "dataset,series";
      } else {
        this.inherited(arguments);
      }
    },

    beforeInitializeElement: function (gxeDocument, element) {
      var has = element.gxePath,
          DocumentType = gxeDocument.rootElement.gxePath;
     
      this.isService && has === DocumentType + "/gmd:hierarchyLevel" ? element.maxOccurs = 1 : this.isService && has === DocumentType + "/gmd:hierarchyLevelName" ? element.maxOccurs = 1 : has === DocumentType + "/gmd:metadataStandardName/gco:CharacterString" ? this.metadataStandardName && (element.value = this.metadataStandardName) : has === DocumentType + "/gmd:metadataStandardVersion/gco:CharacterString" ? this.metadataStandardVersion && (element.value = this.metadataStandardVersion) : has === DocumentType + "/gmd:identificationInfo/srv:SV_ServiceIdentification/srv:extent/gmd:EX_Extent/gmd:geographicElement" ? element.minOccurs = 0 : this.inherited(arguments)
  },
    
    newPortalItemTransformer: function(gxeDocument) {
      return new PortalItemTransformer();
    },
    
    /* switchToLanguageList: function(gxeDocument,element) {
      // switch from an input textbox to a dropdown list
      if (element.inputWidget) element.inputWidget.destroyRecursive(false);
      var iw = new InputSelectOne({},element.containerNode);
      iw.focusNode.add(new Option(i18nISO19115.language.bg,"bg"));
      iw.focusNode.add(new Option(i18nISO19115.language.cs,"cs"));
      iw.focusNode.add(new Option(i18nISO19115.language.da,"da"));
      iw.focusNode.add(new Option(i18nISO19115.language.nl,"nl"));
      iw.focusNode.add(new Option(i18nISO19115.language.en,"en"));
      iw.focusNode.add(new Option(i18nISO19115.language.et,"et"));
      iw.focusNode.add(new Option(i18nISO19115.language.fi,"fi"));
      iw.focusNode.add(new Option(i18nISO19115.language.fr,"fr"));
      iw.focusNode.add(new Option(i18nISO19115.language.ga,"ga"));
      iw.focusNode.add(new Option(i18nISO19115.language.de,"de"));
      iw.focusNode.add(new Option(i18nISO19115.language.el,"el"));
      iw.focusNode.add(new Option(i18nISO19115.language.hu,"hu"));
      iw.focusNode.add(new Option(i18nISO19115.language.it,"it"));
      iw.focusNode.add(new Option(i18nISO19115.language.lv,"lv"));
      iw.focusNode.add(new Option(i18nISO19115.language.lt,"lt"));
      iw.focusNode.add(new Option(i18nISO19115.language.mt,"mt"));
      iw.focusNode.add(new Option(i18nISO19115.language.pl,"pl"));
      iw.focusNode.add(new Option(i18nISO19115.language.pt,"pt"));
      iw.focusNode.add(new Option(i18nISO19115.language.ro,"ro"));
      iw.focusNode.add(new Option(i18nISO19115.language.sk,"sk"));
      iw.focusNode.add(new Option(i18nISO19115.language.sl,"sl"));
      iw.focusNode.add(new Option(i18nISO19115.language.es,"es"));
      iw.focusNode.add(new Option(i18nISO19115.language.sv,"sv"));
      element.inputWidget = iw;
      iw.parentXNode = element;
      iw.connectXNode(element,false);
    }, */

    initializeNamespaces: function() {
      this.addNamespace("gmi", "http://www.isotc211.org/2005/gmi"),
      this.addNamespace("gmd", "http://www.isotc211.org/2005/gmd"),
      this.addNamespace("gco", "http://www.isotc211.org/2005/gco"),
      this.addNamespace("srv", "http://www.isotc211.org/2005/srv"),
      this.addNamespace("gss", "http://www.isotc211.org/2005/gss"),
      this.addNamespace("gml", "http://www.opengis.net/gml/3.2"),
      this.addNamespace("xlink", "http://www.w3.org/1999/xlink")
      this.addNamespace("xsi", "http://www.w3.org/2001/XMLSchema-instance")
    },

  });

  return oThisClass;
});