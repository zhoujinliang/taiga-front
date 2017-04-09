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
 * File: modules/resources/importers.coffee
 */

import * as Immutable from "immutable"

export let TrelloResource = function(urlsService, http) {
    let service:any = {};

    service.getAuthUrl = function(url) {
        url = urlsService.resolve("importers-trello-auth-url");
        return http.get(url);
    };

    service.authorize = function(verifyCode) {
        let url = urlsService.resolve("importers-trello-authorize");
        return http.post(url, {code: verifyCode});
    };

    service.listProjects = function(token) {
        let url = urlsService.resolve("importers-trello-list-projects");
        return http.post(url, {token}).then(response => Immutable.fromJS(response.data));
    };

    service.listUsers = function(token, projectId) {
        let url = urlsService.resolve("importers-trello-list-users");
        return http.post(url, {token, project: projectId}).then(response => Immutable.fromJS(response.data));
    };

    service.importProject = function(token, name, description, projectId, userBindings, keepExternalReference, isPrivate) {
        let url = urlsService.resolve("importers-trello-import-project");
        let data = {
            token,
            name,
            description,
            project: projectId,
            users_bindings: userBindings.toJS(),
            keep_external_reference: keepExternalReference,
            is_private: isPrivate,
            template: "kanban",
        };
        return http.post(url, data);
    };

    return () => ({"trelloImporter": service});
};

TrelloResource.$inject = ["$tgUrls", "$tgHttp"];

export let JiraResource = function(urlsService, http) {
    let service:any = {};

    service.getAuthUrl = function(jira_url) {
        let url = urlsService.resolve("importers-jira-auth-url") + "?url=" + jira_url;
        return http.get(url);
    };

    service.authorize = function(oauth_verifier) {
        let url = urlsService.resolve("importers-jira-authorize");
        return http.post(url, {oauth_verifier});
    };

    service.listProjects = function(jira_url, token) {
        let url = urlsService.resolve("importers-jira-list-projects");
        return http.post(url, {url: jira_url, token}).then(response => Immutable.fromJS(response.data));
    };

    service.listUsers = function(jira_url, token, projectId) {
        let url = urlsService.resolve("importers-jira-list-users");
        return http.post(url, {url: jira_url, token, project: projectId}).then(response => Immutable.fromJS(response.data));
    };

    service.importProject = function(jira_url, token, name, description, projectId, userBindings, keepExternalReference, isPrivate, projectType, importerType) {
        let url = urlsService.resolve("importers-jira-import-project");
        let projectTemplate = "kanban";
        if (projectType !== "kanban") {
            projectTemplate = "scrum";
        }

        let data = {
            url: jira_url,
            token,
            name,
            description,
            project: projectId,
            users_bindings: userBindings.toJS(),
            keep_external_reference: keepExternalReference,
            is_private: isPrivate,
            project_type: projectType,
            importer_type: importerType,
            template: projectTemplate,
        };
        return http.post(url, data);
    };

    return () => ({"jiraImporter": service});
};

JiraResource.$inject = ["$tgUrls", "$tgHttp"];

export let GithubResource = function(urlsService, http) {
    let service:any = {};

    service.getAuthUrl = function(callbackUri) {
        let url = urlsService.resolve("importers-github-auth-url") + "?uri=" + callbackUri;
        return http.get(url);
    };

    service.authorize = function(code) {
        let url = urlsService.resolve("importers-github-authorize");
        return http.post(url, {code});
    };

    service.listProjects = function(token) {
        let url = urlsService.resolve("importers-github-list-projects");
        return http.post(url, {token}).then(response => Immutable.fromJS(response.data));
    };

    service.listUsers = function(token, projectId) {
        let url = urlsService.resolve("importers-github-list-users");
        return http.post(url, {token, project: projectId}).then(response => Immutable.fromJS(response.data));
    };

    service.importProject = function(token, name, description, projectId, userBindings, keepExternalReference, isPrivate, projectType) {
        let url = urlsService.resolve("importers-github-import-project");

        let data = {
            token,
            name,
            description,
            project: projectId,
            users_bindings: userBindings.toJS(),
            keep_external_reference: keepExternalReference,
            is_private: isPrivate,
            template: projectType,
        };
        return http.post(url, data);
    };

    return () => ({"githubImporter": service});
};

GithubResource.$inject = ["$tgUrls", "$tgHttp"];

export let AsanaResource = function(urlsService, http) {
    let service:any = {};

    service.getAuthUrl = function() {
        let url = urlsService.resolve("importers-asana-auth-url");
        return http.get(url);
    };

    service.authorize = function(code) {
        let url = urlsService.resolve("importers-asana-authorize");
        return http.post(url, {code});
    };

    service.listProjects = function(token) {
        let url = urlsService.resolve("importers-asana-list-projects");
        return http.post(url, {token}).then(response => Immutable.fromJS(response.data));
    };

    service.listUsers = function(token, projectId) {
        let url = urlsService.resolve("importers-asana-list-users");
        return http.post(url, {token, project: projectId}).then(response => Immutable.fromJS(response.data));
    };

    service.importProject = function(token, name, description, projectId, userBindings, keepExternalReference, isPrivate, projectType) {
        let url = urlsService.resolve("importers-asana-import-project");

        let data = {
            token,
            name,
            description,
            project: projectId,
            users_bindings: userBindings.toJS(),
            keep_external_reference: keepExternalReference,
            is_private: isPrivate,
            template: projectType,
        };
        return http.post(url, data);
    };

    return () => ({"asanaImporter": service});
};
AsanaResource.$inject = ["$tgUrls", "$tgHttp"];
