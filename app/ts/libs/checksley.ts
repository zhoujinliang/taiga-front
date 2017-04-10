// Checksley
// Based on Parsley.js of Guillaume Potier - @guillaumepotier
//
// Author: Jesús Espino / @jespinog
// Author: Andrey Antukh / @niwibe

declare var $:any;
import * as _ from "lodash"

let defaults = {
    inputs: 'input, textarea, select',
    excluded: 'input[type=hidden], input[type=file], :disabled',
    focus: 'first',

    validationMinlength: 3,
    validateIfUnchanged: false,
    interceptSubmit: true,

    messages: {},
    validators: {},

    showErrors: true,
    errorClass: "checksley-error",
    successClass: "checksley-ok",

    validatedClass: "checksley-validated",
    onlyOneErrorElement: false,

    containerClass: "checksley-error-list",
    containerGlobalSearch: false,
    containerPreferenceSelector: ".errors-box",
    containerErrorsSelector: "li",

    errors: {
        classHandler(element, isRadioOrCheckbox) {
            return element;
        },

        container(element, isRadioOrCheckbox) {
            return element.parent();
        },

        errorsWrapper: "<ul />",
        errorElem: "<li />"
    },

    // Default listeners
    listeners: {
        onFieldValidate(element, field) { return false; },
        onFormSubmit(ok, event, form) {  },
        onFieldError(element, constraints, field) {  },
        onFieldSuccess(element, constraints, field) {  }
    }
};


var validators = {
    notnull(val) {
        return val.length > 0;
    },

    notblank(val) {
        return _.isString(val) && ('' !== val.replace(/^\s+/g, '').replace(/\s+$/g, ''));
    },

    // Works on all inputs. val is object for checkboxes
    required(val) {
        // for checkboxes and select multiples. Check there is at least one required value
        if (_.isArray(val)) {
            for (let i of val) {
                if (validators.required(val[<string>i])) {
                    return true;
                }
            }
            return false;
        }

        return validators.notnull(val) && validators.notblank(val);
    },

    type(val, type) {
        let regExp = null;
        switch (type) {
            case 'number': regExp = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/; break;
            case 'digits': regExp = /^\d+$/; break;
            case 'alphanum': regExp = /^\w+$/; break;
            case 'email': regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i; break;
            case 'url':
                if (!/(https?|s?ftp|git)/i.test(val)) {
                    val = `http://${val}`;
                }

                regExp = /^(https?|s?ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
                break;
            case 'urlstrict': regExp = /^(https?|s?ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i; break;
            case 'dateIso': regExp = /^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])$/; break;
            case 'phone': regExp = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/; break;
        }

        if (regExp) {
            return regExp.test(val);
        }
        return false;
    },

    regexp(val, regExp, self) {
        return new RegExp( regExp, self.options.regexpFlag || '' ).test( val );
    },

    minlength(val, min) {
        return val.length >= min;
    },

    maxlength(val, max) {
        return val.length <= max;
    },

    rangelength(val, arrayRange) {
        return (val.length >= arrayRange[0]) && (val.length <= arrayRange[1]);
    },

    min(val, min) {
        return Number(val) >= min;
    },

    max(val, max) {
        return Number(val) <= max;
    },

    range(val, arrayRange) {
        return (val >= arrayRange[ 0 ]) && (val <= arrayRange[ 1 ]);
    },

    equalto( val, elem, self ) {
        self.options.validateIfUnchanged = true;

        return val === $( elem ).val();
    },

    mincheck(obj, val) {
        return validators.minlength( obj, val );
    },

    maxcheck(obj, val) {
        return validators.maxlength( obj, val);
    },

    rangecheck(obj, arrayRange) {
        return validators.rangelength(obj, arrayRange);
    }
};


