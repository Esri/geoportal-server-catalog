/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.esri.geoportal.service.stac;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.security.SecureRandom;
import java.util.HashMap;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;

import net.minidev.json.JSONObject;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.http.MockTrustManager;
import java.io.IOException;
import java.util.Map;
import java.util.Map.Entry;
import net.minidev.json.JSONArray;

/**
 * An HTTP client for Geometry service.
 */
public class GeometryServiceClient {

    /**
     * Instance variables.
     */
    private String baseUrl;
    private String basicCredentials;
    private boolean useHttps;

    // Create a HashMap of geojson and WKT to arcgis geometry types
    private Map<String, String> geometryTypes = new HashMap<>();
    private Map<String, String> wktTypes = new HashMap<>();
    

    /**
     * Logger.
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(GeometryServiceClient.class);

    /**
     * Create a new client.
     *
     * @return the client
     */
    public static GeometryServiceClient newClient() {
        String geometryService = GeoportalContext.getInstance().getGeomTransformService();
        return new GeometryServiceClient(geometryService);
    }

    /**
     * Constructor.
     *
     * @param baseUrl the Geometry Service base URL
     */
    public GeometryServiceClient(String baseUrl) {
        this.baseUrl = baseUrl;

        // Add key-value pairs, GeoJSON as keys, ArcGIS types as values
        this.geometryTypes.put("Point", "esriGeometryPoint");
        this.geometryTypes.put("MultiPoint", "esriGeometryMultipoint");
        this.geometryTypes.put("LineString", "esriGeometryPolyline");
        this.geometryTypes.put("MultiLineString", "esriGeometryPolyline");
        this.geometryTypes.put("Polygon", "esriGeometryPolygon");
        this.geometryTypes.put("MultiPolygon", "esriGeometryPolygon");
        this.geometryTypes.put("bbox", "esriGeometryEnvelope");
        
        // Add key-value pairs, WKT as keys, ArcGIS types as values
        this.wktTypes.put("POINT", "esriGeometryPoint");
        this.wktTypes.put("MULTIPOINT", "esriGeometryMultipoint");
        this.wktTypes.put("LINESTRING", "esriGeometryPolyline");
        this.wktTypes.put("MULTILINESTRING", "esriGeometryPolyline");
        this.wktTypes.put("POLYGON", "esriGeometryPolygon");
        this.wktTypes.put("MULTIPOLYGON", "esriGeometryPolygon");
        this.wktTypes.put("POLYHEDRAL", "esriGeometryPolygon");        
    }

    /**
     * URL encode a value.
     *
     * @param value the value
     * @return the encoded value
     * @throws UnsupportedEncodingException
     */
    public String encode(String value) throws UnsupportedEncodingException {
        return URLEncoder.encode(value, "UTF-8");
    }

    /**
     * Get the Geometry Service base URL
     *
     * @return base URL
     */
    public String getBaseUrl() {
        return baseUrl;
    }

    /**
     * Send a request.
     *
     * @param method the HTTP method
     * @param url the URL
     * @param data the entity data
     * @param dataContentType data the entity data content type
     * @return the response
     * @throws Exception if an exception occurs
     */
    public String send(String method, String url, String data, String dataContentType) throws Exception {
        String result = null;
        BufferedReader br = null;
        DataOutputStream wr = null;
        StringWriter sw = new StringWriter();
        String charset = "UTF-8";
        URLConnection con = null;
        URL u = new java.net.URL(url);
        try {
            SSLContext ssl_ctx = SSLContext.getInstance("TLS");
            //Using a mock trust manager and not validating certificate
            MockTrustManager mockTrustMgr = new MockTrustManager();

            ssl_ctx.init(null, // key manager
                    mockTrustMgr.getTrustManager(),// trust manager
                    new SecureRandom()); // random number generator
            HttpsURLConnection.setDefaultSSLSocketFactory(ssl_ctx.getSocketFactory());

            HttpsURLConnection.setFollowRedirects(true);
            con = (HttpsURLConnection) u.openConnection();
            ((HttpsURLConnection) con).setRequestMethod(method);
            ((HttpsURLConnection) con).setInstanceFollowRedirects(true);

            if (data != null && data.length() > 0) {
                //System.err.println("sendData="+data);
                con.setDoOutput(true);
                byte[] bytes = data.getBytes("UTF-8");
                if (dataContentType != null && dataContentType.length() > 0) {
                    con.setRequestProperty("Content-Type", dataContentType);
                }
                con.setRequestProperty("charset", "UTF-8");
                con.setRequestProperty("Content-Length", "" + bytes.length);
                wr = new DataOutputStream(con.getOutputStream());
                wr.write(bytes);
            }
            String contentType = con.getContentType();
            if (contentType != null) {
                String[] a = contentType.split(";");
                for (String v : a) {
                    v = v.trim();
                    if (v.toLowerCase().startsWith("charset=")) {
                        String cs = v.substring("charset=".length()).trim();
                        if (cs.length() > 0) {
                            charset = cs;
                            break;
                        }
                    }
                }
            }
            int code = ((HttpURLConnection) con).getResponseCode();

            //In case of error, Read error stream
            if (code >= 400) {
                LOGGER.debug("Error code received : " + code);
                if (((HttpURLConnection) con).getErrorStream() != null) {
                    br = new BufferedReader(new InputStreamReader(((HttpURLConnection) con).getErrorStream(), charset));
                } else if (((HttpURLConnection) con).getInputStream() != null) {
                    br = new BufferedReader(new InputStreamReader(((HttpURLConnection) con).getInputStream(), charset));
                }
            } else {
                br = new BufferedReader(new InputStreamReader(con.getInputStream(), charset));
            }

            int nRead = 0;
            char[] buffer = new char[4096];
            while ((nRead = br.read(buffer, 0, 4096)) >= 0) {
                sw.write(buffer, 0, nRead);
            }
            result = sw.toString();

        } finally {
            try {
                if (wr != null) {
                    wr.close();
                }
            } catch (Exception ef) {
                ef.printStackTrace();
            }
            try {
                if (br != null) {
                    br.close();
                }
            } catch (Exception ef) {
                ef.printStackTrace();
            }
        }
        //System.err.println("result:\r\n"+result);
        return result;
    }

