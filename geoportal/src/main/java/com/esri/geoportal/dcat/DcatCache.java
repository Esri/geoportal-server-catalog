/*
 * Copyright 2013 Esri.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.esri.geoportal.dcat;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.regex.Pattern;
import org.apache.commons.lang3.StringUtils;

/**
 * DCAT cache.
 * 
 * Provides general mechanism to maintain DCAT cache.
 */
public class DcatCache {
  private static final Pattern CACHE_NAME_PATTERN = Pattern.compile("cache[^.]*\\.dcat",Pattern.CASE_INSENSITIVE);
  private static final Pattern TEMP_NAME_PATTERN = Pattern.compile("cache[^.]*\\.temp",Pattern.CASE_INSENSITIVE);
  private static final SimpleDateFormat SDF = new SimpleDateFormat("yyyy-MM-dd hh-mm");
  
  private final File root;
  
  /**
   * Creates instance of the cache.
   * @param rootDir root folder of the cache
   */
  public DcatCache(String rootDir) {
    this.root = new File(StringUtils.defaultIfBlank(rootDir, getDefaultDCATPath()));
  }
  
  /**
   * Initialize cache.
   */
  public void init() {
    root.mkdirs();
  }
  
  /**
   * Gets last modified date of the cache.
   * @return date or <code>null</code> if cache doesn't exist
   */
  public Date getLastModified() {
    File latestCache = getLastCacheFile();
    return latestCache!=null? new Date(latestCache.lastModified()): null;
  }
  
  /**
   * Creates cache stream from the latest cache data.
   * @return input stream
   * @throws FileNotFoundException if cache data file not found
   */
  public InputStream createInputCacheStream() throws FileNotFoundException {
    File latestCache = getLastCacheFile();
    if (latestCache==null) {
      throw new FileNotFoundException("No recent cache found.");
    }
    return new FileInputStream(latestCache);
  }
  
  /**
   * Creates output stream to write into the cache.
   * @return output stream
   * @throws FileNotFoundException if can not create stream
   */
  public DcatCacheOutputStream createOutputCacheStream() throws FileNotFoundException {
    File file = new File(root,"cache-"+SDF.format(new Date())+".temp");
    return new DcatCacheOutputStream(file);
  }
  
  /**
   * Purges outdated files.
   */
  public void purgeOutdatedFiles() {
    File[] cacheFiles = listCacheFiles();
    purgeOutdatedFiles(cacheFiles, findLatest(cacheFiles));
    File[] tempFiles = listTempFiles();
    purgeOutdatedFiles(tempFiles, null);
  }
  
  /**
   * Gets last cache file.
   * @return last cache file or <code>null</code> if not found
   */
  private File getLastCacheFile() {
    File [] cacheFiles = listCacheFiles();
    File latestCache = findLatest(cacheFiles);
    return latestCache;
  }
  
  /**
   * Lists all cache files.
   * @return array of cache files
   */
  private File[] listCacheFiles() {
    return root.listFiles((File dir, String name) -> CACHE_NAME_PATTERN.matcher(name).matches());
  }
  
  /**
   * Lists all cache files.
   * @return array of cache files
   */
  private File[] listTempFiles() {
    return root.listFiles((File dir, String name) -> TEMP_NAME_PATTERN.matcher(name).matches());
  }
  
  /**
   * Finds the latest file.
   * @param files array of files
   * @return latest file or <code>null</code> if no latest file available
   */
  private File findLatest(File [] files) {
    File latest = null;
    if (files!=null) {
      for (File f: files) {
        if (latest==null || f.lastModified()>latest.lastModified()) {
          latest = f;
        }
      }
    }
    return latest;
  }
  
  /**
   * Purges outdated files.
   * @param files list of files
   * @param latest latest file
   */
  private void purgeOutdatedFiles(File [] files, File latest) {
    for (File f: files) {
      if (!f.equals(latest)) {
        f.delete();
      }
    }
  }
  
  /**
   * Gets default DCAT cache path.
   * @return default DCAT cache path
   */
  private static String getDefaultDCATPath() {
    File home = new File(System.getProperty("user.home"));
    return new File(home, "dcat/cache").getAbsolutePath();
  }
  
}
