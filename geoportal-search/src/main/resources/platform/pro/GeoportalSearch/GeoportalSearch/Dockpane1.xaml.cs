using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;


namespace GeoportalSearch {
  /// <summary>
  /// Interaction logic for Dockpane1View.xaml
  /// </summary>
  public partial class Dockpane1View : UserControl {

    GsHandler gsHandler = new GsHandler();

    public Dockpane1View() {
      InitializeComponent();
      gsHandler.initBrowserControl(webBrowser1);
    }

    private void reloadButton_Click(object sender, RoutedEventArgs e) {
      webBrowser1.Refresh();
    }
  }
}
