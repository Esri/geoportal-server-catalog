# Esri Geoportal Server Catalog

[![apache licensed](https://img.shields.io/badge/license-Apache%202.0-orange.svg?style=flat-square)](https://raw.githubusercontent.com/Esri/geoportal-server-catalog/master/LICENSE.txt)

Esri Geoportal Server v2 is Esri's free and open source metadata catalog and search application, based on elasticsearch. 

Esri Geoportal Server v2 now provides the catalog and harvesting capabilities as separate modules. Separate modules are useful when users need the catalog capabilities without needing metadata harvesting, or possibly even metadata editing.

This repository contains the capability of **Geoportal Server Catalog**, while it's sibling **[Geoportal Server Harvester](https://github.com/ArcGIS/geoportal-server-harvester)** is managed in a separate repository.


## Releases and Downloads
- **2.7.2.1 - LATEST** - released, November 22, 2024.
- 2.7.2 - released, October 4, 2024.
- 2.7.1 - released, December 21, 2023.
- 2.7.0-patch1 - released Sep 11, 2023.
- 2.6.5 - released December 17, 2021. Note that this version includes resolution to the Log4j2 vulnerability identified in December 2021.
- [All releases](https://github.com/Esri/geoportal-server-catalog/wiki).

## Can't Wait to Get Started?
- Try the [sandbox site](https://gpt.geocloud.com/geoportal2) and learn what Geoportal 2 is all about!
- A different configuration that contains several 100,000 images as its [catalog](https://geoss.esri.com/imagecatalog)

## Features
* **Metadata editor** - Create and edit metadata in ArcGIS Metadata, FGDC, ISO 19115 (Data), ISO 19119 (Service), ISO 19115-2 (Imagery and Gridded Data), INSPIRE 2.0.1 (Data), INSPIRE 2.0.1 (Service), GEMINI (Data), GEMINI (Service)
* **Faceted Search** - Configure different facets to allow your user to filter from the hay stack to the needle
* **Scalability** - Thank you elasticsearch for providing multi-node configuration support
* **OGC CSW 3.0.0 and CSW 2.0.2** - Standards compliant catalog service interface, includes CSW2 requirements for INSPIRE Discovery Service
* **Spatio-Temporal Asset Catalog API** - As of Geoportal 2.7.2, it may be used to build a scalable Spatio-Temporal Asset Catalog (STAC) 
* **Many metadata formats** - Extend the configuration with your favorite XML format
* **Built-in Viewer** - Use the app we include or build one using Web AppBuilder and hook it up!
* **No more database** - Yes that's a feature!

## Requirements

* Elasticsearch 7.x or higher, or OpenSearch 2.12
* Tomcat 9.x

## Installation
- See the [installation instructions](https://github.com/Esri/geoportal-server-catalog/wiki/Installation) on the wiki.

## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an [issue](https://github.com/ArcGIS/geoportal-server-catalog/issues).

## Documentation
- Please refer to the [Wiki](https://github.com/ArcGIS/geoportal-server-catalog/wiki).


## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).


## Licensing
Copyright 2003 - 2023 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license](https://github.com/ArcGIS/geoportal-server-catalog/blob/master/LICENSE.txt) file.


