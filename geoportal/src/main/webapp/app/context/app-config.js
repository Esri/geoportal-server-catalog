define([],function(){var obj={
// .......................................................................................
  
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
    useSimpleQueryString: false
  },
  
  searchMap: {
    basemap: "topo",
    autoResize: true, 
    wrapAround180: true,
    center: [-84.5, 34], 
    zoom: 5
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
    showJSONLink: false,
    showXMLLink: false,
    showHTMLLink: true
  },
  
  statusChecker: {
    apiUrl: "http://registry.fgdc.gov/statuschecker/api/v2/results?",
    infoUrl: "http://registry.fgdc.gov/statuschecker/ServiceDetail.php?",
    authKey: null
  }
  
// .......................................................................................
};return obj;});