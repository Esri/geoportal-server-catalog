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
package com.esri.geoportal.base.util;

import java.io.InputStream;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Server-side access to the "appui.*" properties defined in
 * classpath:config/config.properties.
 * <p>
 * These values are also served as-is to the browser (see AppConfigService,
 * GET /rest/app-config) so the web app can tailor its UI (show/hide buttons,
 * defaults, etc.). Because any JavaScript variable - including
 * AppContext.appConfig - can be freely inspected and overwritten by a user in
 * the browser's developer tools, "appui.*" values must never be trusted as a
 * security boundary. Any server-side feature gate that mirrors an "appui.*"
 * UI flag (e.g. whether a REST endpoint is allowed, or requires an admin
 * role) must re-check the same underlying property here, independently of
 * whatever the client sends or whatever the client-side UI currently shows.
 */
public final class AppConfigUtil {

  private static final Logger LOGGER = LoggerFactory.getLogger(AppConfigUtil.class);
  private static final String RESOURCE = "config/config.properties";

  private static volatile Properties cached;

  private AppConfigUtil() {}

  /** Read a boolean "appui.*" (or any) property from config.properties, with a default. */
  public static boolean getBoolean(String key, boolean defaultValue) {
    String raw = getProperty(key);
    if (raw == null || raw.trim().length() == 0) return defaultValue;
    return Boolean.parseBoolean(raw.trim());
  }

  /** Read a raw string property from config.properties, or null if absent. */
  public static String getProperty(String key) {
    Properties props = loadProperties();
    return props != null ? props.getProperty(key) : null;
  }

  private static Properties loadProperties() {
    Properties props = cached;
    if (props != null) return props;
    synchronized (AppConfigUtil.class) {
      if (cached != null) return cached;
      Properties loaded = new Properties();
      ClassLoader cl = Thread.currentThread().getContextClassLoader();
      if (cl == null) cl = AppConfigUtil.class.getClassLoader();
      try (InputStream is = cl.getResourceAsStream(RESOURCE)) {
        if (is != null) {
          loaded.load(is);
        } else {
          LOGGER.warn("Resource not found on classpath: {}",RESOURCE);
        }
      } catch (Exception ex) {
        LOGGER.warn("Unable to load {}: {}",RESOURCE,ex.getMessage());
      }
      cached = loaded;
      return cached;
    }
  }

}
