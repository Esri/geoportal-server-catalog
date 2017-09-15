define([
  "dojo",
  "dijit",
  "dijit/_editor/_Plugin",
  "jimu/dijit/ImageChooser",
  "dojo/_base/html",
  "dojo/_base/connect",
  "dojo/_base/declare",
  "dojox/form/FileUploader",
  "dijit/_editor/_Plugin"
], function(
  dojo, dijit, _Plugin, ImageChooser, html
) {
  dojo.experimental("dojox.editor.plugins.ChooseImage");

  var ChooseImage = dojo.declare("dojox.editor.plugins.ChooseImage", _Plugin, {
    // summary:
    //Adds an icon to the Editor toolbar that when clicked, opens a system dialog
    //Although the toolbar icon is a tiny "image" the uploader could be used for
    //any file type

    tempImageUrl: "",
    iconClassPrefix: "editorIcon",
    useDefaultCommand: false,
    uploadUrl: "",
    button: null,
    label: "Upload",

    setToolbar: function(toolbar) {
      this.button.destroy();
      this.createFileInput();
      toolbar.addChild(this.button);
    },
    _initButton: function() {
      this.command = "chooseImage";
      this.editor.commands[this.command] = "Upload Image";
      this.inherited("_initButton", arguments);
      delete this.command;
    },

    updateState: function() {
      // summary:
      //    Over-ride for button state control for disabled to work.
      //To find dojox_form_FileUploader
      //(ChooseImage plugin's icon is a masker upon the dojox_form_FileUploader.So ChooseImage get all click events.
      //ChooseImage will change dojox_form_FileUploader's icon ,when "viewsource" dijit clicked)
      var editorUploadNorm;
      for (var i = 0, len = this.editor._plugins.length; i < len; i++) {
        var plugin = this.editor._plugins[i];
        if (plugin.button.baseClass === "dojoxEditorUploadNorm") {
          editorUploadNorm = plugin;
          break;
        }
      }

      var disabled = this.get("disabled");
      if (true === disabled) {
        html.addClass(this.button.domNode, 'dijitButtonDisabled');
        html.setStyle(this.button.mask, 'cursor', "inherit");

        if (editorUploadNorm) {
          html.addClass(editorUploadNorm.button.domNode, 'dijitButtonDisabled');
        }

        this.button.disableChooseImage();
      } else {
        html.removeClass(this.button.domNode, 'dijitButtonDisabled');
        html.setStyle(this.button.mask, 'cursor', "pointer");

        if (editorUploadNorm) {
          html.removeClass(editorUploadNorm.button.domNode, 'dijitButtonDisabled');
        }

        this.button.enableChooseImage();
      }
    },

    createFileInput: function() {
      var node = dojo.create('span', {
        innerHTML: "."
      }, document.body);
      dojo.style(node, {
        width: "40px",
        height: "20px",
        paddingLeft: "8px",
        paddingRight: "8px"
      });
      this.button = new ImageChooser({
        showSelfImg: false,
        cropImage: false,
        format: [ImageChooser.GIF, ImageChooser.JPEG, ImageChooser.PNG]
      }, node);
      html.setStyle(this.button.domNode, {
        width: "29px",
        height: "24px",
        top: 0,
        position: "absolute"
      });

      if (window.isRTL) {
        html.setStyle(this.button.domNode, 'left', '391px');
      } else {
        html.setStyle(this.button.domNode, 'right', '387px');
      }

      this.connect(this.button, "onImageChange", "insertTempImage");
      // this.connect(this.button, "onComplete", "onComplete");
    },

    onComplete: function(data /*,ioArgs,widgetRef*/ ) {
      data = data[0];
      // Image is ready to insert
      var tmpImgNode = dojo.byId(this.currentImageId, this.editor.document);
      var file;
      // download path is mainly used so we can access a PHP script
      // not relative to this file. The server *should* return a qualified path.
      if (this.downloadPath) {
        file = this.downloadPath + data.name;
      } else {
        file = data.file;
      }

      tmpImgNode.src = file;
      dojo.attr(tmpImgNode, '_djrealurl', file);

      if (data.width) {
        tmpImgNode.width = data.width;
        tmpImgNode.height = data.height;
      }
    },

    insertTempImage: function(fileData) {
      // summary:
      //    inserting a "busy" image to show something is hapening
      //    during upload and download of the image.
      this.currentImageId = "img_" + (new Date().getTime());
      var iTxt = '<img id="' + this.currentImageId + '" src="' + fileData + '" />';
      this.editor.execCommand('inserthtml', iTxt);
    }
  });

  dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function(o) {
    if (o.plugin) {
      return;
    }
    switch (o.args.name) {
      case "chooseImage":
        o.plugin = new ChooseImage({
          url: o.args.url
        });
    }
  });

  /*jshint sub: true */
  _Plugin.registry["chooseImage"] = function(args){
    return new ChooseImage(args);
  };

  return ChooseImage;
});