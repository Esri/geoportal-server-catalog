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
package com.esri.geoportal.lib.elastic;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.opensearch.client.RestHighLevelClient;
//import org.opensearch.transport.client.PreBuiltTransportClient;
//import org.opensearch.xpack.client.PreBuiltXPackTransportClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.lib.security.EncryptDecrypt;

import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.auth.credentials.InstanceProfileCredentialsProvider;

/**
 * Elasticsearch OR OpenSearch context.
 */
public class ElasticContext {
  private static final int DEFAULT_PROXY_BUFFER_SIZE = 4096;

  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(ElasticContext.class);
  
  /** Instance variables . */
  private boolean allowFileId;
  private boolean autoCreateIndex;
  private final AtomicLong balanceCounter = new AtomicLong();
  private String clusterName = null;
  private int httpPort = 9200;
  private String indexName = "metadata";
  private boolean autoCreateCollectionIndex = false;
  private String collectionIndexName = "collections";
  private boolean indexNameIsAlias = true;
  private boolean is6Plus = false;
  private boolean is7Plus = false;
  private String itemIndexType = "item";
  private String mappingsFile = "config/elastic-mappings.json";
  private String mappingsFile7 = "config/elastic-mappings-7.json";
  private List<String> nodes;
 // private PreBuiltTransportClient transportClient;
  private int transportPort = 9300;
  private boolean useHttps = false;
  private boolean useSeparateXmlItem = true;
  private String xmlIndexType = "clob";
  private String base64Key = "";
  private String engineType = "";
  private String awsOpenSearchType = "";
  
  private String awsALBEndpoint = "";
  
  public String getAwsALBEndpoint() {
	return awsALBEndpoint;
  }

	public void setAwsALBEndpoint(String awsALBEndpoint) {
		this.awsALBEndpoint = awsALBEndpoint;
	}
	
  public String getAwsOpenSearchType() {
    return awsOpenSearchType;
  }

  public void setAwsOpenSearchType(String awsOpenSearchType) {
    this.awsOpenSearchType = awsOpenSearchType;
  }  
  
  public String getEngineType() {
    return engineType;
  }

  public void setEngineType(String engineType) {
    this.engineType = engineType;
  }

  public String getBase64Key() {
    return base64Key;
  }

  public void setBase64Key(String base64Key) {
          this.base64Key = base64Key;
  }

  public String getBase64Iv() {
          return base64Iv;
  }

  public void setBase64Iv(String base64Iv) {
          this.base64Iv = base64Iv;
  }

  private String base64Iv = "";
  private String username = null;
  private String password = null;
  private boolean encryptPassword = false;
  
  private Integer proxyBufferSize = DEFAULT_PROXY_BUFFER_SIZE;
  
  /** Constructor */
  public ElasticContext() {}
  
  /**
   * Gest proxy buffer size.
   * @return buffer size
   */
  public Integer getProxyBufferSize() {
    return proxyBufferSize;
  }

  /**
   * Sets proxy buffer size.
   * @param proxyBufferSize buffer size or <code>null</code> for default
   */
  public void setProxyBufferSize(Integer proxyBufferSize) {
    this.proxyBufferSize = proxyBufferSize!=null? proxyBufferSize: DEFAULT_PROXY_BUFFER_SIZE;
  }
  
  /** Allow internal metadata file identifiers to be used as the Elasticsearch _id .*/
  public boolean getAllowFileId() {
    return allowFileId;
  }
  /** Allow internal metadata file identifiers to be used as the Elasticsearch _id
   * @param allowFileId.*/
  public void setAllowFileId(boolean allowFileId) {
    this.allowFileId = allowFileId;
  }

  /** Auto-create the metadata index if required.
   * @return  */
  public boolean getAutoCreateIndex() {
    return autoCreateIndex;
  }
  /** Auto-create the metadata index if required.
   * @param autoCreateIndex */
  public void setAutoCreateIndex(boolean autoCreateIndex) {
    this.autoCreateIndex = autoCreateIndex;
  }
  
