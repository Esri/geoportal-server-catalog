//a custom pragma to transform your jsx into plain JavaScript
/** @jsx jsx */
import { React, AllWidgetProps, jsx, ImmutableArray } from 'jimu-core';
import { TextInput, Checkbox, Option, Icon, Button, Label, Dropdown, DropdownButton, DropdownMenu, DropdownItem } from 'jimu-ui';
import { IMConfig, Target } from '../../config';
import { MapContext } from '../common/mapContext';
import CatalogSelection  from "./CatalogSelection";
import WidgetContext from '../gs/widget/WidgetContext';
import TargetOptions from '../gs/widget/TargetOptions';
import defaultMessages from '../translations/default';
import { Fragment } from 'react';

interface ExtraProps {
  handleResults?: (results: {}) => void;
  loading?: (visible: boolean) => void;
  gs?: any;
  widgetContext: WidgetContext;
}

export interface IState {
  sortOption: [];
  boundingBox: string | null;
  isLiveData: boolean;
  totalRecords: number;
  searchText: string;
  searchResults: {[key: string] : {}};
  resultList: Element[];
  loading: boolean;
  thumbnail: Element;
  catalogCount: { [key: string] : number };
  selectedCatalogIDs: string[];
  primarySearchResponse: string;

}

class SearchPane extends React.PureComponent<
  AllWidgetProps<IMConfig> & ExtraProps,
  IState
