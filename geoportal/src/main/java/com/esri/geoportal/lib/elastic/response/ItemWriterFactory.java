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
import com.esri.geoportal.base.util.Val;
import com.esri.geoportal.context.GeoportalContext;
import java.util.Map;

/**
 * Response item writer factory.
 */
public class ItemWriterFactory {
  
  /** Instance variables. */
  private Map<String,String> map;
  
  /** Constructor. */
  public ItemWriterFactory() {
    super();
  }

  /** Map of format name to implementation class name. */
  public Map<String, String> getMap() {
    return map;
  }
  /** Map of format name to implementation class name. */
  public void setMap(Map<String, String> map) {
    this.map = map;
  }
  
  /**
   * Create a new writer.
   * @param f the format
   * @return the writer
   */
  public ItemWriter newWriter(String f) {
    f = Val.trim(f);
    if (f == null) f = "";
    String ref = getMap().get(f);
    if (ref == null) ref = getMap().get("");
    if (ref != null && ref.length() > 0) {
      ItemWriter writer = GeoportalContext.getInstance().getBean(ref,ItemWriter.class);
      return writer;
    }
    return new ItemWriter();
  }
  
}
