//a custom pragma to transform your jsx into plain JavaScript
/** @jsx jsx */
import { React, AllWidgetProps, jsx } from 'jimu-core';
import { IMConfig } from '../../config';
import '../main.css';
import ItemCard from './ItemCard';
import defaultMessages from '../translations/default';

interface ExtraProps {
  searchResponse: any;
  clearResults: boolean;
  addedLayersIds: string[];
}

export interface IState {
  results: any;
  sourceKey: string;
  sourceType: string;
}

export default class Widget extends React.PureComponent<
  AllWidgetProps<IMConfig> & ExtraProps,
  IState
> {
  constructor(props) {
    super(props);
  }

  processResultList = () => {
    let resultList = [];

    let results = this.props.searchResponse?.results ?? null;

    if (!results || results.length <= 0) {
      return (
      <div>
        <b>
        {this.props.intl.formatMessage({
          id: 'resultsPane.noMatch',
          defaultMessage: defaultMessages.resultsPane.noMatch,
        })}
        </b>
      </div>);
    } else {
      const showOwner = this.props.config.showOwner;

      for (var i = 0; i < results.length; i++) {

        const item: any = results[i];
        const referenceId: string = item._source.created + '-refid-' + item.id;

        const itemDiv = (
          <ItemCard
            showOwner = {showOwner}
            referenceId = {referenceId}
            item={item}
            key={i + '_' + item.id}
            sourceKey={this.props.searchResponse.sourceKey}
            sourceType={this.props.searchResponse.sourceType}
            intl={this.props.intl}
            layerAdded={ this.props.addedLayersIds?.length > 0 ? this.props.addedLayersIds.includes(referenceId) : false}
          ></ItemCard>

        );
        resultList.push(itemDiv);
      }

      return resultList;
    }
  };

  render() {
    return (
      <div className="resultsPane">
        {this.props.clearResults === true ? <div></div> : this.processResultList()}
      </div>
    );
  }
}