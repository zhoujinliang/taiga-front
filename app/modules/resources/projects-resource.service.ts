/*
 * Copyright (C) 2014-2017 Taiga Agile LLC <taiga@taiga.io>
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
 * File: projects-resource.service.coffee
 */

import * as Immutable from "immutable"

let pagination = function() {};

export let ProjectsResource = function(urlsService, http, paginateResponseService) {
    let service:any = {};

    service.create = function(data) {
        let url = urlsService.resolve('projects');

        return http.post(url, JSON.stringify(data))
            .then(result => { return Immutable.fromJS(result.data); });
    };

    service.duplicate = function(projectId, data) {

        let url = urlsService.resolve("projects");
        url = `${url}/${projectId}/duplicate`;

        let members = data.users.map(member => ({"id": member}));

        let params = {
            "name": data.name,
            "description": data.description,
            "is_private": data.is_private,
            "users": members
        };

        return http.post(url, params);
    };

    service.getProjects = function(params, pagination) {
        if (params == null) { params = {}; }
        if (pagination == null) { pagination = true; }
        let url = urlsService.resolve("projects");

        let httpOptions = {};

        if (!pagination) {
            httpOptions = {
                headers: {
                    "x-lazy-pagination": true
                }
            };
        }

        return http.get(url, params, httpOptions);
    };

    service.getProjectBySlug = function(projectSlug) {
        let url = urlsService.resolve("projects");

        url = `${url}/by_slug?slug=${projectSlug}`;

        return http.get(url)
            .then(result => Immutable.fromJS(result.data));
    };

    service.getProjectsByUserId = function(userId, paginate) {
        if (paginate == null) { paginate = false; }
        let url = urlsService.resolve("projects");
        let httpOptions:any = {};

        if (!paginate) {
            httpOptions.headers = {
                "x-disable-pagination": "1"
            };
        }

        let params = {"member": userId, "order_by": "user_order"};

        return http.get(url, params, httpOptions)
            .then(result => Immutable.fromJS(result.data));
    };

    service.getProjectStats = function(projectId) {
        let url = urlsService.resolve("projects");
        url = `${url}/${projectId}`;

        return http.get(url)
            .then(result => Immutable.fromJS(result.data));
    };

    service.bulkUpdateOrder = function(bulkData) {
        let url = urlsService.resolve("bulk-update-projects-order");
        return http.post(url, bulkData);
    };

    service.getTimeline = function(projectId, page) {
        let params = {
            page,
            only_relevant: true
        };

        let url = urlsService.resolve("timeline-project");
        url = `${url}/${projectId}`;

        return http.get(url, params, {
            headers: {
                'x-lazy-pagination': true
            }
        }).then(function(result) {
            result = Immutable.fromJS(result);
            return paginateResponseService(result);
        });
    };

    service.likeProject = function(projectId) {
        let url = urlsService.resolve("project-like", projectId);
        return http.post(url);
    };

    service.unlikeProject = function(projectId) {
        let url = urlsService.resolve("project-unlike", projectId);
        return http.post(url);
    };

    service.watchProject = function(projectId, notifyLevel) {
        let data = {
            notify_level: notifyLevel
        };
        let url = urlsService.resolve("project-watch", projectId);
        return http.post(url, data);
    };

    service.unwatchProject = function(projectId) {
        let url = urlsService.resolve("project-unwatch", projectId);
        return http.post(url);
    };

    service.contactProject = function(projectId, message) {
        let params = {
            project: projectId,
            comment: message
        };

        let url = urlsService.resolve("project-contact");
        return http.post(url, params);
    };

    service.transferValidateToken = function(projectId, token) {
        let data = {
            token
        };
        let url = urlsService.resolve("project-transfer-validate-token", projectId);
        return http.post(url, data);
    };

    service.transferAccept = function(projectId, token, reason) {
        let data = {
            token,
            reason
        };
        let url = urlsService.resolve("project-transfer-accept", projectId);
        return http.post(url, data);
    };

    service.transferReject = function(projectId, token, reason) {
        let data = {
            token,
            reason
        };
        let url = urlsService.resolve("project-transfer-reject", projectId);
        return http.post(url, data);
    };

    service.transferRequest = function(projectId) {
        let url = urlsService.resolve("project-transfer-request", projectId);
        return http.post(url);
    };

    service.transferStart = function(projectId, userId, reason) {
        let data = {
            user: userId,
            reason
        };

        let url = urlsService.resolve("project-transfer-start", projectId);
        return http.post(url, data);
    };

    return () => ({"projects": service});
};
ProjectsResource.$inject = ["$tgUrls", "$tgHttp", "tgPaginateResponseService"];
