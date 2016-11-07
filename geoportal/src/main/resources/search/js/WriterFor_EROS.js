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
    var dscUrl = baseUrl+"/Eros/description"; // TODO
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
    this._addLink("self","application/opensearchdescription+xml",baseUrl+"/Eros?from="+from+"&size="+size+(searchRequest.getPretty()?"&pretty=true":""),xmlBuilder);
    this._addLink("first","application/opensearchdescription+xml",baseUrl+"/Eros?from="+1+"&size="+size+(searchRequest.getPretty()?"&pretty=true":""),xmlBuilder);
    this._addLink("last","application/opensearchdescription+xml",baseUrl+"/Eros?from="+(size*Math.floor(totalHits/size))+"&size="+size+(searchRequest.getPretty()?"&pretty=true":""),xmlBuilder);
    if (from-size>=1) {
      this._addLink("prev","application/opensearchdescription+xml",baseUrl+"/Eros?from="+(from-size)+"&size="+size+(searchRequest.getPretty()?"&pretty=true":""),xmlBuilder);
    }
    if (from+size<=totalHits) {
      this._addLink("next","application/opensearchdescription+xml",baseUrl+"/Eros?from="+(from+size)+"&size="+size+(searchRequest.getPretty()?"&pretty=true":""),xmlBuilder);
    }
    
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
    xmlBuilder.writer.writeNamespace("sdi",G.URI_SDI);
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
    var resources = item["resources_nst"];
    
    if (title === null || title.length === 0) title = "Empty";
    
    // atom:id is required
    xmlBuilder.writeElement(G.URI_ATOM,"id",itemId);
    
    // atom:title is required
    xmlBuilder.writeElement(G.URI_ATOM,"title",title);
    
    // Eros elements
    if (resources != null) {
      var resourcesArray = G.chkObjArray(resources);
      var urlTypes = request.getParameter("urlTypes");
      var urlTypesArr = urlTypes && urlTypes.length>0? urlTypes.split(","): null;
      // Eros type conversion table
      var ETCT = {
        "FeatureServer": "agsfeatureserver",
        "ImageServer": "agsimageserver",
        "MapServer": "agsmapserver",
        "CSW": "csw",
        "IMS": "image",
        "SOS": "sos",
        "WCS": "wcs",
        "WFS": "wfs",
        "WMS": "wms"
      };
      for (i=0;i<resourcesArray.length;i++) {
        r = resourcesArray[i];
        if (r.url_type_s && (!urlTypesArr || urlTypesArr.length==0 || urlTypesArr.indexOf(r.url_type_s)>=0)) {
          var serviceType = ETCT[r.url_type_s];
          if (serviceType) {
            var baseUrl = request.getBaseUrl();
            var itemXml = baseUrl+"/rest/metadata/item/"+encodeURIComponent(itemId)+"/xml";

            xmlBuilder.writeElement(G.URI_SDI,"metadataUrl",itemXml);
            xmlBuilder.writeElement(G.URI_SDI,"serviceUrl",r.url_s);
            xmlBuilder.writeElement(G.URI_SDI,"serviceType",serviceType);
            xmlBuilder.writeElement(G.URI_SDI,"emailAddress","");

            break;
          }
        }
      }
    }
    
    
    // TODO resource time period??
    
    xmlBuilder.writer.writeEndElement();
  }
};

function writeItem(appRequest,appResponse,itemId,itemString,responseString) {
  G.writers.atom.writeItem(appRequest,appResponse,itemId,itemString,responseString);
}

function writeItems(searchRequest,appResponse,searchResponse) {
  G.writers.atom.writeItems(searchRequest,appResponse,searchResponse);
}
