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

G.writers.csv = {
  
  esc: function(s) {
    if (s === null) return s;
    s = s.replace(/"/g,'""');
    if (s.search(/("|,|\n)/g) >= 0) s = "\""+s+"\"";
    return s;
  },
  
  writeItem: function(appRequest,appResponse,itemId,itemString,responseString) {
    var now = G.nowAsString();
    var options = {now:now,entryOnly:true};
    var stringBuilder = new java.lang.StringBuilder();
    this._writeEntry(appRequest,itemId,itemString,stringBuilder,options);
    this._writeAppResponse(appRequest,appResponse,stringBuilder);
  },
  
  writeItems: function(searchRequest,appResponse,searchResponse) {
    var searchHits = searchResponse.getHits();
    var now = G.nowAsString();
    var options = {now:now, entryOnly:false};
    var stringBuilder = new java.lang.StringBuilder();
    
    var header = "Id,Title,Description,West,South,East,North,Link_Xml,Link_1,Link_2,Link_3,Link_4";
    stringBuilder.append(header);
    
    var hits = searchHits.getHits();
    var i,hit;
    for (i=0;i<hits.length;i++) {
      hit = hits[i];
      this._writeEntry(searchRequest,hit.getId(),hit.getSourceAsString(),stringBuilder,options);
    }
    this._writeAppResponse(searchRequest,appResponse,stringBuilder);
  },
  
  _writeAppResponse: function(appRequest,appResponse,stringBuilder) {
    var mediaType = new G.MediaType("text","csv");
    var csv = stringBuilder.toString();
    appResponse.setOk();
    appResponse.setMediaType(mediaType.withCharset("UTF-8"));
    appResponse.setEntity(csv);
    appResponse.addHeader("Content-Disposition",
      "filename="+java.lang.System.currentTimeMillis()+".csv");
  },
  
  _writeEntry: function(request,itemId,itemString,stringBuilder,options) {
    var i,v;
    var item = JSON.parse(itemString);
    
    var title = G.chkStr(item["title"]);
    var description = G.chkStr(item["description"]);
    var rights = G.chkStrArray(item["rights_s"]);
    var extent = item["envelope_geo"];
    var resources = item["resources_nst"];
    var links = G.buildLinks(request,itemId,item);
    
    if (title === null || title.length === 0) title = "";
    if (description === null || description.length === 0) description = "";
    
    // TODO description with html and links
    
    var line = this.esc(itemId);
    line += ","+this.esc(title);
    line += ","+this.esc(description);
    
    var xmin = "", ymin = "", xmax = "", ymax = "";
    if (extent && extent.type && extent.type === "envelope" && extent.coordinates && extent.coordinates.length === 2) {
      var topLeft = extent.coordinates[0];
      var bottomRight = extent.coordinates[1];
      if (topLeft != null && topLeft.length === 2 && bottomRight != null && bottomRight.length === 2) {
        var coordinates = [topLeft[0],bottomRight[1],bottomRight[0],topLeft[1]];
        xmin = coordinates[0];
        ymin = coordinates[1];
        xmax = coordinates[2];
        ymax = coordinates[3];
      }
    }
    line += ","+xmin+","+ymin+","+xmax+","+ymax;
    
    var xmlLink = "", link1 = "", link2 = "", link3 = "", link4 = "";
    if (links) print("links.length",links.length);
    if (links && links.length > 0) {
      if (links != null) {
        for (i=0;i<links.length;i++) {
          v = links[i];
          if (v.rel === "alternate.xml") {
            xmlLink = v.href;
          } else if (v.rel.indexOf("alternate.") === -1) {
            if (typeof v.href === "string" && v.href.length > 0) {
              if (link1.length === 0) link1 = v.href;
              else if (link2.length === 0) link2 = v.href;
              else if (link3.length === 0) link3 = v.href;
              else if (link4.length === 0) link4 = v.href;
            }
          }
        }
      }
    }
    line += ","+this.esc(xmlLink);
    line += ","+this.esc(link1);
    line += ","+this.esc(link2);
    line += ","+this.esc(link3);
    line += ","+this.esc(link4);
    
    stringBuilder.append("\r\n").append(line);
  }
};

function writeItem(appRequest,appResponse,itemId,itemString,responseString) {
  G.writers.csv.writeItem(appRequest,appResponse,itemId,itemString,responseString);
}

function writeItems(searchRequest,appResponse,searchResponse) {
  G.writers.csv.writeItems(searchRequest,appResponse,searchResponse);
}
