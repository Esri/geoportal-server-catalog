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
            bkgrdStyle = {display: 'flex', fontWeight: 'bold'};
        else
            bkgrdStyle = {display: 'flex'};

        return (
            <div className='catalogItem' style={bkgrdStyle}>
                <Checkbox aria-label="Checkbox" checked={this.props.checked} onChange={this.handleChanged} />
                <div onClick={this.selectName} style={{ display: 'flex'}}>
                    <div>{this.props.name}</div>
                    <div className='catalogCount'>{this.props.count}</div>
                </div>
            </div>
        );
    }

}