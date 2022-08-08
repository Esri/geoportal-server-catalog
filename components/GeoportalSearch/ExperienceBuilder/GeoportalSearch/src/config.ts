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
import { ImmutableObject } from 'seamless-immutable';

export interface Config {
  urlTooltip: string;
  typeTooltip: string;
  profileTooltip: string;
  filterTooltip: string;
  targets: Array<Target>;
  widgetTitle: string;
  showOwner: boolean;
  proxyUrl: string;
  numberOfResultsPerQuery: number;
}

export interface Target {
  name: string;
  url: string;
  type: string;
  profile: string;
  requiredFilter: string;
  enabled: boolean;
  useProxy: boolean;
  disableContentType: boolean;
}

export type IMConfig = ImmutableObject<Config>;
