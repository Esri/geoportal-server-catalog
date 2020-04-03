# Dockerized ESRI Geoportal Catalog Server and Harvester 
This project bundles all prerequisites needed to run the geoportal server and a harvester are captured in this docker composition. The docker-compose.yml creates two containers, one running Tomcat with the [geoportal-server-catalog](https://github.com/Esri/geoportal-server-catalog) and the [geoportal-harvester](https://github.com/Esri/geoportal-harvester). The second container provides the Elasticsearch server for storing and indexing the data stored in the catalog server.
This was inspried by the docker at: https://github.com/ma-ku/docker-geoportal
It has been enchanced by 
  * creating the webapplications/war files in a maven container,
  * copying the resulting artifacts into the tomcat comtainer
  * copying of cofig files into builds
  * use of environment variables to configure GPT 

## Releases and Downloads
- Version 2.6.0 of geoportal-server-catalog and geoportal-harvester.

## Installation
 
Clone the repository to your local drive. In order to build the containers and run them, use the following commands:
```bash
$ git clone https://github.com/cinergi/geoportal-server-catalog-docker.git
$ cd geoportal-server-catalog-docker/gpt_stack
$ docker network create datastudio
$ docker-compose build
$ docker-compose up
```
If you have an issue with it not building, but it builds on your dev machine
```bash
$ docker-compose build --no-cache
$ docker-compose up
```

## Run the applications

* Connect to http://localhost:8082/harvester to see the harvester in action.
  * create and run a task to load records.
  * http://localhost:8080/geoportal
    * NOTE: 8080. that is the internal port used inside the docker. 
    Use localhost:8080 for development. 
    You can also you development machine name, aka http:{workstaion name or ip address}:8082/geoportal
  * examples files in a WAF at: http://hydro10.sdsc.edu/metadata/example/ there will be some failures.
* Connect to http://localhost:8082/geoportal to see the geoportal in action. 
   * NOTE: If no files have been added, At first run, you will see under results:An error occurred.

## Requirements

* Docker

# Use customized version of GPT:
This can be done by building the docker with different repositories where 
the code is pulled from. Or added args to the docker compose file.

```
ARG GPTGITURL=https://github.com/esri/geoportal-server-catalog.git
ARG HRVGITURL=https://github.com/esri/geoportal-server-harvester.git
```

# Configuration
configurations are in config.
 I cant see my changes:
 * rebuild just the geoportal:
  this keeps images up until they are replaced:
 ```docker-compose up -d --force-recreate --no-deps --build geoportal```
 
 config not working
 in separate window, look at the files.
 ```docker ps
 docker exec src_geoportal_1 ls /usr/local/tomcat/webapps/harvester/WEB-INF/classes/config

  docker exec src_geoportal_1 cat /usr/local/tomcat/webapps/harvester/WEB-INF/classes/config/app-security.xml
  docker exec src_geoportal_1 cat /usr/local/tomcat/webapps/harvester/WEB-INF/classes/config/authentication-simple.xml
 ```
 
## updating a config without a rebuild
Get the container_ID for gpt_stack_geoportal 
```docker container ls```
```
CONTAINER ID        IMAGE                                                 COMMAND                  CREATED             STATUS              PORTS                    NAMES
7e5b739a0f21        5a17f0be06fe                                          "/bin/sh -c 'mvn -P$…"   2 minutes ago       Up 2 minutes                                 quirky_franklin
0ba1607c392c        gpt_stack_geoportal                                   "catalina.sh run"        2 days ago          Up 2 minutes        0.0.0.0:8082->8080/tcp   gpt_stack_geoportal_1
4ed08c65d851        docker.elastic.co/elasticsearch/elasticsearch:6.6.1   "/usr/local/bin/dock…"   2 days ago          Up 2 minutes        9200/tcp, 9300/tcp       elasticsearch1
```
use container id (0ba1607c392c) in docker cp 
```
docker cp ./geoportal/config/geoportal/authentication-simple.xml 0ba1607c392c:/usr/local/tomcat/webapps/geoportal/WEB-INF/classes/config/
```
Touch the web.xml to trigger a reload
```
docker-compose exec geoportal touch /usr/local/tomcat/webapps/geoportal/WEB-INF/classes/config/
```

## Kubernetes 
for production:
https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html
$ grep vm.max_map_count /etc/sysctl.conf
vm.max_map_count=262144
