//a custom pragma to transform your jsx into plain JavaScript
/** @jsx jsx */
import { React, jsx, IntlShape } from 'jimu-core';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu, Link, Image } from 'jimu-ui';
import { Fragment } from 'react';
import '../main.css';
import { checkMixedContent } from '../common/utils';

import defaultMessages from '../translations/default';

// import placeholderImg from '../images/placeholder_project120x80.png';
const placeholderImg = require('../images/placeholder_project120x80.png');

interface ExtraProps {
  item?: any;
  key?: string;
  canRemove: boolean;
  supportsRemove: boolean;
  sourceKey: string;
  sourceType: string;
  showOwner: boolean;
  intl: IntlShape;
  zoomToExtent?: (bbox: any) => void;
}

type ResultTypeInfo = {
  canAdd?: boolean;
  detailsUrl?: string;
  portalItem?: any;
  portalItemUrl?: string;
  serviceType?: string;
  type?: string;
  url?: string;
};

export default class Widget extends React.PureComponent<ExtraProps, any> {
  typeInfo: ResultTypeInfo;
  referenceId: string;
  itemImagePath: string;
  linksInfo: any[];

  constructor(props) {
    super(props);
    this.typeInfo = {};
    this.referenceId = '';
    this.itemImagePath = '';
    this.linksInfo = [];
    this.determineType(this.props.item);
    this.processLinks(this.props.item);
  }

  determineType = (item) => {
    let addable = {
      'featureserver': 'Feature Service',
      'feature service': 'Feature Service',
      'imageserver': 'Image Service',
      'image service': 'Image Service',
      'mapserver': 'Map Service',
      'map service': 'Map Service',
      'wms': 'WMS',
      'kml': 'KML',
      /*
      "vectortileserver": "Vector Tile Service",
      "vector tile service": "Vector Tile Service",
      */
    };

    this.referenceId = this.props.sourceKey + '-refid-' + item.id;

    if (Array.isArray(item.links)) {
      item.links.forEach((link) => {
        if (link.rel === 'related') {
          if (typeof link.dctype === 'string' && link.dctype.length > 0) {
            if (!this.typeInfo.type) {
              this.typeInfo.type = link.dctype;
              this.typeInfo.url = link.href;
            }
          }
        } else if (link.rel === 'alternate') {
          if (link.type === 'text/html') {
            if (
              typeof link.href === 'string' &&
              (link.href.indexOf('http://') === 0 || link.href.indexOf('https://') === 0)
            ) {
              this.typeInfo.detailsUrl = link.href;
            }
          } else if (link.type === 'application/json') {
            if (
              typeof link.href === 'string' &&
              (link.href.indexOf('http://') === 0 || link.href.indexOf('https://') === 0)
            ) {
              if (this.props.sourceType === 'ArcGIS') {
                this.typeInfo.portalItem = item._source;
                this.typeInfo.portalItemUrl = link.href;
              }
            }
          }
        }
      });
    }

    if (!this.typeInfo.type && item._source && item._source.type) {
      this.typeInfo.type = item._source.type;
    }
    if (this.typeInfo.type) {
      this.typeInfo.serviceType = addable[this.typeInfo.type.toLowerCase()];
      if (
        this.typeInfo.serviceType &&
        typeof this.typeInfo.url === 'string' &&
        (this.typeInfo.url.indexOf('http://') === 0 || this.typeInfo.url.indexOf('https://') === 0)
      ) {
        this.typeInfo.canAdd = true;
        // this.addButton.removeAttribute('disabled');
      }
    }
  };

  processLinks = (item) => {
    const links = item?.links;

    if (Array.isArray(links)) {
      links.forEach((link) => {
        let href = link.href;
        if (
          link.rel === 'icon' &&
          typeof href === 'string' &&
          (href.indexOf('http://') === 0 || href.indexOf('https://') === 0)
        ) {
          this.itemImagePath = checkMixedContent(href);
        } else {
          // link.rel === "alternate" link.rel === "related"
          if (
            typeof href === 'string' &&
            (href.indexOf('http://') === 0 ||
              href.indexOf('https://') === 0 ||
              href.indexOf('ftp://') === 0 ||
              href.indexOf('ftps://') === 0)
          ) {
            let typeName = '';
            if (link.type === 'text/html') {
              typeName = 'HTML';
            } else if (link.type === 'application/json') {
              typeName = 'JSON';
            } else if (link.type === 'application/xml') {
              typeName = 'XML';
            } else if (href.indexOf('http') === 0) {
              typeName = 'HTTP';
            } else if (href.indexOf('ftp') === 0) {
              typeName = 'FTP';
            }
            this.linksInfo.push([typeName, href]);
          }
        }
      });
    }
  };

  zoomToExtent = () => {
    this.props.zoomToExtent(this.props.item.bbox);
  };

  detailsClicked = () => {
    if (this.typeInfo?.detailsUrl) {
      let url = checkMixedContent(this.typeInfo.detailsUrl);
      window.open(url);
    }
  };

