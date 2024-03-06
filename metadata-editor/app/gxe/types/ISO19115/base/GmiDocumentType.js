// COPYRIGHT © 2021 Esri
//
// All rights reserved under the copyright laws of the United States
// and applicable international laws, treaties, and conventions.
//
// This material is licensed for use under the Esri Master License
// Agreement (MLA), and is bound by the terms of that agreement.
// You may redistribute and use this code without modification,
// provided you adhere to the terms of the MLA and include this
// copyright notice.
//
// See use restrictions at http://www.esri.com/legal/pdfs/mla_e204_e300/english
//
// For additional information, contact:
// Environmental Systems Research Institute, Inc.
// Attn: Contracts and Legal Services Department
// 380 New York Street
// Redlands, California, USA 92373
// USA
//
// email: contracts@esri.com
//
// See http://js.arcgis.com/3.38/esri/copyright.txt for details.

define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/has",
    "./ISO19115DocumentType",
    "./GmiRoot",
    "dojo/i18n!../nls/i18nISO19115"
], (function (declare, lang, has, DocumentType, RootDescriptor, i18nISO19115) {
    var oThisClass = declare(DocumentType, {
        caption: i18nISO19115.documentTypes.gmi.caption,
        description: i18nISO19115.documentTypes.gmi.description,
        key: "ISO19115-2",
        isService: !1,
        isGmi: !0,
        metadataStandardName: "ISO 19115-2 Geographic Information - Metadata Part 2 Extensions for imagery and gridded data",
        metadataStandardVersion: "ISO 19115-2:2009(lang)",

        afterInitializeElement: function(gxeDocument, element) {
            var p = element.gxePath;
            //title for file to download
            if (p === "/gmi:MI_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString"){
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
           } */
     
        },

        initializeNamespaces: function () {
            this.addNamespace("gmi", "http://www.isotc211.org/2005/gmi"),
            this.addNamespace("gmd", "http://www.isotc211.org/2005/gmd"),
            this.addNamespace("gco", "http://www.isotc211.org/2005/gco"),
            this.addNamespace("srv", "http://www.isotc211.org/2005/srv"),
            this.addNamespace("gss", "http://www.isotc211.org/2005/gss"),
            this.addNamespace("gml", "http://www.opengis.net/gml/3.2"),
            this.addNamespace("xlink", "http://www.w3.org/1999/xlink")
            this.addNamespace("xsi", "http://www.w3.org/2001/XMLSchema-instance")
            
        },
        newRootDescriptor: function () {
            return new RootDescriptor
        }
    });
    return oThisClass;
}));