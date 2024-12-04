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
  'dojo/_base/html',
  'dojo/_base/declare',
  'dojo/text!./IndexButtonProvider.html',
  'dojo/_base/lang',
  'dojo/on',
  'jimu/dijit/Popup',
  // 'jimu/dijit/PopupSimple',
  './ListMutipleValueProvider',
  // './ListDateValueProvider',
  './ValueProvider'
],
  function(html, declare,
    template, lang, on, Popup, ListMultipleValueProvider, ValueProvider) {

    return declare([ValueProvider], {

      templateString: template,
      nls: null,
      url: '',
      layerDefinition: null,
      partObj: null,
      fieldInfo: null,
      codedValues: null,
      staticValues: null,
      layerInfo: null,
      popupInfo: null,
      operatorInfo: null,
      filterCodedValueIfPossible: false,
      runtime: false,
      providerType: null, //required
      valueProvider:null,

      postCreate: function(){
        this.inherited(arguments);
        this.jimuNls = window.jimuNls;
        html.addClass(this.domNode, 'jimu-filter-indexBtn-value-provider');
        html.addClass(this.valueProviderPopupNode, 'value-type-popup');
        html.setStyle(this.valueProviderPopupNode, 'display', 'none');

        var tips = '';
        if(this.providerType === 'UNIQUE_PREDEFINED_VALUE_PROVIDER'){
          tips = this.nls.predefinedUniqueTips;
        }else if(this.providerType === 'MULTIPLE_PREDEFINED_VALUE_PROVIDER'){
          tips = this.nls.predefinedMultipleTips;
        }
        this.indexBtnTips.title = tips;
        this.indexBtnTips.innerText = tips + ' ...';

        this._initProvider();
        this._bindEvent();
      },

      _initProvider:function(){
        var args = {
          preDefinedTips: this.indexBtnTips,
          nls: this.nls,
          url: this.url,
          layerDefinition: this.layerDefinition,
          partObj: this.partObj,
          fieldInfo: this.fieldInfo,
          codedValues: this.codedValues,
          staticValues: this.staticValues,
          layerInfo: this.layerInfo,
          popupInfo: this.popupInfo,
          operatorInfo: this.operatorInfo,
          filterCodedValueIfPossible: this.filterCodedValueIfPossible,
          runtime: this.runtime,
          selectUI: this.selectUI,
          providerType: this.providerType
        };

        if(this.providerType === 'UNIQUE_PREDEFINED_VALUE_PROVIDER' ||
          this.providerType === 'MULTIPLE_PREDEFINED_VALUE_PROVIDER'){
          this.valueProvider = new ListMultipleValueProvider(args);
        }else{
        }

        //set applyBtn's state of popup.
        this.valueProvider.on("listMultipleValueProvider_setApplyBtnState", lang.hitch(this, function(state){
          if(this.popup){
            if(state){
              this.popup.enableButton(0);
            }else{
              this.popup.disableButton(0);
            }
          }
        }));
      },

      _bindEvent: function(){
        // this.own(on(document, 'click', lang.hitch(this, function(){
        //   html.setStyle(this.valueProviderPopupNode, 'display', 'none');
        // })));

        //hover
        /*
        this.own(on(this.indexBtn, 'mouseenter', lang.hitch(this, function(){
          var vals = lang.clone(this.valueObjEnd.value);
          if(vals.length === 0){
            return;
          }
          var content = '', cList = '', suffix = '';
          if(vals.length > 5){
            suffix = '<div class="checkedItem">......</div>';
            vals = vals.splice(0,5);
          }
          for(var key in vals){
            cList += '<div class="checkedItem">' + vals[key].alias + '---' + vals[key].isChecked + '</div>';
          }
          content = cList + suffix;
          var btnWidth = html.getStyle(this.indexBtn, 'width');
          var height = 25 * vals.length;
          this.listPopup = new PopupSimple({
            width: btnWidth,
            height: height,
            content:  content,
            positionDom: this.indexBtn //for setting position
          });
        })));
        this.own(on(this.indexBtn, 'mouseleave', lang.hitch(this, function(){
          if(this.listPopup){
            this.listPopup.close();
          }
        })));
        */

        this.own(on(this.indexBtn, 'click', lang.hitch(this, function(){
          if(this.valueProvider){
            this.destroyProvider();
          }
          this._initProvider();
          this.setValueObject(this.valueObjEnd, this.valueObjEnd.type);

          this.popup = new Popup({
            width: 800,
            height: 600,
            content:  this.valueProvider,
            titleLabel: this.indexBtnTips.title,
            onClose: lang.hitch(this, function () {
              //save popup content to a hidden dom, so we don't need init provider every time.
              //this.popup.content = null;
              //html.place(this.valueProvider.domNode, this.valueproviderStore);
              this.getValueObject(false);
              this._closeCBXPopup(); //need close it when listSelectPopup in header
              this.destroyProvider();
              // this.valueProvider.destroy();
            }),
            buttons: [{
              label: this.nls.apply, //this.nls.common.save,
              disable: true,
              onClick: lang.hitch(this, function () {
                // console.log('need to save configuration data');
                // this._saveData();
                var ifHasItems = this.getValueObject(true); //need to get valueObj
                if(ifHasItems){
                  this.popup.close();
                }else{
                  alert('please configurate some items');
                }
              })
            }, {
              label: this.jimuNls.common.cancel,
              classNames: ['jimu-btn-vacation'],
              onClick: lang.hitch(this, function () {
                this.popup.close();
              })
            }]
          });
          html.addClass(this.popup.domNode, 'widget-at-filter-popup');
          //trigger it at the first time
          setTimeout(lang.hitch(this, function() {
            this.valueProvider._setApplyState(this.getValueObject(true));
            this.valueProvider._setDisplayTypeStyle();
          }), 100);
        })));
      },

      _closeCBXPopup: function(){
        if( this.valueProvider.cbxPopup && this.valueProvider.cbxPopup.domNode){
          //overwrite popup.onClose() for destroying it
          this.valueProvider.cbxPopup.onClose = lang.hitch(this, function () {
            return true;
          });
          this.valueProvider.cbxPopup.close();
        }
      },

      _saveData: function(){
        this.valueProvider.saveData();
      },

      reset: function(){
      },

      getDijits: function(){
        return [];
      },

      getStatus: function(){
        return 1;
      },

      // _setIndexBtnState: function(valueObj){
      //   if(valueObj.value && valueObj.value.length > 0){
      //     html.addClass(this.indexBtn, 'active');
      //   }else{
      //     html.removeClass(this.indexBtn, 'active');
      //   }
      // },

      setValueObject: function(valueObj){
        if(valueObj){
          this.valueObjEnd = valueObj;
          // this._setIndexBtnState(valueObj);
        }
        this.valueProvider.setValueObject(valueObj,true);
      },

      valueObj: null,
      getValueObject: function(ifGet){
        if(ifGet){
          var valueObj = this.valueProvider.getValueObject();
          this.valueObjEnd = valueObj;
          // this._setIndexBtnState(valueObj);

          return valueObj.value.length;
        }else{
          delete this.valueObjEnd.valueList;
          if(this.valueObjEnd.value.length === 0){//no items in editTable
            return 0;
          }
          return this.valueObjEnd;
        }
      },

      destroyProvider: function(){
        if(this.valueProvider){
          // html.destroy(this.valueProvider.domNode);
          this.valueProvider.destroyProvider();
        }
        this.valueProvider = null;
      }
    });
  });