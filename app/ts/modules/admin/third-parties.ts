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
 * File: modules/admin/third-parties.coffee
 */

import {bindMethods, debounce, timeout} from "../../utils"
import {FiltersMixin} from "../controllerMixins"
import * as angular from "angular"
import * as moment from "moment"
import * as _ from "lodash"

let module = angular.module("taigaAdmin");


//############################################################################
//# Webhooks
//############################################################################

class WebhooksController extends FiltersMixin {
    scope: angular.IScope
    repo:any
    rs:any
    params:any
    location:any
    navUrls:any
    appMetaService:any
    translate:any
    errorHandlingService:any
    projectService:any

    static initClass() {
        this.$inject = [
            "$scope",
            "$tgRepo",
            "$tgResources",
            "$routeParams",
            "$tgLocation",
            "$tgNavUrls",
            "tgAppMetaService",
            "$translate",
            "tgErrorHandlingService",
            "tgProjectService"
        ];
    }

    constructor(scope, repo, rs, params, location, navUrls, appMetaService, translate, errorHandlingService, projectService) {
        super()
        this.scope = scope;
        this.repo = repo;
        this.rs = rs;
        this.params = params;
        this.location = location;
        this.navUrls = navUrls;
        this.appMetaService = appMetaService;
        this.translate = translate;
        this.errorHandlingService = errorHandlingService;
        this.projectService = projectService;
        bindMethods(this);

        this.scope.sectionName = "ADMIN.WEBHOOKS.SECTION_NAME";
        this.scope.project = {};

        let promise = this.loadInitialData();

        promise.then(() => {
            let title = this.translate.instant("ADMIN.WEBHOOKS.PAGE_TITLE", {projectName: this.scope.project.name});
            let { description } = this.scope.project;
            return this.appMetaService.setAll(title, description);
        });

        promise.then(null, this.onInitialDataError.bind(this));

        this.scope.$on("webhooks:reload", this.loadWebhooks);
    }

    loadWebhooks() {
        return this.rs.webhooks.list(this.scope.projectId).then(webhooks => {
            return this.scope.webhooks = webhooks;
        });
    }

    loadProject() {
        let project = this.projectService.project.toJS();

        if (!project.i_am_admin) {
            this.errorHandlingService.permissionDenied();
        }

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.$emit('project:loaded', project);
        return project;
    }

    loadInitialData() {
        this.loadProject();

        return this.loadWebhooks();
    }
}
WebhooksController.initClass();

module.controller("WebhooksController", WebhooksController);


//############################################################################
//# Webhook Directive
//############################################################################

