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
import Map from 'esri/Map';
import Layer from 'esri/layers/Layer';
import FeatureServiceUtils from './FeatureServiceUtils';
import MapServiceUtils from './MapServiceUtils';
import VectorTileServiceUtils from './VectorTileServiceUtils';
import KMLUtils from './KMLUtils';
import ImageServiceUtils from './ImageServiceUtils';
import WMSUtils from "./WMSUtils";
import { checkMixedContent } from "../utils";

export function addItem(
  map: __esri.Map,
  serviceType: string,
  url: string,
  portalItem: any,
  portalItemUrl: string,
  referenceId: string
) {
  // placeholder function for now that directly calls 'addLayer'
  return addLayer(map, serviceType, url, referenceId);
}

export function addLayer(map: __esri.Map, serviceType: string, url: string, referenceId: string) {

  url = checkMixedContent(url);
  let addPromise = null;

  switch (serviceType) {
    case "Feature Service":
      addPromise = new FeatureServiceUtils().getLayersToAdd(url);
      break;

    case "Map Service":
      addPromise = new MapServiceUtils().getLayersToAdd(url);
      break;

    case "Vector Tile Service":
      addPromise = new VectorTileServiceUtils().getLayersToAdd(url);
      break;

    case "KML":
      addPromise = new KMLUtils().getLayersToAdd(url);
      break;

    case "Image Service":
      addPromise = new ImageServiceUtils().getLayersToAdd(url);
      break;

    case "WMS":
      addPromise = new WMSUtils().getLayersToAdd(url);
      break;

    default:
      break;
  }

  return addPromise.then(
    (resp) => {
      // array of layers is returned
      if (resp?.length && resp?.length > 0)
        return addLayersToMap(map, resp, referenceId);
      else
        return addLayerToMap(map, resp, referenceId); // single layer
      return null;
    }
    ,
    (error) => {
      console.error(error);
      return null;
    }
  );
}

export function addLayerToMap(map: Map, layer: Layer, referenceId: string): Layer | null {
  try {
    // @ts-ignore
    layer.xtnReferenceId = referenceId;
    map.add(layer);
    return layer;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function addLayersToMap(map: Map, layers: Layer[], referenceId: string): Layer[] | null {
  try {
    // @ts-ignore
    layers.forEach((lyr) => (lyr.xtnReferenceId = referenceId));

    map.addMany(layers);
    return layers;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function removeLayersFromMap(map: Map, referenceId: string): boolean {
  try {
    const layers = findLayersAdded(map, referenceId);
    const removedLayers = map.removeMany(layers);

    // selected layers removed
    if (removedLayers.length === layers.length) return true;

    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export function waitForLayer(layer: __esri.Layer): Promise<any> {
  return layer.when(
    () => {
      if (layer.loaded) return layer;
    },
    (error) => error
  );
}

export function findLayersAdded(map: Map, referenceId: string): Layer[] {
  // @ts-ignore
  const lyrs = map.layers.filter((lyr) => lyr.xtnReferenceId && lyr.xtnReferenceId === referenceId);
  // @ts-ignore
  const tbls = map.tables.filter((tbl) => tbl.xtnReferenceId && tbl.xtnReferenceId === referenceId);

  return [...lyrs, ...tbls];
}
