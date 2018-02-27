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
        "dojo/dom-construct",
        "dojo/on",
        "app/preview/PreviewUtil",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/PreviewPane.html",
        "dojo/i18n!app/nls/resources",
        "esri/map"
      ], 
function(declare, lang, domConstruct, on, PreviewUtil, 
         _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n,
         Map
         ) {

  var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    i18n: i18n,
    templateString: template,
    tout: null,
    forcedLoading: false,
    
    postCreate: function() {
      this.inherited(arguments);
      this.tout = null;
      this.mapNode = domConstruct.create("div", { style: "width: 100%; height: 100%;"}, this.mapPlaceholder);
    },
    
    startup: function() {
      this.inherited(arguments);

      if (this.map == null) {
        // create map instance
        var mapProps = this.map || AppContext.appConfig.searchMap || {};
        if (mapProps) mapProps = lang.clone(mapProps);
        this.map = new Map(this.mapNode, mapProps);

        this.own(on(this.map, "update-start", lang.hitch(this, this._showLoading)));

        this.own(on(this.map, "update-start-forced", lang.hitch(this, function(args) {
          this._showLoading(args);
          this.forcedLoading = true;
        })));

        this.own(on(this.map, "update-end", lang.hitch(this, function(args) { 
          if (!this.forcedLoading) {
            this._hideLoading(args); 
          }
        })));
        
        this.own(on(this.map, "update-end-always", lang.hitch(this, function(args) {
          this._hideLoading(args);
          this.forcedLoading = false;
        })));

        // add service
        PreviewUtil.addService(this.map, this.serviceType);
      }
    },
    
    destroy: function() {
      // make sure to destroy map instance
      this.map.destroy();
      this.map = null;
      this.inherited(arguments);
    },
    
    _showLoading: function(args) {
      esri.show(this.loading);
      if (this.tout == null) {
        this.tout = setTimeout(lang.hitch(this, function() { this._hideLoading(args); }), 10000);
      }
    },
    
    _hideLoading: function(args) {
      this._clearTimeout();
      esri.hide(this.loading);
    },
    
    _clearTimeout: function() {
      if (this.tout != null) {
        clearTimeout(this.tout);
        this.tout = null;
      }
    }

  });

  return oThisClass;
});