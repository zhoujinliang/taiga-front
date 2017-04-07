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
 * File: modules/resources/tasks.coffee
 */


let { taiga } = this;

let { generateHash } = taiga;

let resourceProvider = function($repo, $http, $urls, $storage) {
    let service = {};
    let hashSuffix = "tasks-queryparams";
    let hashSuffixStatusColumnModes = "tasks-statuscolumnmodels";
    let hashSuffixUsRowModes = "tasks-usrowmodels";

    service.get = function(projectId, taskId, extraParams) {
        let params = service.getQueryParams(projectId);
        params.project = projectId;

        params = _.extend({}, params, extraParams);

        return $repo.queryOne("tasks", taskId, params);
    };

    service.getByRef = function(projectId, ref, extraParams) {
        let params = service.getQueryParams(projectId);
        params.project = projectId;
        params.ref = ref;

        params = _.extend({}, params, extraParams);

        return $repo.queryOne("tasks", "by_ref", params);
    };

    service.listInAllProjects = filters => $repo.queryMany("tasks", filters);

    service.filtersData = params => $repo.queryOneRaw("task-filters", null, params);

    service.list = function(projectId, sprintId, userStoryId, params) {
        if (sprintId == null) { sprintId = null; }
        if (userStoryId == null) { userStoryId = null; }
        params = _.merge(params, {project: projectId});
        if (sprintId) { params.milestone = sprintId; }
        if (userStoryId) { params.user_story = userStoryId; }
        service.storeQueryParams(projectId, params);
        return $repo.queryMany("tasks", params);
    };

    service.bulkCreate = function(projectId, sprintId, usId, data) {
        let url = $urls.resolve("bulk-create-tasks");
        let params = {project_id: projectId, milestone_id: sprintId, us_id: usId, bulk_tasks: data};
        return $http.post(url, params).then(result => result.data);
    };

    service.upvote = function(taskId) {
        let url = $urls.resolve("task-upvote", taskId);
        return $http.post(url);
    };

    service.downvote = function(taskId) {
        let url = $urls.resolve("task-downvote", taskId);
        return $http.post(url);
    };

    service.watch = function(taskId) {
        let url = $urls.resolve("task-watch", taskId);
        return $http.post(url);
    };

    service.unwatch = function(taskId) {
        let url = $urls.resolve("task-unwatch", taskId);
        return $http.post(url);
    };

    service.bulkUpdateTaskTaskboardOrder = function(projectId, data) {
        let url = $urls.resolve("bulk-update-task-taskboard-order");
        let params = {project_id: projectId, bulk_tasks: data};
        return $http.post(url, params);
    };

    service.listValues = function(projectId, type) {
        let params = {"project": projectId};
        return $repo.queryMany(type, params);
    };

    service.storeQueryParams = function(projectId, params) {
        let ns = `${projectId}:${hashSuffix}`;
        let hash = generateHash([projectId, ns]);
        return $storage.set(hash, params);
    };

    service.getQueryParams = function(projectId) {
        let ns = `${projectId}:${hashSuffix}`;
        let hash = generateHash([projectId, ns]);
        return $storage.get(hash) || {};
    };

    service.storeStatusColumnModes = function(projectId, params) {
        let ns = `${projectId}:${hashSuffixStatusColumnModes}`;
        let hash = generateHash([projectId, ns]);
        return $storage.set(hash, params);
    };

    service.getStatusColumnModes = function(projectId) {
        let ns = `${projectId}:${hashSuffixStatusColumnModes}`;
        let hash = generateHash([projectId, ns]);
        return $storage.get(hash) || {};
    };

    service.storeUsRowModes = function(projectId, sprintId, params) {
        let ns = `${projectId}:${hashSuffixUsRowModes}`;
        let hash = generateHash([projectId, sprintId, ns]);

        return $storage.set(hash, params);
    };

    service.getUsRowModes = function(projectId, sprintId) {
        let ns = `${projectId}:${hashSuffixUsRowModes}`;
        let hash = generateHash([projectId, sprintId, ns]);

        return $storage.get(hash) || {};
    };

    return instance => instance.tasks = service;
};


let module = angular.module("taigaResources");
module.factory("$tgTasksResourcesProvider", ["$tgRepo", "$tgHttp", "$tgUrls", "$tgStorage", resourceProvider]);
