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
| `Dcat3Config` | Spring bean with all catalog-wide defaults (profile URIs, publisher, contact point, license, access level, bureau/program codes, page size, behavior flags) and the profile-driven field mapping / property ordering loaded from `service/config/dcat3.json` (see §6.1). | *(hard-coded `DCAT_DEFAULTS` in `DcatWriter.js`)* |
| **`Dcat3Helper`** | **All OpenSearch/Elasticsearch access + mapping of `_source` → DCAT-US 3.0 objects.** | `DcatRequest` + `execute.js` + `DcatWriter.js` |
| `Dcat3Builder` | Streams the aggregated catalog document into the cache. | `DcatBuilder` |
| `Dcat3JsonOrder` | Reorders serialized JSON properties per the `classProperty` configuration in `service/config/dcat3.json` (see §6.1). | *(n/a)* |
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
| `getItemById(id, profile)` | Single item lookup (`ids` query), applying the profile's access/approval field mappings. |
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

Field names below are the **defaults**; every one of them can be overridden
per profile via `service/config/dcat3.json` (see §6.1).

| Index field | DCAT-US 3.0 property |
|---|---|
| `_id` | `@id`, `identifier` (as `<base>/rest/metadata/item/<id>`) |
| `title` | `dct:title` |
| `description` | `dct:description` |
| `sys_created_dt` | `dct:issued` |
| `sys_modified_dt` | `dct:modified` |
| `publisher_s`, `contact_organizations_s` | `dct:publisher` (`org:Organization.name`) on `dcat:Dataset` and on every `dcat:DataService` derived from it (standalone `/dcat3/dataService/{id}` and embedded `dcat:accessService`), including its `servesDataset` reference — see §3.1 |
| `contact_people_s` | `dcat:contactPoint.fn` on the same resources as above — see §3.1 |
| `keywords_s` | `dcat:keyword` |
| `itemType_s` | `dcat:theme` |
| `sys_owner_s` | `dct:creator` (`org:Organization`) |
| `credits_s` | `dct:provenance` |
| `rights_s` | `dct:rights` |
| `sys_access_s` | `accessLevel` (`public` / `restricted public` / `non-public`); also used (together with `sys_approval_status_s`) as an access filter when `publicRecordsOnly=true` |
| `src_collections_s` | `dcat:inSeries` → `dcat:DatasetSeries` |
| `envelope_geo` | `dct:spatial` (`dcat:bbox` WKT + `locn:geometry` GeoJSON + `dcat:centroid`) |
| `timeperiod_nst.begin_dt` / `end_dt` | `dct:temporal` (`dcat:startDate` / `dcat:endDate`) |
| `spatialRes_dist_d` | `dcat:spatialResolutionInMeters` |
| `fileid` | `dcat:Distribution.downloadURL` |
| `thumbnail_s` | `dcat:Distribution` (image/png) |
| `resources_nst[].url_s` / `url_type_s` | `dcat:Distribution`; when the type is a service (`MapServer`, `WMS`, …) also a `dcat:DataService` attached as `dcat:accessService` |
| *(item itself)* | `dcat:Distribution` for the JSON / HTML / XML metadata representations |
| collections index (`id`/`identifier`, `title`/`name`, `description`, `sys_created_dt`, `sys_modified_dt`, `accrualPeriodicity`, `envelope_geo`, `timeperiod_nst`) | `dcat:DatasetSeries` |
| collections index `contacts[0].organization` / `.name` / `.emails[0].value` | `dcat:DatasetSeries.publisher` / `contactPoint` — see §3.1 |

Values that cannot be derived from the index (publisher, contact point,
license, bureau/program codes …) come from `Dcat3Config`.

### 3.1 Publisher / contact point resolution precedence

`dct:publisher` and `dcat:contactPoint` are resolved independently (a blank
value at one precedence level falls through to the next) for every resource
that carries them:

