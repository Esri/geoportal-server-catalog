using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GeoportalSearch
{
  public partial class FormViewMetadata : Form
  {
    #region Private variables
    private string _caption = "";
    private string _filePath = "";
    #endregion

    public string MetadataFilePath
    {
      get { return _filePath; }
    }
    public string MetadataTitle
    {
      set { this.Text = value + " - " + _caption; }
    }
    public FormViewMetadata()
    {
      InitializeComponent();
      UpdateUI();
    }

    public void Navigate(string urlString)
    {
      _filePath = urlString;
      Uri tmpUri = new Uri(urlString);
      webBrowserViewer.Navigate(tmpUri);
    }
    #region Methods
    /// <summary>
    /// Updates UI depending on current locale
    /// </summary>
    private void UpdateUI()
    {

      // set locale
      /*
      System.Threading.Thread.CurrentThread.CurrentUICulture = ci;

      //// set flow direction
      if (agsLocale.RightToLeftUI)
      {
        this.RightToLeft = RightToLeft.Yes;
        this.RightToLeftLayout = true;

      }
      else
      {
        this.RightToLeft = RightToLeft.No;
        this.RightToLeftLayout = false;

      }
      */
    }

    /// <summary>
    /// Handles view metadata form load event
    /// </summary>
    private void FormViewMetadata_Load(object sender, EventArgs e)
    {
      _caption = this.Text;   // "Metadata Viewer";
    }
    #endregion
  }
}
