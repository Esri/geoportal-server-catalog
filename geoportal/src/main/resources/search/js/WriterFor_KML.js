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

G.writers.kml = {
  
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
    var feedId = baseUrl;
    
    xmlBuilder.writer.writeStartElement("kml","kml",G.URI_KML);
    this._addNamespaces(xmlBuilder);
    xmlBuilder.writer.writeStartElement("kml","Document",G.URI_KML);
    xmlBuilder.writeElement(G.URI_KML,"name","Results");
    xmlBuilder.writeElement(G.URI_KML,"open","1");
    this._writeStyle(xmlBuilder,"main","7d0000ff");
    
    this._addLink("search","application/opensearchdescription+xml",dscUrl,xmlBuilder);
    xmlBuilder.writeElement(G.URI_OPENSEARCH,"totalResults",""+totalHits);
    xmlBuilder.writeElement(G.URI_OPENSEARCH,"startIndex",""+from);
    xmlBuilder.writeElement(G.URI_OPENSEARCH,"itemsPerPage",""+size);
    
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
    xmlBuilder.writer.writeNamespace("kml",G.URI_KML);
    xmlBuilder.writer.writeNamespace("atom",G.URI_ATOM);
    xmlBuilder.writer.writeNamespace("opensearch",G.URI_OPENSEARCH);
    //xmlBuilder.writer.writeNamespace("dc",G.URI_DC);
  },
  
  _writeAppResponse: function(appRequest,appResponse,xmlBuilder) {
    var mediaType = new G.MediaType("application","vnd.google-earth.kml+xml");
    //var mediaType = new G.MediaType("text","xml");
    var xml = xmlBuilder.getXml();
    if (appRequest.getPretty()) xml = G.XmlUtil.indent(xml);
    appResponse.setOk();
    appResponse.setMediaType(mediaType.withCharset("UTF-8"));
    appResponse.setEntity(xml);
    appResponse.addHeader("Content-Disposition",
      "filename="+java.lang.System.currentTimeMillis()+".kml");
  },
  
  _writeEntry: function(request,itemId,itemString,xmlBuilder,options) {
    var i,v;
    var item = JSON.parse(itemString);
    if (options.entryOnly) {
      xmlBuilder.writer.writeStartElement("kml","Placemark",G.URI_KML);
      this._addNamespaces(xmlBuilder);
    } else {
      xmlBuilder.writer.writeStartElement(G.URI_KML,"Placemark");
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
    var resources = item["resources_nst"];
    var links = G.buildLinks(request,itemId,item);
    
    if (title === null || title.length === 0) title = "";
    if (description === null || description.length === 0) description = "";
    if (owner === null || owner.length === 0) owner = "";
    
    
    xmlBuilder.writeElement(G.URI_KML,"name",title);
    xmlBuilder.writeElement(G.URI_ATOM,"id",itemId);
    
    var snippet = G.getSnippet(xmlBuilder,title,description,links);
    xmlBuilder.writer.writeStartElement("kml","description",G.URI_KML);
    xmlBuilder.writer.writeCData(snippet);
    xmlBuilder.writer.writeEndElement();
    
    xmlBuilder.writeElement(G.URI_KML,"styleUrl","#main");
    
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
        var coords = [topLeft[0],bottomRight[1],bottomRight[0],topLeft[1]];
        var xmin = topLeft[0], ymin = bottomRight[1], xmax = bottomRight[0], ymax = topLeft[1];
        //if ((xmin < -180.0) && (xmax >= -180.0)) xmin = -180.0;
        //if ((xmax > 180.0) && (xmin <= 180.0)) xmax = 180.0;
        if ((ymin < -90.0) && (ymax >= -90.0)) ymin = -90.0;
        if ((ymax > 90.0) && (ymin <= 90.0)) ymax = 90.0;
        if (xmin === xmax && ymin === ymax) {
          xmlBuilder.writer.writeStartElement("kml","Point",G.URI_KML);
          xmlBuilder.writer.writeStartElement("kml","coordinates",G.URI_KML);
          xmlBuilder.writer.writeCharacters(xmin+","+ymin+",0");
          xmlBuilder.writer.writeEndElement();
          xmlBuilder.writer.writeEndElement();
        } else {
          xmlBuilder.writer.writeStartElement("kml","Polygon",G.URI_KML);
          xmlBuilder.writeElement(G.URI_KML,"extrude","0");
          xmlBuilder.writeElement(G.URI_KML,"altitudeMode","clampToGround");
          xmlBuilder.writer.writeStartElement("kml","outerBoundaryIs",G.URI_KML);
          xmlBuilder.writer.writeStartElement("kml","LinearRing",G.URI_KML);
          xmlBuilder.writer.writeStartElement("kml","coordinates",G.URI_KML);
          xmlBuilder.writer.writeCharacters("\r\n");
          xmlBuilder.writer.writeCharacters(xmin+","+ymax+",0\r\n");
          xmlBuilder.writer.writeCharacters(xmax+","+ymax+",0\r\n");
          xmlBuilder.writer.writeCharacters(xmax+","+ymin+",0\r\n");
          xmlBuilder.writer.writeCharacters(xmin+","+ymin+",0\r\n");
          xmlBuilder.writer.writeCharacters(xmin+","+ymax+",0\r\n");
          xmlBuilder.writer.writeEndElement();
          xmlBuilder.writer.writeEndElement();
          xmlBuilder.writer.writeEndElement();
          xmlBuilder.writer.writeEndElement();
        }
      }
    }
    
    xmlBuilder.writer.writeEndElement();
  },
  
  _writeStyle: function(xmlBuilder,name,color) {
    xmlBuilder.writer.writeStartElement("kml","Style",G.URI_KML);
    xmlBuilder.writer.writeAttribute("id",name);
    xmlBuilder.writer.writeStartElement("kml","LineStyle",G.URI_KML);
    xmlBuilder.writeElement(G.URI_KML,"width","1.5");
    xmlBuilder.writer.writeEndElement();
    xmlBuilder.writer.writeStartElement("kml","PolyStyle",G.URI_KML);
    xmlBuilder.writeElement(G.URI_KML,"color",color);
    xmlBuilder.writer.writeEndElement();
    xmlBuilder.writer.writeEndElement();
  }
};

function writeItem(appRequest,appResponse,itemId,itemString,responseString) {
  G.writers.kml.writeItem(appRequest,appResponse,itemId,itemString,responseString);
}

function writeItems(searchRequest,appResponse,searchResponse) {
  G.writers.kml.writeItems(searchRequest,appResponse,searchResponse);
}
