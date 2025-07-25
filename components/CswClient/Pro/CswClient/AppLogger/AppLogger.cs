/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Collections;
using System.Windows;
using com.esri.gpt.csw;
using System.Web;
using System.Security;


namespace com.esri.gpt.logger
{
    /// <summary>
    /// Log application message to log file
    /// </summary>
    public class AppLogger
    {
        /// <summary>
        /// instance variable
        /// </summary>
        private string logFolder = null;
        private bool debug = false;
        private int maxFileSize = -1;
        private string dataFolder = null;
        private string xsltPath = null;
        #region Properties
        /// <summary>
        /// DataFolder variable
        /// </summary>
        public string DataFolder
        {
            get
            {
                return dataFolder;
            }
            set
            {
                dataFolder = value;
            }
        }
        /// <summary>
        /// XsltPath
        /// </summary>
        public string XsltPath
        {
            get
            {
                return xsltPath;
            }
            set
            {
                xsltPath = value;
            }
        }
        #endregion
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configName">configuration file name</param>
        public AppLogger(String configName)
        {
            String[] fStream = null;
            String p = "";
            try
            {
                try
                {
                    p = configName + ".properties";
                    var propertiesFile = Utils.GetSpecialFolderPath(SpecialFolder.ExecutingAssembly) + "\\Config\\CswClient.properties";
                    Console.WriteLine("propertiesFile = " + propertiesFile);
                    fStream = File.ReadAllLines(propertiesFile);
                }
                catch (IOException io)
                {
                    try
                    {
                        fStream = File.ReadAllLines(configName + ".properties");
                    }
                    catch (IOException ioe)
                    {
                        MessageBox.Show("Could not find " + configName + ".properties file at path " + p, "File Not Found Error",
                                            MessageBoxButton.OK, MessageBoxImage.Exclamation);
                    }
                }
                if (fStream != null && fStream.Length > 0)
                {
                    String logFilePath = fStream[0];
                    String maxSize = fStream[1];
                    String debugFlag = fStream[2];
                    if (logFilePath != null)
                    {
                        logFolder = logFilePath.Substring(logFilePath.IndexOf("=") + 1).Replace("..", ""); // don't allow relative paths
                    }
                    if (maxSize != null)
                    {
                        maxFileSize = int.Parse(maxSize.Substring(maxSize.IndexOf("=") + 1));
                    }
                    if (debugFlag != null && debugFlag.Trim().Equals("debug=on", StringComparison.CurrentCultureIgnoreCase))
                    {
                        debug = true;
                    }
                    if (configName.Trim().Equals("cswclient", StringComparison.InvariantCultureIgnoreCase))
                    {
                        // MH - modified to include profiles in the addin itself
                        dataFolder = Utils.GetSpecialFolderPath(SpecialFolder.ExecutingAssembly) + "/Config/profiles";
                    }
                }
            }
            finally
            {
            }
        }

        /// <summary>
        /// Writes log message
        /// </summary>
        /// <param name="logMessage">message to log</param>
        public void writeLog(String logMessage)
        {
            System.IO.FileStream fileStream = null;
            System.IO.StreamWriter sr = null;
            try
            {
                String sanitizedFolder = logFolder.Replace("..", "");
                if (debug)
                {
                    System.IO.FileInfo fileInfo = new System.IO.FileInfo(sanitizedFolder);
                    if (fileInfo.Exists && (fileInfo.Length + logMessage.Length) <= maxFileSize)
                    {
                        sr = fileInfo.AppendText();
                    }
                    else
                    {
                        if (fileInfo.Exists)
                        {
                            DateTime dt = DateTime.Now;
                            fileInfo.CopyTo(sanitizedFolder + "_" + dt.Hour + "_" + dt.Minute + "_" + dt.Second, true);
                            fileStream = fileInfo.Open(FileMode.Truncate);
                            fileStream.Close();
                        }
                        fileStream = fileInfo.Open(System.IO.FileMode.OpenOrCreate, System.IO.FileAccess.Write);
                        sr = new System.IO.StreamWriter(fileStream);
                    }
                    string safeString = SecurityElement.Escape(logMessage);
                    sr.WriteLine(safeString);
                }
            }
            finally
            {
                if (sr != null)
                    sr.Close();
                if (fileStream != null)
                    fileStream.Close();
            }
        }
    }
}