  itemType = () => {
    let currentType = this.typeInfo?.type ?? null;

    if (
      typeof currentType === 'string' &&
      currentType.length > 0 &&
      typeof defaultMessages.item.types[currentType] === 'string'
    ) {
      currentType = this.props.intl.formatMessage({
        id: 'item.types',
        defaultMessage: defaultMessages.item.types[currentType],
      });
    }

    return currentType;
  };

  itemAuthor = () => {
    if (!this.props.showOwner) {
      return null;
    }
    let author = this.props.item.author;

    return Array.isArray(author) && author.length > 0
      ? author[0].name
      : typeof author.name === 'string'
      ? author.name
      : null;
  };

  typeAndAuthor = () => {
    const itemType = this.itemType();
    const author = this.itemAuthor();

    if (itemType && typeof itemType === 'string' && author && typeof author === 'string') {
      let info = this.props.intl.formatMessage({
        id: 'item.typeByOwnerPattern',
        defaultMessage: defaultMessages.item.typeByOwnerPattern,
      });
      info = info.replace('{type}', itemType).replace('{owner}', author);
      return <div className="result_item_info">{info}</div>;
    } else {
      return (
        <Fragment>
          <div className="result_item_info">{itemType}</div>
          <div className="result_item_info">{author}</div>
        </Fragment>
      );
    }
  };

  itemDateTime = () => {
    const updated = this.props.item.updated;
    const published = this.props.item.published;

    const val =
      updated && typeof updated === 'string' && updated.length > 0
        ? updated
        : published && typeof published === 'string' && published.length > 0
        ? published
        : null;

    if (val) {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return (
        <div className="result_item_info">
          {new Date(val).toLocaleDateString(undefined, options)}
        </div>
      );
    }
    return null;
  };

  renderLinks = () => {
    return (
      <div
        style={{
          width: 100,
        }}
      >
        <Dropdown>
          <DropdownButton
            a11y-description={this.props.intl.formatMessage({
              id: 'item.actions.links',
              defaultMessage: defaultMessages.item.actions.links,
            })}
            onClick={function noRefCheck() {}}
          >
            {this.props.intl.formatMessage({
              id: 'item.actions.links',
              defaultMessage: defaultMessages.item.actions.links,
            })}
          </DropdownButton>
          <DropdownMenu>
            {this.linksInfo.length > 0 &&
              this.linksInfo.map((item) => (
                <DropdownItem>
                  <Link
                    themeStyle={{ type: 'link' }}
                    className=""
                    style={{ textDecorationLine: 'none' }}
                    target="_blank"
                    to={item[1]}
                  >
                    {item[0] + '  ' + item[1]}
                  </Link>
                </DropdownItem>
              ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  };

  itemActionBar = () => {
    return (
      <div className="result_action_bar">
        <span className="result_action_message"></span>

        <Link
          themeStyle={{ type: 'link' }}
          onClick={this.zoomToExtent}
          className="result_action_zoomto"
          style={
            this.props.item.bbox
              ? { textDecorationLine: 'none' }
              : { color: 'gray', pointerEvents: 'none', textDecorationLine: 'none' }
          }
        >
          {this.props.intl.formatMessage({
            id: 'item.actions.zoom',
            defaultMessage: defaultMessages.item.actions.zoom,
          })}
        </Link>

        <Link
          themeStyle={{ type: 'link' }}
          onClick={}
          className="result_action_add"
          style={{ textDecorationLine: 'none' }}
        >
          {this.props.intl.formatMessage({
            id: 'item.actions.add',
            defaultMessage: defaultMessages.item.actions.add,
          })}
        </Link>

        <Link
          themeStyle={{ type: 'link' }}
          onClick={this.detailsClicked}
          className="result_action_details"
          style={
            this.typeInfo.detailsUrl
              ? { textDecorationLine: 'none' }
              : { color: 'gray', pointerEvents: 'none', textDecorationLine: 'none' }
          }
        >
          {this.props.intl.formatMessage({
            id: 'item.actions.details',
            defaultMessage: defaultMessages.item.actions.details,
          })}
        </Link>

        {this.renderLinks()}
      </div>
    );
  };

  //TO DO - addbutton flag to toggle enable
  renderedItem = () => {
    const itemImage = (
      <div className="result_item_thumbnail">
        <Image
          src={this.itemImagePath ?? placeholderImg}
          shape="rectangle"
          type="thumbnail"
        ></Image>
      </div>
    );

    const title = (
      <h3 className="result_item_title">
        {this.props.item.title && typeof this.props.item.title === 'string'
          ? this.props.item.title
          : this.props.intl.formatMessage({
              id: 'item.untitledItem',
              defaultMessage: defaultMessages.item.untitledItem,
            })}
      </h3>
    );

    const itemCard = (
      <div>
        {itemImage}
        {title}
        {this.typeAndAuthor()}
        {this.itemDateTime()}
        {this.itemActionBar()}

        {/*
        if (this.canRemove) {
          util.setNodeText(this.addButton,this.i18n.search.item.actions.remove);
        }
         */}
      </div>
    );
    return itemCard;
  };

  render() {
    return (
      <div className="jimu-widget result_item_card" key={this.props.key}>
        {this.renderedItem()}
      </div>
    );
  }
}
