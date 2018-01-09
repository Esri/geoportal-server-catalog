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
define(["dojo/_base/declare",
  "./Search",
  "dojo/text!./templates/TestSearch.html",
  "dijit/form/TextBox"],
function(declare, Search, template) {

  var oThisClass = declare([Search], {

    templateString: template,

    
    postCreate: function() {
      this.inherited(arguments);
    },
    
    /*
    informExternal: function(text) {
      try {
        if (window && window.external && window.external.gsHasListener) {
          window.external.gsListener(text);
        }
      } catch(ex) {
        console.error(ex);
        //alert(ex);
      }
    },
    */
    
    processResult: function(result) {
      
    },
    
    search: function() {
      if (!this._wasLoaded) return; // TODO need a ui error message
      
      var self = this;
      var q = this.qBox.get("value").trim();
      var target = this.targetBox.get("value").trim();
      
      var parameterMap = {f: "pjson"};
      if (q.length > 0) parameterMap.q = q;
      if (target.length > 0) parameterMap.target = target;
      
      var textarea = this.textareaNode;
      textarea.value = "Searching...";
      
      var requestInfo = {
        "requestUrl": "/request",
        "baseUrl": "/base",
        "headerMap": {},
        "parameterMap": parameterMap
      };
      console.log("parameterMap",parameterMap);

      var processor = gs.Object.create(gs.context.browser.WebProcessor);
      processor.execute(requestInfo,function(status,mediaType,entity,headers){
        //console.log(status,mediaType,"\r\n",entity);
        textarea.value = entity;
        self.informExternal(entity);
        
        try {
          //console.log("entity",typeof entity,entity);
          // TODO errors?
          var result = JSON.parse(entity);
          //console.log("result",result);
          self.processResult(result);
        } catch(ex) {
          console.error(ex);
        }
      });
      
    },
    
    searchClicked: function() {
      //this.search();
    }

  });

  return oThisClass;
});