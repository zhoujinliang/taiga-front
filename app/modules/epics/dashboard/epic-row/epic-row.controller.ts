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

import * as angular from "angular"

export class EpicRowController {
    confirm:any
    projectService:any
    epicsService:any
    displayUserStories:boolean
    displayAssignedTo:boolean
    displayStatusList:boolean
    loadingStatus:boolean
    project:any
    epic:any
    percentage:any
    epicStories:any
    assignLoader:any

    static initClass() {
        this.$inject = [
            "$tgConfirm",
            "tgProjectService",
            "tgEpicsService"
        ];
    }

    constructor(confirm, projectService, epicsService) {
        this.confirm = confirm;
        this.projectService = projectService;
        this.epicsService = epicsService;
        this.displayUserStories = false;
        this.displayAssignedTo = false;
        this.displayStatusList = false;
        this.loadingStatus = false;

        // NOTE: We use project as no inmutable object to make
        //       the code compatible with the old code
        this.project = this.projectService.project.toJS();

        this._calculateProgressBar();
    }

    _calculateProgressBar() {
        if (this.epic.getIn(['status_extra_info', 'is_closed']) === true) {
            return this.percentage = "100%";
        } else {
            let opened = this.epic.getIn(['user_stories_counts', 'opened']);
            let closed = this.epic.getIn(['user_stories_counts', 'closed']);
            let total = opened + closed;
            if (total === 0) {
                return this.percentage = "0%";
            } else {
                return this.percentage = `${(closed * 100) / total}%`;
            }
        }
    }

    canEditEpics() {
        return this.projectService.hasPermission("modify_epic");
    }

    toggleUserStoryList() {
        if (!this.displayUserStories) {
            return this.epicsService.listRelatedUserStories(this.epic)
                .then(userStories => {
                    this.epicStories = userStories;
                    return this.displayUserStories = true;
            }).catch(() => {
                    return this.confirm.notify('error');
            });
        } else {
            return this.displayUserStories = false;
        }
    }

    updateStatus(statusId) {
        this.displayStatusList = false;
        this.loadingStatus = true;
        return this.epicsService.updateEpicStatus(this.epic, statusId)
            .catch(() => {
                return this.confirm.notify('error');
        }).finally(() => {
                return this.loadingStatus = false;
        });
    }

    updateAssignedTo(member) {
        this.assignLoader = true;
        return this.epicsService.updateEpicAssignedTo(this.epic, (member != null ? member.id : undefined) || null)
            .catch(() => {
                return this.confirm.notify('error');
        }).then(() => {
                return this.assignLoader = false;
        });
    }
}
EpicRowController.initClass();
