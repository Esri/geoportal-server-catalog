import { generateId, checkMixedContent } from '../utils';
import BaseService from './BaseService';
import WMSLayer from 'esri/layers/WMSLayer';
import { waitForLayer } from './layerUtils';

export default class WMSUtils extends BaseService {

    getLayersToAdd = function (url: string) {
        url = checkMixedContent(url);
        let options = { url, id: generateId() }
        let layer = new WMSLayer(options);
        layer.load();
        return waitForLayer(layer);
    }
}