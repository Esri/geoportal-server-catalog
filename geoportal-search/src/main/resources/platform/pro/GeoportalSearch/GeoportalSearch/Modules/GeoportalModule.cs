using System;
using System.IO;
using System.Threading.Tasks;
using ArcGIS.Desktop.Framework;
using ArcGIS.Desktop.Framework.Contracts;

namespace GeoportalSearch
{
	internal class GeoportalModule : Module
	{
		#region Private Constants
		/// <summary>
		/// The access key to get and set the configuration settings in the <see cref="ModuleSettingsReader"/> and <see cref="ModuleSettingsWriter"/>
		/// </summary>
		private const string CONFIGURATION_KEY = "Configurations";

		/// <summary>
		/// The file name where we store our json configuration
		/// </summary>
		private const string JSON_FILE_NAME = "GeoportalConfigurations.json";
		#endregion

		#region Internal Properties
		/// <summary>
		/// The json configurations stored as a string
		/// </summary>
		internal string Configurations { get; set; }

		/// <summary>
		/// The path to our configuration file
		/// </summary>
		internal string ConfigurationsFilePath { get; }

		/// <summary>
		/// A check to see if the current user is authorized to write to the folder where we store our configuration file
		/// </summary>
		internal bool Authorized { get; } = true;
		#endregion

		#region Singleton
		private static GeoportalModule _this = null;

		/// <summary>
		/// Retrieve the singleton instance to this module here
		/// </summary>
		public static GeoportalModule Current
		{
			get
			{
				return _this ?? (_this = (GeoportalModule)FrameworkApplication.FindModule("GeoportalSearch_Module"));
			}
		}
		#endregion

		#region Constructors
		/// <summary>
		/// The default constructor.
		/// </summary>
		public GeoportalModule()
		{
			var settingsPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonDocuments),
			"ArcGIS", "ArcGISPro", "Settings");
			// Try to create the directory and the file to store our JSON. If we can't then set authorized to false so we can fall back to the Pro built in settings
			try
			{
				if (!Directory.Exists(settingsPath))
				{

					Directory.CreateDirectory(settingsPath);
				}
				ConfigurationsFilePath = Path.Combine(settingsPath, JSON_FILE_NAME);
			}
			catch (Exception)
			{
				Authorized = false;
			}
		}
		#endregion

		#region Overrides
		/// <summary>
		/// Called by Framework when ArcGIS Pro is closing
		/// </summary>
		/// <returns>False to prevent Pro from closing, otherwise True</returns>
		protected override bool CanUnload()
		{
			//TODO - add your business logic
			//return false to ~cancel~ Application close
			return true;
		}

		protected override Task OnReadSettingsAsync(ModuleSettingsReader settings)
		{
			var configurationObject = settings.Get(CONFIGURATION_KEY);
			Configurations = configurationObject as string;
			return base.OnReadSettingsAsync(settings);
		}

		protected override Task OnWriteSettingsAsync(ModuleSettingsWriter settings)
		{
			settings.Add(CONFIGURATION_KEY, Configurations);
			return base.OnWriteSettingsAsync(settings);
		}

		#endregion Overrides

	}
}
