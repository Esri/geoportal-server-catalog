define([],function(){var obj={
// .......................................................................................
  
  system: {
    searchLimit: 10000
  },
  
  edit: {
    setField: {
      allow: false,
      adminOnly: false
    }
  },
  
  bulkEdit: {
    allowByOwner: true,
    allowBySourceUri: true,
    allowByTaskRef: true,
    allowByQuery: true
  },
  
  search: {
    allowSettings: false,
    useSimpleQueryString: false,
    escapeFilter: false
  },
  
  searchMap: {
    basemap: "topo",
    autoResize: true, 
    wrapAround180: true,
    center: [-84.5, 34], 
    zoom: 5,
    showHomeButton: true,

    locatorParams: {  
      sources: [
        {
          url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
          name: "World Locator",
          singleLineFieldName: "SingleLine",
          placeholder: "Search by Address",
          countryCode: "US",
          maxResults: 10,
          searchInCurrentMapExtent: false,
          type: "locator"
        },
        {
          url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
          name: "Regional Locator",
          singleLineFieldName: "SingleLine",
          placeholder: "Search by Address",
          countryCode: "US",
          maxResults: 10,
          searchInCurrentMapExtent: true,
          type: "locator"
        }
      ]
    }
  },
  
  searchResults: {
    numPerPage: 10,
    showDate: true,
    showOwner: true,
    showThumbnails: true,
    showAccess: true,
    showApprovalStatus: true,
    defaultSort: "title.sort:asc",
    showLinks: true,
    showCustomLinks: true,
    showOpenSearchLinks: true,
    showTotalCountInHierarchy: true
  },
  
  statusChecker: {
    apiUrl: "http://registry.fgdc.gov/statuschecker/api/v2/results?",
    infoUrl: "http://registry.fgdc.gov/statuschecker/ServiceDetail.php?",
    authKey: null
  }
  
// .......................................................................................
};return obj;});
