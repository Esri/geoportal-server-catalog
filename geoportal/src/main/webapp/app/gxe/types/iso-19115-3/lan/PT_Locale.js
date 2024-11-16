define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./CountryCode",
        "./LanguageCode",
        "./MD_CharacterSetCode",
        "dojo/text!./templates/PT_Locale.html"],
function(declare, lang, has, Descriptor, CountryCode, LanguageCode, MD_CharacterSetCode, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});