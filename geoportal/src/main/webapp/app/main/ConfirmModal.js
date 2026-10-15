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
 * ConfirmModal - reusable confirmation dialog styled like the delete
 * confirmation on the Collections panel.
 *
 * Usage:
 *   ConfirmModal.confirm({
 *     title: "Delete Item?",
 *     message: "Are you sure ...?",
 *     confirmLabel: "Delete"
 *   }).then(function (ok) { if (ok) { ... } });
 */
define([
  "dojo/_base/declare",
  "dojo/Deferred",
  "app/common/Templated",
  "dojo/text!./templates/ConfirmModal.html"
], function (declare, Deferred, Templated, template) {

  var Modal = declare([Templated], {
    templateString: template,
    _deferred: null,

    show: function (options) {
      options = options || {};
      this.titleNode.innerText = options.title || "Confirm";
      this.messageNode.innerText = options.message || "";
      this.confirmButton.innerText = options.confirmLabel || "Delete";
      this.cancelButton.innerText = options.cancelLabel || "Cancel";
      if (this._deferred) this._deferred.resolve(false);
      this._deferred = new Deferred();
      this.overlayNode.classList.remove("hidden");
      return this._deferred.promise;
    },

    _close: function (result) {
      this.overlayNode.classList.add("hidden");
      var d = this._deferred;
      this._deferred = null;
      if (d) d.resolve(result);
    },

    _onConfirm: function () { this._close(true); },
    _onCancel: function () { this._close(false); }
  });

  var instance = null;

  return {
    // returns a promise resolving to true (confirmed) / false (cancelled)
    confirm: function (options) {
      if (!instance) {
        instance = new Modal({});
        instance.placeAt(document.body);
        instance.startup();
      }
      return instance.show(options);
    }
  };
});
