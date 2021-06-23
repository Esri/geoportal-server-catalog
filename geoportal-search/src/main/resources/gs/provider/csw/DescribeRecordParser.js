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

  gs.provider.csw.DescribeRecordParser = gs.Object.create(gs.Proto,{

    cswProvider: {writable: true, value: null},
    task: {writable: true, value: null},
    xmlInfo: {writable: true, value: null},
    
    parseBody: {writable:true,value:function(cswProvider,task) {
      this.cswProvider = cswProvider;
      this.task = task;
      this.xmlInfo = null;
      var body = null, xmlInfo = null, ows, msg;
      var filterNode, sortByNode;

      if (task.request && task.request.body && typeof task.request.body === "string") {
        body = task.request.body.trim();
        if (body.length > 0) {
          try {
            xmlInfo = this.xmlInfo = task.context.newXmlInfo(task,body);
          } catch(ex) {
            msg = "Error parsing DescribeRecord xml:";
            if (ex && ex.message) msg += ex.message;
            ows = gs.Object.create(gs.provider.csw.OwsException);
            ows.put(task,ows.OWSCODE_NoApplicableCode,"",msg);
          }
        }
      }
      if (!xmlInfo || !xmlInfo.root) return;

      var rootInfo = xmlInfo.getNodeInfo(xmlInfo.root);
      if (rootInfo.localName === "DescribeRecord") {
        if (rootInfo.namespaceURI === task.uris.URI_CSW2) {
          task.isCsw2 = true;
        }
      } else {
        return; // TODO throw an error?
      }

      xmlInfo.forEachAttribute(xmlInfo.root,function(attr){
        if (attr.localName.toLowerCase() === "schemaLanguage".toLowerCase()) {
          cswProvider.addOverrideParameter(task,"schemaLanguage",attr.nodeText);
        }
        if (attr.localName.toLowerCase() === "outputFormat".toLowerCase()) {
          cswProvider.addOverrideParameter(task,"outputFormat",attr.nodeText);
        }
      });

      xmlInfo.forEachChild(xmlInfo.root,function(level2){
        if (level2.localName === "TypeName") {
          var typeName = level2.nodeText;
          if (typeof typeName === "string" && typeName.trim().length > 0) {
            cswProvider.addOverrideParameter(task,"TypeName",typeName.trim());
          }
        }
      });

    }},

    /* .............................................................................................. */

  });

}());
