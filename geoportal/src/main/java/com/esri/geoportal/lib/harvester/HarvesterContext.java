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
package com.esri.geoportal.lib.harvester;

import java.util.ArrayList;
import java.util.List;

/**
 * Harvester context.
 */
public class HarvesterContext {
  
  /** Instance variables */
  private List<String> nodes;

  /** 
   * Gets node names.
   * @return  
   */
  public List<String> getNodes() {
    return this.nodes;
  }
  /** 
   * Sets node names.
   * @param nodes 
   */
  public void setNodes(List<String> nodes) {
    this.nodes = nodes;
  }
  
  /**
   * Return an array of node names.
   * <br>Names are split by commas.
   * @return the node names
   */
  public String[] nodesToArray() {
    ArrayList<String> al = new ArrayList<String>();
    if (getNodes() != null) {
      for (String node: this.getNodes()) {
        String[] a = node.split(",");
        for (String v: a) {
          v = v.trim();
          if (v.length() > 0) al.add(v);
        }
      }
    }
    return al.toArray(new String[0]);
  }
}
