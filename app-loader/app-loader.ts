//declare var $: any;
declare var ljs: any;
declare var _: any;
declare var angular: any;
declare var Promise: any;

(<any>window)._version = "___VERSION___";

(<any>window).taigaConfig = {
    "api": "http://localhost:8000/api/v1/",
    "eventsUrl": null,
    "tribeHost": null,
    "eventsMaxMissedHeartbeats": 5,
    "eventsHeartbeatIntervalTime": 60000,
    "debug": true,
    "defaultLanguage": "en",
    "themes": ["taiga", "material-design", "high-contrast"],
    "defaultTheme": "taiga",
    "publicRegisterEnabled": true,
    "feedbackEnabled": true,
    "privacyPolicyUrl": null,
    "termsOfServiceUrl": null,
    "maxUploadFileSize": null,
    "importers": [],
    "contribPlugins": []
};

(<any>window).taigaContribPlugins = [];

(<any>window)._decorators = [];

(<any>window).addDecorator = (provider, decorator) => (<any>window)._decorators.push({provider, decorator});

(<any>window).getDecorators = () => (<any>window)._decorators;

let loadStylesheet = path => $('head').append(`<link rel="stylesheet" href="${path}" type="text/css" />`);

let loadPlugin = pluginPath =>
    new Promise(function(resolve, reject) {
        let success = function(plugin) {
            (<any>window).taigaContribPlugins.push(plugin);

            if (plugin.css) {
                loadStylesheet(plugin.css);
            }

            //dont' wait for css
            if (plugin.js) {
                return ljs.load(plugin.js, resolve);
            } else {
                return resolve();
            }
        };

        let fail = () => console.error("error loading", pluginPath);

        return $.getJSON(pluginPath).then(success, fail);
    })
;

let loadPlugins = function(plugins) {
    let promises = [];
    _.map(plugins, pluginPath => promises.push(loadPlugin(pluginPath)));

    return Promise.all(promises);
};

let promise = $.getJSON("/conf.json");
promise.done(data => (<any>window).taigaConfig = _.assign({}, (<any>window).taigaConfig, data));

promise.fail(() => console.error("Your conf.json file is not a valid json file, please review it."));

promise.always(function() {
    if ((<any>window).taigaConfig.contribPlugins.length > 0) {
        return loadPlugins((<any>window).taigaConfig.contribPlugins).then(() =>
            ljs.load(`/${(<any>window)._version}/js/app.js`, () => angular.bootstrap(document, ['taiga']))
        );
    } else {
        return ljs.load(`/${(<any>window)._version}/js/app.js`, () => angular.bootstrap(document, ['taiga']));
    }
});
