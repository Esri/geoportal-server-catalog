/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 TODO: _i _b _d G.evalDate G.evalDates crs makeEnvelope evalIsoService evalIsoTemporal evalResourceLinks checkResourceLink
 */

/*
 TODO: _i _b _d G.evalDate G.evalDates crs makeEnvelope evalIsoService evalIsoTemporal evalResourceLinks checkResourceLink
 */
load("classpath:metadata/js/EvaluatorBase.js");
load("classpath:metadata/js/EvaluatorFor_ArcGIS.js");
load("classpath:metadata/js/EvaluatorFor_DC.js");
load("classpath:metadata/js/EvaluatorFor_FGDC.js");
load("classpath:metadata/js/EvaluatorFor_ISO.js");
load("classpath:metadata/js/EvaluatorFor_ISO_extended.js"); // add  extended class
load("classpath:metadata/js/GML.js");

G._metadataTypes =  {
  "iso19115base": {
    key: "iso19115",
    evaluator: G.evaluators.iso,
    interrogationXPath: "", // will never be triggered. We will just extend it.
    identifier: "http://www.isotc211.org/2005/gmd",
    detailsXslt: "metadata/details/iso-details/xml-to-html-ISO.xsl",
    //xsdLocation: "http://www.ngdc.noaa.gov/metadata/published/xsd/schema.xsd",
    //schematronXslt: "metadata/schematron/Gemini2_R2r2-schematron.xslt",
    toKnownXslt: null
  },
  /* example extension of the ISO evaluator
   */
  "iso19115extended": {
    key: "iso19115extended",
    evaluator: G.evaluators.isoextended,
    interrogationXPath: "/gmd:MD_Metadata/gmd:dataSetURI/gco:CharacterString[starts-with(text(),'https://www.sciencebase.gov/catalog/')] | /gmi:MI_Metadata/gmd:dataSetURI/gco:CharacterString[starts-with(text(),'https://www.sciencebase.gov/catalog/')]",
    identifier: "http://www.isotc211.org/2005/gmd",
    detailsXslt: "metadata/details/iso-details/xml-to-html-ISO.xsl",
    //xsdLocation: "http://www.ngdc.noaa.gov/metadata/published/xsd/schema.xsd",
    //schematronXslt: "metadata/schematron/Gemini2_R2r2-schematron.xslt",
    toKnownXslt: null
  },
  "iso19115": {
    key: "iso19115",
    evaluator: G.evaluators.iso,
    interrogationXPath: "/gmd:MD_Metadata",
    identifier: "http://www.isotc211.org/2005/gmd",
    detailsXslt: "metadata/details/iso-details/xml-to-html-ISO.xsl",
    //xsdLocation: "http://www.ngdc.noaa.gov/metadata/published/xsd/schema.xsd",
    //schematronXslt: "metadata/schematron/Gemini2_R2r2-schematron.xslt",
    toKnownXslt: null
  },
  "iso19115-2": {
    key: "iso19115-2",
    evaluator: G.evaluators.iso,
    interrogationXPath: "/gmi:MI_Metadata",
    identifier: "http://www.isotc211.org/2005/gmi",
    detailsXslt: "metadata/details/iso-details/xml-to-html-ISO.xsl",
    xsdLocation: null,
    schematronXslt: null
  },
  "fgdc": {
    key: "fgdc",
    evaluator: G.evaluators.fgdc,
    interrogationXPath: "/metadata/idinfo/citation",
    identifier: "FGDC-STD-001-1998",
    detailsXslt: "metadata/details/fgdc-details.xslt",
  },
  "dc": {
    key: "dc",
    evaluator: G.evaluators.dc,
    interrogationXPath: "/rdf:RDF/rdf:Description/dc:title",
    identifier: "http://purl.org/dc/elements/1.1/",
    detailsXslt: "metadata/details/rdf-details.xslt",
    //toKnownXslt: "metadata/xslt/qualifiedDCToISO19139v1.0.xslt",
  },
  "arcgis": {
    key: "arcgis",
    evaluator: G.evaluators.arcgis,
    interrogationXPath: "/metadata/Esri/ArcGISFormat",
    identifier: "ArcGIS-Metadata",
    detailsXslt: "metadata/details/arcgis-details.xslt",
  },
  "oai_dc": {
    key: "oai_dc",
    evaluator: G.evaluators.dc,
    interrogationXPath: "/oai_dc:dc/dc:title",
    identifier: "http://www.openarchives.org/OAI/2.0/oai_dc/",
    detailsXslt: "metadata/details/rdf-details.xslt",
    //toKnownXslt: "metadata/xslt/qualifiedDCToISO19139v1.0.xslt",
  }
};

