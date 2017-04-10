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
 * File: modules/related-tasks.coffee
 */

import {trim, debounce, bindOnce} from "../utils"
import * as angular from "angular"
import * as _ from "lodash"

let module = angular.module("taigaRelatedTasks", []);


let RelatedTaskRowDirective = function($repo, $compile, $confirm, $rootscope, $loading, $template, $translate) {
    let templateView = $template.get("task/related-task-row.html", true);
    let templateEdit = $template.get("task/related-task-row-edit.html", true);

    let link = function($scope, $el, $attrs, $model) {
        let childScope = $scope.$new();

        let saveTask = debounce(2000, function(task) {
            task.subject = $el.find('input').val();

            let currentLoading = $loading()
                .target($el.find('.task-name'))
                .start();

            let promise = $repo.save(task);
            promise.then(() => {
                currentLoading.finish();
                return $rootscope.$broadcast("related-tasks:update");
            });

            promise.then(null, () => {
                currentLoading.finish();
                $el.find('input').val(task.subject);
                return $confirm.notify("error");
            });
            return promise;
        });

        let renderEdit = function(task) {
            childScope.$destroy();
            childScope = $scope.$new();
            $el.off();
            $el.html($compile(templateEdit({task}))(childScope));

            $el.find(".task-name input").val(task.subject);

            $el.on("keyup", "input", function(event) {
                if (event.keyCode === 13) {
                    return saveTask($model.$modelValue).then(() => renderView($model.$modelValue));
                } else if (event.keyCode === 27) {
                    return renderView($model.$modelValue);
                }
            });

            $el.on("click", ".save-task", event =>
                saveTask($model.$modelValue).then(() => renderView($model.$modelValue))
            );

            return $el.on("click", ".cancel-edit", event => renderView($model.$modelValue));
        };

        var renderView = function(task) {
            let perms = {
                modify_task: $scope.project.my_permissions.indexOf("modify_task") !== -1,
                delete_task: $scope.project.my_permissions.indexOf("delete_task") !== -1
            };

            $el.html($compile(templateView({task, perms}))($scope));

            $el.on("click", ".edit-task", function() {
                renderEdit($model.$modelValue);
                return $el.find('input').focus().select();
            });

            return $el.on("click", ".delete-task", function(event) {
                let title = $translate.instant("TASK.TITLE_DELETE_ACTION");
                task = $model.$modelValue;
                let message = task.subject;

                return $confirm.askOnDelete(title, message).then(function(askResponse) {
                    let promise = $repo.remove(task);
                    promise.then(function() {
                        askResponse.finish();
                        return $scope.$emit("related-tasks:delete");
                    });

                    return promise.then(null, function() {
                        askResponse.finish(false);
                        return $confirm.notify("error");
                    });
                });
            });
        };

        $scope.$watch($attrs.ngModel, function(val) {
            if (!val) { return; }
            return renderView(val);
        });

        $scope.$on("related-tasks:assigned-to-changed", () => $rootscope.$broadcast("related-tasks:update"));

        $scope.$on("related-tasks:status-changed", () => $rootscope.$broadcast("related-tasks:update"));

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link, require:"ngModel"};
};

module.directive("tgRelatedTaskRow", ["$tgRepo", "$compile", "$tgConfirm", "$rootScope", "$tgLoading",
                                      "$tgTemplate", "$translate", RelatedTaskRowDirective]);


let RelatedTaskCreateFormDirective = function($repo, $compile, $confirm, $tgmodel, $loading, $analytics) {
    let newTask = {
        subject: "",
        assigned_to: null
    };

    let link = function($scope, $el, $attrs) {
        let createTask = function(task) {
            task.subject = $el.find('input').val();
            task.assigned_to = $scope.newTask.assigned_to;
            task.status = $scope.newTask.status;
            $scope.newTask.status = $scope.project.default_task_status;
            $scope.newTask.assigned_to = null;

            let currentLoading = $loading()
                .target($el.find('.task-name'))
                .start();

            let promise = $repo.create("tasks", task);
            promise.then(function() {
                $analytics.trackEvent("task", "create", "create task on userstory", 1);
                currentLoading.finish();
                return $scope.$emit("related-tasks:add");
            });

            promise.then(null, function() {
                $el.find('input').val(task.subject);
                currentLoading.finish();
                return $confirm.notify("error");
            });

            return promise;
        };

        let close = function() {
            $el.off();

            return $scope.openNewRelatedTask = false;
        };

        let reset = function() {
            newTask = {
                subject: "",
                assigned_to: null
            };

            newTask["status"] = $scope.project.default_task_status;
            newTask["project"] = $scope.project.id;
            newTask["user_story"] = $scope.us.id;

            return $scope.newTask = $tgmodel.make_model("tasks", newTask);
        };

        let render = function() {
            if ($scope.openNewRelatedTask) { return; }

            $scope.openNewRelatedTask = true;

            return $el.on("keyup", "input", function(event){
                if (event.keyCode === 13) {
                    return createTask(newTask).then(function() {
                        reset();
                        return $el.find('input').focus();
                    });

                } else if (event.keyCode === 27) {
                    return $scope.$apply(() => close());
                }
            });
        };

        $scope.save = () =>
            createTask(newTask).then(() => close())
        ;

        bindOnce($scope, "us", reset);

        $scope.$on("related-tasks:show-form", () => $scope.$apply(render));

        return $scope.$on("$destroy", () => $el.off());
    };

    return {
        scope: true,
        link,
        templateUrl: 'task/related-task-create-form.html'
    };
};

