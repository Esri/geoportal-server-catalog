define(
   ({
    common: {
      ok: "Labi",
      cancel: "Atcelt",
      next: "Tālāk",
      back: "Atpakaļ"
    },
    errorCode: "Kods",
    errorMessage: "Ziņojums",
    errorDetail: "Detalizēta informācija",
    widgetPlaceholderTooltip: "Lai to iestatītu, pārejiet uz sadaļu Logrīki un noklikšķiniet uz atbilstošā viettura",
    symbolChooser: {
      preview: "Priekšskatījums",
      basic: "Pamata",
      arrows: "Bultiņas",
      business: "Bizness",
      cartographic: "Kartogrāfisks",
      nationalParkService: "Nacionālo parku pakalpojums",
      outdoorRecreation: "Aktīvā atpūta",
      peoplePlaces: "Personu vietas",
      safetyHealth: "Drošība un veselība",
      shapes: "Formas",
      transportation: "Transports",
      symbolSize: "Simbola lielums",
      color: "Krāsa",
      alpha: "Alfa",
      outlineColor: "Kontūras krāsa",
      outlineWidth: "Kontūras platums",
      style: "Stils",
      width: "Platums",
      text: "Teksts",
      fontColor: "Fonta krāsa",
      fontSize: "Fonta lielums",
      transparency: "Caurspīdīgums",
      solid: "Tīrtoņa",
      dash: "Svītra",
      dot: "Punkts",
      dashDot: "Svītra punkts",
      dashDotDot: "Svītra punkts punkts"
    },
    transparency: {
      opaque: "Necaurredzams",
      transparent: "Caurspīdīgs"
    },
    rendererChooser: {
      domain: "Domēns",
      use: "Lietot",
      singleSymbol: "Atsevišķs simbols",
      uniqueSymbol: "Unikāli simboli",
      color: "Krāsa",
      size: "Lielums",
      toShow: "Lai rādītu",
      colors: "Krāsas",
      classes: "Klases",
      symbolSize: "Simbola lielums",
      addValue: "Pievienot vērtību",
      setDefaultSymbol: "Iestatīt noklusējuma simbolu",
      defaultSymbol: "Noklusējuma simbols",
      selectedSymbol: "Atlasītais simbols",
      value: "Vērtība",
      label: "Kartes teksts",
      range: "Diapazons"
    },
    drawBox: {
      point: "Virsotne",
      line: "Līnija",
      polyline: "Līnija",
      freehandPolyline: "Brīvrokas līnija",
      triangle: "Trīsstūris",
      extent: "Pārklājums",
      circle: "Aplis",
      ellipse: "Elipse",
      polygon: "Laukums",
      freehandPolygon: "Brīvrokas laukums",
      text: "Teksts",
      clear: "Notīrīt"
    },
    popupConfig: {
      title: "Nosaukums",
      add: "Pievienot",
      fields: "Lauki",
      noField: "Nav lauka",
      visibility: "Redzams",
      name: "Nosaukums",
      alias: "Aizstājvārds",
      actions: "Darbības"
    },
    includeButton: {
      include: "Iekļaut"
    },
    loadingShelter: {
      loading: "Ielādē"
    },
    basicServiceBrowser: {
      noServicesFound: "Nav atrasts neviens pakalpojums.",
      unableConnectTo: "Nevar izveidot savienojumu ar",
      invalidUrlTip: "Jūsu ievadītais URL nav derīgs vai tam nevar piekļūt."
    },
    serviceBrowser: {
      noGpFound: "Nav atrasts neviens ģeodatu apstrādes pakalpojums.",
      unableConnectTo: "Nevar izveidot savienojumu ar"
    },
    layerServiceBrowser: {
      noServicesFound: "Nav atrasts neviens karšu serviss vai elementu serviss",
      unableConnectTo: "Nevar izveidot savienojumu ar"
    },
    basicServiceChooser: {
      validate: "Pārbaudīt",
      example: "Piemērs",
      set: "Kopa"
    },
    urlInput: {
      invalidUrl: "Nederīgs URL."
    },
    urlComboBox: {
      invalidUrl: "Nederīgs URL."
    },
    filterBuilder: {
      addAnotherExpression: "Pievienot filtra izteiksmi",
      addSet: "Pievienot izteiksmju kopu",
      matchMsg: "Iegūt slāņa elementus, kas atbilst ${any_or_all} no šādām izteiksmēm",
      matchMsgSet: "${any_or_all} no šādām izteiksmēm šajā kopā ir patiesi",
      all: "Visi",
      any: "Jebkurš",
      value: "Vērtība",
      field: "Lauks",
      unique: "Unikāls",
      none: "Nav",
      and: "un",
      valueTooltip: "Ievadiet vērtību",
      fieldTooltip: "Izmeklēt no esošajiem laukiem",
      uniqueValueTooltip: "Izmeklēt unikālas vērtības no izvēlētā lauka",
      stringOperatorIs: "ir", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "nav",
      stringOperatorStartsWith: "sākas ar",
      stringOperatorEndsWith: "beidzas ar",
      stringOperatorContains: "ietver",
      stringOperatorDoesNotContain: "neietver",
      stringOperatorIsBlank: "ir tukšs",
      stringOperatorIsNotBlank: "nav tukšs",
      dateOperatorIsOn: "ir šajā datumā", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "nav šajā datumā",
      dateOperatorIsBefore: "ir pirms",
      dateOperatorIsAfter: "ir pēc",
      dateOperatorDays: "dienas",
      dateOperatorWeeks: "nedēļas", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "mēneši",
      dateOperatorInTheLast: "pagātnē",
      dateOperatorNotInTheLast: "nav pagātnē",
      dateOperatorIsBetween: "ir starp",
      dateOperatorIsNotBetween: "nav starp",
      dateOperatorIsBlank: "ir tukšs",
      dateOperatorIsNotBlank: "nav tukšs",
      numberOperatorIs: "ir", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "nav",
      numberOperatorIsAtLeast: "ir vismaz",
      numberOperatorIsLessThan: "ir mazāks nekā",
      numberOperatorIsAtMost: "ir visvairāk",
      numberOperatorIsGreaterThan: "ir lielāks nekā",
      numberOperatorIsBetween: "ir starp",
      numberOperatorIsNotBetween: "nav starp",
      numberOperatorIsBlank: "ir tukšs",
      numberOperatorIsNotBlank: "nav tukšs",
      string: "Virkne",
      number: "Numurs",
      date: "Datums",
      askForValues: "Jautāt vērtības",
      prompt: "Uzvedne",
      hint: "Mājiens",
      error: {
        invalidParams: "Nederīgi parametri.",
        invalidUrl: "Nederīgs URL.",
        noFilterFields: "Slānī nav lauku, ko var izmantot filtram.",
        invalidSQL: "Nederīga SQL izteiksme.",
        cantParseSQL: "SQL izteiksmi nevar parsēt."
      },
      caseSensitive: "Reģistrjutīgs",
      notSupportCaseSensitiveTip: "Viesotie servisi neatbalsta reģistrjutīgu vaicājumu."
    },

    featureLayerSource: {
      layer: "Slānis",
      browse: "Pārlūkot",
      selectFromMap: "Izvēlēties no kartes",
      selectFromPortal: "Pievienot no Portal for ArcGIS",
      addServiceUrl: "Pievienot pakalpojuma vietrādi URL",
      inputLayerUrl: "Ievadīt slāņa URL",
      selectLayer: "Izvēlieties elementu slāni no pašreizējās kartes.",
      chooseItem: "Izvēlieties elementu slāņa vienību.",
      setServiceUrl: "Ievadiet elementu pakalpojuma vai kartes pakalpojuma vietrādi URL.",
      selectFromOnline: "Pievienot no ArcGIS Online",
      chooseLayer: "Izvēlieties elementu slāni."
    },
    queryableLayerSource: {
      layer: "Slānis",
      browse: "Pārlūks",
      selectFromMap: "Izvēlēties no kartes",
      selectFromPortal: "Pievienot no Portal for ArcGIS",
      addServiceUrl: "Pievienot pakalpojuma vietrādi URL",
      inputLayerUrl: "Ievadīt slāņa URL",
      selectLayer: "Atlasiet slāni no pašreizējās kartes.",
      chooseItem: "Izvēlieties vienumu.",
      setServiceUrl: "Ievadiet pakalpojuma URL.",
      selectFromOnline: "Pievienot no ArcGIS Online",
      chooseLayer: "Izvēlieties slāni."
    },
    gpSource: {
      selectFromPortal: "Pievienot no Portal for ArcGIS",
      addServiceUrl: "Pievienot pakalpojuma vietrādi URL",
      selectFromOnline: "Pievienot no ArcGIS Online",
      setServiceUrl: "Ievadiet ģeogrāfisko datu apstrādes pakalpojuma vietrādi URL.",
      chooseItem: "Izvēlieties ģeogrāfisko datu apstrādes pakalpojuma vienumu.",
      chooseTask: "Izvēlieties ģeogrāfisko datu apstrādes uzdevumu."
    },
    itemSelector: {
      map: "Karte",
      selectWebMap: "Izvēlieties web karti",
      addMapFromOnlineOrPortal: "Atrodiet un pievienojiet web karti aplikācijā no ArcGIS Online publiskajiem resursiem vai sava privātā satura pakalpojumā ArcGIS Online vai Portal.",
      searchMapName: "Meklēt pēc kartes nosaukuma...",
      searchNone: "Neizdevās atrast to, ko meklējāt. Mēģiniet vēlreiz.",
      groups: "Grupas",
      noneGroups: "Nav grupu",
      signInTip: "Jūsu pieteikšanās sesija ir beigusies; lai vēlreiz pierakstītos savā portālā, atsvaidziniet pārlūku.",
      signIn: "Pierakstīties",
      publicMap: "Publisks",
      myOrganization: "Organizācija",
      myGroup: "Manas Grupas",
      myContent: "Mans saturs",
      count: "Skaitīt",
      fromPortal: "no Portal",
      fromOnline: "no ArcGIS.com",
      noneThumbnail: "Sīktēls nav pieejams",
      owner: "īpašnieks",
      signInTo: "Pierakstīties",
      lastModified: "Pēdējā modificēšana",
      moreDetails: "Papildu detalizētā informācija"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Pakalpojums neatbalsta vaicājumu."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Kartē nav pieejams neviens piemērots slānis."
    },
    layerInfosMenu: {
      titleBasemap: "Pamatkartes",
      titleLayers: "Operacionālie slāņi",
      labelLayer: "Slāņa nosaukums",
      itemZoomTo: "Pietuvināt",
      itemTransparency: "Caurspīdīgums",
      itemTransparent: "Caurspīdīgs",
      itemOpaque: "Necaurredzams",
      itemMoveUp: "Pārvietot uz augšu",
      itemMoveDown: "Pārvietot uz leju",
      itemDesc: "Apraksts",
      itemDownload: "Lejupielāde",
      itemToAttributeTable: "Atvērt atribūtu tabulu"
    },
    imageChooser: {
      unsupportReaderAPI: "TODO: pārlūks neatbalsta faila lasītāja API",
      readError: "Neizdevās nolasīt failu.",
      unknowError: "nevar pabeigt darbības",
      invalidType: "Nederīgs faila tips.",
      exceed: "Faila lielums nedrīkst pārsniegt 1024 KB",
      enableFlash: "TODO: lūdzu, aktivizējiet flash.",
      cropWaining: "Lūdzu, izvēlieties fotoattēlu, kura izmēri ir vismaz ${width} x ${height} pikseļi.",
      toolTip: "Lai sasniegtu labākos rezultātus, attēla platumam jābūt ${width} pikseļiem un tā augstumam jābūt ${height} pikseļiem. Citi izmēri tiks pielāgoti, lai atbilstu. Akceptētie attēla formāti ir: PNG, GIF un JPEG."
    },
    simpleTable: {
      moveUp: "Pārvietot uz augšu",
      moveDown: "Pārvietot uz leju",
      deleteRow: "Dzēst",
      edit: "Rediģēt"
    },
    urlParams: {
      invalidToken: "Nederīga pilnvara",
      validateTokenError: "Nederīga pilnvara vai tīkla kļūda"
    },
    exportTo: {
      exportTo: "Eksportēt",
      toCSV: "Eksports uz CSV failu",
      toFeatureCollection: "Eksportēt uz elementu kolekciju",
      toGeoJSON: "Eksportēt uz GeoJSON"
    }
  })
);