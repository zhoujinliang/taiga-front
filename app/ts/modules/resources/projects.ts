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
 * File: modules/resources/projects.coffee
 */


import {sizeFormat} from "../../utils"
import * as angular from "angular"

let resourceProvider = function($config, $repo, $http, $urls, $auth, $q, $translate) {
    let service:any = {};

    service.get = projectId => $repo.queryOne("projects", projectId);

    service.getBySlug = projectSlug => $repo.queryOne("projects", `by_slug?slug=${projectSlug}`);

    service.list = () => $repo.queryMany("projects");

    service.listByMember = function(memberId) {
        let params = {"member": memberId, "order_by": "user_order"};
        return $repo.queryMany("projects", params);
    };

    service.templates = () => $repo.queryMany("project-templates");

    service.usersList = function(projectId) {
        let params = {"project": projectId};
        return $repo.queryMany("users", params);
    };

    service.rolesList = function(projectId) {
        let params = {"project": projectId};
        return $repo.queryMany("roles", params);
    };

    service.stats = projectId => $repo.queryOneRaw("projects", `${projectId}/stats`);

    service.bulkUpdateOrder = function(bulkData) {
        let url = $urls.resolve("bulk-update-projects-order");
        return $http.post(url, bulkData);
    };

    service.regenerate_epics_csv_uuid = function(projectId) {
        let url = `${$urls.resolve("projects")}/${projectId}/regenerate_epics_csv_uuid`;
        return $http.post(url);
    };

    service.regenerate_userstories_csv_uuid = function(projectId) {
        let url = `${$urls.resolve("projects")}/${projectId}/regenerate_userstories_csv_uuid`;
        return $http.post(url);
    };

    service.regenerate_tasks_csv_uuid = function(projectId) {
        let url = `${$urls.resolve("projects")}/${projectId}/regenerate_tasks_csv_uuid`;
        return $http.post(url);
    };

    service.regenerate_issues_csv_uuid = function(projectId) {
        let url = `${$urls.resolve("projects")}/${projectId}/regenerate_issues_csv_uuid`;
        return $http.post(url);
    };

    service.leave = function(projectId) {
        let url = `${$urls.resolve("projects")}/${projectId}/leave`;
        return $http.post(url);
    };

    service.memberStats = projectId => $repo.queryOneRaw("projects", `${projectId}/member_stats`);

    service.tagsColors = projectId => $repo.queryOne("projects", `${projectId}/tags_colors`);

    service.deleteTag = function(projectId, tag) {
        let url = `${$urls.resolve("projects")}/${projectId}/delete_tag`;
        return $http.post(url, {tag});
    };

    service.createTag = function(projectId, tag, color) {
        let url = `${$urls.resolve("projects")}/${projectId}/create_tag`;
        let data = {};
        data.tag = tag;
        data.color = null;
        if (color) {
            data.color = color;
        }
        return $http.post(url, data);
    };

    service.editTag = function(projectId, from_tag, to_tag, color) {
        let url = `${$urls.resolve("projects")}/${projectId}/edit_tag`;
        let data = {};
        data.from_tag = from_tag;
        if (to_tag) {
            data.to_tag = to_tag;
        }
        data.color = null;
        if (color) {
            data.color = color;
        }
        return $http.post(url, data);
    };

    service.mixTags = function(projectId, to_tag, from_tags) {
        let url = `${$urls.resolve("projects")}/${projectId}/mix_tags`;
        return $http.post(url, {to_tag, from_tags});
    };

    service.export = function(projectId) {
        let url = `${$urls.resolve("exporter")}/${projectId}`;
        return $http.get(url);
    };

    service.import = function(file, statusUpdater) {
        let response;
        let defered = $q.defer();

        let maxFileSize = $config.get("maxUploadFileSize", null);
        if (maxFileSize && (file.size > maxFileSize)) {
            let errorMsg = $translate.instant("PROJECT.IMPORT.ERROR_MAX_SIZE_EXCEEDED", {
                fileName: file.name,
                fileSize: sizeFormat(file.size),
                maxFileSize: sizeFormat(maxFileSize)
            });

            response = {
                status: 413,
                data: { _error_message: errorMsg
            }
            };
            defered.reject(response);
            return defered.promise;
        }

        let uploadProgress = evt => {
            let percent = Math.round((evt.loaded / evt.total) * 100);
            let message = $translate.instant("PROJECT.IMPORT.UPLOAD_IN_PROGRESS_MESSAGE", {
                uploadedSize: sizeFormat(evt.loaded),
                totalSize: sizeFormat(evt.total)
            });
            return statusUpdater("in-progress", null, message, percent);
        };

        let uploadComplete = evt => {
            return statusUpdater("done",
                          $translate.instant("PROJECT.IMPORT.TITLE"),
                          $translate.instant("PROJECT.IMPORT.DESCRIPTION"));
        };

        let uploadFailed = evt => {
            return statusUpdater("error");
        };

        let complete = evt => {
            response = {};
            try {
                response.data = JSON.parse(evt.target.responseText);
            } catch (error) {
                response.data = {};
            }
            response.status = evt.target.status;
            if (evt.target.getResponseHeader('Taiga-Info-Project-Is-Private')) {
                response.headers = {
                    isPrivate: evt.target.getResponseHeader('Taiga-Info-Project-Is-Private') === 'True',
                    memberships: parseInt(evt.target.getResponseHeader('Taiga-Info-Project-Memberships'))
                };
            }
            if ([201, 202].includes(response.status)) { defered.resolve(response); }
            return defered.reject(response);
        };

        let failed = evt => {
            return defered.reject("fail");
        };

        let data = new FormData();
        data.append('dump', file);

        let xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.upload.addEventListener("load", uploadComplete, false);
        xhr.upload.addEventListener("error", uploadFailed, false);
        xhr.upload.addEventListener("abort", uploadFailed, false);
        xhr.addEventListener("load", complete, false);
        xhr.addEventListener("error", failed, false);

        xhr.open("POST", $urls.resolve("importer"));
        xhr.setRequestHeader("Authorization", `Bearer ${$auth.getToken()}`);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send(data);

        return defered.promise;
    };

    service.changeLogo = function(projectId, file) {
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
        data.append('logo', file);
        let options = {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        };
        let url = `${$urls.resolve("projects")}/${projectId}/change_logo`;
        return $http.post(url, data, {}, options);
    };

    service.removeLogo = function(projectId) {
        let url = `${$urls.resolve("projects")}/${projectId}/remove_logo`;
        return $http.post(url);
    };

    return instance => instance.projects = service;
};


let module = angular.module("taigaResources");
module.factory("$tgProjectsResourcesProvider", ["$tgConfig", "$tgRepo", "$tgHttp", "$tgUrls", "$tgAuth",
                                                "$q", "$translate", resourceProvider]);
