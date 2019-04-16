///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/lang',
    'esri/lang',
    "dojo/_base/array",
    "dojo/dom-style",
    'dojo/on',
    "dojo/dom",
    "dojo/query",
    "dojo/topic",
    'dojo/text!./templates/ShareOptions.html',
    'jimu/shareUtils',
    "dijit/form/Textarea",
    "dijit/form/CheckBox",
    "dijit/layout/BorderContainer"
  ],
  function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, lang, esriLang, array, domStyle,
           on, dom, query, topic, template, shareUtils) {
    /*global dijit*/

    var so = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
      templateString: template,
      declaredClass: "jimu.dijit.ShareOptions",

      postMixInProperties: function() {
        this.inherited(arguments);
        this.nls = window.jimuNls.shareOptions;
        //TODO this._checkboxImgUrl this.i18n.openData;
      },

      constructor: function(portalUrl) {
        this.portalUrl = portalUrl;
      },
      startup: function() {
        shareUtils.getShareInfo(this.portalUrl).then(lang.hitch(this, function(result) {
          this._initShow(result);
          this.own(on(dom.byId("share-everyone-check"), "change", lang.hitch(this, this.clickEveryone)));
        }));
      },

      _initShow: function(shareInfo) {
        this.shareInfo = shareInfo;
        this.shareInfo.items = [this.shareInfo.item];
        this.shareInfo.sortField = "title";
        // same logic is in ShareMapDlg.js showShareOptions()
        // this.isAdmin is true if the user is an admin user and the item is owned by somebody else in his org
        // this.isAdmin is false if the user is an admin user and owns this item, of if the user is not an admin
        if ((this.shareInfo.userRole.isAdmin() ||
          ((this.shareInfo._roleCanUpdateItems && this.shareInfo._roleCanShare) ||
          this.shareInfo._roleCanShareOthersItems)) && this.shareInfo.itemUser) {
          // only use showAdmin if admin is not viewing their own content, does not require update privileges
          this.showAdmin(this.shareInfo.user.groups, this.shareInfo.itemUser, this.shareInfo.adminGroups);
        } else if (this.shareInfo.user && shareUtils._isUserOwnTheApp(this.shareInfo.user)) {
          // owner of item
          this.show(this.shareInfo.user.groups);
        } else if (this.shareInfo.user &&
          (this.shareInfo.item.access === "public" || this.shareInfo.item.access === "shared" ||
          (this.shareInfo.item.access === "org" && this.shareInfo.currentUser.orgId))) {
          // could be admin of an org that does not own the item
          // this.isAdmin is only true if the user is admin of the org that owns the item
          this.showGroups(this.shareInfo.user.groups);
        } else {
          this.show(this.shareInfo.user.groups);
        }
      },

      clear: function() {
        dom.byId("share-groups-list").innerHTML = "";
        dom.byId("share-everyone-check").setAttribute('value', false);
        dom.byId("share-account-check").setAttribute('value', false);
        dom.byId("share-groups-check").setAttribute('value', false);
        //dojo.style(dojo.byId("share-everyone-check_div"), "display", "none");
        //dojo.style(dojo.byId("share-account-check_div"), "display", "none");
        domStyle.set(dom.byId("share-everyone-check_div"), "display", "none");
        domStyle.set(dom.byId("share-account-check_div"), "display", "none");

        //dojo.disconnect(this.shareConnect);
        this.shareInfo.shareType = "item";
      },

      showAdmin: function(userGroups, itemUser, adminGroups) {
        this.shareInfo.itemUser = itemUser;
        this.shareInfo.userGroups = array.filter(userGroups || [], lang.hitch(this, function() {
          return (!this.shareInfo.item.capabilities || !this.shareInfo.item.capabilities.length);
        }));
        this.shareInfo.userGroups.sort(lang.hitch(this, this._sortFunc));
        this.shareInfo.adminGroups = this.filterAdminGroups(adminGroups);
        // continue with the dialog boot up after we've checked for the user being a part of an organization
        this.checkForAccount("admin");
      },
      filterAdminGroups: function(adminGroups) {
        if (adminGroups) {
          // filter out admin user groups that the admin and item owner are both members of
          var groupIds = [];
          for (var i = 0; i < this.shareInfo.user.groups.length; i++) {
            groupIds.push(this.shareInfo.user.groups[i].id);
          }

          var tmpGroups = [];
          for (i = 0; i < adminGroups.length; i++) {
            // if this group hasn't already been seen, add it to the list
            if (array.indexOf(groupIds, adminGroups[i].id) === -1 &&
              (!adminGroups[i].capabilities || !adminGroups[i].capabilities.length)) {
              tmpGroups.push(adminGroups[i]);
            }
          }
          return tmpGroups;
        }
        return null;
      },
      showGroups: function(userGroups) {
        this.shareInfo.userGroups = this.filterOwnedGroups(userGroups);
        if (this.shareInfo.userGroups) {
          this.shareInfo.userGroups.sort(lang.hitch(this, this._sortFunc));
        }
        this.clear();
        this.shareInfo.shareType = "group";
        // can't access the detailed item info for a publicly shared item, so just build list
        this.checkForAccount("group");
      },
      filterOwnedGroups: function(groups) {
        if (groups) {
          var tmpGroups = [];
          var group;
          for (var i = 0; i < groups.length; i++) {
            group = groups[i];
            if ((group.userMembership &&
              (group.userMembership.memberType === "owner" || group.userMembership.memberType === "admin")) &&
              (!group.capabilities || !group.capabilities.length)) {
              tmpGroups.push(group);
            }
          }
          return tmpGroups;
        }
        return null;
      },
      show: function(userGroups/*, itemUser*/) {
        //if (itemUser && itemUser !== null) {
        //this.itemUser = itemUser;
        //}
        this.shareInfo.userGroups = this.filterViewOnlyGroups(userGroups);
        //if(esri.isDefined(this.userGroups)) {
        this.shareInfo.userGroups.sort(lang.hitch(this, this._sortFunc));
        //}

        // continue with the dialog boot up after we've checked for the user being a part of an organization
        this.checkForAccount("item");
      },
      filterViewOnlyGroups: function(groups) {
        if (groups) {
          var tmpGroups = [];
          var group;
          for (var i = 0; i < groups.length; i++) {
            group = groups[i];
            // only add the group if the user is the owner/admin or the group is not view only
            if ((!group.capabilities || !group.capabilities.length) &&
              ((group.userMembership &&
              (group.userMembership.memberType === "owner" || group.userMembership.memberType === "admin")) ||
              (!esriLang.isDefined(group.isViewOnly) || !group.isViewOnly))) {
              tmpGroups.push(group);
            }
          }
          return tmpGroups;
        }
        return null;
      },

      checkForAccount: function(shareType) {
        dom.byId("share-account-check-label").innerHTML = this.shareInfo.organization.name;
        // hide org sharing if privilege denied
        if (this.shareInfo._isCustomRole && !this.shareInfo._roleCanShareToOrg &&
          !this.shareInfo._roleCanShareOthersItemsToOrg) {
          domStyle.set(dom.byId("share-account-check_div"), "display", "none");
        }
        //showAdminContinue
        this.clear();
        this.shareInfo.shareType = shareType;
        //TODO ONE item only
        // for (var i = 0; i < this.items.length; i++) {
        //   var item = this.items[i];
        //   item.sharing = null;
        //   var url = esriGeowConfig.restBaseUrl + 'content/users/' +
        //     (this.itemUser ? (this.itemUser.username ? this.itemUser.username : this.itemUser.email) : this.user.email);
        //   if ((esri.isDefined(item.folderId) && item.folderId !== '/') || (esri.isDefined(item.ownerFolder) && item.ownerFolder !== '/')) {
        //     url += '/' + (item.folderId || item.ownerFolder);
        //   }
        //   url += '/items/' + item.id;
        //   this.util.getJson(url, dojo.hitch(this, getDetailedInfoHandler, item));
        // }
        var oneItem = this.shareInfo.items[0];
        this.shareInfo.lowestAccess = this.findLowestAccessLevel(this.shareInfo.items);
        shareUtils.getItemById(oneItem, this.portalUrl).then(
          (lang.hitch(this, function(result) {
            //TODO get sharingInfo
            oneItem.sharing = result.sharing;

            if (this.shareInfo.shareType === "admin") {
              //1 admin user
              shareUtils.getItemByUserAndItemId(oneItem, this.shareInfo.itemUser, this.shareInfo.user,
                this.portalUrl).then(lang.hitch(this, function(result) {
                oneItem.sharing = result.sharing;
                this.buildAdminList();
              }));
            } else if (this.shareInfo.shareType === "group") {
              //3 in same org/
              shareUtils.getItemsGroups(oneItem, this.portalUrl).then(lang.hitch(this, function(result) {
                var groupIds = [];
                if (result.admin) {
                  for (var i = 0; i < result.admin.length; i++) {
                    groupIds.push(result.admin[i].id);
                  }
                }
                oneItem.sharing = {
                  groups: groupIds
                };
                this.buildGroupList();
              }));
            } else if (this.shareInfo.shareType === "item") {
              //2 creater
              shareUtils.getItemByUserAndItemId(oneItem, this.shareInfo.itemUser, this.shareInfo.user,
                this.portalUrl).then(lang.hitch(this, function(result) {
                  oneItem.sharing = result.sharing;
                  this.buildList();
                }));
            }
          })));
      },

      buildAdminList: function() {
        var i, j, k;
        if ((this.shareInfo.user.groups && this.shareInfo.user.groups.length > 0) ||
          (this.shareInfo.adminGroups && this.shareInfo.adminGroups.length > 0 && this.shareInfo.lowestAccess > 1)) {
          if (!this.shareInfo._isCustomRole || this.shareInfo._roleCanShareToGroup ||
            this.shareInfo._roleCanShareOthersItemsToGroup) {
            domStyle.set(dom.byId("share-groups-div"), "display", "block");
          } else {
            domStyle.set(dom.byId("share-groups-div"), "display", "none");
          }
        }
        // determine which items are shared to groups
        this.shareInfo.itemsAreSharedToGroups = ",";
        var groupCounter = [];
        var item = null,
          groupId = null,
          cntr = [];
        for (i = 0; i < this.shareInfo.items.length; i++) {
          item = this.shareInfo.items[i];
          //this.itemsInfo["_" + item.id] = {};
          //this.itemsInfo["_" + item.id].itemsIsSharedToGroups = ",";
          //eval("this.itemsInfo._" + item.id + " = new Object();");
          //eval("this.itemsInfo._" + item.id).itemsIsSharedToGroups = ",";
          if (item.sharing) {
            for (k = 0; k < item.sharing.groups.length; k++) {
              groupId = item.sharing.groups[k];
              //this.itemsInfo["_" + item.id].itemsIsSharedToGroups += groupId + ",";
              //eval("this.itemsInfo._" + item.id).itemsIsSharedToGroups += groupId + ",";
              if (this.shareInfo.itemsAreSharedToGroups.indexOf("," + groupId + ",") === -1) {
                this.shareInfo.itemsAreSharedToGroups += groupId + ",";
                cntr = [];
                cntr[0] = groupId;
                cntr[1] = 1;
                groupCounter[groupCounter.length] = cntr;
              } else {
                for (j = 0; j < groupCounter.length; j++) {
                  if (groupCounter[j][0] === groupId) {
                    groupCounter[j][1] = groupCounter[j][1] + 1;
                    break;
                  }
                }
              }
            }
          }
        }
        // item = this.shareInfo.items[0];
        // //this.itemsInfo["_" + item.id] = {};
        // //this.itemsInfo["_" + item.id].itemsIsSharedToGroups = ",";
        // //eval("this.itemsInfo._" + item.id + " = new Object();");
        // //eval("this.itemsInfo._" + item.id).itemsIsSharedToGroups = ",";
        // if (item.sharing) {
        //   for (k = 0; k < item.sharing.groups.length; k++) {
        //     groupId = item.sharing.groups[k];
        //     //this.itemsInfo["_" + item.id].itemsIsSharedToGroups += groupId + ",";
        //     //eval("this.itemsInfo._" + item.id).itemsIsSharedToGroups += groupId + ",";
        //     if (this.shareInfo.itemsAreSharedToGroups.indexOf("," + groupId + ",") === -1) {
        //       this.shareInfo.itemsAreSharedToGroups += groupId + ",";
        //       cntr = [];
        //       cntr[0] = groupId;
        //       cntr[1] = 1;
        //       groupCounter[groupCounter.length] = cntr;
        //     } else {
        //       for (j = 0; j < groupCounter.length; j++) {
        //         if (groupCounter[j][0] === groupId) {
        //           groupCounter[j][1] = groupCounter[j][1] + 1;
        //           break;
        //         }
        //       }
        //     }
        //   }
        // }
        var html = "";
        var hasOne = false;
        var group;
        var checked;
        var count;
        for (i = 0; i < this.shareInfo.user.groups.length; i++) {
          group = this.shareInfo.user.groups[i];
          checked = "";
          count = this.shareInfo.items.length;
          if (this.shareInfo.itemsAreSharedToGroups.indexOf("," + group.id + ",") > -1) {
            checked = "checked";
            hasOne = true;
            for (j = 0; j < groupCounter.length; j++) {
              if (groupCounter[j][0] === group.id) {
                count = groupCounter[j][1];
                break;
              }
            }
          }
          if (count < this.shareInfo.items.length) {
            // not all items are shared to this group
            html += "<div id=\"img_group_" + i + "_div\" style=\"display:block;\">" +
              "<table cellpadding='0' cellspacing='0' class='share-groups-table'><tr><td width='17' valign='bottom'>" +
              "<img id=\"img_group_" + i + "\" src=\"" + this._checkboxImgUrl + "\" border=\"0\">" +
              "</td><td>" + group.title + "</td></tr></table></div>" +
              "<div id=\"group_" + i + "_div\" style=\"display:none;\">" +
              "<table cellpadding='0' cellspacing='0' class='share-groups-table'><tr><td width='17' valign='bottom'>" +
              "<input id=\"group_" + i + "\" " + checked + " value=\"" + group.id + "\" type=\"checkbox\" " +
              "class='share-groups-input-checkbox' dojoType=\"dijit.form.Checkbox\" />" +
              "</td><td><label for='group_" + i + "' class='labels'>" + group.title + "</label>";
            html = this._addOpenDataStr(group, html);
            html += "</td></tr></table></div>";
          } else {
            html += "<div id=\"group_" + i + "_div\" style=\"display:block;\">" +
              "<table cellpadding='0' cellspacing='0' class='share-groups-table'><tr><td width='17' valign='bottom'>" +
              "<input id=\"group_" + i + "\" " + checked + " value=\"" + group.id + "\" type=\"checkbox\" " +
              "class='share-groups-input-checkbox' dojoType=\"dijit.form.Checkbox\" />" +
              "</td><td><label for='group_" + i + "' class='labels'>" + group.title + "</label>";
            html = this._addOpenDataStr(group, html);
            html += "</td></tr></table></div>";
          }
        }

        // add admin user groups if there are any that the user does not belong to already
        // admin's groups will only display if the lowest level of all items is account or public
        if (this.shareInfo.adminGroups && this.shareInfo.adminGroups.length && this.shareInfo.lowestAccess > 1) {
          html += "<div style=\"display:block;\"><hr/></div>";

          for (var m = 0; m < this.shareInfo.adminGroups.length; m++) {
            group = this.shareInfo.adminGroups[m];
            checked = "";
            count = this.shareInfo.items.length;
            if (this.shareInfo.itemsAreSharedToGroups.indexOf("," + group.id + ",") > -1) {
              checked = "checked";
              hasOne = true;
              for (var n = 0; n < groupCounter.length; n++) {
                if (groupCounter[n][0] === group.id) {
                  count = groupCounter[n][1];
                  break;
                }
              }
            }
            if (count < this.shareInfo.items.length) {
              // not all items are shared to this group
              html += "<div id=\"img_group_" + (m + i) + "_div\" style=\"display:block;\">" +
                "<table cellpadding='0' cellspacing='0' class='share-groups-table'><tr>" +
                "<td width='17' valign='bottom'>" +
                "<img id=\"img_group_" + (m + i) + "\" src=\"" + this._checkboxImgUrl + "\" border=\"0\">" +
                "</td><td>" + group.title + "</td></tr></table></div>" +
                "<div id=\"group_" + (m + i) + "_div\" style=\"display:none;\">" +
                "<table cellpadding='0' cellspacing='0'><tr><td width='17' valign='bottom'>" +
                "<input id=\"group_" + (m + i) + "\" " + checked + " value=\"" + group.id + "\" type=\"checkbox\"" +
                "class='share-groups-input-checkbox' dojoType=\"dijit.form.Checkbox\" />" +
                "</td><td><label for='group_" + i + "'>" + group.title + "</label>";
              html = this._addOpenDataStr(group, html);
              html += "</td></tr></table></div>";
            } else {
              html += "<div id=\"group_" + (m + i) + "_div\" style=\"display:block;\">" +
                "<table cellpadding='0' cellspacing='0' class='share-groups-table'><tr>" +
                "<td width='17' valign='bottom'>" +
                "<input id=\"group_" + (m + i) + "\" " + checked + " value=\"" + group.id + "\" type=\"checkbox\"" +
                "class='share-groups-input-checkbox' dojoType=\"dijit.form.Checkbox\" />" +
                "</td><td><label for='group_" + i + "'>" + group.title + "</label>";
              html = this._addOpenDataStr(group, html);
              html += "</td></tr></table></div>";
            }
          }
        }

        // it's too early to use the input element here
        this.own(on(dom.byId("share-groups-list"), "click", lang.hitch(this, this.checkGroup)));
        dom.byId("share-groups-list").innerHTML = html;

        if (this.shareInfo.organization) {
          var sharedToAccountCounter = 0;
          for (i = 0; i < this.shareInfo.items.length; i++) {
            if (this.shareInfo.items[i].sharing && this.shareInfo.items[i].sharing.access === "org") {
              sharedToAccountCounter++;
            }
          }

          if (!this.shareInfo._isCustomRole || this.shareInfo._roleCanShareToOrg ||
            this.shareInfo._roleCanShareOthersItemsToOrg) {
            if (sharedToAccountCounter === 0) {
              dijit.byId("share-account-check").set("checked", false);
              dijit.byId("share-account-check").set("disabled", false);
              domStyle.set(dom.byId("share-account-check_div"), "display", "block");
            } else if (sharedToAccountCounter === this.shareInfo.items.length) {
              dijit.byId("share-account-check").set("checked", true);
              dijit.byId("share-account-check").set("disabled", false);
              domStyle.set(dom.byId("share-account-check_div"), "display", "block");
            } else {
              dijit.byId("share-account-check").set("checked", true);
              dijit.byId("share-account-check").set("disabled", true);
              domStyle.set(dom.byId("share-account-check_div"), "display", "block");
            }
          } else {
            // share account enable
            dijit.byId("share-account-check").set("disabled", true);
            domStyle.set(dom.byId("share-account-check_div"), "display", "none");
          }
        }

        if (!this.shareInfo.organization || this.shareInfo._orgUserCanSharePublicOrOverride) {
          var sharedToEveryoneCounter = 0;
          for (i = 0; i < this.shareInfo.items.length; i++) {
            if (this.shareInfo.items[i].sharing && this.shareInfo.items[i].sharing.access === "public") {
              sharedToEveryoneCounter++;
            }
          }
          if (sharedToEveryoneCounter === 0) {
            dijit.byId("share-everyone-check").set("checked", false);
            domStyle.set(dom.byId("share-everyone-check_div"), "display", "block");
          } else if (sharedToEveryoneCounter === this.shareInfo.items.length) {
            dijit.byId("share-everyone-check").set("checked", true);
            domStyle.set(dom.byId("share-everyone-check_div"), "display", "block");
            if (this.shareInfo.organization &&
              (!this.shareInfo._isCustomRole || this.shareInfo._roleCanShareToOrg ||
              this.shareInfo._roleCanShareOthersItemsToOrg)) {
              dijit.byId("share-account-check").set("checked", true);
              dijit.byId("share-account-check").set("disabled", dijit.byId("share-everyone-check").get("checked"));
            }
          } else {
            dijit.byId("share-everyone-check").set("checked", true);
            if (this.shareInfo.organization &&
              (!this.shareInfo._isCustomRole || this.shareInfo._roleCanShareToOrg ||
              this.shareInfo._roleCanShareOthersItemsToOrg)) {
              dijit.byId("share-account-check").set("checked", true);
              dijit.byId("share-account-check").set("disabled", dijit.byId("share-everyone-check").get("checked"));
            }
          }
          this.clickEveryone();
          //this.own(on(dom.byId("share-everyone-check"), "click", lang.hitch(this, this.clickEveryone)));
        } else {
          dijit.byId("share-everyone-check").set("checked", false);
          domStyle.set(dom.byId("share-everyone-check_div"), "display", "none");
        }

        if (hasOne) {
          dijit.byId("share-groups-check").set("checked", true);
        } else {
          dijit.byId("share-groups-check").set("checked", false);
        }
        this.own(on(dom.byId("share-groups-check"), "click", lang.hitch(this, this.checkGroups)));

        if (this.shareInfo.organization &&
          (!this.shareInfo._isCustomRole || this.shareInfo._roleCanShareToOrg ||
          this.shareInfo._roleCanShareOthersItemsToOrg)) {
          this.own(on(dom.byId("share-account-check"), "click", lang.hitch(this, this.clickAccount)));
        }

        //dojo.publish("shareOptionsSetup");
      },
      buildList: function(/*counter*/) {
        var i, j;

        if (!this.shareInfo._isCustomRole || this.shareInfo._roleCanShareToGroup ||
          this.shareInfo._roleCanShareOthersItemsToGroup) {
          if (this.shareInfo.userGroups && this.shareInfo.userGroups.length > 0) {
            domStyle.set(dom.byId("share-groups-div"), "display", "block");
          } else {
            //dojo.publish("notMemberOfAnyGroups");
          }
        } else {
          domStyle.set(dom.byId("share-groups-div"), "display", "none");
        }

        this.shareInfo.itemsAreSharedToGroups = ",";
        var groupCounter = [];
        for (i = 0; i < this.shareInfo.items.length; i++) {
          var item = this.shareInfo.items[i];
          //this.itemsInfo["_" + item.id] = {};
          //this.itemsInfo["_" + item.id].itemsIsSharedToGroups = ",";
          //eval("this.itemsInfo._" + item.id + " = new Object();");
          //eval("this.itemsInfo._" + item.id).itemsIsSharedToGroups = ",";
          if (item.sharing) {
            for (var k = 0; k < item.sharing.groups.length; k++) {
              var groupId = item.sharing.groups[k];
              //this.itemsInfo["_" + item.id].itemsIsSharedToGroups += groupId + ",";
              //eval("this.itemsInfo._" + item.id).itemsIsSharedToGroups += groupId + ",";
              if (this.shareInfo.itemsAreSharedToGroups.indexOf("," + groupId + ",") === -1) {
                this.shareInfo.itemsAreSharedToGroups += groupId + ",";
                var cntr = [];
                cntr[0] = groupId;
                cntr[1] = 1;
                groupCounter[groupCounter.length] = cntr;
              } else {
                for (j = 0; j < groupCounter.length; j++) {
                  if (groupCounter[j][0] === groupId) {
                    groupCounter[j][1] = groupCounter[j][1] + 1;
                    break;
                  }
                }
              }
            }
          }
        }

        var html = "";
        var hasOne = false;
        for (i = 0; i < this.shareInfo.userGroups.length; i++) {
          var group = this.shareInfo.userGroups[i];
          var checked = "";
          var count = this.shareInfo.items.length;
          if (this.shareInfo.itemsAreSharedToGroups.indexOf("," + group.id + ",") > -1) {
            checked = "checked";
            hasOne = true;
            for (j = 0; j < groupCounter.length; j++) {
              if (groupCounter[j][0] === group.id) {
                count = groupCounter[j][1];
                break;
              }
            }
          }
          if (count < this.shareInfo.items.length) {
            // not all items are shared to this group
            html += "<div id=\"img_group_" + i + "_div\" style=\"display:block;\">" +
              "<table cellpadding='0' cellspacing='0' class='share-groups-table'><tr><td width='17' valign='bottom'>" +
              "<img id=\"img_group_" + i + "\" src=\"" + this._checkboxImgUrl + "\" border=\"0\">" +
              "</td><td>" + group.title + "</td></tr></table></div>" +
              "<div id=\"group_" + i + "_div\" style=\"display:none;\">" +
              "<table cellpadding='0' cellspacing='0'><tr><td width='17' valign='bottom'>" +
              "<input id=\"group_" + i + "\" " + checked + " value=\"" + group.id + "\" type=\"checkbox\"" +
              "class='share-groups-input-checkbox' dojoType=\"dijit.form.Checkbox\" />" +
              "</td><td><label for='group_" + i + "'>" + group.title + "</label>";
            html = this._addOpenDataStr(group, html);
            html += "</td></tr></table></div>";
          } else {
            html += "<div id=\"group_" + i + "_div\" style=\"display:block;\">" +
              "<table cellpadding='0' cellspacing='0' class='share-groups-table'><tr><td width='17' valign='bottom'>" +
              "<input id=\"group_" + i + "\" " + checked + " value=\"" + group.id + "\" type=\"checkbox\"" +
              "class='share-groups-input-checkbox' dojoType=\"dijit.form.Checkbox\" />" +
              "</td><td><label for='group_" + i + "'>" + group.title + "</label>";
            html = this._addOpenDataStr(group, html);
            html += "</td></tr></table></div>";
          }
        }

        // it's too early to use the input element here
        this.own(on(dom.byId("share-groups-list"), "click", lang.hitch(this, this.checkGroup)));
        dom.byId("share-groups-list").innerHTML = html;

        if (this.shareInfo.organization && this.shareInfo.userRole &&
          (!this.shareInfo._isCustomRole || this.shareInfo._roleCanShareToOrg ||
          this.shareInfo._roleCanShareOthersItemsToOrg)) {
          var sharedToAccountCounter = 0;
          for (i = 0; i < this.shareInfo.items.length; i++) {
            if (this.shareInfo.items[i].sharing && this.shareInfo.items[i].sharing.access === "org") {
              sharedToAccountCounter++;
            }
          }
          if (sharedToAccountCounter === 0) {
            dijit.byId("share-account-check").set("checked", false);
            domStyle.set(dom.byId("share-account-check_div"), "display", "block");
          } else if (sharedToAccountCounter === this.shareInfo.items.length) {
            dijit.byId("share-account-check").set("checked", true);
            domStyle.set(dom.byId("share-account-check_div"), "display", "block");
          } else {
            dijit.byId("share-account-check").set("checked", true);
            domStyle.set(dom.byId("share-account-check_div"), "display", "block");
          }
        }

        if (!this.shareInfo.organization || this.shareInfo._orgUserCanSharePublicOrOverride) {
          // only a real admin (not custom with canUpdateOrgItems) can overwrite that canSharePublic setting on the org, and only if the admin is in the same org as the item
          var sharedToEveryoneCounter = 0;
          for (i = 0; i < this.shareInfo.items.length; i++) {
            if (this.shareInfo.items[i].sharing && this.shareInfo.items[i].sharing.access === "public") {
              sharedToEveryoneCounter++;
            }
          }
          if (sharedToEveryoneCounter === 0) {
            dijit.byId("share-everyone-check").set("checked", false);
            domStyle.set(dom.byId("share-everyone-check_div"), "display", "block");
          } else if (sharedToEveryoneCounter === this.shareInfo.items.length) {
            dijit.byId("share-everyone-check").set("checked", true);
            domStyle.set(dom.byId("share-everyone-check_div"), "display", "block");

            if (this.shareInfo.organization && this.shareInfo.userRole &&
              (!this.shareInfo._isCustomRole || this.shareInfo._roleCanShareToOrg ||
              this.shareInfo._roleCanShareOthersItemsToOrg)) {
              dijit.byId("share-account-check").set("checked", true);
              domStyle.set(dom.byId("share-everyone-check_div"), "display", "block");
            }
          } else {
            dijit.byId("share-everyone-check").set("checked", true);

            if (this.shareInfo.organization && this.shareInfo.userRole &&
              (!this.shareInfo._isCustomRole || this.shareInfo._roleCanShareToOrg ||
              this.shareInfo._roleCanShareOthersItemsToOrg)) {
              dijit.byId("share-account-check").set("checked", true);
              domStyle.set(dom.byId("share-everyone-check_div"), "display", "block");
            }
          }
          this.clickEveryone();
          //this.own(on(dom.byId("share-everyone-check"), "click", lang.hitch(this, this.clickEveryone)));
        } else if (this.shareInfo.organization && !this.shareInfo.organization.canSharePublic) {
          var sharedToEveryoneCounter_org = 0;
          for (i = 0; i < this.shareInfo.items.length; i++) {
            if (this.shareInfo.items[i].sharing && this.shareInfo.items[i].sharing.access === "public") {
              sharedToEveryoneCounter_org++;
            }
          }
          if (sharedToEveryoneCounter_org) {
            dijit.byId("share-everyone-check").set("checked", true);
            //dojo.style(dojo.byId("share-everyone-check_div"), "display", "none");
            if (this.shareInfo.organization && this.shareInfo.userRole &&
              (!this.shareInfo._isCustomRole || this.shareInfo._roleCanShareToOrg ||
              this.shareInfo._roleCanShareOthersItemsToOrg)) {
              dijit.byId("share-account-check").set("checked", true);
              domStyle.set(dom.byId("share-account-check_div"), "display", "block");
            }
          } else {
            dijit.byId("share-everyone-check").set("checked", false);
            domStyle.set(dom.byId("share-everyone-check_div"), "display", "none");
          }
        } else {
          dijit.byId("share-everyone-check").set("checked", false);
          domStyle.set(dom.byId("share-everyone-check_div"), "display", "none");
        }

        if (hasOne) {
          dijit.byId("share-groups-check").set("checked", true);
        } else {
          dijit.byId("share-groups-check").set("checked", false);
        }
        this.own(on(dom.byId("share-groups-check"), "click", lang.hitch(this, this.checkGroups)));

        if (this.shareInfo.organization &&
          (!this.shareInfo._isCustomRole || this.shareInfo._roleCanShareToOrg ||
          this.shareInfo._roleCanShareOthersItemsToOrg)) {
          this.own(on(dom.byId("share-account-check"), "click", lang.hitch(this, this.clickAccount)));
        }

        //dojo.publish("shareOptionsSetup");
      },
      buildGroupList: function(/*counter*/) {
        var i, j;
        // for (i = 0; i < this.items.length; i++) {
        //   if (!this.items[i].sharing && counter < 20) {
        //     // wait longer
        //     counter = counter + 1;
        //     setTimeout(dojo.hitch(this, "buildGroupList", counter), 100);
        //     return;
        //   }
        // }

        if (!this.shareInfo._isCustomRole || this.shareInfo._roleCanShareToGroup ||
          this.shareInfo._roleCanShareOthersItemsToGroup) {
          if (this.shareInfo.userGroups.length > 0) {
            domStyle.set(dom.byId("share-groups-div"), "display", "block");
          } else {
            //dojo.publish("doesNotOwnGroups");
          }
        } else {
          domStyle.set(dom.byId("share-groups-div"), "display", "none");
        }

        // determine which items are shared to groups
        this.shareInfo.itemsAreSharedToGroups = ",";
        var groupCounter = [];
        for (i = 0; i < this.shareInfo.items.length; i++) {
          var item = this.shareInfo.items[i];

          //this.itemsInfo["_" + item.id] = {};
          //this.itemsInfo["_" + item.id].itemsIsSharedToGroups = ",";
          //eval("this.itemsInfo._" + item.id + " = new Object();");
          //eval("this.itemsInfo._" + item.id).itemsIsSharedToGroups = ",";
          if (item.sharing) {
            for (var k = 0; k < item.sharing.groups.length; k++) {
              var groupId = item.sharing.groups[k];
              //this.itemsInfo["_" + item.id].itemsIsSharedToGroups += groupId + ",";
              //eval("this.itemsInfo._" + item.id).itemsIsSharedToGroups += groupId + ",";
              if (this.shareInfo.itemsAreSharedToGroups.indexOf("," + groupId + ",") === -1) {
                this.shareInfo.itemsAreSharedToGroups += groupId + ",";
                var cntr = [];
                cntr[0] = groupId;
                cntr[1] = 1;
                groupCounter[groupCounter.length] = cntr;
              } else {
                for (j = 0; j < groupCounter.length; j++) {
                  if (groupCounter[j][0] === groupId) {
                    groupCounter[j][1] = groupCounter[j][1] + 1;
                    break;
                  }
                }
              }
            }
          }
        }

        var html = "";
        var hasOne = false;
        var group;
        var checked;
        var count;
        for (i = 0; i < this.shareInfo.userGroups.length; i++) {
          group = this.shareInfo.userGroups[i];
          checked = "";
          count = this.shareInfo.items.length;
          if (this.shareInfo.itemsAreSharedToGroups.indexOf("," + group.id + ",") > -1) {
            checked = "checked";
            hasOne = true;
            for (j = 0; j < groupCounter.length; j++) {
              if (groupCounter[j][0] === group.id) {
                count = groupCounter[j][1];
                break;
              }
            }
          }
          if (count < this.shareInfo.items.length) {
            // not all items are shared to this group
            html += "<div id=\"img_group_" + i + "_div\" style=\"display:block;\">" +
              "<table cellpadding='0' cellspacing='0' class='share-groups-table'><tr><td width='17' valign='bottom'>" +
              "<img id=\"img_group_" + i + "\" src=\"" + this._checkboxImgUrl + "\" border=\"0\">" +
              "</td><td>" + group.title + "</td></tr></table></div><div id=\"group_" + i + "_div\"" +
              "style=\"display:none;\">" +
              "<table cellpadding='0' cellspacing='0'>" +
              "<tr><td width='17' valign='bottom'>" +
              "<input id=\"group_" + i + "\" " + checked + " value=\"" + group.id + "\" type=\"checkbox\"" +
              "class='share-groups-input-checkbox' dojoType=\"dijit.form.Checkbox\" />" +
              "</td><td><label for='" + group.id + "'>" + group.title + "</label>";
            html = this._addOpenDataStr(group, html);
            html += "</td></tr></table></div>";
          } else {
            html += "<div id=\"group_" + i + "_div\" style=\"display:block;\">" +
              "<table cellpadding='0' cellspacing='0' class='share-groups-table'><tr><td width='17' valign='bottom'>" +
              "<input id=\"group_" + i + "\" " + checked + " value=\"" + group.id + "\" type=\"checkbox\"" +
              "class='share-groups-input-checkbox' dojoType=\"dijit.form.Checkbox\" />" +
              "</td><td><label for='group_" + i + "'>" + group.title + "</label>";
            html = this._addOpenDataStr(group, html);
            html += "</td></tr></table></div>";
          }
        }

        // it's too early to use the input element here
        this.own(on(dom.byId("share-groups-list"), "click", lang.hitch(this, this.checkGroup)));
        dom.byId("share-groups-list").innerHTML = html;

        if (hasOne) {
          dijit.byId("share-groups-check").set("checked", true);
        } else {
          dijit.byId("share-groups-check").set("checked", false);
        }
        this.own(on(dom.byId("share-groups-check"), "click", lang.hitch(this, this.checkGroups)));
        //dojo.publish("shareOptionsSetup");
      },

      share: function(e) {
        if (this.shareInfo.shareType === "group") {
          this.shareItemToGroups();
        } else if (this.shareInfo.shareType === "admin") {
          this.shareItemAsAdmin(e);
        } else { // item
          this.shareItem(e);
        }
      },
      checkGroup: function(e) {
        if (e.target.id.indexOf("img_group_") > -1) {
          domStyle.set(dom.byId(e.target.id + "_div"), "display", "none");
          domStyle.set(dom.byId(e.target.id.substring(4, e.target.id.length) + "_div"), "display", "block");
        }

        if (e.target.checked === true && e.target.id.indexOf("group_") > -1) {
          dijit.byId("share-groups-check").set("checked", true);
        }
        //dojo.publish("onClickGroup");
        //topic.publish('ShareOptions/onShareCheckChanged');
      },
      checkGroups: function() {
        //dojo.publish("onClickGroup");
        //topic.publish('ShareOptions/onShareCheckChanged');
      },
      clickEveryone: function(/*e*/) {
        //dojo.stopEvent(e);
        var isChecked = dijit.byId("share-everyone-check").get('checked');
        if (isChecked === true) { // checkbox checked
          var shareAccountCheckDiv = dom.byId("share-account-check_div");
          if (this.shareInfo.organization && shareAccountCheckDiv &&
            domStyle.get(shareAccountCheckDiv, "display") === "block") {
            dijit.byId("share-account-check").set("checked", true);
            dijit.byId("share-account-check").set("disabled", true);
          }
        } else { // checkbox unchecked
          if (this.shareInfo.organization && this.shareInfo.userRole &&
            (!this.shareInfo._isCustomRole || this.shareInfo._roleCanShareToOrg ||
            this.shareInfo._roleCanShareOthersItemsToOrg)) {
            domStyle.set(dom.byId("share-account-check_div"), "display", "block");
          }
          dijit.byId("share-account-check").set("disabled", false);
        }
        //dojo.publish("onClickEveryone");
        topic.publish('ShareOptions/onClickEveryone', isChecked);
        //topic.publish('ShareOptions/onShareCheckChanged');
      },
      clickAccount: function(/*e*/) {
        //dojo.stopEvent(e);
        if (dijit.byId("share-account-check").get('checked') === true) {
          if (this.shareInfo._orgUserCanSharePublicOrOverride) {
            // only a real admin (not custom with canUpdateOrgItems) can overwrite that canSharePublic setting on the org, and only if the admin is in the same org as the item
            if (domStyle.get(dom.byId("share-everyone-check_div"), "display") === "none") {
              domStyle.set(dom.byId("share-everyone-check_div"), "display", "block");
            }
            dijit.byId("share-everyone-check").set("checked", false);
          }
          dijit.byId("share-account-check").set("checked", true);
        } else { // account unchecked
          dijit.byId("share-account-check").set("checked", false);
        }
        //dojo.publish("onClickAccount");
        //topic.publish('ShareOptions/onShareCheckChanged');
      },

      shareItemAsAdmin: function(/*e*/) {
        var itemIds = "";
        var comma = "";
        array.forEach(this.shareInfo.items, function(item) {
          itemIds += comma + item.id;
          comma = ",";
        });

        var shareWithEveryone = false;
        var shareWithAccount = false;
        if ((dom.byId("share-everyone-check_div") &&
          domStyle.get(dom.byId("share-everyone-check_div"), "display") === "block")) {
          shareWithEveryone = dijit.byId("share-everyone-check").get('checked');
        }
        if ((dom.byId("share-account-check_div") &&
          domStyle.get(dom.byId("share-account-check_div"), "display") === "block")) {
          shareWithAccount = dijit.byId("share-account-check").get('checked');
        }

        var shareWithGroups = dijit.byId("share-groups-check").get('checked');
        var shareWithTheseGroups = "";
        var unshareWithTheseGroups = "";
        var comma1 = "";
        var comma2 = "";
        var i = 0;
        if (shareWithGroups) {
          var id;
          if (this.shareInfo.user.groups && this.shareInfo.user.groups.length) {
            for (i = 0; i < this.shareInfo.user.groups.length; i++) {
              id = this.shareInfo.user.groups[i].id;
              if (domStyle.get(dom.byId("group_" + i + "_div"), "display") === "block") {
                if (dom.byId("group_" + i).checked) {
                  shareWithTheseGroups += comma1 + id;
                  comma1 = ",";
                } else {
                  unshareWithTheseGroups += comma2 + id;
                  comma2 = ",";
                }
              }
            }
          }

          if (this.shareInfo.adminGroups && this.shareInfo.adminGroups.length && this.shareInfo.lowestAccess > 1) {
            for (var m = 0; m < this.shareInfo.adminGroups.length; m++) {
              id = this.shareInfo.adminGroups[m].id;
              if (domStyle.get(dom.byId("group_" + (m + i) + "_div"), "display") === "block") {
                if (dom.byId("group_" + (m + i)).checked) {
                  shareWithTheseGroups += comma1 + id;
                  comma1 = ",";
                } else {
                  unshareWithTheseGroups += comma2 + id;
                  comma2 = ",";
                }
              }
            }
          }
        } else {
          // don't share to any group
          comma2 = "";
          if (this.shareInfo.user.groups && this.shareInfo.user.groups.length) {
            array.forEach(this.shareInfo.user.groups, function(group) {
              unshareWithTheseGroups += comma2 + group.id;
              comma2 = ",";
            });
          }

          if (this.shareInfo.adminGroups && this.shareInfo.adminGroups.length && this.shareInfo.lowestAccess > 1) {
            array.forEach(this.shareInfo.adminGroups, function(group) {
              unshareWithTheseGroups += comma2 + group.id;
              comma2 = ",";
            });
          }
        }

        // groups: A comma separated list of group IDs that the item will be shared with or ""
        if (unshareWithTheseGroups.length > 0) {
          var unShareRequest = {
            "items": itemIds,
            "groups": unshareWithTheseGroups
          };
          for (i = 0; i < this.shareInfo.items.length; i++) {
            var item = this.shareInfo.items[i];
            //'content/users/' + (request.owner || user.email) + '/unshareItems';
            //arcgisonline.sharing.geow.Content.unshareItemByID(item, unShareRequest,dojo.hitch(this, unShareHandler, this.items, shareWithTheseGroups, shareWithEveryone, shareWithAccount));
            shareUtils._unshareItemById(unShareRequest, item.id, this.portalUrl).then(lang.hitch(
              this, this.unShareHandler_admin,
              this.shareInfo.items, itemIds, shareWithTheseGroups, shareWithEveryone, shareWithAccount)
            );
          }
        } else {
          this.unShareHandler_admin(this.shareInfo.items, itemIds,
            shareWithTheseGroups, shareWithEveryone, shareWithAccount);
        }
      },
      unShareHandler_admin: function(_items, itemIds, _shareWithTheseGroups, _shareWithEveryone, _shareWithAccount) {
        var totalRequests = _items.length;
        var shareHandler = function() {
          totalRequests--;
          if (totalRequests === 0) {
            //dojo.publish("onShareUpdate", [_shareWithEveryone ? "public" :
            //  (_shareWithAccount ? "org" : (_shareWithTheseGroups ? "shared" : "private"))]);
          }
        };

        // groups: A comma separated list of group IDs that the item will be shared with or ""
        var shareRequest = {
          "items": itemIds,
          "groups": _shareWithTheseGroups,
          "everyone": _shareWithEveryone,
          "account": _shareWithAccount
        };
        for (var i = 0; i < _items.length; i++) {
          var item = _items[i];
          //'content/items/' + item.id + '/share';
          //arcgisonline.sharing.geow.Content.shareItemByID(item, shareRequest, shareHandler);
          this.shareInfo.user.shareItem(shareRequest, item.id, item.folderId).then(lang.hitch(this, shareHandler));
        }
      },

      shareItem: function(/*e*/) {
        var itemIds = "";
        var comma = "";
        array.forEach(this.shareInfo.items, function(item) {
          itemIds += comma + item.id;
          comma = ",";
        });

        var shareWithEveryone = false;
        var shareWithAccount = false;
        if ((dom.byId("share-everyone-check_div") &&
          domStyle.get(dom.byId("share-everyone-check_div"), "display") === "block")) {
          shareWithEveryone = dijit.byId("share-everyone-check").get('checked');
        }
        if ((dom.byId("share-account-check_div") &&
          domStyle.get(dom.byId("share-account-check_div"), "display") === "block")) {
          shareWithAccount = dijit.byId("share-account-check").get('checked');
        }

        var shareWithGroups = dijit.byId("share-groups-check").get('checked');
        var shareWithTheseGroups = "";
        var unshareWithTheseGroups = "";
        var comma1 = "";
        var comma2 = "";
        this.shareInfo.userGroups = this.shareInfo.user.group;
        if (shareWithGroups) {
          if (this.shareInfo.userGroups && this.shareInfo.userGroups.length) {
            array.forEach(this.shareInfo.userGroups, function(group, i) {
              var id = group.id;
              if (domStyle.get(dom.byId("group_" + i + "_div"), "display") === "block") {
                if (dom.byId("group_" + i).checked) {
                  shareWithTheseGroups += comma1 + id;
                  comma1 = ",";
                } else {
                  unshareWithTheseGroups += comma2 + id;
                  comma2 = ",";
                }
              }
            });
          }
        } else {
          // don't share to any group
          comma2 = "";
          if (this.shareInfo.userGroups && this.shareInfo.userGroups.length) {
            array.forEach(this.shareInfo.userGroups, function(group) {
              unshareWithTheseGroups += comma2 + group.id;
              comma2 = ",";
            });
          }
        }

        // var shareErrorHandler = function(errors) {
        //   dojo.publish("onShareUpdate", [errors]);
        // };

        // groups: A comma separated list of group IDs that the item will be shared with or ""
        if (unshareWithTheseGroups.length > 0) {
          var unShareRequest = {
            "items": itemIds,
            "groups": unshareWithTheseGroups
          };
          if (this.shareInfo.itemUser && this.shareInfo.itemUser !== null) {
            var username;
            if (this.shareInfo.itemUser.username) {
              username = this.shareInfo.itemUser.username;
            } else {
              username = this.shareInfo.itemUser.email;
            }
            //shareUtils.unshareItemsByUser(username, unShareRequest,
            //  dojo.hitch(this, unShareHandler, this.itemUser, shareWithTheseGroups, shareWithEveryone, shareWithAccount));
            shareUtils.unshareItemsByUser(username, unShareRequest, this.portalUrl).then(lang.hitch(
              this, this.unShareHandler_item,
              this.shareInfo.itemUser, itemIds, shareWithTheseGroups, shareWithEveryone, shareWithAccount)
            );
          } else {
            // arcgisonline.sharing.geow.Content.unshareItems(unShareRequest,
            //   dojo.hitch(this, unShareHandler, this.itemUser, shareWithTheseGroups, shareWithEveryone, shareWithAccount)
            // );
            shareUtils.unshareItems(this.shareInfo.itemUser, unShareRequest, this.portalUrl).then(lang.hitch(
              this, this.unShareHandler_item,
              this.shareInfo.itemUser, itemIds, shareWithTheseGroups, shareWithEveryone, shareWithAccount)
            );
          }
        } else {
          this.unShareHandler_item(this.shareInfo.itemUser, itemIds,
            shareWithTheseGroups, shareWithEveryone, shareWithAccount);
        }
        //dojo.publish("shareOptionsTeardown");
      },
      unShareHandler_item: function(_itemUser, itemIds, _shareWithTheseGroups, _shareWithEveryone, _shareWithAccount) {
        // var shareHandler = function(){
        //   dojo.publish("onShareUpdate", [_shareWithEveryone?"public":(_shareWithAccount?"org":(_shareWithTheseGroups?"shared":"private"))]);
        // };
        // groups: A comma separated list of group IDs that the item will be shared with or ""
        var shareRequest = {
          "items": itemIds,
          "groups": _shareWithTheseGroups,
          "everyone": _shareWithEveryone,
          "account": _shareWithAccount
        };
        if (_itemUser && _itemUser !== null) {
          var username;
          if (_itemUser.username) {
            username = _itemUser.username;
          } else {
            username = _itemUser.email;
          }
          //arcgisonline.sharing.geow.Content.shareItemsByUser(username, shareRequest, shareHandler);
          shareUtils.shareItemsByUser(username, shareRequest, this.portalUrl).then(lang.hitch());
        } else {
          //arcgisonline.sharing.geow.Content.shareItems(shareRequest, shareHandler, shareErrorHandler);
          shareUtils.shareItems(_itemUser, shareRequest, this.portalUrl).then();
        }
      },

      findLowestAccessLevel: function(items) {
        var lowestAccess = 3;
        // determine lowest share level
        var accessLevel;
        var access;
        for (var i = 0; i < items.length; i++) {
          access = items[i].access;
          if (!access) {
            access = "private";
          }
          if (access.length === 1) {
            // convert from array (items from a DataGrid come with each property as an array value)
            access = access[0];
          }
          if (access === "public") {
            accessLevel = 3;
          } else if (access === "org") {
            accessLevel = 2;
          } else if (access === "shared") {
            accessLevel = 1;
          } else if (access === "private") {
            accessLevel = 0;
          }
          if (accessLevel < lowestAccess) {
            lowestAccess = accessLevel;
          }
        }
        return lowestAccess;
      },

      _sortFunc: function(a, b) {
        var aa = a[this.shareInfo.sortField].toLowerCase();
        var bb = b[this.shareInfo.sortField].toLowerCase();
        if (aa === null || bb === null || aa === bb) {
          return 0;
        }
        if (aa < bb) {
          return -1;
        }
        return 1;
      },

      _addOpenDataStr: function(group, html) {
        if (group.isOpenData && !shareUtils.portal.isPortal) {
          html += " " + this.i18n.openData;
        }
        return html;
      },

      _clearGroupCheckboxes: function() {
        if (false === dijit.byId("share-groups-check").get("checked")) {
          var groupCheckBoxes = query(".share-groups-input-checkbox");
          for (var i = 0, len = groupCheckBoxes.length; i < len; i++) {
            var cb = groupCheckBoxes[i];
            cb.setAttribute('value', false);
          }
        }
      }
    });
    return so;
  });