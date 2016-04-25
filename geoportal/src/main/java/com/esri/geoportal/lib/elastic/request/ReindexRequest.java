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
package com.esri.geoportal.lib.elastic.request;
import com.esri.geoportal.base.metadata.MetadataDocument;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.Val;
import com.esri.geoportal.base.util.exception.UsageException;
import com.esri.geoportal.context.AppRequest;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.util.AccessUtil;
import com.esri.geoportal.lib.elastic.util.FieldNames;
import com.esri.geoportal.lib.elastic.util.ItemIO;
import com.esri.geoportal.lib.elastic.util.Scroller;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;

import javax.json.Json;
import javax.json.JsonObjectBuilder;

import org.elasticsearch.action.get.GetRequestBuilder;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.search.SearchHit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Re-index content.
 */
public class ReindexRequest extends AppRequest {
  
  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(ReindexRequest.class);
  
  /** Instance variables. */
  private String fromIndexName;
  private String fromVersionCue;
  private String toIndexName;
    
  /** Constructor. */
  public ReindexRequest() {
    super();
  }
  
  /** The from index name. */
  public String getFromIndexName() {
    return fromIndexName;
  }
  /** The from index name. */
  public void setFromIndexName(String fromIndexName) {
    this.fromIndexName = fromIndexName;
  }
  
  /** A cue for the version of the from index. */
  public String getFromVersionCue() {
    return fromVersionCue;
  }
  /** A cue for the version of the from index. */
  public void setFromVersionCue(String fromVersionCue) {
    this.fromVersionCue = fromVersionCue;
  }

  /** The to index name. */
  public String getToIndexName() {
    return toIndexName;
  }
  /** The to index name. */
  public void setToIndexName(String toIndexName) {
    this.toIndexName = toIndexName;
  }

  @Override
  public AppResponse execute() throws Exception {
    AppResponse response = new AppResponse();
    long tStart = System.currentTimeMillis();
    AtomicBoolean hadErrors = new AtomicBoolean(false);
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    AccessUtil au = new AccessUtil();
    au.ensureAdmin(getUser());
    
    long feedbackMillis = 60000;
    long feedbackCountThreshold = 200;
    AtomicLong feedbackStartMillis = new AtomicLong(System.currentTimeMillis());
    AtomicLong count = new AtomicLong();
    AtomicLong feedbackCount = new AtomicLong();
    
    // TODO prevent multiple re-indexing jobs from happening at the same time
    
    
    String indexName = ec.getItemIndexName();
    fromVersionCue = Val.trim(fromVersionCue);
    fromIndexName = Val.trim(fromIndexName);
    toIndexName = Val.trim(toIndexName);
    if (fromIndexName == null || fromIndexName.length() == 0) {
      throw new UsageException("A fromIndexName is required.");
    }
    if (toIndexName == null || toIndexName.length() == 0) {
      throw new UsageException("A toIndexName is required.");
    }
    /*
    if (fromIndexName == null || fromIndexName.length() == 0) {
      fromIndexName = indexName;
    }
    if (toIndexName == null || toIndexName.length() == 0) {
      toIndexName = fromIndexName;
    }
    */
    
    boolean intoActive = toIndexName.equals(indexName);
    boolean intoSame = fromIndexName.equals(toIndexName);
    if (!intoActive && !intoSame) {
      ec.ensureIndex(toIndexName,false);
    }
    
    ItemIO itemio = new ItemIO();
    Scroller scroller = new Scroller();
    scroller.setIndexName(fromIndexName);
    scroller.setIndexType("item");
    //scroller.setMaxDocs(3);
    scroller.scroll(
      new Consumer<SearchHit>(){
        @Override
        public void accept(SearchHit hit) {
          count.incrementAndGet();
          feedbackCount.incrementAndGet();
          String id = hit.getId();
          String metadataTypeKey = null;
          boolean bWriteItem = false;
          try {
            String xml = Val.trim(readXml(ec,itemio,id,fromIndexName,fromVersionCue));
            // TODO what if the xml is empty?
            //boolean asDraft = false;
            MetadataDocument mdoc = new MetadataDocument();
            mdoc.setItemId(id);
            mdoc.setXml(xml);
            if (mdoc.hasXml()) {
              bWriteItem = true;
              mdoc.setRequiresXmlWrite(!intoSame);
              mdoc.interrogate();
              mdoc.evaluate();
              //mdoc.validate(); // TODO turn off validation?
              if (mdoc.getMetadataType() != null) {
                metadataTypeKey = mdoc.getMetadataType().getKey();
              }
            } else {
              bWriteItem = !intoSame;
            }
            
            if (bWriteItem) {
              JsonObjectBuilder jb = itemio.mixin(mdoc,hit.sourceAsString());
              if (metadataTypeKey != null) jb.add(FieldNames.FIELD_SYS_METADATATYPE,metadataTypeKey);
              mdoc.setJson(JsonUtil.toJson(jb.build(),false));
              itemio.writeItem(ec,mdoc,toIndexName,toIndexName);
            }
          } catch (Exception e) {
            hadErrors.set(true);
            String msg = "Reindex issue: "+fromIndexName+"->"+toIndexName+" id="+id;
            LOGGER.error(msg,e);
          }
          
          if (feedbackCount.get() >= feedbackCountThreshold) {
            feedbackCount.set(0);
            if ((System.currentTimeMillis() - feedbackStartMillis.get()) >= feedbackMillis) {
              logFeedback(tStart,count.get(),scroller.getTotalHits(),false);
              feedbackStartMillis.set(System.currentTimeMillis());
            }
          } 
          
        }
      }
    );
    
    /*
    long tEnd = System.currentTimeMillis();
    double tSec = (tEnd - tStart) / 1000.0;
    String tMsg = (Math.round(tSec / 60.0 * 100.0) / 100.0)+" minutes";
    if (tSec <= 600) tMsg = (Math.round(tSec * 100.0) / 100.0)+" seconds";
    LOGGER.info("Reindex: "+fromIndexName+"->"+toIndexName+", "+tMsg);
    */
    logFeedback(tStart,count.get(),scroller.getTotalHits(),true);
    
    JsonObjectBuilder jbr = Json.createObjectBuilder();
    if (hadErrors.get()) {
      jbr.add("status","completedWithErrors");
    } else {
      jbr.add("status","completed");
    }
    response.writeOkJson(this,jbr);
    return response;
  }
  
