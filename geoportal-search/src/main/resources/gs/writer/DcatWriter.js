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

  var DCAT_DEFAULTS = {
    accessLevel: "public",
    license: "http://www.usa.gov/publicdomain/label/1.0/",
    bureauCode: [ "010:04" ],
    programCode: [ "010:000" ],
    publisher: {
      "@type": "org:Organization",
      name: "Your Publisher"
    },
    contactPoint: {
      "@type": "vcard:Contact",
      fn: "Your contact point",
      hasEmail: "mailto:email@your.org"
    },
    keyword: ["metadata"]
  };

  function selectValidDate() {
    var validDates = Array.prototype.slice.call(arguments)
                      .map(function(d) { return Date.parse(d); })
                      .filter(function(d) { return !!d; })
                      .map(function(d) { return new Date(d); });
              
    return validDates!=null && validDates.length>0? 
           validDates[0].toISOString(): null;
  }
  
  function isHrefValid(href) {
    var proto = ["http://", "https://", "ftp://", "ftps://"]
    if (href) {
      for (var i=0; i<proto.length; i++) {
        if (href.startsWith(proto[i])) {
          return true;
        }
      }
    }
    return false
  }
  
  gs.writer.DcatWriter = gs.Object.create(gs.writer.JsonWriter,{

    writeEntry: {writable:true,value:function(task,results,item,options) {
      var json = task.target.itemToJson(task,item) || {};
      var src = json._source || {};
      
      var dcat = {
        identifier: json.id,
        title: json.title || '<unknown>',
        description: json.description || '<unknown>',
        modified: selectValidDate(json.updated, json.published) || new Date().toISOString(),
        keyword: src.keywords_s || DCAT_DEFAULTS.keyword,
        distribution: [],
        
        "@type": "dcat:Dataset",
        "license": DCAT_DEFAULTS.license,
        "accessLevel": DCAT_DEFAULTS.accessLevel,
        "bureauCode": DCAT_DEFAULTS.bureauCode,
        "programCode": DCAT_DEFAULTS.programCode,
        "publisher": DCAT_DEFAULTS.publisher,
        "contactPoint": DCAT_DEFAULTS.contactPoint
      }
      
      if (isHrefValid(src.fileid)) {
        dcat.distribution.push({
          "@type": "dcat:Distribution",
          "mediaType": "application/octet-stream",
          "downloadURL": src.fileid
        })
      }
      
      if (json.links) {
        for (var li =0; li<json.links.length; li++) {
          var link = json.links[li]
          if (isHrefValid(link.href)) {
            dcat.distribution.push({
              "@type": "dcat:Distribution",
              "mediaType": link.type || "application/octet-stream",
              "accessURL": link.href
            })
          }
        }
      }
      
      if (src.envelope_geo && src.envelope_geo.length>0) {
        var env = src.envelope_geo[0]
        if (env.coordinates && env.coordinates.length==2) {
          var lowerLeft = env.coordinates[0]
          var upperRight = env.coordinates[1]
          if (lowerLeft && lowerLeft.length==2 && upperRight && upperRight.length==2) {
            dcat.spatial = [lowerLeft.map(function(coord){ return ""+coord }).join(","), upperRight.map(function(coord){ return ""+coord }).join(",")].join(",")
          }
        }
      }
      
      results.push(dcat);
    }},

    writeItems: {writable:true,value:function(task,searchResult) {
      var now = task.val.nowAsString();
      var options = {now: now, entryOnly: false};

      var items = searchResult.items ? searchResult.items : [];
      var numReturned = items.length;
      if (searchResult.itemsPerPage === 0) numReturned = 0;
      var response = {
        conformsTo: "https://project-open-data.cio.gov/v1.1/schema",
        describedBy: "https://project-open-data.cio.gov/v1.1/schema/catalog.json",
        "@context": "https://project-open-data.cio.gov/v1.1/schema/catalog.jsonld",
        "@type": "dcat:Catalog",
        start: searchResult.startIndex,
        num: numReturned,
        total: searchResult.totalHits,
        nextStart: searchResult.calcNextRecord(task)
      };

      response.dataset = [];
      if (searchResult.itemsPerPage > 0) {
        for (var i=0;i<items.length;i++) {
          this.writeEntry(task,response.dataset,items[i],options);
        }
      }
      this.writeResponse(task,response);
    }},

  });

}());
