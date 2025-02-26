/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.esri.geoportal.service.stac;


import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import net.minidev.json.JSONValue;


public class Item {
    private JSONObject geometry = null; 
    
    // Constructor
    public Item() {};
    
    public JSONObject getGeometry() {
        return this.geometry;
    }
}
