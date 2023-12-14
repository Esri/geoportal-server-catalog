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

G.evaluators.arcgis = {

  version: "arcgis.v1",

  evaluate: function(task) {
    this.evalBase(task);
    this.evalService(task);
    this.evalSpatial(task);
    this.evalTemporal(task);
  },

  evalBase: function(task) {
    var item = task.item, root = task.root;
    
    G.evalProp(task,item,root,"fileid","mdFileID");
    G.evalProp(task,item,root,"title","dataIdInfo/idCitation/resTitle");
    G.evalProp(task,item,root,"description","dataIdInfo/idAbs");
    G.evalProps(task,item,root,"keywords_s","//TopicCatCd/@value | //keyword");
    G.evalProps(task,item,root,"links_s","//linkage");
    G.evalProp(task,item,root,"thumbnail_s","dataIdInfo/graphOver/bgFileName");
    G.evalProps(task,item,root,"contentType_s","/metadata/distInfo/distributor/distorTran/onLineSrc/orDesc");
  },

  evalService: function(task) {
    var item = task.item, root = task.root;
    //G.evalResourceLinks(task,item,root,"distInfo/distributor/distorTran/onLineSrc/linkage");
    this.evalResourceLinks(task, item, root, "//linkage");
  },

  evalSpatial: function(task) {
    var item = task.item, root = task.root;
    G.forEachNode(task,root,"dataIdInfo/geoBox",function(node){
      var xmin = G.Val.chkDbl(G.getString(task,node,"westBL"),null);
      var ymin = G.Val.chkDbl(G.getString(task,node,"southBL"),null);
      var xmax = G.Val.chkDbl(G.getString(task,node,"eastBL"),null);
      var ymax = G.Val.chkDbl(G.getString(task,node,"northBL"),null);
      var result = G.makeEnvelope(xmin,ymin,xmax,ymax);
      if (result && result.envelope) {
        G.writeMultiProp(task.item,"envelope_geo",result.envelope);
        if (result.center) {
          G.writeMultiProp(task.item,"envelope_cen_pt",result.center);
        }
      }
    });
  },

  evalTemporal: function(task) {
    var item = task.item, root = task.root;
    G.forEachNode(task,root,"dataIdInfo/dataExt/tempEle/TempExtent/exTemp/TM_Instant/tmPosition",function(node){
      var v = G.getNodeText(node);
      var params = {
        instant: {
          date: v,
          indeterminate: null
        }
      };
      G.analyzeTimePeriod(task,params);
    });
    G.forEachNode(task,root,"dataIdInfo/dataExt/tempEle/TempExtent/exTemp/TM_Period",function(node){
      var v1 = G.getString(task,node,"tmBegin");
      var v2 = G.getString(task,node,"tmEnd");
      var params = {
        begin: {
          date: v1,
          indeterminate: null
        },
        end: {
          date: v2,
          indeterminate: null
        } 
      };
      G.analyzeTimePeriod(task,params);
    });
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
                if ((endsWith(lc,v)) || (lc.indexOf(v + "/") > 0)) {
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
        if (linkType === null) {
            if (lc.indexOf("cuahsi_1_1.asmx")>= 0) {
                linkType = "WaterOneFlow";
                linkUrl = url;
            }
        }
        if (linkType === null) {
            if (lc.indexOf("/wms.axd/") > 0) {
                  linkType = "WMS";
                  linkUrl = url;
            }
        }
        if (linkType === null) {
            if (lc.indexOf("/wmts.axd/") > 0) {
                  linkType = "WMTS";
                  linkUrl = url;
            }
        }
        if (linkType === null) {
            if (lc.indexOf("/wfs.axd/") > 0) {
                  linkType = "WFS";
                  linkUrl = url;
            }
        }
    }
    if (linkType !== null && (isHttp || isFtp)) {
        return {linkType:linkType,linkUrl:linkUrl};
    }
  },

  evalResourceLinks: function(task,obj,contextNode,xpathExpression) {
    if (!contextNode) return;
    var self = this, urls = [], name = "resources_nst";
    G.forEachNode(task,contextNode,xpathExpression,function(node){
        var url = G.getNodeText(node);
        var info = self.checkResourceLink(url);
        if (info && info.linkUrl && info.linkType) {
            if (urls.indexOf(info.linkUrl) === -1) {
                urls.push(info.linkUrl);
                G.writeMultiProp(obj,name,{
                    "url_s": info.linkUrl,
                    "url_type_s": info.linkType
                });
            }
        }
    });
  }

};
