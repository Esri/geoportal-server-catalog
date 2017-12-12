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

  gs.writer.ErosWriter = gs.Object.create(gs.writer.AtomWriter,{
    
    addNamespaces: {value: function(task,xmlBuilder) {
      gs.writer.AtomWriter.addNamespaces.call(this,task,xmlBuilder); // call super
      xmlBuilder.writeNamespace("sdi",task.uris.URI_SDI);
    }},
    
    beforeEndEntry: {value: function(task,xmlBuilder,item,options,entry) {
      this.writeSDI(task,xmlBuilder,item,options,entry);
      gs.writer.AtomWriter.beforeEndEntry.call(this,task,xmlBuilder,item,options,entry); // call super
    }},
    
    writeSDI: {value: function(task,xmlBuilder,item,options,entry) {
      var i, r, resources;
      
      // Eros type conversion table
      var ETCT = {
        "FeatureServer": "agsfeatureserver",
        "Feature Service": "agsfeatureserver",
        "ImageServer": "agsimageserver",
        "Image Service": "agsimageserver",
        "MapServer": "agsmapserver",
        "Map Service": "agsmapserver",
        "CSW": "csw",
        "IMS": "image",
        "SOS": "sos",
        "WCS": "wcs",
        "WFS": "wfs",
        "WMS": "wms"
      };
      
      var ok = false, k, lc, v;
      var metadataUrl, serviceUrl, serviceType, emailAddress = "";
      var links = entry.link;
      if (!Array.isArray(links)) links = [entry.link];
      links.forEach(function(link){
        if (gs.atom.Link.isPrototypeOf(link)) {
          if (typeof link.href === "string" && link.href.length > 0) {
            if (link.rel === "alternate.xml") {
              metadataUrl = link.href;
            } else if (link.rel === "related" && !ok) {
              //console.log(link.rel,link.type,link.href);
              v = null;
              if (typeof link.type === "string" && link.type.length > 0) {
                lc = link.type.toLowerCase();
                for (k in ETCT) {
                  if (k.toLowerCase() === lc) {
                    v = ETCT[k];
                    break;
                  }
                }
              }
              if (v) {
                ok = true;
                serviceUrl = link.href;
                serviceType = v;
              }
            }
          }
        }
      });
      
      if (ok) {
        if (typeof metadataUrl === "string" && metadataUrl.length > 0) {
          xmlBuilder.writeElement(task.uris.URI_SDI,"metadataUrl",metadataUrl);
        }
        xmlBuilder.writeElement(task.uris.URI_SDI,"serviceUrl",serviceUrl);
        xmlBuilder.writeElement(task.uris.URI_SDI,"serviceType",serviceType);
        xmlBuilder.writeElement(task.uris.URI_SDI,"emailAddress",emailAddress);
      }
    }}
  
  });

}());
