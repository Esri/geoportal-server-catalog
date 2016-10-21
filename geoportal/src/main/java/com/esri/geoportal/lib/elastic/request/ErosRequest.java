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

import com.esri.geoportal.context.AppResponse;

/**
 * Eros request.
 */
public class ErosRequest extends OpensearchRequest {
  private static final String [] EROS_TYPES = {"FeatureServer","ImageServer","MapServer","CSW","IMS","SOS","WCS","WFS","WMS"};

  /** Constructor */
  public ErosRequest() {
    super();
    setDescriptionFile("search/eros-description.xml");
  }

  /** Methods =============================================================== */

  @Override
  public AppResponse execute() throws Exception {
    this.setUrlTypes(EROS_TYPES);
    return super.execute();
  }
  
  protected void setDefaultF() {
    this.setF("eros");
  }
}
