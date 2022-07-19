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
import { React, jsx, IntlShape } from 'jimu-core';
import { Checkbox } from 'jimu-ui';

interface ExtraProps {
    catalogKey: string;
    name: string;
    checked: boolean;
    selected: boolean;
    toSearch: (id: string, checked: boolean) => void;
    showResults: (id: string) => void;
    count?: number;
    selectedColor: string;
  }

export default class CatalogSelection extends React.PureComponent<ExtraProps, null> {
    constructor(props) {
        super(props);
    }

    handleChanged = (evt:React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        this.props.toSearch(this.props.catalogKey, checked);
    }

    selectName = (evt:any) => {
        this.props.showResults(this.props.catalogKey);
    }

    render() {
        let bkgrdStyle = {};
        if (this.props.selected)
            bkgrdStyle = {fontWeight: 'bold', backgroundColor: this.props.selectedColor};
        else
            bkgrdStyle = {};

        return (
            <div className='catalogItem' style={bkgrdStyle}>
                <Checkbox aria-label="Checkbox" checked={this.props.checked} onChange={this.handleChanged} />
                <div onClick={this.selectName} className='catalogItemDetails'>
                    <div className='catalogName'>{this.props.name} {'   '}</div>
                    <div className='catalogSpacing'></div>
                    <div className='catalogCount'>{this.props.count}</div>
                </div>
            </div>
        );
    }

}