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
 * File: filter-utils.service.coffee
 */

import {generateHash} from "../../../ts/app"
import {Service} from "../../../ts/classes"
import * as angular from "angular"
import * as _ from "lodash"

class FilterRemoteStorageService extends Service {
    q:any
    urls:any
    http:any

    static initClass() {
        this.$inject = [
            "$q",
            "$tgUrls",
            "$tgHttp"
        ];
    }

    constructor(q, urls, http) {
        super()
        this.q = q;
        this.urls = urls;
        this.http = http;
    }

    storeFilters(projectId, myFilters, filtersHashSuffix) {
        let promise;
        let deferred = this.q.defer();
        let url = this.urls.resolve("user-storage");
        let ns = `${projectId}:${filtersHashSuffix}`;
        let hash = generateHash([projectId, ns]);
        if (_.isEmpty(myFilters)) {
            promise = this.http.delete(`${url}/${hash}`, {key: hash, value:myFilters});
            promise.then(() => deferred.resolve());
            promise.then(null, () => deferred.reject());
        } else {
            promise = this.http.put(`${url}/${hash}`, {key: hash, value:myFilters});
            promise.then(data => deferred.resolve());
            promise.then(null, data => {
                let innerPromise = this.http.post(`${url}`, {key: hash, value:myFilters});
                innerPromise.then(() => deferred.resolve());
                return innerPromise.then(null, () => deferred.reject());
            });
        }
        return deferred.promise;
    }

    getFilters(projectId, filtersHashSuffix) {
        let deferred = this.q.defer();
        let url = this.urls.resolve("user-storage");
        let ns = `${projectId}:${filtersHashSuffix}`;
        let hash = generateHash([projectId, ns]);

        let promise = this.http.get(`${url}/${hash}`);
        promise.then(data => deferred.resolve(data.data.value));
        promise.then(null, data => deferred.resolve({}));

        return deferred.promise;
    }
}
FilterRemoteStorageService.initClass();

angular.module("taigaComponents").service("tgFilterRemoteStorageService", FilterRemoteStorageService);
