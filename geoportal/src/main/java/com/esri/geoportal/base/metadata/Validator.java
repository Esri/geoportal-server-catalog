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
import com.esri.geoportal.base.metadata.validation.SchematronValidator;
import com.esri.geoportal.base.metadata.validation.ValidationError;
import com.esri.geoportal.base.metadata.validation.ValidationErrors;
import com.esri.geoportal.base.metadata.validation.ValidationException;
import com.esri.geoportal.base.metadata.validation.XsdValidator;
import com.esri.geoportal.base.util.Val;

/** Validates a metadata document. */
public class Validator {
  
  /** Constructor */
  public Validator() {}
  
  /**
   * Validate a document.
   * @param mdoc the document
   * @throws ValidationException if invalid
   */
  public void validate(MetadataDocument mdoc) throws ValidationException {
    validateTitle(mdoc);
    MetadataType type = mdoc.getMetadataType();
    if (type != null && !mdoc.getIsDraft()) {
      String xsdLocation = Val.trim(type.getXsdLocation());
      String schematronXslt = Val.trim(type.getSchematronXslt());
      if (xsdLocation != null && xsdLocation.length() > 0) {
        XsdValidator xsdv = new XsdValidator();
        xsdv.validate(type,mdoc.getXml());
      } 
      if (schematronXslt != null && schematronXslt.length() > 0) {
        SchematronValidator schv = new SchematronValidator();
        schv.validate(type,mdoc.getXml());
      }
    } 
  }
  
  /**
   * Ensure that the document has a title.
   * @param mdoc the document
   * @throws ValidationException if invalid
   */
  public void validateTitle(MetadataDocument mdoc) throws ValidationException {
    ValidationErrors errors = new ValidationErrors();
    if (mdoc.getTitle() == null || mdoc.getTitle().trim().length() == 0) {
      ValidationError error = new ValidationError();
      error.setMessage("A document title is required.");
      error.setReasonCode(ValidationError.REASONCODE_TITLE_ISREQUIRED);
      errors.add(error);
    }
    if (errors.size() > 0) {
      String msg = "Validation exception.";
      String key = "json";
      MetadataType type = mdoc.getMetadataType();
      if (type != null) key = type.getKey();
      throw new ValidationException(key,msg,errors);
    }
  }
  
}
