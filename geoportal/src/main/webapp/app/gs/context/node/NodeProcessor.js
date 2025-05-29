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

  gs.context.node.NodeProcessor = gs.Object.create(gs.context.Processor,{

    newConfig: {writable:true,value:function() {
      // relative to server.js
      var config = gs.Object.create(gs.config.Config).mixin({
        cswCapabilitiesFile: "../../gs/config/csw-capabilities.xml",
        csw2CapabilitiesFile: "../../gs/config/csw2-capabilities.xml",
        opensearchDescriptionFile: "../../gs/config/opensearch-description.xml",
        ogcrecordsDescriptionFile: "../../gs/config/ogcrecords-description.json",
        ogcrecordsAPIFile: "../../gs/config/ogcrecords-api.json",
        ogcrecordsConformanceFile: "../../gs/config/ogcrecords-conformance.json",
        ogcrecordsCollectionsFile: "../../gs/config/ogcrecords-collections.json",
        ogcrecordsCollectionMetadataFile: "../../gs/config/ogcrecords-collection-metadata.json",
        ogcrecordsQueryablesFile: "../../gs/config/ogcrecords-queryables.json",
        ogcrecordsItemsFile: "../../gs/config/ogcrecords-items.json",
        ogcrecordsSchemaFile: "../../gs/config/ogcrecords-schema.json",
      });
      return config;
    }},

    newContext: {writable:true,value:function() {
      return gs.Object.create(gs.context.node.NodeContext);
    }}

  });

}());
