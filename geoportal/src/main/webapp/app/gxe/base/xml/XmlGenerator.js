define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/has",
        "esri/dijit/metadata/base/xml/xmlUtil"],
function(declare, lang, array, has, xmlUtil) {

  var oThisClass = declare(null, {

    nl: "\r\n",
    tb: "\t",
    xmlHeader: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",

    constructor: function(args) {
      lang.mixin(this, args);
    },

    generate: function(gxeDocument, rootElement, validationTracker, transformer) {
      var collectOptions = {ignoreOptionallyOff: false, validationTracker: validationTracker};
      var data = {gxeDocument: gxeDocument, transformer: transformer};
      var reference = this._collect(rootElement, null, collectOptions);
      var xml = this._walk(reference, true, data);
      if(validationTracker) {
        validationTracker.whenComplete();
      }
      return xml;
    },

    _checkTarget: function(data, elementReference, sPrefix) {
      var s, sBegin = "", sEnd = "", widget = elementReference.widget;
      var sName = widget.target;
      if(data.transformer) {
        sName = data.transformer.checkTarget(widget, sName);
      }
      var aNames = [sName];
      if(widget.inputWidget && widget.inputWidget.subTarget) {
        s = lang.trim(widget.inputWidget.subTarget);
        if(s.length > 0) {
          aNames.push(s);
          sName = s;
          sBegin = sPrefix + "<" + aNames[0] + ">";
          sEnd = sPrefix + "</" + aNames[0] + ">";
        }
      }
      return {aNames: aNames, sBegin: sBegin, sEnd: sEnd, sName: sName};
    },

    _collect: function(widget, elementReference, options) {
      //options.ignoreOptionallyOff = true;
      if (widget.ignoreContent) {
        return null;
      }
      var attributeRef, elementRef2, info, bRecurse = false, bOptionallyOff = false;
      if(widget._isGxeElement) {
        bOptionallyOff = widget._isOptionallyOff;
        if(widget.multiplicityHeader && widget.multiplicityHeader.useTabs) {
          bOptionallyOff = widget.multiplicityHeader._isOptionallyOff;
        }
      } else if(widget._isGxeAttribute) {
        bOptionallyOff = widget._isOptionallyOff;
      } else {
        bOptionallyOff = widget._isOptionallyOff;
      }
      if(widget._isGxeElement) {
        if(options.ignoreOptionallyOff || !bOptionallyOff) {
          elementRef2 = {
            isAttribute: false,
            widget: widget,
            depth: 0,
            xvalue: null,
            serialize: widget.serialize,
            references: [],
            attributeRefs: [],
            elementRefs: []
          };
          elementRef2.xvalue = widget.checkXmlValue();
          if(widget.isDocumentTitle) {
            options.validationTracker.documentTitle = elementRef2.xvalue;
          }
          info = widget.validateValue(options.validationTracker);
          /*
          if(!info.isValid) {
            elementRef2.serialize = false;
          }
          */
          if(elementReference) {
            elementRef2.depth = elementReference.depth + 1;
            elementReference.references.push(elementRef2);
            elementReference.elementRefs.push(elementRef2);
          }
          elementReference = elementRef2;
          bRecurse = true;
        }
      } else if(widget._isGxeAttribute) {
        if(options.ignoreOptionallyOff || !bOptionallyOff) {
          attributeRef = {
            isAttribute: true,
            widget: widget,
            xvalue: null,
            serialize: widget.serialize
          };
          attributeRef.xvalue = widget.checkXmlValue();
          attributeRef.displayValue = widget.useDisplayValue && widget.inputWidget? widget.inputWidget.getDisplayValue(): null;
          if(widget.isDocumentTitle) {
            options.validationTracker.documentTitle = attributeRef.xvalue;
          }
          info = widget.validateValue(options.validationTracker);
          /*
          if(!info.isValid) {
            attributeRef.serialize = false;
          }
          */
          if(elementReference) {
            elementReference.references.push(attributeRef);
            elementReference.attributeRefs.push(attributeRef);
            if(attributeRef.serialize && widget.isIsoCodeListValue) {
              elementReference.xvalue = attributeRef.xvalue;
              if(attributeRef.xvalue === null) {
                elementReference.serialize = false;
              }
            } else if(!attributeRef.serialize && widget.isIsoCodeListValue) {
              elementReference.serialize = false;
            }
          }
        }
      } else {
        if(options.ignoreOptionallyOff || !bOptionallyOff) {
          bRecurse = true;
        }
      }
      if(bRecurse) {
        array.forEach(widget.getChildren(), function(widget2) {
          this._collect(widget2, elementReference, options);
        }, this);
        if (widget.validateConditionals) {
          widget.validateConditionals(options.validationTracker);
        }
      }
      return elementReference;
    },

    _renderNamespaces: function(sAttributes, isRoot, gxeDocument, data) {
      if(!isRoot) {
        return sAttributes;
      }
      var namespaces = gxeDocument.getNamespaces();
      if(data.transformer) {
        namespaces = data.transformer.toDocumentType.getNamespaces();
      }
      array.forEach(namespaces, function(ns) {
        if(ns.prefix && ns.uri) {
          sAttributes += " xmlns:" + ns.prefix + "=\"" + ns.uri + "\"";
        }
      });
      return sAttributes;
    },

    _walk: function(elementReference, isRoot, data) {
      if(!elementReference.serialize) {
        return "";
      }

      var makeSnippet = function(sBegin, sEnd, sName, sp, sa, sv, se) {
        var s = null;
        if (sName === "TopicCatCd@value") {
          //console.warn("sBegin",sBegin,"sEnd",sEnd,"sa",sa,"se",se,"sv",sv);
          s = sBegin + sp + "<TopicCatCd value='"+ sv + "'/>" + sEnd;
          return s; 
        } 
        s = sp + "<" + sName + sa;
        if((sv.length === 0) && (se.length === 0)) {
          s += "/>";
        } else {
          s += ">";
          if(sv.length > 0) {
            s += sv;
          }
          if(se.length > 0) {
            s += se + sp;
          }
          s += "</" + sName + ">";
        }
        s = sBegin + s + sEnd;
        return s;
      };

      var i, s, sa = "", se = "", sp = this.nl, sv = "", svs = [];
      for(i = 0; i < elementReference.depth; i++) {
        sp += this.tb;
      }
      if(isRoot) {
        sa = this._renderNamespaces(sa, isRoot, data.gxeDocument, data);
      }

      if(elementReference.serialize && (elementReference.xvalue !== null)) {
        if(elementReference.xvalue.push) {
          array.forEach(elementReference.xvalue, function(xval) {
            svs.push(xmlUtil.escape(xval));
          }, this);
        } else {
          sv = xmlUtil.escape(elementReference.xvalue);
        }
      }
      array.forEach(elementReference.attributeRefs, function(ref) {
        if (ref.displayValue) {
          sv = ref.displayValue
        }
        if(ref.serialize && (ref.xvalue !== null)) {
          s = xmlUtil.escape(ref.xvalue);
          sa += " " + ref.widget.target.replace("@", "") + "=\"" + s + "\"";
        }
      }, this);
      array.forEach(elementReference.elementRefs, function(ref) {
        var x = this._walk(ref, false, data);
        if((x !== null) && (x.length > 0)) {
          se += x;
        }
      }, this);

      var bEmpty = ((sa.length === 0) && (sv.length === 0) && (svs.length === 0) && (se.length === 0));
      if(bEmpty && !elementReference.widget.serializeIfEmpty) {
        return null;
      }
      var info = this._checkTarget(data, elementReference, sp);
      var sBegin = info.sBegin, sEnd = info.sEnd, sName = info.sName;
      for(i = 0; i < info.aNames.length - 1; i++) {
        sp += this.tb;
      }

      var snippet = null;
      if(bEmpty && elementReference.widget.serializeIfEmpty) {
        snippet = sBegin + sp + "<" + sName + "/>" + sEnd;
      } else if(svs.length === 0) {
        snippet = makeSnippet(sBegin, sEnd, sName, sp, sa, sv, se);
      } else {
        snippet = "";
        array.forEach(svs, function(val) {
          snippet += makeSnippet(sBegin, sEnd, sName, sp, sa, val, se);
        });
      }
      if(isRoot) {
        snippet = this.xmlHeader + snippet;
      }
      return snippet;
    }

  });

  return oThisClass;
});