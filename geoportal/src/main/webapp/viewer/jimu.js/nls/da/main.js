define(
   ({
    common: {
      ok: "OK",
      cancel: "Annuller",
      next: "Næste",
      back: "Tilbage"
    },
    errorCode: "Kode",
    errorMessage: "Meddelelse",
    errorDetail: "Detalje",
    widgetPlaceholderTooltip: "Gå til Widgets. og klik på den tilhørende pladsholder, for at oprette den",
    symbolChooser: {
      preview: "Forhåndsvisning",
      basic: "Grundlæggende principper",
      arrows: "Pile",
      business: "Forretning",
      cartographic: "Kartografisk",
      nationalParkService: "Nationalparkforvaltning (NPF)",
      outdoorRecreation: "Udendørs rekreation",
      peoplePlaces: "Offentlige steder",
      safetyHealth: "Sikkerhed og sundhed",
      shapes: "Former",
      transportation: "Transport",
      symbolSize: "Symbolstørrelse",
      color: "Farve",
      alpha: "Alfa",
      outlineColor: "Konturfarve",
      outlineWidth: "Kantbredde",
      style: "Typografi",
      width: "Bredde",
      text: "Tekst",
      fontColor: "Skriftfarve",
      fontSize: "Skriftstørrelse",
      transparency: "Gennemsigtighed",
      solid: "Udfyldt",
      dash: "Streg",
      dot: "Punktum",
      dashDot: "Streg-prik",
      dashDotDot: "Streg-prik-prik"
    },
    transparency: {
      opaque: "Uigennemsigtig",
      transparent: "Gennemsigtig"
    },
    rendererChooser: {
      domain: "Domæne",
      use: "Brug",
      singleSymbol: "Et enkelt symbol",
      uniqueSymbol: "Entydige symboler",
      color: "Farve",
      size: "Størrelse",
      toShow: "Som viser",
      colors: "Farver",
      classes: "Klasser",
      symbolSize: "Symbolstørrelse",
      addValue: "Tilføj værdi",
      setDefaultSymbol: "Indstil standardsymbol",
      defaultSymbol: "Standardsymbol",
      selectedSymbol: "Valgt symbol",
      value: "Værdi",
      label: "Mærke",
      range: "Interval"
    },
    drawBox: {
      point: "Punkt",
      line: "Linje",
      polyline: "Polylinje",
      freehandPolyline: "Frihåndspolylinje",
      triangle: "Triangel",
      extent: "Område",
      circle: "Cirkel",
      ellipse: "Ellipse",
      polygon: "Polygon",
      freehandPolygon: "Frihåndspolygon",
      text: "Tekst",
      clear: "Ryd"
    },
    popupConfig: {
      title: "Titel",
      add: "Tilføj",
      fields: "Felter",
      noField: "Intet felt",
      visibility: "Synlig",
      name: "Navn",
      alias: "Alias",
      actions: "Handlinger"
    },
    includeButton: {
      include: "Medtag"
    },
    loadingShelter: {
      loading: "Indlæser"
    },
    basicServiceBrowser: {
      noServicesFound: "Der blev ingen tjenester fundet.",
      unableConnectTo: "Der kunne ikke oprettes forbindelse til",
      invalidUrlTip: "Den URL, du har angivet, er ugyldig eller utilgængelig."
    },
    serviceBrowser: {
      noGpFound: "Der blev ingen geoprocesseringstjenester fundet.",
      unableConnectTo: "Der kunne ikke oprettes forbindelse til"
    },
    layerServiceBrowser: {
      noServicesFound: "Der blev ingen kort- eller featuretjeneste fundet",
      unableConnectTo: "Der kunne ikke oprettes forbindelse til"
    },
    basicServiceChooser: {
      validate: "Bekræft",
      example: "Eksempel",
      set: "Indstil"
    },
    urlInput: {
      invalidUrl: "Ugyldig URL."
    },
    urlComboBox: {
      invalidUrl: "Ugyldig URL."
    },
    filterBuilder: {
      addAnotherExpression: "Tilføj et filterudtryk",
      addSet: "Tilføj et udtrykssæt",
      matchMsg: "Hent objekter i det lag, der passer til ${any_or_all} af følgende udtryk",
      matchMsgSet: "${any_or_all} af følgende udtryk i dette sæt er sande",
      all: "Alle",
      any: "Hvilket som helst",
      value: "Værdi",
      field: "Felt",
      unique: "Unik",
      none: "Ingen",
      and: "og",
      valueTooltip: "Angiv værdi",
      fieldTooltip: "Pluk fra eksisterende felt",
      uniqueValueTooltip: "Pluk fra unikke værdier i det valgte felt",
      stringOperatorIs: "er", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "er ikke",
      stringOperatorStartsWith: "starter med",
      stringOperatorEndsWith: "slutter med",
      stringOperatorContains: "indeholder",
      stringOperatorDoesNotContain: "indeholder ikke",
      stringOperatorIsBlank: "er tomt",
      stringOperatorIsNotBlank: "er ikke tomt",
      dateOperatorIsOn: "er d.", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "er ikke d.",
      dateOperatorIsBefore: "er før",
      dateOperatorIsAfter: "er efter",
      dateOperatorDays: "dage",
      dateOperatorWeeks: "uger", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "måneder",
      dateOperatorInTheLast: "i de seneste",
      dateOperatorNotInTheLast: "ikke i de seneste",
      dateOperatorIsBetween: "er mellem",
      dateOperatorIsNotBetween: "er ikke mellem",
      dateOperatorIsBlank: "er tomt",
      dateOperatorIsNotBlank: "er ikke tomt",
      numberOperatorIs: "er", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "er ikke",
      numberOperatorIsAtLeast: "er mindst",
      numberOperatorIsLessThan: "er mindre end",
      numberOperatorIsAtMost: "er højest",
      numberOperatorIsGreaterThan: "er større end",
      numberOperatorIsBetween: "er mellem",
      numberOperatorIsNotBetween: "er ikke mellem",
      numberOperatorIsBlank: "er tomt",
      numberOperatorIsNotBlank: "er ikke tomt",
      string: "Streng",
      number: "Nummer",
      date: "Dato",
      askForValues: "Spørg efter værdier",
      prompt: "Prompt",
      hint: "Tip",
      error: {
        invalidParams: "Ugyldige parametre.",
        invalidUrl: "Ugyldig URL.",
        noFilterFields: "Laget har ingen felter, der kan anvendes til filtrering.",
        invalidSQL: "Ugyldigt SQL-udtryk.",
        cantParseSQL: "SQL-udtrykket kan ikke parses."
      },
      caseSensitive: "Skelner mellem store og små bogstaver",
      notSupportCaseSensitiveTip: "\"Hostede\" tjenester understøtter ikke forespørgsler, der skelner mellem store og små bogstaver."
    },

    featureLayerSource: {
      layer: "Lag",
      browse: "Gennemse",
      selectFromMap: "Vælg fra kort",
      selectFromPortal: "Tilføj fra Portal for ArcGIS",
      addServiceUrl: "Tilføj tjeneste-URL",
      inputLayerUrl: "Inputlagets URL",
      selectLayer: "Vælg et vektorlag fra det aktuelle kort.",
      chooseItem: "Vælg et vektorlagelement.",
      setServiceUrl: "Angiv URL-adressen på en feature- eller korttjeneste.",
      selectFromOnline: "Tilføj fra ArcGIS Online",
      chooseLayer: "Vælg et vektorlag."
    },
    queryableLayerSource: {
      layer: "Lag",
      browse: "Gennemse",
      selectFromMap: "Vælg fra kort",
      selectFromPortal: "Tilføj fra Portal for ArcGIS",
      addServiceUrl: "Tilføj tjeneste-URL",
      inputLayerUrl: "Inputlagets URL",
      selectLayer: "Vælg et lag fra det aktuelle kort.",
      chooseItem: "Vælg et element.",
      setServiceUrl: "Indtast URL\'en til tjenesten.",
      selectFromOnline: "Tilføj fra ArcGIS Online",
      chooseLayer: "Vælg et lag."
    },
    gpSource: {
      selectFromPortal: "Tilføj fra Portal for ArcGIS",
      addServiceUrl: "Tilføj tjeneste-URL",
      selectFromOnline: "Tilføj fra ArcGIS Online",
      setServiceUrl: "Indtast URL til geoprocesseringstjenesten.",
      chooseItem: "Vælg et geoprocesseringstjenesteelement.",
      chooseTask: "Vælg en geoprocesseringsopgave."
    },
    itemSelector: {
      map: "Kort",
      selectWebMap: "Vælg webkort",
      addMapFromOnlineOrPortal: "Find og tilføj et webkort i applikationen fra offentlige ArcGIS Online-ressourcer eller dit private indhold i ArcGIS Online eller Portal.",
      searchMapName: "Søg efter kortnavn...",
      searchNone: "Vi kan ikke finde det, du søger. Prøv igen.",
      groups: "Grupper",
      noneGroups: "Ingen grupper",
      signInTip: "Din login-session er udløbet. Opdater browseren for at logge på portalen igen.",
      signIn: "Log ind",
      publicMap: "Offentlig",
      myOrganization: "Min organisation",
      myGroup: "Mine grupper",
      myContent: "Mit indhold",
      count: "Tælling",
      fromPortal: "fra Portal",
      fromOnline: "fra ArcGIS.com",
      noneThumbnail: "Miniaturen er ikke tilgængelig",
      owner: "ejer",
      signInTo: "Log ind på",
      lastModified: "Sidst ændret",
      moreDetails: "Flere oplysninger"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Tjenesten understøtter ikke forespørgsler."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Der er intet passende lag tilgængeligt i kortet."
    },
    layerInfosMenu: {
      titleBasemap: "Baggrundskort",
      titleLayers: "Operationelle lag",
      labelLayer: "Navn på lag",
      itemZoomTo: "Zoom til",
      itemTransparency: "Gennemsigtighed",
      itemTransparent: "Gennemsigtig",
      itemOpaque: "Uigennemsigtig",
      itemMoveUp: "Flyt op",
      itemMoveDown: "Flyt ned",
      itemDesc: "Beskrivelse",
      itemDownload: "Hent",
      itemToAttributeTable: "Åbn attributtabel"
    },
    imageChooser: {
      unsupportReaderAPI: "OPGAVE: Browseren understøtter ikke fillæser-API",
      readError: "Kunne ikke læse filen.",
      unknowError: "kan ikke fuldføre handlinger",
      invalidType: "Ugyldig filtype.",
      exceed: "Filstørrelsen må ikke være over 1.024 KB",
      enableFlash: "OPGAVE: Aktivér flash.",
      cropWaining: "Vælg et foto, der er mindst ${width} x ${height} pixels.",
      toolTip: "For at opnå det bedste resultat bør billedet være ${width} pixels bredt x ${height} pixels højt. Andre størrelser tilpasses, så de passer. Acceptable billedformater er: PNG, GIF og JPEG."
    },
    simpleTable: {
      moveUp: "Flyt op",
      moveDown: "Flyt ned",
      deleteRow: "Slet",
      edit: "Redigér"
    },
    urlParams: {
      invalidToken: "Ugyldigt token",
      validateTokenError: "Ugyldigt token eller netværksfejl"
    },
    exportTo: {
      exportTo: "Eksportér",
      toCSV: "Eksportér til CSV-fil",
      toFeatureCollection: "Eksportér til objektsamling",
      toGeoJSON: "Eksportér til GeoJSON"
    }
  })
);