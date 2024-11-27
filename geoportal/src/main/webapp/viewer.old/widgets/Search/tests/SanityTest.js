/**
 * Created by zezheng on 2016-04-11.
 */
define([
  'intern!bdd',
  'intern/chai!assert',
  'testjimu/WidgetManager',
  'testjimu/globals' //,
  // 'dojo/Deferred'
], function(bdd, assert, TestWidgetManager /*, globals, Deferred*/ ) {
  'use strict';
  var widgetJson = {
    id: 'search1',
    uri: "widgets/Search/Widget"
  };

  var searchConfig = {
    id: 'search1',
    "uri": "widgets/Search/Widget",
    "position": {
      "left": 55,
      "top": 5,
      "relativeTo": "map"
    },
    "version": "2.0.1",
    "name": "Search",
    "label": "Search",
    "config": {
      "allPlaceholder": "",
      "showInfoWindowOnSelect": true,
      "sources": [{
        "layerId": "Recreation_2700",
        "_featureLayerId": "Recreation_2700",
        "url": "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Recreation/FeatureServer/0",
        "name": "Facilitiessafd",
        "placeholder": "",
        "searchFields": ["facility", "description"],
        "displayField": "description",
        "exactMatch": false,
        "searchInCurrentMapExtent": false,
        "zoomScale": 50000,
        "maxSuggestions": 6,
        "maxResults": 6,
        "type": "query"
      }, {
        "layerId": "KSPetro_841_0",
        "url": "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSPetro/MapServer/0",
        "name": "Wells",
        "placeholder": "",
        "searchFields": ["FIELD_NAME", "FIELD_KID"],
        "displayField": "FIELD_NAME",
        "exactMatch": false,
        "searchInCurrentMapExtent": false,
        "zoomScale": 50000,
        "maxSuggestions": 6,
        "maxResults": 6,
        "type": "query"
      }, {
        "layerId": "Recreation_2700",
        "url": "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Recreation/FeatureServer/0",
        "name": "Recreation - Facilities",
        "placeholder": "",
        "searchFields": ["facility", "description"],
        "displayField": "description",
        "exactMatch": false,
        "searchInCurrentMapExtent": true,
        "zoomScale": 50000,
        "maxSuggestions": 6,
        "maxResults": 6,
        "type": "query"
      }, {
        "url": "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
        "name": "Esri World Geocoder",
        "singleLineFieldName": "SingleLine",
        "placeholder": "Esri World Geocoder",
        "countryCode": "",
        "zoomScale": 50000,
        "maxSuggestions": 6,
        "maxResults": 6,
        "searchInCurrentMapExtent": false,
        "type": "locator"
      }, {
        "name": "tmelectric",
        "url": "http://tmelectric.esri.com/arcgis/rest/services/AssetLocator/GeocodeServer",
        "singleLineFieldName": "SingleLine",
        "placeholder": "tmelectric",
        "maxResults": 6,
        "searchInCurrentMapExtent": false,
        "type": "locator"
      }]
    }
  };
  var searchResult = {
    extent: {
      cache: undefined,
      spatialReference: {
        wkid: 102100
      },
      type: "extent",
      xmax: -13036252.213224964,
      xmin: -13056360.586775037,
      ymax: 4042041.3054643963,
      ymin: 4030743.5745356027
    },
    feature: {
      attributes: {
        description: "Test point for offline sync option",
        facility: 1,
        globalid: "{3741E1DB-2AD6-44C1-8F8C-D6442F0A410C}",
        objectid: 361318,
        observed: null,
        quality: 0
      },
      geometry: {
        spatialReference: {
          wkid: 102100
        },
        type: "point",
        x: -13046306.4,
        y: 4036392.44
      },
      infoTemplate: null,
      symbol: null
    }
  };

  var searchDijit = {
    activeSourceIndex: 0,
    sources: [{
      featureLayer: {
        fields: [{
          "name": "objectid",
          "type": "esriFieldTypeOID",
          "alias": "OBJECTID",
          "editable": false,
          "nullable": false
        }, {
          "name": "facility",
          "type": "esriFieldTypeInteger",
          "alias": "Facility",
          "editable": true,
          "nullable": true,
          "domain": {
            "name": "dFacilityTypes",
            "type": "codedValue",
            "codedValues": [{
              "name": "Restrooms",
              "code": 1
            }, {
              "name": "Camping",
              "code": 2
            }, {
              "name": "Rest Area",
              "code": 3
            }, {
              "name": "Drinking Water",
              "code": 4
            }, {
              "name": "Showers",
              "code": 5
            }, {
              "name": "Dining",
              "code": 6
            }, {
              "name": "Medical Facility",
              "code": 7
            }, {
              "name": "Ranger Station",
              "code": 8
            }, {
              "name": "RV Parking",
              "code": 9
            }, {
              "name": "Trash Can",
              "code": 10
            }, {
              "name": "Trail Head",
              "code": 0
            }]
          }
        }, {
          "name": "description",
          "type": "esriFieldTypeString",
          "alias": "Description",
          "length": 50,
          "editable": true,
          "nullable": true
        }, {
          "name": "quality",
          "type": "esriFieldTypeInteger",
          "alias": "Quality",
          "editable": true,
          "nullable": true,
          "domain": {
            "name": "dQuality",
            "type": "codedValue",
            "codedValues": [{
              "name": "Excellent",
              "code": 0
            }, {
              "name": "Good",
              "code": 1
            }, {
              "name": "Fair",
              "code": 2
            }, {
              "name": "Poor",
              "code": 3
            }]
          }
        }, {
          "name": "observed",
          "type": "esriFieldTypeDate",
          "alias": "Observed",
          "length": 36,
          "editable": true,
          "nullable": true
        }, {
          "name": "globalid",
          "type": "esriFieldTypeGlobalID",
          "alias": "GlobalID",
          "length": 38,
          "editable": false,
          "nullable": false
        }],
        typeIdField: "facility",
        types: [{
          "id": 0,
          "name": "Trail Head",
          "domains": {
            "facility": {
              "type": "inherited"
            },
            "quality": {
              "type": "inherited"
            }
          },
          "templates": [{
            "name": "Trail Head",
            "description": "",
            "drawingTool": "esriFeatureEditToolPoint",
            "prototype": {
              "symbol": null,
              "attributes": {
                "observed": null,
                "description": null,
                "facility": 0,
                "quality": 0
              }
            }
          }]
        }, {
          "id": 1,
          "name": "Restrooms",
          "domains": {
            "facility": {
              "type": "inherited"
            },
            "quality": {
              "type": "inherited"
            }
          },
          "templates": [{
            "name": "Restrooms",
            "description": "",
            "drawingTool": "esriFeatureEditToolPoint",
            "prototype": {
              "symbol": null,
              "attributes": {
                "observed": null,
                "description": null,
                "facility": 1,
                "quality": 0
              }
            }
          }]
        }, {
          "id": 2,
          "name": "Camping",
          "domains": {
            "facility": {
              "type": "inherited"
            },
            "quality": {
              "type": "inherited"
            }
          },
          "templates": [{
            "name": "Camping",
            "description": "",
            "drawingTool": "esriFeatureEditToolPoint",
            "prototype": {
              "symbol": null,
              "attributes": {
                "observed": null,
                "description": null,
                "facility": 2,
                "quality": 0
              }
            }
          }]
        }, {
          "id": 3,
          "name": "Rest Area",
          "domains": {
            "facility": {
              "type": "inherited"
            },
            "quality": {
              "type": "inherited"
            }
          },
          "templates": [{
            "name": "Rest Area",
            "description": "",
            "drawingTool": "esriFeatureEditToolPoint",
            "prototype": {
              "symbol": null,
              "attributes": {
                "observed": null,
                "description": null,
                "facility": 3,
                "quality": 0
              }
            }
          }]
        }, {
          "id": 4,
          "name": "Drinking Water",
          "domains": {
            "facility": {
              "type": "inherited"
            },
            "quality": {
              "type": "inherited"
            }
          },
          "templates": [{
            "name": "Drinking Water",
            "description": "",
            "drawingTool": "esriFeatureEditToolPoint",
            "prototype": {
              "symbol": null,
              "attributes": {
                "observed": null,
                "description": null,
                "facility": 4,
                "quality": 0
              }
            }
          }]
        }, {
          "id": 5,
          "name": "Showers",
          "domains": {
            "facility": {
              "type": "inherited"
            },
            "quality": {
              "type": "inherited"
            }
          },
          "templates": [{
            "name": "Showers",
            "description": "",
            "drawingTool": "esriFeatureEditToolPoint",
            "prototype": {
              "symbol": null,
              "attributes": {
                "observed": null,
                "description": null,
                "facility": 5,
                "quality": 0
              }
            }
          }]
        }, {
          "id": 6,
          "name": "Dining",
          "domains": {
            "facility": {
              "type": "inherited"
            },
            "quality": {
              "type": "inherited"
            }
          },
          "templates": [{
            "name": "Dining",
            "description": "",
            "drawingTool": "esriFeatureEditToolPoint",
            "prototype": {
              "symbol": null,
              "attributes": {
                "observed": null,
                "description": null,
                "facility": 6,
                "quality": 0
              }
            }
          }]
        }, {
          "id": 7,
          "name": "Medical Facility",
          "domains": {
            "facility": {
              "type": "inherited"
            },
            "quality": {
              "type": "inherited"
            }
          },
          "templates": [{
            "name": "Medical Facility",
            "description": "",
            "drawingTool": "esriFeatureEditToolPoint",
            "prototype": {
              "symbol": null,
              "attributes": {
                "observed": null,
                "description": null,
                "facility": 7,
                "quality": 0
              }
            }
          }]
        }, {
          "id": 8,
          "name": "Ranger Station",
          "domains": {
            "facility": {
              "type": "inherited"
            },
            "quality": {
              "type": "inherited"
            }
          },
          "templates": [{
            "name": "Ranger Station",
            "description": "",
            "drawingTool": "esriFeatureEditToolPoint",
            "prototype": {
              "symbol": null,
              "attributes": {
                "observed": null,
                "description": null,
                "facility": 8,
                "quality": 0
              }
            }
          }]
        }, {
          "id": 9,
          "name": "RV Parking",
          "domains": {
            "facility": {
              "type": "inherited"
            },
            "quality": {
              "type": "inherited"
            }
          },
          "templates": [{
            "name": "RV Parking",
            "description": "",
            "drawingTool": "esriFeatureEditToolPoint",
            "prototype": {
              "symbol": null,
              "attributes": {
                "observed": null,
                "description": null,
                "facility": 9,
                "quality": 0
              }
            }
          }]
        }, {
          "id": 10,
          "name": "Trash Can",
          "domains": {
            "facility": {
              "type": "inherited"
            },
            "quality": {
              "type": "inherited"
            }
          },
          "templates": [{
            "name": "Trash Can",
            "description": "",
            "drawingTool": "esriFeatureEditToolPoint",
            "prototype": {
              "symbol": null,
              "attributes": {
                "observed": null,
                "description": null,
                "facility": 10,
                "quality": 0
              }
            }
          }]
        }]
      },
      _featureLayerId: "Recreation_2700"
    }],
    clear: function() {}
  };

  bdd.describe('test _captureSelect of search widget', function() {
    var wm, map;
    bdd.before(function() {
      wm = TestWidgetManager.getInstance();
      map = TestWidgetManager.getDefaultMap();
      map.setExtent = function() {};
      wm.prepare('theme1', map);
    });

    bdd.beforeEach(function() {
      wm.destroyWidget('search1');
    });


    bdd.it('formated infoTemplate', function() {
      return wm.loadWidget(widgetJson).then(function(widget) {
        wm.openWidget(widget);
        var layerInfosObj = {
          getLayerInfoById: function() {
            return {
              getPopupInfo: function() {
                return {
                  "title": "Facilities: {description}",
                  "fieldInfos": [{
                    "fieldName": "objectid",
                    "label": "OBJECTID",
                    "isEditable": false,
                    "tooltip": "",
                    "visible": false,
                    "stringFieldOption": "textbox",
                    "isEditableOnLayer": false
                  }, {
                    "fieldName": "facility",
                    "label": "Facility",
                    "isEditable": true,
                    "tooltip": "",
                    "visible": true,
                    "format": {
                      "places": 0,
                      "digitSeparator": true
                    },
                    "stringFieldOption": "textbox",
                    "isEditableOnLayer": true
                  }, {
                    "fieldName": "description",
                    "label": "Description",
                    "isEditable": true,
                    "tooltip": "",
                    "visible": true,
                    "stringFieldOption": "textbox",
                    "isEditableOnLayer": true
                  }, {
                    "fieldName": "quality",
                    "label": "Quality",
                    "isEditable": true,
                    "tooltip": "",
                    "visible": true,
                    "format": {
                      "places": 0,
                      "digitSeparator": true
                    },
                    "stringFieldOption": "textbox",
                    "isEditableOnLayer": true
                  }, {
                    "fieldName": "observed",
                    "label": "Observed",
                    "isEditable": true,
                    "tooltip": "",
                    "visible": true,
                    "format": {
                      "dateFormat": "longMonthDayYear"
                    },
                    "stringFieldOption": "textbox",
                    "isEditableOnLayer": true
                  }, {
                    "fieldName": "globalid",
                    "label": "GlobalID",
                    "isEditable": false,
                    "tooltip": "",
                    "visible": false,
                    "stringFieldOption": "textbox",
                    "isEditableOnLayer": false
                  }],
                  "description": "ffff{facility}<br /><br /><a href='http://www.baidu.com?f={facility}'>baidu</a>",
                  "showAttachments": true,
                  "mediaInfos": []
                };
              }
            };
          }
        };

        widget.searchDijit = searchDijit;
        widget.layerInfosObj = layerInfosObj;
        widget.config = searchConfig.config;
        widget._getSourceIndexOfResult = function() {
          return 0;
        };
        var results = widget._captureSelect(searchResult);
        console.log(results);

        assert.strictEqual(results[0].feature.attributes.facility, 1);
      });
    });

    bdd.it('no description infoTemplate', function() {
      return wm.loadWidget(widgetJson).then(function(widget) {
        wm.openWidget(widget);
        var layerInfosObj = {
          getLayerInfoById: function() {
            return {
              getPopupInfo: function() {
                return {
                  "title": "Facilities: {description}",
                  "fieldInfos": [{
                    "fieldName": "objectid",
                    "label": "OBJECTID",
                    "isEditable": false,
                    "tooltip": "",
                    "visible": false,
                    "stringFieldOption": "textbox",
                    "isEditableOnLayer": false
                  }, {
                    "fieldName": "facility",
                    "label": "Facility",
                    "isEditable": true,
                    "tooltip": "",
                    "visible": true,
                    "format": {
                      "places": 0,
                      "digitSeparator": true
                    },
                    "stringFieldOption": "textbox",
                    "isEditableOnLayer": true
                  }, {
                    "fieldName": "description",
                    "label": "Description",
                    "isEditable": true,
                    "tooltip": "",
                    "visible": true,
                    "stringFieldOption": "textbox",
                    "isEditableOnLayer": true
                  }, {
                    "fieldName": "quality",
                    "label": "Quality",
                    "isEditable": true,
                    "tooltip": "",
                    "visible": true,
                    "format": {
                      "places": 0,
                      "digitSeparator": true
                    },
                    "stringFieldOption": "textbox",
                    "isEditableOnLayer": true
                  }, {
                    "fieldName": "observed",
                    "label": "Observed",
                    "isEditable": true,
                    "tooltip": "",
                    "visible": true,
                    "format": {
                      "dateFormat": "longMonthDayYear"
                    },
                    "stringFieldOption": "textbox",
                    "isEditableOnLayer": true
                  }, {
                    "fieldName": "globalid",
                    "label": "GlobalID",
                    "isEditable": false,
                    "tooltip": "",
                    "visible": false,
                    "stringFieldOption": "textbox",
                    "isEditableOnLayer": false
                  }],
                  "description": "",
                  "showAttachments": true,
                  "mediaInfos": []
                };
              }
            };
          }
        };

        widget.searchDijit = searchDijit;
        widget.layerInfosObj = layerInfosObj;
        widget.config = searchConfig.config;
        widget._getSourceIndexOfResult = function() {
          return 0;
        };
        var results = widget._captureSelect(searchResult);
        console.log(results);

        assert.strictEqual(results[0].feature.attributes.facility, "Restrooms");
      });
    });

    bdd.it('no infoTemplate', function() {
      return wm.loadWidget(widgetJson).then(function(widget) {
        wm.openWidget(widget);
        var layerInfosObj = {
          getLayerInfoById: function() {
            return {
              getPopupInfo: function() {
                return null;
              }
            };
          }
        };

        widget.searchDijit = searchDijit;
        widget.layerInfosObj = layerInfosObj;
        widget.config = searchConfig.config;
        widget._getSourceIndexOfResult = function() {
          return 0;
        };
        //_captureSelect will change the global searchResult
        var results = widget._captureSelect(searchResult);
        console.log(results);

        assert.strictEqual(results[0].feature.attributes.facility, "Restrooms");
      });
    });
  });
});