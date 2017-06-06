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

import * as Immutable from "immutable";
import * as _ from "lodash";
import {debounce, trim} from "../../libs/utils";

export let CreateEditTaskDirective = function($repo, $model, $rs, $rootscope, $loading, lightboxService, $translate, $q, attachmentsService) {
    const link = function($scope, $el, attrs) {
        $scope.isNew = true;

        let attachmentsToAdd = Immutable.List();
        let attachmentsToDelete = Immutable.List();

        const resetAttachments = function() {
            attachmentsToAdd = Immutable.List();
            return attachmentsToDelete = Immutable.List();
        };

        $scope.addAttachment = (attachment) => attachmentsToAdd = attachmentsToAdd.push(attachment);

        $scope.deleteAttachment = function(attachment) {
            attachmentsToAdd = attachmentsToAdd.filter((it: Immutable.Map<string, any>) => it.get("name") !== attachment.get("name")) as Immutable.List<any>;

            if (attachment.get("id")) {
                return attachmentsToDelete = attachmentsToDelete.push(attachment);
            }
        };

        const createAttachments = function(obj) {
            const promises = _.map(attachmentsToAdd.toJS(), (attachment: any) => attachmentsService.upload(attachment.file, obj.id, $scope.task.project, "task"));

            return $q.all(promises);
        };

        const deleteAttachments = function(obj) {
            const promises = _.map(attachmentsToDelete.toJS(), (attachment: any) => attachmentsService.delete("task", attachment.id));

            return $q.all(promises);
        };

        const tagsToAdd = [];

        $scope.addTag = function(tag, color) {
            const value = trim(tag.toLowerCase());

            let { tags } = $scope.project;
            let projectTags = $scope.project.tags_colors;

            if ((tags == null)) { tags = []; }
            if ((projectTags == null)) { projectTags = {}; }

            if (!tags.includes(value)) {
                tags.push(value);
            }

            projectTags[tag] = color || null;

            $scope.project.tags = tags;

            const itemtags = _.clone($scope.task.tags);

            const inserted = _.find(itemtags, (it) => it[0] === value);

            if (!inserted) {
                itemtags.push([tag , color]);
                return $scope.task.tags = itemtags;
            }
        };

        $scope.deleteTag = function(tag) {
            const value = trim(tag[0].toLowerCase());

            const { tags } = $scope.project;
            const itemtags = _.clone($scope.task.tags);

            _.remove(itemtags, (tag) => tag[0] === value);

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
                tags: [],
            };
            $scope.isNew = true;
            $scope.attachments = Immutable.List();

            resetAttachments();

            // Update texts for creation
            const create = $translate.instant("COMMON.CREATE");
            $el.find(".button-green").html(create);

            const newTask = $translate.instant("LIGHTBOX.CREATE_EDIT_TASK.TITLE");
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
            const save = $translate.instant("COMMON.SAVE");
            const edit = $translate.instant("LIGHTBOX.CREATE_EDIT_TASK.ACTION_EDIT");

            $el.find(".button-green").html(save);
            $el.find(".title").html(edit + "  ");

            $el.find(".tag-input").val("");
            lightboxService.open($el, () => $scope.createEditTaskOpen = false);

            return $scope.createEditTaskOpen = true;
        });

        const submitButton = $el.find(".submit-button");

        const submit = debounce(2000, (event) => {
            let broadcastEvent, promise;
            event.preventDefault();

            const form = $el.find("form").checksley();
            if (!form.validate()) {
                return;
            }

            const params = {
                include_attachments: true,
                include_tasks: true,
            };

            if ($scope.isNew) {
                promise = $repo.create("tasks", $scope.task);
                broadcastEvent = "taskform:new:success";
            } else {
                promise = $repo.save($scope.task);
                broadcastEvent = "taskform:edit:success";
            }

            promise.then((data) =>
                deleteAttachments(data)
                    .then(() => createAttachments(data))
                    .then(() => {
                        return $rs.tasks.getByRef(data.project, data.ref, params).then((task) => $rootscope.$broadcast(broadcastEvent, task));
                }),
            );

            const currentLoading = $loading()
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

export let CreateBulkTasksDirective = function($repo, $rs, $rootscope, $loading, lightboxService, $model) {
    const link = function($scope, $el, attrs) {
        let data, form;
        $scope.form = {data: "", usId: null};

        const submit = debounce(2000, (event) => {
            event.preventDefault();

            form = $el.find("form").checksley();
            if (!form.validate()) {
                return;
            }

            const currentLoading = $loading()
                .target(submitButton)
                .start();

            ({ data } = $scope.form);
            const { projectId } = $scope;
            const { sprintId } = $scope.form;
            const { usId } = $scope.form;

            const promise = $rs.tasks.bulkCreate(projectId, sprintId, usId, data);
            promise.then(function(result) {
                result =  _.map(result, (x) => $model.make_model("tasks", x));
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

        const submitButton = $el.find(".submit-button");

        $el.on("submit", "form", submit);

        return $scope.$on("$destroy", () => $el.off());
    };

    return {link};
};
