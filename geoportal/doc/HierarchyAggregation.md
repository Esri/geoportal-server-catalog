# Creating a Hierarchy Search Panel

Terminology is often in a hierarchy, but this is not expressed by a simple keyword list.
Sometimes metadata creators may express such paths in their keywords, eg
   `Science Domain > Earth Sciences > Geology`
The HierarchyAggregation allows for the generation of tree widgets in the search panel to allow 
for searching of of such hierarchies.
ISO metadata evaluator has been modified to add a term to ```keywords_hier``` when keyword contains '>'

HierarchyAggregation the use of fields that have been indexed by the path_hierarchy analyzer.
In order for the filter to display there must be one top level term defined by rootPath.

* If the field is populated with uncontrolled set keywords, there may be mutiple
 top level terms. In order to handle this, there are two options
  * if rootPath is '', then  all terms will be given a path (in the interface, not in the index)
  * set rootPath to a top top level term, and only that branch will be shown.
* Use multiple HierarchyAggregation to display terms from different top level terms. 

# Preparing for Use 
In order to use HierarchyAggregation, you will probably need to reindex, or reharvest records.

http://{{host}}:{{port}}/geoportal/rest/metadata/reindex?fromIndexName=metadata&toIndexName=metadata_v2

For large collections, is suggested that you log into the terminal and use a command line call to ensure that 
all records are index.

Here are the steps to use screen and curl. Screen allows you to log out. You could use & to shift it to the background.

```
# create screen
screen -S reindex
curl -u username:password http://host:8080/geoportal_reindex/rest/metadata/reindex?fromIndexName=metadata_v5&toIndexName=metadata_v1
# detach
ctrl-a ctrl-d  
# jobs
screen -ls
# attach
screen -R somenumber.reindex
# when done
exit
```
then relias
http://{{host}}:{{port}}/geoportal/rest/metadata/realias?IndexName=metadata_v2

Note in {tomcat}/logs/geoportal.log, there may be Reindex issues:

```2019-02-15 00:02:01,197 ERROR [com.esri.geoportal.lib.elastic.http.request.ReindexRequest] - Reindex issue: metadata_v5->metadata_v1 id=42c8a4c212fb46e885d5bde421e0d22b```


```grep 'Reindex issue' /opt/tomcat/logs/geoportal.log```
