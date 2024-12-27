package com.esri.geoportal.service.stac;


import com.esri.geoportal.search.STACService;
import com.esri.geoportal.search.StacHelper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import net.minidev.json.JSONObject;
import org.slf4j.LoggerFactory;


public class Collection {
    private JSONObject body = null;
    private JSONObject geometry = null;
    private String collectionId = null;
    private String title = null;
    private Map<String, Asset> assets = new HashMap<>();
    private List<String> availableCRS = null;
    
    private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(STACService.class);

    
    // Constructor
    public Collection() {
        
    }
    
    
    // Constructor with collection JSON Object
    public Collection(JSONObject collectionObj) {
        this.collectionId = collectionObj.getAsString("id");
        try {
            this.body = collectionObj;
            this.title = collectionObj.getAsString("title");
            JSONObject extent = this.getJSONObject(collectionObj.get("extent"));
            this.geometry = this.getJSONObject(extent.get("spatial"));

            JSONObject theAssets = this.getJSONObject(collectionObj.get("assets"));
            this.availableCRS = new ArrayList<>(theAssets.keySet());

            theAssets.keySet().forEach((String key) -> {
                Asset thisAsset = new Asset(this.getJSONObject(theAssets.get(key)));
                this.addAsset(key, thisAsset);
                LOGGER.debug(key + ": esri_wkt = " + thisAsset.getEsriWKT());
            });
        } catch (Exception ex) {
            LOGGER.error("Error in creating collection " + collectionId + ": " + ex);
        }				
    };

    
    // Constructor with collectionId
    public Collection(String collectionId) {
        this.collectionId = collectionId;
        try {
            this.body = StacHelper.getCollectionWithId(collectionId);
            this.title = this.body.getAsString("title");
            JSONObject extent = this.getJSONObject(this.body.get("extent")); // new JSONObject((Map<String, ?>) this.body.get("extent"));
            this.geometry = this.getJSONObject(extent.get("spatial"));

            JSONObject theAssets = this.getJSONObject(this.body.get("assets"));
            this.availableCRS = new ArrayList<>(theAssets.keySet());

            theAssets.keySet().forEach((String key) -> {
                Asset thisAsset = new Asset(this.getJSONObject(theAssets.get(key)));
                this.addAsset(key, thisAsset);
                LOGGER.debug(key + ": esri_wkt = " + thisAsset.getEsriWKT());
            });
        } catch (Exception ex) {
            LOGGER.error("Error in creating collection " + collectionId + ": " + ex);
        }				
    };
    
    
    // get/set body
    public JSONObject getBody() {
        return this.body;
    }    
    public void setBody(JSONObject body) {
        this.body = body;
    }

    
    // get/set geometry
    public JSONObject getGeometry() {
        return this.geometry;
    }    
    public void setGeometry(JSONObject geometry) {
        this.geometry = geometry;
    }
    
    // get/set id
    public String getCollectionId() {
        return this.collectionId;
    }    
    public void setCollectionId(String collectionId) {
        this.collectionId = collectionId;
    }
 
    
    // get/set id
    public String getTitle() {
        return this.title;
    }    
    public void setTitle(String title) {
        this.title = title;
    }
    
    // get/set availableCRS
    public List<String> getAvailableCRS() {
        return this.availableCRS;
    }    
    public void setaAvailableCRS(List<String> availableCRS) {
        this.availableCRS = availableCRS;
    }
    
    
    // get/set assets
    public Map<String, Asset> getAssets() {
        return this.assets;
    }    
    public void setAssets(Map<String, Asset> assets) {
        this.assets = assets;
    }
    
    
    // add an asset to the collection's list of assets
    public void addAsset(String assetKey, Asset asset) {
        this.assets.put(assetKey, asset);
    }
    
    
    // get an asset by key
    public Asset getAsset(String assetKey) {
        return this.assets.get(assetKey);
    }
    
    // little JSONObject helper
    private JSONObject getJSONObject(Object x) {
        return new JSONObject((Map<String, ?>) x); 
    }
}