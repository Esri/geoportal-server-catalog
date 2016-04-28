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
package com.esri.geoportal.base.metadata;
import java.util.Map;

/**
 * A metadata type.
 */
public class MetadataType {

  /** Instance variables. */
  private String detailsXslt;
  private String evaluatorVersion;
  private String identifier;
  private String indexXslt;
  private String indexXsltVersion;
  private String interrogationExpression;
  private Map<String,String> interrogationNamespaces;
  private String key;
  private String schematronXslt;
  private String toKnownXslt;
  private String xsdLocation;

  /** Constructor. */
  public MetadataType() {}
  
  /** Constructor. */
  public MetadataType(String key, String identifier) {
    this.key = key;
    this.identifier = identifier;
  }
  
  /** The path to the xslt used for details (html). */
  public String getDetailsXslt() {
    return detailsXslt;
  }
  /** The path to the xslt used for details (html). */
  public void setDetailsXslt(String detailsXslt) {
    this.detailsXslt = detailsXslt;
  }
  
  /** The version of the evaluator used to index documents. */
  public String getEvaluatorVersion() {
    return evaluatorVersion;
  }
  /** The version of the evaluator used to index documents. */
  public void setEvaluatorVersion(String evaluatorVersion) {
    this.evaluatorVersion = evaluatorVersion;
  }

  /** The identifier. */
  public String getIdentifier() {
    return identifier;
  }
  /** The identifier. */
  public void setIdentifier(String identifier) {
    this.identifier = identifier;
  }

  /** The path to the xslt used to index documents. */
  public String getIndexXslt() {
    return indexXslt;
  }
  /** The path to the xslt used to index documents. */
  public void setIndexXslt(String indexXslt) {
    this.indexXslt = indexXslt;
  }
  
  /** The version of the xslt used to index documents. */
  public String getIndexXsltVersion() {
    return indexXsltVersion;
  }
  /** The version of the xslt used to index documents. */
  public void setIndexXsltVersion(String indexXsltVersion) {
    this.indexXsltVersion = indexXsltVersion;
  }

  /** The interrogation XPath expression, count(something). */
  public String getInterrogationExpression() {
    return interrogationExpression;
  }
  /** The interrogation XPath expression, count(something). */
  public void setInterrogationExpression(String interrogationExpression) {
    this.interrogationExpression = interrogationExpression;
  }

  /** The nameapaces used in the interrogation expression (key=prefix, uri=value). */
  public Map<String, String> getInterrogationNamespaces() {
    return interrogationNamespaces;
  }
  /** The nameapaces used in the interrogation expression (key=prefix, uri=value). */
  public void setInterrogationNamespaces(Map<String, String> interrogationNamespaces) {
    this.interrogationNamespaces = interrogationNamespaces;
  }

  /** The key. */
  public String getKey() {
    return this.key;
  }
  /** The key. */
  public void setKey(String key) {
    this.key = key;
  }

  /** The path to the xslt used perform Schematron validation (can be a comma delimited list). */
  public String getSchematronXslt() {
    return schematronXslt;
  }
  /** The path to the xslt used perform Schematron validation (can be a comma delimited list). */
  public void setSchematronXslt(String schematronXslt) {
    this.schematronXslt = schematronXslt;
  }
  
  /**
   * The path to the xslt for translating to a known schema.
   * <br>
   * Certain metadata types require immediate transformation to a known schema.
   */
  public String getToKnownXslt() {
    return toKnownXslt;
  }
  /**
   * The path to the xslt for translating to a known schema.
   * <br>
   * Certain metadata types require immediate transformation to a known schema.
   */
  public void setToKnownXslt(String toKnownXslt) {
    this.toKnownXslt = toKnownXslt;
  }

  /** The location of the XSD used to perform XML validation. */
  public String getXsdLocation() {
    return xsdLocation;
  }
  /** The location of the XSD used to perform XML validation. */
  public void setXsdLocation(String xsdLocation) {
    this.xsdLocation = xsdLocation;
  }
  
}
