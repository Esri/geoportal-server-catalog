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
package com.esri.geoportal.dcat3.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DCAT-US 3.0 contact point (<code>vcard:Contact</code>).
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class Dcat3ContactPoint {

  /** JSON-LD node identifier. */
  @JsonProperty("@id")
  public String atId;

  /** JSON-LD node type. */
  @JsonProperty("@type")
  public String atType = Dcat3Constants.TYPE_CONTACT;

  /** vcard:fn - the formatted name. */
  public String fn;

  /** vcard:hasEmail - must be prefixed with <code>mailto:</code>. */
  public String hasEmail;

  /** vcard:address. */
  public String address;

  /** vcard:family-name. */
  @JsonProperty("family-name")
  public String familyName;

  /** vcard:given-name. */
  @JsonProperty("given-name")
  public String givenName;

  /** vcard:organization-name. */
  @JsonProperty("organization-name")
  public String organizationName;

  /** vcard:tel - must be prefixed with <code>tel:</code>. */
  public String tel;

  /** vcard:title. */
  public String title;

  public Dcat3ContactPoint() {
  }

  /**
   * Creates a contact point.
   * @param fn formatted name
   * @param hasEmail email (a <code>mailto:</code> prefix is added when missing)
   */
  public Dcat3ContactPoint(String fn, String hasEmail) {
    this.fn = fn;
    setEmail(hasEmail);
  }

  /**
   * Sets the email, adding the <code>mailto:</code> prefix when missing.
   * @param email email address or mailto URI
   */
  public final void setEmail(String email) {
    if (email == null || email.trim().isEmpty()) {
      this.hasEmail = null;
    } else {
      String v = email.trim();
      this.hasEmail = v.toLowerCase().startsWith("mailto:") ? v : "mailto:" + v;
    }
  }

  /**
   * Creates a shallow copy.
   * @return copy of this contact point
   */
  public Dcat3ContactPoint copy() {
    Dcat3ContactPoint copy = new Dcat3ContactPoint();
    copy.atId = atId;
    copy.atType = atType;
    copy.fn = fn;
    copy.hasEmail = hasEmail;
    copy.address = address;
    copy.familyName = familyName;
    copy.givenName = givenName;
    copy.organizationName = organizationName;
    copy.tel = tel;
    copy.title = title;
    return copy;
  }
}
