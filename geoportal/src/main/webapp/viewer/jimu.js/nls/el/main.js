define(
   ({
    common: {
      ok: "ΟΚ",
      cancel: "Ακύρωση",
      next: "Επόμενο",
      back: "Πίσω"
    },
    errorCode: "Κωδικός",
    errorMessage: "Μήνυμα",
    errorDetail: "Λεπτομέρεια",
    widgetPlaceholderTooltip: "Για να το ρυθμίσετε, μεταβείτε στα Widget και κάντε κλικ στο αντίστοιχο σύμβολο",
    symbolChooser: {
      preview: "Προεπισκόπηση",
      basic: "Βασικά",
      arrows: "Βέλη",
      business: "Επιχείρηση",
      cartographic: "Χαρτογραφικά",
      nationalParkService: "Εθνική Υπηρεσία Πάρκων",
      outdoorRecreation: "Υπαίθριες δραστηριότητες αναψυχής",
      peoplePlaces: "Άνθρωποι και μέρη",
      safetyHealth: "Ασφάλεια - Υγεία",
      shapes: "Σχήματα",
      transportation: "Μεταφορές",
      symbolSize: "Μέγεθος συμβόλου",
      color: "Χρώμα",
      alpha: "Άλφα",
      outlineColor: "Χρώμα περιγράμματος",
      outlineWidth: "Πλάτος περιγράμματος",
      style: "Στυλ",
      width: "Πλάτος",
      text: "Κείμενο",
      fontColor: "Χρώμα γραμματοσειράς",
      fontSize: "Μέγεθος γραμματοσειράς",
      transparency: "Διαφάνεια",
      solid: "Συμπαγές",
      dash: "Παύλα",
      dot: "Τελεία",
      dashDot: "Παύλα τελεία",
      dashDotDot: "Παύλα τελεία τελεία"
    },
    transparency: {
      opaque: "Αδιαφανές",
      transparent: "Διαφανές"
    },
    rendererChooser: {
      domain: "Τομέας",
      use: "Χρήση",
      singleSymbol: "Ένα μόνο σύμβολο",
      uniqueSymbol: "Μοναδικά σύμβολα",
      color: "Χρώμα",
      size: "Μέγεθος",
      toShow: "Για εμφάνιση",
      colors: "Χρώματα",
      classes: "Κλάσεις",
      symbolSize: "Μέγεθος συμβόλου",
      addValue: "Προσθήκη τιμής",
      setDefaultSymbol: "Ορισμός προκαθορισμένου συμβόλου",
      defaultSymbol: "Προκαθορισμένο σύμβολο",
      selectedSymbol: "Επιλεγμένο σύμβολο",
      value: "Τιμή",
      label: "Ετικέτα",
      range: "Εύρος"
    },
    drawBox: {
      point: "Σημείο",
      line: "Γραμμή",
      polyline: "Γραμμή πολλαπλών τμημάτων",
      freehandPolyline: "Γραμμή ελεύθερης σχεδίασης",
      triangle: "Τρίγωνο",
      extent: "Έκταση",
      circle: "Κύκλος",
      ellipse: "Έλλειψη",
      polygon: "Πολύγωνο",
      freehandPolygon: "Πολύγωνο ελεύθερης σχεδίασης",
      text: "Κείμενο",
      clear: "Απαλοιφή"
    },
    popupConfig: {
      title: "Τίτλος",
      add: "Προσθήκη",
      fields: "Πεδία",
      noField: "Χωρίς πεδίο",
      visibility: "Ορατό",
      name: "Όνομα",
      alias: "Ψευδώνυμο",
      actions: "Ενέργειες"
    },
    includeButton: {
      include: "Συμπερίληψη"
    },
    loadingShelter: {
      loading: "Φόρτωση"
    },
    basicServiceBrowser: {
      noServicesFound: "Δεν εντοπίστηκε υπηρεσία.",
      unableConnectTo: "Δεν ήταν δυνατή η σύνδεση σε",
      invalidUrlTip: "Το URL που εισαγάγατε δεν είναι έγκυρο ή δεν είναι προσβάσιμο."
    },
    serviceBrowser: {
      noGpFound: "Δεν εντοπίστηκε geoprocessing service.",
      unableConnectTo: "Δεν ήταν δυνατή η σύνδεση σε"
    },
    layerServiceBrowser: {
      noServicesFound: "Δεν εντοπίστηκε map service ή feature service",
      unableConnectTo: "Δεν ήταν δυνατή η σύνδεση σε"
    },
    basicServiceChooser: {
      validate: "Επικύρωση",
      example: "Παράδειγμα",
      set: "Ορισμός"
    },
    urlInput: {
      invalidUrl: "Μη έγκυρο URL."
    },
    urlComboBox: {
      invalidUrl: "Μη έγκυρο URL."
    },
    filterBuilder: {
      addAnotherExpression: "Προσθήκη έκφρασης φίλτρου",
      addSet: "Προσθήκη συνόλου εκφράσεων",
      matchMsg: "Βρείτε τα στοιχρία του θεματικού επιπέδου που συμφωνούν με ${any_or_all} τις παρακάτω εκφράσεις",
      matchMsgSet: "${any_or_all} από τις παρακάτω εκφράσεις σε αυτό το σύνολο έχουν τιμή true",
      all: "Όλες",
      any: "Κάποιες",
      value: "Τιμή",
      field: "Πεδίο",
      unique: "Μοναδικό",
      none: "Κανένα",
      and: "και",
      valueTooltip: "Εισαγωγή τιμής",
      fieldTooltip: "Επιλογή από υπάρχον πεδίο",
      uniqueValueTooltip: "Επιλογή από μοναδικές τιμές σε επιλεγμένο πεδίο",
      stringOperatorIs: "είναι", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "δεν είναι",
      stringOperatorStartsWith: "ξεκινάει με",
      stringOperatorEndsWith: "τελειώνει με",
      stringOperatorContains: "περιέχει",
      stringOperatorDoesNotContain: "δεν περιέχει",
      stringOperatorIsBlank: "είναι κενό",
      stringOperatorIsNotBlank: "δεν είναι κενό",
      dateOperatorIsOn: "είναι στις", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "δεν είναι στις",
      dateOperatorIsBefore: "είναι πριν από",
      dateOperatorIsAfter: "είναι μετά από",
      dateOperatorDays: "ημέρες",
      dateOperatorWeeks: "εβδομάδες", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "μήνες",
      dateOperatorInTheLast: "τους τελευταίους/τις τελευταίες",
      dateOperatorNotInTheLast: "όχι τους τελευταίους/τις τελευταίες",
      dateOperatorIsBetween: "είναι μεταξύ",
      dateOperatorIsNotBetween: "δεν είναι μεταξύ",
      dateOperatorIsBlank: "είναι κενό",
      dateOperatorIsNotBlank: "δεν είναι κενό",
      numberOperatorIs: "είναι", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "δεν είναι",
      numberOperatorIsAtLeast: "είναι τουλάχιστον",
      numberOperatorIsLessThan: "είναι λιγότερο από",
      numberOperatorIsAtMost: "είναι το πολύ",
      numberOperatorIsGreaterThan: "είναι μεγαλύτερο από",
      numberOperatorIsBetween: "είναι μεταξύ",
      numberOperatorIsNotBetween: "δεν είναι μεταξύ",
      numberOperatorIsBlank: "είναι κενό",
      numberOperatorIsNotBlank: "δεν είναι κενό",
      string: "Συμβολοσειρά",
      number: "Αριθμός",
      date: "Ημερομηνία",
      askForValues: "Εισαγωγή τιμών από το χρήστη",
      prompt: "Κείμενο εμφάνισης",
      hint: "Κείμενο υπόδειξης",
      error: {
        invalidParams: "Μη έγκυρες παράμετροι.",
        invalidUrl: "Μη έγκυρο URL.",
        noFilterFields: "Το θεματικό επίπεδο δεν διαθέτει πεδία που μπορούν να χρησιμοποιηθούν για φίλτρο.",
        invalidSQL: "Μη έγκυρη έκφραση SQL.",
        cantParseSQL: "Δεν είναι δυνατή η ανάλυση της έκφρασης SQL."
      },
      caseSensitive: "Διάκριση πεζών-κεφαλαίων",
      notSupportCaseSensitiveTip: "Οι hosted υπηρεσίες δεν υποστηρίζουν ερωτήματα με διάκριση πεζών-κεφαλαίων."
    },

    featureLayerSource: {
      layer: "Θεματικό Επίπεδο",
      browse: "Περιήγηση",
      selectFromMap: "Επιλογή από το χάρτη",
      selectFromPortal: "Προσθήκη από το Portal for ArcGIS",
      addServiceUrl: "Προσθήκη Service URL",
      inputLayerUrl: "URL θεματικού επιπέδου εισόδου",
      selectLayer: "Επιλέξτε ένα feature layer από τον τρέχοντα χάρτη.",
      chooseItem: "Επιλέξτε ένα αντικείμενο τύπου feature layer.",
      setServiceUrl: "Καταχωρίστε το URL του feature service ή του map service.",
      selectFromOnline: "Προσθήκη από το ArcGIS Online",
      chooseLayer: "Επιλέξτε ένα feature layer."
    },
    queryableLayerSource: {
      layer: "Θεματικό επίπεδο",
      browse: "Αναζήτηση",
      selectFromMap: "Επιλογή από το χάρτη",
      selectFromPortal: "Προσθήκη από το Portal for ArcGIS",
      addServiceUrl: "Προσθήκη Service URL",
      inputLayerUrl: "URL θεματικού επιπέδου εισόδου",
      selectLayer: "Επιλέξτε θεματικό επίπεδο από τον τρέχοντα χάρτη.",
      chooseItem: "Διαλέξτε ένα αντικείμενο.",
      setServiceUrl: "Καταχωρίστε το URL της υπηρεσίας.",
      selectFromOnline: "Προσθήκη από το ArcGIS Online",
      chooseLayer: "Διαλέξτε θεματικό επίπεδο."
    },
    gpSource: {
      selectFromPortal: "Προσθήκη από το Portal for ArcGIS",
      addServiceUrl: "Προσθήκη URL υπηρεσίας",
      selectFromOnline: "Προσθήκη από το ArcGIS Online",
      setServiceUrl: "Καταχωρίστε το URL του geoprocessing service.",
      chooseItem: "Επιλέξτε ένα αντικείμενο τύπου geoprocessing service.",
      chooseTask: "Επιλέξτε μια εργασία γεωεπεξεργασίας."
    },
    itemSelector: {
      map: "Χάρτης",
      selectWebMap: "Επιλογή Web χάρτη",
      addMapFromOnlineOrPortal: "Εντοπίστε και προσθέστε έναν web χάρτη στην εφαρμογή από τους δημόσιους πόρους του ArcGIS Online ή από το ιδιωτικό σας περιεχόμενο στο ArcGIS Online ή το Portal.",
      searchMapName: "Αναζήτηση ανά όνομα χάρτη...",
      searchNone: "Δεν ήταν δυνατή η εύρεση του στοιχείου που αναζητήσατε. Προσπαθήστε ξανά.",
      groups: "Ομάδες",
      noneGroups: "Δεν υπάρχουν ομάδες",
      signInTip: "Η περίοδος λειτουργίας έχει λήξει, ανανεώστε το πρόγραμμα περιήγησης για να συνδεθείτε ξανά στην πύλη σας.",
      signIn: "Είσοδος",
      publicMap: "Δημόσιο περιεχόμενο",
      myOrganization: "Ο Οργανισμός μου",
      myGroup: "Οι Ομάδες μου",
      myContent: "Το Περιεχόμενό μου",
      count: "Πλήθος",
      fromPortal: "από το Portal",
      fromOnline: "από το ArcGIS.com",
      noneThumbnail: "Δεν υπάρχουν διαθέσιμες μικρογραφίες",
      owner: "κάτοχος",
      signInTo: "Είσοδος σε",
      lastModified: "Τελευταία τροποποίηση",
      moreDetails: "Περισσότερες λεπτομέρειες"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Η υπηρεσία δεν υποστηρίζει ερωτήματα."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Δεν υπάρχει κατάλληλο θεματικό επίπεδο, διαθέσιμο στο χάρτη."
    },
    layerInfosMenu: {
      titleBasemap: "Υπόβαθρα",
      titleLayers: "Επιχειρησιακά επίπεδα",
      labelLayer: "Όνομα θεματικού επιπέδου",
      itemZoomTo: "Εστίαση",
      itemTransparency: "Διαφάνεια",
      itemTransparent: "Διαφανές",
      itemOpaque: "Αδιαφανές",
      itemMoveUp: "Μετακίνηση προς τα επάνω",
      itemMoveDown: "Μετακίνηση προς τα κάτω",
      itemDesc: "Περιγραφή",
      itemDownload: "Λήψη",
      itemToAttributeTable: "Άνοιγμα Πίνακα Περιγραφικών Γνωρισμάτων"
    },
    imageChooser: {
      unsupportReaderAPI: "TODO: Το πρόγραμμα περιήγησης δεν υποστηρίζει το API του προγράμματος ανάγνωσης αρχείων",
      readError: "Απέτυχε η ανάγνωση του αρχείου.",
      unknowError: "δεν είναι δυνατή η ολοκλήρωση ενεργειών",
      invalidType: "Μη έγκυρος τύπος αρχείου.",
      exceed: "Το μέγεθος αρχείου δεν μπορεί να υπερβαίνει τα 1024 KB",
      enableFlash: "TODO: ενεργοποιήστε το flash.",
      cropWaining: "Διαλέξτε μια φωτογραφία με διαστάσεις τουλάχιστον ${πλάτος} x ${ύψος} pixel.",
      toolTip: "Για το καλύτερο αποτέλεσμα, η εικόνα πρέπει να έχει πλάτος ${width} pixel και ύψος ${height} pixel. Τα άλλα μεγέθη θα προσαρμοστούν αναλόγως για σωστή εμφάνιση. Οι αποδεκτοι μορφότυποι εικόνας είναι οι εξής: PNG, GIF και JPEG."
    },
    simpleTable: {
      moveUp: "Μετακίνηση προς τα επάνω",
      moveDown: "Μετακίνηση προς τα κάτω",
      deleteRow: "Διαγραφή",
      edit: "Επεξεργασία"
    },
    urlParams: {
      invalidToken: "Μη έγκυρο διακριτικό",
      validateTokenError: "Το διακριτικό δεν είναι έγκυρο ή παρουσιάστηκε σφάλμα δικτύου"
    },
    exportTo: {
      exportTo: "Εξαγωγή",
      toCSV: "Εξαγωγή σε αρχείο CSV",
      toFeatureCollection: "Εξαγωγή σε Feature Collection",
      toGeoJSON: "Εξαγωγή σε GeoJSON"
    }
  })
);