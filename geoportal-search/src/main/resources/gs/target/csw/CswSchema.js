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
  
  gs.target.csw.CswSchema = gs.Object.create(gs.target.TargetSchema, {
    
    qClauseName: {writable: true, value: "PropertyIsLike"},
    
    qPropertyName: {writable: true, value: "AnyText"},
    idPropertyName: {writable: true, value: "Id"},
    modifiedPropertyName: {writable: true, value: "Modified"},
    spatialPropertyName: {writable: true, value: "Geometry"},
    timePeriodPropertyName: {writable: true, value: "TimePeriod"},
    
    sortables: {writable: true, value: {
      "title": "title",
      "date": "modified",
      "modified": "modified"
    }},
    
    handleRecordToAtomEntry: {value:function(task,xmlInfo,recordInfo) {
      // TODO this needs to be completed
      var ln, ns, hasText, dctype, scheme, text;
      var x, y, xy, xmin, ymin, xmax, ymax;
      var links = [];
      var entry = gs.Object.create(gs.atom.Entry);
      xmlInfo.forEachChild(recordInfo.node,function(childInfo){
        if (childInfo.isElementNode) {
          //console.log(childInfo.localName,childInfo.namespaceURI);
          ln = childInfo.localName;
          ns = childInfo.namespaceURI;
          text = childInfo.nodeText;
          hasText = (typeof text === "string" && text.length > 0);
          if (ns === task.uris.URI_DC) {
            //console.log(childInfo.nodeInfo.localName,childInfo.nodeInfo.namespaceURI);
            if (ln === "identifier") {
              scheme = xmlInfo.getAttributeValue(childInfo.node,"scheme");
              //console.log(ln,text,"scheme =",scheme);
              if (scheme === "urn:x-esri:specification:ServiceType:ArcIMS:Metadata:DocID") {
                entry.id = text;
              } else if (scheme === "urn:x-esri:specification:ServiceType:ArcIMS:Metadata:FileID") {
                if (typeof entry.id !== "string") {
                  entry.id = text;
                }
              } else {
                entry.id = text;
              }
            } else if (ln === "title") {
              entry.title = text;
            } else if (ln === "type") {
            } else if (ln === "subject") { 
            } else if (ln === "format") { 
            } else if (ln === "relation") {
            } else if (ln === "creator") {
            } else if (ln === "contributor") {
            } else if (ln === "rights") {
            }
          } else if (ns === task.uris.URI_DCT) {
            if (ln === "abstract") {
              if (hasText) {
                entry.summary = gs.Object.create(gs.atom.Text).init({
                  type: "text", // TODO ?
                  value: text
                });
              }
            } else if (ln === "created") {
              if (hasText) {
                entry.published = text;
              }
            } else if (ln === "modified") {
              if (hasText) {
                entry.updated = text;
              }
            } else if (ln === "references") { 
              if (hasText) {
                scheme = xmlInfo.getAttributeValue(childInfo.node,"scheme");
                //console.log(ln,text,"scheme =",scheme);
                if (scheme === "urn:x-esri:specification:ServiceType:ArcIMS:Metadata:Server") {
                  dctype = null; // TODO guess the service type
                  links.push(gs.Object.create(gs.atom.Link).init({
                    rel: "related",
                    dctype: dctype,
                    href: text
                  }));
                } else if (scheme === "urn:x-esri:specification:ServiceType:ArcIMS:Metadata:Document") {
                  links.push(gs.Object.create(gs.atom.Link).init({
                    rel: "alternate",
                    type: "application/xml",
                    href: text
                  }));
                } else if (scheme === "urn:x-esri:specification:ServiceType:ArcIMS:Metadata:Thumbnail") {
                  links.push(gs.Object.create(gs.atom.Link).init({
                    rel: "icon",
                    href: text
                  }));
                }
              }
            } else if (ln === "alternative") { 
            } else if (ln === "spatial") { 
            }
          } else if (ln === "BoundingBox" || "WGS84BoundingBox") {
            // WGS84BoundingBox: LowerCorner x space y , UpperCorner x space y
            xmin = ymin = xmax = ymax = null;
            xmlInfo.forEachChild(childInfo.node,function(childInfo2){
              if (childInfo2.localName === "LowerCorner" || childInfo2.localName === "UpperCorner") {
                if (childInfo2.nodeText) {
                  try {
                    xy = childInfo2.nodeText.split(" ");
                    if (xy.length === 2) {
                      if (childInfo2.localName === "LowerCorner") {
                        xmin = task.val.strToNum(xy[0],null);
                        ymin = task.val.strToNum(xy[1],null);
                      } else {
                        xmax = task.val.strToNum(xy[0],null);
                        ymax = task.val.strToNum(xy[1],null);
                      }
                    }
                  } catch(excoords) {
                  }
                }
              }
            });
            if (typeof xmin === "number" && typeof ymin === "number" && 
                typeof xmax === "number" && typeof ymax === "number") {
              entry.bbox = gs.Object.create(gs.atom.BBox).init({
                xmin: xmin,
                ymin: ymin,
                xmax: xmax,
                ymax: ymax
              });
            }
          }
        }
      });
      
      if(links.length > 0) entry.link = links;
      return entry;
    }},
    
    itemToAtomEntry: {value: function(task,item) {
      return this.handleRecordToAtomEntry(task,item.xmlInfo,item.recordInfo);
    }}
  
  });

}());

