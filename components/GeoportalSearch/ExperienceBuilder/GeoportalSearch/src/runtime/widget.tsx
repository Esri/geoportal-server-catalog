/** @jsx jsx */
import { React, BaseWidget, AllWidgetProps, jsx, appActions, IMState, css } from 'jimu-core';
import { TextInput, Checkbox, Option, Icon, Button, Label, Loading, LoadingType } from "jimu-ui";
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
import { IMConfig } from '../config';

import SearchPane from "./components/SearchPane"
import ResultsPane from "./components/ResultsPane"

import './main.css';

//import Query = require('esri/tasks/support/Query');
//import QueryTask = require('esri/tasks/QueryTask');

import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/support/Query';


import Select from 'react-select';

export interface IState {
  jimuMapView: JimuMapView;
  resultList: Element[],
  loading: boolean,
  thumbnail: Element
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, IState> {

  constructor(props) {
    super(props);

    this.state = {
      jimuMapView: null,
      resultList: null,
      loading: false,
      thumbnail: null
    };

  }

  componentDidMount() {
    

  }

  componentDidUpdate() {

  }

  //This is used if the map view changes
  activeViewChangeHandler = (jmv: JimuMapView) => {
    this.setState(prevState => ({
      ...prevState,
      jimuMapView: jmv as JimuMapView
    }));

  }
  
  handleResults = (results: []) => {
    this.setState({resultList: results});
  }
  
    
  // // TODO - create separate react components for search result list and item
  

  toggleLoading = (visible: boolean) => {
    this.setState({ loading: visible })
  }

  render() {
    return (
      <div className="jimu-widget geoportal-search-widget" >
        <div className="titleStyle">{this.props.config.widgetTitle}</div>
        <div className="searchPaneWrapper">
          <SearchPane {...this.props} handleResults={this.handleResults} loading={this.toggleLoading}/>     
        </div>
        <div className="resultsPaneWrapper">
          <ResultsPane {...this.props} resultList={this.state.resultList} clearResults={this.state.loading}/>       
        </div>    
        {this.state.loading?
          (<div style={{ display: 'flex', paddingTop: '5px' }}>
            <Loading className="loadingOverride" type={LoadingType.Donut}  />
          </div>)
        : null}
      </div>
    );
  }
}
