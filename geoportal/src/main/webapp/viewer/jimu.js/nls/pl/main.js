define(
   ({
    common: {
      ok: "OK",
      cancel: "Anuluj",
      next: "Dalej",
      back: "Wstecz"
    },
    errorCode: "Kod",
    errorMessage: "Komunikat",
    errorDetail: "Szczegóły",
    widgetPlaceholderTooltip: "Aby skonfigurować ten element, przejdź do ekranu Widżety i kliknij odpowiedni symbol zastępczy",
    symbolChooser: {
      preview: "Podgląd",
      basic: "Podstawowy",
      arrows: "Strzałki",
      business: "Biznes",
      cartographic: "Kartograficzny",
      nationalParkService: "Służba Parków Narodowych",
      outdoorRecreation: "Rekreacja na świeżym powietrzu",
      peoplePlaces: "Ludzie i miejsca",
      safetyHealth: "Higiena i bezpieczeństwo",
      shapes: "Kształty",
      transportation: "Transport",
      symbolSize: "Rozmiar symbolu",
      color: "Kolor",
      alpha: "Alfa",
      outlineColor: "Kolor obrysu",
      outlineWidth: "Szerokość obrysu",
      style: "Styl",
      width: "Szerokość",
      text: "Tekst",
      fontColor: "Kolor czcionki",
      fontSize: "Rozmiar czcionki",
      transparency: "Przezroczystość",
      solid: "Pełna",
      dash: "Przerywana",
      dot: "Kropka",
      dashDot: "Kreska-kropka",
      dashDotDot: "Kreska-kropka-kropka"
    },
    transparency: {
      opaque: "Nieprzezroczysty",
      transparent: "Przezroczysty"
    },
    rendererChooser: {
      domain: "Domena",
      use: "Użyj",
      singleSymbol: "Pojedynczy symbol",
      uniqueSymbol: "Symbole unikalne",
      color: "Kolor",
      size: "Rozmiar",
      toShow: "Do wyświetlenia",
      colors: "Kolory",
      classes: "Klasy",
      symbolSize: "Rozmiar symbolu",
      addValue: "Dodaj wartość",
      setDefaultSymbol: "Ustaw symbol domyślny",
      defaultSymbol: "Domyślny symbol",
      selectedSymbol: "Wybrany symbol",
      value: "Wartość",
      label: "Etykieta",
      range: "Zakres"
    },
    drawBox: {
      point: "Punkt",
      line: "Linia",
      polyline: "Polilinia",
      freehandPolyline: "Dowolna polilinia",
      triangle: "Trójkąt",
      extent: "Zasięg",
      circle: "Koło",
      ellipse: "Elipsa",
      polygon: "Poligon",
      freehandPolygon: "Dowolny poligon",
      text: "Tekst",
      clear: "Wyczyść"
    },
    popupConfig: {
      title: "Tytuł",
      add: "Dodaj",
      fields: "Pola",
      noField: "Brak pola",
      visibility: "Widoczne",
      name: "Nazwa",
      alias: "Alias",
      actions: "Operacje"
    },
    includeButton: {
      include: "Dodaj"
    },
    loadingShelter: {
      loading: "Wczytywanie"
    },
    basicServiceBrowser: {
      noServicesFound: "Nie odnaleziono żadnej usługi.",
      unableConnectTo: "Nie można nawiązać połączenia z",
      invalidUrlTip: "Wprowadzony adres URL jest nieprawidłowy lub nieosiągalny."
    },
    serviceBrowser: {
      noGpFound: "Nie odnaleziono żadnej usługi geoprzetwarzania.",
      unableConnectTo: "Nie można nawiązać połączenia z"
    },
    layerServiceBrowser: {
      noServicesFound: "Nie znaleziono żadnych usług mapowych ani obiektowych.",
      unableConnectTo: "Nie można nawiązać połączenia z"
    },
    basicServiceChooser: {
      validate: "Sprawdź poprawność",
      example: "Przykład",
      set: "Ustaw"
    },
    urlInput: {
      invalidUrl: "Nieprawidłowy adres URL"
    },
    urlComboBox: {
      invalidUrl: "Nieprawidłowy adres URL"
    },
    filterBuilder: {
      addAnotherExpression: "Dodaj wyrażenie filtru",
      addSet: "Dodaj zestaw wyrażenia",
      matchMsg: "Pobierz z warstwy obiekty, które spełniają ${any_or_all} następujące wyrażenia",
      matchMsgSet: "${any_or_all} następujące wyrażenia z tego zestawu są prawdziwe",
      all: "Wszystkie",
      any: "Dowolne",
      value: "Wartość",
      field: "Pole",
      unique: "Unikalne",
      none: "Brak",
      and: "i",
      valueTooltip: "Wprowadź wartość",
      fieldTooltip: "Wybierz z istniejącego pola",
      uniqueValueTooltip: "Wybierz spośród unikalnych wartości w wybranym polu",
      stringOperatorIs: "wynosi", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "nie równa się",
      stringOperatorStartsWith: "zaczyna się od",
      stringOperatorEndsWith: "kończy się na",
      stringOperatorContains: "zawiera",
      stringOperatorDoesNotContain: "nie zawiera",
      stringOperatorIsBlank: "jest puste",
      stringOperatorIsNotBlank: "nie jest puste",
      dateOperatorIsOn: "jest w dniu", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "nie jest w dniu",
      dateOperatorIsBefore: "jest przed",
      dateOperatorIsAfter: "jest po",
      dateOperatorDays: "dni",
      dateOperatorWeeks: "tygodni", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "miesięcy",
      dateOperatorInTheLast: "w ciągu ostatnich",
      dateOperatorNotInTheLast: "nie w ciągu ostatnich",
      dateOperatorIsBetween: "jest pomiędzy",
      dateOperatorIsNotBetween: "nie jest pomiędzy",
      dateOperatorIsBlank: "jest puste",
      dateOperatorIsNotBlank: "nie jest puste",
      numberOperatorIs: "wynosi", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "nie równa się",
      numberOperatorIsAtLeast: "równa się co najmniej",
      numberOperatorIsLessThan: "jest mniejsze niż",
      numberOperatorIsAtMost: "równa się maksymalnie",
      numberOperatorIsGreaterThan: "jest większe niż",
      numberOperatorIsBetween: "jest pomiędzy",
      numberOperatorIsNotBetween: "nie jest pomiędzy",
      numberOperatorIsBlank: "jest puste",
      numberOperatorIsNotBlank: "nie jest puste",
      string: "Tekst",
      number: "Liczba",
      date: "Data",
      askForValues: "Pytaj o wartości",
      prompt: "Monit",
      hint: "Wskazówka",
      error: {
        invalidParams: "Nieprawidłowe parametry",
        invalidUrl: "Nieprawidłowy adres URL",
        noFilterFields: "Warstwa nie zawiera pól, które można zastosować w filtrze.",
        invalidSQL: "Nieprawidłowe wyrażenie SQL",
        cantParseSQL: "Nie można przeanalizować wyrażenia SQL."
      },
      caseSensitive: "Uwzględnia wielkość liter",
      notSupportCaseSensitiveTip: "Hostowane usługi nie obsługują zapytań rozróżniających wielkość liter."
    },

    featureLayerSource: {
      layer: "Warstwa",
      browse: "Przeglądaj",
      selectFromMap: "Wybierz na mapie",
      selectFromPortal: "Dodaj z witryny Portal for ArcGIS",
      addServiceUrl: "Dodaj adres URL usługi",
      inputLayerUrl: "Adres URL warstwy wejściowej",
      selectLayer: "Zaznacz na bieżącej mapie warstwę obiektów.",
      chooseItem: "Wybierz atrybut warstwy obiektów.",
      setServiceUrl: "Wprowadź adres URL usługi obiektowej lub mapowej.",
      selectFromOnline: "Dodaj z usługi ArcGIS Online",
      chooseLayer: "Wybierz warstwę obiektów."
    },
    queryableLayerSource: {
      layer: "Warstwa",
      browse: "Przeglądaj",
      selectFromMap: "Wybierz na mapie",
      selectFromPortal: "Dodaj z witryny Portal for ArcGIS",
      addServiceUrl: "Dodaj adres URL usługi",
      inputLayerUrl: "Adres URL warstwy wejściowej",
      selectLayer: "Wybierz na bieżącej mapie warstwę.",
      chooseItem: "Wybierz element.",
      setServiceUrl: "Wpisz adres URL usługi.",
      selectFromOnline: "Dodaj z usługi ArcGIS Online",
      chooseLayer: "Wybierz warstwę."
    },
    gpSource: {
      selectFromPortal: "Dodaj z witryny Portal for ArcGIS",
      addServiceUrl: "Dodaj adres URL usługi",
      selectFromOnline: "Dodaj z usługi ArcGIS Online",
      setServiceUrl: "Wpisz adres URL usługi geoprzetwarzania.",
      chooseItem: "Wybierz element będący usługą geoprzetwarzania.",
      chooseTask: "Wybierz zadanie geoprzetwarzania."
    },
    itemSelector: {
      map: "Mapa",
      selectWebMap: "Wybierz mapę internetową",
      addMapFromOnlineOrPortal: "Wyszukaj mapę internetową spośród zasobów publicznych usługi cGIS Online bądź własnych, prywatnych zasobów serwisu ArcGIS Online lub Portal i dodaj ją do aplikacji.",
      searchMapName: "Wyszukaj wg nazwy mapy...",
      searchNone: "Nie można odnaleźć wyszukiwanego zasobu. Spróbuj ponownie.",
      groups: "Grupy",
      noneGroups: "Brak grup",
      signInTip: "Twoja sesja logowania wygasła, odśwież widok w oknie przeglądarki, aby ponownie zalogować się do portalu.",
      signIn: "Logowanie",
      publicMap: "Publiczny",
      myOrganization: "Moja instytucja",
      myGroup: "Moje grupy",
      myContent: "Moje zasoby",
      count: "Liczba",
      fromPortal: "z portalu",
      fromOnline: "z serwisu ArcGIS.com",
      noneThumbnail: "Miniatura jest niedostępna",
      owner: "właściciel",
      signInTo: "Zaloguj się do",
      lastModified: "Ostatnia modyfikacja",
      moreDetails: "Więcej szczegółów"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Usługa nie obsługuje wykonywania zapytań."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Mapa nie zawiera odpowiedniej warstwy."
    },
    layerInfosMenu: {
      titleBasemap: "Mapy bazowe",
      titleLayers: "Warstwy operacyjne",
      labelLayer: "Nazwa warstwy tematycznej",
      itemZoomTo: "Powiększ do",
      itemTransparency: "Przezroczystość",
      itemTransparent: "Przezroczysty",
      itemOpaque: "Nieprzezroczysty",
      itemMoveUp: "Przesuń w górę",
      itemMoveDown: "Przesuń w dół",
      itemDesc: "Opis",
      itemDownload: "Pobierz",
      itemToAttributeTable: "Otwórz tabelę atrybutów"
    },
    imageChooser: {
      unsupportReaderAPI: "DO OPRACOWANIA:  Przeglądarka nie obsługuje interfejsu API czytnika plików",
      readError: "Nie można odczytać pliku.",
      unknowError: "nie można zakończyć czynności",
      invalidType: "Nieprawidłowy typ plików",
      exceed: "Rozmiar pliku nie może przekraczać 1024 KB",
      enableFlash: "DO WYKONANIA: Włącz technologię Flash.",
      cropWaining: "Proszę wybrać zdjęcie o minimalnych wymiarach ${width} x ${height} pikseli.",
      toolTip: "W celu uzyskania najlepszych wyników obraz powinien mieć szerokość ${width} pikseli i wysokość ${height} pikseli.  Inne wielkości zostaną dopasowane.  Akceptowane formaty obrazów:  PNG, GIF i JPEG."
    },
    simpleTable: {
      moveUp: "Przesuń w górę",
      moveDown: "Przesuń w dół",
      deleteRow: "Usuń",
      edit: "Edytuj"
    },
    urlParams: {
      invalidToken: "Niewłaściwy token",
      validateTokenError: "Niewłaściwy token lub błąd sieciowy"
    },
    exportTo: {
      exportTo: "Eksportuj",
      toCSV: "Eksportuj do pliku CSV",
      toFeatureCollection: "Eksportuj do zbioru obiektów",
      toGeoJSON: "Eksportuj do GeoJSON"
    }
  })
);