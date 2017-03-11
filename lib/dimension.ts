import { find } from './utils';

import { Level, ILevelProps } from './level';
import { Hierarchy, IHierarchyProps } from './hierarchy';

export const DIMENSION_STRING_SEPARATOR_CHAR = ':';
export const DIMENSION_STRING_SEPARATOR = /:/g;

export const SPLIT_DIMENSION_STRING = '__within_split__';

export interface IDimensionProps {
    name: string;
    label: string;
    description?: string;
    default_hierarchy_name?: string;
    info?: Object;
    role?: string;
    cardinality?: number;
    nonadditive?: boolean;
    is_flat?: boolean;
    levels: ILevelProps[];
    hierarchies: IHierarchyProps[];
}

export class Dimension {
    name: string;
    label: string;
    description: string;
    default_hierarchy_name: string;
    info: Object;
    role: string;
    cardinality: number;
    nonadditive: boolean;
    is_flat: boolean;

    levels: Level[];
    hierarchies: {[id: string]: Hierarchy};

    constructor(md: IDimensionProps) {
        this.name = md.name;
        !md.label || (this.label = md.label);
        !md.description || (this.description = md.description);
        !md.default_hierarchy_name || (this.default_hierarchy_name = md.default_hierarchy_name);
        !md.info || (this.info = md.info);
        !md.role || (this.role = md.role);
        !md.cardinality || (this.cardinality = md.cardinality);
        !md.nonadditive || (this.nonadditive = md.nonadditive);
        !md.is_flat || (this.is_flat = md.is_flat);

        this.levels = [];

        if (md.levels) {
            this.levels = md.levels.map(level => new Level(this.name, level));
        }

        this.hierarchies = {};

        if (md.hierarchies) {
            for (const i in md.hierarchies) {
                const hier = new Hierarchy(md.hierarchies[i], this);
                this.hierarchies[hier.name] = hier;
            }
        }

        // if no default_hierarchy_name defined, use first hierarchy's name.
        if (!this.default_hierarchy_name && md.hierarchies
            && md.hierarchies.length > 0) {
            this.default_hierarchy_name = md.hierarchies[0].name;
        }
    }

    get default_hierarchy(): Hierarchy {
        return this.hierarchies[this.default_hierarchy_name];
    }

    level(name: string): Level {
        return find(this.levels, level => level.name === name);
    }

    toString(): string {
        return this.name;
    }

    get display_label(): string {
        return this.label || this.name;
    }

    get isDateDimension(): boolean {
        // Inform if a dimension is a date dimension and can be used as a date
        // filter (i.e. with date selection tool).
        return ((this.role === 'time') &&
                ((! ('cv-datefilter' in this.info)) || (this.info['cv-datefilter'] === true)) );
    }

    get hierarchies_count(): number {
        return Object.keys(this.hierarchies).reduce((count, hiename) => {
            if (this.hierarchies.hasOwnProperty(hiename))
                return count + 1;

            return count;
        }, 0);
    }
}

export const SPLIT_DIMENSION = new Dimension({
    name: SPLIT_DIMENSION_STRING,
    label: 'Matches Filters',
    hierarchies: [{ name: 'default', levels: [SPLIT_DIMENSION_STRING] }],
    levels: [{ name: SPLIT_DIMENSION_STRING, attributes: [{ name: SPLIT_DIMENSION_STRING }], label: 'Matches Filters' }]
});
