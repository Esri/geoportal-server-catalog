import { generateId, checkMixedContent } from '../utils';
import BaseService from './BaseService';
import KMLLayer from 'esri/layers/KMLLayer';
import { waitForLayer } from './layerUtils';

export default class KMLUtils extends BaseService {

    getLayersToAdd = function (url: string) {
        url = checkMixedContent(url);
        let options = { url, id: generateId() }
        let layer = new KMLLayer(options);
        layer.load();
        return waitForLayer(layer);
    }
}