//a custom pragma to transform your jsx into plain JavaScript
/** @jsx jsx */
import { React, AllWidgetProps, jsx } from 'jimu-core';
import { TextInput, Checkbox, Option, Icon, Button, Label, Loading, LoadingType } from 'jimu-ui';
import { IMConfig } from '../../config';
import WidgetContext from '../gs/widget/WidgetContext';
import TargetOptions from '../gs/widget/TargetOptions';

interface ExtraProps {
  handleResults?: (results: any[]) => void;
  loading?: (visible: boolean) => void;
  gs?: any;
  widgetContext: WidgetContext;
}

export interface IState {
  relevance: string;
  catalogOptions: any[];
  selectedOptions: any[];
  isBbox: boolean;
  isLiveData: boolean;
  totalRecords: number;
  searchText: string;
  searchResults: string;
  resultList: Element[];
  loading: boolean;
  thumbnail: Element;
}

export default class Widget extends React.PureComponent<
  AllWidgetProps<IMConfig> & ExtraProps,
  IState
> {
  private _proc: any;
  targetOptions: any;

  constructor(props) {
    super(props);
    console.log(this.props.gs);

    this.state = {
      relevance: 'Relevance',
      catalogOptions: this.getCatalogOptions(),
      selectedOptions: this.getCatalogOptions(),
      isBbox: false,
      isLiveData: false,
      totalRecords: 0,
      searchText: null,
      searchResults: '',
      resultList: null,
      loading: false,
      thumbnail: null,
    };
    this.targetOptions = new TargetOptions();
  }

  getCatalogOptions = () => {
    const targets = this.props.config.targets;
    let allCatalogs = [];
    let inc = 1;

    targets.forEach((target) => {
      let catalog = {};
      catalog['label'] = target.name;
      catalog['id'] = inc;
      catalog['value'] = target.url;

      allCatalogs.push(catalog);
      inc++;
    });

    return allCatalogs;
  };

  handleFilterAccept = (value) => {
    this.setState({ searchText: value });
  };

  searchBoxOnKeyUp = (event: { key: string }) => {
    if (event.key === 'Enter') {
      this.search();
    }
  };

  searchClick = (event) => {
    this.search();
  };

  // TODO - when relevance changes, re-run the queries and render result
  relevanceOnChange = (event) => {
    this.setState({ relevance: event.target.value });
  };

  // TODO - when bbox checkbox changes, re-run the queries and render result
  bboxOnChange = (event) => {
    this.setState({ isBbox: event.target.checked });
  };

  // TODO - when liveData checkbox changes, re-run the queries and render result
  liveDataOnChange = (event) => {
    this.setState({ isLiveData: event.target.checked });
  };

  // TODO - when there is a change in the multi-select, re-run queries and render result
  multiSelectOnChange = (value, event) => {
    if (event.action === 'deselect-option') {
      this.setState({ selectedOptions: value.filter((o) => o.value) });
    }
    if (event.action === 'select-option') {
      let joined = this.state.selectedOptions.concat(value);
      this.setState({ selectedOptions: joined });
    }
  };

  async search() {
    this.props.loading(true);
    let task = {};
    let self = this;

    try {
      // this.toggleLoading(true);
      let parameterMap = this.buildQueryParams(task);
      parameterMap['f'] = 'json';

      let requestInfo = {
        requestUrl: '/request',
        baseUrl: '/base',
        headerMap: {},
        parameterMap: parameterMap,
      };

      let result, searchResponse;

      let processor = (this._proc = this.props.gs.Object.create(
        this.props.gs.context.browser.WebProcessor
      ).mixin({
        newConfig: () => {
          let config = this.props.gs.Object.create(this.props.gs.config.Config);
          config.proxyUrl = this.props.widgetContext.proxyUrl;
          return config;
        },
      }));

      processor.execute(requestInfo, function (status, mediaType, entity, headers) {
        console.log(requestInfo);
        if (processor === self._proc) {
          try {
            result = JSON.parse(entity);
            searchResponse = self.targetOptions.getPrimarySearchResponse(result, task);
            // console.log(searchResponse);
            self.props.handleResults(searchResponse);
          } catch (ex) {
            console.error(ex);
          }
        }
      });

      this.props.loading(false);
    } catch (err) {
      console.log(err);
    } finally {
      // this.toggleLoading(false);
    }
  }

  buildQueryParams = (task) => {
    let qRequired = null;
    let requiredFilter = this.state.searchText;
    if (typeof requiredFilter === 'string' && requiredFilter.length > 0) {
      qRequired = requiredFilter;
    }
    let params = {
      q: qRequired,
      canSortByRelevance: false,
    };

    //Target Options

    //BBox
    if (this.state.isBbox) {
      // TODO - get bbox from current map extent and apply to filter
    }

    //Live Data
    if (this.state.isLiveData) {
      params.canSortByRelevance = true;
      params['type'] = 'liveData';
    }

    //Sort Options
    params['sortField'] = null;
    params['sortOrder'] = null;

    var sortField = this.state.relevance;
    if (sortField !== null && sortField.length > 0 && sortField !== 'Relevance') {
      params['sortField'] = sortField;
    }

    delete params.canSortByRelevance;
    return params;
  };

  render() {
    return (
      <div className="searchPane">
        <div className="searchPaneMain">
          <TextInput
            id="searchBox"
            onAcceptValue={this.handleFilterAccept}
            onKeyUp={this.searchBoxOnKeyUp}
            placeholder={'Search...'}
            className="searchBoxText"
          />
          <Button className="searchButton" onClick={this.searchClick} aria-label="Button">
            <Icon icon={require('jimu-ui/lib/icons/search.svg')} size="m" />
          </Button>
        </div>

        <div id="optionsContainer" className="optionsContainer">
          <div className="g_catalogs_list"></div>

          <div style={{ display: 'flex', paddingTop: '5px' }}>
            <div>
              <Label>
                <Checkbox id="chkBbox" onChange={this.bboxOnChange} />
                <span className="optionsCheckboxLabel">BBox</span>
              </Label>
            </div>

            <div style={{ paddingLeft: '10px' }}>
              <Label>
                <Checkbox id="chkLiveData" onChange={this.liveDataOnChange} />
                <span className="optionsCheckboxLabel">Live Data</span>
              </Label>
            </div>

            <div style={{ paddingLeft: '10px' }}>
              <select onChange={this.relevanceOnChange} value={this.state.relevance}>
                <option value="Relevance" style={{ fontWeight: 'bold' }}>
                  Relevance
                </option>
                <option value="Title">Title</option>
                <option value="Date">Date</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
