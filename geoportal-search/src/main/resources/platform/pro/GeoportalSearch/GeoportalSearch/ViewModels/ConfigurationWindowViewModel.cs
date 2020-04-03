using ArcGIS.Desktop.Core;
using ArcGIS.Desktop.Framework;
using ArcGIS.Desktop.Framework.Dialogs;
using Newtonsoft.Json;
using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;

namespace GeoportalSearch
{
	/// <summary>
	/// A ViewModel for showing a list of configurations
	/// </summary>
	internal class ConfigurationsWindowViewModel : INotifyPropertyChanged
	{
		#region Constants
		private const string JSON_FILE_NAME = "GeoportalConfigurations.json";
		#endregion

		#region Properties
		private bool _saved;
		/// <summary>
		/// A check to see if the configurations have been saved
		/// </summary>
		private bool Saved
		{
			get { return _saved; }
			set
			{
				if (_saved != value)
				{
					_saved = value;
				}
				if (value == false)
				{
					SavedVisible = false;
				}
			}
		}

		private ObservableCollection<ConfigurationViewModel> _configurations;
		/// <summary>
		/// A collection of Configuration ViewModels
		/// </summary>
		public ObservableCollection<ConfigurationViewModel> Configurations
		{
			get { return _configurations; }
			set
			{
				Saved = false;
				_configurations = value;
				OnPropertyChanged(nameof(Configurations));
			}
		}

		private bool _savedVisible = false;
		/// <summary>
		/// A boolean that controls the visibility of the "Saved" text
		/// </summary>
		public bool SavedVisible
		{
			get { return _savedVisible; }
			set
			{
				_savedVisible = value;
				OnPropertyChanged(nameof(SavedVisible));
			}
		}
		#endregion

		#region Commands
		/// <summary>
		/// A command for the Add button
		/// </summary>
		public ICommand AddConfigurationCommand { get; set; }
		/// <summary>
		/// A command for the Delete Configuration button
		/// </summary>
		public ICommand DeleteConfigurationCommand { get; set; }
		/// <summary>
		/// A command for the save command
		/// </summary>
		public ICommand SaveConfigurationCommand { get; set; }
		#endregion

		#region Constructor
		/// <summary>
		/// Default Constructor
		/// </summary>
		public ConfigurationsWindowViewModel()
		{
			AddConfigurationCommand = new RelayCommand((Action)AddNewConfiguration);
			SaveConfigurationCommand = new RelayCommand((Action)SaveConfiguration);

			// Read the settings from the file if the user is authorized to do so.
			// If they aren't authorized read the settings from Pro's built in settings
			if (GeoportalModule.Current.Authorized)
			{
				if (File.Exists(GeoportalModule.Current.ConfigurationsFilePath))
				{
					using (var reader = new StreamReader(GeoportalModule.Current.ConfigurationsFilePath))
					{
						var jsonStr = reader.ReadToEnd();
						Configurations = JsonConvert.DeserializeObject<ObservableCollection<ConfigurationViewModel>>(jsonStr) ?? new ObservableCollection<ConfigurationViewModel>();
					}
				}
				else
				{
					Configurations = new ObservableCollection<ConfigurationViewModel>();
				}
			}
			else
			{
				if (GeoportalModule.Current.Configurations != null)
				{
					Configurations = JsonConvert.DeserializeObject<ObservableCollection<ConfigurationViewModel>>(GeoportalModule.Current.Configurations) ?? new ObservableCollection<ConfigurationViewModel>();
				}
				else
				{
					Configurations = new ObservableCollection<ConfigurationViewModel>();
				}
			}

			foreach (var configuration in Configurations)
			{
				configuration.ConfigurationDeletedEvent += Configuration_ConfigurationDeletedEvent;
			}
			ConfigurationViewModel.EditEvent += Configuration_EditEvent;
			Saved = true;
		}
		#endregion

		#region Event Handlers
		/// <summary>
		/// Called when an edit on a configuration occurs
		/// </summary>
		private void Configuration_EditEvent()
		{
			Saved = false;
		}

		/// <summary>
		/// Deletes the given <see cref="ConfigurationViewModel"/>
		/// </summary>
		/// <param name="configuration">The configuration to be removed</param>
		private void Configuration_ConfigurationDeletedEvent(ConfigurationViewModel configuration)
		{
			Configurations.Remove(configuration);
			Saved = false;
			configuration.ConfigurationDeletedEvent -= Configuration_ConfigurationDeletedEvent;
		}

		/// <summary>
		/// Called when the view is about to close and returns false if it should be closed.
		/// </summary>
		/// <returns>Returns true if it should not be closed and false if it should be closed</returns>
		public bool WindowClosingEvent()
		{
			if (!Saved)
			{
				var result = MessageBox.Show("You have unsaved changes. Would you like to save them now?", "Unsaved Changes", System.Windows.MessageBoxButton.YesNoCancel, System.Windows.MessageBoxImage.Question);
				if (result == System.Windows.MessageBoxResult.Yes)
				{
					SaveConfiguration();
					return false;
				}
				else if (result == System.Windows.MessageBoxResult.No)
				{
					return false;
				}
				else if (result == System.Windows.MessageBoxResult.Cancel)
				{
					return true;
				}
			}
			return false;
		}

		/// <summary>
		/// An event that is called when a property is changed.
		/// </summary>
		public event PropertyChangedEventHandler PropertyChanged = (sender, e) => { };
		/// <summary>
		/// Invokes the PropertyChangedEventHandler on the given property
		/// </summary>
		/// <param name="propertyName">The property that has been changed</param>
		private void OnPropertyChanged(string propertyName)
		{
			PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
		}
		#endregion

		#region Private Methods
		/// <summary>
		/// Adds a new Configuration
		/// </summary>
		private void AddNewConfiguration()
		{
			var configurationViewModel = new ConfigurationViewModel();
			Configurations.Add(configurationViewModel);
			configurationViewModel.ConfigurationDeletedEvent += Configuration_ConfigurationDeletedEvent;
			Saved = false;
		}

		/// <summary>
		/// Saves the configurations
		/// </summary>
		private async void SaveConfiguration()
		{
			// Convert our ConfigurationViewModels to Configurations
			var configurations = Configurations.Select(configuration => new Configuration
			{
				name = configuration.name,
				type = configuration.type,
				url = configuration.url,
				profile = configuration.profile,
				requiredFilter = configuration.requiredFilter,
				enabled = configuration.enabled,
				useProxy = configuration.useProxy,
				disableContentType = configuration.disableContentType
			});
			// Convert the configurations into a json string
			GeoportalModule.Current.Configurations = await Task.Run(() => JsonConvert.SerializeObject(configurations));
			if (GeoportalModule.Current.Authorized)
			{
				if (!File.Exists(GeoportalModule.Current.ConfigurationsFilePath))
				{
					File.Create(GeoportalModule.Current.ConfigurationsFilePath);
				}
				using (var writer = new StreamWriter(GeoportalModule.Current.ConfigurationsFilePath))
				{
					await writer.WriteAsync(GeoportalModule.Current.Configurations);
				}
			}

			// Set the project as dirty (unsaved)
			Project.Current.SetDirty();
			Saved = true;
			SavedVisible = true;
		}
		#endregion
	}
}
