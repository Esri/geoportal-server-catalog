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
  "dojo/_base/lang",
  "require",
  "dojo/on",
  "dojo/keys",
  "dojo/io-query",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dojo/text!./templates/Search.html",
  "../all"],
function(declare, lang, localRequire, on, keys, ioQuery, _WidgetBase, _TemplatedMixin, 
  _WidgetsInTemplateMixin, template) {

  var oThisClass = declare([_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {

    templateString: template,
    
    _wasLoaded: false,
    
    postCreate: function() {
      this.inherited(arguments);
      var self = this;
      this.own(on(this.qNode,"keyup",function(evt) {
        if (evt.keyCode === keys.ENTER) self.search();
      }));
      gs.reqAll(localRequire,function(){
        self._wasLoaded = true;
        //console.warn("Search._wasLoaded",self._wasLoaded);
      });
    },
    
    search: function() {
      if (!this._wasLoaded) return; // TODO need a ui error message
      
      var inform = function(text) {
        try {
          if (window && window.external && window.external.gsHasListener) {
            window.external.gsListener(text);
          }
        } catch(ex) {
          console.error(ex);
          //alert(ex);
        }
      };
      
      var textarea = this.textareaNode;
      textarea.value = "Searching...";
      
      var parameterMap = {};
      var qstr = this.qNode.value.trim();
      if (qstr.length > 0) {
        parameterMap = ioQuery.queryToObject(qstr);
      }
      
      var requestInfo = {
        "requestUrl": "/request",
        "baseUrl": "/base",
        "headerMap": {},
        "parameterMap": parameterMap
      };
      //requestInfo.requestUrl = "http://www.geoportal.com/geoportal/opensearch/description";
      var processor = gs.Object.create(gs.context.browser.WebProcessor);
      processor.execute(requestInfo,function(status,mediaType,entity,task){
        //console.log(status,mediaType,"\r\n",entity);
        textarea.value = entity;
        inform(entity);
      });
      
    },
    
    searchClicked: function() {
      this.search();
    }

  });

  return oThisClass;
});