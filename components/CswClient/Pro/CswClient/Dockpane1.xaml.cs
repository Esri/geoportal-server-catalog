using System;
using System.Collections;
using System.Resources;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Forms;
using System.Net.Http;
using System.Reflection;
using com.esri.gpt.csw;

using System.IO;
using System.Xml;
using System.Xml.Xsl;
using System.Xml.XPath;
using System.Text;
using System.Collections.Generic;
using ArcGIS.Desktop.Mapping;
using ArcGIS.Desktop.Framework;
using ArcGIS.Core.CIM;
using ArcGIS.Desktop.Framework.Threading.Tasks;
using System.Windows.Media.Imaging;
using ArcGIS.Core.Geometry;
using System.Linq;
using ArcGIS.Core.Data;
using System.Net;

namespace GeoportalSearch
{
  /// <summary>
  /// Interaction logic for Dockpane1View.xaml
  /// </summary>
  public partial class Dockpane1View : System.Windows.Controls.UserControl
  {
    #region Private Variable(s)
    private CswManager _cswManager = new CswManager();
    private CswProfiles _cswProfiles;
    private CswCatalogs _cswCatalogs;
    private bool _inited = false;
    private string _mapServerUrl = null;

    // Search Tab Variables
    private CswSearchRequest _searchRequest;
    private string styledRecordResponse = null;

    // Configure Tab Variables
    private ArrayList _catalogList;
    private ArrayList _profileList;private bool _newClicked = false;
    private bool _isCatalogListDirty = false;


    // Help Tab Variables
    private string _helpFilePath = "";
    private bool _isHelpFileLoaded = false;
    private static double NONEXSISTANTNUMBER = 500.31415;
    private bool showAll = false;
    private ResourceManager rm = new ResourceManager("com.esri.gpt.csw.StringResources", Assembly.GetExecutingAssembly());

    private GraphicsLayer _graphicsLayer = null;

        #endregion

        public Dockpane1View()
    {
      InitializeComponent();
      try
      {
        InitMyComponents();
      }
      catch (Exception ex)
      {
        System.Diagnostics.Trace.WriteLine("ERROR - " + ex.Message);
        ShowErrorMessageBox(StringResources.LoadFindServicesFailed + "\r\n" + ex.Message);
      }
    }

    /// <summary>
    /// Display an error message dialog with the provided message string, with default caption, button and icon
    /// </summary>
    /// <param name="ErrorMessage">Error message to be displayed</param>
    private void ShowErrorMessageBox(string ErrorMessage)
    {
      System.Diagnostics.Trace.WriteLine("ERROR - " + ErrorMessage);
      //System.Windows.Forms.MessageBox.Show(ErrorMessage, StringResources.ErrorMessageDialogCaption, MessageBoxButtons.OK, MessageBoxIcon.Error);
    }

    private void NewCatalogButton_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        ClearData();

        _newClicked = true;
        deleteCatalogButton.IsEnabled = false;
        saveCatalogButton.IsEnabled = false;
        catalogProfileComboBox.SelectedItem = catalogProfileComboBox.Items[0];

