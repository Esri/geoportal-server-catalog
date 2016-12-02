define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/topic',
  'dojo/io-query',
  'esri/request'
],function(declare,lang,
           topic,ioQuery,
           esriRequest){
    return declare(null, {

      query: null,

      execute: function(query){
        this.query = query;
        var requestHandle = esriRequest({
              "url": query.queryUrl+"?" + this._queryToString(query),
              handleAs:'json'
            },{
              useProxy:false
            });
          requestHandle.then(lang.hitch(this,this._onQueryFinish), this._onQueryError);
      },
      
      _queryToString: function(query) {
        var q = {};
        for (a in query) {
          if (typeof query[a]=="object" || typeof query[a]=="function" || typeof query[a]=="array") {
            continue;
          }
          q[a] = query[a];
        }
        return ioQuery.objectToQuery(q);
      },

      _onQueryFinish: function(results, io){
        topic.publish("/widgets/GeoportalSearch/action/search", null, { success: true, results: results, query: this.query, io:io });
      },

      _onQueryError:function(error, io){
        topic.publish("/widgets/GeoportalSearch/action/search", null, { success: false, error: error, io:io  });
      }

   });
});