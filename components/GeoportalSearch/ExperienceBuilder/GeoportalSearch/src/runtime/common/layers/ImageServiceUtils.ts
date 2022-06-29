import { readRestInfo, generateId, checkMixedContent } from '../utils';
import BaseService from './BaseService';
import ImageryLayer from 'esri/layers/ImageryLayer';
import { waitForLayer } from './layerUtils';

export default class ImageServiceUtils extends BaseService {

    getLayersToAdd = function (url: string) {
        url = checkMixedContent(url);
        let options = { url, id: generateId() }
        let layer = new ImageryLayer(options);
        layer.load();
        return waitForLayer(layer);
    }
}