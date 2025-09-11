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
package com.esri.geoportal.test;
import java.io.IOException;
import java.nio.file.DirectoryIteratorException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;

import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import org.apache.hc.client5.http.impl.auth.BasicCredentialsProvider;
import org.apache.hc.core5.http.HttpHost;
import org.apache.hc.client5.http.auth.AuthScope;
import org.apache.hc.client5.http.auth.CredentialsStore;
import org.apache.hc.client5.http.auth.UsernamePasswordCredentials;
import org.apache.hc.core5.http.impl.nio.client.HttpAsyncClientBuilder;
import org.opensearch.action.admin.indices.delete.DeleteIndexRequest;
import org.opensearch.action.delete.DeleteRequest;
import org.opensearch.action.get.GetRequest;
import org.opensearch.action.get.GetResponse;
import org.opensearch.action.index.IndexRequest;
import org.opensearch.client.RequestOptions;
import org.opensearch.client.RestClient;
import org.opensearch.client.RestClientBuilder;
import org.opensearch.client.RestHighLevelClient;
import org.opensearch.client.indices.CreateIndexRequest;
import org.opensearch.client.indices.CreateIndexResponse;
import org.opensearch.common.settings.Settings;
import org.opensearch.search.SearchHit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import com.esri.geoportal.base.metadata.Evaluator;
import com.esri.geoportal.base.metadata.MetadataDocument;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.xml.XmlUtil;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.request.DeleteItemRequest;
import com.esri.geoportal.lib.elastic.http.request.GetItemRequest;
import com.esri.geoportal.lib.elastic.http.request.GetMetadataRequest;
import com.esri.geoportal.lib.elastic.http.request.PublishMetadataRequest;
import com.esri.geoportal.lib.elastic.http.request.ReindexRequest;
import com.esri.geoportal.lib.elastic.http.request.TransformMetadataRequest;
import com.esri.geoportal.lib.elastic.request.ValidateMetadataRequest;
import com.esri.geoportal.lib.elastic.util.Scroller;

@SuppressWarnings("unused")
public class Test {
  
  public static final Logger LOGGER = LoggerFactory.getLogger(Test.class);
  
  public static void main(String[] args) {
    System.setProperty("catilina.base","c:/logs");
    AbstractApplicationContext context = null;
    try {
      //context = new ClassPathXmlApplicationContext("config/app-context.xml");
      //org.apache.logging.log4j
      
      //Test.test1();
      //Test.testPublishMetadata();
      //Test.testPublishJson();
      //Test.testGetItem();
      //Test.testGetMetadata();
      //Test.testDeleteMetadata();
      //Test.testTransformMetadata();
      //Test.testValidateMetadata();
      //Test.testPython();
      //Test.testNashorn();
      //Test.testScroll2();
      //Test.testScroll3();
      //Test.testScriptEvaluator();
      //Test.testReindex();
      //Test.testAlias();
      //Test.testKvp();
      //Test.testDump();
      //Test.testLoad();
      
      //Test.httpGetItem();
      //Test.httpDeleteItem();
     // Test.httpScroller();
    
       Test.testRestHighLevelClient();
      
    } catch (Throwable t) {
      LOGGER.error(t.getClass().getName());
      LOGGER.error("Exception",t);
    } finally {
      if (context != null) {
        try {
          Thread.sleep(2000);
          context.close();
        } catch (Throwable t) {
          LOGGER.error("Error closing ApplicationContext",t);
        }
      }
      LOGGER.info(".........................................................");
    }
  }
  
