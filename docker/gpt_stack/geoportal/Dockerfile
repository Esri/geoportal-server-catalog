FROM maven:3-jdk-8 AS gptbuild

MAINTAINER David Valentine dwvalentine@usdc.edu


# Install wget and install/updates certificates
# not going to use this in production, so don't do it.
#RUN apt-get update \
# && apt-get install -y -q --no-install-recommends \
#    ca-certificates \
#    git \
#    maven \
#    ca-certificates-java="$CA_CERTIFICATES_JAVA_VERSION" \
# && apt-get clean \
# && rm -r /var/lib/apt/lists/*

# Install geoportal web application
ARG GPTGITURL=https://github.com/esri/geoportal-server-catalog.git
# Install harvester application
ARG HRVGITURL=https://github.com/esri/geoportal-server-harvester.git

WORKDIR /tmp
RUN git clone ${GPTGITURL} geoportal-server-catalog
WORKDIR /tmp/geoportal-server-catalog/geoportal/src/main/resources/config
#ENV HARVESTER_CONFIG_DIR=/tmp/harvester/geoportal-application/geoportal-harvester-war/src/main/resources/config/
COPY config/geoportal/ .
#COPY config/harvester/app-security_harvester.xml app-security.xml
#RUN ls -al /tmp/geoportal-server-catalog/geoportal/src/main/resources/config/
WORKDIR /tmp/geoportal-server-catalog/geoportal
RUN mvn package -DskipTests

WORKDIR /tmp
RUN git clone ${HRVGITURL} harvester
WORKDIR /tmp/harvester/geoportal-application/geoportal-harvester-war/src/main/resources/config
#ENV HARVESTER_CONFIG_DIR=/tmp/harvester/geoportal-application/geoportal-harvester-war/src/main/resources/config/
COPY config/harvester/ .
#COPY config/harvester/app-security_harvester.xml app-security.xml
#RUN ls -al /tmp/harvester/geoportal-application/geoportal-harvester-war/src/main/resources/config/
WORKDIR /tmp/harvester/
RUN mvn package -DskipTests

WORKDIR $CATALINA_HOME/webapps/

#######################
# just tomcat
#######################
FROM tomcat:9-jre8

RUN apt-get update \
 && apt-get install -y -q --no-install-recommends \
    ca-certificates \
#   git \
#   maven \
#    ca-certificates-java="$CA_CERTIFICATES_JAVA_VERSION" \
 && apt-get clean \
 && rm -r /var/lib/apt/lists/*
# do this with a secret
COPY config/tomcat-users.xml $CATALINA_HOME/conf

WORKDIR $CATALINA_HOME/webapps/

COPY --from=gptbuild /tmp/geoportal-server-catalog/geoportal/target/*.war $CATALINA_HOME/webapps/geoportal.war
COPY --from=gptbuild /tmp/harvester/geoportal-application/geoportal-harvester-war/target/*.war $CATALINA_HOME/webapps/harvester.war

WORKDIR $CATALINA_HOME/webapps/

