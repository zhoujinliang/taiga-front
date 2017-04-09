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
 * File: external-apps-resource.service.coffee
 */

import * as Immutable from "immutable"

export let ExternalAppsResource = function(urlsService, http) {
    let service:any = {};

    service.getApplicationToken = function(applicationId, state) {
        let url = urlsService.resolve("applications");
        url = `${url}/${applicationId}/token?state=${state}`;
        return http.get(url).then(result => Immutable.fromJS(result.data));
    };

    service.authorizeApplicationToken = function(applicationId, state) {
        let url = urlsService.resolve("application-tokens");
        url = `${url}/authorize`;
        let data = {
            "state": state,
            "application": applicationId
        };

        return http.post(url, data).then(result => Immutable.fromJS(result.data));
    };

    return () => ({"externalapps": service});
};
ExternalAppsResource.$inject = ["$tgUrls", "$tgHttp"];