let messages = {
    defaultMessage: "This value seems to be invalid.",
    type: {
        email:      "This value should be a valid email.",
        url:        "This value should be a valid url.",
        urlstrict:  "This value should be a valid url.",
        number:     "This value should be a valid number.",
        digits:     "This value should be digits.",
        dateIso:    "This value should be a valid date (YYYY-MM-DD).",
        alphanum:   "This value should be alphanumeric.",
        phone:      "This value should be a valid phone number."
    },
    notnull:        "This value should not be null.",
    notblank:       "This value should not be blank.",
    required:       "This value is required.",
    regexp:         "This value seems to be invalid.",
    min:            "This value should be greater than or equal to %s.",
    max:            "This value should be lower than or equal to %s.",
    range:          "This value should be between %s and %s.",
    minlength:      "This value is too short. It should have %s characters or more.",
    maxlength:      "This value is too long. It should have %s characters or less.",
    rangelength:    "This value length is invalid. It should be between %s and %s characters long.",
    mincheck:       "You must select at least %s choices.",
    maxcheck:       "You must select %s choices or less.",
    rangecheck:     "You must select between %s and %s choices.",
    equalto:        "This value should be the same."
};


let formatMessage = function(message, args) {
    if (!_.isArray(args)) {
        args = [args];
    }
    if (message.indexOf('%s') >= 0) {
        return message.replace(/%s/g, match => String(args.shift()));
    } else if (message.indexOf('%e') >= 0) {
        return message.replace(/%e/g, match => String($(args.shift()).val()));
    } else {
        return message;
    }
};


let toInt = num => parseInt(num, 10);


let _checksley = function(options) {
    let element = $(this);

    if (!element.is("form, input, select, textarea")) {
        throw "element is not a valid element for checksley";
    }

    let instance = element.data("checksley");
    if ((instance === undefined) || (instance === null)) {
        let _options = {};
        if (_.isPlainObject(options)) {
            _options = options;
        }

        if (element.is("input[type=radio], input[type=checkbox]")) {
            instance = new FieldMultiple(element, options);
        } else if (element.is("input, select, textarea")) {
            instance = new Field(element, options);
        } else {
            instance = new Form(element, options);
        }
    }

    // Parsley.js compatibility (incomplete)
    if (_.isString(options)) {
        switch (options) {
            case "validate": return instance.validate();
            case "destroy": return instance.destroy();
            case "reset": return instance.reset();
        }
    } else {
        return instance;
    }
};


class Checksley {
    messages: any
    lang: any

    constructor() {
        this.messages = {
            default: {
                defaultMessage: "Invalid"
            }
        };

        this.lang = this.detectLang();
    }

    updateDefaults(options) {
        return _.merge(defaults, options);
    }

    updateValidators(_validators) {
        return _.extend(validators, _validators);
    }

    updateMessages(lang, messages, overwrite=false) {
        if (this.messages[lang] === undefined) {
            this.messages[lang] = {};
        }

        if (overwrite) {
            return this.messages[lang] = messages;
        } else {
            return _.merge(this.messages[lang], messages);
        }
    }

    injectPlugin() {
        return $.fn.checksley = _checksley;
    }

    setLang(lang) {
        return this.lang = lang;
    }

    detectLang() {
        // Very simple lang detection
        // TODO: must be improved
        return $("html").attr("lang") || "default";
    }

    getMessage(key, lang=null) {
        if (lang === null) {
            lang = this.lang
        }

        let messages:any = this.messages[lang];
        if (messages === undefined) {
            messages = {};
        }

        let message = messages[key];
        if (message === undefined) {
            if (lang === "default") {
                return this.getMessage("defaultMessage", lang);
            } else {
                return this.getMessage(key, "default");
            }
        }

        return message;
    }
}


class Field {
    id: any
    fields: any
    element: any
    validatedOnce: boolean
    options: any
    validators: any
    isRadioOrCheckbox: boolean
    constraints: any
    valid: boolean
    required: boolean
    form:any

    constructor(elm, options) {
        if (options == null) { options = {}; }
        this.id = _.uniqueId("field-");
        this.element = $(elm);
        this.validatedOnce = false;
        this.options = _.merge({}, defaults, options);
        this.isRadioOrCheckbox = false;

        // Clone messages and validators
        this.validators = validators;

        this.resetConstraints();
        this.bindEvents();
        this.bindData();
    }

    bindData() {
        return this.element.data("checksley-field", this);
    }

    unbindData() {
        return this.element.data("checksley-field", null);
    }

    focus() {
        return this.element.focus();
    }

