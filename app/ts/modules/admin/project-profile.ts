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
 * File: modules/admin/project-profile.coffee
 */

let { taiga } = this;

let { mixOf } = this.taiga;
let { trim } = this.taiga;
let { toString } = this.taiga;
let { joinStr } = this.taiga;
let { groupBy } = this.taiga;
let { bindOnce } = this.taiga;
let { debounce } = this.taiga;

let module = angular.module("taigaAdmin");


//############################################################################
//# Project Profile Controller
//############################################################################

class ProjectProfileController extends mixOf(taiga.Controller, taiga.PageMixin) {
    static initClass() {
        this.$inject = [
            "$scope",
            "$rootScope",
            "$tgRepo",
            "$tgConfirm",
            "$tgResources",
            "$routeParams",
            "$q",
            "$tgLocation",
            "$tgNavUrls",
            "tgAppMetaService",
            "$translate",
            "$tgAuth",
            "tgCurrentUserService",
            "tgErrorHandlingService",
            "tgProjectService",
            "$tgModel"
        ];
    }

    constructor(scope, rootscope, repo, confirm, rs, params, q, location, navUrls,
                  appMetaService, translate, tgAuth, currentUserService, errorHandlingService, projectService, model) {
        let description, sectionName, title;
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.params = params;
        this.q = q;
        this.location = location;
        this.navUrls = navUrls;
        this.appMetaService = appMetaService;
        this.translate = translate;
        this.tgAuth = tgAuth;
        this.currentUserService = currentUserService;
        this.errorHandlingService = errorHandlingService;
        this.projectService = projectService;
        this.model = model;
        this.scope.project = {};

        this.scope.projectTags = [];
        let promise = this.loadInitialData();

        promise.then(() => {
            sectionName = this.translate.instant( this.scope.sectionName);
            title = this.translate.instant("ADMIN.PROJECT_PROFILE.PAGE_TITLE", {
                     sectionName, projectName: this.scope.project.name});
            ({ description } = this.scope.project);
            this.appMetaService.setAll(title, description);

            return this.fillUsersAndRoles(this.scope.project.members, this.scope.project.roles);
        });

        promise.then(null, this.onInitialDataError.bind(this));

        this.scope.$on("project:loaded", () => {
            sectionName = this.translate.instant(this.scope.sectionName);
            title = this.translate.instant("ADMIN.PROJECT_PROFILE.PAGE_TITLE", {
                     sectionName, projectName: this.scope.project.name});
            ({ description } = this.scope.project);
            return this.appMetaService.setAll(title, description);
        });
    }

    loadProject() {
        let project = this.projectService.project.toJS();
        project = this.model.make_model("projects", project);

        if (!project.i_am_admin) {
            this.errorHandlingService.permissionDenied();
        }

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.epicStatusList = _.sortBy(project.epic_statuses, "order");
        this.scope.usStatusList = _.sortBy(project.us_statuses, "order");
        this.scope.pointsList = _.sortBy(project.points, "order");
        this.scope.taskStatusList = _.sortBy(project.task_statuses, "order");
        this.scope.issueTypesList = _.sortBy(project.issue_types, "order");
        this.scope.issueStatusList = _.sortBy(project.issue_statuses, "order");
        this.scope.prioritiesList = _.sortBy(project.priorities, "order");
        this.scope.severitiesList = _.sortBy(project.severities, "order");
        this.scope.$emit('project:loaded', project);

        this.scope.projectTags = _.map(this.scope.project.tags, it => {
            return [it, this.scope.project.tags_colors[it]];
    });

        return project;
    }

    loadInitialData() {
        this.loadProject();

        return this.tgAuth.refresh();
    }

    openDeleteLightbox() {
        return this.rootscope.$broadcast("deletelightbox:new", this.scope.project);
    }

    addTag(name, color) {
        let tags = _.clone(this.scope.project.tags);

        tags.push(name);

        this.scope.projectTags.push([name, null]);
        return this.scope.project.tags = tags;
    }

