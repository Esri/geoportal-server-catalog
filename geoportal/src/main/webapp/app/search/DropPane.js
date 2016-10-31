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
        "dojo/on",
        "dojo/_base/event",
        "dojo/dom-construct",
        "dijit/TitlePane",
        "dojo/i18n!app/nls/resources"], 
function(declare, lang, on, event, domConstruct, TitlePane, i18n) {

  var oThisClass = declare([TitlePane], {
  
    i18n: i18n,
    title: "Untitled",
    
    settingsNode: null,
    stopEvents: true,
    toolsNode: null,
    
    postCreate: function() {
      this.inherited(arguments);
      this.toolsNode = domConstruct.create("span",{"class":"g-drop-pane-tools"});
      this.focusNode.appendChild(this.toolsNode);
      this.own(on(this.toolsNode,"click",lang.hitch(this,function(e) {
        if (this.stopEvents) event.stop(e);
      })));
      this.own(on(this.toolsNode,"mousedown",lang.hitch(this,function(e) {
        if (this.stopEvents) event.stop(e);
      })));
      
    },
    
    addSettingsLink: function() {
      var link = this.settingsNode = domConstruct.create("a",{
        href: "#",
        onclick: lang.hitch(this,function(e) {
          e.stopPropagation();
        })
      },this.toolsNode);
      link.innerHTML = "<span class=\"glyphicon glyphicon-cog\"></span>";
      link.title = i18n.general.settings;
      return link;
    },
    
    setDisplayTools: function(bVisible) {
      if (bVisible) this.toolsNode.style.display = "";
      else this.toolsNode.style.display = "none";
    }
    
  });
  
  return oThisClass;
});