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
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

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
    try {
      Path parent = this.file.getParentFile().toPath().toRealPath();
      Path source = this.file.toPath();
      ensurePathWithinParent(parent, source);
    } catch (IOException ex) {
      throw new FileNotFoundException("Invalid cache output path: " + ex.getMessage());
    }
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

    // Make the temporary file permanent. The previous cache (if any) is only
    // ever replaced by a successful move of the fully-written file, so a
    // failed/partial move never leaves the cache without a servable document.
    // ATOMIC_MOVE is preferred (single, indivisible rename); when the file
    // system / provider can't guarantee atomicity across the source and
    // target locations, fall back to a plain (still checked) move.
    String name = file.getName().replaceAll("\\.[^.]+$", Dcat3Cache.CACHE_EXTENSION);
    Path source = file.toPath();
    Path target = new File(file.getParentFile(), name).toPath();
    Path parent = file.getParentFile().toPath().toRealPath();
    ensurePathWithinParent(parent, source);
    ensurePathWithinParent(parent, target);
    try {
      Files.move(source, target, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
    } catch (AtomicMoveNotSupportedException ex) {
      Files.move(source, target, StandardCopyOption.REPLACE_EXISTING);
    }
  }

  private static void ensurePathWithinParent(Path parent, Path child) throws IOException {
    Path normalizedParent = parent.toAbsolutePath().normalize();
    Path normalizedChild = child.toAbsolutePath().normalize();
    if (!normalizedChild.startsWith(normalizedParent)) {
      throw new IOException("Path escapes cache directory: " + child);
    }
  }
}
