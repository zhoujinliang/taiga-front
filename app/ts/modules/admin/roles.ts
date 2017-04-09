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
 * File: modules/admin/memberships.coffee
 */

import {bindOnce, debounce, bindMethods} from "../../utils"
import {FiltersMixin} from "../controllerMixins"

import * as angular from "angular"
import * as _ from "lodash"

//############################################################################
//# Project Roles Controller
//############################################################################

export class RolesController extends FiltersMixin {
    scope: angular.IScope
    rootscope: angular.IScope
    repo:any
    confirm:any
    rs:any
    params:any
    q:any
    location:any
    navUrls:any
    model:any
    appMetaService:any
    translate:any
    errorHandlingService:any
    projectService:any
    toggleComputable:any

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
            "$tgModel",
            "tgAppMetaService",
            "$translate",
            "tgErrorHandlingService",
            "tgProjectService"
        ];

        this.prototype.toggleComputable = debounce(2000, function() {
            if (!this.scope.role.computable) {
                return this._disableComputable();
            } else {
                return this._enableComputable();
            }
        });
    }

    constructor(scope, rootscope, repo, confirm, rs, params, q, location, navUrls,
                  model, appMetaService, translate, errorHandlingService, projectService) {
        super()
        this._enableComputable = this._enableComputable.bind(this);
        this._disableComputable = this._disableComputable.bind(this);
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.params = params;
        this.q = q;
        this.location = location;
        this.navUrls = navUrls;
        this.model = model;
        this.appMetaService = appMetaService;
        this.translate = translate;
        this.errorHandlingService = errorHandlingService;
        this.projectService = projectService;
        bindMethods(this);

        this.scope.sectionName = "ADMIN.MENU.PERMISSIONS";
        this.scope.project = {};
        this.scope.anyComputableRole = true;

        let promise = this.loadInitialData();

        promise.then(() => {
            let title = this.translate.instant("ADMIN.ROLES.PAGE_TITLE", {projectName: this.scope.project.name});
            let { description } = this.scope.project;
            return this.appMetaService.setAll(title, description);
        });

        promise.then(null, this.onInitialDataError.bind(this));
    }

    loadProject() {
        let project = this.projectService.project.toJS();
        project = this.model.make_model("projects", project);

        if (!project.i_am_admin) {
            this.errorHandlingService.permissionDenied();
        }

        this.scope.projectId = project.id;
        this.scope.project = project;

        this.scope.$emit('project:loaded', project);
        this.scope.anyComputableRole = _.some(_.map(project.roles, (point:any) => point.computable));

        return project;
    }

    loadRoles() {
        return this.rs.roles.list(this.scope.projectId).then(roles => {
            roles = roles.map(function(role) {
                role.external_user = false;

                return role;
            });

            let public_permission = {
                "name": this.translate.instant("ADMIN.ROLES.EXTERNAL_USER"),
                "permissions": this.scope.project.public_permissions,
                "external_user": true
            };

            roles.push(public_permission);

            this.scope.roles = roles;
            this.scope.role = this.scope.roles[0];

            return roles;
        });
    }

    loadInitialData() {
        this.loadProject();
        return this.loadRoles();
    }

    forceLoadProject() {
        return this.projectService.fetchProject(() => {
            return this.loadProject();
        });
    }

    setRole(role) {
        this.scope.role = role;
        return this.scope.$broadcast("role:changed", this.scope.role);
    }

    delete() {
        let choices = {};
        for (let role of this.scope.roles) {
            if (role.id !== this.scope.role.id) {
                choices[role.id] = role.name;
            }
        }

        if (_.keys(choices).length === 0) {
            return this.confirm.error(this.translate.instant("ADMIN.ROLES.ERROR_DELETE_ALL"));
        }

        let title = this.translate.instant("ADMIN.ROLES.TITLE_DELETE_ROLE");
        let subtitle = this.scope.role.name;
        let replacement = this.translate.instant("ADMIN.ROLES.REPLACEMENT_ROLE");
        let warning = this.translate.instant("ADMIN.ROLES.WARNING_DELETE_ROLE");
        return this.confirm.askChoice(title, subtitle, choices, replacement, warning).then(response => {
            let onSuccess = () => {
                this.forceLoadProject();
                return this.loadRoles().finally(() => {
                    return response.finish();
                });
            };
            let onError = () => {
                return this.confirm.notify('error');
            };

            return this.repo.remove(this.scope.role, {moveTo: response.selected}).then(onSuccess, onError);
        });
    }

    _enableComputable() {
        let onSuccess = () => {
            this.confirm.notify("success");
            return this.forceLoadProject();
        };

        let onError = () => {
            this.confirm.notify("error");
            return this.scope.role.revert();
        };

        return this.repo.save(this.scope.role).then(onSuccess, onError);
    }

    _disableComputable() {
        let askOnSuccess = response => {
            let onSuccess = () => {
                response.finish();
                this.confirm.notify("success");
                return this.forceLoadProject();
            };
            let onError = () => {
                response.finish();
                this.confirm.notify("error");
                return this.scope.role.revert();
            };
            return this.repo.save(this.scope.role).then(onSuccess, onError);
        };

        let askOnError = response => {
            return this.scope.role.revert();
        };

        let title = this.translate.instant("ADMIN.ROLES.DISABLE_COMPUTABLE_ALERT_TITLE");
        let subtitle = this.translate.instant("ADMIN.ROLES.DISABLE_COMPUTABLE_ALERT_SUBTITLE", {
            roleName: this.scope.role.name
        });
        return this.confirm.ask(title, subtitle, "").then(askOnSuccess, askOnError);
    }
}
RolesController.initClass();