module.directive("tgRelatedTaskCreateForm", ["$tgRepo", "$compile", "$tgConfirm", "$tgModel", "$tgLoading",
                                             "$tgAnalytics", RelatedTaskCreateFormDirective]);


let RelatedTaskCreateButtonDirective = function($repo, $compile, $confirm, $tgmodel, $template) {
    let template = $template.get("common/components/add-button.html", true);

    let link = function($scope, $el, $attrs) {
        $scope.$watch("project", function(val) {
            if (!val) { return; }
            $el.off();
            if ($scope.project.my_permissions.indexOf("add_task") !== -1) {
                $el.html($compile(template())($scope));
            } else {
                $el.html("");
            }

            return $el.on("click", ".add-button", event=> $scope.$emit("related-tasks:add-new-clicked"));
        });

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgRelatedTaskCreateButton", ["$tgRepo", "$compile", "$tgConfirm", "$tgModel",
                                               "$tgTemplate", RelatedTaskCreateButtonDirective]);


let RelatedTasksDirective = function($repo, $rs, $rootscope) {
    let link = function($scope, $el, $attrs) {
        let loadTasks = () =>
            $rs.tasks.list($scope.projectId, null, $scope.usId).then(tasks => {
                $scope.tasks = _.sortBy(tasks, (x:any) => [x.us_order, x.ref]);
                return tasks;
            })
        ;

        let _isVisible = function() {
            if ($scope.project) {
                return $scope.project.my_permissions.indexOf("view_tasks") !== -1;
            }
            return false;
        };

        let _isEditable = function() {
            if ($scope.project) {
                return $scope.project.my_permissions.indexOf("modify_task") !== -1;
            }
            return false;
        };

        $scope.showRelatedTasks = () => _isVisible() && ( _isEditable() ||  ($scope.tasks != null ? $scope.tasks.length : undefined) );

        $scope.$on("related-tasks:add", () =>
            loadTasks().then(() => $rootscope.$broadcast("related-tasks:update"))
        );

        $scope.$on("related-tasks:delete", () =>
            loadTasks().then(() => $rootscope.$broadcast("related-tasks:update"))
        );

        $scope.$on("related-tasks:add-new-clicked", () => $scope.$broadcast("related-tasks:show-form"));

        bindOnce($scope, "us", val => loadTasks());

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgRelatedTasks", ["$tgRepo", "$tgResources", "$rootScope", RelatedTasksDirective]);


let RelatedTaskAssignedToInlineEditionDirective = function($repo, $rootscope, $translate, avatarService) {
    let template = _.template(`\
<img style="background-color: <%- bg %>" src="<%- imgurl %>" alt="<%- name %>"/>
<figcaption><%- name %></figcaption>\
`);

    let link = function($scope, $el, $attrs) {
        let updateRelatedTask = function(task) {
            let ctx:any = {
                name: $translate.instant("COMMON.ASSIGNED_TO.NOT_ASSIGNED"),
            };

            let member = $scope.usersById[task.assigned_to];

            let avatar = avatarService.getAvatar(member);
            ctx.imgurl = avatar.url;
            ctx.bg = avatar.bg;

            if (member) {
                ctx.name = member.full_name_display;
            }

            $el.find(".avatar").html(template(ctx));
            return $el.find(".task-assignedto").attr('title', ctx.name);
        };

        let $ctrl = $el.controller();
        let task = $scope.$eval($attrs.tgRelatedTaskAssignedToInlineEdition);
        let notAutoSave = $scope.$eval($attrs.notAutoSave);
        let autoSave = !notAutoSave;

        $scope.$watch($attrs.tgRelatedTaskAssignedToInlineEdition, function() {
            task = $scope.$eval($attrs.tgRelatedTaskAssignedToInlineEdition);
            return updateRelatedTask(task);
        });

        updateRelatedTask(task);

        $el.on("click", ".task-assignedto", event => $rootscope.$broadcast("assigned-to:add", task));

        bindOnce($scope, "project", function(project) {
            // If the user has not enough permissions the click events are unbinded
            if (project.my_permissions.indexOf("modify_task") === -1) {
                $el.unbind("click");
                return $el.find("a").addClass("not-clickable");
            }
        });

        $scope.$on("assigned-to:added", debounce(2000, (ctx, userId, updatedRelatedTask) => {
            if (updatedRelatedTask.id === task.id) {
                updatedRelatedTask.assigned_to = userId;
                if (autoSave) {
                    $repo.save(updatedRelatedTask).then(() => $scope.$emit("related-tasks:assigned-to-changed"));
                }
                return updateRelatedTask(updatedRelatedTask);
            }
        })
        );

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};

module.directive("tgRelatedTaskAssignedToInlineEdition", ["$tgRepo", "$rootScope", "$translate", "tgAvatarService",
                                                          RelatedTaskAssignedToInlineEditionDirective]);
