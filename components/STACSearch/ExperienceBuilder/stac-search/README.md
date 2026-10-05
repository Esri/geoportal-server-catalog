This widget can be used in ArcGIS Experience Builder to provide federated search across multiple STAC servers.

In configuration mode you can add additional STAC servers. The search includes selecting a STAC, collection, and various common parameters, such as time, extent, and cloud cover (when applicable). The widget has a 'follow me' mode that runs the search every time you pan/zoom on the map.

You can select to search a specific collection within a specific STAC, any collection within a specific STAC, or any collection across any configured STAC. Note that some STACs may limit your ability to search across all collections at the same time.

When you have found some results, you can see the STAC item assets and for those that have the role 'data' or 'visual' and where the asset does not require authentication, you can add the asset to the map. There is an option to provide an API key in the configuration of the STAC. This is done via custom STAC API request parameters that will get appended to every request made to the STAC server.

Additionally, you can download the asset (again if allowed by the provider).

When you search across all configured STACs, you will see filters above the results allowing you to switch between the items found in each of the STACs.

Give it a try at: https://gpt.geocloud.com/stac_explorer/

<img width="1912" height="913" alt="image" src="https://github.com/user-attachments/assets/4ec23c4d-483b-4466-8cc4-5cc9b99db2e1" />
