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
/**
 * StatusModal - reusable modal dialog for status messages (success /
 * error / info).
 *
 * Usage:
 *   StatusModal.show({ title: "Saved", message: "...", type: "success" });
 *   StatusModal.error("message");   StatusModal.success("message");
 *   StatusModal.hide();
 * show() returns a promise resolved when the dialog is closed.
 */
define([
  "dojo/_base/declare",
  "dojo/Deferred",
  "app/common/Templated",
  "dojo/text!./templates/StatusModal.html"
], function (declare, Deferred, Templated, template) {

  var COLORS = { success: "green", error: "red", info: "rgb(0, 102, 255)", warning: "orange" };

  var Modal = declare([Templated], {
    templateString: template,
    _deferred: null,

    show: function (options) {
      options = options || {};
      var type = options.type || "info";
      var color = options.color || COLORS[type] || COLORS.info;
      var title = options.title;
      if (title === undefined || title === null || title === "") {
        title = type === "error" ? this.i18n.general.error : "";
      }
      this.titleNode.innerText = title;
      this.titleNode.parentNode.style.display = title ? "" : "none";
      this.messageNode.innerText = options.message === undefined || options.message === null ? "" : String(options.message);
      this.barNode.style.backgroundColor = color;
      if (this._deferred) this._deferred.resolve();
      this._deferred = new Deferred();
      this.overlayNode.classList.remove("hidden");
      return this._deferred.promise;
    },

    hide: function () {
      this.overlayNode.classList.add("hidden");
      var d = this._deferred;
      this._deferred = null;
      if (d) d.resolve();
    },

    _onClose: function () { this.hide(); }
  });

  var instance = null;
  function getInstance() {
    if (!instance) {
      instance = new Modal({});
      instance.placeAt(document.body);
      instance.startup();
    }
    return instance;
  }

  return {
    show: function (options) { return getInstance().show(options); },
    success: function (message, title) { return getInstance().show({ type: "success", message: message, title: title }); },
    error: function (message, title) { return getInstance().show({ type: "error", message: message, title: title }); },
    info: function (message, title) { return getInstance().show({ type: "info", message: message, title: title }); },
    hide: function () { if (instance) instance.hide(); }
  };
});