let WebhookDirective = function($rs, $repo, $confirm, $loading, $translate) {
    let link = function($scope, $el, $attrs) {
        let webhook = $scope.$eval($attrs.tgWebhook);

        let updateLogs = function() {
            let prettyDate = $translate.instant("ADMIN.WEBHOOKS.DATE");

            return $rs.webhooklogs.list(webhook.id).then(webhooklogs => {
                for (let log of Array.from(webhooklogs)) {
                    log.validStatus = 200 <= log.status && log.status < 300;
                    log.prettySentHeaders = _.map(_.toPairs(log.request_headers), function(...args) { let [header, value] = Array.from(args[0]); return `${header}: ${value}`; }).join("\n");
                    log.prettySentData = JSON.stringify(log.request_data);
                    log.prettyDate = moment(log.created).format(prettyDate);
                }

                webhook.logs_counter = webhooklogs.length;
                webhook.logs = webhooklogs;
                return updateShowHideHistoryText();
            });
        };

        var updateShowHideHistoryText = function() {
            let text, title;
            let textElement = $el.find(".toggle-history");
            let historyElement = textElement.parents(".single-webhook-wrapper").find(".webhooks-history");

            if (historyElement.hasClass("open")) {
                text = $translate.instant("ADMIN.WEBHOOKS.ACTION_HIDE_HISTORY");
                title = $translate.instant("ADMIN.WEBHOOKS.ACTION_HIDE_HISTORY_TITLE");
            } else {
                text = $translate.instant("ADMIN.WEBHOOKS.ACTION_SHOW_HISTORY");
                title = $translate.instant("ADMIN.WEBHOOKS.ACTION_SHOW_HISTORY_TITLE");
            }

            textElement.text(text);
            return textElement.prop("title", title);
        };

        let showVisualizationMode = function() {
            $el.find(".edition-mode").addClass("hidden");
            return $el.find(".visualization-mode").removeClass("hidden");
        };

        let showEditMode = function() {
            $el.find(".visualization-mode").addClass("hidden");
            return $el.find(".edition-mode").removeClass("hidden");
        };

        let openHistory = () => $el.find(".webhooks-history").addClass("open");

        let cancel = function() {
            showVisualizationMode();
            return $scope.$apply(() => webhook.revert());
        };

        let save = debounce(2000, function(target) {
            let form = target.parents("form").checksley();
            if (!form.validate()) { return; }
            let promise = $repo.save(webhook);
            promise.then(() => {
                return showVisualizationMode();
            });

            return promise.then(null, function(data) {
                $confirm.notify("error");
                return form.setErrors(data);
            });
        });

        $el.on("click", ".test-webhook", function() {
            openHistory();
            return $rs.webhooks.test(webhook.id).then(() => {
                return updateLogs();
            });
        });

        $el.on("click", ".edit-webhook", () => showEditMode());

        $el.on("click", ".cancel-existing", () => cancel());

        $el.on("click", ".edit-existing", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            return save(target);
        });

        $el.on("keyup", ".edition-mode input", function(event) {
            let target;
            if (event.keyCode === 13) {
                target = angular.element(event.currentTarget);
                return save(target);
            } else if (event.keyCode === 27) {
                target = angular.element(event.currentTarget);
                return cancel();
            }
        });

        $el.on("click", ".delete-webhook", function() {
            let title = $translate.instant("ADMIN.WEBHOOKS.DELETE");
            let message = $translate.instant("ADMIN.WEBHOOKS.WEBHOOK_NAME", {name: webhook.name});

            return $confirm.askOnDelete(title, message).then(askResponse => {
                let onSucces = function() {
                    askResponse.finish();
                    return $scope.$emit("webhooks:reload");
                };

                let onError = function() {
                    askResponse.finish(false);
                    return $confirm.notify("error");
                };

                return $repo.remove(webhook).then(onSucces, onError);
            });
        });

        $el.on("click", ".toggle-history", function(event) {
            let target = angular.element(event.currentTarget);

            if ((webhook.logs == null) || (webhook.logs.length === 0)) {
                return updateLogs().then(() =>
                    //Waiting for ng-repeat to finish
                    timeout(0, function() {
                        $el.find(".webhooks-history")
                            .toggleClass("open")
                            .slideToggle();

                        return updateShowHideHistoryText();
                    })
                );

            } else {
                $el.find(".webhooks-history")
                    .toggleClass("open")
                    .slideToggle();

                return $scope.$apply(() => updateShowHideHistoryText());
            }
        });


        $el.on("click", ".history-single", function(event) {
            let target = angular.element(event.currentTarget);
            target.toggleClass("history-single-open");
            return target.siblings(".history-single-response").toggleClass("open");
        });

        return $el.on("click", ".resend-request", function(event) {
            let target = angular.element(event.currentTarget);
            let log = target.data("log");
            return $rs.webhooklogs.resend(log).then(() => {
                return updateLogs();
            });
        });
    };

    return {link};
};

module.directive("tgWebhook", ["$tgResources", "$tgRepo", "$tgConfirm", "$tgLoading", "$translate",
                               WebhookDirective]);


//############################################################################
//# New webhook Directive
//############################################################################

