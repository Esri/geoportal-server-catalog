using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;
using ArcGIS.Core.CIM;
using ArcGIS.Core.Geometry;
using ArcGIS.Desktop.Core;
using ArcGIS.Desktop.Framework.Threading.Tasks;
using ArcGIS.Desktop.Mapping;

namespace GeoportalSearch {
  [ComVisible(true)]
  public class GsHandler {

    public void initBrowserControl(WebBrowser browser) {
      string url = "http://urban.esri.com/gs/platform/gspro.html";
      //string url = "file:///C:/Projects/eclipse-jee-mars-1-win32-x86_64/workspace/csw3/src/main/resources/gs.html"; // this works
      //url = "file:///C:/Projects/github/geoportal-server-catalog/geoportal-search/src/main/resources/platform/pro/GeoportalSearch/GeoportalSearch/webapp/gspro2.html";
      browser.ObjectForScripting = this;
      browser.Navigate(url);
    }

    [ComVisible(true)]
    public Boolean gsHasListener = true;

    [ComVisible(true)]
    public void gsAddItem(String serviceType, String serviceUrl, String itemId, String referenceId, Object callback) {
      bool ok = false;
      dynamic callbackFunc = callback;
      if (itemId != null && MapView.Active != null && MapView.Active.Map != null) {
        Map map = MapView.Active.Map;
        QueuedTask.Run(() => {
          try {
            Item item = ItemFactory.Instance.Create(itemId, ItemFactory.ItemType.PortalItem);
            if (LayerFactory.Instance.CanCreateLayerFrom(item)) {
              Layer lyr = LayerFactory.Instance.CreateLayer(item, map);
              ok = true;
            }
          }
          catch (Exception e) {
            Console.WriteLine("Error adding item {0}", e);
          }
          callbackFunc(ok);
        });
      }
      else {
        callbackFunc(ok);
      }
    }

    [ComVisible(true)]
    public void gsAddLayer(String serviceType, String serviceUrl, String referenceId, Object callback) {
      String url = serviceUrl;
      bool ok = false;
      dynamic callbackFunc = callback;
      if (serviceType != null && MapView.Active != null && MapView.Active.Map != null) {

        //serviceType = "Feature Service"; url = @"http://sampleserver6.arcgisonline.com/arcgis/rest/services/NapervilleShelters/FeatureServer";
        //serviceType = "Feature Service"; url = @"http://sampleserver6.arcgisonline.com/arcgis/rest/services/NapervilleShelters/FeatureServer/0";
        //serviceType = "Map Service"; url = @"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer";
        //serviceType = "Map Service"; url = @"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/5";
        //serviceType = "Image Service"; url = @"http://sampleserver6.arcgisonline.com/arcgis/rest/services/Toronto/ImageServer";
        //serviceType = "WMS"; url = @"http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi";
        //serviceType = "KML"; url = @"http://www.ndbc.noaa.gov/kml/marineobs_as_kml.php";

        Map map = MapView.Active.Map;
        QueuedTask.Run(() => {

          try {
            if (serviceType == "WMS") {
              var serverConnection = new CIMInternetServerConnection { URL = url };
              var connection = new CIMWMSServiceConnection { ServerConnection = serverConnection };
              LayerFactory.Instance.CreateLayer(connection, map);
              ok = true;
            }
            else if (serviceType == "KML") {
              var connection = new CIMKMLDataConnection { KMLURI = url };
              LayerFactory.Instance.CreateLayer(connection, map);
              ok = true;
            }
            else {
              Layer lyr = LayerFactory.Instance.CreateLayer(new Uri(url), map);
              ok = true;
            }
          }
          catch (Exception e) {
            Console.WriteLine("Error adding layer {0}", e);
          }
          callbackFunc(ok);
        });
      }
      else {
        callbackFunc(ok);
      }
    }

    [ComVisible(true)]
    public String gsGetGeographicExtent() {
      String bbox = null;
      var mapView = MapView.Active;
      if (mapView != null) {
        var extent = mapView.Extent;
        if (extent != null) {
          Task<String> t = QueuedTask.Run(() => {
            String result = null;
            SpatialReference newSR = SpatialReferenceBuilder.CreateSpatialReference(4326);
            Geometry ext = GeometryEngine.Instance.Project(extent, newSR);
            if (ext != null) {
              result = "{\"xmin\":" + ext.Extent.XMin;
              result += ",\"ymin\":" + ext.Extent.YMin;
              result += ",\"xmax\":" + ext.Extent.XMax;
              result += ",\"ymax\":" + ext.Extent.YMax + "}";
            }
            return result;
          });
          bbox = t.Result;
        }
      }
      return bbox;
    }

    [ComVisible(true)]
    public void gsListener(String response) {
      //ArcGIS.Desktop.Framework.Dialogs.MessageBox.Show(response);
    }

  }
}
