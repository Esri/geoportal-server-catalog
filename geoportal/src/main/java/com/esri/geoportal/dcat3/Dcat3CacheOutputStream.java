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
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

/**
 * DCAT-US 3.0 cache output stream.
 *
 * <p>Writes into a <code>.temp</code> file which is renamed to
 * <code>.dcat3</code> on {@link #close()}, so that a partially written
 * document is never served.</p>
 */
public class Dcat3CacheOutputStream extends OutputStream {

  private final File file;
  private final FileOutputStream fileOutputStream;
  private boolean aborted;

  /**
   * Creates instance of the stream.
   * @param file temporary file backing the stream
   * @throws FileNotFoundException if creating the stream fails
   */
  public Dcat3CacheOutputStream(File file) throws FileNotFoundException {
    this.file = file;
    this.file.getParentFile().mkdirs();
    this.fileOutputStream = new FileOutputStream(file);
  }

  @Override
  public void write(int b) throws IOException {
    fileOutputStream.write(b);
  }

  @Override
  public void write(byte[] b, int off, int len) throws IOException {
    fileOutputStream.write(b, off, len);
  }

  @Override
  public void flush() throws IOException {
    fileOutputStream.flush();
  }

  /**
   * Aborts writing and removes the temporary file.
   * @throws IOException if closing the underlying stream fails
   */
  public void abort() throws IOException {
    aborted = true;
    fileOutputStream.close();
    file.delete();
  }

  @Override
  public void close() throws IOException {
    if (aborted) return;
    fileOutputStream.close();

    // make the temporary file permanent
    String name = file.getName().replaceAll("\\.[^.]+$", Dcat3Cache.CACHE_EXTENSION);
    File target = new File(file.getParentFile(), name);
    if (target.exists()) {
      target.delete();
    }
    file.renameTo(target);
  }
}
