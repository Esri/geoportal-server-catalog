define(
   ({
    common: {
      ok: "OK",
      cancel: "Peruuta",
      next: "Seuraava",
      back: "Takaisin"
    },
    errorCode: "Koodi",
    errorMessage: "Viesti",
    errorDetail: "Yksityiskohta",
    widgetPlaceholderTooltip: "Kun haluat asettaa tähän pienoisohjelman, mene Pienoisohjelmat-välilehdelle ja napsauta vastaavaa paikkamerkkiä",
    symbolChooser: {
      preview: "Esikatselu",
      basic: "Perus",
      arrows: "Nuolet",
      business: "Yritystoiminta",
      cartographic: "Kartografinen",
      nationalParkService: "puistolaitos",
      outdoorRecreation: "Ulkovirkistys",
      peoplePlaces: "Ihmiset Paikat",
      safetyHealth: "Turv., terveys",
      shapes: "Muodot",
      transportation: "Kuljetus",
      symbolSize: "Symbolin koko",
      color: "Väri",
      alpha: "Alfa",
      outlineColor: "Reunaviivan väri",
      outlineWidth: "Ääriviivan leveys",
      style: "Tyyli",
      width: "Leveys",
      text: "Teksti",
      fontColor: "Fontin väri",
      fontSize: "Fontin koko",
      transparency: "Läpinäkyvyys",
      solid: "Yhtenäinen",
      dash: "Viiva",
      dot: "Piste",
      dashDot: "Viiva-piste",
      dashDotDot: "Viiva-piste-piste"
    },
    transparency: {
      opaque: "Läpinäkymätön",
      transparent: "Läpinäkyvä"
    },
    rendererChooser: {
      domain: "Arvoalue",
      use: "Käytä",
      singleSymbol: "Yksi symboli",
      uniqueSymbol: "Yksilölliset symbolit",
      color: "Väri",
      size: "Koko",
      toShow: "Näytä",
      colors: "Värit",
      classes: "Luokkaa",
      symbolSize: "Symbolin koko",
      addValue: "Lisää arvo",
      setDefaultSymbol: "Aseta oletussymboli",
      defaultSymbol: "Oletussymboli",
      selectedSymbol: "Valittu symboli",
      value: "Arvo",
      label: "Tunnusteksti",
      range: "Vaihteluväli"
    },
    drawBox: {
      point: "Piste",
      line: "Viiva",
      polyline: "Taiteviiva",
      freehandPolyline: "Vapaakädenpiirto, viiva",
      triangle: "Kolmio",
      extent: "Laajuus",
      circle: "Ympyrä",
      ellipse: "Ellipsi",
      polygon: "Alue",
      freehandPolygon: "Vapaankäden alue",
      text: "Teksti",
      clear: "Tyhjennä"
    },
    popupConfig: {
      title: "Otsikko",
      add: "Lisää",
      fields: "Kentät",
      noField: "Ei kenttää",
      visibility: "Näkyvä",
      name: "Nimi",
      alias: "Alias",
      actions: "Toimet"
    },
    includeButton: {
      include: "Sisällytä"
    },
    loadingShelter: {
      loading: "Ladataan"
    },
    basicServiceBrowser: {
      noServicesFound: "Palvelua ei löytynyt.",
      unableConnectTo: "Yhteyttä kohteeseen ei voi muodostaa.",
      invalidUrlTip: "Syötetty URL on virheellinen, tai se ei ole käytettävissä."
    },
    serviceBrowser: {
      noGpFound: "Geoprosessointipalvelua ei löytynyt.",
      unableConnectTo: "Yhteyttä kohteeseen ei voi muodostaa"
    },
    layerServiceBrowser: {
      noServicesFound: "Karttapalvelua tai kohdepalvelua ei löytynyt.",
      unableConnectTo: "Yhteyttä kohteeseen ei voi muodostaa"
    },
    basicServiceChooser: {
      validate: "Vahvista",
      example: "Esimerkki",
      set: "Aseta"
    },
    urlInput: {
      invalidUrl: "Virheellinen URL-osoite."
    },
    urlComboBox: {
      invalidUrl: "Virheellinen URL-osoite."
    },
    filterBuilder: {
      addAnotherExpression: "Lisää suodatinlauseke",
      addSet: "Lisää lausekesarja",
      matchMsg: "Nouda sellaiset karttatason kohteet, jotka vastaavat ${any_or_all} seuraavia ehtolausekkeita",
      matchMsgSet: "${any_or_all} seuraavista ehtolausekkeista ovat tosia",
      all: "Kaikki",
      any: "Mikä tahansa",
      value: "Arvo",
      field: "Kenttä",
      unique: "Yksilöllinen",
      none: "Ei mitään",
      and: "ja",
      valueTooltip: "Syötä arvo",
      fieldTooltip: "Poimi olemassa olevasta kentästä",
      uniqueValueTooltip: "Poimi valitun kentän yksilöllisistä arvoista",
      stringOperatorIs: "on", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "ei ole",
      stringOperatorStartsWith: "alkaa merkillä",
      stringOperatorEndsWith: "päättyy merkkiin",
      stringOperatorContains: "sisältää",
      stringOperatorDoesNotContain: "ei sisällä",
      stringOperatorIsBlank: "on tyhjä",
      stringOperatorIsNotBlank: "ei ole tyhjä",
      dateOperatorIsOn: "on päällä", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "ei ole päällä",
      dateOperatorIsBefore: "on ennen",
      dateOperatorIsAfter: "on jälkeen",
      dateOperatorDays: "päivää",
      dateOperatorWeeks: "viikkoa", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "kuukautta",
      dateOperatorInTheLast: "viimeisessä",
      dateOperatorNotInTheLast: "ei viimeisessä",
      dateOperatorIsBetween: "on välillä",
      dateOperatorIsNotBetween: "ei ole välillä",
      dateOperatorIsBlank: "on tyhjä",
      dateOperatorIsNotBlank: "ei ole tyhjä",
      numberOperatorIs: "on", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "ei ole",
      numberOperatorIsAtLeast: "on vähintään",
      numberOperatorIsLessThan: "on vähemmän kuin",
      numberOperatorIsAtMost: "on enintään",
      numberOperatorIsGreaterThan: "on suurempi kuin",
      numberOperatorIsBetween: "on välillä",
      numberOperatorIsNotBetween: "ei ole välillä",
      numberOperatorIsBlank: "on tyhjä",
      numberOperatorIsNotBlank: "ei ole tyhjä",
      string: "Merkkijono",
      number: "Numero",
      date: "Päivämäärä",
      askForValues: "Pyydä arvoja",
      prompt: "Kehote",
      hint: "Vihje",
      error: {
        invalidParams: "Virheelliset parametrit.",
        invalidUrl: "Virheellinen URL-osoite.",
        noFilterFields: "Karttatasolla ei ole suodatukseen soveltuvia kenttiä.",
        invalidSQL: "Virheellinen SQL-lauseke.",
        cantParseSQL: "SQL-lauseketta ei voi jäsentää."
      },
      caseSensitive: "Kirjainkoolla on merkitystä",
      notSupportCaseSensitiveTip: "Isännöidyt palvelut eivät tue kirjainkoon tunnistavaa kyselyä."
    },

    featureLayerSource: {
      layer: "Karttataso",
      browse: "Selaa",
      selectFromMap: "Valitse kartasta",
      selectFromPortal: "Lisää Portal for ArcGIS:stä",
      addServiceUrl: "Lisää palvelun URL-osoite",
      inputLayerUrl: "Anna karttatason URL-osoite",
      selectLayer: "Valitse kohteen karttataso nykyisestä kartasta.",
      chooseItem: "Valitse kohteen karttataso",
      setServiceUrl: "Anna kohdepalvelun tai karttapalvelun URL-osoite.",
      selectFromOnline: "Lisää ArcGIS Online -palvelusta",
      chooseLayer: "Valitse kohdekarttataso."
    },
    queryableLayerSource: {
      layer: "Karttataso",
      browse: "Selaa",
      selectFromMap: "Valitse kartasta",
      selectFromPortal: "Lisää Portal for ArcGIS:stä",
      addServiceUrl: "Lisää palvelun URL-osoite",
      inputLayerUrl: "Anna karttatason URL-osoite",
      selectLayer: "Valitse karttataso nykyisestä kartasta.",
      chooseItem: "Valitse kohde.",
      setServiceUrl: "Anna palvelun URL-osoite.",
      selectFromOnline: "Lisää ArcGIS Online -palvelusta",
      chooseLayer: "Valitse karttataso."
    },
    gpSource: {
      selectFromPortal: "Lisää Portal for ArcGIS:stä",
      addServiceUrl: "Lisää palvelun URL-osoite",
      selectFromOnline: "Lisää ArcGIS Online -palvelusta",
      setServiceUrl: "Anna geoprosessointipalvelun URL-osoite.",
      chooseItem: "Valitse geoprosessointipalvelun kohde.",
      chooseTask: "Valitse geoprosessointipalvelun tehtävä."
    },
    itemSelector: {
      map: "Kartta",
      selectWebMap: "Valitse Web-kartta",
      addMapFromOnlineOrPortal: "Etsi ja lisää sovelluksen Web-kartta ArcGIS Onlinen julkisista lähteistä tai ArcGIS Onlinen tai portaalin yksityisestä sisällöstäsi.",
      searchMapName: "Hae kartan nimellä...",
      searchNone: "Emme löytäneet etsimääsi. Kokeile uudelleen.",
      groups: "Ryhmät",
      noneGroups: "Ei ryhmiä",
      signInTip: "Istuntosi on vanhentunut. Päivitä selain ja kirjaudu uudelleen portaaliin.",
      signIn: "Kirjaudu sisään",
      publicMap: "Julkinen",
      myOrganization: "Organisaationi",
      myGroup: "Omat ryhmät",
      myContent: "Oma sisältö",
      count: "Lukumäärä",
      fromPortal: "Portaalista",
      fromOnline: "ArcGIS.comista",
      noneThumbnail: "Pikkukuva ei ole käytettävissä",
      owner: "omistaja",
      signInTo: "Kirjaudu palveluun",
      lastModified: "Muokattu viimeksi",
      moreDetails: "Lisää tietoja"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Palvelu ei tue kyselyä."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Kartassa ei ole käytettävissä soveltuvaa karttatasoa."
    },
    layerInfosMenu: {
      titleBasemap: "Taustakartat",
      titleLayers: "Toiminnalliset karttatasot",
      labelLayer: "Karttatason nimi",
      itemZoomTo: "Tarkenna kohteeseen",
      itemTransparency: "Läpinäkyvyys",
      itemTransparent: "Läpinäkyvä",
      itemOpaque: "Läpinäkymätön",
      itemMoveUp: "Siirrä ylös",
      itemMoveDown: "Siirrä alas",
      itemDesc: "Kuvaus",
      itemDownload: "Lataa",
      itemToAttributeTable: "Avaa ominaisuustietotaulu"
    },
    imageChooser: {
      unsupportReaderAPI: "TEHTÄVÄT: Selain ei tue tiedoston lukuohjelman ohjelmointirajapintaa",
      readError: "Tiedoston luku epäonnistui.",
      unknowError: "toimintoja ei voi suorittaa loppuun",
      invalidType: "Invalid file type.",
      exceed: "Tiedoston koko ei saa ylittää 1024 kt",
      enableFlash: "TODO: Ota käyttöön Flash.",
      cropWaining: "Valitse valokuva, joka on kooltaan vähintään ${width} x ${height} pikseliä.",
      toolTip: "Parhaan tuloksen saamiseksi kuvan tulisi olla leveydeltään ${width} pikseliä ja korkeudeltaan ${height} pikseliä. Muut koot säädetään sopivaksi. Hyväksyttyjä kuvamuotoja ovat PNG, GIF ja JPEG."
    },
    simpleTable: {
      moveUp: "Siirrä ylös",
      moveDown: "Siirrä alas",
      deleteRow: "Poista",
      edit: "Muokkaa"
    },
    urlParams: {
      invalidToken: "Virheellinen tunnus",
      validateTokenError: "Virheellinen tunnus tai verkkovirhe"
    },
    exportTo: {
      exportTo: "Vie",
      toCSV: "Vie CSV-tiedostoksi",
      toFeatureCollection: "Vie kohdekokoelmaan",
      toGeoJSON: "Vie GeoJSON-muotoon"
    }
  })
);