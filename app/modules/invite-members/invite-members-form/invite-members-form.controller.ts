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
 * File: add-members.controller.coffee
 */

import * as angular from "angular"
import * as _ from "lodash"

class InviteMembersFormController {
    projectService:any
    rs:any
    lightboxService:any
    confirm:any
    rootScope: angular.IScope
    project:any
    roles:any
    rolesValues:any
    loading:boolean
    defaultMaxInvites:any
    contactsToInvite:any
    emailsToInvite:any
    membersLimit:any
    showWarningMessage:boolean
    setInvitedContacts:any
    inviteContactsMessage:any

    static initClass() {
        this.$inject = [
            "tgProjectService",
            "$tgResources",
            "lightboxService",
            "$tgConfirm",
            "$rootScope"
        ];
    }

    constructor(projectService, rs, lightboxService, confirm, rootScope) {
        this.projectService = projectService;
        this.rs = rs;
        this.lightboxService = lightboxService;
        this.confirm = confirm;
        this.rootScope = rootScope;
        this.project = this.projectService.project;
        this.roles = this.projectService.project.get('roles');
        this.rolesValues = {};
        this.loading = false;
        this.defaultMaxInvites = 4;
    }

    _areRolesValidated() {
        return Object.defineProperty(this, 'areRolesValidated', {
            get: () => {
                let roleIds = _.filter(Object.values(this.rolesValues), it => it);
                return roleIds.length === (this.contactsToInvite.size + this.emailsToInvite.size);
            }
        });
    }

    _checkLimitMemberships() {
        if (this.project.get('max_memberships') === null) {
            this.membersLimit = this.defaultMaxInvites;
        } else {
            let pendingMembersCount = Math.max(this.project.get('max_memberships') - this.project.get('total_memberships'), 0);
            this.membersLimit = Math.min(pendingMembersCount, this.defaultMaxInvites);
        }

        return this.showWarningMessage = this.membersLimit < this.defaultMaxInvites;
    }

    sendInvites() {
        this.setInvitedContacts = [];
        _.forEach(this.rolesValues, (key, value) => {
            return this.setInvitedContacts.push({
                'role_id': key,
                'username': value
            });
        });
        this.loading = true;
        return this.rs.memberships.bulkCreateMemberships(
            this.project.get('id'),
            this.setInvitedContacts,
            this.inviteContactsMessage
        )
            .then(response => { // On success
                return this.projectService.fetchProject().then(() => {
                    this.loading = false;
                    this.lightboxService.closeAll();
                    this.rootScope.$broadcast("membersform:new:success");
                    return this.confirm.notify('success');
                });
        }).catch(response => { // On error
                this.loading = false;
                if (response.data._error_message) {
                    return this.confirm.notify("error", response.data._error_message);
                }
        });
    }
}
InviteMembersFormController.initClass();


angular.module("taigaAdmin").controller("InviteMembersFormCtrl", InviteMembersFormController);
