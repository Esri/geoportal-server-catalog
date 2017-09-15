///////////////////////////////////////////////////////////////////////////
// Copyright © 2016 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
/**
 * For additional guidance please refer : http://links.esri.com/WAB/ReportDijit
 */
define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'jimu/utils',
  'dojo/Evented',
  './PageUtils',
  'dojo/text!./templates/ReportTemplate.html',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/window',
  'dojo/dom-construct',
  'dojo/dom-class',
  'dojo/dom-style',
  'dojo/dom',
  'dojo/string',
  'dojo/on',
  'esri/tasks/PrintParameters',
  'esri/tasks/PrintTemplate',
  'esri/tasks/PrintTask'
], function (
  declare,
  BaseWidget,
  jimuUtils,
  Evented,
  PageUtils,
  ReportTemplate,
  lang,
  array,
  Window,
  domConstruct,
  domClass,
  domStyle,
  dom,
  string,
  on,
  PrintParameters,
  PrintTemplate,
  PrintTask
) {
  return declare([BaseWidget, Evented], {
    baseClass: 'jimu-report',
    _printService: null, // to store the object of print service
    _printWindow: null, // to store the object of print window
    _sizeInPixels: {}, // to store size of report layout in pixels
    // When multiple maps are failed to print we need to show msg only once,
    // this flag will help in showing msg only once
    _shownUnableToPrintMapMsg: false,

    //options:
    printTaskUrl: null, // to store the print task URL
    reportLogo: "", // to store path to report logo
    reportLayout: {}, // to store the report layout
    maxNoOfCols: 3, // to store table columns
    alignNumbersToRight: false, // to store the default number alignment
    styleSheets: [], // to store the external stylesheets
    styleText: "", // to store style text

    //public methods:
    //print(reportTitle, printData)

    //events:
    //reportError

    constructor: function () {
      this.inherited(arguments);
      this._sizeInPixels = {};
      this.printTaskUrl = null;
      this.reportLayout = {};
      this.styleSheets = [];
    },

    postMixInProperties: function () {
      this.nls = lang.mixin(window.jimuNls.common, window.jimuNls.report);
    },

    postCreate: function () {
      var defaultReportLayout;
      //default values for reportLayout
      defaultReportLayout = {
        "pageSize": PageUtils.PageSizes.A4,
        "orientation": PageUtils.Orientation.Portrait
      };
      this.inherited(arguments);
      this.setReportLayout(this.reportLayout, defaultReportLayout);
      //Set report page layout dpi to 96
      this.reportLayout.dpi = 96;
      //if print task url is defined use it and create print task object
      if (this.printTaskUrl) {
        this._createPrintTask();
      }
    },

    /**
     * This function is used to set the report layout as per the configuration
     */
    setReportLayout: function (newLayout, defaultReportLayout) {
      //if default report layout is not set, use current layout as default
      if (!defaultReportLayout) {
        defaultReportLayout = this.reportLayout;
      }
      //validate and mixin the new layout parameters
      if (this._validateParameters(newLayout)) {
        //mixin the user defined properties for reportLayout
        this.reportLayout = lang.mixin(defaultReportLayout, newLayout);
      }
      else {
        this.reportLayout = defaultReportLayout;
      }
    },

    /**
     * This function is used to set the map layout in printTemplate object
     * according to selected page size in  report size parameter
     */
    setMapLayout: function (printTemplate) {
      var mapLayout;
      //if map layout is valid use that else default to "MAP_ONLY"
      if (this.reportLayout.pageSize.MapLayout) {
        mapLayout = this.reportLayout.pageSize.MapLayout;
      } else {
        mapLayout = "MAP_ONLY";
      }
      //if layout is "MAP_ONLY" set the exportOptions in printTemplate
      //else only add selected orientation to layout
      if (mapLayout === "MAP_ONLY") {
        printTemplate.exportOptions = {
          dpi: this.reportLayout.dpi
        };
        //according to orientation set the height & width of the map image
        if (this.reportLayout.orientation.Type === PageUtils.Orientation.Landscape.Type &&
          this.reportLayout.pageSize !== PageUtils.PageSizes.Custom) {
          printTemplate.exportOptions.width = this._sizeInPixels.Height;
          printTemplate.exportOptions.height = this._sizeInPixels.Width;
        } else {
          printTemplate.exportOptions.width = this._sizeInPixels.Width;
          printTemplate.exportOptions.height = this._sizeInPixels.Height;
        }
      } else {
        mapLayout += " " + this.reportLayout.orientation.Type;
      }
      printTemplate.layout = mapLayout;
      return printTemplate;
    },

    /**
     * This function is used to validate report size parameter
     * by detecting whether it is standard or custom
     */
    _validateParameters: function () {
      //if page is custom use custom sizes provided by the user
      if (this.reportLayout.pageSize === PageUtils.PageSizes.Custom && !this.reportLayout.size) {
        return false;
      }
      return true;
    },

    /**
     * This function is used to create the print task service
     */
    _createPrintTask: function () {
      this._printService = new PrintTask(this.printTaskUrl, { async: !1 });
    },

    /**
     * This function is used to create the parameters needed for printing map image in report
     */
    _createPrintMapParameters: function (mapParams) {
      var printParams, printTemplate, format;
      printTemplate = new PrintTemplate();
      //if printTemplate is defined use it as is
      //else create PrintTemplate based on selected report layout pageSize
      if (mapParams.printTemplate) {
        printTemplate = mapParams.printTemplate;
        //if format is not defined or it is not valid for img tag set format to jpg
        if (printTemplate.format) {
          format = printTemplate.format.toLowerCase();
          if (format !== "png32" && format !== "png8" && format !== "jpg" && format !== "gif") {
            printTemplate.format = "jpg";
          }
        } else {
          printTemplate.format = "jpg";
        }
      } else {
        printTemplate = this.setMapLayout(printTemplate);
        printTemplate.layoutOptions = {};
        printTemplate.preserveScale = false;
        printTemplate.showAttribution = true;
        printTemplate.format = "jpg";
      }
      printParams = new PrintParameters();
      printParams.map = mapParams.map;
      printParams.outSpatialReference = mapParams.map.spatialReference;
      printParams.template = printTemplate;
      return printParams;
    },

    /**
     * This function is used to print the report details
     */
    print: function (reportTitle, printData) {
      var a, b;
      if (this._printService) {
        this._shownUnableToPrintMapMsg = false;
        //close if prev window is available
        if (this._printWindow) {
          this._printWindow.close();
        }
        a = screen.width / 2;
        b = screen.height / 1.5;
        a = "toolbar\x3dno, location\x3dno, directories\x3dno, status\x3dyes, menubar\x3dno," +
          "scrollbars\x3dyes, resizable\x3dyes, width\x3d" + a + ", height\x3d" + b + ", top\x3d" +
          (screen.height / 2 - b / 2) + ", left\x3d" + (screen.width / 2 - a / 2);
        this._printWindow = window.open("", "report", a, true);
        setTimeout(lang.hitch(this, function () {
          Window.withDoc(this._printWindow.document,
            lang.hitch(this, function () {
              //write the report template in document of new window
              this._printWindow.document.open("text/html", "replace");
              this._printWindow.document.write(ReportTemplate);
              //Set jimu-rtl class to body if language is RTL
              if (window.isRTL) {
                domClass.add(dom.byId("reportBody"), "jimu-rtl");
              }
              //load external css if available
              if ((this.styleSheets && this.styleSheets.length > 0) ||
                (this.styleText && this.styleText !== '')) {
                this._addExternalStyleSheets();
              }
              //Set preview page size
              this._setPageSize();
              //Set Print preview labels
              this._setButtonLabels();
              //Set Report dimensions message
              this._setReportSizeMessage();
              //Set Report logo
              this._setReportLogo();
              //Set Report title
              this._setReportTitle(reportTitle);
              //Set Report data
              this._setReportData(printData);
              //Set foot notes
              this._setFootNotes();
              //after writing the content close the document
              this._printWindow.document.close();
            }));
        }), 500);
      } else {
        this.emit("reportError");
      }
    },

    /**
     * This function is used to add external stylesheet needed for printing report
     */
    _addExternalStyleSheets: function () {
      var headNode = dom.byId("reportHead");
      if (headNode) {
        //add external style sheets.
        array.forEach(this.styleSheets, lang.hitch(this, function (styleSheetURL) {
          domConstruct.create("link",
            { "rel": "stylesheet", "type": "text/css", "href": styleSheetURL }, headNode);
        }));
        //add external style text if any
        //Note: external style text will be added at the end so that they have the precedence.
        if (this.styleText) {
          domConstruct.create("style",
            { "type": "text/css", innerHTML: this.styleText }, headNode);
        }
      }
    },

    /**
     * This function is used to set the report page size
     */
    _setPageSize: function () {
      var sizeInInches, sizeInPixels, pageWidthInPixels, domNode;
      domNode = dom.byId("reportMain");
      //calculate the page size in pixels
      if (this.reportLayout) {
        sizeInInches = this.reportLayout.pageSize;
        //if page is custom use custom sizes provided by the user
        if (this.reportLayout.pageSize === PageUtils.PageSizes.Custom && this.reportLayout.size) {
          sizeInInches = this.reportLayout.size;
        }
        //using size in inches and dpi calculate the size in pixels
        sizeInPixels = PageUtils.getPageSizeInPixels(sizeInInches, this.reportLayout.dpi);
      }
      //according to orientation set the height & width of the page
      if (this.reportLayout.orientation.Type === PageUtils.Orientation.Landscape.Type &&
        this.reportLayout.pageSize !== PageUtils.PageSizes.Custom) {
        pageWidthInPixels = sizeInPixels.Height;
      } else {
        pageWidthInPixels = sizeInPixels.Width;
      }
      this._sizeInPixels = sizeInPixels;
      domStyle.set(domNode, { "width": pageWidthInPixels + "px" });
    },

    /**
     * This function is used to set the report data
     */
    _setReportData: function (printData) {
      var htmlDataDiv = dom.byId("reportData");
      var errorButtonNode = dom.byId("showErrorButton");
      errorButtonNode.innerHTML = this.nls.unableToPrintMapMsg;
      if (htmlDataDiv) {
        array.forEach(printData, lang.hitch(this, function (reportData) {
          var domNode = domConstruct.create("div", {}, htmlDataDiv);
          if (reportData.addPageBreak) {
            domClass.add(domNode, "esriCTPageBreak");
          }
          if (reportData.type === "table") {
            this._formatAndRenderTables(domNode, reportData);
          } else if (reportData.type === "html") {
            this._renderHTMLData(domNode, reportData);
          } else if (reportData.type === "map") {
            if (reportData.title) {
              this._addSectionTitle(reportData.title, domNode);
            }
            domClass.add(domNode, "esriCTReportMap esriCTReportMapWait");
            if (reportData.extent) {
              reportData.data.map.setExtent(reportData.extent);
            }
            this._executePrintTask(reportData, domNode, errorButtonNode);
          } else if (reportData.type === "note") {
            this._createReportNote(domNode, reportData);
          }
        }));
      }
    },

    /**
     * This function is used to set the report footnote message
     */
    _setFootNotes: function () {
      var formattedFootNotes, footNotesDiv;
      footNotesDiv = dom.byId("footNotes");
      if (footNotesDiv && this.footNotes) {
        //Format value so that url in value will appear as link.
        formattedFootNotes = jimuUtils.sanitizeHTML(this.footNotes ? this.footNotes : '');
        footNotesDiv.innerHTML = jimuUtils.fieldFormatter.getFormattedUrl(formattedFootNotes);
      }
    },

    /**
     * This function is used to set the report logo
     */
    _setReportLogo: function () {
      var reportLogoNode, reportMain, printTitle, reportHeader;
      reportLogoNode = dom.byId("reportLogo");
      if (reportLogoNode && this.reportLogo) {
        domClass.remove(reportLogoNode, "esriCTHidden");
        reportLogoNode.src = this.reportLogo;
        reportHeader = dom.byId("reportHeader");
        reportMain = dom.byId("reportMain");
        printTitle = dom.byId("printTitleDiv");
        //reposition report title in rtl mode
        if (window.isRTL) {
          domConstruct.place(printTitle, reportHeader, "first");
        }
        //based on logo width, set the width of reportTitle
        //max 50% of page width will be considered for logo
        if (reportMain && printTitle) {
          if (reportLogoNode.complete) {
            //In IE 'load' property doesn't work when image loads from cache
            domStyle.set(printTitle, {
              "width": (reportMain.clientWidth - reportLogoNode.clientWidth - 51) + "px"
            });
          }
          this.own(on(reportLogoNode, "load", lang.hitch(this, function () {
            // IE specific, as image doesn't load immediately hence using setTimeout
            setTimeout(lang.hitch(this, function () {
              domStyle.set(printTitle, {
                "width": (reportMain.clientWidth - reportLogoNode.clientWidth - 51) + "px"
              });
            }), 100);
          })));
        }
      }
    },

    /**
     * This function is used to set the report title
     */
    _setReportTitle: function (reportTitle) {
      var reportTitleDiv = dom.byId("reportTitle");
      if (reportTitleDiv && reportTitle) {
        reportTitleDiv.value = reportTitle;
      }
    },

    /**
     * This function is used to set the report title
     */
    _createReportNote: function (node, reportData) {
      var textArea, reportTitle = "", titleNode, notesParagraph;
      if (reportData.title) {
        reportTitle = reportData.title;
      }
      //add title to the notes section
      titleNode = this._addSectionTitle(reportTitle, node);
      domClass.add(titleNode, "esriCTNotesTitle");
      //create textarea for entering notes
      textArea = domConstruct.create("textarea", {
        "class": "esriCTReportNotes",
        "placeholder": this.nls.notesHint,
        "rows": 5
      }, node);
      //create paragraph for entering notes
      notesParagraph = domConstruct.create("p", {
        "class": "esriCTReportNotesParagraph"
      }, node);
      domClass.add(node, "esriCTNotesContainer");
      //set value to the default text
      if (reportData.defaultText) {
        textArea.value = reportData.defaultText;
      }
      //updates the size of text area as user enters any text in it
      //also set the entered value in paragraph which is used to display notes in print mode
      this.own(on(textArea, "keydown, change", function () {
        textArea.style.height = 'auto';
        notesParagraph.innerHTML = jimuUtils.sanitizeHTML(textArea.value ? textArea.value : '');
        textArea.style.height = textArea.scrollHeight + 'px';
      }));
    },

    /**
     * This function is used to set the report size message like
     * dimension, page size & orientation
     */
    _setReportSizeMessage: function () {
      var reportBarMsg, pageDimensions, sizeInInches, format;
      //Get configured size in case of 'Custom' page layout else use predefined pageSize
      //In case of Custom page layout size name will be empty else use configured page size name
      if (this.reportLayout.pageSize === PageUtils.PageSizes.Custom && this.reportLayout.size) {
        sizeInInches = this.reportLayout.size;
        format = this.reportLayout.pageSize;
      } else {
        sizeInInches = this.reportLayout.pageSize;
        format = this.reportLayout.pageSize.SizeName;
      }
      //according to orientation set the height & width of the page
      if (this.reportLayout.orientation.Type === PageUtils.Orientation.Landscape.Type &&
        this.reportLayout.pageSize !== PageUtils.PageSizes.Custom) {
        pageDimensions = " (" + sizeInInches.Height + "'' X " +
          sizeInInches.Width + "'') ";
      } else {
        pageDimensions = " (" + sizeInInches.Width + "'' X " +
          sizeInInches.Height + "'') ";
      }
      reportBarMsg = dom.byId("reportBarMsg");
      //show page format, size and orientation
      reportBarMsg.innerHTML = string.substitute(this.nls.reportDimensionsMsg,
        {
          paperSize: format + pageDimensions + this.reportLayout.orientation.Text
        });
    },

    /**
     * This function is used to set the label of print and close button
     */
    _setButtonLabels: function () {
      //Set Report button title and label
      var printButton = dom.byId("printButton");
      printButton.innerHTML = this.nls.printButtonLabel;
      printButton.title = this.nls.printButtonLabel;

      var closeButton = dom.byId("closeButton");
      closeButton.innerHTML = this.nls.close;
      closeButton.title = this.nls.close;
    },

    /**
     * This function is used to execute print task that is
     * use to display the map and aoi in the map section
     */
    _executePrintTask: function (mapParams, parentNode, errorNode) {
      var printParams;
      printParams = this._createPrintMapParameters(mapParams);
      this._printService.execute(printParams,
        lang.hitch(this, function (printResult) {
          var mapImg;
          if (parentNode) {
            domClass.remove(parentNode, "esriCTReportMapWait");
            mapImg = domConstruct.create("img", {
              "src": printResult.url,
              "class": "esriCTReportMapImg"
            }, parentNode);
            //if orientation is landscape add landscapeMap class
            if (this.reportLayout.orientation.Type === PageUtils.Orientation.Landscape.Type) {
              domClass.add(mapImg, "esriCTReportLandscapeMapImg");
            }
          }
        }), lang.hitch(this, function () {
          domClass.replace(parentNode,
            "esriCTReportMapFail", "esriCTPageBreak esriCTReportMapWait");
          //Only show map failed message once
          if (!this._shownUnableToPrintMapMsg) {
            this._shownUnableToPrintMapMsg = true;
            errorNode.click();
          }
        }));
    },

    /**
     * This function is used to render the HTML data in print report
     */
    _renderHTMLData: function (parentNode, reportData) {
      var htmlContainer;
      htmlContainer = domConstruct.create("div", { "class": "esriCTHTMLData" }, parentNode);
      if (reportData.title) {
        this._addSectionTitle(reportData.title, htmlContainer);
      }
      domConstruct.create("div", { innerHTML: reportData.data }, htmlContainer);
    },

    /**
     * This function is used to add title to different sections in print report
     */
    _addSectionTitle: function (title, titleParent) {
      var titleNode;
      var sanitizedTitle = jimuUtils.sanitizeHTML(title ? title : '');
      titleNode = domConstruct.create("div", {
        "innerHTML": sanitizedTitle,
        "class": sanitizedTitle ? "esriCTSectionTitle" : ""
      }, titleParent);
      return titleNode;
    },

    /**
     * This function is used to create the format of report table
     */
    _formatAndRenderTables: function (tableParentNode, reportData) {
      var tableInfo = reportData.data;
      var i, j, colsTempArray, rowsTempArray, chunk = this.maxNoOfCols;
      //table cols can be overridden by setting in the table data properties
      if (tableInfo.maxNoOfCols) {
        chunk = tableInfo.maxNoOfCols;
      }
      for (i = 0, j = tableInfo.cols.length; i < j; i += chunk) {
        var newTableInfo = { cols: [], rows: [] };
        if (i === 0) {
          newTableInfo.title = reportData.title;
        } else {
          newTableInfo.title = "";
        }
        colsTempArray = tableInfo.cols.slice(i, i + chunk);
        rowsTempArray = [];
        for (var k = 0; k < tableInfo.rows.length; k++) {
          rowsTempArray.push(tableInfo.rows[k].slice(i, i + chunk));
        }
        newTableInfo.cols = colsTempArray;
        newTableInfo.rows = rowsTempArray;
        this._renderTable(
          domConstruct.create("div", {}, tableParentNode),
          newTableInfo, reportData.data.showRowIndex);
      }
    },

    /**
     * This function is used to create the UI of report dynamically like
     * table of layer names & field data & set the data in it
     */
    _renderTable: function (tableParentNode, tableInfo, showRowIndex) {
      var table, tableBody, tableHeaderRow;
      this._addSectionTitle(tableInfo.title, tableParentNode);
      table = domConstruct.create("table",
        { "cellpadding": 5, "style": { "width": "100%" }, "class": "esriCTTable" },
        tableParentNode);
      tableBody = domConstruct.create("tbody", {}, table);

      tableHeaderRow = domConstruct.create("tr", {}, tableBody);
      if (showRowIndex) {
        domConstruct.create("th",
          { "innerHTML": "#", style: { "width": "20px" } }, tableHeaderRow);
      }
      array.forEach(tableInfo.cols, lang.hitch(this, function (col) {
        domConstruct.create("th",
          { "innerHTML": col }, tableHeaderRow);
      }));
      array.forEach(tableInfo.rows, lang.hitch(this, function (eachRow, index) {
        var tableRow;
        tableRow = domConstruct.create("tr", {}, tableBody);
        if (showRowIndex) {
          domConstruct.create("td", {
            "innerHTML": index + 1,
            "style": { "word-wrap": "normal" } //to always show entire number avoid break-word
          }, tableRow);
        }
        array.forEach(eachRow, lang.hitch(this, function (rowValue) {
		  //Format value so that url in value will appear as link.
          var formattedRowValue = jimuUtils.fieldFormatter.getFormattedUrl(rowValue);
          
          var colData = domConstruct.create("td", { "innerHTML": formattedRowValue }, tableRow);
          if (this.alignNumbersToRight && !isNaN(parseFloat(rowValue))) {
            domClass.add(colData, "esriCTNumber");
          }
        }));
      }));
    }
  });
});