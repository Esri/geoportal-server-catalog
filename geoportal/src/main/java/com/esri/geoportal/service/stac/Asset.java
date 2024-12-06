package com.esri.geoportal.service.stac;


import java.util.ArrayList;
import java.util.List;
import net.minidev.json.JSONObject;


public class Asset {
    private String href = null;
    private String title = null;
    private String esriWKT = "";
    private String transformationMatrix = "";
    // TODO - store and use roles. only assets with role "Local CRS" should be considered
    // private List<String> roles = new ArrayList<>();
    

    // Constructor
    public Asset(JSONObject assetBody) {
        this.href = assetBody.getAsString("href");
        this.title = assetBody.getAsString("title");
        this.esriWKT = assetBody.getAsString("esri:wkt");
        this.transformationMatrix = assetBody.getAsString("xom:transformation_matrix");
    };
    
    
    // get/set href
    public String getHref() {
        return this.href;
    }
    
    public void setHref(String href) {
        this.href = href;
    }
    
    
    // get/set title
    public String getTitle() {
        return this.title;
    }
    
    public void setTitle(String title) {
        this.href = title;
    }
  
    
    // get/set esri_wkt
    public String getEsriWKT() {
        return this.esriWKT;
    }
    
    public void setEsriWKT(String esriWKT) {
        this.esriWKT = esriWKT;
    }
    
    
    // get/set transformationMatrix
    public String getTransformationMatrix() {
        return this.transformationMatrix;
    }
    
    public void setTransformationMatrix(String transformationMatrix) {
        this.transformationMatrix = transformationMatrix;
    }
}
