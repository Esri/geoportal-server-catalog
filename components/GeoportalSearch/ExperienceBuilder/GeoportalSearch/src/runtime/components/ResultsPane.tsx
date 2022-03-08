//a custom pragma to transform your jsx into plain JavaScript
/** @jsx jsx */
import { React, AllWidgetProps, jsx } from 'jimu-core'
import { IMConfig } from '../../config'
import '../main.css'

interface ExtraProps {
  resultList: any[]
  clearResults: boolean
}

export interface IState {
  results: any
}

export default class Widget extends React.PureComponent<
  AllWidgetProps<IMConfig> & ExtraProps,
  IState
> {
  constructor(props) {
    super(props)

    this.state = {
      results: null
    }
  }

  componentDidUpdate(): void {
    console.log(' componentDidUpdate ')
  }

  // processResultList = () => {
  //   let resultList = [];

  //   if (!this.props.resultList || this.props.resultList.length <= 0) {
  //     this.setState({results: []})
  //   } else {
  //     for (var i=0; i< this.props.resultList.length; i++) {
  //       // TODO - render links and corresponding actions (Zoom to, Add, Details, Links)
  //       // TODO - if action fails, render message in message span
  //       let item: any =  this.props.resultList[i];
  //       let itemDiv = (<div className="g_item_card" key={"results"}>
  //           <div key={i} className="g_item_title">{item.title}</div>
  //           <div className="g_item_thumbnail"><img key={i} className="g_item_thumbnail" src={item._source.thumbnail_s}/></div>
  //           <div className="g_item_description">{item.description}</div>
  //           <div className="g_action_bar">
  //             <span key={"message_"+i} className="g_action_message"></span>
  //             <a key={"zoomTo_"+i} className="g_action_zoomto">Zoom to</a>
  //             <a key={"add_"+i} className="g_action_add">Add</a>
  //             <a key={"details_"+i} className="g_action_details">Details</a>
  //             <span key={"links_"+i} className="g_action_links">Links</span>
  //           </div>
  //         </div>)
  //       resultList.push(itemDiv);
  //     }
  //     this.setState({results: resultList})
  //   }
  // }

  processResultList = () => {
    let resultList = []

    if (!this.props.resultList || this.props.resultList.length <= 0) {
      return <div>No results......</div>
      // this.setState({results: []})
    } else {
      for (var i = 0; i < this.props.resultList.length; i++) {
        // TODO - render links and corresponding actions (Zoom to, Add, Details, Links)
        // TODO - if action fails, render message in message span
        let item: any = this.props.resultList[i]
        let itemDiv = (
          <div className="g_item_card" key={'result' + i}>
            <div key={i} className="g_item_title">
              {item.title}
            </div>
            <div className="g_item_thumbnail">
              <img
                key={i}
                className="g_item_thumbnail"
                src={item._source.thumbnail_s}
              />
            </div>
            <div className="g_item_description">{item.description}</div>
            <div className="g_action_bar">
              <span key={'message_' + i} className="g_action_message"></span>
              <a key={'zoomTo_' + i} className="g_action_zoomto">
                Zoom to
              </a>
              <a key={'add_' + i} className="g_action_add">
                Add
              </a>
              <a key={'details_' + i} className="g_action_details">
                Details
              </a>
              <span key={'links_' + i} className="g_action_links">
                Links
              </span>
            </div>
          </div>
        )
        resultList.push(itemDiv)
      }
      return resultList
      // this.setState({results: resultList})
    }
  }

  temp = () => {
    return <div>test</div>
  }

  render() {
    console.log('**render')
    return (
      <div className="jimu-widget">
        {this.props.clearResults === true ? (
          <div></div>
        ) : (
          this.processResultList()
        )}
      </div>
    )
  }
}
