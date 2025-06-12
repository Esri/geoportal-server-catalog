window.onload = function() {
      // Begin Swagger UI call region
      const ui = SwaggerUIBundle({
        url: "gpt_api.json", 
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
      // End Swagger UI call region

      window.ui = ui;
      window.document.getElementsByClassName("topbar")[0].style.display = "none";
    };