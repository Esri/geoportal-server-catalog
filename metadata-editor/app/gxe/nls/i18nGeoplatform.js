define({
  root: ({

    documentTypes: {
      data: {
        caption: "GeoPlatform Profile of ISO 19115-1",
        description: "",
		key: "geoplatform"
      }
    },

    LanguageCode: {
      eng: "English",
      cym: "Welsh",
      gle: "Gaelic (Irish)",
      gla: "Gaelic (Scottish)",
      cor: "Cornish",
      sco: "Ulster Scots"
    },

    verticalCRS: {
      reference: "Reference (e.g. urn:ogc:def:crs:EPSG::5701 )"
    },

    sections: {
      identification : {
        dataIdentification : "Data",
        LayerIdentification : "Layer"
      }
    },

  	MD_ScopeCode: {
      aggregate: "Aggregate",
  		application: "Application",
  		attribute: "Attribute",
      attributeType: "Attribute type",
      collection: "Collection",
      collectionHardware: "Collection hardware",
      collectionSession: "Collection session",
      coverage: "Coverage",
      dataset: "Dataset",
      dimensionGroup: "Dimension group",
      document: "Document",
      feature: "Feature",
      featureType: "Feature type",
      fieldSession: "Field session",
      initiative: "Initiative",
      layer: "Layer",
      map: "Map",
      mapDocument: "Map Document",
      metadata: "Metadata",
      model: "Model",
      nonGeographicDataset: "Non geographic dataset",
      product: "Product",
      propertyType: "Property type",
      repository: "Repository",
      sample: "Sample",
      series: "Series",
      service: "Service",
      software: "Software",
      tile: "Tile"
    },

  	MD_MetadataScope: {
  		name: "Name",
  		resourceScope: "Resource Scope"
    }
  })
});
