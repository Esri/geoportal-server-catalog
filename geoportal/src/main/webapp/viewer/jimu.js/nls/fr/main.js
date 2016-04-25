define(
   ({
    common: {
      ok: "OK",
      cancel: "Annuler",
      next: "Suivant",
      back: "Retour"
    },
    errorCode: "Code",
    errorMessage: "Message",
    errorDetail: "Détail",
    widgetPlaceholderTooltip: "Pour le configurer, accédez à Widgets et cliquez sur l’espace réservé correspondant",
    symbolChooser: {
      preview: "Aperçu",
      basic: "De base",
      arrows: "Flèches",
      business: "Entreprises",
      cartographic: "Cartographie",
      nationalParkService: "Service des parcs nationaux",
      outdoorRecreation: "Activités de plein air",
      peoplePlaces: "Personnes Lieux",
      safetyHealth: "Sécurité Santé",
      shapes: "Formes",
      transportation: "Transports",
      symbolSize: "Taille du symbole",
      color: "Couleur",
      alpha: "Alpha",
      outlineColor: "Couleur du contour",
      outlineWidth: "Largeur du contour",
      style: "Style",
      width: "Largeur",
      text: "Texte",
      fontColor: "Couleur de police",
      fontSize: "Taille de police",
      transparency: "Transparence",
      solid: "Plein",
      dash: "Tiret",
      dot: "Point",
      dashDot: "Tiret-point",
      dashDotDot: "Tiret-point-point"
    },
    transparency: {
      opaque: "Opaque",
      transparent: "Transparent"
    },
    rendererChooser: {
      domain: "Domaine",
      use: "Utiliser",
      singleSymbol: "Un seul symbole",
      uniqueSymbol: "Des symboles uniques",
      color: "Couleur",
      size: "Taille",
      toShow: "A afficher",
      colors: "Couleurs",
      classes: "Classes",
      symbolSize: "Taille du symbole",
      addValue: "Ajouter une valeur",
      setDefaultSymbol: "Définir le symbole par défaut",
      defaultSymbol: "Symbole par défaut",
      selectedSymbol: "Symbole sélectionné",
      value: "Valeur",
      label: "Etiquette",
      range: "Plage"
    },
    drawBox: {
      point: "Point",
      line: "Ligne",
      polyline: "Polyligne",
      freehandPolyline: "Polyligne à main levée",
      triangle: "Triangle",
      extent: "Etendue",
      circle: "Cercle",
      ellipse: "Ellipse",
      polygon: "Polygone",
      freehandPolygon: "Polygone à main levée",
      text: "Texte",
      clear: "Effacer"
    },
    popupConfig: {
      title: "Titre",
      add: "Ajouter",
      fields: "Champs",
      noField: "Aucun champ",
      visibility: "Visible",
      name: "Nom",
      alias: "Alias",
      actions: "Actions"
    },
    includeButton: {
      include: "Ajouter"
    },
    loadingShelter: {
      loading: "Chargement en cours"
    },
    basicServiceBrowser: {
      noServicesFound: "Aucun service n’a été trouvé.",
      unableConnectTo: "Connexion impossible à",
      invalidUrlTip: "L\'URL que vous avez saisie est incorrecte ou inaccessible."
    },
    serviceBrowser: {
      noGpFound: "Aucun service de géotraitement n’a été trouvé.",
      unableConnectTo: "Connexion impossible à"
    },
    layerServiceBrowser: {
      noServicesFound: "Aucun service de carte ou service d’entités n’a été trouvé",
      unableConnectTo: "Connexion impossible à"
    },
    basicServiceChooser: {
      validate: "Valider",
      example: "Exemple",
      set: "Définir"
    },
    urlInput: {
      invalidUrl: "URL non valide."
    },
    urlComboBox: {
      invalidUrl: "URL non valide."
    },
    filterBuilder: {
      addAnotherExpression: "Ajouter une expression de filtre",
      addSet: "Ajouter un jeu d’expressions",
      matchMsg: "Obtenir les entités de la couche qui correspondent à ${any_or_all} des expressions suivantes",
      matchMsgSet: "${any_or_all} des expressions suivantes dans ce jeu sont vraies",
      all: "Tout",
      any: "Certaines",
      value: "Valeur",
      field: "Champ",
      unique: "Unique",
      none: "Aucun",
      and: "et",
      valueTooltip: "Entrer une valeur",
      fieldTooltip: "Choisissez dans le champ existant",
      uniqueValueTooltip: "Choisissez une des valeurs uniques dans le champ sélectionné",
      stringOperatorIs: "est", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "n\'est pas",
      stringOperatorStartsWith: "commence par",
      stringOperatorEndsWith: "se termine par",
      stringOperatorContains: "contient",
      stringOperatorDoesNotContain: "ne contient pas",
      stringOperatorIsBlank: "est vide",
      stringOperatorIsNotBlank: "n\'est pas vide",
      dateOperatorIsOn: "est le", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "n\'est pas le",
      dateOperatorIsBefore: "est avant",
      dateOperatorIsAfter: "est après",
      dateOperatorDays: "jours",
      dateOperatorWeeks: "semaines", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "mois",
      dateOperatorInTheLast: "au cours des derniers",
      dateOperatorNotInTheLast: "pas au cours des derniers",
      dateOperatorIsBetween: "est entre",
      dateOperatorIsNotBetween: "n\'est pas entre",
      dateOperatorIsBlank: "est vide",
      dateOperatorIsNotBlank: "n\'est pas vide",
      numberOperatorIs: "est", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "n\'est pas",
      numberOperatorIsAtLeast: "est au moins",
      numberOperatorIsLessThan: "est inférieur à",
      numberOperatorIsAtMost: "est au plus",
      numberOperatorIsGreaterThan: "est supérieur à",
      numberOperatorIsBetween: "est entre",
      numberOperatorIsNotBetween: "n\'est pas entre",
      numberOperatorIsBlank: "est vide",
      numberOperatorIsNotBlank: "n\'est pas vide",
      string: "Chaîne",
      number: "Nombre",
      date: "Date",
      askForValues: "Demander des valeurs",
      prompt: "Invite",
      hint: "Astuce",
      error: {
        invalidParams: "Paramètres non valides.",
        invalidUrl: "URL non valide.",
        noFilterFields: "La couche ne possède aucun champ pouvant être utilisé pour le filtrage.",
        invalidSQL: "Expression SQL non valide.",
        cantParseSQL: "Impossible d’analyser l’expression SQL."
      },
      caseSensitive: "Respecter la casse",
      notSupportCaseSensitiveTip: "Les services hébergés ne prennent pas en charge les requêtes respectant la casse."
    },

    featureLayerSource: {
      layer: "Couche",
      browse: "Parcourir",
      selectFromMap: "Sélectionner dans la carte",
      selectFromPortal: "Ajouter depuis Portal for ArcGIS",
      addServiceUrl: "Ajouter une URL de service",
      inputLayerUrl: "URL de la couche en entrée",
      selectLayer: "Sélectionnez une couche d’entités dans la carte actuelle.",
      chooseItem: "Choisissez un élément de couche d’entités.",
      setServiceUrl: "Entrez l’URL du service d’entités ou du service de carte.",
      selectFromOnline: "Ajouter depuis ArcGIS Online",
      chooseLayer: "Choisissez une couche d’entités."
    },
    queryableLayerSource: {
      layer: "Couche",
      browse: "Parcourir",
      selectFromMap: "Sélectionner dans la carte",
      selectFromPortal: "Ajouter depuis Portal for ArcGIS",
      addServiceUrl: "Ajouter une URL de service",
      inputLayerUrl: "URL de la couche en entrée",
      selectLayer: "Sélectionnez une couche dans la carte actuelle.",
      chooseItem: "Choisissez un élément.",
      setServiceUrl: "Saisissez l\'URL du service.",
      selectFromOnline: "Ajouter depuis ArcGIS Online",
      chooseLayer: "Choisissez une couche."
    },
    gpSource: {
      selectFromPortal: "Ajouter depuis Portal for ArcGIS",
      addServiceUrl: "Ajouter une URL de service",
      selectFromOnline: "Ajouter depuis ArcGIS Online",
      setServiceUrl: "Saisissez l\'URL du service de géotraitement.",
      chooseItem: "Choisissez un élément de service de géotraitement.",
      chooseTask: "Choisissez une tâche de géotraitement."
    },
    itemSelector: {
      map: "Carte",
      selectWebMap: "Choisir une carte Web",
      addMapFromOnlineOrPortal: "Recherchez et ajoutez une carte Web dans l\'application à partir des ressources publiques d\'ArcGIS Online ou de votre contenu privé dans ArcGIS Online ou Portal for ArcGIS.",
      searchMapName: "Rechercher par nom de carte...",
      searchNone: "Votre recherche n’a pas abouti. Réessayez.",
      groups: "Groupes",
      noneGroups: "Aucun groupe",
      signInTip: "Votre session de connexion a expiré. Actualisez votre navigateur pour vous reconnecter à votre portail.",
      signIn: "Se connecter",
      publicMap: "Public",
      myOrganization: "Organisation",
      myGroup: "Mes groupes",
      myContent: "Contenus",
      count: "Total",
      fromPortal: "depuis le portail",
      fromOnline: "depuis ArcGIS.com",
      noneThumbnail: "Miniature indisponible",
      owner: "propriétaire",
      signInTo: "Se connecter à",
      lastModified: "Dernière modification",
      moreDetails: "Plus de détails"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Le service ne prend pas en charge l\'interrogation."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Aucune couche appropriée n\'est disponible sur la carte."
    },
    layerInfosMenu: {
      titleBasemap: "Fonds de carte",
      titleLayers: "Couches opérationnelles",
      labelLayer: "Nom de la couche",
      itemZoomTo: "Zoom",
      itemTransparency: "Transparence",
      itemTransparent: "Transparent",
      itemOpaque: "Opaque",
      itemMoveUp: "Monter",
      itemMoveDown: "Descendre",
      itemDesc: "Description",
      itemDownload: "Télécharger",
      itemToAttributeTable: "Ouvrir la table attributaire"
    },
    imageChooser: {
      unsupportReaderAPI: "A FAIRE : le navigateur ne prend pas en charge l\'API du lecteur de fichiers",
      readError: "Echec de la lecture du fichier.",
      unknowError: "impossible d\'exécuter les opérations",
      invalidType: "Type de fichier non valide.",
      exceed: "La taille du fichier ne peut pas dépasser 1 024 Ko",
      enableFlash: "A FAIRE : activez Flash.",
      cropWaining: "Choisissez une photo d\'au moins ${width} x ${height} pixels.",
      toolTip: "Pour optimiser les résultats, l\'image doit être de ${width} pixels en largeur sur ${height} pixels en hauteur. Les autres tailles sont ajustées en conséquence. Les formats d\'image acceptables sont : PNG, GIF et JPEG."
    },
    simpleTable: {
      moveUp: "Monter",
      moveDown: "Descendre",
      deleteRow: "Supprimer",
      edit: "Modifier"
    },
    urlParams: {
      invalidToken: "Jeton non valide",
      validateTokenError: "Jeton non valide ou erreur réseau"
    },
    exportTo: {
      exportTo: "Exporter",
      toCSV: "Exporter vers un fichier CSV",
      toFeatureCollection: "Exporter vers la collection d\\'entités",
      toGeoJSON: "Exporter vers GeoJSON"
    }
  })
);