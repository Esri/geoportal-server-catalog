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
    'dojo/_base/lang',
    'dojo/Evented',
    'dojo/_base/html',
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dojo/on',
    'dojo/query',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./ListMultipleSelect.html',
    'jimu/dijit/ToggleButton',
    'jimu/utils'
  ],function(lang, Evented, html, declare, _WidgetBase, on, query,
      _TemplatedMixin, _WidgetsInTemplateMixin, template, ToggleButton, jimuUtils) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
        templateString: template,
        selectType: null,
        dataList:[],
        checkedList:[], //save value
        checkedLabelList: [], //save label or alias
        _itemLabelW: 215, //ellipsis if label's width is larger than this

        ifFristPage: true, // if it is the first page to show
        queryState: true,// if it is quering data from server

        isCacheFinish: false,
        keyQueryMode: false,
        cacheQueryMode : false,

        emptyStr: '',

        postMixInProperties:function(){
          this.inherited(arguments);
          this.jimuCommonNls = window.jimuNls.common;
          this.Nls = window.jimuNls.filterBuilder;
          this.noDataNls = window.apiNls.widgets.FeatureTable.noData;
        },

        postCreate: function(){
          this.inherited(arguments);
          // this.checkedList = [];

          if(this.selectType === 'unique'){
            this.inputType = 'radio';
          }else{
            this.inputType = 'checkbox';
          }

          if(this.controlType === 'multipleDynamic' || this.controlType === 'uniqueDynamic'){
            html.addClass(this.listContainer, "items-setting-dropdown-content");
            this.searchKeyInput.style.display = 'block';
          }
          if(this.controlType === 'uniqueDynamic'){
            html.addClass(this.listContainer, 'items_content_no_selected_toggle');
          }

          if(this.runtime){
            // this.listContainer.style.height = 230 + 'px';
            html.addClass(this.listContainer, "items-widget-content");
            if(this.selectUI !== 'dropdown'){ //predefind & expanded
              html.addClass(this.listContainer, "items-widget-expaned-content");
              html.addClass(this.listContent, "jimu-multiple-items-expanded-list");
            }
          }else{
            html.addClass(this.listContainer, "items-setting-popup-content");
            this.searchKeyInput.style.display = 'block';
            // this.initDoms();
          }

          //for enable listSelect for every item when type is predefined
          if(!this.runtime && this.controlType === 'predefined'){
            html.addClass(this.listContainer, "items-setting-dropdown-content");
            this.searchKeyInput.style.display = 'block';
          }
          this._addCBXClickEvent();
          if(this.selectUI === 'dropdown' || (this.controlType === 'predefined' && !this.runtime)){
            this._addCBXHoverEvent();
          }

          //show custom label string when runtime & predefined
          this.disPlayLabel = 'value';
          if(this.runtime && (this.controlType === 'multiplePredefined' || this.controlType === 'uniquePredefined')){
            this.disPlayLabel = 'alias';
          }

          //for selected model
          if(this.controlType === 'multipleDynamic'){
            this.selectedToggleDiv.style.display = 'block';
            var toggleButton = new ToggleButton({}, this.selectedToggle);
            toggleButton.startup();
            this.selectedToggle.toggleButton = toggleButton;
            this.own(on(this.selectedToggleDiv, 'click', lang.hitch(this, '_toggleFilter')));
            this._addSelectedContainerEvent();
          }
        },

        _toggleFilter: function(evt) {
          var node = this.selectedToggle;
          var applied = html.hasClass(node, 'applied');
          if (applied) {
            html.removeClass(node, 'applied');
            node.toggleButton.uncheck();
            this.selectedContainer.style.display = 'none';
          } else {
            html.addClass(node, 'applied');
            node.toggleButton.check();
            this._initSelectedContainerItems();
            this.selectedContainer.style.display = 'block';
          }
          evt.stopPropagation();
        },

        _initSelectedContainerItems: function(){
          this.selectedListContent.innerHTML = '';
          var items = '';
          var labelRuntimeClass = this.runtime ? ' labelRuntime' : '';
          for(var index = 0; index < this.checkedList.length; index ++){
            var value = this.checkedList[index];
            var label = this.disPlayLabel === 'value' ? value : this.checkedLabelList[index];
            var dataAttr = this.isNumberField ? "data=" + value : "data='" + value + "'";
            var item = '<div class="item">' +
                  '<div class="checkInput ' + this.inputType + ' checked" ' + dataAttr + '></div>' +
                  '<div class="label jimu-ellipsis' + labelRuntimeClass + '" title="' + value +
                  '" style="max-width:' + this._itemLabelW + 'px">' +
                  label + '</div>' +
                  '</div>';
            items += item;
          }
          this.selectedListContent.innerHTML = items;
        },

        _addSelectedContainerEvent: function(){
          this.own(on(this.selectedListContent, 'click', lang.hitch(this, function(evt){
            var evtTarget = evt.target;
            var cbxTarget, labelTarget;
            if(html.hasClass(evtTarget,'item')){
              cbxTarget = evtTarget.firstElementChild;
              labelTarget = evtTarget.firstElementChild.nextSibling;
            }else if(html.hasClass(evtTarget,'checkInput')){
              cbxTarget = evtTarget;
              labelTarget = evtTarget.nextSibling;
            }else if(html.hasClass(evtTarget,'label')){
              cbxTarget = evtTarget.previousSibling;
              labelTarget = evtTarget;
            }else{
              evt.stopPropagation();
              return;
            }
            //show
            var target = cbxTarget, name = labelTarget.innerText;
            var value = name;
            if(this.disPlayLabel === 'alias' || this.disPlayLabel === 'label'){
              value = html.getAttr(target, 'data');
            }
            if(html.hasClass(target, 'checked')){
              if(this.inputType === 'radio'){
                return;
              }
              html.removeClass(target, 'checked');
              //update list
              this._updateCheckedList('remove', value, name);
              this.checkCBXItems();
              this.emit("listMultipleSelect_itemUnChecked", name);
            }else{
              if(this.inputType === 'radio' && this.currentItem){
                if(this.currentItem === true){
                  this.currentItem = this.getCurrentItem();
                }
                html.removeClass(this.currentItem, 'checked');
              }
              html.addClass(target, 'checked');
              this._updateCheckedList('add', value, name);
              this.checkCBXItems();
              this.emit("listMultipleSelect_itemChecked", name);
            }

            evt.stopPropagation();
          })));
        },

        _updateCheckedList: function(type,name,label){
          if(name !== this.emptyStr){
            name = this.isNumberField ? parseFloat(name): name;
          }
          if(type === 'remove'){
            for(var key in this.checkedList){
              if(this.checkedList[key] === name){
                this.checkedList.splice(key,1);//remove this unChecked name
                this.checkedLabelList.splice(key,1);
              }
            }
          }else{
            if(this.inputType === 'radio'){
              this.checkedList = [name];
              this.checkedLabelList = [label];
            }else{
              if(this.checkedList.indexOf(name) < 0){
                this.checkedList.push(name);
                this.checkedLabelList.push(label);
              }
            }
          }
        },

        _updateCheckedLabelList: function(valueLabels){
          this.checkedLabelList = [];
          for(var key = 0; key < this.checkedList.length; key ++){
            for(var index = 0; index < valueLabels.length; index ++){
              if(this.checkedList[key] === valueLabels[index].value){
                this.checkedLabelList.push(valueLabels[index].label);
              }
            }
          }
        },

        _createTarget: function(evt){
          var text = evt.target.innerText;
          var name = text.split(': ')[1];
          this.emit("listMultipleSelect_itemChecked", name);
        },

        //delete item by namename
        _deleteCBXItem: function(){//name
        },

        _getCheckInputItems: function(){
          return query('.item .checkInput', this.listContent);
        },

        //get all checked values
        getListCheckedValuesOrigin: function(){
          var checkedVals = [];
          var items = this._getCheckInputItems(); //can't get this.listContent in this function
          for(var key = 0; key < items.length; key ++){
            var item = items[key];
            var value = item.nextSibling.innerText;
            if(html.hasClass(item,'checked')){
              checkedVals.push(value);
            }
          }
          return checkedVals;
        },

        getListCheckedValues: function(){
          var checkedVals = [];
          var strs = lang.clone(this.checkedList);
          for(var key = 0; key < strs.length; key ++){
            var str = strs[key];
            var value = this.isNumberField ? parseFloat(str):str;
            checkedVals.push(value);
          }
          return checkedVals;
        },

        //get all values with checked field
        getListValues: function(){
          var valsObj = [];
          // var checkedVals = [];
          var items = this._getCheckInputItems();
          if(items.length === 0){return this.dataList;}
          for(var key = 0; key < items.length; key ++){
            var item = items[key];
            var value = item.nextSibling.innerText;
            if(this.disPlayLabel === 'alias' || this.disPlayLabel === 'label'){
              value = html.getAttr(item, 'data');
            }
            value = this.isNumberField ? parseFloat(value): value;
            var valObj = {value: value, isChecked: false};
            if(html.hasClass(item,'checked')){
              valObj.isChecked = true;
              // checkedVals.push(value);
            }
            valsObj.push(valObj);
          }
          // return checkedVals;
          return valsObj;
        },

        //get if value exist
        getIfValueExist: function(name){
          var items = this._getCheckInputItems();
          for(var key = 0; key < items.length; key ++){
            var item = items[key];
            var value = item.nextSibling.innerText;
            if(name === value){
              return true;
            }
          }
          return false;
        },

        //get all checked values
        getCurrentItem: function(){
          // var items = query('.item .radio', this.listContent);
          var items = this._getCheckInputItems();
          for(var key = 0; key < items.length; key ++){
            var item = items[key];
            if(html.hasClass(item,'checked')){
              return item;
            }
          }
          return null;
        },

        //set cbx item checked status depending on predefined table
        checkCBXItems: function(ifClearValue){
          var value = ifClearValue ? '' : this.valueInput.get('value');
          this.valueInput.set('value',value);
          var items = query('.item .label', this.listContent);
          for(var key = 0; key < items.length; key ++){
            var item = items[key];
            var valStr = this.disPlayLabel === 'value' ? item.innerText : html.getAttr(item.previousSibling, 'data');
            // var itemVal = this.isNumberField ? parseFloat(item.innerText) : item.innerText;
            var itemVal = this.isNumberField ? parseFloat(valStr) : valStr;
            if(this.checkedList.indexOf(itemVal) >= 0){
              html.addClass(item.previousSibling, 'checked');
            }else{
              html.removeClass(item.previousSibling, 'checked');
            }
          }
        },

        reset: function(){
          this.listContent.innerHTML = '';
        },

        //add data to list when get data every time, don't need to clear previous data.
        //isCheck: if need checked option's status
        //isInit: if need to init select content
        setCBXData: function(valueLabels, isCheck, ifInit, isResetPopup){
          if(!isResetPopup){
            this.queryState = false;
          }
          valueLabels = valueLabels? valueLabels : [];

          html.setStyle(this.noDataTips, 'display', 'none');

          var realCheckedNum = 0;
          var labelBig = this.inputType === 'radio' ? ' labelBig' : '';
          var labelRuntimeClass = this.runtime ? ' labelRuntime' : '';

          var innerHTML = this.listContent.innerHTML;
          if(ifInit){
            this.listContent.innerHTML = '';
            innerHTML = '';
            // if(this.controlType === 'uniqueDynamic' ||
            //   (this.runtime && this.controlType === 'uniquePredefined' && this.selectUI === 'dropdown')){
            if(this.controlType === 'uniqueDynamic' && !this.keyQueryMode){//cacheQueryMode
              var _checkedClass = '';
              if(this.checkedList[0] === this.emptyStr){
                _checkedClass = ' checked';
                realCheckedNum = 1;
              }
              var _dataAttr = "data='" + this.emptyStr + "'";
              innerHTML = '<div class="item emptyItem active">' +
                  '<div class="checkInput ' + this.inputType + _checkedClass + '" ' + _dataAttr + '></div>' +
                  '<div class="label' + labelBig + ' jimu-ellipsis' + labelRuntimeClass +
                  '" style="max-width:' + this._itemLabelW + 'px">' +
                  this.emptyStr + '</div></div>';
            }
            this.listContainer.scrollTop = 0;//reset scroll position
          }

          if(valueLabels.length === 0){
            var _contentHtml = this.listContent.innerHTML.replace(/(^\s*)|(\s*$)/g, "");
            if(_contentHtml === '' && (!this.cacheQueryMode || this.isCacheFinish)){
              html.setStyle(this.noDataTips, 'display', 'block');
            }
            if(_contentHtml === ''){
              this.listContent.innerHTML = innerHTML;
            }
            return this.listContent;
          }

          var items = '';
          for(var index = 0; index < valueLabels.length; index ++){
            var valueLabel = valueLabels[index];
            var checkedClass = '';
            if(isCheck && this.checkedList.indexOf(valueLabel.value) >= 0){
              checkedClass = ' checked';
              this.currentItem = true;
              realCheckedNum ++;
            }
            // var selectClass = "radio";
            var dataAttr = this.isNumberField ? "data=" + valueLabel.value : "data='" + valueLabel.value + "'";
            var item = '<div class="item">' +
                  // '<div class="checkInput ' + this.inputType + checkedClass + '" data=' + valueLabel.value + '></div>' +
                  '<div class="checkInput ' + this.inputType + checkedClass + '" ' + dataAttr + '></div>' +
                  '<div class="label' + labelBig + ' jimu-ellipsis' + labelRuntimeClass +
                  '" title="' + valueLabel.value + '" style="max-width:' + this._itemLabelW + 'px">' +
                  // valueLabel.value + '</div>' +
                  valueLabel[this.disPlayLabel] + '</div>' +
                  '</div>';
            items += item;
          }
          var checkedDiff = this.checkedList.length - realCheckedNum;
          if(this.runtime && checkedDiff > 0){
            for(var key = 0;key < checkedDiff; key ++){
              this.emit("listMultipleSelect_itemUnChecked", '');
            }
          }
          this.listContent.innerHTML = innerHTML + items;
          // var containerH = html.getStyle(this.listContainer, 'height') + 15;
          // html.setStyle(this.listContainer, 'height', containerH + 'px');
          return this.listContent;
        },

        //set content with data which query by searchkey(this data doesn't require paging)
        setCBXContentBySearch: function(valueLabels, isResetPopup){//, pageSize
          // var name = this.searchName;
          // pageSize = pageSize ? pageSize : this.pageSize;
          if(valueLabels.length === 0){
            this.setCBXData([], false, true, isResetPopup);//, pageSize
            // if(this.controlType !== 'multipleDynamic'){
            //   this._addCreateDom(name);
            // }
          }else{
            this.setCBXData(valueLabels, true, true, isResetPopup);//, pageSize
            // if(this.controlType !== 'multipleDynamic'){
            //   var ifExist = this.getIfValueExist(name);
            //   if(!ifExist){
            //     this._addCreateDom(name);
            //   }else{
            //     html.setStyle(this.createNewItem, 'display', 'none');
            //   }
            // }
          }
        },

        //query from local cache
        _onSearchKeyChange: function(){
          var name = this.valueInput.get('value');
          this.searchName = name;
          this.listContainer.scrollTop = 0;//reset scroll position
          this.reset();
          this.ifFristPage = true;
          this.keyQueryMode = true;
          this.cacheQueryMode = true;

          this.emit("listMultipleSelect_searchKeyLocal", name);

          if(this.codedValues){
            return;
          }

          if(!this.isCacheFinish){
            html.setStyle(this.loadMoreDataBtn, 'display', 'block');
          }
          //back to query from server mode
          if(name.length === 0){
            this.keyQueryMode = false;
            this.cacheQueryMode = false;
            this.queryState = false;
            html.setStyle(this.loadMoreDataBtn, 'display', 'none');
          }
        },

        _loadMoreDataFromServer: function(){
          this.ifFristPage = true;
          this.keyQueryMode = true;
          this.cacheQueryMode = false;
          this.queryState = true;
          html.setStyle(this.loadMoreDataBtn, 'display', 'none'); //only show once time after local querying
          var name = this.valueInput.get('value');
          this.searchName = name;
          this.listContainer.scrollTop = 0;//reset scroll position
          // if(name.length !== 0){ //search
          // this.keyQueryMode = true;
          // runtime & predefined need 'search' and 'addBtn'
          // setting & multiple need 'search' no 'addBtn'
          if(this.controlType === 'multipleDynamic' || this.controlType === 'uniqueDynamic'){//multiple
            this.emit("listMultipleSelect_searchKey", name);
          }else if(this.runtime){
            // console.log('runtime');
          }else{//setting---two predefineds
            this.emit("listMultipleSelect_searchKey", name);
          }
          // }else{
          //   this.keyQueryMode = false;
          //   // this.createNewItem.style.display = 'none';
          //   this.reset();
          //   // this.setCBXData([], false, true, 1);
          //   this.emit("listMultipleSelect_addNextPage");
          //   // this.listContentStore.placeAt(this.listContent);
          // }
        },

        // _addCreateDom: function(name){
        // this.createNewItem.style.display = 'block';
        // var label = this.Nls.createValue;
        // var str = label.replace('${value}', name);
        // this.createNewItem.innerText = str;
        // },
        currentHoverItem: null,
        _addCBXHoverEvent: function(){
          this.own(on(this.listContent, 'mouseover', lang.hitch(this, function(event){
            var target = event.target || event.srcElement;
            var itemDom;
            if(html.hasClass(target, 'item')){
              itemDom = target;
            }else{
              itemDom = jimuUtils.getAncestorDom(target, function(dom){
                return html.hasClass(dom, 'item');
              }, 3);
            }

            if(this.currentHoverItem){
              html.removeClass(this.currentHoverItem, 'active');
            }
            html.addClass(itemDom, 'active');
            this.currentHoverItem = itemDom;
          })));
          this.own(on(this.listContent, 'mouseout', lang.hitch(this, function(){
            if(this.currentHoverItem){
              html.removeClass(this.currentHoverItem, 'active');
            }
            this.currentHoverItem = null;
          })));
        },

        _addCBXClickEvent: function(){
          // this.own(on(this.valueInput, 'blur', lang.hitch(this, function(){
          //   this._loadMoreDataFromServer();
          // })));

          this.own(on(this.valueInput, 'change', lang.hitch(this, function(){
            this._onSearchKeyChange();
          })));

          this.own(on(this.loadMoreDataBtn, 'click', lang.hitch(this, function(){
            this._loadMoreDataFromServer();
          })));

          // if(this.controlType === 'multipleDynamic' || this.controlType === 'uniqueDynamic'){
          this.own(on(this.listContainer, 'scroll', lang.hitch(this, this.dropDownScroll)));
          // }

          this.own(on(this.searchKeyInput, 'click', lang.hitch(this, function(evt){
            evt.stopPropagation();
          })));

          // var contentDoms = query('.jimu-multiple-items-list', this.cbxPopup.domNode)[0];
          this.own(on(this.listContainer, 'click', lang.hitch(this, function(evt){
            var evtTarget = evt.target;
            var cbxTarget, labelTarget;
            if(html.hasClass(evtTarget,'item')){
              cbxTarget = evtTarget.firstElementChild;
              labelTarget = evtTarget.firstElementChild.nextSibling;
            }else if(html.hasClass(evtTarget,'checkInput')){
              cbxTarget = evtTarget;
              labelTarget = evtTarget.nextSibling;
            }else if(html.hasClass(evtTarget,'label')){
              cbxTarget = evtTarget.previousSibling;
              labelTarget = evtTarget;
            }else{
              evt.stopPropagation();
              return;
            }
            this._setCBXChecked(cbxTarget, labelTarget.innerText);
            evt.stopPropagation();
          })));
        },


        scrollDiff:100,//add more data when the distance is 100px from bottom
        dropDownScroll: function(evt){
          if(this.runtime && (this.controlType === "uniquePredefined" || this.controlType === "multiplePredefined")){
            return;
          }
          if(this.cacheQueryMode || this.codedValues){
            return;
          }
          if(this.queryState){
            this.listContainer.scrollTop = this.containerScrollTop;
            // html.setStyle(this.listContainerOverlay, 'display', 'block');
            return;
          }else{
            // html.setStyle(this.listContainerOverlay, 'display', 'none');
          }
          var target = evt.target;
          var diff = target.scrollHeight - target.clientHeight;
          if(diff - target.scrollTop <= this.scrollDiff){
            if(!this.queryState){
              this.containerScrollTop = this.listContainer.scrollTop;
              this.queryState = true;
              this.ifFristPage = false;
              this.emit("listMultipleSelect_addNextPage");
            }
          }
        },

        _setCBXChecked: function(target, name){
          var value = name;
          if(this.disPlayLabel === 'alias' || this.disPlayLabel === 'label'){
            value = html.getAttr(target, 'data');
          }
          if(html.hasClass(target, 'checked')){
            if(this.inputType === 'radio'){
              //close list when reChecked radio item
              if(!this.runtime && this.controlType === 'predefined'){
                this.emit("listMultipleSelect_itemCheckedForPredefined", name);
              }else{
                this.emit("listMultipleSelect_itemChecked", name);
              }
              return;
            }
            html.removeClass(target, 'checked');
            this._updateCheckedList('remove', value, name);
            this.emit("listMultipleSelect_itemUnChecked", name);
          }else{
            if(this.inputType === 'radio' && this.currentItem){
              if(this.currentItem === true){
                this.currentItem = this.getCurrentItem();
              }
              if(this.currentItem){
                html.removeClass(this.currentItem, 'checked');
              }
            }
            html.addClass(target, 'checked');
            this.currentItem = target;
            // if(!this.runtime){
            this._updateCheckedList('add', value, name);
            if(!this.runtime && this.controlType === 'predefined'){
              this.emit("listMultipleSelect_itemCheckedForPredefined", name);
            }else{
              this.emit("listMultipleSelect_itemChecked", name);
            }
            // }
          }
        },

        initDoms: function(valueLabels,ifCheck){
          this.setCBXData(valueLabels,ifCheck);
        },

        getData: function(){

        },

        refreshData: function(){
          this.checkCBXItems();
        },

        validate: function() {
          var displayVal = this.checkedList.length ? '12345678': null;
          if(this.checkedList.length === 1 && this.checkedList[0] === this.emptyStr){
            displayVal = null;
          }
          this.set("DisplayedValue", displayVal);
          return true;

          // var valid = false;
          // var valList = this.getListValues();
          // if(this.controlType === "uniqueDynamic"){
          //   if(valList || valList === 0){
          //     valid = true;
          //   }
          // }else{
          //   if(valList && valList.length > 0){
          //     valid = true;
          //   }
          // }
          // if(valid){
          //   this.set("DisplayedValue", '100000000');
          // }
          // return true;
        },

        setRequired: function(required){
          this.mutiValuesSelect.set("required", required);
        },

        destroy:function(){
          // if(this.valueInputBlur){
          //   this.valueInputBlur.remove();
          // }
          html.destroy(this.domNode);
          // this = null;
          this.inherited(arguments);
        }
      });
  });