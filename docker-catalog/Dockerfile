ARG ver=v2.6.4

FROM adoptopenjdk:11-jdk-hotspot AS build

RUN apt-get update
RUN apt-get install -y -q git maven

WORKDIR /build
RUN git clone https://github.com/Esri/geoportal-server-catalog.git geoportal-server-catalog

WORKDIR /build/geoportal-server-catalog
RUN git checkout $ver

WORKDIR /build/geoportal-server-catalog/geoportal
RUN mvn package -DskipTests



FROM tomcat:9.0.43-jdk11-adoptopenjdk-hotspot

WORKDIR $CATALINA_HOME/webapps

COPY --from=build /build/geoportal-server-catalog/geoportal/target/*.war .