    eventValidate(event) {
        let trigger = this.element.data("trigger");
        let value = this.getValue();

        if ((event.type === "keyup") && !/keyup/i.test(trigger) && !this.validatedOnce) {
            return true;
        }

        if ((event.type === "change") && !/change/i.test(trigger) && !this.validatedOnce) {
            return true;
        }

        if ((value.length < this.options.validationMinlength) && !this.validatedOnce) {
            return true;
        }

        return this.validate();
    }

    unbindEvents() {
        return this.element.off(`.${this.id}`);
    }

    bindEvents() {
        this.unbindEvents();
        let trigger = this.element.data("trigger");

        if (_.isString(trigger)) {
            this.element.on(`${trigger}.${this.id}`, _.bind(this.eventValidate, this));
        }

        if (this.element.is("select") && (trigger !== "change")) {
            this.element.on(`change.${this.id}`, _.bind(this.eventValidate, this));
        }

        if (trigger !== "keyup") {
            return this.element.on(`keyup.${this.id}`, _.bind(this.eventValidate, this));
        }
    }

    // TODO: Review the need of this method, and the behavior
    errorClassTarget() {
        return this.element;
    }

    resetHtml5Constraints() {
        // Html5 validators compatibility
        if (this.element.prop("required")) {
            this.required = true;
        }

        let typeRx = new RegExp(this.element.attr('type'), "i");
        if (typeRx.test("email url number range")) {
            let type = this.element.attr('type');
            switch (type) {
                case "range":
                    let min = this.element.attr('min');
                    let max = this.element.attr('max');

                    if (min && max) {
                        return this.constraints[type] = {
                            valid: true,
                            params: [toInt(min), toInt(max)],
                            fn: this.validators[type]
                        };
                    }
                    break;
            }
        }
    }

    resetConstraints() {
        this.constraints = {};
        this.valid = true;
        this.required = false;

        this.resetHtml5Constraints();
        this.element.addClass('checksley-validated');

        return (() => {
            let result = [];
            for (let constraint in this.validators) {
                let fn = this.validators[constraint];
                let item;
                if (this.element.data(constraint) === undefined) {
                    continue;
                }

                this.constraints[constraint] = {
                    valid: true,
                    params: this.element.data(constraint),
                    fn
                };

                if (constraint === "required") {
                    item = this.required = true;
                }
                result.push(item);
            }
            return result;
        })();
    }

    hasConstraints() {
        return !_.isEmpty(this.constraints);
    }

    validate(showErrors=false) {
        this.validatedOnce = true;

        if (!this.hasConstraints()) {
            return null;
        }

        if (this.options.listeners.onFieldValidate(this.element, this)) {
            this.reset();
            return null;
        }

        if (!this.required && (this.getValue() === "")) {
            this.reset();
            return null;
        }

        return this.applyValidators(showErrors);
    }

    applyValidators(showErrors) {
        if ((showErrors === undefined) || (showErrors === null)) {
            ({ showErrors } = this.options);
        }

        let val = this.getValue();
        let valid = true;

        let { listeners } = this.options;

        // If showErrors is true, remove previous errors
        // before put new errors.
        if (showErrors) {
            this.removeErrors();
        }

        // Apply all declared validators
        for (let name in this.constraints) {
            let data = this.constraints[name];
            data.valid = data.fn(this.getValue(), data.params, this);

            if (data.valid === false) {
                valid = false;
                if (showErrors) { this.manageError(name, data); }
                listeners.onFieldError(this.element, data, this);
            } else {
                listeners.onFieldSuccess(this.element, data, this);
            }
        }

        this.handleClasses(valid);
        return valid;
    }

    handleClasses(valid) {
        let classHandlerElement = this.options.errors.classHandler(this.element, false);

        let { errorClass } = this.options;
        let { successClass } = this.options;

        switch (valid) {
            case null:
                classHandlerElement.removeClass(errorClass);
                return classHandlerElement.removeClass(successClass);
            case false:
                classHandlerElement.removeClass(successClass);
                return classHandlerElement.addClass(errorClass);
            case true:
                classHandlerElement.removeClass(errorClass);
                return classHandlerElement.addClass(successClass);
        }
    }

