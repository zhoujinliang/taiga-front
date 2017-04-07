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
 * File: projects.service.coffee
 */

let { taiga } = this;
let { groupBy } = this.taiga;


class ProjectsService extends taiga.Service {
    static initClass() {
        this.$inject = ["tgResources", "$projectUrl"];
    }

    constructor(rs, projectUrl) {
        this.rs = rs;
        this.projectUrl = projectUrl;
    }

    create(data) {
        return this.rs.projects.create(data);
    }

    duplicate(projectId, data) {
        return this.rs.projects.duplicate(projectId, data);
    }

    getProjectBySlug(projectSlug) {
        return this.rs.projects.getProjectBySlug(projectSlug)
            .then(project => {
                return this._decorate(project);
        });
    }

    getProjectStats(projectId) {
        return this.rs.projects.getProjectStats(projectId);
    }

    getProjectsByUserId(userId, paginate) {
        return this.rs.projects.getProjectsByUserId(userId, paginate)
            .then(projects => {
                return projects.map(this._decorate.bind(this));
        });
    }

    _decorate(project) {
        let url = this.projectUrl.get(project.toJS());

        project = project.set("url", url);

        return project;
    }

    bulkUpdateProjectsOrder(sortData) {
        return this.rs.projects.bulkUpdateOrder(sortData);
    }

    transferValidateToken(projectId, token) {
        return this.rs.projects.transferValidateToken(projectId, token);
    }

    transferAccept(projectId, token, reason) {
        return this.rs.projects.transferAccept(projectId, token, reason);
    }

    transferReject(projectId, token, reason) {
        return this.rs.projects.transferReject(projectId, token, reason);
    }
}
ProjectsService.initClass();


angular.module("taigaProjects").service("tgProjectsService", ProjectsService);
