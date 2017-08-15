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
  
  writers: {},
    
  DateUtil: Java.type("com.esri.geoportal.base.util.DateUtil"),
  JsonUtil: Java.type("com.esri.geoportal.base.util.JsonUtil"),
  MediaType: Java.type("javax.ws.rs.core.MediaType"),
  Val: Java.type("com.esri.geoportal.base.util.Val"),
  XmlUtil: Java.type("com.esri.geoportal.base.xml.XmlUtil"),
  
  URI_ATOM: "http://www.w3.org/2005/Atom",
  URI_CSW: "http://www.opengis.net/cat/csw/3.0",
  URI_DC: "http://purl.org/dc/elements/1.1/",
  URI_DCT: "http://purl.org/dc/terms/",
  URI_GEO: "http://a9.com/-/opensearch/extensions/geo/1.0/",
  URI_GEOPOS: "http://www.w3.org/2003/01/geo/wgs84_pos#",
  URI_GEORSS: "http://www.georss.org/georss",
  URI_GEORSS10: "http://www.georss.org/georss/10",
  URI_KML: "http://www.opengis.net/kml/2.2",
  URI_TIME: "http://a9.com/-/opensearch/extensions/time/1.0/",
  URI_OPENSEARCH: "http://a9.com/-/spec/opensearch/1.1/",
  URI_OWS: "http://www.opengis.net/ows/2.0",
  URI_SDI: "http://www.geodata.gov/sdi_atom",

  buildLinks: function(appRequest,itemId,item) {
    var links = [];
    var baseUrl = appRequest.getBaseUrl();
    var itemUrl = baseUrl+"/rest/metadata/item/"+encodeURIComponent(itemId);
    var v = item.sys_metadatatype_s;
    var bjson = (typeof v === "string" && v === "json");
    
    var jsonUrl = itemUrl;
    links.push({
      rel: "alternate.json",
      type: "application/json",
      href: jsonUrl
    });
    
    if (!bjson) {
      var htmlUrl = itemUrl+"/html";
      links.push({
        rel: "alternate.html",
        type: "text/html",
        href: htmlUrl
      });
      var xmlUrl = itemUrl+"/xml";
      links.push({
        rel: "alternate.xml", // TODO via???
        type: "application/xml",
        href: xmlUrl
      });
    }

    return links;
  },

  chkStr: function(v) {
    if (typeof v === "undefined" || v === null) return null;
    return ""+v;
  },
  
  chkStrArray: function(v) {
    if (typeof v === "undefined" || v === null) return null;
    else if (typeof v === "string") return [v];
    else if (typeof v.push === "function") return v;
    return null;
  },
  
  chkObjArray: function(v) {
    if (typeof v === "undefined" || v === null) return null;
    else if (typeof v === "object" && typeof v.push === "undefined") return [v];
    else if (typeof v === "object" && typeof v.push === "function") return v;
    return null;
  },
  
  getSnippet: function(xmlBuilder,title,description,links) {
    var i,v,l1,l2;
    if (description.length > 255) description = description.substring(0,255);
    var v1 = "<div class=\"title\">"+G.XmlUtil.escape(title)+"</div>";
    var v2 = "<div class=\"abstract\">"+G.XmlUtil.escape(description)+"</div>";
    var v3 = "";
    if (links) {
      for (i=0;i<links.length;i++) {
        v = links[i];
        if (typeof v.href === "string" && v.href.length > 0) {
          l1 = G.XmlUtil.escape(v.href);
          l2 = "<div><a target=\"_blank\" href=\""+l1+"\">"+l1+"</a><div>";
          v3 += l2;
        }
      }
    }
    var snippet = "<div class=\"snippet\">"+v1+v2+v3+"</div>";
    return snippet;
  },
  
  newXmlBuilder: function() {
    var XmlBuilder = Java.type("com.esri.geoportal.base.xml.XmlBuilder");
    var xmlBuilder = new XmlBuilder();
    xmlBuilder.init();
    return xmlBuilder;
  },
  
  nowAsString: function() {
    //return G.Val.toIso8601(new java.util.Date());
    return G.DateUtil.nowAsString();
  }
  
};
