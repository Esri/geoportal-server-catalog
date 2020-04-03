///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
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
define([
], function () {
  var mo = {};

  mo.Orientation = { // to store the object containing Orientation types
    "Landscape": {"Type":"Landscape", "Text":window.jimuNls.report.landscape},
    "Portrait": {"Type":"Portrait", "Text":window.jimuNls.report.portrait}
  };

  /**
   * MapLayout : For page sizes that have corresponding templates in print service (OOB),
   * that template  is used (eg: A3, A4, Letter etc), and for all other cases,
   * where a matching template is not available, the "MAP_ONLY" template is used.
   */
  mo.PageSizes = { // to store the object containing page size like A0, A1, A2...
    //Considered portrait sizes
    "A0": {
      "Height": 46.80, "Width": 33.10,
      "SizeName": window.jimuNls.report.a0, "MapLayout": "MAP_ONLY" },
    "A1": {
      "Height": 33.10, "Width": 23.40,
      "SizeName": window.jimuNls.report.a1, "MapLayout": "MAP_ONLY" },
    "A2": {
      "Height": 23.40, "Width": 16.50,
      "SizeName": window.jimuNls.report.a2, "MapLayout": "MAP_ONLY" },
    "A3": {
      "Height": 16.50, "Width": 11.70,
      "SizeName": window.jimuNls.report.a3, "MapLayout": "A3" },
    "A4": {
      "Height": 11.70, "Width": 8.30,
      "SizeName": window.jimuNls.report.a4, "MapLayout": "A4" },
    "A5": {
      "Height": 8.30, "Width": 5.80,
      "SizeName": window.jimuNls.report.a5, "MapLayout": "MAP_ONLY" },

    "Letter_ANSI_A": {
      "Height": 11.00, "Width": 8.50,
      "SizeName": window.jimuNls.report.letter + " " + window.jimuNls.report.ansi_a,
      "MapLayout": "Letter ANSI A"
    },

    "Tabloid_ANSI_B": {
      "Height": 17.00, "Width": 11.00,
      "SizeName": window.jimuNls.report.tabloid + " " + window.jimuNls.report.ansi_b,
      "MapLayout": "Tabloid ANSI B"
    },

    "ANSI_C": {
      "Height": 22.00, "Width": 17.00,
      "SizeName": window.jimuNls.report.ansi_c, "MapLayout": "MAP_ONLY" },
    "ANSI_D": {
      "Height": 34.00, "Width": 22.00,
      "SizeName": window.jimuNls.report.ansi_d, "MapLayout": "MAP_ONLY" },
    "ANSI_E": {
      "Height": 44.00, "Width": 34.00,
      "SizeName": window.jimuNls.report.ansi_e, "MapLayout": "MAP_ONLY" },

    "Legal": {
      "Height": 14.00, "Width": 8.50,
      "SizeName": window.jimuNls.report.legal, "MapLayout": "MAP_ONLY" },

    "Custom": window.jimuNls.common.custom
  };

  /**
   * This function is used to get the report page size in pixels
   */
  mo.getPageSizeInPixels = function (sizeInInches, dpi) {
    var sizeInPixels = {
      "Height": sizeInInches.Height * dpi,
      "Width": sizeInInches.Width * dpi
    };
    return sizeInPixels;
  };

  return mo;
});