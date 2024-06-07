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
        "./ServiceRoot",
        "dojo/i18n!../nls/i18nISO19115"
    ],
    function (declare, lang, has, DocumentType, RootDescriptor, i18nISO19115) {
        var oThisClass = declare(DocumentType, {
            caption: i18nISO19115.documentTypes.service.caption,
            description: i18nISO19115.documentTypes.service.description,
            key: "iso-19119-2",
            isService: !0,
            metadataStandardName: "ISO 19139/19119 Metadata for Web Services",
            metadataStandardVersion: "2005",
            newRootDescriptor: function () {
                return new RootDescriptor
            },

            afterInitializeElement: function (gxeDocument, element) {
                var p = element.gxePath;
                //title for file to download
                if (p === "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString") {
                    element.isDocumentTitle = true;
                }
                /* if (p === "/gmd:MD_Metadata/gmd:language/gco:CharacterString"){
                    // switch from an input textbox to a dropdown list
                    this.switchToLanguageList(gxeDocument, element);
                } else {
                    this.inherited(arguments);
                } */
            },
        });
        return oThisClass
    });