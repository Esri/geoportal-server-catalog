/* eslint-disable @typescript-eslint/semi */
/** @jsx jsx */
import { React, AllWidgetProps, jsx } from 'jimu-core';
import { Loading, LoadingType } from 'jimu-ui';
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis';

import { IMConfig } from '../config';
import esriConfig from 'esri/config';

import WidgetContext from './gs/widget/WidgetContext';

import SearchPane from './components/SearchPane';
import ResultsPane from './components/ResultsPane';

import './main.css';

export interface IState {
  mapView: JimuMapView;
  loading: boolean;
  thumbnail: Element;
  searchResponse: any;
}

// To integrate 'gs' folder functionality with this ExB widget
// @ts-ignore
window.gs = {};
// @ts-ignore
window.gsConfig = {
  isExB: true,
};
require('./gs/all');

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, IState> {
  widgetContext: WidgetContext;
  gs: any;

  constructor(props) {
    super(props);

    this.state = {
      mapView: null,
      loading: false,
      thumbnail: null,
      searchResponse: null,
    };

    // @ts-ignore
    this.gs = window.gs;
  }

  componentDidMount() {}

  componentDidUpdate() {}

  //This is used if the map view changes
  activeViewChangeHandler = (jmv: JimuMapView) => {
    this.setState((prevState) => ({
      ...prevState,
      mapView: jmv,
    }));

    this.widgetContext = new WidgetContext(
      this.props.config,
      esriConfig.request.proxyUrl,
      jmv.view.map
    );
  };

  handleResults = (searchResponse: any) => {
    this.setState((prevState) => ({
      ...prevState,
      searchResponse: searchResponse,
    }));
  };

  toggleLoading = (visible: boolean) => {
    this.setState((prevState) => ({
      ...prevState,
      loading: visible,
    }));
  };

  render() {
    return (
      <div className="jimu-widget geoportal-search-widget">
        <JimuMapViewComponent
          useMapWidgetId={this.props.useMapWidgetIds?.[0]}
          onActiveViewChange={this.activeViewChangeHandler}
        />
        <div className="titleStyle">{this.props.config.widgetTitle}</div>
        <div className="searchPaneWrapper">
          <SearchPane
            {...this.props}
            handleResults={this.handleResults}
            loading={this.toggleLoading}
            gs={this.gs}
            widgetContext={this.widgetContext}
          />
        </div>
        <div className="resultsPaneWrapper">
          <ResultsPane
            {...this.props}
            searchResponse={this.state.searchResponse}
            clearResults={this.state.loading}
            widgetContext={this.widgetContext}
            mapView={this.state.mapView}
          />
        </div>
        {this.state.loading ? (
          <div style={{ display: 'flex', paddingTop: '5px' }}>
            <Loading className="loadingOverride" type={LoadingType.Donut} />
          </div>
        ) : null}
      </div>
    );
  }
}
