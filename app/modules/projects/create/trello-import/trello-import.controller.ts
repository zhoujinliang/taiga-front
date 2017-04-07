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
 * File: trello-import.controller.coffee
 */

class TrelloImportController {
    static initClass() {
        this.$inject = [
            'tgTrelloImportService',
            '$tgConfirm',
            '$translate',
            'tgImportProjectService',
        ];
    }

    constructor(trelloImportService, confirm, translate, importProjectService) {
        this.trelloImportService = trelloImportService;
        this.confirm = confirm;
        this.translate = translate;
        this.importProjectService = importProjectService;
        this.project = null;
        taiga.defineImmutableProperty(this, 'projects', () => { return this.trelloImportService.projects; });
        taiga.defineImmutableProperty(this, 'members', () => { return this.trelloImportService.projectUsers; });
    }

    startProjectSelector() {
        return this.trelloImportService.fetchProjects().then(() => this.step = 'project-select-trello');
    }

    onSelectProject(project) {
        this.step = 'project-form-trello';
        this.project = project;
        this.fetchingUsers = true;

        return this.trelloImportService.fetchUsers(this.project.get('id')).then(() => this.fetchingUsers = false);
    }

    onSaveProjectDetails(project) {
        this.project = project;
        return this.step = 'project-members-trello';
    }

    onCancelMemberSelection() {
        return this.step = 'project-form-trello';
    }

    startImport(users) {
        let loader = this.confirm.loader(this.translate.instant('PROJECT.IMPORT.IN_PROGRESS.TITLE'), this.translate.instant('PROJECT.IMPORT.IN_PROGRESS.DESCRIPTION'), true);

        loader.start();

        let promise = this.trelloImportService.importProject(
            this.project.get('name'),
            this.project.get('description'),
            this.project.get('id'),
            users,
            this.project.get('keepExternalReference'),
            this.project.get('is_private')
        );

        return this.importProjectService.importPromise(promise).then(() => loader.stop());
    }

    submitUserSelection(users) {
        this.startImport(users);

        return null;
    }
}
TrelloImportController.initClass();

angular.module('taigaProjects').controller('TrelloImportCtrl', TrelloImportController);
