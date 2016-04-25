define(
   ({
    common: {
      ok: "OK",
      cancel: "キャンセル",
      next: "次へ",
      back: "戻る"
    },
    errorCode: "コード",
    errorMessage: "メッセージ",
    errorDetail: "詳細",
    widgetPlaceholderTooltip: "これを設定するには、ウィジェットに移動して、対応するプレースホルダーをクリックします",
    symbolChooser: {
      preview: "プレビュー",
      basic: "基本",
      arrows: "矢印",
      business: "ビジネス",
      cartographic: "カートグラフィック",
      nationalParkService: "アメリカ国立公園",
      outdoorRecreation: "野外レクリエーション",
      peoplePlaces: "人と場所",
      safetyHealth: "安全と衛生",
      shapes: "形状",
      transportation: "交通",
      symbolSize: "シンボル サイズ",
      color: "色",
      alpha: "透過",
      outlineColor: "アウトライン色",
      outlineWidth: "アウトライン幅",
      style: "スタイル",
      width: "幅",
      text: "テキスト",
      fontColor: "フォントの色",
      fontSize: "フォント サイズ",
      transparency: "透過表示",
      solid: "実線",
      dash: "破線",
      dot: "点線",
      dashDot: "1 点鎖線",
      dashDotDot: "2 点鎖線"
    },
    transparency: {
      opaque: "不透明",
      transparent: "透明"
    },
    rendererChooser: {
      domain: "ドメイン",
      use: "使用",
      singleSymbol: "単一シンボル",
      uniqueSymbol: "個別値シンボル",
      color: "色",
      size: "サイズ",
      toShow: "表示",
      colors: "色",
      classes: "等級",
      symbolSize: "シンボル サイズ",
      addValue: "値の追加",
      setDefaultSymbol: "デフォルト シンボルの設定",
      defaultSymbol: "デフォルト シンボル",
      selectedSymbol: "選択時のシンボル",
      value: "値",
      label: "ラベル",
      range: "範囲"
    },
    drawBox: {
      point: "ポイント",
      line: "ライン",
      polyline: "ポリライン",
      freehandPolyline: "フリーハンド ポリライン",
      triangle: "三角形",
      extent: "範囲",
      circle: "円",
      ellipse: "楕円",
      polygon: "ポリゴン",
      freehandPolygon: "フリーハンド ポリゴン",
      text: "テキスト",
      clear: "消去"
    },
    popupConfig: {
      title: "タイトル",
      add: "追加",
      fields: "フィールド",
      noField: "フィールドがありません",
      visibility: "表示",
      name: "名前",
      alias: "エイリアス",
      actions: "アクション"
    },
    includeButton: {
      include: "含む"
    },
    loadingShelter: {
      loading: "読み込んでいます"
    },
    basicServiceBrowser: {
      noServicesFound: "サービスが見つかりませんでした。",
      unableConnectTo: "次に接続できません:",
      invalidUrlTip: "入力した URL は無効であるか、アクセスできません。"
    },
    serviceBrowser: {
      noGpFound: "ジオプロセシング サービスが見つかりませんでした。",
      unableConnectTo: "次に接続できません:"
    },
    layerServiceBrowser: {
      noServicesFound: "マップ サービスまたはフィーチャ サービスが見つかりませんでした",
      unableConnectTo: "次に接続できません:"
    },
    basicServiceChooser: {
      validate: "整合チェック",
      example: "例",
      set: "設定"
    },
    urlInput: {
      invalidUrl: "無効な URL です。"
    },
    urlComboBox: {
      invalidUrl: "無効な URL です。"
    },
    filterBuilder: {
      addAnotherExpression: "フィルターの条件式を追加",
      addSet: "式セットの追加",
      matchMsg: "次の条件式の ${any_or_all} に一致するレイヤーのフィーチャを取得",
      matchMsgSet: "このセットの次の条件式の${any_or_all}に当てはまります。",
      all: "すべて",
      any: "一部",
      value: "値",
      field: "フィールド",
      unique: "個別値",
      none: "なし",
      and: "かつ",
      valueTooltip: "値の入力",
      fieldTooltip: "既存のフィールドから選択",
      uniqueValueTooltip: "選択されたフィールドの個別値から選択",
      stringOperatorIs: "に等しい", // e.g. <stringFieldName> is "California"
      stringOperatorIsNot: "に等しくない",
      stringOperatorStartsWith: "で始まる",
      stringOperatorEndsWith: "で終わる",
      stringOperatorContains: "を含む",
      stringOperatorDoesNotContain: "を含まない",
      stringOperatorIsBlank: "空である",
      stringOperatorIsNotBlank: "空でない",
      dateOperatorIsOn: "である", // e.g. <dateFieldName> is on "1/1/2012"
      dateOperatorIsNotOn: "でない",
      dateOperatorIsBefore: "より前である",
      dateOperatorIsAfter: "より後である",
      dateOperatorDays: "日",
      dateOperatorWeeks: "週", // e.g. <dateFieldName> is the last 4 weeks
      dateOperatorMonths: "月",
      dateOperatorInTheLast: "以内である",
      dateOperatorNotInTheLast: "以内でない",
      dateOperatorIsBetween: "の間にある",
      dateOperatorIsNotBetween: "の間にない",
      dateOperatorIsBlank: "空である",
      dateOperatorIsNotBlank: "空でない",
      numberOperatorIs: "に等しい", // e.g. <numberFieldName> is 1000
      numberOperatorIsNot: "に等しくない",
      numberOperatorIsAtLeast: "以上",
      numberOperatorIsLessThan: "より小さい",
      numberOperatorIsAtMost: "以下",
      numberOperatorIsGreaterThan: "より大きい",
      numberOperatorIsBetween: "の間にある",
      numberOperatorIsNotBetween: "の間にない",
      numberOperatorIsBlank: "空である",
      numberOperatorIsNotBlank: "空でない",
      string: "文字列",
      number: "数値",
      date: "日付",
      askForValues: "値の確認",
      prompt: "プロンプト",
      hint: "ヒント",
      error: {
        invalidParams: "無効なパラメーターです。",
        invalidUrl: "無効な URL です。",
        noFilterFields: "レイヤーには、フィルターに使用できるフィールドがありません。",
        invalidSQL: "無効な SQL 式です。",
        cantParseSQL: "SQL 式を解析できません。"
      },
      caseSensitive: "大文字/小文字を区別します",
      notSupportCaseSensitiveTip: "ホスト サービスでは、大文字/小文字を区別するクエリはサポートされていません。"
    },

    featureLayerSource: {
      layer: "レイヤー",
      browse: "参照",
      selectFromMap: "マップから選択",
      selectFromPortal: "Portal for ArcGIS から追加",
      addServiceUrl: "サービス URL を追加",
      inputLayerUrl: "レイヤー URL を入力",
      selectLayer: "現在のマップからフィーチャ レイヤーを選択",
      chooseItem: "フィーチャ レイヤー アイテムを選択",
      setServiceUrl: "フィーチャ サービスまたはマップ サービスの URL を入力",
      selectFromOnline: "ArcGIS Online から追加",
      chooseLayer: "フィーチャ レイヤーを選択します。"
    },
    queryableLayerSource: {
      layer: "レイヤー",
      browse: "参照",
      selectFromMap: "マップから選択",
      selectFromPortal: "Portal for ArcGIS から追加",
      addServiceUrl: "サービス URL の追加",
      inputLayerUrl: "レイヤー URL を入力",
      selectLayer: "現在のマップからレイヤーを選択します。",
      chooseItem: "アイテムを選択します。",
      setServiceUrl: "サービスの URL を入力します。",
      selectFromOnline: "ArcGIS Online から追加",
      chooseLayer: "レイヤーを選択します。"
    },
    gpSource: {
      selectFromPortal: "Portal for ArcGIS から追加",
      addServiceUrl: "サービス URL の追加",
      selectFromOnline: "ArcGIS Online から追加",
      setServiceUrl: "ジオプロセシング サービスの URL を入力します。",
      chooseItem: "ジオプロセシング サービス アイテムを選択します。",
      chooseTask: "ジオプロセシング タスクを選択します。"
    },
    itemSelector: {
      map: "マップ",
      selectWebMap: "Web マップの選択",
      addMapFromOnlineOrPortal: "アプリケーションの Web マップを、ArcGIS Online のパブリック コンテンツから検索するか、ArcGIS Online または Portal のプライベート コンテンツから検索して追加します。",
      searchMapName: "マップ名で検索...",
      searchNone: "検索対象が見つかりませんでした。もう一度試してください。",
      groups: "グループ",
      noneGroups: "グループはありません",
      signInTip: "ログイン セッションの期限が切れています。ブラウザーを更新して、ポータルにもう一度サイン インしてください。",
      signIn: "サイン イン",
      publicMap: "パブリック",
      myOrganization: "組織",
      myGroup: "マイ グループ",
      myContent: "マイ コンテンツ",
      count: "個数",
      fromPortal: "ポータルから",
      fromOnline: "ArcGIS.com から",
      noneThumbnail: "サムネイルは使用できません",
      owner: "所有者",
      signInTo: "サイン イン",
      lastModified: "最終更新日",
      moreDetails: "詳細"
    },
    featureLayerChooserFromPortal: {
      notSupportQuery: "サービスはクエリをサポートしていません。"
    },
    basicLayerChooserFromMap: {
      noLayersTip: "マップで利用できる適切なレイヤーがありません。"
    },
    layerInfosMenu: {
      titleBasemap: "ベースマップ",
      titleLayers: "操作レイヤー",
      labelLayer: "レイヤー名",
      itemZoomTo: "ズーム",
      itemTransparency: "透過表示",
      itemTransparent: "透明",
      itemOpaque: "不透明",
      itemMoveUp: "上に移動",
      itemMoveDown: "下に移動",
      itemDesc: "説明",
      itemDownload: "ダウンロード",
      itemToAttributeTable: "属性テーブルを開く"
    },
    imageChooser: {
      unsupportReaderAPI: "TODO: ブラウザーはファイル リーダー API をサポートしていません",
      readError: "ファイルの読み込みに失敗しました。",
      unknowError: "操作を完了できません",
      invalidType: "無効なファイル タイプです。",
      exceed: "ファイル サイズが 1024 KB を超えてはいけません。",
      enableFlash: "TODO: フラッシュを有効にしてください。",
      cropWaining: "少なくとも ${width} x ${height} ピクセルの写真を選択してください。",
      toolTip: "一番見やすい画像サイズは、幅 ${width} ピクセル、高さ ${height} ピクセルです。その他のサイズでは自動的にサイズが調整されます。使用できる画像形式は、PNG、GIF、JPEG です。"
    },
    simpleTable: {
      moveUp: "上に移動",
      moveDown: "下に移動",
      deleteRow: "削除",
      edit: "編集"
    },
    urlParams: {
      invalidToken: "無効なトークン",
      validateTokenError: "無効なトークンまたはネットワーク エラー"
    },
    exportTo: {
      exportTo: "エクスポート",
      toCSV: "CSV ファイルにエクスポート",
      toFeatureCollection: "フィーチャ コレクションにエクスポート",
      toGeoJSON: "GeoJSON にエクスポート"
    }
  })
);