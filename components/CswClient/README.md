# CSW Client for ArcGIS Pro

These folders contain the new CSW Client for ArcGIS Pro and will include the existing CSW Client for ArcMap. This is a straight port from the [https://github.com/Esri/geoportal-server/wiki/Geoportal-CSW-Clients](CSW Client for ArcMap). The CSW Client is currently only made available as a Microsoft Visual Studio Solution. Open the solution in your Visual Studio and build it to create the add-in files that can be deployed to an ArcGIS Pro client.

Setup:

- Please refer to the [ArcGIS Pro SDK documentation](https://developers.arcgis.com/documentation/arcgis-add-ins-and-automation/arcgis-pro/tutorials/build-your-first-add-in/) to setup the prerequisites for developing Pro add-ins.
- The CSW Client use a configuration file ```CswClient.properties``` that tells the client where to find the CSW profiles, where to log messages and the level of detail of those messages. The location of the folder is set in ```AppLogger.cs```. Its default is set to ```C:\geoportalserver```.
- You will find ```CswClient.properties``` file in the CswClient folder. Put this file in the folder you set in ```AppLogger.cs```.
- This folder also includes a folder with CSW Profiles. Put this folder in a location accessible from ArcGIS Pro clients. For example in ```C:\geoportalserver\profiles```.
- Update ```CswClient.properties``` to:
  - Set ```dataFolder``` to the location you used for the profiles in the previous step.
  - Set ```logFolder``` to a location accessible from ArcGIS Pro where the CSW Client can write log messages.
  - Set ```maxLogFileSizeInBytes``` to a value. This prevents the log file from growing indefinitely.
  - Set ```debug``` to ```on``` or ```off``` to show/hide debug messages from the add-in.
- Open the CswClient.sln file in Visual Studio
- Check that Pro is properly set as the external program to start when debugging the add-in from within Visual Studio:

![image](https://user-images.githubusercontent.com/394890/111036079-42156000-83d2-11eb-881d-2ca4d1b3c3e1.png)

- Run!
