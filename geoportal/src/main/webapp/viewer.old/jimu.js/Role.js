/**
 * Copy from portal arcgisonline/sharing/dijit/Role.js
 */
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/array",
  "dojo/json",
  "esri/lang"
], function(declare, lang, array, json, esriLang) {
  return declare(null, {
    id: null,
    baseRole: null,
    name: null,
    description: null,
    privileges: [],
    privilegeObj: null,

    constructor: function(params) {
      params = params || {};
      this.id = params.id;
      this.baseRole = params.role;
      this.name = params.name;
      this.description = params.description;
    },

    _initPrivilegesObject: function() {
      this.privilegeObj = {
        portal: {                     // "portal:*"
          admin: {                    // "portal:admin:*"
            inviteUsers: false,       // "portal:admin:inviteUsers"
            disableUsers: false,      // "portal:admin:disableUsers"
            viewUsers: false,         // "portal:admin:viewUsers"
            updateUsers: false,       // "portal:admin:updateUsers"
            deleteUsers: false,       // "portal:admin:deleteUsers"
            changeUserRoles: false,   // "portal:admin:changeUserRoles"
            viewGroups: false,        // "portal:admin:viewGroups"
            updateGroups: false,      // "portal:admin:updateGroups"
            deleteGroups: false,      // "portal:admin:deleteGroups"
            reassignGroups: false,    // "portal:admin:reassignGroups"
            assignToGroups: false,    // "portal:admin:assignToGroups"
            manageEnterpriseGroups: false, // portal:admin:manageEnterpriseGroups"
            viewItems: false,         // "portal:admin:viewItems"
            updateItems: false,       // "portal:admin:updateItems"
            deleteItems: false,       // "portal:admin:deleteItems"
            reassignItems: false,     // "portal:admin:reassignItems"
            manageLicenses: false     // "portal:admin:manageLicenses"
          },
          publisher: {                // "portal:publisher:*"
            publishFeatures: false,   // "portal:publisher:publishFeatures"
            publishTiles: false,      // "portal:publisher:publishTiles"
            publishScenes: false      // "portal:publisher:publishScenes"
          },
          user: {                     // "portal:user:*"
            createGroup: false,       // "portal:user:createGroup"
            joinGroup: false,         // "portal:user:joinGroup"
            joinNonOrgGroup: false,   // "portal:user:joinNonOrgGroup"
            createItem: false,        // "portal:user:createItem"
            shareToGroup: false,      // "portal:user:shareToGroup"
            shareToOrg: false,        // "portal:user:shareToOrg"
            shareToPublic: false,     // "portal:user:shareToPublic"
            shareGroupToOrg: false,   // "portal:user:shareGroupToOrg"
            shareGroupToPublic: false // "portal:user:shareGroupToPublic"
          }
        },
        features: {                   // "features:*"
          user: {                     // "features:user:*"
            edit: false,              // "features:user:edit"
            fullEdit: false           // "features:user:fullEdit"
          }
        },
        opendata: {                   // "opendata:*"
          user: {                     // "opendata:user:*"
            openDataAdmin: false,     // "opendata:user:openDataAdmin"
            designateGroup: false     // "opendata:user:designateGroup"
          }
        },
        premium: {                    // "premium:*"
          user: {                     // "premium:user:*"
            geocode: false,           // "premium:user:geocode"
            networkanalysis: false,   // "premium:user:networkanalysis"
            spatialanalysis: false,   // "premium:user:spatialanalysis"
            geoenrichment: false,     // "premium:user:geoenrichment"
            demographics: false,      // "premium:user:demographics"
            elevation: false          // "premium:user:elevation"
          }
        },
        marketplace: {                // "marketplace:*"
          admin: {                    // "marketplace:admin:*"
            manage: false,            // "marketplace:admin:manage"
            purchase: false,          // "marketplace:admin:purchase"
            startTrial: false         // "marketplace:admin:startTrial"
          }
        }
      };
      // administerData: false     // "features:user:administerData"
      // geotrigger: false,        // "premium:user:geotrigger"
    },

    _readPrivileges: function(privileges) {
      if(esriLang.isDefined(privileges) && privileges instanceof Array) {
        array.forEach(privileges, lang.hitch(this, function(privilege) {
          this._readPrivilege(privilege);
        }));
      }
    },

    _readPrivilege: function(privilege) {
      this._applyEffectToAction(true, privilege); // we're only given the allowed privileges
    },

    _applyEffectToAction: function(allow, action) {
      switch(action) {
        case "portal:admin:inviteUsers":
          this.privilegeObj.portal.admin.inviteUsers = allow;
          break;
        case "portal:admin:disableUsers":
          this.privilegeObj.portal.admin.disableUsers = allow;
          break;
        case "portal:admin:viewUsers":
          this.privilegeObj.portal.admin.viewUsers = allow;
          break;
        case "portal:admin:updateUsers":
          this.privilegeObj.portal.admin.updateUsers = allow;
          break;
        case "portal:admin:deleteUsers":
          this.privilegeObj.portal.admin.deleteUsers = allow;
          break;
        case "portal:admin:changeUserRoles":
          this.privilegeObj.portal.admin.changeUserRoles = allow;
          break;
        case "portal:admin:viewGroups":
          this.privilegeObj.portal.admin.viewGroups = allow;
          break;
        case "portal:admin:updateGroups":
          this.privilegeObj.portal.admin.updateGroups = allow;
          break;
        case "portal:admin:deleteGroups":
          this.privilegeObj.portal.admin.deleteGroups = allow;
          break;
        case "portal:admin:reassignGroups":
          this.privilegeObj.portal.admin.reassignGroups = allow;
          break;
        case "portal:admin:assignToGroups":
          this.privilegeObj.portal.admin.assignToGroups = allow;
          break;
        case "portal:admin:manageEnterpriseGroups":
          this.privilegeObj.portal.admin.manageEnterpriseGroups = allow;
          break;
        case "portal:admin:viewItems":
          this.privilegeObj.portal.admin.viewItems = allow;
          break;
        case "portal:admin:updateItems":
          this.privilegeObj.portal.admin.updateItems = allow;
          break;
        case "portal:admin:deleteItems":
          this.privilegeObj.portal.admin.deleteItems = allow;
          break;
        case "portal:admin:reassignItems":
          this.privilegeObj.portal.admin.reassignItems = allow;
          break;
        case "portal:admin:manageLicenses":
          this.privilegeObj.portal.admin.manageLicenses = allow;
          break;
        case "portal:publisher:publishFeatures":
          this.privilegeObj.portal.publisher.publishFeatures = allow;
          break;
        case "portal:publisher:publishTiles":
          this.privilegeObj.portal.publisher.publishTiles = allow;
          break;
        case "portal:publisher:publishScenes":
          this.privilegeObj.portal.publisher.publishScenes = allow;
          break;
        case "portal:user:createGroup":
          this.privilegeObj.portal.user.createGroup = allow;
          break;
        case "portal:user:joinGroup":
          this.privilegeObj.portal.user.joinGroup = allow;
          break;
        case "portal:user:joinNonOrgGroup":
          this.privilegeObj.portal.user.joinNonOrgGroup = allow;
          break;
        case "portal:user:createItem":
          this.privilegeObj.portal.user.createItem = allow;
          break;
        case "portal:user:shareToGroup":
          this.privilegeObj.portal.user.shareToGroup = allow;
          break;
        case "portal:user:shareToOrg":
          this.privilegeObj.portal.user.shareToOrg = allow;
          break;
        case "portal:user:shareToPublic":
          this.privilegeObj.portal.user.shareToPublic = allow;
          break;
        case "portal:user:shareGroupToOrg":
          this.privilegeObj.portal.user.shareGroupToOrg = allow;
          break;
        case "portal:user:shareGroupToPublic":
          this.privilegeObj.portal.user.shareGroupToPublic = allow;
          break;
        case "features:user:edit":
          this.privilegeObj.features.user.edit = allow;
          break;
        case "features:user:fullEdit":
          this.privilegeObj.features.user.fullEdit = allow;
          break;
        //case "features:user:administerData":
        //  this.privilegeObj.features.user.administerData = allow;
        //  break;
        case "opendata:user:openDataAdmin":
          this.privilegeObj.opendata.user.openDataAdmin = allow;
          break;
        case "opendata:user:designateGroup":
          this.privilegeObj.opendata.user.designateGroup = allow;
          break;
        case "premium:user:geocode":
          this.privilegeObj.premium.user.geocode = allow;
          break;
        case "premium:user:networkanalysis":
          this.privilegeObj.premium.user.networkanalysis = allow;
          break;
        case "premium:user:spatialanalysis":
          this.privilegeObj.premium.user.spatialanalysis = allow;
          break;
        case "premium:user:geoenrichment":
          this.privilegeObj.premium.user.geoenrichment = allow;
          break;
        //  case "premium:user:geotrigger":
        //    this.privilegeObj.premium.user.geotrigger = allow;
        //    break;
        case "premium:user:demographics":
          this.privilegeObj.premium.user.demographics = allow;
          break;
        case "premium:user:elevation":
          this.privilegeObj.premium.user.elevation = allow;
          break;
        case "marketplace:admin:purchase":
          this.privilegeObj.marketplace.admin.purchase = allow;
          break;
        case "marketplace:admin:manage":
          this.privilegeObj.marketplace.admin.manage = allow;
          break;
        case "marketplace:admin:startTrial":
          this.privilegeObj.marketplace.admin.startTrial = allow;
          break;
        default:
          break;
      }
    },

    _applyToAll: function(allow) {
      this.privilegeObj.portal.admin.inviteUsers = allow;
      this.privilegeObj.portal.admin.disableUsers = allow;
      this.privilegeObj.portal.admin.viewUsers = allow;
      this.privilegeObj.portal.admin.updateUsers = allow;
      this.privilegeObj.portal.admin.deleteUsers = allow;
      this.privilegeObj.portal.admin.changeUserRoles = allow;
      this.privilegeObj.portal.admin.viewGroups = allow;
      this.privilegeObj.portal.admin.updateGroups = allow;
      this.privilegeObj.portal.admin.deleteGroups = allow;
      this.privilegeObj.portal.admin.reassignGroups = allow;
      this.privilegeObj.portal.admin.assignToGroups = allow;
      this.privilegeObj.portal.admin.manageEnterpriseGroups = allow;
      this.privilegeObj.portal.admin.viewItems = allow;
      this.privilegeObj.portal.admin.updateItems = allow;
      this.privilegeObj.portal.admin.deleteItems = allow;
      this.privilegeObj.portal.admin.reassignItems = allow;
      this.privilegeObj.portal.admin.manageLicenses = allow;
      this.privilegeObj.portal.publisher.publishFeatures = allow;
      this.privilegeObj.portal.publisher.publishTiles = allow;
      this.privilegeObj.portal.publisher.publishScenes = allow;
      this.privilegeObj.portal.user.createGroup = allow;
      this.privilegeObj.portal.user.joinGroup = allow;
      this.privilegeObj.portal.user.joinNonOrgGroup = allow;
      this.privilegeObj.portal.user.createItem = allow;
      this.privilegeObj.portal.user.shareToGroup = allow;
      this.privilegeObj.portal.user.shareToOrg = allow;
      this.privilegeObj.portal.user.shareToPublic = allow;
      this.privilegeObj.portal.user.shareGroupToOrg = allow;
      this.privilegeObj.portal.user.shareGroupToPublic = allow;
      this.privilegeObj.features.user.edit = allow;
      this.privilegeObj.opendata.user.openDataAdmin = allow;
      this.privilegeObj.opendata.user.designateGroup = allow;
      this.privilegeObj.premium.user.geocode = allow;
      this.privilegeObj.premium.user.networkanalysis = allow;
      this.privilegeObj.premium.user.spatialanalysis = allow;
      this.privilegeObj.premium.user.geoenrichment = allow;
      // this.privilegeObj.premium.user.geotrigger = allow;
      this.privilegeObj.premium.user.demographics = allow;
      this.privilegeObj.premium.user.elevation = allow;
      this.privilegeObj.marketplace.admin.purchase = allow;
      this.privilegeObj.marketplace.admin.manage = allow;
      this.privilegeObj.marketplace.admin.startTrial = allow;
    },

    _buildPrivilegesArray: function() {
      var privs = [];

      // "portal:admin:*"
      if(this.privilegeObj.portal.admin.inviteUsers === true) {
        privs.push("portal:admin:inviteUsers");
      }
      if(this.privilegeObj.portal.admin.disableUsers === true) {
        privs.push("portal:admin:disableUsers");
      }
      if(this.privilegeObj.portal.admin.viewUsers === true) {
        privs.push("portal:admin:viewUsers");
      }
      if(this.privilegeObj.portal.admin.updateUsers === true) {
        privs.push("portal:admin:updateUsers");
      }
      if(this.privilegeObj.portal.admin.deleteUsers === true) {
        privs.push("portal:admin:deleteUsers");
      }
      if(this.privilegeObj.portal.admin.changeUserRoles === true) {
        privs.push("portal:admin:changeUserRoles");
      }
      if(this.privilegeObj.portal.admin.viewGroups === true) {
        privs.push("portal:admin:viewGroups");
      }
      if(this.privilegeObj.portal.admin.updateGroups === true) {
        privs.push("portal:admin:updateGroups");
      }
      if(this.privilegeObj.portal.admin.deleteGroups === true) {
        privs.push("portal:admin:deleteGroups");
      }
      if(this.privilegeObj.portal.admin.reassignGroups === true) {
        privs.push("portal:admin:reassignGroups");
      }
      if(this.privilegeObj.portal.admin.assignToGroups === true) {
        privs.push("portal:admin:assignToGroups");
      }
      if(this.privilegeObj.portal.admin.manageEnterpriseGroups === true) {
        privs.push("portal:admin:manageEnterpriseGroups");
      }
      if(this.privilegeObj.portal.admin.viewItems === true) {
        privs.push("portal:admin:viewItems");
      }
      if(this.privilegeObj.portal.admin.updateItems === true) {
        privs.push("portal:admin:updateItems");
      }
      if(this.privilegeObj.portal.admin.deleteItems === true) {
        privs.push("portal:admin:deleteItems");
      }
      if(this.privilegeObj.portal.admin.reassignItems === true) {
        privs.push("portal:admin:reassignItems");
      }
      if(this.privilegeObj.portal.admin.manageLicenses === true) {
        privs.push("portal:admin:manageLicenses");
      }
      // "portal:publisher:*"
      if(this.privilegeObj.portal.publisher.publishFeatures === true) {
        privs.push("portal:publisher:publishFeatures");
      }
      if(this.privilegeObj.portal.publisher.publishTiles === true) {
        privs.push("portal:publisher:publishTiles");
      }
      if(this.privilegeObj.portal.publisher.publishScenes === true) {
        privs.push("portal:publisher:publishScenes");
      }
      // "portal:user:*"
      if(this.privilegeObj.portal.user.createGroup === true) {
        privs.push("portal:user:createGroup");
      }
      if(this.privilegeObj.portal.user.joinGroup === true) {
        privs.push("portal:user:joinGroup");
      }
      if(this.privilegeObj.portal.user.joinNonOrgGroup === true) {
        privs.push("portal:user:joinNonOrgGroup");
      }
      if(this.privilegeObj.portal.user.createItem === true) {
        privs.push("portal:user:createItem");
      }
      if(this.privilegeObj.portal.user.shareToGroup === true) {
        privs.push("portal:user:shareToGroup");
      }
      if(this.privilegeObj.portal.user.shareToOrg === true) {
        privs.push("portal:user:shareToOrg");
      }
      if(this.privilegeObj.portal.user.shareToPublic === true) {
        privs.push("portal:user:shareToPublic");
      }
      if(this.privilegeObj.portal.user.shareGroupToOrg === true) {
        privs.push("portal:user:shareGroupToOrg");
      }
      if(this.privilegeObj.portal.user.shareGroupToPublic === true) {
        privs.push("portal:user:shareGroupToPublic");
      }
      // "features:user:*"
      if(this.privilegeObj.features.user.edit === true) {
        privs.push("features:user:edit");
      }
      if(this.privilegeObj.features.user.fullEdit === true) {
        privs.push("features:user:fullEdit");
      }
      //if(this.privilegeObj.features.user.administerData === true) {
      //  privs.push("features:user:administerData");
      //}
      // "opendata:*"
      if(this.privilegeObj.opendata.user.openDataAdmin === true) {
        privs.push("opendata:user:openDataAdmin");
      }
      if(this.privilegeObj.opendata.user.designateGroup === true) {
        privs.push("opendata:user:designateGroup");
      }
      // "premium:*"
      if(this.privilegeObj.premium.user.geocode === true) {
        privs.push("premium:user:geocode");
      }
      if(this.privilegeObj.premium.user.networkanalysis === true) {
        privs.push("premium:user:networkanalysis");
      }
      if(this.privilegeObj.premium.user.spatialanalysis === true) {
        privs.push("premium:user:spatialanalysis");
      }
      if(this.privilegeObj.premium.user.geoenrichment === true) {
        privs.push("premium:user:geoenrichment");
      }
      // if(this.privilegeObj.premium.user.geotriggers === true) {
      //   privs.push("premium:user:geotriggers");
      // }
      if(this.privilegeObj.premium.user.demographics === true) {
        privs.push("premium:user:demographics");
      }
      if(this.privilegeObj.premium.user.elevation === true) {
        privs.push("premium:user:elevation");
      }
      if(this.privilegeObj.marketplace.admin.purchase === true) {
        privs.push("marketplace:admin:purchase");
      }
      if(this.privilegeObj.marketplace.admin.manage === true) {
        privs.push("marketplace:admin:manage");
      }
      if(this.privilegeObj.marketplace.admin.startTrial === true) {
        privs.push("marketplace:admin:startTrial");
      }
      return privs;
    },

    /**
     * Checks whether the role is a core User role. Based on the role id.
     * @returns {*|boolean}
     */
    isUser: function() {
      return (esriLang.isDefined(this.id) &&
          (this.id === "org_user" || this.id === "account_user"));
    },

    /**
     * Checks whether the role is a core Publisher role. Based on the role id.
     * @returns {*|boolean}
     */
    isPublisher: function() {
      return (esriLang.isDefined(this.id) &&
          (this.id === "org_publisher" || this.id === "account_publisher"));
    },

    /**
     * Checks whether the role is a core Administrator role. Based on the role id.
     */
    isAdmin: function() {
      return (esriLang.isDefined(this.id) &&
          (this.id === "org_admin" || this.id === "account_admin"));
    },

    /**
     * Checks whether the role is based on the core User role. Also returns true if
     *  it also _is_ the core User role.
     * @returns {*|boolean}
     */
    isBasedOnUser: function() {
      return this.isUser() || (esriLang.isDefined(this.baseRole) &&
          (this.baseRole === "org_user" || this.baseRole === "account_user"));
    },

    /**
     * Checks whether the role is based on the core Publisher role. Also returns true
     * if it also _is_ the core Publisher role.
     * @returns {*|boolean|*|boolean}
     */
    isBasedOnPublisher: function() {
      return this.isPublisher() || (esriLang.isDefined(this.baseRole) &&
          (this.baseRole === "org_publisher" ||
          this.baseRole === "account_publisher"));
    },

    /**
     * Checks whether the role is based on the core Administrator role. Also returns
     * true if it also _is_ the core Administrator role.
     * @returns {*|boolean}
     */
    isBasedOnAdmin: function() {
      return this.isAdmin() ||
          (esriLang.isDefined(this.baseRole) &&
          (this.baseRole === "org_admin" || this.baseRole === "account_admin"));
    },

    /**
     * Checks whether the role is a custom role. Based on the role id.
     * @returns {boolean|*}
     */
    isCustom: function() {
      return (!this.isUser() && !this.isPublisher() && !this.isAdmin() &&
          esriLang.isDefined(this.id) && this.id.length > 0);
    },

    /**
     * Checks whether the privilege "portal:admin:inviteUsers" is granted.
     * @returns {null|boolean}
     */
    canInviteUsers: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.inviteUsers;
    },

    /**
     * Checks whether the privilege "portal:admin:disableUsers" is granted.
     * @returns {null|boolean}
     */
    canDisableUsers: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.disableUsers;
    },

    /**
     * Checks whether the privilege "portal:admin:viewUsers" is granted.
     * @returns {null|boolean}
     */
    canViewUsers: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.viewUsers;
    },

    /**
     * Checks whether the privilege "portal:admin:updateUsers" is granted.
     * @returns {null|boolean}
     */
    canUpdateUsers: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.updateUsers;
    },

    /**
     * Checks whether the privilege "portal:admin:deleteUsers" is granted.
     * @returns {null|boolean}
     */
    canDeleteUsers: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.deleteUsers;
    },

    /**
     * Checks whether the privilege "portal:admin:changeUserRoles" is granted.
     * @returns {null|boolean}
     */
    canChangeUserRoles: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.changeUserRoles;
    },

    /**
     * Checks whether the privilege "portal:admin:viewGroups" is granted.
     * @returns {null|boolean}
     */
    canViewOrgGroups: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.viewGroups;
    },

    /**
     * Checks whether the privilege "portal:admin:updateGroups" is granted.
     * @returns {null|boolean}
     */
    canUpdateOrgGroups: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.updateGroups;
    },

    /**
     * Checks whether the privilege "portal:admin:deleteGroups" is granted.
     * @returns {null|boolean}
     */
    canDeleteOrgGroups: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.deleteGroups;
    },

    /**
     * Checks whether the privilege "portal:admin:reassignGroups" is granted.
     * @returns {null|boolean}
     */
    canReassignOrgGroups: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.reassignGroups;
    },

    /**
     * Checks whether the privilege "portal:admin:assignToGroups" is granted.
     * @returns {null|boolean}
     */
    canAssignUsersToOrgGroups: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.assignToGroups;
    },

    /**
     * Checks whether the privilege "portal:admin:manageEnterpriseGroups" is granted.
     * @returns {null|boolean}
     */
    canManageEnterpriseGroups: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.manageEnterpriseGroups;
    },

    /**
     * Checks whether the privilege "portal:admin:viewItems" is granted.
     * @returns {null|boolean}
     */
    canViewOrgItems: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.viewItems;
    },

    /**
     * Checks whether the privilege "portal:admin:updateItems" is granted.
     * @returns {null|boolean}
     */
    canUpdateOrgItems: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.updateItems;
    },

    /**
     * Checks whether the privilege "portal:admin:deleteItems" is granted.
     * @returns {null|boolean}
     */
    canDeleteOrgItems: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.deleteItems;
    },

    /**
     * Checks whether the privilege "portal:admin:reassignItems" is granted.
     * @returns {null|boolean}
     */
    canReassignOrgItems: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.reassignItems;
    },

    /**
     * Checks whether the privilege "portal:admin:manageLicenses" is granted.
     * @returns {null|boolean}
     */
    canManageLicenses: function() {
      return this.privilegeObj && this.privilegeObj.portal.admin.manageLicenses;
    },

    /**
     * Checks whether the privilege "portal:user:createGroup" is granted.
     * @returns {null|boolean}
     */
    canCreateGroup: function() {
      return this.privilegeObj && this.privilegeObj.portal.user.createGroup;
    },

    /**
     * Checks whether the privilege "portal:user:joinGroup" is granted.
     * @returns {null|boolean}
     */
    canJoinOrgGroup: function() {
      return this.privilegeObj && this.privilegeObj.portal.user.joinGroup;
    },

    /**
     * Checks whether the privilege "portal:user:joinNonOrgGroup" is granted.
     * @returns {null|boolean}
     */
    canJoinNonOrgGroup: function() {
      return this.privilegeObj && this.privilegeObj.portal.user.joinNonOrgGroup;
    },

    /**
     * Checks whether the privilege "portal:publisher:publishFeatures" is granted.
     * @returns {null|boolean}
     */
    canPublishFeatures: function() {
      return this.privilegeObj && this.privilegeObj.portal.publisher.publishFeatures;
    },

    /**
     * Checks whether the privilege "portal:publisher:publishTiles" is granted.
     * @returns {null|boolean}
     */
    canPublishTiles: function() {
      return this.privilegeObj && this.privilegeObj.portal.publisher.publishTiles;
    },

    /**
     * Checks whether the privilege "portal:publisher:publishScenes" is granted.
     * @returns {null|boolean}
     */
    canPublishScenes: function() {
      return this.privilegeObj && this.privilegeObj.portal.publisher.publishScenes;
    },

    /**
     * Checks whether the privilege "portal:user:createItem" is granted.
     * @returns {null|boolean}
     */
    canCreateItem: function() {
      return this.privilegeObj && this.privilegeObj.portal.user.createItem;
    },

    /**
     * Checks whether the privilege "portal:user:shareToGroup" is granted.
     * @returns {null|boolean}
     */
    canShareItemToGroup: function() {
      return this.privilegeObj && this.privilegeObj.portal.user.shareToGroup;
    },

    /**
     * Checks whether the privilege "portal:user:shareToOrg" is granted.
     * @returns {null|boolean}
     */
    canShareItemToOrg: function() {
      return this.privilegeObj && this.privilegeObj.portal.user.shareToOrg;
    },

    /**
     * Checks whether the privilege "portal:user:shareToPublic" is granted.
     * @returns {null|boolean}
     */
    canShareItemToPublic: function() {
      return this.privilegeObj && this.privilegeObj.portal.user.shareToPublic;
    },

    /**
     * Checks whether the privilege "portal:user:shareGroupToOrg" is granted.
     * @returns {null|boolean}
     */
    canShareGroupToOrg: function() {
      return this.privilegeObj && this.privilegeObj.portal.user.shareGroupToOrg;
    },

    /**
     * Checks whether the privilege "portal:user:shareGroupToPublic" is granted.
     * @returns {null|boolean}
     */
    canShareGroupToPublic: function() {
      return this.privilegeObj && this.privilegeObj.portal.user.shareGroupToPublic;
    },

    /**
     * Checks whether the privilege "features:user:edit" is granted.
     * @returns {null|boolean}
     */
    canEditFeatures: function() {
      return this.privilegeObj && this.privilegeObj.features.user.edit;
    },

    /**
     * Checks whether the privilege "features:user:fullEdit" is granted.
     * @returns {null|boolean}
     */
    canEditFeaturesFullControl: function() {
      return this.privilegeObj && this.privilegeObj.features.user.fullEdit;
    },

    ///**
    // * Checks whether the privilege "features:user:administerData" is granted.
    // * @returns {null|boolean}
    // */
    //canAdministerFeatures: function() {
    //  return this.privilegeObj && this.privilegeObj.features.user.administerData;
    //},

    /**
     * Checks whether the privilege "opendata:user:openDataAdmin" is granted.
     * @returns {null|boolean}
     */
    canManageOpenData: function() {
      return this.privilegeObj && this.privilegeObj.opendata.user.openDataAdmin;
    },

    /**
     * Checks whether the privilege "opendata:user:designateGroup" is granted.
     * @returns {null|boolean}
     */
    canDesignateOpenDataGroups: function() {
      return this.privilegeObj && this.privilegeObj.opendata.user.designateGroup;
    },

    /**
     * Checks whether the privilege "premium:user:geocode" is granted.
     * @returns {null|boolean}
     */
    canUseGeocode: function() {
      return this.privilegeObj && this.privilegeObj.premium.user.geocode;
    },

    /**
     * Checks whether the privilege "premium:user:networkanalysis" is granted.
     * @returns {null|boolean}
     */
    canUseNetworkAnalysis: function() {
      return this.privilegeObj && this.privilegeObj.premium.user.networkanalysis;
    },

    /**
     * Checks whether the privilege "premium:user:spatialanalysis" is granted.
     * @returns {null|boolean}
     */
    canUseSpatialAnalysis: function() {
      return this.privilegeObj && this.privilegeObj.premium.user.spatialanalysis;
    },

    /**
     * Checks whether the privilege "premium:user:geoenrichment" is granted.
     * @returns {null|boolean}
     */
    canUseGeoenrichment: function() {
      return this.privilegeObj && this.privilegeObj.premium.user.geoenrichment;
    },

    /**
    * Checks whether the privilege "premium:user:geotrigger" is granted.
    * @returns {null|boolean}
    */
    // canUseGeotrigger: function() {
    //   return this.privilegeObj && this.privilegeObj.premium.user.geotrigger;
    // },

    /**
     * Checks whether the privilege "premium:user:demographics" is granted.
     * @returns {null|boolean}
     */
    canUseDemographics: function() {
      return this.privilegeObj && this.privilegeObj.premium.user.demographics;
    },

    /**
     * Checks whether the privilege "premium:user:elevation" is granted.
     * @returns {null|boolean}
     */
    canUseElevation: function() {
      return this.privilegeObj && this.privilegeObj.premium.user.elevation;
    },

    /**
     * Checks whether the privilege "marketplace:admin:purchase" is granted.
     * @returns {null|boolean}
     */
    canPurchaseMarketplace: function() {
      return this.privilegeObj && this.privilegeObj.marketplace.admin.purchase;
    },

    /**
     * Checks whether the privilege "marketplace:admin:manage" is granted.
     * @returns {null|boolean|*}
     */
    canManageMarketplace: function() {
      return this.privilegeObj && this.privilegeObj.marketplace.admin.manage;
    },

    /**
     * Checks whether the privilege "marketplace:admin:startTrial" is granted.
     * @returns {null|boolean|*}
     */
    canTrialMarketplace: function() {
      return this.privilegeObj && this.privilegeObj.marketplace.admin.startTrial;
    },

    /**
     * Sets the roles privileges to those passed as input. Overwrites whatever
     * privileges were defined for the role beforehand. If passed null or
     * undefined or an non-standard privileges object, it will reset the privileges
     * to default; all denied.
     * @param privileges
     */
    setPrivileges: function(privileges) {
      this.privileges = privileges;
      this._initPrivilegesObject();
      if(esriLang.isDefined(privileges)) {
        this._readPrivileges(privileges);
      }
    },

    /**
     * Stringify the role metadata and privileges together.
     * @returns {*}
     */
    stringify: function() {
      return json.stringify({
        id: this.id,
        name: this.name,
        description: this.description,
        privileges: this._buildPrivilegesArray()
      });
    },

    /**
     * Stringify the role metadata (i.e., id, name, and description).
     * @returns {*}
     */
    stringifyRole: function() {
      return json.stringify({
        id: this.id,
        name: this.name,
        description: this.description
      });
    },

    /**
     * Stringify the role privileges.
     * @returns {*}
     */
    stringifyPrivileges: function() {
      return json.stringify({privileges: this._buildPrivilegesArray()});
    },

    /**
     * Stringify the role metadata and privileges together with pretty print.
     * @return {*}
     */
    stringifyPretty: function() {
      return json.stringify({
        id: this.id,
        name: this.name,
        description: this.description,
        privileges: this._buildPrivilegesArray()
      }, null, "  ");
    }
  });
});
