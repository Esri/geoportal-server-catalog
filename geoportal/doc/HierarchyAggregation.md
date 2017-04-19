# Creating a Hierarchy Search Panel

Terminology is often in a heirarchy, but this is not expressed by a simple keyword list.
Sometimes metadata creators may express such paths in their keywords, eg
   `Science Domain > Earth Sciences > Geology`
The HierachyAggregation allows for the generation of tree widgets in the search panel to allow 
for searching of of such hierarchies.

This allows for the use of fields that have been indexed by the path_hierarchy analyzer

* paths: Science Domain > Earth Sciences > Geology
* multiple root paths can be displayed seperately

Requires modification/creation of an enchancer, and adding to the user interface.

---

## Steps

1. Update Index
1. Create New Evaluator
1. Add to UI

----
Note this assumes that terms are separated by ">"
------

## Update Index

* stop index
* add new dynamic field
* start index

### stop index
POST `http://localhost:9200/metadata_v1/_close`

### add new dynamic field
PUT `http://localhost:9200/metadata_v1/_settings`

```javascript
 { "analysis": {
      
      "tokenizer": {
        "category_tokenizer": {
          "type": "path_hierarchy",
          "delimiter": ">",
          "reverse": false
        }
      }
      }
      }
```
PUT `http://localhost:9200/metadata_v1/_settings`
```javascript
{ "analysis": {
      "analyzer": {
        
        "category": {
          "tokenizer": "category_tokenizer",
          "filter": ["lowercase"]
        }
      }
      }
      }
```

PUT `http://localhost:9200/metadata_v1/_mapping/item`
```javascript
{  
  
         "dynamic_templates": [
          {
            "_hier": {
              "match_mapping_type": "string",
              "match": "*_hier",
              "mapping": {
                "type": "keyword",
                 "analyzer": "category",
              "search_analyzer": "keyword"
              }
            }
          }
          ]

}
```  

### Start index
POST http://localhost:9200/metadata_v1/_open

### Check 
GET http://localhost:9200/metadata_v1/_settings

Should look something like:
 ```javascript     {
                     "metadata_v1": {
                       "settings": {
                         "index": {
                           "creation_date": "1470335880456",
                           "analysis": {
                             "filter": {
                               "english_stemmer": {
                                 "name": "english",
                                 "type": "stemmer"
                               }
                             },
                             "analyzer": {
                               "category": {
                                 "filter": [
                                   "lowercase"
                                 ],
                                 "tokenizer": "category_tokenizer"
                               },
                               "case_insensitive_sort": {
                                 "filter": [
                                   "lowercase"
                                 ],
                                 "tokenizer": "keyword"
                               },
                               "default": {
                                 "filter": [
                                   "standard",
                                   "lowercase",
                                   "english_stemmer"
                                 ],
                                 "tokenizer": "standard"
                               }
                             },
                             "tokenizer": {
                               "category_tokenizer": {
                                 "reverse": "false",
                                 "type": "path_hierarchy",
                                 "delimiter": ">"
                               }
                             }
                           },
```
      
----
## Evaluator

You need to create a field with a name ending in _hier, eg category_hier
    
   You then need to add code to the evaluator to create that feild
   
If you know that the thesaurus with a name has a hierarchy, say HIERARCY, then you can use a property like:
`G.evalProps(task,item,root,"category_hier","//gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'HIERARCHY')]/../../../../gmd:keyword" );`

If you wnat to assume that some terms are tagged with a hierarchy, but you don't know:
`G.evalProps(task,item,root,"category_hier","//gmd:MD_TopicCategoryCode[contains(.,'>')] | //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gco:CharacterString[contains(.,'>')] | //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gmx:Anchor[contains(.,'>')]");`


Reload/Reindex?

--- 
## Search User Interface


----
## Advanced:
add a function:
   
   1) if keyword node ia an anchor, and citation title contains > then treat is as a hierachy
     `//gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'>')]
     //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'C')]/../../../../gmd:keyword
     //| //gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gmx:Anchor`
     md_keywords: `//gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'C')]/../../../..`
   2) if the title of a keyword has viaf put in oranization
   

``` 
 G.evaluators.cinergi = {
 
   version: "iso.v1",
 
   evaluate: function(task) {
     this.evalBase(task);
     this.evalService(task);
     this.evalSpatial(task);
     this.evalTemporal(task);
     this.evalInspire(task);
     this.evalOther(task);
     this.evalCinergi(task);
   },


evalCinergi: function(task) {
    var item = task.item, root = task.root;


    G.forEachNode(task,root,"//gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString[contains(.,'>')]/../../../../gmd:keyword",function(node){
      var cat = G.getString(task,node,"../gmd:thesaurusName/gmd:CI_Citation/gmd:title/gco:CharacterString") + '>';
      var name = G.getString(task,node,"gmd:keyword/gmx:Anchor");
      cat.concat( name );
      G.writeMultiProp(task.item,"categories_cat",cat);

    });  },
```

===
"Fielddata is disabled on text fields by default. Set fielddata=true on [categories_cat] in order to load fielddata in memory by uninverting the inverted index. Note that this can however use significant memory."

PUT http://132.249.238.169:9200/metadata_v1/_mappings/item/
  {      "properties": {

          "categories_cat": {
            "type": "text",
            "fielddata":"true",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          }
}
}

Working on this:
change the resources/config/app-context.xml

http://localhost:8081/geoportal/rest/metadata/reindex?fromIndexName=metadata&toIndexName=md2
"name" : "fromIndexName",
          "in" : "query",
          "description" : "the source",
          "required" : true,
          "type" : "string"
        }, {
          "name" : "toIndexName",
          "in" : "query",