//a custom pragma to transform your jsx into plain JavaScript
/** @jsx jsx */
import { React, AllWidgetProps, jsx } from 'jimu-core';
import { JimuMapView } from 'jimu-arcgis';
import { IMConfig } from '../../config';
import Extent from 'esri/geometry/Extent';
import '../main.css';
import WidgetContext from '../gs/widget/WidgetContext';
import ItemCard from './ItemCard';

interface ExtraProps {
  searchResponse: any;
  clearResults: boolean;
  widgetContext: WidgetContext;
  mapView?: JimuMapView;
}

export interface IState {
  results: any;
  sourceKey: string;
  sourceType: string;
}

export default class Widget extends React.PureComponent<
  AllWidgetProps<IMConfig> & ExtraProps,
  IState
> {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(): void {
    console.log(' componentDidUpdate ');
  }

  zoomToExtent = (bbox: any) => {
    if (bbox) {
      this.props.mapView.view.extent = new Extent({
        xmin: bbox.xmin,
        ymin: bbox.ymin,
        xmax: bbox.xmax,
        ymax: bbox.ymax,
        spatialReference: {
          wkid: 4326,
        },
      });
    }
  };

  processResultList = () => {
    let resultList = [];

    let results = this.props.searchResponse?.results ?? null;

    if (!results || results.length <= 0) {
      return <div>No results......</div>;
    } else {
      const showOwner = this.props.widgetContext.widgetConfig.showOwner;

      // TO DO
      const supportsRemove = this.props.widgetContext.supportsRemove;

      var idsAdded = [];
      // if (supportsRemove) {
      //   idsAdded = layerUtil.findLayersAdded(this.getMap(), null).referenceIds;
      // }

      for (var i = 0; i < results.length; i++) {
        // TODO - if action fails, render message in message span
        const item: any = results[i];
        const itemDiv = (
          <ItemCard
            supportsRemove
            showOwner
            item={item}
            key={i + '_' + item.id}
            canRemove={false}
            sourceKey={this.props.searchResponse.sourceKey}
            sourceType={this.props.searchResponse.sourceType}
            intl={this.props.intl}
            zoomToExtent={this.zoomToExtent}
          ></ItemCard>
        );
        resultList.push(itemDiv);
      }

      return resultList;
    }
  };

  render() {
    return (
      <div className="jimu-widget">
        {this.props.clearResults === true ? <div></div> : this.processResultList()}
      </div>
    );
  }
}
