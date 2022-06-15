//a custom pragma to transform your jsx into plain JavaScript
/** @jsx jsx */
import { React, AllWidgetProps, jsx } from 'jimu-core';
import { IMConfig } from '../../config';
import '../main.css';
import WidgetContext from '../gs/widget/WidgetContext';
import ItemCard from './ItemCard';

interface ExtraProps {
  searchResponse: any;
  clearResults: boolean;
  widgetContext: WidgetContext;
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
      return <div>No results......</div>;
    } else {
      const showOwner = this.props.widgetContext.widgetConfig.showOwner;

      console.log(this.props.addedLayersIds);

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
      <div className="jimu-widget">
        {this.props.clearResults === true ? <div></div> : this.processResultList()}
      </div>
    );
  }
}