        catalogUrlTextBox.Focus();
        catalogListBox.SelectedIndex = -1;
        _isCatalogListDirty = true;
      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(ex.Message);
      }
    }

    private void SaveCatalogButton_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        if (_newClicked == true)
        {
          CswProfile profile = catalogProfileComboBox.SelectedItem as CswProfile;

          string url = "";
          url = catalogUrlTextBox.Text.Trim();
          string name = "";
          name = catalogDisplayNameTextBox.Text.Trim();
          if (url.Length == 0)
          {
            ShowErrorMessageBox(StringResources.UrlIsEmpty);
          }
          else
          {
            CswCatalog catalog = new CswCatalog(url, name, profile);
            catalog.resetConnection();
            _cswManager.addCatalog(catalog);
            ClearData();
            AddData();
            catalogListBox.SelectedIndex = catalogListBox.Items.IndexOf(catalog);
            _newClicked = false;
            System.Windows.Forms.MessageBox.Show(StringResources.CatalogAddedSuccessfully, StringResources.Success, MessageBoxButtons.OK, MessageBoxIcon.None);
          }
        }
        else if (catalogListBox.SelectedItem == null)
        {
          System.Windows.Forms.MessageBox.Show(StringResources.SelectAnItemToUpdate);
        }
        else
        {
          CswCatalog catalog = (CswCatalog)catalogListBox.SelectedItem;
          int index = catalogListBox.SelectedIndex;
          CswProfile profile = catalogProfileComboBox.SelectedItem as CswProfile;
          _cswManager.updateCatalog(catalog, catalogDisplayNameTextBox.Text, catalogUrlTextBox.Text, profile);
          catalog.resetConnection();
          ClearData();
          AddData();
          catalogListBox.SelectedIndex = index;
          System.Windows.Forms.MessageBox.Show(StringResources.CatalogSavedSuccessfully, StringResources.Success, MessageBoxButtons.OK, MessageBoxIcon.None);
        }
        _isCatalogListDirty = true;

      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(ex.Message);
      }
      finally
      {
        UpdateCatalogListLabel();
      }
    }

    private void DeleteCatalogButton_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        if (catalogListBox.SelectedItem == null)
        {
          ShowErrorMessageBox(StringResources.SelectAnItemToDelete);
        }
        else
        {
          CswCatalog catalog = (CswCatalog)catalogListBox.SelectedItem;
          if (System.Windows.Forms.MessageBox.Show(StringResources.DeleteConfirmation, StringResources.ConfirmDelete, MessageBoxButtons.YesNo) == DialogResult.Yes)
          {
            _catalogList.Remove(catalog);
            //catalogListBox.Update();
            _cswManager.deleteCatalog(catalog);
            ClearData();
            AddData();
          }
        }
        _isCatalogListDirty = true;
      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(ex.Message);
      }
      finally
      {
        UpdateCatalogListLabel();
      }
    }

    private void FindButton_Click(object sender, RoutedEventArgs e) {
      StringBuilder sb = new StringBuilder();
      try
      {

        // Todo: add more validation. only minimum validation at this point.
        if (catalogComboBox.SelectedIndex == -1)
        {
          ShowErrorMessageBox(StringResources.PleaseSelectACswCatalog);
          return;
        }

        CswCatalog catalog = (CswCatalog)catalogComboBox.SelectedItem;
        if (catalog == null) { throw new NullReferenceException(StringResources.CswCatalogIsNull); }

        // reset GUI for search results
        ResetSearchResultsGUI();


        System.Windows.Forms.Cursor.Current = Cursors.WaitCursor;

        if (!catalog.Profile.isOGCRecords && !catalog.IsConnected())
        {
          string errMsg = "";
          try
          {
            catalog.Connect();
          }
          catch (Exception ex) { errMsg = ex.Message; }
          if (!catalog.IsConnected())
          {
            sb.AppendLine("Failed to connect to Catalog");
            ShowErrorMessageBox(StringResources.ConnectToCatalogFailed + "\r\n" + errMsg);
            return;
          }
        }

        // todo: need paging maganism. update SearchCriteria.StartPoistion

        // generate search criteria
        CswSearchCriteria searchCriteria = new CswSearchCriteria();
        searchCriteria.SearchText = searchPhraseTextBox.Text;
        searchCriteria.StartPosition = 1;
        searchCriteria.MaxRecords = 10; // TO-DO (int)maxResultsNumericUpDown.Value;
        searchCriteria.LiveDataAndMapOnly = ((bool)liveDataAndMapsOnlyCheckBox.IsChecked);
        if ((bool)useCurrentExtentCheckBox.IsChecked)
        {
          try { 
            searchCriteria.Envelope = CurrentMapViewExtent(); 
          }
          catch (Exception ex)
          {
            String errMsg = StringResources.GetCurrentExtentFailed + "\r\n" +
                                ex.Message + "\r\n" + "\r\n" +
                                StringResources.UncheckCurrentExtentAndTryAgain;

            sb.AppendLine(errMsg);
            ShowErrorMessageBox(errMsg);
            return;
          }
        }
        else { searchCriteria.Envelope = null; }

        // search
        if (_searchRequest == null) { _searchRequest = new CswSearchRequest(); }
        _searchRequest.Catalog = catalog;
        _searchRequest.Criteria = searchCriteria;
        _searchRequest.Search();
        CswSearchResponse response = _searchRequest.GetResponse();
        // show search results
        ArrayList alRecords = CswObjectsToArrayList(response.Records);
        if (alRecords.Count > 0)
        {

          List<CswRecord> listItems = new List<CswRecord>();
          foreach (object record in alRecords)
          {
            listItems.Add((CswRecord)record);
          }

          resultsListBox.Items.Clear();
          resultsListBox.ItemsSource = listItems;
          resultsListBox.DisplayMemberPath= "Title";
          resultsListBox.SelectedValuePath = "ID";
          resultsListBox.SelectedIndex = 0;
          showAllFootprintToolStripButton.IsEnabled = catalog.Profile.SupportSpatialBoundary;
          clearAllFootprinttoolStripButton.IsEnabled = catalog.Profile.SupportSpatialBoundary;
          showAll = true;
        }
        else
        {
          sb.AppendLine(StringResources.NoRecordsFound);
          ShowErrorMessageBox(StringResources.NoRecordsFound);
        }

        resultsLabel.Content = StringResources.SearchResultsLabelText + " (" + alRecords.Count.ToString() + ")";
      }
      catch (Exception ex)
      {
        sb.AppendLine(ex.Message);
        ShowErrorMessageBox(ex.Message);
      }
      finally
      {
        Utils.logger.writeLog(sb.ToString());
        System.Windows.Forms.Cursor.Current = Cursors.Default;
      }
    }

    #region utils
    private void AddData()
    {
      _catalogList = CswObjectsToArrayList(_cswCatalogs);
      _catalogList.Sort();

      List<CswCatalog> listItems = new List<CswCatalog>();
      for (int i=0; i<_cswCatalogs.Count; i++)
      {
        listItems.Add(_cswCatalogs[i]);
      }

      catalogListBox.ItemsSource = listItems;
      catalogListBox.DisplayMemberPath = "Name";
      catalogListBox.SelectedValuePath = "ID";
      catalogListBox.SelectedIndex = _cswCatalogs.Count - 1;
    }

    private void ClearData()
    {
      catalogDisplayNameTextBox.Text = "";
      catalogUrlTextBox.Text = "";
    }

    private ArrayList CswObjectsToArrayList(CswObjects cswObjs)
    {
      ArrayList alCswObjects = new ArrayList();
      for (int i = 0; i < cswObjs.Count; i++)
      {
        alCswObjects.Add(cswObjs[i]);
      }
      return alCswObjects;
    }

    private void CatalogListBox_SelectedIndexChanged(object sender, SelectionChangedEventArgs e)
    {
      try
      {
        if (catalogListBox.SelectedIndex < 0)
        {
          catalogProfileComboBox.IsEnabled = true;
          deleteCatalogButton.IsEnabled = false;
          saveCatalogButton.IsEnabled = false;
          return;
        }
        else
        {
          CswCatalog catalog = (CswCatalog)catalogListBox.SelectedItem;
          catalogProfileComboBox.SelectedItem = catalog.Profile;
          catalogUrlTextBox.Text = catalog.URL;
          catalogDisplayNameTextBox.Text = catalog.Name;

          catalogProfileComboBox.IsEnabled = true;
          deleteCatalogButton.IsEnabled = true;
          saveCatalogButton.IsEnabled = false;
        }
      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(ex.Message);
      }
    }

    private void UpdateCatalogListLabel()
    {
      int count = catalogListBox.Items.Count;
      if (count > 0)
      {
        catalogListLabel.Content = StringResources.CatalogListLabelText + " (" + catalogListBox.Items.Count.ToString() + ")";
      }
      else
      {
        catalogListLabel.Content = StringResources.CatalogListLabelText;
      }
    }

    private void InitMyComponents()
    {
      if (!_inited)
      {
        // version info
        System.Diagnostics.FileVersionInfo fvi = System.Diagnostics.FileVersionInfo.GetVersionInfo(System.Reflection.Assembly.GetExecutingAssembly().Location);
        //    productBuildNoLabel.Text = "(" + StringResources.BuildNo + " " + fvi.ProductVersion + ")";

        // note: To save loading time, help Tab is not loaded.
        _inited = (LoadSearchTab() && LoadConfigTab());
        if (_inited && catalogComboBox.Items.Count > 0) catalogComboBox.SelectedIndex = 0;

        var map = MapView.Active.Map;
        if (map.MapType != MapType.Map)
          return;// not 2D

        if (_graphicsLayer == null)
        {
          var gl_param = new GraphicsLayerCreationParams { Name = "Footprints" };
          QueuedTask.Run(() =>
          {
            //By default will be added to the top of the TOC
            _graphicsLayer = LayerFactory.Instance.CreateLayer<ArcGIS.Desktop.Mapping.GraphicsLayer>(gl_param, map);
          });
        }
      }
    }

    private bool LoadConfigTab()
    {
      try
      {
        // populate profiles
        ArrayList _profileList = CswObjectsToArrayList(_cswProfiles);
        List<CswProfile> listItems = new List<CswProfile>();
        for (int i = 0; i < _profileList.Count - 1; i++)
        {
          listItems.Add((CswProfile)_profileList[i]);
        }

        catalogProfileComboBox.Items.Clear();
        catalogProfileComboBox.ItemsSource = listItems;
        catalogProfileComboBox.DisplayMemberPath = "Name";
        catalogProfileComboBox.SelectedValuePath = "ID";
        catalogProfileComboBox.SelectedIndex = -1;

        AddData();
        UpdateCatalogListLabel();
        return true;
      }
      catch (Exception ex)
      {
        throw new Exception(StringResources.LoadConfigTabFailed + "\r\n" + ex.Message, ex);
      }
    }
    /// <summary>
    /// Load components for Search Tab
    /// </summary>
    /// <returns>true if successful; false if error occurred. Exception shall be raised if there was any.</returns>
    private bool LoadSearchTab()
    {
      ResetSearchResultsGUI();

      // load CSW Profiles
      try
      {
        _cswProfiles = _cswManager.loadProfile();
        if (_cswProfiles == null) { throw new NullReferenceException(); }
      }
      catch (Exception ex)
      {
        throw new Exception(StringResources.LoadProfilesFailed + "\r\n" + ex.Message, ex);
      }

      // load CSW Catalogs
      try
      {
        _cswCatalogs = _cswManager.loadCatalog();
        if (_cswCatalogs == null) { throw new NullReferenceException(); }

        _catalogList = CswObjectsToArrayList(_cswCatalogs);

        List<CswCatalog> listItems = new List<CswCatalog>();
        for (int i = 0; i < _cswCatalogs.Count; i++)
        {
          listItems.Add(_cswCatalogs[i]);
        }

        //catalogComboBox.BeginUpdate();
        catalogComboBox.Items.Clear();
        catalogComboBox.ItemsSource = listItems;
        catalogComboBox.DisplayMemberPath = "Name";
        catalogComboBox.SelectedValuePath = "ID";
        catalogComboBox.SelectedIndex = -1;
        //catalogComboBox.EndUpdate();
      }
      catch (Exception ex)
      {
        throw new Exception(StringResources.LoadCatalogsFailed + "\r\n" + ex.Message, ex);
      }

      return true;
    }

    /// <summary>
    /// Reset GUI for search results, including listbox, search result label, buttons, abstracts, etc.
    /// </summary>
    private void ResetSearchResultsGUI()
    {
      resultsLabel.Content = StringResources.SearchResultsLabelText;
      //resultsLabel.Refresh();
      resultsListBox.ItemsSource = null;

      abstractTextBox.Text = "";

      // GUI update for buttons
      addToMapToolStripButton.IsEnabled = false;
      viewMetadataToolStripButton.IsEnabled = false;
      downloadMetadataToolStripButton.IsEnabled = false;
      displayFootprinttoolStripButton.IsEnabled = false;
      zoomtoFootprintToolStripButton.IsEnabled = false;
      showAllFootprintToolStripButton.IsEnabled = false;
      clearAllFootprinttoolStripButton.IsEnabled = false;
    }

    private string GenerateTempFilename(string prefix, string surfix)
    {
      // todo: use System.IO.Path.GetRandomFileName() to accomodate prefix;
      //       it will avoid the issue of .tmp file being generated by system
      string tempFilename = System.IO.Path.GetTempFileName();
      try { System.IO.File.Delete(tempFilename); }
      catch { }
      tempFilename = System.IO.Path.ChangeExtension(tempFilename, surfix);

      return tempFilename;
    }

    /// <summary>
    /// Append question mark or ampersand to a url string
    /// </summary>
    /// <param name="urlString">source URL string</param>
    /// <returns>output URL string</returns>
    private string AppendQuestionOrAmpersandToUrlString(string urlString)
    {
      urlString = urlString.Trim();
      string finalChar = urlString.Substring(urlString.Length - 1, 1);    // final char
      if (!finalChar.Equals("?") && !finalChar.Equals("&"))
      {
        if (urlString.LastIndexOf("=") > -1) { urlString = urlString + "&"; }
        else { urlString = urlString + "?"; }
      }
      return urlString;
    }

    private XmlDocument RetrieveSelectedMetadataFromCatalog(bool bApplyTransform)
    {
      try
      {
        // validate
        if (catalogComboBox.SelectedIndex == -1) { throw new Exception(StringResources.NoCatalogSelected); }
        if (resultsListBox.SelectedIndex == -1) { throw new Exception(StringResources.NoSearchResultSelected); }
        CswCatalog catalog = (CswCatalog)catalogComboBox.SelectedItem;
        if (catalog == null) { throw new NullReferenceException(StringResources.CswCatalogIsNull); }
        CswRecord record = (CswRecord)resultsListBox.SelectedItem;
        if (record == null) throw new NullReferenceException(StringResources.CswRecordIsNull);
        
        // connect to catalog if needed
        if (!catalog.IsConnected())
        {
          string errMsg = "";
          try { catalog.Connect(); }
          catch (Exception ex) { errMsg = ex.Message; }

          // exit if still not connected
          if (!catalog.IsConnected())
          {
            ShowErrorMessageBox(StringResources.ConnectToCatalogFailed + "\r\n" + errMsg);
            return null;
          }
        }

        bool isTransformed = false;

        // retrieve metadata doc by its ID
        if (_searchRequest == null) { _searchRequest = new CswSearchRequest(); }
        _searchRequest.Catalog = catalog;
        try
        {
          isTransformed = _searchRequest.GetMetadataByID(record.ID, bApplyTransform);
          _mapServerUrl = _searchRequest.GetMapServerUrl();

        }
        catch (Exception ex)
        {
          ShowDetailedErrorMessageBox(StringResources.RetrieveMetadataFromCatalogFailed, _searchRequest.GetResponse().ResponseXML);
          System.Diagnostics.Trace.WriteLine(StringResources.RetrieveMetadataFromCatalogFailed);
          System.Diagnostics.Trace.WriteLine(ex.Message);
          System.Diagnostics.Trace.WriteLine(_searchRequest.GetResponse().ResponseXML);
          return null;
        }

        CswSearchResponse response = _searchRequest.GetResponse();
        CswRecord recordMetadata = response.Records[0];
        if (recordMetadata.FullMetadata.Length == 0) { throw new Exception(StringResources.EmptyMetadata); }

        if (!isTransformed)
        {
          XmlDocument xmlDoc = new XmlDocument();
          try { xmlDoc.LoadXml(recordMetadata.FullMetadata); }
          catch (XmlException xmlEx)
          {
            ShowDetailedErrorMessageBox(StringResources.LoadMetadataFailed + "\r\n" + xmlEx.Message,
                                        recordMetadata.FullMetadata);
            return null;
          }
          return xmlDoc;
        }
        else
        {
          styledRecordResponse = recordMetadata.FullMetadata;
          return null;
        }
      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(StringResources.RetrieveMetadataFromCatalogFailed + "\r\n" + ex.Message);
        return null;
      }
    }

    private void RemoveTempFileAfterMetadataViewerClosed(object sender, FormClosedEventArgs e)
    {
      try
      {
        FormViewMetadata frmViewMetadata = (FormViewMetadata)(sender);
        if (frmViewMetadata != null) { System.IO.File.Delete(frmViewMetadata.MetadataFilePath); }
      }
      catch
      {
        // ignore, if error occurrs when deleting temp file
      }
    }

    private void ShowWarningMessageBox(string WarningMessage)
    {
      System.Windows.Forms.MessageBox.Show(WarningMessage, StringResources.WarningMessageDialogCaption, MessageBoxButtons.OK, MessageBoxIcon.Warning);
    }

    private void ShowDetailedErrorMessageBox(string message, string details)
    {
      System.Windows.Forms.MessageBox.Show(message + "\n" + details, StringResources.ErrorMessageDialogCaption, MessageBoxButtons.OK, MessageBoxIcon.Error);
    }

    /// <summary>
    /// Get current view extent (in geographical coordinate system). 
    /// </summary>
    /// <remarks>
    /// If error occurred, exception would be thrown.
    /// </remarks>
    /// <returns>view extent as an envelope object</returns>
    private com.esri.gpt.csw.Envelope CurrentMapViewExtent()
    {
      com.esri.gpt.csw.Envelope envCurrentViewExent = null;
      ArcGIS.Core.Geometry.Envelope extent = null;

      if(MapView.Active != null)
      {
        extent = MapView.Active.Extent;
      }

      if (extent == null)
      {
        envCurrentViewExent.MinX = -180.0;
        envCurrentViewExent.MaxX =  180.0;
        envCurrentViewExent.MinY =  -90.0;
        envCurrentViewExent.MaxY =   90.0;
      }
      else
      {
        envCurrentViewExent.MinX = extent.XMin;
        envCurrentViewExent.MaxX = extent.XMax;
        envCurrentViewExent.MinY = extent.YMin;
        envCurrentViewExent.MaxY = extent.YMax;
      }

      return envCurrentViewExent;
    }

    private void deleteelements()
    {
      var map = MapView.Active.Map;
      var graphicsLayer = map.GetLayersAsFlattenedList().OfType<ArcGIS.Desktop.Mapping.GraphicsLayer>().FirstOrDefault();
      var elements = graphicsLayer.GetElementsAsFlattenedList().Where(e => e.IsVisible.Equals(true)); // .Name.StartsWith(""));
      QueuedTask.Run(() =>
      {
        graphicsLayer.SelectElements(elements);
        graphicsLayer.RemoveElements(graphicsLayer.GetSelectedElements());
      });
    }

    private string NormalizeFilename(string filename)
    {
      // Get a list of invalid file characters.
      char[] invalidFilenameChars = System.IO.Path.GetInvalidFileNameChars();

      // replace invalid characters with ' ' char
      for (int i = 0; i < invalidFilenameChars.GetLength(0); i++)
      {
        filename = filename.Replace(invalidFilenameChars[i], ' ');
      }
      return filename;
    }

    private void RetrieveAddToMapInfoFromCatalog()
    {
      try
      {
        // validate
        if (catalogComboBox.SelectedIndex == -1) { throw new Exception(StringResources.NoCatalogSelected); }
        if (resultsListBox.SelectedIndex == -1) { throw new Exception(StringResources.NoSearchResultSelected); }
        CswCatalog catalog = (CswCatalog)catalogComboBox.SelectedItem;
        if (catalog == null) { throw new NullReferenceException(StringResources.CswCatalogIsNull); }
        CswRecord record = (CswRecord)resultsListBox.SelectedItem;
        if (record == null) throw new NullReferenceException(StringResources.CswRecordIsNull);

        // connect to catalog if needed
        if (!catalog.IsConnected())
        {
          string errMsg = "";
          try { catalog.Connect(); }
          catch (Exception ex) { errMsg = ex.Message; }

          // exit if still not connected
          if (!catalog.IsConnected())
          {
            ShowErrorMessageBox(StringResources.ConnectToCatalogFailed + "\r\n" + errMsg);
          }
        }

        // retrieve metadata doc by its ID
        if (_searchRequest == null) { _searchRequest = new CswSearchRequest(); }
        _searchRequest.Catalog = catalog;
        try
        {
          _searchRequest.GetAddToMapInfoByID(record.ID);
          _mapServerUrl = _searchRequest.GetMapServerUrl();

        }
        catch (Exception ex)
        {
          ShowDetailedErrorMessageBox(StringResources.RetrieveMetadataFromCatalogFailed, _searchRequest.GetResponse().ResponseXML);
          System.Diagnostics.Trace.WriteLine(StringResources.RetrieveMetadataFromCatalogFailed);
          System.Diagnostics.Trace.WriteLine(ex.Message);
          System.Diagnostics.Trace.WriteLine(_searchRequest.GetResponse().ResponseXML);

        }

      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(StringResources.RetrieveMetadataFromCatalogFailed + "\r\n" + ex.Message);

      }
    }


    public static bool IsNumeric(string str)
    {
      int num = 0;
      if (Int32.TryParse(str, out num))
      {
        return true;
      }
      else
      {
        return false;
      }
    }

    private MapServiceInfo ParseServiceInfoFromMetadata(XmlDocument xmlDoc)
    {
      // note: some required node may missing if it isn't a metadata for liveData or map
      try
      {
        if (xmlDoc == null) { throw new ArgumentNullException(); }

        MapServiceInfo msi = new MapServiceInfo();

        XmlNamespaceManager xmlNamespaceManager = new XmlNamespaceManager(xmlDoc.NameTable);
        xmlNamespaceManager.AddNamespace("cat", "http://www.esri.com/metadata/csw/");
        xmlNamespaceManager.AddNamespace("csw", "http://www.opengis.net/cat/csw");
        xmlNamespaceManager.AddNamespace("gmd", "http://www.isotc211.org/2005/gmd");

        XmlNode nodeMetadata = xmlDoc.SelectSingleNode("//metadata|//cat:metadata|//csw:metadata|//gmd:MD_Metadata", xmlNamespaceManager);
        if (nodeMetadata == null) { throw new Exception(StringResources.MetadataNodeMissing); }

        // parse out service information
        XmlNode nodeEsri = nodeMetadata.SelectSingleNode("Esri");
        if (nodeEsri == null) throw new Exception(StringResources.EsriNodeMissing);

        // server
        XmlNode node = nodeEsri.SelectSingleNode("Server");
        if (node == null) throw new Exception(StringResources.ServerNodeMissing);
        msi.Server = node.InnerText;

        // service
        node = nodeEsri.SelectSingleNode("Service");
        if (node != null) { msi.Service = node.InnerText; }

        // service type
        node = nodeEsri.SelectSingleNode("ServiceType");
        if (node != null) { msi.ServiceType = node.InnerText; }

        // service param
        node = nodeEsri.SelectSingleNode("ServiceParam");
        if (node != null) { msi.ServiceParam = node.InnerText; }

        // issecured
        node = nodeEsri.SelectSingleNode("issecured");
        if (node != null) { msi.IsSecured = (node.InnerText.Equals("True", StringComparison.OrdinalIgnoreCase)); }

        return msi;
      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(StringResources.MapServiceInfoNotAvailable + "\r\n" + ex.Message);
        return null;
      }
    }

    private void AddMapServiceLayer(MapServiceInfo msi)
    {
      switch (msi.ServiceType.ToUpper())
      {
        case "WFS":
          AddLayerWFS(msi, false);
          break;
        case "WMS":
          AddLayerWMS(msi, false);
          break;
        case "WCS":
          AddLayerWCS(msi, false);
          break;
        default:
          AddLayerArcIMS(msi);
          break;
      }
    }

    private void AddLayerWCS(MapServiceInfo msi, Boolean fromServerUrl)
    {
      if (msi == null) { throw new ArgumentNullException(); }

      try
      {
        string _mapServerUrl = AppendQuestionOrAmpersandToUrlString(msi.Server);
        // append serviceParam to server url
        // todo: does msi.ServiceParam have a leading "?" or "&"?
        if (msi.ServiceParam.Length > 0 && !fromServerUrl)
        {
          _mapServerUrl = _mapServerUrl + msi.ServiceParam;
          _mapServerUrl = AppendQuestionOrAmpersandToUrlString(_mapServerUrl);
        }


        // MapServiceInfo msi = new MapServiceInfo();
        String[] s = _mapServerUrl.Trim().Split('?');

        _mapServerUrl = s[0] + "?request=GetCapabilities&service=WCS";
        CswClient client = new CswClient();
        String response = client.SubmitHttpRequest("GET", _mapServerUrl, "");

        XmlDocument xmlDocument = new XmlDocument();
        try { xmlDocument.LoadXml(response); }
        catch (XmlException xmlEx)
        { }

        XmlNodeList contentMetadata = xmlDocument.GetElementsByTagName("ContentMetadata");

        if (contentMetadata != null && contentMetadata.Count > 0)
        {
          XmlNodeList coverageList = contentMetadata.Item(0).ChildNodes;

          foreach (XmlNode coverage in coverageList)
          {

            XmlNodeList nodes = coverage.ChildNodes;

            foreach (XmlNode node in nodes)
            {
              if (node.Name.ToLower().Equals("name"))
              {
                _mapServerUrl = s[0] + "?request=GetCoverage&service=WCS&format=GeoTIFF&coverage=" + node.InnerText;

                try
                {
                  String filePath = client.SubmitHttpRequest("DOWNLOAD", _mapServerUrl, "");
                  AddAGSService(filePath);

                }
                catch (Exception e)
                {
                  ShowErrorMessageBox("WCS service with no GeoTiff interface");
                  return;
                }
              }
            }

          }

        }

      }

      catch (Exception ex)
      {
        //  ShowErrorMessageBox(StringResources.AddWcsLayerFailed + "\r\n" + ex.Message);
      }
    }

    private async void AddLayerWFS(MapServiceInfo msi, Boolean fromServerUrl)
    {
      if (msi == null) { throw new ArgumentNullException(); }

      try
      {
        string url = AppendQuestionOrAmpersandToUrlString(msi.Server);
        // append serviceParam to server url
        // todo: does msi.ServiceParam have a leading "?" or "&"?
        if (msi.ServiceParam.Length > 0 || !fromServerUrl)
        {
          url = url + msi.ServiceParam;
          url = AppendQuestionOrAmpersandToUrlString(url);
        }

                // TODO - select layer from WFS
                // for now, get the layer by index
                String dataset = getWFSLayer(0, url, msi.ServiceType, "2.0.0");

                CIMStandardDataConnection cIMStandardDataConnection = new CIMStandardDataConnection()
                {
                    WorkspaceConnectionString = @"SWAPXY=FALSE;SWAPXYFILTER=FALSE;URL=" + url + ";VERSION=2.0.0",
                    WorkspaceFactory = WorkspaceFactory.WFS,
                    Dataset = dataset,
                    DatasetType = esriDatasetType.esriDTFeatureClass
                };

        // Add a new layer to the map
        await QueuedTask.Run(() =>
        {
          Layer layer = LayerFactory.Instance.CreateLayer(cIMStandardDataConnection, MapView.Active.Map);
        });
      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(StringResources.AddWfsLayerFailed + "\r\n" + ex.Message);
      }
    }

        private String getWFSLayer(int layerIndex, String serviceUrl, String serviceType, String serviceVersion)
        {
            String dataset = "";

            try
            {
                String url = serviceUrl + "request=GetCapabilities&service=" + serviceType + "&version=" + serviceVersion;
                WebRequest request = WebRequest.Create(url);
                request.Method = "GET";
                WebResponse response = request.GetResponse();
                Stream dataStream = response.GetResponseStream();
                
                // Open the stream using a StreamReader for easy access.
                StreamReader reader = new StreamReader(dataStream);
                // Read the content.
                string responseFromServer = reader.ReadToEnd();
                // Display the content.
                Console.WriteLine(responseFromServer);

                // Close the response.
                response.Close();

                // Now parse GetCapabilities response to get the first layer
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(responseFromServer);

                XmlNamespaceManager nsmgr = new XmlNamespaceManager(xmlDoc.NameTable);
                nsmgr.AddNamespace("wfs", "http://www.opengis.net/wfs/2.0");
                string xpath = "//wfs:FeatureTypeList/wfs:FeatureType/wfs:Title";
                var featureTypeNames = xmlDoc.SelectNodes(xpath, nsmgr);
                foreach (XmlNode feautureTypeName in featureTypeNames)
                {
                    Console.WriteLine(feautureTypeName.InnerText);
                }

                dataset = featureTypeNames[0].InnerText; //"cities";
            }
            catch (Exception ex)
            {
                ShowErrorMessageBox("getWFSLayer ERROR: " + ex.Message);
                dataset = "";
            }

            return dataset;
        }

    private async void AddLayerWMS(MapServiceInfo msi, Boolean fromServerUrl)
    {
      if (msi == null) { throw new ArgumentNullException(); }

      try
      {
        string url = AppendQuestionOrAmpersandToUrlString(msi.Server);
        // append serviceParam to server url
        // todo: does msi.ServiceParam have a leading "?" or "&"?
        if (msi.ServiceParam.Length > 0 || !fromServerUrl)
        {
          url = url + msi.ServiceParam;
          url = AppendQuestionOrAmpersandToUrlString(url);
        }
        // Create a connection to the WMS server
        var serverConnection = new CIMInternetServerConnection { URL = url };
        var connection = new CIMWMSServiceConnection { ServerConnection = serverConnection };

        // Add a new layer to the map
        await QueuedTask.Run(() =>
        {
          var layer = LayerFactory.Instance.CreateLayer(connection, MapView.Active.Map);
        });
      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(StringResources.AddWmsLayerFailed + "\r\n" + ex.Message);
      }
    }

    private void AddLayerArcIMS(MapServiceInfo msi)
    {

    }

    private async void AddAGSService(string url)
    {
      try
      {
        Map map = MapView.Active.Map;

        bool isAlreadyInMap = false;

        if (isAlreadyInMap)
        {
          ShowErrorMessageBox(StringResources.MapServiceLayerAlreadyExistInMap);
          return;
        }
        else
        {

          Uri uri = new Uri(url);
          await QueuedTask.Run(() => LayerFactory.Instance.CreateLayer(uri, MapView.Active.Map));
        }
      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(StringResources.AddArcGISLayerFailed + "\r\n" + ex.Message);
      }
    }

    private void drawfootprint(CswRecord record, bool refreshview, bool deleteelements)
    {
      var gl_param = new GraphicsLayerCreationParams { Name = "Metadata Footprints" };
      var map = MapView.Active.Map;
            var graphicsLayer = this._graphicsLayer; // map.GetLayersAsFlattenedList().OfType<ArcGIS.Desktop.Mapping.GraphicsLayer>().FirstOrDefault();

      QueuedTask.Run(() =>
      {
        if (this._graphicsLayer == null)
        {
          graphicsLayer = LayerFactory.Instance.CreateLayer<ArcGIS.Desktop.Mapping.GraphicsLayer>(gl_param, map);
              this._graphicsLayer = graphicsLayer;
        } else
          {
              graphicsLayer = this._graphicsLayer;
          }
        MapPoint lowerLeft = MapPointBuilder.CreateMapPoint(record.BoundingBox.Minx, record.BoundingBox.Miny, SpatialReferences.WGS84);
        MapPoint upperRightLeft = MapPointBuilder.CreateMapPoint(record.BoundingBox.Maxx, record.BoundingBox.Maxy, SpatialReferences.WGS84);

        Polygon polygon = PolygonBuilder.CreatePolygon(EnvelopeBuilder.CreateEnvelope(lowerLeft, upperRightLeft));
        CIMSymbol polygonSymbol = SymbolFactory.Instance.ConstructPolygonSymbol(CIMColor.CreateRGBColor(255, 255, 0, 0.1));
        CIMPolygonGraphic metadataFootprint = new CIMPolygonGraphic
        {
          Polygon = polygon, //MapPoint
          Symbol = new CIMSymbolReference() { Symbol = polygonSymbol }
        };
        //Magic happens...Add all the features to the Graphics layer 
        graphicsLayer.AddElement(metadataFootprint);
      });
    }

    private BoundingBox updatedExtent(BoundingBox currentExtent, BoundingBox footprintExtent)
    {
      double xmax = currentExtent.Maxx;
      double xmin = currentExtent.Minx;
      double ymin = currentExtent.Miny;
      double ymax = currentExtent.Maxy;

      double bxmax = footprintExtent.Maxx;
      double bxmin = footprintExtent.Minx;
      double bymin = footprintExtent.Miny;
      double bymax = footprintExtent.Maxy;
      double rxmax = 0.0, rxmin = 0.0, rymax = 0.0, rymin = 0.0;
      if (xmax > bxmax)
      {
        rxmax = xmax;
      }
      else
      {
        rxmax = bxmax;
      }
      if (xmin < bxmin)
      {
        rxmin = xmin;
      }
      else
      {
        rxmin = bxmin;
      }
      if (ymax > bymax)
      {
        rymax = ymax;
      }
      else
      {
        rymax = bymax;
      }
      if (ymin < bymin)
      {
        rymin = ymin;
      }
      else
      {
        rymin = bymin;
      }
      BoundingBox newExtent = new BoundingBox();
      newExtent.Maxx = rxmax;
      newExtent.Maxy = rymax;
      newExtent.Minx = rxmin;
      newExtent.Miny = rymin;

      return newExtent;
    }
    #endregion

    private void ViewMetadata_Clicked(object sender, RoutedEventArgs e)
    {
            string tmpFilePath = "";

            try
            {
        System.Windows.Forms.Cursor.Current = Cursors.WaitCursor;

        CswRecord record = (CswRecord)(resultsListBox.SelectedItem);

        CswCatalog catalog = (CswCatalog)catalogComboBox.SelectedItem;
        if (catalog.Profile.isOGCRecords)
                {
                    // OGC Records metadata view is an HTML rendering of the item
                    tmpFilePath = catalog.URL + "/" + record.ID + "?f=html";
                }
                else
                {

                // retrieve metadata
                XmlDocument xmlDoc = RetrieveSelectedMetadataFromCatalog(true);
                if (xmlDoc == null && styledRecordResponse == null) return;

                if (xmlDoc != null && styledRecordResponse == null)
                {
                  // display metadata in XML format
                  tmpFilePath = GenerateTempFilename("Meta", "xml");
                  XmlWriter xmlWriter = new XmlTextWriter(tmpFilePath, Encoding.UTF8);
                  XmlNode binaryNode = xmlDoc.GetElementsByTagName("Binary")[0];
                  if (binaryNode != null)
                  {
                    XmlNode enclosureNode = xmlDoc.GetElementsByTagName("Enclosure")[0];
                    if (enclosureNode != null)
                      binaryNode.RemoveChild(enclosureNode);
                  }

                  String outputStr = xmlDoc.InnerXml.Replace("utf-16", "utf-8");
                  xmlWriter.WriteRaw(outputStr);
                  xmlWriter.Close();
                }
                else if (xmlDoc == null && styledRecordResponse != null
                    && styledRecordResponse.Trim().Length > 0)
                {
                    // display metadata in XML format
                    tmpFilePath = GenerateTempFilename("Meta", "html");
                    FileInfo fileInfo = new FileInfo(tmpFilePath);
                    System.IO.FileStream fileStream = fileInfo.Create();
                    StreamWriter sr = new StreamWriter(fileStream);
                    sr.Write(styledRecordResponse);
                    sr.Close();
                    fileStream.Close();
                    styledRecordResponse = null;
                }
                }

                // pop up a metadata viwer displaying the metadata as HTML
                FormViewMetadata frmViewMetadata = new FormViewMetadata();
                frmViewMetadata.FormClosed += new FormClosedEventHandler(RemoveTempFileAfterMetadataViewerClosed);
                frmViewMetadata.MetadataTitle = record.Title;
                // frmViewMetadata.WindowState = FormWindowState.Maximized;
                frmViewMetadata.Navigate(tmpFilePath);
                frmViewMetadata.Show();
                frmViewMetadata.Activate();

                // note: temp file will be deleted when metadata viwer closes. 
                //       see "RemoveTempFileAfterMetadataViewerClosed()"
            }
            catch (Exception ex)
            {
                ShowErrorMessageBox(ex.Message);

            }
            finally
            {
                styledRecordResponse = null;
                System.Windows.Forms.Cursor.Current = Cursors.Default;
            }
    }

    private void ResultsListBox_SelectedIndexChanged(object sender, SelectionChangedEventArgs e)
    {
      System.Windows.Forms.Cursor.Current = Cursors.WaitCursor;
      CswCatalog catalog = (CswCatalog)catalogComboBox.SelectedItem;
      if (catalog == null) { throw new NullReferenceException(StringResources.CswCatalogIsNull); }
      // update GUI
      CswRecord record = (CswRecord)resultsListBox.SelectedItem;
      if (record == null)
      {
        // no record selected
        abstractTextBox.Text = "";

        // GUI update for buttons
        addToMapToolStripButton.IsEnabled = false;
        viewMetadataToolStripButton.IsEnabled = false;
        downloadMetadataToolStripButton.IsEnabled = false;
        displayFootprinttoolStripButton.IsEnabled = false;
        zoomtoFootprintToolStripButton.IsEnabled = false;
        showAllFootprintToolStripButton.IsEnabled = catalog.Profile.SupportSpatialBoundary;
        clearAllFootprinttoolStripButton.IsEnabled = catalog.Profile.SupportSpatialBoundary;

      }
      else
      {
        if (record.BoundingBox.Maxx != NONEXSISTANTNUMBER)
        {
          displayFootprinttoolStripButton.IsEnabled = true;
          zoomtoFootprintToolStripButton.IsEnabled = true;
        }
        else
        {
          displayFootprinttoolStripButton.IsEnabled = false;
          zoomtoFootprintToolStripButton.IsEnabled = false;

        }
        abstractTextBox.Text = record.Abstract;
        addToMapToolStripButton.IsEnabled = record.IsLiveDataOrMap;
        viewMetadataToolStripButton.IsEnabled = true;
        downloadMetadataToolStripButton.IsEnabled = true;

        showAllFootprintToolStripButton.IsEnabled = catalog.Profile.SupportSpatialBoundary;
        clearAllFootprinttoolStripButton.IsEnabled = catalog.Profile.SupportSpatialBoundary;


      }

      System.Windows.Forms.Cursor.Current = Cursors.Default;
    }

    private void downloadMetadataToolStripButton_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        System.Windows.Forms.Cursor.Current = Cursors.WaitCursor;

        // retrieve metadata
        XmlDocument xmlDoc = RetrieveSelectedMetadataFromCatalog(false);
        if (xmlDoc == null) return;

        System.Windows.Forms.Cursor.Current = Cursors.Default;

        // save to file
        SaveFileDialog saveFileDialog = new SaveFileDialog();
        saveFileDialog.Filter = StringResources.XmlFilesFilter;
        saveFileDialog.FileName = NormalizeFilename(((CswRecord)resultsListBox.SelectedItem).Title);
        saveFileDialog.DefaultExt = "xml";
        saveFileDialog.Title = StringResources.DownloadMetadataCaption;
        saveFileDialog.CheckFileExists = false;
        saveFileDialog.OverwritePrompt = true;
        if (saveFileDialog.ShowDialog() == DialogResult.Cancel) return;
        if (saveFileDialog.FileName.Length > 0)
        {
          System.Windows.Forms.Cursor.Current = Cursors.WaitCursor;
          try
          {

            XmlNode binaryNode = xmlDoc.GetElementsByTagName("Binary")[0];

            if (binaryNode != null)
            {
              XmlNode enclosureNode = xmlDoc.GetElementsByTagName("Enclosure")[0];

              if (enclosureNode != null)
                binaryNode.RemoveChild(enclosureNode);
            }

            xmlDoc.Save(saveFileDialog.FileName);
            System.Windows.Forms.MessageBox.Show(StringResources.FileSaveSucceed, StringResources.DownloadMetadataCaption, MessageBoxButtons.OK, MessageBoxIcon.Information);
          }
          catch (Exception ex)
          {
            System.Windows.Forms.MessageBox.Show(StringResources.FileSaveFailed + "\r\n" + ex.Message, StringResources.DownloadMetadataCaption, MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
          }
          finally
          {
            System.Windows.Forms.Cursor.Current = Cursors.Default;
          }
        }
      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(ex.Message);
      }
      finally
      {
        System.Windows.Forms.Cursor.Current = Cursors.Default;
      }
    }

    private void addToMapToolStripButton_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        System.Windows.Forms.Cursor.Current = Cursors.WaitCursor;

        CswRecord record = (CswRecord)resultsListBox.SelectedItem;
        if (record == null) throw new NullReferenceException(StringResources.CswRecordIsNull);

        if (record.MapServerURL == null || record.MapServerURL.Trim().Length == 0)
        {
          // retrieve metadata
          RetrieveAddToMapInfoFromCatalog();
        }
        else
        {
          _mapServerUrl = record.MapServerURL;

        }

        if (_mapServerUrl != null && _mapServerUrl.Trim().Length > 0)
        {

          String serviceType = record.ServiceType;
          if (serviceType == null || serviceType == "unknown" || serviceType.Length == 0)
          {
            serviceType = CswProfile.getServiceType(_mapServerUrl);
          }
          if (serviceType.Equals("unknown"))
          {
            System.Diagnostics.Process.Start("IExplore", _mapServerUrl);
            System.Windows.Forms.Cursor.Current = Cursors.Default;
            return;
          }
          else if (serviceType.Equals("ags"))
          {
            if (_mapServerUrl.ToLower().Contains("arcgis/rest"))
            {
              var urlparts = _mapServerUrl.Split('/');
              if (urlparts != null && urlparts.Length > 0)
              {
                var lastPartOfUrl = urlparts[urlparts.Length - 1];
                if (lastPartOfUrl.Length > 0 && IsNumeric(lastPartOfUrl))
                {
                  // CswClient client = new CswClient();
                  AddAGSService(_mapServerUrl);
                }
                else
                {
                  _mapServerUrl = _mapServerUrl + "?f=lyr";
                  CswClient client = new CswClient();
                  AddAGSService(client.SubmitHttpRequest("DOWNLOAD", _mapServerUrl, ""));
                }
              }
            }
            else
            {
              AddAGSService(_mapServerUrl);
            }
          }
          else if (serviceType.Equals("wms"))
          {
            MapServiceInfo msinfo = new MapServiceInfo();
            msinfo.Server = record.MapServerURL;
            msinfo.Service = record.ServiceName;
            msinfo.ServiceType = record.ServiceType;
            CswProfile.ParseServiceInfoFromUrl(msinfo, _mapServerUrl, serviceType);
            AddLayerWMS(msinfo, true);
          }
            else if (serviceType.Equals("wfs"))
            {
                MapServiceInfo msinfo = new MapServiceInfo();
                msinfo.Server = record.MapServerURL;
                msinfo.Service = record.ServiceName;
                msinfo.ServiceType = record.ServiceType;
                CswProfile.ParseServiceInfoFromUrl(msinfo, _mapServerUrl, serviceType);
                AddLayerWFS(msinfo, true);
            }
            else if (serviceType.Equals("aims"))
          {
            MapServiceInfo msinfo = new MapServiceInfo();
            msinfo.Server = record.MapServerURL;
            msinfo.Service = record.ServiceName;
            msinfo.ServiceType = record.ServiceType;
            CswProfile.ParseServiceInfoFromUrl(msinfo, _mapServerUrl, serviceType);
            AddLayerArcIMS(msinfo);
          }
          else if (serviceType.Equals("wcs"))
          {
            // MapServiceInfo msi = new MapServiceInfo();
            String[] s = _mapServerUrl.Trim().Split('?');

            _mapServerUrl = s[0] + "?request=GetCapabilities&service=WCS";
            CswClient client = new CswClient();
            String response = client.SubmitHttpRequest("GET", _mapServerUrl, "");

            XmlDocument xmlDocument = new XmlDocument();
            try { xmlDocument.LoadXml(response); }
            catch (XmlException xmlEx)
            { }

            XmlNodeList contentMetadata = xmlDocument.GetElementsByTagName("ContentMetadata");

            if (contentMetadata != null && contentMetadata.Count > 0)
            {
              XmlNodeList coverageList = contentMetadata.Item(0).ChildNodes;

              foreach (XmlNode coverage in coverageList)
              {

                XmlNodeList nodes = coverage.ChildNodes;

                foreach (XmlNode node in nodes)
                {
                  if (node.Name.ToLower().Equals("name"))
                  {
                    _mapServerUrl = s[0] + "?request=GetCoverage&service=WCS&format=GeoTIFF&coverage=" + node.InnerText;

                    try
                    {
                      String filePath = client.SubmitHttpRequest("DOWNLOAD", _mapServerUrl, "");
                      AddAGSService(filePath);

                    }
                    catch (Exception ee)
                    {
                      ShowErrorMessageBox(StringResources.wcsWithNoGeoTiffInterface);
                      return;
                    }
                  }
                }

              }
            }
            else
            {
              ShowErrorMessageBox(StringResources.serviceTypeUnknown);
              return;
            }
          }
        }
      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(ex.Message);
      }
      finally
      {
        System.Windows.Forms.Cursor.Current = Cursors.Default;
      }
    }

    private void displayFootprinttoolStripButton_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        System.Windows.Forms.Cursor.Current = Cursors.WaitCursor;
        CswRecord record = (CswRecord)(resultsListBox.SelectedItem);

        MapView mapView = MapView.Active;
        Map map = MapView.Active.Map;

        BoundingBox currentExtent = new BoundingBox();
        currentExtent.Maxx = mapView.Extent.XMax;
        currentExtent.Minx = mapView.Extent.XMin;
        currentExtent.Maxy = mapView.Extent.YMax;
        currentExtent.Miny = mapView.Extent.YMin;
        BoundingBox newExtent = currentExtent;

        //drawfootprint(record, false, false);
        newExtent = updatedExtent(currentExtent, record.BoundingBox);

        //zoom to extent of the footprint
        List<MapPoint> points = new List<MapPoint>
          {
            MapPointBuilder.CreateMapPoint(newExtent.Minx, newExtent.Maxy),
            MapPointBuilder.CreateMapPoint(newExtent.Maxx, newExtent.Maxy),
            MapPointBuilder.CreateMapPoint(newExtent.Maxx, newExtent.Miny),
            MapPointBuilder.CreateMapPoint(newExtent.Minx, newExtent.Miny)
          };
        Polygon polygon = PolygonBuilder.CreatePolygon(points, SpatialReferences.WGS84);

        mapView.ZoomTo(polygon);
      }
      catch (Exception ex)
      {

        ShowErrorMessageBox(ex.Message);
      }
      finally
      {
        System.Windows.Forms.Cursor.Current = Cursors.Default;
      }
    }

    private void zoomtoFootprintToolStripButton_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        System.Windows.Forms.Cursor.Current = Cursors.WaitCursor;
        CswRecord record = (CswRecord)(resultsListBox.SelectedItem);
        drawfootprint(record, true, true);

      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(ex.Message);
      }
      finally
      {
        System.Windows.Forms.Cursor.Current = Cursors.Default;
      }
    }

    private void showAllFootprintToolStripButton_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        System.Windows.Forms.Cursor.Current = Cursors.WaitCursor;
        MapView mapView = MapView.Active;
        Map map = MapView.Active.Map;

        BoundingBox currentExtent = new BoundingBox();
        currentExtent.Maxx = mapView.Extent.XMax;
        currentExtent.Minx = mapView.Extent.XMin;
        currentExtent.Maxy = mapView.Extent.YMax;
        currentExtent.Miny = mapView.Extent.YMin;
        BoundingBox newExtent = currentExtent;
        if (showAll)
        {
          showAll = false;
          System.Windows.Forms.ToolTip toolTipForshowAll = new System.Windows.Forms.ToolTip();
          showAllFootprintToolStripButton.ToolTip = StringResources.hideAllFootprintTooltip;
          //imgShowAllFootprints.Source = new BitmapImage(new Uri(@"pack://application:,,,/Images/hideAll.gif"));

          foreach (Object obj in resultsListBox.Items)
          {
            currentExtent = newExtent;
            CswRecord record = (CswRecord)obj;
            if (record.BoundingBox.Maxx != NONEXSISTANTNUMBER)
            {
              drawfootprint(record, true, false);
              newExtent = updatedExtent(currentExtent, record.BoundingBox);
            }
          }

          List<MapPoint> points = new List<MapPoint>
          {
            MapPointBuilder.CreateMapPoint(newExtent.Minx, newExtent.Maxy),
            MapPointBuilder.CreateMapPoint(newExtent.Maxx, newExtent.Maxy),
            MapPointBuilder.CreateMapPoint(newExtent.Maxx, newExtent.Miny),
            MapPointBuilder.CreateMapPoint(newExtent.Minx, newExtent.Miny)
          };
          Polygon polygon = PolygonBuilder.CreatePolygon(points, SpatialReferences.WGS84);

          mapView.ZoomTo(polygon);

          var graphicsLayer = map.GetLayersAsFlattenedList().OfType<ArcGIS.Desktop.Mapping.GraphicsLayer>().FirstOrDefault();
          QueuedTask.Run(() =>
          {
            graphicsLayer.ClearSelection();
          });       
        }
        else
        {
          showAll = true;
          showAllFootprintToolStripButton.ToolTip = StringResources.showAllFootPrintToolTip;
          //imgShowAllFootprints.Source = new BitmapImage(new Uri(@"pack://application:,,,/Images/showAll.gif"));

          deleteelements();
        }
      }
      catch (Exception ex)
      {

        ShowErrorMessageBox(ex.Message);
      }
      finally
      {
        System.Windows.Forms.Cursor.Current = Cursors.Default;
      }
    }

    private void clearAllFootprinttoolStripButton_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        System.Windows.Forms.Cursor.Current = Cursors.WaitCursor;
        deleteelements();
        showAll = true;

        showAllFootprintToolStripButton.ToolTip = StringResources.showAllFootPrintToolTip;
        imgShowAllFootprints.Source = new BitmapImage(new Uri(@"Images/showAll.gif"));
      }
      catch (Exception ex)
      {
        ShowErrorMessageBox(ex.Message);
      }
      finally
      {
        System.Windows.Forms.Cursor.Current = Cursors.Default;
      }
    }

    private void searchPhraseTextBox_KeyDown(object sender, System.Windows.Input.KeyEventArgs e)
    {
      if (e.Key == System.Windows.Input.Key.Return)
      {
        FindButton_Click(sender, e);
      }
    }

    private void catalogDisplayNameTextBox_TextChanged(object sender, TextChangedEventArgs e)
    {
      saveCatalogButton.IsEnabled = (catalogUrlTextBox.Text.Length > 0);
    }

    private void catalogUrlTextBox_TextChanged(object sender, TextChangedEventArgs e)
    {
      saveCatalogButton.IsEnabled = (catalogUrlTextBox.Text.Length > 0);
    }

    private void catalogProfileComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
      saveCatalogButton.IsEnabled = (catalogUrlTextBox.Text.Length > 0);
    }

    private void TabItem_GotFocus(object sender, RoutedEventArgs e)
    {
      if (_inited && _isCatalogListDirty)
      {
        catalogComboBox.ItemsSource = catalogListBox.ItemsSource;
        catalogComboBox.DisplayMemberPath = catalogListBox.DisplayMemberPath;
        catalogComboBox.SelectedValuePath = catalogListBox.SelectedValuePath;

        _isCatalogListDirty = false;
      }
    }

    private void tabControl_SizeChanged(object sender, SizeChangedEventArgs e)
    {
      Console.WriteLine("tabControl_SizeChanged size change " + e.ToString());
    }

    private void dockPanel_SizeChanged(object sender, SizeChangedEventArgs e)
    {
      Console.WriteLine("dockPanel_SizeChanged size change " + e.ToString());
    }

    private void userControl_SizeChanged(object sender, SizeChangedEventArgs e)
    {
      Console.WriteLine("userControl_SizeChanged size change " + e.ToString());

      if (e.WidthChanged)
      {
        int delta = (int)(e.NewSize.Width - e.PreviousSize.Width);
        dockPanel.Width = e.NewSize.Width; // this.dockPanel.Width + delta;
        tabControl.Width = e.NewSize.Width;
        //this.gridControl.Width = this.gridControl.ActualWidth + delta;
      }
    }
  }
}
