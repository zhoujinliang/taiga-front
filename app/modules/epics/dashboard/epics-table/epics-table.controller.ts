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
 * File: epics-table.controller.coffee
 */

let { taiga } = this;
let { generateHash } = this.taiga;

class EpicsTableController {
    static initClass() {
        this.$inject = [
            "$tgConfirm",
            "tgEpicsService",
            "$timeout",
            "$tgStorage",
            "tgProjectService"
        ];
    }

    constructor(confirm, epicsService, timeout, storage, projectService) {
        this.confirm = confirm;
        this.epicsService = epicsService;
        this.timeout = timeout;
        this.storage = storage;
        this.projectService = projectService;
        this.hash = generateHash([this.projectService.project.get('id'), 'epics']);
        this.displayOptions = false;
        this.displayVotes = true;
        this.column = this.storage.get(this.hash, {
            votes: true,
            name: true,
            project: true,
            sprint: true,
            assigned: true,
            status: true,
            progress: true
        });

        taiga.defineImmutableProperty(this, 'epics', () => { return this.epicsService.epics; });
        taiga.defineImmutableProperty(this, 'disabledEpicsPagination', () => { return this.epicsService._disablePagination; });
        taiga.defineImmutableProperty(this, 'loadingEpics', () => { return this.epicsService._loadingEpics; });
    }

    toggleEpicTableOptions() {
        return this.displayOptions = !this.displayOptions;
    }

    reorderEpic(epic, newIndex) {
        if (epic.get('epics_order') === newIndex) {
            return null;
        }

        return this.epicsService.reorderEpic(epic, newIndex)
            .then(null, () => { // on error
                return this.confirm.notify("error");
        });
    }

    nextPage() {
        return this.epicsService.nextPage();
    }

    hoverEpicTableOption() {
        if (this.timer) {
            return this.timeout.cancel(this.timer);
        }
    }

    hideEpicTableOption() {
        return this.timer = this.timeout((() => this.displayOptions = false), 400);
    }

    updateViewOptions() {
        return this.storage.set(this.hash, this.column);
    }
}
EpicsTableController.initClass();

angular.module("taigaEpics").controller("EpicsTableCtrl", EpicsTableController);
