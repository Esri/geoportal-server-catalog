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

define(['dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dijit/_WidgetBase',
  'dojo/dom-geometry',
  'dojo/dom-class',
  'dojo/Evented',
  'dojo/debounce'
],
function(declare, lang, array, _WidgetBase, domGeometry, domClass, Evented, debounce) {
  var COMPONENT_NAME = 'jimu grid';
  /**
   * The structure of the this layout has one limitation:
   * A stack only contains one component.
   */
  return declare([_WidgetBase, Evented], {
    'baseClass': 'jimu-dijit-gridlayout',
    declaredClass: 'jimu.dijit.GridLayout',

    container: null, // the container domNode of golden layout
    layoutDefinition: null, // configuration of golden layout
    components: null, // array of {id: string, dijit: dijit instance}
    editable: false,

    _layout: null, // instance of goldenLayout
    _coordinates: null, // an object whose key is component id and value is component coordinate.

    postCreate: function(){
      this.inherited(arguments);
      this._coordinates = {};
      var config = {
        settings: {
          hasHeaders: false,
          resizeEnabled: this.editable,
          reorderEnabled: this.editable,
          selectionEnabled: this.editable
        },
        dimensions: {
          borderWidth: 1,
          dragProxyWidth: 0,
          dragProxyHeight: 0
        },
        content: this.layoutDefinition
      };
      require(['libs/goldenlayout/goldenlayout'], lang.hitch(this, function(GoldenLayout){
        this._layout = new GoldenLayout(config, this.container);
        this._layout.registerComponent(COMPONENT_NAME, lang.hitch(this, function(container, componentState){
          var targetDijit;
          container.parent.config.id = componentState.id;
          array.some(this.components, function(item) {
            if (item.id === componentState.id) {
              targetDijit = item.dijit;
              container.getElement().html(item.dijit.domNode);
              return true;
            }
          }, this);
          container.on('resize', debounce(lang.hitch(this, function() {
            if (container.width > 0 && container.height > 0 && targetDijit &&
              typeof targetDijit.resize === 'function') {
              targetDijit.resize(container.width, container.height);
            }
          }), 200));
          container.on('select', lang.hitch(this, function() {
            if(this.editable) {
              container.parent.select();
            }
            this.emit('mask-click', container.parent.config.id);
          }));
        }));
        this._layout.on( 'initialised', lang.hitch(this, function(){
          this._resetCoordinate();
          this.emit("initialised");
        }));
        this._layout.on('stateChanged', lang.hitch(this, function(){
          this._resetCoordinate();
        }));
        this._layout.init();

        if (!this.editable) {
          domClass.add(this._layout.root.childElementContainer[0], 'viewonly');
        }
        domClass.add(this._layout.root.childElementContainer[0], 'jimu-dijit-gridlayout');
        setTimeout(lang.hitch(this, this.resize), 100);
      }));
    },

    destroy: function() {
      array.forEach(this.components, function(component) {
        component.dijit.destroy();
      });
      this._layout.destroy();
      this.inherited(arguments);
    },

    getLayoutDefinition: function() {
      var currentConfig = this._layout.toConfig();
      return currentConfig.content;
    },

    resize: function() {
      var box = domGeometry.getMarginBox(this.container);
      this._layout.updateSize(box.w, box.h);
    },

    getComponentSize: function(componentId) {
      var rootElem = this._layout.root.contentItems[0];
      var contentItem = rootElem.getItemsById(componentId), container;
      if (contentItem && contentItem.length > 0) {
        container = contentItem[0].container;
        return {
          w: container.width,
          h: container.height
        };
      }
      return {
        w: 0,
        h: 0
      };
    },

    getSize: function() {
      return {
        w: this._layout.width,
        h: this._layout.height
      };
    },

    /**
     *
     */
    setVisible: function(componentId, visible) {
      var rootElem = this._layout.root.contentItems[0];
      var contentItem = rootElem.getItemsById(componentId);
      if (contentItem && contentItem.length > 0 && visible === false) {
        this._hideComponent(contentItem[0]);
      } else if ((!contentItem || contentItem.length === 0) && visible === true) {
        this._showComponent(componentId);
      }
    },

    _hideComponent: function(contentItem) {
      if (contentItem.parent) {
        // remove component but won't destroy it
        contentItem.parent.removeChild(contentItem, true);
      }
    },

    _showComponent: function(componentId) {
      var component, coordinates, currentNode, config, rootItem, rootContentItem, actualIndex;
      array.some(this.components, function(item) {
        if (item.id === componentId) {
          component = item;
          return true;
        }
      }, this);

      if (component) {
        config = {
          id: componentId,
          type: 'component',
          componentName: COMPONENT_NAME,
          componentState: {
            id: componentId
          }
        };
        coordinates = this._coordinates[componentId];
        rootItem = this._layout.root;
        if (coordinates) {
          // rootItem.type may be stack is there is only one component
          if (coordinates[0].type !== rootItem.contentItems[0].type) {
            rootContentItem = rootItem.contentItems[0];
            rootItem.replaceChild(rootContentItem, {
              type: coordinates[0].type,
              content: []
            });
            rootItem.contentItems[0].addChild(rootContentItem);
          }

          currentNode = rootItem;
          array.forEach(coordinates, function(pos) {
            actualIndex = pos.index <= currentNode.contentItems.length ?
              pos.index : currentNode.contentItems.length;
            if (pos.type === 'component') {
              currentNode.addChild(config, actualIndex);
            } else { //stack, column or row
              if (pos.type === 'stack' ||
                currentNode.contentItems[pos.index].type !== pos.type) {
                currentNode.addChild({
                  type: pos.type,
                  content: []
                }, actualIndex);
              }
              currentNode = currentNode.contentItems[actualIndex];
            }
          }, this);
        } else {
          if (rootItem.contentItems[0].type === 'stack') {
            rootContentItem = rootItem.contentItems[0];
            rootItem.replaceChild(rootContentItem, {
              type: 'column',
              content: []
            });
            rootItem.contentItems[0].addChild(rootContentItem);
          }
          rootItem.contentItems[0].addChild(config);
        }
      }
    },

    /**
     * Calculate the coordinate of each component
     */
    _resetCoordinate: function() {
      var components = this._layout.root.getItemsByType('component');
      var next = function(item, coordinates) {
        var parent = item.parent;
        if (!parent) {
          return;
        }
        // get the index of the item in the contentItems array of its parent
        array.some(parent.contentItems, function(sibliingItem, index) {
          if (sibliingItem === item) {
            coordinates.push({
              type: sibliingItem.type,
              index: index
            });
            return true;
          }
        });
        next(parent, coordinates);
      };
      array.forEach(components, function(component) {
        var coordinates = [];
        next(component, coordinates);
        this._coordinates[component.config.id] = coordinates.reverse();
      }, this);
    }
  });
});