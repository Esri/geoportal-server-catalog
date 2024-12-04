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
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/promise/all',
  'dojo/string',
  'esri/arcade/arcade',
  'esri/arcade/Feature',
  'esri/graphic',
  'esri/tasks/RelationshipQuery',
  'jimu/utils',
  'jimu/LayerStructure'
],
function(
  array, lang, Deferred, all, string,
  Arcade, ArcadeFeature,
  Graphic, RelationshipQuery, jimuUtils, LayerStructure) {
  var mo = {};
  /*------------------------------------------------------------------------------------------------------------------*/
  /********read arcade expr info*********/
  mo.readExprInfo = {};
  //public functions
  /** Get arcade profiles by type.
  * @param {string} type, arcade profile types, it could be three types:render, label, infoTemplate.
                          it's optional, if no type or wrong type, it retruns all the profiles.
  * @return {object} when type is one of the three strings above.
                     format: {render:[],label:[],infoTemplate:[]}
            {array}  when type is none or others, every item in array is a object.
                     item's format depends on the type of arcade profile's type.
                     eg: infoTemplate's format is {layer:'layerId',expressionInfos:[]}
                     //https://developers.arcgis.com/javascript/3/jshelp/arcade.html#popups
  */
  mo.readExprInfo.getArcadeProfilesByType = function(map, operlayer, /* optional */ type){
    var args = {
      map: map,
      layer: operlayer
    };
    if(type === 'render'){
      return mo.readExprInfo._getArcadeRender(args);
    }else if(type === 'label'){
      return mo.readExprInfo._getArcadeLabel(args);
    }else if(type === 'infoTemplate'){
      return mo.readExprInfo._getArcadeInfoTemplate(args);
    }else{
      return mo.readExprInfo._getAllArcade(args);
    }
  };

  //private functions
  mo.readExprInfo._getArcadeRender = function(args) {
    return mo.readExprInfo._lookupArcadeRender({layers: mo.readExprInfo._checkPassInLayer(args)});
  };

  mo.readExprInfo._getArcadeInfoTemplate = function(args) {
    return mo.readExprInfo._lookupArcadeInfoTemplate({layers: mo.readExprInfo._checkPassInLayer(args)});
  };

  mo.readExprInfo._getArcadeLabel = function(args) {
    return mo.readExprInfo._lookupArcadeLabel({layers: mo.readExprInfo._checkPassInLayer(args)});
  };

  mo.readExprInfo._getAllArcade = function(args) {
    var render = mo.readExprInfo._getArcadeRender(args);
    var infoTemplate = mo.readExprInfo._getArcadeInfoTemplate(args);
    var label = mo.readExprInfo._getArcadeLabel(args);
    // var arcadeObj = Object.assign(infoTemplate, render, label);
    // return arcadeObj;
    return {
      render: render,
      infoTemplate: infoTemplate,
      label: label
    };
  };

  mo.readExprInfo._checkPassInLayer = function(args) {
    var layerList = [];
    if(typeof(args) !== 'undefined') {
      if(typeof(args.layer) !== 'undefined') {
        if((args.layer !== null) && (args.layer !== '')) {
          //layerList.push(args.layer);
          layerList = mo.readExprInfo._getAllMapLayers(args);
        } else {
          layerList = mo.readExprInfo._getAllMapLayers();
        }
      } else {
        layerList = mo.readExprInfo._getAllMapLayers();
      }
    } else {
      layerList = mo.readExprInfo._getAllMapLayers();
    }
    return layerList;
  };

  //This gets all the operational layers and gets the info and places it in a custom data object.
  mo.readExprInfo._getAllMapLayers = function(args) {
    var lookupId = "";
    var layerList = [];
    var layerStructure = LayerStructure.getInstance();
    // if(typeof(args) !== 'undefined') {
    if(args && args.layer) {
      lookupId = args.layer.id;
    }
    if(lookupId !== "") {
      var foundLayer = layerStructure.getNodeById(lookupId);
      // if(foundLayer !== 'undefined') {
      if(foundLayer) {
        layerList.push(foundLayer._layerInfo.layerObject);
      }
    } else {
      //No layer ID passed in, just get all layers.
      layerStructure.traversal(function(layerNode) {
        //check to see if type exist and if it's not any tiles
        if(typeof(layerNode._layerInfo.layerObject.type) !== 'undefined') {
          if((layerNode._layerInfo.layerObject.type).indexOf("tile") === -1) {
            layerList.push(layerNode._layerInfo.layerObject);
          }
        } else {
          //It is a grouped Map service
          layerList.push(layerNode._layerInfo.layerObject);
        }
      });
    }
    return layerList;
  };

  mo.readExprInfo._lookupArcadeRender = function(args) {
    var lyrArcadeExpr = [];
    if(args.layers.length > 0) {
      array.forEach(args.layers, lang.hitch(this, function(layer) {
        var expObj = {};
        //Only add if there is a renderer object, maps services do not have this.
        if(typeof(layer.renderer) !== 'undefined') {
          var lyrObjRender = layer.renderer;
          if(typeof(lyrObjRender.valueExpression) !== 'undefined') {
            expObj.layer = layer.id;
            expObj.valueExpression = lyrObjRender.valueExpression;
            expObj.valueExpressionTitle = lyrObjRender.valueExpressionTitle;
            if(typeof(lyrObjRender.values) !== 'undefined') {
              expObj.values = lyrObjRender.values;
            }
            if(typeof(lyrObjRender.visualVariables) !== 'undefined') {
              expObj.visualVariables = lyrObjRender.visualVariables;
            }
          }
          if(Object.keys(expObj).length > 1 && expObj.constructor === Object) {
            lyrArcadeExpr.push(expObj);
          }else{ //if layer has no arcade expressionInfos
            lyrArcadeExpr.push({
              layer: layer.id,
              valueExpression: null,
              valueExpressionTitle: null,
              values: null,
              visualVariables: null
            });
          }
        }
      }));
    }
    return lyrArcadeExpr;
  };

  mo.readExprInfo._lookupArcadeInfoTemplate = function(args) {
    var lyrArcadeExpr = [];
    if(args.layers.length > 0) {
      array.forEach(args.layers, lang.hitch(this, function(layer) {
        var expObj = {};
        //InfoTemplate handling for feature layers
        if(typeof(layer.infoTemplate) !== 'undefined') {
          if(typeof(layer.infoTemplate.info.expressionInfos) !== 'undefined') {
            if(layer.infoTemplate.info.expressionInfos.length > 0) {
              expObj.layer = layer.id;
              expObj.expressionInfos = layer.infoTemplate.info.expressionInfos;
            }
          }
        } else {
          //feature handling for map service
          if(typeof(layer.infoTemplates) !== 'undefined') {
            //check if it template is arcade and only store it if it is.
            //Arcade is stored in the group level, not sublayers
            for (var key in layer.infoTemplates) {
              if((layer.infoTemplates).hasOwnProperty(key)) {
                if(typeof(layer.infoTemplates[key].infoTemplate.info.expressionInfos) !== 'undefined') {
                  var arcadeNode = layer.infoTemplates[key].infoTemplate;
                  if(arcadeNode.info.expressionInfos.length > 0) {
                    expObj.layer = layer.id;
                    expObj.expressionInfos = arcadeNode.info.expressionInfos;
                  }
                }
              }
            }
          } else {
            //no infoTemplates defined
          }
        }
        if(Object.keys(expObj).length > 1 && expObj.constructor === Object) {
          lyrArcadeExpr.push(expObj);
        }else{ //if layer has no arcade expressionInfos
          lyrArcadeExpr.push({
            layer: layer.id,
            expressionInfos: null
          });
        }

      }));
    }
    return lyrArcadeExpr;
  };

  mo.readExprInfo._lookupArcadeLabel = function(args) {
    var lyrArcadeExpr = [];
    if(args.layers.length > 0) {
      array.forEach(args.layers, lang.hitch(this, function(layer) {
        var expObj = {};
        var lyrObj = layer;
        if(typeof(lyrObj.labelingInfo) !== 'undefined') {
          array.forEach(lyrObj.labelingInfo, lang.hitch(this, function(labelInfo) {
            //check if 'name' exists, it is present when Arcade is used
            if(typeof(labelInfo.name) !== 'undefined') {
              expObj.layer = layer.id;
              expObj.name = labelInfo.name;
              expObj.labelingInfo = labelInfo;
              expObj.expression = labelInfo.labelExpressionInfo.expression;
            }
          }));
        }
        if(Object.keys(expObj).length > 1 && expObj.constructor === Object) {
          lyrArcadeExpr.push(expObj);
        }else{ //if layer has no arcade expressionInfos
          lyrArcadeExpr.push({
            layer: layer.id,
            name: null,
            labelingInfo: null,
            expression: null
          });
        }
      }));
    }
    return lyrArcadeExpr;
  };


  /********************custom arcade expression***********************/
  mo.customExpr = {};
  /**
  * Get one graphic's all attributes by custom expressionInfos.
  * @param {array} expressionInfos, every item is an object, likes: {name,title,expression}
  * @param {object} graphic, it contains geometry, a symbol, attributes, or an infoTemplate
  * @return {object} attributes object, including orginal attributes and custom arcade attributes
  */
  mo.customExpr.getAttributesFromCustomArcadeExpr = function (expressionInfos, graphic) {
    var arcadeFeature = new ArcadeFeature(graphic, graphic.geometry);
    var parsedExprs = mo.InfoTemplate._parseArcadeExpressions(expressionInfos);
    var graphicAttrs = mo.InfoTemplate._combineFeatureAttributesAndExpressionResolutions(arcadeFeature, parsedExprs);
    return graphicAttrs;
  };

  /**
  * Get Graphics's attributes value list by custom expressionInfos.
  * @param {array} expressionInfos, every item is an object, likes: {name,title,expression}
  * @param {array} graphicList, graphic object array.
  * @return {array} every item in array is an object, it contains the attributes's values by custom expressionInfos.
  */
  mo.customExpr.getAttributesValueFromCustomArcadeExprBatch = function (expressionInfos, graphicList) {
    var arcadeFeatures = [];
    for(var key in graphicList){
      arcadeFeatures.push(new ArcadeFeature(graphicList[key], graphicList[key].geometry));
    }
    var parsedExprs = mo.InfoTemplate._parseArcadeExpressions(expressionInfos);

    var customExprTemplates = mo.InfoTemplate._getExprNamesArrayFromPopupExprInfos(expressionInfos);
    customExprTemplates.relationships = null;
    customExprTemplates.parsedExpressions = parsedExprs;

    var def = new Deferred();
    var labelDef = mo.InfoTemplate._getPopupFieldsValueFromArcadeFeatures(arcadeFeatures, customExprTemplates);
    labelDef.then(function(customFieldsValueArray){
      def.resolve(customFieldsValueArray);
    });
    return def;
  };


  /********************Render***********************/


  /********************Label***********************/


  /********************InfoTemplate***********************/
  mo.InfoTemplate = {};
  /**
  * Get one graphic's all attributes.
  * @param {object} graphic, it contains geometry, a symbol, attributes, or an infoTemplate
  * @return {object} attributes object, including orginal attributes and arcade attributes
                     format:{'OBJECTID':1, 'expression/expr1':"394-Waterous", 'relationships/0/CHAINS':123}
  */
  mo.InfoTemplate.getAttributesFromInfoTemplate = function (map, operlayer, graphic) {
    var arcadeFeature = new ArcadeFeature(graphic, graphic.geometry);

    var arcadeTemplate = mo.readExprInfo.getArcadeProfilesByType(map, operlayer, 'infoTemplate');
    var expressionInfos = arcadeTemplate[0].expressionInfos;
    if(!expressionInfos){
      return graphic.attributes;
    }
    var parsedExprs = mo.InfoTemplate._parseArcadeExpressions(expressionInfos);
    var graphicAttrs = mo.InfoTemplate._combineFeatureAttributesAndExpressionResolutions(arcadeFeature, parsedExprs);
    return graphicAttrs;
  };

  /**
  * Get Graphics's attributes value list which configurate in InfoTemplate.
  * @param {array} graphicList, graphic object array.
  * @return {array} every item in array is an object
                    it contains the attributes's values which configurate in InfoTemplate.
                    format:[["278-Waterous","Waterous---str"],["279-Clow Corporation","Clow Corporation---str"]]
  */
  mo.InfoTemplate.getAttributesValueFromInfoTemplateBatch = function (map, operlayer, graphicList) {
    var arcadeFeatures = [];
    for(var key in graphicList){
      arcadeFeatures.push(new ArcadeFeature(graphicList[key], graphicList[key].geometry));
    }
    var arcadeTemplate = mo.readExprInfo.getArcadeProfilesByType(map, operlayer, 'infoTemplate');
    var expressionInfos = arcadeTemplate[0].expressionInfos;
    var def = new Deferred();
    if(!expressionInfos){//layer has no arcade infotemplate
      def.resolve([]);
      return def;
    }
    var parsedExprs = mo.InfoTemplate._parseArcadeExpressions(expressionInfos);
    var popupExprTemplates = null;
    var popupDesc = operlayer.popupInfo.description;
    //from popupDesc
    if(popupDesc !== null){
      popupExprTemplates = mo.InfoTemplate._convertPopupDescToFieldNamesArray(popupDesc);
      popupExprTemplates.relationships = mo.InfoTemplate._getRelationshipQueries(operlayer);
    }else{ //from expressionInfos
      popupExprTemplates = mo.InfoTemplate._getExprNamesArrayFromPopupExprInfos(expressionInfos);
      popupExprTemplates.relationships = null; //doesn't support relationships in this case.
    }
    //add parsedExpr
    popupExprTemplates.parsedExpressions = parsedExprs;

    var labelDef = mo.InfoTemplate._getPopupFieldsValueFromArcadeFeatures(arcadeFeatures, popupExprTemplates);
    labelDef.then(function(popupFieldsValueArray){
      def.resolve(popupFieldsValueArray);
    });
    return def;
  };

  // Get relationshipQueries from a layer.
  mo.InfoTemplate._getRelationshipQueries = function (operLayer) {
    var hasRelationships = false, relationships = {}, relationshipFieldPattern = /\{relationships\/\d+\//gm,
      relationshipIdPattern = /\d+/, matches;

    matches = operLayer.popupInfo.description.match(relationshipFieldPattern);
    if (matches) {
      hasRelationships = true;
      array.forEach(matches, function (match) {
        var relatedQuery, id = match.match(relationshipIdPattern)[0];
        if (!relationships.hasOwnProperty(id)) {
          relatedQuery = new RelationshipQuery();
          relatedQuery.outFields = ['*'];
          relatedQuery.relationshipId = id;
          relatedQuery.returnGeometry = false;
          relationships[id] = {
            operLayer: operLayer,
            relatedQuery: relatedQuery
          };
        }
      });
    }
    return hasRelationships? relationships : null;
  };

  /**
   * Converts the arcade exprs obj of a custom popup into a multiline label specification;
   * @param {array} popupExprInfos, an arry of objects by customing popup arcade exprs in configuration.
                                    every object, likes: {name,title,expression}
   * @return {array} an array of exprs's name, format: ["${expression/expr1}"]
   */
  mo.InfoTemplate._getExprNamesArrayFromPopupExprInfos = function (popupExprInfos) {
    var exprNames = [];
    for(var key in popupExprInfos){
      var exprName = popupExprInfos[key].name;
      exprNames.push('${expression/' + exprName + '}');
    }
    return exprNames;
  };

  /**
   * Converts the text of a custom popup into an array of fields's name.
   * conversion splits text into lines on <br>s,
   * removes HTML tags, and changes field tags from popup style to string.substitute form.
   * @param {string} popupDesc, popup's descriptions.
   * format: "<font face='Arial' size='3'>{OBJECTID}<br />{relationships/0/Creator}<br />{expression/expr0}</font>"
   * @return {array} an array of fields' name
   * format: ["${OBJECTID}","${relationships/0/CreationDate}","${expression/expr0}"]
   */
  mo.InfoTemplate._convertPopupDescToFieldNamesArray = function (popupDesc) {
    // e.g., Occupant<br/>{FULLADDR}<br />{MUNICIPALITY}, IL {PSTLZIP5}
    // Sanitize the description after converting <br>s and </p>s to line breaks
    var descEOLs1 = mo.InfoTemplate._convertEndParasToEOLs(popupDesc);
    var descEOLs2 = mo.InfoTemplate._convertBreaksToEOLs(descEOLs1);
    var desc = mo.InfoTemplate._sanitizeNoTags(descEOLs2).trim();

    // Change the open brace used for attribute names to "${" so that we can use dojo/string's substitute()
    desc = desc.replace(/\{/gi, '${');

    // Remove non-breaking spaces, which aren't rendered correctly in CSV output and aren't needed in PDF output
    desc = desc.replace(/\u00a0/gi, ' ');

    // Split on the line breaks
    desc = desc.split('\n');

    // Trim each line, since HTML pretty much does that
    desc = array.map(desc, function (line) {
      return line.trim();
    });

    return desc;
  };

  /**
   * Removes HTML tags from string.
   * @param {string} taggedText String to clean
   * @return {string} Cleaned string
   */
  mo.InfoTemplate._sanitizeNoTags = function (taggedText) {
    var cleanedText, tagBody, tagOrComment;

    cleanedText = jimuUtils.sanitizeHTML(taggedText);

    // Remove remaining tags
    // From Stack Overflow https://stackoverflow.com/a/430240/5090610
    // CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/)
    // Mike Samuel (https://stackoverflow.com/users/20394/mike-samuel)
    tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';
    tagOrComment = new RegExp(
        '<(?:' +
        // Comment body.
        '!--(?:(?:-*[^->])*--+|-?)' +
        // Special "raw text" elements whose content should be elided.
        '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*' +
        '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*' +
        // Regular name
        '|/?[a-z]' +
        tagBody +
        ')>',
        'gi');
    function removeTags(html) {
      var oldHtml;
      do {
        oldHtml = html;
        html = html.replace(tagOrComment, '');
      } while (html !== oldHtml);
      return html.replace(/</g, '&lt;');
    }

    cleanedText = removeTags(cleanedText);
    return cleanedText;
  };

  /**
   * Creates fields's value from popup configuration by arcade features.
   * @param {array} features, Arcade features whose attributes are to be
   *        used to populate labels
   * @param {array} popupExprTemplates as created by _convertPopupDescToFieldNamesArray
     format: [
      "${OBJECTID}","${relationships/0/CreationDate}","${expression/expr0}",
      relationships: as created by _getRelationshipQueries,
      parsedExpressions: as created by _parseArcadeExpressions
      ]
    * @return {Deferred} Array of labels; each label is an array of label line strings
    */
  mo.InfoTemplate._getPopupFieldsValueFromArcadeFeatures = function (features, popupExprTemplates) {
    var deferred = new Deferred(), content = [], promises = [], relatedRecordsFound = 0;

    if (popupExprTemplates.relationships) {
      // For each feature,
      array.forEach(features, function (feature) {

        // For each relationship in the label,
        mo.InfoTemplate._objEach(popupExprTemplates.relationships, function (relationship, relationshipId) {
          var promise = new Deferred(), relatedQuery = relationship.relatedQuery, objectId;
          promises.push(promise);

          // Query the relationship for this feature
          objectId = feature.attributes[relationship.operLayer.layerObject.objectIdField];
          relatedQuery.objectIds = [objectId];
          relationship.operLayer.layerObject.queryRelatedFeatures(relatedQuery, function (relatedRecords) {
            var labels = [], relatedFeatures;

            if (relatedRecords[objectId] && relatedRecords[objectId].features) {
              relatedFeatures = relatedRecords[objectId].features;

              array.forEach(relatedFeatures, function (relatedFeature) {
                var labelLines = [], attributes, prefix, newKey, featureWithRelationshipAttribs;

                // Merge the base and related feature attributes and create the label
                // Prefix related feature's attributes with "relationships/<id>/" to match popup
                attributes = feature.attributes;
                prefix = 'relationships/' + relationshipId + '/';
                mo.InfoTemplate._objEach(relatedFeature.attributes, function (value, key) {
                  newKey = prefix + key;
                  attributes[newKey] = value;
                });

                featureWithRelationshipAttribs = new Graphic(feature.geometry, null, attributes);

                // Substitute attribute values and resolved Arcade expressions into label lines
                array.forEach(popupExprTemplates, function (labelLineRule) {
                  labelLines.push(string.substitute(labelLineRule,
                    mo.InfoTemplate._combineFeatureAttributesAndExpressionResolutions(
                      featureWithRelationshipAttribs, popupExprTemplates.parsedExpressions),
                    mo.InfoTemplate._useEmptyStringForNull));
                });
                labels.push(labelLines);
              });
            }

            promise.resolve(labels);
          });
        });
      });

      all(promises).then(function (results) {
        // Look at the related records for each found address
        array.forEach(results, function (labels) {
          // For each found address, save its labels
          array.forEach(labels, function (labelLines) {
            ++relatedRecordsFound;
            content.push(labelLines);
          });
        });
        console.log(relatedRecordsFound + ' related address features found');
        deferred.resolve(content);
      });

    }else {
      array.forEach(features, function (feature) {
        var labelLines = [];
        // Substitute attribute values and resolved Arcade expressions into label lines
        array.forEach(popupExprTemplates, function (labelLineRule) {
          labelLines.push(string.substitute(labelLineRule,
            mo.InfoTemplate._combineFeatureAttributesAndExpressionResolutions(
              feature, popupExprTemplates.parsedExpressions),
            mo.InfoTemplate._useEmptyStringForNull));
        });
        content.push(labelLines);
      });
      deferred.resolve(content);
    }

    return deferred;
  };

  /**
   * Parses Arcade expression infos.
   * @param {array} expressionInfos Expression info list from popupInfo
   * @return {object} List of parsed expressions keyed by the expression name
   */
  mo.InfoTemplate._parseArcadeExpressions = function (expressionInfos) {
    var parsedExpressions;
    if (Array.isArray(expressionInfos) && expressionInfos.length > 0) {
      parsedExpressions = {};
      array.forEach(expressionInfos, function (info) {
        parsedExpressions[info.name] = Arcade.parseScript(info.expression);
      });
    }
    return parsedExpressions;
  };

  /**
   * Initializes the Arcade context with an ArcadeFeature.
   * @param {object} feature Feature to convert into an ArcadeFeature and to add to the context's vars object
   * @return {object} Arcade context object
   */
  mo.InfoTemplate._initArcadeContext = function (feature) {
    var context = {
      vars: {}
    };
    context.vars.$feature = new ArcadeFeature(feature);
    return context;
  };

  /**
   * Creates a list of feature attributes and resolved Arcade expressions for the feature.
   * @param {object} feature Feature whose attributes are to be used
   * @param {object} parsedExpressions Parsed Arcade expressions keyed by the expression name; each expression
   *        is resolved and added to the output object keyed by 'expression/' + the expression's name
   * @return {object} Combination of feature attributes and resolved expressions
   */
  mo.InfoTemplate._combineFeatureAttributesAndExpressionResolutions = function (feature, parsedExpressions) {
    var attributesAndExpressionResolutions, arcadeContext, name, resolvedExpression;

    // Resolve Arcade expressions for this feature; convert to string in case its return type is not already string
    attributesAndExpressionResolutions = lang.mixin({}, feature.attributes);
    if (parsedExpressions) {
      arcadeContext = mo.InfoTemplate._initArcadeContext(feature);

      for (name in parsedExpressions) {
        resolvedExpression = Arcade.executeScript(parsedExpressions[name], arcadeContext);
        attributesAndExpressionResolutions['expression/' + name] =
          resolvedExpression ? resolvedExpression.toString() : '';
      }
    }

    return attributesAndExpressionResolutions;
  };

  /**
   * Converts </p>s into CRLFs.
   * @param {string} html Text to scan
   * @return {string} Converted text
   */
  mo.InfoTemplate._convertEndParasToEOLs = function (html) {
    var html2 = html, matches = html.match(/<\/p>/gi);
    array.forEach(matches, function (match) {
      html2 = html2.replace(match, '\n');
    });
    return html2;
  };

  /**
   * Converts <br>s into CRLFs.
   * @param {string} html Text to scan
   * @return {string} Converted text
   */
  mo.InfoTemplate._convertBreaksToEOLs = function (html) {
    var html2 = html, matches = html.match(/<br\s*\/?>/gi);
    array.forEach(matches, function (match) {
      html2 = html2.replace(match, '\n');
    });
    return html2;
  };

  /**
   * Insures that a string is not undefined or null.
   * @param {string} str String to check
   * @return {string} str, or '' if str is undefined, null, or empty
   */
  mo.InfoTemplate._useEmptyStringForNull = function (str) {
    return str ? str : '';
  };

  /**
   * Interates over the items in an associative array (forIn).
   * @param {object} obj Object to interate over
   * @param {function} fcn Function to call for each item
   * @param {object} scope Scope to apply to function call
   */
  mo.InfoTemplate._objEach = function (obj, fcn, scope){
    var key;
    for (key in obj){
      if(obj.hasOwnProperty(key)){
        fcn.call(scope, obj[key], key);
      }
    }
  };
  return mo;

});