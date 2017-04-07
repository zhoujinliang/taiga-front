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
 * File: trello-import.service.coffee
 */

class TrelloImportService extends taiga.Service {
    static initClass() {
        this.$inject = [
            'tgResources'
        ];
    }

    constructor(resources) {
        this.resources = resources;
        this.projects = Immutable.List();
        this.projectUsers = Immutable.List();
        this.token = null;
    }

    setToken(token) {
        return this.token = token;
    }

    fetchProjects() {
        return this.resources.trelloImporter.listProjects(this.token).then(projects => this.projects = projects);
    }

    fetchUsers(projectId) {
        return this.resources.trelloImporter.listUsers(this.token, projectId).then(users => this.projectUsers = users);
    }

    importProject(name, description, projectId, userBindings, keepExternalReference, isPrivate) {
        return this.resources.trelloImporter.importProject(this.token, name, description, projectId, userBindings, keepExternalReference, isPrivate);
    }

    getAuthUrl() {
        return new Promise((function(resolve) {
            return this.resources.trelloImporter.getAuthUrl().then(response => {
                this.authUrl = response.data.url;
                return resolve(this.authUrl);
            });
        }.bind(this)));
    }

    authorize(verifyCode) {
        return new Promise((function(resolve, reject) {
            return this.resources.trelloImporter.authorize(verifyCode).then((response => {
                this.token = response.data.token;
                return resolve(this.token);
            }
            ), function(error) {
                return reject(new Error(error.status));
            });
        }.bind(this)));
    }
}
TrelloImportService.initClass();

angular.module("taigaProjects").service("tgTrelloImportService", TrelloImportService);
