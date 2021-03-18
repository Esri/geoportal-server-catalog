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

import com.esri.geoportal.base.util.BalancerSupport;
import com.esri.geoportal.context.GeoportalContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import org.eclipse.jetty.proxy.BalancerServlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Harvester proxy.
 */
public class HarvesterProxy extends BalancerServlet {
  private static final Logger LOGGER = LoggerFactory.getLogger(HarvesterProxy.class);
  private BalancerSupport balancerSupport = new BalancerSupport();

  @Override
  public void init() throws ServletException {
    super.init();
    GeoportalContext gc = GeoportalContext.getInstance();
    if (gc!=null) {
      HarvesterContext hc = gc.getHarvesterContext();
      if (hc!=null) {
        String[] nodes = hc.nodesToArray();
        if (nodes!=null && nodes.length>0) {
          for (String node: nodes) {
            String url = node;
            LOGGER.debug("Adding BalancerNode: "+url);
            balancerSupport.getBalancerNodes().add(new BalancerSupport.BalancerNode(url));
          }
        }
      }
    }
  }

  @Override
  protected String rewriteTarget(HttpServletRequest clientRequest) {
    return balancerSupport.rewriteTarget(clientRequest);
  }
}
