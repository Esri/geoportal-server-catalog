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
package com.esri.geoportal.dcat3;

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
 * DCAT-US 3.0 controller.
 *
 * <p>Owns the DCAT-US 3.0 build lifecycle: optional daily scheduling and
 * on-demand (asynchronous) generation triggered by the REST endpoint when no
 * cached document exists yet.</p>
 */
public class Dcat3Controller extends Dcat3Context {

  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(Dcat3Controller.class);

  /** Scheduled execution service. */
  private static final ScheduledExecutorService EXECUTOR = Executors.newScheduledThreadPool(1, r -> {
    Thread t = new Thread(r, "dcat3-builder");
    t.setDaemon(true);
    return t;
  });

  /** Time of day (HH:mm) to run the build at, or <code>null</code> to disable. */
  private final String runAt;
  private final Dcat3Cache dcat3Cache;
  private final Dcat3Builder dcat3Builder;

  /**
   * Creates instance of the controller.
   * @param runAt time of the day (HH:mm) to run at, blank to disable scheduling
   * @param dcat3Cache the DCAT-US 3.0 cache
   * @param dcat3Builder the DCAT-US 3.0 builder
   */
  public Dcat3Controller(String runAt, Dcat3Cache dcat3Cache, Dcat3Builder dcat3Builder) {
    this.runAt = StringUtils.trimToNull(runAt);
    this.dcat3Cache = dcat3Cache;
    this.dcat3Builder = dcat3Builder;
  }

  /**
   * Gets the builder.
   * @return the builder
   */
  public Dcat3Builder getBuilder() {
    return dcat3Builder;
  }

  /**
   * Initializes the controller.
   */
  public void init() {
    if (runAt != null) {
      LOGGER.info("DCAT-US 3.0 cache build task to run at {}.", runAt);
      try {
        startExecutionAt(HoursMinutes.parse(runAt));
      } catch (IllegalArgumentException ex) {
        LOGGER.error("DCAT-US 3.0 cache build task to run at %s failed.".formatted(runAt), ex);
      }
    } else {
      LOGGER.info("DCAT-US 3.0 scheduled cache build is disabled.");
    }
  }

  /**
   * Destroys the controller.
   */
  public void destroy() {
    LOGGER.info("DCAT-US 3.0 cache build process stopped.");
    abortRunning();
    EXECUTOR.shutdownNow();
  }

  /**
   * Generates the DCAT-US 3.0 document synchronously.
   * @return <code>true</code> when the build was started by this call
   */
  public boolean generateDcat3() {
    if (!enterRunning()) {
      LOGGER.info("DCAT-US 3.0 cache build is already running.");
      return false;
    }

    try {
      LOGGER.info("DCAT-US 3.0 cache build started...");
      dcat3Builder.build(this);
      dcat3Cache.purgeOutdatedFiles();
    } catch (Exception ex) {
      LOGGER.error("DCAT-US 3.0 error creating cache!", ex);
    } finally {
      exitRunning();
    }
    return true;
  }

  /**
   * Generates the DCAT-US 3.0 document in the background.
   * @return <code>true</code> when a build was scheduled
   */
  public boolean generateDcat3Async() {
    if (isRunning()) return false;
    try {
      EXECUTOR.submit(this::generateDcat3);
      return true;
    } catch (Exception ex) {
      LOGGER.error("DCAT-US 3.0 unable to schedule cache build.", ex);
      return false;
    }
  }

  private void startExecutionAt(HoursMinutes hm) {
    Runnable taskWrapper = () -> {
      generateDcat3();
      startExecutionAt(hm);
    };

    long delay = hm.tillNextRun().getSeconds();
    EXECUTOR.schedule(taskWrapper, delay, TimeUnit.SECONDS);
    LOGGER.info("DCAT-US 3.0 cache build task scheduled to run in {} seconds.", delay);
  }

  /**
   * Simple hours/minutes holder used for the daily schedule.
   */
  private static final class HoursMinutes {

    private final int targetHour;
    private final int targetMin;

    HoursMinutes(int hours, int minutes) {
      this.targetHour = hours;
      this.targetMin = minutes;
    }

    Duration tillNextRun() {
      ZonedDateTime zonedNow = ZonedDateTime.of(LocalDateTime.now(), ZoneId.systemDefault());
      ZonedDateTime zonedNextTarget = zonedNow.withHour(targetHour).withMinute(targetMin).withSecond(0);
      if (zonedNow.compareTo(zonedNextTarget) >= 0) {
        zonedNextTarget = zonedNextTarget.plusDays(1);
      }
      return Duration.between(zonedNow, zonedNextTarget);
    }

    static HoursMinutes parse(String strHM) {
      if (strHM == null) {
        throw new IllegalArgumentException("Null hours:minutes");
      }
      String[] hm = strHM.split(":");
      if (hm.length != 2) {
        throw new IllegalArgumentException("Invalid hours:minutes (%s)".formatted(strHM));
      }
      try {
        return new HoursMinutes(Integer.parseInt(hm[0].trim()), Integer.parseInt(hm[1].trim()));
      } catch (NumberFormatException ex) {
        throw new IllegalArgumentException("Invalid hours:minutes (%s)".formatted(strHM), ex);
      }
    }

    @Override
    public String toString() {
      return "%d:%02d".formatted(targetHour, targetMin);
    }
  }
}
