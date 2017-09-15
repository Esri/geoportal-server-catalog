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
  'dijit/TooltipDialog',
  'dijit/popup',
  'dojo/_base/html',
  'dojo/on',
  'dojo/mouse',
  'dojo/query'
], function(TooltipDialog, dojoPopup, html, on, Mouse, query) {
  var mo = {}, tooltipTimeout = 200;

  mo.initTooltips = function(domNode) {
    query('[title]', domNode).forEach(function(node){
      if (node) {
        var content = html.getAttr(node, 'title');
        html.setAttr(node, 'title', '');
        createTooptipDialog(content, node);
      }
    });
  };

  function createTooptipDialog(content, node){
    var tooltipDialogContent = html.create("div", {
      'innerHTML': content,
      'class': 'dialog-content'
    });

    var tooltipDialog = new TooltipDialog({
      content: tooltipDialogContent
    }), tooltipTimeoutId;

    on(node, Mouse.enter, function() {
      clearTimeout(tooltipTimeoutId);
      tooltipTimeoutId = -1;
      tooltipTimeoutId = setTimeout(function() {
        dojoPopup.open({
          parent: null,
          popup: tooltipDialog,
          around: node,
          position: ["below"]
        });
      }, tooltipTimeout);
    });
    on(node, Mouse.leave, function(){
      clearTimeout(tooltipTimeoutId);
      tooltipTimeoutId = -1;
      dojoPopup.close(tooltipDialog);
    });

    return tooltipDialog;
  }

  return mo;
});