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

(function(){
  
  gs.provider.csw.GetRecordsParser = gs.Object.create(gs.Proto,{
    
    cswProvider: {writable: true, value: null},
    ids: {writable: true, value: null},
    modifiedFrom: {writable: true, value: null},
    modifiedTo: {writable: true, value: null},
    q: {writable: true, value: null},
    task: {writable: true, value: null},
    xmlInfo: {writable: true, value: null},
    
    parseBody: {value: function(cswProvider,task) {
      this.ids = [];
      this.cswProvider = cswProvider;
      this.task = task;
      this.xmlInfo = null;
      var nsmap = {
        "csw": "http://www.opengis.net/cat/csw/3.0",
        "fes": "http://www.opengis.net/fes/2.0",
        "gml": "http://www.opengis.net/gml",
        "gml32": "http://www.opengis.net/gml/3.2"
      };
      if (task.isCsw2) {
        nsmap.csw = "http://www.opengis.net/cat/csw/2.0.2";
        nsmap.fes = "http://www.opengis.net/ogc";
      }
      var body = null, xmlInfo = null, ows, msg;
      if (task.request && task.request.body && typeof task.request.body === "string") {
        body = task.request.body.trim();
        if (body.length > 0) {
          try {
            this.xmlInfo = task.context.newXmlInfo(task,body,nsmap);
          } catch(ex) {
            msg = "Error parsing GetRecords xml:";
            if (ex && ex.message) msg += ex.message;
            ows = gs.Object.create(gs.provider.csw.OwsException);
            ows.put(task,ows.OWSCODE_NoApplicableCode,"",msg);
            // TODO temporary ?
            //console.log("Error parsing GetRecords xml.");
            //console.error(ex);
          }
        }
      } 
      if (!this.xmlInfo) return;
      if (!this.xmlInfo.root || !this.xmlInfo.xpathEvaluator) return;
      var root = this.xmlInfo.root;
      var xpathEvaluator = this.xmlInfo.xpathEvaluator;
      
      var startPosition = xpathEvaluator.getString(root,"@startPosition");
      if (typeof startPosition === "string" && startPosition.length > 0) {
        var from = task.val.strToInt(startPosition,-1);
        // TODO should this be >= 1
        if (from >= 1) {
          // TODO from = from - 1; is this correct indexOffset??
          cswProvider.addOverrideParameter(task,"from",""+from);
        }
      }
      var maxRecords = xpathEvaluator.getString(root,"@maxRecords");
      if (typeof maxRecords === "string" && maxRecords.length > 0) {
        if (maxRecords.toLowerCase !== "unlimited") {
          var size = task.val.strToInt(maxRecords,-1);
          if (size >= 0) {
            cswProvider.addOverrideParameter(task,"size",""+size);
          }
        }
      }
      
      var elementSet = xpathEvaluator.getString(root,"csw:Query/csw:ElementSetName");
      if (typeof elementSet === "string" && elementSet.trim().length > 0) {
        cswProvider.addOverrideParameter(task,"ElementSetName",elementSet.trim());
      }
      
      try{
        this._parseFilter();
        this._parseSortBy();
      } catch(ex) {
        if (ex && ex.message && ex.message === "OWSException") {
          // ignore this, the exception has already been set
        } else {
          msg = "Error evaluating GetRecords request:";
          if (ex && ex.message) msg += ex.message;
          ows = gs.Object.create(gs.provider.csw.OwsException);
          ows.put(task,ows.OWSCODE_NoApplicableCode,"",msg);
          // TODO temporary ?
          //console.log("Error parsing OGC filter.");
          //console.error(ex);
        }
      }
      
    }},
    
    /* .............................................................................................. */
    
    _appendQ: {value: function(qToAppend) {
      if (typeof qToAppend !== "string" || qToAppend.length === 0) return;
      if (typeof this.q !== "string") this.q = "";
      if (this.q.length > 0) this.q += " AND ";
      this.q += "("+qToAppend+")";
    }},
    
    _getPropertyLiteral: {value: function(node,nodeInfo) {
      var v = this.xmlInfo.xpathEvaluator.getString(node,"fes:Literal");
      if (typeof v !== "string") v = "";
      v = v.trim(); // TODO ?
      if (v.length === 0) {
        var locator = "Literal";
        var msg = locator+" is required for "+nodeInfo.localName;
        ows = gs.Object.create(gs.provider.csw.OwsException);
        ows.put(this.task,ows.OWSCODE_InvalidParameterValue,locator,msg);
        throw new Error("OWSException");
      }
      return v;
    }},
    
    _getPropertyName: {value: function(node,nodeInfo,ignoreValidation) {
      // dc:type - liveData, Format - content type, Subject - theme
      var queryables = ["anytext","id","title"]; 
      var anytextAliases = ["","anytext","format","subject","dc:type"]
      
      var name = null, lc = "", locator, ows, msg;
      if (this.task.isCsw2) {
        locator = "PropertyName";
        name = this.xmlInfo.xpathEvaluator.getString(node,"fes:PropertyName");
      } else {
        locator = "ValueReference";
        name = this.xmlInfo.xpathEvaluator.getString(node,"fes:ValueReference");
      }
      if (typeof name !== "string") name = "";
      name = name.trim();
      lc = name.toLowerCase();
      msg = locator+" is required for "+nodeInfo.localName;
      if (anytextAliases.indexOf(lc) !== -1) {
        return "";
      } else if (queryables.indexOf(lc) === -1) {
        if (lc.length > 0) {
          msg = name+" is not a supported queryable.";
        }
        if (!ignoreValidation) {
          ows = gs.Object.create(gs.provider.csw.OwsException);
          ows.put(this.task,ows.OWSCODE_InvalidParameterValue,locator,msg);
          throw new Error("OWSException");
        }
      }
      return name;
    }},
    
    _getSpatialFilter: {value: function(node,nodeInfo) {
      var xpathEvaluator = this.xmlInfo.xpathEvaluator;
      var box, coords, msg, ows;
      
      box = xpathEvaluator.getNode(node,"gml:Box");
      if (!box) box = xpathEvaluator.getNode(node,"gml32:Box");
      if (box) {
        coords = xpathEvaluator.getNode(box,"gml:coordinates");
        if (!coords) coords = xpathEvaluator.getNode(box32,"gml:coordinates");
        if (typeof coords === "string" && coords.length > 0) {
          this.cswProvider.addOverrideParameter(this.task,"bbox",coords);
          var lc = nodeInfo.localName.toLowerCase();
          if (lc === "intersects" || lc === "within" ||
              lc === "contains" || lc === "disjoint") {
            this.cswProvider.addOverrideParameter(this.task,"spatialRel",lc);
          }
        } else {
          msg = "gml:coordinates are required for gml:Box";
          ows = gs.Object.create(gs.provider.csw.OwsException);
          ows.put(this.task,ows.OWSCODE_InvalidParameterValue,"gml:Box",msg);
        }
      } else {
        msg = "gml:Box is required for "+nodeInfo.localName;
        ows = gs.Object.create(gs.provider.csw.OwsException);
        ows.put(this.task,ows.OWSCODE_InvalidParameterValue,nodeInfo.localName,msg);
        throw new Error("OWSException");
      }
    }},
    
    _parseFilter: {value: function() {
      var root = this.xmlInfo.root;
      var xpathEvaluator = this.xmlInfo.xpathEvaluator;
      var filter = xpathEvaluator.getNode(root,"csw:Query/csw:Constraint/fes:Filter");
      if (!filter) return;
      this._parseFilterClause(filter);
      if (typeof this.q === "string" && this.q.length > 0) {
        this.cswProvider.addOverrideParameter(this.task,"q",this.q);
      }
      if (typeof this.ids && this.ids.length > 0) {
        this.cswProvider.addOverrideParameter(this.task,"id",this.ids);
      }
      if (typeof this.modifiedFrom === "string" && typeof this.modifiedTo === "string") {
        this.cswProvider.addOverrideParameter(this.task,"modified",this.modifiedFrom+"/"+this.modifiedTo);
      } else if (typeof this.modifiedFrom === "string") {
        this.cswProvider.addOverrideParameter(this.task,"modified",this.modifiedFrom+"/");
      } else if (typeof this.modifiedTo === "string") {
        this.cswProvider.addOverrideParameter(this.task,"modified","/"+this.modifiedTo);
      }
    }},
    
    _parseFilterClause: {value: function(node) {
      var self = this, propName, literal, nodeInfo;
      var xpathEvaluator = this.xmlInfo.xpathEvaluator;
      xpathEvaluator.forEachChild(node,function(childInfo){
        if (childInfo.nodeInfo.isElementNode) {
          var v, v2, ln = childInfo.nodeInfo.localName;
          var childNode = childInfo.node;
          var childNodeInfo = childInfo.nodeInfo;
          var peek = self._getPropertyName(childNode,childNodeInfo,true);
          //console.log("ln",ln,"peek",peek);
          
          if ((peek === "modified" || peek === "dct:modified") && 
              (ln === "PropertyIsGreaterThan" || ln === "PropertyIsGreaterThanOrEqualTo" ||
               ln === "PropertyIsLessThan" || ln === "PropertyIsLessThanOrEqualTo" ||
               ln === "PropertyIsBetween")) {
            v = v2 = null;
            if (ln === "PropertyIsGreaterThan" || ln === "PropertyIsGreaterThanOrEqualTo") {
              v = self._getPropertyLiteral(childNode,childNodeInfo);
            } else if (ln === "PropertyIsLessThan" || ln === "PropertyIsLessThanOrEqualTo") {
              v2 = self._getPropertyLiteral(childNode,childNodeInfo); 
            } else if (ln === "PropertyIsBetween") {
              v = xpathEvaluator.getString(childNode,"fes:LowerBoundary");
              v2 = xpathEvaluator.getString(childNode,"fes:UpperBoundary");
            }
            if (typeof v === "string" && v.trim().length > 0) {
              self.modifiedFrom = v.trim();
            }
            if (typeof v2 === "string" && v2.trim().length > 0) {
              self.modifiedTo = v2.trim();
            }
          
          // logical clauses
          } else if (ln === "And") {
            self._parseFilterClause(childNode);
          } else if (ln === "Or") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "Not") { 
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          
          // property clauses
          } else if (ln === "PropertyIsBetween") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "PropertyIsEqualTo") {
            propName = self._getPropertyName(childNode,childNodeInfo);
            v = self._getPropertyLiteral(childNode,childNodeInfo);
            if (propName.toLowerCase() !== "id") {
              self.ids.push(v);
            } else {
              if (propName.length > 0 && propName.toLowerCase() !== "anytext") {
                v = propName+":("+v+")";
              }
              self._appendQ(v);
            }
          } else if (ln === "PropertyIsGreaterThan") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "PropertyIsGreaterThanOrEqualTo") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "PropertyIsLessThan") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "PropertyIsLessThanOrEqualTo") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "PropertyIsLike") {
            propName = self._getPropertyName(childNode,childNodeInfo);
            v = self._getPropertyLiteral(childNode,childNodeInfo);
            if (propName.length > 0 && propName.toLowerCase() !== "anytext") {
              v = propName+":("+v+")";
            }
            self._appendQ(v);
          } else if (ln === "PropertyIsNotEqualTo") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "PropertyIsNull") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
            
            
          // spatial clauses 
          } else if (ln === "BBOX") {
            self._getSpatialFilter(childNode,childNodeInfo);
          } else if (ln === "Beyond") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "Contains") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "Crosses") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "Disjoint") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "DWithin") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "Equals") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "Intersects") {
            self._getSpatialFilter(childNode,childNodeInfo);
          } else if (ln === "Overlaps") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "Touches") {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          } else if (ln === "Within") {
            self._getSpatialFilter(childNode,childNodeInfo);
            
          } else {
            self._throwUnsupportedOperator(childNode,childNodeInfo);
          }
        }
      });
    }},
    
    _parseSortBy: {value: function() {
      var a = [], sortField, sortOrder;
      var xpathEvaluator = this.xmlInfo.xpathEvaluator;
      var nodes = xpathEvaluator.getNodes(this.xmlInfo.root,"//fes:SortProperty");
      nodes.forEach(function(node){
        sortField = xpathEvaluator.getString(node,"fes:PropertyName");
        sortOrder = xpathEvaluator.getString(node,"fes:SortOrder");
        if (typeof sortField == "string" && sortField.trim().length > 0) {
          sortField = sortField.trim();
          if (typeof sortOrder === "string" && 
            (sortOrder.trim().toLowerCase() === "asc" || sortOrder.trim().toLowerCase() === "desc")) {
            sortField += ":"+sortOrder.trim().toLowerCase();
          }
          a.push(sortField);
        }
      });
      if (a.length > 0) {
        this.cswProvider.addOverrideParameter(this.task,"sort",a);
      }
    }},
    
    _throwUnsupportedOperator: {value: function(node,nodeInfo) {
      var locator = nodeInfo.localName;
      var msg = "Operator "+nodeInfo.nodeName+" is not supported.";
      var ows = gs.Object.create(gs.provider.csw.OwsException);
      ows.put(this.task,ows.OWSCODE_InvalidParameterValue,locator,msg);
      throw new Error("OWSException");
    }}
  
  });

}());
