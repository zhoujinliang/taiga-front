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
 * File: project.controller.coffee
 */

class DuplicateProjectController {
    static initClass() {
        this.$inject = [
            "tgCurrentUserService",
            "tgProjectsService",
            "$tgLocation",
            "$tgNavUrls"
        ];
    }

    constructor(currentUserService, projectsService, location, navUrls) {
        this.currentUserService = currentUserService;
        this.projectsService = projectsService;
        this.location = location;
        this.navUrls = navUrls;
        this.user = this.currentUserService.getUser();
        this.members = Immutable.List();

        this.canCreatePublicProjects = this.currentUserService.canCreatePublicProjects();
        this.canCreatePrivateProjects = this.currentUserService.canCreatePrivateProjects();

        taiga.defineImmutableProperty(this, 'projects', () => this.currentUserService.projects.get("all"));

        this.projectForm = {
            is_private: false
        };

        if (!this.canCreatePublicProjects.valid && this.canCreatePrivateProjects.valid) {
            this.projectForm.is_private = true;
        }
    }

    refreshReferenceProject(slug) {
        return this.projectsService.getProjectBySlug(slug).then(project => {
            this.referenceProject = project;
            this.members = project.get('members').filter(it => { return it.get('id') !== this.user.get('id'); });
            this.invitedMembers = this.members.map(it => it.get('id'));
            return this.checkUsersLimit();
        });
    }

    toggleInvitedMember(member) {
        if (this.invitedMembers.includes(member)) {
            this.invitedMembers = this.invitedMembers.filter(it => it !== member);
        } else {
            this.invitedMembers = this.invitedMembers.push(member);
        }

        return this.checkUsersLimit();
    }

    checkUsersLimit() {
        this.limitMembersPrivateProject = this.currentUserService.canAddMembersPrivateProject(this.invitedMembers.size + 1);
        return this.limitMembersPublicProject = this.currentUserService.canAddMembersPublicProject(this.invitedMembers.size + 1);
    }

    submit() {
        let projectId = this.referenceProject.get('id');
        let data = this.projectForm;
        data.users = this.invitedMembers;

        this.formSubmitLoading = true;
        return this.projectsService.duplicate(projectId, data).then(newProject => {
            this.formSubmitLoading = false;
            this.location.path(this.navUrls.resolve("project", {project: newProject.data.slug}));
            return this.currentUserService.loadProjects();
        });
    }

    canCreateProject() {
        if (this.projectForm.is_private) {
            return this.canCreatePrivateProjects.valid && this.limitMembersPrivateProject.valid;
        } else {
            return this.canCreatePublicProjects.valid && this.limitMembersPublicProject.valid;
        }
    }

    isDisabled() {
        return this.formSubmitLoading || !this.canCreateProject();
    }

    onCancelForm() {
        return this.location.path(this.navUrls.resolve("create-project"));
    }
}
DuplicateProjectController.initClass();

angular.module("taigaProjects").controller("DuplicateProjectCtrl", DuplicateProjectController);
