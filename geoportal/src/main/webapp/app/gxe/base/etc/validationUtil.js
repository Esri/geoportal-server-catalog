define(["dojo/_base/lang",
        "dojo/_base/array",
        "dojo/has",
        "dojo/i18n!esri/dijit/metadata/nls/i18nBase",
        "dojo/i18n!../../../nls/i18nInspire"],
function(lang, array, has, i18nBase, i18nInspire) {

  var oThisObject = {

    formatMessage: function(status, message) {
      var label = status.label, hint = null, v;
      var pattern = i18nBase.validation.pattern;
      var patternWithHint = i18nBase.validation.patternWithHint;
      if(!status.isValid && status.considerHint) {
        v = status.inputWidget.hint;
        if((typeof v !== "undefined") && (v !== null)) {
          v = lang.trim(v);
          if(v.length > 0) {
            hint = v;
          }
        }
      }
      if(hint != null) {
        return patternWithHint.replace("{label}", label).replace("{message}", message).replace("{hint}", hint);
      } else {
        return pattern.replace("{label}", label).replace("{message}", message);
      }
    },

    validateValue: function(status, value) {
      status.isValid = true;
      status.message = this.formatMessage(status, i18nBase.validation.ok);
      status._continue = true;

      this._checkEmpty(status, value);
      if(!status.isValid || !status._continue) {
        return;
      }

      this._checkAlternates(status, value);
      if(!status.isValid || !status._continue) {
        return;
      }

      status.considerHint = true;
      if(status.inputWidget._isGxeInputNumber) {
        this._checkNumber(status, value);
        if(!status.isValid || !status._continue) {
          return;
        }

      } else if(status.inputWidget._isFgdcInputDate) {
        this._checkFgdcDate(status, value);
        if(!status.isValid || !status._continue) {
          return;
        }

      } else if(status.inputWidget._isFgdcInputTime) {
        this._checkFgdcTime(status, value);
        if(!status.isValid || !status._continue) {
          return;
        }

      } else if(status.inputWidget._isGxeInputDate) {
        if(status.inputWidget.forceTime) {
          this._checkDateTime(status, value);
        } else if(status.inputWidget.allowTime && (value.indexOf("T") !== -1)) {
          this._checkDateTime(status, value);
        } else if(status.inputWidget.fullDate) {
          this._checkFullDate(status, value);
        } else {
          this._checkDate(status, value);
        }
        if(!status.isValid || !status._continue) {
          return;
        }

      }

    },

    _checkAlternates: function(status, value) {
      var bFound, list = status.xnodeWidget.alternateValues;
      if(list && list.push && (list.length > 0)) {
        bFound = array.some(list, function(v) {
          return (v === value);
        });
        if(bFound) {
          status._continue = false;
        }
      }
    },

    _checkDate: function(status, value) {
      // allows yyyy-mm-ddZ or yyyy-mm-dd or yyyy-mm or yyyy
      var bOk = false;
      var regexp1 = /^(\d{4})$/;
      var regexp2 = /^(\d{2})$/;
      var parts = value.split("-");

      if(regexp1.test(parts[0])) {
        if(parts.length > 1) {
          if(regexp2.test(parts[1])) {
            if(parts.length > 2) {
              if(parts.length == 3) {
                if(parts[2].charAt(parts[2].length - 1) === "Z") {
                  parts[2] = parts[2].substring(0, parts[2].length - 1);
                }
                if(regexp2.test(parts[2])) {
                  bOk = true;
                }
              }
            } else {
              bOk = true;
            }
          }
        } else {
          bOk = true;
        }
      }

      if(!bOk) {
        status.isValid = false;
        status.message = this.formatMessage(status, i18nBase.validation.date);
      }
    },

    _checkFullDate: function(status, value) {
      // ISO 8601 full
      var regexp = /^([0-9]{4})-(1[0-2]|0[1-9])-(3[0-1]|0[1-9]|[1-2][0-9])$/;
      if(!regexp.test(value)) {
        status.isValid = false;
        status.message = this.formatMessage(status, i18nInspire.validation.fullDate);
      }
    },

    _checkDateTime: function(status, value) {
      // ISO 8601
      var regexp = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[0-1]|0[1-9]|[1-2][0-9])T(2[0-3]|[0-1][0-9]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z|[+-](?:2[0-3]|[0-1][0-9]):[0-5][0-9])?$/;
      if(!regexp.test(value)) {
        status.isValid = false;
        status.message = this.formatMessage(status, i18nBase.validation.other);
      }
    },

    _checkEmpty: function(status, value) {
      var bRequired = (status.isRequired);
      var bSerializeIfEmpty = status.xnodeWidget.serializeIfEmpty;
      var bEmpty = (value === null);
      if(value != null) {
        if(typeof value === "string") {
          if(status.xnodeWidget.trim) {
            bEmpty = (lang.trim(value).length === 0);
          } else {
            bEmpty = (value.length === 0);
          }
        } else if(value.push) {
          bEmpty = (value.length === 0);
        }
      }

      if(bEmpty) {
        if(!bRequired) {
          status._continue = false;
        } else if(bSerializeIfEmpty) {
          status._continue = false;
        } else {
          this._checkIndeterminates(status, value);
          if(!status._continue) {
            return;
          }
          status.isValid = false;
          status.message = this.formatMessage(status, i18nBase.validation.empty);
        }
      }
    },

    _checkFgdcDate: function(status, value) {
      // allows yyyymmdd or yyyymm or yyyy
      var bN = false;
      if(value.indexOf("-") === 0) {
        bN = true;
      }
      var v = value.replace(/-/g, "");
      if(bN) {
        v = "-" + v;
      }
      var regexp1 = /^\d{4}(\d{2}(\d{2})?)?$/;
      if(!regexp1.test(v)) {
        status.isValid = false;
        status.message = this.formatMessage(status, i18nBase.validation.date);
      }
    },

    _checkFgdcTime: function(status, value) {
      // (hours minutes seconds) examples: hh hhmm hhmmss
      // (offset from GMT) examples: hh+hhmm hhmmss-hhmm
      // (suffixed with Z for Zulu time) examples: hhZ hhmmZ hhmmssZ
      // (decimal seconds are ssssssss)
      var v = value.replace(/:/g, "");
      v = v.replace(/\./g, "");
      var regexp1 = /^\d{2}(\d{2}(\d{2,})?)?$/;
      var regexp2 = /^\d{2}(\d{2}(\d{2,})?)?[+\-]\d{4}$/;
      var regexp3 = /^\d{2}(\d{2}(\d{2,})?)?Z$/;
      if(!regexp1.test(v) && !regexp2.test(v) && !regexp3.test(v)) {
        status.isValid = false;
        status.message = this.formatMessage(status, i18nBase.validation.other);
      }
    },

    /*


     _checkFgdcDate: function(status,value) {
     // allows yyyymmdd or yyyymm or yyyy
     var bOk = false;
     var regexp1 = /^(\d{4})$/;
     var regexp2 = /^(\d{2})$/;
     var parts = [];
     if (value.length == 8) {
     parts[0] = value.substring(0,4);
     parts[1] = value.substring(4,6);
     parts[2] = value.substring(6,8);
     } else if (value.length == 6) {
     parts[0] = value.substring(0,4);
     parts[1] = value.substring(4,6);
     } else if (value.length == 4) {
     parts[0] = value.substring(0,4);
     }
     if (parts.length > 0) {
     if (regexp1.test(parts[0])) {
     if (parts.length > 1) {
     if (regexp2.test(parts[1])) {
     if (parts.length > 2) {
     if (parts.length == 3) {
     if (parts[2].charAt(parts[2].length-1) == 'Z') {
     parts[2] = parts[2].substring(0,parts[2].length-1);
     }
     if (regexp2.test(parts[2])) bOk = true;
     }
     } else bOk = true;
     }
     } else bOk = true;
     }
     }
     if (!bOk) {
     status.isValid = false;
     status.message = this.formatMessage(status,i18nBase.validation.date);
     }
     },


     _checkFgdcTime: function(status,value) {
     // (hours minutes seconds) examples: hh hhmm hhmmss
     // (offset from GMT) examples: hh+hhmm hhmmss-hhmm
     // (suffixed with Z for Zulu time) examples: hhZ hhmmZ hhmmssZ
     // (decimal seconds are ssssssss)
     var regexp1 = /^\d{2}(\d{2}(\d{2,})?)?$/;
     var regexp2 = /^\d{2}(\d{2}(\d{2,})?)?[+\-]\d{4}$/;
     var regexp3 = /^\d{2}(\d{2}(\d{2,})?)?Z$/;
     if (!regexp1.test(value) && !regexp2.test(value) && !regexp3.test(value)) {
     status.isValid = false;
     status.message = this.formatMessage(status,i18nBase.validation.other);
     }
     },

     */

    _checkIndeterminates: function(status, value) {
      if(!status.xnodeWidget._isGxeElement) {
        return;
      }
      var target = status.xnodeWidget.target, v, attributes = null;
      if((target === "gml:beginPosition") || (target === "gml:endPosition")) {
        attributes = status.xnodeWidget.findAttributes();
        array.some(attributes, function(child) {
          if(child.target === "indeterminatePosition") {
            if(!child._isOptionallyOff && child.inputWidget) {
              v = child.inputWidget.getInputValue();
              if((v === "unknown") || (v === "now")) {
                status._continue = false;
              }
            }
            return true;
          }
        });
      }
    },

    _checkNumber: function(status, value) {
      var regexp, widget = status.inputWidget;
      var minValue = widget.minValue, maxValue = widget.maxValue;

      if(widget.integerOnly) {
        // TODO the expression is not definitive
        // regexp = /^[-]?[0-9]+$/;
        regexp = /(^-?\d\d*$)/;
        if(!regexp.test(value)) {
          status.isValid = false;
          status.message = this.formatMessage(status, i18nBase.validation.integer);
          return;
        }
      } else {
        //  TODO the expression is not definitive
        regexp = /(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/;
        if(!regexp.test(value)) {
          status.isValid = false;
          status.message = this.formatMessage(status, i18nBase.validation.number);
        }
      }
      if((minValue === null) && (maxValue === null)) {
        return;
      }

      var nValue = Number(value), bMinOk = true, bMaxOk = true;
      if(minValue != null) {
        if(widget.minValueIsExclusive) {
          bMinOk = (nValue > minValue);
        } else {
          bMinOk = (nValue >= minValue);
        }
      }
      if(maxValue != null) {
        if(widget.maxValueIsExclusive) {
          bMaxOk = (nValue < maxValue);
        } else {
          bMaxOk = (nValue <= maxValue);
        }
      }
      if(!bMinOk || !bMaxOk) {
        // TODO message can include the actual bounds
        status.isValid = false;
        status.message = this.formatMessage(status, i18nBase.validation.other);
      }
    }

  };

  return oThisObject;
});