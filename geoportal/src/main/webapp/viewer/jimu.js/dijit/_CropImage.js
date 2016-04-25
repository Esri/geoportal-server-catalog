///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Esri. All Rights Reserved.
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
    'dojo/_base/declare',
    'dojo/_base/html',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/query',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/text!./templates/_CropImage.html',
    'jimu/dijit/Message',
    'esri/lang',
    'dojo/NodeList-dom'
  ],
  function(declare, html, lang, on, query,
    _widgetBase, _TemplatedMixin, template, Message, esriLang) {
    return declare([_widgetBase, _TemplatedMixin], {
      templateString: template,
      inDrag: false,
      inSlider: false,
      realWidth: 30,
      realHeight: 30,
      ratio: null,
      imageSrc: null,

      _currentX: null,
      _currentY: null,
      _currentTop: 0,
      _currentLeft: 0,

      postCreate: function() {
        this._dragingHandlers = [];

        this.setImageSrc(this.imageSrc);
        this.own(on(this.ownerDocument, 'mousemove', lang.hitch(this, '_onMouseMove')));
        this.own(on(this.ownerDocument, 'mouseup', lang.hitch(this, '_onMouseUp')));
        this.loadingImg.src = require.toUrl('jimu') + '/images/loading.gif';
        this.own(on(this.baseImage, 'load', lang.hitch(this, function() {
          this._init();
          html.setStyle(this.loadingImg, 'display', 'none');
        })));
      },

      setImageSrc: function(src) {
        html.setAttr(this.viewerImage, 'src', src);
        html.setAttr(this.baseImage, 'src', src);
      },

      getImageSize: function() {
        return {
          w: this._currentImageWidth,
          h: this._currentImageHeight
        };
      },

      getCropSize: function() {
        return {
          l: -this._currentLeft,
          t: -this._currentTop,
          w: this.idealWidth,
          h: this.idealHeight
        };
      },

      _init: function() {
        var cropSectionStyle = this._getComputedStyle(this.cropSection);
        var cropSectionContentBox = html.getContentBox(this.cropSection);
        var imageStyle = this._getComputedStyle(this.baseImage);
        var imageWidth = parseFloat(imageStyle.width) || this.baseImage.offsetWidth;
        var imageHeight = parseFloat(imageStyle.height) || this.baseImage.offsetHeight;
        var imageRadio = imageWidth / imageHeight;

        this._maxImageWidth = imageWidth;
        this._maxImageHeight = imageHeight;

        if (imageHeight < this.realHeight && imageWidth < this.realWidth) {
          var obj = {
            width: this.realWidth,
            height: this.realHeight
          };
          var _message = esriLang.substitute(obj, this.nls.cropWaining);
          setTimeout(lang.hitch(this, function() {
            this.popup.close();
          }), 50);
          new Message({
            message: _message
          });
          return;
        }

        //create a box which keep the ratio of width and height to full fill the content of popup
        this.idealWidth = this.realWidth;
        this.idealHeight = this.realHeight;

        this.ratio = this.ratio ? this.ratio : this.realWidth / this.realHeight;
        var _ratio = this.ratio;
        if (this.ratio >= 1) {
          if (cropSectionContentBox.h * this.ratio <= cropSectionContentBox.w) {
            this.idealHeight = cropSectionContentBox.h;
            this.idealWidth = cropSectionContentBox.h * this.ratio;
          } else {
            this.idealHeight = this._findProperlyValue(
              0,
              cropSectionContentBox.h,
              cropSectionContentBox.w - 5,
              function(p) {
                return p * _ratio;
              });
            this.idealWidth = this.idealHeight * this.ratio;
          }
        } else {
          if (cropSectionContentBox.w / this.ratio <= cropSectionContentBox.h) {
            this.idealWidth = cropSectionContentBox.w;
            this.idealHeight = cropSectionContentBox.w / this.ratio;
          } else {
            this.idealWidth = this._findProperlyValue(0,
              cropSectionContentBox.w,
              cropSectionContentBox.h - 5,
              function(p) {
                return p / _ratio;
              });
            this.idealHeight = this.idealWidth / this.ratio;
          }
        }

        html.setStyle(this.viewerBox, {
          width: this.idealWidth + 'px',
          height: this.idealHeight + 'px'
        });

        var paddingTop = Math.abs((parseFloat(cropSectionStyle.height) - this.idealHeight) / 2);
        html.setStyle(this.cropSection, {
          'paddingTop': paddingTop + 'px',
          'paddingBottom': paddingTop + 'px'
        });

        // keep original ratio of image
        if (imageRadio >= 1) {
          if (this.idealHeight * imageRadio >= this.idealWidth) {
            html.setStyle(this.viewerImage, 'height', this.idealHeight + 'px');
            html.setStyle(this.baseImage, 'height', this.idealHeight + 'px');
          } else {
            var properlyHeight = this._findProperlyValue(
              0,
              this.idealWidth,
              this.idealWidth,
              function(p) {
                return p * imageRadio;
              });
            html.setStyle(this.viewerImage, 'height', properlyHeight + 'px');
            html.setStyle(this.baseImage, 'height', properlyHeight + 'px');
          }
        } else {
          if (this.idealWidth / imageRadio >= this.idealHeight) {
            html.setStyle(this.viewerImage, 'width', this.idealWidth + 'px');
            html.setStyle(this.baseImage, 'width', this.idealWidth + 'px');
          } else {
            var properlyWidth = this._findProperlyValue(
              0,
              this.idealHeight,
              this.idealHeight,
              function(p) {
                return p / imageRadio;
              });
            html.setStyle(this.viewerImage, 'width', properlyWidth + 'px');
            html.setStyle(this.baseImage, 'width', properlyWidth + 'px');
          }
        }

        query('.hide-status', this.domNode).removeClass('hide-status');

        imageStyle = this._getComputedStyle(this.baseImage);
        imageWidth = parseFloat(imageStyle.width) || this.baseImage.offsetWidth;
        imageHeight = parseFloat(imageStyle.height) || this.baseImage.offsetHeight;
        this._minImageWidth = imageWidth;
        this._minImageHeight = imageHeight;

        this._currentImageWidth = imageWidth;
        this._currentImageHeight = imageHeight;

        this._currentTop = -(imageHeight - this.idealHeight) / 2;
        this._currentLeft = -(imageWidth - this.idealWidth) / 2;
        html.setStyle(this.baseImage, {
          top: this._currentTop + 'px',
          left: this._currentLeft + 'px'
        });
        html.setStyle(this.viewerImage, {
          top: this._currentTop + 'px',
          left: this._currentLeft + 'px'
        });
        //sometimes zoomratio < 1; it's should be not allowed to zoom
        this._zoomRatio = this._maxImageWidth / this._minImageWidth;
        if (this._zoomRatio <= 1) {
          html.addClass(this.zoomInBtn, 'disable-zoom');
          html.addClass(this.zoomOutBtn, 'disable-zoom');
        } else {
          html.addClass(this.zoomOutBtn, 'disable-zoom');
        }

        if (window.isRTL) {
          this._latestPercentage = 100;
        } else {
          this._latestPercentage = 0;
        }
      },

      _findProperlyValue: function(start, end, value, formatter, tolerance) {
        tolerance = isFinite(tolerance) ? parseFloat(tolerance) : 1;
        value = value - tolerance < 0 || value + tolerance < 0 ? tolerance : value;
        var middle = (start + end) / 2;
        var formatterValue = formatter(middle);
        if (formatterValue <= value + tolerance && formatterValue >= value - tolerance) {
          return middle;
        } else if (formatterValue > value) {
          return this._findProperlyValue(start, middle, value, formatter);
        } else if (formatterValue < value) {
          return this._findProperlyValue(middle, end, value, formatter);
        }
      },

      _getComputedStyle: function(element) {
        var marginBox = html.getMarginBox(element);
        return {
          width: marginBox.w,
          height: marginBox.h,
          left: marginBox.l,
          top: marginBox.t
        };
      },

      _onViewerMouseDown: function(evt) {
        var baseImageStyle = this._getComputedStyle(this.baseImage);
        var viewerContentStyle = this._getComputedStyle(this.viewerContent);

        this._maxOffsetLeft = parseFloat(viewerContentStyle.width) -
          parseFloat(baseImageStyle.width);
        this._maxOffsetTop = parseFloat(viewerContentStyle.height) -
          parseFloat(baseImageStyle.height);
        this._maxOffsetLeft = this._maxOffsetLeft > 0 ? 0 : this._maxOffsetLeft;
        this._maxOffsetTop = this._maxOffsetTop > 0 ? 0 : this._maxOffsetTop;
        this.inDrag = true;
        this._currentX = evt.clientX;
        this._currentY = evt.clientY;

        this._stopSelect();
      },

      _stopSelect: function() {
        this._dragingHandlers = this._dragingHandlers.concat([
          on(this.ownerDocument, 'dragstart', function(e) {
            e.stopPropagation();
            e.preventDefault();
          }),
          on(this.ownerDocumentBody, 'selectstart', function(e) {
            e.stopPropagation();
            e.preventDefault();
          })
        ]);
      },

      _removeStopSelect: function() {
        var h = this._dragingHandlers.pop();
        while (h) {
          h.remove();
          h = this._dragingHandlers.pop();
        }
      },

      _onViewerMouseUp: function(evt) {
        if (!this.inDrag) {
          return;
        }
        this.inDrag = false;
        this._resetImagePosition(evt.clientX, evt.clientY);

        this._removeStopSelect();
        evt.stopPropagation();
      },

      _onSliderMouseDown: function(evt) {
        if (this._zoomRatio <= 1) {
          return;
        }

        this.inSlider = true;
        this._currentX = evt.clientX;
        this._currentY = evt.clientY;

        var sliderPosition = html.position(this.sliderNode);
        this._startSliderLeft = sliderPosition.x;
        this._sliderWidth = sliderPosition.w;

        this._stopSelect();
        evt.stopPropagation();
      },

      _onSliderMouseUp: function(evt) {
        if (this._zoomRatio <= 1) {
          return;
        }

        if (!this.inSlider) {
          return;
        }

        this.inSlider = false;
        this._resetSliderButtonPosition(evt.clientX);

        var imageStyle = this._getComputedStyle(this.baseImage);
        this._currentLeft = parseFloat(imageStyle.left);
        this._currentTop = parseFloat(imageStyle.top);
        var delX = evt.clientX - this._startSliderLeft;
        this._latestPercentage = delX / this._sliderWidth * 100;
        this._latestPercentage = this._normalizePercentage(this._latestPercentage);

        this._removeStopSelect();
        evt.stopPropagation();
      },

      _onMouseMove: function(evt) {
        if (this.inDrag) {
          this._resetImagePosition(evt.clientX, evt.clientY);
        }

        if (this.inSlider) {
          if (this._zoomRatio <= 1) {
            return;
          }
          this._resetSliderButtonPosition(evt.clientX, evt.clientY);
        }
      },

      _onMouseUp: function(evt) {
        if (this.inDrag) {
          this._onViewerMouseUp(evt);
        }

        if (this.inSlider) {
          this._onSliderMouseUp(evt);
        }
      },

      _onZoomOutClick: function() {
        if (this._zoomRatio <= 1) {
          return;
        }

        this._zoomImage('out');
      },

      _onZoomInClick: function() {
        if (this._zoomRatio <= 1) {
          return;
        }

        this._zoomImage('in');
      },

      _zoomImage: function(type) {
        var p = 0;
        this._latestPercentage = this._normalizePercentage(this._latestPercentage);
        if (type === 'in') {
          p = window.isRTL ? this._latestPercentage - 20 : this._latestPercentage + 20;
        } else if (type === 'out') {
          p = window.isRTL ? this._latestPercentage + 20 : this._latestPercentage - 20;
        }

        var percentage = this._normalizePercentage(p);
        this._moveSliderButton(percentage, this._latestPercentage);
        this._latestPercentage = percentage;
        var imageStyle = this._getComputedStyle(this.baseImage);
        this._currentLeft = parseFloat(imageStyle.left);
        this._currentTop = parseFloat(imageStyle.top);
      },

      _resetImagePosition: function(clientX, clientY) {
        var delX = clientX - this._currentX;
        var delY = clientY - this._currentY;

        if (this._currentTop + delY >= 0) {
          html.setStyle(this.baseImage, 'top', 0);
          html.setStyle(this.viewerImage, 'top', 0);
          this._currentY = clientY;
          this._currentTop = 0;
        } else if (this._currentTop + delY <= this._maxOffsetTop) {
          html.setStyle(this.baseImage, 'top', this._maxOffsetTop + 'px');
          html.setStyle(this.viewerImage, 'top', this._maxOffsetTop + 'px');
          this._currentY = clientY;
          this._currentTop = this._maxOffsetTop;
        } else {
          html.setStyle(this.baseImage, 'top', this._currentTop + delY + 'px');
          html.setStyle(this.viewerImage, 'top', this._currentTop + delY + 'px');
          this._currentY = clientY;
          this._currentTop += delY;
        }

        if (this._currentLeft + delX >= 0) {
          html.setStyle(this.baseImage, 'left', 0);
          html.setStyle(this.viewerImage, 'left', 0);
          this._currentX = clientX;
          this._currentLeft = 0;
        } else if (this._currentLeft + delX <= this._maxOffsetLeft) {
          html.setStyle(this.baseImage, 'left', this._maxOffsetLeft + 'px');
          html.setStyle(this.viewerImage, 'left', this._maxOffsetLeft + 'px');
          this._currentX = clientX;
          this._currentLeft = this._maxOffsetLeft;
        } else {
          html.setStyle(this.baseImage, 'left', this._currentLeft + delX + 'px');
          html.setStyle(this.viewerImage, 'left', this._currentLeft + delX + 'px');
          this._currentX = clientX;
          this._currentLeft += delX;
        }
      },

      _normalizePercentage: function(p) {
        p = p < 0 ? 0 : p;
        p = p > 100 ? 100 : p;

        return p;
      },

      _resetSliderButtonPosition: function(clientX) {
        var delX = clientX - this._startSliderLeft;
        var leftPercentage = delX / this._sliderWidth * 100;
        leftPercentage = this._normalizePercentage(leftPercentage);
        var _latestPercentage = this._latestPercentage;

        this._moveSliderButton(leftPercentage, _latestPercentage);
      },

      _moveSliderButton: function(leftPercentage, _latestPercentage) {
        if (leftPercentage <= 0) {
          html.addClass(this.zoomOutBtn, 'disable-zoom');
        } else {
          html.removeClass(this.zoomOutBtn, 'disable-zoom');
        }
        if (leftPercentage >= 100) {
          html.addClass(this.zoomInBtn, 'disable-zoom');
        } else {
          html.removeClass(this.zoomInBtn, 'disable-zoom');
        }
        html.setStyle(this.sliderButton, 'left', leftPercentage + '%');

        if (window.isRTL) {
          leftPercentage = 100 - leftPercentage;
          _latestPercentage = 100 - _latestPercentage;
        }

        var delImageWidth = this._minImageWidth * (this._zoomRatio - 1) * leftPercentage / 100;
        var delImageHeight = this._minImageHeight * (this._zoomRatio - 1) * leftPercentage / 100;

        var imageStyle = this._getComputedStyle(this.baseImage);
        this._currentLeft = parseFloat(imageStyle.left);
        this._currentTop = parseFloat(imageStyle.top);
        var delImageLeft = (Math.abs(this._currentLeft) + this.idealWidth / 2) *
          ((this._minImageWidth + delImageWidth) / this._currentImageWidth - 1);
        var delImageTop = (Math.abs(this._currentTop) + this.idealHeight / 2) *
          ((this._minImageWidth + delImageWidth) / this._currentImageWidth - 1);

        html.setStyle(this.baseImage, {
          width: this._minImageWidth + delImageWidth + 'px',
          height: this._minImageHeight + delImageHeight + 'px'
        });
        html.setStyle(this.viewerImage, {
          width: this._minImageWidth + delImageWidth + 'px',
          height: this._minImageHeight + delImageHeight + 'px'
        });

        this._currentImageWidth = this._minImageWidth + delImageWidth;
        this._currentImageHeight = this._minImageHeight + delImageHeight;

        //prevent image out the crop box
        if (leftPercentage - _latestPercentage >= 0) {
          html.setStyle(this.baseImage, {
            top: this._currentTop - delImageTop + 'px',
            left: this._currentLeft - delImageLeft + 'px'
          });
          html.setStyle(this.viewerImage, {
            top: this._currentTop - delImageTop + 'px',
            left: this._currentLeft - delImageLeft + 'px'
          });
        } else {
          var top = 0;
          var left = 0;
          if (this._currentTop - delImageTop >= 0) {
            top = 0;
          } else if (this._currentTop - delImageTop +
            this._minImageHeight + delImageHeight <=
            this.idealHeight) {
            top = this.idealHeight - this._minImageHeight - delImageHeight;
          } else {
            top = this._currentTop - delImageTop;
          }
          if (this._currentLeft - delImageLeft >= 0) {
            left = 0;
          } else if (this._currentLeft - delImageLeft +
            this._minImageWidth + delImageWidth <=
            this.idealWidth) {
            left = this.idealWidth - this._minImageWidth - delImageWidth;
          } else {
            left = this._currentLeft - delImageLeft;
          }

          html.setStyle(this.baseImage, {
            top: top + 'px',
            left: left + 'px'
          });
          html.setStyle(this.viewerImage, {
            top: top + 'px',
            left: left + 'px'
          });
        }

        this._latestPercentage = leftPercentage;
      }
    });
  });