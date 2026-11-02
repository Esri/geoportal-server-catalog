# Service Configuration Files

JSON templates and settings used by the Geoportal Server catalog to build responses for its STAC API and OGC API - Records endpoints.

Placeholders in `{braces}` (for example `{url}`, `{collectionId}`, `{itemId}`, `{itemCollectionId}`, `{currenttime}`, `{numberMatched}`, `{numberReturned}`, `{features}`) are substituted at runtime. Values starting with `$._source.` are JSONPath expressions evaluated against the Elasticsearch/OpenSearch hit.

## STAC API files (`stac-*.json`)

| File | Endpoint | Purpose |
|------|----------|---------|
| `stac-description.json` | `GET /` | Landing page (STAC `Catalog`): id, title, description, `conformsTo` list and links (`self`, `root`, `service-desc`, `conformance`, `data`, `search`, `queryables`). |
| `stac-conformance.json` | `GET /conformance` | Conformance classes (STAC core, collections, item-search, OGC API Features, filter, CQL2 text/json, query) and a `parent` link to the landing page. Keep in sync with `conformsTo` in `stac-description.json`. |
| `stac-api.json` | `GET /api` | OpenAPI 3.0.3 definition (`service-desc`). Contains an `api` array of OpenAPI documents for each STAC API part (core, collections, features, item-search, filter, etc.). Large file; edit with care. |
| `stac-collections.json` | `GET /collections` | Template for the collections list. Defines the collection (`stac_version`, `stac_extensions`, `id`, `title`, `description`, `license`, spatial/temporal `extent`, `item_assets`) and top-level links (`self`, `root`, `parent`). |
| `stac-collection-metadata.json` | `GET /collections/{collectionId}` | Links added to a single collection: `self`, `parent`, `queryables`, `items`, `root`. |
| `stac-items.json` | `GET /collections/{id}/items`, `/search` | Item search response. `response` is the `FeatureCollection` envelope (timestamp, numberMatched, numberReturned, features, links -> `stac-itemLinks.json`). `featurePropPath` maps each index document to a STAC `Feature`: id, collection, bbox, geometry, `properties` (updated, datetime, eo:platform, eo:epsg, AcquisitionDate), `stac_extensions`, and item links. |
| `stac-itemLinks.json` | Item search responses | Links for the item search response (paging etc.), referenced from `stac-items.json`. |
| `stac-queryables.json` | `GET /queryables`, `/collections/{id}/queryables` | JSON Schema (draft 2019-09) listing fields usable in `filter`/`query` parameters (for example `id`, `collection`, `geometry`, `datetime`, `updated`, `properties.eo:*`, `properties.view:*`). Each entry has title, type, optional min/max and an optional `$ref` to the STAC extension schema. |
| `stac-extension-prop.json` | Internal | Registry of supported STAC extensions: `eo`, `video`, `sar`, `pointcloud`, `processing`, `view`. For each, the schema `url` and the list of property names belonging to it. `pointcloud._notes` documents the field names of `pc:schemas` and `pc:statistics` objects. Used to decide which `stac_extensions` to emit for an item. |

### Common edits

- **Add an item property**: add the mapping in `stac-items.json`if source in opensearch is different than property name.For example -> `featurePropPath.properties` updated, and optionally add a queryable in `stac-queryables.json`.
- **Support a new STAC extension**: add it to `stac-extension-prop.json`, and to `stac_extensions` in `stac-items.json` and `stac-collections.json`.
- **Change collection metadata** (title, license, extent): edit `stac-collections.json`.
- **Advertise a new capability**: update `conformsTo` in both `stac-description.json` and `stac-conformance.json`, and the OpenAPI document in `stac-api.json`.

## OGC API - Records files (`ogcrecords-*.json`)

Equivalent templates for the OGC API - Records endpoints:

| File | Purpose |
|------|---------|
| `ogcrecords-description.json` | Landing page. |
| `ogcrecords-conformance.json` | Conformance classes. |
| `ogcrecords-api.json` | OpenAPI definition. |
| `ogcrecords-collections.json` | Collections list template. |
| `ogcrecords-collection-metadata.json` | Single collection links/metadata. |
| `ogcrecords-items.json` | Items (records) response template. |
| `ogcrecords-item.json` | Single item (record) template. |
| `ogcrecords-queryables.json` | Queryable fields. |
| `ogcrecords-schema.json` | Record schema. |

## DCAT files

| File | Purpose |
|------|---------|
| `dcat-context.json` | JSON-LD `@context` used for DCAT output. |
| `dcat3.json` | DCAT 3 output mapping/template. See `doc/dcat-us3.md`. |

## Notes

- Files must remain valid JSON (no comments or trailing commas).
- Changes are packaged from `src/main/resources`; rebuild and redeploy the WAR to apply them.
