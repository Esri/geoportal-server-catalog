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
  "dojo/topic",
  "app/context/app-topics",
  "app/content/BulkEdit",
  "dojo/text!./templates/SetCollections.html",
  "dojo/i18n!app/nls/resources",
  "app/content/ApplyTo"],
function(declare, topic, appTopics, BulkEdit, template, i18n, ApplyTo) {

  var oThisClass = declare([BulkEdit], {
    
    i18n: i18n,
    templateString: template,
    
    title: i18n.content.setCollections.caption,
    okLabel: i18n.content.updateButton,
    
    _localValue: null,
    _collectionOptionsLoaded: false,

    postCreate: function() {
      this.inherited(arguments);
    },
    
    applyLocally: function(item) {
      topic.publish(appTopics.RefreshSearchResultPage,{
        searchPane: this.itemCard.searchPane
      });
    },
    
    init: function() {
      this.setNodeText(this.itemTitleNode,this.item.title);
      this._setLoadingOption();
      this._loadCollectionOptions();
      this.applyTo = new ApplyTo({
        item: this.item,
        itemCard: this.itemCard,
      },this.applyToNode);
    },

    _getCurrentCollectionValues: function() {
      var v = this.item["src_collections_s"];
      if (typeof v === "string" && v.length > 0) {
        return v.split(",").map(function(value) {
          return $.trim(value);
        }).filter(function(value) {
          return value.length > 0;
        });
      } else if (Array.isArray(v) && v.length > 0) {
        return v.map(function(value) {
          return typeof value === "string" ? $.trim(value) : "";
        }).filter(function(value) {
          return value.length > 0;
        });
      }
      return [];
    },

    _setLoadingOption: function() {
      var $input = $(this.collectionsValueInput);
      $input.empty();
      $input.append($("<option>", {
        value: "",
        text: i18n.general.working
      }));
      $input.val([]);
      $input.prop("disabled", true);
    },

    _loadCollectionOptions: function() {
      var self = this;
      if (this._collectionOptionsLoaded) {
        return;
      }
      $.getJSON("./stac/collections?limit=10000").done(function(response) {
        self._populateCollectionOptions(response && response.collections ? response.collections : []);
      }).fail(function(error) {
        self._populateCollectionOptions([]);
        self.handleError(i18n.general.error, error);
      });
    },

    _populateCollectionOptions: function(collections) {
      var currentValues = this._getCurrentCollectionValues();
      var $input = $(this.collectionsValueInput);
      var optionValues = {};

      $input.empty();

      if (!Array.isArray(collections)) {
        collections = [];
      }

      collections.forEach(function(collection) {
        if (!collection || typeof collection.id !== "string" || collection.id.length === 0) {
          return;
        }
        optionValues[collection.id] = true;
        $input.append($("<option>", {
          value: collection.id,
          text: collection.id
        }));
      });

      currentValues.forEach(function(value) {
        if (!optionValues[value]) {
          optionValues[value] = true;
          $input.append($("<option>", {
            value: value,
            text: value
          }));
        }
      });

      $input.val(currentValues);
      $input.prop("disabled", false);
      this._collectionOptionsLoaded = true;
    },
    
    makeRequestParams: function() {
      var params = {
        action: "setCollections",
        urlParams: {}
      };
      var selectedValues = $(this.collectionsValueInput).val();
      if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
        this.collectionsValueInput.focus();
        return null;
      }
      selectedValues = selectedValues.map(function(value) {
        return $.trim(value);
      }).filter(function(value) {
        return value.length > 0 && value !== "none";
      });
      if (selectedValues.length === 0) {
        this.collectionsValueInput.focus();
        return null;
      }
      this._localValue = params.urlParams.collections = selectedValues.join(",");
      this.applyTo.appendUrlParams(params);
      return params;
    }

  });

  return oThisClass;
});