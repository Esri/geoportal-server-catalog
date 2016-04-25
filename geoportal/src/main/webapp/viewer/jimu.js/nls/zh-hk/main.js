define(
   ({
    common: {
      ok: "確定",
      cancel: "取消",
      next: "下一步",
      back: "上一步"
    },
    errorCode: "代碼",
    errorMessage: "訊息",
    errorDetail: "詳細資訊",
    widgetPlaceholderTooltip: "要進行設置，請轉到 widget 並按一下相應占位符",
    symbolChooser: {
      preview: "預覽",
      basic: "Basic",
      arrows: "箭頭",
      business: "商業",
      cartographic: "製圖",
      nationalParkService: "國家公園管理局",
      outdoorRecreation: "戶外娛樂",
      peoplePlaces: "人員位置",
      safetyHealth: "安全健康",
      shapes: "形狀",
      transportation: "交通運輸",
      symbolSize: "符號大小",
      color: "顏色",
      alpha: "Alpha",
      outlineColor: "輪廓顏色",
      outlineWidth: "輪廓寬度",
      style: "樣式",
      width: "寬度",
      text: "文字",
      fontColor: "字型顏色",
      fontSize: "字型大小",
      transparency: "透明度",
      solid: "實線",
      dash: "虛線",
      dot: "點",
      dashDot: "虛線",
      dashDotDot: "虛線點點"
    },
    transparency: {
      opaque: "不透明",
      transparent: "透明"
    },
    rendererChooser: {
      domain: "領域",
      use: "使用",
      singleSymbol: "單一符號",
      uniqueSymbol: "唯一符號",
      color: "顏色",
      size: "大小",
      toShow: "顯示",
      colors: "顏色",
      classes: "類別",
      symbolSize: "符號大小",
      addValue: "新增值",
      setDefaultSymbol: "設定預設符號",
      defaultSymbol: "預設符號",
      selectedSymbol: "所選符號",
      value: "值",
      label: "標籤",
      range: "範圍"
    },
    drawBox: {
      point: "點",
      line: "線",
      polyline: "折線",
      freehandPolyline: "手繪折線",
      triangle: "三角形",
      extent: "範圍",
      circle: "圓形",
      ellipse: "橢圓",
      polygon: "面",
      freehandPolygon: "手繪面",
      text: "文字",
      clear: "清除"
    },
    popupConfig: {
      title: "標題",
      add: "新增",
      fields: "欄位",
      noField: "無欄位",
      visibility: "可見",
      name: "名稱",
      alias: "別名",
      actions: "操作"
    },
    includeButton: {
      include: "包含"
    },
    loadingShelter: {
      loading: "正在載入"
    },
    basicServiceBrowser: {
      noServicesFound: "找不到任何服務。",
      unableConnectTo: "無法連接至",
      invalidUrlTip: "您輸入的 URL 無效或不可存取。"
    },
    serviceBrowser: {
      noGpFound: "未找到任何地理處理服務。",
      unableConnectTo: "無法連接至"
    },
    layerServiceBrowser: {
      noServicesFound: "未找到任何地圖服務或圖徵服務",
      unableConnectTo: "無法連接至"
    },
    basicServiceChooser: {
      validate: "驗證",
      example: "範例",
      set: "設置"
    },
    urlInput: {
      invalidUrl: "URL 無效。"
    },
    urlComboBox: {
      invalidUrl: "URL 無效。"
    },
    filterBuilder: {
      addAnotherExpression: "新增篩選表達式",
      addSet: "新增表達式集合",
      matchMsg: "取得圖層中與以下 ${any_or_all} 表達式相符的圖徵",
      matchMsgSet: "此集合中的以下 ${any_or_all} 表達式為 true",
      all: "全部",
      any: "任意",
      value: "值",
      field: "欄位",
      unique: "唯一",
      none: "無",
      and: "與",
      valueTooltip: "輸入值",
      fieldTooltip: "從現有欄位中選擇",
      uniqueValueTooltip: "從所選欄位的唯一值中選擇",
      stringOperatorIs: "等於", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "不等於",
      stringOperatorStartsWith: "開頭是",
      stringOperatorEndsWith: "結尾是",
      stringOperatorContains: "包含",
      stringOperatorDoesNotContain: "不包含",
      stringOperatorIsBlank: "為空",
      stringOperatorIsNotBlank: "不為空",
      dateOperatorIsOn: "在", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "不在",
      dateOperatorIsBefore: "早於",
      dateOperatorIsAfter: "晚於",
      dateOperatorDays: "天",
      dateOperatorWeeks: "週", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "月",
      dateOperatorInTheLast: "最後",
      dateOperatorNotInTheLast: "不是最後",
      dateOperatorIsBetween: "介於",
      dateOperatorIsNotBetween: "不介於",
      dateOperatorIsBlank: "為空",
      dateOperatorIsNotBlank: "不為空",
      numberOperatorIs: "等於", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "不等於",
      numberOperatorIsAtLeast: "最小為",
      numberOperatorIsLessThan: "小於",
      numberOperatorIsAtMost: "最大為",
      numberOperatorIsGreaterThan: "大於",
      numberOperatorIsBetween: "介於",
      numberOperatorIsNotBetween: "不介於",
      numberOperatorIsBlank: "為空",
      numberOperatorIsNotBlank: "不為空",
      string: "字串",
      number: "編號",
      date: "日期",
      askForValues: "請求值",
      prompt: "提示",
      hint: "提示",
      error: {
        invalidParams: "無效的參數。",
        invalidUrl: "無效的 URL。",
        noFilterFields: "圖層不包含可用於篩選的欄位。",
        invalidSQL: "SQL 表達式無效。",
        cantParseSQL: "無法解析 SQL 表達式。"
      },
      caseSensitive: "區分大小寫",
      notSupportCaseSensitiveTip: "託管的服務不支援區分大小寫的查詢。"
    },

    featureLayerSource: {
      layer: "圖層",
      browse: "瀏覽",
      selectFromMap: "從地圖中選擇",
      selectFromPortal: "從 Portal for ArcGIS 新增",
      addServiceUrl: "新增服務 URL",
      inputLayerUrl: "輸入圖層 URL",
      selectLayer: "從目前地圖中選擇圖徵圖層。",
      chooseItem: "選擇圖徵圖層項目。",
      setServiceUrl: "輸入圖徵服務 URL 或地圖服務。",
      selectFromOnline: "從 ArcGIS Online 新增",
      chooseLayer: "選擇圖徵圖層。"
    },
    queryableLayerSource: {
      layer: "圖層",
      browse: "瀏覽",
      selectFromMap: "從地圖中選擇",
      selectFromPortal: "從 Portal for ArcGIS 新增",
      addServiceUrl: "新增服務 URL",
      inputLayerUrl: "輸入圖層 URL",
      selectLayer: "從目前地圖中選擇圖層。",
      chooseItem: "選擇項目。",
      setServiceUrl: "輸入服務的 URL。",
      selectFromOnline: "從 ArcGIS Online 新增",
      chooseLayer: "選擇圖層。"
    },
    gpSource: {
      selectFromPortal: "從 Portal for ArcGIS 新增",
      addServiceUrl: "新增服務 URL",
      selectFromOnline: "從 ArcGIS Online 新增",
      setServiceUrl: "輸入地理處理服務的 URL。",
      chooseItem: "選擇地理處理服務項目。",
      chooseTask: "選擇地理處理任務。"
    },
    itemSelector: {
      map: "地圖",
      selectWebMap: "選擇 Web 地圖",
      addMapFromOnlineOrPortal: "從 ArcGIS Online 公用資源或 ArcGIS Online 或 Portal 私有內容中尋找，並新增應用程式中的 Web 地圖。",
      searchMapName: "按地圖名稱搜尋...",
      searchNone: "無法找到您正在尋找的內容。請重試。",
      groups: "群組",
      noneGroups: "無任何群組",
      signInTip: "登入工作階段已逾時，請重新整理瀏覽器以重新登入入口網站。",
      signIn: "登入",
      publicMap: "公用",
      myOrganization: "我的組織",
      myGroup: "我的群組",
      myContent: "我的內容",
      count: "計數",
      fromPortal: "從入口網站",
      fromOnline: "從 ArcGIS.com",
      noneThumbnail: "縮圖無法使用",
      owner: "擁有者",
      signInTo: "登入到",
      lastModified: "上次修改時間",
      moreDetails: "更多詳細資訊"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "服務不支援查詢。"
    },
    basicLayerChooserFromMap: {
      noLayersTip: "地圖中不存在可用的相應圖層。"
    },
    layerInfosMenu: {
      titleBasemap: "底圖",
      titleLayers: "操作圖層",
      labelLayer: "圖層名稱",
      itemZoomTo: "縮放至",
      itemTransparency: "透明度",
      itemTransparent: "透明",
      itemOpaque: "不透明",
      itemMoveUp: "上移",
      itemMoveDown: "下移",
      itemDesc: "描述",
      itemDownload: "下載",
      itemToAttributeTable: "打開屬性表"
    },
    imageChooser: {
      unsupportReaderAPI: "待辦：瀏覽器不支援 FileReader API",
      readError: "讀取檔案失敗。",
      unknowError: "無法完成操作",
      invalidType: "無效的檔案類型。",
      exceed: "檔案大小不得超過 1024 KB",
      enableFlash: "待辦：請啟用閃爍。",
      cropWaining: "請選擇至少擁有 ${width} x ${height} 像素的照片。",
      toolTip: "為獲得最佳效果，圖片的寬度應為 ${width} 像素，高度應為 ${height} 像素。其他大小將調整為適應此大小。可接受的圖片格式包括: PNG、GIF 和 JPEG。"
    },
    simpleTable: {
      moveUp: "上移",
      moveDown: "下移",
      deleteRow: "刪除",
      edit: "編輯"
    },
    urlParams: {
      invalidToken: "權杖無效",
      validateTokenError: "權杖無效或網路錯誤"
    },
    exportTo: {
      exportTo: "匯出",
      toCSV: "匯出到 CSV 檔案",
      toFeatureCollection: "匯出至圖徵集合",
      toGeoJSON: "匯出至 GeoJSON"
    }
  })
);