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
  "dojo/_base/array",
  "dojo/date/locale",
  "dojo/dom-class",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dojo/text!./templates/ItemCard.html",
  "./util"],
function(declare, array, locale, domClass, _WidgetBase, _TemplatedMixin,
  _WidgetsInTemplateMixin, template, util, LayerLoader) {

  var _def = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    i18n: null,
    templateString: template,

    canRemove: false,
    item: null,
    resultsPane: null,

    _dfd: null,

    postCreate: function() {
      this.inherited(arguments);
    },

    startup: function() {
      if (this._started) {
        return;
      }
      this.inherited(arguments);
      this.render();
    },

    addClicked: function() {
      return;
      /*
      var self = this,
        btn = this.addButton;
      if (domClass.contains(btn, "disabled")) {
        return;
      }
      domClass.add(btn, "disabled");

      if (this.canRemove) {
        var map = this.resultsPane.getMap();
        util.setNodeText(self.messageNode, i18n.search.item.messages.removing);
        var lyrs = util.findLayersAdded(map, this.item.id).layers;
        array.forEach(lyrs, function(lyr) {
          //console.warn("removingLayer",lyr);
          map.removeLayer(lyr);
        });
        this.canRemove = false;
        util.setNodeText(self.messageNode, "");
        util.setNodeText(this.addButton, i18n.search.item.actions.add);
        domClass.remove(btn, "disabled");

      } else {
        util.setNodeText(self.messageNode, i18n.search.item.messages.adding);
        var loader = new LayerLoader();
        loader.addItem(this.item, this.resultsPane.getMap()).then(function(result) {
          //console.warn("addClicked.result",result);
          if (result) {
            self.canRemove = true;
            util.setNodeText(self.messageNode, "");
            util.setNodeText(self.addButton, i18n.search.item.actions.remove);
            domClass.remove(btn, "disabled");
          } else {
            util.setNodeText(self.messageNode, i18n.search.item.messages.addFailed);
            domClass.remove(btn, "disabled");
          }
        }).otherwise(function(error) {
          console.warn("Add layer failed.");
          console.warn(error);
          util.setNodeText(self.messageNode, i18n.search.item.messages.addFailed);
          domClass.remove(btn, "disabled");
          if (error && typeof error.message === "string" && error.message.length > 0) {
            // TODO show this message
            //console.warn("msg",error.message);
            //util.setNodeText(self.messageNode,error.message);
            console.log('');
          }
        });
      }
      */
    },

    detailsClicked: function() {
      var item = this.item;
      var baseUrl = util.checkMixedContent(item.portalUrl);
      var url = baseUrl + "/home/item.html?id=" + encodeURIComponent(item.id);
      window.open(url);
    },

    formatDate: function(date) {
      /*
      if (typeof(date) === "number") {
        date = new Date(date);
      }
      var fmt = i18n.search.item.dateFormat;
      return locale.format(date, {
        selector: "date",
        datePattern: fmt
      });
      */

      if (typeof(date) === "number") date = new Date(date);
      return locale.format(date,{selector:"date",formatLength:"long"});
    },

    render: function() {
      util.setNodeText(this.titleNode, this.item.title);
      util.setNodeTitle(this.titleNode, this.item.title);
      /*
      util.setNodeText(this.titleNode, this.item.title);
      util.setNodeTitle(this.titleNode, this.item.title);
      this._renderThumbnail();
      this._renderTypeOwnerDate();
      if (this.canRemove) {
        util.setNodeText(this.addButton, i18n.search.item.actions.remove);
      }
      */
    },

    _renderThumbnail: function() {
      var nd = this.thumbnailNode,
        thumbnailUrl = this.item.thumbnailUrl;
      nd.innerHTML = "";
      thumbnailUrl = util.checkMixedContent(thumbnailUrl);
      var thumbnail = document.createElement("IMG");
      thumbnail.src = thumbnailUrl || "widgets/AddData/images/placeholder_120x80.png";
      nd.appendChild(thumbnail);
    },

    _renderTypeOwnerDate: function() {
      var s, item = this.item;

      var sType = i18n.search.item.types[item.type];
      if (typeof sType === "undefined" || sType === null) {
        sType = item.type;
      }
      var typeByOwnerPattern = i18n.search.item.typeByOwnerPattern;
      s = typeByOwnerPattern.replace("{type}", sType);
      s = s.replace("{owner}", item.owner);
      util.setNodeText(this.typeByOwnerNode, s);

      /*
      var sDate = this.formatDate(item.modified);
      s = i18n.search.item.datePattern.replace("{date}",sDate);
      util.setNodeText(this.dateNode,s);
      */
    }

  });

  return _def;
});
