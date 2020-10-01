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
        "dojo/dom-construct",
        "dojo/text!./templates/HierarchyAggregation.html",
        "dojo/i18n!app/nls/resources",
        "app/search/SearchComponent",
        "app/search/DropPane",
        "app/search/QClause",
      "dojo/store/Memory",
      "dijit/tree/ObjectStoreModel",
      "dijit/Tree",
        "dojo/store/util/SimpleQueryEngine"],
function(declare, lang, array, domConstruct, template, i18n, SearchComponent, 
  DropPane, QClause, Memory, ObjectStoreModel, Tree, SimpleQueryEngine) {
 // DropPane, QClause, TermsAggregationSettings) {
  var oThisClass = declare([SearchComponent], {
    
    i18n: i18n,
    templateString: template,
    
    allowSettings: null,
    field: null,
    label: null,
    open: false,
    showRoot:false,
    props: null,
    treeData: [],
    rootTerm: '',
      defaultRootTerm: "Keywords", // if not root is defined, all terms under this space
      addRootTerm: false,
    selectedTerm:null,
      stopTerms: {
          "water body": "body of water"

      },
      stopTreeMatch: [
          ,"Method > Method (Other)"
          , "Property > Property (Other)"
          , "Process > Process (Other)"
          , "Material > Material (Other)"
          ,"Category > Method (Other)"
          , "Category > Property (Other)"
          , "Category > Process (Other)"
          , "Category > Material (Other)"
          ,"Realm > Realm (Other)"
          , "Category > Realm (Other)"
          ,"Science Domain > Science Domain (Other)"
          ,"Category > Science Domain (Other)"
      ],
      stopFullMatch: [
          "Category > Organization > Tectonics and Structural Geology, Department of Earth and Ocean Sciences, University of South Carolina > Lamont Doherty Earth Observatory"
          , "Category > Property > Measure > Topographic"
      ],
    _initialSettings: null,
    
    postCreate: function() {
      this.inherited(arguments);
      
      this._initialSettings = {
        label: this.label,
        field: this.field
      };
      if (this.props) {
        this._initialSettings.props = lang.clone(this.props);
      }
        if (this.rootTerm.length === 0 ) {
            this.addRootTerm = true;
            this.rootTerm = this.defaultRootTerm;
        }
      //if (this.allowSettings === null) {
      //  if (AppContext.appConfig.search && !!AppContext.appConfig.search.allowSettings) {
      //    this.allowSettings = true;
      //  }
      //}
      //if (this.allowSettings) {
      //  var link = this.dropPane.addSettingsLink();
      //  link.onclick = lang.hitch(this,function(e) {
      //    var d = new TermsAggregationSettings({
      //      targetWidget: this
      //    });
      //    d.showDialog();
      //  });
      //}
    },
    
    postMixInProperties: function() {
      this.inherited(arguments);
      if (typeof this.label === "undefined" || this.label === null || this.label.length === 0) {
        this.label = this.field;
      }
    },
    
    addEntry: function(term,count,missingVal) {
      var v = term+" ("+count+")";
      var tipPattern = i18n.search.appliedFilters.tipPattern;
      var tip = tipPattern.replace("{type}",this.label).replace("{value}",term);
      var query = {"term": {}};
      query.term[this.field] = term;
      if (typeof missingVal === "string" && missingVal.length > 0 && missingVal === term) {
        query = {"missing": {"field": this.field}};
      }
      var qClause = new QClause({
        label: term,
        tip: tip,
        parentQComponent: this,
        removable: true,
        scorable: true,
        query: query
      });
      var nd = domConstruct.create("div",{},this.categoryNode);
      var link = domConstruct.create("a",{
        href: "#",
        onclick: lang.hitch(this,function() {
          this.pushQClause(qClause,true);
        })
      },nd);
      this.setNodeText(link,v);
    },
    
    hasField: function() {
      return (typeof this.field !== "undefined" && this.field !== null && this.field.length > 0);
    },
    
    /* SearchComponent API ============================================= */
    
    appendQueryParams: function(params) {
      if (!this.hasField()) return;
      this.appendQClauses(params);
      
      if (!params.aggregations) params.aggregations = {};
      var key = this.getAggregationKey();
      if (this.addRootTerm && (this.selectedTerm === null || this.defaultRootTerm === this.selectedTerm) ) {
         var  clause = '' ;
      } else {
          clause = this.rootTerm ;
      }
      if (this.selectedTerm != null ) clause = this.selectedTerm;
      var props = {"field":this.field,"include" : clause+".*", };
      if (typeof this.props !== "undefined" && this.props !== null) {
        delete this.props.field; // TODO ??
        lang.mixin(props,this.props);
      }
      params.aggregations[key] = {"terms":props};
    },
    
    processResults: function(searchResponse) {
      domConstruct.empty(this.categoryNode);
      var key = this.getAggregationKey();
      this.treeData = [];

        if (searchResponse.aggregations) {
            var data = searchResponse.aggregations[key];
            if (data && data.buckets) {

                var v, missingVal = null;
                if (this.props && typeof this.props.missing === "string") {
                    v = lang.trim(this.props.missing);
                    if (v.length > 0) missingVal = v;
                }
                if (this.addRootTerm ){
                    var item = {
                        id: this.defaultRootTerm,
                        parent: parent,
                        name: v,
                        term: this.defaultRootTerm,
                        key: this.defaultRootTerm,
                        type: 'cat',
                        count: 0,
                        count_children: 0
                    };
                    this.treeData.push(item);
                }

                array.forEach(data.buckets, function (entry) {
                        // this.addEntry(entry.key,entry.doc_count,missingVal);
                    if (this.addRootTerm){
                        var hid = this.defaultRootTerm + ' > ' + entry.key;
                    } else {
                        hid = entry.key;
                    }
                    // ideally we would use Array.find
                        var stop = array.filter(this.stopTreeMatch, function(item){
                            return entry.key.trim() == item;
                        });
                        if (stop.length>0) {
                            return;
                        }
                        stop = array.filter(this.stopTreeMatch, function(item){
                            return entry.key.trim().startsWith(item);
                        });
                        if (stop.length>0){
                            return;
                        }
                        var split = hid.lastIndexOf(">");
                        var parent = null;
                        var term = entry.key.trim();

                        if (split > 0) {
                            parent = hid.substring(0, hid.lastIndexOf(">")).trim();
                            term = hid.substring(split + 1).trim();
                        }
                        if (!this.stopTerms[term]) {
                            var v = term + " (" + entry.doc_count + ")";
                            var item = {
                                id: hid,
                                parent: parent,
                                name: v,
                                term: term,
                                key: entry.key,
                                type: 'cat',
                                count: entry.doc_count,
                                count_children: entry.doc_count
                            };
                            //catStore.put(item);
                            this.treeData.push(item);
                        }
                    }, this);
                var mySortOptions = { sort: [{attribute:"key",}]};
                this.treeData = SimpleQueryEngine({  },mySortOptions)(this.treeData);
                var catStore = new Memory({
                    data: this.treeData,
                    getChildren: function (object) {
                        return this.query({parent: object.id});
                    },

                });
                array.forEach(
                    catStore.query(
                        // null
                        // ,{
                        //     sort: function (a, b) {
                        //         console.info ( a.id > b.id );
                        //         console.info (a.id);
                        //         console.info (b.id);
                        //         return a.id > b.id ? -1 : 1;
                        //     }
                        // }
                    ),
                    function (entry) {
                        if (entry.parent) {
                            var parent = array.filter(
                                this.treeData,
                                function(item){
                                    return item.id == entry.parent;
                                }
                            );

                            if (parent.length >0) {
                                parent[0].count_children = parent[0].count_children + entry.count;
                                var count =  parent[0].count_children > parent[0].count ? parent[0].count_children : parent[0].count;
                                 var v = parent[0].term + " (" + count + ")";

                                // var v = parent[0].term + " (" + parent[0].count + "/" + parent[0].count_children + ")";
                                parent[0].name = v;
                            }
                        }


                    }, this);
            }
        }

        try {
            //    catStore.fetch(mySortOptions);


                var catModel = new ObjectStoreModel({
                    store: catStore,
                    query: {id: this.rootTerm,}
                });



            if (catStore.data.length > 0) {
                var tree = new Tree({
                    model: catModel,
                    open: this.open,
                    showRoot: this.showRoot,
                    onClick: lang.hitch(this, function (item) {
                        var query = {"term": {}};
                        query.term[this.field] = item.key;
                        var tip = item.key;
                        var qClause = new QClause({
                            label: item.key,
                            tip: tip,
                            parentQComponent: this,
                            removable: true,
                            scorable: true,
                            query: query
                        });
                        this.pushQClause(qClause, true);
                    })
                });
                tree.placeAt(this.categoryNode);
            }
        } catch (e) {

                console.log("tree warining. No items for base term");
                this.setNodeText(this.categoryNode, "(No Items)");

        }

      }

    
  });
  
  return oThisClass;
});