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

/**
 * DCAT-US 3.0 build context.
 *
 * <p>Guards the DCAT-US 3.0 build process so that only one build runs at a
 * time and so that a running build can be aborted on shutdown.</p>
 */
public class Dcat3Context {

  private volatile boolean running;

  /**
   * Checks if the build process is currently running.
   * @return <code>true</code> if the build process is currently running
   */
  public synchronized boolean isRunning() {
    return running;
  }

  /**
   * Tries to enter (start) the build process.
   * @return <code>true</code> if the build process was entered
   */
  public synchronized boolean enterRunning() {
    if (!running) {
      running = true;
      return true;
    }
    return false;
  }

  /**
   * Exits the build process.
   */
  public synchronized void exitRunning() {
    running = false;
    notifyAll();
  }

  /**
   * Aborts the build process and waits for it to finish.
   */
  public synchronized void abortRunning() {
    if (running) {
      running = false;
      try {
        wait(30000);
      } catch (InterruptedException ignore) {
        Thread.currentThread().interrupt();
      }
    }
  }
}
