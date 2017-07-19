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

  gs.writer.CswWriter = gs.Object.create(gs.writer.Writer,{
  
    write: {value: function(task,searchResult) {
      //task.request.isItemByIdRequest = true;
      if (task.request.isItemByIdRequest) {
        if (!searchResult.items || searchResult.items.length === 0) {
          task.response.put(task.response.Status_NOT_FOUND,task.response.MediaType_TEXT_PLAIN,null);
        } else {
          this._writeItem(task,searchResult);
        }
      } else {
        this._writeItems(task,searchResult);
      }
    }},
    
    /* .......................................................................................... */
    
    _addAtomCategory: {value: function(task,xmlBuilder,namespaceURI,localName,value) {
      if (value === null) return;
      if (!Array.isArray(value)) value = [value];
      var self = this;
      value.forEach(function(v){
        if (gs.atom.Category.isPrototypeOf(v)) {
          if (typeof v.term === "string" && v.term.length > 0) {
            xmlBuilder.writeStartElement(namespaceURI,localName);
            if (typeof v.scheme === "string" && v.scheme.length > 0) {
              xmlBuilder.writeAttribute("scheme",v.scheme);
            }
            xmlBuilder.writeCharacters(v.term);
            xmlBuilder.writeEndElement();
          }
        }
      });
    }},
    
    _addAtomLink: {value: function(task,xmlBuilder,namespaceURI,localName,value) {
      if (value === null) return;
      if (!Array.isArray(value)) value = [value];
      var self = this;
      value.forEach(function(v){
        if (gs.atom.Link.isPrototypeOf(v)) {
          if (typeof v.href === "string" && v.href.length > 0) {
            xmlBuilder.writeStartElement(namespaceURI,localName);
            if (typeof v.rel === "string" && v.rel.length > 0) {
              xmlBuilder.writeAttribute("scheme",v.rel);
            }
            xmlBuilder.writeCharacters(v.href);
            xmlBuilder.writeEndElement();
          }
        }
      });
    }},
    
    _addAtomPerson: {value: function(task,xmlBuilder,namespaceURI,localName,value) {
      if (value === null) return;
      if (!Array.isArray(value)) value = [value];
      var self = this;
      value.forEach(function(v){
        if (gs.atom.Person.isPrototypeOf(v)) {
          if (typeof v.name === "string" && v.name.length > 0) {
            xmlBuilder.writeElement(namespaceURI,localName,v.name);
          }
        }
      });
    }},
    
    _addAtomText: {value: function(task,xmlBuilder,namespaceURI,localName,value) {
      var self = this;
      if (Array.isArray(value)) {
        value.forEach(function(v){
          self._addAtomText(task,xmlBuilder,namespaceURI,localName,v);
        });
      } else if (gs.atom.Text.isPrototypeOf(value)) {
        xmlBuilder.writeStartElement(namespaceURI,localName);
        if (typeof value.value === "string") {
          xmlBuilder.writeCharacters(value.value);
        }
        xmlBuilder.writeEndElement();
      } else if (typeof value === "string" && value.length > 0) {
        xmlBuilder.writeElement(namespaceURI,localName,value);
      }
    }},
  
    _addNamespaces: {value: function(task,xmlBuilder) {
      xmlBuilder.writeNamespace("csw",task.uris.URI_CSW);
      xmlBuilder.writeNamespace("dc",task.uris.URI_DC);
      xmlBuilder.writeNamespace("dct",task.uris.URI_DCT);
      xmlBuilder.writeNamespace("ows",task.uris.URI_OWS);
    }},
  
    _marshallOptions: {value: function(task,options) {
      options.recordTypeName = "Record"; 
      //options.elementSetName = "summary";
      var p = task.provider;
      if (typeof p.recordTypeName === "string" && p.recordTypeName.length > 0) {
        options.recordTypeName = p.recordTypeName;
      }
      if (typeof p.elementSetName === "string" && p.elementSetName.length > 0) {
        options.elementSetName = p.elementSetName;
      }
    }},
    
    _writeEntry: {value: function(task,xmlBuilder,item,options) {
      var recordTypeName = options.recordTypeName;
      if (options.entryOnly) {
        xmlBuilder.writeStartElementPfx("csw",recordTypeName,task.uris.URI_CSW);
        this._addNamespaces(task,xmlBuilder);
      } else {
        xmlBuilder.writeStartElement(task.uris.URI_CSW,recordTypeName);
      }
      var entry = task.target.itemToAtomEntry(task,item); // TODO task.target.schema
      
      var id = entry.id;
      var title = "Empty";
      if (typeof entry.title === "string" && entry.title.length > 0) {
        title = entry.title;
      }
  
      xmlBuilder.writeElement(task.uris.URI_DC,"identifier",id);
      xmlBuilder.writeElement(task.uris.URI_DC,"title",title);
      //xmlBuilder.writeElement(task.uris.URI_DC,"type",itemType);   // TODO 
    
      if (recordTypeName !== "BriefRecord") {
        this._addAtomCategory(task,xmlBuilder,task.uris.URI_DC,"subject",entry.category);
        // dc:format (summary) TODO
        // dc:relation (summary)
        this._addAtomText(task,xmlBuilder,task.uris.URI_DCT,"modified",entry.updated);
        this._addAtomText(task,xmlBuilder,task.uris.URI_DCT,"abstract",entry.summary);
        // dct:spatial (summary)
        // csw:TemporalExtent (summary)?
        if (recordTypeName !== "SummaryRecord") {
          this._addAtomText(task,xmlBuilder,task.uris.URI_DCT,"created",entry.published);
          this._addAtomPerson(task,xmlBuilder,task.uris.URI_DC,"creator",entry.author);
          this._addAtomPerson(task,xmlBuilder,task.uris.URI_DC,"contributor",entry.contributor);
          this._addAtomText(task,xmlBuilder,task.uris.URI_DC,"rights",entry.rights);
        }
        this._addAtomLink(task,xmlBuilder,task.uris.URI_DCT,"references",entry.link);
      } 
      
      if (gs.atom.BBox.isPrototypeOf(entry.bbox)) {
        entry.bbox.writeOwsBoundingBox(task,xmlBuilder);
      }
      
      // TODO source? resource links? time period?
      
      // call schema before ending element
      
      xmlBuilder.writeEndElement();
    }},
    
    _writeItem: {value: function(task,searchResult) {
      var now = task.val.nowAsString();
      var options = {now: now, entryOnly: true};
      this._marshallOptions(task,options);
      var xmlBuilder = task.context.newXmlBuilder();
      xmlBuilder.writeStartDocument();
      this._writeEntry(task,xmlBuilder,searchResult.items[0],options);
      xmlBuilder.writeEndDocument();
      this._writeResponse(task,xmlBuilder);
    }},
    
    _writeItems: {value: function(task,searchResult) {
      var now = task.val.nowAsString();
      var options = {now: now, entryOnly: false};
      this._marshallOptions(task,options);
      var xmlBuilder = task.context.newXmlBuilder();
      xmlBuilder.writeStartDocument();
      
      var items = searchResult.items ? searchResult.items : [];
      var totalHits = searchResult.totalHits;
      var startIndex = searchResult.startIndex;
      var itemsPerPage = searchResult.itemsPerPage;
      
      var numReturned = items.length;
      if (searchResult.itemsPerPage === 0) numReturned = 0;
      var nextRecord = -1; // TODO 0 ?
      if (numReturned === 0 && totalHits > 0) {
        if (searchResult.queryIsZeroBased) {
          nextRecord = 0;
        } else {
          nextRecord = 1;
        }
      } else if (numReturned > 0) {
        nextRecord = startIndex + itemsPerPage;
        if (nextRecord >= totalHits) {
          nextRecord = -1; // TODO 0 ?
        } 
      }
      
      xmlBuilder.writeStartElementPfx("csw","GetRecordsResponse",task.uris.URI_CSW);
      this._addNamespaces(task,xmlBuilder);
      xmlBuilder.writeStartElement(task.uris.URI_CSW,"SearchStatus");
      xmlBuilder.writeAttribute("timestamp",now);
      xmlBuilder.writeEndElement();
      
      xmlBuilder.writeStartElement(task.uris.URI_CSW,"SearchResults");
      xmlBuilder.writeAttribute("numberOfRecordsMatched",""+totalHits);
      xmlBuilder.writeAttribute("numberOfRecordsReturned",""+numReturned);
      xmlBuilder.writeAttribute("nextRecord",""+nextRecord);
      xmlBuilder.writeAttribute("recordSchema",task.uris.URI_CSW);
      if (options.elementSetName != null && options.elementSetName.length > 0) {
        xmlBuilder.writeAttribute("elementSetName",options.elementSetName);
      }
      if (itemsPerPage > 0) {
        for (var i=0;i<items.length;i++) {
          this._writeEntry(task,xmlBuilder,items[i],options);
        }
      }
      xmlBuilder.writeEndElement();
  
      xmlBuilder.writeEndElement();
      xmlBuilder.writeEndDocument();
      this._writeResponse(task,xmlBuilder);
    }},
    
    _writeResponse: {value: function(task,xmlBuilder) {
      this.writeXmlResponse(task,xmlBuilder.getXml());
    }}
  
  });

}());


