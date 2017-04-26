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

import {generateHash} from "../../../libs/utils";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpService} from "../../../ts/modules/base/http";
import {UrlsService} from "../../../ts/modules/base/urls";
import * as _ from "lodash"
import * as Immutable from "immutable"

@Injectable()
export class FiltersRemoteStorageService {

    constructor(private urls: UrlsService, private http: HttpService) {}

    storeFilters(projectId, myFilters, filtersHashSuffix) {
        let url = this.urls.resolve("user-storage");
        let ns = `${projectId}:${filtersHashSuffix}`;
        let hash = generateHash([projectId, ns]);

        if (_.isEmpty(myFilters)) {
            return this.http.delete(`${url}/${hash}`, {key: hash, value:myFilters});
        }
        return this.http.put(`${url}/${hash}`, {key: hash, value:myFilters}).catch(() => {
            return this.http.post(`${url}`, {key: hash, value:myFilters});
        });
    }

    getFilters(projectId, filtersHashSuffix) {
        let url = this.urls.resolve("user-storage");
        let ns = `${projectId}:${filtersHashSuffix}`;
        let hash = generateHash([projectId, ns]);

        return this.http.get(`${url}/${hash}`)
                        .map((data:any) => Immutable.fromJS(data.value))
                        .catch(() => Observable.of(Immutable.Map()));
    }
}
