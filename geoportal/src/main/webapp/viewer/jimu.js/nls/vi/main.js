define(
   ({
    common: {
      ok: "OK",
      cancel: "Hủy",
      next: "Tiếp",
      back: "Quay lại"
    },
    errorCode: "Mã",
    errorMessage: "Thông báo",
    errorDetail: "Chi tiết",
    widgetPlaceholderTooltip: "Để thiết lập, đi tới Tiện ích và bấm vào trình giữ chỗ tương ứng",
    symbolChooser: {
      preview: "Xem trước",
      basic: "Cơ bản",
      arrows: "Mũi tên",
      business: "Kinh doanh",
      cartographic: "Bản đồ",
      nationalParkService: "Cục Công viên Quốc gia",
      outdoorRecreation: "Giải trí Ngoài trời",
      peoplePlaces: "Địa điểm Con người",
      safetyHealth: "Sức khỏe An toàn",
      shapes: "Các hình dạng",
      transportation: "Giao thông Vận tải",
      symbolSize: "Kích cỡ Ký hiệu",
      color: "Màu sắc",
      alpha: "Alpha",
      outlineColor: "Màu Đường viền",
      outlineWidth: "Độ rộng Đường viền",
      style: "Kiểu",
      width: "Chiều rộng",
      text: "Văn bản",
      fontColor: "Màu Phông chữ",
      fontSize: "Cỡ Chữ",
      transparency: "Độ trong suốt",
      solid: "Đậm",
      dash: "Gạch",
      dot: "Chấm",
      dashDot: "Chấm Gạch",
      dashDotDot: "Gạch Chấm Chấm"
    },
    transparency: {
      opaque: "Độ mờ",
      transparent: "Độ trong suốt"
    },
    rendererChooser: {
      domain: "Miền",
      use: "Sử dụng",
      singleSymbol: "Một Ký hiệu Đơn",
      uniqueSymbol: "Ký hiệu theo Loại đối tượng",
      color: "Màu sắc",
      size: "Kích cỡ",
      toShow: "Để Hiển thị",
      colors: "Màu sắc",
      classes: "Các lớp",
      symbolSize: "Kích cỡ Ký hiệu",
      addValue: "Thêm Giá trị",
      setDefaultSymbol: "Thiết lập Ký hiệu Mặc định",
      defaultSymbol: "Ký hiệu Mặc định",
      selectedSymbol: "Ký hiệu Đã chọn",
      value: "Giá trị",
      label: "Nhãn",
      range: "Phạm vi"
    },
    drawBox: {
      point: "Điểm",
      line: "Đường",
      polyline: "Đa tuyến",
      freehandPolyline: "Đa tuyến vẽ tự do",
      triangle: "Hình tam giác",
      extent: "Phạm vi",
      circle: "Hình tròn",
      ellipse: "Hình Elip",
      polygon: "Vùng",
      freehandPolygon: "Vùng vẽ bằng tay",
      text: "Văn bản",
      clear: "Xóa"
    },
    popupConfig: {
      title: "Tiêu đề",
      add: "Thêm",
      fields: "Trường",
      noField: "Không có trường nào",
      visibility: "Hiển thị",
      name: "Tên",
      alias: "Bí danh",
      actions: "Các hành động"
    },
    includeButton: {
      include: "Bao gồm"
    },
    loadingShelter: {
      loading: "Đang tải"
    },
    basicServiceBrowser: {
      noServicesFound: "Không tìm thấy dịch vụ nào.",
      unableConnectTo: "Không thể kết nối với",
      invalidUrlTip: "URL bạn vừa nhập không hợp lệ hoặc không thể truy cập được."
    },
    serviceBrowser: {
      noGpFound: "Không tìm thấy dịch vụ địa xử lý nào.",
      unableConnectTo: "Không thể kết nối với"
    },
    layerServiceBrowser: {
      noServicesFound: "Không tìm thấy dịch vụ bản đồ hoặc dịch vụ đối tượng nào",
      unableConnectTo: "Không thể kết nối với"
    },
    basicServiceChooser: {
      validate: "Xác minh",
      example: "Ví dụ",
      set: "Thiết lập"
    },
    urlInput: {
      invalidUrl: "Url không hợp lệ."
    },
    urlComboBox: {
      invalidUrl: "Url không hợp lệ."
    },
    filterBuilder: {
      addAnotherExpression: "Thêm biểu thức lọc",
      addSet: "Thêm tập hợp biểu thức",
      matchMsg: "Lấy các đối tượng trong lớp trùng khớp với ${any_or_all} các biểu thức sau",
      matchMsgSet: "${any_or_all} của các biểu thức sau trong tập hợp này là đúng",
      all: "Tất cả",
      any: "Bất kỳ",
      value: "Giá trị",
      field: "Trường",
      unique: "Duy nhất",
      none: "Không có",
      and: "và",
      valueTooltip: "Nhập vào giá trị",
      fieldTooltip: "Chọn từ trường hiện có",
      uniqueValueTooltip: "Lấy từ các giá trị duy nhất trong trường được chọn",
      stringOperatorIs: "là", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "không phải là",
      stringOperatorStartsWith: "bắt đầu với",
      stringOperatorEndsWith: "kết thúc với",
      stringOperatorContains: "chứa",
      stringOperatorDoesNotContain: "không chứa",
      stringOperatorIsBlank: "trống",
      stringOperatorIsNotBlank: "không trống",
      dateOperatorIsOn: "vào ngày", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "không vào ngày",
      dateOperatorIsBefore: "trước",
      dateOperatorIsAfter: "sau",
      dateOperatorDays: "ngày",
      dateOperatorWeeks: "tuần", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "tháng",
      dateOperatorInTheLast: "trong ngày cuối",
      dateOperatorNotInTheLast: "không phải cuối cùng",
      dateOperatorIsBetween: "ở giữa",
      dateOperatorIsNotBetween: "không ở giữa",
      dateOperatorIsBlank: "trống",
      dateOperatorIsNotBlank: "không trống",
      numberOperatorIs: "là", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "không phải là",
      numberOperatorIsAtLeast: "tối thiểu",
      numberOperatorIsLessThan: "ít hơn",
      numberOperatorIsAtMost: "tối đa",
      numberOperatorIsGreaterThan: "nhiều hơn",
      numberOperatorIsBetween: "ở giữa",
      numberOperatorIsNotBetween: "không ở giữa",
      numberOperatorIsBlank: "trống",
      numberOperatorIsNotBlank: "không trống",
      string: "String",
      number: "Số",
      date: "Ngày",
      askForValues: "Yêu cầu các giá trị",
      prompt: "Lời nhắc",
      hint: "Gợi ý",
      error: {
        invalidParams: "Tham số không hợp lệ.",
        invalidUrl: "Url không hợp lệ.",
        noFilterFields: "Lớp không có trường nào có thể dùng để lọc.",
        invalidSQL: "Biểu thức SQL không hợp lệ.",
        cantParseSQL: "Không thể phân tích biểu thức SQL."
      },
      caseSensitive: "Phân biệt chữ hoa chữ thường",
      notSupportCaseSensitiveTip: "Dịch vụ được lưu trữ không hỗ trợ truy vấn phân biệt chữ hoa chữ thường."
    },

    featureLayerSource: {
      layer: "Lớp",
      browse: "Duyệt",
      selectFromMap: "Chọn từ Bản đồ",
      selectFromPortal: "Thêm từ Portal for ArcGIS",
      addServiceUrl: "Thêm URL Dịch vụ",
      inputLayerUrl: "URL Lớp Đầu vào",
      selectLayer: "Chọn một lớp đối tượng từ bản đồ hiện tại.",
      chooseItem: "Chọn một mục lớp đối tượng.",
      setServiceUrl: "Nhập URL của dịch vụ đối tượng hoặc dịch vụ bản đồ.",
      selectFromOnline: "Thêm từ ArcGIS Online",
      chooseLayer: "Chọn một lớp đối tượng."
    },
    queryableLayerSource: {
      layer: "Lớp",
      browse: "Duyệt",
      selectFromMap: "Chọn từ Bản đồ",
      selectFromPortal: "Thêm từ Portal for ArcGIS",
      addServiceUrl: "Thêm URL Dịch vụ",
      inputLayerUrl: "URL Lớp Đầu vào",
      selectLayer: "Chọn một lớp từ bản đồ hiện tại.",
      chooseItem: "Chọn một mục.",
      setServiceUrl: "Nhập URL của dịch vụ.",
      selectFromOnline: "Thêm từ ArcGIS Online",
      chooseLayer: "Chọn lớp."
    },
    gpSource: {
      selectFromPortal: "Thêm từ Portal for ArcGIS",
      addServiceUrl: "Thêm URL Dịch vụ",
      selectFromOnline: "Thêm từ ArcGIS Online",
      setServiceUrl: "Nhập URL của dịch vụ địa xử lý.",
      chooseItem: "Chọn một mục dịch vụ địa xử lý.",
      chooseTask: "Chọn một tác vụ địa xử lý."
    },
    itemSelector: {
      map: "Bản đồ",
      selectWebMap: "Chọn Bản đồ Web",
      addMapFromOnlineOrPortal: "Tìm và thêm bản đồ web trong ứng dụng từ các tài nguyên công khai của ArcGIS Online hoặc nội dung riêng tư của bạn trong ArcGIS Online hoặc Portal.",
      searchMapName: "Tìm kiếm theo tên bản đồ...",
      searchNone: "Chúng tôi không thể tìm thấy nội dung bạn đang tìm kiếm. Vui lòng thử lại.",
      groups: "Nhóm",
      noneGroups: "Không có nhóm nào",
      signInTip: "Lần đăng nhập của bạn đã hết hạn, vui lòng làm mới trình duyệt để đăng nhập lại vào cổng thông tin.",
      signIn: "Đăng nhập",
      publicMap: "Công khai",
      myOrganization: "Tổ chức của tôi",
      myGroup: "Nhóm của tôi",
      myContent: "Nội dung của tôi",
      count: "Số lượng",
      fromPortal: "từ Cổng thông tin",
      fromOnline: "từ ArcGIS.com",
      noneThumbnail: "Hình thu nhỏ không khả dụng",
      owner: "chủ sở hữu",
      signInTo: "Đăng nhập vào",
      lastModified: "Chỉnh sửa lần cuối",
      moreDetails: "Thêm chi tiết"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "Dịch vụ không hỗ trợ truy vấn."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "Không có lớp thích hợp nào trong bản đồ."
    },
    layerInfosMenu: {
      titleBasemap: "Bản đồ nền",
      titleLayers: "Các lớp hoạt động",
      labelLayer: "Tên lớp",
      itemZoomTo: "Phóng tới",
      itemTransparency: "Độ trong suốt",
      itemTransparent: "Độ trong suốt",
      itemOpaque: "Độ mờ",
      itemMoveUp: "Di chuyển lên trên",
      itemMoveDown: "Di chuyển xuống dưới",
      itemDesc: "Mô tả",
      itemDownload: "Tải xuống",
      itemToAttributeTable: "Mở Bảng Thuộc tính"
    },
    imageChooser: {
      unsupportReaderAPI: "CẦN LÀM: Trình duyệt này không hỗ trợ API bộ đọc tệp",
      readError: "Không thể đọc tệp.",
      unknowError: "không thể hoàn thành hoạt động",
      invalidType: "Loại tệp không hợp lệ.",
      exceed: "Kích cỡ tệp không được vượt quá 1024 KB",
      enableFlash: "CẦN LÀM: vui lòng bật flash.",
      cropWaining: "Vui lòng chọn ảnh có kích thước tối thiểu ${width} x ${height} pixel.",
      toolTip: "Để có kết quả tốt nhất, hình ảnh phải rộng ${width} pixel và cao ${height} pixel. Các kích cỡ khác sẽ được điều chỉnh cho phù hợp. Các định dạng hình ảnh được chấp nhận là: PNG, GIF và JPEG."
    },
    simpleTable: {
      moveUp: "Di chuyển lên trên",
      moveDown: "Di chuyển xuống dưới",
      deleteRow: "Xóa",
      edit: "Chỉnh sửa"
    },
    urlParams: {
      invalidToken: "Mã token không hợp lệ",
      validateTokenError: "Mã token không hợp lệ hoặc lỗi Mạng"
    },
    exportTo: {
      exportTo: "Xuất",
      toCSV: "Xuất ra tệp CSV",
      toFeatureCollection: "Xuất ra Bộ sưu tập Đối tượng",
      toGeoJSON: "Xuất ra GeoJSON"
    }
  })
);