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
  "dojo/_base/lang",
  "dojo/promise/all",
  "dojo/Deferred",
  "../util",
  "esri4/PopupTemplate",  
  "esri4/core/reactiveUtils",
  "esri4/layers/GroupLayer",
  "esri4/portal/Portal",
  "esri4/portal/PortalItem"],
function(array, Deferred,lang, all,Deferred,util, PopupTemplate,
		reactiveUtils,GroupLayer,Portal,PortalItem) {
  var _def = {

    addMapLayer: function(view,layer,item,referenceId) {   
      if (view && layer ) {  
    	  if(referenceId)
    	  {
    		  layer.id =  referenceId;
    	  }
	      if (item) {           
	        layer._titleForLegend = item.title;
	     
		      if (typeof layer.title !== "string" || layer.title.length === 0) {
		        layer.title = item.title;
		      }
	      } 
	      view.map.add(layer);
      }
      
    },
    
    getDefaultPortalFieldInfo: function(serviceFieldInfo){
      // serviceFieldInfo: {name,alias,type,...}
      var fieldName = serviceFieldInfo.name;
      var item = {
        fieldName: fieldName,
        label: serviceFieldInfo.alias || fieldName,
        tooltip: "",
        visible: false,
        format: null,
        stringFieldOption: "text-box"
      };

      // https://developers.arcgis.com/javascript/jsapi/field-amd.html#type
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
      var ids = [], referenceIds = [], layers = []; allLayers=[];
      var response = {
        referenceIds: referenceIds,
        layers: layers
      };
      if (!view) {
        return response;
      }
      var checkId = (typeof referenceId === "string" && referenceId.length > 0);
      
      allLayers = view.map.layers.items;
      array.forEach(allLayers, function(lyr) {
	  if (lyr && typeof lyr.id === "string" && lyr.id.length > 0)
		{
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

    newPopupTemplate: function(popupInfo,title,attrTableNotAllowed) {
      if (popupInfo) {
    	if(!title ? (popupTitle = popupInfo.title): (popupTitle=title))    		    		
        try {
	    	let viewInAttrTable = {
	      		  // This text is displayed as a tooltip
	      		  title: "show attribute table",
	      		  // The ID by which to reference the action in the event
					// handler
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
	            actions:(!attrTableNotAllowed ? [viewInAttrTable]:[])
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
    
    waitForLayer: function(i18n,layer) {
        var dfd = new Deferred();
        var handles = [];
        if (layer.loaded) {
          dfd.resolve(layer);
          return dfd;
        }
        if (layer.loadStatus ==="failed") {
          dfd.reject(layer.loadError);
          return dfd;
        }
        var clearHandles = function() {
          array.forEach(handles, function(h) {
            h.remove();
          });
        };
        
        handles.push(reactiveUtils.when(() => layer.loaded === true, () => {        	
        	clearHandles();
            dfd.resolve(layer);
            }));
          
   
        handles.push(reactiveUtils.when(() => layer.loadStatus ==="failed", () =>{        
          clearHandles();
          var error = layer.loadError;
          try {           
              console.warn("layerAccessError", error);
              dfd.reject(new Error(i18n.search.layerInaccessible));           
          } catch (ex) {
            // console.warn("layerAccessError",ex);
            dfd.reject(error);
          }
        }));
        return dfd;
    },
    
    setGroupLayerPopupTemplate:function(groupLyr,itemData)
    {   	  
      array.forEach(groupLyr.allLayers._items, lang.hitch(this,function(layer) { 
        var cfgLyr = null;       
      	
	      array.some(itemData.layers, function(portalItemLayer) {
	        if (layer.title === portalItemLayer.title) {
	          cfgLyr = portalItemLayer;
	          return true;
	        }
	      });
        
        var popupInfo = null;
        
        if (cfgLyr && cfgLyr.popupInfo) {
          popupInfo = cfgLyr.popupInfo;
        }
        if (popupInfo) {
        	layer.popupTemplate = this.newPopupTemplate(popupInfo,cfgLyr.name);        	
        }
      }));
    },
      
      setMapServicePopupTemplate:function(lyr,itemData)
      { 
    	 
    	  var popupSet = false;
        array.forEach(lyr.allSublayers._items, lang.hitch(this,function(sublayer) { 
          var cfgLyr = null;
          if (itemData && itemData.data) {
        	  itemDataObj = itemData.data;
        	
            array.some(itemDataObj.layers, function(l) {
              if (sublayer.id === l.id) {
                cfgLyr = l;
                return true;
              }
            });
          }
          var popupInfo = null;
          
          if (cfgLyr && cfgLyr.popupInfo) {
            popupInfo = cfgLyr.popupInfo;
          }
          if (popupInfo) {
          	sublayer.popupTemplate = this.newPopupTemplate(popupInfo,cfgLyr.name);
          	popupSet= true;
          }
        }));
        if(!popupSet)
        {
      	  this._setDynamicLayerPopupTemplates(lyr);
         }
      },
      _setDynamicLayerPopupTemplates: function(layer) {
          var self = this, templates = null, dfds = [];

          var readLayer = function(lInfo) {
        	
            var dfd = util.readRestInfo(layer.url + "/" + lInfo.id);
            dfd.then(function(response){
              var result = response.data; 
              try {
                var popupInfo = self.newPopupInfo(result);
                if (popupInfo) {            	
                	lInfo.popupTemplate = self.newPopupTemplate(popupInfo);
                }
              } catch(exp) {
                console.warn("Error setting popup.");
                console.error(exp);
              }
            });
            return dfd;
          };

          if (!layer.popupTemplate) {
            array.forEach(layer.allSublayers._items, function(lInfo) {   
              if (!lInfo.popupTemplate) {
                dfds.push(readLayer(lInfo));
              }
            });
          }
          if (dfds.length > 0) {
            all(dfds).then(function(){
            	console.log("popup set for all sublayers");
            }).catch(function(ex){
              console.warn("Error reading sublayers.");
              console.error(ex);
            });
          }
        },
        
        addGroupLayer: function(itemUrl,itemId,itemDataObj,view, referenceId) {
            var itemData;
            var dfd = new Deferred();   
            var self = this;
            var portalBaseUrl;
            if(itemDataObj)
          	  itemData = itemDataObj.data;
          if(!itemData)
    	  {
        	  let idIndex = itemUrl.indexOf("?id=");
          	  let itemId = itemUrl.substring(idIndex+4);
          	  
          	  if(itemUrl.indexOf("arcgis.com")>-1)
        	  {
          		itemInfoUrl = "https://www.arcgis.com/sharing/rest/content/items/"+itemId;
        	  }//On Premise Portal
          	  else{
        		  let homeIndex = itemUrl.indexOf("/home");
        		  portalBaseUrl = itemUrl.substring(0,homeIndex);
        		  itemInfoUrl = portalBaseUrl+"/sharing/rest/content/items/"+itemId;
        	  }
          	var readItemJson = util.readItemJsonData(itemInfoUrl);
          	readItemJson.then(function(itemDataObj){
        		  dfd = self.addGroupLayerToMap(itemId,itemDataObj.data,view,null,portalBaseUrl);
        		  dfd.then(function(result){
        			  dfd.resolve(result);
        		  })
        	}); 	  
    	  }
          else if(itemData && itemData.layers)
      	  {
        	  dfd = self.addGroupLayerToMap(itemId,itemData,view,referenceId);
      	  }
           return dfd.promise;
      },
       addGroupLayerToMap:function(itemId,itemData,view,referenceId,portalBaseUrl)
        {
        	var self = this;
        	let arcGisPortal;
        	if(portalBaseUrl)
    		{
        		arcGisPortal = new Portal({
          		  url: portalBaseUrl
          		});
    		}
        	else
    		{
        		arcGisPortal = new Portal({
            		  url: "https://www.arcgis.com" 
            		});
    		}
        	let item = new PortalItem({
        		  id: itemId,
        		  portal: arcGisPortal // This loads the item
        		});
        	
        	var groupLayer = new GroupLayer({
        		  title: itemData.title, 
        		  portalItem: item
        		
        		});
        	  groupLayer.load();
        	  var dfd = self.waitForLayer(self.i18n,groupLayer);
              dfd.then(function(layer) {  
              	self.setGroupLayerPopupTemplate(layer,itemData);
              	self.addMapLayer(view,layer,null,referenceId);
                dfd.resolve(layer);
              });
            return dfd;
        }
  };

  return _def;

});
