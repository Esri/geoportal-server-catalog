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

G.evaluators.fgdc = {

  version: "fgdc.v1",

  evaluate: function(task) {
    this.evalBase(task);
    this.evalService(task);
    this.evalSpatial(task);
    this.evalTemporal(task);
  },

  evalBase: function(task) {
    var item = task.item, root = task.root;
    G.evalProp(task,item,root,"fileid","Esri/PublishedDocID");
    G.evalProp(task,item,root,"title","idinfo/citation/citeinfo/title");
    G.evalProp(task,item,root,"description","idinfo/descript/abstract");
    G.evalProps(task,item,root,"keywords_s","//themekey | //placekey");
    G.evalProps(task,item,root,"links_s","idinfo/citation/citeinfo/onlink | distinfo/stdorder/digform/digtopt/onlinopt/computer/networka/networkr");
    G.evalProp(task,item,root,"thumbnail_s","idinfo/browse/browsen");
    G.evalProps(task,item,root,"contact_organizations_s","//cntinfo/cntorgp/cntorg");
    G.evalProps(task,item,root,"contact_people_s","//cntinfo/cntorgp/cntper");
    G.evalProps(task,item,root,"contentType_s","distinfo/resdesc");
    
    /* hierarchical category */
    /* see: evalBse() method in EvaluatorFor_ISO.js and copy that code here if desired. */
  },

  evalService: function(task) {
    var item = task.item, root = task.root;
    G.evalResourceLinks(task,item,root,"idinfo/citation/citeinfo/onlink | distinfo/stdorder/digform/digtopt/onlinopt/computer/networka/networkr");
  },

  evalSpatial: function(task) {
    var item = task.item, root = task.root;
    G.forEachNode(task,root,"idinfo/spdom/bounding",function(node){
      var xmin = G.Val.chkDbl(G.getString(task,node,"westbc"),null);
      var ymin = G.Val.chkDbl(G.getString(task,node,"southbc"),null);
      var xmax = G.Val.chkDbl(G.getString(task,node,"eastbc"),null);
      var ymax = G.Val.chkDbl(G.getString(task,node,"northbc"),null);
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
    var concat = function(text,time) {
      var n, s, zone = "";
      if (typeof text === "string" && text.length === 8 && text.indexOf("-") === -1) {
        text = text.substring(0,4)+"-"+text.substring(4,6)+"-"+text.substring(6,8);
        if (typeof time === "string" && time.length >= 6  && time.indexOf(":") === -1) {
          n = time.indexOf("-");
          if (n > 0) {
            s = "-";
          } else {
            n = time.indexOf("+");
            if (n > 0) {
              s = "+";
            } else {
              n = time.toUpperCase().indexOf("Z");
              if (n > 0) s = "Z";
            }
          }
          if (n > 0) {
            zone = s+time.substring(n+1);
            time = time.substring(0,n);
            if (zone.length === 5) {
              zone = zone.substring(0,3)+":"+zone.substring(3,5);
            }
          }
          if (time.length === 6) { 
            time = time.substring(0,2)+":"+time.substring(2,4)+":"+time.substring(4,6);
            text = text+"T"+time+zone;
          } else if (time.length > 6) { 
            time = time.substring(0,2)+":"+time.substring(2,4)+":"+time.substring(4,6)+"."+time.substring(6);
            text = text+"T"+time+zone;
          }
        }
      }
      return text;
    };
    
    var item = task.item, root = task.root;
    G.forEachNode(task,root,"idinfo/timeperd/timeinfo/sngdate | idinfo/timeperd/timeinfo/mdattim/sngdate",function(node){
      var v = concat(G.getString(task,node,"caldate"),G.getString(task,node,"time"));
      var params = {
        instant: {
          date: v,
          indeterminate: null
        }
      };
      G.analyzeTimePeriod(task,params);
    });
    G.forEachNode(task,root,"idinfo/timeperd/timeinfo/rngdates",function(node){
      var v1 = concat(G.getString(task,node,"begdate"),G.getString(task,node,"begtime"));
      var v2 = concat(G.getString(task,node,"enddate"),G.getString(task,node,"endtime"));
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
