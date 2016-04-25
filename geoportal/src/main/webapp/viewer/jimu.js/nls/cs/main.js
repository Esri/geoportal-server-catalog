define(
   ({
    common: {
      ok: "OK",
      cancel: "Storno",
      next: "Další",
      back: "Zpět"
    },
    errorCode: "Kód",
    errorMessage: "Zpráva",
    errorDetail: "Podrobnosti",
    widgetPlaceholderTooltip: "Chcete-li jej nastavit, přejděte do nabídky Widgety a klikněte na odpovídající zástupný znak.",
    symbolChooser: {
      preview: "Náhled",
      basic: "Základní",
      arrows: "Šipky",
      business: "Obchod",
      cartographic: "Kartografický",
      nationalParkService: "úřad National Park Service",
      outdoorRecreation: "Rekreace ve volné přírodě",
      peoplePlaces: "Lidé a místa",
      safetyHealth: "Bezpečnost a zdraví",
      shapes: "Tvary",
      transportation: "Doprava",
      symbolSize: "Velikost symbolu",
      color: "Barva",
      alpha: "Alfa",
      outlineColor: "Barva obrysu",
      outlineWidth: "Šířka obrysu",
      style: "Styl",
      width: "Šířka",
      text: "Text",
      fontColor: "Barva písma",
      fontSize: "Velikost písma",
      transparency: "Průhlednost",
      solid: "Plná",
      dash: "Přerušovaná",
      dot: "Tečkovaná",
      dashDot: "Čerchovaná",
      dashDotDot: "Dvojčerchovaná"
    },
    transparency: {
      opaque: "Neprůhledná",
      transparent: "Průhledná"
    },
    rendererChooser: {
      domain: "Doména",
      use: "Použít",
      singleSymbol: "Jeden symbol",
      uniqueSymbol: "Unikátní symboly",
      color: "Barva",
      size: "Velikost",
      toShow: "Zobrazit",
      colors: "Barvy",
      classes: "třídami",
      symbolSize: "Velikost symbolu",
      addValue: "Přidat hodnotu",
      setDefaultSymbol: "Nastavit výchozí symbol",
      defaultSymbol: "Výchozí symbol",
      selectedSymbol: "Vybraný symbol",
      value: "Hodnota",
      label: "Štítek",
      range: "Rozmezí"
    },
    drawBox: {
      point: "Bod",
      line: "Linie",
      polyline: "Polylinie",
      freehandPolyline: "Polylinie od ruky",
      triangle: "Trojúhelník",
      extent: "Rozsah",
      circle: "Kruh",
      ellipse: "Elipsa",
      polygon: "Polygon",
      freehandPolygon: "Polygon od ruky",
      text: "Text",
      clear: "Vyprázdnit"
    },
    popupConfig: {
      title: "Nadpis",
      add: "Přidat",
      fields: "Pole",
      noField: "Žádná pole",
      visibility: "Viditelná",
      name: "Název",
      alias: "Přezdívka",
      actions: "Akce"
    },
    includeButton: {
      include: "Zahrnutí"
    },
    loadingShelter: {
      loading: "Načítání"
    },
    basicServiceBrowser: {
      noServicesFound: "Nebyly nalezeny žádné služby.",
      unableConnectTo: "Nelze se připojit k",
      invalidUrlTip: "Zadaná adresa URL je neplatná nebo nepřístupná."
    },
    serviceBrowser: {
      noGpFound: "Nebyly nalezeny žádné geoprocessingové služby",
      unableConnectTo: "Nelze se připojit k"
    },
    layerServiceBrowser: {
      noServicesFound: "Nebyly nalezeny žádné mapové služby ani služby prvků.",
      unableConnectTo: "Nelze se připojit k"
    },
    basicServiceChooser: {
      validate: "Ověřit",
      example: "Příklad",
      set: "Nastavit"
    },
    urlInput: {
      invalidUrl: "Neplatná adresa URL"
    },
    urlComboBox: {
      invalidUrl: "Neplatná adresa URL"
    },
    filterBuilder: {
      addAnotherExpression: "Přidat výraz filtru",
      addSet: "Přidat sadu výrazů",
      matchMsg: "Získat prvky vrstvy, které odpovídají ${any_or_all} z následujících výrazů.",
      matchMsgSet: "${any_or_all} z následujících výrazů v této sadě platí.",
      all: "Všechny",
      any: "Libovolný",
      value: "Hodnota",
      field: "Pole",
      unique: "Unikátní",
      none: "Žádné",
      and: "a",
      valueTooltip: "Vložit hodnotu",
      fieldTooltip: "Vybrat z existujícího pole",
      uniqueValueTooltip: "Vybrat z unikátních hodnot ve vybraném poli",
      stringOperatorIs: "je", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "není",
      stringOperatorStartsWith: "začíná na",
      stringOperatorEndsWith: "končí na",
      stringOperatorContains: "obsahuje",
      stringOperatorDoesNotContain: "neobsahuje",
      stringOperatorIsBlank: "je prázdný",
      stringOperatorIsNotBlank: "není prázdný",
      dateOperatorIsOn: "je na", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "není na",
      dateOperatorIsBefore: "je před",
      dateOperatorIsAfter: "je za",
      dateOperatorDays: "dní",
      dateOperatorWeeks: "týdnů", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "měsíců",
      dateOperatorInTheLast: "za posledních",
      dateOperatorNotInTheLast: "ne za posledních",
      dateOperatorIsBetween: "je mezi",
      dateOperatorIsNotBetween: "není mezi",
      dateOperatorIsBlank: "je prázdný",
      dateOperatorIsNotBlank: "není prázdný",
      numberOperatorIs: "je", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "není",
      numberOperatorIsAtLeast: "je alespoň",
      numberOperatorIsLessThan: "je menší než",
      numberOperatorIsAtMost: "je nejvýše",
      numberOperatorIsGreaterThan: "je větší než",
      numberOperatorIsBetween: "je mezi",
      numberOperatorIsNotBetween: "není mezi",
      numberOperatorIsBlank: "je prázdný",
      numberOperatorIsNotBlank: "není prázdný",
      string: "Řetězec",
      number: "Číslo",
      date: "Datum",
      askForValues: "Interaktivní dotaz na hodnoty",
      prompt: "Dotaz",
      hint: "Text nápovědy",
      error: {
        invalidParams: "Neplatné parametry.",
        invalidUrl: "Neplatná adresa URL",
        noFilterFields: "Ve vrstvě nejsou žádná pole, která by bylo možno využít k filtrování.",
        invalidSQL: "Neplatný výraz SQL.",
        cantParseSQL: "SQL výraz nelze analyzovat."
      },
      caseSensitive: "Rozlišovat malá a velká písmena",
      notSupportCaseSensitiveTip: "Hostované služby nepodporují dotazy rozlišující velikost písmen."
    },

    featureLayerSource: {
      layer: "Vrstva",
      browse: "Procházet",
      selectFromMap: "Vybrat z mapy",
      selectFromPortal: "Přidat z Portal for ArcGIS",
      addServiceUrl: "Přidat adresu URL služby",
      inputLayerUrl: "Adresa URL vstupní vrstvy",
      selectLayer: "Zvolte vrstvu prvků z aktuální mapy.",
      chooseItem: "Zvolte položku vrstvy prvků.",
      setServiceUrl: "Zadejte adresu URL služby prvků nebo mapové služby.",
      selectFromOnline: "Přidat z ArcGIS Online",
      chooseLayer: "Zvolte vrstvu prvků."
    },
    queryableLayerSource: {
      layer: "Vrstva",
      browse: "Procházet",
      selectFromMap: "Vybrat z mapy",
      selectFromPortal: "Přidat z Portal for ArcGIS",
      addServiceUrl: "Přidat adresu URL služby",
      inputLayerUrl: "Adresa URL vstupní vrstvy",
      selectLayer: "Zvolte vrstvu ze současné mapy.",
      chooseItem: "Zvolte položku.",
      setServiceUrl: "Zadejte adresu URL služby.",
      selectFromOnline: "Přidat z ArcGIS Online",
      chooseLayer: "Zvolte vrstvu."
    },
    gpSource: {
      selectFromPortal: "Přidat z Portal for ArcGIS",
      addServiceUrl: "Přidat URL adresu služby",
      selectFromOnline: "Přidat z ArcGIS Online",
      setServiceUrl: "Zadejte adresu URL geoprocessingové služby.",
      chooseItem: "Zvolte položku geoprocessingové služby.",
      chooseTask: "Zvolte geoprocessingovou úlohu."
    },
    itemSelector: {
      map: "Mapa",
      selectWebMap: "Zvolit webovou mapu",
      addMapFromOnlineOrPortal: "Umožňuje vyhledat a přidat webovou mapu, kterou bude aplikace používat. Může jít o mapu z veřejných zdrojů služby ArcGIS Online či ze soukromého obsahu ve službě ArcGIS Online nebo na portálu.",
      searchMapName: "Vyhledávat podle názvu mapy…",
      searchNone: "Nepodařilo se nám najít to, co hledáte. Zkuste to prosím znovu.",
      groups: "Skupiny",
      noneGroups: "Žádné skupiny",
      signInTip: "Vaše přihlašovací relace vypršela. Chcete-li se k portálu znovu přihlásit, obnovte zobrazení stránky v prohlížeči.",
      signIn: "Přihlásit se",
      publicMap: "Veřejné",
      myOrganization: "Moje organizace",
      myGroup: "Moje skupiny",
      myContent: "Můj obsah",
      count: "Počet",
      fromPortal: "z portálu",
      fromOnline: "z webu ArcGIS.com",
      noneThumbnail: "Miniatura není k dispozici.",
      owner: "vlastník",
      signInTo: "Přihlásit se do",
      lastModified: "Naposledy upraveno",
      moreDetails: "Další podrobnosti"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Tato služba nepodporuje dotazování."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "V mapě není k dispozici žádná vhodná vrstva."
    },
    layerInfosMenu: {
      titleBasemap: "Podkladové mapy",
      titleLayers: "Operační vrstvy",
      labelLayer: "Název vrstvy",
      itemZoomTo: "Přiblížit na",
      itemTransparency: "Průhlednost",
      itemTransparent: "Průhledná",
      itemOpaque: "Neprůhledná",
      itemMoveUp: "Přesunout nahoru",
      itemMoveDown: "Přesunout dolů",
      itemDesc: "Popis",
      itemDownload: "Stáhnout",
      itemToAttributeTable: "Otevřít atributovou tabulku"
    },
    imageChooser: {
      unsupportReaderAPI: "ÚKOL: Prohlížeč nepodporuje API průzkumníka souborů.",
      readError: "Soubor se nepodařilo načíst.",
      unknowError: "Operace nelze dokončit",
      invalidType: "Neplatný typ souboru.",
      exceed: "Velikost souboru nesmí překročit 1024 KB.",
      enableFlash: "ÚKOL: Povolit Flash.",
      cropWaining: "Zvolte prosím fotografii s rozměry alespoň ${width}×${height} pixelů.",
      toolTip: "V zájmu dosažení nejlepších výsledků by měl být obrázek ${width} pixelů široký a ${height} pixelů vysoký. Obrázky jiných rozměrů budou upraveny. Lze použít následující formáty: PNG, GIF a JPEG."
    },
    simpleTable: {
      moveUp: "Přesunout nahoru",
      moveDown: "Přesunout dolů",
      deleteRow: "Odstranit",
      edit: "Upravit"
    },
    urlParams: {
      invalidToken: "Neplatný token",
      validateTokenError: "Neplatný token nebo chyba sítě"
    },
    exportTo: {
      exportTo: "Exportovat",
      toCSV: "Exportovat do souboru CSV",
      toFeatureCollection: "Exportovat do sbírky prvků",
      toGeoJSON: "Exportovat do GeoJSON"
    }
  })
);