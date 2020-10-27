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
        "app/common/Templated",
        "dojo/text!./templates/SearchPanel.html",
        "dojo/i18n!../nls/resources",
        "app/search/SearchPane",
        "app/search/PageUrlFilter",
        "app/search/SearchBox",
        "app/search/SpatialFilter",
        "app/search/DateFilter",
        "app/search/TemporalFilter",
        "app/search/TermsAggregation",
        "app/search/HierarchyTree",
        "app/search/BasicNumericFilter",
        "app/search/NumericFilter",
        "app/search/AppliedFilters",
        "app/search/ResultsPane",
        "app/search/OpenSearchLinksPane"
      ], 
function(declare, lang, Templated, template, i18n) {

  var oThisClass = declare([Templated], {

    i18n: i18n,
    templateString: template,
    
    postCreate: function() {
      this.inherited(arguments);
    }

  });

  return oThisClass;
});