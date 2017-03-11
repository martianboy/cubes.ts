function encodeUriQuery(val: string, pctEncodeSpaces: boolean = false): string {
    return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}

function forEachSorted(obj: Object, iterator, context: any = undefined): string[] {
    const keys = Object.keys(obj).sort();
    for (let i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i]);
    }
    return keys;
}

function serializeValue(v): string {
    if (typeof v === 'object')
        return JSON.stringify(v);

    return v.toString();
}

function encodeKeyValue(key, value) {
    return encodeUriQuery(key) + '=' + encodeUriQuery(serializeValue(value));
}

export default function aggregateHttpSerializer(params) {
    if (!params) return '';
    const parts = [];
    forEachSorted(params, function (value, key) {
        if (value === null || typeof value === 'undefined') return;
        if (Array.isArray(value)) {
            for (const v of value) {
                parts.push(encodeKeyValue(key, v));
            }
        } else {
            parts.push(encodeKeyValue(key, value));
        }
    });

    return parts.join('&');
}
