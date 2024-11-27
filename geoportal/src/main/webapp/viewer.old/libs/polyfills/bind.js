/**
 * Function.prototype.bind Polyfill
 */

Function.prototype.bind = (function() {
	
	var slice = Array.prototype.slice;
	
	return function (oThis) {

		if (typeof this !== "function") { // closest thing possible to the ECMAScript 5 internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");
		}

		var
		aArgs = slice.call(arguments, 1), 
		fToBind = this, 
		fNOP = function () { },
		fBound = function () {
			return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(slice.call(arguments)));		
		};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;

	};

}());

/* End of file bind.js */
