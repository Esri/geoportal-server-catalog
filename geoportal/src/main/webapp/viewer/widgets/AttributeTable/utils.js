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

define(['dojo/_base/lang',
  'dojo/_base/array',
  'jimu/LayerInfos/LayerInfos',
  'dojo/Deferred',
  'dojo/promise/all',
  'exports',
  "dojo/store/Observable",
  "dojo/store/Cache",
  "dojo/store/Memory",
  "esri/lang",
  './table/FeatureLayerQueryStore',
  'jimu/utils'
], function(
  lang, array, LayerInfos, Deferred, all,
  exports, Observable, Cache, Memory, esriLang,
  FeatureLayerQueryStore, utils
) {
  exports.readLayerInfosObj = function(map) {
    return LayerInfos.getInstance(map, map.itemInfo);
  };

  /*
  original: boolean; if true only get layerinfos from data of webmap;
  excludeMapNotes: boolean; if true exclude map notes.

  resovlue layerinfos array
   */
  exports.readLayerInfosFromMap = function(map, original, excludeMapNotes) {
    var def = new Deferred();
    LayerInfos.getInstance(map, map.itemInfo).then(lang.hitch(this, function(layerInfosObj) {
      var layerInfos = [];
      if (original) {
        layerInfosObj.traversalLayerInfosOfWebmap(function(layerInfo) {
          layerInfos.push(layerInfo);
        });
      } else {
        layerInfosObj.traversal(function(layerInfo) {
          layerInfos.push(layerInfo);
        });
      }


      if (excludeMapNotes) {
        var mapNoteIds = [];
        var mnLayerInfos = layerInfosObj.getMapNotesLayerInfoArray();
        array.forEach(mnLayerInfos, function(mnLayerInfo) {
          mapNoteIds.push(mnLayerInfo.id);
          mnLayerInfo.traversal(function(mnLayerInfo) {
            mapNoteIds.push(mnLayerInfo.id);
          });
        });
        layerInfos = array.filter(layerInfos, function(layerInfo) {
          return mapNoteIds.indexOf(layerInfo.id) === -1;
        });
      }

      var tableInfos = layerInfosObj.getTableInfoArray();
      layerInfos = layerInfos.concat(tableInfos);

      def.resolve(layerInfos);
    }), lang.hitch(this, function(err) {
      console.error(err);
      def.reject(err);
    }));

    return def.promise;
  };

  //return {selectionHandle,field0,field1,...}
  //used to create dgrid
  //
  //pInfos: PopupInfo
  exports.generateColumnsFromFields = function(pInfos, fields, typeIdField, types,
    supportsOrder, supportsStatistics) {
    function getFormatInfo(fieldName) {
      if (pInfos && esriLang.isDefined(pInfos.fieldInfos)) {
        for (var i = 0, len = pInfos.fieldInfos.length; i < len; i++) {
          var f = pInfos.fieldInfos[i];
          if (f.fieldName === fieldName) {
            return f.format;
          }
        }
      }

      return null;
    }
    var columns = {};
    columns.selectionHandle = {
      label: "",
      className: "selection-handle-column",
      hidden: false,
      unhidable: true, // if true the field never display in toogle column menu
      filed: "selection-handle-column",
      sortable: false, // prevent default behavior of dgrid
      _cache: { // control the menu item when click the column of dgrid
        sortable: false,
        statistics: false
      }

      // get: function(){}, get value for cell
      // formatter: function(){}, format value of cell
    };
    array.forEach(fields, lang.hitch(exports, function(_field, i, fields) {
      var techFieldName = "field" + i;
      var isDomain = !!_field.domain;
      var isDate = _field.type === "esriFieldTypeDate";
      var isTypeIdField = typeIdField && (_field.name === typeIdField);
      var isNumber = _field.type === "esriFieldTypeDouble" ||
        _field.type === "esriFieldTypeSingle" ||
        _field.type === "esriFieldTypeInteger" ||
        _field.type === "esriFieldTypeSmallInteger";
      var isString = _field.type === "esriFieldTypeString";

      columns[techFieldName] = {
        label: _field.alias || _field.name,
        className: techFieldName,
        hidden: fields.length === 1 ? false : !_field.show && esriLang.isDefined(_field.show),
        unhidable: fields.length === 1 ? false :
          !_field.show && esriLang.isDefined(_field.show) && _field._pk,
        field: _field.name,
        sortable: false,
        _cache: {
          sortable: !!supportsOrder,
          statistics: supportsStatistics && !isDomain && isNumber
        }
      };


      if (isString) {
        columns[techFieldName].formatter = lang.hitch(exports, exports.urlFormatter);
      } else if (isDate) {
        columns[techFieldName].formatter = lang.hitch(
          exports, exports.dateFormatter, getFormatInfo(_field.name));
      } else if (isNumber) {
        columns[techFieldName].formatter = lang.hitch(
          exports, exports.numberFormatter, getFormatInfo(_field.name));
      }

      // obj is feature.attributes in the store.
      if (isDomain) {
        // coded value
        columns[techFieldName].get = lang.hitch(exports, function(field, obj) {
          return this.getCodeValue(field.domain, obj[field.name]);
        }, _field);
      } else if(isTypeIdField) {
        columns[techFieldName].get = lang.hitch(exports, function(field, types, obj) {
          return this.getTypeName(obj[field.name], types);
        }, _field, types);
      } else if (!isDomain && !isDate && !isTypeIdField) {
        // Not A Date, Domain or Type Field
        // Still need to check for subclass value
        columns[techFieldName].get = lang.hitch(exports,
          function(field, typeIdField, types, obj) {
            var codeValue = null;
            if (typeIdField && types && types.length > 0) {
              var typeChecks = array.filter(types, lang.hitch(exports, function(item) {
                // value of typeIdFild has been changed above
                return item.name === obj[typeIdField];
              }));
              var typeCheck = (typeChecks && typeChecks[0]) || null;

              if (typeCheck && typeCheck.domains &&
                typeCheck.domains[field.name] && typeCheck.domains[field.name].codedValues) {
                codeValue = this.getCodeValue(
                  typeCheck.domains[field.name],
                  obj[field.name]
                );
              }
            }
            var _value = codeValue !== null ? codeValue : obj[field.name];
            return _value || isFinite(_value) ? _value : "";
          }, _field, typeIdField, types);
      }
    }));

    return columns;
  };

  exports.getTypeName = function(value, types) {
    return utils.fieldFormatter.getTypeName(value, types);
  };

  exports.getCodeValue = function(domain, v) {
    return utils.fieldFormatter.getCodedValue(domain, v);
  };

  exports.urlFormatter = function(str) {
    return utils.fieldFormatter.getFormattedUrl(str);
  };

  exports.dateFormatter = function(format, dateNumber) {
    return utils.fieldFormatter.getFormattedDate(dateNumber, format);
  };

  exports.numberFormatter = function(format, num) {
    return utils.fieldFormatter.getFormattedNumber(num, format);
  };

  exports.readLayerObjectsFromMap = function(map, original, excludeMapNotes) {
    var def = new Deferred(),
      defs = [];
    this.readLayerInfosFromMap(map, original, excludeMapNotes)
    .then(lang.hitch(this, function(layerInfos) {
      array.forEach(layerInfos, lang.hitch(this, function(layerInfo) {
        defs.push(layerInfo.getLayerObject());
      }));

      all(defs).then(lang.hitch(this, function(layerObjects) {
        def.resolve(layerObjects);
      }), lang.hitch(this, function(err) {
        def.reject(err);
        console.error(err);
      }));
    }), lang.hitch(this, function(err) {
      def.reject(err);
    }));

    return def.promise;
  };

  // resolve [{
  //      isSupportedLayer: true/false,
  //      isSupportQuery: true/false,
  //      layerType: layerType.
  //    }]
  exports.readSupportTableInfoFromLayerInfos = function(layerInfos) {
    var def = new Deferred();
    var defs = [];
    array.forEach(layerInfos, lang.hitch(this, function(layerInfo) {
      defs.push(layerInfo.getSupportTableInfo());
    }));

    all(defs).then(lang.hitch(this, function(tableInfos) {
      var _tInfos = lang.clone(tableInfos);
      array.forEach(_tInfos, function(tInfo, idx) {
        tInfo.id = layerInfos[idx].id;
      });
      def.resolve(_tInfos);
    }), function(err) {
      def.reject(err);
    });

    return def.promise;
  };

  // get layerInfos array which isSupportedLayer is true;
  exports.readConfigLayerInfosFromMap = function(map, original, excludeMapNotes) {
    var def = new Deferred(),
      defs = [];
    this.readLayerInfosFromMap(map, original, excludeMapNotes)
    .then(lang.hitch(this, function(layerInfos) {
      var ret = [];
      array.forEach(layerInfos, function(layerInfo) {
        defs.push(layerInfo.getSupportTableInfo());
      });

      all(defs).then(lang.hitch(this, function(tableInfos) {
        array.forEach(tableInfos, lang.hitch(this, function(tableInfo, i) {
          if (tableInfo.isSupportedLayer) {
            layerInfos[i].name = layerInfos[i].title;
            ret.push(layerInfos[i]);
          }
        }));

        def.resolve(ret);
      }), lang.hitch(this, function(err) {
        def.reject(err);
      }));
    }), lang.hitch(this, function(err) {
      def.reject(err);
    }));

    return def.promise;
  };

  exports.getConfigInfosFromLayerInfos = function(layerInfos) {
    return array.map(layerInfos, function(layerInfo) {
      return exports.getConfigInfoFromLayerInfo(layerInfo);
    });
  };
  // if config is null, use this method to get default content.
  exports.getConfigInfoFromLayerInfo = function(layerInfo) {
    var json = {};
    json.name = layerInfo.name || layerInfo.title;
    json.id = layerInfo.id;
    json.show = layerInfo.isShowInMap();
    json.layer = {
      url: layerInfo.getUrl()
    };

    var popupInfo = layerInfo.getPopupInfo();
    if (popupInfo && !popupInfo.description) {
      json.layer.fields = array.map(popupInfo.fieldInfos, function(fieldInfo) {
        return {
          name: fieldInfo.fieldName,
          alias: fieldInfo.label,
          show: fieldInfo.visible,
          format: fieldInfo.format
        };
      });

      // remove fields not exist in layerObject.fields
      var layerFields = lang.getObject('layerObject.fields', false, layerInfo);
      json.layer.fields = clipValidFields(json.layer.fields, layerFields);

      var hasVisibleFields = array.some(json.layer.fields, function(f) {
        return f.show;
      });
      if (!hasVisibleFields) {
        //If layer schema changes, the fields info in webmap may not match with the layer field info
        //and the fields array may be empty.
        if(json.layer.fields && json.layer.fields.length > 0){
          json.layer.fields[0].show = true;
        }else{
          console.warn('We do not get fields info.');
        }
      }
    }

    return json;
  };

  exports.generateCacheStore = function(_layer, recordCounts, batchCount, whereClause, extent) {
    var qtStore = new FeatureLayerQueryStore({
      layer: _layer,
      objectIds: _layer._objectIds || null,
      totalCount: recordCounts,
      batchCount: batchCount,
      where: whereClause || "1=1",
      spatialFilter: extent
    });

    var mStore = new Memory();
    return (new Cache(qtStore, mStore, {}));
  };

  exports.generateMemoryStore = function(data, idProperty) {
    return (new Observable(new Memory({
      "data": data || [],
      "idProperty": idProperty
    })));
  };

  exports.merge = function(dest, source, key, cb){
    var sourceIds = array.map(source, function(item) {
      return item[key];
    });
    for (var i = 0, len = dest.length; i < len; i++) {
      var idx = sourceIds.indexOf(dest[i][key]);
      if (idx > -1) {
        cb(dest[i], source[idx]);
      }
    }
  };

  exports.syncOrderWith = function(dest, ref, key) {
    if (!lang.isArray(ref) || !key) {
      return dest;
    }
    function getKeys(dest, k) {
      return array.map(dest, function(item) {
        return item[k];
      });
    }
    var destKeys = getKeys(dest, key);
    var order = [];
    for (var i = 0, len = ref.length; i < len; i++) {
      var idx = destKeys.indexOf(ref[i][key]);
      if (idx > -1) {
        order = order.concat(dest.splice(idx, 1));
        destKeys = getKeys(dest, key);
      }
    }
    return order.concat(dest);
  };

  function clipValidFields(sFields, rFields) {
    if (!(sFields && sFields.length)) {
      return rFields || [];
    }
    if (!(rFields && rFields.length)) {
      return sFields;
    }
    var validFields = [];
    for (var i = 0, len = sFields.length; i < len; i++) {
      var sf = sFields[i];
      for (var j = 0, len2 = rFields.length; j < len2; j++) {
        var rf = rFields[j];
        if (rf.name === sf.name) {
          validFields.push(sf);
          break;
        }
      }
    }
    return validFields;
  }
});