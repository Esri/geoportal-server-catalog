namespace GeoportalSearch
{
	internal class Configuration
	{
		#region Properties
		public string name { get; set; }

		public string url { get; set; }

		public string type { get; set; }

		public string profile { get; set; }

		public string requiredFilter { get; set; }

		public bool enabled { get; set; }

		public bool useProxy { get; set; }

		public bool disableContentType { get; set; }
		#endregion
	}
}
