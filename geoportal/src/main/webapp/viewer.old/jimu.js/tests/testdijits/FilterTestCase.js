require(['doh/main', 'dojo/on', 'dojo/_base/html', 'dojo/Deferred', 'jimu/dijit/Filter', 'esri/request'],
  function(doh, on, html, Deferred, Filter, esriRequest) {
    if (window.currentDijit) {
      window.currentDijit.destroy();
    }
    window.currentDijit = null;
    html.empty('jimuDijitContainer');

    var urls = ['http://sampleserver6.arcgisonline.com/arcgis/rest/services/SampleWorldCities/MapServer/0',
      'http://discomap.eea.europa.eu/arcgis/rest/services/NoiseWatch/NoiseWatch_Overview_WM/MapServer/8',
      'http://services2.arcgis.com/N4cKzJ9dzXmsPNRs/arcgis/rest/services/aquatic/FeatureServer/0',//test date field of hosted services
      'http://services1.arcgis.com/oC086ufSSQ6Avnw2/arcgis/rest/services/utf8-competitor/FeatureServer/0'//test unicode field of hosted services
    ];

    var definitionObject = {};

    var currentUrl = '', currentLayerDefinition = null;

    var filter = new Filter({
      url: urls[0]
    });
    filter.placeAt('jimuDijitContainer');
    filter.startup();

    window.parent.currentDijit = window.currentDijit = filter;

    function setUrlIndex(i) {
      filter.reset();
      currentUrl = urls[i];
      currentLayerDefinition = definitionObject[currentUrl];
    }

    function buildByExpr(expr) {
      var def = new doh.Deferred();
      filter.buildByExpr(currentUrl, expr, currentLayerDefinition).then(function() {
        var url = filter.url;
        var definition = filter._layerDefinition;
        definitionObject[url] = definition;
        var json = filter.toJson();
        if (json && json.expr === expr) {
          def.resolve();
        } else {
          def.reject();
        }
      }, function() {
        def.reject();
      });

      return def;
    }

    doh.register("buildByExpr/toJson", [{
      name: 'stringOperatorIs-value',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("CITY_NAME = 'Beijing'");
      }
    }, {
      name: 'stringOperatorIs-value-HostedService-Latin',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("PLNM = 'Bladderwort'");
      }
    }, {
      name: 'stringOperatorIs-value-HostedService-NotLatin',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("PLNM = N'中国'");
      }
    }, {
      name: 'stringOperatorIsNot-value',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("CITY_NAME <> 'Beijing'");
      }
    }, {
      name: 'stringOperatorIsNot-value-HostedService-Latin',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("PLNM <> 'Bladderwort'");
      }
    }, {
      name: 'stringOperatorIsNot-value-HostedService-NotLatin',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("PLNM <> N'中国'");
      }
    }, {
      name: 'stringOperatorStartsWith-value-IgnoreCaseSensitive',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("UPPER(CITY_NAME) LIKE UPPER('Beijing%')");
      }
    }, {
      name: 'stringOperatorStartsWith-value-CaseSensitive',

      timeout: 10000,

      setUp: function(){
        setUrlIndex(0);
      },

      runTest: function(){
        return buildByExpr("CITY_NAME LIKE 'Beijing%'");
      }
    }, {
      name: 'stringOperatorStartsWith-value-HostedService-Latin',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("UPPER(PLNM) LIKE UPPER('China%')");
      }
    }, {
      name: 'stringOperatorStartsWith-value-HostedService-NotLatin',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("UPPER(PLNM) LIKE UPPER(N'中国%')");
      }
    }, {
      name: 'stringOperatorEndsWith-value-IgnoreCaseSensitive',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("UPPER(CITY_NAME) LIKE UPPER('%Beijing')");
      }
    }, {
      name: 'stringOperatorEndsWith-value-CaseSensitive',

      timeout: 10000,

      setUp: function(){
        setUrlIndex(0);
      },

      runTest: function(){
        return buildByExpr("CITY_NAME LIKE '%Beijing'");
      }
    }, {
      name: 'stringOperatorEndsWith-value-CaseSensitive-HostedService-Latin',

      timeout: 10000,

      setUp: function(){
        setUrlIndex(2);
      },

      runTest: function(){
        return buildByExpr("UPPER(PLNM) LIKE UPPER('%China')");
      }
    }, {
      name: 'stringOperatorEndsWith-value-CaseSensitive-HostedService-NotLatin',

      timeout: 10000,

      setUp: function(){
        setUrlIndex(2);
      },

      runTest: function(){
        return buildByExpr("UPPER(PLNM) LIKE UPPER(N'%中国')");
      }
    }, {
      name: 'stringOperatorContains-value-IgnoreCaseSensitive',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("UPPER(CITY_NAME) LIKE UPPER('%Beijing%')");
      }
    }, {
      name: 'stringOperatorContains-value-CaseSensitive',

      timeout: 10000,

      setUp: function(){
        setUrlIndex(0);
      },

      runTest: function(){
        return buildByExpr("CITY_NAME LIKE '%Beijing%'");
      }
    }, {
      name: 'stringOperatorContains-value-HostedService-Latin',

      timeout: 10000,

      setUp: function(){
        setUrlIndex(2);
      },

      runTest: function(){
        return buildByExpr("UPPER(PLNM) LIKE UPPER('%China%')");
      }
    }, {
      name: 'stringOperatorContains-value-HostedService-NotLatin',

      timeout: 10000,

      setUp: function(){
        setUrlIndex(2);
      },

      runTest: function(){
        return buildByExpr("UPPER(PLNM) LIKE UPPER(N'%中国%')");
      }
    }, {
      name: 'stringOperatorDoesNotContain-value-IgnoreCaseSensitive',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("UPPER(CITY_NAME) NOT LIKE UPPER('%Beijing%')");
      }
    }, {
      name: 'stringOperatorDoesNotContain-value-CaseSensitive',

      timeout: 10000,

      setUp: function(){
        setUrlIndex(0);
      },

      runTest: function(){
        return buildByExpr("CITY_NAME NOT LIKE '%Beijing%'");
      }
    }, {
      name: 'stringOperatorDoesNotContain-value-HostedService-Latin',

      timeout: 10000,

      setUp: function(){
        setUrlIndex(2);
      },

      runTest: function(){
        return buildByExpr("UPPER(PLNM) NOT LIKE UPPER('%China%')");
      }
    }, {
      name: 'stringOperatorDoesNotContain-value-HostedService-NotLatin',

      timeout: 10000,

      setUp: function(){
        setUrlIndex(2);
      },

      runTest: function(){
        return buildByExpr("UPPER(PLNM) NOT LIKE UPPER(N'%中国%')");
      }
    }, {
      name: 'stringOperatorIsBlank',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("CITY_NAME IS NULL");
      }
    }, {
      name: 'stringOperatorIsBlank-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("PLNM IS NULL");
      }
    }, {
      name: 'stringOperatorIsNotBlank',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("CITY_NAME IS NOT NULL");
      }
    }, {
      name: 'stringOperatorIsNotBlank-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("PLNM IS NOT NULL");
      }
    }, {
      name: 'stringOperatorIs-field',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("CITY_NAME = POP_CLASS");
      }
    }, {
      name: 'stringOperatorIs-field-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("PLNM = SEDTP");
      }
    }, {
      name: 'stringOperatorIsNot-field',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("CITY_NAME <> POP_CLASS");
      }
    }, {
      name: 'stringOperatorIsNot-field-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("PLNM <> SEDTP");
      }
    }, {
      name: 'numberOperatorIs-value',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("POP = 123");
      }
    }, {
      name: 'numberOperatorIsNot-value',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("POP <> 123");
      }
    }, {
      name: 'numberOperatorIsAtLeast-value',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("POP >= 123");
      }
    }, {
      name: 'numberOperatorIsLessThan-value',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("POP < 123");
      }
    }, {
      name: 'numberOperatorIsAtMost-value',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("POP <= 123");
      }
    }, {
      name: 'numberOperatorIsGreaterThan-value',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("POP > 123");
      }
    }, {
      name: 'numberOperatorIsBetween-value',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("POP BETWEEN 13 AND 23");
      }
    }, {
      name: 'numberOperatorIsNotBetween-value',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("POP NOT BETWEEN 13 AND 23");
      }
    }, {
      name: 'numberOperatorIsBlank',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("POP IS NULL");
      }
    }, {
      name: 'numberOperatorIsNotBlank',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(0);
      },

      runTest: function() {
        return buildByExpr("POP IS NOT NULL");
      }
    }, {
      name: 'dateOperatorIsOn-value',

      timeout: 60000,

      setUp: function() {
        setUrlIndex(1);
      },

      runTest: function() {
        return buildByExpr("created_date BETWEEN timestamp '2010-06-17 00:00:00' AND timestamp '2010-06-17 23:59:59'");
      }
    }, {
      name: 'dateOperatorIsOn-value-HostedService',

      timeout: 60000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("Dates BETWEEN '2015-02-02 00:00:00' AND '2015-02-02 23:59:59'");
      }
    }, {
      name: 'dateOperatorIsNotOn-value',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(1);
      },

      runTest: function() {
        return buildByExpr("created_date NOT BETWEEN timestamp '2010-06-17 00:00:00' AND timestamp '2010-06-17 23:59:59'");
      }
    }, {
      name: 'dateOperatorIsNotOn-value-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("Dates NOT BETWEEN '2015-02-02 00:00:00' AND '2015-02-02 23:59:59'");
      }
    }, {
      name: 'dateOperatorIsBefore-value',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(1);
      },

      runTest: function() {
        return buildByExpr("created_date < timestamp '2010-06-17 00:00:00'");
      }
    }, {
      name: 'dateOperatorIsBefore-value-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("Dates < '2015-02-02 00:00:00'");
      }
    }, {
      name: 'dateOperatorIsAfter-value',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(1);
      },

      runTest: function() {
        return buildByExpr("created_date > timestamp '2010-06-17 23:59:59'");
      }
    }, {
      name: 'dateOperatorIsAfter-value-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("Dates > '2015-02-02 23:59:59'");
      }
    }, {
      name: 'dateOperatorIsBetween',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(1);
      },

      runTest: function() {
        return buildByExpr("created_date BETWEEN timestamp '2008-09-06 00:00:00' AND timestamp '2012-06-10 23:59:59'");
      }
    }, {
      name: 'dateOperatorIsBetween-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("Dates BETWEEN '2015-02-01 00:00:00' AND '2015-02-02 23:59:59'");
      }
    }, {
      name: 'dateOperatorIsNotBetween',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(1);
      },

      runTest: function() {
        return buildByExpr("created_date NOT BETWEEN timestamp '2008-09-06 00:00:00' AND timestamp '2012-06-10 23:59:59'");
      }
    }, {
      name: 'dateOperatorIsNotBetween-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("Dates NOT BETWEEN '2015-02-01 00:00:00' AND '2015-02-02 23:59:59'");
      }
    }, {
      name: 'dateOperatorIsBlank',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(1);
      },

      runTest: function() {
        return buildByExpr("created_date IS NULL");
      }
    }, {
      name: 'dateOperatorIsBlank-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("Dates IS NULL");
      }
    }, {
      name: 'dateOperatorIsNotBlank',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(1);
      },

      runTest: function() {
        return buildByExpr("created_date IS NOT NULL");
      }
    }, {
      name: 'dateOperatorIsNotBlank-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("Dates IS NOT NULL");
      }
    }, {
      name: 'dateOperatorIsOn-field',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(1);
      },

      runTest: function() {
        return buildByExpr("created_date = last_edited_date");
      }
    }, {
      name: 'dateOperatorIsOn-field-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("Dates = CreationDate");
      }
    }, {
      name: 'dateOperatorIsNotOn-field',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(1);
      },

      runTest: function() {
        return buildByExpr("created_date <> last_edited_date");
      }
    }, {
      name: 'dateOperatorIsNotOn-field-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("Dates <> CreationDate");
      }
    }, {
      name: 'dateOperatorIsBefore-field',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(1);
      },

      runTest: function() {
        return buildByExpr("created_date < last_edited_date");
      }
    }, {
      name: 'dateOperatorIsBefore-field-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("Dates < CreationDate");
      }
    }, {
      name: 'dateOperatorIsAfter-field-HostedService',

      timeout: 10000,

      setUp: function() {
        setUrlIndex(2);
      },

      runTest: function() {
        return buildByExpr("Dates > CreationDate");
      }
    }]);

    doh.run();
  });