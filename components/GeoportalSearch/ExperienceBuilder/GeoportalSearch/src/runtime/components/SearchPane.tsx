//a custom pragma to transform your jsx into plain JavaScript
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
import { React, AllWidgetProps, jsx, IMThemeVariables } from 'jimu-core';
import {
  TextInput,
  Checkbox,
  Select,
  Option,
  Icon,
  Button,
  Label,
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
} from 'jimu-ui';
import { IMConfig, Target } from '../../config';
import { MapContext } from '../common/mapContext';
import CatalogSelection from './CatalogSelection';
import defaultMessages from '../translations/default';
import { Fragment } from 'react';
import arrowUpSvg from 'jimu-icons/svg/outlined/directional/arrow-up.svg';
import arrowDownSvg from 'jimu-icons/svg/outlined/directional/arrow-down.svg';

interface ExtraProps {
  handleSearchResults?: (results: {}, newSearch: boolean) => void;
  loading?: (visible: boolean) => void;
  gs?: any;
}

export interface IState {
  sortField: string;
  isAscending: boolean;
  boundingBox: string | null;
  isLiveData: boolean;
  searchText: string;
  searchResults: { [key: string]: {} };
  catalogCount: { [key: string]: number };
  selectedCatalogIDs: string[];
  primarySearchResponse: string;
}

class SearchPane extends React.PureComponent<AllWidgetProps<IMConfig> & ExtraProps, IState> {
  private _proc: any;
  targetOptions: any;
  enabledCatalogs: { [key: string]: Target };
  theme: IMThemeVariables;

  constructor(props) {
    super(props);
    this.enabledCatalogs = this.getCatalogOptions();
    this.theme = this.props.theme;

    this.state = {
      boundingBox: null,
      isLiveData: false,
      searchText: null,
      catalogCount: null,
      selectedCatalogIDs: [...Object.keys(this.enabledCatalogs)], // select all catalogs initially
      primarySearchResponse: Object.keys(this.enabledCatalogs)[0], // select first catalog as primary
      searchResults: {},
      sortField: '_rel_',
      isAscending: false,
    };
  }

  getCatalogOptions = () => {
    let res = {};

    this.props.config.targets.forEach((target, i) => {
      if (target.enabled) res[i + '-' + target.type] = target;
    });

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

  handleSortField = (event) => {
    this.setState({ sortField: event.target.value }, () => this.search());
  };

  toggleSortOrder = () => {
    this.setState({ isAscending: !this.state.isAscending }, () => this.search());
  };

  bboxOnChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    let bbox = null;
    if (checked) {
      // get mapview from context MapContext
      const mapView = this.context;
      const ext = mapView.view.extent;
      bbox = ext.xmin + ',' + ext.ymin + ',' + ext.xmax + ',' + ext.ymax;
    }
    this.setState({ boundingBox: bbox }, () => this.search());
  };

  liveDataOnChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    this.setState({ isLiveData: checked }, () => this.search());
  };

  async search(startNum: number = 1, newSearch: boolean = true) {
    this.props.loading(true);
    let self = this;

    try {
      let parameterMap = this.buildQueryParams();
      // for new searches - bbox, sorting etc - value is 1. For query from pagination, value will be passed from parent.
      parameterMap['start'] = startNum;
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
          config.proxyUrl = this.props.config.proxyUrl;
          return config;
        },
      }));

      processor.execute(requestInfo, function (status, mediaType, entity, headers) {
        if (processor === self._proc) {
          try {
            let result = JSON.parse(entity);
            let searchResponse = self.processResults(result);
            self.props.handleSearchResults(searchResponse, newSearch);
          } catch (ex) {
            console.error(ex);
          }
        }
      });

      this.props.loading(false);
    } catch (err) {
      console.error(err);
    }
  }

  buildQueryParams = () => {

    let params = {
      q:
        this.state.searchText &&
        typeof this.state.searchText === 'string' &&
        this.state.searchText.length > 0
          ? this.state.searchText
          : null,
    };

    //Target Options
    if (this.state.selectedCatalogIDs.length > 0) {
      let vals = [];
      this.state.selectedCatalogIDs.forEach((catalogKey) =>
        vals.push(this.enabledCatalogs[catalogKey])
      );

      params['target'] = vals;
    }

    //BBox
    if (this.state.boundingBox) {
      params['bbox'] = this.state.boundingBox; // has value or null
    }

    //Live Data
    if (this.state.isLiveData) {
      params['type'] = 'liveData';
    }

    //Sort Options - default is sorting 'Relevance'
    params['sortField'] = this.state.sortField;
    params['sortOrder'] = this.state.isAscending ? 'asc' : 'desc';

    //number of results per request
    params['num'] = this.props.config.numberOfResultsPerQuery;

    return params;
  };

  processResults = (result) => {
    let searchResponse = null;

    let vals = {}; // temporarily store results - used when 'primarySearchResponse' changes
    if (Array.isArray(result)) {
      this.state.selectedCatalogIDs.forEach((catalogKey, i) => {
        vals[catalogKey] = result[i].entity;
      });
      searchResponse = vals[this.state.primarySearchResponse];

      let cnts = {};
      result.forEach((val, i) => {
        let c = val.entity?.total ?? 0;
        cnts[this.state.selectedCatalogIDs[i]] = c;
      });
      this.setState({ catalogCount: cnts, searchResults: vals });
    } else {
      searchResponse = result;
      let cnt = {};
      cnt[this.state.primarySearchResponse] = result.total;

      vals[this.state.primarySearchResponse] = searchResponse;
      this.setState({ catalogCount: cnt, searchResults: vals });
    }
    return searchResponse;
  };

  catalogSelection = () => {
    return (
      <Fragment>
        {Object.keys(this.enabledCatalogs).map((catalogKey) => {
          let catalog = this.enabledCatalogs[catalogKey];

          return (
            <DropdownItem key={catalogKey} className="catalogsDropdown">
              <CatalogSelection
                catalogKey={catalogKey}
                name={catalog.name}
                checked={this.state.selectedCatalogIDs?.includes(catalogKey)}
                selected={catalogKey === this.state.primarySearchResponse}
                count={this.state.catalogCount && this.state.catalogCount[catalogKey]}
                toSearch={this.catalogToSearch}
                showResults={this.resultsToDisplay}
                selectedColor={this.theme.colors.palette.primary[300]}
              ></CatalogSelection>
            </DropdownItem>
          );
        })}
      </Fragment>
    );
  };

  catalogToSearch = (catalogKey: string, checked: boolean) => {
    let vals = [];
    if (checked && !this.state.selectedCatalogIDs?.includes(catalogKey)) {
      vals = [...this.state.selectedCatalogIDs, catalogKey];
    } else {
      vals = this.state.selectedCatalogIDs.filter((item) => item !== catalogKey);
    }

    // dont allow all options to be unchecked
    if (vals.length > 0) {
      this.setState({ selectedCatalogIDs: vals, primarySearchResponse: vals[0] }, () =>
        this.search()
      );
    }
  };

  resultsToDisplay = (catalogKey: string) => {
    const res: any = this.state.searchResults[catalogKey];

    // if start is 1 , then just switch to saved results as no further queries have been run.
    if (res.start && res.start === 1) {
      this.setState({ primarySearchResponse: catalogKey }, () =>
        this.props.handleSearchResults(this.state.searchResults[catalogKey], false)
      );
    } else if (res.start && res.start > 1) {
      // queries based on pagination have been run - rerun search as 'start' may not be valid for the now selected catalog
      this.setState({ primarySearchResponse: catalogKey }, () => this.search());
    } else {
      // if error or no results
      this.setState({ primarySearchResponse: catalogKey }, () =>
        this.props.handleSearchResults({}, true)
      );
    }
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
          <div className="catalogsList">
            <Dropdown>
              <DropdownButton
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
              <DropdownMenu showArrow={true}>{this.catalogSelection()}</DropdownMenu>
            </Dropdown>
          </div>

          <div style={{ paddingLeft: '10px' }}>
            <Label className="optionsCheckboxItem">
              <Checkbox
                id="chkBbox"
                onChange={this.bboxOnChange}
                checked={this.state.boundingBox ? true : false}
              />
              <span className="optionsCheckboxLabel">BBox</span>
            </Label>
          </div>

          <div style={{ paddingLeft: '10px' }}>
            <Label className="optionsCheckboxItem">
              <Checkbox
                id="chkLiveData"
                onChange={this.liveDataOnChange}
                checked={this.state.isLiveData}
              />
              <span className="optionsCheckboxLabel">Live Data</span>
            </Label>
          </div>

          <div style={{ paddingLeft: '10px' }}>
            <Select
              a11y-description={this.props.intl.formatMessage({
                id: 'sortOptions.prompt',
                defaultMessage: defaultMessages.sortOptions.prompt,
              })}
              onChange={this.handleSortField}
              value={this.state.sortField}
            >
              <Option value={'_rel_'} key={'relevance'}>
                {this.props.intl.formatMessage({
                  id: 'sortOptions.default',
                  defaultMessage: defaultMessages.sortOptions.default,
                })}
              </Option>
              <Option value={'title'} key={'title'}>
                {this.props.intl.formatMessage({
                  id: 'sortOptions.title',
                  defaultMessage: defaultMessages.sortOptions.title,
                })}
              </Option>
              <Option value={'modified'} key={'modified'}>
                {this.props.intl.formatMessage({
                  id: 'sortOptions.date',
                  defaultMessage: defaultMessages.sortOptions.date,
                })}
              </Option>
            </Select>
          </div>

          <Button
            aria-label="Button"
            icon
            onClick={this.toggleSortOrder}
            size="default"
            className="arrowButtonStyle"
            type="tertiary"
          >
            {this.state.sortField === '_rel_' ? null : (
              <Icon icon={this.state.isAscending ? arrowUpSvg : arrowDownSvg} size="m" />
            )}
          </Button>
        </div>
      </div>
    );
  }
}

// use this to get mapview from context if zoom/add is clicked
SearchPane.contextType = MapContext;
export default SearchPane;
