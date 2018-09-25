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
        "dojo/aspect",
        "dojo/dom-construct",
        "dojo/text!./templates/ResultsPane.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent",
        "app/search/ItemCard",
        "app/search/DropPane",
        "app/search/Paging",
        "dojox/widget/Standby"],
    function (declare, lang, array, aspect, domConstruct, template, i18n, SearchComponent, ItemCard, DropPane, Paging, Standby) {

        var oThisClass = declare([SearchComponent], {

            i18n: i18n,
            templateString: template,

            label: i18n.search.results.label,
            open: true,
            paging: null,
            sortField: null,
            sortDir: null,

            postCreate: function () {
                this.inherited(arguments);
                this.addSort();
                this.paging = new Paging({});
                this.paging.placeAt(this.dropPane.toolsNode);
                /*
                // no longer needed
                this.own(aspect.after(this.paging,"search",lang.hitch(this,function(){
                  this.search();
                })));
                */
                document.body.appendChild(this.statusNode.domNode);
                this.statusNode.target = this.dropPane.domNode;
            },

            addSort: function () {
                var self = this, dd = null;
                var addOption = function (parent, ddbtn, label, field, sortDir) {
                    var ddli = domConstruct.create("li", {}, parent);
                    domConstruct.create("a", {
                        "class": "small",
                        "href": "javascript:void(0)",
                        innerHTML: label,
                        onclick: function (e) {
                            var dir = sortDir;
                            if (field !== null && field === self.sortField) {
                                if (self.sortDir === "asc") dir = "desc";
                                else dir = "asc";
                            }
                            self.sortField = field;
                            self.sortDir = dir;
                            if (dir === null) {
                                ddbtn.innerHTML = label + "<span class='glyphicon glyphicon-triangle-right'></span>";
                            } else if (dir === "asc") {
                                ddbtn.innerHTML = label + "<span class='glyphicon glyphicon-triangle-top'></span>";
                            } else {
                                ddbtn.innerHTML = label + "<span class='glyphicon glyphicon-triangle-bottom'></span>";
                            }
                            //ddbtn.innerHTML = label+"<span class='caret'></span>";
                            $(dd).removeClass('open');
                            self.search();
                        }
                    }, ddli);
                };

                dd = domConstruct.create("div", {
                    "class": "dropdown g-sort-dropdown"
                }, this.dropPane.toolsNode);
                var ddbtn = domConstruct.create("a", {
                    "class": "dropdown-toggle",
                    "href": "#",
                    "data-toggle": "dropdown",
                    "aria-haspopup": true,
                    "aria-expanded": true,
                    innerHTML: i18n.search.sort.byRelevance,
                    onclick: function (e) {
                        if ($(dd).hasClass('open')) {
                            $(dd).removeClass('open');
                        } else {
                            $(dd).addClass('open');
                        }
                        e.stopPropagation();
                    }
                }, dd);
                domConstruct.create("span", {"class": "glyphicon glyphicon-triangle-right"}, ddbtn);
                var ddul = domConstruct.create("ul", {"class": "dropdown-menu"}, dd);

                addOption(ddul, ddbtn, i18n.search.sort.byRelevance, null, null);
                addOption(ddul, ddbtn, i18n.search.sort.byTitle, "title.sort", "asc");
                addOption(ddul, ddbtn, i18n.search.sort.byDate, "sys_modified_dt", "desc");
            },

            destroyItems: function (searchContext, searchResponse) {
                this.noMatchNode.style.display = "none";
                this.noMatchNode.innerHTML = "";
                var rm = [];
                array.forEach(this.dropPane.getChildren(), function (child) {
                    if (child.isItemCard) rm.push(child);
                });
                array.forEach(rm, function (child) {
                    this.dropPane.removeChild(child);
                }, this);
            },

            showNoMatch: function () {
                this.setNodeText(this.noMatchNode, i18n.search.results.noMatch);
                this.noMatchNode.style.display = "block";
            },

            /* SearchComponent API ============================================= */

            appendQueryParams: function (params) {
                this.paging.appendQueryParams(params);
                if (this.sortField !== null && this.sortDir !== null) {
                    params.urlParams.sort = this.sortField + ":" + this.sortDir;
                }
                this.statusNode.show();
            },

            processError: function (searchError) {
                this.statusNode.hide();
                this.destroyItems();
                this.setNodeText(this.noMatchNode, i18n.search.results.error);
                this.noMatchNode.style.display = "block";

            },

            processResults: function (searchResponse) {
                this.statusNode.hide();
                this.paging.searchPane = this.searchPane;
                this.paging.processResults(searchResponse);
                this.destroyItems();
                if (searchResponse.hits) {
                    var searchHits = searchResponse.hits;
                    var hits = searchHits.hits;
                    var total = searchHits.total;
                    var num = hits.length;
                    var itemsNode = this.itemsNode;
                    array.forEach(hits, function (hit) {
                        var itemCard = new ItemCard({
                            itemsNode: this.itemsNode,
                            searchPane: this.searchPane
                        });
                        itemCard.render(hit);
                        itemCard.placeAt(itemsNode);
                    }, this);
                }
            }

        });

        return oThisClass;
    });