define([],function(){var obj={
// .......................................................................................

  allowBulkChangeOwner: true,
  
  search: {
    allowSettings: true
  },
  
  searchMap: {
    basemap: "streets",
    autoResize: true, 
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