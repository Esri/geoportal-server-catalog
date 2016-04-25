define(
   ({
    common: {
      ok: "OK",
      cancel: "Avbryt",
      next: "Neste",
      back: "Bak"
    },
    errorCode: "Kode",
    errorMessage: "Melding",
    errorDetail: "Detaljer",
    widgetPlaceholderTooltip: "For å konfigurere går du til Widgeter og klikker på tilsvarende plassholder",
    symbolChooser: {
      preview: "Forhåndsvisning",
      basic: "Grunnleggende",
      arrows: "Piler",
      business: "Næringsliv",
      cartographic: "Kartografisk",
      nationalParkService: "National Park Service",
      outdoorRecreation: "Utendørsaktiviteter",
      peoplePlaces: "Folk og steder",
      safetyHealth: "Helse og sikkerhet",
      shapes: "Former",
      transportation: "Transport",
      symbolSize: "Symbolstørrelse",
      color: "Farge",
      alpha: "Alfa",
      outlineColor: "Omrissfarge",
      outlineWidth: "Omrissbredde",
      style: "Stil",
      width: "Bredde",
      text: "Tekst",
      fontColor: "Skriftfarge",
      fontSize: "Skriftstørrelse",
      transparency: "Gjennomsiktighet",
      solid: "Heltrukket",
      dash: "Strek",
      dot: "Prikk",
      dashDot: "Strek prikk",
      dashDotDot: "Strek prikk prikk"
    },
    transparency: {
      opaque: "Ugjennomsiktig",
      transparent: "Gjennomsiktighet"
    },
    rendererChooser: {
      domain: "Domene",
      use: "Bruke",
      singleSymbol: "Et enkeltsymbol",
      uniqueSymbol: "Unike symboler",
      color: "Farge",
      size: "Størrelse",
      toShow: "Å vise",
      colors: "Farger",
      classes: "Klasser:",
      symbolSize: "Symbolstørrelse",
      addValue: "Legg til verdi",
      setDefaultSymbol: "Angi standardsymbol",
      defaultSymbol: "Standardsymbol",
      selectedSymbol: "Valgt symbol",
      value: "Verdi",
      label: "Etikett",
      range: "Område"
    },
    drawBox: {
      point: "Punkt",
      line: "Linje",
      polyline: "Polylinje",
      freehandPolyline: "Frihåndspolylinje",
      triangle: "Trekant",
      extent: "Utstrekning",
      circle: "Sirkel",
      ellipse: "Ellipse",
      polygon: "Polygon",
      freehandPolygon: "Frihåndspolygon",
      text: "Tekst",
      clear: "Fjern"
    },
    popupConfig: {
      title: "Tittel",
      add: "Legg til",
      fields: "Felter",
      noField: "Ingen felt",
      visibility: "Synlig",
      name: "Navn",
      alias: "Alias",
      actions: "Handlinger"
    },
    includeButton: {
      include: "Inkluder"
    },
    loadingShelter: {
      loading: "Laster inn"
    },
    basicServiceBrowser: {
      noServicesFound: "Ingen tjeneste funnet.",
      unableConnectTo: "Kan ikke koble til",
      invalidUrlTip: "URL-en du har angitt, er ugyldig eller ikke tilgjengelig."
    },
    serviceBrowser: {
      noGpFound: "Fant ingen geoprosesseringstjeneste.",
      unableConnectTo: "Kan ikke koble til"
    },
    layerServiceBrowser: {
      noServicesFound: "Fant ingen kart- eller featuretjeneste",
      unableConnectTo: "Kan ikke koble til"
    },
    basicServiceChooser: {
      validate: "Valider",
      example: "Eksempel",
      set: "Angi"
    },
    urlInput: {
      invalidUrl: "Ugyldig URL."
    },
    urlComboBox: {
      invalidUrl: "Ugyldig URL."
    },
    filterBuilder: {
      addAnotherExpression: "Legg til et filteruttrykk",
      addSet: "Legg til et uttrykkssett",
      matchMsg: "Hent geoobjekter i laget som samsvarer med ${any_or_all} av følgende uttrykk",
      matchMsgSet: "${any_or_all} av de følgende uttrykkene i dette settet er sanne",
      all: "Alle",
      any: "Noen",
      value: "Verdi",
      field: "Felt",
      unique: "Unike",
      none: "Ingen",
      and: "og",
      valueTooltip: "Angi verdi",
      fieldTooltip: "Velg fra eksisterende felt",
      uniqueValueTooltip: "Velg blant unike verdier i det valgte feltet",
      stringOperatorIs: "er", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "er ikke",
      stringOperatorStartsWith: "begynner på",
      stringOperatorEndsWith: "slutter på",
      stringOperatorContains: "inneholder",
      stringOperatorDoesNotContain: "inneholder ikke",
      stringOperatorIsBlank: "er tomt",
      stringOperatorIsNotBlank: "er ikke tomt",
      dateOperatorIsOn: "er den", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "er ikke den",
      dateOperatorIsBefore: "er før",
      dateOperatorIsAfter: "er etter",
      dateOperatorDays: "dagene",
      dateOperatorWeeks: "ukene", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "månedene",
      dateOperatorInTheLast: "i de/den siste",
      dateOperatorNotInTheLast: "ikke i de/den siste",
      dateOperatorIsBetween: "er mellom",
      dateOperatorIsNotBetween: "er ikke mellom",
      dateOperatorIsBlank: "er tomt",
      dateOperatorIsNotBlank: "er ikke tomt",
      numberOperatorIs: "er", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "er ikke",
      numberOperatorIsAtLeast: "er minst",
      numberOperatorIsLessThan: "er mindre enn",
      numberOperatorIsAtMost: "er maksimalt",
      numberOperatorIsGreaterThan: "er større enn",
      numberOperatorIsBetween: "er mellom",
      numberOperatorIsNotBetween: "er ikke mellom",
      numberOperatorIsBlank: "er tomt",
      numberOperatorIsNotBlank: "er ikke tomt",
      string: "Streng",
      number: "Tall",
      date: "Dato",
      askForValues: "Spør om verdier",
      prompt: "Spør",
      hint: "Tips:",
      error: {
        invalidParams: "Ugyldige parametere.",
        invalidUrl: "Ugyldig URL.",
        noFilterFields: "Laget har ingen felter som kan brukes til filtrering.",
        invalidSQL: "Ugyldig SQL-uttrykk.",
        cantParseSQL: "Kan ikke analysere SQL-uttrykket."
      },
      caseSensitive: "Skille mellom store og små bokstaver",
      notSupportCaseSensitiveTip: "Administrerte tjenester støtter ikke spørringer som skiller mellom små og store bokstaver."
    },

    featureLayerSource: {
      layer: "Lag",
      browse: "Bla gjennom",
      selectFromMap: "Velg fra kart",
      selectFromPortal: "Legg til fra Portal for ArcGIS",
      addServiceUrl: "Legg til tjeneste-URL",
      inputLayerUrl: "Angi kartlag-URL",
      selectLayer: "Velg et geoobjektslag i gjeldende kart.",
      chooseItem: "Velg et geoobjektslagelement.",
      setServiceUrl: "Angi URL-adressen for feature- eller karttjeneste.",
      selectFromOnline: "Legg til fra ArcGIS Online",
      chooseLayer: "Velg et geoobjektslag."
    },
    queryableLayerSource: {
      layer: "Lag",
      browse: "Bla gjennom",
      selectFromMap: "Velg fra kart",
      selectFromPortal: "Legg til fra Portal for ArcGIS",
      addServiceUrl: "Legg til tjeneste-URL",
      inputLayerUrl: "Angi kartlag-URL",
      selectLayer: "Velg et lag fra det gjeldende kartet.",
      chooseItem: "Velg et element.",
      setServiceUrl: "Angi URL-adressen til tjenesten.",
      selectFromOnline: "Legg til fra ArcGIS Online",
      chooseLayer: "Velg et lag."
    },
    gpSource: {
      selectFromPortal: "Legg til fra Portal for ArcGIS",
      addServiceUrl: "Legg til tjeneste-URL",
      selectFromOnline: "Legg til fra ArcGIS Online",
      setServiceUrl: "Oppgi URL-en for geoprosesseringstjenesten.",
      chooseItem: "Velg et element for geoprosesseringstjenesten.",
      chooseTask: "Velg en geoprosesseringsoppgave."
    },
    itemSelector: {
      map: "Kart",
      selectWebMap: "Velg webkart",
      addMapFromOnlineOrPortal: "Finn og legg til et webkart som skal brukes i applikasjonen, fra ArcGIS Onlines offentlige ressurser eller ditt private innhold på ArcGIS Online eller Portal.",
      searchMapName: "Søk etter kartnavn ...",
      searchNone: "Vi finner ikke det du leter etter. Prøv på nytt.",
      groups: "Grupper",
      noneGroups: "Ingen grupper",
      signInTip: "Påloggingsøkten har utløpt. Oppdater websiden for å logge på portalen din igjen.",
      signIn: "Logg inn",
      publicMap: "Felles",
      myOrganization: "Min organisasjon",
      myGroup: "Mine grupper",
      myContent: "Mitt innhold",
      count: "Antall",
      fromPortal: "fra Portal",
      fromOnline: "fra ArcGIS.com",
      noneThumbnail: "Miniatyrbilde ikke tilgjengelig",
      owner: "owner",
      signInTo: "Logg inn på",
      lastModified: "Sist endret",
      moreDetails: "Flere detaljer"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Tjenesten støtter ikke spørringer."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Det er ingen aktuelle lag tilgjengelig i kartet."
    },
    layerInfosMenu: {
      titleBasemap: "Bakgrunnskart",
      titleLayers: "Operative kartlag",
      labelLayer: "Lagnavn",
      itemZoomTo: "Zoom til",
      itemTransparency: "Gjennomsiktighet",
      itemTransparent: "Gjennomsiktig",
      itemOpaque: "Ugjennomsiktig",
      itemMoveUp: "Flytt opp",
      itemMoveDown: "Flytt ned",
      itemDesc: "Beskrivelse",
      itemDownload: "Last ned",
      itemToAttributeTable: "Åpne attributtabell"
    },
    imageChooser: {
      unsupportReaderAPI: "TODO: Leseren støtter ikke filleser-API",
      readError: "Kan ikke lese filen.",
      unknowError: "kan ikke fullføre operasjonene",
      invalidType: "Ugyldig filtype.",
      exceed: "Filstørrelsen må ikke overskride 1 024 kB",
      enableFlash: "TODO: aktiver flash.",
      cropWaining: "Velg et bilde som er minst ${width} x ${height} piksler.",
      toolTip: "Resultatet blir best hvis bildet er ${width} piksler bredt og ${height} piksler høyt. Andre størrelser må justeres for at de skal passe. Godkjente bildeformater er: PNG, GIF og JPEG."
    },
    simpleTable: {
      moveUp: "Flytt opp",
      moveDown: "Flytt ned",
      deleteRow: "Slett",
      edit: "Rediger"
    },
    urlParams: {
      invalidToken: "Ugyldig token",
      validateTokenError: "Ugyldig token eller nettverksfeil"
    },
    exportTo: {
      exportTo: "Eksporter",
      toCSV: "Eksporter til CSV-fil",
      toFeatureCollection: "Eksporter til geoobjektssamling",
      toGeoJSON: "Eksporter til GeoJSON"
    }
  })
);