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
  "app/common/Templated",
  "dojo/text!./templates/ApplyTo.html",
  "dojo/i18n!app/nls/resources"],
function(declare, lang, Templated, template, i18n) {

  var oThisClass = declare([Templated], {
    
    i18n: i18n,
    templateString: template,
    
    forDelete: false,
    item: null,
    itemCard: null,
    
    _forItemId: null,
    _forOwner: null,
    _forSiteId: null,

    postCreate: function() {
      this.inherited(arguments);
      this.init();
    },
    
    appendUrlParams: function(params) {
      if (this.itemNode.checked) {
        params.urlParams.id = this._forItemId;
      } else if (this.ownerNode.checked) {
        params.urlParams.owner = this._forOwner;
        params.confirmationText = this.ownerLabelNode.innerHTML;
        params.isBulkUpdate = true;
      } else if (this.siteNode.checked) {
        params.urlParams.srcUri = this._forSiteId;
        params.confirmationText = this.siteLabelNode.innerHTML;
        params.isBulkUpdate = true;
      }
    },
    
    init: function() {
      this.itemNode.checked = true;
      this._forItemId = this.item._id;
      var isAdmin = AppContext.appUser.isAdmin();
      var owner = this.item.sys_owner_s;
      var site = this.item.src_source_name_s;
      var siteId = this.item.src_uri_s;
      
      isAdmin = true; // TODO temporary
      
      var itemLabel = i18n.content.applyTo.itemLabel;
      var ownerPattern = i18n.content.applyTo.ownerPattern;
      var sitePattern = i18n.content.applyTo.sitePattern;
      if (this.forDelete) {
        itemLabel = i18n.content.applyTo.itemLabelDelete;
        ownerPattern = i18n.content.applyTo.ownerPatternDelete;
        sitePattern = i18n.content.applyTo.sitePatternDelete;
      }
      this.itemLabelNode.innerHTML = itemLabel;
      
      if (isAdmin && typeof owner === "string" && owner.length > 0) {
        ownerPattern = ownerPattern.replace("{username}",owner);
        this.ownerLabelNode.innerHTML = ownerPattern;
        this._forOwner = owner;
      } else {
        this.ownerSection.style.display = "none";
      }
      if (typeof siteId === "string" && siteId.length > 0 && 
          typeof site === "string" && site.length > 0) {
        sitePattern = sitePattern.replace("{sitename}",site);
        this.siteLabelNode.innerHTML = sitePattern;
        this._forSiteId = siteId;
      } else {
        this.siteSection.style.display = "none";
      }
      
      if (this._forOwner === null && this._forSiteId === null) {
        this.domNode.style.display = "none";
      }
    }

  });

  return oThisClass;
});