    manageError(name, constraint) {
        let message;
        let data = this.element.data();

        if (data["errorMessage"] !== undefined) {
            message = data["errorMessage"];
        } else if (name === "type") {
            message = checksley.getMessage("type")[constraint.params];
        } else {
            message = checksley.getMessage(name);
        }

        if (message === undefined) {
            message = checksley.getMessage("default");
        }

        if (constraint.params) {
            message = formatMessage(message, _.cloneDeep(constraint.params));
        }

        return this.addError(this.makeErrorElement(name, message));
    }

    setErrors(messages) {
        this.removeErrors();
        if (!_.isArray(messages)) {
            messages = [messages];
        }

        return messages.map((message) =>
            this.addError(this.makeErrorElement("custom", message)));
    }

    makeErrorElement(constraintName, message) {
        let element = $("<li />", {"class": `checksley-${constraintName}`});
        element.html(message);
        element.addClass(constraintName);
        return element;
    }

    addError(errorElement) {
        let container = this.getErrorContainer();
        let selector = this.options.containerErrorsSelector;

        if (!this.options.onlyOneErrorElement || !container.find(selector).length) {
            return container.append(errorElement);
        }
    }

    reset() {
        this.handleClasses(null);
        this.resetConstraints();
        return this.removeErrors();
    }

    removeErrors() {
        // Remove errors container
        return $(`#${this.errorContainerId()}`).remove();
    }

    getValue() {
        return this.element.val();
    }

    errorContainerId() {
        return `checksley-error-${this.id}`;
    }

    errorContainerClass() {
        return "checksley-error-list";
    }

    getErrorContainer() {
        let container;
        let errorContainerEl = $(`#${this.errorContainerId()}`);
        if (errorContainerEl.length === 1) {
            return errorContainerEl;
        }

        let params = {
            "class": this.errorContainerClass(),
            "id": this.errorContainerId()
        };

        errorContainerEl = $("<ul />", params);

        let definedContainer = this.element.data('error-container');
        if (definedContainer === undefined) {
            if (this.isRadioOrCheckbox) {
                errorContainerEl.insertAfter(this.element.parent());
            } else {
                errorContainerEl.insertAfter(this.element);
            }
            return errorContainerEl;
        }

        if (this.options.errors.containerGlobalSearch) {
            container = $(definedContainer);
        } else {
            container = this.element.closest(definedContainer);
        }

        let preferenceSelector = this.options.errors.containerPreferenceSelector;
        if (container.find(preferenceSelector).length === 1) {
            container = container.find(preferenceSelector);
        }

        container.append(errorContainerEl);
        return errorContainerEl;
    }

    destroy() {
        this.unbindEvents();
        this.removeErrors();
        return this.unbindData();
    }

    setForm(form) {
        return this.form = form;
    }
}


class FieldMultiple extends Field {
    isRadioOrCheckbox: boolean
    isRadio: boolean
    isCheckbox: boolean

    constructor(elm, options) {
        super(elm, options);

        this.isRadioOrCheckbox = true;
        this.isRadio = this.element.is("input[type=radio]");
        this.isCheckbox = this.element.is("input[type=checkbox]");
    }

    getSiblings() {
        let group = this.element.data("group");
        if (group === undefined) {
            return `input[name=${this.element.attr('name')}]`;
        } else {
            return `[data-group=\"${group}\"]`;
        }
    }

    getValue() {
        if (this.isRadio) {
            return $(`${this.getSiblings()}:checked`).val() || '';
        }

        if (this.isCheckbox) {
            let values = [];

            for (let element of $(`${this.getSiblings()}:checked`)) {
                values.push($(element).val());
            }

            return values;
        }
    }

    unbindEvents() {
        return $(this.getSiblings()).map((element) =>
            $(element).off(`.${this.id}`));
    }

    bindEvents() {
        this.unbindEvents();
        let trigger = this.element.data("trigger");

        return (() => {
            let result = [];
            for (let element of $(this.getSiblings())) {
                let item;
                element = $(element);

                if (_.isString(trigger)) {
                    element.on(`${trigger}.${this.id}`, _.bind(this.eventValidate, this));
                }

                if (trigger !== "change") {
                    item = element.on(`change.${this.id}`, _.bind(this.eventValidate, this));
                }
                result.push(item);
            }
            return result;
        })();
    }
}

class ComposedField extends Field {
    constructor(elm, options) {
        super(elm, options);
    }

