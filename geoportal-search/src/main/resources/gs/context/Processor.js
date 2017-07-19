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
  
  gs.context.Processor = gs.Object.create(gs.Proto,{
    
    execute: {value:function(requestInfo, responseHandler) {
      var context = this.newContext();
      var config = this.newConfig();
      var request = this.makeRequest(requestInfo);
      var targets = this.makeTargets(context,config,request);
      var tasks = this.makeTasks(context,config,requestInfo,targets);
      if (tasks.length === 0) {
        // TODO error here??
        if (typeof responseHandler === "function") {
          // TODO json response?
          var response = gs.Object.create(gs.base.Response);
          responseHandler(response.Status_OK,response.mediaType.MediaType_TEXT_PLAIN,"No task.");
        }
      } else if (tasks.length === 1) {
        this.executeTask(context,tasks[0],responseHandler);
      } else {
        this.executeTasks(context,tasks,responseHandler);
      }
    }},
    
    executeTask: {value:function(context, task, responseHandler) {
      var msg, response;
      task.dfd = task.provider.execute(task);
      task.dfd.then(function(result){
        response = task.response;
        if (typeof responseHandler === "function") {
          responseHandler(response.status,response.mediaType,response.entity,task);
        }
      })["catch"](function(error){
        response = task.response;
        if (!task.hasError) {
          // TODO JSON?
          msg = "Search error";
          if (typeof error.message === "string" && error.message.length > 0) {
            msg = error.message;
          }
          response.put(response.Status_INTERNAL_SERVER_ERROR,response.MediaType_TEXT_PLAIN,msg);
          task.hasError = true;
        }
        if (typeof responseHandler === "function") {
          responseHandler(response.status,response.mediaType,response.entity,task);
        }
      });
    }},
    
    executeTasks: {value:function(context, tasks, responseHandler) {
      var self = this, dfds = [];
      tasks.forEach(function(task){
        self.executeTask(context,task);
        dfds.push(task.dfd);
      });
      
      var response, result, results = [], o;
      var promise = context.newPromiseAll(dfds);
      promise.then(function(){
        tasks.forEach(function(task){
          if (task.response && task.response.mediaType === task.response.MediaType_APPLICATION_JSON) {
            if (typeof task.response.entity === "string" && task.response.entity.indexOf("{") === 0) {
              try {
                o = JSON.parse(task.response.entity);
                task.response.entity = o;
              } catch(ex) {}
            }
          }
          results.push(task.response);
        });
        result = JSON.stringify(results); // TODO pretty? JSON.stringify(results,null,2);
        response = gs.Object.create(gs.base.Response);
        response.put(response.Status_OK,response.MediaType_APPLICATION_JSON,result);
        if (typeof responseHandler === "function") {
          responseHandler(response.status,response.mediaType,response.entity,tasks);
        }
      })["catch"](function(error){
        // TODO JSON error
        console.warn("Error",error);
      });
    }},
    
    makeProvider: {value: function(task) {
      var provider = gs.Object.create(gs.provider.opensearch.OpensearchProvider);
      var v = task.request.getUrlPath();
      if (task.val.endsWith(v,"/csw") || task.val.endsWith(v,"/csw/")) {
        var isOsDsc = false, vals = task.request.getHeaderValues("Accept");
        if (vals !== null && vals.length > 0) {
          isOsDsc = vals.some(function(s){
            return (s.indexOf("application/opensearchdescription+xml") !== -1);
          });
        }
        if (!isOsDsc) provider = gs.Object.create(gs.provider.csw.CswProvider);
      } 
      return provider;
    }},
    
    makeRequest: {value: function(requestInfo) {
      var request = gs.Object.create(gs.base.Request).mixin({
        url: requestInfo.requestUrl,
        headerMap: requestInfo.headerMap,
        parameterMap: requestInfo.parameterMap,
      });
      return request;
    }},
    
    _checkTarget: {value: function(v, cfgTargets, targets, config) {
      //console.warn("_checkTarget",v);
      var self = this, o = v, target = null;
      if (typeof v === "string") {
        v = v.trim();
        if (v.length > 0) {
          try {
            o = JSON.parse(v);
            //console.warn("o",o);
          } catch(ex) {
            //console.warn(ex);
            o = v;
          }
        }
      }
      //console.warn(typeof o,o);
      if (typeof o === "string") {
        if (cfgTargets.hasOwnProperty(o)) {
          target = cfgTargets[o];
          target.key = o;
          targets.push(target);
        } else {
          // TODO error here?
        }
      } else if (o && Array.isArray(o)) {
        o.forEach(function(o2){
          self._checkTarget(o2,cfgTargets,targets,config);
        });
      } else if (o !== null && typeof o === "object" && config.allowDynamicTarget) {
        if (typeof o.url === "string" && o.url.length > 0) {
          if ((o.url.indexOf("http://") === 0) || (o.url.indexOf("https://") === 0)) {
            if (o.type === "portal") {
              // TODO example "http://urbanvm.esri.com/arcgis"
              target = gs.Object.create(gs.target.portal.PortalTarget).mixin({
                "portalBaseUrl": o.url
              });
            } else if (o.type === "geoportal") {
              // TODO example  "http://gptdb1.esri.com:8080/geoportal/elastic/metadata/item/_search"
              target = gs.Object.create(gs.target.elastic.GeoportalTarget).mixin({
                "searchUrl": o.url
              });
            }
            if (target) {
              // TODO pass full parameters to the target (from, size, ...)
              target.requestObject = o;
              if (typeof o.key === "string" && o.key.length > 0) {
                target.key = o.key;
              } else {
                //target.key = o; TODO?
              }
              if (typeof o.filter === "string" && o.filter.length > 0) {
                target.requiredFilter = o.filter;
              }
              targets.push(target);
            }
          }
        }
      }
    }},
    
    makeTargets: {value: function(context,config,request) {
      var self = this, o, target, targets = [];
      var cfgTargets = config.makeTargets() || {};
      var values = request.getParameterValues("target");
      if (values === null || values.length === 0) {
        values = request.getParameterValues("targets");
      }
      if (values !== null && values.length === 1) {
        //values = values[0].split(","); // TODO???
      }
      if (values !== null) {
        values.forEach(function(v){
          self._checkTarget(v,cfgTargets,targets,config);
        });
      }
      if (targets.length === 0) {
        o = config.defaultTarget;
        if (cfgTargets.hasOwnProperty(o)) {
          target = cfgTargets[o];
          //target.key = o;
          targets.push(target);
        }
      }
      if (targets.length === 0) {
        // TODO exception here??
      }
      return targets;
    }},
    
    makeTasks: {value: function(context,config,requestInfo,targets) {
      var self = this, req, tasks = [];
      var sRequestInfo = JSON.stringify(requestInfo);
      targets.forEach(function(target){
        requestInfo = JSON.parse(sRequestInfo); 
        request = gs.Object.create(gs.base.Request).mixin({
          url: requestInfo.requestUrl,
          headerMap: requestInfo.headerMap,
          parameterMap: requestInfo.parameterMap,
        });
        task = self.newTask(context,config,request,{
          baseUrl: requestInfo.baseUrl
        }).mixin(requestInfo.taskOptions);
        task.target = target;
        task.response.target = target.key;
        tasks.push(task);
      });
      return tasks;
    }},
    
    makeWriters: {value: function(task) {
      var index = function(writers,keys,writer) {
        keys.forEach(function(k){
          writers[k.toLowerCase()] = writer;
        })
      };
      
      var atom = ["atom","application/atom+xml","http://www.w3.org/2005/Atom"];
      var csw = ["csw","","application/xml","http://www.opengis.net/cat/csw/3.0"];
      var json = ["json","pjson","application/json"];
      
      var writers = {};
      index(writers,atom,gs.Object.create(gs.writer.AtomWriter));
      index(writers,csw,gs.Object.create(gs.writer.CswWriter));
      index(writers,json,gs.Object.create(gs.writer.JsonWriter));
      return writers;
    }},
    
    newConfig: {value: function() {
      return gs.Object.create(gs.config.Config);
    }},
    
    newContext: {value: function() {
      return gs.Object.create(gs.context.Context);
    }},
    
    newTask: {value: function(context,config,request,options) {
      var task = gs.base.Task.newTask().mixin({
        config: config,
        context: context,
        request: request,
      }).mixin(options);
      task.provider = this.makeProvider(task);
      task.writers = this.makeWriters(task);
      return task;
    }}
  
  });
  
}());
