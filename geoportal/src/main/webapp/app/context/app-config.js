define([],function(){var obj={
// .......................................................................................

  allowBulkChangeOwner: true,
  
  search: {
    allowSettings: true,
    useSimpleQueryString: true
  },
  
  searchMap: {
    basemap: "streets",
    autoResize: true, 
    wrapAround180: true,
    center: [-98, 40], 
    zoom: 3
  },
  
  searchResults: {
    numPerPage: 10,
    showDate: true,
    showOwner: true,
    showThumbnails: true,
    defaultSort: "title.sort:asc"
  }
  
// .......................................................................................
};return obj;});