    /**
     * Send a GET request.
     *
     * @param url the URL
     * @return the response
     * @throws Exception if an exception occurs
     */
    public String sendGet(String url) throws Exception {
        return send("GET", url, null, null);
    }

    /**
     * Send a POST request.
     *
     * @param url the URL
     * @param data the entity data
     * @param dataContentType data the entity data content type
     * @return the response
     * @throws Exception if an exception occurs
     */
    public String sendPost(String url, String data, String dataContentType) throws Exception {
        return send("POST", url, data, dataContentType);
    }
    
    
    /**
     * project the provided geometries
     *
     * @param geometries the geometries to project
     * @param inCRS the CRS the data is in
     * @param outCRS the CRS the data should be projected to
     * @return the projected geometries
     * @throws IOException if an issue occurs in communicating with the geometry service
     */
    public String doProjection(String geometries, String inCRS, String outCRS) throws IOException {
        String formData = "inSr=" + inCRS;
        formData += "&outSR=" + outCRS;
        formData += "&geometries=" + URLEncoder.encode(geometries, "UTF-8");
        formData += "&transformation=";
        formData += "&transformForward=true";
        formData += "&vertical=false";
        formData += "&f=json";

        URL obj = new URL(this.baseUrl);
        HttpURLConnection con = (HttpURLConnection) obj.openConnection();

        // Set the request method to POST
        con.setRequestMethod("POST");
        con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        con.setRequestProperty("Content-Length", Integer.toString(formData.getBytes().length));
        con.setDoOutput(true);

        // Send the form data
        DataOutputStream wr = new DataOutputStream(con.getOutputStream());
        wr.writeBytes(formData);
        wr.flush();
        wr.close();

        // Read the response
        int responseCode = con.getResponseCode();
        System.out.println("Response Code : " + responseCode);

        BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        String inputLine;
        StringBuilder response = new StringBuilder();

        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        return response.toString();
    }

    /*
     * Get the ArcGIS geometry type based on a GeoJSON type
     *
     * @param inGeoJSONType the GeoJSON geometry type
     * @return the corresponding ArcGIS geometry type or null if no corresponding type found
    */
    public String getArcGISGeometryType(String inGeoJSONType) {
      String gt; 
      
      try {
        gt = this.geometryTypes.get(inGeoJSONType);
      } catch (Exception ex) {
        LOGGER.error("Unknown GeoJSON geometry type: " + inGeoJSONType);
        gt = null;
      }
        
      return gt;
    }


    /*
     * Get the ArcGIS geometry type based on a WKT type
     *
     * @param inWKTType the WKT geometry type
     * @return the corresponding ArcGIS geometry type or null if no corresponding type found
    */
    public String getArcGISGeometryTypeFromWKT(String inWKTType) {
      String gt; 
      
      try {
        gt = this.wktTypes.get(inWKTType);
      } catch (Exception ex) {
        LOGGER.error("Unknown WKT geometry type: " + inWKTType);
        gt = null;
      }
        
      return gt;
    }

    
    /*
     * Get the GeoJSON geometry type based on an ArcGIS type
     *
     * @param inArcGISType the ArcGIS geometry type
     * @return the corresponding GeoJSON geometry type or null if no corresponding type found
    */
    public String getGeoJSONGeometryType(String inArcGISType) {
      String gt = null; 
      
      try {
        for (Entry<String, String> entry: this.geometryTypes.entrySet()) {
          if (entry.getValue().equals(inArcGISType)) {
            gt = entry.getKey();
          }
        }
      } catch (Exception ex) {
        LOGGER.error("Unknown ArcGIS geometry type: " + inArcGISType);
        gt = null;
      }
        
      return gt;
    }

    
    /*
     * Get the WKT geometry type based on an ArcGIS type
     *
     * @param inArcGISType the ArcGIS geometry type
     * @return the corresponding WKT geometry type or null if no corresponding type found
    */
    public String getWKTGeometryType(String inArcGISType) {
      String gt = null; 
      
      try {
        for (Entry<String, String> entry: this.wktTypes.entrySet()) {
          if (entry.getValue().equals(inArcGISType)) {
            gt = entry.getKey();
          }
        }
      } catch (Exception ex) {
        LOGGER.error("Unknown ArcGIS geometry type: " + inArcGISType);
        gt = null;
      }
        
      return gt;
    }    


