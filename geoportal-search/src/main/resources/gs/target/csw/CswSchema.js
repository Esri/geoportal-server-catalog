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
    
    handleRecordToAtomEntry: {value:function(task,xmlInfo,recordInfo) {
      // TODO this needs to be completed
      var ln, ns, hasText, text;
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
              //console.log("identifier",text);
              //TODO
              //<dc:identifier scheme="urn:x-esri:specification:ServiceType:ArcIMS:Metadata:FileID">http://www.tnccmaps.org:80/arcgis/services/Paj/Paj_Influences_201711/MapServer/33</dc:identifier>
              //<dc:identifier scheme="urn:x-esri:specification:ServiceType:ArcIMS:Metadata:DocID">{72276FF9-009D-4D3B-ACE1-F1ED63D74F8F}</dc:identifier>

              entry.id = text;
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
            } else if (ln === "modified") {
            } else if (ln === "references") { 
            } else if (ln === "alternative") { 
            } else if (ln === "spatial") { 
            }
          } else if (ns === task.uris.URI_OWS) {
            if (ln === "BoundingBox") {
            } else if (ln === "WGS84BoundingBox") {  
            }
          } else if (ns === task.uris.URI_OWS2) {
            if (ln === "BoundingBox") {
            } else if (ln === "WGS84BoundingBox") {  
            }
          } else if (ns === task.uris.URI_GML) {
          } else if (ns === task.uris.URI_GML2) {  
          }
        }
      });
      return entry;
    }},
    
    itemToAtomEntry: {value: function(task,item) {
      return this.handleRecordToAtomEntry(task,item.xmlInfo,item.recordInfo);
    }}
  
  });

}());

