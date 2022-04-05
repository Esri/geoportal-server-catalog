define(["dojo/_base/declare",
        "dojo/_base/lang",
        "./ISODocumentType",
        "./DataRoot"],
function(declare, lang, DocumentType, RootDescriptor) {

  var oThisClass = declare(DocumentType, {

    caption: "ISO 19115-3",
    description: "",
    key: "iso-19115-3",
    isService: false,
    metadataStandardName: "ISO 19115-3 Geographic Information - Metadata - Part 1: Fundamentals",
    metadataStandardVersion: "2014",

    initializeNamespaces: function() {
      this.addNamespace("cat", "http://standards.iso.org/iso/19115/-3/cat/1.0");
      this.addNamespace("cit", "http://standards.iso.org/iso/19115/-3/cit/2.0");
      this.addNamespace("gcx", "http://standards.iso.org/iso/19115/-3/gcx/1.0");
      this.addNamespace("gex", "http://standards.iso.org/iso/19115/-3/gex/1.0");
      this.addNamespace("lan", "http://standards.iso.org/iso/19115/-3/lan/1.0");
      this.addNamespace("srv", "http://standards.iso.org/iso/19115/-3/srv/2.0");
      this.addNamespace("mac", "http://standards.iso.org/iso/19115/-3/mac/2.0");
      this.addNamespace("mas", "http://standards.iso.org/iso/19115/-3/mas/1.0");
      this.addNamespace("mcc", "http://standards.iso.org/iso/19115/-3/mcc/1.0");
      this.addNamespace("mco", "http://standards.iso.org/iso/19115/-3/mco/1.0");
      this.addNamespace("mda", "http://standards.iso.org/iso/19115/-3/mda/1.0");
      this.addNamespace("mdb", "http://standards.iso.org/iso/19115/-3/mdb/2.0");
      this.addNamespace("mdt", "http://standards.iso.org/iso/19115/-3/mdt/1.0");
      this.addNamespace("mex", "http://standards.iso.org/iso/19115/-3/mex/1.0");
      this.addNamespace("mrl", "http://standards.iso.org/iso/19115/-3/mrl/1.0");
      this.addNamespace("mds", "http://standards.iso.org/iso/19115/-3/mds/1.0");
      this.addNamespace("mmi", "http://standards.iso.org/iso/19115/-3/mmi/1.0");
      this.addNamespace("mpc", "http://standards.iso.org/iso/19115/-3/mpc/1.0");
      this.addNamespace("mrc", "http://standards.iso.org/iso/19115/-3/mrc/2.0");
      this.addNamespace("mrd", "http://standards.iso.org/iso/19115/-3/mrd/1.0");
      this.addNamespace("mri", "http://standards.iso.org/iso/19115/-3/mri/1.0");
      this.addNamespace("mrs", "http://standards.iso.org/iso/19115/-3/mrs/1.0");
      this.addNamespace("msr", "http://standards.iso.org/iso/19115/-3/msr/2.0");
      this.addNamespace("mdq", "http://standards.iso.org/iso/19157/-2/mdq/1.0");
      this.addNamespace("dqc", "http://standards.iso.org/iso/19157/-2/dqc/1.0");
      this.addNamespace("gco", "http://standards.iso.org/iso/19115/-3/gco/1.0");
      this.addNamespace("gfc", "http://standards.iso.org/iso/19110/gfc/1.1");
      this.addNamespace("gml", "http://www.opengis.net/gml/3.2");
      this.addNamespace("xlink", "http://www.w3.org/1999/xlink");
      this.addNamespace("xsi", "http://www.w3.org/2001/XMLSchema-instance");
    },

    newRootDescriptor: function() {
      return new RootDescriptor();
    }

  });

  return oThisClass;
});