G._initializeTask = function(mdoc) {
  var nsmap = new java.util.HashMap();
  nsmap.put("gmd","http://www.isotc211.org/2005/gmd");
  nsmap.put("gmi","http://www.isotc211.org/2005/gmi");
  nsmap.put("gco","http://www.isotc211.org/2005/gco");

  nsmap.put("gml","http://www.opengis.net/gml");
  nsmap.put("gml32","http://www.opengis.net/gml/3.2");
  nsmap.put("srv","http://www.isotc211.org/2005/srv");
  nsmap.put("gmx","http://www.isotc211.org/2005/gmx");
  nsmap.put("gsr","http://www.isotc211.org/2005/gsr");
  nsmap.put("gss","http://www.isotc211.org/2005/gss");
  nsmap.put("gts","http://www.isotc211.org/2005/gts");
  nsmap.put("xlink","http://www.w3.org/1999/xlink");
  nsmap.put("rdf","http://www.w3.org/1999/02/22-rdf-syntax-ns#");
  nsmap.put("dc","http://purl.org/dc/elements/1.1/");
  nsmap.put("dct","http://purl.org/dc/terms/");
  nsmap.put("ows","http://www.opengis.net/ows");
  nsmap.put("ows2","http://www.opengis.net/ows/2.0");
  nsmap.put("atom","http://www.w3.org/2005/Atom");
  nsmap.put("oai_dc","http://www.openarchives.org/OAI/2.0/oai_dc/");
  nsmap.put("doc","http://www.lyncode.com/xoai");
  var xpath = javax.xml.xpath.XPathFactory.newInstance().newXPath();
  xpath.setNamespaceContext(new com.esri.geoportal.base.xml.XmlNamespaceContext(nsmap));

  var gptContext = com.esri.geoportal.context.GeoportalContext.getInstance();
  
  var task = {
      mdoc: mdoc,
      item: {},
      xpath: xpath,
      parseGml: gptContext.getParseGml(),
      suppliedJson: JSON.parse(mdoc.getSuppliedJson())
  };
  if (mdoc && mdoc.hasXml()) {
    task.dom = task.mdoc.ensureDom();
    task.root = task.dom.getDocumentElement();
  }
  return task;
};

G._interrogate = function(mdoc) {
  var task = G._initializeTask(mdoc);
  var type = null, mdType;
  var i, t, keys = Object.keys(G._metadataTypes);
  if (mdoc.hasXml() && keys) {
    for (i=0;i<keys.length;i++) {
      t = G._metadataTypes[keys[i]];
      if (t.interrogationXPath) {
        if (G.hasNode(task,task.dom,t.interrogationXPath)) {
          type = t;
          break;
        }
      }
    }
  }
  if (type) {
    var mdtype = new com.esri.geoportal.base.metadata.MetadataType();
    mdtype.setKey(type.key);
    if (type.identifier) mdtype.setIdentifier(type.identifier);
    if (type.detailsXslt) mdtype.setDetailsXslt(type.detailsXslt);
    if (type.xsdLocation) mdtype.setXsdLocation(type.xsdLocation);
    if (type.schematronXslt) mdtype.setSchematronXslt(type.schematronXslt);
    if (type.toKnownXslt) mdtype.setToKnownXslt(type.toKnownXslt);
    if (type.evaluator && type.evaluator.version) {
      mdtype.setEvaluatorVersion(type.evaluator.version);
    }
    mdoc.setMetadataType(mdtype);
  }
};

G._evaluate = function(mdoc) {
  var task = G._initializeTask(mdoc);
  var key = mdoc.getMetadataType().getKey();
  var metadataType = G._metadataTypes[key];
  if (metadataType && metadataType.evaluator) {
    metadataType.evaluator.evaluate(task);
    if (typeof task.item.title === "string") {
      task.mdoc.setTitle(task.item.title);
    }
    task.mdoc.setEvaluatedJson(JSON.stringify(task.item));
    //print(JSON.stringify(task.item));
  } else {
    // TODO log
    print("No metadata evaluator for key: "+key);
  }
};

G._getDetailsXslt = function(key) {
  var metadataType = G._metadataTypes[key];
  if (metadataType && metadataType.detailsXslt) {
    return metadataType.detailsXslt;
  }
  return null;
};

function evaluate(mdoc) {
  G._evaluate(mdoc);
}

function getDetailsXslt(key) {
  return G._getDetailsXslt(key);
}

function interrogate(mdoc) {
  G._interrogate(mdoc);
}



