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
import com.esri.geoportal.base.util.ScriptEngines;

import java.io.IOException;
import java.net.URISyntaxException;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptException;

/** 
 * Interrogates and evaluates metadata.
 */
public class Evaluator {
  
  /** The script engines. */
  protected static ScriptEngines ENGINES = new ScriptEngines();

  /** Instance variables. */
  private String javascriptFile = "metadata/js/Evaluator.js";
  
  /** Instance variables. */
  private String javascriptFile2 = "metadata/js/JsonEvaluator.js";

  /** Constructor. */
  public Evaluator() {
    super();
  }
  
  /** Get a cached script engine. */
  protected ScriptEngine getCachedEngine() throws URISyntaxException, IOException, ScriptException {
    return ENGINES.getCachedEngine(javascriptFile);
  }
  
  /** Get a cached script engine. */
  protected ScriptEngine getCachedEngine2() throws URISyntaxException, IOException, ScriptException {
    return ENGINES.getCachedEngine(javascriptFile2);
  }

  /** The Javascript file name. */
  public String getJavascriptFile() {
    return javascriptFile;
  }
  /** The Javascript file name. */
  public void setJavascriptFile(String javascriptFile) {
    this.javascriptFile = javascriptFile;
  }
  
  /**
   * Evaluates a metadata document.
   * @param mdoc the document
   * @throws Exception if an exception occurs
   */
  public void evaluate(MetadataDocument mdoc) throws Exception {
    ScriptEngine engine = this.getCachedEngine();
    Invocable invocable = (Invocable)engine;
    invocable.invokeFunction("evaluate",mdoc);
  }
  
  /**
   * Evaluates a supplied JSON document.
   * @param mdoc the document
   * @throws Exception if an exception occurs
   */
  public void evaluateSuppliedJson(MetadataDocument mdoc) throws Exception {
    ScriptEngine engine = this.getCachedEngine2();
    Invocable invocable = (Invocable)engine;
    invocable.invokeFunction("evaluateSuppliedJson",mdoc);
  }
  
  /**
   * Gets the details XSLT assocuated with a metadata document.
   * @param key the metadata type key
   * @throws Exception if an exception occurs
   */
  public String getDetailsXslt(String key) throws Exception {
    ScriptEngine engine = this.getCachedEngine();
    Invocable invocable = (Invocable)engine;
    Object result = invocable.invokeFunction("getDetailsXslt",key);
    if (result != null && result instanceof String) {
      return (String)result;
    }
    return null;
  }
  
  /**
   * Interrogates a metadata document.
   * @param mdoc the document
   * @throws UnrecognizedTypeException if the type could not be determined
   * @throws Exception if an exception occurs
   */
  public void interrogate(MetadataDocument mdoc) throws UnrecognizedTypeException, Exception {
    ScriptEngine engine = this.getCachedEngine();
    Invocable invocable = (Invocable)engine;
    invocable.invokeFunction("interrogate",mdoc);
  }
  
}
