import { Dimension, DIMENSION_STRING_SEPARATOR_CHAR } from './dimension';
import { Hierarchy, HIERARCHY_PREFIX_CHAR } from './hierarchy';
import { Level } from './level';
import { Cube } from './cube';

import * as paths from './paths';
import * as utils from './utils';

type Path = string[];

export interface ICellProps {
    type: string;
    dimension: string;
    hierarchy: string;
    invert: boolean;
    level_depth?: number;
    path?: Path;
    paths?: Path[];
    from_path?: Path;
    to_path?: Path;
}

export type Cut = PointCut | SetCut | RangeCut;

export const CUT_INVERSION_CHAR = '!';

export const RANGE_CUT_SEPARATOR_CHAR = '-';
export const SET_CUT_SEPARATOR_CHAR = ';';
export const CUT_STRING_SEPARATOR_CHAR = '|';

export const CUT_STRING_SEPARATOR = /\|/g;
export const RANGE_CUT_SEPARATOR = /-/g;
export const SET_CUT_SEPARATOR = /;/g;

export const CUT_PARSE_REGEXP = new RegExp('^(' + CUT_INVERSION_CHAR + '?)(\\w+)(?:' + HIERARCHY_PREFIX_CHAR + '(\\w+))?' + DIMENSION_STRING_SEPARATOR_CHAR + '(.*)$');

export class SerializedCut {
    dimension: string;
    value: string;
    invert: boolean;

    toString(cube: Cube): string {
        const invert = this.invert ? '!' : '';
        const dimParts = cube.dimensionParts(this.dimension);
        const cutDim = dimParts.dimension.name + (dimParts.hierarchy.name !== 'default' ? '@' + dimParts.hierarchy.name : '');

        return invert + cutDim + ':' + this.value;
    }

    toCut(cube: Cube): Cut {
        return cut_from_string(cube, serializedCutToString(cube, this));
    }
}

export class PointCut {
    type: string;
    dimension: Dimension;
    hierarchy: Hierarchy;
    invert: boolean;
    path: Path;
    level_depth: number;
    level: Level;

    constructor(dimension: Dimension, hierarchy: string, path: Path, invert: boolean, level_depth: number) {
        this.type = 'point';
        this.dimension = dimension;
        this.hierarchy = dimension.hierarchies[hierarchy] || dimension.default_hierarchy;
        this.path = path;
        this.level_depth = level_depth;
        this.invert = !!invert;

        this.level = this.hierarchy.levels[level_depth - 1];
    }

    toString() {
        const path_str = paths.string_from_path(this.path);
        return (this.invert ? CUT_INVERSION_CHAR : '') +
            this.dimension.toString() +
            (this.hierarchy.toString() || '') +
            DIMENSION_STRING_SEPARATOR_CHAR +
            path_str;
    }

    toCellProps(): ICellProps {
        return {
            type: 'point',
            dimension: this.dimension.name,
            hierarchy: this.hierarchy.name,
            path: this.path,
            level_depth: this.level_depth,
            invert: this.invert
        };
    }
}

export class SetCut {
    type: string;
    dimension: Dimension;
    hierarchy: Hierarchy;
    level: Level;
    invert: boolean;
    paths: Path[];
    level_depth: number;

    constructor(dimension: Dimension, hierarchy: string, path_set: Array<Path>, invert: boolean, level_depth: number) {
        this.type = 'set';
        this.dimension = dimension;
        this.hierarchy = dimension.hierarchies[hierarchy] || dimension.default_hierarchy;
        this.paths = path_set;
        this.level_depth = level_depth;
        this.invert = !!invert;

        this.level = this.hierarchy.levels[level_depth - 1];
    }

    toString() {
        const path_str = this.paths.map(paths.string_from_path).join(SET_CUT_SEPARATOR_CHAR);
        return (this.invert ? CUT_INVERSION_CHAR : '') +
            this.dimension.toString() +
            (this.hierarchy.toString() || '') +
            DIMENSION_STRING_SEPARATOR_CHAR +
            path_str;
    }

    toCellProps(): ICellProps {
        return {
            type: 'point',
            dimension: this.dimension.name,
            hierarchy: this.hierarchy.name,
            paths: this.paths,
            level_depth: this.level_depth,
            invert: this.invert
        };
    }
}

export class RangeCut {
    type: string;
    dimension: Dimension;
    hierarchy: Hierarchy;
    invert: boolean;
    from_path: Path;
    to_path: Path;
    level_depth: number;