  /**
   * Log feedback.
   * @param tStart the start time
   * @param count the item count
   * @param total the total number of items
   * @param finished true if the job has finished
   */
  private void logFeedback(long tStart, long count, long total, boolean finished) {
    long tEnd = System.currentTimeMillis();
    double tSec = (tEnd - tStart) / 1000.0;
    String msg = "Reindex: "+fromIndexName+"->"+toIndexName;
    if (finished) msg = "Finished "+msg;
    String tMsg = (Math.round(tSec / 60.0 * 100.0) / 100.0)+" minutes";
    if (tSec <= 600) tMsg = (Math.round(tSec * 100.0) / 100.0)+" seconds";
    String nMsg = count+" of "+total;
    LOGGER.debug(msg+", "+tMsg+", "+nMsg);
  }
  
  /**
   * Read the xml from an earlier storage version .
   * @param ec the context
   * @param id the id
   * @param indexName the index name
   * @return the xml
   */
  private String readOldXml(ElasticContext ec, String id, String indexName) {
    GetRequestBuilder req = ec.getTransportClient().prepareGet(indexName,"xml",id);
    GetResponse resp = req.get();
    if (resp.isExists()) {
      return (String)resp.getSource().get("xml");
    }
    return null;
  }
  
  /**
   * Read an xml.
   * @param ec the context
   * @param itemio the item io
   * @param id the id
   * @param indexName the index name
   * @param cue the from index version cue
   * @return the xml
   * @throws Exception
   */
  private String readXml(ElasticContext ec, ItemIO itemio, String id, String indexName, String cue) 
      throws Exception {
    if (cue != null && cue.equals("old")) {
      return readOldXml(ec,id,indexName);
    } else {
      return itemio.readXml(ec,id,indexName);
    }
    
  }
  
}
