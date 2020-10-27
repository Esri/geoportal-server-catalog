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

var G = {
    
  DateUtil: Java.type("com.esri.geoportal.base.util.DateUtil"),
  Val: Java.type("com.esri.geoportal.base.util.Val"),

  XPATH_NODE: javax.xml.xpath.XPathConstants.NODE,
  XPATH_NODESET: javax.xml.xpath.XPathConstants.NODESET,
  XPATH_STRING: javax.xml.xpath.XPathConstants.STRING,

  evaluators: {},

  analyzeTimePeriod: function(task,params) {
    //print("analyzeTimePeriod");
    
    var chkYear = function(v) {
      var c, i, y = "";
      var result = {
        isNegative: false,
        isInteger: false,
        year: null,
        value: v
      };
      if (typeof v === "string") {
        if (v.indexOf("-") === 0) {
          v = v.substring(1);
          result.isNegative = true;
        }
        if (v.length > 0) {
          result.isInteger = true;
          for (i=0;i<v.length;i++) {
            c = v.charAt(i);
            if (c >= '0' && c <= '9') {
              y += c;
            } else {
              result.isInteger = false;
              break;
            }
          }
          if (y.length > 0) {
            if (result.isNegative) y = "-" + y;
            result.year = y;
          }
        }
      }
      return result;
    };
    
    
    if (!params) return;
    //"instant_dt": null, "instant_indeterminate_s": null,
    var data = {
      "begin_dt": null,
      "begin_year_l": null,
      "begin_indeterminate_s": null,
      "end_dt": null,
      "end_year_l": null,
      "end_indeterminate_s": null,
    };
    if (params.instant) {
      //data["instant_dt"] = this.DateUtil.checkIsoDateTime(params.instant.date,false);
      //data["instant_indeterminate_s"] = this.Val.chkStr(params.instant.indeterminate,null);
      if (!params.begin && !params.end) {
        params.begin = {
          date: params.instant.date,
          indeterminate: params.instant.indeterminate
        };
        // TODO should use the instant
        params.end = {
          date: params.instant.date,
          indeterminate: params.instant.indeterminate
        };
      }
    }
    if (params.begin) {
      if (typeof params.begin.date === "string" && !params.begin.date.startsWith("9999")) {
        params.begin.yearInfo = chkYear(params.begin.date);
        if (params.begin.yearInfo.year != null) {
          data["begin_year_l"] = params.begin.yearInfo.year;
        }
        if (!params.begin.yearInfo.isNegative) {
          data["begin_dt"] = this.DateUtil.checkIsoDateTime(params.begin.date,false);
        }
        
      }
      data["begin_indeterminate_s"] = this.Val.chkStr(params.begin.indeterminate,null);
    }
    if (params.end) {
      if (typeof params.end.date === "string" && !params.end.date.startsWith("9999")) {
        params.end.yearInfo = chkYear(params.end.date);
        if (params.end.yearInfo.year != null) {
          data["end_year_l"] = params.end.yearInfo.year;
        }
        if (!params.end.yearInfo.isNegative) {
          data["end_dt"] = this.DateUtil.checkIsoDateTime(params.end.date,true);
        }
      }
      data["end_indeterminate_s"] = this.Val.chkStr(params.end.indeterminate,null);
    }
    var ok = false;
    for (var k in data) {
      if (data.hasOwnProperty(k)) {
        if (data[k] !== null ) {
          ok = true;
          break;
        }
      }
    }
    if (ok) {
      //this.writeMultiProp(task.item,"timeperiod_tp",data);
      this.writeMultiProp(task.item,"timeperiod_nst",data);
      if (data.begin_year_l !== null) {
        this.writeMultiProp(task.item,"metadata_year_l", parseInt(data.begin_year_l));
      }
    } 
  },

  checkResourceLink: function(url) {
    var endsWith = function(v,sfx) {return (v.indexOf(sfx,(v.length-sfx.length)) !== -1);};

    var arcgisTypes = ["MapServer","ImageServer","FeatureServer","GlobeServer","GPServer","GeocodeServer",
                       "GeometryServer","NAServer","GeoDataServer ","MobileServer","SceneServer",
                       "SchematicsServer","StreamServer","VectorTileServer"]; 
    var ogcTypes = ["WMS","WFS","WCS","WMTS","WPS","SOS","CSW"];
    var dataTypes = ["zip","shp"];

    var i, v, lc, linkType = null, linkUrl = null;
    var isHttp = (typeof url === "string" && (url.indexOf("http://") === 0 || url.indexOf("https://") === 0));
    var isFtp = (typeof url === "string" && (url.indexOf("ftp://") === 0 || url.indexOf("ftps://") === 0));
    if (isHttp) {
      lc = url.toLowerCase();
      if (lc.indexOf("service=") > 0) {
        //if (lc.indexOf("request=getcapabilities") > 0) {}
        for (i=0;i<ogcTypes.length;i++) {
          v = "service="+ogcTypes[i].toLowerCase();
          if (lc.indexOf("?"+v) > 0 || lc.indexOf("&"+v) > 0) {
            linkType = ogcTypes[i];
            linkUrl = url;
            break;
          }
        }
      } else if (lc.indexOf("/rest/services/") > 0) {
        for (i=0;i<arcgisTypes.length;i++) {
          v = "/"+arcgisTypes[i].toLowerCase();
          if (endsWith(lc,v)) {
            linkType = arcgisTypes[i];
            linkUrl = url;
            break;
          }
        }
      }
      if (linkType === null) {
        if (endsWith(lc,".kml") || endsWith(lc,".kmz") || 
            lc.indexOf("?f=kml") > 0 || lc.indexOf("&f=kml") > 0 || 
            lc.indexOf("?f=kmz") > 0 || lc.indexOf("&f=kmz") > 0) {
          linkType = "kml";
          linkUrl = url;
        }
      }
      if (linkType === null) {
        if (lc.indexOf("com.esri.wms.esrimap")>= 0) {
          linkType = "IMS";
          linkUrl = url;
        }
      }
    }
    if (linkType !== null && (isHttp || isFtp)) {
      return {linkType:linkType,linkUrl:linkUrl};
    }
  },

  checkValue: function(value,name,options) {
    if (typeof value === "undefined" || value === null ) return;
    if (options && options.dataType && typeof value !== "undefined" && value !== null) {
      if (options.dataType === "IsoDateTime" && typeof value === "string") {
        if (value.startsWith('9999')) return; // Data.Gov uses 9999-01-01 as default
        var isEnd = (options.isEnd || false);
        value = this.DateUtil.checkIsoDateTime(value,isEnd);
      }
      if (typeof value === "string") {
          value = value.trim();
          value = this.Val.unescape(value); // unescape HTML and Octal.
      }
    }
    return value;
  },

  evalCode: function(task,obj,contextNode,name,xpathExpression) {
    if (this.hasText(task,contextNode,xpathExpression+"/@codeListValue")) {
      this.evalProp(task,obj,contextNode,name,xpathExpression+"/@codeListValue");
    } else {
      this.evalProp(task,obj,contextNode,name,xpathExpression);
    }
  },

  evalDate: function(task,obj,contextNode,name,xpathExpression) {
    this.evalProp(task,obj,contextNode,name,xpathExpression,{dataType:"IsoDateTime"});
  },

  evalDates: function(task,obj,contextNode,name,xpathExpression) {
    this.evalProps(task,obj,contextNode,name,xpathExpression,{dataType:"IsoDateTime"});
  },

  evalProp: function(task,obj,contextNode,name,xpathExpression,options) {
    if (!contextNode) return;
    this.writeProp(obj,name,this.getString(task,contextNode,xpathExpression),options);
  },

  evalProps: function(task,obj,contextNode,name,xpathExpression,options) {
    if (!contextNode) return;
    var self = this;
    this.forEachNode(task,contextNode,xpathExpression,function(node){
      self.writeMultiProp(obj,name,self.getNodeText(node),options);
    });
  },

  evalResourceLinks: function(task,obj,contextNode,xpathExpression) {
    if (!contextNode) return;
    var self = this, urls = [], name = "resources_nst";
    this.forEachNode(task,contextNode,xpathExpression,function(node){
      var url = self.getNodeText(node);
      var info = self.checkResourceLink(url);
      if (info && info.linkUrl && info.linkType) {
        if (urls.indexOf(info.linkUrl) === -1) {
          urls.push(info.linkUrl);
          self.writeMultiProp(obj,name,{
            "url_s": info.linkUrl,
            "url_type_s": info.linkType
          });        
        }
      }
    });
  },

  forEachNode: function(task,contextNode,xpathExpression,callback) {
    var i, r, nl = task.xpath.evaluate(xpathExpression,contextNode,this.XPATH_NODESET);
    if (nl) {
      for (i=0;i<nl.getLength();i++) {
        r = callback(nl.item(i));
        if (r === "break") return;
      }
    }
  },

  getNode: function(task,contextNode,xpathExpression) {
    return task.xpath.evaluate(xpathExpression,contextNode,this.XPATH_NODE);
  },
  
  getNodeText: function(node) {
    var v;
    if (typeof node !== "undefined" && node !== null) {
      if (node.getNodeType() === 1) {
        v = node.getTextContent();
        if (typeof v === "string") {
          v = this.Val.trim(v);
        }
      } else {
        v = node.getNodeValue();
      }
      if (typeof v === "string") {
        return v;
      }
    }
    return null;
  },

  getString: function(task,contextNode,xpathExpression) {
    return this.getNodeText(this.getNode(task,contextNode,xpathExpression));
  },

  hasNode: function(task,contextNode,xpathExpression) {
    if (this.getNode(task,contextNode,xpathExpression)) return true;
    return false;
  },

  hasText: function(task,contextNode,xpathExpression) {
    var v = this.getString(task,contextNode,xpathExpression);
    if (v !== null && v.length > 0) return true;
    return false;
  },

  makeEnvelope: function(xmin,ymin,xmax,ymax) {
    var result = null;
    if (xmin !== null && ymin !== null && xmax !== null && ymax !== null) {
      if ((xmin < -180.0) && (xmax >= -180.0)) xmin = -180.0;
      if ((xmax > 180.0) && (xmin <= 180.0)) xmax = 180.0;
      if ((ymin < -90.0) && (ymax >= -90.0)) ymin = -90.0;
      if ((ymax > 90.0) && (ymin <= 90.0)) ymax = 90.0;
      var xcen = (xmin + xmax) / 2.0;
      var ycen = (ymin + ymax) / 2.0;
      if (xmin > xmax) {
        if (xcen >= 0) xcen = xcen - 180.0;
        else xcen = xcen + 180.0;
      }
      if (xcen < -180.0) xcen = -180.0;
      if (xcen > 180.0) xcen = 180.0;
      
      // turn the point into a tiny envelope to let ES 6.6 accept such data
      if (xmin === xmax) {
        if (xmax + 0.00000001 > 180) {
          xmin -= 0.00000001;
        } else {
          xmax += 0.00000001;
        }
      }
      if (ymin === ymax) {
        if (ymax + 0.00000001 > 90) {
          ymin -= 0.00000001;
        } else {
          ymax += 0.00000001;
        }
      }
      
      result = {
        "envelope": {
          "type": "envelope",
          "coordinates": [[xmin,ymax],[xmax,ymin]]
        },
        "center": {
          "lat": ycen,
          "lon": xcen
        }
      };
    }
    return result;
  },

  writeMultiProp: function(obj,name,value,options) {
    value = this.checkValue(value,name,options);
    if (typeof value === "undefined" || value === null) return;
    if (typeof value === "string" && value.length === 0) return;
    var v = obj[name];
    if (typeof v === "undefined" || v === null) {
      //obj[name] = value;
      obj[name] = new Array();
      obj[name].push(value);
    } else if (typeof v.push === "function") {
      v.push(value);
    } else {
      obj[name] = [v,value];
    }
  },

  writeProp: function(obj,name,value,options) {
    value = this.checkValue(value,name,options);
    if (typeof value === "undefined" || value === null) return;
    if (typeof value === "string" && value.length === 0) return;
    obj[name] = value;
  },

  clearProps: function(obj, name) {
      if (obj[name]){
          obj[name] = undefined;
      }

  },
  
  // Simple HTTP GET
  httpGet: function(url) {
    var con = new java.net.URL(url).openConnection();
    con.requestMethod = "GET";
    
    var response = this._read(con.inputStream);
    
    return response;
  },
  
  _read: function(inputStream){
    var inReader = new java.io.BufferedReader(new java.io.InputStreamReader(inputStream));
    var inputLine;
    var response = new java.lang.StringBuffer();

    while ((inputLine = inReader.readLine()) != null) {
           response.append(inputLine);
    }
    
    inReader.close();
    return response.toString();
  }
  
  
};