> {
  private _proc: any;
  targetOptions: any;
  enabledCatalogs: {[key: string] : Target};

  constructor(props) {
    super(props);
    this.enabledCatalogs = this.getCatalogOptions();

    this.state = {
      boundingBox: null,
      isLiveData: false,
      totalRecords: 0,
      searchText: null,
      resultList: null,
      loading: false,
      thumbnail: null,
      catalogCount: null,
      selectedCatalogIDs: [...Object.keys(this.enabledCatalogs)], // select all catalogs initially
      primarySearchResponse: Object.keys(this.enabledCatalogs)[0],  // select first catalog as primary
      searchResults: {},
      sortOption: []
    };
    // this.targetOptions = new TargetOptions();
  }

  getCatalogOptions = () => {
    let res = {};

    this.props.config.targets.forEach( (target, i) => {
      if (target.enabled)
        res[i] = target
    })

    return res;
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
  sortOnChange = (event) => {
    // let val = [];
    // let fld = event.target.value;
    // if (this.state.sortOption?.length === 1 && this.state.sortOption[0] === fld ) {

    // }
    // this.setState({ sortOption: event.target.value });
  };

  bboxOnChange = (evt:React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    let bbox = null;
    if (checked) {
      // get mapview from context MapContext
      const mapView = this.context;
      const ext = mapView.view.extent;
      bbox = ext.xmin + "," + ext.ymin + "," + ext.xmax + "," + ext.ymax;
    }
    this.setState({ boundingBox: bbox }, () => this.search());
  };

  liveDataOnChange = (evt:React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    this.setState({ isLiveData: checked }, () => this.search());
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
            let result = JSON.parse(entity);
            let searchResponse = self.processResults(result);
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
      q: qRequired
    };

    //Target Options
    if (this.state.selectedCatalogIDs.length > 0 ) {
      let vals = [];
      this.state.selectedCatalogIDs.forEach(catalogKey => vals.push(this.enabledCatalogs[catalogKey]));

      params['target'] = vals;
    }

    //BBox
    // if (this.state.boundingBox) {
      params['bbox'] = this.state.boundingBox; // has value or null
    // }

    //Live Data
    if (this.state.isLiveData) {
      params['type'] = 'liveData';
    }

    //Sort Options
    params['sortField'] = null;
    params['sortOrder'] = null;


    // params.canSortByRelevance = true;
    // var sortField = this.state.relevance;
    // if (sortField !== null && sortField.length > 0 && sortField !== 'Relevance') {
    //   params['sortField'] = sortField;
    // }

    // delete params.canSortByRelevance;
    return params;
  };

  processResults = (result) => {
    let searchResponse = null;

    let vals = {}; // temporarily store results - used when 'primarySearchResponse' changes
    if (Array.isArray(result)) {
      this.state.selectedCatalogIDs.forEach((catalogKey, i) => {
        vals[catalogKey] = result[i].entity;
      })
      searchResponse = vals[this.state.primarySearchResponse];

      let cnts = {};
      result.forEach((val, i) => {
        let c = val.entity?.total ?? 0;
        cnts[this.state.selectedCatalogIDs[i]] = c;
      });
      this.setState({catalogCount: cnts, searchResults: vals});

    } else {
      searchResponse = result;
      let cnt =  {};
      cnt[this.state.primarySearchResponse] = result.total;

      vals[this.state.primarySearchResponse] = searchResponse;
      this.setState({catalogCount: cnt, searchResults: vals});
    }
    return searchResponse;

  }

  catalogSelection = () => {
    return (
      <Fragment>
      {
        Object.keys(this.enabledCatalogs).map(catalogKey => {
          let catalog = this.enabledCatalogs[catalogKey];

          return (
            <DropdownItem key={catalogKey} >
                <CatalogSelection catalogKey={catalogKey} name={catalog.name}
                  checked={this.state.selectedCatalogIDs?.includes(catalogKey)}
                  selected={catalogKey === this.state.primarySearchResponse}
                  count={this.state.catalogCount && this.state.catalogCount[catalogKey]}
                  toSearch={this.catalogToSearch} showResults={this.resultsToDisplay}></CatalogSelection>
              </DropdownItem>
              );
        })
      }
      </Fragment>
    );
  }

  catalogToSearch = (catalogKey: string, checked: boolean) => {
    let vals = [];
    if (checked && !this.state.selectedCatalogIDs?.includes(catalogKey)) {
        vals = [...this.state.selectedCatalogIDs, catalogKey ];
    } else {
        vals = this.state.selectedCatalogIDs.filter(item => item !== catalogKey);
    }

    // dont allow all options to be unchecked
    if (vals.length > 0) {
      this.setState({selectedCatalogIDs: vals, primarySearchResponse: vals[0]}, () => this.search());
    }

  }

  resultsToDisplay = (catalogKey: string) => {
    this.setState({ primarySearchResponse: catalogKey}, () => this.props.handleResults(this.state.searchResults[catalogKey]))
  }

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
        <div style={{ display: 'flex', padding: '5px' }}>
          <div className="catalogsList">
            <Dropdown>
              <DropdownButton style={{ height: "25px"}}
                a11y-description={this.props.intl.formatMessage({
                  id: 'targetOptions.caption',
                  defaultMessage: defaultMessages.targetOptions.caption,
                })}
              >
                {this.props.intl.formatMessage({
                  id: 'targetOptions.caption',
                  defaultMessage: defaultMessages.targetOptions.caption,
                })}
              </DropdownButton>
              <DropdownMenu showArrow={true}>
                {this.catalogSelection()}
              </DropdownMenu>
            </Dropdown>
          </div>

            <div style={{ paddingLeft: '10px' }}>
              <Label>
                <Checkbox id="chkBbox" onChange={this.bboxOnChange} checked={this.state.boundingBox ? true : false}/>
                <span className="optionsCheckboxLabel">BBox</span>
              </Label>
            </div>

            <div style={{ paddingLeft: '10px' }}>
              <Label>
                <Checkbox id="chkLiveData" onChange={this.liveDataOnChange} checked={this.state.isLiveData} />
                <span className="optionsCheckboxLabel">Live Data</span>
              </Label>
            </div>

            <div style={{ paddingLeft: '10px' }}>
              <Dropdown>
                <DropdownButton style={{ height: "25px"}}
                  a11y-description={this.props.intl.formatMessage({
                    id: 'sortOptions.relevance',
                    defaultMessage: defaultMessages.sortOptions.relevance,
                  })}
                >
                  {this.props.intl.formatMessage({
                    id: 'sortOptions.relevance',
                    defaultMessage: defaultMessages.sortOptions.relevance,
                  })}
                </DropdownButton>
                <DropdownMenu showArrow={true}>
                  <DropdownItem key={'relevance'} onClick={this.sortOnChange} active={true} value={"_rel_"}>
                    {this.props.intl.formatMessage({
                      id: 'sortOptions.relevance',
                      defaultMessage: defaultMessages.sortOptions.relevance,
                    })}
                  </DropdownItem>
                  <DropdownItem key={'title'} onClick={this.sortOnChange} active={true} value={"title"}>
                    {this.props.intl.formatMessage({
                      id: 'sortOptions.title',
                      defaultMessage: defaultMessages.sortOptions.title,
                    })}
                  </DropdownItem>
                  <DropdownItem key={'date'} onClick={this.sortOnChange} active={true} value={"date"}>
                    {this.props.intl.formatMessage({
                      id: 'sortOptions.date',
                      defaultMessage: defaultMessages.sortOptions.date,
                    })}
                  </DropdownItem>
                </DropdownMenu>
             </Dropdown>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// use this to get mapview from context if zoom/add is clicked
SearchPane.contextType = MapContext;
export default SearchPane;
