
namespace GeoportalSearch
{
  partial class FormViewMetadata
  {
    /// <summary>
    /// Required designer variable.
    /// </summary>
    private System.ComponentModel.IContainer components = null;

    /// <summary>
    /// Clean up any resources being used.
    /// </summary>
    /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
    protected override void Dispose(bool disposing)
    {
      if (disposing && (components != null))
      {
        components.Dispose();
      }
      base.Dispose(disposing);
    }

    #region Windows Form Designer generated code

    /// <summary>
    /// Required method for Designer support - do not modify
    /// the contents of this method with the code editor.
    /// </summary>
    private void InitializeComponent()
    {
      System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(FormViewMetadata));
      this.webBrowserViewer = new System.Windows.Forms.WebBrowser();
      this.SuspendLayout();
      // 
      // webBrowserViewer
      // 
      this.webBrowserViewer.Dock = System.Windows.Forms.DockStyle.Fill;
      this.webBrowserViewer.Location = new System.Drawing.Point(0, 0);
      this.webBrowserViewer.MinimumSize = new System.Drawing.Size(20, 20);
      this.webBrowserViewer.Name = "webBrowserViewer";
      this.webBrowserViewer.Size = new System.Drawing.Size(800, 450);
      this.webBrowserViewer.TabIndex = 0;
      // 
      // FormViewMetadata
      // 
      this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
      this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
      this.ClientSize = new System.Drawing.Size(800, 450);
      this.Controls.Add(this.webBrowserViewer);
      this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
      this.Name = "FormViewMetadata";
      this.Text = "Form1";
      this.Load += new System.EventHandler(this.FormViewMetadata_Load);
      this.ResumeLayout(false);

    }

    #endregion

    private System.Windows.Forms.WebBrowser webBrowserViewer;
  }
}