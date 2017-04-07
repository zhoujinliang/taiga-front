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

let module = angular.module("taigaEpics");

class StoryRowController {
    static initClass() {
        this.$inject = [];
    }

    constructor() {
        this._calculateProgressBar();
    }

    _calculateProgressBar() {
        if (this.story.get('is_closed') === true) {
            return this.percentage = "100%";
        } else {
            let totalTasks = this.story.get('tasks').size;
            let totalTasksCompleted = this.story.get('tasks').filter(it => it.get("is_closed")).size;
            if (totalTasks === 0) {
                return this.percentage = "0%";
            } else {
                return this.percentage = `${(totalTasksCompleted * 100) / totalTasks}%`;
            }
        }
    }
}
StoryRowController.initClass();

module.controller("StoryRowCtrl", StoryRowController);
