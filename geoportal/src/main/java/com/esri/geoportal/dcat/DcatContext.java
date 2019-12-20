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

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * DCAT context.
 */
public class DcatContext {
  private volatile boolean running;
  
  /**
   * Checks if DCAT build process is currently running.
   * @return <code>true</code> if DCAT build process is currently running
   */
  public synchronized boolean isRunning() {
    return running;
  }
  
  /**
   * Tries to enter (start) DCAT building process.
   * @return <code>true</code> if DCAT building process entered
   */
  public synchronized boolean enterRunning() {
    if (!running) {
      running = true;
      return true;
    }
    return false;
  }
  
  /**
   * Exits DCAT building process.
   */
  public synchronized void exitRunning() {
    running = false;
  }
  
  /**
   * Aborts DCAT building process.
   */
  public synchronized void abortRunning() {
    if (running) {
      exitRunning();
      try {
        wait();
      } catch (InterruptedException ignore) {
      }
    }
  }
}
