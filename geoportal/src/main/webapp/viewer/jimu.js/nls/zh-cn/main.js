define(
   ({
    common: {
      ok: "确定",
      cancel: "取消",
      next: "下一步",
      back: "返回"
    },
    errorCode: "代码",
    errorMessage: "消息",
    errorDetail: "详细信息",
    widgetPlaceholderTooltip: "要进行设置，请转到微件并单击相应占位控件",
    symbolChooser: {
      preview: "预览",
      basic: "基本形状",
      arrows: "箭头",
      business: "商业",
      cartographic: "制图",
      nationalParkService: "国家公园管理局",
      outdoorRecreation: "户外娱乐",
      peoplePlaces: "人员位置",
      safetyHealth: "安全健康",
      shapes: "形状",
      transportation: "交通运输",
      symbolSize: "符号大小",
      color: "颜色",
      alpha: "透明度",
      outlineColor: "轮廓颜色",
      outlineWidth: "轮廓宽度",
      style: "样式",
      width: "宽度",
      text: "文本",
      fontColor: "字体颜色",
      fontSize: "字号",
      transparency: "透明度",
      solid: "实线",
      dash: "虚线",
      dot: "点",
      dashDot: "点划线",
      dashDotDot: "双点划线"
    },
    transparency: {
      opaque: "不透明",
      transparent: "透明"
    },
    rendererChooser: {
      domain: "属性域",
      use: "使用",
      singleSymbol: "单一符号",
      uniqueSymbol: "唯一符号",
      color: "颜色",
      size: "大小",
      toShow: "显示",
      colors: "颜色",
      classes: "类别",
      symbolSize: "符号大小",
      addValue: "添加值",
      setDefaultSymbol: "设置默认符号",
      defaultSymbol: "默认符号",
      selectedSymbol: "所选符号",
      value: "值",
      label: "标注",
      range: "范围"
    },
    drawBox: {
      point: "点",
      line: "线",
      polyline: "折线",
      freehandPolyline: "手绘折线",
      triangle: "三角形",
      extent: "矩形",
      circle: "圆形",
      ellipse: "椭圆",
      polygon: "面",
      freehandPolygon: "手绘面",
      text: "文本",
      clear: "清除"
    },
    popupConfig: {
      title: "标题",
      add: "添加",
      fields: "字段",
      noField: "无字段",
      visibility: "可见",
      name: "名称",
      alias: "别名",
      actions: "操作"
    },
    includeButton: {
      include: "包含"
    },
    loadingShelter: {
      loading: "正在加载"
    },
    basicServiceBrowser: {
      noServicesFound: "未找到任何服务。",
      unableConnectTo: "无法连接至",
      invalidUrlTip: "您输入的 URL 无效或不可访问。"
    },
    serviceBrowser: {
      noGpFound: "未找到任何地理处理服务。",
      unableConnectTo: "无法连接至"
    },
    layerServiceBrowser: {
      noServicesFound: "未找到任何地图服务或要素服务",
      unableConnectTo: "无法连接至"
    },
    basicServiceChooser: {
      validate: "验证",
      example: "示例",
      set: "集合"
    },
    urlInput: {
      invalidUrl: "URL 无效。"
    },
    urlComboBox: {
      invalidUrl: "URL 无效。"
    },
    filterBuilder: {
      addAnotherExpression: "添加过滤表达式",
      addSet: "添加表达式集合",
      matchMsg: "获取图层中与以下 ${any_or_all} 表达式相匹配的要素",
      matchMsgSet: "此集合中的以下 ${any_or_all} 表达式为 true",
      all: "全部",
      any: "任一",
      value: "值",
      field: "字段",
      unique: "唯一值",
      none: "无",
      and: "和",
      valueTooltip: "输入值",
      fieldTooltip: "从现有字段中选择",
      uniqueValueTooltip: "从所选字段的唯一值中选择",
      stringOperatorIs: "等于", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "不等于",
      stringOperatorStartsWith: "开头是",
      stringOperatorEndsWith: "结尾是",
      stringOperatorContains: "包含",
      stringOperatorDoesNotContain: "不包含",
      stringOperatorIsBlank: "为空",
      stringOperatorIsNotBlank: "不为空",
      dateOperatorIsOn: "在", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "不在",
      dateOperatorIsBefore: "早于",
      dateOperatorIsAfter: "晚于",
      dateOperatorDays: "天",
      dateOperatorWeeks: "周", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "月",
      dateOperatorInTheLast: "最后",
      dateOperatorNotInTheLast: "不是最后",
      dateOperatorIsBetween: "介于",
      dateOperatorIsNotBetween: "不介于",
      dateOperatorIsBlank: "为空",
      dateOperatorIsNotBlank: "不为空",
      numberOperatorIs: "等于", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "不等于",
      numberOperatorIsAtLeast: "最小为",
      numberOperatorIsLessThan: "小于",
      numberOperatorIsAtMost: "最大为",
      numberOperatorIsGreaterThan: "大于",
      numberOperatorIsBetween: "介于",
      numberOperatorIsNotBetween: "不介于",
      numberOperatorIsBlank: "为空",
      numberOperatorIsNotBlank: "不为空",
      string: "字符串型",
      number: "数值",
      date: "日期",
      askForValues: "请求值",
      prompt: "提示",
      hint: "提示",
      error: {
        invalidParams: "参数无效。",
        invalidUrl: "URL 无效。",
        noFilterFields: "图层不包含可用于过滤的字段。",
        invalidSQL: "SQL 表达式无效。",
        cantParseSQL: "无法解析 SQL 表达式。"
      },
      caseSensitive: "区分大小写",
      notSupportCaseSensitiveTip: "托管的服务不支持区分大小写的查询。"
    },

    featureLayerSource: {
      layer: "图层",
      browse: "浏览",
      selectFromMap: "从地图中选择",
      selectFromPortal: "从 Portal for ArcGIS 添加",
      addServiceUrl: "添加服务 URL",
      inputLayerUrl: "输入图层 URL",
      selectLayer: "从当前地图中选择要素图层。",
      chooseItem: "选择要素图层项目。",
      setServiceUrl: "输入要素服务 URL 或地图服务。",
      selectFromOnline: "从 ArcGIS Online 添加",
      chooseLayer: "选择要素图层。"
    },
    queryableLayerSource: {
      layer: "图层",
      browse: "浏览",
      selectFromMap: "从地图中选择",
      selectFromPortal: "从 Portal for ArcGIS 添加",
      addServiceUrl: "添加服务 URL",
      inputLayerUrl: "输入图层 URL",
      selectLayer: "从当前地图中选择图层。",
      chooseItem: "选择项目。",
      setServiceUrl: "输入服务的 URL。",
      selectFromOnline: "从 ArcGIS Online 添加",
      chooseLayer: "选择图层。"
    },
    gpSource: {
      selectFromPortal: "从 Portal for ArcGIS 添加",
      addServiceUrl: "添加服务 URL",
      selectFromOnline: "从 ArcGIS Online 添加",
      setServiceUrl: "输入地理处理服务的 URL。",
      chooseItem: "选择地理处理服务项目。",
      chooseTask: "选择地理处理任务。"
    },
    itemSelector: {
      map: "地图",
      selectWebMap: "选择 Web 地图",
      addMapFromOnlineOrPortal: "从 ArcGIS Online 公共资源或 ArcGIS Online 或 Portal 私有内容中查找并添加应用程序中的 Web 地图。",
      searchMapName: "按地图名称搜索...",
      searchNone: "无法找到您正在查找的内容。请重试。",
      groups: "群组",
      noneGroups: "无任何群组",
      signInTip: "登录会话已过期，请刷新浏览器以重新登录门户。",
      signIn: "登录",
      publicMap: "公共",
      myOrganization: "我的组织",
      myGroup: "我的组",
      myContent: "我的内容",
      count: "计数",
      fromPortal: "从 Portal",
      fromOnline: "从 ArcGIS.com",
      noneThumbnail: "缩略图不可用",
      owner: "所有者",
      signInTo: "登录到",
      lastModified: "上次修改时间",
      moreDetails: "更多详细信息"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "服务不支持查询。"
    },
    basicLayerChooserFromMap: {
      noLayersTip: "地图中不存在可用的相应图层。"
    },
    layerInfosMenu: {
      titleBasemap: "底图",
      titleLayers: "业务图层",
      labelLayer: "图层名称",
      itemZoomTo: "缩放至",
      itemTransparency: "透明度",
      itemTransparent: "透明",
      itemOpaque: "不透明",
      itemMoveUp: "上移",
      itemMoveDown: "下移",
      itemDesc: "描述",
      itemDownload: "下载",
      itemToAttributeTable: "打开属性表"
    },
    imageChooser: {
      unsupportReaderAPI: "注释: 浏览器不支持 FileReader API",
      readError: "读取文件失败。",
      unknowError: "无法完成操作",
      invalidType: "无效的文件类型。",
      exceed: "文件大小不得超过 1024 KB",
      enableFlash: "需执行的操作: 请启用闪烁。",
      cropWaining: "请选择至少拥有 ${width} x ${height} 像素的照片。",
      toolTip: "为获得最佳效果，图像的宽度应为 ${width} 像素，高度应为 ${height} 像素。其他大小将调整为适应此大小。可接受的图像格式包括: PNG、GIF 和 JPEG。"
    },
    simpleTable: {
      moveUp: "上移",
      moveDown: "下移",
      deleteRow: "删除",
      edit: "编辑"
    },
    urlParams: {
      invalidToken: "无效令牌",
      validateTokenError: "无效令牌或网络错误"
    },
    exportTo: {
      exportTo: "导出",
      toCSV: "导出到 CSV 文件",
      toFeatureCollection: "导出至要素集合",
      toGeoJSON: "导出至 GeoJSON"
    }
  })
);