define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/aspect",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/has",
        "dijit/_WidgetBase",
        "dojo/i18n!esri/dijit/metadata/nls/i18nBase",
        "dijit/Dialog",
        "./Editor"],
function(declare, lang, aspect, domClass, domConstruct, has, _WidgetBase, i18nBase, Dialog, Editor) {

  var oThisClass = declare([_WidgetBase], {

    _checkForChanges: true,

    dialog: null,
    editor: null,
    gxeAdaptor: null,
    gxeContext: null,
    title: null,

    postCreate: function() {
      this.inherited(arguments);
    },

    hide: function() {
      this._checkForChanges = false;
      if(this.dialog) {
        this.dialog.hide();
      }
    },

    onDialogClose: function() {
    },

    show: function() {
      if(this.title === null) {
        this.title = i18nBase.editor.editorDialog.caption;
      }

      var editor = this.editor = new Editor({
        dialogBroker: this,
        gxeAdaptor: this.gxeAdaptor,
        gxeContext: this.gxeContext
      });

      var dialog = this.dialog = new Dialog({
        "class": "gxeDialog gxeEditorDialog",
        title: this.title,
        content: editor,
        autofocus: false
      });
      if(!this.isLeftToRight()) {
        domClass.add(dialog.domNode, "gxeRtl");
      }

      /*
       this.own(aspect.before(dialog,"hide",lang.hitch(this,function() {
       if (!this._checkForChanges) return;
       if (!editor.getEditDocument()) return;
       var msg = "Not an actual error, just preventing default dialog::hide()";
       if (editor.primaryToolbar._disabled) {
       throw new Error(msg);
       } else {
       editor.primaryToolbar._onCloseClick();
       throw new Error(msg);
       }
       })));
       */

      var oThis = this;
      this.own(aspect.around(dialog, "hide", lang.hitch(this, function(origMethod) {
        return function() {
          if(oThis._checkForChanges && editor.getEditDocument()) {
            editor.primaryToolbar._onCloseClick();
          } else {
            lang.hitch(dialog, origMethod)();
          }
        };
      })));
      this.own(dialog.on("hide", lang.hitch(this, function() {
        setTimeout(lang.hitch(this, function() {
          editor.destroyRecursive(false);
          dialog.destroyRecursive(false);
          this.destroyRecursive(false);
        }), 2000);
        this.onDialogClose();
      })));

      dialog.show().then(function() {
        editor.initializeView();
      });
    }

  });

  return oThisClass;
});