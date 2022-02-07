import { React, FormattedMessage, css, jsx } from "jimu-core";
import { AllWidgetSettingProps } from "jimu-for-builder";
import { Button, Link } from "jimu-ui";
import { JimuMapViewSelector, SettingSection, SettingRow } from "jimu-ui/advanced/setting-components";
import { RefObject } from "react";
import { IMConfig } from "../config";
import { SelectTarget } from "./select-target";
import './setting.css';

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, any> {

    ref:any;

    constructor(props) {
        super(props);

        this.ref = React.createRef();

        let defaultTarget = <SelectTarget id={this.generateID()} deleteCallback={this.deleteTarget} ref={this.ref} config={this.props.config} displayDefaults={true}/>;
        let allTargets = [defaultTarget];
        this.state = { targets: allTargets };  

        this.onSaveClick = this.onSaveClick.bind(this);
        this.propertyChosenHelper = this.propertyChosenHelper.bind(this);
    }

    onSaveClick = () => {
        let targetsConfig = this.state.targets;

        if(!targetsConfig || targetsConfig.length == 0){
            return;
        }

        let newTargets: any[]; 
        newTargets = [];
        
        targetsConfig.forEach( (targetConfig) => {
            let target = {};
            
            target['name'] = targetConfig.ref.current.state.name;
            target['url'] = targetConfig.ref.current.state.url;
            target['type'] = targetConfig.ref.current.state.type;
            target['profile'] = targetConfig.ref.current.state.profile;
            target['filter'] = targetConfig.ref.current.state.filter;
            target['enabled'] = targetConfig.ref.current.state.enabled;
            target['useProxy'] = targetConfig.ref.current.state.useProxy;
            target['disableContentType'] = targetConfig.ref.current.state.disableContentType;
            
            newTargets.push(target);
        });

        
        this.propertyChosenHelper('targets', newTargets);
        
    }

    propertyChosenHelper = (property: string, value: any) => {
        this.props.onSettingChange({
            id: this.props.id,
            config: this.props.config.set(property, value)
        });
    }

    generateID = () => {
        return Math.random().toString(16).slice(-4);
    } 

    deleteTarget = (id) => {
        let targetsConfig = this.state.targets;

        if(!targetsConfig || targetsConfig.length == 0){
            return;
        }

        const filtered = targetsConfig.filter(obj => obj.props.id !== id);
        this.setState({targets: filtered });
    }

    addNewTarget = (event) => {
        let newTarget = <SelectTarget id={this.generateID()} deleteCallback={this.deleteTarget} ref={React.createRef()}  config={this.props.config} displayDefaults={false}/>;
        
        let targets = this.state.targets;
        targets.push(newTarget);

        this.setState({targets: targets });
        this.forceUpdate();
    }

    render() {
        return (
            <div>
                <div style={{textAlign: 'left', paddingLeft: '5px'}}>
                    <Link themeStyle={{type: 'link'}} onClick={this.addNewTarget}>Add</Link>
                </div>
                <div id='targetsContainer'>
                 {this.state.targets} 
                </div>
                <div className='css-11nf4c jimu-widget-setting--row form-group align-items-center row' style={{paddingLeft: '15px', paddingRight: '15px'}}>
                    <Button className='jimu-btn w-100 css-kmqp37 btn btn-primary' disabled={this.state.targets == null || this.state.targets.length == 0} onClick={this.onSaveClick}>Save</Button>
                </div>
            </div>
             
            
        );
    }
}