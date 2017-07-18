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
package com.esri.geoportal.lib.elastic.response;
import java.util.ArrayList;
import java.util.List;

/**
 * Field collection (for queryables, returnables, sortables).
 */
public class QFields {

  /** The list. */
  private List<QField> list = new ArrayList<QField>();

  /** Default constructor. */
  public QFields() {}

  /**
   * Makes the collection of core fields.
   * @return the fields
   */
  public static QFields makeAll() {
    QFields fields = new QFields();
    fields.add(new QField("dc:identifier",ResponseUtil.URI_DC));                    // brief
    fields.add(new QField("dc:title",ResponseUtil.URI_DC)).sortable = true;         // brief
    fields.add(new QField("dc:type",ResponseUtil.URI_DC)).sortable = true;          // brief
    fields.add(new QField("ows:BoundingBox",ResponseUtil.URI_OWS));                 // brief
    fields.add(new QField("dc:subject",ResponseUtil.URI_DC));                       // summary
    //fields.add(new QField("dc:format",Util.URI_DC));                        // summary
    //fields.add(new QField("dc:relation",Util.URI_DC));                      // summary
    fields.add(new QField("dct:modified",ResponseUtil.URI_DCT)).sortable = true;    // summary
    fields.add(new QField("dct:abstract",ResponseUtil.URI_DCT));                    // summary
    //fields.add(new QField("dct:spatial",Util.URI_DCT));                     // summary
    //fields.add(new QField("csw:TemporalExtent",Util.URI_CSW));              // summary
    //fields.add(new QField("csw:AnyText",Util.URI_CSW));                     // full
    fields.add(new QField("dct:alternative",ResponseUtil.URI_DCT));                 // full - Snippet
    fields.add(new QField("dc:creator",ResponseUtil.URI_DC));                       // full
    fields.add(new QField("dct:created",ResponseUtil.URI_DCT));                     // full
    fields.add(new QField("dc:contributor",ResponseUtil.URI_DC));                   // full - Credits
    fields.add(new QField("dc:rights",ResponseUtil.URI_DC));                        // full - Access and Use Constraints
    fields.add(new QField("dct:references",ResponseUtil.URI_DCT));                  // summary? should this be full? - Links
    return fields;
  }

  /**
   * Add a field.
   * @param field the field
   * @return the field
   */
  public QField add(QField field) {
    list.add(field);
    return field;
  }

  /**
   * Returns the list of fields.
   * @return the list
   */
  public List<QField> getList() {
    return list;
  }

  /**
   * Determines if a field has a match.
   * @param field the field to match
   * @return true if the field has a match
   */
  public boolean has(QField field) {
    return (match(field) != null);
  }

  /**
   * Finds a matching field.
   * @param field the field to match
   * @return the matched field (null if no match)
   */
  public QField match(QField field) {
    for (QField f: list) {
      if (field.namespaceUri == null) {
        if (field.name.equalsIgnoreCase(f.name)) {
          return f;
        }
      } else {
        if (field.namespaceUri.equals(f.namespaceUri) && field.name.equalsIgnoreCase(f.name)) {
          return f;
        }
      }
    }
    return null;
  }

  /**
   * Returns the collection size.
   * @return the size
   */
  public int size() {
    return list.size();
  }

}
