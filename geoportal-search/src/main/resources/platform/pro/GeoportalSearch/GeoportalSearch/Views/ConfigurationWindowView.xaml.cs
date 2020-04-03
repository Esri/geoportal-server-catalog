using ArcGIS.Desktop.Framework.Controls;
using System.Windows;

namespace GeoportalSearch
{
	/// <summary>
	/// Interaction logic for Window1.xaml
	/// </summary>
	public partial class ConfigurationsWindowView : ProWindow
	{
		private ConfigurationsWindowViewModel _vm;

		public ConfigurationsWindowView()
		{
			InitializeComponent();
			_vm = new ConfigurationsWindowViewModel();
			DataContext = _vm;
		}

		private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
		{
			e.Cancel = _vm.WindowClosingEvent();
		}

		private void Cancel_Button_Click(object sender, RoutedEventArgs e)
		{
			Close();
		}
	}
}
