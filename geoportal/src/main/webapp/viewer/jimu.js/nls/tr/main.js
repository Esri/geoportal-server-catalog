define(
   ({
    common: {
      ok: "Tamam",
      cancel: "İptal",
      next: "İleri",
      back: "Geri"
    },
    errorCode: "Kod",
    errorMessage: "İleti",
    errorDetail: "Ayrıntı",
    widgetPlaceholderTooltip: "Ayarlamak için Araçlar\'a gidin ve karşılık gelen yer tutucuyu tıklayın",
    symbolChooser: {
      preview: "Önizleme",
      basic: "Temel",
      arrows: "Oklar",
      business: "İş",
      cartographic: "Kartografik",
      nationalParkService: "Ulusal Park Hizmeti",
      outdoorRecreation: "Açık Havada Dinlenme",
      peoplePlaces: "İnsanların Bulunduğu Mekanlar",
      safetyHealth: "Güvenlik Sağlık",
      shapes: "Şekiller",
      transportation: "Taşımacılık",
      symbolSize: "Simge Boyutu",
      color: "Renk",
      alpha: "Alfa",
      outlineColor: "Dış Çizgi Rengi",
      outlineWidth: "Dış Çizgi Genişliği",
      style: "Stil",
      width: "Genişlik",
      text: "Metin",
      fontColor: "Yazı Tipi Rengi",
      fontSize: "Yazı Tipi Boyutu",
      transparency: "Saydamlık",
      solid: "Dolu",
      dash: "Tire",
      dot: "Nokta",
      dashDot: "Çizgi Nokta",
      dashDotDot: "Çizgi Nokta Nokta"
    },
    transparency: {
      opaque: "Opak",
      transparent: "Saydam"
    },
    rendererChooser: {
      domain: "Etki Alanı",
      use: "Kullan",
      singleSymbol: "Tek Bir Simge",
      uniqueSymbol: "Özel Simgeler",
      color: "Renk",
      size: "Boyut",
      toShow: "Gösterilecek",
      colors: "Renkler",
      classes: "Sınıflar",
      symbolSize: "Simge Boyutu",
      addValue: "Değer Ekle",
      setDefaultSymbol: "Varsayılan Simgeyi Ayarla",
      defaultSymbol: "Varsayılan Sembol",
      selectedSymbol: "Seçili Simge",
      value: "Değer",
      label: "Etiket",
      range: "Aralık"
    },
    drawBox: {
      point: "Nokta",
      line: "Çizgi",
      polyline: "Çoklu Çizgi",
      freehandPolyline: "Serbest Çizim Çoklu Çizgi",
      triangle: "Üçgen",
      extent: "Yayılım",
      circle: "Daire",
      ellipse: "Elips",
      polygon: "Alan",
      freehandPolygon: "Serbest Çizim Alan",
      text: "Metin",
      clear: "Temizle"
    },
    popupConfig: {
      title: "Başlık",
      add: "Ekle",
      fields: "Alanlar",
      noField: "Alan Yok",
      visibility: "Görünür",
      name: "Ad",
      alias: "Diğer Ad",
      actions: "İşlemler"
    },
    includeButton: {
      include: "Dahil Et"
    },
    loadingShelter: {
      loading: "Yükleniyor"
    },
    basicServiceBrowser: {
      noServicesFound: "Servis bulunamadı.",
      unableConnectTo: "Buraya bağlanılamıyor:",
      invalidUrlTip: "Girdiğiniz URL geçersiz veya erişilemez."
    },
    serviceBrowser: {
      noGpFound: "Coğrafi işlem servisi bulunamadı.",
      unableConnectTo: "Buraya bağlanılamıyor:"
    },
    layerServiceBrowser: {
      noServicesFound: "Harita servisi ya da detay servisi bulunamadı",
      unableConnectTo: "Buraya bağlanılamıyor:"
    },
    basicServiceChooser: {
      validate: "Doğrula",
      example: "Örnek",
      set: "Ayarla"
    },
    urlInput: {
      invalidUrl: "Geçersiz URL."
    },
    urlComboBox: {
      invalidUrl: "Geçersiz URL."
    },
    filterBuilder: {
      addAnotherExpression: "Bir filtre ifadesi ekle",
      addSet: "İfade kümesi ekle",
      matchMsg: "Katmanda, aşağıdaki ifadenin ${any_or_all} kadarı ile eşleşen detayları al",
      matchMsgSet: "Bu setteki aşağıdaki ifadelerin ${any_or_all} doğru",
      all: "Tümü",
      any: "Bir Kısmı",
      value: "Değer",
      field: "Alan",
      unique: "Tek",
      none: "Hiçbiri",
      and: "ve",
      valueTooltip: "Değer gir",
      fieldTooltip: "Mevcut alandan seç",
      uniqueValueTooltip: "Seçili alandaki tek değerlerden seç",
      stringOperatorIs: "alanı şu olanlar", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "alanı şu olmayanlar",
      stringOperatorStartsWith: "alanı şununla başlayanlar",
      stringOperatorEndsWith: "alanı şununla bitenler",
      stringOperatorContains: "alanı şunu içerenler",
      stringOperatorDoesNotContain: "alanı şunu içermeyenler",
      stringOperatorIsBlank: "alanı boş olanlar",
      stringOperatorIsNotBlank: "alanı boş olmayanlar",
      dateOperatorIsOn: "alanı şu tarihte olanlar", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "alanı şu tarihte olmayanlar",
      dateOperatorIsBefore: "alanı şu tarihten önce olanlar",
      dateOperatorIsAfter: "alanı şu tarihten sonra olanlar",
      dateOperatorDays: "gün içinde",
      dateOperatorWeeks: "hafta içinde", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "ay içinde",
      dateOperatorInTheLast: "alanı son şu dönemde olanlar",
      dateOperatorNotInTheLast: "alanı son şu dönemde olmayanlar",
      dateOperatorIsBetween: "alanı şu tarihler arasında olanlar",
      dateOperatorIsNotBetween: "alanı şu tarihler arasında olmayanlar",
      dateOperatorIsBlank: "alanı boş olanlar",
      dateOperatorIsNotBlank: "alanı boş olmayanlar",
      numberOperatorIs: "alanı şu olanlar", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "alanı şu olmayanlar",
      numberOperatorIsAtLeast: "alanı en az şu olanlar",
      numberOperatorIsLessThan: "alanı şundan küçük olanlar",
      numberOperatorIsAtMost: "alanı en çok şu olanlar",
      numberOperatorIsGreaterThan: "alanı şundan büyük olanlar",
      numberOperatorIsBetween: "alanı şu tarihler arasında olanlar",
      numberOperatorIsNotBetween: "alanı şu tarihler arasında olmayanlar",
      numberOperatorIsBlank: "alanı boş olanlar",
      numberOperatorIsNotBlank: "alanı boş olmayanlar",
      string: "Dize",
      number: "Rakam",
      date: "Tarih",
      askForValues: "Değer iste",
      prompt: "İstem",
      hint: "İpucu",
      error: {
        invalidParams: "Geçersiz parametreler.",
        invalidUrl: "Geçersiz URL.",
        noFilterFields: "Katmanın filtre için kullanılabilecek hiçbir alanı yok.",
        invalidSQL: "Geçersiz SQL ifadesi.",
        cantParseSQL: "SQL ifadesi ayrıştırılamadı."
      },
      caseSensitive: "Büyük/Küçük Harf Duyarlı",
      notSupportCaseSensitiveTip: "Barındırılan hizmetler büyük küçük harf duyarlı sorgulamayı desteklemez."
    },

    featureLayerSource: {
      layer: "Katman",
      browse: "Gözat",
      selectFromMap: "Haritadan seç",
      selectFromPortal: "Portal for ArcGIS\'ten ekle",
      addServiceUrl: "Servis URL\'si ekle",
      inputLayerUrl: "Girdi Katmanı URL\'si",
      selectLayer: "Geçerli haritadan bir detay katmanı seçin.",
      chooseItem: "Bir detay katmanı öğesi seçin.",
      setServiceUrl: "Detay servisinin ya da harita servisinin URL\'sini girin.",
      selectFromOnline: "ArcGIS Online\'dan Ekle",
      chooseLayer: "Bir özellik katmanı seçin."
    },
    queryableLayerSource: {
      layer: "Katman",
      browse: "...",
      selectFromMap: "Haritadan seç",
      selectFromPortal: "Portal for ArcGIS\'ten ekle",
      addServiceUrl: "Servis URL\'si ekle",
      inputLayerUrl: "Girdi Katmanı URL\'si",
      selectLayer: "Geçerli haritadan bir katman seçin.",
      chooseItem: "Öğe seçin.",
      setServiceUrl: "Hizmetin URL\'sini girin.",
      selectFromOnline: "ArcGIS Online\'dan Ekle",
      chooseLayer: "Katman seçmek için kullanılır."
    },
    gpSource: {
      selectFromPortal: "Portal for ArcGIS\'ten ekle",
      addServiceUrl: "Servis URL\'si Ekle",
      selectFromOnline: "ArcGIS Online\'dan Ekle",
      setServiceUrl: "Coğrafi işlem hizmetinin URL\'sini girin.",
      chooseItem: "Bir coğrafi işlem hizmet öğesi seçin.",
      chooseTask: "Bir coğrafi işlem görevi seçin."
    },
    itemSelector: {
      map: "Harita",
      selectWebMap: "Web Haritası Seç",
      addMapFromOnlineOrPortal: "ArcGIS Online genel kaynaklarından veya ArcGIS Online veya Portal\'daki özel içeriğinizden gelen uygulamada bir web haritası bulun ve buraya ekleyin.",
      searchMapName: "Harita adına göre ara...",
      searchNone: "Aradığınızı bulamadık. Yeniden deneyin.",
      groups: "Gruplar",
      noneGroups: "Grup yok",
      signInTip: "Oturumunuzun süresi doldu, portalınızda yeniden oturum açmak için tarayıcınızı yenileyin.",
      signIn: "Hesabınıza",
      publicMap: "Genel",
      myOrganization: "Kuruluşum",
      myGroup: "Gruplarım",
      myContent: "İçeriğim",
      count: "Sayım",
      fromPortal: "Portal\'dan",
      fromOnline: "ArcGIS.com\'dan",
      noneThumbnail: "Küçük Resim Yok",
      owner: "Sahibi",
      signInTo: "Şurada oturum aç",
      lastModified: "Son Değiştirme",
      moreDetails: "Diğer Ayrıntılar"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Hizmet sorgulamayı desteklemiyor."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Haritada kullanılabilir uygun katman yok."
    },
    layerInfosMenu: {
      titleBasemap: "Altlık haritaları",
      titleLayers: "Operasyonel Katmanlar",
      labelLayer: "Katman Adı",
      itemZoomTo: "Şuna Yakınlaştır",
      itemTransparency: "Saydamlık",
      itemTransparent: "Saydam",
      itemOpaque: "Opak",
      itemMoveUp: "Yukarı taşı",
      itemMoveDown: "Aşağı taşı",
      itemDesc: "Açıklama",
      itemDownload: "İndir",
      itemToAttributeTable: "Öznitelik Tablosunu Aç"
    },
    imageChooser: {
      unsupportReaderAPI: "YAPILACAK: Tarayıcı, dosya okuyucu API\'sini desteklemiyor",
      readError: "Dosya okunamadı.",
      unknowError: "işlemler tamamlanamıyor",
      invalidType: "Geçersiz dosya türü.",
      exceed: "Dosya boyutu 1024 KB\'yi aşamaz",
      enableFlash: "YAPILACAK: Flash\'ı etkinleştirin.",
      cropWaining: "Çözünürlüğü en az ${width} x ${height} piksel olan bir fotoğraf seçin.",
      toolTip: "En iyi sonuç için görüntü ${width} piksel genişliğinde ve ${height} piksel yüksekliğinde olmalıdır. Diğer boyutlar sığacak şekilde ayarlanır. Kabul edilen görüntü biçimleri: PNG, GIF ve JPEG."
    },
    simpleTable: {
      moveUp: "Yukarı taşı",
      moveDown: "Aşağı taşı",
      deleteRow: "Sil",
      edit: "Düzenle"
    },
    urlParams: {
      invalidToken: "Geçersiz belirteç",
      validateTokenError: "Geçersiz belirteç veya Ağ hatası"
    },
    exportTo: {
      exportTo: "Dışa Aktar",
      toCSV: "CSV dosyasına gönder",
      toFeatureCollection: "Detay Koleksiyonuna Aktar",
      toGeoJSON: "GeoJSON//\'a Aktar"
    }
  })
);