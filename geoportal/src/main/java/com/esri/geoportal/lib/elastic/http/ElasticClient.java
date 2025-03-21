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
package com.esri.geoportal.lib.elastic.http;

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
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Optional;
import java.util.TimeZone;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.ElasticContextHttp;

import software.amazon.awssdk.http.AbortableInputStream;
import software.amazon.awssdk.http.ContentStreamProvider;
import software.amazon.awssdk.http.HttpExecuteRequest;
import software.amazon.awssdk.http.HttpExecuteResponse;
import software.amazon.awssdk.http.SdkHttpClient;
import software.amazon.awssdk.http.SdkHttpMethod;
import software.amazon.awssdk.http.SdkHttpRequest;
import software.amazon.awssdk.http.SdkHttpResponse;
import software.amazon.awssdk.http.apache.ApacheHttpClient;
import software.amazon.awssdk.http.auth.aws.signer.AwsV4HttpSigner;
import software.amazon.awssdk.http.auth.spi.signer.SignedRequest;
import software.amazon.awssdk.identity.spi.AwsCredentialsIdentity;


/**
 * An HTTP client for Elasticsearch OR OpenSearch.
 */
public class ElasticClient {
  
  /** Instance variables. */
  private String baseUrl;
  private String basicCredentials;
  private boolean useHttps;
  private String awsOpenSearchType = "";
  private String awsOpenSearchRegion;
  private String awsOpenSearchAccessKeyId;
  private String awsOpenSearchSecretAccessKey;
  private String hostName = ""; 

  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(ElasticContextHttp.class);

  
  /**
   * Create a new client.
   * @return the client
   */
  public static ElasticClient newClient() {
	ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
	if(ec.getAwsOpenSearchType().equals("serverless"))
	{
		return new ElasticClient(ec.getBaseUrl(false),
				ec.getUseHttps(),ec.getAwsOpenSearchType(),ec.getAwsOpenSearchRegion(),ec.getAwsOpenSearchAccessKeyId(),ec.getAwsOpenSearchSecretAccessKey());
	}
	else {
		return new ElasticClient(ec.getBaseUrl(true),ec.getBasicCredentials(),ec.getUseHttps());
	}    
  }
  
  /**
   * Constructor.
   * @param baseUrl the Elasticsearch OR OpenSearch base URL
   * @param basicCredentials basic credentials
   * @param useHttps use HTTP (false) or HTTPS (true)
   */
  public ElasticClient(String baseUrl, String basicCredentials,boolean useHttps) {
    this.baseUrl = baseUrl;
    this.basicCredentials = basicCredentials;
    this.useHttps = useHttps;    
  }
  
  public ElasticClient(String baseUrl, boolean useHttps, String awsOpenSearchType, String awsOpenSearchRegion,
		  String awsOpenSearchAccessKeyId, String awsOpenSearchSecretAccessKey) {
	    this.baseUrl = baseUrl;	   
	    this.useHttps = useHttps; 
	    this.awsOpenSearchType = awsOpenSearchType; 
	    this.awsOpenSearchRegion = awsOpenSearchRegion;
	    this.awsOpenSearchAccessKeyId = awsOpenSearchAccessKeyId;
	    this.awsOpenSearchSecretAccessKey = awsOpenSearchSecretAccessKey;
	  }
  
/**
   * URL encode a value.
   * @param value the value
   * @return the encoded value
   * @throws UnsupportedEncodingException
   */
  public String encode(String value) throws UnsupportedEncodingException {
    return URLEncoder.encode(value,"UTF-8");
  }
 
  /**
   * Get the Elasticsearch base URL
   * @return base URL
   */
  public String getBaseUrl() {
    return baseUrl;
  }
  
  /**
   * Get a bulk update URL.
   * @param indexName the index name
   * @return the URL
   * @throws UnsupportedEncodingException
   */
  public String getBulkUrl(String indexName) throws UnsupportedEncodingException {
    return baseUrl + "/" + URLEncoder.encode(indexName,"UTF-8") + "/_bulk";
  }
  
  /**
   * Get an index URL.
   * @param indexName the index name
   * @return the URL
   * @throws UnsupportedEncodingException
   */
  public String getIndexUrl(String indexName) throws UnsupportedEncodingException {
    return baseUrl + "/" + encode(indexName);
  }