  /** The cluster name.
   * @return  */
  public String getClusterName() {
    return clusterName;
  }
  /** The cluster name.
   * @param clusterName */
  public void setClusterName(String clusterName) {
    this.clusterName = clusterName;
  }
  
  /** The HTTP port (default=9200)
   * @return  */
  public int getHttpPort() {
    return httpPort;
  }
  /** The HTTP port (default=9200)
   * @param httpPort */
  public void setHttpPort(int httpPort) {
    this.httpPort = httpPort;
  }

  /** The metadata index name (default=metadata).
   * @return  */
  public String getIndexName() {
    return this.indexName;
  }
  /** The metadata index name (default=metadata).
   * @param indexName */
  public void setIndexName(String indexName) {
    this.indexName = indexName;
  }
  /** The collections index name (default=collections).
   * @return  */
  public String getCollectionIndexName() {
		return collectionIndexName;
  }
  /** The collections index name (default=collections).
   * @param collectionIndexName */
 public void setCollectionIndexName(String collectionIndexName) {
	this.collectionIndexName = collectionIndexName;
 }

  /** Treat the index name as an alias.
   * @return  */
  public boolean getIndexNameIsAlias() {
    return indexNameIsAlias;
  }

  /** supports collections or not */
  public boolean getAutoCreateCollectionIndex() {
    return autoCreateCollectionIndex;
  }
  /** supports collections or not */
  public void setAutoCreateCollectionIndex(boolean autoCreateCollectionIndex) {
    this.autoCreateCollectionIndex = autoCreateCollectionIndex;
  }
 
  /** Treat the index name as an alias.
   * @param indexNameIsAlias */
  public void setIndexNameIsAlias(boolean indexNameIsAlias) {
    this.indexNameIsAlias = indexNameIsAlias;
  }
  
  /** Version 6+
   * @return  */
  public boolean getIs6Plus() {
    return is6Plus;
  }
  /** Version 6+
   * @param is6Plus */
  public void setIs6Plus(boolean is6Plus) {
    this.is6Plus = is6Plus;
  }
  
  /** Version 7+
   * @return  */
  public boolean getIs7Plus() {
    return is7Plus;
  }
  /** Version 7+
   * @param is7Plus */
  public void setIs7Plus(boolean is7Plus) {
    this.is7Plus = is7Plus;
  }
  
  /** The index name holding metadata items.
   * @return  */
  public String getItemIndexName() {
    return this.indexName;
  }

  /** The item index type (default=item).
   * @return  */
  public String getItemIndexType() {
    return this.itemIndexType;
  }
  /** The item index type (default=item).
   * @param itemIndexType */
  public void setItemIndexType(String itemIndexType) {
    this.itemIndexType = itemIndexType;
  }
  
  public String getActualItemIndexType() {
    return !getIs7Plus()? getItemIndexType(): "_doc";
  }
  
  /** The index mappings file (default=config/elastic-mappings.json). */
  public String getMappingsFile() {
    return mappingsFile;
  }
  /** The index mappings file (default=config/elastic-mappings.json). */
  public void setMappingsFile(String mappingsFile) {
    this.mappingsFile = mappingsFile;
  }
  
  /** The index mappings file (default=config/elastic-mappings-7.json). */
  public String getMappingsFile7() {
    return mappingsFile7;
  }
  /** The index mappings file (default=config/elastic-mappings-7.json). */
  public void setMappingsFile7(String mappingsFile7) {
    this.mappingsFile7 = mappingsFile7;
  }
  
  /**
   * Gets actual mapping file.
   * @return mappings file
   */
  public String getActualMappingsFile() {
    return getIs7Plus()? getMappingsFile7(): getMappingsFile();
  }

  /** The node names. */
  public List<String> getNodes() {
    return this.nodes;
  }
  /** The node names. */
  public void setNodes(List<String> nodes) {
    this.nodes = nodes;
  }
  
