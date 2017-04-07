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
 * File: import-project.controller.coffee
 */

class ImportProjectController {
    static initClass() {
        this.$inject = [
            'tgTrelloImportService',
            'tgJiraImportService',
            'tgGithubImportService',
            'tgAsanaImportService',
            '$location',
            '$window',
            '$routeParams',
            '$tgNavUrls',
            '$tgConfig',
            '$tgConfirm',
        ];
    }

    constructor(trelloService, jiraService, githubService, asanaService, location, window, routeParams, tgNavUrls, config, confirm) {
        this.trelloService = trelloService;
        this.jiraService = jiraService;
        this.githubService = githubService;
        this.asanaService = asanaService;
        this.location = location;
        this.window = window;
        this.routeParams = routeParams;
        this.tgNavUrls = tgNavUrls;
        this.config = config;
        this.confirm = confirm;
    }

    start() {
        this.token = null;
        this.from = this.routeParams.platform;

        let locationSearch = this.location.search();

        if (this.from === "asana") {
            let asanaOauthToken = locationSearch.code;
            if (locationSearch.code) {
                asanaOauthToken = locationSearch.code;

                return this.asanaService.authorize(asanaOauthToken).then((token => {
                    return this.location.search({token: encodeURIComponent(JSON.stringify(token))});
                }
                ), this.cancelCurrentImport.bind(this));
            } else {
                this.token = JSON.parse(decodeURIComponent(locationSearch.token));
                this.asanaService.setToken(this.token);
            }
        }

        if (this.from  === 'trello') {
            if (locationSearch.oauth_verifier) {
                let trelloOauthToken = locationSearch.oauth_verifier;
                return this.trelloService.authorize(trelloOauthToken).then((token => {
                    return this.location.search({token});
                }
                ), this.cancelCurrentImport.bind(this));
            } else if (locationSearch.token) {
                this.token = locationSearch.token;
                this.trelloService.setToken(locationSearch.token);
            }
        }

        if (this.from === "github") {
            if (locationSearch.code) {
                let githubOauthToken = locationSearch.code;

                return this.githubService.authorize(githubOauthToken).then((token => {
                    return this.location.search({token});
                }
                ), this.cancelCurrentImport.bind(this));
            } else if (locationSearch.token) {
                this.token = locationSearch.token;
                this.githubService.setToken(locationSearch.token);
            }
        }

        if (this.from === "jira") {
            let jiraOauthToken = locationSearch.oauth_token;

            if (jiraOauthToken) {
                let jiraOauthVerifier = locationSearch.oauth_verifier;
                return this.jiraService.authorize(jiraOauthVerifier).then((data => {
                    return this.location.search({token: data.token, url: data.url});
                }
                ), this.cancelCurrentImport.bind(this));
            } else {
                this.token = locationSearch.token;
                return this.jiraService.setToken(locationSearch.token, locationSearch.url);
            }
        }
    }

    select(from) {
        if (from === "trello") {
            return this.trelloService.getAuthUrl().then(url => {
                return this.window.open(url, "_self");
            });
        } else if (from === "jira") {
            return this.jiraService.getAuthUrl(this.jiraUrl).then(url => {
                return this.window.open(url, "_self");
            }
            , err => {
                return this.confirm.notify('error', err);
            });
        } else if (from === "github") {
            let callbackUri = this.location.absUrl() + "/github";
            return this.githubService.getAuthUrl(callbackUri).then(url => {
                return this.window.open(url, "_self");
            });
        } else if (from === "asana") {
            return this.asanaService.getAuthUrl().then(url => {
                return this.window.open(url, "_self");
            });
        } else {
            return this.from = from;
        }
    }

    unfoldOptions(options) {
        return this.unfoldedOptions = options;
    }

    isActiveImporter(importer) {
        if (this.config.get('importers').indexOf(importer) === -1) {
            return false;
        }
        return true;
    }

    cancelCurrentImport() {
        return this.location.url(this.tgNavUrls.resolve('create-project-import'));
    }

    backToCreate() {
        return this.location.url(this.tgNavUrls.resolve('create-project'));
    }
}
ImportProjectController.initClass();

angular.module("taigaProjects").controller("ImportProjectCtrl", ImportProjectController);
