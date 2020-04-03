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
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/on',
  'dojo/Evented',
  'dojo/query',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/TabContainer3.html',
  'jimu/dijit/ViewStack'
],
function(declare, lang, array, html, on, Evented, query,
  _WidgetBase, _TemplatedMixin, template, ViewStack){
  return declare([_WidgetBase, _TemplatedMixin, Evented], {
    templateString: template,
    'baseClass':'jimu-tab3',
    declaredClass: 'jimu.dijit.TabContainer3',
    _currentIndex: -1,

    //options:
    selected: '',
    tabs: null,//[{title,content}]
    average: true,

    //public methods:
    //selectTab
    //hideShelter
    //showShelter

    //event: tabChanged

    //css classes:
    //tab-item-td

    postCreate: function(){
      this.inherited(arguments);
      this._initSelf();
      if(this.selected){
        this.selectTab(this.selected);
      }else if(this.tabs.length > 0){
        this.selectTab(this.tabs[0].title);
      }
    },

    selectTab: function(title){
      var tds = query('td', this.tabTr);
      array.forEach(tds, lang.hitch(this, function(td, index) {
        html.removeClass(td, 'jimu-state-active');
        if (td.label === title) {
          html.addClass(td, 'jimu-state-active');
          this._currentIndex = index;
        }
      }));
      this.controlNode.removeChild(this.controlTable);
      html.place(this.controlTable, this.controlNode);
      this.viewStack.switchView(title);
      this.emit('tabChanged', title);
    },

    addTab: function(tabConfig){
      if(!this.average){
        //remove last td int this.tabTr
        var lastTd = query('td:last-child', this.tabTr);
        if(lastTd.length > 0){
          html.destroy(lastTd[0]);
        }
      }

      //create tab
      var tabsHasSameTitle = array.filter(this.tabs, function(tab){
        return tab.title === tabConfig.title;
      });
      if(tabsHasSameTitle.length > 0){
        console.error('tab title conflict: ' + tabConfig.title);
        return;
      }
      this.tabs.push(tabConfig);
      this._createTab(tabConfig);

      if(!this.average){
        var strTabItemTd = '<td nowrap class="tab-item-td" style="border-bottom:1px solid #ccc;">' +
        '<div class="tab-item-div"></div></td>';
        var tabItemTd = html.toDom(strTabItemTd);
        html.place(tabItemTd, this.tabTr);
      }
    },

    removeTab: function(title){
      var idx = -1;
      var result = array.some(this.tabs, function(item, i){
        if(item.title === title){
          idx = i;
          return true;
        }
      });

      if(result){
        //remove from this.tabs
        var removedTab = this.tabs.splice(idx, 1)[0];
        //remove from this.tabTr
        var tdItems = query('td', this.tabTr);
        var tdToRemove;
        var tdSelected = array.some(tdItems, function(tdItem){
          if(tdItem.label === title){
            tdToRemove = tdItem;
            return true;
          }
        });
        if(tdSelected){
          html.destroy(tdToRemove);
        }
        //remove from this.viewStack
        this.viewStack.removeView(removedTab.content);
      }
    },

    showShelter: function(){
      html.setStyle(this.shelter, 'display', 'block');
    },

    hideShelter: function(){
      html.setStyle(this.shelter, 'display', 'none');
    },

    getSelectedIndex: function(){
      return this._currentIndex;
    },

    getSelectedTitle: function(){
      return this.viewStack.getSelectedLabel();
    },

    _initSelf:function(){
      this.viewStack = new ViewStack(null, this.containerNode);
      array.forEach(this.tabs, function(tabConfig){
        this._createTab(tabConfig);
      }, this);
      if(this.average){
        this.controlTable.style.tableLayout = 'fixed';
        html.addClass(this.domNode, 'average');
      }else{
        var strTabItemTd = '<td nowrap class="tab-item-td" style="border-bottom:1px solid #ccc;">' +
        '<div class="tab-item-div"></div></td>';
        var tabItemTd = html.toDom(strTabItemTd);
        html.place(tabItemTd, this.tabTr);
      }
    },

    startup: function() {
      this.inherited(arguments);
      this._started = true;
    },

    _createTab:function(tabConfig){
      var strTabItemTd = '<td nowrap class="tab-item-td"><div class="tab-item-div"></div></td>';
      var tabItemTd = html.toDom(strTabItemTd);
      tabItemTd.label = tabConfig.title || '';
      tabItemTd.title = tabConfig.title;
      html.place(tabItemTd, this.tabTr);
      var tabItemDiv = query('.tab-item-div', tabItemTd)[0];
      tabItemDiv.innerHTML = tabItemTd.label;
      tabItemDiv.label = tabItemTd.label;
      tabConfig.content.label = tabItemTd.label;
      this.viewStack.addView(tabConfig.content);
      this.own(on(tabItemTd, 'click', lang.hitch(this, this._onSelect, tabConfig.title)));
    },

    _onSelect: function(title){
      this.selectTab(title);
    }

  });
});