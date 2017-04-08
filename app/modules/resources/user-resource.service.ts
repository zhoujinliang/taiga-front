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
 * File: user-resource.service.coffee
 */

import * as angular from "angular"
import * as Immutable from "immutable"

let Resource = function(urlsService, http, paginateResponseService) {
    let service:any = {};

    service.getUserStorage = function(key) {
        let url = urlsService.resolve("user-storage");

        if (key) {
            url += `/${key}`;
        }

        let httpOptions = {};

        return http.get(url, {}).then(response => response.data.value);
    };

    service.setUserStorage = function(key, value) {
        let url = urlsService.resolve("user-storage") + '/' + key;

        let params = {
            key,
            value
        };

        return http.put(url, params);
    };

    service.createUserStorage = function(key, value) {
        let url = urlsService.resolve("user-storage");

        let params = {
            key,
            value
        };

        return http.post(url, params);
    };

    return () => ({"user": service});
};

Resource.$inject = ["$tgUrls", "$tgHttp"];

let module = angular.module("taigaResources2");
module.factory("tgUserResources", Resource);
