define(
   ({
    common: {
      ok: "OK",
      cancel: "Anulare",
      next: "Următor",
      back: "Înapoi"
    },
    errorCode: "Cod",
    errorMessage: "Mesaj",
    errorDetail: "Detaliu",
    widgetPlaceholderTooltip: "Pentru a-l configura, mergeţi la Widgeturi şi faceţi clic pe substituentul corespunzător",
    symbolChooser: {
      preview: "Previzualizare",
      basic: "De bază",
      arrows: "Săgeţi",
      business: "Afacere",
      cartographic: "Cartografie",
      nationalParkService: "Serviciul pentru parcuri naţionale",
      outdoorRecreation: "Recreere în aer liber",
      peoplePlaces: "Locaţii personale",
      safetyHealth: "Siguranţă şi sănătate",
      shapes: "Forme",
      transportation: "Transport",
      symbolSize: "Dimensiune simbol",
      color: "Culoare",
      alpha: "Alfa",
      outlineColor: "Culoare contur",
      outlineWidth: "Lăţime contur",
      style: "Stil",
      width: "Lăţime",
      text: "Text",
      fontColor: "Culoare font",
      fontSize: "Dimensiune font",
      transparency: "Transparenţă",
      solid: "Continuu",
      dash: "Linie",
      dot: "Punct",
      dashDot: "Linie punct",
      dashDotDot: "Linie punct punct"
    },
    transparency: {
      opaque: "Opac",
      transparent: "Transparent"
    },
    rendererChooser: {
      domain: "Domeniu",
      use: "Utilizare",
      singleSymbol: "Un singur simbol",
      uniqueSymbol: "Simboluri unice",
      color: "Culoare",
      size: "Dimensiune",
      toShow: "Pentru afişare",
      colors: "Culori",
      classes: "Clase",
      symbolSize: "Dimensiune simbol",
      addValue: "Adăugare valoare",
      setDefaultSymbol: "Setare simbol implicit",
      defaultSymbol: "Simbol implicit",
      selectedSymbol: "Simbol selectat",
      value: "Valoare",
      label: "Etichetă",
      range: "Distanţă"
    },
    drawBox: {
      point: "Punct",
      line: "Linie",
      polyline: "Linie poligonală",
      freehandPolyline: "Linie poligonală trasată manual",
      triangle: "Triunghi",
      extent: "Extindere",
      circle: "Cerc",
      ellipse: "Elipsă",
      polygon: "Poligon",
      freehandPolygon: "Poligon trasat manual",
      text: "Text",
      clear: "Golire"
    },
    popupConfig: {
      title: "Titlu",
      add: "Adăugare",
      fields: "Câmpuri",
      noField: "Niciun câmp",
      visibility: "Vizibil",
      name: "Nume",
      alias: "Pseudonim",
      actions: "Acţiuni"
    },
    includeButton: {
      include: "Includere"
    },
    loadingShelter: {
      loading: "Se încarcă"
    },
    basicServiceBrowser: {
      noServicesFound: "Nu a fost găsit niciun serviciu.",
      unableConnectTo: "Nu se poate efectua conectarea la",
      invalidUrlTip: "Adresa URL pe care aţi introdus-o este nevalidă sau inaccesibilă."
    },
    serviceBrowser: {
      noGpFound: "Nu a fost găsit niciun serviciu de geoprocesare.",
      unableConnectTo: "Nu se poate efectua conectarea la"
    },
    layerServiceBrowser: {
      noServicesFound: "Nu a fost găsit niciun serviciu de hărţi sau serviciu de obiecte spaţiale",
      unableConnectTo: "Nu se poate efectua conectarea la"
    },
    basicServiceChooser: {
      validate: "Validare",
      example: "Exemplu",
      set: "Setare"
    },
    urlInput: {
      invalidUrl: "URL nevalid."
    },
    urlComboBox: {
      invalidUrl: "URL nevalid."
    },
    filterBuilder: {
      addAnotherExpression: "Adăugare expresie de filtrare",
      addSet: "Adăugare set pentru expresie",
      matchMsg: "Obţinere obiecte spaţiale în stratul tematic care se potrivesc cu ${any_or_all} dintre următoarele expresii",
      matchMsgSet: "${any_or_all} dintre următoarele expresii din acest set sunt adevărate",
      all: "Toate",
      any: "Oricare",
      value: "Valoare",
      field: "Câmp",
      unique: "Unice",
      none: "Niciunul",
      and: "şi",
      valueTooltip: "Introducere valoare",
      fieldTooltip: "Alegere din câmpul existent",
      uniqueValueTooltip: "Alegeţi dintre valorile unice din câmpul selectat",
      stringOperatorIs: "este", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "nu este",
      stringOperatorStartsWith: "începe cu",
      stringOperatorEndsWith: "se termină cu",
      stringOperatorContains: "conţine",
      stringOperatorDoesNotContain: "nu conţine",
      stringOperatorIsBlank: "este necompletat",
      stringOperatorIsNotBlank: "nu este necompletat",
      dateOperatorIsOn: "este pe", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "nu este pe",
      dateOperatorIsBefore: "este înainte de",
      dateOperatorIsAfter: "este după",
      dateOperatorDays: "zile",
      dateOperatorWeeks: "săptămâni", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "luni",
      dateOperatorInTheLast: "în ultimele",
      dateOperatorNotInTheLast: "nu este în ultimele",
      dateOperatorIsBetween: "este între",
      dateOperatorIsNotBetween: "nu este între",
      dateOperatorIsBlank: "este necompletat",
      dateOperatorIsNotBlank: "nu este necompletat",
      numberOperatorIs: "este", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "nu este",
      numberOperatorIsAtLeast: "este cel puţin",
      numberOperatorIsLessThan: "este mai mică decât",
      numberOperatorIsAtMost: "este cel mult",
      numberOperatorIsGreaterThan: "este mai mare de",
      numberOperatorIsBetween: "este între",
      numberOperatorIsNotBetween: "nu este între",
      numberOperatorIsBlank: "este necompletat",
      numberOperatorIsNotBlank: "nu este necompletat",
      string: "Şir",
      number: "Număr",
      date: "Dată",
      askForValues: "Solicitare valori",
      prompt: "Prompt",
      hint: "Sugestie",
      error: {
        invalidParams: "Parametri nevalizi.",
        invalidUrl: "URL nevalid.",
        noFilterFields: "Stratul tematic nu conţine câmpuri ce pot fi folosite pentru filtru.",
        invalidSQL: "Expresie SQL nevalidă.",
        cantParseSQL: "Expresia SQL nu poate fi analizată."
      },
      caseSensitive: "Sensibil la majuscule/minuscule",
      notSupportCaseSensitiveTip: "Serviciile găzduite nu acceptă interogările care depind de majuscule/minuscule."
    },

    featureLayerSource: {
      layer: "Strat tematic",
      browse: "Parcurgere",
      selectFromMap: "Selectare din hartă",
      selectFromPortal: "Adăugare din Portal for ArcGIS",
      addServiceUrl: "Adăugare URL serviciu",
      inputLayerUrl: "URL strat tematic de intrare",
      selectLayer: "Selectaţi un strat tematic de obiecte spaţiale din harta actuală.",
      chooseItem: "Selectaţi un element strat tematic de obiecte spaţiale.",
      setServiceUrl: "Introduceţi adresa URL a serviciului de obiecte spaţiale sau a serviciului de hartă.",
      selectFromOnline: "Adăugare din ArcGIS Online",
      chooseLayer: "Selectaţi un strat tematic de obiecte spaţiale."
    },
    queryableLayerSource: {
      layer: "Strat tematic",
      browse: "Parcurgere",
      selectFromMap: "Selectare din hartă",
      selectFromPortal: "Adăugare din Portal for ArcGIS",
      addServiceUrl: "Adăugare URL serviciu",
      inputLayerUrl: "URL strat tematic de intrare",
      selectLayer: "Selectaţi un strat tematic din harta actuală.",
      chooseItem: "Selectaţi un element.",
      setServiceUrl: "Introduceţi adresa URL a serviciului.",
      selectFromOnline: "Adăugare din ArcGIS Online",
      chooseLayer: "Alegeţi un strat tematic."
    },
    gpSource: {
      selectFromPortal: "Adăugare din Portal for ArcGIS",
      addServiceUrl: "Adăugare URL serviciu",
      selectFromOnline: "Adăugare din ArcGIS Online",
      setServiceUrl: "Introduceţi adresa URL a serviciului de geoprocesare.",
      chooseItem: "Selectaţi un element de tip serviciu de geoprocesare.",
      chooseTask: "Selectaţi o operaţie de geoprocesare."
    },
    itemSelector: {
      map: "Hartă",
      selectWebMap: "Selectare hartă Web",
      addMapFromOnlineOrPortal: "Găsiţi şi adăugaţi o hartă web în aplicaţie din resurse ArcGIS Online publice sau din conţinutul dvs. privat din ArcGIS Online sau Portal.",
      searchMapName: "Căutare după numele hărţii...",
      searchNone: "Nu am putut găsi ceea ce căutaţi. Încercaţi din nou.",
      groups: "Grupuri",
      noneGroups: "Niciun grup",
      signInTip: "Sesiunea de lucru autentificat a expirat; reîmprospătaţi browserul pentru a vă autentifica din nou în portal.",
      signIn: "Autentificaţi-vă",
      publicMap: "Public",
      myOrganization: "Organizaţia mea",
      myGroup: "Grupurile mele",
      myContent: "Resursele mele",
      count: "Număr",
      fromPortal: "din Portal",
      fromOnline: "din ArcGIS.com",
      noneThumbnail: "Miniatură indisponibilă",
      owner: "proprietar",
      signInTo: "Autentificare la",
      lastModified: "Ultima modificare",
      moreDetails: "Mai multe detalii"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Serviciul nu permite interogări."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Nu există niciun strat tematic adecvat disponibil pe hartă."
    },
    layerInfosMenu: {
      titleBasemap: "Hărţi fundal",
      titleLayers: "Straturi tematice operaţionale",
      labelLayer: "Nume strat tematic",
      itemZoomTo: "Transfocare la",
      itemTransparency: "Transparenţă",
      itemTransparent: "Transparent",
      itemOpaque: "Opac",
      itemMoveUp: "Deplasare în sus",
      itemMoveDown: "Deplasare în jos",
      itemDesc: "Descriere",
      itemDownload: "Descărcare",
      itemToAttributeTable: "Deschidere tabel de atribute"
    },
    imageChooser: {
      unsupportReaderAPI: "Acţiune: Browserul nu suportă API-ul pentru citirea fişierului",
      readError: "Nu s-a reuşit citirea fişierului.",
      unknowError: "imposibil de finalizat operaţiunile",
      invalidType: "Tip de fişier nevalid.",
      exceed: "Dimensiunea fişierului nu poate depăşi 1024 KB",
      enableFlash: "Acţiune: activaţi funcţia flash.",
      cropWaining: "Alegeţi o fotografie cu dimensiunea de cel puţin ${width} x ${height} pixeli.",
      toolTip: "Pentru cel mai bun rezultat, imaginea trebuie să aibă ${width} pixeli lăţime şi ${height} pixeli înălţime. Alte dimensiuni vor fi ajustate pentru a se încadra. Formatele de imagine acceptate sunt: PNG, GIF şi JPEG."
    },
    simpleTable: {
      moveUp: "Deplasare în sus",
      moveDown: "Deplasare în jos",
      deleteRow: "Ştergere",
      edit: "Editare"
    },
    urlParams: {
      invalidToken: "Token nevalid",
      validateTokenError: "Token nevalid sau eroare de reţea"
    },
    exportTo: {
      exportTo: "Export",
      toCSV: "Export în fişier CSV",
      toFeatureCollection: "Export către Colecția de obiecte spațiale",
      toGeoJSON: "Export către GeoJSON"
    }
  })
);