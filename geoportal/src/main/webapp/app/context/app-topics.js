define([],function(){var obj={
// .......................................................................................

  /* params - {item:obj}; */
  AddToCartClicked: "app/AddToCartClicked",

  /* params - {type:string, url:string}; */
  AddToMapClicked: "app/AddToMapClicked",
  
  /* params - {} */
  BulkUpdate: "app/BulkUpdate",
  
  /* params - {item:obj} */
  ItemAccessChanged: "app/ItemAccessChanged",
  
  /* params - {item:obj} */
  ItemApprovalStatusChanged: "app/ItemApprovalStatusChanged",
  
  /* params - {item:obj} */
  ItemOwnerChanged: "app/ItemOwnerChanged",
  
  /* params - {response:obj} */
  ItemUploaded: "app/ItemUploaded",
  
  /* params - {searchPane:obj,itemId:string} */
  ItemDeleted: "app/ItemDeleted",
  
  /* params - {item:item} */
  OnMouseEnterResultItem: "app/OnMouseEnterResultItem",
  
  /* params - {item:item} */
  OnMouseLeaveResultItem: "app/OnMouseLeaveResultItem",
  
  /* params - {searchPane:obj} */
  RefreshSearchResultPage: "app/RefreshSearchResultPage",
  
  /* params - {collection:string} */
  CollectionChanged: "app/CollectionChanged",
  
  /* params - {geoportalUser:obj} */
  SignedIn: "app/SignedIn",
  
  /* params - {} */
  AppStarted: "app/AppStarted",

  /* Fired by ItemEditorPanel after a STAC item is created/updated/deleted so
   * ItemListPanel (and any other interested widget) can refresh its list.
   * params - {collectionId:string, itemId:string, action:"create"|"update"|"delete"} */
  StacItemsChanged: "app/StacItemsChanged",

// .......................................................................................
};return obj;});