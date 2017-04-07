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

let addClass = function(el, className) {
    if (el.classList) {
        return el.classList.add(className);
    } else {
        return el.className += ` ${className}`;
    }
};


let nl2br = str => {
    let breakTag = '<br />';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, `$1${breakTag}$2`);
};


let bindMethods = object => {
    let dependencies = _.keys(object);

    let methods = [];

    _.forIn(object, (value, key) => {
        if (!Array.from(dependencies).includes(key) && _.isFunction(value)) {
            return methods.push(key);
        }
    });

    return _.bindAll(object, methods);
};


let bindOnce = (scope, attr, continuation) => {
    let val = scope.$eval(attr);
    if (val !== undefined) {
        return continuation(val);
    }

    let delBind = null;
    return delBind = scope.$watch(attr, function(val) {
        if (val === undefined) { return; }
        continuation(val);
        if (delBind) { return delBind(); }
    });
};


let mixOf = function(base, ...mixins) {
    class Mixed extends base {}

    for (let i = mixins.length - 1; i >= 0; i--) { //earlier mixins override later ones
        let mixin = mixins[i];
        for (let name in mixin.prototype) {
            let method = mixin.prototype[name];
            Mixed.prototype[name] = method;
        }
    }
    return Mixed;
};


let trim = (data, char) => _.trim(data, char);


let slugify = data =>
    data.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/&/g, '-and-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
;


let unslugify = function(data) {
    if (data) {
        return _.capitalize(data.replace(/-/g, ' '));
    }
    return data;
};


let toggleText = function(element, texts) {
    let nextTextPosition = element.data('nextTextPosition');
    if ((nextTextPosition == null) || (nextTextPosition >= texts.length)) { nextTextPosition = 0; }
    let text = texts[nextTextPosition];
    element.data('nextTextPosition', nextTextPosition + 1);
    return element.text(text);
};


let groupBy = function(coll, pred) {
    let result = {};
    for (let item of Array.from(coll)) {
        result[pred(item)] = item;
    }

    return result;
};


let timeout = (wait, continuation) => window.setTimeout(continuation, wait);


let cancelTimeout = timeoutVar => window.clearTimeout(timeoutVar);


let scopeDefer = (scope, func) =>
    _.defer(() => {
        return scope.$apply(func);
    })
;


let toString = function(value) {
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
};


let joinStr = (str, coll) => coll.join(str);


let debounce = (wait, func) => _.debounce(func, wait, {leading: true, trailing: false});


let debounceLeading = (wait, func) => _.debounce(func, wait, {leading: false, trailing: true});


let startswith = (str1, str2) => _.startsWith(str1, str2);


let truncate = function(str, maxLength, suffix) {
    if (suffix == null) { suffix = "..."; }
    if ((typeof str !== "string") && !(str instanceof String)) { return str; }

    let out = str.slice(0);

    if (out.length > maxLength) {
        out = out.substring(0, maxLength + 1);
        out = out.substring(0, Math.min(out.length, out.lastIndexOf(" ")));
        out = out + suffix;
    }

    return out;
};


let sizeFormat = function(input, precision) {
    if (precision == null) { precision = 1; }
    if (isNaN(parseFloat(input)) || !isFinite(input)) {
        return "-";
    }

    if (input === 0) {
        return "0 bytes";
    }

    let units = ["bytes", "KB", "MB", "GB", "TB", "PB"];
    let number = Math.floor(Math.log(input) / Math.log(1024));
    if (number > 5) {
        number = 5;
    }
    let size = (input / Math.pow(1024, number)).toFixed(precision);
    return  `${size} ${units[number]}`;
};


let stripTags = function(str, exception) {
    if (exception) {
        let pattern = new RegExp(`<(?!${exception}\s*\/?)[^>]+>`, 'gi');
        return String(str).replace(pattern, '');
    } else {
        return String(str).replace(/<\/?[^>]+>/g, '');
    }
};


let replaceTags = function(str, tags, replace) {
    // open tag
    let pattern = new RegExp(`<(${tags})>`, 'gi');
    str = str.replace(pattern, `<${replace}>`);

    // close tag
    pattern = new RegExp(`<\/(${tags})>`, 'gi');
    str = str.replace(pattern, `</${replace}>`);

    return str;
};


let defineImmutableProperty = (obj, name, fn) => {
    return Object.defineProperty(obj, name, {
        get: () => {
            if (!_.isFunction(fn)) {
                throw "defineImmutableProperty third param must be a function";
            }

            let fn_result = fn();
            if (fn_result && _.isObject(fn_result)) {
                if (fn_result.size === undefined) {
                    throw "defineImmutableProperty must return immutable data";
                }
            }

            return fn_result;
        }
    });
};


_.mixin({
    removeKeys(obj, keys) {
        return _.chain([keys]).flatten().reduce(
            function(obj, key) {
                delete obj[key]; return obj;
            }
            , obj).value();
    },

    cartesianProduct() {
        return _.reduceRight(
            arguments, (a,b) => _.flatten(_.map(a, x => _.map(b, y => [y].concat(x))), true)
            , [ [] ]);
    }
});


let isImage = name => name.match(/\.(jpe?g|png|gif|gifv|webm|svg|psd)/i) !== null;

let isEmail = name => (name != null) && (name.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null);

let isPdf = name => name.match(/\.(pdf)/i) !== null;


let patch = function(oldImmutable, newImmutable) {
    let pathObj = {};

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
};

let DEFAULT_COLOR_LIST = [
    '#fce94f', '#edd400', '#c4a000', '#8ae234', '#73d216', '#4e9a06', '#d3d7cf',
    '#fcaf3e', '#f57900', '#ce5c00', '#729fcf', '#3465a4', '#204a87', '#888a85',
    '#ad7fa8', '#75507b', '#5c3566', '#ef2929', '#cc0000', '#a40000', '#222222'
];

let getRandomDefaultColor = () => _.sample(DEFAULT_COLOR_LIST);

let getDefaulColorList = () => _.clone(DEFAULT_COLOR_LIST);

let getMatches = function(string, regex, index) {
    index || (index = 1);
    let matches = [];
    let match = null;

    while ((match = regex.exec(string))) {
        if (index === -1) {
            matches.push(match);
        } else {
            matches.push(match[index]);
        }
    }

    return matches;
};

let { taiga } = this;
taiga.addClass = addClass;
taiga.nl2br = nl2br;
taiga.bindMethods = bindMethods;
taiga.bindOnce = bindOnce;
taiga.mixOf = mixOf;
taiga.trim = trim;
taiga.slugify = slugify;
taiga.unslugify = unslugify;
taiga.toggleText = toggleText;
taiga.groupBy = groupBy;
taiga.timeout = timeout;
taiga.cancelTimeout = cancelTimeout;
taiga.scopeDefer = scopeDefer;
taiga.toString = toString;
taiga.joinStr = joinStr;
taiga.truncate = truncate;
taiga.debounce = debounce;
taiga.debounceLeading = debounceLeading;
taiga.startswith = startswith;
taiga.sizeFormat = sizeFormat;
taiga.stripTags = stripTags;
taiga.replaceTags = replaceTags;
taiga.defineImmutableProperty = defineImmutableProperty;
taiga.isImage = isImage;
taiga.isEmail = isEmail;
taiga.isPdf = isPdf;
taiga.patch = patch;
taiga.getRandomDefaultColor = getRandomDefaultColor;
taiga.getDefaulColorList = getDefaulColorList;
taiga.getMatches = getMatches;
