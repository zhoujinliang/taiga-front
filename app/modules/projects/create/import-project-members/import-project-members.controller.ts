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
 * File: import-project-members.controller.coffee
 */

import * as angular from "angular"
import * as Immutable from "immutable"
import * as _ from "lodash"

class ImportProjectMembersController {
    currentUserService:any
    userService:any
    selectImportUserLightbox:boolean
    warningImportUsers:boolean
    displayEmailSelector:boolean
    cancelledUsers: Immutable.List<any>;
    selectedUsers: Immutable.List<any>;
    selectableUsers: Immutable.List<any>;
    userContacts: Immutable.List<any>;
    currentUser:any
    searchingUser:any
    members:any
    onSubmit:any
    limitMembersPrivateProject:any
    limitMembersPublicProject:any
    importMoreUsersDisabled:any
    project:any

    static initClass() {
        this.$inject = [
            'tgCurrentUserService',
            'tgUserService'
        ];
    }

    constructor(currentUserService, userService) {
        this.currentUserService = currentUserService;
        this.userService = userService;
        this.selectImportUserLightbox = false;
        this.warningImportUsers = false;
        this.displayEmailSelector = true;
        this.cancelledUsers = Immutable.List();
        this.selectedUsers = Immutable.List();
        this.selectableUsers = Immutable.List();
        this.userContacts = Immutable.List();
    }

    fetchUser() {
        this.currentUser = this.currentUserService.getUser();

        return this.userService.getContacts(this.currentUser.get('id')).then(userContacts => {
            this.userContacts = userContacts;
            return this.refreshSelectableUsers();
        });
    }

    searchUser(user) {
        this.selectImportUserLightbox = true;
        return this.searchingUser = user;
    }

    beforeSubmitUsers() {
        if (this.selectedUsers.size !== this.members.size) {
            return this.warningImportUsers = true;
        } else {
            return this.submit();
        }
    }

    confirmUser(externalUser, taigaUser) {
        this.selectImportUserLightbox = false;

        let user = Immutable.Map();
        user = user.set('user', externalUser);
        user = user.set('taigaUser', taigaUser);

        this.selectedUsers = this.selectedUsers.push(user);

        this.discardSuggestedUser(externalUser);

        return this.refreshSelectableUsers();
    }

    unselectUser(user) {
        let index = this.selectedUsers.findIndex(it => it.getIn(['user', 'id']) === user.get('id'));

        this.selectedUsers = this.selectedUsers.delete(index);
        return this.refreshSelectableUsers();
    }

    discardSuggestedUser(member) {
        return this.cancelledUsers = this.cancelledUsers.push(member.get('id'));
    }

    getSelectedMember(member) {
        return this.selectedUsers.find(it => it.getIn(['user', 'id']) === member.get('id'));
    }

    isMemberSelected(member) {
        return !!this.getSelectedMember(member);
    }

    getUser(user) {
        let userSelected = this.getSelectedMember(user);

        if (userSelected) {
            return userSelected.get('taigaUser');
        } else {
            return null;
        }
    }

    submit() {
        this.warningImportUsers = false;

        let users = Immutable.Map();

        this.selectedUsers.map(function(it) {
            let id = '';

            if (_.isString(it.get('taigaUser'))) {
                id = it.get('taigaUser');
            } else {
                id = it.getIn(['taigaUser', 'id']);
            }

            return users = users.set(it.getIn(['user', 'id']), id);
        });

        return this.onSubmit({users});
    }

    checkUsersLimit() {
        this.limitMembersPrivateProject = this.currentUserService.canAddMembersPrivateProject(this.members.size + 1);
        return this.limitMembersPublicProject = this.currentUserService.canAddMembersPublicProject(this.members.size + 1);
    }

    showSuggestedMatch(member) {
        return member.get('user') && (this.cancelledUsers.indexOf(member.get('id')) === -1) && !this.isMemberSelected(member);
    }

    getDistinctSelectedTaigaUsers() {
        let ids = [];

        let users = this.selectedUsers.filter(function(it) {
            let id = it.getIn(['taigaUser', 'id']);

            if (ids.indexOf(id) === -1) {
                ids.push(id);
                return true;
            }

            return false;
        });

        return users.filter(it => {
            return it.getIn(['taigaUser', 'id']) !== this.currentUser.get('id');
        });
    }

    refreshSelectableUsers() {
        this.importMoreUsersDisabled = this.isImportMoreUsersDisabled();

        if (this.importMoreUsersDisabled) {
            let users = this.getDistinctSelectedTaigaUsers();

            this.selectableUsers = <Immutable.List<any>>users.map(it => it.get('taigaUser'));
            this.displayEmailSelector = false;
        } else {
            this.selectableUsers = this.userContacts;
            this.displayEmailSelector = true;
        }

        return this.selectableUsers = this.selectableUsers.push(this.currentUser);
    }

    isImportMoreUsersDisabled() {
        let users = this.getDistinctSelectedTaigaUsers();

        // currentUser + newUser = +2
        let total = users.size + 2;


        if (this.project.get('is_private')) {
            return !this.currentUserService.canAddMembersPrivateProject(total).valid;
        } else {
            return !this.currentUserService.canAddMembersPublicProject(total).valid;
        }
    }
}
ImportProjectMembersController.initClass();

angular.module('taigaProjects').controller('ImportProjectMembersCtrl', ImportProjectMembersController);
