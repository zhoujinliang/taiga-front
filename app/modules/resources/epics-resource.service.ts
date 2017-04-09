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
 * File: epics-resource.service.coffee
 */

import * as angular from "angular"
import * as Immutable from "immutable"

export let EpicsResource = function(urlsService, http) {
    let service:any = {};

    service.listInAllProjects = function(params) {
        let url = urlsService.resolve("epics");

        let httpOptions = {
            headers: {
                "x-disable-pagination": "1"
            }
        };

        return http.get(url, params, httpOptions)
            .then(result => Immutable.fromJS(result.data));
    };

    service.list = function(projectId, page) {
        if (page == null) { page = 0; }
        let url = urlsService.resolve("epics");

        let params = {project: projectId, page};

        return http.get(url, params)
            .then(result =>
                ({
                    list: Immutable.fromJS(result.data),
                    headers: result.headers
                }));
    };

    service.patch = function(id, patch) {
        let url = urlsService.resolve("epics") + `/${id}`;

        return http.patch(url, patch)
            .then(result => Immutable.fromJS(result.data));
    };

    service.post = function(params) {
        let url = urlsService.resolve("epics");

        return http.post(url, params)
            .then(result => Immutable.fromJS(result.data));
    };

    service.reorder = function(id, data, setOrders) {
        let url = urlsService.resolve("epics") + `/${id}`;

        let options = {"headers": {"set-orders": JSON.stringify(setOrders)}};

        return http.patch(url, data, null, options)
            .then(result => Immutable.fromJS(result.data));
    };

    service.addRelatedUserstory = function(epicId, userstoryId) {
        let url = urlsService.resolve("epic-related-userstories", epicId);

        let params = {
            user_story: userstoryId,
            epic: epicId
        };

        return http.post(url, params);
    };

    service.reorderRelatedUserstory = function(epicId, userstoryId, data, setOrders) {
        let url = urlsService.resolve("epic-related-userstories", epicId) + `/${userstoryId}`;

        let options = {"headers": {"set-orders": JSON.stringify(setOrders)}};

        return http.patch(url, data, null, options);
    };

    service.bulkCreateRelatedUserStories = function(epicId, projectId, bulk_userstories) {
        let url = urlsService.resolve("epic-related-userstories-bulk-create", epicId);

        let params = {
            bulk_userstories,
            project_id: projectId
        };

        return http.post(url, params);
    };

    service.deleteRelatedUserstory = function(epicId, userstoryId) {
        let url = urlsService.resolve("epic-related-userstories", epicId) + `/${userstoryId}`;

        return http.delete(url);
    };

    return () => ({"epics": service});
};
EpicsResource.$inject = ["$tgUrls", "$tgHttp"];
