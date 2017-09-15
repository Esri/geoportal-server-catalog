declare namespace jimu {
  export interface VersionInfo {
    //the version you want to upgrade to. version format: 1.0.0
    version: string;

    //the version discription
    description: string;

    //the upgrade logic to upgrade from the latest old verion to this version
    //the first upgrader will upgrade unknow version to the first version
    upgrader: (oldConfig: any) => any;
  }

  export interface PortalQuery {
    q: string;
    sortField?: string;
    sortOrder?: string;
    num?: number;
    start?: number;
  }

  export interface Credential {
    token?: string;
    server?: string;
    scope?: string;
    expires?: number;
  }

  export interface PortalUser {
    portalUrl?: string;
    credential?: Credential;
    portal?: PortalClass;

    isValidCredential(): boolean;

    updateCredential(): void;

    getGroups(): PortalGroup[];

    getItemsByKeywords(typeKeywords: string, start?: number): dojo.Deferred<PortalItem[]>;

    getContent(): dojo.Deferred<any>;

    getTags(): dojo.Deferred<string[]>;

    addItem(args: any, folderId: string): dojo.Deferred<any>;

    deleteItem(itemId: string): dojo.Deferred<any>;

    getItemById(itemId: string, folderId: string): dojo.Deferred<PortalItem>;

    shareItem(args: any, itemId: string, folderId: string): dojo.Deferred<any>;

    updateItem(itemId: string, args: any): dojo.Deferred<any>;

    isAdminRole(): boolean;

    isPublisherRole(): boolean;

    isUserRole(): boolean;
  }

  export interface PortalItem {
    itemUrl?: string;
    detailsPageUrl?: string;
    ownerPageUrl?: string;
    portalUrl?: string;
    credential?: Credential;
    portal?: PortalClass;
    token?: string;

    isValidCredential(): boolean;

    updateCredential(): void;

    getItemData(): dojo.Deferred<any>;
  }

  export interface PortalGroup {
    isValidCredential(): boolean;

    updateCredential(): void;

    queryItems(params: PortalQuery): dojo.Deferred<PortalItem[]>;
  }

  export interface PortalClass {
    loadSelfInfo(): dojo.Deferred<any>;

    isValidCredential(): boolean;

    updateCredential(): void;

    signIn(): dojo.Deferred<any>;

    haveSignIn(): boolean;

    clearCredentialAndUser(): void;

    getUser(): jimu.PortalUser;

    /**
     * return jimu.PortalItem[]
     */
    queryItems(params: PortalQuery): dojo.Deferred<PortalItem[]>;

    /**
     * @param itemId
     */
    getItemData(itemId: string): dojo.Deferred<any>;

    getItemById(itemId: string): dojo.Deferred<PortalItem>;

    getAppById(appId: string): dojo.Deferred<any>;

    queryGroups(params: any): dojo.Deferred<PortalGroup[]>;

    registerApp(itemId: string, appType: string, redirect_uris: string[]): dojo.Deferred<any>;

    createAndRegisterApp(redirect_uris: string[]): dojo.Deferred<any>;
  }

  export interface OperationalLayer {

  }

  export interface LayerIndex {
    isGraphicLayer: boolean;
    index: number;
  }

  export interface WebMapItemData {

  }
}

declare module 'jimu/dijit/CheckBox' {
  class CheckBox {
    constructor(params?: Object, srcNodeRef?: HTMLElement);

    setValue(value: boolean);

    getValue(): boolean;

    setStatus(value: boolean);

    getStatus(): boolean;

    check(): void;

    uncheck(noEvent?: boolean): void;
  }

  export = CheckBox;
}

declare module 'jimu/dijit/URLInput' {
  import ValidationTextBox = require('dijit/form/ValidationTextBox');

  class URLInput extends ValidationTextBox {
    rest: boolean;
    allowNamed: boolean;
    allowLocal: boolean;

    constructor(params?: Object);

    validator: (value: string) => boolean;
  }

  export = URLInput;
}

declare module 'jimu/WidgetManager' {
  class WidgetManager {

  }

