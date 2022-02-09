import { React, FormattedMessage, css, jsx } from "jimu-core";
import { AllWidgetSettingProps } from "jimu-for-builder";
import { TextInput, Checkbox, Tooltip, Icon } from "jimu-ui";
import { JimuMapViewSelector, SettingSection, SettingRow } from "jimu-ui/advanced/setting-components";
import { IMConfig } from "../config";

export interface IProperties {
    config: IMConfig;
    displayDefaults: boolean;
    deleteCallback: any;
    id: string;
}

export class SelectTarget extends React.Component<IProperties, any> {
    constructor(props) {
        super(props);
 
        let useDefaults = this.props.displayDefaults;
        let defaultTarget = this.props.config.targets[0];

        if(!defaultTarget){
            this.state = { 
                name: '', 
                url:  '',
                type:  '',
                profile:  '',
                filter:  '',
                enabled:  false,
                useProxy:  false,
                disableContentType:  false
            }; 
        } else {
            this.state = { 
                name: useDefaults ? defaultTarget.name : '', 
                url: useDefaults ? defaultTarget.url : '',
                type: useDefaults ? defaultTarget.type : '',
                profile: useDefaults ? defaultTarget.profile : '',
                filter: useDefaults ? defaultTarget.requiredFilter : '',
                enabled: useDefaults ? defaultTarget.enabled : false,
                useProxy: useDefaults ? defaultTarget.useProxy : false,
                disableContentType: useDefaults ? defaultTarget.disableContentType : false
            }; 
        }

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleURLChange = this.handleURLChange.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleProfileChange = this.handleProfileChange.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleEnabledChange = this.handleEnabledChange.bind(this);
        this.handleUseProxyChange = this.handleUseProxyChange.bind(this);
        this.handleDisableContentTypeChange = this.handleDisableContentTypeChange.bind(this);
        this.removeCatalog = this.removeCatalog.bind(this);
    }
 
    getDefaultValue(propName) {
        let val = '';
        if (this.props.config.targets && this.props.config.targets.length > 0 && this.props.displayDefaults) {
            let target = this.props.config.targets[0];
            val = target[propName];
        }
        return val;
    }

    getDefaultValueBool(propName) {
        let val = false;
        if (this.props.config.targets && this.props.config.targets.length > 0 && this.props.displayDefaults) {
            let target = this.props.config.targets[0];
            val = target[propName];
        } 
        return val;
    }

    handleNameChange(value) {
        this.setState((prevState) => ({
            ...prevState,
            name: value
          }));
    }

    handleURLChange(value) {
        this.setState((prevState) => ({
            ...prevState,
            url: value
          }));
    }

    handleTypeChange(value) {
        this.setState((prevState) => ({
            ...prevState,
            type: value
          }));
    }

    handleProfileChange(value) {
        this.setState((prevState) => ({
            ...prevState,
            profile: value
          }));
    }

    handleFilterChange(value) {
        this.setState((prevState) => ({
            ...prevState,
            filter: value
          }));
    }

    handleEnabledChange(event) {
        this.setState({enabled: !this.state.enabled });
    }

    handleUseProxyChange(event) {
        this.setState({useProxy: !this.state.useProxy });
    }

    handleDisableContentTypeChange(event) {
        this.setState({disableContentType: !this.state.disableContentType });
    }

    removeCatalog = (event) => {
        this.props.deleteCallback(this.props.id);
    }

    render() {
        return (
            <div style={{paddingBottom: '10px'}} >
                <SettingSection title='Catalog'>
                    <div style={{paddingBottom: '10px'}}>
                    <table>
                        <tr>
                            <td><label >Name: </label></td>
                            <td><TextInput onAcceptValue={this.handleNameChange} defaultValue={this.getDefaultValue('name')}/></td>
                            <td>
                               <span className="inline-block ml-2 tips-pos" onClick={this.removeCatalog}>
                                   <Icon icon={require('jimu-ui/lib/icons/delete.svg')} style={{cursor: 'pointer'}} size={14} title={'Remove this catalog'}/>
                               </span>
                            </td>
                        </tr>
                        <tr>
                            <td><label >URL: </label></td>
                            <td><TextInput onAcceptValue={this.handleURLChange} defaultValue={this.getDefaultValue('url')}/></td>
                            <td>
                                <Tooltip title={this.props.config.urlTooltip} showArrow={true} placement="left">
                                    <span className="inline-block ml-2 tips-pos">
                                        <Icon icon={require('jimu-ui/lib/icons/info-12.svg')} size={12} />
                                    </span>
                                </Tooltip>
                            </td>
                        </tr>
                        <tr>
                            <td><label >Type: </label></td>
                            <td><TextInput onAcceptValue={this.handleTypeChange} defaultValue={this.getDefaultValue('type')}/></td>
                            <td>
                                <Tooltip title={this.props.config.typeTooltip} showArrow={true} placement="left">
                                    <span className="inline-block ml-2 tips-pos">
                                        <Icon icon={require('jimu-ui/lib/icons/info-12.svg')} size={12} />
                                    </span>
                                </Tooltip>
                            </td>
                        </tr>
                        <tr>
                            <td><label >Profile: </label></td>
                            <td><TextInput onAcceptValue={this.handleProfileChange} defaultValue={this.getDefaultValue('profile')}/></td>
                            <td>
                                <Tooltip title={this.props.config.profileTooltip} showArrow={true} placement="left">
                                    <span className="inline-block ml-2 tips-pos">
                                        <Icon icon={require('jimu-ui/lib/icons/info-12.svg')} size={12} />
                                    </span>
                                </Tooltip>
                            </td>
                        </tr>
                        <tr>
                            <td><label >Filter: </label></td>
                            <td><TextInput onAcceptValue={this.handleFilterChange} defaultValue={this.getDefaultValue('requiredFilter')}/></td>
                            <td>
                                <Tooltip title={this.props.config.filterTooltip} showArrow={true} placement="left">
                                    <span className="inline-block ml-2 tips-pos">
                                        <Icon icon={require('jimu-ui/lib/icons/info-12.svg')} size={12} />
                                    </span>
                                </Tooltip>
                            </td>
                        </tr>
                    </table>
                    </div>
                    <SettingRow>
                        <div className="d-flex w-100">
                            <Checkbox onChange={this.handleEnabledChange} checked={this.getDefaultValueBool('enabled')} />
                            <div className="text-truncate ml-2">Enabled</div>
                        </div>

                        <div className="d-flex w-100">
                            <Checkbox onChange={this.handleUseProxyChange} checked={this.getDefaultValueBool('useProxy')}/>
                            <div className="text-truncate ml-2">Use Proxy</div>
                        </div>
                    </SettingRow>
                    <SettingRow>
                        <div className="d-flex w-100">
                            <Checkbox onChange={this.handleDisableContentTypeChange} checked={this.getDefaultValueBool('disableContentType')}/>
                            <div className="text-truncate ml-2">Disable Content-Type Header</div>
                        </div>
                    </SettingRow>
                </SettingSection>
                <hr style={{display: 'none'}}/> 
            </div>
        );
    }
}