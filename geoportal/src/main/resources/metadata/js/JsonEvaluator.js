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

function evaluateSuppliedJson(mdoc) {
  print("JsonEvaluator::evaluateSuppliedJson");
  var item = JSON.parse(mdoc.getSuppliedJson());
  
  if (item.metadataURL && item.metadataURL.length > 0) {
      item.full_metadata = getFullMetadata(item);  
  }

  mdoc.setSuppliedJson(JSON.stringify(item));
}


function getFullMetadata(item) {
  var url = item.metadataURL;
  var options
  var result = this.enrichMetadataFromURL(url, options, false);
  
  return result;
}

function enrichMetadataFromURL(url, options, responseIsJSON) {
    var _jvmTypes = {
      CharArray: Java.type("char[]")
    };

    var data;
    var result = null;
    var br = null, br2 = null, wr = null;
    var sw = new java.io.StringWriter();
    var sw2 = new java.io.StringWriter();
    var con = null, buffer, nRead;

    var u = new java.net.URL(url);

    java.net.HttpURLConnection.setFollowRedirects(true);
    con = u.openConnection();
    con.setInstanceFollowRedirects(true);

    if (options && options.basicCredentials &&
        typeof options.basicCredentials.username === "string" &&
        options.basicCredentials.username.length > 0 &&
        typeof options.basicCredentials.password === "string" &&
        options.basicCredentials.password.length > 0) {
      var cred = options.basicCredentials.username+":"+options.basicCredentials.password;
      cred = new java.lang.String(java.util.Base64.getEncoder().encode(cred.getBytes("UTF-8")),"UTF-8");
      con.setRequestProperty( "Authorization","Basic "+cred);
    }

    if (typeof data === "string" && data.length > 0) {
      con.setDoOutput(true);
      con.setRequestMethod("POST");
      var postData = data.getBytes("UTF-8");
      if (typeof dataContentType === "string" && dataContentType.length > 0) {
        con.setRequestProperty( "Content-Type",dataContentType);
      }
      con.setRequestProperty("charset","UTF-8");
      con.setRequestProperty("Content-Length",""+postData.length);
      wr = new java.io.DataOutputStream(con.getOutputStream());
      wr.write(postData);
    }

    var charset = "UTF-8";
    var contentType = con.getContentType();
    if (contentType !== null) {
      var a = contentType.split(";");
      a.some(function(v){
        v = v.trim();
        if (v.toLowerCase().startsWith("charset=")) {
          var cs = v.substring("charset=".length).trim();
          if (cs.length() > 0) {
            charset = cs;
            return true;
          }
        }
      });
    }

    //print("contentType="+contentType+" ... charset="+charset);
    br = new java.io.BufferedReader(new java.io.InputStreamReader(con.getInputStream(),charset));
    nRead = 0;
    buffer = new _jvmTypes.CharArray(4096);
    while ((nRead = br.read(buffer,0,4096)) >= 0) {
      sw.write(buffer,0,nRead); // TODO comment out this line and Invalid JSON: <json>:1:0 Expected json literal but found eof
    }

    result = sw.toString();

    // if the service responds with JSON make it JSON
    if (responseIsJSON) {
        try{
            result = JSON.parse(result);
        } catch(e) {
            print(e);
        }
    }

    return result;
}
