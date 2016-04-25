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
import com.esri.geoportal.base.metadata.MetadataDocument;
import com.esri.geoportal.lib.elastic.ElasticContext;

import javax.json.JsonObjectBuilder;
import org.elasticsearch.action.delete.DeleteResponse;
import org.elasticsearch.action.index.IndexResponse;

/**
 * Key-value pair (XML Clob).
 */
public class XmlContent extends KvpClob {
  
  /**
   * Constructor.
   * @param ec the context
   */
  public XmlContent(ElasticContext ec) {
    setIndexName(ec.getXmlIndexName());
    setIndexType(ec.getXmlIndexType());
  }
  
  /**
   * Check the id.
   * @param id
   * @return the id
   */
  private String checkId(String id) {
    if (id != null && id.length() > 0) {
      if (!id.endsWith("_xml")) id += "_xml";
    }
    return id;
  }
  
  @Override
  public DeleteResponse deleteContent(ElasticContext ec, String id) throws Exception {
    id = checkId(id);
    return super.deleteContent(ec,id);
  }
  
  /**
   * Read an xml.
   * @param ec the context
   * @param id the id
   * @throws Exception
   */
  public String readXml(ElasticContext ec, String id) throws Exception {
    return readXml(ec,id,ec.getXmlIndexName());
  }
  
  /**
   * Read an xml.
   * @param ec the context
   * @param id the id
   * @return the index name
   * @throws Exception
   */
  public String readXml(ElasticContext ec, String id, String indexName) throws Exception {
    this.setId(checkId(id));
    this.setIndexName(indexName);
    return this.readUtf8(ec);
  }
  
  /**
   * Read an xml hash.
   * @param ec the context
   * @param id the id
   * @return the hash
   * @throws Exception
   */
  public String readXmlHash(ElasticContext ec, String id) throws Exception {
    this.setId(checkId(id));
    return readHash(ec);
  }
  
  /**
   * Write XML content.
   * @param ec the context
   * @param mdoc the metadata document
   * @return the response
   * @throws Exception
   */
  public IndexResponse write(ElasticContext ec, MetadataDocument mdoc) throws Exception {
    return write(ec,mdoc,ec.getXmlIndexName());
  }
  
  /**
   * Write XML content.
   * @param ec the context
   * @param mdoc the metadata document
   * @param indexName the index name
   * @return the response
   * @throws Exception
   */
  public IndexResponse write(ElasticContext ec, MetadataDocument mdoc, String indexName) throws Exception {
    this.setIndexName(indexName);
    String itemId = mdoc.getItemId();
    this.setId(checkId(itemId));
    this.setItemId(itemId);
    byte[] bytes = null;
    if (mdoc.hasXml()) {
      bytes = mdoc.getXml().getBytes("UTF-8");
    }
    JsonObjectBuilder jb =  prepareMeta("application/xml",bytes);
    setMeta(jb.build().toString());
    return this.writeString(ec,mdoc.getXml());
  }

}
