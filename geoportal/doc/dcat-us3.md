# DCAT-US 3.0 support (`com.esri.geoportal.dcat3`)

Implementation of the [DCAT-US 3.0](https://resources.data.gov/resources/dcat-us3/)
profile (based on [W3C DCAT 3](https://www.w3.org/TR/vocab-dcat-3/)) for Esri
Geoportal Server.

It is modelled on the existing DCAT-US 1.1 package (`com.esri.geoportal.dcat`)
but has one **major architectural change**:

> `DcatBuilder` executed the Nashorn script `gs/context/nashorn/execute.js` to
> query the index and to render each record.
> **`Dcat3Builder` does not use Nashorn at all.** All OpenSearch /
> Elasticsearch operations are performed directly in Java by `Dcat3Helper`
> using `ElasticClient`, exactly the way `StacService` / `StacHelper` do it.

---

## 1. Class overview

### Core (`com.esri.geoportal.dcat3`)

| Class | Responsibility | DCAT-US 1.1 counterpart |
|---|---|---|
| `Dcat3Config` | Spring bean with all catalog-wide defaults (profile URIs, publisher, contact point, license, access level, bureau/program codes, page size, behavior flags). | *(hard-coded `DCAT_DEFAULTS` in `DcatWriter.js`)* |
| **`Dcat3Helper`** | **All OpenSearch/Elasticsearch access + mapping of `_source` → DCAT-US 3.0 objects.** | `DcatRequest` + `execute.js` + `DcatWriter.js` |
| `Dcat3Builder` | Streams the aggregated catalog document into the cache. | `DcatBuilder` |
| `Dcat3Cache` | Cache folder management (`cache-*.dcat3`). | `DcatCache` |
| `Dcat3CacheOutputStream` | `.temp` → `.dcat3` atomic rename. | `DcatCacheOutputStream` |
| `Dcat3Context` | Run-state guard (single concurrent build, abortable). | `DcatContext` |
| `Dcat3Controller` | Scheduling (`runAt`) + sync/async generation. | `DcatController` |
| `Dcat3StreamingService` | Spring MVC `@RestController`. | `DcatStreamingService` |

### Model (`com.esri.geoportal.dcat3.model`)

| Class | RDF type |
|---|---|
| `Dcat3Catalog` | `dcat:Catalog` |
| `Dcat3Dataset` | `dcat:Dataset` |
| `Dcat3DatasetSeries` | `dcat:DatasetSeries` (standalone class; exposes only the properties documented on the [DCAT-US 3.0 Dataset Series schema page](https://resources.data.gov/standards/catalog/dcat-us-3/dataset-series/)) |
| `Dcat3DataService` | `dcat:DataService` |
| `Dcat3Distribution` | `dcat:Distribution` (carries `dcat:accessService`) |
| `Dcat3Organization` | `org:Organization` |
| `Dcat3ContactPoint` | `vcard:Contact` |
| `Dcat3PeriodOfTime` | `dct:PeriodOfTime` |
| `Dcat3Location` | `dct:Location` |
| `Dcat3Resource` | abstract base of the four cataloged classes |
| `Dcat3Constants` | profile URIs, `@type` values, service-type detection |

---

## 2. How the index is queried (no Nashorn)

`Dcat3Helper` builds every request with Jackson `ObjectNode` (so values are
correctly escaped) and posts it through `ElasticClient`:

```java
ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
ElasticClient client = ElasticClient.newClient();
String url = client.getTypeUrlForSearch(ec.getIndexName()) + "/_search";
String response = client.sendPost(url, query, "application/json");
JsonNode parsed = MAPPER.readTree(response);
```

Key methods:

| Method | Purpose |
|---|---|
| `prepareDatasetQuery(searchAfter, size)` | Builds the paged query (`track_total_hits`, `sort:_id asc`, `_source.includes`, access filters, `search_after`). |
| `searchDatasets(searchAfter, size)` | Executes one page against the metadata index. |
| `getItemById(id)` | Single item lookup (`ids` query). |
| `searchCollections(limit)` | Reads the collections index → `dcat:DatasetSeries`. |
| `searchCollectionMemberIds(collectionId, limit)` | Resolves `dcat:seriesMember`. |
| `countCollectionMembers(collectionId)` | `_count` for the series member count. |
| `getTotalHits(response)` | Works with both ES6 (`total` number) and ES7+ (`total.value`). |

**Deep pagination** uses `search_after` on `_id`, so the catalog is not limited
by `max_result_window`.

**Access filtering** (when `publicRecordsOnly=true`) honors the geoportal
security settings:

* `supportsGroupBasedAccess` → `term: { sys_access_s: "public" }`
* `supportsApprovalStatus` → `terms: { sys_approval_status_s: ["approved","reviewed"] }`

---

## 3. Field mapping (geoportal index → DCAT-US 3.0)

| Index field | DCAT-US 3.0 property |
|---|---|
| `_id` | `@id`, `identifier` (as `<base>/rest/metadata/item/<id>`) |
| `title` | `dct:title` |
| `description` | `dct:description` |
| `sys_created_dt` | `dct:issued` |
| `sys_modified_dt` | `dct:modified` |
| `keywords_s` | `dcat:keyword` |
| `itemType_s` | `dcat:theme` |
| `sys_owner_s` | `dct:creator` (`org:Organization`) |
| `credits_s` | `dct:provenance` |
| `rights_s` | `dct:rights` |
| `sys_access_s` | `accessLevel` (`public` / `restricted public` / `non-public`) |
| `src_collections_s` | `dcat:inSeries` → `dcat:DatasetSeries` |
| `envelope_geo` | `dct:spatial` (`dcat:bbox` WKT + `locn:geometry` GeoJSON + `dcat:centroid`) |
| `timeperiod_nst.begin_dt` / `end_dt` | `dct:temporal` (`dcat:startDate` / `dcat:endDate`) |
| `spatialRes_dist_d` | `dcat:spatialResolutionInMeters` |
| `fileid` | `dcat:Distribution.downloadURL` |
| `thumbnail_s` | `dcat:Distribution` (image/png) |
| `resources_nst[].url_s` / `url_type_s` | `dcat:Distribution`; when the type is a service (`MapServer`, `WMS`, …) also a `dcat:DataService` attached as `dcat:accessService` |
| *(item itself)* | `dcat:Distribution` for the JSON / HTML / XML metadata representations |
| collections index | `dcat:DatasetSeries` |

Values that cannot be derived from the index (publisher, contact point,
license, bureau/program codes …) come from `Dcat3Config`.

---

## 4. Generated document

```jsonc
{
  "@context": "https://resources.data.gov/resources/dcat-us/v3/context.jsonld",
  "conformsTo": "https://resources.data.gov/resources/dcat-us/v3",
  "describedBy": "https://resources.data.gov/resources/dcat-us/v3/schema/catalog.json",
  "@id": "http://host/geoportal/dcat3.json",
  "@type": "dcat:Catalog",
  "title": "Geoportal Catalog",
  "publisher": { "@type": "org:Organization", "name": "..." },
  "contactPoint": [{ "@type": "vcard:Contact", "fn": "...", "hasEmail": "mailto:..." }],
  "datasetSeries": [
    {
      "@type": "dcat:DatasetSeries",
      "@id": ".../dcat3/datasetSeries/myCollection",
      "title": "...",
      "description": "...",
      "publisher": { "@type": "org:Organization", "name": "..." },
      "contactPoint": [{ "@type": "vcard:Contact", "fn": "...", "hasEmail": "mailto:..." }],
      "spatial": [{ "@type": "dct:Location", "bbox": "POLYGON((...))" }],
      "temporal": [{ "@type": "dct:PeriodOfTime", "startDate": "...", "endDate": "..." }],
      "seriesMember": [{ "@type": "dcat:Dataset", "@id": "http://host/geoportal/rest/metadata/item/abc" }],
      "first": { "@type": "dcat:Dataset", "@id": "http://host/geoportal/rest/metadata/item/abc" },
      "last": { "@type": "dcat:Dataset", "@id": "http://host/geoportal/rest/metadata/item/xyz" }
    }
  ],
  "dataset": [
    {
      "@type": "dcat:Dataset",
      "@id": "http://host/geoportal/rest/metadata/item/abc",
      "title": "...",
      "spatial": { "@type": "dct:Location", "bbox": "POLYGON((...))" },
      "temporal": { "@type": "dct:PeriodOfTime", "startDate": "...", "endDate": "..." },
      "inSeries": [".../dcat3/datasetSeries/myCollection"],
      "distribution": [
        { "@type": "dcat:Distribution", "accessURL": "...", "mediaType": "application/json" },
        {
          "@type": "dcat:Distribution",
          "accessURL": "https://services/.../MapServer",
          "accessService": {
            "@type": "dcat:DataService",
            "endpointURL": "https://services/.../MapServer",

            "endpointDescription": "https://services/.../MapServer?f=json",
            "servesDataset": ["http://host/geoportal/rest/metadata/item/abc"]
          }
        }
      ]
    }
  ]
}
```

The builder **streams** the `dataset` array entry by entry, so memory usage is
constant regardless of catalog size.

---

## 5. Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/dcat3.json` | Complete cached catalog. Returns `202` + placeholder and starts a background build when no cache exists. |
| `GET` | `/dcat3/catalog.json` | Catalog header only (live). |
| `GET` | `/dcat3/dataset/{id}` | Single `dcat:Dataset` (live). |
| `GET` | `/dcat3/datasetSeries` | All `dcat:DatasetSeries` (live). |
| `GET` | `/dcat3/datasetSeries/{id}?members=true` | Single `dcat:DatasetSeries`, optionally with `dcat:seriesMember`. |
| `GET` | `/dcat3/dataService/{id}` | `dcat:DataService` entries of an item (live). |
| `GET` | `/dcat3/rebuild` | Triggers a rebuild (**not** `permitAll` – requires authentication). |

---

## 6. Configuration

Beans are declared in `config/app-dcat3.xml` (imported from `app-context.xml`)
and the controller package is added to the component scan in `app-servlet.xml`.

All properties can be overridden with environment variables:

| Environment variable | Default |
|---|---|
| `gpt_dcat3BaseUrl` | `http://localhost:8080/geoportal` |
| `gpt_dcat3RunAt` | *(empty = scheduled build disabled)* |
| `gpt_dcat3CacheFolder` | `<USER_HOME>/dcat3/cache` |
| `gpt_dcat3CatalogTitle` | `Geoportal Catalog` |
| `gpt_dcat3CatalogDescription` | `DCAT-US 3.0 catalog generated by Esri Geoportal Server.` |
| `gpt_dcat3PublisherName` | `Your Publisher` |
| `gpt_dcat3ContactName` / `gpt_dcat3ContactEmail` | `Your contact point` / `email@your.org` |
| `gpt_dcat3License` | `http://www.usa.gov/publicdomain/label/1.0/` |
| `gpt_dcat3AccessLevel` | `public` |
| `gpt_dcat3BureauCode` / `gpt_dcat3ProgramCode` | `010:04` / `010:000` |
| `gpt_dcat3PageSize` | `100` |
| `gpt_dcat3IncludeDatasetSeries` | `true` |
| `gpt_dcat3IncludeDataServices` | `true` |
| `gpt_dcat3PublicRecordsOnly` | `true` |
| `gpt_dcat3PrettyPrint` | `true` |
| `gpt_dcat3Context` / `gpt_dcat3ConformsTo` / `gpt_dcat3DescribedBy` | DCAT-US 3.0 profile URIs |

> **Important:** set `gpt_dcat3PublisherName`, `gpt_dcat3ContactEmail`,
> `gpt_dcat3BureauCode` and `gpt_dcat3ProgramCode` to real values before
> publishing to data.gov.

---

## 7. Coexistence with DCAT-US 1.1

The legacy `com.esri.geoportal.dcat` package and its `/dcat.json` endpoint are
untouched; both profiles can be served side by side. The DCAT-US 3.0 package
uses its own cache folder (`dcat3/cache`) and file extension (`.dcat3`).
