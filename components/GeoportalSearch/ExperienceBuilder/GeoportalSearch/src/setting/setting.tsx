//a custom pragma to transform your jsx into plain JavaScript
/** @jsx jsx */
/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { jsx, React } from 'jimu-core';
import { AllWidgetSettingProps } from 'jimu-for-builder';
import { Button, Link } from 'jimu-ui';
import { MapWidgetSelector, SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components';
import { IMConfig } from '../config';
import { SelectTarget } from './select-target';
import './setting.css';
import defaultMessages from './translations/default';

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, any> {

  constructor(props) {
    super(props);

    let allTargets = [];
    if (this.props.config.targets?.length > 0) {
      this.props.config.targets.forEach(t => {
        allTargets.push(
          <SelectTarget
            deleteCallback={this.deleteTarget}
            ref={React.createRef()}
            config={this.props.config}
            intl={this.props.intl}
            curTarget={t}
          />
        )
      })
      this.state = { targets: allTargets };
    }

    this.onSaveClick = this.onSaveClick.bind(this);
    this.propertyChosenHelper = this.propertyChosenHelper.bind(this);
  }

  onSaveClick = () => {
    let targetsConfig = this.state.targets;

    if (!targetsConfig || targetsConfig.length == 0) {
      return;
    }

    let newTargets: any[];
    newTargets = [];

    targetsConfig.forEach((targetConfig) => {
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
  };

  propertyChosenHelper = (property: string, value: any) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(property, value),
    });
  };

  deleteTarget = (id) => {
    let targetsConfig = this.state.targets;

    if (!targetsConfig || targetsConfig.length == 0) {
      return;
    }

    const filtered = targetsConfig.filter((obj) => obj.ref.current.state.name !== id);
    this.setState({ targets: filtered });
  };

  addNewTarget = (event) => {
    let newTarget = (
      <SelectTarget
        deleteCallback={this.deleteTarget}
        ref={React.createRef()}
        config={this.props.config}
        displayDefaults={false}
        defaultTarget={this.props.config.targets[0]}
        intl={this.props.intl}
        curTarget={null}
      />
    );

    let targets = this.state.targets;
    targets.push(newTarget);

    this.setState({ targets: targets });
    this.forceUpdate();
  };

  onMapSelected = (useMapWidgetIds: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds,
    });
  };

  render() {
    return (
      <div>
        <SettingSection
          className="map-selector-section"
          title={this.props.intl.formatMessage({
            id: 'selectMapLabel',
            defaultMessage: defaultMessages.selectMapLabel,
          })}
        >
          <SettingRow>
            <MapWidgetSelector
              onSelect={this.onMapSelected}
              useMapWidgetIds={this.props.useMapWidgetIds}
            />
          </SettingRow>
        </SettingSection>

        <div style={{ textAlign: 'left', paddingLeft: '5px' }}>
          <Link themeStyle={{ type: 'link' }} onClick={this.addNewTarget}>
            {this.props.intl.formatMessage({
              id: 'addCatalogLink',
              defaultMessage: defaultMessages.addCatalogLink,
            })}
          </Link>
        </div>
        <div id="targetsContainer">{this.state.targets}</div>
        <div
          className="jimu-widget-setting--row form-group align-items-center row"
          style={{ paddingLeft: '15px', paddingRight: '15px' }}
        >
          <Button
            className="jimu-btn w-100 btn btn-primary"
            disabled={this.state.targets == null || this.state.targets.length == 0}
            onClick={this.onSaveClick}
          >
            {this.props.intl.formatMessage({
              id: 'saveButtonLabel',
              defaultMessage: defaultMessages.saveButtonLabel,
            })}
          </Button>
        </div>
      </div>
    );
  }
}
