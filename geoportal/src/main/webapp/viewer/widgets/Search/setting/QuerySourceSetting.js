///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Esri. All Rights Reserved.
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
  'dojo/_base/html',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./QuerySourceSetting.html',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/on',
  'dojo/query',
  'dojo/Deferred',
  'dojo/Evented',
  'jimu/dijit/_FeaturelayerSourcePopup',
  "jimu/portalUrlUtils",
  'esri/request',
  "esri/lang",
  'jimu/utils',
  'jimu/dijit/Popup',
  'jimu/dijit/CheckBox',
  'jimu/dijit/LoadingShelter',
  'dijit/form/ValidationTextBox',
  'dojo/NodeList-data'
],
function(declare, html, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
  template, lang, array, on, query, Deferred, Evented,
  _FeaturelayerSourcePopup, portalUrlUtils, esriRequest, esriLang,
  jimuUtils, Popup, CheckBox) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    baseClass: 'jimu-widget-search-query-source-setting',
    templateString: template,

    nls: null,
    appConfig: null,
    map: null,

    tr: null,
    config: null,
    fieldsPopup: null,
    _layerDefinition: null,//include url
    _fieldsCheckBox : null,
    _layerId: null,
    _suggestible: false,

    _clickSet: false,

    //event
    //reset-query-source

    postCreate: function() {
      this.inherited(arguments);

      this.exactMatch = new CheckBox({
        checked: false,
        label: this.nls.exactMatch
      }, this.exactMatch);
      this.searchInCurrentMapExtent = new CheckBox({
        checked: false,
        label: this.nls.searchInCurrentMapExtent
      }, this.searchInCurrentMapExtent);

      this._layerDefinition = {};
      this._fieldsCheckBox = [];

      this._setMessageNodeContent("");
    },

    setDefinition: function(definition) {
      this._layerDefinition = definition || {};
    },

    getDefinition: function() {
      return this._layerDefinition;
    },

    setRelatedTr: function(tr) {
      this.tr = tr;
    },

    getRelatedTr: function() {
      return this.tr;
    },

    setConfig: function(config) {
      if (Object.prototype.toString.call(config) !== "[object Object]") {
        return;
      }

      var url = config.url;
      if (!url) {
        return;
      }
      this.config = config;

      this.shelter.show();
      if (this._layerDefinition.url !== url) {
        this._getDefinitionFromRemote(url).then(lang.hitch(this, function(response) {
          if (url && (response && response.type !== 'error')) {
            this._layerDefinition = response;
            this._layerDefinition.url = url;
            this._setSourceItems();
            this._setMessageNodeContent("");
          } else if (url && (response && response.type === 'error')) {
            this._setSourceItems();
            this._disableSourceItems();
            this._setMessageNodeContent(esriLang.substitute({
              'URL': response.url
            }, lang.clone(this.nls.invalidUrlTip)), true);
          }
          this.shelter.hide();
        }));
      } else {
        this._setMessageNodeContent("");
        this._setSourceItems();
        this.shelter.hide();
      }
    },

    isValidConfig: function() {
      var config = this.getConfig();
      if (config.url && config.name && config.displayField) {
        return true;
      }else {
        return false;
      }
    },

    showValidationTip: function() {
      this._showValidationErrorTip(this.sourceUrl);
      this._showValidationErrorTip(this.sourceName);
    },

    getConfig: function() {
      var json = {
        layerId: this._layerId,
        url: this.sourceUrl.get('value'),
        name: jimuUtils.stripHTML(this.sourceName.get('value')),
        placeholder: jimuUtils.stripHTML(this.placeholder.get('value')),
        searchFields: this._getSearchFields(),// defaults to FeatureLayer.displayField
        displayField: this.displayField.get('value'),// defaults to FeatureLayer.displayField
        exactMatch: this.exactMatch.getValue(),
        searchInCurrentMapExtent: this.searchInCurrentMapExtent.checked,
        zoomScale: this.zoomScale.get('value') || 50000,
        maxSuggestions: this.maxSuggestions.get('value') || 6,
        maxResults: this.maxResults.get('value') || 6,
        type: 'query'
      };

      return json;
    },

    destroy: function() {
      this.inherited(arguments);
      if (this.fieldsPopup) {
        this.fieldsPopup.close();
        this.fieldsPopup = null;
      }
      this._layerDefinition = null;
      this.config = null;
      this.nls = null;
      this.tr = null;
    },

    _onSourceNameBlur: function() {
      this.sourceName.set('value', jimuUtils.stripHTML(this.sourceName.get('value')));
    },

    _onPlaceholderBlur: function() {
      this.placeholder.set('value', jimuUtils.stripHTML(this.placeholder.get('value')));
    },

    _disableSourceItems: function() {
      this.sourceName.set('disabled', true);
      this.placeholder.set('disabled', true);
      this.searchFields.set('disabled', true);
      html.setStyle(this.fieldsSelectorNode, 'display', 'none');
      this.displayField.set('disabled', true);
      this.maxSuggestions.set('disabled', true);
      this.maxResults.set('disabled', true);
      this.zoomScale.set('disabled', true);
    },

    _enableSourceItems: function() {
      this.sourceName.set('disabled', false);
      this.placeholder.set('disabled', false);
      this.searchFields.set('disabled', false);
      html.setStyle(this.fieldsSelectorNode, 'display', 'inline-block');
      this.displayField.set('disabled', false);
      this.maxSuggestions.set('disabled', false);
      this.maxResults.set('disabled', false);
      this.zoomScale.set('disabled', false);
    },

    _setSourceItems: function() {
      this.sourceUrl.set('value', this.config.url);
      this.sourceName.set('value', jimuUtils.stripHTML(this.config.name || ""));
      this.placeholder.set('value', jimuUtils.stripHTML(this.config.placeholder || ""));
      this._setSearchFields2Node();
      this.searchFields.set('value', this._getSearchFieldsAlias());
      this._setDisplayFieldOptions();
      this.displayField.set('value', this.config.displayField || "");
      this.exactMatch.setValue(!!this.config.exactMatch);
      this.searchInCurrentMapExtent.setValue(!!this.config.searchInCurrentMapExtent);
      this.zoomScale.set('value', this.config.zoomScale || 50000);
      this.maxSuggestions.set('value', this.config.maxSuggestions || 6);
      this.maxResults.set('value', this.config.maxResults || 6);
      this._layerId = this.config.layerId;

      this._suggestible = this._layerDefinition &&
        this._layerDefinition.advancedQueryCapabilities &&
        this._layerDefinition.advancedQueryCapabilities.supportsPagination;
      if (!this._suggestible) {
        this._showSuggestibleTips();
      } else {
        this._hideSuggestibleTips();
      }
      var isPointLayer = this._layerDefinition &&
        this._layerDefinition.geometryType === 'esriGeometryPoint';
      if (!isPointLayer) {
        html.setStyle(this.zoomScaleTr, 'display', 'none');
      } else {
        html.setStyle(this.zoomScaleTr, 'display', '');
      }
      this._enableSourceItems();
    },

    _getDefinitionFromRemote: function(url) {
      var resultDef = new Deferred();
      var def = esriRequest({
          url: url,
          content: {
            f: 'json'
          },
          handleAs: 'json',
          callbackParamName: 'callback'
        });
      this.own(def);
      def.then(lang.hitch(this, function(response) {
        resultDef.resolve(response);
      }), lang.hitch(this, function(err) {
        console.error(err);
        resultDef.resolve({
          type: 'error',
          url: this._getRequestUrl(url)
        });
      }));
      return resultDef.promise;
    },

    _setMessageNodeContent: function(content, err) {
      html.empty(this.messageNode);
      if (!content.nodeType) {
        content = html.toDom(content);
      }
      html.place(content, this.messageNode);
      if (err) {
        html.setStyle(this.messageTr, 'display', '');
      } else {
        html.setStyle(this.messageTr, 'display', 'none');
      }
    },

    _getRequestUrl: function(url) {
      var protocol = window.location.protocol;
      if (protocol === 'http:') {
        return portalUrlUtils.setHttpProtocol(url);
      } else if (protocol === 'https:'){
        return portalUrlUtils.setHttpsProtocol(url);
      } else {
        return url;
      }
    },

    _setSearchFields2Node: function() {
      var fields = null;
      var fieldsFromDefinition = this._layerDefinition &&
        this._layerDefinition.fields && this._layerDefinition.fields.length > 0;
      var fieldsFromConfig = this.config && this.config.searchFields &&
        this.config.searchFields.length > 0;

      if (!fieldsFromConfig) {
        fields = [];
      }
      if (!fieldsFromDefinition) {
        fields = this.config.searchFields;
      } else { //fieldsFromDefinition && fieldsFromConfig
        var layerFields = this._layerDefinition.fields;
        var configFields = this.config.searchFields;
        fields = array.filter(configFields, function(cf) {
          return array.some(layerFields, function(lf) {
            return lf.name === cf;
          });
        });
      }

      this.searchFields.set('_fields', fields);
    },

    _setDisplayFieldOptions: function() {
      var fieldsFromDefinition = this._layerDefinition &&
        this._layerDefinition.fields && this._layerDefinition.fields.length > 0;
      var options = [];
      if (fieldsFromDefinition) {
        var layerFields = this._layerDefinition.fields;
        options = array.map(layerFields, function(lf) {
          return {
            label: lf.alias || lf.name || "",
            value: lf.name || ""
          };
        });
      } else if (this.config && this.config.displayField) {
        options = [{
          label: this.config.displayField,
          value: this.config.displayField
        }];
      }

      this.displayField.set('options', options);
    },

    _getSearchFieldsAlias: function() {
      var fields = this._getSearchFields();
      var fieldsFromDefinition = this._layerDefinition &&
        this._layerDefinition.fields && this._layerDefinition.fields.length > 0;
      var fieldsFromConfig = fields && fields.length > 0;
      if (!fieldsFromConfig) {
        return "";
      }
      if (!fieldsFromDefinition) {
        return fields.join(',');
      } else { //fieldsFromDefinition && fieldsFromConfig
        var layerFields = this._layerDefinition.fields;
        var fNames = array.map(layerFields, function(field) {
          return field && field.name;
        });
        var alias = [];
        for (var i = 0, len = fields.length; i < len; i++) {
          var index = fNames.indexOf(fields[i]);
          if (index > -1) {
            alias.push(layerFields[index].alias);
          }
        }
        return alias.join(',');
      }
    },

    _getSearchFields: function() {
      return this.searchFields.get('_fields');
    },

    _setSearchFields: function(fields) {
      this.searchFields.set('_fields', fields);
    },

    _onSetSourceClick: function() {
      this._clickSet = true;
      this._openServiceChooser();
    },

    _openQuerySourceChooser: function() {
      this._clickSet = false;
      this._openServiceChooser();
    },

    _openServiceChooser: function() {
      var args = {
        titleLabel: this.nls.setLayerSource,

        dijitArgs: {
          multiple: false,
          createMapResponse: this.map.webMapResponse,
          portalUrl: this.appConfig.portalUrl,
          style: {
            height: '100%'
          }
        }
      };

      var featurePopup = new _FeaturelayerSourcePopup(args);
      on.once(featurePopup, 'ok', lang.hitch(this, function(item) {
        featurePopup.close();
        this.setDefinition(item.definition || {});
        this.setConfig({
          layerId: item.layerInfo && item.layerInfo.id || null,
          url: item.url,
          name: item.name || "",
          placeholder: "",
          searchFields: [],
          displayField: this._layerDefinition.displayField || "",
          exactMatch: false,
          zoomScale: 50000, //default
          maxSuggestions: 6, //default
          maxResults: 6,//default
          type: "query"
        });
        featurePopup = null;
        this._setMessageNodeContent("");

        if (this._clickSet) {
          this.emit('reselect-query-source-ok', item);
        } else {
          this.emit('select-query-source-ok', item);
        }
      }));

      on.once(featurePopup, 'cancel', lang.hitch(this, function() {
        featurePopup.close();
        featurePopup = null;

        this.emit('select-query-source-cancel');
      }));
    },

    _onFieldsSelectorClick: function() {
      var contentDom = html.create('div', {
        style: {
          maxHeight: '480px'
        }
      });

      var layerFields = this._layerDefinition.fields;
      this._fieldsCheckBox = [];
      array.forEach(layerFields, lang.hitch(this, function(field, idx) {
        var chk = new CheckBox({
          checked: this._isSearchable(field),
          label: field.alias || field.name
        });
        html.addClass(chk.domNode, 'fields-checkbox');
        html.addClass(chk.labelNode, 'jimu-ellipsis');
        html.setAttr(chk.domNode, {
          'title': field.alias || field.name
        });
        if (idx % 3 === 0) {
          if (window.isRTL) {
            html.setStyle(chk.domNode, 'marginRight', 0);
          } else {
            html.setStyle(chk.domNode, 'marginLeft', 0);
          }
        }
        chk.placeAt(contentDom);
        query(chk.domNode).data('fieldName', field.name);
        this._fieldsCheckBox.push(chk);
      }));

      this.fieldsPopup = new Popup({
        titleLabel: this.nls.setSearchFields,
        autoHeight: true,
        content: contentDom,
        container: window.jimuConfig.layoutId,
        width: 640,
        maxHeight: 600,
        buttons: [{
          label: this.nls.ok,
          onClick: lang.hitch(this, '_onSearchFieldsOk')
        }, {
          label: this.nls.cancel,
          classNames: ['jimu-btn-vacation']
        }],
        onClose: lang.hitch(this, function() {
          this.fieldsPopup = null;
        })
      });
      html.addClass(this.fieldsPopup.domNode, 'jimu-widget-search-query-source-setting-fields');
    },

    _onSearchFieldsOk: function() {
      var _fields = [];
      array.forEach(this._fieldsCheckBox, function(chk) {
        if (chk.getValue()) {
          var _data = query(chk.domNode).data('fieldName');
          _fields.push(_data[0]);
          query(chk.domNode).removeData();
        }
      });
      this._setSearchFields(_fields);
      this.searchFields.set('value', this._getSearchFieldsAlias());
      this.fieldsPopup.close();
    },

    _isSearchable: function(field) {
      var searchFields = this._getSearchFields();
      return array.some(searchFields, lang.hitch(this, function(sf){
        return field.name === sf;
      }));
    },

    _showSuggestibleTips: function() {
      html.addClass(this.tipsNode, 'source-tips-show');
      html.setStyle(this.maxSuggestions.domNode, 'display', 'none');
    },

    _hideSuggestibleTips: function() {
      html.removeClass(this.tipsNode, 'source-tips-show');
      html.setStyle(this.maxSuggestions.domNode, 'display', 'block');
    },

    _showValidationErrorTip: function(_dijit){
      if (!_dijit.validate() && _dijit.domNode) {
        if (_dijit.focusNode) {
          var _disabled = _dijit.get('disabled');
          if (_disabled) {
            _dijit.set('disabled', false);
          }
          _dijit.focusNode.focus();
          setTimeout(lang.hitch(this, function() {
            _dijit.focusNode.blur();
            if (_disabled) {
              _dijit.set('disabled', true);
            }
            _dijit = null;
          }), 100);
        }
      }
    }
  });
});