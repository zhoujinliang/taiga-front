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
 * File: suggest-add-members.controller.coffee
 */

import {isEmail} from "../../../ts/utils"
import * as angular from "angular"

class SuggestAddMembersController {
    contactQuery:any
    filteredContacts:any
    onInviteSuggested:any
    contacts:any

    static initClass() {
        this.$inject = [];
    }

    constructor() {
        this.contactQuery = "";
    }

    isEmail() {
        return isEmail(this.contactQuery);
    }

    filterContacts() {
        return this.filteredContacts = this.contacts.filter( contact => {
            return contact.get('full_name_display').toLowerCase().includes(this.contactQuery.toLowerCase()) || contact.get('username').toLowerCase().includes(this.contactQuery.toLowerCase());
        }).slice(0,12);
    }

    setInvited(contact) {
        return this.onInviteSuggested({'contact': contact});
    }
}
SuggestAddMembersController.initClass();

angular.module("taigaAdmin").controller("SuggestAddMembersCtrl", SuggestAddMembersController);
