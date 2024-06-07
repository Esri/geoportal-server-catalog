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
        "../base/ISO19115Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListAttribute",
        "esri/dijit/metadata/form/iso/CodeListValueAttribute",
        "esri/dijit/metadata/form/iso/CodeListElement",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/CodeSpaceAttribute",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "../gmd/citation/CI_OnlineFunctionCode",
        "../gmd/PT_FreeText",
        "dojo/text!./templates/ContainsOperations.html"
    ],
    function (declare, lang, has, Descriptor, Element, InputSelectOne, Options, Option, 
        AbstractObject, CodeListAttribute, CodeListValueAttribute, CodeListElement, CodeListReference, 
        CodeSpaceAttribute, GcoElement,ObjectReference, CI_OnlineFunctionCode, PT_FreeText, template) {
        var oThisClass = declare(Descriptor, {
            templateString: template
        });
        return oThisClass;
    });