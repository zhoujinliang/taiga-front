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
 * File: profile-contacts.controller.coffee
 */

class ProfileContactsController {
    static initClass() {
        this.$inject = [
            "tgUserService",
            "tgCurrentUserService"
        ];
    }

    constructor(userService, currentUserService) {
        this.userService = userService;
        this.currentUserService = currentUserService;
        this.currentUser = this.currentUserService.getUser();

        this.isCurrentUser = false;

        if (this.currentUser && (this.currentUser.get("id") === this.user.get("id"))) {
            this.isCurrentUser = true;
        }
    }

    loadContacts() {
        return this.userService.getContacts(this.user.get("id"))
            .then(contacts => {
                return this.contacts = contacts;
        });
    }
}
ProfileContactsController.initClass();

angular.module("taigaProfile")
    .controller("ProfileContacts", ProfileContactsController);
