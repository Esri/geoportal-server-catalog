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

G.evaluators.dc = {

  version: "dc.v1", 

  evaluate: function(task) {
    this.evalBase(task);
    this.evalService(task);
    this.evalSpatial(task);
    this.evalTemporal(task);
  },

  evalBase: function(task) {
    var item = task.item, root = task.root;
      var dsc = G.getNode(task,root,"rdf:Description | oai_dc:dc");

      G.evalProp(task,item,root,"fileid","dc:identifier[contains(text(),'doi:')] |dc:identifier");
      G.evalProp(task,item,root,"title","dc:title ");

      G.evalProps(task,item,root,"description","dct:abstract | dc:description");

      G.evalProps(task,item,root,"keywords_s","//dc:subject");
      G.evalProps(task,item,root,"links_s","//dct:references");
      G.evalProp(task,item,dsc,"thumbnail_s","dct:references[@scheme='urn:x-esri:specification:ServiceType:ArcIMS:Metadata:Thumbnail']");

      G.evalProps(task,item,root,"contact_organizations_s","dc:creator");
      G.evalProps(task,item,root,"contact_people_s","dc:creator");
      G.evalProps(task,item,root,"type_s","dc:type");
      G.evalProps(task,item,root,"format_s","dc:format");
  },

    evalDoi: function(task){
        var item = task.item, root = task.root;
        var name = G.getString(task, root, "dc:identifier[contains(text(),'doi:')] ");
        name = name.trim().substr(4);
        name = "http://doi.org/".concat(name);
        G.writeMultiProp(task.item,"links_s",name);
    },
    
  evalService: function(task) {
    var item = task.item, root = task.root;
    G.evalResourceLinks(task,item,root,"//dct:references");
  },

  evalSpatial: function(task) {
    var item = task.item, root = task.root;
    G.forEachNode(task,root,"//ows:WGS84BoundingBox",function(node){
      var lc = G.getString(task,node,"ows:LowerCorner");
      var uc = G.getString(task,node,"ows:UppeCorner");
      if (lc !== null && lc.length > 0 && uc !== null && uc.length > 0) {
        var alc = lc.split(" ");
        var auc = uc.split(" ");
        if (alc.length === 2 && auc.length === 2) {
          var xmin = G.Val.chkDbl(alc[0],null);
          var ymin = G.Val.chkDbl(alc[1],null);
          var xmax = G.Val.chkDbl(auc[0],null);
          var ymax = G.Val.chkDbl(auc[1],null);
          var result = G.makeEnvelope(xmin,ymin,xmax,ymax);
          if (result && result.envelope) {
            G.writeMultiProp(task.item,"envelope_geo",result.envelope);
            if (result.center) {
              G.writeMultiProp(task.item,"envelope_cen_pt",result.center);
            }
          }
        }
      }
    });
  },

  evalTemporal: function(task) {
    var chk = function(v) {
      var params = null, n;
      if (typeof v === "string" && v.length > 0) {
        n = v.indexOf("/");
        if (n !== -1) {
          params = {
            begin: {
              date: v.substring(0,n),
              indeterminate: null
            },
            end: {
              date: v.substring(n+1),
              indeterminate: null
            } 
          };
        } else {
          params = {
            instant: {
              date: v,
              indeterminate: null
            }
          };  
        }
      }
      if (params) G.analyzeTimePeriod(task,params);
    };
    
    var item = task.item, root = task.root;
    G.forEachNode(task,root,"//dct:valid",function(node){
      var v = G.getNodeText(node);
      chk(v);
    });
    G.forEachNode(task,root,"//dc:date",function(node){
      var v = G.getNodeText(node);
      chk(v);
    });
  }

};
