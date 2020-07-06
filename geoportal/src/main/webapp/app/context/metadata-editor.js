define([],function(){var obj={
// .......................................................................................
  
  editable: {
    // Warning: The editor will be lossy if allowNonGxeDocs is enabled.
    allowNonGxeDocs: false, 
    geoportalTypes: ["arcgis", "fgdc", "iso19115", "iso19115-2"]
  },
  
  gxeContext: {
    allowedTypeKeys: [
      "arcgis", "fgdc", 
      "iso-19115", "iso-19119", "iso-19115-2",
      "inspire2-iso-19119", "inspire2-iso-19115",  
      "gemini-iso-19115", "gemini-iso-19119"
    ],
    basemap: "hybrid",
    allowViewXml: true,
    showValidateButton: false,
    validateOnSave: true,
    startupTypeKey: null
  },

  typeDefinitions: [
    {
      key: "arcgis",
      requiredPath: "esri/dijit/metadata/types/arcgis/base/DocumentType",
      interrogationRules: [{
         path: "/metadata/Esri/ArcGISFormat",
         must: true
      }]
    },
    {
      key: "fgdc",
      requiredPath: "esri/dijit/metadata/types/fgdc/base/DocumentType",
      interrogationRules: [{
         path: "/metadata/idinfo/citation",
         must: true
      }]
    },
    {
      key: "inspire2-iso-19115",
      requiredPath: "app/gxe/types/inspire2/base/DataDocumentType",
      interrogationRules: [
        {
          path: "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification",
          must: true
        },
        {
          path: "/gmd:MD_Metadata/gmd:metadataStandardName/gco:CharacterString",
          value: "INSPIRE Metadata Implementing Rules"
        },
        {
          path: "/gmd:MD_Metadata/gmd:metadataStandardVersion/gco:CharacterString",
          value: "Technical Guidelines based on EN ISO 19115 and EN ISO 19119 (Version 2.0)"
        }
      ]
    },
    {
      key: "inspire2-iso-19119",
      requiredPath: "app/gxe/types/inspire2/base/ServiceDocumentType",
      interrogationRules: [
        {
          path: "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification",
          must: true
        },
        {
          path: "/gmd:MD_Metadata/gmd:metadataStandardName/gco:CharacterString",
          value: "INSPIRE Metadata Implementing Rules"
        },
        {
          path: "/gmd:MD_Metadata/gmd:metadataStandardVersion/gco:CharacterString",
          value: "Technical Guidelines based on EN ISO 19115 and EN ISO 19119 (Version 2.0)"
        }
      ]
    },
    {
      key: "iso-19115",
      requiredPath: "esri/dijit/metadata/types/iso/base/DataDocumentType",
      interrogationRules: [{
         path: "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification",
         must: true
      }]
    },
    {
      key: "iso-19119",
      requiredPath: "esri/dijit/metadata/types/iso/base/ServiceDocumentType",
      interrogationRules: [{
         path: "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification",
         must: true
      }]
    },
    {
      key: "iso-19115-2",
      requiredPath: "esri/dijit/metadata/types/iso/base/GmiDocumentType",
      interrogationRules: [{
         path: "/gmi:MI_Metadata",
         must: true
      }]
    },
    {
      key: "gemini-iso-19115",
      requiredPath: "esri/dijit/metadata/types/gemini/base/DataDocumentType",
      interrogationRules: [
        {
          path: "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification",
          must: true
        },
        {
          path: "/gmd:MD_Metadata/gmd:metadataStandardName/gco:CharacterString",
          value: "UK GEMINI"
        },
        {
          path: "/gmd:MD_Metadata/gmd:metadataStandardVersion/gco:CharacterString",
          value: "2.2"
        }
      ]
    },
    {
      key: "gemini-iso-19119",
      requiredPath: "esri/dijit/metadata/types/gemini/base/ServiceDocumentType",
      interrogationRules: [
        {
          path: "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification",
          must: true
        },
        {
          path: "/gmd:MD_Metadata/gmd:metadataStandardName/gco:CharacterString",
          value: "UK GEMINI"
        },
        {
          path: "/gmd:MD_Metadata/gmd:metadataStandardVersion/gco:CharacterString",
          value: "2.2"
        }
      ]
    }   

  ]
  
// .......................................................................................
};return obj;});