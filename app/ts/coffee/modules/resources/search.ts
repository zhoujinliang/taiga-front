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
 * File: modules/resources/search.coffee
 */


let { taiga } = this;

let resourceProvider = function($repo, $urls, $http, $q) {
    let service = {};

    service.do = function(projectId, term) {
        let deferredAbort = $q.defer();

        let url = $urls.resolve("search");
        let params = {
            url,
            method: "GET",
            timeout: deferredAbort.promise,
            cancelable: true,
            params: {
                project: projectId,
                text: term,
                get_all: false,
            }
        };

        let request = $http.request(params).then(data => data.data);

        request.abort = () => deferredAbort.resolve();

        request.finally = function() {
            request.abort = angular.noop;
            return deferredAbort = (request = null);
        };

        return request;
    };

    return instance => instance.search = service;
};

let module = angular.module("taigaResources");
module.factory("$tgSearchResourcesProvider", ["$tgRepo", "$tgUrls", "$tgHttp", "$q", resourceProvider]);
