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
        "dojo/dom-class",
        "dijit/TitlePane",
        "dojo/i18n!app/nls/resources"],
function(declare, lang, on, event, domConstruct, domClass, TitlePane, i18n) {

  var oThisClass = declare([TitlePane], {

    i18n: i18n,
    title: "Untitled",

    settingsNode: null,
    stopEvents: true,
    toolsNode: null,
    arrowIconNode: null,
    fixedOpen: false,

    postCreate: function() {
      this.inherited(arguments);
      this.toolsNode = domConstruct.create("span",{"class":"g-drop-pane-tools"});
      this.focusNode.appendChild(this.toolsNode);

      this.arrowIconNode = domConstruct.create("span",{
        "class":"g-drop-pane-arrow",
        "innerHTML": '<svg viewBox="0 0 24 24">' +
          '<path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />' +
          '</svg>'
      });
      this.arrowNode.insertBefore(this.arrowIconNode, this.arrowNode.domNode);

      this.own(on(this.toolsNode,"click",lang.hitch(this,function(e) {
        if (this.stopEvents) event.stop(e);
      })));
      this.own(on(this.toolsNode,"mousedown",lang.hitch(this,function(e) {
        if (this.stopEvents) event.stop(e);
      })));
      this.own(on(this.titleBarNode,"click",lang.hitch(this,function(e) {
        if (this.fixedOpen) {
          event.stop(e)
          this.hideNode.style.display="";
          domClass.remove(this.titleBarNode, 'dijitClosed dijitTitlePaneTitleClosed');
          domClass.add(this.titleBarNode, 'dijitOpen dijitTitlePaneTitleOpen');
        };
      })));
    },

    addSettingsLink: function() {
      var link = this.settingsNode = domConstruct.create("a",{
        href: "#",
        onclick: lang.hitch(this,function(e) {
          e.stopPropagation();
        })
      },this.toolsNode);
      link.innerHTML = '<svg viewBox="0 0 24 24">' +
        '<path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />' +
        '</svg>';
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
