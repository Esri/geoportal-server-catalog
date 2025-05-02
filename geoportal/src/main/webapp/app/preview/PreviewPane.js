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
        "esri4/Map",
        "esri4/views/MapView"
      ], 
function(declare, lang, domConstruct, on, PreviewUtil, 
         _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n,
         Map,MapView
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

      if (this.view == null) {
        // create map instance
        var mapProps = this.map || AppContext.appConfig.searchMap || {};
        if (mapProps) mapProps = lang.clone(mapProps);      
        this.map = new Map(mapProps);
        
        this.view = new MapView({
        	  container:this.mapNode,
        	  map:  this.map, 
        	  center: mapProps.center,
        	  zoom: mapProps.zoom      	  
        	});
        
        this.view.ui.remove("attribution");   
        
        this.view.when(lang.hitch(this,function() {    	
        	PreviewUtil.addService(this.view, this.serviceType);
      	})) 
      }
    },
    
    destroy: function() {
      // make sure to destroy map instance
      this.view = null;
      this.inherited(arguments);
    }

  });

  return oThisClass;
});