  export = WidgetManager;
}

declare module 'jimu/DataManager' {
  import WidgetManager = require("jimu/WidgetManager");

  class DataManager {
    static getInstance(widgetManager: WidgetManager): DataManager;
  }

  export = DataManager;
}

declare module 'jimu/shared/BaseVersionManager' {
  class BaseVersionManager {
    versions: jimu.VersionInfo[];

    upgrade(config: any, oldVersion: string, newVersion: string): any;
  }

  export = BaseVersionManager;
}

declare module 'jimu/Role' {
  class Role {
    constructor(params: any);

    /**
     * Checks whether the role is a core User role. Based on the role id.
     * @returns {*|boolean}
     */
    isUser(): boolean;

    /**
     * Checks whether the role is a core Publisher role. Based on the role id.
     * @returns {*|boolean}
     */
    isPublisher(): boolean;

    /**
     * Checks whether the role is a core Administrator role. Based on the role id.
     */
    isAdmin(): boolean;

    /**
     * Checks whether the role is based on the core User role. Also returns true if
     *  it also _is_ the core User role.
     * @returns {*|boolean}
     */
    isBasedOnUser(): boolean;

    /**
     * Checks whether the role is based on the core Publisher role. Also returns true
     * if it also _is_ the core Publisher role.
     * @returns {*|boolean|*|boolean}
     */
    isBasedOnPublisher(): boolean;

    /**
     * Checks whether the role is based on the core Administrator role. Also returns
     * true if it also _is_ the core Administrator role.
     * @returns {*|boolean}
     */
    isBasedOnAdmin(): boolean;

    /**
     * Checks whether the role is a custom role. Based on the role id.
     * @returns {boolean|*}
     */
    isCustom(): boolean;

    /**
     * Checks whether the privilege "portal:admin:inviteUsers" is granted.
     * @returns {null|boolean}
     */
    canInviteUsers(): boolean;

    /**
     * Checks whether the privilege "portal:admin:disableUsers" is granted.
     * @returns {null|boolean}
     */
    canDisableUsers(): boolean;

    /**
     * Checks whether the privilege "portal:admin:viewUsers" is granted.
     * @returns {null|boolean}
     */
    canViewUsers(): boolean;

    /**
     * Checks whether the privilege "portal:admin:updateUsers" is granted.
     * @returns {null|boolean}
     */
    canUpdateUsers(): boolean;

    /**
     * Checks whether the privilege "portal:admin:deleteUsers" is granted.
     * @returns {null|boolean}
     */
    canDeleteUsers(): boolean;

    /**
     * Checks whether the privilege "portal:admin:changeUserRoles" is granted.
     * @returns {null|boolean}
     */
    canChangeUserRoles(): boolean;

    /**
     * Checks whether the privilege "portal:admin:viewGroups" is granted.
     * @returns {null|boolean}
     */
    canViewOrgGroups(): boolean;

    /**
     * Checks whether the privilege "portal:admin:updateGroups" is granted.
     * @returns {null|boolean}
     */
    canUpdateOrgGroups(): boolean;

    /**
     * Checks whether the privilege "portal:admin:deleteGroups" is granted.
     * @returns {null|boolean}
     */
    canDeleteOrgGroups(): boolean;

    /**
     * Checks whether the privilege "portal:admin:reassignGroups" is granted.
     * @returns {null|boolean}
     */
    canReassignOrgGroups(): boolean;

    /**
     * Checks whether the privilege "portal:admin:assignToGroups" is granted.
     * @returns {null|boolean}
     */
    canAssignUsersToOrgGroups(): boolean;

    /**
     * Checks whether the privilege "portal:admin:manageEnterpriseGroups" is granted.
     * @returns {null|boolean}
     */
    canManageEnterpriseGroups(): boolean;

    /**
     * Checks whether the privilege "portal:admin:viewItems" is granted.
     * @returns {null|boolean}
     */
    canViewOrgItems(): boolean;

    /**
     * Checks whether the privilege "portal:admin:updateItems" is granted.
     * @returns {null|boolean}
     */
    canUpdateOrgItems(): boolean;

