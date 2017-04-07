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
 * File: modules/resources/epics.coffee
 */


let { taiga } = this;

let { generateHash } = taiga;


let resourceProvider = function($repo, $http, $urls, $storage) {
    let service = {};
    let hashSuffix = "epics-queryparams";

    service.getByRef = function(projectId, ref) {
        let params = service.getQueryParams(projectId);
        params.project = projectId;
        params.ref = ref;
        return $repo.queryOne("epics", "by_ref", params);
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

    service.upvote = function(epicId) {
        let url = $urls.resolve("epic-upvote", epicId);
        return $http.post(url);
    };

    service.downvote = function(epicId) {
        let url = $urls.resolve("epic-downvote", epicId);
        return $http.post(url);
    };

    service.watch = function(epicId) {
        let url = $urls.resolve("epic-watch", epicId);
        return $http.post(url);
    };

    service.unwatch = function(epicId) {
        let url = $urls.resolve("epic-unwatch", epicId);
        return $http.post(url);
    };

    return instance => instance.epics = service;
};


let module = angular.module("taigaResources");
module.factory("$tgEpicsResourcesProvider", ["$tgRepo","$tgHttp", "$tgUrls", "$tgStorage", resourceProvider]);
