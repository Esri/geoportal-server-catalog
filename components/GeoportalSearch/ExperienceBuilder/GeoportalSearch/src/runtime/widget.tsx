/** @jsx jsx */
import { React, BaseWidget, AllWidgetProps, jsx, appActions, IMState, css } from 'jimu-core';
import { TextInput, Checkbox, Option, Icon, Button, Label } from "jimu-ui";
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
import { IMConfig } from '../config';

//import Query = require('esri/tasks/support/Query');
//import QueryTask = require('esri/tasks/QueryTask');

import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/support/Query';

import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import Select from 'react-select';
import Card, { CardTitle, CardContent, CardImage } from 'calcite-react/Card'
import ClipLoader from "react-spinners/ClipLoader";

export interface IState {
  jimuMapView: JimuMapView;
  relevance: string;
  catalogOptions: any[],
  selectedOptions: any[],
  isBbox: boolean,
  isLiveData: boolean,
  totalRecords: number,
  searchText: string,
  searchResults: string,
  resultList: Element[],
  loading: boolean,
  thumbnail: Element
}

export default class Widget extends BaseWidget<AllWidgetProps<IMConfig>, IState> {
  catalogSelectRef: any;

  constructor(props) {
    super(props);

    this.catalogSelectRef = React.createRef();

    this.state = {
      jimuMapView: null,
      relevance: 'Relevance',
      catalogOptions: this.getCatalogOptions(),
      selectedOptions: this.getCatalogOptions(),
      isBbox: false,
      isLiveData: false,
      totalRecords: 0,
      searchText: null,
      searchResults: "",
      resultList: null,
      loading: false,
      thumbnail: null
    };

    this.relevanceOnChange = this.relevanceOnChange.bind(this);
    this.getCatalogOptions = this.getCatalogOptions.bind(this);
    this.searchClick = this.searchClick.bind(this);
    this.bboxOnChange = this.bboxOnChange.bind(this);
    this.liveDataOnChange = this.liveDataOnChange.bind(this);
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

  searchClick = (event) => {
    this.search();
  }

  searchBoxOnKeyUp = (event: { key: string; }) => {
    if (event.key === 'Enter') {
      this.search();
    }    
  }

  // TODO - externalize CSS
  // TODO - create separate react components for search result list and item
  async search() {
    const g_item_title = css`
      margin: 0 5px;
      padding: 0;
      font-size: 12px;
      font-weight: bold;
      color: #4c4c4c;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;   

    const g_item_description = css`
      margin: 0px 0px 6px 0px;
      font-size: 12px;
      box-sizing: border-box;
    `;      

    const g_item_card = css`
      padding: 5px;
      margin-bottom: 4px;
      border-top: 0;
      border-left: 0;
      border-right: 0;
      border: 1px solid #e0e0e0;
      border-bottom-color: #e0e0e0;
      border-radius: 5px;
      background: #ffffff;
    `;

    const g_item_thumbnail = css`
      background-image: url(images/placeholder_project120x80.png);
      background-repeat: no-repeat;
      background-position: center;
    `;

    const g_action_bar = css`
      text-align: right;
      white-space: nowrap;
      font-size: 12px;
      font-weight: normal;
      color: #000;
      padding: 5px 5px;
    `;

    const g_action_zoomto = css`
    padding: 5px 5px;
    `;

    const g_action_add = css`
    padding: 5px 5px;
    `;

    const g_action_details = css`
    padding: 5px 5px;
    `;

    const g_action_message = css`
      padding: 5px 5px;
      font-size: 9px;
      font-style: italic;
    `;

    const g_action_links = css`
        margin-top: -4px;
      `;

    let task = {};

    try {
      this.toggleLoading(true);
      var parameterMap = this.buildQueryParams(task);
      parameterMap['f'] = "json";

      let requestInfo = {
        requestUrl: "/request",
        baseUrl: "/base",
        headerMap: {},
        parameterMap: parameterMap
      };
      
      for (i=0;i<this.state.selectedOptions.length;i++) {
        // TODO - send query to each target
        // TODO - for not active target, just update result count in target drop-down list
      }
      // TODO - replace with the above loop over all registered targets
      const response = await fetch(`https://gpt.geocloud.com/geoportal2/opensearch?q=${parameterMap['q']}&f=json&from=1&size=10&sort=title.sort%3Aasc&esdsl=%7B%7D`);

      // TODO - for active target, get the detailed result and prepare to render
      const data = await response.json();  

      let resultList = [];
      for (var i=0; i<data.results.length; i++) {
        // TODO - render links and corresponding actions (Zoom to, Add, Details, Links)
        // TODO - if action fails, render message in message span
        let item = data.results[i];
        let itemDiv = <div css={g_item_card} key={"results"}>
            <div key={i} css={g_item_title}>{item.title}</div>
            <div css={g_item_thumbnail}><img key={i} css={g_item_thumbnail} src={item._source.thumbnail_s}/></div>
            <div css={g_item_description}>{item.description}</div>
            <div css={g_action_bar}>
              <span key={"message_"+i} css={g_action_message}></span>
              <a key={"zoomTo_"+i} css={g_action_zoomto}>Zoom to</a>
              <a key={"add_"+i} css={g_action_add}>Add</a>
              <a key={"details_"+i} css={g_action_details}>Details</a>
              <span key={"links_"+i} css={g_action_links}>Links</span>
            </div>            
          </div>;
        resultList.push(itemDiv);
      }
      this.setState({resultList: resultList});

      this.render();
    }
    catch(err) {
      
    }
    finally {
      this.toggleLoading(false);
    }
  }