    constructor(dimension: Dimension, hierarchy: string, from_path: Path, to_path: Path, invert: boolean, level_depth: number) {
        this.type = 'range';
        this.dimension = dimension;
        this.hierarchy = dimension.hierarchies[hierarchy] || dimension.default_hierarchy;
        if (from_path === null && to_path === null) {
            throw 'Either from_path or to_path must be defined for RangeCut';
        }
        this.from_path = from_path;
        this.to_path = to_path;
        this.level_depth = level_depth;
        this.invert = !!invert;
    }

    toString() {
        const path_str = paths.string_from_path(this.from_path) +
            RANGE_CUT_SEPARATOR_CHAR +
            paths.string_from_path(this.to_path);

        return (this.invert ? CUT_INVERSION_CHAR : '') +
            this.dimension.toString() +
            (this.hierarchy.toString() || '') +
            DIMENSION_STRING_SEPARATOR_CHAR +
            path_str;
    }

    toCellProps(): ICellProps {
        return {
            type: 'point',
            dimension: this.dimension.name,
            hierarchy: this.hierarchy.name,
            from_path: this.from_path,
            to_path: this.to_path,
            level_depth: this.level_depth,
            invert: this.invert
        };
    }
}

export function cut_from_aggregate_result(cube: Cube, cut: ICellProps): Cut {
    const dim = cube.dimension(cut.dimension);

    switch (cut.type) {
        case 'point':
            return new PointCut(
                dim,
                cut.hierarchy,
                cut.path,
                cut.invert,
                cut.level_depth
            );
        case 'set':
            return new SetCut(
                dim,
                cut.hierarchy,
                cut.paths,
                cut.invert,
                cut.level_depth
            );
        case 'range':
            return new RangeCut(
                dim,
                cut.hierarchy,
                cut.from_path,
                cut.to_path,
                cut.invert,
                cut.level_depth
            );
        default:
            return undefined;
    }
}

export function cut_from_string(cube: Cube, cut_string: string): Cut {
    // parse out invert, dim_name, hierarchy, and path thingy
    const match = CUT_PARSE_REGEXP.exec(cut_string);
    if (!match) {
        return null;
    }
    const invert = !!(match[1]),
        dim_name = match[2],
        hierarchy = match[3] || null,
        path_thingy = match[4];

    const dimension = cube.dimension(dim_name);
    // if path thingy splits on set separator, make a SetCut.
    let splits = utils._split_with_negative_lookbehind(path_thingy, SET_CUT_SEPARATOR, '\\');
    if (splits.length > 1) {
        const _paths = splits.map(ss => paths.path_from_string(ss));
        return new SetCut(
            dimension,
            hierarchy,
            _paths,
            invert,
            _paths[0].length
        );
    }
    // else if path thingy splits into two on range separator, make a RangeCut.
    splits = utils._split_with_negative_lookbehind(path_thingy, RANGE_CUT_SEPARATOR, '\\');
    if (splits.length === 2) {
        const from_path = splits[0] ? paths.path_from_string(splits[0]) : null;
        const to_path = splits[1] ? paths.path_from_string(splits[1]) : null;
        return new RangeCut(
            dimension,
            hierarchy,
            from_path,
            to_path,
            invert,
            from_path.length
        );
    }
    // else it's a PointCut.

    const path = paths.path_from_string(path_thingy);
    return new PointCut(
        dimension,
        hierarchy,
        path,
        invert,
        path.length
    );
}

export function cuts_from_string(cube: Cube, cut_param_value: string): Cut[] {
    const cut_strings = utils._split_with_negative_lookbehind(cut_param_value, CUT_STRING_SEPARATOR, '\\');
    return (cut_strings || []).map(function (e) { return cut_from_string(cube, e); });
}

export function serializedCutToString(cube: Cube, e: SerializedCut): string {
    const invert = e.invert ? '!' : '';
    const dimParts = cube.dimensionParts(e.dimension);
    const cutDim = dimParts.dimension.name + (dimParts.hierarchy.name !== 'default' ? '@' + dimParts.hierarchy.name : '');

    return invert + cutDim + ':' + e.value;
}

export function cutFromSerializedCut(cube: Cube, serializedCut: SerializedCut): Cut {
    return cut_from_string(cube, serializedCutToString(cube, serializedCut));
}
