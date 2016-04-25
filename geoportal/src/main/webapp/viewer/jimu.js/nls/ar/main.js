define(
   ({
    common: {
      ok: "موافق",
      cancel: "إلغاء الأمر",
      next: "التالي",
      back: "السابق"
    },
    errorCode: "كود",
    errorMessage: "رسالة",
    errorDetail: "تفاصيل",
    widgetPlaceholderTooltip: "لتعينها، انتقل إلى عناصر واجهة الاستخدام وانقر على العناصر المتطابقة",
    symbolChooser: {
      preview: "معاينة",
      basic: "أساسي",
      arrows: "الأسهم",
      business: "أعمال تجارية",
      cartographic: "رسم الخرائط",
      nationalParkService: "خدمة المتنزه الوطني",
      outdoorRecreation: "ترفيه خارجي",
      peoplePlaces: "أماكن التجمعات",
      safetyHealth: "الصحة العامة",
      shapes: "الأشكال",
      transportation: "نقل",
      symbolSize: "حجم الرمز",
      color: "لون",
      alpha: "ألفا",
      outlineColor: "اللون الأساسي",
      outlineWidth: "العرض التفصيلي",
      style: "نمط",
      width: "العرض",
      text: "النص",
      fontColor: "لون الخط",
      fontSize: "حجم الخط",
      transparency: "معدل الشفافية:",
      solid: "متصل",
      dash: "شَرطَة",
      dot: "نقطة",
      dashDot: "شَرطَة ونقطة",
      dashDotDot: "شَرطَة ونقطتين"
    },
    transparency: {
      opaque: "غير شفاف",
      transparent: "شفاف"
    },
    rendererChooser: {
      domain: "مجال",
      use: "استخدام",
      singleSymbol: "رمز أحادي",
      uniqueSymbol: "رموز فريدة",
      color: "لون",
      size: "الحجم",
      toShow: "لإظهار",
      colors: "ألوان",
      classes: "تصنيفات",
      symbolSize: "حجم الرمز",
      addValue: "إضافة قيمة",
      setDefaultSymbol: "تعيين الرمز الافتراضي",
      defaultSymbol: "الرمز الافتراضي",
      selectedSymbol: "الرمز المحدد",
      value: "قيمة",
      label: "لافتة التسمية",
      range: "النطاق"
    },
    drawBox: {
      point: "نقطة",
      line: "الخط",
      polyline: "متعدد الخطوط",
      freehandPolyline: "خط يدوي حر متعدد",
      triangle: "مثلث",
      extent: "المدى",
      circle: "دائرة",
      ellipse: "قطع ناقص",
      polygon: "مضلع",
      freehandPolygon: "مضلع مسوم بخط يدوي حر",
      text: "النص",
      clear: "مسح"
    },
    popupConfig: {
      title: "العنوان",
      add: "إضافة",
      fields: "حقول",
      noField: "لا توجد حقول",
      visibility: "مرئي",
      name: "الاسم",
      alias: "اسم مستعار",
      actions: "الأفعال"
    },
    includeButton: {
      include: "تضمين"
    },
    loadingShelter: {
      loading: "تحميل"
    },
    basicServiceBrowser: {
      noServicesFound: "لا توجد خدمات",
      unableConnectTo: "يتعذر الاتصال بـ",
      invalidUrlTip: "عنوان URL الذي أدخلته غير صحيح أو يتعذر الوصول إليه."
    },
    serviceBrowser: {
      noGpFound: "لا توجد خدمة معالجة جغرافية.",
      unableConnectTo: "يتعذر الاتصال بـ"
    },
    layerServiceBrowser: {
      noServicesFound: "لا توجد خدمة خريطة أو خدمة معالم",
      unableConnectTo: "يتعذر الاتصال بـ"
    },
    basicServiceChooser: {
      validate: "تحقق",
      example: "مثال",
      set: "تعيين"
    },
    urlInput: {
      invalidUrl: "عنوان URL غير صحيح."
    },
    urlComboBox: {
      invalidUrl: "عنوان URL غير صحيح."
    },
    filterBuilder: {
      addAnotherExpression: "إضافة تعبير عامل تصفية",
      addSet: "إضافة مجموعة التعبيرات",
      matchMsg: "الحصول على المعالم في الطبقة التي تُطابق ${any_or_all} في التعبيرات التالية",
      matchMsgSet: "${any_or_all} من التعبيرات التالية في هذه المجموعة صحيح",
      all: "جميع",
      any: "أي من",
      value: "قيمة",
      field: "حقل",
      unique: "فريد",
      none: "بلا",
      and: "و",
      valueTooltip: "أدخل قيمة",
      fieldTooltip: "اختيار من حقل حالي",
      uniqueValueTooltip: "اختيار من قيم فريدة في حقل مُحدد",
      stringOperatorIs: "هو", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "ليس",
      stringOperatorStartsWith: "البدء بـ",
      stringOperatorEndsWith: "الانتهاء بـ",
      stringOperatorContains: "يحتوي على",
      stringOperatorDoesNotContain: "لا يحتوي على",
      stringOperatorIsBlank: "فارغ",
      stringOperatorIsNotBlank: "ليس فارغًا",
      dateOperatorIsOn: "هو", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "ليس",
      dateOperatorIsBefore: "قبل",
      dateOperatorIsAfter: "بعد",
      dateOperatorDays: "يوم",
      dateOperatorWeeks: "أسبوع", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "شهر",
      dateOperatorInTheLast: "في آخر",
      dateOperatorNotInTheLast: "ليس في الآخر",
      dateOperatorIsBetween: "بين",
      dateOperatorIsNotBetween: "ليس بين",
      dateOperatorIsBlank: "فارغ",
      dateOperatorIsNotBlank: "ليس فارغًا",
      numberOperatorIs: "هو", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "ليس",
      numberOperatorIsAtLeast: "على الأقل",
      numberOperatorIsLessThan: "أقل من",
      numberOperatorIsAtMost: "في الغالب",
      numberOperatorIsGreaterThan: "أكبر من",
      numberOperatorIsBetween: "بين",
      numberOperatorIsNotBetween: "ليس بين",
      numberOperatorIsBlank: "فارغ",
      numberOperatorIsNotBlank: "ليس فارغًا",
      string: "سلسلة",
      number: "عدد",
      date: "التاريخ",
      askForValues: "اسأل عن القيم",
      prompt: "ترقية",
      hint: "تلميح",
      error: {
        invalidParams: "معلمات غير صحيحة.",
        invalidUrl: "عنوان URL غير صحيح.",
        noFilterFields: "لا توجد حقول بالطبقة يمكن استخدامها للتصفية.",
        invalidSQL: "تعبير SQL غير صحيح.",
        cantParseSQL: "يتعذر توزيع تعبير SQL."
      },
      caseSensitive: "تحسس حالة الأحرف",
      notSupportCaseSensitiveTip: "الخدمات المستضافة لا تدعم الاستعلام الحساس للحالة."
    },

    featureLayerSource: {
      layer: "طبقة",
      browse: "استعراض",
      selectFromMap: "تحديد من الخريطة",
      selectFromPortal: "إضافة من Portal for ArcGIS",
      addServiceUrl: "إضافة عنوان URL للخدمة",
      inputLayerUrl: "إدخال عنوان URL للطبقة",
      selectLayer: "تحديد طبقة معالم من الخريطة الحالية.",
      chooseItem: "اختيار من عنصر طبقة معالم.",
      setServiceUrl: "أدخل عنوان URL لخدمة المعالم أو خدمة الخريطة.",
      selectFromOnline: "إضافة من ArcGIS Online",
      chooseLayer: "اختر طبقة معلم."
    },
    queryableLayerSource: {
      layer: "الطبقة",
      browse: "مربع حوار",
      selectFromMap: "تحديد من الخريطة",
      selectFromPortal: "إضافة من Portal for ArcGIS",
      addServiceUrl: "إضافة عنوان URL للخدمة",
      inputLayerUrl: "إدخال عنوان URL للطبقة",
      selectLayer: "حدد طبقة من الخريطة الحالية.",
      chooseItem: "اختر عنصر.",
      setServiceUrl: "أدخل عنوان URL للخدمة.",
      selectFromOnline: "إضافة من ArcGIS Online",
      chooseLayer: "اختيار الطبقة"
    },
    gpSource: {
      selectFromPortal: "إضافة من Portal for ArcGIS",
      addServiceUrl: "إضافة عنوان URL للخدمة",
      selectFromOnline: "إضافة من ArcGIS Online",
      setServiceUrl: "أدخل عنوان URL لخدمة المعالجة الجغرافية.",
      chooseItem: "اختر عنصر خدمة المعالجة الجغرافية.",
      chooseTask: "اختر مهمة المعالجة الجغرافية."
    },
    itemSelector: {
      map: "خريطة",
      selectWebMap: "اختر خريطة الويب",
      addMapFromOnlineOrPortal: "العثور على خريطة الويب وإضافتها للاستخدام في التطبيق من موارد ArcGIS Online العامة أو المحتويات الخاصة في ArcGIS Online أو البوابة الإلكترونية.",
      searchMapName: "ابحث باستخدام اسم الخريطة...",
      searchNone: "يتعذر إيجاد ما تبحث عنه. يرجى المحاولة مرة أخرى.",
      groups: "مجموعات",
      noneGroups: "لا توجد مجموعات",
      signInTip: "انتهت صلاحية جلسة تسجيل الدخول، يرجى تنشيط المتصفح لتسجيل الدخول للمدخل مرة أخرى.",
      signIn: "تسجيل الدخول",
      publicMap: "عام",
      myOrganization: "المنظمة",
      myGroup: "المجموعات",
      myContent: "المحتوى",
      count: "عدد",
      fromPortal: "من البوابة الإلكترونية",
      fromOnline: "من ArcGIS.com",
      noneThumbnail: "الصورة المصغرة غير متاحة",
      owner: "المالك",
      signInTo: "تسجيل الدخول إلى",
      lastModified: "آخر تعديل",
      moreDetails: "المزيد من التفاصيل"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "الخدمة لا تدعم الاستعلام."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "لا تتوفر طبقة مناسبة داخل الخريطة."
    },
    layerInfosMenu: {
      titleBasemap: "خرائط الأساس",
      titleLayers: "الطبقات التشغيلية",
      labelLayer: "اسم الطبقة",
      itemZoomTo: "تكبير إلى",
      itemTransparency: "معدل الشفافية:",
      itemTransparent: "شفاف",
      itemOpaque: "غير شفاف",
      itemMoveUp: "نقل لأعلى",
      itemMoveDown: "نقل لأسفل",
      itemDesc: "الوصف",
      itemDownload: "تنزيل",
      itemToAttributeTable: "فتح جدول البيانات الجدولية"
    },
    imageChooser: {
      unsupportReaderAPI: "قائمة المهام: المستعرض لا يدعم API لقارئ الملف",
      readError: "فشل قراءة الملف.",
      unknowError: "يتعذر إكمال العمليات",
      invalidType: "نوع الملف غير صحيح.",
      exceed: "لا يجوز أن يتجاوز حجم الملف 1024 كيلوبايت",
      enableFlash: "قائمة المهام: يرجى تمكين الفلاش.",
      cropWaining: "يرجى اختيار صورة على الأقل ${عرض} x ${طول} بكسل.",
      toolTip: "للحصول على أفضل نتيجة، ينبغي أن يكون حجم الصورة ${width} بيكسل وارتفاعها ${height} بيكسل. سيتم تعديل الأحجام الأخرى للملائمة. تنسيقات الصورة المقبولة هي PNG وGIF وJPEG."
    },
    simpleTable: {
      moveUp: "نقل لأعلى",
      moveDown: "نقل لأسفل",
      deleteRow: "حذف",
      edit: "تحرير"
    },
    urlParams: {
      invalidToken: "رمز مميز غير صالح",
      validateTokenError: "رمز مميز غير صحيح أو خطأ بالشبكة"
    },
    exportTo: {
      exportTo: "تصدير",
      toCSV: "تصدير لملف CSV",
      toFeatureCollection: "التصدير إلى مجموعة المعالم",
      toGeoJSON: "التصدير إلى GeoJSON"
    }
  })
);