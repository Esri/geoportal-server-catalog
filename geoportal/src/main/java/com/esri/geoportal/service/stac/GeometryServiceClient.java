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
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.base.util.DateUtil;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.http.MockTrustManager;

import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;

/**
 * An HTTP client for Geometry service.
 */
public class GeometryServiceClient {

    /**
     * Instance variables.
     */
    private String baseUrl;
    private String projectUrl;
    private String intersectUrl;
    private String convexHullURL;

    // Create a HashMap of geojson and WKT to arcgis geometry types
    private Map<String, String> geometryTypes = new HashMap<>();
    private Map<String, String> wktTypes = new HashMap<>();
    
    //Geometry source for generated geometries (point and polygon from polyhedral surface)
    private String geomSourceSystem ="gsdb";
    

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
        String geometryService = GeoportalContext.getInstance().getGeometryService();
        return new GeometryServiceClient(geometryService);
    }

    /**
     * Constructor.
     *
     * @param baseUrl the Geometry Service base URL
     */
    public GeometryServiceClient(String baseUrl) {
        this.baseUrl = baseUrl;
        this.projectUrl = baseUrl + "/project";
        this.intersectUrl = baseUrl + "/intersect";
        this.convexHullURL = baseUrl + "/convexHull";

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
        URLConnection con;
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
     * Returns convex Hall Polygon
     *
     * @param geometryOne
     * @param geometryTwo
     * @return true if and only if the geometries intersect
     * @throws IOException if an issue occurs in communicating with the geometry service
     */
    public String getConvexHull(String geometry) throws IOException {
        String formData = "sr=4326";
        formData += "&geometries=" + URLEncoder.encode(geometry, "UTF-8");        
        formData += "&f=json";

        URL obj = new URL(this.convexHullURL);
        HttpURLConnection con = (HttpURLConnection) obj.openConnection();
        
        LOGGER.debug("com.esri.geoportal.service.stac - convexHull: formData = " + formData);     

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
        
        BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        String inputLine;
        StringBuilder response = new StringBuilder();

        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();
        return response.toString();
    }
    
    
    /**
     * intersect the two geometries
     *
     * @param geometryOne
     * @param geometryTwo
     * @return true if and only if the geometries intersect
     * @throws IOException if an issue occurs in communicating with the geometry service
     */
    public String doIntersect(String geometryOne, String geometryTwo) throws IOException {
        String formData = "sr=4326";
        formData += "&geometries=" + URLEncoder.encode(geometryOne, "UTF-8");
        formData += "&geometry=" + URLEncoder.encode(geometryTwo, "UTF-8");
        formData += "&f=json";

        URL obj = new URL(this.intersectUrl);
        HttpURLConnection con = (HttpURLConnection) obj.openConnection();
        
        LOGGER.debug("com.esri.geoportal.service.stac - doIntersect: formData = " + formData);     

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


    /**
     * project the provided geometries
     *
     * @param geometries the geometries to project
     * @param inCRS the CRS the data is in
     * @param outCRS the CRS the data should be projected to
     * @return the projected geometries
     * @throws IOException if an issue occurs in communicating with the geometry service
     */
    public String doProjection(String geometries, String inCRS, String outCRS, Boolean vertical) throws IOException {
        String formData = "inSr=" + inCRS;
        formData += "&outSR=" + outCRS;
        formData += "&geometries=" + URLEncoder.encode(geometries, "UTF-8");
        formData += "&transformation=";
        formData += "&transformForward=true";
        formData += "&vertical=" + vertical.toString();
        formData += "&f=json";

        URL obj = new URL(this.projectUrl);
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
        
        switch (wktGeometryType) {
          case "POINT":
            // POINT (30 10 20)
            String[] points = wktCoordinates.replace("(", "").replace(")", "").split(" ");
            String x = points[0];
            String y = points[1];
           
            geometries = "{\"geometryType\": \"" + arcgisGeometryType + "\", \"geometries\": [ { ";
            
            // if point has Z coordinate, set it so in the output
            if (hasZ) {
              geometries += "\"hasZ\": true, ";
            }
            
            geometries += "\"x\": " + x + ", \"y\": " + y;            
            
            // if point has Z coordinate, add it to the output
            if (hasZ) {
              String z = points[2];
              geometries += ", \"z\": " + z;
            }
            
            // close JSON string
            geometries += "}]}";
              
            break;
            
          case "LINESTRING":
            // LINESTRING Z (30 10 0, 10 30 10, 40 40 20)
            /*
              {
                "geometryType" : "esriGeometryPolyline",
                  "geometries" : [{ 
                    "paths": [[[-117,34],[-116,34],[-117,33]]]
                  }]
              }            
            */
            
            geometries = "{\"geometryType\": \"" + arcgisGeometryType + "\", "
              + "\"geometries\": [ { ";
            
            // if point has Z coordinate, set it so in the output
            if (hasZ) {
              geometries += "\"hasZ\": true, ";
            }
            
            // add the paths to the geometry
            geometries += "\"paths\": [[";
            String[] wktPath = wktCoordinates.replace("(", "").replace(")", "").split(",");
            for (String pathPoint : wktPath) {
              geometries += "[ " + pathPoint.trim().replace(" ", ", ") + "], ";
            }
            
            // close the JSON
            geometries += "]]}]}";
            
            break;
            
          case "MULTILINESTRING":
            // MULTILINESTRING Z ((30 10 0, 10 30 10, 40 40 20), (31 10 0, 11 30 10, 41 40 20))
            /*
              {
                "geometryType" : "esriGeometryPolyline",
                  "geometries" : [{ 
                    "paths": [[[-117,34],[-116,34],[-117,33]], [[-17,34],[-16,34],[-17,33]]]
                  }]
              }            
            */
            
            geometries = "{\"geometryType\": \"" + arcgisGeometryType + "\", "
              + "\"geometries\": [ { ";
            
            // if point has Z coordinate, set it so in the output
            if (hasZ) {
              geometries += "\"hasZ\": true, ";
            }
            
            // add the paths to the geometry
            geometries += "\"paths\": [";
			
            String[] wktPathML = wktCoordinates.split("\\),[ ]*\\(");
            boolean firstPath = true;
            for (String pathPoint : wktPathML) {
              if (firstPath) {
                firstPath = false;
              } else {
                geometries += ", ";
              }
              geometries += "[";

              String thisPath = pathPoint.trim().replace("((", "").replace("))", "");
              System.out.println(thisPath);
              boolean firstPoint = true;

              String[] thesePoints = thisPath.split(",");
              for (String thisPoint : thesePoints) {
                if (firstPoint) {
                  firstPoint = false;
                } else {
                  geometries += ", ";
                }
                geometries += "[";

                String theEsriPoint = thisPoint.trim().replaceAll(" +", " ").replace(" ", ", ");

                System.out.println(theEsriPoint);

                geometries += theEsriPoint;
                geometries += "]";
              }
              geometries += "]";				
            }

            // close the JSON
            geometries += "]}]}";
                    
            
            break;
            
          case "POLYGON":
            /*
              POLYGON Z ((35 10 0, 45 45 10, 15 40 20, 10 20 30, 35 10 0))
            */
            
            /*
              {
                "geometryType": "esriGeometryPolygon",
                "geometry": {
                  "rings": [
                    [[-117,34],[-116,34],[-117,33],[-117,34]],
                    [[-115,44],[-114,43],[-115,43],[-115,44]]
                  ]
                }
              }
            */
                    
            String coordinates = wktCoordinates.trim()
                                               .replace("(", "[")
                                               .replace(")", "]")
                                               .replace(", ", "],[")
                                              // .replace(",", "],[")
                                               .replace(" ", ",");
            geometries = "{\"geometryType\": \"" + arcgisGeometryType + "\", \"geometries\": [ {";

            // if point has Z coordinate, set it so in the output
            if (hasZ) {
              geometries += "\"hasZ\": true, ";
            }
            
            geometries += "\"rings\": [" + coordinates + "]}]}";
            
            break;
            
          case "POLYHEDRAL":
            /*
              POLYHEDRALSURFACE Z ( PATCHES
              ((5 50 0, 6 50 0, 6 51 0, 5 51 0, 5 50 0)),
              ((5 50 0, 6 50 0, 6 50 1, 5 50 1, 5 50 0)),
              ((5 50 0, 5 51 0, 5 51 1, 5 50 1, 5 50 0)),
              ((6 51 1, 5 51 1, 5 50 1, 6 50 1, 6 51 1)),
              ((6 51 1, 5 51 1, 5 51 0, 6 51 0, 6 51 1)),
              ((6 51 1, 6 51 0, 6 50 0, 6 50 1, 6 51 1))
              )
            */
            
            String patches = wkt.trim().substring(wkt.indexOf("PATCHES") + 7, wkt.length()-1).trim();
            String regex = "[))]";
            String[] polygons = patches.split(regex);
            hasZ = true;  // polyhedral always has Z
            
            // now build ArcGIS geometry as list of polygon geometries
            geometries = "{\"geometryType\": \"" + arcgisGeometryType + "\", \"geometries\": [";

            for (String polygon : polygons) {
              if (!polygon.isEmpty()) {
                // start polygon json
                geometries += "{";
                geometries += "\"hasZ\": true, ";  // polyhedral always has Z
                geometries += "\"rings\": [[";

                String polyCoordinateString = polygon.replace(", ((","").replace("((","");
                String[] polyCoordinates = polyCoordinateString.split(",");

                // add points to poly
                for (String poly : polyCoordinates) {
                  geometries += "[ " + poly.trim().replace(" ", ", ") + "], ";
                }
                geometries += "]]}, ";
              }
            }

            // close the JSON
            geometries += "]}";
            
            geometries = geometries.replace("], ]", "]]").replace("[ ],", "").replace("}, ]", "}]");
            break;
            
          default:
            LOGGER.debug("getArcGISGeometry " + wktGeometryType + ": UNSUPPORTED WKT TYPE");
            geometries = "UNSUPPORTED WKT TYPE";
        }
      }
      
      LOGGER.debug("getArcGISGeometry " + wktGeometryType + ": " + geometries);
      return geometries;
    }
    

    /*
     * turn a ArcGIS geometry into a WKT geometry
     *
     * @param wktGeometryType to be produced (in upper case)
     * @param arcgisGeometry the ArcGIS geometry
     * @return the corresponding WKT geometry as a string
    */
    public String getWKTGeometry(String wktGeometryType, JSONArray arcgisGeometries) {
      
      String wkt = "";
      JSONObject arcgisGeometry;
      JSONArray paths;
      JSONArray firstPath;
      JSONArray firstPoint;
      boolean lineHasZ;
      
      switch (wktGeometryType) {
          case "POINT":
            /*
              FROM:
              {
                "geometryType" : "esriGeometryPoint",
                  "geometries" : [{ 
                    "x": 30,
                    "y": 10,
                    "z":  0
                  }]
              }

              TO: 
              POINT Z (30 10 0)
            */
            arcgisGeometry = (JSONObject) arcgisGeometries.get(0);
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
            /*
              FROM:
              {
                "geometryType" : "esriGeometryPolyline",
                  "geometries" : [{ 
                    "paths": [[[-117,34],[-116,34],[-117,33]]]
                  }]
              }

              TO: 
              LINESTRING Z (30 10 0, 10 30 10, 40 40 20)
            */

            arcgisGeometry = (JSONObject) arcgisGeometries.get(0);
            paths = (JSONArray) arcgisGeometry.get("paths");
            firstPath = (JSONArray) paths.get(0);
            firstPoint = (JSONArray) firstPath.get(0);
            
            lineHasZ = (firstPoint.size() == 3);
            
            wkt = "LINESTRING";
            wkt += lineHasZ ? " Z " : " ";
            
            if (!paths.isEmpty()) {
              String agsPaths = paths.toString();
              wkt += agsPaths.substring(agsPaths.indexOf(":")+1)
                             .trim()
                             .replace(",", " ")
                             .replace("] [", ", ")
                             .replace("[", "(")
                             .replace("]", ")");
            }            
            break;
            
          case "MULTILINESTRING":
            /*
              FROM:
              {
                "geometryType" : "esriGeometryPolyline",
                  "geometries" : [{ 
                    "paths": [[[-117,34,0],[-116,34,10],[-117,33,20]], [[-17,34,0],[-16,34,10],[-17,33,20]]]
                  }]
              }            
            
              TO:
              MULTILINESTRING Z ((30 10 0, 10 30 10, 40 40 20), (31 10 0, 11 30 10, 41 40 20))
            */
            
            arcgisGeometry = (JSONObject) arcgisGeometries.get(0);
            paths = (JSONArray) arcgisGeometry.get("paths");
            firstPath = (JSONArray) paths.get(0);
            firstPoint = (JSONArray) firstPath.get(0);
            
            lineHasZ = (firstPoint.size() == 3);
            
            wkt = "MULTILINESTRING";
            wkt += lineHasZ ? " Z " : " ";
            
            if (!paths.isEmpty()) {
              String agsPaths = paths.toString();
              wkt += agsPaths.substring(agsPaths.indexOf(":")+1)
                            .trim()
                            .replace(",", " ")
                            .replace("] [", ", ")
                            .replace("[", "(")
                            .replace("]", ")")
                            .replace("((", "(")
                            .replace("))", ")")
                            .replaceAll(" +", " ")
                            .replace(") (", "), (");
            }

            break;
            
          case "POLYGON":
            /*
            
            FROM:
            {
              "geometryType": "esriGeometryPolygon", 
              "geometries": [{ 
                  "rings": [[
                      [-94.081413026234017,30.072937583749404],
                      [-94.081501246364283,30.072936242583417],
                      ...
                      [-94.081413026234017,30.072937583749404]
                    ]]
                }]
            }
            
            TO: 
              POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10),(20 30, 35 35, 30 20, 20 30))
            */
            arcgisGeometry = (JSONObject) arcgisGeometries.get(0);
            String polyHasZ = arcgisGeometry.getAsString("hasZ");
            if (polyHasZ != null && !polyHasZ.isEmpty()) {
              hasZ = polyHasZ.equalsIgnoreCase("true");
            } else {
              hasZ = false;
            }
            JSONArray rings = (JSONArray) arcgisGeometry.get("rings");

            if (!rings.isEmpty()) {
              String ags = rings.toString();
              wkt = wktGeometryType;
              wkt += hasZ ? " Z " : " ";
              
              wkt += ags.substring(ags.indexOf(":")+1)
                    .replace(",", " ")
                    .replace("] [", ", ")
                    .replace("[", "(")
                    .replace("]", ")")
                    .replace("(((", "((")
                    .replace(")))", "))");
            }

            break;
            
          case "POLYHEDRAL":
            /*
              FROM:
              {
                "geometryType": "esriGeometryPolygon", 
                "geometries": [
                  {"hasZ": true, "rings": [[[ 5, 50, 0], [ 6, 50, 0], [ 6, 51, 0], [ 5, 51, 0], [ 5, 50, 0]]]}, 
                  ...
                  {"hasZ": true, "rings": [[ [ 6, 51, 1], [ 6, 51, 0], [ 6, 50, 0], [ 6, 50, 1], [ 6, 51, 1]]]}
                ]
              }

              TO: 
              POLYHEDRALSURFACE Z ( 
                PATCHES ((5 50 0, 6 50 0, 6 51 0, 5 51 0, 5 50 0)),
                        ...
                        ((6 51 1, 6 51 0, 6 50 0, 6 50 1, 6 51 1))
              )
            */
            
            // start wkt, polyhedralsurface always has Z
            wkt = "POLYHEDRALSURFACE Z ( PATCHES ";
            
            /* 
              the polyhedral geometry is stored in the ArcGIS JSON as
              a list of polygons. every face of the polyhedral is stored
              as a polygon with 1 ring
            */
            for (int i=0; i<arcgisGeometries.size(); i++) {
              JSONObject face = (JSONObject) arcgisGeometries.get(i);
              JSONArray edges = (JSONArray) face.get("rings");
              if (!edges.isEmpty()) {
                JSONArray firstEdge = (JSONArray) edges.get(0);

                wkt += firstEdge.toString()
                                .replace(",", " ")
                                .replace("] [", ", ")
                                .replace("[", "(")
                                .replace("]", ")");
              }
            }
            wkt = wkt.replace("))((", ")), ((");
            
            // finish wkt
            wkt += " )";
            
            break;
            
          default:
            wkt = "UNSUPPORTED WKT TYPE";
        }
      
      return wkt;
    }
    

  
  /*
   * Get the geometry from the field
   *
   * @param item - JSON Object of the item
   * @param geometryField - the field to get the geometry from
  */
  public String getItemGeometry(JSONObject item, String geometryField) {
    String geometries = null;
    
    switch(geometryField) {
      case "envelope_geo":
        
        try {
          JSONArray envelopes = (JSONArray) item.get(geometryField);
          JSONObject firstEnvelope = (JSONObject) envelopes.get(0);
          JSONArray envelopeCoordinates = (JSONArray) firstEnvelope.get("coordinates");
          JSONArray upperLeft = (JSONArray) envelopeCoordinates.get(0);
          JSONArray lowerRight = (JSONArray) envelopeCoordinates.get(1);

          LOGGER.debug("geometry = " + firstEnvelope.toString()); 

          geometries = "{\"geometryType\": \"esriGeometryEnvelope\", "
          + "\"geometries\": [{"
          + "\"xmin\": " + upperLeft.get(0) + ", "
          + "\"ymin\": " + lowerRight.get(1) + ", "
          + "\"xmax\": " + lowerRight.get(0) + ", "
          + "\"ymax\": " + upperLeft.get(1) + "}]}";

        } catch (Exception ex) {
          geometries = "";
          LOGGER.debug("getItemGeometry did not find envelope_geo field"); 
        }

        break;
        
      case "bbox":
        JSONArray bbox = (JSONArray) item.get(geometryField);
        
        LOGGER.debug("geometry = " + bbox.toString()); 

        geometries = "{\"geometryType\": \"esriGeometryEnvelope\", \"geometries\": [{";
        
        if (bbox.size() == 4) {
          geometries = geometries + "\"xmin\": " + bbox.get(0) + ", "
                                  + "\"ymin\": " + bbox.get(1) + ", "
                                  + "\"xmax\": " + bbox.get(2) + ", "
                                  + "\"ymax\": " + bbox.get(3) + "}]}";
          
        } else if (bbox.size() == 6) {
          geometries = geometries + "\"xmin\": " + bbox.get(0) + ", "
                                  + "\"ymin\": " + bbox.get(1) + ", "
                                  + "\"zmin\": " + bbox.get(3) + ", "
                                  + "\"xmax\": " + bbox.get(3) + ", "
                                  + "\"ymax\": " + bbox.get(4) + ", "
                                  + "\"zmax\": " + bbox.get(5) + "}]}";
          
        } else {
          LOGGER.error("BBOX is of wrong dimensions: " + bbox.size());
          geometries = null;
        }
        break;

      case "geometry":
      case "shape_geo":
        if(item.containsKey(geometryField) && item.get(geometryField) != null){
          JSONObject geometry = new JSONObject((Map<String, ?>) item.get(geometryField));
          LOGGER.debug("geometry = " + geometry.toString()); 

          String coordinates = geometry.getAsString("coordinates");
          
          String geometryType = geometry.getAsString("type");
          if(geometryType.equalsIgnoreCase("Polygon"))
          {
        	  geometries = "{\"geometryType\": \"" + this.getArcGISGeometryType(geometryType) + "\", "
        	          + "\"geometries\": [ "
        	          + "{ \"rings\": " + coordinates + "}"
        	          + "]}";
          }
          else if(geometryType.equalsIgnoreCase("Point"))
          {
        	  JSONArray pointArr =(JSONArray) geometry.get("coordinates");
        	  geometries = "{\"geometryType\": \"" + this.getArcGISGeometryType(geometryType) + "\", "
        	          + "\"geometries\": [ "
        	          + "{ \"x\": " + pointArr.get(0) + ",\"y\":" + pointArr.get(1)+"}"
        	          + "]}";
          }
          else if(geometryType.equalsIgnoreCase("MultilineString"))
          {
        	  JSONArray polylineArr =(JSONArray) geometry.get("coordinates");
        	  geometries = "{\"geometryType\": \"" + this.getArcGISGeometryType(geometryType) + "\", "
        	          + "\"geometries\": [{\"paths\":"+polylineArr+"}]}";
        	         
          }
        }        

        break;
        
      default:
        LOGGER.error("Unknown geometry field: " + geometryField);
        geometries = null;
    }

    return geometries;
  } 
  	
	 /**Returns polyhedral footprint
	 * Taking every (x,y,z) point from the polyhedral, remove the z everywhere, leaving a list of (x,y) points. 
	 * Create a convex hull around those points
	 * @param polyhedralGeomWKTObj
	 * @return
	 * @throws IOException
	 * @throws ParseException
	 */
	public JSONObject getPolyhedralFootprint(JSONObject polyhedralGeomWKTObj) throws IOException, ParseException
	  { 
		  JSONObject polygonWKTObj = new JSONObject();		  
		  ArrayList<String[]> verticesArrList = getPolyhedralVerticesArr(polyhedralGeomWKTObj);
		  double[] point = new double[2];
		  ArrayList<double[]> pointList = new ArrayList<>();
		  String[] xyArr = null;
		  String inputGeomStr = "[";
		  for (int j = 0; j < verticesArrList.size(); j++) {
			xyArr = verticesArrList.get(j);	
			if(xyArr.length>1)
			{
				//Get all the points
				point [0] = Double.parseDouble(xyArr[0]); //x 
				point [1] = Double.parseDouble(xyArr[1]); //y	
				if(j==0)
				{
					inputGeomStr = inputGeomStr+ Arrays.toString(point);
				}
				else {
					inputGeomStr = inputGeomStr +","+ Arrays.toString(point);
					pointList.add(point);
				}				
			}			
		 }
		  inputGeomStr = inputGeomStr+"]";
		  if(inputGeomStr.length() < 3)		//Means no points added	 
		  {
			  return polygonWKTObj;
		  }

		 String geometryType = "esriGeometryMultipoint";
       
       	 String inputGeometry = "{\"geometryType\": \"" + geometryType + "\", "
       	          + "\"geometries\": [ "
       	          + "{\"points\":"+ inputGeomStr+","       	       
       	          +"\"spatialReference\": { \"wkid\": 4326 }}"
       	          + "]}";
       	 
         String geometryResponse = getConvexHull(inputGeometry);
         JSONParser jsonParser = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);
         if (!geometryResponse.isBlank()) {
             // get geometries as JSON object
            
           JSONObject geometryResponseObject = (JSONObject) jsonParser.parse(geometryResponse);
           if (geometryResponseObject.containsKey("geometry")) {
             JSONObject polyGeom = (JSONObject) geometryResponseObject.get("geometry");
             JSONArray geomArr = new JSONArray();
             geomArr.add(polyGeom);
             String polygonWkt = getWKTGeometry("POLYGON", geomArr);
             polygonWKTObj.put("wkt", polygonWkt);
             polygonWKTObj.put("geometry_source", geomSourceSystem);
             polygonWKTObj.put("update_date", DateUtil.nowAsString());            
           }           
         }
		 return polygonWKTObj;
	  }
  
  
  	/**
	 * Returns POINT wkt from a polyhedral wkt:
	 * (re)generate a point geometry from the submitted polyhedral by averaging the x, y, and z coordinates 
	 * @param polyhedralGeomWKTObj 
	 * @return
	 */
  public JSONObject getPointFromPolyhedralWKT(JSONObject polyhedralGeomWKTObj)
  {	 	
		JSONObject pointWktObj = new JSONObject();
		double x = 0.0;
		double y = 0.0;
		double z = 0.0;
		ArrayList<String[]> verticesArrList = getPolyhedralVerticesArr(polyhedralGeomWKTObj);
		
		int numberOfVertex=0;
		for (int j = 0; j < verticesArrList.size(); j++) {			
			String[] xyzArr = verticesArrList.get(j);
			if (xyzArr.length == 3) {
				if (xyzArr[0] != null && !xyzArr[0].isBlank())
					x = x + Double.parseDouble(xyzArr[0]);

				if (xyzArr[1] != null && !xyzArr[1].isBlank())
					y = y + Double.parseDouble(xyzArr[1]);

				if (xyzArr[2] != null && !xyzArr[2].isBlank())
					z = z + Double.parseDouble(xyzArr[2]);
				numberOfVertex ++;
			}
		}
		if(numberOfVertex >0)
		{
			// Get average and create POINT
			double avjX = x / numberOfVertex;
			double avjY = y / numberOfVertex;
			double avjZ = z / numberOfVertex;

			pointWktObj.put("wkt", "POINT (" + avjX + " " + avjY + " " + avjZ + ")");
			pointWktObj.put("geometry_source", geomSourceSystem);
			pointWktObj.put("update_date", DateUtil.nowAsString());	
		}
		return pointWktObj;
  }
  
  private ArrayList<String[]> getPolyhedralVerticesArr(JSONObject polyhedralGeomWKTObj) {	  
	 
	  ArrayList<String[]> verticesArrList = new ArrayList<>();
	  
	  String wkt = polyhedralGeomWKTObj.getAsString("wkt");	
	  if(wkt !=null && !wkt.isBlank() &&  wkt.indexOf("PATCHES")>-1)
	  {
		  String patch = wkt.trim().substring(wkt.indexOf("PATCHES") + 7, wkt.length()-1).trim();
		  String patches = patch.replace("((", "");
		  String regex = "[))]";
		  String[] polygonArr = patches.split(regex);
		  
		  
		  String verticesBeforeTrim, vertices="";String[] verticesArr = null;
		  //Count the number of vertices and get sum of x,y and z
		  for(int i=0; i<polygonArr.length;i++)
		  {
			  verticesBeforeTrim = polygonArr[i];
			  vertices = verticesBeforeTrim.replace(", ",",");
			  verticesArr = vertices.split(",");
			  
			  for(int j=0;j<verticesArr.length;j++)
	    	  {
				  String[] vertexArr = verticesArr[j].split(" ");
				  verticesArrList.add(vertexArr);
	    	  }
		  } 
	  }
	  return verticesArrList;		  
	  
  	}
           
}