  /**
   * Get an item URL.
   * @param indexName the index name
   * @param typeName the type name
   * @param id the item id
   * @return the URL
   * @throws UnsupportedEncodingException
   */
  public String getItemUrl(String indexName, String typeName, String id) throws UnsupportedEncodingException {
    return this.getTypeUrl(indexName,typeName) + "/" + encode(id);
  }
  
  /**
   * Get the scroll URL.
   * @return the URL
   * @throws UnsupportedEncodingException
   */
  public String getScrollUrl() {
    return baseUrl + "/_search/scroll";
  }
  
  /**
   * Get a type URL.
   * @param indexName the index name
   * @param typeName the type name
   * @return the URL
   * @throws UnsupportedEncodingException
   */
  public String getTypeUrl(String indexName, String typeName) throws UnsupportedEncodingException {
    typeName = StringUtils.trimToNull(typeName);
    return baseUrl + "/" + encode(indexName) + (typeName!=null? "/" + encode(typeName): "");
  }
  
  public String getTypeUrlForSearch(String indexName) throws UnsupportedEncodingException {	   
	    return baseUrl + "/" + encode(indexName);
	  }
  
  /**
   * Get an XML URL.
   * @param indexName the index name
   * @param typeName the type name
   * @param id the item id
   * @return the URL
   * @throws UnsupportedEncodingException
   */
  public String getXmlUrl(String indexName, String typeName, String id) throws UnsupportedEncodingException {
    if (!id.endsWith("_xml")) id += "_xml";
    return this.getTypeUrl(indexName,typeName) + "/" + encode(id);
  }
  
