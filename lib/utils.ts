export function _split_with_negative_lookbehind(str: string, regex: RegExp, lb: string): string[] {
    const splits = [];

    for (let match = regex.exec(str); match != null; match = regex.exec(str)) {
        if (str.substr(match.index - lb.length, lb.length) !== lb) {
            splits.push(str.substring(0, match.index));
            str = str.substring(Math.min(match.index + match[0].length, str.length));
            regex.lastIndex = 0;
        }
        else {
            // match has the lookbehind, must exclude
        }
    }

    splits.push(str);
    return splits;
}

type findFn = (el: any) => boolean;
export function find(arr: any[], fn: findFn) {
    const result = arr.filter(fn);
    if (result.length > 0)
        return result[0];

    return undefined;
}

export function pick(obj: Object, keys: string[]): Object {
    const result = {};

    for (const k in obj) {
        result[k] = obj[k];
    }

    return result;
}