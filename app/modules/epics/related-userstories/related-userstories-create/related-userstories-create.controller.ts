/*
 * Copyright (C) 2014-2015 Taiga Agile LLC <taiga@taiga.io>
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
 * File: related-userstory-create.controller.coffee
 */

import * as angular from "angular"
import * as Immutable from "immutable"

let module = angular.module("taigaEpics");

class RelatedUserstoriesCreateController {
    currentUserService:any
    rs:any
    confirm:any
    analytics:any
    projects:any
    projectUserstories: Immutable.List<any>
    loading:boolean
    epicUserstories:any
    epic:any
    validateExistingUserstoryForm:any
    setExistingUserstoryFormErrors:any
    loadRelatedUserstories:any
    validateNewUserstoryForm:any
    setNewUserstoryFormErrors:any

    static initClass() {
        this.$inject = [
            "tgCurrentUserService",
            "tgResources",
            "$tgConfirm",
            "$tgAnalytics"
        ];
    }

    constructor(currentUserService, rs, confirm, analytics) {
        this.currentUserService = currentUserService;
        this.rs = rs;
        this.confirm = confirm;
        this.analytics = analytics;
        this.projects = this.currentUserService.projects.get("all");
        this.projectUserstories = Immutable.List();
        this.loading = false;
    }

    selectProject(selectedProjectId, onSelectedProject) {
        return this.rs.userstories.listAllInProject(selectedProjectId).then(data => {
            let excludeIds = this.epicUserstories.map(us => us.get('id'));
            let filteredData = data.filter(us => excludeIds.indexOf(us.get('id')) === -1);
            this.projectUserstories = filteredData;
            if (onSelectedProject) {
                return onSelectedProject();
            }
        });
    }

    saveRelatedUserStory(selectedUserstoryId, onSavedRelatedUserstory) {
        // This method assumes the following methods are binded to the controller:
        // - validateExistingUserstoryForm
        // - setExistingUserstoryFormErrors
        // - loadRelatedUserstories
        if (!this.validateExistingUserstoryForm()) { return; }

        this.loading = true;

        let onError = data => {
            this.loading = false;
            this.confirm.notify("error");
            return this.setExistingUserstoryFormErrors(data);
        };

        let onSuccess = () => {
            this.analytics.trackEvent("epic related user story", "create", "create related user story on epic", 1);
            this.loading = false;
            if (onSavedRelatedUserstory) {
                onSavedRelatedUserstory();
            }
            return this.loadRelatedUserstories();
        };

        let epicId = this.epic.get('id');
        return this.rs.epics.addRelatedUserstory(epicId, selectedUserstoryId).then(onSuccess, onError);
    }

    bulkCreateRelatedUserStories(selectedProjectId, userstoriesText, onCreatedRelatedUserstory) {
        // This method assumes the following methods are binded to the controller:
        // - validateNewUserstoryForm
        // - setNewUserstoryFormErrors
        // - loadRelatedUserstories
        if (!this.validateNewUserstoryForm()) { return; }

        this.loading = true;

        let onError = data => {
            this.loading = false;
            this.confirm.notify("error");
            return this.setNewUserstoryFormErrors(data);
        };

        let onSuccess = () => {
            this.analytics.trackEvent("epic related user story", "create", "create related user story on epic", 1);
            this.loading = false;
            if (onCreatedRelatedUserstory) {
                onCreatedRelatedUserstory();
            }
            return this.loadRelatedUserstories();
        };

        let epicId = this.epic.get('id');
        return this.rs.epics.bulkCreateRelatedUserStories(epicId, selectedProjectId, userstoriesText).then(onSuccess, onError);
    }
}
RelatedUserstoriesCreateController.initClass();


module.controller("RelatedUserstoriesCreateCtrl", RelatedUserstoriesCreateController);
