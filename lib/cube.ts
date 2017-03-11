import { find } from './utils';

import {
    Measure,
    IMeasureProps,
    MeasureAggregate,
    IMeasureAggregateProps,
    Attribute,
    IAttributeProps,
    IDetailAttributeProps,
    DetailAttribute
} from './commons';
import { Dimension, IDimensionProps } from './dimension';
import { Hierarchy } from './hierarchy';
import { Level } from './level';
import { SerializedCut } from './cuts';

export interface DimensionParts {
    dimension: Dimension;
    level: Level;
    levelIndex: number;
    depth?: number;
    hierarchy: Hierarchy;
    label: string;
    labelShort: string;
    labelNoLevel: string;

    fullDrilldownValue: string;
    drilldownDimension: string;
    drilldownDimensionPlus?: string;
    drilldownDimensionMinus?: string;

    cutDimension: string;
}

export interface ICubeProps {
    name: string;
    label: string;
    description: string;
    order: string;
    info: Object;
    key: string;
    category: string;
    features: { [id: string]: string[] };

    measures: IMeasureProps[];
    aggregates: IMeasureAggregateProps[];
    details: IDetailAttributeProps[];
    dimensions: IDimensionProps[];
}

export class Cube {
    name: string;
    label: string;
    description: string;
    order: string;
    info: Object;
    key: string;
    category: string;
    features: { [id: string]: string[] };

    measures: Measure[];
    aggregates: MeasureAggregate[];
    details: DetailAttribute[];
    dimensions: Dimension[];

    constructor(metadata: ICubeProps) {
        this.name = metadata.name;
        this.label = metadata.label;
        this.description = metadata.description;
        this.key = metadata.key;
        this.info = metadata.info;
        this.category = metadata.category;
        this.features = metadata.features;

        this.measures = (metadata.measures || []).map(function (m) { return new Measure(m); });
        this.aggregates = (metadata.aggregates || []).map(function (m) { return new MeasureAggregate(m); });
        this.details = (metadata.details || []).map(function (m) { return new Attribute(m); });

        this.dimensions = (metadata.dimensions || []).map(function (dim) { return new Dimension(dim); });
    }

    dimension(name: string): Dimension {
        // Return a dimension with given name
        return find(this.dimensions, dim => dim.name === name);
    }

    cvdim_dim(dimensionString: string): Dimension {
        // Get a dimension by name. Accepts dimension hierarchy and level in the input string.
        let dimname = dimensionString;
        if (dimensionString.indexOf('@') > 0) {
            dimname = dimensionString.split('@')[0];
        } else if (dimensionString.indexOf(':') > 0) {
            dimname = dimensionString.split(':')[0];
        }

        return this.dimension(dimname);
    }

    dimensionParts(dimensionString: string): DimensionParts {
        // Get a dimension info by name. Accepts dimension hierarchy and level in the input string.

        const dim = this.cvdim_dim(dimensionString);
        let hie = dim.default_hierarchy;

        if (dimensionString.indexOf('@') > 0) {
            const hierarchyName = dimensionString.split('@')[1].split(':')[0];
            hie = dim.hierarchies[hierarchyName];
        }

        let lev: Level;
        let levelIndex = 0;
        if (dimensionString.indexOf(':') > 0) {
            let levelname = dimensionString.split(':')[1];
            lev = dim.level(levelname);
            for (levelIndex = 0; levelIndex < hie.levels.length && hie.levels[levelIndex] !== lev; levelIndex++);
        } else {
            lev = hie.levels[0];
        }

        let depth = null;
        for (let i = 0; i < hie.levels.length; i++) {
            if (lev.name === hie.levels[i].name) {
                depth = i + 1;
                break;
            }
        }

        return {
            dimension: dim,
            level: lev,
            levelIndex: levelIndex,
            depth: depth,
            hierarchy: hie,
            label: dim.label + (hie.name !== 'default' ? (' - ' + hie.label) : '') + (hie.levels.length > 1 ? (' / ' + lev.label) : ''),
            labelShort: (dim.label + (hie.levels.length > 1 ? (' / ' + lev.label) : '')),
            labelNoLevel: dim.label + (hie.name !== 'default' ? (' - ' + hie.label) : ''),

            fullDrilldownValue: dim.name + (hie.name !== 'default' ? ('@' + hie.name) : '') + ':' + lev.name,
            drilldownDimension: dim.name + '@' + hie.name + ':' + lev.name,
            drilldownDimensionPlus: (hie.levels.length > 1 && levelIndex < hie.levels.length - 1) ? (dim.name + '@' + hie.name + ':' + hie.levels[levelIndex + 1].name) : null,
            drilldownDimensionMinus: (hie.levels.length > 1 && levelIndex > 0) ? (dim.name + '@' + hie.name + ':' + hie.levels[levelIndex - 1].name) : null,

            cutDimension: dim.name + (hie.name !== 'default' ? '@' + hie.name : '')
        };
    }

    dimensionPartsFromCut(cut: SerializedCut) {
        const parts = this.dimensionParts(cut.dimension);
        if (!parts) return null;

        const depth = (cut.value.split(';')[0].match(/,/g) || []).length + 1;

        const dimstring = parts.dimension.name + '@' + parts.hierarchy.name + ':' + parts.hierarchy.levels[depth - 1].name;
        return this.dimensionParts(dimstring);
    }

    measureAggregates(measureName: string): MeasureAggregate[] {
        return this.aggregates.filter(ia => measureName ? ia.measure === measureName : !ia.measure);
    }

    aggregateFromName(aggregateName: string): MeasureAggregate {
        return find(this.aggregates, ia => aggregateName ? ia.name === aggregateName : !ia.measure);
    }

    get dateDimensions(): Dimension[] {
        return this.dimensions.filter(d => d.isDateDimension);
    }
}