  public static void testRestHighLevelClient() throws IOException
  {
     //Establish credentials to use basic authentication.
    //Only for demo purposes. Don't specify your credentials in code.
    final CredentialsStore credentialsProvider = new BasicCredentialsProvider();

    credentialsProvider.setCredentials(new AuthScope(null, -1),
      new UsernamePasswordCredentials("admin", "admin".toCharArray()));

    //Create a client.
    RestClientBuilder builder = RestClient.builder(new HttpHost("http", "localhost", 9200))
      .setHttpClientConfigCallback((HttpAsyncClientBuilder httpClientBuilder) -> httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider));
      //Create a non-default index with custom settings and mappings.
      try (RestHighLevelClient client = new RestHighLevelClient(builder)) {
          //Create a non-default index with custom settings and mappings.
          CreateIndexRequest createIndexRequest = new CreateIndexRequest("custom-index");
          
          createIndexRequest.settings(Settings.builder() //Specify in the settings how many shards you want in the index.
                  .put("index.number_of_shards", 4)
                  .put("index.number_of_replicas", 3)
          );
          //Create a set of maps for the index's mappings.
          HashMap<String, String> typeMapping = new HashMap<>();
          typeMapping.put("type", "integer");
          HashMap<String, Object> ageMapping = new HashMap<>();
          ageMapping.put("age", typeMapping);
          HashMap<String, Object> mapping = new HashMap<>();
          mapping.put("properties", ageMapping);
          createIndexRequest.mapping(mapping);
          CreateIndexResponse createIndexResponse = client.indices().create(createIndexRequest, RequestOptions.DEFAULT);
          
          //Adding data to the index.
          IndexRequest request = new IndexRequest("custom-index"); //Add a document to the custom-index we created.
          request.id("1"); //Assign an ID to the document.
          
          HashMap<String, String> stringMapping = new HashMap<>();
          stringMapping.put("message:", "Testing Java REST client");
          request.source(stringMapping); //Place your content into the index's source.
          client.index(request, RequestOptions.DEFAULT);
          
          //Getting back the document
          GetRequest getRequest = new GetRequest("custom-index", "1");
          GetResponse response = client.get(getRequest, RequestOptions.DEFAULT);
          
          System.out.println("response from open search"+response.getSourceAsString());
          
          //Delete the document
          DeleteRequest deleteDocumentRequest = new DeleteRequest("custom-index", "1"); //Index name followed by the ID.
          client.delete(deleteDocumentRequest, RequestOptions.DEFAULT);
          
          //Delete the index
          DeleteIndexRequest deleteIndexRequest = new DeleteIndexRequest("custom-index"); //Index name.
          client.indices().delete(deleteIndexRequest, RequestOptions.DEFAULT);
      } 
  }
  
  public static void test1() throws Exception {
    /*
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    ItemIO itemIO = new ItemIO();
    String xml = itemIO.readXml(ec,"qqqqqqqqqqq");
    System.err.println("xml\r\n"+xml);
    */
  }
  
  public static void test4() throws Exception {
//    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
//    SearchRequestBuilder sr = ec.getTransportClient().prepareSearch();
//    System.err.println(sr);;
  }
  
  public static void testPublishJson() throws Exception {
    AppUser user = new AppUser("publisher",false,true);
    //user = new AppUser("user",false,false);
    //user = null;
    boolean pretty = true;
    String id = null;
    id = "88887777";
    String p = "C:/Projects/metadata/elastic/doc1.json";
    String json =  new String(Files.readAllBytes(Path.of(p)),"UTF-8");
    //json = null;
    String xml = XmlUtil.readFile("C:/Projects/metadata/elastic/iso19115-urban-1.xml");
    
    JsonObjectBuilder jb = JsonUtil.newObjectBuilder((JsonObject)JsonUtil.toJsonStructure(json));
    jb.add("xml",xml);
    json = JsonUtil.toJson(jb.build());
    
    System.err.println(json);

    PublishMetadataRequest request = GeoportalContext.getInstance().getBean(
        "request.PublishMetadataRequest",PublishMetadataRequest.class);
    request.init(user,pretty);
    request.init(id,json);
    AppResponse response = request.execute();
    LOGGER.info(response.getStatus().toString());
    LOGGER.info(response.getEntity().toString());
  }
  
  
  public static void testPublishMetadata() throws Exception {
    AppUser user = new AppUser("publisher",false,true);
    //user = new AppUser("user",false,false);
    //user = null;
    boolean pretty = true;
    String id = null;
    id = "88884444z";
    String p = "C:/Projects/metadata/elastic/iso19115-urban-1.xml";
    String xml = XmlUtil.readFile(p);
    //xml = null;

    PublishMetadataRequest request = GeoportalContext.getInstance().getBean(
        "request.PublishMetadataRequest",PublishMetadataRequest.class);
    request.init(user,pretty);
    request.init(id,xml);
    AppResponse response = request.execute();
    LOGGER.info(response.getStatus().toString());
    LOGGER.info(response.getEntity().toString());
  }
  
  public static void testGetItem() throws Exception {
    AppUser user = new AppUser("publisher",false,true);
    boolean pretty = true;
    boolean includeMetadata = true;
    String id = "88884444";
    //id = "3333";
    //id = null;
    //id = "73848e979da84fa89c5e019e3646f02f";
    id = "1856b89306f74562bade208433c5e431";
    String f = "json";
    //f = "atom";
    //f = "csw";
    
    GetItemRequest request = GeoportalContext.getInstance().getBean(
        "request.GetItemRequest",GetItemRequest.class); 
    request.setBaseUrl("http://urbanm.esri.com:8080/geoportal2");
    request.init(user,pretty);
    request.init(id,f,includeMetadata);
    AppResponse response = request.execute();
    LOGGER.info(response.getStatus().toString());
    if (response.getEntity() != null) LOGGER.info(response.getEntity().toString());
  }
  
  public static void testGetMetadata() throws Exception {
    AppUser user = null;
    boolean pretty = false;
    String id = "88884444";
    //id = "3333";
    //id = null;

    GetMetadataRequest request = GeoportalContext.getInstance().getBean(
        "request.GetMetadataRequest",GetMetadataRequest.class);    
    request.init(user,pretty);
    request.init(id);
    AppResponse response = request.execute();
    LOGGER.info(response.getStatus().toString());
    if (response.getEntity() != null) LOGGER.info(response.getEntity().toString());
  }
  
  public static void testDeleteMetadata() throws Exception {
    AppUser user = new AppUser("publisher",false,true);
    //user = new AppUser("user",false,false);
    //user = null;
    boolean pretty = true;
    String id = "88884444";
    //id = "3333";
    //id = null;

    DeleteItemRequest request = GeoportalContext.getInstance().getBean(
        "request.DeleteItemRequest",DeleteItemRequest.class);
    request.init(user,pretty);
    request.init(id);
    AppResponse response = request.execute();
    LOGGER.info(response.getStatus().toString());
    LOGGER.info(response.getEntity().toString());
  }
  
  public static void testTransformMetadata() throws Exception {
    AppUser user = null;
    boolean pretty = true;
    boolean forItemDetails = true;
    String id = "88884444";
    String p = "C:/Projects/metadata/elastic/iso19115-urban-1.xml";
    String xml = XmlUtil.readFile(p);
    String xslt = "iso-index.xslt";
    //xml = "ss";
    //xml = "<a>bb</a>";
    //xml = "<a>bb<b>";
    //xml = null;
    //xslt = null;
    //xslt = "metadata/wwiso-index.xslt";
    //xslt = "http://localhost:8080/geoportal2/metadata/wwiso-index.xslt";

    TransformMetadataRequest request = GeoportalContext.getInstance().getBean(
        "request.TransformMetadataRequest",TransformMetadataRequest.class);
    request.init(user,pretty);
    if (forItemDetails) {
      request.setId(id);
      request.setForItemDetails(true);
    } else {
      request.setXml(xml);
      request.setXslt(xslt);
    }
    AppResponse response = request.execute();
    LOGGER.info(response.getStatus().toString());
    LOGGER.info(response.getEntity().toString());
  }
  
  public static void testValidateMetadata() throws Exception {
    AppUser user = null;
    boolean pretty = true;
    String p = "C:/Projects/metadata/elastic/iso19115-urban-1.xml";
    String xml = XmlUtil.readFile(p);
    //xml = "ss";
    //xml = "<a>bb</a>";
    //xml = "<a>bb<b>";
    //xml = null;

    ValidateMetadataRequest request = GeoportalContext.getInstance().getBean(
        "request.ValidateMetadataRequest",ValidateMetadataRequest.class);
    request.init(user,pretty);
    request.init(xml);
    AppResponse response = request.execute();
    LOGGER.info(response.getStatus().toString());
    LOGGER.info(response.getEntity().toString());
  }
  
  public static void testPython() throws Exception {
    String cmd = "C:/Python27/ArcGIS10.2/python.exe C:/Projects/nodc/elastic/Publish2REST-urban.PY";
    String out = " > C:\\logs\\python.txt 2>&1";
    Path dir = Path.of("C:/Projects/nodc/elastic/metadata/collections");
    List<String> result = new ArrayList<>();
    try (DirectoryStream<Path> stream = Files.newDirectoryStream(dir, "*.{xml}")) {
      for (Path entry: stream) {
        result.add(entry.toString());
      }
    } catch (DirectoryIteratorException ex) {
      throw ex.getCause();
    }
    dir = Path.of("C:/Projects/nodc/elastic/metadata/granules");
    try (DirectoryStream<Path> stream = Files.newDirectoryStream(dir, "*.{xml}")) {
      for (Path entry: stream) {
        result.add(entry.toString());
      }
    } catch (DirectoryIteratorException ex) {
      throw ex.getCause();
    }
    
    System.err.println("fileCount="+result.size()); // 1293  1194 99
    
    int n = 0, count = 0; StringBuilder sb = new StringBuilder();
    for (String s: result) {
      sb.append(" \"").append(s).append("\"");
      n++; count++;
      if (n > 20) {
        System.err.println("count="+count+" ...");
        Runtime.getRuntime().exec(cmd+sb.toString()+out);
        n = 0; sb = new StringBuilder();
        //break;
      }
    }
    if (sb.length() > 0) {
      System.err.println("count="+count+" ...");
      Runtime.getRuntime().exec(cmd+sb.toString()+out);
    }
    
    //String out = " > C:/logs/python.txt";
    //cmd += " C:/Projects/nodc/elastic/metadata/collections/0000001.xml";
    //cmd += " C:/Projects/nodc/elastic/metadata/collections/0000002.xml";
    //cmd += out;
    //Process p = Runtime.getRuntime().exec(cmd);
    //int exitCode = p.waitFor();
    //System.err.println("exitCode="+exitCode);
    
  }
  
  public static void testNashorn() throws Exception {
    /*
    long t1 = System.currentTimeMillis();
    ScriptEngineManager engineManager = new ScriptEngineManager();
    ScriptEngine engine = engineManager.getEngineByName("nashorn");
    //engine.eval("function sum(a, b) { return a + b; }");
    //System.err.println(engine.eval("sum(1, 2);"));
    String item = "{\"title\": \"TheTitle\",\"description\": \"The description\"}";
    //System.err.println("--------------------------------------------------------->>>>");
    String path = "C:/Projects/eclipse-jee-mars-1-win32-x86_64/workspace/geoportal2/src/main/resources/opensearch/item2atomEntry.js";
    engine.eval(new FileReader(path));
    Invocable invocable = (Invocable)engine;
    for (int i=1;i<=10;i++) {
      String v = item.replace("TheTitle","TheTitle"+i);
      Object result = invocable.invokeFunction("itemToAtomEntry",""+i,v);
      System.err.println(result);
      //System.err.println(result.getClass());
    }
    long t2 = System.currentTimeMillis();
    System.err.println(t2-t1);
    System.err.println("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    */
  }
  
  public static void testScroll() throws Exception {
    
//    String scrollId = null;
//    long keepAliveMillis = 60000L;
//    int pageSize = 100;
//    
//    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
//    TransportClient client = ec.getTransportClient();
//    String indexName = ec.getItemIndexName();
//    //String itemType = ec.getMetadataIndexType_item();
//    String xmlItemType = ec.getXmlIndexType();
//    
//    SearchRequestBuilder search = client.prepareSearch(indexName);
//    search.setTypes(xmlItemType);
//    search.setQuery(QueryBuilders.matchAllQuery());
//    search.setScroll(new TimeValue(keepAliveMillis));
//    search.addSort(SortBuilders.fieldSort("_doc"));
//    search.setSize(pageSize);
//    
//    long count = 0, processed = 0, max = Long.MAX_VALUE;
//    
//    SearchResponse response = search.get();
//    scrollId = response.getScrollId();
//    while (true) {
//      SearchHit[] hits = response.getHits().getHits();
//      if (hits.length == 0) break;
//      for (SearchHit hit: hits) {
//        count++;
//        if (count > max) break;
//        String id = hit.getId();
//        String xml = (String)hit.getSourceAsMap().get("xml");
//        //System.err.println(id+"\r\n"+xml);
//        processed++;
//      }
//      if (count > max) break;
//      SearchScrollRequestBuilder scroll = client.prepareSearchScroll(scrollId);
//      scroll.setScroll(new TimeValue(keepAliveMillis));
//      response = scroll.get();
//    }
//    System.err.println("processed="+processed);
//    
//    try {
//      if (scrollId != null) {
//        client.prepareClearScroll().addScrollId(scrollId).get();
//      }
//    } catch (Throwable t) {
//      t.printStackTrace();
//    }
//    
//    //client.prepareClearScroll().
//    //SearchScrollRequestBuilder scroll = client.prepareSearchScroll(scrollId);
//    //scroll.setScroll(new TimeValue(keepAliveMillis));
//    //scroll.r
//    //builder.
//    
//    //client.prepareSearchScroll(scrollId);
//    
//    
//    /*
//    scroll.s
//    scroll.setTypes(xmlItemType);
//    scroll.setQuery(QueryBuilders.matchAllQuery());
//    scroll.setSearchType(SearchType.SCAN);
//    
//    client.prepareClearScroll()
//    client.prepareSearchScroll(scrollId)
//    
//    
//    QueryBuilder qb = QueryBuilders.matchAllQuery();
//
//    SearchResponse scrollResp = client.prepareSearch(test)
//            .setSearchType(SearchType.SCAN)
//            .setScroll(new TimeValue(60000))
//            .setQuery(qb)
//            .setSize(100).execute().actionGet(); //100 hits per shard will be returned for each scroll
//    //Scroll until no hits are returned
//    while (true) {
//
//        for (SearchHit hit : scrollResp.getHits().getHits()) {
//            //Handle the hit...
//        }
//        scrollResp = client.prepareSearchScroll(scrollResp.getScrollId()).setScroll(new TimeValue(60000)).execute().actionGet();
//        //Break condition: No hits are returned
//        if (scrollResp.getHits().getHits().length == 0) {
//            break;
//        }
//    }
//    */
  }
  
  public static void testScroll2() throws Exception {
    Scroller scroller = new Scroller();
    scroller.setIndexName("metadata");
    scroller.setIndexType("xml");
    scroller.setMaxDocs(10);
    scroller.scroll(
      new Consumer<SearchHit>(){
        @Override
        public void accept(SearchHit hit) {
          LOGGER.info(""+scroller.getTotalHits()+" "+hit.getId());
        }
      }
    );
  }
  
  
  public static void testScroll3() throws Exception {
    String creds = "admin:admin";
    String base64Creds = new String(Base64.getEncoder().encode(creds.getBytes()));    
    
    AtomicLong count = new AtomicLong(0);
    String url = "http://localhost:8080/geoportal2/rest/metadata/item";
    Scroller scroller = new Scroller();
    scroller.setIndexName("metadata");
    scroller.setIndexType("xml");
    //scroller.setMaxDocs(1000);
    scroller.scroll(
      new Consumer<SearchHit>(){
        @Override
        public void accept(SearchHit hit) {
          try {
            //System.err.println("count="+count.incrementAndGet()+" ...");
            String xml = (String)hit.getSourceAsMap().get("xml");
            //LOGGER.info(""+scroller.getTotalHits()+" "+hit.getId()+"\r\n"+xml);
            RestTemplate rest = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Type","application/xml;charset=UTF-8");
            headers.add("Authorization","Basic "+base64Creds);
            HttpEntity<String> requestEntity = new HttpEntity<String>(xml,headers);
            ResponseEntity<String> responseEntity = rest.exchange(url,HttpMethod.PUT,requestEntity,String.class);
            String response = responseEntity.getBody();
            if (!responseEntity.getStatusCode().equals(HttpStatus.OK)) {
              //LOGGER.warn(response);
            }
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
      }
    );
  }
  
  public static void testScriptEvaluator() throws Exception {
    AppUser user = null;
    boolean pretty = true;
    String p = "C:/Projects/metadata/elastic/iso19115-urban-1.xml";
    p = "C:/Projects/eclipse-jee-mars-1-win32-x86_64/workspace/geoportal2/src/main/resources/sample/iso.xml";
    String xml = XmlUtil.readFile(p);
    MetadataDocument mdoc = new MetadataDocument();
    mdoc.setXml(xml);
    //mdoc.interrogate();
    
    Evaluator jsEvaluator = new Evaluator();
    jsEvaluator.setJavascriptFile("metadata/js/Evaluator.js");
    //jsEvaluator.setJavascriptFile("metadata/js/IsoEvaluator.js");
    //jsEvaluator.interrogate(mdoc);
    //System.err.println("typeKey="+mdoc.getMetadataType().getKey());
    System.err.println("detailsXslt="+jsEvaluator.getDetailsXslt("iso19115"));
    //jsEvaluator.evaluate(mdoc);
    //jsEvaluator.evaluate(mdoc);
    //jsEvaluator.evaluate(mdoc);
  }
  
  public static void testReindex() throws Exception {
    AppUser user = new AppUser("admin",true,true);
    //user = new AppUser("publisher",false,true);
    //user = null;
    boolean pretty = true;
    
    ReindexRequest request = GeoportalContext.getInstance().getBeanIfDeclared(
        "request.ReindexRequest",ReindexRequest.class,new ReindexRequest());
    request.init(user,pretty);
    
//    request.setFromIndexName("metadata10");
//    request.setToIndexName("testblob_v2");
//    request.setFromVersionCue("old");
    
    //request.setFromIndexName("testblob_v1");
    //request.setToIndexName("testblob_v2");
    
    //request.setFromIndexName("testclob_v1");
    //request.setToIndexName("testclob_v2");
    
    request.setFromIndexName("metadata");
    request.setToIndexName("metadata_v3");
    request.setFromVersionCue("old");
    
    AppResponse response = request.execute();
    LOGGER.info(response.getStatus().toString());
    LOGGER.info(response.getEntity().toString());
  }
  
  public static void testAlias() throws Exception {
//    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
//    //TransportClient client = ec.getTransportClient();
//    //client.admin().indices().
//    
//    AdminClient client = ec.getTransportClient().admin();
//    //req.a
//    //req.get();
//    String name = "metadata";
//    String indexName = "metadata_v1";
//    
//    /*
//    boolean indexExists = client.indices().prepareExists(name).get().isExists();
//    boolean aliasExists = client.indices().prepareAliasesExist(name).get().isExists();
//    System.err.println(indexExists+" "+aliasExists);
//    if (!indexExists) {
//      
//    }
//    */
//    
//    //GetAliasesResponse resp = client.indices().prepareGetAliases(name).get();
//    //if (resp.)
//    
//    IndicesAliasesRequestBuilder req = client.indices().prepareAliases();
//    boolean alreadyAliased = false, foundAlias = false;;
//    ImmutableOpenMap<String,List<AliasMetaData>> aliases;
//    aliases = client.indices().prepareGetAliases(name).get().getAliases();
//    Iterator<ObjectObjectCursor<String,List<AliasMetaData>>> iter = aliases.iterator();
//    while (iter.hasNext()) {
//      ObjectObjectCursor<String,List<AliasMetaData>> o = iter.next();
//      for (AliasMetaData md: o.value) {
//        String s = md.getAlias();
//        if (s != null && s.equals(name)) {
//          foundAlias = true;
//          if (o.key.equals(indexName)) {
//            alreadyAliased = true;
//          } else {
//            req.removeAlias(o.key,s);
//          }
//          break;
//        }
//      }
//      if (foundAlias) break;
//    }
//    if (alreadyAliased) {
//      
//    } else {
//      req.addAlias(indexName,name).get();
//    }
//
//    
    /*
    String pfx = name+"_v";
    String idxName = null;
    int sfx = -1;
    ImmutableOpenMap<String,Settings> all = client.indices().prepareGetSettings("*").get().getIndexToSettings();
    Iterator<ObjectObjectCursor<String,Settings>> iter = all.iterator();
    while (iter.hasNext()) {
      ObjectObjectCursor<String,Settings> o = iter.next();
      if (o.key.startsWith(pfx)) {
        String s = o.key.substring(pfx.length());
        int i = Val.chkInt(s,-1);
        if (i > sfx) {
          sfx = i;
          idxName = o.key;
        }
      }
    }
    if (idxName == null) {
      idxName = pfx+"1";
    }
    System.err.println(idxName+" sfx="+sfx);
    */
  }
  
  public static void testKvp() throws Exception {
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    /*
    String id = "88887777_xml";
    String indexName = "test_v1";
    DataItem dataItem = new DataItem();
    dataItem.setIndexName(indexName);
    dataItem.setId(id);
    
    JsonObject jso = dataItem.readMeta(ec);
    System.err.println(jso);
    System.err.println("wasFound="+dataItem.wasFound());
    System.err.println(dataItem.readHash(ec));
    System.err.println("wasFound="+dataItem.wasFound());
    System.err.println(dataItem.readBase64Data(ec));
    System.err.println("wasFound="+dataItem.wasFound());
    System.err.println(dataItem.readUtf8Data(ec));
    System.err.println("wasFound="+dataItem.wasFound());
    */
    
  }
  
  public static void testDump() throws Exception {
    //String creds = "admin:admin";
    AtomicLong count = new AtomicLong(0);
    String dir = "C:/Projects/elastic/metadata/sampedata/";
    Scroller scroller = new Scroller();
    scroller.setIndexName("metadata");
    scroller.setIndexType("clob");
    //scroller.setMaxDocs(10);
    scroller.scroll(
      new Consumer<SearchHit>(){
        @Override
        public void accept(SearchHit hit) {
          try {
            System.err.println(count.incrementAndGet());
            String id = hit.getId();
            String xml = (String)hit.getSourceAsMap().get("sys_clob");
            //System.err.println(id);
            Path p = Path.of(dir+id.replace("/xml","")+".xml");
            Files.write(p,xml.getBytes("UTF-8"));
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
      }
    );
  }
  
  public static void testLoad() throws Exception {
    String creds = "admin:admin";
    String base64Creds = new String(Base64.getEncoder().encode(creds.getBytes())); 
    String dir = "C:/Projects/elastic/metadata/sampedata/";
    String url = "http://localhost:8080/geoportal/rest/metadata/item?async=true";
    url = "http://gptdb1:8080/geoportal/rest/metadata/item?async=true";
    int count = 0;
    try (DirectoryStream<Path> directoryStream = Files.newDirectoryStream(Path.of(dir))) {
      for (Path path: directoryStream) {
        count++;
        //if (count > 5) break;
        System.err.println(count);
        //System.err.println(path);
        try {
          String xml = new String(Files.readAllBytes(path),"UTF-8");
          //System.err.println(xml);
          RestTemplate rest = new RestTemplate();
          HttpHeaders headers = new HttpHeaders();
          headers.add("Content-Type","application/xml;charset=UTF-8");
          headers.add("Authorization","Basic "+base64Creds);
          HttpEntity<String> requestEntity = new HttpEntity<String>(xml,headers);
          ResponseEntity<String> responseEntity = rest.exchange(url,HttpMethod.PUT,requestEntity,String.class);
          String response = responseEntity.getBody();
          if (!responseEntity.getStatusCode().equals(HttpStatus.OK)) {
            //LOGGER.warn(response);
          }
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    } catch (IOException ex) {
      ex.printStackTrace();
    }
  }
  
  public static void testBulk() throws Exception {
//    String index = null;
//    String type = null;
//    String id = null;
//    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
//    BulkRequestBuilder req = ec.getTransportClient().prepareBulk();
//    //req.add(ec.getTransportClient().prepareDelete(index,type,id));
//    
//    String ownerField = FieldNames.FIELD_SYS_OWNER;
//    String originalOwner = null;
//    String newOwner = null;
//    req.add(ec.getTransportClient().prepareUpdate(index,type,id).setDoc(ownerField,newOwner));
  }
  
  
  public static void httpGetItem() throws Exception {
    AppUser user = new AppUser("publisher",false,true);
    boolean pretty = true;
    boolean includeMetadata = true;
    String id = "33139d016158408e806d2fdab476eb5b";
    String f = "json";
    
    //GetItemRequest request = GeoportalContext.getInstance().getBean(
    //    "request.GetItemRequest",GetItemRequest.class); 
   
    GetItemRequest request = new com.esri.geoportal.lib.elastic.http.request.GetItemRequest();
    
    request.setBaseUrl("http://urbanm.esri.com:8080/geoportal2");
    request.init(user,pretty);
    request.init(id,f,includeMetadata);
    AppResponse response = request.execute();
    //LOGGER.info(response.getStatus().toString());
    if (response.getEntity() != null) LOGGER.info(response.getEntity().toString());
  }
  
  public static void httpDeleteItem() throws Exception {
    AppUser user = new AppUser("admin",true,true);
    String id = "bf8dd33eee3d4f69a93855657a54d419";
    DeleteItemRequest request = new com.esri.geoportal.lib.elastic.http.request.DeleteItemRequest();
    request.init(user,false);
    request.init(id);
    AppResponse response = request.execute();
    //LOGGER.info(response.getStatus().toString());
    if (response.getEntity() != null) LOGGER.info(response.getEntity().toString());
  }
  
  public static void httpScroller() throws Exception {
    
    com.esri.geoportal.lib.elastic.http.util.Scroller scroller = new com.esri.geoportal.lib.elastic.http.util.Scroller();
    scroller.setIndexName("metadata");
    scroller.setIndexType("item");
    scroller.setPageSize(100);
    //scroller.setMaxDocs(5000);
    //scroller.setFetchSource(false);
    
    scroller.scroll(
      new Consumer<com.esri.geoportal.lib.elastic.http.util.SearchHit>(){
        @Override
        public void accept(com.esri.geoportal.lib.elastic.http.util.SearchHit hit) {
          //LOGGER.info(""+scroller.getTotalHits()+", "+hit.getIndex()+", "+hit.getId());
        }
      }
    );
    
  }

}
