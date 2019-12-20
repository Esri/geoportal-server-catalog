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

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * DCAT controller.
 */
public class DcatController extends DcatContext {

  /**
   * Logger
   */
  private static final Logger LOGGER = LoggerFactory.getLogger(DcatController.class);
  /**
   * Scheduled execution service
   */
  private static final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(1);
  /**
   * run at property
   */
  private String runAt;
  /**
   * DCAT cache
   */
  private final DcatCache dcatCache;
  private final DcatBuilder dcatBuilder;

  /**
   * Creates instance of the controller.
   * @param runAt time of the day to run at
   * @param dcatCache DCAT cache
   * @param dcatBuilder DCAT builder
   */
  public DcatController(String runAt, DcatCache dcatCache, DcatBuilder dcatBuilder) {
    this.runAt = StringUtils.trimToNull(runAt);
    this.dcatCache = dcatCache;
    this.dcatBuilder = dcatBuilder;
  }
  
  /**
   * Initializes controller.
   */
  public void init() {
    if (runAt!=null) {
      LOGGER.info(String.format("DCAT cache build task to run at %s.", runAt));
      try {
        final HoursMinutes hm = HoursMinutes.parse(runAt);
        startExecutionAt(hm);
      } catch (IllegalArgumentException ex) {
        LOGGER.error(String.format("DCAT cache build task to run at %s failed.", runAt), ex);
      }
    }
  }

  /**
   * Destroys controller.
   */
  public void destroy() {
    LOGGER.info("DCAT cache build process stopped.");
    abortRunning();
    executorService.shutdownNow();
  }
  
  /**
   * Generates DCAT.
   */
  public void generateDcat() {
    if (enterRunning()) {
      LOGGER.info("DCAT cache build started...");
      
      try {
        dcatBuilder.build(this);
        dcatCache.purgeOutdatedFiles();
      } catch (Exception ex) {
        LOGGER.error(String.format("DCAT error creating cache!"), ex);
      }
      
      exitRunning();
    }
  }

  private void startExecutionAt(HoursMinutes hm) {
    Runnable taskWrapper = new Runnable() {
      @Override
      public void run() {
        generateDcat();
        startExecutionAt(hm);
      }
    };
    
    long delay = hm.tillNextRun().getSeconds();
    executorService.schedule(taskWrapper, delay, TimeUnit.SECONDS);
    LOGGER.info(String.format("DCAT cache build task scheduled to run in %d seconds.", delay));
  }

  private static final class HoursMinutes {

    public final int targetHour;
    public final int targetMin;

    public HoursMinutes(int hours, int minutes) {
      this.targetHour = hours;
      this.targetMin = minutes;
    }

    public Duration tillNextRun() {
      LocalDateTime localNow = LocalDateTime.now();
      ZoneId currentZone = ZoneId.systemDefault();
      ZonedDateTime zonedNow = ZonedDateTime.of(localNow, currentZone);

      ZonedDateTime zonedNextTarget = zonedNow.withHour(targetHour).withMinute(targetMin).withSecond(0);
      if (zonedNow.compareTo(zonedNextTarget) >= 0) {
        zonedNextTarget = zonedNextTarget.plusDays(1);
      }

      Duration duration = Duration.between(zonedNow, zonedNextTarget);
      return duration;
    }

    public static HoursMinutes parse(String strHM) {
      if (strHM == null) {
        throw new IllegalArgumentException(String.format("Null hours:minutes"));
      }

      String[] hm = strHM.split(":");
      if (hm == null || hm.length != 2) {
        throw new IllegalArgumentException(String.format("Invalid hours:minutes (%s)", strHM));
      }

      try {
        return new HoursMinutes(Integer.parseInt(hm[0]), Integer.parseInt(hm[1]));
      } catch (NumberFormatException ex) {
        throw new IllegalArgumentException(String.format("Invalid hours:minutes (%s)", strHM), ex);
      }
    }

    @Override
    public String toString() {
      return String.format("%d:%d", targetHour, targetMin);
    }
  }
}