  /**
   * Send a request.
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
      if(useHttps) {
          SSLContext ssl_ctx = SSLContext.getInstance("TLS");
          //Using a mock trust manager and not validating certificate
          MockTrustManager mockTrustMgr = new MockTrustManager();

          ssl_ctx.init(null,                // key manager
                       mockTrustMgr.getTrustManager(),// trust manager
                       new SecureRandom()); // random number generator
          HttpsURLConnection.setDefaultSSLSocketFactory(ssl_ctx.getSocketFactory());

          HttpsURLConnection.setFollowRedirects(true);
          con = (HttpsURLConnection)u.openConnection();
          ((HttpsURLConnection) con).setRequestMethod(method);
          ((HttpsURLConnection) con).setInstanceFollowRedirects(true);

        } else {
          HttpURLConnection.setFollowRedirects(true);
          con = (HttpURLConnection)u.openConnection();
          ((HttpURLConnection) con).setRequestMethod(method);
          ((HttpURLConnection) con).setInstanceFollowRedirects(true);
       }
      if (isAWSServerless()) {
    	  
    	  AwsV4HttpSigner signer = AwsV4HttpSigner.create();

   	   // Specify AWS credentials. Credential providers that are used by the SDK by default are
   	   // available in the module "auth" (e.g. DefaultCredentialsProvider).
   	   AwsCredentialsIdentity credentials =
   			   AwsCredentialsIdentity.create(this.awsOpenSearchAccessKeyId, this.awsOpenSearchSecretAccessKey);

   	   // Create the HTTP request to be signed
   	   SdkHttpRequest httpRequest =
   	       SdkHttpRequest.builder()
   	                     .uri(url)
   	                     .method(convertSdkMethod(method))
   	                     .putHeader("Content-Type", "application/json")
   	                     .build();

   	   // Create the request payload to be signed
   	   ContentStreamProvider requestPayload =
   	       ContentStreamProvider.fromUtf8String(data==null?"":data);


   	   // Sign the request.
   	   SignedRequest signedRequest =
   	       signer.sign(r -> r.identity(credentials)
   	                         .request(httpRequest)
   	                         .payload(requestPayload)
   	                         .putProperty(AwsV4HttpSigner.SERVICE_SIGNING_NAME, "aoss")
   	                         .putProperty(AwsV4HttpSigner.REGION_NAME, this.awsOpenSearchRegion));
   	                        

   	   // Create and HTTP client and send the request. ApacheHttpClient requires the 'apache-client' module.
   	   try (SdkHttpClient httpClient = ApacheHttpClient.create()) {
   	       HttpExecuteRequest httpExecuteRequest =
   	           HttpExecuteRequest.builder()
   	                             .request(signedRequest.request())
   	                             .contentStreamProvider(signedRequest.payload().orElse(null))
   	                             .build();

   	       HttpExecuteResponse response =
   	           httpClient.prepareRequest(httpExecuteRequest).call();
   	       
   	       SdkHttpResponse httpResponse = response.httpResponse();
   	       
   	       if (httpResponse.isSuccessful()) {
   	    	    System.out.println("Response Status Code: " + httpResponse.statusCode());

   	    	    // Get the response body
   	    	    Optional<AbortableInputStream> responseBody = response.responseBody();

   	    	    // Check if the response body is available
   	    	    if (responseBody.isPresent()) {
   	    	        try (AbortableInputStream inputStream = responseBody.get()) {
   	    	            // Read the response body
   	    	            try (BufferedReader reader =new BufferedReader(new InputStreamReader(inputStream,charset))) {
   	    	            		int nRead = 0;
		   	    		      char[] buffer = new char[4096];
		   	    		      while ((nRead = reader.read(buffer,0,4096)) >= 0) {
		   	    		        sw.write(buffer,0,nRead);
		   	    		      }
		   	    		      result = sw.toString();
		   	    		      LOGGER.debug("result from opensearch "+result);

   	    	            }
   	    	        } catch (IOException e) {
   	    	            e.printStackTrace();
   	    	        }
   	    	    } else {
   	    	        System.out.println("Response body is empty.");
   	    	    }
   	    	} else {
   	    	    System.out.println("Response failed with status code: " + httpResponse.statusCode());
   	    	}
	   	 } catch (IOException e) {
		       System.err.println("HTTP Request Failed.");
		       e.printStackTrace();
		   }
    	  
          //Add AWS4 signature for OpenSearch Serverless requests, signature changes as per RESTAPI path including query strings so need to generate for each request
//      	  HashMap<String,String> authHeader = generateAWSSignature(method, url,data,dataContentType); 
//      	  con.setRequestProperty("Host", authHeader.get("RESTAPIHOST"));
//      	  con.setRequestProperty("x-amz-date", authHeader.get("amzDate"));
//      	  con.setRequestProperty("x-amz-content-sha256", authHeader.get("payloadHash"));
//      	  con.setRequestProperty("Authorization",authHeader.get("authorizationHeader"));
//      	LOGGER.debug("accessKey= "+this.awsOpenSearchAccessKeyId+", secretAccessKey= "+this.awsOpenSearchSecretAccessKey);
//      	LOGGER.debug("method= "+method+", url= "+url+", data="+data+", dataContentType="+  dataContentType);
//      	LOGGER.debug("Host= "+authHeader.get("RESTAPIHOST")+", x-amz-date= "+authHeader.get("amzDate")+", x-amz-content-sha256="+authHeader.get("payloadHash")+", Authorization="+authHeader.get("authorizationHeader"));
      	  
        }//NOT serverless
      	else {
          // AWS OpenSearch Managed OR local OpenSearch OR Elasticsearch 
          if (basicCredentials != null && basicCredentials.length() > 0) {
            con.setRequestProperty( "Authorization",basicCredentials);
          }
      
	      if (data != null && data.length() > 0) {
	        //System.err.println("sendData="+data);
	        con.setDoOutput(true);
	        byte[] bytes = data.getBytes("UTF-8");
	        if (dataContentType != null && dataContentType.length() > 0) {
	          con.setRequestProperty("content-type",dataContentType);
	        }
	        con.setRequestProperty("charset","UTF-8");
	        con.setRequestProperty("Content-Length",""+bytes.length);
	        wr = new DataOutputStream(con.getOutputStream());
	        wr.write(bytes);
	      }
	      String contentType = con.getContentType();
	      if (contentType != null) {
	        String[] a = contentType.split(";");
	        for (String v: a) {
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
	      if(code >= 400)
	      {
	    	  LOGGER.debug("Error code received : "+code);
	    	  if(((HttpURLConnection) con).getErrorStream()!=null)
	    	  {
	    		  br = new BufferedReader(new InputStreamReader(((HttpURLConnection) con).getErrorStream(),charset)); 
	    	  }    
	    	  else if(((HttpURLConnection) con).getInputStream()!=null)
	    	  {
	    		  br = new BufferedReader(new InputStreamReader(((HttpURLConnection) con).getInputStream(),charset)); 
	    	  }
	      }
	      else
	      {
	    	  br = new BufferedReader(new InputStreamReader(con.getInputStream(),charset));
	      }
	      
	      int nRead = 0;
	      char[] buffer = new char[4096];
	      while ((nRead = br.read(buffer,0,4096)) >= 0) {
	        sw.write(buffer,0,nRead);
	      }
	      result = sw.toString();
      }

    } finally {
      try {if (wr != null) wr.close();} catch(Exception ef) {ef.printStackTrace();}
      try {if (br != null) br.close();} catch(Exception ef) {ef.printStackTrace();}
    }
    //System.err.println("result:\r\n"+result);
    return result;
  }
  
  private SdkHttpMethod convertSdkMethod(String method)
  {
	 switch(method)
	 {
	 case "HEAD":
		 return SdkHttpMethod.HEAD;
	 case "GET":
		 return SdkHttpMethod.GET;
	 case "POST":
		 return SdkHttpMethod.POST;
	 case "PUT":
		 return SdkHttpMethod.PUT;
	 case "DELETE":
		 return SdkHttpMethod.DELETE;	 
	 
	 }
	return null;
  }
  
  /**
   * Send a DELETE request.
   * @param url the URL
   * @return the response
   * @throws Exception if an exception occurs
   */
  public String sendDelete(String url) throws Exception {
    return send("DELETE",url,null,null);
  }
  
