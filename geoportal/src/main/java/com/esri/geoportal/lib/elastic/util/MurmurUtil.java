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
package com.esri.geoportal.lib.elastic.util;
import java.io.UnsupportedEncodingException;
import org.elasticsearch.common.hash.MurmurHash3;

/**
 * Murmur utilities.
 */
public class MurmurUtil {

  /**
   * Make a hash (MurmurHash3.hash128).
   * @param bytes the bytes
   * @return the hash
   */
  public static String makeHash(byte[] bytes) {
    String hash = null;
    if (bytes != null && bytes.length > 0) {
      MurmurHash3.Hash128 mh = MurmurHash3.hash128(bytes,0,bytes.length,0,new MurmurHash3.Hash128());
      hash = mh.h1+":"+mh.h2+":"+bytes.length;
    }
    return hash;
  }
  
  /**
   * Make a hash (MurmurHash3.hash128).
   * @param value the value
   * @return the hash
   */
  public static String makeHash(String value) {
    String hash = null;
    if (value != null && value.length() > 0) {
      try {
        byte[] bytes = value.getBytes("UTF-8");
        return MurmurUtil.makeHash(bytes);
      } catch (UnsupportedEncodingException e) {}
    }
    return hash;
  }

}
