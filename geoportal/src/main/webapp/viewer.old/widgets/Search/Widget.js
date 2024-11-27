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
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/html',
    'dojo/when',
    'dojo/on',
    'dojo/aspect',
    'dojo/query',
    'dojo/keys',
    'dojo/Deferred',
    'dojo/promise/all',
    'jimu/BaseWidget',
    'jimu/LayerInfos/LayerInfos',
    'jimu/utils',
    'esri/dijit/Search',
    'esri/tasks/locator',
    'esri/layers/FeatureLayer',
    'esri/dijit/PopupTemplate',
    'esri/lang',
    'esri/tasks/query',
    './utils',
    'dojo/NodeList-dom'
  ],
  function(declare, lang, array, html, when, on, aspect, query, keys, Deferred, all,
    BaseWidget, LayerInfos, jimuUtils, Search, Locator,
    FeatureLayer, PopupTemplate, esriLang, FeatureQuery, utils) {
    //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {
      name: 'Search',
      baseClass: 'jimu-widget-search',
      searchDijit: null,
      searchResults: null,

      _startWidth: null,

      postCreate: function() {
        if (this.closeable || !this.isOnScreen) {
          html.addClass(this.searchNode, 'default-width-for-openAtStart');
        }

        this.listenWidgetIds.push('framework');
      },

      startup: function() {
        this.inherited(arguments);

        if (!(this.config && this.config.sources)) {
          this.config.sources = [];
        }

        LayerInfos.getInstance(this.map, this.map.itemInfo)
          .then(lang.hitch(this, function(layerInfosObj) {
            this.layerInfosObj = layerInfosObj;
            this.own(this.layerInfosObj.on(
            'layerInfosFilterChanged',
            lang.hitch(this, this.onLayerInfosFilterChanged)));

            utils.setMap(this.map);
            utils.setLayerInfosObj(this.layerInfosObj);
            utils.setAppConfig(this.appConfig);
            when(utils.getConfigInfo(this.config)).then(lang.hitch(this, function(config) {
              return all(this._convertConfig(config)).then(function(searchSouces) {
                return array.filter(searchSouces, function(source) {
                  return source;
                });
              });
            })).then(lang.hitch(this, function(searchSouces) {
              if (!this.domNode) {
                return;
              }

              this.searchDijit = new Search({
                activeSourceIndex: searchSouces.length === 1 ? 0 : 'all',
                allPlaceholder: jimuUtils.stripHTML(esriLang.isDefined(this.config.allPlaceholder) ?
                  this.config.allPlaceholder : ""),
                autoSelect: true,
                enableButtonMode: false,
                enableLabel: false,
                enableInfoWindow: true,
                enableHighlight: true,/*esriLang.isDefined(this.config.showInfoWindowOnSelect) ?
                  !!this.config.showInfoWindowOnSelect : true,*/
                showInfoWindowOnSelect: esriLang.isDefined(this.config.showInfoWindowOnSelect) ?
                  !!this.config.showInfoWindowOnSelect : true,
                map: this.map,
                sources: searchSouces,
                theme: 'arcgisSearch'
              });
              html.place(this.searchDijit.domNode, this.searchNode);
              this.searchDijit.startup();

              this._resetSearchDijitStyle();

              this.own(
                this.searchDijit.watch(
                  'activeSourceIndex',
                  lang.hitch(this, '_onSourceIndexChange')
                )
              );

              this.own(
                on(this.searchDijit.domNode, 'click', lang.hitch(this, '_onSearchDijitClick'))
              );
              this.own(on(this.searchDijit.inputNode, "keyup", lang.hitch(this, function(e) {
                if (e.keyCode !== keys.ENTER) {
                  this._onClearSearch();
                }
              })));

              /*
              this.own(
                aspect.before(this.searchDijit, 'select', lang.hitch(this, '_captureSelect'))
                );
              */

              this.own(
                on(this.searchDijit, 'search-results', lang.hitch(this, '_onSearchResults'))
              );
              this.own(
                on(this.searchDijit, 'suggest-results', lang.hitch(this, '_onSuggestResults'))
              );
              this.own(
                on(this.searchDijit, 'select-result', lang.hitch(this, '_onSelectResult'))
              );
              this.own(
                on(this.searchResultsNode, 'li:click', lang.hitch(this, '_onSelectSearchResult'))
              );
              this.own(on(
                this.searchResultsNode,
                '.show-all-results:click',
                lang.hitch(this, '_showResultMenu')
              ));
              this.own(
                on(window.document, 'click', lang.hitch(this, function(e) {
                  if (!html.isDescendant(e.target, this.searchResultsNode)) {
                    this._hideResultMenu();
                    this._resetSelectorPosition('.show-all-results');
                  }
                }))
              );
              this.own(
                on(this.searchDijit, 'clear-search', lang.hitch(this, '_onClearSearch'))
              );
              /*
              this.own(
                aspect.after(this.map.infoWindow, 'show', lang.hitch(this, function() {
                  if (this.searchDijit &&
                    this.map.infoWindow.getSelectedFeature() !==
                    this.searchDijit.highlightGraphic) {
                    this.searchDijit.clearGraphics();
                    query('li', this.searchResultsNode).removeClass('result-item-selected');
                  }
                }))
              );
              this.own(
                on(this.map.infoWindow, 'show,hide', lang.hitch(this, function() {
                  if (this.searchDijit &&
                    this.map.infoWindow.getSelectedFeature() ===
                    this.searchDijit.highlightGraphic) {
                    this.searchDijit.clearGraphics();
                    query('li', this.searchResultsNode).removeClass('result-item-selected');
                  }
                }))
              );
              */

              this.fetchData('framework');
            }));
          }));
      },

      onReceiveData: function(name, widgetId, data) {
        if (name === 'framework' && widgetId === 'framework' && data && data.searchString) {
          this.searchDijit.set('value', data.searchString);
          this.searchDijit.search();
        }
      },

      setPosition: function(position) {
        this._resetSearchDijitStyle(position);
        this.inherited(arguments);
      },

      resize: function() {
        this._resetSearchDijitStyle();
      },

      onLayerInfosFilterChanged: function(changedLayerInfos) {
        array.some(changedLayerInfos, lang.hitch(this, function(info) {
          if (this.searchDijit && this.searchDijit.sources && this.searchDijit.sources.length > 0) {
            array.forEach(this.searchDijit.sources, function(s) {
              if (s._featureLayerId === info.id) {
                s.featureLayer.setDefinitionExpression(info.getFilter());
              }
            });
          }
        }));
      },

      _resetSearchDijitStyle: function() {
        html.removeClass(this.domNode, 'use-absolute');
        if (this.searchDijit && this.searchDijit.domNode) {
          html.setStyle(this.searchDijit.domNode, 'width', 'auto');
        }

        setTimeout(lang.hitch(this, function() {
          if (this.searchDijit && this.searchDijit.domNode) {
            var box = {
              w: !window.appInfo.isRunInMobile ? 274 : // original width of search dijit
                parseInt(html.getComputedStyle(this.domNode).width, 10)
            };
            var sourcesBox = html.getMarginBox(this.searchDijit.sourcesBtnNode);
            var submitBox = html.getMarginBox(this.searchDijit.submitNode);
            var style = null;
            if (box.w) {
              html.setStyle(this.searchDijit.domNode, 'width', box.w + 'px');
              html.addClass(this.domNode, 'use-absolute');

              if (isFinite(sourcesBox.w) && isFinite(submitBox.w)) {
                if (window.isRTL) {
                  style = {
                    left: submitBox.w + 'px',
                    right: sourcesBox.w + 'px'
                  };
                } else {
                  style = {
                    left: sourcesBox.w + 'px',
                    right: submitBox.w + 'px'
                  };
                }
                var inputGroup = query('.searchInputGroup', this.searchDijit.domNode)[0];

                if (inputGroup) {
                  html.setStyle(inputGroup, style);
                  var groupBox = html.getMarginBox(inputGroup);
                  var extents = html.getPadBorderExtents(this.searchDijit.inputNode);
                  html.setStyle(this.searchDijit.inputNode, 'width', groupBox.w - extents.w + 'px');
                }
              }
            }
          }
        }), 50);
      },

      _convertConfig: function(config) {
        var sourceDefs = array.map(config.sources, lang.hitch(this, function(source) {
          var def = new Deferred();
          if (source && source.url && source.type === 'locator') {
            var _source = {
              locator: new Locator(source.url || ""),
              outFields: ["*"],
              singleLineFieldName: source.singleLineFieldName || "",
              name: jimuUtils.stripHTML(source.name || ""),
              placeholder: jimuUtils.stripHTML(source.placeholder || ""),
              countryCode: source.countryCode || "",
              maxSuggestions: source.maxSuggestions,
              maxResults: source.maxResults || 6,
              zoomScale: source.zoomScale || 50000,
              useMapExtent: !!source.searchInCurrentMapExtent,
              _zoomScaleOfConfigSource: source.zoomScale
            };

            if (source.enableLocalSearch) {
              _source.localSearchOptions = {
                minScale: source.localSearchMinScale,
                distance: source.localSearchDistance
              };
            }

            if (source.zoomScale) {
              _source.autoNavigate = false;
            }

            def.resolve(_source);
          } else if (source && source.url && source.type === 'query') {
            var searchLayer = new FeatureLayer(source.url || null, {
              outFields: ["*"]
            });

            this.own(on(searchLayer, 'load', lang.hitch(this, function(result) {
              var flayer = result.layer;

              // identify the data source
              var sourceLayer = this.map.getLayer(source.layerId);
              var sourceLayerInfo = this.layerInfosObj.getLayerInfoById(source.layerId);
              var showInfoWindowOnSelect;
              var enableInfoWindow;
              if(sourceLayer) {
                // pure feature service layer defined in the map
                showInfoWindowOnSelect = false;
                enableInfoWindow = false;
              } else if (sourceLayerInfo){
                // feature service layer defined in the map
                showInfoWindowOnSelect = false;
                enableInfoWindow = false;
              } else {
                // data source from the outside
                showInfoWindowOnSelect = esriLang.isDefined(this.config.showInfoWindowOnSelect) ?
                  !!this.config.showInfoWindowOnSelect : true;
                enableInfoWindow = true;
              }

              var fNames = null;
              if (source.searchFields && source.searchFields.length > 0) {
                fNames = source.searchFields;
              } else {
                fNames = [];
                array.forEach(flayer.fields, function(field) {
                  if (field.type !== "esriFieldTypeOID" && field.name !== flayer.objectIdField &&
                    field.type !== "esriFieldTypeGeometry") {
                    fNames.push(field.name);
                  }
                });
              }

              var convertedSource = {
                featureLayer: flayer,
                outFields: ["*"],
                searchFields: fNames,
                autoNavigate: false,
                displayField: source.displayField || "",
                exactMatch: !!source.exactMatch,
                name: jimuUtils.stripHTML(source.name || ""),
                placeholder: jimuUtils.stripHTML(source.placeholder || ""),
                maxSuggestions: source.maxSuggestions || 6,
                maxResults: source.maxResults || 6,
                zoomScale: source.zoomScale || 50000,
                //infoTemplate: lang.clone(template),
                useMapExtent: !!source.searchInCurrentMapExtent,
                showInfoWindowOnSelect: showInfoWindowOnSelect,
                enableInfoWindow: enableInfoWindow,
                _featureLayerId: source.layerId,
                _zoomScaleOfConfigSource: source.zoomScale
              };
              /*
              if (!template) {
                delete convertedSource.infoTemplate;
              }
              */
              if (convertedSource._featureLayerId) {
                var layerInfo = this.layerInfosObj
                  .getLayerInfoById(convertedSource._featureLayerId);
                if(layerInfo) {
                  flayer.setDefinitionExpression(layerInfo.getFilter());
                }
              }

              //var template = this._getInfoTemplate(flayer, source, source.displayField);
              this._getInfoTemplate(flayer, source).then(lang.hitch(this, function(infoTemplate){
                convertedSource.infoTemplate = lang.clone(infoTemplate);
                def.resolve(convertedSource);
              }), lang.hitch(this, function() {
                def.resolve(convertedSource);
              }));
            })));

            this.own(on(searchLayer, 'error', function() {
              def.resolve(null);
            }));
          } else {
            def.resolve(null);
          }
          return def;
        }));

        return sourceDefs;
      },

      _getInfoTemplate: function(fLayer, source) {
        var def = new Deferred();
        var layerInfo = this.layerInfosObj.getLayerInfoById(source.layerId);
        var template;
        //var template = layerInfo && layerInfo.getInfoTemplate();
        //var validTemplate = layerInfo && template;

        if (layerInfo) {
          def = layerInfo.loadInfoTemplate();
        } else { // (added by user in setting) or (only configured fieldInfo)
          /*
          template = new InfoTemplate();
          template.setTitle('&nbsp;');
          template.setContent(
            lang.hitch(this, '_formatContent', source.name, fLayer, source.displayField)
          );
          def.resolve(template);
          */

          var fieldNames = [];
          array.filter(fLayer.fields, function(field) {
            if(field.name.toLowerCase() !== "shape") {
              fieldNames.push(field.name);
            }
          });

          //var displayValue = graphic.attributes[source.displayField];
          var title =  source.name + ": {" + source.displayField + "}";
          var popupInfo = jimuUtils.getDefaultPopupInfo(fLayer, title, fieldNames);
          if(popupInfo) {
            template = new PopupTemplate(popupInfo);
          }
          def.resolve(template);
        }
        return def;
      },

      /*
      _getInfoTemplate: function(fLayer, source, displayField) {
        var layerInfo = this.layerInfosObj.getLayerInfoById(source.layerId);
        var template = layerInfo && layerInfo.getInfoTemplate();
        var validTemplate = layerInfo && template;

        if (layerInfo && !validTemplate) { // doesn't enabled pop-up
          return null;
        } else if (validTemplate) {
          // configured media or attachments
          return template;
        } else { // (added by user in setting) or (only configured fieldInfo)
          template = new InfoTemplate();
          template.setTitle('&nbsp;');
          template.setContent(
            lang.hitch(this, '_formatContent', source.name, fLayer, displayField)
          );

          return template;
        }
      },
      */

      _getSourcePopupInfo: function(source) {
        if (source._featureLayerId) {
          var layerInfo = this.layerInfosObj.getLayerInfoById(source._featureLayerId);
          if (layerInfo) {
            return layerInfo.getPopupInfo();
          }
        }
        return null;
      },

      // this funciton is deprecated.
      _captureSelect: function(e) {
        var sourceIndex = this.searchDijit.activeSourceIndex;
        if (sourceIndex === 'all') {
          sourceIndex = this._getSourceIndexOfResult(e);
        }
        if (isFinite(sourceIndex) && esriLang.isDefined(sourceIndex)) {
          var source = this.searchDijit.sources[sourceIndex];
          if (source && 'featureLayer' in source) {

            var popupInfo = this._getSourcePopupInfo(source);
            var notFormatted = (popupInfo && popupInfo.showAttachments) ||
              (popupInfo && popupInfo.description &&
              popupInfo.description.match(/http(s)?:\/\//)) ||
              (popupInfo && popupInfo.mediaInfos && popupInfo.mediaInfos.length > 0);

            // set a private property for select-result to get original feature from layer.
            if (!e.feature.__attributes) {
              e.feature.__attributes = e.feature.attributes;
            }

            if (!notFormatted) {
              var formatedAttrs = this._getFormatedAttrs(
                lang.clone(e.feature.attributes),
                source.featureLayer.fields,
                source.featureLayer.typeIdField,
                source.featureLayer.types,
                popupInfo
              );

              e.feature.attributes = formatedAttrs;
            }
          }
        }

        return [e];
      },

      _getSourceIndexOfResult: function(e) {
        if (this.searchResults){
          for (var i in this.searchResults) {
            var sourceResults = this.searchResults[i];
            var pos = array.indexOf(sourceResults, e);
            if (pos > -1) {
              return parseInt(i, 10);
            }
          }
        }

        return null;
      },

      _formatContent: function(title, fLayer, displayField, graphic) {
        var content = "";
        if (graphic && graphic.attributes && fLayer && fLayer.url) {
          var aliasAttrs = {};
          array.forEach(fLayer.fields, lang.hitch(this, function(field) {
            if (field.name in graphic.attributes){
              aliasAttrs[field.alias || field.name] = graphic.attributes[field.name];
            }
          }));
          var displayValue = graphic.attributes[displayField];
          content += '<div class="esriViewPopup">' +
            '<div class="mainSection">' +
            (esriLang.isDefined(displayValue) ?
              ('<div class="header">' + title + ': ' + displayValue + '</div>') : "") +
            '<div class="hzLine"></div>' +
            '<div>' +
            '<table class="attrTable" cellpading="0" cellspacing="0">' +
            '<tbody>';
          for (var p in aliasAttrs) {
            if (aliasAttrs.hasOwnProperty(p)) {
              content += '<tr valign="top">' +
                '<td class="attrName">' + p + '</td>' +
                '<td class="attrValue">' + aliasAttrs[p] + '</td>' +
                '</tr>';
            }
          }
          content += '</tbody>' +
            '</table>' +
            '</div>' +
            '<div class="break"></div>' +
            '</div>';
        }

        return content;
      },

      // this funciton is deprecated.
      _getFormatedAttrs: function(attrs, fields, typeIdField, types, popupInfo) {
        function getFormatInfo(fieldName) {
          if (popupInfo && esriLang.isDefined(popupInfo.fieldInfos)) {
            for (var i = 0, len = popupInfo.fieldInfos.length; i < len; i++) {
              var f = popupInfo.fieldInfos[i];
              if (f.fieldName === fieldName) {
                return f.format;
              }
            }
          }

          return null;
        }

        var aliasAttrs = {};
        array.forEach(fields, lang.hitch(this, function(_field, i) {
          if (!attrs[_field.name]) {
            return;
          }
          var isCodeValue = !!(_field.domain && _field.domain.type === 'codedValue');
          var isDate = _field.type === "esriFieldTypeDate";
          var isTypeIdField = typeIdField && (_field.name === typeIdField);
          var fieldAlias = _field.name;

          if (fields[i].type === "esriFieldTypeDate") {
            aliasAttrs[fieldAlias] = jimuUtils.fieldFormatter.getFormattedDate(
              attrs[_field.name], getFormatInfo(_field.name)
              );
          } else if (fields[i].type === "esriFieldTypeDouble" ||
            fields[i].type === "esriFieldTypeSingle" ||
            fields[i].type === "esriFieldTypeInteger" ||
            fields[i].type === "esriFieldTypeSmallInteger") {
            aliasAttrs[fieldAlias] = jimuUtils.fieldFormatter.getFormattedNumber(
              attrs[_field.name], getFormatInfo(_field.name)
              );
          }

          if (isCodeValue) {
            aliasAttrs[fieldAlias] = jimuUtils.fieldFormatter.getCodedValue(
              _field.domain, attrs[_field.name]
              );
          } else if (isTypeIdField) {
            aliasAttrs[fieldAlias] = jimuUtils.fieldFormatter.getTypeName(
              attrs[_field.name], types
              );
          } else if (!isCodeValue && !isDate && !isTypeIdField) {
            // Not A Date, Domain or Type Field
            // Still need to check for codedType value
            aliasAttrs[fieldAlias] = fieldAlias in aliasAttrs ?
              aliasAttrs[fieldAlias] : attrs[_field.name];
            aliasAttrs[fieldAlias] = this.getCodeValueFromTypes(
              _field,
              typeIdField,
              types,
              attrs,
              aliasAttrs
            );
          }
        }));
        return aliasAttrs;
      },

      getCodeValueFromTypes: function(field, typeIdField, types, obj, aliasAttrs) {
        var codeValue = null;
        if (typeIdField && types && types.length > 0) {
          var typeChecks = array.filter(types, lang.hitch(this, function(item) {
            // value of typeIdFild has been changed above
            return item.name === obj[typeIdField];
          }));
          var typeCheck = (typeChecks && typeChecks[0]) || null;

          if (typeCheck && typeCheck.domains &&
            typeCheck.domains[field.name] && typeCheck.domains[field.name].codedValues) {
            codeValue = jimuUtils.fieldFormatter.getCodedValue(
              typeCheck.domains[field.name],
              obj[field.name]
            );
          }
        }
        var fieldAlias = field.name;
        var _value = codeValue !== null ? codeValue : aliasAttrs[fieldAlias];
        return _value || isFinite(_value) ? _value : "";
      },

      _resetSelectorPosition: function(cls) {
        var layoutBox = html.getMarginBox(window.jimuConfig.layoutId);
        query(cls, this.domNode).forEach(lang.hitch(this, function(menu) {
          var menuPosition = html.position(menu);
          if (html.getStyle(menu, 'display') === 'none') {
            return;
          }
          var dijitPosition = html.position(this.searchDijit.domNode);
          var up = dijitPosition.y - 2;
          var down = layoutBox.h - dijitPosition.y - dijitPosition.h;
          if ((down > menuPosition.y + menuPosition.h) || (up > menuPosition.h)) {
            html.setStyle(
              menu,
              'top',
              (
                (down > menuPosition.y + menuPosition.h) ?
                dijitPosition.h : -menuPosition.h - 2
              ) + 'px'
            );
          } else {
            html.setStyle(menu, 'height', Math.max(down, up) + 'px');
            html.setStyle(menu, 'top', (down > up ? dijitPosition.h : -up - 2) + 'px');
          }
        }));
      },

      _onSourceIndexChange: function() {
        if (this.searchDijit.value) {
          this.searchDijit.search(this.searchDijit.value);
        }
      },

      _onSearchDijitClick: function() {
        this._resetSelectorPosition('.searchMenu');
      },

      _onSearchResults: function(evt) {
        var sources = this.searchDijit.get('sources');
        var activeSourceIndex = this.searchDijit.get('activeSourceIndex');
        var value = this.searchDijit.get('value');
        var htmlContent = "";
        var results = evt.results;
        var _activeSourceNumber = null;
        if (results && evt.numResults > 0) {
          html.removeClass(this.searchDijit.containerNode, 'showSuggestions');

          this.searchResults = results;
          htmlContent += '<div class="show-all-results jimu-ellipsis" title="' +
            this.nls.showAll + '">' +
            this.nls.showAllResults + '<strong >' + value + '</strong></div>';
          htmlContent += '<div class="searchMenu" role="menu">';
          for (var i in results) {
            if (results[i] && results[i].length) {
              var name = sources[parseInt(i, 10)].name;
              if (sources.length > 1 && activeSourceIndex === 'all') {
                htmlContent += '<div title="' + name + '" class="menuHeader">' + name + '</div>';
              }
              htmlContent += "<ul>";
              var partialMatch = value;
              var r = new RegExp("(" + partialMatch + ")", "gi");
              var maxResults = sources[i].maxResults;

              for (var j = 0, len = results[i].length; j < len && j < maxResults; j++) {
                var text = esriLang.isDefined(results[i][j].name) ?
                  results[i][j].name : this.nls.untitled;

                htmlContent += '<li title="' + text + '" data-index="' + j +
                  '" data-source-index="' + i + '" role="menuitem" tabindex="0">' +
                  text.toString().replace(r, "<strong >$1</strong>") + '</li>';
              }
              htmlContent += '</url>';

              if (evt.numResults === 1) {
                _activeSourceNumber = i;
              }
            }
          }
          htmlContent += "</div>";
          this.searchResultsNode.innerHTML = htmlContent;

          this._showResultMenu();

          this._resetSelectorPosition('.searchMenu');
        } else {
          this._onClearSearch();
        }
        // publish search results to other widgets
        this.publishData({
          'searchResults': evt
        });
      },

      _onSuggestResults: function(evt) {
        this._resetSelectorPosition('.searchMenu');

        this._hideResultMenu();
        // publish suggest results to other widgets
        this.publishData({
          'suggestResults': evt
        });
      },

      _onSelectSearchResult: function(evt) {
        var target = evt.target;
        while(!(html.hasAttr(target, 'data-source-index') && html.getAttr(target, 'data-index'))) {
          target = target.parentNode;
        }
        var result = null;
        var dataSourceIndex = html.getAttr(target, 'data-source-index');
        var dataIndex = parseInt(html.getAttr(target, 'data-index'), 10);
        // var sources = this.searchDijit.get('sources');

        if (dataSourceIndex !== 'all') {
          dataSourceIndex = parseInt(dataSourceIndex, 10);
        }
        if (this.searchResults && this.searchResults[dataSourceIndex] &&
          this.searchResults[dataSourceIndex][dataIndex]) {
          result = this.searchResults[dataSourceIndex][dataIndex];
          this.searchDijit.select(result);
        }
      },


      _zoomToScale: function(zoomScale, features) {
        this.map.setScale(zoomScale);
        jimuUtils.featureAction.panTo(this.map, features);
      },

      _showPopupByFeatures: function(layerInfo, features, selectEvent) {
        /*jshint unused: false*/
        var location = null;
        var isPoint = false;

        if(this.config.showInfoWindowOnSelect) {
          //this.map.infoWindow.clearFeatures();
          //this.map.infoWindow.hide();
          this.map.infoWindow.setFeatures(features);
          if (features[0].geometry.type === "point") {
            location = features[0].geometry;
            isPoint = true;
          } else {
            var extent = features[0].geometry && features[0].geometry.getExtent();
            location = extent && extent.getCenter();
          }
          if(location) {
            this.map.infoWindow.show(location, {
              closetFirst: true
            });
          }
        } else {
          // hightlight result
          this.map.infoWindow.setFeatures(features);
          this.map.infoWindow.updateHighlight(this.map, features[0]);
          this.map.infoWindow.showHighlight();
        }

        // zoomto result
        if(selectEvent.source._zoomScaleOfConfigSource) {
          this._zoomToScale(selectEvent.source.zoomScale, features);
        } else {
          var featureSet = jimuUtils.toFeatureSet(features);
          jimuUtils.zoomToFeatureSet(this.map, featureSet);
        }
      },

      _loadInfoTemplateAndShowPopup: function(layerInfo, selectedFeature, selectEvent) {
        if(layerInfo) {
          this.searchDijit.clearGraphics();
          var layerObjectInMap = this.map.getLayer(layerInfo.id);
          if(layerInfo.isPopupEnabled() && layerObjectInMap) {
            this._showPopupByFeatures(layerInfo, [selectedFeature], selectEvent);
          } else {
            layerInfo.loadInfoTemplate().then(lang.hitch(this, function(infoTemplate) {
              //temporary set infoTemplate to selectedFeature.
              selectedFeature.setInfoTemplate(lang.clone(infoTemplate));
              this._showPopupByFeatures(layerInfo, [selectedFeature], selectEvent);
              // clear infoTemplate for selectedFeature;
              var handle = aspect.before(this.map, 'onClick', lang.hitch(this, function() {
                selectedFeature.setInfoTemplate(null);
                handle.remove();
              }));
            }));
          }
        }
      },

      _onSelectResult: function(e) {
        var result = e.result;
        var dataSourceIndex = e.sourceIndex;
        var sourceResults = this.searchResults[dataSourceIndex];
        var dataIndex = 0;
        var resultFeature = e.result.feature;
        var sourceLayerId = e.source._featureLayerId;

        var getGraphics = function(layer, fid) {
          var graphics = layer.graphics;
          var gs = array.filter(graphics, function(g) {
            return g.attributes[layer.objectIdField] === fid;
          });
          return gs;
        };

        for (var i = 0, len = sourceResults.length; i < len; i++) {
          if (jimuUtils.isEqual(sourceResults[i], result)) {
            dataIndex = i;
            break;
          }
        }
        query('li', this.searchResultsNode)
          .forEach(lang.hitch(this, function(li) {
            html.removeClass(li, 'result-item-selected');
            var title = html.getAttr(li, 'title');
            var dIdx = html.getAttr(li, 'data-index');
            var dsIndex = html.getAttr(li, 'data-source-index');

            if (result &&
              result.name &&
              title === result.name.toString() &&
              dIdx === dataIndex.toString() &&
              dsIndex === dataSourceIndex.toString()) {
              html.addClass(li, 'result-item-selected');
            }
          }));

        //var layer = this.map.getLayer(sourceLayerId);
        var layerInfo = this.layerInfosObj.getLayerInfoById(sourceLayerId);

        if (layerInfo) {
          layerInfo.getLayerObject().then(lang.hitch(this, function(layer) {
            var gs = getGraphics(layer, resultFeature.attributes[layer.objectIdField]);
            if (gs && gs.length > 0) {
              //this._showPopupByFeatures(gs);
              this._loadInfoTemplateAndShowPopup(layerInfo, gs[0], e);
            } else {
              /*
              var handle = on(layer, 'update-end', lang.hitch(this, function() {
                if (this.domNode) {
                  var gs = getGraphics(layer, resultFeature.attributes[layer.objectIdField]);
                  if (gs.length > 0) {
                    this._showPopupByFeatures(gs);
                  }
                }

                if (handle && handle.remove) {
                  handle.remove();
                }
              }));
              this.own(handle);
              */

              var featureQuery = new FeatureQuery();
              featureQuery.where = layer.objectIdField + " = " +
                                 resultFeature.attributes[layer.objectIdField];
              featureQuery.outSpatialReference = this.map.spatialReference;

              layer.selectFeatures(featureQuery,
                                   FeatureLayer.SELECTION_NEW,
                                   lang.hitch(this, function(selectedFeatures) {
                var selectedFeature = null;
                if(selectedFeatures && selectedFeatures.length > 0) {
                  selectedFeature = selectedFeatures[0];
                  layer.add(selectedFeature);

                  this._loadInfoTemplateAndShowPopup(layerInfo, selectedFeature, e);
                }
              }), lang.hitch(this, function() {
                // show popupInfo of searchResult.
                var selectedFeature = resultFeature;
                this._loadInfoTemplateAndShowPopup(layerInfo, selectedFeature, e);
              }));
            }
          }));

        } else if (e.source.featureLayer && !e.source.locator){
          // outside resource result:
          // zoomTo by zoomToExtent, popup by search dijit
          if(e.source._zoomScaleOfConfigSource) {
            this._zoomToScale(e.source._zoomScaleOfConfigSource, [e.result.feature]);
          } else {
            jimuUtils.zoomToExtent(this.map, e.result.extent);
          }
        } else {
          if(e.source._zoomScaleOfConfigSource) {
            this._zoomToScale(e.source._zoomScaleOfConfigSource, [e.result.feature]);
          }
          //result of geocoder service will be popuped and zoomto by search dijit;
        }

        // publish select result to other widgets
        this.publishData({
          'selectResult': e
        });
      },

      _onClearSearch: function() {
        html.setStyle(this.searchResultsNode, 'display', 'none');
        this.searchResultsNode.innerHTML = "";
        this.searchResults = null;
        //this.map.infoWindow.hideHighlight();
      },

      _hideResultMenu: function() {
        query('.show-all-results', this.searchResultsNode).style('display', 'block');
        query('.searchMenu', this.searchResultsNode).style('display', 'none');
      },

      _showResultMenu: function() {
        html.setStyle(this.searchResultsNode, 'display', 'block');
        query('.show-all-results', this.searchResultsNode).style('display', 'none');
        query('.searchMenu', this.searchResultsNode).style('display', 'block');

        var groupNode = query('.searchInputGroup', this.searchDijit.domNode)[0];
        if (groupNode) {
          var groupBox = html.getMarginBox(groupNode);
          var style = {
            width: groupBox.w + 'px'
          };
          if (window.isRTL) {
            var box = html.getMarginBox(this.searchDijit.domNode);
            style.right = (box.w - groupBox.l - groupBox.w) + 'px';
          } else {
            style.left = groupBox.l + 'px';
          }
          query('.show-all-results', this.searchResultsNode).style(style);
          query('.searchMenu', this.searchResultsNode).style(style);
        }
      },

      destroy: function() {
        utils.setMap(null);
        utils.setLayerInfosObj(null);
        utils.setAppConfig(null);
        if (this.searchDijit) {
          this.searchDijit.clear();
        }

        this.inherited(arguments);
      },

      _hidePopup: function() {
        if (this.map.infoWindow.isShowing) {
          this.map.infoWindow.hide();
        }
      },

      onActive: function() {
        this._mapClickHandle = aspect.before(this.map, 'onClick', lang.hitch(this, function() {
          this._hidePopup();
          return arguments;
        }));
      },

      onDeActive: function() {
        if (this._mapClickHandle && this._mapClickHandle.remove) {
          this._mapClickHandle.remove();
        }
        this._hidePopup();
      }
    });
  });
