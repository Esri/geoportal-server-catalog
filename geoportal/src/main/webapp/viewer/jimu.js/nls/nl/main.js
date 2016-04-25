define(
   ({
    common: {
      ok: "OK",
      cancel: "Annuleren",
      next: "Volgende",
      back: "Vorige"
    },
    errorCode: "Code",
    errorMessage: "Bericht",
    errorDetail: "Detail",
    widgetPlaceholderTooltip: "Om dit in te stellen, gaat u naar Widgets en klikt u op de overeenkomende tijdelijke aanduiding",
    symbolChooser: {
      preview: "Voorbeeld",
      basic: "Eenvoudig",
      arrows: "Pijlen",
      business: "Economie",
      cartographic: "Cartografisch",
      nationalParkService: "National Park Service",
      outdoorRecreation: "Recreatie in openlucht",
      peoplePlaces: "Openbare plaatsen",
      safetyHealth: "Veiligheid en gezondheid",
      shapes: "Vormen",
      transportation: "Vervoer",
      symbolSize: "Symboolgrootte",
      color: "Kleur",
      alpha: "Alpha",
      outlineColor: "Kleur omtreklijn",
      outlineWidth: "Breedte omtreklijn",
      style: "Stijl",
      width: "Breedte",
      text: "Tekst",
      fontColor: "Tekstkleur",
      fontSize: "Tekengrootte",
      transparency: "Transparant",
      solid: "Ononderbroken",
      dash: "Streep",
      dot: "Punt",
      dashDot: "Streep punt",
      dashDotDot: "Streep punt punt"
    },
    transparency: {
      opaque: "Niet transparant",
      transparent: "Transparant"
    },
    rendererChooser: {
      domain: "Domein",
      use: "Gebruiken",
      singleSymbol: "Eén symbool",
      uniqueSymbol: "Unieke symbolen",
      color: "Kleur",
      size: "Grootte",
      toShow: "Om weer te geven",
      colors: "Kleuren",
      classes: "Klassen",
      symbolSize: "Symboolgrootte",
      addValue: "Waarde toevoegen",
      setDefaultSymbol: "Standaardsymbool instellen",
      defaultSymbol: "Standaard symbool",
      selectedSymbol: "Geselecteerd symbool",
      value: "Waarde",
      label: "Label",
      range: "Bereik"
    },
    drawBox: {
      point: "Punt",
      line: "Lijn",
      polyline: "Polylijn",
      freehandPolyline: "Polylijn in vrije stijl",
      triangle: "Driehoek",
      extent: "Extent",
      circle: "Cirkel",
      ellipse: "Ellips",
      polygon: "Polygoon",
      freehandPolygon: "Vlak in vrije stijl",
      text: "Tekst",
      clear: "Wissen"
    },
    popupConfig: {
      title: "Titel",
      add: "Toevoegen",
      fields: "Velden",
      noField: "Geen veld",
      visibility: "Zichtbaar",
      name: "Naam",
      alias: "Alias",
      actions: "Acties"
    },
    includeButton: {
      include: "Opnemen"
    },
    loadingShelter: {
      loading: "Laden"
    },
    basicServiceBrowser: {
      noServicesFound: "Er zijn geen services gevonden.",
      unableConnectTo: "Kan geen verbinding maken met",
      invalidUrlTip: "De URL die u hebt ingevoerd, is ongeldig of ontoegankelijk."
    },
    serviceBrowser: {
      noGpFound: "Er zijn geen geoprocessingservices gevonden.",
      unableConnectTo: "Kan geen verbinding maken met"
    },
    layerServiceBrowser: {
      noServicesFound: "Er zijn geen mapservices of featureservices gevonden",
      unableConnectTo: "Kan geen verbinding maken met"
    },
    basicServiceChooser: {
      validate: "Valideren",
      example: "Voorbeeld",
      set: "Instellen"
    },
    urlInput: {
      invalidUrl: "Ongeldige URL."
    },
    urlComboBox: {
      invalidUrl: "Ongeldige URL."
    },
    filterBuilder: {
      addAnotherExpression: "Een filterexpressie toevoegen",
      addSet: "Een expressieset toevoegen",
      matchMsg: "Objecten in de kaartlaag ophalen die overeenkomen met ${any_or_all} van de volgende expressies",
      matchMsgSet: "${any_or_all} van de volgende expressies in deze set zijn waar",
      all: "Alle",
      any: "Eén",
      value: "Waarde",
      field: "Veld",
      unique: "Uniek",
      none: "Geen",
      and: "en",
      valueTooltip: "Waarde invoeren",
      fieldTooltip: "Keuze maken uit bestaand veld",
      uniqueValueTooltip: "Keuze maken uit unieke waarden in geselecteerd veld",
      stringOperatorIs: "is", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "is niet",
      stringOperatorStartsWith: "begint met",
      stringOperatorEndsWith: "eindigt met",
      stringOperatorContains: "bevat",
      stringOperatorDoesNotContain: "bevat niet",
      stringOperatorIsBlank: "is leeg",
      stringOperatorIsNotBlank: "is niet leeg",
      dateOperatorIsOn: "is op", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "is niet op",
      dateOperatorIsBefore: "is voor",
      dateOperatorIsAfter: "is na",
      dateOperatorDays: "dagen",
      dateOperatorWeeks: "weken", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "maanden",
      dateOperatorInTheLast: "in de afgelopen",
      dateOperatorNotInTheLast: "niet in de afgelopen",
      dateOperatorIsBetween: "is tussen",
      dateOperatorIsNotBetween: "is niet tussen",
      dateOperatorIsBlank: "is leeg",
      dateOperatorIsNotBlank: "is niet leeg",
      numberOperatorIs: "is", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "is niet",
      numberOperatorIsAtLeast: "is minimaal",
      numberOperatorIsLessThan: "is minder dan",
      numberOperatorIsAtMost: "is maximaal",
      numberOperatorIsGreaterThan: "is meer dan",
      numberOperatorIsBetween: "is tussen",
      numberOperatorIsNotBetween: "is niet tussen",
      numberOperatorIsBlank: "is leeg",
      numberOperatorIsNotBlank: "is niet leeg",
      string: "Tekenreeks",
      number: "Nummer",
      date: "Datum",
      askForValues: "Vragen om waarden",
      prompt: "Prompt",
      hint: "Tip",
      error: {
        invalidParams: "Ongeldige parameters.",
        invalidUrl: "Ongeldige URL.",
        noFilterFields: "De kaartlaag heeft geen velden die kunnen worden gebruikt om te filteren.",
        invalidSQL: "Ongeldige SQL-expressie.",
        cantParseSQL: "Kan de SQL-expressie niet parseren."
      },
      caseSensitive: "Hoofdletter gevoelig",
      notSupportCaseSensitiveTip: "Hosted services ondersteunen geen hoofdlettergevoelige query."
    },

    featureLayerSource: {
      layer: "Kaartlaag",
      browse: "Bladeren",
      selectFromMap: "Selecteren in kaart",
      selectFromPortal: "Toevoegen vanuit Portal for ArcGIS",
      addServiceUrl: "Service-URL toevoegen",
      inputLayerUrl: "URL van invoerlaag",
      selectLayer: "Selecteer een objectlaag in de huidige kaart.",
      chooseItem: "Kies een objectlaagitem.",
      setServiceUrl: "Voer de URL van de featureservice of mapservice in.",
      selectFromOnline: "Toevoegen vanuit ArcGIS Online",
      chooseLayer: "Kies een objectlaag."
    },
    queryableLayerSource: {
      layer: "Kaartlaag",
      browse: "Bladeren",
      selectFromMap: "Selecteren in kaart",
      selectFromPortal: "Toevoegen vanuit Portal for ArcGIS",
      addServiceUrl: "Service-URL toevoegen",
      inputLayerUrl: "URL van invoerlaag",
      selectLayer: "Selecteer een laag van huidige kaart.",
      chooseItem: "Kies een item.",
      setServiceUrl: "Voer de URL van de service in.",
      selectFromOnline: "Toevoegen vanuit ArcGIS Online",
      chooseLayer: "Kies een laag."
    },
    gpSource: {
      selectFromPortal: "Toevoegen vanuit Portal for ArcGIS",
      addServiceUrl: "Service-URL toevoegen",
      selectFromOnline: "Toevoegen vanuit ArcGIS Online",
      setServiceUrl: "Voer de URL van de geoprocessingservice in.",
      chooseItem: "Kies een geoprocessingservice-item.",
      chooseTask: "Kies een geoprocessingtaak."
    },
    itemSelector: {
      map: "Kaart",
      selectWebMap: "Webmap kiezen",
      addMapFromOnlineOrPortal: "Zoek en voeg een webmap toe in de applicatie vanaf openbare ArcGIS Online-bronnen of uw privécontent in ArcGIS Online of Portal.",
      searchMapName: "Zoeken op naam van kaart...",
      searchNone: "We hebben niet gevonden wat u zocht. Probeer opnieuw.",
      groups: "Groepen",
      noneGroups: "Geen groepen",
      signInTip: "Uw sessie is afgelopen. Vernieuw uw browser om u opnieuw aan te melden voor uw portaal.",
      signIn: "Aanmelden",
      publicMap: "Openbaar",
      myOrganization: "Mijn Organisatie",
      myGroup: "Mijn Groepen",
      myContent: "Mijn Content",
      count: "Telling",
      fromPortal: "vanaf Portaal",
      fromOnline: "vanaf ArcGIS.com",
      noneThumbnail: "Thumbnail niet beschikbaar",
      owner: "eigenaar",
      signInTo: "Meld u aan bij",
      lastModified: "Laatst gewijzigd",
      moreDetails: "Meer details"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "De service ondersteunt geen query\'s."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Er is geen geschikte laag beschikbaar in de kaart."
    },
    layerInfosMenu: {
      titleBasemap: "Basiskaarten",
      titleLayers: "Operationele lagen",
      labelLayer: "Laagnaam",
      itemZoomTo: "Zoomen naar",
      itemTransparency: "Transparant",
      itemTransparent: "Transparant",
      itemOpaque: "Niet transparant",
      itemMoveUp: "Naar boven verplaatsen",
      itemMoveDown: "Naar beneden verplaatsen",
      itemDesc: "Beschrijving",
      itemDownload: "Downloaden",
      itemToAttributeTable: "Attribuuttabel openen"
    },
    imageChooser: {
      unsupportReaderAPI: "TAAK: De browser biedt geen ondersteuning voor bestandslezer-API",
      readError: "Kan het bestand niet lezen.",
      unknowError: "kan de bewerkingen niet voltooien",
      invalidType: "Ongeldig bestandstype.",
      exceed: "Bestandsgrootte mag niet groter zijn dan 1024 KB",
      enableFlash: "TAAK: schakel Flash in.",
      cropWaining: "Kies een foto die minstens ${breedte}x ${hoogte} pixels is.",
      toolTip: "Voor de beste weergave moet de afbeelding ${width} pixels breed en ${height} pixels hoog zijn. Andere formaten worden passend gemaakt. Aanvaardbare afbeeldingsindelingen zijn: PNG, GIF en JPEG."
    },
    simpleTable: {
      moveUp: "Naar boven verplaatsen",
      moveDown: "Naar beneden verplaatsen",
      deleteRow: "Verwijderen",
      edit: "Bewerken"
    },
    urlParams: {
      invalidToken: "Ongeldige token",
      validateTokenError: "Ongeldige token of Netwerkfout"
    },
    exportTo: {
      exportTo: "Exporteren",
      toCSV: "Exporteren naar CSV-bestand",
      toFeatureCollection: "Exporteren naar Feature Collection",
      toGeoJSON: "Exporteren naar GeoJSON"
    }
  })
);