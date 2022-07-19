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
import FeatureLayer from 'esri/layers/FeatureLayer';
import { readRestInfo, generateId } from '../utils';
import { waitForLayer } from './layerUtils';
import BaseService from './BaseService';

export default class FeatureServiceUtils extends BaseService {

  getLayersToAdd = function (url: string) {
    return readRestInfo(url).then(
       (response) => {
        let res = response.data;
        let layerPromises = [];

        if (
          typeof res?.type === 'string' &&
          (res.type === 'Feature Layer' || res.type === 'Table')
        ) {
          // a single layer registered from a service /FeatureServer/1 or /MapServer/2
          let layer = new FeatureLayer({ url, id: generateId(), outFields: ['*'] });
          layer.load();
          layerPromises.push(waitForLayer(layer));
        } else {
          // sub-layers in feature service
          let lyrs = [];
          if (res.layers && res.layers.length > 0) {
            lyrs.push(...res.layers);
          }
          if (res.tables && res.tables.length > 0) {
            lyrs.push(...res.tables);
          }

          for (let i = 0; i < lyrs.length; i++) {
            let layer = new FeatureLayer({
              url: url + '/' + lyrs[i].id,
              id: generateId(),
              outFields: ['*'],
            });
            layer.load();
            layerPromises.push(waitForLayer(layer));
          }
        }

        return Promise.all(layerPromises)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            console.error(err);
            return null;
          });
      },
      (error) => {
        console.error(error);
        return null;
      }
    );
  };
}