    getComponents() {
        let components = [];
        let fields = this.element.data("composed").split(',');
        for (let field of fields) {
            components.push(this.element.find(`[name=${field}]`));
        }
        return components;
    }

    getValue() {
        let value = _.map(this.getComponents(), x => x.val()).join(this.element.data("composed-joiner"));
        this.element.val(value);
        return value;
    }

    unbindEvents() {
        return $(this.getComponents()).map((component) =>
            component.off(`.${this.id}`));
    }

    bindEvents() {
        this.unbindEvents();
        let trigger = this.element.data("trigger");

        return (() => {
            let result = [];
            for (let component of $(this.getComponents())) {
                let item;
                if (_.isString(trigger)) {
                    component.on(`${trigger}.${this.id}`, _.bind(this.eventValidate, this));
                }

                if (trigger !== "change") {
                    item = component.on(`change.${this.id}`, _.bind(this.eventValidate, this));
                }
                result.push(item);
            }
            return result;
        })();
    }
}

class Form {
    fields: any
    id: any
    element: any
    options: any
    fieldsByName: any
    field: any

    constructor(elm, options) {
        if (options == null) { options = {}; }
        this.id = _.uniqueId("checksleyform-");
        this.element = $(elm);
        this.options = _.extend({}, defaults, options);
        this.initialize();
    }

    initialize() {
        // Initialize fields
        this.initializeFields();
        this.bindEvents();
        return this.bindData();
    }

    bindData() {
        return this.element.data("checksley", this);
    }

    unbindData() {
        return this.element.data("checksley", null);
    }

    initializeFields() {
        let element, field;
        this.fields = [];
        this.fieldsByName = {};

        for (let fieldElm of this.element.find(this.options.inputs)) {
            element = $(fieldElm);
            if (element.is(this.options.excluded)) {
                continue;
            }

            if (element.is("input[type=radio], input[type=checkbox]")) {
                field = new (<any>checksley).FieldMultiple(fieldElm, this.options);
            } else {
                field = new (<any>checksley).Field(fieldElm, this.options);
            }


            field.setForm(this);
            this.fields.push(field);
            this.fieldsByName[element.attr("name")] = field;
        }

        return this.element.find('[data-composed]').map((composedField) =>
            ((field = new (<any>checksley).ComposedField(composedField, this.options)),

            field.setForm(this),
            this.fields.push(field)));
    }

    setErrors(errors) {
        return (() => {
            let result = [];
            for (let name in errors) {
                let error = errors[name];
                let item;
                let field = this.fieldsByName[name];
                if (field) {
                    item = field.setErrors(error);
                }
                result.push(item);
            }
            return result;
        })();
    }

    validate() {
        let valid = true;
        let invalidFields = [];

        for (let field of this.fields) {
            if (field.validate() === false) {
                valid = false;
                invalidFields.push(field);
            }
        }

        if (!valid) {
            switch (this.options.focus) {
                case "first": invalidFields[0].focus(); break;
                case "last": invalidFields[invalidFields.length].focus(); break;
            }
        }

        return valid;
    }

    bindEvents() {
        let self = this;
        this.unbindEvents();
        return this.element.on(`submit.${this.id}`, function(event) {
            let ok = self.validate();
            self.options.listeners.onFormSubmit(ok, event, self);

            if (self.options.interceptSubmit && !ok) {
                return event.preventDefault();
            }
        });
    }

    unbindEvents() {
        return this.element.off(`.${this.id}`);
    }

    removeErrors() {
        return this.fields.map((field) =>
            field.reset());
    }

    destroy() {
        this.unbindEvents();
        this.unbindData();

        for (let field of this.fields) {
            field.destroy();
        }

        return this.field = [];
    }


    reset() {
        return this.fields.map((field) =>
            field.reset());
    }
}


// Main checksley global instance
var checksley = new Checksley();
checksley.updateMessages("default", messages);
checksley.injectPlugin();

// Expose internal clases
(<any>checksley).Checksley = Checksley;
(<any>checksley).Form = Form;
(<any>checksley).Field = Field;
(<any>checksley).FieldMultiple = FieldMultiple;
(<any>checksley).ComposedField = ComposedField;

// Expose global instance to the world
export { checksley };
