/*
 * Copyright (C) 2014-2017 Andrey Antukh <niwi@niwi.nz>
 * Copyright (C) 2014-2017 Jesús Espino Garcia <jespinog@gmail.com>
 * Copyright (C) 2014-2017 David Barragán Merino <bameda@dbarragan.com>
 * Copyright (C) 2014-2017 Alejandro Alonso <alejandro.alonso@kaleidos.net>
 * Copyright (C) 2014-2017 Juan Francisco Alcántara <juanfran.alcantara@kaleidos.net>
 * Copyright (C) 2014-2017 Xavi Julian <xavier.julian@kaleidos.net>
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
 * File: attachments-resource.service.coffee
 */

import {sizeFormat} from "../../ts/utils"
import * as angular from "angular"
import * as Immutable from "immutable"

let Resource = function(urlsService, http, config, $rootScope, $q, storage) {
    let service:any = {};

    service.list = function(type, objectId, projectId) {
        let urlname = `attachments/${type}`;

        let params = {object_id: objectId, project: projectId};
        let httpOptions = {
            headers: {
                "x-disable-pagination": "1"
            }
        };

        let url = urlsService.resolve(urlname);

        return http.get(url, params, httpOptions)
            .then(result => Immutable.fromJS(result.data));
    };

    service.delete = function(type, id) {
        let urlname = `attachments/${type}`;

        let url = urlsService.resolve(urlname) + `/${id}`;

        return http.delete(url);
    };

    service.patch = function(type, id, patch) {
        let urlname = `attachments/${type}`;

        let url = urlsService.resolve(urlname) + `/${id}`;

        return http.patch(url, patch);
    };

    service.create = function(type, projectId, objectId, file, from_comment) {
        let response;
        let urlname = `attachments/${type}`;

        let url = urlsService.resolve(urlname);

        let defered = $q.defer();

        if (file === undefined) {
            defered.reject(null);
            return defered.promise;
        }

        let maxFileSize = config.get("maxUploadFileSize", null);

        if (maxFileSize && (file.size > maxFileSize)) {
            response = {
                status: 413,
                data: { _error_message: `'${file.name}' (${sizeFormat(file.size)}) is too heavy for our oompa \
loompas, try it with a smaller than (${sizeFormat(maxFileSize)})`
            }
            };
            defered.reject(response);
            return defered.promise;
        }

        let uploadProgress = evt => {
            return $rootScope.$apply(() => {
                file.status = "in-progress";
                file.size = sizeFormat(evt.total);
                file.progressMessage = `upload ${sizeFormat(evt.loaded)} of ${sizeFormat(evt.total)}`;
                return file.progressPercent = `${Math.round((evt.loaded / evt.total) * 100)}%`;
            });
        };

        let uploadComplete = evt => {
            return $rootScope.$apply(function() {
                let attachment;
                file.status = "done";

                let { status } = evt.target;
                try {
                    attachment = JSON.parse(evt.target.responseText);
                } catch (error) {
                    attachment = {};
                }

                if ((status >= 200) && (status < 400)) {
                    attachment = Immutable.fromJS(attachment);
                    return defered.resolve(attachment);
                } else {
                    response = {
                        status,
                        data: {_error_message: (data['attached_file'] != null ? data['attached_file'][0] : undefined)}
                    };
                    return defered.reject(response);
                }
            });
        };

        let uploadFailed = evt => {
            return $rootScope.$apply(function() {
                file.status = "error";
                return defered.reject("fail");
            });
        };

        var data = new FormData();
        data.append("project", projectId);
        data.append("object_id", objectId);
        data.append("attached_file", file);
        data.append("from_comment", from_comment);

        let xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);

        let token = storage.get('token');

        xhr.open("POST", url);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send(data);

        return defered.promise;
    };

    return () => ({"attachments": service});
};

Resource.$inject = [
    "$tgUrls",
    "$tgHttp",
    "$tgConfig",
    "$rootScope",
    "$q",
    "$tgStorage"
];

let module = angular.module("taigaResources2");
module.factory("tgAttachmentsResource", Resource);
