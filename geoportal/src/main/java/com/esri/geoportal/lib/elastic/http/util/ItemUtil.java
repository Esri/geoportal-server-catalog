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
package com.esri.geoportal.lib.elastic.http.util;

import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.esri.geoportal.lib.elastic.util.FieldNames;

import javax.json.JsonObject;

/**
 * Item utilities.
 */
public class ItemUtil {

  /**
   * Read an item.
   * @param id the item id
   * @return the response string
   * @throws Exception if an exception occurs
   */
  public String readItem(String id) throws Exception {
    ElasticClient client = ElasticClient.newClient();
    String url = client.getItemUrl(id);
    String result = client.sendGet(url);
    return result;
  }
  
  /**
   * 
   * @param id  the item id
   * @return
   * @throws Exception if an exception occurs
   */
  public JsonObject readItemJson(String id) throws Exception {
    ElasticClient client = ElasticClient.newClient();
    String url = client.getItemUrl(id);
    String result = client.sendGet(url);
    JsonObject item = (JsonObject)JsonUtil.toJsonStructure(result);
    return item;
  }
  
  /**
   * 
   * @param id the item id
   * @return the xml
   * @throws Exception if an exception occurs
   */
  public String readXml(String id) throws Exception {
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    if (ec.getUseSeparateXmlItem()) {
      ElasticClient client = ElasticClient.newClient();
      String url = client.getXmlUrl(id);
      String result = client.sendGet(url);
      if (result != null && result.length() > 0) {
        JsonObject item = (JsonObject)JsonUtil.toJsonStructure(result);
        try {
          String xml = item.getJsonObject("_source").getString(FieldNames.FIELD_SYS_CLOB);
          return xml;
        } catch (Exception e) {
          e.printStackTrace();
        }       
      }
    } else {
      JsonObject item = readItemJson(id);
      if (item != null) {
        try {
          String xml = item.getJsonObject("_source").getString(FieldNames.FIELD_SYS_XML);
          return xml;
        } catch (Exception e) {
          e.printStackTrace();
        }        
      }
    }
    return null;
  }
  
}
