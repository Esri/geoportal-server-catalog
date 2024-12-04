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
    'dojo/Deferred',
    'dojo/promise/all',
    'jimu/portalUtils',
    'jimu/utils'

  ],
  function(Deferred, all, portalUtils, jimuUtils) {
    return {
      AddResourcesToItemForAppSave: function(portalUrl, resourcesUrls, originItemId, newItemId) {
        //Add resources to item, based on the existing virtual resources url to determine the path and file name
        //resourcesUrls:[{resUrl:required,b64}]
        resourcesUrls = resourcesUrls || [];
        if (resourcesUrls.length === 0) {
          var deferred = new Deferred();
          deferred.resolve(resourcesUrls);
          return deferred;
        }
        var getBlobDefs = resourcesUrls.map(function(item) {
          var prefix_FileName = item.resUrl.split('resources/')[1];
          var getBlobDef = new Deferred();
          if (item.b64) {
            var blobFile = jimuUtils.b64toBlob(item.b64);
            getBlobDef.resolve({
              blob: blobFile,
              fileName: prefix_FileName.split('/')[1],
              prefixName: prefix_FileName.split('/')[0]
            });
          } else {
            var retUrl = item.resUrl;
            if (retUrl.indexOf('${itemId}') > 0) {
              retUrl = retUrl.replace('${itemId}', originItemId);
            }
            jimuUtils.resourcesUrlToBlob(retUrl).then(function(result) {
              getBlobDef.resolve({
                blob: result,
                fileName: prefix_FileName.split('/')[1],
                prefixName: prefix_FileName.split('/')[0]
              }, function(err) {
                console.error(err.message || err);
                getBlobDef.reject(err);
              });
            });
          }
          return getBlobDef;
        });
        return all(getBlobDefs).then(function(result) {
          if (result instanceof Array && result.length > 0) {
            var uploadDefs = result.map(function(e) {
              var itemId = originItemId;
              if (newItemId) {
                itemId = newItemId;
              }
              return portalUtils.addResource(portalUrl, itemId, e.blob, e.fileName, e.prefixName);
            }.bind(this));
            return all(uploadDefs).then(function(results) {
              return results;
            });
          }
        }.bind(this));
      }
    };
  });