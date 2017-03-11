import * as utils from './utils';

export type Path = string[];

export const PATH_PART_ESCAPE_PATTERN = /([\\!|:;,-])/g;
export const PATH_PART_UNESCAPE_PATTERN = /\\([\\!|:;,-])/g;
export const NULL_PART_STRING = '__null__';

export const PATH_STRING_SEPARATOR_CHAR = ',';
export const PATH_STRING_SEPARATOR = /,/g;

function _escape_path_part(part: any): string {
    if (part == null) {
        return NULL_PART_STRING;
    }
    return part.toString().replace(PATH_PART_ESCAPE_PATTERN, (match, b1) => '\\' + b1);
}

function _unescape_path_part(part: string): string {
    if (part === NULL_PART_STRING) {
        return null;
    }
    return part.replace(PATH_PART_UNESCAPE_PATTERN, (match, b1) => b1);
}

export function string_from_path(path: Path): string {
    return (path || []).map(element => _escape_path_part(element)).join(PATH_STRING_SEPARATOR_CHAR);
}

export function path_from_string(path_string: string): Path {
    const paths = utils._split_with_negative_lookbehind(path_string, PATH_STRING_SEPARATOR, '\\');
    const parsed = (paths || []).map(function (e) { return _unescape_path_part(e); });
    return parsed;
}
