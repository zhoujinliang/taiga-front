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
 * File: userstories-resource.service.coffee
 */

import * as angular from "angular"
import * as Immutable from "immutable"

let Resource = function(urlsService, http) {
    let service:any = {};

    service.listInAllProjects = function(params) {
        let url = urlsService.resolve("userstories");

        let httpOptions = {
            headers: {
                "x-disable-pagination": "1"
            }
        };

        return http.get(url, params, httpOptions)
            .then(result => Immutable.fromJS(result.data));
    };

    service.listAllInProject = function(projectId) {
        let url = urlsService.resolve("userstories");

        let httpOptions = {
            headers: {
                "x-disable-pagination": "1"
            }
        };

        let params = {
            project: projectId
        };

        return http.get(url, params, httpOptions)
            .then(result => Immutable.fromJS(result.data));
    };

    service.listInEpic = function(epicIid) {
        let url = urlsService.resolve("userstories");

        let httpOptions = {
            headers: {
                "x-disable-pagination": "1"
            }
        };

        let params = {
            epic: epicIid,
            order_by: 'epic_order',
            include_tasks: true
        };

        return http.get(url, params, httpOptions)
            .then(result => Immutable.fromJS(result.data));
    };

    return () => ({"userstories": service});
};

Resource.$inject = ["$tgUrls", "$tgHttp"];

let module = angular.module("taigaResources2");
module.factory("tgUserstoriesResource", Resource);
