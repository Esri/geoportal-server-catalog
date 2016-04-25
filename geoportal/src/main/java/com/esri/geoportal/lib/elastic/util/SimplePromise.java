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
package com.esri.geoportal.lib.elastic.util;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;

/**
 * A simple promise.
 * @param <T> the result type
 */
class SimplePromise<T> {
  
  /** Instance variables. */
  
  private Consumer<T> callback;
  private Consumer<Throwable> errback;
  
  private T result;
  private Throwable error;
  
  private AtomicBoolean hasCallback = new AtomicBoolean(false);
  private AtomicBoolean hasErrback = new AtomicBoolean(false);
  private AtomicBoolean wasResolved = new AtomicBoolean(false);
  private AtomicBoolean wasRejected = new AtomicBoolean(false);
  private AtomicBoolean wasFulfilled = new AtomicBoolean(false);
  
  /** Constructor */
  public SimplePromise() {}

  /**
   * Then callback.
   * @param callback the callback
   * @return the promise
   */
  public SimplePromise<T> then(Consumer<T> callback) {
    this.callback = callback;
    hasCallback.set(true);
    checkCallback();
    return this;
  }
  
  /**
   * Katch callback.
   * @param errback the errback
   * @return the promise
   */
  public SimplePromise<T> katch(Consumer<Throwable> errback) {
    this.errback = errback;
    hasErrback.set(true);
    checkErrback();
    return this;
  }
  
  /**
   * Resolve the promise
   * @param result the result
   */
  public void resolve(T result) {
    this.result = result;
    if (wasResolved.compareAndSet(false,true)) {
      checkCallback();
    }
  }
  
  /**
   * Reject the promise.
   * @param error the error
   */
  public void reject(Throwable error) {
    this.error = error;
    if (wasRejected.compareAndSet(false,true)) {
      checkErrback();
    }
  }
  
  /** Check the "then" callback. */
  private void checkCallback() {
    if (wasResolved.get() && (hasCallback.get())) {
      if (wasFulfilled.compareAndSet(false,true)) {
        callback.accept(result);
      }
    }
  }
  
  /** Check the "katch" errback. */
  private void checkErrback() {
    if (wasRejected.get() && (hasErrback.get())) {
      if (wasFulfilled.compareAndSet(false,true)) {
        errback.accept(error);
      }
    }
  }
  
}