  /**
   * Send a HEAD request.
   * @param url the URL
   * @return the response
   * @throws Exception if an exception occurs
   */
  public String sendHead(String url) throws Exception {
    return send("HEAD",url,null,null);
  }

  /**
   * Send a GET request.
   * @param url the URL
   * @return the response
   * @throws Exception if an exception occurs
   */
  public String sendGet(String url) throws Exception {
    return send("GET",url,null,null);
  }

  /**
   * Send a POST request.
   * @param url the URL
   * @param data the entity data
   * @param dataContentType data the entity data content type
   * @return the response
   * @throws Exception if an exception occurs
   */
  public String sendPost(String url, String data, String dataContentType) throws Exception {
    return send("POST",url,data,dataContentType);
  }
  
  /**
   * Send a PUT request.
   * @param url the URL
   * @param data the entity data
   * @param dataContentType data the entity data content type
   * @return the response
   * @throws Exception if an exception occurs
   */
  public String sendPut(String url, String data, String dataContentType) throws Exception {
    return send("PUT",url,data,dataContentType);
  }
  
  // Helper methods for AWS Signature
  
  public HashMap<String,String> generateAWSSignature(String reqMethod, String url, String data, String dataContentType ) throws NoSuchAlgorithmException
  {	
  	 String AWS_ACCESS_KEY_ID = this.awsOpenSearchAccessKeyId;
     String AWS_SECRET_ACCESS_KEY = this.awsOpenSearchSecretAccessKey;  
     
     String RESTAPIHOST = getHostName();
     String RESTAPIPATH = getApiPath(url,RESTAPIHOST);	//Path after https://hostname and before query string(?)
     HashMap<String,String> awsSignature = new HashMap<String, String>();
     
     LOGGER.debug("AWS OS host= "+RESTAPIHOST+", RESTAPIPATH= "+RESTAPIPATH);

     String METHOD = reqMethod;
     String SERVICE = "aoss";
     String REGION = this.awsOpenSearchRegion;
     String ALGORITHM = "AWS4-HMAC-SHA256";
	  
	  // Create a datetime object for signing
      SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd'T'HHmmss'Z'", Locale.US);
      dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
      String amzDate = dateFormat.format(new Date());
      String dateStamp = amzDate.substring(0, 8);

      // Create the canonical request
      String canonicalUri = RESTAPIPATH;
      String canonicalQuerystring = getQueryString(url);
      String canonicalHeaders ="";
      String signedHeaders = "";
      String payloadHash ="";
      
      if(data != null && !data.isBlank())
      {
    	  payloadHash = sha256Hex(data);
    	  
    	  canonicalHeaders = "content-type:"+ ((dataContentType!=null && !dataContentType.isBlank())? dataContentType:"application/json")+ "\n" + 
                  "host:" + RESTAPIHOST + "\n" +
                  "x-amz-content-sha256:" + payloadHash + "\n" +
                  "x-amz-date:" + amzDate + "\n";
    	  signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
      }
      else
      {
    	  payloadHash = sha256Hex("");
    	  canonicalHeaders = "host:" + RESTAPIHOST + "\n";
    	  signedHeaders = "host";
      }      	
      
      String canonicalRequest = METHOD + "\n" + canonicalUri + "\n" + canonicalQuerystring + "\n" + canonicalHeaders + "\n" + signedHeaders + "\n" + payloadHash;

      // Create the string to sign
      String credentialScope = dateStamp + "/" + REGION + "/" + SERVICE + "/" + "aws4_request";
      String hashedCanonicalRequest = sha256Hex(canonicalRequest);
      String stringToSign = ALGORITHM + "\n" + amzDate + "\n" + credentialScope + "\n" + hashedCanonicalRequest;

      // Sign the string
      byte[] signingKey = getSignatureKey(AWS_SECRET_ACCESS_KEY, dateStamp, REGION, SERVICE);
      String signature = hmacSha256Hex(signingKey, stringToSign);

      // Add signing information to the request
      String authorizationHeader = ALGORITHM + " " + "Credential=" + AWS_ACCESS_KEY_ID + "/" + credentialScope + ", " + "SignedHeaders=" + signedHeaders + ", " + "Signature=" + signature;
      
      awsSignature.put("RESTAPIHOST",RESTAPIHOST );
      awsSignature.put("amzDate", amzDate );
      awsSignature.put("payloadHash", payloadHash);
      awsSignature.put("authorizationHeader",authorizationHeader );
      
      return awsSignature;
  }

private String getHostName() {
	if(this.hostName.isBlank())
	{
		String hostname = "";
		int startIndex;
		if(useHttps)
			startIndex = 8; //https://
		else
			startIndex = 7;
		
		hostname = this.baseUrl.substring(startIndex);
		if(hostname.indexOf(":") > -1)
		{
			hostname = hostname.substring(0,hostname.indexOf(":"));
		}
		this.hostName = hostname;
	}	
	return this.hostName;
}

private String getApiPath(String url,String hostName) {
	String tempStr = "";
	String apiPath="";
	int hostnameIndex = url.indexOf(hostName);
	
	int colonIndex = url.indexOf(":443");
	if(colonIndex > -1 )
	{
		tempStr = url.substring(hostnameIndex+hostName.length()+4);
	}
		
	int endIndex = tempStr.indexOf("?");
	if(endIndex > -1)
	{
		apiPath = tempStr.substring(0,endIndex);		
	}
	else
	{
		apiPath = tempStr;
	}
	return apiPath;
  }
  
