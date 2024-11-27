///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define([
  'dojo/Evented',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojox/widget/ColorPicker',
  "dijit/_base/focus",
  "dojo/fx",
  'dojo/_base/lang',
  'dojo/_base/html',
  "dojo/sniff"
], function (Evented, declare, _WidgetBase, dojoxColorPicker, FocusManager, fx, lang, html, has) {
  return declare([_WidgetBase, dojoxColorPicker, Evented], {
    baseClass: 'jimu-color-selector',
    declaredClass: 'jimu.dijit.ColorSelector',

    //overwirte this method, because it get wrong color when clicled
    _setPoint: function (/* Event */evt) {
      if (evt) { FocusManager.focus(evt.target); }
      //half of icon
      if (!this._CURSOR_WIDTH || !this._CURSOR_HEIGHT) {
        var cursorNodeBox = html.getMarginBox(this.cursorNode);
        if (cursorNodeBox.w && cursorNodeBox.h) {
          this._CURSOR_WIDTH = cursorNodeBox.w / 2;
          this._CURSOR_HEIGHT = cursorNodeBox.h / 2;
        }
      }
      //border w/h
      if (!this._BORDER_WIDTH || !this._BORDER_HEIGHT) {
        var borderObj = html.getBorderExtents(evt.target || evt.srcElement);
        if (borderObj.w && borderObj.h) {
          this._BORDER_WIDTH = borderObj.w;
          this._BORDER_HEIGHT = borderObj.h;
        }
      }

      //fix position
      var tarX = 0,
        tarY = 0;
      if (has("ff") || has("ie") || has("MSIE")) {
        //ff ie, without border
        tarX = evt.offsetX;
        tarY = evt.offsetY;
      } else if (evt.offsetX && evt.offsetY) {
        //chrome edge, with border w/h
        tarX = evt.offsetX + this._BORDER_WIDTH;
        tarY = evt.offsetY + this._BORDER_HEIGHT;
      }
      //targetX/Y - halfWidth/Height of icon
      var newTop = tarY - this._CURSOR_HEIGHT;
      var newLeft = tarX - this._CURSOR_WIDTH;

      //set color
      if (this.animatePoint) {
        fx.slideTo({
          node: this.cursorNode,
          duration: this.slideDuration,
          top: newTop,
          left: newLeft,
          onEnd: lang.hitch(this, function () { this._updateColor(true); FocusManager.focus(this.cursorNode); })
        }).play();
      } else {
        html.style(this.cursorNode, {
          left: newLeft + "px",
          top: newTop + "px"
        });
        this._updateColor(true);
      }
    },

    _setHuePoint: function (/* Event */evt) {
      var selCenter = this.PICKER_HUE_SELECTOR_H / 2;//half of icon
      var ypos = evt.offsetY - selCenter;

      if (this.animatePoint) {
        fx.slideTo({
          node: this.hueCursorNode,
          duration: this.slideDuration,
          top: ypos,
          left: 0,
          onEnd: lang.hitch(this, function () { this._updateColor(true); FocusManager.focus(this.hueCursorNode); })
        }).play();
      } else {
        html.style(this.hueCursorNode, "top", ypos + "px");
        this._updateColor(true);
      }
    }
  });
});