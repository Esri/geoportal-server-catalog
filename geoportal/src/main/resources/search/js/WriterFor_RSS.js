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

G.writers.rss = {
  
  DF: new java.text.SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss ZZ"),
  
  fmt: function(iso) {
    try {
      var dt = G.DateUtil.fromIso8601(iso);
      var v = this.DF.format(dt);
      if (v) return v;
    } catch(ex) {
      //print("WriterFor_RSS: Unable to format date:",ex);
    }
    return iso;
  },
  
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
    var dscUrl = baseUrl+"/opensearch/description";
    
    xmlBuilder.writer.writeStartElement("rss");
    xmlBuilder.writer.writeAttribute("version","2.0");
    this._addNamespaces(xmlBuilder);
    xmlBuilder.writer.writeStartElement("channel");
    xmlBuilder.writeElement("title","Results");
    xmlBuilder.writeElement("description","RSS Results");
    xmlBuilder.writeElement("link",baseUrl);
    xmlBuilder.writeElement("docs","http://www.rssboard.org/rss-specification");
    xmlBuilder.writeElement("category","GeoRss");
    
    this._addLink("search","application/opensearchdescription+xml",dscUrl,xmlBuilder);
    xmlBuilder.writeElement(G.URI_OPENSEARCH,"totalResults",""+totalHits);
    xmlBuilder.writeElement(G.URI_OPENSEARCH,"startIndex",""+from); // TODO startIndex??
    xmlBuilder.writeElement(G.URI_OPENSEARCH,"itemsPerPage",""+size);
    
    //this._addQuery(searchRequest,xmlBuilder);
    
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
    xmlBuilder.writer.writeNamespace("georss",G.URI_GEORSS);
    xmlBuilder.writer.writeNamespace("georss10",G.URI_GEORSS10);
    xmlBuilder.writer.writeNamespace("opensearch",G.URI_OPENSEARCH);
    //xmlBuilder.writer.writeNamespace("dc",G.URI_DC);
    //xmlBuilder.writer.writeNamespace("geo",G.URI_GEO);
    //xmlBuilder.writer.writeNamespace("time",G.URI_TIME);
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
    var mediaType = new G.MediaType("application","rss+xml");
    var xml = xmlBuilder.getXml();
    if (appRequest.getPretty()) xml = G.XmlUtil.indent(xml);
    appResponse.setOk();
    appResponse.setMediaType(mediaType.withCharset("UTF-8"));
    appResponse.setEntity(xml);
  },
  
  _writeEntry: function(request,itemId,itemString,xmlBuilder,options) {
    var i,v;
    var item = JSON.parse(itemString);
    xmlBuilder.writer.writeStartElement("item");
    
    var title = G.chkStr(item["title"]);
    var description = G.chkStr(item["description"]);
    var itemType = G.chkStr(item["itemType"]);
    var owner = G.chkStr(item["sys_owner_s"]);
    var created = G.chkStr(item["sys_created_dt"]);
    var modified = G.chkStr(item["sys_modified_dt"]);
    var keywords = G.chkStrArray(item["keywords_s"]);
    var credits = G.chkStrArray(item["credits_s"]);
    var rights = G.chkStrArray(item["rights_s"]);
    var extent = item["envelope_geo"];
    var resources = item["resources_nst"];
    var links = G.buildLinks(request,itemId,item);
    
    if (title === null || title.length === 0) title = "";
    if (description === null || description.length === 0) description = "";
    if (owner === null || owner.length === 0) owner = "";
    
    xmlBuilder.writeElement("guid",itemId);
    xmlBuilder.writeElement(G.URI_ATOM,"id",itemId);
    xmlBuilder.writeElement("title",title);
    
    var snippet = G.getSnippet(xmlBuilder,title,description,links);
    xmlBuilder.writer.writeStartElement("description");
    xmlBuilder.writer.writeCData(snippet);
    xmlBuilder.writer.writeEndElement();
    
    if (modified != null && modified.length > 0) {
      xmlBuilder.writeElement("pubDate",this.fmt(modified));
    } else if (created != null && created.length > 0) {
      xmlBuilder.writeElement("pubDate",this.fmt(created));
    }

    if (links != null) {
      for (i=0;i<links.length;i++) {
        v = links[i];
        this._addLink(v.rel,v.type,v.href,xmlBuilder);
      }
    }

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

    xmlBuilder.writer.writeEndElement();
  }
};

function writeItem(appRequest,appResponse,itemId,itemString,responseString) {
  G.writers.rss.writeItem(appRequest,appResponse,itemId,itemString,responseString);
}

function writeItems(searchRequest,appResponse,searchResponse) {
  G.writers.rss.writeItems(searchRequest,appResponse,searchResponse);
}
