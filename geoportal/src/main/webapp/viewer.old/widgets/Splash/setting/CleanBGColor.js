define([
  "dojo",
  "dijit",
  "dojo/_base/lang",
  "dijit/_editor/_Plugin",
  "dijit/form/Button",
  //"dojo/_base/html",
  //"dojo/_base/connect",
  "dojo/_base/declare"
], function(dojo, dijit, lang, _Plugin, Button/*, html*/) {
  dojo.experimental("dojox.editor.plugins.CleanBGColor");
  var CleanBGColor = dojo.declare("dojox.editor.plugins.CleanBGColor", _Plugin, {
    useDefaultCommand: false,

    _initButton: function() {
      this.command = "cleanBackgroundColor";//name for plugin
      this.hackCommand = "hiliteColor";//command to editor change BG color
      var editor = this.editor;
      this.button = new Button({
        //label: strings["print"],
        ownerDocument: editor.ownerDocument,
        dir: editor.dir,
        lang: editor.lang,
        showLabel: false,
        iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "Print",
        tabIndex: "-1",
        onClick: lang.hitch(this, "_onClick")
      });
    },

    _onClick: function() {
      //var _e = this.editor;
      var value = "transparent";
      this.editor.execCommand(this.hackCommand, value);//set BackgroundColor to transparent
    },
    updateState: function() {
      var _e = this.editor;
      if (!_e || !_e.isLoaded) {
        return;
      }

      var disabled = this.get("disabled");
      if (this.button) {
        this.button.set("disabled", disabled);
        if (disabled) {
          return;
        }
      }
    }
  });

  dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function(o) {
    if (o.plugin) {
      return;
    }
    switch (o.args.name) {
      case "cleanBackgroundColor":
        o.plugin = new CleanBGColor();
      //{command: "hiliteColor"//o.args.name});
    }
  });
  return CleanBGColor;
});