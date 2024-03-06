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
        "../../base/ISO19115Descriptor",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/InputTextArea",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./CI_Address",
        "./CI_OnlineResource",
        "./CI_Telephone",
        "../../gmd/PT_FreeText",
        "../../gmd/PT_FreeText_Area",
        "dojo/text!./templates/CI_Contact.html"
    ],
    function (declare, lang, has, Descriptor, Attribute, Element, Tabs, InputTextArea, AbstractObject, GcoElement,
        ObjectReference, CI_Address, CI_OnlineResource, CI_Telephone,PT_FreeText, PT_FreeText_Area, template) {
        var oThisClass = declare(Descriptor, {
            templateString: template
        });
        return oThisClass;
    });