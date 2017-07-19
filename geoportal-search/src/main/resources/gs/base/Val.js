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
  
  gs.base.Val = gs.Object.create(gs.Proto,{
  
    NL: {writable: true, value: "\r\n"},
    XML_HEADER: {writable: true, value: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"},
  
    chkStr: {value: function(v) {
      if (typeof v === "undefined" || v === null) return null;
      return ""+v;
    }},
  
    chkStrArray: {value: function(v) {
      if (typeof v === "undefined" || v === null) return null;
      else if (typeof v === "string") return [v];
      else if (typeof v.push === "function") return v;
      return null;
    }},
  
    chkObjArray: {value: function(v) {
      if (typeof v === "undefined" || v === null) return null;
      else if (typeof v === "object" && typeof v.push === "undefined") return [v];
      else if (typeof v === "object" && typeof v.push === "function") return v;
      return null;
    }},
  
    endsWith: {value: function(v,sfx) {
      if (typeof v !== "string") return null;
      return (v.indexOf(sfx,(v.length - sfx.length)) !== -1);
    }},
  
    escXml: {value: function(s) {
      if (s === null) return null;
      if (s.length === 0) return s;
      var i, c, sb = "";
      for (i = 0; i < s.length; i++) {
        c = s.charAt(i);
        if (c === "&") {
          sb += "&amp;";
        } else if (c === "<") {
          sb += "&lt;";
        } else if (c === ">") {
          sb += "&gt;";
        } else if (c === "\'") {
          sb += "&apos;";
        } else if (c === "\"") {
          sb += "&quot;";
        } else {
          sb += c;
        }
      }
      return sb;
    }},
  
    millisToIso8601: {value: function(millis) {
      if (typeof millis === "undefined") return null;
      if (millis === null) return null;
      var pad = function(number) {
        if (number < 10) {
          return '0' + number;
        }
        return number;
      }
      var date = new Date(millis);
      var v = date.getUTCFullYear() +
        '-' + pad(date.getUTCMonth() + 1) +
        '-' + pad(date.getUTCDate()) +
        'T' + pad(date.getUTCHours()) +
        ':' + pad(date.getUTCMinutes()) +
        ':' + pad(date.getUTCSeconds()) +
        '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
      return v;
    }},
  
    nowAsString: {value: function() {
      return this.millisToIso8601(Date.now());
    }},
  
    strToInt: {value: function(v,defaultValue) {
      try {
        if (typeof v !== "string") v = this.chkStr(v);
        if (typeof v === "string" && v.trim().length > 0) {
          v = parseInt(v.trim(),10);
          if (typeof v === "number" && !isNaN(v) && isFinite(v)) {
            return v;
          } 
        }
      } catch(ex) {}
      return defaultValue;
    }},
  
    strToNum: {value: function(v,defaultValue) {
      try {
        if (typeof v !== "string") v = this.chkStr(v);
        if (typeof v === "string" && v.trim().length > 0) {
          v = Number(v.trim());
          if (typeof v === "number" && !isNaN(v) && isFinite(v)) {
            return v;
          } 
        }
      } catch(ex) {}
      return defaultValue;
    }},
  
    trim: {value: function(v) {
      if (typeof v === "string") return v.trim();
      return v;
    }}
  
  });
  
}());
