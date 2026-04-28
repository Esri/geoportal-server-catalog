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
import java.io.BufferedReader;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.Principal;
import java.util.Collection;
import java.util.Enumeration;
import java.util.Locale;
import java.util.Map;
import jakarta.servlet.AsyncContext;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletConnection;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpUpgradeHandler;
import jakarta.servlet.http.Part;

/**
 * Provides a basic implementation for an HttpServletRequest.
 */
@SuppressWarnings({"unchecked", "rawtypes"})
public class HttpServletRequestImpl implements HttpServletRequest {
  
  public Object             getAttribute(String arg0) {return null;}
  public Enumeration        getAttributeNames() {return null;}
  public String             getAuthType() {return null;}
  public String             getCharacterEncoding() {return null;}
  public int                getContentLength() {return 0;}
  public String             getContentType() {return null;}
  public String             getContextPath() {return null;}
  public Cookie[]           getCookies() {return null;}
  public long               getDateHeader(String arg0) {return 0;}
  public String             getHeader(String arg0) {return null;}
  public Enumeration        getHeaderNames() {return null;}
  public Enumeration        getHeaders(String arg0) {return null;}
  public ServletInputStream getInputStream() throws IOException {return null;}
  public int                getIntHeader(String arg0) {return 0;}
  public String             getLocalAddr() {return null;}
  public Locale             getLocale() {return null;}
  public Enumeration        getLocales() {return null;}
  public String             getLocalName() {return null;}
  public int                getLocalPort() {return 0;}
  public String             getMethod() {return null;}
  public String             getParameter(String arg0) {return null;}
  public Map                getParameterMap() {return null;}
  public Enumeration        getParameterNames() {return null;}
  public String[]           getParameterValues(String arg0) {return null;}
  public String             getPathInfo() {return null;}
  public String             getPathTranslated() {return null;}
  public String             getProtocol() {return null;}
  public String             getQueryString() {return null;}
  public BufferedReader     getReader() throws IOException {return null;}
  public String             getRealPath(String arg0) {return null;}
  public String             getRemoteAddr() {return null;}
  public String             getRemoteHost() {return null;}
  public int                getRemotePort() {return 0;}
  public String             getRemoteUser() {return null;}
  public RequestDispatcher  getRequestDispatcher(String arg0) {return null;}
  public String             getRequestedSessionId() {return null;}
  public String             getRequestURI() {return null;}
  public StringBuffer       getRequestURL() {return null;}
  public String             getScheme() {return null;}
  public String             getServerName() {return null;}
  public int                getServerPort() {return 0;}
  public String             getServletPath() {return null;}
  public HttpSession        getSession() {return null;}
  public HttpSession        getSession(boolean arg0) {return null;}
  public Principal          getUserPrincipal() {return null;}
  public boolean            isRequestedSessionIdFromCookie() {return false;}
  public boolean            isRequestedSessionIdFromUrl() {return false;}
  public boolean            isRequestedSessionIdFromURL() {return false;}
  public boolean            isRequestedSessionIdValid() {return false;}
  public boolean            isSecure() {return false;}
  public boolean            isUserInRole(String arg0) {return false;}
  public void               removeAttribute(String arg0) {    }
  public void               setAttribute(String arg0, Object arg1) {    }
  public void               setCharacterEncoding(String arg0) throws UnsupportedEncodingException {}
  public long               getContentLengthLong() {return 0;}
  public ServletContext     getServletContext() {return null;}
  public AsyncContext       startAsync() throws IllegalStateException {return null;}
  public AsyncContext       startAsync(ServletRequest servletRequest, ServletResponse servletResponse) throws IllegalStateException {return null;}
  public boolean            isAsyncStarted() {return false;}
  public boolean            isAsyncSupported() {return false;}
  public AsyncContext       getAsyncContext() {return null;}
  public DispatcherType     getDispatcherType() {return null;}
  public String             changeSessionId() {return null;}
  public boolean            authenticate(HttpServletResponse response) throws IOException, ServletException {return false;}
  public void               login(String username, String password) throws ServletException {}
  public void               logout() throws ServletException {}
  public Collection<Part>   getParts() throws IOException, ServletException {return null;}
  public Part               getPart(String name) throws IOException, ServletException { return null; }
  public <T extends HttpUpgradeHandler> T upgrade(Class<T> handlerClass) throws IOException, ServletException {return null;}
  @Override
  public String getRequestId() {
	// TODO Auto-generated method stub
	return null;
  }
  @Override
  public String getProtocolRequestId() {
	// TODO Auto-generated method stub
	return null;
  }
  @Override
  public ServletConnection getServletConnection() {
	// TODO Auto-generated method stub
	return null;
  }
  
}
