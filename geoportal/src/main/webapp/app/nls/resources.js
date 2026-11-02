/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define({
  root: {

    general: {
      cancel: "Cancel",
      clear: "Clear",
      close: "Close",
      confirm: "Confirm",
      del: "Delete",
      error: "Error",
      ok: "OK",
      open: "Open",
      settings: "Settings",
      deleting: "Deleting...",
      updating: "Updating...",
      uploading: "Uploading...",
      working: "...",
      incompatible: "Your Internet browser is no longer supported.<br>Please, use different browser.",
      configError: "Unable to load the application configuration.<br>Please check your network connection and reload the page.",
      loading: "Geoportal..."
    },

    nav: {
      brand: "Geoportal",
      home: "Home",
      search: "Search",
      catalog: "Catalog",
      map: "Map",
      api: "API",
      about: "About",
      admin: "Admin",
      content: "Content",
      welcomePattern: "{name}",
      signIn: "Sign In",
      signOut: "Sign Out",
      options: {
        createAccount: "Create Account",
        createMetadata: "Create Metadata",
        myProfile: "My Profile",
        uploadMetadata: "Upload Metadata",
        editFacet: "Edit Facet"
      }
    },

    login: {
      caption: "Sign In",
      label: "Sign In",
      username: "Username",
      password: "Password",
      keep: "Keep me signed in:",
      incomplete: "A Username and Password are required.",
      invalidCredentials: "Invalid credentials."
    },

    search: {
      criteria: {
        map: "Map",
        timePeriod: "Time Period",
        date: "Date",
        paleoDate: "Date (Paleo)",
        owner: "Owner",
        topicCategory: "Topic Category",
        metadataType: "Metadata Type",
        organizations: "Organizations",
        keywords: "Keywords",
        originType: "Origin Type",
        origin: "Source of Origin",
        approvalStatus: "Approval Status",
        access: "Access",
        accessGroups: "Access Groups",
        missingSource: "Editor/Upload",
        createFilter: "Create Filter",
        hierarchicalCategory: "Hierarchical Category",
        collections: "Collections"
      },
      componentSettings: {
        componentLabel: "Label",
        componentLabelPlaceholder: "",
        reset: "Reset"
      },
      searchBox: {
        search: "Search",
        searchCatalog: "Search the Catalog"
      },
      spatialFilter: {
        label: "Map",
        any: "Any",
        intersects: "Intersects",
        within: "Within",
        countPattern: "{count} centered here",
        settings: {
          caption: "Spatial Filter",
          aggregations: "Aggregations",
          field: "Shape Field",
          fieldPlaceholder: "",
          fieldNote: "(for search, e.g. envelope_geo, shape_geo, envelope_cen_pt)",
          pointField: "Point Field",
          pointFieldPlaceholder: "",
          pointFieldNote: "(for aggregation, e.g. envelope_cen_pt)"
        }
      },
      temporalFilter: {
        label: "Temporal",
        rangePattern: "{from}..{to}",
        countPattern: "{count} aggregated here",
        searchTip: "Search",
        searchLabel: "Search query:",
        fromLabel: "From:",
        toLabel: "To",
        calendarLabel: "Specify date range:",
        calendarTitle: "Enter Time Interval",
        interval: {
          year: "Year",
          quarter: "Quarter",
          month: "Month",
          week: "Week",
          day: "Day",
          hour: "Hour",
          minute: "Minute",
          second: "Second"
        },
        settings: {
          caption: "Temporal Filter",
          field: "Date Field",
          fieldPlaceholder: "",
          toField: "End Date Field",
          toFieldPlaceholder: "",
          mustOperator: "Within",
          nestedPath: "Nested Path",
          nestedPathPlaceholder: "",
          interval: "Interval",
          intervalPlaceholder: "",
          useUTC: "GMT"
        }
      },
      dateFilter: {
        label: "Date",
        labelTimePeriod: "Time Period",
        fromDate: "From:",
        toDate: "To:",
        formatHint: "(yyyy-mm-dd)",
        plotTip: "Plot",
        plot: {
          beginning: "Beginning Dates",
          ending: "Ending Dates",
          counts: "Item Count",
          noData: "No Data",
          rangePattern: "{from} .. {to}"
        }
      },
      numericFilter: {
        label: "Numeric",
        rangePattern: "{from}..{to}",
        countPattern: "{count} aggregated here",
        searchTip: "Search",
        searchLabel: "Search query:",
        interval: "Interval",
        rangeTip: "Specify desired numerical range",
        rangeLabel: "Specify range:",
        fromLabel: "From:",
        toLabel: "To:",
        applyLabel: "Apply",
        settings: {
          caption: "Numeric Filter",
          field: "Numeric Field",
          fieldPlaceholder: "",
          interval: "Interval",
          intervalPlaceholder: "number > 0",
          ticks: "Ticks",
          ticksPlaceholder: "integer > 0",
          places: "Decimal Places",
          placesPlaceholder: "integer > 0"
        }
      },
      appliedFilters: {
        label: "Filters",
        myContent: "My Content",
        clearFilter: "Clear",
        clearAll: "Clear All",
        tipPattern: "{type}: {value}"
      },
      results: {
        label: "Results",
        noMatch: "No results were found.",
        error: "An error occurred."
      },
      resultCount: {
        countPattern: "{count} {type}",
        itemSingular: "item",
        itemPlural: "items",
        userSingular: "user",
        userPlural: "users"
      },
      sort: {
        byRelevance: "By Relevance",
        byTitle: "By Title",
        byDate: "By Date",
        asc: "ASC",
        desc: "DESC",
      },
      paging: {
        first: "First",
        firstTip: "First",
        previous: "Previous",
        previousTip: "Previous",
        next: "Next",
        nextTip: "Next",
        last: "Last",
        lastTip: "Last",
        lastTipDisabled: "Result exceeds limit of ${searchLimit} records.",
        pagePattern: "{page}",
        countPattern: "{count} items"
      },
      termsAggregation: {
        settings: {
          caption: "Terms Aggregation",
          field: "Field",
          fieldPlaceholder: "",
          size: "Size",
          sizePlaceholder: "number > 0",
          minDocCount: "Minimum Count",
          minDocCountPlaceholder: "number > 0",
          include: "Include",
          includePlaceholder: "filter",
          exclude: "Exclude",
          excludePlaceholder: "filter",
          missing: "Missing",
          missingPlaceholder: "label",
          order: {
            label: "Order",
            placeholder: "",
            countAsc: "Count - ascending",
            countDesc: "Count - descending",
            termAsc: "Term - ascending",
            termDesc: "Term - descending",
          }
        }
      },
      preview: {
        error: "Error loading preview"
      },
      links: {
        web: "Web result",
        atom: "ATOM result",
        rss:  "RSS result",
        json: "JSON result",
        csv:  "CSV result",
        csw:  "CSW result",
        kml:  "KML result",
        dcat: "DCAT result",
		dcat3: "DCAT3 result",
        stac: "STAC result"
      }
    },

    item: {
      notAvailable: "N/A",
      actions: {
        html: "HTML",
        xml: "XML",
        json: "JSON",
        links: "Links",
        addToMap: "Add to Map",
        preview: "Preview",
        titleFormat: "${action} - ${title}",
        options: {
          caption: "Options",
          editMetadata: "Edit Metadata",
          editStacItem: "Edit in STAC Editor",
          uploadMetadata: "Upload Metadata"
        },
        urlLinks: {
          thumbnail: "Thumbnail",
          website: "Website",
          projectMetadata: "Project metadata",
          granule: "Granule",
          downloadHTTP: "Download (HTTP)",
          downloadFTP: "Download (FTP)"
        }
      },
      itemData: {
        title: "Item Details",
        attribute: "Attribute",
        value: "Value"
      },
      statusChecker: {
        unknown: "Unknown",
        status: "Service availability = ${score}%"
      },
      tooltips: {
        owner: "Owner",
        date: "Metadata date",
        permission: "Permission",
        keywords: "Keywords"
      }
    },

    content: {
      updateButton: "Update",
      applyTo: {
        itemLabel: "Apply change to this item only",
        ownerPattern: "Apply change to all items owned by: {name}",
        sourceUriPattern: "Apply change to all items harvested from: {name}",
        taskRefPattern: "Apply change to all items associated with harvesting task: {name}",
        queryPattern: "Apply change to all selected items: {count}",
        itemLabelDelete: "Delete this item only",
        ownerPatternDelete: "Delete all items owned by: {name}",
        sourceUriPatternDelete: "Delete all items harvested from: {name}",
        taskRefPatternDelete: "Delete all items associated with harvesting task: {name}",
        queryPatternDelete: "Delete all selected items: {count}"
      },
      changeOwner: {
        caption: "Change Owner",
        currentOwner: "Current Owner:",
        newOwner: "New Owner:"
      },
      deleteItems: {
        caption: "Delete",
      },
      setAccess: {
        caption: "Set Access",
        access: "Access",
        _public: "Public",
        _private: "Private",
        groups: "Share with Groups",
        countPattern: "{count} selected"
      },
      setApprovalStatus: {
        caption: "Set Approval Status",
        status: "Status",
        none: "None",
        approved: "Approved",
        reviewed: "Reviewed",
        disapproved: "Disapproved",
        incomplete: "Incomplete",
        posted: "Posted",
        draft: "Draft",
        active: "Active",
        inactive: "Inactive"
      },
      setCollections: {
        caption: "Set Collections",
        collections: "Collections"
      },
      setField: {
        caption: "Set Field",
        tags: {
          caption: "Tags",
          value: "User Tags (comma delimited)",
        },
        advanced: {
          caption: "Advanced",
          prompt: "",
          field: "Field Name",
          value: "Value",
        }
      },
      uploadMetadata: {
        caption: "Upload Metadata",
        button: "Upload"
      }
    },

    metadataEditor: {
      caption: "Metadata",
      loading: "Starting editor...",
      filePrompt: "Select an XML file.",
      asTemplatePrompt: "Reset identifiers",
      xmlViewOnly: "The type of metadata associated with this item is not supported by the editor."
    },

    errorTranslations: {
      "Unrecognized metadata type.": null,
      "Access denied - not owner.": null,
      "Schematron violation.": null,
      "Id not found.": null,
      "org.xml.sax.SAXParseException; lineNumber: 1; columnNumber: 1; Content is not allowed in prolog.": "Not an XML file.",
      "javax.json.stream.JsonParsingException: Invalid JSON": "Invalid JSON"
    },

    footer: {
      "copyright": "© Geoportal",
      "quickLink1": "Quick Link 1",
      "quickLink2": "Quick Link 2"
    },
	
    // Collections panel (STAC collections). {name} tokens are replaced via lang.replace
    collections: {
      title: "Collections",
      newLabel: "New",
      importLabel: "Import",
      deleteLabel: "Delete",
      searchPlaceholder: "Search...",
      collectionTab: "Collection",
      infoTitle: "Collection Info",
      viewItems: "View Items",
      zoom: "Zoom",
      exportLabel: "Export",
      update: "Update",
      createNewTitle: "Create New Collection",
      updateTitle: "Update Collection",
      createButton: "Create Collection",
      updateButton: "Update Collection",
      geometry: "Geometry:",
      cancel: "Cancel",
      loading: "Loading...",
      alertTitlePlaceholder: "Alert Title",
      alertMessagePlaceholder: "Alert Message",
      tools: {
        drawPolygon: "Draw polygon",
        drawCircle: "Draw circle",
        undo: "Undo",
        redo: "Redo",
        clearGeometry: "Clear geometry"
      },
      editor: {
        idLabel: "id",
        titleLabel: "title",
        descriptionLabel: "description",
        valuePlaceholder: "value...",
        assetKey: "Asset key",
        href: "href",
        wkt: "esri:wkt",
        removeAsset: "Remove Asset",
        addAsset: "Add Asset",
        assetKeyPlaceholder: "Unique Asset Key...",
        contacts: "Contacts",
        addContact: "Add Contact",
        removeContact: "Remove Contact",
        contactName: "Name",
        contactPosition: "Position",
        contactOrganization: "Organization",
        contactDescription: "Description",
        contactEmails: "Emails",
        emailPlaceholder: "email@example.com",
        rolesPlaceholder: "roles (comma separated, e.g. work)",
        addEmail: "Add Email",
        removeEmail: "Remove Email",
        stacVersionLabel: "stac_version",
        temporalStartLabel: "temporal start",
        temporalEndLabel: "temporal end",
        stacExtensionsLabel: "stac_extensions (Add commas to add multiple extensions)",
        stacExtensionsPlaceholder: "Extension schema URLs, separated by commas or new lines",
        stacCollectionLabel: "STAC collection",
        licenseLabel: "license",
        licensePlaceholder: "e.g. Apache-2.0",
        keywordsLabel: "keywords",
        keywordsPlaceholder: "comma separated, e.g. water, roads",
        summariesLabel: "summaries",
        summariesPlaceholder: "JSON object, e.g. {\"platform\": [\"landsat-8\"]}",
        providers: "Providers",
        addProvider: "Add Provider",
        removeProvider: "Remove Provider",
        providerName: "Name",
        providerDescription: "Description",
        providerRoles: "Roles",
        providerRolesPlaceholder: "licensor, producer, processor, host (comma separated)",
        providerUrl: "URL",
        properties: "Additional Properties",
        addProperty: "Add Property",
        removeProperty: "Remove Property",
        propertyKeyPlaceholder: "key",
        propertyValuePlaceholder: "value"
      },
      deleteModal: {
        title: "Delete Collection?",
        message: "Are you sure you would like to delete {count} collection(s)? This action is irreversible.\n{titles}",
        confirm: "Delete"
      },
      alerts: {
        deleteSuccessTitle: "Successfully deleted collections",
        deleteSuccessMessage: "Deleted: {deleted}.",
        deleteFailedSuffix: " Failed to delete: {failed}",
        deleteErrorTitle: "Error deleting collections",
        deleteError: "Error deleting: {id}",
        createSuccessTitle: "Successfully created collection",
        createSuccessMessage: "Created {id}",
        createErrorTitle: "Error creating collection",
        createError: "Error creating collection {id}",
        updateSuccessTitle: "Successfully updated collection",
        updateSuccessMessage: "Updating {id}",
        updateErrorTitle: "Error updating collection",
        updateError: "Unable to update collection {id}",
        exportSuccessTitle: "Successfully exported collection",
        exportSuccessMessage: "Exported {id}.json",
        exportErrorTitle: "Error exporting collection",
        exportRetrieveError: "Unable to retrieve collection {id}",
        invalidFileTypeTitle: "Invalid file type",
        invalidFileTypeMessage: "\"{name}\" is not a .json file. Please select a valid collection .json file.",
        readErrorTitle: "Error reading file",
        readErrorMessage: "Unable to read \"{name}\".",
        invalidJsonTitle: "Invalid JSON",
        invalidJsonMessage: "The selected file does not contain valid JSON.",
        invalidCollectionTitle: "Invalid Collection",
        invalidCollectionMessage: "The selected file does not appear to be a valid STAC collection (missing id).",
        duplicateTitle: "Duplicate Collection Id",
        duplicateMessage: "A collection with id \"{id}\" already exists. Please remove or rename it before importing.",
        importSuccessTitle: "Successfully imported collection",
        importSuccessMessage: "Imported {id}",
        importErrorTitle: "Error importing collection",
        importUnknownError: "Unknown error occurred while creating the collection.",
        invalidContactTitle: "Invalid Contact",
        invalidContactMessage: "Each contact requires a Name. Please fill in the missing contact name(s) before submitting.",
        invalidProviderTitle: "Invalid Provider",
        invalidProviderMessage: "Each provider requires a Name. Please fill in the missing provider name(s) before submitting.",
        invalidSummariesTitle: "Invalid Summaries",
        invalidSummariesMessage: "Summaries must be valid JSON (an object), e.g. {\"platform\": [\"landsat-8\"]}.",
        searchWidgetTooltip: "Find Address or Place",
        layersTooltip: "Map Layers",
        basemapTooltip: "Basemap"
      }
    },

    // Items of a collection (ItemListPanel / ItemEditorPanel)
    collectionItems: {
      placeholder: "Select a collection and click \"View Items\" to see its items here.",
      title: "Items",
      addItem: "Add Item",
      importItem: "Import Item",
      exportItem: "Export",
      importFailed: "Import failed: {error}",
      importResult: "Imported {ok} item(s), {failed} failed.",
      importSuccess: "Imported {ok} item(s) successfully.",
      closeTitle: "Close items view",
      searchPlaceholder: "Search items...",
      countPattern: "{count} Items",
      filterByExtent: "Filter by extent",
      pageSize: "Page size:",
      prev: "\u2190 Prev",
      next: "Next \u2192",
      pagePattern: "Page {page}",
      loadError: "Unable to load items.",
      noItems: "No items found for this collection.",
      zoom: "Zoom",
      edit: "Edit",
      del: "Delete",
      deleteModal: {
        title: "Delete Item?",
        message: "Are you sure you would like to delete item \"{id}\"? This action is irreversible.",
        confirm: "Delete"
      },
      deleteFailed: "Unable to delete item \"{id}\".",
      popup: {
        assets: "Assets",
        noAssets: "No assets available"
      },
      layerTitleCount: "{collection} ({count} items)",
      layerTitleCountType: "{collection} - {type}s ({count} items)",
      editor: {
        addTitle: "Add Item",
        editTitle: "Edit Item",
        save: "Save",
        cancel: "Cancel",
        del: "Delete",
        id: "Id",
        idPlaceholder: "unique item id...",
        datetime: "Datetime",
        datetimePlaceholder: "e.g. 2024-01-01T00:00:00Z",
        stacVersion: "STAC Version",
        stacVersionPlaceholder: "e.g. 1.0.0",
        stacExtensions: "STAC Extensions",
        stacExtensionsPlaceholder: "Comma or newline separated extension schema URLs",
        geometry: "Geometry:",
        drawPoint: "Draw point",
        selectGeometry: "Select geometry",
        drawMultipoint: "Draw multipoint",
        drawLine: "Draw line",
        drawMultiline: "Draw multiline (add another line to the existing one)",
        drawPolygon: "Draw polygon",
        drawCircle: "Draw circle",
        clearGeometry: "Clear geometry",
        assets: "Assets:",
        assetKeyPlaceholder: "unique asset key...",
        addAsset: "Add Asset",
        assetTitlePlaceholder: "title",
        assetHrefPlaceholder: "href (url or path)",
        assetTypePlaceholder: "type (media type, e.g. application/vnd.las)",
        assetDescriptionPlaceholder: "description",
        assetRolesPlaceholder: "roles (comma separated, e.g. data, thumbnail)",
        remove: "Remove",
        additionalProperties: "Additional Properties:",
        addProperty: "Add Property",
        addCollectionProperties: "Add Collection Properties",
        collectionPropertiesFailed: "Unable to load the collection properties.",
        keyPlaceholder: "key",
        valuePlaceholder: "value",
        mapNotReady: "The map is not ready yet. Please try again.",
        assetKeyRequired: "Please enter a unique asset key.",
        assetKeyDuplicate: "An asset with key \"{key}\" already exists.",
        stacUrlError: "Unable to determine STAC service URL.",
        saveFailed: "Unable to save item.",
        saveFailedWith: "Unable to save item: {error}",
        deleteFailed: "Unable to delete item.",
        deleteFailedWith: "Unable to delete item: {error}",
        idRequired: "Id is required.",
        datetimeRequired: "Datetime is required.",
        stacVersionRequired: "STAC Version is required.",
        stacExtensionsRequired: "STAC Extensions is required.",
        geometryRequired: "Geometry is required. Draw a point, line or polygon on the map before saving.",
        deleteModal: {
          title: "Delete Item?",
          message: "Are you sure you would like to delete item \"{id}\"? This action is irreversible.",
          confirm: "Delete"
        }
      }
    },

	mapViewer:{
		toggleView3d:"3D",
		toggleView2d:"2D",
		layerListRemove:"Remove",
		layerListFullExtent:"Full Extent"
       
	}
	
  }
});
