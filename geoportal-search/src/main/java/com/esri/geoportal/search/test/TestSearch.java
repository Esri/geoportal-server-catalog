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
  
  public static String makeGetRecordsXml() throws Exception {
    StringBuilder sb = new StringBuilder();
    sb.append("<?xml version='1.0' encoding='UTF-8'?>");
    sb.append("<csw:GetRecords xmlns:csw='http://www.opengis.net/cat/csw/2.0.2'");
    sb.append("  xmlns:ogc='http://www.opengis.net/ogc'");
    sb.append("  xmlns:gml='http://www.opengis.net/gml'");
    sb.append("  service='CSW' resultType='RESULTS'");
    //sb.append("  startPosition='3' maxRecords='200'");
    sb.append(">");
    sb.append("  <csw:Query>");
    sb.append("    <csw:ElementSetName>summary</csw:ElementSetName>");
    sb.append("    <csw:Constraint version='1.1.0'>");
    sb.append("      <ogc:Filter>");
    sb.append("        <ogc:And>");
    
//    sb.append("          <ogc:PropertyIsEqualTo>");
//    sb.append("            <ogc:PropertyName>dc:type</ogc:PropertyName>");
//    sb.append("            <ogc:Literal>liveData</ogc:Literal>");
//    sb.append("          </ogc:PropertyIsEqualTo> ");
    
//    sb.append("          <ogc:PropertyIsGreaterThanOrEqualTo>");
//    sb.append("            <ogc:PropertyName>modified</ogc:PropertyName>");
//    sb.append("            <ogc:Literal>2017-01-06T18:27:59.878Z</ogc:Literal>");
//    sb.append("          </ogc:PropertyIsGreaterThanOrEqualTo> ");
    
//    sb.append("          <ogc:PropertyIsLessThanOrEqualTo>");
//    sb.append("            <ogc:PropertyName>modified</ogc:PropertyName>");
//    sb.append("            <ogc:Literal>2017-01-06T18:27:59.878Z</ogc:Literal>");
//    sb.append("          </ogc:PropertyIsLessThanOrEqualTo> ");
    
//    sb.append("          <ogc:PropertyIsBetween>");
//    sb.append("            <ogc:PropertyName>modified</ogc:PropertyName>");
//    sb.append("            <ogc:LowerBoundary>2005-01-06T18:27:59.878Z</ogc:LowerBoundary>");
//    sb.append("            <ogc:UpperBoundary>2017-01-06T18:27:59.878Z</ogc:UpperBoundary>");
//    sb.append("          </ogc:PropertyIsBetween> ");
    
//    sb.append("          <ogc:PropertyIsEqualTo>");
//    sb.append("            <ogc:PropertyName>id</ogc:PropertyName>");
//    sb.append("            <ogc:Literal>c75e9d46ef41449690df9133f9eb418f</ogc:Literal>");
//    sb.append("          </ogc:PropertyIsEqualTo> ");
//    sb.append("          <ogc:PropertyIsEqualTo>");
//    sb.append("            <ogc:PropertyName>id</ogc:PropertyName>");
//    sb.append("            <ogc:Literal>9a38ef2afab14d8a8ef15c84acffec01</ogc:Literal>");
//    sb.append("          </ogc:PropertyIsEqualTo> ");
    
//    sb.append("          <ogc:PropertyIsEqualTo>");
//    sb.append("            <ogc:PropertyName>anytext</ogc:PropertyName>");
//    sb.append("            <ogc:Literal>data</ogc:Literal>");
//    sb.append("          </ogc:PropertyIsEqualTo> ");
    
//    sb.append("          <ogc:PropertyIsLike wildCard='*' escapeChar='\\' singleChar='?'>");
//    sb.append("            <ogc:PropertyName>title</ogc:PropertyName>");
//    sb.append("            <ogc:Literal>track</ogc:Literal>");
//    sb.append("          </ogc:PropertyIsLike> ");
    
//    sb.append("          <ogc:BBOX>");
//    sb.append("            <ogc:PropertyName>ows:BoundingBox</ogc:PropertyName>");
//    sb.append("            <gml:Envelope>");
//    sb.append("              <gml:lowerCorner>-180 -90</gml:lowerCorner>");
//    sb.append("              <gml:upperCorner>-100 90</gml:upperCorner>");
//    sb.append("            </gml:Envelope>");
//    sb.append("          </ogc:BBOX> ");
    
//    sb.append("          <ogc:BBOX>");
//    sb.append("            <ogc:PropertyName>Geometry</ogc:PropertyName>");
//    sb.append("            <gml:Box>");
//    sb.append("              <gml:coordinates>-180,-90,-100,90</gml:coordinates>");
//    sb.append("            </gml:Box>");
//    sb.append("          </ogc:BBOX> ");
    
//    sb.append("          <ogc:Intersects>");
//    sb.append("            <ogc:PropertyName>Geometry</ogc:PropertyName>");
//    sb.append("            <gml:Box>");
//    sb.append("              <gml:coordinates>-180,-90,-100,90</gml:coordinates>");
//    sb.append("            </gml:Box>");
//    sb.append("          </ogc:Intersects> ");
    
//    sb.append("          <ogc:Within>");
//    sb.append("            <ogc:PropertyName>Geometry</ogc:PropertyName>");
//    sb.append("            <gml:Box>");
//    sb.append("              <gml:coordinates>-180,-90,-100,90</gml:coordinates>");
//    sb.append("            </gml:Box>");
//    sb.append("          </ogc:Within> ");
    
    sb.append("        </ogc:And>");
    sb.append("      </ogc:Filter>");
    sb.append("    </csw:Constraint>");
    
//    sb.append("    <ogc:SortBy>");
//    sb.append("      <ogc:SortProperty>");
//    sb.append("        <ogc:PropertyName>title</ogc:PropertyName>");
//    sb.append("        <ogc:SortOrder>DESC</ogc:SortOrder>");
//    sb.append("      </ogc:SortProperty>");  
//    sb.append("      <ogc:SortProperty>");
//    sb.append("        <ogc:PropertyName>modified</ogc:PropertyName>");
//    sb.append("        <ogc:SortOrder>ASC</ogc:SortOrder>");
//    sb.append("      </ogc:SortProperty>"); 
//    sb.append("    </ogc:SortBy>");
 
    sb.append("  </csw:Query>");
    sb.append("</csw:GetRecords>");
    return sb.toString();
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
    
    String custom1 = baseUrl+"/opensearch?target=customElastic";
    
    // csw3 csw10 os3 os6 os18
    String requestUrl = custom1;
    
    String body = null;
    //body = makeGetRecordsXml();
    requestUrl = baseUrl+"/csw?service=CSW&request=GetRecords&xversion=2.0.2&target=gptdb1";
    //requestUrl = baseUrl+"/csw?service=CSW&request=GetCapabilities&target=arcgis";
    //requestUrl = baseUrl+"/csw?service=CSW&request=GetRecordById&target=gptdb1&id=zzz";
    //requestUrl = baseUrl+"/opensearch?target=gptdb1&f=csv&q=data";
    //requestUrl = baseUrl+"/opensearch?target=gptdb1&f=atom&qq=map&size=10&xpretty=true";
    //requestUrl = baseUrl+"/opensearch/description?f=eros";
    //requestUrl = baseUrl+"/opensearch?target=arcgis&f=atom&sortField=Date&type=Feature Service,Map Service";
    //requestUrl = baseUrl+"/opensearch?target=gptdb1&f=json&type=MapServer,WMS";
    //requestUrl = baseUrl+"/opensearch?target=gptdb1&f=eros&xtype=MapServer,WMS";
    //requestUrl = baseUrl+"/opensearch?target=gptdb1&f=atom&type=wms";
    //requestUrl = baseUrl+"/opensearch/description?target=arcgis&orgid=2ycVue24EK6qzjat";
    
    //requestUrl = baseUrl+"/opensearch?target=arcgis&id=a6f229e2f1474ba18ad1b6a6ce15d2d8,1e63a7a244b04f90993ab2474059f745";
    //requestUrl = baseUrl+"/opensearch?target=arcgis&id=a6f229e2f1474ba18ad1b6a6ce15d2d8&id=1e63a7a244b04f90993ab2474059f745";   
    //requestUrl = baseUrl+"/opensearch?target=arcgis&f=json&orgid=2ycVue24EK6qzjat";
    //requestUrl = baseUrl+"/opensearch?target=arcgis&f=json&orgid=RhGiohBHzSBKt1MS"; // sdi
    //requestUrl = baseUrl+"/opensearch?target=arcgis&f=json&orgid=2ycVue24EK6qzjat,RhGiohBHzSBKt1MS";
    
    //requestUrl = baseUrl+"/opensearch?target=arcgis&f=json&group=699267a815f34c3398fa9bb17a0264cd";
    //requestUrl = baseUrl+"/opensearch?target=arcgis&f=json&group=9edccfaf39dc49168584958541837fd6";
    //requestUrl = baseUrl+"/opensearch?target=arcgis&f=json&group=699267a815f34c3398fa9bb17a0264cd,9edccfaf39dc49168584958541837fd6";

    //requestUrl = baseUrl+"/opensearch";
    //requestUrl = baseUrl+"/opensearch?target=cswA";
    //requestUrl = baseUrl+"/opensearch?target=cswB";
    
    //requestUrl = baseUrl+"/opensearch?target=arcgis&bbox=-160,-70,-100,45";
    //requestUrl = baseUrl+"/opensearch?target=gptdb1&q=map";
    //requestUrl = baseUrl+"/opensearch?target=cswA&q=map&start=5&num=3&filter=data";
    //requestUrl = baseUrl+"/opensearch?target=cswA&q=map&start=5&num=3&bbox=-175.2,-50,22,13&spatialRel=intersects";
    //requestUrl = baseUrl+"/opensearch?target=cswB&sortField=title,modified&sortOrder=desc,asc";
    //requestUrl = baseUrl+"/opensearch?target=arcgis&q=map&sort=title&sort=modified:desc";
    //requestUrl = baseUrl+"/opensearch?target=arcgis&q=map&sort=title";
    //requestUrl = baseUrl+"/opensearch?target=cswB&sort=title:desc&sort=modified:asc";
    //requestUrl = baseUrl+"/opensearch?target=cswB&sort=title:desc,modified:asc";
    //requestUrl = baseUrl+"/opensearch?target=cswB&sortBy=title:D,modified:A";
    //requestUrl = baseUrl+"/opensearch?target=gptdb1&sortBy=title:desc,modified:asc";
    
    requestUrl = baseUrl+"/opensearch?target=cswB&id=7ef72eb338a941d6833d5a0f4eb2eb13&id=b9d00efb4fb34e0fb4dab622d1e860c1";
    requestUrl = baseUrl+"/opensearch?target=cswA&id={6BF4E410-6819-4B5C-9B77-8F083AC4CC15}&id={92C1A650-B17F-401F-81E2-76B85CDAC943}";
    
    requestUrl = baseUrl+"/opensearch?target=cswA&q=data&f=json&pretty=true&max=2";
    
    //requestUrl = baseUrl+"/csw?service=CSW&request=GetRecords&maxRecords=0&q=data&pretty=true";
    
    //requestUrl = baseUrl+"/csw?service=CSW&request=GetRecords&target=cswA&f=json&id={D228EA76-1454-4242-B926-39D55A6F37EB}";
    //requestUrl = baseUrl+"/csw?service=CSW&request=GetRecordById&target=cswA&f=kml&id={D228EA76-1454-4242-B926-39D55A6F37EB}";
    
    // TODO this fails
    //requestUrl = baseUrl+"/opensearch?target=cswC&time=2006-08-31T00:00:00.000Z/2017-12-31T23:59:59.999Z";
   
    
    HttpServletRequestFacade hsr = new HttpServletRequestFacade(requestUrl);
    SearchRequest sr = new SearchRequest();
    sr.execute(hsr,body);
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
