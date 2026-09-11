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
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
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
  private final Map<String, Dcat3Context> profileContexts = new ConcurrentHashMap<>();

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
    return generateDcat3(null);
  }

  public boolean generateDcat3(String profile) {
    String resolvedProfile = dcat3Builder.getConfig().resolveProfile(profile);
    Dcat3Context context = contextFor(resolvedProfile);
    if (!context.enterRunning()) {
      LOGGER.info("DCAT-US 3.0 cache build is already running for profile '{}'.", resolvedProfile);
      return false;
    }

    try {
      LOGGER.info("DCAT-US 3.0 cache build started for profile '{}'...", resolvedProfile);
      dcat3Builder.build(context, resolvedProfile);
      dcat3Cache.purgeOutdatedFiles(resolvedProfile);
    } catch (Exception ex) {
      LOGGER.error("DCAT-US 3.0 error creating cache for profile '{}'!", resolvedProfile, ex);
    } finally {
      context.exitRunning();
    }
    return true;
  }

  /**
   * Generates the DCAT-US 3.0 document in the background.
   * @return <code>true</code> when a build was scheduled
   */
  public boolean generateDcat3Async() {
    return generateDcat3Async(null);
  }

  public boolean generateDcat3Async(String profile) {
    String resolvedProfile = dcat3Builder.getConfig().resolveProfile(profile);
    if (contextFor(resolvedProfile).isRunning()) return false;
    try {
      EXECUTOR.submit(() -> generateDcat3(resolvedProfile));
      return true;
    } catch (Exception ex) {
      LOGGER.error("DCAT-US 3.0 unable to schedule cache build for profile '{}'.", resolvedProfile, ex);
      return false;
    }
  }

  @Override
  public synchronized boolean isRunning() {
    for (Dcat3Context context : profileContexts.values()) {
      if (context.isRunning()) return true;
    }
    return false;
  }

  @Override
  public synchronized void abortRunning() {
    for (Dcat3Context context : profileContexts.values()) {
      context.abortRunning();
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

  private Dcat3Context contextFor(String profile) {
    String key = StringUtils.defaultIfBlank(dcat3Builder.getConfig().resolveProfile(profile), "default");
    return profileContexts.computeIfAbsent(key, k -> new Dcat3Context());
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