* **`dcat:Dataset`** (`/dcat3/dataset/{id}`, `/dcat3/dataset`, and the
  `dataset` array of `/dcat3.json`):
  1. the item's own `dataset.publisherName` / `dataset.contactName` /
     `dataset.contactEmail` mapping (defaults: `publisher_s,contact_organizations_s`
     / `contact_people_s` / *(unmapped)*),
  2. the catalog-wide configured default (`gpt_dcat3PublisherName` /
     `gpt_dcat3ContactName` / `gpt_dcat3ContactEmail`).
* **`dcat:DatasetSeries`** (`/dcat3/datasetSeries*` and the `datasetSeries`
  array of `/dcat3.json`):
  1. `organization` / `name` / `emails[0].value` of the **first entry** of
     the collection's `contacts` array (`datasetSeries.contacts`, default
     field name `contacts` — populated e.g. through the Collections Panel UI
     contacts editor; see §3.2),
  2. the legacy flat-field mapping, when configured (`datasetSeries.publisherName`
     / `datasetSeries.contactName` / `datasetSeries.contactEmail` — not
     mapped by default in `service/config/dcat3.json`),
  3. the catalog-wide configured default.
* **`dcat:DataService`** (standalone `/dcat3/dataService/{id}` **and**
  embedded `dcat:accessService` on a `dcat:Distribution`) and its
  **`servesDataset`** reference: both mirror the **served dataset's**
  resolved `dct:publisher` / `dcat:contactPoint` (i.e. the same two-level
  precedence described above for `dcat:Dataset`), so a `dcat:DataService`
  and the dataset it serves never disagree on publisher/contact.

### 3.2 STAC collection `contacts` (Collections Panel UI)

