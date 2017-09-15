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
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/_TreeNode.html',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/_base/event',
  'dojo/query',
  'dojo/aspect',
  'dojo/on',
  'dojo/Evented',
  'dijit/registry',
  'dijit/Tree',
  'jimu/utils'
],
function(declare, _WidgetBase, _TemplatedMixin, tnTemplate, lang, html, array,
  dojoEvent, query, aspect, on, Evented, registry, DojoTree, jimuUtils) {
  /*jshint unused: false*/
  var JimuTreeNode = declare([DojoTree._TreeNode, Evented], {
    templateString: tnTemplate,
    declaredClass: 'jimu._TreeNode',

    //options:
    isLeaf: false,
    groupId: "", //radio group

    postCreate: function(){
      this.inherited(arguments);
      html.addClass(this.domNode, 'jimu-tree-node');
      this.isLeaf = !!this.isLeaf;

      if(this.groupId){
        this.checkNode = html.toDom('<input type="radio" />');
        this.checkNode.name = this.groupId;
      }
      else{
        this.checkNode = html.toDom('<input type="checkbox" />');
      }

      html.addClass(this.checkNode, "jimu-tree-check-node");

      html.place(this.checkNode, this.contentNode, 'first');

      this.own(on(this.checkNode, 'click', lang.hitch(this, this._onClick)));

      if(this.isLeaf){
        if(this.groupId){
          html.setStyle(this.checkNode, 'display', 'none');
        }else{
          html.setStyle(this.checkNode, 'display', 'inline');
        }
      }
      else{
        html.setStyle(this.checkNode, 'display', 'none');
      }
      if(this.isLeaf){
        html.addClass(this.domNode, 'jimu-tree-leaf-node');
      }else{
        html.addClass(this.domNode, 'jimu-tree-not-leaf-node');
      }
    },

    // hasSelectedClass: function(){
    //   if(this.rowNode){
    //     if(html.hasClass(this.rowNode, 'dijitTreeRowSelected')){
    //       return true;
    //     }
    //   }
    //   return false;
    // },

    select: function(){
      if(this.isLeaf){
        this.checkNode.checked = true;
        html.addClass(this.domNode, 'jimu-tree-selected-leaf-node');
      }
    },

    unselect: function(){
      if(this.isLeaf){
        this.checkNode.checked = false;
        html.removeClass(this.domNode, 'jimu-tree-selected-leaf-node');
      }
    },

    toggleSelect: function(){
      if(this.isLeaf){
        if(this.checkNode.checked){
          this.unselect();
        }else{
          this.select();
        }
      }
    },

    _onClick: function(evt){
      var target = evt.target || evt.srcElement;
      if(target === this.checkNode){
        this.tree._onCheckNodeClick(this, this.checkNode.checked, evt);
      }
      else{
        this.tree._onClick(this, evt);
      }
    },

    _onChange: function(){
      if(this.isLeaf){
        setTimeout(lang.hitch(this, function(){
          if(this.checkNode.checked){
            this.emit('tn-select', this);
          }
          else{
            this.emit('tn-unselect', this);
          }
        }), 100);
      }
    },

    destroy: function(){
      delete this.tree;
      this.inherited(arguments);
    }
  });

  var JimuTree = declare([DojoTree, Evented], {
    declaredClass:'jimu._Tree',
    openOnClick: true,

    //options:
    multiple: true,
    uniqueId: '',
    showRoot: false,

    //public methods:
    //getSelectedItems
    //getTreeNodeByItemId
    //selectItem
    //unselectItem
    //removeItem
    //getAllLeafTreeNodeWidgets
    //getAllTreeNodeWidgets

    //method need to be override
    //isLeafItem

    postMixInProperties: function(){
      this.inherited(arguments);
      this.uniqueId = "tree_" + jimuUtils.getRandomString();
    },

    postCreate: function(){
      this.inherited(arguments);
      html.addClass(this.domNode, 'jimu-tree');
      this.own(aspect.before(this, 'onClick', lang.hitch(this, this._jimuBeforeClick)));
      //this.own(aspect.before(this, 'onOpen', lang.hitch(this, this._jimuBeforeOpen)));
      if(this.rootLoadingIndicator){
        html.setStyle(this.rootLoadingIndicator, 'display', 'none');
      }
      //disable selection by shift key or ctrl key + mouse click
      //http://stackoverflow.com/questions/12261723/
      //how-to-disable-multiple-selection-of-nodes-in-dijit-tree
      this.dndController.singular = true;
    },

    removeItem: function(id){
      this.model.store.remove(id);
    },

    getAllItems: function(){
      var allTNs = this.getAllTreeNodeWidgets();
      var items = array.map(allTNs, lang.hitch(this, function(tn){
        var a = tn.item;//lang.clone(tn.item);
        a.selected = tn.checkNode.checked;
        return a;
      }));
      return items;
    },

    getSelectedItems: function(){
      var allTNs = this.getAllTreeNodeWidgets();
      var selectedTNs = array.filter(allTNs, lang.hitch(this, function(tn){
        return tn.checkNode.checked;
      }));
      // selectedTNs = array.filter(selectedTNs, lang.hitch(this, function(tn){
      //   return tn.hasSelectedClass();
      // }));
      var items = array.map(selectedTNs, lang.hitch(this, function(tn){
        return tn.item;
      }));
      return items;//lang.clone(items) may throw an error
    },

    getFilteredItems: function(func){
      var allTNs = this.getAllTreeNodeWidgets();
      var allItems = array.map(allTNs, lang.hitch(this, function(tn){
        var a = tn.item;//lang.clone(tn.item);
        a.selected = tn.checkNode.checked;
        return a;
      }));
      var filteredItems = array.filter(allItems, lang.hitch(this, function(item){
        return func(item);
      }));
      return filteredItems;
    },

    getTreeNodeByItemId: function(itemId){
      var doms = this._getAllTreeNodeDoms();
      for(var i = 0; i < doms.length; i++){
        var d = doms[i];
        var tn = registry.byNode(d);
        if(tn.item.id.toString() === itemId.toString()){
          return tn;
        }
      }
      return null;
    },

    selectItem: function(itemId){
      var tn = this.getTreeNodeByItemId(itemId);
      if(tn && tn.isLeaf){
        //tn.select();
        this.selectNodeWidget(tn);
      }
    },

    unselectItem: function(itemId){
      var tn = this.getTreeNodeByItemId(itemId);
      if(tn && tn.isLeaf){
        tn.unselect();
      }
    },

    getAllLeafTreeNodeWidgets: function(){
      var tns = this.getAllTreeNodeWidgets();
      return array.filter(tns, lang.hitch(this, function(tn){
        return tn.isLeaf;
      }));
    },

    getAllTreeNodeWidgets: function(){
      var doms = this._getAllTreeNodeDoms();
      return array.map(doms, lang.hitch(this, function(node){
        return registry.byNode(node);
      }));
    },

    //to be override
    isLeafItem: function(item){
      return item && item.isLeaf;
    },

    _getAllTreeNodeDoms: function(){
      return query('.dijitTreeNode', this.domNode);
    },

    _createTreeNode: function(args){
      args.isLeaf = this.isLeafItem(args.item);
      if(!this.multiple){
        args.groupId = this.uniqueId;
      }
      var tn = new JimuTreeNode(args);
      // this.own(on(tn, 'tn-select', lang.hitch(this, this._onTreeNodeSelect)));
      // this.own(on(tn, 'tn-unselect', lang.hitch(this, this._onTreeNodeUnselect)));
      return tn;
    },

    _onTreeNodeSelect: function(/*TreeNode*/ nodeWidget){
      var item = nodeWidget.item;
      var args = {
        item: item,
        treeNode: nodeWidget
      };
      this.emit('item-select', args);
    },

    _onTreeNodeUnselect: function(/*TreeNode*/ nodeWidget){
      var item = nodeWidget.item;
      var args = {
        item: item,
        treeNode: nodeWidget
      };
      this.emit('item-unselect', args);
    },

    selectNodeWidget: function(nodeWidget){
      if(!this.multiple){
        this.unselectAllLeafNodeWidgets();
      }
      nodeWidget.select();
    },

    _jimuBeforeClick: function(item, node, evt){
      /*jshint unused: false*/
      //only handle leaf node
      if(node.isLeaf){
        var target = evt.target || evt.srcElement;
        //if click <input> in node, we don't handle it
        //only handle it when click the row
        if(!html.hasClass(target, 'jimu-tree-check-node')){
          if(this.multiple){
            node.toggleSelect();
          }else{
            //node.select();
            this.selectNodeWidget(node);
          }
        }
      }
      return arguments;
    },

    _onCheckNodeClick: function(/*TreeNode*/ nodeWidget,/*Boolean*/ newState, /*Event*/ evt){
      if(!this.multiple && newState){
        this.unselectAllLeafNodeWidgets();
      }
      dojoEvent.stop(evt);
      this.focusNode(nodeWidget);
      setTimeout(lang.hitch(this, function(){
        if(newState){
          //nodeWidget.select();
          this.selectNodeWidget(nodeWidget);
        }else{
          nodeWidget.unselect();
        }
        //nodeWidget.checkNode.checked = newState;
        this.onClick(nodeWidget.item, nodeWidget, evt);
      }), 0);
    },

    unselectAllLeafNodeWidgets: function(){
      // var allCbxes = query('.jimu-tree-check-node', this.domNode);
      // array.forEach(allCbxes, lang.hitch(this, function(checkNode){
      //   checkNode.checked = false;
      // }));
      var nodes = this.getAllLeafTreeNodeWidgets();
      array.forEach(nodes, lang.hitch(this, function(nodeWidget){
        nodeWidget.unselect();
      }));
    }

  });

  return JimuTree;
});