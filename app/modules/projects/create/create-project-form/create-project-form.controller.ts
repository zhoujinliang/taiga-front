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
 * File: create-project-form.controller.coffee
 */

class CreatetProjectFormController {
    static initClass() {
        this.$inject = [
            "tgCurrentUserService",
            "tgProjectsService",
            "$projectUrl",
            "$location",
            "$tgNavUrls"
       ];
    }

    constructor(currentUserService, projectsService, projectUrl, location, navUrls) {
        this.currentUserService = currentUserService;
        this.projectsService = projectsService;
        this.projectUrl = projectUrl;
        this.location = location;
        this.navUrls = navUrls;
        this.projectForm = {
            is_private: false
        };

        this.canCreatePublicProjects = this.currentUserService.canCreatePublicProjects();
        this.canCreatePrivateProjects = this.currentUserService.canCreatePrivateProjects();

        if (!this.canCreatePublicProjects.valid && this.canCreatePrivateProjects.valid) {
            this.projectForm.is_private = true;
        }

        if (this.type === 'scrum') {
            this.projectForm.creation_template = 1;
        } else {
            this.projectForm.creation_template = 2;
        }
    }

    submit() {
        this.formSubmitLoading = true;

        return this.projectsService.create(this.projectForm).then(project => {
            return this.location.url(this.projectUrl.get(project));
        });
    }

    onCancelForm() {
        return this.location.path(this.navUrls.resolve("create-project"));
    }

    canCreateProject() {
        if (this.projectForm.is_private) {
            return this.canCreatePrivateProjects.valid;
        } else {
            return this.canCreatePublicProjects.valid;
        }
    }

    isDisabled() {
        return this.formSubmitLoading || !this.canCreateProject();
    }
}
CreatetProjectFormController.initClass();

angular.module('taigaProjects').controller('CreateProjectFormCtrl', CreatetProjectFormController);
