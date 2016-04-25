/**
 * String.prototype.trim Polyfill
 */

String.prototype.trim = (function() {

	var trimRegex = /(^\s+|\s+$)/g;

	return function() {
		return this.replace(trimRegex, '');
	};

}());

/* End of file trim.js */
