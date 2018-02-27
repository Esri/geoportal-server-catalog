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

global.gs = {};
global.gsConfig = {
  isNode: true
};

require("../../gs/all.js");
gs._request = require("request");

var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var port = 3000;

//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(port, function () {
  console.log("Node: geoportal-search listening on port", port);
});

app.get("/csw", function (req, res) {
  execute(req,res,req.query);
});

app.post("/csw", function (req, res) {
  execute(req,res,mixinParameters(req));
});

app.get("/opensearch", function (req, res) {
  execute(req,res,req.query);
});

app.post("/opensearch", function (req, res) {
  mixinParameters(req);
  execute(req,res,mixinParameters(req));
});

app.get("/opensearch/description", function (req, res) {
  execute(req,res,req.query);
});

app.post("/opensearch/description", function (req, res) {
  execute(req,res,mixinParameters(req));
});

function execute(req, res, parameterMap) {

  // TODO need X- headers
  var baseUrl = req.protocol + "://" + req.hostname + ":" +port;

  var requestInfo = {
    "requestUrl": req.url,
    "requestBody": req.body,
    "baseUrl": baseUrl,
    "headerMap": req.headers,
    "parameterMap": parameterMap
  };
  //console.log("Processing request:",requestInfo);
  var processor = gs.Object.create(gs.context.node.NodeProcessor);
  processor.execute(requestInfo,function(status,mediaType,entity,headers){
    res.status(status);
    res.set("Content-Type",mediaType);
    res.send(entity);
  });
}

function mixinParameters(req) {
  var k, parameterMap = {};
  var props = [req.query,req.body];
  props.forEach(function(o){
    if (o) {
      for (k in o) {
        if (o.hasOwnProperty(k)) {
          parameterMap[k] = o[k];
        }
      }
    }
  });
  return parameterMap;
}
