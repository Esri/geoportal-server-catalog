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
load("classpath:search/js/WriterBase.js");

G.writers.csw = {
  
  writeItem: function(appRequest,appResponse,itemId,itemString,responseString) {
    var now = G.nowAsString();
    var options = {now:now, entryOnly:true};
    this._marshallOptions(appRequest,options);
    var xmlBuilder = G.newXmlBuilder();
    xmlBuilder.writeStartDocument();
    this._writeEntry(appRequest,itemId,itemString,xmlBuilder,options);
    xmlBuilder.writeEndDocument();
    this._writeAppResponse(appRequest,appResponse,xmlBuilder);
  },
  
  writeItems: function(searchRequest,appResponse,searchResponse) {
    var searchHits = searchResponse.getHits();
    var now = G.nowAsString();
    var options = {now:now, entryOnly:false};
    this._marshallOptions(searchRequest,options);
    var xmlBuilder = G.newXmlBuilder();
    xmlBuilder.writeStartDocument();
    
    var hits = searchHits.getHits();
    var numReturned = hits.length;
    var totalHits = searchHits.getTotalHits();
    var from = searchRequest.getFrom();
    var size = searchRequest.getSize();
    
    var nextRecord = -1; // TODO 0 if inputIndexOffset = 1 ??
    if (numReturned === 0 && totalHits > 0) {
      nextRecord = searchRequest.getInputIndexOffset();
    } else if (numReturned > 0) {
      nextRecord = from + size;
      if (nextRecord >= totalHits) {
        nextRecord = -1;
      } 
    }
    
    xmlBuilder.writer.writeStartElement("csw","GetRecordsResponse",G.URI_CSW);
    this._addNamespaces(xmlBuilder);
    xmlBuilder.writer.writeStartElement(G.URI_CSW,"SearchStatus");
    xmlBuilder.writer.writeAttribute("timestamp",now);
    xmlBuilder.writer.writeEndElement();
    
    xmlBuilder.writer.writeStartElement(G.URI_CSW,"SearchResults");
    xmlBuilder.writer.writeAttribute("numberOfRecordsMatched",""+totalHits);
    xmlBuilder.writer.writeAttribute("numberOfRecordsReturned",""+numReturned);
    xmlBuilder.writer.writeAttribute("nextRecord",""+nextRecord);
    xmlBuilder.writer.writeAttribute("recordSchema",G.URI_CSW);
    if (options.elementSetName != null && options.elementSetName.length > 0) {
      xmlBuilder.writer.writeAttribute("elementSetName",options.elementSetName);
    }
    var i,hit;
    for (i=0;i<numReturned;i++) {
      hit = hits[i];
      this._writeEntry(searchRequest,hit.getId(),hit.getSourceAsString(),xmlBuilder,options);
    }
    xmlBuilder.writer.writeEndElement();

    xmlBuilder.writer.writeEndElement();
    xmlBuilder.writeEndDocument();
    this._writeAppResponse(searchRequest,appResponse,xmlBuilder);
  },
  
  _addElement: function(namespaceURI,localName,scheme,value,xmlBuilder) {
    this._addElements(namespaceURI,localName,scheme,value,xmlBuilder);
  },
  
  _addElements: function(namespaceURI,localName,scheme,value,xmlBuilder) {
    if (typeof value === "undefined" || value === null) return;
    if (typeof value === "string") {
      xmlBuilder.writer.writeStartElement(namespaceURI,localName);
      if (scheme !== null && scheme.length > 0) {
        xmlBuilder.writer.writeAttribute("scheme",scheme);
      }
      xmlBuilder.writer.writeCharacters(value);
      xmlBuilder.writer.writeEndElement();
    } else if (typeof value.push === "function") {
      try {
        var i,v;
        for (i=0;i<value.length;i++) {
          v = G.chkStr(value[i]);
          if (v !== null) {
            xmlBuilder.writer.writeStartElement(namespaceURI,localName);
            if (scheme !== null && scheme.length > 0) {
              xmlBuilder.writer.writeAttribute("scheme",scheme);
            }
            xmlBuilder.writer.writeCharacters(v);
            xmlBuilder.writer.writeEndElement();
          }
        }
      } catch(e) {
        print(e);
      }
    }
  },
  
  _addLink: function(rel,type,href,xmlBuilder) {
    if ((href === null) || (href.length === 0)) return;
    this._addElement(G.URI_DCT,"references",rel,href,xmlBuilder);
  },
  
  _addNamespaces: function(xmlBuilder) {
    xmlBuilder.writer.writeNamespace("csw",G.URI_CSW);
    xmlBuilder.writer.writeNamespace("dc",G.URI_DC);
    xmlBuilder.writer.writeNamespace("dct",G.URI_DCT);
    xmlBuilder.writer.writeNamespace("ows",G.URI_OWS);
  },
  
  _marshallOptions: function(appRequest,options) {
    options.recordTypeName = "Record";
    //options.elementSetName = "summary";
    var rtn = G.chkStr(appRequest.getData().get("recordTypeName"));
    var esn = G.chkStr(appRequest.getData().get("elementSetName"));
    if (rtn !== null && rtn.length > 0) options.recordTypeName = rtn;
    if (esn !== null && esn.length > 0) options.elementSetName = esn;
  },
  
  _writeAppResponse: function(appRequest,appResponse,xmlBuilder) {
    var xml = xmlBuilder.getXml();
    if (appRequest.getPretty()) xml = G.XmlUtil.indent(xml);
    appResponse.setOk();
    appResponse.setMediaType(G.MediaType.APPLICATION_XML_TYPE.withCharset("UTF-8"));
    appResponse.setEntity(xml);
  },
  
  _writeEntry: function(request,itemId,itemString,xmlBuilder,options) {
    var i,v;
    var item = JSON.parse(itemString);
    var recordTypeName = options.recordTypeName;
    if (options.entryOnly) {
      xmlBuilder.writer.writeStartElement("csw",recordTypeName,G.URI_CSW);
      this._addNamespaces(xmlBuilder);
    } else {
      xmlBuilder.writer.writeStartElement(G.URI_CSW,recordTypeName);
    }
    
    var title = G.chkStr(item["title"]);
    var description = G.chkStr(item["description"]);
    var itemType = G.chkStr(item["itemType"]); // TODO
    var owner = G.chkStr(item["sys_owner_s"]);
    var created = G.chkStr(item["sys_created_dt"]);
    var modified = G.chkStr(item["sys_modified_dt"]);
    var keywords = G.chkStrArray(item["keywords_s"]);
    var credits = G.chkStrArray(item["credits_s"]);
    var rights = G.chkStrArray(item["rights_s"]);
    var extent = item["envelope_geo"];
    var links = G.buildLinks(request,itemId,item);
    
    if (title === null || title.length === 0) title = "Empty";
    
    xmlBuilder.writeElement(G.URI_DC,"identifier",itemId);
    xmlBuilder.writeElement(G.URI_DC,"title",title);
    xmlBuilder.writeElement(G.URI_DC,"type",itemType);
    
    if (recordTypeName !== "BriefRecord") {
      this._addElements(G.URI_DC,"subject","keywords",keywords,xmlBuilder);
      // dc:format (summary) TODO
      // dc:relation (summary)
      xmlBuilder.writeElement(G.URI_DCT,"modified",modified);
      xmlBuilder.writeElement(G.URI_DCT,"abstract",description);
      // dct:spatial (summary)
      if (recordTypeName !== "SummaryRecord") {
        xmlBuilder.writeElement(G.URI_DC,"creator",owner);
        xmlBuilder.writeElement(G.URI_DCT,"created",created);
        this._addElements(G.URI_DC,"contributor",null,credits,xmlBuilder);
        this._addElements(G.URI_DC,"rights",null,rights,xmlBuilder);
      }
      if (links != null) {
        for (i=0;i<links.length;i++) {
          v = links[i];
          this._addLink(v.rel,v.type,v.href,xmlBuilder);
        }
      }
    }

    // TODO this.isApplicable("ows:BoundingBox")
    if (extent && extent.type && extent.type === "envelope" && extent.coordinates && extent.coordinates.length === 2) {
      var topLeft = extent.coordinates[0];
      var bottomRight = extent.coordinates[1];
      if (topLeft != null && topLeft.length === 2 && bottomRight != null && bottomRight.length === 2) {
        var coordinates = [topLeft[0],bottomRight[1],bottomRight[0],topLeft[1]];
        xmlBuilder.writer.writeStartElement(G.URI_OWS,"BoundingBox");
        xmlBuilder.writeElement(G.URI_OWS,"LowerCorner",coordinates[0]+" "+coordinates[1]);
        xmlBuilder.writeElement(G.URI_OWS,"UpperCorner",coordinates[2]+" "+coordinates[3]);
        xmlBuilder.writer.writeEndElement();
      }
    }
    
    // csw:TemporalExtent (summary)
    // TODO resource time period??
    
    xmlBuilder.writer.writeEndElement();
  }
  
}

function writeItem(appRequest,appResponse,itemId,itemString,responseString) {
  G.writers.csw.writeItem(appRequest,appResponse,itemId,itemString,responseString);
}

function writeItems(searchRequest,appResponse,searchResponse) {
  G.writers.csw.writeItems(searchRequest,appResponse,searchResponse);
}
