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
 * File: modules/issues/detail.coffee
 */

import {groupBy, bindMethods} from "../../utils"
import {PageMixin} from "../controllerMixins"
import * as angular from "angular"
import * as _ from "lodash"

let module = angular.module("taigaIssues");

//############################################################################
//# Issue Detail Controller
//############################################################################

class IssueDetailController extends PageMixin {
    scope: angular.IScope
    rootscope: angular.IScope
    repo:any
    confirm:any
    rs:any
    params:any
    q:any
    location:any
    log:any
    appMetaService:any
    analytics:any
    navUrls:any
    translate:any
    modelTransform:any
    errorHandlingService:any
    projectService:any

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
            "$log",
            "tgAppMetaService",
            "$tgAnalytics",
            "$tgNavUrls",
            "$translate",
            "$tgQueueModelTransformation",
            "tgErrorHandlingService",
            "tgProjectService"
        ];
    }

    constructor(scope, rootscope, repo, confirm, rs, params, q, location,
                  log, appMetaService, analytics, navUrls, translate, modelTransform, errorHandlingService, projectService) {
        super()
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.params = params;
        this.q = q;
        this.location = location;
        this.log = log;
        this.appMetaService = appMetaService;
        this.analytics = analytics;
        this.navUrls = navUrls;
        this.translate = translate;
        this.modelTransform = modelTransform;
        this.errorHandlingService = errorHandlingService;
        this.projectService = projectService;
        bindMethods(this);

        this.scope.issueRef = this.params.issueref;
        this.scope.sectionName = this.translate.instant("ISSUES.SECTION_NAME");
        this.initializeEventHandlers();

        let promise = this.loadInitialData();

        // On Success
        promise.then(() => {
            this._setMeta();
            return this.initializeOnDeleteGoToUrl();
        });

        // On Error
        promise.then(null, this.onInitialDataError.bind(this));
    }

    _setMeta() {
        let title = this.translate.instant("ISSUE.PAGE_TITLE", {
            issueRef: `#${this.scope.issue.ref}`,
            issueSubject: this.scope.issue.subject,
            projectName: this.scope.project.name
        });
        let description = this.translate.instant("ISSUE.PAGE_DESCRIPTION", {
            issueStatus: (this.scope.statusById[this.scope.issue.status] != null ? this.scope.statusById[this.scope.issue.status].name : undefined) || "--",
            issueType: (this.scope.typeById[this.scope.issue.type] != null ? this.scope.typeById[this.scope.issue.type].name : undefined) || "--",
            issueSeverity: (this.scope.severityById[this.scope.issue.severity] != null ? this.scope.severityById[this.scope.issue.severity].name : undefined) || "--",
            issuePriority: (this.scope.priorityById[this.scope.issue.priority] != null ? this.scope.priorityById[this.scope.issue.priority].name : undefined) || "--",
            issueDescription: angular.element(this.scope.issue.description_html || "").text()
        });
        return this.appMetaService.setAll(title, description);
    }

    initializeEventHandlers() {
        this.scope.$on("attachment:create", () => {
            return this.analytics.trackEvent("attachment", "create", "create attachment on issue", 1);
        });

        this.scope.$on("promote-issue-to-us:success", () => {
            this.analytics.trackEvent("issue", "promoteToUserstory", "promote issue to userstory", 1);
            this.rootscope.$broadcast("object:updated");
            return this.loadIssue();
        });

        this.scope.$on("comment:new", () => {
            return this.loadIssue();
        });

        return this.scope.$on("custom-attributes-values:edit", () => {
            return this.rootscope.$broadcast("object:updated");
        });
    }

    initializeOnDeleteGoToUrl() {
       let ctx = {project: this.scope.project.slug};
       if (this.scope.project.is_issues_activated) {
           return this.scope.onDeleteGoToUrl = this.navUrls.resolve("project-issues", ctx);
       } else {
           return this.scope.onDeleteGoToUrl = this.navUrls.resolve("project", ctx);
       }
   }

    loadProject() {
        let project = this.projectService.project.toJS();

        this.scope.projectId = project.id;
        this.scope.project = project;
        this.scope.$emit('project:loaded', project);
        this.scope.statusList = project.issue_statuses;
        this.scope.statusById = groupBy(project.issue_statuses, x => x.id);
        this.scope.typeById = groupBy(project.issue_types, x => x.id);
        this.scope.typeList = _.sortBy(project.issue_types, "order");
        this.scope.severityList = project.severities;
        this.scope.severityById = groupBy(project.severities, x => x.id);
        this.scope.priorityList = project.priorities;
        this.scope.priorityById = groupBy(project.priorities, x => x.id);
        return project;
    }

    loadIssue() {
        return this.rs.issues.getByRef(this.scope.projectId, this.params.issueref).then(issue => {
            let ctx;
            this.scope.issue = issue;
            this.scope.issueId = issue.id;
            this.scope.commentModel = issue;

            this.modelTransform.setObject(this.scope, 'issue');

            if ((this.scope.issue.neighbors.previous != null ? this.scope.issue.neighbors.previous.ref : undefined) != null) {
                ctx = {
                    project: this.scope.project.slug,
                    ref: this.scope.issue.neighbors.previous.ref
                };
                this.scope.previousUrl = this.navUrls.resolve("project-issues-detail", ctx);
            }

            if ((this.scope.issue.neighbors.next != null ? this.scope.issue.neighbors.next.ref : undefined) != null) {
                ctx = {
                    project: this.scope.project.slug,
                    ref: this.scope.issue.neighbors.next.ref
                };
                return this.scope.nextUrl = this.navUrls.resolve("project-issues-detail", ctx);
            }
        });
    }

    loadInitialData() {
        let project = this.loadProject();

        this.fillUsersAndRoles(project.members, project.roles);

        return this.loadIssue();
    }

    /*
     * Note: This methods (onUpvote() and onDownvote()) are related to tg-vote-button.
     *       See app/modules/components/vote-button for more info
     */
    onUpvote() {
        let onSuccess = () => {
            this.loadIssue();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.issues.upvote(this.scope.issueId).then(onSuccess, onError);
    }

    onDownvote() {
        let onSuccess = () => {
            this.loadIssue();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.issues.downvote(this.scope.issueId).then(onSuccess, onError);
    }

    /*
     * Note: This methods (onWatch() and onUnwatch()) are related to tg-watch-button.
     *       See app/modules/components/watch-button for more info
     */
    onWatch() {
        let onSuccess = () => {
            this.loadIssue();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.issues.watch(this.scope.issueId).then(onSuccess, onError);
    }

    onUnwatch() {
        let onSuccess = () => {
            this.loadIssue();
            return this.rootscope.$broadcast("object:updated");
        };
        let onError = () => {
            return this.confirm.notify("error");
        };

        return this.rs.issues.unwatch(this.scope.issueId).then(onSuccess, onError);
    }
}
IssueDetailController.initClass();

module.controller("IssueDetailController", IssueDetailController);


//############################################################################
//# Issue status display directive
//############################################################################

let IssueStatusDisplayDirective = function($template, $compile){
    // Display if a Issue is open or closed and its issueboard status.
    //
    // Example:
    //     tg-issue-status-display(ng-model="issue")
    //
    // Requirements:
    //   - Issue object (ng-model)
    //   - scope.statusById object

    let template = $template.get("common/components/status-display.html", true);

    let link = function($scope, $el, $attrs) {
        let render = function(issue) {
            let status = $scope.statusById[issue.status];

            let html = template({
                is_closed: status.is_closed,
                status
            });

            html = $compile(html)($scope);

            return $el.html(html);
        };

        $scope.$watch($attrs.ngModel, function(issue) {
            if (issue != null) { return render(issue); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgIssueStatusDisplay", ["$tgTemplate", "$compile", IssueStatusDisplayDirective]);


//############################################################################
//# Issue status button directive
//############################################################################

let IssueStatusButtonDirective = function($rootScope, $repo, $confirm, $loading, $modelTransform, $template, $compile) {
    // Display the status of Issue and you can edit it.
    //
    // Example:
    //     tg-issue-status-button(ng-model="issue")
    //
    // Requirements:
    //   - Issue object (ng-model)
    //   - scope.statusById object
    //   - $scope.project.my_permissions

    let template = $template.get("common/components/status-button.html", true);

    let link = function($scope, $el, $attrs, $model) {
        let status;
        let isEditable = () => $scope.project.my_permissions.indexOf("modify_issue") !== -1;

        let render = issue => {
            status = $scope.statusById[issue.status];

            let html = template({
                status,
                statuses: $scope.statusList,
                editable: isEditable()
            });

            html = $compile(html)($scope);

            return $el.html(html);
        };

        let save = function(statusId) {
            $.fn.popover().closeAll();

            let currentLoading = $loading()
                .target($el)
                .start();

            let transform = $modelTransform.save(function(issue) {
                issue.status = statusId;

                return issue;
            });

            let onSuccess = function() {
                $rootScope.$broadcast("object:updated");
                return currentLoading.finish();
            };

            let onError = function() {
                $confirm.notify("error");
                return currentLoading.finish();
            };

            return transform.then(onSuccess, onError);
        };

        $el.on("click", ".js-edit-status", function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isEditable()) { return; }

            return $el.find(".pop-status").popover().open();
        });

        $el.on("click", ".status", function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isEditable()) { return; }

            let target = angular.element(event.currentTarget);

            return save(target.data("status-id"));
        });

        $scope.$watch(() => $model.$modelValue != null ? $model.$modelValue.status : undefined
        , function() {
            let issue = $model.$modelValue;
            if (issue) { return render(issue); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgIssueStatusButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading", "$tgQueueModelTransformation", "$tgTemplate", "$compile", IssueStatusButtonDirective]);

//############################################################################
//# Issue type button directive
//############################################################################

let IssueTypeButtonDirective = function($rootScope, $repo, $confirm, $loading, $modelTransform, $template, $compile) {
    // Display the type of Issue and you can edit it.
    //
    // Example:
    //     tg-issue-type-button(ng-model="issue")
    //
    // Requirements:
    //   - Issue object (ng-model)
    //   - scope.typeById object
    //   - $scope.project.my_permissions

    let template = $template.get("issue/issue-type-button.html", true);

    let link = function($scope, $el, $attrs, $model) {
        let type;
        let isEditable = () => $scope.project.my_permissions.indexOf("modify_issue") !== -1;

        let render = issue => {
            type = $scope.typeById[issue.type];

            let html = template({
                type,
                typees: $scope.typeList,
                editable: isEditable()
            });

            html = $compile(html)($scope);

            return $el.html(html);
        };

        let save = function(type) {
            $.fn.popover().closeAll();

            let currentLoading = $loading()
                .target($el.find(".level-name"))
                .start();

            let transform = $modelTransform.save(function(issue) {
                issue.type = type;

                return issue;
            });

            let onSuccess = function() {
                $rootScope.$broadcast("object:updated");
                return currentLoading.finish();
            };

            let onError = function() {
                $confirm.notify("error");
                return currentLoading.finish();
            };

            return transform.then(onSuccess, onError);
        };

        $el.on("click", ".type-data", function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isEditable()) { return; }

            return $el.find(".pop-type").popover().open();
        });

        $el.on("click", ".type", function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isEditable()) { return; }

            let target = angular.element(event.currentTarget);
            type = target.data("type-id");
            return save(type);
        });

        $scope.$watch(() => $model.$modelValue != null ? $model.$modelValue.type : undefined
        , function() {
            let issue = $model.$modelValue;
            if (issue) { return render(issue); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgIssueTypeButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading", "$tgQueueModelTransformation", "$tgTemplate", "$compile", IssueTypeButtonDirective]);


//############################################################################
//# Issue severity button directive
//############################################################################

let IssueSeverityButtonDirective = function($rootScope, $repo, $confirm, $loading, $modelTransform, $template, $compile) {
    // Display the severity of Issue and you can edit it.
    //
    // Example:
    //     tg-issue-severity-button(ng-model="issue")
    //
    // Requirements:
    //   - Issue object (ng-model)
    //   - scope.severityById object
    //   - $scope.project.my_permissions

    let template = $template.get("issue/issue-severity-button.html", true);

    let link = function($scope, $el, $attrs, $model) {
        let severity;
        let isEditable = () => $scope.project.my_permissions.indexOf("modify_issue") !== -1;

        let render = issue => {
            severity = $scope.severityById[issue.severity];

            let html = template({
                severity,
                severityes: $scope.severityList,
                editable: isEditable()
            });

            html = $compile(html)($scope);

            return $el.html(html);
        };

        let save = function(severity) {
            $.fn.popover().closeAll();

            let currentLoading = $loading()
                .target($el.find(".level-name"))
                .start();

            let transform = $modelTransform.save(function(issue) {
                issue.severity = severity;

                return issue;
            });

            let onSuccess = function() {
                $rootScope.$broadcast("object:updated");
                return currentLoading.finish();
            };

            let onError = function() {
                $confirm.notify("error");
                return currentLoading.finish();
            };

            return transform.then(onSuccess, onError);
        };

        $el.on("click", ".severity-data", function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isEditable()) { return; }

            return $el.find(".pop-severity").popover().open();
        });

        $el.on("click", ".severity", function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isEditable()) { return; }

            let target = angular.element(event.currentTarget);
            severity = target.data("severity-id");

            return save(severity);
        });

        $scope.$watch(() => $model.$modelValue != null ? $model.$modelValue.severity : undefined
        , function() {
            let issue = $model.$modelValue;
            if (issue) { return render(issue); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgIssueSeverityButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading", "$tgQueueModelTransformation", "$tgTemplate", "$compile", IssueSeverityButtonDirective]);


//############################################################################
//# Issue priority button directive
//############################################################################

let IssuePriorityButtonDirective = function($rootScope, $repo, $confirm, $loading, $modelTransform, $template, $compile) {
    // Display the priority of Issue and you can edit it.
    //
    // Example:
    //     tg-issue-priority-button(ng-model="issue")
    //
    // Requirements:
    //   - Issue object (ng-model)
    //   - scope.priorityById object
    //   - $scope.project.my_permissions

    let template = $template.get("issue/issue-priority-button.html", true);

    let link = function($scope, $el, $attrs, $model) {
        let priority;
        let isEditable = () => $scope.project.my_permissions.indexOf("modify_issue") !== -1;

        let render = issue => {
            priority = $scope.priorityById[issue.priority];

            let html = template({
                priority,
                priorityes: $scope.priorityList,
                editable: isEditable()
            });

            html = $compile(html)($scope);

            return $el.html(html);
        };

        let save = function(priority) {
            $.fn.popover().closeAll();

            let currentLoading = $loading()
                .target($el.find(".level-name"))
                .start();

            let transform = $modelTransform.save(function(issue) {
                issue.priority = priority;

                return issue;
            });

            let onSuccess = function() {
                $rootScope.$broadcast("object:updated");
                return currentLoading.finish();
            };

            let onError = function() {
                $confirm.notify("error");
                return currentLoading.finish();
            };

            return transform.then(onSuccess, onError);
        };

        $el.on("click", ".priority-data", function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isEditable()) { return; }

            return $el.find(".pop-priority").popover().open();
        });

        $el.on("click", ".priority", function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isEditable()) { return; }

            let target = angular.element(event.currentTarget);
            priority = target.data("priority-id");

            return save(priority);
        });

        $scope.$watch(() => $model.$modelValue != null ? $model.$modelValue.priority : undefined
        , function() {
            let issue = $model.$modelValue;
            if (issue) { return render(issue); }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel"
    };
};

module.directive("tgIssuePriorityButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$tgLoading", "$tgQueueModelTransformation", "$tgTemplate", "$compile", IssuePriorityButtonDirective]);


//############################################################################
//# Promote Issue to US button directive
//############################################################################

let PromoteIssueToUsButtonDirective = function($rootScope, $repo, $confirm, $translate) {
    let link = function($scope, $el, $attrs, $model) {

        let save = (issue, askResponse) => {
            let data = {
                generated_from_issue: issue.id,
                project: issue.project,
                subject: issue.subject,
                description: issue.description,
                tags: issue.tags,
                is_blocked: issue.is_blocked,
                blocked_note: issue.blocked_note
            };

            let onSuccess = function() {
                askResponse.finish();
                $confirm.notify("success");
                return $rootScope.$broadcast("promote-issue-to-us:success");
            };

            let onError = function() {
                askResponse.finish();
                return $confirm.notify("error");
            };

            return $repo.create("userstories", data).then(onSuccess, onError);
        };

        $el.on("click", "a", function(event) {
            event.preventDefault();
            let issue = $model.$modelValue;

            let title = $translate.instant("ISSUES.CONFIRM_PROMOTE.TITLE");
            let message = $translate.instant("ISSUES.CONFIRM_PROMOTE.MESSAGE");
            let subtitle = issue.subject;

            return $confirm.ask(title, subtitle, message).then(response => {
                return save(issue, response);
            });
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        restrict: "AE",
        require: "ngModel",
        templateUrl: "issue/promote-issue-to-us-button.html",
        link
    };
};

module.directive("tgPromoteIssueToUsButton", ["$rootScope", "$tgRepo", "$tgConfirm", "$translate",
                                              PromoteIssueToUsButtonDirective]);
