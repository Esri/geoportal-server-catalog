// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.15/esri/copyright.txt and http://www.arcgis.com/apps/webappbuilder/copyright.txt for details.
/* jshint unused:false */
var profile = {
	resourceTags: {
		test: function (filename, mid) {
			return (/test/).test(mid);
		},

		copyOnly: function (filename, mid) {
			/* jshint unused:false */
			return false;
		},

		amd: function (filename, mid) {
			return !this.copyOnly(filename, mid) && /\.js$/.test(filename);
		},

		miniExclude: function (filename, mid) {
			return mid in {
				'dynamic-modules/package': 1
			};
		}
	}
};