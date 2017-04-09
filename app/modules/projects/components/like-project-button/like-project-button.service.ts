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
 * File: like-project-button.service.coffee
 */

import {Service} from "../../../../ts/classes"

export class LikeProjectButtonService extends Service {
    rs:any
    currentUserService:any
    projectService:any

    static initClass() {
        this.$inject = ["tgResources", "tgCurrentUserService", "tgProjectService"];
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

    _updateProjects(projectId, isFan) {
        let projectIndex = this._getProjectIndex(projectId);

        if (projectIndex === -1) { return; }

        let projects = this.currentUserService.projects
            .get('all')
            .update(projectIndex, function(project) {
                let totalFans = project.get("total_fans");

                if (isFan) { totalFans++; } else { totalFans--; }

                return project.merge({
                    is_fan: isFan,
                    total_fans: totalFans
                });
        });

        return this.currentUserService.setProjects(projects);
    }

    _updateCurrentProject(isFan) {
        let totalFans = this.projectService.project.get("total_fans");

        if (isFan) { totalFans++; } else { totalFans--; }

        let project = this.projectService.project.merge({
            is_fan: isFan,
            total_fans: totalFans
        });

        return this.projectService.setProject(project);
    }

    like(projectId) {
        return this.rs.projects.likeProject(projectId).then(() => {
            this._updateProjects(projectId, true);
            return this._updateCurrentProject(true);
        });
    }

    unlike(projectId) {
        return this.rs.projects.unlikeProject(projectId).then(() => {
            this._updateProjects(projectId, false);
            return this._updateCurrentProject(false);
        });
    }
}
LikeProjectButtonService.initClass();
