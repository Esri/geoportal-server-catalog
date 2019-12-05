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
    programCode: [ "010:00" ]
  };

  gs.writer.DcatWriter = gs.Object.create(gs.writer.JsonWriter,{

    writeEntry: {writable:true,value:function(task,results,item,options) {
      var json = task.target.itemToJson(task,item) || {};
      var dcat = {
        identifier: json.id,
        title: json.title || '<unknown>',
        description: json.description || '<unknown>',
        modified: json.updated || json.published || new Date().toISOString(),
        
        "@type": "dcat:Dataset",
        "license": DCAT_DEFAULTS.license,
        "accessLevel": DCAT_DEFAULTS.accessLevel,
        "bureauCode": DCAT_DEFAULTS.bureauCode,
        "programCode": DCAT_DEFAULTS.programCode
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
        "@type": "dcat:Catalog"
//        start: searchResult.startIndex,
//        num: numReturned, // searchResult.itemsPerPage?
//        total: searchResult.totalHits,
//        nextStart: searchResult.calcNextRecord(task)
      };
//      if (task.target.schema &&
//          typeof task.target.schema .schemaType === "string" &&
//          task.target.schema.schemaType.length > 0) {
//        response.sourceType = task.target.schema.schemaType;
//        response.sourceKey = task.target.key;
//      }

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
