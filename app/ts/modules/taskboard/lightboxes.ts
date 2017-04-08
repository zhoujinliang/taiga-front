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
 * File: modules/taskboard/lightboxes.coffee
 */

import {debounce, trim} from "../../utils"
import * as angular from "angular"
import * as Immutable from "immutable"
import * as _ from "lodash"

let CreateEditTaskDirective = function($repo, $model, $rs, $rootscope, $loading, lightboxService, $translate, $q, attachmentsService) {
    let link = function($scope, $el, attrs) {
        $scope.isNew = true;

        let attachmentsToAdd = Immutable.List();
        let attachmentsToDelete = Immutable.List();

        let resetAttachments = function() {
            attachmentsToAdd = Immutable.List();
            return attachmentsToDelete = Immutable.List();
        };

        $scope.addAttachment = attachment => attachmentsToAdd = attachmentsToAdd.push(attachment);

        $scope.deleteAttachment = function(attachment) {
            attachmentsToAdd = <Immutable.List<any>>attachmentsToAdd.filter((it:Immutable.Map<string,any>) => it.get('name') !== attachment.get('name'));

            if (attachment.get("id")) {
                return attachmentsToDelete = attachmentsToDelete.push(attachment);
            }
        };

        let createAttachments = function(obj) {
            let promises = _.map(attachmentsToAdd.toJS(), (attachment:any) => attachmentsService.upload(attachment.file, obj.id, $scope.task.project, 'task'));

            return $q.all(promises);
        };

        let deleteAttachments = function(obj) {
            let promises = _.map(attachmentsToDelete.toJS(), (attachment:any) => attachmentsService.delete("task", attachment.id));

            return $q.all(promises);
        };

        let tagsToAdd = [];

        $scope.addTag = function(tag, color) {
            let value = trim(tag.toLowerCase());

            let { tags } = $scope.project;
            let projectTags = $scope.project.tags_colors;

            if ((tags == null)) { tags = []; }
            if ((projectTags == null)) { projectTags = {}; }

            if (!Array.from(tags).includes(value)) {
                tags.push(value);
            }

            projectTags[tag] = color || null;

            $scope.project.tags = tags;

            let itemtags = _.clone($scope.task.tags);

            let inserted = _.find(itemtags, it => it[0] === value);

            if (!inserted) {
                itemtags.push([tag , color]);
                return $scope.task.tags = itemtags;
            }
        };


        $scope.deleteTag = function(tag) {
            let value = trim(tag[0].toLowerCase());

            let { tags } = $scope.project;
            let itemtags = _.clone($scope.task.tags);

            _.remove(itemtags, tag => tag[0] === value);

            $scope.task.tags = itemtags;

            return _.pull($scope.task.tags, value);
        };

        $scope.$on("taskform:new", function(ctx, sprintId, usId) {
            $scope.task = {
                project: $scope.projectId,
                milestone: sprintId,
                user_story: usId,
                is_archived: false,
                status: $scope.project.default_task_status,
                assigned_to: null,
                tags: []
            };
            $scope.isNew = true;
            $scope.attachments = Immutable.List();

            resetAttachments();

            // Update texts for creation
            let create = $translate.instant("COMMON.CREATE");
            $el.find(".button-green").html(create);

            let newTask = $translate.instant("LIGHTBOX.CREATE_EDIT_TASK.TITLE");
            $el.find(".title").html(newTask + "  ");

            $el.find(".tag-input").val("");
            lightboxService.open($el, () => $scope.createEditTaskOpen = false);

            return $scope.createEditTaskOpen = true;
        });

        $scope.$on("taskform:edit", function(ctx, task, attachments) {
            $scope.task = task;
            $scope.isNew = false;

            $scope.attachments = Immutable.fromJS(attachments);

            resetAttachments();

            // Update texts for edition
            let save = $translate.instant("COMMON.SAVE");
            let edit = $translate.instant("LIGHTBOX.CREATE_EDIT_TASK.ACTION_EDIT");

            $el.find(".button-green").html(save);
            $el.find(".title").html(edit + "  ");

            $el.find(".tag-input").val("");
            lightboxService.open($el, () => $scope.createEditTaskOpen = false);

            return $scope.createEditTaskOpen = true;
        });


        let submitButton = $el.find(".submit-button");

        let submit = debounce(2000, event => {
            let broadcastEvent, promise;
            event.preventDefault();

            let form = $el.find("form").checksley();
            if (!form.validate()) {
                return;
            }

            let params = {
                include_attachments: true,
                include_tasks: true
            };

            if ($scope.isNew) {
                promise = $repo.create("tasks", $scope.task);
                broadcastEvent = "taskform:new:success";
            } else {
                promise = $repo.save($scope.task);
                broadcastEvent = "taskform:edit:success";
            }

            promise.then(data =>
                deleteAttachments(data)
                    .then(() => createAttachments(data))
                    .then(() => {
                        return $rs.tasks.getByRef(data.project, data.ref, params).then(task => $rootscope.$broadcast(broadcastEvent, task));
                })
            );

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            return promise.then(function(data) {
                currentLoading.finish();
                return lightboxService.close($el);
            });
        });

        $el.on("submit", "form", submit);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};


let CreateBulkTasksDirective = function($repo, $rs, $rootscope, $loading, lightboxService, $model) {
    let link = function($scope, $el, attrs) {
        let data, form;
        $scope.form = {data: "", usId: null};

        let submit = debounce(2000, event => {
            event.preventDefault();

            form = $el.find("form").checksley();
            if (!form.validate()) {
                return;
            }

            let currentLoading = $loading()
                .target(submitButton)
                .start();

            ({ data } = $scope.form);
            let { projectId } = $scope;
            let { sprintId } = $scope.form;
            let { usId } = $scope.form;

            let promise = $rs.tasks.bulkCreate(projectId, sprintId, usId, data);
            promise.then(function(result) {
                result =  _.map(result, x => $model.make_model('tasks', x));
                currentLoading.finish();
                $rootscope.$broadcast("taskform:bulk:success", result);
                return lightboxService.close($el);
            });

            // TODO: error handling
            return promise.then(null, function() {
                currentLoading.finish();
                return console.log("FAIL");
            });
        });

        $scope.$on("taskform:bulk", function(ctx, sprintId, usId){
            lightboxService.open($el);
            return $scope.form = {data: "", sprintId, usId};
    });

        var submitButton = $el.find(".submit-button");

        $el.on("submit", "form", submit);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};


let module = angular.module("taigaTaskboard");

module.directive("tgLbCreateEditTask", [
    "$tgRepo",
    "$tgModel",
    "$tgResources",
    "$rootScope",
    "$tgLoading",
    "lightboxService",
    "$translate",
    "$q",
    "tgAttachmentsService",
    CreateEditTaskDirective
]);

module.directive("tgLbCreateBulkTasks", [
    "$tgRepo",
    "$tgResources",
    "$rootScope",
    "$tgLoading",
    "lightboxService",
    "$tgModel",
    CreateBulkTasksDirective
]);
