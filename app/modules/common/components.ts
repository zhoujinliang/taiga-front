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
 * File: modules/common/components.coffee
 */

import {Component, Input, OnChanges} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import * as angular from "angular";
import * as _ from "lodash";
import * as moment from "moment";
import * as Pikaday from "pikaday";
import {bindOnce} from "../../libs/utils";

//############################################################################
//# Date Range Directive (used mainly for sprint date range)
//############################################################################

@Component({
    selector: "tg-date-range",
    template: "<span>{{formatedRange}}</span>",
})
export class DateRange implements OnChanges {
    @Input() first: string;
    @Input() second: string;
    formatedRange: string;

    constructor(private translate: TranslateService) {}

    ngOnChanges() {
        const prettyDate = this.translate.instant("BACKLOG.SPRINTS.DATE");
        const initDate = moment(this.first).format(prettyDate);
        const endDate = moment(this.second).format(prettyDate);
        this.formatedRange = `${initDate}-${endDate}`;
    }
}

//############################################################################
//# Date Selector Directive (using pikaday)
//############################################################################

export let DateSelectorDirective = function($rootscope, datePickerConfigService) {
    const link = function($scope, $el, $attrs, $model) {
        const selectedDate = null;

        const initialize = function() {
            const datePickerConfig = datePickerConfigService.get();

            _.merge(datePickerConfig, {
                field: $el[0],
            });

            return $el.picker = new Pikaday(datePickerConfig);
        };

        const unbind = $rootscope.$on("$translateChangeEnd", (ctx) => {
            if ($el.picker) { $el.picker.destroy(); }
            return initialize();
        });

        $attrs.$observe("pickerValue", function(val) {
            $el.val(val);

            if (val != null) {
                if ($el.picker) { $el.picker.destroy(); }
                initialize();
            }

            return $el.picker.setDate(val);
        });

        return $scope.$on("$destroy", function() {
            $el.off();
            unbind();
            return $el.picker.destroy();
        });
    };

    return {
        link,
    };
};

//############################################################################
//# Sprint Progress Bar Directive
//############################################################################

