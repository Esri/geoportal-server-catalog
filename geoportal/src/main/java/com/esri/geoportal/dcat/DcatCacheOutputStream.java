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

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

/**
 * Cache output stream.
 * 
 * DCAT cache output stream. It maintains state between 'temporary' and 'permanent'.
 */
public class DcatCacheOutputStream extends OutputStream {

  private final File file;
  private final FileOutputStream fileOutputStream;

  /**
   * Creates instance of the stream.
   * @param file file representing the stream
   * @throws FileNotFoundException if creating stream fails
   */
  public DcatCacheOutputStream(File file) throws FileNotFoundException {
    this.file = file;
    this.file.getParentFile().mkdirs();
    this.fileOutputStream = new FileOutputStream(file);
  }

  @Override
  public void write(int b) throws IOException {
    fileOutputStream.write(b);
  }
  
  public void abort() throws IOException {
    fileOutputStream.close();
    
    // delete temporary file
    file.delete();
  }

  @Override
  public void close() throws IOException {
    fileOutputStream.close();
    
    // make temporary file permanent
    String name = file.getName();
    name = name.replaceAll("\\.[^.]+$", ".dcat");
    file.renameTo(new File(file.getParentFile(), name));
  }
  
}