  buildQueryParams = (task) => {
    var qRequired = null;
    var requiredFilter = this.state.searchText;
    if (typeof requiredFilter === "string" && requiredFilter.length > 0) {
        qRequired = requiredFilter;
    }
    var params = {
      q: qRequired,
      canSortByRelevance: false
    };
    
    //Target Options

    //BBox
    if (this.state.isBbox){
      // TODO - get bbox from current map extent and apply to filter
    }

    //Live Data
    if (this.state.isLiveData){
      params.canSortByRelevance = true;
      params['type'] = "liveData";
    }

    //Sort Options
    params['sortField'] = null;
    params['sortOrder'] = null;
    
    var sortField = this.state.relevance;
    if (sortField !== null && sortField.length > 0 && sortField !== "Relevance") {
      params['sortField'] = sortField;
    }
    
    delete params.canSortByRelevance;
    return params;
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
  }

  // TODO - when relevance changes, re-run the queries and render result
  relevanceOnChange = (event) => {
    this.setState({ relevance: event.target.value });
  }

  // TODO - when bbox checkbox changes, re-run the queries and render result
  bboxOnChange = (event) => {
    this.setState({ isBbox: event.target.checked })
  }

  // TODO - when liveData checkbox changes, re-run the queries and render result
  liveDataOnChange = (event) => {
    this.setState({ isLiveData: event.target.checked })
  }

  handleFilterAccept = (value) => {
    this.setState({ searchText: value })
  }

  // TODO - when there is a change in the multi-select, re-run queries and render result
  multiSelectOnChange = (value, event) => {
    if (event.action === "deselect-option") {
      this.setState({ selectedOptions: value.filter((o) => o.value) })
    }
    if (event.action === "select-option") {
      var joined = this.state.selectedOptions.concat(value);
      this.setState({ selectedOptions: joined })
    }
  }

  toggleLoading = (visible) => {
    this.setState({ loading: visible })
  }

  // TODO - can all these styles be externalized and not included in code?
  render() { 
    const titleStyle = css`
      font-size: 1.10em;
      text-align: center;
      font-weight: bold;
      margin: 10px 0px 10px 0px;
      text-align: left;
    `;

    const searchButton = css`
      display: flex;
      justify-content: center;
      align-items: center; 
      width: 40px;
    `;

    const searchButtonContainer = css`
      padding-left: 5px;
      padding-right: 5px;
    `;

    const optionsContainer = css`
      display: flex;
      padding-top: 5px;
    `;

    const optionsCheckboxLabel = css`
      padding-left: 3px;
    `;

    const relevanceCombo = css`
    width: 70px;
    height: 10px;
    font-size: 2px;
    -webkit-appearance: none;
  `;

    const searchResults = css`
    width: 100%;
    overflow-y: scroll;  
  `;

    const loadingOverride = css`
      display: block;
      margin: 0 auto;
      border-color: red;
    `;

    const g_results_list = css`
      overflow-y: scroll;  
    `;

    const g_catalogs_list = css`
      control: (_, { selectProps: { width } }) => ({
        width: 300
      }),

      dropdownButton: (provided, state) => ({
        ...provided,
        color: 'black'
      })
    `;

    return (
      <div className="jimu-widget" >
        <div css={titleStyle}>{this.props.config.widgetTitle}</div>

        <div style={{ display: 'flex' }}>
          <TextInput id='searchBox' onAcceptValue={this.handleFilterAccept} onKeyUp={this.searchBoxOnKeyUp} style={{ width: '350px' }} placeholder={'Search...'} />
          <div css={searchButtonContainer}>
            <Button css={searchButton} onClick={this.searchClick}>
              <span>
                <Icon icon={require('jimu-ui/lib/icons/search.svg')} size={12} />
              </span>
            </Button>
          </div>
        </div>

        <div id='optionsContainer' css={optionsContainer}>
          <div css={g_catalogs_list}>
            <ReactMultiSelectCheckboxes value={this.state.selectedOptions} css="" onChange={this.multiSelectOnChange} id='catalogSelect' placeholderButtonLabel={'Catalog'} options={this.state.catalogOptions} /> 
          </div>

          <div style={{ display: 'flex', paddingTop: '5px' }}>
            <div>
              <Label>
                <Checkbox id='chkBoxBbox' onChange={this.bboxOnChange} />
                <span css={optionsCheckboxLabel}>BBox</span>
              </Label>
            </div>

            <div style={{ paddingLeft: '10px' }}>
              <Label>
                <Checkbox id='chkBoxBbox' onChange={this.liveDataOnChange} />
                <span css={optionsCheckboxLabel}>Live Data</span>
              </Label>
            </div>

            <div style={{ paddingLeft: '10px' }}>
              <select onChange={this.relevanceOnChange} value={this.state.relevance}>
                <option value="Releveance" style={{ fontWeight: 'bold' }}>Releveance</option>
                <option value="Title">Title</option>
                <option value="Date">Date</option>
              </select>
            </div>
          </div>
        </div>

        <div id='searchResults' css={searchResults}>
          <div>
            <div css={g_results_list}>{this.state.resultList}</div>

            <input type="hidden" value=""/>
          </div>          
        </div>

        <div style={{ display: 'flex', paddingTop: '5px' }}>
          <ClipLoader color={'#000080'} loading={this.state.loading} css={loadingOverride} size={20} />
        </div>

      </div>
    );
  }
}
