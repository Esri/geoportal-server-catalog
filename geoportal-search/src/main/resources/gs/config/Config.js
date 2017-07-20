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
  
  gs.config.Config = gs.Object.create(gs.Proto,{
    
    defaultTarget: {writable: true, value: "arcgis"},
    
    allowDynamicTarget: {writable: true, value: true},
    
    cswCapabilitiesFile: {writable: true, value: "gs/config/csw-capabilities.xml"},
    
    opensearchDescriptionFile: {writable: true, value: "gs/config/opensearch-description.xml"},
  
    makeTargets: {value: function() {
      
      var targets = {
        
        "arcgis": gs.Object.create(gs.target.portal.PortalTarget).mixin({
          "portalBaseUrl": "https://www.arcgis.com"
        }),
        
        "primary": gs.Object.create(gs.target.elastic.GeoportalTarget).mixin({
          "searchUrl": "http://gptdb1.esri.com:8080/geoportal/elastic/metadata/item/_search"
        }),
        
        "elastic1": gs.Object.create(gs.target.elastic.ElasticTarget).mixin({
          "searchUrl": "http://localhost:9200/metadata/item/_search"
        }),
        
        "elastic2": gs.Object.create(gs.target.elastic.ElasticTarget).mixin({
          "searchUrl": "http://gptdb1.esri.com:9200/metadata/item/_search"
        }),
  
        "gptdb1": gs.Object.create(gs.target.elastic.GeoportalTarget).mixin({
          "searchUrl": "http://gptdb1.esri.com:8080/geoportal/elastic/metadata/item/_search"
        }),
        
        "gptdb2": gs.Object.create(gs.target.elastic.GeoportalTarget).mixin({
          "searchUrl": "http://gptdb2.esri.com:8080/geoportal/elastic/img/item/_search"
        }),
        
        "portal1": gs.Object.create(gs.target.portal.PortalTarget).mixin({
          "portalBaseUrl": "http://urbanvm.esri.com/arcgis"
        })
        
      };
  
      return targets;
    }}
  
  });
  
}());
