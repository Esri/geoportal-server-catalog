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
          oldConfig.widgetOnScreen.panel.uri === 'themes/FoldableTheme/panels/TitlePanel/Panel'){
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