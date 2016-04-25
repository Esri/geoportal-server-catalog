define(
   ({
    common: {
      ok: "확인",
      cancel: "취소",
      next: "다음",
      back: "뒤로"
    },
    errorCode: "코드",
    errorMessage: "메시지",
    errorDetail: "세부정보",
    widgetPlaceholderTooltip: "설정하려면, 위젯으로 이동한 다음 해당 개체 틀을 클릭",
    symbolChooser: {
      preview: "미리보기",
      basic: "기본",
      arrows: "화살표",
      business: "비즈니스",
      cartographic: "지도",
      nationalParkService: "국립공원관리청",
      outdoorRecreation: "야외 활동",
      peoplePlaces: "사람 장소",
      safetyHealth: "안전 보건",
      shapes: "모양",
      transportation: "교통",
      symbolSize: "심볼 크기",
      color: "색상",
      alpha: "알파",
      outlineColor: "윤곽선 색상",
      outlineWidth: "윤곽선 두께",
      style: "스타일",
      width: "너비",
      text: "텍스트",
      fontColor: "글꼴 색상",
      fontSize: "글꼴 크기",
      transparency: "투명도",
      solid: "실선",
      dash: "대시",
      dot: "점",
      dashDot: "대시 점",
      dashDotDot: "대시 점 점"
    },
    transparency: {
      opaque: "불투명",
      transparent: "투명"
    },
    rendererChooser: {
      domain: "도메인",
      use: "사용",
      singleSymbol: "단일 심볼",
      uniqueSymbol: "고유한 심볼",
      color: "색상",
      size: "크기",
      toShow: "표시할",
      colors: "색상",
      classes: "클래스",
      symbolSize: "심볼 크기",
      addValue: "값 추가",
      setDefaultSymbol: "기본 심볼 설정",
      defaultSymbol: "기본 심볼",
      selectedSymbol: "선택한 심볼",
      value: "값",
      label: "레이블",
      range: "범위"
    },
    drawBox: {
      point: "포인트",
      line: "라인",
      polyline: "폴리라인",
      freehandPolyline: "자유곡선 폴리라인",
      triangle: "삼각형",
      extent: "범위",
      circle: "원",
      ellipse: "타원",
      polygon: "폴리곤",
      freehandPolygon: "자유곡선 폴리곤",
      text: "텍스트",
      clear: "지우기"
    },
    popupConfig: {
      title: "제목",
      add: "추가",
      fields: "필드",
      noField: "필드 없음",
      visibility: "표시",
      name: "이름",
      alias: "별칭",
      actions: "작업"
    },
    includeButton: {
      include: "포함"
    },
    loadingShelter: {
      loading: "불러오는 중"
    },
    basicServiceBrowser: {
      noServicesFound: "서비스를 찾을 수 없습니다.",
      unableConnectTo: "다음과 연결할 수 없습니다.",
      invalidUrlTip: "입력한 URL이 잘못되었거나 접근할 수 없습니다."
    },
    serviceBrowser: {
      noGpFound: "지오프로세싱 서비스를 찾을 수 없습니다.",
      unableConnectTo: "다음과 연결할 수 없습니다."
    },
    layerServiceBrowser: {
      noServicesFound: "맵 서비스 또는 피처 서비스를 찾을 수 없습니다.",
      unableConnectTo: "다음과 연결할 수 없습니다."
    },
    basicServiceChooser: {
      validate: "유효성 검사",
      example: "예",
      set: "설정"
    },
    urlInput: {
      invalidUrl: "잘못된 URL입니다."
    },
    urlComboBox: {
      invalidUrl: "잘못된 URL입니다."
    },
    filterBuilder: {
      addAnotherExpression: "필터 식 추가",
      addSet: "식 집합 추가",
      matchMsg: "다음 식 ${any_or_all}와 일치하는 레이어의 피처를 가져옵니다.",
      matchMsgSet: "이 세트의 다음 식 ${any_or_all}가 true입니다.",
      all: "모두",
      any: "일부",
      value: "값",
      field: "필드",
      unique: "고유 값",
      none: "없음",
      and: "그리고",
      valueTooltip: "값 입력",
      fieldTooltip: "기존 필드에서 선택",
      uniqueValueTooltip: "선택한 필드에서 고유한 값 선택",
      stringOperatorIs: "다음과 같음", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "다음과 같지 않음",
      stringOperatorStartsWith: "다음으로 시작함",
      stringOperatorEndsWith: "다음으로 끝남",
      stringOperatorContains: "다음을 포함함",
      stringOperatorDoesNotContain: "다음을 포함하지 않음",
      stringOperatorIsBlank: "비어 있음",
      stringOperatorIsNotBlank: "비어 있지 않음",
      dateOperatorIsOn: "다음 날짜임", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "다음 날짜가 아님",
      dateOperatorIsBefore: "다음 이전 날짜임",
      dateOperatorIsAfter: "다음 이후 날짜임",
      dateOperatorDays: "일",
      dateOperatorWeeks: "주", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "개월",
      dateOperatorInTheLast: "다음 기간에 이내에 속함",
      dateOperatorNotInTheLast: "다음 기간에 이내에 속하지 않음",
      dateOperatorIsBetween: "다음 사이에 속함",
      dateOperatorIsNotBetween: "다음 사이에 속하지 않음",
      dateOperatorIsBlank: "비어 있음",
      dateOperatorIsNotBlank: "비어 있지 않음",
      numberOperatorIs: "다음과 같음", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "다음과 같지 않음",
      numberOperatorIsAtLeast: "다음 이상",
      numberOperatorIsLessThan: "다음 미만",
      numberOperatorIsAtMost: "다음 이하",
      numberOperatorIsGreaterThan: "다음 초과",
      numberOperatorIsBetween: "다음 사이에 속함",
      numberOperatorIsNotBetween: "다음 사이에 속하지 않음",
      numberOperatorIsBlank: "비어 있음",
      numberOperatorIsNotBlank: "비어 있지 않음",
      string: "문자열",
      number: "숫자",
      date: "날짜",
      askForValues: "값 요청",
      prompt: "프롬프트",
      hint: "힌트",
      error: {
        invalidParams: "잘못된 매개변수입니다.",
        invalidUrl: "잘못된 URL입니다.",
        noFilterFields: "레이어에는 필터에 사용할 수 있는 필드가 없습니다.",
        invalidSQL: "잘못된 SQL 식입니다.",
        cantParseSQL: "SQL 식의 구문을 분석할 수 없습니다."
      },
      caseSensitive: "대소문자 구분",
      notSupportCaseSensitiveTip: "호스팅된 서비스는 대소문자 구분 쿼리를 지원하지 않습니다."
    },

    featureLayerSource: {
      layer: "레이어",
      browse: "찾아보기",
      selectFromMap: "맵에서 선택",
      selectFromPortal: "Portal for ArcGIS에서 추가",
      addServiceUrl: "서비스 URL 추가",
      inputLayerUrl: "입력 레이어 URL",
      selectLayer: "현재 맵에서 피처 레이어를 선택합니다.",
      chooseItem: "피처 레이어 항목을 선택합니다.",
      setServiceUrl: "피처 서비스 또는 맵 서비스의 URL을 입력합니다.",
      selectFromOnline: "ArcGIS Online에서 추가",
      chooseLayer: "피처 레이어를 선택합니다."
    },
    queryableLayerSource: {
      layer: "레이어",
      browse: "찾아보기",
      selectFromMap: "맵에서 선택",
      selectFromPortal: "Portal for ArcGIS에서 추가",
      addServiceUrl: "서비스 URL 추가",
      inputLayerUrl: "입력 레이어 URL",
      selectLayer: "현재 맵에서 레이어를 선택합니다.",
      chooseItem: "항목을 선택합니다.",
      setServiceUrl: "서비스 URL을 입력합니다.",
      selectFromOnline: "ArcGIS Online에서 추가",
      chooseLayer: "레이어를 선택합니다."
    },
    gpSource: {
      selectFromPortal: "Portal for ArcGIS에서 추가",
      addServiceUrl: "서비스 URL 추가",
      selectFromOnline: "ArcGIS Online에서 추가",
      setServiceUrl: "지오프로세싱 서비스 URL을 입력합니다.",
      chooseItem: "지오프로세싱 서비스 항목을 선택합니다.",
      chooseTask: "지오프로세싱 작업을 선택합니다."
    },
    itemSelector: {
      map: "맵",
      selectWebMap: "웹 맵 선택",
      addMapFromOnlineOrPortal: "ArcGIS Online 공용 리소스 또는 ArcGIS Online이나 포털의 개인 콘텐츠에서 응용프로그램에 있는 웹 맵을 찾아 추가합니다.",
      searchMapName: "맵 이름별 검색...",
      searchNone: "검색한 항목을 찾을 수 없습니다. 다시 시도하세요.",
      groups: "그룹",
      noneGroups: "그룹 없음",
      signInTip: "로그인 세션이 만료되었습니다. 포털에 다시 로그인하려면 브라우저를 새로 고치세요.",
      signIn: "로그인",
      publicMap: "공용",
      myOrganization: "내 기관",
      myGroup: "내 그룹",
      myContent: "내 콘텐츠",
      count: "개수",
      fromPortal: "포털에서",
      fromOnline: "ArcGIS.com에서",
      noneThumbnail: "섬네일을 사용할 수 없음",
      owner: "소유자",
      signInTo: "로그인:",
      lastModified: "마지막으로 수정한 날짜",
      moreDetails: "자세한 정보"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "서비스가 쿼리를 지원하지 않습니다."
    },
    basicLayerChooserFromMap: {
      noLayersTip: "맵에서 사용할 수 있는 적합한 레이어가 없습니다."
    },
    layerInfosMenu: {
      titleBasemap: "베이스맵",
      titleLayers: "운영 레이어",
      labelLayer: "레이어 이름",
      itemZoomTo: "확대",
      itemTransparency: "투명도",
      itemTransparent: "투명",
      itemOpaque: "불투명",
      itemMoveUp: "위로 이동",
      itemMoveDown: "아래로 이동",
      itemDesc: "설명",
      itemDownload: "다운로드",
      itemToAttributeTable: "속성 테이블 열기"
    },
    imageChooser: {
      unsupportReaderAPI: "TODO: 브라우저가 파일 리더 API를 지원하지 않습니다.",
      readError: "파일을 읽지 못했습니다.",
      unknowError: "작업을 완료할 수 없음",
      invalidType: "잘못된 파일 유형입니다.",
      exceed: "파일 크기는 1024KB를 넘을 수 없습니다.",
      enableFlash: "TODO: 깜박이기를 활성화하세요.",
      cropWaining: "${가로} x ${세로} 픽셀 이상의 사진을 선택하세요.",
      toolTip: "최상의 결과를 얻으려면 이미지의 폭은 ${width}픽셀, 높이는 ${height}픽셀이어야 합니다. 그 밖의 다른 크기는 맞게 조정됩니다. PNG, GIF 및 JPEG 형식의 이미지를 사용할 수 있습니다."
    },
    simpleTable: {
      moveUp: "위로 이동",
      moveDown: "아래로 이동",
      deleteRow: "삭제",
      edit: "편집"
    },
    urlParams: {
      invalidToken: "잘못된 토큰",
      validateTokenError: "잘못된 토큰 또는 네트워크 오류"
    },
    exportTo: {
      exportTo: "내보내기",
      toCSV: "CSV 파일로 내보내기",
      toFeatureCollection: "피처 컬렉션으로 내보내기",
      toGeoJSON: "GeoJSON으로 내보내기"
    }
  })
);