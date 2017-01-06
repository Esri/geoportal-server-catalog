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
package com.esri.geoportal.lib.elastic.kvp;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.util.FieldNames;

import org.elasticsearch.action.get.GetRequestBuilder;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.action.index.IndexRequestBuilder;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.index.get.GetField;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Key-value pair (Clob).
 */
public class KvpClob extends Kvp {
  
  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(KvpClob.class);
  
  /** Constructor. */
  public KvpClob() {
    super();
    setDataFieldName(FieldNames.FIELD_SYS_CLOB);
  }
  
  /**
   * Read content.
   * @param ec the context
   * @return the content
   * @throws Exception
   */
  public String readClob(ElasticContext ec) throws Exception {
    setFound(false);
    String fieldName = getDataFieldName();
    GetRequestBuilder req = ec.getTransportClient().prepareGet(getIndexName(),getIndexType(),getId());
    req.setFetchSource(false);
    /* ES 2to5 */
    //req.setFields(fieldName);
    req.setStoredFields(fieldName);
    GetResponse resp = req.get();
    if (resp.isExists()) {
      setFound(true);
      try {
        GetField field = resp.getField(fieldName);
        if (field != null) {
          return (String)field.getValue();
        }
        //String v = (String)resp.getSource().get(fieldName);
        //System.err.println(v);
        //return v;
      } catch (Exception e) {
        String msg = getIndexName()+"/"+getIndexType()+"/"+getId();
        LOGGER.error("Error reading field: "+fieldName+", "+msg,e);
      }
    }
    return null;
  }
  
  /**
   * Read the content.
   * @param ec the context
   * @return the content
   * @throws Exception
   */
  public String readUtf8(ElasticContext ec) throws Exception {
    return readClob(ec);
  }
  
  /**
   * Write content.
   * @param ec the context
   * @param content the content
   * @return the response
   * @throws Exception
   */
  public IndexResponse writeString(ElasticContext ec, String content) throws Exception {
    IndexRequestBuilder req = ec.getTransportClient().prepareIndex(getIndexName(),getIndexType(),getId()); 
    req.setSource(
      getDataFieldName(), content,
      FieldNames.FIELD_SYS_ITEMID, getItemId(),
      FieldNames.FIELD_SYS_META, getMeta()
    );
    return req.get();
  }

}
