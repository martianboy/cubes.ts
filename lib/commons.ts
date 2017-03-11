type TMissingValue = string | number | null | boolean;

enum ENonAdditivity {
    None,
    Time,
    All
}

interface IAttributeBaseProps {
    name: string;
    ref?: string;
    label?: string;
    description?: string;
    info?: Object;

    format?: string;
    order?: string;
    missing_value?: TMissingValue;
}

export interface IMeasureProps extends IAttributeBaseProps {
    nonadditive?: string;
    expression?: string;
    aggregates?: string[];
}

export class Measure {
    name: string;
    label?: string;
    order?: string;
    info?: Object;
    description?: string;
    expression?: string;
    format?: string;
    nonadditive?: ENonAdditivity;
    missing_value?: TMissingValue;
    aggregates?: string[];

    constructor(props: IMeasureProps) {
        this.name = props.name;
        this.label = props.label;
        this.order = props.order;
        this.info = (props.info || {});
        this.description = props.description;
        this.format = props.format;
        this.missing_value = props.missing_value;
        switch (props.nonadditive) {
        case 'none':
            this.nonadditive = ENonAdditivity.None;
            break;
        case 'time':
            this.nonadditive = ENonAdditivity.Time;
            break;
        case 'all':
            this.nonadditive = ENonAdditivity.All;
            break;
        }

        this.expression = props.expression;

        if (props.aggregates) {
            this.aggregates = props.aggregates;
        }
    }
}

export interface IMeasureAggregateProps extends IAttributeBaseProps {
    expression?: string;
    function?: string;
    formula?: string;
    nonadditive?: string;
    measure?: string;
}

export class MeasureAggregate {
    name: string;
    ref?: string;
    label?: string;
    order?: string;
    info?: Object;
    description?: string;
    format?: string;
    nonadditive?: string;
    measure?: string;
    function?: string;
    formula?: string;
    expression?: string;
    missing_value?: TMissingValue;

    constructor(props: IMeasureAggregateProps) {
        this.name = props.name;
        this.ref = props.ref;
        this.label = props.label;
        this.order = props.order;
        this.info = (props.info || {});
        this.description = props.description;
        this.format = props.format;
        this.missing_value = props.missing_value;
        this.nonadditive = props.nonadditive;

        this.function = props.function;
        this.formula = props.formula;
        this.expression = props.expression;
        this.measure = props.measure;
    }
}

export interface IDetailAttributeProps extends IAttributeBaseProps {
    locales?: string[];
}

export class DetailAttribute {
    name: string;
    ref?: string;
    label?: string;
    description?: string;
    info?: Object;

    format?: string;
    order?: string;
    missing_value?: TMissingValue;
    locales?: string[];

    constructor(props: IDetailAttributeProps) {
        this.ref = props.ref;
        this.name = props.name;
        this.label = props.label;
        this.order = props.order;
        this.info = (props.info || {});
        this.description = props.description;
        this.format = props.format;
        this.missing_value = props.missing_value;
        this.locales = props.locales;
    }
}

export const ATTRIBUTE_STRING_SEPARATOR_CHAR = '.';

export interface IAttributeProps extends IAttributeBaseProps {
    locales?: string[];
}

export class Attribute {
    name: string;
    label: string;
    description: string;
    ref: string;
    order: string;
    info: any;
    format: string;
    missing_value: TMissingValue;
    locales: string[];

    constructor(props: IAttributeProps) {
        this.ref = props.ref;
        this.name = props.name;
        this.label = props.label;
        this.order = props.order;
        this.info = (props.info || {});
        this.description = props.description;
        this.format = props.format;
        this.missing_value = props.missing_value;
        this.locales = props.locales;
    }
}
