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
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dojo/text!./templates/TargetSetting.html",
  "dijit/form/Form",
  "dijit/form/ValidationTextBox",
  "dijit/form/CheckBox"],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template) {

  var _def = declare([_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {

    i18n: null,
    isTargetSetting: true,
    properties: null,
    templateString: template,

    postCreate: function() {
      this.inherited(arguments);
      var props = this.properties;
      this.nameTextBox.set("value",props.name);
      this.urlTextBox.set("value",props.url);
      this.typeTextBox.set("value",props.type);
      this.profileTextBox.set("value",props.profile);
      this.filterTextBox.set("value",props.requiredFilter);
      this.useProxyCheckBox.set("value",!!props.useProxy);
    },

    destroy: function() {
      this.inherited(arguments);
    },

    /* ..................................................................... */

    deleteClicked: function() {
    },

    getProperties: function() {
      var props = this.properties;
      var chkStr = function(name,v) {
        if (typeof v === "string" && v.length > 0) {
          props[name] = v;
        } else {
          props[name] = null;
        }
      };
      chkStr("name",this.nameTextBox.get("value"));
      chkStr("url",this.urlTextBox.get("value"));
      chkStr("type",this.typeTextBox.get("value"));
      chkStr("profile",this.profileTextBox.get("value"));
      chkStr("requiredFilter",this.filterTextBox.get("value"));
      props.useProxy = !!this.useProxyCheckBox.get("value");
      return props;
    },

    validate: function() {
      return this.inputForm.validate();
    }

  });

  return _def;
});
