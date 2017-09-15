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
    'dojo/Evented',
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/on',
    'dojo/text!./templates/ImageChooser.html',
    'dojo/sniff',
    'dojo/request',
    'esri/lang',
    '../utils',
    './_CropImage',
    'jimu/dijit/Popup',
    'jimu/dijit/Message',
    'jimu/dijit/LoadingShelter'
  ],
  function(Evented, declare, _WidgetBase, _TemplatedMixin, lang, html,
    on, template, has, request, esriLang, utils, _CropImage,
    Popup, Message, LoadingShelter) {
    var count = 0;

    //summary:
    //  popup the image file chooser dialog, when choose an image file,
    //  display the image file and return the image's base64 code
    var ic = declare([_WidgetBase, _TemplatedMixin, Evented], {
      templateString: template,
      declaredClass: "jimu.dijit.ImageChooser",

      // public properties
      cropImage: true, // if imagechooser run in integration ignore this property
      displayImg: null,
      defaultSelfSrc: null,
      showSelfImg: false,
      label: null,
      showTip: true,
      goldenWidth: 400,
      goldenHeight: 400,
      maxSize: 1024,
      format: null, // array:['image/png','image/gif','image/jpeg']

      // public methods
      //enableChooseImage
      //disableChooseImage
      //getImageData

      imageData: null,

      postMixInProperties: function() {
        this.inherited(arguments);
        this.nls = window.jimuNls.imageChooser;
        this.nls.common = window.jimuNls.common;
        this.nls.readError = this.nls.readError || "Failed to read the file.";
      },

      postCreate: function() {
        this._initial();
        if (!utils.file.supportHTML5() && !has('safari') && utils.file.isEnabledFlash()) {
          utils.file.loadFileAPI().then(lang.hitch(this, function() {
            html.setStyle(this.mask, 'zIndex', 1); // prevent mask hide file input
          }));
        }
      },

      setImageSize: function(size) {
        this.goldenWidth = size.width;
        this.goldenHeight = size.height;
      },

      disableChooseImage: function() {
        html.setStyle(this.fileForm, 'display', 'none');
        if (this.label && typeof this.label === 'string') {
          html.addClass(this.displayText, 'disable-label');
        }
        html.removeAttr(this.domNode, 'title');
      },

      enableChooseImage: function() {
        html.setStyle(this.fileForm, 'display', 'block');
        if (this.label && typeof this.label === 'string') {
          html.removeClass(this.displayText, 'disable-label');
        }
        this._addTip();
      },

      setDefaultSelfSrc: function(src) {
        this.defaultSelfSrc = src;
        this.selfImg.src = src;
        this.imageData = src;
      },

      getImageData: function() {
        return this.imageData;
      },

      _initial: function() {
        this._processProperties();
        this._porcessMaskClick();
        this._setupFileInput();
        this._addTip();
      },

      _processProperties: function() {
        this.fileProperty = {};

        if (this.label && typeof this.label === 'string') {
          this.displayText.innerHTML = this.label;
          html.setStyle(this.hintText, 'display', 'block');
        }
        if (this.showSelfImg) {
          html.setStyle(this.hintImage, 'display', 'block');
        }
        if (this.defaultSelfSrc) {
          this.selfImg.src = this.defaultSelfSrc;
          this.imageData = this.defaultSelfSrc;
        }

        if (this.format) {
          var accept = "image/*";
          if (typeof this.format === 'string' && /^image\/./.test(this.format)) {
            accept = this.format;
          } else if (Object.prototype.toString.call(this.format) === '[object Array]' &&
            this.format.length > 0) {
            accept = this.format.join(',');
          }
          html.setAttr(this.fileInput, 'accept', accept);
        }

        if (!utils.file.supportHTML5() && !has('safari') && utils.file.isEnabledFlash()) {
          html.setStyle(this.fileInput, {
            'width': '100%',
            'height': '100%',
            'position': 'absolute',
            'left': 0,
            'top': 0,
            'opacity': 0,
            'zIndex': 9
          });
        }
      },

      _porcessMaskClick: function() {
        html.setAttr(this.fileInput, 'id', 'imageChooser_' + count);
        html.setAttr(this.mask, 'for', 'imageChooser_' + count);
        count++;
        this.maskHandle = on(this.mask, 'click', lang.hitch(this, function(evt) {
          evt.stopPropagation();
          if (has('safari') && has('safari') < 7) {
            new Message({
              message: this.nls.unsupportReaderAPI
            });
            evt.preventDefault();
            return;
          }
          if (!utils.file.supportHTML5()) {
            if (!utils.file.isEnabledFlash()) {
              var errContent = html.create('a', {
                href: 'http://helpx.adobe.com/flash-player.html',
                innerHTML: this.nls.enableFlash,
                target: '_blank'
              });

              new Message({
                message: errContent
              });
              evt.preventDefault();
              return;
            }
            if (!utils.file.supportFileAPI()) {
              new Message({
                message: this.nls.unsupportReaderAPI
              });
              evt.preventDefault();
              return;
            }
          }
          //reset position of input, if not input will overlay the label element
          html.setStyle(this.fileInput, 'display', 'none');
          setTimeout(lang.hitch(this, function() {
            html.setStyle(this.fileInput, 'display', 'block');
          }), 200);
        }));
      },

      _addTip: function() {
        if (this.showTip) {
          var obj = {
            width: this.goldenWidth || 40,
            height: this.goldenHeight || 40
          };
          var tip = esriLang.substitute(obj, this.nls.toolTip);
          html.setAttr(this.domNode, 'title', tip);
        } else {
          html.setAttr(this.domNode, 'title', "");
        }
      },

      _setupFileInput: function() {
        if (has('ie') <= 9) {
          this.own(on(this.fileInput, 'change', lang.hitch(this, this._onFileInputChange)));
        } else {
          on.once(this.fileInput, 'change', lang.hitch(this, this._onFileInputChange));
        }
      },

      _onFileInputChange: function(evt) {
        var file = (evt.target.files && evt.target.files[0]) || (evt.files && evt.files[0]);
        if (this.format && this.format.indexOf(file.type) === -1) {
          new Message({
            'message': this.nls.invalidType
          });

          if (!has('ie') || has('ie') > 9) {
            // recreate fileForm to support select same image again.
            this._recreateFileForm();
          }
          return;
        }

        var maxSize = has('ie') < 9 ? 23552 : this.maxSize * 1024; //ie8:21k others:1M
        utils.file.readFile(
          evt,
          'image/*',
          maxSize,
          lang.hitch(this, function(err, fileName, fileData) {
            /*jshint unused: false*/
            if (err) {
              var message = this.nls[err.errCode];
              if (err.errCode === 'exceed') {
                message = message.replace('1024', maxSize / 1024);
              }
              new Message({
                'message': message
              });
            } else {
              this.fileProperty.fileName = fileName;
              if (window.isXT && this.cropImage && file.type !== 'image/gif') {
                this._cropImageByUser(fileData);
              } else {
                this._readFileData(fileData);
              }
            }

            if (!has('ie') || has('ie') > 9) {
              // recreate fileForm to support select same image again.
              this._recreateFileForm();
            }
          }));
      },

      _recreateFileForm: function() {
        var newMask = lang.clone(this.mask);
        var newFileInput = lang.clone(this.fileInput);
        html.destroy(this.mask);
        html.destroy(this.fileInput);

        var newFileForm = lang.clone(this.fileForm);
        html.place(newMask, newFileForm);
        html.place(newFileInput, newFileForm);
        html.place(newFileForm, this.fileForm, 'replace');

        this.maskHandle.remove();
        this.mask = newMask;
        this.fileInput = newFileInput;
        html.destroy(this.fileForm);
        this.fileForm = newFileForm;

        this._porcessMaskClick();
        this._setupFileInput();
      },

      _readFileData: function(fileData) {
        this.onImageChange(fileData, this.fileProperty);
        if (this.displayImg) {
          html.setAttr(this.displayImg, 'src', fileData);
        }
        if (this.showSelfImg) {
          if (this.selfImg) {
            html.setAttr(this.selfImg, 'src', fileData);
          } else {
            this.selfImg.src = fileData;
          }
          //Center&Vertically
          var layoutBox = html.getMarginBox(this.hintImage);
          if (layoutBox && layoutBox.w && layoutBox.h) {
            html.style(this.selfImg, "maxWidth", layoutBox.w + "px");
            html.style(this.selfImg, "maxHeight", layoutBox.h + "px");
          }
        }
      },

      _cropImageByUser: function(fileData) {
        var cropImage = new _CropImage({
          imageSrc: fileData,
          nls: lang.clone(this.nls),
          realWidth: this.goldenWidth,
          realHeight: this.goldenHeight
        });

        var shelter = new LoadingShelter({
          hidden: true
        });
        var cropPopup = new Popup({
          titleLabel: this.nls.cropImage,
          content: cropImage,
          // autoHeight: true,
          width: 500,
          height: 480,
          buttons: [{
            label: this.nls.common.ok,
            onClick: lang.hitch(this, function() {
              var imageSize = cropImage.getImageSize();
              var cropSize = cropImage.getCropSize();
              shelter.show();
              request("/webappbuilder/rest/cropimage", {
                data: {
                  imageData: fileData,
                  imageDisplaySize: imageSize.w + ',' + imageSize.h,
                  cropRectangle: cropSize.w + ',' + cropSize.h + ',' + cropSize.t + ',' + cropSize.l
                },
                method: 'POST',
                handleAs: 'json',
                headers: {
                  "X-Requested-With": null
                }
              }).then(lang.hitch(this, function(response) {
                if (response.success) {
                  var fileData = response.imageData;
                  this._readFileData(fileData);
                  cropPopup.close();
                } else {
                  new Message({
                    'message': this.nls.unknowError
                  });

                  shelter.hide();
                }
              }), lang.hitch(this, function(err) {
                console.error(err);
                new Message({
                  'message': this.nls.unknowError
                });
                shelter.hide();
              }));
            })
          }]
        });
        shelter.placeAt(cropPopup.domNode);
        cropImage.startup();

        html.addClass(cropPopup.domNode, 'image-chooser-crop-popup');
      },

      onImageChange: function(fileData) {
        this.imageData = fileData;
        this.emit("imageChange", this.imageData, this.fileProperty);
        this.emit("change", this.imageData, this.fileProperty);
      }
    });

    ic.GIF = 'image/gif';
    ic.JPEG = 'image/jpeg';
    ic.PNG = 'image/png';

    return ic;
  });