    /**
     * Checks whether the privilege "portal:admin:deleteItems" is granted.
     * @returns {null|boolean}
     */
    canDeleteOrgItems(): boolean;

    /**
     * Checks whether the privilege "portal:admin:reassignItems" is granted.
     * @returns {null|boolean}
     */
    canReassignOrgItems(): boolean;

    /**
     * Checks whether the privilege "portal:admin:manageLicenses" is granted.
     * @returns {null|boolean}
     */
    canManageLicenses(): boolean;

    /**
     * Checks whether the privilege "portal:user:createGroup" is granted.
     * @returns {null|boolean}
     */
    canCreateGroup(): boolean;

    /**
     * Checks whether the privilege "portal:user:joinGroup" is granted.
     * @returns {null|boolean}
     */
    canJoinOrgGroup(): boolean;

    /**
     * Checks whether the privilege "portal:user:joinNonOrgGroup" is granted.
     * @returns {null|boolean}
     */
    canJoinNonOrgGroup(): boolean;

    /**
     * Checks whether the privilege "portal:publisher:publishFeatures" is granted.
     * @returns {null|boolean}
     */
    canPublishFeatures(): boolean;

    /**
     * Checks whether the privilege "portal:publisher:publishTiles" is granted.
     * @returns {null|boolean}
     */
    canPublishTiles(): boolean;

    /**
     * Checks whether the privilege "portal:publisher:publishScenes" is granted.
     * @returns {null|boolean}
     */
    canPublishScenes(): boolean;

    /**
     * Checks whether the privilege "portal:user:createItem" is granted.
     * @returns {null|boolean}
     */
    canCreateItem(): boolean;

    /**
     * Checks whether the privilege "portal:user:shareToGroup" is granted.
     * @returns {null|boolean}
     */
    canShareItemToGroup(): boolean;

    /**
     * Checks whether the privilege "portal:user:shareToOrg" is granted.
     * @returns {null|boolean}
     */
    canShareItemToOrg(): boolean;

    /**
     * Checks whether the privilege "portal:user:shareToPublic" is granted.
     * @returns {null|boolean}
     */
    canShareItemToPublic(): boolean;

    /**
     * Checks whether the privilege "portal:user:shareGroupToOrg" is granted.
     * @returns {null|boolean}
     */
    canShareGroupToOrg(): boolean;

    /**
     * Checks whether the privilege "portal:user:shareGroupToPublic" is granted.
     * @returns {null|boolean}
     */
    canShareGroupToPublic(): boolean;

    /**
     * Checks whether the privilege "features:user:edit" is granted.
     * @returns {null|boolean}
     */
    canEditFeatures(): boolean;

    /**
     * Checks whether the privilege "features:user:fullEdit" is granted.
     * @returns {null|boolean}
     */
    canEditFeaturesFullControl(): boolean;

    /**
     * Checks whether the privilege "opendata:user:openDataAdmin" is granted.
     * @returns {null|boolean}
     */
    canManageOpenData(): boolean;

    /**
     * Checks whether the privilege "opendata:user:designateGroup" is granted.
     * @returns {null|boolean}
     */
    canDesignateOpenDataGroups(): boolean;

    /**
     * Checks whether the privilege "premium:user:geocode" is granted.
     * @returns {null|boolean}
     */
    canUseGeocode(): boolean;

    /**
     * Checks whether the privilege "premium:user:networkanalysis" is granted.
     * @returns {null|boolean}
     */
    canUseNetworkAnalysis(): boolean;

    /**
     * Checks whether the privilege "premium:user:spatialanalysis" is granted.
     * @returns {null|boolean}
     */
    canUseSpatialAnalysis(): boolean;

    /**
     * Checks whether the privilege "premium:user:geoenrichment" is granted.
     * @returns {null|boolean}
     */
    canUseGeoenrichment(): boolean;

    /**
     * Checks whether the privilege "premium:user:demographics" is granted.
     * @returns {null|boolean}
     */
    canUseDemographics(): boolean;

