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
 * File: jira-import.service.coffee
 */

import {Service} from "../../../../ts/classes"
import * as angular from "angular"
import * as Immutable from "immutable"

class JiraImportService extends Service {
    resources:any
    location:any
    projects:Immutable.List<any>
    projectUsers:Immutable.List<any>
    token:any
    url:any

    static initClass() {
        this.$inject = [
            'tgResources',
            '$location'
        ];
    }

    constructor(resources, location) {
        super()
        this.resources = resources;
        this.location = location;
        this.projects = Immutable.List();
        this.projectUsers = Immutable.List();
    }

    setToken(token, url) {
        this.token = token;
        return this.url = url;
    }

    fetchProjects() {
        return this.resources.jiraImporter.listProjects(this.url, this.token).then(projects => this.projects = projects);
    }

    fetchUsers(projectId) {
        return this.resources.jiraImporter.listUsers(this.url, this.token, projectId).then(users => this.projectUsers = users);
    }

    importProject(name, description, projectId, userBindings, keepExternalReference, isPrivate, projectType, importerType) {
            return this.resources.jiraImporter.importProject(this.url, this.token, name, description, projectId, userBindings, keepExternalReference, isPrivate, projectType, importerType);
        }

    getAuthUrl(url) {
        return new Promise((function(resolve, reject) {
            return this.resources.jiraImporter.getAuthUrl(url).then(response => {
                this.authUrl = response.data.url;
                return resolve(this.authUrl);
            }
            , err => {
                return reject(err.data._error_message);
            });
        }.bind(this)));
    }

    authorize(oauth_verifier) {
        return new Promise((function(resolve, reject) {
            return this.resources.jiraImporter.authorize(oauth_verifier).then((response => {
                this.token = response.data.token;
                this.url = response.data.url;
                return resolve(response.data);
            }
            ), function(error) {
                return reject(new Error(error.status));
            });
        }.bind(this)));
    }
}
JiraImportService.initClass();

angular.module("taigaProjects").service("tgJiraImportService", JiraImportService);
