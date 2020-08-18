/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojox/html/entities",
    "dijit/Dialog",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/i18n!app/nls/resources",
    "dojo/text!./templates/ItemData.html"
], function (declare, lang, array, domConstruct, entities, Dialog, TemplatedMixin, _WidgetsInTemplateMixin, i18n, template) {
    return declare("app.management.panels.customColumn", [Dialog, TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        i18n: i18n,
        
        // list specific fields in the desired order; fields not mentioned will be placed last in the alphabetic order.
        fieldOrder: ["Item Title", "Map Nw Lon Lat", "Map Nw Xy", "Map Ne Xy","Map Sw Xy","Map Se Xy","Location", "Publication Date", "Type Media"],
        // list field to skip
        fieldsToDrop: ["Publication Date Txt"],
        // fields to rename
        fieldsToRename: {
          "Map Nw Lon Lat": "Longitude, Latitude",
          "Map Nw Xy": "NW corner X, Y"
          "Map Ne Xy": "NE corner X, Y"	  
          "Map Ne Xy": "SW corner X, Y"	 
          "Map Ne Xy": "SE corner X, Y"	 
        },
        
        postCreate: function() {
          this.inherited(arguments);
          
          // normalize special fileds names
          this.fieldOrder = this.fieldOrder.map( function(name) {
            return name.toLowerCase();
          });
          this.fieldsToDrop = this.fieldsToDrop.map( function(name) {
            return name.toLowerCase();
          });
          
          // combine lon lat into a single field
          if (this.item.src_map_nw_lon_txt && this.item.src_map_nw_lat_txt) {
            this.item.src_map_nw_lon_lat_txt = "" + this.item.src_map_nw_lon_txt + ", " + this.item.src_map_nw_lat_txt;
            delete this.item.src_map_nw_lon_txt;
            delete this.item.src_map_nw_lat_txt;
          }
          if (this.item.src_map_ne_lon_txt && this.item.src_map_ne_lat_txt) {
              this.item.src_map_ne_lon_lat_txt = "" + this.item.src_map_ne_lon_txt + ", " + this.item.src_map_ne_lat_txt;
              delete this.item.src_map_ne_lon_txt;
              delete this.item.src_map_ne_lat_txt;
            }
          if (this.item.src_map_sw_lon_txt && this.item.src_map_sw_lat_txt) {
              this.item.src_map_sw_lon_lat_txt = "" + this.item.src_map_sw_lon_txt + ", " + this.item.src_map_sw_lat_txt;
              delete this.item.src_map_sw_lon_txt;
              delete this.item.src_map_sw_lat_txt;
            }
          if (this.item.src_map_se_lon_txt && this.item.src_map_se_lat_txt) {
              this.item.src_map_se_lon_lat_txt = "" + this.item.src_map_se_lon_txt + ", " + this.item.src_map_se_lat_txt;
              delete this.item.src_map_se_lon_txt;
              delete this.item.src_map_se_lat_txt;
            }
          
          // combine x y into a single field
          if (this.item.src_map_nw_x_txt && this.item.src_map_nw_y_txt) {
            this.item.src_map_nw_xy_txt = "" + this.item.src_map_nw_x_txt + ", " + this.item.src_map_nw_y_txt;
            delete this.item.src_map_nw_x_txt;
            delete this.item.src_map_nw_y_txt;
          }
          if (this.item.src_map_ne_x_txt && this.item.src_map_ne_y_txt) {
              this.item.src_map_ne_xy_txt = "" + this.item.src_map_ne_x_txt + ", " + this.item.src_map_ne_y_txt;
              delete this.item.src_map_ne_x_txt;
              delete this.item.src_map_ne_y_txt;
            }   
          if (this.item.src_map_sw_x_txt && this.item.src_map_sw_y_txt) {
              this.item.src_map_sw_xy_txt = "" + this.item.src_map_sw_x_txt + ", " + this.item.src_map_sw_y_txt;
              delete this.item.src_map_sw_x_txt;
              delete this.item.src_map_sw_y_txt;
            } 
          if (this.item.src_map_se_x_txt && this.item.src_map_se_y_txt) {
              this.item.src_map_se_xy_txt = "" + this.item.src_map_se_x_txt + ", " + this.item.src_map_se_y_txt;
              delete this.item.src_map_se_x_txt;
              delete this.item.src_map_se_y_txt;
            } 
          array
               // select only 'src_' fields
               .filter(Object.keys(this.item), function(key) { return key.indexOf("src_")==0})
               // skip operational fields: src_source_,  src_uri_, src_task_ref_
               .filter(function(key) { return !key.indexOf("src_source_")==0 && !key.indexOf("src_uri_")==0  && !key.indexOf("src_task_ref_")==0})
               // create key-value pair for each key
               .map(lang.hitch(this, function(key) {return {key: key, value: this.item[key]}}))
               // select only non empty values
               .filter(function(kvp) {return kvp.value!=null && (typeof kvp.value == "string"? kvp.value.trim().length>0: true)})
               // drop time from date/time
               .map(function(kvp) { 
                  if (kvp.key.endsWith("_dt")) { 
                   kvp.value = kvp.value.split("T")[0];
                  }; 
                  return kvp; 
               })
               // remove prefixes and suffixes from the names
               .map(function(kvp) { return {key: kvp.key.replace(/^src_/g, "").replace(/_[^_]+$/gi,"").replace(/_+/gi," "), value: kvp.value}})
               .filter(lang.hitch(this, function(kvp) {
                 return this.fieldsToDrop.indexOf(kvp.key.toLowerCase()) < 0;
               }))
               .sort(lang.hitch(this, function(kvp1, kvp2) {
                 var idx1 = this.fieldOrder.indexOf(kvp1.key.toLowerCase());
                 var idx2 = this.fieldOrder.indexOf(kvp2.key.toLowerCase());
                 
                 if (idx1>=0 && idx2>=0) {
                   return Math.sign(idx1-idx2);
                 }
                 
                 if (idx1 >= 0) return -1;
                 if (idx2 >= 0) return 1;
                 
                 return kvp1.key.localeCompare(kvp2.key);
               }))
               // capitalize names and rename names
               .map(lang.hitch(this, function(kvp) {
                 kvp.key = kvp.key.split(" ").map(function(part) { return part.charAt(0).toUpperCase() + part.slice(1); }).join(" ");
                 var renamed = this.fieldsToRename[kvp.key];
                 if (renamed) kvp.key = renamed;
                 return kvp; 
               }))
               // create data row
               .forEach(lang.hitch(this, function(kvp){
                  this._appendData(kvp.key, kvp.value);
               }));
        },
        
        _appendData: function(name, value) {
          var row = domConstruct.create("tr", null, this.table);
          domConstruct.create("td", {innerHTML: entities.encode(""+name), "class": "g-attributes-name"}, row);
          domConstruct.create("td", {innerHTML: entities.encode(""+value), "class": "g-attributes-value"}, row);
        }
    });
});


