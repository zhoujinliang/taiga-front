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

import {mixOf, bindMethods} from "../../utils"
import {Controller} from "../../classes"
import {PageMixin, FiltersMixin} from "../controllerMixins"
import * as angular from "angular"
import * as _ from "lodash"

let module = angular.module("taigaAdmin");


//############################################################################
//# Project Memberships Controller
//############################################################################

class MembershipsController extends mixOf(Controller, PageMixin, FiltersMixin) {
    scope: angular.IScope
    rootscope: angular.IScope
    repo:any
    confirm:any
    rs:any
    params:any
    q:any
    location:any
    navUrls:any
    analytics:any
    appMetaService:any
    translate:any
    auth:any
    lightboxFactory:any
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
            "$tgNavUrls",
            "$tgAnalytics",
            "tgAppMetaService",
            "$translate",
            "$tgAuth",
            "tgLightboxFactory",
            "tgErrorHandlingService",
            "tgProjectService"
        ];
    }

    constructor(scope, rootscope, repo, confirm, rs, params, q, location, navUrls, analytics,
                  appMetaService, translate, auth, lightboxFactory, errorHandlingService, projectService) {
        super()
        this.scope = scope;
        this.rootscope = rootscope;
        this.repo = repo;
        this.confirm = confirm;
        this.rs = rs;
        this.params = params;
        this.q = q;
        this.location = location;
        this.navUrls = navUrls;
        this.analytics = analytics;
        this.appMetaService = appMetaService;
        this.translate = translate;
        this.auth = auth;
        this.lightboxFactory = lightboxFactory;
        this.errorHandlingService = errorHandlingService;
        this.projectService = projectService;
        bindMethods(this);

        this.scope.project = {};
        this.scope.filters = {};

        let promise = this.loadInitialData();

        promise.then(() => {
           let title = this.translate.instant("ADMIN.MEMBERSHIPS.PAGE_TITLE", {projectName:  this.scope.project.name});
           let { description } = this.scope.project;
           return this.appMetaService.setAll(title, description);
        });

        promise.then(null, this.onInitialDataError.bind(this));

        this.scope.$on("membersform:new:success", () => {
            this.loadInitialData();
            return this.analytics.trackEvent("membership", "create", "create memberships on admin", 1);
        });
    }

    loadProject() {
        let project = this.projectService.project.toJS();

        if (!project.i_am_admin) {
            this.errorHandlingService.permissionDenied();
        }

        this.scope.projectId = project.id;
        this.scope.project = project;

        this.scope.canAddUsers = (project.max_memberships === null) || (project.max_memberships > project.total_memberships);

        this.scope.$emit('project:loaded', project);
        return project;
    }

    loadMembers() {
        let httpFilters = this.getUrlFilters();

        return this.rs.memberships.list(this.scope.projectId, httpFilters).then(data => {
            this.scope.memberships = _.filter(data.models, membership => (membership.user === null) || membership.is_user_active);

            this.scope.page = data.current;
            this.scope.count = data.count;
            this.scope.paginatedBy = data.paginatedBy;
            return data;
        });
    }

    loadInitialData() {
        this.loadProject();

        return this.q.all([
            this.loadMembers(),
            this.auth.refresh()
        ]);
    }

    getUrlFilters() {
        let filters = _.pick(this.location.search(), "page");
        if (!filters.page) { filters.page = 1; }
        return filters;
    }

    // Actions

    addNewMembers() {
        return this.lightboxFactory.create(
            'tg-lb-add-members',
            {
                "class": "lightbox lightbox-add-member",
                "project": "project"
            },
            {
                "project": this.scope.project
            }
        );
    }

    showLimitUsersWarningMessage() {
        let title = this.translate.instant("ADMIN.MEMBERSHIPS.LIMIT_USERS_WARNING");
        let message = this.translate.instant("ADMIN.MEMBERSHIPS.LIMIT_USERS_WARNING_MESSAGE", {
            members: this.scope.project.max_memberships
        });
        let icon = `/${(<any>window)._version}/svg/icons/team-question.svg`;
        return this.confirm.success(title, message, {
            name: icon,
            type: "img"
        });
    }
}
MembershipsController.initClass();