export let EditRoleDirective = function($repo, $confirm) {
    let link = function($scope, $el, $attrs) {
        let toggleView = function() {
            $el.find('.total').toggle();
            return $el.find('.edit-role').toggle();
        };

        let submit = function() {
            $scope.role.name = $el.find("input").val();

            let promise = $repo.save($scope.role);

            promise.then(() => $confirm.notify("success"));

            promise.then(null, data => $confirm.notify("error"));

            return toggleView();
        };

        $el.on("click", ".edit-value", function() {
            toggleView();
            $el.find("input").focus();
            return $el.find("input").val($scope.role.name);
        });

        $el.on("click", "a.save", submit);

        $el.on("keyup", "input", function(event) {
            if (event.keyCode === 13) {  // Enter key
                return submit();
            } else if (event.keyCode === 27) {  // ESC key
                return toggleView();
            }
        });

        $scope.$on("role:changed", function() {
            if ($el.find('.edit-role').is(":visible")) {
                return toggleView();
            }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

export let RolesDirective =  function() {
    let link = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

export let NewRoleDirective = function($tgrepo, $confirm) {
    let DEFAULT_PERMISSIONS = ["view_project", "view_milestones", "view_us", "view_tasks", "view_issues"];

    let link = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();

        $scope.$on("$destroy", () => $el.off());

        $el.on("click", "a.add-button", function(event) {
            event.preventDefault();
            $el.find(".new").removeClass("hidden");
            $el.find(".new").focus();
            return $el.find(".add-button").hide();
        });

        return $el.on("keyup", ".new", function(event) {
            let target;
            event.preventDefault();
            if (event.keyCode === 13) {  // Enter key
                target = angular.element(event.currentTarget);
                let newRole = {
                    project: $scope.projectId,
                    name: target.val(),
                    permissions: DEFAULT_PERMISSIONS,
                    order: _.maxBy($scope.roles, (r:any) => r.order).order + 1,
                    computable: false
                };

                $el.find(".new").addClass("hidden");
                $el.find(".new").val('');

                let onSuccess = function(role) {
                    let insertPosition = $scope.roles.length - 1;
                    $scope.roles.splice(insertPosition, 0, role);
                    $ctrl.setRole(role);
                    $el.find(".add-button").show();
                    return $ctrl.forceLoadProject();
                };

                let onError = () => $confirm.notify("error");

                return $tgrepo.create("roles", newRole).then(onSuccess, onError);

            } else if (event.keyCode === 27) {  // ESC key
                target = angular.element(event.currentTarget);
                $el.find(".new").addClass("hidden");
                $el.find(".new").val('');
                return $el.find(".add-button").show();
            }
        });
    };

    return {link};
};


// Use category-config.scss styles
export let RolePermissionsDirective = function($rootscope, $repo, $confirm, $compile) {
    let resumeTemplate = _.template(`\
<div class="resume-title" translate="<%- category.name %>"></div>
<div class="summary-role">
    <div class="count"><%- category.activePermissions %>/<%- category.permissions.length %></div>
    <% _.each(category.permissions, function(permission) { %>
        <div class="role-summary-single <% if(permission.active) { %>active<% } %>"
             title="{{ '<%- permission.name %>' | translate }}"></div>
    <% }) %>
</div>
<tg-svg svg-icon="icon-arrow-right"></tg-svg>\
`);

    let categoryTemplate = _.template(`\
<div class="category-config" data-id="<%- index %>">
    <div class="resume">
    </div>
    <div class="category-items">
        <div class="items-container">
        <% _.each(category.permissions, function(permission) { %>
            <div class="category-item" data-id="<%- permission.key %>">
                <span translate="<%- permission.name %>"></span>
                <div class="check">
                    <input type="checkbox"
                           <% if(!permission.editable) { %> disabled="disabled" <% } %>
                           <% if(permission.active) { %> checked="checked" <% } %>/>
                    <div></div>
                    <span class="check-text check-yes" translate="COMMON.YES"></span>
                    <span class="check-text check-no" translate="COMMON.NO"></span>
                </div>
            </div>
        <% }) %>
        </div>
    </div>
</div>\
`);

    let baseTemplate = _.template(`\
<div class="category-config-list"></div>\
`);

    let link = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();

        let generateCategoriesFromRole = function(role) {
            let setActivePermissions = permissions => _.map(permissions, x => _.extend({}, x, {active: role.permissions.includes(x["key"])}));

            let isPermissionEditable = function(permission, role, project) {
                if (role.external_user &&
                   !project.is_private &&
                   (permission.key.indexOf("view_") === 0)) {
                    return false;
                } else {
                    return true;
                }
            };

            let setActivePermissionsPerCategory = category =>
                _.map(category, function(cat:any) {
                    cat.permissions = cat.permissions.map(function(permission) {
                        permission.editable = isPermissionEditable(permission, role, $scope.project);

                        return permission;
                    });

                    return _.extend({}, cat, {
                        activePermissions: _.filter(cat["permissions"], "active").length
                    });
                })
            ;

            let categories = [];

            let epicPermissions = [
                { key: "view_epics", name: "COMMON.PERMISIONS_CATEGORIES.EPICS.VIEW_EPICS"},
                { key: "add_epic", name: "COMMON.PERMISIONS_CATEGORIES.EPICS.ADD_EPICS"},
                { key: "modify_epic", name: "COMMON.PERMISIONS_CATEGORIES.EPICS.MODIFY_EPICS"},
                { key: "comment_epic", name: "COMMON.PERMISIONS_CATEGORIES.EPICS.COMMENT_EPICS"},
                { key: "delete_epic", name: "COMMON.PERMISIONS_CATEGORIES.EPICS.DELETE_EPICS"}
            ];
            categories.push({
                name: "COMMON.PERMISIONS_CATEGORIES.EPICS.NAME" ,
                permissions: setActivePermissions(epicPermissions)
            });

            let milestonePermissions = [
                { key: "view_milestones", name: "COMMON.PERMISIONS_CATEGORIES.SPRINTS.VIEW_SPRINTS"},
                { key: "add_milestone", name: "COMMON.PERMISIONS_CATEGORIES.SPRINTS.ADD_SPRINTS"},
                { key: "modify_milestone", name: "COMMON.PERMISIONS_CATEGORIES.SPRINTS.MODIFY_SPRINTS"},
                { key: "delete_milestone", name: "COMMON.PERMISIONS_CATEGORIES.SPRINTS.DELETE_SPRINTS"}
            ];
            categories.push({
                name: "COMMON.PERMISIONS_CATEGORIES.SPRINTS.NAME",
                permissions: setActivePermissions(milestonePermissions)
            });

            let userStoryPermissions = [
                { key: "view_us", name: "COMMON.PERMISIONS_CATEGORIES.USER_STORIES.VIEW_USER_STORIES"},
                { key: "add_us", name: "COMMON.PERMISIONS_CATEGORIES.USER_STORIES.ADD_USER_STORIES"},
                { key: "modify_us", name: "COMMON.PERMISIONS_CATEGORIES.USER_STORIES.MODIFY_USER_STORIES"},
                { key: "comment_us", name: "COMMON.PERMISIONS_CATEGORIES.USER_STORIES.COMMENT_USER_STORIES"},
                { key: "delete_us", name: "COMMON.PERMISIONS_CATEGORIES.USER_STORIES.DELETE_USER_STORIES"}
            ];
            categories.push({
                name: "COMMON.PERMISIONS_CATEGORIES.USER_STORIES.NAME",
                permissions: setActivePermissions(userStoryPermissions)
            });

            let taskPermissions = [
                { key: "view_tasks", name: "COMMON.PERMISIONS_CATEGORIES.TASKS.VIEW_TASKS"},
                { key: "add_task", name: "COMMON.PERMISIONS_CATEGORIES.TASKS.ADD_TASKS"},
                { key: "modify_task", name: "COMMON.PERMISIONS_CATEGORIES.TASKS.MODIFY_TASKS"},
                { key: "comment_task", name: "COMMON.PERMISIONS_CATEGORIES.TASKS.COMMENT_TASKS"},
                { key: "delete_task", name: "COMMON.PERMISIONS_CATEGORIES.TASKS.DELETE_TASKS"}
            ];
            categories.push({
                name: "COMMON.PERMISIONS_CATEGORIES.TASKS.NAME" ,
                permissions: setActivePermissions(taskPermissions)
            });

            let issuePermissions = [
                { key: "view_issues", name: "COMMON.PERMISIONS_CATEGORIES.ISSUES.VIEW_ISSUES"},
                { key: "add_issue", name: "COMMON.PERMISIONS_CATEGORIES.ISSUES.ADD_ISSUES"},
                { key: "modify_issue", name: "COMMON.PERMISIONS_CATEGORIES.ISSUES.MODIFY_ISSUES"},
                { key: "comment_issue", name: "COMMON.PERMISIONS_CATEGORIES.ISSUES.COMMENT_ISSUES"},
                { key: "delete_issue", name: "COMMON.PERMISIONS_CATEGORIES.ISSUES.DELETE_ISSUES"}
            ];
            categories.push({
                name: "COMMON.PERMISIONS_CATEGORIES.ISSUES.NAME",
                permissions: setActivePermissions(issuePermissions)
            });

            let wikiPermissions = [
                { key: "view_wiki_pages", name: "COMMON.PERMISIONS_CATEGORIES.WIKI.VIEW_WIKI_PAGES"},
                { key: "add_wiki_page", name: "COMMON.PERMISIONS_CATEGORIES.WIKI.ADD_WIKI_PAGES"},
                { key: "modify_wiki_page", name: "COMMON.PERMISIONS_CATEGORIES.WIKI.MODIFY_WIKI_PAGES"},
                { key: "delete_wiki_page", name: "COMMON.PERMISIONS_CATEGORIES.WIKI.DELETE_WIKI_PAGES"},
                { key: "view_wiki_links", name: "COMMON.PERMISIONS_CATEGORIES.WIKI.VIEW_WIKI_LINKS"},
                { key: "add_wiki_link", name: "COMMON.PERMISIONS_CATEGORIES.WIKI.ADD_WIKI_LINKS"},
                { key: "delete_wiki_link", name: "COMMON.PERMISIONS_CATEGORIES.WIKI.DELETE_WIKI_LINKS"}
            ];
            categories.push({
                name: "COMMON.PERMISIONS_CATEGORIES.WIKI.NAME",
                permissions: setActivePermissions(wikiPermissions)
            });

            return setActivePermissionsPerCategory(categories);
        };

        let renderResume = (element, category) => element.find(".resume").html($compile(resumeTemplate({category}))($scope));

        let renderCategory = function(category, index) {
            let html:any = categoryTemplate({category, index});
            html = angular.element(html);
            renderResume(html, category);
            return $compile(html)($scope);
        };

        let renderPermissions = function() {
            $el.off();
            let html:any = baseTemplate();
            _.each(generateCategoriesFromRole($scope.role), (category, index) => html = angular.element(html).append(renderCategory(category, index)));

            $el.html(html);
            $el.on("click", ".resume", function(event) {
                event.preventDefault();
                let target = angular.element(event.currentTarget);
                target.toggleClass("open-drawer");
                return target.next().toggleClass("open");
            });

            return $el.on("change", ".category-item input", function(event) {
                let getActivePermissions = function() {
                    let activePermissions = _.filter($el.find(".category-item input"), t => angular.element(t).is(":checked"));
                    activePermissions = _.sortBy(_.map(activePermissions, function(t) {
                        let permission;
                        return permission = angular.element(t).parents(".category-item").data("id");
                    }));

                    if (activePermissions.length) {
                        activePermissions.push("view_project");
                    }

                    return activePermissions;
                };

                let target = angular.element(event.currentTarget);

                $scope.role.permissions = getActivePermissions();

                let onSuccess = function() {
                    let categories = generateCategoriesFromRole($scope.role);
                    let categoryId = target.parents(".category-config").data("id");
                    renderResume(target.parents(".category-config"), categories[categoryId]);
                    $rootscope.$broadcast("projects:reload");
                    $confirm.notify("success");
                    return $ctrl.forceLoadProject();
                };

                let onError = function() {
                    $confirm.notify("error");
                    target.prop("checked", !target.prop("checked"));
                    return $scope.role.permissions = getActivePermissions();
                };

                if ($scope.role.external_user) {
                    $scope.project.public_permissions = $scope.role.permissions;
                    $scope.project.anon_permissions = $scope.role.permissions.filter(permission => permission.indexOf("view_") === 0);

                    return $repo.save($scope.project).then(onSuccess, onError);
                } else {
                    return $repo.save($scope.role).then(onSuccess, onError);
                }
            });
        };

        $scope.$on("$destroy", () => $el.off());

        $scope.$on("role:changed", () => renderPermissions());

        return bindOnce($scope, $attrs.ngModel, renderPermissions);
    };

    return {link};
};
