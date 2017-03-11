import { Dimension, DIMENSION_STRING_SEPARATOR_CHAR, SPLIT_DIMENSION_STRING, SPLIT_DIMENSION } from './dimension';
import { Hierarchy, HIERARCHY_PREFIX_CHAR } from './hierarchy';
import { Level } from './level';
import { Cube } from './cube';

import { CUT_STRING_SEPARATOR, CUT_STRING_SEPARATOR_CHAR } from './cuts';

import * as utils from './utils';

export const DRILLDOWN_PARSE_REGEXP = new RegExp('^(\\w+)(?:' + HIERARCHY_PREFIX_CHAR + '(\\w+))?(?:' + DIMENSION_STRING_SEPARATOR_CHAR + '(\\w+))?$');

export default class Drilldown {
    dimension: Dimension;
    hierarchy: Hierarchy;
    level: Level;

    constructor(dimension: Dimension, hierarchy: string, level: string) {
        this.dimension = dimension;
        this.hierarchy = hierarchy ? dimension.hierarchies[hierarchy] : dimension.default_hierarchy;
        this.level = dimension.level(level) || this.hierarchy.levels[0];
        if (!this.hierarchy)
            throw 'Drilldown cannot recognize hierarchy ' + hierarchy + ' for dimension ' + dimension.toString();
        if (!this.level)
            throw 'Drilldown cannot recognize level ' + level + ' for dimension ' + dimension.toString();
    }

    toString(): string {
        return '' + this.dimension.toString() + this.hierarchy.toString() +
                DIMENSION_STRING_SEPARATOR_CHAR + this.level.toString();
    }

    keysInResultCell(): string[] {
        let saw_this_level = false;
        return this.hierarchy.levels
            .filter((level: Level) => (level.key === this.level.key && (saw_this_level = true)) || (!saw_this_level))
            .map(level => level.key.ref);
    }

    labelsInResultCell(): string[] {
        let saw_this_level = false;
        return this.hierarchy.levels
            .filter((level: Level) => (level.key === this.level.key && (saw_this_level = true)) || (!saw_this_level))
            .map(level => level.label_attribute.ref);
    }
}

export function drilldown_from_string(cube: Cube, drilldown_string: string): Drilldown {
    const match = DRILLDOWN_PARSE_REGEXP.exec(drilldown_string);
    if (!match) {
        return null;
    }

    const dim_name = match[1],
        hierarchy = match[2] || null,
        level = match[3] || null;
    let dimension = cube.dimension(dim_name);
    if (!dimension)
        if (dim_name === SPLIT_DIMENSION_STRING)
            dimension = SPLIT_DIMENSION;
        else
            return null;

    return new Drilldown(dimension, hierarchy, level);
}

export function drilldowns_from_string(cube: Cube, drilldown_param_value: string): Drilldown[] {
    const dd_strings = utils._split_with_negative_lookbehind(drilldown_param_value, CUT_STRING_SEPARATOR, '\\');
    return (dd_strings || []).map(e => drilldown_from_string(cube, e));
}

export function drilldowns_to_string(drilldowns: Drilldown[]): string {
    return drilldowns.map(d => d.toString()).join(CUT_STRING_SEPARATOR_CHAR);
}
