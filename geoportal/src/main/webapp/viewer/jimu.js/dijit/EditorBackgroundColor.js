///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
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
  "require",
  "dojo",
  "dijit",
  "dojo/_base/declare",
  "dijit/_editor/_Plugin",
  "dijit/form/DropDownButton"
], function (require, dojo, dijit, declare, _Plugin, DropDownButton) {
  //This is a pulg-in of arcgis-js-api/dijit/_editor/.
  //The template file is /arcgis-js-api/dijit/_editor/plugins/TextColor.js.

  // module:
  //		dijit/_editor/plugins/BackgroundColor
  dojo.experimental("dijit.editor.plugins.EditorBackgroundColor");
  var EditorBackgroundColor = declare("dijit.editor.plugins.EditorBackgroundColor", _Plugin, {
    // summary:
    //		This plugin provides dropdown color pickers for setting text color and background color
    // description:
    //		The commands provided by this plugin are:
    //
    //		- foreColor - sets the text color
    //		- hiliteColor - sets the background color

    // Override _Plugin.buttonClass to use DropDownButton (with ColorPalette) to control this plugin
    buttonClass: DropDownButton,

    // colorPicker: String|Constructor
    //		The color picker dijit to use, defaults to dijit/ColorPalette
    colorPicker: "jimu/dijit/ColorPalette",

    // useDefaultCommand: Boolean
    //		False as we do not use the default editor command/click behavior.
    useDefaultCommand: false,

    _initButton: function () {
      this.command = "editorBackgroundColor";//name for plugin//this.name;
      this.hackCommand = "hiliteColor";//commands:https://developer.mozilla.org/en-us/docs/Web/API/Document/execCommand
      this.inherited(arguments);

      var recordUID = "",
        forceAttr = false;
      if (this.params.custom) {
        if(this.params.custom.recordUID){
          recordUID = this.params.custom.recordUID;
        }
      }
      // Setup to lazy load ColorPalette first time the button is clicked
      var self = this;
      //button icon
      this.button.set("iconClass", this.iconClassPrefix + " " + this.iconClassPrefix + "HiliteColor");
      this.button.set("title", this.getLabel(this.hackCommand));
      this.button.loadDropDown = function (callback) {
        function onColorPaletteLoad(ColorPalette) {
          self.button.dropDown = new ColorPalette({
            dir: self.editor.dir,
            ownerDocument: self.editor.ownerDocument,
            value: self.value,
            appearance: {
              showTransparent: true,
              showColorPalette: true,
              showCoustom: true,
              showCoustomRecord: true
            },
            recordUID: recordUID,
            onChange: function (color) {
              //Toggles the use of HTML tags or CSS for the generated markup
              self.editor.execCommand("useCSS", forceAttr);
              self.editor.execCommand("styleWithCSS", !forceAttr);

              self.editor.execCommand(self.hackCommand, color);
            },
            onExecute: function () {
              self.editor.execCommand(self.hackCommand, this.get("value"));
            }
          });
          callback();
        }

        if (typeof self.colorPicker === "string") {
          require([self.colorPicker], onColorPaletteLoad);
        } else {
          onColorPaletteLoad(self.colorPicker);
        }
      };
    },

    updateState: function () {
      // summary:
      //		Overrides _Plugin.updateState().  This updates the ColorPalette
      //		to show the color of the currently selected text.
      // tags:
      //		protected
      var _e = this.editor;
      var _c = this.hackCommand;
      if (!_e || !_e.isLoaded || !_c.length) {
        return;
      }

      var value;
      if (this.button) {
        var disabled = this.get("disabled");
        this.button.set("disabled", disabled);
        if (disabled) {
          return;
        }

        try {
          value = _e.queryCommandValue(_c) || "";
        } catch (e) {
          //Firefox may throw error above if the editor is just loaded, ignore it
          value = "";
        }
      }

      if (value === "") {
        value = "#000000";
      } else if (value === "transparent") {
        value = "rgba(0, 0, 0, 0)";
      }
      this.value = value;

      var dropDown = this.button.dropDown;
      if (dropDown && dropDown.getColor && value !== dropDown.getColor()) {
        dropDown.refreshRecords();
        dropDown.setColor(value);
      }
    }
  });

  dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
    if (o.plugin) {
      return;
    }
    switch (o.args.name) {
      case "editorBackgroundColor":
        o.plugin = new EditorBackgroundColor();
    }
  });
  return EditorBackgroundColor;
});