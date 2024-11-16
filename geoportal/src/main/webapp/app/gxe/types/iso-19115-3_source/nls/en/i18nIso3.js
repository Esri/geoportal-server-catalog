define({

  classes: {
    ci_citation: "Citation"
  },

  documentTypes: {
    data: {
      caption: "ISO 19115-3",
      description: "ISO 19115-3 Geographic Information - Metadata - Part 1: Fundamentals"
    },
    service: {
      caption: "ISO 19119 (Service)",
      description: ""
    },
    gmi: {
      caption: "ISO 19115-2 (Imagery and Gridded Data)",
      description: ""
    }
  },
  
  general: {
    reference: "Reference"
  },
  
  sections: {
    metadata: "Metadata",
    identification: "Identification",
    distribution: "Distribution",
    quality: "Quality",
    acquisition: "Acquisition",
    resourceConstraints:"Resource Constraints",
    resourceLineage:"Resource Lineage"
  },
  
  metadataSection: {
    identifier: "Identifier",
    contact: "Contact",
    date: "Date",
    standard: "Standard",
    reference: "Reference"
  },
  
  identificationSection: {
    citation: "Citation",
    description: "Description",
    contact: "Contact",
    thumbnail: "Thumbnail",
    keywords: "Keywords",
    constraints: "Constraints",
    resource: "Resource",
    resourceTab: {
      representation: "Representation",
      language: "Language",
      classification: "Classification",
      extent: "Extent"
    },
    serviceResourceTab: {
      serviceType: "Service Type",
      extent: "Extent",
      couplingType: "Coupling Type",
      operation: "Operation",
      operatesOn: "Operates On"
    },
    additionalDocumentation: "Additional Documentation",
    processingLevel: "Processing Level",
    resourceMaintenance: "Resource Maintenance",
    graphicOverview: "Graphic Overview",
    resourceFormat: "Resource Format",
    descriptiveKeywords: "Descriptive Keywords",
    resourcSpecificUsage: "Resource Specific Usage",
    resourceConstraints: "Resource Constraints",
    associatedResource: "Associated Resource"
  },
  
  distributionSection: {
  },
  
  qualitySection: {
    scope: "Scope",
    conformance: "Conformance",
    lineage: "Lineage"
  },
  
  acquisitionSection: {
    requirement: "Requirement",
    objective: "Objective",
    instrument: "Instrument",
    plan: "Plan",
    operation: "Operation",
    platform: "Platform",
    environment: "Environment"
  },
  
  MD_Identification: {
    abstract: "Abstract",
    purpose: "Purpose",
    credit: "Credits",
    pointOfContact: "Point of Contact",
    resourceMaintenance: "Maintenance",
    graphicOverview: "Graphic Overview",
    descriptiveKeywords: "Keyword Collection",
    resourceConstraints: "Constraints"
  },
  
  CI_Address: {
    deliveryPoint: "Delivery Point",
    city: "City",
    administrativeArea: "Administrative Area",
    postalCode: "Postal Code",
    country: "Country",
    electronicMailAddress: "E-Mail Address"
  },
  
  CI_Citation: {
    title: "Title",
    alternateTitle: "Alternate Title",
    date: "Date",
    edition: "Edition",
    editionDate: "Edition Date",
    identifier: "Identifier",
    citedResponsibleParty: "Cited Responsible Party",
    presentationForm: "Presentation Form",
    series: "Series",
    otherCitationDetails: "Other Citation Details",
    isbn: "ISBN",
    issn: "ISSN",
    onlineResource: "Online Resource",
    graphic: "Graphic",
  },
  
  CI_Contact: {
    phone: "Phone",
    address: "Address",
    onlineResource: "Online Resource",
    hoursOfService: "Hours of Service",
    contactInstructions: "Contact Instructions"
  },
  
  CI_Date: {
    date: "Date",
    dateType: "Date Type"
  },
  
  CI_DateTypeCode: {
    caption: "Date Type",
    creation: "Creation",
    publication: "Pulication",
    revision: "Revision",
    expiry: "Expiry",
    lastUpdate: "Last Update",
    lastRevision: "Last Revision",
    nextUpdate: "Next Update",
    unavailable: "Unavailable",
    obtainable: "Obtainable",
    inForce: "In Force",
    adopted: "Adopted",
    deprecated: "Deprecated",
    superseded: "Superseded",
    replaced: "Replaced",
    validityBegins: "Validity Begins",
    validityExpires: "Validity Expires",
    valid: "Valid",
    released: "Released",
    access: "Access",
    distribution: "Distribution",
    distributed: "Distributed"
  },
  
  CI_OnLineFunctionCode: {
    download: "Download",
    information: "Information",
    offlineAccess: "Offline Access",
    order: "Order",
    search: "Search",
    completeMetadata: "Complete Metadata",
    browseGraphic: "Browse Graphic",
    upload: "Upload",
    emailService: "Email Service",
    browsing: "Browsing",
    fileAccess: "File Access"
  },
  
  CI_OnlineResource: {
    linkage: "URL",
    protocol: "Protocol",
    applicationProfile: "Application Profile",
    name: "Name",
    description: "Description",
    function: "Function",
    protocolRequest: "Protocol Request"
  },

  CI_Party: {
    name: "Name",
    contactInfo: "Contact Information"
  },

  CI_Individual:{
    name: "Name",
    contactInfo: "Contact Info",
    positionName: "Position Name"

  },

  CI_Organisation: {
    name: "Name",
    contactInfo: "Contact Info",
    possitionName: "Postion name",
    logo: "Logo",
    individual: "Individual"
  },
  
  CI_PresentationFormCode: {
    documentDigital: "Document Digital",
    documentHardcopy: "Document Hardcopy",
    imageDigital: "Image Digital",
    imageHardcopy: "Image Hardcopy",
    mapDigital: "Map Digital",
    mapHardcopy: "Map Hardcopy",
    modelDigital: "Model Digital",
    modelHardcopy: "Model Hardcopy",
    profileDigital: "Profile Digital",
    profileHardcopy: "Profile Hardcopy",
    tableDigital: "Table Digital",
    tableHardcopy: "Table Hardcopy",
    videoDigital: "Video Digital",
    videoHardcopy: "Video Hardcopy",
    audioDigital: "Audio Digital",
    audioHardcopy: "Audio Hardcopy",
    multimediaDigital: "Multimedia Digital",
    multimediaHardcopy: "Multimedia Hardcopy",
    physicalObject: "Physical Object",
    diagramDigital: "Diagram Digital",
    diagramHardcopy: "Diagram Hardcopy"
  },

  CI_ResponsibleParty: {
    caption: "Point of Contact",
    individualName: "Individual Name",
    organisationName: "Organisation Name",
    positionName: "Position Name",
    contactInfo: "Contact Info",
    role: "Role"
  },
  
  CI_Responsibility: {
    role: "Role",
    extent: "Extent",
    party: "Party"
  },

  CI_RoleCode: {
    resourceProvider: "Resource Provider",
    custodian: "Custodian",
    owner: "Owner",
    user: "User",
    distributor: "Distributor",
    originator: "Originator",
    pointOfContact: "Point of Contact",
    principalInvestigator: "Principal Investigator",
    processor: "Processor",
    publisher: "Publisher",
    author: "Author",
    sponsor: "Sponsor",
    coAuthor: "Co-author",
    collaborator: "Collaborator",
    editor: "Editor",
    mediator: "Mediator",
    rightsHolder: "Rights Holder",
    contributor: "Contributor",
    funder: "Funder",
    stakeholder: "Stakeholder",
  },
  
  CI_Series: {
    name: "Name",
    issueIdentification: "Issue Identification",
    page: "Page"
  },

  CI_Telephone: {
    voice: "Voice",
    facsimile: "Fax"
  },
  
  DCPList: {
    caption: "DCP",
    XML: "XML",
    CORBA: "CORBA",
    JAVA: "JAVA",
    COM: "COM",
    SQL: "SQL",
    WebServices: "WebServices"
  },
  
  DQ_ConformanceResult: {
    caption: "Conformance Result",
    explanation: "Explanation",
    degree: {
      caption: "Degree",
      validationPerformed: "Validation Performed",
      conformant: "Conformant",
      nonConformant: "Non Conformant"
    },
    result: "ConformanceResult",
    specification: "Data Quality Specification"
  },
  
  DQ_MeasureReference:  {
    caption: "Measure Reference",
    measureIdentification: "Measure Identification",
    nameOfMeasure: "Name of Measure",
    measureDescription: "Measure Description"
  },
  
  DQ_DataQuality: {
    report: "Data Quality Report",
    scope: "Data Quality Scope",
    measure: "Measure",
    domainConsistency: "Domain Consistency"
  },
  
  
  DQ_Scope : {
    level: "Scope (quality information applies to)",
    levelDescription: "Level Description"
  },
  
  EX_Extent: {
    caption: "Extent",
    description: "Description",
    geographicElement: "Spatial Element",
    temporalElement: "Temporal Element",
    verticalElement: "Vertical Element"
  },
  
  EX_GeographicBoundingBox: {
    westBoundLongitude: "West Bounding Longitude",
    eastBoundLongitude: "East Bounding Longitude",
    southBoundLatitude: "South Bounding Latitude",
    northBoundLatitude: "North Bounding Latitude"
  },
  
  EX_GeographicDescription: {
    caption: "Geographic Description"
  },
  
  EX_TemporalExtent: {
    TimePeriod: {
      beginPosition: "Begin Date",
      endPosition: "End Date"
    }
  },
  
  EX_VerticalExtent: {
    minimumValue: "Minimum Value",
    maximumValue: "Maximum Value",
    verticalCRS: "Vertical CRS",
    verticalCRSId: "Vertical CRS ID"
  },
  
  Length: {
    caption: "Length",
    uom: "Units of Measure",
    km: "Kilometers",
    m: "Meters",
    mi: "Miles",
    ft: "Feet"
  },
  
  LI_Lineage: {
    caption: "Lineage",
    statement: "Lineage Statement",
    scope: "Scope",
    additionalDocumentation:"Additional Documentation",
    processStep: "Process Step",
    source: "Lineage Source"
  },
  

  LI_ProcessStep: {
    description: "Description",
    rationale: "Rationale",
    stepDateTime:"Step Date Time",
    processor: "Processor",
    reference: "Reference",
    scope: "Scope",
    source: "Source"
  },

  LI_Source: {
    description: "Description",
    sourceSpatialResolution:"Source Spatial Resolution",
    sourceReferenceSystem: "Source Reference System",
    sourceCitation: "Source Citation",
    sourceMetadata: "Source Metadata",
    scope: "Scope",
    sourceStep: "Source Step"
  },

  MD_FeatureTypeInfo: {
    featureTypeName: "Feature Type Name",
    featureInstanceCount: "Feature Instance Count"
  },

  MD_ContentInformation:{
    caption: "Content Information",
  
  },
  MD_FeatureCatalogueDescription: {
    caption: "Feature Catalogue Description",
    complianceCode: "Compliance Code",
    locale: "Locale",
    includedWithDataset: "Include With Dataset",
    featureTypes: "Feature Types",
    featureCatalogueCitation: "Feature Catalogue Citation"
  },
  MD_FeatureCatalogue: {
    caption: "Feature Catalogue",
    featureCatalogue: "Feature Catalogue"
  },
  MD_MetadataExtensionInformation: {
    extensionOnLineResource: "Extension Online Resource",
    extendedElementInformation: "Extended Element Information"
  },
  MD_ExtendedElementInformation: {
    name: "Name",
    defintion: "Definition",
    obligation: "Obligation",
    condition: "Condition",
    dataType: "Data Type",
    maximumOccurrence: "Maximun Occurrence",
    domainValue: "Domain Value",
    parentEntity: "Parent Entity",
    rule: "Rule",
    rationale: "Rationale",
    source: "Source",
    conceptName: "Concept Name",
    code: "Code"
  },
  FC_FeatureCatalogue: {
    name: "Feature Catalogue Name",
    scope: "Scope",
    fieldOfApplication: "Field of Application",
    versionNumber: "Version Number",
    versionDate: "Version Date",
    producer: "Producer",
    functionalLanguage: "Functional Language",
    featureType: "Feature Type",
    definitionSource: "Definition Source"
  },
  FC_InheritanceRelation: {
    name: "Name",
    description: "Description",
    uniqueInstance: "UniqueInstance",
    subtType: "Subtype",
    superType: "Super Type"
  },
  FC_Constraint: {
    description: "Description"
  },
  FC_PropertyType: {
    memberName: "Member Name",
    definition: "Definition",
    cardinality: "Cardinality",
    featureType: "Feature Type",
    constrainedBy: "Constrained By",
    definitionReference: "Definition Reference"
  },
  FC_DefinitionReference: {
    sourceIdentifier: "Source Identifier",
    definitionSource: "Definition Source"
  },
  FC_DefinitionSource: {
    caption: "Definition Source",
    source: "Source"
  },
  MD_CoverageDescription: {
    caption: "Coverage Description",
    attributeDescription: "Attribute Description",
    processingLevelCode: "Processing Level Code",
    attributeGroup: "Attribute Group"
  },
  MD_AttributeGroup: {
    contentType: "Content Type",
    attribute: "Attribute"
  },
  MD_RangeDimension: {
    sequenceIdentifier: "Sequence Identifier",
    description: "Description",
    name: "Name"
  },
  MD_SampleDimension: {
    caption: "Sample Dimension",
    maxValue: "Max Value",
    minValue: "Min Value",
    units: "Units",
    scaleFactor: "Scale Factor",
    meanValue: "Mean Value",
    numberOfValues: "Number of Values",
    standardDeviation: "Standard Deviation",
    otherPropertyType: "Other Property Type",
    otherProperty: "Other Property",
    bitsPerValue: "bits Per Value"
  },
  MD_Band: {
    caption: "Band",
    boundMax: "Bound Max",
    boundMin: "Bound Min",
    boundUnit: "Bound Unit",
    peakResponse: "Peak Response",
    toneGradation: "Tone Gradation"
  },
  MD_CoverageContentTypeCode:{
    image: "Image",
    thematicClassification: "Thematic Classification",
    physicalMeasurement: "Physical Measurement",
    auxillaryInformation: "Auxillary Information",
    qualityInformation: "Quality Information",
    referenceInformation: "Reference Information",
    modelResult: "Model Result",
    coordinate: "Coordinate"
  },
  MD_ImageDescription: {
    caption: "Image Description",
    illuminationElevationAngle: "Illumination Elevation Angle",
    illuminationAzimuthAngle: "illumination Azimuth Angle",
    imagingCondition: "Imaging Condition",
    imageQualityCode: "Image Quality Code",
    cloudCoverPercentage: "Cloud Cover Percentage",
    compressionGenerationQuantity: "Compression Generation Quantity",
    triangulationIndicator: "Triangulation Indicator",
    radiometricCalibrationDataAvailability: "Radio Metric Calibration Data Availability",
    cameraCalibrationInformationAvailability: "Camera Calibration Information Availability",
    filmDistortionInformationAvailability: "Film Distortion Information Availability",
    lensDistortionInformationAvailability: "Lens Distortion Information Availability"
  },
  FC_FeatureType: {
      typeName: "Type Name",
      definition: "Definition",
      code: "Code",
      isAbstract:"is Abstract",
      aliases: "Aliases",
      inheritsFrom: "Inherits From",
      inheritsTo: "Inherits To",
      carrierOfCharacteristics: "Carrier of Characteristics",
      constrainedBy: "Constrained By",
      definitionReference: "Definition Reference"
  },

  MD_BrowseGraphic: {
    caption: "Browse Graphic",
    fileName: "Browse Graphic URL",
    fileDescription: "Browse Graphic Caption",
    fileType: "Browse Graphic Type"
  },
  
  MD_ClassificationCode: {
    unclassified: "Unclassified",
    restricted: "Restricted",
    confidential: "Confidential",
    secret: "Secret",
    topSecret: "Top Secret",
    sensitiveButUnclassified:"Sensitive but Unclassified",
    forOfficialUseOnly: "for Offical Use Only",
    protected: "Protected",
    limitedDistribution:"Limited Distribution"
  },
  
  MD_Constraints: {
    caption: "Usage Constraints",
    useLimitation: "Use Limitation",
    reference: "Reference",
    handlingDescription: "Handling Description",
    classificatoinSystem: "Classification System",
    userNote: "User Note",
    otherConstraints: "Other Constraints",
    constraintApplicationScope: "Application Scope"
  },
  
  MD_DataIdentification: {
    caption: "Data Identification",
    spatialRepresentationType: "Spatial Representation Type",
    spatialResolution: "Spatial Resolution",
    language: "Resource Language",
    supplementalInformation: "Supplemental",
    environmentDescription: "Environment Description"
  },
  
  MD_DigitalTransferOptions: {
    unitsOfDistribution: "Units of Distribution",
    transferSize: "Transfer Size",
    onLine: "Online",
    offLine: "Offline",
    transferFrequency: "Transfer Frequency",
    distributionFormat: "Distribution Format"
  },
  
  MD_StandardOrderProcess: {
    fees: "Fees",
    plannedAvailableDateTime: "Planned Available DateTime",
    orderinginstructions: "Ordering Instructions",
    turnaround: "Turn Around",
    orderOptionsType: "Order Options Type",
    orderOptions: "Order Options"
  },

  MD_Distributor: {
    distributorContact: "Distributor contact",
    distributionOrderProcess: "Distribution Order Process",
    distributorFormat: "Distributor Format",
    distributorTransferOptions: "Distributor Transfer Options"
  },

  MD_Distribution: {
    distributionFormat: "Distribution Format",
    transferOptions: "Transfer Options",
    description: "Description",
    distributor: "Distributor"
  },
  
  MD_Format: {
    name: "Format Name",
    version: "Format Version",
    formatSpecificationCitation: "Format Specification Citation",
    amendmentNumber: "Amendment Number",
    fileDecompressionTechnique: "File Decompression Technique",
    medium: "Medium",
    formatDistributor: "Format Distributor"
  },

  MD_Medium: {
    name: "Medium Name",
    density: "Density",
    densityUnits: "Density Units",
    volumes: "Volumes",
    mediumFormat:"Medium Format",
    mediumNote: "Note",
    identifier: "Identifier"
  },

  MD_MediumFormatCode: {
    cpio: "CPIO",
    tar: "TAR",
    highSierra: "highSierra",
    iso9660: "ISO9660",
    iso9660RockRidge: "ISO9600 rock Ridge",
    iso9600AppleHFS: "ISO9660 Apple HFS",
    udf: "UDF"
  },
  
  
  MD_Identifier: {
    authority: "Authority",
    code: "Code",
    codeSpace: "Code Space",
    version: "Version",
    description: "Description",
  },
  
  MD_Keywords: {
    keyword: "Keyword",
    type: "Type",
    keywordClass: "KeywordClass",
    delimitedCaption: "Keywords",
    thesaurusName: "Associated Thesaurus"
  },
  MD_KeywordClass:{
    className: "Class Name",
    conceptIdentifier: "Concept Identifier",
    ontology: "Ontology"
  },
  MD_KeywordTypeCode: {
    caption: "Keyword Type",
    discipline: "Discipline",
    place: "Place",
    stratum: "Stratum",
    temporal: "Temporal",
    theme: "Theme",
    dataCentre: "Data centre",
    featureType: "Feature type",
    instrument: "Instrument",
    platform: "Platform",
    process: "Process",
    project: "Project",
    service: "Service",
    product: "Product",
    subTopicCategory: "Sub-Topic Category",
    taxon: "Taxon",
    audience: "Audience",
    subject: "Subject",
    community: "Community",
    "function": "Function",
    domain: "Domain"
  },

  MD_Usage: {
    specificUsage: "Specific Usage",
    usageDateTime: "Usage DateTime",
    userDeterminedLimitations: "User Determined Limitations",
    userContactInfo: "User Contact Info",
    response: "Response",
    additionalDocumentation: "Additional Documentation",
    IdentifiedIssues: "Identified Issues"
  },

  MD_AssociatedResource: {
    name: "Name",
    associationType: "Association Type",
    initiativeType: "Initiative Type",
    metadataReference: "Metadata Reference"
  },

  DS_AssociationTypeCode: {
    crossReference: "Cross reference",
    largerWorkCitation: "Larger work citation",
    partOfSeamlessDatabase: "Part of seamless database",
    stereoMate: "Stereo mate",
    isComposedOf: "Is composed of",
    collectiveTitle: "collective Title",
    series: "Series",
    dependency: "Dependency",
    revisionOf: "Revision Of"
  },

  DS_InitiativeTypeCode: {
    campaign: "Campaign",
    collection: "Collection",
    exercise: "Exercise",
    experiment: "Experiment",
    investigation: "Investigation",
    mission: "Mission",
    sensor: "Sensor",
    operation: "Operation",
    platform: "Platform",
    process: "Process",
    program: "Program",
    project: "Project",
    study: "Study",
    task: "Task",
    trial: "Trial"
  },

  MD_LegalConstraints: {
    caption: "Legal Constraints",
    accessConstraints: "Access Constraints",
    useConstraints: "Use Constraints",
    otherConstraints: "Other Constraints"
  },
  
  MD_MaintenanceFrequencyCode: {
    caption: "Frequency",
    continual: "Continual",
    daily: "Daily",
    weekly: "Weekly",
    fortnightly: "Fortnightly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    biannually: "Biannually",
    annually: "Annually",
    asNeeded: "As Needed",
    irregular: "Irregular",
    notPlanned: "Not Planned",
    unknown: "Unknown"
  },

  MD_MaintenanceInformation: {
    caption: "Maintenance Information",
    maintenanceAndUpdateFrequency: "Maintenance and Update Frequency",
    maintenanceDate: "Maintenance Date",
    userDefineMaintenanceFrequency: "User Define Maintenance Frequency",
    maintenanceScope: "Maintenance Scope",
    maintenanceNote: "Maintenance Note",
    contact: "Contact"
  },
  
  MD_Metadata: {
    caption: "Metadata",
    metadataIdentifier: "Identifier",
    defaultLocale: "Default Locale",
    parentMetadata: "Parent Metadata",
    contact: "Metadata Contact",
    dateInfo: "Date Info",
    metadataStandard: "Metadata Standard",
    metadataProfile: "Metadata Profile",
    fileIdentifier: "File Identifier",
    alternativeMetadataReference: "Alternative Metadata Reference",
    otherLocale: "Other Locale",
    metadataLinkage: "Metadata Linkage",
    spatialRepresentationInfo: "Spatial Representation",
    metadataExtensionInfo: "Metadata Extension",
    identificationInfo: "Identification",
    contentInfo: "Content Information",
    distributionInfo: "Distribution",
    dataQualityInfo: "Quality",
    portrayalCatalogueInfo: "Portrayal Catalogue",
    metadataConstraints: "Constraints",
    applicationSchemaInfo: "Application Schema Info",
    metadataMaintenance: "Metadata Maintenance",
    resourceLineage: "Lineage",
    metadataScope: "Metadata Scope",
    resourceScope: "Resource Scope",
    name: "Scope Name",

    language: "Metadata Language",
    hierarchyLevel: "Hierarchy Level",
    hierarchyLevelName: "Hierarchy Level Name",
    dateStamp: "Metadata Date",
    referenceSystemInfo: "Reference System"
  },
  
  MD_ProgressCode: {
    caption: "Progress Code",
    completed: "Completed",
    historicalArchive: "Historical Archive",
    obsolete: "Obsolete",
    onGoing: "On Going",
    planned: "Planned",
    required: "Required",
    underDevelopment: "Under Development"
  },
  
  MD_RepresentativeFraction: {
    denominator: "Denominator"
  },
  
  MD_Resolution: {
    equivalentScale: "Equivalent Scale",
    distance: "Distance"
  },
  
  MD_Releasability: {
    caption: "Releasability",
    addressee: "Addressee",
    statement: "Statement",
    disseminationConstraints: "Dissemination Constraints"
 },
 
  MD_RestrictionCode: {
    copyright: "Copyright",
    patent: "Patent",
    patentPending: "Patent Pending",
    trademark: "Trademark",
    license: "License",
    intellectualPropertyRights: "Intellectual Property Rights",
    restricted: "Restricted",
    otherRestrictions: "Other Restrictions",
    unrestricted: "unrestricted",
    licenceUnrestricted:"licenceUnrestricted",
    licenceEndUser:"LicenceEndUser"
  },
  
  MD_PortrayalCatalogueReference: {
    portrayalCatalogueCitation: "Portrayal Catalogue Citation"
  },

  MD_ApplicationSchemaInfo: {
      name: "Name",
      schemaLanguage: "Schema Language",
      constraintLanguage: "Constraint Language",
      schemaAscii: "Schema Ascii",
      graphicsFile: "Graphics File",
      softwareDevelopmentFileFormat: "Software Development File Format"
  },

  MD_Scope: {
    level: "Level",
    extent: "Extent",
    levelDescription: "Level Description"
},

MD_ScopeDescription: {
  attributes: "Attributes",
  features: "Features",
  featureInstances: "Feature Instances",
  attributeInstances: "Attribute Instances",
  dataset: "Dataset",
  other: "Others"
},

  MD_ScopeCode: {
    attribute: "Attribute",
    attributeType: "Attribute type",
    collectionHardware: "Collection hardware",
    collectionSession: "Collection session",
    dataset: "Dataset",
    series: "Series",
    nonGeographicDataset: "Non geographic dataset",
    dimensionGroup: "Dimension group",
    feature: "Feature",
    featureType: "Feature type",
    propertyType: "Property type",
    fieldSession: "Field session",
    software: "Software",
    service: "Service",
    model: "Model",
    tile: "Tile",
    metadata: "metadata",
    initiative: "Initiative",
    sample: "Sample",
    document: "Document",
    repository: "Repository",
    aggregate: "Aggregate",
    product: "Product",
    collection: "Collection",
    coverage: "Coverage",
    application: "Application",
    map: "Map",
    mapDocument: "Map Document",
    layer: "Layer"
  },
  
  MD_ScopeDescription: {
    attributes: "Attributes",
    features: "Features",
    featureInstances: "Feature Instances",
    attributeInstances: "Attribute Instances",
    dataset: "Dataset",
    other: "Other"
  },
  MD_SecurityConstraints: {
    caption: "Security Constraints",
    classification: "Classification",
    userNote: "User Note",
    classificationSystem: "Classification System",
    handlingDescription: "Handling Description"
  },
  MD_SpatialRepresentation: {
    gridSpatialRepresentation: "Grid Spatial Representation",
    georectified: "Georectified",
    georeferenceable: "Georeferenceable",
    vectorSpatialRepresentation: "Vector Spatial Representation",
    dimension: "Dimension"
  },
  MD_GridSpatialRepresentation: {
    numberOfDimensions: "Number of Dimensions",
    axisDimensionProperties: "Axis Dimension Properties",
    cellGeometry: "Cell Geometry",
    transformationParameterAvailability: "Transformation Parameter Availability"
  },
  MD_Georectified: {
    checkPointAvailability: "Check Point Availability",
    checkPointDescription: "Check Point Description",
    cornerPoints: "Corner Points",
    centrePoint: "Centre Point",
    pointInPxiel: "Point In Pixel",
    transformationDimensionDescription:"Transformation Dimension Description",
    transformationDimensionMapping:"Transformation Dimension Mapping"
  },
  MD_Georeferenceable: {
    controlPointAvailability: "Control Point Availability",
    orientationParameterAvailability: "Orientation Parameter Availability",
    orientationParameterDescription: "Orientation Parameter Description",
    georeferencedParameters: "Georeference Parameters",
    parameterCitation: "Parameter Citation"
  },
  MD_VectorSpatialRepresentation:{
    topologyLevel: "Topology Level",
    geometricObjects: "Geometric Object"
  },
  MD_Dimension: {
    dimensionName: "Dimension Name",
    dimensionSize: "Dimension Size",
    resolution: "Resolution",
    dimensionTitle: "Dimension Title",
    dimensionDescription: "Dimension Description"
  },

  MD_GeometricObjects:{
    geometricObjectType: "Geometric Object Type",
    geometricObjectCount: "Geometric Object Count"
  },
 
  MD_CellGeometryCode: {
    point: "Point",
    area: "Area",
    voxel: "Voxel",
    stratum: "Stratum"
  },
  MD_DimensionNameTypeCode: {
    row: "Row",
    column: "Column",
    vertical: "Vertical",
    track: "Track",
    crossTrack: "Cross Track",
    line: "Line",
    sample: "Sample",
    time: "Time"
  },
  MD_TopologyLevelCode: {
    geometryOnly: "Geometry Only",
    topology1D: "Topology 1D",
    planarGraph: "Planar Graph",
    fullPlanarGraph: "Full Planar Graph",
    surfaceGraph: "Surface Graph",
    fullSurfaceGraph: "Full Surface Graph",
    topology3D: "Topology 3D",
    fullTopology3D: "Full Topology 3D",
    abstract: "Abstract"
  },
  MD_GeometryObjectTypeCode: {
    complex: "Complex",
    composite: "Composite",
    curve: "Curve",
    point: "Point",
    solid: "Solid",
    surface: "Surface"
  },
  MD_SpatialRepresentationTypeCode: {
    caption: "Spatial Representation Type",
    vector: "Vector",
    grid: "Grid",
    textTable: "Text Table",
    tin: "TIN",
    stereoModel: "Stereo Model",
    video: "Video"
  },
  
  MD_TopicCategoryCode: {
    caption: "Topic Category",
    boundaries: "Administrative and Political Boundaries",
    farming: "Agriculture and Farming",
    climatologyMeteorologyAtmosphere: "Atmosphere and Climatic",
    biota: "Biology and Ecology",
    economy: "Business and Economic",
    planningCadastre: "Cadastral",
    society: "Cultural, Society and Demography",
    elevation: "Elevation and Derived Products",
    environment: "Environment and Conservation",
    structure: "Facilities and Structures",
    geoscientificInformation: "Geological and Geophysical",
    health: "Human Health and Disease",
    imageryBaseMapsEarthCover: "Imagery and Base Maps",
    inlandWaters: "Inland Water Resources",
    location: "Locations and Geodetic Networks",
    intelligenceMilitary: "Military",
    oceans: "Oceans and Estuaries",
    transportation: "Transportation Networks",
    utilitiesCommunication: "Utilities and Communication"
  },
  
  MI_ContextCode: {
    caption: "Context",
    acquisition: "Acquisition",
    pass: "Pass",
    wayPoint: "Waypoint"
  },
  
  MI_EnvironmentalRecord: {
    caption: "Environmental Conditions",
    averageAirTemperature: "Average Air Temperature",
    maxRelativeHumidity: "Maximum Relative Humidity",
    maxAltitude: "Maximum Altitude",
    meterologicalConditions: "Meterological Conditions"
  },
  
  MI_Event: {
    identifier: "Event Identifier",
    time: "Time",
    expectedObjectiveReference: "Expected Objective (Objective Identifer)",
    relatedSensorReference: "Related Sensor (Instrument Identifer)",
    relatedPassReference: "Related Pass (Platform Pass Identifer)"
  },

  MI_GeometryTypeCode: {
    point: "Point",
    linear: "Linear",
    areal: "Areal",
    strip: "Strip"
  },
  
  MI_Instrument: {
    citation: "Instrument Citation",
    identifier: "Instrument Identifier",
    sType: "Instrument Type",
    description: "Instrument Description",
    mountedOn: "Mounted On",
    mountedOnPlatformReference: "Mounted On (Platform Identifier)"
  },
  
  MI_Metadata: {
    acquisitionInformation: "Acquisition"
  },
  
  MI_Objective: {
    caption: "Objective",
    identifier: "Objective Identifier",
    priority: "Priority of Target",
    sFunction: "Function of Objective",
    extent: "Extent",
    pass: "Platform Pass",
    sensingInstrumentReference: "Sensing Instrument (Instrument Identifier)",
    objectiveOccurrence: "Events",
    sections: {
      identification: "Identification",
      extent: "Extent",
      pass: "Pass",
      sensingInstrument: "Sensing Instrument",
      objectiveOccurrence: "Events"
    }
  },
  
  MI_ObjectiveTypeCode: {
    caption: "Type (Collection Technique for Objective)",
    instantaneousCollection: "Instantaneous Collection",
    persistentView: "Persistent View",
    survey: "Survey"
  },
  
  MI_Operation: {
    caption: "Operation",
    description: "Operation Description",
    citation: "Operation Citation",
    identifier: "Operation Identifier",
    status: "Operation Status",
    objectiveReference: "Related Objective (Objective Identifier)",
    planReference: "Related Plan (Plan Identifier)",
    significantEventReference: "Related Event (Event Identifier)",
    platformReference: "Related Platform (Platform Identifier)",
    sections: {
      identification: "Identification",
      related: "Related"
    }
  },
  
  MI_OperationTypeCode: {
    caption: "Operation Type",
    real: "Real",
    simulated: "Simulated",
    synthesized: "Synthesized"
  },
  
  MI_Plan: {
    sType: "Sampling Geometry for Collecting Data",
    status: "Status of Plan",
    citation: "Citation of Authority Requesting Collection",
    satisfiedRequirementReference: "Satisfied Requirement (Requirement Identifier)",
    operationReference: "Related Operation (Operation Identifier)"
  },
  
  MI_Platform: {
    citation: "Platform Citation",
    identifier: "Platform Identifier",
    description: "Description of Platform Supporting the Instrument",
    sponsor: "Sponsor Organization for Platform",
    instrument: "Instrument(s) mounted on the platform",
    instrumentReference: "Instrument Identifier",
    sections: {
      identification: "Identification",
      sponsor: "Sponsor",
      instruments: "Instruments"
    }
  },
  
  MI_PlatformPass: {
    identifier: "Platform Pass Identifier",
    extent: "Platform Pass Extent",
    relatedEventReference: "Related Event (Event Identifer)"
  },

  MI_PriorityCode: {
    critical: "Critical", 
    highImportance: "High Importance",
    mediumImportance: "Medium Importance",
    lowImportance: "Low Importance"
  },
  
  MI_RequestedDate : {
    requestedDateOfCollection: "Requested Date Of Collection",
    latestAcceptableDate: "Latest Acceptable Date"
  },
  
  MI_Requirement: {
    caption: "Requirement",
    citation: "Citation for Requirement Guidance Material",
    identifier: "Requirement Identifier",
    requestor: "Requestor of Requirement",
    recipient: "Recipient of Requirement Results",
    priority: "Requirement Priority",
    requestedDate: "Requested Date",
    expiryDate: "Expiry Date",
    satisifiedPlanReference: "Satisfied Plan (Plan Identifier)",
    sections: {
      identification: "Identification",
      requestor: "Requestor",
      recipient: "Recipient",
      priorityAndDates: "Priority And Dates",
      satisifiedPlan: "Satisified  Plan"
    }
  },
  
  MI_SequenceCode: {
    caption: "Sequence",
    start: "Start",
    end: "End",
    instantaneous: "Instantaneous"
  },
  
  MI_TriggerCode: {
    caption: "Trigger",
    automatic: "Automatic",
    manual: "Manual",
    preProgrammed: "Preprogrammed"
  },
  
  ObjectReference: {
    uuidref: "UUID Reference",
    xlinkref: "URL Reference"
  },

  PT_FreeText: {
    locale: "Locale",
    textGroup: "Localized Strings"
  },

  PT_Locale: {
    language: "Language",
    country: "Country",
    characterEncoding: "Character Encoding"
  },
  
  RS_Identifier: {
    caption: "ID Plus Code Space",
    code: "Code",
    codeSpace: "Code Space"
  },
  
  SV_CouplingType: {
    loose: "Loose",
    mixed: "Mixed",
    tight: "Tight"
  },
  
  SV_OperationMetadata: {
    operationName: "Operation Name",
    DCP: "DCP",
    connectPoint: "Connect Point"
  },
  
  SV_ServiceIdentification: {
    serviceType: "ServiceType",
    couplingType: "Coupling Type",
    containsOperations: "Operation Metadata",
    operatesOn: "Operates On"
  },
  
  TM_Primitive: {
    indeterminatePosition: "Indeterminate Position",
    indeterminates: {
      before: "Before",
       after: "After",
      now: "Now",
      unknown: "Unknown"
    }
  },
  
  gemet: {
    concept: {
      gemetConceptKeyword: "GEMET Concept Keyword",
      tool: "Look Up...",
      dialogTitle: "GEMET - Concept Keyword",
      searchLabel: "Search:",
      searchTip: "Search GEMET"
    },
    theme: {
      tool: "Look Up...",
      dialogTitle: "GEMET - Inspire Data Theme"
    },
    ioerror: "There was an error communicating with the GEMET service: {url}",
    searching: "Searching GEMET...",
    noMatch: "No matching results were found.",
    languages: {
      "bg": "Bulgarian",
      "cs": "Czech",
      "da": "Danish",
      "nl": "Dutch",
      "en": "English",
      "et": "Estonian",
      "fi": "Finnish",
      "fr": "French",
      "de": "German",
      "el": "Greek",
      "hu": "Hungarian",
      "ga": "Gaelic (Irish)",
      "it": "Italian",
      "lv": "Latvian",
      "lt": "Lithuanian",
      "mt": "Maltese",
      "pl": "Polish", 
      "pt": "Portuguese",
      "ro": "Romanian",
      "sk": "Slovak",
      "sl": "Slovenian",    
      "es": "Spanish",
      "sv": "Swedish"
    }
  }

});