let NewWebhookDirective = function($rs, $repo, $confirm, $loading) {
    let link = function($scope, $el, $attrs) {
        let webhook = $scope.$eval($attrs.tgWebhook);
        let formDOMNode = $el.find(".new-webhook-form");
        let addWebhookDOMNode = $el.find(".add-webhook");
        let initializeNewValue = () =>
            $scope.newValue = {
                "name": "",
                "url": "",
                "key": ""
            }
        ;

        initializeNewValue();

        $scope.$watch("webhooks", function(webhooks) {
            if (webhooks != null) {
                if (webhooks.length === 0) {
                    formDOMNode.removeClass("hidden");
                    addWebhookDOMNode.addClass("hidden");
                    return formDOMNode.find("input")[0].focus();
                } else {
                    formDOMNode.addClass("hidden");
                    return addWebhookDOMNode.removeClass("hidden");
                }
            }
        });

        let save = debounce(2000, function() {
            let form = formDOMNode.checksley();
            if (!form.validate()) { return; }

            $scope.newValue.project = $scope.project.id;
            let promise = $repo.create("webhooks", $scope.newValue);
            promise.then(() => {
                $scope.$emit("webhooks:reload");
                return initializeNewValue();
            });

            return promise.then(null, function(data) {
                $confirm.notify("error");
                return form.setErrors(data);
            });
        });

        formDOMNode.on("click", ".add-new", function(event) {
            event.preventDefault();
            return save();
        });

        formDOMNode.on("keyup", "input", function(event) {
            if (event.keyCode === 13) {
                return save();
            }
        });

        formDOMNode.on("click", ".cancel-new", event =>
            $scope.$apply(function() {
                initializeNewValue();

                // Close form if there some webhooks created
                if ($scope.webhooks.length >= 1) {
                    return formDOMNode.addClass("hidden");
                }
            })
        );

        return addWebhookDOMNode.on("click", function(event) {
            formDOMNode.removeClass("hidden");
            return formDOMNode.find("input")[0].focus();
        });
    };

    return {link};
};

module.directive("tgNewWebhook", ["$tgResources", "$tgRepo", "$tgConfirm", "$tgLoading", NewWebhookDirective]);


//############################################################################
//# Github Controller
//############################################################################

class GithubController extends FiltersMixin {
    scope: angular.IScope
    repo:any
    rs:any
    params:any
    appMetaService:any
    translate:any
    projectService:any

    static initClass() {
        this.$inject = [
            "$scope",
            "$tgRepo",
            "$tgResources",
            "$routeParams",
            "tgAppMetaService",
            "$translate",
            "tgProjectService"
        ];
    }

    constructor(scope, repo, rs, params, appMetaService, translate, projectService) {
        super()
        this.scope = scope;
        this.repo = repo;
        this.rs = rs;
        this.params = params;
        this.appMetaService = appMetaService;
        this.translate = translate;
        this.projectService = projectService;
        bindMethods(this);

        this.scope.sectionName = this.translate.instant("ADMIN.GITHUB.SECTION_NAME");
        this.scope.project = {};

        let promise = this.loadInitialData();

        promise.then(() => {
            let title = this.translate.instant("ADMIN.GITHUB.PAGE_TITLE", {projectName: this.scope.project.name});
            let { description } = this.scope.project;
            return this.appMetaService.setAll(title, description);
        });

        promise.then(null, this.onInitialDataError.bind(this));
    }

    loadModules() {
        return this.rs.modules.list(this.scope.projectId, "github").then(github => {
            return this.scope.github = github;
        });
    }

    loadProject() {
        let project = this.projectService.project.toJS();

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.$emit('project:loaded', project);
        return project;
    }

    loadInitialData() {
        let promise = this.loadProject();
        return this.loadModules();
    }
}
GithubController.initClass();

module.controller("GithubController", GithubController);


//############################################################################
//# Gitlab Controller
//############################################################################

class GitlabController extends FiltersMixin {
    scope: angular.IScope
    repo:any
    rs:any
    params:any
    appMetaService:any
    translate:any
    projectService:any

    static initClass() {
        this.$inject = [
            "$scope",
            "$tgRepo",
            "$tgResources",
            "$routeParams",
            "tgAppMetaService",
            "$translate",
            "tgProjectService"
        ];
    }

