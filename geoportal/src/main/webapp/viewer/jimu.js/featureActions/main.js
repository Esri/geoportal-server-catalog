///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
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

define(['./ZoomTo', './PanTo', './Flash', './ShowPopup', './ExportToCSV',
  './ExportToFeatureCollection', './ExportToGeoJSON', './ShowStatistics', './CreateLayer',
  './AddMarker', './RemoveMarker', './SaveToMyContent'], function(){
  return [{
    name: 'ZoomTo',
    uri: 'jimu/featureActions/ZoomTo'
  }, {
    name: 'PanTo',
    uri: 'jimu/featureActions/PanTo'
  }, {
    name: "Flash",
    uri: 'jimu/featureActions/Flash'
  }, {
    name: "ShowPopup",
    uri: 'jimu/featureActions/ShowPopup'
  }, {
    name: "ExportToCSV",
    uri: 'jimu/featureActions/ExportToCSV'
  }, {
    name: "ExportToFeatureCollection",
    uri: 'jimu/featureActions/ExportToFeatureCollection'
  }, {
    name: "ExportToGeoJSON",
    uri: 'jimu/featureActions/ExportToGeoJSON'
  }, {
    name: "ShowStatistics",
    uri: 'jimu/featureActions/ShowStatistics'
  }, {
    name: "CreateLayer",
    uri: 'jimu/featureActions/CreateLayer'
  }, {
    name: "AddMarker",
    uri: 'jimu/featureActions/AddMarker'
  }, {
    name: "RemoveMarker",
    uri: 'jimu/featureActions/RemoveMarker'
  }, {
    name: "SaveToMyContent",
    uri: 'jimu/featureActions/SaveToMyContent'
  }];
});
