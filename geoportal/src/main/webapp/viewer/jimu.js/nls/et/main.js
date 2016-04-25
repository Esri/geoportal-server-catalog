define(
   ({
    common: {
      ok: "OK",
      cancel: "Tühista",
      next: "Järgmine",
      back: "Tagasi"
    },
    errorCode: "Kood",
    errorMessage: "Sõnum",
    errorDetail: "Detail",
    widgetPlaceholderTooltip: "Seadistamiseks valige Vidinad ning klikkige vastavat kohatäidet",
    symbolChooser: {
      preview: "Eelvaade",
      basic: "Esmane",
      arrows: "Nooled",
      business: "Äriettevõtted",
      cartographic: "Kartograafia",
      nationalParkService: "Rahvuspargi teenus",
      outdoorRecreation: "Rekreatsioon",
      peoplePlaces: "Inimeste asukohad",
      safetyHealth: "Tervishoid",
      shapes: "Kujundid",
      transportation: "Transport",
      symbolSize: "Sümboli suurus",
      color: "Värv",
      alpha: "Alfa",
      outlineColor: "Äärejoone värv",
      outlineWidth: "Äärejoone laius",
      style: "Stiil",
      width: "Laius",
      text: "Tekst",
      fontColor: "Fondi värv",
      fontSize: "Fondi suurus",
      transparency: "Läbipaistvus",
      solid: "Pidev",
      dash: "Katkendlik",
      dot: "Punktiir",
      dashDot: "Katkendlik punktiga",
      dashDotDot: "Katkendlik kahe punktiga"
    },
    transparency: {
      opaque: "Läbipaistmatu",
      transparent: "Läbipaistev"
    },
    rendererChooser: {
      domain: "Domeen",
      use: "Kasutus",
      singleSymbol: "Üks sümbol",
      uniqueSymbol: "Unikaalne sümbol",
      color: "Värv",
      size: "Suurus",
      toShow: "Näita",
      colors: "Värvid",
      classes: "Klassid",
      symbolSize: "Sümboli suurus",
      addValue: "Lisa väärtus",
      setDefaultSymbol: "Määra vaikesümbol",
      defaultSymbol: "Vaikesümbol",
      selectedSymbol: "Valitud sümbol",
      value: "Väärtus",
      label: "Märgis",
      range: "Ulatus"
    },
    drawBox: {
      point: "Punkt",
      line: "Joon",
      polyline: "Murdjoon",
      freehandPolyline: "Vabakäeline murdjoon",
      triangle: "Kolmnurk",
      extent: "Kuvaulatus",
      circle: "Ring",
      ellipse: "Ellips",
      polygon: "Pind",
      freehandPolygon: "Vabakäeline pind",
      text: "Tekst",
      clear: "Puhasta"
    },
    popupConfig: {
      title: "Pealkiri",
      add: "Lisa",
      fields: "Väljad",
      noField: "Väli puudub",
      visibility: "Nähtav",
      name: "Nimi",
      alias: "Alias",
      actions: "Tegevused"
    },
    includeButton: {
      include: "Kaasatud"
    },
    loadingShelter: {
      loading: "Laen"
    },
    basicServiceBrowser: {
      noServicesFound: "Teenuseid ei leitud.",
      unableConnectTo: "Ei õnnestu luua ühendust",
      invalidUrlTip: "Sisestatud URL ei sobi või pole kättesaadav."
    },
    serviceBrowser: {
      noGpFound: "Geotöötluse teenuseid ei leitud.",
      unableConnectTo: "Ei õnnestu luua ühendust"
    },
    layerServiceBrowser: {
      noServicesFound: "Kaardi- või objektiteenuseid ei leitud",
      unableConnectTo: "Ei õnnestu luua ühendust"
    },
    basicServiceChooser: {
      validate: "Valideeri",
      example: "Näide",
      set: "Määra"
    },
    urlInput: {
      invalidUrl: "Vigane URL."
    },
    urlComboBox: {
      invalidUrl: "Vigane URL."
    },
    filterBuilder: {
      addAnotherExpression: "Lisa filtriavaldis",
      addSet: "Lisa avaldise kirjeldus.",
      matchMsg: "Too kihi objektid, millega ühtivad ${any_or_all} järgmised avaldised",
      matchMsgSet: "${any_or_all} järgmistest avaldistest on tõesed",
      all: "Kõik",
      any: "Mõni",
      value: "Väärtus",
      field: "Väli",
      unique: "Unikaalne",
      none: "Pole",
      and: "ja",
      valueTooltip: "Sisesta väärtus",
      fieldTooltip: "Vali olemasolevast väljast",
      uniqueValueTooltip: "Vali valitud välja unikaalsetest väärtustest",
      stringOperatorIs: "on", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "ei ole",
      stringOperatorStartsWith: "algab",
      stringOperatorEndsWith: "lõpeb",
      stringOperatorContains: "sisaldab",
      stringOperatorDoesNotContain: "ei sisalda",
      stringOperatorIsBlank: "on tühi",
      stringOperatorIsNotBlank: "ei ole tühi",
      dateOperatorIsOn: "on", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "ei ole",
      dateOperatorIsBefore: "on enne",
      dateOperatorIsAfter: "on pärast",
      dateOperatorDays: "päeva",
      dateOperatorWeeks: "nädalat", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "kuud",
      dateOperatorInTheLast: "viimases",
      dateOperatorNotInTheLast: "mitte viimases",
      dateOperatorIsBetween: "on vahemikus",
      dateOperatorIsNotBetween: "ei ole vahemikus",
      dateOperatorIsBlank: "on tühi",
      dateOperatorIsNotBlank: "ei ole tühi",
      numberOperatorIs: "on", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "ei ole",
      numberOperatorIsAtLeast: "on vähemalt",
      numberOperatorIsLessThan: "on väiksem kui",
      numberOperatorIsAtMost: "on kõige",
      numberOperatorIsGreaterThan: "on suurem kui",
      numberOperatorIsBetween: "on vahemikus",
      numberOperatorIsNotBetween: "ei ole vahemikus",
      numberOperatorIsBlank: "on tühi",
      numberOperatorIsNotBlank: "ei ole tühi",
      string: "String",
      number: "Number",
      date: "Kuupäev",
      askForValues: "Küsi väärtustest",
      prompt: "Kuvatav kirje",
      hint: "Vihje",
      error: {
        invalidParams: "Vigased parameetrid.",
        invalidUrl: "Vigane URL.",
        noFilterFields: "Kihil puuduvad väljad, mida saaks filtreerimiseks kasutada.",
        invalidSQL: "Vigane SQL-avaldis.",
        cantParseSQL: "SQL-avaldise parsimine ei õnnestu."
      },
      caseSensitive: "Tõstutundlik",
      notSupportCaseSensitiveTip: "Majutatud teenused ei toeta tõstutundlikke päringuid."
    },

    featureLayerSource: {
      layer: "Kiht",
      browse: "Sirvi",
      selectFromMap: "Vali kaardilt",
      selectFromPortal: "Lisa Portal for ArcGIS-ist",
      addServiceUrl: "Lisa teenuse URL",
      inputLayerUrl: "Sisendkihi URL",
      selectLayer: "Vali praeguse kaardi objektikiht.",
      chooseItem: "Vali objektikihi sisu.",
      setServiceUrl: "Sisesta objekti- või kaarditeenuse URL.",
      selectFromOnline: "Lisa ArcGIS Online’ist",
      chooseLayer: "Valige objektikiht."
    },
    queryableLayerSource: {
      layer: "Kiht",
      browse: "Sirvi",
      selectFromMap: "Vali kaardilt",
      selectFromPortal: "Lisa Portal for ArcGIS-ist",
      addServiceUrl: "Lisa teenuse URL",
      inputLayerUrl: "Sisendkihi URL",
      selectLayer: "Valige kiht praeguselt kaardilt.",
      chooseItem: "Valige sisuüksus.",
      setServiceUrl: "Sisestage teenuse URL.",
      selectFromOnline: "Lisa ArcGIS Online’ist",
      chooseLayer: "Vali kiht."
    },
    gpSource: {
      selectFromPortal: "Lisa Portal for ArcGIS-ist",
      addServiceUrl: "Lisa teenuse URL",
      selectFromOnline: "Lisa ArcGIS Online’ist",
      setServiceUrl: "Sisestage geotöötlusteenuse URL.",
      chooseItem: "Valige geotöötlusteenuse objekt.",
      chooseTask: "Valige geotöötluse ülesanne."
    },
    itemSelector: {
      map: "Kaart",
      selectWebMap: "Vali veebikaart",
      addMapFromOnlineOrPortal: "Saate rakenduses veebikaarti otsida ja selle lisada ArcGIS Online’i avalike ressursside kaudu või ArcGIS Online’i või Portali isikliku sisu kaudu.",
      searchMapName: "Otsi kaardi nime järgi...",
      searchNone: "Me ei leidnud seda, mida otsisite. Proovige uuesti.",
      groups: "Grupid",
      noneGroups: "Gruppe ei ole",
      signInTip: "Teie sisselogimise seanss on aegunud, portaali uuesti sisse logimiseks värskendage brauserit.",
      signIn: "Logi sisse",
      publicMap: "Avalik",
      myOrganization: "Minu organisatsioon",
      myGroup: "Minu grupid",
      myContent: "Minu sisu",
      count: "Loend",
      fromPortal: "portaalist",
      fromOnline: "veebilehelt ArcGIS.com",
      noneThumbnail: "Pisipilt ei ole saadaval",
      owner: "omanik",
      signInTo: "Logi sisse",
      lastModified: "Viimati muudetud",
      moreDetails: "Rohkem infot"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Teenus ei toeta päringut."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Kaardi jaoks pole saadaval ühtegi sobivat kihti."
    },
    layerInfosMenu: {
      titleBasemap: "Aluskaardid",
      titleLayers: "Töökihid",
      labelLayer: "Kihi nimi",
      itemZoomTo: "Suumi",
      itemTransparency: "Läbipaistvus",
      itemTransparent: "Läbipaistev",
      itemOpaque: "Läbipaistmatu",
      itemMoveUp: "Liiguta ülespoole",
      itemMoveDown: "Liiguta allapoole",
      itemDesc: "Kirjeldus",
      itemDownload: "Laadi alla",
      itemToAttributeTable: "Ava atribuuditabel"
    },
    imageChooser: {
      unsupportReaderAPI: "MÄRKUS. Brauser ei toeta faililugemise liidest.",
      readError: "Faili lugemine nurjus.",
      unknowError: "toiminguid ei saanud lõpule viia",
      invalidType: "Sobimatut tüüpi fail",
      exceed: "Faili maht võib olla kuni 1024 KB.",
      enableFlash: "Märkus. Lubage Flash.",
      cropWaining: "Palun valige foto, mille mõõdud on vähemalt ${width} x ${height} pikslit.",
      toolTip: "Parima tulemuse saamiseks peaks pildi laius olema ${width} pikslit ning kõrgus ${height} pikslit. Muud suurused kohandatakse parajaks. Sobivad pildiformaadid on PNG, GIF ja JPEG."
    },
    simpleTable: {
      moveUp: "Liiguta ülespoole",
      moveDown: "Liiguta allapoole",
      deleteRow: "Kustuta",
      edit: "Muuda"
    },
    urlParams: {
      invalidToken: "Kehtetu võti",
      validateTokenError: "Kehtetu võti või võrgu tõrge"
    },
    exportTo: {
      exportTo: "Ekspordi",
      toCSV: "Ekspordi CSV failiks",
      toFeatureCollection: "Eksport objektide kogumisse",
      toGeoJSON: "Eksport GeoJSON formaati"
    }
  })
);