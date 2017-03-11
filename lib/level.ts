import { find } from './utils';
import { Attribute, IAttributeProps, ATTRIBUTE_STRING_SEPARATOR_CHAR } from './commons';
import { ICellKey, ICellRead, ICellValue } from './cell';

const DIMENSION_STRING_SEPARATOR_CHAR = ':';

export interface ILevelProps {
    dimension_name?: string;
    name: string;
    label?: string;
    info?: any;
    role?: any;
    description?: string;
    cardinality?: number;
    nonadditive?: boolean;

    key?: string;
    label_attribute?: string;
    order_attribute?: string;
    attributes?: IAttributeProps[];
}

export class Level {
    dimension_name: string;
    name: string;
    label: string;
    info: any;
    role: any;
    description: string;
    cardinality: number;
    nonadditive: boolean;

    _key: string;
    _label_attribute: string;
    _order_attribute: string;
    attributes: Attribute[];

    constructor(dimension_name: string, props: ILevelProps) {
        this.dimension_name = dimension_name;
        this.name = props.name;
        !props.label || (this.label = props.label);
        !props.description || (this.description = props.description);
        !props.info || (this.info = props.info);
        this._key = props.key;
        this._label_attribute = props.label_attribute;
        this._order_attribute = props.order_attribute;
        !props.role || (this.role = props.role);
        !props.cardinality || (this.cardinality = props.cardinality);
        this.nonadditive = props.nonadditive;

        this.attributes = [];

        if (props.attributes) {
            this.attributes = props.attributes.map(attr => new Attribute(attr));
        }
    }

    get key(): Attribute {
        return find(this.attributes, attr => attr.name === this._key) || this.attributes[0];
    }

    get label_attribute(): Attribute {
        // Label attribute is either explicitly specified or it is second attribute if there are more
        // than one, otherwise it is first
        let the_attr = null;
        if (this._label_attribute) {
            the_attr = find(this.attributes, attr => attr.name === this._label_attribute);
        }
        return the_attr || this.key;
    }

    get order_attribute(): Attribute {
        let the_attr = null;
        if (this._order_attribute) {
            the_attr = find(this.attributes, attr => attr.name === this._order_attribute);
        }
        return the_attr || this.key;
    }

    toString() {
        return this.name;
    }

    readCell(cell: ICellValue): ICellRead | null {
        if (!(this.key.ref in cell)) return null;

        const result: ICellRead = {
            key: cell[this.key.ref],
            label: <string>cell[this.label_attribute.ref],
            orderValue: cell[this.order_attribute.ref],
            info: {}
        };

        for (const attribute of this.attributes) {
            result.info[attribute.ref] = cell[attribute.ref];
        }

        return result;
    }

    get display_name(): string {
        return this.label || this.name;
    }

    get full_name(): string {
        return this.dimension_name + ATTRIBUTE_STRING_SEPARATOR_CHAR + this.name;
    }

    get full_name_for_drilldown(): string {
        return this.dimension_name + DIMENSION_STRING_SEPARATOR_CHAR + this.name;
    }
}
