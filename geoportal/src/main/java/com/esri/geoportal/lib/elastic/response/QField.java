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
package com.esri.geoportal.lib.elastic.response;
import java.util.Map;

/**
 * Field information (for a queryable, returnable, sortable).
 */
public class QField {

  /** The field name. */
  public String name;

  /** The namespace prefix. */
  public String namespacePrefix; 

  /** The namespace URI. */
  public String namespaceUri; 

  /** The qualified name. */
  public String qname;

  /** True if the field is sortable. */
  public boolean sortable;

  /** Default constructor. */
  public QField() {}

  /**
   * Constructor.
   * @param name the name (can be qualified)
   * @param namespaceUri the namespace URI
   */
  public QField(String name, String namespaceUri) {
    this.name = name;
    this.qname = name;
    this.namespaceUri = namespaceUri;
    int nIdx = name.indexOf(":");
    if (nIdx != -1) {
      this.namespacePrefix = name.substring(0,nIdx);
      this.name = name.substring(nIdx+1);
    }
  }

  /**
   * Constructor.
   * @param name the name (can be qualified)
   * @param nsUriByPrefix a map of namespace URIs keyed by prefix
   */
  public QField(String name, Map<String,String> nsUriByPrefix) {
    this.name = name;
    this.qname = name;
    int nIdx = name.indexOf(":");
    if (nIdx != -1) {
      this.namespacePrefix = name.substring(0,nIdx);
      this.name = name.substring(nIdx+1);
      this.namespaceUri = nsUriByPrefix.get(this.namespacePrefix);
    }
  }

}
