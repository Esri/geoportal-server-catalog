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
        "dojo/_base/array",
        "dojo/query",
        "dojo/dom-class",
        "dojo/topic",
        "app/context/app-topics",
        "app/preview/PreviewUtil",
        "dijit/registry",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/PreviewPane.html",
        "dojo/i18n!app/nls/resources",
        "esri/map"
      ], 
function(declare, lang, array, query, domClass, topic, appTopics, PreviewUtil, registry,
         _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n,
         Map
         ) {

  var oThisClass = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    i18n: i18n,
    templateString: template,
    
    postCreate: function() {
      this.inherited(arguments);
      var mapProps = this.map || AppContext.appConfig.searchMap || {};
      if (mapProps) mapProps = lang.clone(mapProps);
      this.map = new Map(this.mapNode, mapProps);
      
      PreviewUtil.addService(this.map, this.serviceType);
    }

  });

  return oThisClass;
});