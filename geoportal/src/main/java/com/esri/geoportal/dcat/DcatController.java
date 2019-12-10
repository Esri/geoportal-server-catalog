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
package com.esri.geoportal.dcat;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DcatController {
  
  /** Logger */
  private static final Logger LOGGER = LoggerFactory.getLogger(DcatController.class);
  /** Scheduled execution service */
  private static final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(1);
  /** run at property */
  private String runAt;

  public void setRunAt(String runAt) {
    this.runAt = runAt;
  }

  public void init() {
    LOGGER.info(String.format("Initializing DCAT controller to run at %s", runAt));
    try {
      HoursMinutes hm = HoursMinutes.parse(runAt);
    } catch (IllegalArgumentException ex) {
      LOGGER.error(String.format("Initialization of DCAT controller to run at %s failed", runAt), ex);
    }
  }
  
  public void destroy() {
    LOGGER.info("Destroying DCAT conroller");
    executorService.shutdown();
  }
  
  private static final class HoursMinutes {
    public final int hours;
    public final int minutes;
    
    public HoursMinutes(int hours, int minutes) {
      this.hours = hours;
      this.minutes = minutes;
    }
    
    public static HoursMinutes parse(String strHM) {
      if (strHM == null) 
        throw new IllegalArgumentException(String.format("Null hours:minutes"));
      
      String [] hm = strHM.split(":");
      if (hm==null || hm.length!=2)
        throw new IllegalArgumentException(String.format("Invalid hours:minutes (%s)", strHM));
      
      try {
        return new HoursMinutes(Integer.parseInt(hm[0]), Integer.parseInt(hm[1]));
      } catch (NumberFormatException ex) {
        throw new IllegalArgumentException(String.format("Invalid hours:minutes (%s)", strHM), ex);
      }
    }
    
    @Override
    public String toString() {
      return String.format("%d:%d", hours, minutes);
    }
  }
}