export let SprintProgressBarDirective = function() {
    const renderProgress = function($el, percentage, visual_percentage) {
        if ($el.hasClass(".current-progress")) {
            return $el.css("width", `${percentage}%`);
        } else {
            $el.find(".current-progress").css("width", `${visual_percentage}%`);
            return $el.find(".number").html(`${percentage} %`);
        }
    };

    const link = function($scope, $el, $attrs) {
        bindOnce($scope, $attrs.tgSprintProgressbar, function(sprint) {
            const closedPoints = sprint.closed_points;
            const totalPoints = sprint.total_points;
            let percentage = 0;
            if (totalPoints !== 0) { percentage = Math.round(100 * (closedPoints / totalPoints)); }
            let visual_percentage = 0;
            //Visual hack for .current-progress bar
            if (totalPoints !== 0) { visual_percentage = Math.round(98 * (closedPoints / totalPoints)); }

            return renderProgress($el, percentage, visual_percentage);
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

//############################################################################
//# Created-by display directive
//############################################################################

export let CreatedByDisplayDirective = function($template, $compile, $translate, $navUrls, avatarService){
    // Display the owner information (full name and photo) and the date of
    // creation of an object (like USs, tasks and issues).
    //
    // Example:
    //     div.us-created-by(tg-created-by-display, ng-model="us")
    //
    // Requirements:
    //   - model object must have the attributes 'created_date' and
    //     'owner'(ng-model)
    //   - scope.usersById object is required.

    const link = function($scope, $el, $attrs) {
        bindOnce($scope, $attrs.ngModel, function(model) {
            if (model != null) {

                const avatar = avatarService.getAvatar(model.owner_extra_info);
                $scope.owner = model.owner_extra_info || {
                    full_name_display: $translate.instant("COMMON.EXTERNAL_USER"),
                };

                $scope.owner.avatar = avatar.url;
                $scope.owner.bg = avatar.bg;

                $scope.url = ($scope.owner != null ? $scope.owner.is_active : undefined) ? $navUrls.resolve("user-profile", {username: $scope.owner.username}) : "";

                return $scope.date =  moment(model.created_date).format($translate.instant("COMMON.DATETIME"));
            }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel",
        scope: true,
        templateUrl: "common/components/created-by.html",
    };
};

//############################################################################
//# Watchers directive
//############################################################################

export let WatchersDirective = function($rootscope, $confirm, $repo, $modelTransform, $template, $compile, $translate) {
    // You have to include a div with the tg-lb-watchers directive in the page
    // where use this directive

    const link = function($scope, $el, $attrs, $model) {
        const isEditable = () => __guard__($scope.project != null ? $scope.project.my_permissions : undefined, (x) => x.indexOf($attrs.requiredPerm)) !== -1;

        const save = function(watchers) {
            const transform = $modelTransform.save(function(item) {
                item.watchers = watchers;

                return item;
            });

            transform.then(function() {
                watchers = _.map(watchers, (watcherId: number) => $scope.usersById[watcherId]);
                renderWatchers(watchers);
                return $rootscope.$broadcast("object:updated");
            });

            return transform.then(null, () => $confirm.notify("error"));
        };

        const deleteWatcher = function(watcherIds) {
            const transform = $modelTransform.save(function(item) {
                item.watchers = watcherIds;

                return item;
            });

            transform.then(function() {
                const item = $modelTransform.getObj();
                const watchers = _.map(item.watchers, (watcherId: number) => $scope.usersById[watcherId]);
                renderWatchers(watchers);
                return $rootscope.$broadcast("object:updated");
            });

            return transform.then(null, function(item) {
                item.revert();
                return $confirm.notify("error");
            });
        };

        const renderWatchers = function(watchers) {
            $scope.watchers = watchers;
            return $scope.isEditable = isEditable();
        };

        $el.on("click", ".js-delete-watcher", function(event) {
            event.preventDefault();
            if (!isEditable()) { return; }
            const target = angular.element(event.currentTarget);
            const watcherId = target.data("watcher-id");

            const title = $translate.instant("COMMON.WATCHERS.TITLE_LIGHTBOX_DELETE_WARTCHER");
            const message = $scope.usersById[watcherId].full_name_display;

            return $confirm.askOnDelete(title, message).then((askResponse) => {
                askResponse.finish();

                let watcherIds = _.clone($model.$modelValue.watchers);
                watcherIds = _.pull(watcherIds, watcherId);

                return deleteWatcher(watcherIds);
            });
        });

        $scope.$on("watcher:added", function(ctx, watcherId) {
            let watchers = _.clone($model.$modelValue.watchers);
            watchers.push(watcherId);
            watchers = _.uniq(watchers);

            return save(watchers);
        });

        $scope.$watch($attrs.ngModel, function(item) {
            if ((item == null)) { return; }
            let watchers = _.map(item.watchers, (watcherId: number) => $scope.usersById[watcherId]);
            watchers = _.filter(watchers, (it) => !!it);

            return renderWatchers(watchers);
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        scope: true,
        templateUrl: "common/components/watchers.html",
        link,
        require: "ngModel",
    };
};

//############################################################################
//# Assigned to directive
//############################################################################

export let AssignedToDirective = function($rootscope, $confirm, $repo, $loading, $modelTransform, $template, $translate, $compile, $currentUserService, avatarService) {
    // You have to include a div with the tg-lb-assignedto directive in the page
    // where use this directive
    const template = $template.get("common/components/assigned-to.html", true);

    const link = function($scope, $el, $attrs, $model) {
        const isEditable = () => __guard__($scope.project != null ? $scope.project.my_permissions : undefined, (x) => x.indexOf($attrs.requiredPerm)) !== -1;

        const save = function(userId) {
            const item = $model.$modelValue.clone();
            item.assigned_to = userId;

            const currentLoading = $loading()
                .target($el)
                .start();

            const transform = $modelTransform.save(function(item) {
                item.assigned_to = userId;

                return item;
            });

            transform.then(function() {
                currentLoading.finish();
                renderAssignedTo($modelTransform.getObj());
                return $rootscope.$broadcast("object:updated");
            });

            transform.then(null, function() {
                $confirm.notify("error");
                return currentLoading.finish();
            });

            return transform;
        };

        const renderAssignedTo = function(assignedObject) {
            let fullName, isUnassigned;
            const avatar = avatarService.getAvatar(assignedObject != null ? assignedObject.assigned_to_extra_info : undefined);
            let bg = null;

            if ((assignedObject != null ? assignedObject.assigned_to : undefined) != null) {
                fullName = assignedObject.assigned_to_extra_info.full_name_display;
                isUnassigned = false;
                ({ bg } = avatar);
            } else {
                fullName = $translate.instant("COMMON.ASSIGNED_TO.ASSIGN");
                isUnassigned = true;
            }

            const isIocaine = assignedObject != null ? assignedObject.is_iocaine : undefined;

            const ctx = {
                fullName,
                avatar: avatar.url,
                bg,
                isUnassigned,
                isEditable: isEditable(),
                isIocaine,
                fullNameVisible: !(isUnassigned && !$currentUserService.isAuthenticated()),
            };
            const html = $compile(template(ctx))($scope);
            return $el.html(html);
        };

        $el.on("click", ".user-assigned", function(event) {
            event.preventDefault();
            if (!isEditable()) { return; }
            return $scope.$apply(() => $rootscope.$broadcast("assigned-to:add", $model.$modelValue));
        });

        $el.on("click", ".assign-to-me", function(event) {
            event.preventDefault();
            if (!isEditable()) { return; }
            $model.$modelValue.assigned_to = $currentUserService.getUser().get("id");
            return save($currentUserService.getUser().get("id"));
        });

        $el.on("click", ".remove-user", function(event) {
            event.preventDefault();
            if (!isEditable()) { return; }
            const title = $translate.instant("COMMON.ASSIGNED_TO.CONFIRM_UNASSIGNED");

            return $confirm.ask(title).then((response) => {
                response.finish();
                $model.$modelValue.assigned_to  = null;
                return save(null);
            });
        });

        $scope.$on("assigned-to:added", function(ctx, userId, item) {
            if (item.id !== $model.$modelValue.id) { return; }

            return save(userId);
        });

        $scope.$watch($attrs.ngModel, (instance) => renderAssignedTo(instance));

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        require: "ngModel",
    };
};

//############################################################################
//# Block Button directive
//############################################################################

export let BlockButtonDirective = function($rootscope, $loading, $template) {
    const template = $template.get("common/components/block-button.html");

    const link = function($scope, $el, $attrs, $model) {
        const isEditable = () => $scope.project.my_permissions.indexOf("modify_us") !== -1;

        $scope.$watch($attrs.ngModel, function(item) {
            if (!item) { return; }

            if (isEditable()) {
                $el.find(".item-block").addClass("editable");
            }

            if (item.is_blocked) {
                $el.find(".item-block").removeClass("is-active");
                return $el.find(".item-unblock").addClass("is-active");
            } else {
                $el.find(".item-block").addClass("is-active");
                return $el.find(".item-unblock").removeClass("is-active");
            }
        });

        $el.on("click", ".item-block", function(event) {
            event.preventDefault();
            return $rootscope.$broadcast("block", $model.$modelValue);
        });

        $el.on("click", ".item-unblock", function(event) {
            event.preventDefault();
            const currentLoading = $loading()
                .target($el.find(".item-unblock"))
                .start();

            const finish = () => currentLoading.finish();

            return $rootscope.$broadcast("unblock", $model.$modelValue, finish);
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel",
        template,
    };
};

//############################################################################
//# Delete Button directive
//############################################################################

export let DeleteButtonDirective = function($log, $repo, $confirm, $location, $template) {
    const template = $template.get("common/components/delete-button.html");

    const link = function($scope, $el, $attrs, $model) {
        if (!$attrs.onDeleteGoToUrl) {
            return $log.error("DeleteButtonDirective requires on-delete-go-to-url set in scope.");
        }
        if (!$attrs.onDeleteTitle) {
            return $log.error("DeleteButtonDirective requires on-delete-title set in scope.");
        }

        $el.on("click", ".button-delete", function(event) {
            const title = $attrs.onDeleteTitle;
            const subtitle = $model.$modelValue.subject;

            return $confirm.askOnDelete(title, subtitle).then((askResponse) => {
                const promise = $repo.remove($model.$modelValue);
                promise.then(() => {
                    askResponse.finish();
                    const url = $scope.$eval($attrs.onDeleteGoToUrl);
                    return $location.path(url);
                });
                return promise.then(null, () => {
                    askResponse.finish(false);
                    return $confirm.notify("error");
                });
            });
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel",
        template,
    };
};

//############################################################################
//# Editable subject directive
//############################################################################

export let EditableSubjectDirective = function($rootscope, $repo, $confirm, $loading, $modelTransform, $template) {
    const template = $template.get("common/components/editable-subject.html");

    const link = function($scope, $el, $attrs, $model) {

        $scope.$on("object:updated", function() {
            $el.find(".edit-subject").hide();
            return $el.find(".view-subject").show();
        });

        const isEditable = () => $scope.project.my_permissions.indexOf($attrs.requiredPerm) !== -1;

        const save = function(subject) {
            const currentLoading = $loading()
                .target($el.find(".save-container"))
                .start();

            const transform = $modelTransform.save(function(item) {

                item.subject  = subject;

                return item;
            });

            transform.then(() => {
                $confirm.notify("success");
                $rootscope.$broadcast("object:updated");
                $el.find(".edit-subject").hide();
                return $el.find(".view-subject").show();
            });

            transform.then(null, () => $confirm.notify("error"));

            transform.finally(() => currentLoading.finish());

            return transform;
        };

        $el.click(function() {
            if (!isEditable()) { return; }
            $el.find(".edit-subject").show();
            $el.find(".view-subject").hide();
            return $el.find("input").focus();
        });

        $el.on("click", ".save", function(e) {
            e.preventDefault();

            const { subject } = $scope.item;
            return save(subject);
        });

        $el.on("keyup", "input", function(event) {
            if (event.keyCode === 13) {
                const { subject } = $scope.item;
                return save(subject);
            } else if (event.keyCode === 27) {
                $scope.$apply(() => $model.$modelValue.revert());

                $el.find(".edit-subject").hide();
                return $el.find(".view-subject").show();
            }
        });

        $el.find(".edit-subject").hide();

        $scope.$watch($attrs.ngModel, function(value) {
            if (!value) { return; }
            $scope.item = value;

            if (!isEditable()) {
                return $el.find(".view-subject .edit").remove();
            }
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        link,
        restrict: "EA",
        require: "ngModel",
        template,
    };
};

//############################################################################
//# Common list directives
//############################################################################
//# NOTE: These directives are used in issues and search and are
//#       completely bindonce, they only serves for visualization of data.
//############################################################################

export let ListItemEpicStatusDirective = function() {
    const link = function($scope, $el, $attrs) {
        const epic = $scope.$eval($attrs.tgListitemEpicStatus);
        return bindOnce($scope, "epicStatusById", (epicStatusById) => $el.html(epicStatusById[epic.status].name));
    };

    return {link};
};

export let ListItemUsStatusDirective = function() {
    const link = function($scope, $el, $attrs) {
        const us = $scope.$eval($attrs.tgListitemUsStatus);
        return bindOnce($scope, "usStatusById", (usStatusById) => $el.html(usStatusById[us.status].name));
    };

    return {link};
};

export let ListItemTaskStatusDirective = function() {
    const link = function($scope, $el, $attrs) {
        const task = $scope.$eval($attrs.tgListitemTaskStatus);
        return bindOnce($scope, "taskStatusById", (taskStatusById) => $el.html(taskStatusById[task.status].name));
    };

    return {link};
};

export let ListItemAssignedtoDirective = function($template, $translate, avatarService) {
    const template = $template.get("common/components/list-item-assigned-to-avatar.html", true);

    const link = ($scope, $el, $attrs) =>
        bindOnce($scope, "usersById", function(usersById) {
            const item = $scope.$eval($attrs.tgListitemAssignedto);
            const ctx: any = {
                name: $translate.instant("COMMON.ASSIGNED_TO.NOT_ASSIGNED"),
            };

            const member = usersById[item.assigned_to];
            const avatar = avatarService.getAvatar(member);

            ctx.imgurl = avatar.url;
            ctx.bg = avatar.bg;

            if (member) {
                ctx.name = member.full_name_display;
            }

            return $el.html(template(ctx));
        })
    ;

    return {link};
};

export let ListItemIssueStatusDirective = function() {
    const link = function($scope, $el, $attrs) {
        const issue = $scope.$eval($attrs.tgListitemIssueStatus);
        return bindOnce($scope, "issueStatusById", (issueStatusById) => $el.html(issueStatusById[issue.status].name));
    };

    return {link};
};

export let ListItemTypeDirective = function() {
    const link = function($scope, $el, $attrs) {
        const render = function(issueTypeById, issue) {
            const type = issueTypeById[issue.type];
            const domNode = $el.find(".level");
            domNode.css("background-color", type.color);
            return domNode.attr("title", type.name);
        };

        bindOnce($scope, "issueTypeById", function(issueTypeById) {
            const issue = $scope.$eval($attrs.tgListitemType);
            return render(issueTypeById, issue);
        });

        return $scope.$watch($attrs.tgListitemType, (issue) => render($scope.issueTypeById, issue));
    };

    return {
        link,
        templateUrl: "common/components/level.html",
    };
};

export let ListItemPriorityDirective = function() {
    const link = function($scope, $el, $attrs) {
        const render = function(priorityById, issue) {
            const priority = priorityById[issue.priority];
            const domNode = $el.find(".level");
            domNode.css("background-color", priority.color);
            return domNode.attr("title", priority.name);
        };

        bindOnce($scope, "priorityById", function(priorityById) {
            const issue = $scope.$eval($attrs.tgListitemPriority);
            return render(priorityById, issue);
        });

        return $scope.$watch($attrs.tgListitemPriority, (issue) => render($scope.priorityById, issue));
    };

    return {
        link,
        templateUrl: "common/components/level.html",
    };
};

export let ListItemSeverityDirective = function() {
    const link = function($scope, $el, $attrs) {
        const render = function(severityById, issue) {
            const severity = severityById[issue.severity];
            const domNode = $el.find(".level");
            domNode.css("background-color", severity.color);
            return domNode.attr("title", severity.name);
        };

        bindOnce($scope, "severityById", function(severityById) {
            const issue = $scope.$eval($attrs.tgListitemSeverity);
            return render(severityById, issue);
        });

        return $scope.$watch($attrs.tgListitemSeverity, (issue) => render($scope.severityById, issue));
    };

    return {
        link,
        templateUrl: "common/components/level.html",
    };
};

//############################################################################
//# Progress bar directive
//############################################################################

export let TgProgressBarDirective = function($template) {
    const template = $template.get("common/components/progress-bar.html", true);

    const render = (el, percentage) => el.html(template({percentage}));

    const link = function($scope, $el, $attrs) {
        const element = angular.element($el);

        $scope.$watch($attrs.tgProgressBar, function(percentage) {
            percentage = _.max([0 , percentage]);
            percentage = _.min([100, percentage]);
            return render($el, percentage);
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

function __guard__(value, transform) {
  return (typeof value !== "undefined" && value !== null) ? transform(value) : undefined;
}
