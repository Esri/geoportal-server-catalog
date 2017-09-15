///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
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
  'dojo/json',
  'dojo/Deferred',
  'esri/graphicsUtils',
  'jimu/portalUtils',
  'jimu/portalUrlUtils',
  'jimu/Role',
  'jimu/dijit/Message',
  '../BaseFeatureAction',
  'jimu/dijit/Popup',
  'jimu/dijit/AddItemForm'
], function(declare, lang, array, JSON, Deferred, graphicsUtils,
  portalUtils, portalUrlUtils, Role, Message, BaseFeatureAction, Popup, ItemContent){
  var clazz = declare(BaseFeatureAction, {
    name: 'SaveToMyContent',
    iconClass: 'icon-save',

    isFeatureSupported: function(featureSet){
      if (featureSet.features.length <= 0 || !featureSet.features[0].geometry) {
        return false;
      }
      return this.checkPrivilege();
    },

    onExecute: function(featureSet, layer){
      var itemContent = new ItemContent({
        appConfig: this.appConfig
      });

      var popup = new Popup({
        content: itemContent,
        titleLabel: window.jimuNls.featureActions.SaveToMyContent,
        width: 525,
        height: 220,
        buttons: [{
          label: window.jimuNls.common.ok,
          onClick: lang.hitch(this, function() {
            itemContent.showBusy();
            popup.disableButton(0);
            itemContent.validate().then(lang.hitch(this, function(res) {
              if (res.valid) {
                this._addItem(featureSet, layer, itemContent);
              } else {
                itemContent.hideBusy();
                popup.enableButton(0);
              }
            }));
          })
        }, {
          label: window.jimuNls.common.cancel,
          classNames: ['jimu-btn-vacation'],
          onClick: lang.hitch(this, function() {
            popup.close();
          })
        }]
      });
    },

    checkPrivilege: function () {
      var portalUrl = portalUrlUtils.getStandardPortalUrl(this.appConfig.portalUrl);
      var portal = portalUtils.getPortal(portalUrl);

      if(!portal || !portal.haveSignIn()) {
        var def = new Deferred();
        def.resolve(false);
        return def;
      } else {
        return this._hasPrivilege(portal);
      }
    },

    _hasPrivilege: function(portal){
      return portal.loadSelfInfo().then(lang.hitch(this, function(res){
        if(res && res.user) {
          var userRole = new Role({
            id: (res.user.roleId) ? res.user.roleId : res.user.role,
            role: res.user.role
          });
          if(res.user.privileges) {
            userRole.setPrivileges(res.user.privileges);
          }
          // Check whether user can create item of type feature collection
          return userRole.canCreateItem() && userRole.canPublishFeatures();
        }else{
          return false;
        }
      }), function() {
        return false;
      });
    },

    _addItem: function(featureSet, layer, itemContent) {
      var itemName = itemContent.getName(),
        folderId = itemContent.getFolderId(),
        popup = itemContent.popup;
      var extent;
      layer = layer || {};

      var layerDefinition = {
        name: layer.name,
        type: layer.type || 'Feature Layer',
        displayField: layer.displayField,
        description: layer.description,
        copyrightText: layer.copyright,
        geometryType: layer.geometryType || featureSet.geometryType,
        fields: layer.fields || featureSet.fields,
        objectIdField: layer.objectIdField
      };
      if (featureSet.features[0].geometry) {
        extent = graphicsUtils.graphicsExtent(featureSet.features);
        layerDefinition.initialExtent = extent;
        layerDefinition.fullExtent = extent;
      }
      if(!layerDefinition.objectIdField && layerDefinition.fields) {
        array.some(layerDefinition.fields, function(field) {
          if (field.type === 'esriFieldTypeOID') {
            layerDefinition.objectIdField = field.name;
            return true;
          }
        });
      }
      var featureCollection = {
        layers: [{
          layerDefinition: layerDefinition,
          featureSet: featureSet.toJson()
        }]
      };

      itemContent.addItem({
        name: itemName,
        title: itemName,
        type: 'Feature Collection',
        typeKeywords: "WAB_created",
        text: JSON.stringify(featureCollection)
      }, folderId).then(lang.hitch(this, function(res) {
        if(res.success === true) {
          popup.close();
          // return itemid = res.id
          // TODO popup a tip
        } else {
          itemContent.hideBusy();
          popup.enableButton(0);
          new Message({
            message: res.error ? res.error.message : ''
          });
        }
      }), function (err) {
        itemContent.hideBusy();
        popup.enableButton(0);
        new Message({
          message: err.message
        });
      });
    }
  });
  return clazz;
});
