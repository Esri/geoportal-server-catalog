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
    reference: "參考"
  },
  
  sections: {
    metadata: "中繼資料",
    identification: "身份識別",
    distribution: "分佈",
    quality: "品質",
    acquisition: "收購",
    resourceConstraints:"資源限制",
    resourceLineage:"資源譜系"
  },
  
  metadataSection: {
    identifier: "識別碼",
    contact: "連絡人",
    date: "日期",
    standard: "標準",
    reference: "參考"
  },
  
  identificationSection: {
    citation: "引用資訊",
    description: "描述",
    contact: "連絡人",
    thumbnail: "縮略圖",
    keywords: "關鍵字",
    constraints: "約束",
    resource: "資源",
    resourceTab: {
      representation: "製圖表達",
      language: "語言",
      classification: "分類",
      extent: "範圍"
    },
    serviceResourceTab: {
      serviceType: "服務類型",
      extent: "範圍",
      couplingType: "耦合類型",
      operation: "操作",
      operatesOn: "運行於"
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
    scope: "範圍",
    conformance: "一致性",
    lineage: "譜系"
  },
  
  acquisitionSection: {
    requirement: "要求",
    objective: "目標",
    instrument: "儀器",
    plan: "測量圖",
    operation: "操作",
    platform: "平台",
    environment: "環境"
  },
  
  MD_Identification: {
    abstract: "摘要",
    purpose: "用途",
    credit: "製作者名單",
    pointOfContact: "聯絡點",
    resourceMaintenance: "維護",
    graphicOverview: "圖形總覽",
    descriptiveKeywords: "關鍵字採集",
    resourceConstraints: "約束"
  },
  
  CI_Address: {
    deliveryPoint: "投遞點",
    city: "城市",
    administrativeArea: "行政區",
    postalCode: "郵遞區號",
    country: "國家/地區",
    electronicMailAddress: "電子郵件位址"
  },
  
  CI_Citation: {
    title: "標題",
    alternateTitle: "其他標題",
    date: "Date",
    edition: "Edition",
    editionDate: "Edition Date",
    identifier: "唯一資源識別碼",
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
    phone: "電話",
    address: "地址",
    onlineResource: "線上資源",
    hoursOfService: "服務時間",
    contactInstructions: "聯絡說明"
  },
  
  CI_Date: {
    date: "日期",
    dateType: "日期類型"
  },
  
  CI_DateTypeCode: {
    caption: "日期類型",
    creation: "建立日期",
    publication: "發佈日期",
    revision: "修訂日期",
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
    download: "下載",
    information: "資訊",
    offlineAccess: "離線存取",
    order: "順序",
    search: "搜尋",
    completeMetadata: "Complete Metadata",
    browseGraphic: "Browse Graphic",
    upload: "Upload",
    emailService: "Email Service",
    browsing: "Browsing",
    fileAccess: "File Access"
  },
  
  CI_OnlineResource: {
    linkage: "URL",
    protocol: "通訊協定",
    applicationProfile: "應用程式設定檔",
    name: "名稱",
    description: "描述",
    function: "函數",
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
    documentDigital: "文檔數字",
    documentHardcopy: "文件硬拷貝",
    imageDigital: "圖像數字",
    imageHardcopy: "圖像硬拷貝",
    mapDigital: "地圖數字",
    mapHardcopy: "地圖硬拷貝",
    modelDigital: "模型數字",
    modelHardcopy: "模型硬拷貝",
    profileDigital: "個人資料數字",
    profileHardcopy: "個人資料硬拷貝",
    tableDigital: "表數字",
    tableHardcopy: "表格硬拷貝",
    videoDigital: "視頻數字",
    videoHardcopy: "視頻硬拷貝",
    audioDigital: "音頻數字",
    audioHardcopy: "音頻硬拷貝",
    multimediaDigital: "多媒體數字",
    multimediaHardcopy: "多媒體硬拷貝",
    physicalObject: "物理對象",
    diagramDigital: "圖數字",
    diagramHardcopy: "圖表硬拷貝"
  },

  CI_ResponsibleParty: {
    caption: "聯絡點",
    individualName: "個人姓名",
    organisationName: "組織名稱",
    positionName: "職位名稱",
    contactInfo: "連絡人資訊",
    role: "角色"
  },
  
  CI_Responsibility: {
    role: "Role",
    extent: "Extent",
    party: "Party"
  },

  CI_RoleCode: {
    resourceProvider: "資源提供者",
    custodian: "監管人",
    owner: "擁有者",
    user: "使用者",
    distributor: "經銷商",
    originator: "創作者",
    pointOfContact: "聯絡點",
    principalInvestigator: "首席調查員",
    processor: "處理器",
    publisher: "發佈者",
    author: "作者",
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
    voice: "語音",
    facsimile: "傳真"
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
    caption: "一致性結果",
    explanation: "說明",
    degree: {
      caption: "度",
      validationPerformed: "已執行驗證",
      conformant: "一致",
      nonConformant: "不一致"
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
    level: "範圍(適用於品質資訊)",
    levelDescription: "級別描述"
  },
  
  EX_Extent: {
    caption: "範圍",
    description: "描述",
    geographicElement: "空間範圍",
    temporalElement: "時態範圍",
    verticalElement: "垂直範圍"
  },
  
  EX_GeographicBoundingBox: {
    westBoundLongitude: "西部邊界經度",
    eastBoundLongitude: "東部邊界經度",
    southBoundLatitude: "南部邊界緯度",
    northBoundLatitude: "北部邊界緯度"
  },
  
  EX_GeographicDescription: {
    caption: "地理描述"
  },
  
  EX_TemporalExtent: {
    TimePeriod: {
      beginPosition: "開始日期",
      endPosition: "結束日期"
    }
  },
  
  EX_VerticalExtent: {
    minimumValue: "最小值",
    maximumValue: "最大值",
    verticalCRS: "垂直 CRS",
    verticalCRSId: "Vertical CRS ID"
  },
  
  Length: {
    caption: "長度",
    uom: "測量單位",
    km: "公里",
    m: "公尺",
    mi: "英里",
    ft: "英呎"
  },
  
  LI_Lineage: {
    caption: "譜系",
    statement: "譜系說明",
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
  FC_PropertyType: {
    memberName: "Member Name",
    definition: "Definition",
    cardinality: "Cardinality",
    featureType: "Feature Type",
    constrainedBy: "Constrained By",
    definitionReference: "Definition Reference"
  },
  FC_Constraint: {
    description: "Description"
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
    fileName: "瀏覽圖形 URL",
    fileDescription: "瀏覽圖形標題",
    fileType: "瀏覽圖形類型"
  },
  
  MD_ClassificationCode: {
    unclassified: "未分類",
    restricted: "受限",
    confidential: "機密",
    secret: "機密",
    topSecret: "絕對機密",
    sensitiveButUnclassified:"Sensitive but Unclassified",
    forOfficialUseOnly: "for Offical Use Only",
    protected: "Protected",
    limitedDistribution:"Limited Distribution"
  },
  
  MD_Constraints: {
    caption: "使用約束",
    useLimitation: "使用限制",
    reference: "Reference",
    handlingDescription: "Handling Description",
    classificatoinSystem: "Classification System",
    userNote: "User Note",
    otherConstraints: "Other Constraints",
    constraintApplicationScope: "Application Scope"
  },
  
  MD_DataIdentification: {
    caption: "Data Identification",
    spatialRepresentationType: "空間表示類型",
    spatialResolution: "空間解析度",
    language: "資源語言",
    supplementalInformation: "補充",
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
    distributionFormat: "分發格式",
    transferOptions: "傳輸選項",
    description: "Description",
    distributor: "Distributor"
  },
  
  MD_Format: {
    name: "格式名稱",
    version: "格式版本",
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
    delimitedCaption: "關鍵字",
    thesaurusName: "關聯同義字"
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
    caption: "法律限制",
    accessConstraints: "存取限制",
    useConstraints: "使用限制",
    otherConstraints: "其他限制"
  },
  
  MD_MaintenanceFrequencyCode: {
    caption: "頻率",
    continual: "持續",
    daily: "每天",
    weekly: "每週",
    fortnightly: "每兩週",
    monthly: "每月",
    quarterly: "季度",
    biannually: "一年兩次",
    annually: "每年",
    asNeeded: "根據需要",
    irregular: "不定期",
    notPlanned: "未計劃",
    unknown: "未知"
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
    caption: "中繼資料",
    metadataIdentifier: "中繼資料識別碼",
    defaultLocale: "默認語言環境",
    parentMetadata: "父元資料",
    contact: "中繼資料聯繫人",
    dateInfo: "日期信息",
    metadataStandard: "中繼資料標準",
    metadataProfile: "中繼資料配置文件",
    fileIdentifier: "文件識別碼",
    alternativeMetadataReference: "替代中繼資料參考",
    otherLocale: "其他語言環境",
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

    language: "中繼資料語言",
    hierarchyLevel: "等級分級",
    hierarchyLevelName: "等級分級名稱",
    dateStamp: "中繼資料日期",
    referenceSystemInfo: "參考系統"
  },
  
  MD_ProgressCode: {
    caption: "進度代碼",
    completed: "已完成",
    historicalArchive: "歷史封存",
    obsolete: "廢棄",
    onGoing: "正在進行",
    planned: "已計劃",
    required: "必選項",
    underDevelopment: "開發中"
  },
  
  MD_RepresentativeFraction: {
    denominator: "分母"
  },
  
  MD_Resolution: {
    equivalentScale: "等量比例",
    distance: "距離"
  },
  
  MD_Releasability: {
    caption: "Releasability",
    addressee: "Addressee",
    statement: "Statement",
    disseminationConstraints: "Dissemination Constraints"
 },
 
  MD_RestrictionCode: {
    copyright: "版權",
    patent: "專利",
    patentPending: "專利申請中",
    trademark: "商標",
    license: "授權",
    intellectualPropertyRights: "智慧財產權",
    restricted: "受限",
    otherRestrictions: "其他限制",
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
    attribute: "屬性",
    attributeType: "屬性類型",
    collectionHardware: "採集硬體",
    collectionSession: "採集工作階段",
    dataset: "資料集",
    series: "數列",
    nonGeographicDataset: "非地理資料集",
    dimensionGroup: "尺寸群組",
    feature: "圖徵",
    featureType: "圖徵類型",
    propertyType: "屬性類型",
    fieldSession: "欄位工作階段",
    software: "軟體",
    service: "服務",
    model: "模型",
    tile: "圖磚",
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
    attributes: "屬性",
    features: "圖徵",
    featureInstances: "圖徵執行個體",
    attributeInstances: "屬性執行個體",
    dataset: "資料集",
    other: "其他"
  },
  
  MD_SecurityConstraints: {
    caption: "安全限制",
    classification: "分類",
    userNote: "使用者注意事項",
    classificationSystem: "分類系統",
    handlingDescription: "處理描述"
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
    caption: "空間表示類型",
    vector: "矢量",
    grid: "網格",
    textTable: "文字表格",
    tin: "TIN",
    stereoModel: "立體模型",
    video: "影片"
  },
  
  MD_TopicCategoryCode: {
    caption: "主題類別",
    boundaries: "行政管理邊界",
    farming: "農業與農事",
    climatologyMeteorologyAtmosphere: "大氣與氣候",
    biota: "生物學與生態學",
    economy: "商業與經濟",
    planningCadastre: "地籍l",
    society: "文化、社會與人口統計",
    elevation: "高程與衍生產品",
    environment: "環境與資源保護",
    structure: "設施點與建築",
    geoscientificInformation: "地質與地球物理學",
    health: "人類健康與疾病",
    imageryBaseMapsEarthCover: "影像與底圖",
    inlandWaters: "內陸水資源",
    location: "位置與大地網路",
    intelligenceMilitary: "軍事",
    oceans: "海洋與海灣",
    transportation: "交通網路",
    utilitiesCommunication: "公用事業和通訊"
  },
  
  MI_ContextCode: {
    caption: "路徑位置",
    acquisition: "收購",
    pass: "傳遞",
    wayPoint: "航點"
  },
  
  MI_EnvironmentalRecord: {
    caption: "環境條件",
    averageAirTemperature: "平均氣溫",
    maxRelativeHumidity: "最高相對濕度",
    maxAltitude: "最高海拔",
    meterologicalConditions: "氣象條件"
  },
  
  MI_Event: {
    identifier: "事件識別碼",
    time: "時間",
    expectedObjectiveReference: "預期目標(目標識別碼)",
    relatedSensorReference: "相關感應器(儀器識別碼)",
    relatedPassReference: "相關傳遞(平台傳遞識別碼)"
  },

  MI_GeometryTypeCode: {
    point: "點",
    linear: "線性函數",
    areal: "面積",
    strip: "帶狀"
  },
  
  MI_Instrument: {
    citation: "儀器引用",
    identifier: "儀器識別碼",
    sType: "儀器類型",
    description: "儀器描述",
    mountedOn: "安裝於",
    mountedOnPlatformReference: "安裝於(平台識別碼)"
  },
  
  MI_Metadata: {
    acquisitionInformation: "收購"
  },
  
  MI_Objective: {
    caption: "目標",
    identifier: "目標識別碼",
    priority: "目標優先級",
    sFunction: "目標函數",
    extent: "範圍",
    pass: "平台傳遞",
    sensingInstrumentReference: "感測儀器(儀器識別碼)",
    objectiveOccurrence: "事件",
    sections: {
      identification: "身份識別",
      extent: "範圍",
      pass: "傳遞",
      sensingInstrument: "感測儀器",
      objectiveOccurrence: "事件"
    }
  },
  
  MI_ObjectiveTypeCode: {
    caption: "類型(目標的採集方法)",
    instantaneousCollection: "瞬間採集",
    persistentView: "持續的視圖",
    survey: "測量"
  },
  
  MI_Operation: {
    caption: "操作",
    description: "操作描述",
    citation: "操作引用",
    identifier: "操作識別碼",
    status: "操作狀態",
    objectiveReference: "相關目標(目標識別碼)",
    planReference: "相關計劃(計劃識別碼)",
    significantEventReference: "相關事件(事件識別碼)",
    platformReference: "相關平台(平台識別碼)",
    sections: {
      identification: "身份識別",
      related: "關聯"
    }
  },
  
  MI_OperationTypeCode: {
    caption: "操作類型",
    real: "真實",
    simulated: "模擬的",
    synthesized: "合成"
  },
  
  MI_Plan: {
    sType: "用於採集資料的採樣幾何",
    status: "計畫狀態",
    citation: "負責方採集請求的引用",
    satisfiedRequirementReference: "滿足的要求(要求識別碼)",
    operationReference: "相關操作(操作識別碼)"
  },
  
  MI_Platform: {
    citation: "平台引用",
    identifier: "平台識別碼",
    description: "支持儀器的平台描述",
    sponsor: "平台的贊助組織",
    instrument: "安裝在平台上的儀器",
    instrumentReference: "儀器識別碼",
    sections: {
      identification: "身份識別",
      sponsor: "贊助商",
      instruments: "儀器"
    }
  },
  
  MI_PlatformPass: {
    identifier: "平台傳遞識別碼",
    extent: "平台傳遞範圍",
    relatedEventReference: "相關事件(事件識別碼)"
  },

  MI_PriorityCode: {
    critical: "重要", 
    highImportance: "重要性 - 高",
    mediumImportance: "重要性 - 中",
    lowImportance: "重要性 - 低"
  },
  
  MI_RequestedDate : {
    requestedDateOfCollection: "採集申請日期",
    latestAcceptableDate: "最近可接受日期"
  },
  
  MI_Requirement: {
    caption: "要求",
    citation: "對要求指導材料的引用",
    identifier: "要求識別碼",
    requestor: "要求的申請者",
    recipient: "要求結果的接收者",
    priority: "要求優先級",
    requestedDate: "申請日期",
    expiryDate: "到期日",
    satisifiedPlanReference: "滿足的計劃(計劃識別碼)",
    sections: {
      identification: "身份識別",
      requestor: "申請者",
      recipient: "接收者",
      priorityAndDates: "優先級和日期",
      satisifiedPlan: "滿足的計劃"
    }
  },
  
  MI_SequenceCode: {
    caption: "順序",
    start: "開始",
    end: "結束",
    instantaneous: "瞬間"
  },
  
  MI_TriggerCode: {
    caption: "觸發",
    automatic: "自動",
    manual: "手動",
    preProgrammed: "預寫程式"
  },
  
  ObjectReference: {
    uuidref: "UUID 參考",
    xlinkref: "URL 參考"
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
    caption: "ID Plus 代碼空間",
    code: "代碼",
    codeSpace: "代碼空間"
  },
  
  SV_CouplingType: {
    loose: "鬆散",
    mixed: "混合",
    tight: "緊密"
  },
  
  SV_OperationMetadata: {
    operationName: "操作名稱",
    DCP: "DCP",
    connectPoint: "連線點"
  },
  
  SV_ServiceIdentification: {
    serviceType: "服務類型",
    couplingType: "耦合類型",
    containsOperations: "操作中繼資料",
    operatesOn: "運行於"
  },
  
  TM_Primitive: {
    indeterminatePosition: "不定向位置",
    indeterminates: {
      before: "之前",
       after: "之後",
      now: "目前時間",
      unknown: "未知"
    }
  },
  
  gemet: {
    concept: {
      gemetConceptKeyword: "GEMET 概念關鍵字",
      tool: "正在查找...",
      dialogTitle: "GEMET - 概念關鍵字",
      searchLabel: "搜尋:",
      searchTip: "搜尋 GEMET"
    },
    theme: {
      tool: "正在查找...",
      dialogTitle: "GEMET - Inspire 主題資料"
    },
    ioerror: "與 GEMET 服務通訊時出錯: {url}",
    searching: "正在搜尋 GEMET...",
    noMatch: "未找到相符的結果。",
    languages: {
      bg: "保加利亞語",
      cs: "捷克語",
      da: "丹麥語",
      nl: "荷蘭語",
      en: "英語",
      et: "愛沙尼亞語",
      fi: "芬蘭語",
      fr: "法語",
      de: "德語",
      el: "希臘語",
      hu: "匈牙利語",
      ga: "蓋爾語(愛爾蘭語)",
      it: "義大利語",
      lv: "拉脫維亞語",
      lt: "立陶宛語",
      mt: "馬爾他語",
      pl: "波蘭語",
      pt: "葡萄牙語",
      ro: "羅馬尼亞語",
      sk: "斯洛伐克語",
      sl: "斯洛凡尼亞語",
      es: "西班牙語",
      sv: "瑞典語"
    }
  }

});