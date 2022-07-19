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
import esriRequest from 'esri/request';

export function checkMixedContent(uri): string {
  if (typeof window.location.href === 'string' && window.location.href.indexOf('https://') === 0) {
    if (typeof uri === 'string' && uri.indexOf('http://') === 0) {
      uri = 'https:' + uri.substring(5);
    }
  }
  return uri;
}

export function endsWith(sv, sfx) {
  return sv.indexOf(sfx, sv.length - sfx.length) !== -1;
}

export function escapeForLucene(value) {
  let a = ['+', '-', '&', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '\\'];
  let r = new RegExp('(\\' + a.join('|\\') + ')', 'g');
  return value.replace(r, '\\$1');
}

export function generateId(): string {
  let t = null;
  if (typeof Date.now === 'function') {
    t = Date.now();
  } else {
    t = new Date().getTime();
  }
  let r = ('' + Math.random()).replace('0.', 'r');
  return (t + '' + r).replace(/-/g, '');
}

export function readRestInfo(url: string):Promise<__esri.RequestResponse> {
  url = checkMixedContent(url);
  return esriRequest(url, {
    responseType: "json",
    query: {
      f: 'json'
    },
  });
}
