/* eslint-disable @typescript-eslint/semi */
/** @jsx jsx */
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
import { React, AllWidgetProps, jsx } from 'jimu-core';
import { Loading, LoadingType, Pagination } from 'jimu-ui';
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis';

import { MapContext } from './common/mapContext';

import { IMConfig } from '../config';
import esriConfig from 'esri/config';

import SearchPane from './components/SearchPane';
import ResultsPane from './components/ResultsPane';

import './main.css';

export interface IState {
  mapView: JimuMapView;
  loading: boolean;
  thumbnail: Element;
  searchResponse: any;
  currentPage: number; // current page selected in pagination
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
  gs: any;
  mapHandle: any;
  addedLayersIds: string[];
  searchRef: any;
  pagesDisplayed:number; // number of pages for pagination

  constructor(props) {
    super(props);

    if (this.props.config.proxyUrl.length > 0)
      esriConfig.request.proxyUrl = this.props.config.proxyUrl;

    this.state = {
      mapView: null,
      loading: false,
      thumbnail: null,
      searchResponse: null,
      currentPage: 1
    };

    this.pagesDisplayed = 10;
    this.searchRef= React.createRef();

    // @ts-ignore
    this.gs = window.gs;
  }

  componentWillUnmount() {
    this.mapHandle.remove();
  }

  //This is used if the map view changes
  activeViewChangeHandler = (jmv: JimuMapView) => {
    this.setState((prevState) => ({
      ...prevState,
      mapView: jmv,
    }));

    // track layer add/remove
    this.mapHandle = jmv.view.map.watch(
      ['layers.length', 'tables.length'],
      (newValue, oldValue, propertyName) => {
        // @ts-ignore
        const lyrs = jmv.view.map.layers.filter(lyr => lyr.xtnReferenceId?.length > 0);

        // @ts-ignore
        const tbls = jmv.view.map.tables.filter(tbl => tbl.xtnReferenceId?.length > 0);

        // @ts-ignore
        this.addedLayersIds = [...lyrs.map(lyr => lyr.xtnReferenceId), ...tbls.map(tbl => tbl.xtnReferenceId)];
      }
    );
  };

  handleSearchResults = (searchResponse: any, newSearch: boolean = false) => {
    this.setState((prevState) => ({
      ...prevState,
      searchResponse: searchResponse,
      ...(newSearch && { currentPage: 1 }),
    }));
  };

  toggleLoading = (visible: boolean) => {
    this.setState((prevState) => ({
      ...prevState,
      loading: visible,
    }));
  };

  handleOnChangePage= (clickedPg: number) => {
    let start = ((clickedPg-1) * this.state.searchResponse.num) + 1;
    this.searchRef.current?.search(start, false);

    this.setState({currentPage: clickedPg});
  };

  render() {
    return (
      <div className="jimu-widget geoportal-search-widget">
        <JimuMapViewComponent
          useMapWidgetId={this.props.useMapWidgetIds?.[0]}
          onActiveViewChange={this.activeViewChangeHandler}
        />
        <div className="titleStyle">{this.props.config.widgetTitle}</div>
        <MapContext.Provider value={this.state.mapView}>
          <div className="searchPaneWrapper">
            <SearchPane
              {...this.props}
              handleSearchResults={this.handleSearchResults}
              loading={this.toggleLoading}
              gs={this.gs}
              ref={this.searchRef}
            />
          </div>
          <div className="resultsPaneWrapper">
            <ResultsPane
              {...this.props}
              searchResponse={this.state.searchResponse}
              clearResults={this.state.loading}
              addedLayersIds={this.addedLayersIds}
            />
          </div>
          <div className="paginationWrapper">
            {this.state.searchResponse?.total && this.state.searchResponse.total > 0 ?
            <Pagination
              current= {this.state.currentPage}
              onChangePage={this.handleOnChangePage}
              size="default"
              totalPage={Math.ceil(this.state.searchResponse.total / this.pagesDisplayed)}
            />
            : null}

          </div>
        </MapContext.Provider>
        {this.state.loading ? (
          <div style={{ display: 'flex', paddingTop: '5px' }}>
            <Loading className="loadingOverride" type={LoadingType.Donut} />
          </div>
        ) : null}
      </div>
    );
  }
}