    constructor(scope, repo, rs, params, appMetaService, translate, projectService) {
        super()
        this.scope = scope;
        this.repo = repo;
        this.rs = rs;
        this.params = params;
        this.appMetaService = appMetaService;
        this.translate = translate;
        this.projectService = projectService;
        bindMethods(this);

        this.scope.sectionName = this.translate.instant("ADMIN.GITLAB.SECTION_NAME");
        this.scope.project = {};
        let promise = this.loadInitialData();

        promise.then(() => {
            let title = this.translate.instant("ADMIN.GITLAB.PAGE_TITLE", {projectName: this.scope.project.name});
            let { description } = this.scope.project;
            return this.appMetaService.setAll(title, description);
        });

        promise.then(null, this.onInitialDataError.bind(this));

        this.scope.$on("project:modules:reload", () => {
            return this.loadModules();
        });
    }

    loadModules() {
        return this.rs.modules.list(this.scope.projectId, "gitlab").then(gitlab => {
            return this.scope.gitlab = gitlab;
        });
    }

    loadProject() {
        let project = this.projectService.project.toJS();

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.$emit('project:loaded', project);
        return project;
    }

    loadInitialData() {
        this.loadProject();
        return this.loadModules();
    }
}
GitlabController.initClass();

module.controller("GitlabController", GitlabController);


//############################################################################
//# Bitbucket Controller
//############################################################################

class BitbucketController extends FiltersMixin {
    scope: angular.IScope
    repo:any
    rs:any
    params:any
    appMetaService:any
    translate:any
    projectService:any

    static initClass() {
        this.$inject = [
            "$scope",
            "$tgRepo",
            "$tgResources",
            "$routeParams",
            "tgAppMetaService",
            "$translate",
            "tgProjectService"
        ];
    }

    constructor(scope, repo, rs, params, appMetaService, translate, projectService) {
        super()
        this.scope = scope;
        this.repo = repo;
        this.rs = rs;
        this.params = params;
        this.appMetaService = appMetaService;
        this.translate = translate;
        this.projectService = projectService;
        bindMethods(this);

        this.scope.sectionName = this.translate.instant("ADMIN.BITBUCKET.SECTION_NAME");
        this.scope.project = {};
        let promise = this.loadInitialData();

        promise.then(() => {
            let title = this.translate.instant("ADMIN.BITBUCKET.PAGE_TITLE", {projectName: this.scope.project.name});
            let { description } = this.scope.project;
            return this.appMetaService.setAll(title, description);
        });

        promise.then(null, this.onInitialDataError.bind(this));

        this.scope.$on("project:modules:reload", () => {
            return this.loadModules();
        });
    }

    loadModules() {
        return this.rs.modules.list(this.scope.projectId, "bitbucket").then(bitbucket => {
            return this.scope.bitbucket = bitbucket;
        });
    }

    loadProject() {
        let project = this.projectService.project.toJS();

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.$emit('project:loaded', project);
        return project;
    }

    loadInitialData() {
        this.loadProject();
        return this.loadModules();
    }
}
BitbucketController.initClass();

module.controller("BitbucketController", BitbucketController);


let SelectInputText =  function() {
    let link = ($scope, $el, $attrs) =>
        $el.on("click", ".select-input-content", function() {
            $el.find("input").select();
            return $el.find(".help-copy").addClass("visible");
        })
    ;

    return {link};
};

module.directive("tgSelectInputText", SelectInputText);


//############################################################################
//# GithubWebhooks Directive
//############################################################################

let GithubWebhooksDirective = function($repo, $confirm, $loading) {
    let link = function($scope, $el, $attrs) {
        let form = $el.find("form").checksley({"onlyOneErrorElement": true});
        let submit = debounce(2000, event => {
            event.preventDefault();

            if (!form.validate()) { return; }

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            let promise = $repo.saveAttribute($scope.github, "github");
            promise.then(function() {
                currentLoading.finish();
                return $confirm.notify("success");
            });

            return promise.then(null, function(data) {
                currentLoading.finish();
                form.setErrors(data);
                if (data._error_message) {
                    return $confirm.notify("error", data._error_message);
                }
            });
        });

        var submitButton = $el.find(".submit-button");

        return $el.on("submit", "form", submit);
    };

    return {link};
};

module.directive("tgGithubWebhooks", ["$tgRepo", "$tgConfirm", "$tgLoading", GithubWebhooksDirective]);


//############################################################################
//# GitlabWebhooks Directive
//############################################################################

