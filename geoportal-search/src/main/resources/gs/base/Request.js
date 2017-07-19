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

(function(){

  gs.base.Request = gs.Object.create(gs.Proto,{
  
    f: {writable: true, value: "atom"},
    pretty: {writable: true, value: false},
  
    isItemByIdRequest: {writable: true, value: false},
    queryIsZeroBased: {writable: true, value: false},
  
    headerMap: {writable: true, value: null},
  
    parameterMap: {writable: true, value: null},
  
    url: {writable: true, value: null}, // TODO requestUrl
  
    chkBoolParam: {value: function(key,defaultValue) {
      var v = this.chkParam(key);
      if (typeof v === "string") {
        v = v.toLowerCase();
        if (v === "true") return true;
        else if (v === "false") return false;
      }
      return defaultValue;
    }},
  
    chkIntParam: {value: function(key,defaultValue) {
      try {
        var v = this.chkParam(key);
        if (typeof v === "string" && v.length > 0) {
          v = parseInt(v,10);
          if (typeof v === "number" && !isNaN(v) && isFinite(v)) {
            return v;
          } 
        }
      } catch(ex) {}
      return defaultValue;
    }},
  
    chkParam: {value: function(key) {
      return gs.base.Val.trim(this.getParameter(key));
    }},
  
    getFrom: {value: function() {
      var from = this.getParameter("from");
      if (from === null) from = this.getParameter("start");
      if (from === null) from = this.getParameter("startPosition");
      return from;
    }},
  
    getHeader: {value: function(key) {
      return this._getValue(this.headerMap,key);
    }},
  
    getHeaderValues: {value: function(key) {
      return this._getValues(this.headerMap,key);
    }},
  
    getIds: {value: function() {
      var ids = [];
      var list = this.getParameterValues("id");
      if (list === null) list = this.getParameterValues("recordIds");
      if (Array.isArray(list) && list.length === 1) {
        list = list[0].split(",");
      }
      if (Array.isArray(list)) {
        list.forEach(function(id){
          id = id.trim();
          if (id.length > 0) ids.push(id);
        });
      }
      if (ids.length === 0) ids = null;
      return ids;
    }},
  
    getParameter: {value: function(key) {
      return this._getValue(this.parameterMap,key);
    }},
  
    getParameterValues: {value: function(key) {
      return this._getValues(this.parameterMap,key);
    }},
  
    getSize: {value: function() {
      var size = this.getParameter("size");
      if (size === null) from = this.getParameter("num");
      if (size === null) from = this.getParameter("maxRecords");
      if (size === null) from = this.getParameter("max");
      return size;
    }},
  
    getTimePeriod: {value: function() {
      var timePeriod = {from: null, to: null};
      var time = this.chkParam("time");
      if (typeof time === "string" && time.length > 0) {
        var a = time.split("/"); 
        a[0] = a[0].trim();
        if (a.length === 1 && time.indexOf(",") !== -1) {
          a = time.split(",");
        }
        if (a[0].length > 0) timePeriod.from = a[0];
        if (a.length === 2) {
          a[1] = a[1].trim();
          if (a[1].length > 0) timePeriod.to = a[1];
          // else if (a[0].length > 0) timePeriod.to = a[0]; //TODO range query, what if no slash? should to = from?
        }
      }
      return timePeriod;
    }},
  
    // TODO getRequestUrlPath
    getUrlPath: {value: function() {
      if (typeof this.url === "string" && this.url.length > 0) {
        var n = this.url.indexOf("?");
        if (n !== -1) return this.url.substring(0,n);
        return this.url;
      }
      return null;
    }},
  
    hasQueryParameters: {value: function() {
      var k, map = this.parameterMap;
      if (map) {
        for (k in map) {
          if (map.hasOwnProperty(k)) {
            return true;
          }
        }
      }
      return false;
    }},
  
    parseF: {value: function(task) {
      var pretty = this.chkBoolParam("pretty",false);
      var f = this.chkParam("f");
      var outputSchema = this.chkParam("outputSchema");
      if (outputSchema !== null && outputSchema.length > 0) {
        f = outputSchema;
      } 
      if (f !== null && f == "pjson") {
        pretty = true;
      }
      if (f !== null && f.length > 0) this.f = f;
      if (pretty) this.pretty = true;
    }},
  
    /* .......................................................................................... */
  
    _getValue: {value: function(map, key) {
      var a = this._getValues(map, key);
      if (a !== null) {
        if (a.length === 0) return "";
        else return a[0];
      }
      return null;
    }},
  
    _getValues: {value: function(map, key) {
      var k, v, lc = key.toLowerCase();
      if (map) {
        for (k in map) {
          if (map.hasOwnProperty(k)) {
            if (lc === k.toLowerCase()) {
              v = map[k];
              if (typeof v !== "undefined" && v !== null) {
                if (typeof v.push === "function") {
                  return v;
                } else {
                  return [v];
                }
              }
            }
          }
        }
      }
      return null;
    }}
  
  });

}());