The Collections Panel's collection editor can attach one or more contacts to
a collection, stored as a `contacts` array on the STAC collection document
(STAC [contacts extension](https://github.com/stac-extensions/contacts)
shape):

```jsonc
"contacts": [{
  "name": "John Doe",
  "position": "CEO",
  "description": "John Doe is the CEO of Doe Chemicals, overseeing all operations and strategic direction.",
  "organization": "Doe Chemicals",
  "emails": [{ "value": "john@doe.com", "roles": ["work"] }]
}]
```

Only the **first** contact's `organization` / `name` / first email `value`
feed `dcat:DatasetSeries.publisher` / `contactPoint` (see §3.1); additional
contacts are stored on the collection but not currently surfaced elsewhere in
the DCAT-US 3.0 document.

---

## 4. Generated document

```jsonc
{
  "@context": "https://resources.data.gov/resources/dcat-us/v3/context.jsonld",
  "describedBy": "https://resources.data.gov/resources/dcat-us/v3/schema/catalog.json",
  "conformsTo": { "@id": "https://resources.data.gov/resources/dcat-us/v3" },
  "homepage": { "@id": "http://host/geoportal", "title": "Geoportal Catalog" },
  "@id": "http://host/geoportal/dcat3.json",
  "@type": "dcat:Catalog",
  "title": "Geoportal Catalog",
  "language": ["en"],
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
      "seriesMember": [{ "@type": "dcat:Dataset", "@id": "http://host/geoportal/rest/metadata/item/abc", "identifier": "abc", "title": "...", "description": "...", "contactPoint": [{ "@type": "vcard:Contact", "fn": "...", "hasEmail": "mailto:..." }] }],
      "first": { "@type": "dcat:Dataset", "@id": "http://host/geoportal/rest/metadata/item/abc", "identifier": "abc", "title": "...", "description": "...", "contactPoint": [{ "@type": "vcard:Contact", "fn": "...", "hasEmail": "mailto:..." }] },
      "last": { "@type": "dcat:Dataset", "@id": "http://host/geoportal/rest/metadata/item/xyz", "identifier": "xyz", "title": "...", "description": "...", "contactPoint": [{ "@type": "vcard:Contact", "fn": "...", "hasEmail": "mailto:..." }] }
    }
  ],
  "dataset": [
    {
      "@type": "dcat:Dataset",
      "@id": "http://host/geoportal/rest/metadata/item/abc",
      "title": "...",
      "publisher": { "@type": "org:Organization", "name": "..." },
      "creator": { "@type": "org:Organization", "name": "..." },
      "provenance": "...",
      "spatial": { "@type": "dct:Location", "bbox": "POLYGON((...))" },
      "temporal": { "@type": "dct:PeriodOfTime", "startDate": "...", "endDate": "..." },
      "inSeries": [".../dcat3/datasetSeries/myCollection"],
      "distribution": [
        { "@type": "dcat:Distribution", "accessURL": "...", "mediaType": "application/json" },
        {
          "@type": "dcat:Distribution",
          "accessURL": "https://services/.../MapServer",
          "accessService": [
            {
              "@type": "dcat:DataService",
              "@id": "http://host/geoportal/dcat3/dataService/abc",
              "title": "MapServer (MapServer)",
              "endpointURL": ["https://services/.../MapServer"],
              "endpointDescription": ["https://services/.../MapServer?f=json"],
              "servesDataset": [{ "@type": "dcat:Dataset", "@id": "http://host/geoportal/rest/metadata/item/abc", "identifier": "abc", "title": "...", "description": "...", "publisher": { "@type": "org:Organization", "name": "..." }, "contactPoint": [{ "@type": "vcard:Contact", "fn": "...", "hasEmail": "mailto:..." }] }],
              "conformsTo": [{ "@id": "https://developers.arcgis.com/rest/" }],
              "publisher": { "@type": "org:Organization", "name": "..." },
              "contactPoint": [{ "@type": "vcard:Contact", "fn": "...", "hasEmail": "mailto:..." }]
            }
          ]
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
| `GET` | `/dcat3/dataset` | Paged list of `dcat:Dataset` (live). Either `search_after`/`search_before` deep-pagination (`limit`, `searchAfter`, `searchBefore`) or offset-style filtered search (`from`, `size`, `sort`, `esdsl`); returns `next`/`previous` links. |
| `GET` | `/dcat3/datasetSeries` | All `dcat:DatasetSeries` (live). `includeSeriesMember=true` also resolves `dcat:first`/`dcat:last`/`dcat:seriesMember` for each series (subject to `maxSeriesMemberCnt`, see §6). |
| `GET` | `/dcat3/datasetSeries/{id}` | Single `dcat:DatasetSeries`. `includeSeriesMember=true` (or its alias `members=true`) resolves `dcat:first`/`dcat:last`/`dcat:seriesMember` (subject to `maxSeriesMemberCnt`). |
| `GET` | `/dcat3/dataService/{id}` | `dcat:DataService` entries of an item (live). |
| `GET` | `/dcat3/rebuild` | Triggers a rebuild (**not** `permitAll` – requires authentication). |

All endpoints accept an optional `profile` query parameter (`us` or `world`,
case-insensitive; defaults to the configured default profile) selecting which
`dcat3.json` mapping profile is applied (see §6.1). An unsupported value
returns `400`.

### `dcat:seriesMember` completeness

`dcat:first` is always populated (a single, cheap reference) whenever member
resolution is requested. `dcat:seriesMember` and `dcat:last` are only
populated when the series' **true** member count fits within
`maxSeriesMemberCnt` (a complete list can be produced); otherwise they are
omitted entirely (never a silently truncated partial list) and a debug log
entry is written. This applies identically to the cached `/dcat3.json`
builder and to the live `/dcat3/datasetSeries` / `/dcat3/datasetSeries/{id}`
endpoints.

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
| `gpt_dcat3CatalogIdentifier` | *(empty = falls back to the catalog `@id`)* |
| `gpt_dcat3Homepage` | *(empty = falls back to `baseUrl`)* |
| `gpt_dcat3Language` | `en` |
| `gpt_dcat3PublisherName` / `gpt_dcat3PublisherId` | `Your Publisher` / *(empty)* |
| `gpt_dcat3ContactName` / `gpt_dcat3ContactEmail` | `Your contact point` / `email@your.org` |
| `gpt_dcat3License` | `http://www.usa.gov/publicdomain/label/1.0/` |
| `gpt_dcat3Rights` | *(empty)* |
| `gpt_dcat3AccessLevel` | `public` |
| `gpt_dcat3AccrualPeriodicity` | *(empty)* |
| `gpt_dcat3BureauCode` / `gpt_dcat3ProgramCode` | `010:04` / `010:000` |
| `gpt_dcat3PageSize` | `100` |
| `gpt_dcat3IncludeDatasetSeries` | `true` — emits `dcat:DatasetSeries` in the cached `/dcat3.json` document |
| `gpt_dcat3IncludeDataServices` | `true` — emits `dcat:DataService` entries / `dcat:accessService` references |
| `gpt_dcat3MaxSeriesMemberCnt` | `1000` — maximum number of member ids resolved/emitted for a `dcat:DatasetSeries` (used as both the `dcat:first`/`dcat:last` sample size and the `dcat:seriesMember` completeness threshold; see §5). Applies consistently to the cached builder and both live `/dcat3/datasetSeries*` endpoints. Raise with care on collections that may contain a very large number of records. |
| `gpt_dcat3PublicRecordsOnly` | `true` |
| `gpt_dcat3PrettyPrint` | `true` |
| `gpt_dcat3MappingConfigPath` | `service/config/dcat3.json` — classpath resource with the profile field mappings / property ordering (see §6.1) |
| `gpt_dcat3Context` / `gpt_dcat3ConformsTo` / `gpt_dcat3DescribedBy` | DCAT-US 3.0 profile URIs |

> **Important:** set `gpt_dcat3PublisherName`, `gpt_dcat3ContactEmail`,
> `gpt_dcat3BureauCode` and `gpt_dcat3ProgramCode` to real values before
> publishing to data.gov.

### 6.1 Profile-driven field mapping (`service/config/dcat3.json`)

`Dcat3Config` loads `mappingConfigPath` (default
`service/config/dcat3.json`) at startup (and again whenever
`mappingConfigPath` is re-set). The file declares one or more named
**profiles** (out of the box: `us` and `world`), each with:

* **`sourceFieldMappings`** — maps a logical key (e.g. `dataset.creator`,
  `dataset.rights`, `query.collectionMembership`, `datasetSeries.title`) to
  the actual geoportal index field name (e.g. `sys_owner_s`, `rights_s`,
  `src_collections_s`, `title`). This is how the field mapping table in §3
  can be repointed at different index fields per profile without code
  changes, and also drives the Elasticsearch `_source.includes` list
  (`datasetSourceIncludes`) so only the fields actually needed are fetched.
  A value may be a **comma-separated list of candidate field names** (e.g.
  the default `dataset.publisherName`: `"publisher_s,contact_organizations_s"`)
  — each candidate is tried in order and the first with a non-blank value
  wins; this is also how `datasetSeries.contacts` (default field name
  `contacts`) locates the collection's STAC `contacts` array (see §3.1/§3.2).
* **`classProperty`** — per DCAT-US 3.0 class (`Dcat3Dataset`,
  `Dcat3DataService`, `Dcat3DatasetSeries`, `Dcat3Distribution`,
  `Dcat3Organization`, `Dcat3PeriodOfTime`, `Dcat3ContactPoint`, …) the
  ordered list of property names to emit first in the serialized JSON
  (`Dcat3JsonOrder`); any properties not listed are still emitted afterwards
  in their natural order.

`defaultProfile` (top-level key in the JSON, `us` by default) selects which
profile is used when the request does not specify one; the `profile` query
parameter (§5) can select `us` or `world` explicitly per request.

---

## 7. Coexistence with DCAT-US 1.1

The legacy `com.esri.geoportal.dcat` package and its `/dcat.json` endpoint are
untouched; both profiles can be served side by side. The DCAT-US 3.0 package
uses its own cache folder (`dcat3/cache`) and file extension (`.dcat3`).
