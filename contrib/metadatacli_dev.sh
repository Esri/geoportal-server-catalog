#!/bin/bash
# pass path to file
# -md /data/metadata/hydro10.sdsc.edu/metadata/c4p/c4p_0.xml
cd ../geoportal/
mvn  -f pom.xml exec:java -Dexec.mainClass="com.esri.geoportal.base.metadata.MetadataCLI" -Dexec.args="%classpath" -Dlog4j.configuration=simplelogger.properties -Dexec.args="$*"

#java -cp ../geoportal/target/geoportal.jar com.esri.geoportal.base.metadata.MetadataCLI $*