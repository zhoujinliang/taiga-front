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
 * File: modules/resources/issues.coffee
 */

import {generateHash} from "../../app"
import * as _ from "lodash"

export function IssuesResourcesProvider($repo, $http, $urls, $storage, $q) {
    let service:any = {};
    let hashSuffix = "issues-queryparams";

    service.get = function(projectId, issueId) {
        let params = service.getQueryParams(projectId);
        params.project = projectId;
        return $repo.queryOne("issues", issueId, params);
    };

    service.getByRef = function(projectId, ref) {
        let params = service.getQueryParams(projectId);
        params.project = projectId;
        params.ref = ref;
        return $repo.queryOne("issues", "by_ref", params);
    };

    service.listInAllProjects = filters => $repo.queryMany("issues", filters);

    service.list = function(projectId, filters, options) {
        let params = {project: projectId};
        params = _.extend({}, params, filters || {});
        service.storeQueryParams(projectId, params);
        return $repo.queryPaginated("issues", params, options);
    };

    service.bulkCreate = function(projectId, data) {
        let url = $urls.resolve("bulk-create-issues");
        let params = {project_id: projectId, bulk_issues: data};
        return $http.post(url, params);
    };

    service.upvote = function(issueId) {
        let url = $urls.resolve("issue-upvote", issueId);
        return $http.post(url);
    };

    service.downvote = function(issueId) {
        let url = $urls.resolve("issue-downvote", issueId);
        return $http.post(url);
    };

    service.watch = function(issueId) {
        let url = $urls.resolve("issue-watch", issueId);
        return $http.post(url);
    };

    service.unwatch = function(issueId) {
        let url = $urls.resolve("issue-unwatch", issueId);
        return $http.post(url);
    };

    service.stats = projectId => $repo.queryOneRaw("projects", `${projectId}/issues_stats`);

    service.filtersData = params => $repo.queryOneRaw("issues-filters", null, params);

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

    return instance => instance.issues = service;
};
