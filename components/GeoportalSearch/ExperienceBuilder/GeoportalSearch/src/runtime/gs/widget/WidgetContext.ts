export default class WidgetContext {
  widgetFolder: string = 'gs/widget';

  map: any;
  proxyUrl: string;
  widgetConfig: any;

  constructor(widgetConfig?: any, proxyUrl?: string, map?: any) {
    this.widgetConfig = widgetConfig;
    this.proxyUrl = proxyUrl;
    this.map = map;
  }

  addItem = function (serviceType, serviceUrl, item, itemUrl, referenceId) {
    //TO DO
  };

  addLayer = function (serviceType, serviceUrl, referenceId) {
    //TO DO
  };

  getGeographicExtent = function () {
    if (this.map) {
      return this.map.geographicExtent;
    }
  };

  getMap = function () {
    return this.map;
  };

  showError = function (title, error) {
    console.warn('wro/Context.showError', title, error);
  };

  showMessage = function (title, message) {
    console.warn('wro/Context.showMessage', title, message);
  };

  showMessages = function (title, subTitle, messages) {
    console.warn('wro/Context.showMessages', title, subTitle, messages);
  };
}
