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
  },

  evalService: function(task) {
    var item = task.item, root = task.root;
    G.evalResourceLinks(task,item,root,"distInfo/distributor/distorTran/onLineSrc/linkage");
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
  }

};
