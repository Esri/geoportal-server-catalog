using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows.Controls;
using ArcGIS.Core.CIM;
using ArcGIS.Core.Geometry;
using ArcGIS.Desktop.Core;
using ArcGIS.Desktop.Framework.Dialogs;
using ArcGIS.Desktop.Framework.Threading.Tasks;
using ArcGIS.Desktop.Mapping;
using Newtonsoft.Json.Linq;

namespace GeoportalSearch
{
	[ComVisible(true)]
	public class GsHandler
	{
		/// <summary>
		/// The URL that is hosting the geoportal search functionality
		/// </summary>
		const string GEOPORTAL_SEARCH_URL = "http://esri.github.io/geoportal-server-catalog/pro/gspro.html";

		public void InitBrowserControl(WebBrowser browser)
		{
			browser.ObjectForScripting = this;
			browser.Navigate(GEOPORTAL_SEARCH_URL);
		}

		[ComVisible(true)]
		public bool gsHasListener = true;

		[ComVisible(true)]
		public void gsAddItem(string serviceType, string serviceUrl, string itemId, string referenceId, object callback)
		{
			bool ok = false;
			string type = serviceType;
			dynamic callbackFunc = callback;

			QueuedTask.Run(() =>
			{
				if (MapView.Active == null)
				{
					MessageBox.Show("Please open a map before adding items.", "No Map Open", System.Windows.MessageBoxButton.OK, System.Windows.MessageBoxImage.Warning);
					callbackFunc(ok);
					return;
				}

				if (itemId != null)
				{
					var map = MapView.Active?.Map;
					try
					{
						Item item = ItemFactory.Instance.Create(itemId, ItemFactory.ItemType.PortalItem);
						if (LayerFactory.Instance.CanCreateLayerFrom(item))
						{
							Layer lyr = LayerFactory.Instance.CreateLayer(item, map);
							ok = true;
						}
					}
					catch (Exception e)
					{
						Console.WriteLine("Error adding item {0}", e);
					}
					callbackFunc(ok);
				}
				else
				{
					callbackFunc(ok);
				}
			});
		}

		[ComVisible(true)]
		public void gsGetConfigurations(object callback)
		{
			// initalize our json to an empty array
			var jsonString = "[]";
			dynamic callbackFunc = callback;

			// Try to read from our settings file and if we are unable to for whatever reason fallback to Pro's built in settings
			try
			{
				var path = GeoportalModule.Current.ConfigurationsFilePath;
				if (File.Exists(path))
				{
					using (var reader = new StreamReader(path))
					{
						jsonString = reader.ReadToEnd();
					}
				}
				else
				{
					jsonString = GeoportalModule.Current.Configurations ?? "[]";
				}
			}
			catch (Exception)
			{
				jsonString = GeoportalModule.Current.Configurations ?? "[]";
			}
			// Create a Json Array and give it a Key of "targets"
			var configurationJSONArray = JArray.Parse(jsonString);
			var targetsObject = new JObject
			{
				{ "targets", configurationJSONArray }
			};
			// Pass the string version of the json to the callback function
			var widgetConfigJSONString = targetsObject.ToString();
			callbackFunc(widgetConfigJSONString);
		}

		[ComVisible(true)]
		public void gsAddLayer(string serviceType, string serviceUrl, string referenceId, object callback)
		{
			string url = serviceUrl;
			string type = serviceType;
			bool ok = false;
			dynamic callbackFunc = callback;


			QueuedTask.Run(() =>
			{
				if (MapView.Active == null)
				{
					MessageBox.Show("Please open a map before adding items.", "No Map Open", System.Windows.MessageBoxButton.OK, System.Windows.MessageBoxImage.Warning);
					callbackFunc(ok);
					return;
				}

				if (serviceType != null)
				{

					//serviceType = "Feature Service"; url = @"http://sampleserver6.arcgisonline.com/arcgis/rest/services/NapervilleShelters/FeatureServer";
					//serviceType = "Feature Service"; url = @"http://sampleserver6.arcgisonline.com/arcgis/rest/services/NapervilleShelters/FeatureServer/0";
					//serviceType = "Map Service"; url = @"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer";
					//serviceType = "Map Service"; url = @"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/5";
					//serviceType = "Image Service"; url = @"http://sampleserver6.arcgisonline.com/arcgis/rest/services/Toronto/ImageServer";
					//serviceType = "WMS"; url = @"http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi";
					//serviceType = "KML"; url = @"http://www.ndbc.noaa.gov/kml/marineobs_as_kml.php";

					var map = MapView.Active?.Map;

					try
					{
						if (serviceType == "WMS")
						{
							var serverConnection = new CIMInternetServerConnection { URL = url };
							var connection = new CIMWMSServiceConnection { ServerConnection = serverConnection };
							var item = ItemFactory.Instance.Create(url, ItemFactory.ItemType.PortalItem);
							if (LayerFactory.Instance.CanCreateLayerFrom(item))
								LayerFactory.Instance.CreateLayer(item, map);
							//LayerFactory.Instance.CreateLayer(connection, map);
							ok = true;
						}
						else if (serviceType == "KML")
						{
							var connection = new CIMKMLDataConnection { KMLURI = url };
							LayerFactory.Instance.CreateLayer(connection, map);
							ok = true;
						}
						else
						{
							Layer lyr = LayerFactory.Instance.CreateLayer(new Uri(url), map);
							ok = true;
						}
					}
					catch (Exception e)
					{
						Console.WriteLine("Error adding layer {0}", e);
					}
					callbackFunc(ok);
				}
				else
				{
					callbackFunc(ok);
				}
			});
		}

		[ComVisible(true)]
		public string gsGetGeographicExtent()
		{
			string bbox = null;
			var mapView = MapView.Active;
			if (mapView != null)
			{
				var extent = mapView.Extent;
				if (extent != null)
				{
					Task<string> t = QueuedTask.Run(() =>
					{
						string result = null;
						SpatialReference newSR = SpatialReferenceBuilder.CreateSpatialReference(4326);
						Geometry ext = GeometryEngine.Instance.Project(extent, newSR);
						if (ext != null)
						{
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
		public void gsListener(string response)
		{
			//ArcGIS.Desktop.Framework.Dialogs.MessageBox.Show(response);
		}

	}
}