let GitlabWebhooksDirective = function($repo, $confirm, $loading) {
    let link = function($scope, $el, $attrs) {
        let form = $el.find("form").checksley({"onlyOneErrorElement": true});
        let submit = debounce(2000, event => {
            event.preventDefault();

            if (!form.validate()) { return; }

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            let promise = $repo.saveAttribute($scope.gitlab, "gitlab");
            promise.then(function() {
                currentLoading.finish();
                $confirm.notify("success");
                return $scope.$emit("project:modules:reload");
            });

            return promise.then(null, function(data) {
                currentLoading.finish();
                form.setErrors(data);
                if (data._error_message) {
                    return $confirm.notify("error", data._error_message);
                }
            });
        });

        var submitButton = $el.find(".submit-button");

        return $el.on("submit", "form", submit);
    };

    return {link};
};

module.directive("tgGitlabWebhooks", ["$tgRepo", "$tgConfirm", "$tgLoading", GitlabWebhooksDirective]);


//############################################################################
//# BitbucketWebhooks Directive
//############################################################################

let BitbucketWebhooksDirective = function($repo, $confirm, $loading) {
    let link = function($scope, $el, $attrs) {
        let form = $el.find("form").checksley({"onlyOneErrorElement": true});
        let submit = debounce(2000, event => {
            event.preventDefault();

            if (!form.validate()) { return; }

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            let promise = $repo.saveAttribute($scope.bitbucket, "bitbucket");
            promise.then(function() {
                currentLoading.finish();
                $confirm.notify("success");
                return $scope.$emit("project:modules:reload");
            });

            return promise.then(null, function(data) {
                currentLoading.finish();
                form.setErrors(data);
                if (data._error_message) {
                    return $confirm.notify("error", data._error_message);
                }
            });
        });

        var submitButton = $el.find(".submit-button");

        return $el.on("submit", "form", submit);
    };

    return {link};
};

module.directive("tgBitbucketWebhooks", ["$tgRepo", "$tgConfirm", "$tgLoading", BitbucketWebhooksDirective]);


//############################################################################
//# Valid Origin IP's Directive
//############################################################################
let ValidOriginIpsDirective = function() {
    let link = ($scope, $el, $attrs, $ngModel) =>
        $ngModel.$parsers.push(function(value) {
            value = $.trim(value);
            if (value === "") {
                return [];
            }

            return value.split(",");
        })
    ;

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgValidOriginIps", ValidOriginIpsDirective);

//############################################################################
//# Gogs Controller
//############################################################################

class GogsController extends FiltersMixin {
    scope: angular.IScope
    repo:any
    rs:any
    params:any
    appMetaService:any
    translate:any
    projectService:any

    static initClass() {
        this.$inject = [
            "$scope",
            "$tgRepo",
            "$tgResources",
            "$routeParams",
            "tgAppMetaService",
            "$translate",
            "tgProjectService"
        ];
    }

    constructor(scope, repo, rs, params, appMetaService, translate, projectService) {
        super()
        this.scope = scope;
        this.repo = repo;
        this.rs = rs;
        this.params = params;
        this.appMetaService = appMetaService;
        this.translate = translate;
        this.projectService = projectService;
        bindMethods(this);

        this.scope.sectionName = this.translate.instant("ADMIN.GOGS.SECTION_NAME");
        this.scope.project = {};

        let promise = this.loadInitialData();

        promise.then(() => {
            let title = this.translate.instant("ADMIN.GOGS.PAGE_TITLE", {projectName: this.scope.project.name});
            let { description } = this.scope.project;
            return this.appMetaService.setAll(title, description);
        });

        promise.then(null, this.onInitialDataError.bind(this));
    }

    loadModules() {
        return this.rs.modules.list(this.scope.projectId, "gogs").then(gogs => {
            return this.scope.gogs = gogs;
        });
    }

    loadProject() {
        let project = this.projectService.project.toJS();

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.$emit('project:loaded', project);
        return project;
    }

    loadInitialData() {
        this.loadProject();
        return this.loadModules();
    }
}
GogsController.initClass();

module.controller("GogsController", GogsController);