    /**
     * Checks whether the privilege "premium:user:elevation" is granted.
     * @returns {null|boolean}
     */
    canUseElevation(): boolean;

    /**
     * Checks whether the privilege "marketplace:admin:purchase" is granted.
     * @returns {null|boolean}
     */
    canPurchaseMarketplace(): boolean;

    /**
     * Checks whether the privilege "marketplace:admin:manage" is granted.
     * @returns {null|boolean|*}
     */
    canManageMarketplace(): boolean;

    /**
     * Checks whether the privilege "marketplace:admin:startTrial" is granted.
     * @returns {null|boolean|*}
     */
    canTrialMarketplace(): boolean;

    /**
     * Sets the roles privileges to those passed as input. Overwrites whatever
     * privileges were defined for the role beforehand. If passed null or
     * undefined or an non-standard privileges object, it will reset the privileges
     * to default; all denied.
     * @param privileges
     */
    setPrivileges(privileges: string[]): boolean;

    /**
     * Stringify the role metadata and privileges together.
     * @returns {*}
     */
    stringify(): boolean;

    /**
     * Stringify the role metadata (i.e., id, name, and description).
     * @returns {*}
     */
    stringifyRole(): boolean;

    /**
     * Stringify the role privileges.
     * @returns {*}
     */
    stringifyPrivileges(): boolean;

    /**
     * Stringify the role metadata and privileges together with pretty print.
     * @return {*}
     */
    stringifyPretty(): boolean;
  }

  export = Role;
}

declare module 'jimu/portalUtils' {
  class PortalUtils {
    static getPortal(portalUrl: string): jimu.PortalClass;

    static getPortalSelfInfo(portalUrl: string): dojo.Deferred<any>;

    static getBasemapGalleryGroup(portalUrl: string): dojo.Deferred<any>;

    static getTemplatesGroup(portalUrl: string): dojo.Deferred<any>;

    static getUnits(portalUrl: string): dojo.Deferred<any>;

    static getWebMapsFromBasemapGalleryGroup(portalUrl: string): dojo.Deferred<any>;

    static getDefaultWebScene(portalUrl: string): dojo.Deferred<any>;

    static getDefaultWebMap(portalUrl: string): dojo.Deferred<any>;
  }

  export = PortalUtils;
}

declare module 'jimu/LayerInfos/LayerInfo' {
  import Layer = require('esri/layers/layer');
  import Map = require('esri/map');
  import Extent = require("esri/geometry/Extent");
  import InfoTemplate = require("esri/InfoTemplate");

  class LayerInfo {
    originOperLayer: jimu.OperationalLayer;
    layerObject: Layer;
    map: Map;
    title: string;
    id: string;
    newSubLayers: LayerInfo[];
    parentLayerInfo: LayerInfo;

    constructor(operLayer: jimu.OperationalLayer, map: Map, options: any);

    /**
     * Init sub layers, layer visibility and bind events.
     */
    init(): void;

    /**
     * To decide which group to place the layer in, now only has two groups: graphic or non-graphic
     */
    isGraphicLayer(): boolean;

    obtainLayerIndexesInMap(): jimu.LayerIndex[];

    /**
     * Return the opacity of this layer. Also check sub layers if any.
     */
    getOpacity(): number;

    /**
     * Set the opacity to all sub layers.
     * @param opacity
     */
    setOpacity(opacity: number): void;

    /**
     * Change the layer order.
     * @param index
     */
    moveLeftOfIndex(index: number): void;

    /**
     * Change the layer order.
     * @param index
     */
    moveRightOfIndex(index: number): void;

    /**
     * Traversal and prepare all the sub layers.
     * @param callback
     */
    traversal(callback: Function): void;

    /**
     * Find LayerInof in subLayerInfos
     * @param id
     * @return null if does not find
     */
    findLayerInfoById(id: string): LayerInfo;

    setTopLayerVisible(visible: boolean): void;

    /**
     * options = {
     *   layerOptions: {
     *     id: {
     *       visible: true/false
     *     }
     *   }
     * }
     * @param options
     */
    resetLayerObjectVisibility(options: Object): void;

