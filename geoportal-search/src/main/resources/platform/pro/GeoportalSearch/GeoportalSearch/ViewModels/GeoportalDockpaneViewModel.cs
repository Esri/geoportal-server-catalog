using ArcGIS.Desktop.Framework;
using ArcGIS.Desktop.Framework.Contracts;


namespace GeoportalSearch
{
	internal class GeoportalDockpaneViewModel : DockPane
	{
		private const string _dockPaneID = "GeoportalSearch_GeoportalDockpane";

		protected GeoportalDockpaneViewModel() { }

		/// <summary>
		/// Show the DockPane.
		/// </summary>
		internal static void Show()
		{
			DockPane pane = FrameworkApplication.DockPaneManager.Find(_dockPaneID);
			if (pane == null)
				return;

			pane.Activate();
		}
	}

	/// <summary>
	/// Button implementation to show the DockPane.
	/// </summary>
	internal class GeoportalDockpane_ShowButton : Button
	{
		protected override void OnClick()
		{
			GeoportalDockpaneViewModel.Show();
		}
	}
}
