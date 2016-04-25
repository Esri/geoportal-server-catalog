define(
   ({
    common: {
      ok: "OK",
      cancel: "Abbrechen",
      next: "Weiter",
      back: "Zurück"
    },
    errorCode: "Code",
    errorMessage: "Meldung",
    errorDetail: "Detail",
    widgetPlaceholderTooltip: "Zum Einrichten zu Widgets wechseln und auf den entsprechenden Platzhalter klicken",
    symbolChooser: {
      preview: "Vorschau",
      basic: "Anfänger",
      arrows: "Pfeile",
      business: "Gewerbe",
      cartographic: "Kartografisch",
      nationalParkService: "National Park Service",
      outdoorRecreation: "Erholung im Freien",
      peoplePlaces: "Öffentliche Plätze",
      safetyHealth: "Sicherheit und Gesundheit",
      shapes: "Shapes",
      transportation: "Verkehr",
      symbolSize: "Symbolgröße",
      color: "Farbe",
      alpha: "Alpha",
      outlineColor: "Umrissfarbe",
      outlineWidth: "Umrissbreite",
      style: "Style",
      width: "Breite",
      text: "Text",
      fontColor: "Schriftfarbe",
      fontSize: "Schriftgröße",
      transparency: "Transparenz",
      solid: "Durchgezogen",
      dash: "Gestrichelt",
      dot: "Punkt",
      dashDot: "Strich-Punkt",
      dashDotDot: "Strich-Punkt-Punkt"
    },
    transparency: {
      opaque: "Nicht transparent",
      transparent: "Transparent"
    },
    rendererChooser: {
      domain: "Domäne",
      use: "Verwenden",
      singleSymbol: "Ein Symbol",
      uniqueSymbol: "Einzelsymbole",
      color: "Farbe",
      size: "Größe",
      toShow: "Anzeigen",
      colors: "Farben",
      classes: "Klassen",
      symbolSize: "Symbolgröße",
      addValue: "Wert hinzufügen",
      setDefaultSymbol: "Standardsymbol festlegen",
      defaultSymbol: "Standardsymbol",
      selectedSymbol: "Ausgewähltes Symbol",
      value: "Wert",
      label: "Beschriftung",
      range: "Bereich"
    },
    drawBox: {
      point: "Punkt",
      line: "Linie",
      polyline: "Polylinie",
      freehandPolyline: "Freihand-Polylinie",
      triangle: "Dreieck",
      extent: "Ausdehnung",
      circle: "Kreis",
      ellipse: "Ellipse",
      polygon: "Polygon",
      freehandPolygon: "Freihand-Polygon",
      text: "Text",
      clear: "Löschen"
    },
    popupConfig: {
      title: "Titel",
      add: "Hinzufügen",
      fields: "Felder",
      noField: "Kein Feld",
      visibility: "Sichtbar",
      name: "Name",
      alias: "Alias",
      actions: "Aktionen"
    },
    includeButton: {
      include: "Einbinden"
    },
    loadingShelter: {
      loading: "Wird geladen"
    },
    basicServiceBrowser: {
      noServicesFound: "Keinen Service gefunden.",
      unableConnectTo: "Verbindung kann nicht hergestellt werden",
      invalidUrlTip: "Die eingegebene URL ist ungültig oder es kann nicht darauf zugegriffen werden."
    },
    serviceBrowser: {
      noGpFound: "Keinen Geoverarbeitungsservice gefunden.",
      unableConnectTo: "Verbindung kann nicht hergestellt werden"
    },
    layerServiceBrowser: {
      noServicesFound: "Keinen Kartenservice oder Feature-Service gefunden",
      unableConnectTo: "Verbindung kann nicht hergestellt werden"
    },
    basicServiceChooser: {
      validate: "Überprüfen",
      example: "Beispiel",
      set: "Festlegen"
    },
    urlInput: {
      invalidUrl: "Ungültige URL."
    },
    urlComboBox: {
      invalidUrl: "Ungültige URL."
    },
    filterBuilder: {
      addAnotherExpression: "Filterausdruck hinzufügen",
      addSet: "Eine Gruppe von Ausdrücken hinzufügen",
      matchMsg: "Features im Layer abrufen, bei denen ${any_or_all} der folgenden Ausdrücke zutreffen",
      matchMsgSet: "${any_or_all} der folgenden Ausdrücke dieser Abfrage erfüllen die Bedingung",
      all: "Alle",
      any: "Einige",
      value: "Wert",
      field: "Feld",
      unique: "Eindeutig",
      none: "Keine",
      and: "und",
      valueTooltip: "Wert eingeben",
      fieldTooltip: "Aus vorhandenem Feld auswählen",
      uniqueValueTooltip: "Aus eindeutigen Werten im ausgewählten Feld auswählen",
      stringOperatorIs: "ist", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "ist nicht",
      stringOperatorStartsWith: "beginnt mit",
      stringOperatorEndsWith: "endet mit",
      stringOperatorContains: "enthält",
      stringOperatorDoesNotContain: "enthält nicht",
      stringOperatorIsBlank: "ist leer",
      stringOperatorIsNotBlank: "ist nicht leer",
      dateOperatorIsOn: "ist am", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "ist nicht am",
      dateOperatorIsBefore: "ist vor",
      dateOperatorIsAfter: "ist nach",
      dateOperatorDays: "Tagen",
      dateOperatorWeeks: "Wochen", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "Monate",
      dateOperatorInTheLast: "in den letzten",
      dateOperatorNotInTheLast: "nicht in den letzten",
      dateOperatorIsBetween: "liegt zwischen",
      dateOperatorIsNotBetween: "liegt nicht zwischen",
      dateOperatorIsBlank: "ist leer",
      dateOperatorIsNotBlank: "ist nicht leer",
      numberOperatorIs: "ist", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "ist nicht",
      numberOperatorIsAtLeast: "ist mindestens",
      numberOperatorIsLessThan: "ist kleiner als",
      numberOperatorIsAtMost: "ist höchstens",
      numberOperatorIsGreaterThan: "ist größer als",
      numberOperatorIsBetween: "liegt zwischen",
      numberOperatorIsNotBetween: "liegt nicht zwischen",
      numberOperatorIsBlank: "ist leer",
      numberOperatorIsNotBlank: "ist nicht leer",
      string: "String",
      number: "Zahl",
      date: "Datum",
      askForValues: "Werte abfragen",
      prompt: "Eingabeaufforderung",
      hint: "Hinweis",
      error: {
        invalidParams: "Ungültige Parameter.",
        invalidUrl: "Ungültige URL.",
        noFilterFields: "Der Layer verfügt über keine Felder, die gefiltert werden können.",
        invalidSQL: "Ungültiger SQL-Ausdruck.",
        cantParseSQL: "SQL-Ausdruck kann nicht geparst werden."
      },
      caseSensitive: "Groß-/Kleinschreibung beachten",
      notSupportCaseSensitiveTip: "Gehostete Services unterstützen keine Abfragen, bei denen zwischen Groß- und Kleinschreibung unterschieden wird."
    },

    featureLayerSource: {
      layer: "Layer",
      browse: "Durchsuchen",
      selectFromMap: "Aus Karte auswählen",
      selectFromPortal: "Aus Portal for ArcGIS hinzufügen",
      addServiceUrl: "Service-URL hinzufügen",
      inputLayerUrl: "Eingabe-Layer-URL",
      selectLayer: "Feature-Layer aus aktueller Karte auswählen.",
      chooseItem: "Ein Feature-Layer-Element auswählen.",
      setServiceUrl: "Geben Sie die URL des Feature-Service oder des Kartenservice ein.",
      selectFromOnline: "Aus ArcGIS Online hinzufügen",
      chooseLayer: "Wählen Sie einen Feature-Layer aus."
    },
    queryableLayerSource: {
      layer: "Layer",
      browse: "Durchsuchen",
      selectFromMap: "Aus Karte auswählen",
      selectFromPortal: "Aus Portal for ArcGIS hinzufügen",
      addServiceUrl: "Service-URL hinzufügen",
      inputLayerUrl: "Eingabe-Layer-URL",
      selectLayer: "Wählen Sie einen Layer aus der aktuellen Karte aus.",
      chooseItem: "Wählen Sie ein Element aus.",
      setServiceUrl: "Geben Sie die URL des Service ein.",
      selectFromOnline: "Aus ArcGIS Online hinzufügen",
      chooseLayer: "Wählen Sie einen Layer aus."
    },
    gpSource: {
      selectFromPortal: "Aus Portal for ArcGIS hinzufügen",
      addServiceUrl: "Service-URL hinzufügen",
      selectFromOnline: "Aus ArcGIS Online hinzufügen",
      setServiceUrl: "Geben Sie die URL des Geoverarbeitungsservice an.",
      chooseItem: "Wählen Sie ein Geoverarbeitungsserviceelement aus.",
      chooseTask: "Wählen Sie einen Geoverarbeitungs-Task aus."
    },
    itemSelector: {
      map: "Karte",
      selectWebMap: "Webkarte auswählen",
      addMapFromOnlineOrPortal: "Suchen Sie in der Anwendung eine Webkarte in den öffentlichen ArcGIS Online-Ressourcen oder Ihren privaten Inhalten in ArcGIS Online oder Portal und fügen Sie sie hinzu.",
      searchMapName: "Nach Kartenname suchen...",
      searchNone: "Die gesuchten Informationen konnten nicht gefunden werden. Versuchen Sie es erneut.",
      groups: "Gruppen",
      noneGroups: "Keine Gruppen",
      signInTip: "Ihre Anmeldesitzung ist abgelaufen. Aktualisieren Sie Ihren Browser, um sich erneut bei Ihrem Portal anzumelden.",
      signIn: "Anmelden",
      publicMap: "Öffentlichkeit",
      myOrganization: "Eigene Organisation",
      myGroup: "Eigene Gruppen",
      myContent: "Eigene Inhalte",
      count: "Anzahl",
      fromPortal: "aus Portal",
      fromOnline: "aus ArcGIS.com",
      noneThumbnail: "Miniaturansicht nicht verfügbar",
      owner: "Besitzer",
      signInTo: "Melden Sie sich an bei",
      lastModified: "Zuletzt geändert",
      moreDetails: "Mehr Details"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Der Service unterstützt keine Abfragen."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "In der Karte ist kein geeigneter Layer verfügbar."
    },
    layerInfosMenu: {
      titleBasemap: "Grundkarten",
      titleLayers: "Operationale Layer",
      labelLayer: "Layer-Name",
      itemZoomTo: "Zoomen auf",
      itemTransparency: "Transparenz",
      itemTransparent: "Transparent",
      itemOpaque: "Nicht transparent",
      itemMoveUp: "Nach oben verschieben",
      itemMoveDown: "Nach unten verschieben",
      itemDesc: "Beschreibung",
      itemDownload: "Herunterladen",
      itemToAttributeTable: "Attributtabelle öffnen"
    },
    imageChooser: {
      unsupportReaderAPI: "ZU ERLEDIGEN: Der Browser unterstützt die Datei-Reader-API nicht",
      readError: "Die Datei kann nicht gelesen werden.",
      unknowError: "Vorgänge können nicht abgeschlossen werden",
      invalidType: "Ungültiger Dateityp.",
      exceed: "Dateigröße darf 1024 KB nicht überschreiten",
      enableFlash: "ZU ERLEDIGEN: Flash aktivieren.",
      cropWaining: "Wählen Sie ein Foto mit einem Format von mindestens ${width} x ${height} Pixel aus.",
      toolTip: "Optimale Ergebnisse erzielen Sie mit einer Bildgröße von ${width} x ${height} Pixel (Breite x Höhe). Andere Größen werden angepasst. Zulässige Bildformate sind: PNG, GIF und JPEG."
    },
    simpleTable: {
      moveUp: "Nach oben verschieben",
      moveDown: "Nach unten verschieben",
      deleteRow: "Löschen",
      edit: "Bearbeiten"
    },
    urlParams: {
      invalidToken: "Ungültiges Token",
      validateTokenError: "Ungültiges Token oder Netzwerkfehler"
    },
    exportTo: {
      exportTo: "Exportieren",
      toCSV: "In CSV-Datei exportieren",
      toFeatureCollection: "In Feature-Sammlung exportieren",
      toGeoJSON: "In GeoJSON exportieren"
    }
  })
);