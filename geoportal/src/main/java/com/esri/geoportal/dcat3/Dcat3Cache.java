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

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.commons.lang3.StringUtils;

/**
 * DCAT-US 3.0 cache.
 *
 * <p>Maintains the generated DCAT-US 3.0 documents on disk. Only the most
 * recent document is served; older ones are purged after each successful
 * build.</p>
 */
public class Dcat3Cache {

  /** Extension of a completed cache file. */
  public static final String CACHE_EXTENSION = ".dcat3";

  private final File root;

  /**
   * Creates instance of the cache.
   * @param rootDir root folder of the cache, or blank for the default
   *                (<code>&lt;USER_HOME&gt;/dcat3/cache</code>)
   */
  public Dcat3Cache(String rootDir) {
    this.root = new File(StringUtils.defaultIfBlank(rootDir, getDefaultDcat3Path()));
  }

  /**
   * Initializes the cache folder.
   */
  public void init() {
    root.mkdirs();
  }

  /**
   * Gets the root folder.
   * @return the root folder
   */
  public File getRoot() {
    return root;
  }

  /**
   * Gets the last modified date of the cache.
   * @return the date or <code>null</code> if the cache doesn't exist
   */
  public Date getLastModified() {
    return getLastModified(null);
  }

  public Date getLastModified(String profile) {
    File latestCache = getLastCacheFile(profile);
    return latestCache != null ? new Date(latestCache.lastModified()) : null;
  }

  /**
   * Gets the size of the cached document.
   * @return the size in bytes or <code>-1</code> when no cache exists
   */
  public long getSize() {
    return getSize(null);
  }

  public long getSize(String profile) {
    File latestCache = getLastCacheFile(profile);
    return latestCache != null ? latestCache.length() : -1L;
  }

  /**
   * Creates an input stream over the latest cached document.
   * @return the input stream
   * @throws FileNotFoundException if no cached document exists
   */
  public InputStream createInputCacheStream() throws FileNotFoundException {
    return createInputCacheStream(null);
  }

  public InputStream createInputCacheStream(String profile) throws FileNotFoundException {
    File latestCache = getLastCacheFile(profile);
    if (latestCache == null) {
      throw new FileNotFoundException("No recent DCAT-US 3.0 cache found.");
    }
    return new FileInputStream(latestCache);
  }

  /**
   * Creates an output stream to write a new cached document.
   * @return the output stream
   * @throws FileNotFoundException if the stream can not be created
   */
  public Dcat3CacheOutputStream createOutputCacheStream() throws FileNotFoundException {
    return createOutputCacheStream(null);
  }

  public Dcat3CacheOutputStream createOutputCacheStream(String profile) throws FileNotFoundException {
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH-mm-ss");
    File file = new File(root, buildFilePrefix(profile) + sdf.format(new Date()) + ".temp");
    return new Dcat3CacheOutputStream(file);
  }

  /**
   * Purges outdated cache and leftover temporary files.
   */
  public void purgeOutdatedFiles() {
    purgeOutdatedFiles(null);
  }

  public void purgeOutdatedFiles(String profile) {
    File[] cacheFiles = listCacheFiles(profile);
    purgeOutdatedFiles(cacheFiles, findLatest(cacheFiles));
    purgeOutdatedFiles(listTempFiles(profile), null);
  }

  /**
   * Gets the last (most recent) cache file.
   * @return the cache file or <code>null</code> if not found
   */
  private File getLastCacheFile(String profile) {
    return findLatest(listCacheFiles(profile));
  }

  private File[] listCacheFiles(String profile) {
    String prefix = buildFilePrefix(profile);
    File[] files = root.listFiles((File dir, String name) -> matchesName(name, prefix, CACHE_EXTENSION));
    return files != null ? files : new File[0];
  }

  private File[] listTempFiles(String profile) {
    String prefix = buildFilePrefix(profile);
    File[] files = root.listFiles((File dir, String name) -> matchesName(name, prefix, ".temp"));
    return files != null ? files : new File[0];
  }

  private File findLatest(File[] files) {
    File latest = null;
    if (files != null) {
      for (File f : files) {
        if (latest == null || f.lastModified() > latest.lastModified()) {
          latest = f;
        }
      }
    }
    return latest;
  }

  private void purgeOutdatedFiles(File[] files, File latest) {
    if (files == null) return;
    for (File f : files) {
      if (!f.equals(latest)) {
        f.delete();
      }
    }
  }

  /**
   * Gets the default DCAT-US 3.0 cache path.
   * @return the default path
   */
  private static String getDefaultDcat3Path() {
    File home = new File(System.getProperty("user.home"));
    return new File(home, "dcat3/cache").getAbsolutePath();
  }

  private static boolean matchesName(String name, String prefix, String extension) {
    String n = StringUtils.defaultString(name).toLowerCase();
    return n.startsWith(prefix.toLowerCase()) && n.endsWith(extension.toLowerCase());
  }

  private static String buildFilePrefix(String profile) {
    String normalized = sanitizeProfile(profile);
    return StringUtils.isBlank(normalized) ? "cache-" : "cache-" + normalized + "-";
  }

  private static String sanitizeProfile(String profile) {
    String normalized = StringUtils.trimToNull(profile);
    if (normalized == null) return null;
    return normalized.toLowerCase().replaceAll("[^a-z0-9_-]", "-");
  }
}
