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
 * File: users-resource.service.coffee
 */

import * as angular from "angular"
import * as Immutable from "immutable"

let Resource = function(urlsService, http, paginateResponseService) {
    let service:any = {};

    service.getUserByUsername = function(username) {
        let url = urlsService.resolve("by_username");

        let httpOptions = {
            headers: {
                "x-disable-pagination": "1"
            }
        };

        let params = {
            username
        };

        return http.get(url, params, httpOptions)
            .then(result => Immutable.fromJS(result.data));
    };

    service.getStats = function(userId) {
        let url = urlsService.resolve("user-stats", userId);

        let httpOptions = {
            headers: {
                "x-disable-pagination": "1"
            }
        };

        return http.get(url, {}, httpOptions)
            .then(result => Immutable.fromJS(result.data));
    };

    service.getContacts = function(userId, excludeProjectId) {
        let url = urlsService.resolve("user-contacts", userId);

        let params:any = {};
        if (excludeProjectId != null) { params.exclude_project = excludeProjectId; }

        let httpOptions = {
            headers: {
                "x-disable-pagination": "1"
            }
        };

        return http.get(url, params, httpOptions)
            .then(result => Immutable.fromJS(result.data));
    };

    service.getLiked = function(userId, page, type, q) {
        let url = urlsService.resolve("user-liked", userId);

        let params:any = {};
        if (page != null) { params.page = page; }
        if (type != null) { params.type = type; }
        if (q != null) { params.q = q; }

        params.only_relevant = true;

        return http.get(url, params, {
            headers: {
                'x-lazy-pagination': true
            }
        }).then(function(result) {
            result = Immutable.fromJS(result);
            return paginateResponseService(result);
        });
    };

    service.getVoted = function(userId, page, type, q) {
        let url = urlsService.resolve("user-voted", userId);

        let params:any = {};
        if (page != null) { params.page = page; }
        if (type != null) { params.type = type; }
        if (q != null) { params.q = q; }

        return http.get(url, params, {
            headers: {
                'x-lazy-pagination': true
            }
        }).then(function(result) {
            result = Immutable.fromJS(result);
            return paginateResponseService(result);
        });
    };

    service.getWatched = function(userId, page, type, q) {
        let url = urlsService.resolve("user-watched", userId);

        let params:any = {};
        if (page != null) { params.page = page; }
        if (type != null) { params.type = type; }
        if (q != null) { params.q = q; }

        return http.get(url, params, {
            headers: {
                'x-lazy-pagination': true
            }
        }).then(function(result) {
            result = Immutable.fromJS(result);
            return paginateResponseService(result);
        });
    };

    service.getProfileTimeline = function(userId, page) {
        let params = {
            page
        };

        let url = urlsService.resolve("timeline-profile");
        url = `${url}/${userId}`;

        return http.get(url, params, {
            headers: {
                'x-lazy-pagination': true
            }
        }).then(function(result) {
            result = Immutable.fromJS(result);
            return paginateResponseService(result);
        });
    };

    service.getUserTimeline = function(userId, page) {
        let params = {
            page,
            only_relevant: true
        };

        let url = urlsService.resolve("timeline-user");
        url = `${url}/${userId}`;


        return http.get(url, params, {
            headers: {
                'x-lazy-pagination': true
            }
        }).then(function(result) {
            result = Immutable.fromJS(result);
            return paginateResponseService(result);
        });
    };

    return () => ({"users": service});
};

Resource.$inject = ["$tgUrls", "$tgHttp", "tgPaginateResponseService"];

let module = angular.module("taigaResources2");
module.factory("tgUsersResources", Resource);
