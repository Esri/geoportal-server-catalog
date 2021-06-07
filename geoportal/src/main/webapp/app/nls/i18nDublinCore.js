define({
  root: ({

    documentTypes: {
      data: {
        caption: "Dublin Core",
        description: "",
        key: "dublin-core"
      }
    },

    LanguageCode: {
      eng: "English",
      cym: "Welsh",
      gle: "Gaelic (Irish)",
      gla: "Gaelic (Scottish)",
      cor: "Cornish",
      sco: "Ulster Scots"
    },

    sections: {
      identification : {
        dataIdentification : "Data",
        LayerIdentification : "Layer"
      }
    },
    
    content: "Content",
    identifier: "Itdentifier",
    title: "Title",
    description: "Description",
    subject: "Keywords",
    references: "References",
    type: "Resource type",
    creator: "Creator",
    date: "Date",
    language: "Language",
    
    types: {
      1: "ArcIMS Service",
      2: "ArcGIS Service",
      
      3: "OGC Geography Markup Language 2.0",
      4: "OGC Geography Markup Language 2.1.1",
      5: "OGC Geography Markup Language 2.1.2",
      6: "OGC Geography Markup Language 3.0",
      7: "OGC Geography Markup Language 3.1.1",
      
      8: "OGC Catalogue Service 2.0.1(CORBA Binding)",
      9: "OGC Catalogue Service 2.0.1(HTTP Binding)",
      10:"OGC Catalogue Service 2.0.1(HTTP Binding, ebRIM Profile)",
      11:"OGC Catalogue Service 2.0.1(HTTP Binding, EO Profile)",
      12:"OGC Catalogue Service 2.0.1(HTTP Binding, CSDGM Profile)",
      13:"OGC Catalogue Service 2.0.1(HTTP Binding, 19115/19119 Profile)",
      14:"OGC Catalogue Service 2.0.1(Z39.50 Binding)",
      15:"OGC Catalogue Service 2.0.1(Z39.50 Binding, GEOProfile)",
      16:"OGC Catalogue Service 2.0.1(Z39.50 Binding, SRU)",
      
      17:"OGC Catalogue Service 2.0.2(CORBA Binding)",
      18:"OGC Catalogue Service 2.0.2(HTTP Binding)",
      19:"OGC Catalogue Service 2.0.2(HTTP Binding, ebRIM Profile)",
      20:"OGC Catalogue Service 2.0.2(HTTP Binding, EO Profile)",
      21:"OGC Catalogue Service 2.0.2(HTTP Binding, CSDGM Profile)",
      22:"OGC Catalogue Service 2.0.2(HTTP Binding, 19115/19119 Profile)",
      23:"OGC Catalogue Service 2.0.2(Z39.50 Binding)",
      
      24:"OGC Coordinate Transformation Service 1.0",
      25:"OGC Coordinate Transformation Service 1.0 (COM Profile)",
      26:"OGC Coordinate Transformation Service 1.0 (CORBA Profile)",
      27:"OGC Coordinate Transformation Service 1.0 (JAVA Profile)",
      
      28:"OGC Grid Coverage Service 1.0 (COM Profile)",
      29:"OGC Grid Coverage Service 1.0 (CORBA Profile)", 
      
      30:"OGC Location Service: Core Service: 1.0",
      31:"OGC Location Service: Core Service: 1.0 (SOAP Profile)", 
      32:"OGC Location Service: Core Service: 1.1",
      
      33:"OGC KML 2.2",
      
      34:"OGC Simple Feature Access 1.0 (CORBA)",
      35:"OGC Simple Feature Access 1.1 (OLE/COM)",
      36:"OGC Simple Feature Access 1.1 (SQL)",
      37:"OGC Simple Feature Access 1.2 (SQL)",
      
      38:"OGC Sensor Observation Service 1.0",
      
      39:"OGC Web Coverage Service 1.0",
      40:"OGC Web Coverage Service 1.1.0", 
       
      41:"OGC Web Feature Service 1.0",
      42:"OGC Web Feature Service 1.1", 
      
      43:"OGC Web Map Service 1.0",
      44:"OGC Web Map Service 1.1",
      45:"OGC Web Map Service 1.1.1",
      46:"OGC Web Map Service 1.3.0",
      47:"OGC Web Map Service POST 0.0.3",
      
      48:"OGC Web Processing Service 0.4"
   },
   
    languages: {
      ger: "German",
      dut: "Dutch",
      eng: "English",
      fre: "French",
      ita: "Italian",
      kor: "Korean",
      lit: "Lithuanian",
      nor: "Norwegian",
      pol: "Polish",
      por: "Portuguese",
      rus: "Russian",
      spa: "Spanish",
      swe: "Swedish",
      tur: "Turkish",
      chi: "Chinese",
      bul: "Bulgarian",
      cze: "Czech",
      dan: "Danish",
      est: "Estonian",
      fin: "Finnish",
      gre: "Greek",
      hun: "Hungarian",
      gle: "Irish",
      lav: "Latvian",
      mlt: "Maltese",
      rum: "Romanian",
      slo: "Slovak",
      slv: "Slovenia"
    },
    
    hints: {
      coordinates: "Enter space or coma separated pair of numbers."
    }
    
  })
});
