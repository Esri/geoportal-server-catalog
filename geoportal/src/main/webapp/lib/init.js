  window.dojoConfig = {
    locale: "en",
    async: true,
    parseOnLoad: true,

    packages: [
          {
              name: "esri4",
              location: "https://js.arcgis.com/4.30/esri"
          },
          {
              name: 'app',
              location: location.pathname.replace(/\/[^/]*$/, '') + '/app',
          }
    	]
  };