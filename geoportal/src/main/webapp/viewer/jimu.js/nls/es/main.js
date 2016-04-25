define(
   ({
    common: {
      ok: "Aceptar",
      cancel: "Cancelar",
      next: "Siguiente",
      back: "Atrás"
    },
    errorCode: "Código",
    errorMessage: "Mensaje",
    errorDetail: "Detalle",
    widgetPlaceholderTooltip: "Para configurarlo, ve a Widgets y haz clic en el marcador de posición correspondiente",
    symbolChooser: {
      preview: "Presentación preliminar",
      basic: "Básico",
      arrows: "Flechas",
      business: "Empresa",
      cartographic: "Cartográfico",
      nationalParkService: "Servicio de Parque Nacional",
      outdoorRecreation: "Entretenimiento al aire libre",
      peoplePlaces: "Lugares y personas",
      safetyHealth: "Seguridad y salud públicas",
      shapes: "Formas",
      transportation: "Transporte",
      symbolSize: "Tamaño de símbolo",
      color: "Color",
      alpha: "Alfa",
      outlineColor: "Color del contorno",
      outlineWidth: "Ancho de contorno",
      style: "Estilo",
      width: "Ancho",
      text: "Texto",
      fontColor: "Color de fuente",
      fontSize: "Tamaño de fuente",
      transparency: "Transparencia",
      solid: "Continuo",
      dash: "Guion",
      dot: "Punto",
      dashDot: "Guion Punto",
      dashDotDot: "Guion Punto Punto"
    },
    transparency: {
      opaque: "Opaco",
      transparent: "Transparente"
    },
    rendererChooser: {
      domain: "Dominio",
      use: "Usar",
      singleSymbol: "Un símbolo único",
      uniqueSymbol: "Símbolos únicos",
      color: "Color",
      size: "Tamaño",
      toShow: "Mostrar",
      colors: "Colores",
      classes: "Clases",
      symbolSize: "Tamaño de símbolo",
      addValue: "Agregar valor",
      setDefaultSymbol: "Establecer símbolo predeterminado",
      defaultSymbol: "Símbolo predeterminado",
      selectedSymbol: "Símbolo seleccionado",
      value: "Valor",
      label: "Etiqueta",
      range: "Alcance"
    },
    drawBox: {
      point: "Punto",
      line: "Línea",
      polyline: "Polilínea",
      freehandPolyline: "Polilínea a mano alzada",
      triangle: "Triángulo",
      extent: "Extensión",
      circle: "Círculo",
      ellipse: "Elipse",
      polygon: "Polígono",
      freehandPolygon: "Polígono a mano alzada",
      text: "Texto",
      clear: "Borrar"
    },
    popupConfig: {
      title: "Título",
      add: "Agregar",
      fields: "Campos",
      noField: "Sin campo",
      visibility: "Visible",
      name: "Nombre",
      alias: "Alias",
      actions: "Acciones"
    },
    includeButton: {
      include: "Incluir"
    },
    loadingShelter: {
      loading: "Cargando"
    },
    basicServiceBrowser: {
      noServicesFound: "Ningún servicio encontrado.",
      unableConnectTo: "No se puede conectar a",
      invalidUrlTip: "La URL que has introducido no es válida o no se puede acceder a ella."
    },
    serviceBrowser: {
      noGpFound: "Ningún servicio de geoprocesamiento encontrado.",
      unableConnectTo: "No se puede conectar a"
    },
    layerServiceBrowser: {
      noServicesFound: "Ningún servicio de mapas o entidades encontrado",
      unableConnectTo: "No se puede conectar a"
    },
    basicServiceChooser: {
      validate: "Validar",
      example: "Ejemplo",
      set: "Establecer"
    },
    urlInput: {
      invalidUrl: "URL no válida."
    },
    urlComboBox: {
      invalidUrl: "URL no válida."
    },
    filterBuilder: {
      addAnotherExpression: "Agregar una expresión de filtro",
      addSet: "Agregar un conjunto de expresiones",
      matchMsg: "Obtener entidades de la capa que coincidan con ${any_or_all} de las expresiones siguientes",
      matchMsgSet: "${any_or_all} de las expresiones siguientes de este conjunto son verdaderas",
      all: "Todo",
      any: "Cualquiera de",
      value: "Valor",
      field: "Campo",
      unique: "Único",
      none: "Ninguno",
      and: "y",
      valueTooltip: "Introduce un valor",
      fieldTooltip: "Seleccionar en un campo existente",
      uniqueValueTooltip: "Seleccionar entre los valores únicos del campo seleccionado",
      stringOperatorIs: "es", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "no es",
      stringOperatorStartsWith: "comienza por",
      stringOperatorEndsWith: "termina en",
      stringOperatorContains: "contiene",
      stringOperatorDoesNotContain: "no contiene",
      stringOperatorIsBlank: "está vacío",
      stringOperatorIsNotBlank: "no está vacío",
      dateOperatorIsOn: "es el", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "no es el",
      dateOperatorIsBefore: "es anterior a",
      dateOperatorIsAfter: "es posterior a",
      dateOperatorDays: "días",
      dateOperatorWeeks: "semanas", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "meses",
      dateOperatorInTheLast: "es el último",
      dateOperatorNotInTheLast: "no es el último",
      dateOperatorIsBetween: "está entre",
      dateOperatorIsNotBetween: "no está entre",
      dateOperatorIsBlank: "está vacío",
      dateOperatorIsNotBlank: "no está vacío",
      numberOperatorIs: "es", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "no es",
      numberOperatorIsAtLeast: "es como mínimo",
      numberOperatorIsLessThan: "es menos que",
      numberOperatorIsAtMost: "es como máximo",
      numberOperatorIsGreaterThan: "es mayor que",
      numberOperatorIsBetween: "está entre",
      numberOperatorIsNotBetween: "no está entre",
      numberOperatorIsBlank: "está vacío",
      numberOperatorIsNotBlank: "no está vacío",
      string: "Cadena de caracteres",
      number: "Número",
      date: "Fecha",
      askForValues: "Pedir valores",
      prompt: "Indicación",
      hint: "Sugerencia",
      error: {
        invalidParams: "Parámetros no válidos.",
        invalidUrl: "URL no válida.",
        noFilterFields: "La capa no tiene ningún campo que se pueda utilizar para el filtro.",
        invalidSQL: "Expresión SQL no válida.",
        cantParseSQL: "No se puede analizar la expresión SQL."
      },
      caseSensitive: "Distinguir mayúsculas de minúsculas",
      notSupportCaseSensitiveTip: "Los servicios alojados no admiten consultas que distingan mayúsculas de minúsculas."
    },

    featureLayerSource: {
      layer: "Capa",
      browse: "Examinar",
      selectFromMap: "Seleccionar en el mapa",
      selectFromPortal: "Agregar desde Portal for ArcGIS",
      addServiceUrl: "Agregar URL de servicio",
      inputLayerUrl: "Introducir URL de capa",
      selectLayer: "Selecciona una capa de entidades en el mapa actual.",
      chooseItem: "Elige un elemento de capa de entidades.",
      setServiceUrl: "Introduce la dirección URL del servicio de entidades o servicio de mapa.",
      selectFromOnline: "Agregar desde ArcGIS Online",
      chooseLayer: "Elige una capa de entidades."
    },
    queryableLayerSource: {
      layer: "Capa",
      browse: "Examinar",
      selectFromMap: "Seleccionar en el mapa",
      selectFromPortal: "Agregar desde Portal for ArcGIS",
      addServiceUrl: "Agregar URL de servicio",
      inputLayerUrl: "Introducir URL de capa",
      selectLayer: "Selecciona una capa del mapa actual.",
      chooseItem: "Selecciona un elemento.",
      setServiceUrl: "Introduce la dirección URL del servicio.",
      selectFromOnline: "Agregar desde ArcGIS Online",
      chooseLayer: "Elegir una capa."
    },
    gpSource: {
      selectFromPortal: "Agregar desde Portal for ArcGIS",
      addServiceUrl: "Agregar URL de servicio",
      selectFromOnline: "Agregar desde ArcGIS Online",
      setServiceUrl: "Introduce la URL del servicio de geoprocesamiento.",
      chooseItem: "Elige un elemento de servicio de geoprocesamiento.",
      chooseTask: "Elige una tarea de geoprocesamiento."
    },
    itemSelector: {
      map: "Mapa",
      selectWebMap: "Elegir mapa web",
      addMapFromOnlineOrPortal: "Busca y agrega un mapa web en la aplicación desde los recursos públicos de ArcGIS Online o tu contenido privado en ArcGIS Online o Portal.",
      searchMapName: "Buscar por nombre de mapa...",
      searchNone: "No hemos podido encontrar lo que buscas. Inténtalo de nuevo.",
      groups: "Grupos",
      noneGroups: "No hay grupos",
      signInTip: "Tu inicio de sesión ha expirado, actualiza el navegador para iniciar sesión de nuevo en tu portal.",
      signIn: "Iniciar sesión",
      publicMap: "Público",
      myOrganization: "Mi organización",
      myGroup: "Mis grupos",
      myContent: "Mi contenido",
      count: "Recuento",
      fromPortal: "desde Portal",
      fromOnline: "desde ArcGIS.com",
      noneThumbnail: "Miniatura no disponible",
      owner: "propietario",
      signInTo: "Iniciar sesión en",
      lastModified: "Última modificación",
      moreDetails: "Más detalles"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Este servicio no admite consultas."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "No hay ninguna capa adecuada disponible en el mapa."
    },
    layerInfosMenu: {
      titleBasemap: "Mapas base",
      titleLayers: "Capas operativas",
      labelLayer: "Nombre de capa",
      itemZoomTo: "Acercar a",
      itemTransparency: "Transparencia",
      itemTransparent: "Transparente",
      itemOpaque: "Opaco",
      itemMoveUp: "Mover hacia arriba",
      itemMoveDown: "Mover hacia abajo",
      itemDesc: "Descripción",
      itemDownload: "Descargar",
      itemToAttributeTable: "Abrir tabla de atributos"
    },
    imageChooser: {
      unsupportReaderAPI: "TAREA PENDIENTE: el navegador no admite la API del lector de archivos",
      readError: "Error al leer el archivo.",
      unknowError: "no se pueden completar las operaciones",
      invalidType: "Tipo de archivo no válido.",
      exceed: "El tamaño de archivo no puede sobrepasar los 1024 KB",
      enableFlash: "TAREA PENDIENTE: habilita flash.",
      cropWaining: "Selecciona una foto que tenga por lo menos ${width} x ${height} píxeles.",
      toolTip: "Para obtener el mejor resultado, la imagen debe tener ${width} píxeles de ancho y ${height} píxeles de alto. El resto de tamaños se adaptará a este tamaño. Los formatos de imagen válidos son: PNG, GIF y JPEG."
    },
    simpleTable: {
      moveUp: "Mover hacia arriba",
      moveDown: "Mover hacia abajo",
      deleteRow: "Eliminar",
      edit: "Editar"
    },
    urlParams: {
      invalidToken: "Token no válido",
      validateTokenError: "Token no válido o error de red"
    },
    exportTo: {
      exportTo: "Exportar",
      toCSV: "Exportar a archivo CSV",
      toFeatureCollection: "Exportar a un conjunto de entidades",
      toGeoJSON: "Exportar a GeoJSON"
    }
  })
);