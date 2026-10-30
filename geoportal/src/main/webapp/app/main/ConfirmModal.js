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
    _previousFocus: null,
    _keyHandler: null,

    show: function (options) {
      options = options || {};
      this.titleNode.innerText = options.title || this.i18n.general.confirm;
      this.messageNode.innerText = options.message || "";
      this.confirmButton.innerText = options.confirmLabel || this.i18n.general.del;
      this.cancelButton.innerText = options.cancelLabel || this.i18n.general.cancel;
      this.closeButton.setAttribute("aria-label", options.cancelLabel || this.i18n.general.cancel);

      // already open: resolve previous as cancelled, keep the originally focused element
      if (this._deferred) {
        this._deferred.resolve(false);
      } else {
        this._previousFocus = document.activeElement;
      }
      this._deferred = new Deferred();
      this.overlayNode.classList.remove("hidden");

      if (!this._keyHandler) {
        this._keyHandler = this._onKeyDown.bind(this);
        document.addEventListener("keydown", this._keyHandler, true);
      }
      // safe default: focus Cancel
      this.cancelButton.focus();
      return this._deferred.promise;
    },

    _close: function (result) {
      this.overlayNode.classList.add("hidden");
      if (this._keyHandler) {
        document.removeEventListener("keydown", this._keyHandler, true);
        this._keyHandler = null;
      }
      var prev = this._previousFocus;
      this._previousFocus = null;
      if (prev && typeof prev.focus === "function" && document.body.contains(prev)) {
        prev.focus();
      }
      var d = this._deferred;
      this._deferred = null;
      if (d) d.resolve(result);
    },

    _onKeyDown: function (evt) {
      if (!this._deferred) return;
      if (evt.key === "Escape" || evt.key === "Esc") {
        evt.preventDefault();
        evt.stopPropagation();
        this._close(false);
        return;
      }
      if (evt.key !== "Tab") return;
      var items = [this.closeButton, this.cancelButton, this.confirmButton];
      var first = items[0], last = items[items.length - 1];
      var active = document.activeElement;
      if (!this.dialogNode.contains(active)) {
        evt.preventDefault();
        this.cancelButton.focus();
      } else if (evt.shiftKey && active === first) {
        evt.preventDefault();
        last.focus();
      } else if (!evt.shiftKey && active === last) {
        evt.preventDefault();
        first.focus();
      }
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
