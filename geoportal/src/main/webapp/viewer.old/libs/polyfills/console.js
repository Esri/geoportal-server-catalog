(function(con) {
  'use strict';
  try{
    var prop, method;
    var empty = {};
    var dummy = function() {};
    var properties = 'memory'.split(',');
    var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
       'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
       'table,time,timeEnd,timeStamp,trace,warn').split(',');
    prop = properties.pop();
    while (prop) {
      con[prop] = con[prop] || empty;
      prop = properties.pop();
    }
    method = methods.pop();
    while (method) {
      con[method] = con[method] || dummy;
      method = methods.pop();
    }
  }catch(err){
    alert(err);
  }
})(this.console || (window.console = {}));