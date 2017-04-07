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
 * File: transfer-project.directive.coffee
 */

let module = angular.module('taigaProjects');

class TransferProject {
    static initClass() {
        this.$inject = [
            "$routeParams",
            "tgProjectsService",
            "$location",
            "$tgAuth",
            "tgCurrentUserService",
            "$tgNavUrls",
            "$translate",
            "$tgConfirm",
            "tgErrorHandlingService"
        ];
    }

    constructor(routeParams, projectService, location, authService, currentUserService, navUrls, translate, confirmService, errorHandlingService) {
        this.routeParams = routeParams;
        this.projectService = projectService;
        this.location = location;
        this.authService = authService;
        this.currentUserService = currentUserService;
        this.navUrls = navUrls;
        this.translate = translate;
        this.confirmService = confirmService;
        this.errorHandlingService = errorHandlingService;
    }

    initialize() {
        this.projectId = this.project.get("id");
        this.token = this.routeParams.token;
        this.showAddComment = false;
        return this._refreshUserData();
    }

    _validateToken() {
        return this.projectService.transferValidateToken(this.projectId, this.token).then(null, (data, status) => {
            return this.errorHandlingService.notfound();
        });
    }

    _refreshUserData() {
        return this.authService.refresh().then(() => {
            this._validateToken();
            this._setProjectData();
            return this._checkOwnerData();
        });
    }

    _setProjectData() {
        return this.canBeOwnedByUser = this.currentUserService.canOwnProject(this.project);
    }

    _checkOwnerData() {
        let maxMemberships;
        let currentUser = this.currentUserService.getUser();
        if(this.project.get('is_private')) {
            this.ownerMessage = 'ADMIN.PROJECT_TRANSFER.OWNER_MESSAGE.PRIVATE';
            this.maxProjects = currentUser.get('max_private_projects');
            if (this.maxProjects === null) {
                this.maxProjects = this.translate.instant('ADMIN.PROJECT_TRANSFER.UNLIMITED_PROJECTS');
            }
            this.currentProjects = currentUser.get('total_private_projects');
            maxMemberships = currentUser.get('max_memberships_private_projects');

        } else {
            this.ownerMessage = 'ADMIN.PROJECT_TRANSFER.OWNER_MESSAGE.PUBLIC';
            this.maxProjects = currentUser.get('max_public_projects');
            if (this.maxProjects === null) {
                this.maxProjects = this.translate.instant('ADMIN.PROJECT_TRANSFER.UNLIMITED_PROJECTS');
            }
            this.currentProjects = currentUser.get('total_public_projects');
            maxMemberships = currentUser.get('max_memberships_public_projects');
        }

        return this.validNumberOfMemberships = (maxMemberships === null) || (this.project.get('total_memberships') <= maxMemberships);
    }

    transferAccept(token, reason) {
        this.loadingAccept = true;
        return this.projectService.transferAccept(this.project.get("id"), token, reason).then(() => {
            let newUrl = this.navUrls.resolve("project-admin-project-profile-details", {
                project: this.project.get("slug")
            });
            this.loadingAccept = false;
            this.location.path(newUrl);

            this.confirmService.notify("success", this.translate.instant("ADMIN.PROJECT_TRANSFER.ACCEPTED_PROJECT_OWNERNSHIP"), '', 5000);
        });
    }

    transferReject(token, reason) {
        this.loadingReject = true;
        return this.projectService.transferReject(this.project.get("id"), token, reason).then(() => {
            let newUrl = this.navUrls.resolve("home", {
                project: this.project.get("slug")
            });
            this.loadingReject = false;
            this.location.path(newUrl);
            this.confirmService.notify("success", this.translate.instant("ADMIN.PROJECT_TRANSFER.REJECTED_PROJECT_OWNERNSHIP"), '', 5000);

        });
    }

    addComment() {
        return this.showAddComment = true;
    }

    hideComment() {
        this.showAddComment = false;
        return this.reason = '';
    }
}
TransferProject.initClass();


module.controller("TransferProjectController", TransferProject);
