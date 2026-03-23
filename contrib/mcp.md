# Geoportal Server MCP Server

Below are example requests/responses of the Geoportal Server MCP Server capability. Currently, this capability only works on the STAC API.

## Initial call

Request:

```
curl --location 'https://gpt.geocloud.com/geoportal/mcp'
```

Response:

```
{
    "endpoint": "https://gpt.geocloud.com/geoportal/mcp",
    "protocolVersion": "2024-11-05",
    "status": "ok"
}
```


## List tools

Request:

```
curl --location 'https://gpt.geocloud.com/geoportal/mcp' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "id": 10,
  "method": "tools/list",
  "params": {}
}'
```


## List collections

Request:

```
curl --location 'https://gpt.geocloud.com/geoportal/mcp' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "id": 10,
  "method": "tools/call",
  "params": {
    "name": "stac_list_collections",
    "arguments": {}
  }
}''
```


## Get a collection

Request:

```
curl --location 'https://gpt.geocloud.com/geoportal/mcp' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "id": 11,
  "method": "tools/call",
  "params": {
    "name": "stac_get_collection",
    "arguments": {
      "collectionId": "sentinel-2-l2a"
    }
  }
}'
```


## Search for items

Request:

```
curl --location 'https://gpt.geocloud.com/geoportal/mcp' \
--header 'Content-Type: application/json' \
--data '{
  "jsonrpc": "2.0",
  "id": 12,
  "method": "tools/call",
  "params": {
    "name": "stac_search",
    "arguments": {
      "xbbox": "-0,-90,180,90",
      "xdatetime": "2025-01-01T00:00:00Z/2025-12-31T23:59:59Z",
      "xlimit": 2,
      "collections": ["sentinel-2-l2a"]
    }
  }
}'
```

