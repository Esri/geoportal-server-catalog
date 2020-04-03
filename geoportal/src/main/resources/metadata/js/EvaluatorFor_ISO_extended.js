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

G.evaluators.isoextended = {

  version: "iso.extended.v1",
/* this demonstrates how to extend or repair issues with an evaluator
and still allow custom deployments to take adavantage of improved
evaluators by extending evaluators, rather than doing copy-edit
uses ../testdata/iso19115/sciencebase_links.xml
test:
cd contrib/
metadatacli_dev.sh -md ../testdata/iso19115/sciencebase_authors.xml
ignore the errors. metadatacli needs to be redone as a spring application
at the end you should see:
typeKey=iso19115extended
detailsXslt=metadata/details/iso-details/xml-to-html-ISO.xsl
evaluated iso19115base
eval extended
evaluatedjson= ...
*/

  evaluate: function(task) {
      var metadataType = G._metadataTypes["iso19115base"];
      if (metadataType && metadataType.evaluator) {
          metadataType.evaluator.evaluate(task);
          print("evaluated iso19115base");
      }
      this.evalExtended(task);

  },

    evalExtended: function(task) {
    var item = task.item, root = task.root;
    var iden = G.getNode(task,root,"gmd:identificationInfo/gmd:MD_DataIdentification | gmd:identificationInfo/srv:SV_ServiceIdentification");
print ("eval extended");
/* fix issue 187:
https://github.com/Esri/geoportal-server-catalog/issues/187

 */
    G.evalProp(task,item,iden,"apiso_OrganizationName_txt","gmd:contact/gmd:CI_ResponsibleParty/gmd:organisationName/gco:CharacterString");

        /* publisher is defined as a Core Queryable in CSW 2.x.
        /gmd:MD_Metadata/gmd:contact[4]/gmd:CI_ResponsibleParty[1]/gmd:role[1]/gmd:CI_RoleCode[1]/@codeListValue
          */
    G.evalProps(task,item,root,"publisher_s","//gmd:CI_ResponsibleParty/gmd:role/gmd:CI_RoleCode[@codeListValue=\"publisher\"]/../../gmd:organisationName/*/text() | //gmd:CI_ResponsibleParty/gmd:role/gmd:CI_RoleCode[@codeListValue=\"pointOfContact\"]/../../gmd:organisationName/*/text()");

        /* creator is defined as a Core Queryable in CSW 2.x.
       SB puts authors in gmd:organisationName
         */
        G.evalProps(task,item,root,"creator_s","//gmd:CI_ResponsibleParty/gmd:role/gmd:CI_RoleCode[@codeListValue=\"originator\"]/../../gmd:organisationName/*/text() ");

        /*
          we want just links from the distribution, service and aggregation processes.
          step one, remove previous
          step two evaluate
           */
    G.clearProps(task,"links_s");
    G.evalProps(task,item,root,"links_s","/gmd:distributionInfo//gmd:MD_DigitalTransferOptions//gmd:linkage/gmd:URL | gmd:identificationInfo//srv:SV_OperationMetadata//gmd:linkage/gmd:URL | //gmd:aggregationInfo//gmd:code[starts-with(gco:CharacterString/text(),'http')]/gco:CharacterString");

    },



};
