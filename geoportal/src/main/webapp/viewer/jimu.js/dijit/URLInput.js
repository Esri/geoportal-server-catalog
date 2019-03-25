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

define(['dojo/_base/declare',
  'dojo/_base/html',
  'dijit/form/ValidationTextBox',
  'dojox/validate/regexp'],
function(declare, html, ValidationTextBox, regexp) {
  return declare([ValidationTextBox], {
    declaredClass: 'jimu.dijit.URLInput',

    //options:
    required:true,
    invalidMessage:"Invalid url.",
    trim: true,
    rest:true,
    allowNamed: true,
    allowLocal: true,

    postMixInProperties:function(){
      this.inherited(arguments);
      this.nls = window.jimuNls.urlInput;
      this.invalidMessage = this.nls ? this.nls.invalidUrl : 'Invalid Url';
    },

    postCreate: function(){
      this.inherited(arguments);
      html.addClass(this.domNode, 'jimu-url-input');
    },

    validator:function(value){
      if (false === this.required && "" === value) {
        return true;
      }
      //invalid if value is a number or a number string(e.g. 5 or "5")
      if(isFinite(value)){
        return false;
      }

      var strReg = '^' + regexp.url({
        allowNamed: this.allowNamed,
        allowLocal: this.allowLocal
      });

      var reg = new RegExp(strReg, 'g');
      reg.lastIndex = 0;
      var b1 = reg.test(value);

      if(this.rest){
        var p2 = /\/rest\/services/gi;
        var b2 = p2.test(value);
        return b1 && b2;
      }
      else{
        return b1;
      }

    }
  });
});