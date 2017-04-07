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
 * File: watch-project-button.service.coffee
 */

import {Service} from "../../../../ts/classes"
import * as angular from "angular"

class WatchProjectButtonService extends Service {
    rs:any
    currentUserService:any
    projectService:any

    static initClass() {
        this.$inject = [
            "tgResources",
            "tgCurrentUserService",
            "tgProjectService"
        ];
    }

    constructor(rs, currentUserService, projectService) {
        super()
        this.rs = rs;
        this.currentUserService = currentUserService;
        this.projectService = projectService;
    }

    _getProjectIndex(projectId) {
        return this.currentUserService.projects
                .get('all')
                .findIndex(project => project.get('id') === projectId);
    }


    _updateProjects(projectId, notifyLevel, isWatcher) {
        let projectIndex = this._getProjectIndex(projectId);

        if (projectIndex === -1) { return; }

        let projects = this.currentUserService.projects
            .get('all')
            .update(projectIndex, project => {
                let totalWatchers = project.get('total_watchers');


                if (!this.projectService.project.get('is_watcher')  && isWatcher) {
                    totalWatchers++;
                } else if (this.projectService.project.get('is_watcher') && !isWatcher) {
                    totalWatchers--;
                }

                return project.merge({
                    is_watcher: isWatcher,
                    total_watchers: totalWatchers,
                    notify_level: notifyLevel
                });
        });

        return this.currentUserService.setProjects(projects);
    }

    _updateCurrentProject(notifyLevel, isWatcher) {
        let totalWatchers = this.projectService.project.get("total_watchers");

        if (!this.projectService.project.get('is_watcher')  && isWatcher) {
            totalWatchers++;
        } else if (this.projectService.project.get('is_watcher') && !isWatcher) {
            totalWatchers--;
        }

        let project = this.projectService.project.merge({
            is_watcher: isWatcher,
            notify_level: notifyLevel,
            total_watchers: totalWatchers
        });

        return this.projectService.setProject(project);
    }

    watch(projectId, notifyLevel) {
        return this.rs.projects.watchProject(projectId, notifyLevel).then(() => {
            this._updateProjects(projectId, notifyLevel, true);
            return this._updateCurrentProject(notifyLevel, true);
        });
    }

    unwatch(projectId) {
        return this.rs.projects.unwatchProject(projectId).then(() => {
            this._updateProjects(projectId, null, false);
            return this._updateCurrentProject(null, false);
        });
    }
}
WatchProjectButtonService.initClass();

angular.module("taigaProjects").service("tgWatchProjectButtonService", WatchProjectButtonService);