module.controller("MembershipsController", MembershipsController);


//############################################################################
//# Member Avatar Directive
//############################################################################

let MembershipsDirective = function($template, $compile) {
    let template = $template.get("admin/admin-membership-paginator.html", true);

    let linkPagination = function($scope, $el, $attrs, $ctrl) {
        // Constants
        let afterCurrent = 2;
        let beforeCurrent = 4;
        let atBegin = 2;
        let atEnd = 2;

        let $pagEl = $el.find(".memberships-paginator");

        let getNumPages = function() {
            let numPages = $scope.count / $scope.paginatedBy;
            if (parseInt(numPages, 10) < numPages) {
                numPages = parseInt(numPages, 10) + 1;
            } else {
                numPages = parseInt(numPages, 10);
            }

            return numPages;
        };

        let renderPagination = function() {
            let numPages = getNumPages();

            if (numPages <= 1) {
                $pagEl.hide();
                return;
            }

            let pages = [];
            let options:any = {};
            options.pages = pages;
            options.showPrevious = ($scope.page > 1);
            options.showNext = !($scope.page === numPages);

            let cpage = $scope.page;

            for (let i = 1, end = numPages, asc = 1 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
                if ((i === (cpage + afterCurrent)) && (numPages > (cpage + afterCurrent + atEnd))) {
                    pages.push({classes: "dots", type: "dots"});
                } else if ((i === (cpage - beforeCurrent)) && (cpage > (atBegin + beforeCurrent))) {
                    pages.push({classes: "dots", type: "dots"});
                } else if ((i > (cpage + afterCurrent)) && (i <= (numPages - atEnd))) {
                } else if ((i < (cpage - beforeCurrent)) && (i > atBegin)) {
                } else if (i === cpage) {
                    pages.push({classes: "active", num: i, type: "page-active"});
                } else {
                    pages.push({classes: "page", num: i, type: "page"});
                }
            }

            let html = template(options);
            html = $compile(html)($scope);

            $pagEl.html(html);
            return $pagEl.show();
        };

        $scope.$watch("memberships", function(value) {
            // Do nothing if value is not logical true
            if (!value) { return; }

            return renderPagination();
        });

        $el.on("click", ".memberships-paginator a.next", function(event) {
            event.preventDefault();

            return $scope.$apply(function() {
                $ctrl.selectFilter("page", $scope.page + 1);
                return $ctrl.loadMembers();
            });
        });

        $el.on("click", ".memberships-paginator a.previous", function(event) {
            event.preventDefault();
            return $scope.$apply(function() {
                $ctrl.selectFilter("page", $scope.page - 1);
                return $ctrl.loadMembers();
            });
        });

        return $el.on("click", ".memberships-paginator li.page > a", function(event) {
            event.preventDefault();
            let target = angular.element(event.currentTarget);
            let pagenum = target.data("pagenum");

            return $scope.$apply(function() {
                $ctrl.selectFilter("page", pagenum);
                return $ctrl.loadMembers();
            });
        });
    };


    let link = function($scope, $el, $attrs) {
        let $ctrl = $el.controller();
        linkPagination($scope, $el, $attrs, $ctrl);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgMemberships", ["$tgTemplate", "$compile", MembershipsDirective]);


//############################################################################
//# Member Avatar Directive
//############################################################################

let MembershipsRowAvatarDirective = function($log, $template, $translate, $compile, avatarService) {
    let template = $template.get("admin/memberships-row-avatar.html", true);

    let link = function($scope, $el, $attrs) {
        let pending = $translate.instant("ADMIN.MEMBERSHIP.STATUS_PENDING");
        let render = function(member) {
            let avatar = avatarService.getAvatar(member);

            let ctx = {
                full_name: member.full_name ? member.full_name : "",
                email: member.user_email ? member.user_email : member.email,
                imgurl: avatar.url,
                bg: avatar.bg,
                pending: !member.is_user_active ? pending : "",
                isOwner: member.is_owner
            };

            let html = template(ctx);
            html = $compile(html)($scope);

            return $el.html(html);
        };

        if (($attrs.tgMembershipsRowAvatar == null)) {
            return $log.error("MembershipsRowAvatarDirective: the directive need a member");
        }

        let member = $scope.$eval($attrs.tgMembershipsRowAvatar);
        render(member);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};


module.directive("tgMembershipsRowAvatar", ["$log", "$tgTemplate", '$translate', "$compile", "tgAvatarService", MembershipsRowAvatarDirective]);


//############################################################################
//# Member IsAdminCheckbox Directive
//############################################################################

let MembershipsRowAdminCheckboxDirective = function($log, $repo, $confirm, $template, $compile) {
    let template = $template.get("admin/admin-memberships-row-checkbox.html", true);

    let link = function($scope, $el, $attrs) {
        $scope.$on("$destroy", () => $el.off());

        if (($attrs.tgMembershipsRowAdminCheckbox == null)) {
            return $log.error("MembershipsRowAdminCheckboxDirective: the directive need a member");
        }

        let member = $scope.$eval($attrs.tgMembershipsRowAdminCheckbox);

        if (member.is_owner) {
            $el.find(".js-check").remove();
            return;
        }

        let render = function(member) {
            let ctx = {inputId: `is-admin-${member.id}`};

            let html = template(ctx);
            html = $compile(html)($scope);

            return $el.html(html);
        };

        $el.on("click", ":checkbox", event => {
            let onSuccess = () => $confirm.notify("success");

            let onError = function(data) {
                member.revert();
                $el.find(":checkbox").prop("checked", member.is_admin);
                return $confirm.notify("error", data.is_admin[0]);
            };

            let target = angular.element(event.currentTarget);
            member.is_admin = target.prop("checked");
            return $repo.save(member).then(onSuccess, onError);
        });

        let html = render(member);

        if (member.is_admin) {
            return $el.find(":checkbox").prop("checked", true);
        }
    };

    return {link};
};


module.directive("tgMembershipsRowAdminCheckbox", ["$log", "$tgRepo", "$tgConfirm",
    "$tgTemplate", "$compile", MembershipsRowAdminCheckboxDirective]);


//############################################################################
//# Member RoleSelector Directive
//############################################################################

let MembershipsRowRoleSelectorDirective = function($log, $repo, $confirm) {
    let template = _.template(`\
<select>
    <% _.each(roleList, function(role) { %>
    <option value="<%- role.id %>" <% if(selectedRole === role.id){ %>selected="selected"<% } %>>
        <%- role.name %>
    </option>
    <% }); %>
</select>\
`);

    let link = function($scope, $el, $attrs) {
        let render = function(member) {
            let ctx = {
                roleList: $scope.project.roles,
                selectedRole: member.role
            };

            let html = template(ctx);
            return $el.html(html);
        };

        if (($attrs.tgMembershipsRowRoleSelector == null)) {
            return $log.error("MembershipsRowRoleSelectorDirective: the directive need a member");
        }

        let $ctrl = $el.controller();
        let member = $scope.$eval($attrs.tgMembershipsRowRoleSelector);
        let html = render(member);

        $el.on("change", "select", event => {
            let onSuccess = () => $confirm.notify("success");

            let onError = () => $confirm.notify("error");

            let target = angular.element(event.currentTarget);
            let newRole = parseInt(target.val(), 10);

            if (member.role !== newRole) {
                member.role = newRole;
                return $repo.save(member).then(onSuccess, onError);
            }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};


module.directive("tgMembershipsRowRoleSelector", ["$log", "$tgRepo", "$tgConfirm",
                                                  MembershipsRowRoleSelectorDirective]);


//############################################################################
//# Member Actions Directive
//############################################################################

let MembershipsRowActionsDirective = function($log, $repo, $rs, $confirm, $compile, $translate, $location,
                                  $navUrls, lightboxFactory, projectService) {
    let activedTemplate = `\
<div class="active"
     translate="ADMIN.MEMBERSHIP.STATUS_ACTIVE">
</div>
<a class="delete" href=""
   title="{{ 'ADMIN.MEMBERSHIP.DELETE_MEMBER' | translate }}">
    <tg-svg svg-icon="icon-trash"></tg-svg>
</a>\
`;

    let pendingTemplate = `\
<a class="resend js-resend" href=""
   title="{{ 'ADMIN.MEMBERSHIP.RESEND' | translate }}"
   translate="ADMIN.MEMBERSHIP.RESEND">
</a>
<a class="delete" href=""
   title="{{ 'ADMIN.MEMBERSHIP.DELETE_MEMBER' | translate }}">
    <tg-svg svg-icon="icon-trash"></tg-svg>
</a>\
`;

    let link = function($scope, $el, $attrs) {
        let render = function(member) {
            let html;
            if (member.user) {
                html = $compile(activedTemplate)($scope);
            } else {
                html = $compile(pendingTemplate)($scope);
            }

            return $el.html(html);
        };

        if (($attrs.tgMembershipsRowActions == null)) {
            return $log.error("MembershipsRowActionsDirective: the directive need a member");
        }

        let $ctrl = $el.controller();
        let member = $scope.$eval($attrs.tgMembershipsRowActions);
        render(member);

        $el.on("click", ".js-resend", function(event) {
            event.preventDefault();
            let onSuccess = function() {
                let text = $translate.instant("ADMIN.MEMBERSHIP.SUCCESS_SEND_INVITATION", {
                    email: $scope.member.email
                });
                return $confirm.notify("success", text);
            };
            let onError = function() {
                let text = $translate.instant("ADMIM.MEMBERSHIP.ERROR_SEND_INVITATION");
                return $confirm.notify("error", text);
            };

            return $rs.memberships.resendInvitation($scope.member.id).then(onSuccess, onError);
        });

        let leaveConfirm = function() {
            let title = $translate.instant("ADMIN.MEMBERSHIP.DELETE_MEMBER");
            let defaultMsg = $translate.instant("ADMIN.MEMBERSHIP.DEFAULT_DELETE_MESSAGE", {email: member.email});
            let message = member.user ? member.full_name : defaultMsg;

            return $confirm.askOnDelete(title, message).then(function(askResponse) {
                let text;
                let onSuccess = () => {
                    askResponse.finish();
                    if (member.user !== $scope.user.id) {
                        if (($scope.page > 1) && (($scope.count - 1) <= $scope.paginatedBy)) {
                            $ctrl.selectFilter("page", $scope.page - 1);
                        }

                        projectService.fetchProject().then(() => {
                            return $ctrl.loadInitialData();
                        });
                    } else {
                        $location.path($navUrls.resolve("home"));
                    }

                    text = $translate.instant("ADMIN.MEMBERSHIP.SUCCESS_DELETE", {message});
                    return $confirm.notify("success", text, null, 5000);
                };

                let onError = () => {
                    askResponse.finish(false);

                    text = $translate.instant("ADMIN.MEMBERSHIP.ERROR_DELETE", {message});
                    return $confirm.notify("error", text);
                };

                return $repo.remove(member).then(onSuccess, onError);
            });
        };

        $el.on("click", ".delete", function(event) {
            event.preventDefault();

            if ($scope.project.owner.id === member.user) {
                let isCurrentUser = $scope.user.id === member.user;

                return lightboxFactory.create("tg-lightbox-leave-project-warning", {
                    class: "lightbox lightbox-leave-project-warning"
                }, {
                    isCurrentUser,
                    project: $scope.project
                });
            } else {
                return leaveConfirm();
            }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgMembershipsRowActions", ["$log", "$tgRepo", "$tgResources", "$tgConfirm", "$compile",
                                             "$translate", "$tgLocation", "$tgNavUrls", "tgLightboxFactory",
                                             "tgProjectService", MembershipsRowActionsDirective]);


//############################################################################
//# No more memberships explanation directive
//############################################################################

let NoMoreMembershipsExplanationDirective = () =>
    ({
          templateUrl: "admin/no-more-memberships-explanation.html",
          scope: {
              project: "="
          }
    })
;

module.directive("tgNoMoreMembershipsExplanation", [NoMoreMembershipsExplanationDirective]);
