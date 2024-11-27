define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/Deferred',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/AddItemForm.html',
  'jimu/portalUtils',
  'jimu/portalUrlUtils',
  'dojo/data/ItemFileWriteStore',
  'dijit/form/ValidationTextBox',
  'dijit/form/FilteringSelect',
  'jimu/dijit/LoadingShelter'
],
function(declare, lang, array, Deferred, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template,
  portalUtils, portalUrlUtils, ItemFileWriteStore){
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    baseClass: "jimu-item-form",
    templateString: template,
    appConfig: null,
    folderStore: null,
    portalUser: null,

    postMixInProperties:function(){
      this.nls = window.jimuNls.common;
    },

    postCreate: function(){
      this.inherited(arguments);

      var portalUrl = portalUrlUtils.getStandardPortalUrl(this.appConfig.portalUrl);
      var portal = portalUtils.getPortal(portalUrl);

      portal.getUser().then(lang.hitch(this, function(user) {
        this.portalUser = user;
        return user.getContent();
      })).then(lang.hitch(this, function(res) {
        this.folderStore = this._createFolderStore(res.folders, this.portalUser.username);
        this.itemFolder.set("store", this.folderStore);
        this.itemFolder.set("required", true);
        this.itemFolder.set("searchAttr", "name");
        this.itemFolder.set("displayedValue", this.portalUser.username);
      }));
    },

    getName: function() {
      return this.itemName.get('value');
    },

    getFolderId: function() {
      return this.itemFolder.item ?
          this.folderStore.getValue(this.itemFolder.item, 'id') : '';
    },

    showBusy: function() {
      this.shelter.show();
    },

    hideBusy: function() {
      this.shelter.hide();
    },

    validate: function(){
      var def = new Deferred();
      if (!this.itemForm.validate()) {
        def.resolve({
          valid: false,
          message: 'param requried'
        });
      } else {
        // check whether the item name duplicated?
        def.resolve({
          valid: true
        });
      }

      return def;
    },

    addItem: function(args, folderId) {
      if (this.portalUser) {
        return this.portalUser.addItem(args, folderId);
      } else {
        var def = new Deferred();
        def.resolve({
          error: {
            message: 'portalUser is null'
          }
        });
        return def;
      }
    },

    _createFolderStore: function(folders, username) {
      var folderStore = new ItemFileWriteStore({data: {identifier: "id", label:"name", items:[]}});
      folderStore.newItem({name: username, id:""});

      array.forEach(folders,function(folder){
        folderStore.newItem({name:folder.title, id:folder.id});
      });
      return folderStore;
    }
  });
});