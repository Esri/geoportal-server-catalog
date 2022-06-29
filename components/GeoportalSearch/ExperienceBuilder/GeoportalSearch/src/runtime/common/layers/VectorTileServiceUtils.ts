import { readRestInfo, generateId, checkMixedContent } from '../utils';
import BaseService from './BaseService';
import VectorTileLayer from 'esri/layers/VectorTileLayer';
import { waitForLayer } from './layerUtils';

export default class VectorTileServiceUtils extends BaseService {

    getLayersToAdd = function (url: string) {
        url = checkMixedContent(url);
        let options = { url, id: generateId(), opacity: 1 }
        let layer = new VectorTileLayer(options);
        layer.load();
        return waitForLayer(layer);
    }
}