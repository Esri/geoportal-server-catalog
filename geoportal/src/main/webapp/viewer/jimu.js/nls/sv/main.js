define(
   ({
    common: {
      ok: "OK",
      cancel: "Avbryt",
      next: "Nästa",
      back: "Bakåt"
    },
    errorCode: "Kod",
    errorMessage: "Meddelande",
    errorDetail: "Information",
    widgetPlaceholderTooltip: "Ställ in detta genom att gå till Widgetar och klicka på motsvarande platshållare",
    symbolChooser: {
      preview: "Förhandsgranska",
      basic: "Grundläggande",
      arrows: "Pilar",
      business: "Företag",
      cartographic: "Kartografisk",
      nationalParkService: "National Park Service",
      outdoorRecreation: "Utomhusrekreation",
      peoplePlaces: "Personplatser",
      safetyHealth: "Säkerhet och hälsa",
      shapes: "Objekt",
      transportation: "Transport",
      symbolSize: "Symbolstorlek",
      color: "Färg",
      alpha: "Alfa",
      outlineColor: "Konturfärg",
      outlineWidth: "Konturbredd",
      style: "Format",
      width: "Bredd",
      text: "Text",
      fontColor: "Teckenfärg",
      fontSize: "Teckenstorlek",
      transparency: "Transparens",
      solid: "Heldragen",
      dash: "Streck",
      dot: "Punkt",
      dashDot: "Streck punkt",
      dashDotDot: "Streck punkt punkt"
    },
    transparency: {
      opaque: "Opak",
      transparent: "Transparent"
    },
    rendererChooser: {
      domain: "Värdemängd",
      use: "Använda",
      singleSymbol: "En symbol",
      uniqueSymbol: "Unika symboler",
      color: "Färg",
      size: "Storlek",
      toShow: "För att visa",
      colors: "Färger",
      classes: "Klasser",
      symbolSize: "Symbolstorlek",
      addValue: "Lägg till värde",
      setDefaultSymbol: "Ange standardsymbol",
      defaultSymbol: "Standardsymbol",
      selectedSymbol: "Vald symbol",
      value: "Värde",
      label: "Etikett",
      range: "Intervall"
    },
    drawBox: {
      point: "Punkt",
      line: "Linje",
      polyline: "Polylinje",
      freehandPolyline: "Frihandspolylinje",
      triangle: "Triangel",
      extent: "Utbredning",
      circle: "Cirkel",
      ellipse: "Ellips",
      polygon: "Polygon",
      freehandPolygon: "Frihandspolygon",
      text: "Text",
      clear: "Rensa"
    },
    popupConfig: {
      title: "Titel",
      add: "Lägg till",
      fields: "Fält",
      noField: "Inget fält",
      visibility: "Synlig",
      name: "Namn",
      alias: "Alias",
      actions: "Åtgärder"
    },
    includeButton: {
      include: "Ta med"
    },
    loadingShelter: {
      loading: "Läser in"
    },
    basicServiceBrowser: {
      noServicesFound: "Ingen tjänst hittades.",
      unableConnectTo: "Det gick inte att ansluta till",
      invalidUrlTip: "Den URL du har angett är ogiltig eller går inte att komma åt."
    },
    serviceBrowser: {
      noGpFound: "Ingen geobearbetningstjänst hittades.",
      unableConnectTo: "Det gick inte att ansluta till"
    },
    layerServiceBrowser: {
      noServicesFound: "Inga karttjänster eller geoobjekttjänster hittades",
      unableConnectTo: "Det gick inte att ansluta till"
    },
    basicServiceChooser: {
      validate: "Validera",
      example: "Exempel",
      set: "Ange"
    },
    urlInput: {
      invalidUrl: "Ogiltig URL."
    },
    urlComboBox: {
      invalidUrl: "Ogiltig URL."
    },
    filterBuilder: {
      addAnotherExpression: "Lägg till ett filteruttryck",
      addSet: "Lägg till en uttrycksuppsättning",
      matchMsg: "Hämta geoobjekt i lagret som matchar ${any_or_all} av följande uttryck",
      matchMsgSet: "${any_or_all} av följande uttryck i uppsättningen är sanna",
      all: "Alla",
      any: "Något",
      value: "Värde",
      field: "Fält",
      unique: "Unik",
      none: "Ingen",
      and: "och",
      valueTooltip: "Ange värde",
      fieldTooltip: "Välj i befintligt fält",
      uniqueValueTooltip: "Välj bland unika värden i det valda fältet",
      stringOperatorIs: "är", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "är inte",
      stringOperatorStartsWith: "börjar med",
      stringOperatorEndsWith: "slutar med",
      stringOperatorContains: "innehåller",
      stringOperatorDoesNotContain: "innehåller inte",
      stringOperatorIsBlank: "är tomt",
      stringOperatorIsNotBlank: "är inte tomt",
      dateOperatorIsOn: "är", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "är inte",
      dateOperatorIsBefore: "är före",
      dateOperatorIsAfter: "är efter",
      dateOperatorDays: "dagar",
      dateOperatorWeeks: "veckor", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "månader",
      dateOperatorInTheLast: "i den sista",
      dateOperatorNotInTheLast: "inte i den sista",
      dateOperatorIsBetween: "är mellan",
      dateOperatorIsNotBetween: "är inte mellan",
      dateOperatorIsBlank: "är tomt",
      dateOperatorIsNotBlank: "är inte tomt",
      numberOperatorIs: "är", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "är inte",
      numberOperatorIsAtLeast: "är minst",
      numberOperatorIsLessThan: "är mindre än",
      numberOperatorIsAtMost: "är som mest",
      numberOperatorIsGreaterThan: "är större än",
      numberOperatorIsBetween: "är mellan",
      numberOperatorIsNotBetween: "är inte mellan",
      numberOperatorIsBlank: "är tomt",
      numberOperatorIsNotBlank: "är inte tomt",
      string: "Sträng",
      number: "Nummer",
      date: "Datum",
      askForValues: "Fråga efter värden",
      prompt: "Fråga",
      hint: "Tips",
      error: {
        invalidParams: "Ogiltiga parametrar.",
        invalidUrl: "Ogiltig URL.",
        noFilterFields: "Lagret innehåller inga fält som kan användas för filter.",
        invalidSQL: "Ogiltigt SQL-uttryck.",
        cantParseSQL: "Det går inte att tolka SQL-uttrycket."
      },
      caseSensitive: "Skiftlägeskänsligt",
      notSupportCaseSensitiveTip: "Värdbaserade tjänster stöder inte skiftlägeskänsliga frågor."
    },

    featureLayerSource: {
      layer: "Lager",
      browse: "Bläddra",
      selectFromMap: "Välj från karta",
      selectFromPortal: "Lägg till från Portal for ArcGIS",
      addServiceUrl: "Lägg till tjänst-URL",
      inputLayerUrl: "Indatalager-URL",
      selectLayer: "Välj ett geoobjektlager i den aktuella kartan.",
      chooseItem: "Välj ett objekt i geoobjektlagret.",
      setServiceUrl: "Ange URL till karttjänsten eller geoobjekttjänsten.",
      selectFromOnline: "Lägg till från ArcGIS Online",
      chooseLayer: "Välj ett geoobjektslager."
    },
    queryableLayerSource: {
      layer: "Lager",
      browse: "Bläddra",
      selectFromMap: "Välj från karta",
      selectFromPortal: "Lägg till från Portal for ArcGIS",
      addServiceUrl: "Lägg till tjänst-URL",
      inputLayerUrl: "Indatalager-URL",
      selectLayer: "Välj ett lager i den aktuella kartan.",
      chooseItem: "Välj ett objekt.",
      setServiceUrl: "Ange webbadressen till tjänsten.",
      selectFromOnline: "Lägg till från ArcGIS Online",
      chooseLayer: "Välj ett lager."
    },
    gpSource: {
      selectFromPortal: "Lägg till från Portal for ArcGIS",
      addServiceUrl: "Lägg till tjänst-URL",
      selectFromOnline: "Lägg till från ArcGIS Online",
      setServiceUrl: "Ange webbadressen till geobearbetningstjänsten.",
      chooseItem: "Välj ett objekt från geobearbetningstjänsten.",
      chooseTask: "Välj en geobearbetningsåtgärd."
    },
    itemSelector: {
      map: "Karta",
      selectWebMap: "Välj webbkarta",
      addMapFromOnlineOrPortal: "Hitta och lägg till en webbkarta i applikationen från offentliga ArcGIS Online-resurser eller ditt privata innehåll i ArcGIS Online eller Portal.",
      searchMapName: "Sök efter kartnamn ...",
      searchNone: "Vi kunde inte hitta det du söker. Försök igen.",
      groups: "Grupper",
      noneGroups: "Inga grupper",
      signInTip: "Din inloggningssession har gått ut. Uppdatera webbläsaren om du vill logga in på portalen igen.",
      signIn: "Logga in",
      publicMap: "Publik",
      myOrganization: "Min organisation",
      myGroup: "Mina grupper",
      myContent: "Mitt innehåll",
      count: "Antal",
      fromPortal: "från Portal",
      fromOnline: "från ArcGIS.com",
      noneThumbnail: "Ingen miniatyrbild finns tillgänglig",
      owner: "ägare",
      signInTo: "Logga in på",
      lastModified: "Senast ändrad",
      moreDetails: "Mer information"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Tjänsten stöder inte frågor."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Det finns inget lämpligt lager tillgängligt i kartan."
    },
    layerInfosMenu: {
      titleBasemap: "Baskartor",
      titleLayers: "Funktionslager",
      labelLayer: "Lagernamn",
      itemZoomTo: "Zooma till",
      itemTransparency: "Transparens",
      itemTransparent: "Transparent",
      itemOpaque: "Opak",
      itemMoveUp: "Flytta uppåt",
      itemMoveDown: "Flytta nedåt",
      itemDesc: "Beskrivning",
      itemDownload: "Hämta",
      itemToAttributeTable: "Öppna attributtabell"
    },
    imageChooser: {
      unsupportReaderAPI: "TODO: webbläsaren har inte stöd för filläsnings-API",
      readError: "Det gick inte att läsa filen.",
      unknowError: "det gick inte att slutföra åtgärderna",
      invalidType: "Ogiltig filtyp.",
      exceed: "Filstorleken får inte överskrida 1 024 KB",
      enableFlash: "TODO: aktivera flash.",
      cropWaining: "Välj ett foto som är på minst ${width} x ${height} pixlar.",
      toolTip: "För bästa resultat ska bilden vara ${width} bildpunkter bred och ${height} bildpunkter hög. Andra storlekar justeras för att passa in. Tillåtna bildformat är: PNG, GIF och JPEG."
    },
    simpleTable: {
      moveUp: "Flytta uppåt",
      moveDown: "Flytta nedåt",
      deleteRow: "Ta bort",
      edit: "Redigera"
    },
    urlParams: {
      invalidToken: "Ogiltig token",
      validateTokenError: "Ogiltig token eller nätverksfel"
    },
    exportTo: {
      exportTo: "Exportera",
      toCSV: "Exportera till CSV-fil",
      toFeatureCollection: "Exportera till geoobjektssamling",
      toGeoJSON: "Exportera till GeoJSON"
    }
  })
);