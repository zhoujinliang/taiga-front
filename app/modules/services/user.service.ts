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
 * File: user.service.coffee
 */

import {bindMethods} from "../../ts/utils"
import {Service} from "../../ts/classes"
import * as angular from "angular"

class UserService extends Service {
    rs:any

    static initClass() {
        this.$inject = ["tgResources"];
    }

    constructor(rs) {
        super()
        this.rs = rs;
        bindMethods(this);
    }

    getUserByUserName(username) {
        return this.rs.users.getUserByUsername(username);
    }

    getContacts(userId, excludeProjectId) {
        return this.rs.users.getContacts(userId, excludeProjectId);
    }

    getLiked(userId, pageNumber, objectType, textQuery) {
        return this.rs.users.getLiked(userId, pageNumber, objectType, textQuery);
    }

    getVoted(userId, pageNumber, objectType, textQuery) {
        return this.rs.users.getVoted(userId, pageNumber, objectType, textQuery);
    }

    getWatched(userId, pageNumber, objectType, textQuery) {
        return this.rs.users.getWatched(userId, pageNumber, objectType, textQuery);
    }

    getStats(userId) {
        return this.rs.users.getStats(userId);
    }

    attachUserContactsToProjects(userId, projects) {
        return this.getContacts(userId)
            .then(function(contacts) {
                projects = projects.map(function(project) {
                    let contactsFiltered = contacts.filter(function(contact) {
                        let contactId = contact.get("id");
                        return project.get('members').indexOf(contactId) !== -1;
                    });

                    project = project.set("contacts", contactsFiltered);

                    return project;
                });

                return projects;
        });
    }
}
UserService.initClass();

angular.module("taigaCommon").service("tgUserService", UserService);
