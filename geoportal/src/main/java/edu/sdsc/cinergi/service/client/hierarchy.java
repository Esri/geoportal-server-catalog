package edu.sdsc.cinergi.service.client;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
/**
 * Created by valentin on 8/26/2016.
 */
public class hierarchy {


    public static String getUrlAsString(String url) throws RuntimeException
    {
        try
        {
            URL urlObj = new URL(url);
            URLConnection con = urlObj.openConnection();

            con.setDoOutput(true); // we want the response
            //con.setRequestProperty("Cookie", "myCookie=test123");
            con.connect();

            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));

            StringBuilder response = new StringBuilder();
            String inputLine;

            String newLine = System.getProperty("line.separator");
            while ((inputLine = in.readLine()) != null)
            {
                response.append(inputLine + newLine);
            }

            in.close();

            return response.toString();
        }
        catch (Exception e)
        {
            throw new RuntimeException(e);
        }
    }

    public static JsonObject getUrlAsJsonObject (String url) throws RuntimeException
    {
        try
        {
            URL urlObj = new URL(url);
            try (InputStream is = urlObj.openStream();
                 JsonReader rdr = Json.createReader(is)) {

                JsonObject obj = rdr.readObject();

                return obj;
            }

        }
        catch (Exception e)
        {
            throw new RuntimeException(e);
        }
    }
}
