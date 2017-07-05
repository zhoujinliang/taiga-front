/*
 * Copyright (C) 2014-2017 Andrey Antukh <niwi@niwi.nz>
 * Copyright (C) 2014-2017 Jesús Espino Garcia <jespinog@gmail.com>
 * Copyright (C) 2014-2017 David Barragán Merino <bameda@dbarragan.com>
 * Copyright (C) 2014-2017 Alejandro Alonso <alejandro.alonso@kaleidos.net>
 * Copyright (C) 2014-2017 Juan Francisco Alcántara <juanfran.alcantara@kaleidos.net>
 * Copyright (C) 2014-2017 Xavi Julian <xavier.julian@kaleidos.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * File: utils.coffee
 */

import * as _ from "lodash";
import {hex_sha1} from "./sha1-custom";

export function addClass(el, className) {
    if (el.classList) {
        return el.classList.add(className);
    } else {
        return el.className += ` ${className}`;
    }
}

export function nl2br(str) {
    const breakTag = "<br />";
    return (str + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, `$1${breakTag}$2`);
}

export function bindMethods(object) {
    const dependencies = _.keys(object);

    const methods = [];

    _.forIn(object, (value, key) => {
        if (!_.includes(dependencies, key) && _.isFunction(value)) {
            return methods.push(key);
        }
    });

    return _.bindAll(object, methods);
}

export function bindOnce(scope, attr, continuation) {
    const val = scope.$eval(attr);
    if (val !== undefined) {
        return continuation(val);
    }

    let delBind = null;
    return delBind = scope.$watch(attr, function(val) {
        if (val === undefined) { return; }
        continuation(val);
        if (delBind) { return delBind(); }
    });
}

export function trim(data, char= undefined) {
   return _.trim(data, char);
}

export function slugify(data) {
    return data.toString().toLowerCase().trim()
               .replace(/\s+/g, "-")
               .replace(/&/g, "-and-")
               .replace(/[^\w\-]+/g, "")
               .replace(/\-\-+/g, "-");
}

export function unslugify(data) {
    if (data) {
        return _.capitalize(data.replace(/-/g, " "));
    }
    return data;
}

export function toggleText(element, texts) {
    let nextTextPosition = element.data("nextTextPosition");
    if ((nextTextPosition == null) || (nextTextPosition >= texts.length)) { nextTextPosition = 0; }
    const text = texts[nextTextPosition];
    element.data("nextTextPosition", nextTextPosition + 1);
    return element.text(text);
}

export function groupBy(coll, pred) {
    const result = {};
    for (const item of coll) {
        result[pred(item)] = item;
    }

    return result;
}

export function timeout(wait, continuation) {
    return window.setTimeout(continuation, wait);
}

export function cancelTimeout(timeoutVar) {
    window.clearTimeout(timeoutVar);
}

export function scopeDefer(scope, func) {
    return _.defer(() => {
        return scope.$apply(func);
    });
}

export function toString(value) {
    if (_.isNumber(value)) {
        return value + "";
    } else if (_.isString(value)) {
        return value;
    } else if (_.isPlainObject(value)) {
        return JSON.stringify(value);
    } else if (_.isUndefined(value)) {
        return "";
    }
    return value.toString();
}

export function joinStr(str, coll) {
   return coll.join(str);
}

export function debounce(wait, func) {
   return _.debounce(func, wait, {leading: true, trailing: false});
}

export function debounceLeading(wait, func) {
   return _.debounce(func, wait, {leading: false, trailing: true});
}

export function startswith(str1, str2) {
   return _.startsWith(str1, str2);
}

export function truncate(str, maxLength, suffix= "...") {
    if ((typeof str !== "string") && !(str instanceof String)) { return str; }

    let out = str.slice(0);

    if (out.length > maxLength) {
        out = out.substring(0, maxLength + 1);
        out = out.substring(0, Math.min(out.length, out.lastIndexOf(" ")));
        out = out + suffix;
    }

    return out;
}

export function sizeFormat(input, precision= 1) {
    if (isNaN(parseFloat(input)) || !isFinite(input)) {
        return "-";
    }

    if (input === 0) {
        return "0 bytes";
    }

    const units = ["bytes", "KB", "MB", "GB", "TB", "PB"];
    let number = Math.floor(Math.log(input) / Math.log(1024));
    if (number > 5) {
        number = 5;
    }
    const size = (input / Math.pow(1024, number)).toFixed(precision);
    return  `${size} ${units[number]}`;
}

export function stripTags(str, exception) {
    if (exception) {
        const pattern = new RegExp(`<(?!${exception}\s*\/?)[^>]+>`, "gi");
        return String(str).replace(pattern, "");
    } else {
        return String(str).replace(/<\/?[^>]+>/g, "");
    }
}

export function replaceTags(str, tags, replace) {
    // open tag
    let pattern = new RegExp(`<(${tags})>`, "gi");
    str = str.replace(pattern, `<${replace}>`);

    // close tag
    pattern = new RegExp(`<\/(${tags})>`, "gi");
    str = str.replace(pattern, `</${replace}>`);

    return str;
}

export function defineImmutableProperty(obj, name, fn) {
    return Object.defineProperty(obj, name, {
        get: () => {
            if (!_.isFunction(fn)) {
                throw new Error("defineImmutableProperty third param must be a function");
            }

            const fn_result = fn();
            if (fn_result && _.isObject(fn_result)) {
                if (fn_result.size === undefined) {
                    throw new Error("defineImmutableProperty must return immutable data");
                }
            }

            return fn_result;
        },
    });
}

_.mixin({
    removeKeys(obj, keys) {
        return _.chain([keys]).flatten().reduce(
            function(obj: any, key: any) {
                delete obj[key]; return obj;
            }
            , obj).value();
    },
});

export function isImage(name) {
   return name.match(/\.(jpe?g|png|gif|gifv|webm|svg|psd)/i) !== null;
}

export function isEmail(name) {
   return (name != null) && (name.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null);
}

export function isPdf(name) {
    return name.match(/\.(pdf)/i) !== null;
}

export function patch(oldImmutable, newImmutable) {
    const pathObj = {};

    newImmutable.forEach(function(newValue, key) {
        if (newValue !== oldImmutable.get(key)) {
            if (newValue.toJS) {
                return pathObj[key] = newValue.toJS();
            } else {
                return pathObj[key] = newValue;
            }
        }
    });

    return pathObj;
}

export function getMatches(string, regex, index= 1) {
    const matches = [];
    let match = null;

    while ((match = regex.exec(string))) {
        if (index === -1) {
            matches.push(match);
        } else {
            matches.push(match[index]);
        }
    }

    return matches;
}

export function cartesianProduct(...args) {
    return _.reduceRight(
        args, (a: any, b: any) => _.flatten(_.map(a, (x) => _.map(b, (y) => [y].concat(x))), true)
        , [ [] ]);
}

export function generateHash(components) {
    if (components == null) { components = []; }
    components = _.map(components, (x) => JSON.stringify(x));
    return hex_sha1(components.join(":"));
}

export function generateUniqueSessionIdentifier() {
    const date = (new Date()).getTime();
    const randomNumber = Math.floor(Math.random() * 0x9000000);
    return generateHash([date, randomNumber]);
}
