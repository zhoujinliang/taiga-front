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

let { taiga } = this;

class AddMembersController {
    static initClass() {
        this.$inject = [
            "tgUserService",
            "tgCurrentUserService",
            "tgProjectService",
        ];
    }

    constructor(userService, currentUserService, projectService) {
        this.userService = userService;
        this.currentUserService = currentUserService;
        this.projectService = projectService;
        this.contactsToInvite = Immutable.List();
        this.emailsToInvite = Immutable.List();
        this.displayContactList = false;
    }

    _getContacts() {
        let userId = this.currentUserService.getUser().get("id");
        let excludeProjectId = this.projectService.project.get("id");

        return this.userService.getContacts(userId, excludeProjectId).then(contacts => {
            return this.contacts = contacts;
        });
    }

    _filterContacts(invited) {
        return this.contacts = this.contacts.filter( contact => {
            return contact.get('id') !== invited.get('id');
        });
    }

    inviteSuggested(contact) {
        this.contactsToInvite = this.contactsToInvite.push(contact);
        this._filterContacts(contact);
        return this.displayContactList = true;
    }

    removeContact(invited) {
        this.contactsToInvite = this.contactsToInvite.filter( contact => {
            return contact.get('id') !== invited.id;
        });
        invited = Immutable.fromJS(invited);
        this.contacts = this.contacts.push(invited);
        return this.testEmptyContacts();
    }

    inviteEmail(email) {
        let emailData = Immutable.Map({'email': email});
        this.emailsToInvite = this.emailsToInvite.push(emailData);
        return this.displayContactList = true;
    }

    removeEmail(invited) {
        this.emailsToInvite = this.emailsToInvite.filter( email => {
            return email.get('email') !== invited.email;
        });
        return this.testEmptyContacts();
    }

    testEmptyContacts() {
        if ((this.emailsToInvite.size + this.contactsToInvite.size) === 0) {
            return this.displayContactList = false;
        }
    }
}
AddMembersController.initClass();

angular.module("taigaAdmin").controller("AddMembersCtrl", AddMembersController);
