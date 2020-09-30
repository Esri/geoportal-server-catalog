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
        "dojo/on",
        "dojo/dom-class",
        "dojo/dom-attr",
        "dojo/number",
        "dojo/topic",
        "dojo/string",
        "app/context/app-topics",
        "dojo/text!./templates/Paging.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent",
        "app/etc/util"],
function(declare, lang, on, domClass, domAttr, djNumber, topic, string, appTopics, template, i18n, SearchComponent, Util) {

  var oThisClass = declare([SearchComponent], {

    i18n: i18n,
    templateString: template,

    hasLess: false,
    hasMore: false,
    nextStart: -1,
    numHits: 0,
    numPerPage: null,
    previousStart: -1,
    start: 1,

    typePlural: null,
    typeSingular: null,

    postCreate: function() {
      this.inherited(arguments);
      this.typePlural = i18n.search.resultCount.itemPlural;
      this.typeSingular = i18n.search.resultCount.itemSingular;
      if (typeof this.numPerPage === "undefined" || this.numPerPage === null) {
        this.numPerPage = AppContext.appConfig.searchResults.numPerPage;
      }
      if (typeof this.numPerPage === "undefined" || this.numPerPage === null) {
        this.numPerPage = 10;
      }

      var self = this;
      topic.subscribe(appTopics.ItemDeleted,function(params){
        if (params.searchPane && self.searchPane === params.searchPane) {
          self.numHits = self.numHits - 1;
          self._renderCount();
          self._renderPaging();
        }
      });
      topic.subscribe(appTopics.RefreshSearchResultPage,function(params){
        if (params.searchPane && self.searchPane === params.searchPane) {
          self.start = self._start;
          self.search();
        }
      });
    },

    /* events ========================================================== */

    firstButtonClicked: function() {
      if (this.hasLess) {
        history.replaceState(location.pathname, document.title, location.pathname.replace(/\/+$/g, "") + "/#searchPane");
        this.start = 1;
        this.search();
      }
    },

    previousButtonClicked: function() {
      if (this.hasLess) {
        history.replaceState(location.pathname, document.title, location.pathname.replace(/\/+$/g, "") + "/#searchPane");
        this.start = this.previousStart;
        this.search();
      }
    },

    nextButtonClicked: function() {
      if (this.hasMore) {
        history.replaceState(location.pathname, document.title, location.pathname.replace(/\/+$/g, "") + "/#searchPane");
        this.start = this.nextStart;
        this.search();
      }
    },

    lastButtonClicked: function() {
      if (this.numHits < AppContext.appConfig.system.searchLimit && this.hasMore) {
        history.replaceState(location.pathname, document.title, location.pathname.replace(/\/+$/g, "") + "/#searchPane");
        this.start = Math.max(Math.ceil(this.numHits / this.numPerPage)-1, 0)*this.numPerPage + 1
        this.search();
      }
    },

    /* SearchComponent API ============================================= */

    appendQueryParams: function(params) {
      if (Util.getRequestParam("from")) {
        this.start = Number(Util.getRequestParam("from")) + 1;
      }
      if (Util.getRequestParam("size")) {
        this.size = Number(Util.getRequestParam("size"));
      }
      params.urlParams.from = this.start - 1;
      params.urlParams.size = this.numPerPage;
    },

    processResults: function(searchResponse) {
      this.start = 1;
      var nHits = searchResponse.hits.total?
                        searchResponse.hits.total.value && !isNaN(searchResponse.hits.total.value)? searchResponse.hits.total.value: searchResponse.hits.total:
                        0;
      var nStart = searchResponse.urlParams.from + 1;
      if (nStart < 1) nStart = 1;
      this.numHits = nHits;
      this._start = nStart;

      this._renderCount();
      this._renderPaging(searchResponse);
    },

    _renderCount: function() {
      var nHits = this.numHits? this.numHits.value? this.numHits.value: typeof(this.numHits)==="number"? this.numHits: 0: 0;
      var sType = this.typePlural;
      if (nHits === 1) sType = this.typeSingular;
      var s = i18n.search.resultCount.countPattern;
      s = s.replace("{count}",""+djNumber.format(nHits,{}));
      s = s.replace("{type}",sType);
      this.setNodeText(this.countNode,s);
      if (this.searchPane) this.searchPane.lastQueryCount = nHits;
    },

    _renderPaging: function(searchResponse) {
      var nStart = this._start, nHits = this.numHits, nPer = this.numPerPage;

      this.hasMore = false;
      this.nextStart = -1;
      var nNext = nStart + nPer;
      if (nHits >= nNext) {
        this.hasMore = true;
        this.nextStart = nNext;
      }

      if (searchResponse) {
        this.hasLess = false;
        this.previousStart = -1;
        if (nStart > 1) {
          this.hasLess = true;
          this.previousStart = nStart - searchResponse.urlParams.size;
          if (this.previousStart < 1) this.previousStart = 1;
        }
      }

      var sPage = "";
      if (nHits > nPer) {
        var nPage = 1;
        if (nStart > 1) {
          nPage = Math.floor(nStart / nPer) + 1;
        }
        sPage = this.i18n.search.paging.pagePattern;
        sPage = sPage.replace("{page}",""+nPage);
      } else {
        sPage = this.i18n.search.paging.pagePattern;
        sPage = sPage.replace("{page}",""+1);
      }

      this.setNodeText(this.pagePatternNode,sPage);

      if (this.hasLess) {
        domClass.remove(this.firstButton.parentNode, "disabled");
        domClass.remove(this.previousButton.parentNode, "disabled");
      } else {
        domClass.add(this.firstButton.parentNode, "disabled");
        domClass.add(this.previousButton.parentNode, "disabled");
      }
      if (this.hasMore) {
        domClass.remove(this.nextButton.parentNode, "disabled");
      } else {
        domClass.add(this.nextButton.parentNode, "disabled");
      }

      if (this.numHits < AppContext.appConfig.system.searchLimit && this.hasMore) {
        domClass.remove(this.lastButton.parentNode, "disabled");
        domAttr.set(this.lastButton, "title", this.i18n.search.paging.lastTip);
      } else {
        domClass.add(this.lastButton.parentNode, "disabled");
        domAttr.set(this.lastButton, "title", string.substitute(this.i18n.search.paging.lastTipDisabled, {searchLimit: AppContext.appConfig.system.searchLimit}));
      }

      if (nHits > 0) {
        this.pagingNode.style.display = "";
      } else {
        this.pagingNode.style.display = "none";
      }
    }

  });

  return oThisClass;
});
