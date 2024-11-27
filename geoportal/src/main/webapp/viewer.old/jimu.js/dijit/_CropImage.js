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
  //'dojo/Evented',
  'dojo/_base/declare',
  'dojo/_base/html',
  'dojo/_base/lang',
  'dojo/on',
  //'dojo/query',
  'jimu/utils',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/_CropImage.html',
  //'jimu/dijit/Message',
  'dojo/NodeList-dom'
],
  function (/*Evented, */declare, html, lang, on, /*query, */ utils,
    _widgetBase, _TemplatedMixin, template/* Message,*/) {
    var Cropper = window.Cropper;
    return declare([_widgetBase, _TemplatedMixin], {
      templateString: template,

      imageSrc: null,
      type: null,
      goldenWidth: 4,
      goldenHeight: 3,

      postCreate: function () {
        if (!this.type) {
          this.type = 'image/jpeg';
        }
        this.setImageSrc(this.imageSrc);

        this.loadingImg.src = require.toUrl('jimu') + '/images/loading.gif';
        this.own(on(this.baseImage, 'load', lang.hitch(this, function () {
          html.setStyle(this.loadingImg, 'display', 'none');
          this._initCropper();
        })));
      },

      _initCropper: function () {
        // Restart
        if (this.cropper && this.cropper.destroy) {
          this.cropper.destroy();
        }
        var options = {
          aspectRatio: this.goldenWidth / this.goldenHeight,
          preview: '.img-preview'
          // ready: lang.hitch(this, function (e) {
          //   console.log(e.type);
          // }),
          // cropstart: lang.hitch(this, function (e) {
          //   console.log(e.type, e.detail.action);
          //   //this.saveBookMarkersBySortable();
          //   //this.emit("sort", this.bookmarks);
          // }),
          // cropmove: function (e) {
          //   console.log(e.type, e.detail.action);
          // },
          // cropend: lang.hitch(this, function (e) {
          //   console.log(e.type, e.detail.action);
          //   //var data = this.getData();
          //   //this.emit("crop", data);
          // }),
          // crop: function (e) {
          //   var data = e.detail;
          //   console.log(e.type);
          //   // dataX.value = Math.round(data.x);
          //   // dataY.value = Math.round(data.y);
          //   // dataHeight.value = Math.round(data.height);
          //   // dataWidth.value = Math.round(data.width);
          //   // dataRotate.value = typeof data.rotate !== 'undefined' ? data.rotate : '';
          //   // dataScaleX.value = typeof data.scaleX !== 'undefined' ? data.scaleX : '';
          //   // dataScaleY.value = typeof data.scaleY !== 'undefined' ? data.scaleY : '';
          // },
          // zoom: function (e) {
          //   console.log(e.type, e.detail.ratio);
          // }
        };
        this.cropper = new Cropper(this.baseImage, options);
      },

      setImageSrc: function (src) {
        html.setAttr(this.baseImage, 'src', src);
      },

      getData: function () {
        var imgData = this.cropper.getCroppedCanvas();
        var uploadedImageType = this.type || 'image/jpeg';
        var data = imgData.toDataURL(uploadedImageType);

        return data;
      },

      destroy: function () {
        if (this.cropper && this.cropper.destroy) {
          this.cropper.destroy();
        }

        this.inherited(arguments);
      }
    });
  });