define(
   ({
    common: {
      ok: "OK",
      cancel: "Annulla",
      next: "Avanti",
      back: "Indietro"
    },
    errorCode: "Codice",
    errorMessage: "Messaggio",
    errorDetail: "Dettagli",
    widgetPlaceholderTooltip: "Per configurarlo, passare a Widget e fare clic sul segnaposto corrispondente",
    symbolChooser: {
      preview: "Anteprima",
      basic: "Base",
      arrows: "Frecce",
      business: "Aziende",
      cartographic: "Cartografico",
      nationalParkService: "Parco nazionale",
      outdoorRecreation: "Attività ricreative all\'aperto",
      peoplePlaces: "Luoghi e persone",
      safetyHealth: "Sicurezza e salute",
      shapes: "Forme",
      transportation: "Trasporti",
      symbolSize: "Dimensioni simbolo",
      color: "Colore",
      alpha: "Alfa",
      outlineColor: "Colore contorno",
      outlineWidth: "Spessore contorno",
      style: "Stile",
      width: "Larghezza",
      text: "Testo",
      fontColor: "Colore carattere",
      fontSize: "Dimensione carattere",
      transparency: "Trasparenza",
      solid: "Continua",
      dash: "Tratteggiata",
      dot: "Punteggiata",
      dashDot: "Linea punto",
      dashDotDot: "Linea punto punto"
    },
    transparency: {
      opaque: "Opaco",
      transparent: "Trasparente"
    },
    rendererChooser: {
      domain: "Dominio",
      use: "Utilizzare",
      singleSymbol: "Singolo simbolo",
      uniqueSymbol: "Simboli univoci",
      color: "Colore",
      size: "Dimensione",
      toShow: "Da mostrare",
      colors: "Colori",
      classes: "Classi",
      symbolSize: "Dimensioni simbolo",
      addValue: "Aggiungi valore",
      setDefaultSymbol: "Imposta simbolo predefinito",
      defaultSymbol: "Simbolo predefinito",
      selectedSymbol: "Simbolo selezionato",
      value: "Valore",
      label: "Etichetta",
      range: "Intervallo"
    },
    drawBox: {
      point: "Punto",
      line: "Linea",
      polyline: "Polilinea",
      freehandPolyline: "Polilinea a mano libera",
      triangle: "Triangolo",
      extent: "Estensione",
      circle: "Cerchio",
      ellipse: "Ellisse",
      polygon: "Poligono",
      freehandPolygon: "Poligono a mano libera",
      text: "Testo",
      clear: "Cancella"
    },
    popupConfig: {
      title: "Titolo",
      add: "Aggiungi",
      fields: "Campi",
      noField: "Campi non disponibili",
      visibility: "Visibile",
      name: "Nome",
      alias: "Alias",
      actions: "Azioni"
    },
    includeButton: {
      include: "Includi"
    },
    loadingShelter: {
      loading: "Caricamento in corso"
    },
    basicServiceBrowser: {
      noServicesFound: "Nessun servizio trovato.",
      unableConnectTo: "Impossibile connettersi a",
      invalidUrlTip: "L\'URL immesso non è valido o non è accessibile."
    },
    serviceBrowser: {
      noGpFound: "Non sono stati trovati servizi di geoprocessing.",
      unableConnectTo: "Impossibile connettersi a"
    },
    layerServiceBrowser: {
      noServicesFound: "Non sono stati trovati servizi mappe o servizi feature",
      unableConnectTo: "Impossibile connettersi a"
    },
    basicServiceChooser: {
      validate: "Convalida",
      example: "Esempio",
      set: "Imposta"
    },
    urlInput: {
      invalidUrl: "URL non valido."
    },
    urlComboBox: {
      invalidUrl: "URL non valido."
    },
    filterBuilder: {
      addAnotherExpression: "Aggiungi un\'espressione di filtro",
      addSet: "Aggiungi un set di espressioni",
      matchMsg: "Ottieni le feature nel layer corrispondenti a ${any_or_all} tra le seguenti espressioni",
      matchMsgSet: "In questo set ${any_or_all} seguenti espressioni sono vere",
      all: "tutte le",
      any: "una qualsiasi delle",
      value: "Valore",
      field: "Campo",
      unique: "Univoci",
      none: "Nessuno",
      and: "e",
      valueTooltip: "Immetti valore",
      fieldTooltip: "Seleziona da campo esistente",
      uniqueValueTooltip: "Seleziona da valori univoci nel campo selezionato",
      stringOperatorIs: "è", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "non è",
      stringOperatorStartsWith: "inizia con",
      stringOperatorEndsWith: "termina con",
      stringOperatorContains: "contiene",
      stringOperatorDoesNotContain: "non contiene",
      stringOperatorIsBlank: "è vuoto",
      stringOperatorIsNotBlank: "non è vuoto",
      dateOperatorIsOn: "ricorre il giorno", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "non ricorre il giorno",
      dateOperatorIsBefore: "ricorre prima del giorno",
      dateOperatorIsAfter: "ricorre dopo il giorno",
      dateOperatorDays: "giorni",
      dateOperatorWeeks: "settimane", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "mesi",
      dateOperatorInTheLast: "negli ultimi/nelle ultime",
      dateOperatorNotInTheLast: "non negli ultimi/nelle ultime",
      dateOperatorIsBetween: "è compreso tra",
      dateOperatorIsNotBetween: "non è compreso tra",
      dateOperatorIsBlank: "è vuoto",
      dateOperatorIsNotBlank: "non è vuoto",
      numberOperatorIs: "è", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "non è",
      numberOperatorIsAtLeast: "è almeno",
      numberOperatorIsLessThan: "è minore di",
      numberOperatorIsAtMost: "è al massimo",
      numberOperatorIsGreaterThan: "è maggiore di",
      numberOperatorIsBetween: "è compreso tra",
      numberOperatorIsNotBetween: "non è compreso tra",
      numberOperatorIsBlank: "è vuoto",
      numberOperatorIsNotBlank: "non è vuoto",
      string: "Stringa",
      number: "Numero",
      date: "Data",
      askForValues: "Richiedi valori",
      prompt: "Prompt",
      hint: "Suggerimento",
      error: {
        invalidParams: "Parametri non validi.",
        invalidUrl: "URL non valido.",
        noFilterFields: "Il layer non contiene campi utilizzabili per il filtro.",
        invalidSQL: "Espressione SQL non valida.",
        cantParseSQL: "Impossibile analizzare l\'espressione SQL."
      },
      caseSensitive: "Maiuscole/minuscole",
      notSupportCaseSensitiveTip: "I servizi ospitati non supportano query con distinzione tra maiuscole e minuscole."
    },

    featureLayerSource: {
      layer: "Layer",
      browse: "Sfoglia",
      selectFromMap: "Seleziona da mappa",
      selectFromPortal: "Aggiungi da Portal for ArcGIS",
      addServiceUrl: "Aggiungi URL del servizio",
      inputLayerUrl: "URL layer di input",
      selectLayer: "Seleziona un layer feature dalla mappa corrente.",
      chooseItem: "Scegli un elemento layer feature.",
      setServiceUrl: "Immetti l\'URL del servizio feature o del servizio mappe.",
      selectFromOnline: "Aggiungi da ArcGIS Online",
      chooseLayer: "Scegliere un feature layer."
    },
    queryableLayerSource: {
      layer: "Layer",
      browse: "Esplora",
      selectFromMap: "Seleziona da mappa",
      selectFromPortal: "Aggiungi da Portal for ArcGIS",
      addServiceUrl: "Aggiungi URL del servizio",
      inputLayerUrl: "URL layer di input",
      selectLayer: "Selezionare un layer dalla mappa corrente.",
      chooseItem: "Scegliere un elemento.",
      setServiceUrl: "Immettere l\'URL del servizio.",
      selectFromOnline: "Aggiungi da ArcGIS Online",
      chooseLayer: "Selezionare un layer."
    },
    gpSource: {
      selectFromPortal: "Aggiungi da Portal for ArcGIS",
      addServiceUrl: "Aggiungi URL del servizio",
      selectFromOnline: "Aggiungi da ArcGIS Online",
      setServiceUrl: "Immettere l\'URL del servizio di geoprocessing.",
      chooseItem: "Scegliere un elemento del servizio di geoprocessing.",
      chooseTask: "Scegliere un\'attività di geoprocessing."
    },
    itemSelector: {
      map: "Mappa",
      selectWebMap: "Scegli mappa Web",
      addMapFromOnlineOrPortal: "Cercare e aggiungere una mappa Web nell\'applicazione da risorse pubbliche di ArcGIS Online o da contenuti privati disponibili in ArcGIS Online o nel portale.",
      searchMapName: "Cerca per nome applicazione...",
      searchNone: "Impossibile trovare l\'elemento cercato. Riprovare.",
      groups: "Gruppi",
      noneGroups: "Gruppi non disponibili",
      signInTip: "La sessione di accesso è scaduta. Aggiornare il browser per accedere nuovamente al portale.",
      signIn: "Accedi",
      publicMap: "Pubblico",
      myOrganization: "La mia organizzazione",
      myGroup: "I miei gruppi",
      myContent: "I miei contenuti",
      count: "Conteggio",
      fromPortal: "da portale",
      fromOnline: "da ArcGIS.com",
      noneThumbnail: "Anteprima non disponibile",
      owner: "proprietario",
      signInTo: "Accedi a",
      lastModified: "Data ultima modifica",
      moreDetails: "Altri dettagli"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Il servizio non supporta la query."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Nessun layer appropriato disponibile nella mappa."
    },
    layerInfosMenu: {
      titleBasemap: "Mappe di base",
      titleLayers: "Layer operativi",
      labelLayer: "Nome layer",
      itemZoomTo: "Zoom a",
      itemTransparency: "Trasparenza",
      itemTransparent: "Trasparente",
      itemOpaque: "Opaco",
      itemMoveUp: "Sposta su",
      itemMoveDown: "Sposta giù",
      itemDesc: "Descrizione",
      itemDownload: "Download",
      itemToAttributeTable: "Apri tabella attributi"
    },
    imageChooser: {
      unsupportReaderAPI: "DA FARE: Il browser non supporta lettore di file API",
      readError: "Lettura del file non riuscita.",
      unknowError: "impossibile completare le operazioni",
      invalidType: "Tipo di file non valido.",
      exceed: "Le dimensioni del file non possono superare 1024 KB",
      enableFlash: "TODO: abilitare Flash.",
      cropWaining: "Scegliere una foto di almeno ${width} x ${height} pixel.",
      toolTip: "Per ottimizzare i risultati, l\'immagine deve avere una larghezza pari a ${width} pixel e un\'altezza pari a ${height} pixel. Dimensioni diverse verranno adattate. I formati di immagine supportati sono PNG, GIF e JPEG."
    },
    simpleTable: {
      moveUp: "Sposta su",
      moveDown: "Sposta giù",
      deleteRow: "Elimina",
      edit: "Modifica"
    },
    urlParams: {
      invalidToken: "Token non valido",
      validateTokenError: "Token non valido o errore di rete"
    },
    exportTo: {
      exportTo: "Esporta",
      toCSV: "Esporta in file CSV",
      toFeatureCollection: "Esporta in raccolta feature",
      toGeoJSON: "Esporta in GeoJSON"
    }
  })
);