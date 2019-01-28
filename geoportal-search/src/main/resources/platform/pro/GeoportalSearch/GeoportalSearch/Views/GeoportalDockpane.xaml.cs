using System.Windows;
using System.Windows.Controls;


namespace GeoportalSearch
{
	/// <summary>
	/// Interaction logic for GeoportalDockpaneView.xaml
	/// </summary>
	public partial class GeoportalDockpaneView : UserControl
	{
		GsHandler gsHandler = new GsHandler();
		ConfigurationsWindowView configurationWindow = null;

		public GeoportalDockpaneView()
		{
			InitializeComponent();
			gsHandler.InitBrowserControl(webBrowser1);
		}

		private void reloadButton_Click(object sender, RoutedEventArgs e)
		{
			webBrowser1.Refresh();
		}

		private void ConfigButton_Click(object sender, RoutedEventArgs e)
		{
			if (configurationWindow == null)
			{
				configurationWindow = new ConfigurationsWindowView();
				configurationWindow.Closed += (sender2, args) => configurationWindow = null;
				configurationWindow.Show();
			}
		}
	}
}
