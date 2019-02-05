using ArcGIS.Desktop.Framework;
using System;
using System.ComponentModel;
using System.Windows.Input;

namespace GeoportalSearch
{
	internal class ConfigurationViewModel : INotifyPropertyChanged
	{
		#region Events
		internal event Action<ConfigurationViewModel> ConfigurationDeletedEvent;
		internal static event Action EditEvent;
		#endregion

		#region Properties
		private string _name;
		public string name
		{
			get { return _name; }
			set
			{
				_name = value;
				OnPropertyChanged(nameof(name));
			}
		}

		private string _url;
		public string url
		{
			get { return _url; }
			set
			{
				_url = value;
				OnPropertyChanged(nameof(url));
			}
		}

		private string _type;
		public string type
		{
			get { return _type; }
			set
			{
				_type = value;
				OnPropertyChanged(nameof(type));
			}
		}

		private string _profile;
		public string profile
		{
			get { return _profile; }
			set
			{
				_profile = value;
				OnPropertyChanged(nameof(profile));
			}
		}

		private string _requiredFilter;
		public string requiredFilter
		{
			get { return _requiredFilter; }
			set
			{
				_requiredFilter = value;
				OnPropertyChanged(nameof(requiredFilter));
			}
		}

		private bool _enabled;
		public bool enabled
		{
			get { return _enabled; }
			set
			{
				_enabled = value;
				OnPropertyChanged(nameof(enabled));
			}
		}

		private bool _useProxy;
		public bool useProxy
		{
			get { return _useProxy; }
			set
			{
				_useProxy = value;
				OnPropertyChanged(nameof(useProxy));
			}
		}

		private bool _disabledContentType;
		public bool disableContentType
		{
			get { return _disabledContentType; }
			set
			{
				_disabledContentType = value;
				OnPropertyChanged(nameof(disableContentType));
			}
		}
		#endregion

		#region Commands
		public ICommand DeleteConfigurationCommand { get; set; }
		#endregion

		#region Constructors
		internal ConfigurationViewModel()
		{
			DeleteConfigurationCommand = new RelayCommand((Action)DeleteConfiguration);
		}
		#endregion

		#region Property Changed Events
		public event PropertyChangedEventHandler PropertyChanged = (sender, e) => { };
		private void OnPropertyChanged(string propertyName)
		{
			PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
			EditEvent?.Invoke();
		}
		#endregion

		#region Private Functions
		private void DeleteConfiguration()
		{
			ConfigurationDeletedEvent?.Invoke(this);
		}
		#endregion
	}
}
