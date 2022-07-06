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