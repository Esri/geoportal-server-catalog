/**
 * Implementation of standard Array methods (introduced in ECMAScript 5th
 * edition) and shorthand generics (JavaScript 1.8.5)
 *
 * Copyright (c) 2013 Alex K @plusdude
 * http://opensource.org/licenses/MIT
 */
(function (global, infinity, undefined) {
    /*jshint bitwise:false, maxlen:95, plusplus:false, validthis:true*/
    "use strict";

    /**
     * Local references to constructors at global scope.
     * This may speed up access and slightly reduce file size of minified version.
     */
    var Array = global.Array;
    var Object = global.Object;
    var Math = global.Math;
    var Number = global.Number;

    /**
     * Converts argument to an integral numeric value.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-9.4
     */
    function toInteger(value) {
        var number;

        // let number be the result of calling ToNumber on the input argument
        number = Number(value);
        return (
            // if number is NaN, return 0
            number !== number ? 0 :

            // if number is 0, Infinity, or -Infinity, return number
            0 === number || infinity === number || -infinity === number ? number :

            // return the result of computing sign(number) * floor(abs(number))
            (0 < number || -1) * Math.floor(Math.abs(number))
        );
    }

    /**
     * Returns a shallow copy of a portion of an array.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.10
     */
    function slice(begin, end) {
        /*jshint newcap:false*/
        var result, elements, length, index, count;

        // convert elements to object
        elements = Object(this);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // calculate begin index, if is set
        if (undefined !== begin) {

            // convert to integer
            begin = toInteger(begin);

            // handle -begin, begin > length
            index = 0 > begin ? Math.max(length + begin, 0) : Math.min(begin, length);
        } else {
            // default value
            index = 0;
        }
        // calculate end index, if is set
        if (undefined !== end) {

            // convert to integer
            end = toInteger(end);

            // handle -end, end > length
            length = 0 > end ? Math.max(length + end, 0) : Math.min(end, length);
        }
        // create result array
        result = new Array(length - index);

        // iterate over elements
        for (count = 0; index < length; ++index, ++count) {

            // current index exists
            if (index in elements) {

                // copy current element to result array
                result[count] = elements[index];
            }
        }
        return result;
    }

    /**
     * Returns the first index at which a given element
     * can be found in the array.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.14
     */
    function indexOf(target, begin) {
        /*jshint newcap:false*/
        var elements, length, index;

        // convert elements to object
        elements = Object(this);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // calculate begin index, if is set
        if (undefined !== begin) {

            // convert to integer
            begin = toInteger(begin);

            // handle -begin, begin > length
            index = 0 > begin ? Math.max(length + begin, 0) : Math.min(begin, length);
        } else {
            // default value
            index = 0;
        }
        // iterate over elements
        for (; index < length; ++index) {

            // current index exists, target element is equal to current element
            if (index in elements && target === elements[index]) {

                // break loop, target element found
                return index;
            }
        }
        // target element not found
        return -1;
    }

    /**
     * Returns the last index at which a given element
     * can be found in the array.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.15
     */
    function lastIndexOf(target, begin) {
        /*jshint newcap:false*/
        var elements, length, index;

        // convert elements to object
        elements = Object(this);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // calculate begin index, if is set
        if (undefined !== begin) {

            // convert to integer
            begin = toInteger(begin);

            // handle -begin, begin > length - 1
            index = 0 > begin ? length - Math.abs(begin) : Math.min(begin, length - 1);
        } else {
            // default value
            index = length - 1;
        }
        // iterate over elements backwards
        for (; -1 < index; --index) {

            // current index exists, target element is equal to current element
            if (index in elements && target === elements[index]) {

                // break loop, target element found
                return index;
            }
        }
        // target element not found
        return -1;
    }

    /**
     * Executes a provided function once per array element.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.18
     */
    function forEach(callback, scope) {
        /*jshint newcap:false*/
        var elements, length, index;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // iterate over elements
        for (index = 0; index < length; ++index) {

            // current index exists
            if (index in elements) {

                // execute callback
                callback.call(scope, elements[index], index, elements);
            }
        }
    }

    /**
     * Tests whether all elements in the array pass the test
     * implemented by the provided function.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.16
     */
    function every(callback, scope) {
        /*jshint newcap:false*/
        var elements, length, index;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // iterate over elements
        for (index = 0; index < length; ++index) {

            // current index exists
            if (index in elements &&

            // callback returns false
            !callback.call(scope, elements[index], index, elements)) {

                // break loop, test failed
                return false;
            }
        }
        // test passed, controversy began..
        return true;
    }

    /**
     * Tests whether some element in the array passes the test
     * implemented by the provided function.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.17
     */
    function some(callback, scope) {
        /*jshint newcap:false*/
        var elements, length, index;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // iterate over elements
        for (index = 0; index < length; ++index) {

            // current index exists
            if (index in elements &&

            // callback returns true
            callback.call(scope, elements[index], index, elements)) {

                // break loop, test passed
                return true;
            }
        }
        // test failed
        return false;
    }

    /**
     * Creates a new array with all elements that pass the test
     * implemented by the provided function.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.20
     */
    function filter(callback, scope) {
        /*jshint newcap:false*/
        var result = [], elements, length, index, count;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // iterate over elements
        for (index = count = 0; index < length; ++index) {

            // current index exists
            if (index in elements &&

            // callback returns true
            callback.call(scope, elements[index], index, elements)) {

                // copy current element to result array
                result[count++] = elements[index];
            }
        }
        return result;
    }

    /**
     * Creates a new array with the results of calling a provided function
     * on every element in this array.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.19
     */
    function map(callback, scope) {
        /*jshint newcap:false*/
        var result = [], elements, length, index;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // iterate over elements
        for (index = 0; index < length; ++index) {

            // current index exists
            if (index in elements) {

                // copy a return value of callback to result array
                result[index] = callback.call(scope, elements[index], index, elements);
            }
        }
        return result;
    }

    /**
     * Apply a function against values of the array (from left-to-right)
     * as to reduce it to a single value.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.21
     */
    function reduce(callback, value) {
        /*jshint newcap:false*/
        var elements, isset, length, index;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // status of the initial value
        isset = undefined !== value;

        // convert length to unsigned 32 bit integer
        length = elements.length >>> 0;

        // iterate over elements
        for (index = 0; index < length; ++index) {

            // current index exists
            if (index in elements) {

                // initial value is set
                if (isset) {

                    // replace initial value with a return value of callback
                    value = callback(value, elements[index], index, elements);
                } else {
                    // current element becomes initial value
                    value = elements[index];

                    // status of the initial value
                    isset = true;
                }
            }
        }
        // make sure the initial value exists after iteration
        requireValue(isset);
        return value;
    }

    /**
     * Apply a function against values of the array (from right-to-left)
     * as to reduce it to a single value.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.22
     */
    function reduceRight(callback, value) {
        /*jshint newcap:false*/
        var elements, isset, index;

        // convert elements to object
        elements = Object(this);

        // make sure callback is a function
        requireFunction(callback);

        // status of the initial value
        isset = undefined !== value;

        // index of the last element
        index = (elements.length >>> 0) - 1;

        // iterate over elements backwards
        for (; -1 < index; --index) {

            // current index exists
            if (index in elements) {

                // initial value is set
                if (isset) {

                    // replace initial value with a return value of callback
                    value = callback(value, elements[index], index, elements);
                } else {
                    // current element becomes initial value
                    value = elements[index];

                    // status of the initial value
                    isset = true;
                }
            }
        }
        // make sure the initial value exists after iteration
        requireValue(isset);
        return value;
    }

    /**
     * Returns true if an argument is an array, false if it is not.
     * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.3.2
     */
    function isArray(value) {
        return "[object Array]" === Object.prototype.toString.call(value);
    }

    /**
     * Tests if an argument is callable and throws an error if it is not.
     * @private
     */
    function requireFunction(value) {
        if ("[object Function]" !== Object.prototype.toString.call(value)) {
            throw new Error(value + " is not a function");
        }
    }

    /**
     * Throws an error if an argument can be converted to true.
     * @private
     */
    function requireValue(isset) {
        if (!isset) {
            throw new Error("reduce of empty array with no initial value");
        }
    }

    /**
     * Tests implementation of standard Array method.
     * @private
     */
    function supportsStandard(key) {
        var support = true;

        // a method exists
        if (Array.prototype[key]) {
            try {
                // apply dummy arguments
                Array.prototype[key].call(undefined, /test/, null);

                // passed? implemented wrong
                support = false;
            } catch (e) {
                // do nothing
            }
        } else {
            support = false;
        }
        return support;
    }

    /**
     * Tests implementation of generic Array method.
     * @private
     */
    function supportsGeneric(key) {
        var support = true;

        // a method exists
        if (Array[key]) {
            try {
                // apply dummy arguments
                Array[key](undefined, /test/, null);

                // passed? implemented wrong
                support = false;
            } catch (e) {
                // do nothing
            }
        } else {
            support = false;
        }
        return support;
    }

    /**
     * Assigns method to Array constructor.
     * @private
     */
    function extendArray(key) {
        if (!supportsGeneric(key)) {
            Array[key] = createGeneric(key);
        }
    }

    /**
     * Creates generic method from an instance method.
     * @private
     */
    function createGeneric(key) {
        /** @public */
        return function (elements) {
            var list;

            if (undefined === elements || null === elements) {
                throw new Error("Array.prototype." + key + " called on " + elements);
            }
            list = Array.prototype.slice.call(arguments, 1);
            return Array.prototype[key].apply(elements, list);
        };
    }

    /**
     * Assign ECMAScript-5 methods to Array constructor,
     * and Array prototype.
     */
    var ES5 = {
        "indexOf": indexOf,
        "lastIndexOf": lastIndexOf,
        "forEach": forEach,
        "every": every,
        "some": some,
        "filter": filter,
        "map": map,
        "reduce": reduce,
        "reduceRight": reduceRight
    };
    for (var key in ES5) {
        if (ES5.hasOwnProperty(key)) {

            if (!supportsStandard(key)) {
                Array.prototype[key] = ES5[key];
            }
            extendArray(key);
        }
    }
    Array.isArray = Array.isArray || isArray;

    /**
     * Assign ECMAScript-3 methods to Array constructor.
     * The toString method is omitted.
     */
    [
        "concat",
        "join",
        "slice",
        "pop",
        "push",
        "reverse",
        "shift",
        "sort",
        "splice",
        "unshift"

    ].forEach(extendArray);

    /**
     * Test the slice method on DOM NodeList.
     * Support: IE < 9
     */
    /*jshint browser:true*/
    if (document) {
        try {
            Array.slice(document.childNodes);
        } catch (e) {
            Array.prototype.slice = slice;
        }
    }

}(this, 1 / 0));
