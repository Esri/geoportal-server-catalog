define([],function(){var obj={
// .......................................................................................

  system: {
    searchLimit: 10000,
    secureCatalogApp:false
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
    allowSettings: true,
    useSimpleQueryString: false,
    escapeFilter: false
  },

  searchMap: {
    basemap: "streets",
    basemapUrl: "",
    isTiled: false,
    autoResize: true,
    wrapAround180: true,
    center: [-98, 40],
    zoom: 2
  },

  searchResults: {
    numPerPage: 10,
    showDate: true,
    showOwner: true,
    showThumbnails: true,
    showFootprint: true,
    showAccess: true,
    showApprovalStatus: true,
    defaultSort: {"title.keyword": {"order" : "asc" ,"unmapped_type": "keyword"}},   
    sortDesc:{"title.keyword": {"order" : "desc" ,"unmapped_type": "keyword"}},
    showLinks: true,
    showCustomLinks: true,
    showOpenSearchLinks: true,
    showTotalCountInHierarchy: true,
    showShoppingCart: false
  },

  statusChecker: {
    apiUrl: "http://registry.fgdc.gov/statuschecker/api/v2/results?",
    infoUrl: "http://registry.fgdc.gov/statuschecker/ServiceDetail.php?",
    authKey: null
  }

// .......................................................................................
};return obj;});