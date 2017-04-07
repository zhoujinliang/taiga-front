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
 * File: modules/resources/userstories.coffee
 */

import {generateHash} from "../../app"
import * as angular from "angular"
import * as _ from "lodash"

let resourceProvider = function($repo, $http, $urls, $storage, $q) {
    let service:any = {};
    let hashSuffix = "userstories-queryparams";

    service.get = function(projectId, usId, extraParams) {
        let params = service.getQueryParams(projectId);
        params.project = projectId;

        params = _.extend({}, params, extraParams);

        return $repo.queryOne("userstories", usId, params);
    };

    service.getByRef = function(projectId, ref, extraParams) {
        if (extraParams == null) { extraParams = {}; }
        let params = service.getQueryParams(projectId);
        params.project = projectId;
        params.ref = ref;
        params = _.extend({}, params, extraParams);

        return $repo.queryOne("userstories", "by_ref", params);
    };

    service.listInAllProjects = filters => $repo.queryMany("userstories", filters);

    service.filtersData = params => $repo.queryOneRaw("userstories-filters", null, params);

    service.listUnassigned = function(projectId, filters, pageSize) {
        let params = {"project": projectId, "milestone": "null"};
        params = _.extend({}, params, filters || {});
        service.storeQueryParams(projectId, params);

        return $repo.queryMany("userstories", _.extend(params, {
            page_size: pageSize
        }), {
            enablePagination: true
        }, true);
    };

    service.listAll = function(projectId, filters) {
        let params = {"project": projectId};
        params = _.extend({}, params, filters || {});
        service.storeQueryParams(projectId, params);

        return $repo.queryMany("userstories", params);
    };

    service.bulkCreate = function(projectId, status, bulk) {
        let data = {
            project_id: projectId,
            status_id: status,
            bulk_stories: bulk
        };

        let url = $urls.resolve("bulk-create-us");

        return $http.post(url, data);
    };

    service.upvote = function(userStoryId) {
        let url = $urls.resolve("userstory-upvote", userStoryId);
        return $http.post(url);
    };

    service.downvote = function(userStoryId) {
        let url = $urls.resolve("userstory-downvote", userStoryId);
        return $http.post(url);
    };

    service.watch = function(userStoryId) {
        let url = $urls.resolve("userstory-watch", userStoryId);
        return $http.post(url);
    };

    service.unwatch = function(userStoryId) {
        let url = $urls.resolve("userstory-unwatch", userStoryId);
        return $http.post(url);
    };

    service.bulkUpdateBacklogOrder = function(projectId, data) {
        let url = $urls.resolve("bulk-update-us-backlog-order");
        let params = {project_id: projectId, bulk_stories: data};
        return $http.post(url, params);
    };

    service.bulkUpdateMilestone = function(projectId, milestoneId, data) {
        let url = $urls.resolve("bulk-update-us-milestone");
        let params = {project_id: projectId, milestone_id: milestoneId, bulk_stories: data};
        return $http.post(url, params);
    };

    service.bulkUpdateKanbanOrder = function(projectId, data) {
        let url = $urls.resolve("bulk-update-us-kanban-order");
        let params = {project_id: projectId, bulk_stories: data};
        return $http.post(url, params);
    };

    service.listValues = function(projectId, type) {
        let params = {"project": projectId};
        service.storeQueryParams(projectId, params);
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

    service.storeShowTags = function(projectId, showTags) {
        let hash = generateHash([projectId, 'showTags']);
        return $storage.set(hash, showTags);
    };

    service.getShowTags = function(projectId) {
        let hash = generateHash([projectId, 'showTags']);
        return $storage.get(hash) || null;
    };

    return instance => instance.userstories = service;
};

let module = angular.module("taigaResources");
module.factory("$tgUserstoriesResourcesProvider", ["$tgRepo", "$tgHttp", "$tgUrls", "$tgStorage", "$q", resourceProvider]);
