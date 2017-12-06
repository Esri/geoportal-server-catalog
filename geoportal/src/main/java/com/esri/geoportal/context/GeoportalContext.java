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
package com.esri.geoportal.context;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.harvester.HarvesterContext;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Configuration;
import javax.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The Geoportal application context.
 */
@Configuration
public class GeoportalContext implements ApplicationContextAware {
  
  /** Logger. */
  public static final Logger LOGGER = LoggerFactory.getLogger(GeoportalContext.class);
  
  /** Singleton instance. */
  private static GeoportalContext SINGLETON = null;
  
  /**
   * Get the single instance.
   * @return the instance
   */
  public static GeoportalContext getInstance() {
    return SINGLETON;
  }
  
  /** Instance variables. */
  private ApplicationContext applicationContext;
  private ElasticContext elasticContext;
  private HarvesterContext harvesterContext;
  private String version = "2.5.2";
  
  /** Constructor */
  public GeoportalContext() {}
  
  /** The Spring application context. */
  public ApplicationContext getApplicationContext() {
    return applicationContext;
  }
  /**
   * Set the Spring application context.
   * @param springApplicationContext the Spring context
   * @throws BeansException if an exception occurs
   */
  @Override
  public void setApplicationContext(ApplicationContext springApplicationContext) throws BeansException {
    LOGGER.info("Starting up GeoportalContext...");
    String msg = "The GeoportalContext instance has already been started.";
    if (SINGLETON != null) {
      throw new RuntimeException(msg);
    } else {
      synchronized (GeoportalContext.class) {
        if (SINGLETON == null) {
          this.applicationContext = springApplicationContext;
          SINGLETON = this;
        } else {
          throw new RuntimeException(msg);
        }
      }
    }
  }
 
  /** The Elasticsearch context. */
  public ElasticContext getElasticContext() {
    return elasticContext;
  }
  /** The Elasticsearch context. */
  public void setElasticContext(ElasticContext elasticContext) {
    this.elasticContext = elasticContext;
  }

  /**
   * Gets harvester context.
   * @return harvester context
   */
  public HarvesterContext getHarvesterContext() {
    return harvesterContext;
  }

  /**
   * Sets harvester context.
   * @param harvesterContext harvester context 
   */
  public void setHarvesterContext(HarvesterContext harvesterContext) {
    this.harvesterContext = harvesterContext;
  }
  
  /** The version. */
  public String getVersion() {
    return version;
  }
  public void setVersion(String version) {
    this.version = version;
  }
  
  /** Methods =============================================================== */

  /**
   * Get a bean from the Spring application context. 
   * @param springId the bean id
   * @param requiredType the class
   * @return the bean
   */
  public <T> T getBean(String springId, Class<T> requiredType) {
    return applicationContext.getBean(springId,requiredType);
  }
  
  /**
   * Get a bean from the Spring application context.
   * @param springId the bean id
   * @return the bean
   */
  public Object getBeanIfDeclared(String springId) {
    if (applicationContext.containsBean(springId)) {
      return applicationContext.getBean(springId);
    } 
    return null;
  }
  
  /**
   * Get a bean from the Spring application context. 
   * @param springId the bean id
   * @param requiredType the class
   * @param defaultInstance the default
   * @return the bean
   */
  public <T> T getBeanIfDeclared(String springId, Class<T> requiredType, T defaultInstance) {
    if (springId != null && applicationContext.containsBean(springId)) {
      return applicationContext.getBean(springId,requiredType);
    } else {
      return defaultInstance;
    }
  }

  /** Shutdown. */
  @PreDestroy
  public void shutdown() throws Exception {
    LOGGER.info("Shutting down GeoportalContext...");
  }

}
