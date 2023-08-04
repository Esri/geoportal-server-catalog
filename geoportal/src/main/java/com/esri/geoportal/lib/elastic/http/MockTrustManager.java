package com.esri.geoportal.lib.elastic.http;

import java.security.cert.X509Certificate;

import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

public class MockTrustManager {
	
	public TrustManager[] getTrustManager()
	{
		 TrustManager[ ] trust_mgr = new TrustManager[ ] {
				    (TrustManager) new X509TrustManager() {
				       public X509Certificate[ ] getAcceptedIssuers() { return null; }
				       public void checkClientTrusted(X509Certificate[ ] certs, String t) { }
				       public void checkServerTrusted(X509Certificate[ ] certs, String t) { }
				     }
				  };
			  
		return trust_mgr;
	}
	
		
	
	
}