  /** The transport client. */
//  public TransportClient getTransportClient() {
//    return transportClient;
//  }
  /** The transport client.
     * @return  */
//  public void setTransportClient(PreBuiltTransportClient transportClient) {
//    this.transportClient = transportClient;
//  }
  
  public RestHighLevelClient openSearchRestClient()
  {
      final CredentialsProvider credentialsProvider = new BasicCredentialsProvider();

    credentialsProvider.setCredentials(AuthScope.ANY,
      new UsernamePasswordCredentials("",""));

    //Create a client.
    org.opensearch.client.RestClientBuilder builder = org.opensearch.client.RestClient.builder(new HttpHost("localhost", 9200, "http"))
      .setHttpClientConfigCallback((HttpAsyncClientBuilder httpClientBuilder) -> httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider));
      
      RestHighLevelClient client = new RestHighLevelClient(builder);
      return client;
  }
  
  /** The transport port (default=9300) */
  public int getTransportPort() {
    return transportPort;
  }
  /** The transport port (default=9300) */
  public void setTransportPort(int transportPort) {
    this.transportPort = transportPort;
  }
  
  /** Use HTTPS. */
  public boolean getUseHttps() {
    return useHttps;
  }
  /** Use HTTPS. */
  public void setUseHttps(boolean useHttps) {
    this.useHttps = useHttps;
  }
  
  /** Store XMLs in a separate item type. */
  public boolean getUseSeparateXmlItem() {
    return useSeparateXmlItem;
  }
  /** Store XMLs in a separate item type. */
  public void setUseSeparateXmlItem(boolean useSeparateXmlItem) {
    this.useSeparateXmlItem = useSeparateXmlItem;
  }

  /** The index name holding metadata xmls. */
  public String getXmlIndexName() {
    return this.indexName;
  }
  
  /** The xml index type (default=xml). */
  public String getXmlIndexType() {
    return xmlIndexType;
  }
  /** The xml index type (default=xml). */
  @SuppressWarnings("unused")
  private void setXmlIndexType(String xmlIndexType) {
    this.xmlIndexType = xmlIndexType;
  }
  
  /** x-pack credential */
  public String getUsername() {
    return this.username;
  }
  /** x-pack credential */
  public void setUsername(String v) {
    this.username = v;
  }
  
  /**credential */
  public String getPassword() {
	  String password = this.password;
	  try{
		 if(isEncryptPassword())
		    {
			 password = EncryptDecrypt.decrypt(this.password,this.base64Key,this.base64Iv);
		    }
	    }catch(Exception ex)
	    {
	    	LOGGER.error("Elastic password could not be decrypted. "+ex);
	    	return null;
	    }
	  return password;
  }
  /** credential */
  public void setPassword(String v) {
    this.password = v;
  }
  
  /** use encrypted Password */
  public boolean isEncryptPassword() {
    return this.encryptPassword;
  }
  /** use encrypted Password */
  public void setEncryptPassword(boolean encryptPassword) {
    this.encryptPassword = encryptPassword;
  }
  
  
  
  /** Methods =============================================================== */
  
  /**
   * Create an alias.
   * @param index the index name
   * @param alias the alias name
   * @throws Exception
   */
  protected void _createAlias(String index, String alias) throws Exception {
    //LOGGER.info("Creating alias: "+alias+" for index: "+index);
//    AdminClient client = this.getTransportClient().admin();
//    client.indices().prepareAliases().addAlias(index,alias).get();
  }
  
  /**
   * Create an index.
   * @param name the index name
   * @throws Exception
   */
  protected void _createIndex(String name) throws Exception {
    //LOGGER.info("Creating index: "+name);
//    String path = this.getActualMappingsFile();
//    JsonObject jso = (JsonObject)JsonUtil.readResourceFile(path);
//    String json = JsonUtil.toJson(jso,false);
//    AdminClient client = this.getTransportClient().admin();
//    client.indices().prepareCreate(name).setSource(json, XContentType.JSON).get();
  }
  
  /**
   * Ensure that an index exists.
   * @param name the index name
   * @param considerAsAlias consider creating an aliased index
   * @throws Exception if an exception occurs
   */
  public void ensureIndex(String name, boolean considerAsAlias) throws Exception {
    LOGGER.debug("Checking index: "+name);
//    try {
//      if (name == null || name.trim().length() == 0) return;
//      AdminClient client = this.getTransportClient().admin();
//      boolean exists = client.indices().prepareExists(name).get().isExists();
//      if (exists) return;
//      if (name.equals(this.getItemIndexName())) {
//        considerAsAlias = this.getIndexNameIsAlias();
//      }
//      if (name.indexOf("_v") != -1) considerAsAlias = false;
//      if (!considerAsAlias) {
//        _createIndex(name);
//      } else {
//        
//        String pfx = name+"_v";
//        String idxName = null;
//        int sfx = -1;
//        ImmutableOpenMap<String,Settings> all;
//        all = client.indices().prepareGetSettings("*").get().getIndexToSettings();
//        Iterator<ObjectObjectCursor<String,Settings>> iter = all.iterator();
//        while (iter.hasNext()) {
//          ObjectObjectCursor<String,Settings> o = iter.next();
//          if (o.key.startsWith(pfx)) {
//            String s = o.key.substring(pfx.length());
//            int i = Val.chkInt(s,-1);
//            if (i > sfx) {
//              sfx = i;
//              idxName = o.key;
//            }
//          }
//        }
//        if (idxName == null) {
//          idxName = pfx+"1";
//          _createIndex(idxName);
//        }
//        _createAlias(idxName,name);
//      }
//    } catch (Exception e) {
//      LOGGER.error("Error executing ensureIndex()",e);
//      throw e;
//    }
  }
