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
 * File: modules/resources/history.coffee
 */


import * as angular from "angular"

let resourceProvider = function($repo, $http, $urls) {
    let service:any = {};

    service.get = (type, objectId) => $repo.queryOneRaw(`history/${type}`, objectId);

    service.editComment = function(type, objectId, activityId, comment) {
        let url = $urls.resolve(`history/${type}`);
        url = `${url}/${objectId}/edit_comment`;
        let params = {
            id: activityId
        };
        let commentData = {
            comment
        };
        return $http.post(url, commentData, params).then(data => {
            return data.data;
        });
    };

    service.getCommentHistory = function(type, objectId, activityId) {
        let url = $urls.resolve(`history/${type}`);
        url = `${url}/${objectId}/comment_versions`;
        let params = {id: activityId};
        return $http.get(url, params).then(data => {
            return data.data;
        });
    };

    service.deleteComment = function(type, objectId, activityId) {
        let url = $urls.resolve(`history/${type}`);
        url = `${url}/${objectId}/delete_comment`;
        let params = {id: activityId};
        return $http.post(url, null, params).then(data => {
            return data.data;
        });
    };

    service.undeleteComment = function(type, objectId, activityId) {
        let url = $urls.resolve(`history/${type}`);
        url = `${url}/${objectId}/undelete_comment`;
        let params = {id: activityId};
        return $http.post(url, null, params).then(data => {
            return data.data;
        });
    };

    return instance => instance.history = service;
};


let module = angular.module("taigaResources");
module.factory("$tgHistoryResourcesProvider", ["$tgRepo", "$tgHttp", "$tgUrls", resourceProvider]);
