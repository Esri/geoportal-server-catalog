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
package com.esri.geoportal.dcat;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Date;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * DCAT streaming service.
 */
@RestController
public class DcatStreamingService {
  private static final String EMPTY_DCAT_RESPONSE = "{\n" +
    "  \"conformsTo\": \"https://project-open-data.cio.gov/v1.1/schema\",\n" +
    "  \"@note\": \"DCAT file is not ready yet! Started process generating DCAT. Please, try again later.\",\n" +
    "  \"dataset\": [\n" +
    "  ]\n" +
    "}";
  
  @Autowired
  private DcatCache dcatCache;
  
  @Autowired
  private DcatController dcatController;
  
  @RequestMapping(path = "/dcat.json", produces = "application/json", method = RequestMethod.GET)
  public ResponseEntity<Void> dcat(HttpServletResponse response) {
    try (OutputStream outStream = response.getOutputStream()) {
      Date lastModified = dcatCache.getLastModified();
      if (lastModified!=null) {
        try (InputStream intput = dcatCache.createInputCacheStream()) {
          IOUtils.copy(intput, outStream);
        }
      } else {
        outStream.write(EMPTY_DCAT_RESPONSE.getBytes("UTF-8"));
        dcatController.generateDcat();
      }
      outStream.flush();
      return lastModified!=null? 
              ResponseEntity.ok().lastModified(lastModified.getTime()).build(): 
              ResponseEntity.ok().build();
    } catch (IOException ex) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}