    /*
     * turn a WKT geometry into an ArcGIS geometry
     * using basic string manipulation as the two are similar
     *
     * @param wktGeometryType the WKT geometry type (in upper case)
     * @param wktGeometry the WKT geometry
     * @return the corresponding ArcGIS geometry as a JSON string
    */
    public String getArcGISGeometry(String wktGeometryType, JSONObject wktGeometry) {

      String arcgisGeometryType = this.getArcGISGeometryTypeFromWKT(wktGeometryType);
      String geometries = "";
      
      JSONObject geometry = (JSONObject) wktGeometry.get(wktGeometryType.toLowerCase());
      String wkt = geometry.getAsString("wkt");
      
      if (!wkt.isEmpty()) {
        boolean hasZ = wkt.contains("Z");
        String startOfCoordinates = hasZ ? "Z" : wktGeometryType;
        String wktCoordinates = wkt.substring(wkt.indexOf(startOfCoordinates) + startOfCoordinates.length())
                                   .trim();
        
        String coordinates = wktCoordinates.trim()
                                           .replace("(", "[")
                                           .replace(")", "]")
                                           .replace(", ", "],[")
                                           .replace(" ", ",");
        
        switch (wktGeometryType) {
          case "POINT":
            String[] points = wktCoordinates.replace("(", "").replace(")", "").split(" ");
            String x = points[0];
            String y = points[1];
           
            geometries = "{\"geometryType\": \"" + arcgisGeometryType + "\", "
              + "\"geometries\": [ " 
              + "{ \"x\": " + x + ", \"y\": " + y;
            
            // if point has Z coordinate, add it to the output
            if (hasZ) {
              String z = points[2];
              geometries += ", \"z\": " + z;
            }
            
            // close JSON string
            geometries += "}]}";            
              
            break;
            
          case "LINESTRING":
            geometries = "TODO";
            break;
            
          case "POLYGON":
            geometries = "{\"geometryType\": \"" + arcgisGeometryType + "\", "
              + "\"geometries\": [ " 
              + "{ \"rings\": " + coordinates + "}"
              + "]}";
            break;
            
          case "POLYHEDRAL":
            geometries = "TODO";
            break;
            
          default:
            geometries = "UNSUPPORTED WKT TYPE";
        }
      }
      
      return geometries;
    }
    

    /*
     * turn a ArcGIS geometry into a WKT geometry
     *
     * @param wktGeometryType to be produced (in upper case)
     * @param arcgisGeometry the ArcGIS geometry
     * @return the corresponding WKT geometry as a string
    */
    public String getWKTGeometry(String wktGeometryType, JSONObject arcgisGeometry) {
      
      String wkt = "";
      switch (wktGeometryType) {
          case "POINT":
            String x = arcgisGeometry.getAsString("x");
            String y = arcgisGeometry.getAsString("y");

            boolean hasZ = arcgisGeometry.containsKey("z");
            wkt = wktGeometryType;
            
            if (hasZ) {
              wkt += " Z ";
            } else {
              wkt += " ";
            }
            
            wkt += " (" + x + " " + y;
            
            if (hasZ) {
              String z = arcgisGeometry.getAsString("z");
              wkt += " " + z;
            }
            
            wkt += ")";
            
            break;
            
          case "LINESTRING":
            wkt = "TODO";
            break;
            
          case "POLYGON":
            JSONArray rings = (JSONArray) arcgisGeometry.get("rings");

            if (!rings.isEmpty()) {
              String ags = rings.toString();
              wkt = wktGeometryType 
                    + " " 
                    + ags.substring(ags.indexOf(":")+1)
                    .replace(",", " ")
                    .replace("] [", ", ")
                    .replace("[", "(")
                    .replace("]", ")");
            }

            break;
            
          case "POLYHEDRAL":
            wkt = "TODO";
            break;
            
          default:
            wkt = "UNSUPPORTED WKT TYPE";
        }
      
      return wkt;
    }
}