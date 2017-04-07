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


let { taiga } = this;
let { sizeFormat } = this.taiga;


let resourceProvider = function($config, $repo, $http, $urls, $q) {
    let service = {};

    service.changeAvatar = function(file) {
        let maxFileSize = $config.get("maxUploadFileSize", null);
        if (maxFileSize && (file.size > maxFileSize)) {
            let response = {
                status: 413,
                data: { _error_message: `'${file.name}' (${sizeFormat(file.size)}) is too heavy for our oompa \
loompas, try it with a smaller than (${sizeFormat(maxFileSize)})`
            }
            };
            let defered = $q.defer();
            defered.reject(response);
            return defered.promise;
        }

        let data = new FormData();
        data.append('avatar', file);
        let options = {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        };
        let url = `${$urls.resolve("users")}/change_avatar`;
        return $http.post(url, data, {}, options);
    };

    service.removeAvatar = function() {
        let url = `${$urls.resolve("users")}/remove_avatar`;
        return $http.post(url);
    };

    service.changePassword = function(currentPassword, newPassword) {
        let url = `${$urls.resolve("users")}/change_password`;
        let data = {
            current_password: currentPassword,
            password: newPassword
        };
        return $http.post(url, data);
    };

    return instance => instance.userSettings = service;
};


let module = angular.module("taigaResources");
module.factory("$tgUserSettingsResourcesProvider", ["$tgConfig", "$tgRepo", "$tgHttp", "$tgUrls", "$q",
                                                    resourceProvider]);
