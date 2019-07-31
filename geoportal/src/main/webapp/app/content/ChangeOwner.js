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
  "dojo/keys",
  "dojo/on",
  "dojo/topic",
  "app/context/app-topics",
  "app/content/BulkEdit",
  "dojo/text!./templates/ChangeOwner.html",
  "dojo/i18n!app/nls/resources",
  "app/content/ApplyTo",
  "app/context/AppClient"],
function(declare, keys, on, topic, appTopics, BulkEdit, template, i18n, 
  ApplyTo, AppClient) {

  var oThisClass = declare([BulkEdit], {
    
    i18n: i18n,
    templateString: template,
    
    title: i18n.content.changeOwner.caption,
    okLabel: i18n.content.updateButton,
    
    _localValue: null,

    postCreate: function() {
      this.inherited(arguments);
    },
    
    applyLocally: function(item) {
      //item["sys_owner_s"] = this._localValue;
      //topic.publish(appTopics.ItemOwnerChanged,{item:item});
      topic.publish(appTopics.RefreshSearchResultPage,{
        searchPane: this.itemCard.searchPane
      });
    },
    
    init: function() {
      var self = this;
      this.setNodeText(this.itemTitleNode,this.item.title);
      this.setNodeText(this.currentOwnerNode,this.item.sys_owner_s);      
      this.own(on(this.newOwnerNode,"keyup",function(evt) {
        if (evt.keyCode === keys.ENTER) self.execute();
      }));
      this.applyTo = new ApplyTo({
        item: this.item,
        itemCard: this.itemCard,
      },this.applyToNode);
    },
    
    makeRequestParams: function() {
      var params = {
        action: "setOwner",
        urlParams: {}
      };
      var v = this.newOwnerNode.value;
      if (typeof v === "string") v = v.trim();
      if (typeof v !== "string" || v.length === 0) {
        this.newOwnerNode.focus();
        return null;
      }
      this._localValue = params.urlParams.newOwner = v;
      this.applyTo.appendUrlParams(params);
      return params;
    },
    
    modalShown: function() {
      
      var client = new AppClient();
      var url = "./elastic/"+AppContext.geoportal.metadataIndexName+"/item/_search";
      url = client.appendAccessToken(url); // TODO append access_token?
      
      var usernames = new window.Bloodhound({
        name: "usernames",
        datumTokenizer: function(datum) {return window.Bloodhound.tokenizers.whitespace(datum);},
        queryTokenizer: window.Bloodhound.tokenizers.whitespace,
        remote: {
          url: url,
          prepare: function (query, settings) {
            settings.type = "POST";
            settings.contentType = "application/json; charset=UTF-8";
            var data = {
                "size": 500,
                "query": {
                  "match_phrase_prefix": {
                    "sys_owner_txt": query
                  }
                },
                "aggregations": {
                  "usernames": {
                    "terms": {field: "sys_owner_s"}
                  }
                }
            };
            settings.data = JSON.stringify(data);
            return settings;
          },
          transform: function(response) {
            if (response.aggregations.usernames.buckets.length > 0) {
              var names = $.map(response.aggregations.usernames.buckets, function(bucket) {
                return bucket.key;
              });
              names.sort();
              return names;
            }
            return [];
          }
        }
      });
      
      $("#"+this.id+"_newOwner").typeahead(
        {
          hint: true,
          highlight: true,
          minLength: 1
        },
        {
          name: 'usernames',
          limit: Number.POSITIVE_INFINITY,
          source: usernames
        }
      );

      this.newOwnerNode.focus();
    }

  });

  return oThisClass;
});