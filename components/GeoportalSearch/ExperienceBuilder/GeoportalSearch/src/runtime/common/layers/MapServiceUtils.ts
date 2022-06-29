import MapImageLayer from 'esri/layers/MapImageLayer';
import FeatureServiceUtils from './FeatureServiceUtils';
import TileLayer from 'esri/layers/TileLayer';
import { readRestInfo, generateId } from '../utils';
import { waitForLayer } from './layerUtils';
import BaseService from './BaseService';

export default class MapServiceUtils extends BaseService {

  getLayersToAdd = function (url: string) {
    return readRestInfo(url).then((response) => {
      let res = response.data;

      if (typeof res?.type === 'string' &&
         (res.type === 'Feature Layer' || res.type === 'Table')) {
        return new FeatureServiceUtils().getLayersToAdd(url);
      } else {
        var options = {id: generateId(), url: response.url };
        let layer = null;
        if (res.tileInfo) {
          layer = new TileLayer(options);
        } else{
          if (res.supportedImageFormatTypes?.includes("PNG32")) {
            options["imageFormat"] = "png32";
            layer = new MapImageLayer(options);
          }
        }

        if (layer) {
          layer.load();
          return waitForLayer(layer);
        }

        return null;
      }
    });
  };
}
