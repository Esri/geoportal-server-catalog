define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/on',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/BaseWidget',
  'dojo/topic',
  'jimu/dijit/Message',
  './LinksProcessor',
  './LayerFactory',
  './WebmapProcessor'],
function(declare, lang, array, on, _WidgetsInTemplateMixin, BaseWidget, topic,
  Message, LinksProcessor, LayerFactory, WebmapProcessor) {
  
  return declare([BaseWidget, _WidgetsInTemplateMixin], {    

    name: 'AddToMap',
    baseClass: 'geoportal-addToMap',

    postCreate: function(){
      this.inherited(arguments);
      //console.warn("AddToMap.postCreate...");

      if (!window.addToMapListener){
        window.addToMapListener = lang.hitch(this,function(params){
          //console.warn("addToMapListener",params);
          this._addLayer(params.type,params.url);
        });
      }
      
      //topic.subscribe("mapLoaded", lang.hitch(this, this.addResource));
      //topic.subscribe("appConfigLoaded", lang.hitch(this, this.addResource));
      //topic.subscribe("appConfigChanged", lang.hitch(this, this.addResource));

      this._checkWindowUrl();
    },
    
    _addLayer: function(linkType,href){
      //console.warn("AddToMap._addLayer...",linkType,href);
      linkType = linkType.toLowerCase();
      if (linkType == "mapserver" || linkType == "featureserver" || linkType == "imageserver" || 
          linkType == "kml" || linkType == "wms") {

        LayerFactory.createLayer(href,linkType).then(lang.hitch(this,function(layer){
          layer.on("error",lang.hitch(this,function(error){
            //new Message({message: "Unable to load: "+href});
            console.warn(error);
          }));
          layer.on("load",lang.hitch(this,function(){
            //console.warn("onLoad",layer);
            /*if(title.length > 0){
            layer.attr("id",title);
            layer.attr("name",title);
            layer.attr("title",title);
            }*/
            //console.warn("AddToMap._addLayer",layer);
            if (layer && layer.declaredClass && layer.declaredClass === "esri.layers.WMSLayer") {
              //console.warn(layer.declaredClass);
              //console.warn(layer.layerInfos);
              var maxLayers = 10, lyrNames = [];
              array.forEach(layer.layerInfos,function(lyrInfo){
                //console.warn("lyrInfo",lyrInfo);
                if (typeof lyrInfo.name === "string" && lyrInfo.name.length > 0) {
                  if (lyrNames.length < maxLayers) lyrNames.push(lyrInfo.name);
                }
              });
              //console.warn("lyrNames",lyrNames);
              if (lyrNames.length <= maxLayers) {
                layer.setVisibleLayers(lyrNames);
              }
            }
            console.warn("AddToMap._addLayer",layer);
            this.map.addLayer(layer);
            //console.log("layer added to map.");
          }));
        }));

      } else if (linkType == "agsrest" || linkType == "ags") { 

        var linksProcessor = new LinksProcessor();
        linkType = linksProcessor.getServiceType(href);

        LayerFactory.createLayer(href,linkType).then(lang.hitch(this,function(layer){              
          this.map.addLayer(layer);
          //console.log("layer added to map.");
        }));

      } else if (linkType == "webmap") { 
        //console.log("webmap processing...");
        var wmProcessor = new WebMapProcessor();
        wmProcessor.process(href,this.map);
        //console.log("webmap operational layers added to map.");
      } 
      //console.groupEnd();
    },

    _checkWindowUrl: function(){
      //console.warn("AddToMap._checkWindowUrl...");
      var queryObject = this._parseParameters();  // window.queryObject; env.js // <-- did not work well, so using above function
      if(queryObject.resource){
        var resource = queryObject.resource; 
        //console.warn("Add to map parameters => " + resource);        
        var title = "";
        if(queryObject.title){
          title = decodeURIComponent(queryObject.title);
        }
        var parts = resource.split(":");
        if(!parts && parts.length<2){
          return;
        }

        var linkType = parts[0].toLowerCase();
        var href = "";
        // loop parameter values in array elements since value may contain ':'
        for(var i=1; i<parts.length; i++){
          if(href.length > 0){
            href += ":";
          }
          href += parts[i]; 
        }
        if (href.length === 0)return;
        this._addLayer(linkType,href);
      }
    },
    
    _parseParameters: function(){
      var query = window.location.search;
      if (query.indexOf('?') > -1) {
        query = query.substr(1);
      }
      var pairs = query.split('&');
      var queryObject = {};
      for(var i = 0; i < pairs.length; i++){
        var splits = decodeURIComponent(pairs[i]).split('=');
        var parameterValue = "";
        // loop parameter values in array elements since value may contain '='
        for(j=1; j<splits.length; j++){
          if(parameterValue.length > 0){
            parameterValue += "=";
          }
          parameterValue += splits[j]; 
        }
        queryObject[splits[0]] = parameterValue;
      }
      return queryObject;
    }

  });
});