define(
   ({
    common: {
      ok: "OK",
      cancel: "Отмена",
      next: "Далее",
      back: "Назад"
    },
    errorCode: "Код",
    errorMessage: "Сообщение",
    errorDetail: "Подробности",
    widgetPlaceholderTooltip: "Чтобы настроить его, перейдите в Виджеты и щелкните соответствующий ограничитель",
    symbolChooser: {
      preview: "Просмотр",
      basic: "Базовый",
      arrows: "Стрелки",
      business: "Бизнес",
      cartographic: "Картография",
      nationalParkService: "Служба национальных парков",
      outdoorRecreation: "Отдых на свежем воздухе",
      peoplePlaces: "Общественные места",
      safetyHealth: "Безопасность, здоровье",
      shapes: "Формы",
      transportation: "Транспорт",
      symbolSize: "Размер символа",
      color: "Цвет",
      alpha: "Альфа",
      outlineColor: "Цвет контура",
      outlineWidth: "Ширина контура",
      style: "Стиль",
      width: "Ширина",
      text: "Текст",
      fontColor: "Цвет шрифта",
      fontSize: "Размер шрифта",
      transparency: "Прозрачность",
      solid: "Заливка",
      dash: "Тире",
      dot: "Точка",
      dashDot: "Тире-точка",
      dashDotDot: "Тире-точка-точка"
    },
    transparency: {
      opaque: "Непрозрачный",
      transparent: "Прозрачный"
    },
    rendererChooser: {
      domain: "Домен",
      use: "Использовать",
      singleSymbol: "Единый символ",
      uniqueSymbol: "Уникальные символы",
      color: "Цвет",
      size: "Размер",
      toShow: "Отображать",
      colors: "Цвета",
      classes: "Классы",
      symbolSize: "Размер символа",
      addValue: "Добавить значение",
      setDefaultSymbol: "Настроить символ по умолчанию",
      defaultSymbol: "Символ по умолчанию",
      selectedSymbol: "Выбранный символ",
      value: "Значение",
      label: "Надпись",
      range: "Диапазон"
    },
    drawBox: {
      point: "Точка",
      line: "Линия",
      polyline: "Линия",
      freehandPolyline: "Линия произвольной формы",
      triangle: "Треугольник",
      extent: "Экстент",
      circle: "Круг",
      ellipse: "Эллипс",
      polygon: "Полигон",
      freehandPolygon: "Полигон произвольной формы",
      text: "Текст",
      clear: "Очистить"
    },
    popupConfig: {
      title: "Заголовок",
      add: "Добавить",
      fields: "Поля",
      noField: "Нет поля",
      visibility: "Видимый",
      name: "Имя",
      alias: "Псевдоним",
      actions: "Действия"
    },
    includeButton: {
      include: "Включить"
    },
    loadingShelter: {
      loading: "Загрузка"
    },
    basicServiceBrowser: {
      noServicesFound: "Сервисы не были найдены.",
      unableConnectTo: "Не удается подключиться к",
      invalidUrlTip: "Введенный URL-адрес недопустим или недоступен."
    },
    serviceBrowser: {
      noGpFound: "Сервисы геообработки не найдены.",
      unableConnectTo: "Не удается подключиться к"
    },
    layerServiceBrowser: {
      noServicesFound: "Картографические сервисы или сервисы пространственных объектов не найдены",
      unableConnectTo: "Не удается подключиться к"
    },
    basicServiceChooser: {
      validate: "Проверить",
      example: "Пример",
      set: "Задать"
    },
    urlInput: {
      invalidUrl: "Недопустимый URL-адрес."
    },
    urlComboBox: {
      invalidUrl: "Недопустимый URL-адрес."
    },
    filterBuilder: {
      addAnotherExpression: "Добавить выражение фильтра",
      addSet: "Добавить набор выражений",
      matchMsg: "Получить объекты слоя, которые соответствуют ${any_or_all} из следующих выражений",
      matchMsgSet: "${any_or_all} из следующих выражений в этом наборе равно true",
      all: "все",
      any: "Любые",
      value: "Значение",
      field: "Поле",
      unique: "Уникальное",
      none: "Нет",
      and: "и",
      valueTooltip: "Введите значение",
      fieldTooltip: "Выбрать из существующего поля",
      uniqueValueTooltip: "Выбрать из уникальных значений в выбранном поле",
      stringOperatorIs: "соответствует", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "не соответствует",
      stringOperatorStartsWith: "начинается с",
      stringOperatorEndsWith: "заканчивается",
      stringOperatorContains: "содержит",
      stringOperatorDoesNotContain: "не содержит",
      stringOperatorIsBlank: "является пустым",
      stringOperatorIsNotBlank: "не является пустым",
      dateOperatorIsOn: "соответствует", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "не соответствует",
      dateOperatorIsBefore: "перед",
      dateOperatorIsAfter: "после",
      dateOperatorDays: "дней",
      dateOperatorWeeks: "недель", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "месяцев",
      dateOperatorInTheLast: "в последние",
      dateOperatorNotInTheLast: "не в последние",
      dateOperatorIsBetween: "между",
      dateOperatorIsNotBetween: "не между",
      dateOperatorIsBlank: "является пустым",
      dateOperatorIsNotBlank: "не является пустым",
      numberOperatorIs: "соответствует", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "не соответствует",
      numberOperatorIsAtLeast: "больше или равно",
      numberOperatorIsLessThan: "меньше чем",
      numberOperatorIsAtMost: "меньше или равно",
      numberOperatorIsGreaterThan: "больше чем",
      numberOperatorIsBetween: "между",
      numberOperatorIsNotBetween: "не между",
      numberOperatorIsBlank: "является пустым",
      numberOperatorIsNotBlank: "не является пустым",
      string: "Строка",
      number: "Число",
      date: "Дата",
      askForValues: "Запросить значения",
      prompt: "Рекомендация",
      hint: "Подсказка",
      error: {
        invalidParams: "Некорректные параметры.",
        invalidUrl: "Недопустимый URL-адрес.",
        noFilterFields: "Слой не имеет полей, которые могут использоваться для фильтрации.",
        invalidSQL: "Некорректное sql выражение.",
        cantParseSQL: "Не возможно разобрать sql выражение."
      },
      caseSensitive: "Учитывать регистр",
      notSupportCaseSensitiveTip: "Опубликованные сервисы не поддерживают запрос с чувствительностью к регистру."
    },

    featureLayerSource: {
      layer: "Слой",
      browse: "Обзор",
      selectFromMap: "Выбрать с карты",
      selectFromPortal: "Добавить с Portal for ArcGIS",
      addServiceUrl: "Добавить URL-адрес сервиса",
      inputLayerUrl: "URL-адрес входного слоя",
      selectLayer: "Выбрать слой объектов на текущей карте.",
      chooseItem: "Выбрать элемент слоя объектов.",
      setServiceUrl: "Введите URL-адрес сервиса объектов или картографического сервиса.",
      selectFromOnline: "Добавить с ArcGIS Online",
      chooseLayer: "Выберите векторный слой."
    },
    queryableLayerSource: {
      layer: "Слой",
      browse: "Обзор",
      selectFromMap: "Выбрать с карты",
      selectFromPortal: "Добавить с Portal for ArcGIS",
      addServiceUrl: "Добавить URL-адрес сервиса",
      inputLayerUrl: "URL-адрес входного слоя",
      selectLayer: "Выбрать слой из текущей карты.",
      chooseItem: "Выбрать элемент.",
      setServiceUrl: "Ввести URL сервиса.",
      selectFromOnline: "Добавить с ArcGIS Online",
      chooseLayer: "Выбор слоя."
    },
    gpSource: {
      selectFromPortal: "Добавить с Portal for ArcGIS",
      addServiceUrl: "Добавить URL сервиса",
      selectFromOnline: "Добавить с ArcGIS Online",
      setServiceUrl: "Введите URL-адрес сервиса геообработки.",
      chooseItem: "Выберите элемент сервиса геообработки.",
      chooseTask: "Выберите задачу геообработки."
    },
    itemSelector: {
      map: "Карта",
      selectWebMap: "Выбрать веб-карту",
      addMapFromOnlineOrPortal: "Найти и добавить в приложение веб-карты из открытых ресурсов ArcGIS Online или собственных частных ресурсов ArcGIS Online или Portal.",
      searchMapName: "Поиск по названию карты...",
      searchNone: "Мы не смогли найти то, что вы искали. Пожалуйста, попробуйте снова.",
      groups: "Группы",
      noneGroups: "Нет групп",
      signInTip: "Ваш сеанс работы под данной учетной записью истек, обновите свой браузер, чтобы войти в портал снова.",
      signIn: "Войти",
      publicMap: "Для всех",
      myOrganization: "Моя организация",
      myGroup: "Мои группы",
      myContent: "Мои ресурсы",
      count: "Число",
      fromPortal: "из Portal",
      fromOnline: "из ArcGIS.com",
      noneThumbnail: "Образец недоступен",
      owner: "владелец",
      signInTo: "Войти в",
      lastModified: "Последние изменения",
      moreDetails: "Подробнее"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Сервис не поддерживает запросы."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "На карте нет доступного подходящего слоя."
    },
    layerInfosMenu: {
      titleBasemap: "Базовые карты",
      titleLayers: "Рабочие слои",
      labelLayer: "Имя слоя",
      itemZoomTo: "Приблизить к",
      itemTransparency: "Прозрачность",
      itemTransparent: "Прозрачный",
      itemOpaque: "Непрозрачный",
      itemMoveUp: "Выше",
      itemMoveDown: "Ниже",
      itemDesc: "Описание",
      itemDownload: "Загрузить",
      itemToAttributeTable: "Открыть таблицу атрибутов"
    },
    imageChooser: {
      unsupportReaderAPI: "TODO: Браузер не поддерживает API чтения файлов",
      readError: "Не удалось считать файл.",
      unknowError: "невозможно завершить операции",
      invalidType: "Недопустимый тип файла.",
      exceed: "Размер файла не может превышать 1024 КБ",
      enableFlash: "TODO: включите флеш.",
      cropWaining: "Выберите фото размером как минимум ${ширина} x ${высота} пикселов.",
      toolTip: "Для получения наилучших результатов, изображение должно быть ${width} пикселов шириной и ${height} пикселов высотой. Изображения других размеров будут настроены. Допустимые форматы изображений: PNG, GIF и JPEG."
    },
    simpleTable: {
      moveUp: "Выше",
      moveDown: "Ниже",
      deleteRow: "Удалить",
      edit: "Редактировать"
    },
    urlParams: {
      invalidToken: "Неверный токен",
      validateTokenError: "Недопустимый токен или ошибка сети"
    },
    exportTo: {
      exportTo: "Экспорт",
      toCSV: "Экспорт в файл CSV",
      toFeatureCollection: "Экспорт в Коллекцию объектов",
      toGeoJSON: "Экспорт в GeoJSON"
    }
  })
);