    deleteTag(tag) {
        let tags = _.clone(this.scope.project.tags);
        _.pull(tags, tag[0]);
        _.remove(this.scope.projectTags, it => it[0] === tag[0]);

        return this.scope.project.tags = tags;
    }
}
ProjectProfileController.initClass();

module.controller("ProjectProfileController", ProjectProfileController);


//############################################################################
//# Project Profile Directive
//############################################################################

let ProjectProfileDirective = function($repo, $confirm, $loading, $navurls, $location, projectService, currentUserService) {
    let link = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();

        let form = $el.find("form").checksley({"onlyOneErrorElement": true});
        let submit = debounce(2000, event => {
            event.preventDefault();

            if (!form.validate()) { return; }

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            let promise = $repo.save($scope.project);
            promise.then(function() {
                currentLoading.finish();
                $confirm.notify("success");
                let newUrl = $navurls.resolve("project-admin-project-profile-details", {
                    project: $scope.project.slug
                });
                $location.path(newUrl);

                projectService.fetchProject().then(() => {
                    return $ctrl.loadInitialData();
                });

                return currentUserService.loadProjects();
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

module.directive("tgProjectProfile", ["$tgRepo", "$tgConfirm", "$tgLoading", "$tgNavUrls", "$tgLocation",
                                      "tgProjectService", "tgCurrentUserService", ProjectProfileDirective]);


//############################################################################
//# Project Default Values Directive
//############################################################################

let ProjectDefaultValuesDirective = function($repo, $confirm, $loading) {
    let link = function($scope, $el, $attrs) {
        let form = $el.find("form").checksley({"onlyOneErrorElement": true});
        let submit = debounce(2000, event => {
            event.preventDefault();

            if (!form.validate()) { return; }

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            let promise = $repo.save($scope.project);
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

        $el.on("submit", "form", submit);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgProjectDefaultValues", ["$tgRepo", "$tgConfirm", "$tgLoading",
                                            ProjectDefaultValuesDirective]);

//############################################################################
//# Project Modules Directive
//############################################################################

let ProjectModulesDirective = function($repo, $confirm, $loading, projectService) {
    let link = function($scope, $el, $attrs) {
        let submit = () => {
            let form = $el.find("form").checksley();
            form.initializeFields(); // Need to reset the form constrains
            form.reset(); // Need to reset the form constrains
            if (!form.validate()) { return; }

            let promise = $repo.save($scope.project);
            promise.then(function() {
                $scope.$emit("project:loaded", $scope.project);
                $confirm.notify("success");

                return projectService.fetchProject();
            });

            return promise.then(null, function(data) {
                form.setErrors(data);
                if (data._error_message) {
                    return $confirm.notify("error", data._error_message);
                }
            });
        };

        $el.on("change", ".module-activation.module-direct-active input", function(event) {
            event.preventDefault();

            return $scope.$applyAsync(submit);
        });

        $el.on("submit", "form", function(event) {
            event.preventDefault();

            return submit();
        });

        $el.on("click", ".save", function(event) {
            event.preventDefault();
            return submit();
        });

        $el.on("keydown", ".videoconference-attributes input", e => e.which !== 32);

        $scope.$watch("project.videoconferences", function(newVal, oldVal) {
            // Reset videoconferences_extra_data if videoconference system change
            if ((newVal != null) && (oldVal != null) && (newVal !== oldVal)) {
                return $scope.project.videoconferences_extra_data = "";
            }
        });

        $scope.$watch("isVideoconferenceActivated", function(newValue, oldValue) {
            if (newValue === false) {
                // Reset videoconference attributes
                $scope.project.videoconferences = null;
                $scope.project.videoconferences_extra_data = "";

                // Save when videoconference is desactivated
                if (oldValue === true) { return submit(); }
            }
        });

        return $scope.$watch("project", function(project) {
            if (project.videoconferences != null) {
                return $scope.isVideoconferenceActivated = true;
            } else {
                return $scope.isVideoconferenceActivated = false;
            }
        });
    };

    return {link};
};

module.directive("tgProjectModules", ["$tgRepo", "$tgConfirm", "$tgLoading", "tgProjectService",
                                      ProjectModulesDirective]);


//############################################################################
//# Project Export Directive
//############################################################################

let ProjectExportDirective = function($window, $rs, $confirm, $translate) {
    let link = function($scope, $el, $attrs) {
        let buttonsEl = $el.find(".admin-project-export-buttons");
        let showButtons = () => buttonsEl.removeClass("hidden");
        let hideButtons = () => buttonsEl.addClass("hidden");

        let resultEl = $el.find(".admin-project-export-result");
        let showResult = () => resultEl.removeClass("hidden");
        let hideResult = () => resultEl.addClass("hidden");

        let spinnerEl = $el.find(".spin");
        let showSpinner = () => spinnerEl.removeClass("hidden");
        let hideSpinner = () => spinnerEl.addClass("hidden");

        let resultTitleEl = $el.find(".result-title");


        let loading_title = $translate.instant("ADMIN.PROJECT_EXPORT.LOADING_TITLE");
        let loading_msg = $translate.instant("ADMIN.PROJECT_EXPORT.LOADING_MESSAGE");
        let dump_ready_text = () => resultTitleEl.html($translate.instant("ADMIN.PROJECT_EXPORT.DUMP_READY"));
        let asyn_message = () => resultTitleEl.html($translate.instant("ADMIN.PROJECT_EXPORT.ASYNC_MESSAGE"));
        let syn_message = url => resultTitleEl.html($translate.instant("ADMIN.PROJECT_EXPORT.SYNC_MESSAGE", {
                                                                                                   url})) ;

        let setLoadingTitle = () => resultTitleEl.html(loading_title);
        let setAsyncTitle = () => resultTitleEl.html(loading_msg);
        let setSyncTitle = () => resultTitleEl.html(dump_ready_text);

        let resultMessageEl = $el.find(".result-message ");
        let setLoadingMessage = () => resultMessageEl.html(loading_msg);
        let setAsyncMessage = () => resultMessageEl.html(asyn_message);
        let setSyncMessage = url => resultMessageEl.html(syn_message(url));

        let showLoadingMode = function() {
            showSpinner();
            setLoadingTitle();
            setLoadingMessage();
            hideButtons();
            return showResult();
        };

        let showExportResultAsyncMode = function() {
            hideSpinner();
            setAsyncTitle();
            return setAsyncMessage();
        };

        let showExportResultSyncMode = function(url) {
            hideSpinner();
            setSyncTitle();
            return setSyncMessage(url);
        };

        let showErrorMode = function() {
            hideSpinner();
            hideResult();
            return showButtons();
        };

        return $el.on("click", "a.button-export", debounce(2000, event => {
            event.preventDefault();

            let onSuccess = result => {
                if (result.status === 202) { // Async mode
                    return showExportResultAsyncMode();
                } else { //result.status == 200 # Sync mode
                    let dumpUrl = result.data.url;
                    showExportResultSyncMode(dumpUrl);
                    return $window.open(dumpUrl, "_blank");
                }
            };

            let onError = result => {
                showErrorMode();

                let errorMsg = $translate.instant("ADMIN.PROJECT_EXPORT.ERROR");

                if (result.status === 429) {  // TOO MANY REQUESTS
                    errorMsg = $translate.instant("ADMIN.PROJECT_EXPORT.ERROR_BUSY");
                } else if (result.data != null ? result.data._error_message : undefined) {
                    errorMsg = $translate.instant("ADMIN.PROJECT_EXPORT.ERROR_BUSY", {
                                                   message: result.data._error_message});
                }

                return $confirm.notify("error", errorMsg);
            };

            showLoadingMode();
            return $rs.projects.export($scope.projectId).then(onSuccess, onError);
        })
        );
    };

    return {link};
};

module.directive("tgProjectExport", ["$window", "$tgResources", "$tgConfirm", "$translate",
                                     ProjectExportDirective]);


//############################################################################
//# CSV Export Controllers
//############################################################################

class CsvExporterController extends taiga.Controller {
    static initClass() {
        this.$inject = [
            "$scope",
            "$rootScope",
            "$tgUrls",
            "$tgConfirm",
            "$tgResources",
            "$translate"
        ];
    }

    constructor(scope, rootscope, urls, confirm, rs, translate) {
        this.setCsvUuid = this.setCsvUuid.bind(this);
        this._generateUuid = this._generateUuid.bind(this);
        this.scope = scope;
        this.rootscope = rootscope;
        this.urls = urls;
        this.confirm = confirm;
        this.rs = rs;
        this.translate = translate;
        this.rootscope.$on("project:loaded", this.setCsvUuid);
        this.scope.$watch("csvUuid", value => {
            if (value) {
                return this.scope.csvUrl = this.urls.resolveAbsolute(`${this.type}-csv`, value);
            } else {
                return this.scope.csvUrl = "";
            }
        });
    }

    setCsvUuid() {
        return this.scope.csvUuid = this.scope.project[`${this.type}_csv_uuid`];
    }

    _generateUuid(response) {
        if (response == null) { response = null; }
        let promise = this.rs.projects[`regenerate_${this.type}_csv_uuid`](this.scope.projectId);

        promise.then(data => {
            return this.scope.csvUuid = data.data != null ? data.data.uuid : undefined;
        });

        promise.then(null, () => {
            return this.confirm.notify("error");
        });

        promise.finally(function() {
            if (response) { return response.finish(); }
        });
        return promise;
    }

    regenerateUuid() {
        if (this.scope.csvUuid) {
            let title = this.translate.instant("ADMIN.REPORTS.REGENERATE_TITLE");
            let subtitle = this.translate.instant("ADMIN.REPORTS.REGENERATE_SUBTITLE");

            return this.confirm.ask(title, subtitle).then(this._generateUuid);
        } else {
            return this._generateUuid();
        }
    }
}
CsvExporterController.initClass();


class CsvExporterEpicsController extends CsvExporterController {
    static initClass() {
        this.prototype.type = "epics";
    }
}
CsvExporterEpicsController.initClass();


class CsvExporterUserstoriesController extends CsvExporterController {
    static initClass() {
        this.prototype.type = "userstories";
    }
}
CsvExporterUserstoriesController.initClass();


class CsvExporterTasksController extends CsvExporterController {
    static initClass() {
        this.prototype.type = "tasks";
    }
}
CsvExporterTasksController.initClass();


class CsvExporterIssuesController extends CsvExporterController {
    static initClass() {
        this.prototype.type = "issues";
    }
}
CsvExporterIssuesController.initClass();


module.controller("CsvExporterEpicsController", CsvExporterEpicsController);
module.controller("CsvExporterUserstoriesController", CsvExporterUserstoriesController);
module.controller("CsvExporterTasksController", CsvExporterTasksController);
module.controller("CsvExporterIssuesController", CsvExporterIssuesController);


//############################################################################
//# CSV Directive
//############################################################################

let CsvEpicDirective = function($translate) {
    let link = $scope => $scope.sectionTitle = "ADMIN.CSV.SECTION_TITLE_EPIC";

    return {
        controller: "CsvExporterEpicsController",
        controllerAs: "ctrl",
        templateUrl: "admin/project-csv.html",
        link,
        scope: true
    };
};

module.directive("tgCsvEpic", ["$translate", CsvEpicDirective]);


let CsvUsDirective = function($translate) {
    let link = $scope => $scope.sectionTitle = "ADMIN.CSV.SECTION_TITLE_US";

    return {
        controller: "CsvExporterUserstoriesController",
        controllerAs: "ctrl",
        templateUrl: "admin/project-csv.html",
        link,
        scope: true
    };
};

module.directive("tgCsvUs", ["$translate", CsvUsDirective]);


let CsvTaskDirective = function($translate) {
    let link = $scope => $scope.sectionTitle = "ADMIN.CSV.SECTION_TITLE_TASK";

    return {
        controller: "CsvExporterTasksController",
        controllerAs: "ctrl",
        templateUrl: "admin/project-csv.html",
        link,
        scope: true
    };
};

module.directive("tgCsvTask", ["$translate", CsvTaskDirective]);


let CsvIssueDirective = function($translate) {
    let link = $scope => $scope.sectionTitle = "ADMIN.CSV.SECTION_TITLE_ISSUE";

    return {
        controller: "CsvExporterIssuesController",
        controllerAs: "ctrl",
        templateUrl: "admin/project-csv.html",
        link,
        scope: true
    };
};

module.directive("tgCsvIssue", ["$translate", CsvIssueDirective]);


//############################################################################
//# Project Logo Directive
//############################################################################

let ProjectLogoDirective = function($auth, $model, $rs, $confirm) {
    let link = function($scope, $el, $attrs) {
        let showSizeInfo = () => $el.find(".size-info").addClass("active");

        let onSuccess = function(response) {
            let project = $model.make_model("projects", response.data);
            $scope.project = project;

            $el.find('.loading-overlay').removeClass('active');
            return $confirm.notify('success');
        };

        let onError = function(response) {
            if (response.status === 413) { showSizeInfo(); }
            $el.find('.loading-overlay').removeClass('active');
            return $confirm.notify('error', response.data._error_message);
        };

        // Change photo
        $el.on("click", ".js-change-logo", () => $el.find("#logo-field").click());

        $el.on("change", "#logo-field", function(event) {
            if ($scope.logoAttachment) {
                $el.find('.loading-overlay').addClass("active");
                return $rs.projects.changeLogo($scope.project.id, $scope.logoAttachment).then(onSuccess, onError);
            }
        });

        // Use default photo
        $el.on("click", "a.js-use-default-logo", function(event) {
            $el.find('.loading-overlay').addClass("active");
            return $rs.projects.removeLogo($scope.project.id).then(onSuccess, onError);
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgProjectLogo", ["$tgAuth", "$tgModel", "$tgResources", "$tgConfirm", ProjectLogoDirective]);


//############################################################################
//# Project Logo Model Directive
//############################################################################

let ProjectLogoModelDirective = function($parse) {
    let link = function($scope, $el, $attrs) {
        let model = $parse($attrs.tgProjectLogoModel);
        let modelSetter = model.assign;

        return $el.bind('change', () =>
            $scope.$apply(() => modelSetter($scope, $el[0].files[0]))
        );
    };

    return {link};
};

module.directive('tgProjectLogoModel', ['$parse', ProjectLogoModelDirective]);


let AdminProjectRestrictionsDirective = () =>
    ({
        scope: {
            "project": "="
        },
        templateUrl: "admin/admin-project-restrictions.html"
    })
;

module.directive('tgAdminProjectRestrictions', [AdminProjectRestrictionsDirective]);

let AdminProjectRequestOwnershipDirective = lightboxFactory =>
    ({
        link(scope) {
            return scope.requestOwnership = () =>
                lightboxFactory.create("tg-lb-request-ownership", {
                    "class": "lightbox lightbox-request-ownership"
                }, {
                    projectId: scope.projectId
                })
            ;
        },

        scope: {
            "projectId": "=",
            "owner": "="
        },
        templateUrl: "admin/admin-project-request-ownership.html"
    })
;

module.directive('tgAdminProjectRequestOwnership', ["tgLightboxFactory", AdminProjectRequestOwnershipDirective]);

let AdminProjectChangeOwnerDirective = lightboxFactory =>
    ({
        link(scope) {
            return scope.changeOwner = () =>
                lightboxFactory.create("tg-lb-change-owner", {
                    "class": "lightbox lightbox-select-user",
                    "project-id": "projectId",
                    "active-users": "activeUsers",
                    "current-owner-id": "currentOwnerId"
                }, {
                    projectId: scope.projectId,
                    activeUsers: scope.activeUsers,
                    currentOwnerId: scope.owner.id,
                    members: scope.members
                })
            ;
        },

        scope: {
            "activeUsers": "=",
            "projectId": "=",
            "owner": "=",
            "members": "="
        },
        templateUrl: "admin/admin-project-change-owner.html"
    })
;

module.directive('tgAdminProjectChangeOwner', ["tgLightboxFactory", AdminProjectChangeOwnerDirective]);
