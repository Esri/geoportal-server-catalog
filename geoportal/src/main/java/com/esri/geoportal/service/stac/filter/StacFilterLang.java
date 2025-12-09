package com.esri.geoportal.service.stac.filter;

public enum StacFilterLang {
	CQL2JSON("cql2-json"),
	CQL2TEXT("cql2-text");

    private final String value;

    // Constructor to initialize the string value
    StacFilterLang(String value) {
        this.value = value;
    }

    // Getter method to retrieve the value
    public String getValue() {
        return value;
    }

    // Optionally, override toString() for a custom string value
    @Override
    public String toString() {
        return this.value;
    }
    

 // Static method to get enum from string
     public static StacFilterLang fromValue(String value) {
         for (StacFilterLang lang : StacFilterLang.values()) {
             if (lang.getValue().equalsIgnoreCase(value)) {
                 return lang;
             }
         }
         throw new IllegalArgumentException("Unknown value: " + value);
     }

}
