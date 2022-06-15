import Map from 'esri/Map';
import Layer from 'esri/layers/Layer';
import FeatureServiceUtils from './FeatureServiceUtils';

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

  return new FeatureServiceUtils().getLayerToAdd(url).then(
    (layers) => {
      if (layers?.length > 0) return addLayersToMap(map, layers, referenceId);
      return false;
    }
    ,
    (error) => {
      console.error(error);
      return false;
    }
  );
}

export function addLayerToMap(map: Map, layer: Layer, referenceId: string): boolean {
  try {
    // @ts-ignore
    layer.xtnReferenceId = referenceId;
    map.add(layer);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export function addLayersToMap(map: Map, layers: Layer[], referenceId: string): boolean {
  try {
    // @ts-ignore
    layers.forEach((lyr) => (lyr.xtnReferenceId = referenceId));

    map.addMany(layers);
    return true;
  } catch (e) {
    console.error(e);
    return false;
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
      console.log('resolved');
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
