define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/topic",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/has",
        "../base/XNode",
        "dojo/text!esri/dijit/metadata/form/templates/Element.html",
        "esri/dijit/metadata/base/ElementHeader",
        "esri/dijit/metadata/base/MultiplicityHeader",
        "esri/dijit/metadata/base/OptionalLabel",
        "esri/dijit/metadata/base/etc/viewOnlyUtil",
        "esri/dijit/metadata/form/InputText"],
function(declare, lang, array, topic, domClass, domConstruct, domStyle, has, XNode, template,
         ElementHeader, MultiplicityHeader, OptionalLabel, viewOnlyUtil, InputText) {

  var oThisClass = declare([XNode], {

    _isGxeElement: true,
    elementHeader: null,
    multiplicityHeader: null,
    templateString: template,

    /* gxe/form/Element properties, configurable */
    label: null,
    target: null,
    minOccurs: 1,
    maxOccurs: 1, // can be "unbounded"
    matchTopNode: null,
    preferOpen: false,
    showHeader: true,
    trackMultiplicity: true,
    useTabs: true,

    postCreate: function() {
      this.inherited(arguments);
    },

    // TODO do multiplicityHeader &&  elementHeader get destroyed
    /*
     destroy: function() {
     console.warn("Element.destroy",this.gxePath);
     this.inherited(arguments);
     },
     */

    startup: function() {
      if(this._started) {
        return;
      }
      this.buildPath();
      if(this.gxeDocument) {
        this.gxeDocument.beforeInitializeElement(this);
      }
      this.initializeElement();
      if(this.gxeDocument) {
        this.gxeDocument.afterInitializeElement(this);
      }
      if (this.noIndent) {
        domClass.remove(this.domNode,"gxeIndent");
      }
      this._publishStarted();
      this.inherited(arguments);
    },
    
    /*
    _chkhdr: function(considerDefault) {
       var hasTabs = false, nChildren = 0;
       var isViewOnly = (this.gxeDocument && this.gxeDocument.isViewOnly);
       if (isViewOnly && !this.multiplicityHeader) {
         array.some(this.parentXNode.getChildren(),function(child){
           nChildren++;
           if (child._isGxeTabs) {
             return true;
           }
         });
       }
    },
    */

    connectInputWidget: function(considerDefault) {
      var isViewOnly = (this.gxeDocument && this.gxeDocument.isViewOnly);
      var nd, widget = this.findInputWidget();
      //considerDefault = false;
      if(!widget && considerDefault) {
        if(this.getChildren().length === 0) {
          nd = domConstruct.create("div", {}, this.containerNode);
          widget = new InputText({}, nd);
        }
      }
      if(widget) {
        this.inputWidget = widget;
        widget.parentXNode = this;
        widget.connectXNode(this, isViewOnly);
      }
    },

    findAttributes: function() {
      var attributes = [];
      this._findAttributes(this, attributes);
      return attributes;
    },

    _findAttributes: function(widget, attributes) {
      var recurse = true;
      if(widget._isGxeElement) {
        recurse = (widget === this);
      } else if(widget._isGxeAttribute) {
        recurse = false;
        attributes.push(widget);
      }
      if(recurse) {
        array.forEach(widget.getChildren(), function(widget2) {
          this._findAttributes(widget2, attributes);
        }, this);
      }
    },

    initializeElement: function() {
      //this.noToggle = true;
      //this.maxOccurs = 1;
      
      var hdr;
      this.getLabelString();
      var isViewOnly = (this.gxeDocument && this.gxeDocument.isViewOnly);
      var inputWidget = this.findInputWidget();
      if((this.maxOccurs !== "unbounded") && (this.maxOccurs <= 1)) {
        this.trackMultiplicity = false;
      } else if(inputWidget && inputWidget._supportsMultipleValues) {
        this.trackMultiplicity = false;
      }
      if(this.showHeader && this.trackMultiplicity) {
        this.multiplicityHeader = hdr = new MultiplicityHeader({
          label: this.getLabelString(),
          target: this.target,
          minOccurs: this.minOccurs,
          maxOccurs: this.maxOccurs,
          preferOpen: this.preferOpen,
          showHeader: this.showHeader,
          useTabs: this.useTabs
        });
        hdr.initialize(this);
        if (this.notApplicable) {
          hdr.domNode.style.display = "none";
        }
        this.connectInputWidget(true);
        if(isViewOnly) {
          if(this.multiplicityHeader.tools) {
            this.multiplicityHeader.tools.domNode.style.display = "none";
          }
        }
      } else if(this.showHeader) {
        this._initStandardHeader();
      } else {
        this.connectInputWidget(true);
      }
    },
    
    _initStandardHeader: function() {
      var bOptional = (this.minOccurs === 0);
      var showToggle = !this.noToggle;
      var bPreferOpen = this.preferOpen;
      var sLabel = this.getLabelString();
      var checkedAttr = "";
      this.labelNode = domConstruct.create("div", {}, this.domNode, "first");
      
      domClass.add(this.domNode, "single gxeIndent");
      domClass.add(this.labelNode, "gxeElementHeader");
     
      if (!showToggle || !bOptional) {
        
        this.labelNode.innerHTML =  sLabel;
        if (bOptional) {
          domClass.add(this.labelNode, "gxeOptionalLabel");
        } else {
          domClass.add(this.labelNode, "gxeMandatoryLabel");
        }
        //domStyle.set(this.labelNode, "color", "green");
        this.connectInputWidget(true);
        
      } else {
        
        this._contentIsOptional = bOptional;
        this._isOptionallyOff = false;
        if(bPreferOpen) {
          checkedAttr = "checked=\"checked\"";
          this.toggleContent(true,true);
        } else {
          this.toggleContent(false,true);
        }
        this.labelWidget = new OptionalLabel({
          label: sLabel,
          checkedAttr: checkedAttr,
          onClick: lang.hitch(this, function(checked) {
            this.toggleContent(checked, true);
          })
        }, this.labelNode);
        domClass.add(this.labelWidget.domNode, "gxeElementHeader");
        //if (this.notApplicable) {
        //  this.labelWidget.domNode.style.display = "none";
        //}
        this.connectInputWidget(true);
      }
    },

    toggleContent: function(bVisible,bInternal) {
      if(this.hide) {
        return;
      }
      if(this.elementHeader && this.elementHeader.toggleContent) {
        this.elementHeader.toggleContent(bVisible);
      } else if(this.multiplicityHeader && this.multiplicityHeader.toggleContent) {
        this.multiplicityHeader.toggleContent(bVisible);
      } else if(this._contentIsOptional) {
        if(bVisible) {
          domStyle.set(this.containerNode, "display", "block");
        } else {
          domStyle.set(this.containerNode, "display", "none");
        }
        if(this._contentIsOptional) {
          this._isOptionallyOff = !bVisible;
          if(!bInternal && this.labelWidget && this.labelWidget.setChecked) {
            this.labelWidget.setChecked(bVisible);
          }
          try {
            topic.publish("gxe/optional-content-toggled",{src:this,isOptionallyOff:!bVisible});
          } catch(ex) {
            console.error(ex);
          }
         // this.whenOptionalContentToggled(!bVisible);
        }
      }
    }

  });

  return oThisClass;
});