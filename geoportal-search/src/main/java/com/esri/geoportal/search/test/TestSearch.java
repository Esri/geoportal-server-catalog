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
package com.esri.geoportal.search.test;
import com.esri.geoportal.search.SearchRequest;

public class TestSearch {

  public static void main(String[] args) {
    try {
      System.err.println("Start ...");
      test1();
    } catch (Exception e) {
      e.printStackTrace();
    } finally {
      System.err.println(".........................................................");
    }
  }
  
  @SuppressWarnings("unused")
  public static void test1() throws Exception {
    
    String id1 = "cfdf6bdc68564f55b2439ff7f990436d", id2 = "64835013bb7f47c4bdaea3fda8a5afa1";
    //id1 = "606fd18b88aa4ff29d840c6f807e77bf"; id2 = "d8855ee4d3d74413babfb0f41203b168"; // portal
    
    String baseUrl = "http://www.geoportal.com/geoportal";
    
    String csw1 = baseUrl+"/csw?service=CSW&request=GetCapabilities";
    String csw2 = baseUrl+"/csw?service=CSW&request=GetRecords";
    String csw3 = baseUrl+"/csw?service=CSW&request=GetRecords&q=data";
    String csw4 = baseUrl+"/csw?service=CSW&request=GetRecords&q=xxxxxyyyyyzzzzz";
    String csw5 = baseUrl+"/csw?service=CSW&request=GetRecords&q=xxxxxyyyyyzzzzz&f=atom";
    String csw6 = baseUrl+"/csw?service=CSW&request=GetRecords&q=data&elementSetName=brief";
    String csw7 = baseUrl+"/csw?service=CSW&request=GetRecords&q=data&elementSetName=summary";
    String csw8 = baseUrl+"/csw?service=CSW&request=GetRecords&q=data&elementSetName=full";
    String csw9 = baseUrl+"/csw?service=CSW&request=GetRecords&q=data&typeNames=UnknownType";
    String csw10 = baseUrl+"/csw?service=CSW&request=GetRecords&q=data&f=atom";
    
    
    String csw11 = baseUrl+"/csw?service=CSW&request=GetCapabilities&version=3.0.0&target=arcgis&orgid=2ycVue24EK6qzjat";
    String csw12 = baseUrl+"/csw?service=CSW&request=GetCapabilities&version=3.0.0&target=arcgis&orgid=2ycVue24EK6qzjat";
    
    String cswid1 = baseUrl+"/csw?service=CSW&request=GetRecords&q=data&f=atom&id="+id1;
    String cswid2 = baseUrl+"/csw?service=CSW&request=GetRecords&q=zzzzz&f=atom&id="+id1;
    String cswid3 = baseUrl+"/csw?service=CSW&request=GetRecords&f=atom&id="+id1+"&id="+id2;
    String cswid4 = baseUrl+"/csw?service=CSW&request=GetRecords&f=atom&id="+id1+","+id2;
    
    String cswid5 = baseUrl+"/csw?service=CSW&request=GetRecordById&q=data&f=atom&id="+id1;
    String cswid6 = baseUrl+"/csw?service=CSW&request=GetRecordById&q=zzzzz&f=atom&id="+id1;
    String cswid7 = baseUrl+"/csw?service=CSW&request=GetRecordById&f=atom&id="+id1;
    String cswid8 = baseUrl+"/csw?service=CSW&request=GetRecordById&f=csw&id="+id1;
    String cswid9 = baseUrl+"/csw?service=CSW&request=GetRecordById&f=atom&id=zzzzz";
    String cswid10 = baseUrl+"/csw?service=CSW&request=GetRecordById&f=csw&id=zzzzz";
    
    String os1 = baseUrl+"/opensearch/description";
    String os2 = baseUrl+"/opensearch";
    String os3 = baseUrl+"/opensearch?q=data&pretty=true";
    String os4 = baseUrl+"/opensearch?q=xxxxxyyyyyzzzzz";
    String os5 = baseUrl+"/opensearch?q=xxxxxyyyyyzzzzz&f=csw";
    String os6 = baseUrl+"/opensearch?q=data&f=csw";
    String os7 = baseUrl+"/opensearch?q=data&orgid=2ycVue24EK6qzjat";
    String os8 = baseUrl+"/opensearch?q=data&orgid=RhGiohBHzSBKt1MS";
    String os9 = baseUrl+"/opensearch?q=data&orgid=RhGiohBHzSBKt1MS&filter=title:watches";
    String os10 = baseUrl+"/opensearch?q=data&filter=title:wms";
    String os11 = baseUrl+"/opensearch?q=data&target=local";
    String os12 = baseUrl+"/opensearch?q=data&target=arcgis";
    
    String os14 = baseUrl+"/opensearch?q=data&target=portal1";
    //String os15 = baseUrl+"/opensearch?q=data&target=portal&targetUrl=http://urbanvm.esri.com/arcgis";
    //String os16 = baseUrl+"/opensearch?q=data&target=geoportal&targetUrl=http://gptdb1.esri.com:8080/geoportal/elastic/metadata/item/_search";
    //String os17 = baseUrl+"/opensearch?target=geoportal&targetUrl=http://gptdb2.esri.com:8080/geoportal/elastic/img/item/_search";
    
    String os18 = baseUrl+"/opensearch?q=data&f=json";
    
    String osid1 = baseUrl+"/opensearch?q=data&f=atom&id="+id1;
    String osid2 = baseUrl+"/opensearch?q=zzzzz&f=atom&id="+id1; // TODO *** 
    String osid3 = baseUrl+"/opensearch?id="+id1+"&id="+id2;
    String osid4 = baseUrl+"/opensearch?id="+id1+","+id2;
    
    
    String osid5 = baseUrl+"/opensearch?q=data&f=atom&id="+id1;
    String osid6 = baseUrl+"/opensearch?q=zzzzz&f=atom&id="+id1;
    String osid7 = baseUrl+"/opensearch?f=atom&id="+id1;
    String osid8 = baseUrl+"/opensearch?f=csw&id="+id1;
    String osid9 = baseUrl+"/opensearch?f=atom&id=zzzzz";
    String osid10 = baseUrl+"/opensearch?f=csw&id=zzzzz";
      
    String portala = baseUrl+"/opensearch?q=*:*";
    String portalb = baseUrl+"/opensearch?q=*:*&time=2016-08-31T00:00:00.000Z/2016-08-31T23:59:59.999Z";
    String portalc = baseUrl+"/opensearch?time=2016-08-31T00:00:00.000Z/2016-08-31T23:59:59.999Z";
    String portald = baseUrl+"/opensearch?f=csw&q=data&bbox=-161,4.3,-36,57.8&id=63189de731af4129a5240780ca9200a5"; // yes
    String portale = baseUrl+"/opensearch?f=csw&q=data&bbox=-161,0.3,-36,2.8&id=63189de731af4129a5240780ca9200a5"; // no
    String portalf = baseUrl+"/opensearch?f=atom&q=data&sortField=title&sortOrder=desc"; // asc or desc
    String portalg = baseUrl+"/opensearch?q=data";
    
    String elastica = baseUrl+"/opensearch?q=*:*";
    String elasticb = baseUrl+"/opensearch?q=_id:129da23a318b418987c43a82ceeb6e22&time=2000-03-18T00:00:00Z/2000-04-04T23:59:59.999Z"; // nst based
    String elasticc = baseUrl+"/opensearch?q=_id:129da23a318b418987c43a82ceeb6e22&time=1999-03-18T00:00:00Z/2020-04-04T23:59:59.999Z"; // nst based
    String elasticd = baseUrl+"/opensearch?q=_id:129da23a318b418987c43a82ceeb6e22&time=2020-03-18T00:00:00Z/2020-04-04T23:59:59.999Z"; // nst based
    String elastice = baseUrl+"/opensearch?q=_id:129da23a318b418987c43a82ceeb6e22&time=2016-12-21T19:27:56.316Z/2016-12-21T19:27:56.316Z"; // mod based
    String elasticf = baseUrl+"/opensearch?q=_id:129da23a318b418987c43a82ceeb6e22&time=2015-12-21T19:27:56.316Z/2017-12-21T19:27:56.316Z"; // mod based
    String elasticg = baseUrl+"/opensearch?q=_id:129da23a318b418987c43a82ceeb6e22&time=2015-12-21T19:27:56.316Z/2017-12-21T19:27:56.316Z"; // mod based
    String elastich = baseUrl+"/opensearch?q=_id:129da23a318b418987c43a82ceeb6e22&time=2015/2020"; // mod based
    String elastici = baseUrl+"/opensearch?q=_id:129da23a318b418987c43a82ceeb6e22&f=csw";
    String elasticj = baseUrl+"/opensearch?q=_id:129da23a318b418987c43a82ceeb6e22&bbox=-132,42.4,-122,49.8"; // yes
    String elastick = baseUrl+"/opensearch?q=_id:129da23a318b418987c43a82ceeb6e22&bbox=-132,22.4,-122,29.8"; // no
    String elasticl = baseUrl+"/opensearch?q=data";
    String elasticm = baseUrl+"/opensearch?q=data&sort=title"; // title.sort or title.sort:asc or title.sort:desc
    String elasticn = baseUrl+"/opensearch?q=data&sort=title.sort:asc,date:desc"; 
    
    String targeta = baseUrl+"/opensearch?q=*:*&target=gptdb2"; 
    String targetb = baseUrl+"/opensearch?q=map&target=portal1";
    String targetc = baseUrl+"/opensearch?q=map&target=portal1&f=json";
        
    // csw3 csw10 os3 os6 os18
    String requestUrl = csw11;
    HttpServletRequestFacade hsr = new HttpServletRequestFacade(requestUrl);
    SearchRequest sr = new SearchRequest();
    sr.execute(hsr);
  }
  
  public static void test2() throws Exception {
    String baseUrl = "http://www.geoportal.com/geoportal";
    
    String[] list = new String[]{"/opensearch?q=data","/opensearch?q=map","/opensearch?q=road"};
    
    for (String v: list) {
      Thread thread = new Thread(new Runnable() {
        @Override
        public void run(){
          String requestUrl = baseUrl+v;
          HttpServletRequestFacade hsr = new HttpServletRequestFacade(requestUrl);
          SearchRequest sr = new SearchRequest();
          try {
            sr.execute(hsr);
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
      });
      thread.start();
    }
  }
  
}
