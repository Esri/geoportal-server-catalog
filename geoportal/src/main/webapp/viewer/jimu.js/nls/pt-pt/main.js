define(
   ({
    common: {
      ok: "Ok",
      cancel: "Cancelar",
      next: "Seguinte",
      back: "Regressar"
    },
    errorCode: "Código",
    errorMessage: "Mensagem",
    errorDetail: "Detalhe",
    widgetPlaceholderTooltip: "Para configurar, vá a Widgets e clique no placehorlder correspondente",
    symbolChooser: {
      preview: "Pré-Visualizar",
      basic: "Básico",
      arrows: "Setas",
      business: "Negócio",
      cartographic: "Cartográfico",
      nationalParkService: "Serviço Parque Nacional",
      outdoorRecreation: "Lazer Outdoor",
      peoplePlaces: "Locais de Pessoas",
      safetyHealth: "Segurança Saúde",
      shapes: "Formas",
      transportation: "Transportes",
      symbolSize: "Tamanho de Símbolos",
      color: "Cor",
      alpha: "Alfa",
      outlineColor: "Cor de Contorno",
      outlineWidth: "Largura do Contorno",
      style: "Estilo",
      width: "Largura",
      text: "Texto",
      fontColor: "Cor da Letra",
      fontSize: "Tamanho de letra",
      transparency: "Transparência",
      solid: "Sólido",
      dash: "Traço",
      dot: "Ponto",
      dashDot: "Traço Ponto",
      dashDotDot: "Traço Ponto Ponto"
    },
    transparency: {
      opaque: "Opaco",
      transparent: "Transparente"
    },
    rendererChooser: {
      domain: "Domínio",
      use: "Utilize",
      singleSymbol: "Um Único Símbolo",
      uniqueSymbol: "Símbolos Únicos",
      color: "Cor",
      size: "Tamanho",
      toShow: "Para Exibir",
      colors: "Cores",
      classes: "Classes",
      symbolSize: "Tamanho de Símbolos",
      addValue: "Adicionar Valor",
      setDefaultSymbol: "Definir Símbolo Padrão",
      defaultSymbol: "Símbolo Padrão",
      selectedSymbol: "Símbolo Selecionado",
      value: "Valor",
      label: "Rótulo",
      range: "Intervalo"
    },
    drawBox: {
      point: "Ponto",
      line: "Linha",
      polyline: "Polilinha",
      freehandPolyline: "Polilinha À Mão Livre",
      triangle: "Triângulo",
      extent: "Extensão",
      circle: "Círculo",
      ellipse: "Elipse",
      polygon: "Polígono",
      freehandPolygon: "Polígono À Mão Livre",
      text: "Texto",
      clear: "Limpar"
    },
    popupConfig: {
      title: "Título",
      add: "Adicionar",
      fields: "Campos",
      noField: "Sem Campo",
      visibility: "Visível",
      name: "Nome",
      alias: "Nome Alternativo",
      actions: "Ações"
    },
    includeButton: {
      include: "Incluir"
    },
    loadingShelter: {
      loading: "A carregar"
    },
    basicServiceBrowser: {
      noServicesFound: "Não foram encontrados serviços.",
      unableConnectTo: "Impossível ligar a",
      invalidUrlTip: "O URL que introduziu é inválido ou encontra-se inacessível."
    },
    serviceBrowser: {
      noGpFound: "Não foram encontrados serviços de geoprocessamento.",
      unableConnectTo: "Impossível ligar a"
    },
    layerServiceBrowser: {
      noServicesFound: "Não foram encontrados serviços MapServer ou FeatureServer",
      unableConnectTo: "Impossível ligar a"
    },
    basicServiceChooser: {
      validate: "Validar",
      example: "Exemplo",
      set: "Definir"
    },
    urlInput: {
      invalidUrl: "Url inválido."
    },
    urlComboBox: {
      invalidUrl: "Url inválido."
    },
    filterBuilder: {
      addAnotherExpression: "Adicionar uma expressão de filtro",
      addSet: "Adicionar uma expressão definida",
      matchMsg: "Obter elementos na camada que correspondam a ${any_or_all} das expressões seguintes",
      matchMsgSet: "${any_or_all} (d)as expressões seguintes neste conjunto são verdadeiras",
      all: "Todas",
      any: "Qualquer",
      value: "Valor",
      field: "Campo",
      unique: "Único",
      none: "Nenhum",
      and: "e",
      valueTooltip: "Introduzir valor",
      fieldTooltip: "Escolher a partir de campo existente",
      uniqueValueTooltip: "Escolher a partir de valores únicos no campo selecionado",
      stringOperatorIs: "é", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "não é",
      stringOperatorStartsWith: "começa por",
      stringOperatorEndsWith: "acaba em",
      stringOperatorContains: "contém",
      stringOperatorDoesNotContain: "não contém",
      stringOperatorIsBlank: "está vazio",
      stringOperatorIsNotBlank: "não está vazio",
      dateOperatorIsOn: "é em", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "não é em",
      dateOperatorIsBefore: "é anterior a",
      dateOperatorIsAfter: "é posterior a",
      dateOperatorDays: "dias",
      dateOperatorWeeks: "semanas", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "meses",
      dateOperatorInTheLast: "nos(as) últimos(as)",
      dateOperatorNotInTheLast: "não nos(as) últimos(as)",
      dateOperatorIsBetween: "é entre",
      dateOperatorIsNotBetween: "não é entre",
      dateOperatorIsBlank: "está vazio",
      dateOperatorIsNotBlank: "não está vazio",
      numberOperatorIs: "é", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "não é",
      numberOperatorIsAtLeast: "é no mínimo",
      numberOperatorIsLessThan: "é inferior a",
      numberOperatorIsAtMost: "é no máximo",
      numberOperatorIsGreaterThan: "é superior a",
      numberOperatorIsBetween: "é entre",
      numberOperatorIsNotBetween: "não é entre",
      numberOperatorIsBlank: "está vazio",
      numberOperatorIsNotBlank: "não está vazio",
      string: "Texto",
      number: "Número",
      date: "Data",
      askForValues: "Solicitar valores",
      prompt: "Solicitação",
      hint: "Dica",
      error: {
        invalidParams: "Parâmetros inválidos.",
        invalidUrl: "Url inválido.",
        noFilterFields: "A camada não tem quaisquer campos que possam ser utilizados para filtragem.",
        invalidSQL: "Expressão sql inválida.",
        cantParseSQL: "Impossível analisar a expressão sql."
      },
      caseSensitive: "Diferencia Tamanho de Letra",
      notSupportCaseSensitiveTip: "Os serviços alojados não suportam consultas que diferenciam maiúsculas de minúsculas."
    },

    featureLayerSource: {
      layer: "Camada",
      browse: "Procurar",
      selectFromMap: "Selecionar do Mapa",
      selectFromPortal: "Adicionar do Portal for ArcGIS",
      addServiceUrl: "Adicionar URL de Serviço",
      inputLayerUrl: "Url da Camada de Entrada",
      selectLayer: "Selecionar uma camada de elementos do mapa atual.",
      chooseItem: "Escolher um item da camada de elementos.",
      setServiceUrl: "Introduzir o URL do serviço de elementos ou serviço de mapa.",
      selectFromOnline: "Adicionar de ArcGIS Online",
      chooseLayer: "Escolha uma camada de elementos."
    },
    queryableLayerSource: {
      layer: "Camada",
      browse: "Procurar",
      selectFromMap: "Selecionar do Mapa",
      selectFromPortal: "Adicionar do Portal for ArcGIS",
      addServiceUrl: "Adicionar URL de Serviço",
      inputLayerUrl: "Url da Camada de Entrada",
      selectLayer: "Seleccionar uma camada do mapa actual.",
      chooseItem: "Escolher um item.",
      setServiceUrl: "Introduza o URL do serviço.",
      selectFromOnline: "Adicionar de ArcGIS Online",
      chooseLayer: "Escolher uma camada."
    },
    gpSource: {
      selectFromPortal: "Adicionar do Portal for ArcGIS",
      addServiceUrl: "Adicionar URL de Serviço",
      selectFromOnline: "Adicionar de ArcGIS Online",
      setServiceUrl: "Introduza o URL do serviço de geoprocessamento.",
      chooseItem: "Escolha um item de serviço de geoprocessamento.",
      chooseTask: "Escolha uma tarefa de geoprocessamento."
    },
    itemSelector: {
      map: "Mapa",
      selectWebMap: "Selecionar Mapa Web",
      addMapFromOnlineOrPortal: "Encontre e adicione um mapa web na aplicação a partir dos recursos públicos ArcGIS Online ou do seu conteúdo privado, no ArcGIS Online ou no Portal.",
      searchMapName: "Pesquisar por nome do mapa...",
      searchNone: "Não conseguimos encontrar aquilo que procura. Por favor, tente outra pesquisa.",
      groups: "Grupos",
      noneGroups: "Sem grupos",
      signInTip: "Por favor, inicie sessão para aceder ao seu conteúdo privado.",
      signIn: "Iniciar sessão",
      publicMap: "Público",
      myOrganization: "A Organização",
      myGroup: "Os Meus Grupos",
      myContent: "O Meu Conteúdo",
      count: "Contagem",
      fromPortal: "do Portal",
      fromOnline: "de ArcGIS.com",
      noneThumbnail: "Imagem Miniatura Indisponível",
      owner: "proprietário",
      signInTo: "Iniciar sessão em",
      lastModified: "Última Modificação",
      moreDetails: "Mais Detalhes"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "O serviço não suporta consultas."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Não existe uma camada apropriada disponível no mapa."
    },
    layerInfosMenu: {
      titleBasemap: "Mapas base",
      titleLayers: "Camadas Operacionais",
      labelLayer: "Nome da Camada",
      itemZoomTo: "Efetuar zoom para",
      itemTransparency: "Transparência",
      itemTransparent: "Transparente",
      itemOpaque: "Opaco",
      itemMoveUp: "Mover para cima",
      itemMoveDown: "Mover para baixo",
      itemDesc: "Descrição",
      itemDownload: "Descarregar",
      itemToAttributeTable: "Abrir tabela de atributos"
    },
    imageChooser: {
      unsupportReaderAPI: "TODO: O navegador não suporta o API de leitor de ficheiros",
      readError: "Falha ao ler o ficheiro.",
      unknowError: "impossível completar operações",
      invalidType: "Tipo de ficheiro inválido.",
      exceed: "O tamanho do ficheiro não pode exceder 1024 KB",
      enableFlash: "TODO: por favor, ative o flash.",
      cropWaining: "Por favor escolha uma fotografa que tenha pelo menos ${largura} x ${altura} pixels.",
      toolTip: "Para obter melhores resultados, a imagem deverá ter ${width} pixéis de largura por ${height} pixéis de altura. Outros tamanhos serão ajustados para caberem. Os formatos de imagem aceitáveis são: PNG, GIF e JPEG."
    },
    simpleTable: {
      moveUp: "Mover para cima",
      moveDown: "Mover para baixo",
      deleteRow: "Eliminar",
      edit: "Editar"
    },
    urlParams: {
      invalidToken: "Token inválido",
      validateTokenError: "Token inválido ou erro de Rede"
    },
    exportTo: {
      exportTo: "Exportar",
      toCSV: "Exportar para ficheiro CSV",
      toFeatureCollection: "Exportar para Coleção de Elementos",
      toGeoJSON: "Exportar para GeoJSON"
    }
  })
);