    isVisible(): boolean;

    obtainNewSubLayers(): LayerInfo[];

    createLegendsNode(): HTMLElement;

    /**
     * @return Response contains layerObject
     */
    getLayerObject(): dojo.Deferred<any>;

    getSubLayers(): LayerInfo[];

    /**
     * Check whether this layer has sub layer.
     */
    isLeaf(): boolean;

    /**
     * Check whether this layer has no parent.
     */
    isRootLayer(): boolean;

    isShowInMap(): boolean;

    /**
     *
     */
    getLayerType(): string;

    getPopupInfo(): Object;

    /**
     * get filter from webmap defination
     * return null directly if has not configured filter in webmap.
     */
    getFilterOfWebmap(): string;

    getShowLegendOfWebmap(): boolean;

    getUrl(): string;

    hasLayerTypes(types: string[]): boolean;

    /**
     * return value:{
     *   isSupportedLayer: true/false,
     *   isSupportQuery: true/false,
     *   layerType: layerType.
     * }
     */
    getSupportTableInfo();

    getRelatedTableInfoArray(): dojo.Deferred<any>;

    removeSubLayerById(id: string): void;

    destroy(): void;

    destroyLayerInfo(): void;

    isMapNotesLayerInfo(): boolean;

    /**
     * Must be implemented by sub class.
     */
    getExtent(): Extent;

    setSubLayerVisible(subLayerId: string, visible: boolean);

    setLayerVisiblefromTopLayer(): void;

    initVisible(): void;

    drawLegends(legendsNode: HTMLElement, portalUrl: string);

    loadInfoTemplate(): dojo.Deferred<any>;

    getInfoTemplate(): InfoTemplate;
  }

  export = LayerInfo;
}

declare module 'jimu/LayerInfos/LayerInfos' {
  import Map = require("esri/map");
  import Layer = require("esri/layers/layer");
  import FeatureLayer = require("esri/layers/FeatureLayer");
  import LayerInfo = require('jimu/LayerInfos/LayerInfo');

  class LayerInfos {
    update(): void;

    getLayerInfoArrayOfWebmap(): LayerInfo[];

    getLayerInfoArray(): LayerInfo[];

    getTableInfoArray(): LayerInfo[];

    addFeatureCollection(featureLayers: FeatureLayer[], title: string): void;

    addTable(table): void;

    removeTable(): void;

    traversal(callback: Function): void;

    traversalLayerInfosOfWebmap(callback: Function): void;

    getLayerInfoById(layerId: string): LayerInfo;

    getLayerInfoByTopLayerId(layerId: string): LayerInfo;

    moveUpLayer(id: string): boolean;

    moveDownLayer(id: string): boolean;

    getBasemapLayers(): Layer[];

    getMapNotesLayerInfoArray(): LayerInfo[];

    /**
     * restore layers visibility
     * @param options
     */
    restoreState(options: any): void;

    static getLayerInfoArrayByType(map: Map, layerType: string): LayerInfo[];

    static getInstance(map: Map, webmapItemInfo: jimu.WebMapItemData, options: any): LayerInfos;
  }

  export = LayerInfos;
}

declare module 'jimu/dijit/SimpleTable' {
  class SimpleTable {
    getRows(): HTMLElement[];

    getRowData(tr: HTMLElement): any;

    _moveUp(tr: HTMLElement): void;

    _moveDown(tr: HTMLElement): void;
  }

  export = SimpleTable;
}

declare module 'jimu/BaseFeatureAction' {
  import Map = require('esri/map');
  import FeatureSet = require('esri/tasks/FeatureSet');
  import Layer = require('esri/layers/layer');

  class BaseFeatureAction {
    name: string;
    label: string;
    iconFormat: string;
    iconClass: string;
    map: Map;

    constructor(options: any);

    isFeatureSupported(featureSet: FeatureSet, layer?: Layer): boolean;

    onExecute(featureSet: FeatureSet, layer?: Layer): dojo.Deferred<void>;
  }

  export = BaseFeatureAction;
}
