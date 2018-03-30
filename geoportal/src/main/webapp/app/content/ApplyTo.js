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
    _forSourceUri: null,

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
      } else if (this.sourceUriNode.checked) {
        params.urlParams.sourceUri = this._forSourceUri;
        params.confirmationText = this.sourceUriLabelNode.innerHTML;
        params.isBulkUpdate = true;
      }
    },
    
    init: function() {
      this.itemNode.checked = true;
      this._forItemId = this.item._id;
      var nOptions = 1;
      var isAdmin = AppContext.appUser.isAdmin();
      var owner = this.item.sys_owner_s;
      var sourceName = this.item.src_source_name_s;
      var sourceUri = this.item.src_source_uri_s;
      
      var itemLabel = i18n.content.applyTo.itemLabel;
      var ownerPattern = i18n.content.applyTo.ownerPattern;
      var sourceUriPattern = i18n.content.applyTo.sourceUriPattern;
      if (this.forDelete) {
        itemLabel = i18n.content.applyTo.itemLabelDelete;
        ownerPattern = i18n.content.applyTo.ownerPatternDelete;
        sourceUriPattern = i18n.content.applyTo.sourceUriPatternDelete;
      }
      this.itemLabelNode.innerHTML = itemLabel;
      
      if (isAdmin && typeof owner === "string" && owner.length > 0) {
        ownerPattern = ownerPattern.replace("{name}",owner);
        this.ownerLabelNode.innerHTML = ownerPattern;
        this._forOwner = owner;
        nOptions++;
      } else {
        this.ownerSection.style.display = "none";
      }
      if (typeof sourceUri === "string" && sourceUri.length > 0 && 
          typeof sourceName === "string" && sourceName.length > 0) {
        sourceUriPattern = sourceUriPattern.replace("{name}",sourceName);
        this.sourceUriLabelNode.innerHTML = sourceUriPattern;
        this._forSourceUri = sourceUri;
        nOptions++;
      } else {
        this.sourceUriSection.style.display = "none";
      }
      
      if (nOptions === 1) {
        this.domNode.style.display = "none";
      }
    }

  });

  return oThisClass;
});