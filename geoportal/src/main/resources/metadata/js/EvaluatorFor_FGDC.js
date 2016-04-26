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
    G.evalProp(task,item,root,"url_thumbnail_s","idinfo/browse/browsen");
    G.evalProps(task,item,root,"contact_organizations_s","//cntinfo/cntorgp/cntorg");
    G.evalProps(task,item,root,"contact_people_s","//cntinfo/cntorgp/cntper");
    G.evalProps(task,item,root,"contentType_s","distinfo/resdesc");
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
    var item = task.item, root = task.root;
    
    // TODO
    
    /*
    <field name="apiso_TempExtent_begin_dt" instruction="instruction.checkFgdcDate">
      <xsl:value-of select="/metadata/idinfo/timeperd/timeinfo/rngdates/begdate | /metadata/idinfo/timeperd/timeinfo/sngdate/caldate"/>
    </field>
    <field name="apiso_TempExtent_end_dt" instruction="instruction.checkFgdcDate.end">
      <xsl:value-of select="/metadata/idinfo/timeperd/timeinfo/rngdates/enddate | /metadata/idinfo/timeperd/timeinfo/sngdate/caldate"/>
    </field>
    
    <property xpath="/metadata/idinfo/timeperd/timeinfo/rngdates">
      <property meaning="timeperiod.analyze" xpathType="STRING"
        xpath="concat('tp.begin.',begdate,'.fgdctime.',begtime,'.end.',enddate,'.fgdctime.',endtime)"/>
    </property>
    <property xpath="/metadata/idinfo/timeperd/timeinfo/mdattim/sngdate">
      <property meaning="timeperiod.analyze" xpathType="STRING"
        xpath="concat('tp.position.',caldate,'.fgdctime.',time)"/>
    </property>
    <property xpath="/metadata/idinfo/timeperd/timeinfo/sngdate">
      <property meaning="timeperiod.analyze" xpathType="STRING"
        xpath="concat('tp.position.',caldate,'.fgdctime.',time)"/>
    </property>    
     */
    
  }

};
