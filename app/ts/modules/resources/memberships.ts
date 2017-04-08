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
 * File: modules/resources/memberships.coffee
 */


import * as angular from "angular"
import * as _ from "lodash"

let resourceProvider = function($repo, $http, $urls) {
    let service:any = {};

    service.get = id => $repo.queryOne("memberships", id);

    service.list = function(projectId, filters, enablePagination) {
        let options;
        if (enablePagination == null) { enablePagination = true; }
        let params = {project: projectId};
        params = _.extend({}, params, filters || {});
        if (enablePagination) {
            return $repo.queryPaginated("memberships", params);
        }

        return $repo.queryMany("memberships", params, (options={enablePagination}));
    };

    service.listByUser = function(userId, filters) {
        let params = {user: userId};
        params = _.extend({}, params, filters || {});
        return $repo.queryPaginated("memberships", params);
    };

    service.resendInvitation = function(id) {
        let url = $urls.resolve("memberships");
        return $http.post(`${url}/${id}/resend_invitation`, {});
    };

    service.bulkCreateMemberships = function(projectId, data, invitation_extra_text) {
        let url = $urls.resolve("bulk-create-memberships");
        let params = {project_id: projectId, bulk_memberships: data, invitation_extra_text};
        return $http.post(url, params);
    };

    return instance => instance.memberships = service;
};


let module = angular.module("taigaResources");
module.factory("$tgMembershipsResourcesProvider", ["$tgRepo", "$tgHttp", "$tgUrls", resourceProvider]);
