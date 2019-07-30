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
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;

import java.util.function.Consumer;

import org.elasticsearch.action.ActionListener;
import org.elasticsearch.action.get.GetRequestBuilder;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.index.get.GetField;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;

/**
 * A simple promise example.
 */
class SimplePromiseExample {
  
  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(SimplePromiseExample.class);
  
  /** Instance variables . */
  private String accessDeniedMessage = "Access denied.";
  private String notOwnerMessage = "Access denied - not owner.";
  
  private boolean checkOwner(AppUser user, String ownerField, GetResponse response) {
    boolean ok = true;
    if (response.isExists()) {
      ok = false;
      GetField field = response.getField(ownerField);
      if (field != null) {
        String owner = (String)field.getValue();
        LOGGER.info("sys_owner="+owner);
        ok = (owner != null) && (owner.equalsIgnoreCase(user.getUsername()));
      } 
    }
    return ok;
  }
  
  private void checkOwner(AppUser user, String ownerField, GetResponse response, SimplePromise<Void> promise) {
    boolean ok = checkOwner(user,ownerField,response);
    if (ok) {
      promise.resolve(null);
    } else {
      promise.reject(new AccessDeniedException(notOwnerMessage));
    }
  }
 
  private SimplePromise<Void> ensureWritable(AppUser user, String id, boolean async) {
    SimplePromise<Void> promise = new SimplePromise<Void>();
    if (user == null || user.getUsername() == null || user.getUsername().length() == 0) {
      promise.reject(new AccessDeniedException(accessDeniedMessage));
    } else {
      if (user.isAdmin()) {
        promise.resolve(null);
      } else if (!user.isPublisher()) {
        promise.reject(new AccessDeniedException(accessDeniedMessage)); 
      } else {
        ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
        String ownerField = FieldNames.FIELD_SYS_OWNER;
        
        GetRequestBuilder getItem = ec.getTransportClient().prepareGet(
            ec.getItemIndexName(),ec.getActualItemIndexType(),id);
        getItem.setFetchSource(false);
        /* ES 2to5 */
        //getItem.setFields(ownerField);
        getItem.setStoredFields(ownerField);
        if (!async) {
          GetResponse response = getItem.get();
          checkOwner(user,ownerField,response,promise);
        } else {
          getItem.execute(new ActionListener<GetResponse>() {
            @Override
            public void onResponse(final GetResponse response) {
              checkOwner(user,ownerField,response,promise);
            }
            /* ES 2to5 */
            /*
            @Override
            public void onFailure(final Throwable t) {
              // TODO log this??
              promise.reject(t);
            }
            */
            @Override
            public void onFailure(Exception e) {
              // TODO log this??
              promise.reject(e);
            }
          });
        }
      }
    }    
    return promise;
  }

  @SuppressWarnings("unused")
  private void test() {
    AppUser user = new AppUser("admin",true,true);
    user = new AppUser("publisher",false,true);
    boolean async = true;
    String id = "88884444";
    SimplePromise<Void> promise = ensureWritable(user,id,async);
    LOGGER.info("-------------------------------------");
    promise.then(
      new Consumer<Void>(){
        @Override
        public void accept(Void t) {
          LOGGER.info("ok");
        }
      }
    ).katch(
      new Consumer<Throwable>(){
        @Override
        public void accept(Throwable t) {
          LOGGER.error("Error",t);
        }
      }
    );
    LOGGER.info("=====================================");
  }
  
}
