/* FileSaver.js
 *  A saveAs() & saveTextAs() FileSaver implementation.
 *  2014-06-24
 *
 *  Modify by Brian Chen
 *  Author: Eli Grey, http://eligrey.com
 *  License: X11/MIT
 *    See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveTextAs = saveTextAs || (function (textContent, fileName, charset) {
  fileName = fileName || 'download.txt';
  charset = charset || 'utf-8';
  textContent = (textContent || '').replace(/\r?\n/g, '\r\n');

  var saveTxtWindow = window.frames.saveTxtWindow;
  if (!saveTxtWindow) {
    saveTxtWindow = document.createElement('iframe');
    saveTxtWindow.id = 'saveTxtWindow';
    saveTxtWindow.style.display = 'none';
    document.body.insertBefore(saveTxtWindow, null);
    saveTxtWindow = window.frames.saveTxtWindow;
    if (!saveTxtWindow) {
      saveTxtWindow = window.open('', '_temp', 'width=100,height=100');
      if (!saveTxtWindow) {
        window.alert('Sorry, download file could not be created.');
        return false;
      }
    }
  }

  var doc = saveTxtWindow.document;
  doc.open('text/html', 'replace');
  doc.charset = charset;
  if (/htm$/.test(fileName) || /html$/.test(fileName)) {
    doc.close();
    doc.body.innerHTML = '\r\n' + textContent + '\r\n';
  } else {
    if (!/txt$/.test(fileName) && !/csv$/.test(fileName)) {
      fileName += '.txt';
    }
    doc.write(textContent);
    doc.close();
  }

  var retValue = doc.execCommand('SaveAs', null, fileName);
  saveTxtWindow.close();
  return retValue;
});
