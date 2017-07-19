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

(function(){

  gs.writer.AtomWriter = gs.Object.create(gs.writer.Writer,{
  
    write: {value: function(task,searchResult) {
      // TODO when to return a single atom entry?
      //task.request.isItemByIdRequest = true;
      if (task.request.isItemByIdRequest) {
        if (!searchResult.items || searchResult.items.length === 0) {
          // // TODO send JSON
          task.response.put(task.response.Status_NOT_FOUND,task.response.MediaType_TEXT_PLAIN,null);
        } else {
          if (task.provider.isCswProvider) {
            this._writeItem(task,searchResult);
          } else {
            this._writeItems(task,searchResult);
          }
        }
      } else {
        this._writeItems(task,searchResult);
      }
    }},
    
    /* .......................................................................................... */
    
    _addAtomObject: {value: function(task,xmlBuilder,atomType,atomObject) {
      if (Array.isArray(atomObject)) {
        atomObject.forEach(function(v){
          if (typeof v.write === "function") {
            v.write(task,xmlBuilder);
          }
        });
      } else if (atomType.isPrototypeOf(atomObject)) {
        if (typeof atomObject.write === "function") {
          atomObject.write(task,xmlBuilder);
        }
      }
    }},
    
    _addAtomText: {value: function(task,xmlBuilder,namespaceURI,localName,value) {
      var self = this;
      if (Array.isArray(value)) {
        value.forEach(function(v){
          self._addAtomText(task,xmlBuilder,namespaceURI,localName,v);
        });
      } else if (gs.atom.Text.isPrototypeOf(value)) {
        if (typeof value.write === "function") {
          value.write(task,xmlBuilder,namespaceURI,localName);
        }
      } else if (typeof value === "string" && value.length > 0) {
        xmlBuilder.writeElement(namespaceURI,localName,value);
      }
    }},
    
    _addElement: {value: function(task,xmlBuilder,namespaceURI,localName,value) {
      if (typeof value === "string" && value.length > 0) {
        xmlBuilder.writeElement(namespaceURI,localName,value);
      }
    }},
  
    _addNamespaces: {value: function(task,xmlBuilder) {
      xmlBuilder.writeNamespace("atom",task.uris.URI_ATOM);
      xmlBuilder.writeNamespace("geo",task.uris.URI_GEO);
      xmlBuilder.writeNamespace("georss",task.uris.URI_GEORSS);
      xmlBuilder.writeNamespace("georss10",task.uris.URI_GEORSS10);
      xmlBuilder.writeNamespace("time",task.uris.URI_TIME);
      xmlBuilder.writeNamespace("opensearch",task.uris.URI_OPENSEARCH);
      xmlBuilder.writeNamespace("dc",task.uris.URI_DC);
    }},
    
    _addQuery: {value: function(task,xmlBuilder) {
      var uris = task.uris, request = task.request;
      var osqQ = request.getParameter("q");
      var osqId = request.getParameter("id");
      var osqBBox = request.getParameter("bbox");
      var osqTime = request.getParameter("time");
      var osqStartIndex = request.getParameter("from");
      var osqCount = request.getParameter("size");
      xmlBuilder.writeStartElement(uris.URI_OPENSEARCH,"Query");
      xmlBuilder.writeAttribute("role","request");
      if (osqQ !== null && osqQ.length > 0) {
        xmlBuilder.writeAttribute("searchTerms",osqQ);
      }
      if (osqId !== null && osqId.length > 0) {
        xmlBuilder.writeAttributeNS(uris.URI_GEO,"uid",osqId);
      }
      if (osqBBox !== null && osqBBox.length > 0) {
        xmlBuilder.writeAttributeNS(uris.URI_GEO,"box",osqBBox);
      }
      if (osqTime !== null && osqTime.length > 0) {
        xmlBuilder.writeAttributeNS(uris.URI_TIME,"time",osqTime);
      }
      if (osqStartIndex !== null && osqStartIndex.length > 0) {
        xmlBuilder.writeAttribute("startIndex",osqStartIndex);
      }
      if (osqCount !== null && osqCount.length > 0) {
        xmlBuilder.writeAttribute("count",osqCount);
      }
      xmlBuilder.writeEndElement();
    }},
    
    _writeEntry: {value: function(task,xmlBuilder,item,options) {
      var entry = task.target.itemToAtomEntry(task,item); // TODO task.target.schema
      if (!entry) return;
      
      if (options.entryOnly) {
        xmlBuilder.writeStartElementPfx("atom","entry",task.uris.URI_ATOM);
        this._addNamespaces(task,xmlBuilder);
      } else {
        xmlBuilder.writeStartElement(task.uris.URI_ATOM,"entry");
      }
      
      // atom:id, atom:title, and atom:updated are required
      var id = entry.id;
      var title = "Empty";
      var updated = options.now;
      if (typeof entry.title === "string" && entry.title.length > 0) {
        title = entry.title;
      }
      if (typeof entry.updated === "string" && entry.updated.length > 0) {
        updated = entry.updated;
      } else if (typeof entry.published === "string" && entry.published.length > 0) {
        updated = entry.published;
      }
  
      xmlBuilder.writeElement(task.uris.URI_ATOM,"id",id);
      xmlBuilder.writeElement(task.uris.URI_DC,"identifier",id);
      xmlBuilder.writeElement(task.uris.URI_ATOM,"title",title);
      this._addElement(task,xmlBuilder,task.uris.URI_ATOM,"published",entry.published);
      this._addElement(task,xmlBuilder,task.uris.URI_ATOM,"updated",updated);
      this._addAtomText(task,xmlBuilder,task.uris.URI_ATOM,"summary",entry.summary);
      this._addAtomObject(task,xmlBuilder,gs.atom.Person,entry.author);
      this._addAtomObject(task,xmlBuilder,gs.atom.Person,entry.contributor);
      this._addAtomObject(task,xmlBuilder,gs.atom.Link,entry.link);
      this._addAtomObject(task,xmlBuilder,gs.atom.Category,entry.category);
      this._addAtomText(task,xmlBuilder,task.uris.URI_ATOM,"rights",entry.rights);
      if (gs.atom.Point.isPrototypeOf(entry.point)) {
        entry.point.writeGeoRSSPoint(task,xmlBuilder);
      }
      if (gs.atom.BBox.isPrototypeOf(entry.bbox)) {
        entry.bbox.writeGeoRSSBox(task,xmlBuilder);
        entry.bbox.writeGeoRSSBox10(task,xmlBuilder);
      }
      this._addAtomObject(task,xmlBuilder,task.uris.URI_ATOM,"content",entry.content);
      
      // TODO source? resource links? time period?
      
      // call schema before ending element
      
      xmlBuilder.writeEndElement();
    }},
    
    _writeItem: {value: function(task,searchResult) {
      var now = task.val.nowAsString();
      var options = {now: now, entryOnly: true};
      var xmlBuilder = task.context.newXmlBuilder();
      xmlBuilder.writeStartDocument();
      this._writeEntry(task,xmlBuilder,searchResult.items[0],options);
      xmlBuilder.writeEndDocument();
      this._writeResponse(task,xmlBuilder);
    }},
    
    _writeItems: {value: function(task,searchResult) {
      var now = task.val.nowAsString();
      var options = {now: now, entryOnly: false};
      var xmlBuilder = task.context.newXmlBuilder();
      xmlBuilder.writeStartDocument();
      
      var items = searchResult.items ? searchResult.items : [];
      var totalHits = searchResult.totalHits;
      var startIndex = searchResult.startIndex;
      var itemsPerPage = searchResult.itemsPerPage;
      
      var baseUrl = task.baseUrl;
      var dscUrl = baseUrl+"/opensearch/description"; // TODO
      var feedId = baseUrl;
      var feedTitle = "Results"; // TODO - "Results"
      var authorName = baseUrl;
      
      xmlBuilder.writeStartElementPfx("atom","feed",task.uris.URI_ATOM);
      this._addNamespaces(task,xmlBuilder);
      xmlBuilder.writeElement(task.uris.URI_ATOM,"title",feedTitle);
      xmlBuilder.writeElement(task.uris.URI_ATOM,"id",feedId); 
      xmlBuilder.writeElement(task.uris.URI_ATOM,"updated",now); // TODO
      xmlBuilder.writeStartElement(task.uris.URI_ATOM,"author");
      xmlBuilder.writeElement(task.uris.URI_ATOM,"name",authorName);
      xmlBuilder.writeEndElement();
      
      var link = gs.Object.create(gs.atom.Link).init({
        rel: "search",
        type: "application/opensearchdescription+xml",
        href: dscUrl
      });
      link.write(task,xmlBuilder);
      xmlBuilder.writeElement(task.uris.URI_OPENSEARCH,"totalResults",""+totalHits);
      xmlBuilder.writeElement(task.uris.URI_OPENSEARCH,"startIndex",""+startIndex);
      xmlBuilder.writeElement(task.uris.URI_OPENSEARCH,"itemsPerPage",""+itemsPerPage);
      
      this._addQuery(task,xmlBuilder);
      if (itemsPerPage > 0) {
        for (var i=0;i<items.length;i++) {
          this._writeEntry(task,xmlBuilder,items[i],options);
        }
      }
      xmlBuilder.writeEndElement();
      xmlBuilder.writeEndDocument();
      this._writeResponse(task,xmlBuilder);
    }},
    
    _writeResponse: {value: function(task,xmlBuilder) {
      var xml = xmlBuilder.getXml();
      if (task.request.pretty) xml = task.context.indentXml(task,xml);
      var response = task.response;
      response.put(response.Status_OK,response.MediaType_APPLICATION_ATOM_XML,xml);
    }}
  
  });

}());
