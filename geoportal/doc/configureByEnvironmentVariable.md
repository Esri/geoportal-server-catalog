
The ability to change configuration by using a set of environment variable 
is suggested. 


It was developed for configuring Geoportal in a container environment,
but is also useful for other deployment workflows. 
For instance, developer can test code with a configuration, disconnected
from authentication, and with a local elasticsearch. Before sending
to staging, he can test the staging configuration, then deploy to staging
Staging has a set of environment variable set, so there is no need
to change any configuration before deploying the war file.

Environment variables:


| name  | default  | file   | common/rare | description |
|---|---|--------|-------------|----|
|  es_node | localhost  |  app_context.xml | common |            |
|es_cluster| elasticsearch  |  app_context.xml | common |           |
| gpt_indexName | metadata | app_context.xml | rare |  |
| gpt_mappingsFile |config/elastic-mappings.json |  app_context.xml   |   rare |           |
| harvester_node |   |  app_context.xml  |  common |             |
| gpt_authentication  | authentication-simple.xml  |  app-security.xml  | common |  Which authentication to use   |
| arcgis_appid | 6iJ2pLIj9UwcSdfA | authentication-arcgis.xml  |  common   |              | |
| arcgis_authorizeUrl | https://www.arcgis.com/sharing/rest/oauth2/authorize |  authentication-arcgis.xml  |     rare         |
| arcgis_createAccountUrl |  https://www.arcgis.com/home/createaccount.html | authentication-arcgis.xml    |    rare          | |
| arcgis_showMyProfileLink | true   | authentication-arcgis.xml  |     common  | |
| ldap_url | ldap://gptsrv12r2:10389   | authentication-ldap.xml  |     common-ldap  | |
| ldap_manager_dn | uid=admin, ou=system   | authentication-ldap.xml  |     common-ldap  | |
| ldap_manager_password | secret   | authentication-ldap.xml  |     common-ldap  | |


Notes:
LDAP envirnment variables made blindly. If the don't work. Create a changeset to make them work.

In docker, the cluster name is docker_cluster. This can be changed in the docker-compose file, or other orchestration methods

