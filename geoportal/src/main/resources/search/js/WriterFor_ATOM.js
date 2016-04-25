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

G.writers.atom = {
  
  writeItem: function(appRequest,appResponse,itemId,itemString,responseString) {
    var now = G.nowAsString();
    var options = {now:now,entryOnly:true};
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
    var xmlBuilder = G.newXmlBuilder();
    xmlBuilder.writeStartDocument();
    
    var hits = searchHits.getHits();
    var numReturned = hits.length;
    var totalHits = searchHits.getTotalHits();
    var from = searchRequest.getFrom();
    var size = searchRequest.getSize();
    
    var baseUrl = searchRequest.getBaseUrl();
    var dscUrl = baseUrl+"/opensearch/description"; // TODO
    var feedId = baseUrl;
    var feedTitle = "Results"; // TODO - "Results"
    var authorName = baseUrl;
    
    xmlBuilder.writer.writeStartElement("atom","feed",G.URI_ATOM);
    this._addNamespaces(xmlBuilder);
    xmlBuilder.writeElement(G.URI_ATOM,"title",feedTitle);
    xmlBuilder.writeElement(G.URI_ATOM,"id",feedId); 
    xmlBuilder.writeElement(G.URI_ATOM,"updated",now); 
    xmlBuilder.writer.writeStartElement(G.URI_ATOM,"author");
    xmlBuilder.writeElement(G.URI_ATOM,"name",authorName);
    xmlBuilder.writer.writeEndElement();
    
    this._addLink("search","application/opensearchdescription+xml",dscUrl,xmlBuilder);
    xmlBuilder.writeElement(G.URI_OPENSEARCH,"totalResults",""+totalHits);
    xmlBuilder.writeElement(G.URI_OPENSEARCH,"startIndex",""+from); // TODO startIndex??
    xmlBuilder.writeElement(G.URI_OPENSEARCH,"itemsPerPage",""+size);
    
    this._addQuery(searchRequest,xmlBuilder);
    
    var i,hit;
    for (i=0;i<numReturned;i++) {
      hit = hits[i];
      this._writeEntry(searchRequest,hit.getId(),hit.getSourceAsString(),xmlBuilder,options);
    }
    
    xmlBuilder.writer.writeEndElement();
    xmlBuilder.writeEndDocument();
    this._writeAppResponse(searchRequest,appResponse,xmlBuilder);
  },
  
  _addLink: function(rel,type,href,xmlBuilder) {
    if ((href === null) || (href.length === 0)) return;
    xmlBuilder.writer.writeStartElement(G.URI_ATOM,"link");
    if ((rel != null) && (rel.length > 0)) {
      xmlBuilder.writer.writeAttribute("rel",rel);
    }
    if ((type != null) && (type.length > 0)) {
      xmlBuilder.writer.writeAttribute("type",type);
    }
    xmlBuilder.writer.writeAttribute("href",href);
    xmlBuilder.writer.writeEndElement();
  },

  _addNamespaces: function(xmlBuilder) {
    xmlBuilder.writer.writeNamespace("atom",G.URI_ATOM);
    xmlBuilder.writer.writeNamespace("geo",G.URI_GEO);
    xmlBuilder.writer.writeNamespace("georss",G.URI_GEORSS);
    xmlBuilder.writer.writeNamespace("georss10",G.URI_GEORSS10);
    xmlBuilder.writer.writeNamespace("time",G.URI_TIME);
    xmlBuilder.writer.writeNamespace("opensearch",G.URI_OPENSEARCH);
    xmlBuilder.writer.writeNamespace("dc",G.URI_DC);
  },
  
  _addQuery: function(request,xmlBuilder) {
    var osqQ = request.getParameter("q");
    var osqId = request.getParameter("id");
    var osqBBox = request.getParameter("bbox");
    var osqTime = request.getParameter("time");
    var osqStartIndex = request.getParameter("from");
    var osqCount = request.getParameter("size");
    xmlBuilder.writer.writeStartElement(G.URI_OPENSEARCH,"Query");
    xmlBuilder.writer.writeAttribute("role","request");
    if (osqQ != null && osqQ.length > 0) {
      xmlBuilder.writer.writeAttribute("searchTerms",osqQ);
    }
    if (osqId != null && osqId.length > 0) {
      xmlBuilder.writer.writeAttribute(G.URI_GEO,"uid",osqId);
    }
    if (osqBBox != null && osqBBox.length > 0) {
      xmlBuilder.writer.writeAttribute(G.URI_GEO,"box",osqBBox);
    }
    if (osqTime != null && osqTime.length > 0) {
      xmlBuilder.writer.writeAttribute(G.URI_TIME,"time",osqTime);
    }
    if (osqStartIndex != null && osqStartIndex.length > 0) {
      xmlBuilder.writer.writeAttribute("startIndex",osqStartIndex);
    }
    if (osqCount != null && osqCount.length > 0) {
      xmlBuilder.writer.writeAttribute("count",osqCount);
    }
    xmlBuilder.writer.writeEndElement();
  },
  
  _writeAppResponse: function(appRequest,appResponse,xmlBuilder) {
    var xml = xmlBuilder.getXml();
    if (appRequest.getPretty()) xml = G.XmlUtil.indent(xml);
    appResponse.setOk();
    appResponse.setMediaType(G.MediaType.APPLICATION_ATOM_XML_TYPE.withCharset("UTF-8"));
    appResponse.setEntity(xml);
  },
  
  _writeEntry: function(request,itemId,itemString,xmlBuilder,options) {
    var i,v;
    var item = JSON.parse(itemString);
    if (options.entryOnly) {
      xmlBuilder.writer.writeStartElement("atom","entry",G.URI_ATOM);
      this._addNamespaces(xmlBuilder);
    } else {
      xmlBuilder.writer.writeStartElement(G.URI_ATOM,"entry");
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
    if (description === null || description.length === 0) description = "Empty";
    if (owner === null || owner.length === 0) owner = "Empty";
    
    // atom:id is required
    xmlBuilder.writeElement(G.URI_ATOM,"id",itemId);
    xmlBuilder.writeElement(G.URI_DC,"identifier",itemId);
    
    // atom:title is required
    xmlBuilder.writeElement(G.URI_ATOM,"title",title);
    
    // atom:summary is required
    xmlBuilder.writer.writeStartElement(G.URI_ATOM,"summary");
    xmlBuilder.writer.writeAttribute("type","html");
    xmlBuilder.writer.writeCharacters(description);
    xmlBuilder.writer.writeEndElement();

    // atom:published is optional
    if (created !== null && created.length > 0) {
      xmlBuilder.writeElement(G.URI_ATOM,"published",created);
    }

    // atom:updated is required
    if (modified != null && modified.length > 0) {
      xmlBuilder.writeElement(G.URI_ATOM,"updated",modified);
    } else if (created != null && created.length > 0) {
      xmlBuilder.writeElement(G.URI_ATOM,"updated",created);
    } else {
      xmlBuilder.writeElement(G.URI_ATOM,"updated",options.now);
    }

    // atom:author is required
    xmlBuilder.writer.writeStartElement(G.URI_ATOM,"author");
    xmlBuilder.writeElement(G.URI_ATOM,"name",owner);
    xmlBuilder.writer.writeEndElement();
    
    // at least one link is required 
    if (links != null) {
      for (i=0;i<links.length;i++) {
        v = links[i];
        this._addLink(v.rel,v.type,v.href,xmlBuilder);
      }
    }
    
    // TODO itemType
    if (itemType !== null && itemType.length > 0) {
      xmlBuilder.writer.writeStartElement(G.URI_ATOM,"category");
      xmlBuilder.writer.writeAttribute("scheme","type");
      xmlBuilder.writer.writeAttribute("term",itemType);
      xmlBuilder.writer.writeEndElement();
    }
    
    // keywords
    if (keywords != null) {
      for (i=0;i<keywords.length;i++) {
        v = G.chkStr(keywords[i]);
        if (v !== null && v.length() > 0) {
          xmlBuilder.writer.writeStartElement(G.URI_ATOM,"category");
          xmlBuilder.writer.writeAttribute("scheme","keywords");
          xmlBuilder.writer.writeAttribute("term",v);
          xmlBuilder.writer.writeEndElement();
        }
      }
    }
    
    // credits
    if (credits != null) {
      for (i=0;i<credits.length;i++) {
        v = G.chkStr(credits[i]);
        if (v !== null && v.length() > 0) {
          xmlBuilder.writer.writeStartElement(G.URI_ATOM,"contributor");
          xmlBuilder.writeElement(G.URI_ATOM,"name",v);
          xmlBuilder.writer.writeEndElement();
        }
      }
    }

    // rights
    if (rights != null) {
      for (i=0;i<rights.length;i++) {
        v = G.chkStr(rights[i]);
        if (v !== null && v.length() > 0) {
          xmlBuilder.writer.writeStartElement(G.URI_ATOM,"rights");
          xmlBuilder.writer.writeAttribute("type","html");
          xmlBuilder.writer.writeCharacters(v);
          xmlBuilder.writer.writeEndElement();
        }
      }
    }

    // extent
    if (extent && extent.type && extent.type === "envelope" && extent.coordinates && extent.coordinates.length === 2) {
      var topLeft = extent.coordinates[0];
      var bottomRight = extent.coordinates[1];
      if (topLeft != null && topLeft.length === 2 && bottomRight != null && bottomRight.length === 2) {
        var coordinates = [topLeft[0],bottomRight[1],bottomRight[0],topLeft[1]];
        var rssBox = coordinates[1]+" "+coordinates[0]+" "+coordinates[3]+" "+coordinates[2];
        xmlBuilder.writeElement(G.URI_GEORSS,"box",rssBox);
        xmlBuilder.writeElement(G.URI_GEORSS10,"box",rssBox);
      }
    }
    
    // TODO resource time period??
    
    xmlBuilder.writer.writeEndElement();
  }
}

function writeItem(appRequest,appResponse,itemId,itemString,responseString) {
  G.writers.atom.writeItem(appRequest,appResponse,itemId,itemString,responseString);
}

function writeItems(searchRequest,appResponse,searchResponse) {
  G.writers.atom.writeItems(searchRequest,appResponse,searchResponse);
}
