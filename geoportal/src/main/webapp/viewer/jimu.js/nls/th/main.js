define(
   ({
    common: {
      ok: "ตกลง",
      cancel: "ยกเลิก",
      next: "ถัดไป",
      back: "กลับ"
    },
    errorCode: "รหัส",
    errorMessage: "ข้อความ",
    errorDetail: "รายละเอียด",
    widgetPlaceholderTooltip: "ทำการตั้งค่า ไปยัง widget และคลิกที่ตัวยืดร่วม",
    symbolChooser: {
      preview: "ตัวอย่าง",
      basic: "ระดับพื้นฐาน",
      arrows: "ลูกศร",
      business: "ธุรกิจ",
      cartographic: "การทำแผนที่",
      nationalParkService: "เซอร์วิสอุทยานแห่งชาติ",
      outdoorRecreation: "กิจกรรมกลางแจ้ง",
      peoplePlaces: "สถานที่บุคคล",
      safetyHealth: "ความปลอดภัยด้านสุขภาพ",
      shapes: "รูปร่าง",
      transportation: "การคมนาคม",
      symbolSize: "ขนาดสัญลักษณ์",
      color: "สี",
      alpha: "อัลฟ้า",
      outlineColor: "สีของโครงร่าง",
      outlineWidth: "ความกว้างโครงร่าง",
      style: "สไตล์",
      width: "ความกว้าง",
      text: "ข้อความ",
      fontColor: "สีตัวอักษร",
      fontSize: "ขนาดตัวอักษร",
      transparency: "ความโปร่งแสง",
      solid: "สีเดียว",
      dash: "-",
      dot: ".",
      dashDot: "-.",
      dashDotDot: "-.."
    },
    transparency: {
      opaque: "ความทึบแสง",
      transparent: "ความโปร่งแสง"
    },
    rendererChooser: {
      domain: "โดเมน",
      use: "ใช้",
      singleSymbol: "สัญลักษณ์เดี่ยว",
      uniqueSymbol: "สัญลักษณ์ที่เป็นเอกลักษณ์",
      color: "สี",
      size: "ขนาด",
      toShow: "แสดง",
      colors: "สี",
      classes: "ชั้น",
      symbolSize: "ขนาดสัญลักษณ์",
      addValue: "เพิ่มค่า",
      setDefaultSymbol: "ตั้งค่าสัญลักษณ์ตั้งต้น",
      defaultSymbol: "สัญลักษณ์ตั้งต้น",
      selectedSymbol: "สัญลักษณ์ที่เลือก",
      value: "ค่า",
      label: "ตัวอักษร",
      range: "ลำดับ"
    },
    drawBox: {
      point: "จุด",
      line: "เส้น",
      polyline: "เส้น",
      freehandPolyline: "การวาดเส้นหลายเส้นด้วยมือเปล่า",
      triangle: "สามเหลี่ยม",
      extent: "ส่วนขยาย",
      circle: "วงกลม",
      ellipse: "วงรี",
      polygon: "รูปปิด",
      freehandPolygon: "การวาดรูปหลายเหลี่ยมด้วยมือเปล่า",
      text: "ข้อความ",
      clear: "ลบ"
    },
    popupConfig: {
      title: "ชื่อ",
      add: "เพิ่ม",
      fields: "ฟิลด์",
      noField: "ไม่มีฟิลด์",
      visibility: "มองเห็น",
      name: "ชื่อ",
      alias: "นามแฝง",
      actions: "กระทำ"
    },
    includeButton: {
      include: "รวมเข้ากับ"
    },
    loadingShelter: {
      loading: "กำลังโหลด"
    },
    basicServiceBrowser: {
      noServicesFound: "ไม่พบเซอร์วิสที่ค้นหา",
      unableConnectTo: "ไม่สามารถเชื่อมต่อไปยัง",
      invalidUrlTip: "URL ที่คุณป้อนไม่ถูกต้องหรือไม่สามารถเข้าถึง"
    },
    serviceBrowser: {
      noGpFound: "ไม่พบเซอร์วิสกระบวนการทางภูมิศาสตร์ที่ค้นหา",
      unableConnectTo: "ไม่สามารถเชื่อมต่อไปยัง"
    },
    layerServiceBrowser: {
      noServicesFound: "ไม่พบแมพเซอร์วิสหรือฟีเจอร์เซอร์วิสที่ค้นหา",
      unableConnectTo: "ไม่สามารถเชื่อมต่อไปยัง"
    },
    basicServiceChooser: {
      validate: "ตรวจสอบ",
      example: "ตัวอย่าง",
      set: "ตั้งค่า"
    },
    urlInput: {
      invalidUrl: "Url ไม่ถูกต้อง"
    },
    urlComboBox: {
      invalidUrl: "Url ไม่ถูกต้อง"
    },
    filterBuilder: {
      addAnotherExpression: "เพิ่มสูตรคำนวณในการกรอง",
      addSet: "เพิ่มชุดการแสดง",
      matchMsg: "แสดงฟีเจอร์ที่ในชั้นข้อมูลที่ตรงกัน ${any_or_all}ตามสูตรคำนวณต่อไปนี้",
      matchMsgSet: "${any_or_all} ตามสูตรคำนวณนี้จะทำให้การตั้งค่าเป็นจริง",
      all: "ทั้งหมด",
      any: "ใดๆ",
      value: "ค่า",
      field: "คอลัมน์",
      unique: "เอกลักษณ์",
      none: "ไม่มี",
      and: "และ",
      valueTooltip: "เพิ่มค่า",
      fieldTooltip: "หยิบจากฟิลด์ที่มีอยู่",
      uniqueValueTooltip: "หยิบจากค่าเอกลักษณ์ในฟิลด์ที่เลือก",
      stringOperatorIs: "เป็น", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "ไม่เป็น",
      stringOperatorStartsWith: "เริ่มด้วย",
      stringOperatorEndsWith: "จบด้วย",
      stringOperatorContains: "รวมด้วย",
      stringOperatorDoesNotContain: "ไม่รวมด้วย",
      stringOperatorIsBlank: "ว่าง",
      stringOperatorIsNotBlank: "ไม่ว่าง",
      dateOperatorIsOn: "ที่อยู่บน", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "ที่ไม่อยู่บน",
      dateOperatorIsBefore: "แต่ก่อน",
      dateOperatorIsAfter: "ที่หลัง",
      dateOperatorDays: "วัน",
      dateOperatorWeeks: "สัปดาห์", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "เดือน",
      dateOperatorInTheLast: "ในที่สุด",
      dateOperatorNotInTheLast: "ไม่ที่สุด",
      dateOperatorIsBetween: "ระหว่าง",
      dateOperatorIsNotBetween: "ไม่ระหว่าง",
      dateOperatorIsBlank: "ว่าง",
      dateOperatorIsNotBlank: "ไม่ว่าง",
      numberOperatorIs: "เป็น", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "ไม่เป็น",
      numberOperatorIsAtLeast: "อย่างน้อย",
      numberOperatorIsLessThan: "น้อยกว่า",
      numberOperatorIsAtMost: "มาก",
      numberOperatorIsGreaterThan: "มากกว่า",
      numberOperatorIsBetween: "ระหว่าง",
      numberOperatorIsNotBetween: "ไม่ระหว่าง",
      numberOperatorIsBlank: "ว่าง",
      numberOperatorIsNotBlank: "ไม่ว่าง",
      string: "ตัวหนังสือ",
      number: "จำนวน",
      date: "วันที่",
      askForValues: "สอบถามค่า",
      prompt: "รวดเร็ว",
      hint: "เปรียบเปรย",
      error: {
        invalidParams: "พารามิเตอร์ไม่ถูกต้อง",
        invalidUrl: "Url ไม่ถูกต้อง",
        noFilterFields: "ชั้นข้อมูลไม่มีฟิลด์ที่สามารถนำไปใช้กรองได้",
        invalidSQL: "สูตรคำนวณ SQL ไม่ถูกต้อง",
        cantParseSQL: "ไม่สามารถแยกสูตรคำนวณ SQL ได้"
      },
      caseSensitive: "ตัวอักษรใหญ่หรือเล็กมีความสำคัญ",
      notSupportCaseSensitiveTip: "บริการโฮสต์ข้อมูลไม่สนับสนุนการสอบถามเป็นกรณี ๆ"
    },

    featureLayerSource: {
      layer: "ชั้นข้อมูล",
      browse: "เบราว์",
      selectFromMap: "เลือกจากแผนที่",
      selectFromPortal: "เพิ่มจาก Portal for ArcGIS",
      addServiceUrl: "เพิ่ม URL เซอร์วิส",
      inputLayerUrl: "นำเข้าชั้นข้อมูล URL",
      selectLayer: "เลือกชั้นข้อมูลฟีเจอร์จากแผนที่ปัจจุบัน",
      chooseItem: "เลือกขั้นข้อมูลฟีเจอร์",
      setServiceUrl: "ตั้งค่าเซอร์วิส URL หรือเซอร์วิสแผนที่",
      selectFromOnline: "เพิ่มจาก ArcGIS Online",
      chooseLayer: "เลือกชั้นข้อมูลฟีเจอร์"
    },
    queryableLayerSource: {
      layer: "ชั้นข้อมูล",
      browse: "ค้นหา",
      selectFromMap: "เลือกจากแผนที่",
      selectFromPortal: "เพิ่มจาก Portal for ArcGIS",
      addServiceUrl: "เพิ่ม Service URL",
      inputLayerUrl: "นำเข้าชั้นข้อมูล URL",
      selectLayer: "เลือกชั้นข้อมูลจากแผนที่ปัจจุบัน",
      chooseItem: "เลือกรายการ",
      setServiceUrl: "ใส่  URL ของเซอร์วิส",
      selectFromOnline: "เพิ่มจาก ArcGIS Online",
      chooseLayer: "เลือกชั้นข้อมูล"
    },
    gpSource: {
      selectFromPortal: "เพิ่มจาก Portal for ArcGIS",
      addServiceUrl: "เพิ่ม Service URL",
      selectFromOnline: "เพิ่มจาก ArcGIS Online",
      setServiceUrl: "กรอก URL ของ GeoProcessing Service",
      chooseItem: "เลือกรายการข้อมูล GeoProcessing Service",
      chooseTask: "เลือกรายการทำงานของ GeoProessing"
    },
    itemSelector: {
      map: "แผนที่",
      selectWebMap: "เลือกเว็บแมพ",
      addMapFromOnlineOrPortal: "ค้นหาและเพิ่มเว็บแมพที่จะใช้ในแอพพลิเคชั่นจาก ArcGIS Online สำหรับแหล่งข้อมูลสาธารณะหรือเนื้อหาส่วนตัวที่อยู่ใน ArcGIS Online หรือในพอร์ทัล",
      searchMapName: "ค้นหาจากชื่อแผนที่...",
      searchNone: "เราไม่สามารถค้นหาในสิ่งที่คุณต้องการได้ โปรดลองอีกครั้งหนึ่ง",
      groups: "กลุ่ม :",
      noneGroups: "ไม่มีกลุ่ม",
      signInTip: "การอยู่ในระบบของคุณหมดเวลาลงแล้ว โปรดรีเฟรชที่บราวเซอร์ใหม่อีกครั้งเพื่อทำการเข้าสู่ระบบพอร์ทัลของคุณอีกครั้ง",
      signIn: "ลงชื่อเข้าใช้",
      publicMap: "สาธารณะ",
      myOrganization: "องค์กรของฉัน",
      myGroup: "กลุ่มของฉัน",
      myContent: "เนื้อหาของฉัน",
      count: "นับ",
      fromPortal: "จากพอร์ทัล",
      fromOnline: "จาก ArcGIS.com",
      noneThumbnail: "รูปภาพขนาดเล็กไม่สามารถใช้งานได้",
      owner: "เจ้าของ",
      signInTo: "ลงชื่อเข้าใช้สู่",
      lastModified: "แก้ไขครั้งสุดท้ายเมื่อ",
      moreDetails: "รายละเอียดเพิ่มเติม"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Service นี้ไม่รองรับการคัดกรองข้อมูล"
    },
    basicLayerChooserFromMap: {
      noLayersTip: "ไม่มีชั้นข้อมูลการดำเนินการบนแผนที่"
    },
    layerInfosMenu: {
      titleBasemap: "แผนที่ฐาน",
      titleLayers: "ชั้นข้อมูลซ้อนทับ",
      labelLayer: "ชื่อชั้นข้อมูล",
      itemZoomTo: "ขยายไปยัง",
      itemTransparency: "ความโปร่งแสง",
      itemTransparent: "ความโปร่งแสง",
      itemOpaque: "ความทึบแสง",
      itemMoveUp: "เลื่อนขึ้น",
      itemMoveDown: "เลื่อนลง",
      itemDesc: "คำอธิบาย",
      itemDownload: "ดาวน์โหลด",
      itemToAttributeTable: "เปิดตารางข้อมูลเชิงประกอบ"
    },
    imageChooser: {
      unsupportReaderAPI: "TODO: บราวเซอร์ไม่สนับสนุนตัวอ่านไฟล์ API",
      readError: "การอ่านไฟล์ล้มเหลว",
      unknowError: "ไม่สามารถดำเนินการได้อย่างสมบูรณ์",
      invalidType: "ประเภทของไฟล์ไม่ถูกต้อง",
      exceed: "ขนาดไฟล์ห้ามเกิน 1024 KB",
      enableFlash: "TODO: กรุณาเปิดการใช้งานแฟลช",
      cropWaining: "กรุณาเลือกภาพที่อย่างน้อย ${width} x ${height} พิเซล",
      toolTip: "เพื่อให้ได้ผลลัพธ์ที่ดีที่สุดควรจะเป็นภาพ ${width} พิกเซลกว้างโดย ${height} พิกเซลสูง ขนาดอื่น ๆ จะได้รับการปรับเปลี่ยนให้เหมาะสม รูปแบบภาพที่ยอมรับได้คือ: PNG, GIF และ JPEG"
    },
    simpleTable: {
      moveUp: "เลื่อนขึ้น",
      moveDown: "เลื่อนลง",
      deleteRow: "ลบทิ้ง",
      edit: "แก้ไข"
    },
    urlParams: {
      invalidToken: "โทเค็นไม่ถูกต้อง",
      validateTokenError: "โทเค็นไม่ถูกต้อง หรือข้อผิดพลาดของเครือข่าย"
    },
    exportTo: {
      exportTo: "ส่งออก",
      toCSV: "นำออกเป็นไฟล์ CSV",
      toFeatureCollection: "ส่งออกเป็น Feature Collection",
      toGeoJSON: "ส่งออกเป็น GeoJSON"
    }
  })
);