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

define(['dojo/Evented',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/on',
  'dojo/query',
  "dojo/i18n",// i18n.getLocalization
  'dojo/_base/Color',
  "dijit/a11yclick",
  "dojo/i18n!dojo/nls/colors"// translations
],
  function (Evented, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    lang, html, on, query, i18n, Color, a11yclick) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
      templateString: '<div><div class="dijitInline dijitColorPalette" role="grid">' +
      '<table class="dijitPaletteTable" cellspacing="0" cellpadding="0" role="presentation">' +
      '<tbody data-dojo-attach-point="gridNode">' +
      '</tbody>' +
      '</table>' +
      '</div>' +
      '</div>',
      baseClass: 'jimu-color-chooser',
      declaredClass: 'jimu.dijit.ColorChooser',
      uid: "",
      colorsArray: [
        ["white", "seashell", "cornsilk", "lemonchiffon", "lightyellow", "palegreen", "paleturquoise",
          "lightcyan", "lavender", "plum"],
        ["lightgray", "pink", "bisque", "moccasin", "khaki", "lightgreen", "lightseagreen", "lightskyblue",
          "cornflowerblue", "violet"],
        ["silver", "lightcoral", "sandybrown", "orange", "palegoldenrod", "chartreuse", "mediumturquoise",
          "skyblue", "mediumslateblue", "orchid"],
        ["gray", "red", "orangered", "darkorange", "yellow", "limegreen", "darkseagreen", "royalblue",
          "slateblue", "mediumorchid"],
        ["dimgray", "crimson", "chocolate", "coral", "gold", "forestgreen", "seagreen", "blue", "blueviolet",
          "darkorchid"],
        ["darkslategray", "firebrick", "saddlebrown", "sienna", "olive", "green", "darkcyan", "mediumblue",
          "darkslateblue", "darkmagenta"],
        ["rgb(0,0,1)", "darkred", "maroon", "brown", "darkolivegreen", "darkgreen", "midnightblue", "navy",
          "indigo", "purple"]
      ],

      postCreate: function () {
        this.inherited(arguments);

        this.colorTitleNls = i18n.getLocalization("dojo", "colors"/*, dojo.locale*/);
        this._createColorsBlocks();
      },
      _createColorsBlocks: function () {
        this._row = this.colorsArray.length;
        this._col = this.colorsArray[0].length;

        for (var j = 0; j < this._row; j++) {
          var row = html.create('tr', {
            //'tabindex': j,
            'role': "row"
          }, this.gridNode);

          for (var i = 0; i < this._col; i++) {
            var alias = this.colorsArray[j][i];
            var colorValue = Color.named[alias];

            var dataTitle = "";
            if (colorValue) {
              dataTitle = alias;
            } else if (alias === "rgb(0,0,1)") {//name in _palettes, to cheat editor
              dataTitle = "black";
              colorValue = "rgb(0,0,1)";
            }
            var title = this.colorTitleNls[dataTitle];

            var rgbaVal = new Color(colorValue).toString();

            this["record" + i] = html.create('td', {
              'class': 'dijitPaletteCell',
              //'tabindex': i,
              'data-title': rgbaVal,
              'role': "gridcell"
            }, row);
            var span = html.create('span', {
              'class': 'dijitInline dijitPaletteImg'
            }, this["record" + i]);

            html.create('img', {
              'class': "dijitColorPaletteSwatch",
              'src': require.toUrl("dojo/resources/blank.gif"),
              "alt": title,
              "title": title,
              "data-title": dataTitle,
              "width": "16px",
              "height": "16px",
              "style": "background-color: " + rgbaVal
            }, span);
          }
        }

        //must use a11yclick, if not the first click maybe Invalid
        this.own(on(this.gridNode, /*"click"*/a11yclick, lang.hitch(this, this.onColorClick)));
      },
      onColorClick: function (evt) {
        var target = evt.target;
        while(target.tagName !== "TD"){
          if(!target.parentNode || target === this.gridNode){// probably can never happen, but just in case
            return;
          }
          target = target.parentNode;
        }

        var color = html.getAttr(target, "data-title");
        color = new Color(color).toString();
        //console.log("color==>" + color);
        this.setColor(color);

        evt.stopPropagation();
        evt.preventDefault();
      },
      _onChange: function (color) {
        this.emit("change", color);
      },

      setColor: function (color, isOnChange) {
        //selected style
        var newColor = new Color(color);
        var td = null;
        var tds = query("td", this.domNode);
        //clean selected
        for (var i = 0, len = tds.length; i < len; i++) {
          html.removeClass(tds[i], "dijitPaletteCellSelected");
        }
        //find td
        for (i = 0, len = tds.length; i < len; i++) {
          if (newColor.toString() === html.getAttr(tds[i], "data-title")) {
            td = tds[i];
            break;
          }
        }
        //set color
        if (td) {
          html.addClass(td, "dijitPaletteCellSelected");
        }
        //emit
        if (td && typeof isOnChange === "undefined" || true === isOnChange) {
          this._onChange(newColor);
        }
      }
    });
  });