//  
//  /**
//   * Gets the base URL.
//   * @param next round robin if true
//   * @return the base url
//   */
  public String getBaseUrl(boolean next) {
	 String url;
    
    if(getAwsOpenSearchType().equals("serverless"))
    {
    	url = this.getAwsALBEndpoint();
    }
    else
    {
    	String node = null;
        if (next) {
          node = getNextNode();
        } else {
          node = nodesToArray()[0];
        }
        int port = getHttpPort();
        String scheme = "http://";
        if (getUseHttps()) scheme = "https://";
        url = scheme+node+":"+port;
    }
    return url;
  }
//  
//  /**
//   * Gets basic credentials if configured.
//   * @return the credentials
//   */
  public String getBasicCredentials()
  {
    String user = getUsername();
    String pwd = getPassword();
   
    if (user != null && user.length() > 0 && pwd != null && pwd.length() > 0) {
      try {
        String cred = user+":"+pwd;
        byte[] bytes = java.util.Base64.getEncoder().encode(cred.getBytes("UTF-8"));
        String authString = "Basic "+(new String(bytes,"UTF-8"));
        return authString;
      } catch (UnsupportedEncodingException e) {
      }
    }
    return null;
  }
  
  /**
   * Gets the next node name (for a round robin balancer context).
   * @return the node name
   */
  public String getNextNode() {
    String[] list = nodesToArray();
    int index = (int)(balanceCounter.getAndIncrement() % list.length);
    return list[index];
  }
  
  /**
   * Return an array of node names.
   * <br/>Names are split by commas.
   * @return the node names
   */
  public String[] nodesToArray() {
    ArrayList<String> al = new ArrayList<String>();
    if (getNodes() != null) {
      for (String node: this.getNodes()) {
        String[] a = node.split(",");
        for (String v: a) {
          v = v.trim();
          if (v.length() > 0) al.add(v);
        }
      }
    }
    return al.toArray(new String[0]);
  }
  
  /** Shutdown. */
  @PreDestroy
  public void shutdown() throws Exception {
    LOGGER.info("Shutting down ElasticContext...");
//    if (transportClient != null) {
//      transportClient.close();
//      transportClient = null;
//    }
  }
  
  /** Startup.
   */
  @PostConstruct
  public void startup() {
    LOGGER.info("Starting up ElasticContext...");
//    String[] nodeNames = this.nodesToArray();
//    if ((nodeNames == null) || (nodeNames.length == 0)) {
//      LOGGER.warn("Configuration warning: Elasticsearch - no nodes defined.");
//    } else if (transportClient != null) {
//      LOGGER.warn("Configuration warning: TransportClient has already been started.");
//    } else {
//      boolean hasSettings = false;
//      boolean hasXpack = false;
//      Builder settings = Settings.builder();
//      if (clusterName != null && clusterName.length() > 0) {
//        settings.put("cluster.name",clusterName);
//        hasSettings = true;
//      }
//      String user = this.getXpackUsername();
//      String pwd = this.getXpackPassword();
//      boolean sslEnabled = this.getXpackSecurityTransportSslEnabled();
//      String sslKey = this.getXpackSslKey();
//      String sslCert = this.getXpackSslCertificate();
//      String sslCa = this.getXpackSslCertificateAuthorities();
//      if (user != null && user.length() > 0 && pwd != null && pwd.length() > 0) {
//        settings.put("xpack.security.user",user+":"+pwd);
//        hasXpack = true;
//      }
//      if (sslEnabled) {
//        settings.put("xpack.security.transport.ssl.enabled","true");
//        hasXpack = true;
//      }
//      if (sslKey != null && sslKey.length() > 0) {
//        settings.put("xpack.ssl.key",sslKey);
//        hasXpack = true;
//      }
//      if (sslCert != null && sslCert.length() > 0) {
//        settings.put("xpack.ssl.certificate",sslCert);
//        hasXpack = true;
//      }
//      if (sslCa != null && sslCa.length() > 0) {
//        settings.put("xpack.ssl.certificate_authorities",sslCa);
//        hasXpack = true;
//      }
//      if (this.getXpackHttpType() != null && this.getXpackHttpType().length() > 0) {
//        //System.out.println("*** x-pack http.type="+this.getXpackHttpType());
//        settings.put("http.type",this.getXpackHttpType());
//        hasXpack = true;
//      }
//      if (this.getXpackTransportType() != null && this.getXpackTransportType().length() > 0) {
//        //System.out.println("*** x-pack transport.type="+this.getXpackTransportType());
//        settings.put("transport.type",this.getXpackTransportType());
//        hasXpack = true;
//      }
//      if (hasXpack) {
//        transportClient = new PreBuiltXPackTransportClient(settings.build());
//      } else if (hasSettings) {
//        transportClient = new PreBuiltTransportClient(settings.build());
//      } else {
//        transportClient = new PreBuiltTransportClient(Settings.EMPTY);
//      }
//      
//      for (String node: nodeNames) {
//        try {
//          InetAddress a = InetAddress.getByName(node);
//          // transportClient.addTransportAddress(new InetSocketTransportAddress(a,transportPort));
//          transportClient.addTransportAddress(new TransportAddress(a,transportPort));
//        } catch (UnknownHostException ex) {
//          LOGGER.warn(String.format("Invalid node name: %s", node), ex);
//        }
//      }
//      
//      if (this.getAutoCreateIndex()) {
//        String indexName = getItemIndexName();
//        boolean indexNameIsAlias = getIndexNameIsAlias();
//        try {
//          ensureIndex(indexName,indexNameIsAlias);
//        } catch (Exception e) {
//          // keep trying - every 5 minutes
//          long period = 1000 * 60 * 5;
//          long delay = period;
//          Timer timer = new Timer(true);
//          timer.scheduleAtFixedRate(new TimerTask() {
//            @Override
//            public void run() {
//              try {
//                ensureIndex(indexName,indexNameIsAlias);
//                timer.cancel();
//              } catch (Exception e2) {
//                // logging is handled by ensureIndex
//              }
//            }      
//          },delay,period);
//        }
//      }
//      
//    }
  }


}