  private String getQueryString(String url) {
	  String qryString = "";
	  	int index = url.indexOf("?");
		if(index > -1)
		{
			qryString = url.substring(index+1);		
		}
		return qryString;
  }



private byte[] getSignatureKey(String key, String dateStamp, String regionName, String serviceName) throws NoSuchAlgorithmException {
      byte[] kSecret = ("AWS4" + key).getBytes(StandardCharsets.UTF_8);
      byte[] kDate = hmacSha256(kSecret, dateStamp);
      byte[] kRegion = hmacSha256(kDate, regionName);
      byte[] kService = hmacSha256(kRegion, serviceName);
      return hmacSha256(kService, "aws4_request");
  }

  private String hmacSha256Hex(byte[] key, String data) throws NoSuchAlgorithmException {
      return bytesToHex(hmacSha256(key, data));
  }

  private byte[] hmacSha256(byte[] key, String data) {
      try {
          Mac mac = Mac.getInstance("HmacSHA256");
          mac.init(new SecretKeySpec(key, "HmacSHA256"));
          return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
      } catch (NoSuchAlgorithmException e) {
          throw new RuntimeException("Error: HmacSHA256 algorithm not available", e);
      } catch (InvalidKeyException e) {
          throw new RuntimeException("Error: Invalid key for HmacSHA256", e);
      }
  }

  private String sha256Hex(String data) throws NoSuchAlgorithmException {
      return bytesToHex(MessageDigest.getInstance("SHA-256").digest(data.getBytes(StandardCharsets.UTF_8)));
  }

  private String bytesToHex(byte[] bytes) {
      StringBuilder result = new StringBuilder();
      for (byte b : bytes) {
          result.append(String.format("%02x", b));
      }
      return result.toString();
  }
  
  public boolean isAWSServerless() {	  
	  if(this.awsOpenSearchType.equals("serverless"))
	  {
		  return true;
	  }
	  return false;
  }
  
}
