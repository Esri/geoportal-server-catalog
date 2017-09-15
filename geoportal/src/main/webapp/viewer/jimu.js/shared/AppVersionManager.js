define(['./BaseVersionManager', './utils'],
function(BaseVersionManager, utils) {

  //app version manager manage config and framework version
  function AppWidgetManager(){
    this.versions = [{
      version: '1.0',

      description: 'The version embedded in portal 10.3 final.',

      upgrader: function(oldConfig){
        return oldConfig;
      },
      //if true, means widgets that depend on the last version can run in this version.
      //if not set, means true.
      compatible: true
    }, {
      version: '1.1',

      description: 'The version embedded in online3.6, and used in developer edition 1.0.',

      upgrader: function(oldConfig){
        if(oldConfig.widgetOnScreen && oldConfig.widgetOnScreen.panel &&
          (oldConfig.widgetOnScreen.panel.uri === 'themes/FoldableTheme/panels/TitlePanel/Panel' ||
          oldConfig.widgetOnScreen.panel.uri === 'jimu/BaseWidgetPanel')){//In 1.0, tab theme use 'jimu/BaseWidgetPanel'
          oldConfig.widgetOnScreen.panel.uri = 'jimu/PreloadWidgetIconPanel';
        }

        return oldConfig;
      },
      compatible: true
    }, {
      version: '1.2',

      description: 'The version embedded in online3.7.',

      upgrader: function(oldConfig){
        var i = 0;
        if(oldConfig.widgetOnScreen && oldConfig.widgetOnScreen.widgets){
          //add splash widget
          var findSplashWidget = false;
          for(i = 0; i < oldConfig.widgetOnScreen.widgets.length; i++){
            if(oldConfig.widgetOnScreen.widgets[i].uri === 'widgets/Splash/Widget'){
              findSplashWidget = true;
            }
          }

          if(!findSplashWidget){
            oldConfig.widgetOnScreen.widgets.push({
              "uri": "widgets/Splash/Widget",
              "visible": false,
              "positionRelativeTo": "browser",
              "version": "1.2"
            });
          }

          var findTimesliderWidget = false;
          for(i = 0; i < oldConfig.widgetOnScreen.widgets.length; i++){
            if(oldConfig.widgetOnScreen.widgets[i].uri === 'widgets/TimeSlider/Widget'){
              findTimesliderWidget = true;
            }
          }

          if(!findTimesliderWidget){
            oldConfig.widgetOnScreen.widgets.push({
              "uri": "widgets/TimeSlider/Widget",
              "visible": false,
              "position": {
                "bottom": 55,
                "left": 7
              },
              "version": "1.2"
            });
          }

          var findSwipeWidget = false;
          for(i = 0; i < oldConfig.widgetOnScreen.widgets.length; i++){
            if(oldConfig.widgetOnScreen.widgets[i].uri === 'widgets/Swipe/Widget'){
              findSwipeWidget = true;
            }
          }

          if (!findSwipeWidget){
            oldConfig.widgetOnScreen.widgets.push({
              "uri": "widgets/Swipe/Widget",
              "visible": false,
              "position": {
                "top": 145,
                "left": 7
              },
              "version": "1.2"
            });
          }
        }

        return oldConfig;
      },
      compatible: true
    }, {
      version: '1.3',

      description: 'The version embedded in online3.8 & online3.9.',

      upgrader: function(oldConfig){
        upgradePositionRelativeTo(oldConfig);
        renamePreloadWidgetIconPanelToOnScreenWidgetPanel(oldConfig);
        add2PlaceholdersForFoldableTheme(oldConfig);
        renameGeocoderToSearch(oldConfig);
        addCloeableForSwipeAndTimeslider(oldConfig);
        addZoomSliderWidget(oldConfig);
        addLoadingPage(oldConfig);

        /*******************functions********************/

        function addCloeableForSwipeAndTimeslider(oldConfig){
          var i = 0;
          for(i = oldConfig.widgetOnScreen.widgets.length - 1; i >= 0; i--){
            var widget = oldConfig.widgetOnScreen.widgets[i];
            if(widget.uri === 'widgets/Swipe/Widget' && !widget.closeable){
              //add closeable check to avoid multiple enter in loop
              oldConfig.widgetOnScreen.widgets.splice(i, 1);
              if(widget.visible !== false){
                widget.closeable = true;
                //put swipe in the first avialable placeholder
                var placeIndex = getFirstPlaceholder(oldConfig);
                if(placeIndex >= 0){
                  widget.position = oldConfig.widgetOnScreen.widgets[placeIndex].position;
                  oldConfig.widgetOnScreen.widgets[placeIndex] = widget;
                }
              }
            }

            if(widget.uri === 'widgets/TimeSlider/Widget'){
              if(widget.visible === false){
                oldConfig.widgetOnScreen.widgets.splice(i, 1);
              }else{
                widget.closeable = true;
              }
            }
          }
        }

        function getFirstPlaceholder(oldConfig){
          var i = 0;
          for(i = 0; i < oldConfig.widgetOnScreen.widgets.length; i++){
            if(!oldConfig.widgetOnScreen.widgets[i].uri){
              return i;
            }
          }
          return -1;
        }

        function addZoomSliderWidget(oldConfig){
          oldConfig.widgetOnScreen.widgets.push({
            "uri": "widgets/ZoomSlider/Widget",
            "position": {
              "top": 5,
              "left": 7
            },
            "version": "1.3"
          });
        }

        function renameGeocoderToSearch(){
          var i = 0, j = 0;
          var findGeocoderWidget = false;
          for(i = 0; i < oldConfig.widgetOnScreen.widgets.length; i++){
            if(oldConfig.widgetOnScreen.widgets[i].uri === 'widgets/Geocoder/Widget'){
              findGeocoderWidget = true;
              break;
            }
          }

          var findSearchWidget = false;
          for(j = 0; j < oldConfig.widgetOnScreen.widgets.length; j++){
            if(oldConfig.widgetOnScreen.widgets[j].uri === 'widgets/Search/Widget'){
              findSearchWidget = true;
              break;
            }
          }

          if (!findSearchWidget) {
            if (findGeocoderWidget) {
              var geocoder = oldConfig.widgetOnScreen.widgets[i];
              geocoder.uri = "widgets/Search/Widget";
              geocoder.name = "Search";
            }
          }
        }

        function add2PlaceholdersForFoldableTheme(oldConfig){
          if(oldConfig.widgetOnScreen && oldConfig.widgetOnScreen.widgets) {
            //add two new placeholders for FoldableTheme
            if(oldConfig.theme && oldConfig.theme.name === 'FoldableTheme'){
              var ph_7 = null;
              var ph_8 = null;

              var placeholder = oldConfig.widgetOnScreen.widgets[4];

              if(placeholder){
                if(placeholder.position.top !== undefined){
                  //default layout of FoldableTheme
                  ph_7 = {
                    "position": {
                      "left": 205,
                      "top": 45
                    }
                  };
                  ph_8 = {
                    "position": {
                      "left": 255,
                      "top": 45
                    }
                  };
                }else{
                  //layout1 of FoldableTheme
                  ph_7 = {
                    "position": {
                      "left": 205,
                      "bottom": 55
                    }
                  };
                  ph_8 = {
                    "position": {
                      "left": 255,
                      "bottom": 55
                    }
                  };
                }

                oldConfig.widgetOnScreen.widgets.splice(7, 0, ph_7, ph_8);
              }
            }
          }
        }

        function upgradePositionRelativeTo(oldConfig){
          utils.visitElement(oldConfig, function(element){
            if(element.positionRelativeTo){
              if(element.position){
                element.position.relativeTo = element.positionRelativeTo;
              }else{
                element.position = {
                  relativeTo: element.positionRelativeTo
                };
              }

              if(element.panel){
                if(element.panel.position){
                  element.panel.position.relativeTo = element.panel.positionRelativeTo;
                }else{
                  element.panel.position = {
                    relativeTo: element.panel.positionRelativeTo
                  };
                }
              }
            }
          });

          var section = oldConfig.widgetOnScreen;
          if(section && section.panel &&
            section.panel.positionRelativeTo){

            if(section.panel.position){
              section.panel.position.relativeTo =
                section.panel.positionRelativeTo;
            }else{
              section.panel.position = {
                relativeTo: section.panel.positionRelativeTo
              };
            }
          }

          section = oldConfig.widgetPool;
          if(section && section.panel &&
            section.panel.positionRelativeTo){

            if(section.panel.position){
              section.panel.position.relativeTo =
                section.panel.positionRelativeTo;
            }else{
              section.panel.position = {
                relativeTo: section.panel.positionRelativeTo
              };
            }
          }
        }

        function renamePreloadWidgetIconPanelToOnScreenWidgetPanel(oldConfig){
          if(oldConfig.widgetOnScreen && oldConfig.widgetOnScreen.panel &&
            oldConfig.widgetOnScreen.panel.uri === 'jimu/PreloadWidgetIconPanel'){
            oldConfig.widgetOnScreen.panel.uri = 'jimu/OnScreenWidgetPanel';
          }
        }

        function addLoadingPage(oldConfig){
          //for XT1.2
          if(!oldConfig.loadingPage){
            oldConfig.loadingPage = {
              "backgroundColor": "#508dca",
              "backgroundImage":{
                "visible":false
              },
              "loadingGif":{
                "visible": true,
                "uri": "configs/loading/images/predefined_loading_1.gif",
                "width": 58,
                "height": 58
              }
            };
          }
        }

        return oldConfig;
      },
      compatible: true
    }, {
      version: '1.4',

      description: 'The version embedded in online3.10.',

      upgrader: function(oldConfig){
        updatePaddingRightOfHeaderController(oldConfig);

        /*******************functions********************/
        function updatePaddingRightOfHeaderController(oldConfig){
          if(oldConfig.theme){
            var themeName = oldConfig.theme.name;
            if(themeName === 'FoldableTheme' || themeName === 'JewelryBoxTheme'){
              if(oldConfig.widgetOnScreen){
                var widgets = oldConfig.widgetOnScreen.widgets;
                if(widgets && widgets.length > 0){
                  var uri = "themes/" + themeName + "/widgets/HeaderController/Widget";
                  var widget = null;
                  for(var i = 0; i < widgets.length; i++){
                    widget = widgets[i];
                    if(widget && widget.uri === uri){
                      if(widget.position){
                        if(widget.position.paddingRight === 310){
                          widget.position.paddingRight = 275;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        return oldConfig;
      },
      compatible: true
    }, {
      version: '2.0beta',

      description: 'The version for Developer Edition beta 2.0.',

      upgrader: function(oldConfig){
        oldConfig.keepAppState = true;
        return oldConfig;
      },

      compatible: true
    }, {
      version: '2.0',

      description: 'The version for Online 4.1.',

      upgrader: function(oldConfig){
        return oldConfig;
      },

      compatible: true
    }, {
      version: '2.0.1',

      description: 'The version for Developer Edition 2.0.',

      upgrader: function(oldConfig){
        return oldConfig;
      },

      compatible: true
    }, {
      version: '2.1',

      description: 'The version for Online 4.2.',

      upgrader: function(oldConfig){
        return oldConfig;
      },

      compatible: true
    }, {
      version: '2.2',

      description: 'The version for Online 4.3.',

      upgrader: function(oldConfig){
        return oldConfig;
      },

      compatible: true
    }, {
      version: '2.3',

      description: 'The version for Online 4.4.',

      upgrader: function(oldConfig){
        var onScreenWidgets = oldConfig.widgetOnScreen.widgets;
        var mobileOnScreenWidgets = oldConfig.mobileLayout && oldConfig.mobileLayout.widgetOnScreen &&
         oldConfig.mobileLayout.widgetOnScreen.widgets;
        addExtentNavigateWidget(oldConfig, onScreenWidgets, mobileOnScreenWidgets);

        /***************functions****************/
        function addExtentNavigateWidget(oldConfig, onScreenWidgets, mobileOnScreenWidgets){
          var themeName = oldConfig.theme && oldConfig.theme.name;
          if(themeName === 'FoldableTheme'){
            addExtentNavigateWidgetForFoldableTheme(onScreenWidgets, mobileOnScreenWidgets);
          }else if(themeName === 'BillboardTheme'){
            addExtentNavigateWidgetForBillboardTheme(onScreenWidgets);
          }else if(themeName === 'BoxTheme'){
            addExtentNavigateWidgetForBoxTheme(onScreenWidgets);
          }else if(themeName === 'JewelryBoxTheme'){
            addExtentNavigateWidgetForJewelryBoxTheme(onScreenWidgets);
          }else if(themeName === 'LaunchpadTheme'){
            addExtentNavigateWidgetForLaunchpadTheme(onScreenWidgets, mobileOnScreenWidgets);
          }else if(themeName === 'PlateauTheme'){
            addExtentNavigateWidgetForPlateauTheme(onScreenWidgets);
          }else if(themeName === 'TabTheme'){
            addExtentNavigateWidgetForTabTheme(onScreenWidgets);
          }
        }

        //if true, means a contains b.
        //if false, means a doesn't contain b
        //example: {uri: "widgets/Slide/Widget",position:{left:10,right:10}} contains {position:{left:10,right:10}}}
        function isContains(a, b){
          if(!a || !b){
            return false;
          }
          for(var key in b){
            if(b.hasOwnProperty(key)){
              if(typeof b[key] === "object"){
                if(!isContains(a[key], b[key])){
                  return false;
                }
              }else{
                if(a[key] !== b[key]){
                  return false;
                }
              }
            }
          }
          return true;
        }

        function addExtentNavigateWidgetForFoldableTheme(onScreenWidgets, mobileOnScreenWidgets){

          function isDefaultLayoutOrLayout1OrLayout2(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[11], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 7,
                "top": 110
              }
            });
            return isRightMyLocationWidget;
          }

          function isLayout3(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[11], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 12,
                "bottom": 164
              }
            });
            return isRightMyLocationWidget;
          }

          function isLayout4(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[11], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 164,
                "bottom": 14
              }
            });
            return isRightMyLocationWidget;
          }

          if(isDefaultLayoutOrLayout1OrLayout2()){
            //add ExtentNavigate for default layout of FoldableTheme
            onScreenWidgets.push({
              "uri": "widgets/ExtentNavigate/Widget",
              "visible": false,
              "position": {
                "top": 150,
                "left": 7
              },
              "version": "2.3"
            });
          }else if(isLayout3()){
            //add ExtentNavigate for layout3 of FoldableTheme
            onScreenWidgets.push({
              "uri": "widgets/ExtentNavigate/Widget",
              "visible": false,
              "position": {
                "left": 12,
                "bottom": 203
              },
              "version": "2.3"
            });
            if(mobileOnScreenWidgets){
              mobileOnScreenWidgets.push({
                "uri": "widgets/ExtentNavigate/Widget",
                "visible": false,
                "position": {
                  "right": 12,
                  "top": 211
                },
                "version": "2.3"
              });
            }
          }else if(isLayout4()){
            //add ExtentNavigate for layout4 of FoldableTheme
            onScreenWidgets.push({
              "uri": "widgets/ExtentNavigate/Widget",
              "visible": false,
              "position": {
                "left": 203,
                "bottom": 14,
                "height": 30
              },
              "version": "2.3"
            });
            for(var i = 0; i < onScreenWidgets.length; i++){
              var widget = onScreenWidgets[i];
              if(isContains(widget, {
                "uri": "widgets/Scalebar/Widget",
                "position": {
                  "left": 220,
                  "bottom": 5
                }
              })){
                widget.position.left = 288;
              }

              if(isContains(widget, {
                "uri": "widgets/Coordinate/Widget",
                "position": {
                  "left": 395,
                  "bottom": 5
                }
              })){
                widget.position.left = 463;
              }
            }
            if(mobileOnScreenWidgets){
              mobileOnScreenWidgets.push({
                "uri": "widgets/ExtentNavigate/Widget",
                "visible": false,
                "position": {
                  "top": 209,
                  "left": 12
                },
                "version": "2.3"
              });
            }
          }
        }

        function addExtentNavigateWidgetForBillboardTheme(onScreenWidgets){
          function isDefaultLayout(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[3], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 15,
                "top": 120
              }
            });
            var isRightPlaceholder = isContains(onScreenWidgets[12], {
              "position": {
                "left": 240,
                "top": 53
              }
            });
            return isRightMyLocationWidget && isRightPlaceholder;
          }

          function isLayout1(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[3], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 15,
                "top": 120
              }
            });
            var isRightPlaceholder = isContains(onScreenWidgets[12], {
              "position": {
                "top": 10,
                "right": 195
              }
            });
            return isRightMyLocationWidget && isRightPlaceholder;
          }

          function isLayout2(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[3], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 15,
                "bottom": 45
              }
            });
            var isRightPlaceholder = isContains(onScreenWidgets[12], {
              "position": {
                "left": 15,
                "top": 233
              }
            });
            return isRightMyLocationWidget && isRightPlaceholder;
          }

          function isLayout3(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[3], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 15,
                "top": 120
              }
            });
            var isRightPlaceholder = isContains(onScreenWidgets[12], {
              "position": {
                "right": 15,
                "top": 195
              }
            });
            return isRightMyLocationWidget && isRightPlaceholder;
          }

          if (isDefaultLayout()) {
            onScreenWidgets.push({
              "uri": "widgets/ExtentNavigate/Widget",
              "visible": false,
              "position": {
                "left": 15,
                "top": 159
              },
              "version": "2.3"
            });
          } else if (isLayout1()) {
            onScreenWidgets.push({
              "uri": "widgets/ExtentNavigate/Widget",
              "visible": false,
              "position": {
                "left": 15,
                "top": 159
              },
              "version": "2.3"
            });
          } else if (isLayout2()) {
            onScreenWidgets.push({
              "uri": "widgets/ExtentNavigate/Widget",
              "visible": false,
              "position": {
                "left": 15,
                "bottom": 195
              },
              "version": "2.3"
            });
          } else if (isLayout3()) {
            onScreenWidgets.push({
              "uri": "widgets/ExtentNavigate/Widget",
              "visible": false,
              "position": {
                "left": 15,
                "top": 159
              },
              "version": "2.3"
            });
          }
        }

        function addExtentNavigateWidgetForBoxTheme(onScreenWidgets){
          onScreenWidgets.push({
            "uri": "widgets/ExtentNavigate/Widget",
            "visible": false,
            "position": {
              "left": 10,
              "top": 131
            },
            "version": "2.3"
          });
        }

        function addExtentNavigateWidgetForJewelryBoxTheme(onScreenWidgets){
          function isDefaultLayout(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[9], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 7,
                "top": 110
              }
            });
            var isRightSearchWidget = isContains(onScreenWidgets[2], {
              "uri": "widgets/Search/Widget",
              "position": {
                "left": 55,
                "top": 5
              }
            });
            var isRightPlaceholder = isContains(onScreenWidgets[4], {
              "position": {
                "left": 55,
                "top": 45
              }
            });
            return isRightMyLocationWidget && isRightSearchWidget && isRightPlaceholder;
          }

          function isLayout1(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[9], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 7,
                "top": 110
              }
            });
            var isRightSearchWidget = isContains(onScreenWidgets[2], {
              "uri": "widgets/Search/Widget",
              "position": {
                "left": 55,
                "top": 5
              }
            });
            var isRightPlaceholder = isContains(onScreenWidgets[4], {
              "position": {
                "left": 7,
                "bottom": 70
              }
            });
            return isRightMyLocationWidget && isRightSearchWidget && isRightPlaceholder;
          }

          function isLayout2(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[9], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 7,
                "top": 110
              }
            });
            var isRightSearchWidget = isContains(onScreenWidgets[2], {
              "uri": "widgets/Search/Widget",
              "position": {
                "right": 2,
                "top": 2,
                "relativeTo": "browser"
              }
            });
            var isRightPlaceholder = isContains(onScreenWidgets[4], {
              "position": {
                "left": 7,
                "bottom": 70
              }
            });
            return isRightMyLocationWidget && isRightSearchWidget && isRightPlaceholder;
          }

          if(isDefaultLayout() || isLayout1() || isLayout2()){
            onScreenWidgets.push({
              "uri": "widgets/ExtentNavigate/Widget",
              "visible": false,
              "position": {
                "top": 148,
                "left": 7
              },
              "version": "2.3"
            });
          }
        }

        function addExtentNavigateWidgetForLaunchpadTheme(onScreenWidgets, mobileOnScreenWidgets){
          function isDefaultLayout(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[6], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 25,
                "top": 215
              }
            });
            return isRightMyLocationWidget;
          }

          function isLayout2(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[6], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 25,
                "top": 215
              }
            });
            return isRightMyLocationWidget;
          }

          if(isDefaultLayout() || isLayout2()){
            onScreenWidgets.push({
              "uri": "widgets/ExtentNavigate/Widget",
              "visible": false,
              "position": {
                "top": 255,
                "left": 25
              },
              "version": "2.3"
            });
            if(mobileOnScreenWidgets){
              mobileOnScreenWidgets.push({
                "uri": "widgets/ExtentNavigate/Widget",
                "visible": false,
                "position": {
                  "right": 10,
                  "bottom": 238
                },
                "version": "2.3"
              });
            }
          }
        }

        function addExtentNavigateWidgetForPlateauTheme(onScreenWidgets){
          function isDefaultLayout(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[6], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 7,
                "top": 110
              }
            });
            return isRightMyLocationWidget;
          }

          function isLayout1(){
            var isRightMyLocationWidget = isContains(onScreenWidgets[6], {
              "uri": "widgets/MyLocation/Widget",
              "position": {
                "left": 12,
                "bottom": 164
              }
            });
            return isRightMyLocationWidget;
          }

          if(isDefaultLayout()){
            onScreenWidgets.push({
              "uri": "widgets/ExtentNavigate/Widget",
              "visible": false,
              "position": {
                "top": 149,
                "left": 7
              },
              "version": 2.3
            });
          }

          if(isLayout1()){
            onScreenWidgets.push({
              "uri": "widgets/ExtentNavigate/Widget",
              "visible": false,
              "position": {
                "left": 12,
                "bottom": 201
              },
              "version": 2.3
            });
          }
        }

        function addExtentNavigateWidgetForTabTheme(onScreenWidgets){
          var isRightMyLocationWidget = isContains(onScreenWidgets[11], {
            "uri": "widgets/MyLocation/Widget",
            "position": {
              "left": 7,
              "top": 110
            }
          });

          if(isRightMyLocationWidget){
            onScreenWidgets.push({
              "uri": "widgets/ExtentNavigate/Widget",
              "visible": false,
              "position":{
                "top": 149,
                "left": 7
              },
              "version": "2.3"
            });
          }
        }

        return oldConfig;
      },

      compatible: true
    }, {
      version: '2.4',

      description: 'The version for Online 5.1.',

      upgrader: function(oldConfig){
        return oldConfig;
      },

      compatible: true
    }, {
      version: '2.5',

      description: 'The version for Online 5.2.',

      upgrader: function (oldConfig) {
        var onScreenWidgets = oldConfig.widgetOnScreen.widgets;
        addFullScreenWidget(oldConfig, onScreenWidgets);

        function addFullScreenWidget(oldConfig, onScreenWidgets) {
          var themeName = oldConfig.theme && oldConfig.theme.name;
          if (themeName === 'BillboardTheme') {
            addFullScreenWidgetForBillboardTheme(onScreenWidgets);
          } else if (themeName === 'BoxTheme') {
            addFullScreenWidgetForBoxTheme(onScreenWidgets);
          } else if (themeName === 'DartTheme') {
            addFullScreenWidgetForDartTheme(onScreenWidgets);
          } else if (themeName === 'FoldableTheme') {
            addFullScreenWidgetForFoldableTheme(onScreenWidgets);
          } else if (themeName === 'DashboardTheme') {
            addFullScreenWidgetForDashboardTheme(onScreenWidgets);
          } else if (themeName === 'JewelryBoxTheme') {
            addFullScreenWidgetForJewelryBoxTheme(onScreenWidgets);
          } else if (themeName === 'LaunchpadTheme') {
            addFullScreenWidgetForLaunchpadTheme(onScreenWidgets);
          } else if (themeName === 'PlateauTheme') {
            addFullScreenWidgetForPlateauTheme(onScreenWidgets);
          } else if (themeName === 'TabTheme') {
            addFullScreenWidgetForTabTheme(onScreenWidgets);
          }
        }
        //if true, means a contains b.
        //if false, means a doesn't contain b
        //example: {uri: "widgets/Slide/Widget",position:{left:10,right:10}} contains {position:{left:10,right:10}}}
        function isContains(a, b) {
          if (!a || !b) {
            return false;
          }
          for (var key in b) {
            if (b.hasOwnProperty(key)) {
              if (typeof b[key] === "object") {
                if (!isContains(a[key], b[key])) {
                  return false;
                }
              } else {
                if (a[key] !== b[key]) {
                  return false;
                }
              }
            }
          }
          return true;
        }
        function findWidget(onScreenWidgets, url, idx) {
          if (!idx) {
            var idx = 0;
          }
          for (var i = 0, len = onScreenWidgets.length; i < len; i++) {
            var widget = onScreenWidgets[i];
            if (widget && widget.uri && widget.uri === url) {
              return widget;
            }
          }

          return null;
        }

        //1 BillboardTheme
        function addFullScreenWidgetForBillboardTheme(onScreenWidgets) {
          function isDefaultLayoutOrLayout2() {
            var isInThatPosition0 = isContains(onScreenWidgets[8], {
              "position": {
                "left": 60,
                "top": 53
              }
            });
            var isInThatPosition2 = isContains(onScreenWidgets[8], {
              "position": {
                "left": 15,
                "top": 53
              }
            });
            return isInThatPosition0 || isInThatPosition2;
          }
          function isLayout1OrLayout3() {
            var isInThatPosition1 = isContains(onScreenWidgets[8], {
              "position": {
                "top": 10,
                "right": 15
              }
            });
            var isInThatPosition3 = isContains(onScreenWidgets[8], {
              "position": {
                "right": 15,
                "top": 10
              }
            });
            return isInThatPosition1 || isInThatPosition3;
          }

          if (isDefaultLayoutOrLayout2()) {
            onScreenWidgets.push({
              "uri": "widgets/FullScreen/Widget",
              "visible": false,
              "position": {
                "right": 8,
                "top": 8
              },
              "version": "2.5"
            });
          } else/* if (isLayout1OrLayout3())*/ {
            onScreenWidgets.push({
              "uri": "widgets/FullScreen/Widget",
              "visible": false,
              "position": {
                "right": 8,
                "bottom": 55
              },
              "version": "2.5"
            });
          }
        }

        //2 BoxTheme
        function addFullScreenWidgetForBoxTheme(onScreenWidgets) {
          function isDefaultLayout() {
            var isInThatPosition0 = isContains(findWidget(onScreenWidgets, "themes/BoxTheme/widgets/BoxController/Widget"), {
              "position": {
                "right": 0,
                "bottom": 0
              }
            });
            return isInThatPosition0;
          }
          function isLayout1() {
            var isInThatPosition1 = isContains(findWidget(onScreenWidgets, "themes/BoxTheme/widgets/BoxController/Widget"), {
              "position": {
                "right": 0,
                "top": 0
              }
            });
            return isInThatPosition1;
          }

          if (isDefaultLayout()) {
            onScreenWidgets.push({
              "uri": "widgets/FullScreen/Widget",
              "visible": false,
              "position": {
                "right": 8,
                "top": 8
              },
              "version": "2.5"
            });
          } else/* if (isLayout1()) */ {
            onScreenWidgets.push({
              "uri": "widgets/FullScreen/Widget",
              "visible": false,
              "position": {
                "right": 8,
                "bottom": 8
              },
              "version": "2.5"
            });
          }
        }

        //3 DartTheme
        function addFullScreenWidgetForDartTheme(onScreenWidgets) {
          onScreenWidgets.push({
            "uri": "widgets/FullScreen/Widget",
            "visible": false,
            "position": {
              "right": 8,
              "top": 8
            },
            "version": "2.5"
          });
        }

        //4 FoldableTheme
        function addFullScreenWidgetForFoldableTheme(onScreenWidgets, mobileOnScreenWidgets) {
          onScreenWidgets.push({
            "uri": "widgets/FullScreen/Widget",
            "visible": false,
            "position": {
              "right": 8,
              "top": 8
            },
            "version": "2.5"
          });
        }

        //5 DashboardTheme
        function addFullScreenWidgetForDashboardTheme(onScreenWidgets, mobileOnScreenWidgets) {
          onScreenWidgets.push({
            "uri": "widgets/FullScreen/Widget",
            "visible": false,
            "position": {
              "right": 8,
              "top": 8
            },
            "version": "2.5"
          });
        }

        //6 LaunchpadTheme
        function addFullScreenWidgetForLaunchpadTheme(onScreenWidgets) {
          onScreenWidgets.push({
            "uri": "widgets/FullScreen/Widget",
            "visible": false,
            "position": {
              "right": 70,
              "top": 20
            },
            "version": "2.5"
          });
        }

        //7 JewelryBoxTheme
        function addFullScreenWidgetForJewelryBoxTheme(onScreenWidgets) {
          onScreenWidgets.push({
            "uri": "widgets/FullScreen/Widget",
            "visible": false,
            "position": {
              "right": 8,
              "top": 8
            },
            "version": "2.5"
          });
        }

        //8 PlateauTheme
        function addFullScreenWidgetForPlateauTheme(onScreenWidgets) {
          onScreenWidgets.push({
            "uri": "widgets/FullScreen/Widget",
            "visible": false,
            "position": {
              "right": 8,
              "top": 8
            },
            "version": "2.5"
          });
        }

        //9 TabTheme
        function addFullScreenWidgetForTabTheme(onScreenWidgets) {
          function isDefaultLayout() {
            var isInThatPosition0 = isContains(onScreenWidgets[7], {
              "position": {
                "left": 45,
                "top": 45
              }
            });
            return isInThatPosition0;
          }
          function isLayout1() {
            var isInThatPosition1 = isContains(onScreenWidgets[7], {
              "position": {
                "right": 110,
                "top": 10
              }
            });
            return isInThatPosition1;
          }

          if (isDefaultLayout()) {
            onScreenWidgets.push({
              "uri": "widgets/FullScreen/Widget",
              "visible": false,
              "position": {
                "right": 8,
                "top": 8
              },
              "version": "2.5"
            });
          } else/* if (isLayout1()) */ {
            onScreenWidgets.push({
              "uri": "widgets/FullScreen/Widget",
              "visible": false,
              "position": {
                "right": 8,
                "bottom": 55
              },
              "version": "2.5"
            });
          }
        }

        return oldConfig;
      },

      compatible: true
    }];

    this.isCompatible = function(_oldVersion, _newVersion){
      var oldVersionIndex = this.getVersionIndex(_oldVersion);
      var newVersionIndex = this.getVersionIndex(_newVersion);
      var i;
      for(i = oldVersionIndex + 1; i <= newVersionIndex; i++){
        if(this.versions[i].compatible === false){
          return false;
        }
      }
      return true;
    };
  }

  AppWidgetManager.prototype = new BaseVersionManager();
  AppWidgetManager.prototype.constructor = AppWidgetManager;
  return AppWidgetManager;
});