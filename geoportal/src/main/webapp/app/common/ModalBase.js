/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/ModalBase.html",
        "dojo/i18n!app/nls/resources"], 
function(declare, lang, domClass, domConstruct, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n) {

  var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    
    i18n: i18n,
    templateString: template,

    content: "",
    destroyOnHide: true,
    footer: "",
    okCancelBar: null,
    status: null,
    targetNode: "app",
    title: "",

    postCreate: function() {
      this.inherited(arguments);
      this.placeAt(this.targetNode);
      this.setTitle(this.title);
      this.setContent(this.content);
      this.setFooter(this.footer);
      this.setStatus(this.status);
      
      $("#"+this.domNode.id).on("hidden.bs.modal",lang.hitch(this,function() {
        this.onHide();
        if (this.destroyOnHide) {
          var self = this;
          setTimeout(function(){self.destroyRecursive();},300);
          var m = this.domNode.parentNode;
          if (m) m.removeChild(this.domNode);
        }
      }));
      $("#"+this.domNode.id).on("shown.bs.modal",lang.hitch(this,function(e) {
        this.onShow();
      }));
    },

    hide: function() {
      $("#"+this.domNode.id).modal("hide");
    }, 

    show: function() {
      $("#"+this.domNode.id).modal("show");
    },
    
    onHide: function() {},
    onShow: function() {},
    
    setContent: function(content) {
      if (!content || content === "") return;
      if (typeof content === "string") {
        this.bodyNode.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        domConstruct.place(content, this.bodyNode);
      } 
    },

    setFooter: function(footer) {
      if (!footer || footer === "") return;
      if (typeof footer === "string") {
        var footerTextNode = document.createTextNode(footer);
        domConstruct.place(footerTextNode, this.contentNode);
      } else if (footer instanceof HTMLElement) {
        domConstruct.place(footer,this.contentNode);
      }
      domClass.add(this.contentNode,"has-footer");
    },

    setStatus: function(status) {
      var panelClass = "", okButtonClass = "btn-primary";
      if (status === "danger") {
        panelClass = "panel-danger";
        okButtonClass = "btn-danger";
      }
      if (this.contentNode) {
        domClass.add(this.contentNode, panelClass);
      }
      if (this.okCancelBar && this.okCancelBar.okButton) {
        this.okCancelBar.okButton.className = "btn btn-sm "+okButtonClass;
      }
      this.status = status;
    },

    setTitle: function(title) {
      if (!title || title === "") return;
      if (typeof title === "string") {
        this.titleNode.innerHTML = title;
      } else if (title instanceof HTMLElement) {
        domConstruct.place(title,this.titleNode);
      }
      this.domNode.removeAttribute("title");
    }

  });

  return oThisClass;
});