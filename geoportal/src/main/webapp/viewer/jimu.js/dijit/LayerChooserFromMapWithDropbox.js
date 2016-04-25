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
    'dojo/_base/array',
    'dojo/dom-style',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/Evented',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/text!./templates/LayerChooserFromMapWithDropbox.html'
  ],
  function(declare, lang, array, domStyle, domConstruct, on, Evented,
    _WidgetBase, _TemplatedMixin, template) {
    return declare([_WidgetBase, _TemplatedMixin, Evented], {
      templateString: template,
      baseClass: 'jimu-layer-chooser-from-map-withdropbox',
      declaredClass: 'jimu.dijit.LayerChooserFromMapWithDropbox',

      //options:
      layerChooser: null,//instance of LayerChooserFromMap

      postCreate: function() {
        this.inherited(arguments);

        if(this.layerChooser){
          this.layerChooser.domNode.style.zIndex = 1;
          this.layerChooser.placeAt(this.layerChooseNode);
          this.own(on(this.layerChooser, 'tree-click', lang.hitch(this, this._onTreeClick)));
        }
      },

      _onDropDownClick: function() {
        if (domStyle.get(this.layerChooseNode, 'display') === 'none') {
          this.showChooseNode();
        } else {
          this.hideChooseNode();
        }
      },

      showChooseNode: function() {
        domStyle.set(this.layerChooseNode, 'display', '');
      },

      hideChooseNode: function() {
        domStyle.set(this.layerChooseNode, 'display', 'none');
      },

      _onTreeClick: function() {
        domConstruct.empty(this.layerNameNode);
        var selections = [];

        array.forEach(this.layerChooser.getSelectedItems(), function(item) {
          domConstruct.place('<span>' + item.layerInfo.title + '</span>', this.layerNameNode);
          selections.push(item.layerInfo.layerObject);
        }, this);

        var changed = false;

        if (!this.selectedLayers || this.selectedLayers.length !== selections.length) {
          this.selectedLayers = selections;
          changed = true;
        } else {
          //compare current selection and previous
          var currentIds = array.map(selections, function(item) {
            return item.id;
          });
          var previousIds = array.map(this.selectedLayers, function(item) {
            return item.id;
          });
          var isSame = array.every(currentIds, function(id) {
            return previousIds.indexOf(id) > -1;
          });
          if (!isSame) {
            this.selectedLayers = selections;
            changed = true;
          }
        }

        if (changed && this.selectedLayers.length > 0) {
          domStyle.set(this.layerChooseNode, 'display', 'none');
          this.emit('selection-change', this.selectedLayers);
        }
      }
    });
  });