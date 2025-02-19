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
define(["dojo/_base/array",
  "dojo/Deferred",
  "../util",
  "esri4/PopupTemplate",  
  "esri4/core/reactiveUtils"],
function(array, Deferred, util, /*agsUtils, InfoTemplate,*/ PopupTemplate,
		reactiveUtils) {
  var _def = {

    addMapLayer: function(view,layer,item,referenceId) {
      //console.warn("_addLayer",layer);
      //console.warn("map",this.map);
      if (view && layer) {
        //layer.xtnAddData = true; // TODO?
    	 layer.id =  referenceId;
        if (item) {
//          layer.xtnItemId = item.id; // TODO confirm with Urban
//          layer.xtnReferenceId = referenceId; // TODO?
          //console.log("layer.xtnReferenceId",layer.xtnReferenceId);
          if (!layer.arcgisProps && item) {
            layer.arcgisProps = {
              title: item.title
            };
            layer._titleForLegend = item.title;
          }
          if (typeof layer.title !== "string" || layer.title.length === 0) {
            layer.title = item.title;
          }
          
        }
        view.map.add(layer);
      }
    },

    checkUrl: function(url) {
      //return agsUtils._checkUrl(url);
    },

    getDefaultPortalFieldInfo: function(serviceFieldInfo){
      //serviceFieldInfo: {name,alias,type,...}
      var fieldName = serviceFieldInfo.name;
      var item = {
        fieldName: fieldName,
        label: serviceFieldInfo.alias || fieldName,
        tooltip: "",
        visible: false,
        format: null,
        stringFieldOption: "text-box"
      };

      //https://developers.arcgis.com/javascript/jsapi/field-amd.html#type
      var type = serviceFieldInfo.type;
      switch (type) {
        case "esriFieldTypeSmallInteger":
        case "esriFieldTypeInteger":
          item.format = {
            places: 0,
            digitSeparator: true
          };
          break;
        case "esriFieldTypeSingle":
        case "esriFieldTypeDouble":
          item.format = {
            places: 2,
            digitSeparator: true
          };
          break;
        case "esriFieldTypeDate":
          item.format = {
            dateFormat: "long-month-day-year"
          };
          break;
      }
      return item;
    },

    findLayersAdded: function(view,referenceId) {
      var ids = [], referenceIds = [], layers = [];
      var response = {
        referenceIds: referenceIds,
        layers: layers
      };
      if (!view) {
        return response;
      }
      var checkId = (typeof referenceId === "string" && referenceId.length > 0);
      
      array.forEach(view.map.layers.items, function(item) {
          ids.push(item.id);
        });

        array.forEach(ids, function(id) {
          var lyr = view.map.findLayerById(id);
          if (lyr && typeof lyr.id === "string" &&
              lyr.id.length > 0) {
            //console.warn("found added layer",lyr);
            if (!checkId || lyr.id === referenceId) {
              layers.push(lyr);
              if (referenceIds.indexOf(lyr.id) === -1) {
                referenceIds.push(lyr.id);
              }
            }
          }
        });
      return response;
    },

    newPopupTemplate: function(popupInfo,title) {
      if (popupInfo) {
    	if(!title ? (popupTitle = popupInfo.title): (popupTitle=title))    		    		
        try {
	    	let viewInAttrTable = {
	      		  // This text is displayed as a tooltip
	      		  title: "View in attribute table",
	      		  // The ID by which to reference the action in the event handler
	      		  id: "view-attribute-table",
	      		  // Sets the icon font used to style the action button
	      		  className: "esri-icon-table"
	      		};
	          var popupTemplate = new PopupTemplate({
	            description: popupInfo.description,
	            title: popupTitle,
	            content:[{
	                	type:"fields",
	                	fieldInfos: popupInfo.fieldInfos
	            	},
	            	{
	            		type:"media",
	            		mediaInfos: popupInfo.mediaInfos	
	            	},
	            	{
	            		type:"attachments"
	            	}
	            ],
	            actions:[viewInAttrTable]
	          });

        	
          return popupTemplate;
        } catch (ex) {
          console.error(ex);
        }
      }     
      return popupTemplate;
    },

    newPopupInfo: function(object,title) {
      var self = this;
      if (object && object.fields) {
        var popupInfo = {
          title: object.name,
          fieldInfos: [],
          description: null,
          showAttachments: true,
          mediaInfos: []
        };
        if (typeof title === "string" && title.length > 0) {
          popupInfo.title = title;
        }
        array.forEach(object.fields,function(field){
          var fieldInfo = self.getDefaultPortalFieldInfo(field);
          fieldInfo.visible = true;
          fieldInfo.isEditable = field.editable;
          popupInfo.fieldInfos.push(fieldInfo);
        });
        return popupInfo;
      }
      return null;
    },
    
    //TODO check later, most probably it will be redundant after layer type fixes
//    waitForLayer: function(i18n,layer) {
//        var dfd = new Deferred();
//        var handles = [];
//        if (layer.loaded) {
//          dfd.resolve(layer);
//          return dfd;
//        }
//        if (layer.loadStatus ==="failed") {
//          dfd.reject(layer.loadError);
//          return dfd;
//        }
//        var clearHandles = function() {
//          array.forEach(handles, function(h) {
//            h.remove();
//          });
//        };
//        //console.warn("_waitForLayer");
//        handles.push(reactiveUtils.when(() => layer.loaded === true, () => {        	
//        	clearHandles();
//            dfd.resolve(layerLoaded.layer);
//            }));
//          
//   
//        handles.push(reactiveUtils.when(() => layer.loadStatus ==="failed", () =>{
//          //console.warn("_waitForLayer.error",layerError);
//          clearHandles();
//          var error = layerError.error;
//          try {           
//              console.warn("layerAccessError", error);
//              dfd.reject(new Error(i18n.search.layerInaccessible));           
//          } catch (ex) {
//            //console.warn("layerAccessError",ex);
//            dfd.reject(error);
//          }
//        }));
//        return dfd;
//      }

//    waitForLayer: function(i18n,layer) {
//      var dfd = new Deferred();
//      var handles = [];
//      if (layer.loaded) {
//        dfd.resolve(layer);
//        return dfd;
//      }
//      if (layer.loadError) {
//        dfd.reject(layer.loadError);
//        return dfd;
//      }
//      var clearHandles = function() {
//        array.forEach(handles, function(h) {
//          h.remove();
//        });
//      };
//      //console.warn("_waitForLayer");
//      handles.push(layer.on("load", function(layerLoaded) {
//        //console.warn("_waitForLayer.load",layerLoaded);
//        clearHandles();
//        dfd.resolve(layerLoaded.layer);
//      }));
//      handles.push(layer.on("error", function(layerError) {
//        //console.warn("_waitForLayer.error",layerError);
//        clearHandles();
//        var error = layerError.error;
//        try {
//          if (error.message && (error.message.indexOf("Unable to complete") !== -1)) {
//            console.warn("layerAccessError", error);
//            dfd.reject(new Error(i18n.search.layerInaccessible));
//          } else {
//            dfd.reject(error);
//          }
//        } catch (ex) {
//          //console.warn("layerAccessError",ex);
//          dfd.reject(error);
//        }
//      }));
//      return dfd;
//    }

  };

  return _def;

});
