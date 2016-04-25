///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
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

define(['dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/on',
    'dojo/query',
    'dojo/io-query',
    'dojo/cookie',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidget',
    'jimu/dijit/CheckBox',
    'jimu/tokenUtils',
    'jimu/utils'
  ],
  function(declare, lang, html, on, query, ioquery, cookie, _WidgetsInTemplateMixin, BaseWidget,
    CheckBox, TokenUtils, utils) {
    function isFullWindow() {
      if (window.appInfo.isRunInMobile) {
        return true;
      } else {
        return false;
      }
    }

    var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {
      baseClass: 'jimu-widget-splash',

      _hasContent: null,
      _requireConfirm: null,
      _isClosed: false,

      postCreate: function() {
        this.inherited(arguments);
        this._hasContent = this.config.splash && this.config.splash.splashContent;
        this._requireConfirm = this.config.splash && this.config.splash.requireConfirm;
        this._showOption = this.config.splash && this.config.splash.showOption;
        this._confirmEverytime = this.config.splash && this.config.splash.confirmEverytime;

        if (this._hasContent) {
          this.customContentNode.innerHTML = this.config.splash.splashContent;
        }

        if (!this._requireConfirm && !this._showOption) {
          html.setStyle(this.confirmCheck, 'display', 'none');
          html.addClass(this.okNode, 'enable-btn');
        } else {
          var hint = "";
          if (this._requireConfirm) {
            hint = this.config.splash.confirmText;
            html.addClass(this.okNode, 'disable-btn');
          } else {
            hint = this.nls.notShowAgain;
            html.addClass(this.okNode, 'enable-btn');
          }
          this.confirmCheck = new CheckBox({
            label: utils.stripHTML(hint),
            checked: false
          }, this.confirmCheck);
          this.own(on(this.confirmCheck.domNode, 'click', lang.hitch(this, this.onCheckBoxClick)));
          html.setAttr(this.confirmCheck.domNode, 'title', utils.stripHTML(hint));
          this.confirmCheck.startup();
        }

        if (this.config && this.config.splash && this.config.splash.backgroundColor) {
          html.setStyle(
            this.splashContainerNode,
            'backgroundColor',
            this.config.splash.backgroundColor
          );
        }

        this.urlParams = this.getUrlParams();
      },

      onOpen: function() {
        if (!TokenUtils.isInConfigOrPreviewWindow()) {
          var isFirstKey = this._getCookieKey();
          var isfirst = cookie(isFirstKey);
          if (isfirst && isfirst.toString() === 'false') {
            this.close();
          }
        }
      },

      onClose: function() {
        this.close();
      },

      getUrlParams: function() {
        var s = window.location.search,
          p;
        if (s === '') {
          return {};
        }

        p = ioquery.queryToObject(s.substr(1));
        return p;
      },

      startup: function() {
        this.inherited(arguments);

        this._normalizeDomNodePosition();
        this.resize();
        this.own(on(window, 'resize', lang.hitch(this, function() {
          this.resize();
        })));

        if (!TokenUtils.isInConfigOrPreviewWindow()) {
          var isFirstKey = this._getCookieKey();
          var isfirst = cookie(isFirstKey);
          if (isfirst && isfirst.toString() === 'false') {
            this.close();
          }
        }

        this._resizeContentImg();
      },

      _normalizeDomNodePosition: function() {
        html.setStyle(this.domNode, 'top', 0);
        html.setStyle(this.domNode, 'left', 0);
        html.setStyle(this.domNode, 'right', 0);
        html.setStyle(this.domNode, 'bottom', 0);
      },

      setPosition: function(position){
        this.position = position;

        html.place(this.domNode, window.jimuConfig.layoutId);
        this._normalizeDomNodePosition();
        if(this.started){
          this.resize();
        }
      },

      resize: function() {
        this._changeStatus();
      },

      _resizeContentImg: function() {
        var customBox = html.getContentBox(this.customContentNode);

        if (this._hasContent && !this._isClosed) {
          html.empty(this.customContentNode);

          var splashContent = html.toDom(this.config.splash.splashContent);
          // DocumentFragment or single node
          if (splashContent.nodeType &&
            (splashContent.nodeType === 11 || splashContent.nodeType === 1)) {
            var contentImgs = query('img', splashContent);
            if (contentImgs && contentImgs.length) {
              contentImgs.style({
                maxWidth: (customBox.w - 20) + 'px' // prevent x scroll
              });
            } else if (splashContent.nodeName.toUpperCase() === 'IMG') {
              html.setStyle(splashContent, 'maxWidth', (customBox.w - 20) + 'px');
            }
          }
          html.place(splashContent, this.customContentNode);
        }
      },

      _changeStatus: function() {
        if (isFullWindow()) {
          html.addClass(this.domNode, 'jimu-widget-splash-mobile');
          html.removeClass(this.domNode, 'jimu-widget-splash-desktop');
        } else {
          html.addClass(this.domNode, 'jimu-widget-splash-desktop');
          html.removeClass(this.domNode, 'jimu-widget-splash-mobile');
        }

        if (html.hasClass(this.domNode, 'jimu-widget-splash-desktop')) {
          html.setStyle(this.customContentNode, 'marginTop', '20px');
          html.setStyle(this.customContentNode, 'height', 'auto');

          var box = html.getContentBox(this.splashContainerNode);
          if (box && box.w > 0) {
            html.setStyle(this.envelopeNode, 'width', box.w + 'px');
          }
          if (box && box.h > 0) {
            html.setStyle(this.envelopeNode, 'height', box.h + 'px');
          }
        } else {
          html.setStyle(this.splashContainerNode, 'top', 0);
          html.setStyle(this.splashContainerNode, 'left', 0);
          html.setStyle(this.envelopeNode, 'width', 'auto');
          html.setStyle(this.envelopeNode, 'height', 'auto');

          this._moveContentToMiddle();
        }
        this._resizeContentImg();
      },

      _moveContentToMiddle: function() { // mobile
        html.setStyle(this.customContentNode, {
          marginTop: 0,
          height: 'auto'
        });
        var containerBox = html.getMarginBox(this.splashContainerNode);
        var containerContent = html.getContentBox(this.splashContainerNode);
        var customContentNode = html.getContentBox(this.customContentNode);
        var footerBox = html.getMarginBox(this.footerNode);
        var mTop = (containerBox.h - footerBox.h - customContentNode.h) / 2;
        if (typeof mTop === 'number' && mTop > 10) { // when customContentNode.h < containerBox.h
          html.setStyle(this.customContentNode, 'marginTop', mTop + 'px');
        } else { // when customContentNode.h > containerBox.h
          html.setStyle(this.customContentNode, 'marginTop', '10px');
          var customContentHeight = containerContent.h - footerBox.h - 10; // margin-bottom:20px
          if (typeof customContentHeight === 'number' && customContentHeight > 0) {
            html.setStyle(this.customContentNode, 'height', customContentHeight + 'px');
          }
        }
      },

      onCheckBoxClick: function() {
        if (this._requireConfirm) {
          if (this.confirmCheck.getValue()) {
            html.addClass(this.okNode, 'enable-btn');
            html.removeClass(this.okNode, 'disable-btn');
          } else {
            html.addClass(this.okNode, 'disable-btn');
            html.removeClass(this.okNode, 'enable-btn');
          }
        }
      },

      _getCookieKey: function() {
        // xt or integration use id of app as key,
        // deploy app use pathname as key
        return 'isfirst_' +  this.urlParams.id || this.urlParams.appid ||
          window.path;
      },

      onOkClick: function() {
        var isFirstKey = this._getCookieKey();
        if (this._requireConfirm) {
          if (this.confirmCheck.getValue()) {
            if (TokenUtils.isInConfigOrPreviewWindow() || this._confirmEverytime) {
              cookie(isFirstKey, null, {expires: -1});
            } else {
              cookie(isFirstKey, false, {
                expires: 1000,
                path: '/'
              });
            }
            this.close();
          }
        } else {
          if (this._showOption) {
            if (!TokenUtils.isInConfigOrPreviewWindow() && this.confirmCheck.getValue()) {
              cookie(isFirstKey, false, {
                expires: 1000,
                path: '/'
              });
            }
          } else {
            cookie(isFirstKey, null, {expires: -1});
          }
          this.close();
        }
      },

      close: function() {
        html.setStyle(this.domNode, 'display', 'none');
        this._isClosed = true;
      }
    });
    return clazz;
  });